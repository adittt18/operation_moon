import React, { useState } from 'react';
import { MoonGlobeIcon } from './components/Sidebar';
import { Shrink, Expand } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';


export default function ResultsPanel({ result, onBack, onNavigateToGlobe }) {
  const [activeTab, setActiveTab] = useState('slider'); // 'slider', 'sidebyside', 'matches', 'checkerboard'
  const [sliderPos, setSliderPos] = useState(50); // 0% to 100%
  const [imageFitMode, setImageFitMode] = useState('fit'); // 'fit' or 'expanded'

  if (!result || result.status !== 'success') {
    return (
      <div className="glass-card error-card">
        <h3>No Registration Results</h3>
        <p>Run a registration or select a pre-loaded sample dataset first.</p>
        <button className="btn btn-secondary" onClick={onBack}>← Back to Upload</button>
      </div>
    );
  }

  const { metrics, compliance, targets, sensor, homography } = result;
  // Prefix result image paths with backend URL so they load from Render, not Vercel
  const registered_image_url = `${API_BASE}${result.registered_image_url}`;
  const match_map_url = `${API_BASE}${result.match_map_url}`;
  const blend_image_url = `${API_BASE}${result.blend_image_url}`;
  const source_preprocessed_url = `${API_BASE}${result.source_preprocessed_url}`;
  const reference_preprocessed_url = `${API_BASE}${result.reference_preprocessed_url}`;


  const handleSliderMove = (e) => {
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    if (clientX === undefined) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <div className="results-container">
      {/* Top action bar */}
      <div className="results-header glass-card">
        <div className="header-left">
          <button className="btn btn-secondary" onClick={onBack}>← Upload New Pair</button>
          <h2>Registration Analysis & Metric Evaluation</h2>
          <span className="sensor-tag">Sensor: {sensor}</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-accent" onClick={onNavigateToGlobe} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <MoonGlobeIcon size={16} strokeWidth={2} /> View on 3D Moon Globe
          </button>
          <a
            href={registered_image_url}
            download={`registered_${sensor}.png`}
            className="btn btn-primary"
          >
            💾 Download Registered Image
          </a>
        </div>
      </div>

      {/* Metrics Scorecard Grid */}
      <div className="metrics-grid">
        {/* RMSE */}
        <div className={`metric-card ${compliance?.rmse_passed ? 'pass' : 'fail'}`}>
          <div className="metric-header">
            <span className="metric-title">RMSE (Accuracy)</span>
            <span className={`status-pill ${compliance?.rmse_passed ? 'pill-pass' : 'pill-fail'}`}>
              {compliance?.rmse_passed ? '✓ PASSED' : 'FAIL'}
            </span>
          </div>
          <div className="metric-value">{metrics.rmse} <span className="unit">px</span></div>
          <div className="metric-target">Target: {targets?.rmse_target || '< 1.0 px'}</div>
          <div className="metric-bar">
            <div
              className="bar-fill"
              style={{ width: `${Math.min(100, (1.0 / Math.max(0.1, metrics.rmse)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Inlier Count */}
        <div className={`metric-card ${compliance?.inlier_count_passed ? 'pass' : 'fail'}`}>
          <div className="metric-header">
            <span className="metric-title">Inlier Matches</span>
            <span className={`status-pill ${compliance?.inlier_count_passed ? 'pill-pass' : 'pill-fail'}`}>
              {compliance?.inlier_count_passed ? '✓ PASSED' : 'FAIL'}
            </span>
          </div>
          <div className="metric-value">{metrics.inlier_count} <span className="unit">pts</span></div>
          <div className="metric-target">Target: {targets?.inlier_count_target || '> 100'}</div>
          <div className="metric-bar">
            <div
              className="bar-fill"
              style={{ width: `${Math.min(100, (metrics.inlier_count / 150) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Inlier Ratio */}
        <div className={`metric-card ${compliance?.inlier_ratio_passed ? 'pass' : 'fail'}`}>
          <div className="metric-header">
            <span className="metric-title">Inlier Ratio</span>
            <span className={`status-pill ${compliance?.inlier_ratio_passed ? 'pill-pass' : 'pill-fail'}`}>
              {compliance?.inlier_ratio_passed ? '✓ PASSED' : 'FAIL'}
            </span>
          </div>
          <div className="metric-value">{(metrics.inlier_ratio * 100).toFixed(1)} <span className="unit">%</span></div>
          <div className="metric-target">Target: {targets?.inlier_ratio_target || '> 50%'}</div>
          <div className="metric-bar">
            <div
              className="bar-fill"
              style={{ width: `${Math.min(100, (metrics.inlier_ratio / 0.8) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Grid Coverage */}
        <div className={`metric-card ${compliance?.grid_coverage_passed ? 'pass' : 'fail'}`}>
          <div className="metric-header">
            <span className="metric-title">Spatial Grid Coverage</span>
            <span className={`status-pill ${compliance?.grid_coverage_passed ? 'pill-pass' : 'pill-fail'}`}>
              {compliance?.grid_coverage_passed ? '✓ PASSED' : 'FAIL'}
            </span>
          </div>
          <div className="metric-value">{(metrics.grid_coverage * 100).toFixed(1)} <span className="unit">%</span></div>
          <div className="metric-target">Target: {targets?.grid_coverage_target || '> 75%'}</div>
          <div className="metric-bar">
            <div
              className="bar-fill"
              style={{ width: `${Math.min(100, (metrics.grid_coverage / 1.0) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Comparison View Tabs */}
      <div className="view-mode-tabs glass-card">
        <div className="tabs-header">
          <div className="tabs-group">
            <button
              className={`tab-btn ${activeTab === 'slider' ? 'active' : ''}`}
              onClick={() => setActiveTab('slider')}
            >
              ↔ Interactive Split Curtain (Registered vs Reference)
            </button>
            <button
              className={`tab-btn ${activeTab === 'sidebyside' ? 'active' : ''}`}
              onClick={() => setActiveTab('sidebyside')}
            >
              ⊞ Side-by-Side View
            </button>
            <button
              className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              ⚡ Feature Correspondences (FLANN)
            </button>
            <button
              className={`tab-btn ${activeTab === 'checkerboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('checkerboard')}
            >
              🏁 Checkerboard Alignment Blend
            </button>
          </div>

          <div className="image-fit-toggle" role="group" aria-label="Image Display Sizing">
            <span className="fit-toggle-label">Image:</span>
            <button
              type="button"
              className={`fit-btn ${imageFitMode === 'fit' ? 'active' : ''}`}
              onClick={() => setImageFitMode('fit')}
              title="Fit result image to screen without vertical scrolling"
            >
              <Shrink size={13} strokeWidth={2.2} /> Fit to Screen
            </button>
            <button
              type="button"
              className={`fit-btn ${imageFitMode === 'expanded' ? 'active' : ''}`}
              onClick={() => setImageFitMode('expanded')}
              title="Expand result image to original full width"
            >
              <Expand size={13} strokeWidth={2.2} /> Expand
            </button>
          </div>
        </div>

        <div className={`viewer-stage ${imageFitMode === 'fit' ? 'fit-mode' : 'expanded-mode'}`}>
          {/* Tab 1: Interactive Curtain Slider */}
          {activeTab === 'slider' && (
            <div
              className="curtain-slider-container"
              onMouseMove={handleSliderMove}
              onTouchMove={handleSliderMove}
              onTouchStart={handleSliderMove}
              onClick={handleSliderMove}
            >
              <div className="image-underlay">
                <img src={reference_preprocessed_url} alt="Reference LRO NAC" />
                <span className="curtain-tag tag-right">NASA LRO NAC (Reference)</span>
              </div>
              <div
                className="image-overlay"
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              >
                <img src={registered_image_url} alt="Registered Chandrayaan-2" />
                <span className="curtain-tag tag-left">Chandrayaan-2 (Registered)</span>
              </div>
              <div className="slider-divider" style={{ left: `${sliderPos}%` }}>
                <div className="slider-handle">↔</div>
              </div>
            </div>
          )}

          {/* Tab 2: Side-by-Side */}
          {activeTab === 'sidebyside' && (
            <div className="side-by-side-view">
              <div className="side-panel">
                <h4>1. Source Preprocessed ({sensor})</h4>
                <img src={source_preprocessed_url} alt="Source" />
              </div>
              <div className="side-panel">
                <h4>2. Warped & Registered (H Applied)</h4>
                <img src={registered_image_url} alt="Registered" />
              </div>
              <div className="side-panel">
                <h4>3. Reference (LRO NAC)</h4>
                <img src={reference_preprocessed_url} alt="Reference" />
              </div>
            </div>
          )}

          {/* Tab 3: Match Map */}
          {activeTab === 'matches' && (
            <div className="matches-view">
              <img src={match_map_url} alt="Feature Match Tie Lines" />
              <p className="caption">
                Showing spatially distributed tie-points verified by RANSAC consensus and refined via sub-pixel corner optimization.
              </p>
            </div>
          )}

          {/* Tab 4: Checkerboard */}
          {activeTab === 'checkerboard' && (
            <div className="checkerboard-view">
              <img src={blend_image_url} alt="Checkerboard Blend" />
              <p className="caption">
                Interleaved 32px checkerboard tiles. Continuous crater rims across boundaries confirm sub-pixel alignment accuracy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Homography Matrix Inspect Card */}
      {homography && (
        <div className="homography-card glass-card">
          <h4>Sub-Pixel Refined 3×3 Projective Homography Matrix (H)</h4>
          <div className="matrix-display">
            {homography.map((row, rIdx) => (
              <div key={rIdx} className="matrix-row">
                {row.map((val, cIdx) => (
                  <span key={cIdx} className="matrix-cell">
                    {val.toFixed(6)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
