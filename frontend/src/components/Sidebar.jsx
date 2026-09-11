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
        <div className="sidebar-footer-logo">
          <IsroMark size={32} />
        </div>
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

function IsroMark({ size = 44 }) {
  return (
    <img
      src="/isro_logo.png"
      alt="ISRO"
      style={{
        width: size,
        height: size,
        maxWidth: size,
        maxHeight: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}


