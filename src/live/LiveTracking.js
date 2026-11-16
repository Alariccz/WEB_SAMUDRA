/**
 * SAMUDRA Live Tracking Darurat
 * Halaman: /live/:trackingId
 *
 * Fitur:
 * - Peta Leaflet terpusat di koordinat terbaru pengguna
 * - Marker dengan pulse radar effect (hijau = aktif, merah = berhenti)
 * - Polyline jejak rute evakuasi dari history
 * - Smooth marker animation setiap polling
 * - Polling otomatis setiap 4 detik selama status === 'active'
 * - Info card: nama, status badge, waktu update, tombol Telepon/WA/GMaps
 */

import L from 'leaflet';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE)
  || 'https://samudra.rizalzaky.cloud/api';

const POLL_INTERVAL_MS = 4000;
const SAMUDRA_BLUE = '#2B4EFF';
const ALERT_RED   = '#DC2626';
const TRACK_GREEN = '#16a34a';

// -------------------------------------------------
// 1. Render Root
// -------------------------------------------------
export function renderLiveTracking(container, trackingId) {
  container.innerHTML = '';

  // Inject global styles
  const style = document.createElement('style');
  style.textContent = getLiveStyles();
  document.head.appendChild(style);

  // Update page title
  document.title = 'Live Tracking Darurat — SAMUDRA';

  if (!trackingId) {
    renderInvalidSession(container, 'ID sesi pelacakan tidak valid atau tidak ditemukan dalam URL.');
    return;
  }

  // Build skeleton
  container.innerHTML = `
    <div class="lt-root" id="lt-root">
      <!-- Info Card -->
      <div class="lt-card" id="lt-card">
        <div class="lt-card__top">
          <div class="lt-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${SAMUDRA_BLUE}" stroke-width="2.2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="${SAMUDRA_BLUE}" stroke="none"/>
            </svg>
            <span class="lt-logo__text">SAMUDRA</span>
          </div>
          <div class="lt-badge lt-badge--loading" id="lt-badge">
            <span class="lt-badge__dot"></span>
            <span class="lt-badge__label">Memuat...</span>
          </div>
        </div>

        <div class="lt-user" id="lt-user">
          <div class="lt-user__avatar" id="lt-avatar">?</div>
          <div class="lt-user__info">
            <div class="lt-user__name" id="lt-name">Memuat data...</div>
            <div class="lt-user__meta" id="lt-time">Menghubungkan ke server...</div>
          </div>
        </div>

        <div class="lt-actions" id="lt-actions">
          <div class="lt-skeleton lt-skeleton--actions"></div>
        </div>

        <div class="lt-speed-row" id="lt-speed-row" style="display:none">
          <div class="lt-speed-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span id="lt-speed-val">0</span> <span>km/jam</span>
          </div>
          <div class="lt-speed-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            <span id="lt-heading-val">0</span>°
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div class="lt-map" id="lt-map"></div>

      <!-- Bottom safe area -->
      <div class="lt-safe-bottom"></div>
    </div>
  `;

  // Init map
  const map = L.map('lt-map', {
    zoomControl: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap © CARTO'
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.control.attribution({ position: 'bottomleft', prefix: '© CARTO' }).addTo(map);

  // Map objects we'll update
  let marker = null;
  let polyline = null;
  let pulseCircle = null;
  let pollingTimer = null;
  let isFirstLoad = true;

  // -------------------------------------------------
  // 2. Polling Logic
  // -------------------------------------------------
  async function fetchTracking() {
    try {
      const res = await fetch(`${API_BASE}/tracking/${encodeURIComponent(trackingId)}`);

      if (res.status === 404) {
        stopPolling();
        renderInvalidSession(container, 'Sesi pelacakan telah berakhir atau tidak valid.');
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      updateUI(data);

      if (data.status === 'stopped') {
        stopPolling();
      }
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        stopPolling();
        renderInvalidSession(container, 'Sesi pelacakan telah berakhir atau tidak valid.');
        return;
      }
      setTimeText('Gagal memperbarui lokasi — mencoba lagi...');
      console.warn('[LiveTracking] Polling error:', err);
    }
  }

  function startPolling() {
    fetchTracking();
    pollingTimer = setInterval(fetchTracking, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }

  // -------------------------------------------------
  // 3. UI Update
  // -------------------------------------------------
  function updateUI(data) {
    const {
      userName, userPhone,
      latitude, longitude,
      speed = 0, heading = 0,
      status, updatedAt,
      history = []
    } = data;

    const isActive = status === 'active';
    const markerColor = isActive ? TRACK_GREEN : ALERT_RED;

    // --- Badge ---
    const badge = document.getElementById('lt-badge');
    if (badge) {
      badge.className = `lt-badge ${isActive ? 'lt-badge--live' : 'lt-badge--stopped'}`;
      badge.innerHTML = `
        <span class="lt-badge__dot"></span>
        <span class="lt-badge__label">${isActive ? 'LIVE TRACKING' : 'PELACAKAN BERHENTI'}</span>
      `;
    }

    // --- User info ---
    const nameEl = document.getElementById('lt-name');
    if (nameEl) nameEl.textContent = userName || 'Pengguna SAMUDRA';

    const avatarEl = document.getElementById('lt-avatar');
    if (avatarEl) {
      const initials = (userName || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
      avatarEl.textContent = initials;
      avatarEl.style.backgroundColor = isActive ? TRACK_GREEN : ALERT_RED;
    }

    // --- Time ---
    setTimeText(formatRelativeTime(updatedAt));

    // --- Stopped banner ---
    if (!isActive) {
      const existing = document.getElementById('lt-stopped-banner');
      if (!existing) {
        const banner = document.createElement('div');
        banner.id = 'lt-stopped-banner';
        banner.className = 'lt-stopped-banner';
        banner.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Pelacakan telah dihentikan oleh pengguna
        `;
        const card = document.getElementById('lt-card');
        if (card) card.appendChild(banner);
      }
    }

    // --- Action buttons ---
    const actionsEl = document.getElementById('lt-actions');
    if (actionsEl && userPhone) {
      const cleanPhone = userPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      actionsEl.innerHTML = `
        <a href="tel:${userPhone}" class="lt-btn lt-btn--call" aria-label="Telepon ${userName}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .92h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
          Telepon
        </a>
        <a href="https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${userName}, saya melihat lokasi daruratmu di SAMUDRA. Apakah kamu baik-baik saja?`)}" target="_blank" rel="noopener" class="lt-btn lt-btn--wa" aria-label="WhatsApp ${userName}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>
        <a href="${mapsUrl}" target="_blank" rel="noopener" class="lt-btn lt-btn--maps" aria-label="Buka di Google Maps">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          Maps
        </a>
      `;
    }

    // --- Speed / Heading ---
    const speedRow = document.getElementById('lt-speed-row');
    if (speedRow) {
      speedRow.style.display = 'flex';
      const sv = document.getElementById('lt-speed-val');
      const hv = document.getElementById('lt-heading-val');
      if (sv) sv.textContent = (typeof speed === 'number' ? (speed * 3.6).toFixed(1) : '0');
      if (hv) hv.textContent = Math.round(heading || 0);
    }

    // --- Map Marker & Polyline ---
    const latlng = L.latLng(latitude, longitude);

    if (isFirstLoad) {
      map.setView(latlng, 16);
      isFirstLoad = false;
    } else {
      // Smooth pan — only if user hasn't manually panned
      map.panTo(latlng, { animate: true, duration: 0.8 });
    }

    // Pulse circle behind marker
    if (!pulseCircle) {
      pulseCircle = L.circleMarker(latlng, {
        radius: 20,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.15,
        weight: 1.5,
        className: 'lt-pulse-circle'
      }).addTo(map);
    } else {
      pulseCircle.setLatLng(latlng);
      pulseCircle.setStyle({ color: markerColor, fillColor: markerColor });
    }

    // Person marker
    const personIcon = L.divIcon({
      className: '',
      html: `
        <div class="lt-marker-wrap lt-marker-wrap--${isActive ? 'active' : 'stopped'}">
          <div class="lt-marker-pulse"></div>
          <div class="lt-marker-core">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (!marker) {
      marker = L.marker(latlng, { icon: personIcon }).addTo(map);
      marker.bindPopup(`<b>${userName || 'Pengguna'}</b><br>${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } else {
      marker.setLatLng(latlng);
      marker.setIcon(personIcon);
    }

    // Polyline rute dari history
    if (history && history.length > 0) {
      const routePoints = history
        .filter(h => h.latitude != null && h.longitude != null)
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        .map(h => [h.latitude, h.longitude]);

      // Tambahkan posisi sekarang jika belum ada
      const lastH = routePoints[routePoints.length - 1];
      if (!lastH || lastH[0] !== latitude || lastH[1] !== longitude) {
        routePoints.push([latitude, longitude]);
      }

      if (!polyline) {
        polyline = L.polyline(routePoints, {
          color: isActive ? SAMUDRA_BLUE : '#94a3b8',
          weight: 3.5,
          opacity: 0.75,
          lineJoin: 'round',
          lineCap: 'round',
          dashArray: isActive ? null : '6, 6'
        }).addTo(map);
      } else {
        polyline.setLatLngs(routePoints);
        polyline.setStyle({
          color: isActive ? SAMUDRA_BLUE : '#94a3b8',
          dashArray: isActive ? null : '6, 6'
        });
      }
    }

    // Live update time tick
    startRelativeTimeTick(updatedAt);
  }

  // -------------------------------------------------
  // 4. Relative time ticker
  // -------------------------------------------------
  let timeTicker = null;
  let lastUpdatedAt = null;

  function startRelativeTimeTick(updatedAt) {
    lastUpdatedAt = updatedAt;
    if (timeTicker) clearInterval(timeTicker);
    timeTicker = setInterval(() => {
      setTimeText(formatRelativeTime(lastUpdatedAt));
    }, 10000);
  }

  function setTimeText(text) {
    const el = document.getElementById('lt-time');
    if (el) el.textContent = text;
  }

  // -------------------------------------------------
  // 5. Kick off
  // -------------------------------------------------
  startPolling();

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    stopPolling();
    if (timeTicker) clearInterval(timeTicker);
  });
}

// -------------------------------------------------
// Helpers
// -------------------------------------------------
function formatRelativeTime(ts) {
  if (!ts) return 'Waktu tidak diketahui';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10) return 'Update terakhir: Baru saja';
  if (diff < 60) return `Update terakhir: ${diff} detik lalu`;
  if (diff < 3600) return `Update terakhir: ${Math.floor(diff / 60)} menit lalu`;
  return `Update terakhir: ${Math.floor(diff / 3600)} jam lalu`;
}

function renderInvalidSession(container, message) {
  container.innerHTML = `
    <div style="
      display:flex;min-height:100dvh;min-height:100vh;align-items:center;justify-content:center;
      background:#0f172a;color:#f8fafc;font-family:'Inter',-apple-system,sans-serif;
      padding:24px;text-align:center;
    ">
      <div>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="1.5" style="margin-bottom:16px">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        <h2 style="font-size:20px;font-weight:700;margin:0 0 10px 0;color:#f8fafc;">Sesi Tidak Valid</h2>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 24px 0;line-height:1.6;max-width:320px">${message}</p>
        <a href="https://samudra.buzz" style="
          display:inline-flex;align-items:center;gap:8px;background:#2B4EFF;color:white;
          text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Kembali ke SAMUDRA
        </a>
      </div>
    </div>
  `;
}

// -------------------------------------------------
// Styles
// -------------------------------------------------
function getLiveStyles() {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body { height: 100%; background: #0f172a; }

    #live-app {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .lt-root {
      position: relative;
      width: 100%;
      height: 100dvh;
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #0f172a;
    }

    /* -------- MAP -------- */
    .lt-map {
      flex: 1;
      width: 100%;
      z-index: 0;
    }

    .lt-map .leaflet-container {
      background: #0f172a;
    }

    /* -------- CARD -------- */
    .lt-card {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 14px 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }

    .lt-card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    /* Logo */
    .lt-logo {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .lt-logo__text {
      font-weight: 700;
      font-size: 15px;
      color: #f8fafc;
      letter-spacing: 0.5px;
    }

    /* -------- BADGE -------- */
    .lt-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .lt-badge__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .lt-badge--loading {
      background: rgba(100,116,139,0.2);
      color: #94a3b8;
    }
    .lt-badge--loading .lt-badge__dot {
      background: #94a3b8;
    }

    .lt-badge--live {
      background: rgba(22, 163, 74, 0.15);
      color: #4ade80;
      border: 1px solid rgba(22, 163, 74, 0.3);
    }
    .lt-badge--live .lt-badge__dot {
      background: #4ade80;
      animation: lt-blink 1.2s ease-in-out infinite;
    }

    .lt-badge--stopped {
      background: rgba(220, 38, 38, 0.15);
      color: #f87171;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }
    .lt-badge--stopped .lt-badge__dot {
      background: #f87171;
    }

    /* -------- USER ROW -------- */
    .lt-user {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .lt-user__avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #2B4EFF;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 700;
      flex-shrink: 0;
      transition: background 0.4s;
    }

    .lt-user__name {
      font-size: 15px;
      font-weight: 700;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lt-user__meta {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 2px;
    }

    /* -------- ACTION BUTTONS -------- */
    .lt-actions {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }

    .lt-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 8px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: opacity 0.15s, transform 0.1s;
      cursor: pointer;
      border: none;
      color: white;
    }

    .lt-btn:active { transform: scale(0.96); opacity: 0.85; }

    .lt-btn--call {
      background: linear-gradient(135deg, #2B4EFF 0%, #1a3dcc 100%);
    }
    .lt-btn--wa {
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
    }
    .lt-btn--maps {
      background: linear-gradient(135deg, #ea4335 0%, #c5392c 100%);
    }

    /* -------- SPEED ROW -------- */
    .lt-speed-row {
      display: flex;
      gap: 16px;
    }

    .lt-speed-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: #94a3b8;
    }
    .lt-speed-item span:nth-child(2) {
      font-weight: 600;
      color: #cbd5e1;
    }

    /* -------- STOPPED BANNER -------- */
    .lt-stopped-banner {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-top: 10px;
      padding: 9px 12px;
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.25);
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      color: #f87171;
    }

    /* -------- SKELETON -------- */
    .lt-skeleton {
      border-radius: 8px;
      background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
      background-size: 200% 100%;
      animation: lt-shimmer 1.5s infinite;
    }
    .lt-skeleton--actions {
      height: 38px;
      margin-bottom: 10px;
    }

    /* -------- SAFE AREA -------- */
    .lt-safe-bottom {
      height: env(safe-area-inset-bottom, 0);
      background: transparent;
    }

    /* -------- MARKER -------- */
    .lt-marker-wrap {
      width: 44px;
      height: 44px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lt-marker-pulse {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      animation: lt-radar 2s ease-out infinite;
    }

    .lt-marker-wrap--active .lt-marker-pulse {
      border: 2px solid #16a34a;
      background: rgba(22, 163, 74, 0.15);
    }

    .lt-marker-wrap--stopped .lt-marker-pulse {
      border: 2px solid #DC2626;
      background: rgba(220, 38, 38, 0.1);
      animation-play-state: paused;
    }

    .lt-marker-core {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    .lt-marker-wrap--active .lt-marker-core {
      background: #16a34a;
    }

    .lt-marker-wrap--stopped .lt-marker-core {
      background: #DC2626;
    }

    /* -------- ANIMATIONS -------- */
    @keyframes lt-radar {
      0%   { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    @keyframes lt-blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    @keyframes lt-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* -------- Leaflet attribution override for dark theme -------- */
    .leaflet-control-attribution {
      background: rgba(15,23,42,0.75) !important;
      color: #64748b !important;
      font-size: 10px !important;
    }
    .leaflet-control-attribution a { color: #94a3b8 !important; }

    .leaflet-control-zoom a {
      background: rgba(15,23,42,0.9) !important;
      color: #f8fafc !important;
      border-color: rgba(255,255,255,0.1) !important;
    }
    .leaflet-control-zoom a:hover {
      background: rgba(43,78,255,0.5) !important;
    }

    /* Responsive: on larger screens, make card a sidebar */
    @media (min-width: 768px) {
      .lt-card {
        position: absolute;
        top: 20px;
        left: 20px;
        right: auto;
        width: 320px;
        border-radius: 20px;
      }
    }
  `;
}
