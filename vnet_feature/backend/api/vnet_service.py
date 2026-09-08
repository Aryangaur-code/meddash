"""
FastAPI microservice wrapping the V-Net inference pipeline.

Exposes:
    POST /api/vnet/analyze-ct
        multipart/form-data: file=<CT volume as .nii.gz>
        -> { mesh_url, mask_url, metrics }

    GET /api/vnet/mesh/{job_id}   -> serves the .glb mesh
    GET /api/vnet/mask/{job_id}   -> serves the .nii.gz segmentation mask

Run:
    uvicorn vnet_service:app --host 0.0.0.0 --port 8001

The Next.js Doctor Portal calls this service directly (e.g. via an API route
proxy at /app/api/vnet/route.ts) rather than embedding Python in the Node app.
"""

import os
import shutil
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "vnet"))
from infer_vnet_3d import run_inference  # noqa: E402

app = FastAPI(title="AI Medical Copilot - V-Net CT Tumor Analysis Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to your Next.js origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "vnet_jobs/uploads"
OUTPUT_DIR = "vnet_jobs/outputs"
CHECKPOINT_PATH = os.environ.get("VNET_CHECKPOINT", "vnet_ct_model.pth")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.post("/api/vnet/analyze-ct")
async def analyze_ct(file: UploadFile = File(...)):
    if not (file.filename.endswith(".nii") or file.filename.endswith(".nii.gz")):
        raise HTTPException(400, "Please upload a NIfTI CT volume (.nii or .nii.gz)")

    job_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{job_id}.nii.gz")
    with open(input_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    out_dir = os.path.join(OUTPUT_DIR, job_id)

    if not os.path.exists(CHECKPOINT_PATH):
        raise HTTPException(500, f"V-Net checkpoint not found at {CHECKPOINT_PATH}. Train the model first.")

    try:
        metrics = run_inference(input_path, CHECKPOINT_PATH, out_dir)
    except Exception as e:
        raise HTTPException(500, f"Inference failed: {e}")

    if not metrics.get("tumor_detected", False):
        return JSONResponse({"job_id": job_id, "tumor_detected": False})

    return {
        "job_id": job_id,
        "tumor_detected": True,
        "mesh_url": f"/api/vnet/mesh/{job_id}",
        "mask_url": f"/api/vnet/mask/{job_id}",
        "metrics": metrics,
    }


@app.get("/api/vnet/mesh/{job_id}")
async def get_mesh(job_id: str):
    path = os.path.join(OUTPUT_DIR, job_id, "tumor_mesh.glb")
    if not os.path.exists(path):
        raise HTTPException(404, "Mesh not found")
    return FileResponse(path, media_type="model/gltf-binary", filename="tumor_mesh.glb")


@app.get("/api/vnet/mask/{job_id}")
async def get_mask(job_id: str):
    path = os.path.join(OUTPUT_DIR, job_id, "segmentation_mask.nii.gz")
    if not os.path.exists(path):
        raise HTTPException(404, "Mask not found")
    return FileResponse(path, media_type="application/gzip", filename="segmentation_mask.nii.gz")


@app.get("/api/vnet/health")
async def health():
    return {"status": "ok", "checkpoint_loaded": os.path.exists(CHECKPOINT_PATH)}
