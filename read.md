//home backup
<script>
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector('.hero-project-wrapper');
  // ① 動態抓取所有 slide（不用手動列出）
  const slides  = Array.from(wrapper.querySelectorAll('.hero-project-item'));

  // ② 右側手動放好的 dots（數量需與 slides 相同；不相同就只取最小值）
  const dots    = Array.from(document.querySelectorAll('.nav-line .nav-dot'));
  const count   = Math.min(slides.length, dots.length);

  let step = 0;
  let animating = false;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  // 初始顯示：只露出第 0 張；wrapper 背景跟著第 0 張
  slides.forEach((s,i)=> gsap.set(s,{opacity:i===0?1:0, position:"absolute", inset:0}));
  animateBg(slides[0]);
  setActiveDot(0);

  // 背景色過渡
  function animateBg(toSlide) {
    const bgColor = getComputedStyle(toSlide).backgroundColor;
    gsap.to(wrapper, { backgroundColor:bgColor, duration:0.6, ease:"power2.out" });
  }

  // slide 切換 + image 進出場
  function go(from, to){
    if (animating || from === to) return;
    animating = true;

    animateBg(to);

    const fromImg = from.querySelector('.hero-project-img');
    const toImg   = to.querySelector('.hero-project-img');

    gsap.set(to,{opacity:0});
    gsap.set(toImg,{scale:0.97, opacity:0});

    gsap.timeline({
      defaults:{duration:0.5, ease:"power3.out"},
      onComplete:()=>{ animating = false; }
    })
    .to(from,{opacity:0},0)
    .to(to,{opacity:1},0.05)
    .to(fromImg,{opacity:0, scale:1.02},0)
    .to(toImg,{opacity:1, scale:1},0);
  }

  // 前進（循環）
  function nextSlide(){
    const next = (step + 1) % count;
    go(slides[step], slides[next]);
    step = next;
    setActiveDot(step);
  }

  // ③ nav-dot 點擊 → 切到對應 slide
  for (let i=0; i<count; i++){
    dots[i].addEventListener('click', (e) => {
      e.preventDefault();
      if (i === step) return;
      go(slides[step], slides[i]);
      step = i;
      setActiveDot(step);
    });
  }

  // dot active 樣式同步
  function setActiveDot(i){
    dots.forEach(d => d.classList.remove('is-active'));
    if (dots[i]) dots[i].classList.add('is-active');
  }

  // Desktop：點 wrapper 整區切換下一張
  if (!isMobile){
    wrapper.addEventListener("click", nextSlide);
  }

  // Mobile：swipe + scroll（沿用你的原邏輯）
  if (isMobile){
    let startY = 0;
    wrapper.style.touchAction = "pan-y";

    wrapper.addEventListener("touchstart", e =>{
      startY = e.touches[0].clientY;
    }, {passive:true});

    wrapper.addEventListener("touchend", e =>{
      const diff = startY - e.changedTouches[0].clientY;
      if(Math.abs(diff)>40 && diff>0){ nextSlide(); }
    }, {passive:true});

    let lastScroll = 0;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if(y > lastScroll + 60){
        nextSlide();
        lastScroll = y;
      }
    });
  }
});
<script>