import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createShootingStarSystem } from '../shootingStars';

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
  const baseGroup = new THREE.Group();
  const upperGroup = new THREE.Group();
  group.add(baseGroup);
  group.add(upperGroup);

  const solarTex = makeSolarArrayTexture();
  const loader = new THREE.TextureLoader();

  const loadTex = (url, repeatX = 1, repeatY = 1, isSRGB = false) => {
    const tex = loader.load(url);
    tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.generateMipmaps = true;
    return tex;
  };

  const goldColorMap = loadTex('/lander_gold_color.jpg', 2, 2, true);
  const goldNormalMap = loadTex('/lander_gold_normal.jpg', 2, 2, false);
  const goldRoughnessMap = loadTex('/lander_gold_roughness.jpg', 2, 2, false);

  const metalNormalMap = loadTex('/lander_metal_normal.jpg', 1, 2, false);
  const metalRoughnessMap = loadTex('/lander_metal_roughness.jpg', 1, 2, false);

  const solarDiffuseMap = loadTex('/solar_panel_diffuse.jpg', 1, 1, true);
  const solarNormalMap = loadTex('/solar_panel_normal.jpg', 1, 1, false);
  const solarRoughnessMap = loadTex('/solar_panel_roughness.jpg', 1, 1, false);

  // Materials with authentic space MLI gold foil roughness and tactile relief (lightened & luminous)
  const goldMaterial = new THREE.MeshStandardMaterial({
    map: goldColorMap,
    color: 0xfff3cf,
    normalMap: goldNormalMap,
    normalScale: new THREE.Vector2(2.2, 2.2),
    roughnessMap: goldRoughnessMap,
    metalness: 0.88,
    roughness: 0.40,
  });

  const darkGoldMaterial = new THREE.MeshStandardMaterial({
    map: goldColorMap,
    color: 0xf0c765, // Lightened from dark brown to warm, luminous honey gold
    normalMap: goldNormalMap,
    normalScale: new THREE.Vector2(2.0, 2.0),
    roughnessMap: goldRoughnessMap,
    metalness: 0.84,
    roughness: 0.48,
  });

  const brightGoldMaterial = new THREE.MeshStandardMaterial({
    map: goldColorMap,
    color: 0xfffae6, // Brilliant gleaming champagne gold
    normalMap: goldNormalMap,
    normalScale: new THREE.Vector2(1.8, 1.8),
    roughnessMap: goldRoughnessMap,
    metalness: 0.92,
    roughness: 0.28,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8f0f8, // Bright clean space titanium/chrome
    normalMap: metalNormalMap,
    normalScale: new THREE.Vector2(1.2, 1.2),
    roughnessMap: metalRoughnessMap,
    metalness: 0.88,
    roughness: 0.35,
  });

  const solarPanelMaterial = new THREE.MeshPhysicalMaterial({
    map: solarTex,
    metalness: 0.45,          // Authentic semiconductor metalness matching previous version
    roughness: 0.20,          // Smooth protective coverglass
    clearcoat: 1.0,           // Aerospace quartz protective coverglass
    clearcoatRoughness: 0.10,  // Crystal-clear coverglass reflection
    reflectivity: 0.98,
    side: THREE.DoubleSide,
  });

  solarPanelMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uSunWorldDir = { value: new THREE.Vector3(5.05, 5.40, 1.75).normalize() };
    shader.fragmentShader = `
      uniform vec3 uSunWorldDir;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      // Aerospace quartz coverglass specular flare from single unified sun direction
      vec3 sunViewDir = normalize((viewMatrix * vec4(uSunWorldDir, 0.0)).xyz);
      vec3 viewV = normalize(vViewPosition);
      vec3 halfV = normalize(sunViewDir + viewV);
      vec3 nV = normalize(vNormal);
      float nDotH = max(0.0, dot(nV, halfV));
      float nDotL = max(0.0, dot(nV, sunViewDir));

      if (nDotL > 0.02) {
        float broadSheen = pow(nDotH, 5.0) * 0.72;
        float sharpGlint = pow(nDotH, 32.0) * 1.95;
        vec3 coverglassGlint = vec3(1.0, 0.96, 0.88) * (broadSheen + sharpGlint) * (0.35 + 0.65 * nDotL);
        gl_FragColor.rgb += coverglassGlint;
      }
      #include <dithering_fragment>
      `
    );
  };

  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x222630,
    normalMap: metalNormalMap,
    normalScale: new THREE.Vector2(2.0, 2.0),
    roughnessMap: metalRoughnessMap,
    metalness: 0.76,
    roughness: 0.70,
  });

  const dispose = () => {
    [
      goldColorMap,
      goldNormalMap,
      goldRoughnessMap,
      metalNormalMap,
      metalRoughnessMap,
      solarDiffuseMap,
      solarNormalMap,
      solarRoughnessMap,
    ].forEach((t) => t.dispose());
  };

  // 1. Main Core: Octagonal / Pyramidal gold foil superstructure (in upperGroup)
  const coreBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.64, 0.52, 8),
    goldMaterial
  );
  coreBody.position.y = 0.06;
  coreBody.castShadow = true;
  coreBody.receiveShadow = true;
  upperGroup.add(coreBody);

  // Horizontal gold foil MLI bands
  [-0.12, 0.06, 0.20].forEach((yOff) => {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.485, 0.485, 0.04, 8),
      brightGoldMaterial
    );
    band.position.y = 0.06 + yOff;
    band.castShadow = true;
    upperGroup.add(band);
  });

  // 2. LARGE SLANTED SOLAR PANELS (Covering the 4 main angled faces, in upperGroup)
  const panelAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const sidePanels = [];

  panelAngles.forEach((angle) => {
    const hingeGroup = new THREE.Group();
    hingeGroup.position.set(0, 0.28, 0);

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
    frameTop.castShadow = true;
    hingeGroup.add(frameTop);

    const frameBottom = new THREE.Mesh(frameGeoH, brightGoldMaterial);
    frameBottom.position.set(0, -panelHeight, 0.54);
    frameBottom.castShadow = true;
    hingeGroup.add(frameBottom);

    const frameGeoV = new THREE.BoxGeometry(0.024, panelHeight, 0.026);
    const frameLeft = new THREE.Mesh(frameGeoV, brightGoldMaterial);
    frameLeft.position.set(-panelWidth / 2, -panelHeight / 2, 0.54);
    frameLeft.castShadow = true;
    hingeGroup.add(frameLeft);

    const frameRight = new THREE.Mesh(frameGeoV, brightGoldMaterial);
    frameRight.position.set(panelWidth / 2, -panelHeight / 2, 0.54);
    frameRight.castShadow = true;
    hingeGroup.add(frameRight);

    // Initial slight inward slant matching the pyramid body
    hingeGroup.rotation.x = -0.26;

    const radialGroup = new THREE.Group();
    radialGroup.rotation.y = angle;
    radialGroup.add(hingeGroup);
    upperGroup.add(radialGroup);

    sidePanels.push({
      hinge: hingeGroup,
      openRotX: -0.68,
      closedRotX: -0.26,
    });
  });

  // 3. Deployable Lateral Solar Wings (in upperGroup)
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
    edgeTrim.castShadow = true;
    wingHinge.add(edgeTrim);

    wingHinge.rotation.z = dir * 0.12;
    upperGroup.add(wingHinge);

    topWings.push({
      hinge: wingHinge,
      dir,
      openRotZ: dir * 0.55,
      closedRotZ: dir * 0.12,
    });
  });

  // 4. Pragyan Rover Deployment Ramp (in upperGroup)
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
  upperGroup.add(rampHinge);

  const roverRamp = {
    hinge: rampHinge,
    openRotX: 0.52,
    closedRotX: -0.78,
  };

  // 5. 4 Spherical Gold Propellant Tanks (in upperGroup)
  const tankAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  tankAngles.forEach((ang) => {
    const tank = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 18, 18),
      brightGoldMaterial
    );
    tank.position.set(Math.cos(ang) * 0.42, 0.30, Math.sin(ang) * 0.42);
    tank.castShadow = true;
    upperGroup.add(tank);

    const bracket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.14, 6),
      darkGoldMaterial
    );
    bracket.position.set(Math.cos(ang) * 0.42, 0.20, Math.sin(ang) * 0.42);
    bracket.castShadow = true;
    upperGroup.add(bracket);
  });

  // 6. UPPER DECK & DOMES (in upperGroup)
  const topDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 0.10, 8),
    darkGoldMaterial
  );
  topDeck.position.y = 0.36;
  topDeck.castShadow = true;
  upperGroup.add(topDeck);

  const centralDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    brightGoldMaterial
  );
  centralDome.position.y = 0.41;
  centralDome.castShadow = true;
  upperGroup.add(centralDome);

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
    pillar.castShadow = true;
    upperGroup.add(pillar);
  }
  const cageRing = new THREE.Mesh(
    new THREE.TorusGeometry(cageRadius, 0.008, 6, 16),
    brightGoldMaterial
  );
  cageRing.rotation.x = Math.PI / 2;
  cageRing.position.y = 0.41 + 0.15 + cageHeight;
  cageRing.castShadow = true;
  upperGroup.add(cageRing);

  const centerMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.18, 6),
    chromeMaterial
  );
  centerMast.position.y = 0.41 + 0.15 + cageHeight + 0.08;
  centerMast.castShadow = true;
  upperGroup.add(centerMast);

  [
    [-0.20, 0.14],
    [0.20, -0.14],
  ].forEach(([sx, sz]) => {
    const subDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      brightGoldMaterial
    );
    subDome.position.set(sx, 0.41, sz);
    subDome.castShadow = true;
    upperGroup.add(subDome);
  });

  // 7. FIXED BASE PLATFORM & GIMBAL COLLAR (in baseGroup, 100% locked to surface)
  const baseCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.64, 0.06, 16),
    darkGoldMaterial
  );
  baseCollar.position.y = -0.08;
  baseCollar.castShadow = true;
  baseGroup.add(baseCollar);

  // 8. 4 LANDING GEAR LEGS WITH CROSS-BRACING & WIDE FOOTPADS (in baseGroup)
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

    // White supporter rod running beside gold strut (keeping green lower part, removing red collar overlap)
    const diagonalBrace1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.26, 8),
      chromeMaterial
    );
    diagonalBrace1.position.set(-0.14, -0.37, 0);
    diagonalBrace1.rotation.z = 0.54;
    diagonalBrace1.castShadow = true;
    legGroup.add(diagonalBrace1);

    // Cross-brace connecting green supporter rod to main gold strut
    const crossBrace = new THREE.Mesh(
      new THREE.CylinderGeometry(0.010, 0.010, 0.22, 8),
      chromeMaterial
    );
    crossBrace.position.set(-0.07, -0.37, 0);
    crossBrace.rotation.z = -0.42;
    crossBrace.castShadow = true;
    legGroup.add(crossBrace);

    // Secure junction collar on main strut
    const strutCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.029, 0.029, 0.035, 12),
      darkGoldMaterial
    );
    strutCollar.position.set(0, -0.36, 0);
    strutCollar.castShadow = true;
    legGroup.add(strutCollar);

    // Gimbal ball-joint connecting leg strut to footpad
    const ballJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 12, 12),
      chromeMaterial
    );
    ballJoint.position.set(0, -0.705, 0);
    ballJoint.castShadow = true;
    legGroup.add(ballJoint);

    // Wide circular landing footpad dish (gimbaled flat against lunar regolith)
    const footPad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.115, 0.026, 24),
      brightGoldMaterial
    );
    footPad.position.set(0, -0.72, 0);
    footPad.rotation.z = -0.50; // Gimbal leveled flat with lunar ground
    footPad.castShadow = true;
    footPad.receiveShadow = true;
    legGroup.add(footPad);

    // Regolith displacement rim (simulating heavy 1500kg contact footprint sinking into lunar soil)
    const padRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.114, 0.012, 8, 24),
      new THREE.MeshStandardMaterial({
        color: 0x141822,
        metalness: 0.85,
        roughness: 0.65,
      })
    );
    padRim.position.set(0, -0.730, 0);
    padRim.rotation.x = Math.PI / 2;
    padRim.rotation.y = -0.50;
    padRim.castShadow = true;
    legGroup.add(padRim);

    legGroup.rotation.z = 0.50;
    legGroup.position.set(Math.cos(ang) * 0.54, -0.06, Math.sin(ang) * 0.54);
    legGroup.rotation.y = -ang + Math.PI / 4;
    baseGroup.add(legGroup);
  });

  // 9. 5 ROCKET THRUSTER NOZZLES (in baseGroup, facing down towards ground)
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
    baseGroup.add(nozzle);
  });

  return { group, baseGroup, upperGroup, sidePanels, topWings, roverRamp, dispose };
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  3D EARTH MODEL  (Photorealistic 5-texture PBR Earth with MoonGlobe terminator)
 *  - Daytime diffuse (NASA Blue Marble)
 *  - Tangent-space normal map for mountain relief
 *  - Ocean specular sun-glint reflection
 *  - Real atmospheric cloud layer with surface self-shadowing
 *  - Authentic dark-side cosmic shadow with glowing night city lights
 *  - Sunlit Rayleigh atmospheric limb scattering (strictly no night-side halo)
 *  - Perspective elongation compensation for mathematically perfect circular globe
 * ───────────────────────────────────────────────────────────────────────────*/
function buildPhotorealisticEarth() {
  const rootGroup = new THREE.Group();
  const alignGroup = new THREE.Group();
  const orientGroup = new THREE.Group();
  rootGroup.add(alignGroup);
  alignGroup.add(orientGroup);

  const radius = 0.52;
  const loader = new THREE.TextureLoader();

  const loadTex = (url, isSRGB = false) => {
    const tex = loader.load(url);
    tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = true;
    return tex;
  };

  const dayTex = loadTex('/user_earth_day.jpg', true);
  const nightTex = loadTex('/user_earth_night.jpg', true);
  const cloudsTex = loadTex('/user_earth_clouds.jpg', false);
  const normalTex = loadTex('/user_earth_normal.jpg', false);
  const specularTex = loadTex('/user_earth_specular.jpg', false);

  // Directional sun angle matching the scene's primary sun and MoonGlobe terminator
  const sunDirection = new THREE.Vector3(1.15, 0.45, 0.85).normalize();

  // 1. Earth Surface PBR ShaderMaterial (Matte terrain roughness & gentle ocean sheen)
  const earthMat = new THREE.ShaderMaterial({
    uniforms: {
      uDayMap: { value: dayTex },
      uNightMap: { value: nightTex },
      uNormalMap: { value: normalTex },
      uSpecularMap: { value: specularTex },
      uCloudsMap: { value: cloudsTex },
      uSunDirection: { value: sunDirection },
      uCameraPosition: { value: new THREE.Vector3(0, 0.15, 5.4) },
      uCloudsOffset: { value: 0.0 },
    },
    vertexShader: `
      attribute vec4 tangent;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldTangent;
      varying vec3 vWorldBitangent;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec3 normTangent = normalize(mat3(modelMatrix) * tangent.xyz);
        vWorldTangent = normTangent;
        vWorldBitangent = normalize(cross(vWorldNormal, normTangent) * tangent.w);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform sampler2D uDayMap;
      uniform sampler2D uNightMap;
      uniform sampler2D uNormalMap;
      uniform sampler2D uSpecularMap;
      uniform sampler2D uCloudsMap;
      uniform vec3 uSunDirection;
      uniform vec3 uCameraPosition;
      uniform float uCloudsOffset;

      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldTangent;
      varying vec3 vWorldBitangent;
      varying vec3 vWorldPosition;

      void main() {
        // Water mask: White = ocean, Black = land
        float oceanMask = texture2D(uSpecularMap, vUv).r;
        float isWater = smoothstep(0.30, 0.70, oceanMask);
        float landFactor = 1.0 - isWater;

        // Dynamic surface roughness: land has deep tactile mountain relief, oceans are smooth
        float normalStrength = mix(0.40, 2.35, landFactor);
        vec3 normalTex = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
        vec3 perturbedNormal = normalize(
          vWorldTangent * (normalTex.x * normalStrength) +
          vWorldBitangent * (normalTex.y * normalStrength) +
          vWorldNormal * normalTex.z
        );

        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        vec3 sunDir = normalize(uSunDirection);

        // Day/night terminator curve matching 3D MoonGlobe
        float nDotL = dot(perturbedNormal, sunDir);
        float dayFactor = smoothstep(-0.06, 0.16, nDotL);
        float nightFactor = 1.0 - smoothstep(0.0, 0.16, nDotL);

        // Daytime surface texture (NASA Blue Marble)
        vec3 dayColor = texture2D(uDayMap, vUv).rgb;

        // Cloud ground shadow cast onto terrain underneath
        vec2 cloudShadowUv = vec2(vUv.x + uCloudsOffset - sunDir.x * 0.003, vUv.y - sunDir.y * 0.003);
        float cloudVal = texture2D(uCloudsMap, vec2(vUv.x + uCloudsOffset, vUv.y)).r;
        float cloudShadow = texture2D(uCloudsMap, cloudShadowUv).r * 0.42 * dayFactor;
        dayColor *= (1.0 - cloudShadow);

        // Gentle, realistic ocean sun sheen (reduced shine, zero plastic gloss)
        vec3 halfVec = normalize(sunDir + viewDir);
        float nDotH = max(dot(perturbedNormal, halfVec), 0.0);
        float oceanSpecular = pow(nDotH, 22.0) * isWater * dayFactor;
        float vDotH = max(dot(viewDir, halfVec), 0.0);
        float waterFresnel = 0.02 + 0.98 * pow(1.0 - vDotH, 5.0);
        vec3 oceanGlint = vec3(0.92, 0.96, 1.0) * (oceanSpecular * waterFresnel * 0.35);

        // Continental matte diffuse scattering (grounded, tactile, no blown-out highlights)
        float roughDiffuse = mix(nDotL, pow(max(nDotL, 0.0), 1.15), landFactor * 0.45);
        vec3 litDay = (dayColor * (0.018 + 0.94 * max(roughDiffuse, 0.0))) + oceanGlint;

        // Night side: deep cosmic shadow (like 3D MoonGlobe) + warm city lights
        vec3 nightColor = texture2D(uNightMap, vUv).rgb;
        vec3 cityLights = pow(nightColor, vec3(1.15)) * 2.3 * nightFactor;
        vec3 darkSide = (dayColor * 0.012) + cityLights;

        // Natural blend between day and night
        vec3 surfaceColor = mix(darkSide, litDay, dayFactor);

        // Atmospheric Rayleigh limb scattering (strictly sunlit crescent, no night-side halo)
        float limbFresnel = pow(1.0 - max(dot(normalize(vWorldNormal), viewDir), 0.0), 3.4);
        float sunAlignment = max(dot(vWorldNormal, sunDir) + 0.12, 0.0);
        vec3 atmosphericRim = vec3(0.32, 0.62, 0.96) * (limbFresnel * sunAlignment * 0.95);
        surfaceColor += atmosphericRim;

        // Steady, serene sunlight reflection on right side of Earth (illuminating towards the satellite)
        float sunLimbGlint = pow(max(dot(perturbedNormal, halfVec), 0.0), 10.0) * isWater * dayFactor;
        vec3 rightSideSunlightGlint = vec3(0.95, 0.98, 1.0) * (sunLimbGlint * 0.36);
        surfaceColor += rightSideSunlightGlint;

        gl_FragColor = vec4(surfaceColor, 1.0);
      }
    `,
  });

  const earthGeo = new THREE.SphereGeometry(radius, 128, 128);
  earthGeo.computeTangents();
  const earth = new THREE.Mesh(earthGeo, earthMat);
  earth.rotation.y = 2.15; // default orientation matching reference continents
  orientGroup.add(earth);

  // 2. Separate 3D Atmospheric Clouds Layer (soft volume scattering & natural transparency)
  const cloudsMat = new THREE.ShaderMaterial({
    uniforms: {
      uCloudsMap: { value: cloudsTex },
      uSunDirection: { value: sunDirection },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      void main() {
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uCloudsMap;
      uniform vec3 uSunDirection;
      varying vec2 vUv;
      varying vec3 vWorldNormal;

      void main() {
        float cloudVal = texture2D(uCloudsMap, vUv).r;
        if (cloudVal < 0.03) discard;

        float nDotL = dot(vWorldNormal, normalize(uSunDirection));
        float dayFactor = smoothstep(-0.06, 0.18, nDotL);

        // Soft diffuse sunlight scattering on cloud tops (not flat plastic white)
        vec3 cloudLit = vec3(0.95, 0.97, 1.0) * (0.86 + 0.14 * max(nDotL, 0.0));
        vec3 cloudDark = vec3(0.015, 0.02, 0.035);
        vec3 col = mix(cloudDark, cloudLit, dayFactor);

        // Soft, realistic cloud opacity allowing terrain and oceans below to be appreciated
        float alpha = cloudVal * mix(0.10, 0.68, dayFactor);

        gl_FragColor = vec4(col, min(alpha, 1.0));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const cloudsGeo = new THREE.SphereGeometry(radius * 1.0035, 128, 128);
  const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
  clouds.rotation.y = 2.15;
  orientGroup.add(clouds);

  const dispose = () => {
    earthGeo.dispose();
    cloudsGeo.dispose();
    earthMat.dispose();
    cloudsMat.dispose();
    [dayTex, nightTex, cloudsTex, normalTex, specularTex].forEach((t) => t.dispose());
  };

  return { rootGroup, alignGroup, orientGroup, earth, clouds, earthMat, cloudsMat, radius, dispose };
}

function positionEarthToMatchReference(earthControls, width, height, camera) {
  const { rootGroup, alignGroup, orientGroup, radius } = earthControls;
  const scale = Math.max(width / 1024, height / 576);
  // Distance from right edge in 1024x576 reference image is 270.38
  const screenX = width - 270.38 * scale;
  // Distance from top in 1024x576 reference image is 95.24
  const screenY = (height - 576 * scale) / 2 + 95.24 * scale;
  const screenR = 62.27 * scale;

  const ndcX = (screenX / width) * 2 - 1;
  const ndcY = 1 - (screenY / height) * 2;

  const ez = -2.5;
  const distZ = camera.position.z - ez;
  const fovRad = (camera.fov * Math.PI) / 180;
  const f = 1.0 / Math.tan(fovRad / 2);
  const aspect = width / height;

  const ex = ndcX * distZ * (aspect / f) + camera.position.x;
  const ey = ndcY * distZ * (1.0 / f) + camera.position.y;
  const r3d = (screenR * distZ) / (f * (height / 2));

  rootGroup.position.set(ex, ey, ez);

  // Exact perspective radial compensation for a mathematically 100% spherical circle on screen
  const dx = ex - camera.position.x;
  const dy = ey - camera.position.y;
  const screenAngle = Math.atan2(dy, dx);
  const distXY = Math.hypot(dx, dy);
  const alpha = Math.atan2(distXY, distZ);
  const cosAlpha = Math.cos(alpha);
  // Factor cancelling the off-axis perspective elongation
  const compRadial = cosAlpha * 0.992;
  const scaleFactor = r3d / radius;

  alignGroup.rotation.z = screenAngle;
  alignGroup.scale.set(scaleFactor * compRadial, scaleFactor, scaleFactor);
  orientGroup.rotation.z = -screenAngle;
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  LANDER LEG WEIGHT & CONTACT FOOTPRINT SYSTEM
 *  - High-mass contact occlusion footprints under each of the 4 landing pads
 *  - Compressed lunar regolith crater rings around each footpad
 *  - Directional leg strut and footpad shadow tails cast back-left on the lunar regolith
 *  - Deep central body & thruster ambient occlusion
 * ───────────────────────────────────────────────────────────────────────────*/
function makeLanderLegWeightDecal() {
  const loader = new THREE.TextureLoader();
  const tex = loader.load('/lander_ground_shadow.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 3.8),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
  );
  mesh.rotation.x = -Math.PI / 2 + 0.05;
  mesh.position.set(-0.85, -1.338, 0.814);
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

    // Renderer with shadow map enabled and alpha transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Transparent clear color so hero-banner flows seamlessly without vertical seams or blend overlays
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── LIGHTING ─────────────────────────────────────────────────────────────
    // Deep cosmic space ambient light (dark shadows, authentic lunar contrast)
    scene.add(new THREE.AmbientLight(0x0a121e, 0.28));

    // Soft hemisphere cosmic fill ensuring gold MLI foil remains luminous and readable
    const hemiLight = new THREE.HemisphereLight(0xfffaee, 0x121a28, 0.35);
    scene.add(hemiLight);

    // PRIMARY COSMIC SUN — The ONLY directional light source in the scene!
    // Parallel sunlight coming from ONE unified cosmic direction (upper-right in space)
    // Illuminating Earth, casting real-time shadows, and reflecting across both solar panels
    const sunLight = new THREE.DirectionalLight(0xfffaee, 5.2);
    sunLight.position.set(4.2, 4.8, 2.6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1.0;
    sunLight.shadow.camera.far = 18.0;
    sunLight.shadow.camera.left = -2.2;
    sunLight.shadow.camera.right = 2.2;
    sunLight.shadow.camera.top = 2.2;
    sunLight.shadow.camera.bottom = -2.2;
    sunLight.shadow.bias = -0.0006;
    sunLight.shadow.normalBias = 0.02;
    sunLight.target.position.set(-0.85, -0.60, 0.85);
    scene.add(sunLight.target);
    scene.add(sunLight);

    // Very subtle lunar regolith diffuse ground bounce (diffuse only, strictly no directional shadows)
    const lunarBounce = new THREE.DirectionalLight(0x403525, 0.18);
    lunarBounce.position.set(-0.85, -4.0, 0.85);
    lunarBounce.target.position.set(-0.85, -0.60, 0.85);
    scene.add(lunarBounce.target);
    scene.add(lunarBounce);

    // ── STARFIELD ────────────────────────────────────────────────────────────
    const stars = makeStarfield();
    scene.add(stars);

    // ── CELESTIAL SHOOTING STARS & COMETS ────────────────────────────────────
    const shootingStars = createShootingStarSystem({
      scene,
      camera,
      bounds: { minX: -5.0, maxX: 6.0, minY: 1.2, maxY: 3.8, minZ: -12.0, maxZ: -4.0 },
      poolSize: 4,
    });

    // ── 3D EARTH MODEL (5-texture photorealistic globe, slow rotation) ────────
    const earthControls = buildPhotorealisticEarth();
    positionEarthToMatchReference(earthControls, width, height, camera);
    scene.add(earthControls.rootGroup);

    // ── DYNAMIC THREE.JS SHADOW RECEIVER ON LUNAR GROUND ─────────────────────
    // Seamless transparent ground plane receiving real-time dynamic soft shadows
    // from the 4 legs, body, solar wings, and thrusters of the satellite
    const shadowReceiverGeo = new THREE.PlaneGeometry(8, 6);
    const shadowReceiverMat = new THREE.ShadowMaterial({
      opacity: 0.86,
      depthWrite: false,
    });
    const shadowReceiver = new THREE.Mesh(shadowReceiverGeo, shadowReceiverMat);
    shadowReceiver.position.set(-0.85, -1.342, 0.814);
    shadowReceiver.rotation.x = -Math.PI / 2 + 0.05;
    shadowReceiver.receiveShadow = true;
    scene.add(shadowReceiver);

    // ── PHYSICAL LEG CONTACT OCCLUSION & WEIGHT DECAL ────────────────────────
    // High-contrast circular contact patches under the 4 footpads,
    // compressed regolith rims, directional leg strut shadow tails, and thruster AO
    const legWeightDecal = makeLanderLegWeightDecal();
    scene.add(legWeightDecal);

    // ── CHANDRAYAAN-2 LANDER ─────────────────────────────────────────────────
    const landerControls = buildVikramLander();
    const {
      group: lander,
      baseGroup,
      upperGroup,
      sidePanels,
      topWings,
      roverRamp,
    } = landerControls;

    // Positioned firmly on the real lunar surface on the left side matching reference image
    const landerBase = { x: -0.85, y: -0.60, z: 0.85 };
    const landerBaseRot = { x: 0.05, y: -0.18 };
    lander.position.set(landerBase.x, landerBase.y, landerBase.z);
    lander.rotation.set(landerBaseRot.x, landerBaseRot.y, 0);
    lander.scale.set(1.05, 1.05, 1.05);
    scene.add(lander);

    // Interactive State: Panels Deployed / Stowed
    let isDeployed = true;

    // Target rotation for UPPER payload only (Base feet stay 100% locked to the surface!)
    const upperTargetRot = { x: 0, y: 0 };

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

      // Base feet stay 100% locked to the lunar ground.
      // Upper payload and solar panels smoothly swivel to track the cursor!
      upperTargetRot.y = cx * 0.32;
      upperTargetRot.x = -cy * 0.16;

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
      upperTargetRot.y = 0;
      upperTargetRot.x = 0;
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
      positionEarthToMatchReference(earthControls, width, height, camera);
    });
    ro.observe(container);

    // Animation Loop
    let reqId;
    const clock = new THREE.Clock();
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      // Majestic steady planetary rotation of 3D Earth & clouds (calm, steady, no blinking)
      earthControls.earth.rotation.y += dt * 0.038;
      earthControls.clouds.rotation.y += dt * 0.048;
      earthControls.earthMat.uniforms.uCloudsOffset.value += dt * 0.007;

      // Starfield subtle cosmic drift
      stars.rotation.y += dt * 0.0012;

      // Realistic shooting stars & comets crossing space
      shootingStars.update(dt, camera);

      // Lander: Base landing gear feet stay permanently locked to the lunar dust!
      // Upper payload & solar panels swivel smoothly towards cursor, casting dynamic shadows
      upperGroup.rotation.y += (upperTargetRot.y - upperGroup.rotation.y) * 0.08;
      upperGroup.rotation.x += (upperTargetRot.x - upperGroup.rotation.x) * 0.08;

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
      shootingStars.dispose();
      earthControls.dispose();
      landerControls.dispose();
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
    />
  );
}
