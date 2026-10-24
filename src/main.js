// Catch unhandled errors gracefully in console
window.onerror = function (msg, url, line, col, error) {
  console.warn('Samudra App Warning:', msg, 'at line', line);
};

import './style.css';
import { renderNavbar } from './components/Navbar.js';
import { renderEarthquakeBanner } from './components/EarthquakeBanner.js';
import { renderArticles } from './components/Articles.js';
import { renderMitigasi } from './components/Mitigasi.js';
import { renderSimulation } from './components/Simulation.js';
import { renderArticlePage } from './components/ArticlePage.js';
import { createScene } from './scene/threeScene.js';
import * as THREE from 'three';

// ===== BUILD HTML STRUCTURE =====
const app = document.getElementById('app');

const homeView = document.createElement('div');
homeView.id = 'home-view';

const articleView = document.createElement('div');
articleView.id = 'article-view';
articleView.style.display = 'none';

app.appendChild(homeView);
app.appendChild(articleView);

// Navbar (for home page)
renderNavbar(homeView);

// Hero Stage (3D)
const stage = document.createElement('div');
stage.className = 'stage';
stage.id = 'top';
stage.innerHTML = `
  <div class="stage__sticky">
    <canvas id="gl" aria-label="Visualisasi 3D pesisir: pemantauan, hantaman gelombang, evakuasi"></canvas>
    <div class="vig"></div>

    <div class="scene scene--active" id="s0">
      <span class="scene__eyebrow">Terhubung dengan BMKG</span>
      <h1>Gempa terjadi.<br>Anda tahu lebih dulu.</h1>
      <p class="scene__lede">Aplikasi menerima informasi gempa dan potensi tsunami dari BMKG, lalu mengirim notifikasi dan rute evakuasi ke ponsel Anda.</p>
      <div class="scene__stats">
        <div><b>BMKG</b><small>Sumber informasi gempa</small></div>
        <div><b>Rute</b><small>Menuju shelter terdekat</small></div>
      </div>
      <a class="btn btn--white" href="#fitur">Jelajahi fitur &nbsp;→</a>
    </div>

    <div class="scene" id="s1">
      <span class="scene__eyebrow">Potensi tsunami</span>
      <h1>Ketika gelombang<br>menuju daratan.</h1>
      <p class="scene__lede">BMKG memberi rentang potensi tinggi tsunami. Geser magnitudo untuk melihat gambaran skenarionya.</p>
      <div class="scene__stats">
        <div><b id="gL">Siaga</b><small>Tingkat peringatan</small></div>
        <div><b id="gH">0,5–3 m</b><small>Rentang potensi tinggi</small></div>
      </div>
      <label class="scene__mag-control">Magnitudo <b id="gM">8.0</b>
        <input id="gm" type="range" min="7" max="9.2" step=".1" value="8">
      </label>
      <small style="display:block;margin-top:14px;color:#64748b;font-size:12px">Ilustrasi skenario. Penetapan resmi hanya dari BMKG.</small>
    </div>

    <div class="scene" id="s2">
      <span class="scene__eyebrow">Rute evakuasi</span>
      <h1>Jalur menuju<br>tempat aman.</h1>
      <p class="scene__lede">Rute tercepat dari Jl. Diponegoro ke Bukit Sektor B, menghindari Jembatan Muara Selatan yang masuk zona merah.</p>
      <div class="scene__stats">
        <div><b>1.4 km</b><small>11 menit berjalan</small></div>
        <div><b>3.500</b><small>Kapasitas shelter</small></div>
      </div>
      <a class="btn btn--white" href="#simulasi">Uji simulasi 3D &nbsp;→</a>
    </div>

    <div class="scene-nav" role="group" aria-label="Pilih scene">
      <button class="scene-nav__btn" data-s="0" aria-current="true">01<i class="scene-nav__line"></i></button>
      <button class="scene-nav__btn" data-s="1">02<i class="scene-nav__line"></i></button>
      <button class="scene-nav__btn" data-s="2">03<i class="scene-nav__line"></i></button>
    </div>

    <div class="hud">
      <label class="hud__slider">Waktu <input id="tod" type="range" min="0" max="1" step=".01" value=".5"></label>
      <button class="hud__btn" id="risk" aria-pressed="true">Zona risiko</button>
    </div>

    <div class="stage__label">3D / INTERAKTIF / IMERSIF</div>
  </div>
`;
homeView.appendChild(stage);

// Earthquake Banner (live from API)
renderEarthquakeBanner(homeView);

// Main content
const main = document.createElement('main');
homeView.appendChild(main);

// Section: Alur (Workflow)
const alurSection = document.createElement('section');
alurSection.id = 'alur';
alurSection.innerHTML = `
  <div class="section-header">
    <span class="section-eyebrow">Alur Kerja Tanggap Cepat</span>
    <h2 class="section-title">Dari BMKG ke langkah Anda.</h2>
    <p class="section-lead">Tiga langkah terstruktur ketika peringatan gempa dan potensi tsunami terdeteksi.</p>
  </div>
  <div class="flow-grid">
    <div class="flow-card">
      <div class="flow-card__top">
        <span class="flow-card__badge"><span class="flow-card__badge-pulse"></span>01</span>
        <div class="flow-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
            <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
            <circle cx="12" cy="12" r="2"/>
            <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
            <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
          </svg>
        </div>
      </div>
      <h3 class="flow-card__title">BMKG Merilis Informasi</h3>
      <p class="flow-card__desc">Data real-time magnitudo, episentrum, kedalaman, dan tingkat peringatan diverifikasi serta diproses dalam hitungan detik.</p>
      <div class="flow-card__footer">
        <span class="flow-card__pill"><span class="flow-card__dot"></span> Telemetri Sensor BMKG</span>
        <span class="flow-card__metric">&lt; 3 Detik</span>
      </div>
    </div>
    <div class="flow-card">
      <div class="flow-card__top">
        <span class="flow-card__badge"><span class="flow-card__badge-pulse"></span>02</span>
        <div class="flow-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
      </div>
      <h3 class="flow-card__title">Anda Mendapat Notifikasi</h3>
      <p class="flow-card__desc">Peringatan darurat langsung dikirim ke gawai warga pesisir dengan instruksi padat, lugas, dan bebas kepanikan.</p>
      <div class="flow-card__footer">
        <span class="flow-card__pill"><span class="flow-card__dot"></span> Edge Push Broadcast</span>
        <span class="flow-card__metric">Multi-Platform</span>
      </div>
    </div>
    <div class="flow-card">
      <div class="flow-card__top">
        <span class="flow-card__badge"><span class="flow-card__badge-pulse"></span>03</span>
        <div class="flow-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
      </div>
      <h3 class="flow-card__title">Anda Mengikuti Rute</h3>
      <p class="flow-card__desc">Navigasi evakuasi mandiri memandu Anda ke titik aman dan bukit terdekat, menghindari jembatan dan area genangan.</p>
      <div class="flow-card__footer">
        <span class="flow-card__pill"><span class="flow-card__dot"></span> Offline Dynamic GPS</span>
        <span class="flow-card__metric">Peta Lokal</span>
      </div>
    </div>
  </div>
`;
main.appendChild(alurSection);

// Section: Fitur (Bento Grid)
const fiturSection = document.createElement('section');
fiturSection.id = 'fitur';
fiturSection.innerHTML = `
  <div class="section-header">
    <span class="section-eyebrow">Fitur Utama Platform</span>
    <h2 class="section-title">Solusi cepat saat detik-detik kritis.</h2>
    <p class="section-lead">Aplikasi dirancang dengan arsitektur tangguh: navigasi ke tempat aman, akses kontak darurat instan, dan artikel edukasi mitigasi resmi.</p>
  </div>
  <div class="features-bento">
    <div class="feature-card">
      <div class="feature-card__top">
        <div class="feature-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
        <span class="feature-card__tag">NAVIGASI &amp; EVAKUASI</span>
      </div>
      <h3 class="feature-card__title">Navigasi ke Tempat Lebih Aman</h3>
      <p class="feature-card__desc">Panduan rute dinamis yang menuntun Anda dari lokasi rawan menuju bukit dan shelter elevasi tinggi, menghindari zona genangan dan jembatan berisiko.</p>
      <div class="feature-card__action"><span>Pelajari Sistem</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
    </div>
    <div class="feature-card">
      <div class="feature-card__top">
        <div class="feature-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <span class="feature-card__tag">RESPONS DARURAT SOS</span>
      </div>
      <h3 class="feature-card__title">Akses Kontak Darurat</h3>
      <p class="feature-card__desc">Panggilan cepat satu ketukan ke posko BPBD terdekat, Basarnas, Ambulans darurat, PMI, serta daftar nomor darurat keluarga yang telah tersimpan.</p>
      <div class="feature-card__action"><span>Pelajari Sistem</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
    </div>
    <div class="feature-card">
      <div class="feature-card__top">
        <div class="feature-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <span class="feature-card__tag">EDUKASI &amp; RISET</span>
      </div>
      <h3 class="feature-card__title">Artikel &amp; Panduan Mitigasi</h3>
      <p class="feature-card__desc">Publikasi edukasi kebencanaan resmi yang terhubung langsung dengan database backend, mencakup langkah penyelamatan dan pengenalan tanda alam.</p>
      <div class="feature-card__action"><span>Pelajari Sistem</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
    </div>
    <div class="feature-card">
      <div class="feature-card__top">
        <div class="feature-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <span class="feature-card__tag">DATA TELEMETRI BMKG</span>
      </div>
      <h3 class="feature-card__title">Peringatan Dini Real-Time</h3>
      <p class="feature-card__desc">Integrasi langsung dengan sistem diseminasi BMKG untuk memproses data magnitudo, kedalaman, dan status potensi tsunami dalam hitungan detik.</p>
      <div class="feature-card__action"><span>Pelajari Sistem</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
    </div>
    <div class="feature-card">
      <div class="feature-card__top">
        <div class="feature-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <span class="feature-card__tag">TITIK KUMPUL TERVERIFIKASI</span>
      </div>
      <h3 class="feature-card__title">Peta Titik Kumpul Aman</h3>
      <p class="feature-card__desc">Menampilkan lokasi shelter evakuasi vertikal dan area kumpul aman di perbukitan yang telah dipetakan dan diverifikasi aman dari inundasi.</p>
      <div class="feature-card__action"><span>Pelajari Sistem</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
    </div>
    <div class="feature-card">
      <div class="feature-card__top">
        <div class="feature-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
        </div>
        <span class="feature-card__tag">OFFLINE READINESS</span>
      </div>
      <h3 class="feature-card__title">Dukungan Mode Offline</h3>
      <p class="feature-card__desc">Peta jalur evakuasi dan nomor kontak darurat tetap tersimpan secara lokal dan dapat dibuka saat jaringan seluler terputus pascagempa.</p>
      <div class="feature-card__action"><span>Pelajari Sistem</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
    </div>
  </div>
`;
fiturSection.appendChild(document.createElement('div'));
main.appendChild(fiturSection);

// Section: Simulasi
renderSimulation(main);

// Section: Langkah Mitigasi (live from API)
renderMitigasi(main);

// Section: Berita & Edukasi (live from API)
renderArticles(main);

// Section: CTA
const ctaSection = document.createElement('section');
ctaSection.id = 'akses';
ctaSection.innerHTML = `
  <div class="cta-banner">
    <div class="cta-banner__content">
      <span class="section-eyebrow">Akses Cepat &amp; Gratis</span>
      <h2 class="cta-banner__title">Kesiapsiagaan dimulai dari genggaman Anda.</h2>
      <p class="cta-banner__lead">Dapat diakses langsung melalui peramban modern di web atau pasang sebagai aplikasi mandiri di ponsel Anda tanpa biaya.</p>
      <div class="cta-banner__actions">
        <a class="btn btn--primary" href="#top">Buka Web App &nbsp;→</a>
        <a class="btn btn--outline" href="#mitigasi">Langkah Mitigasi</a>
        <a class="btn btn--outline" href="#artikel">Berita &amp; Riset</a>
      </div>
    </div>
  </div>
`;
main.appendChild(ctaSection);

// Footer
const footer = document.createElement('footer');
footer.innerHTML = `
  <span>SAMUDRA.3D &mdash; Sistem Antisipasi &amp; Mitigasi Tsunami</span>
  <span>Data resmi: <a href="https://bmkg.go.id" target="_blank" rel="noopener">bmkg.go.id</a></span>
`;
homeView.appendChild(footer);

// ===== INIT THREE.JS SCENE =====
const canvas = document.getElementById('gl');
const threeCtx = createScene(canvas);
const { U, S, K, cam, dome, stars, buoyGroup, lamp, pm, trail, trail2, dots, beacon, curve, land, tubeMesh, landGroup, renderer, scene, lerp, ping, sun, amb } = threeCtx;

// ===== SCENE CONTROLS =====
const scenes = Array.from(document.querySelectorAll('.scene'));
const sceneNavBtns = Array.from(document.querySelectorAll('.scene-nav__btn'));

function scrollToScene(n) {
  const s = document.querySelector('.stage');
  window.scrollTo({
    top: s.offsetTop + (s.offsetHeight - window.innerHeight) * (n + 0.25) / 3,
    behavior: 'smooth'
  });
}

sceneNavBtns.forEach(btn => {
  btn.onclick = () => scrollToScene(+btn.dataset.s);
});

window.addEventListener('keydown', e => {
  if (/^[123]$/.test(e.key) && e.target.tagName !== 'INPUT') scrollToScene(+e.key - 1);
});

// Magnitude slider in scene 2
document.getElementById('gm').oninput = function () {
  const M = +this.value;
  const idx = M < 7.6 ? 0 : M < 8.4 ? 1 : 2;
  document.getElementById('gM').textContent = M.toFixed(1);
  document.getElementById('gL').textContent = ['Waspada', 'Siaga', 'Awas'][idx];
  document.getElementById('gH').textContent = ['< 0,5 m', '0,5–3 m', '> 3 m'][idx];
  threeCtx.setState({ crestT: [1.5, 3.2, 6.5][idx] });
};

// Risk toggle
document.getElementById('risk').onclick = function () {
  const rk = threeCtx.getState().rk ? 0 : 1;
  threeCtx.setState({ rk });
  this.setAttribute('aria-pressed', !!rk);
};

// Mouse parallax
window.addEventListener('pointermove', e => {
  threeCtx.setState({ mx: e.clientX / window.innerWidth - 0.5, my: e.clientY / window.innerHeight - 0.5 });
});

// Drag to yaw
canvas.addEventListener('pointerdown', e => { threeCtx.setState({ drag: 1, lx: e.clientX }); });
window.addEventListener('pointerup', () => { threeCtx.setState({ drag: 0 }); });
window.addEventListener('pointermove', e => {
  const st = threeCtx.getState();
  if (st.drag) {
    threeCtx.setState({ yawT: Math.max(-1, Math.min(1, st.yawT + (e.clientX - st.lx) * 0.005)), lx: e.clientX });
  }
});

// Click on canvas to trigger ping
canvas.addEventListener('click', ping);

// ===== SCROLL PROGRESS =====
function fromScroll() {
  if (homeView.style.display === 'none') return;
  const s = document.querySelector('.stage');
  if (!s || s.offsetParent === null) return;
  const r = s.getBoundingClientRect();
  const q = -r.top / (r.height - window.innerHeight);
  threeCtx.setState({ pt: isFinite(q) ? Math.max(0, Math.min(1, q)) : 0 });
}
window.addEventListener('scroll', fromScroll, { passive: true });

// ===== ANIMATION LOOP =====
const clock = new THREE.Clock();
let lastPing = 0;

function Hj(x, z, t, tsu, fr, amp) {
  const h = (Math.sin((x * 0.9 + z * 0.4) * 0.55 + t * 1.1) * 0.5 + Math.sin((-x * 0.3 + z) * 0.8 + t * 1.4) * 0.32 + Math.sin((x * 0.7 - z * 0.7) * 1.5 + t * 1.9) * 0.16) * amp;
  const d = (x - fr) / 3.6;
  return h + tsu * U.uTsuH.value * Math.exp(-d * d);
}

const A = new THREE.Vector3(), B = new THREE.Vector3();

function loop() {
  requestAnimationFrame(loop);

  const dt = Math.min(clock.getDelta(), 0.05);
  const t = U.uT.value + dt * (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.25 : 1);
  const st = threeCtx.getState();

  // Smooth scroll progress
  let pp = st.pp + (st.pt - st.pp) * (1 - Math.exp(-dt * 3.5));
  if (!isFinite(pp)) pp = 0;
  threeCtx.setState({ pp });

  const x3 = pp * 3;
  const i0 = Math.min(2, Math.floor(x3));
  let f = Math.max(0, Math.min(1, (x3 - i0 - 0.55) / 0.45));
  f = f * f * f * (f * (f * 6 - 15) + 10);
  if (i0 === 2) f = 0;
  const vv = i0 + f;

  const a = K[Math.min(i0, 2)], b = K[Math.min(i0 + 1, 2)];
  A.fromArray(a.cp); B.fromArray(b.cp); S.cp.copy(A).lerp(B, f);
  A.fromArray(a.lk); B.fromArray(b.lk); S.lk.copy(A).lerp(B, f);
  ['amp', 'tsu', 'ter', 'buoy', 'path'].forEach(n => { S[n] = lerp(a[n], b[n], f); });

  // Update scene nav
  const n0 = Math.round(vv);
  let cur = st.cur;
  if (n0 !== cur) {
    cur = n0;
    threeCtx.setState({ cur });
    sceneNavBtns.forEach((e, i) => e.setAttribute('aria-current', i === n0));
  }

  // Scene opacity
  const nar = cam.aspect < 1;
  scenes.forEach((el, i) => {
    const o = Math.max(0, 1 - Math.abs(vv - i) * 2.2);
    el.style.opacity = o;
    el.style.transform = `translate(${(i - vv) * -50}px,-50%)`;
    el.classList.toggle('scene--active', o > 0.5);
  });

  // Camera
  let yaw = st.yaw + (st.yawT - st.yaw) * (1 - Math.exp(-dt * 6));
  threeCtx.setState({ yaw });
  const cx = S.cp.x + st.mx * 3 - S.lk.x, cz = S.cp.z + (nar ? 10 : 0) - S.lk.z;
  const co = Math.cos(yaw), si = Math.sin(yaw);
  cam.position.set(S.lk.x + cx * co + cz * si, S.cp.y - st.my * 1.5 + (nar ? 5 : 0), S.lk.z - cx * si + cz * co);
  cam.lookAt(nar ? S.lk.x - 2 : S.lk.x, S.lk.y, S.lk.z);
  dome.position.copy(cam.position);
  stars.position.copy(cam.position);

  // Time of day
  const todVal = +document.getElementById('tod').value;
  U.uTod.value = lerp(U.uTod.value, todVal, 1 - Math.exp(-dt * 5));
  const T = U.uTod.value;
  const { sun, amb } = threeCtx;
  if (sun) { sun.position.set(-15, Math.max(2, 30 * (0.55 - 0.51 * Math.min(T * 2, 1) - Math.max(T - 0.5, 0) * 0.6)), -24); sun.intensity = Math.max(0.2, 1.3 * (1 - T * 0.85)); }
  if (amb) amb.intensity = 0.95 - 0.55 * T;

  // Tsunami wave
  const front = -26 + (t * 6) % 56;
  U.uTsuH.value = lerp(U.uTsuH.value, st.crestT, 0.1);

  // Update uniforms
  U.uT.value = t;
  U.uAmp.value = S.amp;
  U.uTsu.value = S.tsu;
  U.uFront.value = front;
  U.uBv.value = S.buoy;
  U.uRisk.value = lerp(U.uRisk.value, st.rk, 1 - Math.exp(-dt * 5));
  U.uTer.value = S.ter;

  // Ping wave
  let pingT = threeCtx.getPingT();
  if (U.uPa.value > 0) {
    pingT += dt;
    threeCtx.setPingT(pingT);
    U.uPr.value = pingT * 8;
    U.uPa.value = Math.max(0, 1 - pingT / 1.9);
    U.uPc.value.set(4, 2);
  }

  // Auto ping on scene 0
  if (cur === 0 && t - lastPing > 3.4) { lastPing = t; ping(); }

  // Buoy animation
  buoyGroup.visible = S.buoy > 0.05;
  buoyGroup.scale.setScalar(0.5 + S.buoy * 0.5);
  buoyGroup.position.y = Hj(4, 2, t, S.tsu, front, S.amp);
  buoyGroup.rotation.z = Math.sin(t * 1.3) * 0.07;
  buoyGroup.rotation.y = t * 0.2;
  lamp.material.color.setHex(Math.sin(t * 4) > 0 ? 0x00d2ff : 0x032247);

  // Land and island group visibility
  if (landGroup) {
    landGroup.position.y = -(1.0 - S.ter) * 38.0;
    landGroup.visible = S.ter > 0.02;
  }

  // Update dynamic coastal boats, pier debris, and gravity wave physics
  if (threeCtx.updateCoastalPhysics && S.ter > 0.02) {
    threeCtx.updateCoastalPhysics(dt, t, S.tsu, front, U.uTsuH.value, S.amp);
  }

  // Evac path (only visible when in Scene 3 / evacuation route)
  const showPath = S.path > 0.02;
  if (tubeMesh) tubeMesh.visible = showPath;
  trail.visible = showPath;
  trail2.visible = showPath;
  beacon.visible = showPath;
  dots.forEach(d => { d.visible = showPath; });

  pm.opacity = S.path * 0.5;
  trail.material.opacity = S.path * 0.35;
  trail2.material.opacity = S.path * 0.95;
  beacon.material.opacity = S.path;
  beacon.scale.setScalar(1 + 0.25 * Math.sin(t * 4));
  dots.forEach((d, j) => {
    d.material.opacity = S.path;
    d.position.copy(curve.getPoint((t * 0.18 + j / dots.length) % 1));
  });

  renderer.render(scene, cam);
}

loop();
fromScroll();

// ===== ARTICLE PAGE SPA ROUTER =====
let savedScrollY = 0;

function showArticle(articleId, updateHistory = true) {
  if (homeView.style.display !== 'none') {
    savedScrollY = window.scrollY;
  }
  if (updateHistory) {
    const newUrl = `${window.location.pathname}?article=${encodeURIComponent(articleId)}`;
    window.history.pushState({ articleId }, '', newUrl);
  }
  homeView.style.display = 'none';
  articleView.style.display = 'block';
  renderArticlePage(articleView, articleId, () => showHome(true));
}

function showHome(updateHistory = true) {
  if (updateHistory) {
    window.history.pushState({}, '', window.location.pathname);
  }
  articleView.style.display = 'none';
  articleView.innerHTML = '';
  homeView.style.display = 'block';
  // Restore user scroll position on home page
  window.scrollTo(0, savedScrollY || 0);
  fromScroll();
}

// Global hook for card clicks
window.__navigateToArticle = function (id) {
  showArticle(id, true);
};

// Handle Browser Back & Forward buttons
window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('article');
  if (articleId) {
    showArticle(articleId, false);
  } else {
    showHome(false);
  }
});

// Initial URL inspection on load (e.g. if loaded in new tab with ?article=...)
const initialArticleId = new URLSearchParams(window.location.search).get('article');
if (initialArticleId) {
  showArticle(initialArticleId, false);
} else {
  showHome(false);
}
