
import {
  fetchArticleById,
  fetchArticles,
  fetchMitigasi
} from '../api.js';

// DARK AQUA GLASS THEME
const C = {
  text: '#F1F7F6',
  muted: '#B5C8C7',
  soft: '#91AAA9',
  aqua: '#8ADBD3',
  accent: '#55BFB7',
  border: 'rgba(255,255,255,0.16)',
  glass: 'rgba(255,255,255,0.07)',
  glassStrong: 'rgba(255,255,255,0.10)'
};

const glass = `
  background: ${C.glass};
  border: 1px solid ${C.border};
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 14px 35px rgba(0,0,0,0.18);
`;

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

// FORMAT TANGGAL
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
    // Menggunakan Clipboard API jika tersedia
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    }

    // Alternatif untuk browser yang tidak mendukung Clipboard API
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


// MAIN ARTICLE PAGE
export async function renderArticlePage(container, articleId, onBack) {

  container.innerHTML = `
    <div style="
      min-height:100vh;
      width:100%;
      overflow:hidden;
      font-family:Arial,sans-serif;
      color:${C.text};
      background:transparent;
    ">

      <!-- NAVBAR -->
      <header style="
        position:sticky;
        top:0;
        z-index:100;
        display:flex;
        align-items:center;
        justify-content:space-between;
        flex-wrap:wrap;
        gap:15px;
        padding:17px 8%;
        background:rgba(5,18,22,0.76);
        backdrop-filter:blur(22px);
        -webkit-backdrop-filter:blur(22px);
        border-bottom:1px solid ${C.border};
        box-shadow:0 8px 25px rgba(0,0,0,0.15);
      ">

        <button id="article-back-top" style="
          border:1px solid ${C.border};
          background:rgba(255,255,255,0.07);
          color:${C.aqua};
          padding:12px 18px;
          border-radius:30px;
          cursor:pointer;
          font-weight:bold;
          font-size:13px;
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
        ">
          ← Kembali
        </button>

        <a href="/" id="article-nav-logo" style="
          color:${C.text};
          text-decoration:none;
          font-size:22px;
          font-weight:800;
          letter-spacing:3px;
        ">
          SAMUDRA
        </a>

        <button id="article-share-btn" style="
          border:1px solid ${C.border};
          background:rgba(255,255,255,0.07);
          color:${C.aqua};
          padding:12px 19px;
          border-radius:30px;
          cursor:pointer;
          font-size:13px;
          font-weight:bold;
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
        ">
          ↗ <span id="share-label">Bagikan</span>
        </button>

      </header>


      <!-- MAIN CONTENT -->
      <main id="article-content-slot" style="
        width:84%;
        max-width:1200px;
        margin:0 auto;
        padding:65px 0 85px;
      ">

        <div style="
          padding:70px 20px;
          text-align:center;
          color:${C.muted};
          ${glass}
          border-radius:22px;
        ">
          <div style="font-size:42px;margin-bottom:15px;">🌊</div>
          Memuat warta dan informasi mitigasi...
        </div>

      </main>


      <!-- FOOTER -->
      <footer style="
        padding:30px 8%;
        background:rgba(5,18,22,0.72);
        border-top:1px solid ${C.border};
        color:${C.muted};
        display:flex;
        justify-content:space-between;
        align-items:center;
        flex-wrap:wrap;
        gap:15px;
        font-size:12px;
        line-height:1.8;
        backdrop-filter:blur(18px);
        -webkit-backdrop-filter:blur(18px);
      ">
        <span>SAMUDRA.3D — Sistem Antisipasi & Mitigasi Tsunami</span>

        <span>
          Data resmi:
          <a href="https://www.bmkg.go.id"
            target="_blank"
            rel="noopener"
            style="color:${C.aqua};text-decoration:none;font-weight:bold;">
            bmkg.go.id
          </a>
        </span>
      </footer>

    </div>
  `;


  // NAVIGATION
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

  backBtn.onclick = goHome;
  logoBtn.onclick = goHome;

  const contentSlot = container.querySelector('#article-content-slot');

  let articleData = null;
  let allArticlesList = [];


  // AMBIL DATA ARTIKEL
  try {

    allArticlesList = await fetchArticles().catch(() => []);

    if (articleId && articleId.length > 10) {
      try {
        articleData = await fetchArticleById(articleId);
      } catch (error) {
        console.warn('Gagal mengambil detail artikel:', error);
      }
    }

    if (!articleData && Array.isArray(allArticlesList)) {
      articleData = allArticlesList.find(item =>
        item.id === articleId || item.slug === articleId
      );
    }

    // CARI DI DATA MITIGASI
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


  // ARTIKEL DEFAULT
  if (!articleData) {
    articleData = {
      title: 'Memahami Gempa Megathrust dan Potensi Tsunami',
      category: 'Edukasi Tsunami',
      publishedAt: new Date().toISOString(),
      author: {
        name: 'Tim Edukasi SAMUDRA',
        role: 'EDUKASI KEBENCANAAN'
      },
      content: `Gempa megathrust merupakan gempa bumi yang terjadi pada zona pertemuan lempeng tektonik yang saling menunjam.

Jika gempa bawah laut menyebabkan perubahan vertikal dasar laut, perpindahan massa air dapat menghasilkan gelombang tsunami.

Masyarakat yang tinggal di wilayah pesisir perlu memahami risiko bencana, mengenali tanda-tanda alam, serta mengetahui jalur evakuasi terdekat.

Informasi potensi tsunami dan peringatan dini harus selalu merujuk pada informasi resmi BMKG.`
    };
  }


  // NORMALISASI DATA
  const title = articleData.title || 'Artikel SAMUDRA';

  // URL KHUSUS UNTUK DIBAGIKAN
  const shareArticleId = articleData.id || articleData.slug || articleId;

  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set('article', shareArticleId);

  const articleShareUrl = shareUrl.toString();


  // TOMBOL BAGIKAN ARTIKEL
  shareBtn.onclick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Baca artikel ini di SAMUDRA: ${title}`,
          url: articleShareUrl
        });
      } else {
        const success = await copyLink(articleShareUrl);

        if (success) {
          shareLabel.textContent = 'Tautan Disalin ✓';

          setTimeout(() => {
            shareLabel.textContent = 'Bagikan';
          }, 2500);
        } else {
          alert('Gagal menyalin tautan artikel. Silakan salin alamat halaman secara manual.');
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Gagal membagikan artikel:', error);
        alert('Gagal membagikan artikel.');
      }
    }
  };


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

  const paragraphs = (
    articleData.content ||
    'Konten edukasi dan panduan resmi dari SAMUDRA.'
  )
    .split(/\n\n+/)
    .map(text => text.trim())
    .filter(Boolean);

  const sections = paragraphs.map((text, index) => ({
    id: `article-section-${index + 1}`,
    title: [
      'Ikhtisar Situasi',
      'Mengenal Risiko',
      'Langkah Mitigasi',
      'Informasi Tambahan'
    ][index] || `Pembahasan ${index + 1}`,
    content: text
  }));


  // ARTIKEL TERKAIT
  const relatedArticles = Array.isArray(allArticlesList)
    ? allArticlesList
        .filter(item => item.id !== articleData.id)
        .slice(0, 3)
    : [];

  const defaultRelated = [
    {
      id: 'rel-1',
      title: 'Langkah Evakuasi Mandiri Saat Ancaman Tsunami',
      category: 'Panduan Evakuasi',
      excerpt: 'Ketahui tindakan yang harus dilakukan ketika merasakan gempa kuat di wilayah pesisir.',
      author: 'Tim Mitigasi SAMUDRA'
    },
    {
      id: 'rel-2',
      title: 'Bagaimana Sistem Peringatan Dini Tsunami Bekerja?',
      category: 'Teknologi Kebencanaan',
      excerpt: 'Mengenal teknologi pemantauan gempa dan informasi peringatan dini tsunami.',
      author: 'Tim Edukasi SAMUDRA'
    },
    {
      id: 'rel-3',
      title: 'Persiapkan Tas Siaga Bencana untuk Keluarga',
      category: 'Kesiapsiagaan',
      excerpt: 'Kenali perlengkapan penting yang perlu disiapkan untuk menghadapi keadaan darurat.',
      author: 'Tim Edukasi SAMUDRA'
    }
  ];

  const displayRelated = relatedArticles.length
    ? relatedArticles.map(item => ({
        id: item.id,
        title: item.title || 'Artikel SAMUDRA',
        category: (item.category || 'Artikel').replace(/_/g, ' '),
        excerpt: item.content
          ? item.content.slice(0, 120) +
            (item.content.length > 120 ? '...' : '')
          : 'Informasi dan edukasi kebencanaan dari SAMUDRA.',
        author: item.author?.name || 'Tim SAMUDRA',
        coverImg: item.coverImageUrl
      }))
    : defaultRelated;


  // RENDER DETAIL ARTIKEL
  contentSlot.innerHTML = `

    <!-- ARTICLE HEADER -->
    <section style="
      max-width:850px;
      margin:0 auto 45px;
      text-align:center;
    ">

      <span style="
        display:inline-block;
        padding:10px 18px;
        background:rgba(85,191,183,0.12);
        border:1px solid rgba(138,219,211,0.25);
        color:${C.aqua};
        border-radius:30px;
        font-size:11px;
        font-weight:bold;
        letter-spacing:1.5px;
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
      ">
        ${escapeHTML(category)}
      </span>

      <h1 style="
        color:${C.text};
        font-size:clamp(30px,4.5vw,48px);
        line-height:1.25;
        margin:25px 0 20px;
      ">
        ${escapeHTML(title)}
      </h1>

      <p style="
        color:${C.muted};
        font-size:14px;
        line-height:1.8;
        margin-bottom:22px;
      ">
        Informasi dan edukasi kebencanaan bersama SAMUDRA.
      </p>

      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        gap:12px;
        flex-wrap:wrap;
        color:${C.soft};
        font-size:12px;
      ">

        ${
          avatarUrl
            ? `<img src="${avatarUrl}" alt="${escapeHTML(authorName)}"
                style="
                  width:40px;
                  height:40px;
                  border-radius:50%;
                  object-fit:cover;
                  border:2px solid ${C.border};
                ">`
            : `<div style="
                width:40px;
                height:40px;
                border-radius:50%;
                background:rgba(85,191,183,0.18);
                border:1px solid rgba(138,219,211,0.3);
                color:${C.aqua};
                display:flex;
                align-items:center;
                justify-content:center;
                font-weight:bold;
                font-size:16px;
              ">${escapeHTML(authorName.charAt(0).toUpperCase())}</div>`
        }

        <div style="text-align:left;">
          <strong style="display:block;color:${C.text};font-size:13px;">
            ${escapeHTML(authorName)}
          </strong>
          <span>${escapeHTML(authorRole)}</span>
        </div>

        <span>•</span>
        <span>${escapeHTML(dateStr)}</span>
        <span>•</span>
        <span>5 menit baca</span>

      </div>

    </section>


    <!-- FEATURED IMAGE -->
    <section style="
      width:100%;
      margin:0 auto 65px;
      position:relative;
    ">

      <div style="
        position:absolute;
        inset:10% 5%;
        background:${C.accent};
        filter:blur(80px);
        opacity:0.13;
        z-index:0;
      "></div>

      <div style="
        position:relative;
        z-index:1;
        height:clamp(240px,42vw,480px);
        overflow:hidden;
        border-radius:24px;
        background:rgba(255,255,255,0.05);
        border:1px solid ${C.border};
        box-shadow:0 15px 45px rgba(0,0,0,0.25);
      ">

        ${
          coverImage
            ? `<img src="${coverImage}" alt="${escapeHTML(title)}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  display:block;
                  filter:brightness(0.82);
                ">`
            : `
              <div style="
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                color:white;
                gap:15px;
                background:
                  radial-gradient(circle at center,rgba(85,191,183,0.25),transparent 55%),
                  rgba(255,255,255,0.035);
              ">
                <span style="font-size:90px;">🌊</span>
                <span style="
                  letter-spacing:4px;
                  font-size:13px;
                  font-weight:bold;
                  color:${C.aqua};
                ">
                  SAMUDRA INFORMATION
                </span>
              </div>
            `
        }

      </div>
    </section>


    <!-- ARTICLE BODY -->
    <section style="
      display:flex;
      align-items:flex-start;
      flex-wrap:wrap;
      gap:35px;
      margin-bottom:80px;
    ">

      <!-- TABLE OF CONTENTS -->
      <aside style="
        flex:0 1 230px;
        min-width:210px;
        position:sticky;
        top:95px;
        padding:24px;
        ${glass}
        border-radius:20px;
      ">

        <h3 style="
          color:${C.text};
          font-size:15px;
          margin:0 0 20px;
        ">
          Daftar Isi
        </h3>

        <nav style="
          display:flex;
          flex-direction:column;
          gap:15px;
        ">
          ${sections.map((section, index) => `
            <a href="#${section.id}" style="
              color:${index === 0 ? C.aqua : C.muted};
              text-decoration:none;
              font-size:12px;
              line-height:1.6;
              transition:color .2s;
            ">
              ${String(index + 1).padStart(2, '0')}.
              ${escapeHTML(section.title)}
            </a>
          `).join('')}
        </nav>

        <div style="
          border-top:1px solid ${C.border};
          margin-top:25px;
          padding-top:18px;
        ">
          <p style="
            color:${C.text};
            font-size:12px;
            font-weight:bold;
            margin-bottom:12px;
          ">
            Bagikan artikel
          </p>

          <button id="share-copy-btn" style="
            border:1px solid rgba(138,219,211,0.25);
            background:rgba(85,191,183,0.17);
            color:${C.aqua};
            border-radius:30px;
            padding:11px 13px;
            font-size:12px;
            cursor:pointer;
            width:100%;
            margin-bottom:9px;
            font-weight:bold;
          ">
            Salin Tautan
          </button>

          <button id="share-wa-btn" style="
            border:1px solid ${C.border};
            background:rgba(255,255,255,0.07);
            color:${C.text};
            border-radius:30px;
            padding:11px 13px;
            font-size:12px;
            cursor:pointer;
            width:100%;
            font-weight:bold;
          ">
            WhatsApp ↗
          </button>
        </div>

      </aside>


      <!-- ARTICLE CONTENT -->
      <div style="
        flex:1 1 500px;
        min-width:0;
        max-width:760px;
        ${glass}
        border-radius:22px;
        padding:clamp(22px,4vw,38px);
      ">

        ${sections.map((section, index) => `
          <section id="${section.id}" style="
            margin-bottom:38px;
            scroll-margin-top:110px;
          ">

            <span style="
              color:${C.aqua};
              font-size:11px;
              font-weight:bold;
              letter-spacing:1.5px;
            ">
              BAGIAN ${String(index + 1).padStart(2, '0')}
            </span>

            <h2 style="
              color:${C.text};
              font-size:25px;
              line-height:1.4;
              margin:10px 0 18px;
            ">
              ${escapeHTML(section.title)}
            </h2>

            <p style="
              color:${C.muted};
              font-size:15px;
              line-height:2;
              white-space:pre-line;
              margin:0;
            ">
              ${escapeHTML(section.content)}
            </p>

            ${
              index === 1
                ? `
                  <blockquote style="
                    margin:30px 0;
                    padding:23px 25px;
                    background:rgba(85,191,183,0.08);
                    border:1px solid rgba(138,219,211,0.2);
                    border-left:4px solid ${C.accent};
                    border-radius:0 16px 16px 0;
                    color:${C.muted};
                    line-height:1.9;
                    font-size:14px;
                  ">
                    <strong style="
                      display:block;
                      margin-bottom:8px;
                      color:${C.aqua};
                    ">
                      Ingat!
                    </strong>
                    Keselamatan di wilayah pesisir membutuhkan kesiapsiagaan.
                    Kenali tanda bahaya dan segera lakukan evakuasi ketika
                    terdapat ancaman tsunami.
                  </blockquote>
                `
                : ''
            }

          </section>
        `).join('')}

      </div>

    </section>


    <!-- CTA SIMULASI -->
    <section style="
      position:relative;
      overflow:hidden;
      padding:55px 8%;
      border-radius:25px;
      background:
        radial-gradient(circle at 10% 10%,rgba(138,219,211,0.16),transparent 38%),
        rgba(255,255,255,0.07);
      border:1px solid ${C.border};
      color:${C.text};
      margin-bottom:80px;
      text-align:center;
      backdrop-filter:blur(20px);
      -webkit-backdrop-filter:blur(20px);
      box-shadow:0 15px 40px rgba(0,0,0,0.2);
    ">

      <span style="
        position:relative;
        color:${C.aqua};
        font-size:11px;
        font-weight:bold;
        letter-spacing:2px;
      ">
        SAMUDRA • KESIAPSIAGAAN MANDIRI
      </span>

      <h2 style="
        position:relative;
        font-size:clamp(23px,3vw,34px);
        line-height:1.4;
        margin:18px 0;
        color:${C.text};
      ">
        Kenali Risiko, Persiapkan Evakuasi.
      </h2>

      <p style="
        position:relative;
        max-width:650px;
        margin:0 auto;
        color:${C.muted};
        font-size:14px;
        line-height:1.9;
      ">
        Pelajari kondisi wilayah dan tingkatkan kesiapsiagaan
        melalui simulasi serta informasi mitigasi SAMUDRA.
      </p>

      <div style="
        position:relative;
        display:flex;
        justify-content:center;
        flex-wrap:wrap;
        gap:12px;
        margin-top:25px;
      ">

        <button id="banner-action-home" style="
          padding:14px 23px;
          border:1px solid rgba(138,219,211,0.3);
          border-radius:30px;
          background:rgba(85,191,183,0.2);
          color:${C.aqua};
          font-weight:bold;
          cursor:pointer;
        ">
          Buka Simulasi 3D →
        </button>

        <button id="banner-action-back" style="
          padding:14px 23px;
          border:1px solid ${C.border};
          border-radius:30px;
          background:rgba(255,255,255,0.07);
          color:${C.text};
          font-weight:bold;
          cursor:pointer;
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
        ">
          Kembali ke Beranda
        </button>

      </div>

    </section>


    <!-- RELATED ARTICLES -->
    <section style="margin-bottom:75px;">

      <div style="margin-bottom:28px;">

        <span style="
          color:${C.aqua};
          font-size:11px;
          font-weight:bold;
          letter-spacing:2px;
        ">
          JELAJAHI INFORMASI
        </span>

        <h2 style="
          color:${C.text};
          font-size:30px;
          margin:12px 0;
        ">
          Riset & Warta Terkait
        </h2>

        <p style="
          color:${C.muted};
          font-size:14px;
          line-height:1.8;
        ">
          Temukan informasi lain untuk memperluas pengetahuan
          mengenai mitigasi dan kesiapsiagaan tsunami.
        </p>

      </div>


      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:22px;
      ">

        ${displayRelated.map(card => {
          const image = safeImageUrl(card.coverImg);

          return `
            <a href="?article=${encodeURIComponent(card.id)}"
              data-rel-id="${escapeHTML(card.id)}"
              style="
                display:flex;
                flex-direction:column;
                overflow:hidden;
                border:1px solid ${C.border};
                border-radius:20px;
                background:rgba(255,255,255,0.065);
                backdrop-filter:blur(16px);
                -webkit-backdrop-filter:blur(16px);
                text-decoration:none;
                color:inherit;
                box-shadow:0 8px 25px rgba(0,0,0,0.16);
                transition:transform .2s,box-shadow .2s;
              "
            >

              <div style="
                height:170px;
                overflow:hidden;
                background:rgba(85,191,183,0.12);
                display:flex;
                justify-content:center;
                align-items:center;
              ">
                ${
                  image
                    ? `<img src="${image}" alt="${escapeHTML(card.title)}"
                        loading="lazy"
                        style="
                          width:100%;
                          height:100%;
                          object-fit:cover;
                          display:block;
                          filter:brightness(0.82);
                        ">`
                    : `<span style="font-size:55px;">🌊</span>`
                }
              </div>

              <div style="
                padding:20px;
                display:flex;
                flex-direction:column;
                flex:1;
              ">

                <span style="
                  color:${C.aqua};
                  font-size:10px;
                  font-weight:bold;
                  letter-spacing:1px;
                  text-transform:uppercase;
                ">
                  ${escapeHTML(card.category)}
                </span>

                <h3 style="
                  color:${C.text};
                  font-size:17px;
                  line-height:1.5;
                  margin:12px 0;
                ">
                  ${escapeHTML(card.title)}
                </h3>

                <p style="
                  color:${C.muted};
                  font-size:12px;
                  line-height:1.8;
                  flex:1;
                ">
                  ${escapeHTML(card.excerpt)}
                </p>

                <span style="
                  border-top:1px solid ${C.border};
                  padding-top:14px;
                  margin-top:15px;
                  color:${C.aqua};
                  font-size:12px;
                  font-weight:bold;
                ">
                  Baca Selengkapnya →
                </span>

              </div>

            </a>
          `;
        }).join('')}

      </div>

    </section>


    <!-- INFORMATION CTA -->
    <section style="
      padding:40px 25px;
      ${glass}
      border-radius:22px;
      text-align:center;
    ">

      <span style="
        color:${C.aqua};
        font-size:11px;
        font-weight:bold;
        letter-spacing:2px;
      ">
        SAMUDRA INFORMATION
      </span>

      <h2 style="
        color:${C.text};
        font-size:25px;
        margin:13px 0;
      ">
        Tetap Waspada Bersama SAMUDRA
      </h2>

      <p style="
        color:${C.muted};
        font-size:13px;
        line-height:1.8;
        max-width:570px;
        margin:0 auto;
      ">
        Terus tingkatkan pengetahuan mengenai bencana tsunami
        dan ikuti informasi resmi dari BMKG.
      </p>

      <a href="https://www.bmkg.go.id"
        target="_blank"
        rel="noopener"
        style="
          display:inline-block;
          margin-top:20px;
          padding:13px 23px;
          background:linear-gradient(135deg,#55BFB7,#268D8A);
          color:white;
          text-decoration:none;
          border-radius:30px;
          font-size:13px;
          font-weight:bold;
          border:1px solid rgba(255,255,255,0.2);
          box-shadow:0 7px 18px rgba(38,159,169,0.18);
        ">
        Kunjungi BMKG →
      </a>

    </section>

  `;


  // TOMBOL CTA
  const bannerHomeBtn = contentSlot.querySelector('#banner-action-home');
  const bannerBackBtn = contentSlot.querySelector('#banner-action-back');

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

  bannerBackBtn.onclick = goHome;


  // SALIN LINK
  const copyBtn = contentSlot.querySelector('#share-copy-btn');

  copyBtn.onclick = async () => {
    const success = await copyLink(articleShareUrl);

    if (success) {
      copyBtn.textContent = 'Tautan Berhasil Disalin ✓';

      setTimeout(() => {
        copyBtn.textContent = 'Salin Tautan';
      }, 2500);
    } else {
      alert('Tidak dapat menyalin tautan. Silakan salin alamat halaman secara manual.');
    }
  };


  // SHARE WHATSAPP
  const waBtn = contentSlot.querySelector('#share-wa-btn');

  waBtn.onclick = () => {
    const text = `Baca artikel ini di SAMUDRA!\n\n${title}\n\n${articleShareUrl}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };


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

    // EFEK HOVER CARD
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 15px 35px rgba(0,0,0,0.28)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.16)';
    });

  });


  // KEMBALI KE ATAS
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  });

}
