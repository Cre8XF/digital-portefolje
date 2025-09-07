// ---------- Scroll reveal ----------
(function(){
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || !els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target) }});
  }, { rootMargin:'-10% 0% -10% 0%' });
  els.forEach(el => io.observe(el));
})();

// ---------- Magnetic buttons ----------
(function(){
  const mags = document.querySelectorAll('.btn.magnetic');
  mags.forEach(btn => {
    const str = 18; // styrke
    let raf;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width/2);
      const y = e.clientY - (r.top + r.height/2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        btn.style.transform = `translate(${x/str}px, ${y/str}px)`;
      });
    });
    ['mouseleave','blur'].forEach(ev => btn.addEventListener(ev, ()=>{
      btn.style.transform = 'translate(0,0)';
    }));
  });
})();

// ---------- Cursor glow ----------
(function(){
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let x = innerWidth/2, y = innerHeight/2;
  let tx = x, ty = y;
  const damp = .12;

  function loop(){
    x += (tx - x) * damp;
    y += (ty - y) * damp;
    glow.style.setProperty('--x', `${x}px`);
    glow.style.setProperty('--y', `${y}px`);
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive:true });
})();
