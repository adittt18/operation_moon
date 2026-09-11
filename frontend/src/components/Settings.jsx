import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Settings({ theme, onToggleTheme, apiOnline }) {
  return (
    <div className="page-card page-fade">
      <div className="card-header">
        <span className="badge isro-badge">ISRO · Team CODE_CHAOS</span>
        <h2>Settings</h2>
        <p className="subtitle">Preferences for the Pixel-Moon registration console. These apply only to this browser.</p>
      </div>

      <div className="settings-grid">
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Appearance</strong>
            <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'} is currently active</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onToggleTheme} type="button">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <strong>FastAPI Backend</strong>
            <span>{apiOnline ? 'Connected — /health responding' : 'Unreachable — check the API server'}</span>
          </div>
          <span className={`ready-badge`} style={{ background: apiOnline ? undefined : 'rgba(248,113,113,0.15)', color: apiOnline ? undefined : 'var(--accent-red)', borderColor: apiOnline ? undefined : 'rgba(248,113,113,0.3)' }}>
            {apiOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Pipeline version</strong>
            <span>Classical CV: SIFT + FLANN + RANSAC + cornerSubPix</span>
          </div>
          <span className="dataset-sensor-pill">v1.0.0</span>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Team</strong>
            <span>Team Code_Chaos · ISRO / Department of Space</span>
          </div>
          <span className="dataset-sensor-pill">SIH — PS 26166</span>
        </div>
      </div>
    </div>
  );
}
