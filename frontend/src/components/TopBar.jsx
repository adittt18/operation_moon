import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Trash2,
  ArrowRight,
  X,
  Sparkles,
  Satellite,
  CheckCircle2,
  AlertCircle,
  Radio,
  Compass,
  ChevronDown,
} from 'lucide-react';

const SEARCH_ENTRIES = [
  {
    type: 'Dataset',
    title: 'TMC-2 vs LRO NAC (Tycho Crater)',
    subtitle: '5m Resolution · 2048×2048 · Sub-pixel registered',
    tag: 'TMC-2',
    action: (handlers) => {
      handlers.onSelectDataset?.('tmc2');
      handlers.onNavigate?.('home');
    },
  },
  {
    type: 'Dataset',
    title: 'OHRC vs LRO NAC (South Pole)',
    subtitle: '0.25m Sub-meter optical imagery',
    tag: 'OHRC',
    action: (handlers) => {
      handlers.onSelectDataset?.('ohrc');
      handlers.onNavigate?.('home');
    },
  },
  {
    type: 'Dataset',
    title: 'IIRS vs LRO NAC (Hyperspectral)',
    subtitle: '80m Infrared multi-modal baseline',
    tag: 'IIRS',
    action: (handlers) => {
      handlers.onSelectDataset?.('iirs');
      handlers.onNavigate?.('home');
    },
  },
  {
    type: 'Feature',
    title: 'Upload Custom Lunar Imagery',
    subtitle: 'Supports PNG, TIFF, FITS (.fit), and GDAL (.img)',
    tag: 'Upload',
    action: (handlers) => handlers.onNavigate?.('upload'),
  },
  {
    type: 'Feature',
    title: '3D Interactive Moon Globe',
    subtitle: 'Three.js lunar sphere with landing markers & coordinates',
    tag: 'Globe',
    action: (handlers) => handlers.onNavigate?.('globe'),
  },
  {
    type: 'Feature',
    title: 'Analysis & Metric Evaluation',
    subtitle: 'Interactive split curtain slider & RMSE scorecards',
    tag: 'Results',
    action: (handlers) => handlers.onNavigate?.('results'),
  },
  {
    type: 'Technical',
    title: 'Pipeline Architecture & Standards',
    subtitle: 'SIFT, FLANN, RANSAC and cornerSubPix specifications',
    tag: 'Architecture',
    action: (handlers) => handlers.onNavigate?.('docs'),
  },
  {
    type: 'Feature',
    title: 'Settings & Algorithm Controls',
    subtitle: 'Audio chimes, themes, precision modes & API ping',
    tag: 'Settings',
    action: (handlers) => handlers.onNavigate?.('settings'),
  },
  {
    type: 'Lunar Site',
    title: 'Tycho Crater (Highlands)',
    subtitle: 'Lat: -43.3°, Lon: -11.2° · High albedo ray system',
    tag: 'Site',
    action: (handlers) => {
      handlers.onNavigate?.('globe');
      handlers.onSelectSite?.({ name: 'Tycho Crater', lat: -43.3, lon: -11.2, sample_pair: 'tmc2' });
    },
  },
  {
    type: 'Lunar Site',
    title: 'Chandrayaan-3 Shiv Shakti Point',
    subtitle: 'Lat: -69.37°, Lon: 32.35° · Lunar South Pole landing site',
    tag: 'Site',
    action: (handlers) => {
      handlers.onNavigate?.('globe');
      handlers.onSelectSite?.({ name: 'Shiv Shakti Point', lat: -69.37, lon: 32.35 });
    },
  },
  {
    type: 'Lunar Site',
    title: 'Apollo 11 Mare Tranquillitatis',
    subtitle: 'Lat: 0.67°, Lon: 23.47° · Sea of Tranquility baseline',
    tag: 'Site',
    action: (handlers) => {
      handlers.onNavigate?.('globe');
      handlers.onSelectSite?.({ name: 'Apollo 11 Site', lat: 0.67, lon: 23.47 });
    },
  },
];

function renderNotificationIcon(type) {
  if (type === 'success' || type === 'pass') {
    return <CheckCircle2 size={16} color="var(--accent-green)" />;
  }
  if (type === 'error' || type === 'warning') {
    return <AlertCircle size={16} color="var(--accent-red)" />;
  }
  if (type === 'site') {
    return <Compass size={16} color="var(--accent-orange)" />;
  }
  return <Satellite size={16} color="var(--accent-blue-soft)" />;
}

export default function TopBar({
  theme,
  onToggleTheme,
  apiOnline,
  teamName = 'Team Code_Chaos',
  initials = 'TC',
  notifications = [],
  onClearNotifications,
  onSelectNotification,
  onNavigate,
  onSelectDataset,
  onSelectSite,
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredResults = searchQuery.trim()
    ? SEARCH_ENTRIES.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (entry) => {
    entry.action({ onNavigate, onSelectDataset, onSelectSite });
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <div className="topbar">
      <div className="topbar-mobile-brand">
        <img src="/isro_logo.png" alt="ISRO" className="mobile-brand-logo-img" />
        <span className="mobile-brand-title">Pixel-Moon</span>
      </div>

      {/* Interactive Global Search Bar */}
      <div className="topbar-search-container" ref={searchRef}>
        <div className="topbar-search">
          <Search strokeWidth={2} />
          <input
            type="text"
            placeholder="Search lunar datasets, sites, algorithms..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {showSearchResults && searchQuery.trim() && (
          <div className="search-results-popover glass-card page-fade">
            <div className="search-popover-header">
              <span>Matching results ({filteredResults.length})</span>
            </div>
            <div className="search-popover-list">
              {filteredResults.length === 0 ? (
                <div className="search-empty">
                  <span>No matches found for "{searchQuery}"</span>
                </div>
              ) : (
                filteredResults.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    className="search-result-item"
                    onClick={() => handleSelectSearchResult(r)}
                  >
                    <div className="search-result-type-tag">{r.tag}</div>
                    <div className="search-result-body">
                      <strong>{r.title}</strong>
                      <span>{r.subtitle}</span>
                    </div>
                    <ArrowRight size={14} className="search-arrow" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-right">
        {/* Notification Bell with Dropdown */}
        <div className="notif-anchor" ref={notifRef}>
          <button
            className={`icon-btn notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            type="button"
            aria-label="Notifications"
            onClick={() => setShowNotifs(!showNotifs)}
            title="Notifications"
          >
            <Bell strokeWidth={2} />
            {unreadCount > 0 && <span className="notif-badge-count">{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div className="notif-dropdown glass-card page-fade">
              <div className="notif-header">
                <div className="notif-title-row">
                  <h4>Mission Notifications</h4>
                  {unreadCount > 0 && <span className="unread-pill">{unreadCount} new</span>}
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="notif-clear-btn"
                    onClick={onClearNotifications}
                    title="Clear notifications"
                  >
                    <Trash2 size={13} /> Clear
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <span className="notif-empty-icon">
                      <Satellite size={24} color="var(--accent-blue-soft)" />
                    </span>
                    <p>No notifications yet</p>
                    <span>Run a registration to receive live pipeline telemetry &amp; metric results here.</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${n.unread ? 'unread' : ''}`}
                      onClick={() => {
                        if (onSelectNotification) onSelectNotification(n);
                        setShowNotifs(false);
                      }}
                    >
                      <div className="notif-icon-col">
                        <span className="notif-icon-badge">
                          {renderNotificationIcon(n.type || n.icon)}
                        </span>
                      </div>
                      <div className="notif-body">
                        <div className="notif-row">
                          <strong className="notif-item-title">{n.title}</strong>
                          <span className="notif-time">{n.time}</span>
                        </div>
                        <p className="notif-desc">{n.desc}</p>
                        {n.actionLabel && (
                          <span className="notif-action-link">
                            {n.actionLabel} <ArrowRight size={12} />
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          className={`theme-toggle theme-${theme}`}
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle light / dark theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="theme-toggle-inner" key={theme}>
            {theme === 'dark' ? (
              <Sun className="theme-icon sun-icon" strokeWidth={2} />
            ) : (
              <Moon className="theme-icon moon-icon" strokeWidth={2} />
            )}
          </span>
        </button>

        {/* Team Chip with dropdown chevron matching reference */}
        <div className="user-chip">
          <span className="user-chip-avatar">{initials}</span>
          <span className="name">{teamName}</span>
          <ChevronDown size={13} className="chev" />
        </div>

        <div className="status-chip">
          <span className="row">
            <span className="dot" />
            <span className="label">{apiOnline ? 'FastAPI Online' : 'API Offline'}</span>
          </span>
          <span className="version">v1.0.0 &nbsp;&nbsp; v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

export function ToastBanner({ toast, onClose, onAction }) {
  if (!toast) return null;

  return (
    <div className="floating-toast-container page-fade">
      <div className="toast-card glass-card">
        <span className="toast-icon">
          {renderNotificationIcon(toast.type || toast.icon)}
        </span>
        <div className="toast-body">
          <strong>{toast.title}</strong>
          <p>{toast.desc}</p>
        </div>
        {toast.actionLabel && (
          <button
            type="button"
            className="btn btn-primary btn-sm toast-btn"
            onClick={() => {
              if (onAction) onAction(toast);
              onClose();
            }}
          >
            {toast.actionLabel}
          </button>
        )}
        <button type="button" className="toast-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
