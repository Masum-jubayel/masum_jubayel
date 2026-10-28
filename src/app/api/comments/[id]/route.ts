import { NextResponse } from "next/server";
import { z } from "zod";
import { commentEditSchema, fieldErrors } from "@/lib/validation/schemas";
import { getSessionUser } from "@/lib/supabase/server";
import { looksLikeSpam } from "@/lib/spam";
import { dbErrorMessage } from "@/lib/comments";

const idSchema = z.string().uuid();

async function ctx(params: Promise<{ id: string }>) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return { error: NextResponse.json({ error: "Invalid comment." }, { status: 400 }) };
  const { sb, user } = await getSessionUser();
  if (!sb) return { error: NextResponse.json({ error: "Comments are not configured." }, { status: 503 }) };
  if (!user) return { error: NextResponse.json({ error: "Please sign in." }, { status: 401 }) };
  return { id, sb, user };
}

/** Edit own comment (RLS + trigger enforce ownership and editable fields). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await ctx(params);
  if ("error" in c) return c.error;
  const parsed = commentEditSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Comment must be 2–2,000 characters.", fields: fieldErrors(parsed.error) }, { status: 422 });
  if (looksLikeSpam(parsed.data.body)) return NextResponse.json({ error: "Your comment looks like spam." }, { status: 422 });
  const { data, error } = await c.sb.from("comments").update({ body: parsed.data.body }).eq("id", c.id).eq("user_id", c.user.id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: dbErrorMessage(error.message) }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Comment not found or not yours." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/** Soft-delete own comment (keeps replies readable). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await ctx(params);
  if ("error" in c) return c.error;
  const { data, error } = await c.sb.from("comments").update({ deleted_at: new Date().toISOString(), body: "" }).eq("id", c.id).eq("user_id", c.user.id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: dbErrorMessage(error.message) }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Comment not found or not yours." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
