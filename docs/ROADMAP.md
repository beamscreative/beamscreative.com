# Roadmap

## v1.0 — leave Webflow

Status: in progress

- Single landing page from the exported Webflow coming-soon layout
- Vanilla HTML / CSS / JS + Vite
- Sanity CMS for the home slider
- Host on Cloudflare Pages
- Instagram + WhatsApp only; portfolio icon later

Acceptance:

- [x] Old Webflow-script repo structure removed
- [x] Slider works with independent desktop / mobile images
- [x] Sanity Studio schema for slider, popup, download
- [x] Slider images published in Sanity
- [x] Hosted Studio at https://beams-creative.sanity.studio
- [ ] Cloudflare Pages live on beamscreative.com (needs Cloudflare login + GitHub connect)
- [ ] Webflow site unpublished (BEAMS site is not in the connected Webflow account)
- [ ] Git tag `v1.0.0` (after the first production commit)

## v1.1 — content ops (if needed after launch)

- Sanity webhook → Cloudflare Deploy Hook
- Editor walkthrough for replacing slider images

## v2.0 — mockup redesign

Status: in progress (source: `beams-mockup.html`)

- [x] Glass line-icon dock (WhatsApp, email, Instagram, portfolio)
- [x] Bottom glass credit / about box
- [x] Ken Burns slider + scrims
- [x] Portfolio dialog (CMS-driven; Esc / close; pauses slider)
- [ ] Editor-filled popup images and PDF in Sanity
- [ ] Revisit Typekit / Effra only if a later layout requires it

## Out of scope

- Works / Insight / About standalone pages from the old Webflow site
- GitHub Pages / `static.beamscreative.com` custom scripts
- ScrollSmoother and other Club GreenSock plugins
