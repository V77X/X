/* ============================================
   NΞXUS — Working Version (No Freeze)
   ============================================ */

(function () {
  'use strict';

  // Set viewport height variable
  function setVh() {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  }
  setVh();

  // Hide the opening screen immediately (prevents freeze)
  var opening = document.getElementById('opening');
  if (opening) {
    opening.style.display = 'none';
  }

  // Unlock body scroll no matter what
  document.body.style.overflow = '';

  // Hero animations
  function startHero() {
    if (typeof gsap === 'undefined') {
      var lines = document.querySelectorAll('.hero-title .line-inner');
      for (var i = 0; i < lines.length; i++) { lines[i].style.transform = 'none'; }
      var reveals = document.querySelectorAll('.hero-reveal');
      for (var j = 0; j < reveals.length; j++) {
        reveals[j].style.opacity = '1';
        reveals[j].style.transform = 'none';
      }
      var mock = document.querySelector('.hero-mockup');
      if (mock) { mock.style.opacity = '1'; mock.style.transform = 'none'; }
      return;
    }
    gsap.to('.hero-title .line-inner', {
      y: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out'
    });
    gsap.to('.hero .hero-reveal', {
      opacity: 1, y: 0, duration: 1, stagger: 0.1, delay: 0.3, ease: 'power3.out'
    });
    gsap.from('.hero-mockup', {
      opacity: 0, y: 60, duration: 1.2, delay: 0.6, ease: 'power3.out'
    });
  }

  window.addEventListener('load', startHero);
  if (document.readyState === 'complete') startHero();

  // Smooth scroll
  var lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false
    });
    function raf(t) {
      lenis.raf(t);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Custom cursor
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

  // GSAP scroll animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Generic reveal
    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Slide up (features, pricing)
    gsap.utils.toArray('.slide-up').forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, delay: i * 0.06, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Slide left (steps, faq)
    gsap.utils.toArray('.slide-left').forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1, x: 0, duration: 0.9, delay: i * 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Slide right (compare rows)
    gsap.utils.toArray('.slide-right').forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1, x: 0, duration: 0.8, delay: i * 0.05, ease: 'power3.out',
        scrollTrigger: { trigger: '.compare-table', start: 'top 82%' }
      });
    });

    // Rotate in (testimonials)
    gsap.utils.toArray('.rotate-in').forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1, rotate: 0, y: 0, duration: 1, delay: i * 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Pop (integrations)
    var pops = gsap.utils.toArray('.pop');
    pops.sort(function () { return Math.random() - 0.5; });
    gsap.to(pops, {
      opacity: 1, scale: 1, duration: 0.6, stagger: 0.04, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.integration-grid', start: 'top 85%' }
    });

    // Scale in (stats, cta)
    gsap.utils.toArray('.scale-in').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
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
  }

  // Magnetic buttons
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

  // Nav scroll state
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });
  }

  // Smooth anchor links
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

  // FAQ single open
  var faqs = document.querySelectorAll('.faq-item');
  for (var i = 0; i < faqs.length; i++) {
    (function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) {
          var others = document.querySelectorAll('.faq-item');
          for (var j = 0; j < others.length; j++) {
            if (others[j] !== item) others[j].open = false;
          }
        }
      });
    })(faqs[i]);
  }

  // Resize handler
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      setVh();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      if (lenis && lenis.resize) lenis.resize();
    }, 200);
  });

  // Final refresh on load
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 500);
  });

})();
