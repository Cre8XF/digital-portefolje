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

// --- Theme switcher (Neon default, only Neon/Steel) ---
(() => {
  const THEMES = ['neon','steel'];
  const KEY = 'cre8xf:theme';
  const root = document.documentElement;
  const body  = document.body;

  // Gamle navn -> nye (hvis noe ligger i localStorage)
  const ALIAS = {
    light: 'neon', soft: 'neon', pearl: 'neon', dark: 'neon',
    titan: 'steel', steel: 'steel', neon: 'neon'
  };
  const sanitize = (n) => (THEMES.includes(n) ? n : (ALIAS[n] || 'neon'));

  function setThemeColor(){
    const m = document.querySelector('meta[name="theme-color"]');
    if (!m) return;
    const val = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (val) m.setAttribute('content', val);
  }

  function applyTheme(name){
    const theme = sanitize(name);
    root.setAttribute('data-theme', theme);
    THEMES.forEach(t => body.classList.remove(`theme-${t}`));
    body.classList.add(`theme-${theme}`);

    // Hold select i sync + fjern ukjente options
    const sel = document.getElementById('themeSelect');
    if (sel){
      [...sel.options].forEach(o => { if (!THEMES.includes(o.value)) o.remove(); });
      if ([...sel.options].some(o => o.value === theme)) sel.value = theme;
    }
    setThemeColor();
  }

  // Init (Neon default). Migrer gamle verdier om nødvendig.
  const saved = localStorage.getItem(KEY);
  const initial = sanitize(saved || 'neon');
  if (initial !== saved) localStorage.setItem(KEY, initial);
  applyTheme(initial);

  document.getElementById('themeSelect')?.addEventListener('change', e => {
    const chosen = sanitize(e.target.value);
    localStorage.setItem(KEY, chosen);
    applyTheme(chosen);
  });

  window.addEventListener('storage', e => { if (e.key === KEY) applyTheme(e.newValue); });
  document.addEventListener('DOMContentLoaded', setThemeColor);
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
