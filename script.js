'use strict';
const whatsappBase = 'https://wa.me/5515997137389';
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  link.href = `${whatsappBase}?text=${encodeURIComponent('Olá, Ricardo! Gostaria de solicitar um orçamento.')}`;
});
document.querySelectorAll('[data-service]').forEach(link => {
  link.href = `${whatsappBase}?text=${encodeURIComponent(`Olá, Ricardo! Gostaria de solicitar um orçamento para ${link.dataset.service}.`)}`;
});
const servicesToggle = document.getElementById('services-toggle');
const servicesDropdown = document.getElementById('services-dropdown');
const mobileToggle = document.querySelector('.mobile-toggle');
const nav = document.getElementById('main-nav');
function closeServices() {
  if (window.gsap) {
    gsap.killTweensOf(servicesDropdown);
    gsap.set(servicesDropdown, { clearProps: 'opacity,transform' });
  }
  servicesToggle.setAttribute('aria-expanded', 'false');
  servicesDropdown.hidden = true;
}
function closeNav() {
  nav.classList.remove('open');
  mobileToggle.setAttribute('aria-expanded', 'false');
  mobileToggle.setAttribute('aria-label', 'Abrir menu');
  closeServices();
}
servicesToggle.addEventListener('click', () => {
  const open = servicesToggle.getAttribute('aria-expanded') === 'true';
  servicesToggle.setAttribute('aria-expanded', String(!open));
  servicesDropdown.hidden = open;
  if (!open && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.fromTo(servicesDropdown, { opacity: 0, y: -7 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
  }
});
mobileToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  mobileToggle.setAttribute('aria-expanded', String(open));
  mobileToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  if (!open) closeServices();
});
let scrollTween = null;
function centeredScrollTop(sectionTop, sectionHeight, viewportHeight, headerHeight, maximum) {
  return Math.max(0, Math.min(maximum, sectionTop + sectionHeight / 2 - (viewportHeight + headerHeight) / 2));
}
function stopMenuScroll() {
  if (scrollTween) scrollTween.kill();
  scrollTween = null;
  document.documentElement.classList.remove('scroll-managed');
}
function goToSection(target, hash) {
  closeNav();
  stopMenuScroll();
  const section = target.closest('.screen') || target;
  const headerHeight = document.querySelector('.header-inner').getBoundingClientRect().height;
  const viewportHeight = window.innerHeight;
  const maximum = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
  const sectionRect = section.getBoundingClientRect();
  let top = centeredScrollTop(sectionRect.top + window.scrollY, sectionRect.height, viewportHeight, headerHeight, maximum);
  // A named service remains visible when its section is taller than a phone screen.
  if (target.classList.contains('service-card') && sectionRect.height > viewportHeight * 1.15) {
    const targetRect = target.getBoundingClientRect();
    top = centeredScrollTop(targetRect.top + window.scrollY, targetRect.height, viewportHeight, headerHeight, maximum);
  }
  history.replaceState(null, '', hash);
  const finish = () => {
    scrollTween = null;
    document.documentElement.classList.remove('scroll-managed');
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  };
  if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const position = { y: window.scrollY };
    document.documentElement.classList.add('scroll-managed');
    scrollTween = gsap.to(position, { y: top, duration: 0.95, ease: 'power3.inOut',
      onUpdate: () => window.scrollTo(0, position.y), onComplete: finish });
  } else {
    document.documentElement.classList.add('scroll-managed');
    window.scrollTo(0, top);
    finish();
  }
}
document.querySelectorAll('.site-header a[href^="#"], .section-foot a[href^="#"], .hero-actions a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    event.preventDefault();
    goToSection(target, hash);
  });
});
window.addEventListener('wheel', stopMenuScroll, { passive: true });
window.addEventListener('touchstart', stopMenuScroll, { passive: true });
document.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stopMenuScroll();
});
nav.querySelectorAll('a:not([href^="#"])').forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('click', event => {
  if (!event.target.closest('.services-menu')) closeServices();
  if (!event.target.closest('.site-header')) closeNav();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (servicesToggle.getAttribute('aria-expanded') === 'true') {
    closeServices();
    servicesToggle.focus();
  } else if (nav.classList.contains('open')) {
    closeNav();
    mobileToggle.focus();
  }
});
window.matchMedia('(min-width: 851px)').addEventListener('change', closeNav);
document.getElementById('year').textContent = String(new Date().getFullYear());
// Keep section offsets correct if branding wraps under text enlargement.
if ('ResizeObserver' in window) {
  const header = document.querySelector('.header-inner');
  let lastHeight = 0;
  new ResizeObserver(() => {
    const height = Math.ceil(header.getBoundingClientRect().height);
    if (height === lastHeight) return;
    lastHeight = height;
    document.documentElement.style.setProperty('--header-offset', `${height}px`);
    if (window.ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
  }).observe(header);
}
const sections = [...document.querySelectorAll('main > section')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      nav.querySelectorAll('a[href^="#"]').forEach(link => {
        const current = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      servicesToggle.classList.toggle('active', entry.target.id === 'servicos');
    });
  }, { rootMargin: '-20% 0px -55% 0px' });
  sections.forEach(section => observer.observe(section));
}

// Navigation and contact links stay available if the animation libraries cannot load.
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const motionMedia = gsap.matchMedia();
  motionMedia.add({ desktop: '(min-width: 621px)', mobile: '(max-width: 620px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (!context.conditions.motion) return;
    const desktop = context.conditions.desktop;
    const channel = document.querySelector('.lightning-channel');
    // Move the complete discharge. Its image edges stay outside the viewport;
    // cutting the image into a moving reveal window produces a horizontal strip.
    // Scroll position is the only clock: the bolt stops and reverses with it.
    const journey = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      start: 0, end: 'max', scrub: true, invalidateOnRefresh: true
    } });
    journey.fromTo(channel, { yPercent: 0 }, { yPercent: 18, duration: 3 }, 0)
      .fromTo(channel, { x: 0 }, { x: () => window.innerWidth * (desktop ? -0.08 : -0.025), duration: 1 }, 0)
      .to(channel, { x: () => window.innerWidth * (desktop ? 0.01 : 0.012), duration: 1 }, 1)
      .to(channel, { x: () => window.innerWidth * (desktop ? -0.04 : -0.018), duration: 1 }, 2);
    gsap.to('.reading-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

    const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
    entrance.from('.hero-copy .eyebrow', { y: 10, opacity: 0, duration: 0.6 })
      .from('.title-line > span', { yPercent: 108, duration: 0.85, stagger: 0.1 }, '-=0.3')
      .from('.hero-description, .hero-actions, .hero-phone', { y: 16, opacity: 0, duration: 0.7, stagger: 0.09 }, '-=0.55');

    // Headings and card contents reveal with the same direct scroll control.
    // Animate the card contents, leaving the card itself free for hover/focus lift.

    document.querySelectorAll('.section-heading, .audience-copy, .contact-copy').forEach(element => {
      gsap.from(element.children, { y: 24, opacity: 0, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 96%', end: 'top 72%', scrub: true } });
    });
    document.querySelectorAll('.service-card').forEach(card => {
      gsap.from(card.children, { y: 18, opacity: 0, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 98%', end: 'top 78%', scrub: true } });
    });
    document.querySelectorAll('.audience-card').forEach(card => {
      gsap.from(card.children, { x: 14, opacity: 0, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 98%', end: 'top 78%', scrub: true } });
    });
    gsap.from('.contact-details > *', { y: 20, opacity: 0, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.contact-details', start: 'top 96%', end: 'top 70%', scrub: true } });
    gsap.from('.contact-details img', { scale: 0.92, ease: 'power2.out',
      scrollTrigger: { trigger: '.contact-details', start: 'top 96%', end: 'top 70%', scrub: true } });
    // Keyboard navigation must never land on an unrevealed interactive label.
    const revealFocused = event => {
      const card = event.target.closest('.service-card');
      if (!card) return;
      gsap.killTweensOf(card.children);
      gsap.set(card.children, { opacity: 1, y: 0 });
    };
    document.addEventListener('focusin', revealFocused);
    document.querySelectorAll('.section-foot').forEach(foot => {
      gsap.from(foot, { y: 12, opacity: 0, duration: 0.65, ease: 'power2.out',
        scrollTrigger: { trigger: foot, start: 'top 97%', once: true } });
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      document.removeEventListener('focusin', revealFocused);
    };
  });
  motionMedia.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const cleanups = [];
    document.querySelectorAll('.service-card').forEach(card => {
      const raise = gsap.quickTo(card, 'y', { duration: 0.35, ease: 'power2.out' });
      const icon = card.querySelector('.service-icon');
      const tilt = gsap.quickTo(icon, 'rotation', { duration: 0.35, ease: 'power2.out' });
      const grow = gsap.quickTo(icon, 'scale', { duration: 0.35, ease: 'power2.out' });
      const enter = () => { raise(-4); tilt(6); grow(1.08); };
      const leave = () => { raise(0); tilt(0); grow(1); };
      card.addEventListener('pointerenter', enter);
      card.addEventListener('pointerleave', leave);
      card.addEventListener('blur', leave);
      cleanups.push(() => {
        card.removeEventListener('pointerenter', enter);
        card.removeEventListener('pointerleave', leave);
        card.removeEventListener('blur', leave);
      });
    });
    document.querySelectorAll('.button').forEach(button => {
      const lift = gsap.quickTo(button, 'y', { duration: 0.3, ease: 'power2.out' });
      const enter = () => lift(-3);
      const leave = () => lift(0);
      button.addEventListener('pointerenter', enter);
      button.addEventListener('pointerleave', leave);
      button.addEventListener('blur', leave);
      cleanups.push(() => {
        button.removeEventListener('pointerenter', enter);
        button.removeEventListener('pointerleave', leave);
        button.removeEventListener('blur', leave);
      });
    });
    return () => cleanups.forEach(cleanup => cleanup());
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

// Premium card highlight only; existing navigation and GSAP timelines stay intact.
const cardGlowMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const glowCards = [...document.querySelectorAll('.service-card, .audience-card, .contact-details')];
function updateCardGlow(event) {
  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
  card.style.setProperty('--my', `${event.clientY - bounds.top}px`);
}
function syncCardGlow() {
  glowCards.forEach(card => {
    card.removeEventListener('pointermove', updateCardGlow);
    if (cardGlowMedia.matches) card.addEventListener('pointermove', updateCardGlow, { passive: true });
    else { card.style.removeProperty('--mx'); card.style.removeProperty('--my'); }
  });
}
cardGlowMedia.addEventListener('change', syncCardGlow);
syncCardGlow();
