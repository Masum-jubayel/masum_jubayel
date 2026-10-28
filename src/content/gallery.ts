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
