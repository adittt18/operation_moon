# Pixel-Moon REST API Documentation

**Service:** Pixel-Moon Multi-Modal Lunar Image Registration API  
**Base URL:** `http://127.0.0.1:8000`  
**OpenAPI Specification:** `http://127.0.0.1:8000/docs`

---

## Endpoints

### 1. Health Check
- **Endpoint:** `GET /health`
- **Description:** Verifies service availability and operational version.
- **Response (200 OK):**
```json
{
  "status": "ok",
  "service": "Pixel-Moon",
  "version": "1.0.0"
}
```

---

### 2. Register Lunar Images
- **Endpoint:** `POST /register`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `source_image` *(file, required)*: Chandrayaan-2 image file (OHRC, TMC-2, or IIRS in PNG, TIFF, FITS, or IMG format).
  - `reference_image` *(file, required)*: NASA LRO NAC reference baseline image.
  - `source_sensor` *(string, optional)*: Manual sensor override (`OHRC`, `TMC-2`, `IIRS`). If omitted, detected automatically.
  - `clip_limit` *(float, optional, default: 2.0)*: CLAHE contrast clip limit.
  - `ransac_thresh` *(float, optional, default: 1.8)*: RANSAC geometric reprojection tolerance in pixels.
  - `subpixel_refine` *(boolean, optional, default: true)*: Applies `cv2.cornerSubPix` refinement on inlier tie points.

- **Response (200 OK):**
```json
{
  "status": "success",
  "sensor": "TMC-2",
  "metrics": {
    "rmse": 0.635,
    "inlier_count": 318,
    "inlier_ratio": 0.7644,
    "grid_coverage": 0.9375
  },
  "compliance": {
    "rmse_passed": true,
    "inlier_count_passed": true,
    "inlier_ratio_passed": true,
    "grid_coverage_passed": true,
    "overall_passed": true
  },
  "targets": {
    "rmse_target": "< 1.0 px",
    "inlier_count_target": "> 100",
    "inlier_ratio_target": "> 0.50",
    "grid_coverage_target": "> 0.75 (12/16)"
  },
  "registered_image_url": "/results/registered_abc123.png",
  "match_map_url": "/results/matchmap_abc123.png",
  "blend_image_url": "/results/blend_abc123.png",
  "source_preprocessed_url": "/results/source_pre_abc123.png",
  "reference_preprocessed_url": "/results/ref_pre_abc123.png",
  "homography": [
    [0.995321, -0.095432, 11.849201],
    [0.095432,  0.995321, -9.920145],
    [0.000001,  0.000002,  1.000000]
  ],
  "details": {
    "source_dimensions": [850, 850],
    "reference_dimensions": [850, 850],
    "keypoints_detected_source": 1547,
    "keypoints_detected_reference": 1032,
    "raw_matches_count": 373,
    "scale_factor_applied": 1.0
  }
}
```

---

### 3. Register Preloaded Sample Pair
- **Endpoint:** `POST /register-sample`
- **Content-Type:** `application/x-www-form-urlencoded`
- **Parameters:**
  - `sample_id` *(string, default: "tmc2")*: Options: `"tmc2"`, `"ohrc"`, `"iirs"`.
  - `clip_limit` *(float, default: 2.0)*
  - `ransac_thresh` *(float, default: 1.8)*
  - `subpixel_refine` *(boolean, default: true)*
- **Response (200 OK):** Identical JSON schema to `POST /register`.

---

### 4. Fetch Result Media
- **Endpoint:** `GET /results/{filename}`
- **Description:** Returns the requested registered image, match map visualization, or checkerboard blend.
- **Response:** Raw binary image stream (`image/png`).

---

### 5. Lunar Imaging Sites
- **Endpoint:** `GET /imaging-sites`
- **Description:** Returns coordinates and metadata for key exploration landmarks visualized on the interactive 3D Moon Globe.
- **Response (200 OK):**
```json
{
  "sites": [
    {
      "id": "site_ch3",
      "name": "Chandrayaan-3 Shiv Shakti Point",
      "lat": -69.373,
      "lon": 32.319,
      "region": "South Pole",
      "description": "Historic soft landing site of Chandrayaan-3 Vikram Lander & Pragyan Rover.",
      "sample_pair": "ohrc"
    },
    {
      "id": "site_tycho",
      "name": "Tycho Crater",
      "lat": -43.31,
      "lon": -11.36,
      "region": "Southern Highlands",
      "description": "Prominent lunar impact crater with extensive ejecta rays.",
      "sample_pair": "tmc2"
    }
  ]
}
```

---

### 6. Available Sample Demonstration Pairs
- **Endpoint:** `GET /sample-pairs`
- **Description:** Returns pre-loaded dataset definitions for instant frontend demonstration.
