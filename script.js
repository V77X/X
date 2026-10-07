/* ============================================
   NEXORA — Interactions & Animations
   GSAP + ScrollTrigger + Lenis
   ============================================ */

(function () {
  'use strict';

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  const loaderCount = document.querySelector('.loader-count');
  const loaderBar = document.querySelector('.loader-bar span');
  let progress = 0;

  const tickLoader = setInterval(() => {
    progress += Math.random() * 12;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tickLoader);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        startHero();
      }, 400);
    }
    loaderCount.textContent = Math.floor(progress) + '%';
    loaderBar.style.width = progress + '%';
  }, 90);

  document.body.style.overflow = 'hidden';

  /* ---------- Lenis Smooth Scroll ---------- */
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
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

    document.querySelectorAll('a, button, .feature-card, .int-item, .price-card, .testimonial, .faq-item summary')
      .forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
      });
  }

  /* ---------- Register GSAP ---------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Nav scrolled state ---------- */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
  const root = document.documentElement;

  const savedTheme = localStorage.getItem('nexora-theme');
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
    if (themeIcon) themeIcon.textContent = savedTheme === 'light' ? '☀' : '☾';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('nexora-theme', next);
      if (themeIcon) themeIcon.textContent = next === 'light' ? '☀' : '☾';
    });
  }

  /* ---------- Hero intro ---------- */
  function startHero() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero-title .line', {
      y: 0, opacity: 1, duration: 1.1, stagger: 0.12
    })
    .to('.hero .hero-reveal', {
      y: 0, opacity: 1, duration: 1, stagger: 0.1
    }, '-=0.8')
    .to('.hero-mockup', {
      y: 0, opacity: 1, duration: 1.2
    }, '-=0.7');

    // Hero title line initial state
    gsap.set('.hero-title .line', { y: 100, opacity: 0 });
    gsap.set('.hero .hero-reveal', { y: 30, opacity: 0 });
    gsap.set('.hero-mockup', { y: 60, opacity: 0 });
  }

  // Prepare hero line wrapper for animation
  document.querySelectorAll('.hero-title .line').forEach((line) => {
    line.style.display = 'block';
    line.style.overflow = 'hidden';
  });

  /* ---------- Scroll Reveals ---------- */
  if (typeof gsap !== 'undefined') {
    // Section headings
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Feature cards, steps, testimonials, pricing, integrations
    gsap.utils.toArray('.reveal-card').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // Stats
    gsap.utils.toArray('.reveal-stat').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // Compare table
    const compareTable = document.querySelector('.compare-table');
    if (compareTable) {
      gsap.to(compareTable, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: compareTable, start: 'top 85%' }
      });
    }

    // CTA inner
    gsap.utils.toArray('.cta-inner .reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.cta-inner', start: 'top 80%' }
      });
    });

    /* ---------- Number counters ---------- */
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
              el.textContent = target >= 1000
                ? Math.floor(v).toLocaleString()
                : v.toFixed(target % 1 !== 0 ? 2 : 0);
            }
          });
        }
      });
    });

    /* ---------- Section title word reveal ---------- */
    gsap.utils.toArray('.section-title').forEach((title) => {
      gsap.from(title, {
        opacity: 0, y: 30, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 88%' }
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
          x: x * 0.25, y: y * 0.4,
          duration: 0.5, ease: 'power2.out'
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0, y: 0,
          duration: 0.7, ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

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

  /* ---------- Parallax on mockup ---------- */
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

  /* ---------- Three.js particle field ---------- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.BufferGeometry();
    const count = 600;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 12;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x7C5CFF,
      size: 0.02,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    });

    function animate() {
      requestAnimationFrame(animate);
      points.rotation.y += 0.0008;
      points.rotation.x += 0.0004;
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* ---------- FAQ single-open behavior ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-item').forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Refresh ScrollTrigger after images/fonts load ---------- */
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });

})();
