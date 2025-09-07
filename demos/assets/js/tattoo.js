// Utilities
const $ = (sel, ctx = document) => ctx.querySelector(sel);

// Sticky header helpers
const header = $('.site-header');
const nav = $('#primary-nav');
const toggle = $('.nav-toggle');

function setYear(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}
setYear();

// Oppdater CSS-variabel med faktisk header-høyde
function setHeaderVar(){
  const h = header?.offsetHeight || 64;
  document.documentElement.style.setProperty('--header-h', `${h}px`);
}
window.addEventListener('load', setHeaderVar);
window.addEventListener('resize', setHeaderVar);


// Mobile menu toggle
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Smooth scroll with header offset
function scrollWithOffset(targetId){
  const el = document.getElementById(targetId);
  if (!el) return;

  const headerHeight = header?.offsetHeight || 0;
  const y = el.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 8);

  window.scrollTo({ top: y, behavior: 'smooth' });
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;

  const id = a.getAttribute('href').slice(1);
  if (!id) return;

  // Only handle internal anchor links that exist
  if (document.getElementById(id)) {
    e.preventDefault();
    scrollWithOffset(id);
    // Close mobile menu after click
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    history.pushState(null, '', `#${id}`);
  }
});

// On load with hash: adjust scroll to account for sticky header
window.addEventListener('load', () => {
  if (location.hash) {
    const id = location.hash.replace('#','');
    setTimeout(() => scrollWithOffset(id), 50);
  }
});

// Active link highlight (IntersectionObserver)
const sections = Array.from(document.querySelectorAll('section[id]'));
const menuLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        menuLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-50% 0px -40% 0px', threshold: 0 });

  sections.forEach(sec => io.observe(sec));
}

// Booking form (demo)
const form = document.getElementById('bookingForm');
if (form) {
  const msg = form.querySelector('.form-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      msg.textContent = 'Vennligst fyll ut alle obligatoriske felter.';
      msg.style.color = '#f7b2b2';
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('Booking request:', data); // her kan du integrere e-post/webhook
    msg.textContent = 'Takk! Vi tar kontakt på e-post så snart som mulig.';
    msg.style.color = '#9be49b';
    form.reset();
  });
}
