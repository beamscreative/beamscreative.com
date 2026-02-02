/**
 * Works Category Page Script
 * Page ID: 654dddb7fac1a92339fe4ea9
 * Path: /works-categories/[slug]
 * 
 * 功能: ScrollSmoother (desktop only), 導航點
 * 依賴: GSAP, ScrollTrigger, ScrollSmoother (透過 CDN 載入)
 */

import { initResponsiveScrollSmoother, getScrollSmoother } from '../modules/scroll-smoother.js';

const TABLET_BREAKPOINT = 991;
const TRIGGER_OFFSET = 60;

// ============================================
// 導航點 (Navigation Dots)
// Desktop only - 桌面版專用
// ============================================
const initCategoryNavigationDots = () => {
  if (window.innerWidth <= TABLET_BREAKPOINT) return;

  const navLine = document.querySelector('.nav-line');
  if (!navLine) return;

  const projectItems = Array.from(document.querySelectorAll('.project-item'));
  if (!projectItems.length) return;

  // 動態調整 nav-dot 數量
  const existingDots = Array.from(navLine.querySelectorAll('.nav-dot'));
  const itemCount = projectItems.length;
  
  if (existingDots.length < itemCount) {
    for (let i = existingDots.length; i < itemCount; i++) {
      const newDot = existingDots[0]?.cloneNode(true) || document.createElement('div');
      newDot.className = 'nav-dot';
      newDot.classList.remove('is-active');
      navLine.appendChild(newDot);
    }
  } else if (existingDots.length > itemCount) {
    for (let i = existingDots.length - 1; i >= itemCount; i--) {
      existingDots[i].remove();
    }
  }

  const dots = Array.from(navLine.querySelectorAll('.nav-dot'));
  
  let ticking = false;
  let currentActiveIndex = -1;

  const calculateTriggerThresholds = () => {
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const maxScroll = docHeight - viewportHeight;
    
    const thresholds = [];
    
    projectItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const itemTop = window.scrollY + rect.top;
      const idealTriggerScroll = itemTop - TRIGGER_OFFSET;
      thresholds.push({
        index,
        idealScroll: idealTriggerScroll,
        itemTop,
        reachable: idealTriggerScroll <= maxScroll
      });
    });

    let lastReachableIndex = -1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (thresholds[i].reachable) {
        lastReachableIndex = i;
        break;
      }
    }

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

    if (activeIndex !== currentActiveIndex) {
      currentActiveIndex = activeIndex;
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === activeIndex);
      });
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveDot);
      ticking = true;
    }
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const item = projectItems[i];
      if (!item) return;

      const smoother = getScrollSmoother();
      if (smoother) {
        smoother.scrollTo(item, true, `top ${TRIGGER_OFFSET}px`);
      } else {
        const rect = item.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - TRIGGER_OFFSET;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  requestAnimationFrame(() => updateActiveDot());

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth <= TABLET_BREAKPOINT) {
        dots.forEach(dot => dot.classList.remove('is-active'));
      } else {
        updateActiveDot();
      }
    }, 150);
  });
};

// ============================================
// Auto-initialize on DOMContentLoaded
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initResponsiveScrollSmoother();
  initCategoryNavigationDots();
  
  console.log('[BEAMS] Works Category page initialized');
});
