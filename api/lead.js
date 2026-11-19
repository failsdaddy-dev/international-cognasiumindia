/* =====================================================================
   POST /api/lead  ·  Cognasium India international debating enquiry form
   GET  /api/lead  ·  public form settings (Turnstile site key + a signed
                      start time used for the minimum-fill-time check)

   Vercel Node.js function, no npm packages. It checks everything, verifies
   Cloudflare Turnstile, then hands the lead to the Google Apps Script in
   google-apps-script/Code.gs, which emails it (free, from the client's own
   Google account) and saves a row in a Google Sheet.

   Every setting comes from environment variables (see README / .env.example).
   Logs never contain names, phone numbers or email addresses.
   ===================================================================== */
"use strict";
const crypto = require("crypto");

/* ---------- what the form may send (must match js/config.js) ---------- */
const ROLES  = { parent: "Parent or guardian", student: "Student (18 or older)", other: "Other" };
const GRADES = ["5", "6", "7", "8", "9", "10", "11", "12"];
const LEVELS = { "": "Not selected", beginner: "Beginner", school: "School debater", advanced: "Advanced" };
const UTM    = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];
const FIELDS = new Set(["role", "adult", "grade", "level", "name", "mobile", "email", "city", "consent",
  "website", "ts", "sig", "token", "page"].concat(UTM));

/* ---------- limits ---------- */
const MIN_FILL_MS = 4000;              // faster than this = a bot
const MAX_AGE_MS  = 6 * 3600 * 1000;   // form start time older than this = press again
const IP_LIMIT    = 5;                 // sends per IP per hour (this server instance; the Apps Script also checks)
const IP_WINDOW   = 3600 * 1000;
const MAX_BODY    = 4000;              // bytes

/* Small list of throwaway-email domains. Add more here when you see them. */
const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "sharklasers.com", "grr.la",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "tempmail.net", "temp-mail.org", "temp-mail.io",
  "tempmailo.com", "tempr.email", "tempinbox.com", "throwawaymail.com", "yopmail.com", "yopmail.net", "yopmail.fr",
  "trashmail.com", "trashmail.de", "getnada.com", "nada.email", "dispostable.com", "maildrop.cc", "mintemail.com",
  "mohmal.com", "fakeinbox.com", "emailondeck.com", "mailnesia.com", "mailcatch.com", "spamgourmet.com",
  "moakt.com", "burnermail.io", "inboxkitten.com", "mail.tm", "mailpoof.com", "getairmail.com", "dropmail.me",
  "emailfake.com", "discard.email", "mytemp.email", "1secmail.com", "1secmail.net", "1secmail.org",
  "example.com", "example.net", "example.org"
]);

/* ---------- helpers ---------- */
function env(k) { return (process.env[k] || "").trim(); }
function allowAdultStudents() { return env("ALLOW_ADULT_STUDENTS").toLowerCase() === "true"; }
function hmac(s) { return crypto.createHmac("sha256", env("LEAD_SECRET")).update(String(s)).digest("hex"); }
function reply(res, status, body) { res.setHeader("Cache-Control", "no-store"); res.status(status).json(body); }
function fail(res, status, error, field) { reply(res, status, field ? { ok: false, error, field } : { ok: false, error }); }
function clean(v) { return typeof v === "string" ? v.normalize("NFC").replace(/\s+/g, " ").trim() : null; }
function clientIp(req) {
  const xf = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xf || String(req.headers["x-real-ip"] || "") || "unknown";
}
function sameOrigin(req) {
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  const origin = req.headers.origin;
  if (origin) { try { return new URL(origin).host === host; } catch (e) { return false; } }
  const site = req.headers["sec-fetch-site"];                       // GET requests may have no Origin header
  return req.method === "GET" && (!site || site === "same-origin");
}

/* ---------- validation ---------- */
function validName(n) {
  if (!n || n.length < 2 || n.length > 60) return false;
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(n)) return false;   // letters and spaces (plus . ' - as in real names)
  if ((n.match(/\p{L}/gu) || []).length < 2) return false;
  return !/\b(www|https?)\b/i.test(n);
}
function validMobile(m) {
  if (typeof m !== "string" || !/^[6-9]\d{9}$/.test(m)) return false;
  if (new Set(m).size < 3) return false;                             // 9999999999, 9898989898 ...
  let up = true, down = true;
  for (let i = 1; i < m.length; i++) {
    const d = (Number(m[i]) - Number(m[i - 1]) + 10) % 10;
    if (d !== 1) up = false;
    if (d !== 9) down = false;
  }
  return !(up || down);                                              // 6789012345, 9876543210 ...
}
function validEmail(e) {
  if (!e || e.length > 100) return false;
  if (!/^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}$/.test(e)) return false;
  const parts = e.split("@")[1].toLowerCase().split(".");
  for (let i = 0; i < parts.length - 1; i++) if (DISPOSABLE.has(parts.slice(i).join("."))) return false;
  return true;
}
function validCity(c) { return c === "" || (c.length <= 40 && /^[\p{L}\p{M} .'-]+$/u.test(c)); }
function safeExtra(v, max) { return typeof v === "string" && v.length <= max && !/[\u0000-\u001F\u007F]/.test(v); }

/* ---------- quick per-instance IP limit (free, no database) ---------- */
const hits = new Map();
function tooMany(ipHash) {
  const now = Date.now(), list = (hits.get(ipHash) || []).filter(function (t) { return now - t < IP_WINDOW; });
  list.push(now); hits.set(ipHash, list);
  if (hits.size > 5000) hits.clear();
  return list.length > IP_LIMIT;
}

/* ---------- Cloudflare Turnstile ---------- */
async function captchaOk(token, ip) {
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const body = new URLSearchParams({ secret: env("TURNSTILE_SECRET_KEY"), response: token });
  if (ip !== "unknown") body.set("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  if (!r.ok) return false;
  const j = await r.json();
  return j.success === true;
}

/* ---------- hand over to the Google Apps Script (emails + saves to the Sheet) ---------- */
async function deliver(d, ipHash) {
  const ist = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const lead = {
    filledInBy: ROLES[d.role], name: d.name, mobile: "+91 " + d.mobile.slice(0, 5) + " " + d.mobile.slice(5),
    mobileKey: d.mobile, email: d.email, grade: "Grade " + d.grade, level: LEVELS[d.level], city: d.city || "",
    timeIst: ist, page: d.page || ""
  };
  UTM.forEach(function (k) { lead[k] = d[k] || ""; });
  const r = await fetch(env("APPS_SCRIPT_URL"), {
    method: "POST", redirect: "follow",                              // Apps Script answers through a redirect
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret: env("LEAD_SECRET"), ipHash, lead }),
    signal: AbortSignal.timeout(25000)
  });
  if (!r.ok) return { ok: false, error: "http_" + r.status };
  try { return JSON.parse(await r.text()); } catch (e) { return { ok: false, error: "bad_reply" }; }
}

/* ---------- handler ---------- */
module.exports = async function handler(req, res) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  const configured = ["APPS_SCRIPT_URL", "LEAD_SECRET", "TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"]
    .every(function (k) { return !!env(k); });
  if (!configured) { console.error("lead: not_configured"); return fail(res, 503, "not_configured"); }

  if (!sameOrigin(req)) return fail(res, 403, "forbidden");

  /* GET: settings the page needs before the form can be sent */
  if (req.method === "GET") {
    const ts = Date.now();
    return reply(res, 200, { ok: true, siteKey: env("TURNSTILE_SITE_KEY"), allowAdultStudents: allowAdultStudents(), ts, sig: hmac("ts:" + ts) });
  }
  if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return fail(res, 405, "method"); }
  if (!/^application\/json\b/i.test(String(req.headers["content-type"] || ""))) return fail(res, 415, "bad_request");

  /* 1. Shape: a plain object, small, no unexpected fields */
  let b;
  try { b = req.body; } catch (e) { return fail(res, 400, "bad_request"); }
  if (!b || typeof b !== "object" || Array.isArray(b)) return fail(res, 400, "bad_request");
  if (JSON.stringify(b).length > MAX_BODY) return fail(res, 413, "bad_request");
  if (Object.keys(b).some(function (k) { return !FIELDS.has(k); })) return fail(res, 400, "bad_request");

  /* 2. Honeypot (hidden field people never see) */
  if (b.website !== undefined && b.website !== "") return fail(res, 400, "bad_request");

  /* 3. Minimum fill time, using the start time this server signed */
  const ts = Number(b.ts), sig = String(b.sig || "");
  const expected = hmac("ts:" + ts);
  if (!Number.isFinite(ts) || sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return fail(res, 400, "expired");
  const age = Date.now() - ts;
  if (age > MAX_AGE_MS) return fail(res, 400, "expired");
  if (age < MIN_FILL_MS) return fail(res, 400, "too_fast");

  /* 4. Every field again */
  const d = {
    role: b.role, grade: b.grade, level: b.level === undefined ? "" : b.level,
    name: clean(b.name), mobile: b.mobile, email: clean(b.email), city: b.city === undefined ? "" : clean(b.city)
  };
  if (d.email) d.email = d.email.toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(ROLES, d.role)) return fail(res, 422, "invalid", "role");
  if (typeof d.grade !== "string" || GRADES.indexOf(d.grade) < 0) return fail(res, 422, "invalid", "grade");
  if (typeof d.level !== "string" || !Object.prototype.hasOwnProperty.call(LEVELS, d.level)) return fail(res, 422, "invalid", "level");
  if (!validName(d.name)) return fail(res, 422, "invalid", "name");
  if (!validMobile(d.mobile)) return fail(res, 422, "invalid", "mobile");
  if (!validEmail(d.email)) return fail(res, 422, "invalid", "email");
  if (d.city === null || !validCity(d.city)) return fail(res, 422, "invalid", "city");
  if (b.consent !== true) return fail(res, 422, "invalid", "consent");
  if (b.adult !== undefined && typeof b.adult !== "boolean") return fail(res, 400, "bad_request");

  /* 5. Role gate: students only if allowed AND confirmed 18 or older */
  if (d.role === "student" && !(allowAdultStudents() && b.adult === true)) return fail(res, 403, "parent_needed");

  /* Page address and ad tags (optional, short, plain text) */
  d.page = "";
  if (b.page !== undefined) {
    if (!safeExtra(b.page, 300) || !/^https?:\/\//i.test(b.page)) return fail(res, 400, "bad_request");
    d.page = b.page;
  }
  for (const k of UTM) {
    if (b[k] === undefined || b[k] === "") continue;
    if (!safeExtra(b[k], 200)) return fail(res, 400, "bad_request");
    d[k] = b[k];
  }

  /* 6. Rate limit per IP (quick check here; the Apps Script keeps the hour-long count) */
  const ip = clientIp(req), ipHash = hmac("ip:" + ip).slice(0, 32);
  if (tooMany(ipHash)) return fail(res, 429, "rate_limited");

  /* 7. CAPTCHA, verified with Cloudflare */
  let human = false;
  try { human = await captchaOk(b.token, ip); } catch (e) { console.error("lead: captcha_unreachable"); }
  if (!human) return fail(res, 403, "captcha");

  /* 8. Email + Sheet (the Apps Script also rejects repeats of the same mobile or email within 24 hours) */
  let out;
  try { out = await deliver(d, ipHash); }
  catch (e) { console.error("lead: script_unreachable"); return fail(res, 502, "send_failed"); }
  if (out && out.ok === true) return reply(res, 200, { ok: true });
  if (out && out.error === "duplicate") return fail(res, 409, "duplicate");
  if (out && out.error === "rate_limited") return fail(res, 429, "rate_limited");
  console.error("lead: send_failed " + String((out && out.error) || "unknown").replace(/[^a-z0-9_]/gi, "").slice(0, 30));
  return fail(res, 502, "send_failed");
};
