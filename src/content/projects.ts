/**
 * Project library.
 * status: "published" = documented in my resume; "draft" = planned / details pending (rendered with a clear DRAFT label).
 * Fill in empty fields (repo, demo, screenshots, results) as details become available — empty fields are hidden or shown as "pending".
 */

export const coverMotifs = [
  "topology", "cabling", "radio", "inventory", "web", "code", "research", "shield", "lab", "lock", "firmware", "server",
  "cloud", "backup", "camera", "iot", "globe", "terminal", "automation", "mobile", "dashboard", "wifi",
] as const;
export type CoverMotif = (typeof coverMotifs)[number];

export type DiagramNode = { id: string; label: string; x: number; y: number; kind: "cloud" | "router" | "switch" | "firewall" | "server" | "ap" | "endpoint" | "panel" | "db" | "device" };
export type Diagram = { caption: string; nodes: DiagramNode[]; links: [string, string][] };

export type Project = {
  slug: string;
  title: string;
  category: Category;
  status: "published" | "draft";
  context: string; // where / when
  /** Generated cover art: gradient + pattern, or an uploaded image (image wins). */
  cover: { from: string; to: string; motif: CoverMotif; image?: string };
  overview: string;
  problem: string;
  role: string;
  contributions: string[];
  tech: string[];
  diagram?: Diagram;
  snippet?: { language: string; title: string; code: string; note: string };
  results: string[];
  lessons: string[];
  screenshots: { src: string; caption: string }[];
  /** PDFs / files shown as download buttons on the project page. */
  documents?: { label: string; src: string }[];
  /** Any files: photos, videos, PDFs, Word/Excel/PowerPoint, archives… */
  attachments?: { title: string; url: string; note?: string }[];
  /** Pinned to the home page (first three featured projects are shown). */
  featured?: boolean;
  repo: string;
  demo: string;
  relatedPosts: string[]; // blog slugs
};

export const categories = [
  "Networking and Cisco Labs",
  "Network Infrastructure",
  "IT Systems and Automation",
  "Cybersecurity Learning Labs",
  "IoT and Device Provisioning",
  "Web Development",
  "Inventory Management Systems",
  "Research and Academic Projects",
  "AI and Intelligent Agents",
] as const;
export type Category = (typeof categories)[number];

export const projects: Project[] = [
  {
    slug: "poc-sim-operations-center",
    title: "POC Ops Center — Radio, SIM & Licence Command Dashboard",
    category: "IoT and Device Provisioning",
    status: "published",
    context: "Expert Mobile Communications Ltd. · internal operations platform · 2026 · 217 companies · 2,667 devices · 2,951 SIMs",
    cover: { from: "#00e5ff", to: "#2553d6", motif: "radio", image: "/images/projects/poc-ops-center-overview.jpg" },
    overview:
      "POC Ops Center is the command dashboard I built for Expert Mobile's push-to-talk-over-cellular (POC) business. It pulls every radio from the Inrico management platform and every data SIM from four carrier sources (Telus Jasper, Simplex, Hologram and Mobilewave) into one live view of 217 customer companies, 2,667 devices and 2,951 carrier SIMs. It matches each radio to its SIM, flags every mismatch with a reason and a severity, tracks licences before they expire, puts a dollar figure on SIMs that are billing while the radio is switched off, and lets the team assign, follow up and export the fixes — all in a customizable HUD interface with light and Jarvis-style dark themes.",
    problem:
      "Radio licences and SIM cards live in separate vendor portals. Checking a customer meant copying 20-digit ICCIDs between browser tabs. Nobody could answer simple questions with confidence: Which radios have no working SIM? Which SIMs are we paying for that no radio uses? Which licences expire this month? Whose account is each SIM really under? The first full import showed how big the gap was — only 16.5% of devices (439) matched cleanly; 2,228 needed attention, and 206 SIMs were active on radios that were switched off, costing roughly $2,050 every month.",
    role: "Designer and developer (end-to-end): data model, matching engine, interface, roles and reporting",
    contributions: [
      "Command Overview — a drag-to-arrange, resizable widget dashboard: match-rate gauge (arc-reactor style), key numbers (devices, online now, active / deactivated devices, active SIMs, idle-SIM cost, licences expiring ≤ 30 days, match rate), fleet health and freshness chips showing when each data source was last imported.",
      "Matching engine — joins radios and SIMs on ICCID after normalising formats (the trailing 'f' Inrico adds, spaces, stray commas), then classifies every device: matched on Jasper, matched on Simplex/Hologram, no SIM in Inrico, invalid SIM value, SIM not on any carrier, wrong Jasper customer, name differs, same SIM on two or more devices.",
      "Active / Off view — device state × SIM state quadrant (device on + SIM off, device off + SIM on, both on, both off) so service problems and wasted spend are visible at a glance.",
      "Savings — idle-SIM cost per company and per carrier, plus a what-if calculator with levers (deactivate idle SIMs, move plans, recover unused licences) and a ranked list of the highest-value fixes.",
      "Licences — Licence × SIM matrix, expiring-soon calendar heat-map and renewal list (17 licences due in the next 30 days at the time of the screenshot).",
      "Alerts — 400+ prioritised alerts (high / medium / low) with the reason, the company and a one-click jump into the matching details.",
      "Companies, Devices and SIMs — searchable tables with health bars, sortable columns, column picker, per-company drawer with grouped issues and an action log (status, owner, notes).",
      "Compare — build your own groups (by agent, carrier or company) and compare them side by side with animated ‘versus’ cards and bar races.",
      "Fleet map — treemap / heat-map of where devices and problems sit across companies and channel zones.",
      "Data hub — drag-and-drop imports for each platform export (XLSX / CSV), validation of missing columns, and downloads in Excel, CSV or JSON.",
      "Users & roles — Admin (everything), Manager (update actions), Viewer (view and export), Agent (own companies only), with presence so the team sees who is working on what.",
      "Per-customer audit automation — produces the two formatted workbooks (POC and SIM) for a company and files them in the shared company drive, only when both platforms agree.",
    ],
    tech: ["JavaScript (ES2022)", "HTML5 / CSS3 (custom properties, grid, animations)", "SVG data visualisation", "Real-time shared database", "Role-based access control", "Python", "openpyxl", "Excel (XLSX) / CSV / JSON", "Data matching & ETL", "Browser automation", "REST APIs"],
    diagram: {
      caption: "How radio, SIM and licence data become one operational picture",
      nodes: [
        { id: "inrico", label: "Inrico POC platform", x: 12, y: 18, kind: "cloud" },
        { id: "jasper", label: "Telus Jasper", x: 12, y: 42, kind: "cloud" },
        { id: "other", label: "Simplex / Hologram", x: 12, y: 66, kind: "cloud" },
        { id: "mw", label: "Mobilewave", x: 12, y: 88, kind: "cloud" },
        { id: "hub", label: "Data hub (import & validate)", x: 40, y: 52, kind: "server" },
        { id: "match", label: "Matching engine", x: 63, y: 52, kind: "firewall" },
        { id: "dash", label: "Ops dashboard & alerts", x: 88, y: 28, kind: "panel" },
        { id: "xlsx", label: "Reports & exports", x: 88, y: 78, kind: "db" },
      ],
      links: [["inrico", "hub"], ["jasper", "hub"], ["other", "hub"], ["mw", "hub"], ["hub", "match"], ["match", "dash"], ["match", "xlsx"]],
    },
    results: [
      "One screen for 217 companies, 2,667 devices and 2,951 carrier SIMs across five data sources.",
      "Exposed the real starting point: 16.5% clean matches, 2,228 devices needing attention — now worked down through assigned, tracked actions.",
      "206 idle SIMs (≈ $2,050 per month) identified for deactivation or reuse.",
      "Licence renewals are seen 30 days ahead instead of after a radio stops working.",
      "A customer audit that took a long session of tab-switching now takes minutes, and nothing is filed while a mismatch exists.",
    ],
    lessons: [
      "Normalise identifiers before comparing — most ‘mismatches’ were formatting, not data.",
      "Put a dollar value on a problem and it gets fixed: the idle-SIM cost card changed priorities overnight.",
      "Every alert needs a reason and an owner, otherwise a dashboard is just decoration.",
    ],
    screenshots: [
      { src: "/images/projects/poc-ops-center-overview.jpg", caption: "Command Overview — match-rate gauge, key numbers and data-source freshness (aggregate figures only)." },
      { src: "/images/projects/poc-sim-operations-center.jpg", caption: "Illustration of the matching view (customer data removed)." },
    ],
    documents: [{ label: "Project README (PDF)", src: "/docs/projects/poc-sim-operations-center.pdf" }],
    featured: true,
    repo: "https://github.com/Masum-jubayel/poc-sim-operations-center",
    demo: "",
    relatedPosts: ["inside-the-poc-ops-center", "matching-poc-radios-and-sims-across-vendor-portals", "poc-radio-vs-dmr-field-primer"],
  },
  {
    slug: "install-board-appointment-booking",
    title: "Install Board — Appointment Booking System",
    category: "Web Development",
    status: "published",
    context: "Expert Mobile Communications Ltd. · vehicle radio installation scheduling · 2026",
    cover: { from: "#fbbf24", to: "#2553d6", motif: "dashboard", image: "/images/projects/install-board.jpg" },
    overview:
      "A real-time booking board for vehicle radio installations. Staff book customers into fixed installer time slots, see the whole team's day, week or month at a glance, track rental equipment, block time off, and print or export reports — and two people can never book the same slot at the same moment.",
    problem:
      "Installations were booked on paper and in group chats. Double bookings, forgotten rentals and no history of who changed what were costing installers time and customers trust.",
    role: "Designer and developer (end-to-end)",
    contributions: [
      "Designed Day, Week and Month views across installers, with four daily slots (08:00, 10:00, 13:00, 15:00).",
      "Implemented slot locking (acquire with a time-to-live) so two people booking at once can't take the same slot.",
      "Added ticket numbers, a searchable bookings list, block-time entries and a full change history.",
      "Built a rentals and equipment section and a reports page (daily run sheets, installer workload).",
      "Stored data in a real-time database so every screen updates live; all times shown in the shop's time zone (America/Edmonton).",
      "Setup page so managers can change installers, slots and business rules without code.",
    ],
    tech: ["JavaScript", "TypeScript", "HTML5 / CSS3", "Real-time database", "REST APIs", "Concurrency control (slot locks)", "Time-zone handling", "Responsive UI"],
    results: [
      "No double bookings since the slot locks went live.",
      "Front desk and installers work from the same live board on desktop or phone.",
      "Every booking has a ticket number and an audit trail.",
    ],
    lessons: [
      "Concurrency is a user-experience problem first: tell the second person why the slot is busy, instantly.",
      "Store times in one zone and display them in the business zone — never trust the browser's clock.",
    ],
    screenshots: [{ src: "/images/projects/install-board.jpg", caption: "Illustration of the week view (names and customers removed)." }],
    documents: [{ label: "Project README (PDF)", src: "/docs/projects/install-board-appointment-booking.pdf" }],
    featured: false,
    repo: "https://github.com/Masum-jubayel/install-board",
    demo: "",
    relatedPosts: ["building-a-double-booking-proof-scheduler"],
  },
  {
    slug: "jarvis-ai-agent",
    title: "Jarvis — Personal AI Agent",
    category: "AI and Intelligent Agents",
    status: "published",
    context: "Personal project · ongoing · 2026",
    cover: { from: "#00e5ff", to: "#ffb020", motif: "automation", image: "/images/projects/jarvis-ai-agent.jpg" },
    overview:
      "Jarvis is my personal AI assistant: a large-language-model agent that understands plain-language requests, remembers context, searches my own notes and documents, and uses tools — the browser, files, spreadsheets and scripts — to get real work done, such as preparing reports, auditing device records or drafting documents.",
    problem:
      "A lot of my day is repeatable multi-step work across many web portals and files. Chat assistants answer questions, but they don't act. I wanted an assistant that can plan, use tools safely and hand back a finished result.",
    role: "Designer and developer",
    contributions: [
      "Built an agent loop around large language models (Claude and OpenAI) with tool calling: plan, act, check, repeat.",
      "Added retrieval-augmented generation (RAG): documents are chunked, embedded and stored in ChromaDB for semantic search.",
      "Gave the agent tools for browser automation, file and spreadsheet handling (Python, Pandas, openpyxl) and shell scripts.",
      "Wrote reusable 'skills' — step-by-step procedures for recurring jobs such as the POC/SIM audit.",
      "Added guard-rails: confirmation before anything irreversible, no credentials in prompts, and logs of every action.",
      "Designed a voice-ready HUD interface with a cyan-and-gold theme (the same Jarvis theme used on this site).",
    ],
    tech: ["Python", "Large language models (Claude, OpenAI)", "Prompt engineering", "Tool calling / function calling", "RAG", "ChromaDB", "Embeddings & semantic search", "NLP", "Pandas / NumPy", "Browser automation", "Model Context Protocol (MCP)"],
    diagram: {
      caption: "Jarvis agent loop",
      nodes: [
        { id: "user", label: "Request", x: 10, y: 50, kind: "endpoint" },
        { id: "llm", label: "LLM planner", x: 38, y: 50, kind: "server" },
        { id: "mem", label: "ChromaDB memory", x: 38, y: 85, kind: "db" },
        { id: "tools", label: "Tools: browser, files, scripts", x: 70, y: 25, kind: "panel" },
        { id: "check", label: "Check & confirm", x: 70, y: 75, kind: "firewall" },
        { id: "out", label: "Result", x: 92, y: 50, kind: "endpoint" },
      ],
      links: [["user", "llm"], ["llm", "mem"], ["llm", "tools"], ["tools", "check"], ["check", "llm"], ["check", "out"]],
    },
    results: [
      "Recurring multi-portal jobs run from one sentence, with a human confirmation before anything is saved or sent.",
      "Answers draw on my own documents instead of guesses.",
    ],
    lessons: [
      "Good tools and clear procedures matter more than a bigger model.",
      "Agents need guard-rails by design: least privilege, confirmations and logs.",
    ],
    screenshots: [{ src: "/images/projects/jarvis-ai-agent.jpg", caption: "Illustration of the Jarvis interface." }],
    documents: [{ label: "Project README (PDF)", src: "/docs/projects/jarvis-ai-agent.pdf" }],
    featured: true,
    repo: "https://github.com/Masum-jubayel/jarvis-ai-agent",
    demo: "",
    relatedPosts: ["building-jarvis-a-personal-ai-agent"],
  },
  {
    slug: "masum-jubayel-portfolio",
    title: "This Portfolio — Next.js Site with Admin CMS",
    category: "Web Development",
    status: "published",
    context: "Personal project · 2026 · live on Vercel",
    cover: { from: "#3ee6ff", to: "#a78bfa", motif: "web", image: "/images/projects/portfolio-dark.jpg" },
    overview:
      "The site you are on: a fast, animated portfolio with a built-in admin console. Every section — profile, resume, projects, blog, gallery, memories and theme — can be edited from the browser without touching code. Visitors can switch between Dark, Light and Jarvis themes with one click.",
    problem:
      "I wanted one place for my work that I could keep current myself, that loads fast, costs nothing to host and stays awake without maintenance.",
    role: "Designer and developer (end-to-end)",
    contributions: [
      "Built with Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS, with motion-based animation.",
      "Admin CMS backed by Supabase (Postgres, row-level security, magic-link sign-in) — only accounts flagged as admin can edit.",
      "Non-destructive photo and video editor (crop focus, zoom, rotate, colour, presets, video trim) stored with each file link.",
      "Blog, project library with filters and pagination, gallery with a point-cloud portrait hero and social-style memories.",
      "Three colour themes driven by CSS variables, remembered per visitor.",
      "Free hosting on Vercel with a daily keep-alive job, contact email through Resend, and secrets kept out of Git.",
    ],
    tech: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Motion", "Supabase (PostgreSQL, Auth, RLS)", "Vercel (hosting, cron)", "Resend", "Git / GitHub"],
    results: [
      "Live at masum-jubayel.vercel.app on free tiers.",
      "Content updates take seconds from the admin console.",
    ],
    lessons: ["Design the data model first; the admin screens then almost write themselves."],
    screenshots: [
      { src: "/images/projects/portfolio-dark.jpg", caption: "Home page — Dark theme." },
      { src: "/images/projects/portfolio-jarvis.jpg", caption: "Home page — Jarvis theme." },
    ],
    documents: [{ label: "Project README (PDF)", src: "/docs/projects/masum-jubayel-portfolio.pdf" }],
    featured: false,
    repo: "https://github.com/Masum-jubayel/masum_jubayel",
    demo: "https://masum-jubayel.vercel.app",
    relatedPosts: ["building-this-portfolio-nextjs-supabase"],
  },
  {
    slug: "irc380-custom-firmware",
    title: "IRC380 Custom Firmware for the Canadian Market",
    category: "IoT and Device Provisioning",
    status: "published",
    context: "Expert Mobile Communications Ltd. · firmware development RFQ · project lead",
    cover: { from: "#3ee6ff", to: "#2553d6", motif: "firmware" },
    overview:
      "A custom IRC380 firmware build for the Canadian market. I gathered dealer requests, turned them into six priced requirements across the device firmware, the iConvNet PoC app and the iConvNet DMR app, and issued the request for quote to the manufacturer — with a pilot and release plan.",
    problem:
      "Crews had to leave one app and enter another to move between DMR channels and PoC groups — unusable while driving. Users broke their own app configuration and called us, radios locked their screens in vehicles, English-only radios were excluded from Quebec and bilingual public-sector tenders, and changing groups on small touch screens while driving was unsafe.",
    role: "Project lead — dealer input, requirements, vendor RFQ (masum@expertmobile.ca is the contact for quotes and technical questions)",
    contributions: [
      "A · Unified DMR + PoC channel selector — one knob turn steps through both (e.g. PoC ch1 → DMR Simplex 1 → DMR Simplex 2 → PoC ch2), switching mode automatically. Must.",
      "B · Password on DMR and PoC app settings, set and reset remotely from iConvNet — no factory reset, no depot return. Must.",
      "C · Automatic screen-lock check box that persists across reboot, so in-vehicle users don’t have to unlock to talk. Should.",
      "D · French / English in the DMR app — voice announcements at minimum, interface preferred; Canadian French strings supplied by us. Must.",
      "E · Voice announcements on screened devices (IRC380, S380, TM-7 Plus) for channel/group change, mode change, power on, network loss and restore — configurable per device or fleet from iConvNet. Should.",
      "F · TM-7 Plus up/down buttons mapped to group selection in the mobile app, with voice confirmation. Should.",
      "Gathered the remaining dealer requests through our Connecteam dealer portal.",
    ],
    tech: ["IRC380", "S380", "TM-7 Plus", "iConvNet PoC", "iConvNet DMR", "Android firmware", "PoC / DMR radio", "Connecteam", "Requirements engineering"],
    results: [
      "Request for quote issued for six items — three must-have and three should-have — each priced separately with feasibility flags.",
      "Deliverables defined: flashable IRC380 firmware image and updated app builds, provisioning-tool changes, release notes per item and a prompt list for translation.",
      "Vendor asked to confirm totals (all items and must-haves only), warranty / defect-fix period, exclusivity to Expert Mobile and carry-forward into future stock firmware.",
      "Process: dealer input → list finalised → quote returned → build, pilot on 2–3 test units, short field pilot, release.",
    ],
    lessons: [],
    screenshots: [{ src: "/images/projects/irc380-rfq.jpg", caption: "IRC380 custom firmware — request for quote summary v1.0" }],
    documents: [{ label: "IRC380 custom firmware RFQ (PDF)", src: "/docs/irc380-custom-firmware-rfq.pdf" }],
    featured: true,
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  {
    slug: "bc680-bodycam-data-backup",
    title: "BC680 Body-Cam Data Backup System",
    category: "IT Systems and Automation",
    status: "published",
    context: "Shared-drive & backup system set up and supported by Expert Mobile · built by Masum Jubayel",
    cover: { from: "#34d399", to: "#2553d6", motif: "backup" },
    overview:
      "A shared-drive and backup system for BC680 body-camera recordings: every recording is hashed, locked in as the master and copied to two backups across a main office and a remote office — three verified copies, checked every two minutes. Published with a full project library: rebuild guide, animated staff training, customer presentation, PDF guides and a customer video.",
    problem:
      "Body-camera recordings are evidence: they must never be lost, silently changed or deleted, and staff in two offices need simple, reliable access to them.",
    role: "Designer, builder and documentation author",
    contributions: [
      "Recording lands on the primary PC; its SHA-256 hash is recorded and the file is locked in as the master.",
      "Copied to both backups and the hash is checked again — three verified copies; backups refuse deletes.",
      "Verification runs every 2 minutes across the main office and the remote office over an encrypted tunnel, with staff using a mapped drive (Z:).",
      "Automation written as PowerShell scripts.",
      "Portfolio & rebuild guide with an interactive permissions bench, 12 solved problems and a 55-step rebuild guide.",
      "Animated step-by-step guide — six chapters with moving diagrams, copyable commands and troubleshooting, for staff training.",
      "Customer presentation — 13 full-screen slides with speaker notes and keyboard controls.",
      "Five PDF guides (setup, backup computers, step-by-step testing, backup reference, 25-page project proposal) and a 58-second customer explainer video.",
      "Least-privilege accounts (OfficeStaff, RemoteStaff, BackupWriter) with NTFS 'Deny Delete' on backups, SMB shares between the two offices over a Tailscale tunnel, and an optional OneDrive off-site copy.",
    ],
    tech: ["Windows", "PowerShell", "SHA-256", "SMB / NTFS permissions", "Tailscale (WireGuard) tunnel", "OneDrive", "Shared drive / mapped drive", "Encrypted site-to-site tunnel", "HTML / CSS / JavaScript", "SVG animation", "GitHub Pages"],
    results: [
      "Triple-copy, hash-verified storage for every recording, checked every 2 minutes.",
      "Backups refuse deletes, protecting recordings from accidental or deliberate removal.",
      "Complete hand-over package: rebuild guide, staff training, customer slides, PDF guides and video.",
    ],
    lessons: [],
    screenshots: [
      { src: "/images/projects/bc680-overview.jpg", caption: "Project site — overview." },
      { src: "/images/projects/bc680-guide.jpg", caption: "Animated step-by-step guide." },
    ],
    documents: [{ label: "Project README (PDF)", src: "/docs/projects/bc680-bodycam-data-backup.pdf" }],
    featured: true,
    repo: "https://github.com/Masum-jubayel/Bc680-Bodycam-Data-Backup",
    demo: "https://masum-jubayel.github.io/Bc680-Bodycam-Data-Backup/",
    relatedPosts: ["hash-verified-backups-with-powershell", "two-office-bodycam-backup-with-onedrive"],
  },
  {
    slug: "expert-mobile-website",
    title: "Expert Mobile Communications Website & Admin Panel",
    category: "Web Development",
    status: "published",
    context: "Expert Mobile Communications Ltd. — Canadian Wireless Supply, Inrico Canada, Wirox",
    cover: { from: "#4f8cff", to: "#a78bfa", motif: "code" },
    overview:
      "A single-page portfolio website for Expert Mobile Communications Ltd. and its brands (Canadian Wireless Supply, Inrico Canada, Wirox). The source is an HTML template plus images; a Python build script bundles everything into one self-contained index.html that can be uploaded to any host, with a built-in admin panel for editing content and managing the team.",
    problem:
      "The company needed a fast, easy-to-host site that non-developers can update, without a heavy CMS or server to maintain.",
    role: "Designer & developer",
    contributions: [
      "Designed and built the single-page site in HTML, CSS and JavaScript (src/template.html).",
      "Wrote a dependency-free Python 3 build script (src/build.py) that outputs one finished file: dist/index.html.",
      "Built an admin panel (cms.js / cms.css) for editing content, team management and invite links.",
      "Prepared hosting for Netlify Drop, GitHub Pages and Firebase Hosting (netlify.toml, firebase.json).",
      "Documented the editing workflow: change the template or swap images, run the build, upload dist/index.html.",
      "Redesigned the site around “Everything wireless. Under one roof.” — a live push-to-talk console demo, brand showcase (Hytera, Icom, BelFone, President), solutions, rentals and a dealer network of 15+ dealers in 3 countries.",
    ],
    tech: ["HTML5", "CSS3", "JavaScript", "Python 3", "Netlify", "Firebase Hosting", "GitHub Pages", "Git"],
    results: [
      "One self-contained HTML file — upload anywhere, no server required.",
      "Company details kept current: Grande Prairie, Alberta address, store and sales lines, Mon–Fri 8 AM–5 PM MT.",
    ],
    lessons: [],
    screenshots: [
      { src: "/images/projects/expert-mobile-home.jpg", caption: "Home — “Everything wireless. Under one roof.”" },
      { src: "/images/projects/expert-mobile-section.jpg", caption: "Solutions and brands section." },
    ],
    documents: [{ label: "Project README (PDF)", src: "/docs/projects/expert-mobile-website.pdf" }],
    featured: true,
    repo: "https://github.com/Masum-jubayel/expertmobile",
    demo: "https://masum-jubayel.github.io/expertmobile/",
    relatedPosts: ["single-file-website-python-build", "responsive-layouts-css-grid-clamp"],
  },
  {
    slug: "ihg-hotel-iot-installation",
    title: "IHG Hotel IoT Installation & Cut-over",
    category: "IoT and Device Provisioning",
    status: "published",
    context: "Insight Enterprises project for IHG hotel properties · via Field Nation",
    cover: { from: "#34d399", to: "#14c8f0", motif: "iot" },
    overview:
      "On-site installs of an IoT mini-computer at IHG hotel properties, performing the cut-over steps called out by a remote engineer over an MS Teams bridge and completing the property validation form.",
    problem:
      "Hotel systems had to be cut over to a new IoT device on a fixed schedule with a remote engineering team, with no room for re-visits.",
    role: "On-site field technician",
    contributions: [
      "Prepared the deployment USB drive with the extracted IHG_Desktop files before arriving on site.",
      "Joined the MS Teams bridge at the scheduled start and installed the IoT device.",
      "Worked through Windows cut-over tasks as called out by the remote bridge engineer.",
      "Supported BOMGAR remote-access sessions so the Hotel Key technician could reach workstations running card machines.",
      "Completed the property validation form; brought a PC/network toolkit including a network toner and spare Cat 6.",
    ],
    tech: ["Windows", "IoT mini-PC", "MS Teams bridge", "BOMGAR remote access", "Network toner", "Cat 6"],
    results: [],
    lessons: [],
    screenshots: [],
    documents: [
      { label: "Primary Install Guide 3.0 (PDF)", src: "/docs/ihg/primary-install-guide-3.0.pdf" },
      { label: "IHG USB creation 1.2 (PDF)", src: "/docs/ihg/usb-creation-1.2.pdf" },
      { label: "BOMGAR access for hotel point of contact (PDF)", src: "/docs/ihg/bomgar-access.pdf" },
    ],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  {
    slug: "multi-site-structured-cabling-rollout",
    title: "Multi-Site Structured Cabling & Network Rollout",
    category: "Network Infrastructure",
    status: "published",
    context: "Great River Financial Services Inc. — IT Consulting Services · 2025–2026",
    cover: { from: "#0ea2c9", to: "#2553d6", motif: "cabling" },
    overview:
      "Field engineering for network installations across 20+ Wendy’s restaurant locations in Greater Vancouver and across British Columbia, delivered in partnership with NCR Voyix.",
    problem:
      "Each new or upgraded site needed a standards-compliant physical network — cabling, racks and patch panels — plus configured routers, switches and wireless access points so POS systems and peripherals could come online reliably.",
    role: "IT Technician / Field Engineer (Project)",
    contributions: [
      "Installed, terminated and tested Cat5e and Cat6 cabling to structured cabling standards.",
      "Mounted and organized network racks, patch panels and cable management systems.",
      "Configured and deployed switches, routers and wireless access points, coordinating with NCR Voyix local and remote teams.",
      "Set up and troubleshot POS systems, computers, printers and other network peripherals.",
      "Tested, certified, labeled and documented every run to keep network records accurate.",
    ],
    tech: ["Cat5e / Cat6", "Patch panels", "Network racks", "Routers & switches", "Wireless APs", "POS systems", "Cable certifiers", "Tone generators"],
    diagram: {
      caption: "Simplified representative site topology (illustrative — not a client network map).",
      nodes: [
        { id: "isp", label: "ISP / WAN", x: 60, y: 120, kind: "cloud" },
        { id: "rtr", label: "Router", x: 190, y: 120, kind: "router" },
        { id: "sw", label: "Switch", x: 320, y: 120, kind: "switch" },
        { id: "pp", label: "Patch Panel", x: 450, y: 120, kind: "panel" },
        { id: "pos", label: "POS", x: 580, y: 40, kind: "endpoint" },
        { id: "ap", label: "Wireless AP", x: 580, y: 120, kind: "ap" },
        { id: "prn", label: "Printers / Peripherals", x: 580, y: 200, kind: "endpoint" },
      ],
      links: [["isp", "rtr"], ["rtr", "sw"], ["sw", "pp"], ["pp", "pos"], ["pp", "ap"], ["pp", "prn"]],
    },
    results: [
      "Network installations completed across 20+ locations in Greater Vancouver and across BC.",
      "Every cable run tested, certified, labeled and documented for accurate site records.",
    ],
    lessons: [
      "Labeling and documentation done during the install saves hours of tracing later.",
      "Following remote-team configuration instructions precisely is what makes multi-site rollouts consistent.",
    ],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: ["structured-cabling-field-checklist"],
  },
  {
    slug: "inventory-management-system",
    title: "Company Inventory Management System",
    category: "Inventory Management Systems",
    status: "published",
    context: "Expert Mobile Communications Ltd. · 2026",
    cover: { from: "#8b5cf6", to: "#14c8f0", motif: "inventory" },
    overview:
      "An internal inventory management and stock-counting system that compares physical inventory against the main product database, with receiving and shelf-placement workflows and transaction tracking for every stock movement.",
    problem: "Stock accuracy and traceability needed to improve across receiving, storage and sales of radio and communications equipment.",
    role: "Developer & administrator",
    contributions: [
      "Developed stock counting that compares physical inventory against the main product database and identifies discrepancies.",
      "Designed receiving and stock-placement workflows so products are recorded accurately and assigned to the right storage or shelf location.",
      "Implemented transaction tracking for products entering and leaving inventory, improving accountability and traceability.",
      "Built features for product records, reconciliation, receiving, issuing and ongoing inventory tracking.",
    ],
    tech: ["Details pending — add stack here"],
    diagram: {
      caption: "Workflow overview (as documented on resume).",
      nodes: [
        { id: "rcv", label: "Receiving", x: 70, y: 120, kind: "device" },
        { id: "shelf", label: "Shelf Placement", x: 220, y: 120, kind: "panel" },
        { id: "db", label: "Inventory DB", x: 370, y: 120, kind: "db" },
        { id: "count", label: "Stock Count", x: 370, y: 30, kind: "endpoint" },
        { id: "recon", label: "Reconciliation", x: 520, y: 70, kind: "server" },
        { id: "tx", label: "Transaction Log", x: 520, y: 190, kind: "server" },
      ],
      links: [["rcv", "shelf"], ["shelf", "db"], ["count", "db"], ["db", "recon"], ["db", "tx"]],
    },
    results: ["Improved stock accuracy and traceability (add measured figures when available)."],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  {
    slug: "poc-radio-fleet-provisioning",
    title: "PoC Radio Fleet Provisioning & ADB Automation",
    category: "IoT and Device Provisioning",
    status: "published",
    context: "Expert Mobile Communications Ltd. · 2026",
    cover: { from: "#14c8f0", to: "#8b5cf6", motif: "radio" },
    overview:
      "Deployment, programming and support of Inrico and Hytera Push-to-Talk over Cellular radios for dealers, customers and partners across North America.",
    problem:
      "Android-based PoC radios need consistent provisioning, licensing, firmware and per-customer configuration before they can join dispatch groups.",
    role: "Lead IT Support & Network Administrator",
    contributions: [
      "Provisioned, configured, licensed and set up dispatch through the Inrico Canada Management Platform and Hytera HyTalk.",
      "Performed firmware updates and device modifications on Android-based PoC radios.",
      "Developed ADB scripts and configuration files for customization, troubleshooting and maintenance.",
      "Coordinated customer-specific configurations with Inrico Solutions, Hytera representatives and partners.",
    ],
    tech: ["Android", "ADB", "Inrico Canada Management Platform", "Hytera HyTalk", "PoC / PTT over Cellular", "Firmware tooling"],
    diagram: {
      caption: "Provisioning flow (simplified).",
      nodes: [
        { id: "ws", label: "Workstation (ADB)", x: 70, y: 120, kind: "server" },
        { id: "radio", label: "PoC Radio", x: 230, y: 120, kind: "device" },
        { id: "cell", label: "Cellular / LTE", x: 380, y: 120, kind: "cloud" },
        { id: "plat", label: "Mgmt Platform", x: 530, y: 50, kind: "server" },
        { id: "disp", label: "Dispatch", x: 530, y: 190, kind: "endpoint" },
      ],
      links: [["ws", "radio"], ["radio", "cell"], ["cell", "plat"], ["cell", "disp"]],
    },
    snippet: {
      language: "bash",
      title: "Illustrative ADB health-check pattern",
      code: `#!/usr/bin/env bash
# Illustrative example only — not a production script.
# Lists connected devices and prints model + Android version for each.
set -euo pipefail
for serial in $(adb devices | awk 'NR>1 && $2=="device" {print $1}'); do
  model=$(adb -s "$serial" shell getprop ro.product.model | tr -d '\\r')
  android=$(adb -s "$serial" shell getprop ro.build.version.release | tr -d '\\r')
  echo "$serial  model=$model  android=$android"
done`,
      note: "A generic pattern for illustration. Replace with sanitized excerpts of real scripts if you choose to publish them.",
    },
    results: ["Supported installations, provisioning, dispatch setup, equipment testing and service calls across North America."],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: ["adb-basics-for-device-provisioning"],
  },
  {
    slug: "office-it-infrastructure-and-server-room",
    title: "Office IT Infrastructure & Server Room Operations",
    category: "IT Systems and Automation",
    status: "published",
    context: "Expert Mobile Communications Ltd. · 2026",
    cover: { from: "#2553d6", to: "#0a1124", motif: "topology" },
    overview:
      "Ongoing administration of the company’s network racks, switches, routers, cabling, servers, LANs, internet connectivity, UNV video surveillance and office IT equipment.",
    problem: "A growing company needs reliable connectivity, surveillance and end-user systems with clear documentation and a vendor escalation path.",
    role: "Lead IT Support & Network Administrator",
    contributions: [
      "Maintain racks, switching, routing, cabling, servers and internet connectivity.",
      "Coordinate upgrades and issue resolution with Fusion Business Solutions.",
      "Maintain and troubleshoot UNV video surveillance systems, computers and printers.",
      "Manage user accounts and access; keep technical documentation and service records.",
    ],
    tech: ["Routers & switches", "Server room", "LAN", "UNV surveillance", "User access management"],
    results: [],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  {
    slug: "field-network-deployments",
    title: "Field Network Deployments (20+ Work Orders)",
    category: "Network Infrastructure",
    status: "published",
    context: "Omnivir · 2025–2026",
    cover: { from: "#0ea2c9", to: "#142142", motif: "topology" },
    overview:
      "LAN/WAN, IoT infrastructure and web server installations plus Tier 1–2 troubleshooting, including 20+ network-focused Field Nation work orders.",
    problem: "Sites needed hardware, operating systems and network services deployed and validated alongside remote engineering teams.",
    role: "Computer Network Technician",
    contributions: [
      "Installed, configured and maintained LAN/WAN networks, IoT infrastructure and web server systems.",
      "Troubleshot connectivity, server services (including Opera systems) and performance issues.",
      "Supported remote engineering teams during validation and post-deployment testing.",
    ],
    tech: ["LAN/WAN", "IoT", "Web servers", "Opera systems", "Field Nation"],
    results: ["Completed 20+ network-focused work orders."],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  {
    slug: "company-websites-and-ecommerce",
    title: "Company Websites & E-Commerce",
    category: "Web Development",
    status: "published",
    context: "Expert Mobile Communications Ltd. · 2026",
    cover: { from: "#4f8cff", to: "#8b5cf6", motif: "web" },
    overview: "Maintenance of expertmobile.ca, cwsupply.ca and the Inrico Canada site — content, product listings, pricing, layouts and e-commerce features.",
    problem: "Product catalogues and pricing change often and must stay accurate across several storefronts.",
    role: "Web & business systems administrator",
    contributions: [
      "Maintain content, layouts and product listings across three company sites.",
      "Manage pricing and e-commerce features.",
      "Administer Odoo and Point of Rental alongside the websites.",
    ],
    tech: ["Web design", "E-commerce", "Odoo", "Point of Rental"],
    results: [],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  {
    slug: "stroke-risk-prediction-research",
    title: "Early-Stage Stroke Risk Prediction (IEEE ICIET 2019)",
    category: "Research and Academic Projects",
    status: "published",
    context: "Metropolitan University · 2019",
    cover: { from: "#8b5cf6", to: "#2553d6", motif: "research" },
    overview:
      "Research paper “Risk Prediction of Stroke at The Early Stage Using Data Mining Techniques”, published at the IEEE-sponsored 2nd International Conference on Innovation in Engineering and Technology (ICIET 2019), University of Dhaka.",
    problem: "Applying data mining techniques to the early-stage prediction of stroke risk.",
    role: "Author",
    contributions: ["Add abstract, dataset and method details here."],
    tech: ["Data mining"],
    results: [],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  // ---------- Drafts: clearly labeled, no invented outcomes ----------
  {
    slug: "ccna-multi-area-ospf-lab",
    title: "Cisco Lab: VLANs, Inter-VLAN Routing & OSPF",
    category: "Networking and Cisco Labs",
    status: "draft",
    context: "Planned lab write-up",
    cover: { from: "#14c8f0", to: "#2553d6", motif: "lab" },
    overview: "Planned: a documented lab topology covering VLAN segmentation, router-on-a-stick inter-VLAN routing and OSPF.",
    problem: "",
    role: "",
    contributions: [],
    tech: ["Cisco IOS", "VLANs", "OSPF"],
    results: [],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: ["cisco-vlan-trunking-quick-reference"],
  },
  {
    slug: "home-security-monitoring-lab",
    title: "Security Monitoring Home Lab",
    category: "Cybersecurity Learning Labs",
    status: "draft",
    context: "Future cybersecurity lab",
    cover: { from: "#8b5cf6", to: "#060b1a", motif: "shield" },
    overview: "Planned: a segmented home lab for practising log collection, alerting and basic detection.",
    problem: "",
    role: "",
    contributions: [],
    tech: [],
    results: [],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  {
    slug: "firewall-segmentation-lab",
    title: "Firewall Rules & Network Segmentation Lab",
    category: "Cybersecurity Learning Labs",
    status: "draft",
    context: "Future cybersecurity lab",
    cover: { from: "#2553d6", to: "#8b5cf6", motif: "shield" },
    overview: "Planned: designing least-privilege rules between user, server and IoT segments, with documented test results.",
    problem: "",
    role: "",
    contributions: [],
    tech: [],
    results: [],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  {
    slug: "digital-forensics-case-study",
    title: "Digital Forensics Practice Case",
    category: "Cybersecurity Learning Labs",
    status: "draft",
    context: "Future cybersecurity lab",
    cover: { from: "#0a1124", to: "#8b5cf6", motif: "shield" },
    overview: "Planned: a write-up of a practice forensic investigation on a public training image, building on my M.A.S. specialization.",
    problem: "",
    role: "",
    contributions: [],
    tech: [],
    results: [],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
  {
    slug: "lict-sust-hackathon-project",
    title: "LICT SUST Tech-Fest Hackathon Project (Champion)",
    category: "Research and Academic Projects",
    status: "draft",
    context: "2019 · details pending",
    cover: { from: "#f59e0b", to: "#8b5cf6", motif: "research" },
    overview: "Champion at the LICT SUST Tech-Fest Hackathon (2019). Project details to be added.",
    problem: "",
    role: "",
    contributions: [],
    tech: [],
    results: [],
    lessons: [],
    screenshots: [],
    repo: "",
    demo: "",
    relatedPosts: [],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
