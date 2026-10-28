"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";

/** Passwordless email sign-in (verified email). */
export function SignInForm({ next = "/", compact = false }: { next?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const sb = getBrowserSupabase();

  if (!sb) return <p className="text-sm text-mist-400">Sign-in isn’t configured yet (Supabase environment variables are missing).</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setState("error"); setMsg("Enter a valid email address."); return; }
    setState("sending");
    const { error } = await sb!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setState("error"); setMsg(error.message.toLowerCase().includes("rate") ? "Too many requests — please wait a minute and try again." : `Couldn’t send the link: ${error.message}`); return; }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
        <MailCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Check <strong className="mx-1">{email}</strong> for a sign-in link.
      </p>
    );
  }
  return (
    <form onSubmit={submit} className={compact ? "flex flex-col gap-2 sm:flex-row" : "space-y-3"} noValidate>
      <label htmlFor="signin-email" className="sr-only">Email address</label>
      <input id="signin-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" aria-invalid={state === "error"} aria-describedby={state === "error" ? "signin-err" : undefined} />
      <button className="btn-primary shrink-0" disabled={state === "sending"}>
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Email me a sign-in link
      </button>
      {state === "error" && <p id="signin-err" className="text-xs text-rose-300">{msg}</p>}
    </form>
  );
}
