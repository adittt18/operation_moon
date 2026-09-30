import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="legal-page-container page-fade">
      <div className="legal-page-card glass-card">
        <div className="legal-header">
          {onBack && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onBack}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <div className="legal-title-badge">
            <ShieldCheck size={18} className="text-cyan" />
            <span>Official Policy Document</span>
          </div>
          <h1>Pixel-Moon Privacy Policy</h1>
          <p className="legal-meta">
            Effective Date: September 2026 | Version 2.4 | Applicable to Pixel-Moon Lunar Image Registration Pipeline
          </p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Technical Scope and Overview</h2>
            <p>
              Pixel-Moon is a scientific computer vision and photogrammetry platform engineered for
              multi-modal, sun-angle and scale-invariant image registration. The platform aligns
              optical imagery from the Indian Space Research Organisation (ISRO) Chandrayaan-2 orbiter
              payloads (OHRC, TMC-2, IIRS) with high-resolution reference baselines from NASA's Lunar
              Reconnaissance Orbiter Camera (LROC NAC). This Privacy Policy explains our strict data
              handling, zero-telemetry, and client-side isolation architecture.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Ephemeral Image Processing & Data Isolation</h2>
            <p>
              We treat all uploaded optical imagery, coordinate files, and sensor rasters as sensitive,
              transient engineering payloads:
            </p>
            <ul>
              <li>
                <strong>In-Memory Processing:</strong> Uploaded source and reference images are held in
                transient RAM or designated temporary filesystem buffers exclusively during active
                registration execution (CLAHE sun-angle normalization, 4x4 Grid-Tiled SIFT extraction,
                FLANN matching, RANSAC projective homography estimation, and sub-pixel refinement).
              </li>
              <li>
                <strong>No Long-Term Image Retention:</strong> Once the homography matrix and aligned rasters
                are computed and returned to your active session, transient buffers are flushed. We do not
                retain, catalog, or archive user-submitted rasters on external disks.
              </li>
              <li>
                <strong>No Scraping or AI Model Training:</strong> User-submitted lunar rasters and metadata
                are never used to train external generative models, commercial models, or third-party datasets.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Client-Side Authentication & Session Privacy</h2>
            <p>
              Pixel-Moon prioritizes zero-knowledge privacy for all researchers and operators:
            </p>
            <ul>
              <li>
                <strong>Zero Pre-Filled Personal Identifiers:</strong> Input fields are strictly unpopulated
                by default. No personal email addresses, usernames, or telemetry IDs are leaked, cached, or
                displayed to third parties.
              </li>
              <li>
                <strong>Local Storage Only:</strong> User session state, active theme preference (dark/light),
                and algorithmic hyperparameters (such as CLAHE clipLimit and RANSAC threshold) are preserved
                strictly within your device's browser <code>localStorage</code>.
              </li>
              <li>
                <strong>No Tracking Cookies:</strong> Pixel-Moon employs zero advertising cookies, zero
                cross-site marketing beacons, and zero third-party analytics trackers.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Cryptographic Security & Transit Integrity</h2>
            <p>
              All interactions between your browser and the registration engine are fortified with:
            </p>
            <ul>
              <li>
                <strong>End-to-End Transit Encryption:</strong> All API requests, registration payloads, and
                downloads are transmitted over TLS 1.3 / HTTPS.
              </li>
              <li>
                <strong>Cryptographic Authentication:</strong> Passwords and account tokens are secured using
                modern one-way cryptographic hashing (PBKDF2 / SHA-256) with unique per-user salts.
              </li>
              <li>
                <strong>Memory Sanitization:</strong> Registration scratch space is periodically scrubbed to
                prevent memory leakage or cross-session payload exposure.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Open Science & Planetary Data Provenance</h2>
            <p>
              Public lunar datasets provided within the application showcase are derived from authentic open
              planetary missions:
            </p>
            <ul>
              <li>
                <strong>ISRO Chandrayaan-2:</strong> Optical High Resolution Camera (OHRC) and Terrain Mapping
                Camera-2 (TMC-2) datasets distributed in accordance with ISRO ISSDC open data policies.
              </li>
              <li>
                <strong>NASA LRO:</strong> Lunar Reconnaissance Orbiter Camera Narrow Angle Camera (LROC NAC)
                reference rasters accessed via the NASA Planetary Data System (PDS) Cartography and Imaging
                Sciences Node.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. User Rights and Data Purge</h2>
            <p>
              Users hold unilateral control over their local operational data:
            </p>
            <ul>
              <li>
                You may clear all local cached sessions, presets, and history at any moment via the Settings
                interface or by clearing your browser cache.
              </li>
              <li>
                You retain complete ownership of all registered output GeoTIFFs, PNG blends, and computed
                homography matrices generated during your sessions.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Contact and Inquiries</h2>
            <p>
              For technical inquiries, compliance audits, or data governance clarifications regarding the
              Pixel-Moon platform, please submit an issue to the official GitHub repository or reach the project
              lead at <strong>HackerVilla / TEAM CODE_CHAOS</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
