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

// --- Theme switcher ---
(() => {
  const THEMES = ['dark','soft','neon'];
  const key = 'cre8xf:theme';
  const body = document.body;

  function applyTheme(name){
    THEMES.forEach(t => body.classList.remove(`theme-${t}`));
    if (name && name !== 'dark') body.classList.add(`theme-${name}`);
    const sel = document.getElementById('themeSelect');
    if (sel) sel.value = name || 'dark';
  }

  // init: lagret valg eller systempreferanse
  let current = localStorage.getItem(key);
  if (!current) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    current = prefersDark ? 'dark' : 'soft';
  }
  applyTheme(current);

  // bind select
  const select = document.getElementById('themeSelect');
  if (select){
    select.addEventListener('change', e => {
      const chosen = e.target.value;
      localStorage.setItem(key, chosen);
      applyTheme(chosen);
    });
  }
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
