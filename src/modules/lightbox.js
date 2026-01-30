/**
 * Lightbox Module
 * 圖片燈箱功能，支援鍵盤導航和觸控操作
 * 
 * 依賴: GSAP (透過 CDN 載入)
 */

import { lockScroll, unlockScroll } from './scroll-lock.js';

/**
 * 初始化 Lightbox
 * @param {Object} options - 配置選項
 */
export const initLightbox = (options = {}) => {
  const {
    overlaySelector = '.lightbox',
    gridListSelector = '.project-detail-img-wrapper [role="list"]',
    lightboxListSelector = '.lightbox-wrapper [role="list"]',
    triggerSelector = '.project-detail-img-block',
    slideSelector = '.lightbox-item'
  } = options;

  const overlay = document.querySelector(overlaySelector);
  if (!overlay) return;

  let slides = [];
  let current = 0;
  let isOpen = false;

  const markIndexes = () => {
    const gridList = document.querySelector(gridListSelector);
    const lightboxList = document.querySelector(lightboxListSelector);
    if (!gridList || !lightboxList) return;

    const gridItems = Array.from(gridList.querySelectorAll(triggerSelector));
    gridItems.forEach((item, index) => {
      item.dataset.lbIndex = index;
    });

    const lightboxItems = Array.from(lightboxList.querySelectorAll(slideSelector));
    lightboxItems.forEach((item, index) => {
      item.dataset.lbIndex = index;
    });
  };

  const getSlides = () =>
    Array.from(document.querySelectorAll(`${slideSelector}[data-lb-index]`));

  const refreshSlides = () => {
    slides = getSlides();
  };

  const setSlide = (nextIndex, dir = 1) => {
    refreshSlides();
    if (!slides.length) return;
    const prevItem = slides[current];
    const nextItem = slides[nextIndex];
    if (!prevItem || !nextItem || prevItem === nextItem) return;

    gsap.set(nextItem, { autoAlpha: 0, xPercent: 5 * dir, zIndex: 2 });
    gsap.to(nextItem, { 
      duration: 0.45, 
      autoAlpha: 1, 
      xPercent: 0, 
      ease: 'power2.out' 
    });
    
    gsap.to(prevItem, {
      duration: 0.45,
      autoAlpha: 0,
      xPercent: -5 * dir,
      ease: 'power2.out',
      onComplete: () => gsap.set(prevItem, { zIndex: 1, xPercent: 0 })
    });
    current = nextIndex;
  };

  const openLightbox = index => {
    refreshSlides();
    if (!slides.length || index < 0 || index >= slides.length) return;

    current = index;
    lockScroll();
    overlay.style.display = 'flex';
    gsap.set(slides, { autoAlpha: 0 });
    gsap.set(slides[current], { autoAlpha: 1 });
    
    gsap.fromTo(overlay, 
      { autoAlpha: 0, scale: 0.95 }, 
      { 
        duration: 0.4, 
        autoAlpha: 1, 
        scale: 1, 
        ease: 'power2.out'
      }
    );
    
    isOpen = true;
  };

  const closeLightbox = () => {
    if (!isOpen) return;
    
    gsap.to(overlay, {
      duration: 0.3,
      autoAlpha: 0,
      scale: 0.95,
      ease: 'power2.in',
      onComplete: () => {
        overlay.style.display = 'none';
        gsap.set(overlay, { scale: 1 });
        unlockScroll();
      }
    });
    isOpen = false;
  };

  const nextSlide = () => {
    if (!isOpen || !slides.length) return;
    const nextIndex = (current + 1) % slides.length;
    setSlide(nextIndex, 1);
  };

  const prevSlide = () => {
    if (!isOpen || !slides.length) return;
    const prevIndex = (current - 1 + slides.length) % slides.length;
    setSlide(prevIndex, -1);
  };

  // Event handlers
  document.addEventListener('click', evt => {
    const trigger = evt.target.closest(`${triggerSelector}[data-lb-index]`);
    if (trigger) {
      evt.preventDefault();
      evt.stopPropagation();
      const index = Number(trigger.dataset.lbIndex);
      openLightbox(index);
      return;
    }

    if (!isOpen) return;

    if (evt.target.closest('.lightbox-next')) {
      evt.preventDefault();
      evt.stopPropagation();
      nextSlide();
      return;
    }

    if (evt.target.closest('.lightbox-prev')) {
      evt.preventDefault();
      evt.stopPropagation();
      prevSlide();
      return;
    }

    if (evt.target.closest('.lightbox-close')) {
      evt.preventDefault();
      evt.stopPropagation();
      closeLightbox();
    }
  });

  overlay.addEventListener('click', evt => {
    if (evt.target === overlay) closeLightbox();
  });

  document.addEventListener('keyup', evt => {
    if (!isOpen || !slides.length) return;
    if (evt.key === 'Escape') closeLightbox();
    if (evt.key === 'ArrowRight') nextSlide();
    if (evt.key === 'ArrowLeft') prevSlide();
  });

  window.addEventListener('resize', () => {
    markIndexes();
    refreshSlides();
  });

  // Initialize
  markIndexes();
  refreshSlides();

  return {
    open: openLightbox,
    close: closeLightbox,
    next: nextSlide,
    prev: prevSlide
  };
};
