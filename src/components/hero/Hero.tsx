"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Activity, ArrowRight, ChevronDown, FileText, MapPin } from "lucide-react";
import { site } from "@/lib/site";
import { defaultLayout, defaultScene, type LayoutInfo, type SceneInfo, type SiteInfo } from "@/content/cms";
import { HeroScene } from "./HeroScene";
import { NetworkBackdrop } from "@/components/ui/NetworkBackdrop";

/** Rotating role line under the name. */
function RoleRotator({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => { if (reduce) return; const t = setInterval(() => setI((n) => (n + 1) % roles.length), 2600); return () => clearInterval(t); }, [roles.length, reduce]);
  return (
    <span className="relative inline-flex h-5 overflow-hidden align-middle">
      {roles.map((r, k) => (
        <motion.span key={r} className="absolute left-0 whitespace-nowrap text-cyan-300" initial={false} animate={{ y: k === i ? 0 : k === (i - 1 + roles.length) % roles.length ? -22 : 22, opacity: k === i ? 1 : 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>{r}</motion.span>
      ))}
      <span className="invisible whitespace-nowrap">{roles.reduce((a, b) => (a.length > b.length ? a : b))}</span>
    </span>
  );
}

/** Button that leans toward the cursor. */
function Magnetic({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 15 }), sy = useSpring(y, { stiffness: 250, damping: 15 });
  return (
    <motion.span className="inline-flex" style={{ x: sx, y: sy }}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.25); y.set((e.clientY - r.top - r.height / 2) * 0.35); }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.span>
  );
}

export function Hero({ info, layout = defaultLayout, scene = defaultScene }: { info: SiteInfo; layout?: LayoutInfo; scene?: SceneInfo }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const introY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const introO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const sceneS = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const fade = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] as const } });

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-16" aria-labelledby="hero-title">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"><span className="hdr-orb a" /><span className="hdr-orb b" /><span className="hdr-orb c" /><span className="hdr-sweep" /></div>
      {site.hero.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={site.hero.coverImage} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.12]" />
      )}
      <div className="grid-bg absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_60%_40%,black_20%,transparent_70%)]" aria-hidden />
      <NetworkBackdrop className="absolute inset-0 -z-10 h-full w-full opacity-50" interactive />

      <div className="container-x grid grid-cols-1 min-h-[calc(100svh-4rem)] items-center gap-6 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.1fr)] lg:gap-4 lg:py-0">
        {/* Intro */}
        <motion.div className="relative z-10 order-2 lg:order-1" style={reduce ? undefined : { y: introY, opacity: introO }}>
          <motion.div {...fade(0.05)} className="flex flex-wrap items-center gap-2">
            <span className="chip border-cyan-400/30 text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-cyan-400" aria-hidden /> {info.title}
            </span>
            <span className="chip"><MapPin className="h-3 w-3" aria-hidden /> Alberta, Canada</span>
          </motion.div>

          <motion.div {...fade(0.12)} className="mt-6 flex items-center gap-3">
            {info.profilePhoto && (
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-ink-950">
                <Image src={info.profilePhoto} alt="" fill sizes="44px" className="object-cover object-top" priority />
              </span>
            )}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-mist-400">{info.name}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em]">{layout.heroRoles.length > 0 && <RoleRotator roles={layout.heroRoles} />}</p>
            </div>
          </motion.div>
          <motion.h1 id="hero-title" className="mt-3 text-[2.4rem] font-semibold leading-[1.04] sm:text-6xl xl:text-[4.25rem]">
            {info.headline1.split(" ").map((w, i) => (
              <motion.span key={`${w}-${i}`} className="mr-[0.25em] inline-block" initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
            ))}
            <span className="mt-1 block">
              {info.headline2.split(" ").map((w, i) => (
                <motion.span key={`${w}-${i}`} className="text-gradient text-shimmer mr-[0.25em] inline-block" initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, delay: 0.45 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
              ))}
            </span>
          </motion.h1>
          <motion.p {...fade(0.26)} className="mt-6 max-w-xl text-base leading-relaxed text-mist-300 sm:text-lg">
            {info.heroIntro}
          </motion.p>
          <motion.p {...fade(0.3)} className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-mist-500">
            {info.positioning}
          </motion.p>

          <motion.div {...fade(0.36)} className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Link href="/projects" className="btn-primary group relative overflow-hidden">
                <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Explore My Projects <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </Magnetic>
            <Link href="/resume" className="group inline-flex items-center gap-2 self-center rounded-xl border border-white/10 px-4 py-2.5 text-sm text-mist-300 transition hover:border-cyan-400/40 hover:text-mist-100">
              <FileText className="h-4 w-4 transition-transform group-hover:-rotate-6" aria-hidden /> See my resume
            </Link>
          </motion.div>
          <motion.div {...fade(0.42)} className="mt-4 flex flex-wrap gap-1">
            <Link href="/about" className="btn-ghost">About Me</Link>
            <Link href="/contact" className="btn-ghost">Contact Me</Link>
          </motion.div>
        </motion.div>

        {/* Scene */}
        <motion.div className="relative order-1 -mx-4 h-[340px] sm:mx-0 sm:h-[460px] lg:order-2 lg:h-[min(78vh,720px)]" style={reduce ? undefined : { y: sceneY, scale: sceneS }}
          initial={reduce ? false : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(37,83,214,0.22),transparent_65%)]" aria-hidden />
          <div className="scene-fade absolute inset-0">
            {layout.heroScene && <HeroScene characterModelUrl={scene.characterModel || site.hero.characterModelUrl || undefined} settings={scene} hologram={false} />}
          </div>
          {/* HUD overlays */}
          {info.employer && (
            <motion.div className="pointer-events-none absolute bottom-6 left-4 hidden items-center gap-3 glass px-3 py-2 sm:flex"
              initial={reduce ? false : { opacity: 0, x: -20 }} animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: [0, -6, 0] }} transition={{ opacity: { delay: 1 }, x: { delay: 1, duration: 0.6 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.6 } }}>
              {info.employerLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={info.employerLogo} alt={`${info.employer} logo`} className="h-9 w-9 rounded-full bg-white object-contain p-0.5 shadow-[0_0_12px_rgba(79,140,255,0.45)]" />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 font-display text-xs font-bold text-cyan-200">{info.employer.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}</span>
              )}
              <span>
                <span className="block font-mono text-[10px] uppercase tracking-widest text-mist-400">Now</span>
                <span className="block text-xs text-mist-100">{info.employer}</span>
              </span>
            </motion.div>
          )}
          {layout.heroStatus && <motion.div className="pointer-events-none absolute bottom-24 right-3 hidden items-center gap-2 glass px-3 py-2 sm:flex"
            initial={reduce ? false : { opacity: 0, x: 20 }} animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: [0, 6, 0] }} transition={{ opacity: { delay: 1.3 }, x: { delay: 1.3, duration: 0.6 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 } }}>
            <Activity className="h-4 w-4 text-emerald-300" aria-hidden />
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-widest text-mist-400">{layout.heroStatusLabel}</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />{layout.heroStatusText}</span>
            </span>
          </motion.div>}
        </motion.div>
      </div>

      <a href="#overview" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-mist-500 hover:text-cyan-300 lg:flex" aria-label="Scroll to overview">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="h-4 w-4 motion-safe:animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
