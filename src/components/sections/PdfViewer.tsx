"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Minus, Plus, X } from "lucide-react";

const WORKER = "/vendor/pdf.worker.min.mjs";

/**
 * Renders a PDF right on the page with pdf.js (works on phones too, no browser plugin needed).
 * Shows a toolbar with zoom and a Download button.
 */
export function PdfViewer({ src, fileName = "Masum_Mohammad_Jubayel_Resume.pdf", onClose }: { src: string; fileName?: string; onClose?: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;
    (async () => {
      try {
        setState("loading");
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER;
        const doc = await pdfjs.getDocument({ url: src }).promise;
        if (cancelled) return;
        el.innerHTML = "";
        setPages(doc.numPages);
        const width = Math.min(el.clientWidth || 800, 900) * zoom;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const vp = page.getViewport({ scale: (width / base.width) * dpr });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width; canvas.height = vp.height;
          canvas.style.width = `${vp.width / dpr}px`;
          canvas.style.maxWidth = "none";
          canvas.className = "mx-auto mb-5 block rounded-lg bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]";
          canvas.setAttribute("aria-label", `Resume page ${n} of ${doc.numPages}`);
          el.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp }).promise;
        }
        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => { cancelled = true; };
  }, [src, zoom]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-ink-900/90 px-4 py-3 backdrop-blur">
        <p className="truncate font-mono text-xs text-mist-300">{fileName}{pages ? ` · ${pages} page${pages > 1 ? "s" : ""}` : ""}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-mist-300 hover:text-mist-100" aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
          <span className="w-12 text-center font-mono text-xs text-mist-400">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(1)))} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-mist-300 hover:text-mist-100" aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
          <a href={src} download={fileName} className="btn-primary py-2 text-xs"><Download className="h-4 w-4" aria-hidden /> Download</a>
          {onClose && <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-mist-100" aria-label="Close PDF"><X className="h-4 w-4" /></button>}
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-auto p-4 sm:p-8">
        {state === "loading" && <p className="absolute inset-x-0 top-10 flex items-center justify-center gap-2 text-sm text-mist-400"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading resume…</p>}
        {state === "error" && <p className="text-center text-sm text-mist-300">The PDF couldn’t be displayed here. <a href={src} className="text-cyan-300 underline" target="_blank" rel="noopener noreferrer">Open it directly</a>.</p>}
        <div ref={host} />
      </div>
    </div>
  );
}
