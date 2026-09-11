"""
align.py - Homography Estimation and Sub-Pixel Refinement Module

Steps 5 & 6 of the Pixel-Moon Pipeline:
1. Computes initial 3x3 projective homography transformation matrix H via RANSAC.
2. Performs sub-pixel refinement using cv2.cornerSubPix on inlier coordinates
   to achieve sub-pixel registration accuracy (RMSE < 1.0 pixel).
3. Recomputes optimal Homography from sub-pixel refined tie points.
4. Warps source Chandrayaan-2 image into NASA LRO NAC reference image coordinates.
"""

from typing import List, Tuple, Optional, Dict, Any
import numpy as np
import cv2


def extract_matched_points(
    good_matches: List[cv2.DMatch],
    kp_src: List[cv2.KeyPoint],
    kp_ref: List[cv2.KeyPoint]
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Extract coordinate arrays (N, 1, 2) from list of DMatch objects.
    """
    if not good_matches:
        return np.empty((0, 1, 2), dtype=np.float32), np.empty((0, 1, 2), dtype=np.float32)

    pts_src = np.float32([kp_src[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    pts_ref = np.float32([kp_ref[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    return pts_src, pts_ref


def refine_subpixel_points(
    image: np.ndarray,
    points: np.ndarray,
    win_size: Tuple[int, int] = (5, 5),
    zero_zone: Tuple[int, int] = (-1, -1),
    max_iter: int = 30,
    epsilon: float = 0.001
) -> np.ndarray:
    """
    Refine keypoint coordinates to sub-pixel precision using cv2.cornerSubPix.
    Searches around gradient extrema in a local window (default 5x5).
    """
    if points is None or len(points) == 0:
        return points

    # Ensure single channel uint8
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()
    if gray.dtype != np.uint8:
        gray = np.clip(gray, 0, 255).astype(np.uint8)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, max_iter, epsilon)
    refined_pts = np.copy(points).astype(np.float32)

    # Filter points strictly within safe bounds of image
    h, w = gray.shape[:2]
    pad = max(win_size) + 1
    valid_mask = (
        (refined_pts[:, 0, 0] >= pad) & (refined_pts[:, 0, 0] < w - pad) &
        (refined_pts[:, 0, 1] >= pad) & (refined_pts[:, 0, 1] < h - pad)
    )

    if np.any(valid_mask):
        sub_pts = refined_pts[valid_mask].copy()
        cv2.cornerSubPix(gray, sub_pts, win_size, zero_zone, criteria)
        refined_pts[valid_mask] = sub_pts

    return refined_pts


def estimate_homography_and_align(
    good_matches: List[cv2.DMatch],
    kp_src: List[cv2.KeyPoint],
    kp_ref: List[cv2.KeyPoint],
    src_image: np.ndarray,
    ref_shape: Tuple[int, int],
    ref_image: Optional[np.ndarray] = None,
    ransac_reproj_thresh: float = 2.0,
    subpixel_refine: bool = True
) -> Dict[str, Any]:
    """
    Compute projective alignment from match points.

    Args:
        good_matches: Matched feature pairs.
        kp_src: Keypoints in source image.
        kp_ref: Keypoints in reference image.
        src_image: Source Chandrayaan-2 image to warp.
        ref_shape: (height, width) of reference image.
        ref_image: Optional reference image for cornerSubPix refinement.
        ransac_reproj_thresh: RANSAC threshold in pixels (default 2.0).
        subpixel_refine: Whether to apply cv2.cornerSubPix tightening.

    Returns:
        Dict: {
            "registered_image": np.ndarray,
            "homography": np.ndarray (3x3),
            "inlier_pts_src": np.ndarray,
            "inlier_pts_ref": np.ndarray,
            "inlier_mask": np.ndarray,
            "inlier_count": int,
            "success": bool,
            "error_msg": str
        }
    """
    if len(good_matches) < 4:
        return {
            "registered_image": None,
            "homography": None,
            "inlier_pts_src": np.empty((0, 2)),
            "inlier_pts_ref": np.empty((0, 2)),
            "inlier_mask": None,
            "inlier_count": 0,
            "success": False,
            "error_msg": f"Insufficient matches: found {len(good_matches)}, minimum required is 4."
        }

    pts_src, pts_ref = extract_matched_points(good_matches, kp_src, kp_ref)

    # Initial Homography with RANSAC
    H, mask = cv2.findHomography(pts_src, pts_ref, cv2.RANSAC, ransac_reproj_thresh)

    if H is None or mask is None:
        return {
            "registered_image": None,
            "homography": None,
            "inlier_pts_src": np.empty((0, 2)),
            "inlier_pts_ref": np.empty((0, 2)),
            "inlier_mask": None,
            "inlier_count": 0,
            "success": False,
            "error_msg": "Homography estimation failed (degenerate points or no consensus)."
        }

    inlier_mask_bool = (mask.ravel() == 1)
    inliers_src = pts_src[inlier_mask_bool]
    inliers_ref = pts_ref[inlier_mask_bool]

    if len(inliers_src) < 4:
        return {
            "registered_image": None,
            "homography": H,
            "inlier_pts_src": inliers_src.reshape(-1, 2),
            "inlier_pts_ref": inliers_ref.reshape(-1, 2),
            "inlier_mask": mask,
            "inlier_count": len(inliers_src),
            "success": False,
            "error_msg": f"Insufficient inliers after RANSAC: {len(inliers_src)} < 4."
        }

    # Step 6: Sub-pixel refinement
    if subpixel_refine and ref_image is not None and len(inliers_ref) >= 4:
        refined_ref = refine_subpixel_points(
            ref_image,
            inliers_ref,
            win_size=(5, 5),
            zero_zone=(-1, -1),
            max_iter=30,
            epsilon=0.001
        )
        refined_src = refine_subpixel_points(
            src_image,
            inliers_src,
            win_size=(5, 5),
            zero_zone=(-1, -1),
            max_iter=30,
            epsilon=0.001
        )
        # Recompute H using refined sub-pixel coordinates
        H_refined, refined_mask = cv2.findHomography(refined_src, refined_ref, cv2.RANSAC, ransac_reproj_thresh)
        if H_refined is not None and refined_mask is not None:
            ref_mask_bool = (refined_mask.ravel() == 1)
            if np.sum(ref_mask_bool) >= 4:
                H = H_refined
                inliers_src = refined_src[ref_mask_bool]
                inliers_ref = refined_ref[ref_mask_bool]
                mask = refined_mask

    # Warp source image to reference coordinates
    ref_h, ref_w = ref_shape[:2]
    registered_image = cv2.warpPerspective(
        src_image,
        H,
        (ref_w, ref_h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0
    )

    return {
        "registered_image": registered_image,
        "homography": H,
        "inlier_pts_src": inliers_src.reshape(-1, 2),
        "inlier_pts_ref": inliers_ref.reshape(-1, 2),
        "inlier_mask": mask,
        "inlier_count": len(inliers_src),
        "success": True,
        "error_msg": ""
    }
