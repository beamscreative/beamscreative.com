/**
 * Mobile Menu Component
 * 全站共用的手機選單動畫
 * 
 * HTML 結構:
 * - .mobile-menu-btn (觸發按鈕)
 * - .mobile-menu-overlay (全屏遮罩/側邊菜單)
 * - .mobile-menu-close (關閉按鈕)
 * - .mobile-menu-link (菜單連結項目)
 * - .mobile-menu-footer (底部內容)
 * 
 * 依賴: GSAP Core (透過 CDN 載入)
 */

import { lockScroll, unlockScroll } from '../modules/scroll-lock.js';

export const initMobileMenu = () => {
  // ============================================
  // 元素選取
  // ============================================
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const menuOverlay = document.querySelector('.mobile-menu-overlay');
  const menuClose = document.querySelector('.mobile-menu-close');
  const menuLinks = document.querySelectorAll('.mobile-menu-link');
  const menuFooter = document.querySelector('.mobile-menu-footer');

  if (!menuBtn || !menuOverlay) return;

  // ============================================
  // 狀態管理
  // ============================================
  let isMenuOpen = false;

  // ============================================
  // 初始狀態設置
  // ============================================
  gsap.set(menuOverlay, { 
    xPercent: 100,
    autoAlpha: 1,
    display: 'flex'
  });
  
  if (menuLinks.length) {
    gsap.set(menuLinks, { 
      autoAlpha: 0, 
      x: 30 
    });
  }
  
  if (menuFooter) {
    gsap.set(menuFooter, { 
      autoAlpha: 0, 
      y: 20 
    });
  }

  // ============================================
  // 打開菜單動畫
  // ============================================
  const openMenu = () => {
    if (isMenuOpen) return;
    isMenuOpen = true;
    lockScroll();

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    tl.to(menuOverlay, {
      xPercent: 0,
      duration: 0.5
    });

    if (menuLinks.length) {
      tl.to(menuLinks, {
        autoAlpha: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.08
      }, '-=0.2');
    }

    if (menuFooter) {
      tl.to(menuFooter, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4
      }, '-=0.2');
    }

    animateMenuBtnText('close');
  };

  // ============================================
  // 關閉菜單動畫
  // ============================================
  const closeMenu = () => {
    if (!isMenuOpen) return;
    isMenuOpen = false;

    const tl = gsap.timeline({
      defaults: { ease: 'power2.in' },
      onComplete: unlockScroll
    });

    if (menuFooter) {
      tl.to(menuFooter, {
        autoAlpha: 0,
        y: 10,
        duration: 0.2
      });
    }

    if (menuLinks.length) {
      tl.to(menuLinks, {
        autoAlpha: 0,
        x: 20,
        duration: 0.25,
        stagger: {
          each: 0.05,
          from: 'end'
        }
      }, '-=0.1');
    }

    tl.to(menuOverlay, {
      xPercent: 100,
      duration: 0.4,
      ease: 'power3.inOut'
    }, '-=0.15');

    animateMenuBtnText('menu');
  };

  // ============================================
  // Toggle 菜單
  // ============================================
  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // ============================================
  // Menu Button 文字動畫
  // ============================================
  const menuBtnText = menuBtn.querySelector('.menu-text, span');
  
  const animateMenuBtnText = (newText) => {
    if (!menuBtnText) return;
    
    gsap.to(menuBtnText, {
      autoAlpha: 0,
      y: -5,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => {
        menuBtnText.textContent = newText;
        gsap.fromTo(menuBtnText, 
          { autoAlpha: 0, y: 5 },
          { autoAlpha: 1, y: 0, duration: 0.15, ease: 'power2.out' }
        );
      }
    });
  };

  // ============================================
  // 事件綁定
  // ============================================
  
  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  if (menuClose) {
    menuClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(closeMenu, 150);
    });
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });

  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
      closeMenu();
    }
  });

  // ============================================
  // Resize 處理 - 桌面版自動關閉
  // ============================================
  const MOBILE_BREAKPOINT = 991;
  
  const handleResize = () => {
    if (window.innerWidth > MOBILE_BREAKPOINT && isMenuOpen) {
      gsap.set(menuOverlay, { xPercent: 100 });
      gsap.set(menuLinks, { autoAlpha: 0, x: 30 });
      if (menuFooter) gsap.set(menuFooter, { autoAlpha: 0, y: 20 });
      unlockScroll();
      isMenuOpen = false;
      if (menuBtnText) menuBtnText.textContent = 'menu';
    }
  };

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 150);
  });
};
