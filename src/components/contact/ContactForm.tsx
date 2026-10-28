"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react";
import { contactSchema, fieldErrors } from "@/lib/validation/schemas";

type State = { status: "idle" | "sending" | "sent" | "error"; message?: string; fields?: Record<string, string> };

export function ContactForm() {
  const started = useRef(Date.now());
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      subject: String(fd.get("subject") || ""),
      message: String(fd.get("message") || ""),
      website: String(fd.get("website") || ""),
      startedAt: started.current,
    };
    const local = contactSchema.safeParse(payload);
    if (!local.success) {
      setState({ status: "error", message: "Please fix the highlighted fields.", fields: fieldErrors(local.error) });
      const first = Object.keys(fieldErrors(local.error))[0];
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setState({ status: "error", message: data.error || "Something went wrong.", fields: data.fields });
      setState({ status: "sent" });
      (e.target as HTMLFormElement).reset();
    } catch {
      setState({ status: "error", message: "Network error — please check your connection and try again." });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="glass flex flex-col items-center gap-3 p-10 text-center" role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden />
        <h2 className="text-xl font-semibold">Message sent</h2>
        <p className="text-sm text-mist-300">Thanks for reaching out — I’ll reply as soon as I can.</p>
        <button className="btn-secondary mt-2" onClick={() => { started.current = Date.now(); setState({ status: "idle" }); }}>Send another</button>
      </div>
    );
  }

  const err = (k: string) => state.fields?.[k];
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`c-${name}`} className="label">{label}</label>
      <input id={`c-${name}`} name={name} className="input" aria-invalid={!!err(name)} aria-describedby={err(name) ? `c-${name}-err` : undefined} {...props} />
      {err(name) && <p id={`c-${name}-err`} className="mt-1.5 text-xs text-rose-300">{err(name)}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="glass space-y-5 p-6 sm:p-8" aria-describedby="contact-status">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Name", { autoComplete: "name", required: true, maxLength: 100 })}
        {field("email", "Email", { type: "email", autoComplete: "email", required: true, maxLength: 200 })}
      </div>
      {field("subject", "Subject", { required: true, maxLength: 150 })}
      <div>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea id="c-message" name="message" rows={6} required maxLength={5000} className="input resize-y" aria-invalid={!!err("message")} aria-describedby={err("message") ? "c-message-err" : undefined} />
        {err("message") && <p id="c-message-err" className="mt-1.5 text-xs text-rose-300">{err("message")}</p>}
      </div>
      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div id="contact-status" aria-live="polite">
        {state.status === "error" && state.message && (
          <p className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{state.message}</p>
        )}
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={state.status === "sending"}>
          {state.status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          {state.status === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
