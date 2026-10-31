export function renderNavbar(container) {
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `
    <a class="nav__logo" href="#top">SAMUDRA</a>
    <div class="nav__links">
      <a class="nav__link nav__link--active" href="#top" data-target="top">Beranda</a>
      <a class="nav__link" href="#fitur" data-target="fitur">Fitur</a>
      <a class="nav__link" href="#cuaca" data-target="cuaca">Cuaca Maritim</a>
      <a class="nav__link" href="#simulasi" data-target="simulasi">Simulasi</a>
      <a class="nav__link" href="#mitigasi" data-target="mitigasi">Mitigasi</a>
      <a class="nav__link" href="#artikel" data-target="artikel">Berita</a>
    </div>
    <div class="nav__actions">
      <a class="nav__btn-admin" href="?page=admin" id="nav-btn-admin" title="Masuk ke Pusat Kendali Admin SAMUDRA">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>Admin</span>
      </a>
      <a class="nav__btn-apk" href="#unduh-apk" title="Unduh File APK Android">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Unduh APK</span>
      </a>
    </div>
  `;
  container.appendChild(nav);

  const adminBtn = nav.querySelector('#nav-btn-admin');
  if (adminBtn) {
    adminBtn.onclick = (e) => {
      if (typeof window.__navigateToAdmin === 'function') {
        e.preventDefault();
        window.__navigateToAdmin();
      }
    };
  }

  initScrollSpy(nav);
}

function initScrollSpy(nav) {
  const links = Array.from(nav.querySelectorAll('.nav__link'));

  function updateActive() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const docH = document.documentElement.scrollHeight;

    // Trackable key sections in order
    const sections = [
      { id: 'top', target: 'top' },
      { id: 'alur', target: 'fitur' },
      { id: 'fitur', target: 'fitur' },
      { id: 'cuaca', target: 'cuaca' },
      { id: 'simulasi', target: 'simulasi' },
      { id: 'mitigasi', target: 'mitigasi' },
      { id: 'artikel', target: 'artikel' }
    ];

    let currentTarget = 'top';

    // If reached bottom of document, highlight the last section (Berita)
    if (scrollY + windowH >= docH - 120) {
      currentTarget = 'artikel';
    } else {
      // Evaluate from bottom-most section upwards using accurate viewport coordinates
      const checkPosition = scrollY + 180;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY;
          if (checkPosition >= top) {
            currentTarget = sec.target;
            break;
          }
        }
      }
    }

    links.forEach(link => {
      if (link.dataset.target === currentTarget) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive, { passive: true });

  // Initial check after DOM paint
  setTimeout(updateActive, 100);

  // Smooth navigation on click with pixel-accurate offset
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.dataset.target;
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        const top = targetId === 'top' ? 0 : (el.getBoundingClientRect().top + window.scrollY - 70);
        window.scrollTo({ top, behavior: 'smooth' });

        links.forEach(l => l.classList.remove('nav__link--active'));
        link.classList.add('nav__link--active');
      }
    });
  });
}
