/* =====================================================================
   COGNASIUM INDIA — INTERNATIONAL DEBATING AD PAGE CONFIG
   (international.cognasiumindia.com: a shorter copy of the main site.
   Sections not on this page — How it works, Why Cognasium, Founder, Programmes —
   keep their entries below only so js/main.js runs unchanged; they are not shown.)
   Everything you might want to edit lives in this one file.
   Rules used while writing it:
   - Facts come from cognasiumindia.com, the Loom call transcript, or the
     client's Google Doc "Final landing page outlay" (16 Nov 2026), which wins
     wherever they differ (programmes, fees, founder, wall of fame, forms).
   - Anything marked  // MISSING  needs a real value from Cognasium.
     Sections with empty lists / enabled:false stay hidden on the page.
   ===================================================================== */
window.COGNASIUM_CONFIG = {

  /* ---------- Brand colours (also defined in css/styles.css :root) ----
     Sampled from the Cognasium WhatsApp logo. Change here to override. */
  theme: {
    "--c-yellow": "#FFD51F",      // logo yellow
    "--c-yellow-dark": "#C9A300", // 3D edge under yellow buttons
    "--c-navy": "#00174D",        // logo navy
    "--c-navy-2": "#0B2E7A",      // lighter navy band (Taivas used a royal-blue band here)
    "--c-cream": "#FFF8E1",
    "--c-card": "#FFFFFF",
    "--c-border": "#D9DFEC",
    "--c-text": "#00174D",
    "--c-muted": "#3D4B6E",
    "--c-success": "#16803C"
  },

  brand: {
    name: "Cognasium India",
    logo: "assets/img/logo-mark.png",           // cropped from the WhatsApp profile image (238px)
    logoAlt: "Cognasium India logo: a yellow C with navy figures and the words You got it",
    wordmarkTop: "COGNASIUM",
    wordmarkBottom: "India"
  },

  /* ---------- WhatsApp ------------------------------------------------
     +91 92206 36572 is the real, current number (confirmed by the owner, 16 Nov 2026).
     The old +91 93151 36811 is no longer used anywhere. */
  whatsapp: {
    number: "919220636572",   // digits only, with country code, no +
    // {goal}, {grade}, {programme} are filled from the two-question flow.
    quizMessage:
      "Hi Cognasium! I found you through your website.\n" +
      "My child's main goal: {goal}\n" +
      "Grade: {grade}\n" +
      "I'd like to know more about: {programme}",
    generalMessage:
      "Hi Cognasium! I'd like to know more about your debating programme for my child.",
    stickyLabel: "Chat on WhatsApp",
    stickyNote: "Usually the quickest way to reach us"
  },

  /* ---------- Hero ---------------------------------------------------- */
  hero: {
    chips: ["LIVE ONLINE", "DEBATING & MUN", "BEST FOR GRADES 6 TO 8"],
    titleLines: ["ALREADY", "DEBATING", "AT SCHOOL?"],
    titleAccent: "TAKE IT INTERNATIONAL.",
    lead:
      "Live online debate training with a specialist coach. Three months of preparation, " +
      "then your child's first international tournament. We build the team, find the tournament and register for you.",
    small:
      "For children who already speak English fluently and want to go beyond inter-school competitions.",
    image: "assets/img/hero-coach.jpg",
    imageAlt: "A Cognasium trainer explaining types of rebuttal on a whiteboard"
  },

  /* ---------- Moving ribbon under the hero (real Cognasium programmes) -- */
  marquee: ["Parliamentary Debate", "APD · BPD · WSDC", "Model UN", "Creative Writing", "Public Speaking", "Current Affairs", "Pocket Courses", "Individual Classes", "Practice Debates"],

  /* ---------- Tracking ------------------------------------------------
     Meta Pixel 4022027848040743 is installed in index.html <head>.
     Only one button event is used: the standard Meta event "Lead", for every
     WhatsApp button and every enquiry form button. */
  tracking: {
    event: "Lead"   // the ONLY button event: WhatsApp and enquiry-form taps both send "Lead"
  },

  /* ---------- Enquiry forms (Bigin), from the Google Doc ---------------
     NOTE: the doc gives the "cognasium-60-current-affairs-enquiry" form as the
     form for debate training. It is used for both until Cognasium confirms
     a separate debate form. */
  forms: {
    debate: "https://in.bigin.online/org60083190014/forms/cognasium-60-current-affairs-enquiry",
    creativeWriting: "https://in.bigin.online/org60083190014/forms/cogcreate-creative-writing-consultation-booking",
    mun: "https://in.bigin.online/org60083190014/forms/mun",
    currentAffairs: "https://in.bigin.online/org60083190014/forms/cognasium-60-current-affairs-enquiry"
  },

  /* ---------- Countdown -----------------------------------------------
     Shown ONLY if at least one session below is in the future.
     Leave the list empty and the whole block stays hidden. No fake urgency.
     Example entry:
       { label: "Saturday 5 PM", start: "2026-11-21T17:00:00+05:30",
         grades: "6 TO 8", closesMinutesBefore: 60, seatsLeft: null }      */
  sessions: [
    // MISSING: real upcoming demo/class times from Cognasium
  ],
  countdownHeader: "NEXT LIVE CLASS",

  /* ---------- Two-question flow ---------------------------------------- */
  quiz: {
    q1: {
      label: "QUESTION 1 OF 2",
      title: "What do you most want for your child right now?",
      options: [
        { id: "intl",     icon: "assets/img/icon-debate.png",  title: "Debate internationally", sub: "Already debates at school, wants more", programme: "Cognasium Core (competitive debate)" },
        { id: "start",    icon: "assets/img/icon-speaker.png", title: "Start debating",         sub: "Fluent in English, no debate club at school", programme: "Cognasium Triad (public speaking and novice debating)" },
        { id: "confident",icon: "assets/img/learner-centred.png", title: "Speak with confidence", sub: "Knows the answer, holds back", programme: "Cognasium Triad or Cognasium Create" },
        { id: "news",     icon: "assets/img/icon-news.png",    title: "Understand current affairs", sub: "News, made simple, every week", programme: "Cognasium 60 (current affairs)" }
      ]
    },
    q2: {
      label: "QUESTION 2 OF 2",
      title: "Which grade is your child in?",
      options: ["5", "6", "7", "8", "9", "10", "11", "12"],
      footnote: "Younger than Grade 5? Message us and we'll tell you what fits."
    },
    // Result card copy, keyed by q1 option id.
    results: {
      intl: {
        title: "Cognasium Core",
        text: "Competitive parliamentary debate training in APD, BPD and WSDC formats, live online with a specialist coach. On the quarterly plan, three months of training end with your child's first tournament. We form and prepare the team, find the tournament and handle registration."
      },
      start: {
        title: "Cognasium Triad",
        text: "Our foundation course in public speaking and novice-level debating. After the first three months and a first tournament guided by Cognasium, your child moves up to higher levels."
      },
      confident: {
        title: "Start small, then speak",
        text: "Not every child is ready for a debate stage on day one. Cognasium Triad builds public speaking step by step, and Cognasium Create builds confidence through writing. Tell us about your child and we'll suggest where to begin."
      },
      news: {
        title: "Cognasium 60",
        text: "Our current affairs programme that turns everyday news reading into a game: simplified news in a WhatsApp community, one theory class a week and a live quiz online every Sunday."
      }
    },
    resultLabel: "YOUR NEXT STEP",
    resultButton: "Send this on WhatsApp",
    restart: "Change answers"
  },

  /* ---------- What you get (5 cards) — from the Loom call ------------- */
  whatYouGet: {
    heading: "WHAT YOU GET",
    cards: [
      { icon: "assets/img/girl.png",        title: "LIVE ONLINE",           text: "Live classes on Google Meet. No travel." },
      { icon: "assets/img/faculty.png",     title: "A SPECIALIST COACH",     text: "Personalised training on argument, rebuttal and delivery." },
      { icon: "assets/img/icon-debate.png", title: "A TEAM, READY",         text: "We form your child's team and prepare it for the tournament." },
      { icon: "assets/img/nep.png",         title: "TOURNAMENT HANDLED",    text: "We find the right international tournament and register you." },
      { icon: "assets/img/feedback.png",    title: "REGULAR FEEDBACK",      text: "Parents know where their child stands and what comes next." }
    ]
  },

  /* ---------- How it works (3 steps) ---------------------------------- */
  howItWorks: {
    heading: "HOW IT WORKS",
    steps: [
      { title: "TELL US ABOUT YOUR CHILD", text: "Answer two questions above and send them to us on WhatsApp." },
      { title: "TRAIN FOR 3 MONTHS",       text: "Live online classes with a specialist coach." },
      { title: "DEBATE INTERNATIONALLY",   text: "Your child's first international tournament, organised by us." }
    ]
  },

  /* ---------- Why Cognasium + founder (Google Doc) --------------------- */
  why: {
    heading: "WHY COGNASIUM",
    intro: "Where skill training is only the first step of a long and shared journey.",
    points: [
      { title: "A founder who has done it", text: "Started by a debater, researcher and curriculum developer with the vision and the background in this field." },
      { title: "Personalised learning", text: "Every child is trained for where they are, not where a batch is." },
      { title: "Outcome-oriented teaching", text: "Training built around results your child can see in their next tournament or submission." },
      { title: "Only training, nothing else", text: "We are an exclusively training-based organisation. We don't also run competitions, so our focus never splits." },
      { title: "We trained a World Champion", text: "Arnav Agarwal: World Champion at WSDC 2025 Panama and finalist at WSDC Kenya 2026." }
    ]
  },
  founder: {
    label: "WHO IS THE FOUNDER AND WHY IT MATTERS",
    name: "Nitiksha",
    role: "Founder, Cognasium India",
    photo: "assets/img/founder-nitiksha.jpg",
    photoAlt: "Nitiksha, founder of Cognasium India, speaking at a podium",
    paragraphs: [
      "Nitiksha debated extensively across formats right through her master's in English Literature. She is not only a debater but also a published independent researcher in the Humanities.",
      "She worked as the curriculum developer at the Indian Debating League and ran debate bootcamps at other educational institutions, such as Pratarka, before she started Cognasium. She works actively with students at all levels, with a special focus on curriculum design and on faculty who teach with tact.",
      "It is rare for an education brand to be started by a passionate educator with experience in every area it teaches. You are looking at an educator turned entrepreneur whom you can trust and approach at all times."
    ]
  },

  /* ---------- Wall of fame: posters from the Google Doc ---------------- */
  wallOfFame: {
    heading: "COGNASIUM WALL OF FAME",
    intro: "A few of the results our students have brought home.",
    items: [
      { img: "assets/img/fame-rishi-wsc-globals.jpg",   title: "Rishi Pinapatruni", text: "World Scholar's Cup Globals, Kuala Lumpur 2026: Gold in Team Debate, Scholar's Bowl and Individual Debate" },
      { img: "assets/img/fame-asia-novice-wsdc.jpg",    title: "Asia Schools Novice WSDC", text: "Under-18 Champions: Miraya Chitkara, Shagun Sheokand and Riti Jain" },
      { img: "assets/img/fame-kabir-john-locke.jpg",    title: "Kabir Kapadia", text: "Shortlisted, John Locke Institute Global Essay Prize 2026 (Philosophy)" },
      { img: "assets/img/fame-ariav-cambridge.jpg",     title: "Ariav Kamat", text: "Honourable Mention, Cambridge Re:Think Essay Competition 2026" },
      { img: "assets/img/fame-intertext-apd.jpg",       title: "Intertext Schools APD", text: "Ariav Kamat and Keyan Khan's first international break, Arshiya Gupta's second" },
      { img: "assets/img/fame-rishi-wsc-bangalore.jpg", title: "World Scholar's Cup", text: "Rishi Pinapatruni: Gold in collaborative writing, Silver in team collaborative writing and team debate" }
    ],
    schools: {
      img: "assets/img/fame-schools.jpg",
      alt: "Logos of schools whose students train at Cognasium, including St. Mary's School Pune, Greenwood High, CHIREC International School and Delhi Public School",
      caption: "Joining the dots: students from these schools train with Cognasium."
    }
  },

  /* ---------- Problem + "who we train" card --------------------------- */
  problem: {
    titleLines: ["GOOD AT SCHOOL DEBATES.", "NEVER BEEN TO AN INTERNATIONAL ONE."],
    text:
      "Most schools only run inter-school competitions. International tournaments, online and abroad in countries like Malaysia and the Philippines, are open to school students. " +
      "Most families simply don't know which ones to enter or how to get a team ready.",
    cardLabel: "OUR RECOMMENDATION",
    cardTitle: "Which level is your child?",
    rows: [
      { tag: "BEGINNER", title: "No experience in any activity", text: "Start with Cognasium Triad for all-round skill development. Move up to higher levels after the first three months and a first tournament guided by Cognasium." },
      { tag: "SOME EXPERIENCE", title: "School-level or local/private tournaments", text: "Start with Cognasium Triad to build knowledge, and combine it with one Cognasium Core class for advanced debating." },
      { tag: "ADVANCED", title: "Accomplished, looking to maximise wins", text: "Take a Virtual Program: buy the workbook, attempt cases and send them to senior Cognasium trainers for review and feedback. Add the mock debates and skip the classes." }
    ],
    // A scored SAMPLE feedback card (like Taivas's) is NOT shown because we don't have
    // Cognasium's real feedback rubric. Fill this in and set enabled:true to show it.
    sampleFeedback: {
      enabled: false, // MISSING: Cognasium's real feedback categories + a sample coach note
      label: "SAMPLE FEEDBACK",
      student: "Sample student, Grade 7",
      scores: [ /* { name: "Rebuttal", score: 3, max: 5 } */ ],
      note: ""
    }
  },

  /* ---------- Membership models: programmes and fees (Google Doc) ------
     Each plan: monthly / quarterly / annual tiers. "form" = Bigin enquiry form
     (see forms above); the WhatsApp link is always shown as well. */
  pricing: {
    enabled: true,
    label: "THE PROGRAMME AND FEES",
    intro: "Pick the plan that matches how sure you are.",
    plans: [
      {
        featured: true,
        badge: "MAIN PROGRAMME",   // small tag on the card; "" to hide
        name: "DEBATE PROGRAMMES",
        bigLine: "COGNASIUM CORE",
        sub: "Competitive parliamentary debate: APD, BPD and WSDC formats",
        price: "₹4,500",
        per: "per month",
        tiers: [
          { label: "Monthly", price: "₹4,500", note: "Ideal if you're only testing the waters and your child isn't sure yet." },
          { label: "Quarterly", price: "₹12,000", note: "Ideal to see change from consistent effort. Comes with the first tournament at the end of the 3 months." },
          { label: "Annual", price: "₹45,000", note: "Ideal if you're sure your child is invested in debating." }
        ],
        form: "",   // "" = the button opens WhatsApp (the ad page sends everyone to WhatsApp)
        cta: "Ask about the next batch",
        waMessage: "Hi Cognasium! I'd like to know more about Cognasium Core (debate programmes) for my child."
      }
    ],
    waLabel: "or ask on WhatsApp",
    footnote: "International tournament fees are charged separately. GST and batch timings: message us." // MISSING: confirm whether prices include GST
  },

  /* ---------- Social proof --------------------------------------------- */
  proof: {
    heading: "PROGRAMMES AT COGNASIUM",
    // MISSING: real numbers (students trained, tournaments, years). Empty = hidden.
    stats: [
      // { value: "500+", label: "students trained" }
    ],
    photo: "assets/img/classroom.jpg",
    photoAlt: "A Cognasium session in a classroom, with a trainer speaking to a group of students",
    photoCaption: "A Cognasium session in progress",
    tagline: "You are a step away from starting as a reader and ending up a researcher with a lot of debating escapades in between!",
    programmesHeading: "MAIN PROGRAMMES",
    programmes: [
      { icon: "assets/img/icon-debate.png",  name: "Cognasium Core",   sub: "Competitive parliamentary debate (APD, BPD, WSDC)" },
      { icon: "assets/img/nep1.png",         name: "Competitive MUN",  sub: "Training for all major conferences around the year" },
      { icon: "assets/img/icon-book.png",    name: "Cognasium Create", sub: "Competitive creative writing, prep for all major competitions" },
      { icon: "assets/img/icon-speaker.png", name: "Cognasium Triad",  sub: "Foundation course in public speaking and novice debating" }
    ],
    supportingHeading: "SUPPORTING PROGRAMMES FOR BEST RESULTS AND INDIVIDUAL ATTENTION",
    supporting: [
      { icon: "assets/img/girl.png",            name: "Pocket Courses",       sub: "20-minute sessions, 2 or 3 times a week, for every skill we teach" },
      { icon: "assets/img/icon-news.png",       name: "Cognasium 60",         sub: "Current affairs that gamifies everyday news reading" },
      { icon: "assets/img/learner-centred.png", name: "Individual Classes",   sub: "Targeted prep for events and last-minute tips" },
      { icon: "assets/img/faculty.png",         name: "Virtual Programs",     sub: "Recorded course, workbook and 2 months of expert support" },
      { icon: "assets/img/feedback.png",        name: "Practice Debate Packs", sub: "Debate super-senior mentors and get feedback" }
    ],
    verticalsLine: "",
    pillarsHeading: "WHAT WE STAND ON",
    pillars: [
      { icon: "assets/img/nep.png",             name: "NEP 2020" },
      { icon: "assets/img/faculty.png",         name: "State of the art faculty" },
      { icon: "assets/img/feedback.png",        name: "Robust feedback mechanism" },
      { icon: "assets/img/learner-centred.png", name: "Learner centred pedagogy" }
    ],
    // Coach / founder cards. MISSING: names, roles, photos. Empty = hidden.
    coaches: [
      // { name: "", role: "", photo: "assets/img/coach-1.jpg" }
    ]
  },

  /* ---------- Testimonials: the five published on cognasiumindia.com --
     usePhotos:false shows initials instead of photos, because some of the
     published photos are of children. Set to true once you have consent. */
  testimonials: {
    heading: "WHAT PARENTS AND STUDENTS SAY",
    usePhotos: true,   // real photos published on the old cognasiumindia.com (turned on 18 Nov 2026 at the owner's request)
    items: [
      {
        name: "Shweta Agarwal", role: "Parent", photo: "assets/img/t-shweta.jpg",
        quote: "My son Arnav has been training with Cognasium for the past one year and I can safely say it was the best decision that I took for Arnav when it comes to debating! There was a complete transformation in the way Arnav approached debating once he started getting trained. Earlier we felt we did well but did not win. It was quite disheartening, we could not tell what was wrong. My son has only had an upward trajectory with many breaks in globally renowned competitions. I recommend Cognasium to everyone. They are truly a blessing."
      },
      {
        name: "Aarti Kamat", role: "Parent", photo: "assets/img/t-aarti.jpg",
        quote: "Training with Cognasium has been a game changer for my son. They are genuinely involved in teaching such that they work to make a difference and they are great with children. They are extremely approachable. Trainers makes learning fun. I would strongly recommend them for all students planning on national and international debating experience."
      },
      {
        name: "Pehal Singhvi", role: "Student", photo: "assets/img/t-pehal.jpg",
        quote: "Every Time I've interacted with the trainers, I've left with a better understanding of debates. Oh, and their suggestions regarding reading material on any given theme are fabulous, regardless of whether you are just starting out or are an advanced debater. My trainer is the reason I fell in love with Michel Foucault, and was able to grasp the nuances of rebuttals for which I always remain grateful."
      },
      {
        name: "Arha Vishwakarma", role: "", photo: "assets/img/t-arha.jpg",
        quote: "Cognasium has been immensely helpful in building the reading and speaking skills of my ward. His ways of expression, use of a varied vocabulary, understanding complex ideas in simpler ways and applying all out of a constrained environment like a class has progressed significantly."
      },
      {
        name: "Aparna L.", role: "Parent", photo: "assets/img/t-aparna.jpg",
        quote: "It's been an amazing few months with the Book Club. My child's vocabulary has grown immensely, he has a much better understanding of several important social constructs. It's a great way to acquaint children with popular and relevant literature. He looks forward to sharing his thoughts in class. The teachers are engaging, polite and invested which is wonderful to see. I see the book club as something that is adding tremendous value to my child and I couldn't be happier to have him be a part of this."
      }
    ]
  },

  /* ---------- FAQ (4) — answers use facts from the Loom call ----------- */
  faq: {
    heading: "QUESTIONS",
    items: [
      { q: "Are the classes online or in person?",
        a: "Online. Classes are live on Google Meet with a specialist coach, so your child can join from anywhere in India." },
      { q: "My child has never debated. Is this for them?",
        a: "Yes. Absolute beginners start with Cognasium Triad, our foundation course in public speaking and novice debating, and move up to higher levels after the first three months and a first tournament guided by Cognasium. Tell us about your child on WhatsApp and we'll suggest where to begin." },
      { q: "Are international tournament fees included?",
        a: "No. We find the tournament, form and prepare the team and handle the registration, but the tournament's own fee is charged separately. We'll tell you the amount before you sign up." },
      { q: "What does it cost?",
        a: "The debate programme (Cognasium Core) is ₹4,500 a month, ₹12,000 a quarter or ₹45,000 a year. Siblings pay ₹500 less a month each. International tournament fees are charged separately. Message us for batch timings." }
    ]
  },

  /* ---------- Final call to action ------------------------------------ */
  finalCta: {
    titleLines: ["READY FOR THE", "NEXT STAGE?"],
    text: "Message us on WhatsApp. Tell us your child's grade and how much debating they've done, and we'll take it from there.",
    button: "Message us on WhatsApp",
    callLabel: "Or call +91 92206 36572",
    callNumber: "+919220636572"
  },

  /* ---------- Footer: as published on cognasiumindia.com --------------- */
  footer: {
    contacts: [
      // +91 93151 36811 removed 16 Nov 2026: owner confirmed +91 92206 36572 is the real, current number.
      { label: "Got questions? Call us", value: "+91 9220636572", href: "tel:+919220636572" },
      { label: "Email", value: "cognasiumindia@gmail.com", href: "mailto:cognasiumindia@gmail.com" }
    ],
    social: [
      { label: "Main website", href: "https://cognasiumindia.com/" },
      { label: "Instagram", href: "https://www.instagram.com/cognasiumindia/" },
      { label: "Video tour (YouTube)", href: "https://www.youtube.com/watch?v=p93Ynnxz63U" }
    ],
    copyright: "© {year} Cognasium India. All rights reserved."
  }
};
