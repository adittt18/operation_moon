import React, { useState, useEffect } from 'react';

// In production this is set to the Render backend URL via VITE_API_BASE_URL env var.
// In local dev it falls back to '' (empty string) so Vite's proxy handles routing.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

import Sidebar, { MobileNav } from './components/Sidebar';
import TopBar from './components/TopBar';
import HeroBanner from './components/HeroBanner';
import { OneClickDatasets, AdditionalDatasets } from './components/DatasetShowcase';
import ProcessingBar from './components/ProcessingBar';
import SettingsPage from './components/Settings';
import UploadForm from './UploadForm';
import ResultsPanel from './ResultsPanel';
import MoonGlobe from './MoonGlobe';
import { readJsonResponse } from './api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [registrationResult, setRegistrationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sites, setSites] = useState([]);
  const [apiOnline, setApiOnline] = useState(true);

  // Theme — persisted, applied to <html data-theme="...">; index.html sets an
  // initial value before paint so there's no flash of the wrong theme.
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }
    return 'dark';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('pixelmoon-theme', theme); } catch { /* noop */ }
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // Home dashboard: quick-dataset selection + shared processing parameters
  const [selectedDataset, setSelectedDataset] = useState('ohrc');
  const [clipLimit, setClipLimit] = useState(2.0);
  const [ransacThresh, setRansacThresh] = useState(1.8);
  const [subpixelRefine, setSubpixelRefine] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(readJsonResponse)
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

    fetch(`${API_BASE}/imaging-sites`)
      .then(readJsonResponse)
      .then((data) => setSites(data.sites || []))
      .catch((err) => console.error('Failed to load sites:', err));
  }, []);


  const handleRegistrationComplete = (data) => {
    setRegistrationResult(data);
    setIsProcessing(false);
    setCurrentTab('results');
  };

  const handleSampleSelect = async (sampleId) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('sample_id', sampleId);
      formData.append('clip_limit', clipLimit);
      formData.append('ransac_thresh', ransacThresh);
      formData.append('subpixel_refine', subpixelRefine);
      const res = await fetch(`${API_BASE}/register-sample`, { method: 'POST', body: formData });
      const data = await readJsonResponse(res);
      setRegistrationResult(data);
      setCurrentTab('results');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGlobeSiteSelect = (site) => {
    if (site.sample_pair) handleSampleSelect(site.sample_pair);
  };

  return (
    <div className="pixel-moon-app">
      <Sidebar currentTab={currentTab} onNavigate={setCurrentTab} hasResult={!!registrationResult} />

      <div className="app-main-column">
        <TopBar theme={theme} onToggleTheme={toggleTheme} apiOnline={apiOnline} />

        <main className="main-viewport">
          {currentTab === 'home' && (
            <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <HeroBanner />
              <OneClickDatasets
                selectedId={selectedDataset}
                onSelect={setSelectedDataset}
                disabled={isProcessing}
              />
              <AdditionalDatasets />
              <ProcessingBar
                clipLimit={clipLimit} setClipLimit={setClipLimit}
                ransacThresh={ransacThresh} setRansacThresh={setRansacThresh}
                subpixelRefine={subpixelRefine} setSubpixelRefine={setSubpixelRefine}
                onRun={() => handleSampleSelect(selectedDataset)}
                isProcessing={isProcessing}
                canRun={!!selectedDataset}
                activeStep={registrationResult ? 4 : 1}
                tag={selectedDataset ? `Chandrayaan-2 → LRO` : null}
              />
            </div>
          )}

          {currentTab === 'upload' && (
            <div className="page-fade">
              <UploadForm
                onRegistrationComplete={handleRegistrationComplete}
                onSampleSelect={handleSampleSelect}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {currentTab === 'results' && (
            <div className="page-fade">
              <ResultsPanel
                result={registrationResult}
                onBack={() => setCurrentTab('upload')}
                onNavigateToGlobe={() => setCurrentTab('globe')}
              />
            </div>
          )}

          {currentTab === 'globe' && (
            <div className="page-fade">
              <MoonGlobe sites={sites} onSiteSelect={handleGlobeSiteSelect} />
            </div>
          )}

          {currentTab === 'docs' && (
            <div className="docs-panel glass-card page-fade">
              <h3>Pixel-Moon Technical Architecture</h3>
              <div className="docs-grid">
                <div className="doc-section">
                  <h4>Evaluation Criteria</h4>
                  <ul>
                    <li><strong>RMSE:</strong> &lt; 1.0 pixel (Sub-pixel accuracy achieved with cornerSubPix)</li>
                    <li><strong>Inlier Count:</strong> &gt; 100 verified tie points</li>
                    <li><strong>Inlier Ratio:</strong> &gt; 0.50 (Lowe's ratio test &lt; 0.75 + RANSAC)</li>
                    <li><strong>Spatial Grid Coverage:</strong> &gt; 0.75 (&ge; 12 of 16 grid cells occupied)</li>
                    <li><strong>Sensors Handled:</strong> Chandrayaan-2 OHRC (0.25m), TMC-2 (5m), IIRS (80m)</li>
                  </ul>
                </div>
                <div className="doc-section">
                  <h4>7-Step Registration Pipeline</h4>
                  <ol>
                    <li><strong>Data Ingestion:</strong> Format auto-detection (PNG/TIFF/FITS/IMG) &amp; sensor categorization</li>
                    <li><strong>Preprocessing:</strong> CLAHE (clipLimit=2.0) sun-angle normalization + Lanczos/area resolution harmonisation</li>
                    <li><strong>Feature Detection:</strong> Spatially-uniform 4×4 Grid-Tiled SIFT + deep SuperPoint fallback</li>
                    <li><strong>Feature Matching:</strong> FLANN KDTree kNN (k=2) + Lowe's ratio test + multi-scale search</li>
                    <li><strong>Homography Alignment:</strong> RANSAC projective homography estimation</li>
                    <li><strong>Sub-Pixel Refinement:</strong> cv2.cornerSubPix on inliers + recomputed H matrix</li>
                    <li><strong>Metric Evaluation:</strong> Automated compliance validation against SIH targets</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <SettingsPage theme={theme} onToggleTheme={toggleTheme} apiOnline={apiOnline} />
          )}

          <footer className="footer-bar">
            <p>Pixel-Moon: Automated Multi-Modal Lunar Image Registration Pipeline · Chandrayaan-2 &amp; NASA LRO NAC</p>
          </footer>
        </main>
      </div>

      <MobileNav
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        hasResult={!!registrationResult}
      />
    </div>
  );
}
