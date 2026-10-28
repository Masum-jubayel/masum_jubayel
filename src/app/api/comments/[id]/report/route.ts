import { NextResponse } from "next/server";
import { z } from "zod";
import { reportSchema } from "@/lib/validation/schemas";
import { getSessionUser } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid comment." }, { status: 400 });
  const { sb, user } = await getSessionUser();
  if (!sb) return NextResponse.json({ error: "Comments are not configured." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Please sign in to report comments." }, { status: 401 });
  if (!rateLimit(`report:${user.id}`, 10, 60 * 60_000).ok) return NextResponse.json({ error: "Too many reports. Try again later." }, { status: 429 });

  const parsed = reportSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Please describe the problem (3–500 characters)." }, { status: 422 });

  const { error } = await sb.from("comment_reports").insert({ comment_id: id, reporter_id: user.id, reason: parsed.data.reason });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ ok: true, message: "You already reported this comment." });
    return NextResponse.json({ error: "Couldn’t submit the report." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: "Thanks — the report was sent to the moderator." });
}
