# CMS content model

Sanity organization **BEAMS Creative** (`o4voyw8mi`), project `o8sj69wc`, dataset `production`. Home slider, portfolio popup, and portfolio download are singletons. Profile leads are created by the site when someone enters an email. Open them from the Studio sidebar; do not create extra singleton copies.

Studio: `npm run studio` locally, or the hosted app at `https://beams-creative.sanity.studio` after deploy.

## Home slider (`homeSlider`)

Controls the landing page background.

| Field | Type | Notes |
|-------|------|--------|
| `slides` | array of objects | At least one. Order is playback order. |
| `slides[].alt` | string | Used on both desktop and mobile `<img>` tags. |
| `slides[].logoTone` | `white` or `black` | Wordmark colour for that slide. The logo crossfades with the photo. Use white on dark photos, black on light photos. |
| `slides[].imageDesktop` | image, hotspot on | Shown above 991px. |
| `slides[].imageMobile` | image, hotspot on | Shown at 991px and below. Independent file, not a crop of desktop. |
| `fadeDuration` | number | Seconds. Default `0.8`. |
| `holdDuration` | number | Seconds between fades. Default `4`. |

Editor tips:

- Upload a desktop image and a mobile image per slide. They can be different compositions.
- Set **Logo colour** per slide so the wordmark stays readable. Consecutive slides with the same colour do not animate the logo.
- Hotspot sets the crop focus. The site requests `auto=format` srcset from the Sanity CDN at build time.
- Publish, then wait for Cloudflare Pages to rebuild (webhook) or trigger a deploy.

## Portfolio popup (`portfolioPopup`)

Tapping the portfolio icon opens the email gate. After submit, **PREVIEW** and **DOWNLOAD** appear. Preview slides a full-screen sheet up from the bottom holding the profile pages, one under the other.

| Field | Type | Notes |
|-------|------|--------|
| `enabled` | boolean | Off (default): the sheet shows the profile pages committed in `public/images/portfolio/`. On: the pages below are used instead. |
| `title` | string | Internal label only. Not rendered. |
| `items` | array | One image per page, in reading order. Export at 16:9 — the sheet enforces that ratio. `caption` becomes the image alt text. |
| `body` | Portable Text | Unused by the current design. Kept for future copy. |

Preview is always available, so the sheet never opens empty.

## Portfolio download (`portfolioDownload`)

Thank-you step always shows **PREVIEW** and **DOWNLOAD**. Download opens the PDF in a new tab.

| Field | Type | Notes |
|-------|------|--------|
| `enabled` | boolean | Unused by the current front end. Upload a PDF to make Download work. |
| `label` | string | Unused by the current front end. The button always reads **DOWNLOAD**. |
| `file` | file | PDF only. Clicking Download opens this file in a new tab. |

## Profile leads (`profileLead`)

Created by `/api/profile-lead` when someone submits the email gate. Editors can view counts in Studio; do not create these by hand.

| Field | Type | Notes |
|-------|------|--------|
| `email` | string | Lowercased address. Plaintext lives in CMS only, not in Google Analytics. |
| `submittedAt` | datetime | First submit. |
| `lastSeenAt` | datetime | Last submit, preview, or download. |
| `previewCount` | number | How many times this email opened Preview. |
| `lastPreviewAt` | datetime | Last Preview. |
| `downloaded` | boolean | True after at least one PDF click. |
| `downloadCount` | number | How many times this email clicked Download. |
| `lastDownloadAt` | datetime | Last Download. |

Google Analytics receives a SHA-256 of the email as `user_id`, plus `profile_email_submit`, `profile_preview`, and `profile_download` events (email domain only, never the raw address).

## Not in CMS (v1.0)

Hardcoded in `index.html`:

- Instagram URL
- WhatsApp URL
- Copyright line
- SEO title / description / OG image
- GA4 and Meta Pixel IDs

## Query

Build-time GROQ lives in `scripts/fetch-content.mjs`. Singletons are read by `_id` (`homeSlider`, `portfolioPopup`, `portfolioDownload`). Image queries always include `asset->{_id, url, metadata{lqip, dimensions}}` plus `hotspot` and `crop`.
