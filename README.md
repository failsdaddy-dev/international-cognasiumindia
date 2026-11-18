# Cognasium India: international debating ad landing page

One-screen landing page for the Meta ad, served at **https://international.cognasiumindia.com/**.
Plain HTML, CSS and vanilla JS. No build step.

> This repo is GENERATED. Edit the source in `C:\Agents\cognasiumindia-site`
> (`international.html`, `css/international.css`, `js/international*.js`, `assets/img/intl/`),
> then run `python tools/export_international.py` there and commit + push here.
> Full documentation: README section 10 in the main site folder.

## Files
- `index.html`: the page (noindex)
- `css/international.css`: styles
- `js/international-config.js`: **edit here**: Pixel ID, WhatsApp number and message, levels, testimonials
- `js/international.js`: level chips, WhatsApp link, Meta Pixel `Lead` on the WhatsApp tap, testimonial rotation, utm/fbclid pass-through
- `assets/`: images (the site's own photos, WebP)
- `vercel.json`: clean URLs, security headers, noindex header, asset cache

## Meta Pixel
`PageView` on load, `Lead` only when the WhatsApp button is tapped (each with an event_id).
Check with the Meta Pixel Helper extension or Events Manager → Test Events.

## Vercel
Import this repo as a new project: Framework **Other**, no build command, output directory blank.
Add the domain `international.cognasiumindia.com` and copy the CNAME that Vercel shows into Hostinger DNS
(Name `international`). Commits must be authored by `failsdaddy-dev` (Hobby plan).
