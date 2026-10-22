export function renderSimulation(container) {
  const section = document.createElement('section');
  section.id = 'simulasi';
  section.innerHTML = `
    <div class="section-header">
      <span class="section-eyebrow">Simulasi Hidrodinamika</span>
      <h2 class="section-title">Coba simulasi tsunami.</h2>
      <p class="section-lead">Atur kekuatan magnitudo, jarak episentrum, dan kedalaman laut. Lihat estimasi waktu tiba serta jangkauan di pesisir secara visual.</p>
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
        <canvas id="sc" width="960" height="540" aria-label="Penampang gelombang tsunami menuju pantai"></canvas>
        <div class="sim__outputs">
          <div class="sim__output"><small>WAKTU TIBA</small><b id="oT">–</b></div>
          <div class="sim__output"><small>TINGGI DI PANTAI</small><b id="oH">–</b></div>
          <div class="sim__output"><small>JANGKAUAN DARATAN</small><b id="oI">–</b></div>
        </div>
        <p class="sim__note">Rumus kecepatan: v = √(g·d). Tinggi dan jangkauan adalah perkiraan numerik untuk edukasi. Selalu ikuti ketetapan resmi dari BMKG dan BPBD.</p>
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
    const v = Math.sqrt(9.81 * H);
    const min = D * 1000 / v / 60 * 1.12;
    const h = 1.2 * Math.pow(2, (M - 7) / 0.5) * Math.pow(100 / (100 + D), 0.5);
    const inl = Math.min(h * 0.12, 6);
    $('oT').textContent = `${Math.round(min)} mnt`;
    $('oH').textContent = `${h.toFixed(1)} m`;
    $('oI').textContent = `${inl.toFixed(1)} km`;
    return { min, h };
  }

  function draw() {
    const w = canvas.width, hh = canvas.height;
    const r = calc(), sy = hh * 0.55, cx = w * 0.72;
    const amp = Math.min(110, 10 + r.h * 7);

    g.clearRect(0, 0, w, hh);
    const gr = g.createLinearGradient(0, 0, 0, hh);
    gr.addColorStop(0, '#040d28');
    gr.addColorStop(1, '#06345a');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, hh);

    g.beginPath();
    g.moveTo(0, hh);
    for (let x = 0; x <= w; x += 6) {
      let y = sy + Math.sin(x * 0.03) * 3;
      const e = (x - pr * (w * 1.05) + 80) / 38;
      y -= amp * Math.exp(-e * e) * (x < cx ? 1 : Math.max(0.2, 1 - (x - cx) / 200));
      g.lineTo(x, y);
    }
    g.lineTo(w, hh);
    g.closePath();
    g.fillStyle = '#00f0ff33';
    g.fill();
    g.strokeStyle = '#00f0ff';
    g.lineWidth = 2;
    g.stroke();

    g.beginPath();
    g.moveTo(0, hh * 0.9);
    g.lineTo(cx - 60, hh * 0.9);
    g.lineTo(cx + 190, hh * 0.35);
    g.lineTo(w, hh * 0.3);
    g.lineTo(w, hh);
    g.lineTo(0, hh);
    g.closePath();
    g.fillStyle = '#07152b';
    g.fill();
    g.strokeStyle = '#00d2ff';
    g.stroke();

    g.fillStyle = '#94a3b8';
    g.font = '14px JetBrains Mono, monospace';
    g.fillText('episentrum', 14, hh * 0.88);
    g.fillText('pantai', cx - 30, hh * 0.3 - 22);
    g.fillStyle = '#00d2ff';
    g.fillText(`T+ ${Math.round(pr * r.min)} mnt`, 14, 28);
  }

  function run() {
    cancelAnimationFrame(anim);
    pr = 0;
    const s = performance.now();
    (function f(n) {
      pr = Math.min(1, (n - s) / (calm ? 7000 : 20000));
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
