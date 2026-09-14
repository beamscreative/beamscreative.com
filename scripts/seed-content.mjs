import { createReadStream, existsSync, readFileSync } from 'node:fs'
import { basename, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { createClient } from '@sanity/client'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

loadEnvFiles(root)

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2025-02-19'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  throw new Error('SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN are required to seed content')
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

const slides = [
  ['slide-01-d.avif', 'slide-01-m.avif', 'white'],
  ['slide-02-d.avif', 'slide-02-m.avif', 'black'],
  ['slide-02-d-1.avif', 'slide-03-m.avif', 'black'],
  ['slide-03-d.avif', 'slide-04-m.avif', 'white'],
]

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

async function uploadImage(filename) {
  const filePath = resolve(root, 'public/images/fallback', filename)
  const asset = await client.assets.upload('image', createReadStream(filePath), {
    filename: basename(filePath),
    contentType: 'image/avif',
  })
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
  }
}

const slideDocs = []
for (const [desktop, mobile, logoTone] of slides) {
  const desktopImage = await uploadImage(desktop)
  slideDocs.push({
    _key: randomUUID(),
    _type: 'slide',
    alt: '',
    logoTone,
    imageDesktop: desktopImage,
    imageTablet: desktopImage,
    imageMobile: await uploadImage(mobile),
  })
}

await client.createOrReplace({
  _id: 'homeSlider',
  _type: 'homeSlider',
  fadeDuration: 0.8,
  holdDuration: 4,
  slides: slideDocs,
})

await client.createOrReplace({
  _id: 'portfolioPopup',
  _type: 'portfolioPopup',
  enabled: false,
  title: 'Portfolio',
  items: [],
})

await client.createOrReplace({
  _id: 'portfolioDownload',
  _type: 'portfolioDownload',
  enabled: false,
  label: 'Download portfolio',
})

await client.createOrReplace({
  _id: 'siteSettings',
  _type: 'siteSettings',
  googleAnalyticsId: 'G-50YR6SF7F9',
  metaPixelId: '168718217394737',
  copyright: '©2026 BEAMS Creative Ltd. All rights reserved',
  seo: {
    _type: 'seo',
    title: 'BEAMS Creative | Spatial & Interior Design Studio in Hong Kong',
    description:
      'BEAMS Creative is a Hong Kong spatial design studio specializing in interiors, retail, exhibitions, pop-ups, and installations. Built Environments At Minimal and Sustainable — based at PMQ, Central.',
  },
  contact: {
    _type: 'contactLinks',
    whatsappUrl: 'https://wa.me/85292458159',
    instagramUrl: 'https://www.instagram.com/beams.creative/',
    email: 'hello@beamscreative.com',
  },
  about: {
    _type: 'aboutPanel',
    kicker: 'STUDIO NOTE',
    facts: [
      { _key: 'studio', _type: 'aboutFact', label: 'STUDIO', value: 'STUDIO BEAMS CREATIVE' },
      { _key: 'focus', _type: 'aboutFact', label: 'FOCUS', value: 'RESIDENTIAL · COMMERCIAL' },
      { _key: 'discipline', _type: 'aboutFact', label: 'DISCIPLINE', value: 'INTERIOR ARCHITECTURE' },
      { _key: 'location', _type: 'aboutFact', label: 'LOCATION', value: 'HONG KONG · DETROIT' },
    ],
    body: 'BEAMS Creative is an interior architecture studio working on residential, hospitality, and commercial spaces across Asia Pacific and America. Our goal is to create spaces that are considered and presented as a study in restraint. We start every project on site, reading the light, the structure, and what\'s already there. With a focus on the human experience, we work closely with our clients to shape concepts free of trends and specific to the site, resulting in spaces that feel like they belong.',
  },
  profileGate: {
    _type: 'profileGate',
    title: 'WE WOULD LIKE MEET YOU!',
    description: 'Enter your email to preview or download our company\nprofile and project updates.',
    emailPlaceholder: 'your@email.com',
    submitLabel: 'ENTER',
    thankYouTitle: 'THANK YOU!',
    previewLabel: 'PREVIEW',
  },
})

console.log('Seeded homeSlider, portfolioPopup, portfolioDownload, and siteSettings')
