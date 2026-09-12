import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Photorealistic 3D Moon & Satellite Loader:
 * 1. Compact 120px display (smaller, sleeker).
 * 2. Orbit made out of light grey rocks / boulders, rotating clockwise.
 * 3. 3D Moon rotating on its axis in the reverse direction of MoonGlobe, with lightened, bright lunar colors.
 * 4. High-visibility 3D satellite revolving on the orbit, self-rotating on its own axis, and automatically opening/closing its solar panels.
 */
function ThreeDChandrayaanLoader({ dim = 120 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = dim;
    const height = dim;

    // 1. Scene & Camera (3D orbital vantage point matching MoonGlobe orientation)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.85, 3.85);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Bright, Clean Lighting for Lightened Lunar Surface
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(4.5, 2.0, 3.5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.2);
    fillLight.position.set(-3.5, 1.2, 3.2);
    scene.add(fillLight);

    // 3. Central 3D Moon Sphere (Lightened Color + Equirectangular Lunar Map)
    const moonRadius = 1.02;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // lightened pure bright lunar base
      roughness: 0.82,
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

    // 4. Orbit Made Out of Light Grey Rocks (Rotating Clockwise)
    const orbitRadius = 1.68;
    const orbitRocksGroup = new THREE.Group();

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde6, // light grey natural rock
      roughness: 0.92,
      metalness: 0.08,
      flatShading: true,
    });

    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockCount = 80;

    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
      const rad = orbitRadius + (Math.random() - 0.5) * 0.07;
      const yJitter = (Math.random() - 0.5) * 0.05;

      const rockMesh = new THREE.Mesh(rockGeo, rockMat);
      rockMesh.position.set(
        Math.cos(angle) * rad,
        yJitter,
        Math.sin(angle) * rad
      );

      // Varied rock scales
      const baseScale = 0.024 + Math.random() * 0.028;
      rockMesh.scale.set(
        baseScale * (0.8 + Math.random() * 0.5),
        baseScale * (0.7 + Math.random() * 0.6),
        baseScale * (0.8 + Math.random() * 0.5)
      );

      rockMesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      orbitRocksGroup.add(rockMesh);
    }

    // Faint guiding dust line through the rocks
    const linePts = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      linePts.push(new THREE.Vector3(Math.cos(a) * orbitRadius, 0, Math.sin(a) * orbitRadius));
    }
    const faintLineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    const faintLineMat = new THREE.LineBasicMaterial({
      color: 0xc4cbd8,
      transparent: true,
      opacity: 0.35,
    });
    orbitRocksGroup.add(new THREE.Line(faintLineGeo, faintLineMat));

    scene.add(orbitRocksGroup);

    // 5. High-Visibility 3D Chandrayaan Satellite (Opening/Closing Panels + Self-Rotating on Orbit)
    const satHolder = new THREE.Group(); // controls position on orbit perimeter
    const satCraft = new THREE.Group();  // controls satellite self-rotation

    // Golden MLI Bus Body (Vibrant, high visibility)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.94,
      roughness: 0.16,
    });
    const bodyGeo = new THREE.BoxGeometry(0.30, 0.22, 0.24);
    const bodyMesh = new THREE.Mesh(bodyGeo, goldMat);
    satCraft.add(bodyMesh);

    // High-Gain Dish Antenna
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.75,
      roughness: 0.2,
    });
    const dishGeo = new THREE.CylinderGeometry(0.12, 0.02, 0.05, 16);
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.position.set(0, 0.17, 0);
    dishMesh.rotation.x = Math.PI;
    satCraft.add(dishMesh);

    // Cyan Science Payload Beacon
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const beaconGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, -0.14, 0.09);
    satCraft.add(beaconMesh);

    // Solar Panel Materials (Deep space blue + gold framing)
    const solarTexMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.65,
      roughness: 0.22,
    });
    const solarFrameMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.22,
    });

    // Left Wing Hinge (opens and closes automatically)
    const leftWingHinge = new THREE.Group();
    leftWingHinge.position.set(-0.15, 0, 0);
    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.022, 0.22), solarTexMat);
    leftPanel.position.set(-0.20, 0, 0);
    leftWingHinge.add(leftPanel);
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.026, 0.23), solarFrameMat);
    leftFrame.position.set(-0.20, 0, 0);
    leftWingHinge.add(leftFrame);
    satCraft.add(leftWingHinge);

    // Right Wing Hinge (opens and closes automatically)
    const rightWingHinge = new THREE.Group();
    rightWingHinge.position.set(0.15, 0, 0);
    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.022, 0.22), solarTexMat);
    rightPanel.position.set(0.20, 0, 0);
    rightWingHinge.add(rightPanel);
    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.026, 0.23), solarFrameMat);
    rightFrame.position.set(0.20, 0, 0);
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

      // 1) 3D Moon rotates on its vertical axis in REVERSE direction of MoonGlobe
      moonMesh.rotation.y -= 0.0032;

      // 2) Orbit made of light grey rocks rotates CLOCKWISE
      orbitRocksGroup.rotation.y += 0.008;

      // 3) Satellite travels along the PERIMETER of the orbit (clockwise)
      orbitAngle += 0.016;
      satHolder.position.set(
        Math.cos(orbitAngle) * orbitRadius,
        0,
        Math.sin(orbitAngle) * orbitRadius
      );

      // 4) Satellite rotates on its own axis while revolving on the orbit
      satCraft.rotation.y += 0.026;
      satCraft.rotation.x = Math.sin(elapsedTime * 1.8) * 0.18;

      // 5) Solar panels automatically open and close smoothly
      const foldCycle = (Math.sin(elapsedTime * 1.6) + 1) / 2; // 0 (open) to 1 (closed)
      const foldAngle = foldCycle * 1.25; // 0 to 1.25 radians fold
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
      solarTexMat.dispose();
      solarFrameMat.dispose();
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
  // Modal size for clean floating upload loader is 120px (smaller & sleek); lg is 130px; md is 80px; sm is 26px
  const dim = isSm ? 26 : isSpinner ? 60 : isModal ? 120 : isLg ? 130 : isXl ? 150 : 80;

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

  // For "EXECUTE SUB-PIXEL REGISTRATION" (Upload tab): Compact 120px 3D Moon with rock orbit & self-rotating satellite with open/close panels
  return (
    <div className="loading-modal-backdrop page-fade" role="status" aria-label="Executing Sub-Pixel Registration">
      <div className="clean-floating-loader-wrap">
        <ChandrayaanLoader size="modal" />
      </div>
    </div>
  );
}
