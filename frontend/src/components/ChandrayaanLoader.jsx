import React from 'react';

export default function ChandrayaanLoader({ size = 'md', label = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const isXl = size === 'xl';
  const dim = isSm ? 30 : isLg ? 160 : isXl ? 250 : 80;

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
          {/* Spherical Lunar Regolith Radial Gradient */}
          <radialGradient id={`moonShade-${size}`} cx="35%" cy="32%" r="62%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="42%" stopColor="#94a3b8" />
            <stop offset="82%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>

          {/* Authentic Golden MLI Thermal Insulation Foil */}
          <linearGradient id={`goldFoil-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#f59e0b" />
            <stop offset="68%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* High-Efficiency Space Photovoltaic Solar Cells */}
          <linearGradient id={`solarCell-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          {/* High-Gain Parabolic Dish Reflector */}
          <radialGradient id={`dishGrad-${size}`} cx="36%" cy="36%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>

          {/* Orbit Soft Glow */}
          <filter id={`orbitGlow-${size}`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#3b82f6" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* 1. Circular Orbit Track (100% True Geometric Circle from Top View) */}
        <circle
          cx="140"
          cy="140"
          r="102"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.8"
          strokeDasharray="5.5 6.5"
          strokeOpacity="0.75"
          filter={`url(#orbitGlow-${size})`}
        />

        {/* 2. Central Moon Sphere with authentic lunar craters */}
        <g className="mature-moon">
          {/* Main Moon Sphere */}
          <circle cx="140" cy="140" r="46" fill={`url(#moonShade-${size})`} />
          {/* Crater 1 (North-West) */}
          <circle cx="126" cy="125" r="9" fill="#3b4858" fillOpacity="0.55" />
          <circle cx="125" cy="124" r="8.5" fill="none" stroke="#f1f5f9" strokeWidth="0.8" strokeOpacity="0.35" />
          {/* Crater 2 (South-West) */}
          <circle cx="122" cy="154" r="7" fill="#334155" fillOpacity="0.5" />
          <circle cx="121.5" cy="153.5" r="6.5" fill="none" stroke="#f1f5f9" strokeWidth="0.7" strokeOpacity="0.3" />
          {/* Crater 3 (Center-East Mare impact) */}
          <circle cx="157" cy="142" r="12" fill="#2d3748" fillOpacity="0.45" />
          <circle cx="156" cy="141" r="11.5" fill="none" stroke="#f1f5f9" strokeWidth="0.9" strokeOpacity="0.25" />
          {/* Crater 4 (South-East minor crater) */}
          <circle cx="148" cy="164" r="4.5" fill="#3b4858" fillOpacity="0.45" />
        </g>

        {/* 3. Orbiting Mature Chandrayaan Satellite (Locked to 360° Circular Orbit) */}
        <g className="mature-satellite-orbit-carrier">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 140 140"
            to="360 140 140"
            dur="3.4s"
            repeatCount="indefinite"
          />
          {/* Positioned precisely at radius 102 on orbit circle (140, 38) */}
          <g transform="translate(140, 38)">
            {/* Left Solar Array Wing with Photovoltaic Cells & Gold Frame */}
            <rect x="-14" y="-2" width="3" height="4" rx="0.5" fill="#71717a" stroke="#d4d4d8" strokeWidth="0.5" />
            <rect x="-37" y="-9" width="23" height="18" rx="1.5" fill="#0b1e3d" stroke="#d49b1a" strokeWidth="0.9" />
            {/* 6 Individual Photovoltaic Solar Cells */}
            <rect x="-35.5" y="-7.5" width="6" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="-35.5" y="1" width="6" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="-28" y="-7.5" width="6" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="-28" y="1" width="6" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="-20.5" y="-7.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="-20.5" y="1" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            {/* Center Grid Busbar */}
            <line x1="-36" y1="0" x2="-15" y2="0" stroke="rgba(191,219,254,0.75)" strokeWidth="0.6" />

            {/* Right Solar Array Wing */}
            <rect x="11" y="-2" width="3" height="4" rx="0.5" fill="#71717a" stroke="#d4d4d8" strokeWidth="0.5" />
            <rect x="14" y="-9" width="23" height="18" rx="1.5" fill="#0b1e3d" stroke="#d49b1a" strokeWidth="0.9" />
            {/* 6 Individual Photovoltaic Solar Cells */}
            <rect x="15.5" y="-7.5" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="15.5" y="1" width="5" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="22" y="-7.5" width="6" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="22" y="1" width="6" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="29.5" y="-7.5" width="6" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            <rect x="29.5" y="1" width="6" height="6.5" rx="0.4" fill={`url(#solarCell-${size})`} />
            {/* Center Grid Busbar */}
            <line x1="15" y1="0" x2="36" y2="0" stroke="rgba(191,219,254,0.75)" strokeWidth="0.6" />

            {/* Main Satellite Core Body (Golden MLI Thermal Blanket with Seam Lines) */}
            <rect x="-11" y="-10" width="22" height="20" rx="2.5" fill={`url(#goldFoil-${size})`} stroke="#78350f" strokeWidth="0.8" />
            {/* Structural MLI panel seams */}
            <line x1="-10" y1="-3" x2="10" y2="-3" stroke="rgba(120,53,15,0.45)" strokeWidth="0.6" />
            <line x1="-3" y1="-9" x2="-3" y2="9" stroke="rgba(120,53,15,0.45)" strokeWidth="0.6" />
            <line x1="3" y1="-9" x2="3" y2="9" stroke="rgba(120,53,15,0.45)" strokeWidth="0.6" />

            {/* Attitude Control Reaction Thruster Pods (4 corners) */}
            <circle cx="-11" cy="-10" r="1.2" fill="#475569" stroke="#94a3b8" strokeWidth="0.4" />
            <circle cx="11" cy="-10" r="1.2" fill="#475569" stroke="#94a3b8" strokeWidth="0.4" />
            <circle cx="-11" cy="10" r="1.2" fill="#475569" stroke="#94a3b8" strokeWidth="0.4" />
            <circle cx="11" cy="10" r="1.2" fill="#475569" stroke="#94a3b8" strokeWidth="0.4" />

            {/* Parabolic High-Gain Dish Antenna (HGA) facing space */}
            <line x1="0" y1="-5" x2="0" y2="-10" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="0" cy="-5" r="5.2" fill={`url(#dishGrad-${size})`} stroke="#475569" strokeWidth="0.7" />
            <circle cx="0" cy="-5" r="3" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="0" cy="-5" r="1" fill="#0f172a" />

            {/* Optical Science Payload: OHRC & TMC-2 Lenses (Facing down toward Moon) */}
            <circle cx="-3.5" cy="6" r="3.2" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.6" />
            <circle cx="-3.5" cy="6" r="2.2" fill="#0284c7" />
            <circle cx="-4.2" cy="5.2" r="0.7" fill="#ffffff" fillOpacity="0.9" />

            <circle cx="3.5" cy="6" r="2.4" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.6" />
            <circle cx="3.5" cy="6" r="1.6" fill="#0369a1" />
            <circle cx="3.0" cy="5.4" r="0.5" fill="#ffffff" fillOpacity="0.9" />

            {/* Real-time Sub-Pixel Optical Science Beacon */}
            <circle cx="0" cy="9.5" r="1.2" fill="#38bdf8" />
          </g>
        </g>
      </svg>
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

