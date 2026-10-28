"use client";

import { uploadAny } from "@/lib/upload";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { PostEditor, type EditablePost, type PostEditorActions } from "./PostEditor";
import { deletePost, previewMarkdown, savePost } from "@/app/admin/actions";
import { getBrowserSupabase } from "@/lib/supabase/client";

/** Connects the PostEditor UI to the real server actions and Supabase storage. */
export function AdminPostEditor({ initial, categories }: { initial: EditablePost; categories: readonly string[] }) {
  const router = useRouter();
  const actions = useMemo<PostEditorActions>(() => ({
    save: (id, payload) => savePost(id, payload),
    preview: (md) => previewMarkdown(md),
    remove: (id) => deletePost(id),
    uploadImage: async (file) => {
      const sb = getBrowserSupabase();
      if (!sb) throw new Error("Supabase isn’t configured.");
      const path = `blog/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase()}`;
      const { error } = await sb.storage.from("gallery").upload(path, file, { contentType: file.type });
      if (error) throw error;
      return sb.storage.from("gallery").getPublicUrl(path).data.publicUrl;
    },
    uploadFile: (file) => uploadAny(file, "posts"),
    onSaved: (id, isNew) => { if (isNew) router.replace(`/admin/posts/${id}`); router.refresh(); },
  }), [router]);
  return <PostEditor initial={initial} categories={categories} actions={actions} />;
}
