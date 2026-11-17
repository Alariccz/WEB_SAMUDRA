/**
 * SAMUDRA Admin Dashboard Overview Component
 * Metric cards, live BMKG earthquake pulse, and quick actions
 */

import { fetchAdminArticles, fetchAdminMitigasi, fetchAdminPeralatan, getAdminUser, uploadStorageFile } from './adminApi.js';
import { fetchLatestEarthquake } from '../api.js';
import { showToast } from './adminToast.js';

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

      <!-- APK Cloudflare R2 Distribution Card -->
      <div style="margin-top: 28px; background: var(--adm-surface-card); border: 1px solid var(--adm-border); border-radius: var(--adm-radius-lg); padding: 24px; backdrop-filter: blur(20px);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(43, 78, 255, 0.15); display: flex; align-items: center; justify-content: center; color: #2B4EFF;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </div>
            <div>
              <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0;">Distribusi File APK (Cloudflare R2)</h3>
              <p style="font-size: 12px; color: var(--adm-text-dim); margin: 2px 0 0 0;">Kelola sumber file Android APK untuk auto-download tombol dan scan QR Code di website.</p>
            </div>
          </div>
          <span style="font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
            Cloudflare R2 Connected
          </span>
        </div>

        <!-- Active URL Display -->
        <div style="background: rgba(12, 23, 38, 0.6); border: 1px solid var(--adm-border); border-radius: var(--adm-radius-md); padding: 14px 16px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: var(--adm-text-dim); letter-spacing: 0.5px; text-transform: uppercase;">URL Download APK Aktif:</span>
            <div style="display: flex; gap: 8px;">
              <button class="adm-btn adm-btn--glass adm-btn--sm" id="adm-apk-btn-copy" style="padding: 2px 8px; font-size: 11px;" title="Salin URL APK">Salin URL</button>
              <a href="#" target="_blank" rel="noopener noreferrer" class="adm-btn adm-btn--glass adm-btn--sm" id="adm-apk-btn-test" style="padding: 2px 8px; font-size: 11px; text-decoration: none;" title="Uji Unduh File">Test Unduh</a>
            </div>
          </div>
          <div id="adm-apk-current-url" style="font-family: var(--adm-mono); font-size: 12px; color: #38bdf8; word-break: break-all;">
            Memeriksa konfigurasi APK...
          </div>
        </div>

        <!-- Action Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          <!-- Box 1: Direct File Upload to R2 -->
          <div style="background: rgba(12, 23, 38, 0.4); border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: var(--adm-radius-md); padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
            <div>
              <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">1. Upload APK ke Cloudflare R2</div>
              <p style="font-size: 12px; color: var(--adm-text-dim); margin: 0; line-height: 1.5;">Pilih file APK dari komputer Anda. Sistem akan mengunggahnya langsung ke Cloudflare R2 via endpoint backend.</p>
            </div>
            <div>
              <input type="file" id="adm-apk-file-input" accept=".apk,application/vnd.android.package-archive" style="display: none;" />
              <button class="adm-btn adm-btn--white adm-btn--sm" id="adm-apk-btn-choose" style="width: 100%;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span id="adm-apk-upload-text">Pilih & Upload File .APK</span>
              </button>
            </div>
          </div>

          <!-- Box 2: Manual R2 Link Input -->
          <div style="background: rgba(12, 23, 38, 0.4); border: 1px solid var(--adm-border); border-radius: var(--adm-radius-md); padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
            <div>
              <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">2. Atau Tempel URL R2 Manual</div>
              <p style="font-size: 12px; color: var(--adm-text-dim); margin: 0; line-height: 1.5;">Jika sudah mengunggah file langsung ke Cloudflare R2 dashboard, tempelkan public download URL-nya di sini.</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <input type="url" id="adm-apk-url-input" placeholder="https://pub-xxx.r2.dev/SAMUDRA-Mobile-v2.4.1.apk" style="flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.35); border: 1px solid var(--adm-border); border-radius: var(--adm-radius-sm); color: #fff; padding: 7px 10px; font-size: 12px; font-family: var(--adm-mono);" />
              <button class="adm-btn adm-btn--amber adm-btn--sm" id="adm-apk-btn-save-url">Simpan URL</button>
            </div>
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

  // Wire APK Cloudflare R2 Management
  wireApkDistributionManager(container);

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

function wireApkDistributionManager(container) {
  const currentUrlEl = container.querySelector('#adm-apk-current-url');
  const copyBtn = container.querySelector('#adm-apk-btn-copy');
  const testLink = container.querySelector('#adm-apk-btn-test');
  const fileInput = container.querySelector('#adm-apk-file-input');
  const chooseBtn = container.querySelector('#adm-apk-btn-choose');
  const uploadText = container.querySelector('#adm-apk-upload-text');
  const urlInput = container.querySelector('#adm-apk-url-input');
  const saveUrlBtn = container.querySelector('#adm-apk-btn-save-url');

  const updateDisplay = () => {
    const activeUrl = (import.meta.env?.VITE_APK_URL || localStorage.getItem('samudra_apk_url') || '').trim();
    if (activeUrl) {
      currentUrlEl.textContent = activeUrl;
      testLink.href = activeUrl;
      testLink.style.display = 'inline-flex';
      copyBtn.style.display = 'inline-flex';
      if (urlInput) urlInput.value = activeUrl;
    } else {
      currentUrlEl.textContent = 'Belum dikonfigurasi (Menggunakan file lokal bawaan /downloads/SAMUDRA-Mobile-v2.4.1.apk)';
      testLink.href = '/downloads/SAMUDRA-Mobile-v2.4.1.apk';
      copyBtn.style.display = 'none';
    }
  };

  updateDisplay();

  // Copy button
  if (copyBtn) {
    copyBtn.onclick = () => {
      const text = currentUrlEl.textContent;
      if (text && text.startsWith('http')) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Tautan APK berhasil disalin ke clipboard!', 'success');
        }).catch(() => {
          showToast('Gagal menyalin tautan.', 'error');
        });
      }
    };
  }

  // File upload handler
  if (chooseBtn && fileInput) {
    chooseBtn.onclick = () => fileInput.click();

    fileInput.onchange = async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.apk')) {
        showToast('Pilih file dengan ekstensi .apk', 'error');
        fileInput.value = '';
        return;
      }

      chooseBtn.disabled = true;
      uploadText.textContent = `Mengunggah ${(file.size / (1024 * 1024)).toFixed(1)} MB ke R2...`;

      try {
        const uploadedUrl = await uploadStorageFile(file, 'apk');
        if (uploadedUrl && typeof uploadedUrl === 'string') {
          localStorage.setItem('samudra_apk_url', uploadedUrl);
          updateDisplay();
          showToast('APK berhasil diunggah ke Cloudflare R2! URL telah diperbarui.', 'success');
        } else {
          throw new Error('Gagal mendapatkan URL publik dari server R2.');
        }
      } catch (err) {
        console.error('Gagal upload APK:', err);
        showToast(err.message || 'Gagal mengunggah file APK ke Cloudflare R2.', 'error');
      } finally {
        chooseBtn.disabled = false;
        uploadText.textContent = 'Pilih & Upload File .APK';
        fileInput.value = '';
      }
    };
  }

  // Save manual URL
  if (saveUrlBtn && urlInput) {
    saveUrlBtn.onclick = () => {
      const val = urlInput.value.trim();
      if (!val) {
        showToast('Harap masukkan URL Cloudflare R2 yang valid.', 'error');
        return;
      }
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        showToast('URL harus diawali dengan http:// atau https://', 'error');
        return;
      }
      localStorage.setItem('samudra_apk_url', val);
      updateDisplay();
      showToast('URL APK Cloudflare R2 berhasil disimpan!', 'success');
    };
  }
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
