export const initHeroProject = () => {
  const wrapper = document.querySelector('.hero-project-wrapper');
  if (!wrapper) return;

  const slides = Array.from(wrapper.querySelectorAll('.hero-project-item'));
  const dots = Array.from(document.querySelectorAll('.nav-line .nav-dot'));
  const count = Math.min(slides.length, dots.length);

  if (count === 0) return;

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  // ============================================
  // DESKTOP VERSION - 點擊切換邏輯
  // ============================================
  if (!isMobile) {
    let step = 0;
    let animating = false;

    // 初始設置：控制 slide 和所有圖片的 opacity
    slides.forEach((s, i) => {
      const allImgs = s.querySelectorAll('.hero-project-img');
      gsap.set(s, { opacity: i === 0 ? 1 : 0 });
      // 設置所有圖片的初始狀態
      allImgs.forEach(img => {
        gsap.set(img, { opacity: i === 0 ? 1 : 0, scale: 1 });
      });
    });
    animateBg(slides[0]);
    setActiveDot(0);

    function animateBg(toSlide) {
      const bgColor = getComputedStyle(toSlide).backgroundColor;
      gsap.to(wrapper, { backgroundColor: bgColor, duration: 0.6, ease: "power2.out" });
    }

    // 修復：返回 boolean 表示動畫是否成功開始
    function go(from, to) {
      if (animating || from === to) return false;  // 返回 false 表示未執行
      animating = true;

      animateBg(to);

      // 選取所有圖片（支援多張圖片）
      const fromImgs = from.querySelectorAll('.hero-project-img');
      const toImgs = to.querySelectorAll('.hero-project-img');

      gsap.set(to, { opacity: 0 });
      toImgs.forEach(img => gsap.set(img, { scale: 0.97, opacity: 0 }));

      const tl = gsap.timeline({
        defaults: { duration: 0.5, ease: "power3.out" },
        onComplete: () => { animating = false; }
      });

      tl.to(from, { opacity: 0 }, 0)
        .to(to, { opacity: 1 }, 0.05);

      // 動畫化所有圖片
      fromImgs.forEach(img => tl.to(img, { opacity: 0, scale: 1.02 }, 0));
      toImgs.forEach(img => tl.to(img, { opacity: 1, scale: 1 }, 0));

      return true;  // 返回 true 表示動畫已開始
    }

    function nextSlide() {
      const next = (step + 1) % count;
      // 修復：只有動畫成功開始時才更新 step 和 nav
      if (go(slides[step], slides[next])) {
        step = next;
        setActiveDot(step);
      }
    }

    // nav-dot 點擊
    for (let i = 0; i < count; i++) {
      dots[i].addEventListener('click', (e) => {
        e.preventDefault();
        if (i === step) return;
        // 修復：只有動畫成功開始時才更新 step 和 nav
        if (go(slides[step], slides[i])) {
          step = i;
          setActiveDot(step);
        }
      });
    }

    function setActiveDot(i) {
      dots.forEach(d => d.classList.remove('is-active'));
      if (dots[i]) dots[i].classList.add('is-active');
    }

    // Desktop 點擊切換
    wrapper.addEventListener("click", nextSlide);
  }

  // ============================================
  // MOBILE VERSION - Scroll-based transition
  // CSS 由 Webflow 處理，JS 只控制動畫
  // ============================================
  if (isMobile) {
    // 註冊 ScrollTrigger
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 先收集所有 slide 的原始背景色（在改變之前）
    const originalBgColors = slides.map(slide => {
      return getComputedStyle(slide).backgroundColor;
    });

    slides.forEach((slide, index) => {
      const imgs = slide.querySelectorAll('.hero-project-img');
      const bgColor = originalBgColors[index];

      // 初始狀態設置
      if (index === 0) {
        // 第一個 slide：顯示背景色和圖片
        gsap.set(slide, { backgroundColor: bgColor });
        imgs.forEach(img => gsap.set(img, { opacity: 1 }));
      } else {
        // 其他 slides：白色背景，圖片隱藏
        gsap.set(slide, { backgroundColor: '#ffffff' });
        imgs.forEach(img => gsap.set(img, { opacity: 0 }));
      }

      // ScrollTrigger：進場動畫（第一個 slide 不需要）
      if (index !== 0) {
        ScrollTrigger.create({
          trigger: slide,
          start: "top 80%",
          end: "top 20%",
          onEnter: () => {
            // 動畫序列：白色 → 彩色背景 → 圖片淡入
            const tl = gsap.timeline();
            tl.to(slide, {
              backgroundColor: bgColor,
              duration: 0.4,
              ease: "power2.out"
            });
            imgs.forEach(img => {
              tl.to(img, {
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
              }, "-=0.2");
            });
          },
          onLeaveBack: () => {
            // 向上滾動離開時，重置為白色
            imgs.forEach(img => {
              gsap.to(img, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
              });
            });
            gsap.to(slide, {
              backgroundColor: '#ffffff',
              duration: 0.3,
              ease: "power2.in"
            });
          }
        });
      }

      // 更新 active dot
      ScrollTrigger.create({
        trigger: slide,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveDotMobile(index),
        onEnterBack: () => setActiveDotMobile(index)
      });
    });

    // 設置第一個 dot 為 active
    setActiveDotMobile(0);

    function setActiveDotMobile(i) {
      dots.forEach(d => d.classList.remove('is-active'));
      if (dots[i]) dots[i].classList.add('is-active');
    }

    // 點擊 dot 滾動到對應 slide
    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        if (slides[i]) {
          slides[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

document.addEventListener("DOMContentLoaded", initHeroProject);
