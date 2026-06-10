/* ============================================================
   SQUADLINK — LAUNCH TEASER  |  script.js
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. CUSTOM CURSOR
  ============================================================ */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let fX = 0, fY = 0, cX = -40, cY = -40; // Start off-screen

  document.addEventListener('mousemove', (e) => {
    cX = e.clientX; cY = e.clientY;
    // Position cursor tip (top-left) at mouse point
    cursor.style.left = cX + 'px';
    cursor.style.top  = cY + 'px';
  });

  function animateFollower() {
    // Smoother lag for the glow follower
    fX += (cX - fX) * 0.1;
    fY += (cY - fY) * 0.1;
    follower.style.left = fX + 'px';
    follower.style.top  = fY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover state detection
  const interactiveEls = 'a, button, .video-card, .play-overlay, .social-card, .carousel-btn, [role="button"], label';
  const textInputEls = 'input[type="text"], input[type="email"], input[type="number"], input[type="password"], textarea';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveEls)) {
      cursor.classList.add('h-hover');
    }
    if (e.target.closest(textInputEls)) {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
    } else {
      cursor.style.opacity = '1';
      follower.style.opacity = '1';
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveEls)) {
      cursor.classList.remove('h-hover');
    }
  });

  // Click state detection
  document.addEventListener('mousedown', () => cursor.classList.add('h-active'));
  document.addEventListener('mouseup', () => cursor.classList.remove('h-active'));


  /* ============================================================
     2. PARTICLE CANVAS — background floating dots
  ============================================================ */
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];
  const COLORS  = ['rgba(0,255,255,ALPHA)', 'rgba(0,255,136,ALPHA)', 'rgba(255,153,0,ALPHA)'];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x     = Math.random() * canvas.width;
      this.y     = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.size  = Math.random() * 2.5 + 0.5;
      this.speed = Math.random() * 0.5 + 0.2;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.col   = COLORS[Math.floor(Math.random() * COLORS.length)].replace('ALPHA', this.alpha);
      this.drift = (Math.random() - 0.5) * 0.4;
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.col;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  /* ============================================================
     3. SCROLL REVEAL
  ============================================================ */
  const revealEls = document.querySelectorAll('.scroll-reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ============================================================
     4. DYNAMIC VIDEO CAROUSEL
  ============================================================ */
  const track       = document.getElementById('carouselTrack');
  const prevBtn     = document.getElementById('carouselPrev');
  const nextBtn     = document.getElementById('carouselNext');
  
  const YOUTUBE_VIDEOS = [
    "https://youtu.be/vvjsxLSCfoU",
    "https://youtu.be/yk_G-AVNIik",
    "https://youtu.be/ctdjFiu48aw",
    "https://youtu.be/Eul0ePFkHyw",
    "https://youtu.be/lihYUxBZ_BE"
  ];

  function extractVideoId(url) {
    // Handle both https://youtu.be/ID and https://www.youtube.com/watch?v=ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async function fetchChannelName(videoId) {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      return data.author_name;
    } catch (error) {
      console.error('Error fetching channel name:', error);
      return 'YouTube Creator';
    }
  }

  function renderCarousel() {
    track.innerHTML = '';
    YOUTUBE_VIDEOS.forEach((videoUrl, index) => {
      const id = extractVideoId(videoUrl);
      if (!id) return;

      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumb-wrapper">
          <img src="https://img.youtube.com/vi/${id}/maxresdefault.jpg" alt="Arena Action ${index + 1}" class="video-thumb" loading="lazy">
          <div class="play-overlay" data-type="youtube" data-id="${id}">
            <div class="play-btn-circle">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="video-badge">YouTube</div>
        </div>
        <div class="video-meta">
          <p class="video-title">Arena Action #${String(index + 1).padStart(2, '0')}</p>
          <p class="video-sub">By ...</p>
        </div>
      `;
      track.appendChild(card);

      // Fetch and update the channel name asynchronously
      fetchChannelName(id).then(name => {
        const subEl = card.querySelector('.video-sub');
        if (subEl) subEl.textContent = `By ${name}`;
      });
    });
  }

  renderCarousel();

  const cards       = track.querySelectorAll('.video-card');
  const GAP         = 24;
  let currentIndex  = 0;
  let autoScrollId  = null;
  let isHovered     = false;

  function getCardWidth() {
    return cards[0] ? cards[0].offsetWidth + GAP : 0;
  }

  function goTo(index) {
    const cardWidth = getCardWidth();
    const maxScroll = track.scrollWidth - track.parentElement.offsetWidth;
    currentIndex = index;
    
    // Calculate new scroll position
    let targetScroll = currentIndex * cardWidth;
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    
    track.parentElement.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }

  prevBtn.addEventListener('click', () => { goTo(currentIndex - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(currentIndex + 1); resetAuto(); });

  function startAuto() {
    autoScrollId = setInterval(() => {
      if (!isHovered) {
        const maxIndex = cards.length - Math.floor(track.parentElement.offsetWidth / getCardWidth());
        if (currentIndex >= maxIndex) goTo(0);
        else goTo(currentIndex + 1);
      }
    }, 3200);
  }

  function resetAuto() {
    clearInterval(autoScrollId);
    startAuto();
  }

  track.parentElement.addEventListener('mouseenter', () => { isHovered = true; });
  track.parentElement.addEventListener('mouseleave', () => { isHovered = false; });

  // Touch / swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx < 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1); resetAuto(); }
  });

  startAuto();
  window.addEventListener('resize', () => goTo(currentIndex));



  track.addEventListener('click', e => {
    const playOverlay = e.target.closest('.play-overlay');
    if (playOverlay) {
      const id = playOverlay.dataset.id;
      window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
    }
  });




  /* ============================================================
     7. STATIC CTA BUTTONS
  ============================================================ */
  // No logic needed for static buttons in this version
  // Navigation for "Follow Us" is handled by anchor links section below



  /* ============================================================
     8. SMOOTH HERO LOGO PARALLAX ON SCROLL
  ============================================================ */
  const heroLogo   = document.getElementById('heroLogo');
  const heroBtns   = document.querySelector('.hero-btns');

  function onScroll() {
    const scrollY = window.scrollY;
    if (heroLogo)  heroLogo.style.transform   = `translateY(${scrollY * 0.18}px)`;
    if (heroBtns)  heroBtns.style.transform   = `translateY(${scrollY * 0.08}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ============================================================
     9. IDEAS SECTION — STAGGERED SCROLL REVEAL
  ============================================================ */
  const ideaItems = document.querySelectorAll('.idea-item');
  const ideaObs   = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        ideaObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  ideaItems.forEach(el => {
    el.classList.add('scroll-reveal');
    ideaObs.observe(el);
  });


  /* ============================================================
     10. SMOOTH SCROLL FOR ANCHOR LINKS
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
