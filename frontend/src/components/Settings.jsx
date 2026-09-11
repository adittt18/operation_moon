import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Volume2,
  Activity,
  Download,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { playNotificationSound } from '../audio';
import { readJsonResponse } from '../api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function Settings({ theme, onToggleTheme, apiOnline }) {
  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const v = localStorage.getItem('pixelmoon-sound');
      return v !== null ? JSON.parse(v) : true;
    } catch {
      return true;
    }
  });

  // Auto-rotate 3D globe toggle
  const [globeAutoRotate, setGlobeAutoRotate] = useState(() => {
    try {
      const v = localStorage.getItem('pixelmoon-globe-autorotate');
      return v !== null ? JSON.parse(v) : true;
    } catch {
      return true;
    }
  });

  // Default detector
  const [defaultDetector, setDefaultDetector] = useState(() => {
    try {
      return localStorage.getItem('pixelmoon-detector') || 'sift';
    } catch {
      return 'sift';
    }
  });

  // Default Sub-pixel precision
  const [subpixelMode, setSubpixelMode] = useState(() => {
    try {
      const v = localStorage.getItem('pixelmoon-subpixel');
      return v !== null ? JSON.parse(v) : true;
    } catch {
      return true;
    }
  });

  // Ping status state
  const [pingLatency, setPingLatency] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('pixelmoon-sound', JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('pixelmoon-globe-autorotate', JSON.stringify(globeAutoRotate));
    } catch {}
  }, [globeAutoRotate]);

  useEffect(() => {
    try {
      localStorage.setItem('pixelmoon-detector', defaultDetector);
    } catch {}
  }, [defaultDetector]);

  useEffect(() => {
    try {
      localStorage.setItem('pixelmoon-subpixel', JSON.stringify(subpixelMode));
    } catch {}
  }, [subpixelMode]);

  const handleTestSound = () => {
    playNotificationSound();
  };

  const handlePingBackend = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/health?t=${Date.now()}`);
      await readJsonResponse(res);
      const elapsed = Math.round(performance.now() - start);
      setPingLatency(elapsed);
    } catch {
      setPingLatency(-1);
    } finally {
      setIsPinging(false);
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('pixelmoon-theme');
      localStorage.removeItem('pixelmoon-sound');
      localStorage.removeItem('pixelmoon-globe-autorotate');
      localStorage.removeItem('pixelmoon-detector');
      localStorage.removeItem('pixelmoon-subpixel');
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2800);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      app: 'Pixel-Moon Lunar Image Registration Console',
      organization: 'ISRO / DOS',
      team: 'Team Code_Chaos',
      problemStatement: 'SIH 2024 - PS 26166',
      timestamp: new Date().toISOString(),
      theme,
      pipeline: {
        featureDetector: defaultDetector.toUpperCase(),
        matcher: 'FLANN (KDTree Index)',
        homography: 'RANSAC (0.75 ratio + 1.8px reprojection threshold)',
        subpixelRefinement: subpixelMode ? 'cv2.cornerSubPix (0.1px target)' : 'Standard integer px',
        spatialCoverageGrid: '4x4 uniform tiling (16 bins)',
      },
      backendStatus: apiOnline ? 'ONLINE' : 'OFFLINE',
      apiEndpoint: API_BASE || window.location.origin,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelmoon-audit-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-card page-fade">
      <div className="card-header">
        <span className="badge isro-badge">ISRO · Team CODE_CHAOS</span>
        <h2>System Settings &amp; Preferences</h2>
        <p className="subtitle">
          Configure visual appearance, audio feedback, registration engine defaults, and system diagnostics for Pixel-Moon.
        </p>
      </div>

      <div className="settings-grid">
        {/* Appearance Row */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Appearance Theme</strong>
            <span>{theme === 'dark' ? 'Dark mode (Space obsidian)' : 'Light mode (High-contrast lab)'}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onToggleTheme} type="button">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Audio Alerts */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Space Chime Audio Alerts</strong>
            <span>Play synthesized chime upon registration completion</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleTestSound}
              type="button"
              title="Test space chime sound"
            >
              <Volume2 size={14} /> Test
            </button>
            <label className="switch" title="Toggle audio chime">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              <span className="track" />
            </label>
          </div>
        </div>

        {/* 3D Globe Auto-Rotation */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>3D Moon Globe Auto-Rotation</strong>
            <span>Smooth orbit rotation when inspecting landing sites</span>
          </div>
          <label className="switch" title="Toggle 3D auto rotation">
            <input
              type="checkbox"
              checked={globeAutoRotate}
              onChange={(e) => setGlobeAutoRotate(e.target.checked)}
            />
            <span className="track" />
          </label>
        </div>

        {/* Default Feature Detector */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Feature Detector Engine</strong>
            <span>Primary algorithm used for invariant tie-point extraction</span>
          </div>
          <select
            className="settings-select"
            value={defaultDetector}
            onChange={(e) => setDefaultDetector(e.target.value)}
          >
            <option value="sift">Grid-Tiled SIFT (Standard)</option>
            <option value="superpoint">SuperPoint Deep Learning</option>
            <option value="orb">ORB Multi-Scale</option>
          </select>
        </div>

        {/* Sub-Pixel Refinement */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Sub-Pixel Refinement (cornerSubPix)</strong>
            <span>Iterative gradient refinement to reach sub-pixel RMSE (&lt; 1.0 px)</span>
          </div>
          <label className="switch" title="Toggle sub-pixel refinement">
            <input
              type="checkbox"
              checked={subpixelMode}
              onChange={(e) => setSubpixelMode(e.target.checked)}
            />
            <span className="track" />
          </label>
        </div>

        {/* Backend Status & Latency Benchmark */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>FastAPI Registration Engine</strong>
            <span>
              {apiOnline ? 'Operational · /health OK' : 'Offline / Unreachable'}
              {pingLatency !== null && pingLatency >= 0 && ` (${pingLatency} ms ping)`}
              {pingLatency === -1 && ' (Ping failed)'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePingBackend}
              disabled={isPinging}
              type="button"
            >
              <Activity size={14} /> {isPinging ? 'Pinging...' : 'Ping Test'}
            </button>
            <span
              className="ready-badge"
              style={{
                background: apiOnline ? undefined : 'rgba(248,113,113,0.15)',
                color: apiOnline ? undefined : 'var(--accent-red)',
                borderColor: apiOnline ? undefined : 'rgba(248,113,113,0.3)',
              }}
            >
              {apiOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Export Audit Report */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Pipeline Verification Report</strong>
            <span>Export full system configurations &amp; compliance metadata</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExportReport} type="button">
            <Download size={14} /> Export JSON
          </button>
        </div>

        {/* Reset Local Preferences & Cache */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Local Storage &amp; Cache</strong>
            <span>{cacheCleared ? 'Preferences reset to defaults!' : 'Clear stored UI parameters &amp; reset defaults'}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleClearCache} type="button">
            {cacheCleared ? <CheckCircle2 size={14} color="var(--accent-green)" /> : <Trash2 size={14} />}
            {cacheCleared ? 'Reset Done' : 'Reset Defaults'}
          </button>
        </div>

        {/* Technical Pipeline Info */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Pipeline Core Stack</strong>
            <span>OpenCV 4.x + NumPy + SciPy + Three.js + React 18</span>
          </div>
          <span className="dataset-sensor-pill">SIH v1.0.0</span>
        </div>

        {/* Team Details */}
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>ISRO / SIH Track</strong>
            <span>Team Code_Chaos · Problem Statement 26166</span>
          </div>
          <span className="dataset-sensor-pill">ISRO / DOS</span>
        </div>
      </div>
    </div>
  );
}
