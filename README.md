# Cognasium India: international debating ad page

A **short page** for the Meta ad ("Already debating at school? Take it international.").
It's a very short version of https://cognasiumindia.com/ in the same yellow and navy design, with one programme (international debating), all testimonials, our students' photos and one big WhatsApp button.
Why it exists (from the Loom review): the long main site gave parents too many choices, so the ad clicks weren't turning into leads.

- **This folder:** `C:\Agents\cognasiumindia-site\international-site\`
- **GitHub:** https://github.com/failsdaddy-dev/international-cognasiumindia (branch `main`)
- **Address (once connected):** https://international.cognasiumindia.com/
- **Hosting:** its own Vercel project (separate from the main site in `..\main-site\`)
- Plain HTML, CSS and vanilla JS. No framework, no build step. Relative paths, so double-clicking `index.html` also works.

---

## Layout
**Screen 1: everything needed to convert, with no scrolling on any phone or desktop:**
1. **Yellow hero** (same style as the main site): logo, "Main website" link, LIVE ONLINE / INTERNATIONAL DEBATING chips, the headline "Already debating at school?" with the navy "Take it international." box, and one supporting line (hidden on very short screens)
2. **Navy proof bar:** World Champion, trained by us · APD · BPD · WSDC formats · Team + tournament, we register you
3. **"Which level is your child?"** (optional): Beginner / School debater / Advanced
4. **Big green 3D "Message us on WhatsApp" button** + "Usually the quickest way to reach us"
5. **All 5 testimonials:** overlapping photo faces + a rotating quote (every 4.5 s, pauses on touch or hover, tap a face to jump to it)
6. "See our students' wins ↓"

**Below the fold (about 1½ more screens on a phone):**
7. **Our students' wins:** a swipe gallery of the 6 Wall of Fame posters with captions, arrows and dots
8. **How it works:** 3 steps
9. **Final call to action:** "Ready for the next stage?" + the WhatsApp button
10. **Footer:** main website link, "Nothing you tap here is stored.", ©

- **Phones:** a WhatsApp bar slides up from the bottom once the main button has scrolled away, and hides at the final call to action.
- **Desktop:** a phone-width page centred on a navy background.

`noindex, nofollow`. No form; nothing is stored.

**Tested:** screen 1 fits with nothing hidden at 360×640, 360×560, 390×844, 390×700, 430×932, 1366×768 and 1920×1080. The whole page is about 2.2 to 3.4 screen heights.

## Files
```
international-site/
├── index.html      ← the page (Meta Pixel base code in <head>)
├── css/styles.css  ← all styles (colours as CSS variables at the top)
├── js/config.js    ← EDIT HERE: Pixel ID, WhatsApp number + message, levels, posters + captions, steps, testimonials
├── js/main.js      ← level chips, WhatsApp links, Lead event, testimonials, gallery, steps, sticky bar, utm pass-through
├── assets/         ← favicons + img/ (WebP: 6 posters, 5 testimonial photos, logo; about 210 KB in total, posters lazy-loaded)
├── vercel.json     ← clean URLs, security headers, noindex header, 30-day asset cache
├── .vercelignore   ← keeps this README off the live site
└── README.md       ← this file
```

## WhatsApp message
"Hi Cognasium! I saw your ad about international debating. / My child's level: … / Please share the details of the programme."
The level line is left out if no level is tapped, so the button always works.

## Meta Pixel
- **ID:** `4022027848040743`. It's in `js/config.js`, and also in the `<noscript>` image in `index.html`, so change both.
- **Events:** `PageView` on load (with an event_id), and **`Lead` only when a WhatsApp button is tapped** (main, final or sticky), with an event_id, `content_name: "International debating"`, `level` and `button`. Never on page load.
- **How to check:** use the **Meta Pixel Helper** extension (`PageView` on load, `Lead` after tapping the button), or **Events Manager → Test Events**.
- **utm / fbclid:** the "Main website" links copy any `utm_*` and `fbclid` from the ad URL onto https://cognasiumindia.com/.

## Run it locally
Double-click `index.html`, or:
```
cd C:\Agents\cognasiumindia-site\international-site
python -m http.server 8766
```
Then open http://127.0.0.1:8766/

## Updating
Edit the files, then `git add -A`, `git commit -m "…"` and `git push`.
- **Commit author:** commits must be authored by `failsdaddy-dev` (already set in this repo).
- **Images:** `/assets/*` is cached for 30 days, so give a replaced image a new file name.

## Going live (first time)
1. **Vercel:** **Add New → Project** → import `failsdaddy-dev/international-cognasiumindia`, Framework **Other**, no build command → **Deploy**.
2. **Domain:** in that project → **Settings → Domains** → add `international.cognasiumindia.com`.
3. **Hostinger DNS:** **Add** Type **CNAME**, Name **international**, Value **exactly what Vercel shows**, TTL 300.
4. **Check:** in Vercel, **Refresh** until it shows "Valid Configuration". HTTPS is automatic.
5. **Ad:** use https://international.cognasiumindia.com/ as the Meta ad's destination URL.

## Still missing
- Whether the ad's "4 to 8" means ages, grades or a time frame (left off the page)
- The ad video's exact wording
- Privacy policy page (none exists yet)
- Families' consent for the testimonial and Wall of Fame photos
