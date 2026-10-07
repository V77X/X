/* ============================================
   NΞXUS — Interactions, Animations & Sound
   ============================================ */

(function () {
  'use strict';

  /* ---------- Resize-safe vh ---------- */
  function setVh() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }
  setVh();

  /* ---------- CINEMATIC OPENING ---------- */
  const opening = document.getElementById('opening');
  const openingLogo = document.getElementById('openingLogo');
  const openingSweep = document.getElementById('openingSweep');

  // Lock scroll during opening
  document.body.style.overflow = 'hidden';

  // Audio — unlock on first interaction (browser requirement)
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Signature "whoom-rise-impact" sound
  function playOpeningSound() {
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // Layer 1 — deep whoosh (low sub sweep)
    const whoosh = audioCtx.createOscillator();
    const whooshGain = audioCtx.createGain();
    whoosh.type = 'sine';
    whoosh.frequency.setValueAtTime(60, now);
    whoosh.frequency.exponentialRampToValueAtTime(180, now + 1.2);
    whooshGain.gain.setValueAtTime(0.0001, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.25, now + 0.2);
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    whoosh.connect(whooshGain).connect(audioCtx.destination);
    whoosh.start(now);
    whoosh.stop(now + 1.5);

    // Layer 2 — rising tone
    const rise = audioCtx.createOscillator();
    const riseGain = audioCtx.createGain();
    rise.type = 'triangle';
    rise.frequency.setValueAtTime(220, now + 0.1);
    rise.frequency.exponentialRampToValueAtTime(880, now + 1.3);
    riseGain.gain.setValueAtTime(0.0001, now + 0.1);
    riseGain.gain.exponentialRampToValueAtTime(0.12, now + 0.4);
    riseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    rise.connect(riseGain).connect(audioCtx.destination);
    rise.start(now + 0.1);
    rise.stop(now + 1.5);

    // Layer 3 — impact hit
    const impact = audioCtx.createOscillator();
    const impactGain = audioCtx.createGain();
    impact.type = 'square';
    impact.frequency.setValueAtTime(140, now + 1.2);
    impact.frequency.exponentialRampToValueAtTime(40, now + 1.6);
    impactGain.gain.setValueAtTime(0.0001, now + 1.2);
    impactGain.gain.exponentialRampToValueAtTime(0.2, now + 1.22);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    impact.connect(impactGain).connect(audioCtx.destination);
    impact.start(now + 1.2);
    impact.stop(now + 1.9);
  }

  // Opening timeline — runs automatically (no click needed)
  function runOpening() {
    // Step 1: Logo fade + scale in
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({
        onComplete: () => {
          opening.classList.add('done');
          setTimeout(() => {
            opening.style.display = 'none';
            document.body.style.overflow = '';
            startHero();
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          }, 400);
        }
      });

      tl.to(openingLogo, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out'
      })
      // brief hold
      .to(openingLogo, { duration: 0.3 })
      // pulse once (red glow builds)
      .to(openingLogo, {
        color: '#E50914',
        textShadow: '0 0 40px rgba(229,9,20,0.9)',
        duration: 0.4,
        ease: 'power2.in'
      })
      // Wipe sweep begins
      .add(() => {
        try { playOpeningSound(); } catch (e) {}
      })
      .to(openingSweep, {
        width: '100%',
        duration: 0.7,
        ease: 'power3.inOut'
      })
      // Logo fades as sweep passes
      .to(openingLogo, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      }, '-=0.5')
      // Sweep continues off to the right
      .to(openingSweep, {
        x: '100%',
        duration: 0.5,
        ease: 'power3.in'
      }, '-=0.2');
    } else {
      // Fallback if GSAP fails
      openingLogo.style.opacity = '1';
      setTimeout(() => {
        opening.style.opacity = '0';
        opening.style.transition = 'opacity 0.6s';
        setTimeout(() => {
          opening.style.display = 'none';
          document.body.style.overflow = '';
          startHero();
        }, 600);
      }, 1200);
    }
  }

  // Kick off opening after a tiny delay so fonts load
  window.addEventListener('load', () => {
    setTimeout(runOpening, 300);
  });

  // Also unlock audio on first user interaction anywhere
  ['click', 'touchstart', 'keydown', 'scroll'].forEach((ev) => {
    window.addEventListener(ev, ensureAudio, { once: true });
  });

  /* ---------- HERO INTRO ---------- */
  function startHero() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Line mask reveal
    tl.to('.hero-title .line-inner', {
      y: 0,
      duration: 1.1,
      stagger: 0.12
    })
    .to('.hero .hero-reveal', {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.1
    }, '-=0.7')
    .from('.hero-mockup', {
      opacity: 0,
      y: 60,
      duration: 1.2
    }, '-=0.8');
  }

  /* ---------- Lenis Smooth Scroll ---------- */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ---------- Custom Cursor ---------- */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');

  if (cursor && window.matchMedia('(hover: hover)').matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px)`;
    });

    function renderCursor() {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cursor.style.transform = `translate(${cx - 16}px, ${cy - 16}px)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    document.querySelectorAll(
      'a, button, .feature-card, .int-item, .price-card, .testimonial, .faq-item summary, .step'
    ).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  /* ---------- GSAP setup ---------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    /* — Section headings (.reveal) — */
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    /* — Features: staggered slide up + scale — */
    gsap.utils.toArray('.features-grid').forEach((grid) => {
      const cards = grid.querySelectorAll('.slide-up');
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 82%' }
      });
    });

    /* — How it works: slide from LEFT — */
    gsap.utils.toArray('.step.slide-left').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 1,
        delay: i * 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    /* — Stats: scale in + count up — */
    gsap.utils.toArray('.stat.scale-in').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    /* — Compare rows: slide from RIGHT + cascade — */
    gsap.utils.toArray('.compare-row.slide-right').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: i * 0.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.compare-table', start: 'top 82%' }
      });
    });

    /* — Testimonials: rotate in — */
    gsap.utils.toArray('.testimonial.rotate-in').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        rotate: 0,
        y: 0,
        duration: 1,
        delay: i * 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    /* — Integrations: pop in with random order — */
    const intItems = gsap.utils.toArray('.int-item.pop');
    const shuffled = [...intItems].sort(() => Math.random() - 0.5);
    gsap.to(shuffled, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.04,
      ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.integration-grid', start: 'top 85%' }
    });

    /* — Pricing: slide up, stagger — */
    gsap.utils.toArray('.price-card.slide-up').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    /* — FAQ: slide from LEFT — */
    gsap.utils.toArray('.faq-item.slide-left').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.9,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    /* — CTA block: scale in — */
    const ctaInner = document.querySelector('.cta-inner.scale-in');
    if (ctaInner) {
      gsap.to(ctaInner, {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: ctaInner, start: 'top 82%' }
      });
    }

    /* — CTA inner reveal children — */
    gsap.utils.toArray('.cta-inner .reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.cta-inner', start: 'top 80%' }
      });
    });

    /* — Number counters — */
    gsap.utils.toArray('.stat-num').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              const v = obj.val;
              if (target >= 1000) {
                el.textContent = Math.floor(v).toLocaleString();
              } else if (target % 1 !== 0) {
                el.textContent = v.toFixed(2);
              } else {
                el.textContent = Math.floor(v);
              }
            }
          });
        }
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (typeof gsap !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.25,
          y: y * 0.4,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  /* ---------- Nav scrolled state ---------- */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Parallax mockup ---------- */
  if (typeof gsap !== 'undefined') {
    const mockup = document.querySelector('.hero-mockup');
    if (mockup) {
      gsap.to(mockup, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }
  }

  /* ---------- FAQ single-open ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-item').forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- RESIZE HANDLER (fixes height issues) ---------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setVh();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      if (lenis && typeof lenis.resize === 'function') lenis.resize();
    }, 200);
  });

  /* ---------- Refresh on load ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 500);
  });

})();
