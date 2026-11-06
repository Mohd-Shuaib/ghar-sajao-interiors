// ================= Animations (Ghar Sajao Interiors) =================
(() => {
  const reduce = false; // animations always on (Windows 'Animation effects' off would otherwise disable them)

  // Preloader
  const pre = document.createElement('div');
  pre.className = 'preloader';
  pre.innerHTML = '<div class="preloader-inner"><img src="logo-final/ghar-sajao-logo-transparent.png" alt="Ghar Sajao Interiors"><div class="preloader-bar"><span></span></div></div>';
  document.body.prepend(pre);
  const hidePre = () => setTimeout(() => pre.classList.add('done'), 700);
  if (document.readyState === 'complete') hidePre(); else addEventListener('load', hidePre);
  setTimeout(() => pre.classList.add('done'), 4000); // never block longer than 4s

  // Scroll progress bar
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  // Back to top button
  const top = document.createElement('button');
  top.className = 'to-top'; top.setAttribute('aria-label', 'Back to top'); top.textContent = '↑';
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(top);

  // Hero: move background into its own layer for Ken Burns zoom, add scroll hint
  document.querySelectorAll('.slide').forEach(s => {
    const bg = document.createElement('div');
    bg.className = 'slide-bg';
    bg.style.setProperty('--img', s.style.getPropertyValue('--img'));
    s.prepend(bg);
  });
  const hero = document.querySelector('.hero');
  if (hero) { const h = document.createElement('div'); h.className = 'scroll-hint'; hero.appendChild(h); }

  // Reveal variants + stagger
  const add = (sel, cls) => document.querySelectorAll(sel).forEach(el => { el.classList.add('reveal', cls); });
  add('.about-media', 'from-left');
  add('.about-text', 'from-right');
  add('.contact-info', 'from-left');
  add('.contact-form', 'from-right');
  add('.cta-inner', 'zoom');
  add('.stats-grid > div', 'zoom');
  add('.trust-grid > div', 'flip');
  add('.gallery figure', 'zoom');
  add('.faq details', 'from-right');
  ['.features-grid', '.services-grid', '.blog-grid', '.process', '.gallery', '.stats-grid', '.trust-grid', '.faq'].forEach(g => {
    document.querySelectorAll(g + ' > *').forEach((el, i) => { el.style.transitionDelay = (i % 6) * 0.12 + 's'; el.style.animationDelay = (i % 6) * 0.12 + 0.3 + 's'; });
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  // clear stagger delay after reveal so hover effects feel instant
  document.addEventListener('transitionend', e => {
    if (e.target.classList && e.target.classList.contains('in') && e.propertyName === 'opacity') e.target.style.transitionDelay = '';
  });

  // Partner marquee
  const row = document.querySelector('.partner-row');
  if (row && !reduce) {
    const items = row.innerHTML;
    row.classList.add('marquee');
    row.innerHTML = `<div class="marquee-track">${items}</div><div class="marquee-track" aria-hidden="true">${items}</div>`;
  }

  // Gallery filter: fade out / in instead of instant hide
  const figs = document.querySelectorAll('#gallery figure');
  document.querySelectorAll('.filters button').forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    figs.forEach(fig => {
      const show = f === 'all' || fig.dataset.cat === f;
      if (show) {
        fig.classList.remove('hide');
        requestAnimationFrame(() => requestAnimationFrame(() => fig.classList.remove('fade-out')));
      } else {
        fig.classList.remove('hide'); // script.js hides instantly; animate instead
        fig.classList.add('fade-out');
        setTimeout(() => { if (fig.classList.contains('fade-out')) fig.classList.add('hide'); }, 450);
      }
    });
  }));

  // 3D tilt on cards (desktop pointers only)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    document.querySelectorAll('.feature, .service, .post').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('tilt');
        card.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; setTimeout(() => card.classList.remove('tilt'), 150); });
    });
  }

  // WhatsApp tooltip
  const wa = document.querySelector('.whatsapp');
  if (wa) {
    const tip = document.createElement('div');
    tip.className = 'wa-tip'; tip.textContent = 'Hi! Need help with your home? 👋';
    document.body.appendChild(tip);
    setTimeout(() => { tip.classList.add('show'); setTimeout(() => tip.classList.remove('show'), 6000); }, 5000);
  }

  // Scroll-driven effects: progress bar, back-to-top, about image parallax
  const frame = document.querySelector('.img-frame');
  let ticking = false;
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    top.classList.toggle('show', scrollY > 600);
    if (frame && !reduce) {
      const r = frame.getBoundingClientRect();
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      frame.style.transform = `translateY(${p * -30}px)`;
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
})();

// ================= Stronger scroll animations =================
(() => {
  if (window.gsap && window.ScrollTrigger && window.Lenis) return; // GSAP+Lenis version in smooth-scroll.js
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });

  // Word-by-word headings
  document.querySelectorAll('.section-head h2, .about-text h2, .contact-info h2, .cta-band h2').forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.innerHTML = words.map((w, i) => `<span class="w"><span style="transition-delay:${i * 0.07}s">${w}</span></span>`).join(' ');
    h.classList.add('split'); io.observe(h);
  });

  // Curtain wipe on images
  document.querySelectorAll('.service-img, .post-img').forEach((el, i) => {
    el.classList.add('wipe'); el.style.transitionDelay = (i % 3) * 0.15 + 's'; io.observe(el);
  });

  // Decorative shapes in sections
  const shapes = [['ring', '8%', '-60px'], ['dia', '75%', '92%'], ['dot', '40%', '-30px'], ['ring', '60%', '88%'], ['dia', '15%', '4%']];
  document.querySelectorAll('.section').forEach((sec, i) => {
    const [cls, top, left] = shapes[i % shapes.length];
    const d = document.createElement('div');
    d.className = 'deco ' + cls; d.style.top = top; d.style.left = left;
    d.dataset.speed = (i % 2 ? 0.25 : -0.2);
    sec.prepend(d);
  });

  // Process progress line
  const proc = document.querySelector('.process');
  let line;
  if (proc) { const l = document.createElement('div'); l.className = 'process-line'; l.innerHTML = '<i></i>'; proc.prepend(l); line = l.firstChild; }

  const heroContent = () => document.querySelector('.slide.active .slide-content');
  const hero = document.querySelector('.hero');
  const stats = document.querySelector('.stats');
  const figs = [...document.querySelectorAll('#gallery figure')];
  const decos = [...document.querySelectorAll('.deco')];
  const wide = () => innerWidth > 600;

  const progressOf = el => { // 0 when element enters bottom, 1 when it leaves top
    const r = el.getBoundingClientRect();
    return Math.min(Math.max((innerHeight - r.top) / (innerHeight + r.height), 0), 1);
  };

  let ticking = false;
  const update = () => {
    const y = scrollY;
    // Hero: content drifts up and fades, background darkens
    const hc = heroContent();
    if (hc && hero) {
      const p = Math.min(y / hero.offsetHeight, 1);
      hc.style.transform = `translateY(${p * 160}px)`;
      hc.style.opacity = 1 - p * 1.3;
    }
    // Stats band zooms slightly as it passes
    if (stats) { const p = progressOf(stats); stats.style.transform = `scale(${0.94 + Math.sin(p * Math.PI) * 0.06})`; }
    // Process line draws with scroll
    if (line) { const p = progressOf(proc); line.style.transform = `scaleX(${Math.min(Math.max((p - 0.15) / 0.45, 0), 1)})`; }
    // Gallery columns move at different speeds
    if (wide()) figs.forEach((f, i) => {
      if (!f.classList.contains('in')) return;
      const p = progressOf(f) - 0.5;
      f.style.translate = `0 ${p * (i % 3 === 1 ? -60 : 40)}px`;
    });
    // Decorative shapes float and spin
    decos.forEach(d => { const s = +d.dataset.speed; d.style.transform = `translateY(${y * s * 0.3}px) rotate(${y * s * 0.4}deg)`; });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  addEventListener('resize', update);
  update();
})();
