# Cognasium India: international debating ad page

A **short page** for the Meta ad ("Already debating at school? Take it international.").
It's a very short version of https://cognasiumindia.com/ in the same yellow and navy design, with one programme (international debating), all testimonials, our students' photos and a **2-step enquiry form that emails the lead to the client**.

- **Why the form (Nov 2026):** the old WhatsApp button brought junk: random messages, photos and voice notes, mostly from children. The client asked for enquiries by email from a form instead. All WhatsApp has been removed.
- **This folder:** `C:\Agents\cognasiumindia-site\international-site\`
- **GitHub:** https://github.com/failsdaddy-dev/international-cognasiumindia
- **Address (once connected):** https://international.cognasiumindia.com/
- **Hosting:** its own Vercel project (separate from the main site in `..\main-site\`)
- Plain HTML, CSS and vanilla JS, plus **one serverless function** (`api/lead.js`). No framework, no build step, no npm packages.
- **The site is no longer purely static.** The page still opens by double-clicking `index.html`, but the form can only send from Vercel (or `vercel dev`).

---

## Layout
**Screen 1: no scrolling on any phone or desktop:**
1. **Yellow hero**: logo, "Main website" link, chips, the headline "Already debating at school?" + "Take it international.", one supporting line
2. **Navy proof bar:** World Champion · APD · BPD · WSDC formats · Team + tournament
3. **Enquiry form card** ("Step 1 of 2" with a progress bar):
   - **Step 1:** "I am filling this form as" (Parent / guardian · Student · Other, required) · Child's grade (5 to 12, required) · "Which level is your child?" (optional) · **Continue**
   - **Step 2:** Parent or guardian's full name · Mobile (+91 fixed) · City (optional) · Email · consent checkbox (unticked) with the privacy notice link · **Request programme details** · "Goes straight to the Cognasium India team. No payment needed."
   - **Thank-you panel** in the same card, with "What happens next"
4. **Testimonials:** photo faces + a rotating quote
5. "See our students' wins ↓"

**Keeping it on one screen:** `js/main.js` checks whether screen 1 overflows. If it does, it hides these extras one at a time until everything fits: scroll hint → testimonial faces → supporting line → hero chips → tighter spacing → testimonial → proof bar. The buttons are never hidden. On a 390×844 phone, step 1 hides only the scroll hint.

**Below the fold:** students' wins gallery · How it works (3 steps) · "Ready for the next stage?" · footer (main website, privacy notice, ©). The "Request programme details" buttons down here, and the sticky bar on phones, scroll back up to the form.

`noindex, nofollow` (meta tag and header).

## Files
```
international-site/
├── index.html      ← the page (Meta Pixel base code in <head>)
├── privacy.html    ← privacy notice linked from the consent box and footer
├── api/lead.js     ← GET: form settings · POST: checks + sends the lead email (Resend)
├── css/styles.css  ← all styles (colours as CSS variables at the top)
├── js/config.js    ← EDIT HERE: Pixel ID, form roles + grades + messages, levels, posters, steps, testimonials
├── js/main.js      ← form steps + validation + sending, Lead event, fit-to-screen, testimonials, gallery, sticky bar, utm pass-through
├── assets/         ← favicons + img/ (WebP)
├── vercel.json     ← clean URLs, security headers, noindex, asset cache, no-store on /api
├── .env.example    ← every environment variable, empty (copy to .env.local)
├── .gitignore      ← keeps .env / .env.local / .vercel out of git
├── .vercelignore   ← keeps README and .env.example off the live site
└── README.md       ← this file
```
Roles, grades and levels are listed in **both** `js/config.js` (what the page shows) and `api/lead.js` (what the server accepts). Change both.

## Lead-quality checks
The browser checks everything first, then **the server checks it all again** (that's the real gate):

| Check | Rule |
|---|---|
| Who is filling it | Required. **Student** is blocked with "Please ask your parent or guardian to fill in this form." Set `ALLOW_ADULT_STUDENTS=true` to let students who tick "I am 18 or older" through. "Other" is allowed and shows as "Other" in the email. |
| Name | Letters, spaces and `. ' -` only, 2 to 60 characters, no digits or links |
| Mobile | 10 digits starting 6 to 9; repeated (9999999999, 9898989898) and sequential (9876543210) numbers rejected |
| Email | Valid format; throwaway domains rejected (list in `api/lead.js`, `DISPOSABLE`) |
| City | Optional, letters only, up to 40 |
| Consent | Must be ticked |
| No message box | There is no free-text field |
| Honeypot | Hidden "website" field; filled in = rejected |
| Fill time | The server signs a start time; sent in under 4 seconds = rejected (older than 6 hours = "press again") |
| CAPTCHA | Cloudflare Turnstile, invisible unless it needs a tap; verified on the server |
| Rate limit | 5 sends per hour per IP; the same mobile **or** email again within 24 hours = "We already have an enquiry…" |
| Request shape | Same-origin only (no CORS), JSON only, max 4 KB, unknown fields rejected |
| Email safety | Every value is HTML-escaped; no images or tracking pixels in the email |

**Rate-limit storage:** Vercel functions keep no memory between requests. With **Upstash Redis** connected, the limits are reliable. Without it they only last for one warm server instance, so they're easy to get round. Phone, email and IP are stored only as hashes, never in clear.

**Logs:** only error types (`lead: send_failed status=…`, `lead: captcha_unreachable`, `lead: store_error`, `lead: not_configured`). Never names, phones or emails.

**Honest limit:** no form can prove someone is a parent. These checks stop bots, children tapping around, fake numbers and repeat sends. They don't verify who someone is.

## The email
- **To:** `LEAD_TO_EMAIL` · **From:** `LEAD_FROM_EMAIL` · **Reply-To:** the parent's email (just press Reply)
- **Subject:** `New international debating enquiry - <parent name>`
- **Table:** filled in by, parent name, mobile, email, child's grade, level, city, time (IST), page, plus utm_source / utm_medium / utm_campaign / utm_content / utm_term / fbclid when present
- No backup copy and no confirmation email to the parent (not asked for yet).
- **If sending fails:** the parent sees "Sorry, your enquiry didn't go through. Please try again in a moment." The button comes back, and **no Lead event fires**.

## Meta Pixel
- **ID:** `4022027848040743`. It's in `js/config.js`, and also in the `<noscript>` image in `index.html`, so change both.
- **PageView** on load (with an event_id), as before. There is no ViewContent event (there wasn't one before either).
- **Lead fires exactly once, only after the server confirms the email was sent.** It has an event_id and `{ content_name: "International debating", level }`. It never fires on page load, on Continue or Back, or on a failed or blocked send. **No name, phone or email goes to Meta.**
- **Test with Meta Pixel Helper (Chrome extension):** open the live page → PageView ✓ → fill in both steps and send → after the thank-you panel appears, Lead ✓ (once). Try a bad mobile number: no Lead.
- **Test Events:** Events Manager → your Pixel → **Test events** → enter `https://international.cognasiumindia.com/` → **Open website** → send a real enquiry → Lead appears within a minute or so.
- No Conversions API.
- **utm / fbclid:** passed to the "Main website" links, and included in the lead email.

## Environment variables
Set them in **Vercel → Project → Settings → Environment Variables** (Production, and Preview if you test previews). Use the same names in a local `.env.local` (git-ignored) for `vercel dev`. The function refuses to run (503) until the first six are set.

| Name | What | Example / where to get it |
|---|---|---|
| `RESEND_API_KEY` | Resend API key, "Sending access" | resend.com → API Keys |
| `LEAD_TO_EMAIL` | Who receives leads (comma-separate for more) | the client's address |
| `LEAD_FROM_EMAIL` | Sender on the verified domain | `Cognasium Enquiries <leads@cognasiumindia.com>` |
| `TURNSTILE_SITE_KEY` | Turnstile site key (public) | Cloudflare → Turnstile → Add widget |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key | same widget |
| `FORM_SECRET` | Any long random string | e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ALLOW_ADULT_STUDENTS` | `true` lets 18+ students submit; empty = parents only | leave empty |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis (optional, recommended) | added automatically by Vercel → Storage → Upstash |

**For local testing only**, Cloudflare publishes test keys that always pass: site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`. Never use them in Production.

## Run it locally (with the form working)
```
npm i -g vercel
cd C:\Agents\cognasiumindia-site\international-site
vercel link        (pick the international-cognasiumindia project)
copy .env.example .env.local   (then fill in the values)
vercel dev
```
Open http://localhost:3000/. The form sends real emails through Resend, so use your own email in `LEAD_TO_EMAIL` while testing.
Just looking at the layout: double-click `index.html`, or `python -m http.server 8766` and open http://127.0.0.1:8766/ (sending won't work there).

## Setup steps (once)
1. **Resend:** sign up → **Domains → Add domain** → `cognasiumindia.com` (region: closest to India). Resend shows 3 or 4 DNS records: a DKIM **TXT** (`resend._domainkey`), and an **MX** + SPF **TXT** on the `send` subdomain.
2. **Hostinger DNS:** add **exactly** the records Resend shows (Type, Name, Value, TTL 300). They live on `send.` and `resend._domainkey`, so **the Google mail records (MX on @) are not touched**. Then click **Verify** in Resend.
3. **Resend API key:** **API Keys → Create**, permission "Sending access", domain cognasiumindia.com.
4. **Cloudflare Turnstile** (a free Cloudflare account is enough, no DNS change): **Turnstile → Add widget**, hostname `international.cognasiumindia.com` (add `localhost` for `vercel dev`), widget mode **Managed** → copy the site key and secret key.
5. **Upstash (recommended):** Vercel → this project → **Storage → Create / Marketplace → Upstash (Redis)**, free plan, connect to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` itself.
6. **Vercel env vars:** add the variables above → **Redeploy** (env changes only apply to new deployments).
7. **First time on Vercel** (if not done yet): **Add New → Project** → import `failsdaddy-dev/international-cognasiumindia`, Framework **Other**, no build command → Deploy → **Settings → Domains** → `international.cognasiumindia.com` → Hostinger: **CNAME** `international` → the value Vercel shows.

## Manual test checklist
- [ ] No scrolling needed on screen 1, both steps: 360×640, 390×844, 430×932, 1366×768, 1920×1080 (step 2 on 360×640 hides the testimonial and proof bar to make room)
- [ ] Step 1: Continue with nothing chosen → errors next to "I am filling…" and grade
- [ ] Student → polite parent message, cannot continue (or, with `ALLOW_ADULT_STUDENTS=true`, the 18+ box is required)
- [ ] Back keeps step 1's answers
- [ ] Step 2 errors: name `A1`, mobile `9999999999` / `1234567890` / `5123456789`, email `x@mailinator.com`, consent unticked
- [ ] Keyboard only: Tab through everything, Enter submits each step, errors are read out
- [ ] Real send → email arrives with the full table, Reply goes to the parent's email
- [ ] Same mobile again → "We already have an enquiry…" and no Lead
- [ ] Failed send (e.g. set a wrong `RESEND_API_KEY` on a Preview) → calm error + retry, no Lead
- [ ] Pixel Helper: PageView on load; Lead once, only after the thank-you panel
- [ ] Search the page and source: no WhatsApp anywhere
- [ ] /privacy works and the link opens in a new tab

## Updating
Edit the files, then `git add -A`, `git commit -m "…"` and `git push`.
- **Commit author:** commits must be authored by `failsdaddy-dev` (already set in this repo).
- **Images:** `/assets/*` is cached for 30 days, so give a replaced image a new file name.
- **Never commit** `.env.local` or any key.

## Still missing / to approve
- Client email address for `LEAD_TO_EMAIL`, and the sender address
- Resend account + DNS records, Turnstile keys, Upstash (optional)
- **Grade range:** using 5 to 12 (the main site's grade question). The ad's "4 to 8" is still unclear.
- Whether students 18+ may submit (currently parents only), and whether "Other" should be allowed (currently yes)
- **Wording to approve:** "Goes straight to the Cognasium India team. No payment needed." · thank-you "What happens next: the team will reply to the email address or mobile number you gave us." (add a timeframe?) · the privacy notice text and its deletion contact (cognasiumindia@gmail.com, from the main site)
- Backup copy of leads and a confirmation email to the parent (both off)
- Families' consent for the testimonial and Wall of Fame photos
