import React, { useState } from 'react';
import { readJsonResponse } from './api';
import ChandrayaanLoader from './components/ChandrayaanLoader';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';



export default function UploadForm({
  onRegistrationComplete,
  onSampleSelect,
  isProcessing,
  currentStep,
  onStartProcessing,
  onProcessingError,
}) {
  const [sourceFile, setSourceFile] = useState(null);
  const [referenceFile, setReferenceFile] = useState(null);
  const [detectedSensor, setDetectedSensor] = useState('AUTO');
  const [clipLimit, setClipLimit] = useState(2.0);
  const [ransacThresh, setRansacThresh] = useState(1.8);
  const [subpixelRefine, setSubpixelRefine] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-detect sensor from filename
  const handleSourceChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSourceFile(file);
      const name = file.name.toLowerCase();
      if (name.includes('ohr')) setDetectedSensor('OHRC (25 cm/px)');
      else if (name.includes('tmc')) setDetectedSensor('TMC-2 (5 m/px)');
      else if (name.includes('iirs')) setDetectedSensor('IIRS (80 m/px)');
      else setDetectedSensor('UNKNOWN (Manual)');
    }
  };

  const handleReferenceChange = (e) => {
    const file = e.target.files[0];
    if (file) setReferenceFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sourceFile || !referenceFile) {
      setErrorMsg('Please select both a Source (Chandrayaan-2) and Reference (LRO NAC) image.');
      return;
    }
    setErrorMsg('');
    if (onStartProcessing) onStartProcessing();

    const formData = new FormData();
    formData.append('source_image', sourceFile);
    formData.append('reference_image', referenceFile);
    formData.append('clip_limit', clipLimit);
    formData.append('ransac_thresh', ransacThresh);
    formData.append('subpixel_refine', subpixelRefine);

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        body: formData,
      });
      const data = await readJsonResponse(response);
      onRegistrationComplete(data);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during image registration.');
      if (onProcessingError) onProcessingError(err);
    }
  };

  return (
    <div className="upload-container glass-card">
      <div className="card-header">
        <div className="badge isro-badge">ISRO · Team CODE_CHAOS</div>
        <h2>Multi-Modal Lunar Image Registration</h2>
        <p className="subtitle">
          Register Chandrayaan-2 (OHRC, TMC-2, IIRS) optical imagery with NASA LRO NAC reference data at sub-pixel accuracy.
        </p>
      </div>

      {errorMsg && (
        <div className="alert-box error">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* Preset Quick Load Buttons */}
      <div className="quick-presets">
        <label className="section-label">⚡ One-Click Preloaded Demonstration Datasets:</label>
        <div className="preset-grid">
          <button
            type="button"
            className="btn btn-preset"
            onClick={() => onSampleSelect('tmc2')}
            disabled={isProcessing}
          >
            <span className="preset-title">TMC-2 vs LRO NAC</span>
            <span className="preset-desc">5m Resolution · Tycho Crater</span>
          </button>
          <button
            type="button"
            className="btn btn-preset"
            onClick={() => onSampleSelect('ohrc')}
            disabled={isProcessing}
          >
            <span className="preset-title">OHRC vs LRO NAC</span>
            <span className="preset-desc">0.25m Sub-meter · South Pole</span>
          </button>
          <button
            type="button"
            className="btn btn-preset"
            onClick={() => onSampleSelect('iirs')}
            disabled={isProcessing}
          >
            <span className="preset-title">IIRS vs LRO NAC</span>
            <span className="preset-desc">80m Hyperspectral Infrared</span>
          </button>
        </div>
      </div>

      <div className="divider-text"><span>OR UPLOAD CUSTOM LUNAR IMAGERY</span></div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-inputs-grid">
          {/* Source Input */}
          <div className="file-dropzone">
            <div className="dropzone-header">
              <span className="drop-icon">🛰️</span>
              <h4>Chandrayaan-2 Source Image</h4>
            </div>
            <p className="file-desc">Supports PNG, TIFF, FITS (.fit), GDAL (.img)</p>
            <input
              type="file"
              id="source_input"
              accept=".png,.tif,.tiff,.jpg,.jpeg,.fit,.fits,.img"
              onChange={handleSourceChange}
              disabled={isProcessing}
            />
            {sourceFile ? (
              <div className="file-meta">
                <span className="file-name">📄 {sourceFile.name}</span>
                <span className="sensor-tag">Sensor: {detectedSensor}</span>
              </div>
            ) : (
              <span className="placeholder-text">Click or drag Chandrayaan-2 image here</span>
            )}
          </div>

          {/* Reference Input */}
          <div className="file-dropzone">
            <div className="dropzone-header">
              <span className="drop-icon">🌑</span>
              <h4>NASA LRO NAC Reference</h4>
            </div>
            <p className="file-desc">Reference benchmark base frame (PNG/TIFF)</p>
            <input
              type="file"
              id="reference_input"
              accept=".png,.tif,.tiff,.jpg,.jpeg,.fit,.fits,.img"
              onChange={handleReferenceChange}
              disabled={isProcessing}
            />
            {referenceFile ? (
              <div className="file-meta">
                <span className="file-name">📄 {referenceFile.name}</span>
                <span className="sensor-tag">Sensor: LRO NAC Reference</span>
              </div>
            ) : (
              <span className="placeholder-text">Click or drag LRO NAC reference image here</span>
            )}
          </div>
        </div>

        {/* Pipeline Controls */}
        <div className="controls-row">
          <div className="control-group">
            <label>CLAHE Clip Limit: {clipLimit}</label>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.2"
              value={clipLimit}
              onChange={(e) => setClipLimit(parseFloat(e.target.value))}
              disabled={isProcessing}
            />
          </div>
          <div className="control-group">
            <label>RANSAC Reproj Thresh: {ransacThresh} px</label>
            <input
              type="range"
              min="0.8"
              max="3.0"
              step="0.1"
              value={ransacThresh}
              onChange={(e) => setRansacThresh(parseFloat(e.target.value))}
              disabled={isProcessing}
            />
          </div>
          <div className="control-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={subpixelRefine}
                onChange={(e) => setSubpixelRefine(e.target.checked)}
                disabled={isProcessing}
              />
              Sub-pixel cornerSubPix Refinement
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="action-row">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isProcessing || !sourceFile || !referenceFile}
          >
            {isProcessing ? (
              <span className="btn-loading">
                <ChandrayaanLoader size="sm" /> Running Pipeline...
              </span>
            ) : (
              '🚀 Execute Sub-Pixel Registration'
            )}
          </button>
        </div>
      </form>

      {/* Real-time Step Progress Pipeline */}
      {isProcessing && (
        <div className="pipeline-steps-status">
          <h4>Pipeline Orchestration In Progress</h4>
          <div className="step-chain">
            <div className="step-node active">1. Ingest & Detect</div>
            <div className="step-arrow">→</div>
            <div className="step-node active">2. CLAHE & Harmonise</div>
            <div className="step-arrow">→</div>
            <div className="step-node active">3. Grid SIFT</div>
            <div className="step-arrow">→</div>
            <div className="step-node active">4. FLANN Match</div>
            <div className="step-arrow">→</div>
            <div className="step-node active">5. RANSAC & Sub-pixel</div>
            <div className="step-arrow">→</div>
            <div className="step-node active">6. Metric Evaluation</div>
          </div>
        </div>
      )}
    </div>
  );
}
