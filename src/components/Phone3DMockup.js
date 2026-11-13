import * as THREE from 'three';

function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

function applyPlanarUVs(geometry, width, height, overscan = 0.016) {
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  const span = 1 - overscan * 2;

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const u = overscan + ((px / width) + 0.5) * span;
    const v = overscan + ((py / height) + 0.5) * span;
    uvs[i * 2] = Math.min(1, Math.max(0, u));
    uvs[i * 2 + 1] = Math.min(1, Math.max(0, v));
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

function createStudioEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x030b18);

  const panels = [
    { pos: [0, 4.5, 2.5], rot: [Math.PI / 2.6, 0, 0], size: [6, 2.5], color: 0xe0f2fe, intensity: 2.2 },
    { pos: [4.2, 1.2, 2.8], rot: [0, -Math.PI / 3, 0], size: [2.8, 5.5], color: 0x38bdf8, intensity: 2.6 },
    { pos: [-4.2, 0.8, 2.2], rot: [0, Math.PI / 3, 0], size: [2.5, 5.0], color: 0x1e3a8a, intensity: 1.5 },
    { pos: [0, -3.5, 1.5], rot: [-Math.PI / 2, 0, 0], size: [5, 3], color: 0x0ea5e9, intensity: 0.9 }
  ];

  for (const p of panels) {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(p.color).multiplyScalar(p.intensity),
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(p.size[0], p.size[1]), mat);
    mesh.position.set(...p.pos);
    mesh.rotation.set(...p.rot);
    envScene.add(mesh);
  }

  const target = pmrem.fromScene(envScene, 0.04);
  pmrem.dispose();
  return target;
}

function createFloorGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const shadowGrad = ctx.createRadialGradient(128, 128, 6, 128, 128, 102);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.62)');
  shadowGrad.addColorStop(0.45, 'rgba(2, 10, 24, 0.34)');
  shadowGrad.addColorStop(0.75, 'rgba(4, 18, 38, 0.12)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addSideButton(parent, x, y, length, depth, mat) {
  const btn = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.009, Math.max(0.02, length - 0.018), 6, 12),
    mat
  );
  btn.scale.set(0.75, 1, depth / 0.018);
  btn.position.set(x, y, 0);
  parent.add(btn);
}

function buildPhoneModel(screenTexture) {
  const phone = new THREE.Group();

  const frameWidth = 1.04;
  const frameHeight = 2.18;
  const frameRadius = 0.165;
  const frameDepth = 0.074;
  const frontZ = frameDepth / 2 + 0.0156;
  const backZ = -(frameDepth / 2 + 0.0156);

  const titaniumMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a3548,
    metalness: 0.94,
    roughness: 0.22,
    clearcoat: 0.55,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.65
  });

  const darkTrimMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.28,
    envMapIntensity: 1.3
  });

  const bezelMat = new THREE.MeshPhysicalMaterial({
    color: 0x050a14,
    metalness: 0.15,
    roughness: 0.07,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.15
  });

  const matteBackGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x111827,
    metalness: 0.12,
    roughness: 0.46,
    clearcoat: 0.22,
    clearcoatRoughness: 0.38,
    envMapIntensity: 0.9
  });

  const cameraPlateauMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b1220,
    metalness: 0.22,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.35
  });

  const lensRingMat = new THREE.MeshPhysicalMaterial({
    color: 0x3b495e,
    metalness: 0.95,
    roughness: 0.18,
    clearcoat: 0.7,
    envMapIntensity: 1.8
  });

  const barrelMat = new THREE.MeshStandardMaterial({
    color: 0x04070d,
    metalness: 0.2,
    roughness: 0.7
  });

  const sapphireMat = new THREE.MeshPhysicalMaterial({
    color: 0x071229,
    metalness: 0.25,
    roughness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    reflectivity: 1.0,
    envMapIntensity: 1.9
  });

  // Outer chamfered titanium chassis
  const bodyGeo = new THREE.ExtrudeGeometry(
    createRoundedRectShape(frameWidth, frameHeight, frameRadius),
    {
      depth: frameDepth,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.013,
      bevelSegments: 8,
      curveSegments: 24
    }
  );
  bodyGeo.center();
  phone.add(new THREE.Mesh(bodyGeo, titaniumMat));

  // Front glossy glass bezel plate
  const plateGeo = new THREE.ShapeGeometry(
    createRoundedRectShape(frameWidth - 0.024, frameHeight - 0.024, frameRadius - 0.012),
    24
  );
  const frontBezel = new THREE.Mesh(plateGeo, bezelMat);
  frontBezel.position.z = frontZ;
  phone.add(frontBezel);

  // Subtle top earpiece speaker slit
  const earpiece = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.008, 0.003),
    barrelMat
  );
  earpiece.position.set(0, frameHeight / 2 - 0.032, frontZ + 0.001);
  phone.add(earpiece);

  // Back frosted matte glass plate
  const backGlass = new THREE.Mesh(plateGeo, matteBackGlassMat);
  backGlass.position.z = backZ;
  backGlass.rotation.y = Math.PI;
  phone.add(backGlass);

  // Subtle MagSafe ring & center glossy badge on back glass
  const magsafeMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.65,
    roughness: 0.25,
    transparent: true,
    opacity: 0.16
  });
  const magsafeRing = new THREE.Mesh(
    new THREE.RingGeometry(0.165, 0.185, 48),
    magsafeMat
  );
  magsafeRing.position.set(0, -0.02, backZ - 0.0012);
  magsafeRing.rotation.y = Math.PI;
  phone.add(magsafeRing);

  const magsafeAlign = new THREE.Mesh(
    new THREE.PlaneGeometry(0.018, 0.055),
    magsafeMat
  );
  magsafeAlign.position.set(0, -0.245, backZ - 0.0012);
  magsafeAlign.rotation.y = Math.PI;
  phone.add(magsafeAlign);

  // App screen (386x840 exact ratio with subtle overscan to avoid white border hairlines)
  const screenWidth = 0.96;
  const screenHeight = screenWidth * (840 / 386);
  const screenGeo = new THREE.ShapeGeometry(
    createRoundedRectShape(screenWidth, screenHeight, 0.132),
    24
  );
  applyPlanarUVs(screenGeo, screenWidth, screenHeight, 0.016);

  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTexture,
    emissiveMap: screenTexture,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.85,
    roughness: 0.16,
    metalness: 0.03,
    envMapIntensity: 0.4
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = frontZ + 0.0012;
  phone.add(screenMesh);

  // Side hardware buttons (rounded capsule style)
  const sideRailX = frameWidth / 2 + 0.014;
  addSideButton(phone, sideRailX, 0.26, 0.23, 0.026, titaniumMat);  // Power button
  addSideButton(phone, sideRailX - 0.003, -0.28, 0.14, 0.022, darkTrimMat); // Camera control
  addSideButton(phone, -sideRailX, 0.50, 0.085, 0.024, titaniumMat); // Action button
  addSideButton(phone, -sideRailX, 0.29, 0.155, 0.024, titaniumMat); // Volume +
  addSideButton(phone, -sideRailX, 0.09, 0.155, 0.024, titaniumMat); // Volume -

  // Antenna bands on side rails
  const antennaMat = new THREE.MeshStandardMaterial({
    color: 0x0b1220,
    metalness: 0.3,
    roughness: 0.6
  });
  const antennaGeo = new THREE.BoxGeometry(0.01, 0.012, frameDepth + 0.026);
  for (const ax of [-sideRailX + 0.004, sideRailX - 0.004]) {
    for (const ay of [0.84, -0.84]) {
      const band = new THREE.Mesh(antennaGeo, antennaMat);
      band.position.set(ax, ay, 0);
      phone.add(band);
    }
  }

  // Bottom USB-C port & speaker/mic grilles
  const bottomY = -(frameHeight / 2 + 0.0125);
  const usbcCollar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.004, 0.036), darkTrimMat);
  usbcCollar.position.set(0, bottomY, 0);
  phone.add(usbcCollar);

  const usbcSlot = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.006, 0.022), barrelMat);
  usbcSlot.position.set(0, bottomY - 0.001, 0);
  phone.add(usbcSlot);

  const holeGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.005, 10);
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const hole = new THREE.Mesh(holeGeo, barrelMat);
      hole.position.set(dir * (0.14 + i * 0.024), bottomY, 0);
      phone.add(hole);
    }
  }

  // Rear iPhone Pro Camera Plateau + Triple Multi-Layer Lenses + Flash + LiDAR
  const plateauCenterX = 0.235;
  const plateauCenterY = 0.775;
  const cameraBumpGeo = new THREE.ExtrudeGeometry(
    createRoundedRectShape(0.41, 0.43, 0.082),
    {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 5,
      curveSegments: 18
    }
  );
  const cameraBump = new THREE.Mesh(cameraBumpGeo, cameraPlateauMat);
  cameraBump.position.set(plateauCenterX, plateauCenterY, backZ);
  cameraBump.rotation.y = Math.PI;
  phone.add(cameraBump);

  const outerBezelGeo = new THREE.CylinderGeometry(0.072, 0.075, 0.022, 32);
  outerBezelGeo.rotateX(Math.PI / 2);

  const innerBarrelGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.023, 28);
  innerBarrelGeo.rotateX(Math.PI / 2);

  const sapphireGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.006, 28);
  sapphireGeo.rotateX(Math.PI / 2);

  const opticPupilGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.007, 20);
  opticPupilGeo.rotateX(Math.PI / 2);
  const opticPupilMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f2757,
    metalness: 0.6,
    roughness: 0.08,
    clearcoat: 1.0
  });

  const lensZ = backZ - 0.028;
  const lensPositions = [
    [0.325, 0.875],
    [0.325, 0.675],
    [0.145, 0.775]
  ];
  for (const [lx, ly] of lensPositions) {
    const outerRing = new THREE.Mesh(outerBezelGeo, lensRingMat);
    outerRing.position.set(lx, ly, lensZ);
    phone.add(outerRing);

    const barrel = new THREE.Mesh(innerBarrelGeo, barrelMat);
    barrel.position.set(lx, ly, lensZ - 0.001);
    phone.add(barrel);

    const sapphire = new THREE.Mesh(sapphireGeo, sapphireMat);
    sapphire.position.set(lx, ly, lensZ - 0.009);
    phone.add(sapphire);

    const pupil = new THREE.Mesh(opticPupilGeo, opticPupilMat);
    pupil.position.set(lx, ly, lensZ - 0.0105);
    phone.add(pupil);
  }

  // True Tone Flash (top-right on plateau)
  const flashRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.006, 20).rotateX(Math.PI / 2),
    lensRingMat
  );
  flashRim.position.set(0.145, 0.905, backZ - 0.023);
  phone.add(flashRim);

  const flashCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 0.007, 20).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: new THREE.Color(0xfde68a),
      emissiveIntensity: 0.18,
      roughness: 0.35
    })
  );
  flashCore.position.set(0.145, 0.905, backZ - 0.024);
  phone.add(flashCore);

  // LiDAR Scanner (bottom-right on plateau)
  const lidarMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.006, 20).rotateX(Math.PI / 2),
    sapphireMat
  );
  lidarMesh.position.set(0.145, 0.645, backZ - 0.023);
  phone.add(lidarMesh);

  // Rear microphone pinhole
  const rearMic = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.006, 12).rotateX(Math.PI / 2),
    barrelMat
  );
  rearMic.position.set(0.088, 0.678, backZ - 0.023);
  phone.add(rearMic);

  return phone;
}

/**
 * Mounts an interactive procedural 3D smartphone mockup displaying the SAMUDRA
 * mobile app screen inside the provided container element.
 */
export function mountPhone3DMockup(container, screenUrl = '/img/samudra-app-screen.png') {
  if (!container) return () => {};

  const fallbackEl = container.querySelector('.phone-mockup__fallback');
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('WebGL tidak tersedia, menggunakan fallback 2D:', err);
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'phone-3d-canvas';
  renderer.domElement.setAttribute('aria-label', 'Pratinjau 3D interaktif aplikasi SAMUDRA');

  const scene = new THREE.Scene();
  const envTarget = createStudioEnvironment(renderer);
  scene.environment = envTarget.texture;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
  camera.position.set(0, -0.05, 4.75);

  const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.0);
  keyLight.position.set(2.8, 3.2, 4.0);
  scene.add(keyLight);

  const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
  cyanRimLight.position.set(3.2, 0.6, -1.6);
  scene.add(cyanRimLight);

  const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.85);
  fillLight.position.set(-3.0, -0.5, 2.5);
  scene.add(fillLight);

  const textureLoader = new THREE.TextureLoader();
  const screenTexture = textureLoader.load(screenUrl, () => {
    if (fallbackEl) fallbackEl.style.display = 'none';
  });
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  screenTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const phoneGroup = buildPhoneModel(screenTexture);
  scene.add(phoneGroup);

  const floorTex = createFloorGlowTexture();
  const floorPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.45, 0.95),
    new THREE.MeshBasicMaterial({
      map: floorTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.9
    })
  );
  floorPlane.rotation.x = -Math.PI / 2;
  floorPlane.position.set(0, -1.21, 0);
  scene.add(floorPlane);

  container.appendChild(renderer.domElement);

  const syncSize = () => {
    const rect = container.getBoundingClientRect();
    const w = Math.max(180, Math.round(rect.width));
    const h = Math.max(340, Math.round(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  syncSize();

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(syncSize)
    : null;
  if (resizeObserver) resizeObserver.observe(container);

  // Pointer parallax & drag-to-rotate state
  let hoverX = 0;
  let hoverY = 0;
  let smoothHoverX = 0;
  let smoothHoverY = 0;
  let dragYaw = 0;
  let dragPitch = 0;
  let isDragging = false;
  let lastClientX = 0;
  let lastClientY = 0;

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      hoverX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      hoverY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    if (isDragging) {
      const dx = e.clientX - lastClientX;
      const dy = e.clientY - lastClientY;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      dragYaw += dx * 0.011;
      dragPitch = Math.max(-0.75, Math.min(0.75, dragPitch + dy * 0.009));
    }
  };

  const onPointerDown = (e) => {
    isDragging = true;
    lastClientX = e.clientX;
    lastClientY = e.clientY;
    container.classList.add('is-dragging');
    if (container.setPointerCapture) {
      try {
        container.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture is unsupported
      }
    }
  };

  const endDrag = () => {
    isDragging = false;
    container.classList.remove('is-dragging');
  };

  const onPointerLeave = () => {
    hoverX = 0;
    hoverY = 0;
    endDrag();
  };

  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);
  container.addEventListener('pointerleave', onPointerLeave);

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const baseRotY = -0.34;
  const baseRotX = 0.07;
  const baseRotZ = 0.03;

  let rafId = null;
  let isVisible = true;
  let elapsed = 0;
  let lastTime = performance.now();

  const renderFrame = (now) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    elapsed += dt;

    smoothHoverX += (hoverX - smoothHoverX) * 0.08;
    smoothHoverY += (hoverY - smoothHoverY) * 0.08;

    if (!isDragging) {
      dragYaw *= 0.955;
      dragPitch *= 0.955;
    }

    const bobY = prefersReducedMotion ? 0 : Math.sin(elapsed * 1.25) * 0.045;
    const swayY = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.68) * 0.11;
    const swayX = prefersReducedMotion ? 0 : Math.cos(elapsed * 0.85) * 0.04;
    const swayZ = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.55) * 0.025;

    phoneGroup.position.y = bobY;
    phoneGroup.rotation.y = baseRotY + swayY + smoothHoverX * 0.24 + dragYaw;
    phoneGroup.rotation.x = baseRotX + swayX + smoothHoverY * 0.14 + dragPitch;
    phoneGroup.rotation.z = baseRotZ + swayZ - smoothHoverX * 0.04;

    floorPlane.scale.setScalar(1 - bobY * 0.55);
    floorPlane.material.opacity = 0.88 - bobY * 1.2;

    renderer.render(scene, camera);
    if (isVisible) {
      rafId = requestAnimationFrame(renderFrame);
    }
  };

  const startLoop = () => {
    if (rafId === null) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(renderFrame);
    }
  };

  const stopLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const observer = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          isVisible = entries.some((entry) => entry.isIntersecting);
          if (isVisible) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0.05 }
      )
    : null;

  if (observer) observer.observe(container);
  startLoop();

  return () => {
    stopLoop();
    if (observer) observer.disconnect();
    if (resizeObserver) resizeObserver.disconnect();
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerdown', onPointerDown);
    container.removeEventListener('pointerup', endDrag);
    container.removeEventListener('pointercancel', endDrag);
    container.removeEventListener('pointerleave', onPointerLeave);
    envTarget.dispose();
    screenTexture.dispose();
    floorTex.dispose();
    renderer.dispose();
  };
}

