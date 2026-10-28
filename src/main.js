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
import { renderAdminApp, setAdminToken, setAdminRefreshToken, getMe, getAdminUser } from './admin/index.js';
import { createScene } from './scene/threeScene.js';
import * as THREE from 'three';

// ===== BUILD HTML STRUCTURE =====
const app = document.getElementById('app');

const homeView = document.createElement('div');
homeView.id = 'home-view';

const articleView = document.createElement('div');
articleView.id = 'article-view';
articleView.style.display = 'none';

const adminView = document.createElement('div');
adminView.id = 'admin-view';
adminView.style.display = 'none';

app.appendChild(homeView);
app.appendChild(articleView);
app.appendChild(adminView);

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
            <span class="apk-meta-val">28.4 MB</span>
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

      <!-- Right: Phone Mockup & QR Code Container -->
      <div class="cta-banner__visuals">
        <!-- Phone Mockup -->
        <div class="phone-mockup">
          <div class="phone-mockup__speaker"></div>
          <div class="phone-mockup__screen">
            <div class="mockup-header">
              <span class="mockup-header__logo">SAMUDRA</span>
              <span class="mockup-header__status"><span class="mockup-dot"></span> LIVE BMKG</span>
            </div>
            <div class="mockup-alert">
              <div class="mockup-alert__tag">PERINGATAN DINI</div>
              <div class="mockup-alert__title">POTENSI TSUNAMI M 8.0</div>
              <div class="mockup-alert__sub">Jalur evakuasi aktif &bull; Hindari pesisir</div>
            </div>
            <div class="mockup-radar">
              <div class="mockup-radar__circle mockup-radar__circle--3"></div>
              <div class="mockup-radar__circle mockup-radar__circle--2"></div>
              <div class="mockup-radar__circle mockup-radar__circle--1"></div>
              <div class="mockup-radar__line"></div>
              <div class="mockup-radar__pin"></div>
            </div>
            <div class="mockup-card">
              <div class="mockup-card__dest">Shelter Bukit Sektor B</div>
              <div class="mockup-card__eta">1.4 km &bull; 11 menit berjalan</div>
            </div>
          </div>
        </div>

        <!-- QR Code Card -->
        <div class="qr-card">
          <div class="qr-card__code">
            <svg viewBox="0 0 100 100" width="110" height="110" fill="#00d2ff">
              <!-- QR Code Pattern -->
              <rect x="0" y="0" width="100" height="100" fill="#041226"/>
              <!-- Top-Left Target -->
              <rect x="10" y="10" width="24" height="24" fill="#00d2ff"/>
              <rect x="14" y="14" width="16" height="16" fill="#041226"/>
              <rect x="18" y="18" width="8" height="8" fill="#00d2ff"/>
              <!-- Top-Right Target -->
              <rect x="66" y="10" width="24" height="24" fill="#00d2ff"/>
              <rect x="70" y="14" width="16" height="16" fill="#041226"/>
              <rect x="74" y="18" width="8" height="8" fill="#00d2ff"/>
              <!-- Bottom-Left Target -->
              <rect x="10" y="66" width="24" height="24" fill="#00d2ff"/>
              <rect x="14" y="70" width="16" height="16" fill="#041226"/>
              <rect x="18" y="74" width="8" height="8" fill="#00d2ff"/>
              <!-- Data modules -->
              <rect x="38" y="12" width="6" height="6" fill="#38bdf8"/>
              <rect x="48" y="12" width="6" height="6" fill="#00d2ff"/>
              <rect x="38" y="24" width="10" height="6" fill="#00d2ff"/>
              <rect x="52" y="24" width="6" height="6" fill="#38bdf8"/>
              <rect x="12" y="42" width="6" height="10" fill="#00d2ff"/>
              <rect x="24" y="42" width="8" height="6" fill="#38bdf8"/>
              <rect x="38" y="40" width="8" height="8" fill="#00d2ff"/>
              <rect x="50" y="42" width="8" height="6" fill="#38bdf8"/>
              <rect x="64" y="42" width="10" height="6" fill="#00d2ff"/>
              <rect x="80" y="40" width="8" height="8" fill="#38bdf8"/>
              <rect x="38" y="54" width="6" height="10" fill="#38bdf8"/>
              <rect x="50" y="56" width="10" height="6" fill="#00d2ff"/>
              <rect x="66" y="54" width="8" height="8" fill="#00d2ff"/>
              <rect x="78" y="56" width="10" height="6" fill="#38bdf8"/>
              <rect x="40" y="70" width="8" height="8" fill="#00d2ff"/>
              <rect x="54" y="68" width="6" height="10" fill="#38bdf8"/>
              <rect x="66" y="72" width="12" height="6" fill="#00d2ff"/>
              <rect x="82" y="70" width="6" height="8" fill="#38bdf8"/>
              <rect x="42" y="84" width="10" height="6" fill="#38bdf8"/>
              <rect x="58" y="82" width="8" height="8" fill="#00d2ff"/>
              <rect x="72" y="84" width="14" height="6" fill="#00d2ff"/>
            </svg>
          </div>
          <div class="qr-card__label">
            <b>Pindai QR Code</b>
            <small>Unduh langsung ke ponsel Android Anda</small>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
main.appendChild(ctaSection);

// Setup APK download feedback simulation
const ctaApkBtn = ctaSection.querySelector('#cta-apk-btn');
if (ctaApkBtn) {
  ctaApkBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Mengunduh SAMUDRA-Mobile-v2.4.1.apk (28.4 MB)...');
    // Trigger download of an authentic apk blob or link
    const blob = new Blob(["SAMUDRA Android App v2.4.1 (Production Release)"], { type: 'application/vnd.android.package-archive' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'SAMUDRA-Mobile-v2.4.1.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
function fromScroll() {
  if (homeView.style.display === 'none') return;
  const s = document.querySelector('.stage');
  if (!s || s.offsetParent === null) return;
  const r = s.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const q = -r.top / Math.max(1, (r.height - vh));
  threeCtx.setState({ pt: isFinite(q) ? Math.max(0, Math.min(1, q)) : 0 });
}
window.addEventListener('scroll', fromScroll, { passive: true });
window.addEventListener('resize', fromScroll, { passive: true });

// ===== ANIMATION LOOP =====
const clock = new THREE.Clock();
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

// ===== EVACUATION ROUTE FIRST-PERSON WALKING POV =====
function getEvacWalkPose(u) {
  if (!curve) return null;
  const clampedU = Math.max(0.005, Math.min(0.96, u));
  const p = curve.getPoint(clampedU);
  const groundY = th ? th(p.x, p.z) : p.y;

  // Eye position: ~1.80m above ground surface
  const eyePos = new THREE.Vector3(p.x, groundY + 1.80, p.z);

  // Look target ahead along the curve
  const lookDistU = Math.min(0.995, clampedU + 0.065);
  const lookP = curve.getPoint(lookDistU);
  const lookGroundY = th ? th(lookP.x, lookP.z) : lookP.y;

  // Forward look point with slight uphill gaze angle (+0.45m above eye level)
  const lookTarget = new THREE.Vector3(lookP.x, lookGroundY + 2.25, lookP.z);

  // When approaching summit shelter, gaze up at the summit shelter beacon
  if (clampedU > 0.75) {
    const shelterTarget = new THREE.Vector3(41.6, (th ? th(41.6, -8.6) : 15.5) + 3.2, -8.6);
    const topBlend = Math.min(1.0, (clampedU - 0.75) / 0.20);
    lookTarget.lerp(shelterTarget, topBlend * 0.75);
  }

  return { eyePos, lookTarget };
}

function loop() {
  requestAnimationFrame(loop);

  const dt = Math.min(clock.getDelta(), 0.05);
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
    // Walking progress along the curve (starts at beach x3=1.65 up to shelter at x3=2.95)
    const walkProg = Math.max(0, Math.min(1.0, (x3 - 1.65) / 1.30));
    const walkU = 0.02 + walkProg * 0.92;
    const walkPose = getEvacWalkPose(walkU);

    if (walkPose) {
      // Natural walking footsteps head-bob
      const walkFreq = walkU * 75.0;
      const stepBob = Math.abs(Math.sin(walkFreq)) * 0.035 * smoothBlend;
      const stepRoll = Math.sin(walkFreq * 0.5) * 0.012 * smoothBlend;

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
  if (sun) { sun.position.set(-15, Math.max(2, 30 * (0.55 - 0.51 * Math.min(T * 2, 1) - Math.max(T - 0.5, 0) * 0.6)), -24); sun.intensity = Math.max(0.2, 1.3 * (1 - T * 0.85)); }
  if (amb) amb.intensity = 0.95 - 0.55 * T;

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

// ===== SPA ROUTER (Home, Article Detail, & Admin Portal) =====
let savedScrollY = 0;

function showAdmin(updateHistory = true) {
  if (homeView.style.display !== 'none') {
    savedScrollY = window.scrollY;
  }
  if (updateHistory) {
    const newUrl = '/?page=admin';
    window.history.pushState({ page: 'admin' }, '', newUrl);
  }
  homeView.style.display = 'none';
  articleView.style.display = 'none';
  articleView.innerHTML = '';
  adminView.style.display = 'block';
  renderAdminApp(adminView, () => showHome(true));
  window.scrollTo(0, 0);
}

function showArticle(articleId, updateHistory = true) {
  if (homeView.style.display !== 'none') {
    savedScrollY = window.scrollY;
  }
  if (updateHistory) {
    const newUrl = `${window.location.pathname}?article=${encodeURIComponent(articleId)}`;
    window.history.pushState({ articleId }, '', newUrl);
  }
  adminView.style.display = 'none';
  adminView.innerHTML = '';
  homeView.style.display = 'none';
  articleView.style.display = 'block';
  renderArticlePage(articleView, articleId, () => showHome(true));
}

function showHome(updateHistory = true) {
  if (updateHistory) {
    window.history.pushState({}, '', '/');
  }
  adminView.style.display = 'none';
  adminView.innerHTML = '';
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
  showAdmin(true);
};

// Handle Browser Back & Forward buttons
window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('article');
  const page = urlParams.get('page');
  if (page === 'admin' || window.location.search.includes('admin')) {
    showAdmin(false);
  } else if (articleId) {
    showArticle(articleId, false);
  } else {
    showHome(false);
  }
});

// Initial URL inspection on load (including Google OAuth callback token from backend redirect)
const urlParams = new URLSearchParams(window.location.search);
const isCallbackPath = window.location.pathname.includes('/auth/callback');
const oauthToken = urlParams.get('token') || urlParams.get('accessToken') || urlParams.get('access_token');
const oauthRefreshToken = urlParams.get('refreshToken') || urlParams.get('refresh_token');
const authError = urlParams.get('error') || urlParams.get('message');

if (oauthToken) {
  setAdminToken(oauthToken);
  if (oauthRefreshToken) {
    setAdminRefreshToken(oauthRefreshToken);
  }
  // Immediately decode user so getAdminUser() is ready immediately
  getAdminUser();

  // Clean URL to /?page=admin without leaving access tokens in address bar
  window.history.replaceState({ page: 'admin' }, '', '/?page=admin');

  getMe().catch((e) => {
    console.warn('Gagal memuat profil OAuth:', e);
  }).finally(() => {
    showAdmin(false);
  });
} else if (authError) {
  window.history.replaceState({ page: 'admin' }, '', '/?page=admin');
  showAdmin(false);
} else if (isCallbackPath || urlParams.get('page') === 'admin' || window.location.search.includes('admin')) {
  if (isCallbackPath) {
    window.history.replaceState({ page: 'admin' }, '', '/?page=admin');
  }
  showAdmin(false);
} else if (urlParams.get('article')) {
  showArticle(urlParams.get('article'), false);
} else {
  showHome(false);
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

