export function renderSimulation(container) {
  const section = document.createElement('section');
  section.id = 'simulasi';
  section.innerHTML = `
    <div class="section-header">
      <span class="section-eyebrow">Simulasi Hidrodinamika</span>
      <h2 class="section-title">Coba simulasi tsunami.</h2>
      <p class="section-lead">Atur kekuatan magnitudo, jarak episentrum, dan kedalaman laut. Lihat estimasi waktu tiba serta penjalaran gelombang secara visual.</p>
    </div>
    <div class="sim">
      <div class="sim__controls">
        <label>Magnitudo gempa <b id="vM">8.0</b>
          <input id="M" type="range" min="6.5" max="9.2" step="0.1" value="8">
        </label>
        <label>Jarak episentrum ke pantai <b id="vD">150 km</b>
          <input id="D" type="range" min="20" max="600" step="10" value="150">
        </label>
        <label>Kedalaman laut rata-rata <b id="vH">3000 m</b>
          <input id="H" type="range" min="500" max="5000" step="100" value="3000">
        </label>
        <button class="btn btn--primary" id="run">Jalankan Simulasi</button>
      </div>
      <div>
        <canvas id="sc" width="960" height="540" aria-label="Penampang hidrodinamika gelombang tsunami menuju pantai"></canvas>
        <div class="sim__outputs">
          <div class="sim__output">
            <small>ESTIMASI WAKTU TIBA (ETA)</small>
            <b id="oT">–</b>
          </div>
          <div class="sim__output">
            <small>TINGGI GELOMBANG</small>
            <b id="oH">–</b>
          </div>
          <div class="sim__output sim__output--status" id="oStatusCard">
            <small>STATUS PERINGATAN</small>
            <b class="sim__status-val" id="oStatusTitle">SIAGA</b>
          </div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(section);

  initSimulation(section);
}

function initSimulation(root) {
  const $ = id => root.querySelector('#' + id);
  const canvas = $('sc');
  const g = canvas.getContext('2d');
  let anim = 0, pr = 0;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.25 : 1;

  function calc() {
    const M = +$('M').value, D = +$('D').value, H = +$('H').value;
    $('vM').textContent = M.toFixed(1);
    $('vD').textContent = `${D} km`;
    $('vH').textContent = `${H} m`;

    // Scientific Tsunami Average Celerity: c_avg ~ 0.82 * sqrt(g * H)
    const vAvg = 0.82 * Math.sqrt(9.81 * H);
    const travelSec = (D * 1000) / vAvg;
    const min = Math.max(1, Math.round(travelSec / 60));

    // Realistic Seismological Energy Scaling:
    // Moment Magnitude energy release scales exponentially: 10^(0.78 * (M - 7.0))
    // Near epicenter & giant magnitude (e.g. M=9.2, D=20km, H=5000m): Aceh 2004 / Tohoku 2011 scale ~ 25m - 32m!
    // Moderate (M=8.0, D=150km): ~2.8m - 3.2m
    // Mild (M=6.8 - 7.0): ~0.3m - 0.5m
    const magFactor = Math.pow(10, 0.78 * (M - 7.0));
    const distFactor = Math.pow(80 / (60 + D), 0.6);
    const depthFactor = Math.pow(H / 2000, 0.35);

    let h = 0.42 * magFactor * distFactor * depthFactor;
    h = Math.max(0.2, Math.round(h * 10) / 10);

    $('oT').textContent = `${min} Menit`;
    $('oH').textContent = `${h.toFixed(1)} m`;

    // Official BMKG Warning Status: <0.5m Waspada, 0.5-3.0m Siaga, >3.0m Awas
    const statusCard = $('oStatusCard');
    const statusTitle = $('oStatusTitle');

    if (statusCard && statusTitle) {
      statusCard.classList.remove('status--waspada', 'status--siaga', 'status--awas');

      if (h < 0.5) {
        statusCard.classList.add('status--waspada');
        statusTitle.textContent = 'WASPADA';
      } else if (h <= 3.0) {
        statusCard.classList.add('status--siaga');
        statusTitle.textContent = 'SIAGA';
      } else {
        statusCard.classList.add('status--awas');
        statusTitle.textContent = 'AWAS';
      }
    }

    return { min, h, H, D };
  }

  function draw() {
    const w = canvas.width, hh = canvas.height;
    const r = calc();

    g.clearRect(0, 0, w, hh);

    // Dark oceanic background gradient
    const bgGrad = g.createLinearGradient(0, 0, 0, hh);
    bgGrad.addColorStop(0, '#020919');
    bgGrad.addColorStop(0.5, '#041530');
    bgGrad.addColorStop(1, '#062044');
    g.fillStyle = bgGrad;
    g.fillRect(0, 0, w, hh);

    // Subtle bathymetric depth grid lines
    g.strokeStyle = 'rgba(0, 210, 255, 0.06)';
    g.lineWidth = 1;
    for (let y = 120; y < hh; y += 80) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }

    // Coordinates setup
    const sy = hh * 0.44; // Undisturbed sea surface level (y = 237)
    const cx = w * 0.74;  // Coastline (Pantai)
    const shelfX = w * 0.48; // Continental shelf slope start

    // Bathymetry seafloor height function y(x)
    function getSeabedY(x) {
      const deepBedY = hh * 0.86;
      if (x < shelfX) {
        return deepBedY;
      }
      if (x < cx - 60) {
        const t = (x - shelfX) / (cx - 60 - shelfX);
        const smoothT = t * t * (3 - 2 * t);
        return deepBedY - (deepBedY - (sy + 40)) * smoothT;
      }
      if (x <= cx) {
        const t = (x - (cx - 60)) / 60;
        return (sy + 40) - 40 * t;
      }
      const t = (x - cx) / (w - cx);
      return sy - 110 * t;
    }

    // --- 1. DRAW SEABED & COASTAL LAND TERRAIN ---
    g.beginPath();
    g.moveTo(0, hh);
    g.lineTo(0, getSeabedY(0));
    for (let x = 0; x <= w; x += 10) {
      g.lineTo(x, getSeabedY(x));
    }
    g.lineTo(w, hh);
    g.closePath();

    const bedGrad = g.createLinearGradient(0, sy, 0, hh);
    bedGrad.addColorStop(0, '#09213d');
    bedGrad.addColorStop(0.4, '#06162a');
    bedGrad.addColorStop(1, '#020a14');
    g.fillStyle = bedGrad;
    g.fill();

    // Top contour of seabed / terrain
    g.strokeStyle = '#00d2ff';
    g.lineWidth = 2.5;
    g.stroke();

    // Terrain hatching lines for geological depth feel
    g.strokeStyle = 'rgba(0, 210, 255, 0.08)';
    g.lineWidth = 1;
    for (let x = 20; x < w; x += 35) {
      const topY = getSeabedY(x);
      g.beginPath();
      g.moveTo(x, topY);
      g.lineTo(x - 20, hh);
      g.stroke();
    }

    // --- 2. TSUNAMI WAVE PROPAGATION (HYDRODYNAMICS & SHOALING) ---
    const waveX = pr * (cx + 50);

    // Deep sea wave amplitude:
    const deepAmp = 8 + Math.min(35, r.h * 1.5);

    // Shoaling amplification:
    // Wave swells dramatically into a towering wall as it reaches the shallow coast!
    // For r.h = 30m, waveAmp reaches up to ~190px (soaring high into the canvas sky)!
    let waveAmp = deepAmp;
    if (waveX > shelfX) {
      const shoalRatio = Math.min(1, (waveX - shelfX) / (cx - shelfX));
      const maxCoastAmp = Math.min(195, 12 + r.h * 6.2);
      waveAmp = deepAmp + (maxCoastAmp - deepAmp) * (shoalRatio * shoalRatio);
    }
    const waveWidth = waveX < shelfX ? 85 : Math.max(34, 85 - (waveX - shelfX) * 0.24); // Wavelength compression

    // Draw water body
    g.beginPath();
    g.moveTo(0, hh);
    g.lineTo(0, sy);

    const waterEnd = Math.min(w, cx + Math.max(0, (waveX - cx + 25) * (1.2 + Math.min(2, r.h * 0.08))));

    let peakY = sy;
    for (let x = 0; x <= waterEnd; x += 4) {
      const bedY = getSeabedY(x);
      let surfaceY = sy + Math.sin(x * 0.02 + pr * 12) * 2;

      // Solitary tsunami wave crest calculation
      const dist = (x - waveX) / waveWidth;
      const crest = waveAmp / Math.cosh(dist * 1.5);

      // Drawdown (water receding before wave crest)
      let trough = 0;
      if (waveX > shelfX * 0.7 && dist > 0.6 && dist < 2.5) {
        trough = (waveAmp * 0.35) * Math.sin((dist - 0.6) * 1.6);
      }

      surfaceY -= (crest - trough);
      if (surfaceY > bedY) surfaceY = bedY;

      if (surfaceY < peakY) peakY = surfaceY;

      g.lineTo(x, surfaceY);
    }

    g.lineTo(waterEnd, getSeabedY(waterEnd));
    g.lineTo(0, getSeabedY(0));
    g.closePath();

    const waterGrad = g.createLinearGradient(0, sy - waveAmp, 0, hh * 0.85);
    waterGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    waterGrad.addColorStop(0.35, 'rgba(0, 180, 240, 0.28)');
    waterGrad.addColorStop(1, 'rgba(4, 30, 68, 0.75)');
    g.fillStyle = waterGrad;
    g.fill();

    // Ocean surface glowing wave line
    g.beginPath();
    for (let x = 0; x <= waterEnd; x += 4) {
      const dist = (x - waveX) / waveWidth;
      const crest = waveAmp / Math.cosh(dist * 1.5);
      let trough = 0;
      if (waveX > shelfX * 0.7 && dist > 0.6 && dist < 2.5) {
        trough = (waveAmp * 0.35) * Math.sin((dist - 0.6) * 1.6);
      }
      let surfaceY = sy + Math.sin(x * 0.02 + pr * 12) * 2 - (crest - trough);
      const bedY = getSeabedY(x);
      if (surfaceY > bedY) surfaceY = bedY;

      if (x === 0) g.moveTo(x, surfaceY);
      else g.lineTo(x, surfaceY);
    }
    g.strokeStyle = '#00f0ff';
    g.lineWidth = 2.8;
    g.shadowColor = '#00f0ff';
    g.shadowBlur = 12;
    g.stroke();
    g.shadowBlur = 0;

    // --- 3. EPICENTER (TECTONIC FAULT) AT X = 40 ---
    const faultX = 40;
    const faultBedY = getSeabedY(faultX);
    g.strokeStyle = '#ff3366';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(faultX, faultBedY);
    g.lineTo(faultX + 8, hh - 10);
    g.stroke();

    const pulsePhase = (pr * 8) % 1;
    g.strokeStyle = `rgba(255, 51, 102, ${1 - pulsePhase})`;
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(faultX, faultBedY, 15 + pulsePhase * 40, 0, Math.PI * 2);
    g.stroke();

    // --- 4. CLEAN LABELS & HEIGHT TAG ---
    g.font = '600 13px "JetBrains Mono", monospace';

    // Timer display (Top Left)
    g.fillStyle = '#00d2ff';
    const currentMin = Math.round(pr * r.min);
    g.fillText(`WAKTU SIMULASI: T+ ${currentMin} MENIT`, 24, 36);

    // Episentrum label
    g.fillStyle = '#ff6b8b';
    g.fillText('• Episentrum Gempa', faultX - 10, faultBedY + 30);

    // Coastline marker (Pantai)
    g.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    g.setLineDash([4, 4]);
    g.beginPath();
    g.moveTo(cx, sy - 110);
    g.lineTo(cx, getSeabedY(cx) + 20);
    g.stroke();
    g.setLineDash([]);

    g.fillStyle = '#e2e8f0';
    g.fillText('Garis Pantai', cx - 40, sy - 120);

    // Live wave height tag floating right above the crest
    if (waveAmp > 14) {
      g.fillStyle = r.h > 3.0 ? '#ff3366' : '#00f0ff';
      g.font = '700 13px "JetBrains Mono", monospace';
      g.fillText(`▲ ${r.h}m`, Math.max(10, waveX - 22), peakY - 10);
    }
  }

  function run() {
    cancelAnimationFrame(anim);
    pr = 0;
    const s = performance.now();
    (function f(n) {
      pr = Math.min(1, (n - s) / (calm ? 7000 : 18000));
      draw();
      if (pr < 1) anim = requestAnimationFrame(f);
    })(s);
  }

  ['M', 'D', 'H'].forEach(id => {
    $(id).oninput = () => { pr = 0.35; draw(); };
  });

  $('run').onclick = run;
  pr = 0.35;
  draw();
}
