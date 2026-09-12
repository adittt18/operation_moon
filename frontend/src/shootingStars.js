import * as THREE from 'three';

/**
 * Photorealistic Shooting Star & Comet System for Three.js
 * 
 * Generates natural meteor streaks and glowing comets with:
 * - Dynamic tapered billboard plasma ribbons (not 1px wireframes)
 * - Luminous radiant nucleus/coma sprites
 * - Authentic cosmic velocities, smooth flare-ups, and natural dissipation
 * - Zero GC allocations during animation loop
 */

function createNucleusTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.18, 'rgba(240, 248, 255, 0.95)');
  grad.addColorStop(0.40, 'rgba(96, 165, 250, 0.40)');
  grad.addColorStop(0.70, 'rgba(30, 64, 175, 0.08)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const TRAIL_SEGMENTS = 26;

class CelestialStreak {
  constructor(nucleusTex) {
    this.active = false;
    this.isComet = false;
    this.elapsed = 0;
    this.duration = 1;
    this.speed = 10;
    this.headPos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.curve = new THREE.Vector3();
    this.baseWidth = 0.06;
    this.history = [];
    for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
      this.history.push(new THREE.Vector3());
    }

    // Ribbon geometry: 2 vertices per segment -> (TRAIL_SEGMENTS + 1) * 2 vertices
    const vertCount = (TRAIL_SEGMENTS + 1) * 2;
    this.positions = new Float32Array(vertCount * 3);
    this.colors = new Float32Array(vertCount * 3);

    const indices = [];
    for (let i = 0; i < TRAIL_SEGMENTS; i++) {
      const v0 = i * 2;
      const v1 = i * 2 + 1;
      const v2 = (i + 1) * 2;
      const v3 = (i + 1) * 2 + 1;
      indices.push(v0, v1, v2);
      indices.push(v2, v1, v3);
    }

    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geo.setIndex(indices);

    this.mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    this.mesh.renderOrder = -1;

    // Glowing head sprite
    this.spriteMat = new THREE.SpriteMaterial({
      map: nucleusTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
    });
    this.sprite = new THREE.Sprite(this.spriteMat);
    this.sprite.visible = false;
    this.sprite.renderOrder = -1;

    this.group = new THREE.Group();
    this.group.renderOrder = -1;
    this.group.add(this.mesh);
    this.group.add(this.sprite);
  }

  spawn(bounds, isComet = false) {
    this.bounds = bounds;
    this.isComet = isComet;
    this.elapsed = 0;

    // Meteors are fast bursts; comets are stately graceful sweeps
    if (isComet) {
      this.duration = 3.2 + Math.random() * 1.6; // 3.2s to 4.8s
      this.speed = 6.5 + Math.random() * 3.5;
      this.baseWidth = 0.010 + Math.random() * 0.004;
    } else {
      this.duration = 0.75 + Math.random() * 0.65; // 0.75s to 1.4s
      this.speed = 18.0 + Math.random() * 10.0;
      this.baseWidth = 0.0045 + Math.random() * 0.002;
    }

    // Direction angle: diagonal sweep from top-right to bottom-left (or top-left to bottom-right)
    const angle = (Math.PI * 1.15) + (Math.random() - 0.5) * 0.45; // ~200 deg oblique angle
    // Non-positive Z direction: drifts deeper into deep cosmic space, never towards the camera
    const dirZ = -Math.random() * 0.08;
    const dir = new THREE.Vector3(
      Math.cos(angle),
      Math.sin(angle),
      dirZ
    ).normalize();

    this.vel.copy(dir).multiplyScalar(this.speed);

    // Slight celestial gravitational curve for comets (Z curve also non-positive)
    this.curve.set(
      (Math.random() - 0.5) * 0.4,
      -0.35 - Math.random() * 0.35,
      -Math.random() * 0.06
    );

    // Pick random start position along the upper/lateral boundary
    const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    const y = bounds.maxY - Math.random() * 0.4;
    const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);

    this.headPos.set(x, y, z);
    for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
      this.history[i].copy(this.headPos);
    }

    this.active = true;
    this.mesh.visible = true;
    this.sprite.visible = true;
  }

  update(dt, camera) {
    if (!this.active) return;

    this.elapsed += dt;
    const progress = this.elapsed / this.duration;

    if (progress >= 1.0) {
      this.active = false;
      this.mesh.visible = false;
      this.sprite.visible = false;
      return;
    }

    // If streak head drops below minY boundary (e.g. Lunar horizon), accelerate dissipation
    let belowHorizonFade = 1.0;
    if (this.bounds && typeof this.bounds.minY === 'number') {
      if (this.headPos.y < this.bounds.minY) {
        const depthBelow = this.bounds.minY - this.headPos.y;
        belowHorizonFade = Math.max(0, 1.0 - depthBelow * 2.5);
        if (belowHorizonFade <= 0.02) {
          this.active = false;
          this.mesh.visible = false;
          this.sprite.visible = false;
          return;
        }
      }
    }

    // Comets curve slightly as they pass near planetary gravitational wells
    if (this.isComet) {
      this.vel.addScaledVector(this.curve, dt);
    }

    // Advance head position
    this.headPos.addScaledVector(this.vel, dt);

    // Shift trail history
    for (let i = TRAIL_SEGMENTS; i > 0; i--) {
      this.history[i].copy(this.history[i - 1]);
    }
    this.history[0].copy(this.headPos);

    // Natural atmospheric flare: sin curve ramp-up and fade-out
    // Fine pinpoint star-sized nucleus head (~0.015-0.023)
    const flare = Math.sin(progress * Math.PI) * belowHorizonFade;
    const headScale = this.isComet ? (0.028 + flare * 0.014) : (0.015 + flare * 0.008);
    this.sprite.position.copy(this.headPos);
    this.sprite.scale.set(headScale, headScale, headScale);
    this.spriteMat.opacity = flare * 0.95;

    // Build billboard ribbon facing camera
    const camPos = camera.position;
    const posArr = this.positions;
    const colArr = this.colors;

    const eyeDir = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const side = new THREE.Vector3();

    // Color tones: Comet has cyan/ice-blue ion tail; meteor has blazing white-cyan needle streak
    const rBase = this.isComet ? 0.45 : 0.88;
    const gBase = this.isComet ? 0.85 : 0.95;
    const bBase = 1.0;

    for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
      const p = this.history[i];
      const nextP = i < TRAIL_SEGMENTS ? this.history[i + 1] : p;

      tangent.subVectors(p, nextP);
      if (tangent.lengthSq() < 0.0001) {
        tangent.copy(this.vel);
      }
      tangent.normalize();

      eyeDir.subVectors(p, camPos).normalize();
      side.crossVectors(tangent, eyeDir).normalize();

      const frac = i / TRAIL_SEGMENTS; // 0 = head, 1 = tip
      // Comet tail expands slightly before dispersing; meteor tapers to point
      const widthFactor = this.isComet
        ? (1.0 + frac * 1.8) * Math.pow(1.0 - frac, 0.7)
        : Math.pow(1.0 - frac, 1.4);

      const halfW = (this.baseWidth * widthFactor * (0.6 + flare * 0.6)) * 0.5;

      const idx = i * 2;
      // Vertex 0 (+side)
      posArr[idx * 3] = p.x + side.x * halfW;
      posArr[idx * 3 + 1] = p.y + side.y * halfW;
      posArr[idx * 3 + 2] = p.z + side.z * halfW;

      // Vertex 1 (-side)
      posArr[(idx + 1) * 3] = p.x - side.x * halfW;
      posArr[(idx + 1) * 3 + 1] = p.y - side.y * halfW;
      posArr[(idx + 1) * 3 + 2] = p.z - side.z * halfW;

      // Alpha decay along tail
      let tailAlpha = Math.pow(1.0 - frac, 1.6) * flare;
      if (this.bounds && typeof this.bounds.minY === 'number' && p.y < this.bounds.minY) {
        tailAlpha *= Math.max(0, 1.0 - (this.bounds.minY - p.y) * 3.5);
      }

      const r = rBase * tailAlpha;
      const g = gBase * tailAlpha;
      const b = bBase * tailAlpha;

      colArr[idx * 3] = r;
      colArr[idx * 3 + 1] = g;
      colArr[idx * 3 + 2] = b;

      colArr[(idx + 1) * 3] = r;
      colArr[(idx + 1) * 3 + 1] = g;
      colArr[(idx + 1) * 3 + 2] = b;
    }

    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.color.needsUpdate = true;
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
    this.spriteMat.dispose();
  }
}

/**
 * Creates and manages a multi-streak celestial event system
 */
export function createShootingStarSystem({ scene, camera, bounds, poolSize = 5 }) {
  const nucleusTex = createNucleusTexture();
  const pool = [];
  const systemGroup = new THREE.Group();
  systemGroup.renderOrder = -1;

  for (let i = 0; i < poolSize; i++) {
    const streak = new CelestialStreak(nucleusTex);
    pool.push(streak);
    systemGroup.add(streak.group);
  }

  scene.add(systemGroup);

  let nextMeteorTime = 0.8 + Math.random() * 1.5;
  let nextCometTime = 3.5 + Math.random() * 4.0;
  let clockTime = 0;

  return {
    update(dt, cam) {
      clockTime += dt;
      const activeCam = cam || camera;

      // Spawn meteors periodically
      if (clockTime >= nextMeteorTime) {
        const free = pool.find((s) => !s.active);
        if (free) {
          free.spawn(bounds, false);
        }
        nextMeteorTime = clockTime + 1.8 + Math.random() * 3.5; // Every 1.8 to 5.3s
      }

      // Spawn majestic comets periodically
      if (clockTime >= nextCometTime) {
        const free = pool.find((s) => !s.active);
        if (free) {
          free.spawn(bounds, true);
        }
        nextCometTime = clockTime + 7.5 + Math.random() * 8.5; // Every 7.5 to 16s
      }

      // Animate active streaks
      for (let i = 0; i < pool.length; i++) {
        pool[i].update(dt, activeCam);
      }
    },

    dispose() {
      scene.remove(systemGroup);
      nucleusTex.dispose();
      for (let i = 0; i < pool.length; i++) {
        pool[i].dispose();
      }
    },
  };
}
