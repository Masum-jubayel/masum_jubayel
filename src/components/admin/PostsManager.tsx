"use client";

import { useMemo, useState, useTransition } from "react";
import { Copy, Eye, EyeOff, FileDown, Heart, Loader2, MessageSquare, PenLine, Plus, Search, Star, Trash2 } from "lucide-react";
import { PostCover } from "@/components/blog/PostCover";
import { cn, formatDate } from "@/lib/utils";

export type PostRow = {
  id: string | null; slug: string; title: string; category: string; excerpt: string; cover?: string; coverStyle?: string;
  published: boolean; featured: boolean; date: string; source: "db" | "file"; likes: number; comments: number; readingTime?: number;
};
export type PostsActions = {
  onNew: () => void;
  onEdit: (row: PostRow) => void;
  onView?: (row: PostRow) => void;
  setFlag: (id: string, field: "published" | "featured", value: boolean) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  importFile: (slug: string) => Promise<void>;
};

type Filter = "all" | "published" | "drafts" | "featured" | "files";

/** Blog dashboard: stats, search, filters and one-click actions for every post. */
export function PostsManager({ rows, categories, actions }: { rows: PostRow[]; categories: readonly string[]; actions: PostsActions }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"date" | "likes" | "comments" | "title">("date");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();

  const run = (key: string, fn: () => Promise<void>) => { setBusy(key); start(async () => { try { await fn(); } finally { setBusy(null); setConfirm(null); } }); };

  const stats = useMemo(() => ({
    total: rows.length, published: rows.filter((r) => r.published).length, drafts: rows.filter((r) => !r.published).length,
    featured: rows.filter((r) => r.featured).length, likes: rows.reduce((n, r) => n + r.likes, 0), comments: rows.reduce((n, r) => n + r.comments, 0),
  }), [rows]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const out = rows.filter((r) =>
      (filter === "all" || (filter === "published" && r.published) || (filter === "drafts" && !r.published) || (filter === "featured" && r.featured) || (filter === "files" && r.source === "file")) &&
      (cat === "all" || r.category === cat) &&
      (!t || `${r.title} ${r.slug} ${r.excerpt} ${r.category}`.toLowerCase().includes(t)));
    return out.sort((a, b) => sort === "likes" ? b.likes - a.likes : sort === "comments" ? b.comments - a.comments : sort === "title" ? a.title.localeCompare(b.title) : +new Date(b.date) - +new Date(a.date));
  }, [rows, q, filter, cat, sort]);

  const statCard = (label: string, value: number, cls: string, f?: Filter) => (
    <button type="button" onClick={() => f && setFilter(f)} className={cn("glass glass-hover p-4 text-left", f && filter === f && "ring-1 ring-cyan-400/40")}>
      <p className={cn("font-display text-2xl font-semibold tabular-nums", cls)}>{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-mist-500">{label}</p>
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Blog posts</h1>
          <p className="text-sm text-mist-400">Write, publish, feature and moderate everything on the blog.</p>
        </div>
        <button className="btn-primary py-2" onClick={actions.onNew}><Plus className="h-4 w-4" aria-hidden /> New post</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCard("Posts", stats.total, "text-mist-100", "all")}
        {statCard("Published", stats.published, "text-emerald-300", "published")}
        {statCard("Drafts", stats.drafts, "text-amber-300", "drafts")}
        {statCard("Featured", stats.featured, "text-yellow-300", "featured")}
        {statCard("Likes", stats.likes, "text-rose-300")}
        {statCard("Comments", stats.comments, "text-cyan-300")}
      </div>

      <div className="glass flex flex-wrap items-center gap-2 p-3">
        <label className="relative min-w-[12rem] flex-1">
          <span className="sr-only">Search posts</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden />
          <input className="input py-2 pl-9 text-sm" placeholder="Search title, slug, excerpt…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select aria-label="Status" className="input w-auto py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">All posts</option><option value="published">Published</option><option value="drafts">Drafts</option><option value="featured">Featured</option><option value="files">Markdown files</option>
        </select>
        <select aria-label="Category" className="input w-auto py-2 text-sm" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Sort" className="input w-auto py-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="date">Newest</option><option value="likes">Most liked</option><option value="comments">Most discussed</option><option value="title">Title A–Z</option>
        </select>
      </div>

      {list.length === 0 ? <p className="glass p-10 text-center text-sm text-mist-400">No posts match.</p> : (
        <ul className="space-y-3">
          {list.map((r) => {
            const key = r.id ?? `file:${r.slug}`;
            return (
              <li key={key} className={cn("glass flex flex-col gap-4 p-3 sm:flex-row sm:items-center", !r.published && "border-dashed")}>
                <button type="button" onClick={() => actions.onEdit(r)} className="block w-full shrink-0 overflow-hidden rounded-lg border border-white/10 sm:w-40" aria-label={`Edit ${r.title}`}>
                  <PostCover post={{ slug: r.slug, title: r.title, category: r.category, cover: r.cover, coverStyle: r.coverStyle }} className="aspect-[2/1] w-full" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn("chip py-0 text-[10px]", r.published ? "text-emerald-300" : "text-amber-300")}>{r.published ? "Published" : "Draft"}</span>
                    {r.featured && <span className="chip py-0 text-[10px] text-yellow-300"><Star className="h-3 w-3 fill-current" aria-hidden /> Featured</span>}
                    {r.source === "file" && <span className="chip py-0 text-[10px] text-mist-400">Markdown file</span>}
                    <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">{r.category}</span>
                  </div>
                  <button type="button" onClick={() => actions.onEdit(r)} className="mt-1 block truncate text-left font-medium text-mist-100 hover:text-cyan-200">{r.title}</button>
                  <p className="truncate font-mono text-[11px] text-mist-500">/blog/{r.slug} · {formatDate(r.date)}{r.readingTime ? ` · ${r.readingTime} min` : ""}</p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-mist-400">
                    <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-300" aria-hidden />{r.likes}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5 text-cyan-300" aria-hidden />{r.comments}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                  {busy?.startsWith(key) && <Loader2 className="h-4 w-4 animate-spin text-cyan-300" aria-hidden />}
                  {r.source === "file" ? (
                    <button className="btn-secondary py-1.5 text-xs" onClick={() => run(`${key}:import`, () => actions.importFile(r.slug))}><FileDown className="h-3.5 w-3.5" aria-hidden /> Edit in admin</button>
                  ) : (
                    <>
                      <button className="btn-ghost px-2 py-1.5 text-xs" onClick={() => actions.onEdit(r)}><PenLine className="h-3.5 w-3.5" aria-hidden /> Edit</button>
                      <button className="btn-ghost px-2 py-1.5 text-xs" title={r.published ? "Unpublish" : "Publish"} onClick={() => run(`${key}:pub`, () => actions.setFlag(r.id!, "published", !r.published))}>{r.published ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}{r.published ? "Unpublish" : "Publish"}</button>
                      <button className={cn("btn-ghost px-2 py-1.5 text-xs", r.featured && "text-yellow-300")} title={r.featured ? "Unfeature" : "Feature"} onClick={() => run(`${key}:feat`, () => actions.setFlag(r.id!, "featured", !r.featured))}><Star className={cn("h-3.5 w-3.5", r.featured && "fill-current")} aria-hidden /></button>
                      <button className="btn-ghost px-2 py-1.5 text-xs" title="Duplicate" onClick={() => run(`${key}:dup`, () => actions.duplicate(r.id!))}><Copy className="h-3.5 w-3.5" aria-hidden /></button>
                      {confirm === key ? (
                        <span className="flex items-center gap-1 text-xs text-rose-300">Delete?
                          <button className="btn-secondary py-1 text-xs" onClick={() => run(`${key}:del`, () => actions.remove(r.id!))}>Yes</button>
                          <button className="btn-ghost py-1 text-xs" onClick={() => setConfirm(null)}>No</button>
                        </span>
                      ) : <button className="btn-ghost px-2 py-1.5 text-xs hover:text-rose-300" title="Delete" onClick={() => setConfirm(key)}><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>}
                    </>
                  )}
                  {r.published && actions.onView && <button className="btn-ghost px-2 py-1.5 text-xs" onClick={() => actions.onView!(r)}>View</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-mist-500">Markdown-file posts ship with the code. “Edit in admin” copies one into the database so you can change it here — the database copy then replaces the file version on the site.</p>
    </div>
  );
}
