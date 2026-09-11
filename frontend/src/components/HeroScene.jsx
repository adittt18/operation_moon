import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ---------------------------------------------------------------------
 * Helpers to build the scene's objects matching the cinematic ISRO
 * Chandrayaan-2 lander & lunar terrain reference.
 * ------------------------------------------------------------------- */

function makeStarfield() {
  const count = 600;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = 16 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 2;

    // Subtle blue/white color variation
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
    opacity: 0.85,
    vertexColors: true,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

// Crumpled gold multi-layer-insulation foil with faceted lighting
function makeFoilGeometry(w, h, d, seg, noise) {
  const geo = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      Math.sin(v.x * 24 + v.y * 12) *
      Math.cos(v.y * 18 - v.z * 14) *
      Math.sin(v.z * 20 + v.x * 8);
    const amt = n * noise;
    v.x += amt;
    v.y += amt * 0.7;
    v.z += amt;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

// Photovoltaic solar array texture for the lander body panels
function makeSolarArrayTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');

  // Dark crystalline space navy
  ctx.fillStyle = '#0a162a';
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

      ctx.fillStyle = '#0d2242';
      ctx.fillRect(x, y, cellW, cellH);

      // Micro busbars
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + cellW / 2, y);
      ctx.lineTo(x + cellW / 2, y + cellH);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(96, 165, 250, 0.25)';
      ctx.beginPath();
      ctx.moveTo(x, y + cellH / 2);
      ctx.lineTo(x + cellW, y + cellH / 2);
      ctx.stroke();
    }
  }

  // Gold border frame
  ctx.strokeStyle = '#d49b38';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, c.width, c.height);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Builds the detailed Vikram Lander matching Screenshot 1
function buildVikramLander() {
  const group = new THREE.Group();

  // Materials
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8ad38,
    metalness: 0.88,
    roughness: 0.25,
    flatShading: true,
  });

  const darkGoldMaterial = new THREE.MeshStandardMaterial({
    color: 0xa46e1e,
    metalness: 0.82,
    roughness: 0.35,
    flatShading: true,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xdde3ec,
    metalness: 0.92,
    roughness: 0.18,
  });

  const solarTex = makeSolarArrayTexture();
  const solarPanelMaterial = new THREE.MeshStandardMaterial({
    map: solarTex,
    metalness: 0.45,
    roughness: 0.35,
    bumpScale: 0.02,
  });

  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x24272c,
    metalness: 0.9,
    roughness: 0.4,
  });

  // 1. Main Core: Octagonal / Pyramidal Gold Foil superstructure
  const coreBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.52, 0.46, 8),
    goldMaterial
  );
  coreBody.position.y = 0.05;
  group.add(coreBody);

  // 2. 4 Side Slanted Solar Panels (matching screenshot 1)
  const panelAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  panelAngles.forEach((angle) => {
    const panelGroup = new THREE.Group();
    const panelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.42, 0.015),
      solarPanelMaterial
    );
    panelMesh.position.z = 0.47;
    panelMesh.rotation.x = -0.28; // Tilted outwards like Vikram lander body
    panelGroup.add(panelMesh);

    // Gold edge struts
    const edgeStrutL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.44, 4),
      goldMaterial
    );
    edgeStrutL.position.set(-0.18, 0, 0.47);
    edgeStrutL.rotation.x = -0.28;
    panelGroup.add(edgeStrutL);

    const edgeStrutR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.44, 4),
      goldMaterial
    );
    edgeStrutR.position.set(0.18, 0, 0.47);
    edgeStrutR.rotation.x = -0.28;
    panelGroup.add(edgeStrutR);

    panelGroup.rotation.y = angle;
    group.add(panelGroup);
  });

  // 3. 4 Spherical Gold Propellant Tanks (prominent on Vikram top corners)
  const tankAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  tankAngles.forEach((ang) => {
    const tank = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 16, 16),
      goldMaterial
    );
    tank.position.set(Math.cos(ang) * 0.36, 0.28, Math.sin(ang) * 0.36);
    group.add(tank);

    // Tank mounting brackets
    const bracket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6),
      darkGoldMaterial
    );
    bracket.position.set(Math.cos(ang) * 0.36, 0.2, Math.sin(ang) * 0.36);
    group.add(bracket);
  });

  // 4. Upper Instrument Deck & Central Top Dome
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

  // Top communication antenna mast & dish
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6),
    chromeMaterial
  );
  mast.position.y = 0.48;
  group.add(mast);

  const topDish = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.04, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xeff3f8, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide })
  );
  topDish.position.y = 0.58;
  topDish.rotation.x = Math.PI;
  group.add(topDish);

  // 5. Landing Gear Assembly (4 outward angled legs with footpads on ground)
  const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  legAngles.forEach((ang) => {
    const legGroup = new THREE.Group();

    // Primary strut
    const mainStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.024, 0.62, 8),
      goldMaterial
    );
    mainStrut.position.set(0, -0.31, 0);
    legGroup.add(mainStrut);

    // Diagonal support braces
    const diagonalBrace1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.42, 6),
      darkGoldMaterial
    );
    diagonalBrace1.position.set(0.09, -0.22, 0);
    diagonalBrace1.rotation.z = -0.4;
    legGroup.add(diagonalBrace1);

    // Circular Landing Footpad
    const footpad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 0.025, 12),
      goldMaterial
    );
    footpad.position.set(0, -0.62, 0);
    legGroup.add(footpad);

    legGroup.position.set(Math.cos(ang) * 0.42, -0.06, Math.sin(ang) * 0.42);
    legGroup.rotation.z = Math.cos(ang) * 0.62;
    legGroup.rotation.x = -Math.sin(ang) * 0.62;
    group.add(legGroup);
  });

  // 6. Bottom Main Rocket Thruster Engines (4 liquid apogee engines)
  const thrusterOffsets = [
    [-0.14, -0.14],
    [0.14, -0.14],
    [-0.14, 0.14],
    [0.14, 0.14],
  ];
  thrusterOffsets.forEach(([tx, tz]) => {
    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, 0.09, 12),
      engineMaterial
    );
    nozzle.position.set(tx, -0.24, tz);
    nozzle.rotation.x = Math.PI;
    group.add(nozzle);
  });

  // Scale overall lander
  group.scale.setScalar(2.1);
  return group;
}

// Builds the photorealistic Earth with atmosphere glow
function buildEarth() {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const radius = 0.95;

  const earthMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x333333,
    shininess: 8,
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
    opacity: 0.78,
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

// Builds the 3D realistic lunar surface ground with boulders
function buildLunarTerrain() {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();

  const terrainGeo = new THREE.PlaneGeometry(16, 8, 36, 24);
  const pos = terrainGeo.attributes.position;

  // Gentle rolling crater hills & rocks
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z =
      Math.sin(x * 0.7) * 0.28 +
      Math.cos(y * 1.1) * 0.18 +
      Math.sin(x * 2.2 + y * 1.8) * 0.08;
    pos.setZ(i, z);
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x788698,
    roughness: 0.88,
    metalness: 0.12,
    flatShading: true,
  });

  loader.load('/moon_1024.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    terrainMat.map = tex;
    terrainMat.needsUpdate = true;
  });

  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2.35;
  terrain.position.set(1.5, -1.25, -0.8);
  group.add(terrain);

  // Scattered 3D lunar boulders around the landing zone
  const rockGeo = new THREE.DodecahedronGeometry(0.08, 1);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x627184, roughness: 0.95 });
  const rockCoords = [
    [0.8, -1.0, 0.4],
    [-0.4, -1.05, 0.2],
    [1.4, -0.95, -0.1],
    [2.1, -1.1, 0.5],
    [0.1, -1.15, 0.7],
  ];
  rockCoords.forEach(([rx, ry, rz], idx) => {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    const s = 0.6 + (idx % 3) * 0.35;
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
    let height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Cinematic Lighting setup
    scene.add(new THREE.AmbientLight(0x284774, 1.4));

    // Direct warm Sun light
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 3.4);
    sunLight.position.set(5, 4, 6);
    scene.add(sunLight);

    // Deep space blue fill & rim light
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
    rimLight.position.set(-5, 2, -2);
    scene.add(rimLight);

    // Distant Starfield
    const stars = makeStarfield();
    scene.add(stars);

    // Earth in the background
    const { group: earthGroup, earth, clouds } = buildEarth();
    earthGroup.position.set(1.7, 0.92, -1.4);
    scene.add(earthGroup);

    // Lunar ground terrain under the lander
    const terrain = buildLunarTerrain();
    scene.add(terrain);

    // Vikram Lander resting on the lunar surface
    const lander = buildVikramLander();
    const landerBase = { x: 0.12, y: -0.18, z: 0.7 };
    const landerBaseRot = { x: 0.08, y: 0.35 };
    lander.position.set(landerBase.x, landerBase.y, landerBase.z);
    lander.rotation.set(landerBaseRot.x, landerBaseRot.y, 0);
    scene.add(lander);

    // Smooth Cursor Parallax Tracking
    const targetLander = {
      rotX: landerBaseRot.x,
      rotY: landerBaseRot.y,
      posX: landerBase.x,
      posY: landerBase.y,
    };
    const targetEarth = { posX: 1.7, posY: 0.92 };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      const clampedX = Math.max(-1, Math.min(1, nx));
      const clampedY = Math.max(-1, Math.min(1, ny));

      // Lander tilts and tracks smoothly
      targetLander.rotY = landerBaseRot.y + clampedX * 0.38;
      targetLander.rotX = landerBaseRot.x - clampedY * 0.22;
      targetLander.posX = landerBase.x + clampedX * 0.18;
      targetLander.posY = landerBase.y - clampedY * 0.12;

      // Earth parallax depth
      targetEarth.posX = 1.7 + clampedX * 0.1;
      targetEarth.posY = 0.92 - clampedY * 0.06;
    };

    const onPointerLeave = () => {
      targetLander.rotY = landerBaseRot.y;
      targetLander.rotX = landerBaseRot.x;
      targetLander.posX = landerBase.x;
      targetLander.posY = landerBase.y;
      targetEarth.posX = 1.7;
      targetEarth.posY = 0.92;
    };

    window.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mouseleave', onPointerLeave);

    // Resize handler
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

      // Continuous slow planet rotation
      earth.rotation.y += dt * 0.045;
      clouds.rotation.y += dt * 0.06;
      stars.rotation.y += dt * 0.002;

      // Smooth interpolation for lander cursor tracking
      lander.rotation.y += (targetLander.rotY - lander.rotation.y) * 0.06;
      lander.rotation.x += (targetLander.rotX - lander.rotation.x) * 0.06;
      lander.position.x += (targetLander.posX - lander.position.x) * 0.06;
      lander.position.y += (targetLander.posY - lander.position.y) * 0.06;

      // Earth parallax motion
      earthGroup.position.x += (targetEarth.posX - earthGroup.position.x) * 0.04;
      earthGroup.position.y += (targetEarth.posY - earthGroup.position.y) * 0.04;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      ro.disconnect();
      window.removeEventListener('mousemove', onPointerMove);
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

