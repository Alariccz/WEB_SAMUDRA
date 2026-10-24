import { fetchArticles, fetchArticleById } from '../api.js';

// SVG Graphics matching the Morgana dark / Electric Azure Cyber Blue aesthetic
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
      
      <!-- Sonar Radar Arc (matching Morgana circular headset/radar contour) -->
      <circle cx="270" cy="270" r="205" stroke="#00d2ff" stroke-width="40" stroke-opacity="0.8" stroke-dasharray="14 6" fill="none"/>
      <circle cx="270" cy="270" r="205" stroke="#051021" stroke-width="12" fill="none"/>
      
      <!-- Three 3D Extruded Depth & Seismic Pulse Bars -->
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
          Artikel, edukasi, dan dokumentasi mitigasi bencana resmi yang tersinkronisasi langsung dari database server SAMUDRA. Klik artikel untuk membaca selengkapnya.
        </p>
      </div>
    </div>

    <!-- Main Showcase Grid (Big Hero Card on Left, 3 Stacked Cards on Right) -->
    <div class="morgana-hero-grid">
      <!-- Left Hero Card Container -->
      <div id="morgana-hero-container">
        <!-- Will be populated dynamically by backend data -->
      </div>

      <!-- Right 3 Stacked Cards Container -->
      <div class="morgana-stack" id="morgana-stack-container">
        <!-- Will be populated dynamically by backend data -->
      </div>
    </div>

    <!-- Second Row: Latest Insights (3-column grid) -->
    <div class="morgana-latest">
      <div class="morgana-latest__header">
        <h3 class="morgana-subheading">Mitigasi &amp; Pengetahuan Terkini</h3>
        <p class="morgana-sublede">
          Instruksi kesiapsiagaan, panduan lapangan, dan dokumentasi tindakan saat krisis tiba.
        </p>
      </div>
      <div class="morgana-latest__grid" id="morgana-latest-container">
        <!-- Will be populated dynamically by backend data -->
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

  // Load from real backend API: /api/articles
  fetchArticles()
    .then(articles => {
      renderRealContent(heroContainer, stackContainer, latestContainer, Array.isArray(articles) ? articles : []);
    })
    .catch(() => {
      renderRealContent(heroContainer, stackContainer, latestContainer, []);
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

function renderRealContent(heroContainer, stackContainer, latestContainer, apiArticles) {
  // Fallback guides only if backend is empty
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
      svgThumb: SVGS.waveSlices,
    }
  ];

  // Convert all items from backend into standardized card objects
  const allCards = [];

  // 1. First add articles from /api/articles
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



  // If cards count < 7, pad with defaultGuides
  defaultGuides.forEach(guide => {
    if (allCards.length < 7) {
      allCards.push(guide);
    }
  });

  // Hero Card is the 1st card (Backend article if exists!)
  const heroCard = allCards[0] || defaultGuides[0];
  const heroHref = `?article=${encodeURIComponent(heroCard.id || heroCard.slug || 'riset-megathrust')}`;
  heroContainer.innerHTML = `
    <a class="morgana-hero-card" href="${heroHref}" aria-label="Buka artikel: ${heroCard.title}">
      <div class="morgana-hero-card__visual">
        ${heroCard.coverImg ? `<img src="${heroCard.coverImg}" alt="${heroCard.title}" loading="lazy">` : SVGS.hero}
        <div class="morgana-hero-card__overlay">
          <span class="morgana-badge">${heroCard.category}</span>
          <span class="morgana-read-time">${heroCard.readTime}</span>
        </div>
      </div>
      <div class="morgana-hero-card__content">
        <h3 class="morgana-hero-card__title">${heroCard.title}</h3>
        <p class="morgana-hero-card__desc">${heroCard.excerpt}</p>
        <span class="morgana-read-more">Buka artikel selengkapnya &rarr;</span>
      </div>
    </a>
  `;

  // Stack Cards (Cards index 1, 2, 3)
  const stackCards = allCards.slice(1, 4);
  stackContainer.innerHTML = stackCards.map((item, idx) => {
    const href = `?article=${encodeURIComponent(item.id || item.slug || 'panduan-' + (idx + 1))}`;
    return `
      <a class="morgana-card" href="${href}" data-idx="${idx}" aria-label="Buka artikel: ${item.title}">
        <div class="morgana-card__body">
          <div class="morgana-card__top">
            <span class="morgana-badge">${item.category}</span>
            <span class="morgana-read-time">${item.readTime}</span>
          </div>
          <h4 class="morgana-card__title">${item.title}</h4>
          <p class="morgana-card__excerpt">${item.excerpt}</p>
          <span class="morgana-read-more">Baca &rarr;</span>
        </div>
        <div class="morgana-card__thumb">
          ${item.coverImg ? `<img src="${item.coverImg}" alt="${item.title}" loading="lazy">` : (item.svgThumb || SVGS.waveSlices)}
        </div>
      </a>
    `;
  }).join('');

  // Latest Insights Cards (Cards index 4, 5, 6)
  const latestCards = allCards.slice(4, 7);
  latestContainer.innerHTML = latestCards.map((item, idx) => {
    const href = `?article=${encodeURIComponent(item.id || item.slug || 'edukasi-' + (idx + 1))}`;
    return `
      <a class="morgana-latest-card" href="${href}" data-idx="${idx}" aria-label="Buka artikel: ${item.title}">
        <div class="morgana-latest-card__thumb">
          ${item.coverImg ? `<img src="${item.coverImg}" alt="${item.title}" loading="lazy">` : (item.svgThumb || SVGS.radarDial)}
        </div>
        <div class="morgana-latest-card__body">
          <div class="morgana-card__top">
            <span class="morgana-badge">${item.category}</span>
            <span class="morgana-read-time">${item.readTime}</span>
          </div>
          <h4 class="morgana-latest-card__title">${item.title}</h4>
          <p class="morgana-latest-card__excerpt">${item.excerpt}</p>
          <span class="morgana-read-more">Baca artikel &rarr;</span>
        </div>
      </a>
    `;
  }).join('');

  // ===== NAVIGATION HANDLER (Supports Left Click for SPA & Modifier/Middle Click for New Tab) =====
  function setupCardNavigation(el, item, fallbackId) {
    if (!el) return;
    const targetId = item.id || item.slug || fallbackId;

    el.addEventListener('click', e => {
      // Allow browser native middle-click, ctrl-click, cmd-click to open in new tab
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      e.preventDefault();
      if (typeof window.__navigateToArticle === 'function') {
        window.__navigateToArticle(targetId);
      } else {
        openArticleModal(item);
      }
    });

    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof window.__navigateToArticle === 'function') {
          window.__navigateToArticle(targetId);
        } else {
          openArticleModal(item);
        }
      }
    });
  }

  const heroEl = heroContainer.querySelector('.morgana-hero-card');
  setupCardNavigation(heroEl, heroCard, 'riset-megathrust');

  const stackEls = stackContainer.querySelectorAll('.morgana-card');
  stackEls.forEach((el, idx) => {
    if (stackCards[idx]) {
      setupCardNavigation(el, stackCards[idx], 'panduan-' + (idx + 1));
    }
  });

  const latestEls = latestContainer.querySelectorAll('.morgana-latest-card');
  latestEls.forEach((el, idx) => {
    if (latestCards[idx]) {
      setupCardNavigation(el, latestCards[idx], 'edukasi-' + (idx + 1));
    }
  });
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
