// Built-in offline fallback data for GitHub Pages and static deployments
export const DEMO_SITES = [
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
    "id": "site_ch2",
    "name": "Chandrayaan-2 Landing Search Zone",
    "lat": -70.9,
    "lon": 22.78,
    "region": "Manzinus C & Simpelius N",
    "description": "High-resolution OHRC 25cm coverage area for crater mapping.",
    "sample_pair": "tmc2"
  },
  {
    "id": "site_tycho",
    "name": "Tycho Crater",
    "lat": -43.31,
    "lon": -11.36,
    "region": "Southern Highlands",
    "description": "Prominent lunar impact crater with extensive ejecta rays.",
    "sample_pair": "tmc2"
  },
  {
    "id": "site_shackleton",
    "name": "Shackleton Crater",
    "lat": -89.9,
    "lon": 0.0,
    "region": "Lunar South Pole",
    "description": "Permanently shadowed crater interior rich in water-ice volatiles.",
    "sample_pair": "iirs"
  },
  {
    "id": "site_apollo11",
    "name": "Mare Tranquillitatis (Apollo 11)",
    "lat": 0.674,
    "lon": 23.473,
    "region": "Lunar Maria",
    "description": "First human lunar landing site, basaltic mare regolith.",
    "sample_pair": "tmc2"
  }
];

export const DEMO_SAMPLE_RESULTS = {
  "tmc2": {
    "status": "success",
    "sensor": "TMC-2",
    "metrics": {
      "rmse": 0.7667,
      "inlier_count": 265,
      "inlier_ratio": 0.637,
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
    "registered_image_url": "/results/registered_0143af7a.png",
    "match_map_url": "/results/matchmap_0143af7a.png",
    "blend_image_url": "/results/blend_0143af7a.png",
    "source_preprocessed_url": "/results/source_pre_0143af7a.png",
    "reference_preprocessed_url": "/results/ref_pre_0143af7a.png",
    "homography": [
      [
        0.9767865823901452,
        -0.09432171416891039,
        37.73442863077578
      ],
      [
        0.09477439333767639,
        0.9749615537605402,
        -21.225125432104218
      ],
      [
        2.255803442423049e-06,
        -1.9235035367420203e-06,
        0.9999999999999999
      ]
    ],
    "details": {
      "source_dimensions": [
        850,
        850
      ],
      "reference_dimensions": [
        850,
        850
      ],
      "keypoints_detected_source": 1477,
      "keypoints_detected_reference": 1067,
      "raw_matches_count": 416,
      "scale_factor_applied": 1.0
    }
  },
  "ohrc": {
    "status": "success",
    "sensor": "OHRC",
    "metrics": {
      "rmse": 0.8091,
      "inlier_count": 84,
      "inlier_ratio": 0.4221,
      "grid_coverage": 0.9375
    },
    "compliance": {
      "rmse_passed": true,
      "inlier_count_passed": false,
      "inlier_ratio_passed": false,
      "grid_coverage_passed": true,
      "overall_passed": false
    },
    "targets": {
      "rmse_target": "< 1.0 px",
      "inlier_count_target": "> 100",
      "inlier_ratio_target": "> 0.50",
      "grid_coverage_target": "> 0.75 (12/16)"
    },
    "registered_image_url": "/results/registered_8e83c6a3.png",
    "match_map_url": "/results/matchmap_8e83c6a3.png",
    "blend_image_url": "/results/blend_8e83c6a3.png",
    "source_preprocessed_url": "/results/source_pre_8e83c6a3.png",
    "reference_preprocessed_url": "/results/ref_pre_8e83c6a3.png",
    "homography": [
      [
        3.921225543366061,
        -0.3776790160836957,
        38.39345812005943
      ],
      [
        0.38120443368029266,
        3.9145231391354636,
        -20.74261457632184
      ],
      [
        1.2812283828131523e-05,
        -1.6039777702872726e-06,
        1.0
      ]
    ],
    "details": {
      "source_dimensions": [
        212,
        212
      ],
      "reference_dimensions": [
        850,
        850
      ],
      "keypoints_detected_source": 497,
      "keypoints_detected_reference": 1067,
      "raw_matches_count": 199,
      "scale_factor_applied": 0.25
    }
  },
  "iirs": {
    "status": "success",
    "sensor": "IIRS",
    "metrics": {
      "rmse": 0.7997,
      "inlier_count": 171,
      "inlier_ratio": 0.5534,
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
    "registered_image_url": "/results/registered_80f08ae0.png",
    "match_map_url": "/results/matchmap_80f08ae0.png",
    "blend_image_url": "/results/blend_80f08ae0.png",
    "source_preprocessed_url": "/results/source_pre_80f08ae0.png",
    "reference_preprocessed_url": "/results/ref_pre_80f08ae0.png",
    "homography": [
      [
        0.24435538969035386,
        -0.023612878794043,
        37.395094200234404
      ],
      [
        0.02374368361082912,
        0.24391380837794904,
        -21.771956245138494
      ],
      [
        4.760333499108937e-07,
        -2.6241282687614246e-07,
        0.9999999999999999
      ]
    ],
    "details": {
      "source_dimensions": [
        3400,
        3400
      ],
      "reference_dimensions": [
        850,
        850
      ],
      "keypoints_detected_source": 1158,
      "keypoints_detected_reference": 1067,
      "raw_matches_count": 309,
      "scale_factor_applied": 4.0
    }
  }
};
