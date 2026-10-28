"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, FileText } from "lucide-react";
import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { useLayout } from "@/components/layout/SiteChrome";
import { menuItems } from "@/content/cms";

export function Navbar() {
  const pathname = usePathname();
  const layout = useLayout();
  const items = menuItems(layout);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/[0.06] bg-ink-950/75 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-cyan-400 focus:px-3 focus:py-2 focus:text-ink-950">
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${site.name} — home`}>
          <Logo className="h-12 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2" />
          <span className="hidden leading-tight sm:block">
            <Wordmark className="block text-lg" />
            <span className="block font-mono text-[10px] uppercase tracking-wider text-mist-400">{layout.navTagline}</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                    isActive(item.href) ? "text-mist-100" : "text-mist-400 hover:text-mist-100",
                  )}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.span layoutId="nav-active" className="absolute inset-x-2 -bottom-px h-px bg-cyan-400" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {layout.navResumeButton && (
            <Link href="/resume" className="btn-secondary hidden py-2 text-xs md:inline-flex">
              <FileText className="h-3.5 w-3.5" aria-hidden /> Resume
            </Link>
          )}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-mist-100 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <motion.div className="scroll-progress absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-cyan-400 via-volt-400 to-violet-400" style={{ scaleX: progress }} aria-hidden />

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.06] bg-ink-950/95 backdrop-blur-xl xl:hidden"
          >
            <ul className="container-x grid gap-1 py-6">
              {items.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3.5 text-base",
                      isActive(item.href) ? "bg-cyan-400/10 text-cyan-300" : "text-mist-200 hover:bg-white/5",
                    )}
                  >
                    {item.label}
                    <span className="font-mono text-[10px] text-mist-500">{String(i).padStart(2, "0")}</span>
                  </Link>
                </li>
              ))}
              <li className="mt-4">
                <Link href="/resume" className="btn-primary w-full">
                  <FileText className="h-4 w-4" aria-hidden /> See my resume
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
