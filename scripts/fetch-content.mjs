import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@sanity/client'
import createImageUrlBuilder from '@sanity/image-url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const generatedPath = resolve(root, 'src/content/site.json')
const fallbackPath = resolve(root, 'src/content/site.fallback.json')
const localizedImagesPath = resolve(root, 'public/images/generated')

loadEnvFiles(root)

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2025-02-19'
const token = process.env.SANITY_API_READ_TOKEN

const QUERY = `{
  "homeSlider": *[_id == "homeSlider"][0]{
    fadeDuration,
    holdDuration,
    slides[]{
      alt,
      logoTone,
      imageDesktop{
        asset->{_id, url, metadata{lqip, dimensions{width, height}}},
        hotspot,
        crop
      },
      imageTablet{
        asset->{_id, url, metadata{lqip, dimensions{width, height}}},
        hotspot,
        crop
      },
      imageMobile{
        asset->{_id, url, metadata{lqip, dimensions{width, height}}},
        hotspot,
        crop
      }
    }
  },
  "portfolioPopup": *[_id == "portfolioPopup"][0]{
    enabled,
    title,
    items[]{
      _key,
      caption,
      image{
        asset->{_id, url, metadata{lqip, dimensions{width, height}}},
        hotspot,
        crop
      }
    },
    body
  },
  "portfolioDownload": *[_id == "portfolioDownload"][0]{
    enabled,
    label,
    file{ asset->{_id, url, originalFilename} }
  }
}`

function loadEnvFiles(dir) {
  for (const name of ['.env', '.env.local']) {
    const file = resolve(dir, name)
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = value
    }
  }
}

function readFallback() {
  return JSON.parse(readFileSync(fallbackPath, 'utf8'))
}

function hasAsset(image) {
  return Boolean(image?.asset?._id || image?.asset?._ref)
}

function toSite(data) {
  const fallback = readFallback()
  const slider = data?.homeSlider
  const slides = (slider?.slides || [])
    .filter((slide) => hasAsset(slide?.imageDesktop) || hasAsset(slide?.imageTablet) || hasAsset(slide?.imageMobile))
    .map((slide) => ({
      ...slide,
      logoTone: slide.logoTone === 'black' ? 'black' : 'white',
    }))

  const popup = data?.portfolioPopup || {}
  const popupItems = (popup.items || []).filter((item) => hasAsset(item?.image))

  return {
    fadeDuration: Number(slider?.fadeDuration ?? fallback.fadeDuration),
    holdDuration: Number(slider?.holdDuration ?? fallback.holdDuration),
    slides: slides.length ? slides : fallback.slides,
    portfolioPopup: {
      ...popup,
      // The popup always has pages: CMS pages when supplied, otherwise the committed profile.
      items: popup.enabled && popupItems.length ? popupItems : fallback.portfolioPopup.items,
    },
    portfolioDownload: data?.portfolioDownload || fallback.portfolioDownload,
  }
}

function writeSite(site, source) {
  mkdirSync(dirname(generatedPath), { recursive: true })
  writeFileSync(generatedPath, `${JSON.stringify(site, null, 2)}\n`)
  console.log(`[fetch-content] wrote src/content/site.json from ${source}`)
}

async function localizeImage(image, variant, width, builder) {
  if (!hasAsset(image)) return image

  const assetId = image.asset._id || image.asset._ref
  const fingerprint = assetId.split('-')[1] || assetId.replaceAll(/[^a-z0-9]/gi, '')
  const filename = `${fingerprint}-${variant}-${width}.webp`
  const outputPath = resolve(localizedImagesPath, filename)

  if (!existsSync(outputPath)) {
    const url = builder.image(image).width(width).fit('max').format('webp').quality(82).url()
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Image download failed (${response.status}): ${url}`)
    mkdirSync(localizedImagesPath, { recursive: true })
    writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()))
  }

  return { src: `/images/generated/${filename}` }
}

async function localizeSliderImages(site) {
  const builder = createImageUrlBuilder({ projectId, dataset })
  const slides = await Promise.all(
    site.slides.map(async (slide, index) => {
      const tabletSource = slide.imageTablet || slide.imageDesktop || slide.imageMobile
      const [imageDesktop, imageTablet, imageMobile] = await Promise.all([
        localizeImage(slide.imageDesktop || tabletSource, `slide-${index + 1}-desktop`, 2600, builder),
        localizeImage(tabletSource, `slide-${index + 1}-tablet`, 1366, builder),
        localizeImage(slide.imageMobile || tabletSource, `slide-${index + 1}-mobile`, 1200, builder),
      ])
      return { ...slide, imageDesktop, imageTablet, imageMobile }
    }),
  )

  return { ...site, slides }
}

async function main() {
  const fallback = readFallback()

  if (!projectId) {
    console.warn('[fetch-content] SANITY_PROJECT_ID missing; using fallback content')
    writeSite(fallback, 'fallback')
    return
  }

  try {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })
    const data = await client.fetch(QUERY)
    const site = await localizeSliderImages(toSite(data))
    writeSite(site, `sanity:${projectId}/${dataset}`)
  } catch (error) {
    console.warn(`[fetch-content] Sanity fetch failed (${error.message}); using fallback content`)
    writeSite(fallback, 'fallback')
  }
}

await main()
