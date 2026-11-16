import {
  fetchArticleById,
  fetchArticles,
  fetchMitigasi
} from '../api.js';
import { getSamudraFooterHTML, attachFooterEvents } from './Footer.js';

// PALET WARNA (SAMUDRA Oceanic Navy & Cyan Glass)
// Background utama: #061426 -> #0f2947 | Surface: rgba(12, 30, 52, 0.86)
// Primary accent: #00d2ff / #38bdf8 | Border: rgba(56, 189, 248, 0.2)
// Primary text: #f8fafc | Secondary text: #cbd5e1 | Muted text: #94a3b8

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
        min-height: 100vh;
        width: 100%;
        position: relative;
        background:
          radial-gradient(ellipse 80% 45% at 50% 0%, var(--color-accent-soft) 0%, transparent 60%),
          linear-gradient(180deg, #0b223d 0%, var(--color-bg) 45%, var(--color-bg-deep) 100%);
        color: var(--color-text);
        font-family: var(--font-sans);
        overflow-x: clip;
      }

      .artp-root::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
          radial-gradient(rgba(0, 210, 255, 0.14) 1.5px, transparent 1.5px),
          linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 36px 36px, 72px 72px, 72px 72px;
        background-position: center top;
        pointer-events: none;
        z-index: 0;
      }

      .artp-nav,
      .artp-main-container,
      .artp-footer {
        position: relative;
        z-index: 1;
      }

      /* TOP NAVBAR — CLEAN DASHBOARD HEADER STYLE (.nav) */
      .artp-nav {
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding: calc(18px + env(safe-area-inset-top, 0px)) clamp(20px, 5vw, 72px) 24px;
        background: linear-gradient(
          180deg,
          rgba(8, 20, 34, 0.86) 0%,
          rgba(8, 20, 34, 0.48) 48%,
          rgba(8, 20, 34, 0.12) 78%,
          transparent 100%
        );
        font: 400 13px var(--font-sans);
        letter-spacing: 0.02em;
        border: none;
        border-bottom: none;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .artp-logo {
        font: 300 var(--text-base) var(--font-sans);
        letter-spacing: 0.45em;
        text-transform: uppercase;
        color: var(--color-text-strong);
        text-decoration: none;
        transition: opacity var(--transition-fast);
      }

      .artp-logo:hover {
        opacity: 0.85;
      }

      .artp-nav-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .artp-btn-back,
      .artp-btn-share {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        color: var(--color-accent);
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        font: 500 var(--text-xs)/1 var(--font-sans);
        cursor: pointer;
        white-space: nowrap;
        transition: all var(--transition-fast);
      }

      .artp-btn-back:hover,
      .artp-btn-share:hover {
        background: var(--color-accent);
        color: var(--color-bg-deep);
        border-color: var(--color-accent);
        box-shadow: var(--shadow-glow);
        transform: translateY(-1px);
      }

      .artp-btn-back svg {
        transition: transform var(--transition-fast);
      }

      .artp-btn-back:hover svg {
        transform: translateX(-2px);
      }

      /* MAIN CONTAINER */
      .artp-main-container {
        width: 100%;
        max-width: var(--container-max);
        margin: 0 auto;
        padding: clamp(32px, 5vw, 64px) var(--container-pad) 96px;
        box-sizing: border-box;
      }

      /* BREADCRUMB */
      .artp-breadcrumb {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12.5px;
        color: var(--color-text-subtle);
        margin-bottom: var(--space-6);
        flex-wrap: wrap;
      }

      .artp-bc-link {
        color: var(--color-accent);
        text-decoration: none;
        cursor: pointer;
        transition: opacity var(--transition-fast);
      }

      .artp-bc-link:hover {
        opacity: 0.82;
        text-decoration: underline;
      }

      .artp-bc-sep {
        color: rgba(148, 163, 184, 0.35);
      }

      .artp-bc-current {
        color: var(--color-text-muted);
        max-width: 320px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* HERO SECTION */
      .artp-hero-header {
        margin-bottom: clamp(32px, 4vw, 44px);
      }

      .artp-category-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: 7px 14px;
        border-radius: var(--radius-pill);
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        color: var(--color-accent);
        font: 600 var(--text-xs)/1 var(--font-mono);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        margin-bottom: var(--space-4);
      }

      .artp-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--color-accent);
        box-shadow: 0 0 8px var(--color-accent);
      }

      .artp-title {
        font-size: clamp(28px, 4.2vw, 46px);
        font-weight: 700;
        line-height: 1.22;
        letter-spacing: -0.025em;
        color: var(--color-text-strong);
        margin: 0 0 var(--space-5);
      }

      /* AUTHOR & METADATA BAR */
      .artp-hero-top-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: var(--space-4);
      }

      .artp-category-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: 7px 14px;
        border-radius: var(--radius-pill);
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        color: var(--color-accent);
        font: 600 var(--text-xs)/1 var(--font-mono);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-bottom: 0;
      }

      .artp-readtime-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 13px;
        border-radius: var(--radius-pill);
        background: rgba(6, 19, 32, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: var(--color-text-muted);
        font: 500 11.5px/1 var(--font-mono);
      }

      .artp-meta-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-5);
        flex-wrap: wrap;
        padding: 4px 0 0;
        background: transparent;
        border: none;
        box-shadow: none;
      }

      .artp-author-box {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .artp-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--color-border-accent);
      }

      .artp-avatar-placeholder {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(0, 210, 255, 0.22) 0%, var(--color-bg-deep) 100%);
        border: 1px solid var(--color-border-accent);
        color: var(--color-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: var(--text-base);
      }

      .artp-author-name {
        font-size: 14.5px;
        font-weight: 600;
        color: var(--color-text-strong);
        margin: 0;
        line-height: 1.3;
      }

      .artp-author-role {
        font: 600 var(--text-xs)/1.2 var(--font-mono);
        color: var(--color-accent);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .artp-meta-details {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        font-size: 13px;
        color: var(--color-text-subtle);
      }

      .artp-meta-dot {
        color: var(--color-accent);
      }

      /* HERO MEDIA / FEATURED IMAGE (CLICKABLE FULL IMAGE) */
      .artp-hero-media {
        width: 100%;
        height: clamp(300px, 48vw, 520px);
        border-radius: 22px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(13, 33, 54, 0.88) 100%);
        margin: clamp(24px, 3.5vw, 36px) 0 clamp(36px, 5vw, 56px);
        box-shadow:
          0 20px 48px rgba(0, 0, 0, 0.38),
          0 0 28px rgba(0, 210, 255, 0.08),
          inset 0 1px 1.5px rgba(255, 255, 255, 0.45);
        position: relative;
      }

      .artp-hero-media--clickable {
        cursor: zoom-in;
      }

      .artp-hero-media::before {
        content: '';
        position: absolute;
        top: 0;
        left: 24px;
        right: 24px;
        height: 1.5px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.65),
          rgba(0, 210, 255, 0.85),
          transparent
        );
        z-index: 4;
        pointer-events: none;
      }

      .artp-hero-media::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(9, 26, 43, 0.08) 0%,
          rgba(9, 26, 43, 0.04) 55%,
          rgba(6, 19, 32, 0.62) 100%
        );
        pointer-events: none;
        z-index: 1;
      }

      .artp-hero-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .artp-hero-media--clickable:hover .artp-hero-img {
        transform: scale(1.03);
      }

      .artp-zoom-pill {
        position: absolute;
        right: 18px;
        bottom: 18px;
        z-index: 3;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 16px;
        border-radius: var(--radius-pill);
        background: rgba(6, 19, 32, 0.84);
        border: 1px solid rgba(0, 210, 255, 0.45);
        color: var(--color-text-strong);
        font: 600 12px/1 var(--font-sans);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), 0 0 16px rgba(0, 210, 255, 0.16);
        transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
        pointer-events: none;
      }

      .artp-hero-media--clickable:hover .artp-zoom-pill {
        background: rgba(0, 210, 255, 0.22);
        border-color: var(--color-accent);
        transform: translateY(-2px);
      }

      .artp-img-caption {
        position: absolute;
        left: 20px;
        bottom: 18px;
        z-index: 3;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 13px;
        border-radius: var(--radius-pill);
        background: rgba(6, 19, 32, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.16);
        color: var(--color-text-muted);
        font: 500 11px/1 var(--font-mono);
        max-width: calc(100% - 240px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
      }

      /* FULLSCREEN IMAGE LIGHTBOX MODAL */
      .artp-lightbox {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: clamp(16px, 3vw, 36px);
        background: rgba(3, 10, 20, 0.92);
        -webkit-backdrop-filter: blur(14px);
        backdrop-filter: blur(14px);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.24s ease, visibility 0.24s ease;
      }

      .artp-lightbox.is-open {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .artp-lightbox__toolbar {
        position: absolute;
        top: clamp(14px, 2.5vw, 24px);
        left: clamp(16px, 3vw, 32px);
        right: clamp(16px, 3vw, 32px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        z-index: 2;
      }

      .artp-lightbox__badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 14px;
        border-radius: var(--radius-pill);
        background: rgba(13, 33, 54, 0.88);
        border: 1px solid rgba(0, 210, 255, 0.4);
        color: var(--color-accent);
        font: 600 11px/1 var(--font-mono);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .artp-lightbox__actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .artp-lightbox__btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 16px;
        border-radius: var(--radius-pill);
        background: rgba(13, 33, 54, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.24);
        color: var(--color-text-strong);
        font: 600 12.5px/1 var(--font-sans);
        text-decoration: none;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .artp-lightbox__btn:hover {
        background: rgba(0, 210, 255, 0.22);
        border-color: var(--color-accent);
        box-shadow: 0 0 18px rgba(0, 210, 255, 0.28);
      }

      .artp-lightbox__stage {
        position: relative;
        max-width: 92vw;
        max-height: 80vh;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.24);
        background: rgba(6, 16, 28, 0.95);
        box-shadow:
          0 28px 70px rgba(0, 0, 0, 0.75),
          0 0 36px rgba(0, 210, 255, 0.14);
        transform: scale(0.96);
        transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .artp-lightbox.is-open .artp-lightbox__stage {
        transform: scale(1);
      }

      .artp-lightbox__img {
        display: block;
        max-width: 92vw;
        max-height: 80vh;
        width: auto;
        height: auto;
        object-fit: contain;
        user-select: none;
      }

      .artp-lightbox__caption {
        margin-top: 14px;
        color: var(--color-text-muted);
        font-size: 13.5px;
        text-align: center;
        max-width: 720px;
      }

      .artp-media-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        background: radial-gradient(circle at 50% 40%, rgba(0, 210, 255, 0.16) 0%, var(--color-bg-deep) 70%);
      }

      .artp-fallback-icon {
        width: 60px;
        height: 60px;
        border-radius: var(--radius-md);
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-accent);
      }

      .artp-fallback-label {
        font: 700 var(--text-xs)/1 var(--font-mono);
        letter-spacing: 0.16em;
        color: var(--color-accent);
        text-transform: uppercase;
      }

      /* EDITORIAL CONTENT AREA */
      .artp-editorial-wrapper {
        max-width: 780px;
        margin: 0 auto;
      }

      .artp-paragraph {
        font-size: clamp(16px, 1.2vw, 17.5px);
        line-height: 1.88;
        color: var(--color-text-muted);
        margin: 0 0 28px;
        white-space: pre-line;
      }

      .artp-subheading {
        font-size: clamp(20px, 2.2vw, 25px);
        font-weight: 700;
        letter-spacing: -0.015em;
        color: var(--color-text-strong);
        margin: 44px 0 var(--space-4);
        line-height: 1.35;
      }

      /* SAMUDRA CALLOUT BOX */
      .artp-callout {
        background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.14) 0%,
            rgba(255, 255, 255, 0.04) 45%,
            rgba(0, 210, 255, 0.09) 100%
          ),
          rgba(13, 33, 54, 0.88);
        border: 1px solid var(--color-border);
        border-left: 4px solid var(--color-accent);
        border-radius: var(--radius-md);
        padding: var(--space-6) 28px;
        margin: 36px 0;
        display: flex;
        gap: 18px;
        align-items: flex-start;
        box-shadow: var(--shadow-card);
      }

      .artp-callout-icon {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-sm);
        background: var(--color-accent-soft);
        border: 1px solid var(--color-border-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-accent);
        flex-shrink: 0;
        margin-top: 2px;
      }

      .artp-callout-body {
        font-size: 14.5px;
        line-height: 1.75;
        color: var(--color-text-muted);
      }

      .artp-callout-body strong {
        color: var(--color-text-strong);
        display: block;
        margin-bottom: 4px;
        font-size: var(--text-base);
      }

      /* SHARE & ACTIONS FOOTER */
      .artp-share-section {
        margin: 56px 0 clamp(56px, 7vw, 84px);
        padding: 28px clamp(20px, 4vw, 36px);
        background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.14) 0%,
            rgba(255, 255, 255, 0.04) 45%,
            rgba(0, 210, 255, 0.09) 100%
          ),
          rgba(13, 33, 54, 0.88);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        box-shadow: var(--shadow-card);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-5);
        flex-wrap: wrap;
      }

      .artp-share-title {
        font-size: var(--text-base);
        font-weight: 700;
        color: var(--color-text-strong);
        margin: 0 0 4px;
      }

      .artp-share-desc {
        font-size: 13px;
        color: var(--color-text-subtle);
        margin: 0;
      }

      .artp-share-buttons {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        flex-wrap: wrap;
      }

      .artp-action-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: 10px 18px;
        border-radius: var(--radius-pill);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .artp-btn-copy {
        background: var(--color-accent);
        border: 1px solid var(--color-border-accent);
        color: var(--color-bg-deep);
        box-shadow: var(--shadow-glow);
      }

      .artp-btn-copy:hover {
        background: var(--color-accent);
        border-color: rgba(255, 255, 255, 0.45);
        box-shadow: 0 6px 22px rgba(0, 210, 255, 0.48);
      }

      .artp-btn-wa {
        background: var(--color-surface-solid);
        border: 1px solid var(--color-border-accent);
        color: var(--color-text-strong);
      }

      .artp-btn-wa:hover {
        background: var(--color-accent-soft-hover);
        border-color: var(--color-accent);
      }

      /* CTA BANNER: SIMULASI & PORTAL RESMI */
      .artp-cta-banner {
        background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.14) 0%,
            rgba(255, 255, 255, 0.04) 45%,
            rgba(0, 210, 255, 0.09) 100%
          ),
          rgba(13, 33, 54, 0.88);
        border: 1px solid var(--color-border);
        border-left: 4px solid var(--color-accent);
        border-radius: var(--radius-card);
        padding: clamp(32px, 5vw, 48px);
        margin: 0 0 clamp(64px, 8vw, 96px);
        text-align: center;
        box-shadow: var(--shadow-card);
      }

      .artp-cta-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font: 700 var(--text-xs)/1 var(--font-mono);
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: var(--space-3);
      }

      .artp-cta-title {
        font-size: clamp(22px, 3.2vw, 30px);
        font-weight: 700;
        color: var(--color-text-strong);
        line-height: 1.35;
        margin: 0 0 var(--space-3);
      }

      .artp-cta-desc {
        font-size: 14.5px;
        line-height: 1.75;
        color: var(--color-text-subtle);
        max-width: 620px;
        margin: 0 auto var(--space-6);
      }

      .artp-cta-actions {
        display: flex;
        justify-content: center;
        gap: 14px;
        flex-wrap: wrap;
      }

      .artp-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        background: var(--color-accent);
        color: var(--color-bg-deep);
        padding: 12px 24px;
        border-radius: var(--radius-pill);
        font-size: var(--text-sm);
        font-weight: 600;
        text-decoration: none;
        border: 1px solid var(--color-border-accent);
        box-shadow: var(--shadow-glow);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .artp-btn-primary:hover {
        background: var(--color-accent);
        color: var(--color-bg-deep);
        border-color: rgba(255, 255, 255, 0.45);
        box-shadow: 0 6px 26px rgba(0, 210, 255, 0.55);
      }

      .artp-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        background: var(--color-surface-solid);
        color: var(--color-text-strong);
        padding: 12px 24px;
        border-radius: var(--radius-pill);
        font-size: var(--text-sm);
        font-weight: 600;
        border: 1px solid var(--color-border-accent);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .artp-btn-secondary:hover {
        background: var(--color-accent-soft-hover);
        color: var(--color-text-strong);
        border-color: var(--color-accent);
      }

      /* ARTIKEL TERKAIT SECTION */
      .artp-related-section {
        margin-top: var(--space-6);
        padding-top: clamp(48px, 6vw, 72px);
        border-top: 1px solid var(--color-border);
      }

      .artp-related-header {
        margin-bottom: clamp(28px, 4vw, 36px);
      }

      .artp-related-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font: 700 var(--text-xs)/1 var(--font-mono);
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 10px;
      }

      .artp-related-title {
        font-size: clamp(24px, 3.2vw, 32px);
        font-weight: 700;
        color: var(--color-text-strong);
        margin: 0 0 10px;
      }

      .artp-related-desc {
        font-size: 14.5px;
        color: var(--color-text-subtle);
        margin: 0;
      }

      /* RELATED ARTICLES CARDS — MATCHING .blog3-post-card OUTSIDE DETAIL */
      .artp-related-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-5);
        align-items: stretch;
      }

      .artp-related-card {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        border-radius: 20px;
        background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.14) 0%,
            rgba(255, 255, 255, 0.04) 45%,
            rgba(0, 210, 255, 0.09) 100%
          ),
          rgba(13, 33, 54, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.22);
        box-shadow:
          0 16px 38px rgba(0, 0, 0, 0.32),
          0 0 22px rgba(0, 210, 255, 0.07),
          inset 0 1px 1.5px rgba(255, 255, 255, 0.42);
        overflow: hidden;
        text-decoration: none;
        color: var(--color-text);
        cursor: pointer;
        box-sizing: border-box;
        contain: layout paint;
        transition:
          transform 0.36s cubic-bezier(0.16, 1, 0.3, 1),
          border-color 0.28s ease,
          box-shadow 0.36s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .artp-related-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 18px;
        right: 18px;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.65),
          rgba(0, 210, 255, 0.75),
          transparent
        );
        z-index: 4;
        pointer-events: none;
      }

      .artp-related-card:hover,
      .artp-related-card:focus-visible {
        transform: translateY(-4px);
        border-color: rgba(0, 210, 255, 0.68);
        box-shadow:
          0 24px 54px rgba(0, 0, 0, 0.46),
          0 0 32px rgba(0, 210, 255, 0.22),
          inset 0 1px 2px rgba(255, 255, 255, 0.62);
      }

      .artp-related-thumb {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background: transparent;
        flex-shrink: 0;
      }

      .artp-related-thumb::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(13, 33, 54, 0.22) 0%,
          transparent 45%
        );
        pointer-events: none;
      }

      .artp-related-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 25%;
        display: block;
        -webkit-mask-image: linear-gradient(180deg, #000 42%, rgba(0, 0, 0, 0.7) 74%, transparent 100%);
        mask-image: linear-gradient(180deg, #000 42%, rgba(0, 0, 0, 0.7) 74%, transparent 100%);
        transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .artp-related-card:hover .artp-related-img {
        transform: scale(1.04);
      }

      .artp-related-readtime {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 3;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: var(--radius-pill);
        background: rgba(6, 19, 32, 0.84);
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: var(--color-text-strong);
        font: 500 11px/1 var(--font-mono);
        letter-spacing: 0.04em;
      }

      .artp-related-body {
        padding: 20px 20px 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex-grow: 1;
      }

      .artp-related-badge {
        display: inline-flex;
        align-items: center;
        padding: 5px 11px;
        border-radius: var(--radius-pill);
        background: rgba(0, 210, 255, 0.14);
        border: 1px solid rgba(0, 210, 255, 0.38);
        font: 600 10.5px/1 var(--font-mono);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 10px;
      }

      .artp-related-card-title {
        margin: 0 0 10px;
        font: 600 16.5px/1.35 var(--font-sans);
        letter-spacing: -0.015em;
        color: var(--color-text-strong);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 2.7em;
        transition: color var(--transition-fast);
      }

      .artp-related-card:hover .artp-related-card-title {
        color: var(--color-accent);
      }

      .artp-related-card-desc {
        margin: 0;
        font: 300 13.5px/1.6 var(--font-sans);
        color: var(--color-text-muted);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 4.6em;
        flex-grow: 1;
      }

      .artp-related-footer {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px 20px;
        margin-top: 12px;
        width: 100%;
        box-sizing: border-box;
      }

      .artp-related-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        border: 1px solid rgba(0, 210, 255, 0.35);
        background: rgba(0, 210, 255, 0.12);
        box-shadow: 0 0 14px rgba(0, 210, 255, 0.16);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font: 600 11px/1 var(--font-mono);
        color: var(--color-accent);
      }

      .artp-related-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .artp-related-author-meta {
        min-width: 0;
        flex: 1;
      }

      .artp-related-author-name {
        margin: 0;
        font: 500 13px/1.3 var(--font-sans);
        color: var(--color-text-strong);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .artp-related-date {
        margin: 2px 0 0;
        font: 400 11.5px/1.2 var(--font-mono);
        color: var(--color-text-subtle);
      }

      .artp-related-arrow {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.04);
        color: var(--color-text-muted);
        flex-shrink: 0;
        transition: all var(--transition-fast);
      }

      .artp-related-card:hover .artp-related-arrow {
        border-color: var(--color-accent);
        background: rgba(0, 210, 255, 0.16);
        color: var(--color-accent);
        transform: translate(1px, -1px);
      }

      /* FOOTER */
      .artp-footer {
        padding: var(--space-8) var(--container-pad);
        background: rgba(6, 18, 34, 0.9);
        border-top: 1px solid var(--color-border);
        color: var(--color-text-subtle);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--space-4);
        font-size: 12.5px;
      }

      .artp-footer a {
        color: var(--color-accent);
        text-decoration: none;
        font-weight: 600;
      }

      .artp-footer a:hover {
        text-decoration: underline;
      }

      @keyframes artp-spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* RESPONSIVE BREAKPOINTS */
      @media (max-width: 960px) {
        .artp-related-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-5);
        }
      }

      @media (max-width: 680px) {
        .artp-nav {
          padding: 14px 18px;
        }
        .artp-logo {
          font-size: 14px;
          letter-spacing: 0.32em;
        }
        .artp-related-grid {
          grid-template-columns: 1fr;
          gap: 18px;
        }
        .artp-share-section {
          flex-direction: column;
          align-items: flex-start;
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
          justify-content: center;
        }
      }
    </style>

    <div class="artp-root">
      <!-- TOP NAVBAR (CLEAN DASHBOARD STYLE) -->
      <header class="artp-nav">
        <a href="/" id="article-nav-logo" class="artp-logo" aria-label="Beranda SAMUDRA">
          SAMUDRA
        </a>

        <div class="artp-nav-actions">
          <button id="article-back-top" class="artp-btn-back" type="button" aria-label="Kembali ke halaman berita">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span>Kembali</span>
          </button>

          <button id="article-share-btn" class="artp-btn-share" type="button" aria-label="Bagikan artikel ini">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span id="share-label">Bagikan</span>
          </button>
        </div>
      </header>

      <!-- MAIN CONTENT SLOT -->
      <main id="article-content-slot" class="artp-main-container">
        <div style="padding: 80px 20px; text-align: center; color: var(--color-text-subtle);">
          <div style="width: 48px; height: 48px; margin: 0 auto 16px; border-radius: 50%; border: 3px solid var(--color-border); border-top-color: var(--color-accent); animation: artp-spin 0.8s linear infinite;"></div>
          Memuat publikasi dan informasi kebencanaan SAMUDRA...
        </div>
      </main>

      <!-- FULLSCREEN IMAGE LIGHTBOX -->
      <div id="artp-lightbox" class="artp-lightbox" role="dialog" aria-modal="true" aria-label="Pratinjau gambar penuh">
        <div class="artp-lightbox__toolbar">
          <span id="artp-lb-badge" class="artp-lightbox__badge">DOKUMENTASI VISUAL</span>
          <div class="artp-lightbox__actions">
            <a id="artp-lb-open" href="#" target="_blank" rel="noopener" class="artp-lightbox__btn">
              <span>Buka Asli</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 17L17 7M7 7h10v10"/>
              </svg>
            </a>
            <button id="artp-lb-close" type="button" class="artp-lightbox__btn" aria-label="Tutup gambar penuh">
              <span>Tutup</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="artp-lightbox__stage">
          <img id="artp-lb-img" class="artp-lightbox__img" src="" alt="" decoding="async">
        </div>
        <p id="artp-lb-caption" class="artp-lightbox__caption"></p>
      </div>

      <!-- FOOTER -->
      <footer class="sfooter" id="artp-footer">
        ${getSamudraFooterHTML({ isArticlePage: true })}
      </footer>
    </div>
  `;

  attachFooterEvents(container.querySelector('#artp-footer'), {
    onNavigateHome: () => {
      if (typeof onBack === 'function') onBack();
    }
  });

  // HANDLER TOMBOL NAVIGASI HEADER
  const backBtn = container.querySelector('#article-back-top');
  const logoBtn = container.querySelector('#article-nav-logo');
  const shareBtn = container.querySelector('#article-share-btn');
  const shareLabel = container.querySelector('#share-label');

  const goHome = event => {
    if (event) event.preventDefault();
    document.body.style.overflow = '';
    if (typeof onBack === 'function') {
      onBack();
    }
  };

  if (backBtn) backBtn.onclick = goHome;
  if (logoBtn) logoBtn.onclick = goHome;

  const contentSlot = container.querySelector('#article-content-slot');
  let articleData = null;
  let allArticlesList = [];

  // PENGAMBILAN DATA ARTIKEL SECARA PARALEL (CEPAT & RINGAN)
  try {
    const [fetchedList, fetchedDetail] = await Promise.all([
      fetchArticles().catch(() => []),
      articleId && String(articleId).length > 10
        ? fetchArticleById(articleId).catch(() => null)
        : Promise.resolve(null)
    ]);
    allArticlesList = Array.isArray(fetchedList) ? fetchedList : [];
    articleData = fetchedDetail;

    // 2. CARI DARI DAFTAR ARTIKEL (ID ATAU SLUG)
    if (!articleData && allArticlesList.length > 0) {
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
          content: mitigation.description,
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
  } catch (error) {
    console.error('Gagal memuat artikel:', error);
  }

  // 4. DATA CADANGAN JIKA TIDAK DITEMUKAN
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
  const coverImage = safeImageUrl(articleData.coverImageUrl);

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

  const defaultRelated = [
    {
      id: 'rel-1',
      title: 'Langkah Evakuasi Mandiri Saat Ancaman Tsunami',
      category: 'PANDUAN EVAKUASI',
      excerpt: 'Ketahui tindakan taktis yang harus segera dilakukan ketika merasakan gempa kuat di wilayah pesisir.',
      dateStr: '14 Nov 2026',
      readTime: '4 Menit Baca',
      authorName: 'Tim Mitigasi SAMUDRA',
      authorInitials: 'TM',
      authorAvatar: '',
      coverImg: '/img/bento-evacuation-route.jpg'
    },
    {
      id: 'rel-2',
      title: 'Bagaimana Sistem Peringatan Dini Tsunami Bekerja?',
      category: 'TEKNOLOGI KEBENCANAAN',
      excerpt: 'Mengenal teknologi sensor seismik pemantauan gempa dan sistem diseminasi peringatan dini BMKG.',
      dateStr: '10 Nov 2026',
      readTime: '5 Menit Baca',
      authorName: 'Divisi Telemetri',
      authorInitials: 'DT',
      authorAvatar: '',
      coverImg: '/img/bento-buoy-warning.jpg'
    },
    {
      id: 'rel-3',
      title: 'Persiapkan Tas Siaga Bencana untuk Keluarga',
      category: 'KESIAPSIAGAAN',
      excerpt: 'Kenali perlengkapan penting dan dokumen darurat yang wajib disiapkan untuk menghadapi bencana.',
      dateStr: '06 Nov 2026',
      readTime: '4 Menit Baca',
      authorName: 'Edukasi SAMUDRA',
      authorInitials: 'ES',
      authorAvatar: '',
      coverImg: '/img/cover-2.jpg'
    }
  ];

  const fallbackRelCovers = [
    '/img/bento-evacuation-route.jpg',
    '/img/bento-buoy-warning.jpg',
    '/img/cover-1.jpg',
    '/img/cover-2.jpg',
  ];

  const makeInitials = (name) => {
    const clean = String(name || 'Tim SAMUDRA').trim();
    const parts = clean.split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : clean.slice(0, 2).toUpperCase();
  };

  const displayRelated = relatedArticles.length > 0
    ? relatedArticles.map((item, idx) => {
      const rawEx = item.content
        ? (item.content.length > 130 ? item.content.slice(0, 130) + '...' : item.content)
        : '';
      const fullExcerpt = !rawEx
        ? 'Dokumentasi laporan lapangan dan publikasi kesiapsiagaan bencana resmi dari database sistem SAMUDRA.3D.'
        : rawEx.length < 45
          ? `${rawEx} — Dokumentasi laporan lapangan dan publikasi kesiapsiagaan bencana yang tersinkronisasi pada kanal informasi SAMUDRA.3D.`
          : rawEx;
      const aName = item.author?.name ? item.author.name.split('_').pop() : 'Rizal Zaky Firmansyah';
      const dStr = item.publishedAt
        ? new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Informasi SAMUDRA';
      return {
        id: item.id || item.slug,
        title: item.title || 'Artikel SAMUDRA',
        category: (item.category || 'Artikel').replace(/_/g, ' ').toUpperCase(),
        excerpt: fullExcerpt,
        dateStr: dStr,
        readTime: '4 Menit Baca',
        authorName: aName,
        authorInitials: makeInitials(aName),
        authorAvatar: item.author?.avatarUrl || '',
        coverImg: item.coverImageUrl || fallbackRelCovers[idx % fallbackRelCovers.length]
      };
    })
    : defaultRelated;

  const estReadMinutes = Math.max(3, Math.min(12, Math.ceil(rawContent.split(/\s+/).length / 130)));

  // RENDER KONTEN DETAIL
  contentSlot.innerHTML = `
    <!-- BREADCRUMB SEDERHANA -->
    <nav class="artp-breadcrumb" aria-label="Breadcrumb">
      <a href="/" class="artp-bc-link artp-bc-home">Beranda</a>
      <span class="artp-bc-sep">/</span>
      <a href="#berita" class="artp-bc-link artp-bc-news">Berita &amp; Edukasi</a>
      <span class="artp-bc-sep">/</span>
      <span class="artp-bc-current">${escapeHTML(title)}</span>
    </nav>

    <!-- 1. HERO ARTIKEL -->
    <header class="artp-hero-header">
      <div class="artp-hero-top-meta">
        <div class="artp-category-badge">
          <span class="artp-badge-dot"></span>
          <span>${escapeHTML(category)}</span>
        </div>
        <span class="artp-readtime-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>${estReadMinutes} Menit Baca</span>
        </span>
      </div>

      <h1 class="artp-title">
        ${escapeHTML(title)}
      </h1>

      <div class="artp-meta-bar">
        <div class="artp-author-box">
          ${avatarUrl
      ? `<img src="${avatarUrl}" alt="${escapeHTML(authorName)}" class="artp-avatar" decoding="async">`
      : `<div class="artp-avatar-placeholder">${escapeHTML(makeInitials(authorName))}</div>`
    }
          <div>
            <p class="artp-author-name">${escapeHTML(authorName)}</p>
            <span class="artp-author-role">${escapeHTML(authorRole)}</span>
          </div>
        </div>

        <div class="artp-meta-details">
          <span>${escapeHTML(dateStr)}</span>
          <span class="artp-meta-dot">&bull;</span>
          <span>Publikasi Terverifikasi</span>
        </div>
      </div>
    </header>

    <!-- GAMBAR UTAMA LANDSCAPE (CLICKABLE LIGHTBOX) -->
    <div
      id="artp-hero-media"
      class="artp-hero-media ${coverImage ? 'artp-hero-media--clickable' : ''}"
      ${coverImage ? 'tabindex="0" role="button" aria-label="Klik untuk melihat gambar ukuran penuh"' : ''}
    >
      ${coverImage
      ? `
            <img
              src="${coverImage}"
              alt="${escapeHTML(title)}"
              class="artp-hero-img"
              decoding="async"
            >
            <span class="artp-img-caption">${escapeHTML(title)}</span>
            <span class="artp-zoom-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              <span>Lihat Gambar Penuh</span>
            </span>
          `
      : `
            <div class="artp-media-fallback" aria-hidden="true">
              <div class="artp-fallback-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 7c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                </svg>
              </div>
              <span class="artp-fallback-label">SAMUDRA INFORMATION</span>
            </div>
          `
    }
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
      <div class="artp-cta-eyebrow">
        <span class="artp-badge-dot"></span>
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
        <div class="artp-related-eyebrow">
          <span class="artp-badge-dot"></span>
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
        ${displayRelated.map((card, rIdx) => {
      const image = safeImageUrl(card.coverImg) || fallbackRelCovers[rIdx % fallbackRelCovers.length];
      const relAvatar = safeImageUrl(card.authorAvatar);

      return `
            <a
              href="?article=${encodeURIComponent(card.id)}"
              data-rel-id="${escapeHTML(card.id)}"
              class="artp-related-card"
              aria-label="Buka artikel terkait: ${escapeHTML(card.title)}"
            >
              <div class="artp-related-thumb">
                <img
                  src="${image}"
                  alt="${escapeHTML(card.title)}"
                  loading="lazy"
                  decoding="async"
                  class="artp-related-img"
                  onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='/img/cover-1.jpg';}"
                >
                <span class="artp-related-readtime">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>${escapeHTML(card.readTime || '4 Menit Baca')}</span>
                </span>
              </div>

              <div class="artp-related-body">
                <span class="artp-related-badge">${escapeHTML(card.category)}</span>
                <h4 class="artp-related-card-title">${escapeHTML(card.title)}</h4>
                <p class="artp-related-card-desc">${escapeHTML(card.excerpt)}</p>
              </div>

              <div class="artp-related-footer">
                <span class="artp-related-avatar">
                  ${relAvatar
          ? `<img src="${relAvatar}" alt="${escapeHTML(card.authorName || 'SAMUDRA')}" loading="lazy" decoding="async">`
          : escapeHTML(card.authorInitials || 'SM')
        }
                </span>
                <div class="artp-related-author-meta">
                  <p class="artp-related-author-name">${escapeHTML(card.authorName || 'Tim SAMUDRA')}</p>
                  <p class="artp-related-date">${escapeHTML(card.dateStr || 'Informasi SAMUDRA')}</p>
                </div>
                <span class="artp-related-arrow" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </span>
              </div>
            </a>
          `;
    }).join('')}
      </div>
    </section>
  `;

  // FULLSCREEN IMAGE LIGHTBOX INTERACTION
  const heroMediaEl = contentSlot.querySelector('#artp-hero-media');
  const lightboxEl = container.querySelector('#artp-lightbox');
  const lbImg = container.querySelector('#artp-lb-img');
  const lbCaption = container.querySelector('#artp-lb-caption');
  const lbBadge = container.querySelector('#artp-lb-badge');
  const lbOpen = container.querySelector('#artp-lb-open');
  const lbClose = container.querySelector('#artp-lb-close');

  const openLightbox = (src, captionText, badgeText) => {
    if (!lightboxEl || !lbImg || !src) return;
    lbImg.src = src;
    lbImg.alt = captionText || title;
    if (lbCaption) lbCaption.textContent = captionText || title;
    if (lbBadge) lbBadge.textContent = badgeText || category;
    if (lbOpen) lbOpen.href = src;
    lightboxEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  if (heroMediaEl && coverImage) {
    heroMediaEl.onclick = () => openLightbox(coverImage, title, category);
    heroMediaEl.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(coverImage, title, category);
      }
    };
  }

  if (lbClose) lbClose.onclick = closeLightbox;
  if (lightboxEl) {
    lightboxEl.onclick = (e) => {
      if (e.target === lightboxEl) closeLightbox();
    };
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxEl && lightboxEl.classList.contains('is-open')) {
      closeLightbox();
    }
  });

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
