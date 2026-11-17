/**
 * SAMUDRA Admin Articles Management Component
 * Styled with WoodNest dark moody luxury aesthetics
 * Features full CRUD, category filtering, search, and Cloudflare R2 image upload
 */

import { fetchAdminArticles, createArticle, updateArticle, deleteArticle, uploadStorageFile, uploadMultipleStorageFiles } from './adminApi.js';
import { showToast } from './adminToast.js';
import { showConfirmModal } from './adminConfirmModal.js';

let articlesState = [];
let currentCategory = 'all';
let currentStatus = 'all';
let searchQuery = '';

function getModalPortal() {
  let portal = document.getElementById('adm-article-modal-root');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'adm-article-modal-root';
    document.body.appendChild(portal);
  }
  return portal;
}

export function renderAdminArticles(container) {
  container.innerHTML = `
    <div>
      <!-- Top Title & Action Bar -->
      <div class="adm-view-title-bar">
        <div class="adm-view-title-bar__left">
          <h1>Kelola Artikel & Berita</h1>
          <p>Publikasikan informasi penting, peringatan, dan panduan keselamatan untuk masyarakat pesisir.</p>
        </div>
        <div>
          <button class="adm-btn adm-btn--white" id="adm-btn-create-article">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>+ Tulis Artikel Baru</span>
          </button>
        </div>
      </div>

      <!-- Toolbar: Search & Category Filter Pills -->
      <div class="adm-toolbar">
        <div class="adm-toolbar__left">
          <div class="adm-search-input-wrap">
            <svg class="adm-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input class="adm-search-input" id="adm-article-search" type="text" placeholder="Cari judul artikel...">
          </div>

          <div class="adm-filter-pills" id="adm-category-filters">
            <button class="adm-filter-pill adm-filter-pill--active" data-cat="all">Semua Kategori</button>
            <button class="adm-filter-pill" data-cat="mitigasi_bencana">Mitigasi Bencana</button>
            <button class="adm-filter-pill" data-cat="edukasi_tsunami">Edukasi Tsunami</button>
            <button class="adm-filter-pill" data-cat="berita">Berita</button>
            <button class="adm-filter-pill" data-cat="tips_keselamatan">Tips Keselamatan</button>
          </div>
        </div>

        <div class="adm-filter-pills" id="adm-status-filters">
          <button class="adm-filter-pill adm-filter-pill--active" data-status="all">Semua Status</button>
          <button class="adm-filter-pill" data-status="published">Terbit</button>
          <button class="adm-filter-pill" data-status="draft">Draft</button>
        </div>
      </div>

      <!-- Articles Card Grid (Styled like WoodNest cabin cards) -->
      <div class="adm-cards-grid" id="adm-articles-grid">
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--adm-text-dim);">
          <svg class="adm-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
          <div style="margin-top: 12px; font-size: 14px;">Memuat data artikel dari server...</div>
        </div>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#adm-article-search');
  const catFilters = container.querySelectorAll('#adm-category-filters .adm-filter-pill');
  const statusFilters = container.querySelectorAll('#adm-status-filters .adm-filter-pill');
  const btnCreate = container.querySelector('#adm-btn-create-article');

  // Search input handler
  searchInput.oninput = (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderFilteredArticles(container);
  };

  // Category filter clicks
  catFilters.forEach(btn => {
    btn.onclick = () => {
      catFilters.forEach(b => b.classList.remove('adm-filter-pill--active'));
      btn.classList.add('adm-filter-pill--active');
      currentCategory = btn.getAttribute('data-cat');
      renderFilteredArticles(container);
    };
  });

  // Status filter clicks
  statusFilters.forEach(btn => {
    btn.onclick = () => {
      statusFilters.forEach(b => b.classList.remove('adm-filter-pill--active'));
      btn.classList.add('adm-filter-pill--active');
      currentStatus = btn.getAttribute('data-status');
      renderFilteredArticles(container);
    };
  });

  // Create Article button
  btnCreate.onclick = () => {
    openArticleModal(getModalPortal(), null, () => loadArticles(container));
  };

  // Initial Load
  loadArticles(container);
}

// Expose open modal for dashboard shortcut
export function openCreateArticleModalDirectly(container) {
  openArticleModal(getModalPortal(), null, () => loadArticles(container));
}

async function loadArticles(container) {
  const grid = container.querySelector('#adm-articles-grid');
  try {
    const data = await fetchAdminArticles();
    articlesState = Array.isArray(data) ? data : [];
    renderFilteredArticles(container);
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: var(--adm-radius-lg);">
        <p style="color: #fb7185; font-size: 14px; margin: 0 0 14px;">Gagal memuat artikel: ${err.message}</p>
        <button class="adm-btn adm-btn--glass adm-btn--sm" id="btn-retry-art">Coba Lagi</button>
      </div>
    `;
    const retry = grid.querySelector('#btn-retry-art');
    if (retry) retry.onclick = () => loadArticles(container);
  }
}

function renderFilteredArticles(container) {
  const grid = container.querySelector('#adm-articles-grid');

  const filtered = articlesState.filter(art => {
    const matchesSearch = !searchQuery || (art.title && art.title.toLowerCase().includes(searchQuery)) || (art.content && art.content.toLowerCase().includes(searchQuery));
    const matchesCat = currentCategory === 'all' || art.category === currentCategory;
    const matchesStatus = currentStatus === 'all' || art.status === currentStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 64px 20px; color: var(--adm-text-dim);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">Tidak ada artikel yang cocok</div>
        <div style="font-size: 13px;">Ubah filter pencarian Anda atau buat artikel baru sekarang.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(art => {
    const isPub = art.status === 'published';
    const catLabel = formatCategoryLabel(art.category);
    const dateStr = art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft';
    const authorName = (art.author && art.author.name) ? art.author.name.split('_').pop() : 'Admin Samudra';
    const fallbackThumb = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%23061421"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2300d2ff" font-family="sans-serif" font-size="14">SAMUDRA ARTIKEL</text></svg>`;
    const imgUrl = art.coverImageUrl || fallbackThumb;

    return `
      <div class="adm-card" data-id="${art.id}">
        <div class="adm-card__thumb">
          <img class="adm-card__img" src="${imgUrl}" alt="${art.title || 'Artikel'}" loading="lazy" onerror="this.src='${fallbackThumb}'">
          <div class="adm-card__thumb-overlay"></div>
          <span class="adm-card__status-badge ${isPub ? 'adm-card__status-badge--published' : 'adm-card__status-badge--draft'}">
            ${isPub ? 'Terbit' : 'Draft'}
          </span>
        </div>
        <div class="adm-card__body">
          <span class="adm-card__category">${catLabel}</span>
          <h3 class="adm-card__title">${art.title || 'Tanpa Judul'}</h3>
          <p class="adm-card__desc">${art.content ? art.content.replace(/<[^>]*>?/gm, '').slice(0, 140) : 'Tidak ada deskripsi konten.'}</p>
          
          <div class="adm-card__footer">
            <div class="adm-card__meta">
              <span class="adm-card__meta-primary">${authorName}</span>
              <span class="adm-card__meta-secondary">${dateStr}</span>
            </div>
            <div class="adm-card__actions">
              <button class="adm-btn adm-btn--glass adm-btn--sm btn-edit-art" data-id="${art.id}" title="Edit Artikel">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Edit</span>
              </button>
              <button class="adm-btn adm-btn--danger adm-btn--sm btn-delete-art" data-id="${art.id}" title="Hapus Artikel">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Hook Edit Buttons
  grid.querySelectorAll('.btn-edit-art').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const article = articlesState.find(a => a.id === id);
      if (article) {
        openArticleModal(getModalPortal(), article, () => loadArticles(container));
      }
    };
  });

  // Hook Delete Buttons
  grid.querySelectorAll('.btn-delete-art').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const article = articlesState.find(a => a.id === id);
      confirmDeleteArticle(id, article ? article.title : '', () => loadArticles(container));
    };
  });
}

function formatCategoryLabel(cat) {
  switch (cat) {
    case 'mitigasi_bencana': return 'Mitigasi Bencana';
    case 'edukasi_tsunami': return 'Edukasi Tsunami';
    case 'berita': return 'Berita';
    case 'tips_keselamatan': return 'Tips Keselamatan';
    default: return cat || 'Umum';
  }
}

// --- CREATE & EDIT MODAL ---
function openArticleModal(root, article = null, onSaved) {
  const isEdit = Boolean(article && article.id);
  const modalId = 'adm-modal-art';

  root.innerHTML = `
    <div class="adm-modal-backdrop adm-modal-backdrop--open" id="${modalId}">
      <div class="adm-modal">
        <div class="adm-modal__header">
          <h2 class="adm-modal__title">${isEdit ? 'Perbarui Artikel' : 'Tulis Artikel Baru'}</h2>
          <button class="adm-modal__close" id="modal-close-btn" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form id="adm-art-form" class="adm-modal__body">
          <div class="adm-form-group">
            <label class="adm-form-label" for="art-title">Judul Artikel *</label>
            <input class="adm-input adm-input--no-icon" id="art-title" type="text" placeholder="Contoh: Langkah Antisipasi Tsunami..." value="${article ? escapeHtml(article.title || '') : ''}" required>
          </div>

          <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px;">
            <div class="adm-form-group">
              <label class="adm-form-label" for="art-category">Kategori</label>
              <select class="adm-select" id="art-category">
                <option value="mitigasi_bencana" ${article && article.category === 'mitigasi_bencana' ? 'selected' : ''}>Mitigasi Bencana</option>
                <option value="edukasi_tsunami" ${article && article.category === 'edukasi_tsunami' ? 'selected' : (!article ? 'selected' : '')}>Edukasi Tsunami</option>
                <option value="berita" ${article && article.category === 'berita' ? 'selected' : ''}>Berita</option>
                <option value="tips_keselamatan" ${article && article.category === 'tips_keselamatan' ? 'selected' : ''}>Tips Keselamatan</option>
              </select>
            </div>

            <div class="adm-form-group">
              <label class="adm-form-label" for="art-status">Status Publikasi</label>
              <select class="adm-select" id="art-status">
                <option value="published" ${article && article.status === 'published' ? 'selected' : (!article ? 'selected' : '')}>Terbitkan (Published)</option>
                <option value="draft" ${article && article.status === 'draft' ? 'selected' : ''}>Simpan sebagai Draft</option>
              </select>
            </div>
          </div>

          <!-- Image Gallery & Cover Upload Section -->
          <div class="adm-form-group">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <label class="adm-form-label" style="margin: 0;">Galeri Foto Artikel (Cloudflare R2 Storage)</label>
              <span style="font-size: 11px; color: var(--adm-text-dim);">Pilih satu atau banyak gambar (gambar #1 otomatis jadi sampul)</span>
            </div>
            <div class="adm-upload-zone" id="art-upload-zone" style="cursor: pointer; padding: 20px; text-align: center;">
              <input type="file" id="art-file-input" multiple accept="image/*" style="display: none;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--adm-cyan); margin-bottom: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <div style="font-size: 13px; font-weight: 600; color: #ffffff;" id="upload-status-text">+ Klik untuk memilih foto (bisa pilih banyak sekaligus)</div>
              <small style="color: var(--adm-text-dim);">Format JPG, PNG, WEBP. Mendukung upload multi-gambar ke CDN Cloudflare R2</small>
            </div>

            <!-- Thumbnail Gallery Previews -->
            <div id="art-gallery-previews" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; margin-top: 12px;"></div>

            <div style="margin-top: 8px;">
              <input class="adm-input adm-input--no-icon" id="art-cover-url" type="url" placeholder="Atau tempel URL gambar eksternal (opsional)..." value="${article ? escapeHtml(article.coverImageUrl || '') : ''}" style="font-size: 12px;">
            </div>
          </div>

          <!-- Content Markdown / Textarea -->
          <div class="adm-form-group">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <label class="adm-form-label" for="art-content" style="margin: 0;">Konten Artikel *</label>
              <span style="font-size: 11px; color: var(--adm-text-dim);">Mendukung format paragraf & baris baru</span>
            </div>
            <textarea class="adm-textarea" id="art-content" placeholder="Tulis instruksi atau informasi lengkap artikel..." required>${article ? escapeHtml(article.content || '') : ''}</textarea>
          </div>
        </form>

        <div class="adm-modal__footer">
          <button class="adm-btn adm-btn--glass adm-btn--sm" id="modal-cancel-btn" type="button">Batal</button>
          <button class="adm-btn adm-btn--white adm-btn--sm" id="modal-save-btn" type="button">
            <span>${isEdit ? 'Simpan Perubahan' : 'Terbitkan Artikel'}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const modalEl = root.querySelector(`#${modalId}`);
  const closeBtn = root.querySelector('#modal-close-btn');
  const cancelBtn = root.querySelector('#modal-cancel-btn');
  const saveBtn = root.querySelector('#modal-save-btn');
  const uploadZone = root.querySelector('#art-upload-zone');
  const fileInput = root.querySelector('#art-file-input');
  const coverUrlInput = root.querySelector('#art-cover-url');
  const uploadStatus = root.querySelector('#upload-status-text');
  const galleryPreviewsEl = root.querySelector('#art-gallery-previews');

  // State gambar artikel
  let existingImages = [];
  if (article && Array.isArray(article.images) && article.images.length > 0) {
    existingImages = [...article.images].filter(Boolean);
  } else if (article && article.coverImageUrl) {
    existingImages = [article.coverImageUrl];
  }
  let newFiles = []; // File-file baru yang dipilih dari komputer

  const renderPreviews = () => {
    galleryPreviewsEl.innerHTML = '';
    const allItems = [
      ...existingImages.map((url, idx) => ({ type: 'existing', url, index: idx })),
      ...newFiles.map((file, idx) => ({ type: 'new', file, url: URL.createObjectURL(file), index: idx }))
    ];

    if (allItems.length === 0) {
      galleryPreviewsEl.style.display = 'none';
      uploadStatus.textContent = '+ Klik untuk memilih foto (bisa pilih banyak sekaligus)';
      return;
    }

    galleryPreviewsEl.style.display = 'grid';
    uploadStatus.textContent = `${allItems.length} foto siap (${newFiles.length} baru, foto pertama jadi sampul)`;

    allItems.forEach((item, pos) => {
      const card = document.createElement('div');
      card.style.cssText = 'position: relative; width: 100%; aspect-ratio: 16/10; border-radius: 8px; overflow: hidden; border: 1px solid var(--adm-border); background: #0c1726;';

      const img = document.createElement('img');
      img.src = item.url;
      img.alt = `Foto ${pos + 1}`;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
      card.appendChild(img);

      // Label nomor / sampul
      const badge = document.createElement('div');
      badge.style.cssText = 'position: absolute; bottom: 4px; left: 4px; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); color: #fff; pointer-events: none;';
      badge.textContent = pos === 0 ? '★ Sampul' : `#${pos + 1}`;
      card.appendChild(badge);

      // Tombol hapus
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.style.cssText = 'position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(220, 38, 38, 0.9); color: #fff; border: none; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; transition: transform 0.15s;';
      removeBtn.innerHTML = '✕';
      removeBtn.title = 'Hapus gambar ini';
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        if (item.type === 'existing') {
          existingImages.splice(item.index, 1);
        } else {
          newFiles.splice(item.index, 1);
        }
        renderPreviews();
      };
      card.appendChild(removeBtn);

      galleryPreviewsEl.appendChild(card);
    });
  };

  renderPreviews();

  const closeModal = () => {
    document.removeEventListener('keydown', handleKey);
    modalEl.classList.remove('adm-modal-backdrop--open');
    setTimeout(() => { root.innerHTML = ''; }, 250);
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', handleKey);

  modalEl.onclick = (e) => {
    if (e.target === modalEl) closeModal();
  };

  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;

  // File Upload to Cloudflare R2
  uploadZone.onclick = () => fileInput.click();

  fileInput.onchange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    newFiles.push(...selected);
    renderPreviews();
    fileInput.value = ''; // Reset input agar bisa memilih file yang sama jika diinginkan
  };

  coverUrlInput.onchange = (e) => {
    const val = e.target.value.trim();
    if (val && !existingImages.includes(val)) {
      existingImages.unshift(val);
      renderPreviews();
    }
  };

  // Save handler
  saveBtn.onclick = async () => {
    const title = root.querySelector('#art-title').value.trim();
    const content = root.querySelector('#art-content').value.trim();
    const category = root.querySelector('#art-category').value;
    const status = root.querySelector('#art-status').value;
    const manualCover = coverUrlInput.value.trim();

    if (!title) {
      showToast('Judul artikel wajib diisi', 'error');
      return;
    }
    if (!content) {
      showToast('Konten artikel wajib diisi', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>Menyimpan...</span>`;

    try {
      let uploadedUrls = [];
      if (newFiles.length > 0) {
        saveBtn.innerHTML = `<span>Mengunggah ${newFiles.length} foto ke R2...</span>`;
        uploadStatus.textContent = `Mengunggah ${newFiles.length} foto ke Cloudflare R2...`;
        uploadedUrls = await uploadMultipleStorageFiles(newFiles, 'articles');
      }

      let finalImages = [...existingImages, ...uploadedUrls].filter(Boolean);
      if (finalImages.length === 0 && manualCover) {
        finalImages.push(manualCover);
      }

      const coverImageUrl = finalImages.length > 0 ? finalImages[0] : (manualCover || '');

      const payload = {
        title,
        content,
        category,
        status,
        coverImageUrl,
        images: finalImages
      };

      if (isEdit) {
        await updateArticle(article.id, payload);
        showToast('Artikel berhasil diperbarui!', 'success');
      } else {
        await createArticle(payload);
        showToast('Artikel baru berhasil dibuat!', 'success');
      }

      // Notify global web listeners to update public article list
      window.dispatchEvent(new CustomEvent('samudra:content-updated', { detail: { type: 'articles' } }));

      closeModal();
      if (onSaved) onSaved();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan artikel', 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>${isEdit ? 'Simpan Perubahan' : 'Terbitkan Artikel'}</span>`;
      uploadStatus.textContent = 'Terjadi kesalahan saat upload.';
    }
  };
}

function confirmDeleteArticle(id, title, onDeleted) {
  showConfirmModal({
    title: 'Hapus Artikel',
    subtitle: 'Apakah Anda yakin ingin menghapus artikel ini dari sistem SAMUDRA?',
    itemName: title || 'Artikel Tanpa Judul',
    itemDetails: `ID: ${id}`,
    warningText: 'Artikel akan dihapus permanen dan tidak lagi muncul di website publik.',
    confirmLabel: 'Hapus Artikel',
    confirmVariant: 'danger',
    onConfirm: async () => {
      try {
        await deleteArticle(id);
        showToast('Artikel berhasil dihapus', 'success');
        window.dispatchEvent(new CustomEvent('samudra:content-updated', { detail: { type: 'articles' } }));
        if (onDeleted) onDeleted();
      } catch (err) {
        showToast(err.message || 'Gagal menghapus artikel', 'error');
        throw err;
      }
    }
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
