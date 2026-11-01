import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { displayNameSchema, fieldErrors } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** Set or change the signed-in reader's display name (stored in public.profiles; used on all their comments). */
export async function PATCH(req: Request) {
  const { sb, user } = await getSessionUser();
  if (!sb) return NextResponse.json({ error: "Not configured." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = displayNameSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid name.", fields: fieldErrors(parsed.error) }, { status: 422 });
  const { error } = await sb.from("profiles").update({ display_name: parsed.data.displayName }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Couldn’t save your name." }, { status: 400 });
  return NextResponse.json({ ok: true, displayName: parsed.data.displayName });
}
