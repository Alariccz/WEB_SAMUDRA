import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SeismicID Official Color Palette
function getRiskColor(prob) {
  if (prob == null) return '#334155';
  if (prob < 0.005) return '#10b981';
  if (prob < 0.01) return '#84cc16';
  if (prob < 0.03) return '#f59e0b';
  if (prob < 0.06) return '#f97316';
  if (prob < 0.10) return '#ef4444';
  return '#991b1b';
}

function getRiskLabel(prob) {
  if (prob == null) return 'Data minim';
  if (prob < 0.005) return '< 0.5% (Sangat Rendah)';
  if (prob < 0.01) return '0.5–1% (Rendah)';
  if (prob < 0.03) return '1–3% (Moderat)';
  if (prob < 0.06) return '3–6% (Waspada)';
  if (prob < 0.10) return '6–10% (Tinggi)';
  return '> 10% (Sangat Tinggi)';
}

// Curated high-resolution Indonesian seismic cells (from SeismicID dataset)
const FALLBACK_CELLS = [
  { id: "Cp12_p1262", lat: 1.25, lon: 126.25, name: "Sulawesi Utara - Bitung", prov: "Sulut", prob: 0.322, fault: "Subduksi Laut Maluku", depth: "15.8 km", maxM: 7.5 },
  { id: "Cm82_p1208", lat: -8.25, lon: 120.75, name: "Nusa Tenggara Timur - Ende", prov: "NTT", prob: 0.261, fault: "Flores Back-Arc Thrust", depth: "17.3 km", maxM: 7.7 },
  { id: "Cp52_p1252", lat: 5.25, lon: 125.25, name: "Sulawesi Utara - Manado", prov: "Sulut", prob: 0.220, fault: "Sangihe Subduction", depth: "115 km", maxM: 7.8 },
  { id: "Cp22_p1268", lat: 2.25, lon: 126.75, name: "Halmahera - Laut Maluku", prov: "Malut", prob: 0.200, fault: "Halmahera Plate", depth: "3.7 km", maxM: 7.5 },
  { id: "Cm82_p1202", lat: -8.25, lon: 120.25, name: "NTT - Bajawa / Flores", prov: "NTT", prob: 0.192, fault: "Sunda-Banda Arc", depth: "17.3 km", maxM: 7.7 },
  { id: "Cp18_p1272", lat: 1.75, lon: 127.25, name: "Maluku Utara - Ternate", prov: "Malut", prob: 0.183, fault: "Halmahera Thrust", depth: "18.3 km", maxM: 7.5 },
  { id: "Cm68_p1298", lat: -6.75, lon: 129.75, name: "Maluku - Tual / Palung Banda", prov: "Maluku", prob: 0.181, fault: "Banda Detachment", depth: "61.8 km", maxM: 7.6 },
  { id: "Cm78_p1278", lat: -7.75, lon: 127.75, name: "Maluku - Ambon / Wetar", prov: "Maluku", prob: 0.167, fault: "Wetar Thrust", depth: "6.6 km", maxM: 7.6 },
  { id: "Cm22_p1392", lat: -2.25, lon: 139.25, name: "Papua - Jayapura / Mamberamo", prov: "Papua", prob: 0.154, fault: "New Guinea Trench", depth: "34.6 km", maxM: 7.0 },
  { id: "Cm48_p1028", lat: -4.75, lon: 102.75, name: "Bengkulu - Enggano Pesisir", prov: "Bengkulu", prob: 0.145, fault: "Sunda Megathrust", depth: "34.4 km", maxM: 8.4 },
  { id: "Cp22_p962",  lat: 2.25, lon: 96.25,  name: "Aceh - Meulaboh / Simeulue", prov: "Aceh", prob: 0.119, fault: "Sumatra Subduction", depth: "24.9 km", maxM: 9.1 },
  { id: "Cp12_p972",  lat: 1.25, lon: 97.25,  name: "Sumut - Nias / Sibolga", prov: "Sumut", prob: 0.117, fault: "Mentawai Fault System", depth: "31.5 km", maxM: 8.7 },
  { id: "Cm82_p1108", lat: -8.25, lon: 110.35, name: "D.I. Yogyakarta - Pesisir Selatan / Opak", prov: "DIY", prob: 0.088, fault: "Sunda Megathrust Selatan Jawa", depth: "28.5 km", maxM: 8.1 },
  { id: "Cm72_p1068", lat: -7.25, lon: 106.85, name: "Jawa Barat - Pelabuhan Ratu", prov: "Jabar", prob: 0.092, fault: "Cimandiri & Megathrust", depth: "32.0 km", maxM: 7.8 },
  { id: "Cm82_p1155", lat: -8.45, lon: 115.55, name: "Bali & Selat Lombok", prov: "Bali", prob: 0.112, fault: "Flores Back-Arc", depth: "22.4 km", maxM: 7.1 },
  { id: "Cm08_p1198", lat: -0.85, lon: 119.85, name: "Sulawesi Tengah - Sesar Palu-Koro", prov: "Sulteng", prob: 0.134, fault: "Palu-Koro Strike-Slip", depth: "12.0 km", maxM: 7.5 }
];

// Presets for Indonesian Tsunami Scenarios
const TSUNAMI_PRESETS = [
  {
    id: "megathrust-jawa",
    name: "Megathrust Selatan Jawa",
    lat: -9.2,
    lon: 109.5,
    mag: 8.7,
    depth: 20,
    dist: 130,
    coasts: [
      { name: "Pangandaran (Jabar)", lat: -7.70, lon: 108.65, etaMin: 22, height: 7.1 },
      { name: "Parangtritis / Bantul (DIY)", lat: -8.02, lon: 110.33, etaMin: 28, height: 6.4 },
      { name: "Pacitan (Jatim)", lat: -8.22, lon: 111.09, etaMin: 32, height: 5.9 },
      { name: "Pelabuhan Ratu (Jabar)", lat: -6.98, lon: 106.54, etaMin: 35, height: 5.2 }
    ]
  },
  {
    id: "subduksi-aceh",
    name: "Subduksi Sumatra - Aceh Simeulue",
    lat: 2.8,
    lon: 95.5,
    mag: 9.1,
    depth: 25,
    dist: 85,
    coasts: [
      { name: "Sinabang (Simeulue)", lat: 2.48, lon: 96.38, etaMin: 12, height: 14.5 },
      { name: "Meulaboh (Aceh Barat)", lat: 4.14, lon: 96.13, etaMin: 24, height: 9.8 },
      { name: "Banda Aceh (Aceh)", lat: 5.55, lon: 95.32, etaMin: 38, height: 8.5 },
      { name: "Gunungsitoli (Nias)", lat: 1.28, lon: 97.61, etaMin: 28, height: 6.5 }
    ]
  },
  {
    id: "palu-koro",
    name: "Sesar Palu-Koro (Teluk Palu)",
    lat: -0.75,
    lon: 119.8,
    mag: 7.5,
    depth: 10,
    dist: 25,
    coasts: [
      { name: "Pantai Talise (Kota Palu)", lat: -0.88, lon: 119.88, etaMin: 4, height: 5.8 },
      { name: "Donggala Pesisir", lat: -0.67, lon: 119.74, etaMin: 8, height: 4.9 },
      { name: "Mamuju (Sulbar)", lat: -2.67, lon: 118.88, etaMin: 36, height: 1.8 }
    ]
  },
  {
    id: "flores-thrust",
    name: "Flores Back-Arc Thrust (NTT)",
    lat: -8.1,
    lon: 121.2,
    mag: 7.8,
    depth: 18,
    dist: 60,
    coasts: [
      { name: "Ende Pesisir (Flores)", lat: -8.84, lon: 121.65, etaMin: 14, height: 4.8 },
      { name: "Maumere (Sikka)", lat: -8.62, lon: 122.21, etaMin: 18, height: 4.2 },
      { name: "Labuan Bajo (Manggarai)", lat: -8.49, lon: 119.88, etaMin: 34, height: 2.5 }
    ]
  },
  {
    id: "laut-maluku",
    name: "Subduksi Laut Maluku (Bitung / Ternate)",
    lat: 1.4,
    lon: 126.1,
    mag: 7.7,
    depth: 16,
    dist: 50,
    coasts: [
      { name: "Pelabuhan Bitung (Sulut)", lat: 1.44, lon: 125.19, etaMin: 16, height: 4.5 },
      { name: "Ternate Pesisir (Malut)", lat: 0.79, lon: 127.38, etaMin: 22, height: 3.9 },
      { name: "Halmahera Barat", lat: 1.15, lon: 127.45, etaMin: 20, height: 4.1 }
    ]
  }
];

export function renderSimulation(container) {
  const section = document.createElement('section');
  section.id = 'simulasi';
  section.className = 'seismic-section';
  section.innerHTML = `
    <div class="seismic-container">
      <div class="section-header section-header--compact">  
        <span class="section-eyebrow">Simulasi Propagasi Gelombang &amp; Sesar Aktif</span>
        <h2 class="section-title">Peta Probabilitas &amp; Simulasi Gelombang</h2>
        <p class="section-lead">Pemodelan probabilistik gempa bumi per 50&times;50 km serta simulasi interaktif perambatan gelombang tsunami di pesisir Indonesia.</p>
      </div>

      <!-- Mode Selector Tabs (Aligned flush with the card) -->
      <div class="seismic-tabs" role="tablist" aria-label="Pilih Mode Tampilan">
        <button type="button" class="seismic-tab-btn seismic-tab-btn--active" id="tab-sim-map" data-mode="sim-map" role="tab" aria-selected="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12c3-4 6-4 10 0s7 4 10 0"/><path d="M2 17c3-4 6-4 10 0s7 4 10 0"/><path d="M2 7c3-4 6-4 10 0s7 4 10 0"/>
          </svg>
          <span>Simulasi Gelombang (Peta)</span>
        </button>
        <button type="button" class="seismic-tab-btn" id="tab-seismic-grid" data-mode="seismic-grid" role="tab" aria-selected="false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span>Peta Probabilitas Sesar</span>
        </button>
        <button type="button" class="seismic-tab-btn" id="tab-cross-section" data-mode="cross-section" role="tab" aria-selected="false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"/><path d="M3 10c4 0 4-4 8-4s4 8 8 8h2"/><path d="M3 16c4 0 5-2 8-2s4 4 8 4h2"/>
          </svg>
          <span>Profil Batimetri Fisika</span>
        </button>
      </div>

      <!-- Main Glassmorphic Container (Max-width 1140px, perfectly aligned with text) -->
      <div class="seismic-card">
        <!-- TOOLBAR: SIMULATION MODE -->
        <div class="seismic-card__toolbar" id="toolbar-sim-map">
          <div class="seismic-card__meta">
            <span class="seismic-live-badge seismic-live-badge--cyan">
              <span class="seismic-led seismic-led--cyan"></span>
              SIMULATOR PROPAGASI GELOMBANG
            </span>
            <div class="seismic-select-group">
              <label for="sim-scenario-select" class="seismic-label">Skenario:</label>
              <select id="sim-scenario-select" class="seismic-select">
                <option value="megathrust-jawa" selected>Megathrust Selatan Jawa (M 8.7)</option>
                <option value="subduksi-aceh">Subduksi Aceh - Simeulue (M 9.1)</option>
                <option value="palu-koro">Sesar Palu-Koro (M 7.5)</option>
                <option value="flores-thrust">Flores Back-Arc NTT (M 7.8)</option>
                <option value="laut-maluku">Subduksi Laut Maluku (M 7.7)</option>
              </select>
            </div>
          </div>

          <div class="seismic-card__actions">
            <button type="button" id="sim-btn-play" class="seismic-action-btn seismic-action-btn--primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Mulai Simulasi</span>
            </button>
            <button type="button" id="sim-btn-reset" class="seismic-action-btn seismic-action-btn--secondary" title="Reset Simulasi">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>

        <!-- TOOLBAR: SEISMICID GRID MODE -->
        <div class="seismic-card__toolbar" id="toolbar-seismic-grid" style="display: none;">
          <div class="seismic-card__meta">
            <span class="seismic-live-badge">
              <span class="seismic-led"></span>
              GRID PROBABILITAS SESAR
            </span>
            <span class="seismic-tag">Resolusi 50&times;50 km</span>
            <span class="seismic-sources">Data: USGS &bull; BMKG &bull; EMSC</span>
          </div>

          <div class="seismic-card__actions">
            <div class="seismic-select-group">
              <label for="seismic-horizon" class="seismic-label">Horizon:</label>
              <select id="seismic-horizon" class="seismic-select" aria-label="Pilih horizon hari">
                <option value="7">7 Hari</option>
                <option value="14">14 Hari</option>
                <option value="30" selected>30 Hari</option>
                <option value="60">60 Hari</option>
              </select>
            </div>

            <div class="seismic-select-group">
              <label for="seismic-threshold" class="seismic-label">Magnitudo:</label>
              <select id="seismic-threshold" class="seismic-select" aria-label="Pilih ambang magnitudo">
                <option value="4.5">M &ge; 4.5</option>
                <option value="5.0" selected>M &ge; 5.0</option>
                <option value="5.5">M &ge; 5.5</option>
                <option value="6.0">M &ge; 6.0</option>
              </select>
            </div>

          </div>
        </div>

        <!-- TOOLBAR: CROSS SECTION MODE -->
        <div class="seismic-card__toolbar" id="toolbar-cross-section" style="display: none;">
          <div class="seismic-card__meta">
            <span class="seismic-live-badge seismic-live-badge--cyan">
              <span class="seismic-led seismic-led--cyan"></span>
              FISIKA HIDRODINAMIKA TSUNAMI
            </span>
            <span class="seismic-tag">Profil 2D Shoaling &amp; Run-up</span>
          </div>

          <div class="seismic-card__actions">
            <button type="button" id="cs-run-btn" class="seismic-action-btn seismic-action-btn--primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Jalankan Siklus Gelombang</span>
            </button>
          </div>
        </div>

        <!-- Quick Location Jump Tabs for SeismicID Mode -->
        <div class="seismic-quick-bar" id="seismic-quick-bar" style="display: none;">
          <span class="seismic-quick-title">TOP RISIKO:</span>
          <div class="seismic-quick-tags" id="seismic-quick-tags"></div>
        </div>

        <!-- Main Display Frame (Map or Cross-Section Canvas) -->
        <div class="seismic-frame-wrap" id="seismic-frame-wrap">
          <!-- MAP CONTAINER (ESRI Dark Gray) -->
          <div id="seismic-native-map" class="seismic-native-map"></div>

          <!-- CROSS-SECTION CANVAS (Initially hidden) -->
          <canvas id="seismic-cross-canvas" class="seismic-cross-canvas" style="display: none;"></canvas>

          <!-- SIMULATION HUD TELEMETRY OVERLAY (In Map Mode) -->
          <div class="sim-hud-overlay" id="sim-hud-overlay">
            <div class="sim-hud-badge" id="sim-hud-status">
              <span class="sim-hud-dot"></span>
              <span id="sim-hud-status-text">STATUS: SIAP</span>
            </div>
            <div class="sim-hud-item">
              <span class="sim-hud-lbl">WAKTU SIMULASI</span>
              <span class="sim-hud-val" id="sim-hud-timer">T+ 00:00</span>
            </div>
            <div class="sim-hud-item">
              <span class="sim-hud-lbl">ESTIMASI GELOMBANG</span>
              <span class="sim-hud-val" id="sim-hud-height" style="color: #00d2ff;">▲ 6.4 m</span>
            </div>
            <div class="sim-hud-item">
              <span class="sim-hud-lbl">ETA TERCEPAT</span>
              <span class="sim-hud-val" id="sim-hud-eta" style="color: #f59e0b;">⏱ 22 Menit</span>
            </div>
          </div>

          <!-- MAP LEGEND OVERLAY (In SeismicID Mode) -->
          <div class="seismic-legend-overlay" id="seismic-legend-overlay" style="display: none;">
            <div class="seismic-legend-row"><span class="seismic-swatch" style="background:#10b981;"></span> &lt;0.5%</div>
            <div class="seismic-legend-row"><span class="seismic-swatch" style="background:#84cc16;"></span> 0.5–1%</div>
            <div class="seismic-legend-row"><span class="seismic-swatch" style="background:#f59e0b;"></span> 1–3%</div>
            <div class="seismic-legend-row"><span class="seismic-swatch" style="background:#f97316;"></span> 3–6%</div>
            <div class="seismic-legend-row"><span class="seismic-swatch" style="background:#ef4444;"></span> 6–10%</div>
            <div class="seismic-legend-row"><span class="seismic-swatch" style="background:#991b1b;"></span> &gt;10%</div>
          </div>

          <!-- Reset Camera Button -->
          <button id="seismic-reset-btn" class="seismic-reload-btn" type="button" title="Pusatkan peta ke Indonesia" aria-label="Pusatkan peta">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>

        <!-- INTERACTIVE SLIDER CONTROLS BAR -->
        <div class="seismic-controls-bar" id="seismic-controls-bar">
          <div class="sim-control-item">
            <div class="sim-control-head">
              <label for="sim-input-mag" class="sim-control-label">Magnitudo Gempa</label>
              <span class="sim-control-val" id="sim-val-mag">M 8.7</span>
            </div>
            <input type="range" id="sim-input-mag" min="6.5" max="9.2" step="0.1" value="8.7" class="sim-slider" />
          </div>

          <div class="sim-control-item">
            <div class="sim-control-head">
              <label for="sim-input-depth" class="sim-control-label">Kedalaman Episentrum</label>
              <span class="sim-control-val" id="sim-val-depth">20 km</span>
            </div>
            <input type="range" id="sim-input-depth" min="10" max="100" step="5" value="20" class="sim-slider" />
          </div>

          <div class="sim-control-item">
            <div class="sim-control-head">
              <label for="sim-input-dist" class="sim-control-label">Jarak ke Pesisir</label>
              <span class="sim-control-val" id="sim-val-dist">120 km</span>
            </div>
            <input type="range" id="sim-input-dist" min="20" max="300" step="10" value="120" class="sim-slider" />
          </div>
        </div>

        <!-- FOOTER BAR -->
        <div class="seismic-card__footer">
          <div class="seismic-pills" id="footer-pills">
            <div class="seismic-pill">
              <span class="seismic-pill__lbl">METODE PEMODELAN</span>
              <span class="seismic-pill__val">Persamaan Shallow Water (Green's Law)</span>
            </div>
            <div class="seismic-pill">
              <span class="seismic-pill__lbl">DATA FEED</span>
              <span class="seismic-pill__val">USGS &bull; BMKG &bull; EMSC</span>
            </div>
            <div class="seismic-pill">
              <span class="seismic-pill__lbl">KLASIFIKASI PERINGATAN</span>
              <span class="seismic-pill__val" id="sim-warning-tier">AWAS (&gt; 3.0 Meter)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(section);

  // Initialize Map and Simulator
  requestAnimationFrame(() => {
    initUnifiedSeismicSimulator(section);
  });
}

function initUnifiedSeismicSimulator(root) {
  const mapEl = root.querySelector('#seismic-native-map');
  const canvasEl = root.querySelector('#seismic-cross-canvas');
  if (!mapEl || !canvasEl) return;

  // Initialize Leaflet Map with center in Indonesia
  const map = L.map(mapEl, {
    center: [-2.5, 118.0],
    zoom: 5,
    minZoom: 4,
    maxZoom: 9,
    zoomControl: false,
    scrollWheelZoom: false,
    attributionControl: false
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Free ESRI World Dark Gray Base & Reference (No API key needed, zero watermark)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    subdomains: ['server', 'services'],
    attribution: 'Esri, HERE, DeLorme'
  }).addTo(map);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    opacity: 0.75
  }).addTo(map);

  // Layer groups
  const gridLayerGroup = L.layerGroup();
  const beaconLayerGroup = L.layerGroup();
  const simWavesLayerGroup = L.layerGroup().addTo(map);
  const simCoastsLayerGroup = L.layerGroup().addTo(map);
  const simEpicenterLayerGroup = L.layerGroup().addTo(map);

  // Tab elements
  const tabs = root.querySelectorAll('.seismic-tab-btn');
  const toolbarSim = root.querySelector('#toolbar-sim-map');
  const toolbarGrid = root.querySelector('#toolbar-seismic-grid');
  const toolbarCross = root.querySelector('#toolbar-cross-section');
  const quickBar = root.querySelector('#seismic-quick-bar');
  const quickTagsEl = root.querySelector('#seismic-quick-tags');
  const legendOverlay = root.querySelector('#seismic-legend-overlay');
  const simHudOverlay = root.querySelector('#sim-hud-overlay');
  const controlsBar = root.querySelector('#seismic-controls-bar');
  const resetBtn = root.querySelector('#seismic-reset-btn');

  // Sim HUD elements
  const hudStatus = root.querySelector('#sim-hud-status');
  const hudStatusText = root.querySelector('#sim-hud-status-text');
  const hudTimer = root.querySelector('#sim-hud-timer');
  const hudHeight = root.querySelector('#sim-hud-height');
  const hudEta = root.querySelector('#sim-hud-eta');
  const simWarningTier = root.querySelector('#sim-warning-tier');

  // Inputs
  const scenarioSelect = root.querySelector('#sim-scenario-select');
  const btnPlay = root.querySelector('#sim-btn-play');
  const btnReset = root.querySelector('#sim-btn-reset');
  const csRunBtn = root.querySelector('#cs-run-btn');
  const inputMag = root.querySelector('#sim-input-mag');
  const inputDepth = root.querySelector('#sim-input-depth');
  const inputDist = root.querySelector('#sim-input-dist');
  const valMag = root.querySelector('#sim-val-mag');
  const valDepth = root.querySelector('#sim-val-depth');
  const valDist = root.querySelector('#sim-val-dist');

  // SeismicID controls
  const horizonSel = root.querySelector('#seismic-horizon');
  const thresholdSel = root.querySelector('#seismic-threshold');

  let currentMode = 'sim-map';
  let isSimPlaying = false;
  let simAnimId = null;
  let simProgress = 0; // 0 to 1
  let activePreset = TSUNAMI_PRESETS[0];

  // ==========================================
  // 1. SIMULATION MAP LOGIC
  // ==========================================
  function calculateTsunamiMetrics() {
    const M = +inputMag.value;
    const D = +inputDist.value;
    const H = +inputDepth.value;

    valMag.textContent = `M ${M.toFixed(1)}`;
    valDepth.textContent = `${H} km`;
    valDist.textContent = `${D} km`;

    // Shallow-water hydrodynamic calculations
    const magFactor = Math.pow(10, 0.78 * (M - 7.0));
    const distFactor = Math.pow(80 / (60 + D), 0.6);
    const depthFactor = Math.pow(H / 30, 0.35);

    let waveHeight = Math.max(0.3, 0.45 * magFactor * distFactor * depthFactor);
    waveHeight = Math.round(waveHeight * 10) / 10;

    // Time to coast: shallow water speed v = sqrt(g * d) ~ 600-800 km/h in deep sea
    const etaMin = Math.max(4, Math.round(D / 8.5));

    hudHeight.textContent = `▲ ${waveHeight.toFixed(1)} m`;
    hudEta.textContent = `⏱ ${etaMin} Menit`;

    // BMKG warning tier
    if (waveHeight >= 3.0) {
      hudStatus.className = 'sim-hud-badge sim-hud-badge--red';
      hudStatusText.textContent = 'STATUS: AWAS';
      hudHeight.style.color = '#ef4444';
      if (simWarningTier) simWarningTier.textContent = 'AWAS (> 3.0 Meter)';
    } else if (waveHeight >= 0.5) {
      hudStatus.className = 'sim-hud-badge sim-hud-badge--orange';
      hudStatusText.textContent = 'STATUS: SIAGA';
      hudHeight.style.color = '#f97316';
      if (simWarningTier) simWarningTier.textContent = 'SIAGA (0.5–3.0 Meter)';
    } else {
      hudStatus.className = 'sim-hud-badge sim-hud-badge--green';
      hudStatusText.textContent = 'STATUS: WASPADA';
      hudHeight.style.color = '#34d399';
      if (simWarningTier) simWarningTier.textContent = 'WASPADA (< 0.5 Meter)';
    }

    return { M, D, H, waveHeight, etaMin };
  }

  function setupScenario(preset) {
    activePreset = preset;
    if (scenarioSelect && scenarioSelect.value !== preset.id) {
      scenarioSelect.value = preset.id;
    }
    inputMag.value = preset.mag;
    inputDepth.value = preset.depth;
    if (preset.dist) inputDist.value = preset.dist;

    calculateTsunamiMetrics();
    renderScenarioMarkers(preset);
    map.flyTo([preset.lat, preset.lon], 6.5, { duration: 1.2 });
  }

  function renderScenarioMarkers(preset) {
    simEpicenterLayerGroup.clearLayers();
    simCoastsLayerGroup.clearLayers();
    simWavesLayerGroup.clearLayers();

    // Epicenter pulsing marker
    const epicIcon = L.divIcon({
      className: 'sim-epicenter-marker',
      html: `
        <div class="sim-epicenter-pulse"></div>
        <div class="sim-epicenter-core"></div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const epicMarker = L.marker([preset.lat, preset.lon], { icon: epicIcon });
    epicMarker.bindPopup(`
      <div class="seismic-popup">
        <div class="seismic-popup__badge" style="background:rgba(239, 68, 68, 0.2); border-color:#ef4444; color:#ef4444">
          EPISENTRUM GEMPA
        </div>
        <h4 class="seismic-popup__title">${preset.name}</h4>
        <div class="seismic-popup__meta">
          <span><strong>Magnitudo:</strong> M ${preset.mag}</span>
          <span><strong>Kedalaman:</strong> ${preset.depth} km</span>
          <span><strong>Status:</strong> Siap disimulasikan</span>
        </div>
      </div>
    `);
    epicMarker.addTo(simEpicenterLayerGroup);

    // Coastline impact target markers
    preset.coasts.forEach(coast => {
      const coastIcon = L.divIcon({
        className: 'sim-coast-marker',
        html: `
          <div class="sim-coast-pill">
            <span class="sim-coast-dot"></span>
            <span>${coast.name.split('(')[0]}</span>
            <small>${coast.etaMin}m</small>
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      const coastMarker = L.marker([coast.lat, coast.lon], { icon: coastIcon });
      coastMarker.bindPopup(`
        <div class="seismic-popup">
          <div class="seismic-popup__badge" style="background:rgba(0, 210, 255, 0.2); border-color:#00d2ff; color:#00d2ff">
            TARGET PESISIR
          </div>
          <h4 class="seismic-popup__title">${coast.name}</h4>
          <div class="seismic-popup__meta">
            <span><strong>Waktu Tiba (ETA):</strong> ${coast.etaMin} Menit</span>
            <span><strong>Tinggi Gelombang:</strong> ▲ ${coast.height} m</span>
          </div>
        </div>
      `);
      coastMarker.addTo(simCoastsLayerGroup);
    });
  }

  function stepSimWaves() {
    if (!isSimPlaying) return;

    simWavesLayerGroup.clearLayers();

    // 0 to 1 represents 45 minutes
    const totalSimMinutes = 45;
    const currentMin = Math.round(simProgress * totalSimMinutes);
    const minStr = String(currentMin).padStart(2, '0');
    const secStr = String(Math.floor((simProgress * totalSimMinutes * 60) % 60)).padStart(2, '0');
    hudTimer.textContent = `T+ ${minStr}:${secStr}`;

    const maxRadiusMeters = 380000; // ~380 km wave reach
    const waveCount = 4;

    for (let i = 0; i < waveCount; i++) {
      const wavePhase = (simProgress * 1.5 - i * 0.18);
      if (wavePhase > 0 && wavePhase <= 1.2) {
        const radius = Math.min(maxRadiusMeters, wavePhase * maxRadiusMeters);
        const opacity = Math.max(0, 0.75 - wavePhase * 0.6);

        L.circle([activePreset.lat, activePreset.lon], {
          radius: radius,
          color: '#00d2ff',
          weight: 2.2,
          opacity: opacity,
          fillColor: '#00d2ff',
          fillOpacity: opacity * 0.12,
          interactive: false
        }).addTo(simWavesLayerGroup);
      }
    }

    // Advance progress
    simProgress += 0.0035;

    if (simProgress < 1.0) {
      simAnimId = requestAnimationFrame(stepSimWaves);
    } else {
      // Finished 1 full cycle
      isSimPlaying = false;
      btnPlay.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Mulai Ulang</span>
      `;
    }
  }

  function startSimulation() {
    if (isSimPlaying) {
      // Pause
      isSimPlaying = false;
      cancelAnimationFrame(simAnimId);
      btnPlay.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Lanjutkan</span>
      `;
    } else {
      // Play
      if (simProgress >= 1.0) simProgress = 0;
      isSimPlaying = true;
      btnPlay.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span>Jeda</span>
      `;
      simAnimId = requestAnimationFrame(stepSimWaves);
    }
  }

  function resetSimulation() {
    isSimPlaying = false;
    cancelAnimationFrame(simAnimId);
    simProgress = 0;
    simWavesLayerGroup.clearLayers();
    hudTimer.textContent = 'T+ 00:00';
    btnPlay.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>Mulai Simulasi</span>
    `;
    calculateTsunamiMetrics();
  }

  // ==========================================
  // 2. SEISMICID PROBABILITY GRID LOGIC
  // ==========================================
  function renderSeismicGridCells(cells) {
    gridLayerGroup.clearLayers();
    beaconLayerGroup.clearLayers();

    const h = horizonSel ? +horizonSel.value : 30;
    const m = thresholdSel ? +thresholdSel.value : 5.0;
    const hFactor = h === 7 ? 0.35 : h === 14 ? 0.60 : h === 60 ? 1.45 : 1.0;
    const mFactor = m === 4.5 ? 1.6 : m === 5.5 ? 0.55 : m === 6.0 ? 0.28 : 1.0;
    const mod = hFactor * mFactor;

    cells.forEach(item => {
      const adjustedProb = Math.min(0.85, item.prob * mod);
      const color = getRiskColor(adjustedProb);
      const size = 0.25;

      const bounds = [
        [item.lat - size, item.lon - size],
        [item.lat + size, item.lon + size]
      ];

      const rect = L.rectangle(bounds, {
        color: color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: adjustedProb > 0.1 ? 0.55 : 0.38
      });

      const pctStr = (adjustedProb * 100).toFixed(1) + '%';
      const riskDesc = getRiskLabel(adjustedProb);

      const popupContent = `
        <div class="seismic-popup">
          <div class="seismic-popup__badge" style="background:${color}22; border-color:${color}; color:${color}">
            ${pctStr} Probabilitas
          </div>
          <h4 class="seismic-popup__title">${item.name}</h4>
          <div class="seismic-popup__meta">
            <span><strong>Kategori:</strong> ${riskDesc}</span>
            <span><strong>Struktur Sesar:</strong> ${item.fault || 'Subduksi Pesisir'}</span>
            <span><strong>Kedalaman Slab:</strong> ${item.depth || '~20 km'}</span>
            <span><strong>Horizon:</strong> ${h} Hari (M &ge; ${m})</span>
          </div>
        </div>
      `;

      rect.bindPopup(popupContent);
      rect.addTo(gridLayerGroup);

      if (adjustedProb > 0.12) {
        const beaconIcon = L.divIcon({
          className: 'seismic-beacon-marker',
          html: `<div class="seismic-beacon-pulse" style="border-color:${color}; box-shadow:0 0 12px ${color}"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        L.marker([item.lat, item.lon], { icon: beaconIcon }).addTo(beaconLayerGroup);
      }
    });

    if (quickTagsEl) {
      const topItems = cells.slice(0, 7);
      quickTagsEl.innerHTML = topItems.map(item => {
        const p = Math.min(0.85, item.prob * mod);
        const c = getRiskColor(p);
        return `
          <button type="button" class="seismic-quick-btn" data-lat="${item.lat}" data-lon="${item.lon}">
            <span class="seismic-quick-dot" style="background:${c}"></span>
            <span>${item.prov || item.name.split('-')[0]}</span>
            <small>${(p * 100).toFixed(0)}%</small>
          </button>
        `;
      }).join('');

      quickTagsEl.querySelectorAll('.seismic-quick-btn').forEach(btn => {
        btn.onclick = () => {
          map.flyTo([+btn.dataset.lat, +btn.dataset.lon], 7.5, { duration: 1.2 });
        };
      });
    }
  }

  // ==========================================
  // 3. 2D CROSS-SECTION HYDRODYNAMIC SIMULATOR
  // ==========================================
  let csAnimId = null;
  let csProgress = 0.35;
  const ctx = canvasEl.getContext('2d');

  function resizeCanvas() {
    const rect = canvasEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = (rect.width || 800) * dpr;
    canvasEl.height = (rect.height || 380) * dpr;
    ctx.scale(dpr, dpr);
  }

  function drawCrossSection() {
    const w = canvasEl.getBoundingClientRect().width || 800;
    const hh = canvasEl.getBoundingClientRect().height || 380;
    ctx.clearRect(0, 0, w, hh);

    const { waveHeight } = calculateTsunamiMetrics();

    // Ocean background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, hh);
    bgGrad.addColorStop(0, '#020919');
    bgGrad.addColorStop(0.5, '#041530');
    bgGrad.addColorStop(1, '#062044');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, hh);

    // Bathymetry depth grid
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let y = 80; y < hh; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const sy = hh * 0.48; // Sea level
    const cx = w * 0.76;  // Shoreline
    const shelfX = w * 0.46; // Shelf slope

    function getSeabedY(x) {
      const deepBedY = hh * 0.86;
      if (x < shelfX) return deepBedY;
      if (x < cx - 50) {
        const t = (x - shelfX) / (cx - 50 - shelfX);
        const smoothT = t * t * (3 - 2 * t);
        return deepBedY - (deepBedY - (sy + 30)) * smoothT;
      }
      if (x <= cx) {
        const t = (x - (cx - 50)) / 50;
        return (sy + 30) - 30 * t;
      }
      const t = (x - cx) / (w - cx);
      return sy - 90 * t;
    }

    // Terrain & seabed
    ctx.beginPath();
    ctx.moveTo(0, hh);
    ctx.lineTo(0, getSeabedY(0));
    for (let x = 0; x <= w; x += 10) {
      ctx.lineTo(x, getSeabedY(x));
    }
    ctx.lineTo(w, hh);
    ctx.closePath();

    const bedGrad = ctx.createLinearGradient(0, sy, 0, hh);
    bedGrad.addColorStop(0, '#09213d');
    bedGrad.addColorStop(0.4, '#06162a');
    bedGrad.addColorStop(1, '#020a14');
    ctx.fillStyle = bedGrad;
    ctx.fill();

    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Wave propagation
    const waveX = csProgress * (cx + 40);
    const deepAmp = 8 + Math.min(25, waveHeight * 1.6);
    let waveAmp = deepAmp;

    if (waveX > shelfX) {
      const shoalRatio = Math.min(1, (waveX - shelfX) / (cx - shelfX));
      const maxCoastAmp = Math.min(150, 10 + waveHeight * 5.8);
      waveAmp = deepAmp + (maxCoastAmp - deepAmp) * (shoalRatio * shoalRatio);
    }
    const waveWidth = waveX < shelfX ? 75 : Math.max(30, 75 - (waveX - shelfX) * 0.2);

    // Water surface
    ctx.beginPath();
    ctx.moveTo(0, hh);
    ctx.lineTo(0, sy);
    const waterEnd = Math.min(w, cx + Math.max(0, (waveX - cx + 20) * 1.3));

    let peakY = sy;
    for (let x = 0; x <= waterEnd; x += 4) {
      const bedY = getSeabedY(x);
      let surfaceY = sy + Math.sin(x * 0.02 + csProgress * 12) * 2;

      const dist = (x - waveX) / waveWidth;
      const crest = waveAmp / Math.cosh(dist * 1.5);
      let trough = 0;
      if (waveX > shelfX * 0.7 && dist > 0.6 && dist < 2.5) {
        trough = (waveAmp * 0.35) * Math.sin((dist - 0.6) * 1.6);
      }
      surfaceY -= (crest - trough);
      if (surfaceY > bedY) surfaceY = bedY;
      if (surfaceY < peakY) peakY = surfaceY;

      ctx.lineTo(x, surfaceY);
    }
    ctx.lineTo(waterEnd, getSeabedY(waterEnd));
    ctx.lineTo(0, getSeabedY(0));
    ctx.closePath();

    const waterGrad = ctx.createLinearGradient(0, sy - waveAmp, 0, hh * 0.85);
    waterGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    waterGrad.addColorStop(0.35, 'rgba(0, 180, 240, 0.28)');
    waterGrad.addColorStop(1, 'rgba(4, 30, 68, 0.75)');
    ctx.fillStyle = waterGrad;
    ctx.fill();

    // Surface line
    ctx.beginPath();
    for (let x = 0; x <= waterEnd; x += 4) {
      const dist = (x - waveX) / waveWidth;
      const crest = waveAmp / Math.cosh(dist * 1.5);
      let trough = 0;
      if (waveX > shelfX * 0.7 && dist > 0.6 && dist < 2.5) {
        trough = (waveAmp * 0.35) * Math.sin((dist - 0.6) * 1.6);
      }
      let surfaceY = sy + Math.sin(x * 0.02 + csProgress * 12) * 2 - (crest - trough);
      const bedY = getSeabedY(x);
      if (surfaceY > bedY) surfaceY = bedY;
      if (x === 0) ctx.moveTo(x, surfaceY);
      else ctx.lineTo(x, surfaceY);
    }
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Epicenter fault
    const faultX = 40;
    const faultBedY = getSeabedY(faultX);
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(faultX, faultBedY);
    ctx.lineTo(faultX + 8, hh - 10);
    ctx.stroke();

    // Labels
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00d2ff';
    ctx.fillText(`SIMULASI HIDRODINAMIKA: T+ ${Math.round(csProgress * 30)} MENIT`, 20, 32);

    ctx.fillStyle = '#ff6b8b';
    ctx.fillText('• Episentrum Sesar', faultX - 10, faultBedY + 24);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Garis Pantai', cx - 36, sy - 90);

    if (waveAmp > 14) {
      ctx.fillStyle = waveHeight > 3.0 ? '#ef4444' : '#00d2ff';
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillText(`▲ ${waveHeight.toFixed(1)}m`, Math.max(10, waveX - 20), peakY - 10);
    }
  }

  function runCrossSection() {
    cancelAnimationFrame(csAnimId);
    csProgress = 0;
    const start = performance.now();
    function animate(now) {
      csProgress = Math.min(1, (now - start) / 12000);
      drawCrossSection();
      if (csProgress < 1) csAnimId = requestAnimationFrame(animate);
    }
    csAnimId = requestAnimationFrame(animate);
  }

  // ==========================================
  // 4. TAB & MODE SWITCHING
  // ==========================================
  function switchMode(mode) {
    currentMode = mode;

    tabs.forEach(tab => {
      const isActive = tab.dataset.mode === mode;
      tab.classList.toggle('seismic-tab-btn--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (mode === 'sim-map') {
      toolbarSim.style.display = 'flex';
      toolbarGrid.style.display = 'none';
      toolbarCross.style.display = 'none';
      quickBar.style.display = 'none';
      legendOverlay.style.display = 'none';
      simHudOverlay.style.display = 'flex';
      controlsBar.style.display = 'grid';
      mapEl.style.display = 'block';
      canvasEl.style.display = 'none';

      map.removeLayer(gridLayerGroup);
      map.removeLayer(beaconLayerGroup);
      map.addLayer(simWavesLayerGroup);
      map.addLayer(simCoastsLayerGroup);
      map.addLayer(simEpicenterLayerGroup);

      setupScenario(activePreset);
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
      setTimeout(() => {
        map.invalidateSize();
      }, 120);
    } else if (mode === 'seismic-grid') {
      toolbarSim.style.display = 'none';
      toolbarGrid.style.display = 'flex';
      toolbarCross.style.display = 'none';
      quickBar.style.display = 'flex';
      legendOverlay.style.display = 'flex';
      simHudOverlay.style.display = 'none';
      controlsBar.style.display = 'none';
      mapEl.style.display = 'block';
      canvasEl.style.display = 'none';

      map.removeLayer(simWavesLayerGroup);
      map.removeLayer(simCoastsLayerGroup);
      map.removeLayer(simEpicenterLayerGroup);
      map.addLayer(gridLayerGroup);
      map.addLayer(beaconLayerGroup);

      renderSeismicGridCells(FALLBACK_CELLS);
      map.flyTo([-2.5, 118.0], 5, { duration: 1.0 });
      map.invalidateSize();
    } else if (mode === 'cross-section') {
      toolbarSim.style.display = 'none';
      toolbarGrid.style.display = 'none';
      toolbarCross.style.display = 'flex';
      quickBar.style.display = 'none';
      legendOverlay.style.display = 'none';
      simHudOverlay.style.display = 'none';
      controlsBar.style.display = 'grid';
      mapEl.style.display = 'none';
      canvasEl.style.display = 'block';

      resizeCanvas();
      drawCrossSection();
    }
  }

  // Bind tab buttons
  tabs.forEach(tab => {
    tab.onclick = () => switchMode(tab.dataset.mode);
  });

  // Simulator controls
  btnPlay.onclick = startSimulation;
  btnReset.onclick = resetSimulation;
  if (csRunBtn) csRunBtn.onclick = runCrossSection;

  scenarioSelect.onchange = () => {
    const found = TSUNAMI_PRESETS.find(p => p.id === scenarioSelect.value);
    if (found) setupScenario(found);
  };

  [inputMag, inputDepth, inputDist].forEach(input => {
    input.oninput = () => {
      calculateTsunamiMetrics();
      if (currentMode === 'cross-section') {
        drawCrossSection();
      }
    };
  });

  // SeismicID controls
  if (horizonSel) horizonSel.onchange = () => renderSeismicGridCells(FALLBACK_CELLS);
  if (thresholdSel) thresholdSel.onchange = () => renderSeismicGridCells(FALLBACK_CELLS);

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (currentMode === 'sim-map') {
        map.flyTo([activePreset.lat, activePreset.lon], 6.5, { duration: 1.0 });
      } else {
        map.flyTo([-2.5, 118.0], 5, { duration: 1.0 });
      }
    };
  }

  // Fetch live SeismicID cells in background (proxied through Vite to prevent CORS errors)
  fetch('/api/seismicid/forecasts/latest?horizon=30&threshold=5.0')
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        const liveCells = data.items.slice(0, 60).map((it, idx) => ({
          id: it.cell_id,
          lat: it.lat,
          lon: it.lon,
          name: it.full_label || `${it.province} - ${it.subregion}`,
          prov: it.province || 'Indonesia',
          prob: it.probability,
          rank: it.rank || (idx + 1),
          fault: it.fault_type || 'Subduksi',
          depth: it.slab_depth_km ? `${it.slab_depth_km.toFixed(1)} km` : '~25 km',
          maxM: it.historical_max_magnitude || 7.5
        }));
        if (currentMode === 'seismic-grid') {
          renderSeismicGridCells(liveCells);
        }
      }
    })
    .catch(() => {});

  window.addEventListener('resize', () => {
    if (currentMode === 'cross-section') {
      resizeCanvas();
      drawCrossSection();
    } else {
      map.invalidateSize();
    }
  });

  // Initial startup in 'sim-map' mode
  switchMode('sim-map');
}
