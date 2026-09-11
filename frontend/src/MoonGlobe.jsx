import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pause, Play, MapPin, X, Rocket } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';


function makeStarfield() {
  const count = 900;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 20 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xdfe9ff, size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.8, depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

export default function MoonGlobe({ sites = [], onSiteSelect, selectedSite }) {
  const mountRef = useRef(null);
  const [activeSiteInfo, setActiveSiteInfo] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting — soft hemisphere fill + a hard "sun" for real crater shadow relief
    const hemiLight = new THREE.HemisphereLight(0x5a6b8c, 0x0a0c14, 0.65);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e8, 2.9);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x4f7fdb, 0.5);
    rimLight.position.set(-4, -2, -4);
    scene.add(rimLight);

    scene.add(makeStarfield());

    // 3. Moon sphere with the real equirectangular lunar texture, plus a
    // normal map + roughness map derived from that same imagery so craters
    // actually catch light instead of looking painted-on.
    const moonRadius = 1.5;
    const sphereGeo = new THREE.SphereGeometry(moonRadius, 128, 128);
    const moonMaterial = new THREE.MeshStandardMaterial({
      roughness: 1,
      metalness: 0.02,
      normalScale: new THREE.Vector2(1.4, 1.4),
    });

    const textureLoader = new THREE.TextureLoader();
    const applyMoonTexture = (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      moonMaterial.map = texture;
      moonMaterial.needsUpdate = true;
    };
    const realMoonTexture = '/moon_1024.jpg';
    textureLoader.load(realMoonTexture, applyMoonTexture, undefined, () => {
      textureLoader.load(`${API_BASE}/moon-texture`, applyMoonTexture);
    });
    textureLoader.load('/moon_normal_1024.jpg', (tex) => {
      moonMaterial.normalMap = tex;
      moonMaterial.needsUpdate = true;
    });
    textureLoader.load('/moon_roughness_1024.jpg', (tex) => {
      moonMaterial.roughnessMap = tex;
      moonMaterial.needsUpdate = true;
    });

    const moonMesh = new THREE.Mesh(sphereGeo, moonMaterial);
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
      if (autoRotate && !isDragging) {
        moonMesh.rotation.y += 0.0014;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
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
