"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { PostCover } from "./PostCover";
import type { PostMeta } from "@/lib/blog";
import { PostCard } from "./PostCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function BlogExplorer({ posts, categories }: { posts: PostMeta[]; categories: readonly string[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") || "");
  const category = params.get("category") || "all";
  const tag = params.get("tag") || "";

  const setParam = (k: string, v: string) => {
    const sp = new URLSearchParams(params.toString());
    if (!v || v === "all") sp.delete(k); else sp.set(k, v);
    router.replace(`/blog${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  };

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return posts.filter((p) =>
      (category === "all" || p.category === category) &&
      (!tag || p.tags.includes(tag)) &&
      (!t || [p.title, p.excerpt, p.category, ...p.tags].join(" ").toLowerCase().includes(t)),
    );
  }, [posts, q, category, tag]);

  const filtered = category !== "all" || !!tag || !!q.trim();
  const hero = !filtered ? results.find((p) => p.featured) ?? null : null;
  const rest = hero ? results.filter((p) => p !== hero) : results;
  const counts = useMemo(() => Object.fromEntries(categories.map((c) => [c, posts.filter((p) => p.category === c).length])), [posts, categories]);
  const allTags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts]);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="min-w-0 space-y-8 lg:sticky lg:top-28 lg:self-start">
        <label className="relative block">
          <span className="sr-only">Search articles</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="input pl-11" />
        </label>
        <nav aria-label="Categories">
          <p className="eyebrow mb-3">Categories</p>
          <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:block lg:space-y-0.5">
            <li className="shrink-0"><button onClick={() => setParam("category", "all")} aria-pressed={category === "all"} className={cn("w-full rounded-lg px-3 py-1.5 text-left text-sm", category === "all" ? "bg-cyan-400/10 text-cyan-200" : "text-mist-400 hover:text-mist-100")}>All articles ({posts.length})</button></li>
            {categories.map((c) => (
              <li key={c} className="shrink-0">
                <button onClick={() => setParam("category", c)} aria-pressed={category === c} disabled={!counts[c]} className={cn("w-full whitespace-nowrap rounded-lg px-3 py-1.5 text-left text-sm disabled:opacity-40 lg:whitespace-normal", category === c ? "bg-cyan-400/10 text-cyan-200" : "text-mist-400 hover:text-mist-100")}>
                  {c} <span className="text-mist-600">({counts[c] || 0})</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {allTags.length > 0 && (
          <div>
            <p className="eyebrow mb-3">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => (
                <button key={t} onClick={() => setParam("tag", tag === t ? "" : t)} aria-pressed={tag === t} className={cn("chip py-0.5 text-[10px]", tag === t && "border-cyan-400/50 text-cyan-200")}>#{t}</button>
              ))}
            </div>
          </div>
        )}
      </aside>
      <div>
        <p className="font-mono text-[11px] text-mist-500" aria-live="polite">{results.length} article{results.length === 1 ? "" : "s"}{tag && ` tagged #${tag}`}</p>
        {hero && (
          <Reveal className="mt-4">
            <Link href={`/blog/${hero.slug}`} className="glass glass-hover group grid overflow-hidden md:grid-cols-[1.15fr_1fr]">
              <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:min-h-[260px]"><PostCover post={hero} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" /></div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-amber-300"><Star className="h-3 w-3 fill-current" aria-hidden /> Featured · {hero.category}</p>
                <h2 className="mt-3 text-2xl font-semibold leading-snug group-hover:text-white">{hero.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm text-mist-400">{hero.excerpt}</p>
                <p className="mt-5 font-mono text-[11px] text-mist-500">{hero.readingTime} min read · Read article →</p>
              </div>
            </Link>
          </Reveal>
        )}
        {rest.length ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2">{rest.map((p, i) => <Reveal key={p.slug} delay={(i % 4) * 0.06} className="h-full"><PostCard post={p} /></Reveal>)}</div>
        ) : hero ? null : (
          <div className="glass mt-4 p-10 text-center text-sm text-mist-400">No articles match your search.</div>
        )}
      </div>
    </div>
  );
}
