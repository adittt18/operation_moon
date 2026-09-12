import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────────────────────
 *  STARFIELD
 * ───────────────────────────────────────────────────────────────────────────*/
function makeStarfield() {
  const count = 1200;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = 20 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 2;

    const tint = 0.75 + Math.random() * 0.25;
    colors[i * 3] = tint * 0.88;
    colors[i * 3 + 1] = tint * 0.94;
    colors[i * 3 + 2] = tint;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.048,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.92,
    vertexColors: true,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  PHOTOVOLTAIC SOLAR CELL TEXTURE  (Dark navy blue grid with fine busbars)
 * ───────────────────────────────────────────────────────────────────────────*/
function makeSolarArrayTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');

  // Deep cosmic crystalline navy base
  ctx.fillStyle = '#061328';
  ctx.fillRect(0, 0, c.width, c.height);

  const cols = 6;
  const rows = 8;
  const pad = 3;
  const cellW = (c.width - pad * (cols + 1)) / cols;
  const cellH = (c.height - pad * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = pad + col * (cellW + pad);
      const y = pad + r * (cellH + pad);

      // Crystalline solar cell with slight gradient
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, '#0c2242');
      grad.addColorStop(1, '#071830');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, cellW, cellH);

      // Silver / pale blue busbars
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + cellW / 2, y);
      ctx.lineTo(x + cellW / 2, y + cellH);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(96, 165, 250, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y + cellH / 2);
      ctx.lineTo(x + cellW, y + cellH / 2);
      ctx.stroke();
    }
  }

  // Golden perimeter frame & bracket lines
  ctx.strokeStyle = '#d49b1a';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, c.width, c.height);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  CHANDRAYAAN-2 VIKRAM LANDER  (Exact copy matching reference SS1)
 *  - Large side-mounted & deployable solar panel arrays
 *  - Gold MLI thermal insulation body & struts
 *  - Central gold top dome + antenna truss cage
 *  - Dual secondary sensor domes
 *  - 4 gold landing legs with cross-bracing & wide footpads
 *  - 4 main 800N liquid rocket engine nozzles + central thruster
 * ───────────────────────────────────────────────────────────────────────────*/
function buildVikramLander() {
  const group = new THREE.Group();
  const solarTex = makeSolarArrayTexture();

  // Materials
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xedb338,
    metalness: 0.92,
    roughness: 0.22,
  });

  const darkGoldMaterial = new THREE.MeshStandardMaterial({
    color: 0xaa7218,
    metalness: 0.86,
    roughness: 0.32,
  });

  const brightGoldMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5be2e,
    metalness: 0.95,
    roughness: 0.14,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.12,
  });

  const solarPanelMaterial = new THREE.MeshStandardMaterial({
    map: solarTex,
    metalness: 0.48,
    roughness: 0.22,
    side: THREE.DoubleSide,
  });

  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a202c,
    metalness: 0.92,
    roughness: 0.40,
  });

  // 1. Main Core: Octagonal / Pyramidal gold foil superstructure
  const coreBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.64, 0.52, 8),
    goldMaterial
  );
  coreBody.position.y = 0.06;
  coreBody.castShadow = true;
  coreBody.receiveShadow = true;
  group.add(coreBody);

  // Horizontal gold foil MLI bands
  [-0.12, 0.06, 0.20].forEach((yOff) => {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.485, 0.485, 0.04, 8),
      brightGoldMaterial
    );
    band.position.y = 0.06 + yOff;
    group.add(band);
  });

  // 2. LARGE SLANTED SOLAR PANELS (Covering the 4 main angled faces)
  // Matching SS1 where the solar panels are prominent, large, and dark blue!
  const panelAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const sidePanels = [];

  panelAngles.forEach((angle, idx) => {
    const hingeGroup = new THREE.Group();
    // Top pivot line
    hingeGroup.position.set(0, 0.28, 0);

    // Large solar panel wing (increased size to match SS1!)
    const panelWidth = 0.54;
    const panelHeight = 0.56;
    const panelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(panelWidth, panelHeight, 0.02),
      solarPanelMaterial
    );
    panelMesh.position.set(0, -panelHeight / 2, 0.54);
    panelMesh.castShadow = true;
    hingeGroup.add(panelMesh);

    // Gold border frame around the panel
    const frameGeoH = new THREE.BoxGeometry(panelWidth + 0.03, 0.024, 0.026);
    const frameTop = new THREE.Mesh(frameGeoH, brightGoldMaterial);
    frameTop.position.set(0, 0, 0.54);
    hingeGroup.add(frameTop);

    const frameBottom = new THREE.Mesh(frameGeoH, brightGoldMaterial);
    frameBottom.position.set(0, -panelHeight, 0.54);
    hingeGroup.add(frameBottom);

    const frameGeoV = new THREE.BoxGeometry(0.024, panelHeight, 0.026);
    const frameLeft = new THREE.Mesh(frameGeoV, brightGoldMaterial);
    frameLeft.position.set(-panelWidth / 2, -panelHeight / 2, 0.54);
    hingeGroup.add(frameLeft);

    const frameRight = new THREE.Mesh(frameGeoV, brightGoldMaterial);
    frameRight.position.set(panelWidth / 2, -panelHeight / 2, 0.54);
    hingeGroup.add(frameRight);

    // Initial slight inward slant matching the pyramid body
    hingeGroup.rotation.x = -0.26;

    const radialGroup = new THREE.Group();
    radialGroup.rotation.y = angle;
    radialGroup.add(hingeGroup);
    group.add(radialGroup);

    sidePanels.push({
      hinge: hingeGroup,
      openRotX: -0.68, // unfolds wide outward on click!
      closedRotX: -0.26, // resting flat against the body
    });
  });

  // 3. Deployable Lateral Solar Wings (Unfurl horizontally on click)
  const topWings = [];
  [-1, 1].forEach((dir) => {
    const wingHinge = new THREE.Group();
    wingHinge.position.set(dir * 0.32, 0.32, 0);

    const wingMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.016, 0.32),
      solarPanelMaterial
    );
    wingMesh.position.set(dir * 0.19, 0, 0);
    wingMesh.castShadow = true;
    wingHinge.add(wingMesh);

    // Gold edge rim
    const edgeTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.024, 0.32),
      brightGoldMaterial
    );
    edgeTrim.position.set(dir * 0.38, 0, 0);
    wingHinge.add(edgeTrim);

    wingHinge.rotation.z = dir * 0.12; // default folded
    group.add(wingHinge);

    topWings.push({
      hinge: wingHinge,
      dir,
      openRotZ: dir * 0.55,
      closedRotZ: dir * 0.12,
    });
  });

  // 4. Pragyan Rover Deployment Ramp
  const rampHinge = new THREE.Group();
  rampHinge.position.set(0, -0.18, 0.56);
  const rampMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.012, 0.46),
    darkGoldMaterial
  );
  rampMesh.position.set(0, -0.10, 0.22);
  rampMesh.castShadow = true;
  rampHinge.add(rampMesh);
  rampHinge.rotation.x = 0.44;
  group.add(rampHinge);

  const roverRamp = {
    hinge: rampHinge,
    openRotX: 0.52,
    closedRotX: -0.78,
  };

  // 5. 4 Spherical Gold Propellant Tanks
  const tankAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  tankAngles.forEach((ang) => {
    const tank = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 18, 18),
      brightGoldMaterial
    );
    tank.position.set(Math.cos(ang) * 0.42, 0.30, Math.sin(ang) * 0.42);
    tank.castShadow = true;
    group.add(tank);

    const bracket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.14, 6),
      darkGoldMaterial
    );
    bracket.position.set(Math.cos(ang) * 0.42, 0.20, Math.sin(ang) * 0.42);
    group.add(bracket);
  });

  // 6. UPPER DECK & DOMES (Exact copy of SS1)
  // Upper instrument deck
  const topDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 0.10, 8),
    darkGoldMaterial
  );
  topDeck.position.y = 0.36;
  topDeck.castShadow = true;
  group.add(topDeck);

  // Large Central Gold Dome (from SS1)
  const centralDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    brightGoldMaterial
  );
  centralDome.position.y = 0.41;
  centralDome.castShadow = true;
  group.add(centralDome);

  // Antenna Truss Cage on top of central dome (seen in SS1)
  const cageHeight = 0.14;
  const cageRadius = 0.08;
  const cagePillars = 6;
  for (let i = 0; i < cagePillars; i++) {
    const a = (i / cagePillars) * Math.PI * 2;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, cageHeight, 4),
      goldMaterial
    );
    pillar.position.set(Math.cos(a) * cageRadius, 0.41 + 0.15 + cageHeight / 2, Math.sin(a) * cageRadius);
    group.add(pillar);
  }
  const cageRing = new THREE.Mesh(
    new THREE.TorusGeometry(cageRadius, 0.008, 6, 16),
    brightGoldMaterial
  );
  cageRing.rotation.x = Math.PI / 2;
  cageRing.position.y = 0.41 + 0.15 + cageHeight;
  group.add(cageRing);

  // Center omni antenna mast
  const centerMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.18, 6),
    chromeMaterial
  );
  centerMast.position.y = 0.41 + 0.15 + cageHeight + 0.08;
  group.add(centerMast);

  // Two Secondary Gold Sensor Domes on diagonal corners (seen in SS1)
  [
    [-0.20, 0.14],
    [0.20, -0.14],
  ].forEach(([sx, sz]) => {
    const subDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      brightGoldMaterial
    );
    subDome.position.set(sx, 0.41, sz);
    group.add(subDome);
  });

  // 7. Landing Gear Assembly (4 outward angled legs with footpads & braces)
  const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  legAngles.forEach((ang) => {
    const legGroup = new THREE.Group();

    // Main structural strut (gold)
    const mainStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.028, 0.72, 8),
      goldMaterial
    );
    mainStrut.position.set(0, -0.36, 0);
    mainStrut.castShadow = true;
    legGroup.add(mainStrut);

    // Cross-braces
    const diagonalBrace1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.48, 6),
      chromeMaterial
    );
    diagonalBrace1.position.set(-0.14, -0.24, 0);
    diagonalBrace1.rotation.z = 0.54;
    legGroup.add(diagonalBrace1);

    const diagonalBrace2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.48, 6),
      chromeMaterial
    );
    diagonalBrace2.position.set(0.14, -0.24, 0);
    diagonalBrace2.rotation.z = -0.54;
    legGroup.add(diagonalBrace2);

    // Wide circular landing footpad
    const footPad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.105, 0.028, 16),
      brightGoldMaterial
    );
    footPad.position.set(0, -0.72, 0);
    footPad.castShadow = true;
    legGroup.add(footPad);

    legGroup.rotation.z = 0.50;
    legGroup.position.set(Math.cos(ang) * 0.54, -0.06, Math.sin(ang) * 0.54);
    legGroup.rotation.y = -ang + Math.PI / 4;
    group.add(legGroup);
  });

  // 8. 4 Main Liquid Rocket Thruster Nozzles + 1 Center Thruster
  const thrusterPositions = [
    [-0.16, -0.16],
    [0.16, -0.16],
    [-0.16, 0.16],
    [0.16, 0.16],
    [0, 0], // central 5th engine of Vikram
  ];
  thrusterPositions.forEach(([tx, tz]) => {
    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.065, 0.16, 12, 1, true),
      engineMaterial
    );
    nozzle.position.set(tx, -0.26, tz);
    nozzle.rotation.x = Math.PI;
    nozzle.castShadow = true;
    group.add(nozzle);
  });

  return { group, sidePanels, topWings, roverRamp };
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  EARTH  — Natural Blue Marble Earth, enlarged & floating high in starry sky
 * ───────────────────────────────────────────────────────────────────────────*/
/* ─────────────────────────────────────────────────────────────────────────────
 *  EARTH  — Natural Blue Marble Earth, background placement behind moon surface
 * ───────────────────────────────────────────────────────────────────────────*/
function buildEarth() {
  const group = new THREE.Group();
  const radius = 1.05; // slightly smaller as requested, perfectly balanced
  const loader = new THREE.TextureLoader();

  // Natural Earth material with specular reflection
  const earthMat = new THREE.MeshPhongMaterial({
    roughness: 0.55,
    metalness: 0.10,
    shininess: 22,
  });

  loader.load('/earth_atmos_2048.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    earthMat.map = tex;
    earthMat.specularMap = tex;
    earthMat.needsUpdate = true;
  });

  const earth = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 48), earthMat);
  earth.rotation.y = 1.25; // face the sunlit blue ocean and clouds forward
  group.add(earth);

  // Natural rotating cloud layer
  const cloudMat = new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  });

  loader.load('/earth_clouds_1024.png', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    cloudMat.map = tex;
    cloudMat.needsUpdate = true;
  });

  const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.018, 48, 48), cloudMat);
  clouds.rotation.y = 1.25;
  group.add(clouds);

  // Atmospheric Fresnel Rim Glow (Soft atmospheric blue rim)
  const glowMat = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(0x60a5fa) },
    },
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

  const glow = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.20, 48, 48), glowMat);
  group.add(glow);

  return { group, earth, clouds };
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  REALISTIC LUNAR TERRAIN  — Craters, ridges, rocks & NASA textures matching SS
 * ───────────────────────────────────────────────────────────────────────────*/
function buildLunarTerrain() {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();

  // High-res subdivided lunar ground plane (foreground terrain)
  const terrainGeo = new THREE.PlaneGeometry(28, 10, 90, 45);
  const pos = terrainGeo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    // Multi-frequency rolling lunar highland hills
    let roll =
      Math.sin(x * 0.38) * 0.32 +
      Math.cos(y * 0.60) * 0.22 +
      Math.sin(x * 1.1 + y * 0.85) * 0.12 +
      Math.sin(x * 2.8 - y * 2.2) * 0.04;

    // Real impact craters with depressed bowls and elevated ejecta rims!
    const craters = [
      { cx: -1.2, cy: 0.6, r: 2.0, depth: 0.32 },
      { cx: 1.8, cy: -0.4, r: 1.5, depth: 0.24 },
      { cx: 3.2, cy: 1.1, r: 2.6, depth: 0.36 },
      { cx: -2.6, cy: -0.6, r: 1.4, depth: 0.20 },
      { cx: 0.4, cy: 1.5, r: 1.1, depth: 0.16 },
      { cx: -0.5, cy: -0.7, r: 0.85, depth: 0.14 },
    ];
    for (const c of craters) {
      const dist = Math.hypot(x - c.cx, y - c.cy);
      if (dist < c.r * 1.6) {
        const norm = dist / c.r;
        if (norm < 1.0) {
          roll -= (1 - norm * norm) * c.depth;
        } else if (norm < 1.35) {
          const rim = 1 - (norm - 1.0) / 0.35;
          roll += rim * rim * (c.depth * 0.40);
        }
      }
    }

    pos.setZ(i, roll);
  }
  terrainGeo.computeVertexNormals();

  // Crisp silvery-grey lunar regolith matching SS2
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0xb2c2d4, // silvery lunar regolith with high-contrast sunlight
    roughness: 0.88,
    metalness: 0.08,
    flatShading: false,
  });

  // Load NASA Lunar Maps with high-frequency repeat for fine dust detail
  loader.load('/moon_1024.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 5);
    terrainMat.map = tex;
    terrainMat.needsUpdate = true;
  });

  loader.load('/moon_normal_1024.jpg', (tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 5);
    terrainMat.normalMap = tex;
    terrainMat.normalScale.set(2.2, 2.2);
    terrainMat.needsUpdate = true;
  });

  loader.load('/moon_bump_1024.jpg', (tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 5);
    terrainMat.bumpMap = tex;
    terrainMat.bumpScale = 0.06;
    terrainMat.needsUpdate = true;
  });

  loader.load('/moon_roughness_1024.jpg', (tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 5);
    terrainMat.roughnessMap = tex;
    terrainMat.needsUpdate = true;
  });

  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2.3;
  terrain.position.set(0.4, -1.30, -0.3);
  terrain.receiveShadow = true;
  group.add(terrain);

  // Background rugged crater ridge along horizon (sharp jagged peaks matching SS2)
  const ridgeGeo = new THREE.PlaneGeometry(36, 6, 80, 24);
  const rPos = ridgeGeo.attributes.position;
  for (let i = 0; i < rPos.count; i++) {
    const rx = rPos.getX(i);
    // Jagged mountain peaks with sharp crests
    let h = Math.abs(Math.sin(rx * 0.40 + 0.85)) * 0.95;
    h += Math.abs(Math.sin(rx * 0.90 - 0.55)) * 0.55;
    h += Math.abs(Math.sin(rx * 2.2 + 1.1)) * 0.28;
    h += Math.sin(rx * 4.6) * 0.12;
    // Edge fade
    const fade = Math.cos(Math.min(Math.PI / 2, (Math.abs(rx) / 18) * (Math.PI / 2)));
    rPos.setZ(i, Math.max(0, h * fade));
  }
  ridgeGeo.computeVertexNormals();

  const ridgeMat = new THREE.MeshStandardMaterial({
    color: 0x90a2b6, // sunlit silvery mountain ridge peaks
    roughness: 0.92,
    metalness: 0.06,
  });
  loader.load('/moon_1024.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 2.5);
    ridgeMat.map = tex;
    ridgeMat.needsUpdate = true;
  });
  loader.load('/moon_normal_1024.jpg', (tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 2.5);
    ridgeMat.normalMap = tex;
    ridgeMat.normalScale.set(2.0, 2.0);
    ridgeMat.needsUpdate = true;
  });

  const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
  ridge.rotation.x = -Math.PI / 2.6;
  ridge.position.set(0, -0.75, -3.2);
  ridge.receiveShadow = true;
  group.add(ridge);

  // Faceted angular lunar rocks (flat shaded to catch crisp planar sun glints, NOT smooth balls!)
  const rockGeo = new THREE.DodecahedronGeometry(0.09, 0);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x7c8c9e,
    roughness: 0.90,
    metalness: 0.10,
    flatShading: true,
  });
  const rockCoords = [
    [0.9, -1.02, 0.4],
    [-0.3, -1.06, 0.2],
    [1.5, -0.98, -0.2],
    [2.3, -1.12, 0.5],
    [-1.7, -1.02, 0.3],
    [0.2, -1.16, 0.8],
    [-0.9, -0.88, 1.0],
    [1.9, -0.92, 0.2],
    [3.1, -1.04, -0.3],
    [-0.5, -1.08, 0.6],
    [0.6, -1.14, 0.3],
  ];
  rockCoords.forEach(([rx, ry, rz], idx) => {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    const s = 0.55 + (idx % 4) * 0.35;
    // Irregular jagged scale
    rock.scale.set(s * 1.35, s * 0.75, s * 1.1);
    rock.position.set(rx, ry, rz);
    rock.rotation.set(idx * 0.85, idx * 1.25, idx * 0.45);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  });

  return group;
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  LANDER SHADOW DECAL  (Crisp directional shadow cast on moon dust)
 * ───────────────────────────────────────────────────────────────────────────*/
function makeLanderShadowDecal() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');

  // Directional shadow cast to the left/back matching the sun angle
  const grad = ctx.createRadialGradient(110, 130, 10, 110, 130, 110);
  grad.addColorStop(0, 'rgba(0, 4, 12, 0.84)');
  grad.addColorStop(0.5, 'rgba(0, 5, 14, 0.45)');
  grad.addColorStop(1, 'rgba(0, 5, 14, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(110, 130, 105, 65, -0.2, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.5),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    })
  );
  mesh.rotation.x = -Math.PI / 2.3;
  mesh.position.set(-0.20, -0.74, 0.75);
  return mesh;
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  COMPONENT
 * ───────────────────────────────────────────────────────────────────────────*/
export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 440;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 5.4);

    // Renderer with shadow map enabled
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Deep cosmic space navy — blends seamlessly in both themes!
    renderer.setClearColor(0x040a16, 1);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── LIGHTING ─────────────────────────────────────────────────────────────
    // Ambient cosmic light
    scene.add(new THREE.AmbientLight(0x0e1b30, 2.4));

    // Primary Sun — bright directional light casting sharp lunar shadows
    const sunLight = new THREE.DirectionalLight(0xfff6e6, 4.8);
    sunLight.position.set(5.5, 5.5, 4.0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 20;
    sunLight.shadow.camera.left = -3;
    sunLight.shadow.camera.right = 3;
    sunLight.shadow.camera.top = 3;
    sunLight.shadow.camera.bottom = -3;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Earth-shine fill / rim light from upper left
    const earthRim = new THREE.DirectionalLight(0x5a9eff, 1.8);
    earthRim.position.set(-4, 2.5, -2);
    scene.add(earthRim);

    // Warm lunar surface bounce
    const lunarBounce = new THREE.DirectionalLight(0xd4ab6e, 0.6);
    lunarBounce.position.set(0, -3, 2);
    scene.add(lunarBounce);

    // ── STARFIELD ────────────────────────────────────────────────────────────
    const stars = makeStarfield();
    scene.add(stars);

    // ── EARTH (Placed backward of the moon surface in the background) ────────
    const { group: earthGroup, earth, clouds } = buildEarth();
    earthGroup.position.set(2.05, 1.15, -4.5);
    scene.add(earthGroup);

    // ── LUNAR TERRAIN ────────────────────────────────────────────────────────
    const terrain = buildLunarTerrain();
    scene.add(terrain);

    // ── CONTACT SHADOW DECAL ─────────────────────────────────────────────────
    const shadowDecal = makeLanderShadowDecal();
    scene.add(shadowDecal);

    // ── CHANDRAYAAN-2 LANDER ─────────────────────────────────────────────────
    const {
      group: lander,
      sidePanels,
      topWings,
      roverRamp,
    } = buildVikramLander();

    // Positioned firmly on the lunar surface
    const landerBase = { x: 0.05, y: -0.12, z: 0.75 };
    const landerBaseRot = { x: 0.06, y: -0.24 };
    lander.position.set(landerBase.x, landerBase.y, landerBase.z);
    lander.rotation.set(landerBaseRot.x, landerBaseRot.y, 0);
    lander.scale.set(1.15, 1.15, 1.15);
    scene.add(lander);

    // Interactive State: Panels Deployed / Stowed
    let isDeployed = true;

    // Lander gentle cursor-tilt (position is permanently fixed)
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

      // Only lander tilts gently with cursor — Earth, terrain & position stay completely locked!
      targetRot.y = landerBaseRot.y + cx * 0.24;
      targetRot.x = landerBaseRot.x - cy * 0.12;

      // Hover pointer when cursor over lander
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(lander.children, true);
      container.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(lander.children, true);
      if (intersects.length > 0) {
        isDeployed = !isDeployed;
      }
    };

    const onPointerLeave = () => {
      targetRot.y = landerBaseRot.y;
      targetRot.x = landerBaseRot.x;
      container.style.cursor = 'default';
    };

    window.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);
    container.addEventListener('mouseleave', onPointerLeave);

    // Resize Observer
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

    // Animation Loop
    let reqId;
    const clock = new THREE.Clock();
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      // Earth & clouds rotate naturally — zero cursor interference
      earth.rotation.y += dt * 0.04;
      clouds.rotation.y += dt * 0.055;
      stars.rotation.y += dt * 0.0012;

      // Lander: smooth rotation tilt towards cursor, position stays fixed
      lander.rotation.y += (targetRot.y - lander.rotation.y) * 0.07;
      lander.rotation.x += (targetRot.x - lander.rotation.x) * 0.07;

      // Fluid solar panel open/close deployment animation on click
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
            if (m.normalMap) m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
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
      title="Click Chandrayaan-2 to deploy/close solar panels"
    />
  );
}
