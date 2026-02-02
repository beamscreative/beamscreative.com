/**
 * Insight Detail Page Script
 * Page ID: 6908905f9e6b6881d76beb7e
 * Path: /insight/[slug]
 * 
 * 功能: ScrollSmoother (desktop only), Insight 詳情頁面
 * 依賴: GSAP, ScrollTrigger, ScrollSmoother (透過 CDN 載入)
 */

import { initResponsiveScrollSmoother } from '../modules/scroll-smoother.js';

const initInsightDetail = () => {
  // ScrollSmoother 響應式控制 (僅 desktop 啟用)
  initResponsiveScrollSmoother();
  
  console.log('[BEAMS] Insight Detail page initialized');
};

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initInsightDetail);
