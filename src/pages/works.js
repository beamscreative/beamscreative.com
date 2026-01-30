/**
 * Works Page Script
 * Page ID: 654dddb7fac1a92339fe4eae
 * Path: /works
 * 
 * 功能: 手機版水平滾動 snap, 分類篩選, 導航點
 * 依賴: 無額外依賴
 */

// ============================================
// 手機版水平滾動 snap
// ============================================
const initWorkMobileHorizontalScroll = () => {
  // #region agent log
  console.log('[DEBUG] initWorkMobileHorizontalScroll called');
  // #endregion
  
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  // #region agent log
  console.log('[DEBUG] isMobile:', isMobile);
  // #endregion
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

// ============================================
// 分類篩選 Smooth Scroll
// ============================================
const initWorkFilterNavigation = () => {
  // #region agent log
  console.log('[DEBUG] initWorkFilterNavigation called');
  // #endregion
  
  // Find filter links - they might be in various structures
  const filterLinks = Array.from(
    document.querySelectorAll('a[href*="#"]')
  ).filter(link => {
    const href = link.getAttribute('href');
    return href && href.startsWith('#') && href.length > 1;
  });

  // #region agent log
  console.log('[DEBUG] Filter links found:', filterLinks.length, filterLinks.map(l => l.getAttribute('href')));
  // #endregion

  if (!filterLinks.length) return;

  filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      // #region agent log
      console.log('[DEBUG] Filter link clicked:', href, 'Target found:', !!targetElement);
      // #endregion

      if (targetElement) {
        e.preventDefault();
        
        // Update active state
        filterLinks.forEach(l => l.classList.remove('w--current'));
        link.classList.add('w--current');

        // Smooth scroll to target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// ============================================
// 導航點 (Navigation Dots)
// ============================================
const initWorkNavigationDots = () => {
  // #region agent log
  console.log('[DEBUG] initWorkNavigationDots called');
  // #endregion
  
  const dots = Array.from(document.querySelectorAll('.nav-line .nav-dot'));
  
  // #region agent log
  console.log('[DEBUG] Nav dots found:', dots.length);
  // #endregion
  
  if (!dots.length) {
    // #region agent log
    console.log('[DEBUG] No nav dots found, exiting');
    // #endregion
    return;
  }

  // Find all project items or sections to track
  const projectItems = Array.from(
    document.querySelectorAll('.project-item, .works-item, [data-nav-section]')
  );

  // #region agent log
  console.log('[DEBUG] Project items found:', projectItems.length);
  // #endregion

  if (!projectItems.length) {
    // #region agent log
    console.log('[DEBUG] No project items found, exiting');
    // #endregion
    return;
  }

  // Limit dots to match available items
  const count = Math.min(dots.length, projectItems.length);
  const activeDots = dots.slice(0, count);
  const activeItems = projectItems.slice(0, count);

  let ticking = false;

  // Function to update active dot based on scroll position
  const updateActiveDot = () => {
    const scrollPosition = window.scrollY + window.innerHeight / 2;

    let activeIndex = 0;
    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i];
      const rect = item.getBoundingClientRect();
      const itemTop = rect.top + window.scrollY;
      const itemBottom = itemTop + rect.height;

      if (scrollPosition >= itemTop && scrollPosition < itemBottom) {
        activeIndex = i;
        break;
      }
    }

    // #region agent log
    console.log('[DEBUG] updateActiveDot - scrollPos:', scrollPosition, 'activeIndex:', activeIndex, 'totalItems:', activeItems.length);
    // #endregion

    // Update dot active state
    activeDots.forEach((dot, i) => {
      if (i === activeIndex) {
        dot.classList.add('is-active');
      } else {
        dot.classList.remove('is-active');
      }
    });

    ticking = false;
  };

  // Throttled scroll handler
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveDot);
      ticking = true;
    }
  };

  // Click handler for dots
  activeDots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      if (activeItems[i]) {
        activeItems[i].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Initialize
  window.addEventListener('scroll', onScroll, { passive: true });
  updateActiveDot();
};

// ============================================
// Auto-initialize on DOMContentLoaded
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // #region agent log
  console.log('[DEBUG] DOMContentLoaded fired - works.js initializing');
  // #endregion
  
  try {
    initWorkMobileHorizontalScroll();
    initWorkFilterNavigation();
    initWorkNavigationDots();
    
    // #region agent log
    console.log('[DEBUG] All init functions completed successfully');
    // #endregion
  } catch (error) {
    // #region agent log
    console.error('[DEBUG] Error in init functions:', error.message, error.stack);
    // #endregion
  }
});
