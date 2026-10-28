import type { MetadataRoute } from "next";
import { site, nav } from "@/lib/site";
import { projects } from "@/content/projects";
import { getAllPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  return [
    ...nav.map((n) => ({ url: `${site.url}${n.href === "/" ? "" : n.href}`, changeFrequency: "monthly" as const, priority: n.href === "/" ? 1 : 0.7 })),
    { url: `${site.url}/gallery/memories`, changeFrequency: "weekly" as const, priority: 0.6 },
    ...projects.filter((p) => p.status === "published").map((p) => ({ url: `${site.url}/projects/${p.slug}`, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.updated || p.date, priority: 0.6 })),
  ];
}
