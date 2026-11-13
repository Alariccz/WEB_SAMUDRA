import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

// Source screenshot metrics (public/img/samudra-app-screen.png)
const SCREEN_IMG_W = 386;
const SCREEN_IMG_H = 840;
const OVERSCAN_X = 0.008;
const OVERSCAN_Y = 0.004;
const IMG_ISLAND = { cx: 192.5, cy: 29.5, w: 120, h: 34 };

const APPLE_LOGO_PATH =
  'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701';

function roundedRectShape(width, height, radius) {
  return roundedRectShapeCustom(-width / 2, -height / 2, width / 2, height / 2, radius, radius);
}

function roundedRectShapeCustom(x0, y0, x1, y1, rTop, rBottom) {
  const maxR = Math.min((x1 - x0) / 2, (y1 - y0) / 2);
  const rt = Math.min(rTop, maxR);
  const rb = Math.min(rBottom, maxR);
  const shape = new THREE.Shape();

  shape.moveTo(x0 + rb, y0);
  shape.lineTo(x1 - rb, y0);
  shape.quadraticCurveTo(x1, y0, x1, y0 + rb);
  shape.lineTo(x1, y1 - rt);
  shape.quadraticCurveTo(x1, y1, x1 - rt, y1);
  shape.lineTo(x0 + rt, y1);
  shape.quadraticCurveTo(x0, y1, x0, y1 - rt);
  shape.lineTo(x0, y0 + rb);
  shape.quadraticCurveTo(x0, y0, x0 + rb, y0);

  return shape;
}

function applyPlanarUVs(geometry, width, height, overscanX = 0, overscanY = 0) {
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  const spanX = 1 - overscanX * 2;
  const spanY = 1 - overscanY * 2;

  for (let i = 0; i < pos.count; i++) {
    const u = overscanX + (pos.getX(i) / width + 0.5) * spanX;
    const v = overscanY + (pos.getY(i) / height + 0.5) * spanY;
    uvs[i * 2] = Math.min(1, Math.max(0, u));
    uvs[i * 2 + 1] = Math.min(1, Math.max(0, v));
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

/** Maps a pixel coordinate of the screenshot to local screen-mesh coordinates. */
function imageToScreenLocal(px, py, screenW, screenH) {
  const u = px / SCREEN_IMG_W;
  const v = 1 - py / SCREEN_IMG_H;
  return {
    x: ((u - OVERSCAN_X) / (1 - 2 * OVERSCAN_X) - 0.5) * screenW,
    y: ((v - OVERSCAN_Y) / (1 - 2 * OVERSCAN_Y) - 0.5) * screenH
  };
}

function zCylinder(radiusTop, radiusBottom, height, segments = 48) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
  geo.rotateX(Math.PI / 2);
  return geo;
}

function createStudioEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x02060f);

  const panels = [
    // Front-facing softboxes (screen side)
    { pos: [0, 4.5, 2.5], rot: [Math.PI / 2.6, 0, 0], size: [6, 2.5], color: 0xf1f5f9, intensity: 2.4 },
    { pos: [4.2, 1.2, 2.8], rot: [0, -Math.PI / 3, 0], size: [2.2, 6], color: 0x7dd3fc, intensity: 2.2 },
    { pos: [-4.2, 0.8, 2.2], rot: [0, Math.PI / 3, 0], size: [1.6, 6], color: 0xe2e8f0, intensity: 1.6 },
    // Rear softboxes (back glass, camera plateau & lenses)
    { pos: [0, 3.2, -4], rot: [-Math.PI / 5, 0, 0], size: [6, 1.8], color: 0xf8fafc, intensity: 2.0 },
    { pos: [-3.8, 0.5, -3], rot: [0, Math.PI / 4, 0], size: [1.4, 6], color: 0xbae6fd, intensity: 1.6 },
    { pos: [3.8, -0.5, -3], rot: [0, -Math.PI / 4, 0], size: [1.2, 5], color: 0xcbd5e1, intensity: 1.3 },
    // Floor bounce
    { pos: [0, -3.5, 0], rot: [-Math.PI / 2, 0, 0], size: [6, 6], color: 0x0c4a6e, intensity: 0.7 }
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

  const target = pmrem.fromScene(envScene, 0.035);
  pmrem.dispose();
  return target;
}

function createFloorShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 6, 128, 128, 102);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.62)');
  grad.addColorStop(0.45, 'rgba(2, 10, 24, 0.34)');
  grad.addColorStop(0.75, 'rgba(4, 18, 38, 0.12)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createScreenSheenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 512, 512, 0);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.36, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.16)');
  grad.addColorStop(0.52, 'rgba(255, 255, 255, 0.05)');
  grad.addColorStop(0.62, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.74, 'rgba(255, 255, 255, 0.06)');
  grad.addColorStop(0.82, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createAppleLogoMesh(material, height) {
  try {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${APPLE_LOGO_PATH}"/></svg>`;
    const data = new SVGLoader().parse(svg);
    const shapes = data.paths.flatMap((path) => SVGLoader.createShapes(path));
    if (!shapes.length) return null;

    const geo = new THREE.ShapeGeometry(shapes, 24);
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const scale = height / (bb.max.y - bb.min.y);
    geo.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, 0);
    // SVG space is y-down; flip to y-up
    geo.scale(scale, -scale, 1);
    return new THREE.Mesh(geo, material);
  } catch (err) {
    console.warn('Gagal membuat logo belakang ponsel:', err);
    return null;
  }
}

function addSideButton(parent, { x, y, length, material, protrude = 0.007, thickness = 0.032 }) {
  const radius = 0.01;
  const btn = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, Math.max(0.01, length - radius * 2), 8, 20),
    material
  );
  btn.scale.set(1, 1, thickness / (radius * 2));
  btn.position.set(x + Math.sign(x) * (protrude - radius), y, 0);
  parent.add(btn);
}

/**
 * Builds a procedural iPhone Pro Max style handset: rounded unibody frame,
 * full-width rear camera plateau, triple-lens camera island, Dynamic Island,
 * and the app screenshot rendered unlit so it stays sharp and true to colour.
 */
function buildPhoneModel(screenTexture) {
  const phone = new THREE.Group();

  // Screen keeps the exact aspect ratio of the cropped screenshot
  const SW = 0.964;
  const SH = SW * (SCREEN_IMG_H * (1 - 2 * OVERSCAN_Y)) / (SCREEN_IMG_W * (1 - 2 * OVERSCAN_X));
  const W = 1.02;
  const bezel = (W - SW) / 2;
  const H = SH + bezel * 2;
  const R = 0.19;
  const D = 0.06;
  const BT = 0.028;
  const BS = 0.024;
  const capZ = D / 2 + BT;
  const outerHalfW = W / 2 + BS;
  const outerHalfH = H / 2 + BS;

  // ----- Materials -----
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0x26282d,
    metalness: 0.95,
    roughness: 0.3,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.7
  });

  const plateauMat = new THREE.MeshPhysicalMaterial({
    color: 0x1c1e22,
    metalness: 0.92,
    roughness: 0.36,
    clearcoat: 0.25,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1.5
  });

  const frontGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x020203,
    metalness: 0.1,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.2
  });

  const backGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x141518,
    metalness: 0.05,
    roughness: 0.5,
    clearcoat: 0.18,
    clearcoatRoughness: 0.45,
    envMapIntensity: 0.9
  });

  const cameraGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0b0d,
    metalness: 0.3,
    roughness: 0.07,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.4
  });

  const lensRingMat = new THREE.MeshPhysicalMaterial({
    color: 0x34373d,
    metalness: 1.0,
    roughness: 0.18,
    clearcoat: 0.6,
    envMapIntensity: 1.9
  });

  const blackMatte = new THREE.MeshStandardMaterial({
    color: 0x030304,
    metalness: 0.1,
    roughness: 0.85
  });

  const sapphireMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b1424,
    metalness: 0.2,
    roughness: 0.03,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.0
  });

  const lensElementMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a2234,
    metalness: 0.65,
    roughness: 0.12,
    envMapIntensity: 1.4
  });

  const lensPupilMat = new THREE.MeshPhysicalMaterial({
    color: 0x120f2e,
    metalness: 0.55,
    roughness: 0.06,
    clearcoat: 0.85,
    envMapIntensity: 1.8
  });

  const antennaMat = new THREE.MeshStandardMaterial({
    color: 0x3a3d43,
    metalness: 0.25,
    roughness: 0.55
  });

  // ----- Unibody frame with soft rounded edges -----
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(W, H, R), {
    depth: D,
    bevelEnabled: true,
    bevelThickness: BT,
    bevelSize: BS,
    bevelSegments: 6,
    curveSegments: 22
  });
  bodyGeo.translate(0, 0, -D / 2);
  phone.add(new THREE.Mesh(bodyGeo, frameMat));

  // ----- Front: glass, display, Dynamic Island, earpiece, glare -----
  const frontGlass = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(W - 0.006, H - 0.006, R - 0.003), 40),
    frontGlassMat
  );
  frontGlass.position.z = capZ + 0.001;
  phone.add(frontGlass);

  const screenRadius = R - bezel;
  const screenGeo = new THREE.ShapeGeometry(roundedRectShape(SW, SH, screenRadius), 40);
  applyPlanarUVs(screenGeo, SW, SH, OVERSCAN_X, OVERSCAN_Y);
  const screenMesh = new THREE.Mesh(
    screenGeo,
    new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false })
  );
  screenMesh.position.z = capZ + 0.002;
  phone.add(screenMesh);

  const islandCenter = imageToScreenLocal(IMG_ISLAND.cx, IMG_ISLAND.cy, SW, SH);
  const islandW = ((IMG_ISLAND.w + 6) / SCREEN_IMG_W) / (1 - 2 * OVERSCAN_X) * SW;
  const islandH = ((IMG_ISLAND.h + 3) / SCREEN_IMG_H) / (1 - 2 * OVERSCAN_Y) * SH;
  const dynamicIsland = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(islandW, islandH, islandH / 2), 24),
    new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0.2,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    })
  );
  dynamicIsland.position.set(islandCenter.x, islandCenter.y, capZ + 0.003);
  phone.add(dynamicIsland);

  const frontCam = new THREE.Mesh(
    new THREE.CircleGeometry(islandH * 0.26, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0x0d1b3a,
      metalness: 0.6,
      roughness: 0.08,
      clearcoat: 1.0
    })
  );
  frontCam.position.set(
    islandCenter.x + islandW / 2 - islandH * 0.55,
    islandCenter.y,
    capZ + 0.0036
  );
  phone.add(frontCam);

  const earpiece = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(0.15, 0.006, 0.003), 8),
    new THREE.MeshStandardMaterial({ color: 0x1b1d21, roughness: 0.7 })
  );
  earpiece.position.set(0, H / 2 - 0.008, capZ + 0.0025);
  phone.add(earpiece);

  const sheenTexture = createScreenSheenTexture();
  const sheenGeo = new THREE.ShapeGeometry(roundedRectShape(SW, SH, screenRadius), 40);
  applyPlanarUVs(sheenGeo, SW, SH, 0, 0);
  const sheen = new THREE.Mesh(
    sheenGeo,
    new THREE.MeshBasicMaterial({
      map: sheenTexture,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    })
  );
  sheen.position.z = capZ + 0.004;
  phone.add(sheen);

  // ----- Back: frosted glass panel + Apple logo -----
  const backGlass = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(W - 0.006, H - 0.006, R - 0.003), 40),
    backGlassMat
  );
  backGlass.position.z = -capZ - 0.001;
  backGlass.rotation.y = Math.PI;
  phone.add(backGlass);

  const logo = createAppleLogoMesh(
    new THREE.MeshPhysicalMaterial({
      color: 0x2c2f35,
      metalness: 1.0,
      roughness: 0.12,
      clearcoat: 1.0,
      envMapIntensity: 1.8,
      side: THREE.DoubleSide
    }),
    0.19
  );
  if (logo) {
    logo.position.set(0, -0.27, -capZ - 0.002);
    logo.rotation.y = Math.PI;
    phone.add(logo);
  }

  // ----- Back: full-width aluminium camera plateau -----
  const plateauHeight = 0.66;
  const pBT = 0.008;
  const pBS = 0.008;
  const pD = 0.024;
  const pInset = 0.012 + pBS;
  const px0 = -W / 2 + pInset;
  const px1 = W / 2 - pInset;
  const py1 = H / 2 - pInset;
  const py0 = H / 2 - plateauHeight;
  const plateauGeo = new THREE.ExtrudeGeometry(
    roundedRectShapeCustom(px0, py0, px1, py1, R - pInset, 0.06),
    {
      depth: pD,
      bevelEnabled: true,
      bevelThickness: pBT,
      bevelSize: pBS,
      bevelSegments: 6,
      curveSegments: 32
    }
  );
  const plateau = new THREE.Mesh(plateauGeo, plateauMat);
  plateau.rotation.y = Math.PI;
  plateau.position.z = -capZ + pBT;
  phone.add(plateau);

  const plateauZ = -capZ - pD;
  const plateauCy = (py0 + py1) / 2;

  // Camera glass island (seen on the left when looking at the back)
  const iw = 0.47;
  const ih = 0.5;
  const icx = px1 - 0.035 - iw / 2;
  const iBT = 0.005;
  const iD = 0.008;
  const camIsland = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRectShape(iw, ih, 0.13), {
      depth: iD,
      bevelEnabled: true,
      bevelThickness: iBT,
      bevelSize: 0.005,
      bevelSegments: 5,
      curveSegments: 24
    }),
    cameraGlassMat
  );
  camIsland.rotation.y = Math.PI;
  camIsland.position.set(icx, plateauCy, plateauZ + iBT + 0.001);
  phone.add(camIsland);

  const islandZ = plateauZ + 0.001 - iD;

  // Triple 48MP lens stack: metal bezel, black barrel, sapphire, optics
  const lensR = 0.108;
  const ringH = 0.026;
  const ringGeo = zCylinder(lensR + 0.004, lensR, ringH, 32);
  const lipGeo = new THREE.TorusGeometry(lensR - 0.006, 0.006, 8, 32);
  const barrelGeo = new THREE.CircleGeometry(lensR - 0.012, 28);
  const sapphireGeo = new THREE.CircleGeometry(lensR - 0.02, 28);
  const elementGeo = new THREE.RingGeometry(lensR * 0.34, lensR * 0.56, 28);
  const pupilGeo = new THREE.CircleGeometry(lensR * 0.3, 20);

  const lensSpots = [
    [icx + 0.105, plateauCy + 0.125],
    [icx + 0.105, plateauCy - 0.125],
    [icx - 0.11, plateauCy]
  ];

  for (const [lx, ly] of lensSpots) {
    const ringCenterZ = islandZ - ringH / 2 + 0.004;
    const ringFaceZ = ringCenterZ - ringH / 2;

    const ring = new THREE.Mesh(ringGeo, lensRingMat);
    ring.position.set(lx, ly, ringCenterZ);
    phone.add(ring);

    const lip = new THREE.Mesh(lipGeo, lensRingMat);
    lip.position.set(lx, ly, ringFaceZ);
    phone.add(lip);

    const layers = [
      [barrelGeo, blackMatte, 0.0006],
      [sapphireGeo, sapphireMat, 0.0012],
      [elementGeo, lensElementMat, 0.0018],
      [pupilGeo, lensPupilMat, 0.0024]
    ];
    for (const [geo, mat, offset] of layers) {
      const disc = new THREE.Mesh(geo, mat);
      disc.position.set(lx, ly, ringFaceZ - offset);
      disc.rotation.y = Math.PI;
      phone.add(disc);
    }
  }

  // Flash, microphone and LiDAR on the opposite side of the plateau
  const sensorX = px0 + 0.1;
  const sensorRingGeo = zCylinder(0.044, 0.044, 0.008, 40);

  const flashRing = new THREE.Mesh(sensorRingGeo, lensRingMat);
  flashRing.position.set(sensorX, plateauCy + 0.15, plateauZ - 0.002);
  phone.add(flashRing);

  const flashCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.036, 40),
    new THREE.MeshStandardMaterial({
      color: 0xf4efe1,
      emissive: new THREE.Color(0xfde68a),
      emissiveIntensity: 0.12,
      roughness: 0.45
    })
  );
  flashCore.position.set(sensorX, plateauCy + 0.15, plateauZ - 0.0065);
  flashCore.rotation.y = Math.PI;
  phone.add(flashCore);

  const lidarRing = new THREE.Mesh(sensorRingGeo, lensRingMat);
  lidarRing.position.set(sensorX, plateauCy - 0.15, plateauZ - 0.002);
  phone.add(lidarRing);

  const lidarCore = new THREE.Mesh(new THREE.CircleGeometry(0.036, 40), sapphireMat);
  lidarCore.position.set(sensorX, plateauCy - 0.15, plateauZ - 0.0065);
  lidarCore.rotation.y = Math.PI;
  phone.add(lidarCore);

  const rearMic = new THREE.Mesh(new THREE.CircleGeometry(0.011, 20), blackMatte);
  rearMic.position.set(sensorX, plateauCy, plateauZ - 0.0008);
  rearMic.rotation.y = Math.PI;
  phone.add(rearMic);

  // ----- Sides: buttons & antenna bands -----
  const sideX = outerHalfW;
  addSideButton(phone, { x: sideX, y: 0.3, length: 0.27, material: frameMat });
  addSideButton(phone, {
    x: sideX,
    y: -0.3,
    length: 0.15,
    material: cameraGlassMat,
    protrude: 0.003,
    thickness: 0.026
  });
  addSideButton(phone, { x: -sideX, y: 0.6, length: 0.09, material: frameMat });
  addSideButton(phone, { x: -sideX, y: 0.38, length: 0.17, material: frameMat });
  addSideButton(phone, { x: -sideX, y: 0.16, length: 0.17, material: frameMat });

  const bandDepth = D + BT;
  const sideBandGeo = new THREE.BoxGeometry(0.008, 0.01, bandDepth);
  for (const ax of [-(sideX - 0.002), sideX - 0.002]) {
    for (const ay of [0.86, -0.86]) {
      const band = new THREE.Mesh(sideBandGeo, antennaMat);
      band.position.set(ax, ay, 0);
      phone.add(band);
    }
  }
  const capBandGeo = new THREE.BoxGeometry(0.01, 0.008, bandDepth);
  for (const ax of [-0.3, 0.3]) {
    for (const ay of [outerHalfH - 0.002, -(outerHalfH - 0.002)]) {
      const band = new THREE.Mesh(capBandGeo, antennaMat);
      band.position.set(ax, ay, 0);
      phone.add(band);
    }
  }

  // ----- Bottom: USB-C, speaker & mic grilles, screws -----
  const bottomY = -outerHalfH;
  const usbc = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.09, 6, 16), blackMatte);
  usbc.rotation.z = Math.PI / 2;
  usbc.position.set(0, bottomY + 0.004, 0);
  phone.add(usbc);

  const holeGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.01, 12);
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const hole = new THREE.Mesh(holeGeo, blackMatte);
      hole.position.set(dir * (0.135 + i * 0.026), bottomY + 0.003, 0);
      phone.add(hole);
    }
  }

  const screwGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.01, 16);
  const screwMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 1, roughness: 0.3 });
  for (const sx of [-0.085, 0.085]) {
    const screw = new THREE.Mesh(screwGeo, screwMat);
    screw.position.set(sx, bottomY + 0.003, 0);
    phone.add(screw);
  }

  phone.userData.sheenTexture = sheenTexture;
  phone.userData.floorY = -outerHalfH - 0.1;
  return phone;
}

/**
 * Mounts an interactive procedural 3D iPhone mockup displaying the SAMUDRA
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

  // Cap DPR at 1.5x so 4K/Retina displays stay smooth without excessive fill-rate
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(Math.min(1.5, dpr));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'phone-3d-canvas';
  renderer.domElement.setAttribute('aria-label', 'Pratinjau 3D interaktif aplikasi SAMUDRA');

  const scene = new THREE.Scene();
  const envTarget = createStudioEnvironment(renderer);
  scene.environment = envTarget.texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 1, 14);
  camera.position.set(0, -0.04, 5.2);

  const keyLight = new THREE.DirectionalLight(0xf8fafc, 1.8);
  keyLight.position.set(2.8, 3.2, 4.0);
  scene.add(keyLight);

  const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
  cyanRimLight.position.set(3.2, 0.6, -1.6);
  scene.add(cyanRimLight);

  const backKeyLight = new THREE.DirectionalLight(0xe2e8f0, 1.2);
  backKeyLight.position.set(-2.5, 2.5, -3.5);
  scene.add(backKeyLight);

  const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.7);
  fillLight.position.set(-3.0, -0.5, 2.5);
  scene.add(fillLight);

  const screenTexture = new THREE.TextureLoader().load(screenUrl, () => {
    if (fallbackEl) fallbackEl.style.display = 'none';
  });
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  screenTexture.minFilter = THREE.LinearMipmapLinearFilter;
  screenTexture.magFilter = THREE.LinearFilter;

  const phoneGroup = buildPhoneModel(screenTexture);
  const sheenTexture = phoneGroup.userData.sheenTexture;
  scene.add(phoneGroup);

  const floorTex = createFloorShadowTexture();
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
  floorPlane.position.set(0, phoneGroup.userData.floorY, 0);
  scene.add(floorPlane);

  container.appendChild(renderer.domElement);

  const syncSize = () => {
    const rect = container.getBoundingClientRect();
    const w = Math.max(160, Math.round(rect.width));
    const h = Math.max(300, Math.round(rect.height));
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
        // Pointer capture unsupported for this pointer type
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
  const baseRotY = -0.26;
  const baseRotX = 0.05;
  const baseRotZ = 0.025;

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

    const bobY = prefersReducedMotion ? 0 : Math.sin(elapsed * 1.25) * 0.04;
    const swayY = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.68) * 0.08;
    const swayX = prefersReducedMotion ? 0 : Math.cos(elapsed * 0.85) * 0.03;
    const swayZ = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.55) * 0.02;

    phoneGroup.position.y = bobY;
    phoneGroup.rotation.y = baseRotY + swayY + smoothHoverX * 0.22 + dragYaw;
    phoneGroup.rotation.x = baseRotX + swayX + smoothHoverY * 0.12 + dragPitch;
    phoneGroup.rotation.z = baseRotZ + swayZ - smoothHoverX * 0.03;

    // Glass glare glides across the display as the handset turns
    sheenTexture.offset.set(-(phoneGroup.rotation.y - baseRotY) * 0.45, (phoneGroup.rotation.x - baseRotX) * 0.3);

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
    sheenTexture.dispose();
    floorTex.dispose();
    renderer.dispose();
  };
}
