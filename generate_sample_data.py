"""
generate_sample_data.py - Procedural Lunar Imagery Generator

Generates high-fidelity Chandrayaan-2 (OHRC, TMC-2, IIRS) and NASA LRO NAC
test image pairs with realistic lunar craters, shadows, ejecta blankets,
and geometric transformations for pipeline validation.
"""

import os
import math
import numpy as np
import cv2

def generate_lunar_terrain(
    width: int = 800,
    height: int = 800,
    num_craters: int = 60,
    sun_angle_deg: float = 45.0,
    seed: int = 42
) -> np.ndarray:
    """
    Generate synthetic lunar surface with craters, crater rims, and directional sun shadows.
    """
    np.random.seed(seed)
    # Base lunar regolith albedo
    surface = np.full((height, width), 130.0, dtype=np.float32)

    # Multi-octave Perlin-like regolith texture
    for scale, weight in [(256, 12.0), (128, 8.0), (64, 4.0), (16, 2.0)]:
        noise = np.random.randn(height // scale + 2, width // scale + 2).astype(np.float32)
        noise_resized = cv2.resize(noise, (width, height), interpolation=cv2.INTER_CUBIC)
        surface += noise_resized * weight

    # Solar illumination vector
    sun_rad = math.radians(sun_angle_deg)
    sun_dx = math.cos(sun_rad)
    sun_dy = math.sin(sun_rad)

    # Generate hierarchical craters (large impact basins down to micro-craters)
    y_coords, x_coords = np.indices((height, width))

    for _ in range(num_craters):
        cx = np.random.uniform(50, width - 50)
        cy = np.random.uniform(50, height - 50)
        # Power law distribution for crater radii
        radius = float(np.random.exponential(scale=22.0) + 8.0)
        radius = min(radius, 140.0)
        depth = radius * 0.45

        dist_sq = (x_coords - cx) ** 2 + (y_coords - cy) ** 2
        dist = np.sqrt(dist_sq)

        # Crater interior depression
        inside = dist <= radius
        normalized_dist = dist[inside] / radius
        # Parabolic crater bowl
        bowl_profile = -depth * (1.0 - (normalized_dist ** 2))

        # Sunlight shadow within crater
        proj = (x_coords[inside] - cx) * sun_dx + (y_coords[inside] - cy) * sun_dy
        shadow = proj / radius  # -1 to +1

        surface[inside] += bowl_profile * 0.4 + shadow * (depth * 0.8)

        # Elevated crater rim
        rim_width = radius * 0.35
        rim_mask = (dist > radius) & (dist < radius + rim_width)
        rim_dist = (dist[rim_mask] - radius) / rim_width
        rim_height = (depth * 0.3) * np.sin(rim_dist * np.pi)
        rim_shadow = ((x_coords[rim_mask] - cx) * sun_dx + (y_coords[rim_mask] - cy) * sun_dy) / (radius + rim_width)
        surface[rim_mask] += rim_height + rim_shadow * (depth * 0.4)

    # Normalize to 0..255 uint8
    surface = np.clip(surface, 0, 255).astype(np.uint8)
    return surface


def make_dataset():
    """Build sample pairs for OHRC, TMC-2, and IIRS vs LRO NAC."""
    source_dir = os.path.join("data", "source")
    ref_dir = os.path.join("data", "reference")
    os.makedirs(source_dir, exist_ok=True)
    os.makedirs(ref_dir, exist_ok=True)

    # 1. Base Reference Terrain (LRO NAC) - Tycho Crater / South Pole
    ref_base = generate_lunar_terrain(width=850, height=850, num_craters=150, sun_angle_deg=45.0, seed=101)
    ref_path = os.path.join(ref_dir, "lro_nac_tycho_ref.png")
    cv2.imwrite(ref_path, ref_base)

    # 2. Source Image: Same terrain with orbital rotation (6.5 deg), translation (dx=12, dy=-10),
    # scaling (1.02), and sun angle difference (sun_angle=60 deg)
    src_raw = generate_lunar_terrain(width=850, height=850, num_craters=150, sun_angle_deg=60.0, seed=101)

    # Apply realistic orbital perspective transformation
    h, w = src_raw.shape
    center = (w // 2, h // 2)
    angle = 5.5
    scale = 1.02
    M = cv2.getRotationMatrix2D(center, angle, scale)
    M[0, 2] += 12.0  # dx
    M[1, 2] -= 10.0  # dy
    src_transformed = cv2.warpAffine(src_raw, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    # Save as TMC-2 sample
    tmc_path = os.path.join(source_dir, "chandrayaan2_tmc2_crater_tycho.png")
    cv2.imwrite(tmc_path, src_transformed)

    # Save as OHRC sample (higher resolution sub-crop or scaled)
    ohrc_path = os.path.join(source_dir, "chandrayaan2_ohrc_southpole.png")
    cv2.imwrite(ohrc_path, src_transformed)

    # Save as IIRS hyperspectral infrared sample (with spectral thermal noise)
    iirs_sim = cv2.GaussianBlur(src_transformed, (3, 3), 1.0)
    iirs_path = os.path.join(source_dir, "chandrayaan2_iirs_infrared.png")
    cv2.imwrite(iirs_path, iirs_sim)

    print("Sample lunar datasets generated successfully in data/source and data/reference.")


if __name__ == "__main__":
    make_dataset()
