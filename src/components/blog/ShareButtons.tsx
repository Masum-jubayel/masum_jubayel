"use client";

import { Linkedin, Mail, Share2, Twitter } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const links = [
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: Linkedin },
    { label: "Share on X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, Icon: Twitter },
    { label: "Share by email", href: `mailto:?subject=${t}&body=${u}`, Icon: Mail },
  ];
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-mist-500"><Share2 className="h-3.5 w-3.5" aria-hidden /> Share</span>
      {links.map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-mist-300 hover:border-cyan-400/40 hover:text-cyan-200"><Icon className="h-3.5 w-3.5" aria-hidden /></a>
      ))}
      <CopyButton text={url} label="Copy link" />
    </div>
  );
}
