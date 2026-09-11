import React from 'react';
import { Zap, Database, Paperclip } from 'lucide-react';

const ONE_CLICK = [
  {
    id: 'tmc2',
    title: 'Chandrayaan-2 TMC-2 vs LRO NAC',
    sub: '5.0 m/px · Tycho Crater Highlands',
    file: 'chandrayaan2_tmc2_vs_lro_nac.png',
    size: '12.4 MB',
    dims: '2048 x 2048',
    sensor: 'OHRC (0.25 m/px)',
  },
  {
    id: 'ohrc',
    title: 'Chandrayaan-2 OHRC vs LRO NAC',
    sub: '0.25 m/px · South Pole',
    file: 'ch2_ohrc_nhp_20211228T2219559_b_lrw_dt18.png',
    size: '12.4 MB',
    dims: '2048 x 2048',
    sensor: 'OHRC (0.25 m/px)',
  },
  {
    id: 'iirs',
    title: 'Chandrayaan-2 IIRS vs LRO NAC',
    sub: '80 m/px · Hyperspectral Infrared',
    file: 'lro_nac_tycho_ref.png',
    size: '18.7 MB',
    dims: '4096 x 4096',
    sensor: 'LRO NAC (0.5 m/px)',
  },
];

const ADDITIONAL = [
  {
    id: 'src',
    title: 'Chandrayaan-2 Source Image',
    desc: 'Accepts: OHRC, TMC-2, IIRS (PNG, TIFF, FITS, IMG)',
    file: 'chandrayaan2_ohrc_southpole.png',
    size: '12.4 MB',
    dims: '2048 x 2048',
    sensor: 'OHRC (0.25 m/px)',
    org: 'isro',
  },
  {
    id: 'ref',
    title: 'NASA LRO NAC Reference Image',
    desc: 'Reference benchmark base frame (PNG/TIFF)',
    file: 'lro_nac_tycho_ref.png',
    size: '18.7 MB',
    dims: '4096 x 4096',
    sensor: 'LRO NAC Reference',
    org: 'nasa',
  },
];

function MoonThumb() {
  return (
    <div className="dataset-thumb">
      <img src="/moon_1024.jpg" alt="" />
    </div>
  );
}

function OrgThumb({ org }) {
  return (
    <div className="dataset-thumb org-logo">
      {org === 'isro' ? <IsroBadge /> : <NasaBadge />}
    </div>
  );
}

function IsroBadge() {
  return (
    <img
      src="/isro_logo.png"
      alt="ISRO"
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '48px',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}

function NasaBadge() {
  return (
    <img
      src="/nasa_logo.png"
      alt="NASA"
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '48px',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}

export function OneClickDatasets({ selectedId, onSelect, disabled }) {
  return (
    <div className="dataset-block">
      <div className="section-heading">
        <Zap className="icon" strokeWidth={2.4} fill="currentColor" />
        <h3>One-Click Preloaded Demonstration Datasets</h3>
        <p>Quick access to preloaded datasets for instant testing and demonstration of the pipeline.</p>
      </div>
      <div className="dataset-grid">
        {ONE_CLICK.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`dataset-card ${selectedId === d.id ? 'selected' : ''}`}
            onClick={() => onSelect(d.id)}
            disabled={disabled}
          >
            <MoonThumb />
            <div className="dataset-body">
              <div className="dataset-top-row">
                <span className="dataset-title">{d.title}</span>
                <span className="ready-badge">Ready</span>
              </div>
              <span className="dataset-sub">{d.sub}</span>
              <span className="dataset-file">
                <Paperclip strokeWidth={2.4} />
                {d.file}
              </span>
              <span className="dataset-size">Size: {d.size} · {d.dims}</span>
              <span className="dataset-sensor-pill">Sensor: {d.sensor}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdditionalDatasets() {
  return (
    <div className="dataset-block">
      <div className="section-heading">
        <Database className="icon" strokeWidth={2.4} />
        <h3>Additional Preloaded Datasets</h3>
      </div>
      <div className="dataset-grid cols-2">
        {ADDITIONAL.map((d) => (
          <div key={d.id} className="dataset-card" style={{ cursor: 'default' }}>
            <OrgThumb org={d.org} />
            <div className="dataset-body">
              <span className="dataset-title">{d.title}</span>
              <span className="dataset-desc">{d.desc}</span>
              <span className="dataset-file">
                <Paperclip strokeWidth={2.4} />
                {d.file}
              </span>
              <span className="dataset-size">Size: {d.size} · {d.dims}</span>
              <span className="dataset-sensor-pill">Sensor: {d.sensor}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ONE_CLICK };
