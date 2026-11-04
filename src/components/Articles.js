import { fetchArticles, fetchArticleById } from '../api.js';

// PALET WARNA (Inspirasi Dribbble Lodge / Nature Retreat)
// Deep navy: #060E12 | Ocean blue: #2B5161 | Muted blue: #58818F
// White: #FEFEFE | Soft grey-blue: #A5B5BC | Warm earthy accent: #BB4019

// KONFIGURASI PAGINATION
const ITEMS_PER_PAGE = 8;
let currentCatalogPage = 1;

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

// DATA ARTIKEL CADANGAN (Hanya digunakan jika koneksi API gagal total)
const DEFAULT_GUIDES = [
  {
    id: 'default-guide-1',
    category: 'Edukasi Tsunami',
    title: 'Memahami Gempa Megathrust dan Potensi Tsunami',
    excerpt: 'Mengenal proses terjadinya gempa megathrust serta kaitannya dengan potensi terbentuknya gelombang tsunami.',
    content: `Gempa megathrust merupakan gempa bumi yang terjadi pada zona pertemuan lempeng tektonik yang saling menunjam.

Jika gempa bawah laut menyebabkan perubahan vertikal dasar laut, perpindahan massa air dapat menghasilkan gelombang tsunami.

Masyarakat yang tinggal di wilayah pesisir perlu memahami risiko bencana, mengenali tanda-tanda alam, serta mengetahui jalur evakuasi terdekat.

Informasi potensi tsunami dan peringatan dini harus selalu merujuk pada informasi resmi BMKG.`,
    authorName: 'Tim Edukasi SAMUDRA',
    authorRole: 'EDUKASI KEBENCANAAN',
    readTime: 'Edukasi'
  },
  {
    id: 'default-guide-2',
    category: 'Panduan Evakuasi',
    title: 'Langkah Cepat Menyelamatkan Diri Saat Ancaman Tsunami',
    excerpt: 'Ketahui tindakan yang harus dilakukan ketika merasakan gempa kuat di wilayah pesisir.',
    content: `Jika merasakan gempa kuat atau berlangsung lama di wilayah pesisir, segera lakukan perlindungan diri ketika guncangan terjadi.

Setelah guncangan berhenti, segera menjauh dari pantai dan menuju tempat yang lebih tinggi atau lokasi evakuasi yang telah ditentukan.

Jangan menunggu sirene jika terdapat tanda alami tsunami. Ikuti arahan petugas dan informasi resmi dari BMKG.`,
    authorName: 'Tim Mitigasi SAMUDRA',
    authorRole: 'PANDUAN KESELAMATAN',
    readTime: 'Panduan'
  },
  {
    id: 'default-guide-3',
    category: 'Kesiapsiagaan',
    title: 'Persiapkan Tas Siaga Bencana untuk Keluarga',
    excerpt: 'Kenali perlengkapan penting yang sebaiknya tersedia untuk menghadapi kondisi darurat.',
    content: `Tas siaga bencana merupakan perlengkapan yang disiapkan untuk membantu kebutuhan dasar ketika terjadi keadaan darurat.

Beberapa perlengkapan yang dapat disiapkan antara lain air minum, makanan tahan lama, obat-obatan pribadi, senter, baterai, peluit, pakaian, dokumen penting, dan perlengkapan kebersihan.

Simpan tas di tempat yang mudah dijangkau dan pastikan seluruh anggota keluarga mengetahui lokasinya.`,
    authorName: 'Tim Edukasi SAMUDRA',
    authorRole: 'KESIAPSIAGAAN',
    readTime: 'Tips'
  },
  {
    id: 'default-guide-4',
    category: 'Informasi Bencana',
    title: 'Pentingnya Mengenali Jalur Evakuasi di Wilayah Pesisir',
    excerpt: 'Jalur evakuasi membantu masyarakat bergerak menuju lokasi aman ketika terjadi ancaman tsunami.',
    content: `Jalur evakuasi merupakan rute yang digunakan untuk mencapai lokasi aman ketika terjadi bencana.

Masyarakat di wilayah pesisir perlu mengetahui jalur evakuasi, titik kumpul, dan lokasi tempat yang lebih tinggi.

Pelajari rute sebelum bencana terjadi agar tidak kebingungan ketika harus melakukan evakuasi.`,
    authorName: 'Tim Mitigasi SAMUDRA',
    authorRole: 'INFORMASI KEBENCANAAN',
    readTime: 'Edukasi'
  },
  {
    id: 'default-guide-5',
    category: 'Teknologi Kebencanaan',
    title: 'Bagaimana Sistem Peringatan Dini Tsunami Bekerja?',
    excerpt: 'Mengenal peran teknologi pemantauan gempa dan sistem peringatan dini tsunami.',
    content: `Sistem peringatan dini tsunami menggunakan informasi gempa bumi dan pemantauan kondisi laut untuk memperkirakan potensi tsunami.

BMKG menganalisis parameter gempa dan informasi pendukung untuk menentukan apakah peringatan tsunami perlu disampaikan kepada masyarakat.

Informasi resmi perlu diperhatikan agar masyarakat dapat mengambil tindakan yang tepat.`,
    authorName: 'Tim Edukasi SAMUDRA',
    authorRole: 'TEKNOLOGI KEBENCANAAN',
    readTime: 'Edukasi'
  },
  {
    id: 'default-guide-6',
    category: 'Lingkungan Pesisir',
    title: 'Peran Ekosistem Pesisir dalam Mengurangi Risiko Bencana',
    excerpt: 'Mengenal fungsi mangrove dan ekosistem pesisir dalam mendukung perlindungan wilayah pantai.',
    content: `Ekosistem pesisir seperti hutan mangrove dan terumbu karang memiliki peran penting dalam menjaga keseimbangan lingkungan.

Mangrove dapat membantu mengurangi energi gelombang dalam kondisi tertentu serta memberikan perlindungan alami bagi wilayah pesisir.

Pelestarian lingkungan pesisir perlu dilakukan bersama dengan upaya mitigasi dan kesiapsiagaan masyarakat.`,
    authorName: 'Tim Edukasi SAMUDRA',
    authorRole: 'LINGKUNGAN PESISIR',
    readTime: 'Edukasi'
  },
  {
    id: 'default-guide-7',
    category: 'Pemulihan Komunitas',
    title: 'Tahapan Pemulihan dan Dukungan Pasca Bencana Tsunami',
    excerpt: 'Langkah pemulihan komunitas pesisir dan pentingnya pendampingan psikososial bagi penyintas.',
    content: `Pasca bencana tsunami, pemulihan fisik dan mental menjadi prioritas penting bagi masyarakat terdampak.

Dukungan fasilitas medis darurat, air bersih, serta pemulihan tempat tinggal darurat harus segera dilaksanakan.

Pendampingan psikososial juga penting untuk membantu masyarakat mengatasi trauma dan membangun kembali ketangguhan wilayah pesisir.`,
    authorName: 'Tim Edukasi SAMUDRA',
    authorRole: 'PEMULIHAN KEBENCANAAN',
    readTime: 'Edukasi'
  }
];

// MAIN RENDER
export function renderArticles(container) {
  const section = document.createElement('section');

  section.id = 'artikel';
  section.className = 'articles-section';

  section.innerHTML = `
    <style>
      #artikel.articles-section {
        position: relative;
        width: 100%;
        background-color: #060E12;
        color: #FEFEFE;
        font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        padding: 0;
        border-top: 1px solid rgba(88, 129, 143, 0.22);
      }

      #artikel.articles-section::before {
        content: '';
        position: absolute;
        top: -1px;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(88, 129, 143, 0.45) 50%, transparent 100%);
        opacity: 0.5;
        pointer-events: none;
      }

      .art-container {
        width: 100%;
        max-width: 1240px;
        margin: 0 auto;
        padding: 0 clamp(20px, 4vw, 48px);
        box-sizing: border-box;
      }

      /* EYEBROW / BADGES */
      .art-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #58818F;
        margin-bottom: 12px;
      }

      .art-eyebrow-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #BB4019;
        display: inline-block;
      }

      .art-badge-cat {
        display: inline-block;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #58818F;
      }

      .art-date-text {
        font-size: 11.5px;
        color: #A5B5BC;
        white-space: nowrap;
      }

      /* HERO INTRO BANNER */
      .art-hero-intro {
        padding: clamp(64px, 8vw, 96px) 0 clamp(36px, 5vw, 56px);
      }

      .art-hero-intro-grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: clamp(36px, 5vw, 64px);
        align-items: center;
      }

      .art-hero-title {
        font-size: clamp(34px, 4.4vw, 54px);
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.025em;
        color: #FEFEFE;
        margin: 0 0 18px;
      }

      .art-hero-title-accent {
        color: #58818F;
      }

      .art-hero-desc {
        font-size: clamp(15px, 1.2vw, 16px);
        line-height: 1.8;
        color: #A5B5BC;
        max-width: 520px;
        margin: 0 0 32px;
      }

      .art-btn-explore {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background-color: #BB4019;
        color: #FEFEFE;
        padding: 14px 26px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        border: 1px solid rgba(254, 254, 254, 0.15);
        box-shadow: 0 8px 20px -4px rgba(187, 64, 25, 0.35);
        transition: all 0.25s ease;
        cursor: pointer;
      }

      .art-btn-explore:hover {
        background-color: #a33512;
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -4px rgba(187, 64, 25, 0.45);
      }

      .art-btn-explore svg {
        transition: transform 0.25s ease;
      }

      .art-btn-explore:hover svg {
        transform: translateX(4px);
      }

      .art-hero-media {
        position: relative;
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid rgba(88, 129, 143, 0.25);
        background-color: #0B171D;
        box-shadow: 0 20px 48px -12px rgba(6, 14, 18, 0.8);
      }

      .art-hero-img {
        width: 100%;
        height: 360px;
        object-fit: cover;
        display: block;
        filter: brightness(0.85) contrast(1.05);
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .art-hero-media:hover .art-hero-img {
        transform: scale(1.03);
      }

      .art-hero-overlay-card {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        padding: 18px 22px;
        background: rgba(6, 14, 18, 0.85);
        border: 1px solid rgba(165, 181, 188, 0.18);
        border-radius: 16px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
      }

      .art-overlay-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #58818F;
        margin-bottom: 6px;
      }

      .art-tag-pulse {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #BB4019;
      }

      .art-overlay-title {
        font-size: 14.5px;
        font-weight: 600;
        color: #FEFEFE;
        line-height: 1.45;
        margin: 0;
      }

      /* SECTION 1: BERITA TERKINI (EDITORIAL 3-KOLOM) */
      .art-featured-section {
        padding: clamp(56px, 7vw, 84px) 0;
        background: linear-gradient(180deg, rgba(11, 23, 29, 0.45) 0%, rgba(6, 14, 18, 0.8) 100%);
        border-top: 1px solid rgba(88, 129, 143, 0.16);
        border-bottom: 1px solid rgba(88, 129, 143, 0.16);
        scroll-margin-top: 80px;
      }

      .art-section-header {
        margin-bottom: clamp(28px, 4vw, 40px);
      }

      .art-section-title {
        font-size: clamp(26px, 3.5vw, 36px);
        font-weight: 700;
        color: #FEFEFE;
        letter-spacing: -0.02em;
        margin: 0 0 10px;
      }

      .art-section-desc {
        font-size: 15px;
        line-height: 1.7;
        color: #A5B5BC;
        max-width: 620px;
        margin: 0;
      }

      /* 3-COLUMN EDITORIAL GRID */
      .art-featured-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.85fr) minmax(0, 1.05fr);
        gap: 24px;
        align-items: stretch;
      }

      .art-col-left,
      .art-col-right {
        display: flex;
        flex-direction: column;
        gap: 16px;
        justify-content: space-between;
      }

      /* SMALL CARD (KOLOM KIRI & KANAN) */
      .art-small-card {
        display: flex;
        align-items: center;
        gap: 16px;
        background: #0B171D;
        border: 1px solid rgba(88, 129, 143, 0.2);
        border-radius: 18px;
        padding: 14px;
        text-decoration: none;
        color: inherit;
        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        box-shadow: 0 6px 18px -4px rgba(6, 14, 18, 0.45);
        cursor: pointer;
        flex: 1;
      }

      .art-small-card:hover {
        transform: translateY(-3px);
        border-color: rgba(165, 181, 188, 0.4);
        box-shadow: 0 12px 28px -6px rgba(6, 14, 18, 0.65);
      }

      .art-small-thumb {
        width: 90px;
        height: 90px;
        border-radius: 12px;
        overflow: hidden;
        flex-shrink: 0;
        background: #10242D;
        position: relative;
      }

      .art-small-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: brightness(0.85);
        transition: transform 0.35s ease;
      }

      .art-small-card:hover .art-small-img {
        transform: scale(1.06);
      }

      .art-small-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .art-small-title {
        font-size: 14px;
        font-weight: 600;
        color: #FEFEFE;
        line-height: 1.4;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* MAIN HERO CARD (KOLOM TENGAH) */
      .art-col-center {
        display: flex;
      }

      .art-main-card {
        background: #0B171D;
        border: 1px solid rgba(88, 129, 143, 0.28);
        border-radius: 22px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: 100%;
        box-shadow: 0 16px 40px -8px rgba(6, 14, 18, 0.7);
        transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
      }

      .art-main-card:hover {
        transform: translateY(-4px);
        border-color: rgba(165, 181, 188, 0.45);
        box-shadow: 0 22px 48px -10px rgba(6, 14, 18, 0.85);
      }

      .art-main-media {
        position: relative;
        height: 290px;
        background: #10242D;
        overflow: hidden;
      }

      .art-main-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: brightness(0.85);
        transition: transform 0.45s ease;
      }

      .art-main-card:hover .art-main-img {
        transform: scale(1.03);
      }

      .art-main-badge {
        position: absolute;
        top: 16px;
        left: 16px;
        background: rgba(6, 14, 18, 0.88);
        border: 1px solid rgba(88, 129, 143, 0.35);
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #FEFEFE;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .art-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #BB4019;
      }

      .art-main-body {
        padding: clamp(22px, 3vw, 30px);
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      .art-main-meta-top {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .art-meta-divider {
        color: #58818F;
        font-size: 12px;
      }

      .art-main-title {
        font-size: clamp(20px, 2.3vw, 28px);
        font-weight: 700;
        line-height: 1.35;
        letter-spacing: -0.015em;
        color: #FEFEFE;
        margin: 0 0 14px;
      }

      .art-main-title-link {
        color: inherit;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .art-main-title-link:hover {
        color: #FEFEFE;
      }

      .art-main-excerpt {
        font-size: 14.5px;
        line-height: 1.75;
        color: #A5B5BC;
        margin: 0 0 24px;
        flex-grow: 1;
      }

      .art-main-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        border-top: 1px solid rgba(88, 129, 143, 0.18);
        padding-top: 18px;
      }

      .art-btn-main {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background-color: #BB4019;
        color: #FEFEFE;
        padding: 10px 20px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.25s ease;
        border: 1px solid rgba(254, 254, 254, 0.12);
        cursor: pointer;
      }

      .art-btn-main:hover {
        background-color: #a33512;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px -2px rgba(187, 64, 25, 0.4);
      }

      .art-btn-main svg {
        transition: transform 0.25s ease;
      }

      .art-btn-main:hover svg {
        transform: translateX(4px);
      }

      .art-author-info {
        font-size: 12px;
        color: #58818F;
      }

      .art-author-info strong {
        color: #A5B5BC;
        font-weight: 600;
      }

      /* SECTION 2: MITIGASI DAN PENGETAHUAN TERKINI (UNIFORM COMPACT GRID) */
      .art-catalog-section {
        padding: clamp(64px, 8vw, 96px) 0;
        scroll-margin-top: 80px;
      }

      .art-catalog-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 22px;
      }

      .art-catalog-card {
        background: #0B171D;
        border: 1px solid rgba(88, 129, 143, 0.2);
        border-radius: 18px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 24px -4px rgba(6, 14, 18, 0.45);
        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
        height: 100%;
      }

      .art-catalog-card:hover {
        transform: translateY(-5px);
        border-color: rgba(165, 181, 188, 0.4);
        box-shadow: 0 16px 34px -6px rgba(6, 14, 18, 0.75);
      }

      .art-catalog-thumb {
        position: relative;
        height: 160px;
        background: #10242D;
        overflow: hidden;
      }

      .art-catalog-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: brightness(0.85);
        transition: transform 0.4s ease;
      }

      .art-catalog-card:hover .art-catalog-img {
        transform: scale(1.05);
      }

      .art-catalog-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(6, 14, 18, 0.88);
        border: 1px solid rgba(88, 129, 143, 0.35);
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #58818F;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .art-catalog-body {
        padding: 18px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      .art-catalog-title {
        font-size: 15px;
        font-weight: 600;
        color: #FEFEFE;
        line-height: 1.45;
        margin: 8px 0 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex-grow: 1;
      }

      .art-catalog-action {
        border-top: 1px solid rgba(88, 129, 143, 0.16);
        padding-top: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #58818F;
        font-size: 12px;
        font-weight: 600;
        transition: color 0.2s ease;
      }

      .art-catalog-card:hover .art-catalog-action {
        color: #FEFEFE;
      }

      .art-catalog-action svg {
        transition: transform 0.25s ease, color 0.25s ease;
      }

      .art-catalog-card:hover .art-catalog-action svg {
        transform: translateX(4px);
        color: #BB4019;
      }

      /* PAGINATION */
      .art-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-top: 40px;
        flex-wrap: wrap;
      }

      .art-page-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #0B171D;
        border: 1px solid rgba(88, 129, 143, 0.25);
        color: #A5B5BC;
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .art-page-btn:hover:not(:disabled) {
        background: #2B5161;
        color: #FEFEFE;
        border-color: rgba(165, 181, 188, 0.4);
      }

      .art-page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .art-page-numbers {
        display: flex;
        gap: 8px;
      }

      .art-page-num {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #0B171D;
        border: 1px solid rgba(88, 129, 143, 0.25);
        color: #A5B5BC;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .art-page-num:hover:not(.is-active) {
        background: #2B5161;
        color: #FEFEFE;
      }

      .art-page-num.is-active {
        background: #BB4019;
        border-color: #BB4019;
        color: #FEFEFE;
        box-shadow: 0 4px 12px rgba(187, 64, 25, 0.35);
      }

      /* FALLBACK THUMBNAILS (SVG, NO EMOJI) */
      .art-thumb-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 50% 40%, rgba(43, 81, 97, 0.35) 0%, #0B171D 70%);
        color: #58818F;
      }

      .art-main-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: radial-gradient(circle at 50% 40%, rgba(43, 81, 97, 0.35) 0%, #0B171D 70%);
      }

      .art-fallback-icon-box {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: rgba(43, 81, 97, 0.4);
        border: 1px solid rgba(88, 129, 143, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #58818F;
      }

      .art-fallback-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: #58818F;
        text-transform: uppercase;
      }

      .art-empty-box {
        padding: 48px;
        text-align: center;
        color: #A5B5BC;
        background: #0B171D;
        border-radius: 20px;
        border: 1px solid rgba(88, 129, 143, 0.2);
        grid-column: 1 / -1;
      }

      /* SECTION 3: FAQ ACCORDION */
      .art-faq-section {
        padding: clamp(60px, 8vw, 92px) 0;
        background: linear-gradient(180deg, rgba(11, 23, 29, 0.4) 0%, rgba(6, 14, 18, 0.8) 100%);
        border-top: 1px solid rgba(88, 129, 143, 0.16);
      }

      .art-faq-card {
        max-width: 820px;
        margin: 0 auto;
        background: #0B171D;
        border: 1px solid rgba(88, 129, 143, 0.22);
        border-radius: 24px;
        padding: clamp(28px, 4vw, 44px);
        box-shadow: 0 16px 40px -8px rgba(6, 14, 18, 0.6);
      }

      .art-faq-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .art-faq-title {
        font-size: clamp(24px, 3.2vw, 30px);
        font-weight: 700;
        color: #FEFEFE;
        margin: 0 0 10px;
      }

      .art-faq-desc {
        color: #A5B5BC;
        font-size: 14.5px;
        line-height: 1.7;
        margin: 0;
      }

      .art-faq-item {
        border-bottom: 1px solid rgba(88, 129, 143, 0.18);
        padding: 18px 0;
      }

      .art-faq-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .art-faq-trigger {
        width: 100%;
        border: none;
        background: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        text-align: left;
        cursor: pointer;
        color: #FEFEFE;
        font-size: 15.5px;
        font-weight: 600;
        line-height: 1.5;
        padding: 0;
        transition: color 0.2s ease;
      }

      .art-faq-trigger:hover {
        color: #58818F;
      }

      .art-faq-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(43, 81, 97, 0.25);
        border: 1px solid rgba(88, 129, 143, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #58818F;
        flex-shrink: 0;
        transition: transform 0.25s ease, background-color 0.25s ease, color 0.25s ease;
      }

      .art-faq-trigger:hover .art-faq-icon {
        background: rgba(43, 81, 97, 0.5);
        color: #FEFEFE;
      }

      .art-faq-content {
        color: #A5B5BC;
        line-height: 1.8;
        font-size: 14px;
        padding-top: 14px;
      }

      /* SECTION 4: CTA BANNER */
      .art-cta-section {
        padding: 0 0 clamp(64px, 8vw, 100px);
      }

      .art-cta-card {
        background: linear-gradient(135deg, #0B171D 0%, #10242D 100%);
        border: 1px solid rgba(88, 129, 143, 0.25);
        border-left: 4px solid #BB4019;
        border-radius: 22px;
        padding: clamp(32px, 5vw, 52px);
        text-align: center;
        box-shadow: 0 16px 44px -8px rgba(6, 14, 18, 0.65);
      }

      .art-cta-title {
        font-size: clamp(22px, 3.2vw, 30px);
        font-weight: 700;
        color: #FEFEFE;
        line-height: 1.35;
        margin: 12px 0 16px;
      }

      .art-cta-desc {
        color: #A5B5BC;
        line-height: 1.8;
        font-size: 15px;
        max-width: 620px;
        margin: 0 auto;
      }

      /* RESPONSIVE LAYOUT */
      @media (min-width: 768px) and (max-width: 1080px) {
        .art-featured-layout {
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .art-col-center {
          grid-column: 1 / -1;
          order: 1;
        }
        .art-col-left {
          order: 2;
        }
        .art-col-right {
          order: 3;
        }
      }

      @media (max-width: 1200px) {
        .art-catalog-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (max-width: 960px) {
        .art-hero-intro-grid {
          grid-template-columns: 1fr;
          gap: 36px;
        }
        .art-hero-media {
          max-width: 600px;
        }
      }

      @media (max-width: 860px) {
        .art-catalog-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 767px) {
        .art-featured-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .art-col-center {
          order: 1;
        }
        .art-col-left {
          order: 2;
        }
        .art-col-right {
          order: 3;
        }
        .art-small-thumb {
          width: 76px;
          height: 76px;
        }
        .art-small-title {
          font-size: 13.5px;
        }
      }

      @media (max-width: 540px) {
        .art-catalog-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <main>
      <!-- HERO BANNER -->
      <section class="art-hero-intro">
        <div class="art-container">
          <div class="art-hero-intro-grid">
            <div>
              <div class="art-eyebrow">
                <span class="art-eyebrow-dot"></span>
                <span>SAMUDRA &bull; WARTA & PUBLIKASI</span>
              </div>

              <h1 class="art-hero-title">
                Berita & Edukasi<br><span class="art-hero-title-accent">Kebencanaan Tsunami.</span>
              </h1>

              <p class="art-hero-desc">
                Temukan informasi terkini, analisis riset geologis, dan panduan mitigasi tsunami resmi untuk meningkatkan kesiapsiagaan masyarakat di wilayah pesisir.
              </p>

              <a href="#berita" data-explore-button class="art-btn-explore">
                <span>Jelajahi Berita</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            <div class="art-hero-media">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                alt="Pemandangan samudra dan pesisir"
                class="art-hero-img"
                loading="lazy"
              />

              <div class="art-hero-overlay-card">
                <div class="art-overlay-tag">
                  <span class="art-tag-pulse"></span>
                  <span>SAMUDRA INFORMATION</span>
                </div>

                <p class="art-overlay-title">
                  Satu informasi akurat, langkah lebih siap menghadapi bencana.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      <!-- SECTION 1: BERITA TERKINI (3-KOLOM EDITORIAL) -->
      <section id="berita" class="art-featured-section">
        <div class="art-container">
          <div class="art-section-header">
            <div class="art-eyebrow">
              <span class="art-eyebrow-dot"></span>
              <span>SOROTAN UTAMA</span>
            </div>

            <h2 class="art-section-title">
              Berita Terkini
            </h2>

            <p class="art-section-desc">
              Warta dan perkembangan informasi kebencanaan terkini di wilayah pesisir nusantara.
            </p>
          </div>

          <!-- KONTENER 3-KOLOM -->
          <div id="articles-featured">
            <div class="art-empty-box">
              Memuat berita terkini...
            </div>
          </div>
        </div>
      </section>


      <!-- SECTION 2: MITIGASI DAN PENGETAHUAN TERKINI (UNIFORM GRID) -->
      <section id="berita-terbaru" class="art-catalog-section">
        <div class="art-container">
          <div class="art-section-header">
            <div class="art-eyebrow">
              <span class="art-eyebrow-dot"></span>
              <span>PUBLIKASI SAMUDRA</span>
            </div>

            <h2 class="art-section-title">
              Mitigasi dan Pengetahuan Terkini
            </h2>

            <p class="art-section-desc">
              Seluruh kumpulan artikel edukasi, panduan kesiapsiagaan, dan riset mitigasi bencana tsunami.
            </p>
          </div>

          <!-- KONTENER MULTI-KOLOM UNIFORM DENGAN PAGINATION -->
          <div id="articles-latest">
            <div class="art-empty-box">
              Memuat artikel...
            </div>
          </div>
        </div>
      </section>


      <!-- SECTION 3: FAQ -->
      <section class="art-faq-section">
        <div class="art-container">
          <div class="art-faq-card">
            <div class="art-faq-header">
              <div class="art-eyebrow">
                <span class="art-eyebrow-dot"></span>
                <span>INFORMASI POPULER</span>
              </div>

              <h2 class="art-faq-title">
                Pertanyaan Umum
              </h2>

              <p class="art-faq-desc">
                Temukan jawaban atas pertanyaan seputar ancaman tsunami dan kesiapsiagaan darurat.
              </p>
            </div>

            <div id="articles-faq">
              ${[
      {
        question: 'Apa yang harus dilakukan saat merasakan gempa di wilayah pesisir?',
        answer: 'Lindungi diri saat guncangan berlangsung (Drop, Cover, Hold On). Setelah guncangan berhenti, segera menjauh dari pantai menuju tempat yang lebih tinggi jika gempa terasa kuat atau berlangsung lama.'
      },
      {
        question: 'Bagaimana cara mengetahui informasi peringatan tsunami?',
        answer: 'Masyarakat dapat memantau informasi melalui kanal resmi BMKG (aplikasi InfoBMKG, situs resmi, radio darurat) dan mengikuti arahan petugas kebencanaan setempat.'
      },
      {
        question: 'Apa saja perlengkapan yang perlu disiapkan dalam Tas Siaga Bencana?',
        answer: 'Siapkan air minum, makanan tahan lama, kotak obat pribadi, senter, baterai cadangan, peluit darurat, pakaian ganti, serta dokumen penting yang terbungkus kantong tahan air.'
      },
      {
        question: 'Kapan masyarakat boleh kembali ke rumah setelah ancaman tsunami?',
        answer: 'Masyarakat hanya boleh kembali setelah pihak berwenang (BMKG dan BPBD) secara resmi mencabut status peringatan tsunami dan menyatakan wilayah aman.'
      }
    ].map(item => `
                <div data-faq-item class="art-faq-item">
                  <button data-faq-trigger class="art-faq-trigger" type="button">
                    <span>${item.question}</span>
                    <span data-faq-icon class="art-faq-icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </span>
                  </button>

                  <div data-faq-content hidden class="art-faq-content">
                    ${item.answer}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>


      <!-- SECTION 4: CTA BANNER -->
      <section class="art-cta-section">
        <div class="art-container">
          <div class="art-cta-card">
            <div class="art-eyebrow">
              <span class="art-eyebrow-dot"></span>
              <span>SAMUDRA &bull; SIAGA BENCANA</span>
            </div>

            <h2 class="art-cta-title">
              Pengetahuan Adalah Langkah Awal Keselamatan.
            </h2>

            <p class="art-cta-desc">
              Tingkatkan pengetahuan kebencanaan dan kesiapsiagaan menghadapi potensi tsunami bersama portal informasi terpadu SAMUDRA.
            </p>
          </div>
        </div>
      </section>
    </main>
  `;

  container.appendChild(section);


  // TOMBOL JELAJAHI BERITA
  const exploreButton = section.querySelector('[data-explore-button]');

  if (exploreButton) {
    exploreButton.addEventListener('click', event => {
      event.preventDefault();

      const target = section.querySelector('#berita');

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  initFAQ(section);

  const featuredContainer = section.querySelector('#articles-featured');
  const latestContainer = section.querySelector('#articles-latest');

  fetchArticles()
    .then(articles => {
      renderRealContent(
        featuredContainer,
        latestContainer,
        Array.isArray(articles) ? articles : []
      );
    })
    .catch(err => {
      console.warn('Gagal memuat artikel dari API, menggunakan data cadangan:', err);

      renderRealContent(
        featuredContainer,
        latestContainer,
        []
      );
    });
}


// FAQ ACCORDION
function initFAQ(section) {
  const items = section.querySelectorAll('[data-faq-item]');

  items.forEach(item => {
    const trigger = item.querySelector('[data-faq-trigger]');
    const content = item.querySelector('[data-faq-content]');
    const icon = item.querySelector('[data-faq-icon]');

    if (!trigger || !content || !icon) return;

    trigger.onclick = () => {
      const isOpen = !content.hidden;

      items.forEach(other => {
        const otherContent = other.querySelector('[data-faq-content]');
        const otherIcon = other.querySelector('[data-faq-icon]');
        if (otherContent) otherContent.hidden = true;
        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        content.hidden = false;
        icon.style.transform = 'rotate(45deg)';
      }
    };
  });
}


// RENDER KONTEN REAL ARTIKEL
function renderRealContent(featuredContainer, latestContainer, apiArticles) {
  const allCards = [];

  // 1. DATA ASLI DARI API
  if (Array.isArray(apiArticles) && apiArticles.length > 0) {
    apiArticles.forEach(item => {
      const category = item.category
        ? item.category.replace(/_/g, ' ').toUpperCase()
        : 'ARTIKEL SAMUDRA';

      const dateStr = item.publishedAt
        ? new Date(item.publishedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
        : 'Informasi terbaru';

      const authorName = item.author?.name
        ? item.author.name.split('_').pop()
        : 'Tim SAMUDRA';

      const authorRole = item.author?.role
        ? item.author.role.replace(/_/g, ' ').toUpperCase()
        : 'KONTRIBUTOR SAMUDRA';

      allCards.push({
        isBackend: true,
        id: item.id,
        slug: item.slug,
        title: item.title || 'Artikel SAMUDRA',
        content: item.content || 'Konten edukasi dari SAMUDRA.',
        excerpt: item.content
          ? item.content.length > 150
            ? item.content.slice(0, 150) + '...'
            : item.content
          : 'Konten edukasi dan panduan kebencanaan dari SAMUDRA.',
        category,
        dateStr,
        readTime: dateStr,
        authorName,
        authorRole,
        authorAvatar: item.author?.avatarUrl,
        coverImg: item.coverImageUrl
      });
    });
  } else {
    // 2. CADANGAN JIKA API KOSONG ATAU GAGAL
    DEFAULT_GUIDES.forEach(guide => {
      allCards.push({
        ...guide,
        isBackend: false
      });
    });
  }

  // KONDISI JIKA TIDAK ADA DATA SAMA SEKALI
  if (allCards.length === 0) {
    if (featuredContainer) {
      featuredContainer.innerHTML = `
        <div class="art-empty-box">
          Belum ada artikel yang tersedia saat ini.
        </div>
      `;
    }

    if (latestContainer) {
      latestContainer.innerHTML = '';
    }
    return;
  }

  // 3. PEMBAGIAN KARTU UNTUK BAGIAN 1: "BERITA TERKINI" (3-KOLOM: 3 KIRI, 1 TENGAH, 3 KANAN)
  const heroCard = allCards[0];
  const subArticles = allCards.slice(1, 7);

  let leftCards = [];
  let rightCards = [];

  if (subArticles.length === 6) {
    leftCards = subArticles.slice(0, 3);
    rightCards = subArticles.slice(3, 6);
  } else {
    const mid = Math.ceil(subArticles.length / 2);
    leftCards = subArticles.slice(0, mid);
    rightCards = subArticles.slice(mid);
  }

  // RENDER BAGIAN 1: "BERITA TERKINI" (3-KOLOM EDITORIAL)
  if (featuredContainer) {
    const hasSideCards = leftCards.length > 0 || rightCards.length > 0;

    featuredContainer.innerHTML = `
      <div class="art-featured-layout ${!hasSideCards ? 'has-no-sides' : ''}">
        ${leftCards.length > 0 ? `
          <div class="art-col-left">
            ${leftCards.map((item, idx) => renderSmallCard(item, 'featured-left-' + idx)).join('')}
          </div>
        ` : ''}

        <div class="art-col-center">
          ${renderHeroCard(heroCard)}
        </div>

        ${rightCards.length > 0 ? `
          <div class="art-col-right">
            ${rightCards.map((item, idx) => renderSmallCard(item, 'featured-right-' + idx)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 4. MAP DATA UNTUK NAVIGASI
  const articleMap = new Map();
  allCards.forEach(item => {
    const key = item.id || item.slug;
    if (key) articleMap.set(String(key), item);
  });

  const attachNav = (root) => {
    if (!root) return;

    root.querySelectorAll('[data-article-id]').forEach(element => {
      const targetId = element.getAttribute('data-article-id');
      const item = articleMap.get(targetId) || allCards.find(c => c.id === targetId || c.slug === targetId);

      element.addEventListener('click', event => {
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

        if (typeof window.__navigateToArticle === 'function') {
          window.__navigateToArticle(targetId);
        } else if (item) {
          openArticleModal(item);
        }
      });
    });
  };

  // 5. RENDER BAGIAN 2: "MITIGASI DAN PENGETAHUAN TERKINI" (UNIFORM GRID SELURUH ARTIKEL DENGAN PAGINATION)
  if (latestContainer) {
    renderCatalogGrid(latestContainer, allCards, currentCatalogPage, attachNav);
  }

  attachNav(featuredContainer);
}


// RENDER KATALOG GRID UNIFORM ("MITIGASI DAN PENGETAHUAN TERKINI")
function renderCatalogGrid(container, cards, page, attachNav) {
  if (!container) return;

  if (cards.length === 0) {
    container.innerHTML = `
      <div class="art-empty-box">
        Belum ada artikel yang tersedia saat ini.
      </div>
    `;
    return;
  }

  const totalPages = Math.ceil(cards.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const pageCards = cards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const gridHtml = `
    <div class="art-catalog-grid">
      ${pageCards.map((item, idx) => renderCatalogCard(item, startIndex + idx)).join('')}
    </div>
  `;

  let paginationHtml = '';
  if (totalPages > 1) {
    paginationHtml = `
      <div class="art-pagination">
        <button
          type="button"
          class="art-page-btn art-page-prev"
          data-page="${validPage - 1}"
          ${validPage === 1 ? 'disabled' : ''}
          aria-label="Halaman sebelumnya"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span>Sebelumnya</span>
        </button>

        <div class="art-page-numbers">
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
            <button
              type="button"
              class="art-page-num ${p === validPage ? 'is-active' : ''}"
              data-page="${p}"
              aria-label="Halaman ${p}"
            >
              ${p}
            </button>
          `).join('')}
        </div>

        <button
          type="button"
          class="art-page-btn art-page-next"
          data-page="${validPage + 1}"
          ${validPage === totalPages ? 'disabled' : ''}
          aria-label="Halaman selanjutnya"
        >
          <span>Selanjutnya</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
    `;
  }

  container.innerHTML = gridHtml + paginationHtml;

  // Pasang listener navigasi artikel pada kartu yang baru dirender
  if (typeof attachNav === 'function') {
    attachNav(container);
  }

  // Pasang event listener untuk tombol pagination
  container.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      const targetPage = parseInt(button.getAttribute('data-page'), 10);

      if (targetPage && targetPage !== validPage && targetPage >= 1 && targetPage <= totalPages) {
        currentCatalogPage = targetPage;
        renderCatalogGrid(container, cards, targetPage, attachNav);

        const sectionTarget = document.getElementById('berita-terbaru');
        if (sectionTarget) {
          sectionTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}


// KOMPONEN: KARTU KECIL (KOLOM KIRI & KANAN DI "BERITA TERKINI")
function renderSmallCard(item, fallbackId) {
  const image = safeImageUrl(item.coverImg);
  const targetId = item.id || item.slug || fallbackId;
  const href = `?article=${encodeURIComponent(targetId)}`;

  return `
    <a
      class="art-small-card"
      href="${href}"
      data-article-id="${escapeHTML(targetId)}"
      aria-label="Buka berita: ${escapeHTML(item.title)}"
    >
      <div class="art-small-thumb">
        ${image
      ? `
              <img
                src="${image}"
                alt="${escapeHTML(item.title)}"
                loading="lazy"
                class="art-small-img"
              >
            `
      : `
              <div class="art-thumb-fallback" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 7c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                </svg>
              </div>
            `
    }
      </div>

      <div class="art-small-content">
        <span class="art-badge-cat">${escapeHTML(item.category)}</span>
        <h4 class="art-small-title">${escapeHTML(item.title)}</h4>
        <span class="art-date-text">${escapeHTML(item.dateStr || item.readTime)}</span>
      </div>
    </a>
  `;
}


// KOMPONEN: KARTU UTAMA (KOLOM TENGAH DI "BERITA TERKINI")
function renderHeroCard(item) {
  const image = safeImageUrl(item.coverImg);
  const targetId = item.id || item.slug || 'riset-megathrust';
  const href = `?article=${encodeURIComponent(targetId)}`;

  return `
    <article class="art-main-card">
      <div class="art-main-media">
        ${image
      ? `
              <img
                src="${image}"
                alt="${escapeHTML(item.title)}"
                loading="lazy"
                class="art-main-img"
              >
            `
      : `
              <div class="art-main-fallback" aria-hidden="true">
                <div class="art-fallback-icon-box">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                    <path d="M2 7c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                    <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  </svg>
                </div>
                <span class="art-fallback-label">BERITA UTAMA</span>
              </div>
            `
    }

        <span class="art-main-badge">
          <span class="art-badge-dot"></span>
          <span>BERITA UTAMA</span>
        </span>
      </div>

      <div class="art-main-body">
        <div class="art-main-meta-top">
          <span class="art-badge-cat">${escapeHTML(item.category)}</span>
          <span class="art-meta-divider">&bull;</span>
          <span class="art-date-text">${escapeHTML(item.dateStr || item.readTime)}</span>
        </div>

        <h3 class="art-main-title">
          <a
            href="${href}"
            data-article-id="${escapeHTML(targetId)}"
            class="art-main-title-link"
          >
            ${escapeHTML(item.title)}
          </a>
        </h3>

        <p class="art-main-excerpt">
          ${escapeHTML(item.excerpt)}
        </p>

        <div class="art-main-footer">
          <a
            href="${href}"
            data-article-id="${escapeHTML(targetId)}"
            class="art-btn-main"
          >
            <span>Baca Selengkapnya</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>

          ${item.authorName ? `
            <span class="art-author-info">Oleh <strong>${escapeHTML(item.authorName)}</strong></span>
          ` : ''}
        </div>
      </div>
    </article>
  `;
}


// KOMPONEN: KARTU SERAGAM DI "MITIGASI DAN PENGETAHUAN TERKINI" (KATALOG GRID)
function renderCatalogCard(item, idx) {
  const image = safeImageUrl(item.coverImg);
  const targetId = item.id || item.slug || 'katalog-' + (idx + 1);
  const href = `?article=${encodeURIComponent(targetId)}`;

  return `
    <a
      class="art-catalog-card"
      href="${href}"
      data-article-id="${escapeHTML(targetId)}"
      aria-label="Buka artikel: ${escapeHTML(item.title)}"
    >
      <div class="art-catalog-thumb">
        ${image
      ? `
              <img
                src="${image}"
                alt="${escapeHTML(item.title)}"
                loading="lazy"
                class="art-catalog-img"
              >
            `
      : `
              <div class="art-thumb-fallback" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 7c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                  <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                </svg>
              </div>
            `
    }

        <span class="art-catalog-badge">
          ${escapeHTML(item.category)}
        </span>
      </div>

      <div class="art-catalog-body">
        <span class="art-date-text">
          ${escapeHTML(item.dateStr || item.readTime)}
        </span>

        <h4 class="art-catalog-title">
          ${escapeHTML(item.title)}
        </h4>

        <div class="art-catalog-action">
          <span>Baca Selengkapnya</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </a>
  `;
}


// MODAL PEMBACA ARTIKEL (FALLBACK CADANGAN JIKA TIDAK MENGGUNAKAN ARTICLEPAGE)
function openArticleModal(item) {
  let modal = document.getElementById('article-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'article-modal';

    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(6, 14, 18, 0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    `;

    modal.innerHTML = `
      <div data-modal-dialog style="
        background: #0B171D;
        border: 1px solid rgba(88, 129, 143, 0.3);
        width: 100%;
        max-width: 820px;
        max-height: 90vh;
        border-radius: 24px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        box-shadow: 0 24px 64px rgba(0,0,0,0.7);
        color: #FEFEFE;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(88, 129, 143, 0.2);
        ">
          <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #58818F; text-transform: uppercase;">
            SAMUDRA &bull; PEMBACA PUBLIKASI
          </span>
          <button data-modal-close style="
            border: 1px solid rgba(88, 129, 143, 0.25);
            background: rgba(255,255,255,0.06);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            color: #FEFEFE;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          ">✕</button>
        </div>

        <div style="
          padding: 32px;
          overflow-y: auto;
        ">
          <span id="modal-category" style="
            color: #58818F;
            font-size: 11.5px;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          "></span>

          <h2 id="modal-title" style="
            color: #FEFEFE;
            font-size: 26px;
            font-weight: 700;
            line-height: 1.35;
            margin: 14px 0 10px;
          "></h2>

          <p id="modal-date" style="
            color: #A5B5BC;
            font-size: 12.5px;
            margin-bottom: 16px;
          "></p>

          <div id="modal-author" style="
            color: #58818F;
            font-size: 13px;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(88, 129, 143, 0.18);
          "></div>

          <div id="modal-cover"></div>

          <div id="modal-content" style="
            color: #A5B5BC;
            font-size: 15px;
            line-height: 1.85;
            white-space: pre-line;
            margin-top: 24px;
          "></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    };

    modal.querySelector('[data-modal-close]').onclick = closeModal;

    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
      }
    });

    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
      }
    });
  }

  // ISI DATA ARTIKEL
  modal.querySelector('#modal-category').textContent =
    item.category || 'ARTIKEL SAMUDRA';

  modal.querySelector('#modal-title').textContent =
    item.title || 'Artikel Mitigasi';

  modal.querySelector('#modal-date').textContent =
    item.dateStr || item.readTime || 'Informasi SAMUDRA';

  modal.querySelector('#modal-author').textContent =
    `${item.authorName || 'Tim SAMUDRA'} • ${item.authorRole || 'KONTRIBUTOR'}`;

  const cover = modal.querySelector('#modal-cover');
  const image = safeImageUrl(item.coverImg);

  if (image) {
    cover.innerHTML = `
      <img
        src="${image}"
        alt="${escapeHTML(item.title)}"
        style="
          width: 100%;
          max-height: 380px;
          object-fit: cover;
          border-radius: 16px;
          margin-top: 15px;
          border: 1px solid rgba(88, 129, 143, 0.25);
        "
      >
    `;
  } else {
    cover.innerHTML = '';
  }

  const contentElement = modal.querySelector('#modal-content');

  contentElement.textContent =
    item.content || item.excerpt || 'Belum ada isi artikel.';

  // AMBIL DETAIL TERBARU DARI BACKEND JIKA TERSEDIA
  if (item.id && item.isBackend) {
    fetchArticleById(item.id)
      .then(fresh => {
        if (!fresh || modal.style.display !== 'flex') return;

        if (fresh.title) {
          modal.querySelector('#modal-title').textContent = fresh.title;
        }

        if (fresh.content) {
          contentElement.textContent = fresh.content;
        }

        if (fresh.author?.name) {
          modal.querySelector('#modal-author').textContent =
            fresh.author.name;
        }

        if (fresh.coverImageUrl) {
          const freshImage = safeImageUrl(fresh.coverImageUrl);

          if (freshImage) {
            cover.innerHTML = `
              <img
                src="${freshImage}"
                alt="${escapeHTML(fresh.title || item.title)}"
                style="
                  width: 100%;
                  max-height: 380px;
                  object-fit: cover;
                  border-radius: 16px;
                  margin-top: 15px;
                  border: 1px solid rgba(88, 129, 143, 0.25);
                "
              >
            `;
          }
        }
      })
      .catch(err => {
        console.warn('Gagal memuat detail artikel:', err);
      });
  }

  // TAMPILKAN MODAL
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
