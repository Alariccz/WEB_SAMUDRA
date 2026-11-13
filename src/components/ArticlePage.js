import {
  fetchArticleById,
  fetchArticles,
  fetchMitigasi
} from '../api.js';
import { DEFAULT_IMAGES, DEFAULT_MITIGASI } from './Mitigasi.js';

const DEFAULT_COVERS = [
  '/img/cover-1.jpg',
  '/img/cover-2.jpg',
  '/img/cover-3.jpg',
  '/img/cover-4.jpg',
  '/img/bento-evacuation-route.jpg',
  '/img/bento-buoy-warning.jpg',
  '/img/bg-misty-coast.jpg'
];

function stableHash(value = '') {
  let hash = 0;
  for (const character of String(value)) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function getCoverCandidates(primary, key) {
  const start = stableHash(key) % DEFAULT_COVERS.length;
  const fallbackCovers = DEFAULT_COVERS
    .slice(start)
    .concat(DEFAULT_COVERS.slice(0, start))
    .map(safeImageUrl);
  return [...new Set([safeImageUrl(primary), ...fallbackCovers].filter(Boolean))];
}

function getStackImages(primary, key) {
  const primaryPath = primary
    ? new URL(primary, window.location.origin).pathname
    : '';
  const stack = DEFAULT_COVERS.filter(path => path !== primaryPath);
  const start = stableHash(key) % stack.length;
  return [stack[start], stack[(start + 1) % stack.length]].map(safeImageUrl);
}

function attachImageFallbacks(root) {
  root.querySelectorAll('[data-image-candidates]').forEach(image => {
    const candidates = JSON.parse(image.dataset.imageCandidates || '[]');
    let index = Math.max(0, candidates.indexOf(image.getAttribute('src')));
    const advance = () => {
      index += 1;
      if (index < candidates.length) {
        image.src = candidates[index];
        return;
      }

      image.closest('.artp-hero-media, .artp-related-thumb')?.classList.add('is-fallback');
      image.remove();
    };

    image.addEventListener('error', advance);
  });
}

// MENGAMANKAN TEKS DARI API
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

// FORMAT TANGGAL RESMI INDONESIA
function formatDate(date) {
  if (!date) return 'Informasi SAMUDRA';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Informasi SAMUDRA';
  }

  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// SALIN TAUTAN DENGAN FALLBACK
async function copyLink(url) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const success = document.execCommand('copy');
    textarea.remove();

    return success;
  } catch (error) {
    console.error('Gagal menyalin tautan:', error);
    return false;
  }
}

// MAIN ARTICLE PAGE RENDERER
export async function renderArticlePage(container, articleId, onBack) {
  container.innerHTML = `

    <style>
      .artp-root {
        --bg-base: #0C1D33;
        --bg-glow-1: rgba(42, 90, 140, 0.45);
        --bg-glow-2: rgba(30, 70, 120, 0.35);
        --glass-bg: linear-gradient(155deg, rgba(58, 92, 132, 0.46) 0%, rgba(34, 60, 96, 0.42) 48%, rgba(16, 32, 58, 0.52) 100%);
        --glass-bg-hover: linear-gradient(155deg, rgba(68, 106, 148, 0.54) 0%, rgba(38, 68, 106, 0.48) 48%, rgba(18, 36, 64, 0.58) 100%);
        --glass-button-bg: linear-gradient(155deg, rgba(58, 92, 132, 0.36) 0%, rgba(34, 60, 96, 0.32) 48%, rgba(16, 32, 58, 0.42) 100%);
        --glass-border: rgba(190, 205, 225, 0.22);
        --glass-edge: rgba(225, 233, 245, 0.50);
        --art-label: #62C2EE;
        --art-label-border: rgba(86, 170, 215, 0.60);
        --art-label-bg: rgba(54, 128, 175, 0.14);
        --hover-border: rgba(205, 218, 235, 0.55);
        --hover-title: #DCEFFE;
        --hover-glow: 0 0 0 1px rgba(205, 218, 235, 0.22), 0 14px 32px -12px rgba(120, 160, 205, 0.35);
        --text: #FEFEFE;
        --text-2: #E8EEF3;
        --hover-text-2: #C9D5DA;
        --art-meta: #E8EEF3;
        --art-divider: rgba(110, 160, 210, 0.18);
        --glass-shadow: inset 0 1px 0 var(--glass-edge), 0 14px 32px -14px rgba(4, 12, 24, 0.6);
        --hover-underline: rgba(108, 188, 242, 0.7);
        --art-glass-fallback: linear-gradient(155deg, rgba(58, 92, 132, 0.92) 0%, rgba(34, 60, 96, 0.90) 48%, rgba(16, 32, 58, 0.92) 100%);
        --art-fallback-start: #16335A;
        --art-fallback-overlay: linear-gradient(145deg, rgba(12, 29, 51, 0.58), rgba(12, 29, 51, 0.74));
        --art-btn-primary: #3B82B8;
        --art-btn-primary-hover: #4C8FB0;
        --art-action: #6CBCF2;
        position: relative;
        isolation: isolate;
        min-height: 100vh;
        width: 100%;
        overflow-x: hidden;
        background: var(--bg-base);
        color: var(--text);
        font-family: inherit;
      }

      .artp-root::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          radial-gradient(ellipse at 12% 12%, var(--bg-glow-1), transparent 38%),
          radial-gradient(ellipse at 88% 28%, var(--bg-glow-2), transparent 34%),
          radial-gradient(ellipse at 52% 72%, var(--bg-glow-1), transparent 42%);
        pointer-events: none;
      }

      .artp-root > * {
        position: relative;
        z-index: 1;
      }

      .artp-nav {
        position: sticky;
        isolation: isolate;
        overflow: hidden;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px clamp(20px, 4vw, 48px);
        background: var(--glass-bg);
        backdrop-filter: blur(18px) saturate(140%);
        -webkit-backdrop-filter: blur(18px) saturate(140%);
        border: 1px solid var(--glass-border);
        box-shadow: var(--glass-shadow);
      }

      .artp-btn-back,
      .artp-btn-share,
      .artp-btn-copy,
      .artp-btn-wa,
      .artp-btn-secondary {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        background: var(--glass-button-bg);
        backdrop-filter: blur(18px) saturate(140%);
        -webkit-backdrop-filter: blur(18px) saturate(140%);
        border: 1px solid var(--glass-border);
        color: var(--text);
        box-shadow: var(--glass-shadow);
        cursor: pointer;
        transition: transform 0.28s ease-out, border-color 0.28s ease-out, color 0.28s ease-out;
      }

      .artp-btn-back::before,
      .artp-btn-share::before,
      .artp-btn-copy::before,
      .artp-btn-wa::before,
      .artp-btn-secondary::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: inherit;
        background: radial-gradient(120% 70% at 18% 0%, rgba(165, 205, 242, 0.16), transparent 70%);
        pointer-events: none;
      }

      .artp-btn-back > *,
      .artp-btn-share > *,
      .artp-btn-copy > *,
      .artp-btn-wa > *,
      .artp-btn-secondary > * {
        position: relative;
        z-index: 1;
      }

      .artp-btn-back,
      .artp-btn-share {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 18px;
        border-radius: 999px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
      }

      .artp-btn-back svg,
      .artp-btn-share svg,
      .artp-action-btn svg,
      .artp-btn-primary svg,
      .artp-btn-secondary svg {
        flex: 0 0 auto;
        transition: transform 0.28s ease-out;
      }

      .artp-logo {
        color: var(--text);
        text-decoration: none;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.16em;
        transition: opacity 0.28s ease-out;
      }

      .artp-logo:hover {
        opacity: 0.85;
      }

      .artp-main-container {
        position: relative;
        isolation: isolate;
        z-index: 1;
        width: 100%;
        max-width: 1120px;
        margin: 0 auto;
        padding: clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px) 96px;
        box-sizing: border-box;
      }

      .artp-main-container::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          radial-gradient(520px 360px at 12% 18%, rgba(60, 130, 200, 0.34), transparent 70%),
          radial-gradient(620px 420px at 88% 46%, rgba(46, 100, 170, 0.30), transparent 70%),
          radial-gradient(560px 380px at 30% 82%, rgba(80, 150, 215, 0.22), transparent 70%);
        pointer-events: none;
      }

      .artp-main-container > * {
        position: relative;
        z-index: 1;
      }

      .artp-breadcrumb {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 24px;
        flex-wrap: wrap;
        color: var(--art-meta);
        font-size: 12.5px;
      }

      .artp-bc-link {
        color: var(--art-meta);
        text-decoration: none;
        cursor: pointer;
        transition: color 0.28s ease-out;
      }

      .artp-bc-sep {
        color: var(--glass-edge);
      }

      .artp-bc-current {
        max-width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .artp-hero-header {
        margin-bottom: clamp(32px, 4vw, 44px);
      }

      .artp-category-badge {
        margin-bottom: 16px;
      }

      .artp-title {
        margin: 0 0 20px;
        color: var(--text);
        font: 300 clamp(30px, 4.2vw, 46px)/1.12 'Inter', sans-serif;
        letter-spacing: -0.03em;
      }

      .artp-meta-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        padding: 16px 0;
        border-top: 1px solid var(--art-divider);
        border-bottom: 1px solid var(--art-divider);
      }

      .artp-author-box {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .artp-avatar,
      .artp-avatar-placeholder {
        width: 44px;
        height: 44px;
        flex: 0 0 auto;
        border: 1px solid var(--glass-border);
        border-radius: 50%;
      }

      .artp-avatar {
        object-fit: cover;
      }

      .artp-avatar-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--glass-bg);
        box-shadow: var(--glass-shadow);
        color: var(--text);
        font-size: 16px;
        font-weight: 700;
      }

      .artp-author-name {
        margin: 0;
        color: var(--text);
        font-size: 14.5px;
        font-weight: 600;
        line-height: 1.3;
      }

      .artp-meta-details {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-2);
        font-size: 13px;
      }

      .artp-meta-dot {
        color: var(--art-label);
      }

      .artp-hero-media {
        position: relative;
        isolation: isolate;
        width: 100%;
        aspect-ratio: 16 / 9;
        height: auto;
        overflow: hidden;
        border: 1px solid var(--glass-border);
        border-radius: 20px;
        background: var(--glass-bg);
        margin: clamp(28px, 4vw, 44px) 0 clamp(36px, 5vw, 64px);
        box-shadow: var(--glass-shadow);
      }

      .artp-hero-img {
        position: relative;
        z-index: 2;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        box-sizing: border-box;
        border: 1px solid rgba(190, 205, 225, 0.16);
        box-shadow: 0 10px 24px -10px rgba(4, 12, 24, 0.6);
        filter: brightness(0.92);
      }

      .artp-media-fallback {
        display: none;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        background: linear-gradient(145deg, var(--art-fallback-start), var(--bg-base));
        color: var(--art-label);
      }

      .artp-hero-media.is-fallback .artp-media-fallback,
      .artp-related-thumb.is-fallback .artp-media-fallback {
        display: flex;
      }

      .artp-related-thumb .artp-media-fallback {
        background: var(--art-fallback-overlay);
      }

      .artp-fallback-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--art-label);
      }

      .artp-editorial-wrapper {
        max-width: 780px;
        margin: 0 auto;
      }

      .artp-paragraph {
        margin: 0 0 28px;
        color: var(--text-2);
        font-size: clamp(16px, 1.2vw, 17.5px);
        line-height: 1.88;
        white-space: pre-line;
      }

      .artp-subheading {
        margin: 44px 0 16px;
        color: var(--text);
        font-size: clamp(20px, 2.2vw, 25px);
        font-weight: 600;
        letter-spacing: -0.015em;
        line-height: 1.35;
      }

      .artp-callout,
      .artp-share-section,
      .artp-cta-banner,
      .artp-related-card,
      .artp-footer {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        border: 1px solid var(--glass-border);
        background: var(--glass-bg);
        backdrop-filter: blur(18px) saturate(140%);
        -webkit-backdrop-filter: blur(18px) saturate(140%);
        box-shadow: var(--glass-shadow);
      }

      .artp-callout {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        margin: 36px 0;
        padding: 24px 28px;
        border-radius: 16px;
      }

      .artp-callout-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        margin-top: 2px;
        color: var(--art-label);
      }

      .artp-callout-body {
        color: var(--text-2);
        font-size: 14.5px;
        line-height: 1.75;
      }

      .artp-callout-body strong {
        display: block;
        margin-bottom: 4px;
        color: var(--text);
        font-size: 15px;
      }

      .artp-share-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        margin: 56px 0 clamp(56px, 7vw, 84px);
        padding: 28px clamp(20px, 4vw, 36px);
        border-radius: 20px;
      }

      .artp-share-title {
        margin: 0 0 4px;
        color: var(--text);
        font-size: 15px;
        font-weight: 600;
      }

      .artp-share-desc {
        margin: 0;
        color: var(--text-2);
        font-size: 13px;
      }

      .artp-share-buttons {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .artp-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 999px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
      }

      .artp-cta-banner {
        margin: 0 0 clamp(64px, 8vw, 96px);
        padding: clamp(32px, 5vw, 48px);
        border-radius: 22px;
        text-align: center;
      }

      .artp-cta-eyebrow {
        margin-bottom: 12px;
      }

      .artp-cta-title {
        margin: 0 0 12px;
        color: var(--text);
        font-size: clamp(22px, 3.2vw, 30px);
        font-weight: 600;
        line-height: 1.35;
      }

      .artp-cta-desc {
        max-width: 620px;
        margin: 0 auto 24px;
        color: var(--text-2);
        font-size: 14.5px;
        line-height: 1.75;
      }

      .artp-cta-actions {
        display: flex;
        justify-content: center;
        gap: 14px;
        flex-wrap: wrap;
      }

      .artp-btn-primary,
      .artp-btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 999px;
        font: inherit;
        font-size: 13.5px;
        font-weight: 600;
        text-decoration: none;
      }

      .artp-btn-primary {
        border: 1px solid var(--art-btn-primary);
        background: var(--art-btn-primary);
        color: var(--text);
        cursor: pointer;
        transition: transform 0.28s ease-out, background-color 0.28s ease-out, border-color 0.28s ease-out;
      }

      .artp-btn-secondary {
        cursor: pointer;
      }

      .artp-related-section {
        margin-top: 24px;
        padding-top: clamp(48px, 6vw, 72px);
        border-top: 1px solid var(--art-divider);
      }

      .artp-related-header {
        margin-bottom: clamp(28px, 4vw, 36px);
      }

      .artp-related-eyebrow {
        margin-bottom: 10px;
      }

      .artp-related-title {
        margin: 0 0 10px;
        color: var(--text);
        font-size: clamp(24px, 3.2vw, 32px);
        font-weight: 600;
      }

      .artp-related-desc {
        margin: 0;
        color: var(--text-2);
        font-size: 14.5px;
        line-height: 1.65;
      }

      .artp-related-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 24px;
      }

      .artp-related-card {
        display: flex;
        height: 100%;
        min-width: 0;
        flex-direction: column;
        overflow: visible;
        border-radius: 18px;
        color: inherit;
        text-decoration: none;
        box-shadow: var(--glass-shadow);
        transition: transform 0.28s ease-out, border-color 0.28s ease-out, box-shadow 0.28s ease-out;
        cursor: pointer;
      }

      .artp-related-card::before,
      .artp-callout::before,
      .artp-share-section::before,
      .artp-cta-banner::before,
      .artp-footer::before,
      .artp-nav::before,
      .artp-hero-media::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: inherit;
        background: radial-gradient(120% 70% at 18% 0%, rgba(165, 205, 242, 0.16), transparent 70%);
        pointer-events: none;
      }

      .artp-related-card::after,
      .artp-btn-back::after,
      .artp-btn-share::after,
      .artp-btn-copy::after,
      .artp-btn-wa::after,
      .artp-btn-secondary::after {
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

      .artp-btn-back:hover::after,
      .artp-btn-share:hover::after,
      .artp-btn-copy:hover::after,
      .artp-btn-wa:hover::after,
      .artp-btn-secondary:hover::after,
      .artp-btn-back:focus-visible::after,
      .artp-btn-share:focus-visible::after,
      .artp-btn-copy:focus-visible::after,
      .artp-btn-wa:focus-visible::after,
      .artp-btn-secondary:focus-visible::after {
        opacity: 1;
      }

      .artp-related-card:hover::after,
      .artp-related-card:focus-visible::after {
        opacity: 1;
      }

      .artp-related-card > *,
      .artp-callout > *,
      .artp-share-section > *,
      .artp-cta-banner > *,
      .artp-footer > *,
      .artp-nav > *,
      .artp-hero-media > * {
        position: relative;
        z-index: 2;
      }

      .artp-btn-back > *,
      .artp-btn-share > *,
      .artp-btn-copy > *,
      .artp-btn-wa > *,
      .artp-btn-secondary > * {
        z-index: 2;
      }

      .artp-related-thumb {
        position: relative;
        isolation: isolate;
        height: 140px;
        flex: 0 0 auto;
        margin: 0;
        border-radius: 17px 17px 0 0;
        background: var(--bg-base);
        transition: height 0.3s ease-out;
      }

      .artp-related-media-item {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 14px;
        object-fit: cover;
        box-sizing: border-box;
        border: 1px solid rgba(190, 205, 225, 0.16);
        box-shadow: 0 10px 24px -10px rgba(4, 12, 24, 0.6);
        pointer-events: none;
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      }

      .artp-related-media-item--back-1 {
        z-index: 1;
        opacity: var(--rest-op, 0.18);
        transform: translateY(var(--rest-ty, 3px)) scale(var(--rest-sc, 0.97));
      }

      .artp-related-media-item--back-2 {
        z-index: 0;
        opacity: var(--rest-op, 0.12);
        transform: translateY(var(--rest-ty, 6px)) scale(var(--rest-sc, 0.94));
      }

      .artp-related-img {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 17px 17px 0 0;
        object-fit: cover;
        box-sizing: border-box;
        border: 1px solid rgba(190, 205, 225, 0.16);
        box-shadow: 0 10px 24px -10px rgba(4, 12, 24, 0.6);
        transition: transform 0.28s ease-out;
      }

      .artp-related-thumb.is-fallback .artp-related-img {
        display: none;
      }

      .artp-related-badge {
        position: absolute;
        z-index: 4;
        top: 12px;
        left: 12px;
      }

      .artp-related-body {
        position: relative;
        z-index: 3;
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        padding: 20px;
        border-radius: 0 0 17px 17px;
      }

      .artp-related-date {
        display: block;
        margin-bottom: 8px;
      }

      .artp-related-card-title {
        display: -webkit-box;
        overflow: hidden;
        margin: 0 0 10px;
        color: var(--text);
        font-size: 16px;
        font-weight: 600;
        line-height: 1.45;
        text-decoration: underline;
        text-decoration-color: transparent;
        text-decoration-thickness: 1px;
        text-underline-offset: 3px;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        transition: color 0.28s ease-out, text-decoration-color 0.28s ease-out;
      }

      .artp-related-card-desc {
        display: -webkit-box;
        overflow: hidden;
        flex-grow: 1;
        margin: 0 0 16px;
        color: var(--text-2);
        font-size: 13px;
        line-height: 1.65;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        transition: color 0.28s ease-out;
      }

      .artp-related-action {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-height: 0;
        overflow: hidden;
        padding-top: 0;
        border-top: 0 solid var(--art-divider);
        color: var(--text-2);
        font-size: 12.5px;
        font-weight: 600;
        opacity: 0;
        transform: translateY(6px);
        transition: color 0.28s ease-out, max-height 0.28s ease-out, padding-top 0.28s ease-out, border-width 0.28s ease-out, opacity 0.24s ease-out, transform 0.24s ease-out;
      }

      .artp-related-action svg {
        color: currentColor;
        transition: transform 0.28s ease-out, color 0.28s ease-out;
      }

      .artp-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
        padding: 32px clamp(20px, 4vw, 48px);
        color: var(--text-2);
        font-size: 12.5px;
      }

      .artp-footer a {
        color: var(--text);
        font-weight: 600;
        text-decoration: none;
        transition: color 0.28s ease-out;
      }

      .artp-loading {
        padding: 80px 20px;
        color: var(--text-2);
        text-align: center;
      }

      .artp-spinner {
        width: 48px;
        height: 48px;
        margin: 0 auto 16px;
        border: 3px solid var(--glass-border);
        border-top-color: var(--art-label);
        border-radius: 50%;
        animation: artp-spin 0.8s linear infinite;
      }

      @keyframes artp-spin {
        to { transform: rotate(360deg); }
      }

      @media (hover: hover) {
        .artp-btn-back:hover,
        .artp-btn-share:hover,
        .artp-btn-copy:hover,
        .artp-btn-wa:hover,
        .artp-btn-secondary:hover {
          transform: translateY(-2px);
          border-color: var(--hover-border);
        }

        .artp-btn-back:hover svg {
          transform: translateX(-2px);
        }

        .artp-btn-primary:hover {
          transform: translateY(-2px);
          border-color: var(--art-btn-primary-hover);
          background: var(--art-btn-primary-hover);
        }

        .artp-bc-link:hover,
        .artp-footer a:hover {
          color: var(--hover-title);
        }

      }

      .artp-btn-back:focus-visible,
      .artp-btn-share:focus-visible,
      .artp-btn-copy:focus-visible,
      .artp-btn-wa:focus-visible,
      .artp-btn-primary:focus-visible,
      .artp-btn-secondary:focus-visible,
      .artp-bc-link:focus-visible,
      .artp-footer a:focus-visible,
      .artp-related-card:focus-visible {
        outline: 2px solid var(--hover-title);
        outline-offset: 3px;
      }

      .artp-btn-back:focus-visible,
      .artp-btn-share:focus-visible,
      .artp-btn-copy:focus-visible,
      .artp-btn-wa:focus-visible,
      .artp-btn-secondary:focus-visible {
        transform: translateY(-2px);
        border-color: var(--hover-border);
      }

      .artp-btn-primary:focus-visible {
        transform: translateY(-2px);
        border-color: var(--art-btn-primary-hover);
        background: var(--art-btn-primary-hover);
      }

      .artp-bc-link:focus-visible,
      .artp-footer a:focus-visible {
        color: var(--hover-title);
      }

      .artp-related-card:hover,
      .artp-related-card:focus-visible {
        transform: translateY(-4px) scale(1.015);
        border-color: var(--hover-border);
        box-shadow: var(--glass-shadow), var(--hover-glow);
      }

      .artp-share-section:hover,
      .artp-share-section:focus-within,
      .artp-cta-banner:hover,
      .artp-cta-banner:focus-within {
        border-color: rgba(205, 218, 235, 0.55);
      }

      .artp-related-card:hover .artp-related-thumb,
      .artp-related-card:focus-visible .artp-related-thumb {
        height: 205px;
      }

      .artp-related-card:hover .artp-related-card-title,
      .artp-related-card:focus-visible .artp-related-card-title {
        color: var(--hover-title);
        text-decoration-color: var(--hover-underline);
      }

      .artp-related-card:hover .artp-related-card-desc,
      .artp-related-card:focus-visible .artp-related-card-desc {
        color: var(--hover-text-2);
      }

      .artp-related-card:hover .artp-related-media-item--back-1,
      .artp-related-card:focus-visible .artp-related-media-item--back-1 {
        opacity: 0.9;
        transform: translate(var(--hover-tx, -7px), var(--hover-ty, -7px)) rotate(var(--hover-rot, -3deg)) scale(var(--hover-sc, 1.04));
      }

      .artp-related-card:hover .artp-related-media-item--back-2,
      .artp-related-card:focus-visible .artp-related-media-item--back-2 {
        opacity: 0.72;
        transform: translate(var(--hover-tx, -12px), var(--hover-ty, -11px)) rotate(var(--hover-rot, -6deg)) scale(var(--hover-sc, 1.08));
      }

      .artp-related-card:hover .artp-related-img,
      .artp-related-card:focus-visible .artp-related-img {
        transform: scale(1.03);
      }

      .artp-related-card:hover .artp-related-action,
      .artp-related-card:focus-visible .artp-related-action {
        max-height: 48px;
        padding-top: 14px;
        border-top-width: 1px;
        opacity: 1;
        transform: translateY(0);
        color: var(--hover-title);
      }

      .artp-related-card:hover .artp-related-action svg,
      .artp-related-card:focus-visible .artp-related-action svg {
        transform: translateX(4px);
      }

      .artp-btn-back:hover,
      .artp-btn-share:hover,
      .artp-btn-copy:hover,
      .artp-btn-wa:hover,
      .artp-btn-secondary:hover,
      .artp-btn-back:focus-visible,
      .artp-btn-share:focus-visible,
      .artp-btn-copy:focus-visible,
      .artp-btn-wa:focus-visible,
      .artp-btn-secondary:focus-visible {
        transform: translateY(-2px);
        border-color: var(--hover-border);
      }

      @supports not (backdrop-filter: blur(1px)) {
        .artp-nav {
          background: var(--art-glass-fallback);
        }

        .artp-btn-back,
        .artp-btn-share,
        .artp-btn-copy,
        .artp-btn-wa,
        .artp-btn-secondary,
        .artp-callout,
        .artp-share-section,
        .artp-cta-banner,
        .artp-related-card,
        .artp-footer {
          background: var(--art-glass-fallback);
        }
      }

      @media (max-width: 960px) {
        .artp-related-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
      }

      @media (max-width: 680px) {
        .artp-nav {
          gap: 8px;
          padding: 12px clamp(12px, 4vw, 20px);
        }

        .artp-btn-back,
        .artp-btn-share {
          gap: 6px;
          padding: 8px 11px;
          font-size: 12px;
        }

        .artp-logo {
          font-size: 16px;
          letter-spacing: 0.12em;
        }

        .artp-main-container {
          padding: 28px 20px 72px;
        }

        .artp-related-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 18px;
        }

        .artp-share-section {
          flex-direction: column;
          align-items: flex-start;
          padding: 24px 20px;
        }

        .artp-share-buttons {
          width: 100%;
        }

        .artp-action-btn {
          flex: 1;
          justify-content: center;
        }

        .artp-cta-actions {
          flex-direction: column;
          width: 100%;
        }

        .artp-cta-actions button {
          width: 100%;
        }

        .artp-footer {
          padding: 24px 20px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .artp-root *,
        .artp-root *::before,
        .artp-root *::after {
          scroll-behavior: auto !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        .artp-btn-back:hover,
        .artp-btn-share:hover,
        .artp-btn-copy:hover,
        .artp-btn-wa:hover,
        .artp-btn-primary:hover,
        .artp-btn-secondary:hover,
        .artp-related-card:hover,
        .artp-btn-back:focus-visible,
        .artp-btn-share:focus-visible,
        .artp-btn-copy:focus-visible,
        .artp-btn-wa:focus-visible,
        .artp-btn-primary:focus-visible,
        .artp-btn-secondary:focus-visible,
        .artp-related-card:focus-visible {
          transform: none;
        }

        .artp-btn-back:hover svg,
        .artp-related-card:hover .artp-related-action svg,
        .artp-related-card:focus-visible .artp-related-action svg,
        .artp-related-card:hover .artp-related-img,
        .artp-related-card:focus-visible .artp-related-img,
        .artp-related-card:hover .artp-related-media-item,
        .artp-related-card:focus-visible .artp-related-media-item {
          transform: none;
        }
      }

      .artp-root .lbl-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid var(--art-label-border);
        background: var(--art-label-bg);
        color: var(--art-label);
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.3;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        white-space: nowrap;
        box-shadow: none;
      }

      .artp-root .lbl-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--art-label);
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }

      .artp-root .lbl-meta {
        color: #8296A8;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        letter-spacing: 0.04em;
      }
    </style>

    <div class="artp-root">
      <!-- TOP STICKY NAVBAR -->
      <header class="artp-nav">
        <button id="article-back-top" class="artp-btn-back" type="button" aria-label="Kembali ke halaman berita">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span>Kembali</span>
        </button>

        <a href="/" id="article-nav-logo" class="artp-logo" aria-label="Beranda SAMUDRA">
          SAMUDRA
        </a>

        <button id="article-share-btn" class="artp-btn-share" type="button" aria-label="Bagikan artikel ini">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span id="share-label">Bagikan</span>
        </button>
      </header>

      <!-- MAIN CONTENT SLOT -->
      <main id="article-content-slot" class="artp-main-container">
        <div class="artp-loading">
          <div class="artp-spinner" aria-hidden="true"></div>
          Memuat publikasi dan informasi kebencanaan SAMUDRA...
        </div>
      </main>

      <!-- FOOTER -->
      <footer class="artp-footer">
        <span>SAMUDRA.3D &mdash; Sistem Informasi Mitigasi dan Edukasi Bencana Tsunami</span>
        <span>
          Data resmi:
          <a href="https://www.bmkg.go.id" target="_blank" rel="noopener">bmkg.go.id</a>
        </span>
      </footer>
    </div>
  `;

  // HANDLER TOMBOL NAVIGASI HEADER
  const backBtn = container.querySelector('#article-back-top');
  const logoBtn = container.querySelector('#article-nav-logo');
  const shareBtn = container.querySelector('#article-share-btn');
  const shareLabel = container.querySelector('#share-label');

  const goHome = event => {
    if (event) event.preventDefault();
    if (typeof onBack === 'function') {
      onBack();
    }
  };

  if (backBtn) backBtn.onclick = goHome;
  if (logoBtn) logoBtn.onclick = goHome;

  const contentSlot = container.querySelector('#article-content-slot');
  let articleData = null;
  let allArticlesList = [];

  // PENGAMBILAN DATA ARTIKEL
  try {
    allArticlesList = await fetchArticles().catch(() => []);

    // 1. CARI BERDASARKAN ID DI DETAIL API
    if (articleId && String(articleId).length > 10) {
      try {
        articleData = await fetchArticleById(articleId);
      } catch (err) {
        console.warn('Gagal mengambil detail artikel spesifik:', err);
      }
    }

    // 2. CARI DARI DAFTAR ARTIKEL (ID ATAU SLUG)
    if (!articleData && Array.isArray(allArticlesList)) {
      articleData = allArticlesList.find(item =>
        item.id === articleId || item.slug === articleId
      );
    }

    // 3. CARI DARI DATA MITIGASI JIKA MERUPAKAN LANGKAH MITIGASI
    if (!articleData) {
      const allMitigasi = await fetchMitigasi().catch(() => []);
      const mitigation = Array.isArray(allMitigasi)
        ? allMitigasi.find(item => item.id === articleId)
        : null;

      if (mitigation) {
        articleData = {
          id: mitigation.id,
          title: mitigation.title,
          content: mitigation.content || mitigation.description,
          category: `Langkah Mitigasi ${mitigation.stepNumber || ''}`,
          coverImageUrl: mitigation.imageUrl,
          author: {
            name: 'Tim Mitigasi SAMUDRA',
            role: 'SOP TANGGAP DARURAT'
          },
          publishedAt: mitigation.createdAt
        };
      }
    }

    // 4. Cari panduan bawaan saat artikel berasal dari tautan card default.
    if (!articleData) {
      const mitigation = DEFAULT_MITIGASI.find(item => item.id === articleId);
      if (mitigation) {
        articleData = {
          id: mitigation.id,
          title: mitigation.title,
          content: mitigation.content || mitigation.description,
          category: `Langkah Mitigasi ${mitigation.stepNumber}`,
          coverImageUrl: mitigation.imageUrl || DEFAULT_IMAGES[mitigation.stepNumber],
          author: {
            name: 'Tim Mitigasi SAMUDRA',
            role: 'SOP TANGGAP DARURAT'
          }
        };
      }
    }
  } catch (error) {
    console.error('Gagal memuat artikel:', error);
  }

  // 5. DATA CADANGAN JIKA TIDAK DITEMUKAN
  if (!articleData) {
    articleData = {
      title: 'Memahami Gempa Megathrust dan Potensi Tsunami',
      category: 'Edukasi Tsunami',
      publishedAt: new Date().toISOString(),
      author: {
        name: 'Tim Edukasi SAMUDRA',
        role: 'EDUKASI KEBENCANAAN'
      },
      content: `Gempa megathrust merupakan gempa bumi yang terjadi pada zona pertemuan lempeng tektonik yang saling menunjam di dasar samudra.

Jika gempa bawah laut menyebabkan perubahan deformasi vertikal pada dasar laut, perpindahan massa air laut yang masif dapat menghasilkan rangkaian gelombang tsunami dahsyat yang melaju dengan kecepatan tinggi menuju daratan pesisir.

Masyarakat yang tinggal dan beraktivitas di wilayah pesisir wajib memahami potensi ancaman, mengenali tanda-tanda alam seperti surutnya air laut secara drastis setelah gempa kuat, serta mengetahui jalur evakuasi menuju tempat aman yang lebih tinggi.

Peringatan dini dan informasi potensi tsunami harus selalu dipantau melalui kanal resmi BMKG dan BPBD setempat guna memastikan tindakan evakuasi berjalan tertib, cepat, dan terarah.`
    };
  }

  // NORMALISASI PROPERTI ARTIKEL
  const title = articleData.title || 'Publikasi Edukasi SAMUDRA';
  const category = articleData.category
    ? articleData.category.replace(/_/g, ' ').toUpperCase()
    : 'EDUKASI TSUNAMI';
  const dateStr = formatDate(articleData.publishedAt);

  const authorName = articleData.author?.name
    ? articleData.author.name.split('_').pop()
    : 'Tim Edukasi SAMUDRA';

  const authorRole = articleData.author?.role
    ? articleData.author.role.replace(/_/g, ' ').toUpperCase()
    : 'KONTRIBUTOR SAMUDRA';

  const avatarUrl = safeImageUrl(articleData.author?.avatarUrl);
  const coverCandidates = getCoverCandidates(
    articleData.coverImageUrl,
    articleData.id || articleData.slug || articleData.title || articleId
  );
  const coverImage = coverCandidates[0] || '';
  const coverCandidatesAttribute = escapeHTML(JSON.stringify(coverCandidates));

  // URL UNTUK DIBAGIKAN
  const shareArticleId = articleData.id || articleData.slug || articleId;
  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set('article', shareArticleId);
  const articleShareUrl = shareUrl.toString();

  // EVENT SHARE TOP BUTTON
  if (shareBtn) {
    shareBtn.onclick = async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: title,
            text: `Baca artikel kebencanaan ini di SAMUDRA: ${title}`,
            url: articleShareUrl
          });
        } else {
          const success = await copyLink(articleShareUrl);
          if (success && shareLabel) {
            shareLabel.textContent = 'Disalin ✓';
            setTimeout(() => {
              shareLabel.textContent = 'Bagikan';
            }, 2500);
          } else {
            alert('Tautan disalin ke clipboard: ' + articleShareUrl);
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Gagal membagikan artikel:', err);
        }
      }
    };
  }

  // PEMBAGIAN KONTEN PARAGRAF EDITORIAL
  const rawContent = articleData.content || 'Konten edukasi dan panduan resmi dari SAMUDRA.';
  const paragraphs = rawContent
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  // ARTIKEL TERKAIT (DARI DATA ASLI API, MENGECUALIKAN ARTIKEL INI)
  const relatedArticles = Array.isArray(allArticlesList)
    ? allArticlesList
      .filter(item => item.id !== articleData.id && item.slug !== articleData.slug)
      .slice(0, 3)
    : [];

  const defaultRelatedPool = [
    '/img/cover-2.jpg',
    '/img/cover-3.jpg',
    '/img/bento-buoy-warning.jpg'
  ];

  const defaultRelated = [
    {
      id: 'rel-1',
      title: 'Langkah Evakuasi Mandiri Saat Ancaman Tsunami',
      category: 'PANDUAN EVAKUASI',
      excerpt: 'Ketahui tindakan taktis yang harus segera dilakukan ketika merasakan gempa kuat di wilayah pesisir.',
      dateStr: 'Informasi SAMUDRA',
      coverImg: '/img/bento-evacuation-route.jpg'
    },
    {
      id: 'rel-2',
      title: 'Bagaimana Sistem Peringatan Dini Tsunami Bekerja?',
      category: 'TEKNOLOGI KEBENCANAAN',
      excerpt: 'Mengenal teknologi sensor seismik pemantauan gempa dan sistem diseminasi peringatan dini BMKG.',
      dateStr: 'Informasi SAMUDRA',
      coverImg: '/img/bento-buoy-warning.jpg'
    },
    {
      id: 'rel-3',
      title: 'Persiapkan Tas Siaga Bencana untuk Keluarga',
      category: 'KESIAPSIAGAAN',
      excerpt: 'Kenali perlengkapan penting dan dokumen darurat yang wajib disiapkan untuk menghadapi bencana.',
      dateStr: 'Informasi SAMUDRA',
      coverImg: '/img/cover-4.jpg'
    }
  ];

  const displayRelated = relatedArticles.length > 0
    ? relatedArticles.map((item, index) => ({
      id: item.id || item.slug,
      title: item.title || 'Artikel SAMUDRA',
      category: (item.category || 'Artikel').replace(/_/g, ' ').toUpperCase(),
      excerpt: item.content
        ? item.content.slice(0, 115) + (item.content.length > 115 ? '...' : '')
        : 'Informasi dan edukasi kebencanaan resmi dari SAMUDRA.',
      dateStr: formatDate(item.publishedAt),
      coverImg: item.coverImageUrl || defaultRelatedPool[index % defaultRelatedPool.length]
    }))
    : defaultRelated;

  // RENDER KONTEN DETAIL
  contentSlot.innerHTML = `
    <!-- BREADCRUMB SEDERHANA -->
    <nav class="artp-breadcrumb" aria-label="Breadcrumb">
      <a href="/" class="artp-bc-link artp-bc-home">Beranda</a>
      <span class="artp-bc-sep">/</span>
      <a href="#berita" class="artp-bc-link artp-bc-news">Berita</a>
      <span class="artp-bc-sep">/</span>
      <span class="artp-bc-current lbl-meta">${escapeHTML(title)}</span>
    </nav>

    <!-- 1. HERO ARTIKEL -->
    <header class="artp-hero-header">
      <div class="artp-category-badge lbl-pill">
        <span>${escapeHTML(category)}</span>
      </div>

      <h1 class="artp-title">
        ${escapeHTML(title)}
      </h1>

      <div class="artp-meta-bar">
        <div class="artp-author-box">
          ${avatarUrl
      ? `<img src="${avatarUrl}" alt="${escapeHTML(authorName)}" class="artp-avatar">`
      : `<div class="artp-avatar-placeholder">${escapeHTML(authorName.charAt(0).toUpperCase())}</div>`
    }
          <div>
            <p class="artp-author-name">${escapeHTML(authorName)}</p>
            <span class="artp-author-role lbl-meta">${escapeHTML(authorRole)}</span>
          </div>
        </div>

        <div class="artp-meta-details">
          <span>${escapeHTML(dateStr)}</span>
          <span class="artp-meta-dot">&bull;</span>
          <span>Edukasi Resmi</span>
        </div>
      </div>
    </header>

    <!-- GAMBAR UTAMA LANDSCAPE -->
    <div class="artp-hero-media">
      <img
        src="${coverImage}"
        data-image-candidates="${coverCandidatesAttribute}"
        alt="${escapeHTML(title)}"
        class="artp-hero-img"
        loading="lazy"
      >
      <div class="artp-media-fallback" aria-hidden="true">
        <div class="artp-fallback-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            <path d="M2 7c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          </svg>
        </div>
        <span class="artp-fallback-label lbl-eyebrow">SAMUDRA INFORMATION</span>
      </div>
    </div>

    <!-- 2. KONTEN ARTIKEL EDITORIAL -->
    <article class="artp-editorial-wrapper">
      ${paragraphs.map((para, index) => {
      let blockHtml = `<p class="artp-paragraph">${escapeHTML(para)}</p>`;

      // Sisipkan callout penekanan edukasi mitigasi di paragraf awal
      if (index === 0 && paragraphs.length > 1) {
        blockHtml += `
            <div class="artp-callout">
              <div class="artp-callout-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div class="artp-callout-body">
                <strong>Prinsip Utama Keselamatan</strong>
                Jika merasakan guncangan gempa kuat atau berlangsung lama di tepi pantai, segera lakukan evakuasi mandiri menuju wilayah yang lebih tinggi tanpa menunggu sirine atau peringatan resmi.
              </div>
            </div>
          `;
      }

      return blockHtml;
    }).join('')}

      <!-- 3. NAVIGASI BERBAGI & INFORMASI TAMBAHAN -->
      <div class="artp-share-section">
        <div>
          <h3 class="artp-share-title">Bagikan Informasi Ini</h3>
          <p class="artp-share-desc">Tingkatkan kesiapsiagaan keluarga dan rekan di sekitar Anda.</p>
        </div>

        <div class="artp-share-buttons">
          <button id="share-copy-btn" class="artp-action-btn artp-btn-copy" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span id="copy-btn-label">Salin Tautan</span>
          </button>

          <button id="share-wa-btn" class="artp-action-btn artp-btn-wa" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </article>

    <!-- BANNER CTA EDUKASI -->
    <section class="artp-cta-banner">
      <div class="artp-cta-eyebrow lbl-eyebrow">
        <span>SIAGA & TANGGAP</span>
      </div>

      <h2 class="artp-cta-title">
        Kenali Risiko, Persiapkan Evakuasi.
      </h2>

      <p class="artp-cta-desc">
        Tingkatkan pemahaman spasial wilayah pesisir dan pelajari jalur penyelamatan melalui modul simulasi 3D interaktif SAMUDRA.
      </p>

      <div class="artp-cta-actions">
        <button id="banner-action-home" class="artp-btn-primary" type="button">
          <span>Buka Simulasi 3D</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        <button id="banner-action-back" class="artp-btn-secondary" type="button">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span>Kembali ke Berita</span>
        </button>
      </div>
    </section>

    <!-- 4. ARTIKEL TERKAIT -->
    <section class="artp-related-section">
      <div class="artp-related-header">
        <div class="artp-related-eyebrow lbl-eyebrow">
          <span>JELAJAHI INFORMASI</span>
        </div>

        <h2 class="artp-related-title">
          Artikel Terkait
        </h2>

        <p class="artp-related-desc">
          Rekomendasi warta dan publikasi kebencanaan pilihan untuk memperluas pemahaman mitigasi tsunami.
        </p>
      </div>

      <div class="artp-related-grid">
        ${displayRelated.map(card => {
      const candidates = getCoverCandidates(card.coverImg, card.id || card.title);
      const image = candidates[0];
      const stackImages = getStackImages(image, card.id || card.title);

      return `
            <a
              href="?article=${encodeURIComponent(card.id)}"
              data-rel-id="${escapeHTML(card.id)}"
              class="artp-related-card"
              aria-label="Buka artikel terkait: ${escapeHTML(card.title)}"
            >
              <div class="artp-related-thumb">
                <img src="${stackImages[0]}" alt="" aria-hidden="true" loading="lazy" class="artp-related-media-item artp-related-media-item--back-1" style="--rest-sc:.97;--rest-ty:3px;--rest-op:.18;--hover-rot:-3deg;--hover-tx:-7px;--hover-ty:-7px;--hover-sc:1.04;">
                <img src="${stackImages[1]}" alt="" aria-hidden="true" loading="lazy" class="artp-related-media-item artp-related-media-item--back-2" style="--rest-sc:.94;--rest-ty:6px;--rest-op:.12;--hover-rot:-6deg;--hover-tx:-12px;--hover-ty:-11px;--hover-sc:1.08;">
                <img
                  src="${image}"
                  data-image-candidates="${escapeHTML(JSON.stringify(candidates))}"
                  alt="${escapeHTML(card.title)}"
                  loading="lazy"
                  class="artp-related-img"
                >
                <div class="artp-media-fallback" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                    <path d="M2 7c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                    <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  </svg>
                  <span class="artp-fallback-label lbl-eyebrow">SAMUDRA INFORMATION</span>
                </div>
                <span class="artp-related-badge lbl-pill">${escapeHTML(card.category)}</span>
              </div>

              <div class="artp-related-body">
                <span class="artp-related-date lbl-meta">${escapeHTML(card.dateStr || 'Informasi SAMUDRA')}</span>
                <h4 class="artp-related-card-title">${escapeHTML(card.title)}</h4>
                <p class="artp-related-card-desc">${escapeHTML(card.excerpt)}</p>
                <div class="artp-related-action">
                  <span>Baca Selengkapnya</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </a>
          `;
    }).join('')}
      </div>
    </section>
  `;

  attachImageFallbacks(contentSlot);

  // BREADCRUMB EVENT LISTENERS
  const bcHome = contentSlot.querySelector('.artp-bc-home');
  const bcNews = contentSlot.querySelector('.artp-bc-news');

  if (bcHome) bcHome.onclick = goHome;
  if (bcNews) bcNews.onclick = goHome;

  // SALIN LINK
  const copyBtn = contentSlot.querySelector('#share-copy-btn');
  const copyBtnLabel = contentSlot.querySelector('#copy-btn-label');

  if (copyBtn) {
    copyBtn.onclick = async () => {
      const success = await copyLink(articleShareUrl);
      if (success && copyBtnLabel) {
        copyBtnLabel.textContent = 'Tautan Disalin ✓';
        setTimeout(() => {
          copyBtnLabel.textContent = 'Salin Tautan';
        }, 2500);
      } else {
        alert('Tautan artikel: ' + articleShareUrl);
      }
    };
  }

  // SHARE KE WHATSAPP
  const waBtn = contentSlot.querySelector('#share-wa-btn');

  if (waBtn) {
    waBtn.onclick = () => {
      const shareText = `Baca publikasi mitigasi bencana di SAMUDRA:\n\n*${title}*\n\n${articleShareUrl}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };
  }

  // CTA SIMULASI & KEMBALI
  const bannerHomeBtn = contentSlot.querySelector('#banner-action-home');
  const bannerBackBtn = contentSlot.querySelector('#banner-action-back');

  if (bannerHomeBtn) {
    bannerHomeBtn.onclick = () => {
      goHome();
      setTimeout(() => {
        const simulation = document.getElementById('simulasi');
        if (simulation) {
          simulation.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
    };
  }

  if (bannerBackBtn) {
    bannerBackBtn.onclick = goHome;
  }

  // NAVIGASI ARTIKEL TERKAIT
  contentSlot.querySelectorAll('[data-rel-id]').forEach(card => {
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
      const relatedId = card.getAttribute('data-rel-id');

      if (typeof window.__navigateToArticle === 'function') {
        window.__navigateToArticle(relatedId);
      }
    });
  });

  // SCROLL OTOMATIS KE PALING ATAS SETELAH RENDER
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  });
}
