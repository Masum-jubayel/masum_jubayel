import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPostEditor } from "@/components/admin/AdminPostEditor";
import { blogCategories } from "@/lib/blog";

export default function NewPostPage() {
  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin?tab=posts" className="btn-ghost -ml-3 text-sm"><ArrowLeft className="h-4 w-4" aria-hidden /> All posts</Link>
        <h1 className="text-2xl font-semibold">New post</h1>
      </div>
      <AdminPostEditor categories={blogCategories} initial={{ id: null, title: "", slug: "", excerpt: "", category: blogCategories[0], tags: [], cover_url: "", content: "## Introduction\n\nStart writing…", published: false, featured: false, cover_style: "network", published_at: "" }} />
    </>
  );
}
