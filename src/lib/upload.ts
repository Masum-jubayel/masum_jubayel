"use client";

import { getBrowserSupabase } from "@/lib/supabase/client";
import { fileKind } from "@/lib/media";

const IMAGE_MAX = 8 * 1024 * 1024;
export const FILE_MAX = 50 * 1024 * 1024;

/**
 * Uploads any file to Supabase Storage and returns its public URL.
 * Small images go to the "gallery" bucket; everything else (videos, PDFs, Office files…) to "files".
 */
export async function uploadAny(file: File, folder = "uploads"): Promise<string> {
  const sb = getBrowserSupabase();
  if (!sb) throw new Error("Supabase isn’t configured.");
  if (file.size > FILE_MAX) throw new Error(`${file.name} is larger than 50 MB.`);
  const kind = fileKind(file);
  const bucket = kind === "image" && file.size <= IMAGE_MAX && /^image\/(jpeg|png|webp|gif)$/.test(file.type) ? "gallery" : "files";
  const safe = file.name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase();
  const path = `${folder}/${new Date().getFullYear()}/${Date.now()}-${safe}`;
  const { error } = await sb.storage.from(bucket).upload(path, file, { cacheControl: "31536000", contentType: file.type || "application/octet-stream", upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
