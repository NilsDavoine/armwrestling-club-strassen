document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  const nav = document.querySelector('nav');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(el => observer.observe(el));
  }

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.background = window.scrollY > 50
        ? 'rgba(10,10,10,0.98)'
        : 'rgba(10,10,10,0.92)';
    });
  }
});
