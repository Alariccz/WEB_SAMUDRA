/**
 * SAMUDRA Admin Peralatan Siaga Management Component
 * Styled with WoodNest dark moody luxury aesthetics
 * Full CRUD for disaster preparedness equipment
 */

import { fetchAdminPeralatan, createPeralatan, updatePeralatan, deletePeralatan, uploadStorageFile } from './adminApi.js';
import { showToast } from './adminToast.js';

let peralatanState = [];

export function renderAdminPeralatan(container) {
  container.innerHTML = `
    <div>
      <!-- Top Title & Action Bar -->
      <div class="adm-view-title-bar">
        <div class="adm-view-title-bar__left">
          <h1>Kelola Peralatan Siaga Bencana</h1>
          <p>Daftar perlengkapan dan peralatan darurat yang wajib disiapkan warga di zona rawan tsunami.</p>
        </div>
        <div>
          <button class="adm-btn adm-btn--white" id="adm-btn-create-peralatan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>+ Tambah Peralatan</span>
          </button>
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="adm-cards-grid" id="adm-peralatan-grid">
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--adm-text-dim);">
          <svg class="adm-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
          <div style="margin-top: 12px; font-size: 14px;">Memuat peralatan siaga...</div>
        </div>
      </div>

      <!-- Modal Container -->
      <div id="adm-peralatan-modal-root"></div>
    </div>
  `;

  const btnCreate = container.querySelector('#adm-btn-create-peralatan');
  const modalRoot = container.querySelector('#adm-peralatan-modal-root');

  btnCreate.onclick = () => {
    openPeralatanModal(modalRoot, null, () => loadPeralatan(container));
  };

  loadPeralatan(container);
}

async function loadPeralatan(container) {
  const grid = container.querySelector('#adm-peralatan-grid');
  try {
    const data = await fetchAdminPeralatan();
    peralatanState = Array.isArray(data) ? data : [];
    renderPeralatanCards(container);
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: var(--adm-radius-lg);">
        <p style="color: #fb7185; font-size: 14px; margin: 0 0 14px;">Gagal memuat peralatan siaga: ${err.message}</p>
        <button class="adm-btn adm-btn--glass adm-btn--sm" id="btn-retry-per">Coba Lagi</button>
      </div>
    `;
    const retry = grid.querySelector('#btn-retry-per');
    if (retry) retry.onclick = () => loadPeralatan(container);
  }
}

function renderPeralatanCards(container) {
  const grid = container.querySelector('#adm-peralatan-grid');
  const modalRoot = container.querySelector('#adm-peralatan-modal-root');

  if (peralatanState.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 64px 20px; color: var(--adm-text-dim);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">Belum Ada Peralatan Terdaftar</div>
        <div style="font-size: 13px;">Tambahkan perlengkapan tanggap darurat seperti P3K, Senter, atau Peluit.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = peralatanState.map(item => {
    const fallbackThumb = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%2304121d"/><circle cx="200" cy="125" r="45" stroke="%2338bdf8" stroke-width="1.5" fill="none"/><text x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="13">PERALATAN SIAGA</text></svg>`;
    const imgUrl = item.imageUrl || fallbackThumb;

    return `
      <div class="adm-card" data-id="${item.id}">
        <div class="adm-card__thumb">
          <img class="adm-card__img" src="${imgUrl}" alt="${item.name}" loading="lazy" onerror="this.src='${fallbackThumb}'">
          <div class="adm-card__thumb-overlay"></div>
          <span class="adm-card__status-badge adm-card__status-badge--published">
            ${item.category || 'Umum'}
          </span>
        </div>
        <div class="adm-card__body">
          <h3 class="adm-card__title">${item.name}</h3>
          <p class="adm-card__desc">${item.description || 'Peralatan kesiapsiagaan tanggap darurat pesisir.'}</p>
          
          <div class="adm-card__footer">
            <div class="adm-card__meta">
              <span class="adm-card__meta-primary">Prioritas: ${item.priority || 0}</span>
              <span class="adm-card__meta-secondary">${item.iconName || 'Peralatan Standar'}</span>
            </div>
            <div class="adm-card__actions">
              <button class="adm-btn adm-btn--glass adm-btn--sm btn-edit-per" data-id="${item.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Edit</span>
              </button>
              <button class="adm-btn adm-btn--danger adm-btn--sm btn-delete-per" data-id="${item.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.btn-edit-per').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = peralatanState.find(p => p.id === id);
      if (item) openPeralatanModal(modalRoot, item, () => loadPeralatan(container));
    };
  });

  grid.querySelectorAll('.btn-delete-per').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = peralatanState.find(p => p.id === id);
      confirmDeletePeralatan(id, item ? item.name : '', () => loadPeralatan(container));
    };
  });
}

function openPeralatanModal(root, item = null, onSaved) {
  const isEdit = Boolean(item && item.id);
  const modalId = 'adm-modal-per';

  root.innerHTML = `
    <div class="adm-modal-backdrop adm-modal-backdrop--open" id="${modalId}">
      <div class="adm-modal">
        <div class="adm-modal__header">
          <h2 class="adm-modal__title">${isEdit ? 'Perbarui Peralatan' : 'Tambah Peralatan Siaga'}</h2>
          <button class="adm-modal__close" id="per-modal-close-btn" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form id="adm-per-form" class="adm-modal__body">
          <div class="adm-form-group">
            <label class="adm-form-label" for="per-name">Nama Peralatan *</label>
            <input class="adm-input adm-input--no-icon" id="per-name" type="text" placeholder="Contoh: Kotak P3K, Senter Tahan Air..." value="${item ? escapeHtml(item.name || '') : ''}" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="adm-form-group">
              <label class="adm-form-label" for="per-category">Kategori</label>
              <input class="adm-input adm-input--no-icon" id="per-category" type="text" placeholder="Kesehatan, Komunikasi, dll." value="${item ? escapeHtml(item.category || 'Umum') : 'Umum'}">
            </div>
            <div class="adm-form-group">
              <label class="adm-form-label" for="per-priority">Tingkat Prioritas (Angka)</label>
              <input class="adm-input adm-input--no-icon" id="per-priority" type="number" min="0" max="10" value="${item ? item.priority || 0 : 0}">
            </div>
          </div>

          <div class="adm-form-group">
            <label class="adm-form-label" for="per-desc">Fungsi & Deskripsi *</label>
            <textarea class="adm-textarea" id="per-desc" placeholder="Jelaskan kegunaan dan persiapan alat ini..." required>${item ? escapeHtml(item.description || '') : ''}</textarea>
          </div>

          <!-- Image Upload & URL Section -->
          <div class="adm-form-group">
            <label class="adm-form-label">Foto Alat (Cloudflare R2 Storage)</label>
            <div class="adm-upload-zone" id="per-upload-zone">
              <input type="file" id="per-file-input" accept="image/*" style="display: none;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--adm-emerald); margin-bottom: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <div style="font-size: 13px; font-weight: 600; color: #ffffff;" id="per-upload-status-text">Klik atau seret foto perlengkapan</div>
              <img id="per-img-preview" class="adm-upload-zone__preview" src="${item && item.imageUrl ? item.imageUrl : ''}" style="${item && item.imageUrl ? '' : 'display: none;'}">
            </div>
            <input class="adm-input adm-input--no-icon" id="per-img-url" type="url" placeholder="Atau tempel URL gambar..." value="${item ? escapeHtml(item.imageUrl || '') : ''}" style="margin-top: 8px; font-size: 12px;">
          </div>
        </form>

        <div class="adm-modal__footer">
          <button class="adm-btn adm-btn--glass adm-btn--sm" id="per-modal-cancel-btn" type="button">Batal</button>
          <button class="adm-btn adm-btn--white adm-btn--sm" id="per-modal-save-btn" type="button">
            <span>${isEdit ? 'Simpan Perubahan' : 'Tambah Peralatan'}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const modalEl = root.querySelector(`#${modalId}`);
  const closeBtn = root.querySelector('#per-modal-close-btn');
  const cancelBtn = root.querySelector('#per-modal-cancel-btn');
  const saveBtn = root.querySelector('#per-modal-save-btn');
  const uploadZone = root.querySelector('#per-upload-zone');
  const fileInput = root.querySelector('#per-file-input');
  const imgUrlInput = root.querySelector('#per-img-url');
  const previewImg = root.querySelector('#per-img-preview');
  const uploadStatus = root.querySelector('#per-upload-status-text');

  const closeModal = () => {
    modalEl.classList.remove('adm-modal-backdrop--open');
    setTimeout(() => { root.innerHTML = ''; }, 250);
  };

  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;

  uploadZone.onclick = () => fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    uploadStatus.textContent = 'Mengunggah ke Cloudflare R2...';
    try {
      const publicUrl = await uploadStorageFile(file, 'peralatan');
      imgUrlInput.value = publicUrl;
      previewImg.src = publicUrl;
      previewImg.style.display = 'block';
      uploadStatus.textContent = 'Foto peralatan berhasil diunggah!';
      showToast('Foto berhasil diunggah ke CDN R2', 'success');
    } catch (err) {
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

  saveBtn.onclick = async () => {
    const name = root.querySelector('#per-name').value.trim();
    const category = root.querySelector('#per-category').value.trim() || 'Umum';
    const priority = parseInt(root.querySelector('#per-priority').value, 10) || 0;
    const description = root.querySelector('#per-desc').value.trim();
    const imageUrl = imgUrlInput.value.trim();

    if (!name || !description) {
      showToast('Nama dan deskripsi peralatan wajib diisi', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>Menyimpan...</span>`;

    const payload = { name, category, priority, description, imageUrl };

    try {
      if (isEdit) {
        await updatePeralatan(item.id, payload);
        showToast('Peralatan berhasil diperbarui!', 'success');
      } else {
        await createPeralatan(payload);
        showToast('Peralatan baru berhasil ditambahkan!', 'success');
      }

      closeModal();
      if (onSaved) onSaved();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan peralatan', 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>${isEdit ? 'Simpan Perubahan' : 'Tambah Peralatan'}</span>`;
    }
  };
}

function confirmDeletePeralatan(id, name, onDeleted) {
  if (!confirm(`Hapus peralatan "${name || 'ini'}"?`)) return;

  deletePeralatan(id)
    .then(() => {
      showToast('Peralatan berhasil dihapus', 'success');
      if (onDeleted) onDeleted();
    })
    .catch(err => {
      showToast(err.message || 'Gagal menghapus peralatan', 'error');
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
