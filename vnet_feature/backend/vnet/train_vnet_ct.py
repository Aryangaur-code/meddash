"""
Training script for volumetric tumor segmentation with V-Net.

Expected data layout:
    data/
      images/patient001.nii.gz   # CT volume
      masks/patient001.nii.gz    # binary/multi-class tumor mask, same geometry

Usage:
    python train_vnet_ct.py --data_dir ./data --epochs 100 --out vnet_ct_model.pth
"""

import argparse
import os
import glob
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader

from model import VNet, DiceCELoss
from preprocess import (
    load_nifti, resample_isotropic, hu_windowing, denoise, extract_patches,
)
import SimpleITK as sitk


class CTTumorDataset(Dataset):
    """Loads CT/mask pairs, preprocesses them, and yields random 3D patches
    balanced between tumor-containing and background regions."""

    def __init__(self, data_dir, patch_size=(64, 128, 128), patches_per_volume=4):
        self.image_paths = sorted(glob.glob(os.path.join(data_dir, "images", "*.nii.gz")))
        self.mask_paths = sorted(glob.glob(os.path.join(data_dir, "masks", "*.nii.gz")))
        assert len(self.image_paths) == len(self.mask_paths), "image/mask count mismatch"
        self.patch_size = patch_size
        self.patches_per_volume = patches_per_volume

    def __len__(self):
        return len(self.image_paths) * self.patches_per_volume

    def _load_pair(self, idx):
        img = load_nifti(self.image_paths[idx])
        msk = load_nifti(self.mask_paths[idx])

        img = resample_isotropic(img, is_label=False)
        msk = resample_isotropic(msk, is_label=True)

        img_np = sitk.GetArrayFromImage(img).astype(np.float32)
        msk_np = sitk.GetArrayFromImage(msk).astype(np.int64)

        img_np = hu_windowing(img_np, window_center=40, window_width=400)
        img_np = denoise(img_np, sigma=0.5)
        return img_np, msk_np

    def __getitem__(self, idx):
        vol_idx = idx // self.patches_per_volume
        img_np, msk_np = self._load_pair(vol_idx)

        patches = extract_patches(
            img_np, msk_np, patch_size=self.patch_size,
            foreground_ratio=0.7, n_patches=1,
        )
        vol_patch, mask_patch = patches[0]

        # pad if the volume was smaller than patch_size along any axis
        pd, ph, pw = self.patch_size
        vol_patch = self._pad_to(vol_patch, (pd, ph, pw))
        mask_patch = self._pad_to(mask_patch, (pd, ph, pw))

        vol_tensor = torch.from_numpy(vol_patch).unsqueeze(0).float()   # (1, D, H, W)
        mask_tensor = torch.from_numpy(mask_patch).long()               # (D, H, W)
        return vol_tensor, mask_tensor

    @staticmethod
    def _pad_to(arr, target_shape):
        pad = [(0, max(t - s, 0)) for s, t in zip(arr.shape, target_shape)]
        arr = np.pad(arr, pad, mode="constant")
        slices = tuple(slice(0, t) for t in target_shape)
        return arr[slices]


def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on: {device}")

    dataset = CTTumorDataset(args.data_dir, patch_size=tuple(args.patch_size))
    loader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, num_workers=2)

    model = VNet(in_channels=1, num_classes=args.num_classes, base_channels=16).to(device)
    criterion = DiceCELoss(ce_weight=0.5)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", patience=5, factor=0.5)

    best_loss = float("inf")

    for epoch in range(args.epochs):
        model.train()
        running_loss = 0.0

        for vol, mask in loader:
            vol, mask = vol.to(device), mask.to(device)

            optimizer.zero_grad()
            logits = model(vol)
            loss = criterion(logits, mask)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * vol.size(0)

        epoch_loss = running_loss / len(dataset)
        scheduler.step(epoch_loss)
        print(f"Epoch {epoch + 1}/{args.epochs}  |  Dice-CE Loss: {epoch_loss:.4f}")

        if epoch_loss < best_loss:
            best_loss = epoch_loss
            torch.save(model.state_dict(), args.out)
            print(f"  -> saved checkpoint ({args.out}), loss={best_loss:.4f}")

    print("Training complete. Best loss:", best_loss)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, required=True)
    parser.add_argument("--out", type=str, default="vnet_ct_model.pth")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--batch_size", type=int, default=2)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--num_classes", type=int, default=2)
    parser.add_argument("--patch_size", type=int, nargs=3, default=[64, 128, 128])
    args = parser.parse_args()
    train(args)
