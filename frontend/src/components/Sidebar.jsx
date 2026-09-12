import {
  Home, UploadCloud, BarChart3, FileText, Settings as SettingsIcon,
} from 'lucide-react';

export function MoonGlobeIcon({ size = 24, strokeWidth = 2, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="8" cy="9" r="1.75" />
      <circle cx="15.5" cy="8" r="1.25" />
      <circle cx="13.5" cy="14.5" r="2.25" />
      <circle cx="8" cy="15.5" r="1" />
      <circle cx="17" cy="13.5" r="0.8" />
    </svg>
  );
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'upload', label: 'Upload & Register', icon: UploadCloud },
  { id: 'results', label: 'Analysis & Metrics', icon: BarChart3, requiresResult: true },
  { id: 'globe', label: '3D Moon Globe', icon: MoonGlobeIcon },
  { id: 'docs', label: 'Architecture', icon: FileText },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ currentTab, onNavigate, hasResult }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <SidebarMoonMark />
        </div>
        <div className="sidebar-brand-text">
          <h1>Pixel-Moon</h1>
          <span>Lunar Image Registration</span>
        </div>
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
          <SidebarMoonMark size={32} />
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
        const shortLabel = id === 'upload' ? 'Upload' : id === 'results' ? 'Results' : id === 'globe' ? 'Globe' : id === 'docs' ? 'Arch' : label;
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

function SidebarMoonMark({ size = 44 }) {
  return (
    <img
      src="/moon_brand_logo.png"
      alt="Pixel-Moon"
      style={{
        width: size,
        height: size,
        maxWidth: size,
        maxHeight: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
        borderRadius: '50%',
        filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45))',
      }}
    />
  );
}


