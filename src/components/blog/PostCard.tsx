import Link from "next/link";
import { Clock, Star } from "lucide-react";
import type { PostMeta } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { PostCover } from "./PostCover";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="glass glass-hover group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/8] overflow-hidden border-b border-white/[0.06]">
        <PostCover post={post} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
        {post.featured && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-ink-950/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-300"><Star className="h-3 w-3 fill-current" aria-hidden /> Featured</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">{post.category}</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-mist-100 group-hover:text-white">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-mist-400">{post.excerpt}</p>
        <p className="mt-auto flex items-center gap-3 pt-4 font-mono text-[11px] text-mist-500">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden />{post.readingTime} min read</span>
        </p>
      </div>
    </Link>
  );
}
