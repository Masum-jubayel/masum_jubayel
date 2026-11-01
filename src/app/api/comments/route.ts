import { NextResponse } from "next/server";
import { commentSchema, fieldErrors } from "@/lib/validation/schemas";
import { getAdminSupabase, getSessionUser } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { clientIp, hashIp, rateLimit } from "@/lib/rateLimit";
import { looksLikeSpam } from "@/lib/spam";
import { reservedName, visitorKey } from "@/lib/visitor";
import { dbErrorMessage, type CommentDTO } from "@/lib/comments";

export const dynamic = "force-dynamic";

type Row = { id: string; parent_id: string | null; user_id: string | null; guest_key: string | null; author_name: string; body: string; created_at: string; edited_at: string | null; deleted_at: string | null; status: CommentDTO["status"] };
const COLS = "id,parent_id,user_id,guest_key,author_name,body,created_at,edited_at,deleted_at,status";

const notConfigured = () => NextResponse.json({ configured: false, comments: [], user: null, guests: false }, { status: 200 });

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });
  const { sb, user } = await getSessionUser();
  if (!sb) return notConfigured();
  const adminSb = getAdminSupabase();
  const guestKey = user ? null : await visitorKey(false, "guest");
  let profile: { display_name: string | null; is_admin: boolean } | null = null;
  if (user) {
    const { data: p } = await sb.from("profiles").select("display_name,is_admin").eq("id", user.id).maybeSingle();
    profile = p;
  }

  // Visible comments (plus the reader's own pending ones). The server key is used when available so guests see their own pending comments too.
  const reader = adminSb ?? sb;
  let q = reader.from("comments").select(COLS).eq("post_slug", slug).order("created_at", { ascending: true }).limit(500);
  if (adminSb && !profile?.is_admin) {
    const own = user ? `user_id.eq.${user.id}` : guestKey ? `guest_key.eq.${guestKey}` : "";
    q = q.or(own ? `status.eq.visible,${own}` : "status.eq.visible");
  }
  const { data, error } = await q;
  if (error) {
    // Database not upgraded for guest comments yet: fall back to the old query.
    const { data: d2, error: e2 } = await sb.from("comments").select("id,parent_id,user_id,author_name,body,created_at,edited_at,deleted_at,status").eq("post_slug", slug).order("created_at", { ascending: true }).limit(500);
    if (e2) return NextResponse.json({ error: "Couldn’t load comments." }, { status: 500 });
    return build(d2 as Row[], false);
  }
  return build(data as Row[], true);

  async function build(rows: Row[], guests: boolean) {
    // Signed-in commenters always show their current profile name; the site owner gets an Author badge.
    const authorIds = new Set<string>();
    const names = new Map<string, string>();
    const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
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
      authorName: r.deleted_at ? "" : (r.user_id && names.get(r.user_id)) || r.author_name,
      body: r.deleted_at ? "" : r.body,
      createdAt: r.created_at,
      editedAt: r.edited_at,
      deleted: Boolean(r.deleted_at),
      status: r.status,
      mine: user ? r.user_id === user.id : !!guestKey && r.guest_key === guestKey,
      isAuthor: !!r.user_id && authorIds.has(r.user_id),
      guest: !r.user_id,
    }));
    return NextResponse.json({
      configured: true,
      guests: guests && !!adminSb,
      comments,
      user: user ? { email: user.email, displayName: profile?.display_name || (profile?.is_admin ? site.name : ""), isAdmin: !!profile?.is_admin } : null,
    }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  const { sb, user } = await getSessionUser();
  if (!sb) return NextResponse.json({ error: "Comments are not configured." }, { status: 503 });

  const ipHash = hashIp(clientIp(req.headers));
  const rl = rateLimit(`comment:${user?.id ?? "guest"}:${ipHash}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "You’re commenting too quickly. Please wait a moment." }, { status: 429 });

  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = commentSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  const { postSlug, parentId, authorName, body, website } = parsed.data;
  if (website) return NextResponse.json({ ok: true });
  if (looksLikeSpam(body)) return NextResponse.json({ error: "Your comment looks like spam (too many links or blocked words)." }, { status: 422 });

  if (user) {
    // Signed in: the name always comes from the profile in the database (the site owner falls back to the site name).
    const { data: profile } = await sb.from("profiles").select("display_name,is_admin").eq("id", user.id).maybeSingle();
    let name = profile?.display_name || (profile?.is_admin ? site.name : "");
    if (!name) {
      if (!authorName || authorName.length < 2) return NextResponse.json({ error: "Choose a display name first." }, { status: 422 });
      name = authorName;
      await sb.from("profiles").update({ display_name: name }).eq("id", user.id);
    }
    const { data, error } = await sb.from("comments")
      .insert({ post_slug: postSlug, parent_id: parentId ?? null, author_name: name, body, user_id: user.id })
      .select("id,status").single();
    if (error) return NextResponse.json({ error: dbErrorMessage(error.message) }, { status: error.message.includes("RATE_LIMIT") ? 429 : 400 });
    return NextResponse.json({ ok: true, id: data.id, status: data.status }, { status: 201 });
  }

  // Guest: just a name. Written with the server key; identity is a hashed browser cookie.
  const adminSb = getAdminSupabase();
  if (!adminSb) return NextResponse.json({ error: "Guest comments are not available yet." }, { status: 503 });
  const name = (authorName || "").trim();
  if (name.length < 2) return NextResponse.json({ error: "Please enter your name (2+ characters)." }, { status: 422 });
  if (reservedName(name)) return NextResponse.json({ error: "Please choose a different name." }, { status: 422 });
  const guestKey = (await visitorKey(true, "guest"))!;
  const { data, error } = await adminSb.from("comments")
    .insert({ post_slug: postSlug, parent_id: parentId ?? null, author_name: name, body, guest_key: guestKey, guest_ip: ipHash })
    .select("id,status").single();
  if (error) return NextResponse.json({ error: dbErrorMessage(error.message) }, { status: error.message.includes("RATE_LIMIT") ? 429 : 400 });
  return NextResponse.json({ ok: true, id: data.id, status: data.status }, { status: 201 });
}
