import { fetchMitigasi } from '../api.js';
import { waterStageMarkup, waterStageStyles, mountWarpCarousel } from './WarpCarouselMount.js';
import { mountCircularMitigasiCarousel } from './CircularCarouselMount.js';

// PALET WARNA (Inspirasi Dribbble Lodge / Nature Retreat)
// Deep navy: #060E12 | Ocean blue: #2B5161 | Muted blue: #58818F
// White: #FEFEFE | Soft grey-blue: #A5B5BC | Warm earthy accent: #BB4019 & #583937

// MENGAMANKAN TEKS
function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

// MEMASTIKAN URL GAMBAR AMAN
function safeImageUrl(url) {
  if (!url) return '';

  try {
    const parsed = new URL(url, window.location.origin);

    if (['http:', 'https:'].includes(parsed.protocol)) {
      return escapeHTML(parsed.href);
    }
  } catch {
    return '';
  }

  return '';
}

// DATA MITIGASI DEFAULT
const DEFAULT_MITIGASI = [
  {
    id: 'default-step-1',
    stepNumber: 1,
    title: 'Deteksi Gempa & Lindungi Diri',
    description: 'Saat guncangan terasa, segera merunduk (Drop), lindungi kepala dan leher (Cover), serta bertahan di bawah meja kokoh (Hold On) hingga guncangan mereda.',
    imageUrl: ''
  },
  {
    id: 'default-step-2',
    stepNumber: 2,
    title: 'Tinggalkan Kawasan Pantai',
    description: 'Jika berada di pesisir dan merasakan gempa kuat atau berlangsung lama, segera menjauh dari pantai menuju tempat yang lebih tinggi. Jangan menunggu bunyi sirene.',
    imageUrl: ''
  },
  {
    id: 'default-step-3',
    stepNumber: 3,
    title: 'Pilih Jalur Evakuasi Aman',
    description: 'Gunakan jalur evakuasi yang telah ditentukan. Hindari pantai, muara sungai, jembatan, dan area lain yang berpotensi terdampak tsunami.',
    imageUrl: ''
  },
  {
    id: 'default-step-4',
    stepNumber: 4,
    title: 'Bertahan di Tempat Aman',
    description: 'Tetap berada di tempat yang lebih tinggi atau shelter evakuasi hingga pihak berwenang menyatakan kondisi aman dan peringatan tsunami berakhir.',
    imageUrl: ''
  }
];

// MAIN RENDER
export function renderMitigasi(container) {
  const section = document.createElement('section');

  section.id = 'mitigasi';
  section.className = 'mitigasi-section';

  section.innerHTML = `
    <style>
      #mitigasi.mitigasi-section {
        position: relative;
        width: 100%;
        background-color: transparent;
        color: var(--color-text);
        font-family: var(--font-sans);
        overflow: hidden;
        padding: 0 var(--container-pad);
        border: none;
        box-sizing: border-box;
      }

      .mit-container {
        width: 100%;
        max-width: var(--container-max);
        margin: 0 auto;
        padding: 0;
        box-sizing: border-box;
      }

      /* EYEBROW / BADGES */
      .mit-eyebrow {
        font: 600 var(--text-xs)/1 var(--font-mono);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: var(--space-4);
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        padding: 7px 14px;
        border-radius: var(--radius-pill);
      }

      .mit-eyebrow-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--color-accent);
        box-shadow: 0 0 8px var(--color-accent);
        display: inline-block;
      }

      /* HERO SECTION */
      .mit-hero {
        padding: var(--space-section) 0 clamp(48px, 6vw, 76px);
      }

      .mit-hero-grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: clamp(36px, 5vw, 64px);
        align-items: center;
      }

      .mit-hero-title {
        font: 300 var(--text-3xl)/1.12 var(--font-sans);
        letter-spacing: -0.025em;
        color: var(--color-text-strong);
        margin: 0 0 var(--space-5);
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      }

      .mit-hero-title-accent {
        color: var(--color-accent);
      }

      .mit-hero-desc {
        font: 300 var(--text-base)/1.7 var(--font-sans);
        color: var(--color-text-muted);
        max-width: 520px;
        margin: 0 0 var(--space-8);
      }

      .mit-hero-actions {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        flex-wrap: wrap;
      }

      .mit-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        background: var(--color-accent);
        color: var(--color-bg-deep);
        padding: 13px 26px;
        border-radius: var(--radius-pill);
        font-size: var(--text-sm);
        font-weight: 600;
        text-decoration: none;
        border: 1px solid var(--color-border-accent);
        box-shadow: var(--shadow-glow);
        transition: transform var(--transition-base), background var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base);
        cursor: pointer;
      }

      .mit-btn-primary:hover {
        background: var(--color-accent);
        color: var(--color-bg-deep);
        border-color: rgba(255, 255, 255, 0.45);
        transform: translateY(-2px);
        box-shadow: 0 6px 26px rgba(0, 210, 255, 0.55), 0 0 32px rgba(0, 210, 255, 0.35);
      }

      .mit-btn-primary svg {
        transition: transform var(--transition-fast);
      }

      .mit-btn-primary:hover svg {
        transform: translateX(4px);
      }

      .mit-hero-stat {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding-left: var(--space-5);
        border-left: 1px solid var(--color-border-accent);
      }

      .mit-stat-num {
        font: 300 var(--text-2xl)/1 var(--font-sans);
        color: var(--color-text-strong);
        letter-spacing: -0.02em;
      }

      .mit-stat-label {
        font: 500 var(--text-xs)/1.4 var(--font-mono);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      /* Hero Media */
      .mit-hero-media {
        position: relative;
        border-radius: var(--radius-card);
        overflow: hidden;
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-deep);
        box-shadow: var(--shadow-card);
      }

      .mit-hero-media::after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--image-overlay);
        pointer-events: none;
      }

      .mit-hero-img {
        width: 100%;
        height: 380px;
        object-fit: cover;
        display: block;
        filter: var(--image-filter);
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .mit-hero-media:hover .mit-hero-img {
        transform: scale(1.03);
      }

      /* INTRODUCTION SECTION */
      .mit-intro {
        padding: clamp(48px, 6vw, 76px) 0 clamp(36px, 5vw, 60px);
        background: transparent;
        position: relative;
      }

      .mit-intro-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 720px;
        margin: 0 auto clamp(16px, 2.5vw, 24px);
        position: relative;
        z-index: 4;
      }

      .mit-intro-title {
        font: 300 var(--text-3xl)/1.12 var(--font-sans);
        letter-spacing: -0.025em;
        color: var(--color-text-strong);
        margin: 0 0 16px;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        text-wrap: balance;
      }

      .mit-intro-desc {
        font: 300 15px/1.7 var(--font-sans);
        color: var(--color-text-muted);
        max-width: 60ch;
        margin: 0 auto;
        text-wrap: balance;
      }

      ${waterStageStyles}

      .mit-intro-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-6);
      }

      .mit-pillar-card {
        background: var(--color-surface);
        -webkit-backdrop-filter: blur(18px) saturate(165%);
        backdrop-filter: blur(18px) saturate(165%);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        padding: clamp(24px, 3vw, 32px);
        display: flex;
        flex-direction: column;
        height: 100%;
        box-shadow: var(--shadow-card);
        transition: transform var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base), background var(--transition-base);
      }

      .mit-pillar-card:hover {
        transform: translateY(-4px);
        background: var(--color-surface-hover);
        border-color: var(--color-border-accent);
        box-shadow: var(--shadow-card-hover);
      }

      .mit-pillar-icon-box {
        width: 50px;
        height: 50px;
        border-radius: var(--radius-md);
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-accent);
        margin-bottom: var(--space-5);
        transition: background-color var(--transition-fast), border-color var(--transition-fast);
      }

      .mit-pillar-card:hover .mit-pillar-icon-box {
        background: var(--color-accent-soft-hover);
        border-color: var(--color-accent);
      }

      .mit-pillar-title {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--color-text-strong);
        margin: 0 0 var(--space-2);
      }

      .mit-pillar-desc {
        font-size: var(--text-sm);
        line-height: 1.7;
        color: var(--color-text-muted);
        margin: 0;
      }

      /* EVACUATION GUIDE SECTION */
      .mit-guide-section {
        padding: var(--space-section) 0;
        scroll-margin-top: 80px;
      }

      .mit-guide-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: var(--space-6);
        flex-wrap: wrap;
        margin-bottom: var(--space-8);
      }

      .mit-guide-title {
        font: 300 var(--text-3xl)/1.12 var(--font-sans);
        color: var(--color-text-strong);
        letter-spacing: -0.025em;
        margin: 0 0 var(--space-4);
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      }

      .mit-guide-desc {
        font: 300 var(--text-base)/1.7 var(--font-sans);
        color: var(--color-text-muted);
        max-width: 58ch;
        margin: 0;
      }

      .mit-guide-controls {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        flex-wrap: wrap;
      }

      .mit-counter {
        display: inline-flex;
        align-items: center;
        padding: 8px 18px;
        border-radius: var(--radius-pill);
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-text-strong);
        background: var(--color-surface-solid);
        border: 1px solid var(--color-border-accent);
        white-space: nowrap;
      }

      .mit-nav-buttons {
        display: flex;
        gap: 10px;
      }

      .mit-nav-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--color-surface-solid);
        border: 1px solid var(--color-border-accent);
        color: var(--color-text-strong);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        padding: 0;
      }

      .mit-nav-btn:hover {
        background: var(--color-accent-soft-hover);
        border-color: var(--color-accent);
        transform: translateY(-2px);
        box-shadow: var(--shadow-glow);
      }

      .mit-nav-btn:active {
        transform: translateY(0);
        opacity: 0.9;
      }

      /* CAROUSEL TRACK */
      .mit-carousel-track {
        position: relative;
        width: 100%;
        min-height: 480px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
        padding: 4px 0 16px;
      }

      /* MITIGASI CARD */
      .mitigasi-card {
        flex: 0 0 min(330px, 85%);
        scroll-snap-align: start;
        background: var(--color-surface);
        -webkit-backdrop-filter: blur(18px) saturate(165%);
        backdrop-filter: blur(18px) saturate(165%);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        height: 100%;
        box-shadow: var(--shadow-card);
        transition: transform var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base), background var(--transition-base);
        cursor: pointer;
      }

      .mitigasi-card:hover {
        transform: translateY(-6px);
        background: var(--color-surface-hover);
        border-color: var(--color-border-accent);
        box-shadow: var(--shadow-card-hover);
      }

      .mit-card-media {
        position: relative;
        height: 195px;
        background: transparent;
        overflow: hidden;
        -webkit-mask-image: linear-gradient(180deg, #000 50%, rgba(0, 0, 0, 0.7) 78%, transparent 100%);
        mask-image: linear-gradient(180deg, #000 50%, rgba(0, 0, 0, 0.7) 78%, transparent 100%);
      }

      .mit-card-media::after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--image-overlay);
        pointer-events: none;
      }

      .mit-card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: var(--image-filter);
        transition: transform 0.4s ease;
      }

      .mitigasi-card:hover .mit-card-img {
        transform: scale(1.05);
      }

      /* Fallback Card Placeholder */
      .mit-card-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-3);
        background: radial-gradient(circle at 50% 40%, rgba(0, 210, 255, 0.18) 0%, var(--color-bg-deep) 70%);
      }

      .mit-fallback-icon-box {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-accent);
      }

      .mit-fallback-text {
        font: 700 var(--text-xs)/1 var(--font-mono);
        letter-spacing: 0.14em;
        color: var(--color-accent);
        text-transform: uppercase;
      }

      .mit-step-badge {
        position: absolute;
        top: 14px;
        left: 14px;
        z-index: 2;
        background: var(--color-surface-solid);
        border: 1px solid var(--color-border-accent);
        padding: 6px 12px;
        border-radius: var(--radius-pill);
        font: 700 10.5px/1 var(--font-mono);
        letter-spacing: 0.1em;
        color: var(--color-text-strong);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
      }

      .mit-step-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: var(--color-accent);
      }

      .mit-card-content {
        padding: var(--space-6);
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      .mit-card-tag {
        font: 700 10.5px/1 var(--font-mono);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: var(--space-2);
      }

      .mit-card-title {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--color-text-strong);
        line-height: 1.4;
        margin: 0 0 10px;
        transition: color var(--transition-fast);
      }

      .mit-card-desc {
        font-size: var(--text-sm);
        line-height: 1.7;
        color: var(--color-text-muted);
        margin: 0 0 var(--space-5);
        flex-grow: 1;
      }

      .mit-card-action {
        margin-top: auto;
        border-top: 1px solid var(--color-border);
        padding-top: var(--space-4);
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--color-accent);
        font-size: 13px;
        font-weight: 600;
        transition: color var(--transition-fast);
      }

      .mitigasi-card:hover .mit-card-action {
        color: var(--color-text-strong);
      }

      .mit-card-action svg {
        transition: transform var(--transition-fast), color var(--transition-fast);
      }

      .mitigasi-card:hover .mit-card-action svg {
        transform: translateX(4px);
        color: var(--color-accent);
      }

      /* EVACUATION REMINDER SECTION */
      .mit-reminder {
        padding: 0 0 var(--space-section);
      }

      .mit-reminder-card {
        background: var(--color-surface);
        -webkit-backdrop-filter: blur(18px) saturate(165%);
        backdrop-filter: blur(18px) saturate(165%);
        border: 1px solid var(--color-border);
        border-left: 4px solid var(--color-accent);
        border-radius: var(--radius-card);
        padding: clamp(28px, 4vw, 44px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-8);
        box-shadow: var(--shadow-card);
      }

      .mit-reminder-body {
        flex: 1;
        min-width: 260px;
      }

      .mit-reminder-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: 7px 14px;
        border-radius: var(--radius-pill);
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        font: 600 var(--text-xs)/1 var(--font-mono);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: var(--space-4);
      }

      .mit-reminder-title {
        font: 300 clamp(24px, 3vw, 34px)/1.2 var(--font-sans);
        letter-spacing: -0.02em;
        color: var(--color-text-strong);
        margin: 0 0 var(--space-3);
      }

      .mit-reminder-desc {
        font: 300 var(--text-base)/1.7 var(--font-sans);
        color: var(--color-text-muted);
        max-width: 640px;
        margin: 0;
      }

      .mit-reminder-icon-box {
        width: 76px;
        height: 76px;
        border-radius: 50%;
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-accent);
        flex-shrink: 0;
      }

      /* RESPONSIVE LAYOUT */
      @media (max-width: 960px) {
        .mit-hero-grid {
          grid-template-columns: 1fr;
          gap: 40px;
        }
        .mit-intro-cards {
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }
        .mit-hero-media {
          max-width: 600px;
        }
      }

      @media (max-width: 720px) {
        .mit-reminder-card {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-6);
        }
        .mit-hero-actions {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-4);
        }
        .mit-hero-stat {
          padding-left: 0;
          border-left: none;
          border-top: 1px solid var(--color-border-accent);
          padding-top: 14px;
          width: 100%;
        }
        .mit-guide-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .mit-guide-controls {
          width: 100%;
          justify-content: space-between;
        }
      }
    </style>

    <main>
      <!-- HERO SECTION -->
      <section class="mit-hero">
        <div class="mit-container">
          <div class="mit-hero-grid">
            <div>
              <div class="mit-eyebrow">
                <span class="mit-eyebrow-dot"></span>
                <span>SAMUDRA &bull; PANDUAN KEBENCANAAN</span>
              </div>

              <h1 class="mit-hero-title">
                Kenali Mitigasi,<br><span class="mit-hero-title-accent">Lindungi Diri.</span>
              </h1>

              <p class="mit-hero-desc">
                Kenali langkah-langkah penyelamatan diri dan tingkatkan kesiapsiagaan menghadapi ancaman tsunami. Karena mengetahui apa yang harus dilakukan dapat membantu melindungi diri dan orang-orang di sekitar kita.
              </p>

              <div class="mit-hero-actions">
                <a href="#panduan-evakuasi" data-learn-button class="mit-btn-primary">
                  <span>Pelajari Panduan</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>

                <div class="mit-hero-stat">
                  <span class="mit-stat-num">5</span>
                  <span class="mit-stat-label">Tahapan Kunci<br>Evakuasi</span>
                </div>
              </div>
            </div>

            <div class="mit-hero-media">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                alt="Pesisir pantai dan ombak samudra"
                class="mit-hero-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>


      <!-- INTRODUCTION SECTION -->
      <section class="mit-intro">
        <div class="mit-container">
          <div class="mit-intro-header">
            <div class="mit-eyebrow">
              <span class="mit-eyebrow-dot"></span>
              <span>KENALI ANCAMANNYA</span>
            </div>

            <h2 class="mit-intro-title">
              Mengapa Mitigasi Tsunami Penting?
            </h2>

            <p class="mit-intro-desc">
              Tsunami merupakan rangkaian gelombang laut besar yang dapat terjadi akibat gangguan mendadak di dasar laut, seperti gempa bumi bawah laut. Dampaknya dapat mengancam keselamatan masyarakat di wilayah pesisir. Dengan memahami mitigasi, masyarakat dapat mengenali risiko dan melakukan tindakan penyelamatan secara lebih cepat dan tepat.
            </p>
          </div>

          ${waterStageMarkup()}
        </div>
      </section>


      <!-- EVACUATION GUIDE SECTION -->
      <section id="panduan-evakuasi" class="mit-guide-section">
        <div class="mit-container">
          <div class="mit-guide-header">
            <div>
              <div class="mit-eyebrow">
                <span class="mit-eyebrow-dot"></span>
                <span>LANGKAH KESELAMATAN</span>
              </div>

              <h2 class="mit-guide-title">
                Panduan Mitigasi Tsunami
              </h2>

              <p class="mit-guide-desc">
                Ikuti tahapan berikut untuk mengetahui tindakan yang perlu dilakukan ketika menghadapi ancaman tsunami.
              </p>
            </div>
          </div>

          <!-- CAROUSEL TRACK -->
          <div id="mitigasi-grid" class="mit-carousel-track">
            <div style="flex: 0 0 100%; padding: 48px; text-align: center; color: var(--color-text-muted); background: var(--color-surface); border-radius: var(--radius-card); border: 1px solid var(--color-border); -webkit-backdrop-filter: blur(18px) saturate(165%); backdrop-filter: blur(18px) saturate(165%); box-shadow: var(--shadow-card);">
              Memuat langkah mitigasi...
            </div>
          </div>
        </div>
      </section>


      <!-- EVACUATION REMINDER SECTION -->
      <section class="mit-reminder">
        <div class="mit-container">
          <div class="mit-reminder-card">
            <div class="mit-reminder-body">
              <div class="mit-reminder-eyebrow">
                <span class="mit-eyebrow-dot"></span>
                <span>INGAT SELALU</span>
              </div>

              <h2 class="mit-reminder-title">
                Jangan Tunggu Gelombang Datang untuk Menyelamatkan Diri.
              </h2>

              <p class="mit-reminder-desc">
                Jika merasakan gempa kuat atau lama di wilayah pesisir, segera menjauh dari pantai dan menuju tempat yang lebih tinggi. Jangan menunggu sirene atau peringatan resmi apabila terdapat tanda alami tsunami.
              </p>
            </div>

            <div class="mit-reminder-icon-box" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="4.5" r="2" />
                <path d="m5 19 3.5-5 2.5 2 2-4.5 3-1.5" />
                <path d="m6 11 3-2 3 1.5 2.5-2" />
                <path d="M19 15l3-3-3-3" />
                <path d="M14 12h8" />
                <path d="M3 21h18" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;

  container.appendChild(section);


  // WARP CAROUSEL (React, dimuat lazy)
  mountWarpCarousel(section).catch(err => console.warn('WarpCarousel gagal dimuat:', err));

  // TOMBOL PELAJARI PANDUAN
  const learnButton = section.querySelector('[data-learn-button]');

  if (learnButton) {
    learnButton.addEventListener('click', event => {
      event.preventDefault();

      const target = section.querySelector('#panduan-evakuasi');

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }


  // CAROUSEL
  const grid = section.querySelector('#mitigasi-grid');
  const btnPrev = section.querySelector('#mitigasi-prev');
  const btnNext = section.querySelector('#mitigasi-next');
  const counter = section.querySelector('#mitigasi-counter');

  // FUNGSI SCROLL KE KIRI
  if (btnPrev && grid) {
    btnPrev.onclick = () => {
      const card = grid.querySelector('.mitigasi-card');
      const scrollAmount = card ? card.offsetWidth + 24 : 340;

      grid.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    };
  }

  // FUNGSI SCROLL KE KANAN
  if (btnNext && grid) {
    btnNext.onclick = () => {
      const card = grid.querySelector('.mitigasi-card');
      const scrollAmount = card ? card.offsetWidth + 24 : 340;

      grid.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    };
  }


  // AMBIL DATA DARI API
  const mountCircularOrFallback = (items) => {
    mountCircularMitigasiCarousel({
      host: grid,
      items,
      counterEl: counter,
      prevBtn: btnPrev,
      nextBtn: btnNext
    }).catch(err => {
      console.warn('CircularCarousel gagal dimuat, memakai fallback kartu:', err);
      renderCards(grid, items, counter);
    });
  };

  fetchMitigasi()
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const sorted = [...data].sort(
          (a, b) => (a.stepNumber || 0) - (b.stepNumber || 0)
        );

        mountCircularOrFallback(sorted);
      } else {
        mountCircularOrFallback(DEFAULT_MITIGASI);
      }
    })
    .catch(err => {
      console.warn(
        'Gagal memuat API mitigasi, menggunakan panduan default:',
        err
      );

      mountCircularOrFallback(DEFAULT_MITIGASI);
    });
}


// RENDER MITIGATION CARDS
function renderCards(grid, items, counter) {
  if (!grid) return;

  if (counter) {
    counter.textContent = `${items.length} Panduan Evakuasi`;
  }

  grid.innerHTML = items.map((item, idx) => {
    const stepNum = item.stepNumber || (idx + 1);
    const stepLabel = `LANGKAH ${String(stepNum).padStart(2, '0')}`;

    const itemTitle = escapeHTML(item.title || 'Panduan Mitigasi');
    const itemDescription = escapeHTML(
      item.description || 'Instruksi kesiapsiagaan dan tindakan tanggap darurat.'
    );

    const itemId = escapeHTML(item.id || 'mitigasi-' + stepNum);

    const href = `?article=${encodeURIComponent(
      item.id || 'mitigasi-' + stepNum
    )}`;

    const image = safeImageUrl(item.imageUrl);

    return `
      <a
        class="mitigasi-card"
        href="${href}"
        data-id="${itemId}"
        aria-label="Buka panduan: ${itemTitle}"
      >
        <!-- CARD IMAGE -->
        <div class="mit-card-media">
          ${image
        ? `
                <img
                  src="${image}"
                  alt="${itemTitle}"
                  loading="lazy"
                  class="mit-card-img"
                >
              `
        : `
                <div class="mit-card-fallback">
                  <div class="mit-fallback-icon-box" aria-hidden="true">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 6c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                    </svg>
                  </div>
                  <span class="mit-fallback-text">PANDUAN SAMUDRA</span>
                </div>
              `
      }

          <span class="mit-step-badge">
            <span class="mit-step-dot"></span>
            <span>${stepLabel}</span>
          </span>
        </div>

        <!-- CARD CONTENT -->
        <div class="mit-card-content">
          <span class="mit-card-tag">PANDUAN EVAKUASI</span>

          <h3 class="mit-card-title">
            ${itemTitle}
          </h3>

          <p class="mit-card-desc">
            ${itemDescription}
          </p>

          <div class="mit-card-action">
            <span>Baca Panduan Lengkap</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </a>
    `;
  }).join('');


  // NAVIGASI ARTIKEL
  grid.querySelectorAll('.mitigasi-card').forEach(card => {
    const targetId = card.getAttribute('data-id');

    card.addEventListener('click', event => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();

      if (typeof window.__navigateToArticle === 'function') {
        window.__navigateToArticle(targetId);
      }
    });
  });
}
