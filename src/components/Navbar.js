export function renderNavbar(container) {
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `
    <a class="nav__logo" href="#top">TSUNAMI</a>
    <div class="nav__links">
      <a class="nav__link nav__link--active" href="#top" data-target="top">Beranda</a>
      <a class="nav__link" href="#fitur" data-target="fitur">Fitur</a>
      <a class="nav__link" href="#simulasi" data-target="simulasi">Simulasi</a>
      <a class="nav__link" href="#mitigasi" data-target="mitigasi">Mitigasi</a>
      <a class="nav__link" href="#artikel" data-target="artikel">Berita</a>
    </div>
    <a class="nav__cta" href="#akses">Buka aplikasi &nbsp;→</a>
  `;
  container.appendChild(nav);

  initScrollSpy(nav);
}

function initScrollSpy(nav) {
  const links = Array.from(nav.querySelectorAll('.nav__link'));

  function updateActive() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const docH = document.documentElement.scrollHeight;

    // Ordered sections to track
    const sections = [
      { id: 'top', target: 'top' },
      { id: 'alur', target: 'fitur' },     // Alur leads directly into Fitur
      { id: 'fitur', target: 'fitur' },
      { id: 'simulasi', target: 'simulasi' },
      { id: 'mitigasi', target: 'mitigasi' },
      { id: 'artikel', target: 'artikel' },
      { id: 'akses', target: 'artikel' },
    ];

    let currentTarget = 'top';

    // If near bottom of page, highlight artikel
    if (scrollY + windowH >= docH - 80) {
      currentTarget = 'artikel';
    } else {
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = sec.id === 'top' ? 0 : el.offsetTop - 140;
          if (scrollY >= top) {
            currentTarget = sec.target;
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

  // Initial check
  setTimeout(updateActive, 100);

  // Smooth navigation on click
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.dataset.target;
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        const top = targetId === 'top' ? 0 : el.offsetTop - 80;
        window.scrollTo({ top, behavior: 'smooth' });

        links.forEach(l => l.classList.remove('nav__link--active'));
        link.classList.add('nav__link--active');
      }
    });
  });
}
