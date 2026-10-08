/* ============================================
   NΞXUS — Full Version with Safe Opening
   ============================================ */

(function () {
  'use strict';

  /* ---------- Viewport height ---------- */
  function setVh() {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  }
  setVh();

  /* ---------- CINEMATIC OPENING (SAFE) ---------- */
  var opening = document.getElementById('opening');
  var openingLogo = document.getElementById('openingLogo');
  var openingSweep = document.getElementById('openingSweep');
  var openingDone = false;

  // HARD SAFETY: after 2.5s, force-hide opening no matter what
  var safetyTimer = setTimeout(function () {
    if (opening && !openingDone) {
      opening.style.transition = 'opacity 0.4s';
      opening.style.opacity = '0';
      setTimeout(function () {
        opening.style.display = 'none';
        openingDone = true;
        document.body.style.overflow = '';
        startHero();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }, 400);
    }
  }, 2500);

  // Audio unlock
  var audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  // Sound
  function playOpeningSound() {
    ensureAudio();
    if (!audioCtx) return;
    var now = audioCtx.currentTime;

    var whoosh = audioCtx.createOscillator();
    var whooshGain = audioCtx.createGain();
    whoosh.type = 'sine';
    whoosh.frequency.setValueAtTime(60, now);
    whoosh.frequency.exponentialRampToValueAtTime(180, now + 1.0);
    whooshGain.gain.setValueAtTime(0.0001, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.2, now + 0.2);
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    whoosh.connect(whooshGain).connect(audioCtx.destination);
    whoosh.start(now); whoosh.stop(now + 1.3);

    var rise = audioCtx.createOscillator();
    var riseGain = audioCtx.createGain();
    rise.type = 'triangle';
    rise.frequency.setValueAtTime(220, now + 0.1);
    rise.frequency.exponentialRampToValueAtTime(880, now + 1.1);
    riseGain.gain.setValueAtTime(0.0001, now + 0.1);
    riseGain.gain.exponentialRampToValueAtTime(0.1, now + 0.3);
    riseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    rise.connect(riseGain).connect(audioCtx.destination);
    rise.start(now + 0.1); rise.stop(now + 1.3);
  }

  // Run opening (only if GSAP available, else skip)
  function runOpening() {
    if (!opening || typeof gsap === 'undefined') {
      if (opening) opening.style.display = 'none';
      clearTimeout(safetyTimer);
      document.body.style.overflow = '';
      startHero();
      return;
    }
    document.body.style.overflow = 'hidden';

    var tl = gsap.timeline({
      onComplete: function () {
        openingDone = true;
        clearTimeout(safetyTimer);
        opening.style.display = 'none';
        document.body.style.overflow = '';
        startHero();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }
    });

    tl.to(openingLogo, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' })
      .to(openingLogo, { duration: 0.2 })
      .to(openingLogo, { color: '#E50914', textShadow: '0 0 40px rgba(229,9,20,0.9)', duration: 0.35, ease: 'power2.in' })
      .add(function () { try { playOpeningSound(); } catch (e) {} })
      .to(openingSweep, { width: '100%', duration: 0.6, ease: 'power3.inOut' })
      .to(openingLogo, { opacity: 0, duration: 0.25 }, '-=0.4')
      .to(openingSweep, { x: '100%', duration: 0.45, ease: 'power3.in' }, '-=0.15');
  }

  // Kick off on load
  window.addEventListener('load', function () {
    setTimeout(runOpening, 200);
  });

  // Unlock audio on first interaction
  ['click', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, ensureAudio, { once: true });
  });

  /* ---------- HERO INTRO ---------- */
  function startHero() {
    if (typeof gsap === 'undefined') {
      var lines = document.querySelectorAll('.hero-title .line-inner');
      for (var i = 0; i < lines.length; i++) lines[i].style.transform = 'none';
      var reveals = document.querySelectorAll('.hero-reveal');
      for (var j = 0; j < reveals.length; j++) { reveals[j].style.opacity = '1'; reveals[j].style.transform = 'none'; }
      var mock = document.querySelector('.hero-mockup');
      if (mock) { mock.style.opacity = '1'; mock.style.transform = 'none'; }
      return;
    }
    gsap.to('.hero-title .line-inner', { y: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out' });
    gsap.to('.hero .hero-reveal', { opacity: 1, y: 0, duration: 1, stagger: 0.1, delay: 0.3, ease: 'power3.out' });
    gsap.from('.hero-mockup', { opacity: 0, y: 60, duration: 1.2, delay: 0.6, ease: 'power3.out' });
  }

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true, smoothTouch: false });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* ---------- Custom cursor ---------- */
  var cursor = document.getElementById('cursor');
  var cursorDot = document.getElementById('cursor-dot');
  if (cursor && window.matchMedia('(hover: hover)').matches) {
    var mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = 'translate(' + mx + 'px, ' + my + 'px)';
    });
    (function render() {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cursor.style.transform = 'translate(' + (cx - 16) + 'px, ' + (cy - 16) + 'px)';
      requestAnimationFrame(render);
    })();
    var hovers = document.querySelectorAll('a, button, .feature-card, .int-item, .price-card, .testimonial, .step');
    for (var i = 0; i < hovers.length; i++) {
      (function (el) {
        el.addEventListener('mouseenter', function () { cursor.classList.add('hover'); });
        el.addEventListener('mouseleave', function () { cursor.classList.remove('hover'); });
      })(hovers[i]);
    }
  }

  /* ---------- TEXT SCRAMBLE ---------- */
  function scramble(el, finalText, duration) {
    duration = duration || 1200;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#________';
    var start = performance.now();
    var len = finalText.length;

    function frame(now) {
      var t = Math.min((now - start) / duration, 1);
      var revealed = Math.floor(t * len);
      var out = '';
      for (var i = 0; i < len; i++) {
        if (i < revealed) out += finalText[i];
        else if (finalText[i] === ' ') out += ' ';
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = finalText;
    }
    requestAnimationFrame(frame);
  }

  // Apply scramble to nav logo on hover
  var navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    var originalText = navLogo.textContent;
    navLogo.addEventListener('mouseenter', function () {
      scramble(navLogo, originalText, 500);
    });
  }

  /* ---------- GSAP scroll animations ---------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    gsap.utils.toArray('.slide-up').forEach(function (el, i) {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.9, delay: i * 0.06, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    gsap.utils.toArray('.slide-left').forEach(function (el, i) {
      gsap.to(el, { opacity: 1, x: 0, duration: 0.9, delay: i * 0.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    gsap.utils.toArray('.slide-right').forEach(function (el, i) {
      gsap.to(el, { opacity: 1, x: 0, duration: 0.8, delay: i * 0.05, ease: 'power3.out', scrollTrigger: { trigger: '.compare-table', start: 'top 82%' } });
    });

    gsap.utils.toArray('.rotate-in').forEach(function (el, i) {
      gsap.to(el, { opacity: 1, rotate: 0, y: 0, duration: 1, delay: i * 0.12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    var pops = gsap.utils.toArray('.pop');
    pops.sort(function () { return Math.random() - 0.5; });
    gsap.to(pops, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.04, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.integration-grid', start: 'top 85%' } });

    gsap.utils.toArray('.scale-in').forEach(function (el) {
      gsap.to(el, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // Number counters
    gsap.utils.toArray('.stat-num').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: target, duration: 2, ease: 'power2.out',
            onUpdate: function () {
              if (target >= 1000) el.textContent = Math.floor(obj.val).toLocaleString();
              else if (target % 1 !== 0) el.textContent = obj.val.toFixed(2);
              else el.textContent = Math.floor(obj.val);
            }
          });
        }
      });
    });

    /* ---------- PARALLAX ---------- */
    var mockup = document.querySelector('.hero-mockup');
    if (mockup) {
      gsap.to(mockup, { yPercent: -15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    }

    var heroGlow = document.querySelector('.hero-glow');
    if (heroGlow) {
      gsap.to(heroGlow, { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    }

    /* ---------- HORIZONTAL SCROLL SHOWCASE ---------- */
    var hScrollSection = document.querySelector('.h-scroll');
    if (hScrollSection) {
      var hTrack = hScrollSection.querySelector('.h-track');
      if (hTrack) {
        var cards = hTrack.querySelectorAll('.h-card');
        var totalScroll = hTrack.scrollWidth - window.innerWidth;

        gsap.to(hTrack, {
          x: -totalScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: hScrollSection,
            start: 'top top',
            end: '+' + totalScroll,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      }
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (typeof gsap !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
    var mags = document.querySelectorAll('.magnetic');
    for (var i = 0; i < mags.length; i++) {
      (function (btn) {
        btn.addEventListener('mousemove', function (e) {
          var rect = btn.getBoundingClientRect();
          gsap.to(btn, {
            x: (e.clientX - rect.left - rect.width / 2) * 0.25,
            y: (e.clientY - rect.top - rect.height / 2) * 0.4,
            duration: 0.5, ease: 'power2.out'
          });
        });
        btn.addEventListener('mouseleave', function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        });
      })(mags[i]);
    }
  }

  /* ---------- Nav scrolled state ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });
  }

  /* ---------- Anchor smooth scroll ---------- */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var i = 0; i < anchors.length; i++) {
    (function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
        else target.scrollIntoView({ behavior: 'smooth' });
      });
    })(anchors[i]);
  }

  /* ---------- FAQ single open ---------- */
  var faqs = document.querySelectorAll('.faq-item');
  for (var i = 0; i < faqs.length; i++) {
    (function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) {
          var others = document.querySelectorAll('.faq-item');
          for (var j = 0; j < others.length; j++) if (others[j] !== item) others[j].open = false;
        }
      });
    })(faqs[i]);
  }

  /* ---------- DARK/LIGHT TOGGLE ---------- */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    var savedTheme = localStorage.getItem('nexus-theme');
    if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('nexus-theme', next);
      themeToggle.textContent = next === 'light' ? '☾' : '☀';
    });

    themeToggle.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '☾' : '☀';
  }

  /* ---------- Resize handler ---------- */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      setVh();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      if (lenis && lenis.resize) lenis.resize();
    }, 200);
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 500);
  });

})();
