import { fetchMitigasi } from '../api.js';

const DEFAULT_MITIGASI = [
  {
    id: 'default-step-1',
    stepNumber: 1,
    title: 'Deteksi Gempa & Lindungi Diri',
    description: 'Saat guncangan terasa kuat, segera merunduk (Drop), lindungi kepala dan leher (Cover), dan bertahan di bawah meja kokoh (Hold On) hingga guncangan mereda.',
    imageUrl: ''
  },
  {
    id: 'default-step-2',
    stepNumber: 2,
    title: 'Tinggalkan Kawasan Pantai',
    description: 'Jika berada di pesisir dan gempa berlangsung lebih dari 20 detik atau membuat sulit berdiri, segera bergerak ke daratan tinggi tanpa menunggu bunyi sirene.',
    imageUrl: ''
  },
  {
    id: 'default-step-3',
    stepNumber: 3,
    title: 'Pilih Jalur Evakuasi Aman',
    description: 'Gunakan rute evakuasi darat terbuka. Hindari melintasi jembatan muara, saluran air besar, atau jalan di bawah tebing yang berisiko longsor.',
    imageUrl: ''
  },
  {
    id: 'default-step-4',
    stepNumber: 4,
    title: 'Bertahan di Tempat Tinggi (Shelter)',
    description: 'Tetap berada di elevasi minimal 20 meter di atas permukaan laut atau shelter vertikal sampai BMKG secara resmi menyatakan peringatan tsunami berakhir.',
    imageUrl: ''
  }
];

export function renderMitigasi(container) {
  const section = document.createElement('section');
  section.id = 'mitigasi';
  section.className = 'mitigasi-section';

  section.innerHTML = `
    <!-- Header -->
    <div class="mitigasi-header">
      <div class="mitigasi-header__left">
        <span class="mitigasi-eyebrow">PANDUAN LAPANGAN &bull; TANGGAP DARURAT</span>
        <h2 class="mitigasi-title">Langkah Mitigasi Tsunami</h2>
      </div>
      <div class="mitigasi-header__right">
        <p class="mitigasi-lede">
          Instruksi tindakan taktis langkah demi langkah saat krisis tiba. Tersinkronisasi resmi dari server database SAMUDRA untuk kesiapan evakuasi Anda.
        </p>
      </div>
    </div>

    <!-- Grid Container -->
    <div class="mitigasi-grid" id="mitigasi-grid">
      <div class="mitigasi-loading" style="grid-column: 1/-1; text-align: center; color: #8fa0b6; padding: 40px 0;">
        Memuat langkah mitigasi...
      </div>
    </div>
  `;

  container.appendChild(section);

  const grid = section.querySelector('#mitigasi-grid');

  fetchMitigasi()
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        // Sort by stepNumber
        const sorted = [...data].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0));
        renderCards(grid, sorted);
      } else {
        renderCards(grid, DEFAULT_MITIGASI);
      }
    })
    .catch(err => {
      console.warn('Gagal memuat API mitigasi, menggunakan panduan default:', err);
      renderCards(grid, DEFAULT_MITIGASI);
    });
}

function renderCards(grid, items) {
  grid.innerHTML = items.map((item, idx) => {
    const stepNum = item.stepNumber || (idx + 1);
    const stepLabel = `LANGKAH MITIGASI ${String(stepNum).padStart(2, '0')}`;
    const href = `?article=${encodeURIComponent(item.id || 'mitigasi-' + stepNum)}`;

    const fallbackSvg = `
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;background:#061421;">
        <rect width="400" height="240" fill="#04121d"/>
        <circle cx="200" cy="120" r="60" stroke="#38ef7d" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.4"/>
        <path d="M170 140 L200 90 L230 140 Z" stroke="#38ef7d" stroke-width="2" fill="rgba(56, 239, 125, 0.1)"/>
        <text x="200" y="175" fill="#38ef7d" font-size="12" font-family="'JetBrains Mono', monospace" text-anchor="middle" letter-spacing="2">SOP 0${stepNum}</text>
      </svg>
    `;

    return `
      <a class="mitigasi-card" href="${href}" data-id="${item.id}" aria-label="Buka panduan: ${item.title}">
        <div class="mitigasi-card__thumb">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" loading="lazy">` : fallbackSvg}
          <span class="mitigasi-card__step-badge">${stepLabel}</span>
        </div>
        <div class="mitigasi-card__body">
          <h3 class="mitigasi-card__title">${item.title}</h3>
          <p class="mitigasi-card__desc">${item.description || 'Instruksi kesiapsiagaan dan tindakan tanggap darurat resmi.'}</p>
          <span class="mitigasi-card__action">Buka Panduan Lengkap &rarr;</span>
        </div>
      </a>
    `;
  }).join('');

  // Hook navigation for SPA
  grid.querySelectorAll('.mitigasi-card').forEach(card => {
    const targetId = card.getAttribute('data-id');
    card.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (typeof window.__navigateToArticle === 'function') {
        window.__navigateToArticle(targetId);
      }
    });
  });
}
