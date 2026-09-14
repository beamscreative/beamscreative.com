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
  const downloadHtml = `<a class="glass-button" data-download-profile href="${escapeAttr(url || '#')}" target="_blank" rel="noopener noreferrer">DOWNLOAD</a>`

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
          return html
            .replace('<!--@slides-d-->', renderSlides(site.slides, 'desktop', builder))
            .replace('<!--@slides-t-->', renderSlides(site.slides, 'tablet', builder))
            .replace('<!--@slides-m-->', renderSlides(site.slides, 'mobile', builder))
            .replace('<!--@portfolio-pages-->', portfolio.pages)
            .replace('<!--@portfolio-download-->', portfolio.downloadHtml)
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
