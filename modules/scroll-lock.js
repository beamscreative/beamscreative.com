import { pauseScrollSmoother } from './scroll-smoother.js';

export const lockScroll = () => {
  document.body.style.overflow = 'hidden';
  pauseScrollSmoother(true);
};

export const unlockScroll = () => {
  document.body.style.overflow = '';
  pauseScrollSmoother(false);
};
