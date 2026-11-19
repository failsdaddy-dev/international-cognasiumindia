/* =====================================================================
   POST /api/lead  ·  Cognasium India international debating enquiry form
   GET  /api/lead  ·  public form settings (Turnstile site key + a signed
                      start time used for the minimum-fill-time check)

   Vercel Node.js function. No npm packages: Resend, Cloudflare Turnstile
   and Upstash Redis are all called with fetch.

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
const MIN_FILL_MS   = 4000;              // faster than this = a bot
const MAX_AGE_MS    = 6 * 3600 * 1000;   // form start time older than this = reload
const IP_LIMIT      = 5;                 // submissions per IP ...
const IP_WINDOW_S   = 3600;              // ... per hour
const DUP_WINDOW_S  = 24 * 3600;         // same mobile or email again within 24 h = duplicate
const MAX_BODY      = 4000;              // bytes

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
function hmac(s) { return crypto.createHmac("sha256", env("FORM_SECRET")).update(String(s)).digest("hex"); }
function hashId(s) { return hmac("id:" + s).slice(0, 32); }          // phone / email / IP are never stored in clear
function reply(res, status, body) { res.setHeader("Cache-Control", "no-store"); res.status(status).json(body); }
function fail(res, status, error, field) { reply(res, status, field ? { ok: false, error, field } : { ok: false, error }); }
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
}
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

/* ---------- rate-limit store: Upstash Redis if connected, otherwise this instance's memory ---------- */
const mem = new Map();
function store() {
  const url = env("KV_REST_API_URL") || env("UPSTASH_REDIS_REST_URL");
  const token = env("KV_REST_API_TOKEN") || env("UPSTASH_REDIS_REST_TOKEN");
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}
async function redis(cmds) {
  const s = store();
  const r = await fetch(s.url + "/pipeline", {
    method: "POST", headers: { Authorization: "Bearer " + s.token, "Content-Type": "application/json" }, body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error("store_" + r.status);
  return (await r.json()).map(function (x) { return x.result; });
}
function memGet(k) { const v = mem.get(k); if (v && v.exp > Date.now()) return v; mem.delete(k); return null; }
async function countHit(key, windowS) {
  if (store()) return Number((await redis([["SET", key, "0", "EX", String(windowS), "NX"], ["INCR", key]]))[1]);
  const v = memGet(key) || { n: 0, exp: Date.now() + windowS * 1000 };
  v.n++; mem.set(key, v);
  if (mem.size > 5000) mem.clear();
  return v.n;
}
async function anyExists(keys) {
  if (store()) return (await redis(keys.map(function (k) { return ["EXISTS", k]; }))).some(function (x) { return Number(x) > 0; });
  return keys.some(function (k) { return !!memGet(k); });
}
async function markAll(keys, windowS) {
  if (store()) { await redis(keys.map(function (k) { return ["SET", k, "1", "EX", String(windowS)]; })); return; }
  keys.forEach(function (k) { mem.set(k, { n: 1, exp: Date.now() + windowS * 1000 }); });
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

/* ---------- the email ---------- */
function buildEmail(d) {
  const ist = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const rows = [
    ["Filled in by", ROLES[d.role]],
    ["Parent or guardian name", d.name],
    ["Mobile", "+91 " + d.mobile.slice(0, 5) + " " + d.mobile.slice(5)],
    ["Email", d.email],
    ["Child's grade", "Grade " + d.grade],
    ["Level", LEVELS[d.level]],
    ["City", d.city || "Not given"],
    ["Time (IST)", ist],
    ["Page", d.page || "Not given"]
  ];
  UTM.forEach(function (k) { if (d[k]) rows.push([k, d[k]]); });

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#00174D;max-width:560px">' +
    '<h2 style="margin:0 0 12px;font-size:18px">New international debating enquiry</h2>' +
    '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">' +
    rows.map(function (r, i) {
      return '<tr style="background:' + (i % 2 ? "#ffffff" : "#FFF8E1") + '">' +
        '<th align="left" style="border:1px solid #D9DFEC;width:38%;font-weight:bold">' + esc(r[0]) + "</th>" +
        '<td style="border:1px solid #D9DFEC">' + esc(r[1]) + "</td></tr>";
    }).join("") +
    "</table>" +
    '<p style="font-size:13px;color:#3D4B6E;margin:14px 0 0">Press Reply to answer the parent directly. ' +
    "Sent from the form on international.cognasiumindia.com.</p></div>";
  const text = "New international debating enquiry\n\n" +
    rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n") +
    "\n\nPress Reply to answer the parent directly.";
  return { subject: "New international debating enquiry - " + d.name, html, text };
}
async function sendEmail(d, idemKey) {
  const mail = buildEmail(d);
  const to = env("LEAD_TO_EMAIL").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + env("RESEND_API_KEY"), "Content-Type": "application/json", "Idempotency-Key": idemKey },
    body: JSON.stringify({ from: env("LEAD_FROM_EMAIL"), to, reply_to: d.email, subject: mail.subject, html: mail.html, text: mail.text })
  });
  return r.status;
}

/* ---------- handler ---------- */
module.exports = async function handler(req, res) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  const configured = ["RESEND_API_KEY", "LEAD_TO_EMAIL", "LEAD_FROM_EMAIL", "TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY", "FORM_SECRET"]
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

  const ip = clientIp(req);
  const dupKeys = ["lead:dup:m:" + hashId(d.mobile), "lead:dup:e:" + hashId(d.email)];
  try {
    /* 6. Rate limit per IP */
    if (await countHit("lead:ip:" + hashId(ip), IP_WINDOW_S) > IP_LIMIT) return fail(res, 429, "rate_limited");
  } catch (e) { console.error("lead: store_error"); }                // store down: carry on, never lose a lead

  /* 7. CAPTCHA, verified with Cloudflare */
  let human = false;
  try { human = await captchaOk(b.token, ip); } catch (e) { console.error("lead: captcha_unreachable"); }
  if (!human) return fail(res, 403, "captcha");

  /* 8. Same mobile or email already sent recently */
  try { if (await anyExists(dupKeys)) return fail(res, 409, "duplicate"); }
  catch (e) { console.error("lead: store_error"); }

  /* 9. Send */
  let status = 0;
  try { status = await sendEmail(d, "lead-" + hashId(d.mobile + "|" + ts)); }
  catch (e) { console.error("lead: send_error"); return fail(res, 502, "send_failed"); }
  if (status < 200 || status >= 300) { console.error("lead: send_failed status=" + status); return fail(res, 502, "send_failed"); }

  try { await markAll(dupKeys, DUP_WINDOW_S); } catch (e) { console.error("lead: store_error"); }
  return reply(res, 200, { ok: true });
};
