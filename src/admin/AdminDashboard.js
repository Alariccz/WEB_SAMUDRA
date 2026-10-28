/**
 * SAMUDRA Admin Dashboard Overview Component
 * Metric cards, live BMKG earthquake pulse, and quick actions
 */

import { fetchAdminArticles, fetchAdminMitigasi, fetchAdminPeralatan, getAdminUser } from './adminApi.js';
import { fetchLatestEarthquake } from '../api.js';

export function renderAdminDashboard(container, navigateToTab, onOpenArticleModal, onOpenMitigasiModal) {
  container.innerHTML = `
    <div>
      <!-- View Title & Welcome Banner -->
      <div class="adm-view-title-bar">
        <div class="adm-view-title-bar__left">
          <div class="adm-star-badge" style="margin-bottom: 10px;">
            <span class="adm-star-badge__star">●</span>
            <span id="adm-eq-badge">Memeriksa status BMKG...</span>
          </div>
          <h1 id="adm-dash-greeting">Pusat Kendali SAMUDRA</h1>
          <p>Pantau data mitigasi darurat, artikel panduan warga, dan status konektivitas sensor.</p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="adm-btn adm-btn--amber" id="adm-dash-btn-mitigasi">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <span>+ Tambah Mitigasi</span>
          </button>
          <button class="adm-btn adm-btn--white" id="adm-dash-btn-article">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>+ Tulis Artikel</span>
          </button>
        </div>
      </div>

      <!-- Overview Metrics Grid -->
      <div class="adm-metrics-grid">
        <!-- Metric 1: Articles -->
        <div class="adm-metric-card adm-metric-card--cyan">
          <div class="adm-metric-card__glow"></div>
          <div class="adm-metric-card__header">
            <span class="adm-metric-card__title">Total Artikel</span>
            <div class="adm-metric-card__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
          </div>
          <div class="adm-metric-card__val" id="metric-articles-count">--</div>
          <div class="adm-metric-card__sub" id="metric-articles-sub">Memuat statistik artikel...</div>
        </div>

        <!-- Metric 2: Mitigasi -->
        <div class="adm-metric-card adm-metric-card--amber">
          <div class="adm-metric-card__glow"></div>
          <div class="adm-metric-card__header">
            <span class="adm-metric-card__title">Langkah Mitigasi</span>
            <div class="adm-metric-card__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="adm-metric-card__val" id="metric-mitigasi-count">--</div>
          <div class="adm-metric-card__sub">Langkah SOP evakuasi mandiri aktif</div>
        </div>

        <!-- Metric 3: Peralatan Siaga -->
        <div class="adm-metric-card adm-metric-card--emerald">
          <div class="adm-metric-card__glow"></div>
          <div class="adm-metric-card__header">
            <span class="adm-metric-card__title">Peralatan Siaga</span>
            <div class="adm-metric-card__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
          </div>
          <div class="adm-metric-card__val" id="metric-peralatan-count">--</div>
          <div class="adm-metric-card__sub">Item perlengkapan tanggap bencana</div>
        </div>

        <!-- Metric 4: Live BMKG Seismic Sensor -->
        <div class="adm-metric-card adm-metric-card--cyan">
          <div class="adm-metric-card__glow"></div>
          <div class="adm-metric-card__header">
            <span class="adm-metric-card__title">BMKG Terkini</span>
            <div class="adm-metric-card__icon" style="color: #38bdf8;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>
            </div>
          </div>
          <div class="adm-metric-card__val" id="metric-eq-mag" style="font-size: 32px;">--</div>
          <div class="adm-metric-card__sub" id="metric-eq-loc">Memeriksa data seismik BMKG...</div>
        </div>
      </div>

      <!-- Quick Content Overview Split -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px;">
        
        <!-- Left: Recent Articles List -->
        <div style="background: var(--adm-surface-card); border: 1px solid var(--adm-border); border-radius: var(--adm-radius-lg); padding: 24px; backdrop-filter: blur(20px);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0;">Artikel Terbaru</h3>
            <button class="adm-btn adm-btn--glass adm-btn--sm" id="adm-dash-view-all-articles">Semua Artikel &rarr;</button>
          </div>
          <div id="adm-dash-articles-list" style="display: flex; flex-direction: column; gap: 12px;">
            <div style="text-align: center; padding: 24px 0; color: var(--adm-text-dim); font-size: 13px;">Memuat artikel...</div>
          </div>
        </div>

        <!-- Right: Mitigasi SOP List -->
        <div style="background: var(--adm-surface-card); border: 1px solid var(--adm-border); border-radius: var(--adm-radius-lg); padding: 24px; backdrop-filter: blur(20px);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0;">Langkah Mitigasi Lapangan</h3>
            <button class="adm-btn adm-btn--glass adm-btn--sm" id="adm-dash-view-all-mitigasi">Semua Langkah &rarr;</button>
          </div>
          <div id="adm-dash-mitigasi-list" style="display: flex; flex-direction: column; gap: 12px;">
            <div style="text-align: center; padding: 24px 0; color: var(--adm-text-dim); font-size: 13px;">Memuat mitigasi...</div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Hook navigation buttons
  container.querySelector('#adm-dash-btn-article').onclick = () => {
    if (onOpenArticleModal) onOpenArticleModal();
  };
  container.querySelector('#adm-dash-btn-mitigasi').onclick = () => {
    if (onOpenMitigasiModal) onOpenMitigasiModal();
  };
  container.querySelector('#adm-dash-view-all-articles').onclick = () => {
    if (navigateToTab) navigateToTab('articles');
  };
  container.querySelector('#adm-dash-view-all-mitigasi').onclick = () => {
    if (navigateToTab) navigateToTab('mitigasi');
  };

  // Set greeting with user name if available
  const user = getAdminUser();
  if (user && user.name) {
    const greetingEl = container.querySelector('#adm-dash-greeting');
    if (greetingEl) {
      greetingEl.textContent = `Selamat Bertugas, ${user.name.split(' ')[0]}`;
    }
  }

  // Load metrics and lists
  loadMetricsAndLists(container);
}

async function loadMetricsAndLists(container) {
  // 1. Articles
  try {
    const articles = await fetchAdminArticles();
    if (Array.isArray(articles)) {
      container.querySelector('#metric-articles-count').textContent = articles.length;
      const published = articles.filter(a => a.status === 'published').length;
      const draft = articles.length - published;
      container.querySelector('#metric-articles-sub').textContent = `${published} Terbit • ${draft} Draft`;

      // Render top 4 recent articles
      const listEl = container.querySelector('#adm-dash-articles-list');
      if (articles.length === 0) {
        listEl.innerHTML = `<div style="text-align: center; padding: 24px 0; color: var(--adm-text-dim); font-size: 13px;">Belum ada artikel. Klik tombol di atas untuk menulis.</div>`;
      } else {
        listEl.innerHTML = articles.slice(0, 4).map(art => {
          const isPub = art.status === 'published';
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: rgba(12, 23, 38, 0.5); border: 1px solid var(--adm-border); border-radius: var(--adm-radius-md);">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${art.title || 'Tanpa Judul'}</div>
                <div style="font-size: 11px; color: var(--adm-text-dim);">${art.category || 'Umum'} • ${art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('id-ID') : 'Draft'}</div>
              </div>
              <span class="adm-card__status-badge ${isPub ? 'adm-card__status-badge--published' : 'adm-card__status-badge--draft'}" style="position: static; font-size: 10px; padding: 3px 8px;">
                ${isPub ? 'Terbit' : 'Draft'}
              </span>
            </div>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.warn('Gagal memuat artikel:', err);
    container.querySelector('#metric-articles-count').textContent = '0';
  }

  // 2. Mitigasi
  try {
    const mitigasi = await fetchAdminMitigasi();
    if (Array.isArray(mitigasi)) {
      container.querySelector('#metric-mitigasi-count').textContent = mitigasi.length;
      const listEl = container.querySelector('#adm-dash-mitigasi-list');
      if (mitigasi.length === 0) {
        listEl.innerHTML = `<div style="text-align: center; padding: 24px 0; color: var(--adm-text-dim); font-size: 13px;">Belum ada langkah mitigasi.</div>`;
      } else {
        const sorted = [...mitigasi].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0));
        listEl.innerHTML = sorted.slice(0, 4).map(item => `
          <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: rgba(12, 23, 38, 0.5); border: 1px solid var(--adm-border); border-radius: var(--adm-radius-md);">
            <span style="font-family: var(--adm-mono); font-size: 11px; font-weight: 700; color: var(--adm-cyan); background: rgba(0, 210, 255, 0.12); padding: 3px 8px; border-radius: 6px;">
              0${item.stepNumber || 1}
            </span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
              <div style="font-size: 11px; color: var(--adm-text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.description || 'Instruksi evakuasi darurat'}</div>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.warn('Gagal memuat mitigasi:', err);
    container.querySelector('#metric-mitigasi-count').textContent = '0';
  }

  // 3. Peralatan Siaga
  try {
    const peralatan = await fetchAdminPeralatan();
    if (Array.isArray(peralatan)) {
      container.querySelector('#metric-peralatan-count').textContent = peralatan.length;
    }
  } catch (err) {
    container.querySelector('#metric-peralatan-count').textContent = '0';
  }

  // 4. Live Earthquake from BMKG
  try {
    const eq = await fetchLatestEarthquake();
    if (eq) {
      container.querySelector('#adm-eq-badge').textContent = `Sensor Aktif • Wilayah ${eq.Wilayah || 'Indonesia'}`;
      container.querySelector('#metric-eq-mag').textContent = `M ${eq.Magnitude || '5.0+'}`;
      container.querySelector('#metric-eq-loc').textContent = `${eq.Wilayah || 'Pesisir Indonesia'} (${eq.Jam || 'Hari ini'})`;
    }
  } catch (err) {
    container.querySelector('#adm-eq-badge').textContent = 'BMKG Feed Siaga';
    container.querySelector('#metric-eq-mag').textContent = 'Normal';
    container.querySelector('#metric-eq-loc').textContent = 'Pemantauan seismik aktif';
  }
}
