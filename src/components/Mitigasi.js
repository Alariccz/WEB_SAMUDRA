import { fetchMitigasi } from '../api.js';

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
export const DEFAULT_IMAGES = {
  1: '/img/step-1-bmkg-monitor.jpg',
  2: '/img/bg-misty-coast.jpg',
  3: '/img/bento-evacuation-route.jpg',
  4: '/img/bento-shelter-tes.jpg'
};

const CARD_STACK_COVERS = [
  '/img/bento-buoy-warning.jpg',
  '/img/cover-2.jpg',
  '/img/bg-misty-hills.jpg',
  '/img/bg-shelter-lights.jpg',
  '/img/cover-3.jpg'
];

const DEFAULT_IMAGE_ALTS = {
  1: 'Orang berlindung di bawah permukaan kokoh saat simulasi gempa',
  2: 'Orang bergerak menjauhi garis pantai menuju dataran tinggi',
  3: 'Rambu dan tangga jalur evakuasi tsunami',
  4: 'Shelter evakuasi tsunami sebagai tempat aman dan titik kumpul'
};

export const DEFAULT_MITIGASI = [
  {
    id: 'default-step-1',
    stepNumber: 1,
    title: 'Deteksi Gempa & Lindungi Diri',
    description: 'Saat guncangan terasa, segera merunduk (Drop), lindungi kepala dan leher (Cover), serta bertahan di bawah meja kokoh (Hold On) hingga guncangan mereda.',
    content: `Saat guncangan terasa, segera merunduk untuk menjaga keseimbangan dan mengurangi risiko terjatuh. Lindungi kepala serta leher dengan lengan atau berlindung di bawah meja yang kokoh jika tersedia.

Tetap berlindung dan berpegangan sampai guncangan berhenti. Jauhi kaca, lemari, dan benda yang dapat jatuh; jangan berlari keluar saat bangunan masih berguncang.

Setelah guncangan reda, periksa keadaan sekitar dengan hati-hati dan ikuti informasi serta arahan petugas. Jika berada di pesisir dan gempa terasa kuat atau berlangsung lama, segera bergerak ke tempat yang lebih tinggi.`,
    imageUrl: DEFAULT_IMAGES[1]
  },
  {
    id: 'default-step-2',
    stepNumber: 2,
    title: 'Tinggalkan Kawasan Pantai',
    description: 'Jika berada di pesisir dan merasakan gempa kuat atau berlangsung lama, segera menjauh dari pantai menuju tempat yang lebih tinggi. Jangan menunggu bunyi sirene.',
    content: `Gempa kuat atau berlangsung lama di pesisir dapat menjadi tanda alami bahaya tsunami. Segera tinggalkan pantai dan muara, lalu bergerak menuju tempat yang lebih tinggi atau lokasi aman yang telah ditentukan.

Gunakan jalur evakuasi yang tersedia dan bergerak dengan tertib. Jangan berhenti untuk mengamati laut, mengambil barang yang tidak penting, atau menunggu sirene sebelum mulai mengungsi.

Ikuti informasi resmi BMKG dan arahan petugas setelah mencapai tempat aman. Tetap berada di sana sampai pihak berwenang menyatakan kondisi aman.`,
    imageUrl: DEFAULT_IMAGES[2]
  },
  {
    id: 'default-step-3',
    stepNumber: 3,
    title: 'Pilih Jalur Evakuasi Aman',
    description: 'Gunakan jalur evakuasi yang telah ditentukan. Hindari pantai, muara sungai, jembatan, dan area lain yang berpotensi terdampak tsunami.',
    content: `Kenali jalur evakuasi dan titik aman sebelum terjadi keadaan darurat. Saat harus mengungsi, ikuti rambu dan jalur yang sudah ditetapkan pemerintah atau petugas setempat.

Pilih rute yang menjauh dari garis pantai serta area yang berpotensi terdampak, termasuk muara sungai. Jika jalur utama tidak dapat dilalui, ikuti petunjuk alternatif dari petugas.

Bantu anak-anak, lansia, penyandang disabilitas, dan orang lain yang membutuhkan bantuan selama perjalanan. Hindari kembali ke area berbahaya untuk mengambil barang.`,
    imageUrl: DEFAULT_IMAGES[3]
  },
  {
    id: 'default-step-4',
    stepNumber: 4,
    title: 'Bertahan di Tempat Aman',
    description: 'Tetap berada di tempat yang lebih tinggi atau shelter evakuasi hingga pihak berwenang menyatakan kondisi aman dan peringatan tsunami berakhir.',
    content: `Setelah mencapai tempat yang lebih tinggi atau shelter evakuasi, tetaplah di lokasi aman. Jangan kembali ke pantai atau daerah rendah hanya karena gelombang pertama telah lewat.

Tsunami dapat datang dalam beberapa gelombang. Pantau informasi resmi dan ikuti arahan petugas mengenai lokasi berlindung serta kebutuhan keluarga.

Akhiri evakuasi hanya setelah pihak berwenang menyatakan keadaan aman dan peringatan telah berakhir. Jika berada di shelter, ikuti aturan dan koordinasi setempat.`,
    imageUrl: DEFAULT_IMAGES[4]
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
        --bg-base: #0C1D33;
        --bg-glow-1: rgba(42, 90, 140, 0.45);
        --bg-glow-2: rgba(30, 70, 120, 0.35);
        --glass-bg: linear-gradient(155deg, rgba(52, 84, 122, 0.55) 0%, rgba(33, 58, 92, 0.52) 45%, rgba(17, 33, 58, 0.62) 100%);
        --glass-bg-hover: linear-gradient(155deg, rgba(62, 98, 140, 0.62) 0%, rgba(38, 66, 104, 0.58) 45%, rgba(20, 38, 66, 0.68) 100%);
        --glass-border: rgba(190, 205, 225, 0.26);
        --glass-edge: rgba(225, 233, 245, 0.55);
        --mit-label: #62C2EE;
        --mit-label-border: rgba(86, 170, 215, 0.60);
        --mit-label-bg: rgba(54, 128, 175, 0.14);
        --hover-border: rgba(150, 195, 230, 0.6);
        --hover-title: #DCEFFE;
        --hover-text-2: #C9D5DA;
        --hover-glow: 0 0 0 1px rgba(205, 218, 235, 0.22), 0 14px 32px -12px rgba(120, 160, 205, 0.35);
        --glass-shadow: inset 0 1px 0 var(--glass-edge), 0 12px 28px -12px rgba(4, 12, 24, 0.55);
        --text: #FEFEFE;
        --text-2: #E8EEF3;
        --meta: #E8EEF3;
        --hover-underline: rgba(108, 188, 242, 0.7);
        --track-bg: rgba(255, 255, 255, 0.04);
        --fallback-overlay: linear-gradient(145deg, rgba(12, 29, 51, 0.58), rgba(12, 29, 51, 0.74));
        --glass-fallback: rgba(34, 68, 104, 0.88);
        --glass-hover-fallback: rgba(40, 82, 124, 0.88);
        position: relative;
        isolation: isolate;
        width: 100%;
        background-color: var(--bg-base);
        color: var(--text);
        font-family: inherit;
        overflow: hidden;
        padding: 0;
        border-top: 1px solid var(--glass-border);
        border-bottom: 1px solid var(--glass-border);
      }

      #mitigasi.mitigasi-section::before {
        content: '';
        position: absolute;
        top: -1px;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, var(--glass-edge) 50%, transparent 100%);
        opacity: 0.5;
        pointer-events: none;
      }

      #mitigasi.mitigasi-section::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          radial-gradient(ellipse at 12% 18%, var(--bg-glow-1), transparent 38%),
          radial-gradient(ellipse at 88% 82%, var(--bg-glow-2), transparent 42%);
        pointer-events: none;
      }

      #mitigasi > main {
        position: relative;
        z-index: 1;
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
        margin-bottom: 16px;
      }

      /* HERO SECTION */
      .mit-hero {
        position: relative;
        isolation: isolate;
        padding: clamp(64px, 8vw, 100px) 0 clamp(48px, 6vw, 76px);
      }

      .mit-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background: radial-gradient(420px 260px at 18% 78%, rgba(70, 140, 210, 0.30), transparent 70%);
        pointer-events: none;
      }

      .mit-hero > .mit-container {
        position: relative;
        z-index: 1;
      }

      .mit-hero-grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: clamp(36px, 5vw, 64px);
        align-items: center;
      }

      .mit-hero-title {
        font: 300 clamp(32px, 4.2vw, 56px)/1.08 'Inter', sans-serif;
        letter-spacing: -0.03em;
        color: var(--text);
        margin: 0 0 20px;
      }

      .mit-hero-title-accent {
        color: var(--text);
      }

      .mit-hero-desc {
        font: 400 15px/1.7 'Inter', sans-serif;
        color: var(--text-2);
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
        position: relative;
        isolation: isolate;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 14px 26px;
        border-radius: 999px;
        color: #FEFEFE;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        background: linear-gradient(155deg, rgba(82, 138, 192, 0.55) 0%, rgba(44, 84, 132, 0.48) 50%, rgba(22, 46, 80, 0.58) 100%);
        background-color: rgba(8, 18, 28, 0.40);
        border: 1px solid rgba(190, 205, 225, 0.38);
        backdrop-filter: blur(16px) saturate(140%);
        -webkit-backdrop-filter: blur(16px) saturate(140%);
        box-shadow: inset 0 1px 0 rgba(225, 233, 245, 0.50), 0 12px 28px -12px rgba(4, 12, 24, 0.6);
        transition: transform 0.28s ease-out, border-color 0.28s ease-out, box-shadow 0.28s ease-out;
        cursor: pointer;
      }

      .mit-btn-primary::before,
      .mit-btn-primary::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
      }

      .mit-btn-primary::before {
        z-index: 0;
        background: radial-gradient(120% 90% at 20% 0%, rgba(165, 205, 242, 0.20), transparent 70%);
      }

      .mit-btn-primary::after {
        z-index: 0;
        background: linear-gradient(155deg, rgba(102, 158, 210, 0.66) 0%, rgba(56, 100, 148, 0.58) 50%, rgba(28, 54, 90, 0.68) 100%);
        opacity: 0;
        transition: opacity 0.28s ease-out;
      }

      .mit-btn-primary > * {
        position: relative;
        z-index: 1;
      }

      .mit-btn-primary:hover {
        transform: translateY(-2px);
        border-color: rgba(205, 218, 235, 0.65);
        box-shadow: 0 0 0 1px rgba(205, 218, 235, 0.18), 0 14px 30px -12px rgba(80, 150, 215, 0.45);
      }

      .mit-btn-primary:hover::after,
      .mit-btn-primary:focus-visible::after {
        opacity: 1;
      }

      .mit-btn-primary:focus-visible {
        outline: 2px solid rgba(150, 200, 240, 0.7);
        outline-offset: 3px;
      }

      .mit-btn-primary svg {
        transition: transform 0.25s ease;
      }

      .mit-btn-primary:hover svg {
        transform: translateX(4px);
      }

      .mit-btn-primary:focus-visible svg {
        transform: translateX(4px);
      }

      .mit-hero-stat {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-left: 20px;
        border-left: 1px solid rgba(190, 205, 225, 0.22);
      }

      .mit-stat-num {
        font-size: 28px;
        font-weight: 700;
        color: var(--text);
        line-height: 1;
      }

      .mit-stat-label {
        line-height: 1;
      }

      /* Hero Media */
      .mit-hero-media {
        position: relative;
        isolation: isolate;
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid var(--glass-border);
        background-color: var(--bg-base);
        box-shadow: var(--glass-shadow);
      }

      .mit-hero-img {
        position: relative;
        z-index: 2;
        width: 100%;
        height: 380px;
        object-fit: cover;
        box-sizing: border-box;
        border: 1px solid rgba(190, 205, 225, 0.16);
        box-shadow: 0 10px 24px -10px rgba(4, 12, 24, 0.6);
        display: block;
        filter: brightness(0.85) contrast(1.05);
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .mit-hero-media:hover .mit-hero-img {
        transform: scale(1.03);
      }

      .mit-hero-overlay-card {
        position: absolute;
        isolation: isolate;
        z-index: 2;
        bottom: 20px;
        left: 20px;
        right: 20px;
        padding: 18px 22px;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        backdrop-filter: blur(16px) saturate(135%);
        -webkit-backdrop-filter: blur(16px) saturate(135%);
        box-shadow: var(--glass-shadow);
      }

      .mit-overlay-tag {
        margin-bottom: 6px;
      }

      .mit-overlay-title {
        font-size: 14.5px;
        font-weight: 600;
        color: var(--text);
        line-height: 1.45;
        margin: 0;
      }

      /* INTRODUCTION SECTION */
      .mit-intro {
        position: relative;
        isolation: isolate;
        padding: clamp(60px, 8vw, 92px) 0;
        background: var(--bg-base);
        border-top: 1px solid var(--glass-border);
        border-bottom: 1px solid var(--glass-border);
      }

      .mit-intro::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          radial-gradient(ellipse at 18% 68%, var(--bg-glow-1), transparent 42%),
          radial-gradient(ellipse at 78% 32%, var(--bg-glow-2), transparent 38%),
          radial-gradient(ellipse at 54% 92%, var(--bg-glow-1), transparent 38%);
        pointer-events: none;
      }

      .mit-intro > .mit-container {
        position: relative;
        z-index: 1;
      }

      .mit-intro-header {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
        column-gap: clamp(24px, 5vw, 64px);
        align-items: end;
        max-width: none;
        margin: 0 0 40px;
      }

      .mit-intro-header .mit-eyebrow {
        grid-column: 1 / -1;
      }

      .mit-intro-title {
        grid-column: 1;
        font: 300 32px 'Inter', sans-serif;
        color: var(--text);
        letter-spacing: -0.02em;
        margin: 0;
      }

      .mit-intro-desc {
        grid-column: 2;
        grid-row: 2;
        font: 400 14px/1.6 'Inter', sans-serif;
        color: var(--text-2);
        margin: 0;
      }

      .mit-intro-cards {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        grid-template-rows: repeat(2, minmax(196px, auto));
        gap: 16px;
      }

      .mit-pillar-card {
        position: relative;
        isolation: isolate;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 20px;
        padding: clamp(24px, 3vw, 32px);
        box-shadow: var(--glass-shadow);
        backdrop-filter: blur(16px) saturate(135%);
        -webkit-backdrop-filter: blur(16px) saturate(135%);
        transition: transform 0.28s ease-out, border-color 0.28s ease-out, color 0.28s ease-out;
      }

      .mit-pillar-card::before,
      .mitigasi-card::before,
      .mit-reminder-card::before,
      .mit-hero-overlay-card::before,
      .mit-hero-media::before,
      .mit-nav-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: inherit;
        background: radial-gradient(120% 60% at 20% 0%, rgba(160, 200, 240, 0.14), transparent 70%);
        opacity: 0.55;
        pointer-events: none;
        transition: opacity 0.28s ease-out;
      }

      .mit-pillar-card::after,
      .mitigasi-card::after,
      .mit-reminder-card::after,
      .mit-hero-overlay-card::after,
      .mit-hero-media::after,
      .mit-nav-btn::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        background: var(--glass-bg-hover);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.28s ease-out;
      }

      .mit-pillar-card:hover::after,
      .mit-pillar-card:focus-within::after,
      .mitigasi-card:hover::after,
      .mitigasi-card:focus-visible::after,
      .mit-reminder-card:hover::after,
      .mit-reminder-card:focus-within::after,
      .mit-hero-overlay-card:hover::after,
      .mit-hero-overlay-card:focus-within::after,
      .mit-hero-media:hover::after,
      .mit-nav-btn:hover::after,
      .mit-nav-btn:focus-visible::after {
        opacity: 1;
      }

      .mit-pillar-card:hover::before,
      .mit-pillar-card:focus-within::before,
      .mitigasi-card:hover::before,
      .mitigasi-card:focus-visible::before,
      .mit-reminder-card:hover::before,
      .mit-reminder-card:focus-within::before,
      .mit-hero-overlay-card:hover::before,
      .mit-hero-overlay-card:focus-within::before,
      .mit-hero-media:hover::before,
      .mit-nav-btn:hover::before,
      .mit-nav-btn:focus-visible::before {
        opacity: 1;
      }

      .mit-pillar-card > *,
      .mitigasi-card > *,
      .mit-reminder-card > *,
      .mit-hero-overlay-card > *,
      .mit-nav-btn > * {
        position: relative;
        z-index: 2;
      }

      @media (hover: hover) {
        .mit-intro .mit-pillar-card:hover {
          transform: translateY(-4px);
          border-color: var(--hover-border);
        }

        .mit-intro .mit-pillar-card:hover .mit-pillar-title {
          color: var(--text);
        }

        .mit-intro .mit-pillar-card:hover .mit-pillar-desc,
        .mit-intro .mit-pillar-card:hover .mit-pillar-timeline-text {
          color: var(--hover-text-2);
        }

      }

      .mit-intro .mit-pillar-card:focus-within {
        transform: translateY(-4px);
        border-color: var(--hover-border);
      }

      .mit-intro .mit-pillar-card:focus-within .mit-pillar-title {
        color: var(--text);
      }

      .mit-intro .mit-pillar-card:focus-within .mit-pillar-desc,
      .mit-intro .mit-pillar-card:focus-within .mit-pillar-timeline-text {
        color: var(--hover-text-2);
      }

      .mit-pillar-card:first-child {
        grid-column: 1;
        grid-row: 1 / span 2;
        display: flex;
        flex-direction: column;
      }

      .mit-pillar-card:nth-child(2) {
        grid-column: 2;
        grid-row: 1;
      }

      .mit-pillar-card:nth-child(3) {
        grid-column: 2;
        grid-row: 2;
      }

      .mit-pillar-label {
        width: fit-content;
        margin-bottom: 12px;
      }

      .mit-pillar-title {
        font: 600 16.5px/1.35 'Inter', sans-serif;
        color: var(--text);
        letter-spacing: -0.015em;
        margin: 0 0 8px;
        transition: color 0.28s ease-out;
      }

      .mit-pillar-desc {
        font: 400 13px/1.55 'Inter', sans-serif;
        color: var(--text-2);
        margin: 0 0 20px;
        transition: color 0.28s ease-out;
      }

      .mit-pillar-timeline {
        position: relative;
        display: grid;
        list-style: none;
        padding: 0;
        margin: 24px 0 0;
      }

      .mit-pillar-timeline::before {
        content: '';
        position: absolute;
        top: 8px;
        bottom: 8px;
        left: 5px;
        width: 1px;
        background: var(--mit-label);
      }

      .mit-pillar-timeline li {
        position: relative;
        display: grid;
        grid-template-columns: minmax(112px, 0.42fr) minmax(0, 1fr);
        gap: 16px;
        padding: 0 0 20px 24px;
      }

      .mit-pillar-timeline li:last-child {
        padding-bottom: 0;
      }

      .mit-pillar-timeline li::before {
        content: '';
        position: absolute;
        top: 4px;
        left: 0;
        width: 11px;
        height: 11px;
        border: 2px solid var(--bg-base);
        border-radius: 50%;
        background: var(--mit-label);
      }

      .mit-pillar-timeline-text {
        color: var(--text-2);
        font-size: 13px;
        line-height: 1.5;
        transition: color 0.28s ease-out;
      }

      .mit-pillar-guide-link {
        display: inline-flex;
        width: fit-content;
        margin-top: 16px;
        color: var(--hover-title);
        font-size: 12px;
        font-weight: 600;
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 3px;
      }

      .mit-pillar-guide-link:focus-visible {
        outline: 2px solid var(--hover-title);
        outline-offset: 4px;
        border-radius: 2px;
      }

      @media (max-width: 960px) {
        .mit-intro-cards {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto;
        }

        .mit-intro .mit-pillar-card:first-child,
        .mit-intro .mit-pillar-card:nth-child(2),
        .mit-intro .mit-pillar-card:nth-child(3) {
          grid-column: 1;
          grid-row: auto;
          min-height: 0;
        }
      }

      @supports not (backdrop-filter: blur(1px)) {
        .mit-intro .mit-pillar-card {
          background: var(--glass-fallback);
        }

        @media (hover: hover) {
          .mit-intro .mit-pillar-card:hover {
            background: var(--glass-hover-fallback);
          }
        }

        .mit-intro .mit-pillar-card:focus-within {
          background: var(--glass-hover-fallback);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .mit-intro .mit-pillar-card,
        .mit-intro .mit-pillar-title,
        .mit-intro .mit-pillar-desc,
        .mit-intro .mit-pillar-timeline-text {
          transition: none;
        }

        .mit-intro .mit-pillar-card:hover,
        .mit-intro .mit-pillar-card:focus-within {
          transform: none;
        }
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
        font: 300 32px 'Inter', sans-serif;
        color: var(--text);
        letter-spacing: -0.02em;
        margin: 0 0 10px;
      }

      .mit-guide-desc {
        font: 400 14px/1.6 'Inter', sans-serif;
        color: var(--text-2);
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
        position: relative;
      }

      .mit-nav-buttons {
        display: flex;
        gap: 10px;
      }

      .mit-nav-btn {
        position: relative;
        isolation: isolate;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        color: var(--text);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color 0.22s ease, transform 0.22s ease;
        padding: 0;
        box-shadow: var(--glass-shadow);
        backdrop-filter: blur(16px) saturate(135%);
        -webkit-backdrop-filter: blur(16px) saturate(135%);
      }

      .mit-nav-btn:hover {
        border-color: var(--hover-border);
        transform: translateY(-2px);
      }

      .mit-nav-btn:focus-visible {
        outline: 2px solid var(--hover-title);
        outline-offset: 3px;
      }

      .mit-nav-btn:active {
        transform: translateY(0);
      }

      /* CAROUSEL TRACK */
      .mit-carousel-track {
        display: flex;
        align-items: flex-start;
        gap: 24px;
        overflow-x: auto;
        scroll-behavior: smooth;
        scroll-snap-type: x mandatory;
        margin: -28px -16px -64px;
        padding: 28px 16px 64px;
        scrollbar-width: thin;
        scrollbar-color: var(--glass-border) transparent;
      }

      .mit-carousel-track::-webkit-scrollbar {
        height: 6px;
      }

      .mit-carousel-track::-webkit-scrollbar-track {
        background: var(--track-bg);
        border-radius: 999px;
      }

      .mit-carousel-track::-webkit-scrollbar-thumb {
        background: var(--glass-border);
        border-radius: 999px;
      }

      .mit-carousel-track::-webkit-scrollbar-thumb:hover {
        background: var(--hover-border);
      }

      /* MITIGASI CARD */
      .mitigasi-card {
        position: relative;
        isolation: isolate;
        flex: 0 0 clamp(320px, 31vw, 360px);
        scroll-snap-align: start;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 20px;
        overflow: visible;
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        padding: 24px;
        box-sizing: border-box;
        box-shadow: var(--glass-shadow);
        backdrop-filter: blur(16px) saturate(135%);
        -webkit-backdrop-filter: blur(16px) saturate(135%);
        transition: transform 0.28s ease-out, border-color 0.28s ease-out, box-shadow 0.28s ease-out;
        cursor: pointer;
      }

      .mitigasi-card:focus-visible {
        outline: 2px solid var(--hover-border);
        outline-offset: 4px;
      }

      .mit-card-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      .mit-card-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      .mit-card-meta {
        white-space: nowrap;
      }

      .mit-card-meta {
        text-align: right;
      }

      .mit-card-title {
        font: 600 16.5px/1.35 'Inter', sans-serif;
        letter-spacing: -0.015em;
        color: var(--text);
        margin: 0 0 8px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-decoration: underline;
        text-decoration-color: transparent;
        text-decoration-thickness: 1px;
        text-underline-offset: 4px;
        transition: color 0.28s ease-out, text-decoration-color 0.28s ease-out;
      }

      .mit-card-desc {
        font: 400 13px/1.55 'Inter', sans-serif;
        color: var(--text-2);
        margin: 0;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .mit-card-media {
        position: relative;
        isolation: isolate;
        width: 100%;
        height: 140px;
        margin-top: 20px;
        border-radius: 14px;
        box-sizing: border-box;
        border: 1px solid rgba(190, 205, 225, 0.16);
        box-shadow: 0 10px 24px -10px rgba(4, 12, 24, 0.6);
        background: var(--bg-base);
        transition: height 0.3s ease-out;
      }

      .mit-card-media-item {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 14px;
        object-fit: cover;
        pointer-events: none;
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      }

      .mit-card-media-item--back {
        opacity: var(--rest-op, 0);
        transform: translateY(var(--rest-ty, 0)) scale(var(--rest-sc, 1));
      }

      .mit-card-media-item--back-1 {
        z-index: 1;
      }

      .mit-card-media-item--back-2 {
        z-index: 0;
      }

      .mit-card-img {
        position: relative;
        z-index: 2;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: 14px;
        transition: transform 0.55s ease-out;
      }

      /* Fallback Card Placeholder */
      .mit-card-fallback {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        border-radius: 14px;
        background: var(--fallback-overlay);
      }

      .mit-card-media.is-fallback .mit-card-fallback {
        display: flex;
      }

      .mit-card-media.is-fallback .mit-card-img {
        display: none;
      }

      .mit-fallback-icon-box {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: var(--mit-label-bg);
        border: 1px solid var(--mit-label-border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--mit-label);
      }

      .mit-card-footer-wrap {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.28s ease-out;
      }

      .mit-card-footer {
        min-height: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border-top: 1px solid var(--glass-border);
        padding-top: 0;
        margin-top: 0;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.24s ease-out, transform 0.24s ease-out, padding-top 0.28s ease-out, margin-top 0.28s ease-out;
      }

      .mitigasi-card:focus-visible .mit-card-footer-wrap {
        grid-template-rows: 1fr;
      }

      .mitigasi-card:focus-visible .mit-card-footer {
        padding-top: 14px;
        margin-top: 16px;
        opacity: 1;
        transform: translateY(0);
      }

      .mit-card-dismiss {
        color: var(--meta);
        font-size: 12px;
        font-weight: 500;
      }

      .mit-card-action {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--hover-title);
        font-size: 12px;
        font-weight: 600;
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 3px;
        white-space: nowrap;
      }

      .mit-card-action svg {
        flex: 0 0 auto;
      }

      .mitigasi-card:hover,
      .mitigasi-card:focus-visible {
        transform: translateY(-4px) scale(1.015);
        border-color: var(--hover-border);
        box-shadow: var(--glass-shadow), var(--hover-glow);
      }

      .mitigasi-card:hover .mit-card-title,
      .mitigasi-card:focus-visible .mit-card-title {
        color: var(--hover-title);
        text-decoration-color: var(--hover-underline);
      }

      .mitigasi-card:hover .mit-card-desc,
      .mitigasi-card:focus-visible .mit-card-desc {
        color: var(--hover-text-2);
      }

      .mitigasi-card:hover .mit-card-media,
      .mitigasi-card:focus-visible .mit-card-media {
        height: 205px;
      }

      .mitigasi-card:hover .mit-card-media-item--back-1,
      .mitigasi-card:focus-visible .mit-card-media-item--back-1 {
        opacity: 0.9;
        transform: translate(var(--hover-tx, -7px), var(--hover-ty, -7px)) rotate(var(--hover-rot, -3deg)) scale(var(--hover-sc, 1.04));
      }

      .mitigasi-card:hover .mit-card-media-item--back-2,
      .mitigasi-card:focus-visible .mit-card-media-item--back-2 {
        opacity: 0.72;
        transform: translate(var(--hover-tx, -12px), var(--hover-ty, -11px)) rotate(var(--hover-rot, -6deg)) scale(var(--hover-sc, 1.08));
      }

      .mitigasi-card:hover .mit-card-img,
      .mitigasi-card:focus-visible .mit-card-img {
        transform: scale(1.03);
      }

      .mitigasi-card:hover .mit-card-footer-wrap,
      .mitigasi-card:focus-visible .mit-card-footer-wrap {
        grid-template-rows: 1fr;
      }

      .mitigasi-card:hover .mit-card-footer,
      .mitigasi-card:focus-visible .mit-card-footer {
        padding-top: 14px;
        margin-top: 16px;
        opacity: 1;
        transform: translateY(0);
      }

      @media (prefers-reduced-motion: reduce) {
        .mitigasi-card,
        .mit-card-title,
        .mit-card-img,
        .mit-card-media,
        .mit-card-media-item,
        .mit-card-footer-wrap,
        .mit-card-footer {
          transition: none;
        }

        .mit-card-footer {
          transform: none;
        }

        .mitigasi-card:hover,
        .mitigasi-card:focus-visible {
          transform: none;
        }

        .mitigasi-card:hover .mit-card-img,
        .mitigasi-card:focus-visible .mit-card-img {
          transform: none;
        }

        .mitigasi-card:hover .mit-card-media-item--back,
        .mitigasi-card:focus-visible .mit-card-media-item--back {
          transform: none;
        }
      }

      /* EVACUATION REMINDER SECTION */
      .mit-reminder {
        padding: 0 0 clamp(64px, 8vw, 100px);
      }

      .mit-reminder-card {
        position: relative;
        isolation: isolate;
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
        align-items: center;
        gap: clamp(24px, 5vw, 64px);
        padding: clamp(28px, 4vw, 44px);
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 20px;
        box-shadow: var(--glass-shadow);
        backdrop-filter: blur(16px) saturate(135%);
        -webkit-backdrop-filter: blur(16px) saturate(135%);
      }

      .mit-reminder-body {
        min-width: 0;
      }

      .mit-reminder-eyebrow {
        margin-bottom: 16px;
      }

      .mit-reminder-title {
        font: 300 32px 'Inter', sans-serif;
        color: var(--text);
        letter-spacing: -0.02em;
        margin: 0 0 12px;
      }

      .mit-reminder-desc {
        font: 400 14px/1.6 'Inter', sans-serif;
        color: var(--text-2);
        margin: 0;
      }

      .mit-reminder-steps {
        display: grid;
        gap: 0;
        padding: 0;
        margin: 0;
        list-style: none;
        border-top: 1px solid var(--glass-border);
      }

      .mit-reminder-steps li {
        display: grid;
        grid-template-columns: 36px minmax(0, 1fr);
        align-items: center;
        gap: 12px;
        padding: 14px 0;
        border-bottom: 1px solid var(--glass-border);
        color: var(--text-2);
        font-size: 13px;
        line-height: 1.5;
      }

      /* RESPONSIVE LAYOUT */
      @media (max-width: 960px) {
        .mit-hero-grid {
          grid-template-columns: 1fr;
          gap: 40px;
        }
        .mit-hero-media {
          max-width: 600px;
        }
      }

      @media (max-width: 720px) {
        .mit-reminder-card {
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .mit-intro-header {
          grid-template-columns: 1fr;
          row-gap: 16px;
        }
        .mit-intro-header .mit-eyebrow,
        .mit-intro-title,
        .mit-intro-desc {
          grid-column: 1;
          grid-row: auto;
        }
        .mit-intro-cards {
          grid-template-columns: 1fr;
          grid-template-rows: auto;
        }
        .mit-pillar-card:first-child,
        .mit-pillar-card:nth-child(2),
        .mit-pillar-card:nth-child(3) {
          grid-column: 1;
          grid-row: auto;
        }
        .mit-pillar-card:first-child {
          min-height: 300px;
        }
        .mit-pillar-card:not(:first-child) {
          min-height: 220px;
        }
        .mit-hero-actions {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        .mit-hero-stat {
          padding-left: 0;
          border-left: none;
          border-top: 1px solid rgba(190, 205, 225, 0.22);
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

      @supports not (backdrop-filter: blur(1px)) {
        .mit-btn-primary {
          background: linear-gradient(155deg, rgba(53, 78, 112, 0.90) 0%, rgba(34, 58, 90, 0.88) 50%, rgba(16, 32, 58, 0.90) 100%);
        }

        .mit-hero-overlay-card,
        .mit-pillar-card,
        .mit-nav-btn,
        .mitigasi-card,
        .mit-reminder-card {
          background-color: var(--glass-fallback);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .mit-btn-primary,
        .mit-btn-primary svg,
        .mit-hero-img,
        .mit-pillar-card,
        .mit-nav-btn {
          transition: none;
        }

        .mit-btn-primary:hover,
        .mit-nav-btn:hover {
          transform: none;
        }

        .mit-btn-primary:focus-visible {
          transform: none;
        }

        .mit-btn-primary:hover svg,
        .mit-btn-primary:focus-visible svg {
          transform: none;
        }

        .mit-btn-primary::after {
          transition: none;
        }
      }

      #mitigasi.mitigasi-section .lbl-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid var(--mit-label-border);
        background: var(--mit-label-bg);
        color: var(--mit-label);
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.3;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        white-space: nowrap;
        box-shadow: none;
      }

      #mitigasi.mitigasi-section .lbl-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--mit-label);
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }

      #mitigasi.mitigasi-section .lbl-meta {
        color: #8296A8;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        letter-spacing: 0.04em;
      }

      #mitigasi .mit-card-title {
        color: #FEFEFE;
        transition: color 0.28s ease-out, text-decoration-color 0.28s ease-out;
      }

      @media (hover: hover) {
        #mitigasi .mitigasi-card:hover .mit-card-title {
          color: #6CBCF2;
          text-decoration-color: rgba(108, 188, 242, 0.7);
        }
      }

      #mitigasi .mitigasi-card:focus-visible .mit-card-title {
        color: #6CBCF2;
        text-decoration-color: rgba(108, 188, 242, 0.7);
      }
    </style>

    <main>
      <!-- HERO SECTION -->
      <section class="mit-hero">
        <div class="mit-container">
          <div class="mit-hero-grid">
            <div>
              <div class="mit-eyebrow lbl-eyebrow">
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
                  <span id="mitigasi-total" class="mit-stat-num">-</span>
                  <span class="mit-stat-label lbl-meta">Langkah Panduan<br>Evakuasi</span>
                </div>
              </div>
            </div>

            <div class="mit-hero-media">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                alt="Pesisir pantai dan ombak samudra"
                class="mit-hero-img"
                loading="lazy"
                width="1200"
                height="800"
              />

            </div>
          </div>
        </div>
      </section>


      <!-- INTRODUCTION SECTION -->
      <section class="mit-intro">
        <div class="mit-container">
          <div class="mit-intro-header">
            <div class="mit-eyebrow lbl-eyebrow">
              <span>KENALI ANCAMANNYA</span>
            </div>

            <h2 class="mit-intro-title">
              Mengapa Mitigasi Tsunami Penting?
            </h2>

            <p class="mit-intro-desc">
              Tsunami bisa tiba hanya beberapa menit setelah gempa. Memahami risikonya sejak awal membuat kita bergerak lebih cepat dan lebih tepat.
            </p>
          </div>

          <div class="mit-intro-cards">
            <div class="mit-pillar-card">
              <span class="mit-pillar-label lbl-pill">01 / WAKTU</span>
              <h3 class="mit-pillar-title">Waktunya hanya hitungan menit.</h3>
              <p class="mit-pillar-desc">
                Untuk gempa dekat pantai, gelombang dapat tiba kurang dari 30 menit—kadang sebelum peringatan resmi sampai.
              </p>
              <ol class="mit-pillar-timeline">
                <li>
                  <time class="lbl-meta">00:00</time>
                  <span class="mit-pillar-timeline-text">Gempa terasa</span>
                </li>
                <li>
                  <time class="lbl-meta">Menit awal</time>
                  <span class="mit-pillar-timeline-text">Air laut surut atau naik mendadak</span>
                </li>
                <li>
                  <time class="lbl-meta">Kurang dari 30 mnt</time>
                  <span class="mit-pillar-timeline-text">Gelombang tiba untuk sumber gempa dekat pantai</span>
                </li>
              </ol>
            </div>

            <div class="mit-pillar-card">
              <span class="mit-pillar-label lbl-pill">02 / WILAYAH</span>
              <h3 class="mit-pillar-title">Indonesia berada di jalur rawan.</h3>
              <p class="mit-pillar-desc">
                Indonesia berada di Cincin Api Pasifik, tempat beberapa lempeng bertemu. Tsunami dapat dipicu gempa maupun longsor bawah laut, seperti di Selat Sunda pada 2018.
              </p>
            </div>

            <div class="mit-pillar-card">
              <span class="mit-pillar-label lbl-pill">03 / PERSIAPAN</span>
              <h3 class="mit-pillar-title">Persiapan menentukan hasilnya.</h3>
              <p class="mit-pillar-desc">
                Orang yang sudah tahu jalur dan titik kumpul bisa langsung bergerak tanpa bingung. Panduan di bawah merangkum langkahnya.
              </p>
              <a href="#panduan-evakuasi" data-intro-guide-link class="mit-pillar-guide-link">Lihat panduan</a>
            </div>
          </div>
        </div>
      </section>


      <!-- EVACUATION GUIDE SECTION -->
      <section id="panduan-evakuasi" class="mit-guide-section">
        <div class="mit-container">
          <div class="mit-guide-header">
            <div>
              <div class="mit-eyebrow lbl-eyebrow">
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
              <span id="mitigasi-counter" class="mit-counter lbl-pill">
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
            <div style="flex: 0 0 100%; padding: 48px; text-align: center; color: var(--text-2); background: var(--bg-base); border-radius: 20px; border: 1px solid var(--glass-border);">
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
              <div class="mit-reminder-eyebrow lbl-pill">
                <span>INGAT SELALU</span>
              </div>

              <h2 class="mit-reminder-title">
                Gempa kuat di pesisir? Segera menuju tempat tinggi.
              </h2>

              <p class="mit-reminder-desc">
                Jangan menunggu sirene jika merasakan tanda alami tsunami. Bergeraklah lewat jalur evakuasi dan ikuti arahan petugas setelah tiba di tempat aman.
              </p>
            </div>

            <ol class="mit-reminder-steps">
              <li><span class="mit-reminder-index lbl-meta">01</span><span>Gempa terasa kuat atau berlangsung lama</span></li>
              <li><span class="mit-reminder-index lbl-meta">02</span><span>Segera jauhi pantai dan muara</span></li>
              <li><span class="mit-reminder-index lbl-meta">03</span><span>Naik ke tempat tinggi; jangan tunggu sirene</span></li>
            </ol>
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

  const introGuideLink = section.querySelector('[data-intro-guide-link]');

  if (introGuideLink) {
    introGuideLink.addEventListener('click', event => {
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

  const total = items.length;
  const totalElement = grid.closest('#mitigasi')?.querySelector('#mitigasi-total');

  if (totalElement) {
    totalElement.textContent = String(total);
  }

  if (counter) {
    counter.textContent = `${total} Panduan Evakuasi`;
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

    const imageCandidates = [
      safeImageUrl(item.imageUrl),
      safeImageUrl(DEFAULT_IMAGES[stepNum])
    ].filter((url, index, urls) => url && urls.indexOf(url) === index);
    const image = imageCandidates[0] || '';
    const primaryPath = image ? new URL(image, window.location.origin).pathname : '';
    const stackCandidates = CARD_STACK_COVERS
      .filter(path => path !== primaryPath)
      .map(safeImageUrl);
    const stackStart = ((stepNum - 1) * 2) % stackCandidates.length;
    const rearImages = [
      stackCandidates[stackStart],
      stackCandidates[(stackStart + 1) % stackCandidates.length]
    ];
    const imageAlt = escapeHTML(
      DEFAULT_IMAGE_ALTS[stepNum] || 'Ilustrasi pendukung panduan evakuasi tsunami'
    );
    const imageCandidatesAttribute = escapeHTML(JSON.stringify(imageCandidates));

    return `
      <a
        class="mitigasi-card"
        href="${href}"
        data-id="${itemId}"
        aria-label="Buka panduan: ${itemTitle}"
      >
        <div class="mit-card-content">
          <div class="mit-card-topline">
            <span class="mit-step-badge lbl-pill">${stepLabel}</span>
            <span class="mit-card-meta lbl-meta">Langkah ${escapeHTML(String(stepNum))} dari ${total}</span>
          </div>

          <h3 class="mit-card-title">
            ${itemTitle}
          </h3>

          <p class="mit-card-desc">
            ${itemDescription}
          </p>

          <div
            class="mit-card-media${image ? '' : ' is-fallback'}"
            data-image-candidates="${imageCandidatesAttribute}"
          >
            <img
              src="${rearImages[0]}"
              alt=""
              aria-hidden="true"
              loading="lazy"
              class="mit-card-media-item mit-card-media-item--back mit-card-media-item--back-1"
              style="--rest-sc:.97;--rest-ty:3px;--rest-op:.18;--hover-rot:-3deg;--hover-tx:-7px;--hover-ty:-7px;--hover-sc:1.04;"
            >
            <img
              src="${rearImages[1]}"
              alt=""
              aria-hidden="true"
              loading="lazy"
              class="mit-card-media-item mit-card-media-item--back mit-card-media-item--back-2"
              style="--rest-sc:.94;--rest-ty:6px;--rest-op:.12;--hover-rot:-6deg;--hover-tx:-12px;--hover-ty:-11px;--hover-sc:1.08;"
            >
            ${image ? `
              <img
                src="${image}"
                alt="${imageAlt}"
                loading="lazy"
                width="1200"
                height="675"
                class="mit-card-img"
              >
            ` : ''}
            <div class="mit-card-fallback">
              <div class="mit-fallback-icon-box" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 6c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                </svg>
              </div>
              <span class="mit-fallback-text lbl-eyebrow">SAMUDRA GUIDE</span>
            </div>
          </div>

          <div class="mit-card-footer-wrap">
            <div class="mit-card-footer">
              <span class="mit-card-dismiss">Dismiss</span>
              <span class="mit-card-action">
                Baca selengkapnya
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 3h7v7"/>
                  <path d="M10 14 21 3"/>
                  <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </a>
    `;
  }).join('');

  grid.querySelectorAll('.mit-card-img').forEach(image => {
    const media = image.closest('.mit-card-media');
    const imageCandidates = JSON.parse(media.dataset.imageCandidates || '[]');
    let candidateIndex = 0;
    const showNextImage = () => {
      candidateIndex += 1;

      if (candidateIndex < imageCandidates.length) {
        image.src = imageCandidates[candidateIndex];
        return;
      }

      media.classList.add('is-fallback');
    };

    image.addEventListener('error', showNextImage);
  });


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
