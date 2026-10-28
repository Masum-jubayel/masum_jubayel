"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Briefcase, Camera, FileText, GraduationCap, Linkedin, Mail, MapPin, Newspaper } from "lucide-react";
import type { Memory } from "@/content/memories";
import type { SiteInfo } from "@/content/cms";
import { MemoryFeed, MemoryPhotos } from "./MemoryFeed";
import { cn } from "@/lib/utils";
import { LookImg } from "@/components/ui/LookMedia";

const ease = [0.22, 1, 0.36, 1] as const;
const coverH: Record<string, string> = { compact: "h-36 sm:h-48", normal: "h-40 sm:h-60", tall: "h-48 sm:h-80", "extra tall": "h-56 sm:h-[26rem]" };

/** LinkedIn-style profile page for the Memories feed: cover photo, profile photo, intro card and tabs. */
export function MemoriesProfile({ memories, site, current, education }: { memories: Memory[]; site: SiteInfo; current: string; education: string }) {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<"posts" | "photos">("posts");
  const list = memories.filter((m) => m.published !== false);
  const photos = list.reduce((n, m) => n + m.images.length, 0);
  return (
    <div className="pb-16 pt-20">
      <div className="container-x">
        <Link href="/gallery" className="btn-ghost -ml-3 mb-4 text-sm"><ArrowLeft className="h-4 w-4" aria-hidden /> Gallery</Link>

        {/* Profile header */}
        <motion.section className="glass overflow-hidden" initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <div className={cn("relative overflow-hidden", coverH[site.coverHeight] ?? coverH.tall)}>
            {site.coverPhoto ? (
              <motion.img src={site.coverPhoto} alt="" className="h-full w-full object-cover" style={{ objectPosition: `50% ${site.coverPosition || "20%"}` }} initial={reduce ? false : { scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease }} />
            ) : <div className="h-full w-full bg-gradient-to-br from-cyan-500/40 via-violet-600/40 to-emerald-500/30" />}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" aria-hidden />
          </div>
          <div className="relative px-5 pb-6 sm:px-8">
            <motion.div className="-mt-16 sm:-mt-20" initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.3 }}>
              <span className="relative inline-block rounded-full p-1">
                <span aria-hidden className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#3ee6ff,#a78bfa,#22ff88,#fbbf24,#3ee6ff)] ${reduce ? "" : "animate-[spin_6s_linear_infinite]"}`} />
                <img src={site.profilePhoto} alt={`${site.name}`} className="relative h-28 w-28 rounded-full border-4 border-ink-950 object-cover object-top sm:h-36 sm:w-36" />
                <span className="absolute bottom-3 right-3 h-5 w-5 rounded-full border-4 border-ink-950 bg-emerald-400" aria-hidden />
              </span>
            </motion.div>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold sm:text-3xl">{site.name}</h1>
                <p className="mt-1 text-mist-200">{site.title}</p>
                <p className="mt-1 text-sm text-mist-400">{site.positioning}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mist-400">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{site.location}</span>
                  <span className="text-cyan-300">{list.length} posts · {photos} photos</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {site.linkedin && <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="btn-primary py-2"><Linkedin className="h-4 w-4" aria-hidden /> Connect</a>}
                <Link href="/contact" className="btn-secondary py-2"><Mail className="h-4 w-4" aria-hidden /> Message</Link>
                <Link href="/resume" className="btn-ghost py-2"><FileText className="h-4 w-4" aria-hidden /> Resume</Link>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Intro card */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <motion.section className="glass p-5" initial={reduce ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6, ease }}>
              <h2 className="text-base font-semibold">Intro</h2>
              <ul className="mt-4 space-y-3 text-sm text-mist-300">
                <li className="flex gap-2.5"><Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />{current}</li>
                {education && <li className="flex gap-2.5"><GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />{education}</li>}
                <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />{site.location}</li>
              </ul>
            </motion.section>
            <motion.section className="glass p-5" initial={reduce ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6, ease }}>
              <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Photos</h2><button type="button" onClick={() => setTab("photos")} className="text-xs text-cyan-300 hover:underline">See all</button></div>
              <div className="mt-3 grid grid-cols-3 gap-1 overflow-hidden rounded-lg">
                {list.flatMap((m) => m.images).slice(0, 9).map((src, i) => <span key={src + i} className="relative block aspect-square overflow-hidden"><LookImg src={src} alt="" className="h-full w-full object-cover" /></span>)}
              </div>
            </motion.section>
          </aside>

          {/* Tabs + feed */}
          <div className="min-w-0">
            <div className="glass mb-5 flex gap-1 p-1.5" role="tablist" aria-label="Profile sections">
              {([["posts", "Posts", Newspaper, list.length], ["photos", "Photos", Camera, photos]] as const).map(([k, l, I, n]) => (
                <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                  className={cn("relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm transition-colors", tab === k ? "text-cyan-100" : "text-mist-400 hover:text-mist-100")}>
                  {tab === k && <motion.span layoutId="mem-tab" className="absolute inset-0 rounded-xl border border-cyan-400/40 bg-cyan-400/10" />}
                  <I className="relative h-4 w-4" aria-hidden /><span className="relative">{l}</span><span className="relative font-mono text-[10px] text-mist-500">{n}</span>
                </button>
              ))}
            </div>
            {tab === "posts" ? <MemoryFeed memories={list} name={site.name} avatar={site.profilePhoto} limit={10} wide /> : <MemoryPhotos memories={list} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Gallery-page Memories section: profile card · feed · photos & intro — fills the width like a social profile. */
export function MemoriesSpotlight({ memories, site, current, education }: { memories: Memory[]; site: SiteInfo; current: string; education: string }) {
  const reduce = useReducedMotion();
  const list = memories.filter((m) => m.published !== false);
  const pics = list.flatMap((m) => m.images);
  const side = (dir: number, delay = 0) => ({ initial: reduce ? false : { opacity: 0, x: dir * 30 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay, ease } });
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_280px]">
      {/* Left: profile card */}
      <aside className="order-1 space-y-4 lg:sticky lg:top-24 lg:self-start">
        <motion.section {...side(-1)} className="glass overflow-hidden">
          <div className="relative h-24 overflow-hidden">
            {site.coverPhoto ? <img src={site.coverPhoto} alt="" className="h-full w-full object-cover" style={{ objectPosition: `50% ${site.coverPosition || "20%"}` }} /> : <div className="h-full w-full bg-gradient-to-br from-cyan-500/40 to-violet-600/40" />}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" aria-hidden />
          </div>
          <div className="px-5 pb-5 text-center">
            <span className="relative -mt-11 inline-block rounded-full p-[3px]">
              <span aria-hidden className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#3ee6ff,#a78bfa,#22ff88,#fbbf24,#3ee6ff)] ${reduce ? "" : "animate-[spin_6s_linear_infinite]"}`} />
              <img src={site.profilePhoto} alt={site.name} className="relative h-20 w-20 rounded-full border-4 border-ink-950 object-cover object-top" />
              <span className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-[3px] border-ink-950 bg-emerald-400" aria-hidden />
            </span>
            <h3 className="mt-2 font-semibold">{site.name}</h3>
            <p className="mt-0.5 text-xs text-mist-400">{site.title}</p>
            <div className="mt-4 grid grid-cols-2 divide-x divide-white/10 rounded-xl border border-white/10 py-2">
              <div><p className="font-display text-lg font-semibold text-cyan-300">{list.length}</p><p className="font-mono text-[9px] uppercase tracking-widest text-mist-500">Posts</p></div>
              <div><p className="font-display text-lg font-semibold text-violet-300">{pics.length}</p><p className="font-mono text-[9px] uppercase tracking-widest text-mist-500">Photos</p></div>
            </div>
            <div className="mt-4 grid gap-2">
              <Link href="/gallery/memories" className="btn-primary justify-center py-2 text-sm">View profile</Link>
              {site.linkedin && <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-center py-2 text-sm"><Linkedin className="h-4 w-4" aria-hidden /> Connect</a>}
            </div>
          </div>
        </motion.section>
        <motion.section {...side(-1, 0.1)} className="glass hidden p-5 lg:block xl:hidden">
          <IntroList current={current} education={education} location={site.location} />
        </motion.section>
      </aside>

      {/* Center: feed */}
      <div className="order-2 min-w-0">
        <MemoryFeed memories={list} name={site.name} avatar={site.profilePhoto} limit={2} moreHref="/gallery/memories" wide />
      </div>

      {/* Right: intro + photos */}
      <aside className="order-3 space-y-4 lg:col-span-2 xl:col-span-1 xl:sticky xl:top-24 xl:self-start">
        <motion.section {...side(1)} className="glass p-5 lg:hidden xl:block">
          <IntroList current={current} education={education} location={site.location} />
        </motion.section>
        {pics.length > 0 && (
          <motion.section {...side(1, 0.1)} className="glass p-5">
            <div className="flex items-center justify-between"><h3 className="text-base font-semibold">Photos</h3><Link href="/gallery/memories" className="text-xs text-cyan-300 hover:underline">See all</Link></div>
            <div className="mt-3 grid grid-cols-3 gap-1 overflow-hidden rounded-lg lg:grid-cols-6 xl:grid-cols-3">
              {pics.slice(0, 9).map((src, i) => (
                <motion.img key={src + i} src={src} alt="" className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-110"
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.05 }} />
              ))}
            </div>
          </motion.section>
        )}
      </aside>
    </div>
  );
}

function IntroList({ current, education, location }: { current: string; education: string; location: string }) {
  return (
    <>
      <h3 className="text-base font-semibold">Intro</h3>
      <ul className="mt-4 space-y-3 text-sm text-mist-300">
        <li className="flex gap-2.5"><Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />{current}</li>
        {education && <li className="flex gap-2.5"><GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />{education}</li>}
        <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />{location}</li>
      </ul>
    </>
  );
}
