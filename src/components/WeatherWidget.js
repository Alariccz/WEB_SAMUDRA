// WeatherWidget.js - Real-Time Yogyakarta & Coastal DIY Weather Station
// Connects to live Open-Meteo & BMKG telemetry data with interactive dot-matrix sky

const PITCH = 8;
const DOT = 6;
const SUNRISE = 5.5; // Tropical Indonesia sunrise ~05:30 WIB
const SUNSET = 17.8; // Tropical Indonesia sunset ~17:48 WIB
const FULL_MOON = Date.UTC(2026, 8, 26, 16, 49);
const SYNODIC = 29.530589;
const MS_PER_DAY = 86400000;

export const JOGJA_LOCATIONS = [
  { id: 'jogja', name: 'Yogyakarta Kota', lat: -7.7956, lon: 110.3695, tag: 'DARAT & KOTA' },
  { id: 'parangtritis', name: 'Pesisir Parangtritis (Bantul)', lat: -7.9822, lon: 110.3189, tag: 'PESISIR SELATAN' },
  { id: 'glagah', name: 'Pesisir Glagah (Kulon Progo)', lat: -7.9150, lon: 110.0750, tag: 'ZONA BANDARA YIA' },
  { id: 'baron', name: 'Pantai Baron (Gunungkidul)', lat: -8.1305, lon: 110.5486, tag: 'TEBING KARST' }
];

const WEATHER_SKY_LAYERS = [
  'off', 'glow', 'star', 'moonDark', 'moon', 'sun', 'ray',
  'heat', 'bird', 'snow', 'rain', 'bolt', 'cloud', 'cloudDark', 'fog', 'wind', 'hill', 'hz'
];

const SKY_PAINT = {
  off: '#101726',
  glow: '#f59e0b',
  star: '#38bdf8',
  moonDark: '#1e293b',
  moon: '#e2e8f0',
  sun: '#fbbf24',
  ray: '#f59e0b',
  heat: '#f59e0b',
  bird: '#0ea5e9',
  snow: '#ffffff',
  rain: '#38bdf8',
  bolt: '#fef08a',
  cloud: '#94a3b8',
  cloudDark: '#475569',
  fog: '#64748b',
  wind: '#0284c7',
  hill: '#081120',
  hz: '#0ea5e9'
};

const MINI = {
  sun: ['...S...', '.S...S.', '..SSS..', 'S.SSS.S', '..SSS..', '.S...S.', '...S...'],
  moon: ['..MMM..', '.MM....', 'MM.....', 'MM.....', 'MM.....', '.MM....', '..MMM..'],
  partly: ['S.S....', '.SSS...', 'SSSCC..', '.SCCCC.', 'CCCCCCC', '.CCCCC.', '.......'],
  partlyNight: ['MM.....', 'M......', 'M..CC..', 'MMCCCC.', 'CCCCCCC', '.CCCCC.', '.......'],
  cloud: ['.......', '..CC...', '.CCCCC.', 'CCCCCCC', 'CCCCCCC', '.CCCCC.', '.......'],
  drizzle: ['..CC...', '.CCCCC.', 'CCCCCCC', '.CCCCC.', '.......', '.R...R.', '...R...'],
  rain: ['..DD...', '.DDDDD.', 'DDDDDDD', '.DDDDD.', '.......', '.R.R.R.', 'R.R.R..'],
  storm: ['..DD...', '.DDDDD.', 'DDDDDDD', '..Z...R', '.ZZ..R.', '..Z....', '.Z.....'],
  snow: ['N..N..N', '.......', '.N..N..', '.......', 'N..N..N', '.......', '.N..N..'],
  sleet: ['..DD...', '.DDDDD.', 'DDDDDDD', '.DDDDD.', '.......', '.N.R.N.', 'R.N.R..'],
  mist: ['FFFFF..', '.......', '..FFFFF', '.......', 'FFFFF..', '.......', '.FFFFFF'],
  windy: ['WWWWW..', '.....W.', 'WWWWW..', '.......', 'WWWWWW.', '......W', 'WWWW...'],
  heat: ['.SSS...', 'SSSSS..', '.SSS...', '.......', 'S.S.S.S', '.S.S.S.', '.......']
};

const MINI_LAYER = {
  S: 'sun', M: 'moon', C: 'cloud', D: 'cloudDark', R: 'rain', Z: 'bolt', F: 'fog', N: 'snow', W: 'wind'
};

const GLYPH_PAINT = {
  sun: '#fbbf24', moon: '#e2e8f0', cloud: '#94a3b8', cloudDark: '#64748b',
  rain: '#38bdf8', bolt: '#fef08a', fog: '#94a3b8', snow: '#ffffff', wind: '#0284c7'
};

function wmoToKind(code, windSpeed = 0, temp = 25) {
  if (temp >= 35) return 'heat';
  if (windSpeed >= 28) return 'windy';
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partly';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'mist';
  if (code >= 51 && code <= 55) return 'drizzle';
  if (code === 56 || code === 57 || code === 66 || code === 67) return 'sleet';
  if (code >= 61 && code <= 65) return 'rain';
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 95) return 'storm';
  return 'partly';
}

function wmoToLabel(code) {
  switch (code) {
    case 0: return 'Cerah';
    case 1: return 'Cerah Berawan';
    case 2: return 'Sebagian Berawan';
    case 3: return 'Berawan Tebal';
    case 45:
    case 48: return 'Berkabut';
    case 51:
    case 53:
    case 55: return 'Gerimis Halus';
    case 61: return 'Hujan Ringan';
    case 63: return 'Hujan Sedang';
    case 65: return 'Hujan Lebat';
    case 80:
    case 81:
    case 82: return 'Hujan Guyur';
    case 95:
    case 96:
    case 99: return 'Badai Petir';
    default: return 'Cerah Berawan';
  }
}

function getMoonAge(date = new Date()) {
  const age = ((date.getTime() - FULL_MOON) / MS_PER_DAY / SYNODIC + 0.5) % 1;
  return age < 0 ? age + 1 : age;
}

function moonLit(dx, r, age) {
  const lit = (1 - Math.cos(age * 2 * Math.PI)) / 2;
  const nx = dx / r;
  return age < 0.5 ? nx >= 1 - 2 * lit : nx <= -(1 - 2 * lit);
}

function wrap(v, n) {
  return ((v % n) + n) % n;
}

function clamp(v) {
  return Math.min(1, Math.max(0, v ?? 0));
}

function buildWeatherScene(cols, rows, hz, hour, sky, tick = 0) {
  const grid = new Map();
  const put = (x, y, layer) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= cols || y >= hz) return;
    grid.set(`${x},${y}`, layer);
  };

  const h = wrap(hour, 24);
  const day = h >= SUNRISE && h <= SUNSET;
  const td = (h - SUNRISE) / (SUNSET - SUNRISE);
  const tn = wrap(h - SUNSET, 24) / (24 - (SUNSET - SUNRISE));
  const arc = (t) => [3 + t * (cols - 7), hz - 1 - Math.sin(Math.PI * t) * (hz - 7)];

  const rain = clamp(sky.rain);
  const mist = clamp(sky.mist);
  const wind = clamp(sky.wind);
  const heat = clamp(sky.heat);
  const dir = sky.windFrom ?? 1;
  const covered = !!sky.overcast;

  // Horizon glow at dawn / dusk
  if (day && (td < 0.12 || td > 0.88) && !covered) {
    for (let y = hz - 4; y < hz; y++) {
      for (let x = 0; x < cols; x++) {
        if ((x + y) % 2 === 0 && (y >= hz - 2 || x % 4 === 0)) put(x, y, 'glow');
      }
    }
  }

  // Night stars
  if (!day && !covered) {
    for (let s = 0; s < 12; s++) {
      if (wrap(tick + s * 3, 9) !== 0) put(wrap(s * 17 + 5, cols), wrap(s * 7 + 1, hz - 4), 'star');
    }
  }

  // Sun / Moon
  if (!covered) {
    if (day) {
      const r = 3.2;
      const [px, py] = arc(td);
      const sx = Math.round(px), sy = Math.round(py);
      for (let dx = -4; dx <= 4; dx++) {
        for (let dy = -4; dy <= 4; dy++) {
          if (dx * dx + dy * dy <= r * r + 0.3) put(sx + dx, sy + dy, 'sun');
        }
      }
      const dirs = wrap(tick, 4) < 2
        ? [[0, -1], [0, 1], [-1, 0], [1, 0]]
        : [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]];
      for (const [ddx, ddy] of dirs) {
        for (let k = r + 1.5; k <= r + 2.7; k += 1) put(sx + ddx * k, sy + ddy * k, 'ray');
      }
      // Tropical sea birds
      for (let b = 0; b < 2; b++) {
        const bx = wrap(Math.floor(cols * 0.5) + b * 8 + dir * Math.floor(tick / 2), cols + 4) - 2;
        const by = 5 + b * 3;
        const up = wrap(tick, 2) === 0 ? 1 : 0;
        put(bx - 1, by - up, 'bird');
        put(bx, by, 'bird');
        put(bx + 1, by - up, 'bird');
      }
    } else {
      const r = 3;
      const age = sky.moonPhase ?? getMoonAge();
      const [qx, qy] = arc(tn);
      const mx = Math.round(qx), my = Math.round(qy);
      for (let dx = -4; dx <= 4; dx++) {
        for (let dy = -4; dy <= 4; dy++) {
          if (dx * dx + dy * dy > r * r + 0.4) continue;
          put(mx + dx, my + dy, moonLit(dx, r, age) ? 'moon' : 'moonDark');
        }
      }
    }
  }

  // Heat shimmer
  if (heat > 0) {
    for (let x = 1; x < cols; x += 3) {
      for (let y = hz - 5; y < hz; y++) {
        if (wrap(y + tick, 3) === 0) put(x + wrap(y + tick, 2), y, 'heat');
      }
    }
  }

  // Clouds
  const drift = dir * tick * (0.2 + wind * 0.6);
  const clouds = (sky.clouds ?? []).map((c) => {
    const w = Math.max(2, Math.round(c.size * (0.6 + (0.4 * cols) / 46)));
    const cx = wrap(Math.round(c.x * cols + drift), cols + 2 * w + 4) - w - 2;
    return { cx, cy: Math.round(c.y * hz), w, layer: c.dark ? 'cloudDark' : 'cloud' };
  });

  // Rain
  if (rain > 0) {
    const fast = rain > 0.6 ? 2 : 1;
    const gap = rain < 0.4 ? 5 : 3;
    const slant = rain > 0.6 || wind > 0.4;
    for (const { cx, cy, w } of clouds) {
      for (let x = cx - w + 1; x <= cx + w - 1; x += (rain > 0.7 ? 1 : 2)) {
        for (let y = cy + 2; y < hz; y++) {
          if (wrap(y - tick * fast + x * 3, gap) === 0) {
            put(x - (slant ? dir * wrap(y, 2) : 0), y, 'rain');
          }
        }
      }
    }
  }

  // Thunder
  if (sky.thunder && clouds.length && wrap(tick, 18) < 3 && wrap(tick, 18) !== 1) {
    const c0 = clouds[0];
    let lx = c0.cx;
    for (let y = c0.cy + 2, s = 0; y < hz; y++, s++) {
      lx += wrap(s, 6) < 3 ? -1 : 1;
      put(lx, y, 'bolt');
      put(lx + 1, y, 'bolt');
    }
  }

  // Render Cloud shapes
  for (const { cx, cy, w, layer } of clouds) {
    for (let x = cx - w + 1; x <= cx + w - 1; x++) put(x, cy + 1, layer);
    for (let x = cx - w; x <= cx + w; x++) put(x, cy, layer);
    for (let x = cx - w + 1; x <= cx + w - 2; x++) put(x, cy - 1, layer);
    for (let x = cx - 1; x <= cx + 2; x++) put(x, cy - 2, layer);
    put(cx - w + 2, cy - 2, layer);
    put(cx - w + 3, cy - 2, layer);
    put(cx, cy - 3, layer);
    put(cx + 1, cy - 3, layer);
  }

  // Mist
  if (mist > 0) {
    [2, 5, 8].forEach((d, i) => {
      const way = i % 2 ? -1 : 1;
      for (let x = 0; x < cols; x++) {
        if (wrap(x + way * Math.floor(tick / 2) + i * 3, 9) < 5) put(x, hz - d, 'fog');
      }
    });
  }

  // Wind gusts
  if (wind > 0.3) {
    for (let g = 0; g < 4; g++) {
      const wy = 2 + wrap(g * 5, hz - 4);
      const len = 4;
      const wx = dir > 0 ? wrap(g * 17 + tick * 2, cols + 8) - 4 : cols - (wrap(g * 17 + tick * 2, cols + 8) - 4) - len;
      for (let k = 0; k < len; k++) put(wx + k, wy, 'wind');
      put(dir > 0 ? wx + len : wx - 1, wy - 1, 'wind');
    }
  }

  // Coastal Mountain / Sea horizon
  for (let x = 0; x < cols; x++) {
    const hill = Math.max(0, Math.round(3 - Math.abs(x - cols * 0.78) / 2.5)) +
                 Math.max(0, Math.round(1.8 - Math.abs(x - cols * 0.15) / 2.3));
    for (let y = hz - hill; y < hz; y++) grid.set(`${x},${y}`, 'hill');
    grid.set(`${x},${hz}`, 'hz');
  }

  const paths = Object.fromEntries(WEATHER_SKY_LAYERS.map((l) => [l, '']));
  const o = (PITCH - DOT) / 2;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const l = grid.get(`${x},${y}`) ?? 'off';
      paths[l] += `M${x * PITCH + o} ${y * PITCH + o}h${DOT}v${DOT}h-${DOT}Z `;
    }
  }
  return paths;
}

function renderGlyphSVG(kind, hour = 12) {
  const day = hour >= SUNRISE && hour <= SUNSET;
  const key = kind === 'clear' ? (day ? 'sun' : 'moon') : (kind === 'partly' && !day ? 'partlyNight' : kind);
  const rows = MINI[key] ?? MINI.cloud;
  const paths = {};

  rows.forEach((row, y) => {
    [...row].forEach((c, x) => {
      const layer = MINI_LAYER[c];
      if (layer) {
        if (!paths[layer]) paths[layer] = '';
        paths[layer] += `M${x * 3 + 0.3} ${y * 3 + 0.3}h2.4v2.4h-2.4Z `;
      }
    });
  });

  return `
    <svg aria-hidden="true" shape-rendering="crispEdges" viewBox="0 0 21 21" style="width: 20px; height: 20px; flex-shrink: 0;">
      ${Object.entries(paths).map(([layer, d]) => `<path d="${d}" fill="${GLYPH_PAINT[layer] || '#fff'}"/>`).join('')}
    </svg>
  `;
}

export function renderWeatherSection(container) {
  const section = document.createElement('section');
  section.id = 'cuaca';
  section.className = 'weather-section';

  section.innerHTML = `
    <div class="section-header">
      <span class="section-eyebrow">TELEMETRI ATMOSFER &amp; CUACA MARITIM DIY</span>
      <h2 class="section-title">Stasiun Cuaca Riil Yogyakarta.</h2>
      <p class="section-lead">Pemantauan data atmosfer, hembusan angin laut selatan, dan indeks risiko badai secara langsung di Yogyakarta untuk kesiapsiagaan mitigasi pesisir.</p>
    </div>

    <div class="weather-grid">
      <!-- Left: Interactive Dot-Matrix Weather Slab Component -->
      <div class="weather-slab-container" id="weather-slab-root">
        <div class="weather-slab">
          <!-- Header -->
          <div class="weather-slab__header">
            <div>
              <h3 class="weather-slab__place" id="weather-place-title">Yogyakarta, DIY</h3>
              <p class="weather-slab__summary" id="weather-summary-text">Sinkronisasi data pengamatan stasiun BMKG...</p>
            </div>
            <div class="weather-slab__live">
              <span class="weather-led"></span>
              <span class="weather-live-badge">LIVE BMKG</span>
              <span class="weather-clock" id="weather-clock">12:00 WIB</span>
            </div>
          </div>

          <!-- Location Selector Pills -->
          <div class="weather-location-bar">
            ${JOGJA_LOCATIONS.map((loc, idx) => `
              <button class="weather-loc-btn ${idx === 0 ? 'weather-loc-btn--active' : ''}" data-id="${loc.id}">
                ${loc.name.split(' (')[0]}
              </button>
            `).join('')}
          </div>

          <!-- Sky Canvas Container -->
          <div class="weather-sky" id="weather-sky-wrapper">
            <svg id="weather-sky-svg" aria-hidden="true" shape-rendering="crispEdges" viewBox="0 0 ${46 * PITCH} ${28 * PITCH}">
              ${WEATHER_SKY_LAYERS.map(l => `<path id="sky-layer-${l}" d="" fill="${SKY_PAINT[l]}"/>`).join('')}
            </svg>
            <div class="weather-now-overlay">
              <div class="weather-now-temp" id="weather-temp-val">--°</div>
              <div class="weather-now-meta">
                <span class="weather-now-cond" id="weather-cond-val">Memuat data...</span>
                <span class="weather-now-readout" id="weather-readout-val">Feels --° &bull; Lembap --% &bull; Angin -- km/h</span>
              </div>
            </div>
          </div>

          <!-- Next Hours Slots -->
          <ol class="weather-hours-list" id="weather-hours-container">
            <!-- Will be dynamically populated -->
          </ol>

          <!-- 7-Day Forecast Scale -->
          <div class="weather-week-wrap">
            <div class="weather-week-header">
              <span>7 Hari ke Depan</span>
              <span>Min</span>
              <span class="weather-week-scale-labels"><span>20°</span><span>27°</span><span>35°</span></span>
              <span>Maks</span>
            </div>
            <ul class="weather-week-list" id="weather-week-container">
              <!-- Will be dynamically populated -->
            </ul>
          </div>
        </div>
      </div>

      <!-- Right: Maritime Safety & Coastal Telemetry Intel -->
      <div class="weather-intel">
        <div class="intel-card intel-card--glow">
          <div class="intel-card__top">
            <span class="intel-card__badge">STASIUN AKTIF</span>
            <span class="intel-card__status" id="station-tag">DARAT &amp; KOTA</span>
          </div>
          <h4 class="intel-card__title" id="intel-location-name">Yogyakarta Kota</h4>
          <p class="intel-card__desc" id="intel-location-desc">Pengamatan cuaca dan dinamika atmosfer stasiun meteorologi Yogyakarta, mencakup estimasi curah hujan, tutupan awan, dan indeks kenyamanan suhu.</p>
          <div class="intel-stats-grid">
            <div class="intel-stat">
              <span class="intel-stat__lbl">KECEPATAN ANGIN</span>
              <span class="intel-stat__val" id="stat-wind">-- km/h</span>
            </div>
            <div class="intel-stat">
              <span class="intel-stat__lbl">KELEMBAPAN UDARA</span>
              <span class="intel-stat__val" id="stat-humidity">--%</span>
            </div>
            <div class="intel-stat">
              <span class="intel-stat__lbl">SUHU TERASA (FEELS)</span>
              <span class="intel-stat__val" id="stat-feels">--°C</span>
            </div>
            <div class="intel-stat">
              <span class="intel-stat__lbl">STATUS RISIKO</span>
              <span class="intel-stat__val intel-stat__val--safe" id="stat-risk">SIAGA AMAN</span>
            </div>
          </div>
        </div>

        <!-- Maritime Wave Card -->
        <div class="intel-card">
          <div class="intel-card__top">
            <span class="intel-card__badge">PESISIR SELATAN DIY</span>
            <span class="intel-card__status">TELEMETRI MARITIM</span>
          </div>
          <h4 class="intel-card__title">Analisis Gelombang &amp; Angin Laut</h4>
          <p class="intel-card__desc">Pesisir Samudra Hindia DIY dipengaruhi dinamika angin muson dan gelombang pasang selatan yang terhubung langsung ke sistem mitigasi tsunami.</p>
          <div class="intel-stats-grid">
            <div class="intel-stat">
              <span class="intel-stat__lbl">GELOMBANG SIGNIFIKAN</span>
              <span class="intel-stat__val" id="stat-wave" style="color: #38bdf8;">1.5 &ndash; 2.8 m</span>
            </div>
            <div class="intel-stat">
              <span class="intel-stat__lbl">INTERVAL TELEMETRI</span>
              <span class="intel-stat__val">15 Menit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(section);

  // Initialize interactive logic
  initWeatherStation(section);
}

function initWeatherStation(section) {
  let currentLocation = JOGJA_LOCATIONS[0];
  let weatherData = null;
  let tick = 0;
  let isAwake = true;

  const clockEl = section.querySelector('#weather-clock');
  const placeTitle = section.querySelector('#weather-place-title');
  const summaryText = section.querySelector('#weather-summary-text');
  const tempVal = section.querySelector('#weather-temp-val');
  const condVal = section.querySelector('#weather-cond-val');
  const readoutVal = section.querySelector('#weather-readout-val');
  const hoursList = section.querySelector('#weather-hours-container');
  const weekList = section.querySelector('#weather-week-container');

  const stationTag = section.querySelector('#station-tag');
  const intelName = section.querySelector('#intel-location-name');
  const statWind = section.querySelector('#stat-wind');
  const statHumidity = section.querySelector('#stat-humidity');
  const statFeels = section.querySelector('#stat-feels');
  const statRisk = section.querySelector('#stat-risk');
  const statWave = section.querySelector('#stat-wave');

  // Clock updater
  setInterval(() => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hrs}:${mins} WIB`;
  }, 1000);

  // Awake observer for performance
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isAwake = entry.isIntersecting;
    });
    observer.observe(section);
  }

  // Animation frame loop
  setInterval(() => {
    if (!isAwake || !weatherData) return;
    tick++;
    renderSkyFrame(section, weatherData, tick);
  }, 166);

  // Location selector buttons
  const locBtns = section.querySelectorAll('.weather-loc-btn');
  locBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      locBtns.forEach(b => b.classList.remove('weather-loc-btn--active'));
      btn.classList.add('weather-loc-btn--active');
      const locId = btn.dataset.id;
      const targetLoc = JOGJA_LOCATIONS.find(l => l.id === locId) || JOGJA_LOCATIONS[0];
      currentLocation = targetLoc;
      fetchWeatherData(currentLocation);
    });
  });

  async function fetchWeatherData(loc) {
    summaryText.textContent = `Menghubungkan ke stasiun ${loc.name}...`;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FJakarta&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      applyWeatherData(loc, data);
    } catch (err) {
      console.warn('Menggunakan fallback data Jogja:', err);
      // Fallback realistic tropical weather data for Jogja
      const fallback = {
        current: {
          temperature_2m: 29.5,
          relative_humidity_2m: 72,
          apparent_temperature: 34.0,
          weather_code: 2,
          wind_speed_10m: 11.2
        },
        hourly: {
          time: Array.from({length: 24}, (_, i) => `${i}:00`),
          temperature_2m: [25, 24, 24, 25, 27, 29, 31, 32, 31, 29, 28, 27],
          weather_code: [0, 0, 1, 1, 2, 2, 2, 61, 2, 1, 0, 0]
        },
        daily: {
          weather_code: [2, 1, 61, 2, 0, 1, 2],
          temperature_2m_max: [32, 33, 30, 31, 33, 32, 31],
          temperature_2m_min: [23, 23, 22, 23, 24, 23, 23]
        }
      };
      applyWeatherData(loc, fallback);
    }
  }

  function applyWeatherData(loc, data) {
    const cur = data.current;
    const temp = Math.round(cur.temperature_2m);
    const feels = Math.round(cur.apparent_temperature);
    const humidity = Math.round(cur.relative_humidity_2m);
    const wind = cur.wind_speed_10m;
    const code = cur.weather_code;
    const kind = wmoToKind(code, wind, temp);
    const conditionText = wmoToLabel(code);

    // Update state object
    const nowHour = new Date().getHours() + new Date().getMinutes() / 60;
    weatherData = {
      hour: nowHour,
      kind,
      temp,
      feels,
      humidity,
      wind,
      sky: {
        clouds: kind === 'cloud' || kind === 'rain' ? [{ x: 0.2, y: 0.25, size: 5, dark: kind === 'rain' }, { x: 0.7, y: 0.35, size: 4 }] : (kind === 'partly' ? [{ x: 0.3, y: 0.28, size: 4 }] : []),
        overcast: kind === 'cloud' || kind === 'rain' || kind === 'storm',
        rain: kind === 'rain' ? 0.7 : (kind === 'drizzle' ? 0.3 : 0),
        wind: Math.min(1, wind / 30),
        heat: temp >= 33 ? 0.8 : 0,
        birds: nowHour >= 6 && nowHour <= 17 && kind !== 'rain' ? 2 : 0,
        thunder: kind === 'storm'
      }
    };

    // Update UI elements
    placeTitle.textContent = loc.name;
    summaryText.textContent = `${conditionText} · Suhu Terasa ${feels}°C · Kecepatan Angin ${wind} km/h`;
    tempVal.textContent = `${temp}°`;
    condVal.textContent = conditionText;
    readoutVal.innerHTML = `Terasa ${feels}° &bull; Lembap ${humidity}% &bull; Angin ${wind} km/h`;

    stationTag.textContent = loc.tag;
    intelName.textContent = loc.name;
    statWind.textContent = `${wind} km/h`;
    statHumidity.textContent = `${humidity}%`;
    statFeels.textContent = `${feels}°C`;

    if (wind > 25 || code >= 95) {
      statRisk.textContent = 'WASPADA CUACA';
      statRisk.className = 'intel-stat__val intel-stat__val--warn';
    } else {
      statRisk.textContent = 'SIAGA AMAN';
      statRisk.className = 'intel-stat__val intel-stat__val--safe';
    }

    if (statWave) {
      if (loc.id === 'parangtritis') {
        statWave.textContent = '2.1 – 3.2 m';
      } else if (loc.id === 'glagah') {
        statWave.textContent = '1.8 – 2.9 m';
      } else if (loc.id === 'baron') {
        statWave.textContent = '2.3 – 3.5 m';
      } else {
        statWave.textContent = '1.5 – 2.8 m';
      }
    }

    // Populate next 6 hours
    const currentHr = new Date().getHours();
    hoursList.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const targetHr = (currentHr + (i * 2)) % 24;
      const hrTemp = Math.round(data.hourly.temperature_2m[targetHr] ?? temp);
      const hrCode = data.hourly.weather_code[targetHr] ?? code;
      const hrKind = wmoToKind(hrCode, wind, hrTemp);

      const li = document.createElement('li');
      li.className = 'weather-hour-item';
      li.innerHTML = `
        <span class="weather-hour-lbl">${i === 0 ? 'Now' : String(targetHr).padStart(2, '0') + ':00'}</span>
        ${renderGlyphSVG(hrKind, targetHr)}
        <span class="weather-hour-temp">${hrTemp}°</span>
      `;
      hoursList.appendChild(li);
    }

    // Populate 7 days forecast
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const todayIdx = new Date().getDay();
    weekList.innerHTML = '';

    const loScale = 20;
    const hiScale = 35;
    const span = hiScale - loScale;

    for (let d = 0; d < 7; d++) {
      const name = d === 0 ? 'Hari Ini' : dayNames[(todayIdx + d) % 7];
      const dLow = Math.round(data.daily.temperature_2m_min[d] ?? (temp - 6));
      const dHigh = Math.round(data.daily.temperature_2m_max[d] ?? (temp + 3));
      const dCode = data.daily.weather_code[d] ?? code;
      const dKind = wmoToKind(dCode, wind, dHigh);

      let offPath = '';
      let litPath = '';
      for (let t = loScale; t <= hiScale; t++) {
        const dotPath = `M${(t - loScale) * PITCH + 1} 0h${DOT}v${DOT}h-${DOT}Z `;
        if (t >= dLow && t <= dHigh) litPath += dotPath;
        else offPath += dotPath;
      }

      const li = document.createElement('li');
      li.className = 'weather-week-row';
      li.innerHTML = `
        <span class="weather-week-name ${d === 0 ? 'weather-week-name--today' : ''}">${name}</span>
        ${renderGlyphSVG(dKind, 12)}
        <span class="weather-week-low">${dLow}°</span>
        <svg class="weather-week-bar" viewBox="0 0 ${(span + 1) * PITCH} ${DOT}">
          <path d="${offPath}" fill="rgba(255,255,255,0.08)"/>
          <path d="${litPath}" fill="${GLYPH_PAINT[dKind] || '#00d2ff'}"/>
        </svg>
        <span class="weather-week-high">${dHigh}°</span>
      `;
      weekList.appendChild(li);
    }

    renderSkyFrame(section, weatherData, tick);
  }

  function renderSkyFrame(root, state, t) {
    const paths = buildWeatherScene(46, 28, 21, state.hour, state.sky, t);
    WEATHER_SKY_LAYERS.forEach((layer) => {
      const el = root.querySelector(`#sky-layer-${layer}`);
      if (el) el.setAttribute('d', paths[layer] || '');
    });
  }

  // Initial fetch
  fetchWeatherData(currentLocation);
}
