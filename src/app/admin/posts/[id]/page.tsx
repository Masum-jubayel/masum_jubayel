import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminPostEditor } from "@/components/admin/AdminPostEditor";
import { blogCategories } from "@/lib/blog";
import { getAdmin } from "@/lib/supabase/server";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const { sb } = (await getAdmin())!;
  const { data } = await sb.from("posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin?tab=posts" className="btn-ghost -ml-3 text-sm"><ArrowLeft className="h-4 w-4" aria-hidden /> All posts</Link>
        <h1 className="text-2xl font-semibold">Edit post</h1>
        {data.published && <Link href={`/blog/${data.slug}`} target="_blank" className="btn-ghost ml-auto text-sm"><ExternalLink className="h-4 w-4" aria-hidden /> View live</Link>}
      </div>
      <AdminPostEditor categories={blogCategories} initial={{
        id: data.id, title: data.title, slug: data.slug, excerpt: data.excerpt || "", category: data.category || blogCategories[0], tags: data.tags || [],
        cover_url: data.cover_url || "", content: data.content, published: data.published, featured: Boolean(data.featured), cover_style: data.cover_style || "network",
        published_at: data.published_at || "", attachments: Array.isArray(data.attachments) ? data.attachments : [],
      }} />
    </>
  );
}
