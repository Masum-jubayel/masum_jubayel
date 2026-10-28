import { NextResponse } from "next/server";
import { contactSchema, fieldErrors } from "@/lib/validation/schemas";
import { clientIp, hashIp, rateLimit } from "@/lib/rateLimit";
import { looksLikeSpam } from "@/lib/spam";
import { getAdminSupabase } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  const env = serverEnv();
  const ip = clientIp(req.headers);
  const ipHash = hashIp(ip);

  const burst = rateLimit(`contact:${ipHash}`, 3, 10 * 60_000);
  if (!burst.ok) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429, headers: { "Retry-After": String(burst.retryAfter) } });

  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  const { name, email, subject, message, website, startedAt } = parsed.data;

  // Bot traps: honeypot filled or form submitted implausibly fast → pretend success, drop silently.
  if (website || (startedAt && Date.now() - startedAt < 2500)) return NextResponse.json({ ok: true });
  if (looksLikeSpam(`${subject}\n${message}`)) return NextResponse.json({ error: "Your message was flagged as spam. Please remove extra links and try again." }, { status: 422 });

  const sb = getAdminSupabase();
  const canEmail = Boolean(env.resendApiKey && env.contactTo);
  if (!sb && !canEmail) {
    return NextResponse.json({ error: "The contact form isn’t connected yet. Please use the email link on this page." }, { status: 503 });
  }

  if (sb) {
    // Authoritative per-IP limit stored in the database (works across serverless instances).
    const since = new Date(Date.now() - 60 * 60_000).toISOString();
    const { count } = await sb.from("contact_messages").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
    if ((count ?? 0) >= 5) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
    const { error } = await sb.from("contact_messages").insert({ name, email, subject, message, ip_hash: ipHash, user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null });
    if (error && !canEmail) return NextResponse.json({ error: "We couldn’t save your message. Please try again or email directly." }, { status: 500 });
  }

  if (canEmail) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.contactFrom,
        to: [env.contactTo],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    }).catch(() => null);
    if (!res?.ok && !sb) return NextResponse.json({ error: "Email delivery failed. Please try again or email directly." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
