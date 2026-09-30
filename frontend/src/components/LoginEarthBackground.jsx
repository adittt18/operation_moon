import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function LoginEarthBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Scene & Orthographic Camera for pixel-perfect 1:1 screen projection
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      2000
    );
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // Texture Loader
    const loader = new THREE.TextureLoader();
    const loadTex = (url) => {
      const tex = loader.load(
        url,
        () => {
          tex.needsUpdate = true;
        },
        undefined,
        (err) => {
          console.warn('Failed to load texture:', url, err);
        }
      );
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = true;
      return tex;
    };

    const dayTex = loadTex('/earth_surface_vivid.jpg');
    const nightTex = loadTex('/user_earth_night.jpg');
    const cloudsTex = loadTex('/user_earth_clouds.jpg');
    const normalTex = loadTex('/user_earth_normal.jpg');
    const specularTex = loadTex('/user_earth_specular.jpg');

    // Directional sunlight matching the sunburst flare in the cosmic background (upper-right 300° angle)
    const sunDir = new THREE.Vector3(0.55, 0.95, 0.65).normalize();

    // Earth Root & Rotation Groups
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Tilt group for natural ~23.4° axial tilt
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = -0.32; // Slight natural axial tilt
    earthGroup.add(tiltGroup);

    // Sphere Geometry (normalized to r = 1, scaled dynamically by earthGroup.scale)
    const sphereGeo = new THREE.SphereGeometry(1, 96, 96);

    // 1. Earth Surface Material (Realistic Day/Night + Specular + Normal relief)
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        uDayMap: { value: dayTex },
        uNightMap: { value: nightTex },
        uNormalMap: { value: normalTex },
        uSpecularMap: { value: specularTex },
        uSunDirection: { value: sunDir },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uDayMap;
        uniform sampler2D uNightMap;
        uniform sampler2D uNormalMap;
        uniform sampler2D uSpecularMap;
        uniform vec3 uSunDirection;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 sunDir = normalize(uSunDirection);

          // Sunlight incidence on sphere
          float nDotL = dot(normal, sunDir);
          float dayFactor = smoothstep(-0.08, 0.22, nDotL);
          float nightFactor = 1.0 - smoothstep(0.0, 0.25, nDotL);

          // Day surface & night city lights
          vec3 dayCol = texture2D(uDayMap, vUv).rgb;
          vec3 nightCol = texture2D(uNightMap, vUv).rgb * vec3(1.3, 1.05, 0.7);

          // Specular glint on oceans
          float oceanMask = texture2D(uSpecularMap, vUv).r;
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          vec3 halfVec = normalize(sunDir + viewDir);
          float spec = pow(max(dot(normal, halfVec), 0.0), 24.0) * oceanMask * dayFactor * 0.45;

          // Atmospheric diffuse scattering along daytime limb
          float limb = 1.0 - max(dot(normal, viewDir), 0.0);
          vec3 atmosphereLimb = vec3(0.28, 0.62, 1.0) * pow(limb, 3.5) * dayFactor * 0.85;

          vec3 surfaceColor = mix(nightCol * 0.45, dayCol, dayFactor) + spec + atmosphereLimb;
          gl_FragColor = vec4(surfaceColor, 1.0);
        }
      `,
    });

    const earthMesh = new THREE.Mesh(sphereGeo, earthMat);
    tiltGroup.add(earthMesh);

    // 2. Atmospheric Clouds Layer
    const cloudsGeo = new THREE.SphereGeometry(1.009, 96, 96);
    const cloudsMat = new THREE.ShaderMaterial({
      uniforms: {
        uCloudsMap: { value: cloudsTex },
        uSunDirection: { value: sunDir },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uCloudsMap;
        uniform vec3 uSunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          float cloudVal = texture2D(uCloudsMap, vUv).r;
          if (cloudVal < 0.02) discard;

          float nDotL = dot(normalize(vNormal), normalize(uSunDirection));
          float dayFactor = smoothstep(-0.06, 0.20, nDotL);

          vec3 cloudLit = vec3(0.96, 0.98, 1.0) * (0.88 + 0.12 * max(nDotL, 0.0));
          vec3 cloudDark = vec3(0.015, 0.02, 0.035);
          vec3 col = mix(cloudDark, cloudLit, dayFactor);

          float alpha = cloudVal * mix(0.12, 0.72, dayFactor);
          gl_FragColor = vec4(col, min(alpha, 1.0));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    tiltGroup.add(cloudsMesh);

    // 3. Rayleigh Atmospheric Blue Halo Rim (Fresnel outer shell)
    const haloGeo = new THREE.SphereGeometry(1.032, 64, 64);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDirection: { value: sunDir },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDirection;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);

          float rim = 1.0 - max(dot(normal, viewDir), 0.0);
          rim = pow(rim, 3.8);

          // Sunlight bias: more radiant towards upper-right sun direction
          float sunBias = max(dot(normal, normalize(uSunDirection)), 0.0);
          vec3 haloCol = mix(vec3(0.15, 0.45, 0.85), vec3(0.38, 0.75, 1.0), sunBias);

          gl_FragColor = vec4(haloCol, rim * (0.75 + 0.25 * sunBias));
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });

    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    earthGroup.add(haloMesh);

    // Exact placement & sizing locked to the 1376x768 background image
    const updatePlacement = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      // CSS center center / cover mapping for 1376 x 768 reference background
      const scale = Math.max(width / 1376, height / 768);
      const renderedW = 1376 * scale;
      const renderedH = 768 * scale;
      const offsetX = (width - renderedW) / 2;
      const offsetY = (height - renderedH) / 2;

      // Exact pixel coordinates of Earth within 1376x768 reference space
      const screenX = 864.43 * scale + offsetX;
      const screenY = 402.27 * scale + offsetY;
      const screenR = 289.0 * scale;

      earthGroup.position.set(screenX - width / 2, height / 2 - screenY, 0);
      earthGroup.scale.set(screenR, screenR, screenR);
    };

    updatePlacement();

    // Clock & Render Loop: "make the earth rotating very slowly without changing its position and placement"
    const clock = new THREE.Clock();
    let reqId = null;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      // Majestic, very slow planetary rotation (~13 minutes for a complete rotation)
      earthMesh.rotation.y += dt * 0.008;
      // Clouds drift slightly faster for multi-layer atmospheric depth
      cloudsMesh.rotation.y += dt * 0.011;

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver(() => {
      updatePlacement();
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', updatePlacement);

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePlacement);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      sphereGeo.dispose();
      cloudsGeo.dispose();
      haloGeo.dispose();
      earthMat.dispose();
      cloudsMat.dispose();
      haloMat.dispose();
      dayTex.dispose();
      nightTex.dispose();
      cloudsTex.dispose();
      normalTex.dispose();
      specularTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="login-earth-canvas-container"
      aria-hidden="true"
    />
  );
}
