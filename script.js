// Mobile menu
const nav = document.getElementById('nav');
const toggle = document.getElementById('menuToggle');
toggle.addEventListener('click', () => { nav.classList.toggle('open'); toggle.classList.toggle('open'); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); toggle.classList.remove('open'); }));

// Header shadow on scroll
const header = document.querySelector('.header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });

// Hero slider
const slides = [...document.querySelectorAll('.slide')];
const dotsWrap = document.querySelector('.hero-dots');
let current = 0, timer;
slides.forEach((_, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', `Go to slide ${i + 1}`);
  b.addEventListener('click', () => go(i));
  dotsWrap.appendChild(b);
});
const dots = [...dotsWrap.children];
function go(i) {
  slides[current].classList.remove('active'); dots[current].classList.remove('active');
  current = (i + slides.length) % slides.length;
  slides[current].classList.add('active'); dots[current].classList.add('active');
  clearInterval(timer); timer = setInterval(() => go(current + 1), 6000);
}
document.querySelector('.hero-arrow.prev').addEventListener('click', () => go(current - 1));
document.querySelector('.hero-arrow.next').addEventListener('click', () => go(current + 1));
go(0);

// Reveal on scroll + counters
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const counterIO = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, target = +el.dataset.target, start = performance.now();
  const step = t => {
    const p = Math.min((t - start) / 1800, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step); counterIO.unobserve(el);
}), { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterIO.observe(el));

// Gallery filter
const filterBtns = document.querySelectorAll('.filters button');
const items = document.querySelectorAll('#gallery figure');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
  const f = btn.dataset.filter;
  items.forEach(it => it.classList.toggle('hide', f !== 'all' && it.dataset.cat !== f));
}));

// Hide broken images so the warm placeholder shows instead
document.querySelectorAll('#gallery img').forEach(img => img.addEventListener('error', () => { img.style.visibility = 'hidden'; }));

// Lightbox
const lb = document.getElementById('lightbox');
items.forEach(it => it.addEventListener('click', () => {
  lb.querySelector('img').src = it.querySelector('img').src.replace('w=800', 'w=1600');
  lb.querySelector('p').textContent = it.querySelector('strong').textContent;
  lb.classList.add('open');
}));
lb.addEventListener('click', e => { if (e.target !== lb.querySelector('img')) lb.classList.remove('open'); });

// Testimonials carousel
const track = document.getElementById('tTrack');
const cards = track.children;
let tIndex = 0;
const perView = () => innerWidth <= 600 ? 1 : innerWidth <= 1024 ? 2 : 3;
function moveT(dir) {
  const max = cards.length - perView();
  tIndex = tIndex + dir > max ? 0 : tIndex + dir < 0 ? max : tIndex + dir;
  const w = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
  track.style.transform = `translateX(${-tIndex * w}px)`;
}
document.getElementById('tNext').addEventListener('click', () => moveT(1));
document.getElementById('tPrev').addEventListener('click', () => moveT(-1));
setInterval(() => moveT(1), 7000);
addEventListener('resize', () => { tIndex = 0; track.style.transform = 'none'; });

// Lead modal (opens from buttons, and once automatically after 20s)
const modal = document.getElementById('leadModal');
const openModal = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); };
const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };
document.querySelectorAll('[data-open-modal]').forEach(b => b.addEventListener('click', openModal));
modal.addEventListener('click', e => { if (e.target === modal || e.target.matches('[data-close-modal]')) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); lb.classList.remove('open'); } });
try {
  if (!sessionStorage.getItem('leadShown')) setTimeout(() => { if (!modal.classList.contains('open')) openModal(); try { sessionStorage.setItem('leadShown', '1'); } catch {} }, 20000);
} catch {}

// Video button placeholder: swap in your YouTube link
document.querySelector('[data-video]').addEventListener('click', () => {
  window.open('https://www.youtube.com/', '_blank', 'noopener');
});

// Forms: every enquiry is saved to the Google Sheet (see google-sheet-script.txt).
// Paste the Web App URL from Apps Script between the quotes below.
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzuYULJaMikA9veIdvParqpdqvSVlyRmIu7VLGnhQ_PGFwAfQAp55aYVOuVQllefCeS/exec';
document.querySelectorAll('[data-form]').forEach(form => form.addEventListener('submit', e => {
  e.preventDefault();
  if (form.website && form.website.value) return; // honeypot
  const btn = form.querySelector('button[type="submit"]');
  const data = new URLSearchParams(new FormData(form));
  data.delete('website');
  data.set('whatsapp', form.whatsapp && form.whatsapp.checked ? 'Yes' : 'No');
  data.set('form', form.closest('.modal') ? 'Book design session (popup)' : 'Contact form');
  data.set('page', location.href);
  const done = () => { btn.disabled = false; form.querySelector('.form-note').hidden = false; form.reset(); };
  btn.disabled = true;
  if (!SHEET_URL) return done();
  fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: data }).then(done, done);
}));

document.getElementById('year').textContent = new Date().getFullYear();
