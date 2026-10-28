import "server-only";
import type { GalleryItem } from "@/content/gallery";
import { getContent } from "@/lib/content";
import { getPublicSupabase } from "@/lib/supabase/server";

type Row = { id: string; title: string; caption: string | null; category: string; kind: GalleryItem["kind"]; image_url: string; featured: boolean };

/** Gallery items managed in /admin → Gallery (plus any older direct uploads), featured first. */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const managed = (await getContent()).gallery.filter((g) => g.published !== false && g.src);
  const sb = getPublicSupabase();
  let fromDb: GalleryItem[] = [];
  if (sb) {
    const { data } = await sb.from("gallery_items").select("id,title,caption,category,kind,image_url,featured").eq("published", true)
      .order("sort", { ascending: true }).order("created_at", { ascending: false }).limit(300);
    fromDb = ((data ?? []) as Row[]).map((r) => ({ id: r.id, title: r.title, caption: r.caption || "", category: r.category, kind: r.kind, src: r.image_url, featured: r.featured }));
  }
  const all = [...managed, ...fromDb];
  return [...all.filter((g) => g.featured), ...all.filter((g) => !g.featured)];
}
