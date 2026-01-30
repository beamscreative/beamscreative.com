/**
 * Works Detail Page Script
 * Page ID: 654dddb7fac1a92339fe4ea8
 * Path: /works/[slug]
 * 
 * 功能: ScrollSmoother、Lightbox、Reader popup、響應式 info wrapper
 * 依賴: GSAP, ScrollTrigger, ScrollSmoother (透過 CDN 載入)
 */

import { initResponsiveScrollSmoother } from '../modules/scroll-smoother.js';
import { lockScroll, unlockScroll } from '../modules/scroll-lock.js';
import { initLightbox } from '../modules/lightbox.js';

const TABLET_BREAKPOINT = 991;
const isDesktop = () => window.innerWidth > TABLET_BREAKPOINT;

const initWorksDetail = () => {
  // --- ScrollSmoother 響應式控制 ---
  initResponsiveScrollSmoother();

  // --- Lightbox (僅桌面版) ---
  if (isDesktop()) {
    initLightbox();
  }

  // --- 響應式處理 project-detail-info-wrapper ---
  const infoWrapper = document.querySelector('.project-detail-info-wrapper');
  const smoothContent = document.querySelector('.smooth-content');
  const mainGrid = document.querySelector('.main-grid');
  
  let originalParent = null;
  let originalNextSibling = null;
  let isInsideSmoothContent = false;
  
  if (infoWrapper && smoothContent) {
    originalParent = infoWrapper.parentElement;
    originalNextSibling = infoWrapper.nextElementSibling;
    
    const handleInfoWrapperPosition = () => {
      const desktop = isDesktop();
      if (infoWrapper) infoWrapper.classList.toggle('is-desktop', desktop);
      
      if (!desktop && !isInsideSmoothContent) {
        if (mainGrid) {
          smoothContent.insertBefore(infoWrapper, mainGrid);
        } else {
          smoothContent.insertBefore(infoWrapper, smoothContent.firstChild);
        }
        isInsideSmoothContent = true;
      } else if (desktop && isInsideSmoothContent) {
        if (originalNextSibling && originalNextSibling.parentElement === originalParent) {
          originalParent.insertBefore(infoWrapper, originalNextSibling);
        } else {
          originalParent.appendChild(infoWrapper);
        }
        isInsideSmoothContent = false;
      }
    };
    
    handleInfoWrapperPosition();
    window.addEventListener('resize', handleInfoWrapperPosition);
  }

  // --- Reader mode pop-up ---
  const reader = document.querySelector('.reader');
  const readerWrapper = reader?.querySelector('.reader-description-wrapper');
  const readerTrigger = document.querySelector('.project-detail-description');
  let isReaderOpen = false;

  const openReader = () => {
    if (!reader || isReaderOpen) return;
    if (readerWrapper) readerWrapper.scrollTop = 0;
    reader.style.display = 'flex';
    lockScroll();
    gsap.fromTo(
      reader,
      { autoAlpha: 0, yPercent: 3 },
      {
        duration: 0.45,
        autoAlpha: 1,
        yPercent: 0,
        ease: 'power2.out'
      }
    );
    isReaderOpen = true;
  };

  const closeReader = () => {
    if (!reader || !isReaderOpen) return;
    gsap.to(reader, {
      duration: 0.3,
      autoAlpha: 0,
      yPercent: 2,
      ease: 'power1.in',
      onComplete: () => {
        reader.style.display = 'none';
        unlockScroll();
      }
    });
    isReaderOpen = false;
  };

  if (readerTrigger) {
    readerTrigger.addEventListener('click', e => {
      e.preventDefault();
      openReader();
    });
  }

  document.addEventListener('click', e => {
    if (isReaderOpen && e.target.closest('.reader-close')) {
      e.preventDefault();
      e.stopPropagation();
      closeReader();
    }
  });

  if (reader) {
    reader.addEventListener('click', e => {
      if (e.target === reader) closeReader();
    });
  }

  document.addEventListener('keyup', e => {
    if (e.key === 'Escape' && isReaderOpen) closeReader();
  });
};

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initWorksDetail);
