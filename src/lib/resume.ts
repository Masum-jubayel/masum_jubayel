import "server-only";
import { site } from "@/lib/site";
import { getPublicSupabase } from "@/lib/supabase/server";

/** The current resume PDF: the one uploaded in /admin → Resume, or the bundled file. */
export async function getResume(): Promise<{ url: string; updated?: string }> {
  const sb = getPublicSupabase();
  if (sb) {
    const { data } = await sb.from("app_settings").select("value").eq("key", "resume").maybeSingle();
    const v = data?.value as { url?: string; updated_at?: string } | undefined;
    if (v?.url) {
      return { url: v.url, updated: v.updated_at ? new Date(v.updated_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }) : undefined };
    }
  }
  return { url: site.resumePath };
}
