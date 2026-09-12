import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 3D Photorealistic Moon & Satellite Loader:
 * - Real 3D Moon sphere rotating on its axis in the opposite direction (counter-clockwise)
 * - Fixed circular orbit perimeter around the Moon
 * - 3D Chandrayaan satellite placed on the orbit, revolving smoothly along the perimeter of the orbit (clockwise)
 */
function ThreeDChandrayaanLoader({ dim = 150 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = dim;
    const height = dim;

    // 1. Scene & Camera (Top-view with subtle inclination to see full 3D sphericity and true circular orbit)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    // Camera overhead slightly inclined: circular orbit looks clean and spherical depth of moon is clear
    camera.position.set(0, 4.4, 0.1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Cosmic Space Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1628, 0.55);
    scene.add(ambientLight);

    // Collimated directional sunlight casting realistic lunar crater relief
    const sunLight = new THREE.DirectionalLight(0xfff6ea, 2.4);
    sunLight.position.set(4.8, 1.8, 3.2);
    scene.add(sunLight);

    // Subtle cyan backlight for orbit visibility
    const backRim = new THREE.DirectionalLight(0x38bdf8, 0.4);
    backRim.position.set(-3.5, 1.0, -3.5);
    scene.add(backRim);

    // 3. Central 3D Moon Sphere
    const moonRadius = 1.08;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xd2d5da,
      roughness: 0.95,
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

    // 4. Circular Orbit (The Fixed Perimeter of the Lunar Orbit)
    const orbitRadius = 1.54; // Low lunar orbit, skimming just above the surface
    const orbitPts = [];
    const segs = 96;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      orbitPts.push(new THREE.Vector3(Math.cos(a) * orbitRadius, 0, Math.sin(a) * orbitRadius));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.88,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);

    // Glowing subtle halo along the orbit line
    const ringGeo = new THREE.RingGeometry(orbitRadius - 0.024, orbitRadius + 0.024, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    scene.add(ringMesh);

    // 5. 3D Chandrayaan Satellite (Placed strictly ON the perimeter of the orbit)
    const satGroup = new THREE.Group();

    // Golden MLI Thermal Blanket Bus Body
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xedb338,
      metalness: 0.88,
      roughness: 0.22,
    });
    const bodyGeo = new THREE.BoxGeometry(0.24, 0.16, 0.20);
    const bodyMesh = new THREE.Mesh(bodyGeo, goldMat);
    satGroup.add(bodyMesh);

    // Solar Panel Arrays (Left and Right Wings)
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0e2a58,
      metalness: 0.55,
      roughness: 0.25,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.25,
    });

    [-1, 1].forEach((dir) => {
      const panelGroup = new THREE.Group();
      panelGroup.position.set(dir * 0.28, 0, 0);

      const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.016, 0.18), solarMat);
      panelGroup.add(panelMesh);

      const rimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.02, 0.19), frameMat);
      panelGroup.add(rimMesh);

      satGroup.add(panelGroup);
    });

    // Parabolic High-Gain Antenna Dish pointing outward to space
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2,
    });
    const dishGeo = new THREE.CylinderGeometry(0.09, 0.02, 0.04, 16);
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.position.set(0, 0.12, -0.06);
    dishMesh.rotation.x = -0.4;
    satGroup.add(dishMesh);

    // Optical Science Aperture pointing down toward the Moon
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const lensGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12);
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(0, -0.09, 0);
    satGroup.add(lensMesh);

    // Pulsing Cyan Beacon
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const beaconGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, 0.11, 0.08);
    satGroup.add(beaconMesh);

    scene.add(satGroup);

    // 6. Animation Loop
    let animId;
    let orbitAngle = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // (a) 3D Moon rotates on its axis COUNTER-CLOCKWISE (opposite direction)
      moonMesh.rotation.y -= 0.006;

      // (b) Satellite revolves along the PERIMETER of the orbit circle CLOCKWISE
      orbitAngle += 0.018;

      // Position satellite strictly on the orbit perimeter
      satGroup.position.set(
        Math.cos(orbitAngle) * orbitRadius,
        0,
        Math.sin(orbitAngle) * orbitRadius
      );

      // Orient satellite tangent to the orbit perimeter (forward-facing in flight direction)
      satGroup.rotation.y = -orbitAngle + Math.PI / 2;

      // Subtle pulse on beacon
      const t = Date.now() * 0.005;
      beaconMesh.scale.setScalar(0.8 + 0.4 * Math.sin(t));

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      bodyGeo.dispose();
      goldMat.dispose();
      solarMat.dispose();
      frameMat.dispose();
      dishGeo.dispose();
      dishMat.dispose();
      lensGeo.dispose();
      lensMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
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
      <circle cx="50" cy="50" r="32" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.85" />
      <circle cx="50" cy="50" r="20" fill="#94a3b8" />
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
        <rect x="41" y="16.5" width="5" height="3" fill="#1e3a8a" />
        <rect x="54" y="16.5" width="5" height="3" fill="#1e3a8a" />
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
  // Modal size for clean floating upload loader is 150px; lg is 150px; md is 90px; sm is 26px
  const dim = isSm ? 26 : isSpinner ? 70 : isModal ? 150 : isLg ? 150 : isXl ? 180 : 90;

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

  // For "EXECUTE SUB-PIXEL REGISTRATION" (Upload tab): 3D Moon rotating opposite + satellite revolving on orbit perimeter
  return (
    <div className="loading-modal-backdrop page-fade" role="status" aria-label="Executing Sub-Pixel Registration">
      <div className="clean-floating-loader-wrap">
        <ChandrayaanLoader size="modal" />
      </div>
    </div>
  );
}
