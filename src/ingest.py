"""
ingest.py - Image Ingestion and Sensor Detection Module

Step 1 of the Pixel-Moon Pipeline:
Loads Chandrayaan-2 (OHRC, TMC-2, IIRS) and NASA LRO NAC reference imagery
from diverse lunar remote sensing formats (PNG, TIFF, FITS, IMG, etc.),
and automatically detects the originating sensor based on filename conventions
and file metadata.
"""

import os
from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
import cv2
from PIL import Image

# Sensor classification tags
SENSOR_OHRC = "OHRC"
SENSOR_TMC2 = "TMC-2"
SENSOR_IIRS = "IIRS"
SENSOR_LRO_NAC = "LRO_NAC"
SENSOR_UNKNOWN = "UNKNOWN"

# Ground sampling distance (GSD) / resolution metadata in meters per pixel
SENSOR_RESOLUTIONS = {
    SENSOR_OHRC: 0.25,     # 25 cm/pixel
    SENSOR_TMC2: 5.0,      # 5 m/pixel
    SENSOR_IIRS: 80.0,     # 80 m/pixel
    SENSOR_LRO_NAC: 0.50,  # ~50 cm/pixel (typical LRO NAC)
    SENSOR_UNKNOWN: 5.0,
}


def detect_sensor_from_path(file_path: str) -> str:
    """
    Auto-detect sensor type from file name or directory path.

    Rules from PRD:
    - contains "ohr" -> OHRC
    - contains "tmc" -> TMC-2
    - contains "iirs" -> IIRS
    - contains "lro" or "nac" -> LRO_NAC
    - else -> UNKNOWN
    """
    clean_name = os.path.basename(file_path).lower()

    if "ohr" in clean_name:
        return SENSOR_OHRC
    elif "tmc" in clean_name:
        return SENSOR_TMC2
    elif "iirs" in clean_name:
        return SENSOR_IIRS
    elif "lro" in clean_name or "nac" in clean_name:
        return SENSOR_LRO_NAC
    return SENSOR_UNKNOWN


def load_fits_image(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Load image from FITS format using astropy if available, with graceful fallback."""
    try:
        from astropy.io import fits  # type: ignore[import-untyped]
        with fits.open(file_path) as hdul:
            data = None
            header_dict = {}
            for hdu in hdul:
                if hdu.data is not None and len(hdu.data.shape) >= 2:
                    data = np.array(hdu.data, dtype=np.float32)
                    header_dict = dict(hdu.header)
                    break
            if data is None:
                raise ValueError("No 2D image data found in FITS file")
            # Normalize to 0..255 uint8 if needed
            if data.dtype != np.uint8:
                d_min, d_max = np.nanmin(data), np.nanmax(data)
                if d_max > d_min:
                    data = ((data - d_min) / (d_max - d_min) * 255.0).astype(np.uint8)
                else:
                    data = np.zeros(data.shape, dtype=np.uint8)
            return data, header_dict
    except ImportError:
        # Fallback reading with raw bytes or raising descriptive error
        raise ImportError("astropy is required to load FITS format images.")


def load_gdal_or_img(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Load image from GDAL / .IMG format with rasterio/PIL fallback."""
    try:
        import rasterio
        with rasterio.open(file_path) as dataset:
            band_count = dataset.count
            if band_count == 1:
                arr = dataset.read(1)
            else:
                bands = [dataset.read(i + 1) for i in range(band_count)]
                arr = np.stack(bands, axis=-1)
            crs = dataset.crs
            meta = {
                "projection": crs.to_wkt() if crs else "",
                "geotransform": dataset.transform.to_gdal(),
                "bands": band_count,
            }
            return arr, meta
    except Exception:
        pass

    # Fallback using PIL
    try:
        img = Image.open(file_path)
        arr = np.array(img)
        return arr, {"format": "PIL_IMG"}
    except Exception as e:
        raise ValueError(f"Failed to load image from {file_path}: {e}")


def ingest_image(file_path: str, sensor_override: str = None) -> Dict[str, Any]:
    """
    Ingest lunar image file and extract metadata.

    Args:
        file_path: Path to the image file.
        sensor_override: Optional manual override for sensor type.

    Returns:
        dict: {
            "image": np.ndarray,
            "sensor": str,
            "shape": tuple,
            "resolution_m": float,
            "file_path": str,
            "metadata": dict
        }
    """
    path_obj = Path(file_path)
    if not path_obj.exists():
        raise FileNotFoundError(f"Image file not found: {file_path}")

    ext = path_obj.suffix.lower()
    metadata: Dict[str, Any] = {"extension": ext}

    # Step 1: Detect sensor
    sensor = sensor_override or detect_sensor_from_path(file_path)

    # Step 2: Load image according to extension
    if ext in [".fits", ".fit", ".fts"]:
        image, fits_meta = load_fits_image(file_path)
        metadata.update(fits_meta)
    elif ext in [".img", ".bil", ".bip", ".bsq"]:
        image, gdal_meta = load_gdal_or_img(file_path)
        metadata.update(gdal_meta)
    else:
        # Standard image (PNG, TIFF, JPG, BMP)
        image = cv2.imread(str(file_path), cv2.IMREAD_UNCHANGED)
        if image is None:
            # Try PIL
            pil_img = Image.open(file_path)
            image = np.array(pil_img)

    if image is None:
        raise ValueError(f"Could not decode image at path: {file_path}")

    # Ensure 2D or 3D numpy array
    image = np.asarray(image)

    return {
        "image": image,
        "sensor": sensor,
        "shape": image.shape,
        "resolution_m": SENSOR_RESOLUTIONS.get(sensor, 5.0),
        "file_path": str(file_path),
        "metadata": metadata,
    }
