"use client";

import { motion } from "motion/react";
import { Archive, Download, ExternalLink, FileAudio, FileSpreadsheet, FileText, FileType2, Film, Image as ImageIcon, Paperclip, Presentation } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PdfButton } from "@/components/ui/PdfButton";
import { ProofThumb } from "@/components/ui/ProofThumb";
import { fileNameFromUrl, kindLabel, mediaKind, type Attachment, type MediaKind } from "@/lib/media";
import { LookVideo } from "@/components/ui/LookMedia";

const icons: Record<MediaKind, LucideIcon> = { image: ImageIcon, video: Film, audio: FileAudio, pdf: FileText, doc: FileType2, sheet: FileSpreadsheet, slides: Presentation, archive: Archive, text: FileText, other: Paperclip };
const hues: Record<MediaKind, string> = { image: "#22ff88", video: "#fbbf24", audio: "#f472b6", pdf: "#f87171", doc: "#4f8cff", sheet: "#34d399", slides: "#fb923c", archive: "#a78bfa", text: "#94a3b8", other: "#3ee6ff" };
const clean = (u: string) => u.replace(/#kind=[a-z]+/, "").replace(/#$/, "").replace("#&", "#");

/** Photos, videos, PDFs, Office documents and any other files attached to a project or post. */
export function Attachments({ items, title = "Files & media" }: { items: Attachment[]; title?: string }) {
  const list = items.filter((a) => a.url);
  if (!list.length) return null;
  const media = list.filter((a) => ["image", "video"].includes(mediaKind(a.url)));
  const files = list.filter((a) => !["image", "video"].includes(mediaKind(a.url)));
  return (
    <section className="mt-12" aria-label={title}>
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Paperclip className="h-4 w-4 text-cyan-300" aria-hidden />{title}<span className="font-mono text-xs text-mist-500">{list.length}</span></h2>
      {media.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {media.map((a, i) => {
            const k = mediaKind(a.url);
            return (
              <motion.figure key={a.url + i} className="glass overflow-hidden" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                {k === "video"
                  ? <span className="relative block overflow-hidden"><LookVideo src={a.url} controls playsInline preload="metadata" className="aspect-video w-full bg-black" /></span>
                  : <ProofThumb src={clean(a.url)} alt={a.title || "Image"} className="aspect-video rounded-none border-0" />}
                {(a.title || a.note) && <figcaption className="p-3 text-sm"><span className="text-mist-100">{a.title}</span>{a.note && <span className="block text-xs text-mist-500">{a.note}</span>}</figcaption>}
              </motion.figure>
            );
          })}
        </div>
      )}
      {files.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {files.map((a, i) => {
            const k = mediaKind(a.url);
            const Icon = icons[k];
            const url = clean(a.url);
            const name = a.title || fileNameFromUrl(url);
            const office = ["doc", "sheet", "slides"].includes(k) && /^https:\/\//.test(url);
            const card = (
              <>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border" style={{ color: hues[k], borderColor: `${hues[k]}55`, background: `${hues[k]}14` }}><Icon className="h-5 w-5" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-mist-100">{name}</span>
                  <span className="block truncate text-[11px] text-mist-500">{kindLabel[k]}{a.note ? ` · ${a.note}` : ""}</span>
                </span>
              </>
            );
            return (
              <motion.li key={url + i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                {k === "pdf" ? (
                  <PdfButton src={url} label={name} className="glass glass-hover flex w-full items-center gap-3 p-3 text-left">{card}<span className="font-mono text-[10px] uppercase tracking-widest text-cyan-300">Open</span></PdfButton>
                ) : k === "audio" ? (
                  <div className="glass p-3"><div className="flex items-center gap-3">{card}</div><audio src={url} controls className="mt-2 w-full" /></div>
                ) : (
                  <div className="glass glass-hover flex items-center gap-3 p-3">
                    {card}
                    <span className="flex shrink-0 gap-1">
                      {office && <a href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost px-2 py-1 text-xs" title="View online"><ExternalLink className="h-3.5 w-3.5" aria-hidden /> View</a>}
                      <a href={url} download className="btn-ghost px-2 py-1 text-xs" title="Download"><Download className="h-3.5 w-3.5" aria-hidden /></a>
                    </span>
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
