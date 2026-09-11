"""
Integration tests for Step 7: End-to-End Pipeline Orchestration
"""

import os
import unittest
import numpy as np
import cv2

from src.ingest import detect_sensor_from_path, ingest_image, SENSOR_OHRC, SENSOR_TMC2, SENSOR_IIRS, SENSOR_LRO_NAC
from src.pipeline import run_registration_pipeline


class TestPipelineIntegration(unittest.TestCase):

    def test_sensor_name_detection(self):
        self.assertEqual(detect_sensor_from_path("data/ch2_ohr_202008.tif"), SENSOR_OHRC)
        self.assertEqual(detect_sensor_from_path("data/tmc2_stereo_orbit12.png"), SENSOR_TMC2)
        self.assertEqual(detect_sensor_from_path("data/iirs_cube_swir.img"), SENSOR_IIRS)
        self.assertEqual(detect_sensor_from_path("data/lro_nac_ref.png"), SENSOR_LRO_NAC)

    def test_end_to_end_registration_success(self):
        source_img = "data/source/chandrayaan2_tmc2_crater_tycho.png"
        ref_img = "data/reference/lro_nac_tycho_ref.png"

        if not os.path.exists(source_img) or not os.path.exists(ref_img):
            self.skipTest("Sample dataset not generated yet")

        results = run_registration_pipeline(
            source_path=source_img,
            reference_path=ref_img,
            output_dir="results_test",
            ransac_thresh=1.8,
            subpixel_refine=True
        )

        self.assertEqual(results["status"], "success")
        self.assertIn("metrics", results)
        metrics = results["metrics"]

        # Validate against ISRO / SIH criteria
        self.assertLess(metrics["rmse"], 1.0, f"RMSE {metrics['rmse']} must be < 1.0 px")
        self.assertGreater(metrics["inlier_count"], 100, f"Inlier count {metrics['inlier_count']} must be > 100")
        self.assertGreater(metrics["inlier_ratio"], 0.50, f"Inlier ratio {metrics['inlier_ratio']} must be > 0.50")
        self.assertGreaterEqual(metrics["grid_coverage"], 0.75, f"Grid coverage {metrics['grid_coverage']} must be >= 0.75")

        # Verify artifacts exist
        self.assertTrue(os.path.exists(results["artifacts"]["registered_image_path"]))
        self.assertTrue(os.path.exists(results["artifacts"]["match_map_path"]))


if __name__ == "__main__":
    unittest.main()
