/**
 * Mounts the React <WarpCarousel /> (components/ui/warp-carousel.tsx) into the
 * "Mengapa Mitigasi Tsunami Penting?" section, with an ocean palette and
 * animated water decoration (waves, bubbles, caustic light).
 *
 * React and the carousel are loaded lazily so they stay out of the first paint.
 */

const OCEAN_PALETTES = {
  risiko: ['#1e354d', '#0d2136', '#0b253c', '#123a58'],
  aman: ['#1d344c', '#0d2136', '#0c2740', '#133d5c'],
  siaga: ['#1f364e', '#0d2136', '#0b263e', '#143f5e'],
  cepat: ['#1e354d', '#0d2136', '#0c2841', '#133c5a']
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rampColor(palette, t) {
  const x = Math.min(1, Math.max(0, t)) * (palette.length - 1);
  const i = Math.min(palette.length - 2, Math.floor(x));
  const f = x - i;
  const a = hexToRgb(palette[i]);
  const b = hexToRgb(palette[i + 1]);
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * 42 colours (6 x 7 grid) shaped like light through water: dark deep water at
 * the top, brighter shallows towards the bottom, with rippled bands in between.
 */
function oceanMesh(palette, seed) {
  const colors = [];
  for (let j = 0; j < 7; j++) {
    for (let i = 0; i < 6; i++) {
      const diag = 0.45 * (i / 5) + 0.55 * (j / 6);
      const ripple = 0.05 * Math.sin(i * 1.4 + j * 0.9 + seed);
      const t = Math.min(1, Math.max(0, diag + ripple));
      colors.push(rampColor(palette, t));
    }
  }
  return colors;
}

const WATER_CARDS = [
  {
    title: 'Kenali risiko\ngelombang tsunami',
    value: '30',
    unit: 'm',
    footer: 'Tinggi gelombang ekstrem',
    detail: 'ring',
    labels: ['BAHAYA'],
    numeral: ['#f8fafc', '#38bdf8'],
    accent: '#00d2ff',
    glow: '#00d2ff',
    mesh: oceanMesh(OCEAN_PALETTES.risiko, 0.4)
  },
  {
    title: 'Kenali lokasi\naman terdekat',
    value: '20',
    unit: 'm',
    footer: 'Dataran tinggi evakuasi',
    detail: 'cross',
    labels: ['TITIK KUMPUL', 'A', 'B'],
    numeral: ['#f8fafc', '#38bdf8'],
    accent: '#00d2ff',
    glow: '#00d2ff',
    mesh: oceanMesh(OCEAN_PALETTES.aman, 1.9)
  },
  {
    title: 'Siapkan diri\ntas siaga bencana',
    value: '72',
    unit: 'jam',
    footer: 'Perbekalan darurat',
    detail: 'wave',
    labels: ['LOGISTIK'],
    numeral: ['#f8fafc', '#38bdf8'],
    accent: '#00d2ff',
    glow: '#00d2ff',
    mesh: oceanMesh(OCEAN_PALETTES.siaga, 3.1)
  },
  {
    title: 'Waktu tiba tsunami\nsetelah gempa',
    value: '30',
    unit: 'mnt',
    footer: 'Segera menjauh dari pantai',
    detail: 'slider',
    labels: ['RESPON', 'Cepat', 'Aman'],
    numeral: ['#f8fafc', '#38bdf8'],
    accent: '#00d2ff',
    glow: '#00d2ff',
    mesh: oceanMesh(OCEAN_PALETTES.cepat, 4.6)
  }
];

/** Static markup for the water stage; the carousel mounts into `[data-warp-host]`. */
export function waterStageMarkup() {
  return `
    <div class="mit-water-stage" data-warp-stage>
      <div class="mit-water-light" aria-hidden="true">
        <span class="mit-ray mit-ray-1"></span>
        <span class="mit-ray mit-ray-2"></span>
        <span class="mit-ray mit-ray-3"></span>
      </div>
      <div class="mit-water-caustics mit-water-caustics-a" aria-hidden="true"></div>
      <div class="mit-water-floor" aria-hidden="true">
        <span class="mit-water-glow"></span>
        <span class="mit-ripple mit-ripple-1"></span>
        <span class="mit-ripple mit-ripple-2"></span>
        <span class="mit-waterline"></span>
      </div>
      <div class="mit-water-host" data-warp-host></div>
    </div>
  `;
}

export const waterStageStyles = `
  .mit-water-stage {
    position: relative;
    width: 100%;
    max-width: 1100px;
    margin: -18px auto 0;
    height: clamp(420px, 48vw, 540px);
    background: transparent;
    contain: layout paint;
    -webkit-mask-image: linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 12%, #000 88%, transparent 100%);
    -webkit-mask-composite: source-in;
    mask-image: linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 12%, #000 88%, transparent 100%);
    mask-composite: intersect;
  }
  .mit-water-stage:not([data-in-view="true"]) .mit-ray,
  .mit-water-stage:not([data-in-view="true"]) .mit-water-glow,
  .mit-water-stage:not([data-in-view="true"]) .mit-ripple,
  .mit-water-stage:not([data-in-view="true"]) .mit-waterline {
    animation-play-state: paused;
  }
  .mit-water-host { position: absolute; inset: 0; z-index: 3; }

  /* soft shafts of light falling through the water */
  .mit-water-light { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
  .mit-ray {
    position: absolute; top: -12%; height: 105%; width: 18%;
    background: linear-gradient(to bottom, rgba(0, 210, 255, 0.16), rgba(0, 210, 255, 0.04) 55%, transparent 90%);
    filter: blur(14px);
    transform-origin: 50% 0;
    animation: mit-ray-sway 12s ease-in-out infinite alternate;
  }
  .mit-ray-1 { left: 14%; transform: skewX(-14deg) rotate(6deg); }
  .mit-ray-2 { left: 42%; width: 22%; opacity: 0.8; transform: skewX(-10deg) rotate(3deg); animation-duration: 15s; animation-delay: -4s; }
  .mit-ray-3 { left: 72%; transform: skewX(-16deg) rotate(8deg); animation-duration: 18s; animation-delay: -8s; }
  @keyframes mit-ray-sway {
    from { opacity: 0.45; translate: -2% 0; }
    to { opacity: 1; translate: 3% 0; }
  }

  /* lightweight radial caustic glow (replaces heavy SVG feTurbulence filters) */
  .mit-water-caustics {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background:
      radial-gradient(36% 28% at 35% 48%, rgba(0, 210, 255, 0.08), transparent 70%),
      radial-gradient(40% 30% at 65% 54%, rgba(56, 189, 248, 0.07), transparent 72%);
  }

  /* the water surface under the cards: reflected glow, expanding ripples, a thin waterline */
  .mit-water-floor { position: absolute; left: 0; right: 0; bottom: 0; height: 30%; z-index: 2; pointer-events: none; }
  .mit-water-glow {
    position: absolute; left: 50%; bottom: 6%; width: 72%; height: 70%; translate: -50% 0;
    background: radial-gradient(50% 50% at 50% 50%, rgba(0, 210, 255, 0.18), rgba(0, 210, 255, 0.05) 55%, transparent 75%);
    animation: mit-glow-breathe 7s ease-in-out infinite alternate;
  }
  @keyframes mit-glow-breathe {
    from { opacity: 0.7; transform: scaleX(0.94); }
    to { opacity: 1; transform: scaleX(1.04); }
  }
  .mit-ripple {
    position: absolute; left: 50%; bottom: 22%; width: 34%; height: 15%; translate: -50% 50%;
    border-radius: 50%;
    border: 1px solid rgba(165, 232, 255, 0.4);
    box-shadow: 0 0 14px rgba(0, 210, 255, 0.18), inset 0 0 14px rgba(0, 210, 255, 0.08);
    opacity: 0;
    transform: scale(0.35);
    animation: mit-ripple-out 7.5s cubic-bezier(0.2, 0.6, 0.3, 1) infinite;
  }
  .mit-ripple-2 { animation-delay: 2.5s; }
  .mit-ripple-3 { animation-delay: 5s; }
  @keyframes mit-ripple-out {
    0% { opacity: 0; transform: scale(0.35); }
    14% { opacity: 0.85; }
    100% { opacity: 0; transform: scale(2.7); }
  }
  .mit-waterline {
    position: absolute; left: 4%; right: 4%; bottom: 0; height: 1px;
    background: linear-gradient(to right, transparent, rgba(165, 232, 255, 0.45) 30%, rgba(255, 255, 255, 0.6) 50%, rgba(165, 232, 255, 0.45) 70%, transparent);
    background-size: 200% 100%;
    animation: mit-waterline-shimmer 9s ease-in-out infinite alternate;
  }
  @keyframes mit-waterline-shimmer {
    from { background-position: 0% 0; opacity: 0.55; }
    to { background-position: 100% 0; opacity: 1; }
  }

  @media (max-width: 720px) {
    .mit-water-stage { height: 440px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mit-ray, .mit-water-caustics, .mit-water-glow, .mit-ripple, .mit-waterline { animation: none; }
    .mit-ripple { opacity: 0.25; transform: scale(1.4); }
  }
`;

/** Lazily loads React + the carousel and mounts it inside the water stage. */
export async function mountWarpCarousel(root) {
  const host = root.querySelector('[data-warp-host]');
  const stage = root.querySelector('[data-warp-stage]');
  if (!host) return null;

  let io = null;
  if (stage && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        const vis = entries.some((e) => e.isIntersecting);
        stage.setAttribute('data-in-view', vis ? 'true' : 'false');
      },
      { threshold: 0.05 }
    );
    io.observe(stage);
  }

  const [React, { createRoot }, { WarpCarousel }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('../../components/ui/warp-carousel.tsx')
  ]);

  if (!host.isConnected) return null;

  const reactRoot = createRoot(host);
  reactRoot.render(
    React.createElement(WarpCarousel, {
      cards: WATER_CARDS,
      background: '#000000',
      transparent: true,
      interval: 3.8,
      step: 1,
      warp: 0.3,
      font: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      ariaLabel: 'Pilar mitigasi tsunami',
      style: { width: '100%', height: '100%', minHeight: 0, aspectRatio: 'auto', background: 'transparent' }
    })
  );

  return () => {
    if (io) io.disconnect();
    reactRoot.unmount();
  };
}
