import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getAdminSupabase } from "@/lib/supabase/server";
import { clientIp, hashIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const TYPES = new Set(["post", "comment", "memory"]);
const ID = /^[a-zA-Z0-9-]{1,120}$/;

/** Anonymous visitor id: random cookie, stored only as a salted hash. */
async function visitor(create: boolean) {
  const jar = await cookies();
  let vid = jar.get("vid")?.value;
  if (!vid && create) {
    vid = randomUUID();
    jar.set("vid", vid, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  return vid ? hashIp(`vid:${vid}`) : null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "";
  const ids = (url.searchParams.get("ids") || "").split(",").filter((x) => ID.test(x)).slice(0, 200);
  if (!TYPES.has(type) || !ids.length) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ configured: false, counts: {}, mine: [] });
  const me = await visitor(false);
  const [{ data: counts }, mineRes] = await Promise.all([
    sb.rpc("like_counts", { p_type: type, p_ids: ids }),
    me ? sb.from("likes").select("target_id").eq("target_type", type).eq("visitor", me).in("target_id", ids) : Promise.resolve({ data: [] as { target_id: string }[] }),
  ]);
  const map: Record<string, number> = {};
  for (const r of (counts ?? []) as { target_id: string; n: number }[]) map[r.target_id] = Number(r.n);
  return NextResponse.json({ configured: true, counts: map, mine: ((mineRes.data ?? []) as { target_id: string }[]).map((r) => r.target_id) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { type?: string; id?: string };
  const type = String(body.type || ""), id = String(body.id || "");
  if (!TYPES.has(type) || !ID.test(id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const rl = rateLimit(`like:${hashIp(clientIp(req.headers))}`, 40, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Slow down a little." }, { status: 429 });
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: "Likes are not configured." }, { status: 503 });
  const me = (await visitor(true))!;
  const { data: existing } = await sb.from("likes").select("target_id").eq("target_type", type).eq("target_id", id).eq("visitor", me).maybeSingle();
  if (existing) await sb.from("likes").delete().eq("target_type", type).eq("target_id", id).eq("visitor", me);
  else {
    const { error } = await sb.from("likes").insert({ target_type: type, target_id: id, visitor: me });
    if (error) return NextResponse.json({ error: "Couldn’t save your like." }, { status: 500 });
  }
  const { data: counts } = await sb.rpc("like_counts", { p_type: type, p_ids: [id] });
  const n = Number(((counts ?? []) as { n: number }[])[0]?.n ?? 0);
  return NextResponse.json({ liked: !existing, count: n });
}
