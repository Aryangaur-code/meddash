"""
End-to-end inference: CT volume -> V-Net segmentation -> post-processing
-> 3D mesh (Marching Cubes) -> tumor shape analysis -> exported .glb + metrics.json

Dependencies:
    pip install torch SimpleITK numpy scipy scikit-image trimesh --break-system-packages

Usage:
    python infer_vnet_3d.py --input scan.nii.gz --checkpoint vnet_ct_model.pth \
        --out_dir ./output/patient001
"""

import argparse
import json
import os

import numpy as np
import torch
import trimesh
from scipy import ndimage
from skimage import measure

from model import VNet
from preprocess import load_nifti, resample_isotropic, hu_windowing, denoise
import SimpleITK as sitk


# ---------------------------------------------------------------------------
# Sliding-window inference over the full volume
# ---------------------------------------------------------------------------

def sliding_window_inference(model, volume, device, patch_size=(64, 128, 128), overlap=0.5):
    """Run the model over overlapping patches and stitch results into a
    full-volume probability map (softmax-averaged in overlap regions)."""
    d, h, w = volume.shape
    pd, ph, pw = patch_size
    stride = tuple(int(p * (1 - overlap)) for p in patch_size)

    prob_sum = np.zeros((2, d, h, w), dtype=np.float32)
    count_map = np.zeros((d, h, w), dtype=np.float32)

    z_steps = list(range(0, max(d - pd, 1), stride[0])) + [max(d - pd, 0)]
    y_steps = list(range(0, max(h - ph, 1), stride[1])) + [max(h - ph, 0)]
    x_steps = list(range(0, max(w - pw, 1), stride[2])) + [max(w - pw, 0)]

    model.eval()
    with torch.no_grad():
        for z in sorted(set(z_steps)):
            for y in sorted(set(y_steps)):
                for x in sorted(set(x_steps)):
                    patch = volume[z:z + pd, y:y + ph, x:x + pw]
                    pad = [(0, pd - patch.shape[0]), (0, ph - patch.shape[1]), (0, pw - patch.shape[2])]
                    patch_padded = np.pad(patch, pad, mode="constant")

                    tensor = torch.from_numpy(patch_padded).float().unsqueeze(0).unsqueeze(0).to(device)
                    logits = model(tensor)
                    probs = torch.softmax(logits, dim=1)[0].cpu().numpy()  # (C, pd, ph, pw)

                    pz, py, px = patch.shape
                    prob_sum[:, z:z + pz, y:y + py, x:x + px] += probs[:, :pz, :py, :px]
                    count_map[z:z + pz, y:y + py, x:x + px] += 1

    count_map = np.clip(count_map, 1e-6, None)
    avg_probs = prob_sum / count_map[None, ...]
    return avg_probs  # (C, D, H, W)


# ---------------------------------------------------------------------------
# Post-processing (E/F in the pipeline list)
# ---------------------------------------------------------------------------

def postprocess_mask(prob_map: np.ndarray, threshold=0.5) -> np.ndarray:
    """Argmax/threshold -> largest connected component -> morphological cleanup."""
    tumor_prob = prob_map[1]
    binary_mask = (tumor_prob > threshold).astype(np.uint8)

    # keep only the largest connected component
    labeled, num_features = ndimage.label(binary_mask)
    if num_features > 1:
        sizes = ndimage.sum(binary_mask, labeled, range(1, num_features + 1))
        largest_label = np.argmax(sizes) + 1
        binary_mask = (labeled == largest_label).astype(np.uint8)

    # morphological closing to smooth boundary, then fill internal holes
    binary_mask = ndimage.binary_closing(binary_mask, structure=np.ones((3, 3, 3))).astype(np.uint8)
    binary_mask = ndimage.binary_fill_holes(binary_mask).astype(np.uint8)
    return binary_mask


# ---------------------------------------------------------------------------
# 3D mesh generation (Marching Cubes) — pipeline step G.29
# ---------------------------------------------------------------------------

def mask_to_mesh(mask: np.ndarray, spacing=(1.0, 1.0, 1.0)):
    """Marching Cubes surface extraction. Returns a trimesh.Trimesh object."""
    verts, faces, normals, _ = measure.marching_cubes(mask, level=0.5, spacing=spacing)
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, vertex_normals=normals)
    mesh = mesh.smoothed()  # Laplacian smoothing for a cleaner surface
    return mesh


# ---------------------------------------------------------------------------
# Shape / volumetric analysis — pipeline step G
# ---------------------------------------------------------------------------

def compute_shape_metrics(mask: np.ndarray, mesh: trimesh.Trimesh, spacing=(1.0, 1.0, 1.0)) -> dict:
    voxel_volume_mm3 = spacing[0] * spacing[1] * spacing[2]
    voxel_count = int(mask.sum())
    volume_mm3 = voxel_count * voxel_volume_mm3
    volume_cm3 = volume_mm3 / 1000.0

    surface_area_mm2 = float(mesh.area)
    mesh_volume_mm3 = float(abs(mesh.volume))

    # sphericity: ratio of the surface area of a volume-equivalent sphere
    # to the actual surface area (1.0 = perfect sphere)
    equiv_radius = (3 * mesh_volume_mm3 / (4 * np.pi)) ** (1 / 3) if mesh_volume_mm3 > 0 else 0
    equiv_sphere_area = 4 * np.pi * equiv_radius ** 2
    sphericity = equiv_sphere_area / surface_area_mm2 if surface_area_mm2 > 0 else 0.0

    # convexity: mask volume / convex-hull volume (1.0 = fully convex shape)
    convex_hull_volume = float(abs(mesh.convex_hull.volume))
    convexity = mesh_volume_mm3 / convex_hull_volume if convex_hull_volume > 0 else 0.0

    # elongation via PCA on voxel coordinates
    coords = np.argwhere(mask > 0).astype(np.float32) * np.array(spacing)
    centroid = coords.mean(axis=0)
    centered = coords - centroid
    cov = np.cov(centered.T)
    eigvals = np.sort(np.linalg.eigvalsh(cov))[::-1]
    eigvals = np.clip(eigvals, 1e-8, None)
    principal_axes_mm = 2 * np.sqrt(eigvals) * 2  # rough physical extents
    elongation = float(np.sqrt(eigvals[0] / eigvals[1])) if eigvals[1] > 0 else 1.0
    flatness = float(np.sqrt(eigvals[1] / eigvals[2])) if eigvals[2] > 0 else 1.0

    # max diameter (RECIST-style) and bounding box
    bbox_min = coords.min(axis=0)
    bbox_max = coords.max(axis=0)
    max_diameter_mm = float(np.linalg.norm(bbox_max - bbox_min))

    return {
        "volume_cm3": round(volume_cm3, 3),
        "surface_area_cm2": round(surface_area_mm2 / 100.0, 3),
        "sphericity": round(float(sphericity), 3),
        "convexity": round(float(convexity), 3),
        "elongation": round(elongation, 3),
        "flatness": round(flatness, 3),
        "max_diameter_mm": round(max_diameter_mm, 2),
        "principal_axes_mm": [round(float(v), 2) for v in principal_axes_mm],
        "centroid_mm": [round(float(v), 2) for v in centroid],
        "bounding_box_mm": {
            "min": [round(float(v), 2) for v in bbox_min],
            "max": [round(float(v), 2) for v in bbox_max],
        },
        "voxel_count": voxel_count,
    }


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run_inference(input_path, checkpoint_path, out_dir,
                   window_center=40, window_width=400, target_spacing=(1.0, 1.0, 1.0),
                   patch_size=(64, 128, 128), threshold=0.5):
    os.makedirs(out_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # --- Preprocess (A-C) ---
    image = load_nifti(input_path)
    image = resample_isotropic(image, spacing=target_spacing, is_label=False)
    volume = sitk.GetArrayFromImage(image).astype(np.float32)
    volume = hu_windowing(volume, window_center, window_width)
    volume = denoise(volume, sigma=0.5)

    # --- Load model ---
    model = VNet(in_channels=1, num_classes=2, base_channels=16).to(device)
    model.load_state_dict(torch.load(checkpoint_path, map_location=device))

    # --- Inference (sliding window over full volume) ---
    prob_map = sliding_window_inference(model, volume, device, patch_size=patch_size)

    # --- Post-processing ---
    mask = postprocess_mask(prob_map, threshold=threshold)

    if mask.sum() == 0:
        result = {"tumor_detected": False}
        with open(os.path.join(out_dir, "metrics.json"), "w") as f:
            json.dump(result, f, indent=2)
        print("No tumor region detected above threshold.")
        return result

    # --- 3D mesh + shape analysis (steps G/H) ---
    mesh = mask_to_mesh(mask, spacing=target_spacing)
    metrics = compute_shape_metrics(mask, mesh, spacing=target_spacing)
    metrics["tumor_detected"] = True
    metrics["mean_confidence"] = round(float(prob_map[1][mask > 0].mean()), 3)

    # --- Export ---
    mesh_path = os.path.join(out_dir, "tumor_mesh.glb")
    mesh.export(mesh_path)

    mask_out_path = os.path.join(out_dir, "segmentation_mask.nii.gz")
    mask_img = sitk.GetImageFromArray(mask.astype(np.uint8))
    mask_img.CopyInformation(image)
    sitk.WriteImage(mask_img, mask_out_path)

    with open(os.path.join(out_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Saved: {mesh_path}")
    print(f"Saved: {mask_out_path}")
    print(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to CT volume (.nii.gz)")
    parser.add_argument("--checkpoint", required=True, help="Path to trained V-Net .pth")
    parser.add_argument("--out_dir", required=True)
    parser.add_argument("--threshold", type=float, default=0.5)
    args = parser.parse_args()
    run_inference(args.input, args.checkpoint, args.out_dir, threshold=args.threshold)
