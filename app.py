"""
app.py - Pixel-Moon FastAPI Application Entrypoint

Exposes REST API endpoints for lunar image registration:
- POST /register: Uploads Chandrayaan-2 source and LRO NAC reference images for registration.
- POST /register-sample: Executes registration on pre-loaded sample pairs.
- GET /results/{filename}: Serves result images and match maps.
- GET /health: Healthcheck endpoint.
- GET /sample-pairs: Returns available built-in lunar sample datasets.
- GET /imaging-sites: Returns lunar landmark coordinates for 3D globe visualization.
- GET /: Serves the interactive 3D Moon Globe & Registration Dashboard.
"""

import os
import shutil
import tempfile
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.pipeline import run_registration_pipeline
from src.ingest import detect_sensor_from_path

app = FastAPI(
    title="Pixel-Moon API",
    description="Multi-Modal Lunar Image Registration Pipeline for Chandrayaan-2 and NASA LRO NAC (ISRO)",
    version="1.0.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
BASE_DIR = Path(__file__).resolve().parent
RESULTS_DIR = BASE_DIR / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_SOURCE_DIR = BASE_DIR / "data" / "source"
DATA_REF_DIR = BASE_DIR / "data" / "reference"
FRONTEND_DIR = BASE_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"
if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="static-assets")


# Pre-defined Lunar Imaging & Landing Sites for 3D Globe
LUNAR_SITES = [
    {
        "id": "site_ch3",
        "name": "Chandrayaan-3 Shiv Shakti Point",
        "lat": -69.373,
        "lon": 32.319,
        "region": "South Pole",
        "description": "Historic soft landing site of Chandrayaan-3 Vikram Lander & Pragyan Rover.",
        "sample_pair": "ohrc"
    },
    {
        "id": "site_ch2",
        "name": "Chandrayaan-2 Landing Search Zone",
        "lat": -70.90,
        "lon": 22.78,
        "region": "Manzinus C & Simpelius N",
        "description": "High-resolution OHRC 25cm coverage area for crater mapping.",
        "sample_pair": "tmc2"
    },
    {
        "id": "site_tycho",
        "name": "Tycho Crater",
        "lat": -43.31,
        "lon": -11.36,
        "region": "Southern Highlands",
        "description": "Prominent lunar impact crater with extensive ejecta rays.",
        "sample_pair": "tmc2"
    },
    {
        "id": "site_shackleton",
        "name": "Shackleton Crater",
        "lat": -89.90,
        "lon": 0.00,
        "region": "Lunar South Pole",
        "description": "Permanently shadowed crater interior rich in water-ice volatiles.",
        "sample_pair": "iirs"
    },
    {
        "id": "site_apollo11",
        "name": "Mare Tranquillitatis (Apollo 11)",
        "lat": 0.674,
        "lon": 23.473,
        "region": "Lunar Maria",
        "description": "First human lunar landing site, basaltic mare regolith.",
        "sample_pair": "tmc2"
    }
]


@app.get("/health")
def health_check():
    """Health check endpoint specified in PRD."""
    return {"status": "ok", "service": "Pixel-Moon", "version": "1.0.0"}


@app.get("/imaging-sites")
def get_imaging_sites():
    """Returns coordinates and information for 3D Moon Globe interactive markers."""
    return {"sites": LUNAR_SITES}


@app.get("/sample-pairs")
def get_sample_pairs():
    """Returns available sample pairs for quick demonstration."""
    pairs = [
        {
            "id": "tmc2",
            "name": "Chandrayaan-2 TMC-2 vs LRO NAC (Tycho Crater)",
            "sensor": "TMC-2",
            "resolution": "5.0 m/pixel",
            "source_path": str(DATA_SOURCE_DIR / "chandrayaan2_tmc2_crater_tycho.png"),
            "reference_path": str(DATA_REF_DIR / "lro_nac_tycho_ref.png"),
            "site": "Tycho Crater"
        },
        {
            "id": "ohrc",
            "name": "Chandrayaan-2 OHRC vs LRO NAC (South Pole Basin)",
            "sensor": "OHRC",
            "resolution": "0.25 m/pixel (Sub-meter)",
            "source_path": str(DATA_SOURCE_DIR / "chandrayaan2_ohrc_southpole.png"),
            "reference_path": str(DATA_REF_DIR / "lro_nac_tycho_ref.png"),
            "site": "Chandrayaan-3 Shiv Shakti Point"
        },
        {
            "id": "iirs",
            "name": "Chandrayaan-2 IIRS vs LRO NAC (Infrared SWIR)",
            "sensor": "IIRS",
            "resolution": "80.0 m/pixel (Hyperspectral)",
            "source_path": str(DATA_SOURCE_DIR / "chandrayaan2_iirs_infrared.png"),
            "reference_path": str(DATA_REF_DIR / "lro_nac_tycho_ref.png"),
            "site": "Shackleton Crater"
        }
    ]
    return {"samples": pairs}


@app.post("/register")
async def register_images(
    source_image: UploadFile = File(...),
    reference_image: UploadFile = File(...),
    source_sensor: Optional[str] = Form(None),
    clip_limit: float = Form(2.0),
    ransac_thresh: float = Form(1.8),
    subpixel_refine: bool = Form(True)
):
    """
    POST /register endpoint as specified in PRD Section 6.
    Accepts multipart/form-data upload of source and reference images.
    """
    # Create temporary files for processing
    temp_dir = tempfile.mkdtemp()
    try:
        src_suffix = Path(source_image.filename or "source.png").suffix
        ref_suffix = Path(reference_image.filename or "ref.png").suffix

        src_path = os.path.join(temp_dir, f"{source_image.filename}")
        ref_path = os.path.join(temp_dir, f"{reference_image.filename}")

        with open(src_path, "wb") as f_src:
            shutil.copyfileobj(source_image.file, f_src)
        with open(ref_path, "wb") as f_ref:
            shutil.copyfileobj(reference_image.file, f_ref)

        result = run_registration_pipeline(
            source_path=src_path,
            reference_path=ref_path,
            output_dir=str(RESULTS_DIR),
            source_sensor_override=source_sensor,
            clip_limit=clip_limit,
            ransac_thresh=ransac_thresh,
            subpixel_refine=subpixel_refine
        )

        if result.get("status") != "success":
            raise HTTPException(status_code=422, detail=result.get("message", "Registration failed."))

        # Formulate response format as outlined in PRD page 12
        response_payload = {
            "status": "success",
            "sensor": result["sensor"],
            "metrics": {
                "rmse": result["metrics"]["rmse"],
                "inlier_count": result["metrics"]["inlier_count"],
                "inlier_ratio": result["metrics"]["inlier_ratio"],
                "grid_coverage": result["metrics"]["grid_coverage"]
            },
            "compliance": result["metrics"].get("compliance", {}),
            "targets": result["metrics"].get("targets", {}),
            "registered_image_url": result["artifacts"]["registered_image_url"],
            "match_map_url": result["artifacts"]["match_map_url"],
            "blend_image_url": result["artifacts"]["blend_image_url"],
            "source_preprocessed_url": result["artifacts"]["source_preprocessed_url"],
            "reference_preprocessed_url": result["artifacts"]["reference_preprocessed_url"],
            "homography": result["homography"],
            "details": result["details"]
        }
        return JSONResponse(content=response_payload)

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


@app.post("/register-sample")
async def register_sample(
    sample_id: str = Form("tmc2"),
    clip_limit: float = Form(2.0),
    ransac_thresh: float = Form(1.8),
    subpixel_refine: bool = Form(True)
):
    """Convenience endpoint to register built-in sample pairs with zero upload overhead."""
    mapping = {
        "tmc2": (DATA_SOURCE_DIR / "chandrayaan2_tmc2_crater_tycho.png", DATA_REF_DIR / "lro_nac_tycho_ref.png", "TMC-2"),
        "ohrc": (DATA_SOURCE_DIR / "chandrayaan2_ohrc_southpole.png", DATA_REF_DIR / "lro_nac_tycho_ref.png", "OHRC"),
        "iirs": (DATA_SOURCE_DIR / "chandrayaan2_iirs_infrared.png", DATA_REF_DIR / "lro_nac_tycho_ref.png", "IIRS")
    }

    if sample_id not in mapping:
        raise HTTPException(status_code=400, detail=f"Unknown sample_id. Options: {list(mapping.keys())}")

    src_p, ref_p, sensor = mapping[sample_id]
    if not src_p.exists() or not ref_p.exists():
        raise HTTPException(status_code=404, detail="Sample dataset files missing.")

    result = run_registration_pipeline(
        source_path=str(src_p),
        reference_path=str(ref_p),
        output_dir=str(RESULTS_DIR),
        source_sensor_override=sensor,
        clip_limit=clip_limit,
        ransac_thresh=ransac_thresh,
        subpixel_refine=subpixel_refine
    )

    if result.get("status") != "success":
        raise HTTPException(status_code=422, detail=result.get("message", "Registration failed."))

    return {
        "status": "success",
        "sensor": result["sensor"],
        "metrics": {
            "rmse": result["metrics"]["rmse"],
            "inlier_count": result["metrics"]["inlier_count"],
            "inlier_ratio": result["metrics"]["inlier_ratio"],
            "grid_coverage": result["metrics"]["grid_coverage"]
        },
        "compliance": result["metrics"].get("compliance", {}),
        "targets": result["metrics"].get("targets", {}),
        "registered_image_url": result["artifacts"]["registered_image_url"],
        "match_map_url": result["artifacts"]["match_map_url"],
        "blend_image_url": result["artifacts"]["blend_image_url"],
        "source_preprocessed_url": result["artifacts"]["source_preprocessed_url"],
        "reference_preprocessed_url": result["artifacts"]["reference_preprocessed_url"],
        "homography": result["homography"],
        "details": result["details"]
    }


@app.get("/results/{filename}")
async def serve_result_file(filename: str):
    """GET /results/{filename} endpoint as specified in PRD Section 6."""
    file_path = RESULTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Result file '{filename}' not found.")
    return FileResponse(file_path)


@app.get("/moon-texture")
async def serve_moon_texture():
    """Serve the bundled lunar texture used by the 3D globe."""
    texture_path = DATA_REF_DIR / "lro_nac_tycho_ref.png"
    if not texture_path.exists():
        raise HTTPException(status_code=404, detail="Moon texture is unavailable.")
    return FileResponse(texture_path)


# Serve index dashboard
@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serves the interactive web dashboard."""
    dist_index = FRONTEND_DIR / "dist" / "index.html"
    if dist_index.exists():
        with open(dist_index, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>Pixel-Moon API is Running.</h1><p>Visit /docs for OpenAPI specs.</p>")
