"""
metrics.py - Registration Accuracy and Quality Assessment Module

Step 7 of the Pixel-Moon Pipeline:
Evaluates alignment quality against ISRO evaluation criteria:
1. RMSE (Root Mean Square Error): Target < 1.0 pixel
2. Inlier Count: Target > 100 matches
3. Inlier Ratio: Target > 0.5
4. Grid Coverage: Target > 0.75 (>= 12 of 16 cells filled)
"""

from typing import Dict, Any, Tuple
import numpy as np
import cv2


def compute_rmse(
    pts_src: np.ndarray,
    pts_ref: np.ndarray,
    H: np.ndarray
) -> float:
    """
    Calculate Root Mean Square Error (RMSE) in pixels between projected source points and reference points.

    RMSE = sqrt( mean( || H * p_src - p_ref ||^2 ) )
    """
    if pts_src is None or pts_ref is None or len(pts_src) == 0 or H is None:
        return 0.0

    pts_src_2d = pts_src.reshape(-1, 2)
    pts_ref_2d = pts_ref.reshape(-1, 2)

    # Convert source points to homogeneous coordinates (N, 3)
    num_pts = len(pts_src_2d)
    ones = np.ones((num_pts, 1), dtype=np.float32)
    pts_src_homo = np.hstack([pts_src_2d, ones])  # (N, 3)

    # Project through 3x3 homography H: p_proj_homo = (H * p^T)^T = p * H^T
    projected_homo = pts_src_homo.dot(H.T)  # (N, 3)

    # Normalize by third coordinate (z)
    z = projected_homo[:, 2:3]
    # Avoid division by zero
    z = np.where(np.abs(z) < 1e-8, 1e-8, z)
    projected_2d = projected_homo[:, :2] / z

    # Euclidean distance squared for each point
    diff = projected_2d - pts_ref_2d
    dist_sq = np.sum(diff ** 2, axis=1)

    rmse = float(np.sqrt(np.mean(dist_sq)))
    return round(rmse, 4)


def compute_grid_coverage(
    points: np.ndarray,
    image_shape: Tuple[int, int],
    grid_n: int = 4
) -> Tuple[float, int, int]:
    """
    Calculate spatial grid coverage across image.

    Divides image into N x N cells (default 4x4 = 16 cells).
    Counts how many cells contain at least 1 inlier point.

    Returns:
        Tuple[coverage_ratio, filled_cells, total_cells]
    """
    total_cells = grid_n * grid_n
    if points is None or len(points) == 0:
        return 0.0, 0, total_cells

    h, w = image_shape[:2]
    pts = points.reshape(-1, 2)

    occupied_cells = set()
    cell_w = max(1.0, w / grid_n)
    cell_h = max(1.0, h / grid_n)

    for pt in pts:
        col = int(min(max(0, pt[0] // cell_w), grid_n - 1))
        row = int(min(max(0, pt[1] // cell_h), grid_n - 1))
        occupied_cells.add((row, col))

    filled = len(occupied_cells)
    coverage = round(float(filled / total_cells), 4)
    return coverage, filled, total_cells


def evaluate_registration(
    inlier_pts_src: np.ndarray,
    inlier_pts_ref: np.ndarray,
    H: np.ndarray,
    total_good_matches: int,
    image_shape: Tuple[int, int]
) -> Dict[str, Any]:
    """
    Compute full metric suite and compare against evaluation targets.

    Evaluation Criteria (PRD Section 10):
    - RMSE: Target < 1.0 pixel
    - Inlier count: Target > 100 matches
    - Inlier ratio: Target > 0.5
    - Grid coverage: Target > 0.75 (12/16 cells)

    Returns:
        Dict with metrics, targets, and pass/fail indicators.
    """
    inlier_count = len(inlier_pts_src) if inlier_pts_src is not None else 0

    # Inlier ratio
    if total_good_matches > 0:
        inlier_ratio = round(float(inlier_count / total_good_matches), 4)
    else:
        inlier_ratio = 0.0

    # RMSE
    rmse = compute_rmse(inlier_pts_src, inlier_pts_ref, H)

    # Grid coverage
    grid_coverage, filled_cells, total_cells = compute_grid_coverage(
        inlier_pts_ref, image_shape, grid_n=4
    )

    # Compliance checks
    rmse_passed = rmse < 1.0
    inlier_count_passed = inlier_count >= 100
    inlier_ratio_passed = inlier_ratio >= 0.5
    coverage_passed = grid_coverage >= 0.75

    overall_passed = rmse_passed and inlier_ratio_passed and coverage_passed

    return {
        "rmse": rmse,
        "inlier_count": inlier_count,
        "inlier_ratio": inlier_ratio,
        "grid_coverage": grid_coverage,
        "grid_cells_filled": filled_cells,
        "grid_cells_total": total_cells,
        "targets": {
            "rmse_target": "< 1.0 px",
            "inlier_count_target": "> 100",
            "inlier_ratio_target": "> 0.50",
            "grid_coverage_target": "> 0.75 (12/16)",
        },
        "compliance": {
            "rmse_passed": bool(rmse_passed),
            "inlier_count_passed": bool(inlier_count_passed),
            "inlier_ratio_passed": bool(inlier_ratio_passed),
            "grid_coverage_passed": bool(coverage_passed),
            "overall_passed": bool(overall_passed),
        }
    }
