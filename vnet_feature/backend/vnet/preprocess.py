"""
Preprocessing pipeline for volumetric CT data, feeding the V-Net model.

Covers steps A-D from the pipeline: DICOM/NIfTI loading, HU windowing,
isotropic resampling, denoising, normalization, and patch extraction.

Dependencies: SimpleITK, numpy, scipy
    pip install SimpleITK numpy scipy --break-system-packages
"""

import numpy as np
import SimpleITK as sitk
from scipy import ndimage


# ---------------------------------------------------------------------------
# A. Loading
# ---------------------------------------------------------------------------

def load_dicom_series(dicom_dir: str) -> sitk.Image:
    """Load an entire DICOM series (folder of .dcm slices) into a single
    3D SimpleITK image, correctly ordered by slice location."""
    reader = sitk.ImageSeriesReader()
    series_ids = reader.GetGDCMSeriesIDs(dicom_dir)
    if not series_ids:
        raise ValueError(f"No DICOM series found in {dicom_dir}")
    file_names = reader.GetGDCMSeriesFileNames(dicom_dir, series_ids[0])
    reader.SetFileNames(file_names)
    return reader.Execute()


def load_nifti(path: str) -> sitk.Image:
    """Load a .nii / .nii.gz volume (common export format for CT + masks)."""
    return sitk.ReadImage(path)


# ---------------------------------------------------------------------------
# B/C. Resampling, windowing, normalization
# ---------------------------------------------------------------------------

def resample_isotropic(image: sitk.Image, spacing=(1.0, 1.0, 1.0), is_label=False) -> sitk.Image:
    """Resample to uniform voxel spacing so 1 voxel = 1 mm^3 in every axis.
    Required because raw CT slice thickness is usually >> in-plane resolution."""
    original_spacing = image.GetSpacing()
    original_size = image.GetSize()

    new_size = [
        int(round(osz * ospc / nspc))
        for osz, ospc, nspc in zip(original_size, original_spacing, spacing)
    ]

    resampler = sitk.ResampleImageFilter()
    resampler.SetOutputSpacing(spacing)
    resampler.SetSize(new_size)
    resampler.SetOutputDirection(image.GetDirection())
    resampler.SetOutputOrigin(image.GetOrigin())
    resampler.SetTransform(sitk.Transform())
    resampler.SetDefaultPixelValue(0 if is_label else -1024)  # air in HU
    resampler.SetInterpolator(sitk.sitkNearestNeighbor if is_label else sitk.sitkBSpline)
    return resampler.Execute(image)


def hu_windowing(volume: np.ndarray, window_center=40, window_width=400) -> np.ndarray:
    """Clip Hounsfield Units to a diagnostic window and rescale to [0, 1].
    Defaults (~40/400) correspond to a soft-tissue window, appropriate for
    most abdominal/liver/soft-tissue tumor work. Use ~-600/1500 for lung."""
    lower = window_center - window_width / 2
    upper = window_center + window_width / 2
    clipped = np.clip(volume, lower, upper)
    normalized = (clipped - lower) / (upper - lower)
    return normalized.astype(np.float32)


def denoise(volume: np.ndarray, sigma=0.5) -> np.ndarray:
    """Light 3D Gaussian smoothing — reduces scanner noise without eroding
    small tumor boundaries. Keep sigma small (0.3-0.7)."""
    return ndimage.gaussian_filter(volume, sigma=sigma)


def z_score_normalize(volume: np.ndarray) -> np.ndarray:
    """Optional additional normalization after windowing, useful if training
    across scans from multiple scanners/protocols."""
    mean, std = volume.mean(), volume.std() + 1e-8
    return (volume - mean) / std


# ---------------------------------------------------------------------------
# D. Patch extraction
# ---------------------------------------------------------------------------

def pad_to_multiple(volume: np.ndarray, multiple=16) -> np.ndarray:
    """V-Net's 4 downsampling stages require dims divisible by 16."""
    pad = []
    for dim in volume.shape:
        remainder = dim % multiple
        pad_amt = 0 if remainder == 0 else multiple - remainder
        pad.append((0, pad_amt))
    return np.pad(volume, pad, mode="constant", constant_values=0)


def extract_patches(volume: np.ndarray, mask: np.ndarray = None,
                     patch_size=(64, 128, 128), foreground_ratio=0.7, n_patches=8):
    """
    Sample fixed-size 3D patches for training.
    `foreground_ratio` of patches are centered near tumor voxels (from `mask`)
    to counteract the extreme background/foreground imbalance; the rest are
    sampled randomly for background diversity.
    """
    d, h, w = volume.shape
    pd, ph, pw = patch_size
    patches = []

    fg_coords = np.argwhere(mask > 0) if mask is not None else np.empty((0, 3))
    n_fg = int(n_patches * foreground_ratio) if len(fg_coords) > 0 else 0
    n_bg = n_patches - n_fg

    def crop_at(center):
        zc, yc, xc = center
        z0 = int(np.clip(zc - pd // 2, 0, max(d - pd, 0)))
        y0 = int(np.clip(yc - ph // 2, 0, max(h - ph, 0)))
        x0 = int(np.clip(xc - pw // 2, 0, max(w - pw, 0)))
        vol_patch = volume[z0:z0 + pd, y0:y0 + ph, x0:x0 + pw]
        mask_patch = mask[z0:z0 + pd, y0:y0 + ph, x0:x0 + pw] if mask is not None else None
        return vol_patch, mask_patch

    for _ in range(n_fg):
        center = fg_coords[np.random.randint(len(fg_coords))]
        patches.append(crop_at(center))

    for _ in range(n_bg):
        center = (
            np.random.randint(0, d),
            np.random.randint(0, h),
            np.random.randint(0, w),
        )
        patches.append(crop_at(center))

    return patches


# ---------------------------------------------------------------------------
# Full pipeline entry point
# ---------------------------------------------------------------------------

def preprocess_ct_volume(path: str, is_dicom_dir: bool = False,
                          window_center=40, window_width=400,
                          target_spacing=(1.0, 1.0, 1.0)) -> np.ndarray:
    """Run steps A-C on a raw CT source and return a normalized numpy volume
    ready for patch extraction / inference."""
    image = load_dicom_series(path) if is_dicom_dir else load_nifti(path)
    image = resample_isotropic(image, spacing=target_spacing, is_label=False)
    volume = sitk.GetArrayFromImage(image).astype(np.float32)  # (D, H, W)
    volume = hu_windowing(volume, window_center, window_width)
    volume = denoise(volume, sigma=0.5)
    return volume
