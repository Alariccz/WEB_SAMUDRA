import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ---- Noise helpers ----
function hs(i, j) { const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return n - Math.floor(n); }
function vn(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j; const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); return hs(i, j) * (1 - sx) * (1 - sy) + hs(i + 1, j) * sx * (1 - sy) + hs(i, j + 1) * (1 - sx) * sy + hs(i + 1, j + 1) * sx * sy; }
function fb(x, y) { let s = 0, a = 0.5; for (let i = 0; i < 5; i++) { s += a * vn(x, y); x *= 2.03; y *= 2.03; a *= 0.5; } return s; }
function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function getCoastX(z) {
  // Graceful curving shoreline: broad bay and natural coastal sweeps
  const broadBay = Math.sin(z * 0.08 + 0.6) * 2.2;
  const cove = Math.cos(z * 0.16 - 0.3) * 1.4;
  const detail = (vn(z * 0.35, 8.5) - 0.5) * 1.1;
  return 6.5 + broadBay + cove + detail;
}

function th(x, z) {
  const coastX = getCoastX(z);
  const dist = x - coastX;

  // Island boundaries: much wider along the horizon (z: -38 to +38, x: inland to 60)
  const zMask = smoothstep(38.0, 26.0, Math.abs(z));
  const eastMask = smoothstep(60.0, 50.0, x);
  const islandBoundMask = Math.max(0, zMask * eastMask);

  if (dist < 0) {
    // Offshore / seabed
    const d = -dist;
    const shallowDrop = smoothstep(0.0, 3.5, d) * 1.1;
    const deepDrop = smoothstep(3.0, 16.0, d) * 6.9;
    const bedNoise = (1.0 - smoothstep(10.0, 18.0, d)) * (fb(x * 0.15, z * 0.15) - 0.5) * 0.3;
    return -shallowDrop - deepDrop + bedNoise;
  }

  // On land
  // Beach zone: dist 0 to 4.5 -> height 0 to 1.2m (smooth sandy beach)
  const beachT = Math.min(1.0, dist / 4.5);
  const beachRise = Math.pow(beachT, 1.2) * 1.15;
  const sandRipples = Math.sin(dist * 1.2 + fb(x * 0.4, z * 0.4)) * 0.06 * (1.0 - beachT);

  // Coastal terrace: dist 3.5 to 9.5 -> height 1.1 to 2.8m (where coastal village sits)
  const terraceT = smoothstep(3.5, 9.5, dist);
  const terraceRise = terraceT * 1.7;

  // Mountain rise: broad mountain range spanning across the wide island (rising to 15-18m)
  const mountainT = Math.max(0, (dist - 6.0) / 28.0);
  const m = Math.min(1.0, mountainT);
  const mountainMain = Math.pow(m, 1.05) * 13.5 + Math.pow(m, 1.35) * 4.5 * (fb(x * 0.07, z * 0.05 + 2.5) - 0.25);
  const ridgeShape = Math.pow(m, 1.25) * 3.5 * (1.0 - Math.abs(2.0 * fb(x * 0.12 + 5.0, z * 0.08) - 1.0));
  const detailNoise = (dist > 3.0 ? (fb(x * 0.3, z * 0.3) - 0.5) * 0.5 * Math.min(1.0, (dist - 3.0) / 5.0) : 0);

  // Shelter plateau at (41.6, -8.6)
  const dShelter = Math.hypot(x - 41.6, z - (-8.6));
  const shelterPlateau = smoothstep(5.0, 1.5, dShelter) * 1.6;

  const inlandElevation = (beachRise + sandRipples + terraceRise + mountainMain + ridgeShape + detailNoise + shelterPlateau);

  // Blend with island boundaries so edges meet sea level smoothly
  return inlandElevation * islandBoundMask + (1.0 - islandBoundMask) * (-smoothstep(0, 5, dist) * 4.0);
}

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.25 : 1;

// ---- Shared GLSL chunks ----
const SK = `float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1.,0.)),f.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.)),f.x),f.y);}float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*nz(p);p*=2.03;a*=.5;}return s;}float fbm3(vec2 p){float a=.5,s=0.;for(int i=0;i<3;i++){s+=a*nz(p);p*=2.03;a*=.5;}return s/.875;}vec3 SUN(){return normalize(vec3(-.5,.55-.51*min(uTod*2.,1.)-max(uTod-.5,0.)*.6,-.8));}vec3 TM(vec3 c){c*=1.15;c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);return pow(clamp(c,0.,1.),vec3(.4545));}vec3 h3(vec3 p){p=fract(p*vec3(.1031,.103,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}vec3 STARS(vec3 d){vec3 col=vec3(0.);for(int l=0;l<2;l++){float sc=l==0?70.:170.;float th=l==0?.93:.86;vec3 p=d*sc,id=floor(p),f=fract(p),h=h3(id);vec3 pos=.2+.6*h;float dist=length(f-pos);float mg=pow(h3(id+7.).x,5.);float pr=step(th,h3(id+3.).y);float sz=.06+.2*mg;float core=1.-smoothstep(0.,sz,dist);float tw=.55+.45*sin(uT*(3.+3.*h.z)+h.x*40.)*(.8+.2*sin(uT*11.+h.y*60.));float glow=(exp(-dist*dist/(sz*sz*18.))*.6+exp(-dist/(sz*5.))*.14*step(.12,mg))*(.7+.3*tw);vec3 tc=mix(vec3(.65,.78,1.),vec3(1.,.82,.62),h3(id+11.).z);col+=tc*(core*core*tw+glow)*(.35+3.2*mg)*pr*(l==0?1.:.5);}return col;}vec3 SKY(vec3 d){float k=uTod;float cvr=0.;vec3 zen,hor;if(k<.5){float q=k*2.;zen=mix(vec3(.06,.2,.55),vec3(.04,.08,.22),q);hor=mix(vec3(.55,.75,.9),vec3(1.,.45,.2),q);}else{float q=(k-.5)*2.;zen=mix(vec3(.04,.08,.22),vec3(.004,.01,.04),q);hor=mix(vec3(1.,.45,.2),vec3(.04,.09,.18),q);}float y=max(d.y,0.);vec3 c=mix(hor,zen,pow(y,.5));vec3 sd=SUN();float sp=max(dot(d,sd),0.);vec3 sc=mix(vec3(1.,.85,.6),vec3(1.,.5,.25),(1.-smoothstep(0.,.5,sd.y)));c+=sc*(pow(sp,900.)*6.+pow(sp,16.)*.5+pow(sp,3.)*.12)*(1.-k*.8);if(d.y>0.){vec2 cp=d.xz/(d.y+.12)*1.3+vec2(uT*.02,uT*.008);float n1=fbm(cp),n2=fbm(cp+sd.xz*.15);float cl=smoothstep(.45,.72,n1)*smoothstep(0.,.15,d.y);cvr=cl;float lit=clamp(.5+(n1-n2)*5.,0.,1.);vec3 top=(mix(vec3(1.),hor*1.4,.35))*(1.-k*.9)+.012,base=mix(hor*.5,vec3(.4,.45,.55),.4)*(1.-k*.85)+.008;c=mix(c,mix(base,top,lit),cl*.92);}float nt=smoothstep(.55,.95,k)*smoothstep(0.,.2,d.y)*(1.-cvr);if(nt<.002)return c;vec3 ax=normalize(vec3(.5,.6,-.6));float mb=exp(-pow(dot(d,ax)*3.5,2.));float cd=fbm(vec2(dot(d,vec3(.8,-.2,.55)),dot(d,vec3(0.,.95,.3)))*7.);return c+(vec3(.3,.36,.55)*mb*(.12+.9*cd*cd)*.45)*nt;}`;

const HF = `uniform float uT,uAmp,uTsu,uFront,uPr,uPa,uBv,uTsuH,uTod;uniform vec2 uPc,uBu;float WV(float x){return sin(x)-0.12*cos(2.0*x);}float H(vec2 p){float h=WV(dot(p,vec2(0.88,0.42))*0.40+uT*0.95)*0.50+WV(dot(p,vec2(-0.35,0.93))*0.62+uT*1.15)*0.26+WV(dot(p,vec2(0.65,-0.72))*1.10+uT*1.40)*0.12+WV(dot(p,vec2(0.25,0.96))*1.95+uT*1.75)*0.05;h*=uAmp;float d=(p.x-uFront)/3.6;h+=uTsu*uTsuH*exp(-d*d)*(1.+.12*sin(p.y*.5));float r=length(p-uPc);h+=(uPa>0.001?uPa*.2*exp(-pow((r-uPr)*1.5,2.)):0.);float b=length(p-uBu);h+=.06*sin(b*2.8-uT*2.8)*exp(-b*.35)*uBv;return h;}`;

function createFallbackScene(canvas) {
  const stageEl = canvas.closest('.stage__sticky') || canvas.parentElement;
  if (stageEl) {
    stageEl.style.background = 'radial-gradient(ellipse at 50% 60%, #062347 0%, #030d1f 60%, #020512 100%)';
  }

  const dummyVec = new THREE.Vector3();
  const dummyCurve = { getPoint: () => dummyVec };
  const dummyMesh = {
    visible: true,
    scale: { setScalar: () => {} },
    position: { y: 0, set: () => {}, copy: () => {} },
    rotation: { y: 0, z: 0, set: () => {} },
    material: { opacity: 1, color: { setHex: () => {} } }
  };
  const dummyGroup = {
    visible: true,
    scale: { setScalar: () => {} },
    position: { y: 0, set: () => {}, copy: () => {} },
    rotation: { y: 0, z: 0, set: () => {} },
    add: () => {}
  };

  const dots = Array.from({ length: 14 }, () => ({
    visible: true,
    material: { opacity: 1 },
    position: { copy: () => {} }
  }));

  const U = {
    uT: { value: 0 }, uAmp: { value: 0.45 }, uTsu: { value: 0 }, uFront: { value: -30 },
    uPc: { value: new THREE.Vector2(4, 2) }, uPr: { value: 0 }, uPa: { value: 0 },
    uBu: { value: new THREE.Vector2(4, 2) }, uBv: { value: 1 }, uTsuH: { value: 4 },
    uTod: { value: 0.5 }, uPx: { value: 1 },
    uTer: { value: 0 }, uRisk: { value: 1 }, uUnderwater: { value: 0 }
  };

  const K = [
    { cp: [-2, 3.4, 22], lk: [-1, 1.8, 0], amp: 0.45, tsu: 0, ter: 0, buoy: 1, path: 0 },
    { cp: [-6, 4.4, 19], lk: [4, 2, 0], amp: 0.85, tsu: 1, ter: 1, buoy: 0.95, path: 0 },
    { cp: [7, 12.5, 22], lk: [16, 2.4, 2], amp: 0.25, tsu: 0, ter: 1, buoy: 0, path: 1 },
  ];
  const S = { cp: new THREE.Vector3(), lk: new THREE.Vector3(), amp: 0, tsu: 0, ter: 0, buoy: 1, path: 0 };

  let pp = 0, pt = 0, cur = -1, yaw = 0, yawT = 0, drag = 0, lx = 0, crestT = 4, rk = 1;
  let mx = 0, my = 0, pingT = 99;

  return {
    isFallback: true,
    U, S, K,
    cam: { aspect: 1, position: dummyVec, lookAt: () => {} },
    dome: dummyMesh,
    stars: dummyMesh,
    buoyGroup: dummyGroup,
    lamp: dummyMesh,
    pm: { opacity: 1 },
    trail: dummyMesh,
    trail2: dummyMesh,
    dots,
    beacon: dummyMesh,
    curve: dummyCurve,
    land: dummyMesh,
    tubeMesh: dummyMesh,
    landGroup: dummyGroup,
    shoreSplash: dummyMesh,
    renderer: {
      render: () => {},
      setSize: () => {}
    },
    scene: {},
    world: dummyGroup,
    ping: () => { pingT = 0; U.uPr.value = 0; U.uPa.value = 1; },
    sun: { position: dummyVec, intensity: 1 },
    amb: { intensity: 1 },
    getState: () => ({ pp, pt, cur, yaw, yawT, drag, lx, crestT, rk, mx, my }),
    setState: (update) => {
      if (update.pp !== undefined) pp = update.pp;
      if (update.pt !== undefined) pt = update.pt;
      if (update.cur !== undefined) cur = update.cur;
      if (update.yaw !== undefined) yaw = update.yaw;
      if (update.yawT !== undefined) yawT = update.yawT;
      if (update.drag !== undefined) drag = update.drag;
      if (update.lx !== undefined) lx = update.lx;
      if (update.crestT !== undefined) crestT = update.crestT;
      if (update.rk !== undefined) rk = update.rk;
      if (update.mx !== undefined) mx = update.mx;
      if (update.my !== undefined) my = update.my;
      if (update.pingT !== undefined) pingT = update.pingT;
    },
    getPingT: () => pingT,
    setPingT: (v) => { pingT = v; },
    lerp: (a, b, k) => a + (b - a) * k
  };
}

export function createScene(canvas) {
  function lerp(a, b, k) { return a + (b - a) * k; }

  // Dispose previous renderer if existed on HMR
  if (window.__samudra_renderer) {
    try {
      window.__samudra_renderer.dispose();
      window.__samudra_renderer.forceContextLoss();
    } catch (_) {}
    window.__samudra_renderer = null;
  }

  // Handle context events
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn('WebGL context lost.');
  }, false);

  canvas.addEventListener('webglcontextrestored', () => {
    console.info('WebGL context restored.');
  }, false);

  // Try creating WebGLRenderer with fallback options
  let renderer = null;
  const contextOptions = [
    { antialias: true, alpha: false, powerPreference: 'default' },
    { antialias: false, alpha: false, powerPreference: 'default' },
    { antialias: false, precision: 'mediump' }
  ];

  for (const opts of contextOptions) {
    try {
      renderer = new THREE.WebGLRenderer({ canvas, ...opts });
      if (renderer && renderer.getContext()) break;
    } catch (e) {
      console.warn('WebGL initialization attempt:', opts, e);
      renderer = null;
    }
  }

  if (!renderer || !renderer.getContext()) {
    console.warn('WebGL context unavailable in this environment. Activating fallback scene.');
    return createFallbackScene(canvas);
  }

  window.__samudra_renderer = renderer;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x020512);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
  const world = new THREE.Group();
  scene.add(world);

  const amb = new THREE.AmbientLight(0x6688bb, 0.9);
  const sun = new THREE.DirectionalLight(0xffe6c0, 1.2);
  scene.add(amb, sun);

  // ---- Height texture (widened to 80x80) ----
  const TW = 256;
  const tdata = new Uint8Array(TW * TW * 4);
  for (let j = 0; j < TW; j++) for (let i = 0; i < TW; i++) {
    const wx = -20 + (i / (TW - 1)) * 80;
    const wz = -40 + (j / (TW - 1)) * 80;
    const v = Math.max(0, Math.min(1, (th(wx, wz) + 8) / 24));
    tdata[(j * TW + i) * 4] = v * 255;
    tdata[(j * TW + i) * 4 + 3] = 255;
  }
  const htex = new THREE.DataTexture(tdata, TW, TW, THREE.RGBAFormat);
  htex.minFilter = htex.magFilter = THREE.LinearFilter;
  htex.needsUpdate = true;

  // ---- Uniforms ----
  const U = {
    uT: { value: 0 }, uAmp: { value: 0.45 }, uTsu: { value: 0 }, uFront: { value: -30 },
    uPc: { value: new THREE.Vector2(4, 2) }, uPr: { value: 0 }, uPa: { value: 0 },
    uBu: { value: new THREE.Vector2(4, 2) }, uBv: { value: 1 }, uTsuH: { value: 4 },
    uTod: { value: 0.5 }, uPx: { value: Math.min(window.devicePixelRatio || 1, 1.5) },
    uTer: { value: 0 }, uRisk: { value: 1 }, uH: { value: htex }, uUnderwater: { value: 0 }
  };

  // ---- Water (Optimized resolution for locked 60 FPS) ----
  const waterGeo = new THREE.PlaneGeometry(280, 180, 200, 140);
  waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(waterGeo, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: true, side: THREE.DoubleSide,
    vertexShader: HF + 'varying vec3 vW;varying vec2 vP;void main(){vec3 p=position;vP=p.xz;p.y=H(vP);vW=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}',
    fragmentShader: HF + SK + `
uniform sampler2D uH;
uniform float uTer;
uniform float uRisk;
uniform float uUnderwater;
varying vec3 vW;
varying vec2 vP;

float GR(vec2 p){
  vec2 uv = vec2((p.x + 20.) / 80., (p.y + 40.) / 80.);
  if(uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) return -8.;
  float h = texture2D(uH, clamp(uv, 0., 1.)).r * 24. - 8.;
  return mix(-8., h, uTer);
}

// Silky smooth harmonic micro-ripples (continuous C-infinity harmonics, never jagged or crumpled)
float HD(vec2 p){
  float r1 = sin(p.x * 1.5 + p.y * 1.1 + uT * 1.05) * cos(p.x * 1.0 - p.y * 1.4 + uT * 0.85) * 0.020;
  float r2 = sin(dot(p, vec2(-0.7, 0.7)) * 2.5 + uT * 1.35) * 0.009;
  return H(p) + (r1 + r2) * clamp(0.35 + uAmp * 0.65, 0.2, 1.0);
}

void main(){
  // Never render inverted back-faces as underside ceiling when camera is above water
  if (!gl_FrontFacing && uUnderwater < 0.05) discard;

  float h0 = HD(vP);
  float groundH = GR(vP);
  float depth = h0 - groundH;

  vec3 V = normalize(cameraPosition - vW);
  float dist = length(cameraPosition - vW);
  float e = 0.16 + dist * 0.005;
  float hx = HD(vP + vec2(e, 0.)), hy = HD(vP + vec2(0., e));
  vec3 n = normalize(vec3((h0 - hx)/e, 1.35, (h0 - hy)/e));
  if (!gl_FrontFacing) {
    n = normalize(vec3((hx - h0)/e, -1.35, (hy - h0)/e));
  }
  n = normalize(mix(n, vec3(0., 1., 0.), smoothstep(20., 90., dist)));

  float fr = .02 + .98 * pow(1. - max(dot(n, V), 0.), 5.);
  vec3 r = reflect(-V, n);
  r.y = abs(r.y);

  vec3 sd = SUN();
  vec3 sky = SKY(r);

  // Depth color gradient: pristine tropical turquoise shallows to deep navy ocean
  vec3 shallowShore = vec3(0.12, 0.74, 0.70);
  vec3 lagoon = vec3(0.04, 0.44, 0.50);
  vec3 midOcean = vec3(0.015, 0.18, 0.30);
  vec3 deepOcean = vec3(0.004, 0.028, 0.065);

  float d1 = smoothstep(0.0, 0.8, depth);
  float d2 = smoothstep(0.8, 3.5, depth);
  float d3 = smoothstep(3.5, 7.5, depth);

  vec3 col = mix(shallowShore, lagoon, d1);
  col = mix(col, midOcean, d2);
  col = mix(col, deepOcean, d3);

  // Subsurface scattering
  float sss = pow(max(dot(V, normalize(-sd + n*.5)), 0.), 3.) * clamp(h0*.4 + .5, 0., 1.) * smoothstep(0., .3, sd.y);
  col += vec3(0., .42, .35) * sss * .5;
  col *= 1. - uTod*.55;

  // Fresnel blend with sky
  vec3 c = mix(col, sky, fr);

  // Underwater view looking up at water ceiling: Snell's window + total internal reflection
  if (!gl_FrontFacing) {
    float underFr = .06 + .94 * pow(1. - max(dot(-n, V), 0.), 3.);
    vec3 underCol = mix(vec3(0.02, 0.28, 0.42), sky * 0.70, 1. - underFr);
    c = mix(underCol, vec3(0.008, 0.09, 0.18), underFr * 0.85);
    c += vec3(0.3, 0.85, 0.98) * pow(max(dot(V, sd), 0.), 14.) * 1.6;
  } else {
    // Soft, silky sun specular highlight and golden wave sheen (free of harsh speckling noise)
    float specSharp = pow(max(dot(r, sd), 0.), 220.);
    float specBroad = pow(max(dot(r, sd), 0.), 26.);
    vec3 sunCol = vec3(1.0, 0.94, 0.82);
    c += sunCol * (specSharp * 3.4 + specBroad * 0.60) * smoothstep(0., 0.15, sd.y);
  }

  // ── BREAKING SURF & CRASHING WAVE FOAM ────────────────────────────
  float steep = length(vec2(h0 - hx, h0 - hy)) / e;
  float fn = smoothstep(.38, .7, nz(vP * 3. + uT * .1));

  // Wave phase matches the actual wave propagation vector
  float wavePhase = dot(vP, vec2(0.88, 0.42)) * 0.40 + uT * 0.95;
  float waveCrest = sin(wavePhase);

  // Shoreline breaking foam: triggers cleanly and boldly when wave crest hits the shallow beach
  float shoreCrash = smoothstep(.50, .01, depth) * smoothstep(.18, .78, waveCrest + (nz(vP * 4.5) - .5) * .40);
  // Waterline wash as waves lap the sand
  float shoreWash  = smoothstep(.25, .005, depth) * smoothstep(.20, .80, sin(depth * 16. - uT * 3.2 + nz(vP * 2.5) * 2.5));

  // Open ocean wave crest foam
  float oceanFoam  = smoothstep(.50 * uTsuH, .95 * uTsuH, h0) * uTsu + smoothstep(0.9, 1.8, steep) * .45 * uAmp;
  float totalFoam  = clamp(oceanFoam * fn * 1.3 + shoreCrash * 0.95 + shoreWash * 0.55, 0.0, 1.0);

  vec3 foamCol = vec3(.96, .98, 1.0) * (1. - uTod * .4);
  c = mix(c, foamCol, totalFoam);

  // Brilliant sparkling spray glint along breaking wave crest
  c += vec3(1., .98, .92) * (pow(max(dot(r, sd), 0.), 35.) * 1.2 + 0.25) * shoreCrash;

  // Ping ripple (completely zeroed when uPa reaches 0, preventing any ghost ring flash)
  if (uPa > 0.001) {
    float rr = length(vP - uPc);
    c += vec3(0., 1., .6) * uPa * exp(-pow((rr - uPr)*1.1, 2.)) * .7;
  }

  // Shoreline hazard glow tint in water (matching reference image)
  if (uRisk > 0.01) {
    float wHz = smoothstep(-1.8, 0.2, groundH) * (1.0 - smoothstep(1.2, 3.2, groundH)) * smoothstep(0.02, 1.4, depth);
    vec3 hzWaterCol = vec3(0.98, 0.16, 0.42);
    c = mix(c, hzWaterCol * 1.15, wHz * 0.48 * uRisk);
  }

  // Volumetric underwater fog tint when camera is submerged
  if (uUnderwater > 0.01) {
    vec3 underAbyss = vec3(0.005, 0.08, 0.16) * (1. - uTod * .5);
    c = mix(c, underAbyss, smoothstep(4., 55., dist) * uUnderwater * 0.88);
  }

  // Fog
  float fg = smoothstep(40., 150., dist);
  c = mix(c, SKY(vec3(-V.x, .03, -V.z)), fg);

  // Soft shore alpha fade (eliminates hard polygonal z-fighting along shoreline)
  float shoreFade = smoothstep(0.0, 0.22, max(0.0, depth));
  float baseAlpha = mix(0.20, 0.92, smoothstep(0.0, 4.0, max(0.0, depth)));
  float finalAlpha = clamp(baseAlpha * shoreFade, 0.0, 1.0);

  gl_FragColor = vec4(TM(c), max(finalAlpha, fr * shoreFade));
}
`
  }));
  world.add(water);

  // ---- Sky dome ----
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(250, 32, 16),
    new THREE.ShaderMaterial({
      uniforms: U, side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform float uT,uTod;varying vec3 vD;' + SK + 'void main(){gl_FragColor=vec4(TM(SKY(normalize(vD))),1.);}'
    })
  );
  dome.renderOrder = -1;
  scene.add(dome);

  // ---- Stars ----
  const N = 1900;
  const sPos = new Float32Array(N * 3), sSize = new Float32Array(N), sCol = new Float32Array(N * 3), sPhase = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * 6.2832, y = 0.02 + 0.98 * Math.random(), r = Math.sqrt(1 - y * y);
    sPos[i * 3] = Math.cos(a) * r * 240; sPos[i * 3 + 1] = y * 240; sPos[i * 3 + 2] = Math.sin(a) * r * 240;
    sSize[i] = i < 40 ? 14 + Math.random() * 22 : i < 320 ? 3 + Math.random() * 5 : 1.6 + Math.random() * 1.6;
    const t = Math.random(); sCol[i * 3] = 0.7 + 0.3 * t; sCol[i * 3 + 1] = 0.8 + 0.05 * t; sCol[i * 3 + 2] = 1 - 0.35 * t;
    sPhase[i] = Math.random() * 6.28;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  starGeo.setAttribute('aS', new THREE.BufferAttribute(sSize, 1));
  starGeo.setAttribute('aC', new THREE.BufferAttribute(sCol, 3));
  starGeo.setAttribute('aP', new THREE.BufferAttribute(sPhase, 1));
  const stars = new THREE.Points(starGeo, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'uniform float uT,uTod,uPx;attribute float aS,aP;attribute vec3 aC;varying vec3 vC;varying float vB;void main(){float nt=smoothstep(.55,.95,uTod);float tw=.55+.45*sin(uT*(2.+3.*fract(aP))+aP*7.)*(.8+.2*sin(uT*9.+aP*3.));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=min(aS*(.75+.35*tw)*uPx,62.);vB=smoothstep(6.,20.,aS);vC=aC*tw*(.5+aS*.06+vB)*nt*smoothstep(0.,.2,normalize(position).y);}',
    fragmentShader: 'varying vec3 vC;varying float vB;void main(){vec2 q=gl_PointCoord-.5;float r=length(q)*2.;float core=exp(-r*r*16.);float halo=exp(-r*4.5)*.55;float spk=(exp(-abs(q.x)*70.)*exp(-abs(q.y)*5.)+exp(-abs(q.y)*70.)*exp(-abs(q.x)*5.))*vB*1.3;float fd=1.-smoothstep(.75,1.,r);gl_FragColor=vec4(vC*((core*1.6+halo)*fd+spk*fd),1.);}'
  }));
  stars.renderOrder = -0.5; stars.frustumCulled = false; scene.add(stars);

  // ---- Land geometry (Optimized resolution, silky-smooth 60 FPS) ----
  const tg = new THREE.PlaneGeometry(80, 80, 180, 150);
  tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i) + 20, z = tp.getZ(i);
    tp.setXYZ(i, x, th(x, z), z);
  }
  tg.computeVertexNormals();

  const LF = 'uniform float uT,uTod,uRisk;uniform sampler2D uH,uP;varying vec3 vW,vN;varying float vH;' + SK + `
float HT(vec2 p){
  vec2 uv=clamp(vec2((p.x+20.)/80.,(p.y+40.)/80.),0.,1.);
  return texture2D(uH,uv).r*24.-8.;
}
float GGX(float nh,float a){float a2=a*a;float d=nh*nh*(a2-1.)+1.;return a2/(3.14159*d*d+1e-5);}
float softShadow(vec2 p,float h,vec3 sd){
  float sh=1.;
  for(int i=0;i<4;i++){
    float t=.55*pow(float(i)+1.,1.35);
    vec3 q=vec3(p.x,h+.1,p.y)+sd*t;
    if(q.x>-18.&&q.x<58.&&abs(q.z)<38.) sh=min(sh,clamp((q.y-HT(q.xz))*3.5+.4,0.,1.));
  }
  return sh;
}
void main(){
  vec3 n  = normalize(vN);
  vec2 p  = vW.xz;
  float h = vH;
  vec3 V  = normalize(cameraPosition - vW);

  // ── MULTI-SCALE NOISE (Optimized for 60 FPS) ────────────────────
  float n1=fbm(p*1.8+vec2(.0,2.3));
  float n2=fbm3(p*5.5+vec2(3.7,.8));
  float n3=fbm3(p*13.+vec2(1.2,5.1));
  float n4=nz(p*38.+vec2(6.4,2.7));
  float n5=fbm3(p*.7+vec2(9.,1.));
  float n6=nz(p*3.2+vec2(2.,7.5));

  // ── ANALYTIC BUMP NORMAL from heightmap gradient ─────────────────
  float eps=.10;
  float hL=HT(p-vec2(eps,0.)),hR=HT(p+vec2(eps,0.));
  float hD=HT(p-vec2(0.,eps)),hU=HT(p+vec2(0.,eps));
  vec3 bN=normalize(vec3(hL-hR,2.*eps*1.5,hD-hU));
  // High-freq micro bump (Fast nz avoids expensive FBM loops)
  float mBx=nz(p*26.+1.3)-nz(p*26.+1.3+vec2(.05,0.));
  float mBz=nz(p*26.+1.3)-nz(p*26.+1.3+vec2(0.,.05));
  float bStr=mix(.08,.55,smoothstep(.5,4.,h));
  vec3 microB=normalize(vec3(mBx*bStr,1.,mBz*bStr));
  vec3 nn=normalize(n+bN*.60+microB*.30);
  float sl=clamp(1.-nn.y,0.,1.);

  // ── REALISTIC TOPOGRAPHIC MATERIAL PALETTE (Calibrated Ground Tones) ──
  // 1. WET TIDAL SAND (Deep damp volcanic sand with tidal moisture sheen)
  vec3 wSand = mix(vec3(0.08, 0.075, 0.065), vec3(0.13, 0.115, 0.095), n3 * 0.7 + n4 * 0.3);

  // 2. DRY COASTAL SAND & DUNES (Warm natural earth sand, grounded and not bleached)
  vec3 dSand = mix(vec3(0.18, 0.16, 0.13), vec3(0.24, 0.21, 0.17), n3);
  dSand += (n4 - 0.5) * 0.02;

  // 3. COASTAL LOWLAND SCRUB & VOLCANIC LOAM (Organic earth and coastal meadow)
  vec3 coastalLoam = mix(vec3(0.07, 0.06, 0.045), vec3(0.10, 0.085, 0.065), n2);
  vec3 coastalScrub = mix(vec3(0.08, 0.12, 0.07), vec3(0.12, 0.16, 0.09), n3);
  vec3 lowlandVeg = mix(coastalLoam, coastalScrub, 0.65 + (n1 - 0.5) * 0.3);

  // 4. HILLSIDE FOREST CANOPY & UNDERSTORY (Organic, muted olive & deep evergreen)
  vec3 darkForest = mix(vec3(0.05, 0.09, 0.04), vec3(0.08, 0.13, 0.06), n2 * 0.6 + n6 * 0.4);
  vec3 oliveCanopy = mix(vec3(0.07, 0.11, 0.06), vec3(0.10, 0.14, 0.08), n3);
  vec3 hillsideForest = mix(darkForest, oliveCanopy, n5);

  // 5. HIGHLAND MONTANE RIDGE & HEATH (Natural alpine grasses & subalpine shrubs)
  vec3 montaneGrass = mix(vec3(0.08, 0.12, 0.06), vec3(0.12, 0.15, 0.09), n1);
  vec3 alpineHeath = mix(vec3(0.10, 0.12, 0.08), vec3(0.14, 0.15, 0.11), n3);

  // 6. STRATIFIED BEDROCK & CLIFF CRAGS (Natural geological layering & dark scree)
  float strata = sin(h * 6.5 + n1 * 4.5 + p.x * 0.5) * 0.5 + 0.5;
  vec3 rockDark = mix(vec3(0.07, 0.07, 0.075), vec3(0.10, 0.10, 0.105), n2);
  vec3 rockLight = mix(vec3(0.12, 0.115, 0.11), vec3(0.16, 0.15, 0.14), strata);
  vec3 cliffRock = mix(rockDark, rockLight, 0.42 + n3 * 0.35);
  // Scree talus & weathering in crevices
  cliffRock = mix(cliffRock, vec3(0.09, 0.08, 0.07), smoothstep(0.45, 0.75, n5) * 0.35);

  // ── BIOME BLENDING ────────────────────────────────────────────────
  float hN = h + (n1 - 0.5) * 0.55;
  float tDrySand   = smoothstep(0.2, 1.4, hN);
  float tLowland   = smoothstep(1.0, 2.8, hN);
  float tHillside  = smoothstep(2.5, 6.5, hN);
  float tAlpine    = smoothstep(6.5, 12.0, hN);
  float tForest    = tHillside;

  // Slope-dependent rock emergence (slope > 20 degrees starts exposing rock, > 35 degrees is pure crag)
  float rockMask = smoothstep(0.30, 0.62, sl + (n2 - 0.5) * 0.22);

  vec3 al = mix(wSand, dSand, tDrySand);
  al = mix(al, lowlandVeg, tLowland);
  al = mix(al, hillsideForest, tHillside);
  al = mix(al, montaneGrass, tAlpine);
  al = mix(al, cliffRock, rockMask);

  // Natural soil accumulation in sheltered valleys & hollows
  float valleySoil = smoothstep(0.42, 0.72, n5) * (1.0 - smoothstep(0.04, 0.28, sl)) * smoothstep(1.2, 8.0, h);
  al = mix(al, coastalLoam, valleySoil * 0.42);

  // Surface micro-granularity (soil grains, pebble specks, organic scatter)
  float grain = (n4 - 0.5) * 0.04;
  al = clamp(al + grain * al, 0.0, 1.0);

  // ── SURFACE MICRO-DETAIL & CAVITY OCCLUSION ─────────────────────
  // Curvature ambient darkening (ravines, crease hollows)
  float curvAO = clamp((hL + hR + hD + hU - 4.0 * h) * 0.85 + 0.5, 0.0, 1.0);
  al *= mix(0.72, 1.04, curvAO);

  // Subtle erosion streaks on steep rock slopes
  float erosion = fbm(vec2(p.x * 0.5 + n5, h * 0.8 + p.y * 2.2));
  al = mix(al, al * 1.12 + vec3(0.02, 0.015, 0.01), smoothstep(0.35, 0.53, sl) * smoothstep(0.38, 0.56, erosion) * 0.35);

  // ── EVAC PATH ────────────────────────────────────────────────────
  float pmk = texture2D(uP, clamp(vec2((p.x + 20.0) / 80.0, (p.y + 40.0) / 80.0), 0.0, 1.0)).r;
  float pw = smoothstep(0.3, 0.70, pmk + (n4 - 0.5) * 0.22);
  vec3 dirt = mix(vec3(0.08, 0.065, 0.048), vec3(0.11, 0.088, 0.062), n2 + n5 * 0.3);
  al = mix(al, hillsideForest * 0.85, smoothstep(0.02, 0.28, pmk) * (1.0 - pw) * 0.55);
  al = mix(al, dirt, pw * 0.65);
  float waterLine = smoothstep(-0.3, 0.6, h);
  al *= mix(0.58, 1.0, waterLine) * (0.94 + 0.12 * n3);

  // ── SUN & SKY ────────────────────────────────────────────────────
  vec3 sd = SUN();
  float sI = smoothstep(-0.12, 0.28, sd.y);
  vec3 sunC = mix(vec3(1.0, 0.62, 0.26), vec3(1.0, 0.96, 0.80), smoothstep(0.0, 0.5, sd.y));
  vec3 skyC = SKY(vec3(0.0, 1.0, 0.0));

  // ── AMBIENT OCCLUSION ────────────────────────────────────────────
  float ao4 = clamp(0.88 + (HT(p + vec2(0.9, 0.9)) + HT(p - vec2(0.9, 0.9)) - 2.0 * h) * 0.20, 0.28, 1.10);
  ao4 = mix(1.0, ao4, step(-12.0, p.x));
  float microAO = mix(1.0, 0.55 + 0.45 * n6, smoothstep(1.0, 6.0, h) * 0.60);
  float ao = ao4 * microAO;

  // ── SOFT SELF-SHADOW ─────────────────────────────────────────────
  float sh = softShadow(p, h, sd) * sI + (1.0 - sI);

  // ── DIFFUSE — Realistic directional light with natural shadow definition ─
  float NdotL = max(dot(nn, sd), 0.0);
  float diff = pow(NdotL, 1.12) * sh * sI;

  // ── SPECULAR — PBR Roughness ─────────────────────────────────────
  float rSand  = mix(0.18, 0.78, tDrySand);
  float rRock  = 0.70;
  float rGrass = 0.94;
  float matR   = mix(mix(rGrass, rRock, rockMask), rSand, 1.0 - tLowland);
  matR = clamp(matR, 0.12, 0.96);
  vec3 H2=normalize(V+sd);
  float NdotH=max(dot(nn,H2),0.);
  float NdotV=max(dot(nn,V),.04);
  float spec=GGX(NdotH,matR*matR)*max(NdotL,0.)*sh*sI/(4.*NdotV+.001);
  spec*=mix(.55,.03,matR);

  // ── 3-BAND HEMISPHERICAL AMBIENT ─────────────────────────────────
  float upF=nn.y*.5+.5;
  vec3 ambTop =skyC*.52;
  vec3 ambHor =mix(vec3(.32,.40,.52),skyC*.65,.45)*.20;
  vec3 ambBot =vec3(.03,.05,.04);
  vec3 ambCol =mix(mix(ambBot,ambHor,upF),ambTop,upF*upF);
  // Fill: scattered sky from opposite hemisphere
  float fillI=max(dot(nn,normalize(vec3(.5,.28,.5))),0.)*.22*(1.-uTod*.6);
  vec3 fillC=mix(vec3(.28,.42,.68),skyC*.5,.5);
  // Night fill
  float nightI=uTod*max(dot(nn,normalize(vec3(.3,.7,.4))),0.)*.38;

  // ── FINAL COLOUR ASSEMBLY (Balanced Contrast & Tone Mapping) ──────
  vec3 col = al * (ambCol * ao * 0.85 + sunC * diff * 0.95 + fillC * fillI * 0.65 + vec3(0.08, 0.14, 0.28) * nightI)
           + sunC * spec * ao * 0.5;

  // God-ray slope glow: slopes facing sun get warm scattered light
  float sGlow=pow(max(dot(normalize(vec3(nn.x,0.,nn.z)),normalize(vec3(sd.x,0.,sd.z))),0.),3.);
  col+=sunC*sGlow*smoothstep(.18,.5,sl)*sI*sh*.24*al;

  // Sky rim
  col+=SKY(reflect(-V,nn))*pow(1.-NdotV,2.5)*.10;
  // Wet sand sheen
  vec3 rf=reflect(-V,nn);
  col+=sunC*pow(max(dot(rf,sd),0.),22.)*.60*smoothstep(.38,0.,abs(h-.05))*sh*sI;

  // ── SUBMERGED SEABED ─────────────────────────────────────────────
  if(vW.y<0.){
    float wd=-vW.y;
    col*=exp(-wd*vec3(.32,.13,.06));
    float cx=sin(p.x*2.4+sin(p.y*1.9+uT*1.7)*1.5);
    float cz=sin(p.y*2.1+sin(p.x*1.7-uT*1.4)*1.5);
    col+=vec3(.10,.62,.56)*pow(abs(cx*cz),3.2)*.55*exp(-wd*.42)*(1.-uTod*.7);
  }

  // Height-fog in valleys for cinematic depth
  float valFog=exp(-max(h,0.)*.55)*(1.-smoothstep(0.,.35,sl))*.18;
  col=mix(col,skyC*.42+vec3(.08,.14,.22)*.58,clamp(valFog,0.,.32));

  // ── HAZARD OVERLAYS (Vivid Luminous Magenta-Pink Zone) ─────────
  float hz = smoothstep(-0.4, 0.2, h) * (1.0 - smoothstep(2.9, 3.6, h));
  float pulse = 0.88 + 0.12 * sin(uT * 3.2);
  vec3 riskPink = vec3(0.98, 0.16, 0.40); // Radiant neon coral-pink / magenta
  col = mix(col, riskPink * 1.35, hz * 0.76 * pulse * uRisk);
  // Sharp hazard contour line at the runup limit (h ~ 3.2m)
  col += vec3(1.0, 0.30, 0.52) * exp(-pow((h - 3.2) * 8.0, 2.0)) * 1.5 * uRisk;
  float sz = smoothstep(3.5, 4.3, h);
  float ct = smoothstep(.90, 1., abs(fract(h * 1.5) - .5) * 2.);
  col = mix(col, col * .82 + vec3(0., .32, .16), sz * .35 * uRisk);
  col += vec3(0., .95, .62) * ct * sz * .20 * uRisk;

  // ── AERIAL FOG ───────────────────────────────────────────────────
  float dCam=length(vW-cameraPosition);
  vec3 fogHor=SKY(normalize(vec3(vW.x-cameraPosition.x,.04,vW.z-cameraPosition.z)));
  col=mix(col,fogHor,smoothstep(50.,200.,dCam)*.9);

  gl_FragColor=vec4(TM(col),1.);
}
`;

  // Evac path texture
  const FP = [
    [[8.8, 9.4], [10.2, 7.4], [12.2, 8.4], [15, 5.4], [17.6, 2.4], [20.6, 3.8], [23.6, 0.6], [26.4, -2.6], [29.4, -0.8], [32.4, -4], [35.4, -7], [38.6, -5.4], [41.6, -8.6]],
    [[8.6, -7.4], [10, -5.6], [12.4, -4.8], [15.4, -6.8], [18.6, -8.6], [22, -7.4], [25.4, -9.6], [29, -8.4], [32.4, -11], [36, -12.6], [39.6, -11.4]]
  ];
  const FS = FP.map(pts => new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(q[0], 0, q[1])), false, 'catmullrom', 0.5).getPoints(160));

  const PW = 1024, PH = 1280;
  const pathCanvas = document.createElement('canvas');
  pathCanvas.width = PW; pathCanvas.height = PH;
  const pc = pathCanvas.getContext('2d');
  pc.fillStyle = '#000'; pc.fillRect(0, 0, PW, PH);
  pc.strokeStyle = '#fff'; pc.lineCap = 'round'; pc.lineJoin = 'round'; pc.shadowColor = '#fff'; pc.shadowBlur = 2;
  FS.forEach(P => {
    for (let i = 0; i < P.length - 1; i++) {
      const w = (0.5 - 0.2 * i / (P.length - 1)) * 9.0;
      pc.lineWidth = w;
      pc.beginPath();
      pc.moveTo((P[i].x + 20) / 80 * PW, (P[i].z + 40) / 80 * PH);
      pc.lineTo((P[i + 1].x + 20) / 80 * PW, (P[i + 1].z + 40) / 80 * PH);
      pc.stroke();
    }
  });
  const pathTex = new THREE.CanvasTexture(pathCanvas);
  pathTex.flipY = false; pathTex.generateMipmaps = false; pathTex.minFilter = pathTex.magFilter = THREE.LinearFilter;
  U.uP = { value: pathTex };

  const landGroup = new THREE.Group();
  world.add(landGroup);

  const land = new THREE.Mesh(tg, new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: 'varying vec3 vW,vN;varying float vH;void main(){vN=normal;vH=position.y;vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}',
    fragmentShader: LF
  }));
  landGroup.add(land);

  // Evac path ribbon + tube (full span from beach to summit shelter)
  const curvePts = FS[0].filter((_, i) => i % 4 === 0 || i === FS[0].length - 1).map(p => new THREE.Vector3(p.x, th(p.x, p.z) + 0.35, p.z));
  const curve = new THREE.CatmullRomCurve3(curvePts, false, 'catmullrom', 0.5);
  const pm = new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0 });
  const tubeMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.12, 8), pm);
  landGroup.add(tubeMesh);

  function ribbon(w, y, col, po) {
    const pts = curve.getPoints(160), pos = [], idx = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
      const p = pts[i];
      pos.push(p.x + nx * w, th(p.x + nx * w, p.z + nz * w) + y, p.z + nz * w, p.x - nx * w, th(p.x - nx * w, p.z - nz * w) + y, p.z - nz * w);
      if (i < pts.length - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: 2, polygonOffset: true, polygonOffsetFactor: po, polygonOffsetUnits: po }));
  }
  const trail = ribbon(0.65, 0.12, 0x00d2ff, -2), trail2 = ribbon(0.2, 0.16, 0xe9dcb4, -4);
  landGroup.add(trail, trail2);

  const dots = [];
  for (let i = 0; i < 11; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false }));
    d.renderOrder = 6; landGroup.add(d); dots.push(d);
  }
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0, depthTest: false }));
  beacon.renderOrder = 6; beacon.position.copy(curve.getPoint(1)); landGroup.add(beacon);

  // ---- 1. Low-poly Conical Pines (Compact, proportioned classic pine trees) ----
  // Base height ~2.1m with wide conical silhouette (not tall skinny needles)
  const f1 = new THREE.ConeGeometry(1.20, 0.75, 7); f1.translate(0, 0.55, 0);
  const f2 = new THREE.ConeGeometry(0.92, 0.65, 7); f2.translate(0, 1.05, 0);
  const f3 = new THREE.ConeGeometry(0.64, 0.55, 7); f3.translate(0, 1.50, 0);
  const f4 = new THREE.ConeGeometry(0.32, 0.45, 6); f4.translate(0, 1.88, 0);
  const foliageGeo = BufferGeometryUtils.mergeGeometries([f1, f2, f3, f4]);

  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.6, 6);
  trunkGeo.translate(0, 0.3, 0);

  // FlatShading gives that premium faceted low-poly look
  const foliageMat = new THREE.MeshStandardMaterial({ roughness: 0.88, metalness: 0.02, flatShading: true });
  const trunkMat   = new THREE.MeshStandardMaterial({ color: 0x1f1610, roughness: 0.95, metalness: 0.0, flatShading: true });

  const MAX_TREES = 2400;
  const foliageMesh = new THREE.InstancedMesh(foliageGeo, foliageMat, MAX_TREES);
  const trunkMesh   = new THREE.InstancedMesh(trunkGeo,   trunkMat,   MAX_TREES);
  foliageMesh.castShadow = false;

  const dummy = new THREE.Object3D();
  let treeCount = 0;

  // Realistic deep evergreen, mountain fir, cedar, and spruce forest palette
  const pineColors = [
    new THREE.Color(0x182f1b), // deep subalpine fir
    new THREE.Color(0x1d3820), // montane spruce
    new THREE.Color(0x152917), // dense shadowed conifer
    new THREE.Color(0x233e24), // highland pine
    new THREE.Color(0x192e1b), // dark hemlock
    new THREE.Color(0x274528), // weathered cedar
    new THREE.Color(0x132415), // deep crevice pine
    new THREE.Color(0x1f3621), // coastal redwood
  ];

  // Village centers distributed along the wider coastal bay
  const villageCenters = [
    { x: 10.5, z: 7.0, r: 2.8 },
    { x: 12.0, z: 12.5, r: 2.5 },
    { x: 9.8, z: 2.5, r: 2.6 },
    { x: 10.4, z: -3.5, r: 2.8 },
    { x: 11.6, z: -9.0, r: 2.8 },
    { x: 12.5, z: -15.5, r: 2.6 },
    { x: 11.2, z: 18.0, r: 2.5 }
  ];

  // Complete coverage from coastal foothills up to the high mountain peaks (x: 9.5 to 55.0, z: -36 to 36)
  const coastalTrees = [];
  for (let gx = 9.5; gx <= 55.0 && treeCount < MAX_TREES; gx += 1.25) {
    for (let gz = -36.0; gz <= 36.0 && treeCount < MAX_TREES; gz += 1.25) {
      const rx = gx + (Math.random() - 0.5) * 0.85;
      const rz = gz + (Math.random() - 0.5) * 0.85;
      const coast = getCoastX(rz);
      const dist = rx - coast;

      // Keep beach sand clean (trees start at the foot of coastal hills)
      if (dist < 3.8) continue;
      const ry = th(rx, rz);
      if (ry < 1.0) continue;

      // Don't place tree directly on summit shelter pavilion
      if (Math.hypot(rx - 41.6, rz - (-8.6)) < 3.2) continue;

      // Don't place tree inside village clearings
      let nearVillage = false;
      for (let v = 0; v < villageCenters.length; v++) {
        if (Math.hypot(rx - villageCenters[v].x, rz - villageCenters[v].z) < villageCenters[v].r) {
          nearVillage = true; break;
        }
      }
      if (nearVillage) continue;

      // Don't block evacuation trails
      let minDist = 999;
      for (let k = 0; k < FS[0].length; k += 2) {
        const d = Math.hypot(rx - FS[0][k].x, rz - FS[0][k].z);
        if (d < minDist) minDist = d;
      }
      for (let k = 0; k < FS[1].length; k += 2) {
        const d = Math.hypot(rx - FS[1][k].x, rz - FS[1][k].z);
        if (d < minDist) minDist = d;
      }
      if (minDist < 1.3) continue;

      // Allow trees on steep mountain ridges (up to slope 4.5)
      const slope = Math.hypot(th(rx + 0.4, rz) - th(rx - 0.4, rz), th(rx, rz + 0.4) - th(rx, rz - 0.4));
      if (slope > 4.5) continue;

      // Low-poly pine scaling (height ~1.6 to 2.6m, compact conical silhouette)
      const s = 0.75 + Math.random() * 0.55;
      const hRatio = 0.88 + Math.random() * 0.25;
      dummy.position.set(rx, ry - 0.08, rz);
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
      dummy.rotation.x = (Math.random() - 0.5) * 0.06;
      dummy.rotation.z = (Math.random() - 0.5) * 0.06;
      dummy.scale.set(s, s * hRatio, s);
      dummy.updateMatrix();

      // Track coastal trees in the tsunami flood zone for hydraulic bending physics
      if (rx < 21.0 && ry < 5.4) {
        coastalTrees.push({
          idx: treeCount,
          rx, ry, rz,
          s, hRatio,
          rotX: dummy.rotation.x,
          rotY: dummy.rotation.y,
          rotZ: dummy.rotation.z,
          currentBend: 0
        });
      }

      foliageMesh.setMatrixAt(treeCount, dummy.matrix);
      trunkMesh.setMatrixAt(treeCount, dummy.matrix);
      foliageMesh.setColorAt(treeCount, pineColors[Math.floor(Math.random() * pineColors.length)]);
      treeCount++;
    }
  }

  foliageMesh.count = treeCount;
  trunkMesh.count  = treeCount;
  foliageMesh.instanceMatrix.needsUpdate = true;
  trunkMesh.instanceMatrix.needsUpdate   = true;
  if (foliageMesh.instanceColor) foliageMesh.instanceColor.needsUpdate = true;
  landGroup.add(foliageMesh, trunkMesh);

  // ---- 2. Traditional Coastal Stilt Huts (Rumah Panggung Nelayan Tradisional) ----
  // Elevated timber post stilts, wooden floor, woven walls, and sloping thatch roof
  const stiltLeg1 = new THREE.CylinderGeometry(0.045, 0.045, 0.65, 6); stiltLeg1.translate(-0.55, 0.325, -0.45);
  const stiltLeg2 = new THREE.CylinderGeometry(0.045, 0.045, 0.65, 6); stiltLeg2.translate(0.55, 0.325, -0.45);
  const stiltLeg3 = new THREE.CylinderGeometry(0.045, 0.045, 0.65, 6); stiltLeg3.translate(-0.55, 0.325, 0.45);
  const stiltLeg4 = new THREE.CylinderGeometry(0.045, 0.045, 0.65, 6); stiltLeg4.translate(0.55, 0.325, 0.45);
  const floorPlatform = new THREE.BoxGeometry(1.35, 0.08, 1.15); floorPlatform.translate(0, 0.69, 0);
  const hutBody = new THREE.BoxGeometry(1.15, 0.72, 0.95); hutBody.translate(0, 1.09, 0);
  const roofHut = new THREE.ConeGeometry(1.05, 0.62, 4); roofHut.rotateY(Math.PI / 4); roofHut.translate(0, 1.76, 0);
  const verandaLadder = new THREE.BoxGeometry(0.35, 0.05, 0.35); verandaLadder.translate(0, 0.67, 0.65);

  const hutGeo = BufferGeometryUtils.mergeGeometries([
    stiltLeg1, stiltLeg2, stiltLeg3, stiltLeg4, floorPlatform, hutBody, roofHut, verandaLadder
  ]);
  const hutMat = new THREE.MeshStandardMaterial({ roughness: 0.88, metalness: 0.03, flatShading: true });
  const MAX_HUTS = 45;
  const hutMesh = new THREE.InstancedMesh(hutGeo, hutMat, MAX_HUTS);

  let hutCount = 0;
  const hutColors = [
    new THREE.Color(0x854d0e), // warm amber bamboo
    new THREE.Color(0x78350f), // deep teak wood
    new THREE.Color(0x92400e), // weathered cedar
    new THREE.Color(0x6b4423), // tropical timber
    new THREE.Color(0x713f12), // aged stilt wood
    new THREE.Color(0x5c3d2e), // dark bark rumbia
    new THREE.Color(0xa16207), // golden woven bamboo
  ];

  const coastalHuts = [];
  villageCenters.forEach(vc => {
    for (let j = 0; j < 7 && hutCount < MAX_HUTS; j++) {
      const hx = vc.x + (Math.random() - 0.5) * vc.r * 1.5;
      const hz = vc.z + (Math.random() - 0.5) * vc.r * 1.5;
      const hy = th(hx, hz);
      // Sit comfortably above regular tidal line (hy between 1.2 and 3.5m)
      if (hy < 1.2 || hy > 3.5) continue;

      let minP = 999;
      for (let k = 0; k < FS[0].length; k += 4) minP = Math.min(minP, Math.hypot(hx - FS[0][k].x, hz - FS[0][k].z));
      if (minP < 1.2) continue;

      const hs = 0.82 + Math.random() * 0.38;
      const aspectX = 0.90 + Math.random() * 0.30;
      const aspectZ = 0.90 + Math.random() * 0.30;
      const rotY = (Math.floor(Math.random() * 6) * Math.PI) / 3;
      const scaleX = hs * aspectX;
      const scaleY = hs * (0.90 + Math.random() * 0.25);
      const scaleZ = hs * aspectZ;

      dummy.position.set(hx, hy + 0.02, hz);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(scaleX, scaleY, scaleZ);
      dummy.updateMatrix();

      hutMesh.setMatrixAt(hutCount, dummy.matrix);
      hutMesh.setColorAt(hutCount, hutColors[Math.floor(Math.random() * hutColors.length)]);

      coastalHuts.push({
        idx: hutCount,
        basePos: new THREE.Vector3(hx, hy + 0.02, hz),
        baseRot: new THREE.Euler(0, rotY, 0),
        baseScale: new THREE.Vector3(scaleX, scaleY, scaleZ),
        pos: new THREE.Vector3(hx, hy + 0.02, hz),
        rot: new THREE.Euler(0, rotY, 0),
        scale: new THREE.Vector3(scaleX, scaleY, scaleZ),
        vel: new THREE.Vector3(0, 0, 0),
        angVel: new THREE.Vector3(0, 0, 0),
        tiltDirZ: (Math.random() - 0.5) * 0.8,
        isWashedAway: false,
        launched: false,
        inAir: false,
        settled: false,
        floatBob: Math.random() * Math.PI * 2,
        collapseAmount: 0.15 + Math.random() * 0.25,
        driftSpeedFactor: 0.8 + Math.random() * 0.4
      });

      hutCount++;
    }
  });

  hutMesh.count = hutCount;
  hutMesh.instanceMatrix.needsUpdate = true;
  if (hutMesh.instanceColor) hutMesh.instanceColor.needsUpdate = true;
  landGroup.add(hutMesh);

  // ---- 2a. Dynamic Hut Debris (Flying Thatch Roofs & Timber Planks from Demolished Huts) ----
  const dynamicHutDebris = [];
  const thatchMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.92, flatShading: true });
  const woodDebrisMat = new THREE.MeshStandardMaterial({ color: 0x54381e, roughness: 0.88, flatShading: true });

  const MAX_ROOF_DEBRIS = 8;
  for (let r = 0; r < MAX_ROOF_DEBRIS; r++) {
    const rGeo = new THREE.ConeGeometry(1.05, 0.62, 4);
    rGeo.rotateY(Math.PI / 4);
    const rMesh = new THREE.Mesh(rGeo, thatchMat);
    rMesh.position.set(0, -999, 0);
    landGroup.add(rMesh);
    dynamicHutDebris.push({
      type: 'roof',
      mesh: rMesh,
      pos: new THREE.Vector3(0, -999, 0),
      rot: new THREE.Euler(0, 0, 0),
      vel: new THREE.Vector3(0, 0, 0),
      angVel: new THREE.Vector3(0, 0, 0),
      active: false,
      settled: false
    });
  }

  const MAX_TIMBER_DEBRIS = 16;
  for (let t = 0; t < MAX_TIMBER_DEBRIS; t++) {
    const tGeo = new THREE.BoxGeometry(0.95, 0.08, 0.12);
    const tMesh = new THREE.Mesh(tGeo, woodDebrisMat);
    tMesh.position.set(0, -999, 0);
    landGroup.add(tMesh);
    dynamicHutDebris.push({
      type: 'timber',
      mesh: tMesh,
      pos: new THREE.Vector3(0, -999, 0),
      rot: new THREE.Euler(0, 0, 0),
      vel: new THREE.Vector3(0, 0, 0),
      angVel: new THREE.Vector3(0, 0, 0),
      active: false,
      settled: false
    });
  }

  let nextRoofIdx = 0;
  let nextTimberIdx = 0;
  function triggerHutDebris(originPos, tsuH, force = 1.0) {
    if (Math.random() < 0.65) {
      const roofPieces = dynamicHutDebris.filter(d => d.type === 'roof');
      const roof = roofPieces[nextRoofIdx % roofPieces.length];
      nextRoofIdx++;
      roof.active = true;
      roof.settled = false;
      roof.pos.copy(originPos);
      roof.pos.y += 1.2;
      roof.vel.set(
        (5.5 + tsuH * 1.6) * (0.85 + Math.random() * 0.3) * force,
        (4.2 + tsuH * 1.5) * (0.85 + Math.random() * 0.3) * force,
        (Math.random() - 0.5) * 4.5
      );
      roof.angVel.set(
        (Math.random() - 0.5) * 12.0,
        (Math.random() - 0.5) * 10.0,
        (Math.random() - 0.5) * 14.0
      );
      roof.mesh.position.copy(roof.pos);
    }
    const timberPieces = dynamicHutDebris.filter(d => d.type === 'timber');
    const count = 1 + Math.floor(Math.random() * 2);
    for (let c = 0; c < count; c++) {
      const tb = timberPieces[nextTimberIdx % timberPieces.length];
      nextTimberIdx++;
      tb.active = true;
      tb.settled = false;
      tb.pos.copy(originPos);
      tb.pos.y += 0.4 + Math.random() * 0.6;
      tb.vel.set(
        (6.0 + tsuH * 1.8) * (0.85 + Math.random() * 0.35) * force,
        (4.8 + tsuH * 1.6) * (0.85 + Math.random() * 0.35) * force,
        (Math.random() - 0.5) * 5.0
      );
      tb.angVel.set(
        (Math.random() - 0.5) * 16.0,
        (Math.random() - 0.5) * 14.0,
        (Math.random() - 0.5) * 18.0
      );
      tb.mesh.position.copy(tb.pos);
    }
  }

  // ---- 2b. Wooden Pier & Jetties (Dermaga Kayu Tradisional dengan Breakable Head) ----
  const pierGroup = new THREE.Group();
  const woodPierMat = new THREE.MeshStandardMaterial({ color: 0x54381e, roughness: 0.86, metalness: 0.04, flatShading: true });
  const woodPlankMat = new THREE.MeshStandardMaterial({ color: 0x6e4a29, roughness: 0.82, metalness: 0.03, flatShading: true });
  const woodPostMat = new THREE.MeshStandardMaterial({ color: 0x3d2514, roughness: 0.90, metalness: 0.05, flatShading: true });
  const lanternGlowMat = new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xff8800, emissiveIntensity: 0.9, roughness: 0.3 });

  // Main Pier (Dermaga Utama: from beach x: 10.4 out to sea x: 4.8, z: 2.2)
  const pierPiles = [];
  const staticPierDeckPlanks = [];
  const pierBeams = [];
  const pierBollards = [];

  const mainPierStartX = 12.2;
  const mainPierEndX = 4.8;
  const mainPierZ = 2.2;
  const pierDeckY = 1.05;

  // Longitudinal support beams under deck
  const beamLength = mainPierStartX - mainPierEndX + 0.2;
  const beamLeft = new THREE.BoxGeometry(beamLength, 0.12, 0.12);
  beamLeft.translate((mainPierStartX + mainPierEndX) * 0.5, pierDeckY - 0.08, mainPierZ - 0.55);
  const beamRight = new THREE.BoxGeometry(beamLength, 0.12, 0.12);
  beamRight.translate((mainPierStartX + mainPierEndX) * 0.5, pierDeckY - 0.08, mainPierZ + 0.55);
  pierBeams.push(beamLeft, beamRight);

  // Pilings supporting the pier
  const dynamicPilings = [];
  for (let px = mainPierEndX + 0.3; px <= mainPierStartX - 0.1; px += 1.05) {
    const bedY = th(px, mainPierZ);
    const pileHeight = Math.max(0.4, pierDeckY - bedY + 0.35);

    const pileL = new THREE.CylinderGeometry(0.09, 0.10, pileHeight, 6);
    pileL.translate(px, pierDeckY - pileHeight * 0.5 + 0.02, mainPierZ - 0.55);
    const pileR = new THREE.CylinderGeometry(0.09, 0.10, pileHeight, 6);
    pileR.translate(px, pierDeckY - pileHeight * 0.5 + 0.02, mainPierZ + 0.55);
    pierPiles.push(pileL, pileR);

    const crossT = new THREE.BoxGeometry(0.10, 0.10, 1.28);
    crossT.translate(px, pierDeckY - 0.16, mainPierZ);
    pierBeams.push(crossT);
  }

  // Deck planks: continuous solid walkway across the entire pier length so no section is ever empty or missing floor
  for (let px = mainPierEndX; px <= mainPierStartX + 0.05; px += 0.26) {
    const plank = new THREE.BoxGeometry(0.24, 0.07, 1.48);
    plank.translate(px, pierDeckY, mainPierZ + (Math.sin(px * 13.7) * 0.02));
    staticPierDeckPlanks.push(plank);
  }

  // Shore connection ramp: subtle step planks leading down onto the sandy beach
  const rampSteps = [
    { x: mainPierStartX + 0.28, y: pierDeckY - 0.12 },
    { x: mainPierStartX + 0.54, y: pierDeckY - 0.26 },
    { x: mainPierStartX + 0.80, y: pierDeckY - 0.40 }
  ];
  rampSteps.forEach(step => {
    const stepPlank = new THREE.BoxGeometry(0.24, 0.07, 1.48);
    stepPlank.translate(step.x, Math.max(th(step.x, mainPierZ) + 0.04, step.y), mainPierZ);
    staticPierDeckPlanks.push(stepPlank);
  });

  // Mooring bollards
  const bollardPositions = [
    { x: mainPierEndX + 1.8, z: mainPierZ - 0.65 },
    { x: mainPierEndX + 1.8, z: mainPierZ + 0.65 },
    { x: mainPierEndX + 3.6, z: mainPierZ + 0.65 },
  ];
  bollardPositions.forEach(bp => {
    const bGeo = new THREE.CylinderGeometry(0.075, 0.09, 0.48, 6);
    bGeo.translate(bp.x, pierDeckY + 0.24, bp.z);
    pierBollards.push(bGeo);
  });

  // Secondary Fishing Jetty (in the quiet cove at z: 9.6)
  const secStartX = 10.8, secEndX = 7.4, secZ = 9.6, secY = 0.95;
  const secBeam = new THREE.BoxGeometry(secStartX - secEndX + 0.2, 0.10, 0.10);
  secBeam.translate((secStartX + secEndX) * 0.5, secY - 0.07, secZ);
  pierBeams.push(secBeam);

  for (let px = secEndX + 0.2; px <= secStartX - 0.1; px += 0.9) {
    const bY = th(px, secZ);
    const pH = secY - bY + 0.35;
    const pMesh = new THREE.CylinderGeometry(0.08, 0.09, pH, 6);
    pMesh.translate(px, secY - pH * 0.5, secZ);
    pierPiles.push(pMesh);
  }
  for (let px = secEndX; px <= secStartX; px += 0.28) {
    const plank = new THREE.BoxGeometry(0.24, 0.06, 1.15);
    plank.translate(px, secY, secZ);
    staticPierDeckPlanks.push(plank);
  }

  const mergedPierPiles = BufferGeometryUtils.mergeGeometries(pierPiles);
  const mergedPierPlanks = BufferGeometryUtils.mergeGeometries(staticPierDeckPlanks);
  const mergedPierBeams = BufferGeometryUtils.mergeGeometries(pierBeams);
  const mergedBollards = BufferGeometryUtils.mergeGeometries(pierBollards);

  if (mergedPierPiles) pierGroup.add(new THREE.Mesh(mergedPierPiles, woodPostMat));
  if (mergedPierPlanks) pierGroup.add(new THREE.Mesh(mergedPierPlanks, woodPlankMat));
  if (mergedPierBeams) pierGroup.add(new THREE.Mesh(mergedPierBeams, woodPierMat));
  if (mergedBollards) pierGroup.add(new THREE.Mesh(mergedBollards, woodPostMat));

  // Pier Lantern on wooden pole (Dynamic: can be knocked loose and fly!)
  const lanternGroup = new THREE.Group();
  const lanternPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.3, 6), woodPostMat);
  lanternPole.position.y = 0.65;
  const lanternLamp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.18), lanternGlowMat);
  lanternLamp.position.y = 1.25;
  lanternGroup.add(lanternPole, lanternLamp);
  const lanternStartX = mainPierEndX + 0.4;
  const lanternStartZ = mainPierZ + 0.62;
  lanternGroup.position.set(lanternStartX, pierDeckY, lanternStartZ);
  landGroup.add(lanternGroup);

  landGroup.add(pierGroup);

  // ---- 2c. Procedural Indonesian Fishing Boats (Jukung & Sampan) ----
  function createJukungMesh(stripeHex = 0x0284c7) {
    const boat = new THREE.Group();
    const woodHullMat = new THREE.MeshStandardMaterial({ color: 0x3e2415, roughness: 0.85, metalness: 0.05, flatShading: true });
    const stripeMat = new THREE.MeshStandardMaterial({ color: stripeHex, roughness: 0.70, metalness: 0.1, flatShading: true });
    const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.75, flatShading: true });
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.80, metalness: 0.02, flatShading: true });

    const hullMid = new THREE.BoxGeometry(1.6, 0.38, 0.44);
    hullMid.translate(0, 0.19, 0);

    const bow = new THREE.ConeGeometry(0.24, 0.75, 4);
    bow.rotateZ(-Math.PI / 2 + 0.38);
    bow.translate(1.08, 0.30, 0);

    const stern = new THREE.ConeGeometry(0.22, 0.65, 4);
    stern.rotateZ(Math.PI / 2 - 0.32);
    stern.translate(-1.02, 0.27, 0);

    const hullGeo = BufferGeometryUtils.mergeGeometries([hullMid, bow, stern]);
    const hullMesh = new THREE.Mesh(hullGeo, woodHullMat);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.46), stripeMat);
    stripe.position.set(0, 0.35, 0);

    const gunwaleTrim = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.05, 0.48), whiteTrimMat);
    gunwaleTrim.position.set(0, 0.40, 0);

    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.40), woodHullMat);
    bench1.position.set(0.4, 0.30, 0);
    const bench2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.40), woodHullMat);
    bench2.position.set(-0.4, 0.30, 0);

    const cadikFore = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.85, 6), bambooMat);
    cadikFore.rotation.x = Math.PI / 2;
    cadikFore.position.set(0.45, 0.42, 0);

    const cadikAft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.85, 6), bambooMat);
    cadikAft.rotation.x = Math.PI / 2;
    cadikAft.position.set(-0.45, 0.42, 0);

    const floatPort = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.3, 8), bambooMat);
    floatPort.rotation.z = Math.PI / 2;
    floatPort.position.set(0, 0.24, -0.92);

    const floatStbd = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.3, 8), bambooMat);
    floatStbd.rotation.z = Math.PI / 2;
    floatStbd.position.set(0, 0.24, 0.92);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.5, 6), bambooMat);
    mast.rotation.z = -0.15;
    mast.position.set(0.2, 0.95, 0);

    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    flag.position.set(0.38, 1.62, 0);

    boat.add(hullMesh, stripe, gunwaleTrim, bench1, bench2, cadikFore, cadikAft, floatPort, floatStbd, mast, flag);
    return boat;
  }

  function createSampanMesh(colorHex = 0xd97706) {
    const boat = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.88, flatShading: true });
    const trimMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.75, flatShading: true });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.65), woodMat);
    hull.position.y = 0.18;
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.65, 4), woodMat);
    bow.rotation.z = -Math.PI / 2 + 0.35;
    bow.position.set(1.08, 0.26, 0);
    const stern = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.55, 4), woodMat);
    stern.rotation.z = Math.PI / 2 - 0.30;
    stern.position.set(-1.02, 0.24, 0);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.07, 0.68), trimMat);
    stripe.position.y = 0.33;

    const thwart = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.58), woodMat);
    thwart.position.set(0, 0.26, 0);

    const oarShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), trimMat);
    oarShaft.rotation.z = 0.45;
    oarShaft.rotation.x = 0.25;
    oarShaft.position.set(-0.15, 0.35, 0.32);

    boat.add(hull, bow, stern, stripe, thwart, oarShaft);
    return boat;
  }

  // ---- 2d. Dynamic Coastal Objects: Boats, Breakable Pier Planks, Lantern, Crates ----
  const dynamicBoats = [];
  const boatDefs = [
    { type: 'jukung', color: 0x0284c7, x: 6.2, z: 3.4, rotY: -0.05, isWater: true },
    { type: 'jukung', color: 0xef4444, x: 5.2, z: 1.1, rotY: 0.28, isWater: true },
    { type: 'jukung', color: 0xf59e0b, x: 8.2, z: 4.6, rotY: 0.55, isWater: false },
    { type: 'sampan', color: 0x10b981, x: 9.2, z: -1.6, rotY: -0.35, isWater: false },
    { type: 'jukung', color: 0x8b5cf6, x: 7.6, z: 8.8, rotY: 0.22, isWater: true },
    { type: 'sampan', color: 0xd97706, x: 9.8, z: -6.2, rotY: 0.48, isWater: false },
    { type: 'crate', color: 0x854d0e, x: 5.6, z: 2.2, rotY: 0.15, isWater: false, isPier: true },
    { type: 'barrel', color: 0x6b4423, x: 5.4, z: 1.8, rotY: 0.0, isWater: false, isPier: true },
    { type: 'barrel', color: 0x54381e, x: 6.8, z: 2.5, rotY: 0.4, isWater: false, isPier: true }
  ];

  boatDefs.forEach((def, idx) => {
    let mesh;
    if (def.type === 'jukung') {
      mesh = createJukungMesh(def.color);
    } else if (def.type === 'sampan') {
      mesh = createSampanMesh(def.color);
    } else if (def.type === 'crate') {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.36, 0.36),
        new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.85, metalness: 0.04, flatShading: true })
      );
    } else if (def.type === 'barrel') {
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.42, 8),
        new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.82, metalness: 0.08, flatShading: true })
      );
    }

    const groundY = th(def.x, def.z);
    let startY = def.isPier ? pierDeckY + 0.22 : (def.isWater ? 0.05 : groundY + 0.08);

    mesh.position.set(def.x, startY, def.z);
    mesh.rotation.y = def.rotY;
    landGroup.add(mesh);

    dynamicBoats.push({
      idx,
      type: def.type,
      mesh,
      basePos: new THREE.Vector3(def.x, startY, def.z),
      baseRot: new THREE.Euler(0, def.rotY, 0),
      pos: new THREE.Vector3(def.x, startY, def.z),
      rot: new THREE.Euler(0, def.rotY, 0),
      vel: new THREE.Vector3(0, 0, 0),
      angVel: new THREE.Vector3(0, 0, 0),
      isWater: def.isWater,
      isPier: def.isPier,
      launched: false,
      inAir: false,
      settled: false
    });
  });


  // Register dynamic pier lantern
  dynamicBoats.push({
    idx: dynamicBoats.length,
    type: 'lantern',
    mesh: lanternGroup,
    basePos: new THREE.Vector3(lanternStartX, pierDeckY, lanternStartZ),
    baseRot: new THREE.Euler(0, 0, 0),
    pos: new THREE.Vector3(lanternStartX, pierDeckY, lanternStartZ),
    rot: new THREE.Euler(0, 0, 0),
    vel: new THREE.Vector3(0, 0, 0),
    angVel: new THREE.Vector3(0, 0, 0),
    isWater: false,
    isPier: true,
    launched: false,
    inAir: false,
    settled: false
  });

  // ---- 2e. High-Energy Water Impact & Breaking Foam Spray Particle System ----
  const MAX_BREAKING_SPLASH = 600;
  const bSplashPos = new Float32Array(MAX_BREAKING_SPLASH * 3);
  const bSplashVel = new Float32Array(MAX_BREAKING_SPLASH * 3);
  const bSplashLife = new Float32Array(MAX_BREAKING_SPLASH);
  const bSplashMaxLife = new Float32Array(MAX_BREAKING_SPLASH);
  const bSplashScale = new Float32Array(MAX_BREAKING_SPLASH);
  const bSplashAlpha = new Float32Array(MAX_BREAKING_SPLASH);

  for (let i = 0; i < MAX_BREAKING_SPLASH; i++) {
    bSplashPos[i * 3 + 1] = -999;
    bSplashLife[i] = 999;
  }

  const bSplashGeo = new THREE.BufferGeometry();
  bSplashGeo.setAttribute('position', new THREE.BufferAttribute(bSplashPos, 3));
  bSplashGeo.setAttribute('aScale', new THREE.BufferAttribute(bSplashScale, 1));
  bSplashGeo.setAttribute('aAlpha', new THREE.BufferAttribute(bSplashAlpha, 1));

  const bSplashMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      attribute float aScale;
      attribute float aAlpha;
      varying float vAlpha;
      void main() {
        vAlpha = aAlpha;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aScale * (240.0 / -mvPos.z), 2.5, 42.0);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        if (vAlpha < 0.02) discard;
        vec2 q = gl_PointCoord - vec2(0.5);
        float d2 = dot(q, q);
        if (d2 > 0.25) discard;
        float core = 1.0 - smoothstep(0.0, 0.5, sqrt(d2));
        gl_FragColor = vec4(0.97, 0.99, 1.0, vAlpha * core);
      }
    `
  });

  const breakingSplashMesh = new THREE.Points(bSplashGeo, bSplashMat);
  breakingSplashMesh.renderOrder = 3;
  landGroup.add(breakingSplashMesh);

  let nextSplashIdx = 0;
  function triggerImpactSpray(originX, originY, originZ, count = 25, forceUp = 1.0, forceFwd = 1.0, spreadZ = 2.5) {
    for (let c = 0; c < count; c++) {
      const idx = nextSplashIdx;
      nextSplashIdx = (nextSplashIdx + 1) % MAX_BREAKING_SPLASH;

      bSplashPos[idx * 3 + 0] = originX + (Math.random() - 0.5) * 0.45;
      bSplashPos[idx * 3 + 1] = originY + Math.random() * 0.35;
      bSplashPos[idx * 3 + 2] = originZ + (Math.random() - 0.5) * 0.55;

      bSplashVel[idx * 3 + 0] = (2.8 + Math.random() * 5.2) * forceFwd;
      bSplashVel[idx * 3 + 1] = (3.5 + Math.random() * 6.5) * forceUp;
      bSplashVel[idx * 3 + 2] = (Math.random() - 0.5) * spreadZ * 2.2;

      bSplashLife[idx] = 0;
      bSplashMaxLife[idx] = 0.45 + Math.random() * 0.65;
      bSplashScale[idx] = 1.2 + Math.random() * 1.8;
      bSplashAlpha[idx] = 0.95;
    }
  }

  // ---- Realistic Gravity & Wave Physics Engine for Coastal Objects, Pier, Trees & Water Impact ----
  function updateCoastalPhysics(dt, t, tsu, front, tsuH, amp) {
    // 1. UPDATE BREAKING WATER SPLASH PARTICLES
    for (let i = 0; i < MAX_BREAKING_SPLASH; i++) {
      if (bSplashLife[i] < bSplashMaxLife[i]) {
        bSplashLife[i] += dt;
        const progress = bSplashLife[i] / bSplashMaxLife[i];

        // Earth gravity on water droplets: 16.5 m/s²
        bSplashVel[i * 3 + 1] -= 16.5 * dt;
        bSplashVel[i * 3 + 0] *= Math.pow(0.95, dt * 60);
        bSplashVel[i * 3 + 2] *= Math.pow(0.95, dt * 60);

        bSplashPos[i * 3 + 0] += bSplashVel[i * 3 + 0] * dt;
        bSplashPos[i * 3 + 1] += bSplashVel[i * 3 + 1] * dt;
        bSplashPos[i * 3 + 2] += bSplashVel[i * 3 + 2] * dt;

        const terH = th(bSplashPos[i * 3 + 0], bSplashPos[i * 3 + 2]);
        if (bSplashPos[i * 3 + 1] < terH + 0.05) {
          bSplashPos[i * 3 + 1] = terH + 0.05;
          bSplashVel[i * 3 + 1] = 0;
          bSplashVel[i * 3 + 0] *= 0.6;
        }

        bSplashAlpha[i] = (1.0 - progress) * (progress < 0.12 ? progress / 0.12 : 1.0) * 0.95;
        bSplashScale[i] = 1.2 + progress * 2.4;
      } else {
        bSplashPos[i * 3 + 1] = -999;
        bSplashAlpha[i] = 0;
      }
    }
    bSplashGeo.attributes.position.needsUpdate = true;
    bSplashGeo.attributes.aScale.needsUpdate = true;
    bSplashGeo.attributes.aAlpha.needsUpdate = true;

    // 2. CONTINUOUS WAVE IMPACT CRASHES AGAINST PIER & ROCKS
    if (tsu > 0.05) {
      // Pier impact spray (front passing pier x: 4.8 to 8.0)
      if (front > 4.6 && front < 8.2) {
        triggerImpactSpray(front, pierDeckY + 0.15, mainPierZ + (Math.random() - 0.5) * 1.2, 14, 1.4, 1.3, 2.6);
      }
      // Boulders collision spray
      beachRockPoints.forEach(bp => {
        if (Math.abs(bp.x - front) < 1.4) {
          triggerImpactSpray(bp.x, th(bp.x, bp.z) + 0.6, bp.z, 8, 1.5, 0.9, 1.8);
        }
      });
    }

    // 3. TREE BENDING & HYDRAULIC IMPACT
    for (let i = 0; i < coastalTrees.length; i++) {
      const tr = coastalTrees[i];
      if (tsu < 0.05) {
        if (tr.currentBend !== 0) {
          tr.currentBend += (0 - tr.currentBend) * Math.min(1.0, dt * 5.0);
          dummy.position.set(tr.rx, tr.ry - 0.08, tr.rz);
          dummy.rotation.set(tr.rotX, tr.rotY, tr.rotZ - tr.currentBend);
          dummy.scale.set(tr.s, tr.s * tr.hRatio, tr.s);
          dummy.updateMatrix();
          foliageMesh.setMatrixAt(tr.idx, dummy.matrix);
          trunkMesh.setMatrixAt(tr.idx, dummy.matrix);
        }
        continue;
      }

      const hTree = (Math.sin((tr.rx * 0.9 + tr.rz * 0.4) * 0.55 + t * 1.1) * 0.5 +
                     Math.sin((-tr.rx * 0.3 + tr.rz) * 0.8 + t * 1.4) * 0.32) * amp;
      const dTree = (tr.rx - front) / 3.6;
      const waterY = hTree + tsu * tsuH * Math.exp(-dTree * dTree);

      if (waterY > tr.ry) {
        const depth = Math.max(0, waterY - tr.ry);
        // Heavy hydraulic flow drag: bend inland along water current
        const targetBend = Math.min(1.35, depth * 0.48 * (tsuH * 0.35 + 0.7));
        const flutter = Math.sin(t * 11.0 + tr.rx * 2.0) * 0.10 * Math.min(1.0, depth);

        tr.currentBend += (targetBend + flutter - tr.currentBend) * Math.min(1.0, dt * 8.0);

        // Water crashing against tree trunks
        if (depth > 0.4 && Math.random() < 0.12) {
          triggerImpactSpray(tr.rx, tr.ry + 0.3, tr.rz, 8, 0.9, 0.7, 1.2);
        }
      } else {
        tr.currentBend += (0 - tr.currentBend) * Math.min(1.0, dt * 4.0);
      }

      dummy.position.set(tr.rx, tr.ry - 0.08, tr.rz);
      dummy.rotation.set(tr.rotX, tr.rotY, tr.rotZ - tr.currentBend);
      dummy.scale.set(tr.s, tr.s * tr.hRatio, tr.s);
      dummy.updateMatrix();
      foliageMesh.setMatrixAt(tr.idx, dummy.matrix);
      trunkMesh.setMatrixAt(tr.idx, dummy.matrix);
    }
    foliageMesh.instanceMatrix.needsUpdate = true;
    trunkMesh.instanceMatrix.needsUpdate = true;

    const isWaveResetting = front < -20;

    // 3b. COASTAL HOUSES IMPACT (RUMAH PANGGUNG REALISTIC TSUNAMI IMPACT & FLOTSAM PHYSICS)
    for (let i = 0; i < coastalHuts.length; i++) {
      const h = coastalHuts[i];

      // WAVE CYCLE RESET: Smoothly restore foundation when wave recedes
      if (isWaveResetting) {
        h.isWashedAway = false;
        h.launched = false;
        h.inAir = false;
        h.settled = false;
        h.vel.set(0, 0, 0);
        h.angVel.set(0, 0, 0);

        h.pos.lerp(h.basePos, Math.min(1.0, dt * 5.0));
        h.rot.x = lerp(h.rot.x, h.baseRot.x, Math.min(1.0, dt * 5.0));
        h.rot.y = lerp(h.rot.y, h.baseRot.y, Math.min(1.0, dt * 5.0));
        h.rot.z = lerp(h.rot.z, h.baseRot.z, Math.min(1.0, dt * 5.0));
        h.scale.lerp(h.baseScale, Math.min(1.0, dt * 5.0));

        dummy.position.copy(h.pos);
        dummy.rotation.copy(h.rot);
        dummy.scale.copy(h.scale);
        dummy.updateMatrix();
        hutMesh.setMatrixAt(h.idx, dummy.matrix);
        continue;
      }

      // CALM MODE (Scene 1 or tsu < 0.05): Stand firmly on ground
      if (tsu < 0.05) {
        h.isWashedAway = false;
        h.launched = false;
        h.inAir = false;
        h.settled = false;
        h.vel.set(0, 0, 0);
        h.angVel.set(0, 0, 0);

        h.pos.lerp(h.basePos, Math.min(1.0, dt * 4.0));
        h.rot.x = lerp(h.rot.x, h.baseRot.x, Math.min(1.0, dt * 4.0));
        h.rot.y = lerp(h.rot.y, h.baseRot.y, Math.min(1.0, dt * 4.0));
        h.rot.z = lerp(h.rot.z, h.baseRot.z, Math.min(1.0, dt * 4.0));
        h.scale.lerp(h.baseScale, Math.min(1.0, dt * 4.0));

        dummy.position.copy(h.pos);
        dummy.rotation.copy(h.rot);
        dummy.scale.copy(h.scale);
        dummy.updateMatrix();
        hutMesh.setMatrixAt(h.idx, dummy.matrix);
        continue;
      }

      // TSUNAMI ACTIVE MODE:
      const terY = th(h.pos.x, h.pos.z);
      const hWave = (Math.sin((h.pos.x * 0.9 + h.pos.z * 0.4) * 0.55 + t * 1.1) * 0.5 +
                     Math.sin((-h.pos.x * 0.3 + h.pos.z) * 0.8 + t * 1.4) * 0.32 +
                     Math.sin((h.pos.x * 0.7 - h.pos.z * 0.7) * 1.5 + t * 1.9) * 0.16) * amp;
      const dHut = (h.pos.x - front) / 3.6;
      let waveCrest = tsu * tsuH * Math.exp(-dHut * dHut);
      // Trailing surge: water remains high behind wave crest
      if (dHut < 0 && dHut > -3.2) {
        waveCrest = Math.max(waveCrest, tsu * tsuH * (1.0 - Math.abs(dHut) / 3.2) * 0.45);
      }
      const waterY = hWave + waveCrest;
      const distFromFront = h.pos.x - front;
      const waterDepth = Math.max(0, waterY - terY);

      // 1. PRE-IMPACT: Stilt vibration, ground tremor & water splashing
      if (!h.launched) {
        if (distFromFront > 0 && distFromFront < 4.5 && waterDepth > 0.1) {
          const shake = Math.sin(t * 32.0 + h.floatBob) * 0.035 * Math.min(1.0, waterDepth);
          h.rot.z = h.baseRot.z + shake - Math.min(0.24, waterDepth * 0.12);
          h.rot.x = h.baseRot.x + Math.cos(t * 28.0 + h.floatBob) * 0.025;

          if (Math.random() < 0.12) {
            triggerImpactSpray(h.pos.x, terY + 0.3, h.pos.z, 10, 1.1, 0.9, 1.8);
          }
        } else {
          h.rot.z = lerp(h.rot.z, h.baseRot.z, Math.min(1.0, dt * 4.0));
          h.rot.x = lerp(h.rot.x, h.baseRot.x, Math.min(1.0, dt * 4.0));
        }

        // 2. IMPACT TRIGGER: Tsunami crest strikes the house with violent kinetic force
        const crestHit = (distFromFront > -2.2 && distFromFront < 1.6 && waterDepth > 0.65);
        const submerged = (waterY > h.basePos.y + 0.45);
        if (crestHit || submerged) {
          h.launched = true;
          h.isWashedAway = true;
          h.inAir = true;
          h.settled = false;

          // Massive breaking water spray explosion when stilts snap
          triggerImpactSpray(h.pos.x, h.pos.y + 0.6, h.pos.z, 36, 1.8, 1.5, 3.2);
          triggerImpactSpray(h.pos.x + 0.5, terY + 0.3, h.pos.z, 18, 1.3, 1.0, 2.0);

          // Erupt flying thatch roofs & timber beams
          triggerHutDebris(h.pos, tsuH, h.driftSpeedFactor);

          // Hydrodynamic impulse: propel house inland (+X) and up into air
          const pwr = h.driftSpeedFactor * (0.85 + Math.min(2.2, tsuH * 0.45));
          h.vel.x = (5.2 + tsuH * 1.5) * pwr;
          h.vel.y = (3.6 + tsuH * 1.3) * pwr;
          h.vel.z = (Math.sin(h.idx * 2.7) * 3.2);
          h.angVel.set(
            (Math.sin(h.idx * 1.9) * 5.0),
            (Math.cos(h.idx * 2.3) * 3.8),
            -3.5 - Math.random() * 3.5 // violent backward tumble
          );
        }
      }

      // 3. FLIGHT, GRAVITY, BUOYANCY & LANDING SIMULATION
      if (h.launched) {
        const surfY = Math.max(waterY, terY);

        // IN-AIR PHASE (Above water and ground)
        if (h.inAir || h.pos.y > surfY + 0.08) {
          // Earth gravity on heavy timber structure
          h.vel.y -= 14.5 * dt;
          h.vel.x *= Math.pow(0.965, dt * 60);
          h.vel.z *= Math.pow(0.965, dt * 60);

          h.pos.x += h.vel.x * dt;
          h.pos.y += h.vel.y * dt;
          h.pos.z += h.vel.z * dt;

          h.rot.x += h.angVel.x * dt;
          h.rot.y += h.angVel.y * dt;
          h.rot.z += h.angVel.z * dt;

          h.angVel.multiplyScalar(Math.pow(0.94, dt * 60));
        }

        // SURFACE INTERACTION (Water or Ground)
        if (h.pos.y <= surfY + 0.08) {
          // Water/ground crash splash
          if (h.inAir && Math.abs(h.vel.y) > 2.5) {
            triggerImpactSpray(h.pos.x, surfY + 0.2, h.pos.z, 22, 1.3, 0.9, 2.2);
          }

          // CASE A: FLOATING ON SURGING FLOOD WATER
          if (waterY > terY + 0.20) {
            h.pos.y = Math.max(h.pos.y, waterY - 0.22);
            h.vel.y = (waterY - h.pos.y) * 7.0 - h.vel.y * 0.45;

            // Current carries wreckage inland
            const currentSpeed = (4.2 + Math.min(3.5, tsuH * 0.7)) * h.driftSpeedFactor;
            h.vel.x += (currentSpeed - h.vel.x) * 2.6 * dt;
            h.pos.x += h.vel.x * dt;
            h.pos.z += h.vel.z * dt;

            // Wave bobbing & rocking
            h.rot.z += Math.sin(t * 4.5 + h.idx) * 0.10 * dt;
            h.rot.x += Math.cos(t * 3.8 + h.idx) * 0.08 * dt;
            h.rot.y += 0.5 * dt;

            // Continuous spray around floating house
            if (Math.random() < 0.08) {
              triggerImpactSpray(h.pos.x, h.pos.y + 0.25, h.pos.z, 8, 0.9, 0.7, 1.5);
            }

            h.inAir = false;
            h.settled = false;
          }
          // CASE B: GROUND COLLISION (Terrain contact - NEVER LEAVE HOVERING IN SKY)
          else {
            const currentGroundY = th(h.pos.x, h.pos.z);
            if (h.vel.y < -1.2) {
              h.vel.y = -h.vel.y * 0.18; // mud bounce
            } else {
              h.vel.y = 0;
              h.pos.y = currentGroundY + 0.04;
            }

            // Heavy mud & sand friction
            h.vel.x *= Math.pow(0.24, dt * 60);
            h.vel.z *= Math.pow(0.24, dt * 60);
            h.angVel.multiplyScalar(Math.pow(0.20, dt * 60));

            h.pos.x += h.vel.x * dt;
            h.pos.z += h.vel.z * dt;

            if (Math.hypot(h.vel.x, h.vel.z) < 0.25) {
              h.inAir = false;
              h.settled = true;
              h.vel.set(0, 0, 0);
              h.angVel.set(0, 0, 0);
              h.pos.y = currentGroundY + 0.04;

              // Resting wrecked collapse posture
              h.rot.z = lerp(h.rot.z, -0.42 + h.tiltDirZ * 0.3, Math.min(1.0, dt * 4.0));
              h.rot.x = lerp(h.rot.x, (h.idx % 2 === 0 ? 0.25 : -0.25), Math.min(1.0, dt * 4.0));
              h.scale.y = lerp(h.scale.y, h.baseScale.y * (1.0 - h.collapseAmount * 0.75), Math.min(1.0, dt * 4.0));
            }
          }
        }
      }

      dummy.position.copy(h.pos);
      dummy.rotation.copy(h.rot);
      dummy.scale.copy(h.scale);
      dummy.updateMatrix();
      hutMesh.setMatrixAt(h.idx, dummy.matrix);
    }
    hutMesh.instanceMatrix.needsUpdate = true;

    // 3c. DYNAMIC HUT DEBRIS PHYSICS (FLYING ROOFS & TIMBER BEAMS)
    for (let d = 0; d < dynamicHutDebris.length; d++) {
      const deb = dynamicHutDebris[d];
      if (!deb.active) {
        deb.mesh.position.set(0, -999, 0);
        continue;
      }

      if (isWaveResetting || tsu < 0.05) {
        deb.active = false;
        deb.settled = false;
        deb.mesh.position.set(0, -999, 0);
        continue;
      }

      const terY = th(deb.pos.x, deb.pos.z);
      const dX = (deb.pos.x - front) / 3.6;
      let wY = tsu * tsuH * Math.exp(-dX * dX);
      if (dX < 0 && dX > -3.2) {
        wY = Math.max(wY, tsu * tsuH * (1.0 - Math.abs(dX) / 3.2) * 0.45);
      }
      wY += amp * 0.2;
      const surfY = Math.max(wY, terY);

      if (deb.pos.y > surfY + 0.05) {
        deb.vel.y -= 15.0 * dt;
        deb.vel.x *= Math.pow(0.96, dt * 60);
        deb.vel.z *= Math.pow(0.96, dt * 60);

        deb.pos.x += deb.vel.x * dt;
        deb.pos.y += deb.vel.y * dt;
        deb.pos.z += deb.vel.z * dt;

        deb.rot.x += deb.angVel.x * dt;
        deb.rot.y += deb.angVel.y * dt;
        deb.rot.z += deb.angVel.z * dt;
        deb.angVel.multiplyScalar(Math.pow(0.94, dt * 60));
      } else {
        if (wY > terY + 0.15) {
          deb.pos.y = wY - 0.10;
          deb.vel.x += (4.8 - deb.vel.x) * 3.0 * dt;
          deb.pos.x += deb.vel.x * dt;
          deb.rot.z += Math.sin(t * 5.0 + d) * 0.12 * dt;
        } else {
          deb.pos.y = terY + 0.04;
          deb.vel.multiplyScalar(Math.pow(0.2, dt * 60));
          deb.angVel.multiplyScalar(Math.pow(0.2, dt * 60));
          deb.settled = true;
        }
      }

      deb.mesh.position.copy(deb.pos);
      deb.mesh.rotation.copy(deb.rot);
    }

    // 4. DYNAMIC BOATS, PIER PLANKS, LANTERN & CRATES PHYSICS
    if (dynamicBoats.length === 0) return;

    // Dynamic front pilings tilt
    dynamicPilings.forEach(dp => {
      if (tsu > 0.05 && front > dp.baseX - 1.2) {
        dp.tiltZ = Math.min(0.55, dp.tiltZ + dt * 2.2);
      } else {
        dp.tiltZ = Math.max(0, dp.tiltZ - dt * 2.5);
      }
      dp.meshL.rotation.z = dp.tiltZ;
      dp.meshR.rotation.z = dp.tiltZ;
    });

    for (let i = 0; i < dynamicBoats.length; i++) {
      const b = dynamicBoats[i];

      if (isWaveResetting) {
        b.launched = false;
        b.inAir = false;
        b.settled = false;
      }

      // Calm mode
      if (tsu < 0.05) {
        b.launched = false;
        b.inAir = false;
        b.settled = false;
        b.vel.set(0, 0, 0);
        b.angVel.set(0, 0, 0);

        b.pos.lerp(b.basePos, Math.min(1.0, dt * 3.0));
        b.rot.x = lerp(b.rot.x, b.baseRot.x, Math.min(1.0, dt * 3.0));
        b.rot.y = lerp(b.rot.y, b.baseRot.y, Math.min(1.0, dt * 3.0));
        b.rot.z = lerp(b.rot.z, b.baseRot.z, Math.min(1.0, dt * 3.0));

        if (b.isWater) {
          const calmH = (Math.sin((b.pos.x * 0.9 + b.pos.z * 0.4) * 0.55 + t * 1.1) * 0.5 +
                         Math.sin((-b.pos.x * 0.3 + b.pos.z) * 0.8 + t * 1.4) * 0.32) * amp;
          b.pos.y = calmH + 0.08;
          b.rot.z = b.baseRot.z + Math.sin(t * 1.6 + b.idx * 1.2) * 0.07;
          b.rot.x = b.baseRot.x + Math.cos(t * 1.3 + b.idx * 1.2) * 0.04;
        }

        b.mesh.position.copy(b.pos);
        b.mesh.rotation.copy(b.rot);
        continue;
      }

      // TSUNAMI ACTIVE MODE:
      const h = (Math.sin((b.pos.x * 0.9 + b.pos.z * 0.4) * 0.55 + t * 1.1) * 0.5 +
                 Math.sin((-b.pos.x * 0.3 + b.pos.z) * 0.8 + t * 1.4) * 0.32 +
                 Math.sin((b.pos.x * 0.7 - b.pos.z * 0.7) * 1.5 + t * 1.9) * 0.16) * amp;
      const d = (b.pos.x - front) / 3.6;
      const waterY = h + tsu * tsuH * Math.exp(-d * d);
      const terY = th(b.pos.x, b.pos.z);
      const distFromFront = b.pos.x - front;

      // IMPACT TRIGGER: Wave crest collides with object
      if (!b.launched && distFromFront > -2.4 && distFromFront < 1.8 && waterY > b.pos.y - 0.35) {
        b.launched = true;
        b.inAir = true;
        b.settled = false;

        // Massive breaking water spray explosion at point of impact!
        triggerImpactSpray(b.pos.x, b.pos.y + 0.2, b.pos.z, b.type === 'plank' ? 14 : 38, 1.5, 1.4, 3.2);

        if (b.type === 'plank') {
          // Light wooden planks fly high and spin like propellers
          b.vel.y = (6.2 + tsuH * 1.8) * (0.85 + Math.random() * 0.35);
          b.vel.x = (6.5 + tsuH * 1.5) * (0.85 + Math.random() * 0.30);
          b.vel.z = (Math.random() - 0.5) * 5.0;
          b.angVel.x = (Math.random() - 0.5) * 16.0;
          b.angVel.y = (Math.random() - 0.5) * 12.0;
          b.angVel.z = (Math.random() - 0.5) * 14.0;
        } else if (b.type === 'lantern') {
          // Lantern topples and tumbles
          b.vel.y = (5.5 + tsuH * 1.5) * 1.1;
          b.vel.x = (6.0 + tsuH * 1.4);
          b.vel.z = (Math.random() - 0.5) * 4.0;
          b.angVel.x = 9.0;
          b.angVel.z = -5.0;
        } else {
          // Heavy boats and barrels
          const power = 0.85 + (b.idx % 3) * 0.18;
          b.vel.y = (4.8 + tsuH * 1.6) * power;
          b.vel.x = (5.6 + tsuH * 1.4) * (0.88 + (b.idx % 4) * 0.12);
          b.vel.z = ((b.idx % 2 === 0 ? 1 : -1) * 2.8) + (Math.sin(b.idx * 3.7) * 2.2);
          b.angVel.x = (Math.sin(b.idx * 2.1) * 6.5);
          b.angVel.y = (Math.cos(b.idx * 1.7) * 5.0);
          b.angVel.z = (4.2 + (b.idx % 3) * 2.0) * (b.idx % 2 === 0 ? 1 : -1);
        }
      }

      // IN-FLIGHT & GRAVITY SIMULATION
      if (b.inAir || b.pos.y > Math.max(waterY, terY) + 0.1) {
        // Realistic gravity pulling down
        const grav = b.type === 'plank' ? 14.5 : 13.8;
        b.vel.y -= grav * dt;

        b.vel.x *= Math.pow(0.96, dt * 60);
        b.vel.z *= Math.pow(0.96, dt * 60);

        b.pos.x += b.vel.x * dt;
        b.pos.y += b.vel.y * dt;
        b.pos.z += b.vel.z * dt;

        b.rot.x += b.angVel.x * dt;
        b.rot.y += b.angVel.y * dt;
        b.rot.z += b.angVel.z * dt;

        b.angVel.multiplyScalar(Math.pow(0.94, dt * 60));
      }

      // COLLISION WITH WATER SURFACE OR GROUND
      const surfY = Math.max(waterY, terY);
      if (b.pos.y <= surfY + 0.08) {
        if (b.inAir && Math.abs(b.vel.y) > 3.0) {
          // Secondary impact splash when crashing into water!
          triggerImpactSpray(b.pos.x, surfY, b.pos.z, 16, 1.1, 0.7, 2.0);
        }

        if (waterY > terY) {
          b.pos.y = Math.max(b.pos.y, waterY - 0.18);
          b.vel.y = (waterY - b.pos.y) * 7.5 - b.vel.y * 0.45;
          b.vel.x += (4.2 - b.vel.x) * 2.8 * dt;
          b.rot.z += Math.sin(t * 6.0 + b.idx) * 0.06 * dt;
        } else {
          if (b.vel.y < -1.0) {
            b.vel.y = -b.vel.y * 0.22;
          } else {
            b.vel.y = 0;
            b.pos.y = terY + 0.08;
          }

          b.vel.x *= Math.pow(0.35, dt * 60);
          b.vel.z *= Math.pow(0.35, dt * 60);
          b.angVel.multiplyScalar(Math.pow(0.30, dt * 60));

          if (Math.hypot(b.vel.x, b.vel.z) < 0.2) {
            b.inAir = false;
            b.settled = true;
          }
        }
      }

      if (!b.launched && b.isWater) {
        b.pos.y = waterY + 0.06;
        b.rot.z = b.baseRot.z + Math.sin(t * 2.0 + b.idx) * 0.09;
      }

      b.mesh.position.copy(b.pos);
      b.mesh.rotation.copy(b.rot);
    }
  }

  // ---- 3. Smooth Coastal Boulders & Rocks (Natural, unobtrusive) ----
  const rockGeo = new THREE.DodecahedronGeometry(0.8, 1);
  const rPos = rockGeo.attributes.position;
  for (let i = 0; i < rPos.count; i++) {
    const bx = rPos.getX(i), by = rPos.getY(i), bz = rPos.getZ(i);
    const n = (Math.sin(bx * 6.0 + by * 4.5) * 0.5 + Math.sin(by * 8.0 + bz * 5.0) * 0.5) * 0.12;
    rPos.setXYZ(i, bx * (1 + n), by * (0.75 + n * 0.3), bz * (1 + n));
  }
  rockGeo.computeVertexNormals();
  const rockMat = new THREE.MeshStandardMaterial({ roughness: 0.90, metalness: 0.02, flatShading: true });
  const MAX_ROCKS = 60;
  const rockMesh = new THREE.InstancedMesh(rockGeo, rockMat, MAX_ROCKS);

  let rockCount = 0;
  const rockColors = [
    new THREE.Color(0x52525b),
    new THREE.Color(0x64748b),
    new THREE.Color(0x475569),
    new THREE.Color(0x3f3f46),
    new THREE.Color(0x71717a),
  ];

  // Natural coastal boulders placed along the flanks and surf (not blocking the center!)
  const beachRockPoints = [
    { x: 7.2, z: 8.5, s: 0.9 },
    { x: 7.5, z: 12.0, s: 1.1 },
    { x: 7.4, z: -8.0, s: 1.0 },
    { x: 8.0, z: -14.0, s: 1.1 },
    { x: 8.2, z: 15.0, s: 0.9 },
    { x: 9.2, z: -3.0, s: 0.8 },
  ];
  beachRockPoints.forEach(bp => {
    if (rockCount >= MAX_ROCKS) return;
    const ry = th(bp.x, bp.z);
    dummy.position.set(bp.x, ry + bp.s * 0.25, bp.z);
    dummy.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    dummy.scale.set(bp.s, bp.s * 0.75, bp.s);
    dummy.updateMatrix();
    rockMesh.setMatrixAt(rockCount, dummy.matrix);
    rockMesh.setColorAt(rockCount, rockColors[rockCount % rockColors.length]);
    rockCount++;
  });

  for (let i = 0; i < MAX_ROCKS - beachRockPoints.length; i++) {
    const rz = (Math.random() - 0.5) * 44;
    const coast = getCoastX(rz);
    const dist = 3.0 + Math.random() * 26.0;
    const rx = coast + dist;
    const ry = th(rx, rz);
    if (ry < -0.2) continue;

    const rs = 0.45 + Math.random() * 0.65;
    dummy.position.set(rx, ry + rs * 0.2, rz);
    dummy.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    dummy.scale.set(rs, rs * (0.7 + Math.random() * 0.4), rs);
    dummy.updateMatrix();

    rockMesh.setMatrixAt(rockCount, dummy.matrix);
    rockMesh.setColorAt(rockCount, rockColors[Math.floor(Math.random() * rockColors.length)]);
    rockCount++;
  }

  rockMesh.count = rockCount;
  rockMesh.instanceMatrix.needsUpdate = true;
  if (rockMesh.instanceColor) rockMesh.instanceColor.needsUpdate = true;
  landGroup.add(rockMesh);

  // ---- 4. Summit Shelter Pavilion ----
  const shelterGroup = new THREE.Group();
  const sy = th(41.6, -8.6);
  shelterGroup.position.set(41.6, sy, -8.6);

  const basePlat = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.6, 0.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, flatShading: true })
  );
  basePlat.position.y = 0.25;

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.0, 1.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x00d2ff, emissive: 0x001a33, emissiveIntensity: 0.3, roughness: 0.5, flatShading: true })
  );
  roof.position.y = 2.4;

  for (let a = 0; a < 6; a++) {
    const ang = a * Math.PI / 3;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 })
    );
    pillar.position.set(Math.cos(ang) * 2.0, 1.15, Math.sin(ang) * 2.0);
    shelterGroup.add(pillar);
  }
  shelterGroup.add(basePlat, roof);
  landGroup.add(shelterGroup);

  // ---- 5. Crisp Shoreline Wave Splash (Lightweight, zero-lag 110 droplets) ----
  const SPLASH_COUNT = 110;
  const spPos = new Float32Array(SPLASH_COUNT * 3);
  const spOffset = new Float32Array(SPLASH_COUNT * 3);
  const spTiming = new Float32Array(SPLASH_COUNT * 3);

  for (let i = 0; i < SPLASH_COUNT; i++) {
    const tNorm = i / SPLASH_COUNT;
    const z = -18.0 + tNorm * 36.0 + (Math.random() - 0.5) * 1.2;
    const coast = getCoastX(z);
    const x = coast + (Math.random() - 0.35) * 0.9;
    const y = Math.max(0.04, th(x, z) + 0.05);

    spPos[i * 3 + 0] = x;
    spPos[i * 3 + 1] = y;
    spPos[i * 3 + 2] = z;

    spOffset[i * 3 + 0] = 0.35 + Math.random() * 0.55;
    spOffset[i * 3 + 1] = 1.80 + Math.random() * 1.60;
    spOffset[i * 3 + 2] = (Math.random() - 0.5) * 0.80;

    spTiming[i * 3 + 0] = (Math.random() - 0.5) * 0.55;
    spTiming[i * 3 + 1] = 0.32 + Math.random() * 0.06;
    spTiming[i * 3 + 2] = 3.8 + Math.random() * 3.2;
  }

  const splashGeo = new THREE.BufferGeometry();
  splashGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  splashGeo.setAttribute('aOffset', new THREE.BufferAttribute(spOffset, 3));
  splashGeo.setAttribute('aTiming', new THREE.BufferAttribute(spTiming, 3));

  const splashMat = new THREE.ShaderMaterial({
    uniforms: U,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      uniform float uT, uPx, uAmp, uTsu;
      attribute vec3 aOffset;
      attribute vec3 aTiming;
      varying float vAlpha;

      void main() {
        vec3 p = position;
        float wavePhase = dot(p.xz, vec2(0.9, 0.4)) * 0.55 + uT * 1.1 + aTiming.x;
        float cycle = fract(wavePhase / 6.2831853);

        float duration = aTiming.y;
        float isActive = step(cycle, duration);
        float t = clamp(cycle / duration, 0.0, 1.0);

        float vy = aOffset.y * (0.85 + uAmp * 0.55 + uTsu * 0.75);
        float g = 3.2;
        float dy = max(0.0, vy * t - g * t * t);

        p.x += aOffset.x * t * 0.70 * isActive;
        p.y += dy * isActive;
        p.z += aOffset.z * t * 0.70 * isActive;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Small, crisp points (2.5px to 7.5px max) — zero fillrate overdraw
        gl_PointSize = clamp(aTiming.z * (100.0 / -mvPosition.z) * uPx, 2.5, 7.5) * isActive;
        vAlpha = sin(t * 3.14159) * (0.75 + uAmp * 0.45 + uTsu * 0.70) * isActive;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        if (vAlpha < 0.03) discard;
        vec2 q = gl_PointCoord - 0.5;
        if (dot(q, q) > 0.25) discard;
        gl_FragColor = vec4(0.96, 0.98, 1.0, vAlpha * 0.92);
      }
    `
  });

  const shoreSplash = new THREE.Points(splashGeo, splashMat);
  shoreSplash.renderOrder = 2;
  landGroup.add(shoreSplash);

  // Buoy
  const buoyGroup = new THREE.Group();
  const BX = 4, BZ = 2;
  const sm = (g, c, e) => new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.4, emissive: e || 0, emissiveIntensity: 0.8 }));
  const body = sm(new THREE.SphereGeometry(1.2, 32, 24), 0x1a3a6e); body.scale.y = 0.55;
  const ring = sm(new THREE.TorusGeometry(1.22, 0.09, 12, 48), 0x00f0ff, 0x00f0ff); ring.rotation.x = Math.PI / 2;
  const mast = sm(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 10), 0xcbd5e1); mast.position.y = 1.1;
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00d2ff })); lamp.position.y = 2.1;
  const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.6, 0), new THREE.Vector3(0, -5.8, 0)]), new THREE.LineDashedMaterial({ color: 0x00d2ff, dashSize: 0.3, gapSize: 0.3 }));
  cable.computeLineDistances();
  const base = sm(new THREE.CylinderGeometry(1.2, 1.4, 0.4, 24), 0x0a224e, 0x00d2ff); base.position.y = -5.8;
  buoyGroup.add(body, ring, mast, lamp, cable, base); buoyGroup.position.set(BX, 0, BZ); world.add(buoyGroup);

  // Keyframes
  const K = [
    { cp: [-2, 3.4, 22], lk: [-1, 1.8, 0], amp: 0.45, tsu: 0, ter: 0, buoy: 1, path: 0 },
    { cp: [-6, 4.4, 19], lk: [4, 2, 0], amp: 0.85, tsu: 1, ter: 1, buoy: 0.95, path: 0 },
    { cp: [7, 12.5, 22], lk: [16, 2.4, 2], amp: 0.25, tsu: 0, ter: 1, buoy: 0, path: 1 },
  ];
  const S = { cp: new THREE.Vector3(), lk: new THREE.Vector3(), amp: 0, tsu: 0, ter: 0, buoy: 1, path: 0 };

  let pingT = 99;
  function ping() { pingT = 0; U.uPr.value = 0; U.uPa.value = 1; }

  // Scroll-based scene progress
  let pp = 0, pt = 0, cur = -1, yaw = 0, yawT = 0, drag = 0, lx = 0, crestT = 4, rk = 1;
  let mx = 0, my = 0;

  function resize() {
    const s = canvas.parentNode;
    renderer.setSize(s.clientWidth, s.clientHeight, false);
    cam.aspect = s.clientWidth / s.clientHeight;
    cam.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  return {
    U, S, K, cam, dome, stars, buoyGroup, lamp, pm, trail, trail2, dots, beacon, curve, land, tubeMesh, landGroup, shoreSplash,
    renderer, scene, world, ping, sun, amb,
    updateCoastalPhysics,
    getState: () => ({ pp, pt, cur, yaw, yawT, drag, lx, crestT, rk, mx, my }),
    setState: (update) => {
      if (update.pp !== undefined) pp = update.pp;
      if (update.pt !== undefined) pt = update.pt;
      if (update.cur !== undefined) cur = update.cur;
      if (update.yaw !== undefined) yaw = update.yaw;
      if (update.yawT !== undefined) yawT = update.yawT;
      if (update.drag !== undefined) drag = update.drag;
      if (update.lx !== undefined) lx = update.lx;
      if (update.crestT !== undefined) crestT = update.crestT;
      if (update.rk !== undefined) rk = update.rk;
      if (update.mx !== undefined) mx = update.mx;
      if (update.my !== undefined) my = update.my;
      if (update.pingT !== undefined) pingT = update.pingT;
    },
    getPingT: () => pingT,
    setPingT: (v) => { pingT = v; },
    lerp
  };
}
