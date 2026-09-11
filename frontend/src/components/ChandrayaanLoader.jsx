import React from 'react';

export default function ChandrayaanLoader({ size = 'md', label = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const width = isSm ? 44 : isLg ? 160 : 88;
  const height = isSm ? 28 : isLg ? 100 : 54;

  return (
    <div className={`chandrayaan-topview-loader size-${size}`}>
      <div className="topview-orbit-stage" style={{ width, height }}>
        {/* Top-view Elliptical Orbit Track */}
        <div className="topview-orbit-ellipse" />

        {/* Central Moon Sphere */}
        <div className="topview-moon">
          <div className="topview-crater c1" />
          <div className="topview-crater c2" />
          <div className="topview-crater c3" />
        </div>

        {/* Rotating Carrier on Elliptical Path */}
        <div className="topview-satellite-carrier">
          {/* Top-View Chandrayaan Spacecraft */}
          <div className="topview-satellite">
            <div className="sat-panel left" />
            <div className="sat-core">
              <div className="sat-dish-dot" />
            </div>
            <div className="sat-panel right" />
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
          <span className="loading-badge">CHANDRAYAAN-2 · PIPELINE ORCHESTRATION</span>
          <h3>Sub-Pixel Lunar Image Registration</h3>
          <p className="loading-sub">
            Executing CLAHE illumination normalization, multi-scale grid SIFT extraction, FLANN tie-point matching, and cornerSubPix sub-pixel refinement...
          </p>

          <div className="orbiting-status-pill">
            <span className="pulse-dot" />
            <span>Targeting &lt; 1.0 px RMSE with NASA LRO NAC Reference</span>
          </div>
        </div>
      </div>
    </div>
  );
}

