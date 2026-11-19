/* =====================================================================
   Cognasium India: international debating leads
   Google Apps Script, attached to the "Cognasium leads" Google Sheet.

   The website's server (api/lead.js on Vercel) checks every enquiry first,
   then posts it here. This script:
     1. checks the shared secret (so nobody else can post to it)
     2. limits each connection to 5 enquiries an hour
     3. rejects the same mobile or email again within 24 hours
     4. emails the lead to LEAD_TO_EMAIL (Reply-To = the parent)
     5. adds a row to the "Leads" tab (the backup copy)

   Setup (README, "Google Sheet + Apps Script"): paste this file into
   Extensions > Apps Script, set the two Script properties, deploy as a
   Web app (Execute as: Me, Who has access: Anyone).

   Script properties (Project Settings > Script properties):
     LEAD_SECRET    same value as LEAD_SECRET in Vercel
     LEAD_TO_EMAIL  who receives the leads (comma-separate for more)
   ===================================================================== */

var SHEET_NAME = "Leads";
var DUP_HOURS = 24;
var IP_LIMIT = 5;            // per hour
var HEADERS = ["Received (IST)", "Filled in by", "Parent or guardian name", "Mobile", "Email", "Child's grade",
  "Level", "City", "Page", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "Mobile (digits)"];

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty("LEAD_SECRET"), to = props.getProperty("LEAD_TO_EMAIL");
    if (!secret || !to) return out_({ ok: false, error: "not_configured" });
    if (body.secret !== secret) return out_({ ok: false, error: "forbidden" });
    var d = body.lead;
    if (!d || !d.name || !d.email || !d.mobileKey) return out_({ ok: false, error: "bad_request" });

    /* per-connection limit (Google's free cache, kept for an hour) */
    var cache = CacheService.getScriptCache(), ipKey = "ip:" + String(body.ipHash || "none").slice(0, 40);
    var n = Number(cache.get(ipKey) || 0) + 1;
    cache.put(ipKey, String(n), 3600);
    if (n > IP_LIMIT) return out_({ ok: false, error: "rate_limited" });

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sheet = sheet_();
      if (isDuplicate_(sheet, d)) return out_({ ok: false, error: "duplicate" });

      MailApp.sendEmail({
        to: to,
        replyTo: d.email,
        name: "Cognasium Enquiries",
        subject: "New international debating enquiry - " + d.name,
        body: textEmail_(d),
        htmlBody: htmlEmail_(d)
      });

      sheet.appendRow([new Date(), d.filledInBy, d.name, d.mobile, d.email, d.grade, d.level, d.city, d.page,
        d.utm_source, d.utm_medium, d.utm_campaign, d.utm_content, d.utm_term, d.fbclid, d.mobileKey].map(cell_));
    } finally {
      lock.releaseLock();
    }
    return out_({ ok: true });
  } catch (err) {
    console.error("lead: " + (err && err.name ? err.name : "error"));   // no personal data in logs
    return out_({ ok: false, error: "script_error" });
  }
}

/* A browser opening the script address just sees this */
function doGet() { return out_({ ok: true, service: "cognasium-leads" }); }

/* Run once from the editor (select testEmail > Run) to grant permissions and check the email arrives */
function testEmail() {
  var to = PropertiesService.getScriptProperties().getProperty("LEAD_TO_EMAIL");
  MailApp.sendEmail(to, "Test: Cognasium leads script works", "If you can read this, the lead emails will arrive here.");
  sheet_();
}

/* ---------- helpers ---------- */
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sh.getRange("A:A").setNumberFormat("dd mmm yyyy, h:mm am/pm");
  }
  return sh;
}

function isDuplicate_(sh, d) {
  var last = sh.getLastRow();
  if (last < 2) return false;
  var first = Math.max(2, last - 499);                       // the last 500 leads are plenty for 24 hours
  var rows = sh.getRange(first, 1, last - first + 1, HEADERS.length).getValues();
  var since = Date.now() - DUP_HOURS * 3600 * 1000, email = String(d.email).toLowerCase();
  return rows.some(function (r) {
    var t = r[0] instanceof Date ? r[0].getTime() : 0;
    return t >= since && (String(r[15]).replace(/^'/, "") === String(d.mobileKey) || String(r[4]).toLowerCase() === email);
  });
}

/* Stops a value being read as a spreadsheet formula */
function cell_(v) {
  if (v instanceof Date) return v;
  v = v === undefined || v === null ? "" : String(v);
  return /^[=+\-@0-9]/.test(v) ? "'" + v : v;
}

function rows_(d) {
  var r = [["Filled in by", d.filledInBy], ["Parent or guardian name", d.name], ["Mobile", d.mobile], ["Email", d.email],
    ["Child's grade", d.grade], ["Level", d.level], ["City", d.city || "Not given"], ["Time (IST)", d.timeIst],
    ["Page", d.page || "Not given"]];
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach(function (k) { if (d[k]) r.push([k, d[k]]); });
  return r;
}
function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
}
function htmlEmail_(d) {
  return '<div style="font-family:Arial,Helvetica,sans-serif;color:#00174D;max-width:560px">' +
    '<h2 style="margin:0 0 12px;font-size:18px">New international debating enquiry</h2>' +
    '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">' +
    rows_(d).map(function (r, i) {
      return '<tr style="background:' + (i % 2 ? "#ffffff" : "#FFF8E1") + '">' +
        '<th align="left" style="border:1px solid #D9DFEC;width:38%">' + esc_(r[0]) + "</th>" +
        '<td style="border:1px solid #D9DFEC">' + esc_(r[1]) + "</td></tr>";
    }).join("") + "</table>" +
    '<p style="font-size:13px;color:#3D4B6E;margin:14px 0 0">Press Reply to answer the parent directly. ' +
    "Also saved in the Cognasium leads Google Sheet.</p></div>";
}
function textEmail_(d) {
  return "New international debating enquiry\n\n" +
    rows_(d).map(function (r) { return r[0] + ": " + r[1]; }).join("\n") +
    "\n\nPress Reply to answer the parent directly.";
}
