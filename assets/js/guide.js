// Kopier-tekst fra <pre> m/ data-copy="#id"
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  const sel = btn.getAttribute('data-copy');
  const el  = document.querySelector(sel);
  if (!el) return;
  try {
    await navigator.clipboard.writeText(el.textContent.trim());
    btn.textContent = 'Kopiert ✅';
    setTimeout(() => btn.textContent = 'Kopier', 1200);
  } catch {
    alert('Klarte ikke å kopiere – marker teksten og kopier manuelt.');
  }
});

// Skriv ut / lagre som PDF
document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
