"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { highlightIcons } from "@/content/highlights";
import { getAdmin } from "@/lib/supabase/server";
import { postSchema, fieldErrors } from "@/lib/validation/schemas";
import { renderMarkdown } from "@/lib/blog";

async function requireAdmin() {
  const a = await getAdmin();
  if (!a) throw new Error("Not authorized");
  return a;
}
const uuid = z.string().uuid();

export type SaveResult = { ok: boolean; error?: string; fields?: Record<string, string>; id?: string };

export async function savePost(id: string | null, input: unknown): Promise<SaveResult> {
  const { sb } = await requireAdmin();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) };
  const { published_at, ...rest } = parsed.data;
  const row = { ...rest, cover_url: rest.cover_url || null, ...(published_at ? { published_at } : {}) };
  const q = id ? sb.from("posts").update(row).eq("id", uuid.parse(id)).select("id").single() : sb.from("posts").insert(row).select("id").single();
  const { data, error } = await q;
  if (error) return { ok: false, error: error.code === "23505" ? "That slug is already used." : error.message };
  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  revalidatePath("/");
  return { ok: true, id: data.id };
}

export async function setPostFlag(id: string, field: "published" | "featured", value: boolean) {
  const { sb } = await requireAdmin();
  const { data } = await sb.from("posts").update({ [field]: value }).eq("id", uuid.parse(id)).select("slug").single();
  revalidatePath("/blog"); revalidatePath("/"); if (data?.slug) revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/admin");
}

export async function duplicatePost(id: string) {
  const { sb } = await requireAdmin();
  const { data } = await sb.from("posts").select("title,slug,excerpt,content,category,tags,cover_url,cover_style").eq("id", uuid.parse(id)).single();
  if (!data) return;
  const slug = `${data.slug}-copy-${Date.now().toString(36)}`.slice(0, 120);
  const { data: row } = await sb.from("posts").insert({ ...data, slug, title: `${data.title} (copy)`.slice(0, 160), published: false, featured: false }).select("id").single();
  revalidatePath("/admin");
  if (row) redirect(`/admin/posts/${row.id}`);
}

/** Copies a Markdown-file post into the database so it can be edited here (the database copy wins on the site). */
export async function importFilePost(slug: string) {
  const { sb } = await requireAdmin();
  const { getAllPosts } = await import("@/lib/blog");
  const post = (await getAllPosts()).find((p) => p.slug === slug && p.source === "file");
  if (!post) redirect("/admin?tab=posts");
  const { data: existing } = await sb.from("posts").select("id").eq("slug", slug).maybeSingle();
  if (existing) redirect(`/admin/posts/${existing.id}`);
  const style = ["network", "circuit", "matrix", "radar", "waves", "orbit", "terminal", "shield", "pulse", "grid", "binary", "cloud", "chip", "globe", "signal", "lock"].includes(post!.coverStyle ?? "") ? post!.coverStyle : "network";
  const { data: row, error } = await sb.from("posts").insert({
    slug, title: post!.title, excerpt: post!.excerpt.slice(0, 300), content: post!.content, category: post!.category, tags: post!.tags.slice(0, 12),
    cover_url: post!.cover || null, cover_style: style, featured: Boolean(post!.featured), published: true, published_at: post!.date,
  }).select("id").single();
  if (error || !row) redirect(`/admin?tab=posts&error=${encodeURIComponent(error?.message || "Import failed")}`);
  revalidatePath("/blog");
  redirect(`/admin/posts/${row!.id}`);
}

export async function deletePost(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("posts").delete().eq("id", uuid.parse(id));
  revalidatePath("/blog");
  redirect("/admin?tab=posts");
}

export async function previewMarkdown(md: string) {
  await requireAdmin();
  return (await renderMarkdown(md.slice(0, 100_000))).html;
}

export async function setCommentStatus(id: string, status: "visible" | "hidden" | "pending") {
  const { sb } = await requireAdmin();
  await sb.from("comments").update({ status }).eq("id", uuid.parse(id));
  revalidatePath("/admin");
}

export async function hardDeleteComment(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("comments").delete().eq("id", uuid.parse(id));
  revalidatePath("/admin");
}

export async function resolveReport(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("comment_reports").update({ resolved: true }).eq("id", uuid.parse(id));
  revalidatePath("/admin");
}

export async function setMessageRead(id: string, read: boolean) {
  const { sb } = await requireAdmin();
  await sb.from("contact_messages").update({ read }).eq("id", uuid.parse(id));
  revalidatePath("/admin");
}

export async function deleteMessage(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("contact_messages").delete().eq("id", uuid.parse(id));
  revalidatePath("/admin");
}

export async function setModeration(enabled: boolean) {
  const { sb } = await requireAdmin();
  await sb.from("app_settings").upsert({ key: "comment_moderation", value: enabled });
  revalidatePath("/admin");
}

/* ---------------- Gallery ---------------- */

const galleryInput = z.object({
  title: z.string().trim().min(2, "Add a title (2+ characters).").max(120),
  caption: z.string().trim().max(300).default(""),
  category: z.string().trim().min(2).max(40),
  kind: z.enum(["photo", "illustration"]),
  image_url: z.string().url().max(600),
  storage_path: z.string().max(300).optional(),
  featured: z.boolean().default(false),
});

export async function createGalleryItem(input: unknown): Promise<SaveResult> {
  const { sb } = await requireAdmin();
  const parsed = galleryInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || "Invalid details." };
  const { data, error } = await sb.from("gallery_items").insert(parsed.data).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/gallery");
  revalidatePath("/admin");
  return { ok: true, id: data.id };
}

export async function setGalleryFlag(id: string, field: "featured" | "published", value: boolean) {
  const { sb } = await requireAdmin();
  await sb.from("gallery_items").update({ [field]: value }).eq("id", uuid.parse(id));
  revalidatePath("/gallery");
  revalidatePath("/admin");
}

export async function deleteGalleryItem(id: string) {
  const { sb } = await requireAdmin();
  const { data } = await sb.from("gallery_items").select("storage_path").eq("id", uuid.parse(id)).maybeSingle();
  if (data?.storage_path) await sb.storage.from("gallery").remove([data.storage_path]);
  await sb.from("gallery_items").delete().eq("id", id);
  revalidatePath("/gallery");
  revalidatePath("/admin");
}

/* ---------------- Contact replies ---------------- */

/** Email a reply to a contact message through Resend; the reply is saved with the message. */
export async function replyToMessage(id: string, subject: string, body: string): Promise<SaveResult> {
  const { sb } = await requireAdmin();
  const { serverEnv } = await import("@/lib/env");
  const env = serverEnv();
  const parsed = z.object({ id: uuid, subject: z.string().trim().min(2).max(200), body: z.string().trim().min(5).max(20000) }).safeParse({ id, subject, body });
  if (!parsed.success) return { ok: false, error: "Write a subject and a message." };
  const { data: m } = await sb.from("contact_messages").select("email,name").eq("id", parsed.data.id).maybeSingle();
  if (!m) return { ok: false, error: "Message not found." };
  if (!env.resendApiKey) return { ok: false, error: "Email sending isn’t set up (RESEND_API_KEY). Use “Open in email app” instead." };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.contactFrom, to: [m.email], subject: parsed.data.subject, text: parsed.data.body, ...(env.contactTo ? { reply_to: env.contactTo } : {}) }),
  });
  if (!res.ok) return { ok: false, error: `Email service error (${res.status}).` };
  await sb.from("contact_messages").update({ read: true, replied_at: new Date().toISOString(), reply: parsed.data.body.slice(0, 20000) }).eq("id", parsed.data.id);
  revalidatePath("/admin");
  return { ok: true };
}

/* ---------------- Resume ---------------- */

export async function setResume(url: string, path: string): Promise<SaveResult> {
  const { sb } = await requireAdmin();
  if (!z.string().url().safeParse(url).success || !/\.pdf$/i.test(path)) return { ok: false, error: "Invalid file." };
  const { data: prev } = await sb.from("app_settings").select("value").eq("key", "resume").maybeSingle();
  const { error } = await sb.from("app_settings").upsert({ key: "resume", value: { url, path, updated_at: new Date().toISOString() } });
  if (error) return { ok: false, error: error.message };
  const old = (prev?.value as { path?: string } | undefined)?.path;
  if (old && old !== path) await sb.storage.from("resumes").remove([old]);
  revalidatePath("/resume");
  revalidatePath("/admin");
  return { ok: true };
}

export async function resetResume() {
  const { sb } = await requireAdmin();
  const { data: prev } = await sb.from("app_settings").select("value").eq("key", "resume").maybeSingle();
  const old = (prev?.value as { path?: string } | undefined)?.path;
  if (old) await sb.storage.from("resumes").remove([old]);
  await sb.from("app_settings").delete().eq("key", "resume");
  revalidatePath("/resume");
  revalidatePath("/admin");
}

/* ---------------- Highlights (home-page cards) ---------------- */

const highlightInput = z.object({
  value: z.string().trim().min(1).max(16),
  label: z.string().trim().min(2).max(80),
  source: z.string().trim().max(80),
  tag: z.string().trim().max(20),
  icon: z.string().refine((v) => (highlightIcons as string[]).includes(v), "Unknown icon"),
  hue: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sort: z.coerce.number().int().min(0).max(9999),
});

export async function createHighlight(form: FormData) {
  const { sb } = await requireAdmin();
  const parsed = highlightInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect(`/admin?tab=highlights&error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid card")}`);
  await sb.from("highlights").insert(parsed.data);
  revalidatePath("/");
  redirect("/admin?tab=highlights&saved=1");
}

export async function setHighlightPublished(id: string, published: boolean) {
  const { sb } = await requireAdmin();
  await sb.from("highlights").update({ published }).eq("id", uuid.parse(id));
  revalidatePath("/"); revalidatePath("/admin");
}

export async function updateHighlight(id: string, form: FormData) {
  const { sb } = await requireAdmin();
  const parsed = highlightInput.omit({ sort: true }).safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect(`/admin?tab=highlights&error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid card")}`);
  await sb.from("highlights").update(parsed.data).eq("id", uuid.parse(id));
  revalidatePath("/");
  redirect("/admin?tab=highlights&updated=1");
}

/** Moves a card one place up (-1) or down (+1) and renumbers all cards 10, 20, 30… */
export async function moveHighlight(id: string, dir: -1 | 1) {
  const { sb } = await requireAdmin();
  const target = uuid.parse(id);
  const { data } = await sb.from("highlights").select("id,sort").order("sort").order("created_at");
  if (!data) return;
  const ids = data.map((r) => r.id as string);
  const i = ids.indexOf(target), j = i + (dir < 0 ? -1 : 1);
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(ids.map((rid, k) => sb.from("highlights").update({ sort: (k + 1) * 10 }).eq("id", rid)));
  revalidatePath("/"); revalidatePath("/admin");
}

export async function deleteHighlight(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("highlights").delete().eq("id", uuid.parse(id));
  revalidatePath("/"); revalidatePath("/admin");
}

/* ---------------- Page content ---------------- */

export async function saveContent(key: string, value: unknown): Promise<SaveResult> {
  const { sb } = await requireAdmin();
  const { sanitizeSection, sectionByKey } = await import("@/content/cms");
  if (!(key in sectionByKey)) return { ok: false, error: "Unknown section." };
  let clean: unknown;
  try { clean = sanitizeSection(key as never, value); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const { error } = await sb.from("site_content").upsert({ key, value: clean, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Flip a single Site-controls switch (used by the Overview quick switches). */
export async function setLayoutFlag(field: string, value: boolean): Promise<SaveResult> {
  const { sb } = await requireAdmin();
  const { sanitizeSection, defaultLayout } = await import("@/content/cms");
  if (!(field in defaultLayout) || typeof (defaultLayout as Record<string, unknown>)[field] !== "boolean") return { ok: false, error: "Unknown switch." };
  const { data } = await sb.from("site_content").select("value").eq("key", "layout").maybeSingle();
  const current = (data?.value && typeof data.value === "object" ? data.value : {}) as Record<string, unknown>;
  let clean: unknown;
  try { clean = sanitizeSection("layout", { ...current, [field]: value }); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const { error } = await sb.from("site_content").upsert({ key: "layout", value: clean, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function resetContent(key: string): Promise<SaveResult> {
  const { sb } = await requireAdmin();
  await sb.from("site_content").delete().eq("key", key);
  revalidatePath("/", "layout");
  return { ok: true };
}


/* ---------------- Memories (gallery feed) ---------------- */

const memoryInput = z.object({
  body: z.string().trim().min(1, "Write something for the post.").max(5000),
  images: z.array(z.string().max(600).regex(/^(https?:\/\/|\/)/, "Invalid file URL")).max(30),
  location: z.string().trim().max(120),
  feeling: z.string().trim().max(40),
  date: z.union([z.literal(""), z.string().datetime({ offset: true })]),
  pinned: z.boolean(),
  published: z.boolean(),
  photoFit: z.enum(["fill", "fit"]).default("fill"),
  photoFocus: z.enum(["top", "center", "bottom"]).default("center"),
  photoSize: z.enum(["compact", "normal", "large"]).default("normal"),
});
export type MemoryInput = z.infer<typeof memoryInput>;

function memoryRow(d: MemoryInput) {
  return { body: d.body, images: d.images, location: d.location, feeling: d.feeling, pinned: d.pinned, published: d.published, photo_fit: d.photoFit, photo_focus: d.photoFocus, photo_size: d.photoSize, ...(d.date ? { memory_date: d.date } : {}), updated_at: new Date().toISOString() };
}

export async function saveMemory(id: string | null, input: unknown): Promise<SaveResult> {
  const { sb } = await requireAdmin();
  const parsed = memoryInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || "Invalid post." };
  const q = id ? sb.from("memories").update(memoryRow(parsed.data)).eq("id", uuid.parse(id)).select("id").single() : sb.from("memories").insert(memoryRow(parsed.data)).select("id").single();
  const { data, error } = await q;
  if (error) return { ok: false, error: error.message };
  revalidatePath("/gallery");
  return { ok: true, id: data.id };
}

export async function setMemoryFlag(id: string, field: "pinned" | "published", value: boolean) {
  const { sb } = await requireAdmin();
  await sb.from("memories").update({ [field]: value }).eq("id", uuid.parse(id));
  revalidatePath("/gallery"); revalidatePath("/admin");
}

export async function deleteMemory(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("memories").delete().eq("id", uuid.parse(id));
  revalidatePath("/gallery"); revalidatePath("/admin");
}


/* ---------------- Backup & restore ---------------- */

/** Everything you manage in the admin, as one JSON document (for safe-keeping or moving to a new project). */
export async function exportBackup(): Promise<string> {
  const { sb } = await requireAdmin();
  const [content, highlights, memories, posts, gallery, settings] = await Promise.all([
    sb.from("site_content").select("key,value,updated_at"),
    sb.from("highlights").select("value,label,source,tag,icon,hue,sort,published"),
    sb.from("memories").select("body,images,location,feeling,memory_date,pinned,published,photo_fit,photo_focus,photo_size"),
    sb.from("posts").select("slug,title,excerpt,content,category,tags,cover_url,cover_style,featured,published,published_at"),
    sb.from("gallery_items").select("title,caption,category,kind,image_url,featured,published,sort"),
    sb.from("app_settings").select("key,value"),
  ]);
  return JSON.stringify({
    version: 1, exportedAt: new Date().toISOString(),
    site_content: content.data ?? [], highlights: highlights.data ?? [], memories: memories.data ?? [],
    posts: posts.data ?? [], gallery_items: gallery.data ?? [], app_settings: settings.data ?? [],
  }, null, 2);
}

/** Restores page content (site_content) from a backup. Each section is re-validated before saving. */
export async function importContentBackup(json: string): Promise<{ ok: boolean; message: string }> {
  const { sb } = await requireAdmin();
  let data: { site_content?: { key: string; value: unknown }[] };
  try { data = JSON.parse(json.slice(0, 2_000_000)); } catch { return { ok: false, message: "That file isn’t valid JSON." }; }
  const rows = Array.isArray(data.site_content) ? data.site_content : [];
  if (!rows.length) return { ok: false, message: "No page content found in this backup." };
  const { sanitizeSection, sectionByKey } = await import("@/content/cms");
  let saved = 0; const skipped: string[] = [];
  for (const r of rows) {
    if (!r || typeof r.key !== "string" || !(r.key in sectionByKey)) { skipped.push(String(r?.key)); continue; }
    try {
      const clean = sanitizeSection(r.key as never, r.value);
      const { error } = await sb.from("site_content").upsert({ key: r.key, value: clean, updated_at: new Date().toISOString() });
      if (error) skipped.push(r.key); else saved++;
    } catch { skipped.push(r.key); }
  }
  revalidatePath("/", "layout");
  return { ok: saved > 0, message: `Restored ${saved} section${saved === 1 ? "" : "s"}${skipped.length ? ` · skipped: ${skipped.join(", ")}` : ""}.` };
}
