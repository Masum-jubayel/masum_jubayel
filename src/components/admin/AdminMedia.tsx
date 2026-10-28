"use client";

import { useMemo } from "react";
import { MediaLibrary, type MediaActions, type MediaFile } from "./MediaLibrary";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { uploadAny } from "@/lib/upload";

const BUCKETS = ["gallery", "files", "resumes"];

/** Real media library: walks the Supabase Storage buckets (up to 4 folders deep). */
export function AdminMedia() {
  const actions = useMemo<MediaActions>(() => ({
    list: async () => {
      const sb = getBrowserSupabase();
      if (!sb) throw new Error("Supabase isn’t configured.");
      const out: MediaFile[] = [];
      const walk = async (bucket: string, prefix: string, depth: number) => {
        const { data, error } = await sb.storage.from(bucket).list(prefix, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
        if (error || !data) return;
        for (const it of data) {
          const path = prefix ? `${prefix}/${it.name}` : it.name;
          if (!it.id) { if (depth < 4) await walk(bucket, path, depth + 1); continue; }
          if (it.name === ".emptyFolderPlaceholder") continue;
          out.push({ bucket, path, name: it.name.replace(/^\d{10,}-/, ""), url: sb.storage.from(bucket).getPublicUrl(path).data.publicUrl, size: Number((it.metadata as { size?: number } | null)?.size ?? 0), created: it.created_at ?? "" });
        }
      };
      for (const b of BUCKETS) await walk(b, "", 0);
      return out.sort((a, b) => b.created.localeCompare(a.created));
    },
    upload: (file) => uploadAny(file, "library"),
    remove: async (bucket, path) => {
      const sb = getBrowserSupabase();
      if (!sb) return;
      const { error } = await sb.storage.from(bucket).remove([path]);
      if (error) throw error;
    },
  }), []);
  return <MediaLibrary actions={actions} />;
}
