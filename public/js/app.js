/* ═══════════════════════════════════════════════════════════
   VASTWORKS · app.js
   Master animation controller
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── GLOBALS ────────────────────────────────── */
  const mouse = { x: 0, y: 0, lerpX: 0, lerpY: 0 };
  let lenis;

  /* ═══════════════════════════════════════════════
     1. PRELOADER (Animated with Real VastWorks Logo)
     ═══════════════════════════════════════════════ */
  function initPreloader(onExit) {
    return new Promise((resolve) => {
      const preloader   = document.getElementById('preloader');
      const logoImg     = document.querySelector('.preloader-logo-img');
      const numberEl    = document.getElementById('preloader-number');
      const lineFill    = document.getElementById('preloader-line-fill');
      let progress = 0;

      // Clean left-to-right build up of the logo
      if (logoImg) {
        gsap.fromTo(logoImg,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power2.inOut' }
        );
      }

      // Percentage tick counter
      const counterInterval = setInterval(() => {
        progress += Math.random() * 5 + 2;
        if (progress >= 100) {
          progress = 100;
          clearInterval(counterInterval);
          if (numberEl) numberEl.textContent = '100';
          if (lineFill) lineFill.style.width = '100%';

          // Exit preloader cleanly, triggering hero entrance as curtain lifts
          gsap.to(preloader, {
            yPercent: -100,
            duration: 0.9,
            ease: 'power3.inOut',
            delay: 0.25,
            onStart: () => {
              if (typeof onExit === 'function') onExit();
            },
            onComplete: () => {
              preloader.style.display = 'none';
              resolve();
            },
          });
        } else {
          if (numberEl) numberEl.textContent = Math.floor(progress);
          if (lineFill) lineFill.style.width  = progress + '%';
        }
      }, 35);
    });
  }

  /* ═══════════════════════════════════════════════
     2. LENIS SMOOTH SCROLL
     ═══════════════════════════════════════════════ */
  function initLenis() {
    lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Smooth anchor scrolls
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: -50 });
      });
    });
  }

  /* ═══════════════════════════════════════════════
     3. CUSTOM CURSOR
     ═══════════════════════════════════════════════ */
  function initCursor() {
    if (window.innerWidth < 600) return;

    const dot    = document.getElementById('cursor-dot');
    const circle = document.getElementById('cursor-circle');
    if (!dot || !circle) return;

    let dotX = 0, dotY = 0;
    let circX = 0, circY = 0;

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const hoverEls = document.querySelectorAll(
      'a, button, [data-magnetic], .bento-card, .industry-card, .pillar-card, .email-address'
    );
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    function animateCursor() {
      dotX += (mouse.x - dotX) * 0.35;
      dotY += (mouse.y - dotY) * 0.35;
      circX += (mouse.x - circX) * 0.12;
      circY += (mouse.y - circY) * 0.12;

      dot.style.left    = dotX + 'px';
      dot.style.top     = dotY + 'px';
      circle.style.left = circX + 'px';
      circle.style.top  = circY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* ═══════════════════════════════════════════════
     4. MAGNETIC ELEMENTS
     ═══════════════════════════════════════════════ */
  function initMagnetic() {
    if (window.innerWidth < 600) return;

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.28,
          y: y * 0.28,
          duration: 0.5,
          ease: 'power3.out',
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ═══════════════════════════════════════════════
     5. THREE.JS BACKGROUND
     ═══════════════════════════════════════════════ */
  function initThreeBackground() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Main morphing wireframe sphere
    const geo = new THREE.IcosahedronGeometry(2.1, 28);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.09,
    });
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    // Second inner sphere for depth
    const geo2 = new THREE.IcosahedronGeometry(1.5, 18);
    const mat2 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    });
    const sphere2 = new THREE.Mesh(geo2, mat2);
    scene.add(sphere2);

    const posAttr   = geo.attributes.position;
    const original  = new Float32Array(posAttr.array);
    const posAttr2  = geo2.attributes.position;
    const original2 = new Float32Array(posAttr2.array);

    // Floating particles
    const pCount = 450;
    const pGeo   = new THREE.BufferGeometry();
    const pPos   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) {
      pPos[i] = (Math.random() - 0.5) * 14;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.018,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    let mouseTarget = { x: 0, y: 0 };
    let mouseLerp = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseLerp.x += (mouseTarget.x - mouseLerp.x) * 0.05;
      mouseLerp.y += (mouseTarget.y - mouseLerp.y) * 0.05;

      // Breathing pulse
      const breathe = 1 + Math.sin(t * 0.8) * 0.04;

      // Main sphere: multi-octave noise displacement
      for (let i = 0; i < posAttr.count; i++) {
        const ix = i * 3;
        const ox = original[ix], oy = original[ix + 1], oz = original[ix + 2];
        // Octave 1: large organic deformation
        const n1 =
          Math.sin(ox * 1.4 + t * 0.55) *
          Math.cos(oy * 1.4 + t * 0.75) *
          Math.sin(oz * 1.4 + t * 0.35);
        // Octave 2: finer ripple detail
        const n2 =
          Math.sin(ox * 3.2 + t * 1.2) *
          Math.cos(oy * 2.8 + t * 0.9) * 0.35;
        // Octave 3: subtle high-frequency shimmer
        const n3 =
          Math.sin(ox * 5.5 + t * 2.5) *
          Math.cos(oz * 4.8 + t * 1.8) * 0.12;
        const displacement = (n1 + n2 + n3) * 0.15;
        posAttr.array[ix]     = ox * (breathe + displacement);
        posAttr.array[ix + 1] = oy * (breathe + displacement);
        posAttr.array[ix + 2] = oz * (breathe + displacement);
      }
      posAttr.needsUpdate = true;

      // Inner sphere: different phase, slower
      for (let i = 0; i < posAttr2.count; i++) {
        const ix = i * 3;
        const ox = original2[ix], oy = original2[ix + 1], oz = original2[ix + 2];
        const n =
          Math.sin(ox * 2.0 + t * 0.4) *
          Math.cos(oy * 1.8 + t * 0.6) *
          Math.sin(oz * 1.6 + t * 0.3);
        const d = n * 0.12;
        posAttr2.array[ix]     = ox * (breathe + d);
        posAttr2.array[ix + 1] = oy * (breathe + d);
        posAttr2.array[ix + 2] = oz * (breathe + d);
      }
      posAttr2.needsUpdate = true;

      // Rotation
      sphere.rotation.y += 0.0015;
      sphere.rotation.x += 0.0007;
      sphere.rotation.y += mouseLerp.x * 0.005;
      sphere.rotation.x += mouseLerp.y * 0.005;

      sphere2.rotation.y -= 0.001;
      sphere2.rotation.x -= 0.0005;
      sphere2.rotation.y += mouseLerp.x * 0.003;

      particles.rotation.y += 0.0004;
      particles.rotation.x += 0.0002;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* ═══════════════════════════════════════════════
     6. TEXT SPLIT & REVEAL ANIMATIONS
     ═══════════════════════════════════════════════ */
  function splitLines(el) {
    const html = el.innerHTML;
    const parts = /<br\s*\/?>/i.test(html)
      ? html.split(/<br\s*\/?>/i)
      : [html];
    el.innerHTML = parts
      .map(
        (line) =>
          `<span class="line"><span class="line-inner">${line.trim()}</span></span>`
      )
      .join('');
    return el.querySelectorAll('.line-inner');
  }

  function splitWords(el) {
    const text = el.textContent;
    el.innerHTML = text
      .split(/\s+/)
      .map((w) => `<span class="word">${w}</span>`)
      .join(' ');
    return el.querySelectorAll('.word');
  }

  let heroLines = [];

  function initTextAnimations() {
    // Split hero title lines immediately so starting state is hidden inside mask
    const heroTitle = document.querySelector('.hero-title[data-split-lines]');
    if (heroTitle) {
      heroLines = splitLines(heroTitle);
      heroTitle.classList.add('lines-initialized');
    }

    // Statement / Philosophy words reveal with ScrollTrigger
    document.querySelectorAll('[data-split-words]').forEach((el) => {
      const words = splitWords(el);
      gsap.to(words, {
        className: '+=revealed',
        stagger: 0.06,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: 1,
        },
      });
    });
  }

  function playHeroEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Hero title lines slide up smoothly from overflow mask
    if (heroLines && heroLines.length > 0) {
      tl.to(heroLines, {
        y: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power4.out',
      }, 0.05);
    }

    // Hero badge floats up
    tl.to('.hero-badge', {
      opacity: 1,
      y: 0,
      duration: 0.85,
    }, 0.15);

    // Hero subtitle floats up
    tl.to('.hero-sub', {
      opacity: 1,
      y: 0,
      duration: 0.85,
    }, 0.35);

    // Hero CTA buttons glide in
    tl.to('.hero-cta-group', {
      opacity: 1,
      y: 0,
      duration: 0.85,
    }, 0.55);
  }

  /* ═══════════════════════════════════════════════
     7. CARD ANIMATIONS (Tilt, Reveal, Glow)
     ═══════════════════════════════════════════════ */
  function initCards() {
    // Scroll reveal for all cards
    const cards = document.querySelectorAll('.bento-card, .industry-card, .pillar-card');
    cards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 35,
        duration: 0.8,
        ease: 'power3.out',
        delay: (i % 3) * 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
        },
      });
    });

    // 3D tilt on hover
    if (window.innerWidth < 600) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        gsap.to(card, {
          rotateY: x * 4.5,
          rotateX: -y * 4.5,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 800,
        });

        card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  /* ═══════════════════════════════════════════════
     8. MARQUEE SCROLL-VELOCITY
     ═══════════════════════════════════════════════ */
  function initMarquee() {
    const tracks = document.querySelectorAll('.marquee-track');
    let scrollVelocity = 0;

    if (lenis) {
      lenis.on('scroll', ({ velocity }) => {
        scrollVelocity = velocity;
      });
    }

    function updateMarquee() {
      const skew = Math.min(Math.max(scrollVelocity * 0.7, -6), 6);
      tracks.forEach((track) => {
        track.style.transform = `skewX(${skew}deg)`;
      });
      scrollVelocity *= 0.95;
      requestAnimationFrame(updateMarquee);
    }
    updateMarquee();
  }

  /* ═══════════════════════════════════════════════
     9. CONTACT SECTION (Particles + Copy)
     ═══════════════════════════════════════════════ */
  function initContact() {
    const canvas = document.getElementById('email-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let cW, cH;
    const dots = [];

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      cW = canvas.width = rect.width;
      cH = canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (let i = 0; i < 35; i++) {
      dots.push({
        x: Math.random() * cW,
        y: Math.random() * cH,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    function animateDots() {
      ctx.clearRect(0, 0, cW, cH);
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > cW) d.vx *= -1;
        if (d.y < 0 || d.y > cH) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animateDots);
    }
    animateDots();

    let burstParticles = [];
    function spawnBurst(cx, cy) {
      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = Math.random() * 4 + 2;
        burstParticles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: Math.random() * 2 + 1,
          life: 1,
        });
      }
    }

    function animateBurst() {
      burstParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.022;
        if (p.life > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.life * 0.6})`;
          ctx.fill();
        }
      });
      burstParticles = burstParticles.filter((p) => p.life > 0);
      requestAnimationFrame(animateBurst);
    }
    animateBurst();

    const copyBtn  = document.getElementById('copy-email-btn');
    const copyText = document.getElementById('copy-text');

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('team@vastworks.tech').then(() => {
          copyBtn.classList.add('copied');
          if (copyText) copyText.textContent = 'Copied!';

          const rect = canvas.getBoundingClientRect();
          const btnRect = copyBtn.getBoundingClientRect();
          spawnBurst(
            btnRect.left - rect.left + btnRect.width / 2,
            btnRect.top - rect.top + btnRect.height / 2
          );

          gsap.fromTo(copyBtn, { scale: 0.92 }, { scale: 1, duration: 0.45, ease: 'elastic.out(1,0.3)' });

          setTimeout(() => {
            copyBtn.classList.remove('copied');
            if (copyText) copyText.textContent = 'Click to Copy';
          }, 2000);
        });
      });
    }

    document.querySelectorAll('.contact-headline[data-split-lines]').forEach((el) => {
      const lines = splitLines(el);
      gsap.to(lines, {
        y: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
        },
      });
    });
  }

  /* ═══════════════════════════════════════════════
     10. PARALLAX EFFECTS
     ═══════════════════════════════════════════════ */
  function initParallax() {
    gsap.to('.hero-badge', {
      yPercent: -30,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
    gsap.to('.hero-title', {
      yPercent: -15,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
    gsap.to('.hero-sub', {
      yPercent: -8,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    gsap.to('#three-canvas', {
      opacity: 0.2,
      scrollTrigger: {
        trigger: '#statement',
        start: 'top bottom',
        end: 'top top',
        scrub: 1,
      },
    });
  }

  /* ═══════════════════════════════════════════════
     11. SECTION LABELS REVEAL
     ═══════════════════════════════════════════════ */
  function initSectionLabels() {
    document.querySelectorAll('.section-label').forEach((label) => {
      gsap.from(label, {
        opacity: 0,
        y: 15,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: label,
          start: 'top 88%',
        },
      });
    });
  }

  /* ═══════════════════════════════════════════════
     BOOT SEQUENCE
     ═══════════════════════════════════════════════ */
  async function boot() {
    gsap.registerPlugin(ScrollTrigger);

    // Initialize all page systems immediately so they are alive & ready behind preloader
    initLenis();
    initCursor();
    initMagnetic();
    initThreeBackground();
    initTextAnimations();
    initCards();
    initMarquee();
    initContact();
    initParallax();
    initSectionLabels();

    // Run preloader and smoothly trigger hero entrance as the curtain lifts
    await initPreloader(playHeroEntrance);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
