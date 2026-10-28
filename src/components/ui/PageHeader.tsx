import type { ReactNode } from "react";
import { NetworkBackdrop } from "@/components/ui/NetworkBackdrop";
import { Reveal } from "@/components/ui/Reveal";

export function PageHeader({ eyebrow, title, children, aside }: { eyebrow: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="relative pb-14 pt-32 sm:pt-36">
      {/* Background layers fade out softly into the page below — no hard edge. */}
      <div aria-hidden className="hdr-fade pointer-events-none absolute inset-x-0 top-0 -bottom-24 overflow-hidden">
        <span className="hdr-orb a" /><span className="hdr-orb b" /><span className="hdr-orb c" />
        <span className="hdr-sweep" />
        <div className="grid-bg grid-pan absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <NetworkBackdrop className="absolute inset-0 opacity-80" density={0.00012} interactive />
      </div>
      <span className="hdr-beam" aria-hidden />
      <div className="container-x relative grid grid-cols-1 items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <Reveal><p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-cyan-400/50" aria-hidden />{eyebrow}</p></Reveal>
          <Reveal delay={0.08}><h1 className="mt-4 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h1></Reveal>
          {children && <Reveal delay={0.16}><div className="mt-5 max-w-2xl text-base leading-relaxed text-mist-300 sm:text-lg">{children}</div></Reveal>}
        </div>
        {aside && <Reveal delay={0.24}>{aside}</Reveal>}
      </div>
    </section>
  );
}
