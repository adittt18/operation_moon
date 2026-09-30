import React from 'react';
import { FileCheck, ArrowLeft, Scale, ShieldAlert, Cpu, Award } from 'lucide-react';

export default function TermsConditions({ onBack }) {
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
            <Scale size={18} className="text-cyan" />
            <span>Operational Agreement</span>
          </div>
          <h1>Terms and Conditions of Use</h1>
          <p className="legal-meta">
            Last Updated: September 2026 | Version 2.4 | Pixel-Moon Planetary Image Registration Suite
          </p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Agreement and Scientific Purpose</h2>
            <p>
              By accessing, browsing, or running computations through the Pixel-Moon platform, you agree
              to be bound by these Terms and Conditions. Pixel-Moon is an engineering tool dedicated to
              lunar photogrammetry, automated tie-point detection, and multi-sensor projective homography
              estimation. The system is designed for researchers, planetary geologists, aerospace software
              engineers, and open-science analysts.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Acceptable Use and Computational Conduct</h2>
            <p>
              Users agree to utilize the platform responsibly and in compliance with international computer
              security standards:
            </p>
            <ul>
              <li>
                <strong>Payload Integrity:</strong> You agree not to upload malicious binaries, corrupted
                headers, or exploitative scripts disguised as image rasters (PNG, TIFF, FITS, or IMG).
              </li>
              <li>
                <strong>System Availability:</strong> You agree not to execute automated denial-of-service
                attacks, overwhelm the registration workers with parallel malformed requests, or attempt
                to bypass server rate-limiting thresholds.
              </li>
              <li>
                <strong>Fair Use:</strong> Batch processing of large lunar orbital strips should be scheduled
                respectfully to preserve shared compute resources for the scientific community.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Intellectual Property & Planetary Data Attribution</h2>
            <p>
              Pixel-Moon strictly respects the rights of space agencies and research institutions:
            </p>
            <ul>
              <li>
                <strong>Chandrayaan-2 Datasets:</strong> Imagery captured by OHRC, TMC-2, and IIRS belongs to
                the Indian Space Research Organisation (ISRO). Any publication, map, or analysis utilizing
                these data must cite ISRO / ISSDC according to official mission citation standards.
              </li>
              <li>
                <strong>NASA LRO Datasets:</strong> Reference baselines from the Lunar Reconnaissance Orbiter
                Camera (LROC) belong to NASA / Arizona State University and are governed by NASA Planetary
                Data System open-access guidelines.
              </li>
              <li>
                <strong>Registration Deliverables:</strong> All computed mathematical outputs (including 3x3
                projective homography matrices H, sub-pixel corner tie points, checkerboard blends, and
                spatially aligned rasters) are the exclusive intellectual property of the operator who generated
                them.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Mathematical Accuracy & Scientific Disclaimer</h2>
            <p>
              Pixel-Moon applies state-of-the-art computer vision algorithms (CLAHE, SIFT, FLANN kNN, Lowe's
              Ratio Criterion, RANSAC projective homography estimation, and OpenCV cornerSubPix):
            </p>
            <ul>
              <li>
                While the system targets sub-pixel RMSE (&lt; 1.0 px) and verified geometric inlier counts (&gt; 100),
                algorithmic outcomes depend on source image resolution, terrain crater density, optical lighting
                angles, and signal-to-noise ratios.
              </li>
              <li>
                Calculated homography matrices are provided for scientific, research, and mapping purposes. They
                are not warranted for autonomous spacecraft descent navigation or hazard avoidance without
                rigorous mission-specific hardware-in-the-loop qualification.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Service Availability and Modifications</h2>
            <p>
              The Pixel-Moon development team reserves the right to deploy algorithm improvements, performance
              optimizations, and security updates to the backend services without prior notice. Continuous,
              uninterrupted uptime is targeted but not guaranteed under catastrophic cloud infrastructure events.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Governing Law and Repository Attribution</h2>
            <p>
              These terms are established under the open-source governance guidelines of the project repository.
              For questions regarding algorithmic licensing, contributions, or academic citation, refer to
              the project documentation maintained by <strong>HackerVilla / TEAM CODE_CHAOS</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
