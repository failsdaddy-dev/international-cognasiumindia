/* Cognasium India — international debating ad page */
(function () {
  "use strict";
  var C = window.PAGE_CONFIG;
  if (!C) return;
  var F = C.form, M = F.messages;
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function rid(p) { return p + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8); }

  /* ======================= ENQUIRY FORM ======================= */
  var form = $("enquiry"), screen = $("screen"), status = $("form-status");
  var S = { step: 1, level: null, sending: false, sent: false, srv: null, token: null, waiters: [], capStarted: false };

  /* --- keep screen 1 on one screen: hide the least important extras, one at a time, until it fits --- */
  var FIT = ["fit-cue", "fit-quote-sm", "fit-lead", "fit-chips", "fit-tight", "fit-quote", "fit-proof"], fitQueued = false;
  function fit() {
    fitQueued = false;
    FIT.forEach(function (c) { screen.classList.remove(c); });
    for (var i = 0; i < FIT.length && screen.scrollHeight > screen.clientHeight + 1; i++) screen.classList.add(FIT[i]);
  }
  function refit() { if (!fitQueued) { fitQueued = true; requestAnimationFrame(fit); } }
  window.addEventListener("resize", refit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
  window.addEventListener("load", refit);

  /* Settings from the server: Turnstile site key + signed start time (for the minimum-fill-time check) */
  function loadSettings() {
    return fetch(F.endpoint, { headers: { Accept: "application/json" }, credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error("settings");
        S.srv = j; updateRole();
        if (S.step === 2) startCaptcha();
        return j;
      });
  }
  if (location.protocol.indexOf("http") === 0) loadSettings().catch(function () { S.srv = null; });

  /* --- Step 1: who is filling it in (radio chips) --- */
  var roles = $("roles");
  F.roles.forEach(function (r) {
    var input = el("input", { type: "radio", name: "role", value: r.id, "aria-describedby": "err-role" });
    input.addEventListener("change", function () { setErr("role", ""); updateRole(); });
    roles.appendChild(el("label", { class: "chip-opt" }, [input, el("span", { text: r.label })]));
  });
  function role() { var c = form.querySelector('input[name="role"]:checked'); return c ? c.value : ""; }
  function adultAllowed() { return !!(S.srv && S.srv.allowAdultStudents); }
  function updateRole() {
    var student = role() === "student";
    $("adult-wrap").hidden = !(student && adultAllowed());
    var stop = $("student-stop");
    stop.hidden = !(student && !adultAllowed());
    stop.textContent = stop.hidden ? "" : M.studentStop;
    if (!student) { $("adult").checked = false; setErr("adult", ""); }
    refit();
  }
  $("adult").addEventListener("change", function () { setErr("adult", ""); });

  /* --- Step 1: child's grade --- */
  var grade = $("grade");
  grade.appendChild(el("option", { value: "", text: "Choose" }));
  F.grades.forEach(function (g) { grade.appendChild(el("option", { value: g, text: "Grade " + g })); });
  grade.addEventListener("change", function () { setErr("grade", ""); });

  /* --- Step 1: "Which level is your child?" (optional, tap again to unselect) --- */
  var grid = $("levels");
  C.levels.forEach(function (l) {
    var b = el("button", { type: "button", class: "level", "aria-pressed": "false", text: l.label });
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true";
      grid.querySelectorAll(".level").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", String(on));
      S.level = on ? l : null;
    });
    grid.appendChild(b);
  });

  /* --- errors next to fields --- */
  var FIELD_INPUT = { role: function () { return form.querySelector('input[name="role"]'); }, adult: function () { return $("adult"); },
    grade: function () { return grade; }, name: function () { return $("name"); }, mobile: function () { return $("mobile"); },
    email: function () { return $("email"); }, city: function () { return $("city"); }, consent: function () { return $("consent"); },
    level: function () { return grid.querySelector(".level"); } };
  function setErr(field, msg) {
    var p = $("err-" + field);
    if (p) p.textContent = msg;
    if (field === "role") form.querySelectorAll('input[name="role"]').forEach(function (i) { i.setAttribute("aria-invalid", String(!!msg)); });
    else if (FIELD_INPUT[field] && FIELD_INPUT[field]()) FIELD_INPUT[field]().setAttribute("aria-invalid", String(!!msg));
    refit();
  }
  function say(msg) { status.textContent = msg || ""; refit(); }

  /* --- validation (the server checks all of this again) --- */
  function normMobile(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
    else if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
    return d;
  }
  function okMobile(m) {
    if (!/^[6-9]\d{9}$/.test(m)) return false;
    var seen = {}, n = 0, up = true, down = true;
    for (var i = 0; i < m.length; i++) { if (!seen[m[i]]) { seen[m[i]] = 1; n++; } }
    if (n < 3) return false;
    for (var k = 1; k < m.length; k++) {
      var d = (Number(m[k]) - Number(m[k - 1]) + 10) % 10;
      if (d !== 1) up = false; if (d !== 9) down = false;
    }
    return !(up || down);
  }
  function tidy(v) { return String(v || "").replace(/\s+/g, " ").trim(); }
  var NAME_RE, CITY_RE;
  try { NAME_RE = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M} .'-]*$", "u"); CITY_RE = new RegExp("^[\\p{L}\\p{M} .'-]+$", "u"); }
  catch (e) { NAME_RE = /^[A-Za-zÀ-ɏऀ-ॿ][A-Za-zÀ-ɏऀ-ॿ .'-]*$/; CITY_RE = /^[A-Za-zÀ-ɏऀ-ॿ .'-]+$/; }
  function okName(n) { return n.length >= 2 && n.length <= 60 && NAME_RE.test(n) && !/\b(www|https?)\b/i.test(n); }
  function okEmail(e) { return e.length <= 100 && /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}$/.test(e); }

  function checkStep1() {
    var first = null;
    function bad(f, m) { setErr(f, m); if (!first) first = f; }
    var r = role();
    if (!r) bad("role", M.role);
    else if (r === "student") {
      if (!adultAllowed()) { updateRole(); first = first || "stop"; }
      else if (!$("adult").checked) bad("adult", M.adult);
    }
    if (!grade.value) bad("grade", M.grade);
    if (first === "stop") $("student-stop").focus();
    else if (first) focusField(first);
    return !first;
  }
  function checkStep2() {
    var first = null;
    function bad(f, m) { setErr(f, m); if (!first) first = f; }
    var name = tidy($("name").value), mob = normMobile($("mobile").value), mail = tidy($("email").value), city = tidy($("city").value);
    if (!okName(name)) bad("name", M.name); else setErr("name", "");
    if (!okMobile(mob)) bad("mobile", M.mobile); else setErr("mobile", "");
    if (city && (city.length > 40 || !CITY_RE.test(city))) bad("city", M.city); else setErr("city", "");
    if (!okEmail(mail)) bad("email", M.email); else setErr("email", "");
    if (!$("consent").checked) bad("consent", M.consent); else setErr("consent", "");
    if (first) {
      focusField(first);
      /* errors make the card taller: keep the button in view */
      setTimeout(function () { $("submit-btn").scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" }); }, 60);
    }
    return !first;
  }
  function focusField(f) { var i = FIELD_INPUT[f] && FIELD_INPUT[f](); if (i) i.focus(); }

  /* Check a field when the person leaves it (only once they've typed something) */
  [["name", function (v) { return okName(tidy(v)); }], ["mobile", function (v) { return okMobile(normMobile(v)); }],
   ["email", function (v) { return okEmail(tidy(v)); }], ["city", function (v) { v = tidy(v); return !v || CITY_RE.test(v); }]]
    .forEach(function (pair) {
      var i = $(pair[0]);
      i.addEventListener("blur", function () { if (i.value) setErr(pair[0], pair[1](i.value) ? "" : M[pair[0]]); });
      i.addEventListener("input", function () { if ($("err-" + pair[0]).textContent && pair[1](i.value)) setErr(pair[0], ""); });
    });
  $("consent").addEventListener("change", function () { if (this.checked) setErr("consent", ""); });

  /* --- steps --- */
  function goStep(n, back) {
    S.step = n;
    screen.setAttribute("data-step", String(n));
    ["step-1", "step-2", "step-done"].forEach(function (id, i) {
      var p = $(id), show = (i + 1 === n) || (id === "step-done" && n === 3);
      p.hidden = !show;
      if (show && !REDUCED) { p.classList.remove("enter", "enter-back"); void p.offsetWidth; p.classList.add(back ? "enter-back" : "enter"); }
    });
    $("back").hidden = n !== 2;
    $("progress-label").textContent = n === 3 ? "Sent" : "Step " + n + " of 2";
    say("");
    fit();
    if (n === 2) startCaptcha();
    if (n === 3) $("done-title").focus(); else $("progress-label").focus();
  }
  $("back").addEventListener("click", function () { if (!S.sending) goStep(1, true); });

  /* --- Cloudflare Turnstile: loaded only when step 2 opens; invisible unless it needs a tap --- */
  function startCaptcha() {
    if (S.capStarted || !S.srv || !S.srv.siteKey) return;
    S.capStarted = true;
    window.onTurnstileReady = function () {
      S.capId = window.turnstile.render("#captcha", {
        sitekey: S.srv.siteKey, action: "lead", appearance: "interaction-only", size: "flexible",
        callback: function (t) { S.token = t; var w = S.waiters; S.waiters = []; w.forEach(function (f) { f(t); }); },
        "expired-callback": function () { S.token = null; },
        "error-callback": function () { S.token = null; }
      });
    };
    document.head.appendChild(el("script", { src: "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileReady&render=explicit", async: "" }));
  }
  function getToken() {
    return new Promise(function (resolve) {
      if (S.token) return resolve(S.token);
      S.waiters.push(resolve);
      setTimeout(function () { resolve(S.token); }, 15000);
    });
  }
  function resetCaptcha() { S.token = null; if (window.turnstile && S.capId !== undefined) { try { window.turnstile.reset(S.capId); } catch (e) {} } }

  /* --- send --- */
  function setSending(on) {
    S.sending = on;
    var b = $("submit-btn");
    b.disabled = on; b.setAttribute("aria-busy", String(on));
    b.textContent = on ? M.sending : "Request programme details";
  }
  function payload(token) {
    var p = {
      role: role(), grade: grade.value, level: S.level ? S.level.id : "",
      name: tidy($("name").value), mobile: normMobile($("mobile").value), email: tidy($("email").value).toLowerCase(),
      city: tidy($("city").value), consent: $("consent").checked, website: $("website").value,
      ts: S.srv.ts, sig: S.srv.sig, token: token || "", page: location.origin + location.pathname
    };
    if (p.role === "student") p.adult = $("adult").checked;
    var q = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach(function (k) {
      var v = q.get(k); if (v) p[k] = v.slice(0, 200);
    });
    return p;
  }
  function onError(j) {
    var e = (j && j.error) || "failed";
    if (e === "invalid" && j.field) {
      if (["role", "grade", "level"].indexOf(j.field) >= 0) { goStep(1, true); setErr(j.field, M[j.field]); }
      else setErr(j.field, M[j.field] || M.failed);
      focusField(j.field);
      return;
    }
    if (e === "parent_needed") { goStep(1, true); updateRole(); return; }
    if (e === "expired") { loadSettings().catch(function () {}); }
    if (e === "captcha" || e === "expired" || e === "too_fast") resetCaptcha();
    say({ captcha: M.captcha, too_fast: M.tooFast, expired: M.expired, duplicate: M.duplicate, rate_limited: M.rateLimited }[e] || M.failed);
  }
  function submit() {
    if (S.sending || S.sent) return;
    say("");
    if (!checkStep2()) return;
    if (!S.srv) { say(location.protocol.indexOf("http") === 0 ? M.failed : M.offline); loadSettings().catch(function () {}); return; }
    setSending(true);
    getToken().then(function (token) {
      if (!token) { setSending(false); say(M.captcha); return; }
      return fetch(F.endpoint, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload(token))
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false, error: "failed" }; });
      }).then(function (j) {
        S.token = null;                                  // a Turnstile token works once
        if (j && j.ok) {
          S.sent = true;
          goStep(3);
          fireLead();
        } else {
          setSending(false);
          resetCaptcha();
          onError(j);
        }
      });
    }).catch(function () { setSending(false); resetCaptcha(); say(M.failed); });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (S.step === 1) { if (checkStep1()) goStep(2); }
    else if (S.step === 2) submit();
  });

  /* ---------- Meta Pixel: Lead, exactly once, only after the server confirmed the email was sent ---------- */
  function fireLead() {
    if (S.leadFired) return;
    S.leadFired = true;
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead",
        { content_name: "International debating", level: S.level ? S.level.id : "not_selected" },
        { eventID: rid("lead") });
    }
  }

  /* ---------- "Request programme details" buttons further down jump back to the form ---------- */
  document.querySelectorAll(".js-to-form").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      form.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" });
      setTimeout(function () { (S.step === 3 ? $("done-title") : $("progress-label")).focus({ preventScroll: true }); }, REDUCED ? 0 : 450);
    });
  });

  /* ---------- links to the main website keep the ad's utm_* / fbclid ---------- */
  if (window.location.search.length > 1) {
    var params = new URLSearchParams(window.location.search);
    document.querySelectorAll(".js-main-site").forEach(function (a) {
      var url = new URL(C.mainSite || a.href);
      params.forEach(function (v, k) { if (/^utm_|^fbclid$/.test(k)) url.searchParams.set(k, v); });
      a.href = url.toString();
    });
  }

  /* ---------- testimonials: faces + rotating quote ---------- */
  var T = C.testimonials || [], cur = 0, paused = false, qBody = document.querySelector(".quote-body"), faces = $("faces");
  function show(n) {
    cur = n;
    $("q-text").textContent = "“" + T[n].quote + "”";
    $("q-name").textContent = "— " + T[n].name + (T[n].role ? ", " + T[n].role : "");
    faces.querySelectorAll(".face").forEach(function (f, i) { f.setAttribute("aria-current", String(i === n)); });
  }
  function go(n) {
    if (REDUCED) { show(n); return; }
    qBody.classList.add("fading");
    setTimeout(function () { show(n); qBody.classList.remove("fading"); }, 380);
  }
  T.forEach(function (t, i) {
    var f = el("button", { type: "button", class: "face", "aria-label": "Review by " + t.name }, [
      el("img", { src: t.photo, alt: "", width: "64", height: "64" })
    ]);
    f.addEventListener("click", function () { go(i); });
    faces.appendChild(f);
  });
  if (T.length) show(0);
  var qBox = $("quote");
  ["mouseenter", "touchstart", "focusin"].forEach(function (ev) { qBox.addEventListener(ev, function () { paused = true; }, { passive: true }); });
  ["mouseleave", "touchend", "focusout"].forEach(function (ev) { qBox.addEventListener(ev, function () { setTimeout(function () { paused = false; }, 1500); }, { passive: true }); });
  if (T.length > 1) setInterval(function () { if (!paused && !document.hidden) go((cur + 1) % T.length); }, C.rotateEveryMs || 4500);

  /* ---------- students' wins: swipe gallery with arrows + dots ---------- */
  var gal = $("gallery"), dots = $("g-dots");
  (C.wins || []).forEach(function (w) {
    gal.appendChild(el("figure", { class: "win" }, [
      el("img", { src: w.img, alt: w.title + ": " + w.text, width: "560", height: "700", loading: "lazy", decoding: "async" }),
      el("figcaption", null, [el("strong", { text: w.title }), el("span", { text: w.text })])
    ]));
    dots.appendChild(el("i"));
  });
  function cardStep() { var c = gal.querySelector(".win"); return c ? c.getBoundingClientRect().width + 12 : 260; }
  function syncDots() {
    var i = Math.round(gal.scrollLeft / cardStep());
    dots.querySelectorAll("i").forEach(function (d, k) { d.classList.toggle("on", k === i); });
  }
  gal.addEventListener("scroll", function () { requestAnimationFrame(syncDots); }, { passive: true });
  $("g-prev").addEventListener("click", function () { gal.scrollBy({ left: -cardStep(), behavior: REDUCED ? "auto" : "smooth" }); });
  $("g-next").addEventListener("click", function () { gal.scrollBy({ left: cardStep(), behavior: REDUCED ? "auto" : "smooth" }); });
  syncDots();

  /* ---------- how it works ---------- */
  (C.steps || []).forEach(function (s) {
    $("steps").appendChild(el("li", null, [el("div", null, [el("strong", { text: s.title }), el("span", { text: s.text })])]));
  });

  /* ---------- sticky bar: shows once the form is out of view, hides at the final call to action ---------- */
  var sticky = $("sticky");
  if ("IntersectionObserver" in window) {
    var st = { form: true, final: false };
    var syncSticky = function () {
      var on = !st.form && !st.final && !S.sent;
      sticky.classList.toggle("show", on);
      sticky.setAttribute("aria-hidden", String(!on));
      sticky.querySelector("a").tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(function (e) { st.form = e[0].isIntersecting; syncSticky(); }).observe(form);
    new IntersectionObserver(function (e) { st.final = e[0].isIntersecting; syncSticky(); }).observe(document.querySelector(".final"));
  }

  $("year").textContent = new Date().getFullYear();
})();
