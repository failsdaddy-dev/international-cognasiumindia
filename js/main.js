/* Cognasium India — international debating ad page (shorter copy of the main site).
   Same code as main-site/js/main.js, plus: missing sections are skipped safely,
   Lead events carry an event_id, and utm_* / fbclid are passed on to the main website link. */
(function () {
  "use strict";
  var C = window.COGNASIUM_CONFIG;
  if (!C) return;
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */
  // Sections that are not on this shorter page get a detached placeholder, so the shared code runs unchanged.
  function $(id) { return document.getElementById(id) || document.createElement("div"); }
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, C);
  }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function waLink(message) {
    return "https://wa.me/" + C.whatsapp.number + "?text=" + encodeURIComponent(message);
  }
  function initials(name) {
    return name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); }).join("");
  }
  function displayTitle(node, lines, accent) {
    node.textContent = "";
    lines.forEach(function (l, i) {
      if (i) node.appendChild(el("br"));
      node.appendChild(document.createTextNode(l));
    });
    if (accent) { node.appendChild(el("br")); node.appendChild(el("span", { class: "accent", text: accent })); }
  }

  /* ---------- theme colours from config ---------- */
  if (C.theme) Object.keys(C.theme).forEach(function (k) {
    document.documentElement.style.setProperty(k, C.theme[k]);
  });

  /* ---------- simple text / image bindings ---------- */
  document.querySelectorAll("[data-text]").forEach(function (n) {
    var v = get(n.getAttribute("data-text"));
    if (v == null || v === "") { n.hidden = true; return; }
    n.textContent = v;
  });
  document.querySelectorAll("[data-src-from]").forEach(function (n) {
    n.src = get(n.getAttribute("data-src-from"));
    n.alt = get(n.getAttribute("data-alt-from")) || "";
  });

  /* ---------- hero (lines wrapped so they can slide up one by one) ---------- */
  (function () {
    var h = $("hero-title"); h.textContent = "";
    C.hero.titleLines.forEach(function (l, i) {
      var line = el("span", { class: "line" }, [el("span", { text: l })]);
      line.firstChild.style.setProperty("--i", i);
      h.appendChild(line);
    });
    if (C.hero.titleAccent) h.appendChild(el("span", { class: "accent", text: C.hero.titleAccent }));
  })();
  C.hero.chips.forEach(function (c, i) {
    var li = el("li", { text: c, class: /LIVE/i.test(c) ? "live" : "" });
    li.style.setProperty("--i", i);
    $("hero-chips").appendChild(li);
  });
  document.querySelectorAll(".hero-lead, .hero-small").forEach(function (n, i) {
    n.classList.add("fade-up"); n.style.setProperty("--d", (1.0 + i * 0.15) + "s");
  });

  /* ---------- moving ribbon (items doubled so the loop is seamless) ---------- */
  if (C.marquee && C.marquee.length) {
    var items = C.marquee.concat(C.marquee, C.marquee, C.marquee);
    items.forEach(function (t) { $("marquee-track").appendChild(el("span", { text: t })); });
  }

  /* ---------- countdown (only with a real, future session) ---------- */
  (function () {
    var now = Date.now();
    var next = (C.sessions || [])
      .map(function (s) {
        var start = new Date(s.start).getTime();
        return { s: s, closes: start - (s.closesMinutesBefore || 0) * 60000 };
      })
      .filter(function (x) { return !isNaN(x.closes) && x.closes > now; })
      .sort(function (a, b) { return a.closes - b.closes; })[0];
    if (!next) return; // no real session -> block stays hidden

    $("session-card").hidden = false;
    $("session-head-text").textContent = C.countdownHeader;
    $("session-grades").textContent = next.s.grades || "";
    $("session-label").textContent = next.s.label;
    if (next.s.seatsLeft != null) {
      $("session-seats").hidden = false;
      $("session-seats").textContent = next.s.seatsLeft + (next.s.seatsLeft === 1 ? " SEAT LEFT" : " SEATS LEFT");
    }
    var out = $("session-countdown");
    function tick() {
      var ms = next.closes - Date.now();
      if (ms <= 0) { $("session-card").hidden = true; clearInterval(t); return; }
      var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600),
          m = Math.floor(s % 3600 / 60), sec = s % 60;
      out.textContent = (d ? d + "d " : "") + h + "h " + m + "m " + sec + "s";
    }
    var t = setInterval(tick, 1000); tick();
  })();

  /* ---------- two-question flow ---------- */
  var Q = C.quiz, answers = { goal: null, grade: null };
  var steps = [$("step-1"), $("step-2"), $("step-3")];

  $("q1-label").textContent = Q.q1.label;
  $("q1-title").textContent = Q.q1.title;
  $("q2-label").textContent = Q.q2.label;
  $("q2-title").textContent = Q.q2.title;
  $("q2-foot").textContent = Q.q2.footnote || "";
  $("result-label").textContent = Q.resultLabel;
  $("result-btn-text").textContent = Q.resultButton;
  $("quiz-restart").textContent = Q.restart;

  function setPressed(container, btn) {
    container.querySelectorAll(".tile").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
  }

  Q.q1.options.forEach(function (o, i) {
    var b = el("button", { type: "button", class: "tile", "aria-pressed": "false" }, [
      o.icon ? el("img", { src: o.icon, alt: "", width: "44", height: "44" }) : null,
      el("span", { class: "tile-title", text: o.title }),
      o.sub ? el("span", { class: "tile-sub", text: o.sub }) : null
    ]);
    b.style.setProperty("--i", i);
    b.addEventListener("click", function () {
      answers.goal = o;
      setPressed($("q1-options"), b);
      setTimeout(function () { go(2); }, 320);
    });
    $("q1-options").appendChild(b);
  });

  Q.q2.options.forEach(function (g, i) {
    var b = el("button", { type: "button", class: "tile", "aria-pressed": "false", "aria-label": "Grade " + g }, [
      el("span", { class: "tile-k", text: "GRADE" }),
      el("span", { class: "tile-n", text: g })
    ]);
    b.style.setProperty("--i", i);
    b.addEventListener("click", function () {
      answers.grade = g;
      setPressed($("q2-options"), b);
      setTimeout(function () { go(3); }, 320);
    });
    $("q2-options").appendChild(b);
  });

  function go(n) {
    steps.forEach(function (s, i) { s.hidden = i !== n - 1; });
    $("quiz-bar").style.width = ["34%", "67%", "100%"][n - 1];
    if (n === 3) renderResult();
    // move focus to the new step's heading for keyboard and screen-reader users
    var focusTarget = n === 3 ? $("result-card") : steps[n - 1].querySelector("h2");
    if (focusTarget) {
      if (!focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex", "-1");
      focusTarget.focus({ preventScroll: true });
      var top = $("quiz").getBoundingClientRect().top;
      if (top < -40) $("quiz").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderResult() {
    var r = Q.results[answers.goal.id];
    $("result-title").textContent = r.title;
    $("result-text").textContent = r.text;
    var list = $("result-answers"); list.textContent = "";
    list.appendChild(el("li", { text: answers.goal.title }));
    list.appendChild(el("li", { text: "Grade " + answers.grade }));
    var msg = C.whatsapp.quizMessage
      .replace("{goal}", answers.goal.title)
      .replace("{grade}", answers.grade)
      .replace("{programme}", answers.goal.programme);
    $("result-wa").href = waLink(msg);
    confetti($("result-card"));
  }

  /* small confetti burst in brand colours (skipped for reduced motion) */
  function confetti(host) {
    if (REDUCED) return;
    var old = host.querySelector(".confetti"); if (old) old.remove();
    var box = el("div", { class: "confetti", "aria-hidden": "true" });
    var colours = ["#FFD51F", "#00174D", "#2BD46A", "#FF4D4D", "#0B2E7A", "#FFB800"];
    for (var i = 0; i < 46; i++) {
      var p = el("i");
      var ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 190;
      p.style.setProperty("--x", Math.cos(ang) * dist + "px");
      p.style.setProperty("--y", (Math.sin(ang) * dist * 0.7 + 120 + Math.random() * 80) + "px");
      p.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
      p.style.setProperty("--c", colours[i % colours.length]);
      p.style.setProperty("--delay", (Math.random() * 0.15) + "s");
      if (i % 3 === 0) { p.style.width = "8px"; p.style.height = "8px"; p.style.borderRadius = "50%"; }
      box.appendChild(p);
    }
    host.appendChild(box);
    setTimeout(function () { box.remove(); }, 1900);
  }

  $("q2-back").addEventListener("click", function () { go(1); });
  $("quiz-restart").addEventListener("click", function () {
    answers = { goal: null, grade: null };
    document.querySelectorAll("#quiz .tile").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    go(1);
  });

  /* ---------- what you get ---------- */
  C.whatYouGet.cards.forEach(function (c) {
    $("wyg-cards").appendChild(el("article", { class: "wyg-card" }, [
      el("img", { src: c.icon, alt: "", width: "56", height: "56", loading: "lazy" }),
      el("div", null, [el("h3", { text: c.title }), el("p", { text: c.text })])
    ]));
  });

  /* ---------- how it works ---------- */
  C.howItWorks.steps.forEach(function (s) {
    $("how-steps").appendChild(el("li", null, [
      el("div", null, [el("h3", { text: s.title }), el("p", { text: s.text })])
    ]));
  });

  /* ---------- problem + who we train ---------- */
  var P = C.problem;
  var pt = $("problem-title");
  pt.appendChild(document.createTextNode(P.titleLines[0]));
  if (P.titleLines[1]) pt.appendChild(el("span", { class: "accent", text: P.titleLines[1] }));

  var who = $("who-card");
  who.appendChild(el("span", { class: "paper-label", text: P.cardLabel }));
  who.appendChild(el("h3", { text: P.cardTitle }));
  P.rows.forEach(function (r) {
    who.appendChild(el("div", { class: "who-row" }, [
      el("span", { class: "tag", text: r.tag }),
      el("strong", { text: r.title }),
      el("span", { text: r.text })
    ]));
  });

  var sf = P.sampleFeedback;
  if (sf && sf.enabled && sf.scores && sf.scores.length) {
    var sc = $("sample-card"); sc.hidden = false;
    sc.appendChild(el("span", { class: "paper-label", text: sf.label }));
    sc.appendChild(el("h3", { text: sf.student }));
    sf.scores.forEach(function (s) {
      var dots = el("span", { class: "score-dots", "aria-label": s.score + " out of " + s.max });
      for (var i = 0; i < s.max; i++) dots.appendChild(el("i", { class: i < s.score ? "on" : "" }));
      sc.appendChild(el("div", { class: "score-row" }, [el("span", { text: s.name }), dots]));
    });
    if (sf.note) sc.appendChild(el("p", { text: sf.note }));
  }

  /* ---------- why cognasium + founder ---------- */
  if (C.why && C.why.points) C.why.points.forEach(function (w) {
    $("why-points").appendChild(el("li", null, [el("strong", { text: w.title }), el("span", { text: w.text })]));
  });
  if (C.founder && C.founder.paragraphs) C.founder.paragraphs.forEach(function (t) {
    $("founder-text").appendChild(el("p", { text: t }));
  });

  /* ---------- pricing ---------- */
  if (C.pricing && C.pricing.enabled && C.pricing.plans.length) {
    $("pricing").hidden = false;
    C.pricing.plans.forEach(function (p) {
      var formUrl = p.form && C.forms ? C.forms[p.form] : "";
      // primary button: the programme's enquiry form if there is one, otherwise WhatsApp
      var a = el("a", { class: "btn btn-3d btn-block" + (p.featured ? " btn-shine" : ""), href: formUrl || waLink(p.waMessage), target: "_blank", rel: "noopener", text: p.cta });
      var wa = formUrl ? el("a", { class: "price-wa", href: waLink(p.waMessage), target: "_blank", rel: "noopener", text: C.pricing.waLabel || "or ask on WhatsApp" }) : null;
      var tiers = p.tiers ? el("ul", { class: "price-tiers" }, p.tiers.map(function (t) {
        return el("li", { class: t.best ? "best" : "" }, [
          el("div", { class: "tier-top" }, [el("strong", { text: t.label }), el("span", { class: "tier-price", text: t.price })]),
          el("p", { text: t.note })
        ]);
      })) : null;
      $("price-grid").appendChild(el("article", { class: "price-card" + (p.featured ? " featured" : "") }, [
        p.badge ? el("span", { class: "price-badge", text: p.badge }) : null,
        el("div", { class: "price-head" }, [
          el("p", { class: "price-name", text: p.name }),
          el("h3", { class: "price-big", text: p.bigLine }),
          p.sub ? el("p", { class: "price-sub", text: p.sub }) : null
        ]),
        el("div", { class: "price-body" }, [
          el("p", { class: "price-row" }, [el("span", { class: "price-from", text: "from" }), el("span", { class: "price-amount", text: p.price }), el("span", { class: "price-per", text: p.per })]),
          p.points ? el("ul", { class: "price-points" }, p.points.map(function (t) { return el("li", { text: t }); })) : null,
          tiers,
          p.note ? el("p", { class: "price-note", text: p.note }) : null,
          a, wa
        ])
      ]));
    });
    var cc = C.pricing.concessions;
    if (cc && cc.rows && cc.rows.length) {
      var cn = $("concessions"); cn.hidden = false;
      cn.appendChild(el("span", { class: "paper-label", text: cc.label }));
      cn.appendChild(el("h3", { text: cc.title }));
      cc.rows.forEach(function (r) {
        cn.appendChild(el("div", { class: "who-row" }, [el("span", { class: "tag", text: r.tag }), el("strong", { text: r.title }), el("span", { text: r.text })]));
      });
    }
  }

  /* ---------- wall of fame ---------- */
  if (C.wallOfFame && C.wallOfFame.items) C.wallOfFame.items.forEach(function (f) {
    var alt = f.title + ": " + f.text;
    $("fame-grid").appendChild(el("li", { class: "fame-card" }, [
      el("a", { href: f.img, target: "_blank", rel: "noopener", "aria-label": "Open full poster: " + alt }, [
        el("img", { src: f.img, alt: alt, width: "1040", height: "1280", loading: "lazy" })
      ]),
      el("div", null, [el("strong", { text: f.title }), el("span", { text: f.text })])
    ]));
  });

  /* ---------- social proof ---------- */
  var pr = C.proof;
  if (pr.stats && pr.stats.length) {
    var st = $("stats"); st.hidden = false;
    pr.stats.forEach(function (s) {
      st.appendChild(el("div", null, [el("dt", { text: s.label }), el("dd", { text: s.value })]));
    });
  }
  function iconItem(i, label, sub) {
    return el("li", null, [
      el("img", { src: i, alt: "", width: "44", height: "44", loading: "lazy" }),
      el("div", null, [el("strong", { text: label }), sub ? el("span", { text: sub }) : null])
    ]);
  }
  pr.programmes.forEach(function (p) { $("programmes").appendChild(iconItem(p.icon, p.name, p.sub)); });
  (pr.supporting || []).forEach(function (p) { $("supporting").appendChild(iconItem(p.icon, p.name, p.sub)); });
  pr.pillars.forEach(function (p) { $("pillars").appendChild(iconItem(p.icon, p.name)); });
  if (pr.coaches && pr.coaches.length) {
    var cg = $("coaches"); cg.hidden = false;
    pr.coaches.forEach(function (c) {
      cg.appendChild(el("article", { class: "coach-card" }, [
        el("img", { src: c.photo, alt: c.name, loading: "lazy" }),
        el("div", null, [el("strong", { text: c.name }), el("p", { text: c.role })])
      ]));
    });
  }

  /* ---------- testimonials ---------- */
  var T = C.testimonials;
  T.items.forEach(function (t, idx) {
    var avatar = T.usePhotos && t.photo
      ? el("img", { class: "t-avatar", src: t.photo, alt: "Photo of " + t.name, width: "46", height: "46", loading: "lazy" })
      : el("span", { class: "t-avatar", "aria-hidden": "true", text: initials(t.name) });
    var long = t.quote.length > 320;
    var qid = "tq-" + idx;
    var card = el("figure", { class: "t-card" + (long ? " clamped" : "") }, [
      el("blockquote", null, [el("p", { id: qid, text: t.quote })]),
      el("figcaption", { class: "t-person" }, [
        avatar,
        el("div", null, [el("strong", { text: t.name }), t.role ? el("span", { text: t.role }) : null])
      ])
    ]);
    card.style.margin = "0";
    if (long) {
      var tg = el("button", { type: "button", class: "t-toggle", "aria-expanded": "false", "aria-controls": qid, text: "Read more" });
      tg.addEventListener("click", function () {
        var open = card.classList.toggle("clamped") === false;
        tg.setAttribute("aria-expanded", String(open));
        tg.textContent = open ? "Show less" : "Read more";
      });
      card.insertBefore(tg, card.lastChild);
    }
    $("testimonials").appendChild(card);
  });

  /* ---------- FAQ accordion ---------- */
  C.faq.items.forEach(function (f, i) {
    var qid = "faq-q-" + i, aid = "faq-a-" + i;
    var btn = el("button", { type: "button", class: "faq-q", id: qid, "aria-expanded": "false", "aria-controls": aid }, [
      el("span", { text: f.q }), el("span", { class: "pm", "aria-hidden": "true", text: "+" })
    ]);
    var ans = el("div", { class: "faq-a", id: aid, role: "region", "aria-labelledby": qid }, [
      el("div", null, [el("p", { text: f.a })])
    ]);
    btn.addEventListener("click", function () {
      btn.setAttribute("aria-expanded", String(btn.getAttribute("aria-expanded") !== "true"));
    });
    $("faq").appendChild(el("div", { class: "faq-item" }, [btn, ans]));
  });

  /* ---------- final CTA, sticky bar, footer ---------- */
  displayTitle($("final-title"), C.finalCta.titleLines);
  $("final-wa").href = waLink(C.whatsapp.generalMessage);
  $("final-call").href = "tel:" + C.finalCta.callNumber;
  $("final-call").textContent = C.finalCta.callLabel;
  $("sticky-wa-btn").href = waLink(C.whatsapp.generalMessage);
  $("header-wa").href = waLink(C.whatsapp.generalMessage);

  C.footer.contacts.forEach(function (c) {
    $("footer-contacts").appendChild(el("li", null, [
      el("a", { href: c.href }, [el("small", { text: c.label }), document.createTextNode(c.value)])
    ]));
  });
  C.footer.social.forEach(function (s) {
    $("footer-social").appendChild(el("li", null, [
      el("a", { href: s.href, target: "_blank", rel: "noopener", text: s.label })
    ]));
  });
  $("copyright").textContent = C.footer.copyright.replace("{year}", new Date().getFullYear());

  /* =================================================================
     ANIMATION WIRING
     ================================================================= */

  /* --- Header: shrink + shadow after scrolling, yellow reading-progress bar --- */
  var header = $("site-header"), prog = $("scroll-progress"), ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 10);
    prog.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* --- Hero photo tilts towards the mouse (desktop only) --- */
  var photo = document.querySelector("#hero-photo img");
  if (photo && !REDUCED && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", function (e) {
      var r = photo.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      var dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      photo.style.setProperty("--ry", (dx * 18).toFixed(2) + "deg");
      photo.style.setProperty("--rx", (-dy * 14).toFixed(2) + "deg");
    });
    hero.addEventListener("mouseleave", function () {
      photo.style.setProperty("--ry", "0deg"); photo.style.setProperty("--rx", "0deg");
    });
  }

  /* --- Count-up for prices and stats when they scroll into view --- */
  function countUp(node) {
    var txt = node.textContent, m = txt.match(/[\d,]+/);
    if (!m || REDUCED) return;
    var target = parseInt(m[0].replace(/,/g, ""), 10), start = null, dur = 1100;
    function frame(t) {
      if (!start) start = t;
      var k = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - k, 3);
      node.textContent = txt.replace(m[0], Math.round(target * eased).toLocaleString("en-IN"));
      if (k < 1) requestAnimationFrame(frame); else node.textContent = txt;
    }
    requestAnimationFrame(frame);
  }

  /* --- Scroll reveal --- */
  var groups = [
    [".section-label, .section-intro, .problem-title, .problem-text, .proof-title, .tagline, .sub-label, .verticals", "", 0],
    [".wyg-card", "", 0.08],
    [".steps li", "", 0.12],
    [".paper-card", "", 0],
    [".price-card", "pop", 0.12],
    [".why-grid li", "pop", 0.07],
    [".founder-photo, .founder-copy", "", 0.12],
    [".fame-card", "pop", 0.08],
    [".fame-schools", "", 0],
    [".stats > div", "pop", 0.08],
    [".proof-photo", "", 0],
    [".logo-grid li", "pop", 0.06],
    [".t-card", "", 0.08],
    [".faq-item", "from-left", 0.07],
    [".final-title, .final p, .cta-pulse, .call-link", "", 0.1],
    [".footer-grid > *", "", 0.08]
  ];
  if ("IntersectionObserver" in window && !REDUCED) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = e.target;
        n.classList.add("in");
        rio.unobserve(n);
        n.querySelectorAll(".price-amount").forEach(countUp);
        if (n.matches(".stats > div")) n.querySelectorAll("dd").forEach(countUp);
        // after the entrance, drop the stagger delay so hover effects feel instant
        setTimeout(function () { n.style.transitionDelay = "0s"; n.classList.add("done"); }, 1400);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    groups.forEach(function (g) {
      document.querySelectorAll(g[0]).forEach(function (n, i) {
        if (n.closest("[hidden]")) return;
        n.classList.add("reveal");
        if (g[1]) n.classList.add(g[1]);
        // stagger siblings inside the same parent
        var idx = Array.prototype.indexOf.call(n.parentNode.children, n);
        n.style.transitionDelay = (Math.min(idx, 6) * g[2]) + "s";
        n.style.setProperty("--d", (Math.min(idx, 6) * g[2]) + "s");
        rio.observe(n);
      });
    });
    // "Who we train" rows slide in one after another once the card is visible
    document.querySelectorAll(".who-row").forEach(function (r, i) { r.style.transitionDelay = (0.25 + i * 0.15) + "s"; });
  } else {
    document.querySelectorAll(".who-row").forEach(function (r) { r.style.opacity = 1; r.style.transform = "none"; });
  }

  /* --- Sticky WhatsApp bar: appears after the hero, hides at the final CTA / footer --- */
  if ("IntersectionObserver" in window) {
    var bar = $("sticky-wa"), state = { hero: true, end: false };
    bar.classList.add("is-hidden");
    function sync() { bar.classList.toggle("is-hidden", state.hero || state.end); }
    new IntersectionObserver(function (en) { state.hero = en[0].isIntersecting; sync(); }, { threshold: 0.35 })
      .observe(document.querySelector(".hero"));
    var ends = new Set();
    var eio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? ends.add(e.target) : ends.delete(e.target); });
      state.end = ends.size > 0; sync();
    });
    eio.observe(document.querySelector(".final"));
    eio.observe(document.querySelector(".site-footer"));
  }

  /* --- Lead tracking (Meta Pixel) ---
     ONE event only: every tap on a WhatsApp button (header, quiz result, price
     cards, final CTA, sticky bar) or an enquiry form button (Bigin) sends the
     standard Meta event "Lead" (name in config.js → tracking.event).
     Parameters say where it came from:
       channel      = "whatsapp" or "form"
       content_name = programme (price cards) or the button's id
       button_text  = the button's label */
  var TR = C.tracking || {};
  document.addEventListener("click", function (e) {
    if (typeof window.fbq !== "function" || !e.target.closest) return;
    var a = e.target.closest('a[href*="wa.me/"], a[href*="bigin.online"]');
    if (!a) return;
    var card = a.closest(".price-card"), big = card && card.querySelector(".price-big");
    var holder = a.id ? a : a.closest("[id]");
    window.fbq("track", TR.event || "Lead", {
      channel: a.href.indexOf("wa.me/") > -1 ? "whatsapp" : "form",
      content_name: big ? big.textContent.trim() : (holder ? holder.id : "button"),
      button_text: (a.textContent || "").trim().slice(0, 60)
    }, { eventID: "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) });
  });

  /* --- Links to the main website keep the ad's utm_* / fbclid --- */
  var qs = window.location.search;
  if (qs.length > 1) {
    document.querySelectorAll('a[href^="https://cognasiumindia.com"]').forEach(function (a) {
      var url = new URL(a.href);
      new URLSearchParams(qs).forEach(function (v, k) { if (/^utm_|^fbclid$/.test(k)) url.searchParams.set(k, v); });
      a.href = url.toString();
    });
  }
})();
