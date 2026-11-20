/* UPFOREX | Vanilla JavaScript motion and interactions
 * Smooth motion inspired by contemporary agency websites; no GSAP/jQuery/framework.
 */
(() => {
  'use strict';
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsIO = 'IntersectionObserver' in window;
  document.documentElement.classList.add('js-ready');
  if ($('#year')) $('#year').textContent = String(new Date().getFullYear());

  // 1. Scroll progress / sticky header / back-to-top – all animation is frame-limited.
  const header = $('.site-header');
  const progress = $('#scrollProgress');
  const backTop = $('#backToTop');
  let scrollQueued = false;
  const updateScroll = () => {
    const y = window.scrollY || 0;
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progress) progress.style.width = `${Math.min(100, (y / total) * 100)}%`;
    if (header) header.classList.toggle('scrolled', y > 30);
    if (backTop) backTop.classList.toggle('visible', y > 550);
    scrollQueued = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' }));
  updateScroll();

  // 2. Skyris-style scroll reveals: staggered, polished, yet accessible.
  const reveals = $$('.reveal');
  if (reduceMotion.matches || !supportsIO) {
    reveals.forEach(node => node.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.09, rootMargin: '0px 0px -28px 0px' });
    reveals.forEach(node => revealObserver.observe(node));
  }

  // 3. Mobile menu with keyboard/ARIA support. Dropdowns respond to clicks too.
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  const setMenu = (open) => {
    menuToggle?.classList.toggle('open', open);
    mainNav?.classList.toggle('open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    menuToggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = (open && window.innerWidth <= 980) ? 'hidden' : '';
  };
  menuToggle?.addEventListener('click', () => setMenu(!mainNav?.classList.contains('open')));
  $$('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', event => {
      event.stopPropagation();
      const dropdown = toggle.closest('.nav-dropdown');
      const willOpen = !dropdown.classList.contains('open');
      $$('.nav-dropdown').forEach(item => {
        item.classList.remove('open');
        $('.dropdown-toggle', item)?.setAttribute('aria-expanded', 'false');
      });
      dropdown.classList.toggle('open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-dropdown')) {
      $$('.nav-dropdown').forEach(item => {
        item.classList.remove('open');
        $('.dropdown-toggle', item)?.setAttribute('aria-expanded', 'false');
      });
    }
  });
  $$('#mainNav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setMenu(false);
      $$('.nav-dropdown').forEach(item => {
        item.classList.remove('open');
        $('.dropdown-toggle', item)?.setAttribute('aria-expanded', 'false');
      });
    }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 980 && mainNav?.classList.contains('open')) setMenu(false); });

  // 4. Direction-following subtle card highlights, without changing brand colors.
  if (!reduceMotion.matches && window.matchMedia('(hover: hover)').matches) {
    $$('.asset-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left + 80}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top + 80}px`);
      }, { passive: true });
    });
  }

  // 5. Original ECN mp4: starts only when in view; actual mute/pause controls.
  const video = $('#ecnVideo');
  const videoToggle = $('#videoToggle');
  const muteToggle = $('#muteToggle');
  let videoInView = false;
  let userPausedVideo = false;
  const updateVideoButtons = () => {
    if (videoToggle) {
      videoToggle.setAttribute('aria-label', video?.paused ? 'Play video' : 'Pause video');
      const icon = $('.play-icon', videoToggle);
      if (icon) icon.textContent = video?.paused ? '▶' : 'Ⅱ';
    }
    if (muteToggle) {
      muteToggle.textContent = video?.muted ? 'Sound off' : 'Sound on';
      muteToggle.setAttribute('aria-label', video?.muted ? 'Unmute video' : 'Mute video');
    }
  };
  const playVideo = async () => {
    if (!video || userPausedVideo || reduceMotion.matches) return;
    try { await video.play(); } catch (_) { /* browser autoplay policy; use play button */ }
    updateVideoButtons();
  };
  if (video) {
    video.muted = true;
    video.addEventListener('play', updateVideoButtons);
    video.addEventListener('pause', updateVideoButtons);
    videoToggle?.addEventListener('click', async () => {
      if (video.paused) { userPausedVideo = false; try { await video.play(); } catch (_) {} }
      else { userPausedVideo = true; video.pause(); }
      updateVideoButtons();
    });
    muteToggle?.addEventListener('click', () => { video.muted = !video.muted; updateVideoButtons(); });
    if (supportsIO) {
      const observer = new IntersectionObserver(entries => {
        videoInView = entries[0].isIntersecting;
        if (videoInView) playVideo();
        else video.pause();
      }, { rootMargin: '150px 0px', threshold: .01 });
      observer.observe(video);
    } else playVideo();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else if (videoInView) playVideo();
    });
    updateVideoButtons();
  }

  // 6. Interactive MT5 carousel, 7 original images, autoplay when visible only.
  const carousel = $('#mt5Carousel');
  const slides = $$('.mt5-slide');
  const pagination = $('#mt5Pagination');
  let activeSlide = 0;
  let carouselTimer = null;
  let carouselInView = false;
  let carouselPausedByUser = false;
  const dots = slides.map((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `View MT5 screenshot ${index + 1}`);
    dot.addEventListener('click', () => { showSlide(index); pauseForUser(); });
    pagination?.append(dot);
    return dot;
  });
  const showSlide = index => {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === activeSlide;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeSlide);
      dot.setAttribute('aria-current', i === activeSlide ? 'true' : 'false');
    });
  };
  const stopCarousel = () => { clearInterval(carouselTimer); carouselTimer = null; };
  const startCarousel = () => {
    if (carouselTimer || reduceMotion.matches || !carouselInView || carouselPausedByUser || document.hidden) return;
    carouselTimer = window.setInterval(() => showSlide(activeSlide + 1), 4400);
  };
  let resumeTimer = 0;
  const pauseForUser = () => {
    carouselPausedByUser = true;
    stopCarousel();
    clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => { carouselPausedByUser = false; startCarousel(); }, 10000);
  };
  $('#mt5Prev')?.addEventListener('click', () => { showSlide(activeSlide - 1); pauseForUser(); });
  $('#mt5Next')?.addEventListener('click', () => { showSlide(activeSlide + 1); pauseForUser(); });
  carousel?.addEventListener('mouseenter', stopCarousel);
  carousel?.addEventListener('mouseleave', startCarousel);
  carousel?.addEventListener('focusin', stopCarousel);
  carousel?.addEventListener('focusout', startCarousel);
  if (carousel && supportsIO) {
    const observer = new IntersectionObserver(entries => {
      carouselInView = entries[0].isIntersecting;
      if (carouselInView) startCarousel(); else stopCarousel();
    }, { threshold: .1 });
    observer.observe(carousel);
  } else { carouselInView = true; startCarousel(); }
  document.addEventListener('visibilitychange', () => document.hidden ? stopCarousel() : startCarousel());
  showSlide(0);
  if (carousel) {
    let touchStart = 0;
    carousel.addEventListener('touchstart', event => { touchStart = event.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', event => {
      const dx = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(dx) > 45) { showSlide(activeSlide + (dx < 0 ? 1 : -1)); pauseForUser(); }
    }, { passive: true });
  }

  // 7. Hero atmospheric particles + tiny pointer parallax (blue particles only
  // in the existing blue hero visual). Canvas is paused outside the viewport.
  const hero = $('.hero');
  const canvas = $('#heroParticles');
  if (hero && canvas && !reduceMotion.matches) {
    const context = canvas.getContext('2d');
    if (context) {
      let width = 0, height = 0, dpr = 1, dots = [], particleVisible = true;
      let frame = 0, lastFrame = 0;
      const resizeCanvas = () => {
        const bounds = hero.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.round(bounds.width);
        height = Math.round(bounds.height);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        dots = Array.from({ length: width < 650 ? 16 : 34 }, (_, i) => ({
          x: (i * 127.7) % width, y: (i * 75.9 + 20) % height,
          r: i % 4 === 0 ? 1.4 : .7, speed: .08 + (i % 5) * .045,
          pulse: i * .65
        }));
      };
      resizeCanvas();
      let pointerX = 0, pointerY = 0, pointerQueued = false;
      hero.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch' || window.innerWidth <= 700) return;
        const r = hero.getBoundingClientRect();
        pointerX = ((e.clientX - r.left) / r.width - .5) * 9;
        pointerY = ((e.clientY - r.top) / r.height - .5) * 7;
        if (!pointerQueued) {
          pointerQueued = true;
          requestAnimationFrame(() => {
            $('.hero-bg')?.style.setProperty('transform', `translate3d(${-pointerX}px, ${-pointerY}px, 0) scale(1.03)`);
            pointerQueued = false;
          });
        }
      }, { passive: true });
      hero.addEventListener('pointerleave', () => $('.hero-bg')?.style.setProperty('transform', ''));
      const render = timestamp => {
        frame = requestAnimationFrame(render);
        if (document.hidden || !particleVisible || timestamp - lastFrame < 32) return;
        lastFrame = timestamp;
        context.clearRect(0, 0, width, height);
        dots.forEach(dot => {
          dot.y -= dot.speed;
          if (dot.y < -5) dot.y = height + 5;
          const a = .1 + .25 * (1 + Math.sin(timestamp * .0013 + dot.pulse)) / 2;
          context.fillStyle = `rgba(46,185,255,${a})`;
          context.beginPath(); context.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2); context.fill();
        });
      };
      if (supportsIO) {
        new IntersectionObserver(entries => { particleVisible = entries[0].isIntersecting; }, { threshold: 0 }).observe(hero);
      }
      frame = requestAnimationFrame(render);
      window.addEventListener('resize', resizeCanvas, { passive: true });
      window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });
    }
  }

  // 8. TradingView's own ticker – uses genuine provider data, no invented quotes.
  const ticker = $('#tickerWidget');
  if (ticker && navigator.onLine) {
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    ticker.append(widget);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.textContent = JSON.stringify({
      symbols: [
        { description: 'XAUUSD', proName: 'OANDA:XAUUSD' },
        { description: 'EURUSD', proName: 'OANDA:EURUSD' },
        { description: 'GBPUSD', proName: 'OANDA:GBPUSD' },
        { description: 'USDCHF', proName: 'OANDA:USDCHF' },
        { description: 'USDJPY', proName: 'OANDA:USDJPY' },
        { description: 'BTCUSDT', proName: 'BINANCE:BTCUSDT' },
        { description: 'ETHUSDT', proName: 'BINANCE:ETHUSDT' }
      ],
      showSymbolLogo: true, isTransparent: false, displayMode: 'adaptive',
      colorTheme: 'dark', locale: 'en'
    });
    const observer = new MutationObserver(() => {
      if (widget.querySelector('iframe')) {
        $('.ticker-fallback', ticker)?.remove();
        observer.disconnect();
      }
    });
    observer.observe(widget, { childList: true, subtree: true });
    ticker.append(script);
    window.setTimeout(() => observer.disconnect(), 12000);
  }
})();
