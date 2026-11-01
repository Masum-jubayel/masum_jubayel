import { NextResponse } from "next/server";
import { z } from "zod";
import { commentEditSchema, fieldErrors } from "@/lib/validation/schemas";
import { getAdminSupabase, getSessionUser } from "@/lib/supabase/server";
import { visitorKey } from "@/lib/visitor";
import { looksLikeSpam } from "@/lib/spam";
import { dbErrorMessage } from "@/lib/comments";

const idSchema = z.string().uuid();

async function ctx(params: Promise<{ id: string }>) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return { error: NextResponse.json({ error: "Invalid comment." }, { status: 400 }) };
  const { sb, user } = await getSessionUser();
  if (!sb) return { error: NextResponse.json({ error: "Comments are not configured." }, { status: 503 }) };
  if (user) return { id, sb, user, guestKey: null as string | null };
  // Guests can edit / delete their own comments, matched by the hashed browser cookie.
  const adminSb = getAdminSupabase();
  const guestKey = await visitorKey(false, "guest");
  if (!adminSb || !guestKey) return { error: NextResponse.json({ error: "You can only change your own comments." }, { status: 403 }) };
  return { id, sb: adminSb, user: null, guestKey };
}

/** Edit own comment (RLS + trigger enforce ownership and editable fields). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await ctx(params);
  if ("error" in c) return c.error;
  const parsed = commentEditSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Comment must be 2–2,000 characters.", fields: fieldErrors(parsed.error) }, { status: 422 });
  if (looksLikeSpam(parsed.data.body)) return NextResponse.json({ error: "Your comment looks like spam." }, { status: 422 });
  let q = c.sb.from("comments").update(c.user ? { body: parsed.data.body } : { body: parsed.data.body, edited_at: new Date().toISOString() }).eq("id", c.id).is("deleted_at", null);
  q = c.user ? q.eq("user_id", c.user.id) : q.eq("guest_key", c.guestKey!);
  const { data, error } = await q.select("id").maybeSingle();
  if (error) return NextResponse.json({ error: dbErrorMessage(error.message) }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Comment not found or not yours." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/** Soft-delete own comment (keeps replies readable). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await ctx(params);
  if ("error" in c) return c.error;
  let q = c.sb.from("comments").update({ deleted_at: new Date().toISOString(), body: "" }).eq("id", c.id);
  q = c.user ? q.eq("user_id", c.user.id) : q.eq("guest_key", c.guestKey!);
  const { data, error } = await q.select("id").maybeSingle();
  if (error) return NextResponse.json({ error: dbErrorMessage(error.message) }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Comment not found or not yours." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
