import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Photorealistic 3D Moon & Satellite Loader:
 * 1. Compact 94px display (smaller, fully shown with zero clipping).
 * 2. Complete circular orbit of light grey rocks in X-Y plane (like Saturn from top view), rotating clockwise.
 * 3. 3D Moon upright, rotating on its vertical axis in reverse direction of MoonGlobe, with lightened bright surface.
 * 4. Exact same satellite size: high-visibility, self-rotating on its axis while revolving, and auto opening/closing solar panels.
 */
function ThreeDChandrayaanLoader({ dim = 94 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = dim;
    const height = dim;

    // 1. Scene & Camera (Front view with generous FOV so orbit & satellite are completely visible without clipping)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 4.3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Bright, Clean Lighting for Lightened Lunar Surface
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.9);
    sunLight.position.set(4.5, 2.2, 3.5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.3);
    fillLight.position.set(-3.5, 1.0, 3.0);
    scene.add(fillLight);

    // 3. Central 3D Moon Sphere (Upright, Rotating on Vertical Y-Axis in Reverse of MoonGlobe)
    const moonRadius = 0.72;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // lightened bright lunar surface
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

    // 4. Orbit of Light Grey Rocks (Completely within View, Like Saturn from Top View)
    const orbitRadius = 1.22;
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
      const rad = orbitRadius + (Math.random() - 0.5) * 0.06;
      const zJitter = (Math.random() - 0.5) * 0.06;

      const rockMesh = new THREE.Mesh(rockGeo, rockMat);
      rockMesh.position.set(
        Math.cos(angle) * rad,
        Math.sin(angle) * rad,
        zJitter
      );

      // Varied rock boulder shapes
      const baseScale = 0.022 + Math.random() * 0.024;
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

    // 5. 3D SATELLITE (Exact Same Size: 0.32 body, 0.42 wings, high-gain dish & beacon!)
    const satHolder = new THREE.Group(); // controls position on orbit perimeter
    const satCraft = new THREE.Group();  // controls satellite self-rotation

    // Golden MLI Bus Body (Exact same dimensions)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.16,
    });
    const bodyGeo = new THREE.BoxGeometry(0.32, 0.24, 0.24);
    const bodyMesh = new THREE.Mesh(bodyGeo, goldMat);
    satCraft.add(bodyMesh);

    // High-Gain Dish Antenna (Exact same dimensions)
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.8,
      roughness: 0.2,
    });
    const dishGeo = new THREE.CylinderGeometry(0.13, 0.02, 0.05, 16);
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.position.set(0, 0.18, 0);
    dishMesh.rotation.x = Math.PI;
    satCraft.add(dishMesh);

    // Cyan Science Payload Beacon (Exact same dimensions)
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const beaconGeo = new THREE.SphereGeometry(0.048, 12, 12);
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, -0.15, 0.09);
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

    // Left Wing Hinge (Exact same dimensions, opens and closes automatically)
    const leftWingHinge = new THREE.Group();
    leftWingHinge.position.set(-0.16, 0, 0);
    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.024), solarTexMat);
    leftPanel.position.set(-0.21, 0, 0);
    leftWingHinge.add(leftPanel);
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.25, 0.028), solarFrameMat);
    leftFrame.position.set(-0.21, 0, 0);
    leftWingHinge.add(leftFrame);
    satCraft.add(leftWingHinge);

    // Right Wing Hinge (Exact same dimensions, opens and closes automatically)
    const rightWingHinge = new THREE.Group();
    rightWingHinge.position.set(0.16, 0, 0);
    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.024), solarTexMat);
    rightPanel.position.set(0.21, 0, 0);
    rightWingHinge.add(rightPanel);
    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.25, 0.028), solarFrameMat);
    rightFrame.position.set(0.21, 0, 0);
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

      // 3) Satellite travels along the PERIMETER of the orbit circle CLOCKWISE
      orbitAngle -= 0.016;
      satHolder.position.set(
        Math.cos(orbitAngle) * orbitRadius,
        Math.sin(orbitAngle) * orbitRadius,
        0.05 // in front layer for maximum visibility
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
  // Modal size for clean floating upload loader is 94px (smaller & 100% shown without clipping); lg is 110px; md is 76px; sm is 26px
  const dim = isSm ? 26 : isSpinner ? 56 : isModal ? 94 : isLg ? 110 : isXl ? 130 : 76;

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

  // For "EXECUTE SUB-PIXEL REGISTRATION" (Upload tab): Compact 94px 3D Moon with Saturn-like top-view rock orbit, completely shown, same satellite size
  return (
    <div className="loading-modal-backdrop page-fade" role="status" aria-label="Executing Sub-Pixel Registration">
      <div className="clean-floating-loader-wrap">
        <ChandrayaanLoader size="modal" />
      </div>
    </div>
  );
}
