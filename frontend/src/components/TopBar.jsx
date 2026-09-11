import React from 'react';
import { Search, Bell, ChevronDown, Sun, Moon } from 'lucide-react';

export default function TopBar({ theme, onToggleTheme, apiOnline, teamName = 'Team Code_Chaos', initials = 'TC' }) {
  return (
    <div className="topbar">
      <div className="topbar-mobile-brand">
        <span className="mobile-brand-icon">🌙</span>
        <span className="mobile-brand-title">Pixel-Moon</span>
      </div>

      <div className="topbar-search">
        <Search strokeWidth={2} />
        <input type="text" placeholder="Search lunar image, mission data..." />
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-right">
        <button className="icon-btn" type="button" aria-label="Notifications">
          <Bell strokeWidth={2} />
          <span className="dot" />
        </button>

        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle light / dark theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun strokeWidth={2} /> : <Moon strokeWidth={2} />}
        </button>

        <button className="user-chip" type="button">
          <span className="user-chip-avatar">{initials}</span>
          <span className="name">{teamName}</span>
          <ChevronDown className="chev" strokeWidth={2.4} />
        </button>

        <div className="status-chip">
          <span className="row">
            <span className="dot" />
            <span className="label">{apiOnline ? 'FastAPI Online' : 'API Offline'}</span>
          </span>
          <span className="version">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
