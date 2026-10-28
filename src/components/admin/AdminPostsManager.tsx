"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { PostsManager, type PostRow, type PostsActions } from "./PostsManager";
import { deletePost, duplicatePost, importFilePost, setPostFlag } from "@/app/admin/actions";

export function AdminPostsManager({ rows, categories }: { rows: PostRow[]; categories: readonly string[] }) {
  const router = useRouter();
  const actions = useMemo<PostsActions>(() => ({
    onNew: () => router.push("/admin/posts/new"),
    onEdit: (r) => { if (r.id) router.push(`/admin/posts/${r.id}`); else importFilePost(r.slug); },
    onView: (r) => window.open(`/blog/${r.slug}`, "_blank", "noopener"),
    setFlag: async (id, f, v) => { await setPostFlag(id, f, v); router.refresh(); },
    duplicate: async (id) => { await duplicatePost(id); },
    remove: async (id) => { await deletePost(id); },
    importFile: async (slug) => { await importFilePost(slug); },
  }), [router]);
  return <PostsManager rows={rows} categories={categories} actions={actions} />;
}
