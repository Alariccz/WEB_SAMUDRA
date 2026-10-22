import { fetchArticleById, fetchArticles, fetchMitigasi } from '../api.js';

export async function renderArticlePage(container, articleId, onBack) {
  container.innerHTML = `
    <div class="article-page">
      <!-- Ambient Background Glows -->
      <div class="article-bg-aura article-bg-aura--top"></div>
      <div class="article-bg-aura article-bg-aura--mid"></div>

      <!-- Article Page Navbar -->
      <header class="article-page__nav">
        <button class="article-page__back-btn" id="article-back-top">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Kembali ke Beranda
        </button>

        <a class="nav__logo" href="/" id="article-nav-logo">SAMUDRA</a>

        <button class="btn btn--outline" id="article-share-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          <span id="share-label">Bagikan</span>
        </button>
      </header>

      <!-- Main Article Container -->
      <main class="article-page__main" id="article-content-slot">
        <div class="article-page__loading">
          <div class="article-page__spinner"></div>
          <p>Memuat warta & riset mitigasi...</p>
        </div>
      </main>

      <!-- Footer -->
      <footer>
        <span>SAMUDRA.3D &mdash; Sistem Antisipasi &amp; Mitigasi Tsunami</span>
        <span>Data resmi: <a href="https://bmkg.go.id" target="_blank" rel="noopener">bmkg.go.id</a></span>
      </footer>
    </div>
  `;

  // Hook navigation buttons
  const backBtn = container.querySelector('#article-back-top');
  const logoBtn = container.querySelector('#article-nav-logo');
  const shareBtn = container.querySelector('#article-share-btn');
  const shareLabel = container.querySelector('#share-label');

  const goHome = (e) => {
    if (e) e.preventDefault();
    if (onBack) onBack();
  };

  backBtn.onclick = goHome;
  logoBtn.onclick = goHome;

  shareBtn.onclick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      shareLabel.textContent = 'Tautan Disalin! ✓';
      setTimeout(() => { shareLabel.textContent = 'Bagikan'; }, 2500);
    }
  };

  const contentSlot = container.querySelector('#article-content-slot');
  let articleData = null;
  let allArticlesList = [];

  try {
    // 1. Fetch all articles for "Latest / Related Articles" grid
    allArticlesList = await fetchArticles().catch(() => []);

    // 2. Try single article API
    if (articleId && articleId.length > 10) {
      try {
        articleData = await fetchArticleById(articleId);
      } catch (e) {
        console.warn('Single article fetch failed, checking list:', e);
      }
    }

    // 3. If not found, search in articles list
    if (!articleData && Array.isArray(allArticlesList)) {
      articleData = allArticlesList.find(a => a.id === articleId || a.slug === articleId);
    }

    // 4. If still not found, check in mitigasi list
    if (!articleData) {
      const allMitigasi = await fetchMitigasi().catch(() => []);
      const mit = allMitigasi.find(m => m.id === articleId);
      if (mit) {
        articleData = {
          title: mit.title,
          content: mit.description,
          category: `LANGKAH MITIGASI ${mit.stepNumber ? '0' + mit.stepNumber : ''}`,
          coverImageUrl: mit.imageUrl,
          author: { name: 'Tim Mitigasi SAMUDRA', role: 'SOP TANGGAP DARURAT' },
          publishedAt: mit.createdAt
        };
      }
    }
  } catch (err) {
    console.error('Failed to load article:', err);
  }

  // Fallback if ID is guide or not found
  if (!articleData) {
    articleData = {
      title: 'Memahami Siklus Gempa Megathrust & Potensi Gelombang',
      category: 'Riset Seismik',
      publishedAt: new Date().toISOString(),
      author: { name: 'Pusat Studi Seismologi', role: 'TIM RISET SAMUDRA' },
      content: `Zona megathrust merupakan bidang kontak pertemuan lempeng samudra yang menunjam ke bawah lempeng benua. Akumulasi deformasi elastis selama ratusan tahun dapat terlepas secara tiba-tiba dalam bentuk gempa bermagnitudo besar.

Ketika deformasi ini mengangkat kolom air laut dalam hitungan detik, terciptalah gelombang tsunami dengan panjang gelombang ratusan kilometer yang bergerak mendekati kecepatan jet komersial di perairan terbuka.

Sistem pemantauan InaTEWS menggunakan kombinasi seismometer broadband di darat dan sensor tekanan dasar laut (DART/CBT) untuk memverifikasi apakah anomali gelombang benar-benar tercipta dalam waktu kurang dari 5 menit pascagempa.

Prinsip Utama Evakuasi Mandiri 20-20-20:
- 20 Detik: Jika gempa terasa kuat lebih dari 20 detik,
- 20 Menit: Anda memiliki perkiraan waktu 20 menit sebelum gelombang rayapan tiba di pantai,
- 20 Meter: Segera berlari menuju shelter atau daratan berketinggian minimal 20 meter di atas permukaan laut.`
    };
  }

  // Normalize details
  const cat = articleData.category ? articleData.category.replace(/_/g, ' ').toUpperCase() : 'EDUKASI TSUNAMI';
  const dateStr = articleData.publishedAt ? new Date(articleData.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '21 Okt 2026';
  const authorName = articleData.author?.name ? articleData.author.name.split('_').pop() : 'Rizal Zaky Firmansyah';
  const authorRole = articleData.author?.role ? articleData.author.role.replace(/_/g, ' ').toUpperCase() : 'TIM KONTRIBUTOR RESMI';
  const avatarUrl = articleData.author?.avatarUrl;
  const readTime = '5 min read';

  // Build content sections and Table of Contents
  const rawParagraphs = (articleData.content || 'Konten edukasi dan panduan resmi dari sistem database SAMUDRA.')
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean);

  const sections = rawParagraphs.map((para, idx) => ({
    id: `sec-${idx + 1}`,
    title: idx === 0 ? 'Ikhtisar Situasi' : (idx === 1 ? 'Analisis Dampak' : (idx === 2 ? 'Langkah Tindakan Kritis' : `Protokol Bagian ${idx + 1}`)),
    content: para
  }));

  // Related articles (filter out current article)
  const relatedArticles = Array.isArray(allArticlesList)
    ? allArticlesList.filter(a => a.id !== articleData.id).slice(0, 3)
    : [];

  // Fallback related cards if API list is small
  const defaultRelated = [
    {
      id: 'rel-1',
      title: 'Protokol Golden Time: 20-20-20 di Kawasan Tepi Pantai',
      category: 'Strategi Evakuasi',
      date: '20 Okt 2026',
      author: 'Tim Mitigasi',
      excerpt: 'Panduan baku 20 detik guncangan, 20 menit evakuasi mandiri, menuju tempat 20 meter.',
      tags: ['#Evakuasi', '#GoldenTime']
    },
    {
      id: 'rel-2',
      title: 'Sensor Buoy & Kabel Bawah Laut: Cara Deteksi Tsunami Bekerja',
      category: 'Teknologi Sensor',
      date: '19 Okt 2026',
      author: 'Divisi Oseanografi',
      excerpt: 'Membongkar transmisi sinyal tekanan hidrostatik dasar samudra ke satelit hingga ponsel.',
      tags: ['#Sensor', '#InaTEWS']
    },
    {
      id: 'rel-3',
      title: 'Pemodelan Batimetri: Bagaimana Topografi Laut Membelokkan Ombak',
      category: 'Riset Seismik',
      date: '18 Okt 2026',
      author: 'Lab Geospasial',
      excerpt: 'Simulasi numerik bagaimana terumbu karang dan palung laut memfokuskan energi gelombang.',
      tags: ['#Batimetri', '#Model3D']
    }
  ];

  const displayRelated = relatedArticles.length > 0
    ? relatedArticles.map(a => ({
        id: a.id,
        title: a.title,
        category: (a.category || 'Artikel').replace(/_/g, ' '),
        date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru',
        author: a.author?.name ? a.author.name.split('_').pop() : 'Rizal Zaky',
        coverImg: a.coverImageUrl,
        excerpt: a.content ? (a.content.length > 90 ? a.content.slice(0, 90) + '...' : a.content) : 'Panduan mitigasi resmi.',
        tags: ['#Samudra', '#Mitigasi']
      }))
    : defaultRelated;

  contentSlot.innerHTML = `
    <article class="article-page__content">
      <!-- Centered Header Section (Like Reference) -->
      <div class="article-hero-header">
        <div class="article-hero__badge-wrap">
          <span class="article-pill-badge">${cat}</span>
        </div>
        <h1 class="article-hero__title">${articleData.title}</h1>
        <div class="article-hero__byline">
          ${avatarUrl ? `
            <img class="article-hero__avatar" src="${avatarUrl}" alt="${authorName}">
          ` : `
            <div class="article-hero__avatar-placeholder">${authorName.charAt(0).toUpperCase()}</div>
          `}
          <span class="article-hero__author-name">${authorName}</span>
          <span class="article-hero__sep">&bull;</span>
          <span class="article-hero__date">${dateStr}</span>
          <span class="article-hero__sep">&bull;</span>
          <span class="article-hero__readtime">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px;">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${readTime}
          </span>
        </div>
      </div>

      <!-- Featured Image with Ambient Blue Radiant Glow Backdrop -->
      <div class="article-hero-visual-card">
        <div class="article-hero-glow"></div>
        <div class="article-hero-image-wrap">
          ${articleData.coverImageUrl ? `
            <img src="${articleData.coverImageUrl}" alt="${articleData.title}">
          ` : `
            <div class="article-hero-fallback-mesh">
              <svg viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
                <defs>
                  <radialGradient id="meshBlue" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#00d2ff" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#020816" stop-opacity="0.9"/>
                  </radialGradient>
                </defs>
                <rect width="800" height="450" fill="url(#meshBlue)"/>
                <circle cx="400" cy="225" r="140" stroke="#00d2ff" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.4"/>
                <path d="M260 270 Q400 150 540 270" stroke="#00d2ff" stroke-width="2.5" fill="none" opacity="0.7"/>
                <text x="400" y="320" fill="#38bdf8" font-size="14" font-family="'JetBrains Mono', monospace" text-anchor="middle" letter-spacing="3">SAMUDRA 3D MITIGASI</text>
              </svg>
            </div>
          `}
        </div>
      </div>

      <!-- Two-Column Layout (Sidebar Contents + Article Body) -->
      <div class="article-layout">
        <!-- Left Sidebar: Contents + Share Links -->
        <aside class="article-sidebar">
          <div class="article-sidebar__sticky">
            <h4 class="article-sidebar__title">Daftar Isi</h4>
            <nav class="article-sidebar__toc">
              ${sections.map((sec, i) => `
                <a href="#${sec.id}" class="article-toc-link ${i === 0 ? 'article-toc-link--active' : ''}">
                  <span class="article-toc-line"></span>
                  ${sec.title}
                </a>
              `).join('')}
            </nav>

            <div class="article-sidebar__share">
              <h5 class="article-sidebar__share-title">Bagikan artikel ini</h5>
              <div class="article-share-icons">
                <button class="article-share-icon-btn" id="share-copy-btn" title="Salin Tautan">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </button>
                <button class="article-share-icon-btn" id="share-wa-btn" title="Bagikan ke WhatsApp">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </button>
                <button class="article-share-icon-btn" id="share-tw-btn" title="Bagikan ke Twitter / X">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right Main Content Area -->
        <div class="article-main-body">
          ${sections.map((sec, idx) => `
            <section class="article-body-section" id="${sec.id}">
              <h3 class="article-body-section__title">${sec.title}</h3>
              <p class="article-body-section__text">${sec.content.replace(/\n/g, '<br>')}</p>
              ${idx === 1 ? `
                <blockquote class="article-callout-quote">
                  <p>&ldquo;Kunci keselamatan di pesisir adalah reaksi tanggap instan tanpa menunggu kepanikan massa. Detik-detik pertama guncangan menentukan keselamatan jiwa Anda.&rdquo;</p>
                  <cite>&mdash; SOP Evaluasi Mandiri SAMUDRA</cite>
                </blockquote>
              ` : ''}
            </section>
          `).join('')}
        </div>
      </div>

      <!-- Feature Banner Card ("Achieve impressive results" reference style) -->
      <div class="article-glow-banner">
        <div class="article-glow-banner__bg-mesh"></div>
        <div class="article-glow-banner__content">
          <span class="article-pill-badge article-pill-badge--cyan">Kesiapsiagaan Mandiri</span>
          <h2 class="article-glow-banner__title">Uji Simulasi &amp; Peta Evakuasi Sekarang</h2>
          <p class="article-glow-banner__desc">
            Amati bagaimana elevasi topografi dan gelombang air laut dimodelkan dalam kanvas 3D interaktif SAMUDRA untuk menentukan rute evakuasi tercepat.
          </p>
          <div class="article-glow-banner__actions">
            <button class="btn btn--primary" id="banner-action-home">Buka Simulasi 3D &rarr;</button>
            <button class="btn btn--outline" id="banner-action-back">Kembali ke Beranda</button>
          </div>
        </div>
      </div>

      <!-- Related / Latest Articles Cards (Like "Latest Blog" reference) -->
      <div class="article-related-section">
        <div class="article-related__header">
          <h3 class="article-related__title">Riset &amp; Warta Terkait</h3>
          <p class="article-related__desc">Edukasi mitigasi, pemodelan oseanografi, dan kabar peringatan dini terkini.</p>
        </div>

        <div class="article-related__grid">
          ${displayRelated.map(card => `
            <a class="article-related-card" href="?article=${encodeURIComponent(card.id)}" data-rel-id="${card.id}">
              <div class="article-related-card__thumb">
                ${card.coverImg ? `<img src="${card.coverImg}" alt="${card.title}" loading="lazy">` : `
                  <div class="article-related-card__thumb-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="1.5"><path d="M2 12h20M2 12l5-5m-5 5l5 5"/></svg>
                  </div>
                `}
              </div>
              <div class="article-related-card__body">
                <div class="article-related-card__meta">
                  <span class="article-related-card__author">${card.author}</span>
                  <span>&bull;</span>
                  <span>${card.date}</span>
                </div>
                <h4 class="article-related-card__title">${card.title}</h4>
                <p class="article-related-card__excerpt">${card.excerpt}</p>
                <div class="article-related-card__tags">
                  ${(card.tags || ['#Mitigasi', '#Tsunami']).map(tag => `
                    <span class="article-tag-pill">${tag}</span>
                  `).join('')}
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Newsletter / Notification Card ("Stay Updated" reference style) -->
      <div class="article-newsletter-card">
        <div class="article-newsletter-card__glow"></div>
        <div class="article-newsletter-card__content">
          <h3 class="article-newsletter-card__title">Tetap Waspada Bersama SAMUDRA</h3>
          <p class="article-newsletter-card__desc">
            Dapatkan pembaruan langsung buletin edukasi mitigasi dan integrasi peringatan dini resmi BMKG.
          </p>
          <form class="article-newsletter-form" onsubmit="event.preventDefault(); alert('Terima kasih! Anda terdaftar dalam buletin edukasi SAMUDRA.');">
            <input type="email" class="article-newsletter-input" placeholder="Masukkan alamat email Anda..." required>
            <button type="submit" class="btn btn--primary article-newsletter-btn">Daftar Sekarang</button>
          </form>
        </div>
      </div>
    </article>
  `;

  // Hook CTA and Related Cards
  const bannerHomeBtn = contentSlot.querySelector('#banner-action-home');
  const bannerBackBtn = contentSlot.querySelector('#banner-action-back');
  if (bannerHomeBtn) {
    bannerHomeBtn.onclick = () => {
      goHome();
      setTimeout(() => {
        const el = document.getElementById('simulasi');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
  }
  if (bannerBackBtn) {
    bannerBackBtn.onclick = goHome;
  }

  // Hook share buttons
  const copyBtn = contentSlot.querySelector('#share-copy-btn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert('Tautan artikel berhasil disalin!');
      }
    };
  }
  const waBtn = contentSlot.querySelector('#share-wa-btn');
  if (waBtn) {
    waBtn.onclick = () => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(articleData.title + ' ' + window.location.href)}`, '_blank');
    };
  }
  const twBtn = contentSlot.querySelector('#share-tw-btn');
  if (twBtn) {
    twBtn.onclick = () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(articleData.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
    };
  }

  // Hook related article navigation
  contentSlot.querySelectorAll('.article-related-card').forEach(card => {
    const relId = card.getAttribute('data-rel-id');
    card.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (typeof window.__navigateToArticle === 'function') {
        window.__navigateToArticle(relId);
      }
    });
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}
