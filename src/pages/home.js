/**
 * Home Page Script
 * Page ID: 654dddb7fac1a92339fe4ea0
 * Path: /
 * 
 * 功能: ScrollSmoother (desktop only), Hero 輪播、桌面點擊切換、手機滾動觸發
 * 依賴: GSAP, ScrollTrigger, ScrollSmoother (透過 CDN 載入)
 */

import { initResponsiveScrollSmoother } from '../modules/scroll-smoother.js';

const initHeroProject = () => {
  const wrapper = document.querySelector('.hero-project-wrapper');
  if (!wrapper) return;

  const slides = Array.from(wrapper.querySelectorAll('.hero-project-item'));
  const dots = Array.from(document.querySelectorAll('.nav-line .nav-dot'));
  const count = Math.min(slides.length, dots.length);

  if (count === 0) return;

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  // ============================================
  // DESKTOP VERSION - 點擊切換邏輯-test
  // ============================================
  if (!isMobile) {
    let step = 0;
    let animating = false;

    // 初始設置：控制 slide 和所有圖片的 opacity
    slides.forEach((s, i) => {
      const allImgs = s.querySelectorAll('.hero-project-img');
      gsap.set(s, { opacity: i === 0 ? 1 : 0 });
      allImgs.forEach(img => {
        gsap.set(img, { opacity: i === 0 ? 1 : 0, scale: 1 });
      });
    });
    animateBg(slides[0]);
    setActiveDot(0);

    function animateBg(toSlide) {
      const bgColor = getComputedStyle(toSlide).backgroundColor;
      gsap.to(wrapper, { backgroundColor: bgColor, duration: 0.6, ease: "power2.out" });
    }

    function go(from, to) {
      if (animating || from === to) return false;
      animating = true;

      animateBg(to);

      const fromImgs = from.querySelectorAll('.hero-project-img');
      const toImgs = to.querySelectorAll('.hero-project-img');

      gsap.set(to, { opacity: 0 });
      toImgs.forEach(img => gsap.set(img, { scale: 0.97, opacity: 0 }));

      const tl = gsap.timeline({
        defaults: { duration: 0.5, ease: "power3.out" },
        onComplete: () => { animating = false; }
      });

      tl.to(from, { opacity: 0 }, 0)
        .to(to, { opacity: 1 }, 0.05);

      fromImgs.forEach(img => tl.to(img, { opacity: 0, scale: 1.02 }, 0));
      toImgs.forEach(img => tl.to(img, { opacity: 1, scale: 1 }, 0));

      return true;
    }

    function nextSlide() {
      const next = (step + 1) % count;
      if (go(slides[step], slides[next])) {
        step = next;
        setActiveDot(step);
      }
    }

    // nav-dot 點擊
    for (let i = 0; i < count; i++) {
      dots[i].addEventListener('click', (e) => {
        e.preventDefault();
        if (i === step) return;
        if (go(slides[step], slides[i])) {
          step = i;
          setActiveDot(step);
        }
      });
    }

    function setActiveDot(i) {
      dots.forEach(d => d.classList.remove('is-active'));
      if (dots[i]) dots[i].classList.add('is-active');
    }

    // Desktop 點擊切換
    wrapper.addEventListener("click", nextSlide);
  }

  // ============================================
  // MOBILE VERSION - Scroll-based transition
  // ============================================
  if (isMobile) {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const originalBgColors = slides.map(slide => {
      return getComputedStyle(slide).backgroundColor;
    });

    slides.forEach((slide, index) => {
      const imgs = slide.querySelectorAll('.hero-project-img');
      const bgColor = originalBgColors[index];

      if (index === 0) {
        gsap.set(slide, { backgroundColor: bgColor });
        imgs.forEach(img => gsap.set(img, { opacity: 1 }));
      } else {
        gsap.set(slide, { backgroundColor: '#ffffff' });
        imgs.forEach(img => gsap.set(img, { opacity: 0 }));
      }

      if (index !== 0) {
        ScrollTrigger.create({
          trigger: slide,
          start: "top 80%",
          end: "top 20%",
          onEnter: () => {
            const tl = gsap.timeline();
            tl.to(slide, {
              backgroundColor: bgColor,
              duration: 0.4,
              ease: "power2.out"
            });
            imgs.forEach(img => {
              tl.to(img, {
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
              }, "-=0.2");
            });
          },
          onLeaveBack: () => {
            imgs.forEach(img => {
              gsap.to(img, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
              });
            });
            gsap.to(slide, {
              backgroundColor: '#ffffff',
              duration: 0.3,
              ease: "power2.in"
            });
          }
        });
      }

      ScrollTrigger.create({
        trigger: slide,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveDotMobile(index),
        onEnterBack: () => setActiveDotMobile(index)
      });
    });

    setActiveDotMobile(0);

    function setActiveDotMobile(i) {
      dots.forEach(d => d.classList.remove('is-active'));
      if (dots[i]) dots[i].classList.add('is-active');
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        if (slides[i]) {
          slides[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

// Auto-initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // ScrollSmoother 響應式控制 (僅 desktop 啟用)
  initResponsiveScrollSmoother();
  
  // Hero 輪播功能
  initHeroProject();
  
  console.log('[BEAMS] Home page initialized');
});
