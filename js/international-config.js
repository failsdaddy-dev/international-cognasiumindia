/* =====================================================================
   INTERNATIONAL DEBATING — AD LANDING PAGE CONFIG  (international.html)
   Served at international.cognasiumindia.com (see vercel.json rewrite)
   and at cognasiumindia.com/international.
   Everything you may want to change on this page lives here.
   Only claims already published on cognasiumindia.com are used.
   ===================================================================== */
window.INTL_CONFIG = {

  /* ---------- Meta Pixel ------------------------------------------------
     Same Pixel as the main site. Events on this page:
       PageView  – on load (base code)
       Lead      – ONLY when the parent taps the WhatsApp button
     Each event gets a unique event_id. Lead never fires on page load.
     NOTE: the <noscript> fallback in international.html also contains the
     ID, because a no-JavaScript image cannot read this file. Change both. */
  pixelId: "4022027848040743",
  leadEvent: "Lead",

  /* ---------- WhatsApp -------------------------------------------------- */
  whatsapp: {
    number: "919220636572",            // +91 92206 36572, digits only
    // {levelLine} is replaced by "My child's level: …" (or removed if no chip is tapped)
    message:
      "Hi Cognasium! I saw your ad about international debating.\n" +
      "{levelLine}" +
      "Please share the details of the programme."
  },

  /* ---------- "Which level is your child?" (from the main site) -------- */
  levels: [
    { id: "beginner", label: "Beginner",       sub: "New to debating",       message: "Beginner (no debating experience yet)" },
    { id: "school",   label: "School debater", sub: "School or local level", message: "Has debated at school or local tournaments" },
    { id: "advanced", label: "Advanced",       sub: "Wants bigger wins",     message: "Advanced, looking to maximise wins" }
  ],

  /* ---------- Rotating testimonial line (published on the main site) ---
     Short excerpts, word for word, of three of the five published reviews. */
  testimonials: [
    { name: "Shweta Agarwal", role: "Parent",  photo: "assets/img/intl/t-shweta.webp",
      quote: "It was the best decision that I took for Arnav when it comes to debating!" },
    { name: "Aarti Kamat",    role: "Parent",  photo: "assets/img/intl/t-aarti.webp",
      quote: "Training with Cognasium has been a game changer for my son." },
    { name: "Pehal Singhvi",  role: "Student", photo: "assets/img/intl/t-pehal.webp",
      quote: "Every time I've interacted with the trainers, I've left with a better understanding of debates." }
  ],
  rotateEveryMs: 5000,

  /* ---------- Links ----------------------------------------------------- */
  mainSite: "https://cognasiumindia.com/"   // utm_* / fbclid from the ad are added automatically
};
