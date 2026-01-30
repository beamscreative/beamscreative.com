/**
 * Works Page Script
 * Page ID: 654dddb7fac1a92339fe4eae
 * Path: /works
 * 
 * 功能: 手機版水平滾動 snap
 * 依賴: 無額外依賴
 */

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

  // Initial active state
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

  list.addEventListener(
    'touchstart',
    () => {
      isPointerDown = true;
      clearTimeout(scrollTimeout);
    },
    { passive: true }
  );

  list.addEventListener(
    'touchend',
    () => {
      isPointerDown = false;
      snapToClosest();
    },
    { passive: true }
  );

  list.addEventListener(
    'touchcancel',
    () => {
      isPointerDown = false;
      snapToClosest();
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(snapToClosest, 150);
  });
};

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initWorkMobileHorizontalScroll);
