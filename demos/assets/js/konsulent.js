// Mini util
const $ = (sel, ctx = document) => ctx.querySelector(sel);

// El-ref
const header = $('.site-header');
const nav = $('#primary-nav');
const toggle = $('.nav-toggle');

// Year
(function setYear(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// Header-høyde -> CSS var
function setHeaderVar(){
  const h = header?.offsetHeight || 64;
  document.documentElement.style.setProperty('--header-h', `${h}px`);
}
window.addEventListener('load', setHeaderVar);
window.addEventListener('resize', setHeaderVar);

// Mobilmeny
if (toggle && nav){
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape'){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
}

// Smooth scroll m/offset
function scrollWithOffset(id){
  const el = document.getElementById(id);
  if (!el) return;
  const headerH = header?.offsetHeight || 0;
  const y = el.getBoundingClientRect().top + window.pageYOffset - (headerH + 8);
  window.scrollTo({ top: y, behavior: 'smooth' });
}

// Intercept interne #lenker
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (!id) return;
  if (document.getElementById(id)){
    e.preventDefault();
    scrollWithOffset(id);
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded','false');
    history.pushState(null,'',`#${id}`);
  }
});

// On-load hash justering
window.addEventListener('load', () => {
  if (location.hash){
    const id = location.hash.replace('#','');
    setTimeout(() => scrollWithOffset(id), 50);
  }
});

// Aktiv lenke med IntersectionObserver
const sections = Array.from(document.querySelectorAll('section[id]'));
const menuLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
if ('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        menuLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-50% 0px -40% 0px', threshold: 0 });
  sections.forEach(sec => io.observe(sec));
}

// Kontaktform (demo)
const form = document.getElementById('contactForm');
if (form){
  const msg = form.querySelector('.form-msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()){
      msg.textContent = 'Vennligst fyll ut alle obligatoriske felter.';
      msg.style.color = '#f7c7c7';
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('Kontakt-forespørsel:', data); // Integrer e-post/webhook her
    msg.textContent = 'Takk! Vi svarer på e-post så snart vi kan.';
    msg.style.color = '#b6f3cf';
    form.reset();
  });
}
