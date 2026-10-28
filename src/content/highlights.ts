/** Home-page credential & impact cards. Admin-added cards (/admin → Highlights) are stored in Supabase. */
export type Highlight = { id: string; value: string; label: string; source: string; tag: string; icon: HighlightIcon; hue: string };
export const highlightIconGroups = {
  Education: ["graduation", "book", "award", "trophy", "certificate", "lightbulb"],
  Networking: ["network", "cable", "router", "wifi", "globe", "radar", "radio", "smartphone"],
  Cybersecurity: ["shield", "shieldLock", "shieldAlert", "lock", "key", "fingerprint", "bug", "scan", "eye", "siren", "firewall", "terminal"],
  Infrastructure: ["server", "database", "cloud", "cpu", "harddrive", "wrench"],
  Work: ["workflow", "code", "briefcase", "users", "zap", "rocket"],
} as const;
export type HighlightIcon = (typeof highlightIconGroups)[keyof typeof highlightIconGroups][number];
export const highlightIcons = Object.values(highlightIconGroups).flat() as HighlightIcon[];

export const highlightColors: { name: string; hue: string }[] = [
  { name: "Violet", hue: "#a78bfa" }, { name: "Indigo", hue: "#818cf8" }, { name: "Blue", hue: "#4f8cff" }, { name: "Sky", hue: "#38bdf8" },
  { name: "Cyan", hue: "#3ee6ff" }, { name: "Teal", hue: "#2dd4bf" }, { name: "Green", hue: "#34d399" }, { name: "Matrix", hue: "#22ff88" },
  { name: "Lime", hue: "#a3e635" }, { name: "Gold", hue: "#facc15" }, { name: "Amber", hue: "#fbbf24" }, { name: "Orange", hue: "#fb923c" },
  { name: "Red", hue: "#f87171" }, { name: "Alert red", hue: "#ff3b5c" }, { name: "Rose", hue: "#fb7185" }, { name: "Pink", hue: "#f472b6" },
  { name: "Fuchsia", hue: "#e879f9" }, { name: "Silver", hue: "#cbd5e1" },
];

export const defaultHighlights: Highlight[] = [
  { id: "mas", value: "M.A.S.", label: "Computer Security & Forensic Administration", source: "Fairleigh Dickinson University · 2025", tag: "Master’s", icon: "graduation", hue: "#a78bfa" },
  { id: "bsc", value: "B.Sc.", label: "Computer Science & Engineering", source: "Metropolitan University · 2019", tag: "Bachelor’s", icon: "book", hue: "#4f8cff" },
  { id: "ccna", value: "CCNA", label: "Cisco Routing and Switching", source: "Certification", tag: "Certified", icon: "network", hue: "#3ee6ff" },
  { id: "sites", value: "20+", label: "Restaurant sites cabled & networked", source: "Great River / NCR Voyix project", tag: "Field", icon: "cable", hue: "#34d399" },
  { id: "orders", value: "20+", label: "Network-focused field work orders", source: "Omnivir · Field Nation", tag: "Field", icon: "workflow", hue: "#fbbf24" },
];
