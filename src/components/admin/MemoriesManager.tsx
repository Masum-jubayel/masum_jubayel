"use client";

/* eslint-disable @next/next/no-img-element */
import { Toggle } from "@/components/ui/Toggle";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Heart, ImagePlus, Loader2, MapPin, MessageSquare, PenLine, Pin, Send, Smile, Trash2, X } from "lucide-react";
import { memoryFeelings, photoFits, photoFocuses, photoSizes, type Memory, type PhotoFit, type PhotoFocus, type PhotoSize } from "@/content/memories";
import { PhotoGrid } from "@/components/gallery/MemoryFeed";
import { cn, formatDate } from "@/lib/utils";
import { isVideo } from "@/lib/media";
import { EditMediaButton } from "@/components/admin/MediaEditor";
import { look } from "@/lib/look";

export type MemoryDraft = Omit<Memory, "id"> & { id: string | null };
export type MemoryStatsRow = Memory & { likes: number; comments: number };
export type MemoriesActions = {
  save: (id: string | null, input: { body: string; images: string[]; location: string; feeling: string; date: string; pinned: boolean; published: boolean; photoFit: PhotoFit; photoFocus: PhotoFocus; photoSize: PhotoSize }) => Promise<{ ok: boolean; error?: string; id?: string }>;
  setFlag: (id: string, field: "pinned" | "published", value: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  uploadImage?: (file: File) => Promise<string>;
};

const blank = (): MemoryDraft => ({ id: null, body: "", images: [], location: "", feeling: "", date: "", pinned: false, published: true, photoFit: "fill", photoFocus: "center", photoSize: "normal" });
const toLocal = (iso: string) => { if (!iso) return ""; const d = new Date(iso); return isNaN(+d) ? "" : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

/** Composer + list for the Gallery "Memories" feed — post a status with photos, edit, pin, hide, delete. */
export function MemoriesManager({ rows, avatar, name, actions }: { rows: MemoryStatsRow[]; avatar: string; name: string; actions: MemoriesActions }) {
  const [d, setD] = useState<MemoryDraft>(blank());
  const [uploading, setUploading] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof MemoryDraft>(k: K, v: MemoryDraft[K]) => setD((s) => ({ ...s, [k]: v }));

  const addFiles = async (files: FileList | null) => {
    if (!files || !actions.uploadImage) return;
    const list = [...files].slice(0, 30 - d.images.length);
    setUploading(list.length);
    try {
      for (const f of list) { const url = await actions.uploadImage(f); setD((s) => ({ ...s, images: [...s.images, url].slice(0, 30) })); setUploading((n) => n - 1); }
    } catch (e) { setMsg({ ok: false, text: (e as Error).message || "Upload failed." }); }
    finally { setUploading(0); }
  };
  const moveImg = (i: number, dir: number) => { const j = i + dir; if (j < 0 || j >= d.images.length) return; const n = [...d.images]; [n[i], n[j]] = [n[j], n[i]]; set("images", n); };

  const submit = () => start(async () => {
    setMsg(null);
    if (!d.body.trim() && !d.images.length) return setMsg({ ok: false, text: "Write something or add a photo." });
    const r = await actions.save(d.id, { body: d.body.trim() || " ", images: d.images, location: d.location, feeling: d.feeling, date: d.date ? new Date(d.date).toISOString() : "", pinned: d.pinned, published: d.published, photoFit: d.photoFit ?? "fill", photoFocus: d.photoFocus ?? "center", photoSize: d.photoSize ?? "normal" });
    if (!r.ok) return setMsg({ ok: false, text: r.error || "Couldn’t save." });
    setMsg({ ok: true, text: d.id ? "Post updated." : "Posted to the gallery." });
    setD(blank());
  });

  const editing = Boolean(d.id);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Memories</h1>
        <p className="text-sm text-mist-400">Share a status with photos — it appears in the Memories feed on the Gallery page, where visitors can like, comment and share.</p>
      </div>

      {/* Composer */}
      <section className={cn("glass p-5", editing && "ring-1 ring-cyan-400/40")}>
        <div className="flex items-start gap-3">
          {avatar ? <img src={avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover object-top" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-cyan-400/20 text-cyan-200">{name[0]}</span>}
          <div className="min-w-0 flex-1 space-y-3">
            {editing && <p className="text-xs text-cyan-300">Editing a post · <button type="button" className="underline" onClick={() => setD(blank())}>cancel</button></p>}
            <label htmlFor="mem-body" className="sr-only">What’s on your mind?</label>
            <textarea id="mem-body" rows={4} maxLength={5000} value={d.body} onChange={(e) => set("body", e.target.value)} placeholder={`What’s on your mind, ${name.split(" ")[0]}?`} className="input resize-y text-[15px]" />
            {d.images.length > 0 && (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {d.images.map((src, i) => (
                  <li key={src + i} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10">
                    {isVideo(src) ? <video src={look(src).videoSrc} style={look(src).style} muted className="h-full w-full object-cover" /> : <img src={look(src).src} style={look(src).style} alt="" className="h-full w-full object-cover" />}
                    <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                      <button type="button" aria-label="Move earlier" onClick={() => moveImg(i, -1)} className="grid h-6 w-6 place-items-center rounded bg-ink-950/80 text-mist-100"><ArrowUp className="h-3 w-3 -rotate-90" aria-hidden /></button>
                      <EditMediaButton src={src} label="" onChange={(u) => set("images", d.images.map((x, j) => (j === i ? u : x)))} className="h-6 rounded bg-ink-950/80 px-1.5 py-0 text-mist-100" />
                      <button type="button" aria-label="Move later" onClick={() => moveImg(i, 1)} className="grid h-6 w-6 place-items-center rounded bg-ink-950/80 text-mist-100"><ArrowDown className="h-3 w-3 -rotate-90" aria-hidden /></button>
                    </div>
                    <button type="button" aria-label="Remove photo" onClick={() => set("images", d.images.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink-950/80 text-mist-100 hover:text-rose-300"><X className="h-3.5 w-3.5" aria-hidden /></button>
                    {i === 0 && <span className="absolute left-1 top-1 rounded bg-cyan-400/90 px-1 font-mono text-[9px] text-ink-950">COVER</span>}
                  </li>
                ))}
              </ul>
            )}
            {d.images.length > 0 && (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-mist-400">Photo layout — adjust how the pictures show in the post</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <Seg label="Display" value={d.photoFit ?? "fill"} options={photoFits} names={{ fill: "Fill (crop)", fit: "Fit (whole photo)" }} onChange={(v) => set("photoFit", v)} />
                  <Seg label="Focus" value={d.photoFocus ?? "center"} options={photoFocuses} names={{ top: "Top", center: "Center", bottom: "Bottom" }} onChange={(v) => set("photoFocus", v)} />
                  <Seg label="Size" value={d.photoSize ?? "normal"} options={photoSizes} names={{ compact: "Compact", normal: "Normal", large: "Large" }} onChange={(v) => set("photoSize", v)} />
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-mist-500">Live preview</p>
                <div className="pointer-events-none mt-1.5 max-w-md overflow-hidden rounded-lg border border-white/10"><PhotoGrid images={d.images} fit={d.photoFit} focus={d.photoFocus} size={d.photoSize} onOpen={() => {}} /></div>
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="relative"><span className="sr-only">Location</span><MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden /><input className="input py-2 pl-9 text-sm" placeholder="Location (optional)" value={d.location} maxLength={120} onChange={(e) => set("location", e.target.value)} /></label>
              <label className="relative"><span className="sr-only">Feeling</span><Smile className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden />
                <select className="input py-2 pl-9 text-sm" value={d.feeling} onChange={(e) => set("feeling", e.target.value)}>{memoryFeelings.map((f) => <option key={f} value={f}>{f ? `Feeling ${f}` : "Feeling…"}</option>)}</select>
              </label>
              <label><span className="sr-only">Date</span><input type="datetime-local" className="input py-2 text-sm" value={toLocal(d.date)} onChange={(e) => set("date", e.target.value ? new Date(e.target.value).toISOString() : "")} title="Date of the memory (optional — defaults to now)" /></label>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
              {actions.uploadImage && (
                <label className={cn("btn-ghost cursor-pointer py-1.5 text-sm text-emerald-300", d.images.length >= 30 && "pointer-events-none opacity-50")}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />} Photos / videos {d.images.length ? `(${d.images.length}/30)` : ""}
                  <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                </label>
              )}
              <span className="flex items-center gap-1.5 text-sm text-mist-300"><Toggle on={d.pinned} onChange={(v) => set("pinned", v)} label="Pin to top" /><Pin className="h-3.5 w-3.5" aria-hidden /> Pin</span>
              <span className="flex items-center gap-1.5 text-sm text-mist-300"><Toggle on={d.published} onChange={(v) => set("published", v)} label="Visible" /> Visible</span>
              <button type="button" className="btn-primary ml-auto py-2" disabled={pending || uploading > 0} onClick={submit}>{pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} {editing ? "Update" : "Post"}</button>
            </div>
            {msg && <p aria-live="polite" className={cn("text-sm", msg.ok ? "text-emerald-300" : "text-rose-300")}>{msg.text}</p>}
          </div>
        </div>
      </section>

      {/* Posts */}
      {rows.length === 0 ? <p className="glass p-8 text-center text-sm text-mist-400">No memories yet — share your first one above.</p> : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li key={m.id} className={cn("glass flex flex-col gap-3 p-3 sm:flex-row sm:items-center", !m.published && "opacity-60")}>
              <div className="flex shrink-0 gap-1">
                {m.images.slice(0, 3).map((src, i) => isVideo(src) ? <video key={i} src={src} muted className="h-16 w-16 rounded-lg object-cover" /> : <img key={i} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />)}
                {!m.images.length && <span className="grid h-16 w-16 place-items-center rounded-lg border border-white/10 text-mist-500"><PenLine className="h-5 w-5" aria-hidden /></span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {m.pinned && <span className="chip py-0 text-[10px] text-amber-300"><Pin className="h-3 w-3" aria-hidden /> Pinned</span>}
                  {!m.published && <span className="chip py-0 text-[10px] text-mist-400">Hidden</span>}
                  <span className="font-mono text-[11px] text-mist-500">{formatDate(m.date)}{m.location ? ` · ${m.location}` : ""}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-mist-200">{m.body}</p>
                <p className="mt-1 flex items-center gap-3 text-xs text-mist-400"><span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-300" aria-hidden />{m.likes}</span><span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5 text-cyan-300" aria-hidden />{m.comments}</span><span>{m.images.length} photo{m.images.length === 1 ? "" : "s"}</span></p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button className="btn-ghost px-2 py-1.5 text-xs" onClick={() => { setD({ ...m }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><PenLine className="h-3.5 w-3.5" aria-hidden /> Edit</button>
                <button className={cn("btn-ghost px-2 py-1.5 text-xs", m.pinned && "text-amber-300")} title={m.pinned ? "Unpin" : "Pin"} onClick={() => start(() => actions.setFlag(m.id, "pinned", !m.pinned))}><Pin className="h-3.5 w-3.5" aria-hidden /></button>
                <button className="btn-ghost px-2 py-1.5 text-xs" title={m.published ? "Hide" : "Show"} onClick={() => start(() => actions.setFlag(m.id, "published", !m.published))}>{m.published ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}</button>
                {confirm === m.id ? (
                  <span className="flex items-center gap-1 text-xs text-rose-300">Delete?<button className="btn-secondary py-1 text-xs" onClick={() => start(async () => { await actions.remove(m.id); setConfirm(null); })}>Yes</button><button className="btn-ghost py-1 text-xs" onClick={() => setConfirm(null)}>No</button></span>
                ) : <button className="btn-ghost px-2 py-1.5 text-xs hover:text-rose-300" title="Delete" onClick={() => setConfirm(m.id)}><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Seg<T extends string>({ label, value, options, names, onChange }: { label: string; value: T; options: T[]; names: Record<T, string>; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="mb-1 text-xs text-mist-400">{label}</p>
      <div className="flex gap-1 rounded-lg border border-white/10 p-0.5" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)}
            className={cn("flex-1 rounded-md px-2 py-1 text-[11px] transition", value === o ? "bg-cyan-400/15 text-cyan-200" : "text-mist-400 hover:text-mist-100")}>{names[o]}</button>
        ))}
      </div>
    </div>
  );
}
