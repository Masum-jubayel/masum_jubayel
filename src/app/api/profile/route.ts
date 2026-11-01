import { NextResponse } from "next/server";
import { getAdminSupabase, getSessionUser } from "@/lib/supabase/server";
import { reservedName, visitorKey } from "@/lib/visitor";
import { displayNameSchema, fieldErrors } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** Set or change the signed-in reader's display name (stored in public.profiles; used on all their comments). */
export async function PATCH(req: Request) {
  const { sb, user } = await getSessionUser();
  if (!sb) return NextResponse.json({ error: "Not configured." }, { status: 503 });
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = displayNameSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid name.", fields: fieldErrors(parsed.error) }, { status: 422 });
  if (!user) {
    // Guest rename: update the name on all comments this browser has posted.
    if (reservedName(parsed.data.displayName)) return NextResponse.json({ error: "Please choose a different name." }, { status: 422 });
    const adminSb = getAdminSupabase();
    const key = await visitorKey(false, "guest");
    if (adminSb && key) await adminSb.from("comments").update({ author_name: parsed.data.displayName }).eq("guest_key", key).is("deleted_at", null);
    return NextResponse.json({ ok: true, displayName: parsed.data.displayName });
  }
  const { error } = await sb.from("profiles").update({ display_name: parsed.data.displayName }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Couldn’t save your name." }, { status: 400 });
  return NextResponse.json({ ok: true, displayName: parsed.data.displayName });
}
