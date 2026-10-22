import { fetchPeralatan } from '../api.js';

// Peralatan default jika API tidak ada datanya
const DEFAULT_ITEMS = [
  'Air minum 3 liter per orang',
  'Makanan tahan lama',
  'Senter dan baterai',
  'Obat pribadi dan P3K',
  'Salinan dokumen penting',
  'Power bank',
  'Peluit',
  'Radio portabel',
];

export function renderChecklist(container) {
  const section = document.createElement('section');
  section.id = 'samudra';
  section.innerHTML = `
    <div class="section-header">
      <span class="section-eyebrow">Kesiapsiagaan Mandiri</span>
      <h2 class="section-title">Cek tas siaga Anda.</h2>
      <p class="section-lead">Centang perlengkapan esensial yang sudah Anda siapkan di rumah untuk menghadapi situasi darurat.</p>
    </div>
    <div class="checklist-card">
      <div class="checklist" id="chk"></div>
      <div class="progress-bar"><div class="progress-bar__fill" id="chk-bar"></div></div>
      <p class="progress-note" id="chk-count"></p>
    </div>
  `;
  container.appendChild(section);

  const chk = section.querySelector('#chk');
  const bar = section.querySelector('#chk-bar');
  const count = section.querySelector('#chk-count');

  function buildChecklist(items) {
    chk.innerHTML = '';
    items.forEach(item => {
      const label = document.createElement('label');
      label.className = 'checklist__item';
      const name = typeof item === 'string' ? item : (item.name || item.title || JSON.stringify(item));
      label.innerHTML = `<input type="checkbox"> ${name}`;
      chk.appendChild(label);
    });
    update();
    chk.onchange = update;
  }

  function update() {
    const total = chk.querySelectorAll('input').length;
    const checked = chk.querySelectorAll(':checked').length;
    bar.style.width = `${(checked / total) * 100}%`;
    count.textContent = `${checked} dari ${total}${checked === total ? ' • Tas siaga lengkap ✓' : ' siap'}`;
  }

  // Coba fetch dari API dulu, fallback ke default
  fetchPeralatan()
    .then(data => {
      if (data && data.length > 0) {
        buildChecklist(data);
      } else {
        buildChecklist(DEFAULT_ITEMS);
      }
    })
    .catch(() => buildChecklist(DEFAULT_ITEMS));
}
