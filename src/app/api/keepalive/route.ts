import { NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase/server";

/**
 * Keep-alive: Supabase pauses free projects after ~7 days without activity.
 * Vercel calls this once a day (see vercel.json → crons), which makes a tiny
 * database read so the project never counts as inactive. Nothing to do by hand.
 *
 * If CRON_SECRET is set, callers must send it (Vercel does this automatically):
 *   Authorization: Bearer <CRON_SECRET>   or   /api/keepalive?key=<CRON_SECRET>
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const key = new URL(req.url).searchParams.get("key");
    if (auth !== `Bearer ${secret}` && key !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  }
  const sb = getPublicSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "Supabase is not configured" }, { status: 503 });
  const started = Date.now();
  const { error } = await sb.from("site_content").select("key", { head: true, count: "exact" }).limit(1);
  return NextResponse.json({ ok: !error, ms: Date.now() - started, at: new Date().toISOString(), ...(error ? { error: error.message } : {}) }, { status: error ? 500 : 200, headers: { "Cache-Control": "no-store" } });
}
