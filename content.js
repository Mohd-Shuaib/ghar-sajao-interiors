// ===== Packages estimator, area tabs, extra section animations =====
(() => {
  // ---- Estimator (indicative ₹ lakh; edit these numbers to match your real pricing)
  const BASE = { full: { 1: 3.6, 2: 4.9, 3: 6.8, 4: 9.2, 5: 13 }, modular: { 1: 1.9, 2: 2.8, 3: 3.8, 4: 5, 5: 7 }, kitchen: { 1: 1.4, 2: 1.6, 3: 1.9, 4: 2.3, 5: 3 } };
  const form = document.getElementById('estForm');
  const out = document.getElementById('estOut');
  const state = { bhk: '2', scope: 'full', tier: '1.4' };
  const fmt = n => (n >= 10 ? n.toFixed(0) : n.toFixed(1)).replace(/\.0$/, '');
  let shown = 0;
  function calc() {
    const v = BASE[state.scope][state.bhk] * parseFloat(state.tier);
    const lo = v * 0.9, hi = v * 1.15;
    const target = hi;
    // count-up animation of the upper value
    const start = performance.now(), from = shown || lo;
    const step = t => {
      const p = Math.min((t - start) / 500, 1), cur = from + (target - from) * (1 - Math.pow(1 - p, 3));
      out.textContent = `₹${fmt(lo)} – ${fmt(cur)} Lakh`;
      if (p < 1) requestAnimationFrame(step); else shown = target;
    };
    requestAnimationFrame(step);
  }
  if (form) {
    form.querySelectorAll('.chips').forEach(group => group.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      group.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on');
      state[group.dataset.name] = b.dataset.v; calc();
    }));
    calc();
    // "Get exact quote" opens WhatsApp with the selection pre-filled
    const qb = form.querySelector('.est-result .btn');
    qb.removeAttribute('data-open-modal');
    qb.addEventListener('click', () => {
      const label = g => form.querySelector(`.chips[data-name="${g}"] .on`).textContent;
      const msg = `Hi Ghar Sajao Interiors! I'd like a quote for ${label('bhk')}, ${label('scope')}, ${label('tier')} finish. Calculator estimate: ${out.textContent}.`;
      const wa = document.querySelector('.whatsapp');
      const num = wa ? (wa.href.match(/wa\.me\/(\d+)/) || [])[1] : '';
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }

  // ---- Area tabs
  document.querySelectorAll('.area-tabs button').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.area-tabs button').forEach(b => b.classList.toggle('on', b === btn));
    document.querySelectorAll('.area-panel').forEach(p => {
      const on = p.dataset.city === btn.dataset.city;
      p.classList.toggle('on', on);
      if (on) p.querySelectorAll('span').forEach((s, i) => { s.style.animation = 'none'; s.offsetHeight; s.style.animation = ''; s.style.animationDelay = i * 0.04 + 's'; });
    });
  }));
  document.querySelectorAll('.area-panel span').forEach((s, i) => s.style.animationDelay = i * 0.04 + 's');

  // ---- Scroll animations for the new sections (GSAP + Lenis)
  if (!(window.gsap && window.ScrollTrigger && document.documentElement.classList.contains('gsap-ready'))) return;
  document.querySelectorAll('#packages .reveal, #ncr .reveal, #areas .reveal').forEach(el => el.classList.remove('reveal', 'in'));
  const st = (trigger, start = 'top 82%') => ({ trigger, start, toggleActions: 'play none none reverse' });
  const ease = 'power3.out';
  // (section headings in these sections are already animated by smooth-scroll.js)
  gsap.from('.pkg', { y: 120, opacity: 0, rotateX: 20, transformPerspective: 1000, duration: 1.1, stagger: 0.15, ease, scrollTrigger: st('.pkg-grid') });
  gsap.from('.pkg li', { x: -20, opacity: 0, duration: 0.5, stagger: 0.04, ease, delay: 0.4, scrollTrigger: st('.pkg-grid') });
  gsap.from('.estimator', { y: 80, scale: 0.94, opacity: 0, duration: 1.1, ease, scrollTrigger: st('.estimator') });
  gsap.from('.est-step, .est-result', { x: 60, opacity: 0, duration: 0.8, stagger: 0.12, ease, delay: 0.3, scrollTrigger: st('.estimator') });
  gsap.from('.ncr-card', { y: 90, opacity: 0, duration: 1, stagger: { each: 0.1, grid: 'auto' }, ease, scrollTrigger: st('.ncr-grid') });
  gsap.from('.ncr-ico', { scale: 0, rotate: -120, duration: 0.8, stagger: 0.1, ease: 'back.out(2)', delay: 0.2, scrollTrigger: st('.ncr-grid') });
  gsap.from('.assure-col', { y: 80, opacity: 0, duration: 1, stagger: 0.15, ease, scrollTrigger: st('.assure') });
  gsap.from('.pay-steps li', { x: -40, opacity: 0, duration: 0.6, stagger: 0.12, ease, delay: 0.3, scrollTrigger: st('.assure') });
  gsap.from('.area-tabs button', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease, scrollTrigger: st('.area-tabs', 'top 90%') });
  gsap.fromTo('.city-card', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, stagger: 0.15, ease: 'power4.inOut', scrollTrigger: st('.city-cards') });
  gsap.utils.toArray('.city-card').forEach(c => gsap.fromTo(c, { backgroundPosition: '50% 0%' }, { backgroundPosition: '50% 100%', ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } }));
  ScrollTrigger.refresh();
})();
