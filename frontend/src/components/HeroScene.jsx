import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ---------------------------------------------------------------------
 * Helpers to build the scene's objects. Kept outside the component so
 * they aren't recreated on every render.
 * ------------------------------------------------------------------- */

function makeStarfield() {
  const count = 420;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 14 + Math.random() * 18;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xdfe9ff,
    size: 0.045,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

// Crumpled multi-layer-insulation "gold foil" look: a boxy geometry with
// per-vertex noise displacement + flat shading, so facets catch light
// unevenly just like real foil.
function makeFoilGeometry(w, h, d, seg, noise) {
  const geo = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      Math.sin(v.x * 26 + v.y * 11) *
      Math.cos(v.y * 19 - v.z * 14) *
      Math.sin(v.z * 23 + v.x * 7);
    const amt = n * noise;
    v.x += amt;
    v.y += amt * 0.7;
    v.z += amt;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function makePanelTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0b1526';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = 'rgba(96,165,250,0.55)';
  ctx.lineWidth = 2;
  const cols = 4, rows = 8;
  for (let i = 0; i <= cols; i++) {
    const x = (c.width / cols) * i;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    const y = (c.height / rows) * j;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildLander() {
  const group = new THREE.Group();

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd9a441,
    metalness: 0.75,
    roughness: 0.38,
    flatShading: true,
  });
  const darkGoldMat = new THREE.MeshStandardMaterial({
    color: 0x8a5a22,
    metalness: 0.7,
    roughness: 0.45,
    flatShading: true,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xc7cdd6,
    metalness: 0.85,
    roughness: 0.3,
  });

  // Body: crumpled octagonal-ish foil-wrapped core
  const bodyGeo = makeFoilGeometry(0.62, 0.42, 0.62, 5, 0.02);
  const body = new THREE.Mesh(bodyGeo, goldMat);
  body.position.y = 0.05;
  group.add(body);

  // Lower skirt (slightly darker foil, wider)
  const skirtGeo = makeFoilGeometry(0.78, 0.16, 0.78, 5, 0.015);
  const skirt = new THREE.Mesh(skirtGeo, darkGoldMat);
  skirt.position.y = -0.22;
  group.add(skirt);

  // Top instrument deck
  const deckGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.1, 8);
  const deck = new THREE.Mesh(deckGeo, metalMat);
  deck.position.y = 0.33;
  group.add(deck);

  // Antenna mast + dish
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6), metalMat);
  mast.position.y = 0.5;
  group.add(mast);
  const dish = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.05, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xe6e9ee, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide }),
  );
  dish.position.y = 0.63;
  dish.rotation.x = Math.PI;
  group.add(dish);

  // Legs (4) angled outward with footpads
  const legPositionsDeg = [45, 135, 225, 315];
  legPositionsDeg.forEach((deg) => {
    const rad = (deg * Math.PI) / 180;
    const leg = new THREE.Group();
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.024, 0.56, 6),
      metalMat,
    );
    strut.position.y = -0.28;
    leg.add(strut);

    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), darkGoldMat);
    pad.position.y = -0.56;
    leg.add(pad);

    leg.position.set(Math.cos(rad) * 0.28, -0.02, Math.sin(rad) * 0.28);
    leg.rotation.z = Math.cos(rad) * 0.55;
    leg.rotation.x = -Math.sin(rad) * 0.55;
    group.add(leg);
  });

  // Solar panel wings
  const panelTex = makePanelTexture();
  const panelMat = new THREE.MeshStandardMaterial({
    map: panelTex,
    metalness: 0.2,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });
  [-1, 1].forEach((side) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.015), panelMat);
    panel.position.set(side * 0.68, 0.12, 0);
    panel.rotation.z = side * 0.12;
    panel.rotation.y = 0.25;
    group.add(panel);

    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 5), metalMat);
    strut.rotation.z = Math.PI / 2;
    strut.position.set(side * 0.35, 0.14, 0);
    group.add(strut);
  });

  group.scale.setScalar(1.9);
  return group;
}

function buildEarth() {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const radius = 0.82;

  const earthMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x333333,
    shininess: 6,
  });
  loader.load('/earth_atmos_2048.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    earthMat.map = tex;
    earthMat.needsUpdate = true;
  });
  loader.load('/earth_specular_2048.jpg', (tex) => {
    earthMat.specularMap = tex;
    earthMat.needsUpdate = true;
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 48), earthMat);
  group.add(earth);

  const cloudMat = new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  loader.load('/earth_clouds_1024.png', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    cloudMat.map = tex;
    cloudMat.needsUpdate = true;
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.015, 48, 48), cloudMat);
  group.add(clouds);

  // Fresnel-style atmosphere rim glow
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(0x5fb0ff) } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      uniform vec3 glowColor;
      void main() {
        float intensity = pow(0.55 - dot(vNormal, vPositionNormal), 3.0);
        gl_FragColor = vec4(glowColor, 1.0) * intensity;
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.18, 48, 48), glowMat);
  group.add(glow);

  return { group, earth, clouds };
}

/* ---------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------- */

export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x6a80b0, 1.1));
    const sun = new THREE.DirectionalLight(0xfff2e0, 2.4);
    sun.position.set(4, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x5fa8ff, 0.6);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    const stars = makeStarfield();
    scene.add(stars);

    const { group: earthGroup, earth, clouds } = buildEarth();
    earthGroup.position.set(1.55, 0.85, -1.4);
    scene.add(earthGroup);

    const lander = buildLander();
    const landerBase = { x: -0.85, y: -0.62, z: 0.5 };
    const landerBaseRot = { x: 0.1, y: 0.55 };
    lander.position.set(landerBase.x, landerBase.y, landerBase.z);
    lander.rotation.set(landerBaseRot.x, landerBaseRot.y, 0);
    scene.add(lander);

    // -- cursor parallax: lander drifts + tilts toward the pointer -----
    const pointer = { x: 0, y: 0 };
    const targetLander = { rotX: landerBaseRot.x, rotY: landerBaseRot.y, posX: landerBase.x, posY: landerBase.y };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointer.x = Math.max(-1, Math.min(1, nx));
      pointer.y = Math.max(-1, Math.min(1, ny));
      targetLander.rotY = landerBaseRot.y + pointer.x * 0.45;
      targetLander.rotX = landerBaseRot.x - pointer.y * 0.28;
      targetLander.posX = landerBase.x + pointer.x * 0.22;
      targetLander.posY = landerBase.y - pointer.y * 0.14;
    };
    const onPointerLeave = () => {
      targetLander.rotY = landerBaseRot.y;
      targetLander.rotX = landerBaseRot.x;
      targetLander.posX = landerBase.x;
      targetLander.posY = landerBase.y;
    };
    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mouseleave', onPointerLeave);

    // -- resize -----------------------------------------------------
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      width = entry.contentRect.width || width;
      height = entry.contentRect.height || height;
      if (width < 2 || height < 2) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    ro.observe(container);

    // -- animation loop -----------------------------------------------
    let reqId;
    const clock = new THREE.Clock();
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      // "very slowly" — one full rotation roughly every 2+ minutes
      earth.rotation.y += dt * 0.05;
      clouds.rotation.y += dt * 0.065;
      stars.rotation.y += dt * 0.003;

      lander.rotation.y += (targetLander.rotY - lander.rotation.y) * 0.05;
      lander.rotation.x += (targetLander.rotX - lander.rotation.x) * 0.05;
      lander.position.x += (targetLander.posX - lander.position.x) * 0.05;
      lander.position.y += (targetLander.posY - lander.position.y) * 0.05;
      lander.position.z = landerBase.z + Math.sin(clock.elapsedTime * 0.6) * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      ro.disconnect();
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mouseleave', onPointerLeave);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
    };
  }, []);

  return <div className="hero-scene-canvas" ref={mountRef} aria-hidden="true" />;
}
