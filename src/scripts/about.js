import gsap from 'gsap'

export function initAbout(root = document) {
  const panel = root.querySelector('[data-about-panel]')
  const toggle = panel?.querySelector('.about-toggle')
  const content = panel?.querySelector('.about-content')
  if (!panel || !toggle || !content || panel.dataset.aboutReady) return
  panel.dataset.aboutReady = 'true'

  const kicker = panel.querySelector('.about-kicker')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const sheetMq = window.matchMedia('(max-width: 1023px)')
  const shift = { y: 0 }
  let open = false
  let closedY = 0
  let dragging = false
  let didDrag = false
  let dragStartY = 0
  let dragStartShift = 0
  let lastY = 0
  let lastT = 0
  let velocity = 0
  let activePointer = null

  function measureClosedY() {
    const peek = kicker.offsetTop + kicker.offsetHeight
    closedY = Math.max(0, panel.offsetHeight - peek)
  }

  function applyShift() {
    panel.style.setProperty('--about-y', `${shift.y}px`)
  }

  function setShift(y, animate) {
    const nextY = gsap.utils.clamp(0, closedY, y)
    const duration = reduced || !animate ? 0 : 0.48
    gsap.to(shift, {
      y: nextY,
      duration,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: applyShift,
    })
    const progress = closedY ? 1 - nextY / closedY : 1
    gsap.to(content, {
      autoAlpha: progress > 0.92 ? 1 : progress < 0.08 ? 0 : progress,
      y: (1 - progress) * 12,
      duration: reduced || !animate ? 0 : 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  function setOpen(nextOpen, animate = true) {
    open = nextOpen
    panel.classList.toggle('is-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    if (!open) toggle.blur()
    measureClosedY()
    setShift(open ? 0 : closedY, animate)
  }

  function onPointerDown(event) {
    if (!sheetMq.matches || event.button) return
    dragging = true
    didDrag = false
    activePointer = event.pointerId
    dragStartY = event.clientY
    dragStartShift = shift.y
    lastY = event.clientY
    lastT = event.timeStamp
    velocity = 0
    gsap.killTweensOf(shift)
    try {
      panel.setPointerCapture(event.pointerId)
    } catch {
      /* synthetic or unsupported pointer capture */
    }
  }

  function onPointerMove(event) {
    if (!dragging || event.pointerId !== activePointer) return
    const dy = event.clientY - dragStartY
    if (Math.abs(dy) > 6) didDrag = true
    const dt = event.timeStamp - lastT
    if (dt > 0) velocity = ((event.clientY - lastY) / dt) * 1000
    lastY = event.clientY
    lastT = event.timeStamp
    setShift(dragStartShift + dy, false)
  }

  function onPointerUp(event) {
    if (!dragging || event.pointerId !== activePointer) return
    dragging = false
    activePointer = null
    if (!didDrag) return
    const shouldOpen = velocity < -650 || (Math.abs(velocity) < 650 && shift.y < closedY * 0.55)
    setOpen(shouldOpen, true)
  }

  toggle.addEventListener('click', (event) => {
    event.stopPropagation()
    if (didDrag) {
      didDrag = false
      return
    }
    setOpen(!open)
  })

  panel.addEventListener('pointerdown', onPointerDown)
  panel.addEventListener('pointermove', onPointerMove)
  panel.addEventListener('pointerup', onPointerUp)
  panel.addEventListener('pointercancel', onPointerUp)

  const resizeObserver = new ResizeObserver(() => {
    if (dragging) return
    measureClosedY()
    shift.y = open ? 0 : closedY
    applyShift()
  })
  resizeObserver.observe(panel)

  measureClosedY()
  shift.y = closedY
  applyShift()
  gsap.set(content, { autoAlpha: 0, y: 12 })
}
