import { fetchArticles, fetchArticleById } from '../api.js';

// SVG Graphics matching the Morgana / SAMUDRA aesthetic
const SVGS = {
  hero: `
    <svg viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" class="morgana-hero__svg">
      <defs>
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00d2ff" stop-opacity="0.25"/>
          <stop offset="60%" stop-color="#033866" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#030814" stop-opacity="0"/>
        </radialGradient>
        <pattern id="dotPattern" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="1.4" fill="#00d2ff" opacity="0.3"/>
        </pattern>
        <linearGradient id="barGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
        <linearGradient id="barGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0c4a6e"/>
          <stop offset="100%" stop-color="#031b33"/>
        </linearGradient>
      </defs>
      <rect width="540" height="540" fill="#051021"/>
      <rect width="540" height="540" fill="url(#heroGlow)"/>
      <rect width="540" height="540" fill="url(#dotPattern)"/>
      <circle cx="270" cy="270" r="205" stroke="#00d2ff" stroke-width="40" stroke-opacity="0.8" stroke-dasharray="14 6" fill="none"/>
      <circle cx="270" cy="270" r="205" stroke="#051021" stroke-width="12" fill="none"/>
      <polygon points="125,230 185,210 185,410 125,430" fill="url(#barGrad1)"/>
      <polygon points="185,210 210,225 210,420 185,410" fill="url(#barGrad2)"/>
      <polygon points="125,230 150,215 210,225 185,210" fill="#bae6fd"/>
      <polygon points="220,260 275,240 275,410 220,430" fill="url(#barGrad1)"/>
      <polygon points="275,240 300,255 300,420 275,410" fill="url(#barGrad2)"/>
      <polygon points="220,260 245,245 300,255 275,240" fill="#bae6fd"/>
      <polygon points="310,300 360,280 360,410 310,430" fill="url(#barGrad1)"/>
      <polygon points="360,280 382,295 382,420 360,410" fill="url(#barGrad2)"/>
      <polygon points="310,300 332,285 382,295 360,280" fill="#bae6fd"/>
    </svg>
  `,
  waveSlices: `
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="morgana-thumb__svg">
      <rect width="200" height="130" fill="#051224"/>
      <path d="M10 25h180M10 50h180M10 75h180M10 100h180" stroke="#00d2ff" stroke-opacity="0.12" stroke-width="1"/>
      <g transform="translate(15, 12)">
        <polygon points="55,18 150,18 130,78 35,78" fill="#00d2ff" fill-opacity="0.12" stroke="#00d2ff" stroke-width="1.8"/>
        <polygon points="45,32 140,32 120,92 25,92" fill="#00d2ff" fill-opacity="0.18" stroke="#00d2ff" stroke-width="1.8"/>
        <polygon points="35,46 130,46 110,106 15,106" fill="#00d2ff" fill-opacity="0.28" stroke="#38bdf8" stroke-width="2"/>
        <path d="M35 46 Q 75 16 130 46" stroke="#ffffff" stroke-width="1.5" fill="none"/>
        <path d="M25 60 Q 65 30 120 60" stroke="#ffffff" stroke-width="1.5" fill="none"/>
      </g>
    </svg>
  `,
  controlCenter: `
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="morgana-thumb__svg">
      <rect width="200" height="130" fill="#051224"/>
      <circle cx="100" cy="65" r="45" stroke="#00d2ff" stroke-opacity="0.18" stroke-dasharray="3 3"/>
      <circle cx="100" cy="65" r="25" stroke="#00d2ff" stroke-opacity="0.25"/>
      <line x1="100" y1="10" x2="100" y2="120" stroke="#00d2ff" stroke-opacity="0.15"/>
      <line x1="45" y1="65" x2="155" y2="65" stroke="#00d2ff" stroke-opacity="0.15"/>
      <path d="M10 65 L45 65 L55 45 L65 85 L75 32 L85 98 L95 52 L105 76 L115 65 L190 65" stroke="#00d2ff" stroke-width="2.2" fill="none"/>
      <circle cx="85" cy="98" r="3.5" fill="#ffffff"/>
      <rect x="135" y="16" width="50" height="32" rx="3" fill="#082b4a" stroke="#00d2ff" stroke-width="1"/>
      <path d="M142 27h36M142 36h22" stroke="#00d2ff" stroke-width="1.2" stroke-opacity="0.8"/>
    </svg>
  `,
  matrixBars: `
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="morgana-thumb__svg">
      <rect width="200" height="130" fill="#051224"/>
      <g transform="translate(18, 16)">
        <rect x="8"  y="55" width="15" height="48" fill="#062544" stroke="#00d2ff" stroke-width="1"/>
        <rect x="30" y="40" width="15" height="63" fill="#083159" stroke="#00d2ff" stroke-width="1.2"/>
        <rect x="52" y="24" width="15" height="79" fill="#0d4782" stroke="#00d2ff" stroke-width="1.4"/>
        <rect x="74" y="10" width="15" height="93" fill="#0284c7" stroke="#38bdf8" stroke-width="1.8"/>
        <rect x="96" y="30" width="15" height="73" fill="#0d4782" stroke="#00d2ff" stroke-width="1.4"/>
        <rect x="118" y="46" width="15" height="57" fill="#083159" stroke="#00d2ff" stroke-width="1"/>
        <rect x="140" y="60" width="15" height="43" fill="#062544" stroke="#00d2ff" stroke-width="1"/>
      </g>
    </svg>
  `,
  radarDial: `
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="morgana-thumb__svg">
      <rect width="200" height="130" fill="#051224"/>
      <circle cx="100" cy="65" r="48" stroke="#00d2ff" stroke-opacity="0.3" stroke-width="1.5"/>
      <circle cx="100" cy="65" r="32" stroke="#00d2ff" stroke-opacity="0.4" stroke-width="1"/>
      <circle cx="100" cy="65" r="16" stroke="#00d2ff" stroke-opacity="0.5" stroke-width="1"/>
      <path d="M100 65 L135 30 A 48 48 0 0 0 100 17 Z" fill="#00d2ff" fill-opacity="0.3"/>
      <line x1="100" y1="65" x2="135" y2="30" stroke="#38bdf8" stroke-width="2"/>
    </svg>
  `,
  satelliteOrbit: `
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="morgana-thumb__svg">
      <rect width="200" height="130" fill="#051224"/>
      <ellipse cx="100" cy="65" rx="75" ry="32" stroke="#00d2ff" stroke-width="1.5" stroke-opacity="0.4" transform="rotate(-15 100 65)"/>
      <circle cx="100" cy="65" r="16" fill="#0b3866" stroke="#00d2ff" stroke-width="2"/>
      <circle cx="145" cy="45" r="4.5" fill="#ffffff" stroke="#00d2ff" stroke-width="2"/>
      <line x1="145" y1="45" x2="100" y2="65" stroke="#00d2ff" stroke-width="1" stroke-dasharray="3 3"/>
    </svg>
  `
};

// Lucide ExternalLink icon (12x12) matching InfoCardDemo
const EXTERNAL_LINK_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="info-card__ext-icon">
    <path d="M15 3h6v6"/>
    <path d="M10 14 21 3"/>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
  </svg>
`;

export function renderArticles(container) {
  const section = document.createElement('section');
  section.id = 'artikel';
  section.className = 'morgana-section';

  section.innerHTML = `
    <!-- Top Editorial Header -->
    <div class="morgana-header">
      <div class="morgana-header__left">
        <span class="morgana-eyebrow">SAMUDRA &bull; Warta &amp; Publikasi</span>
        <h2 class="morgana-title">Berita &amp; Edukasi Tsunami</h2>
      </div>
      <div class="morgana-header__right">
        <p class="morgana-lede">
          Artikel, edukasi, dan dokumentasi mitigasi bencana resmi yang tersinkronisasi langsung dari database server SAMUDRA. Arahkan kursor pada kartu untuk melihat pratinjau visual dan baca selengkapnya.
        </p>
        <button type="button" class="info-card-restore-btn" id="info-card-restore-btn" style="display: none;">
          Tampilkan Kembali Kartu yang Disembunyikan
        </button>
      </div>
    </div>

    <!-- Primary InfoCard News Grid (Sorotan Utama) -->
    <div class="info-card-news-grid" id="morgana-hero-container">
      <!-- Populated dynamically with InfoCard components -->
    </div>

    <!-- Hidden legacy hook container for backwards compatibility -->
    <div id="morgana-stack-container" style="display: none;"></div>

    <!-- Second Row: Latest Insights (3-column InfoCard grid) -->
    <div class="morgana-latest">
      <div class="morgana-latest__header">
        <div>
          <span class="morgana-eyebrow" style="margin-bottom: 8px;">Eksplorasi Lapangan</span>
          <h3 class="morgana-subheading">Mitigasi &amp; Pengetahuan Terkini</h3>
        </div>
        <p class="morgana-sublede">
          Instruksi kesiapsiagaan, panduan lapangan, dan dokumentasi tindakan saat krisis tiba.
        </p>
      </div>
      <div class="info-card-news-grid" id="morgana-latest-container">
        <!-- Populated dynamically with InfoCard components -->
      </div>
    </div>

    <!-- Interactive FAQ Section (With Azure Blue Accent) -->
    <div class="morgana-faq">
      <div class="morgana-faq__header">
        <span class="morgana-eyebrow">Informasi Populer</span>
        <h3 class="morgana-faq__title">Pertanyaan Umum Seputar SAMUDRA</h3>
        <p class="morgana-faq__desc">Mekanisme pemantauan gempa BMKG, pemodelan 3D tsunami, dan kepastian evakuasi.</p>
      </div>

      <div class="morgana-accordion" id="morgana-accordion">
        <div class="morgana-accordion__item" data-index="0">
          <button class="morgana-accordion__trigger">
            <span>Bagaimana SAMUDRA menerima informasi gempa &amp; potensi tsunami?</span>
            <span class="morgana-accordion__icon">+</span>
          </button>
          <div class="morgana-accordion__content">
            <p>SAMUDRA terhubung dengan sistem diseminasi BMKG (InaTEWS), menangkap data magnitudo, episenter, kedalaman, dan perkiraan waktu tiba gelombang dalam hitungan detik setelah gempa terdeteksi.</p>
          </div>
        </div>

        <div class="morgana-accordion__item morgana-accordion__item--active" data-index="1">
          <button class="morgana-accordion__trigger">
            <span>Alat pemantauan, simulasi 3D, dan panduan evakuasi.</span>
            <span class="morgana-accordion__icon">&minus;</span>
          </button>
          <div class="morgana-accordion__content" style="display: block;">
            <p>Aplikasi SAMUDRA mengintegrasikan pemodelan ketinggian air laut 3D interaktif, perhitungan elevasi topografi pesisir, dan panduan rute tercepat ke shelter tinggi yang aman dari jembatan dan zona merah.</p>
          </div>
        </div>

        <div class="morgana-accordion__item" data-index="2">
          <button class="morgana-accordion__trigger">
            <span>Apakah simulasi 3D dapat dijalankan secara offline?</span>
            <span class="morgana-accordion__icon">+</span>
          </button>
          <div class="morgana-accordion__content">
            <p>Ya, rute evakuasi dan peta topografi offline disimpan secara lokal di perangkat Anda sehingga tetap dapat diakses saat jaringan telekomunikasi seluler mengalami pemadaman pasca-gempa.</p>
          </div>
        </div>

        <div class="morgana-accordion__item" data-index="3">
          <button class="morgana-accordion__trigger">
            <span>Apa arti tingkat peringatan Waspada, Siaga, dan Awas?</span>
            <span class="morgana-accordion__icon">+</span>
          </button>
          <div class="morgana-accordion__content">
            <p>Waspada: potensi tinggi gelombang &lt; 0.5 meter (jauhi pantai). Siaga: potensi tinggi 0.5 &ndash; 3 meter (segera evakuasi ke tempat tinggi). Awas: potensi tinggi &gt; 3 meter (evakuasi menyeluruh ke shelter daratan tinggi).</p>
          </div>
        </div>

        <div class="morgana-accordion__item" data-index="4">
          <button class="morgana-accordion__trigger">
            <span>Bagaimana cara menyusun rencana darurat keluarga?</span>
            <span class="morgana-accordion__icon">+</span>
          </button>
          <div class="morgana-accordion__content">
            <p>Tentukan titik kumpul di luar zona rendaman merah, sepakati kontak darurat di luar kota, dan lengkapi tas siaga bencana dengan persediaan minimal untuk 72 jam pertama.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(section);

  // Setup Accordion Interactions
  initAccordion(section);

  // Containers
  const heroContainer = section.querySelector('#morgana-hero-container');
  const stackContainer = section.querySelector('#morgana-stack-container');
  const latestContainer = section.querySelector('#morgana-latest-container');
  const restoreBtn = section.querySelector('#info-card-restore-btn');

  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      section.querySelectorAll('.info-card--dismissed').forEach(card => {
        card.classList.remove('info-card--dismissed');
        card.style.display = '';
      });
      restoreBtn.style.display = 'none';
    });
  }

  // Load from real backend API: /api/articles
  fetchArticles()
    .then(articles => {
      renderRealContent(heroContainer, stackContainer, latestContainer, Array.isArray(articles) ? articles : [], restoreBtn);
    })
    .catch(() => {
      renderRealContent(heroContainer, stackContainer, latestContainer, [], restoreBtn);
    });
}

function initAccordion(section) {
  const items = section.querySelectorAll('.morgana-accordion__item');
  items.forEach(item => {
    const trigger = item.querySelector('.morgana-accordion__trigger');
    const content = item.querySelector('.morgana-accordion__content');
    const icon = item.querySelector('.morgana-accordion__icon');

    trigger.onclick = () => {
      const isActive = item.classList.contains('morgana-accordion__item--active');

      items.forEach(other => {
        other.classList.remove('morgana-accordion__item--active');
        const otherContent = other.querySelector('.morgana-accordion__content');
        if (otherContent) otherContent.style.display = 'none';
        const otherIcon = other.querySelector('.morgana-accordion__icon');
        if (otherIcon) otherIcon.innerHTML = '+';
      });

      if (!isActive) {
        item.classList.add('morgana-accordion__item--active');
        if (content) content.style.display = 'block';
        if (icon) icon.innerHTML = '&minus;';
      }
    };
  });
}

// Curated 3-image media stacks for InfoCardMedia fan animation
const MEDIA_GALLERIES = [
  [
    '/img/step-1-bmkg-monitor.jpg',
    '/img/bento-buoy-warning.jpg',
    '/img/cover-1.jpg',
  ],
  [
    '/img/step-2-emergency-alert.jpg',
    '/img/bento-emergency-dispatch.jpg',
    '/img/cover-2.jpg',
  ],
  [
    '/img/step-3-evacuation-route.jpg',
    '/img/bento-evacuation-route.jpg',
    '/img/cover-3.jpg',
  ],
  [
    '/img/bento-buoy-warning.jpg',
    '/img/step-1-bmkg-monitor.jpg',
    '/img/cover-4.jpg',
  ],
  [
    '/img/bento-offline-navigation.jpg',
    '/img/step-3-evacuation-route.jpg',
    '/img/bg-misty-coast.jpg',
  ],
  [
    '/img/bento-shelter-tes.jpg',
    '/img/bg-shelter-lights.jpg',
    '/img/bg-misty-hills.jpg',
  ],
];

function buildMediaList(item, index) {
  const gallery = MEDIA_GALLERIES[index % MEDIA_GALLERIES.length];
  if (item.coverImg) {
    return [
      { type: 'image', src: gallery[0], alt: `${item.title} - Preview 1` },
      { type: 'image', src: gallery[1], alt: `${item.title} - Preview 2` },
      { type: 'image', src: item.coverImg, alt: item.title },
    ];
  }
  return [
    { type: 'image', src: gallery[0], alt: `${item.title} - Preview 1` },
    { type: 'image', src: gallery[1], alt: `${item.title} - Preview 2` },
    { type: 'image', src: gallery[2], alt: item.title },
  ];
}

/**
 * Creates a DOM element matching the exact structure and spring hover mechanics
 * of `components/ui/info-card.tsx` (InfoCard, InfoCardContent, InfoCardTitle,
 * InfoCardDescription, InfoCardMedia, InfoCardFooter, InfoCardDismiss, InfoCardAction).
 */
function createInfoCardHTML(item, idx, fallbackPrefix, shrinkHeight = 140, expandHeight = 210) {
  const targetId = item.id || item.slug || `${fallbackPrefix}-${idx + 1}`;
  const href = `?article=${encodeURIComponent(targetId)}`;
  const mediaList = buildMediaList(item, idx).slice(0, 3);
  const mediaCount = mediaList.length;

  const mediaItemsHTML = mediaList
    .map((m, mIdx) => {
      const rot = mediaCount === 1 ? 0 : (mIdx - (mediaCount === 2 ? 0.5 : 1)) * 3.2;
      const tx = mediaCount === 1 ? 0 : (mIdx - (mediaCount === 2 ? 0.5 : 1)) * 11;
      const ty = mediaCount === 1 ? -4 : mIdx === 0 ? -9 : mIdx === 1 ? -4 : 0;
      const sc = mediaCount === 1 ? 1 : +(0.935 + mIdx * 0.03).toFixed(3);
      const restSc = mediaCount === 1 ? 1 : +(0.94 + mIdx * 0.03).toFixed(3);
      const restTy = mediaCount === 1 ? 0 : (2 - mIdx) * -3;
      const restOp = mIdx === mediaCount - 1 ? 1 : mIdx === 1 ? 0.72 : 0.45;

      return `
        <div
          class="info-card__media-item"
          data-media-idx="${mIdx}"
          style="--rest-sc: ${restSc}; --rest-ty: ${restTy}px; --rest-op: ${restOp}; --hover-rot: ${rot}deg; --hover-tx: ${tx}px; --hover-ty: ${ty}px; --hover-sc: ${sc}; z-index: ${mIdx + 1};"
        >
          <img
            src="${m.src}"
            alt="${m.alt || item.title}"
            class="info-card__media-img"
            loading="lazy"
            decoding="async"
          />
        </div>
      `;
    })
    .join('');

  return `
    <article
      class="info-card"
      data-card-id="${targetId}"
      style="--shrink-h: ${shrinkHeight}px; --expand-h: ${expandHeight}px;"
      tabindex="0"
      role="article"
      aria-label="${item.title}"
    >
      <div class="info-card__content">
        <div class="info-card__meta">
          <span class="morgana-badge">${item.category}</span>
          <span class="morgana-read-time">${item.readTime}</span>
        </div>
        <div class="info-card__title">${item.title}</div>
        <div class="info-card__description">${item.excerpt}</div>

        <div class="info-card__media">
          <div class="info-card__media-stack">
            ${mediaItemsHTML}
          </div>
          <div class="info-card__media-fade"></div>
        </div>

        <div class="info-card__footer">
          <div class="info-card__footer-inner">
            <button type="button" class="info-card__dismiss" aria-label="Sembunyikan berita ini">
              Dismiss
            </button>
            <div class="info-card__action">
              <a href="${href}" class="info-card__action-link">
                <span>Baca selengkapnya</span>
                ${EXTERNAL_LINK_ICON}
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function attachInfoCardInteractions(container, items, fallbackPrefix, restoreBtn) {
  if (!container) return;
  const cards = container.querySelectorAll('.info-card');

  cards.forEach((card, idx) => {
    const item = items[idx];
    if (!item) return;
    const targetId = item.id || item.slug || `${fallbackPrefix}-${idx + 1}`;
    const mediaContainer = card.querySelector('.info-card__media');
    const dismissBtn = card.querySelector('.info-card__dismiss');
    const actionLink = card.querySelector('.info-card__action-link');
    const mainImg = card.querySelector('.info-card__media-item:last-child .info-card__media-img');

    const updateNaturalHeight = () => {
      if (!mainImg || !mainImg.naturalWidth || !mainImg.naturalHeight || !mediaContainer) return;
      const ratio = mainImg.naturalHeight / mainImg.naturalWidth;
      // Keep resting height compact (140px) and hover expansion moderate (205px - 225px) so cards never stretch excessively downward
      const expandH = ratio > 1 ? 225 : 205;
      card.style.setProperty('--shrink-h', '140px');
      card.style.setProperty('--expand-h', `${expandH}px`);
    };

    if (mainImg) {
      if (mainImg.complete && mainImg.naturalWidth) {
        updateNaturalHeight();
      } else {
        mainImg.addEventListener('load', updateNaturalHeight, { once: true });
      }
    }

    const handleEnter = () => {
      card.classList.add('is-hovered');
    };

    const handleLeave = () => {
      card.classList.remove('is-hovered');
    };

    card.addEventListener('mouseenter', handleEnter);
    card.addEventListener('mouseleave', handleLeave);
    card.addEventListener('focusin', handleEnter);
    card.addEventListener('focusout', e => {
      if (!card.contains(e.relatedTarget)) {
        handleLeave();
      }
    });

    // Dismiss button behavior (matching InfoCardDismiss)
    if (dismissBtn) {
      dismissBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        card.classList.add('info-card--dismissing');
        setTimeout(() => {
          card.classList.remove('info-card--dismissing');
          card.classList.add('info-card--dismissed');
          card.style.display = 'none';
          if (restoreBtn) {
            restoreBtn.style.display = 'inline-flex';
          }
        }, 220);
      });
    }

    const triggerOpen = e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button !== undefined && e.button !== 0)) {
        return;
      }
      e.preventDefault();
      if (typeof window.__navigateToArticle === 'function') {
        window.__navigateToArticle(targetId);
      } else {
        openArticleModal(item);
      }
    };

    if (actionLink) {
      actionLink.addEventListener('click', e => {
        e.stopPropagation();
        triggerOpen(e);
      });
    }

    card.addEventListener('click', e => {
      if (e.target.closest('.info-card__dismiss')) return;
      triggerOpen(e);
    });

    card.addEventListener('keydown', e => {
      if (e.target.closest('.info-card__dismiss')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        triggerOpen(e);
      }
    });
  });
}

function renderRealContent(heroContainer, stackContainer, latestContainer, apiArticles, restoreBtn) {
  const defaultGuides = [
    {
      category: 'Riset Seismik',
      readTime: '8 Menit Baca',
      title: 'Memahami Siklus Gempa Megathrust & Potensi Gelombang',
      excerpt: 'Analisis mendalam mengenai dinamika lempeng tektonik aktif, pemetaan rekahan dasar laut, dan transmisi sinyal tekanan dasar samudra.',
      content: `Zona megathrust merupakan bidang kontak pertemuan lempeng samudra yang menunjam ke bawah lempeng benua. Akumulasi deformasi elastis selama ratusan tahun dapat terlepas secara tiba-tiba dalam bentuk gempa bermagnitudo besar.

Ketika deformasi ini mengangkat kolom air laut dalam hitungan detik, terciptalah gelombang tsunami dengan panjang gelombang ratusan kilometer yang bergerak mendekati kecepatan jet komersial di perairan terbuka.

Sistem pemantauan InaTEWS menggunakan kombinasi seismometer broadband di darat dan sensor tekanan dasar laut (DART/CBT) untuk memverifikasi apakah anomali gelombang benar-benar tercipta dalam waktu kurang dari 5 menit pascagempa.`,
      authorName: 'Pusat Studi Seismologi',
      authorRole: 'TIM RISET SAMUDRA',
      coverImg: '/img/cover-1.jpg',
      svgThumb: SVGS.waveSlices,
    },
    {
      category: 'Strategi Evakuasi',
      readTime: '7 Menit Baca',
      title: 'Membangun Respons Cepat Warga di Detik-Detik Kritis',
      excerpt: 'Kerangka disiplin evakuasi mandiri berbasis tanda-tanda alam dan peringatan dini BMKG sebelum gelombang pertama tiba.',
      content: `Kunci keselamatan utama di kawasan pesisir adalah reaksi instan tanpa menunggu sirene resmi jika guncangan gempa berlangsung lebih dari 20 detik atau membuat Anda sulit berdiri tegak.

Prinsip 20-20-20:
1. 20 Detik: Jika gempa terasa kuat lebih dari 20 detik,
2. 20 Menit: Anda memiliki perkiraan waktu 20 menit sebelum gelombang rayapan tiba,
3. 20 Meter: Segera berlari menuju shelter atau daratan berketinggian minimal 20 meter di atas permukaan laut.

Gunakan selalu rute darat terbuka dan hindari jembatan muara atau jalan tepi tebing yang berisiko runtuh akibat likuifaksi atau guncangan susulan.`,
      authorName: 'SOP Evakuasi Lapangan',
      authorRole: 'PROTOKOL KESELAMATAN',
      coverImg: '/img/cover-2.jpg',
      svgThumb: SVGS.controlCenter,
    },
    {
      category: 'Teknologi Sensor',
      readTime: '6 Menit Baca',
      title: 'Sensor Buoy & Kabel Bawah Laut: Cara Kerjanya',
      excerpt: 'Membongkar alur transmisi data tekanan hidrostatik dasar samudra ke satelit hingga menjadi notifikasi darurat di ponsel Anda.',
      content: `Teknologi deteksi tsunami modern bertumpu pada Bottom Pressure Recorder (BPR) yang dijangkarkan di kedalaman 2.000 hingga 5.000 meter. Sensor piezoresistif presisi tinggi ini mampu mendeteksi kenaikan muka air laut setipis 1 milimeter di tengah gelombang samudra yang liar.

Data diubah menjadi sinyal akustik bawah air menuju pelampung (buoy) di permukaan, diteruskan ke satelit komunikasi geodesi, lalu dikonfirmasi ke pusat analisis komputasi BMKG dalam hitungan mikrodetik sebelum disebarkan ke publik lewat push notification.`,
      authorName: 'Divisi Instrumentasi Kelautan',
      authorRole: 'ENGINEERING LAB',
      coverImg: '/img/cover-3.jpg',
      svgThumb: SVGS.matrixBars,
    },
    {
      category: 'Market Intelligence',
      readTime: '8 Menit Baca',
      title: 'Deteksi Cepat Penurunan Muka Tanah Pesisir',
      excerpt: 'Korelasi antara subsiden tanah dan amplifikasi tinggi rayapan tsunami di teluk tertutup.',
      content: `Penurunan muka tanah (land subsidence) di kawasan teluk pesisir perkotaan dapat meningkatkan kedalaman genangan tsunami hingga 30-50% lebih luas dibandingkan estimasi model garis pantai statis.

SAMUDRA mengintegrasikan data elevasi topografi digital terbaru (DEMNAS) agar zona risiko genangan selalu merefleksikan kontur ketinggian daratan riil saat ini.`,
      authorName: 'Analisis Geospasial',
      authorRole: 'DATA SCIENTIST',
      coverImg: '/img/cover-4.jpg',
      svgThumb: SVGS.radarDial,
    },
    {
      category: 'Digital Education',
      readTime: '6 Menit Baca',
      title: 'Protokol Golden Time: 20-20-20 di Tepi Pantai',
      excerpt: 'Panduan baku 20 detik guncangan gempa, 20 menit evakuasi mandiri, menuju tempat dengan ketinggian minimal 20 meter.',
      content: `Di era teknologi digital, ponsel Anda adalah kompas evakuasi tercepat. Namun, jangan biarkan proses memverifikasi berita menunda langkah evakuasi Anda.

Jika Anda berada di zona merah pantai dan merasakan lindhu hebat, mulailah bergerak ke elevasi aman sambil memantau peta offline yang sudah terunduh di aplikasi SAMUDRA. Prioritaskan keselamatan fisik sebelum memeriksa gawai.`,
      authorName: 'Pendidikan Kebencanaan',
      authorRole: 'EDUKATOR RESMI',
      coverImg: '/img/bento-evacuation-route.jpg',
      svgThumb: SVGS.satelliteOrbit,
    },
    {
      category: 'Riset Oseanografi',
      readTime: '5 Menit Baca',
      title: 'Pemodelan Batimetri: Bagaimana Topografi Membelokkan Ombak',
      excerpt: 'Simulasi numerik menunjukkan terumbu karang dan palung laut mampu memecah serta mengalihkan konsentrasi energi destruktif gelombang.',
      content: `Topografi dasar laut (batimetri) berperan besar dalam mengarahkan energi tsunami. Palung laut sempit dapat memfokuskan gelombang seperti lensa cembung memfokuskan cahaya, menghasilkan kenaikan run-up yang dahsyat di ujung teluk.

Sebaliknya, ekosistem terumbu karang penghalang yang sehat dan hutan mangrove tebal terbukti secara empiris mereduksi energi kinetik gelombang hingga 66%, menjadikannya pelindung alami tak ternilai bagi warga pesisir.`,
      authorName: 'Oseanografi Terapan',
      authorRole: 'TIM RISET SAMUDRA',
      coverImg: '/img/bento-buoy-warning.jpg',
      svgThumb: SVGS.waveSlices,
    }
  ];

  const allCards = [];

  if (Array.isArray(apiArticles)) {
    apiArticles.forEach(item => {
      const cat = item.category ? item.category.replace(/_/g, ' ').toUpperCase() : 'ARTIKEL RESMI';
      const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru';
      const authorName = item.author?.name ? item.author.name.split('_').pop() : 'Rizal Zaky Firmansyah';
      const authorRole = item.author?.role ? item.author.role.replace(/_/g, ' ').toUpperCase() : 'AUTHOR SAMUDRA';

      allCards.push({
        isBackend: true,
        id: item.id,
        title: item.title,
        content: item.content || 'Konten edukasi dan panduan resmi dari sistem database SAMUDRA.',
        excerpt: item.content ? (item.content.length > 130 ? item.content.slice(0, 130) + '...' : item.content) : 'Konten edukasi dan panduan resmi dari sistem database SAMUDRA.',
        category: cat,
        readTime: `${dateStr} • ${authorName}`,
        dateStr: dateStr,
        authorName: authorName,
        authorRole: authorRole,
        authorAvatar: item.author?.avatarUrl,
        coverImg: item.coverImageUrl,
        svgThumb: SVGS.hero
      });
    });
  }

  defaultGuides.forEach(guide => {
    if (allCards.length < 6) {
      allCards.push(guide);
    }
  });

  // Top Row: 3 Featured InfoCards
  const topCards = allCards.slice(0, 3);
  if (heroContainer) {
    heroContainer.innerHTML = topCards
      .map((item, idx) => createInfoCardHTML(item, idx, 'sorotan', 140, 210))
      .join('');
    attachInfoCardInteractions(heroContainer, topCards, 'sorotan', restoreBtn);
  }

  // Second Row: 3 Latest Insight InfoCards
  const latestCards = allCards.slice(3, 6);
  if (latestContainer) {
    latestContainer.innerHTML = latestCards
      .map((item, idx) => createInfoCardHTML(item, idx + 3, 'edukasi', 140, 210))
      .join('');
    attachInfoCardInteractions(latestContainer, latestCards, 'edukasi', restoreBtn);
  }
}

// ===== ARTICLE READER MODAL POPUP =====
function openArticleModal(item) {
  let modal = document.getElementById('article-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'article-modal';
    modal.className = 'article-modal';
    modal.innerHTML = `
      <div class="article-modal__backdrop"></div>
      <div class="article-modal__dialog" role="dialog" aria-modal="true">
        <button class="article-modal__close" aria-label="Tutup artikel">&times;</button>
        <div class="article-modal__scroll">
          <div class="article-modal__header">
            <div class="article-modal__meta">
              <span class="morgana-badge" id="modal-cat"></span>
              <span class="article-modal__date" id="modal-date"></span>
            </div>
            <h2 class="article-modal__title" id="modal-title"></h2>
            <div class="article-modal__author">
              <div id="modal-avatar-slot"></div>
              <div>
                <div class="article-modal__author-name" id="modal-author"></div>
                <div class="article-modal__author-role" id="modal-role"></div>
              </div>
            </div>
          </div>
          <div class="article-modal__cover" id="modal-cover-slot"></div>
          <div class="article-modal__body" id="modal-body"></div>
          <div class="article-modal__footer">
            <button class="btn btn--primary article-modal__btn-close">Tutup Bacaan</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => {
      modal.classList.remove('article-modal--open');
      document.body.style.overflow = '';
    };

    modal.querySelector('.article-modal__close').onclick = closeModal;
    modal.querySelector('.article-modal__backdrop').onclick = closeModal;
    modal.querySelector('.article-modal__btn-close').onclick = closeModal;

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('article-modal--open')) {
        closeModal();
      }
    });
  }

  // Populate data
  modal.querySelector('#modal-cat').textContent = item.category || 'ARTIKEL';
  modal.querySelector('#modal-date').textContent = item.dateStr || item.readTime || 'Terkini';
  modal.querySelector('#modal-title').textContent = item.title || 'Artikel Mitigasi';

  const avatarSlot = modal.querySelector('#modal-avatar-slot');
  if (item.authorAvatar) {
    avatarSlot.innerHTML = `<img class="article-modal__avatar" src="${item.authorAvatar}" alt="${item.authorName}">`;
  } else {
    const initial = (item.authorName || 'S').trim().charAt(0).toUpperCase();
    avatarSlot.innerHTML = `<div class="article-modal__avatar-placeholder">${initial}</div>`;
  }

  modal.querySelector('#modal-author').textContent = item.authorName || 'Tim Mitigasi SAMUDRA';
  modal.querySelector('#modal-role').textContent = item.authorRole || 'KONTRIBUTOR RESMI';

  const coverSlot = modal.querySelector('#modal-cover-slot');
  if (item.coverImg) {
    coverSlot.style.display = 'block';
    coverSlot.innerHTML = `<img src="${item.coverImg}" alt="${item.title}">`;
  } else {
    coverSlot.style.display = 'none';
    coverSlot.innerHTML = '';
  }

  const bodyEl = modal.querySelector('#modal-body');
  bodyEl.textContent = item.content || item.excerpt || 'Tidak ada teks tambahan.';

  // If this item has an ID from backend, fetch full fresh article details asynchronously
  if (item.id && item.isBackend) {
    fetchArticleById(item.id)
      .then(fresh => {
        if (fresh) {
          if (fresh.title) modal.querySelector('#modal-title').textContent = fresh.title;
          if (fresh.content) bodyEl.textContent = fresh.content;
          if (fresh.author?.name) modal.querySelector('#modal-author').textContent = fresh.author.name;
          if (fresh.author?.avatarUrl) {
            avatarSlot.innerHTML = `<img class="article-modal__avatar" src="${fresh.author.avatarUrl}" alt="${fresh.author.name}">`;
          }
        }
      })
      .catch(() => {});
  }

  // Show modal
  modal.classList.add('article-modal--open');
  document.body.style.overflow = 'hidden';
}
