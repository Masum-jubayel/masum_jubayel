/**
 * Central site configuration.
 * Edit this file to change contact links, the resume file, or hero options.
 * Empty strings are treated as "not provided yet" and render as labeled placeholders.
 */
export const site = {
  name: "Masum Mohammad Jubayel",
  shortName: "Masum Jubayel",
  title: "Lead IT Support & Network Administrator",
  positioning: "Network Infrastructure | Web Development & Programming | IT Systems | Cybersecurity",
  location: "Grande Prairie, Alberta, Canada",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description:
    "Portfolio of Masum Mohammad Jubayel — Lead IT Support & Network Administrator with hands-on experience in Cisco networking, IT infrastructure, structured cabling and device provisioning, developing a specialization in cybersecurity.",

  hero: {
    headline: "Engineering Networks. Securing the Digital World.",
    intro:
      "I’m Masum Mohammad Jubayel, a Lead IT Support & Network Administrator with a Master of Administrative Science in Computer Security and Forensic Administration, a B.Sc. in Computer Science and Engineering, and Cisco CCNA Routing and Switching certification. I bring hands-on experience in networking, IT infrastructure, systems administration and device provisioning, and I build real web applications — company websites, admin dashboards and interactive documentation — while advancing my expertise in cybersecurity.",
    /** Optional: drop a .glb into /public/models and set the path to replace the built-in stylized engineer. */
    characterModelUrl: "" as string,
    /** Optional cover image (public path). Shown as a subtle backdrop behind the hero when set. */
    coverImage: "" as string,
  },

  /** Replace /public/resume/Masum_Mohammad_Jubayel_Resume.pdf (or change this path) to update the resume without code changes. */
  resumePath: process.env.NEXT_PUBLIC_RESUME_URL || "/resume/Masum_Mohammad_Jubayel_Resume.pdf",

  /** Profile photo (public path). Leave empty to show a labeled placeholder. */
  profilePhoto: "/images/profile.jpg" as string,

  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "masumjubayel@gmail.com",
    phone: process.env.NEXT_PUBLIC_PHONE || "+1 778 998 6849",
    workEmail: process.env.NEXT_PUBLIC_WORK_EMAIL || "masum@expertmobile.ca",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/in/masum-mohammad-jubayel-a27362137",
    github: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/Masum-jubayel",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/masum_jubayel",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/share/1CFwja6A2u/",
    other: [] as { label: string; href: string }[],
  },
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Me" },
  { href: "/skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/resume", label: "Resume" },
  { href: "/gallery", label: "Gallery" },
  { href: "/achievements", label: "Achievements" },
  { href: "/contact", label: "Contact" },
] as const;
