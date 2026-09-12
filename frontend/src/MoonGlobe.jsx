import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pause, Play, MapPin, X, Rocket } from 'lucide-react';
import { createShootingStarSystem } from './shootingStars';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';


function makePhotorealisticSpace() {
  const group = new THREE.Group();

  // 1. Deep Field Stars with Realistic Spectral Classes (O, B, A, F, G, K, M)
  const starCount = 3600;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  const starPalettes = [
    [0.78, 0.88, 1.0],   // Class O/B - Brilliant Blue-White
    [0.92, 0.96, 1.0],   // Class A - Crisp Pure White
    [1.0, 1.0, 1.0],     // Pure White
    [1.0, 0.95, 0.84],   // Class F/G - Warm Solar Yellow
    [1.0, 0.82, 0.62],   // Class K - Soft Amber
    [1.0, 0.65, 0.50],   // Class M - Distant Red Giant
  ];

  for (let i = 0; i < starCount; i++) {
    const r = 35 + Math.random() * 85;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Realistic power-law brightness distribution (mostly faint pinpricks, a few prominent beacons)
    const baseColor = starPalettes[Math.floor(Math.random() * starPalettes.length)];
    const mag = Math.pow(Math.random(), 2.8);
    const lum = 0.3 + mag * 0.7;

    colors[i * 3] = baseColor[0] * lum;
    colors[i * 3 + 1] = baseColor[1] * lum;
    colors[i * 3 + 2] = baseColor[2] * lum;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.052,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95,
    vertexColors: true,
    depthWrite: false,
  });
  group.add(new THREE.Points(starGeo, starMat));

  // 2. Realistic Milky Way Galactic Dust Band (Deep Cosmic Backplane)
  const nebulaCount = 1800;
  const nebPos = new Float32Array(nebulaCount * 3);
  const nebColors = new Float32Array(nebulaCount * 3);

  for (let i = 0; i < nebulaCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 50;
    const bandSpread = (Math.random() - 0.5) * 22;

    // Tilted galactic plane distribution
    const x = dist * Math.cos(angle);
    const y = dist * Math.sin(angle) * 0.42 + bandSpread;
    const z = dist * Math.sin(angle) * 0.88;

    nebPos[i * 3] = x;
    nebPos[i * 3 + 1] = y;
    nebPos[i * 3 + 2] = z;

    // Cosmic interstellar dust tones (deep indigo, subtle violet, faint cyan-stardust)
    const tint = Math.random();
    if (tint < 0.45) {
      nebColors[i * 3] = 0.18; nebColors[i * 3 + 1] = 0.32; nebColors[i * 3 + 2] = 0.65;
    } else if (tint < 0.8) {
      nebColors[i * 3] = 0.28; nebColors[i * 3 + 1] = 0.22; nebColors[i * 3 + 2] = 0.52;
    } else {
      nebColors[i * 3] = 0.38; nebColors[i * 3 + 1] = 0.42; nebColors[i * 3 + 2] = 0.62;
    }
  }

  const nebGeo = new THREE.BufferGeometry();
  nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
  nebGeo.setAttribute('color', new THREE.BufferAttribute(nebColors, 3));
  const nebMat = new THREE.PointsMaterial({
    size: 0.22,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.32,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  group.add(new THREE.Points(nebGeo, nebMat));

  return group;
}

export default function MoonGlobe({ sites = [], onSiteSelect, selectedSite }) {
  const mountRef = useRef(null);
  const [activeSiteInfo, setActiveSiteInfo] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const getContainerDims = () => {
      const w = container.clientWidth || (window.innerWidth < 768 ? window.innerWidth - 40 : 800);
      const h = container.clientHeight || (window.innerWidth < 768 ? Math.min(window.innerHeight * 0.55, 380) : 600);
      return { w, h };
    };

    const { w: initialW, h: initialH } = getContainerDims();

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, initialW / initialH, 0.1, 1000);
    const updateCameraDistance = (w) => {
      camera.position.set(0, 0, w < 480 ? 5.2 : w < 768 ? 4.8 : 4.4);
    };
    updateCameraDistance(initialW);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(initialW, initialH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic resize handler
    const handleResize = () => {
      if (!container) return;
      const { w, h } = getContainerDims();
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      updateCameraDistance(w);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(container);
    }
    window.addEventListener('resize', handleResize);

    // 2. Photorealistic Space Lighting (Single Collimated Sun + Non-directional Deep Space Void)
    // Non-directional ambient light ensures the shadowed side is authentically dark with ZERO specular shine
    const ambientCosmic = new THREE.AmbientLight(0x0c1626, 0.16);
    scene.add(ambientCosmic);

    // Hard collimated Sun light casting natural planetary shadows along crater rims and the terminator
    const sunLight = new THREE.DirectionalLight(0xfff6ea, 2.2);
    sunLight.position.set(5.5, 1.8, 3.8);
    scene.add(sunLight);

    // Add photorealistic deep space background
    scene.add(makePhotorealisticSpace());

    // Add photorealistic shooting stars & majestic comets strictly behind the 3D Moon
    const shootingStars = createShootingStarSystem({
      scene,
      camera,
      bounds: { minX: -16, maxX: 16, minY: -10, maxY: 12, minZ: -24, maxZ: -8 },
      poolSize: 5,
    });
    const clock = new THREE.Clock();

    // 3. Moon sphere with real NASA equirectangular lunar textures:
    // Pure matte diffuse lunar regolith: specular is strictly 0x000000 and shininess 0
    // guarantees ZERO shine or plastic gloss anywhere, especially on the shadowy side!
    const moonRadius = 1.5;
    const sphereGeo = new THREE.SphereGeometry(moonRadius, 128, 128);
    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: new THREE.Color(0x000000), // Zero specular reflection: absolutely NO shine or gloss!
      shininess: 0,                        // Zero shininess: pure matte dusty regolith
      flatShading: false,
      depthTest: true,
      depthWrite: true,
    });

    const textureLoader = new THREE.TextureLoader();
    const applyMoonTexture = (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      moonMaterial.map = texture;
      moonMaterial.needsUpdate = true;
    };
    const realMoonTexture = '/moon_1024.jpg';
    textureLoader.load(realMoonTexture, applyMoonTexture, undefined, () => {
      textureLoader.load(`${API_BASE}/moon-texture`, applyMoonTexture);
    });

    // High-resolution normal map catching physical crater relief
    textureLoader.load('/moon_normal_1024.jpg', (tex) => {
      tex.anisotropy = 8;
      moonMaterial.normalMap = tex;
      moonMaterial.normalScale.set(1.8, 1.8);
      moonMaterial.needsUpdate = true;
    });

    // Real tactile surface roughness & elevation relief via bump mapping
    textureLoader.load('/moon_bump_1024.jpg', (tex) => {
      tex.anisotropy = 8;
      moonMaterial.bumpMap = tex;
      moonMaterial.bumpScale = 0.05;
      moonMaterial.needsUpdate = true;
    });

    const moonMesh = new THREE.Mesh(sphereGeo, moonMaterial);
    moonMesh.renderOrder = 1;
    scene.add(moonMesh);

    // 4. Site Markers
    const markerGroup = new THREE.Group();
    const markers = [];

    const latLonToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    sites.forEach((site) => {
      const pos = latLonToVector3(site.lat, site.lon, moonRadius + 0.03);

      // Glowing pin mesh
      const pinGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = site;

      // Pulsing outer halo ring
      const ringGeo = new THREE.RingGeometry(0.06, 0.08, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x9ca3af,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      pinMesh.add(ringMesh);

      markerGroup.add(pinMesh);
      markers.push(pinMesh);
    });

    moonMesh.add(markerGroup);

    // 5. Orbit Interaction via mouse drag
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      moonMesh.rotation.y += deltaX * 0.006;
      moonMesh.rotation.x += deltaY * 0.006;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Raycaster for clicking markers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers, true);

      if (intersects.length > 0) {
        const clickedSite = intersects[0].object.userData || intersects[0].object.parent?.userData;
        if (clickedSite) {
          setActiveSiteInfo(clickedSite);
          if (onSiteSelect) onSiteSelect(clickedSite);
        }
      }
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      moonMesh.rotation.y += deltaX * 0.006;
      moonMesh.rotation.x += deltaY * 0.006;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e) => {
      isDragging = false;
      if (e.changedTouches && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers, true);
        if (intersects.length > 0) {
          const clickedSite = intersects[0].object.userData || intersects[0].object.parent?.userData;
          if (clickedSite) {
            setActiveSiteInfo(clickedSite);
            if (onSiteSelect) onSiteSelect(clickedSite);
          }
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onClick);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 6. Animation loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      shootingStars.update(dt, camera);
      if (autoRotate && !isDragging) {
        moonMesh.rotation.y += 0.0014;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      shootingStars.dispose();
      renderer.dispose();
    };
  }, [sites, autoRotate]);

  return (
    <div className="moon-globe-wrapper glass-card">
      <div className="globe-controls-bar">
        <h3>Interactive 3D Moon Surface & Registration Footprints</h3>
        <div className="globe-toggles">
          <button
            className={`btn btn-sm ${autoRotate ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? <Pause size={13} /> : <Play size={13} />}
            {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          </button>
        </div>
      </div>

      <div className="globe-canvas-container" ref={mountRef}></div>

      {/* Selected Landmark Info Drawer */}
      {activeSiteInfo && (
        <div className="site-info-overlay glass-card">
          <div className="site-header">
            <h4><MapPin size={14} style={{ verticalAlign: -2, marginRight: 4 }} />{activeSiteInfo.name}</h4>
            <button className="btn-close" onClick={() => setActiveSiteInfo(null)}><X size={16} /></button>
          </div>
          <div className="site-coords">
            <span>Lat: {activeSiteInfo.lat}°</span> · <span>Lon: {activeSiteInfo.lon}°</span>
          </div>
          <p className="site-desc">{activeSiteInfo.description}</p>
          <div className="site-action">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onSiteSelect && onSiteSelect(activeSiteInfo)}
            >
              <Rocket size={13} /> Register Sample Pair for this Site
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
