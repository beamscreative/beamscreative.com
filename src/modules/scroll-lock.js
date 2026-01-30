/**
 * Scroll Lock Module
 * 鎖定/解鎖頁面滾動，配合 ScrollSmoother
 */

import { pauseScrollSmoother } from './scroll-smoother.js';

/**
 * 鎖定頁面滾動
 */
export const lockScroll = () => {
  document.body.style.overflow = 'hidden';
  pauseScrollSmoother(true);
};

/**
 * 解鎖頁面滾動
 */
export const unlockScroll = () => {
  document.body.style.overflow = '';
  pauseScrollSmoother(false);
};
