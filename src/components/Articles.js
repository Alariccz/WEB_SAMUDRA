
import { fetchArticles, fetchArticleById } from '../api.js';

// TEMA DARK AQUA GLASS
const C = {
  text: '#F1F7F6',
  muted: '#B5C8C7',
  soft: '#91AAA9',
  aqua: '#8ADBD3',
  accent: '#55BFB7',
  border: 'rgba(255,255,255,0.16)',
  glass: 'rgba(255,255,255,0.07)',
  glassStrong: 'rgba(255,255,255,0.11)',
  darkGlass: 'rgba(8,24,28,0.72)'
};

const glass = `
  background: ${C.glass};
  border: 1px solid ${C.border};
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.22);
`;

const accentButton = `
  background: linear-gradient(135deg, #55BFB7, #268D8A);
  color: #FFFFFF;
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 30px;
  box-shadow: 0 8px 24px rgba(42,170,163,0.18);
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
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

// DATA ARTIKEL DEFAULT
const DEFAULT_GUIDES = [
  {
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
    category: 'Lingkungan Pesisir',
    title: 'Peran Ekosistem Pesisir dalam Mengurangi Risiko Bencana',
    excerpt: 'Mengenal fungsi mangrove dan ekosistem pesisir dalam mendukung perlindungan wilayah pantai.',
    content: `Ekosistem pesisir seperti hutan mangrove dan terumbu karang memiliki peran penting dalam menjaga keseimbangan lingkungan.

Mangrove dapat membantu mengurangi energi gelombang dalam kondisi tertentu serta memberikan perlindungan alami bagi wilayah pesisir.

Pelestarian lingkungan pesisir perlu dilakukan bersama dengan upaya mitigasi dan kesiapsiagaan masyarakat.`,
    authorName: 'Tim Edukasi SAMUDRA',
    authorRole: 'LINGKUNGAN PESISIR',
    readTime: 'Edukasi'
  }
];

// MAIN RENDER
export function renderArticles(container) {
  const section = document.createElement('section');

  section.id = 'artikel';
  section.className = 'articles-section';

  section.innerHTML = `
    <main style="
      font-family: Arial, sans-serif;
      color: ${C.text};
      background: transparent;
      width: 100%;
      overflow: hidden;
    ">

      <!-- HERO -->
      <section style="
        padding: 85px 8%;
        background:
          radial-gradient(circle at 85% 10%, rgba(105,220,210,0.09), transparent 32%),
          radial-gradient(circle at 5% 80%, rgba(255,255,255,0.035), transparent 35%);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 45px;
        flex-wrap: wrap;
      ">

        <div style="flex: 1; min-width: 280px;">
          <span style="
            display: inline-block;
            color: ${C.aqua};
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 2.5px;
          ">
            SAMUDRA • WARTA & PUBLIKASI
          </span>

          <h1 style="
            font-size: clamp(36px, 5vw, 56px);
            line-height: 1.15;
            margin: 22px 0;
            color: ${C.text};
            letter-spacing: -1.5px;
          ">
            Berita & Edukasi<br>
            Tsunami.
          </h1>

          <p style="
            color: ${C.muted};
            font-size: 16px;
            line-height: 1.9;
            max-width: 520px;
          ">
            Temukan informasi terkini, pengetahuan kebencanaan,
            dan panduan mitigasi tsunami untuk meningkatkan
            kesiapsiagaan diri dan masyarakat.
          </p>

          <a href="#berita" data-explore-button style="
            display: inline-block;
            margin-top: 25px;
            padding: 15px 28px;
            ${accentButton}
            font-size: 14px;
            cursor: pointer;
          ">
            Jelajahi Informasi →
          </a>
        </div>

        <div style="
          flex: 1;
          min-width: 280px;
          position: relative;
          padding: 10px;
          ${glass}
          border-radius: 28px;
        ">
          <img
            src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000"
            alt="Pemandangan laut"
            style="
              width: 100%;
              height: 350px;
              object-fit: cover;
              border-radius: 21px;
              display: block;
              filter: brightness(0.78);
            "
          >

          <div style="
            position: absolute;
            bottom: 25px;
            left: 25px;
            right: 25px;
            padding: 20px;
            background: rgba(5,20,25,0.68);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 17px;
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
          ">
            <span style="
              font-size: 11px;
              color: ${C.aqua};
              letter-spacing: 1.5px;
              font-weight: bold;
            ">
              SAMUDRA INFORMATION
            </span>

            <p style="
              font-size: 16px;
              font-weight: bold;
              line-height: 1.5;
              margin: 8px 0 0;
            ">
              Satu informasi, langkah lebih siap menghadapi bencana.
            </p>
          </div>
        </div>

      </section>

      <!-- FEATURED NEWS -->
      <section id="berita" style="
        padding: 75px 8%;
        scroll-margin-top: 85px;
        background: transparent;
      ">

        <div style="margin-bottom: 30px;">
          <span style="
            color: ${C.aqua};
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 2.5px;
          ">BERITA</span>

          <h2 style="
            font-size: clamp(27px, 4vw, 34px);
            margin: 12px 0;
            color: ${C.text};
          ">Informasi Pilihan</h2>

          <p style="color: ${C.muted}; line-height: 1.8;">
            Artikel pilihan untuk menambah wawasan mengenai tsunami.
          </p>
        </div>

        <div id="articles-featured">
          <div style="
            padding: 45px;
            text-align: center;
            color: ${C.muted};
            ${glass}
            border-radius: 22px;
          ">Memuat informasi...</div>
        </div>

      </section>

      <!-- LATEST ARTICLES -->
      <section id="berita-terbaru" style="
        padding: 75px 8%;
        background:
          radial-gradient(circle at 5% 10%, rgba(85,211,193,0.055), transparent 30%),
          rgba(255,255,255,0.018);
        border-top: 1px solid ${C.border};
        border-bottom: 1px solid ${C.border};
        scroll-margin-top: 85px;
      ">

        <div style="
          display: flex;
          align-items: end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 35px;
        ">
          <div>
            <span style="
              color: ${C.aqua};
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 2.5px;
            ">EDUKASI & INFORMASI</span>

            <h2 style="
              font-size: clamp(27px, 4vw, 34px);
              margin: 12px 0;
              color: ${C.text};
            ">Mitigasi dan Pengetahuan Terkini</h2>

            <p style="
              color: ${C.muted};
              line-height: 1.8;
              max-width: 600px;
            ">
              Jelajahi berbagai artikel edukasi, panduan keselamatan,
              dan informasi seputar kebencanaan.
            </p>
          </div>
        </div>

        <div id="articles-latest" style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        ">
          <div style="
            padding: 40px;
            text-align: center;
            color: ${C.muted};
            ${glass}
            border-radius: 20px;
          ">Memuat artikel...</div>
        </div>

      </section>

      <!-- FAQ -->
      <section style="
        padding: 80px 8%;
        background:
          radial-gradient(circle at 90% 10%, rgba(76,204,185,0.055), transparent 35%);
      ">

        <div style="
          max-width: 780px;
          margin: auto;
          padding: 35px;
          ${glass}
          border-radius: 25px;
        ">

          <div style="text-align: center; margin-bottom: 35px;">
            <span style="
              color: ${C.aqua};
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 2.5px;
            ">INFORMASI POPULER</span>

            <h2 style="
              font-size: 30px;
              margin: 13px 0;
              color: ${C.text};
            ">Pertanyaan Umum</h2>

            <p style="color: ${C.muted}; line-height: 1.8;">
              Temukan jawaban atas beberapa pertanyaan seputar
              tsunami dan kesiapsiagaan bencana.
            </p>
          </div>

          <div id="articles-faq">

            ${[
              {
                question: 'Apa yang harus dilakukan saat merasakan gempa di wilayah pesisir?',
                answer: 'Lindungi diri saat guncangan berlangsung. Setelah guncangan berhenti, segera menjauh dari pantai menuju tempat yang lebih tinggi jika gempa terasa kuat atau lama.'
              },
              {
                question: 'Bagaimana cara mengetahui informasi peringatan tsunami?',
                answer: 'Masyarakat dapat memantau informasi melalui kanal resmi BMKG dan mengikuti arahan petugas kebencanaan setempat.'
              },
              {
                question: 'Apa saja perlengkapan yang perlu disiapkan?',
                answer: 'Siapkan air minum, makanan tahan lama, obat pribadi, senter, baterai, peluit, pakaian, serta dokumen penting.'
              },
              {
                question: 'Kapan masyarakat boleh kembali ke rumah setelah tsunami?',
                answer: 'Kembali ke rumah hanya setelah pihak berwenang menyatakan kondisi aman dan peringatan tsunami telah berakhir.'
              }
            ].map(item => `
              <div data-faq-item style="
                border-bottom: 1px solid ${C.border};
                padding: 20px 0;
              ">
                <button data-faq-trigger style="
                  width: 100%;
                  border: none;
                  background: none;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  gap: 15px;
                  text-align: left;
                  cursor: pointer;
                  color: ${C.text};
                  font-size: 15px;
                  font-weight: bold;
                  line-height: 1.6;
                ">
                  ${item.question}
                  <span data-faq-icon style="
                    color: ${C.aqua};
                    font-size: 23px;
                    flex-shrink: 0;
                  ">+</span>
                </button>

                <div data-faq-content hidden style="
                  color: ${C.muted};
                  line-height: 1.9;
                  font-size: 14px;
                  padding-top: 15px;
                ">
                  ${item.answer}
                </div>
              </div>
            `).join('')}

          </div>
        </div>

      </section>

      <!-- CTA -->
      <section style="
        margin: 25px 8% 65px;
        padding: 65px 5%;
        width: auto;
        box-sizing: border-box;
        max-width: 100%;
        overflow: visible;
        background:
          radial-gradient(circle at 15% 0%, rgba(111,232,207,0.12), transparent 35%),
          rgba(255,255,255,0.065);
        border: 1px solid ${C.border};
        border-radius: 28px;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        color: white;
        text-align: center;
        box-shadow: 0 16px 45px rgba(0,0,0,0.2);
      ">

        <span style="
          color: ${C.aqua};
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2.5px;
        ">SAMUDRA • SIAGA BENCANA</span>

        <h2 style="
          font-size: clamp(20px, 3vw, 30px);
          line-height: 1.4;
          margin: 17px auto;
          color: ${C.text};
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          white-space: normal;
        ">
          Pengetahuan Adalah Langkah Awal Keselamatan.
        </h2>

        <p style="
          color: ${C.muted};
          line-height: 1.9;
          max-width: 650px;
          margin: auto;
        ">
          Tingkatkan pengetahuan dan kesiapsiagaan menghadapi
          potensi bencana tsunami bersama SAMUDRA.
        </p>

      </section>

    </main>
  `;

  container.appendChild(section);

  // TOMBOL JELAJAHI INFORMASI
  const exploreButton = section.querySelector('[data-explore-button]');

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
      console.warn('Gagal memuat artikel:', err);

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

    trigger.onclick = () => {
      const isOpen = !content.hidden;

      items.forEach(other => {
        other.querySelector('[data-faq-content]').hidden = true;
        other.querySelector('[data-faq-icon]').textContent = '+';
      });

      if (!isOpen) {
        content.hidden = false;
        icon.textContent = '−';
      }
    };
  });
}

// RENDER ARTIKEL
function renderRealContent(featuredContainer, latestContainer, apiArticles) {
  const allCards = [];

  // AMBIL DATA DARI BACKEND
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

  // TAMBAHKAN ARTIKEL DEFAULT JIKA DATA BACKEND KURANG
  DEFAULT_GUIDES.forEach(guide => {
    if (allCards.length < 7) {
      allCards.push({
        ...guide,
        isBackend: false
      });
    }
  });

  // FEATURED ARTICLE
  const heroCard = allCards[0];

  if (!heroCard) {
    featuredContainer.innerHTML = `
      <p style="
        text-align: center;
        padding: 40px;
        color: ${C.muted};
      ">
        Belum ada artikel yang tersedia.
      </p>
    `;

    latestContainer.innerHTML = '';
    return;
  }

  const heroImage = safeImageUrl(heroCard.coverImg);

  featuredContainer.innerHTML = `
    <article style="
      display: flex;
      align-items: stretch;
      background: rgba(255,255,255,0.075);
      border: 1px solid ${C.border};
      border-radius: 25px;
      overflow: hidden;
      flex-wrap: wrap;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 18px 42px rgba(0,0,0,0.23);
    ">

      <div style="
        flex: 1.2;
        min-width: 280px;
        min-height: 300px;
        background: rgba(30,100,103,0.28);
        position: relative;
        overflow: hidden;
      ">
        ${
          heroImage
            ? `
              <img
                src="${heroImage}"
                alt="${escapeHTML(heroCard.title)}"
                style="
                  width: 100%;
                  height: 100%;
                  min-height: 300px;
                  object-fit: cover;
                  display: block;
                  filter: brightness(0.82);
                "
              >
            `
            : `
              <div style="
                min-height: 300px;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                color: white;
                gap: 15px;
              ">
                <span style="font-size: 75px;">🌊</span>
                <span style="
                  font-size: 13px;
                  font-weight: bold;
                  letter-spacing: 2px;
                ">SAMUDRA INFORMATION</span>
              </div>
            `
        }
      </div>

      <div style="
        flex: 1;
        min-width: 270px;
        padding: 38px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      ">

        <span style="
          color: ${C.aqua};
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1.5px;
        ">
          ${escapeHTML(heroCard.category)}
        </span>

        <h3 style="
          font-size: 26px;
          line-height: 1.4;
          margin: 16px 0;
          color: ${C.text};
        ">
          ${escapeHTML(heroCard.title)}
        </h3>

        <p style="
          color: ${C.muted};
          font-size: 14px;
          line-height: 1.9;
        ">
          ${escapeHTML(heroCard.excerpt)}
        </p>

        <p style="
          color: ${C.soft};
          font-size: 12px;
          margin-top: 12px;
        ">
          ${escapeHTML(heroCard.dateStr || heroCard.readTime)}
        </p>

        <a
          href="?article=${encodeURIComponent(heroCard.id || 'riset-megathrust')}"
          data-article-card="featured"
          style="
            display: inline-block;
            width: fit-content;
            margin-top: 17px;
            padding: 12px 19px;
            ${accentButton}
            font-size: 13px;
          "
        >
          Baca Artikel Selengkapnya →
        </a>

      </div>

    </article>
  `;

  // ARTIKEL LAINNYA
  const otherCards = allCards.slice(1, 7);

  latestContainer.innerHTML = otherCards.map((item, idx) => {
    const image = safeImageUrl(item.coverImg);

    const href = `?article=${encodeURIComponent(
      item.id || 'edukasi-' + (idx + 1)
    )}`;

    return `
      <article style="
        background: rgba(255,255,255,0.065);
        border: 1px solid ${C.border};
        border-radius: 22px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        backdrop-filter: blur(17px);
        -webkit-backdrop-filter: blur(17px);
        box-shadow: 0 12px 30px rgba(0,0,0,0.20);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      ">

        <div style="
          height: 185px;
          background: rgba(30,100,103,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        ">
          ${
            image
              ? `
                <img
                  src="${image}"
                  alt="${escapeHTML(item.title)}"
                  loading="lazy"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: brightness(0.82);
                  "
                >
              `
              : `
                <span style="font-size: 55px;">🌊</span>
              `
          }
        </div>

        <div style="
          padding: 23px;
          display: flex;
          flex-direction: column;
          flex: 1;
        ">

          <span style="
            color: ${C.aqua};
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 1px;
          ">
            ${escapeHTML(item.category)}
          </span>

          <h3 style="
            font-size: 18px;
            line-height: 1.5;
            margin: 12px 0;
            color: ${C.text};
          ">
            ${escapeHTML(item.title)}
          </h3>

          <p style="
            color: ${C.muted};
            font-size: 13px;
            line-height: 1.8;
            flex: 1;
          ">
            ${escapeHTML(item.excerpt)}
          </p>

          <p style="
            color: ${C.soft};
            font-size: 11px;
            margin-top: 15px;
          ">
            ${escapeHTML(item.dateStr || item.readTime)}
          </p>

          <a
            href="${href}"
            data-article-card="${idx}"
            style="
              display: inline-block;
              margin-top: 12px;
              padding-top: 15px;
              border-top: 1px solid ${C.border};
              color: ${C.aqua};
              font-size: 13px;
              font-weight: bold;
              text-decoration: none;
            "
          >
            Baca Selengkapnya →
          </a>

        </div>

      </article>
    `;
  }).join('');

  // NAVIGASI ARTIKEL
  function setupCardNavigation(element, item, fallbackId) {
    if (!element) return;

    const targetId = item.id || item.slug || fallbackId;

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
      } else {
        openArticleModal(item);
      }
    });
  }

  setupCardNavigation(
    featuredContainer.querySelector('[data-article-card="featured"]'),
    heroCard,
    'riset-megathrust'
  );

  latestContainer.querySelectorAll('[data-article-card]').forEach((element, idx) => {
    if (otherCards[idx]) {
      setupCardNavigation(
        element,
        otherCards[idx],
        'edukasi-' + (idx + 1)
      );
    }
  });
}

// ARTICLE READER MODAL
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
      background: rgba(0,0,0,0.72);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    `;

    modal.innerHTML = `
      <div data-modal-dialog style="
        background: rgba(12,28,32,0.94);
        border: 1px solid rgba(255,255,255,0.18);
        width: 100%;
        max-width: 850px;
        max-height: 90vh;
        border-radius: 24px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: Arial, sans-serif;
        box-shadow: 0 25px 70px rgba(0,0,0,0.5);
        backdrop-filter: blur(22px);
        -webkit-backdrop-filter: blur(22px);
      ">

        <div style="
          display: flex;
          justify-content: flex-end;
          padding: 15px 20px;
          border-bottom: 1px solid ${C.border};
        ">
          <button data-modal-close style="
            border: 1px solid ${C.border};
            background: rgba(255,255,255,0.08);
            width: 38px;
            height: 38px;
            border-radius: 50%;
            font-size: 22px;
            cursor: pointer;
            color: ${C.text};
          ">×</button>
        </div>

        <div style="
          padding: 30px;
          overflow-y: auto;
        ">

          <span id="modal-category" style="
            color: ${C.aqua};
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
          "></span>

          <h2 id="modal-title" style="
            color: ${C.text};
            font-size: 30px;
            line-height: 1.4;
            margin: 15px 0;
          "></h2>

          <p id="modal-date" style="
            color: ${C.soft};
            font-size: 13px;
          "></p>

          <div id="modal-author" style="
            color: ${C.muted};
            font-size: 13px;
            margin: 18px 0;
          "></div>

          <div id="modal-cover"></div>

          <div id="modal-content" style="
            color: ${C.muted};
            font-size: 15px;
            line-height: 2;
            white-space: pre-line;
            margin-top: 25px;
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
          border-radius: 15px;
          margin-top: 15px;
        "
      >
    `;
  } else {
    cover.innerHTML = '';
  }

  const contentElement = modal.querySelector('#modal-content');

  contentElement.textContent =
    item.content || item.excerpt || 'Belum ada isi artikel.';

  // AMBIL DETAIL TERBARU DARI BACKEND
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
                  border-radius: 15px;
                  margin-top: 15px;
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
