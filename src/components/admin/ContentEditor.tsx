"use client";

/* eslint-disable @next/next/no-img-element */
import { Toggle } from "@/components/ui/Toggle";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsDownUp, ChevronsUpDown, Copy, Download, ExternalLink, FileUp, ImagePlus, Loader2, Plus, RotateCcw, Save, Search, Trash2, Undo2, Upload, X } from "lucide-react";
import { coverMotifs, previewPaths, sectionByKey, type ContentKey, type Field, type ItemColumn } from "@/content/cms";
import { cn } from "@/lib/utils";
import { ProjectCover } from "@/components/projects/ProjectCover";
import type { CoverMotif } from "@/content/projects";
import { EditMediaButton } from "@/components/admin/MediaEditor";
import { mediaKind } from "@/lib/media";
import { look } from "@/lib/look";

type Obj = Record<string, unknown>;
type Result = { ok: boolean; error?: string };

/**
 * Form-based editor for any content section (single object or list of items),
 * generated from the field specs in src/content/cms.ts.
 */
export function ContentEditor({
  sectionKey, initial, onSave, onReset, uploadImage, uploadFile, uploadAny, isCustom,
}: {
  sectionKey: ContentKey; initial: unknown; isCustom?: boolean;
  onSave: (value: unknown) => Promise<Result>; onReset?: () => Promise<Result>;
  uploadImage?: (file: File) => Promise<string>;
  uploadFile?: (file: File) => Promise<string>;
  /** Any file type (videos, Office documents…) — used by columns with accept="*\/*". */
  uploadAny?: (file: File) => Promise<string>;
}) {
  const section = sectionByKey[sectionKey];
  const [draft, setDraft] = useState<unknown>(() => structuredClone(initial));
  const [sel, setSel] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [dirty, setDirty] = useState(false);

  const list = section.kind === "list" ? (draft as Obj[]) : null;
  const current: Obj = list ? (list[sel] ?? {}) : (draft as Obj);

  const update = (patch: Obj) => {
    setDirty(true); setMsg(null);
    if (list) setDraft(list.map((it, i) => (i === sel ? { ...it, ...patch } : it)));
    else setDraft({ ...(draft as Obj), ...patch });
  };
  const move = (d: number) => {
    if (!list) return;
    const j = sel + d; if (j < 0 || j >= list.length) return;
    const next = [...list]; [next[sel], next[j]] = [next[j], next[sel]];
    setDraft(next); setSel(j); setDirty(true);
  };

  const save = async () => {
    setBusy(true); setMsg(null);
    const r = await onSave(draft).catch((e) => ({ ok: false, error: String(e) }));
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Saved — the live site updates within a minute." } : { ok: false, text: r.error || "Couldn’t save." });
    if (r.ok) setDirty(false);
  };

  const [q, setQ] = useState("");
  const [fq, setFq] = useState("");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const saveRef = useRef(save);
  saveRef.current = save;
  // Ctrl/Cmd + S saves; warn before leaving with unsaved changes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveRef.current(); } };
    const onLeave = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("keydown", onKey); window.addEventListener("beforeunload", onLeave);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("beforeunload", onLeave); };
  }, [dirty]);
  const groups = useMemo(() => {
    const m = new Map<string, Field[]>();
    const t = fq.trim().toLowerCase();
    for (const f of section.fields) {
      if (t && !`${f.label} ${f.group ?? ""} ${f.help ?? ""}`.toLowerCase().includes(t)) continue;
      const g = f.group ?? ""; m.set(g, [...(m.get(g) ?? []), f]);
    }
    return [...m.entries()];
  }, [section, fq]);
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${sectionKey}.json`; a.click(); URL.revokeObjectURL(a.href);
  };
  const applyImport = () => {
    try { const v = JSON.parse(importText); setDraft(v); setSel(0); setDirty(true); setImporting(false); setImportText(""); setMsg({ ok: true, text: "Imported — review it, then Save." }); }
    catch { setMsg({ ok: false, text: "That isn’t valid JSON." }); }
  };
  const titleOf = (it: Obj) => String(it[section.titleKey || "title"] || "Untitled");
  const add = () => { if (!list) return; const n = [...list, section.blank?.() ?? {}]; setDraft(n); setSel(n.length - 1); setDirty(true); setQ(""); };

  return (
    <div className="space-y-4">
      <div className="sticky top-16 z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-ink-950/85 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{section.label}</h2>
          <p className="truncate font-mono text-[10px] uppercase tracking-widest text-mist-500">Shown on: {section.page}{isCustom ? " · edited" : " · default content"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && <span className="flex items-center gap-1.5 text-xs text-amber-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" aria-hidden />Unsaved</span>}
          {dirty && <button className="btn-ghost text-xs" onClick={() => { setDraft(structuredClone(initial)); setDirty(false); setSel(0); setMsg({ ok: true, text: "Changes discarded." }); }} title="Discard unsaved changes"><Undo2 className="h-3.5 w-3.5" aria-hidden /> Undo</button>}
          {previewPaths[sectionKey] && <a className="btn-ghost text-xs" href={previewPaths[sectionKey]} target="_blank" rel="noopener noreferrer" title="Open the page this section changes"><ExternalLink className="h-3.5 w-3.5" aria-hidden /> View page</a>}
          <button className="btn-ghost text-xs" onClick={exportJson} title="Download this section as a file"><Download className="h-3.5 w-3.5" aria-hidden /> Export</button>
          <button className="btn-ghost text-xs" onClick={() => setImporting((v) => !v)} title="Paste a previously exported section"><Upload className="h-3.5 w-3.5" aria-hidden /> Import</button>
          {onReset && isCustom && (
            <button className="btn-ghost text-xs" onClick={async () => { setBusy(true); const r = await onReset(); setBusy(false); setMsg(r.ok ? { ok: true, text: "Restored the default content." } : { ok: false, text: r.error || "Failed." }); }}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Restore default
            </button>
          )}
          <button className="btn-primary py-2" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />} Save</button>
        </div>
      </div>
      {importing && (
        <div className="glass space-y-2 p-4">
          <p className="text-sm text-mist-300">Paste the JSON of an exported <b>{section.label}</b> section, or choose the file.</p>
          <input type="file" accept="application/json" className="text-xs text-mist-400" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImportText(await f.text()); }} />
          <textarea rows={6} className="input font-mono text-xs" value={importText} onChange={(e) => setImportText(e.target.value)} aria-label="Section JSON" />
          <div className="flex gap-2"><button className="btn-primary py-1.5 text-xs" onClick={applyImport} disabled={!importText.trim()}>Load into editor</button><button className="btn-ghost text-xs" onClick={() => setImporting(false)}>Cancel</button></div>
        </div>
      )}
      {section.fields.length > 8 && (
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden />
            <input className="input py-2 pl-9 text-sm" placeholder={`Find a setting in ${section.label}…`} value={fq} onChange={(e) => setFq(e.target.value)} aria-label="Find a setting" />
          </label>
          <button className="btn-ghost text-xs" onClick={() => setCollapsed(collapsed.length ? [] : groups.map(([g]) => g))}>{collapsed.length ? <><ChevronsUpDown className="h-3.5 w-3.5" aria-hidden /> Expand all</> : <><ChevronsDownUp className="h-3.5 w-3.5" aria-hidden /> Collapse all</>}</button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Tip: Ctrl/⌘ + S saves</span>
        </div>
      )}
      {msg && <p aria-live="polite" className={cn("rounded-lg border p-3 text-sm", msg.ok ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-rose-400/30 bg-rose-500/10 text-rose-200")}>{msg.text}</p>}

      <div className={cn("grid gap-4", list && "lg:grid-cols-[280px_minmax(0,1fr)]")}>
        {list && (
          <div className="glass flex h-fit flex-col p-2 lg:sticky lg:top-36">
            {list.length > 6 && <input className="input mb-2 py-2 text-xs" placeholder={`Search ${list.length} items…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search items" />}
            <ul className="max-h-[62vh] space-y-1 overflow-y-auto pr-1">
              {list.map((it, i) => {
                if (q && !titleOf(it).toLowerCase().includes(q.toLowerCase())) return null;
                const thumb = section.thumbKey ? String(it[section.thumbKey] || "") : "";
                const sub = section.subtitleKey ? String(it[section.subtitleKey] || "") : "";
                return (
                  <li key={i}>
                    <button onClick={() => { setSel(i); setConfirmDel(false); }} className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left", i === sel ? "bg-cyan-400/10 ring-1 ring-cyan-400/30" : "hover:bg-white/5")}>
                      {thumb ? <img src={thumb} alt="" className="h-9 w-9 shrink-0 rounded-md bg-white object-cover" /> : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 font-mono text-[10px] text-mist-500">{String(i + 1).padStart(2, "0")}</span>}
                      <span className="min-w-0">
                        <span className={cn("block truncate text-sm", i === sel ? "text-cyan-100" : "text-mist-200")}>{titleOf(it)}</span>
                        {sub && <span className="block truncate text-[11px] text-mist-500">{sub}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button className="btn-secondary mt-2 py-2 text-xs" onClick={add}><Plus className="h-4 w-4" aria-hidden /> Add new</button>
          </div>
        )}

        <div className="min-w-0 space-y-4">
          {list && list.length > 0 && (
            <div className="glass flex flex-wrap items-center gap-1.5 px-3 py-2">
              <span className="mr-2 truncate text-sm font-medium text-mist-100">{titleOf(current)}</span>
              <button className="btn-ghost ml-auto px-2 py-1 text-xs" onClick={() => move(-1)} disabled={sel === 0} title="Move up"><ArrowUp className="h-3.5 w-3.5" aria-hidden /> Up</button>
              <button className="btn-ghost px-2 py-1 text-xs" onClick={() => move(1)} disabled={sel === list.length - 1} title="Move down"><ArrowDown className="h-3.5 w-3.5" aria-hidden /> Down</button>
              <button className="btn-ghost px-2 py-1 text-xs" onClick={() => { const copy = structuredClone(list[sel]); if ("id" in copy) copy.id = `${copy.id}-copy`; if ("slug" in copy) copy.slug = `${copy.slug}-copy`; const n = [...list.slice(0, sel + 1), copy, ...list.slice(sel + 1)]; setDraft(n); setSel(sel + 1); setDirty(true); }}><Copy className="h-3.5 w-3.5" aria-hidden /> Duplicate</button>
              {confirmDel ? (
                <span className="flex items-center gap-2 text-xs text-rose-300">Delete?
                  <button className="btn-secondary py-1 text-xs" onClick={() => { const n = list.filter((_, i) => i !== sel); setDraft(n); setSel(Math.max(0, sel - 1)); setConfirmDel(false); setDirty(true); }}>Yes, delete</button>
                  <button className="btn-ghost text-xs" onClick={() => setConfirmDel(false)}>Cancel</button>
                </span>
              ) : <button className="btn-ghost px-2 py-1 text-xs hover:text-rose-300" onClick={() => setConfirmDel(true)}><Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete</button>}
            </div>
          )}
          {list && list.length === 0 ? <p className="glass p-8 text-center text-sm text-mist-400">Nothing here yet — add the first item.</p> : groups.map(([g, fields]) => {
            const body = (
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((f) => <FieldInput key={`${sel}-${f.key}`} field={f} value={current[f.key]} onChange={(v) => update({ [f.key]: v })} uploadImage={uploadImage} uploadFile={uploadFile} uploadAny={uploadAny} />)}
              </div>
            );
            if (g === "Advanced") return (
              <details key={g} className="glass group/adv">
                <summary className="cursor-pointer list-none px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-mist-400 hover:text-mist-200">▸ Advanced (optional)</summary>
                <div className="border-t border-white/[0.06] p-5">{body}</div>
              </details>
            );
            const shut = collapsed.includes(g) && !fq;
            return (
              <section key={g || "main"} className="glass p-5">
                {g && (
                  <button type="button" onClick={() => setCollapsed(shut ? collapsed.filter((x) => x !== g) : [...collapsed, g])} aria-expanded={!shut}
                    className={cn("flex w-full items-center gap-2 text-left font-mono text-[11px] uppercase tracking-widest text-cyan-300", !shut && "mb-4")}>
                    <span className="h-px w-5 bg-cyan-400/50" aria-hidden />{g}
                    <span className="ml-auto text-mist-500">{fields.length} · {shut ? "▸" : "▾"}</span>
                  </button>
                )}
                {!shut && body}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FieldInput({ field: f, value, onChange, uploadImage, uploadFile, uploadAny }: { field: Field; value: unknown; onChange: (v: unknown) => void; uploadImage?: (file: File) => Promise<string>; uploadFile?: (file: File) => Promise<string>; uploadAny?: (file: File) => Promise<string> }) {
  const id = `f-${f.key}`;
  const wide = ["textarea", "lines", "rows", "json", "groups", "heading", "items", "cover"].includes(f.type);
  const [jsonText, setJsonText] = useState(() => (f.type === "json" ? (value === undefined || value === null ? "" : JSON.stringify(value, null, 2)) : ""));
  const [jsonErr, setJsonErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const rowsText = useMemo(() => (f.type === "rows" && Array.isArray(value) ? (value as Obj[]).map((r) => f.columns.map((c) => String(r[c] ?? "")).join(" | ").replace(/( \| )+$/, "")).join("\n") : ""), [f, value]);

  let input: React.ReactNode;
  switch (f.type) {
    case "textarea":
      input = <textarea id={id} rows={5} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />; break;
    case "lines":
      input = <textarea id={id} rows={6} className="input text-xs leading-relaxed" value={Array.isArray(value) ? (value as string[]).join("\n") : ""} onChange={(e) => onChange(e.target.value.split("\n"))} />; break;
    case "csv":
      input = <input id={id} className="input" value={Array.isArray(value) ? (value as string[]).join(", ") : ""} onChange={(e) => onChange(e.target.value.split(",").map((x) => x.trim()))} />; break;
    case "rows":
      input = <textarea id={id} rows={7} className="input font-mono text-xs leading-relaxed" value={rowsText}
        onChange={(e) => onChange(e.target.value.split("\n").map((line) => { const parts = line.split("|").map((x) => x.trim()); return Object.fromEntries(f.columns.map((c, i) => [c, parts[i] ?? ""])); }))} />; break;
    case "bool":
      input = <Toggle id={id} on={Boolean(value)} onChange={onChange} />; break;
    case "color": {
      const c = /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : "#3ee6ff";
      input = (
        <div className="flex items-center gap-2">
          <input id={id} type="color" className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1" value={c} onChange={(e) => onChange(e.target.value)} />
          <input aria-label={`${f.label} hex`} className="input py-2 font-mono text-xs" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder="#3ee6ff" />
          <span className="h-8 w-8 shrink-0 rounded-full shadow-[0_0_16px_var(--c)]" style={{ background: c, ["--c" as string]: c }} aria-hidden />
        </div>
      ); break;
    }
    case "select":
      input = <select id={id} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>; break;
    case "json":
      input = (
        <>
          <textarea id={id} rows={6} className={cn("input font-mono text-xs", jsonErr && "border-rose-400/60")} value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); if (!e.target.value.trim()) { setJsonErr(""); onChange(undefined); return; } try { onChange(JSON.parse(e.target.value)); setJsonErr(""); } catch { setJsonErr("Not valid JSON yet — changes here won’t be saved until it is."); } }} />
          {jsonErr && <p className="mt-1 text-xs text-rose-300">{jsonErr}</p>}
        </>
      ); break;
    case "image":
      input = (
        <div className="flex items-center gap-3">
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-ink-900">
            {value ? <img src={look(String(value)).src} style={look(String(value)).style} alt="" className="h-full w-full object-contain" /> : <ImagePlus className="h-5 w-5 text-mist-500" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <input id={id} className="input py-2 text-xs" placeholder="Image URL" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
            <div className="flex flex-wrap items-center gap-2">
            {uploadImage && (
              <label className="btn-secondary cursor-pointer py-1.5 text-xs">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <ImagePlus className="h-3.5 w-3.5" aria-hidden />} Upload image
                <input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { onChange(await uploadImage(file)); } finally { setUploading(false); } }} />
              </label>
            )}
            {value ? <EditMediaButton src={String(value)} onChange={onChange} label="Edit photo" className="py-1.5" /> : null}
            </div>
          </div>
        </div>
      ); break;
    case "file":
      input = (
        <div className="space-y-2">
          <input id={id} className="input py-2 text-xs" placeholder="/docs/file.pdf or https://…" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {uploadFile && (
              <label className="btn-secondary cursor-pointer py-1.5 text-xs">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <FileUp className="h-3.5 w-3.5" aria-hidden />} Upload PDF
                <input type="file" accept="application/pdf" className="sr-only" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { onChange(await uploadFile(file)); } finally { setUploading(false); } }} />
              </label>
            )}
            {value ? <a href={String(value)} target="_blank" rel="noopener noreferrer" className="btn-ghost py-1.5 text-xs"><ExternalLink className="h-3.5 w-3.5" aria-hidden /> Open</a> : null}
            {value ? <button type="button" className="btn-ghost py-1.5 text-xs hover:text-rose-300" onClick={() => onChange("")}><X className="h-3.5 w-3.5" aria-hidden /> Remove</button> : null}
          </div>
        </div>
      ); break;
    case "items":
      input = <ItemsEditor columns={f.columns} addLabel={f.addLabel} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} uploadImage={uploadImage} uploadFile={uploadFile} uploadAny={uploadAny} />; break;
    case "cover": {
      const cv = (value && typeof value === "object" ? value : { from: "#14c8f0", to: "#2553d6", motif: "topology" }) as { from: string; to: string; motif: CoverMotif; image?: string };
      input = (
        <div className="grid gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:grid-cols-[200px_1fr]">
          <ProjectCover project={{ slug: "cover-preview", title: "Preview", cover: cv }} className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-white/10" />
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-mist-400">From <input type="color" value={cv.from} onChange={(e) => onChange({ ...cv, from: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent" /></label>
              <label className="flex items-center gap-2 text-xs text-mist-400">To <input type="color" value={cv.to} onChange={(e) => onChange({ ...cv, to: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent" /></label>
            </div>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cover pattern">
              {coverMotifs.map((m) => (
                <button key={m} type="button" role="radio" aria-checked={cv.motif === m} onClick={() => onChange({ ...cv, motif: m })} className={cn("rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition", cv.motif === m ? "border-cyan-300 bg-cyan-400/15 text-cyan-200" : "border-white/10 text-mist-400 hover:text-mist-100")}>{m}</button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input className="input min-w-0 flex-1 py-1.5 text-xs" placeholder="Or use a cover image URL (optional)" value={cv.image ?? ""} onChange={(e) => onChange({ ...cv, image: e.target.value })} />
              {uploadImage && (
                <label className="btn-secondary cursor-pointer py-1.5 text-xs">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <ImagePlus className="h-3.5 w-3.5" aria-hidden />} Upload
                  <input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { onChange({ ...cv, image: await uploadImage(file) }); } finally { setUploading(false); } }} />
                </label>
              )}
              {cv.image ? <EditMediaButton src={cv.image} onChange={(u) => onChange({ ...cv, image: u })} label="Edit" className="py-1.5" /> : null}
              {cv.image ? <button type="button" className="btn-ghost py-1.5 text-xs hover:text-rose-300" onClick={() => onChange({ ...cv, image: "" })}><X className="h-3.5 w-3.5" aria-hidden /> Use pattern</button> : null}
            </div>
          </div>
        </div>
      ); break;
    }
    case "groups":
      input = <GroupsEditor value={Array.isArray(value) ? (value as Group[]) : []} onChange={onChange} />; break;
    case "heading": {
      const hv = (value && typeof value === "object" ? value : {}) as Record<string, string>;
      const set = (k: string, v: string) => onChange({ ...hv, [k]: v });
      input = (
        <div className="grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:grid-cols-3">
          <input aria-label={`${f.label} eyebrow`} className="input py-2 text-xs" placeholder="Eyebrow" value={hv.eyebrow ?? ""} onChange={(e) => set("eyebrow", e.target.value)} />
          <input aria-label={`${f.label} title`} className="input py-2 text-xs" placeholder="Title" value={hv.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          <input aria-label={`${f.label} highlighted words`} className="input py-2 text-xs" placeholder="Highlighted (gradient) words" value={hv.accent ?? ""} onChange={(e) => set("accent", e.target.value)} />
          <textarea aria-label={`${f.label} text`} rows={2} className="input text-xs sm:col-span-3" placeholder="Intro text (optional)" value={hv.text ?? ""} onChange={(e) => set("text", e.target.value)} />
        </div>
      ); break;
    }
    default:
      input = <input id={id} type={f.type === "url" ? "url" : "text"} placeholder={f.type === "month" ? "YYYY-MM" : undefined} className="input" value={String(value ?? "")} onChange={(e) => onChange(f.type === "month" && !e.target.value ? null : e.target.value)} />;
  }
  return (
    <div className={cn(wide && "md:col-span-2")}>
      <label htmlFor={id} className="label">{f.label}</label>
      {input}
      {f.help && <p className="mt-1 text-[11px] text-mist-500">{f.help}</p>}
    </div>
  );
}

type Group = { title: string; items: string[] };

/** Structured editor for grouped responsibilities: add / reorder / delete sections and edit their bullet points. */
function GroupsEditor({ value, onChange }: { value: Group[]; onChange: (v: Group[]) => void }) {
  const set = (i: number, patch: Partial<Group>) => onChange(value.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= value.length) return; const n = [...value]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="space-y-3">
      {value.length === 0 && <p className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-mist-500">No sections — the simple responsibilities list is shown instead.</p>}
      {value.map((g, i) => (
        <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-cyan-300">{String(i + 1).padStart(2, "0")}</span>
            <input aria-label={`Section ${i + 1} heading`} className="input min-w-0 flex-1 py-2 text-sm font-medium" placeholder="Section heading" value={g.title} onChange={(e) => set(i, { title: e.target.value })} />
            <button type="button" className="btn-ghost px-2 py-1" aria-label="Move section up" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" aria-hidden /></button>
            <button type="button" className="btn-ghost px-2 py-1" aria-label="Move section down" onClick={() => move(i, 1)} disabled={i === value.length - 1}><ArrowDown className="h-3.5 w-3.5" aria-hidden /></button>
            <button type="button" className="btn-ghost px-2 py-1 hover:text-rose-300" aria-label="Delete section" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
          </div>
          <textarea aria-label={`Section ${i + 1} bullet points`} rows={Math.min(10, Math.max(3, g.items.length + 1))} className="input mt-2 text-xs leading-relaxed" placeholder="One bullet point per line" value={g.items.join("\n")} onChange={(e) => set(i, { items: e.target.value.split("\n") })} />
          <p className="mt-1 text-[10px] text-mist-500">{g.items.filter((x) => x.trim()).length} bullet points · one per line</p>
        </div>
      ))}
      <button type="button" className="btn-secondary py-1.5 text-xs" onClick={() => onChange([...value, { title: "New section", items: [] }])}><Plus className="h-3.5 w-3.5" aria-hidden /> Add section</button>
    </div>
  );
}

/** Card list editor: each row has typed inputs (text, select, image/PDF upload) plus up / down / delete. */
function ItemsEditor({ columns, value, onChange, addLabel, uploadImage, uploadFile, uploadAny }: { columns: ItemColumn[]; value: Obj[]; onChange: (v: Obj[]) => void; addLabel?: string; uploadImage?: (f: File) => Promise<string>; uploadFile?: (f: File) => Promise<string>; uploadAny?: (f: File) => Promise<string> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const set = (i: number, k: string, v: string) => onChange(value.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= value.length) return; const n = [...value]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  const upload = async (i: number, c: ItemColumn, file: File) => {
    const fn = c.kind === "image" ? uploadImage : c.accept && c.accept !== "application/pdf" ? (uploadAny ?? uploadFile) : uploadFile; if (!fn) return;
    setBusy(`${i}-${c.key}`); try { set(i, c.key, await fn(file)); } finally { setBusy(null); }
  };
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="flex items-start gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-2.5">
          <span className="mt-2.5 w-5 shrink-0 text-center font-mono text-[10px] text-cyan-300">{i + 1}</span>
          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
            {columns.map((c) => {
              const v = String(row[c.key] ?? "");
              if (c.kind === "toggle") return <div key={c.key} className="flex items-center gap-2 text-xs text-mist-400"><Toggle on={v !== "no"} onChange={(on) => set(i, c.key, on ? "yes" : "no")} label={c.label} />{c.label}</div>;
              if (c.kind === "color") return <div key={c.key} className="flex items-center gap-2"><input type="color" aria-label={c.label} className="h-9 w-12 cursor-pointer rounded-md border border-white/10 bg-transparent p-0.5" value={/^#[0-9a-f]{6}$/i.test(v) ? v : "#3ee6ff"} onChange={(e) => set(i, c.key, e.target.value)} /><span className="font-mono text-[11px] text-mist-400">{c.label}</span></div>;
              if (c.kind === "select") return <select key={c.key} aria-label={c.label} className="input py-2 text-xs" value={v} onChange={(e) => set(i, c.key, e.target.value)}>{(c.options ?? []).map((o) => <option key={o}>{o}</option>)}</select>;
              if (c.kind === "image" || c.kind === "file") return (
                <div key={c.key} className={cn("flex min-w-0 items-center gap-2", c.wide && "sm:col-span-2")}>
                  {c.kind === "image" && <span className="grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded-md border border-white/10 bg-ink-900">{v ? <img src={look(v).src} style={look(v).style} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-4 w-4 text-mist-500" aria-hidden />}</span>}
                  {v && (mediaKind(v) === "image" || mediaKind(v) === "video") && <EditMediaButton src={v} label="" onChange={(u) => set(i, c.key, u)} className="shrink-0 px-1.5 py-1.5" />}
                  <input aria-label={c.label} className="input min-w-0 flex-1 py-2 text-xs" placeholder={c.kind === "image" ? "Image URL" : c.accept ? "File URL (or upload)" : "PDF URL"} value={v} onChange={(e) => set(i, c.key, e.target.value)} />
                  {(c.kind === "image" ? uploadImage : c.accept ? (uploadAny ?? uploadFile) : uploadFile) && (
                    <label className="btn-ghost shrink-0 cursor-pointer px-2 py-1.5 text-xs" title={c.kind === "image" ? "Upload image" : "Upload PDF"}>
                      {busy === `${i}-${c.key}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : c.kind === "image" ? <ImagePlus className="h-3.5 w-3.5" aria-hidden /> : <FileUp className="h-3.5 w-3.5" aria-hidden />}
                      <input type="file" accept={c.kind === "image" ? "image/*" : c.accept || "application/pdf"} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(i, c, f); }} />
                    </label>
                  )}
                </div>
              );
              if (c.wide) return <textarea key={c.key} aria-label={c.label} placeholder={c.label} rows={2} className="input resize-y py-2 text-xs sm:col-span-2" value={v} onChange={(e) => set(i, c.key, e.target.value)} />;
              return <input key={c.key} aria-label={c.label} placeholder={c.label} className="input py-2 text-xs" value={v} onChange={(e) => set(i, c.key, e.target.value)} />;
            })}
          </div>
          <div className="flex shrink-0 flex-col gap-0.5">
            <button type="button" className="btn-ghost px-1.5 py-1" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" aria-hidden /></button>
            <button type="button" className="btn-ghost px-1.5 py-1" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === value.length - 1}><ArrowDown className="h-3.5 w-3.5" aria-hidden /></button>
            <button type="button" className="btn-ghost px-1.5 py-1 hover:text-rose-300" aria-label="Delete" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn-secondary py-1.5 text-xs" onClick={() => onChange([...value, Object.fromEntries(columns.map((c) => [c.key, c.kind === "select" ? (c.options?.[0] ?? "") : c.kind === "toggle" ? "yes" : ""]))])}><Plus className="h-3.5 w-3.5" aria-hidden /> {addLabel || "Add"}</button>
      {(() => {
        const fc = columns.find((c) => c.kind === "file" && c.accept && c.accept !== "application/pdf");
        if (!fc || !uploadAny) return null;
        const tc = columns.find((c) => c.key === "title" || c.key === "label");
        return (
          <label className="btn-ghost cursor-pointer py-1.5 text-xs">
            {busy === "many" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <FileUp className="h-3.5 w-3.5" aria-hidden />} Upload several files
            <input type="file" multiple accept={fc.accept} className="sr-only" onChange={async (e) => {
              const files = [...(e.target.files ?? [])]; e.target.value = ""; if (!files.length) return;
              setBusy("many");
              const rows: Obj[] = [];
              try { for (const f of files) { const url = await uploadAny(f); rows.push({ ...Object.fromEntries(columns.map((c) => [c.key, ""])), [fc.key]: url, ...(tc ? { [tc.key]: f.name.replace(/\.[^.]+$/, "") } : {}) }); } }
              finally { setBusy(null); if (rows.length) onChange([...value, ...rows]); }
            }} />
          </label>
        );
      })()}
      </div>
    </div>
  );
}

