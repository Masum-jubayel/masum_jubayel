/**
 * "Memories" — social-style posts on the Gallery page (status + photos), managed in /admin → Memories.
 * These seeds are shown until the database has posts (supabase/schema.sql inserts the same ones).
 */
export type Memory = {
  id: string;
  body: string;
  images: string[];
  location: string;
  feeling: string;
  date: string; // ISO
  pinned: boolean;
  published: boolean;
  /** Photo layout: "fill" crops to the grid, "fit" shows the whole picture. */
  photoFit?: PhotoFit;
  /** Which part of a cropped photo stays visible. */
  photoFocus?: PhotoFocus;
  /** Height of the photo area. */
  photoSize?: PhotoSize;
};

export type PhotoFit = "fill" | "fit";
export type PhotoFocus = "top" | "center" | "bottom";
export type PhotoSize = "compact" | "normal" | "large";
export const photoFits: PhotoFit[] = ["fill", "fit"];
export const photoFocuses: PhotoFocus[] = ["top", "center", "bottom"];
export const photoSizes: PhotoSize[] = ["compact", "normal", "large"];

export const memoryFeelings = ["", "proud", "grateful", "excited", "accomplished", "motivated", "happy", "thankful", "inspired"] as const;

export const seedMemories: Memory[] = [
  {
    id: "seed-jarvis",
    body: "Meet Jarvis 🤖 — my personal AI agent. It plans a task, uses tools (browser, files, spreadsheets, scripts), checks its own work and asks before anything irreversible. It also inspired the new Jarvis theme on this site — try the switch at the top!",
    images: ["/images/projects/jarvis-ai-agent.jpg"],
    location: "Grande Prairie, Alberta",
    feeling: "excited",
    date: "2026-10-30T18:00:00.000Z",
    pinned: false,
    published: true,
  },
  {
    id: "seed-portfolio-live",
    body: "My portfolio is live! Built with Next.js, Supabase and Tailwind, hosted free on Vercel — with an admin console, photo editor and three themes (Dark, Light, Jarvis).",
    images: ["/images/projects/portfolio-dark.jpg", "/images/projects/portfolio-jarvis.jpg"],
    location: "Grande Prairie, Alberta",
    feeling: "proud",
    date: "2026-10-29T18:00:00.000Z",
    pinned: false,
    published: true,
  },
  {
    id: "seed-poc-sim",
    body: "Shipped the POC Ops Center 📡 — one command dashboard for 217 companies, 2,667 push-to-talk radios and 2,951 carrier SIMs across Inrico, Telus Jasper, Simplex, Hologram and Mobilewave. It matches every radio to its SIM, explains every mismatch, tracks licences before they expire and showed us 206 idle SIMs (~$2,050/month) to clean up.",
    images: ["/images/projects/poc-ops-center-overview.jpg"],
    location: "Expert Mobile Communications",
    feeling: "accomplished",
    date: "2026-10-28T18:00:00.000Z",
    pinned: false,
    published: true,
  },
  {
    id: "seed-install-board",
    body: "New Install Board is running: live Day/Week/Month views for our installers, slot locks so no more double bookings, rentals tracking and reports.",
    images: ["/images/projects/install-board.jpg"],
    location: "Expert Mobile Communications",
    feeling: "motivated",
    date: "2026-10-26T18:00:00.000Z",
    pinned: false,
    published: true,
  },
  {
    id: "seed-bc680",
    body: "Delivered the BC680 body-cam backup system: three hash-verified copies of every recording across two offices, checked every 2 minutes, with a full rebuild guide and staff training.",
    images: ["/images/projects/bc680-overview.jpg", "/images/projects/bc680-guide.jpg"],
    location: "Expert Mobile Communications",
    feeling: "accomplished",
    date: "2026-10-24T18:00:00.000Z",
    pinned: false,
    published: true,
  },
  {
    id: "seed-emc-site",
    body: "Refreshed the Expert Mobile website — “Everything wireless. Under one roof.” Single-file build, built-in admin panel and a live push-to-talk console demo.",
    images: ["/images/projects/expert-mobile-home.jpg", "/images/projects/expert-mobile-section.jpg"],
    location: "Grande Prairie, Alberta",
    feeling: "happy",
    date: "2026-10-20T18:00:00.000Z",
    pinned: false,
    published: true,
  },
  {
    id: "seed-graduation",
    body: "Graduation day! 🎓 Proud to have completed my Master of Administrative Science in Computer Security and Forensic Administration at Fairleigh Dickinson University. Thank you to my family, professors and friends who supported me throughout this journey.",
    images: ["/images/gallery/commencement.jpg", "/images/gallery/graduation-portrait.jpg"],
    location: "Fairleigh Dickinson University, Vancouver",
    feeling: "proud",
    date: "2025-05-20T18:00:00.000Z",
    pinned: true,
    published: true,
    photoFit: "fill",
    photoFocus: "top",
    photoSize: "large",
  },
  {
    id: "seed-iciet",
    body: "Throwback to presenting our research “Risk Prediction of Stroke at The Early Stage Using Data Mining Techniques” at the 2nd International Conference on Innovation in Engineering and Technology (ICIET-2019), University of Dhaka.",
    images: ["/images/works/iciet-2019-certificate.jpg"],
    location: "University of Dhaka, Bangladesh",
    feeling: "grateful",
    date: "2019-12-24T10:00:00.000Z",
    pinned: false,
    published: true,
  },
  {
    id: "seed-hackathon",
    body: "Champion of the Software Hackathon at LICT SUST Techfest 2019 with team MU-EDU GEN. Two days of building, debugging and very little sleep — worth every minute.",
    images: ["/images/certificates/sust-techfest-2019-hackathon-champion.jpg"],
    location: "Shahjalal University of Science & Technology, Sylhet",
    feeling: "excited",
    date: "2019-04-20T15:00:00.000Z",
    pinned: false,
    published: true,
  },
];
