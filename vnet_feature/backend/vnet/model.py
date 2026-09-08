"""
V-Net: Fully Convolutional Neural Network for Volumetric Medical Image Segmentation
Based on Milletari et al., 2016 (https://arxiv.org/abs/1606.04797)

Input:  3D CT patch, shape (B, 1, D, H, W)
Output: Per-voxel class probabilities, shape (B, num_classes, D, H, W)
"""

import torch
import torch.nn as nn


def conv3x3(in_ch, out_ch):
    return nn.Conv3d(in_ch, out_ch, kernel_size=5, padding=2)


class ResidualBlock(nn.Module):
    """A stack of Conv-BN-PReLU layers with a residual (skip) connection,
    as used in the original V-Net encoder/decoder stages."""

    def __init__(self, channels, num_convs):
        super().__init__()
        layers = []
        for _ in range(num_convs):
            layers += [
                conv3x3(channels, channels),
                nn.BatchNorm3d(channels),
                nn.PReLU(channels),
            ]
        self.block = nn.Sequential(*layers)

    def forward(self, x):
        return self.block(x) + x


class DownTransition(nn.Module):
    """Downsampling stage: strided conv halves spatial dims, doubles channels."""

    def __init__(self, in_ch, out_ch, num_convs):
        super().__init__()
        self.down_conv = nn.Conv3d(in_ch, out_ch, kernel_size=2, stride=2)
        self.bn = nn.BatchNorm3d(out_ch)
        self.act = nn.PReLU(out_ch)
        self.res_block = ResidualBlock(out_ch, num_convs)

    def forward(self, x):
        down = self.act(self.bn(self.down_conv(x)))
        out = self.res_block(down)
        return out


class UpTransition(nn.Module):
    """Upsampling stage: transposed conv doubles spatial dims, halves channels,
    then concatenates with the corresponding encoder skip connection."""

    def __init__(self, in_ch, out_ch, num_convs):
        super().__init__()
        self.up_conv = nn.ConvTranspose3d(in_ch, out_ch // 2, kernel_size=2, stride=2)
        self.bn = nn.BatchNorm3d(out_ch // 2)
        self.act = nn.PReLU(out_ch // 2)
        self.res_block = ResidualBlock(out_ch, num_convs)

    def forward(self, x, skip):
        up = self.act(self.bn(self.up_conv(x)))
        merged = torch.cat([up, skip], dim=1)
        out = self.res_block(merged)
        return out


class VNet(nn.Module):
    """
    5-level V-Net for tumor / organ segmentation from 3D CT patches.

    Args:
        in_channels:  1 for single-modality CT
        num_classes:  2 for binary (background / tumor);
                      >2 for sub-region segmentation (e.g. necrotic core / edema / enhancing)
        base_channels: number of feature maps at the first level (default 16, as in the paper)
    """

    def __init__(self, in_channels=1, num_classes=2, base_channels=16):
        super().__init__()

        # --- Input stage ---
        self.in_conv = conv3x3(in_channels, base_channels)
        self.in_bn = nn.BatchNorm3d(base_channels)
        self.in_act = nn.PReLU(base_channels)

        # --- Encoder ---
        self.down1 = DownTransition(base_channels, base_channels * 2, num_convs=2)
        self.down2 = DownTransition(base_channels * 2, base_channels * 4, num_convs=3)
        self.down3 = DownTransition(base_channels * 4, base_channels * 8, num_convs=3)
        self.down4 = DownTransition(base_channels * 8, base_channels * 16, num_convs=3)

        # --- Decoder ---
        self.up4 = UpTransition(base_channels * 16, base_channels * 16, num_convs=3)
        self.up3 = UpTransition(base_channels * 16, base_channels * 8, num_convs=3)
        self.up2 = UpTransition(base_channels * 8, base_channels * 4, num_convs=2)
        self.up1 = UpTransition(base_channels * 4, base_channels * 2, num_convs=1)

        # --- Output stage ---
        self.out_conv = nn.Conv3d(base_channels * 2, num_classes, kernel_size=1)

    def forward(self, x):
        x16 = self.in_act(self.in_bn(self.in_conv(x)))          # base_channels
        x32 = self.down1(x16)                                    # base_channels*2
        x64 = self.down2(x32)                                    # base_channels*4
        x128 = self.down3(x64)                                   # base_channels*8
        x256 = self.down4(x128)                                  # base_channels*16

        u4 = self.up4(x256, x128)
        u3 = self.up3(u4, x64)
        u2 = self.up2(u3, x32)
        u1 = self.up1(u2, x16)

        logits = self.out_conv(u1)
        return logits


class DiceLoss(nn.Module):
    """Soft Dice loss — handles the heavy foreground/background imbalance
    typical of tumor segmentation (tumor voxels are a tiny fraction of the volume)."""

    def __init__(self, smooth=1e-5):
        super().__init__()
        self.smooth = smooth

    def forward(self, logits, targets):
        # logits: (B, C, D, H, W); targets: (B, D, H, W) with class indices
        probs = torch.softmax(logits, dim=1)
        num_classes = probs.shape[1]
        targets_onehot = torch.nn.functional.one_hot(targets, num_classes)
        targets_onehot = targets_onehot.permute(0, 4, 1, 2, 3).float()

        dims = (0, 2, 3, 4)
        intersection = torch.sum(probs * targets_onehot, dims)
        union = torch.sum(probs + targets_onehot, dims)
        dice = (2.0 * intersection + self.smooth) / (union + self.smooth)
        return 1.0 - dice.mean()


class DiceCELoss(nn.Module):
    """Combined Dice + Cross-Entropy loss — the standard choice for volumetric
    tumor segmentation; CE stabilizes early training, Dice optimizes overlap."""

    def __init__(self, ce_weight=0.5):
        super().__init__()
        self.dice = DiceLoss()
        self.ce = nn.CrossEntropyLoss()
        self.ce_weight = ce_weight

    def forward(self, logits, targets):
        return self.ce_weight * self.ce(logits, targets) + (1 - self.ce_weight) * self.dice(logits, targets)


if __name__ == "__main__":
    # quick shape sanity check
    model = VNet(in_channels=1, num_classes=2, base_channels=16)
    dummy = torch.randn(1, 1, 64, 128, 128)
    out = model(dummy)
    print("Input :", dummy.shape)
    print("Output:", out.shape)  # expected (1, 2, 64, 128, 128)
