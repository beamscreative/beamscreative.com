import { lockScroll, unlockScroll } from './modules/scroll-lock.js';

/**
 * Mobile Menu - GSAP Animation
 *
 * 需要的 HTML 結構:
 * - .mobile-menu-btn (觸發按鈕)
 * - .mobile-menu-overlay (全屏遮罩/側邊菜單)
 * - .mobile-menu-close (關閉按鈕)
 * - .mobile-menu-link (菜單連結項目 - 用於 stagger 動畫)
 * - .mobile-menu-footer (底部內容：contact, social, copyright)
 *
 * 依賴: GSAP Core
 */

export const initMobileMenu = () => {
  // ============================================
  // 元素選取
  // ============================================
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const menuOverlay = document.querySelector('.mobile-menu-overlay');
  const menuClose = document.querySelector('.mobile-menu-close');
  const menuLinks = document.querySelectorAll('.mobile-menu-link');
  const menuFooter = document.querySelector('.mobile-menu-footer');

  // 如果沒有必要元素則退出
  if (!menuBtn || !menuOverlay) return;

  // ============================================
  // 狀態管理
  // ============================================
  let isMenuOpen = false;

  // ============================================
  // 初始狀態設置
  // ============================================
  gsap.set(menuOverlay, { 
    xPercent: 100,  // 隱藏在右邊
    autoAlpha: 1,
    display: 'flex'
  });
  
  // 設置菜單項目初始狀態
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

    // 主時間軸
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    // 1. Overlay 滑入
    tl.to(menuOverlay, {
      xPercent: 0,
      duration: 0.5
    });

    // 2. Menu links stagger 淡入
    if (menuLinks.length) {
      tl.to(menuLinks, {
        autoAlpha: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.08
      }, '-=0.2'); // 提前開始，與 overlay 動畫重疊
    }

    // 3. Footer 淡入
    if (menuFooter) {
      tl.to(menuFooter, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4
      }, '-=0.2');
    }

    // 4. Menu button 文字變化動畫（可選）
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

    // 1. Footer 先淡出
    if (menuFooter) {
      tl.to(menuFooter, {
        autoAlpha: 0,
        y: 10,
        duration: 0.2
      });
    }

    // 2. Menu links 反向 stagger 淡出
    if (menuLinks.length) {
      tl.to(menuLinks, {
        autoAlpha: 0,
        x: 20,
        duration: 0.25,
        stagger: {
          each: 0.05,
          from: 'end' // 從最後一個開始
        }
      }, '-=0.1');
    }

    // 3. Overlay 滑出
    tl.to(menuOverlay, {
      xPercent: 100,
      duration: 0.4,
      ease: 'power3.inOut'
    }, '-=0.15');

    // 4. Menu button 文字變回
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
  // Menu Button 文字動畫（可選）
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
  
  // Menu button 點擊
  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  // Close button 點擊
  if (menuClose) {
    menuClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  // 點擊 menu link 後關閉（可選 - 如果是 SPA 或想要動畫效果）
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      // 延遲關閉，讓用戶看到點擊效果
      setTimeout(closeMenu, 150);
    });
  });

  // ESC 鍵關閉
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });

  // 點擊 overlay 背景關閉（可選）
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
      // 桌面版，直接重置狀態
      gsap.set(menuOverlay, { xPercent: 100 });
      gsap.set(menuLinks, { autoAlpha: 0, x: 30 });
      if (menuFooter) gsap.set(menuFooter, { autoAlpha: 0, y: 20 });
      unlockScroll();
      isMenuOpen = false;
      if (menuBtnText) menuBtnText.textContent = 'menu';
    }
  };

  // Debounce resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 150);
  });
};

document.addEventListener('DOMContentLoaded', initMobileMenu);

