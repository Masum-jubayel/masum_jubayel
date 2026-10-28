import "server-only";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { cache } from "react";
import { getPublicSupabase } from "@/lib/supabase/server";
import { readingTime } from "@/lib/utils";

export const blogCategories = [
  "Cisco Networking",
  "Routing and Switching",
  "Network Troubleshooting",
  "IT Infrastructure",
  "Cybersecurity Fundamentals",
  "Computer Security and Digital Forensics",
  "Device Provisioning and Automation",
  "PoC Radio and Telecommunications",
  "Web Development",
  "Technical Career Development",
] as const;

export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  cover?: string;
  /** Animated cover style used when there is no cover image. */
  coverStyle?: string;
  featured?: boolean;
  /** Files shown under the article (photos, videos, PDF, Office…). */
  attachments?: { title: string; url: string; note?: string }[];
  readingTime: number;
  source: "file" | "db";
};
export type Post = PostMeta & { content: string };
export type TocItem = { id: string; text: string; depth: 2 | 3 };

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

async function getFilePosts(): Promise<Post[]> {
  let files: string[] = [];
  try {
    files = (await fs.readdir(BLOG_DIR)).filter((f) => /\.mdx?$/.test(f));
  } catch {
    return [];
  }
  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(BLOG_DIR, file), "utf8");
      const { data, content } = matter(raw);
      if (data.draft) return null;
      return {
        slug: file.replace(/\.mdx?$/, ""),
        title: String(data.title),
        excerpt: String(data.excerpt || ""),
        date: new Date(data.date).toISOString(),
        updated: data.updated ? new Date(data.updated).toISOString() : undefined,
        category: String(data.category || "IT Infrastructure"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        cover: data.cover ? String(data.cover) : undefined,
        coverStyle: data.coverStyle ? String(data.coverStyle) : undefined,
        featured: Boolean(data.featured),
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        readingTime: readingTime(content),
        content,
        source: "file" as const,
      };
    }),
  );
  return posts.filter(Boolean) as Post[];
}

type DbPost = {
  slug: string; title: string; excerpt: string | null; content: string; category: string | null;
  tags: string[] | null; cover_url: string | null; published_at: string | null; updated_at: string | null;
  cover_style?: string | null; featured?: boolean | null; attachments?: { title: string; url: string; note?: string }[] | null;
};

async function getDbPosts(): Promise<Post[]> {
  const sb = getPublicSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return (data as DbPost[]).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    date: p.published_at || new Date().toISOString(),
    updated: p.updated_at || undefined,
    category: p.category || "IT Infrastructure",
    tags: p.tags || [],
    cover: p.cover_url || undefined,
    coverStyle: p.cover_style || undefined,
    featured: Boolean(p.featured),
    attachments: Array.isArray(p.attachments) ? p.attachments : [],
    readingTime: readingTime(p.content),
    content: p.content,
    source: "db" as const,
  }));
}

/** File posts + published database posts. Database wins on slug conflicts. */
export const getAllPosts = cache(async (): Promise<Post[]> => {
  const [files, db] = await Promise.all([getFilePosts(), getDbPosts()]);
  const map = new Map<string, Post>();
  for (const p of files) map.set(p.slug, p);
  for (const p of db) map.set(p.slug, p);
  return [...map.values()].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || +new Date(b.date) - +new Date(a.date));
});

export async function getPost(slug: string) {
  return (await getAllPosts()).find((p) => p.slug === slug) || null;
}

export function toMeta(p: Post): PostMeta {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content, ...meta } = p;
  return meta;
}

export function getRelated(all: Post[], post: Post, n = 3) {
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: (p.category === post.category ? 3 : 0) + p.tags.filter((t) => post.tags.includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.p);
}

/* ------------------------------- markdown → safe HTML ------------------------------- */

const schema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), ["className", /^language-./] as [string, RegExp]],
    span: [...(defaultSchema.attributes?.span || []), ["className", /^hljs-./] as [string, RegExp]],
    img: [...(defaultSchema.attributes?.img || []), "loading"],
  },
};

type HNode = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: HNode[] };
function textOf(n: HNode): string {
  if (n.type === "text") return n.value || "";
  return (n.children || []).map(textOf).join("");
}

function collectToc(toc: TocItem[]) {
  return () => (tree: HNode) => {
    const walk = (n: HNode) => {
      if (n.type === "element" && (n.tagName === "h2" || n.tagName === "h3") && n.properties?.id) {
        toc.push({ id: String(n.properties.id), text: textOf(n), depth: n.tagName === "h2" ? 2 : 3 });
      }
      if (n.type === "element" && n.tagName === "img") n.properties = { ...n.properties, loading: "lazy" };
      n.children?.forEach(walk);
    };
    walk(tree);
  };
}

/** Markdown is sanitized (even admin-authored content) before highlighting adds safe classes. */
export async function renderMarkdown(md: string) {
  const toc: TocItem[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(collectToc(toc))
    .use(rehypeHighlight, { detect: false, ignoreMissing: true } as never)
    .use(rehypeStringify)
    .process(md);
  return { html: String(file), toc };
}
