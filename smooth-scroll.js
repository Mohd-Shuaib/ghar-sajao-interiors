// =====================================================================
// Smooth scroll (Lenis) + section-by-section scroll animations (GSAP ScrollTrigger)
// Ghar Sajao Interiors
// =====================================================================
(() => {
  if (!(window.Lenis && window.gsap && window.ScrollTrigger)) return; // fallback: animations.js handles it

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('gsap-ready');
  const mobile = innerWidth <= 600;
  const D = mobile ? 0.6 : 1; // softer movement on phones

  // ---------- Lenis smooth scroll ----------
  const lenis = new Lenis({
    duration: 1.25,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
  });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links glide with Lenis (offset for sticky header)
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const header = document.querySelector('.header');
    lenis.scrollTo(target, { offset: -(header ? header.offsetHeight : 0), duration: 1.6 });
  }));
  const toTop = document.querySelector('.to-top');
  if (toTop) toTop.addEventListener('click', e => { e.stopImmediatePropagation(); lenis.scrollTo(0, { duration: 1.8 }); }, true);

  // Pause smooth scroll while the popup / lightbox is open
  ['leadModal', 'lightbox'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    new MutationObserver(() => {
      const anyOpen = document.querySelector('.modal.open, .lightbox.open');
      anyOpen ? lenis.stop() : lenis.start();
    }).observe(el, { attributes: true, attributeFilter: ['class'] });
  });

  // ---------- Hand the reveal work over from CSS to GSAP ----------
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.remove('reveal', 'from-left', 'from-right', 'zoom', 'flip', 'in');
    el.style.transitionDelay = '';
    el.style.animationDelay = '';
  });
  document.querySelectorAll('.wipe').forEach(el => el.classList.remove('wipe', 'in'));

  // Underline under section headings still draws via CSS
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.3 });
  document.querySelectorAll('.section-head').forEach(h => io.observe(h));

  // Split headings into words
  document.querySelectorAll('.section-head h2, .about-text h2, .contact-info h2, .cta-band h2').forEach(h => {
    if (h.querySelector('.w')) return;
    h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
  });

  const st = (trigger, start = 'top 82%') => ({ trigger, start, toggleActions: 'play none none reverse' });
  const ease = 'power3.out';

  // ---------- HERO: content drifts away, background zooms ----------
  gsap.to('.hero .slide-content', {
    y: 180 * D, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero .slide-bg', {
    scale: 1.15, yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero-dots, .scroll-hint', {
    opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '30% top', scrub: true },
  });

  // ---------- TRUST STRIP ----------
  gsap.from('.trust-grid > div', {
    y: 60 * D, opacity: 0, rotateX: -40, transformPerspective: 600, duration: 0.9, stagger: 0.12, ease,
    scrollTrigger: st('.trust', 'top 92%'),
  });

  // ---------- HEADINGS (every section): words rise up ----------
  document.querySelectorAll('.split, .section-head h2, .about-text h2, .contact-info h2, .cta-band h2').forEach(h => {
    h.classList.remove('split');
    const words = h.querySelectorAll('.w > span');
    if (!words.length) return;
    gsap.from(words, { yPercent: 115, rotate: 4, duration: 1, stagger: 0.07, ease: 'power4.out', scrollTrigger: st(h, 'top 88%') });
  });
  document.querySelectorAll('.section-head .eyebrow, .section-head p:not(.eyebrow)').forEach(el => {
    gsap.from(el, { y: 25, opacity: 0, duration: 0.8, ease, scrollTrigger: st(el, 'top 90%') });
  });

  // ---------- ABOUT ----------
  gsap.from('.about-media', { x: -140 * D, rotate: -4, opacity: 0, duration: 1.2, ease, scrollTrigger: st('#about') });
  gsap.from('.about-text > *:not(h2)', { x: 80 * D, opacity: 0, duration: 0.9, stagger: 0.1, ease, scrollTrigger: st('#about', 'top 75%') });
  gsap.from('.check-list li', { x: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease, scrollTrigger: st('.check-list', 'top 90%') });
  gsap.fromTo('.img-frame', { yPercent: 8 }, {
    yPercent: -8, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.from('.about-badge', { scale: 0, rotate: -20, duration: 0.9, ease: 'back.out(2)', scrollTrigger: st('.about-media', 'top 60%') });

  // ---------- FEATURES ----------
  gsap.from('.feature', {
    y: 90 * D, opacity: 0, rotateX: 25, transformPerspective: 900, transformOrigin: '50% 100%',
    duration: 1, stagger: { each: 0.1, grid: 'auto', from: 'start' }, ease,
    scrollTrigger: st('.features-grid'),
  });
  gsap.from('.feature .icon', { scale: 0, rotate: -90, duration: 0.8, stagger: 0.1, ease: 'back.out(2.2)', scrollTrigger: st('.features-grid', 'top 75%') });

  // ---------- STATS: parallax background + numbers pop ----------
  gsap.fromTo('.stats', { backgroundPosition: '50% 0%' }, {
    backgroundPosition: '50% 100%', ease: 'none',
    scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.from('.stats-grid > div', { scale: 0.5, opacity: 0, duration: 1, stagger: 0.12, ease: 'back.out(1.8)', scrollTrigger: st('.stats', 'top 80%') });

  // ---------- SERVICES: cards rise, photos open like curtains ----------
  gsap.from('.service', { y: 100 * D, opacity: 0, duration: 1, stagger: 0.12, ease, scrollTrigger: st('.services-grid') });
  gsap.fromTo('.service-img', { clipPath: 'inset(0 100% 0 0)' }, {
    clipPath: 'inset(0 0% 0 0)', duration: 1.3, stagger: 0.12, ease: 'power4.inOut', scrollTrigger: st('.services-grid', 'top 78%'),
  });
  gsap.from('.tags span', { y: 20, opacity: 0, scale: 0.8, duration: 0.5, stagger: 0.05, ease: 'back.out(2)', scrollTrigger: st('.tags', 'top 92%') });

  // ---------- PROCESS: gold line fills with scroll, steps pop ----------
  const proc = document.querySelector('.process');
  if (proc && !proc.querySelector('.process-line')) {
    const l = document.createElement('div'); l.className = 'process-line'; l.innerHTML = '<i></i>'; proc.prepend(l);
  }
  gsap.fromTo('.process-line i', { scaleX: 0 }, {
    scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.process', start: 'top 85%', end: 'bottom 55%', scrub: true },
  });
  gsap.from('.process li', { y: 80 * D, opacity: 0, scale: 0.9, duration: 0.9, stagger: 0.15, ease, scrollTrigger: st('.process') });
  gsap.from('.process li span', { scale: 0.2, duration: 0.8, stagger: 0.15, ease: 'back.out(2.5)', delay: 0.2, scrollTrigger: st('.process') });

  // ---------- GALLERY: tiles unmask, photos parallax ----------
  gsap.from('.filters button', { y: 30, opacity: 0, duration: 0.6, stagger: 0.08, ease, scrollTrigger: st('.filters', 'top 90%') });
  gsap.fromTo('#gallery figure', { clipPath: 'inset(100% 0% 0% 0%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, stagger: { each: 0.08, from: 'start' }, ease: 'power4.inOut',
    scrollTrigger: { trigger: '#gallery', start: 'top 85%', once: true },
    onComplete() { gsap.set('#gallery figure', { clearProps: 'clipPath' }); },
  });
  document.querySelectorAll('#gallery figure img').forEach((img, i) => {
    gsap.fromTo(img, { yPercent: -8, scale: 1.18 }, {
      yPercent: 8, scale: 1.18, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // ---------- TESTIMONIALS ----------
  gsap.from('.t-card', { x: 120 * D, opacity: 0, rotateY: -20, transformPerspective: 900, duration: 1, stagger: 0.12, ease, scrollTrigger: st('.testimonials') });
  gsap.from('.t-controls button', { scale: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(2)', scrollTrigger: st('.t-controls', 'top 95%') });

  // ---------- PARTNERS ----------
  gsap.from('.partners', { opacity: 0, y: 40, duration: 0.9, ease, scrollTrigger: st('.partners', 'top 92%') });

  // ---------- BLOG ----------
  gsap.from('.post', { y: 100 * D, opacity: 0, duration: 1, stagger: 0.15, ease, scrollTrigger: st('.blog-grid') });
  gsap.fromTo('.post-img', { clipPath: 'inset(0 0 100% 0)' }, {
    clipPath: 'inset(0 0 0% 0)', duration: 1.2, stagger: 0.15, ease: 'power4.inOut', scrollTrigger: st('.blog-grid', 'top 78%'),
  });

  // ---------- FAQ ----------
  gsap.from('.faq details', { x: 80 * D, opacity: 0, duration: 0.8, stagger: 0.1, ease, scrollTrigger: st('.faq') });

  // ---------- CTA BAND: grows into view ----------
  gsap.fromTo('.cta-band', { clipPath: 'inset(0 8% round 30px)' }, {
    clipPath: 'inset(0 0% round 0px)', ease: 'none',
    scrollTrigger: { trigger: '.cta-band', start: 'top bottom', end: 'top 45%', scrub: true },
  });
  gsap.from('.cta-band .btn, .cta-band p', { y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease, scrollTrigger: st('.cta-band', 'top 80%') });

  // ---------- CONTACT ----------
  gsap.from('.contact-info > *:not(h2)', { x: -80 * D, opacity: 0, duration: 0.9, stagger: 0.1, ease, scrollTrigger: st('#contact') });
  gsap.from('.contact-form', { x: 120 * D, opacity: 0, rotate: 2, duration: 1.1, ease, scrollTrigger: st('#contact') });
  gsap.from('.contact-form label, .contact-form .btn', { y: 25, opacity: 0, duration: 0.6, stagger: 0.07, ease, delay: 0.3, scrollTrigger: st('#contact') });

  // ---------- FOOTER ----------
  gsap.from('.footer-grid > div', { y: 60, opacity: 0, duration: 0.9, stagger: 0.12, ease, scrollTrigger: st('.footer', 'top 92%') });

  // ---------- Floating decorative shapes (parallax per section) ----------
  const shapes = [['ring', '8%', '-60px'], ['dia', '75%', '92%'], ['dot', '40%', '-30px'], ['ring', '60%', '88%'], ['dia', '15%', '4%']];
  document.querySelectorAll('.section').forEach((sec, i) => {
    if (sec.querySelector(':scope > .deco')) return;
    const [cls, top, left] = shapes[i % shapes.length];
    const d = document.createElement('div');
    d.className = 'deco ' + cls; d.style.top = top; d.style.left = left;
    sec.prepend(d);
    gsap.fromTo(d, { y: -120, rotate: 0 }, {
      y: 160, rotate: i % 2 ? 180 : -180, ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
  });

  // Recalculate once images/fonts are in
  addEventListener('load', () => ScrollTrigger.refresh());
})();
