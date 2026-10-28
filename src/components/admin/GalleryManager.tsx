"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckSquare, Eye, EyeOff, Film, ImagePlus, Loader2, RefreshCw, Save, Search, Square, Star, Trash2, Undo2, UploadCloud, X } from "lucide-react";
import type { GalleryItem } from "@/content/gallery";
import { galleryCategories } from "@/content/gallery";
import { fileKind, isVideo } from "@/lib/media";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";
import { EditMediaButton } from "@/components/admin/MediaEditor";
import { look } from "@/lib/look";

type Item = GalleryItem & { published?: boolean };
type Result = { ok: boolean; error?: string };

/**
 * Gallery manager: drop many photos and videos at once, edit every item in place
 * (title, caption, category, type, cover, replace file), feature / hide, reorder, bulk actions.
 */
export function GalleryManager({ initial, onSave, upload }: { initial: Item[]; onSave: (items: Item[]) => Promise<Result>; upload: (file: File) => Promise<string> }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [edit, setEdit] = useState<string | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [defaults, setDefaults] = useState({ category: "Professional", featured: false });
  const drop = useRef<HTMLLabelElement>(null);

  const change = (next: Item[]) => { setItems(next); setDirty(true); setMsg(null); };
  const patch = (id: string, p: Partial<Item>) => change(items.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const move = (id: string, d: number) => { const i = items.findIndex((x) => x.id === id); const j = i + d; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; change(n); };

  const addFiles = async (files: FileList | File[] | null) => {
    const list = [...(files ?? [])].filter((f) => ["image", "video"].includes(fileKind(f)));
    if (!list.length) return setMsg({ ok: false, text: "Choose photos or videos." });
    setUploading({ done: 0, total: list.length });
    const added: Item[] = [];
    for (const f of list) {
      try {
        const url = await upload(f);
        const video = fileKind(f) === "video";
        added.push({ id: `g-${Date.now()}-${added.length}`, title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120), caption: "", category: defaults.category, kind: video ? "video" : "photo", src: url, poster: "", featured: defaults.featured, published: true });
      } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
      setUploading((u) => (u ? { ...u, done: u.done + 1 } : u));
    }
    setUploading(null);
    if (added.length) { change([...added, ...items]); setMsg({ ok: true, text: `${added.length} item${added.length > 1 ? "s" : ""} added — press Save to publish.` }); }
  };

  const replace = async (id: string, f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try { const url = await upload(f); patch(id, { src: url, kind: fileKind(f) === "video" ? "video" : items.find((x) => x.id === id)?.kind === "video" ? "photo" : items.find((x) => x.id === id)!.kind }); }
    catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    setBusy(false);
  };
  const setPoster = async (id: string, f: File | undefined) => { if (!f) return; setBusy(true); try { patch(id, { poster: await upload(f) }); } finally { setBusy(false); } };

  const save = async () => {
    setBusy(true);
    const r = await onSave(items).catch((e) => ({ ok: false, error: String(e) }));
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Saved — the Gallery page is updated." } : { ok: false, text: r.error || "Couldn’t save." });
    if (r.ok) setDirty(false);
  };

  const shown = useMemo(() => items.filter((x) => (cat === "all" || x.category === cat) && (!q || `${x.title} ${x.caption}`.toLowerCase().includes(q.toLowerCase()))), [items, cat, q]);
  const bulk = (fn: (x: Item) => Item | null) => { change(items.map((x) => (sel.includes(x.id) ? fn(x) : x)).filter(Boolean) as Item[]); setSel([]); };
  const counts = { photos: items.filter((x) => x.kind !== "video").length, videos: items.filter((x) => x.kind === "video").length, hidden: items.filter((x) => x.published === false).length };

  return (
    <div className="space-y-5">
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-ink-950/85 px-4 py-3 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold">Gallery</h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-mist-500">{counts.photos} photos · {counts.videos} videos · {counts.hidden} hidden</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="flex items-center gap-1.5 text-xs text-amber-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />Unsaved</span>}
          {dirty && <button className="btn-ghost text-xs" onClick={() => { setItems(initial); setDirty(false); }}><Undo2 className="h-3.5 w-3.5" aria-hidden /> Undo</button>}
          <button className="btn-primary py-2" onClick={save} disabled={busy || !dirty}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />} Save</button>
        </div>
      </div>

      {/* Multi-upload */}
      <label ref={drop} className="glass flex cursor-pointer flex-col items-center gap-2 border-dashed p-8 text-center transition hover:border-cyan-400/50"
        onDragOver={(e) => { e.preventDefault(); drop.current?.classList.add("ring-1", "ring-cyan-400/60"); }}
        onDragLeave={() => drop.current?.classList.remove("ring-1", "ring-cyan-400/60")}
        onDrop={(e) => { e.preventDefault(); drop.current?.classList.remove("ring-1", "ring-cyan-400/60"); addFiles(e.dataTransfer.files); }}>
        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-cyan-300" aria-hidden /> : <UploadCloud className="h-8 w-8 text-cyan-300" aria-hidden />}
        <span className="text-sm text-mist-200">{uploading ? `Uploading ${uploading.done + 1} of ${uploading.total}…` : "Drop photos and videos here, or click to choose several at once"}</span>
        <span className="text-xs text-mist-500">JPG, PNG, WebP, GIF · MP4, WebM, MOV · up to 50 MB each</span>
        <input type="file" multiple accept="image/*,video/*" className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      </label>
      <div className="flex flex-wrap items-center gap-3 text-sm text-mist-300">
        <span className="text-xs text-mist-500">New uploads go to</span>
        <select className="input w-auto py-1.5 text-xs" value={defaults.category} onChange={(e) => setDefaults({ ...defaults, category: e.target.value })} aria-label="Default category">{galleryCategories.map((c) => <option key={c}>{c}</option>)}</select>
        <span className="flex items-center gap-2 text-xs"><Toggle on={defaults.featured} onChange={(v) => setDefaults({ ...defaults, featured: v })} label="Feature new uploads" /> Feature new uploads</span>
      </div>
      {msg && <p aria-live="polite" className={cn("rounded-lg border p-3 text-sm", msg.ok ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-rose-400/30 bg-rose-500/10 text-rose-200")}>{msg.text}</p>}

      {/* Filters + bulk */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden /><input className="input py-2 pl-9 text-sm" placeholder="Search titles & captions…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search gallery" /></label>
        <select className="input w-auto py-2 text-sm" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category"><option value="all">All categories</option>{galleryCategories.map((c) => <option key={c}>{c}</option>)}</select>
        <button className="btn-ghost text-xs" onClick={() => setSel(sel.length === shown.length ? [] : shown.map((x) => x.id))}>{sel.length === shown.length && shown.length ? <CheckSquare className="h-3.5 w-3.5" aria-hidden /> : <Square className="h-3.5 w-3.5" aria-hidden />} Select all</button>
        {sel.length > 0 && (
          <span className="flex flex-wrap items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/[0.06] px-2 py-1 text-xs text-cyan-100">
            {sel.length} selected:
            <button className="btn-ghost px-2 py-1 text-xs" onClick={() => bulk((x) => ({ ...x, published: true }))}><Eye className="h-3.5 w-3.5" aria-hidden /> Show</button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={() => bulk((x) => ({ ...x, published: false }))}><EyeOff className="h-3.5 w-3.5" aria-hidden /> Hide</button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={() => bulk((x) => ({ ...x, featured: !x.featured }))}><Star className="h-3.5 w-3.5" aria-hidden /> Feature</button>
            <select className="input w-auto py-1 text-xs" defaultValue="" onChange={(e) => { const v = e.target.value; if (v) bulk((x) => ({ ...x, category: v })); }} aria-label="Move to category"><option value="">Move to…</option>{galleryCategories.map((c) => <option key={c}>{c}</option>)}</select>
            <button className="btn-ghost px-2 py-1 text-xs hover:text-rose-300" onClick={() => { if (confirm(`Delete ${sel.length} item(s)?`)) bulk(() => null); }}><Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete</button>
          </span>
        )}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((g) => {
          const video = g.kind === "video" || isVideo(g.src);
          const open = edit === g.id;
          const picked = sel.includes(g.id);
          return (
            <li key={g.id} className={cn("glass overflow-hidden transition", picked && "ring-1 ring-cyan-400/60", g.published === false && "opacity-60")}>
              <div className="group relative aspect-[4/3] bg-ink-900">
                {video ? <video src={look(g.src).videoSrc} style={look(g.src).style} poster={g.poster || undefined} muted loop playsInline className="h-full w-full object-cover" onMouseEnter={(e) => e.currentTarget.play().catch(() => {})} onMouseLeave={(e) => e.currentTarget.pause()} />
                  : g.src ? <img src={look(g.src).src} style={look(g.src).style} alt={g.title} className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-mist-500"><ImagePlus className="h-8 w-8" aria-hidden /></span>}
                <button type="button" onClick={() => setSel(picked ? sel.filter((x) => x !== g.id) : [...sel, g.id])} aria-label={picked ? "Unselect" : "Select"} className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-ink-950/80 text-mist-100">{picked ? <CheckSquare className="h-4 w-4 text-cyan-300" aria-hidden /> : <Square className="h-4 w-4" aria-hidden />}</button>
                <span className="absolute right-2 top-2 flex gap-1">
                  {video && <span className="flex items-center gap-1 rounded-md bg-ink-950/80 px-1.5 py-0.5 font-mono text-[10px] text-amber-300"><Film className="h-3 w-3" aria-hidden /> VIDEO</span>}
                  {g.featured && <span className="rounded-md bg-amber-300/90 px-1.5 py-0.5 font-mono text-[10px] text-ink-950">FEATURED</span>}
                </span>
                <span className="absolute inset-x-2 bottom-2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" className="grid h-7 w-7 place-items-center rounded-md bg-ink-950/85 text-mist-100" onClick={() => move(g.id, -1)} aria-label="Move earlier"><ArrowLeft className="h-3.5 w-3.5" aria-hidden /></button>
                  <EditMediaButton src={g.src} onChange={(u) => patch(g.id, { src: u })} className="rounded-md bg-ink-950/85 px-2 py-0 text-[11px] text-mist-100" />
                  <label className="flex cursor-pointer items-center gap-1 rounded-md bg-ink-950/85 px-2 text-[11px] text-mist-100"><RefreshCw className="h-3 w-3" aria-hidden /> Replace<input type="file" accept="image/*,video/*" className="sr-only" onChange={(e) => replace(g.id, e.target.files?.[0])} /></label>
                  <button type="button" className="grid h-7 w-7 place-items-center rounded-md bg-ink-950/85 text-mist-100" onClick={() => move(g.id, 1)} aria-label="Move later"><ArrowRight className="h-3.5 w-3.5" aria-hidden /></button>
                </span>
              </div>
              <div className="space-y-2 p-3">
                {open ? (
                  <>
                    <input className="input py-1.5 text-sm" value={g.title} onChange={(e) => patch(g.id, { title: e.target.value })} aria-label="Title" />
                    <textarea className="input py-1.5 text-xs" rows={2} value={g.caption} onChange={(e) => patch(g.id, { caption: e.target.value })} placeholder="Caption" aria-label="Caption" />
                    <div className="grid grid-cols-2 gap-2">
                      <select className="input py-1.5 text-xs" value={g.category} onChange={(e) => patch(g.id, { category: e.target.value })} aria-label="Category">{galleryCategories.map((c) => <option key={c}>{c}</option>)}</select>
                      <select className="input py-1.5 text-xs" value={g.kind} onChange={(e) => patch(g.id, { kind: e.target.value as Item["kind"] })} aria-label="Type"><option value="photo">Real photo</option><option value="illustration">Illustration</option><option value="video">Video</option></select>
                    </div>
                    <input className="input py-1.5 font-mono text-[11px]" value={g.src} onChange={(e) => patch(g.id, { src: e.target.value })} placeholder="File URL" aria-label="File URL" />
                    {video && <label className="btn-ghost cursor-pointer px-2 py-1 text-xs"><ImagePlus className="h-3.5 w-3.5" aria-hidden /> {g.poster ? "Change" : "Add"} video cover<input type="file" accept="image/*" className="sr-only" onChange={(e) => setPoster(g.id, e.target.files?.[0])} /></label>}
                    <button className="btn-secondary w-full py-1.5 text-xs" onClick={() => setEdit(null)}><X className="h-3.5 w-3.5" aria-hidden /> Done</button>
                  </>
                ) : (
                  <button type="button" className="block w-full text-left" onClick={() => setEdit(g.id)} title="Click to edit">
                    <p className="truncate text-sm font-medium text-mist-100">{g.title || "Untitled"}</p>
                    <p className="truncate text-xs text-mist-500">{g.caption || "Add a caption…"}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mist-500">{g.category} · {g.kind}</p>
                  </button>
                )}
                <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-2 text-xs text-mist-400">
                  <span className="flex items-center gap-1.5"><Toggle on={g.published !== false} onChange={(v) => patch(g.id, { published: v })} label="Visible" /> Visible</span>
                  <span className="flex items-center gap-1.5"><Toggle on={Boolean(g.featured)} onChange={(v) => patch(g.id, { featured: v })} label="Featured" /> Featured</span>
                  <button className="ml-auto btn-ghost px-2 py-1 text-xs hover:text-rose-300" onClick={() => { if (confirm(`Delete “${g.title}”?`)) change(items.filter((x) => x.id !== g.id)); }} aria-label="Delete"><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {!shown.length && <p className="glass p-10 text-center text-sm text-mist-400">Nothing here yet.</p>}
    </div>
  );
}
