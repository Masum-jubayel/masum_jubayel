"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

const safeUrl = (u?: string) => (u && /^https?:\/\//.test(u) ? u : "");
const initials = (name: string) => name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/** Company / school logo on a white tile, linking to its website. Falls back to initials. */
export function CompanyLogo({ name, logo, website, hue = "#3ee6ff", className = "h-12 w-12" }: { name: string; logo?: string; website?: string; hue?: string; className?: string }) {
  const href = safeUrl(website);
  const tile = logo ? (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1.5 shadow-[0_0_16px_var(--hue)] ring-1 ring-white/20 transition-transform duration-300 group-hover/logo:scale-110 ${className}`} style={{ ["--hue" as string]: `${hue}55` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt={`${name} logo`} className="h-full w-full object-contain" loading="lazy" />
    </span>
  ) : (
    <span className={`grid shrink-0 place-items-center rounded-xl border font-display text-sm font-bold ${className}`} style={{ color: hue, borderColor: `${hue}55`, background: `${hue}12` }}>{initials(name)}</span>
  );
  if (!href) return tile;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} website`} title={`Visit ${name}`} className="group/logo shrink-0" onClick={(e) => e.stopPropagation()}>
      {tile}
    </a>
  );
}

/** Company / school name that links to its website when one is set. */
export function CompanyName({ name, website, icon, className = "" }: { name: string; website?: string; icon?: ReactNode; className?: string }) {
  const href = safeUrl(website);
  if (!href) return <span className={`inline-flex items-center gap-1.5 ${className}`}>{icon}{name}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`group/name inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:text-cyan-200 hover:underline ${className}`}>
      {icon}{name}<ArrowUpRight className="h-3 w-3 opacity-60 transition-transform group-hover/name:-translate-y-0.5 group-hover/name:translate-x-0.5" aria-hidden />
    </a>
  );
}
