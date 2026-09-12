import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Photorealistic procedural photovoltaic solar array texture:
 * - Deep crystalline space-blue silicon cells
 * - Silver busbars and electrical gridlines
 * - Golden perimeter edge framing
 */
function makeSolarTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d');

  // Deep space-grade navy blue base
  ctx.fillStyle = '#061328';
  ctx.fillRect(0, 0, c.width, c.height);

  const cols = 4;
  const rows = 2;
  const pad = 3;
  const cellW = (c.width - pad * (cols + 1)) / cols;
  const cellH = (c.height - pad * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = pad + col * (cellW + pad);
      const y = pad + r * (cellH + pad);

      // Crystalline photovoltaic cell gradient
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, '#164e87');
      grad.addColorStop(0.45, '#1e60aa');
      grad.addColorStop(1, '#0e315a');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, cellW, cellH);

      // Center silver electrical collector busbar
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + cellW / 2, y);
      ctx.lineTo(x + cellW / 2, y + cellH);
      ctx.stroke();

      // Fine horizontal gridlines
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.45)';
      ctx.lineWidth = 0.6;
      for (let g = 1; g < 4; g++) {
        const gy = y + (cellH / 4) * g;
        ctx.beginPath();
        ctx.moveTo(x + 1, gy);
        ctx.lineTo(x + cellW - 1, gy);
        ctx.stroke();
      }
    }
  }

  // Golden perimeter frame & bracket lines
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(1, 1, c.width - 2, c.height - 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Photorealistic 3D Moon & Satellite Loader:
 * 1. 100% in-frame guaranteed: generous camera frustum so satellite never leaves frame.
 * 2. Orbit of light grey rocks in X-Y plane (like Saturn from top view), rotating clockwise.
 * 3. 3D Moon upright, rotating on vertical Y-axis in reverse of MoonGlobe, with lightened bright surface.
 * 4. Lightened satellite color (pale radiant champagne gold) with realistic photovoltaic solar panels that open/close automatically while self-rotating.
 */
function ThreeDChandrayaanLoader({ dim = 80 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = dim;
    const height = dim;

    // 1. Scene & Camera (Wide frustum ensuring satellite and orbit NEVER leave the frame)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 5.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Clean Lighting: Vibrant illumination for lightened Moon & radiant light-gold satellite
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
    sunLight.position.set(4.5, 2.2, 3.5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.4);
    fillLight.position.set(-3.5, 1.0, 3.0);
    scene.add(fillLight);

    // Dedicated bright frontal light so satellite glistens brightly
    const satFrontLight = new THREE.DirectionalLight(0xffffff, 1.2);
    satFrontLight.position.set(0, 0, 4.5);
    scene.add(satFrontLight);

    // 3. Central 3D Moon Sphere (Lightened bright surface, upright, rotating in reverse direction of MoonGlobe)
    const moonRadius = 0.48;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // lightened pure bright lunar base
      roughness: 0.80,
      metalness: 0.0,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/moon_1024.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      moonMat.map = tex;
      moonMat.needsUpdate = true;
    });

    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);

    // 4. Orbit of Light Grey Rocks (Completely within view with large safety margin)
    const orbitRadius = 0.88;
    const orbitRocksGroup = new THREE.Group();

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde6, // light grey natural rock
      roughness: 0.92,
      metalness: 0.08,
      flatShading: true,
    });

    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockCount = 76;

    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
      const rad = orbitRadius + (Math.random() - 0.5) * 0.04;
      const zJitter = (Math.random() - 0.5) * 0.04;

      const rockMesh = new THREE.Mesh(rockGeo, rockMat);
      rockMesh.position.set(
        Math.cos(angle) * rad,
        Math.sin(angle) * rad,
        zJitter
      );

      // Varied rock boulder shapes
      const baseScale = 0.015 + Math.random() * 0.016;
      rockMesh.scale.set(
        baseScale * (0.8 + Math.random() * 0.5),
        baseScale * (0.8 + Math.random() * 0.5),
        baseScale * (0.7 + Math.random() * 0.6)
      );

      rockMesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      orbitRocksGroup.add(rockMesh);
    }

    // Faint circular guiding trajectory through the rocks
    const linePts = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      linePts.push(new THREE.Vector3(Math.cos(a) * orbitRadius, Math.sin(a) * orbitRadius, 0));
    }
    const faintLineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    const faintLineMat = new THREE.LineBasicMaterial({
      color: 0xc4cbd8,
      transparent: true,
      opacity: 0.35,
    });
    orbitRocksGroup.add(new THREE.Line(faintLineGeo, faintLineMat));

    scene.add(orbitRocksGroup);

    // 5. Lightened High-Visibility Satellite with Realistic Solar Panels
    const satHolder = new THREE.Group(); // controls position on orbit perimeter
    const satCraft = new THREE.Group();  // controls satellite self-rotation

    // Lightened Pale Champagne Gold MLI Body (Radiant, high visibility)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // light pale champagne gold
      metalness: 0.88,
      roughness: 0.12,
    });
    const bodyGeo = new THREE.BoxGeometry(0.28, 0.20, 0.20);
    const bodyMesh = new THREE.Mesh(bodyGeo, goldMat);
    satCraft.add(bodyMesh);

    // Bright White High-Gain Dish Antenna
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.8,
      roughness: 0.15,
    });
    const dishGeo = new THREE.CylinderGeometry(0.11, 0.02, 0.045, 16);
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.position.set(0, 0.15, 0);
    dishMesh.rotation.x = Math.PI;
    satCraft.add(dishMesh);

    // Cyan Optical Science Beacon
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const beaconGeo = new THREE.SphereGeometry(0.042, 12, 12);
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, -0.13, 0.08);
    satCraft.add(beaconMesh);

    // Realistic Photovoltaic Solar Panel Texture
    const solarTex = makeSolarTexture();
    const solarPanelMat = new THREE.MeshStandardMaterial({
      map: solarTex,
      metalness: 0.55,
      roughness: 0.22,
      side: THREE.DoubleSide,
    });

    const solarFrameMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Left Solar Wing (opens and closes automatically)
    const leftWingHinge = new THREE.Group();
    leftWingHinge.position.set(-0.14, 0, 0);
    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.20, 0.02), solarPanelMat);
    leftPanel.position.set(-0.18, 0, 0);
    leftWingHinge.add(leftPanel);
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.21, 0.024), solarFrameMat);
    leftFrame.position.set(-0.18, 0, 0);
    leftWingHinge.add(leftFrame);
    satCraft.add(leftWingHinge);

    // Right Solar Wing (opens and closes automatically)
    const rightWingHinge = new THREE.Group();
    rightWingHinge.position.set(0.14, 0, 0);
    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.20, 0.02), solarPanelMat);
    rightPanel.position.set(0.18, 0, 0);
    rightWingHinge.add(rightPanel);
    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.21, 0.024), solarFrameMat);
    rightFrame.position.set(0.18, 0, 0);
    rightWingHinge.add(rightFrame);
    satCraft.add(rightWingHinge);

    satHolder.add(satCraft);
    scene.add(satHolder);

    // 6. Animation Loop
    let animId;
    let orbitAngle = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // 1) 3D Moon rotates on its vertical Y-axis in REVERSE direction of MoonGlobe (dont change with moon!)
      moonMesh.rotation.y -= 0.0032;

      // 2) Orbit of light grey rocks in front view rotates CLOCKWISE (like Saturn from top view)
      orbitRocksGroup.rotation.z -= 0.009;

      // 3) Satellite travels along the PERIMETER of the orbit circle CLOCKWISE (guaranteed in-frame)
      orbitAngle -= 0.016;
      satHolder.position.set(
        Math.cos(orbitAngle) * orbitRadius,
        Math.sin(orbitAngle) * orbitRadius,
        0.05
      );

      // 4) Satellite rotates on its own axis while revolving in the orbit
      satCraft.rotation.z += 0.026;
      satCraft.rotation.y = Math.sin(elapsedTime * 2.0) * 0.28;

      // 5) Solar panels automatically open and close smoothly
      const foldCycle = (Math.sin(elapsedTime * 1.8) + 1) / 2; // 0 (open) to 1 (closed)
      const foldAngle = foldCycle * 1.25;
      leftWingHinge.rotation.y = foldAngle;
      rightWingHinge.rotation.y = -foldAngle;

      // Beacon gentle pulse
      beaconMesh.scale.setScalar(0.85 + 0.35 * Math.sin(elapsedTime * 6));

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      rockGeo.dispose();
      rockMat.dispose();
      faintLineGeo.dispose();
      faintLineMat.dispose();
      bodyGeo.dispose();
      goldMat.dispose();
      dishGeo.dispose();
      dishMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      solarPanelMat.dispose();
      solarFrameMat.dispose();
      solarTex.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [dim]);

  return (
    <div
      ref={mountRef}
      style={{
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    />
  );
}

/**
 * Fallback lightweight SVG loader for miniature button states (size="sm")
 */
function TinySvgLoader({ dim = 26 }) {
  return (
    <svg viewBox="0 0 100 100" width={dim} height={dim} aria-hidden="true">
      <circle cx="50" cy="50" r="32" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.85" />
      <circle cx="50" cy="50" r="20" fill="#cbd5e1" />
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="2.5s"
          repeatCount="indefinite"
        />
        <rect x="47" y="15" width="6" height="6" rx="1" fill="#f59e0b" />
        <rect x="41" y="16.5" width="5" height="3" fill="#1d4ed8" />
        <rect x="54" y="16.5" width="5" height="3" fill="#1d4ed8" />
      </g>
    </svg>
  );
}

export default function ChandrayaanLoader({ size = 'md', label = '' }) {
  const isSm = size === 'sm';
  const isSpinner = size === 'spinner';
  const isModal = size === 'modal';
  const isLg = size === 'lg';
  const isXl = size === 'xl';
  // Modal size for clean floating upload loader is 80px; lg is 96px; md is 68px; sm is 26px
  const dim = isSm ? 26 : isSpinner ? 52 : isModal ? 80 : isLg ? 96 : isXl ? 116 : 68;

  if (isSm) {
    return (
      <div className={`chandrayaan-mature-loader size-${size}`} style={{ width: dim, height: dim }}>
        <TinySvgLoader dim={dim} />
        {label && <span className="loader-label">{label}</span>}
      </div>
    );
  }

  return (
    <div className={`chandrayaan-mature-loader size-${size}`} style={{ width: dim, height: dim }}>
      <ThreeDChandrayaanLoader dim={dim} />
      {label && <span className="loader-label">{label}</span>}
    </div>
  );
}

export function RegistrationLoadingModal({ isProcessing, processingType = 'upload' }) {
  if (!isProcessing) return null;

  // For "RUN REGISTRATION" (Home tab / sample select): Reverted to original detailed card modal
  if (processingType === 'sample') {
    return (
      <div className="loading-modal-backdrop page-fade" role="status" aria-label="Running Registration Pipeline">
        <div className="loading-modal-card glass-card">
          <ChandrayaanLoader size="lg" />
          <div className="loading-modal-content">
            <span className="loading-badge">CHANDRAYAAN-2 · PIPELINE RUNNING</span>
            <h3>Sub-Pixel Lunar Image Registration</h3>
            <p className="loading-sub">
              Harmonizing sensor scales, detecting 4×4 SIFT features, computing FLANN KDTree matches &amp; refining homography with cornerSubPix...
            </p>
            <div className="orbiting-status-pill">
              <span className="pulse-dot" />
              <span>Aligning with NASA LRO NAC Reference</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For "EXECUTE SUB-PIXEL REGISTRATION" (Upload tab): Compact 80px 3D Moon with rock orbit, 100% in-frame, lightened satellite with authentic solar panels
  return (
    <div className="loading-modal-backdrop page-fade" role="status" aria-label="Executing Sub-Pixel Registration">
      <div className="clean-floating-loader-wrap">
        <ChandrayaanLoader size="modal" />
      </div>
    </div>
  );
}
