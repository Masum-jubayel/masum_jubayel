import { Facebook, Github, Instagram, Linkedin, Mail, Phone, Briefcase } from "lucide-react";
import type { SiteInfo } from "@/content/cms";
import { cn } from "@/lib/utils";

/** Brand-coloured, gently floating social buttons. Hover fills with the brand colour. */

export function SocialButtons({ info, withContact = false, size = "md" }: { info: SiteInfo; withContact?: boolean; size?: "md" | "lg" }) {
  const brands = [
    { label: "LinkedIn", href: info.linkedin, Icon: Linkedin, color: "#0A66C2", fill: "#0A66C2" },
    { label: "GitHub", href: info.github, Icon: Github, color: "#e6edf3", fill: "#24292f" },
    { label: "Instagram", href: info.instagram, Icon: Instagram, color: "#E4405F", fill: "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)" },
    { label: "Facebook", href: info.facebook, Icon: Facebook, color: "#1877F2", fill: "#1877F2" },
  ];
  
  const box = size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const items = [
    ...brands.filter((b) => b.href),
    ...(withContact
      ? [
          { label: `Phone ${info.phone}`, href: `tel:${info.phone.replace(/\s/g, "")}`, Icon: Phone, color: "#34d399", fill: "#059669" },
          { label: `Work email ${info.workEmail}`, href: `mailto:${info.workEmail}`, Icon: Briefcase, color: "#fbbf24", fill: "#b45309" },
          { label: `Email ${info.email}`, href: `mailto:${info.email}`, Icon: Mail, color: "#3ee6ff", fill: "#0ea2c9" },
        ]
      : []),
  ];
  return (
    <ul className="flex flex-wrap gap-2.5" aria-label="Social profiles and contact">
      {items.map(({ label, href, Icon, color, fill }, i) => (
        <li key={label} className="social-float" style={{ animationDelay: `${i * 0.35}s` }}>
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={label}
            title={label}
            className={cn("social-btn group relative grid place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]", box)}
            style={{ ["--brand" as string]: color, ["--brand-fill" as string]: fill }}
          >
            <span className="social-fill absolute inset-0" aria-hidden />
            <Icon className="relative h-[18px] w-[18px] transition-all duration-300 group-hover:scale-110 group-hover:text-white" style={{ color }} aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
