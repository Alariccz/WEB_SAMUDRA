import {
  fetchArticleById,
  fetchArticles,
  fetchMitigasi
} from '../api.js';

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
          radial-gradient(ellipse 80% 45% at 50% 0%, rgba(0, 210, 255, 0.11) 0%, transparent 60%),
          linear-gradient(180deg, #0b223d 0%, #07172b 45%, #040d1a 100%);
        color: #f8fafc;
        font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow-x: clip;
      }

      .artp-root::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image:
          radial-gradient(rgba(56, 189, 248, 0.14) 1.5px, transparent 1.5px),
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

      /* TOP STICKY NAVBAR */
      .artp-nav {
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px clamp(20px, 4vw, 48px);
        background: rgba(6, 18, 34, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
      }

      .artp-btn-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(14, 34, 58, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.24);
        color: #f8fafc;
        padding: 9px 18px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .artp-btn-back:hover {
        background: rgba(0, 210, 255, 0.16);
        color: #ffffff;
        border-color: rgba(0, 210, 255, 0.55);
        box-shadow: 0 0 18px rgba(0, 210, 255, 0.2);
        transform: translateX(-3px);
      }

      .artp-btn-back svg {
        transition: transform 0.2s ease;
      }

      .artp-btn-back:hover svg {
        transform: translateX(-2px);
      }

      .artp-logo {
        color: #f8fafc;
        text-decoration: none;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-shadow: 0 0 20px rgba(0, 210, 255, 0.3);
        transition: opacity 0.2s ease;
      }

      .artp-logo:hover {
        opacity: 0.88;
      }

      .artp-btn-share {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(14, 34, 58, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.24);
        color: #f8fafc;
        padding: 9px 18px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .artp-btn-share:hover {
        background: rgba(0, 210, 255, 0.16);
        color: #ffffff;
        border-color: rgba(0, 210, 255, 0.55);
        box-shadow: 0 0 18px rgba(0, 210, 255, 0.2);
        transform: translateY(-2px);
      }

      /* MAIN CONTAINER */
      .artp-main-container {
        width: 100%;
        max-width: 1120px;
        margin: 0 auto;
        padding: clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px) 96px;
        box-sizing: border-box;
      }

      /* BREADCRUMB */
      .artp-breadcrumb {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12.5px;
        color: #64748b;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }

      .artp-bc-link {
        color: #38bdf8;
        text-decoration: none;
        cursor: pointer;
        transition: color 0.2s ease;
      }

      .artp-bc-link:hover {
        color: #7dd3fc;
      }

      .artp-bc-sep {
        color: rgba(148, 163, 184, 0.35);
      }

      .artp-bc-current {
        color: #cbd5e1;
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
        gap: 8px;
        padding: 6px 14px;
        border-radius: 999px;
        background: rgba(0, 210, 255, 0.1);
        border: 1px solid rgba(56, 189, 248, 0.32);
        color: #38bdf8;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-bottom: 16px;
      }

      .artp-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #00d2ff;
        box-shadow: 0 0 8px rgba(0, 210, 255, 0.65);
      }

      .artp-title {
        font-size: clamp(28px, 4.2vw, 46px);
        font-weight: 700;
        line-height: 1.22;
        letter-spacing: -0.025em;
        color: #f8fafc;
        margin: 0 0 20px;
      }

      /* AUTHOR & METADATA BAR */
      .artp-meta-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        padding: 16px 0;
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
      }

      .artp-author-box {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .artp-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(56, 189, 248, 0.38);
      }

      .artp-avatar-placeholder {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(0, 210, 255, 0.22) 0%, rgba(14, 34, 58, 0.92) 100%);
        border: 1px solid rgba(56, 189, 248, 0.4);
        color: #38bdf8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
      }

      .artp-author-name {
        font-size: 14.5px;
        font-weight: 600;
        color: #f8fafc;
        margin: 0;
        line-height: 1.3;
      }

      .artp-author-role {
        font-size: 11.5px;
        color: #38bdf8;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .artp-meta-details {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        color: #94a3b8;
      }

      .artp-meta-dot {
        color: #38bdf8;
      }

      /* HERO MEDIA / FEATURED IMAGE */
      .artp-hero-media {
        width: 100%;
        height: clamp(280px, 46vw, 500px);
        border-radius: 22px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.22);
        background: #0c1e34;
        margin: clamp(28px, 4vw, 44px) 0 clamp(36px, 5vw, 64px);
        box-shadow: 0 24px 56px -12px rgba(0, 0, 0, 0.65), 0 0 36px rgba(0, 210, 255, 0.08);
        position: relative;
      }

      .artp-hero-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: brightness(0.92) contrast(1.03);
      }

      .artp-media-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        background: radial-gradient(circle at 50% 40%, rgba(0, 210, 255, 0.16) 0%, #091a2e 70%);
      }

      .artp-fallback-icon {
        width: 60px;
        height: 60px;
        border-radius: 16px;
        background: rgba(0, 210, 255, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.32);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #38bdf8;
      }

      .artp-fallback-label {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.16em;
        color: #38bdf8;
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
        color: #cbd5e1;
        margin: 0 0 28px;
        white-space: pre-line;
      }

      .artp-subheading {
        font-size: clamp(20px, 2.2vw, 25px);
        font-weight: 700;
        letter-spacing: -0.015em;
        color: #f8fafc;
        margin: 44px 0 16px;
        line-height: 1.35;
      }

      /* SAMUDRA CALLOUT BOX */
      .artp-callout {
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.06) 0%,
          rgba(255, 255, 255, 0.015) 45%,
          rgba(56, 189, 248, 0.08) 100%
        ), rgba(12, 30, 52, 0.86);
        border: 1px solid rgba(56, 189, 248, 0.22);
        border-left: 4px solid #00d2ff;
        border-radius: 16px;
        padding: 24px 28px;
        margin: 36px 0;
        display: flex;
        gap: 18px;
        align-items: flex-start;
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      }

      .artp-callout-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: rgba(0, 210, 255, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.32);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #00d2ff;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .artp-callout-body {
        font-size: 14.5px;
        line-height: 1.75;
        color: #cbd5e1;
      }

      .artp-callout-body strong {
        color: #f8fafc;
        display: block;
        margin-bottom: 4px;
        font-size: 15px;
      }

      /* SHARE & ACTIONS FOOTER */
      .artp-share-section {
        margin: 56px 0 clamp(56px, 7vw, 84px);
        padding: 28px clamp(20px, 4vw, 36px);
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.06) 0%,
          rgba(255, 255, 255, 0.015) 45%,
          rgba(56, 189, 248, 0.08) 100%
        ), rgba(12, 30, 52, 0.86);
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 20px;
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
      }

      .artp-share-title {
        font-size: 15px;
        font-weight: 700;
        color: #f8fafc;
        margin: 0 0 4px;
      }

      .artp-share-desc {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
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
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .artp-btn-copy {
        background: linear-gradient(135deg, #00d2ff 0%, #38bdf8 100%);
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: #041424;
        box-shadow: 0 4px 16px rgba(0, 210, 255, 0.3);
      }

      .artp-btn-copy:hover {
        background: linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%);
        box-shadow: 0 6px 22px rgba(0, 210, 255, 0.48);
        transform: translateY(-2px);
      }

      .artp-btn-wa {
        background: rgba(14, 34, 58, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.28);
        color: #f8fafc;
      }

      .artp-btn-wa:hover {
        background: rgba(0, 210, 255, 0.14);
        border-color: rgba(0, 210, 255, 0.5);
        transform: translateY(-2px);
      }

      /* CTA BANNER: SIMULASI & PORTAL RESMI */
      .artp-cta-banner {
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.07) 0%,
          rgba(255, 255, 255, 0.02) 45%,
          rgba(56, 189, 248, 0.1) 100%
        ), rgba(12, 30, 52, 0.88);
        border: 1px solid rgba(56, 189, 248, 0.24);
        border-left: 4px solid #00d2ff;
        border-radius: 22px;
        padding: clamp(32px, 5vw, 48px);
        margin: 0 0 clamp(64px, 8vw, 96px);
        text-align: center;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.14);
      }

      .artp-cta-eyebrow {
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

      .artp-cta-title {
        font-size: clamp(22px, 3.2vw, 30px);
        font-weight: 700;
        color: #f8fafc;
        line-height: 1.35;
        margin: 0 0 12px;
      }

      .artp-cta-desc {
        font-size: 14.5px;
        line-height: 1.75;
        color: #94a3b8;
        max-width: 620px;
        margin: 0 auto 24px;
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
        gap: 8px;
        background: linear-gradient(135deg, #00d2ff 0%, #38bdf8 100%);
        color: #041424;
        padding: 12px 24px;
        border-radius: 999px;
        font-size: 13.5px;
        font-weight: 600;
        text-decoration: none;
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 4px 20px rgba(0, 210, 255, 0.36);
        cursor: pointer;
        transition: all 0.22s ease;
      }

      .artp-btn-primary:hover {
        background: linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%);
        color: #041424;
        transform: translateY(-2px);
        box-shadow: 0 6px 26px rgba(0, 210, 255, 0.55);
      }

      .artp-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(14, 34, 58, 0.78);
        color: #f8fafc;
        padding: 12px 24px;
        border-radius: 999px;
        font-size: 13.5px;
        font-weight: 600;
        border: 1px solid rgba(56, 189, 248, 0.28);
        cursor: pointer;
        transition: all 0.22s ease;
      }

      .artp-btn-secondary:hover {
        background: rgba(0, 210, 255, 0.14);
        color: #ffffff;
        border-color: rgba(0, 210, 255, 0.52);
        transform: translateY(-2px);
      }

      /* ARTIKEL TERKAIT SECTION */
      .artp-related-section {
        margin-top: 24px;
        padding-top: clamp(48px, 6vw, 72px);
        border-top: 1px solid rgba(56, 189, 248, 0.16);
      }

      .artp-related-header {
        margin-bottom: clamp(28px, 4vw, 36px);
      }

      .artp-related-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #38bdf8;
        margin-bottom: 10px;
      }

      .artp-related-title {
        font-size: clamp(24px, 3.2vw, 32px);
        font-weight: 700;
        color: #f8fafc;
        margin: 0 0 10px;
      }

      .artp-related-desc {
        font-size: 14.5px;
        color: #94a3b8;
        margin: 0;
      }

      .artp-related-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }

      .artp-related-card {
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.06) 0%,
          rgba(255, 255, 255, 0.015) 45%,
          rgba(56, 189, 248, 0.07) 100%
        ), rgba(12, 30, 52, 0.86);
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 18px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        text-decoration: none;
        color: inherit;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        cursor: pointer;
        height: 100%;
      }

      .artp-related-card:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 210, 255, 0.48);
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.55), 0 0 24px rgba(0, 210, 255, 0.14);
      }

      .artp-related-thumb {
        position: relative;
        height: 170px;
        background: #0a1b30;
        overflow: hidden;
      }

      .artp-related-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: brightness(0.9);
        transition: transform 0.4s ease;
      }

      .artp-related-card:hover .artp-related-img {
        transform: scale(1.05);
      }

      .artp-related-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(6, 18, 34, 0.88);
        border: 1px solid rgba(56, 189, 248, 0.35);
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #38bdf8;
      }

      .artp-related-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      .artp-related-date {
        font-size: 11.5px;
        color: #38bdf8;
        margin-bottom: 8px;
      }

      .artp-related-card-title {
        font-size: 16px;
        font-weight: 600;
        color: #f8fafc;
        line-height: 1.45;
        margin: 0 0 10px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .artp-related-card-desc {
        font-size: 13px;
        line-height: 1.65;
        color: #94a3b8;
        margin: 0 0 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex-grow: 1;
      }

      .artp-related-action {
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        padding-top: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #38bdf8;
        font-size: 12.5px;
        font-weight: 600;
        transition: color 0.2s ease;
      }

      .artp-related-card:hover .artp-related-action {
        color: #f8fafc;
      }

      .artp-related-action svg {
        transition: transform 0.25s ease, color 0.25s ease;
      }

      .artp-related-card:hover .artp-related-action svg {
        transform: translateX(4px);
        color: #00d2ff;
      }

      /* FOOTER */
      .artp-footer {
        padding: 32px clamp(20px, 4vw, 48px);
        background: rgba(6, 18, 34, 0.9);
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        color: #94a3b8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        font-size: 12.5px;
      }

      .artp-footer a {
        color: #38bdf8;
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
          gap: 20px;
        }
      }

      @media (max-width: 680px) {
        .artp-nav {
          padding: 12px 18px;
        }
        .artp-logo {
          font-size: 18px;
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
        <div style="padding: 80px 20px; text-align: center; color: #94a3b8;">
          <div style="width: 48px; height: 48px; margin: 0 auto 16px; border-radius: 50%; border: 3px solid rgba(56, 189, 248, 0.18); border-top-color: #00d2ff; animation: artp-spin 0.8s linear infinite;"></div>
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
      dateStr: 'Informasi SAMUDRA',
      coverImg: ''
    },
    {
      id: 'rel-2',
      title: 'Bagaimana Sistem Peringatan Dini Tsunami Bekerja?',
      category: 'TEKNOLOGI KEBENCANAAN',
      excerpt: 'Mengenal teknologi sensor seismik pemantauan gempa dan sistem diseminasi peringatan dini BMKG.',
      dateStr: 'Informasi SAMUDRA',
      coverImg: ''
    },
    {
      id: 'rel-3',
      title: 'Persiapkan Tas Siaga Bencana untuk Keluarga',
      category: 'KESIAPSIAGAAN',
      excerpt: 'Kenali perlengkapan penting dan dokumen darurat yang wajib disiapkan untuk menghadapi bencana.',
      dateStr: 'Informasi SAMUDRA',
      coverImg: ''
    }
  ];

  const displayRelated = relatedArticles.length > 0
    ? relatedArticles.map(item => ({
      id: item.id || item.slug,
      title: item.title || 'Artikel SAMUDRA',
      category: (item.category || 'Artikel').replace(/_/g, ' ').toUpperCase(),
      excerpt: item.content
        ? item.content.slice(0, 115) + (item.content.length > 115 ? '...' : '')
        : 'Informasi dan edukasi kebencanaan resmi dari SAMUDRA.',
      dateStr: formatDate(item.publishedAt),
      coverImg: item.coverImageUrl
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
      <span class="artp-bc-current">${escapeHTML(title)}</span>
    </nav>

    <!-- 1. HERO ARTIKEL -->
    <header class="artp-hero-header">
      <div class="artp-category-badge">
        <span class="artp-badge-dot"></span>
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
            <span class="artp-author-role">${escapeHTML(authorRole)}</span>
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
      ${coverImage
      ? `
            <img
              src="${coverImage}"
              alt="${escapeHTML(title)}"
              class="artp-hero-img"
              loading="lazy"
            >
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
        ${displayRelated.map(card => {
      const image = safeImageUrl(card.coverImg);

      return `
            <a
              href="?article=${encodeURIComponent(card.id)}"
              data-rel-id="${escapeHTML(card.id)}"
              class="artp-related-card"
              aria-label="Buka artikel terkait: ${escapeHTML(card.title)}"
            >
              <div class="artp-related-thumb">
                ${image
          ? `
                      <img
                        src="${image}"
                        alt="${escapeHTML(card.title)}"
                        loading="lazy"
                        class="artp-related-img"
                      >
                    `
          : `
                      <div class="artp-media-fallback" aria-hidden="true">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                          <path d="M2 7c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                          <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                        </svg>
                      </div>
                    `
        }
                <span class="artp-related-badge">${escapeHTML(card.category)}</span>
              </div>

              <div class="artp-related-body">
                <span class="artp-related-date">${escapeHTML(card.dateStr || 'Informasi SAMUDRA')}</span>
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
