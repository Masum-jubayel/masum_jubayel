import "server-only";
import { seedMemories, type Memory } from "@/content/memories";
import { getPublicSupabase } from "@/lib/supabase/server";

type Row = { id: string; body: string; images: string[] | null; location: string | null; feeling: string | null; memory_date: string; pinned: boolean; published: boolean; photo_fit?: string | null; photo_focus?: string | null; photo_size?: string | null };

/** Published memories from the database (pinned first, newest next); seeds when the database isn't set up. */
export async function getMemories(): Promise<Memory[]> {
  const sb = getPublicSupabase();
  const sort = (l: Memory[]) => [...l].sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.date) - +new Date(a.date));
  if (!sb) return sort(seedMemories);
  const { data, error } = await sb.from("memories").select("*").eq("published", true).limit(200);
  if (error || !data) return sort(seedMemories);
  return sort((data as Row[]).map((r) => ({ id: r.id, body: r.body, images: r.images ?? [], location: r.location ?? "", feeling: r.feeling ?? "", date: r.memory_date, pinned: r.pinned, published: r.published, photoFit: (r.photo_fit as Memory["photoFit"]) || "fill", photoFocus: (r.photo_focus as Memory["photoFocus"]) || "center", photoSize: (r.photo_size as Memory["photoSize"]) || "normal" })));
}
