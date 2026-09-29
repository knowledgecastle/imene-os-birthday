/*
  imene.os content
  Every piece of copy and every picture path lives here.
  Edit freely; app.js only reads from window.CONTENT.

  House rules for copy: no money, no client names (industries only),
  none of the private topics listed in the build spec,
  no em dashes, and only one exclamation mark on the whole site
  (it lives in the birthday finale).
*/
window.CONTENT = {
  site: {
    name: "imene.os",
    url: "https://thedigicrafters.com",
    urlLabel: "thedigicrafters.com",
    prompt: "imene@digicrafters",
    cwd: "~/2026",
    terminalHint: "type help or click an icon",
  },

  // Lofi scene per theme. Swap these files to change the room.
  // Background music, off until the visitor clicks Sound.
  // Drop a royalty-free or licensed MP3 at this path. If the file is missing,
  // the site falls back to a generated rain ambience.
  music: {
    src: "assets/music/lofi.mp3",
    title: "arabic jazz, side a", // shown in the dock while it plays
    volume: 0.35,
  },

  backgrounds: {
    light: "assets/bg/lofi-day.jpg",
    dark: "assets/bg/lofi-night.jpg",
  },

  boot: [
    "booting imene.os v2026...",
    "✓ loading 12 months",
    "✓ mounting 28 major clients",
    "✓ indexing 21,000+ template downloads",
    "✓ ready",
  ],

  // Order here is the order of the desktop icons.
  windows: {
    whoami: {
      icon: "user",
      label: "whoami",
      title: "whoami",
      command: "whoami",
      summary: "Imene Mellal. Operations architect. Notion as the brain, Claude as the engine.",
      picture: "assets/portrait.jpg",
      name: "Imene Mellal",
      lines: [
        "Operations architect. Notion Consulting Partner and Claude Partner.",
        "Founder of The Digital Crafters.",
        "I design how businesses run: Notion as the brain, Claude as the engine, automation as the nervous system.",
      ],
      languages: ["English", "Français", "العربية", "Darija"],
      link: { label: "thedigicrafters.com", href: "https://thedigicrafters.com" },
    },

    shift: {
      icon: "git-compare",
      label: "the-shift",
      title: "git diff 2025..2026",
      command: "git diff 2025..2026",
      summary: "3 files changed, 3 insertions(+), 3 deletions(-). The whole year in one diff.",
      rows: [
        {
          before: { title: "Tidy Notion workspaces", note: "one tool, organized well" },
          after: { title: "Notion as the operating brain", note: "one source of truth for the whole business" },
        },
        {
          before: { title: "Ready-made integrations", note: "connecting what already existed" },
          after: { title: "Claude and automation as the engine", note: "custom skills, my own MCP server, n8n" },
        },
        {
          before: { title: "Solo freelancer", note: "one project, one person, one skill set" },
          after: { title: "A company with partners", note: "audit first, then phased delivery" },
        },
      ],
    },

    clients: {
      icon: "briefcase",
      label: "major-clients",
      title: "~/clients",
      command: "ls clients",
      summary: "28 major clients across 25+ industries. Click a folder, or try cd clients/<tab>.",
      counter: "28 major clients · 25+ industries",
      filters: [
        { id: "all", label: "All" },
        { id: "build", label: "Full builds" },
        { id: "consult", label: "Consultations" },
      ],
    },

    templates: {
      icon: "layout-template",
      label: "templates",
      title: "templates",
      command: "open templates",
      summary: "21,000+ downloads from 1,600+ organizations. Top Creator, April 2026.",
      pictures: [
        "assets/templates/cover-1.jpg",
        "assets/templates/cover-2.jpg",
        "assets/templates/cover-3.jpg",
        "assets/templates/cover-4.jpg",
        "assets/templates/cover-5.jpg",
        "assets/templates/cover-6.jpg",
      ],
      stats: [
        { value: 21000, suffix: "+", label: "downloads" },
        { value: 1600, suffix: "+", label: "organizations" },
        { text: "Top Creator", label: "on Notion's marketplace, April 2026" },
      ],
      text: "Spotted at PwC, FedEx, PepsiCo, Porsche, TIME and TripAdvisor, and on campuses from Berkeley to NUS Singapore. The most loved one: a monthly budget tracker, because people want one clear job done well.",
      newThisYear: [
        "P1.express task system",
        "a gamified prayer tracker",
        "a behaviour-design system",
        "an Etsy shop fed by a listing tool I built myself",
      ],
    },

    community: {
      icon: "users",
      label: "community",
      title: "community",
      command: "open community",
      summary: "Teaching freelancing, Notion, automation and AI to an Arabic-speaking community.",
      picture: "assets/community-live.jpg",
      stats: [
        { value: 5, suffix: "+", label: "new courses launched" },
        { value: 100, suffix: "+", label: "hours of video delivered" },
        { value: 150, suffix: "", label: "members, currently" },
        { value: 449, suffix: "", label: "people at one live session in Darija, 183 stayed past two hours" },
      ],
      text: "I teach freelancing, Notion, automation and AI to an Arabic-speaking community.",
    },

    skills: {
      icon: "cpu",
      label: "skills",
      title: "brew list --learned",
      command: "brew list --learned",
      summary: "22 packages installed this year. No regrets, one dependency on coffee.",
      packages: [
        "claude-code",
        "custom-skills (20+)",
        "mcp-server (built my own)",
        "n8n (self-hosted)",
        "local-llms",
        "framer-cms",
        "advanced-ai-automations",
        "systems-thinking",
        "make.com",
        "notion-architecture",
        "notion-ai-agents",
        "prompt-engineering",
        "process-mapping",
        "data-modeling",
        "api-integrations",
        "audit-first-consulting",
        "swiftui-vibecoding",
        "course-design",
        "community-building",
        "template-design",
        "framer-sites",
        "change-management",
      ],
      compare: [
        ["Used Claude in a chat window", "Run Claude Code and wrote 20+ custom skills that encode how I scope, pitch and deliver"],
        ["Connected apps through ready-made integrations", "Built my own MCP server for a marketplace API, designed inside its terms of use"],
        ["Relied on hosted automation plans", "Run my own n8n server and convert workflows between Relay and Make"],
        ["Thought of AI as a writing assistant", "Run open-source models locally on my laptop"],
        ["Worked as a freelancer", "Run a US company with partners and an audit-first delivery model"],
      ],
    },

    lessons: {
      icon: "book-open",
      label: "lessons",
      title: "lessons.txt",
      command: "cat lessons.txt",
      summary: "4 lessons, each one learned the useful way. Click a card to flip it.",
      cards: [
        { front: "Structure protects you better than effort.", back: "A clear timeline settles what a long argument never will." },
        { front: "Qualify before discovery, not after the proposal.", back: "The right questions early save everyone's time." },
        { front: "An audit first, then build in phases.", back: "Clients see the map before they pay for the road." },
        { front: "A clean no is a productivity tool.", back: "Every no made room for better work." },
      ],
    },

    apps: {
      icon: "rocket",
      label: "shipped-apps",
      title: "~/apps",
      command: "open apps",
      summary: "2 apps vibecoded with Claude Code this year, both in daily use.",
      kicker: "built with Claude Code, used every day",
      list: [
        {
          slug: "timetracker",
          name: "My Time Tracker",
          iconImage: "assets/apps/timetracker-icon.png",
          screenshot: "assets/apps/timetracker-screenshot.jpg", // optional, hidden if missing
          tag: "Open source",
          platforms: ["macOS", "iPhone", "Apple Watch", "Widget + Live Activity"],
          tagline: "A time tracker that lives on every Apple screen I own, with Notion as its memory.",
          points: [
            "Two-way Notion sync: pulls in projects and tasks, writes a time entry back the moment a timer stops.",
            "A Notion-style interface in light and dark, with a time log grouped by day and a daily report.",
            "A game layer on iPhone: XP, levels and daily quests, so focus feels like progress.",
            "Bring your own Notion: it ships with no data and no credentials.",
          ],
        },
        {
          slug: "screenhero",
          name: "ScreenHero",
          iconImage: "assets/apps/screenhero-icon.png",
          screenshot: "assets/apps/screenhero-screenshot.jpg", // optional, hidden if missing
          tag: "macOS menu bar app",
          platforms: ["macOS", "Swift", "on-device OCR"],
          tagline: "Capture a screenshot and it comes out presentation-ready.",
          points: [
            "Trims, pads and centres the shot on a background picked from its own colours.",
            "Finds emails and API keys with on-device OCR and covers them in the exported pixels.",
            "15 single-key annotation tools, window frames and vector device mockups from iPhone to Studio Display.",
            "A searchable library: reopen last week's shot and every arrow is still movable.",
          ],
        },
      ],
    },

    birthday: {
      icon: "cake",
      label: "birthday",
      title: "date",
      command: "date",
      unlockAfter: 7,
      lockedLine: "unlock by exploring {n} more folders",
      lockedCommand: "locked: explore more of the year first",
      script: [
        { cmd: "date" },
        { out: "Wed Sep 30 2026" },
        { cmd: 'git tag -a v2026 -m "another year, better systems"' },
        { cmd: "git push origin next-year" },
        { out: "Enumerating goals... done." },
        { out: "Happy birthday to me!", accent: true },
      ],
      question: "Where does your business still depend on you remembering everything?",
      cta: { label: "Book a discovery call → thedigicrafters.com", href: "https://thedigicrafters.com" },
    },
  },

  /*
    Clients: industries only, never names.
    type: "build" or "consult" (drives the filter chips).
    picture: optional anonymized screenshot at assets/clients/<slug>.jpg (full builds only).
  */
  clients: [
    { slug: "ecommerce", industry: "Ecommerce brand", icon: "shopping-bag", tag: "Full build", type: "build",
      built: "Moved six departments off two separate tools into one operating system for supply chain and finance.",
      change: "Leadership reads one dashboard instead of chasing updates." },
    { slug: "venture-biotech", industry: "Venture capital and biotech", icon: "flask-conical", tag: "Full build", type: "build",
      built: "A deadline-driven operating system for deal flow, portfolio and investor work.",
      change: "One source of truth, live when the team needed it." },
    { slug: "publishing", industry: "Publishing (independent author)", icon: "book", tag: "Full build", type: "build",
      built: "A book launch system that turns a manuscript and research into a content engine.",
      change: "One book now feeds months of marketing." },
    { slug: "installation", industry: "Multi-state installation company", icon: "wrench", tag: "Full build", type: "build",
      built: "A multi-department wiki with SOPs, role-based portals, 25+ branded covers and staff training.",
      change: "New hires find answers on their own." },
    { slug: "multi-service-agency", industry: "Multi-service marketing agency", icon: "megaphone", tag: "Full build", type: "build",
      built: "A modular knowledge base: shared processes written once, each service adds only its own steps.",
      change: "The owner stopped being the person every question routes through." },
    { slug: "talent-agency", industry: "Talent agency", icon: "star", tag: "Full build", type: "build",
      built: "Automation from client brief to invoicing, connected to their accounting tool.",
      change: "Copy-paste admin disappeared." },
    { slug: "online-course", industry: "Online course business", icon: "circle-play", tag: "Full build", type: "build",
      built: "A 48-video, 8-module course portal with guest access.",
      change: "Students self-serve their learning." },
    { slug: "college-admissions", industry: "College admissions consulting", icon: "graduation-cap", tag: "Full build", type: "build",
      built: "A 9-hub student lifecycle system with mentor workload tracking.",
      change: "Staff see who is at capacity before anyone burns out." },
    { slug: "athlete-foundation", industry: "Athlete-led nonprofit foundation", icon: "heart-handshake", tag: "Full build", type: "build",
      built: "One workspace linking partnerships, deals, events and tasks.",
      change: "Partnership work and delivery live in one connected place." },
    { slug: "it-services", industry: "IT services company", icon: "server", tag: "Full build, 5 phases", type: "build",
      built: "A projects hub, improved phase by phase as the team grew into it.",
      change: "They came back for five rounds." },
    { slug: "coaching", industry: "Coaching program", icon: "target", tag: "Full build", type: "build",
      built: "A client-facing dashboard for coaching participants.",
      change: "Clients see their own progress without asking." },
    { slug: "agency-owner", industry: "Marketing agency owner", icon: "pen-tool", tag: "Build and coaching", type: "build",
      built: "A connected core of clients, projects and tasks, plus an 85-field onboarding flow as a form.",
      change: "Every new client follows the same path." },
    { slug: "property-management", industry: "Property management", icon: "building-2", tag: "Architecture", type: "build",
      built: "A property OS with 10 databases and five role-based dashboards.",
      change: "Each role opens only what it needs." },
    { slug: "insurance-agency", industry: "Insurance agency", icon: "shield", tag: "In progress", type: "build",
      built: "An operations architecture for documents, a large backlog, vendors and SOPs, with Claude doing the migration.",
      change: "Moving the owner from bottleneck to decision-maker." },
    { slug: "public-healthcare", industry: "Public healthcare (UK)", icon: "stethoscope", tag: "Consultation", type: "consult",
      built: "Notion AI to group many problem-statement submissions into root-cause themes, fed by native forms.",
      change: "Themes surface from the submissions without manual sorting." },
    { slug: "m-and-a-advisory", industry: "M&A advisory (buy side)", icon: "handshake", tag: "Consultation", type: "consult",
      built: "A relational database of companies, contacts and buyers for matching buyers to sellers.",
      change: "Deal intelligence becomes queryable instead of living in inboxes." },
    { slug: "law-firm", industry: "Law firm", icon: "scale", tag: "Consultation", type: "consult",
      built: "An AI-powered knowledge base with template filling for case work.",
      change: "Faster answers from the firm's own knowledge." },
    { slug: "real-estate", industry: "Real estate brokerage", icon: "house", tag: "Consultation", type: "consult",
      built: "A CRM with automated follow-ups and AI business-card extraction.",
      change: "No lead gets lost after an event." },
    { slug: "wedding-planning", industry: "Wedding planning", icon: "gem", tag: "Consultation", type: "consult",
      built: "Lead capture from a budget calculator and CRM into Notion, with conversion analytics.",
      change: "The planner sees which inquiries turn into bookings." },
    { slug: "mobile-dental", industry: "Mobile dental clinic", icon: "smile", tag: "Consultation", type: "consult",
      built: "A weekly scheduling system for clinical assistants with calendar views.",
      change: "The schedule lives in one place the whole team can see." },
    { slug: "ai-research-lab", industry: "AI research lab", icon: "brain", tag: "Consultation", type: "consult",
      built: "A Research OS for a three-person lab, connected to their shared files.",
      change: "Papers, experiments and notes in one searchable home." },
    { slug: "restaurant-events", industry: "Restaurant group (private events)", icon: "utensils", tag: "Consultation, in French", type: "consult",
      built: "A reservations and private-events pipeline: contacted, followed up, quoted, cancelled.",
      change: "Every event inquiry has a clear next step." },
    { slug: "film-production", industry: "Film production", icon: "clapperboard", tag: "Consultation", type: "consult",
      built: "Linked project and task trackers for two films running at once, with guest collaborators.",
      change: "Both productions run side by side without mixing up." },
    { slug: "insurance-brokerage", industry: "Insurance brokerage (Latin America)", icon: "umbrella", tag: "Consultation", type: "consult",
      built: "CRM upgrades with database automations and custom AI agents.",
      change: "Routine follow-up runs without manual triggers." },
    { slug: "group-of-three", industry: "Group of three companies", icon: "network", tag: "Consultation", type: "consult",
      built: "One shared workspace for three legally separate businesses.",
      change: "One place to work, clean separation where it matters." },
    { slug: "construction", industry: "Construction contractor", icon: "hard-hat", tag: "Consultation", type: "consult",
      built: "A plan to make Notion the command center that replaces disconnected tools.",
      change: "Fewer subscriptions, one place to look." },
    { slug: "youth-nonprofit", industry: "Youth nonprofit", icon: "sprout", tag: "Consultation", type: "consult",
      built: "Native Notion forms replacing third-party tools, with controlled sharing.",
      change: "Intake lands straight in the right database." },
    { slug: "universities", industry: "Universities in four countries", icon: "school", tag: "Consultations", type: "consult",
      built: "Workspaces for student and research teams on Notion's education plan.",
      change: "Students got a free, organized home for their work." },
  ],

  stats: [
    ["major clients", "28"],
    ["industries", "25+"],
    ["template downloads", "21,000+"],
    ["organizations using templates", "1,600+"],
    ["new courses", "5+"],
    ["hours of video", "100+"],
    ["community members", "150"],
    ["custom Claude skills", "20+"],
    ["apps vibecoded and shipped", "2"],
  ],

  achievements: [
    { id: "first-command", icon: "terminal", title: "First Command", desc: "Type any command" },
    { id: "explorer", icon: "compass", title: "Explorer", desc: "Open 4 windows" },
    { id: "deep-diver", icon: "folder-open", title: "Deep Diver", desc: "Open 10 client cards" },
    { id: "power-user", icon: "keyboard", title: "Power User", desc: "Open a window by typing instead of clicking" },
    { id: "night-owl", icon: "moon-star", title: "Night Owl", desc: "Visit between 00:00 and 05:00 local time" },
    { id: "easter-egg", icon: "egg", title: "Easter Egg", desc: "Find the hidden file" },
    { id: "year-complete", icon: "award", title: "Year Complete", desc: "Unlock the birthday finale" },
  ],

  replies: {
    hire: ["opening a discovery call...", "→ thedigicrafters.com"],
    sudo: "permission granted. start here: thedigicrafters.com",
    coffee: "brewing... notion does not have a coffee database yet. or does it?",
    easterEgg: "2,400 apple notes moved into one notion database in under 20 minutes. that was a fun tuesday.",
    exit: "logout. see you in 2027.",
    notFound: 'command not found: {input}. try "help"',
    hint: 'psst. try "{cmd}"',
  },

  share: "I explored imene.os and found {n}/7 achievements. thedigicrafters.com",
};
