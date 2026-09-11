"""
Unit tests for Step 5 & 6: Alignment, Sub-pixel Refinement, and Metrics Module
"""

import unittest
import numpy as np
import cv2

from src.align import estimate_homography_and_align
from src.metrics import compute_rmse, compute_grid_coverage, evaluate_registration


class TestAlignAndMetrics(unittest.TestCase):

    def setUp(self):
        # Create a base patterned lunar image
        self.img_ref = np.zeros((300, 300), dtype=np.uint8)
        for i in range(20, 280, 30):
            for j in range(20, 280, 30):
                cv2.circle(self.img_ref, (j, i), 10, 200, -1)

        # Ground truth transformation: translation + slight rotation
        theta = np.radians(3.0)
        c, s = np.cos(theta), np.sin(theta)
        self.H_true = np.array([
            [c, -s, 8.0],
            [s,  c, -5.0],
            [0.0, 0.0, 1.0]
        ], dtype=np.float32)

        self.img_src = cv2.warpPerspective(self.img_ref, np.linalg.inv(self.H_true), (300, 300))

    def test_rmse_calculation(self):
        pts_src = np.array([[10.0, 10.0], [50.0, 50.0], [100.0, 100.0]], dtype=np.float32)
        # Identity homography with 0.5px offset
        H = np.eye(3, dtype=np.float32)
        pts_ref = pts_src + 0.5
        rmse = compute_rmse(pts_src, pts_ref, H)
        expected_rmse = np.sqrt(0.5**2 + 0.5**2)
        self.assertAlmostEqual(rmse, round(expected_rmse, 4), places=3)

    def test_grid_coverage_all_cells(self):
        # 16 points, one in each of the 4x4 cells
        grid_pts = []
        for r in range(4):
            for c in range(4):
                grid_pts.append([c * 50 + 25, r * 50 + 25])
        pts = np.array(grid_pts, dtype=np.float32)
        cov, filled, total = compute_grid_coverage(pts, (200, 200), grid_n=4)
        self.assertEqual(filled, 16)
        self.assertEqual(total, 16)
        self.assertEqual(cov, 1.0)

    def test_evaluate_registration_targets(self):
        # Test meeting targets
        pts_src = np.random.uniform(20, 280, (120, 2)).astype(np.float32)
        H = np.eye(3, dtype=np.float32)
        pts_ref = pts_src + np.random.normal(0, 0.2, (120, 2)).astype(np.float32)

        res = evaluate_registration(
            inlier_pts_src=pts_src,
            inlier_pts_ref=pts_ref,
            H=H,
            total_good_matches=150,
            image_shape=(300, 300)
        )
        self.assertLess(res["rmse"], 1.0)
        self.assertGreater(res["inlier_count"], 100)
        self.assertGreater(res["inlier_ratio"], 0.50)
        self.assertTrue(res["compliance"]["overall_passed"])


if __name__ == "__main__":
    unittest.main()
