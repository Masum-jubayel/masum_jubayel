import { NextResponse } from "next/server";
import { commentSchema, fieldErrors } from "@/lib/validation/schemas";
import { getSessionUser } from "@/lib/supabase/server";
import { clientIp, hashIp, rateLimit } from "@/lib/rateLimit";
import { looksLikeSpam } from "@/lib/spam";
import { dbErrorMessage, type CommentDTO } from "@/lib/comments";

export const dynamic = "force-dynamic";

type Row = { id: string; parent_id: string | null; user_id: string; author_name: string; body: string; created_at: string; edited_at: string | null; deleted_at: string | null; status: CommentDTO["status"] };

const notConfigured = () => NextResponse.json({ configured: false, comments: [], user: null }, { status: 200 });

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });
  const { sb, user } = await getSessionUser();
  if (!sb) return notConfigured();

  const { data, error } = await sb
    .from("comments")
    .select("id,parent_id,user_id,author_name,body,created_at,edited_at,deleted_at,status")
    .eq("post_slug", slug)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) return NextResponse.json({ error: "Couldn’t load comments." }, { status: 500 });

  let profile: { display_name: string | null; is_admin: boolean } | null = null;
  if (user) {
    const { data: p } = await sb.from("profiles").select("display_name,is_admin").eq("id", user.id).maybeSingle();
    profile = p;
  }

  const comments: CommentDTO[] = (data as Row[]).map((r) => ({
    id: r.id,
    parentId: r.parent_id,
    authorName: r.deleted_at ? "" : r.author_name,
    body: r.deleted_at ? "" : r.body,
    createdAt: r.created_at,
    editedAt: r.edited_at,
    deleted: Boolean(r.deleted_at),
    status: r.status,
    mine: !!user && r.user_id === user.id,
  }));

  return NextResponse.json({
    configured: true,
    comments,
    user: user ? { email: user.email, displayName: profile?.display_name || "", isAdmin: !!profile?.is_admin } : null,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const { sb, user } = await getSessionUser();
  if (!sb) return NextResponse.json({ error: "Comments are not configured." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Please sign in to comment." }, { status: 401 });

  const rl = rateLimit(`comment:${user.id}:${hashIp(clientIp(req.headers))}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "You’re commenting too quickly. Please wait a moment." }, { status: 429 });

  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = commentSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  const { postSlug, parentId, authorName, body, website } = parsed.data;
  if (website) return NextResponse.json({ ok: true });
  if (looksLikeSpam(body)) return NextResponse.json({ error: "Your comment looks like spam (too many links or blocked words)." }, { status: 422 });

  // remember the display name for next time
  await sb.from("profiles").update({ display_name: authorName }).eq("id", user.id);

  const { data, error } = await sb
    .from("comments")
    .insert({ post_slug: postSlug, parent_id: parentId ?? null, author_name: authorName, body, user_id: user.id })
    .select("id,status")
    .single();
  if (error) return NextResponse.json({ error: dbErrorMessage(error.message) }, { status: error.message.includes("RATE_LIMIT") ? 429 : 400 });

  return NextResponse.json({ ok: true, id: data.id, status: data.status }, { status: 201 });
}
