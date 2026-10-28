import { getAllPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const posts = await getAllPosts();
  const items = posts.map((p) => `<item><title>${esc(p.title)}</title><link>${site.url}/blog/${p.slug}</link><guid>${site.url}/blog/${p.slug}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${esc(p.excerpt)}</description><category>${esc(p.category)}</category></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)} — Blog</title><link>${site.url}/blog</link><description>Networking and cybersecurity notes</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
