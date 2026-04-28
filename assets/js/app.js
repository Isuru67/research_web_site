/* ROBOARM — interactions & animations */
(function () {
  'use strict';

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    const pl = document.getElementById('preloader');
    if (pl) setTimeout(() => pl.classList.add('hide'), 600);
  });

  /* ---------- Scroll progress + back-to-top ---------- */
  const progressBar = document.getElementById('progressBar');
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (progressBar) progressBar.style.width = (scrolled * 100) + '%';
    const bt = document.getElementById('backTop');
    if (bt) bt.classList.toggle('show', h.scrollTop > 600);
    // Active nav
    const sections = document.querySelectorAll('section[id], header[id]');
    let active = '';
    sections.forEach(s => { if (s.getBoundingClientRect().top <= 120) active = s.id; });
    document.querySelectorAll('.dk-item, .tabbar a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href === '#' + active) a.classList.add('active');
      else a.classList.remove('active');
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Cursor ---------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursorDot');
    if (cursor && dot) {
      let mx = 0, my = 0, cx = 0, cy = 0;
      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      });
      const tick = () => {
        cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16;
        cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
        requestAnimationFrame(tick);
      };
      tick();
      document.querySelectorAll('a, button, [data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
      });
    }
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      let t0 = performance.now();
      const dur = 1200;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(end * ease);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countIO.observe(c));

  /* ---------- Dock popover ---------- */
  document.querySelectorAll('[data-popover]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.popover;
      document.querySelectorAll('.dk-popover').forEach(p => { if (p.id !== id) p.classList.remove('open'); });
      document.getElementById(id)?.classList.toggle('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.dk-popover').forEach(p => p.classList.remove('open'));
  });

  /* ---------- Smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const h = a.getAttribute('href');
      if (h.length > 1) {
        const t = document.querySelector(h);
        if (t) {
          e.preventDefault();
          document.querySelectorAll('.dk-popover').forEach(p => p.classList.remove('open'));
          window.scrollTo({ top: t.offsetTop - 64, behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- Tweaks panel ---------- */
  const tweaksBtn = document.getElementById('tweaksBtn');
  const tweaksPanel = document.getElementById('tweaksPanel');
  if (tweaksBtn && tweaksPanel) {
    tweaksBtn.addEventListener('click', (e) => {
      e.preventDefault();
      tweaksPanel.classList.toggle('open');
    });
  }

  // Accent tweaks
  document.querySelectorAll('[data-accent]').forEach(btn => {
    btn.addEventListener('click', () => {
      const map = {
        cyan: ['#00d4ff', '#0ea5e9'],
        violet: ['#7c3aed', '#6d28d9'],
        orange: ['#f97316', '#ea580c'],
        green: ['#10b981', '#059669']
      };
      const colors = map[btn.dataset.accent];
      if (colors) {
        document.documentElement.style.setProperty('--c-cyan', colors[0]);
        document.documentElement.style.setProperty('--c-cyan-2', colors[1]);
        document.documentElement.style.setProperty('--g-cyber', `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`);
        document.documentElement.style.setProperty('--shadow-glow', `0 0 40px ${colors[0]}40`);
      }
      document.querySelectorAll('[data-accent]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
    });
  });

  // Motion tweaks
  document.querySelectorAll('[data-motion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const map = { low: 0.2, med: 1, high: 1.6 };
      document.documentElement.style.setProperty('--motion', map[btn.dataset.motion] ?? 1);
      document.querySelectorAll('[data-motion]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      note.textContent = '✓ Message sent! We\'ll get back to you soon.';
      note.style.color = 'var(--c-green)';
      form.reset();
      setTimeout(() => { note.textContent = ''; }, 4000);
    });
  }

  /* ---------- Hero data chips floating animation stagger ---------- */
  document.querySelectorAll('.data-chip').forEach((chip, i) => {
    chip.style.animationDelay = (i * 0.4) + 's';
  });

})();
