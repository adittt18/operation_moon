import React from 'react';

export default function ChandrayaanLoader({ size = 'md', label = '' }) {
  const pixelSize = size === 'sm' ? 24 : size === 'lg' ? 84 : 48;
  const scale = pixelSize / 48;

  return (
    <div className={`chandrayaan-loader-wrap size-${size}`}>
      <div
        className="chandrayaan-stage"
        style={{ width: pixelSize, height: pixelSize }}
      >
        {/* Orbit Ring */}
        <div className="lunar-orbit-ring" />

        {/* Central Moon Sphere */}
        <div className="lunar-center-moon">
          <div className="moon-crater c1" />
          <div className="moon-crater c2" />
          <div className="moon-crater c3" />
          <div className="moon-shadow" />
        </div>

        {/* Rotating Orbit Container */}
        <div className="chandrayaan-orbit-carrier">
          {/* Chandrayaan Spacecraft */}
          <div className="chandrayaan-craft">
            <div className="craft-panel left" />
            <div className="craft-body" />
            <div className="craft-panel right" />
            <div className="craft-dish" />
          </div>
        </div>
      </div>
      {label && <span className="loader-label">{label}</span>}
    </div>
  );
}

export function RegistrationLoadingModal({ isProcessing, sensor = 'Chandrayaan-2' }) {
  if (!isProcessing) return null;

  return (
    <div className="loading-modal-backdrop page-fade">
      <div className="loading-modal-card glass-card">
        <ChandrayaanLoader size="lg" />
        <div className="loading-modal-content">
          <span className="loading-badge">CHANDRAYAAN-2 · PIPELINE RUNNING</span>
          <h3>Sub-Pixel Lunar Image Registration</h3>
          <p className="loading-sub">
            Harmonizing sensor scales, detecting 4×4 SIFT features, computing FLANN KDTree matches &amp; refining homography with cornerSubPix...
          </p>

          <div className="orbiting-status-pill">
            <span className="pulse-dot" />
            <span>Aligning with NASA LRO NAC Reference</span>
          </div>
        </div>
      </div>
    </div>
  );
}
