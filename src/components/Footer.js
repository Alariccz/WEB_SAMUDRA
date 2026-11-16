/**
 * Clean Minimal Dark-Glass Footer for SAMUDRA.3D
 * Airy layout with essential navigation, official data sources,
 * clean inline emergency numbers, and the signature SAMUDRA watermark.
 */
export function getSamudraFooterHTML({ isArticlePage = false } = {}) {
  const linkPrefix = isArticlePage ? '/' : '';
  return `
    <div class="sfooter__glow" aria-hidden="true"></div>
    <div class="sfooter__inner">
      <div class="sfooter__top">
        <!-- Left: Brand & Status -->
        <div class="sfooter__brand">
          <a href="${linkPrefix}#top" class="sfooter__logo" data-footer-top>
            <span class="sfooter__logo-text">SAMUDRA</span>
            <span class="sfooter__logo-badge">3D</span>
          </a>
          <p class="sfooter__desc">
            Platform pemodelan gelombang 3D, pantauan cuaca maritim, dan kesiapsiagaan tsunami pesisir berbasis telemetri real-time.
          </p>
          <div class="sfooter__status" role="status">
            <span class="sfooter__status-dot"></span>
            <span>Telemetri BMKG &amp; InaTEWS Aktif</span>
          </div>
        </div>

        <!-- Right: Clean 3-Column Links -->
        <div class="sfooter__nav-cols">
          <div class="sfooter__col">
            <h4 class="sfooter__heading">Navigasi</h4>
            <ul class="sfooter__list">
              <li><a href="${linkPrefix}#top" class="sfooter__link" data-footer-sec="top">Beranda</a></li>
              <li><a href="${linkPrefix}#fitur" class="sfooter__link" data-footer-sec="fitur">Fitur</a></li>
              <li><a href="${linkPrefix}#cuaca" class="sfooter__link" data-footer-sec="cuaca">Cuaca Maritim</a></li>
              <li><a href="${linkPrefix}#simulasi" class="sfooter__link" data-footer-sec="simulasi">Simulasi</a></li>
              <li><a href="${linkPrefix}#mitigasi" class="sfooter__link" data-footer-sec="mitigasi">Mitigasi</a></li>
              <li><a href="${linkPrefix}#artikel" class="sfooter__link" data-footer-sec="artikel">Berita</a></li>
            </ul>
          </div>

          <div class="sfooter__col">
            <h4 class="sfooter__heading">Sumber Data</h4>
            <ul class="sfooter__list">
              <li>
                <a href="https://inatews.bmkg.go.id" target="_blank" rel="noopener" class="sfooter__link">
                  <span>InaTEWS BMKG</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
                </a>
              </li>
              <li>
                <a href="https://www.bmkg.go.id" target="_blank" rel="noopener" class="sfooter__link">
                  <span>Portal BMKG</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
                </a>
              </li>
              <li>
                <a href="https://bnpb.go.id" target="_blank" rel="noopener" class="sfooter__link">
                  <span>BNPB Indonesia</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
                </a>
              </li>
              <li>
                <a href="https://earthquake.usgs.gov" target="_blank" rel="noopener" class="sfooter__link">
                  <span>USGS Earthquake</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
                </a>
              </li>
            </ul>
          </div>

          <div class="sfooter__col">
            <h4 class="sfooter__heading">Kontak Darurat</h4>
            <ul class="sfooter__list">
              <li>
                <a href="tel:115" class="sfooter__link sfooter__link--hotline">
                  <span>BASARNAS</span>
                  <span class="sfooter__hotline-num">115</span>
                </a>
              </li>
              <li>
                <a href="tel:112" class="sfooter__link sfooter__link--hotline">
                  <span>Darurat Nasional</span>
                  <span class="sfooter__hotline-num">112</span>
                </a>
              </li>
              <li>
                <a href="tel:117" class="sfooter__link sfooter__link--hotline">
                  <span>Pusdalops BNPB</span>
                  <span class="sfooter__hotline-num">117</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="sfooter__bottom">
        <p class="sfooter__copy">
          &copy; ${new Date().getFullYear()} SAMUDRA.3D &mdash; Sistem Informasi Kesiapsiagaan Tsunami Pesisir
        </p>
        <button type="button" class="sfooter__top-btn" data-footer-top aria-label="Kembali ke atas">
          <span>Kembali ke atas</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m18 15-6-6-6 6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Subtle Giant Branded Watermark -->
    <div class="sfooter__watermark" aria-hidden="true">SAMUDRA</div>
  `;
}

export function attachFooterEvents(footerEl, { onNavigateHome } = {}) {
  if (!footerEl) return;

  footerEl.querySelectorAll('[data-footer-top]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      if (typeof onNavigateHome === 'function') {
        onNavigateHome();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  if (typeof onNavigateHome === 'function') {
    footerEl.querySelectorAll('[data-footer-sec]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const sec = link.getAttribute('data-footer-sec');
        onNavigateHome();
        if (sec) {
          setTimeout(() => {
            const el = document.getElementById(sec);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 60);
        }
      });
    });
  }
}
