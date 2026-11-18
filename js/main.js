/* Cognasium India — international debating ad page */
(function () {
  "use strict";
  var C = window.PAGE_CONFIG;
  if (!C) return;
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

  /* ---------- level chips ---------- */
  var chosen = null, grid = $("levels");
  C.levels.forEach(function (l) {
    var b = el("button", { type: "button", class: "level", "aria-pressed": "false", text: l.label });
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true";
      grid.querySelectorAll(".level").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", String(on));
      chosen = on ? l : null;
      updateLinks();
    });
    grid.appendChild(b);
  });

  /* ---------- every WhatsApp button (main, final, sticky) gets the same message ---------- */
  var waBtns = document.querySelectorAll(".js-wa");
  function updateLinks() {
    var msg = C.whatsapp.message.replace("{levelLine}", chosen ? "My child's level: " + chosen.message + "\n" : "");
    var href = "https://wa.me/" + C.whatsapp.number + "?text=" + encodeURIComponent(msg);
    waBtns.forEach(function (a) { a.href = href; });
  }
  updateLinks();

  /* ---------- Meta Pixel: one event, Lead, ONLY when a WhatsApp button is tapped ---------- */
  waBtns.forEach(function (a) {
    a.addEventListener("click", function () {
      updateLinks();
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead",
          { content_name: "International debating", level: chosen ? chosen.id : "not_selected", button: a.getAttribute("data-place") || "" },
          { eventID: "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) });
      }
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

  /* ---------- sticky WhatsApp bar: shows once the first screen's button is out of view, hides at the final CTA ---------- */
  var sticky = $("sticky");
  if ("IntersectionObserver" in window) {
    var st = { main: true, final: false };
    function sync() {
      var on = !st.main && !st.final;
      sticky.classList.toggle("show", on);
      sticky.setAttribute("aria-hidden", String(!on));
      sticky.querySelector("a").tabIndex = on ? 0 : -1;
    }
    new IntersectionObserver(function (e) { st.main = e[0].isIntersecting; sync(); }).observe($("wa-btn"));
    new IntersectionObserver(function (e) { st.final = e[0].isIntersecting; sync(); }).observe(document.querySelector(".final"));
  }

  $("year").textContent = new Date().getFullYear();
})();
