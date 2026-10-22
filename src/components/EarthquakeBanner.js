import { fetchLatestEarthquake } from '../api.js';

function formatMagnitude(mag) {
  return parseFloat(mag).toFixed(1);
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
  }) + ' WIB';
}

export function renderEarthquakeBanner(container) {
  const banner = document.createElement('div');
  banner.className = 'quake-banner';
  banner.innerHTML = `
    <span class="quake-banner__dot"></span>
    <span class="quake-banner__label">GEMPA TERKINI</span>
    <span class="quake-banner__value" id="qMag">— M</span>
    <span class="quake-banner__value" id="qDepth">— km</span>
    <span class="quake-banner__value" id="qTsunami">Memuat…</span>
    <span class="quake-banner__region" id="qRegion">Menghubungi BMKG…</span>
  `;
  container.appendChild(banner);

  fetchLatestEarthquake()
    .then(data => {
      document.getElementById('qMag').textContent = `M ${formatMagnitude(data.magnitude)}`;
      document.getElementById('qDepth').textContent = `${parseFloat(data.depthKm).toFixed(0)} km`;
      document.getElementById('qRegion').textContent = `${data.region} • ${formatTime(data.occurredAt)}`;

      const tsunamiEl = document.getElementById('qTsunami');
      if (data.potentialTsunami) {
        tsunamiEl.textContent = '⚠ POTENSI TSUNAMI';
        tsunamiEl.className = 'quake-banner__tsunami';
      } else {
        tsunamiEl.textContent = '✓ Tidak berpotensi tsunami';
        tsunamiEl.className = 'quake-banner__aman';
      }
    })
    .catch(() => {
      document.getElementById('qRegion').textContent = 'Data tidak tersedia';
    });
}
