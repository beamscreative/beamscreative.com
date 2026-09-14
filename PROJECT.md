# BEAMS Creative — Website

## Project Overview

| Property | Value |
|----------|-------|
| **Site Name** | BEAMS Creative |
| **Domain** | `www.beamscreative.com` |
| **Repository** | [beamscreative/beamscreative.com](https://github.com/beamscreative/beamscreative.com) |
| **Status** | v1.0 in progress |
| **Hosting** | Cloudflare Pages |
| **CMS** | Sanity org **BEAMS Creative** (`o4voyw8mi`), project `o8sj69wc`, dataset `production` |
| **Studio** | `studio/` → https://beams-creative.sanity.studio (redirects into org `o4voyw8mi`) |

BEAMS Creative is a Hong Kong spatial design studio. The public site is a single landing page. Webflow is no longer used.

---

## Current product (v1.0)

Landing page (current mockup):

- Full-viewport slider with Ken Burns zoom, grayscale treatment, top/bottom scrims
- Desktop and mobile use independent Sanity images
- Center glass dock: WhatsApp, email, Instagram, portfolio (masked refraction icons)
- Portfolio icon reveals Preview / Download PDF; Preview slides a full-screen profile sheet up from the bottom
- Figma wordmark top-left (stacked black / white SVGs; colour follows each slide)
- Glass credit plate with studio facts + notes
- Copyright in the bottom-right corner

Sanity controls:

- Home page slider (desktop image, mobile image, per-slide logo colour, fade / hold timing)
- Portfolio preview pages and the optional PDF download

Hardcoded in `index.html`: social / email links, credit copy, SEO meta, analytics.

---

## Architecture

```
Sanity Studio  --publish-->  Content Lake
                                  |
                          GROQ at build time
                                  |
                         scripts/fetch-content.mjs
                                  |
                           src/content/site.json
                                  |
                    Vite transformIndexHtml (srcset)
                                  |
                         dist/ static HTML
                                  |
                           Cloudflare Pages
                                  |
                    images served from cdn.sanity.io
```

The first paint does not wait on JavaScript for slider images. If Sanity is unreachable, `src/content/site.fallback.json` and `public/images/fallback/` keep the build green.

---

## Repository layout

```
beamscreative.com/
├─ index.html
├─ vite.config.js
├─ package.json
├─ public/                 # favicon, icons, OG image, fallback slides
├─ src/
│  ├─ styles/
│  ├─ scripts/             # GSAP slider
│  └─ content/             # site.json (generated) + fallback
├─ scripts/
│  ├─ fetch-content.mjs
│  └─ seed-content.mjs
├─ studio/                 # Sanity Studio
├─ docs/
└─ PROJECT.md
```

---

## Local development

```bash
cp .env.example .env.local
# fill SANITY_API_READ_TOKEN if the dataset is private
npm install
npm run dev
```

Studio:

```bash
cd studio
npm install
npm run dev
```

`npm run build` runs `scripts/fetch-content.mjs` then Vite. Env vars:

| Name | Required | Purpose |
|------|----------|---------|
| `SANITY_PROJECT_ID` | yes | `o8sj69wc` |
| `SANITY_DATASET` | yes | `production` |
| `SANITY_API_VERSION` | no | default `2025-02-19` |
| `SANITY_API_READ_TOKEN` | if dataset is private | build-time GROQ |
| `SANITY_API_WRITE_TOKEN` | seed only | `scripts/seed-content.mjs` |

---

## Deploy (Cloudflare Pages)

Local Wrangler is not logged in yet, so the first production attach is a dashboard step:

1. Push this repo to GitHub
2. In Cloudflare Pages: Create project → connect `beamscreative/beamscreative.com`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Node version: `22` (see `.nvmrc`)
6. Environment variables:
   - `SANITY_PROJECT_ID=o8sj69wc`
   - `SANITY_DATASET=production`
   - `SANITY_API_VERSION=2025-02-19`
   - `SANITY_API_READ_TOKEN` — required for this project (dataset is not public)
7. Attach `beamscreative.com` and `www.beamscreative.com`
8. Create a Deploy Hook, then in Sanity: webhook on publish → that hook

`wrangler.toml` names the project `beamscreative`.

To retire Webflow after DNS points here: unpublish the Webflow site in the Webflow dashboard, then remove `static.beamscreative.com` if it still serves the old script CDN.

---

## v2.0 (waiting on Figma)

- Third icon opens a portfolio popup
- About us paragraph
- Popup + download PDF driven by existing Sanity documents
- Pause the slider while the popup is open; focus trap, Esc, scroll lock

See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/cms-content-model.md](docs/cms-content-model.md).

---

## Notes

- This file is the project source of truth.
- GSAP is core-only. No Club plugins.
- Do not commit `.env.local` or Sanity tokens.
