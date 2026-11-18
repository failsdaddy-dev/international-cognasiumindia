/* =====================================================================
   COGNASIUM INDIA — INTERNATIONAL DEBATING AD PAGE (one screen, no scroll)
   https://international.cognasiumindia.com/  ·  destination of the Meta ad
   Everything you may want to change is here. Only claims already published
   on cognasiumindia.com are used.
   ===================================================================== */
window.PAGE_CONFIG = {

  /* Meta Pixel. PageView on load (index.html <head>), Lead ONLY when the
     WhatsApp button is tapped. The <noscript> image in index.html also has
     the ID (it cannot read this file): change both. */
  pixelId: "4022027848040743",

  whatsapp: {
    number: "919220636572",   // +91 92206 36572, digits only
    // {levelLine} becomes "My child's level: …" or is removed if no level is tapped
    message:
      "Hi Cognasium! I saw your ad about international debating.\n" +
      "{levelLine}" +
      "Please share the details of the programme."
  },

  /* "Which level is your child?" (from the main site's recommendation card) */
  levels: [
    { id: "beginner", label: "Beginner",       message: "Beginner (no debating experience yet)" },
    { id: "school",   label: "School debater", message: "Has debated at school or local tournaments" },
    { id: "advanced", label: "Advanced",       message: "Advanced, looking to maximise wins" }
  ],

  /* Our students' wins: posters from the Wall of Fame (sliding strip) */
  wins: [
    { img: "assets/img/fame-rishi-wsc-globals.webp",   alt: "Rishi Pinapatruni: Gold in Team Debate, Scholar's Bowl and Individual Debate, World Scholar's Cup Globals 2026" },
    { img: "assets/img/fame-asia-novice-wsdc.webp",    alt: "Miraya Chitkara, Shagun Sheokand and Riti Jain: Asia Schools Novice WSDC Under-18 Champions" },
    { img: "assets/img/fame-kabir-john-locke.webp",    alt: "Kabir Kapadia: shortlisted, John Locke Institute Global Essay Prize 2026" },
    { img: "assets/img/fame-ariav-cambridge.webp",     alt: "Ariav Kamat: Honourable Mention, Cambridge Re:Think Essay Competition 2026" },
    { img: "assets/img/fame-intertext-apd.webp",       alt: "Ariav Kamat, Keyan Khan and Arshiya Gupta: international break at Intertext Schools Asian Parliamentary Debate" },
    { img: "assets/img/fame-rishi-wsc-bangalore.webp", alt: "Rishi Pinapatruni: Gold and Silver medals at the World Scholar's Cup" }
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
