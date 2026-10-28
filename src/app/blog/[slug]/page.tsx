import { Attachments } from "@/components/ui/Attachments";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MessageSquare } from "lucide-react";
import { getAllPosts, getPost, getRelated, renderMarkdown, toMeta } from "@/lib/blog";
import { Toc } from "@/components/blog/Toc";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { PostCard } from "@/components/blog/PostCard";
import { PostCover } from "@/components/blog/PostCover";
import { Comments } from "@/components/blog/Comments";
import { LikeButton } from "@/components/blog/LikeButton";
import { formatDate } from "@/lib/utils";
import { site } from "@/lib/site";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.date, authors: [site.name], tags: post.tags, images: post.cover ? [post.cover] : undefined },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const all = await getAllPosts();
  const related = getRelated(all, post).map(toMeta);
  const { html, toc } = await renderMarkdown(post.content);
  const url = `${site.url}/blog/${post.slug}`;
  const ld = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.excerpt,
    datePublished: post.date, dateModified: post.updated || post.date, author: { "@type": "Person", name: site.name }, url, keywords: post.tags.join(", "),
  };

  return (
    <article className="pb-10 pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="container-x">
        <Link href="/blog" className="btn-ghost -ml-3 text-sm"><ArrowLeft className="h-4 w-4" aria-hidden /> All articles</Link>
        <header className="mx-auto mt-6 max-w-3xl">
          <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="chip text-cyan-300 hover:border-cyan-400/40">{post.category}</Link>
          <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-mist-300">{post.excerpt}</p>
          <p className="mt-5 flex flex-wrap items-center gap-4 font-mono text-xs text-mist-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden /> {post.readingTime} min read</span>
            {post.updated && post.updated !== post.date && <span>Updated {formatDate(post.updated)}</span>}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <LikeButton type="post" id={post.slug} />
            <a href="#comments-title" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-mist-300 transition hover:border-cyan-400/40 hover:text-cyan-200"><MessageSquare className="h-4 w-4" aria-hidden /> Discuss</a>
          </div>
        </header>
        <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl border border-white/[0.06]">
          <PostCover post={post} className="aspect-[21/9] w-full" />
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[1fr_220px]">
          <div className="min-w-0">
            {toc.length > 2 && <details className="glass mb-8 p-4 lg:hidden"><summary className="cursor-pointer text-sm text-mist-200">Table of contents</summary><div className="mt-3"><Toc items={toc} /></div></details>}
            {/* HTML is produced from Markdown and passed through rehype-sanitize */}
            <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
            {(post.attachments ?? []).length > 0 && <Attachments items={post.attachments ?? []} />}
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((t) => <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="chip hover:border-cyan-400/40">#{t}</Link>)}
            </div>
            <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3"><span className="text-sm text-mist-400">Found this useful?</span><LikeButton type="post" id={post.slug} size="lg" label="Like" /></div>
              <ShareButtons url={url} title={post.title} />
            </div>
            <div className="mt-8"><AuthorCard /></div>
            <Comments slug={post.slug} />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8"><Toc items={toc} /></div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mx-auto mt-20 max-w-6xl">
            <h2 className="text-xl font-semibold">Related articles</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">{related.map((p) => <PostCard key={p.slug} post={p} />)}</div>
          </section>
        )}
      </div>
    </article>
  );
}
