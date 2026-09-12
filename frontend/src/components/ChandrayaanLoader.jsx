import React from 'react';

export default function ChandrayaanLoader({ size = 'md', label = '' }) {
  const isSm = size === 'sm';
  const isSpinner = size === 'spinner';
  const isModal = size === 'modal';
  const isLg = size === 'lg';
  const isXl = size === 'xl';
  // Modal size for clean floating upload loader is 120px; sm is 26px; lg is 130px; md is 76px
  const dim = isSm ? 26 : isSpinner ? 64 : isModal ? 120 : isLg ? 130 : isXl ? 180 : 76;

  return (
    <div className={`chandrayaan-mature-loader size-${size}`} style={{ width: dim, height: dim }}>
      <svg
        viewBox="0 0 280 280"
        width={dim}
        height={dim}
        className="mature-loader-svg"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Authentic Golden MLI Thermal Insulation Foil Gradients */}
          <linearGradient id={`goldFoilTop-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id={`goldFoilFront-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* High-Efficiency Space Photovoltaic Solar Cells */}
          <linearGradient id={`solarCell-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="45%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          {/* High-Gain Parabolic Dish Reflector */}
          <radialGradient id={`dishGrad-${size}`} cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>

          {/* Orbit Soft Glow */}
          <filter id={`orbitGlow-${size}`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#38bdf8" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* 1. Circular Orbit Track (True Circle, Thicker Lining, Realistic and Close to the Moon) */}
        <circle
          cx="140"
          cy="140"
          r="72"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.8"
          strokeOpacity="0.82"
          strokeDasharray="14 3 3 3"
          filter={`url(#orbitGlow-${size})`}
        />

        {/* 2. Central Moon: High-res authentic Lunar PNG provided by user with soft atmospheric rim */}
        <g className="mature-moon">
          <image
            href="/real_moon.png"
            x="86"
            y="86"
            width="108"
            height="108"
            preserveAspectRatio="xMidYMid meet"
          />
          {/* Subtle atmospheric boundary rim */}
          <circle
            cx="140"
            cy="140"
            r="54"
            fill="none"
            stroke="rgba(56, 189, 248, 0.28)"
            strokeWidth="1.2"
          />
        </g>

        {/* 3. Orbiting 3D Workable Chandrayaan Satellite (Low Lunar Orbit R=72, Open/Close Solar Panels) */}
        <g className="mature-satellite-orbit-carrier">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 140 140"
            to="360 140 140"
            dur="4.6s"
            repeatCount="indefinite"
          />
          {/* Positioned directly ON the orbit circle r=72 at (140, 68) with 3D scaling */}
          <g transform="translate(140, 68) scale(1.18)">
            
            {/* Parabolic High-Gain Dish Antenna (HGA) mounted on articulated mast facing space */}
            <line x1="0" y1="-8" x2="-2.5" y2="-14" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
            <ellipse cx="-2.5" cy="-14" rx="5.8" ry="3.4" transform="rotate(-20 -2.5 -14)" fill={`url(#dishGrad-${size})`} stroke="#64748b" strokeWidth="0.8" />
            <circle cx="-2.5" cy="-14" r="1.1" fill="#f8fafc" />

            {/* LEFT SOLAR WING: Articulated 2-Stage Multi-Hinge Panels that Open & Close */}
            <g className="sat-wing-left-root" transform="translate(-8.5, 0)">
              {/* Inner Wing Panel (Hinged at satellite bus) */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1 1; 1 1; 0.20 0.88; 0.20 0.88; 1 1; 1 1"
                  keyTimes="0; 0.24; 0.46; 0.64; 0.86; 1"
                  dur="4.6s"
                  repeatCount="indefinite"
                />
                {/* Hinge Pin */}
                <rect x="-1" y="-2" width="1.5" height="4" rx="0.5" fill="#94a3b8" />
                {/* Inner Panel Chassis & Photovoltaic Solar Cells */}
                <rect x="-12.5" y="-8" width="12.5" height="16" rx="1" fill="#0b172d" stroke="#d97706" strokeWidth="0.8" />
                <rect x="-11.5" y="-7" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                <rect x="-11.5" y="0.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                <rect x="-5.5" y="-7" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                <rect x="-5.5" y="0.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                <line x1="-12" y1="0" x2="-0.5" y2="0" stroke="rgba(147,197,253,0.75)" strokeWidth="0.5" />

                {/* Outer Wing Panel (Hinged to inner panel at -12.5) */}
                <g transform="translate(-12.5, 0)">
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      values="1 1; 1 1; 0.10 0.78; 0.10 0.78; 1 1; 1 1"
                      keyTimes="0; 0.22; 0.48; 0.62; 0.88; 1"
                      dur="4.6s"
                      repeatCount="indefinite"
                    />
                    {/* Hinge Pin */}
                    <rect x="-1" y="-1.5" width="1.5" height="3" rx="0.4" fill="#cbd5e1" />
                    {/* Outer Panel Chassis & Solar Cells */}
                    <rect x="-12.5" y="-8" width="12.5" height="16" rx="1" fill="#091325" stroke="#d97706" strokeWidth="0.8" />
                    <rect x="-11.5" y="-7" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                    <rect x="-11.5" y="0.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                    <rect x="-5.5" y="-7" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                    <rect x="-5.5" y="0.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                    <line x1="-12" y1="0" x2="-0.5" y2="0" stroke="rgba(147,197,253,0.75)" strokeWidth="0.5" />
                  </g>
                </g>
              </g>
            </g>

            {/* RIGHT SOLAR WING: Articulated 2-Stage Multi-Hinge Panels that Open & Close */}
            <g className="sat-wing-right-root" transform="translate(8.5, 0)">
              {/* Inner Wing Panel (Hinged at satellite bus) */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1 1; 1 1; 0.20 0.88; 0.20 0.88; 1 1; 1 1"
                  keyTimes="0; 0.24; 0.46; 0.64; 0.86; 1"
                  dur="4.6s"
                  repeatCount="indefinite"
                />
                {/* Hinge Pin */}
                <rect x="-0.5" y="-2" width="1.5" height="4" rx="0.5" fill="#94a3b8" />
                {/* Inner Panel Chassis & Photovoltaic Solar Cells */}
                <rect x="0" y="-8" width="12.5" height="16" rx="1" fill="#0b172d" stroke="#d97706" strokeWidth="0.8" />
                <rect x="1" y="-7" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                <rect x="1" y="0.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                <rect x="7" y="-7" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                <rect x="7" y="0.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                <line x1="0.5" y1="0" x2="12" y2="0" stroke="rgba(147,197,253,0.75)" strokeWidth="0.5" />

                {/* Outer Wing Panel (Hinged to inner panel at +12.5) */}
                <g transform="translate(12.5, 0)">
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      values="1 1; 1 1; 0.10 0.78; 0.10 0.78; 1 1; 1 1"
                      keyTimes="0; 0.22; 0.48; 0.62; 0.88; 1"
                      dur="4.6s"
                      repeatCount="indefinite"
                    />
                    {/* Hinge Pin */}
                    <rect x="-0.5" y="-1.5" width="1.5" height="3" rx="0.4" fill="#cbd5e1" />
                    {/* Outer Panel Chassis & Solar Cells */}
                    <rect x="0" y="-8" width="12.5" height="16" rx="1" fill="#091325" stroke="#d97706" strokeWidth="0.8" />
                    <rect x="1" y="-7" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                    <rect x="1" y="0.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                    <rect x="7" y="-7" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                    <rect x="7" y="0.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
                    <line x1="0.5" y1="0" x2="12" y2="0" stroke="rgba(147,197,253,0.75)" strokeWidth="0.5" />
                  </g>
                </g>
              </g>
            </g>

            {/* Central 3D Satellite Bus Body (Golden MLI Thermal Blanket with 3D Depth) */}
            <rect x="-8.5" y="-8.5" width="17" height="17" rx="2" fill={`url(#goldFoilFront-${size})`} stroke="#78350f" strokeWidth="0.8" />
            {/* Top 3D Bevel Plate */}
            <polygon points="-8.5,-8.5 8.5,-8.5 6.5,-5.5 -6.5,-5.5" fill={`url(#goldFoilTop-${size})`} />
            {/* MLI Quilted Structural Seams */}
            <line x1="-8" y1="-1" x2="8" y2="-1" stroke="rgba(120,53,15,0.4)" strokeWidth="0.6" />
            <line x1="-2" y1="-8" x2="-2" y2="8" stroke="rgba(120,53,15,0.4)" strokeWidth="0.6" />
            <line x1="3" y1="-8" x2="3" y2="8" stroke="rgba(120,53,15,0.4)" strokeWidth="0.6" />

            {/* Attitude Control Reaction Thruster Pods (4 corners) */}
            <circle cx="-8.5" cy="-8.5" r="1.3" fill="#475569" stroke="#94a3b8" strokeWidth="0.4" />
            <circle cx="8.5" cy="-8.5" r="1.3" fill="#475569" stroke="#94a3b8" strokeWidth="0.4" />
            <circle cx="-8.5" cy="8.5" r="1.3" fill="#475569" stroke="#94a3b8" strokeWidth="0.4" />
            <circle cx="8.5" cy="8.5" r="1.3" fill="#475569" stroke="#94a3b8" strokeWidth="0.4" />

            {/* Optical Science Payload: OHRC & TMC-2 Lenses (Facing down toward Moon) */}
            <circle cx="-2.8" cy="5.8" r="2.8" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.6" />
            <circle cx="-2.8" cy="5.8" r="1.9" fill="#0284c7" />
            <circle cx="-3.4" cy="5.2" r="0.6" fill="#ffffff" fillOpacity="0.9" />

            <circle cx="3" cy="5.8" r="2.1" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="3" cy="5.8" r="1.4" fill="#0369a1" />

            {/* Real-time Sub-Pixel Optical Science Beacon */}
            <circle cx="0.1" cy="9.2" r="1.1" fill="#38bdf8">
              <animate attributeName="opacity" values="1; 0.2; 1" dur="1s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      </svg>
      {label && <span className="loader-label">{label}</span>}
    </div>
  );
}

export function RegistrationLoadingModal({ isProcessing, processingType = 'upload' }) {
  if (!isProcessing) return null;

  // For "RUN REGISTRATION" (Home tab / sample select): Reverted to original detailed card modal
  if (processingType === 'sample') {
    return (
      <div className="loading-modal-backdrop page-fade" role="status" aria-label="Running Registration Pipeline">
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

  // For "EXECUTE SUB-PIXEL REGISTRATION" (Upload tab): Clean floating Moon & 3D workable satellite loader
  return (
    <div className="loading-modal-backdrop page-fade" role="status" aria-label="Executing Sub-Pixel Registration">
      <div className="clean-floating-loader-wrap">
        <ChandrayaanLoader size="modal" />
      </div>
    </div>
  );
}
