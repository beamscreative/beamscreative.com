/**
 * Works Page Script
 * Page ID: 654dddb7fac1a92339fe4eae
 * Path: /works
 * 
 * 功能: ScrollSmoother (desktop only), 手機版水平滾動 snap, 分類篩選, 導航點
 * 依賴: GSAP, ScrollTrigger, ScrollSmoother (透過 CDN 載入)
 */

import { initResponsiveScrollSmoother, getScrollSmoother } from '../modules/scroll-smoother.js';

const TABLET_BREAKPOINT = 991;
const TRIGGER_OFFSET = 60; // 觸發距離頂部的像素

// ============================================
// 手機版水平滾動 snap
// ============================================
const initWorkMobileHorizontalScroll = () => {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (!isMobile) return;

  const list =
    document.querySelector('.project-list') ||
    document.querySelector('.works-wrapper .project-list') ||
    document.querySelector('.works-wrapper [role="list"]');

  if (!list) return;

  const items = Array.from(list.querySelectorAll('.project-item'));
  if (!items.length) return;

  let isPointerDown = false;
  let scrollTimeout = null;
  let rafId = null;

  const getClosestItem = () => {
    const listCenter = list.scrollLeft + list.clientWidth / 2;
    let closest = items[0];
    let closestDist = Infinity;

    items.forEach(item => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const dist = Math.abs(itemCenter - listCenter);
      if (dist < closestDist) {
        closest = item;
        closestDist = dist;
      }
    });

    return closest;
  };

  const setActive = item => {
    items.forEach(el => el.classList.toggle('is-active', el === item));
  };

  const snapToClosest = () => {
    const closest = getClosestItem();
    if (!closest) return;
    const targetLeft =
      closest.offsetLeft - (list.clientWidth - closest.offsetWidth) / 2;

    list.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth'
    });
    setActive(closest);
  };

  setActive(items[0]);

  list.addEventListener(
    'scroll',
    () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const closest = getClosestItem();
        if (closest) setActive(closest);
      });

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isPointerDown) snapToClosest();
      }, 120);
    },
    { passive: true }
  );

  list.addEventListener('touchstart', () => {
    isPointerDown = true;
    clearTimeout(scrollTimeout);
  }, { passive: true });

  list.addEventListener('touchend', () => {
    isPointerDown = false;
    snapToClosest();
  }, { passive: true });

  list.addEventListener('touchcancel', () => {
    isPointerDown = false;
    snapToClosest();
  }, { passive: true });

  window.addEventListener('resize', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(snapToClosest, 150);
  });
};

// ============================================
// 分類篩選 Smooth Scroll
// ============================================
const initWorkFilterNavigation = () => {
  const filterLinks = Array.from(
    document.querySelectorAll('a[href*="#"]')
  ).filter(link => {
    const href = link.getAttribute('href');
    return href && href.startsWith('#') && href.length > 1;
  });

  if (!filterLinks.length) return;

  filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        
        filterLinks.forEach(l => l.classList.remove('w--current'));
        link.classList.add('w--current');

        // 使用 ScrollSmoother 滾動（如果存在）
        const smoother = getScrollSmoother();
        if (smoother) {
          smoother.scrollTo(targetElement, true);
        } else {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
};

// ============================================
// 導航點 (Navigation Dots)
// Desktop only - 桌面版專用
// ============================================
const initWorkNavigationDots = () => {
  // 僅在桌面版啟用
  if (window.innerWidth <= TABLET_BREAKPOINT) return;

  const navLine = document.querySelector('.nav-line');
  if (!navLine) return;

  // 取得所有 project-item
  const projectItems = Array.from(
    document.querySelectorAll('.project-item')
  );

  if (!projectItems.length) return;

  // 動態建立與 project-item 數量對應的 nav-dot
  const existingDots = Array.from(navLine.querySelectorAll('.nav-dot'));
  const itemCount = projectItems.length;
  
  // 調整 nav-dot 數量
  if (existingDots.length < itemCount) {
    // 需要新增 nav-dot
    for (let i = existingDots.length; i < itemCount; i++) {
      const newDot = existingDots[0]?.cloneNode(true) || document.createElement('div');
      newDot.className = 'nav-dot';
      newDot.classList.remove('is-active');
      navLine.appendChild(newDot);
    }
  } else if (existingDots.length > itemCount) {
    // 需要移除多餘的 nav-dot
    for (let i = existingDots.length - 1; i >= itemCount; i--) {
      existingDots[i].remove();
    }
  }

  // 重新取得所有 nav-dot
  const dots = Array.from(navLine.querySelectorAll('.nav-dot'));
  
  let ticking = false;
  let currentActiveIndex = -1;

  /**
   * 計算項目觸發閾值
   * 處理最後幾個無法達到 60px 觸發點的項目
   */
  const calculateTriggerThresholds = () => {
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const maxScroll = docHeight - viewportHeight;
    
    const thresholds = [];
    
    projectItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const itemTop = window.scrollY + rect.top;
      // 理想觸發位置：項目頂部距離視窗頂部 60px
      const idealTriggerScroll = itemTop - TRIGGER_OFFSET;
      thresholds.push({
        index,
        idealScroll: idealTriggerScroll,
        itemTop,
        reachable: idealTriggerScroll <= maxScroll
      });
    });

    // 找出最後一個可達的項目索引
    let lastReachableIndex = -1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (thresholds[i].reachable) {
        lastReachableIndex = i;
        break;
      }
    }

    // 如果有不可達的項目，重新計算它們的觸發閾值
    if (lastReachableIndex < thresholds.length - 1 && lastReachableIndex >= 0) {
      const lastReachableScroll = thresholds[lastReachableIndex].idealScroll;
      const unreachableCount = thresholds.length - lastReachableIndex - 1;
      const remainingScroll = maxScroll - lastReachableScroll;
      const step = remainingScroll / (unreachableCount + 1);

      for (let i = lastReachableIndex + 1; i < thresholds.length; i++) {
        const offset = i - lastReachableIndex;
        thresholds[i].adjustedScroll = lastReachableScroll + (step * offset);
      }
    }

    return thresholds;
  };

  // 更新 active dot
  const updateActiveDot = () => {
    const scrollY = window.scrollY;
    const thresholds = calculateTriggerThresholds();
    
    let activeIndex = 0;
    
    for (let i = 0; i < thresholds.length; i++) {
      const threshold = thresholds[i];
      const triggerScroll = threshold.reachable 
        ? threshold.idealScroll 
        : (threshold.adjustedScroll ?? threshold.idealScroll);
      
      if (scrollY >= triggerScroll) {
        activeIndex = i;
      }
    }

    // 只在 activeIndex 改變時更新 DOM
    if (activeIndex !== currentActiveIndex) {
      currentActiveIndex = activeIndex;
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === activeIndex);
      });
    }

    ticking = false;
  };

  // Throttled scroll handler
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveDot);
      ticking = true;
    }
  };

  // 點擊 dot 滾動到對應項目
  dots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const item = projectItems[i];
      if (!item) return;

      const smoother = getScrollSmoother();
      if (smoother) {
        // 使用 ScrollSmoother 滾動
        smoother.scrollTo(item, true, `top ${TRIGGER_OFFSET}px`);
      } else {
        // Fallback
        const rect = item.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - TRIGGER_OFFSET;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      }
    });
  });

  // 初始化
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // 延遲初始更新以確保 layout 穩定
  requestAnimationFrame(() => {
    updateActiveDot();
  });

  // 視窗 resize 時重新計算
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // 重新檢查是否為桌面版
      if (window.innerWidth <= TABLET_BREAKPOINT) {
        // 移除 is-active 狀態
        dots.forEach(dot => dot.classList.remove('is-active'));
      } else {
        updateActiveDot();
      }
    }, 150);
  });
};

// ============================================
// Project Thumb Hover — 原色覆蓋層
// ============================================
const initProjectThumbHover = () => {
  document.querySelectorAll('.project-thumb-wrapper').forEach(wrapper => {
    const img = wrapper.querySelector('.project-thumb-img');
    // 跳過已注入過的 wrapper，避免重複
    if (!img || wrapper.querySelector('.project-thumb-img--color')) return;

    // 複製圖片作為全彩覆蓋層（mix-blend-mode: normal, filter: none 由 CSS 控制）
    const colorImg = img.cloneNode(true);
    colorImg.classList.add('project-thumb-img--color');
    colorImg.removeAttribute('loading');
    colorImg.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(colorImg);
  });
};

// ============================================
// Auto-initialize on DOMContentLoaded
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // ScrollSmoother 響應式控制 (僅 desktop 啟用)
  initResponsiveScrollSmoother();

  // 初始化各功能
  initWorkMobileHorizontalScroll();
  initWorkFilterNavigation();
  initWorkNavigationDots();
  initProjectThumbHover();
  
  console.log('[BEAMS] Works page initialized');
});
