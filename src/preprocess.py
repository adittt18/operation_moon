"""
preprocess.py - Lunar Imagery Preprocessing Module

Step 2 of the Pixel-Moon Pipeline:
Prepares lunar images for feature matching:
1. Grayscale Conversion: Standardizes black-and-white, RGB, and hyperspectral data.
2. IIRS Band Selection: Extracts optimal visible/near-IR band from hyperspectral cubes.
3. CLAHE (Contrast Limited Adaptive Histogram Equalization):
   Normalizes illumination disparities caused by extreme lunar sun angles (8x8 tiles, clipLimit=2.0).
4. Resolution Harmonisation:
   Resamples OHRC (0.25m), TMC-2 (5m), and IIRS (80m) to a common baseline scale.
"""

from typing import Union, Tuple, Optional
import numpy as np
import cv2


def to_grayscale(image: np.ndarray) -> np.ndarray:
    """
    Convert any multi-channel or multi-depth image to standard 8-bit single-channel grayscale.
    """
    if image is None:
        raise ValueError("Input image cannot be None")

    img = image.copy()

    # Handle float / 16-bit normalization to 0..255 uint8
    if img.dtype == np.float32 or img.dtype == np.float64:
        # Check if values are in 0..1 or arbitrary range
        img_min = float(np.nanmin(img))
        img_max = float(np.nanmax(img))
        if img_max > img_min:
            img = ((img - img_min) / (img_max - img_min) * 255.0).astype(np.uint8)
        else:
            img = np.zeros(img.shape[:2], dtype=np.uint8)
    elif img.dtype == np.uint16:
        img = (img / 256.0).astype(np.uint8)
    elif img.dtype != np.uint8:
        img = img.astype(np.uint8)

    # Multi-channel color conversion
    if len(img.shape) == 3:
        channels = img.shape[2]
        if channels == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
        elif channels == 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        elif channels == 1:
            img = img.squeeze(axis=2)
        else:
            # Multi-spectral cube or unexpected channels: take median across channels
            img = np.median(img, axis=2).astype(np.uint8)

    return img


def extract_iirs_band(image: np.ndarray, preferred_band: int = 65) -> np.ndarray:
    """
    Select optimal band closest to visible/short-wave infrared from IIRS hyperspectral data.
    Typical IIRS cubes have ~250 bands; bands ~50-80 provide optimal contrast for alignment.
    """
    if len(image.shape) == 3 and image.shape[2] > 1:
        total_bands = image.shape[2]
        band_idx = min(max(0, preferred_band), total_bands - 1)
        selected = image[:, :, band_idx]
        return to_grayscale(selected)
    return to_grayscale(image)


def apply_clahe(gray_image: np.ndarray, clip_limit: float = 2.0, tile_grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """
    Apply Contrast Limited Adaptive Histogram Equalization (CLAHE).
    Removes illumination shadows and normalizes solar incident angle disparities.
    """
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    return clahe.apply(gray_image)


def harmonise_resolution(
    gray_image: np.ndarray,
    sensor: str,
    target_gsd: float = 5.0,
    custom_scale: Optional[float] = None
) -> Tuple[np.ndarray, float]:
    """
    Harmonise lunar image resolution to a common scale baseline (default TMC-2 ~5m/pixel).

    Rules:
    - OHRC (~0.25 m/px): Downsample by ~20x (scale ~ 0.05) or to target_gsd using area decimation.
    - TMC-2 (~5.0 m/px): Keep as-is (scale factor = 1.0).
    - IIRS (~80.0 m/px): Upsample carefully using Lanczos interpolation (cv2.INTER_LANCZOS4).
    - LRO_NAC (~0.5 m/px): Downsample to ~5m or reference scale as appropriate.

    Returns:
        (harmonised_image, applied_scale_factor)
    """
    h, w = gray_image.shape[:2]

    if custom_scale is not None:
        scale_factor = custom_scale
    else:
        sensor_upper = (sensor or "").upper()
        if "OHRC" in sensor_upper:
            # OHRC 0.25m -> 5m target: 0.25 / 5.0 = 0.05 scale factor
            # For practical dimensions, if image is small (< 1000px), avoid reducing too small (< 128px)
            raw_scale = 0.25 / target_gsd
            min_dim = min(h, w)
            if min_dim * raw_scale < 128:
                scale_factor = max(128.0 / min_dim, 0.25)
            else:
                scale_factor = raw_scale
        elif "IIRS" in sensor_upper:
            # IIRS 80m -> 5m target: 80 / 5.0 = 16x upsample
            # Cap upsample factor to 4x or 8x to avoid excessive memory explosion on larger scenes
            raw_scale = 80.0 / target_gsd
            scale_factor = min(raw_scale, 4.0)
        elif "LRO" in sensor_upper:
            scale_factor = 1.0
        else:
            # TMC-2 or UNKNOWN -> reference scale
            scale_factor = 1.0

    if abs(scale_factor - 1.0) < 1e-3:
        return gray_image, 1.0

    new_w = max(16, int(round(w * scale_factor)))
    new_h = max(16, int(round(h * scale_factor)))

    if scale_factor < 1.0:
        # Downsample using area interpolation (antialias)
        harmonised = cv2.resize(gray_image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    else:
        # Upsample using high-fidelity Lanczos-4
        harmonised = cv2.resize(gray_image, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

    return harmonised, scale_factor


def preprocess_image(
    image: np.ndarray,
    sensor: str = "TMC-2",
    clip_limit: float = 2.0,
    tile_grid_size: Tuple[int, int] = (8, 8),
    harmonise: bool = True,
    target_gsd: float = 5.0
) -> Tuple[np.ndarray, float]:
    """
    Full Step 2 Preprocessing Pipeline.

    Args:
        image: Source raw numpy image array.
        sensor: Sensor name (OHRC, TMC-2, IIRS, LRO_NAC, etc.)
        clip_limit: CLAHE clip limit (default 2.0)
        tile_grid_size: CLAHE tile grid size (default 8x8)
        harmonise: Whether to perform resolution harmonisation.
        target_gsd: Target ground sampling distance in meters (default 5.0)

    Returns:
        Tuple[np.ndarray, float]: (preprocessed_gray_image, applied_scale_factor)
    """
    # 1. Band selection for hyperspectral IIRS
    if (sensor or "").upper() == "IIRS":
        gray = extract_iirs_band(image)
    else:
        gray = to_grayscale(image)

    # 2. Illumination compensation via CLAHE
    equalized = apply_clahe(gray, clip_limit=clip_limit, tile_grid_size=tile_grid_size)

    # 3. Resolution harmonisation
    if harmonise:
        final_img, scale_factor = harmonise_resolution(equalized, sensor=sensor, target_gsd=target_gsd)
    else:
        final_img = equalized
        scale_factor = 1.0

    return final_img, scale_factor
