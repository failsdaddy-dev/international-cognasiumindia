/* Cognasium India — international debating ad page */
(function () {
  "use strict";
  var C = window.PAGE_CONFIG;
  if (!C) return;
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    return n;
  }

  /* ---------- students' wins: sliding strip (list shown twice for a seamless loop) ---------- */
  var track = $("wins");
  (C.wins || []).concat(REDUCED ? [] : C.wins || []).forEach(function (w, i) {
    var img = el("img", { src: w.img, alt: i < C.wins.length ? w.alt : "", width: "256", height: "320", decoding: "async" });
    if (i >= C.wins.length) img.setAttribute("aria-hidden", "true");
    track.appendChild(img);
  });

  /* ---------- level chips ---------- */
  var chosen = null, grid = $("levels");
  C.levels.forEach(function (l) {
    var b = el("button", { type: "button", class: "level", "aria-pressed": "false", text: l.label });
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true";
      grid.querySelectorAll(".level").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", String(on));
      chosen = on ? l : null;
      updateLink();
    });
    grid.appendChild(b);
  });

  /* ---------- WhatsApp button (works with or without a level) ---------- */
  var wa = $("wa-btn");
  function updateLink() {
    var msg = C.whatsapp.message.replace("{levelLine}", chosen ? "My child's level: " + chosen.message + "\n" : "");
    wa.href = "https://wa.me/" + C.whatsapp.number + "?text=" + encodeURIComponent(msg);
  }
  updateLink();

  /* ---------- Meta Pixel: Lead ONLY on the WhatsApp tap ---------- */
  wa.addEventListener("click", function () {
    updateLink();
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead",
        { content_name: "International debating", level: chosen ? chosen.id : "not_selected" },
        { eventID: "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) });
    }
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

  /* ---------- testimonials: 5 faces + rotating quote ---------- */
  var T = C.testimonials || [], cur = 0, paused = false, body = document.querySelector(".quote-body"), faces = $("faces");
  function show(n) {
    cur = n;
    $("q-text").textContent = "“" + T[n].quote + "”";
    $("q-name").textContent = T[n].name + (T[n].role ? ", " + T[n].role : "");
    faces.querySelectorAll(".face").forEach(function (f, i) { f.setAttribute("aria-current", String(i === n)); });
  }
  function go(n) {
    if (REDUCED) { show(n); return; }
    body.classList.add("fading");
    setTimeout(function () { show(n); body.classList.remove("fading"); }, 380);
  }
  T.forEach(function (t, i) {
    var f = el("button", { type: "button", class: "face", "aria-label": "Review by " + t.name });
    f.appendChild(el("img", { src: t.photo, alt: "", width: "48", height: "48" }));
    f.addEventListener("click", function () { go(i); });
    faces.appendChild(f);
  });
  if (T.length) show(0);
  var box = $("quote");
  ["mouseenter", "touchstart", "focusin"].forEach(function (ev) { box.addEventListener(ev, function () { paused = true; }, { passive: true }); });
  ["mouseleave", "touchend", "focusout"].forEach(function (ev) { box.addEventListener(ev, function () { setTimeout(function () { paused = false; }, 1500); }, { passive: true }); });
  if (T.length > 1) setInterval(function () {
    if (!paused && !document.hidden) go((cur + 1) % T.length);
  }, C.rotateEveryMs || 4500);

  $("year").textContent = new Date().getFullYear();
})();
