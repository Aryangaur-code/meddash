# 3D Tumor Modelling (V-Net) — Integration Guide

This module adds a **CT tumor segmentation + 3D modelling** feature to the AI
Medical Copilot, following the same pipeline documented in the report
(Section: Core AI & ML Processing Engine).

## What it does

1. Doctor uploads a CT volume (NIfTI `.nii.gz`) in the Doctor Portal.
2. A Python V-Net model segments the tumor volumetrically.
3. The mask is converted to a 3D surface mesh (Marching Cubes) and cleaned up.
4. Shape metrics are computed (volume, surface area, sphericity, convexity,
   elongation, max diameter, etc.).
5. The mesh + metrics are returned to the frontend and rendered in an
   interactive, orbit-controlled 3D viewer inside the Doctor Portal.

## Folder structure

```
backend/
  vnet/
    model.py            # V-Net architecture + Dice/CE loss
    preprocess.py        # DICOM/NIfTI loading, HU windowing, resampling
    train_vnet_ct.py     # training script (matches train_ct_model.py style)
    infer_vnet_3d.py     # inference -> mesh -> shape metrics -> export
  api/
    vnet_service.py      # FastAPI microservice wrapping inference
frontend/
  components/
    CTTumor3DViewer.jsx           # React + Three.js 3D viewer
    CTTumor3DViewer.module.css    # glassmorphism-matched styling
```

## 1. Backend setup

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install torch SimpleITK numpy scipy scikit-image trimesh fastapi uvicorn python-multipart
```

### Train the model

Prepare labeled data as:
```
data/
  images/patient001.nii.gz
  masks/patient001.nii.gz
```

```bash
cd vnet
python train_vnet_ct.py --data_dir ../data --epochs 100 --out vnet_ct_model.pth
```

### Run the inference microservice

```bash
cd ../api
export VNET_CHECKPOINT=../vnet/vnet_ct_model.pth
uvicorn vnet_service:app --host 0.0.0.0 --port 8001
```

Test manually:
```bash
curl -X POST http://localhost:8001/api/vnet/analyze-ct \
  -F "file=@sample_ct.nii.gz"
```

## 2. Frontend setup (Next.js Doctor Portal)

```bash
npm install three
```

Copy `frontend/components/CTTumor3DViewer.jsx` and its `.module.css` into
`app/doctor/components/`, then add it to the Diagnostic Dashboard page:

```jsx
// app/doctor/diagnostics/page.jsx
import CTTumor3DViewer from "../components/CTTumor3DViewer";

export default function DiagnosticsPage() {
  return (
    <div>
      {/* existing EHR / vitals panels */}
      <CTTumor3DViewer apiBaseUrl={process.env.NEXT_PUBLIC_VNET_API_URL} />
    </div>
  );
}
```

Set the service URL in `.env.local`:
```
NEXT_PUBLIC_VNET_API_URL=http://localhost:8001
```

### Optional: proxy through a Next.js API route

To avoid exposing the Python service directly, add
`app/api/vnet/analyze-ct/route.ts` that forwards the multipart upload to
`http://localhost:8001/api/vnet/analyze-ct` server-side, and point
`apiBaseUrl` at `""` (same-origin) in the component instead.

## 3. Notes on scope for the report / demo

- If you don't have labeled CT + tumor mask training data on hand, the
  frontend viewer can be demoed against a **pre-generated sample mesh**
  (`tumor_mesh.glb`) and a mocked `metrics.json`, exactly the way the rest
  of the app "simulates" its AI layer — swap `apiBaseUrl` for a static
  JSON/GLB fixture and skip the live FastAPI call.
- Public datasets you can train/fine-tune on: **MSD (Medical Segmentation
  Decathlon)** — Liver/Lung/Pancreas tumor tasks, or **LiTS** (Liver Tumor
  Segmentation) — both ship as NIfTI CT + mask pairs matching this
  pipeline's expected format directly.
- For a lighter-weight demo without a GPU, reduce `patch_size` (e.g. to
  `(32, 96, 96)`) and `base_channels` (e.g. to 8) in `VNet(...)`.

## 4. Extending further

- **MPR (multi-planar) slice viewer**: add a slider alongside the 3D view
  that reads axial/coronal/sagittal slices from the returned
  `segmentation_mask.nii.gz` (via `nifti-reader-js` on the frontend) with
  the mask overlaid in a semi-transparent color.
- **Longitudinal tracking**: store `metrics.json` per scan date and chart
  volume/diameter change over time using the existing Recharts setup.
- **Uncertainty overlay**: color mesh regions by per-voxel confidence
  (from `prob_map[1]`) to flag areas the model is less sure about.
