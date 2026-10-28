/**
 * SAMUDRA Admin Mitigasi Management Component
 * Styled with WoodNest dark moody luxury aesthetics
 * Full CRUD for SOP mitigasi tsunami with step numbering and Cloudflare R2 media upload
 */

import { fetchAdminMitigasi, createMitigasi, updateMitigasi, deleteMitigasi, uploadStorageFile } from './adminApi.js';
import { showToast } from './adminToast.js';

let mitigasiState = [];

export function renderAdminMitigasi(container) {
  container.innerHTML = `
    <div>
      <!-- Top Title & Action Bar -->
      <div class="adm-view-title-bar">
        <div class="adm-view-title-bar__left">
          <h1>Kelola Langkah Mitigasi</h1>
          <p>Atur panduan taktis langkah-demi-langkah (SOP) saat terjadi gempa dan potensi tsunami di pesisir.</p>
        </div>
        <div>
          <button class="adm-btn adm-btn--amber" id="adm-btn-create-mitigasi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <span>+ Tambah Langkah Mitigasi</span>
          </button>
        </div>
      </div>

      <!-- Information Banner -->
      <div style="background: rgba(14, 27, 45, 0.55); border: 1px solid var(--adm-border); border-radius: var(--adm-radius-md); padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(0, 210, 255, 0.15); color: var(--adm-cyan); display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 600; color: #ffffff;">Urutan Langkah Standar (SOP)</div>
            <div style="font-size: 12px; color: var(--adm-text-dim);">Langkah akan ditampilkan berurutan sesuai nomor tahapan pada carousel website publik.</div>
          </div>
        </div>
        <div style="font-family: var(--adm-mono); font-size: 12px; color: var(--adm-cyan);" id="mitigasi-total-badge">
          Memuat data...
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="adm-cards-grid" id="adm-mitigasi-grid">
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--adm-text-dim);">
          <svg class="adm-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
          <div style="margin-top: 12px; font-size: 14px;">Memuat langkah mitigasi...</div>
        </div>
      </div>

      <!-- Modal Container -->
      <div id="adm-mitigasi-modal-root"></div>
    </div>
  `;

  const btnCreate = container.querySelector('#adm-btn-create-mitigasi');
  const modalRoot = container.querySelector('#adm-mitigasi-modal-root');

  btnCreate.onclick = () => {
    const nextStep = mitigasiState.length > 0 ? Math.max(...mitigasiState.map(m => m.stepNumber || 0)) + 1 : 1;
    openMitigasiModal(modalRoot, null, nextStep, () => loadMitigasi(container));
  };

  loadMitigasi(container);
}

// Expose open modal for dashboard shortcut
export function openCreateMitigasiModalDirectly(container) {
  const modalRoot = container.querySelector('#adm-mitigasi-modal-root') || container;
  const nextStep = mitigasiState.length > 0 ? Math.max(...mitigasiState.map(m => m.stepNumber || 0)) + 1 : 1;
  openMitigasiModal(modalRoot, null, nextStep, () => loadMitigasi(container));
}

async function loadMitigasi(container) {
  const grid = container.querySelector('#adm-mitigasi-grid');
  const totalBadge = container.querySelector('#mitigasi-total-badge');

  try {
    const data = await fetchAdminMitigasi();
    mitigasiState = Array.isArray(data) ? [...data].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0)) : [];
    
    if (totalBadge) {
      totalBadge.textContent = `${mitigasiState.length} Langkah Terdaftar`;
    }

    renderMitigasiCards(container);
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: var(--adm-radius-lg);">
        <p style="color: #fb7185; font-size: 14px; margin: 0 0 14px;">Gagal memuat langkah mitigasi: ${err.message}</p>
        <button class="adm-btn adm-btn--glass adm-btn--sm" id="btn-retry-mit">Coba Lagi</button>
      </div>
    `;
    const retry = grid.querySelector('#btn-retry-mit');
    if (retry) retry.onclick = () => loadMitigasi(container);
  }
}

function renderMitigasiCards(container) {
  const grid = container.querySelector('#adm-mitigasi-grid');
  const modalRoot = container.querySelector('#adm-mitigasi-modal-root');

  if (mitigasiState.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 64px 20px; color: var(--adm-text-dim);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">Belum Ada Langkah Mitigasi</div>
        <div style="font-size: 13px;">Klik tombol "+ Tambah Langkah Mitigasi" untuk menambahkan instruksi pertama.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = mitigasiState.map(item => {
    const stepNum = item.stepNumber || 1;
    const stepLabel = `LANGKAH 0${stepNum}`;
    const fallbackThumb = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%2304121d"/><circle cx="200" cy="125" r="50" stroke="%2300d2ff" stroke-width="1.5" fill="none"/><text x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="%2338ef7d" font-family="sans-serif" font-size="14">SOP LANGKAH 0${stepNum}</text></svg>`;
    const imgUrl = item.imageUrl || fallbackThumb;

    return `
      <div class="adm-card" data-id="${item.id}">
        <div class="adm-card__thumb">
          <img class="adm-card__img" src="${imgUrl}" alt="${item.title}" loading="lazy" onerror="this.src='${fallbackThumb}'">
          <div class="adm-card__thumb-overlay"></div>
          <span class="adm-card__step-badge">${stepLabel}</span>
        </div>
        <div class="adm-card__body">
          <h3 class="adm-card__title">${item.title}</h3>
          <p class="adm-card__desc">${item.description || 'Instruksi tindakan kesiapsiagaan tanggap darurat.'}</p>
          
          <div class="adm-card__footer">
            <div class="adm-card__meta">
              <span class="adm-card__meta-primary">Urutan SOP #${stepNum}</span>
              <span class="adm-card__meta-secondary">${item.iconName ? `Ikon: ${item.iconName}` : 'Standar Pesisir'}</span>
            </div>
            <div class="adm-card__actions">
              <button class="adm-btn adm-btn--glass adm-btn--sm btn-edit-mit" data-id="${item.id}" title="Edit Langkah">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Edit</span>
              </button>
              <button class="adm-btn adm-btn--danger adm-btn--sm btn-delete-mit" data-id="${item.id}" title="Hapus Langkah">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Hook Edit Buttons
  grid.querySelectorAll('.btn-edit-mit').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = mitigasiState.find(m => m.id === id);
      if (item) {
        openMitigasiModal(modalRoot, item, item.stepNumber || 1, () => loadMitigasi(container));
      }
    };
  });

  // Hook Delete Buttons
  grid.querySelectorAll('.btn-delete-mit').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = mitigasiState.find(m => m.id === id);
      confirmDeleteMitigasi(id, item ? item.title : '', () => loadMitigasi(container));
    };
  });
}

// --- CREATE & EDIT MODAL ---
function openMitigasiModal(root, item = null, defaultStepNum = 1, onSaved) {
  const isEdit = Boolean(item && item.id);
  const modalId = 'adm-modal-mit';

  root.innerHTML = `
    <div class="adm-modal-backdrop adm-modal-backdrop--open" id="${modalId}">
      <div class="adm-modal">
        <div class="adm-modal__header">
          <h2 class="adm-modal__title">${isEdit ? 'Perbarui Langkah Mitigasi' : 'Tambah Langkah Mitigasi'}</h2>
          <button class="adm-modal__close" id="mit-modal-close-btn" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form id="adm-mit-form" class="adm-modal__body">
          <div style="display: grid; grid-template-columns: 120px 1fr; gap: 16px;">
            <div class="adm-form-group">
              <label class="adm-form-label" for="mit-step">Nomor SOP *</label>
              <input class="adm-input adm-input--no-icon" id="mit-step" type="number" min="1" max="99" value="${item ? item.stepNumber || 1 : defaultStepNum}" required>
            </div>
            <div class="adm-form-group">
              <label class="adm-form-label" for="mit-title">Judul Langkah *</label>
              <input class="adm-input adm-input--no-icon" id="mit-title" type="text" placeholder="Contoh: Menuju Titik Kumpul Darurat..." value="${item ? escapeHtml(item.title || '') : ''}" required>
            </div>
          </div>

          <!-- Description / Instructions -->
          <div class="adm-form-group">
            <label class="adm-form-label" for="mit-desc">Instruksi Lapangan Warga *</label>
            <textarea class="adm-textarea" id="mit-desc" placeholder="Jelaskan tindakan taktis yang wajib dilakukan saat situasi ini..." required>${item ? escapeHtml(item.description || '') : ''}</textarea>
          </div>

          <!-- Cover Image Upload & URL Section -->
          <div class="adm-form-group">
            <label class="adm-form-label">Foto / Visual SOP (Cloudflare R2 Storage)</label>
            <div class="adm-upload-zone" id="mit-upload-zone">
              <input type="file" id="mit-file-input" accept="image/*" style="display: none;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--adm-amber); margin-bottom: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <div style="font-size: 13px; font-weight: 600; color: #ffffff;" id="mit-upload-status-text">Klik atau seret visual panduan</div>
              <small style="color: var(--adm-text-dim);">Format JPG, PNG, WEBP (Otomatis masuk CDN Cloudflare)</small>
              <img id="mit-img-preview" class="adm-upload-zone__preview" src="${item && item.imageUrl ? item.imageUrl : ''}" style="${item && item.imageUrl ? '' : 'display: none;'}">
            </div>
            <input class="adm-input adm-input--no-icon" id="mit-img-url" type="url" placeholder="Atau tempel URL gambar..." value="${item ? escapeHtml(item.imageUrl || '') : ''}" style="margin-top: 8px; font-size: 12px;">
          </div>
        </form>

        <div class="adm-modal__footer">
          <button class="adm-btn adm-btn--glass adm-btn--sm" id="mit-modal-cancel-btn" type="button">Batal</button>
          <button class="adm-btn adm-btn--amber adm-btn--sm" id="mit-modal-save-btn" type="button">
            <span>${isEdit ? 'Simpan Perubahan' : 'Tambah Langkah'}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const modalEl = root.querySelector(`#${modalId}`);
  const closeBtn = root.querySelector('#mit-modal-close-btn');
  const cancelBtn = root.querySelector('#mit-modal-cancel-btn');
  const saveBtn = root.querySelector('#mit-modal-save-btn');
  const uploadZone = root.querySelector('#mit-upload-zone');
  const fileInput = root.querySelector('#mit-file-input');
  const imgUrlInput = root.querySelector('#mit-img-url');
  const previewImg = root.querySelector('#mit-img-preview');
  const uploadStatus = root.querySelector('#mit-upload-status-text');

  const closeModal = () => {
    modalEl.classList.remove('adm-modal-backdrop--open');
    setTimeout(() => { root.innerHTML = ''; }, 250);
  };

  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;

  // File Upload to Cloudflare R2
  uploadZone.onclick = () => fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    uploadStatus.textContent = 'Mengunggah ke Cloudflare R2...';
    try {
      const publicUrl = await uploadStorageFile(file, 'mitigasi');
      imgUrlInput.value = publicUrl;
      previewImg.src = publicUrl;
      previewImg.style.display = 'block';
      uploadStatus.textContent = 'Foto SOP berhasil diunggah!';
      showToast('Visual mitigasi berhasil diunggah ke CDN R2', 'success');
    } catch (err) {
      console.warn('Gagal upload gambar:', err);
      const localUrl = URL.createObjectURL(file);
      imgUrlInput.value = localUrl;
      previewImg.src = localUrl;
      previewImg.style.display = 'block';
      uploadStatus.textContent = 'Foto siap disimpan';
    }
  };

  imgUrlInput.oninput = (e) => {
    const val = e.target.value.trim();
    if (val) {
      previewImg.src = val;
      previewImg.style.display = 'block';
    } else {
      previewImg.style.display = 'none';
    }
  };

  // Save handler
  saveBtn.onclick = async () => {
    const stepNumber = parseInt(root.querySelector('#mit-step').value, 10) || 1;
    const title = root.querySelector('#mit-title').value.trim();
    const description = root.querySelector('#mit-desc').value.trim();
    const imageUrl = imgUrlInput.value.trim();

    if (!title) {
      showToast('Judul langkah mitigasi wajib diisi', 'error');
      return;
    }
    if (!description) {
      showToast('Instruksi lapangan wajib diisi', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>Menyimpan...</span>`;

    const payload = {
      stepNumber,
      title,
      description,
      imageUrl
    };

    try {
      if (isEdit) {
        await updateMitigasi(item.id, payload);
        showToast('Langkah mitigasi berhasil diperbarui!', 'success');
      } else {
        await createMitigasi(payload);
        showToast('Langkah mitigasi baru berhasil ditambahkan!', 'success');
      }

      // Notify global web listeners to update public mitigasi slider
      window.dispatchEvent(new CustomEvent('samudra:content-updated', { detail: { type: 'mitigasi' } }));

      closeModal();
      if (onSaved) onSaved();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan langkah mitigasi', 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>${isEdit ? 'Simpan Perubahan' : 'Tambah Langkah'}</span>`;
    }
  };
}

function confirmDeleteMitigasi(id, title, onDeleted) {
  if (!confirm(`Hapus langkah mitigasi "${title || 'ini'}"? Tindakan ini tidak dapat dibatalkan.`)) return;

  deleteMitigasi(id)
    .then(() => {
      showToast('Langkah mitigasi berhasil dihapus', 'success');
      window.dispatchEvent(new CustomEvent('samudra:content-updated', { detail: { type: 'mitigasi' } }));
      if (onDeleted) onDeleted();
    })
    .catch(err => {
      showToast(err.message || 'Gagal menghapus langkah mitigasi', 'error');
    });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
