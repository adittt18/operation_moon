import React from 'react';

export default function ChandrayaanLoader({ size = 'md', label = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const isXl = size === 'xl';
  const dim = isSm ? 32 : isLg ? 160 : isXl ? 220 : 84;

  return (
    <div className={`chandrayaan-topview-loader size-${size}`}>
      <div className="topview-orbit-stage" style={{ width: dim, height: dim }}>
        {/* Top-view Circular Orbit Track */}
        <div className="topview-orbit-circle" />

        {/* Central Moon Sphere */}
        <div className="topview-moon">
          <div className="topview-crater c1" />
          <div className="topview-crater c2" />
          <div className="topview-crater c3" />
        </div>

        {/* Rotating Carrier on Circular Path */}
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

export function RegistrationLoadingModal({ isProcessing }) {
  if (!isProcessing) return null;

  return (
    <div className="loading-modal-backdrop page-fade" role="status" aria-label="Executing Sub-Pixel Registration">
      <ChandrayaanLoader size="xl" />
    </div>
  );
}

