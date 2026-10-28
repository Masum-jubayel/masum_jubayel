"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, FileText, Film, Image as ImageIcon, Loader2, Paperclip, RefreshCw, Search, Trash2, UploadCloud } from "lucide-react";
import { kindLabel, mediaKind, type MediaKind } from "@/lib/media";
import { cn } from "@/lib/utils";

export type MediaFile = { bucket: string; path: string; name: string; url: string; size: number; created: string };
export type MediaActions = {
  list: () => Promise<MediaFile[]>;
  upload: (file: File) => Promise<string>;
  remove: (bucket: string, path: string) => Promise<void>;
};

const fmt = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n > 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);
const filters: { id: "all" | MediaKind | "docs"; label: string }[] = [
  { id: "all", label: "All" }, { id: "image", label: "Images" }, { id: "video", label: "Videos" }, { id: "pdf", label: "PDFs" }, { id: "docs", label: "Office & other" },
];

/** Every uploaded file in one place: preview, copy link, download, delete, and upload anything. */
export function MediaLibrary({ actions }: { actions: MediaActions }) {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof filters)[number]["id"]>("all");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => { setErr(""); try { setFiles(await actions.list()); } catch (e) { setErr((e as Error).message); setFiles([]); } }, [actions]);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => (files ?? []).filter((x) => {
    const k = mediaKind(x.url);
    const okType = f === "all" || (f === "docs" ? !["image", "video", "pdf"].includes(k) : k === f);
    return okType && (!q || x.name.toLowerCase().includes(q.toLowerCase()));
  }), [files, f, q]);
  const total = (files ?? []).reduce((n, x) => n + x.size, 0);

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true); setErr("");
    try { for (const file of [...list]) await actions.upload(file); } catch (e) { setErr((e as Error).message); }
    setBusy(false); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Media library</h1>
          <p className="text-sm text-mist-400">Every photo, video and document you’ve uploaded — copy a link to use it anywhere on the site.</p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-mist-500">{files?.length ?? 0} files · {fmt(total)}</p>
      </div>

      <label className="glass flex cursor-pointer flex-col items-center gap-2 border-dashed p-6 text-center hover:border-cyan-400/50"
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}>
        {busy ? <Loader2 className="h-7 w-7 animate-spin text-cyan-300" aria-hidden /> : <UploadCloud className="h-7 w-7 text-cyan-300" aria-hidden />}
        <span className="text-sm text-mist-200">{busy ? "Uploading…" : "Drop any files here or click to upload — photos, videos, PDF, Word, Excel, PowerPoint, ZIP…"}</span>
        <span className="text-xs text-mist-500">Up to 50 MB each</span>
        <input type="file" multiple className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden /><input className="input py-2 pl-9 text-sm" placeholder="Search file names…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search files" /></label>
        <div className="flex gap-1">{filters.map((x) => <button key={x.id} type="button" onClick={() => setF(x.id)} className={cn("rounded-lg border px-3 py-1.5 text-xs", f === x.id ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200" : "border-white/10 text-mist-400 hover:text-mist-100")}>{x.label}</button>)}</div>
        <button type="button" className="btn-ghost text-xs" onClick={load}><RefreshCw className="h-3.5 w-3.5" aria-hidden /> Refresh</button>
      </div>
      {err && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{err}</p>}

      {files === null ? <p className="glass p-10 text-center text-sm text-mist-400"><Loader2 className="mx-auto h-5 w-5 animate-spin" aria-hidden /></p> : shown.length === 0 ? (
        <p className="glass p-10 text-center text-sm text-mist-400">No files here yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((x) => {
            const k = mediaKind(x.url);
            return (
              <li key={x.bucket + x.path} className="glass group overflow-hidden">
                <div className="relative aspect-square bg-ink-900">
                  {k === "image" ? <img src={x.url} alt={x.name} loading="lazy" className="h-full w-full object-cover" />
                    : k === "video" ? <video src={x.url} muted preload="metadata" className="h-full w-full object-cover" />
                    : <span className="grid h-full place-items-center text-mist-500">{k === "pdf" ? <FileText className="h-10 w-10 text-rose-300" aria-hidden /> : <Paperclip className="h-10 w-10" aria-hidden />}</span>}
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-ink-950/80 px-1.5 py-0.5 font-mono text-[9px] uppercase text-mist-300">{k === "video" ? <Film className="h-3 w-3" aria-hidden /> : k === "image" ? <ImageIcon className="h-3 w-3" aria-hidden /> : null}{kindLabel[k]}</span>
                </div>
                <div className="p-2">
                  <p className="truncate text-xs text-mist-100" title={x.name}>{x.name}</p>
                  <p className="font-mono text-[10px] text-mist-500">{fmt(x.size)}</p>
                  <div className="mt-1.5 flex gap-1">
                    <button type="button" className="btn-ghost px-1.5 py-1" title="Copy link" onClick={async () => { try { await navigator.clipboard.writeText(x.url); setCopied(x.url); setTimeout(() => setCopied(""), 1500); } catch { /* ignore */ } }}>{copied === x.url ? <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}</button>
                    <a className="btn-ghost px-1.5 py-1" href={x.url} target="_blank" rel="noopener noreferrer" title="Open"><ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>
                    <a className="btn-ghost px-1.5 py-1" href={x.url} download title="Download"><Download className="h-3.5 w-3.5" aria-hidden /></a>
                    <button type="button" className="btn-ghost ml-auto px-1.5 py-1 hover:text-rose-300" title="Delete" onClick={async () => { if (!confirm(`Delete ${x.name}? Pages still using it will show a broken link.`)) return; await actions.remove(x.bucket, x.path); load(); }}><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
