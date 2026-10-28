import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { getContent } from "@/lib/content";
import { NeuralPortrait } from "@/components/gallery/NeuralPortrait";
import { SocialButtons } from "@/components/ui/SocialButtons";
import { PingLine } from "@/components/layout/PingLine";
import { Reveal } from "@/components/ui/Reveal";
import { menuItems } from "@/content/cms";


export async function Footer() {
  const { site, layout } = await getContent();
  const items = menuItems(layout);
  return (
    <footer className="relative mt-24 border-t border-white/[0.06] bg-ink-950/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_auto]">
        <Reveal>
          <div className="flex flex-wrap items-center gap-5">
            {layout.footerPortrait && <NeuralPortrait hud={false} className="relative h-36 w-40 shrink-0" />}
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">{site.name}</p>
              <p className="text-sm text-cyan-300">{site.title}</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-mist-400">{site.positioning}</p>
          {layout.footerSocial && <div className="mt-5"><SocialButtons info={site} withContact /></div>}
          <p className="mt-4 flex flex-col gap-1 font-mono text-[11px] text-mist-400 sm:flex-row sm:gap-4">
            <span>{site.phone}</span>
            <span>{site.email}</span>
            <span>{site.workEmail} <span className="text-mist-600">(work)</span></span>
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <nav aria-label="Footer">
            <p className="eyebrow mb-3">Navigate</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {items.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-mist-400 hover:text-mist-100">{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>
        <div className="flex md:justify-end">
          <a href="#top" className="btn-secondary h-11 self-start" aria-label="Back to top">
            <ArrowUp className="h-4 w-4" aria-hidden /> Top
          </a>
        </div>
      </div>
      <div className="border-t border-white/[0.04]">
        <div className="container-x flex flex-col justify-between gap-2 py-5 font-mono text-[11px] text-mist-500 sm:flex-row sm:items-center">
          <span data-admin-tap="1" className="select-none">© {new Date().getFullYear()} {site.name}{layout.footerNote ? ` · ${layout.footerNote}` : ""}</span>
          <PingLine />
        </div>
      </div>
    </footer>
  );
}
