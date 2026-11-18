# Cognasium India: international debating ad landing page

A short, **one-screen** page for the Meta ad ("Already debating at school? Take it international."): one choice, one button, straight to WhatsApp.

- **This folder:** `C:\Agents\cognasiumindia-site\international-site\`
- **GitHub:** https://github.com/failsdaddy-dev/international-cognasiumindia (branch `main`)
- **Address (once connected):** https://international.cognasiumindia.com/
- **Hosting:** its own Vercel project (separate from the main site in `..\main-site\`)
- Plain HTML, CSS and vanilla JS. No framework, no build step.

---

## Files

```
international-site/
├── index.html                  ← the page (noindex)
├── css/international.css       ← styles
├── js/international-config.js  ← EDIT HERE: Pixel ID, WhatsApp number + message, levels, testimonials
├── js/international.js         ← level chips, WhatsApp link, Lead event, testimonial rotation, utm/fbclid pass-through
├── assets/                     ← favicons + img/intl/ (the main site's own photos as WebP, about 35 KB in total)
├── vercel.json                 ← clean URLs, security headers, noindex header, 30-day asset cache
├── .vercelignore               ← keeps this README off the live site
└── README.md                   ← this file
```

## Run it locally
```
cd C:\Agents\cognasiumindia-site\international-site
python -m http.server 8766
```
Then open http://127.0.0.1:8766/

## On the page (top to bottom)
1. Logo and a "Main website" link
2. Trainer photo with a LIVE ONLINE tag (shrinks first on short screens)
3. Headline + one supporting line
4. 3 proof chips (claims published on cognasiumindia.com)
5. "Which level is your child?" with Beginner / School debater / Advanced
6. Big 3D yellow "Message us on WhatsApp" button
7. One rotating testimonial (Shweta, Aarti, Pehal, with their published photos): crossfades every 5 s, pauses on hover, touch or focus
8. Footer: main website, "Nothing you tap here is stored.", ©

`noindex, nofollow`. No form; nothing is stored. Fonts: Bricolage Grotesque (headline) and Nunito (body), as on the main site.

**WhatsApp message:** "Hi Cognasium! I saw your ad about international debating. / My child's level: … / Please share the details of the programme." The level line is left out if no chip is tapped, so the button always works.

## Meta Pixel
- The ID is in `js/international-config.js`. It's also in the `<noscript>` image in `index.html`, which can't read config, so change both.
- `PageView` on load, with an `event_id`.
- `Lead` **only** when the WhatsApp button is tapped, with an `event_id`, `content_name: "International debating"` and `level` (beginner / school / advanced / not_selected). Never on page load. No Conversions API.

**How to check it:**
1. With the **Meta Pixel Helper** Chrome extension: open the page and `PageView` shows. Tap the WhatsApp button and `Lead` shows.
2. In **Events Manager → your Pixel → Test Events**: enter the page address, open it, tap a level and the button. `PageView` and `Lead` appear within seconds.

**utm / fbclid:** the "Main website" links copy any `utm_*` and `fbclid` from the ad URL onto https://cognasiumindia.com/, so visits that continue to the main site are still attributed to the ad.

## Tested sizes (no scrolling)
360×640, 360×560, 390×844, 390×700, 430×932, 1366×768, 1920×1080. Only on a landscape phone (640×360) does the card scroll inside itself, and the button stays visible.

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
3. Hostinger → DNS records → **Add**: Type **CNAME**, Name **international**, Value **exactly what Vercel shows** (e.g. `xxxx.vercel-dns-017.com`), TTL 300. Don't touch the `@`, `www`, MX or TXT records.
4. In Vercel, press **Refresh** until it shows "Valid Configuration". HTTPS is issued automatically.
5. Open https://international.cognasiumindia.com/ on a phone, check for the padlock, run the Pixel Helper check, then use that address as the ad's destination URL.

## Still missing
- Privacy policy page (none exists yet, so there's no privacy link)
- Whether the ad's "4 to 8" means ages or grades (left off the page)
- The ad video's exact wording (the page uses "Already debating at school? Take it international.")
- Families' consent for their photos (the same photos as the main site testimonials)
