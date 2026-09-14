import gsap from 'gsap'

export function initSlider(root = document) {
  const section = root.querySelector('.stage')
  if (!section || typeof gsap === 'undefined') return { pause() {}, resume() {} }

  const fade = Number(section.dataset.fade || 0.8)
  const hold = Number(section.dataset.hold || 4)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobileMq = window.matchMedia('(max-width: 640px)')
  const tabletMq = window.matchMedia('(min-width: 641px) and (max-width: 1023px)')

  let index = 0
  let busy = false
  let paused = false
  let call
  let slides = []

  function getRoot() {
    if (mobileMq.matches) return document.querySelector('.cs-bg-stack-m')
    if (tabletMq.matches) return document.querySelector('.cs-bg-stack-t')
    return document.querySelector('.cs-bg-stack')
  }

  function readSlides() {
    const stack = getRoot()
    if (!stack) return []
    return gsap.utils.toArray(stack.querySelectorAll('.cs-bg'))
  }

  function resetAllStacks() {
    gsap.set('.cs-bg-stack .cs-bg, .cs-bg-stack-t .cs-bg, .cs-bg-stack-m .cs-bg', { autoAlpha: 0 })
  }

  function emitSlideChange(image, duration = 0) {
    section.dispatchEvent(
      new CustomEvent('beams:slidechange', {
        detail: { image, duration },
      }),
    )
  }

  function showCurrent() {
    if (!slides.length) return
    gsap.set(slides, { autoAlpha: 0 })
    gsap.set(slides[index], { autoAlpha: 1 })
    emitSlideChange(slides[index], 0)
  }

  function schedule() {
    if (call) call.kill()
    if (paused || reduced || slides.length < 2) return
    call = gsap.delayedCall(hold, next)
  }

  function goTo(nextIndex) {
    if (!slides.length || busy || nextIndex === index) return
    busy = true
    const prev = index
    index = nextIndex
    const duration = reduced ? 0 : fade
    emitSlideChange(slides[index], duration)
    gsap.to(slides[prev], { autoAlpha: 0, duration, ease: 'power2.inOut', overwrite: 'auto' })
    gsap.to(slides[index], {
      autoAlpha: 1,
      duration,
      ease: 'power2.inOut',
      overwrite: 'auto',
      onComplete() {
        busy = false
        schedule()
      },
    })
  }

  function next() {
    if (!slides.length) return
    goTo((index + 1) % slides.length)
  }

  function boot() {
    if (call) call.kill()
    busy = false
    index = 0
    resetAllStacks()
    slides = readSlides()
    showCurrent()
    schedule()
  }

  function pause() {
    paused = true
    if (call) call.kill()
  }

  function resume() {
    paused = false
    schedule()
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('a, button, input, textarea, select, label, .about-dock, .about-panel, .page-corner-mark, dialog')) return
    if (paused) return
    if (call) call.kill()
    next()
  })

  for (const mq of [mobileMq, tabletMq]) {
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', boot)
    else if (typeof mq.addListener === 'function') mq.addListener(boot)
  }

  boot()

  return { pause, resume }
}
