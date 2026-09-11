import React from 'react';
import {
  Home, UploadCloud, BarChart3, Globe2, FileText, Settings as SettingsIcon,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'upload', label: 'Upload & Register', icon: UploadCloud },
  { id: 'results', label: 'Analysis & Metrics', icon: BarChart3, requiresResult: true },
  { id: 'globe', label: '3D Moon Globe', icon: Globe2 },
  { id: 'docs', label: 'Architecture', icon: FileText },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ currentTab, onNavigate, hasResult }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <IsroMark />
        </div>
        <div className="sidebar-brand-text">
          <h1>Pixel-Moon</h1>
          <span>Lunar Image Registration</span>
        </div>
        <div className="sidebar-notch" />
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon, requiresResult }) => (
          <button
            key={id}
            className={`sidebar-nav-item ${currentTab === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
            disabled={requiresResult && !hasResult}
            type="button"
          >
            <Icon strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-terrain" aria-hidden="true" />
      <div className="sidebar-footer">
        <IsroMark />
        <div className="sidebar-footer-text">
          <strong>ISRO /</strong>
          TEAM CODE_CHAOS
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ currentTab, onNavigate, hasResult }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {NAV_ITEMS.map(({ id, label, icon: Icon, requiresResult }) => {
        const disabled = requiresResult && !hasResult;
        const shortLabel = id === 'upload' ? 'Upload' : id === 'results' ? 'Results' : id === 'globe' ? 'Globe' : label;
        return (
          <button
            key={id}
            className={`mobile-nav-btn ${currentTab === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
            disabled={disabled}
            type="button"
            title={disabled ? 'Run a registration to view results' : label}
          >
            <Icon size={19} strokeWidth={currentTab === id ? 2.4 : 1.8} />
            <span className="mobile-nav-label">{shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}

function IsroMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" stroke="#3b82f6" strokeOpacity="0.35" strokeWidth="1.2" />
      <path
        d="M20 6 L23.2 17.2 L34.5 17.6 L25.4 24.6 L28.8 35.4 L20 28.6 L11.2 35.4 L14.6 24.6 L5.5 17.6 L16.8 17.2 Z"
        fill="url(#isroGrad)"
      />
      <defs>
        <linearGradient id="isroGrad" x1="5" y1="6" x2="35" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

