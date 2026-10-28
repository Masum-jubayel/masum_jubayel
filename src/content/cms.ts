/**
 * Site-wide editable content. Defaults come from the files in src/content and src/lib/site.ts;
 * anything saved in /admin → Content overrides them (stored in Supabase `site_content`).
 */
import { gallery as builtInGallery, galleryCategories, type GalleryItem } from "@/content/gallery";
import { nav, site as siteDefaults } from "@/lib/site";
import { aboutSummary, awards, careerObjectives, certifications, education, experience, research, type Job } from "@/content/profile";
import { skillGroups, type SkillGroup } from "@/content/skills";
import { categories, coverMotifs, projects, type Project } from "@/content/projects";
export { coverMotifs } from "@/content/projects";
import { workCategories, works, type WorkItem } from "@/content/works";
export type { WorkItem } from "@/content/works";

export const coverPositions = ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] as const;
export type SiteInfo = {
  name: string; shortName: string; title: string; positioning: string; location: string;
  headline1: string; headline2: string; heroIntro: string; profilePhoto: string;
  employer: string; employerLogo: string; coverPhoto: string; coverPosition: string; coverHeight: string; email: string; workEmail: string; phone: string;
  linkedin: string; github: string; instagram: string; facebook: string;
};
export type AboutInfo = {
  summary: string; objectives: string[]; achievements: string[]; interests: { title: string; body: string }[];
  focus: { title: string; body: string; tags: string; icon: string; link: string }[];
  ctaTitle: string; ctaText: string;
  // About page layout & visuals
  portraitImage: string; portraitChips: string[]; portraitRing: boolean; portraitFocus: string; portraitShape: string; showNameCard: boolean;
  statsAuto: boolean; stats: { value: string; label: string }[];
  showStats: boolean; showPortrait: boolean; showIntro: boolean; showFocus: boolean; showCurrent: boolean; showEducation: boolean;
  showAchievements: boolean; showInterests: boolean; showTimeline: boolean; showResearch: boolean; showObjectives: boolean;
  introLabel: string; focusEyebrow: string; focusTitle: string; focusAccent: string; focusText: string;
  currentLabel: string; educationLabel: string; achievementsLabel: string; interestsLabel: string; objectivesLabel: string; objectivesTitle: string;
  commencementImage: string; commencementCaption: string;
  ctaPrimaryLabel: string; ctaPrimaryHref: string; ctaSecondaryLabel: string; ctaSecondaryHref: string;
};
export type Education = (typeof education)[number];
export type Certification = (typeof certifications)[number];
export type AwardItem = (typeof awards)[number];
export type Research = typeof research & { certificate?: string };
export type Heading = { eyebrow: string; title: string; accent: string; text: string };

/** Section headings & intro text for every page (admin → Content → Page headings). */
export const pageHeadingSlots = [
  ["home_what", "Home · What I do"], ["home_experience", "Home · Experience"], ["home_projects", "Home · Projects"],
  ["home_achievements", "Home · Achievements"], ["home_blog", "Home · Blog"],
  ["about_header", "About · Page header"], ["about_timeline", "About · Career timeline"], ["about_research", "About · Research & awards"],
  ["experience_header", "Experience · Page header"], ["experience_core", "Experience · Core roles"], ["experience_additional", "Experience · Additional roles"],
  ["skills_header", "Skills · Page header"],
  ["projects_header", "Projects · Page header"], ["projects_next", "Projects · Coming next"],
  ["achievements_header", "Achievements · Page header"], ["achievements_work", "Achievements · Selected work"],
  ["achievements_degrees", "Achievements · Degrees"], ["achievements_certs", "Achievements · Credentials"], ["achievements_awards", "Achievements · Awards"], ["achievements_participation", "Achievements · Participation"],
  ["blog_header", "Blog · Page header"], ["gallery_header", "Gallery · Page header"], ["gallery_memories", "Gallery · Memories feed"],
] as const;
export type HeadingSlot = (typeof pageHeadingSlots)[number][0];
export type PagesInfo = Record<HeadingSlot, Heading>;

const h = (eyebrow: string, title: string, accent = "", text = ""): Heading => ({ eyebrow, title, accent, text });
const defaultPages: PagesInfo = {
  home_what: h("What I do", "Networks, web apps and IT systems.", "A clear direction toward security.", "Networking and IT infrastructure are my established professional strengths — routers, switches, cabling, servers and the people who rely on them. Web programming is the other half of my work: I build company websites, admin dashboards, backup tooling and interactive documentation. Cybersecurity is my academic background and the specialization I’m actively building toward."),
  home_experience: h("Experience", "Where I’ve built and supported networks", "", "From a Lead IT & Network Administrator role in Alberta to multi-site cabling projects and field deployments across British Columbia."),
  home_projects: h("Projects", "Case studies from real work"),
  home_achievements: h("Achievements", "Recognition along the way"),
  home_blog: h("Blog", "Notes from the rack and the lab"),
  about_header: h("About me", "Network professional.", "Security-minded.", ""),
  about_timeline: h("Career timeline", "How I got here"),
  about_research: h("Research & awards", "Academic and competitive recognition"),
  experience_header: h("Experience", "Infrastructure work,", "in the field and on the floor", "Positions and dates are shown exactly as listed on my resume; some project-based engagements overlap."),
  experience_core: h("Networking & IT roles", "Core experience"),
  experience_additional: h("Additional experience", "Support, teaching and university services"),
  skills_header: h("Technical skills", "Skills, labeled by", "evidence", "No arbitrary percentages. Each skill is tagged as professional experience, certification, working knowledge, academic background or currently developing — based on my resume."),
  projects_header: h("Projects", "Case studies &", "technical work", "Published case studies come from work documented on my resume. Items marked DRAFT are planned and will be filled in as they’re completed."),
  projects_next: h("Coming next", "Future cybersecurity labs", "", "Hands-on labs I’m planning as I develop my security specialization. Each will be documented with topology, configuration and lessons learned."),
  achievements_header: h("Achievements", "Certifications, research", "& awards", "Research, credentials, awards and activities — with the certificates and documents behind them."),
  achievements_work: h("Research", "Publication & presentation", "", "Click the card for details, the certificate and the full paper."),
  achievements_degrees: h("Education", "Degrees", "", "Master’s and bachelor’s degree certificates — click to view."),
  achievements_certs: h("Certifications & training", "Credentials", "& courses", "Cisco Networking Academy courses, training programs and workshops — click any certificate to view it."),
  achievements_awards: h("Awards", "Competitions & recognition"),
  achievements_participation: h("Participation & activities", "Hackathons, fairs", "& camps", "Competitions, project exhibitions, scouting, courses and workshops I took part in. Click a certificate to view it."),
  blog_header: h("Blog", "Networking & security", "field notes", "Tutorials, references and lessons learned from infrastructure work and security study."),
  gallery_memories: h("Memories", "Moments I’ve", "shared", "Milestones, events and everyday moments."),
  gallery_header: h("Gallery", "Moments,", "signal & milestones", "Graduation day, brand artwork, lab topologies and work in the field. Every frame is labeled as a real photo or an illustration."),
};

/** Site-wide controls: what shows, what moves, announcements, maintenance and SEO. */
export type LayoutInfo = {
  announceOn: boolean; announceText: string; announceLink: string; announceTone: string;
  maintenanceOn: boolean; maintenanceTitle: string; maintenanceText: string;
  menu: { label: string; href: string; show: string }[]; navResumeButton: boolean; navTagline: string;
  homeStats: boolean; homeMarquee: boolean; homeWhat: boolean; homeExperience: boolean; homeProjects: boolean; homeSecurity: boolean; homeAchievements: boolean; homeBlog: boolean; homeCta: boolean;
  homeProjectsCount: string; homePostsCount: string;
  heroScene: boolean; heroPortrait: boolean; holoPlace: string; heroStatus: boolean; heroStatusLabel: string; heroStatusText: string;
  heroRoles: string[]; marqueeWords: string[];
  fxScrollProgress: boolean; fxAmbient: boolean; fxHeaderMotion: boolean; fxCalm: boolean;
  seoDescription: string; seoKeywords: string[]; footerNote: string;
  footerPortrait: boolean; footerSocial: boolean; galleryMemories: boolean; galleryArchive: boolean; galleryHero: boolean;
  gHeroImage: string; gHeroInvert: boolean; gNameA: string; gNameB: string; gColorA: string; gColorB: string; gSpeed: string; gDensity: string;
  gInteractive: boolean; gHud: boolean; gStats: boolean; gFilmstrip: boolean; gCta1: string; gCta2: string; gOrbit: boolean;
};

/** Everything on the Resume page (the PDF itself is replaced in Admin → Resume). */
export type ResumeInfo = {
  eyebrow: string; title: string; accent: string; intro: string;
  showPaper: boolean; chips: string[]; showStats: boolean; showPhoto: boolean; showEmail: boolean; showPhone: boolean; showLocation: boolean;
  phrases: string[]; summary: string; defaultView: string; downloadName: string;
  showSummary: boolean; showWork: boolean; showEducation: boolean; showSkills: boolean; showCerts: boolean; showResearch: boolean; showAwards: boolean; showLanguages: boolean;
  summaryTitle: string; workTitle: string; educationTitle: string; skillsTitle: string; certsTitle: string; researchTitle: string; awardsTitle: string;
  workShowTags: boolean; skillsAsChips: boolean; extra: { title: string; body: string }[];
};

/** Home 3D workstation + hologram face. */
export type SceneInfo = {
  interactive: boolean; cameraMotion: boolean; showRacks: boolean; showBanner: boolean; showPaths: boolean; showDeskSwitch: boolean;
  shirt: string; shirtAccent: string; skin: string; hair: string; pants: string; glow: string; rim: string; light: string;
  holoBrightness: string; holoSize: string; holoColor: string; holoLabel: string; holoSub: string; holoImage: string; holoInvert: boolean;
  bannerImage: string; bannerOpacity: string; bannerWidth: string; characterModel: string;
  screens: { kind: string; label: string; hint: string; href: string }[];
};

/** Contact page text and which contact methods show. */
export type ContactInfo = {
  eyebrow: string; title: string; accent: string; intro: string;
  showEmail: boolean; showWorkEmail: boolean; workEmailLabel: string; showPhone: boolean; showLocation: boolean;
  showForm: boolean; formTitle: string; showConnect: boolean; availability: string; showAvailability: boolean;
};

/** Show / hide the building blocks of each page. */
export type PageSections = {
  skillsCount: boolean; skillsTicker: boolean; skillsDomains: boolean; skillsFilters: boolean; skillsLegend: boolean;
  expStats: boolean; expPath: boolean; expCore: boolean; expAdditional: boolean; expOpenFirst: boolean;
  achJump: boolean; achDegrees: boolean; achCerts: boolean; achResearch: boolean; achAwards: boolean; achParticipation: boolean;
  projList: boolean; projLabs: boolean; projPerPage: string;
};

export type Content = {
  gallery: GalleryItem[];
  layout: LayoutInfo;
  sections: PageSections;
  contact: ContactInfo;
  scene: SceneInfo;
  resume: ResumeInfo;
  site: SiteInfo; about: AboutInfo; experience: Job[]; education: Education[]; certifications: Certification[];
  awards: AwardItem[]; research: Research; skills: SkillGroup[]; projects: Project[]; works: WorkItem[]; pages: PagesInfo;
};
export type ContentKey = keyof Content;

export const defaultLayout: LayoutInfo = {
  announceOn: false, announceText: "Open to network, IT infrastructure and security roles — let’s talk.", announceLink: "/contact", announceTone: "info",
  maintenanceOn: false, maintenanceTitle: "Upgrading the network", maintenanceText: "The site is getting a few improvements. Please check back shortly.",
  menu: nav.map((n) => ({ label: n.label, href: n.href, show: "yes" })), navResumeButton: true, navTagline: "Network · Security · Web",
  homeStats: true, homeMarquee: true, homeWhat: true, homeExperience: true, homeProjects: true, homeSecurity: true, homeAchievements: true, homeBlog: true, homeCta: true,
  homeProjectsCount: "3", homePostsCount: "3",
  heroScene: true, heroPortrait: false, holoPlace: "about", heroStatus: true, heroStatusLabel: "Network status", heroStatusText: "All links up",
  heroRoles: ["Network administration", "PoC radio & telecom", "Web programming", "Cybersecurity"],
  marqueeWords: ["Cisco CCNA", "PoC Radio", "LAN / WAN", "Django", "Hytera", "VLANs", "PostgreSQL", "Inrico", "Firewalls", "Structured Cabling", "PHP · CodeIgniter", "Cybersecurity", "Odoo", "DMR", "Python", "Server Rooms"],
  fxScrollProgress: true, fxAmbient: true, fxHeaderMotion: true, fxCalm: false,
  seoDescription: "", seoKeywords: [], footerNote: "",
  footerPortrait: true, footerSocial: true, galleryMemories: true, galleryArchive: true, galleryHero: true,
  gHeroImage: "", gHeroInvert: false, gNameA: "Masum", gNameB: "Jubayel", gColorA: "#22c55e", gColorB: "#ef4444", gSpeed: "normal", gDensity: "normal",
  gInteractive: true, gHud: true, gStats: true, gFilmstrip: true, gCta1: "Enter the gallery", gCta2: "Browse the archive", gOrbit: true,
};

/** Menu links as set in Admin → Site controls (rename, reorder, hide, add your own). */
export function menuItems(layout: LayoutInfo): { href: string; label: string }[] {
  const list = (layout.menu?.length ? layout.menu : defaultLayout.menu).filter((m) => m.show !== "no" && m.label && /^(\/|https?:\/\/)/.test(m.href));
  return list.map((m) => ({ href: m.href, label: m.label }));
}

export const defaultResume: ResumeInfo = {
  eyebrow: "Resume", title: "Curriculum", accent: "vitae", intro: "Network, telecom and web experience on one page — read it online, open the original PDF, or download it.",
  showPaper: true, chips: ["Networking", "PoC Radio", "Web Dev", "Security"], showStats: true, showPhoto: true, showEmail: true, showPhone: true, showLocation: true,
  phrases: ["Lead IT Support & Network Administrator", "PoC radio & telecom deployments", "Web programmer — Python, PHP, SQL", "M.A.S. in Computer Security & Forensics", "B.Sc. in Computer Science & Engineering"],
  summary: "", defaultView: "online", downloadName: "Masum_Mohammad_Jubayel_Resume.pdf",
  showSummary: true, showWork: true, showEducation: true, showSkills: true, showCerts: true, showResearch: true, showAwards: true, showLanguages: true,
  summaryTitle: "Professional summary", workTitle: "Work history", educationTitle: "Education", skillsTitle: "Technical skills", certsTitle: "Certifications", researchTitle: "Research publication", awardsTitle: "Awards",
  workShowTags: true, skillsAsChips: true, extra: [],
};

export const screenKinds = ["topology", "terminal", "security", "traffic", "servers"] as const;
export const defaultScene: SceneInfo = {
  interactive: true, cameraMotion: true, showRacks: true, showBanner: true, showPaths: true, showDeskSwitch: true,
  shirt: "#1c2742", shirtAccent: "#3ee6ff", skin: "#a87a5c", hair: "#121214", pants: "#1d2029", glow: "#3ee6ff", rim: "#8b5cf6", light: "1",
  holoBrightness: "bright", holoSize: "large", holoColor: "#7ef3ff", holoLabel: "MASUM JUBAYEL", holoSub: "IDENTITY · VERIFIED", holoImage: "/images/brand/pointmap.png", holoInvert: false,
  bannerImage: "/images/brand/logo-banner.jpg", bannerOpacity: "0.28", bannerWidth: "normal", characterModel: "",
  screens: [
    { kind: "topology", label: "Network topology", hint: "Open projects", href: "/projects" },
    { kind: "terminal", label: "Terminal & scripts", hint: "Read the blog", href: "/blog" },
    { kind: "security", label: "Security monitor", hint: "See certifications", href: "/achievements#certs" },
    { kind: "traffic", label: "Traffic & uptime", hint: "View experience", href: "/experience" },
    { kind: "servers", label: "Systems status", hint: "Explore skills", href: "/skills" },
  ],
};

export const defaultContactPage: ContactInfo = {
  eyebrow: "Contact", title: "Let’s", accent: "connect",
  intro: "Recruiters, infrastructure teams and security teams — I’d be glad to hear about roles in network administration, network engineering and cybersecurity.",
  showEmail: true, showWorkEmail: true, workEmailLabel: "Work email · Expert Mobile Communications", showPhone: true, showLocation: true,
  showForm: true, formTitle: "", showConnect: true, availability: "Open to new opportunities", showAvailability: true,
};

export const defaultPageSections: PageSections = {
  skillsCount: true, skillsTicker: true, skillsDomains: true, skillsFilters: true, skillsLegend: true,
  expStats: true, expPath: true, expCore: true, expAdditional: true, expOpenFirst: false,
  achJump: true, achDegrees: true, achCerts: true, achResearch: true, achAwards: true, achParticipation: true,
  projList: true, projLabs: true, projPerPage: "12",
};

export const defaultContent: Content = {
  gallery: builtInGallery.map((g) => ({ ...g, featured: Boolean(g.featured), published: true, poster: "" })),
  layout: defaultLayout,
  sections: defaultPageSections,
  contact: defaultContactPage,
  scene: defaultScene,
  resume: defaultResume,
  site: {
    name: siteDefaults.name, shortName: siteDefaults.shortName, title: siteDefaults.title, positioning: siteDefaults.positioning,
    location: siteDefaults.location, headline1: "Engineering Networks.", headline2: "Securing the Digital World.",
    heroIntro: siteDefaults.hero.intro, profilePhoto: siteDefaults.profilePhoto,
    employer: "Expert Mobile Communications", employerLogo: "/images/logos/expert-mobile.png", coverPhoto: "/images/brand/mj-banner.jpg", coverPosition: "20%", coverHeight: "tall",
    email: siteDefaults.contact.email, workEmail: siteDefaults.contact.workEmail, phone: siteDefaults.contact.phone,
    linkedin: siteDefaults.contact.linkedin, github: siteDefaults.contact.github, instagram: siteDefaults.contact.instagram, facebook: siteDefaults.contact.facebook,
  },
  about: {
    summary: aboutSummary,
    objectives: careerObjectives,
    focus: [
      { title: "Networks & IT infrastructure", icon: "Network", link: "/experience", tags: "Cisco, LAN/WAN, Structured cabling, Servers, UNV surveillance",
        body: "Lead IT support and network administration — racks, switches, routers, cabling, servers and the people who rely on them, plus 20+ multi-site retail network installs." },
      { title: "PoC radio & telecommunications", icon: "RadioTower", link: "/projects/irc380-custom-firmware", tags: "Inrico, Hytera HyTalk, DMR, IRC380, Dispatch",
        body: "Deploying and supporting Push-to-Talk over Cellular and DMR fleets across North America — programming, dispatch configuration, Android device engineering and a custom firmware project." },
      { title: "Web programming", icon: "Code2", link: "/projects/expert-mobile-website", tags: "HTML/CSS/JS, Python/Django, PHP/CodeIgniter, MySQL/PostgreSQL, Next.js",
        body: "Building company websites, admin dashboards, inventory and backup tooling — from single-file sites to database-backed apps like this portfolio." },
      { title: "Cybersecurity", icon: "ShieldCheck", link: "/skills#security", tags: "M.A.S. Computer Security, Digital forensics, Cisco Intro to Cybersecurity, ACLs, Hash-verified backups",
        body: "My master’s specialization — computer security and forensic administration — applied day to day through access control, data protection, secure backups and a growing set of hands-on labs." },
    ],
    achievements: [
      "Delivered structured cabling and network installs across 20+ Wendy’s locations with NCR Voyix teams.",
      "Completed 20+ network-focused Field Nation work orders at Omnivir.",
      "Developed an inventory management system with reconciliation and transaction tracking at Expert Mobile.",
      "Published early-stage stroke-risk prediction research at IEEE-sponsored ICIET 2019.",
    ],
    interests: [
      { title: "Network security fundamentals", body: "Segmentation, access control and secure device management — where my networking work and security studies overlap." },
      { title: "Computer security & digital forensics", body: "The focus of my M.A.S. in Computer Security and Forensic Administration at Fairleigh Dickinson University." },
      { title: "Threat detection & monitoring", body: "An area I’m actively developing through home-lab practice — not yet claimed as professional experience." },
    ],
    portraitImage: "", portraitChips: ["M.A.S.", "B.Sc.", "CCNA", "PoC radio", "Web dev"], portraitRing: true, portraitFocus: "top", portraitShape: "rounded", showNameCard: true,
    statsAuto: true, stats: [{ value: "20+", label: "Sites networked" }],
    showStats: true, showPortrait: true, showIntro: true, showFocus: true, showCurrent: true, showEducation: true,
    showAchievements: true, showInterests: true, showTimeline: true, showResearch: true, showObjectives: true,
    introLabel: "Professional introduction", focusEyebrow: "What I focus on", focusTitle: "disciplines,", focusAccent: "one engineer",
    focusText: "Networks keep a business connected, radios keep its crews talking, the web keeps its customers informed — and security protects all of it.",
    currentLabel: "Current position", educationLabel: "Education", achievementsLabel: "Technical achievements", interestsLabel: "Cybersecurity interests",
    objectivesLabel: "Future objectives", objectivesTitle: "Where I’m headed",
    commencementImage: "/images/gallery/commencement.jpg", commencementCaption: "Commencement — Master of Administrative Science, Computer Security and Forensic Administration, Fairleigh Dickinson University.",
    ctaPrimaryLabel: "Get in touch", ctaPrimaryHref: "/contact", ctaSecondaryLabel: "Explore skills", ctaSecondaryHref: "/skills",
    ctaTitle: "Building a network team or a security practice?",
    ctaText: "I’d be glad to talk about network administration, infrastructure, web development and security-focused roles.",
  },
  experience,
  education,
  certifications,
  awards,
  research: { ...research, certificate: "/images/works/iciet-2019-certificate.jpg" },
  skills: skillGroups,
  projects,
  works,
  pages: defaultPages,
};

/* ------------------------------ editor specs ------------------------------ */

export type ItemColumn = { key: string; label: string; kind: "text" | "image" | "file" | "select" | "toggle" | "color"; options?: readonly string[]; wide?: boolean; accept?: string };
type FieldBase = { key: string; label: string; help?: string; group?: string };
export type Field =
  | (FieldBase & { type: "text" | "textarea" | "lines" | "csv" | "bool" | "color" | "month" | "image" | "url" | "file" | "groups" | "heading" | "cover" })
  | (FieldBase & { type: "select"; options: readonly string[] })
  | (FieldBase & { type: "rows"; columns: string[] })
  | (FieldBase & { type: "items"; columns: ItemColumn[]; addLabel?: string })
  | (FieldBase & { type: "json" });

export type Section = {
  key: ContentKey; label: string; page: string; kind: "object" | "list"; titleKey?: string; subtitleKey?: string; thumbKey?: string;
  nav: "Site" | "Profile & pages" | "Career" | "Showcase" | "Achievements"; hideInNav?: boolean; icon: string; fields: Field[]; blank?: () => Record<string, unknown>; preview?: string;
};

const evidenceLevels = ["professional", "certified", "working", "academic", "developing", "native", "fluent"] as const;

export const sections: Section[] = [
  {
    key: "gallery", label: "Gallery photos & videos", page: "Gallery", kind: "list", nav: "Showcase", icon: "ImageIcon", titleKey: "title", subtitleKey: "category", thumbKey: "src", hideInNav: true,
    blank: () => ({ id: `g-${Date.now()}`, title: "New item", caption: "", category: "Professional", kind: "photo", src: "", poster: "", featured: false, published: true }),
    fields: [
      { key: "title", label: "Title", type: "text" }, { key: "caption", label: "Caption", type: "textarea" },
      { key: "category", label: "Category", type: "select", options: galleryCategories }, { key: "kind", label: "Type", type: "select", options: ["photo", "illustration", "video"] },
      { key: "src", label: "Photo or video", type: "url" }, { key: "poster", label: "Video cover image (optional)", type: "image" },
      { key: "featured", label: "Featured (shown first)", type: "bool" }, { key: "published", label: "Visible", type: "bool" }, { key: "id", label: "ID", type: "text", group: "Advanced" },
    ],
  },
  {
    key: "sections", label: "Page sections", page: "Skills · Experience · Achievements · Projects", kind: "object", nav: "Site", icon: "LayoutGrid",
    fields: [
      { key: "skillsCount", label: "Skill total card in the header", type: "bool", group: "Skills page" }, { key: "skillsTicker", label: "Scrolling skill ticker", type: "bool", group: "Skills page" },
      { key: "skillsDomains", label: "Domain overview cards", type: "bool", group: "Skills page" }, { key: "skillsFilters", label: "Category tabs, search & evidence filter", type: "bool", group: "Skills page" },
      { key: "skillsLegend", label: "Evidence legend", type: "bool", group: "Skills page" },
      { key: "expStats", label: "Number cards", type: "bool", group: "Experience page" }, { key: "expPath", label: "Career path strip", type: "bool", group: "Experience page" },
      { key: "expCore", label: "Core experience timeline", type: "bool", group: "Experience page" }, { key: "expAdditional", label: "Additional experience cards", type: "bool", group: "Experience page" },
      { key: "expOpenFirst", label: "Open the newest job automatically", type: "bool", group: "Experience page" },
      { key: "achJump", label: "Sticky jump bar", type: "bool", group: "Achievements page" }, { key: "achDegrees", label: "Degrees", type: "bool", group: "Achievements page" },
      { key: "achCerts", label: "Certifications", type: "bool", group: "Achievements page" }, { key: "achResearch", label: "Publication", type: "bool", group: "Achievements page" },
      { key: "achAwards", label: "Awards", type: "bool", group: "Achievements page" }, { key: "achParticipation", label: "Participation & activities", type: "bool", group: "Achievements page" },
      { key: "projList", label: "Project list with filters", type: "bool", group: "Projects page" }, { key: "projLabs", label: "“What’s next” labs section", type: "bool", group: "Projects page" },
      { key: "projPerPage", label: "Projects per page", type: "select", options: ["6", "9", "12", "18", "24", "48"], group: "Projects page" },
    ],
  },
  {
    key: "contact", label: "Contact page", page: "Contact", kind: "object", nav: "Site", icon: "Mail",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text", group: "Heading" }, { key: "title", label: "Title", type: "text", group: "Heading" },
      { key: "accent", label: "Title — gradient part", type: "text", group: "Heading" }, { key: "intro", label: "Intro text", type: "textarea", group: "Heading" },
      { key: "showAvailability", label: "Show availability badge", type: "bool", group: "Heading" }, { key: "availability", label: "Availability text", type: "text", group: "Heading" },
      { key: "showEmail", label: "Personal email", type: "bool", group: "Contact methods" }, { key: "showWorkEmail", label: "Work email", type: "bool", group: "Contact methods" },
      { key: "workEmailLabel", label: "Work email label", type: "text", group: "Contact methods" },
      { key: "showPhone", label: "Phone", type: "bool", group: "Contact methods" }, { key: "showLocation", label: "Location", type: "bool", group: "Contact methods" },
      { key: "showForm", label: "Message form", type: "bool", group: "Form & links" }, { key: "showConnect", label: "Social & resume strip", type: "bool", group: "Form & links" },
    ],
  },
  {
    key: "scene", label: "3D scene & hologram", page: "Home hero (3D workstation)", kind: "object", nav: "Site", icon: "Box",
    fields: [
      { key: "interactive", label: "Hover & click effects (screens, engineer, switch)", type: "bool", group: "Behaviour" },
      { key: "cameraMotion", label: "Camera follows the mouse", type: "bool", group: "Behaviour" },
      { key: "bannerImage", label: "Wall banner image (behind the desk)", type: "image", group: "Wall banner" },
      { key: "bannerOpacity", label: "Wall banner visibility", type: "select", options: ["0.15", "0.28", "0.45", "0.65", "0.85"], group: "Wall banner" },
      { key: "bannerWidth", label: "Wall banner size", type: "select", options: ["small", "normal", "large"], group: "Wall banner" },
      { key: "showRacks", label: "Server racks", type: "bool", group: "Objects" }, { key: "showBanner", label: "Wall banner", type: "bool", group: "Objects" },
      { key: "showPaths", label: "Network lines & packets", type: "bool", group: "Objects" }, { key: "showDeskSwitch", label: "Desk switch", type: "bool", group: "Objects" },
      { key: "holoBrightness", label: "Hologram face (About / Contact) — brightness", type: "select", options: ["normal", "bright", "max"], group: "Hologram face" },
      { key: "holoSize", label: "Hologram face — size", type: "select", options: ["small", "normal", "large", "xl"], group: "Hologram face" },
      { key: "holoColor", label: "Hologram colour", type: "color", group: "Hologram face" },
      { key: "holoImage", label: "Hologram image (a sketch or photo of your face)", type: "image", help: "Dark lines on a light background work best. For a normal photo, switch on “Photo mode”.", group: "Hologram face" },
      { key: "holoInvert", label: "Photo mode (use the bright parts of the picture)", type: "bool", group: "Hologram face" },
      { key: "holoLabel", label: "Hologram name label", type: "text", group: "Hologram face" }, { key: "holoSub", label: "Hologram sub-label", type: "text", group: "Hologram face" },
      { key: "characterModel", label: "Custom 3D character (.glb link — leave empty for the built-in engineer)", type: "url", help: "Paste a link to a .glb model (e.g. from Ready Player Me or your /public/models folder).", group: "Engineer colours" },
      { key: "shirt", label: "Shirt", type: "color", group: "Engineer colours" }, { key: "shirtAccent", label: "Collar accent", type: "color", group: "Engineer colours" },
      { key: "skin", label: "Skin", type: "color", group: "Engineer colours" }, { key: "hair", label: "Hair", type: "color", group: "Engineer colours" },
      { key: "pants", label: "Trousers", type: "color", group: "Engineer colours" },
      { key: "glow", label: "Screen & desk glow", type: "color", group: "Lighting" }, { key: "rim", label: "Back rim light", type: "color", group: "Lighting" },
      { key: "light", label: "Overall brightness", type: "select", options: ["0.6", "0.8", "1", "1.2", "1.5"], group: "Lighting" },
      { key: "screens", label: "What each monitor says and opens when clicked", type: "items", addLabel: "Add screen link", group: "Monitor links",
        columns: [{ key: "kind", label: "Screen", kind: "select", options: screenKinds }, { key: "label", label: "Label", kind: "text" }, { key: "hint", label: "Hint", kind: "text" }, { key: "href", label: "Opens (/page)", kind: "text" }] },
    ],
  },
  {
    key: "resume", label: "Resume page", page: "Resume (online resume + header)", kind: "object", nav: "Site", icon: "FileText",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text", group: "Header" }, { key: "title", label: "Title", type: "text", group: "Header" },
      { key: "accent", label: "Title — gradient part", type: "text", group: "Header" }, { key: "intro", label: "Intro text", type: "textarea", group: "Header" },
      { key: "showPaper", label: "Show the floating resume card", type: "bool", group: "Header" },
      { key: "chips", label: "Floating labels around the card (comma-separated)", type: "csv", group: "Header" },
      { key: "showStats", label: "Show the number cards (years, roles, certifications, skills)", type: "bool", group: "Header" },
      { key: "defaultView", label: "Opens on", type: "select", options: ["online", "pdf"], group: "Header" },
      { key: "downloadName", label: "Download file name", type: "text", group: "Header" },
      { key: "showPhoto", label: "Photo", type: "bool", group: "Identity block" }, { key: "showLocation", label: "Location", type: "bool", group: "Identity block" },
      { key: "showEmail", label: "Email", type: "bool", group: "Identity block" }, { key: "showPhone", label: "Phone", type: "bool", group: "Identity block" },
      { key: "phrases", label: "Typewriter lines under your name (one per line — the first is also printed)", type: "lines", group: "Identity block" },
      { key: "summary", label: "Summary (leave empty to use your About introduction)", type: "textarea", group: "Summary" },
      { key: "showSummary", label: "Show summary", type: "bool", group: "Sections shown" }, { key: "showWork", label: "Show work history", type: "bool", group: "Sections shown" },
      { key: "showEducation", label: "Show education", type: "bool", group: "Sections shown" }, { key: "showSkills", label: "Show skills", type: "bool", group: "Sections shown" },
      { key: "showLanguages", label: "Include the Languages group in skills", type: "bool", group: "Sections shown" },
      { key: "showCerts", label: "Show certifications", type: "bool", group: "Sections shown" }, { key: "showResearch", label: "Show publication", type: "bool", group: "Sections shown" },
      { key: "showAwards", label: "Show awards", type: "bool", group: "Sections shown" },
      { key: "workShowTags", label: "Show tags under each job", type: "bool", group: "Sections shown" }, { key: "skillsAsChips", label: "Show skills as animated chips (off = plain text list)", type: "bool", group: "Sections shown" },
      { key: "summaryTitle", label: "Summary heading", type: "text", group: "Section headings" }, { key: "workTitle", label: "Work heading", type: "text", group: "Section headings" },
      { key: "educationTitle", label: "Education heading", type: "text", group: "Section headings" }, { key: "skillsTitle", label: "Skills heading", type: "text", group: "Section headings" },
      { key: "certsTitle", label: "Certifications heading", type: "text", group: "Section headings" }, { key: "researchTitle", label: "Publication heading", type: "text", group: "Section headings" },
      { key: "awardsTitle", label: "Awards heading", type: "text", group: "Section headings" },
      { key: "extra", label: "Extra sections (e.g. Volunteering, References)", type: "items", addLabel: "Add section", group: "Extra sections",
        columns: [{ key: "title", label: "Heading", kind: "text" }, { key: "body", label: "Text (one item per line)", kind: "text", wide: true }] },
    ],
  },
  {
    key: "layout", label: "Site controls", page: "Every page — visibility, motion, banners, SEO", kind: "object", nav: "Site", icon: "SlidersHorizontal",
    fields: [
      { key: "announceOn", label: "Show announcement bar (top of every page)", type: "bool", group: "Announcement bar" },
      { key: "announceText", label: "Announcement text", type: "text", group: "Announcement bar" },
      { key: "announceLink", label: "Announcement link (optional)", type: "url", group: "Announcement bar" },
      { key: "announceTone", label: "Style", type: "select", options: ["info", "success", "warning", "promo"], group: "Announcement bar" },
      { key: "maintenanceOn", label: "Maintenance mode — visitors see a notice instead of pages (admin still works)", type: "bool", group: "Maintenance mode" },
      { key: "maintenanceTitle", label: "Maintenance title", type: "text", group: "Maintenance mode" },
      { key: "maintenanceText", label: "Maintenance message", type: "textarea", group: "Maintenance mode" },
      { key: "menu", label: "Menu links — rename, reorder (arrows), hide (switch), delete or add your own", type: "items", addLabel: "Add menu link", group: "Menu",
        columns: [{ key: "label", label: "Label", kind: "text" }, { key: "href", label: "Link (/page or https://…)", kind: "text" }, { key: "show", label: "Visible", kind: "toggle" }] },
      { key: "navResumeButton", label: "“Resume” button (top right)", type: "bool", group: "Menu" },
      { key: "navTagline", label: "Tagline under the logo", type: "text", group: "Menu" },
      { key: "heroScene", label: "3D workstation scene", type: "bool", group: "Home hero" },
      { key: "holoPlace", label: "Hologram face — where it appears", type: "select", options: ["about", "contact", "both", "none"], help: "Shown beside the page heading. Colour, brightness and labels are in “3D scene & hologram”.", group: "Home hero" },
      { key: "heroStatus", label: "Status badge", type: "bool", group: "Home hero" },
      { key: "heroStatusLabel", label: "Status badge — label", type: "text", group: "Home hero" }, { key: "heroStatusText", label: "Status badge — text", type: "text", group: "Home hero" },
      { key: "heroRoles", label: "Rotating roles under your name (one per line)", type: "lines", group: "Home hero" },
      { key: "homeStats", label: "Highlight cards", type: "bool", group: "Home sections" }, { key: "homeMarquee", label: "Scrolling keyword band", type: "bool", group: "Home sections" },
      { key: "homeWhat", label: "What I do", type: "bool", group: "Home sections" }, { key: "homeExperience", label: "Experience", type: "bool", group: "Home sections" },
      { key: "homeProjects", label: "Projects", type: "bool", group: "Home sections" }, { key: "homeSecurity", label: "Specialization in progress", type: "bool", group: "Home sections" },
      { key: "homeAchievements", label: "Achievements", type: "bool", group: "Home sections" }, { key: "homeBlog", label: "Blog", type: "bool", group: "Home sections" },
      { key: "homeCta", label: "“Open to opportunities” block", type: "bool", group: "Home sections" },
      { key: "homeProjectsCount", label: "Projects shown on Home", type: "select", options: ["3", "6", "9"], group: "Home sections" },
      { key: "homePostsCount", label: "Articles shown on Home", type: "select", options: ["3", "6"], group: "Home sections" },
      { key: "marqueeWords", label: "Keyword band words (comma-separated)", type: "csv", group: "Home sections" },
      { key: "fxScrollProgress", label: "Reading-progress bar", type: "bool", group: "Motion & effects" },
      { key: "fxAmbient", label: "Ambient drifting background glow", type: "bool", group: "Motion & effects" },
      { key: "fxHeaderMotion", label: "Animated page-header backgrounds", type: "bool", group: "Motion & effects" },
      { key: "fxCalm", label: "Calm mode — turn off decorative animation site-wide", type: "bool", group: "Motion & effects" },
      { key: "seoDescription", label: "Search description (leave empty for default)", type: "textarea", group: "Search & footer" },
      { key: "seoKeywords", label: "Search keywords (comma-separated)", type: "csv", group: "Search & footer" },
      { key: "footerNote", label: "Footer note (optional)", type: "text", group: "Search & footer" },
      { key: "footerPortrait", label: "Animated emblem in the footer", type: "bool", group: "Search & footer" },
      { key: "footerSocial", label: "Social buttons in the footer", type: "bool", group: "Search & footer" },
      { key: "galleryHero", label: "Gallery — portrait hero", type: "bool", group: "Gallery page" },
      { key: "galleryMemories", label: "Gallery — Memories feed", type: "bool", group: "Gallery page" },
      { key: "galleryArchive", label: "Gallery — photo archive", type: "bool", group: "Gallery page" },
      { key: "gHeroImage", label: "Hero point-cloud image (empty = your sketch portrait)", type: "image", group: "Gallery hero", help: "Any photo works — dark areas become points. Turn on “Invert” for light subjects on dark backgrounds." },
      { key: "gHeroInvert", label: "Invert image (light areas become points)", type: "bool", group: "Gallery hero" },
      { key: "gNameA", label: "Signature — first word", type: "text", group: "Gallery hero" }, { key: "gColorA", label: "First word colour", type: "color", group: "Gallery hero" },
      { key: "gNameB", label: "Signature — second word", type: "text", group: "Gallery hero" }, { key: "gColorB", label: "Second word colour", type: "color", group: "Gallery hero" },
      { key: "gSpeed", label: "Animation speed", type: "select", options: ["slow", "normal", "fast"], group: "Gallery hero" },
      { key: "gDensity", label: "Point density", type: "select", options: ["light", "normal", "dense"], group: "Gallery hero" },
      { key: "gInteractive", label: "Points react to the mouse / touch (click to scatter)", type: "bool", group: "Gallery hero" },
      { key: "gHud", label: "Scanner read-out (top-left)", type: "bool", group: "Gallery hero" },
      { key: "gOrbit", label: "Orbiting rings & sparks", type: "bool", group: "Gallery hero" },
      { key: "gStats", label: "Live counters (photos · videos · memories)", type: "bool", group: "Gallery hero" },
      { key: "gFilmstrip", label: "Moving film strip of latest photos", type: "bool", group: "Gallery hero" },
      { key: "gCta1", label: "First button text (jumps to Memories)", type: "text", group: "Gallery hero" },
      { key: "gCta2", label: "Second button text (jumps to the archive)", type: "text", group: "Gallery hero" },
    ],
  },
  {
    key: "site", label: "Profile & contact", page: "Home · header · footer · contact", kind: "object", nav: "Profile & pages", icon: "UserRound",
    fields: [
      { key: "name", label: "Full name", type: "text", group: "Identity" }, { key: "shortName", label: "Short name", type: "text", group: "Identity" },
      { key: "title", label: "Job title", type: "text", group: "Identity" }, { key: "location", label: "Location", type: "text", group: "Identity" },
      { key: "positioning", label: "Positioning line", type: "text", group: "Identity" },
      { key: "profilePhoto", label: "Profile photo", type: "image", group: "Identity" },
      { key: "coverPhoto", label: "Cover photo (Memories profile page)", type: "image", group: "Identity" },
      { key: "coverPosition", label: "Cover photo position (0% = top, 100% = bottom)", type: "select", options: coverPositions, help: "Slide the visible part of the cover up or down.", group: "Identity" },
      { key: "coverHeight", label: "Cover photo height", type: "select", options: ["compact", "normal", "tall", "extra tall"], group: "Identity" },
      { key: "headline1", label: "Hero headline — line 1", type: "text", group: "Home hero" }, { key: "headline2", label: "Hero headline — line 2 (gradient)", type: "text", group: "Home hero" },
      { key: "heroIntro", label: "Hero introduction", type: "textarea", group: "Home hero" },
      { key: "employer", label: "Current employer (badge)", type: "text", group: "Home hero" }, { key: "employerLogo", label: "Employer logo (badge)", type: "image", group: "Home hero" },
      { key: "email", label: "Personal email", type: "text", group: "Contact" }, { key: "workEmail", label: "Work email", type: "text", group: "Contact" }, { key: "phone", label: "Phone", type: "text", group: "Contact" },
      { key: "linkedin", label: "LinkedIn URL", type: "url", group: "Social links" }, { key: "github", label: "GitHub URL", type: "url", group: "Social links" },
      { key: "instagram", label: "Instagram URL", type: "url", group: "Social links" }, { key: "facebook", label: "Facebook URL", type: "url", group: "Social links" },
    ],
  },
  {
    key: "about", label: "About page", page: "About · Home call-to-action", kind: "object", nav: "Profile & pages", icon: "BookUser",
    fields: [
      { key: "portraitImage", label: "Portrait photo (leave empty to use your profile photo)", type: "image", group: "Portrait" },
      { key: "portraitChips", label: "Floating labels around the portrait (comma-separated — spaced out automatically, up to 12)", type: "csv", group: "Portrait" },
      { key: "portraitRing", label: "Animated colour ring", type: "bool", group: "Portrait" },
      { key: "showNameCard", label: "Name card under the portrait", type: "bool", group: "Portrait" },
      { key: "portraitFocus", label: "Photo focus", type: "select", options: ["top", "center", "bottom"], group: "Portrait" },
      { key: "portraitShape", label: "Shape", type: "select", options: ["rounded", "circle", "square"], group: "Portrait" },
      { key: "showStats", label: "Number cards", type: "bool", group: "Number cards" },
      { key: "statsAuto", label: "Automatic numbers (degrees, certifications, projects, skills, awards)", type: "bool", group: "Number cards" },
      { key: "stats", label: "Extra / custom number cards", type: "items", addLabel: "Add number card", group: "Number cards",
        columns: [{ key: "value", label: "Value (e.g. 20+)", kind: "text" }, { key: "label", label: "Label", kind: "text" }] },
      { key: "showPortrait", label: "Portrait", type: "bool", group: "Sections shown" }, { key: "showIntro", label: "Professional introduction", type: "bool", group: "Sections shown" },
      { key: "showFocus", label: "Focus areas", type: "bool", group: "Sections shown" }, { key: "showCurrent", label: "Current position", type: "bool", group: "Sections shown" },
      { key: "showEducation", label: "Education", type: "bool", group: "Sections shown" }, { key: "showAchievements", label: "Technical achievements", type: "bool", group: "Sections shown" },
      { key: "showInterests", label: "Cybersecurity interests", type: "bool", group: "Sections shown" }, { key: "showTimeline", label: "Experience timeline", type: "bool", group: "Sections shown" },
      { key: "showResearch", label: "Research & awards", type: "bool", group: "Sections shown" }, { key: "showObjectives", label: "Future objectives", type: "bool", group: "Sections shown" },
      { key: "introLabel", label: "Introduction label", type: "text", group: "Headings" },
      { key: "focusEyebrow", label: "Focus — small label", type: "text", group: "Headings" }, { key: "focusTitle", label: "Focus — title (number word is added automatically)", type: "text", group: "Headings" },
      { key: "focusAccent", label: "Focus — gradient part", type: "text", group: "Headings" }, { key: "focusText", label: "Focus — text", type: "textarea", group: "Headings" },
      { key: "currentLabel", label: "Current position label", type: "text", group: "Headings" }, { key: "educationLabel", label: "Education label", type: "text", group: "Headings" },
      { key: "achievementsLabel", label: "Achievements label", type: "text", group: "Headings" }, { key: "interestsLabel", label: "Interests label", type: "text", group: "Headings" },
      { key: "objectivesLabel", label: "Objectives label", type: "text", group: "Headings" }, { key: "objectivesTitle", label: "Objectives title", type: "text", group: "Headings" },
      { key: "commencementImage", label: "Education photo", type: "image", group: "Education photo" },
      { key: "commencementCaption", label: "Education photo caption", type: "text", group: "Education photo" },
      { key: "ctaPrimaryLabel", label: "Objectives — main button", type: "text", group: "Buttons" }, { key: "ctaPrimaryHref", label: "Main button link", type: "url", group: "Buttons" },
      { key: "ctaSecondaryLabel", label: "Objectives — second button", type: "text", group: "Buttons" }, { key: "ctaSecondaryHref", label: "Second button link", type: "url", group: "Buttons" },
      { key: "summary", label: "Professional introduction", type: "textarea", group: "Introduction", help: "Leave a blank line between paragraphs." },
      { key: "achievements", label: "Technical achievements (one per line)", type: "lines", group: "Introduction" },
      { key: "focus", label: "Focus areas (cards)", type: "items", addLabel: "Add focus area", group: "Focus areas",
        columns: [{ key: "title", label: "Title", kind: "text" }, { key: "icon", label: "Icon", kind: "select", options: ["Network", "RadioTower", "Code2", "Database", "Server", "ShieldCheck", "Briefcase"] },
          { key: "body", label: "Description", kind: "text", wide: true }, { key: "tags", label: "Tags (comma-separated)", kind: "text", wide: true }, { key: "link", label: "Link (e.g. /projects/…)", kind: "text" }] },
      { key: "interests", label: "Cybersecurity interests", type: "items", columns: [{ key: "title", label: "Title", kind: "text" }, { key: "body", label: "Description", kind: "text", wide: true }], addLabel: "Add interest", group: "Interests & goals" },
      { key: "objectives", label: "Future objectives (one per line)", type: "lines", group: "Interests & goals" },
      { key: "ctaTitle", label: "“Open to opportunities” heading", type: "text", group: "Call to action" }, { key: "ctaText", label: "“Open to opportunities” text", type: "textarea", group: "Call to action" },
    ],
  },
  {
    key: "pages", label: "Page headings", page: "Every page", kind: "object", nav: "Profile & pages", icon: "Heading",
    fields: pageHeadingSlots.map(([key, label]) => ({ key, label, type: "heading" as const, group: label.split(" · ")[0] })),
  },
  {
    key: "experience", label: "Experience", page: "Experience · About · Resume · Home", kind: "list", titleKey: "title", subtitleKey: "company", nav: "Career", icon: "Briefcase",
    blank: () => ({ id: `job-${Date.now()}`, company: "", title: "New position", location: "", start: "", end: null, primary: true, summary: "", highlights: [], groups: [], tags: [], logo: "", website: "" }),
    fields: [
      { key: "title", label: "Job title", type: "text", group: "Position" }, { key: "company", label: "Company", type: "text", group: "Position" }, { key: "location", label: "Location", type: "text", group: "Position" },
      { key: "logo", label: "Company logo", type: "image", help: "Shown on a white tile beside the role. Transparent PNG works best.", group: "Position" },
      { key: "website", label: "Company website", type: "url", help: "The company name and logo link here.", group: "Position" },
      { key: "primary", label: "Show in main timeline", type: "bool", group: "Position" },
      { key: "start", label: "Start (YYYY-MM)", type: "month", group: "Position" }, { key: "end", label: "End (YYYY-MM, empty = present)", type: "month", group: "Position" },
      { key: "summary", label: "Summary", type: "textarea", group: "Position" },
      { key: "groups", label: "Responsibility sections", type: "groups", help: "Each section has a heading and its bullet points. Leave empty to use the simple list below.", group: "Responsibilities" },
      { key: "highlights", label: "Simple responsibilities list (one per line)", type: "lines", help: "Used only when there are no sections above.", group: "Responsibilities" },
      { key: "tags", label: "Tags (comma-separated)", type: "csv", group: "Responsibilities" },
    ],
  },
  {
    key: "education", label: "Education", page: "About · Achievements · Resume", kind: "list", titleKey: "degree", subtitleKey: "school", thumbKey: "image", nav: "Career", icon: "GraduationCap",
    blank: () => ({ degree: "New degree", field: "", school: "", location: "", date: "", gpa: "", note: "", image: "", logo: "", website: "" }),
    fields: [
      { key: "degree", label: "Degree", type: "text" }, { key: "field", label: "Field of study", type: "text" }, { key: "school", label: "School", type: "text" },
      { key: "logo", label: "School logo", type: "image" }, { key: "website", label: "School website", type: "url" },
      { key: "location", label: "Location", type: "text" }, { key: "date", label: "Date", type: "text" }, { key: "gpa", label: "GPA", type: "text" },
      { key: "note", label: "Note (e.g. conferral date, grade)", type: "text" }, { key: "image", label: "Degree certificate", type: "image" },
    ],
  },
  {
    key: "skills", label: "Skills", page: "Skills · Home · Resume", kind: "list", titleKey: "title", nav: "Career", icon: "Cpu",
    blank: () => ({ id: `group-${Date.now()}`, title: "New skill group", blurb: "", icon: "Code2", skills: [] }),
    fields: [
      { key: "title", label: "Group title", type: "text" }, { key: "icon", label: "Icon", type: "select", options: ["Code2", "Database", "RadioTower", "Network", "Server", "Briefcase", "ShieldCheck", "Languages"] },
      { key: "blurb", label: "Description", type: "textarea" },
      { key: "skills", label: "Skills", type: "items", addLabel: "Add skill", help: "Evidence: professional = done in a job · certified = backed by a certificate · working / academic / developing.",
        columns: [{ key: "name", label: "Skill", kind: "text", wide: true }, { key: "evidence", label: "Evidence", kind: "select", options: evidenceLevels }, { key: "note", label: "Note (optional)", kind: "text", wide: true }] },
    ],
  },
  {
    key: "projects", label: "Projects", page: "Projects · Home", kind: "list", titleKey: "title", subtitleKey: "category", nav: "Showcase", icon: "FolderKanban",
    blank: () => ({ slug: `project-${Date.now()}`, title: "New project", category: categories[0], status: "draft", featured: false, context: "", cover: { from: "#14c8f0", to: "#2553d6", motif: "topology" }, overview: "", problem: "", role: "", contributions: [], tech: [], results: [], lessons: [], screenshots: [], documents: [], attachments: [], repo: "", demo: "", relatedPosts: [] }),
    fields: [
      { key: "title", label: "Title", type: "text", group: "Basics" }, { key: "slug", label: "URL slug", type: "text", group: "Basics", help: "Lowercase words joined by dashes — becomes /projects/your-slug" },
      { key: "category", label: "Category", type: "select", options: categories, group: "Basics" }, { key: "status", label: "Status", type: "select", options: ["published", "draft"], group: "Basics" },
      { key: "featured", label: "Feature on the home page", type: "bool", group: "Basics" },
      { key: "context", label: "Context (where / when)", type: "text", group: "Basics" },
      { key: "cover", label: "Cover art", type: "cover", group: "Basics" },
      { key: "overview", label: "Overview", type: "textarea", group: "Story" }, { key: "problem", label: "Problem", type: "textarea", group: "Story" },
      { key: "role", label: "My role", type: "text", group: "Story" },
      { key: "contributions", label: "What I did (one per line)", type: "lines", group: "Story" }, { key: "tech", label: "Technologies (comma-separated)", type: "csv", group: "Story" },
      { key: "results", label: "Results (one per line)", type: "lines", group: "Story" }, { key: "lessons", label: "Lessons learned (one per line)", type: "lines", group: "Story" },
      { key: "demo", label: "Live site / demo URL", type: "url", group: "Media & links" }, { key: "repo", label: "Repository URL", type: "url", group: "Media & links" },
      { key: "screenshots", label: "Screenshots", type: "items", addLabel: "Add screenshot", group: "Media & links", columns: [{ key: "src", label: "Image", kind: "image" }, { key: "caption", label: "Caption", kind: "text", wide: true }] },
      { key: "attachments", label: "Files & media — photos, videos, PDF, Word, Excel, PowerPoint or any file", type: "items", addLabel: "Add file", group: "Media & links", help: "Upload or paste a link. Shown on the project page with previews and downloads.",
        columns: [{ key: "url", label: "File", kind: "file", accept: "*/*", wide: true }, { key: "title", label: "Title", kind: "text" }, { key: "note", label: "Note (optional)", kind: "text" }] },
      { key: "documents", label: "Documents (PDF)", type: "items", addLabel: "Add document", group: "Media & links", help: "PDFs open right on the page.", columns: [{ key: "label", label: "Button text", kind: "text" }, { key: "src", label: "PDF", kind: "file", wide: true }] },
      { key: "relatedPosts", label: "Related blog slugs (comma-separated)", type: "csv", group: "Advanced" },
      { key: "diagram", label: "Network diagram (JSON)", type: "json", group: "Advanced" },
      { key: "snippet", label: "Code snippet (JSON)", type: "json", group: "Advanced", help: "{ \"language\": \"bash\", \"title\": \"…\", \"code\": \"…\", \"note\": \"…\" }" },
    ],
  },
  {
    key: "works", label: "Research showcase", page: "Achievements", kind: "list", titleKey: "title", subtitleKey: "category", thumbKey: "image", nav: "Achievements", icon: "Microscope",
    blank: () => ({ id: `work-${Date.now()}`, title: "New item", category: "Research", org: "", date: "", role: "", summary: "", points: [], metrics: [], image: "", imageCaption: "", document: "", documentLabel: "", link: "", tags: [], featured: false, published: true }),
    fields: [
      { key: "title", label: "Title", type: "text", group: "Basics" }, { key: "category", label: "Category", type: "select", options: workCategories, group: "Basics" },
      { key: "org", label: "Organisation / venue", type: "text", group: "Basics" }, { key: "date", label: "Date", type: "text", group: "Basics" },
      { key: "role", label: "My role", type: "text", group: "Basics" }, { key: "published", label: "Visible on the site", type: "bool", group: "Basics" },
      { key: "summary", label: "Summary", type: "textarea", group: "Details" },
      { key: "points", label: "Key points (one per line)", type: "lines", group: "Details" },
      { key: "metrics", label: "Numbers", type: "items", addLabel: "Add number", group: "Details", columns: [{ key: "value", label: "Value", kind: "text" }, { key: "label", label: "Label", kind: "text", wide: true }] },
      { key: "tags", label: "Tags (comma-separated)", type: "csv", group: "Details" },
      { key: "image", label: "Image / certificate", type: "image", group: "Media" }, { key: "imageCaption", label: "Image caption", type: "text", group: "Media" },
      { key: "document", label: "Document (PDF)", type: "file", group: "Media" }, { key: "documentLabel", label: "Document button text", type: "text", group: "Media" },
      { key: "link", label: "External link", type: "url", group: "Media" }, { key: "featured", label: "Large card", type: "bool", group: "Media" },
    ],
  },
  {
    key: "research", label: "Publication (About & Resume)", page: "About · Resume", kind: "object", nav: "Achievements", icon: "BookOpenText",
    fields: [
      { key: "title", label: "Title", type: "text" }, { key: "venue", label: "Venue", type: "text" }, { key: "sponsor", label: "Sponsor", type: "text" },
      { key: "host", label: "Host", type: "text" }, { key: "year", label: "Year", type: "text" },
      { key: "dateFrom", label: "Conference start date", type: "text" }, { key: "dateTo", label: "Conference end date", type: "text" }, { key: "duration", label: "Duration (e.g. 2 days)", type: "text" },
      { key: "link", label: "Paper (PDF or link)", type: "file", help: "Upload the paper PDF or paste a DOI / IEEE Xplore link." },
      { key: "certificate", label: "Certificate image", type: "image" },
      { key: "abstract", label: "Abstract", type: "textarea" },
    ],
  },
  {
    key: "certifications", label: "Certifications & training", page: "Achievements · Resume", kind: "list", titleKey: "name", subtitleKey: "date", thumbKey: "image", nav: "Achievements", icon: "BadgeCheck",
    blank: () => ({ name: "New certification", listedWith: "", kind: "Networking", date: "", image: "", document: "", summary: "", learned: [], instructor: "", letter: "", letterLabel: "" }),
    fields: [
      { key: "name", label: "Certification / course", type: "text" }, { key: "listedWith", label: "Issuer / institution", type: "text" },
      { key: "kind", label: "Category", type: "select", options: ["Networking", "Cybersecurity", "Web", "IT", "Embedded", "Support", "Professional"] }, { key: "date", label: "Date", type: "text" },
      { key: "instructor", label: "Instructor (optional)", type: "text" },
      { key: "summary", label: "Short description", type: "textarea" },
      { key: "learned", label: "What it covered (one per line)", type: "lines" },
      { key: "image", label: "Certificate image", type: "image" }, { key: "document", label: "Certificate PDF", type: "file" },
      { key: "letter", label: "Second PDF (letter, transcript…)", type: "file" }, { key: "letterLabel", label: "Second PDF button text", type: "text" },
    ],
  },
  {
    key: "awards", label: "Awards & participation", page: "Achievements · About · Home · Resume", kind: "list", titleKey: "event", subtitleKey: "rank", thumbKey: "image", nav: "Achievements", icon: "Trophy",
    blank: () => ({ rank: "Champion", event: "New award", date: "", tier: "gold", detail: "", image: "" }),
    fields: [
      { key: "rank", label: "Rank / result", type: "text" }, { key: "event", label: "Event", type: "text" }, { key: "date", label: "Date", type: "text" },
      { key: "tier", label: "Type", type: "select", options: ["gold", "silver", "honor", "participation"], help: "gold / silver / honor = Awards · participation = “Participation & activities”" },
      { key: "detail", label: "Team / project", type: "text" }, { key: "image", label: "Certificate image", type: "image" },
    ],
  },
];

export const contentNavGroups = ["Site", "Profile & pages", "Career", "Showcase", "Achievements"] as const;

/** Page to open from the editor's “View page” button. */
export const previewPaths: Partial<Record<ContentKey, string>> = {
  layout: "/", scene: "/", sections: "/skills", resume: "/resume", contact: "/contact", site: "/", about: "/about", pages: "/", experience: "/experience",
  education: "/achievements#degrees", skills: "/skills", projects: "/projects", works: "/projects", certifications: "/achievements#certs",
  awards: "/achievements#awards", research: "/achievements",
};
export const sectionByKey = Object.fromEntries(sections.map((s) => [s.key, s])) as Record<ContentKey, Section>;

/* ------------------------------ sanitizing ------------------------------ */

type Obj = Record<string, unknown>;
const str = (v: unknown, max = 5000) => (typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, max);

function cleanItem(fields: Field[], raw: Record<string, unknown>, base: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...base, ...raw };
  for (const f of fields) {
    const v = raw[f.key];
    // A field missing from saved data keeps its default (so new settings don't switch things off).
    if (v === undefined && f.key in base) { out[f.key] = base[f.key]; continue; }
    switch (f.type) {
      case "bool": out[f.key] = Boolean(v); break;
      case "color": out[f.key] = typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : base[f.key] ?? "#3ee6ff"; break;
      case "lines": case "csv": out[f.key] = Array.isArray(v) ? v.map((x) => str(x, 600)).filter(Boolean).slice(0, 60) : []; break;
      case "rows": out[f.key] = Array.isArray(v) ? v.filter((x) => x && typeof x === "object").slice(0, 80).map((r) => Object.fromEntries(f.columns.map((c) => [c, str((r as Record<string, unknown>)[c], 600)]))) : []; break;
      case "select": out[f.key] = f.options.includes(String(v)) ? String(v) : f.options[0]; break;
      case "month": out[f.key] = typeof v === "string" && /^\d{4}-\d{2}$/.test(v) ? v : f.key === "end" ? null : str(v, 7); break;
      case "json": out[f.key] = v === "" || v === undefined || v === null ? base[f.key] : v; break;
      case "items": out[f.key] = Array.isArray(v) ? v.filter((x) => x && typeof x === "object").slice(0, 120).map((r) => Object.fromEntries(f.columns.map((c) => {
        const raw = str((r as Obj)[c.key], 600).trim();
        if (c.kind === "image" || c.kind === "file") return [c.key, /^(https?:\/\/|\/|blob:)/i.test(raw) ? raw : ""];
        if (c.kind === "select" && c.options) return [c.key, c.options.includes(raw) ? raw : c.options[0]];
        if (c.kind === "toggle") return [c.key, raw === "no" ? "no" : "yes"];
        if (c.kind === "color") return [c.key, /^#[0-9a-f]{6}$/i.test(raw) ? raw : "#3ee6ff"];
        return [c.key, raw];
      }))).filter((r) => Object.values(r).some(Boolean)) : []; break;
      case "cover": { const c = (v && typeof v === "object" ? v : base[f.key] ?? {}) as Obj; const hex = (x: unknown, d: string) => (typeof x === "string" && /^#[0-9a-f]{6}$/i.test(x) ? x : d);
        const img = typeof c.image === "string" && /^(https?:\/\/|\/|blob:)/i.test(c.image) ? c.image.slice(0, 600) : "";
        out[f.key] = { from: hex(c.from, "#14c8f0"), to: hex(c.to, "#2553d6"), motif: (coverMotifs as readonly string[]).includes(String(c.motif)) ? c.motif : "topology", ...(img ? { image: img } : {}) }; break; }
      case "groups": out[f.key] = Array.isArray(v) ? v.filter((g) => g && typeof g === "object").slice(0, 20).map((g) => ({ title: str((g as Obj).title, 200), items: Array.isArray((g as Obj).items) ? ((g as Obj).items as unknown[]).map((x) => str(x, 600)).filter(Boolean).slice(0, 60) : [] })).filter((g) => g.title || g.items.length) : []; break;
      case "heading": { const g = (v && typeof v === "object" ? v : base[f.key] ?? {}) as Obj; out[f.key] = { eyebrow: str(g.eyebrow, 120), title: str(g.title, 300), accent: str(g.accent, 300), text: str(g.text, 2000) }; break; }
      case "url": case "file": case "image": { const u = str(v, 600).trim(); out[f.key] = /^(https?:\/\/|\/|mailto:|tel:|blob:)/i.test(u) ? u : ""; break; }
      default: out[f.key] = str(v, f.type === "textarea" ? 5000 : 400);
    }
  }
  return out;
}

/** Coerces admin input into the expected shape for a section. Throws on structural errors. */
export function sanitizeSection(key: ContentKey, value: unknown): unknown {
  const s = sectionByKey[key];
  if (!s) throw new Error("Unknown section");
  if (JSON.stringify(value ?? null).length > 400_000) throw new Error("Content is too large");
  if (s.kind === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object");
    return cleanItem(s.fields, value as Record<string, unknown>, defaultContent[key] as unknown as Record<string, unknown>);
  }
  if (!Array.isArray(value)) throw new Error("Expected a list");
  return value.slice(0, 200).map((item) => cleanItem(s.fields, (item ?? {}) as Record<string, unknown>, s.blank?.() ?? {}));
}

export function mergeContent(rows: { key: string; value: unknown }[]): Content {
  const c: Content = { ...defaultContent };
  for (const r of rows) {
    if (!(r.key in sectionByKey)) continue;
    try { (c as Record<string, unknown>)[r.key] = sanitizeSection(r.key as ContentKey, r.value); } catch { /* keep default */ }
  }
  return c;
}
