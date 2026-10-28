"use client";

import { useRouter } from "next/navigation";
import { GalleryManager } from "./GalleryManager";
import { saveContent } from "@/app/admin/actions";
import { uploadAny } from "@/lib/upload";
import type { GalleryItem } from "@/content/gallery";

export function AdminGallery({ initial }: { initial: GalleryItem[] }) {
  const router = useRouter();
  return <GalleryManager initial={initial} upload={(f) => uploadAny(f, "gallery")} onSave={async (items) => { const r = await saveContent("gallery", items); if (r.ok) router.refresh(); return r; }} />;
}
