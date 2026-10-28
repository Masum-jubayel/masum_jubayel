import { z } from "zod";

const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

export const contactSchema = z.object({
  name: z.string().transform(clean).pipe(z.string().min(2, "Please enter your name.").max(100, "Name is too long.")),
  email: z.string().transform(clean).pipe(z.string().email("Please enter a valid email address.").max(200)),
  subject: z.string().transform(clean).pipe(z.string().min(3, "Please add a subject.").max(150, "Subject is too long.")),
  message: z.string().transform(clean).pipe(z.string().min(20, "Message should be at least 20 characters.").max(5000, "Message is too long (5,000 characters max).")),
  website: z.string().optional(), // honeypot — must stay empty
  startedAt: z.number().optional(), // render timestamp for timing check
});
export type ContactInput = z.input<typeof contactSchema>;

export const commentSchema = z.object({
  postSlug: z.string().regex(/^[a-z0-9-]{1,120}$/, "Invalid post."),
  parentId: z.string().uuid().nullable().optional(),
  authorName: z.string().transform(clean).pipe(z.string().min(2, "Display name must be at least 2 characters.").max(60, "Display name is too long.")),
  body: z.string().transform(clean).pipe(z.string().min(2, "Comment is too short.").max(2000, "Comments are limited to 2,000 characters.")),
  website: z.string().optional(),
});

export const commentEditSchema = z.object({
  body: z.string().transform(clean).pipe(z.string().min(2).max(2000)),
});

export const reportSchema = z.object({
  reason: z.string().transform(clean).pipe(z.string().min(3, "Please describe the problem.").max(500)),
});

export const postSchema = z.object({
  title: z.string().transform(clean).pipe(z.string().min(3).max(160)),
  slug: z.string().regex(/^[a-z0-9-]{3,120}$/, "Slug: lowercase letters, numbers and dashes only."),
  excerpt: z.string().transform(clean).pipe(z.string().max(300)),
  category: z.string().min(2).max(80),
  tags: z.array(z.string().min(1).max(40)).max(12),
  cover_url: z.union([z.literal(""), z.string().url().max(500), z.string().regex(/^\/[^\s]{1,400}$/, "Use a full URL or a /path.")]),
  cover_style: z.enum(["network", "circuit", "matrix", "radar", "waves", "orbit", "terminal", "shield", "pulse", "grid", "binary", "cloud", "chip", "globe", "signal", "lock"]).default("network"),
  featured: z.boolean().default(false),
  attachments: z.array(z.object({ title: z.string().max(200).default(""), url: z.string().max(800).regex(/^(https?:\/\/|\/)/, "Use a full URL or a /path."), note: z.string().max(300).optional() })).max(40).default([]),
  /** Optional publish date (ISO) — lets you backdate or schedule the date shown on the post. */
  published_at: z.union([z.literal(""), z.null(), z.string().datetime({ offset: true })]).optional(),
  content: z.string().min(10).max(100_000),
  published: z.boolean(),
});

export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) out[String(i.path[0] ?? "form")] ||= i.message;
  return out;
}
