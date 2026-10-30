
import { fetchMitigasi } from '../api.js';

// TEMA DARK AQUA GLASS
const C = {
  text: '#F1F7F6',
  muted: '#B5C8C7',
  soft: '#91AAA9',
  aqua: '#8ADBD3',
  accent: '#55BFB7',
  border: 'rgba(255,255,255,0.16)',
  glass: 'rgba(255,255,255,0.07)'
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
  color: white;
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 30px;
  box-shadow: 0 8px 24px rgba(42,170,163,0.18);
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
`;

// MENGAMANKAN TEKS
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


// DATA MITIGASI DEFAULT
const DEFAULT_MITIGASI = [
  {
    id: 'default-step-1',
    stepNumber: 1,
    title: 'Deteksi Gempa & Lindungi Diri',
    description: 'Saat guncangan terasa, segera merunduk (Drop), lindungi kepala dan leher (Cover), serta bertahan di bawah meja kokoh (Hold On) hingga guncangan mereda.',
    imageUrl: ''
  },
  {
    id: 'default-step-2',
    stepNumber: 2,
    title: 'Tinggalkan Kawasan Pantai',
    description: 'Jika berada di pesisir dan merasakan gempa kuat atau berlangsung lama, segera menjauh dari pantai menuju tempat yang lebih tinggi. Jangan menunggu bunyi sirene.',
    imageUrl: ''
  },
  {
    id: 'default-step-3',
    stepNumber: 3,
    title: 'Pilih Jalur Evakuasi Aman',
    description: 'Gunakan jalur evakuasi yang telah ditentukan. Hindari pantai, muara sungai, jembatan, dan area lain yang berpotensi terdampak tsunami.',
    imageUrl: ''
  },
  {
    id: 'default-step-4',
    stepNumber: 4,
    title: 'Bertahan di Tempat Aman',
    description: 'Tetap berada di tempat yang lebih tinggi atau shelter evakuasi hingga pihak berwenang menyatakan kondisi aman dan peringatan tsunami berakhir.',
    imageUrl: ''
  }
];


// MAIN RENDER
export function renderMitigasi(container) {
  const section = document.createElement('section');

  section.id = 'mitigasi';
  section.className = 'mitigasi-section';

  section.innerHTML = `
    <main style="
      font-family: Arial, sans-serif;
      color: ${C.text};
      background: transparent;
      width: 100%;
      overflow: hidden;
    ">

      <!-- HERO SECTION -->
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

        <div style="
          flex: 1;
          min-width: 280px;
        ">
          <span style="
            color: ${C.aqua};
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 2px;
          ">
            SAMUDRA • PANDUAN KEBENCANAAN
          </span>

          <h1 style="
            font-size: clamp(36px, 5vw, 58px);
            line-height: 1.15;
            margin: 22px 0;
            color: ${C.text};
            letter-spacing: -1.5px;
          ">
            Kenali Mitigasi,<br>
            Lindungi Diri.
          </h1>

          <p style="
            color: ${C.muted};
            font-size: 16px;
            line-height: 1.9;
            max-width: 500px;
          ">
            Kenali langkah-langkah penyelamatan diri dan tingkatkan
            kesiapsiagaan menghadapi ancaman tsunami. Karena
            mengetahui apa yang harus dilakukan dapat membantu
            melindungi diri dan orang-orang di sekitar kita.
          </p>

          <a href="#panduan-evakuasi" data-learn-button style="
            display: inline-block;
            margin-top: 22px;
            padding: 15px 27px;
            ${accentButton}
            font-size: 14px;
            cursor: pointer;
          ">
            Pelajari Panduan →
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
            alt="Pemandangan laut dan ombak"
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
              letter-spacing: 1px;
              color: ${C.aqua};
              font-weight: bold;
            ">
              KESIAPSIAGAAN BENCANA
            </span>

            <p style="
              font-size: 16px;
              font-weight: bold;
              margin: 8px 0 0;
              line-height: 1.5;
            ">
              Kenali risiko, pahami tindakan, selamatkan diri.
            </p>
          </div>
        </div>

      </section>


      <!-- INTRODUCTION -->
      <section style="
        padding: 75px 8%;
        text-align: center;
        background:
          radial-gradient(circle at 50% 50%, rgba(85,191,183,0.045), transparent 65%);
      ">

        <span style="
          color: ${C.aqua};
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2px;
        ">
          KENALI ANCAMANNYA
        </span>

        <h2 style="
          font-size: clamp(27px, 4vw, 34px);
          margin: 15px 0;
          color: ${C.text};
        ">
          Mengapa Mitigasi Tsunami Penting?
        </h2>

        <p style="
          max-width: 750px;
          margin: auto;
          color: ${C.muted};
          font-size: 15px;
          line-height: 1.9;
        ">
          Tsunami merupakan rangkaian gelombang laut besar yang
          dapat terjadi akibat gangguan mendadak di dasar laut,
          seperti gempa bumi bawah laut. Dampaknya dapat mengancam
          keselamatan masyarakat di wilayah pesisir. Dengan memahami
          mitigasi, masyarakat dapat mengenali risiko dan melakukan
          tindakan penyelamatan secara lebih cepat dan tepat.
        </p>

        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 18px;
          margin-top: 40px;
          text-align: left;
        ">

          <div style="
            ${glass}
            padding: 25px;
            border-radius: 18px;
          ">
            <div style="font-size: 27px;">🌊</div>
            <h3 style="
              font-size: 17px;
              color: ${C.text};
              margin: 13px 0 8px;
            ">Kenali Risiko</h3>
            <p style="
              color: ${C.muted};
              font-size: 13px;
              line-height: 1.7;
            ">
              Pahami potensi ancaman tsunami di lingkungan sekitar.
            </p>
          </div>

          <div style="
            ${glass}
            padding: 25px;
            border-radius: 18px;
          ">
            <div style="font-size: 27px;">📍</div>
            <h3 style="
              font-size: 17px;
              color: ${C.text};
              margin: 13px 0 8px;
            ">Kenali Lokasi Aman</h3>
            <p style="
              color: ${C.muted};
              font-size: 13px;
              line-height: 1.7;
            ">
              Ketahui titik kumpul dan jalur evakuasi terdekat.
            </p>
          </div>

          <div style="
            ${glass}
            padding: 25px;
            border-radius: 18px;
          ">
            <div style="font-size: 27px;">🛡️</div>
            <h3 style="
              font-size: 17px;
              color: ${C.text};
              margin: 13px 0 8px;
            ">Siapkan Diri</h3>
            <p style="
              color: ${C.muted};
              font-size: 13px;
              line-height: 1.7;
            ">
              Persiapkan perlengkapan dan rencana menghadapi bencana.
            </p>
          </div>

        </div>
      </section>


      <!-- EVACUATION GUIDE HEADER -->
      <section id="panduan-evakuasi" style="
        padding: 65px 8% 35px;
        background: rgba(255,255,255,0.018);
        border-top: 1px solid ${C.border};
        scroll-margin-top: 85px;
      ">

        <div style="
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 25px;
          flex-wrap: wrap;
        ">

          <div>
            <span style="
              color: ${C.aqua};
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 2px;
            ">
              LANGKAH KESELAMATAN
            </span>

            <h2 style="
              font-size: clamp(27px, 4vw, 34px);
              margin: 13px 0;
              color: ${C.text};
            ">
              Panduan Mitigasi Tsunami
            </h2>

            <p style="
              color: ${C.muted};
              line-height: 1.8;
              max-width: 580px;
            ">
              Ikuti tahapan berikut untuk mengetahui tindakan
              yang perlu dilakukan ketika menghadapi ancaman tsunami.
            </p>
          </div>

          <span id="mitigasi-counter" style="
            color: ${C.aqua};
            background: rgba(85,191,183,0.10);
            border: 1px solid rgba(138,219,211,0.22);
            padding: 10px 16px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
          ">
            Memuat panduan...
          </span>

        </div>
      </section>


      <!-- MITIGATION CAROUSEL -->
      <section style="
        padding: 20px 8% 70px;
        background: rgba(255,255,255,0.018);
      ">

        <div style="
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-bottom: 20px;
        ">

          <button
            id="mitigasi-prev"
            aria-label="Langkah sebelumnya"
            style="
              width: 43px;
              height: 43px;
              border-radius: 50%;
              border: 1px solid ${C.border};
              background: rgba(255,255,255,0.07);
              color: ${C.text};
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              font-size: 21px;
              cursor: pointer;
              transition: all 0.3s ease;
            "
          >←</button>

          <button
            id="mitigasi-next"
            aria-label="Langkah selanjutnya"
            style="
              width: 43px;
              height: 43px;
              border-radius: 50%;
              border: 1px solid rgba(138,219,211,0.25);
              background: rgba(85,191,183,0.20);
              color: ${C.aqua};
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              font-size: 21px;
              cursor: pointer;
              transition: all 0.3s ease;
            "
          >→</button>

        </div>

        <div
          id="mitigasi-grid"
          style="
            display: flex;
            gap: 22px;
            align-items: stretch;
            overflow-x: auto;
            scroll-behavior: smooth;
            scroll-snap-type: x mandatory;
            padding: 5px 2px 22px;
            scrollbar-width: thin;
            scrollbar-color: rgba(138,219,211,0.45) transparent;
          "
        >
          <div style="
            flex: 0 0 100%;
            padding: 40px;
            text-align: center;
            color: ${C.muted};
            ${glass}
            border-radius: 20px;
          ">
            Memuat langkah mitigasi...
          </div>
        </div>

      </section>


      <!-- EVACUATION REMINDER -->
      <section style="
        padding: 65px 8%;
        background: transparent;
      ">

        <div style="
          background:
            radial-gradient(circle at 10% 0%, rgba(111,232,207,0.12), transparent 35%),
            rgba(255,255,255,0.065);
          border: 1px solid ${C.border};
          padding: 40px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          flex-wrap: wrap;
          color: ${C.text};
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 16px 45px rgba(0,0,0,0.2);
        ">

          <div style="flex: 1; min-width: 250px;">
            <span style="
              color: ${C.aqua};
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 2px;
            ">
              INGAT SELALU
            </span>

            <h2 style="
              font-size: clamp(23px, 4vw, 28px);
              line-height: 1.4;
              margin: 12px 0;
              color: ${C.text};
            ">
              Jangan Tunggu Gelombang Datang untuk Menyelamatkan Diri.
            </h2>

            <p style="
              color: ${C.muted};
              line-height: 1.8;
              font-size: 14px;
              max-width: 600px;
            ">
              Jika merasakan gempa kuat atau lama di wilayah pesisir,
              segera menjauh dari pantai dan menuju tempat yang lebih
              tinggi. Jangan menunggu sirene atau peringatan resmi
              apabila terdapat tanda alami tsunami.
            </p>
          </div>

          <div style="
            font-size: 65px;
            padding: 15px;
            filter: drop-shadow(0 5px 15px rgba(85,191,183,0.18));
          ">
            🏃
          </div>

        </div>

      </section>

    </main>
  `;

  container.appendChild(section);


  // TOMBOL PELAJARI PANDUAN
  const learnButton = section.querySelector('[data-learn-button]');

  learnButton.addEventListener('click', event => {
    event.preventDefault();

    const target = section.querySelector('#panduan-evakuasi');

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });


 
  // CAROUSEL
  const grid = section.querySelector('#mitigasi-grid');
  const btnPrev = section.querySelector('#mitigasi-prev');
  const btnNext = section.querySelector('#mitigasi-next');
  const counter = section.querySelector('#mitigasi-counter');

  // STYLE DEFAULT DAN HOVER KEDUA TOMBOL
  [btnPrev, btnNext].forEach(button => {
    button.style.background = 'rgba(255,255,255,0.07)';
    button.style.border = `1px solid ${C.border}`;
    button.style.color = C.text;
    button.style.transition = 'all 0.3s ease';

    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(85,191,183,0.22)';
      button.style.borderColor = 'rgba(138,219,211,0.55)';
      button.style.color = C.aqua;
      button.style.transform = 'translateY(-3px)';
      button.style.boxShadow = '0 8px 20px rgba(85,191,183,0.18)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(255,255,255,0.07)';
      button.style.borderColor = C.border;
      button.style.color = C.text;
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    });
  });

  // FUNGSI SCROLL KE KIRI
  btnPrev.onclick = () => {
    const card = grid.querySelector('.mitigasi-card');
    const scrollAmount = card ? card.offsetWidth + 22 : 300;

    grid.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  };

  // FUNGSI SCROLL KE KANAN
  btnNext.onclick = () => {
    const card = grid.querySelector('.mitigasi-card');
    const scrollAmount = card ? card.offsetWidth + 22 : 300;

    grid.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };



  // AMBIL DATA DARI API
  fetchMitigasi()
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const sorted = [...data].sort(
          (a, b) => (a.stepNumber || 0) - (b.stepNumber || 0)
        );

        renderCards(grid, sorted, counter);
      } else {
        renderCards(grid, DEFAULT_MITIGASI, counter);
      }
    })
    .catch(err => {
      console.warn(
        'Gagal memuat API mitigasi, menggunakan panduan default:',
        err
      );

      renderCards(grid, DEFAULT_MITIGASI, counter);
    });
}


// RENDER MITIGATION CARDS
function renderCards(grid, items, counter) {

  if (counter) {
    counter.textContent = `${items.length} Panduan Evakuasi`;
  }

  grid.innerHTML = items.map((item, idx) => {

    const stepNum = item.stepNumber || (idx + 1);
    const stepLabel = `LANGKAH ${String(stepNum).padStart(2, '0')}`;

    const itemTitle = escapeHTML(item.title || 'Panduan Mitigasi');
    const itemDescription = escapeHTML(
      item.description || 'Instruksi kesiapsiagaan dan tindakan tanggap darurat.'
    );

    const itemId = escapeHTML(item.id || 'mitigasi-' + stepNum);

    const href = `?article=${encodeURIComponent(
      item.id || 'mitigasi-' + stepNum
    )}`;

    const image = safeImageUrl(item.imageUrl);

    return `
      <a
        class="mitigasi-card"
        href="${href}"
        data-id="${itemId}"
        aria-label="Buka panduan: ${itemTitle}"
        style="
          display: block;
          flex: 0 0 min(320px, 85%);
          scroll-snap-align: start;
          background: rgba(255,255,255,0.065);
          border: 1px solid ${C.border};
          border-radius: 22px;
          overflow: hidden;
          text-decoration: none;
          color: ${C.text};
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 14px 32px rgba(0,0,0,0.20);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        "
      >

        <!-- CARD IMAGE -->
        <div style="
          height: 190px;
          position: relative;
          overflow: hidden;
          background: rgba(30,100,103,0.28);
        ">

          ${
            image
              ? `
                <img
                  src="${image}"
                  alt="${itemTitle}"
                  loading="lazy"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    filter: brightness(0.78);
                  "
                >
              `
              : `
                <div style="
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-direction: column;
                  gap: 12px;
                  background:
                    radial-gradient(circle at 50% 30%, rgba(85,191,183,0.18), transparent 50%),
                    rgba(255,255,255,0.035);
                  color: white;
                ">
                  <span style="font-size: 45px;">🌊</span>
                  <span style="
                    font-size: 12px;
                    letter-spacing: 2px;
                    font-weight: bold;
                    color: ${C.aqua};
                  ">
                    SAMUDRA GUIDE
                  </span>
                </div>
              `
          }

          <span style="
            position: absolute;
            top: 15px;
            left: 15px;
            background: rgba(5,20,25,0.72);
            color: ${C.aqua};
            border: 1px solid rgba(255,255,255,0.2);
            padding: 8px 12px;
            border-radius: 20px;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
          ">
            ${stepLabel}
          </span>

        </div>


        <!-- CARD CONTENT -->
        <div style="padding: 23px;">

          <span style="
            color: ${C.aqua};
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 1px;
          ">
            PANDUAN EVAKUASI
          </span>

          <h3 style="
            font-size: 19px;
            line-height: 1.5;
            margin: 12px 0;
            color: ${C.text};
          ">
            ${itemTitle}
          </h3>

          <p style="
            color: ${C.muted};
            font-size: 13px;
            line-height: 1.8;
            margin-bottom: 22px;
          ">
            ${itemDescription}
          </p>

          <div style="
            border-top: 1px solid ${C.border};
            padding-top: 17px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">

            <span style="
              color: ${C.aqua};
              font-size: 13px;
              font-weight: bold;
            ">
              Baca Panduan Lengkap
            </span>

            <span style="
              color: ${C.aqua};
              font-size: 19px;
            ">
              →
            </span>

          </div>

        </div>

      </a>
    `;

  }).join('');


  // NAVIGASI ARTIKEL
  grid.querySelectorAll('.mitigasi-card').forEach(card => {

    const targetId = card.getAttribute('data-id');

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

      if (typeof window.__navigateToArticle === 'function') {
        window.__navigateToArticle(targetId);
      }

    });

  });

}
