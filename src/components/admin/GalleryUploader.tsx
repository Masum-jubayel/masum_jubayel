"use client";

/* eslint-disable @next/next/no-img-element */
import { Toggle } from "@/components/ui/Toggle";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { createGalleryItem } from "@/app/admin/actions";
import { galleryCategories } from "@/content/gallery";
import { slugify } from "@/lib/utils";

const MAX = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Upload a photo to the "gallery" storage bucket, then save its details. */
export function GalleryUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({ title: "", caption: "", category: "Professional", kind: "photo" as "photo" | "illustration", featured: true });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, start] = useTransition();

  const pick = (f: File | null) => {
    setMsg(null);
    if (!f) return;
    if (!TYPES.includes(f.type)) return setMsg({ ok: false, text: "Use a JPG, PNG, WebP or GIF image." });
    if (f.size > MAX) return setMsg({ ok: false, text: "Images must be 8 MB or smaller." });
    setFile(f); setPreview(URL.createObjectURL(f));
    if (!form.title) setForm((s) => ({ ...s, title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") }));
  };

  const submit = () => start(async () => {
    setMsg(null);
    const sb = getBrowserSupabase();
    if (!sb) return setMsg({ ok: false, text: "Supabase isn’t configured." });
    if (!file) return setMsg({ ok: false, text: "Choose an image first." });
    if (form.title.trim().length < 2) return setMsg({ ok: false, text: "Add a title." });
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${new Date().getFullYear()}/${Date.now()}-${slugify(form.title) || "photo"}.${ext}`;
    const up = await sb.storage.from("gallery").upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
    if (up.error) return setMsg({ ok: false, text: `Upload failed: ${up.error.message}` });
    const url = sb.storage.from("gallery").getPublicUrl(path).data.publicUrl;
    const res = await createGalleryItem({ ...form, image_url: url, storage_path: path });
    if (!res.ok) { await sb.storage.from("gallery").remove([path]); return setMsg({ ok: false, text: res.error || "Couldn’t save." }); }
    setMsg({ ok: true, text: "Added to the gallery." });
    setFile(null); setPreview(""); setForm((s) => ({ ...s, title: "", caption: "" }));
    router.refresh();
  });

  return (
    <div className="glass grid gap-6 p-6 lg:grid-cols-[260px_1fr]">
      <label className="grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-ink-900 text-center hover:border-cyan-400/50"
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0] ?? null); }}>
        {preview ? <img src={preview} alt="Selected" className="h-full w-full object-cover" /> : (
          <span className="flex flex-col items-center gap-2 p-4 text-sm text-mist-400"><ImagePlus className="h-8 w-8" aria-hidden />Drop an image or click to choose<span className="text-xs text-mist-500">JPG, PNG, WebP or GIF · up to 8 MB</span></span>
        )}
        <input type="file" accept={TYPES.join(",")} className="sr-only" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
      </label>
      <div className="space-y-4">
        <div><label className="label" htmlFor="gu-title">Title</label><input id="gu-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} /></div>
        <div><label className="label" htmlFor="gu-caption">Caption</label><input id="gu-caption" className="input" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} maxLength={300} /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label" htmlFor="gu-cat">Category</label>
            <select id="gu-cat" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{galleryCategories.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div><label className="label" htmlFor="gu-kind">Type</label>
            <select id="gu-kind" className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as "photo" | "illustration" })}><option value="photo">Real photo</option><option value="illustration">Illustration</option></select>
          </div>
          <div className="flex items-end gap-2 pb-3 text-sm text-mist-300"><Toggle on={form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Featured" /> Featured (shown first)</div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />} Add to gallery</button>
          <p aria-live="polite" className={msg?.ok ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>{msg?.text}</p>
        </div>
      </div>
    </div>
  );
}
