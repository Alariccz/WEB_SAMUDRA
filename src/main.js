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
import { renderWeatherSection } from './components/WeatherWidget.js';
import { renderArticlePage } from './components/ArticlePage.js';
import { createScene } from './scene/threeScene.js';
import { mountPhone3DMockup } from './components/Phone3DMockup.js';
import * as THREE from 'three';
import QRCode from 'qrcode';

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
    <div class="underwater-fx" id="underwater-fx" aria-hidden="true">
      <div class="underwater-fx__shock"></div>
      <div class="underwater-fx__abyss"></div>
      <div class="underwater-fx__turbulent-blur"></div>
      <div class="underwater-fx__caustics"></div>
      <div class="underwater-fx__chromatic"></div>
      <div class="underwater-fx__vignette"></div>
      <div class="underwater-fx__wetlens"></div>
    </div>
    <svg class="uw-svg-filters" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none">
      <filter id="waterRefractFilter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence id="uw-fe-turb" type="fractalNoise" baseFrequency="0.024 0.038" numOctaves="3" result="turb" seed="5"/>
        <feDisplacementMap id="uw-fe-disp" in="SourceGraphic" in2="turb" scale="0" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>
    <div class="vig"></div>

    <div class="scene scene--active" id="s0">
      <span class="scene__eyebrow">Terhubung dengan BMKG</span>
      <h1>Gempa terjadi.<br>Anda tahu lebih dulu.</h1>
      <p class="scene__lede">Aplikasi menerima informasi gempa dan potensi tsunami dari BMKG, lalu mengirim notifikasi dan rute evakuasi ke ponsel Anda.</p>
      <div class="scene__stats">
        <div><b>BMKG</b><small>Sumber informasi gempa</small></div>
        <div><b>Rute</b><small>Menuju shelter terdekat</small></div>
      </div>
      <div class="scene__actions">
        <a class="btn btn--primary btn--apk" href="#unduh-apk">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Unduh APK (Android)
        </a>
        <a class="btn btn--white" href="#fitur">Jelajahi Fitur &nbsp;→</a>
      </div>
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
      <div class="scene__actions">
        <a class="btn btn--primary btn--apk" href="#unduh-apk">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Unduh APK
        </a>
        <a class="btn btn--white" href="#simulasi">Uji simulasi 3D &nbsp;→</a>
      </div>
    </div>

    <div class="scene-nav" role="group" aria-label="Pilih scene">
      <button class="scene-nav__btn" data-s="0" aria-current="true">01<i class="scene-nav__line"></i></button>
      <button class="scene-nav__btn" data-s="1">02<i class="scene-nav__line"></i></button>
      <button class="scene-nav__btn" data-s="2">03<i class="scene-nav__line"></i></button>
    </div>

    <div class="hud">
      <label class="hud__slider">Waktu <input id="tod" type="range" min="0" max="1" step=".01" value=".36"></label>
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
    <!-- Card 1 -->
    <a href="#simulasi" class="notched-card group">
      <div class="notched-card__cover-wrap">
        <div class="notched-card__cover">
          <img
            src="/img/step-1-bmkg-monitor.jpg"
            alt="Pusat Kendali Operasi Telemetri BMKG & Pemantauan Seismik"
            class="notched-card__img"
          />
          <div class="notched-card__dim"></div>
          <div class="notched-card__badge-wrap">
            <span class="notched-card__badge">TELEMETRI SENSOR</span>
          </div>
        </div>
        <div class="notched-card__notch-block" aria-hidden="true"></div>
        <div class="notched-card__fillet notched-card__fillet--top" aria-hidden="true"></div>
        <div class="notched-card__fillet notched-card__fillet--left" aria-hidden="true"></div>
        <span class="notched-card__disc" aria-hidden="true">01</span>
      </div>
      <h3 class="notched-card__title">BMKG Merilis Informasi</h3>
      <p class="notched-card__desc">Data real-time magnitudo, episentrum, kedalaman, dan tingkat peringatan diverifikasi serta diproses dalam hitungan detik.</p>
      <ul class="notched-card__tags">
        <li class="notched-card__tag">Sensor BMKG</li>
        <li class="notched-card__tag">&lt; 3 Detik</li>
        <li class="notched-card__tag">Verifikasi Otomatis</li>
      </ul>
    </a>

    <!-- Card 2 -->
    <a href="#simulasi" class="notched-card group">
      <div class="notched-card__cover-wrap">
        <div class="notched-card__cover">
          <img
            src="/img/step-2-emergency-alert.jpg"
            alt="Peringatan Darurat Tsunami & Notifikasi Siaga pada Layar Gawai Warga"
            class="notched-card__img"
          />
          <div class="notched-card__dim"></div>
          <div class="notched-card__badge-wrap">
            <span class="notched-card__badge">EDGE BROADCAST</span>
          </div>
        </div>
        <div class="notched-card__notch-block" aria-hidden="true"></div>
        <div class="notched-card__fillet notched-card__fillet--top" aria-hidden="true"></div>
        <div class="notched-card__fillet notched-card__fillet--left" aria-hidden="true"></div>
        <span class="notched-card__disc" aria-hidden="true">02</span>
      </div>
      <h3 class="notched-card__title">Anda Mendapat Notifikasi</h3>
      <p class="notched-card__desc">Peringatan darurat langsung dikirim ke gawai warga pesisir dengan instruksi padat, lugas, dan bebas kepanikan.</p>
      <ul class="notched-card__tags">
        <li class="notched-card__tag">Edge Push</li>
        <li class="notched-card__tag">Multi-Platform</li>
        <li class="notched-card__tag">Siaga Cepat</li>
      </ul>
    </a>

    <!-- Card 3 -->
    <a href="#fitur" class="notched-card group">
      <div class="notched-card__cover-wrap">
        <div class="notched-card__cover">
          <img
            src="/img/step-3-evacuation-route.jpg"
            alt="Jalur Evakuasi Menuju Elevasi Aman dan Tangga Pesisir Menjauhi Laut"
            class="notched-card__img"
          />
          <div class="notched-card__dim"></div>
          <div class="notched-card__badge-wrap">
            <span class="notched-card__badge">NAVIGASI EVAKUASI</span>
          </div>
        </div>
        <div class="notched-card__notch-block" aria-hidden="true"></div>
        <div class="notched-card__fillet notched-card__fillet--top" aria-hidden="true"></div>
        <div class="notched-card__fillet notched-card__fillet--left" aria-hidden="true"></div>
        <span class="notched-card__disc" aria-hidden="true">03</span>
      </div>
      <h3 class="notched-card__title">Anda Mengikuti Rute</h3>
      <p class="notched-card__desc">Navigasi evakuasi mandiri memandu Anda ke titik aman dan bukit terdekat, menghindari jembatan dan area genangan.</p>
      <ul class="notched-card__tags">
        <li class="notched-card__tag">Offline GPS</li>
        <li class="notched-card__tag">Peta Lokal</li>
        <li class="notched-card__tag">Elevasi Aman</li>
      </ul>
    </a>
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
  <div class="fui-bento-grid">
    <!-- Bento Card 1: Col-Span 3 (Top Left - Gelombang & Deteksi Dini Tsunami) -->
    <div class="fui-bento-card fui-bento-card--span-3 fui-bento-card--tl">
      <div class="fui-bento-card__graphic">
        <div class="fui-bento-card__img fui-bento-card__img--1"></div>
        <div class="fui-bento-card__fade-top"></div>
        <div class="fui-bento-card__fade-bottom"></div>
      </div>
      <div class="fui-bento-card__content">
        <span class="fui-bento-card__eyebrow">Data Telemetri BMKG &amp; Buoy</span>
        <h3 class="fui-bento-card__title">Peringatan Dini Gelombang Real-Time</h3>
        <p class="fui-bento-card__desc">Integrasi sensor seismik dasar laut dan buoy BMKG otomatis memantau rambatan gelombang, kedalaman hiposentrum, dan estimasi waktu tiba (ETA) tsunami.</p>
      </div>
    </div>

    <!-- Bento Card 2: Col-Span 3 (Top Right - Navigasi Elevasi Tinggi) -->
    <div class="fui-bento-card fui-bento-card--span-3 fui-bento-card--tr">
      <div class="fui-bento-card__graphic">
        <div class="fui-bento-card__img fui-bento-card__img--2"></div>
        <div class="fui-bento-card__fade-top"></div>
        <div class="fui-bento-card__fade-bottom"></div>
      </div>
      <div class="fui-bento-card__content">
        <span class="fui-bento-card__eyebrow">Navigasi &amp; Evakuasi Mandiri</span>
        <h3 class="fui-bento-card__title">Rute Menuju Elevasi Aman</h3>
        <p class="fui-bento-card__desc">Algoritma rute memandu Anda dari garis pantai rawan menuju bukit dan shelter elevasi tinggi, menghindari jembatan runtuh serta zona genangan air laut.</p>
      </div>
    </div>

    <!-- Bento Card 3: Col-Span 2 (Bottom Left - Respons Cepat SOS) -->
    <div class="fui-bento-card fui-bento-card--span-2 fui-bento-card--bl">
      <div class="fui-bento-card__graphic">
        <div class="fui-bento-card__img fui-bento-card__img--3"></div>
        <div class="fui-bento-card__fade-top"></div>
        <div class="fui-bento-card__fade-bottom"></div>
      </div>
      <div class="fui-bento-card__content">
        <span class="fui-bento-card__eyebrow">Respons Darurat SOS</span>
        <h3 class="fui-bento-card__title">Akses Kontak Darurat</h3>
        <p class="fui-bento-card__desc">Panggilan cepat satu ketukan ke Basarnas maritim, posko BPBD, ambulans darurat, serta pengiriman sinyal darurat koordinat ke keluarga.</p>
      </div>
    </div>

    <!-- Bento Card 4: Col-Span 2 (Bottom Mid - Titik Kumpul Aman) -->
    <div class="fui-bento-card fui-bento-card--span-2">
      <div class="fui-bento-card__graphic">
        <div class="fui-bento-card__img fui-bento-card__img--4"></div>
        <div class="fui-bento-card__fade-top"></div>
        <div class="fui-bento-card__fade-bottom"></div>
      </div>
      <div class="fui-bento-card__content">
        <span class="fui-bento-card__eyebrow">Titik Kumpul Terverifikasi</span>
        <h3 class="fui-bento-card__title">Peta Titik Kumpul &amp; Shelter</h3>
        <p class="fui-bento-card__desc">Peta shelter evakuasi vertikal (TES) dan perbukitan pesisir yang tervalidasi aman dari jangkauan limpasan air laut gelombang tsunami.</p>
      </div>
    </div>

    <!-- Bento Card 5: Col-Span 2 (Bottom Right - Mode Offline Satelit) -->
    <div class="fui-bento-card fui-bento-card--span-2 fui-bento-card--br">
      <div class="fui-bento-card__graphic">
        <div class="fui-bento-card__img fui-bento-card__img--5"></div>
        <div class="fui-bento-card__fade-top"></div>
        <div class="fui-bento-card__fade-bottom"></div>
      </div>
      <div class="fui-bento-card__content">
        <span class="fui-bento-card__eyebrow">Offline Readiness</span>
        <h3 class="fui-bento-card__title">Siaga Mode Offline Penuh</h3>
        <p class="fui-bento-card__desc">Peta jalur evakuasi dan materi keselamatan tersimpan di gawai lokal sehingga tetap berfungsi saat pemancar BTS dan internet padam pascagempa.</p>
      </div>
    </div>
  </div>
`;
fiturSection.appendChild(document.createElement('div'));
main.appendChild(fiturSection);

// Section: Cuaca Maritim & Atmosfer Yogyakarta (Live Data)
renderWeatherSection(main);

// Section: Simulasi
renderSimulation(main);

// Section: Langkah Mitigasi (live from API)
renderMitigasi(main);

// Section: Berita & Edukasi (live from API)
renderArticles(main);

// Section: CTA (Unduh APK & Akses Web App)
const ctaSection = document.createElement('section');
ctaSection.id = 'akses';
ctaSection.innerHTML = `
  <div class="cta-banner" id="unduh-apk">
    <div class="cta-banner__grid">
      <!-- Left: Copywriting & Action Buttons -->
      <div class="cta-banner__content">
        <span class="section-eyebrow">DISTRIBUSI RESMI &bull; APLIKASI MANDIRI</span>
        <h2 class="cta-banner__title">Kesiapsiagaan dimulai dari genggaman Anda.</h2>
        <p class="cta-banner__lead">
          Pasang aplikasi Android (APK) siap pakai untuk navigasi evakuasi mandiri berpanduan GPS offline, sirene gempa BMKG otomatis, dan penunjuk arah shelter elevasi tinggi terdekat.
        </p>

        <div class="cta-banner__actions">
          <a class="btn btn--primary btn--apk" id="cta-apk-btn" href="#unduh-apk">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Unduh APK (Android)
          </a>
          <a class="btn btn--outline" href="#mitigasi">Langkah Mitigasi</a>
          <a class="btn btn--outline" href="#artikel">Berita &amp; Riset</a>
        </div>

        <!-- APK Metadata Info -->
        <div class="apk-meta-grid">
          <div class="apk-meta-item">
            <span class="apk-meta-label">VERSI</span>
            <span class="apk-meta-val">v2.4.1 (Stable)</span>
          </div>
          <div class="apk-meta-item">
            <span class="apk-meta-label">UKURAN FILE</span>
            <span class="apk-meta-val">59.0 MB</span>
          </div>
          <div class="apk-meta-item">
            <span class="apk-meta-label">SISTEM OPERASI</span>
            <span class="apk-meta-val">Android 8.0+</span>
          </div>
          <div class="apk-meta-item">
            <span class="apk-meta-label">INTEGRITAS</span>
            <span class="apk-meta-val">Bebas Iklan &bull; Terverifikasi</span>
          </div>
        </div>
      </div>

      <!-- Right: 3D Phone Mockup & QR Code Container -->
      <div class="cta-banner__visuals">
        <!-- Interactive 3D Phone Mockup -->
        <div class="phone-3d-stage" id="phone-3d-stage">
          <div class="phone-mockup phone-mockup__fallback">
            <div class="phone-mockup__screen phone-mockup__screen--app">
              <img
                src="/img/samudra-app-screen.png"
                alt="Tampilan Aplikasi Mobile SAMUDRA"
                class="phone-mockup__img"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        <!-- QR Code Card -->
        <div class="qr-card" id="qr-download-card" role="button" tabindex="0" title="Pindai QR Code atau klik untuk mengunduh APK">
          <div class="qr-card__code" id="qr-code-container" aria-label="QR Code Unduh APK SAMUDRA"></div>
          <div class="qr-card__label">
            <b>Pindai QR Code</b>
            <small>Scan dengan kamera HP untuk unduh APK</small>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
main.appendChild(ctaSection);
mountPhone3DMockup(ctaSection.querySelector('#phone-3d-stage'), '/img/samudra-app-screen.png');

const APK_FILENAME = 'SAMUDRA-Mobile-v2.4.1.apk';
const CONFIGURED_APK_URL = (import.meta.env?.VITE_APK_URL || '').trim();
const LOCAL_APK_PATH = `/downloads/${APK_FILENAME}`;
const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

async function resolveQrDownloadUrl() {
  if (CONFIGURED_APK_URL) return CONFIGURED_APK_URL;

  if (LOCALHOST_HOSTNAMES.has(window.location.hostname)) {
    try {
      const res = await fetch('/__lan-origin.json', { cache: 'no-store' });
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data?.origin) {
          return `${data.origin}${LOCAL_APK_PATH}`;
        }
      }
    } catch (err) {
      console.warn('Gagal mendeteksi IP LAN untuk QR Code:', err);
    }
  }

  return `${window.location.origin}${LOCAL_APK_PATH}`;
}

// Render real scannable QR Code SVG
const qrCodeContainer = ctaSection.querySelector('#qr-code-container');
if (qrCodeContainer) {
  resolveQrDownloadUrl()
    .then((qrUrl) =>
      QRCode.toString(qrUrl, {
        type: 'svg',
        margin: 2,
        width: 120,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#041226',
          light: '#f0f9ff'
        }
      }).then((svgMarkup) => ({ svgMarkup, qrUrl }))
    )
    .then(({ svgMarkup, qrUrl }) => {
      qrCodeContainer.innerHTML = svgMarkup;
      const qrCard = ctaSection.querySelector('#qr-download-card');
      if (qrCard) {
        qrCard.setAttribute('title', `Pindai untuk mengunduh: ${qrUrl}`);
      }
    })
    .catch((err) => {
      console.warn('Gagal membuat QR Code:', err);
    });
}

function startBrowserDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function triggerApkDownload() {
  if (CONFIGURED_APK_URL) {
    showToast(`Mengunduh ${APK_FILENAME}...`);
    startBrowserDownload(CONFIGURED_APK_URL, APK_FILENAME);
    return;
  }

  try {
    const res = await fetch(LOCAL_APK_PATH, { method: 'HEAD', cache: 'no-store' });
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    // Vite/Nginx SPA fallback returns text/html for missing files; reject HTML responses
    if (res.ok && !contentType.includes('text/html')) {
      showToast(`Mengunduh ${APK_FILENAME}...`);
      startBrowserDownload(LOCAL_APK_PATH, APK_FILENAME);
      return;
    }
  } catch (err) {
    console.warn('Gagal memeriksa file APK lokal:', err);
  }

  showToast(`File APK belum tersedia di public/downloads/${APK_FILENAME}.`);
}

const ctaApkBtn = ctaSection.querySelector('#cta-apk-btn');
if (ctaApkBtn) {
  ctaApkBtn.addEventListener('click', (e) => {
    e.preventDefault();
    triggerApkDownload();
  });
}

const qrCardEl = ctaSection.querySelector('#qr-download-card');
if (qrCardEl) {
  qrCardEl.addEventListener('click', () => triggerApkDownload());
  qrCardEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerApkDownload();
    }
  });
}

function showToast(message) {
  let toast = document.getElementById('samudra-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'samudra-toast';
    toast.className = 'samudra-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('samudra-toast--visible');
  setTimeout(() => {
    toast.classList.remove('samudra-toast--visible');
  }, 4000);
}

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
const { U, S, K, cam, dome, stars, buoyGroup, lamp, pm, trail, trail2, dots, beacon, curve, land, tubeMesh, landGroup, renderer, scene, lerp, ping, sun, amb, th } = threeCtx;

// ===== SCENE CONTROLS =====
const scenes = Array.from(document.querySelectorAll('.scene'));
const sceneNavBtns = Array.from(document.querySelectorAll('.scene-nav__btn'));

function scrollToScene(n) {
  const s = document.querySelector('.stage');
  const ratio = n === 2 ? 0.96 : (n + 0.25) / 3;
  window.scrollTo({
    top: s.offsetTop + (s.offsetHeight - window.innerHeight) * ratio,
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

// Mouse parallax (active on mouse devices, smooth neutral on touch)
window.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse') {
    threeCtx.setState({
      mx: e.clientX / window.innerWidth - 0.5,
      my: e.clientY / window.innerHeight - 0.5
    });
  }
});

// Drag to yaw (mouse & touch-drag with vertical scroll preservation)
let dragStartX = 0, dragStartY = 0, isHorizontalDrag = false;
canvas.addEventListener('pointerdown', e => {
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  isHorizontalDrag = false;
  threeCtx.setState({ drag: 1, lx: e.clientX });
});
window.addEventListener('pointerup', () => {
  threeCtx.setState({ drag: 0 });
  isHorizontalDrag = false;
});
window.addEventListener('pointercancel', () => {
  threeCtx.setState({ drag: 0 });
  isHorizontalDrag = false;
});
window.addEventListener('pointermove', e => {
  const st = threeCtx.getState();
  if (st.drag) {
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (e.pointerType === 'touch') {
      if (!isHorizontalDrag && Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 8) {
        isHorizontalDrag = true;
      }
      if (isHorizontalDrag) {
        threeCtx.setState({
          yawT: Math.max(-1, Math.min(1, st.yawT + (e.clientX - st.lx) * 0.0035)),
          lx: e.clientX
        });
      }
    } else {
      threeCtx.setState({
        yawT: Math.max(-1, Math.min(1, st.yawT + (e.clientX - st.lx) * 0.005)),
        lx: e.clientX
      });
    }
  }
});

// Click on canvas to trigger ping
canvas.addEventListener('click', () => {
  lastPing = U.uT.value;
  ping();
});

// ===== SCROLL PROGRESS =====
let isStageVisible = true;
function fromScroll() {
  if (homeView.style.display === 'none') {
    isStageVisible = false;
    return;
  }
  const s = document.querySelector('.stage');
  if (!s || s.offsetParent === null) return;
  const r = s.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  isStageVisible = r.bottom > -80 && r.top < vh + 80;
  const q = -r.top / Math.max(1, (r.height - vh));
  threeCtx.setState({ pt: isFinite(q) ? Math.max(0, Math.min(1, q)) : 0 });
}
window.addEventListener('scroll', fromScroll, { passive: true });
window.addEventListener('resize', fromScroll, { passive: true });

// ===== ANIMATION LOOP =====
let lastTime = performance.now();
let lastPing = 0;

function Hj(x, z, t, tsu, fr, amp) {
  const wv = (v) => Math.sin(v) - 0.12 * Math.cos(2 * v);
  const h = (
    wv((x * 0.88 + z * 0.42) * 0.40 + t * 0.95) * 0.50 +
    wv((-x * 0.35 + z * 0.93) * 0.62 + t * 1.15) * 0.26 +
    wv((x * 0.65 - z * 0.72) * 1.10 + t * 1.40) * 0.12 +
    wv((x * 0.25 + z * 0.96) * 1.95 + t * 1.75) * 0.05
  ) * amp;
  const d = (x - fr) / 3.6;
  return h + tsu * U.uTsuH.value * Math.exp(-d * d);
}

// ===== REALISTIC CINEMATIC TSUNAMI COLLISION & OPTICS =====
let wasUnderwater = false;
let uwFactor = 0;
let impactShock = 0;
let wetLensVal = 0;
let camJoltX = 0, camJoltY = 0, camJoltPitch = 0, camJoltRoll = 0;
let dispScale = 0;

const A = new THREE.Vector3(), B = new THREE.Vector3();

// ===== EVACUATION ROUTE FIRST-PERSON WALKING POV (THROUGH SHELTER DOOR & INTO INTERIOR) =====
function getEvacWalkPose(u) {
  if (!curve) return null;
  const clampedU = Math.max(0.005, Math.min(0.992, u));
  const p = curve.getPoint(clampedU);
  // p.y on curve already includes getWalkSurfaceY(x, z) + 0.05 (trail + shelter ramp + interior floor)
  const floorY = p.y - 0.05;

  // Eye position: ~1.62m above walking surface (clears the 2.22m doorway lintel cleanly)
  const eyePos = new THREE.Vector3(p.x, floorY + 1.62, p.z);

  // Look target ahead along the curve
  const lookDistU = Math.min(0.998, clampedU + 0.065);
  const lookP = curve.getPoint(lookDistU);
  const lookFloorY = lookP.y - 0.05;

  // Forward look point along the trail
  const lookTarget = new THREE.Vector3(lookP.x, lookFloorY + 1.68, lookP.z);

  // When approaching the summit plaza (u > 0.68), align gaze straight through the open shelter doorway
  // into the interior BMKG Command & Rescue Hall at (44.8, sy + 0.45 + 1.55, -8.6)
  if (clampedU > 0.68) {
    const sy = th ? th(41.6, -8.6) : 18.8;
    const interiorTarget = new THREE.Vector3(44.8, sy + 0.45 + 1.55, -8.6);
    const doorBlend = Math.min(1.0, (clampedU - 0.68) / 0.20);
    const smoothDoorBlend = doorBlend * doorBlend * (3 - 2 * doorBlend);
    lookTarget.lerp(interiorTarget, smoothDoorBlend);
  }

  return { eyePos, lookTarget };
}

function loop() {
  requestAnimationFrame(loop);

  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (!isStageVisible || document.hidden) return;

  const t = U.uT.value + dt * (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.25 : 1);
  const st = threeCtx.getState();

  // Smooth scroll progress
  let pp = st.pp + (st.pt - st.pp) * (1 - Math.exp(-dt * 4.5));
  if (!isFinite(pp)) pp = 0;
  threeCtx.setState({ pp });

  const x3 = pp * 3;
  const i0 = Math.min(2, Math.floor(x3));
  let f = Math.max(0, Math.min(1, (x3 - i0 - 0.45) / 0.55));
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

  // Camera Controller: Orbit Camera (Scene 0 & 1) vs First-Person Walk POV (Scene 2)
  let yaw = st.yaw + (st.yawT - st.yaw) * (1 - Math.exp(-dt * 6));
  threeCtx.setState({ yaw });

  // Responsive camera framing: smooth interpolation across device aspect ratios
  const aspect = cam.aspect || (window.innerWidth / window.innerHeight);
  const narrowFactor = Math.max(0, Math.min(1.0, (1.10 - aspect) / 0.60));
  const mobBackDist = narrowFactor * 8.0;
  const mobLift = narrowFactor * 2.2;
  const mobLookShiftX = narrowFactor * -1.2;
  const mobLookShiftY = narrowFactor * -0.5;

  const cx = S.cp.x + st.mx * (narrowFactor > 0.5 ? 1.8 : 3.0) - S.lk.x;
  const cz = S.cp.z + mobBackDist - S.lk.z;
  const co = Math.cos(yaw), si = Math.sin(yaw);
  const orbitCamPos = new THREE.Vector3(
    S.lk.x + cx * co + cz * si,
    S.cp.y + mobLift - st.my * 1.5,
    S.lk.z - cx * si + cz * co
  );
  const orbitLookTarget = new THREE.Vector3(
    S.lk.x + mobLookShiftX,
    S.lk.y + mobLookShiftY,
    S.lk.z
  );

  // Transition factor into first-person path walking POV in Scene 2 (x3 > 1.5)
  const blendToWalk = Math.max(0, Math.min(1.0, (x3 - 1.50) / 0.45));
  const smoothBlend = blendToWalk * blendToWalk * (3 - 2 * blendToWalk);

  if (smoothBlend > 0) {
    // Walking progress along the curve (starts at beach x3=1.60, enters through shelter doorway, and stops inside room at x3=2.92)
    const walkProg = Math.max(0, Math.min(1.0, (x3 - 1.60) / 1.32));
    const walkU = 0.02 + walkProg * 0.972;
    const walkPose = getEvacWalkPose(walkU);

    if (walkPose) {
      // Natural walking footsteps head-bob (smoothly settles to 0 once inside the shelter interior)
      const indoorCalm = 1.0 - Math.max(0, Math.min(1.0, (walkU - 0.88) / 0.09));
      const walkFreq = walkU * 75.0;
      const stepBob = Math.abs(Math.sin(walkFreq)) * 0.035 * smoothBlend * indoorCalm;
      const stepRoll = Math.sin(walkFreq * 0.5) * 0.012 * smoothBlend * indoorCalm;

      const walkCamPos = walkPose.eyePos.clone();
      walkCamPos.y += stepBob;

      // First-person head-look with mouse / touch
      const walkLookTarget = walkPose.lookTarget.clone();
      walkLookTarget.x += st.mx * (narrowFactor > 0.5 ? 2.0 : 4.0);
      walkLookTarget.y -= st.my * 2.5;

      // On narrow mobile portrait screens, elevate look target slightly so summit shelter station is clearly framed
      if (narrowFactor > 0) {
        walkLookTarget.y += narrowFactor * 0.40;
      }

      // Smoothly blend camera position and lookTarget from orbit to walk POV
      cam.position.copy(orbitCamPos).lerp(walkCamPos, smoothBlend);
      const finalLook = orbitLookTarget.clone().lerp(walkLookTarget, smoothBlend);
      cam.lookAt(finalLook);
      cam.rotation.z += stepRoll;
    } else {
      cam.position.copy(orbitCamPos);
      cam.lookAt(orbitLookTarget);
    }
  } else {
    cam.position.copy(orbitCamPos);
    cam.lookAt(orbitLookTarget);
  }
  dome.position.copy(cam.position);
  stars.position.copy(cam.position);

  // Time of day
  const todVal = +document.getElementById('tod').value;
  U.uTod.value = lerp(U.uTod.value, todVal, 1 - Math.exp(-dt * 5));
  const T = U.uTod.value;
  const { sun, amb } = threeCtx;
  if (sun) { sun.position.set(-15, Math.max(2, 30 * (0.55 - 0.51 * Math.min(T * 2, 1) - Math.max(T - 0.5, 0) * 0.6)), -24); sun.intensity = Math.max(0.3, 1.45 * (1 - T * 0.7)); }
  if (amb) amb.intensity = 1.1 - 0.35 * T;

  // Tsunami wave
  const front = -26 + (t * 6) % 56;
  U.uTsuH.value = lerp(U.uTsuH.value, st.crestT, 0.1);

  // ── REALISTIC CINEMATIC TSUNAMI CAM HIT & HYDRODYNAMIC OPTICS ──────
  const camWaterY = Hj(cam.position.x, cam.position.z, t, S.tsu, front, S.amp);
  const submersionDepth = camWaterY - cam.position.y;
  const isUnderwater = submersionDepth > 0;
  const targetUW = Math.max(0, Math.min(1.0, submersionDepth / 1.6));
  
  // Instant violent wave collision trigger (Water slam impact)
  if (isUnderwater && !wasUnderwater && S.tsu > 0.05) {
    impactShock = 1.0;
    camJoltPitch = -0.13; // violent downward tilt impulse
    camJoltRoll = (Math.random() > 0.5 ? 1 : -1) * 0.09;
    camJoltY = -0.32;
    camJoltX = (Math.random() - 0.5) * 0.25;
  }
  
  // Decay impact shock & hydrodynamic impulses with physical exponential damping
  impactShock = Math.max(0, impactShock - dt * 2.8);
  camJoltPitch *= Math.exp(-dt * 4.5);
  camJoltRoll *= Math.exp(-dt * 4.0);
  camJoltY *= Math.exp(-dt * 5.5);
  camJoltX *= Math.exp(-dt * 5.0);

  // Resurfacing detection: realistic lens water sheeting
  if (wasUnderwater && !isUnderwater && S.tsu > 0.05) {
    wetLensVal = 1.0;
  }
  wasUnderwater = isUnderwater;
  wetLensVal = Math.max(0, wetLensVal - dt * 0.55);

  // Smooth underwater transition factor
  uwFactor += (targetUW - uwFactor) * (1 - Math.exp(-dt * (targetUW > uwFactor ? 20 : 7)));
  if (Math.abs(uwFactor) < 0.001) uwFactor = 0;
  if (U.uUnderwater) {
    U.uUnderwater.value = uwFactor;
  }
  
  if (stage) {
    stage.style.setProperty('--uw-depth', uwFactor.toFixed(3));
    stage.style.setProperty('--uw-impact', impactShock.toFixed(3));
    stage.style.setProperty('--wet-lens', wetLensVal.toFixed(3));
  }
  
  // Optical liquid refraction displacement on canvas
  const targetDisp = isUnderwater ? (14 + impactShock * 34) : (wetLensVal * 16);
  dispScale += (targetDisp - dispScale) * Math.min(1.0, dt * 12);
  const feDispEl = document.getElementById('uw-fe-disp');
  const feTurbEl = document.getElementById('uw-fe-turb');
  if (feDispEl) {
    feDispEl.setAttribute('scale', dispScale.toFixed(1));
  }
  if (feTurbEl && isUnderwater) {
    feTurbEl.setAttribute('seed', Math.floor((t * 24) % 100).toString());
  }
  const canvasEl = document.getElementById('gl');
  if (canvasEl) {
    if (dispScale > 0.6) {
      canvasEl.style.filter = 'url(#waterRefractFilter)';
    } else {
      canvasEl.style.filter = 'none';
    }
  }

  // Realistic hydrodynamic camera turbulence (violent fluid vorticity & cavitation)
  if (submersionDepth > -0.6 && S.tsu > 0.05) {
    const waveDist = Math.abs(cam.position.x - front);
    const waveProximity = Math.max(0, 1 - waveDist / 7.5);
    const shakePower = Math.min(1.6, Math.max(uwFactor * 1.35, waveProximity * S.tsu * 1.5));
    if (shakePower > 0.04) {
      // Cavitation micro-shudder (high frequency mechanical vibration)
      const cavitation = (Math.sin(t * 82.0) * 0.038 + Math.cos(t * 120.0) * 0.024) * shakePower;
      // Fluid vortex drag (macro swirling turbulence)
      const fluidX = (Math.sin(t * 3.2) * 0.16 + Math.sin(t * 7.5) * 0.07) * shakePower;
      const fluidY = (Math.cos(t * 3.8) * 0.18 + Math.cos(t * 8.6) * 0.08) * shakePower;
      const fluidRoll = (Math.sin(t * 2.5) * 0.042 + Math.sin(t * 6.0) * 0.022) * shakePower;

      cam.position.x += fluidX + camJoltX + cavitation * 0.5;
      cam.position.y += fluidY + camJoltY;
      cam.rotation.x += camJoltPitch;
      cam.rotation.z += fluidRoll + camJoltRoll + cavitation * 0.35;
    }
  }

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
    const duration = 2.4;
    const progress = pingT / duration;
    if (progress >= 1.0) {
      U.uPa.value = 0;
      U.uPr.value = 0;
      threeCtx.setPingT(99);
    } else {
      U.uPr.value = pingT * 7.5;
      const fade = 1.0 - progress;
      // Smooth cubic ease-out fade: vanishes completely with zero pop/glitch
      U.uPa.value = fade * fade * fade;
    }
    U.uPc.value.set(4, 2);
  } else {
    U.uPa.value = 0;
    U.uPr.value = 0;
  }

  // Auto ping on scene 0 (fires only after previous ping has completely vanished, with 3.1s of calm water)
  if (cur === 0 && U.uPa.value <= 0 && t - lastPing > 5.5) {
    lastPing = t;
    ping();
  }

  // Buoy animation with smooth wave slope pitch and roll
  buoyGroup.visible = S.buoy > 0.05;
  buoyGroup.scale.setScalar(0.5 + S.buoy * 0.5);
  buoyGroup.position.y = Hj(4, 2, t, S.tsu, front, S.amp);
  const slopeX = (Hj(4.15, 2, t, S.tsu, front, S.amp) - Hj(3.85, 2, t, S.tsu, front, S.amp)) / 0.3;
  const slopeZ = (Hj(4, 2.15, t, S.tsu, front, S.amp) - Hj(4, 1.85, t, S.tsu, front, S.amp)) / 0.3;
  buoyGroup.rotation.z = -slopeX * 0.75 + Math.sin(t * 1.1) * 0.03;
  buoyGroup.rotation.x = slopeZ * 0.75;
  buoyGroup.rotation.y = t * 0.15;
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

  // Evac path (visible when transitioning into Scene 2 / evacuation route)
  const pathFactor = Math.max(S.path, Math.min(1.0, (x3 - 1.05) / 0.5));
  const showPath = pathFactor > 0.02;
  if (tubeMesh) tubeMesh.visible = showPath;
  trail.visible = showPath;
  trail2.visible = showPath;
  beacon.visible = showPath;
  dots.forEach(d => { d.visible = showPath; });

  pm.opacity = pathFactor * 0.55;
  trail.material.opacity = pathFactor * 0.40;
  trail2.material.opacity = pathFactor * 0.95;
  beacon.material.opacity = pathFactor;
  beacon.scale.setScalar(1 + 0.25 * Math.sin(t * 4));
  dots.forEach((d, j) => {
    d.material.opacity = pathFactor;
    d.position.copy(curve.getPoint((t * 0.18 + j / dots.length) % 1));
  });

  renderer.render(scene, cam);
}

loop();
fromScroll();

// ===== SPA ROUTER (Home & Article Detail) =====
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
    window.history.pushState({}, '', '/');
  }
  articleView.style.display = 'none';
  articleView.innerHTML = '';
  homeView.style.display = 'block';
  // Restore user scroll position on home page
  window.scrollTo(0, savedScrollY || 0);
  fromScroll();
}

// Global hooks
window.__navigateToArticle = function (id) {
  showArticle(id, true);
};

window.__navigateToAdmin = function () {
  const hostname = window.location.hostname;
  if (hostname === 'samudra.buzz' || hostname.endsWith('.samudra.buzz')) {
    window.location.href = 'https://admin.samudra.buzz/';
  } else {
    window.location.href = '/admin.html';
  }
};

// Handle Browser Back & Forward buttons
window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('article');
  const page = urlParams.get('page');
  if (page === 'admin') {
    window.__navigateToAdmin();
  } else if (articleId) {
    showArticle(articleId, false);
  } else {
    showHome(false);
  }
});

// Initial URL inspection on load
const urlParams = new URLSearchParams(window.location.search);
const isCallbackPath = window.location.pathname.includes('/auth/callback');
const oauthToken = urlParams.get('token') || urlParams.get('accessToken') || urlParams.get('access_token');

if (oauthToken || isCallbackPath) {
  // Callback token OAuth dialihkan ke portal admin yang terpisah
  if (window.location.hostname === 'admin.samudra.buzz' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.location.replace('/admin.html' + window.location.search);
  } else {
    window.location.replace('https://admin.samudra.buzz/auth/callback' + window.location.search);
  }
} else if (urlParams.get('page') === 'admin' || window.location.search.includes('admin')) {
  if (window.location.hostname === 'samudra.buzz') {
    window.location.replace('https://admin.samudra.buzz/');
  } else {
    window.location.replace('/admin.html' + window.location.search);
  }
} else if (urlParams.get('article')) {
  showArticle(urlParams.get('article'), false);
} else {
  showHome(false);
  if (urlParams.get('download') === 'apk') {
    setTimeout(() => {
      const target = document.getElementById('unduh-apk');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      triggerApkDownload();
    }, 350);
  }
}

// Listen for live admin updates to refresh public views
window.addEventListener('samudra:content-updated', (e) => {
  const detail = e.detail || {};
  if (detail.type === 'mitigasi') {
    const existing = document.getElementById('mitigasi');
    if (existing && existing.parentNode) {
      const parent = existing.parentNode;
      const next = existing.nextSibling;
      existing.remove();
      const tempWrapper = document.createElement('div');
      renderMitigasi(tempWrapper);
      const newEl = tempWrapper.firstElementChild;
      if (newEl) parent.insertBefore(newEl, next);
    }
  } else if (detail.type === 'articles') {
    const existing = document.getElementById('artikel');
    if (existing && existing.parentNode) {
      const parent = existing.parentNode;
      const next = existing.nextSibling;
      existing.remove();
      const tempWrapper = document.createElement('div');
      renderArticles(tempWrapper);
      const newEl = tempWrapper.firstElementChild;
      if (newEl) parent.insertBefore(newEl, next);
    }
  }
});

// ===== INSTANT ZERO-LATENCY SCROLL & READING PROGRESS =====
function initSmoothScroll() {
  // Top reading progress indicator
  let progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress-bar';
    progressBar.className = 'scroll-progress-bar';
    document.body.appendChild(progressBar);
  }

  function updateProgressBar() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH > 0) {
      const p = Math.min(100, Math.max(0, (window.scrollY / docH) * 100));
      progressBar.style.width = `${p}%`;
    } else {
      progressBar.style.width = '0%';
    }
  }

  window.addEventListener('scroll', updateProgressBar, { passive: true });
  window.addEventListener('resize', updateProgressBar, { passive: true });
  updateProgressBar();

  // Smooth easing for internal hash anchors
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#' || href === '#!') return;
    const targetEl = document.querySelector(href);
    if (!targetEl) return;

    e.preventDefault();
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

initSmoothScroll();


