/**
 * About Page Script
 * Page ID: 654dddb7fac1a92339fe4ea3
 * Path: /about
 * 
 * 功能: ScrollSmoother (desktop only), About 頁面特定功能
 * 依賴: GSAP, ScrollTrigger, ScrollSmoother (透過 CDN 載入)
 */

import { initResponsiveScrollSmoother } from '../modules/scroll-smoother.js';

const initAbout = () => {
  // ScrollSmoother 響應式控制 (僅 desktop 啟用)
  initResponsiveScrollSmoother();
  
  console.log('[BEAMS] About page initialized');
};

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initAbout);
