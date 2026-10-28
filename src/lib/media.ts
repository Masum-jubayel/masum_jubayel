/** File-type helpers shared by the gallery, memories, projects and blog. */
export type MediaKind = "image" | "video" | "audio" | "pdf" | "doc" | "sheet" | "slides" | "archive" | "text" | "other";

const EXT: Record<string, MediaKind> = {
  jpg: "image", jpeg: "image", png: "image", webp: "image", gif: "image", avif: "image", svg: "image", bmp: "image", heic: "image",
  mp4: "video", webm: "video", mov: "video", m4v: "video", ogv: "video",
  mp3: "audio", wav: "audio", m4a: "audio", ogg: "audio", aac: "audio",
  pdf: "pdf",
  doc: "doc", docx: "doc", odt: "doc", rtf: "doc",
  xls: "sheet", xlsx: "sheet", csv: "sheet", ods: "sheet",
  ppt: "slides", pptx: "slides", odp: "slides",
  zip: "archive", rar: "archive", "7z": "archive", gz: "archive", tar: "archive",
  txt: "text", md: "text", json: "text", log: "text", xml: "text",
};

/** Kind from the URL's extension, or a "#kind=…" hint (used for local previews). */
export function mediaKind(url: string): MediaKind {
  if (!url) return "other";
  const hint = /#kind=([a-z]+)/.exec(url)?.[1] as MediaKind | undefined;
  if (hint) return hint;
  const clean = url.split(/[?#]/)[0];
  const ext = clean.includes(".") ? clean.split(".").pop()!.toLowerCase() : "";
  return EXT[ext] ?? "other";
}

/** Kind from a picked file (MIME type first, then the name). */
export function fileKind(file: File): MediaKind {
  const t = file.type;
  if (t.startsWith("image/")) return "image";
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("audio/")) return "audio";
  if (t === "application/pdf") return "pdf";
  return mediaKind(file.name);
}

export const isVideo = (url: string) => mediaKind(url) === "video";

export const kindLabel: Record<MediaKind, string> = {
  image: "Image", video: "Video", audio: "Audio", pdf: "PDF", doc: "Word document", sheet: "Spreadsheet",
  slides: "Presentation", archive: "Archive", text: "Text file", other: "File",
};

export function fileNameFromUrl(url: string) {
  try { return decodeURIComponent(url.split(/[?#]/)[0].split("/").pop() || "file").replace(/^\d{10,}-/, ""); } catch { return "file"; }
}

/** A file attached to a project or blog post. */
export type Attachment = { title: string; url: string; note?: string };
