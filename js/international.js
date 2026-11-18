/* Cognasium India — international debating ad landing page */
(function () {
  "use strict";
  var C = window.INTL_CONFIG;
  if (!C) return;
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id) { return document.getElementById(id); }
  function eventId(prefix) { return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8); }

  /* ---------- level chips ---------- */
  var chosen = null;
  var grid = $("levels");
  C.levels.forEach(function (l) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "level"; b.setAttribute("aria-pressed", "false");
    b.innerHTML = "<b></b><small></small>";
    b.firstChild.textContent = l.label;
    b.lastChild.textContent = l.sub;
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true";
      grid.querySelectorAll(".level").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", String(on));
      chosen = on ? l : null;
      updateLink();
    });
    grid.appendChild(b);
  });

  /* ---------- WhatsApp link (works with or without a chosen level) ---------- */
  var wa = $("wa-btn");
  function message() {
    var line = chosen ? "My child's level: " + chosen.message + "\n" : "";
    return C.whatsapp.message.replace("{levelLine}", line);
  }
  function updateLink() {
    wa.href = "https://wa.me/" + C.whatsapp.number + "?text=" + encodeURIComponent(message());
  }
  updateLink();

  /* ---------- Meta Pixel: Lead only when the WhatsApp button is tapped ---------- */
  wa.addEventListener("click", function () {
    updateLink();
    if (typeof window.fbq === "function") {
      window.fbq("track", C.leadEvent || "Lead",
        { content_name: "International debating", level: chosen ? chosen.id : "not_selected" },
        { eventID: eventId("lead") });
    }
  });

  /* ---------- Main website links keep the ad's utm_* / fbclid ---------- */
  var qs = window.location.search;
  if (qs && qs.length > 1) {
    document.querySelectorAll(".js-main-site").forEach(function (a) {
      var url = new URL(C.mainSite || a.href);
      new URLSearchParams(qs).forEach(function (v, k) {
        if (/^utm_|^fbclid$/.test(k)) url.searchParams.set(k, v);
      });
      a.href = url.toString();
    });
  }

  /* ---------- Rotating testimonial (crossfade every 5 s, pauses on hover / touch / focus) ---------- */
  var T = C.testimonials || [], i = 0, paused = false, box = $("quote");
  function show(n) {
    var t = T[n];
    $("q-text").textContent = "“" + t.quote + "”";
    $("q-name").textContent = t.name + (t.role ? ", " + t.role : "");
    $("q-photo").src = t.photo;
    $("q-photo").alt = "Photo of " + t.name;
  }
  if (T.length) {
    show(0);
    T.forEach(function (t) { var im = new Image(); im.src = t.photo; }); // preload the small avatars
  }
  if (T.length > 1) {
    ["mouseenter", "touchstart", "focusin"].forEach(function (ev) { box.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["mouseleave", "touchend", "focusout"].forEach(function (ev) { box.addEventListener(ev, function () { paused = false; }, { passive: true }); });
    box.tabIndex = 0;
    setInterval(function () {
      if (paused || document.hidden) return;
      i = (i + 1) % T.length;
      if (REDUCED) { show(i); return; }
      box.classList.add("fading");
      setTimeout(function () { show(i); box.classList.remove("fading"); }, 450);
    }, C.rotateEveryMs || 5000);
  }

  $("year").textContent = new Date().getFullYear();
})();
