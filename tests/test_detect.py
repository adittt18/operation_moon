"""
Unit tests for Step 3: Feature Detection Module (Grid-Tiled SIFT + Fallback)
"""

import unittest
import numpy as np
import cv2

from src.detect import detect_grid_sift, detect_features


class TestDetect(unittest.TestCase):

    def setUp(self):
        # Create patterned synthetic image with high corner/edge density
        self.img = np.zeros((400, 400), dtype=np.uint8)
        for r in range(20, 380, 40):
            for c in range(20, 380, 40):
                cv2.circle(self.img, (c, r), 12, 220, -1)
                cv2.rectangle(self.img, (c - 5, r - 5), (c + 5, r + 5), 50, -1)

    def test_detect_grid_sift_returns_keypoints_and_descriptors(self):
        kps, descs = detect_features(self.img, grid_size=4, max_per_tile=100)
        self.assertGreater(len(kps), 20)
        self.assertIsNotNone(descs)
        self.assertEqual(len(kps), len(descs))
        self.assertEqual(descs.shape[1], 128)
        self.assertEqual(descs.dtype, np.float32)

    def test_keypoint_coordinates_within_bounds(self):
        kps, _ = detect_features(self.img, grid_size=4, max_per_tile=50)
        for kp in kps:
            x, y = kp.pt
            self.assertGreaterEqual(x, 0.0)
            self.assertLessEqual(x, 400.0)
            self.assertGreaterEqual(y, 0.0)
            self.assertLessEqual(y, 400.0)

    def test_grid_distribution_coverage(self):
        kps, _ = detect_features(self.img, grid_size=4, max_per_tile=50)
        # Verify points are detected in multiple quadrants
        quadrants = set()
        for kp in kps:
            q_x = 0 if kp.pt[0] < 200 else 1
            q_y = 0 if kp.pt[1] < 200 else 1
            quadrants.add((q_x, q_y))
        self.assertEqual(len(quadrants), 4, "Keypoints must be distributed across all quadrants")


if __name__ == "__main__":
    unittest.main()
