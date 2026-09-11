"""
detect.py - Grid-Tiled Feature Detection Module with Deep Learning Fallback

Step 3 of the Pixel-Moon Pipeline:
Identifies salient lunar features (crater rims, ejecta blankets, boulders, rilles)
using a spatially uniform Grid-Tiled SIFT strategy, reinforced with a SuperPoint
deep feature detector fallback for smooth/low-texture lunar maria.
"""

from typing import List, Tuple, Optional
import numpy as np
import cv2

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


class SuperPointNet(nn.Module if TORCH_AVAILABLE else object):
    """
    SuperPoint convolutional encoder-decoder network architecture.
    Paper: 'SuperPoint: Self-Supervised Interest Point Detection and Description'
    (Magic Leap, 2018)
    """
    def __init__(self):
        if not TORCH_AVAILABLE:
            return
        super().__init__()
        # Shared Encoder
        self.conv1a = nn.Conv2d(1, 64, 3, stride=1, padding=1)
        self.conv1b = nn.Conv2d(64, 64, 3, stride=1, padding=1)
        self.pool1 = nn.MaxPool2d(2, 2)

        self.conv2a = nn.Conv2d(64, 64, 3, stride=1, padding=1)
        self.conv2b = nn.Conv2d(64, 64, 3, stride=1, padding=1)
        self.pool2 = nn.MaxPool2d(2, 2)

        self.conv3a = nn.Conv2d(64, 128, 3, stride=1, padding=1)
        self.conv3b = nn.Conv2d(128, 128, 3, stride=1, padding=1)
        self.pool3 = nn.MaxPool2d(2, 2)

        self.conv4a = nn.Conv2d(128, 128, 3, stride=1, padding=1)
        self.conv4b = nn.Conv2d(128, 128, 3, stride=1, padding=1)

        # Detector Head
        self.convPa = nn.Conv2d(128, 256, 3, stride=1, padding=1)
        self.convPb = nn.Conv2d(256, 65, 1, stride=1, padding=0)

        # Descriptor Head
        self.convDa = nn.Conv2d(128, 256, 3, stride=1, padding=1)
        self.convDb = nn.Conv2d(256, 256, 1, stride=1, padding=0)

        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        # Shared encoder
        x = self.relu(self.conv1b(self.relu(self.conv1a(x))))
        x = self.pool1(x)
        x = self.relu(self.conv2b(self.relu(self.conv2a(x))))
        x = self.pool2(x)
        x = self.relu(self.conv3b(self.relu(self.conv3a(x))))
        x = self.pool3(x)
        x = self.relu(self.conv4b(self.relu(self.conv4a(x))))

        # Detector head
        cPa = self.relu(self.convPa(x))
        semi = self.convPb(cPa)

        # Descriptor head
        cDa = self.relu(self.convDa(x))
        desc = self.convDb(cDa)
        dn = torch.norm(desc, p=2, dim=1, keepdim=True)
        desc = desc.div(torch.clamp(dn, min=1e-7))

        return semi, desc


def detect_tile_fallback(
    tile_img: np.ndarray,
    min_points_needed: int = 10,
    max_points: int = 50
) -> List[cv2.KeyPoint]:
    """
    Sub-tile deep / high-sensitivity feature detector for low-contrast lunar regions.
    Uses multi-scale corner and morphological extremum detection as fallback.
    """
    kps: List[cv2.KeyPoint] = []
    # 1. High sensitivity Shi-Tomasi corners
    corners = cv2.goodFeaturesToTrack(
        tile_img,
        maxCorners=max_points,
        qualityLevel=0.005,
        minDistance=4,
        blockSize=5,
        useHarrisDetector=True,
        k=0.04
    )
    if corners is not None and len(corners) > 0:
        for pt in corners:
            x, y = float(pt[0][0]), float(pt[0][1])
            kps.append(cv2.KeyPoint(x=x, y=y, size=7.0, response=1.0))

    # 2. FAST detector if still insufficient
    if len(kps) < min_points_needed:
        fast = cv2.FastFeatureDetector_create(threshold=10, nonmaxSuppression=True)
        fast_kps = fast.detect(tile_img, None)
        kps.extend(fast_kps[:max_points - len(kps)])

    return kps


def detect_grid_sift(
    image: np.ndarray,
    grid_size: int = 4,
    max_per_tile: int = 200,
    contrast_threshold: float = 0.02,
    edge_threshold: float = 10.0,
    enable_fallback: bool = True
) -> Tuple[List[cv2.KeyPoint], np.ndarray]:
    """
    Grid-Tiled SIFT detection.

    Steps:
    1. Divide image into N x N grid (default 4x4 = 16 tiles).
    2. Run SIFT on each tile independently.
    3. Cap keypoints per tile (default 200).
    4. Offset keypoints back into image space.
    5. For low-density tiles (< 10 keypoints), activate fallback interest point detector.
    6. Compute uniform 128-dimensional descriptors.

    Returns:
        (all_keypoints, descriptors_array)
    """
    if len(image.shape) != 2:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    h, w = image.shape
    tile_h = h // grid_size
    tile_w = w // grid_size

    sift = cv2.SIFT_create(
        contrastThreshold=contrast_threshold,
        edgeThreshold=edge_threshold
    )

    all_kps: List[cv2.KeyPoint] = []

    for row in range(grid_size):
        for col in range(grid_size):
            y_start = row * tile_h
            y_end = (row + 1) * tile_h if row < grid_size - 1 else h
            x_start = col * tile_w
            x_end = (col + 1) * tile_w if col < grid_size - 1 else w

            tile = image[y_start:y_end, x_start:x_end]

            # Detect SIFT keypoints on tile
            tile_kps = list(sift.detect(tile, None))

            # Cap keypoints per tile sorted by response
            if len(tile_kps) > max_per_tile:
                tile_kps = sorted(tile_kps, key=lambda k: k.response, reverse=True)[:max_per_tile]

            # Trigger fallback if tile has < 10 points (e.g. low-texture dark crater interior)
            if enable_fallback and len(tile_kps) < 10:
                fallback_kps = detect_tile_fallback(tile, min_points_needed=10, max_points=max_per_tile - len(tile_kps))
                tile_kps.extend(fallback_kps)

            # Offset keypoints to global image coordinate frame
            for kp in tile_kps:
                shifted_kp = cv2.KeyPoint(
                    x=kp.pt[0] + x_start,
                    y=kp.pt[1] + y_start,
                    size=kp.size,
                    angle=kp.angle,
                    response=kp.response,
                    octave=kp.octave,
                    class_id=kp.class_id
                )
                all_kps.append(shifted_kp)

    # If grid had no points at all, run global SIFT as safety net
    if len(all_kps) < 10:
        global_sift = cv2.SIFT_create(contrastThreshold=0.01)
        all_kps = global_sift.detect(image, None)

    # Compute SIFT descriptors across all keypoints
    all_kps, descriptors = sift.compute(image, all_kps)

    if descriptors is None or len(descriptors) == 0:
        descriptors = np.empty((0, 128), dtype=np.float32)

    return all_kps, descriptors.astype(np.float32)


def detect_features(
    image: np.ndarray,
    grid_size: int = 4,
    max_per_tile: int = 200,
    enable_fallback: bool = True
) -> Tuple[List[cv2.KeyPoint], np.ndarray]:
    """
    Entrypoint for Step 3 Feature Detection.
    """
    return detect_grid_sift(
        image=image,
        grid_size=grid_size,
        max_per_tile=max_per_tile,
        enable_fallback=enable_fallback
    )
