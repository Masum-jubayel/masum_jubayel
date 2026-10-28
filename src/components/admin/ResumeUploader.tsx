"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { setResume } from "@/app/admin/actions";

/** Upload a new resume PDF; it replaces the one shown and downloadable on /resume. */
export function ResumeUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, start] = useTransition();

  const pick = (f: File | null) => {
    setMsg(null);
    if (!f) return;
    if (f.type !== "application/pdf") return setMsg({ ok: false, text: "Please choose a PDF file." });
    if (f.size > 10 * 1024 * 1024) return setMsg({ ok: false, text: "The PDF must be 10 MB or smaller." });
    setFile(f);
  };

  const upload = () => start(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return setMsg({ ok: false, text: "Supabase isn’t configured." });
    if (!file) return setMsg({ ok: false, text: "Choose a PDF first." });
    const path = `resume-${Date.now()}.pdf`;
    const up = await sb.storage.from("resumes").upload(path, file, { contentType: "application/pdf", cacheControl: "3600" });
    if (up.error) return setMsg({ ok: false, text: `Upload failed: ${up.error.message}` });
    const url = sb.storage.from("resumes").getPublicUrl(path).data.publicUrl;
    const res = await setResume(url, path);
    if (!res.ok) { await sb.storage.from("resumes").remove([path]); return setMsg({ ok: false, text: res.error || "Couldn’t save." }); }
    setFile(null);
    setMsg({ ok: true, text: "Resume updated. Visitors now see and download the new PDF." });
    router.refresh();
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-ink-900 p-4 text-sm text-mist-300 hover:border-cyan-400/50"
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0] ?? null); }}>
        <FileUp className="h-6 w-6 text-cyan-300" aria-hidden />
        {file ? <span className="truncate">{file.name} · {(file.size / 1024).toFixed(0)} KB</span> : <span>Drop your new resume PDF here, or click to choose</span>}
        <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
      </label>
      <button className="btn-primary" disabled={busy || !file} onClick={upload}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Upload & publish</button>
      {msg && <p aria-live="polite" className={msg.ok ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>{msg.text}</p>}
    </div>
  );
}
