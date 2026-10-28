import { Github, Linkedin, Link2, Instagram, Facebook } from "lucide-react";
import { site } from "@/lib/site";

/** Renders only links that are configured. Unconfigured links show as a muted "pending" chip when showPending is set. */
export function SocialLinks({ compact = false, showPending = false }: { compact?: boolean; showPending?: boolean }) {
  const items = [
    { label: "LinkedIn", href: site.contact.linkedin, Icon: Linkedin },
    { label: "GitHub", href: site.contact.github, Icon: Github },
    { label: "Instagram", href: site.contact.instagram, Icon: Instagram },
    { label: "Facebook", href: site.contact.facebook, Icon: Facebook },
    ...site.contact.other.map((o) => ({ ...o, Icon: Link2 })),
  ];
  return (
    <>
      {items.map(({ label, href, Icon }) =>
        href ? (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="chip hover:border-cyan-400/40 hover:text-mist-100">
            <Icon className="h-3.5 w-3.5" aria-hidden /> {compact ? label : `${label} profile`}
          </a>
        ) : showPending ? (
          <span key={label} className="chip border-dashed opacity-60" title="Link not configured yet">
            <Icon className="h-3.5 w-3.5" aria-hidden /> {label} — link pending
          </span>
        ) : null,
      )}
    </>
  );
}
