"use client";

import { useState, useTransition } from "react";
import { DatabaseBackup, Download, Loader2, Upload } from "lucide-react";
import { exportBackup, importContentBackup } from "@/app/admin/actions";

/** Download a JSON backup of everything managed in the admin; restore page content from one. */
export function BackupPanel() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const download = () => start(async () => {
    const json = await exportBackup();
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    setMsg({ ok: true, text: "Backup downloaded." });
  });
  const restore = (file: File) => start(async () => {
    const r = await importContentBackup(await file.text());
    setMsg({ ok: r.ok, text: r.message });
  });
  return (
    <div className="glass max-w-xl p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><DatabaseBackup className="h-5 w-5 text-cyan-300" aria-hidden /> Backup & restore</h2>
      <p className="mt-2 text-sm text-mist-400">Download everything you manage here — page content, highlights, memories, blog posts, gallery and settings — as one JSON file. Restoring brings back page content (all Content sections); each section is validated first.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="btn-primary py-2 text-sm" disabled={pending} onClick={download}>{pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />} Download backup</button>
        <label className="btn-secondary cursor-pointer py-2 text-sm">
          <Upload className="h-4 w-4" aria-hidden /> Restore content…
          <input type="file" accept="application/json" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f && confirm("Replace page content with the sections in this backup?")) restore(f); e.target.value = ""; }} />
        </label>
      </div>
      {msg && <p aria-live="polite" className={msg.ok ? "mt-3 text-sm text-emerald-300" : "mt-3 text-sm text-rose-300"}>{msg.text}</p>}
    </div>
  );
}
