import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Sun, Moon, CheckCheck, Trash2, ArrowRight } from 'lucide-react';

export default function TopBar({
  theme,
  onToggleTheme,
  apiOnline,
  teamName = 'Team Code_Chaos',
  initials = 'TC',
  notifications = [],
  onClearNotifications,
  onSelectNotification,
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-mobile-brand">
        <img src="/isro_logo.png" alt="ISRO" className="mobile-brand-logo-img" />
        <span className="mobile-brand-title">Pixel-Moon</span>
      </div>

      <div className="topbar-search">
        <Search strokeWidth={2} />
        <input type="text" placeholder="Search lunar image, mission data..." />
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
                  <h4>Notifications</h4>
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
                    <span className="notif-empty-icon">🛰️</span>
                    <p>No notifications yet</p>
                    <span>Run a registration to receive live pipeline alerts &amp; metric results here.</span>
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
                        <span className="notif-icon-badge">{n.icon || '🌕'}</span>
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

export function ToastBanner({ toast, onClose, onAction }) {
  if (!toast) return null;

  return (
    <div className="floating-toast-container page-fade">
      <div className="toast-card glass-card">
        <span className="toast-icon">{toast.icon || '🎉'}</span>
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
