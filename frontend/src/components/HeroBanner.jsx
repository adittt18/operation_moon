import React from 'react';
import { Settings2, Layers, Star, ShieldCheck } from 'lucide-react';
import HeroScene from './HeroScene';

const PILLS = [
  { icon: Settings2, label: 'High Precision' },
  { icon: Layers, label: 'Multi-Modal' },
  { icon: Star, label: 'AI Ready' },
  { icon: ShieldCheck, label: 'Space Grade' },
];

export default function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="hero-copy">
        <span className="hero-eyebrow">Welcome to</span>
        <h1 className="hero-title">
          Pixel-<span className="grad">Moon</span>
        </h1>
        <p className="hero-subtitle">Multi-Modal Lunar Image Registration Pipeline</p>
        <p className="hero-desc">
          Automated sun-angle and scale-invariant registration aligning Chandrayaan-2
          (OHRC, TMC-2, IIRS) optical imagery against NASA LRO NAC reference baselines
          with sub-pixel precision.
        </p>
        <div className="hero-pills">
          {PILLS.map(({ icon: Icon, label }) => (
            <span className="hero-pill" key={label}>
              <Icon strokeWidth={2.2} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="hero-scene-wrap">
        <div className="hero-horizon" />
        <HeroScene />
        <div className="hero-status-badge">
          <span className="dot" />
          <span className="txt">
            <strong>Chandrayaan-2</strong>
            <span>Exploring...</span>
          </span>
        </div>
        <div className="hero-vertical-text">
          {['INDIA', 'IN', 'SPACE', 'FOR A', 'BETTER', 'TOMORROW'].map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
