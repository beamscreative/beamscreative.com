import gsap from 'gsap'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function hashEmail(email) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function recordLead(email, action) {
  fetch('/api/profile-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, action }),
    keepalive: true,
  }).catch(() => {})
}

async function trackLead(email, eventName, extra = {}) {
  const userId = await hashEmail(email)
  window.gtag?.('set', { user_id: userId })
  window.gtag?.('event', eventName, {
    ...extra,
    email_domain: email.split('@')[1] || '',
  })
}

function hasPdfUrl(anchor) {
  const href = anchor?.getAttribute('href') || ''
  return href.startsWith('http://') || href.startsWith('https://') || href.toLowerCase().includes('.pdf')
}

export function initPortfolio(slider) {
  const gate = document.getElementById('profile-gate')
  const gateOpener = document.querySelector('[data-open-profile-gate]')
  const gateCloser = gate?.querySelector('[data-close-profile-gate]')
  const form = gate?.querySelector('[data-profile-form]')
  const emailStep = gate?.querySelector('.gate-step-email')
  const actionsStep = gate?.querySelector('.gate-step-actions')
  const dialog = document.getElementById('portfolio')
  const openers = document.querySelectorAll('[data-open-portfolio]')
  const downloader = gate?.querySelector('[data-download-profile]')
  const closer = dialog?.querySelector('.portfolio-close')
  const scroller = dialog?.querySelector('.portfolio-scroll')
  if (!gate || !gateOpener || !form || !emailStep || !actionsStep || !dialog) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let visitorEmail = ''

  function showModal(element) {
    if (typeof element.showModal === 'function') element.showModal()
    else element.setAttribute('open', '')
  }

  function closeModal(element) {
    if (typeof element.close === 'function') element.close()
    else element.removeAttribute('open')
  }

  function openGate() {
    slider?.pause()
    emailStep.hidden = false
    actionsStep.hidden = true
    showModal(gate)
    gsap.fromTo(
      gate,
      { autoAlpha: 0, scale: reduced ? 1 : 0.96 },
      { autoAlpha: 1, scale: 1, duration: reduced ? 0 : 0.35, ease: 'power3.out', overwrite: true },
    )
    gate.querySelector('input')?.focus()
  }

  function closeGate({ restoreFocus = true } = {}) {
    if (!gate.open) return
    gsap.to(gate, {
      autoAlpha: 0,
      scale: reduced ? 1 : 0.98,
      duration: reduced ? 0 : 0.2,
      ease: 'power2.in',
      overwrite: true,
      onComplete() {
        closeModal(gate)
        if (restoreFocus) gateOpener.focus()
      },
    })
  }

  function unlockActions() {
    emailStep.hidden = true
    actionsStep.hidden = false
    gsap.fromTo(
      actionsStep,
      { autoAlpha: 0, y: reduced ? 0 : 8 },
      { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.3, ease: 'power2.out' },
    )
    actionsStep.querySelector('button, a')?.focus()
  }

  function openSheet() {
    if (visitorEmail) {
      recordLead(visitorEmail, 'preview')
      trackLead(visitorEmail, 'profile_preview')
    }
    closeGate({ restoreFocus: false })
    window.setTimeout(() => {
      showModal(dialog)
      if (scroller) scroller.scrollTop = 0
      gsap.fromTo(
        dialog,
        { y: '100%' },
        { y: '0%', duration: reduced ? 0 : 0.55, ease: 'power3.out', overwrite: true },
      )
      closer?.focus()
    }, reduced ? 0 : 210)
  }

  function closeSheet() {
    if (!dialog.open) return
    gsap.to(dialog, {
      y: '100%',
      duration: reduced ? 0 : 0.4,
      ease: 'power3.in',
      overwrite: true,
      onComplete() {
        closeModal(dialog)
        gateOpener.focus()
      },
    })
  }

  gateOpener.addEventListener('click', (event) => {
    event.stopPropagation()
    openGate()
  })

  gateCloser?.addEventListener('click', () => closeGate())

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!form.reportValidity()) return
    const email = String(new FormData(form).get('email') || '').trim().toLowerCase()
    if (!EMAIL_RE.test(email)) return
    visitorEmail = email
    recordLead(email, 'submit')
    trackLead(email, 'profile_email_submit')
    unlockActions()
  })

  openers.forEach((opener) => opener.addEventListener('click', openSheet))
  closer?.addEventListener('click', closeSheet)

  downloader?.addEventListener('click', (event) => {
    if (!hasPdfUrl(downloader)) {
      event.preventDefault()
      return
    }
    if (visitorEmail) {
      recordLead(visitorEmail, 'download')
      trackLead(visitorEmail, 'profile_download')
    }
  })

  gate.addEventListener('cancel', (event) => {
    event.preventDefault()
    closeGate()
  })

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    closeSheet()
  })

  gate.addEventListener('close', () => {
    if (!dialog.open) slider?.resume()
  })

  dialog.addEventListener('close', () => slider?.resume())
}
