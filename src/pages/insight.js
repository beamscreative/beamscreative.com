/**
 * Insight Page Script
 * Page ID: 69088d9226e4a435f5e21c9e
 * Path: /insight
 * 
 * 功能: ScrollSmoother (desktop only), Insight 列表頁面
 * 依賴: GSAP, ScrollTrigger, ScrollSmoother (透過 CDN 載入)
 */

import { initResponsiveScrollSmoother } from '../modules/scroll-smoother.js';

const initInsight = () => {
  // ScrollSmoother 響應式控制 (僅 desktop 啟用)
  initResponsiveScrollSmoother();
  
  console.log('[BEAMS] Insight page initialized');
};

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initInsight);
