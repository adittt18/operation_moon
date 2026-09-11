"""
Unit tests for Step 2: Preprocessing Module (CLAHE, Grayscale, Resolution Harmonisation)
"""

import unittest
import numpy as np
import cv2

from src.preprocess import (
    to_grayscale,
    extract_iirs_band,
    apply_clahe,
    harmonise_resolution,
    preprocess_image
)


class TestPreprocess(unittest.TestCase):

    def test_to_grayscale_bgr(self):
        color_img = np.zeros((100, 100, 3), dtype=np.uint8)
        color_img[:, :, 0] = 255  # Blue
        gray = to_grayscale(color_img)
        self.assertEqual(gray.ndim, 2)
        self.assertEqual(gray.shape, (100, 100))
        self.assertEqual(gray.dtype, np.uint8)

    def test_to_grayscale_float(self):
        float_img = np.random.rand(50, 50).astype(np.float32)
        gray = to_grayscale(float_img)
        self.assertEqual(gray.dtype, np.uint8)
        self.assertEqual(gray.shape, (50, 50))
        self.assertTrue(0 <= gray.min() <= gray.max() <= 255)

    def test_extract_iirs_band(self):
        cube = np.zeros((64, 64, 100), dtype=np.uint8)
        cube[:, :, 60] = 180
        band = extract_iirs_band(cube, preferred_band=60)
        self.assertEqual(band.shape, (64, 64))
        self.assertEqual(band[0, 0], 180)

    def test_clahe_enhances_contrast(self):
        # Low contrast gradient
        low_contrast = np.full((128, 128), 100, dtype=np.uint8)
        low_contrast[32:96, 32:96] = 110
        enhanced = apply_clahe(low_contrast, clip_limit=2.0)
        self.assertEqual(enhanced.shape, (128, 128))
        self.assertGreater(int(enhanced.max()) - int(enhanced.min()), 10)

    def test_resolution_harmonise_tmc2(self):
        img = np.zeros((200, 200), dtype=np.uint8)
        harmonised, scale = harmonise_resolution(img, sensor="TMC-2")
        self.assertAlmostEqual(scale, 1.0, places=2)
        self.assertEqual(harmonised.shape, (200, 200))

    def test_resolution_harmonise_iirs(self):
        img = np.zeros((100, 100), dtype=np.uint8)
        harmonised, scale = harmonise_resolution(img, sensor="IIRS")
        self.assertGreater(scale, 1.0)
        self.assertGreater(harmonised.shape[0], 100)

    def test_preprocess_image_pipeline(self):
        test_img = np.random.randint(0, 256, (120, 120, 3), dtype=np.uint8)
        ready, scale = preprocess_image(test_img, sensor="TMC-2")
        self.assertEqual(ready.ndim, 2)
        self.assertEqual(ready.shape, (120, 120))


if __name__ == "__main__":
    unittest.main()
