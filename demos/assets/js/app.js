// app.js – én sannhet (mobilmeny + solid header)
(() => {
  const nav  = document.querySelector('.nav');
  const btn  = document.querySelector('[data-menu-btn]') || document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  /* ---------- Mobilmeny ---------- */
  function openMenu(){
    if (!nav) return;
    nav.classList.add('is-open');
    document.body.classList.add('menu-open');
    btn?.setAttribute('aria-expanded','true');
  }
  function closeMenu(){
    if (!nav) return;
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    btn?.setAttribute('aria-expanded','false');
  }
  function toggleMenu(){
    nav?.classList.contains('is-open') ? closeMenu() : openMenu();
  }
  btn?.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); });

  // Lukk når man klikker lenke i menyen
  menu?.addEventListener('click', (e) => {
    const a = e.target?.closest('a');
    if (a) closeMenu();
  });

  // Lukk på ESC (accessibility enhancement)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      btn?.focus(); // Return focus to menu button for better keyboard navigation
    }
  });

  // Reset til desktop når >900px
  const mq = window.matchMedia('(min-width: 901px)');
  const onMQ = (e) => { if (e.matches) closeMenu(); };
  mq.addEventListener ? mq.addEventListener('change', onMQ) : mq.addListener(onMQ);

  /* ---------- Solid header ---------- */
  const getNavH = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 72;
  };

  // Hva ligger under topplinjen av viewport? (bruk piksel-sjekk – stabilt)
  const isOverLightSection = () => {
    const y = getNavH() + 1;
    const el = document.elementFromPoint(10, y);
    if (!el) return false;
    const sec = el.closest?.('section, header, footer');
    if (!sec) return false;
    return sec.classList.contains('section-plain') || sec.classList.contains('section-alt') || sec.classList.contains('demo-neutral');
  };

  const navSolidCheck = () => {
    if (!nav) return;
    const scrolled  = (window.scrollY || document.documentElement.scrollTop) > 2;
    const overLight = isOverLightSection();
    // På mobil/nettbrett: solid hvis scrollet eller over lyse seksjoner.
    // På desktop har CSS allerede tvunget solid – dette er bare ekstra sikring.
    if (scrolled || overLight) nav.classList.add('nav--solid');
    else nav.classList.remove('nav--solid');
  };
  // Marker at vi står på toppen av hero (kun for en subtil transparent-effekt på desktop)
const toggleHeroTop = () => {
  const y = window.scrollY || document.documentElement.scrollTop;
  document.documentElement.classList.toggle('at-hero-top', y < 8);
};
toggleHeroTop();
window.addEventListener('scroll', toggleHeroTop, { passive: true });


  navSolidCheck();
  window.addEventListener('scroll',  navSolidCheck, { passive: true });
  window.addEventListener('resize',  navSolidCheck, { passive: true });
  window.addEventListener('load',    navSolidCheck);
  window.addEventListener('hashchange', () => setTimeout(navSolidCheck, 60));

  /* ---------- Demo-skjema ---------- */
  const wireDemoForm = (id, msg) => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', e => {
      if (form.dataset.netlify || form.getAttribute('action')) return;
      e.preventDefault();
      alert(msg);
      form.reset();
    });
  };
  wireDemoForm('booking-form', 'Forespørsel sendt (demo).');
})();
