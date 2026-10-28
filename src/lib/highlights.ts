import "server-only";
import { defaultHighlights, type Highlight } from "@/content/highlights";
import { getPublicSupabase } from "@/lib/supabase/server";

/** Cards from the database when any exist (seeded from the defaults); otherwise the defaults. */
export async function getHighlights(): Promise<Highlight[]> {
  const sb = getPublicSupabase();
  if (!sb) return defaultHighlights;
  const { data, error } = await sb.from("highlights").select("id,value,label,source,tag,icon,hue").eq("published", true).order("sort").order("created_at");
  if (error || !data?.length) return defaultHighlights;
  return data as Highlight[];
}
