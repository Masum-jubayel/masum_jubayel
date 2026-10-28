import "server-only";
import { cache } from "react";
import { defaultContent, mergeContent, type Content } from "@/content/cms";
import { getPublicSupabase } from "@/lib/supabase/server";

/** All editable site content: defaults merged with anything saved in /admin → Content. */
export const getContent = cache(async (): Promise<Content> => {
  const sb = getPublicSupabase();
  if (!sb) return defaultContent;
  const { data, error } = await sb.from("site_content").select("key,value");
  if (error || !data) return defaultContent;
  return mergeContent(data as { key: string; value: unknown }[]);
});
