
document.addEventListener('DOMContentLoaded', () => {
  const TABLET_BREAKPOINT = 991;
  const isDesktop = () => window.innerWidth > TABLET_BREAKPOINT;

  if (window.gsap && window.ScrollTrigger && window.ScrollSmoother && isDesktop()) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    if (!ScrollSmoother.get()) {
      ScrollSmoother.create({
        wrapper: ".smooth-wrapper",
        content: ".smooth-content",
        smooth: 1.2,
        effects: true,
        normalizeScroll: true
      });
    }
  }

  // --- 響應式處理 project-detail-info-wrapper ---
  // 桌面版：保持在 smooth-wrapper 外面，可以用 position: fixed
  // Tablet/Mobile：移進 smooth-content 裡面，跟隨滾動
  const infoWrapper = document.querySelector('.project-detail-info-wrapper');
  const smoothContent = document.querySelector('.smooth-content');
  const mainGrid = document.querySelector('.main-grid'); // smooth-content 裡的目標位置
  
  let originalParent = null;
  let originalNextSibling = null;
  let isInsideSmoothContent = false;
  
  if (infoWrapper && smoothContent) {
    // 記錄原始位置（smooth-wrapper 外面）
    originalParent = infoWrapper.parentElement;
    originalNextSibling = infoWrapper.nextElementSibling;
    
    const handleInfoWrapperPosition = () => {
      const isDesktop = window.innerWidth > TABLET_BREAKPOINT;
      if (infoWrapper) infoWrapper.classList.toggle('is-desktop', isDesktop);
      
      if (!isDesktop && !isInsideSmoothContent) {
        // Tablet/Mobile：移進 smooth-content 裡面（main-grid 之前）
        if (mainGrid) {
          smoothContent.insertBefore(infoWrapper, mainGrid);
        } else {
          smoothContent.insertBefore(infoWrapper, smoothContent.firstChild);
        }
        isInsideSmoothContent = true;
      } else if (isDesktop && isInsideSmoothContent) {
        // 桌面版：移回原始位置（smooth-wrapper 外面）
        if (originalNextSibling && originalNextSibling.parentElement === originalParent) {
          originalParent.insertBefore(infoWrapper, originalNextSibling);
        } else {
          originalParent.appendChild(infoWrapper);
        }
        isInsideSmoothContent = false;
      }
    };
    
    // 初始化
    handleInfoWrapperPosition();
    
    // 視窗大小改變時重新處理
    window.addEventListener('resize', handleInfoWrapperPosition);
  }

  const body = document.body;
  const overlay = document.querySelector('.lightbox');
  const smoother = window.ScrollSmoother && window.ScrollSmoother.get ? window.ScrollSmoother.get() : null;

  let slides = [];
  let current = 0;
  let isOpen = false;

  const markIndexes = () => {
    const gridList = document.querySelector('.project-detail-img-wrapper [role="list"]');
    const lightboxList = document.querySelector('.lightbox-wrapper [role="list"]');
    if (!gridList || !lightboxList) return;

    const gridItems = Array.from(gridList.querySelectorAll('.project-detail-img-block'));
    gridItems.forEach((item, index) => {
      item.dataset.lbIndex = index;
    });

    const lightboxItems = Array.from(lightboxList.querySelectorAll('.lightbox-item'));
    lightboxItems.forEach((item, index) => {
      item.dataset.lbIndex = index;
    });
  };

  const getTriggers = () =>
    Array.from(document.querySelectorAll('.project-detail-img-block[data-lb-index]'));

  const getSlides = () =>
    Array.from(document.querySelectorAll('.lightbox-item[data-lb-index]'));

  const refreshSlides = () => {
    slides = getSlides();
  };

  const setSlide = (nextIndex, dir = 1) => {
    refreshSlides();
    if (!slides.length) return;
    const prevItem = slides[current];
    const nextItem = slides[nextIndex];
    if (!prevItem || !nextItem || prevItem === nextItem) return;

    // 新圖片：從側邊滑入 + 淡入
    gsap.set(nextItem, { autoAlpha: 0, xPercent: 5 * dir, zIndex: 2 });
    gsap.to(nextItem, { 
      duration: 0.45, 
      autoAlpha: 1, 
      xPercent: 0, 
      ease: 'power2.out' 
    });
    
    // 舊圖片：往反方向滑出 + 淡出
    gsap.to(prevItem, {
      duration: 0.45,
      autoAlpha: 0,
      xPercent: -5 * dir,
      ease: 'power2.out',
      onComplete: () => gsap.set(prevItem, { zIndex: 1, xPercent: 0 })
    });
    current = nextIndex;
  };

  const lockScroll = () => {
    body.style.overflow = 'hidden';
    smoother && smoother.paused(true);
  };

  const unlockScroll = () => {
    body.style.overflow = '';
    smoother && smoother.paused(false);
  };

  const openLightbox = index => {
    if (!isDesktop()) return;
    refreshSlides();
    if (!slides.length || index < 0 || index >= slides.length) return;

    current = index;
    lockScroll();
    overlay.style.display = 'flex';
    gsap.set(slides, { autoAlpha: 0 });
    gsap.set(slides[current], { autoAlpha: 1 });
    
    // 整個 lightbox 縮放 + 淡入
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
    
    // 整個 lightbox 縮小 + 淡出
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

  document.addEventListener('click', evt => {
    if (!isDesktop()) return;
    const trigger = evt.target.closest('.project-detail-img-block[data-lb-index]');
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
      const nextIndex = (current + 1) % slides.length;
      setSlide(nextIndex, 1);
      return;
    }

    if (evt.target.closest('.lightbox-prev')) {
      evt.preventDefault();
      evt.stopPropagation();
      const prevIndex = (current - 1 + slides.length) % slides.length;
      setSlide(prevIndex, -1);
      return;
    }

    if (evt.target.closest('.lightbox-close')) {
      evt.preventDefault();
      evt.stopPropagation();
      closeLightbox();
    }
  });

  overlay.addEventListener('click', evt => {
    if (!isDesktop()) return;
    if (evt.target === overlay) closeLightbox();
  });

  document.addEventListener('keyup', evt => {
    if (!isDesktop() || !isOpen || !slides.length) return;
    if (evt.key === 'Escape') closeLightbox();
    if (evt.key === 'ArrowRight') setSlide((current + 1) % slides.length, 1);
    if (evt.key === 'ArrowLeft') setSlide((current - 1 + slides.length) % slides.length, -1);
  });

  // --- Reader mode pop-up -------------------------------------------------
  // 使用 Webflow 原生 HTML/CSS，JS 只處理 GSAP 動畫和 ScrollSmoother 控制
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

  // 使用事件委派處理 reader-close 點擊
  document.addEventListener('click', e => {
    // 只要點擊 reader-close 且 reader 是開啟狀態就關閉
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

  window.addEventListener('resize', () => {
    if (isDesktop()) {
      markIndexes();
      refreshSlides();
    } else if (overlay) {
      overlay.style.display = 'none';
      isOpen = false;
      slides = [];
    }
  });

  if (isDesktop()) {
    markIndexes();
    refreshSlides();
  }
});