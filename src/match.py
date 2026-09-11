"""
match.py - Multi-Scale Feature Matching Module with Lowe's Ratio Test

Step 4 of the Pixel-Moon Pipeline:
Matches keypoint descriptors between Chandrayaan-2 source images and LRO NAC reference
imagery using Fast Library for Approximate Nearest Neighbors (FLANN), Lowe's ratio test,
and multi-scale consistency search.
"""

from typing import List, Tuple, Optional
import numpy as np
import cv2


def create_flann_matcher(is_binary: bool = False) -> cv2.FlannBasedMatcher:
    """
    Create FLANN matcher configured with KDTree index for float descriptors (SIFT)
    or LSH index for binary descriptors (ORB/BRIEF).
    """
    if is_binary:
        index_params = dict(
            algorithm=6,  # FLANN_INDEX_LSH
            table_number=6,
            key_size=12,
            multi_probe_level=1
        )
        search_params = dict(checks=50)
    else:
        index_params = dict(
            algorithm=1,  # FLANN_INDEX_KDTREE
            trees=5
        )
        search_params = dict(checks=50)

    return cv2.FlannBasedMatcher(index_params, search_params)


def filter_lowe_ratio(
    knn_matches: List[List[cv2.DMatch]],
    ratio_threshold: float = 0.75
) -> List[cv2.DMatch]:
    """
    Apply David Lowe's ratio test:
    Keeps match only if distance[0] < ratio_threshold * distance[1].
    Eliminates false matches in repetitive lunar terrains (crater rims, regolith).
    """
    good_matches: List[cv2.DMatch] = []
    for m_pair in knn_matches:
        if len(m_pair) == 2:
            m, n = m_pair[0], m_pair[1]
            if m.distance < ratio_threshold * n.distance:
                good_matches.append(m)
        elif len(m_pair) == 1:
            good_matches.append(m_pair[0])
    return good_matches


def match_descriptors(
    des_src: np.ndarray,
    des_ref: np.ndarray,
    ratio_threshold: float = 0.75
) -> List[cv2.DMatch]:
    """
    Perform FLANN kNN (k=2) matching and apply Lowe's ratio test.
    """
    if des_src is None or des_ref is None or len(des_src) < 2 or len(des_ref) < 2:
        return []

    matcher = create_flann_matcher(is_binary=False)
    # Ensure float32 for KDTree
    des_src_f = des_src.astype(np.float32)
    des_ref_f = des_ref.astype(np.float32)

    try:
        raw_matches = matcher.knnMatch(des_src_f, des_ref_f, k=2)
        good = filter_lowe_ratio(raw_matches, ratio_threshold=ratio_threshold)
        return good
    except Exception:
        # Fallback to BFMatcher if FLANN encounters dimensionality mismatch
        bf = cv2.BFMatcher(cv2.NORM_L2)
        raw_matches = bf.knnMatch(des_src_f, des_ref_f, k=2)
        return filter_lowe_ratio(raw_matches, ratio_threshold=ratio_threshold)


def match_features_multiscale(
    kp_src: List[cv2.KeyPoint],
    des_src: np.ndarray,
    kp_ref: List[cv2.KeyPoint],
    des_ref: np.ndarray,
    scales: List[float] = [0.75, 1.0, 1.25, 1.5],
    ratio_threshold: float = 0.75,
    ransac_thresh: float = 3.0
) -> Tuple[List[cv2.DMatch], float]:
    """
    Multi-scale matching across candidate scale factors [0.75, 1.0, 1.25, 1.5].
    Evaluates geometric consistency with RANSAC at each candidate scale,
    and returns matches corresponding to the scale with highest inlier count.

    Returns:
        (best_matches, best_scale)
    """
    if len(kp_src) < 4 or len(kp_ref) < 4 or des_src is None or des_ref is None:
        return [], 1.0

    # Base scale matching
    base_matches = match_descriptors(des_src, des_ref, ratio_threshold=ratio_threshold)
    if len(base_matches) < 4:
        return base_matches, 1.0

    best_scale = 1.0
    best_matches = base_matches
    max_inliers = 0

    # Test baseline inliers
    pts_src = np.float32([kp_src[m.queryIdx].pt for m in base_matches]).reshape(-1, 1, 2)
    pts_ref = np.float32([kp_ref[m.trainIdx].pt for m in base_matches]).reshape(-1, 1, 2)
    _, inlier_mask = cv2.findHomography(pts_src, pts_ref, cv2.RANSAC, ransac_thresh)
    if inlier_mask is not None:
        max_inliers = int(np.sum(inlier_mask))

    # Evaluate across alternative scales if base inliers are modest
    for scale in scales:
        if abs(scale - 1.0) < 1e-3:
            continue

        # Scale source coordinates by candidate factor to test geometric fit
        scaled_src = pts_src * scale
        try:
            _, mask = cv2.findHomography(scaled_src, pts_ref, cv2.RANSAC, ransac_thresh)
            if mask is not None:
                inlier_cnt = int(np.sum(mask))
                if inlier_cnt > max_inliers:
                    max_inliers = inlier_cnt
                    best_scale = scale
        except Exception:
            continue

    return best_matches, best_scale


def match_features(
    kp_src: List[cv2.KeyPoint],
    des_src: np.ndarray,
    kp_ref: List[cv2.KeyPoint],
    des_ref: np.ndarray,
    ratio_threshold: float = 0.75,
    use_multiscale: bool = True
) -> List[cv2.DMatch]:
    """
    Entrypoint for Step 4 Feature Matching.
    """
    if use_multiscale:
        matches, _ = match_features_multiscale(
            kp_src, des_src, kp_ref, des_ref,
            ratio_threshold=ratio_threshold
        )
        return matches
    else:
        return match_descriptors(des_src, des_ref, ratio_threshold=ratio_threshold)
