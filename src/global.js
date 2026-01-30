/**
 * BEAMS Creative - Global Scripts
 * 全站共用腳本入口
 * 
 * 載入於 Webflow Project Settings > Custom Code > Footer Code
 * 在所有頁面載入，提供全站共用功能
 * 
 * 依賴: GSAP Core (透過 CDN 載入)
 */

import { initMobileMenu } from './components/mobile-menu.js';

// ============================================
// 全站初始化
// ============================================
const initGlobal = () => {
  console.log('[BEAMS] Global scripts loaded');
  
  // 初始化手機選單
  initMobileMenu();
};

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initGlobal);

// Export for potential external use
export { initGlobal };
