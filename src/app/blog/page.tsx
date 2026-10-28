import { getContent } from "@/lib/content";
import { headingTitle } from "@/components/ui/HeadingText";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { blogCategories, getAllPosts, toMeta } from "@/lib/blog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Tutorials and notes on Cisco networking, troubleshooting, IT infrastructure, device provisioning and cybersecurity fundamentals.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
};

export default async function BlogPage() {
  const posts = (await getAllPosts()).map(toMeta);
  const hd = (await getContent()).pages.blog_header;
  return (
    <>
      <PageHeader eyebrow={hd.eyebrow} title={headingTitle(hd)}>
        {hd.text}
      </PageHeader>
      <section className="container-x py-14">
        {posts.length === 0 ? (
          <p className="glass p-10 text-center text-mist-400">No articles published yet.</p>
        ) : (
          <Suspense fallback={<p className="text-sm text-mist-400">Loading…</p>}>
            <BlogExplorer posts={posts} categories={blogCategories} />
          </Suspense>
        )}
      </section>
    </>
  );
}
