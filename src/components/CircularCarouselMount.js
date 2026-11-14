/**
 * Mounts <CircularCarousel /> (components/ui/circular-carousel.tsx) into the
 * "#mitigasi-grid" slot inside Mitigasi.js, syncing with the header counter
 * and prev/next buttons, and navigating to the mitigasi detail view when a
 * card is clicked.
 */

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=800&q=80'
];

function safeUrl(url, fallback) {
  if (!url) return fallback;
  try {
    const parsed = new URL(url, window.location.origin);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch {
    // ignore invalid URL
  }
  return fallback;
}

export async function mountCircularMitigasiCarousel({
  host,
  items,
  counterEl,
  prevBtn,
  nextBtn
}) {
  if (!host || !Array.isArray(items) || items.length === 0) return null;

  const normalizedItems = items.map((item, idx) => {
    const stepNum = item.stepNumber || (idx + 1);
    const id = String(item.id || `mitigasi-${stepNum}`);
    const fallbackImg = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
    return {
      id,
      title: item.title || 'Panduan Mitigasi',
      description: item.description || 'Instruksi kesiapsiagaan dan tindakan tanggap darurat.',
      tag: `LANGKAH ${String(stepNum).padStart(2, '0')}`,
      imageUrl: safeUrl(item.imageUrl, fallbackImg),
      href: `?article=${encodeURIComponent(id)}`
    };
  });

  if (counterEl) {
    counterEl.textContent = `${normalizedItems.length} Panduan Evakuasi`;
  }

  const [React, { createRoot }, { CircularCarousel }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('../../components/ui/circular-carousel.tsx')
  ]);

  if (!host.isConnected) return null;

  host.innerHTML = '';
  const reactRoot = createRoot(host);

  function ControlledCircularCarousel() {
    const [activeIdx, setActiveIdx] = React.useState(0);
    const total = normalizedItems.length;

    React.useEffect(() => {
      if (!prevBtn && !nextBtn) return undefined;
      const onPrev = () => setActiveIdx(curr => ((curr - 1) % total + total) % total);
      const onNext = () => setActiveIdx(curr => (curr + 1) % total);
      if (prevBtn) prevBtn.onclick = onPrev;
      if (nextBtn) nextBtn.onclick = onNext;
      return () => {
        if (prevBtn) prevBtn.onclick = null;
        if (nextBtn) nextBtn.onclick = null;
      };
    }, [total]);

    const handleItemClick = React.useCallback((clickedItem) => {
      if (!clickedItem || !clickedItem.id) return;
      if (typeof window.__navigateToArticle === 'function') {
        window.__navigateToArticle(clickedItem.id);
      } else {
        window.location.href = `?article=${encodeURIComponent(clickedItem.id)}`;
      }
    }, []);

    return React.createElement(CircularCarousel, {
      items: normalizedItems,
      activeIndex: activeIdx,
      onActiveChange: setActiveIdx,
      onItemClick: handleItemClick,
      autoPlay: true,
      autoPlayInterval: 4200
    });
  }

  reactRoot.render(React.createElement(ControlledCircularCarousel));
  return () => reactRoot.unmount();
}
