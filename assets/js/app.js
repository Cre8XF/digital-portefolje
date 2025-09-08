// ---------------------------------------------------------
// Mobilmeny
// ---------------------------------------------------------
const menu = document.querySelector('[data-menu]');
const btn  = document.querySelector('[data-menu-btn]');
btn?.addEventListener('click', () => {
  const open = menu?.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
});
document.addEventListener('click', e => {
  if (!menu || !btn) return;
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
  }
});

// ---------------------------------------------------------
// Aktiv lenke + aria-current
// ---------------------------------------------------------
(() => {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const match = (path === '' && href.endsWith('index.html')) || href.endsWith(path);
    if (match) {
      a.classList.add('active');
      a.setAttribute('aria-current','page');
    } else {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    }
  });
})();

// ---------------------------------------------------------
// Tema: lås til NEON (ingen switcher)
// ---------------------------------------------------------
(function () {
  const root = document.documentElement;
  const body = document.body;

  // Sett alltid neon (og lagre verdien hvis du bruker den andre steder)
  root.setAttribute('data-theme', 'neon');
  body.classList.add('theme-neon');
  try { localStorage.setItem('theme', 'neon'); } catch {}

  // Oppdater <meta name="theme-color"> med --bg fra CSS-variabler
  function setThemeColor(){
    const m = document.querySelector('meta[name="theme-color"]');
    if (!m) return;
    const val = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (val) m.setAttribute('content', val);
  }
  document.addEventListener('DOMContentLoaded', setThemeColor);
})();

// ---------------------------------------------------------
// Inkluder delte partials (footer) + to-top
// ---------------------------------------------------------
async function includePartials(){
  const nodes = document.querySelectorAll('[data-include]');
  await Promise.all([...nodes].map(async el => {
    try {
      const href = el.getAttribute('data-include');
      const res  = await fetch(href);
      if (res.ok) el.outerHTML = await res.text();
    } catch (err) { console.warn('Include failed:', err); }
  }));

  // Sett årstall etter at footer er i DOM
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Til toppen-knapp
  document.addEventListener('click', (e) => {
    const toTopBtn = e.target.closest('[data-to-top]');
    if (!toTopBtn) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
document.addEventListener('DOMContentLoaded', includePartials);
