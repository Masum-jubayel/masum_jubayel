import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileText, Flag, ImagePlus, Inbox, MessageSquare, Newspaper, PenLine, Camera, Sparkles, UserRound, SlidersHorizontal } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

type Stat = { label: string; value: number; href: string; tone?: "warn" | "ok" };
type Recent = { id: string; title: string; meta: string; href: string; kind: "comment" | "message" };

/** Admin landing page: health, numbers that need attention, recent activity and one-click shortcuts. */
export function AdminOverview({ stats, recent, health, name, switches }: { stats: Stat[]; recent: Recent[]; health: { label: string; ok: boolean; hint: string }[]; name: string; switches?: ReactNode }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const actions = [
    { href: "/admin/posts/new", label: "Write a blog post", Icon: Newspaper },
    { href: "/admin?tab=memories", label: "Share a memory", Icon: Camera },
    { href: "/admin?tab=gallery", label: "Upload a photo", Icon: ImagePlus },
    { href: "/admin?tab=resume", label: "Replace resume", Icon: FileText },
    { href: "/admin?tab=content&section=site", label: "Edit profile", Icon: UserRound },
    { href: "/admin?tab=highlights", label: "Home highlight cards", Icon: Sparkles },
    { href: "/admin?tab=content&section=layout", label: "Site controls", Icon: SlidersHorizontal },
    { href: "/admin?tab=content&section=pages", label: "Page headings", Icon: PenLine },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{greet}, {name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-mist-400">Here’s what’s happening on your site.</p>
        </div>
        <Link href="/" target="_blank" className="btn-secondary py-2 text-sm"><Eye className="h-4 w-4" aria-hidden /> View live site</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={cn("glass glass-hover p-4", s.tone === "warn" && s.value > 0 && "ring-1 ring-amber-300/40")}>
            <p className={cn("font-display text-3xl font-semibold tabular-nums", s.tone === "warn" && s.value > 0 ? "text-amber-300" : "text-mist-100")}>{s.value}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mist-500">{s.label}</p>
          </Link>
        ))}
      </div>

      {switches}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="glass p-5">
          <h2 className="text-base font-semibold">Recent activity</h2>
          {recent.length ? (
            <ul className="mt-3 divide-y divide-white/[0.05]">
              {recent.map((r) => (
                <li key={r.kind + r.id}>
                  <Link href={r.href} className="flex items-start gap-3 py-3 hover:text-cyan-200">
                    <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border", r.kind === "comment" ? "border-cyan-400/30 text-cyan-300" : "border-violet-400/30 text-violet-300")}>
                      {r.kind === "comment" ? <MessageSquare className="h-4 w-4" aria-hidden /> : <Inbox className="h-4 w-4" aria-hidden />}
                    </span>
                    <span className="min-w-0"><span className="block truncate text-sm text-mist-100">{r.title}</span><span className="text-xs text-mist-500">{r.meta}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-mist-500">No recent comments or messages.</p>}
        </section>

        <div className="space-y-6">
          <section className="glass p-5">
            <h2 className="text-base font-semibold">Quick actions</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {actions.map(({ href, label, Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-mist-200 transition hover:border-cyan-400/40 hover:text-cyan-200"><Icon className="h-4 w-4 shrink-0" aria-hidden />{label}</Link>
              ))}
            </div>
          </section>
          <section className="glass p-5">
            <h2 className="text-base font-semibold">Site health</h2>
            <ul className="mt-3 space-y-2.5">
              {health.map((h) => (
                <li key={h.label} className="flex items-start gap-2.5 text-sm">
                  {h.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />}
                  <span><span className="text-mist-100">{h.label}</span>{!h.ok && <span className="block text-xs text-mist-500">{h.hint}</span>}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <p className="flex items-center gap-2 text-xs text-mist-500"><Flag className="h-3.5 w-3.5" aria-hidden /> Tip: Settings → Backup lets you download everything as one file. <PenLine className="h-3.5 w-3.5" aria-hidden /> Last loaded {formatDate(new Date().toISOString())}.</p>
    </div>
  );
}
