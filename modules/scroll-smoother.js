const DEFAULT_OPTIONS = {
  wrapperSelector: '.smooth-wrapper',
  contentSelector: '.smooth-content',
  breakpoint: 991,
  smooth: 1.2,
  effects: true,
  normalizeScroll: true
};

let smoother = null;
let resizeListenerAttached = false;
let resizeTimer = null;
let lastOptions = { ...DEFAULT_OPTIONS };

const resetTransforms = ({ wrapperSelector, contentSelector }) => {
  const wrapper = document.querySelector(wrapperSelector);
  const content = document.querySelector(contentSelector);
  if (wrapper) wrapper.style.transform = '';
  if (content) content.style.transform = '';
};

const ensurePlugins = () => {
  if (!window.gsap || !window.ScrollTrigger || !window.ScrollSmoother) return false;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  return true;
};

export const initResponsiveScrollSmoother = (options = {}) => {
  lastOptions = { ...DEFAULT_OPTIONS, ...options };
  const { breakpoint, wrapperSelector, contentSelector, smooth, effects, normalizeScroll } = lastOptions;

  if (!ensurePlugins()) return null;

  const isDesktop = window.innerWidth > breakpoint;

  if (isDesktop && !smoother) {
    smoother = ScrollSmoother.create({
      wrapper: wrapperSelector,
      content: contentSelector,
      smooth,
      effects,
      normalizeScroll
    });
  } else if (!isDesktop && smoother) {
    smoother.kill();
    smoother = null;
    resetTransforms({ wrapperSelector, contentSelector });
  }

  if (!resizeListenerAttached) {
    resizeListenerAttached = true;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => initResponsiveScrollSmoother(lastOptions), 150);
    });
  }

  return smoother;
};

export const getScrollSmoother = () => {
  if (window.ScrollSmoother && window.ScrollSmoother.get) {
    return window.ScrollSmoother.get();
  }
  return smoother;
};

export const pauseScrollSmoother = (paused) => {
  const instance = getScrollSmoother();
  if (instance) instance.paused(Boolean(paused));
};
