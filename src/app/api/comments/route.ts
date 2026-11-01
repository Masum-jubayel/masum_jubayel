import { NextResponse } from "next/server";
import { commentSchema, fieldErrors } from "@/lib/validation/schemas";
import { getAdminSupabase, getSessionUser } from "@/lib/supabase/server";
import { site } from "@/lib/site";
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

  // Which commenters are the site owner (admin accounts)? Profiles are private, so ask with the server key.
  const rows = data as Row[];
  // Names always come from each commenter's current profile, so a renamed reader shows the same name everywhere.
  const authorIds = new Set<string>();
  const names = new Map<string, string>();
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const adminSb = getAdminSupabase();
  if (adminSb && ids.length) {
    const { data: profs } = await adminSb.from("profiles").select("id,display_name,is_admin").in("id", ids);
    (profs || []).forEach((p: { id: string; display_name: string | null; is_admin: boolean }) => {
      if (p.is_admin) authorIds.add(p.id);
      const n = p.display_name || (p.is_admin ? site.name : "");
      if (n) names.set(p.id, n);
    });
  }

  const comments: CommentDTO[] = rows.map((r) => ({
    id: r.id,
    parentId: r.parent_id,
    authorName: r.deleted_at ? "" : names.get(r.user_id) || r.author_name,
    body: r.deleted_at ? "" : r.body,
    createdAt: r.created_at,
    editedAt: r.edited_at,
    deleted: Boolean(r.deleted_at),
    status: r.status,
    mine: !!user && r.user_id === user.id,
    isAuthor: authorIds.has(r.user_id),
  }));

  return NextResponse.json({
    configured: true,
    comments,
    user: user ? { email: user.email, displayName: profile?.display_name || (profile?.is_admin ? site.name : ""), isAdmin: !!profile?.is_admin } : null,
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

  // The name always comes from the commenter's profile in the database (the site owner falls back to the site name).
  // A name sent by the browser is only used once, to set up a profile that has none yet.
  const { data: profile } = await sb.from("profiles").select("display_name,is_admin").eq("id", user.id).maybeSingle();
  let name = profile?.display_name || (profile?.is_admin ? site.name : "");
  if (!name) {
    if (!authorName || authorName.length < 2) return NextResponse.json({ error: "Choose a display name first." }, { status: 422 });
    name = authorName;
  }
  if (!profile?.display_name) await sb.from("profiles").update({ display_name: name }).eq("id", user.id);

  const { data, error } = await sb
    .from("comments")
    .insert({ post_slug: postSlug, parent_id: parentId ?? null, author_name: name, body, user_id: user.id })
    .select("id,status")
    .single();
  if (error) return NextResponse.json({ error: dbErrorMessage(error.message) }, { status: error.message.includes("RATE_LIMIT") ? 429 : 400 });

  return NextResponse.json({ ok: true, id: data.id, status: data.status }, { status: 201 });
}
