import React from 'react';
import { SlidersHorizontal, Play, Link2, ChevronRight } from 'lucide-react';

const STEPS = ['Upload', 'Align', 'Register', 'Evaluate'];

export default function ProcessingBar({
  clipLimit, setClipLimit,
  ransacThresh, setRansacThresh,
  subpixelRefine, setSubpixelRefine,
  onRun, isProcessing, canRun,
  activeStep = 1,
  tag,
}) {
  return (
    <div className="dataset-block">
      <div className="processing-bar">
        <span className="processing-label">
          <SlidersHorizontal strokeWidth={2.2} />
          Processing
          <br />Parameters
        </span>

        <div className="slider-field">
          <div className="row"><span>CLAHE Clip Limit</span><b>{clipLimit.toFixed(1)}</b></div>
          <input
            type="range" min="1.0" max="4.0" step="0.1"
            value={clipLimit}
            onChange={(e) => setClipLimit(parseFloat(e.target.value))}
            disabled={isProcessing}
          />
        </div>

        <div className="slider-field">
          <div className="row"><span>RANSAC Reproj Threshold</span><b>{ransacThresh.toFixed(1)} px</b></div>
          <input
            type="range" min="0.8" max="3.0" step="0.1"
            value={ransacThresh}
            onChange={(e) => setRansacThresh(parseFloat(e.target.value))}
            disabled={isProcessing}
          />
        </div>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={subpixelRefine}
            onChange={(e) => setSubpixelRefine(e.target.checked)}
            disabled={isProcessing}
          />
          Sub-pixel cornerSubPix Refinement
        </label>

        <div className="processing-spacer" />

        <button
          type="button"
          className="btn btn-primary btn-run"
          onClick={onRun}
          disabled={!canRun || isProcessing}
        >
          {isProcessing ? (
            <span className="btn-loading"><span className="spinner" /> Running...</span>
          ) : (
            <>Run Registration <Play size={14} strokeWidth={2.6} fill="currentColor" /></>
          )}
        </button>
      </div>

      <div className="stepper-row">
        <div className="stepper">
          {STEPS.map((label, i) => {
            const n = i + 1;
            return (
              <React.Fragment key={label}>
                <span className={`step-pill ${n <= activeStep ? 'active' : ''}`}>
                  <span className="step-num">{n}</span>
                  <span className="step-label">{label}</span>
                </span>
                {n < STEPS.length && <ChevronRight className="step-chevron" />}
              </React.Fragment>
            );
          })}
        </div>
        {tag && (
          <span className="stepper-tag">
            <Link2 strokeWidth={2.2} />
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}
