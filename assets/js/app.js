// mobilmeny
const menu = document.querySelector('[data-menu]');
const btn  = document.querySelector('[data-menu-btn]');
btn?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
});
document.addEventListener('click', e => {
  if (!menu || !btn) return;
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
  }
});

// aktiv lenke + aria-current
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

// årstall i footer
document.getElementById('year')?.append(document.createTextNode(new Date().getFullYear()));

// --- Theme switcher (oppdatert) ---
(() => {
  const THEMES = ['dark','soft','neon','titan','pearl'];
  const KEY = 'cre8xf:theme';
  const root = document.documentElement; // for data-theme
  const body = document.body;            // for legacy .theme-*

  const sanitize = (name) => THEMES.includes(name) ? name : 'pearl';

  function applyTheme(name){
    const theme = sanitize(name);

    // Ny: bruk data-theme på :root (til CSS-variabler per tema)
    root.setAttribute('data-theme', theme);

    // Legacy: fjern/generer gamle .theme-* klasser (dark = ingen klasse)
    THEMES.forEach(t => body.classList.remove(`theme-${t}`));
    if (theme !== 'dark') body.classList.add(`theme-${theme}`);

    // Sync <select> om den finnes
    const sel = document.getElementById('themeSelect');
    if (sel && [...sel.options].some(o => o.value === theme)) {
      sel.value = theme;
    }
  }

  // Init: lagret valg → ellers 'pearl' (lys som standard)
  const current = localStorage.getItem(KEY) || 'pearl';
  applyTheme(current);

  // Lytt på select-endringer
  const select = document.getElementById('themeSelect');
  if (select){
    select.addEventListener('change', (e) => {
      const chosen = sanitize(e.target.value);
      localStorage.setItem(KEY, chosen);
      applyTheme(chosen);
    });
  }

  // Sync mellom faner
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) applyTheme(e.newValue);
  });
})();

// ----- Insert shared partials (footer) -----
async function includePartials(){
  const nodes = document.querySelectorAll('[data-include]');
  await Promise.all([...nodes].map(async el => {
    try {
      const href = el.getAttribute('data-include');
      const res  = await fetch(href);
      if (res.ok) el.outerHTML = await res.text();
    } catch (err) { console.warn('Include failed:', err); }
  }));
  // year + to-top handler after footer is in DOM
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-to-top]');
    if (!btn) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
document.addEventListener('DOMContentLoaded', includePartials);
