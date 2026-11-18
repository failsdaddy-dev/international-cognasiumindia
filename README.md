# Cognasium India: international debating ad page

A **shorter version of https://cognasiumindia.com/**, using the same design, for the Meta ad ("Already debating at school? Take it international.").
Fewer sections, one programme (debate), and every button goes to WhatsApp.

- **This folder:** `C:\Agents\cognasiumindia-site\international-site\`
- **GitHub:** https://github.com/failsdaddy-dev/international-cognasiumindia (branch `main`)
- **Address (once connected):** https://international.cognasiumindia.com/
- **Hosting:** its own Vercel project (separate from the main site in `..\main-site\`)
- Plain HTML, CSS and vanilla JS. No framework, no build step. All paths are relative, so `index.html` also opens by double-clicking.

---

## Sections (top to bottom)
1. Header: logo + "WhatsApp us" button
2. Hero (yellow): "Already debating at school? Take it international.", chips and the trainer photo
3. Moving ribbon of programmes
4. Two-question flow (goal + grade) → result card → WhatsApp with the answers pre-filled
5. What you get (5 cards)
6. The programme and fees: **only Cognasium Core (debate)**, monthly / quarterly / annual. The button opens WhatsApp.
7. "Good at school debates…" + "Which level is your child?" recommendations
8. Testimonials: the five published reviews with their real photos
9. Wall of fame: 6 achievement posters + the schools collage
10. FAQ (4 questions)
11. Final WhatsApp call to action + call link
12. Footer: **Main website** link, contacts, Instagram, YouTube. Phones also get the sticky WhatsApp bar.

**Left out compared with the main site:** How it works, Why Cognasium + founder, Programmes list, the other 3 fee cards and the fee concessions.

## Files
```
international-site/
├── index.html          ← the page (noindex)
├── css/styles.css      ← copy of the main site's styles + a rule for the single price card (at the end)
├── css/animations.css  ← copy of the main site's animations
├── js/config.js        ← EDIT HERE: all text, fees, testimonials, FAQ, WhatsApp number/messages
├── js/main.js          ← copy of the main site's code + safe skipping of missing sections, Lead event_id, utm pass-through
├── assets/             ← favicons + img/ (only the images this page uses, copied from the main site)
├── vercel.json         ← clean URLs, security headers, noindex header, asset cache
└── README.md           ← this file (not published)
```
The two sites are separate: a change on the main site is **not** copied here automatically. Copy it over on purpose if the ad page needs it too.

## Run it locally
Double-click `index.html`, or:
```
cd C:\Agents\cognasiumindia-site\international-site
python -m http.server 8766
```
Then open http://127.0.0.1:8766/

## Meta Pixel (`4022027848040743`, in the `<head>` of `index.html`)
- `PageView` on load.
- **`Lead`** on every WhatsApp button tap (header, quiz result, price card, final call to action, sticky bar), with an `event_id`, `channel`, `content_name` and `button_text`. Never on page load.

**How to check it:** with the **Meta Pixel Helper** Chrome extension, open the page and `PageView` shows; tap any WhatsApp button and `Lead` shows. Or use **Events Manager → Test Events**.

**utm / fbclid:** links to https://cognasiumindia.com/ (the footer's "Main website") copy any `utm_*` and `fbclid` from the ad URL, so visits that continue to the main site are still attributed to the ad.

## Updating
Edit the files here, then:
```
git add -A
git commit -m "describe the change"
git push
```
Commits must be authored by `failsdaddy-dev` (already set in this repo), because the Vercel Hobby plan skips other authors.
`/assets/*` is cached for 30 days, so give a replaced image a new file name.

## Going live (first time)
1. Vercel → **Add New → Project** → import `failsdaddy-dev/international-cognasiumindia`, Framework **Other**, no build command, output directory blank → **Deploy**.
2. In that project → **Settings → Domains** → add `international.cognasiumindia.com` (no redirect).
3. Hostinger → DNS records → **Add**: Type **CNAME**, Name **international**, Value **exactly what Vercel shows**, TTL 300. Don't touch the `@`, `www`, MX or TXT records.
4. In Vercel, press **Refresh** until it shows "Valid Configuration". HTTPS is issued automatically.
5. Use https://international.cognasiumindia.com/ as the Meta ad's destination URL.

## Still missing
- Privacy policy page (none exists yet)
- Whether the ad's "4 to 8" means ages or grades (the page keeps the main site's "Best for Grades 6 to 8")
- The ad video's exact wording
- Families' consent for the testimonial and Wall of Fame photos
