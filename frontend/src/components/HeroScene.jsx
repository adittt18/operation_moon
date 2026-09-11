import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* ---------------------------------------------------------------------
 * Helpers to build the scene's objects matching the cinematic ISRO
 * Chandrayaan-2 lander & lunar terrain reference.
 * ------------------------------------------------------------------- */

function makeStarfield() {
  const count = 750;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = 16 + Math.random() * 24;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 2;

    const tint = 0.8 + Math.random() * 0.2;
    colors[i * 3] = tint * 0.9;
    colors[i * 3 + 1] = tint * 0.95;
    colors[i * 3 + 2] = tint;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.045,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

// Photovoltaic solar array texture for the lander body & deployable wings
function makeSolarArrayTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');

  // Dark crystalline space navy
  ctx.fillStyle = '#081426';
  ctx.fillRect(0, 0, c.width, c.height);

  // Solar cell grid
  const cols = 6;
  const rows = 8;
  const pad = 2;
  const cellW = (c.width - pad * (cols + 1)) / cols;
  const cellH = (c.height - pad * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = pad + col * (cellW + pad);
      const y = pad + r * (cellH + pad);

      ctx.fillStyle = '#0f2444';
      ctx.fillRect(x, y, cellW, cellH);

      // Micro busbars
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + cellW / 2, y);
      ctx.lineTo(x + cellW / 2, y + cellH);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x, y + cellH / 2);
      ctx.lineTo(x + cellW, y + cellH / 2);
      ctx.stroke();
    }
  }

  // Gold border frame
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, c.width, c.height);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Builds the detailed interactive Vikram Lander with deployable panels
function buildVikramLander() {
  const group = new THREE.Group();

  // Materials
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xedb338,
    metalness: 0.9,
    roughness: 0.22,
    flatShading: true,
  });

  const darkGoldMaterial = new THREE.MeshStandardMaterial({
    color: 0xa46e1e,
    metalness: 0.84,
    roughness: 0.32,
    flatShading: true,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.94,
    roughness: 0.15,
  });

  const solarTex = makeSolarArrayTexture();
  const solarPanelMaterial = new THREE.MeshStandardMaterial({
    map: solarTex,
    metalness: 0.55,
    roughness: 0.28,
    bumpScale: 0.02,
  });

  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e2229,
    metalness: 0.92,
    roughness: 0.38,
  });

  // 1. Main Core: Octagonal / Pyramidal Gold Foil superstructure
  const coreBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.52, 0.46, 8),
    goldMaterial
  );
  coreBody.position.y = 0.05;
  group.add(coreBody);

  // 2. 4 Side Slanted Solar Panels with Hinges for Interactive Open/Close
  const panelAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const sidePanels = [];

  panelAngles.forEach((angle) => {
    const hingeGroup = new THREE.Group();
    hingeGroup.position.set(0, 0.24, 0); // top pivot point

    const panelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.42, 0.015),
      solarPanelMaterial
    );
    panelMesh.position.set(0, -0.21, 0.47);
    hingeGroup.add(panelMesh);

    // Gold edge struts
    const edgeStrutL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.44, 4),
      goldMaterial
    );
    edgeStrutL.position.set(-0.18, -0.21, 0.47);
    hingeGroup.add(edgeStrutL);

    const edgeStrutR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.44, 4),
      goldMaterial
    );
    edgeStrutR.position.set(0.18, -0.21, 0.47);
    hingeGroup.add(edgeStrutR);

    // Initial deployed angle
    hingeGroup.rotation.x = -0.28;

    const radialGroup = new THREE.Group();
    radialGroup.rotation.y = angle;
    radialGroup.add(hingeGroup);
    group.add(radialGroup);

    sidePanels.push({
      hinge: hingeGroup,
      openRotX: -0.45,
      closedRotX: -0.06,
    });
  });

  // 3. Deployable Top Solar Wings (Unfurl upwards on click)
  const topWings = [];
  [-1, 1].forEach((dir) => {
    const wingHinge = new THREE.Group();
    wingHinge.position.set(dir * 0.22, 0.32, 0);

    const wingMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.012, 0.22),
      solarPanelMaterial
    );
    wingMesh.position.set(dir * 0.14, 0, 0);
    wingHinge.add(wingMesh);

    wingHinge.rotation.z = dir * 0.15; // default partially extended
    group.add(wingHinge);

    topWings.push({
      hinge: wingHinge,
      dir,
      openRotZ: dir * 0.45,
      closedRotZ: 0,
    });
  });

  // 4. Pragyan Rover Deployment Ramp
  const rampHinge = new THREE.Group();
  rampHinge.position.set(0, -0.16, 0.48);
  const rampMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.01, 0.38),
    darkGoldMaterial
  );
  rampMesh.position.set(0, -0.08, 0.18);
  rampHinge.add(rampMesh);
  rampHinge.rotation.x = 0.42; // default lowered on ground
  group.add(rampHinge);

  const roverRamp = {
    hinge: rampHinge,
    openRotX: 0.48,
    closedRotX: -0.75,
  };

  // 5. 4 Spherical Gold Propellant Tanks
  const tankAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  tankAngles.forEach((ang) => {
    const tank = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 16, 16),
      goldMaterial
    );
    tank.position.set(Math.cos(ang) * 0.36, 0.28, Math.sin(ang) * 0.36);
    group.add(tank);

    const bracket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6),
      darkGoldMaterial
    );
    bracket.position.set(Math.cos(ang) * 0.36, 0.2, Math.sin(ang) * 0.36);
    group.add(bracket);
  });

  // 6. Upper Instrument Deck & Central Top Dome
  const topDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 0.08, 8),
    darkGoldMaterial
  );
  topDeck.position.y = 0.31;
  group.add(topDeck);

  const topDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    goldMaterial
  );
  topDome.position.y = 0.35;
  group.add(topDome);

  // Top communication antenna mast & steerable dish
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6),
    chromeMaterial
  );
  mast.position.y = 0.48;
  group.add(mast);

  const topDish = new THREE.Mesh(
    new THREE.ConeGeometry(0.085, 0.045, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.7, roughness: 0.25, side: THREE.DoubleSide })
  );
  topDish.position.y = 0.58;
  topDish.rotation.x = Math.PI * 0.95;
  group.add(topDish);

  // 7. Landing Gear Assembly (4 outward angled legs with footpads)
  const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  legAngles.forEach((ang) => {
    const legGroup = new THREE.Group();

    const mainStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.024, 0.62, 8),
      goldMaterial
    );
    mainStrut.position.set(0, -0.31, 0);
    legGroup.add(mainStrut);

    const diagonalBrace1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.42, 6),
      chromeMaterial
    );
    diagonalBrace1.position.set(-0.12, -0.22, 0);
    diagonalBrace1.rotation.z = 0.55;
    legGroup.add(diagonalBrace1);

    const diagonalBrace2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.42, 6),
      chromeMaterial
    );
    diagonalBrace2.position.set(0.12, -0.22, 0);
    diagonalBrace2.rotation.z = -0.55;
    legGroup.add(diagonalBrace2);

    // Wide circular landing footpad
    const footPad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 0.025, 16),
      goldMaterial
    );
    footPad.position.set(0, -0.62, 0);
    legGroup.add(footPad);

    legGroup.rotation.z = 0.48;
    legGroup.position.set(Math.cos(ang) * 0.48, -0.06, Math.sin(ang) * 0.48);
    legGroup.rotation.y = -ang + Math.PI / 4;
    group.add(legGroup);
  });

  // 8. 4 Main Liquid Rocket Thruster Nozzles at base
  const thrusterPositions = [
    [-0.14, -0.14],
    [0.14, -0.14],
    [-0.14, 0.14],
    [0.14, 0.14],
  ];
  thrusterPositions.forEach(([tx, tz]) => {
    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.14, 12, 1, true),
      engineMaterial
    );
    nozzle.position.set(tx, -0.24, tz);
    nozzle.rotation.x = Math.PI;
    group.add(nozzle);
  });

  return { group, sidePanels, topWings, roverRamp };
}

// Builds the high-detail Earth globe with rotating clouds & atmospheric glow
function buildEarth() {
  const group = new THREE.Group();
  const radius = 1.05;
  const loader = new THREE.TextureLoader();

  const earthMat = new THREE.MeshPhongMaterial({
    roughness: 0.6,
    metalness: 0.1,
    shininess: 18,
  });
  loader.load('/earth_atmos_2048.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    earthMat.map = tex;
    earthMat.specularMap = tex;
    earthMat.needsUpdate = true;
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 48), earthMat);
  group.add(earth);

  const cloudMat = new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  loader.load('/earth_clouds_1024.png', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    cloudMat.map = tex;
    cloudMat.needsUpdate = true;
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.018, 48, 48), cloudMat);
  group.add(clouds);

  // Atmospheric Fresnel Rim Glow
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(0x60a5fa) } },
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
        float intensity = pow(0.58 - dot(vNormal, vPositionNormal), 3.0);
        gl_FragColor = vec4(glowColor, 1.0) * intensity;
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.2, 48, 48), glowMat);
  group.add(glow);

  return { group, earth, clouds };
}

// Builds the photorealistic 3D cratered lunar surface ground with rocks
function buildLunarTerrain() {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();

  const terrainGeo = new THREE.PlaneGeometry(18, 10, 48, 36);
  const pos = terrainGeo.attributes.position;

  // Realistic rolling lunar crater hills & valleys
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const craterDist1 = Math.hypot(x + 1.2, y - 0.4);
    const crater1 = Math.sin(craterDist1 * 1.8) * 0.18 * Math.exp(-craterDist1 * 0.4);

    const craterDist2 = Math.hypot(x - 2.4, y + 1.2);
    const crater2 = Math.sin(craterDist2 * 2.2) * 0.14 * Math.exp(-craterDist2 * 0.5);

    const rolling =
      Math.sin(x * 0.6) * 0.24 +
      Math.cos(y * 0.9) * 0.16 +
      Math.sin(x * 1.8 + y * 1.4) * 0.06;

    pos.setZ(i, rolling + crater1 + crater2);
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x8898a8,
    roughness: 0.92,
    metalness: 0.08,
    flatShading: true,
  });

  loader.load('/moon_1024.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2.5);
    terrainMat.map = tex;
    terrainMat.needsUpdate = true;
  });

  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2.35;
  terrain.position.set(0.6, -1.25, -0.8);
  group.add(terrain);

  // Soft ambient contact shadow under lander touchdown point
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 5, 14, 0.7)');
  grad.addColorStop(0.6, 'rgba(0, 5, 14, 0.35)');
  grad.addColorStop(1, 'transparent');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.6),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.75, depthWrite: false })
  );
  shadowMesh.rotation.x = -Math.PI / 2.35;
  shadowMesh.position.set(-0.72, -0.68, 0.5);
  group.add(shadowMesh);

  // Scattered 3D lunar boulders around the landing zone
  const rockGeo = new THREE.DodecahedronGeometry(0.08, 1);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x6e7e92, roughness: 0.95 });
  const rockCoords = [
    [0.8, -1.0, 0.4],
    [-0.3, -1.05, 0.2],
    [1.4, -0.95, -0.1],
    [2.1, -1.1, 0.5],
    [-1.6, -1.0, 0.3],
    [0.1, -1.15, 0.7],
    [-0.9, -0.85, 0.9],
    [1.8, -0.9, 0.2],
  ];
  rockCoords.forEach(([rx, ry, rz], idx) => {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    const s = 0.55 + (idx % 3) * 0.4;
    rock.scale.set(s, s * 0.7, s);
    rock.position.set(rx, ry, rz);
    rock.rotation.set(idx * 0.8, idx * 1.2, 0);
    group.add(rock);
  });

  return group;
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
    let height = container.clientHeight || 440;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // Solid deep space background — visible in BOTH light and dark modes
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Deep space navy — rich and dark, works in both themes
    renderer.setClearColor(0x02060f, 1);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── LIGHTING ─────────────────────────────────────────────────────────────
    // Soft deep-space ambient (very dim, cool blue)
    scene.add(new THREE.AmbientLight(0x0d1f3c, 2.2));

    // Primary Sun — warm directional from top-right
    const sunLight = new THREE.DirectionalLight(0xfff4dc, 4.5);
    sunLight.position.set(6, 5, 4);
    scene.add(sunLight);

    // Cold blue rim / back-fill (simulates Earth-reflected light)
    const rimLight = new THREE.DirectionalLight(0x4a8fd4, 1.8);
    rimLight.position.set(-4, 1, -3);
    scene.add(rimLight);

    // Subtle warm bounce from lunar surface below
    const bounceLight = new THREE.DirectionalLight(0xd4a96a, 0.5);
    bounceLight.position.set(0, -3, 2);
    scene.add(bounceLight);

    // ── STARFIELD ────────────────────────────────────────────────────────────
    const stars = makeStarfield();
    scene.add(stars);

    // ── EARTH (fixed — no cursor interaction) ────────────────────────────────
    const { group: earthGroup, earth, clouds } = buildEarth();
    earthGroup.position.set(1.35, 0.85, -1.3);
    scene.add(earthGroup);

    // ── LUNAR TERRAIN ────────────────────────────────────────────────────────
    const terrain = buildLunarTerrain();
    scene.add(terrain);

    // ── LANDER ───────────────────────────────────────────────────────────────
    const {
      group: lander,
      sidePanels,
      topWings,
      roverRamp,
    } = buildVikramLander();

    // Lander stays at this position always — only rotation follows cursor
    const landerBase = { x: -0.72, y: -0.16, z: 0.7 };
    const landerBaseRot = { x: 0.08, y: 0.35 };
    lander.position.set(landerBase.x, landerBase.y, landerBase.z);
    lander.rotation.set(landerBaseRot.x, landerBaseRot.y, 0);
    lander.scale.set(1.08, 1.08, 1.08);
    scene.add(lander);

    // Panel deployment state
    let isDeployed = true;

    // Target rotation for lander (cursor-driven tilt only — no position change)
    const targetRot = { x: landerBaseRot.x, y: landerBaseRot.y };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      const cx = Math.max(-1, Math.min(1, nx));
      const cy = Math.max(-1, Math.min(1, ny));

      mouse.x = nx;
      mouse.y = -ny;

      // Gentle tilt of lander with cursor — Earth & terrain are completely unaffected
      targetRot.y = landerBaseRot.y + cx * 0.26;
      targetRot.x = landerBaseRot.x - cy * 0.14;

      // Pointer cursor when hovering lander
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(lander.children, true);
      container.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(lander.children, true);
      if (hits.length > 0) isDeployed = !isDeployed;
    };

    const onPointerLeave = () => {
      targetRot.y = landerBaseRot.y;
      targetRot.x = landerBaseRot.x;
      container.style.cursor = 'default';
    };

    window.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);
    container.addEventListener('mouseleave', onPointerLeave);

    // Resize
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

    // Animation loop
    let reqId;
    const clock = new THREE.Clock();
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      // Earth & stars self-animate — cursor has ZERO effect on them
      earth.rotation.y += dt * 0.045;
      clouds.rotation.y += dt * 0.06;
      stars.rotation.y += dt * 0.0015;

      // Lander: only rotation follows cursor, position is permanently fixed
      lander.rotation.y += (targetRot.y - lander.rotation.y) * 0.07;
      lander.rotation.x += (targetRot.x - lander.rotation.x) * 0.07;

      // Solar panel deploy animation
      sidePanels.forEach((p) => {
        const t = isDeployed ? p.openRotX : p.closedRotX;
        p.hinge.rotation.x += (t - p.hinge.rotation.x) * 0.08;
      });
      topWings.forEach((w) => {
        const t = isDeployed ? w.openRotZ : w.closedRotZ;
        w.hinge.rotation.z += (t - w.hinge.rotation.z) * 0.08;
      });
      const tr = isDeployed ? roverRamp.openRotX : roverRamp.closedRotX;
      roverRamp.hinge.rotation.x += (tr - roverRamp.hinge.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      ro.disconnect();
      window.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
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

  return (
    <div
      className="hero-scene-canvas"
      ref={mountRef}
      title="Click Chandrayaan to deploy/close solar panels"
    />
  );
}
