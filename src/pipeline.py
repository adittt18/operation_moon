"""
pipeline.py - End-to-End Pixel-Moon Registration Pipeline Orchestrator

Integrates all 7 steps of the Pixel-Moon system:
1. Ingest (format & sensor detection)
2. Preprocess (CLAHE, grayscale, scale harmonisation)
3. Detect (grid-tiled SIFT + SuperPoint fallback)
4. Match (FLANN + Lowe's ratio test + multi-scale)
5. Align (RANSAC homography + sub-pixel refinement)
6. Metrics (RMSE, inliers, grid coverage against SIH targets)
7. Visualization generation & export
"""

import os
import uuid
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import numpy as np
import cv2

from .ingest import ingest_image, SENSOR_LRO_NAC
from .preprocess import preprocess_image
from .detect import detect_features
from .match import match_features
from .align import estimate_homography_and_align
from .metrics import evaluate_registration


def create_checkerboard_blend(
    img1: np.ndarray,
    img2: np.ndarray,
    tile_size: int = 32
) -> np.ndarray:
    """
    Create an interleaved checkerboard pattern between two registered images
    to verify alignment continuity across crater rims and geological boundaries.
    """
    h, w = img1.shape[:2]
    # Ensure img2 matches size
    if img2.shape[:2] != (h, w):
        img2 = cv2.resize(img2, (w, h))

    # Convert to 3-channel for visualization if grayscale
    c1 = cv2.cvtColor(img1, cv2.COLOR_GRAY2BGR) if len(img1.shape) == 2 else img1.copy()
    c2 = cv2.cvtColor(img2, cv2.COLOR_GRAY2BGR) if len(img2.shape) == 2 else img2.copy()

    blended = np.zeros_like(c1)
    for y in range(0, h, tile_size):
        for x in range(0, w, tile_size):
            tile_y = min(y + tile_size, h)
            tile_x = min(x + tile_size, w)
            if ((x // tile_size) + (y // tile_size)) % 2 == 0:
                blended[y:tile_y, x:tile_x] = c1[y:tile_y, x:tile_x]
            else:
                blended[y:tile_y, x:tile_x] = c2[y:tile_y, x:tile_x]

    return blended


def create_match_visualization(
    img_src: np.ndarray,
    kp_src: list,
    img_ref: np.ndarray,
    kp_ref: list,
    matches: list,
    inlier_mask: Optional[np.ndarray] = None,
    max_draw: int = 80
) -> np.ndarray:
    """
    Generate side-by-side match map visualization with colored tie-lines.
    """
    # Pick matches to draw
    if inlier_mask is not None:
        mask_flat = inlier_mask.ravel().tolist()
        draw_matches = [m for m, is_inlier in zip(matches, mask_flat) if is_inlier]
    else:
        draw_matches = matches

    if len(draw_matches) > max_draw:
        # Sample evenly across range
        indices = np.linspace(0, len(draw_matches) - 1, max_draw, dtype=int)
        draw_matches = [draw_matches[i] for i in indices]

    # Draw matches with distinct neon green line color
    match_img = cv2.drawMatches(
        img_src, kp_src,
        img_ref, kp_ref,
        draw_matches,
        None,
        matchColor=(0, 240, 120),  # vibrant green
        singlePointColor=(255, 120, 0),  # cyan-blue
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
    )
    return match_img


def run_registration_pipeline(
    source_path: str,
    reference_path: str,
    output_dir: str = "results",
    source_sensor_override: Optional[str] = None,
    clip_limit: float = 2.0,
    grid_size: int = 4,
    ratio_threshold: float = 0.75,
    ransac_thresh: float = 2.0,
    subpixel_refine: bool = True
) -> Dict[str, Any]:
    """
    Execute complete end-to-end Pixel-Moon pipeline.

    Args:
        source_path: Path to Chandrayaan-2 image (OHRC, TMC-2, or IIRS).
        reference_path: Path to NASA LRO NAC reference image.
        output_dir: Directory where result images will be saved.
        source_sensor_override: Optional manual sensor override.
        clip_limit: CLAHE clip limit.
        grid_size: Grid size for tiled SIFT (default 4 -> 4x4).
        ratio_threshold: Lowe's ratio test threshold (default 0.75).
        ransac_thresh: RANSAC inlier threshold (default 2.0).
        subpixel_refine: Whether to enable sub-pixel corner refinement.

    Returns:
        Dict: Full results payload containing paths, metrics, and diagnostic data.
    """
    os.makedirs(output_dir, exist_ok=True)
    run_id = uuid.uuid4().hex[:8]

    # 1. Step 1: Ingest
    src_data = ingest_image(source_path, sensor_override=source_sensor_override)
    ref_data = ingest_image(reference_path, sensor_override=SENSOR_LRO_NAC)

    sensor = src_data["sensor"]
    src_raw = src_data["image"]
    ref_raw = ref_data["image"]

    # 2. Step 2: Preprocess
    src_ready, src_scale = preprocess_image(
        src_raw,
        sensor=sensor,
        clip_limit=clip_limit,
        harmonise=True
    )
    ref_ready, ref_scale = preprocess_image(
        ref_raw,
        sensor=SENSOR_LRO_NAC,
        clip_limit=clip_limit,
        harmonise=False
    )

    # 3. Step 3: Feature Detection
    kp_src, des_src = detect_features(src_ready, grid_size=grid_size, max_per_tile=200)
    kp_ref, des_ref = detect_features(ref_ready, grid_size=grid_size, max_per_tile=200)

    # 4. Step 4: Feature Matching
    good_matches = match_features(
        kp_src, des_src,
        kp_ref, des_ref,
        ratio_threshold=ratio_threshold,
        use_multiscale=True
    )

    if len(good_matches) < 4:
        return {
            "status": "error",
            "message": f"Insufficient matches found ({len(good_matches)}). Minimum required is 4.",
            "sensor": sensor,
            "metrics": {
                "rmse": 0.0,
                "inlier_count": 0,
                "inlier_ratio": 0.0,
                "grid_coverage": 0.0
            }
        }

    # 5. Step 5 & 6: Alignment & Sub-pixel Refinement
    align_res = estimate_homography_and_align(
        good_matches=good_matches,
        kp_src=kp_src,
        kp_ref=kp_ref,
        src_image=src_ready,
        ref_shape=ref_ready.shape,
        ref_image=ref_ready,
        ransac_reproj_thresh=ransac_thresh,
        subpixel_refine=subpixel_refine
    )

    if not align_res["success"]:
        return {
            "status": "error",
            "message": align_res["error_msg"],
            "sensor": sensor,
            "metrics": {
                "rmse": 0.0,
                "inlier_count": align_res.get("inlier_count", 0),
                "inlier_ratio": 0.0,
                "grid_coverage": 0.0
            }
        }

    registered_img = align_res["registered_image"]
    H = align_res["homography"]
    inlier_pts_src = align_res["inlier_pts_src"]
    inlier_pts_ref = align_res["inlier_pts_ref"]
    inlier_mask = align_res["inlier_mask"]

    # 6. Step 7: Metrics Calculation
    metrics = evaluate_registration(
        inlier_pts_src=inlier_pts_src,
        inlier_pts_ref=inlier_pts_ref,
        H=H,
        total_good_matches=len(good_matches),
        image_shape=ref_ready.shape
    )

    # 7. Generate and save visualization artifacts
    reg_filename = f"registered_{run_id}.png"
    reg_filepath = os.path.join(output_dir, reg_filename)
    cv2.imwrite(reg_filepath, registered_img)

    match_map_img = create_match_visualization(
        src_ready, kp_src,
        ref_ready, kp_ref,
        good_matches,
        inlier_mask=inlier_mask
    )
    match_map_filename = f"matchmap_{run_id}.png"
    match_map_filepath = os.path.join(output_dir, match_map_filename)
    cv2.imwrite(match_map_filepath, match_map_img)

    # Checkerboard blend
    blend_img = create_checkerboard_blend(registered_img, ref_ready)
    blend_filename = f"blend_{run_id}.png"
    blend_filepath = os.path.join(output_dir, blend_filename)
    cv2.imwrite(blend_filepath, blend_img)

    # Source preprocessed export for dashboard comparison
    src_pre_filename = f"source_pre_{run_id}.png"
    src_pre_filepath = os.path.join(output_dir, src_pre_filename)
    cv2.imwrite(src_pre_filepath, src_ready)

    ref_pre_filename = f"ref_pre_{run_id}.png"
    ref_pre_filepath = os.path.join(output_dir, ref_pre_filename)
    cv2.imwrite(ref_pre_filepath, ref_ready)

    return {
        "status": "success",
        "run_id": run_id,
        "sensor": sensor,
        "metrics": metrics,
        "homography": H.tolist() if H is not None else None,
        "artifacts": {
            "registered_image_path": reg_filepath,
            "registered_image_url": f"/results/{reg_filename}",
            "match_map_path": match_map_filepath,
            "match_map_url": f"/results/{match_map_filename}",
            "blend_image_path": blend_filepath,
            "blend_image_url": f"/results/{blend_filename}",
            "source_preprocessed_url": f"/results/{src_pre_filename}",
            "reference_preprocessed_url": f"/results/{ref_pre_filename}",
        },
        "details": {
            "source_dimensions": src_ready.shape,
            "reference_dimensions": ref_ready.shape,
            "keypoints_detected_source": len(kp_src),
            "keypoints_detected_reference": len(kp_ref),
            "raw_matches_count": len(good_matches),
            "scale_factor_applied": float(src_scale),
        }
    }
