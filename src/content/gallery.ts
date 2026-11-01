/**
 * Built-in gallery items. More photos are added from the admin panel (/admin → Gallery),
 * which stores them in Supabase; both lists are merged on the Gallery page.
 * kind: "photo" = real photograph · "illustration" = artwork, diagram or simulated scene.
 */
export type GalleryItem = {
  id: string;
  title: string;
  caption: string;
  category: string;
  kind: "photo" | "illustration" | "video";
  src: string;
  featured?: boolean;
  published?: boolean;
  /** Optional still image shown before a video plays. */
  poster?: string;
};

export const galleryCategories = ["Profile", "Academic", "Professional", "Infrastructure", "Labs", "Projects", "Diagrams", "Achievements", "Brand"] as const;

export const gallery: GalleryItem[] = [
  { id: "proj-jarvis", title: "Jarvis — personal AI agent", caption: "Illustration of my AI agent's HUD interface: plan, act with tools, check, confirm.", category: "Projects", kind: "illustration", src: "/images/projects/jarvis-ai-agent.jpg", featured: true },
  { id: "proj-poc-ops", title: "POC Ops Center — Command Overview", caption: "217 companies · 2,667 devices · 2,951 SIMs in one HUD dashboard: match gauge, key numbers, idle-SIM cost and licence alerts.", category: "Projects", kind: "photo", src: "/images/projects/poc-ops-center-overview.jpg", featured: true },
  { id: "proj-poc-sim", title: "POC & SIM Operations Center", caption: "Illustration of the radio and SIM matching dashboard (customer data removed).", category: "Projects", kind: "illustration", src: "/images/projects/poc-sim-operations-center.jpg", featured: true },
  { id: "proj-install-board", title: "Install Board — appointment booking", caption: "Illustration of the live installer week view (names removed).", category: "Projects", kind: "illustration", src: "/images/projects/install-board.jpg" },
  { id: "proj-bc680", title: "BC680 body-cam backup — project site", caption: "Hash-verified, three-copy evidence storage across two offices.", category: "Projects", kind: "photo", src: "/images/projects/bc680-overview.jpg", featured: true },
  { id: "proj-bc680-guide", title: "BC680 — animated staff guide", caption: "Six chapters with moving diagrams and copyable commands.", category: "Projects", kind: "photo", src: "/images/projects/bc680-guide.jpg" },
  { id: "proj-emc", title: "Expert Mobile website", caption: "“Everything wireless. Under one roof.” — company site with admin panel.", category: "Projects", kind: "photo", src: "/images/projects/expert-mobile-home.jpg", featured: true },
  { id: "proj-emc-2", title: "Expert Mobile — solutions & brands", caption: "Solutions, brands and dealer network section.", category: "Projects", kind: "photo", src: "/images/projects/expert-mobile-section.jpg" },
  { id: "proj-portfolio-jarvis", title: "This portfolio — Jarvis theme", caption: "Next.js + Supabase portfolio with Dark, Light and Jarvis themes.", category: "Projects", kind: "photo", src: "/images/projects/portfolio-jarvis.jpg" },
  { id: "commencement", title: "Fairleigh Dickinson University commencement", caption: "Crossing the stage — M.A.S. in Computer Security and Forensic Administration.", category: "Academic", kind: "photo", src: "/images/gallery/commencement.jpg", featured: true },
  { id: "graduation-portrait", title: "Graduation day", caption: "Master of Administrative Science graduate, Fairleigh Dickinson University (2025).", category: "Academic", kind: "photo", src: "/images/gallery/graduation-portrait.jpg", featured: true },
  { id: "profile", title: "Professional headshot", caption: "Masum Mohammad Jubayel.", category: "Profile", kind: "photo", src: "/images/profile.jpg", featured: true },
  { id: "brand-banner", title: "MJ brand banner", caption: "Personal brand artwork — Masum Jubayel.", category: "Brand", kind: "illustration", src: "/images/brand/mj-banner.jpg", featured: true },
  { id: "brand-emblem", title: "MJ emblem", caption: "Personal brand artwork with the MJ monogram.", category: "Brand", kind: "illustration", src: "/images/brand/mj-emblem.jpg" },
  { id: "name-emblem", title: "Name emblem", caption: "Personal brand artwork.", category: "Brand", kind: "illustration", src: "/images/brand/name-emblem.jpg" },
  { id: "sketch", title: "Ink sketch portrait", caption: "Hand-drawn style sketch that the gallery’s point-cloud portrait is built from.", category: "Brand", kind: "illustration", src: "/images/brand/sketch.jpg", featured: true },
  { id: "site-topology", title: "Representative site topology", caption: "Simplified restaurant-site network.", category: "Diagrams", kind: "illustration", src: "/images/diagrams/site-topology.svg", featured: true },
  { id: "lab", title: "Cisco lab topology", caption: "VLAN / OSPF practice topology.", category: "Labs", kind: "illustration", src: "/images/diagrams/lab-topology.svg", featured: true },
];
