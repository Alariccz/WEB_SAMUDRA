import { fetchMitigasi } from '../api.js';

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
        color: #f8fafc;
        font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        padding: 0;
        border: none;
      }

      .mit-container {
        width: 100%;
        max-width: 1240px;
        margin: 0 auto;
        padding: 0 clamp(20px, 4vw, 48px);
        box-sizing: border-box;
      }

      /* EYEBROW / BADGES */
      .mit-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #38bdf8;
        margin-bottom: 14px;
      }

      .mit-eyebrow-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #00d2ff;
        box-shadow: 0 0 8px rgba(0, 210, 255, 0.55);
        display: inline-block;
      }

      /* HERO SECTION */
      .mit-hero {
        padding: clamp(64px, 8vw, 100px) 0 clamp(48px, 6vw, 76px);
      }

      .mit-hero-grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: clamp(36px, 5vw, 64px);
        align-items: center;
      }

      .mit-hero-title {
        font-size: clamp(34px, 4.4vw, 54px);
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.025em;
        color: #FEFEFE;
        margin: 0 0 20px;
      }

      .mit-hero-title-accent {
        color: #7dd3fc;
      }

      .mit-hero-desc {
        font-size: clamp(15px, 1.2vw, 16px);
        line-height: 1.8;
        color: #94a3b8;
        max-width: 520px;
        margin: 0 0 32px;
      }

      .mit-hero-actions {
        display: flex;
        align-items: center;
        gap: 24px;
        flex-wrap: wrap;
      }

      .mit-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: linear-gradient(135deg, #00d2ff 0%, #38bdf8 100%);
        color: #041424;
        padding: 14px 26px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 4px 20px rgba(0, 210, 255, 0.42), 0 0 25px rgba(0, 210, 255, 0.2);
        transition: all 0.25s ease;
        cursor: pointer;
      }

      .mit-btn-primary:hover {
        background: linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%);
        color: #041424;
        transform: translateY(-2px);
        box-shadow: 0 6px 26px rgba(0, 210, 255, 0.65), 0 0 35px rgba(0, 210, 255, 0.4);
      }

      .mit-btn-primary svg {
        transition: transform 0.25s ease;
      }

      .mit-btn-primary:hover svg {
        transform: translateX(4px);
      }

      .mit-hero-stat {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-left: 20px;
        border-left: 1px solid rgba(88, 129, 143, 0.25);
      }

      .mit-stat-num {
        font-size: 28px;
        font-weight: 700;
        color: #FEFEFE;
        line-height: 1;
      }

      .mit-stat-label {
        font-size: 11px;
        line-height: 1.4;
        color: #58818F;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }

      /* Hero Media */
      .mit-hero-media {
        position: relative;
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid rgba(88, 129, 143, 0.25);
        background-color: #0B171D;
        box-shadow: 0 20px 48px -12px rgba(6, 14, 18, 0.8);
      }

      .mit-hero-img {
        width: 100%;
        height: 380px;
        object-fit: cover;
        display: block;
        filter: brightness(0.85) contrast(1.05);
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .mit-hero-media:hover .mit-hero-img {
        transform: scale(1.03);
      }

      /* INTRODUCTION SECTION */
      .mit-intro {
        padding: clamp(60px, 8vw, 92px) 0;
        background: transparent;
      }

      .mit-intro-header {
        text-align: center;
        max-width: 760px;
        margin: 0 auto clamp(36px, 5vw, 48px);
      }

      .mit-intro-title {
        font-size: clamp(26px, 3.5vw, 36px);
        font-weight: 700;
        color: #f8fafc;
        letter-spacing: -0.02em;
        margin: 0 0 16px;
      }

      .mit-intro-desc {
        font-size: 15px;
        line-height: 1.8;
        color: #94a3b8;
        margin: 0 auto;
      }

      .mit-intro-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: clamp(16px, 2.5vw, 28px);
      }

      .mit-pillar-card {
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.06) 0%,
          rgba(255, 255, 255, 0.015) 45%,
          rgba(56, 189, 248, 0.07) 100%
        ), rgba(12, 30, 52, 0.86);
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 20px;
        padding: clamp(24px, 3vw, 32px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
      }

      .mit-pillar-card:hover {
        transform: translateY(-4px);
        border-color: rgba(0, 210, 255, 0.45);
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 210, 255, 0.14);
      }

      .mit-pillar-icon-box {
        width: 50px;
        height: 50px;
        border-radius: 14px;
        background: rgba(0, 210, 255, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.32);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #38bdf8;
        margin-bottom: 20px;
        transition: background-color 0.25s ease, border-color 0.25s ease;
      }

      .mit-pillar-card:hover .mit-pillar-icon-box {
        background: rgba(0, 210, 255, 0.22);
        border-color: rgba(0, 210, 255, 0.55);
      }

      .mit-pillar-title {
        font-size: 18px;
        font-weight: 600;
        color: #f8fafc;
        margin: 0 0 10px;
      }

      .mit-pillar-desc {
        font-size: 13.5px;
        line-height: 1.7;
        color: #94a3b8;
        margin: 0;
      }

      /* EVACUATION GUIDE SECTION */
      .mit-guide-section {
        padding: clamp(64px, 8vw, 96px) 0 clamp(48px, 6vw, 72px);
        scroll-margin-top: 80px;
      }

      .mit-guide-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
        flex-wrap: wrap;
        margin-bottom: 32px;
      }

      .mit-guide-title {
        font-size: clamp(26px, 3.5vw, 36px);
        font-weight: 700;
        color: #FEFEFE;
        letter-spacing: -0.02em;
        margin: 0 0 10px;
      }

      .mit-guide-desc {
        font-size: 15px;
        line-height: 1.7;
        color: #A5B5BC;
        max-width: 560px;
        margin: 0;
      }

      .mit-guide-controls {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }

      .mit-counter {
        display: inline-flex;
        align-items: center;
        padding: 8px 18px;
        border-radius: 999px;
        font-size: 12.5px;
        font-weight: 600;
        color: #FEFEFE;
        background: rgba(43, 81, 97, 0.35);
        border: 1px solid rgba(88, 129, 143, 0.35);
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
        background: #0B171D;
        border: 1px solid rgba(88, 129, 143, 0.3);
        color: #FEFEFE;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.22s ease;
        padding: 0;
      }

      .mit-nav-btn:hover {
        background: #2B5161;
        border-color: rgba(165, 181, 188, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
      }

      .mit-nav-btn:active {
        transform: translateY(0);
      }

      /* CAROUSEL TRACK */
      .mit-carousel-track {
        display: flex;
        gap: 24px;
        overflow-x: auto;
        scroll-behavior: smooth;
        scroll-snap-type: x mandatory;
        padding: 8px 4px 28px;
        scrollbar-width: thin;
        scrollbar-color: #2B5161 transparent;
      }

      .mit-carousel-track::-webkit-scrollbar {
        height: 6px;
      }

      .mit-carousel-track::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.04);
        border-radius: 999px;
      }

      .mit-carousel-track::-webkit-scrollbar-thumb {
        background: #2B5161;
        border-radius: 999px;
      }

      .mit-carousel-track::-webkit-scrollbar-thumb:hover {
        background: #58818F;
      }

      /* MITIGASI CARD */
      .mitigasi-card {
        flex: 0 0 min(330px, 85%);
        scroll-snap-align: start;
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.06) 0%,
          rgba(255, 255, 255, 0.015) 45%,
          rgba(56, 189, 248, 0.07) 100%
        ), rgba(12, 30, 52, 0.86);
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 20px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
        cursor: pointer;
      }

      .mitigasi-card:hover {
        transform: translateY(-6px);
        border-color: rgba(0, 210, 255, 0.45);
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.55), 0 0 24px rgba(0, 210, 255, 0.16);
      }

      .mit-card-media {
        position: relative;
        height: 195px;
        background: #10242D;
        overflow: hidden;
      }

      .mit-card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: brightness(0.85);
        transition: transform 0.4s ease;
      }

      .mitigasi-card:hover .mit-card-img {
        transform: scale(1.04);
      }

      /* Fallback Card Placeholder */
      .mit-card-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: radial-gradient(circle at 50% 40%, rgba(43, 81, 97, 0.35) 0%, #0B171D 70%);
      }

      .mit-fallback-icon-box {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(43, 81, 97, 0.4);
        border: 1px solid rgba(88, 129, 143, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #58818F;
      }

      .mit-fallback-text {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: #58818F;
        text-transform: uppercase;
      }

      .mit-step-badge {
        position: absolute;
        top: 14px;
        left: 14px;
        background: rgba(6, 14, 18, 0.88);
        border: 1px solid rgba(88, 129, 143, 0.35);
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #FEFEFE;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .mit-step-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: #00d2ff;
      }

      .mit-card-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      .mit-card-tag {
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #58818F;
        margin-bottom: 8px;
      }

      .mit-card-title {
        font-size: 18px;
        font-weight: 600;
        color: #FEFEFE;
        line-height: 1.4;
        margin: 0 0 10px;
        transition: color 0.2s ease;
      }

      .mit-card-desc {
        font-size: 13.5px;
        line-height: 1.7;
        color: #A5B5BC;
        margin: 0 0 20px;
        flex-grow: 1;
      }

      .mit-card-action {
        border-top: 1px solid rgba(88, 129, 143, 0.18);
        padding-top: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #58818F;
        font-size: 13px;
        font-weight: 600;
        transition: color 0.2s ease;
      }

      .mitigasi-card:hover .mit-card-action {
        color: #FEFEFE;
      }

      .mit-card-action svg {
        transition: transform 0.25s ease, color 0.25s ease;
      }

      .mitigasi-card:hover .mit-card-action svg {
        transform: translateX(4px);
        color: #00d2ff;
      }

      /* EVACUATION REMINDER SECTION */
      .mit-reminder {
        padding: 0 0 clamp(64px, 8vw, 100px);
      }

      .mit-reminder-card {
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.06) 0%,
          rgba(255, 255, 255, 0.015) 45%,
          rgba(56, 189, 248, 0.07) 100%
        ), rgba(12, 30, 52, 0.88);
        border: 1px solid rgba(56, 189, 248, 0.22);
        border-left: 4px solid #00d2ff;
        border-radius: 22px;
        padding: clamp(28px, 4vw, 44px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
        box-shadow: 0 16px 38px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.14);
      }

      .mit-reminder-body {
        flex: 1;
        min-width: 260px;
      }

      .mit-reminder-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #38bdf8;
        margin-bottom: 12px;
      }

      .mit-reminder-title {
        font-size: clamp(22px, 3.2vw, 28px);
        font-weight: 700;
        color: #FEFEFE;
        line-height: 1.35;
        margin: 0 0 12px;
      }

      .mit-reminder-desc {
        font-size: 14.5px;
        line-height: 1.75;
        color: #A5B5BC;
        max-width: 640px;
        margin: 0;
      }

      .mit-reminder-icon-box {
        width: 76px;
        height: 76px;
        border-radius: 50%;
        background: rgba(0, 210, 255, 0.12);
        border: 1px solid rgba(0, 210, 255, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #00d2ff;
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
          gap: 16px;
        }
        .mit-hero-media {
          max-width: 600px;
        }
      }

      @media (max-width: 720px) {
        .mit-reminder-card {
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
        }
        .mit-hero-actions {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        .mit-hero-stat {
          padding-left: 0;
          border-left: none;
          border-top: 1px solid rgba(88, 129, 143, 0.25);
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

          <div class="mit-intro-cards">
            <!-- PILLAR 1: Kenali Risiko -->
            <div class="mit-pillar-card">
              <div class="mit-pillar-icon-box" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 6c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                </svg>
              </div>
              <h3 class="mit-pillar-title">Kenali Risiko</h3>
              <p class="mit-pillar-desc">
                Pahami potensi ancaman tsunami di lingkungan sekitar.
              </p>
            </div>

            <!-- PILLAR 2: Kenali Lokasi Aman -->
            <div class="mit-pillar-card">
              <div class="mit-pillar-icon-box" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 class="mit-pillar-title">Kenali Lokasi Aman</h3>
              <p class="mit-pillar-desc">
                Ketahui titik kumpul dan jalur evakuasi terdekat.
              </p>
            </div>

            <!-- PILLAR 3: Siapkan Diri -->
            <div class="mit-pillar-card">
              <div class="mit-pillar-icon-box" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <h3 class="mit-pillar-title">Siapkan Diri</h3>
              <p class="mit-pillar-desc">
                Persiapkan perlengkapan dan rencana menghadapi bencana.
              </p>
            </div>
          </div>
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

            <div class="mit-guide-controls">
              <span id="mitigasi-counter" class="mit-counter">
                Memuat panduan...
              </span>

              <div class="mit-nav-buttons">
                <button
                  id="mitigasi-prev"
                  class="mit-nav-btn"
                  aria-label="Langkah sebelumnya"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>

                <button
                  id="mitigasi-next"
                  class="mit-nav-btn"
                  aria-label="Langkah selanjutnya"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- CAROUSEL TRACK -->
          <div id="mitigasi-grid" class="mit-carousel-track">
            <div style="flex: 0 0 100%; padding: 48px; text-align: center; color: #A5B5BC; background: #0B171D; border-radius: 20px; border: 1px solid rgba(88,129,143,0.2);">
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
  fetchMitigasi()
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const sorted = [...data].sort(
          (a, b) => (a.stepNumber || 0) - (b.stepNumber || 0)
        );

        renderCards(grid, sorted, counter);
      } else {
        renderCards(grid, DEFAULT_MITIGASI, counter);
      }
    })
    .catch(err => {
      console.warn(
        'Gagal memuat API mitigasi, menggunakan panduan default:',
        err
      );

      renderCards(grid, DEFAULT_MITIGASI, counter);
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
                  <span class="mit-fallback-text">SAMUDRA GUIDE</span>
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
