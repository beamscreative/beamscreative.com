import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import { createClient } from '@sanity/client'
import createImageUrlBuilder from '@sanity/image-url'
import { recordProfileLead } from './scripts/record-profile-lead.mjs'

const DESKTOP_WIDTHS = [800, 1080, 1600, 2000, 2600, 3200]
const TABLET_WIDTHS = [768, 1024, 1366, 1600]
const MOBILE_WIDTHS = [500, 800, 1200]
const PORTFOLIO_WIDTHS = [800, 1280, 1920, 2560]

function loadSite() {
  const generated = resolve('src/content/site.json')
  const fallback = resolve('src/content/site.fallback.json')
  const path = existsSync(generated) ? generated : fallback
  return JSON.parse(readFileSync(path, 'utf8'))
}

function escapeAttr(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return 'https://www.beamscreative.com/og-img.jpg'
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `https://www.beamscreative.com${path}`
}

function seoImageUrl(image, builder) {
  if (image?.src) return absoluteUrl(image.src)
  if (builder && image?.asset) {
    return builder.image(image).width(1200).height(630).fit('crop').auto('format').quality(85).url()
  }
  return absoluteUrl('/og-img.jpg')
}

function renderSeoHead(site, builder) {
  const seo = site.siteSettings?.seo || {}
  const title =
    seo.title || 'BEAMS Creative | Spatial & Interior Design Studio in Hong Kong'
  const description =
    seo.description ||
    'BEAMS Creative is a Hong Kong spatial design studio specializing in interiors, retail, exhibitions, pop-ups, and installations. Built Environments At Minimal and Sustainable — based at PMQ, Central.'
  const image = seoImageUrl(seo.image, builder)
  const safeTitle = escapeHtml(title)
  const safeDesc = escapeAttr(description)
  const safeImage = escapeAttr(image)

  return [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDesc}">`,
    `<meta property="og:title" content="${escapeAttr(title)}">`,
    `<meta property="og:description" content="${safeDesc}">`,
    `<meta property="og:image" content="${safeImage}">`,
    `<meta property="og:type" content="website">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeAttr(title)}">`,
    `<meta name="twitter:description" content="${safeDesc}">`,
  ].join('\n  ')
}

function renderSeoJsonLd(site, builder) {
  const seo = site.siteSettings?.seo || {}
  const contact = site.siteSettings?.contact || {}
  const description =
    seo.description ||
    'BEAMS Creative is a Hong Kong spatial design studio specializing in interiors, commercial retail spaces, exhibitions, pop-ups, and spatial art installations. Built Environments At Minimal and Sustainable.'
  const sameAs = [contact.instagramUrl].filter(Boolean)
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'BEAMS Creative',
    alternateName: 'BEAMS Creative Ltd.',
    url: 'https://www.beamscreative.com/',
    logo: 'https://www.beamscreative.com/icons/wordmark-black.svg',
    image: seoImageUrl(seo.image, builder),
    description,
    slogan: 'Built Environments At Minimal and Sustainable',
    email: contact.email || 'hello@beamscreative.com',
    areaServed: ['Hong Kong', 'Worldwide'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'PMQ',
      addressLocality: 'Central',
      addressRegion: 'Hong Kong',
      addressCountry: 'HK',
    },
    sameAs: sameAs.length ? sameAs : ['https://www.instagram.com/beams.creative/'],
    knowsAbout: [
      'Spatial design',
      'Interior design',
      'Commercial retail design',
      'Exhibition design',
      'Pop-up events',
      'Spatial art installations',
      'Modular reusable structures',
      'Sustainable design',
    ],
  }

  return `<script type="application/ld+json">\n  ${JSON.stringify(data, null, 2).replaceAll('\n', '\n  ')}\n  </script>`
}

function renderGoogleAnalytics(site) {
  const id = String(site.siteSettings?.googleAnalyticsId || '').trim()
  if (!id) return ''
  const safeId = escapeAttr(id)
  return [
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${safeId}"></script>`,
    '<script>',
    '    window.dataLayer = window.dataLayer || [];',
    '    function gtag(){dataLayer.push(arguments);}',
    "    gtag('js', new Date());",
    `    gtag('config', '${safeId}');`,
    '  </script>',
  ].join('\n  ')
}

function renderMetaPixel(site) {
  const id = String(site.siteSettings?.metaPixelId || '').trim()
  if (!id) return ''
  const safeId = escapeAttr(id)
  return [
    '<script>',
    `    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`,
    `    fbq('init', '${safeId}');`,
    "    fbq('track', 'PageView');",
    '  </script>',
  ].join('\n  ')
}

function renderDock(site) {
  const contact = site.siteSettings?.contact || {}
  const whatsapp = escapeAttr(contact.whatsappUrl || 'https://wa.me/85292458159')
  const instagram = escapeAttr(contact.instagramUrl || 'https://www.instagram.com/beams.creative/')
  const email = escapeAttr(contact.email || 'hello@beamscreative.com')

  return [
    '<nav class="dock" aria-label="Contact">',
    `      <a class="glass-icon glass-icon-whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Contact via WhatsApp">`,
    '        <img class="glass-visual glass-visual-default" src="/icons/whatsapp-glass.svg" alt="" width="48" height="48">',
    '        <img class="glass-visual glass-visual-hover" src="/icons/whatsapp-glass-hover.svg" alt="" width="48" height="48">',
    '      </a>',
    `      <a class="glass-icon glass-icon-instagram" href="${instagram}" target="_blank" rel="noopener noreferrer" aria-label="View our Instagram">`,
    '        <img class="glass-visual glass-visual-default" src="/icons/instagram-glass.svg" alt="" width="48" height="48">',
    '        <img class="glass-visual glass-visual-hover" src="/icons/instagram-glass-hover.svg" alt="" width="48" height="48">',
    '      </a>',
    `      <a class="glass-icon glass-icon-mail" href="mailto:${email}" aria-label="Email us">`,
    '        <img class="glass-visual glass-visual-default" src="/icons/mail-glass.svg" alt="" width="48" height="48">',
    '        <img class="glass-visual glass-visual-hover" src="/icons/mail-glass-hover.svg" alt="" width="48" height="48">',
    '      </a>',
    '      <button class="glass-icon glass-icon-assets" type="button" data-open-profile-gate aria-label="Preview or download our company profile">',
    '        <img class="glass-visual glass-visual-default" src="/icons/assets-glass.svg" alt="" width="48" height="48">',
    '        <img class="glass-visual glass-visual-hover" src="/icons/assets-glass-hover.svg" alt="" width="48" height="48">',
    '      </button>',
    '    </nav>',
  ].join('\n    ')
}

function renderAbout(site) {
  const about = site.siteSettings?.about || {}
  const kicker = escapeHtml(about.kicker || 'STUDIO NOTE')
  const body = escapeHtml(about.body || '')
  const facts = (about.facts || [])
    .map(
      (fact) =>
        `<div class="about-row"><span>${escapeHtml(fact.label)}</span><span class="about-rule"></span><span>${escapeHtml(fact.value)}</span></div>`,
    )
    .join('')

  return [
    '<div class="about-dock">',
    '    <section class="about-panel" data-about-panel>',
    `      <button class="about-toggle" type="button" aria-expanded="false" aria-controls="about-content" aria-label="${escapeAttr(about.kicker || 'STUDIO NOTE')}">`,
    '        <span class="about-handle" aria-hidden="true"></span>',
    '      </button>',
    `      <p class="about-kicker">${kicker}</p>`,
    '      <div class="about-content" id="about-content">',
    `        <div class="about-facts">${facts}</div>`,
    `        <p class="about-copy">${body}</p>`,
    '      </div>',
    '    </section>',
    '    </div>',
  ].join('\n    ')
}

function renderProfileGate(site) {
  const gate = site.siteSettings?.profileGate || {}
  const title = escapeHtml(gate.title || 'WE WOULD LIKE MEET YOU!')
  const descriptionLines = String(gate.description || '')
    .split(/\n+/)
    .map((line) => escapeHtml(line.trim()))
    .filter(Boolean)
  const description =
    descriptionLines.length > 1
      ? `${descriptionLines[0]}<br class="desktop-only"> ${descriptionLines.slice(1).join(' ')}`
      : descriptionLines[0] || ''
  const placeholder = escapeAttr(gate.emailPlaceholder || 'your@email.com')
  const submitLabel = escapeHtml(gate.submitLabel || 'ENTER')
  const thankYou = escapeHtml(gate.thankYouTitle || 'THANK YOU!')
  const previewLabel = escapeHtml(gate.previewLabel || 'PREVIEW')

  return [
    `<dialog class="profile-gate" id="profile-gate" aria-labelledby="profile-gate-title">`,
    '    <button class="gate-close" type="button" data-close-profile-gate aria-label="Close">',
    '      <img src="/icons/icon-close-glass.svg" alt="" width="24" height="24">',
    '    </button>',
    '    <form class="gate-step gate-step-email" data-profile-form>',
    '      <div class="gate-header">',
    `        <h2 id="profile-gate-title">${title}</h2>`,
    `        <p>${description}</p>`,
    '      </div>',
    '      <div class="gate-controls">',
    '        <label class="sr-only" for="profile-email">Email address</label>',
    `        <input id="profile-email" name="email" type="email" autocomplete="email" placeholder="${placeholder}" required>`,
    `        <button class="glass-button gate-enter" type="submit">${submitLabel}</button>`,
    '      </div>',
    '    </form>',
    '    <div class="gate-step gate-step-actions" hidden>',
    `      <h2>${thankYou}</h2>`,
    '      <div class="gate-controls">',
    `        <button class="glass-button" type="button" data-open-portfolio>${previewLabel}</button>`,
    '        <!--@portfolio-download-->',
    '      </div>',
    '    </div>',
    '  </dialog>',
  ].join('\n  ')
}

function imageBuilder(env) {
  if (!env.SANITY_PROJECT_ID) return null
  return createImageUrlBuilder({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET || 'production',
  })
}

function srcFor(image, builder, widths) {
  if (image?.src) {
    return { src: image.src, srcset: '' }
  }

  if (!builder || !image?.asset) {
    return null
  }

  const srcset = widths
    .map((width) => `${builder.image(image).width(width).auto('format').quality(80).url()} ${width}w`)
    .join(', ')
  const src = builder.image(image).width(widths.at(-1)).auto('format').quality(80).url()
  return { src, srcset }
}

function renderPortfolio(site, builder) {
  const popup = site.portfolioPopup || {}
  const download = site.portfolioDownload || {}

  const pages = (popup.items || [])
    .map((item, index) => {
      const image = srcFor(item?.image, builder, PORTFOLIO_WIDTHS)
      if (!image) return ''
      const srcset = image.srcset
        ? ` srcset="${escapeAttr(image.srcset)}" sizes="(max-width: 1328px) calc(100vw - 48px), 1280px"`
        : ''
      const loading = index === 0 ? 'eager' : 'lazy'
      const alt = item.caption || `Portfolio page ${index + 1}`
      return `<img src="${escapeAttr(image.src)}"${srcset} alt="${escapeAttr(alt)}" loading="${loading}" decoding="async">`
    })
    .join('')

  const url = download.file?.asset?.url || ''
  const label = escapeHtml(download.label || 'DOWNLOAD')
  const downloadHtml = `<a class="glass-button" data-download-profile href="${escapeAttr(url || '#')}" target="_blank" rel="noopener noreferrer">${label}</a>`

  return { pages, downloadHtml }
}

function readJsonBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString() || '{}'))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function profileLeadDevApi(env) {
  async function handle(req, res) {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end()
      return
    }

    try {
      const payload = await readJsonBody(req)
      const client = createClient({
        projectId: env.SANITY_PROJECT_ID,
        dataset: env.SANITY_DATASET || 'production',
        apiVersion: env.SANITY_API_VERSION || '2025-02-19',
        token: env.SANITY_API_WRITE_TOKEN,
        useCdn: false,
      })
      const result = await recordProfileLead(client, payload)
      res.statusCode = result.ok ? 200 : result.status || 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
    } catch (error) {
      console.error('[profile-lead]', error)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: false, error: 'server_error' }))
    }
  }

  return {
    name: 'profile-lead-api',
    configureServer(server) {
      server.middlewares.use('/api/profile-lead', handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/profile-lead', handle)
    },
  }
}

function renderSlides(slides, variant, builder) {
  const key = variant === 'desktop' ? 'imageDesktop' : variant === 'tablet' ? 'imageTablet' : 'imageMobile'
  const widths = variant === 'desktop' ? DESKTOP_WIDTHS : variant === 'tablet' ? TABLET_WIDTHS : MOBILE_WIDTHS

  return (slides || [])
    .map((slide, index) => {
      const source = slide?.[key] || slide?.imageDesktop || slide?.imageMobile
      const image = srcFor(source, builder, widths)
      if (!image) return ''
      const loading = index === 0 ? 'eager' : 'lazy'
      const active = index === 0 ? ' cs-bg-active' : ''
      const priority = index === 0 ? ' fetchpriority="high"' : ''
      const srcset = image.srcset ? ` srcset="${escapeAttr(image.srcset)}" sizes="100vw"` : ''
      return `<img src="${escapeAttr(image.src)}"${srcset} alt="${escapeAttr(slide.alt)}" class="cs-bg${active}" crossorigin="anonymous" loading="${loading}" decoding="async"${priority}>`
    })
    .join('')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      profileLeadDevApi(env),
      {
        name: 'inject-slides',
        transformIndexHtml(html) {
          const site = loadSite()
          const builder = imageBuilder(env)
          const portfolio = renderPortfolio(site, builder)
          const copyright = escapeHtml(site.siteSettings?.copyright || '©2026 BEAMS Creative Ltd. All rights reserved')
          return html
            .replace('<!--@seo-head-->', renderSeoHead(site, builder))
            .replace('<!--@seo-jsonld-->', renderSeoJsonLd(site, builder))
            .replace('<!--@google-analytics-->', renderGoogleAnalytics(site))
            .replace('<!--@meta-pixel-->', renderMetaPixel(site))
            .replace('<!--@dock-->', renderDock(site))
            .replace('<!--@about-->', renderAbout(site))
            .replace('<!--@profile-gate-->', renderProfileGate(site))
            .replace('<!--@copyright-->', copyright)
            .replace('<!--@slides-d-->', renderSlides(site.slides, 'desktop', builder))
            .replace('<!--@slides-t-->', renderSlides(site.slides, 'tablet', builder))
            .replace('<!--@slides-m-->', renderSlides(site.slides, 'mobile', builder))
            .replace('<!--@portfolio-download-->', portfolio.downloadHtml)
            .replace('<!--@portfolio-pages-->', portfolio.pages)
            .replace('data-fade="0.8"', `data-fade="${site.fadeDuration ?? 0.8}"`)
            .replace('data-hold="4"', `data-hold="${site.holdDuration ?? 4}"`)
        },
      },
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  }
})
