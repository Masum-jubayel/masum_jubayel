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
] as const;
export type Category = (typeof categories)[number];

export const projects: Project[] = [
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
    ],
    tech: ["Windows", "PowerShell", "SHA-256", "Shared drive / mapped drive", "Encrypted site-to-site tunnel", "HTML / CSS / JavaScript", "SVG animation", "GitHub Pages"],
    results: [
      "Triple-copy, hash-verified storage for every recording, checked every 2 minutes.",
      "Backups refuse deletes, protecting recordings from accidental or deliberate removal.",
      "Complete hand-over package: rebuild guide, staff training, customer slides, PDF guides and video.",
    ],
    lessons: [],
    screenshots: [],
    documents: [],
    featured: true,
    repo: "",
    demo: "https://masum-jubayel.github.io/Bc680-Bodycam-Data-Backup/",
    relatedPosts: [],
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
    ],
    tech: ["HTML5", "CSS3", "JavaScript", "Python 3", "Netlify", "Firebase Hosting", "GitHub Pages", "Git"],
    results: [
      "One self-contained HTML file — upload anywhere, no server required.",
      "Company details kept current: Grande Prairie, Alberta address, store and sales lines, Mon–Fri 8 AM–5 PM MT.",
    ],
    lessons: [],
    screenshots: [],
    documents: [],
    featured: true,
    repo: "https://github.com/Masum-jubayel/expertmobile",
    demo: "https://masum-jubayel.github.io/expertmobile/",
    relatedPosts: [],
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
