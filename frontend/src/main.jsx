import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by GlobalErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #0a1830 0%, #163a5c 48%, #0a1830 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: 24,
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>Pixel-Moon Experience Resumed</h2>
          <p style={{ color: '#94a3b8', maxWidth: 440, marginBottom: 20 }}>
            An unexpected error occurred. Click below to reload the console.
          </p>
          <button
            onClick={() => {
              try { localStorage.clear(); } catch {}
              window.location.reload();
            }}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              background: '#2465ab',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);

