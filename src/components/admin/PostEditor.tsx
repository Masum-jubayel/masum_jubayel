"use client";

import { fileNameFromUrl, mediaKind, type Attachment } from "@/lib/media";
import { Toggle } from "@/components/ui/Toggle";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Bold, Code, Columns2, Eye, FileCode2, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, PenLine, Quote, Save,
  Star, Table, Trash2, Upload, X, Paperclip, ArrowUp, Plus,
} from "lucide-react";
import { PostCover, coverStyles } from "@/components/blog/PostCover";
import { cn, slugify } from "@/lib/utils";
import { EditMediaButton } from "@/components/admin/MediaEditor";

export type EditablePost = {
  id: string | null; title: string; slug: string; excerpt: string; category: string; tags: string[]; cover_url: string; content: string;
  published: boolean; featured: boolean; cover_style: string; published_at: string;
  attachments?: Attachment[];
};
export type SaveResult = { ok: boolean; id?: string; error?: string; fields?: Record<string, string> };
export type PostEditorActions = {
  save: (id: string | null, payload: Omit<EditablePost, "id">) => Promise<SaveResult>;
  preview: (md: string) => Promise<string>;
  remove?: (id: string) => Promise<void>;
  uploadImage?: (file: File) => Promise<string>;
  /** Any file: photos, videos, PDF, Word, Excel… */
  uploadFile?: (file: File) => Promise<string>;
  onSaved?: (id: string, isNew: boolean) => void;
};

const toLocal = (iso: string) => { if (!iso) return ""; const d = new Date(iso); if (isNaN(+d)) return ""; return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

/** Full-featured Markdown post editor: toolbar, live preview, cover picker, scheduling, tags. Backend calls are injected. */
export function PostEditor({ initial, categories, actions }: { initial: EditablePost; categories: readonly string[]; actions: PostEditorActions }) {
  const [p, setP] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [attBusy, setAttBusy] = useState(false);
  const [attLink, setAttLink] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [view, setView] = useState<"write" | "split" | "preview">("split");
  const [html, setHtml] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState<"cover" | "inline" | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [pending, start] = useTransition();
  const ta = useRef<HTMLTextAreaElement>(null);

  const set = <K extends keyof EditablePost>(k: K, v: EditablePost[K]) => { setP((s) => ({ ...s, [k]: v })); setDirty(true); };

  // Live preview (debounced, sanitized server-side exactly like the public page).
  useEffect(() => {
    if (view === "write") return;
    const t = setTimeout(() => { actions.preview(p.content).then(setHtml).catch(() => {}); }, 450);
    return () => clearTimeout(t);
  }, [p.content, view, actions]);

  const save = useCallback((publish?: boolean) =>
    start(async () => {
      setMsg(null);
      const { id, ...rest } = p;
      const payload = { ...rest, published: publish ?? p.published, published_at: p.published_at ? new Date(p.published_at).toISOString() : "" };
      const res = await actions.save(id, payload);
      if (!res.ok) { setFields(res.fields || {}); setMsg({ kind: "error", text: res.error || "Save failed." }); return; }
      setFields({}); setDirty(false);
      setP((s) => ({ ...s, published: payload.published, id: res.id || s.id }));
      setMsg({ kind: "ok", text: payload.published ? "Saved — the post is live." : "Draft saved." });
      if (res.id) actions.onSaved?.(res.id, !id);
    }), [p, actions]);

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  /** Wrap the selection (or insert a snippet) in the Markdown textarea. */
  const wrap = (before: string, after = "", placeholder = "text") => {
    const el = ta.current; if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b) || placeholder;
    const next = value.slice(0, a) + before + sel + after + value.slice(b);
    set("content", next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + before.length, a + before.length + sel.length); });
  };
  const line = (prefix: string) => {
    const el = ta.current; if (!el) return;
    const { selectionStart: a, value } = el;
    const ls = value.lastIndexOf("\n", a - 1) + 1;
    set("content", value.slice(0, ls) + prefix + value.slice(ls));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + prefix.length, a + prefix.length); });
  };
  const insert = (snippet: string) => {
    const el = ta.current; if (!el) return;
    const { selectionStart: a, value } = el;
    set("content", value.slice(0, a) + snippet + value.slice(a));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + snippet.length, a + snippet.length); });
  };

  const upload = async (file: File, target: "cover" | "inline") => {
    if (!actions.uploadImage) return;
    setUploading(target);
    try {
      const url = await actions.uploadImage(file);
      if (target === "cover") set("cover_url", url);
      else insert(`\n![${file.name.replace(/\.[^.]+$/, "")}](${url})\n`);
    } catch (e) { setMsg({ kind: "error", text: (e as Error).message || "Upload failed." }); }
    finally { setUploading(null); }
  };

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/^#/, "");
    if (!t || p.tags.includes(t) || p.tags.length >= 12) return;
    set("tags", [...p.tags, t.slice(0, 40)]);
  };

  const stats = useMemo(() => {
    const words = p.content.trim() ? p.content.trim().split(/\s+/).length : 0;
    return { words, minutes: Math.max(1, Math.round(words / 220)), headings: (p.content.match(/^#{2,3} /gm) || []).length };
  }, [p.content]);

  const err = (k: string) => fields[k] && <p className="mt-1 text-xs text-rose-300">{fields[k]}</p>;
  const tool = (label: string, Icon: typeof Bold, fn: () => void) => (
    <button type="button" onClick={fn} title={label} aria-label={label} className="grid h-8 w-8 place-items-center rounded-md text-mist-400 transition hover:bg-white/5 hover:text-cyan-200"><Icon className="h-4 w-4" aria-hidden /></button>
  );

  return (
    <div className="space-y-5">
      {/* Sticky action bar */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.06] bg-ink-950/85 px-4 py-3 backdrop-blur">
        <span className={cn("chip", p.published ? "text-emerald-300" : "text-amber-300")}>{p.published ? "Published" : "Draft"}</span>
        {p.featured && <span className="chip text-amber-300"><Star className="h-3 w-3 fill-current" aria-hidden /> Featured</span>}
        {dirty && <span className="flex items-center gap-1.5 text-xs text-amber-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" aria-hidden />Unsaved</span>}
        <span className="hidden font-mono text-[11px] text-mist-500 sm:inline">{stats.words} words · {stats.minutes} min read · {stats.headings} headings</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button className="btn-secondary py-2 text-sm" disabled={pending} onClick={() => save(false)}>{pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />} {p.published ? "Save & unpublish" : "Save draft"}</button>
          <button className="btn-primary py-2 text-sm" disabled={pending} onClick={() => save(true)}>{p.published ? "Update post" : "Publish"}</button>
        </div>
      </div>
      <div aria-live="polite">{msg && <p className={cn("rounded-lg border p-3 text-sm", msg.kind === "ok" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-rose-400/30 bg-rose-500/10 text-rose-200")}>{msg.text}</p>}</div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column */}
        <div className="min-w-0 space-y-5">
          <section className="glass space-y-4 p-5">
            <div>
              <label className="label" htmlFor="pe-title">Title</label>
              <input id="pe-title" className="input text-lg font-semibold" value={p.title} placeholder="A clear, specific title" onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
              {err("title")}
            </div>
            <div>
              <label className="label" htmlFor="pe-excerpt">Excerpt <span className="font-normal text-mist-500">— shown on cards and search results ({p.excerpt.length}/300)</span></label>
              <textarea id="pe-excerpt" rows={2} maxLength={300} className="input" value={p.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
              {err("excerpt")}
            </div>
          </section>

          <section className="glass overflow-hidden">
            <div className="flex flex-wrap items-center gap-0.5 border-b border-white/[0.06] px-2 py-1.5">
              {tool("Heading", Heading2, () => line("## "))}
              {tool("Sub-heading", Heading3, () => line("### "))}
              {tool("Bold", Bold, () => wrap("**", "**"))}
              {tool("Italic", Italic, () => wrap("_", "_"))}
              {tool("Inline code", Code, () => wrap("`", "`", "code"))}
              {tool("Code block", FileCode2, () => wrap("\n```bash\n", "\n```\n", "command"))}
              {tool("Link", Link2, () => wrap("[", "](https://)", "link text"))}
              {tool("Quote", Quote, () => line("> "))}
              {tool("Bulleted list", List, () => line("- "))}
              {tool("Numbered list", ListOrdered, () => line("1. "))}
              {tool("Table", Table, () => insert("\n| Column | Column |\n|---|---|\n| Value | Value |\n"))}
              {actions.uploadImage && (
                <label title="Insert image" className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-mist-400 transition hover:bg-white/5 hover:text-cyan-200">
                  {uploading === "inline" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
                  <span className="sr-only">Insert image</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "inline"); e.target.value = ""; }} />
                </label>
              )}
              <div className="ml-auto flex rounded-lg border border-white/10 p-0.5" role="tablist" aria-label="Editor view">
                {([["write", PenLine, "Write"], ["split", Columns2, "Split"], ["preview", Eye, "Preview"]] as const).map(([v, I, l]) => (
                  <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn("flex items-center gap-1 rounded-md px-2 py-1 text-xs", view === v ? "bg-cyan-400/15 text-cyan-200" : "text-mist-400 hover:text-mist-100")}><I className="h-3.5 w-3.5" aria-hidden />{l}</button>
                ))}
              </div>
            </div>
            <div className={cn("grid", view === "split" && "lg:grid-cols-2")}>
              {view !== "preview" && (
                <div className={cn(view === "split" && "lg:border-r lg:border-white/[0.06]")}>
                  <label htmlFor="pe-content" className="sr-only">Content (Markdown)</label>
                  <textarea ref={ta} id="pe-content" rows={28} className="block min-h-[520px] w-full resize-y border-0 bg-transparent p-4 font-mono text-[13px] leading-relaxed text-mist-100 outline-none placeholder:text-mist-600" value={p.content} onChange={(e) => set("content", e.target.value)} placeholder="## Introduction" spellCheck />
                  {err("content")}
                </div>
              )}
              {view !== "write" && (
                <div className="max-h-[720px] min-h-[520px] overflow-y-auto p-5">
                  {html ? <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="text-sm text-mist-500">Preview appears here as you type.</p>}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Settings column */}
        <aside className="space-y-5">
          <section className="glass space-y-3 p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-cyan-300">Cover</h3>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <PostCover post={{ slug: p.slug || "preview", title: p.title, category: p.category, cover: p.cover_url || undefined, coverStyle: p.cover_style }} className="aspect-[2/1] w-full" />
            </div>
            <p className="text-xs text-mist-500">Animated style (used when there’s no image):</p>
            <div className="grid grid-cols-4 gap-1.5">
              {coverStyles.map((s) => (
                <button key={s} type="button" onClick={() => set("cover_style", s)} aria-pressed={p.cover_style === s} title={s}
                  className={cn("overflow-hidden rounded-md border transition", p.cover_style === s ? "border-cyan-300 ring-1 ring-cyan-300/50" : "border-white/10 opacity-70 hover:opacity-100")}>
                  <PostCover post={{ slug: `${p.slug || "x"}-${s}`, title: s, category: s, coverStyle: s }} className="pointer-events-none aspect-[2/1] w-full" />
                  <span className="block py-0.5 text-center font-mono text-[9px] uppercase text-mist-400">{s}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {actions.uploadImage && (
                <label className="btn-secondary cursor-pointer py-1.5 text-xs">
                  {uploading === "cover" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Upload className="h-3.5 w-3.5" aria-hidden />} Upload cover photo
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "cover"); e.target.value = ""; }} />
                </label>
              )}
              {p.cover_url && <EditMediaButton src={p.cover_url} onChange={(u) => set("cover_url", u)} label="Edit cover" className="py-1.5" />}
              {p.cover_url && <button type="button" className="btn-ghost py-1.5 text-xs hover:text-rose-300" onClick={() => set("cover_url", "")}><X className="h-3.5 w-3.5" aria-hidden /> Use animation</button>}
            </div>
            <input aria-label="Cover image URL" className="input py-1.5 text-xs" placeholder="…or paste an image URL" value={p.cover_url} onChange={(e) => set("cover_url", e.target.value)} />
            {err("cover_url")}
          </section>

          <section className="glass space-y-4 p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-cyan-300">Details</h3>
            <div>
              <label className="label" htmlFor="pe-slug">URL</label>
              <div className="flex items-center rounded-xl border border-white/10 bg-ink-900/60 pl-3 font-mono text-xs text-mist-500">/blog/<input id="pe-slug" className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 text-mist-100 outline-none" value={p.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value.toLowerCase()); }} /></div>
              {err("slug")}
            </div>
            <div>
              <label className="label" htmlFor="pe-cat">Category</label>
              <select id="pe-cat" className="input" value={p.category} onChange={(e) => set("category", e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            <div>
              <label className="label" htmlFor="pe-tags">Tags <span className="font-normal text-mist-500">({p.tags.length}/12)</span></label>
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-ink-900/60 p-2">
                {p.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-200">#{t}
                    <button type="button" aria-label={`Remove tag ${t}`} onClick={() => set("tags", p.tags.filter((x) => x !== t))}><X className="h-3 w-3" aria-hidden /></button>
                  </span>
                ))}
                <input id="pe-tags" className="min-w-[6rem] flex-1 bg-transparent px-1 text-xs text-mist-100 outline-none" placeholder="Add tag, press Enter" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); setTagInput(""); } else if (e.key === "Backspace" && !tagInput && p.tags.length) set("tags", p.tags.slice(0, -1)); }}
                  onBlur={() => { if (tagInput) { addTag(tagInput); setTagInput(""); } }} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="pe-date">Publish date <span className="font-normal text-mist-500">(optional — backdate or set the shown date)</span></label>
              <input id="pe-date" type="datetime-local" className="input" value={toLocal(p.published_at)} onChange={(e) => set("published_at", e.target.value ? new Date(e.target.value).toISOString() : "")} />
              {err("published_at")}
            </div>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-mist-200">
              <span className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-300" aria-hidden /> Feature at top of the blog</span>
              <Toggle on={p.featured} onChange={(v) => set("featured", v)} label="Feature at top of the blog" />
            </label>
          </section>

          <section className="glass space-y-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Paperclip className="h-4 w-4 text-cyan-300" aria-hidden /> Files & media <span className="font-mono text-[10px] text-mist-500">{(p.attachments ?? []).length}</span></h3>
              {actions.uploadFile && (
                <label className="btn-secondary cursor-pointer py-1.5 text-xs">
                  {attBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Upload className="h-3.5 w-3.5" aria-hidden />} Add files
                  <input type="file" multiple className="sr-only" onChange={async (e) => {
                    const files = [...(e.target.files ?? [])]; e.target.value = ""; if (!files.length || !actions.uploadFile) return;
                    setAttBusy(true);
                    const added: Attachment[] = [];
                    try { for (const f of files) added.push({ title: f.name.replace(/\.[^.]+$/, ""), url: await actions.uploadFile(f), note: "" }); }
                    catch (err) { setMsg({ kind: "error", text: (err as Error).message }); }
                    finally { setAttBusy(false); if (added.length) set("attachments", [...(p.attachments ?? []), ...added]); }
                  }} />
                </label>
              )}
            </div>
            <p className="text-xs text-mist-500">Photos, videos, PDF, Word, Excel, PowerPoint or any file — shown under the article with previews and downloads.</p>
            <ul className="space-y-2">
              {(p.attachments ?? []).map((a, i) => (
                <li key={a.url + i} className="rounded-xl border border-white/10 p-2">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase text-mist-400">{mediaKind(a.url)}</span>
                    {(mediaKind(a.url) === "image" || mediaKind(a.url) === "video") && <EditMediaButton src={a.url} label="" onChange={(u) => set("attachments", (p.attachments ?? []).map((x, j) => (j === i ? { ...x, url: u } : x)))} className="shrink-0 px-1.5" />}
                    <input className="input min-w-0 flex-1 py-1 text-xs" value={a.title} onChange={(e) => set("attachments", (p.attachments ?? []).map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} aria-label="File title" />
                    <button type="button" className="btn-ghost px-1.5 py-1" disabled={i === 0} onClick={() => { const n = [...(p.attachments ?? [])]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set("attachments", n); }} aria-label="Move up"><ArrowUp className="h-3 w-3" aria-hidden /></button>
                    <button type="button" className="btn-ghost px-1.5 py-1 hover:text-rose-300" onClick={() => set("attachments", (p.attachments ?? []).filter((_, j) => j !== i))} aria-label="Remove file"><X className="h-3 w-3" aria-hidden /></button>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input className="input min-w-0 flex-1 py-1 text-[11px]" placeholder="Note (optional)" value={a.note ?? ""} onChange={(e) => set("attachments", (p.attachments ?? []).map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} aria-label="Note" />
                    <button type="button" className="btn-ghost shrink-0 px-2 py-1 text-[11px]" title="Insert into the article" onClick={() => {
                      const k = mediaKind(a.url);
                      const md = k === "image" ? `![${a.title}](${a.url})` : `[${a.title || "Download file"}](${a.url})`;
                      set("content", `${p.content.trimEnd()}\n\n${md}\n`);
                    }}>Insert</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input className="input min-w-0 flex-1 py-1.5 text-xs" placeholder="…or paste a link (https://…)" value={attLink} onChange={(e) => setAttLink(e.target.value)} aria-label="File link" />
              <button type="button" className="btn-ghost text-xs" disabled={!/^(https?:\/\/|\/)/.test(attLink)} onClick={() => { set("attachments", [...(p.attachments ?? []), { title: fileNameFromUrl(attLink), url: attLink, note: "" }]); setAttLink(""); }}><Plus className="h-3.5 w-3.5" aria-hidden /> Add</button>
            </div>
          </section>

          {p.id && actions.remove && (
            <section className="glass p-5">
              {confirmDel ? (
                <div className="space-y-2 text-sm text-rose-200">
                  <p>Delete this post permanently? Comments and likes stay in the database.</p>
                  <div className="flex gap-2">
                    <button className="btn-secondary py-1.5 text-xs" disabled={pending} onClick={() => start(() => actions.remove!(p.id!))}>Yes, delete</button>
                    <button className="btn-ghost text-xs" onClick={() => setConfirmDel(false)}>Cancel</button>
                  </div>
                </div>
              ) : <button className="btn-ghost w-full justify-center text-sm hover:text-rose-300" onClick={() => setConfirmDel(true)}><Trash2 className="h-4 w-4" aria-hidden /> Delete post</button>}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
