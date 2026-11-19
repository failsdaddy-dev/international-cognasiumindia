/* =====================================================================
   COGNASIUM INDIA — INTERNATIONAL DEBATING AD PAGE (one screen, no scroll)
   https://international.cognasiumindia.com/  ·  destination of the Meta ad
   Everything you may want to change is here. Only claims already published
   on cognasiumindia.com are used.
   ===================================================================== */
window.PAGE_CONFIG = {

  /* Meta Pixel. PageView on load (index.html <head>). Lead ONLY after the
     enquiry form has been sent successfully (the server said yes).
     The <noscript> image in index.html also has the ID (it cannot read this
     file): change both. */
  pixelId: "4022027848040743",

  /* Enquiry form. Sent to /api/lead, which emails the client.
     The ids below must match api/lead.js (ROLES, GRADES, LEVELS): the server
     is what really enforces them. */
  form: {
    endpoint: "/api/lead",
    roles: [
      { id: "parent",  label: "Parent / guardian" },
      { id: "student", label: "Student" },
      { id: "other",   label: "Other" }
    ],
    grades: ["5", "6", "7", "8", "9", "10", "11", "12"],   // same grades as the main site's grade question
    messages: {
      studentStop:  "Thanks for your interest! Please ask your parent or guardian to fill in this form. Are you the parent? Tap Parent / guardian above.",
      role:         "Please choose who is filling in this form.",
      adult:        "Please confirm you are 18 or older, or ask a parent or guardian to fill in this form.",
      grade:        "Please choose your child's grade.",
      name:         "Enter your full name (letters only).",
      mobile:       "Enter a valid 10-digit mobile number.",
      email:        "Enter an email you check (not a temporary one).",
      city:         "City: letters only, or leave it empty.",
      consent:      "Please tick the box so we can contact you.",
      level:        "Please choose a level again.",
      sending:      "Sending…",
      failed:       "Sorry, your enquiry didn't go through. Please try again in a moment.",
      offline:      "This form can only be sent from the live page.",
      captcha:      "We couldn't confirm you're a person. Please wait a moment and try again.",
      tooFast:      "Please check your details, then press the button again.",
      expired:      "This page was open for a long time. Please press the button again.",
      duplicate:    "We already have an enquiry with this mobile number or email. The team will be in touch.",
      rateLimited:  "Too many tries from this connection. Please try again later."
    }
  },

  /* "Which level is your child?" (from the main site's recommendation card). Optional. */
  levels: [
    { id: "beginner", label: "Beginner" },
    { id: "school",   label: "School debater" },
    { id: "advanced", label: "Advanced" }
  ],

  /* Our students' wins: Wall of Fame posters (swipe gallery below the first screen) */
  wins: [
    { img: "assets/img/fame-rishi-wsc-globals.webp",   title: "Rishi Pinapatruni",        text: "World Scholar's Cup Globals 2026: Gold in Team Debate, Scholar's Bowl and Individual Debate" },
    { img: "assets/img/fame-asia-novice-wsdc.webp",    title: "Asia Schools Novice WSDC", text: "Under-18 Champions: Miraya Chitkara, Shagun Sheokand and Riti Jain" },
    { img: "assets/img/fame-intertext-apd.webp",       title: "Intertext Schools APD",    text: "International breaks for Ariav Kamat, Keyan Khan and Arshiya Gupta" },
    { img: "assets/img/fame-kabir-john-locke.webp",    title: "Kabir Kapadia",            text: "Shortlisted, John Locke Institute Global Essay Prize 2026" },
    { img: "assets/img/fame-ariav-cambridge.webp",     title: "Ariav Kamat",              text: "Honourable Mention, Cambridge Re:Think Essay Competition 2026" },
    { img: "assets/img/fame-rishi-wsc-bangalore.webp", title: "World Scholar's Cup",      text: "Rishi Pinapatruni: Gold in collaborative writing, Silver in team debate" }
  ],

  /* How it works (from the main site) */
  steps: [
    { title: "Send the short form",     text: "Tell us your child's grade and how much debating they've done." },
    { title: "Train for 3 months",     text: "Live online classes with a specialist coach." },
    { title: "Debate internationally", text: "Your child's first international tournament. We form the team, find the tournament and register you." }
  ],

  /* All five published testimonials: short excerpts, word for word, with their published photos */
  testimonials: [
    { name: "Shweta Agarwal",   role: "Parent",  photo: "assets/img/t-shweta.webp",
      quote: "It was the best decision that I took for Arnav when it comes to debating!" },
    { name: "Aarti Kamat",      role: "Parent",  photo: "assets/img/t-aarti.webp",
      quote: "Training with Cognasium has been a game changer for my son." },
    { name: "Pehal Singhvi",    role: "Student", photo: "assets/img/t-pehal.webp",
      quote: "Every time I've interacted with the trainers, I've left with a better understanding of debates." },
    { name: "Arha Vishwakarma", role: "",        photo: "assets/img/t-arha.webp",
      quote: "Cognasium has been immensely helpful in building the reading and speaking skills of my ward." },
    { name: "Aparna L.",        role: "Parent",  photo: "assets/img/t-aparna.webp",
      quote: "The teachers are engaging, polite and invested which is wonderful to see." }
  ],
  rotateEveryMs: 4500,

  mainSite: "https://cognasiumindia.com/"   // utm_* and fbclid from the ad are added automatically
};
