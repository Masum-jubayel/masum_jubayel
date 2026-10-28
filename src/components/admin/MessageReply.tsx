"use client";

import { useState } from "react";
import { Check, Copy, CornerUpLeft, ExternalLink, Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { id: string; name: string; email: string; subject: string; message: string; replied_at?: string | null };

const templates = (first: string, me: string) => [
  { label: "Thanks — let’s talk", body: `Hi ${first},\n\nThank you for reaching out — I’d be glad to talk. I’m available this week; please let me know a day and time that works for you, or call me directly.\n\nBest regards,\n${me}` },
  { label: "Send availability", body: `Hi ${first},\n\nThanks for your message. I’m available for a call on weekdays after 5 pm (Mountain Time). Let me know what suits you best.\n\nKind regards,\n${me}` },
  { label: "Answer a question", body: `Hi ${first},\n\nThanks for reading and for the question!\n\n\n\nHappy to help further if you have more questions.\n\nCheers,\n${me}` },
  { label: "Politely decline", body: `Hi ${first},\n\nThank you for thinking of me. I’m not able to take this on right now, but I appreciate you reaching out and wish you the best.\n\nKind regards,\n${me}` },
];

/** Reply to a contact message: write it here, then send from the website or open it in your email app. */
export function MessageReply({ m, me, onSend }: { m: Msg; me: string; onSend?: (id: string, subject: string, body: string) => Promise<{ ok: boolean; error?: string }> }) {
  const first = m.name.split(" ")[0] || m.name;
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(m.subject.startsWith("Re:") ? m.subject : `Re: ${m.subject}`);
  const [body, setBody] = useState(`Hi ${first},\n\n\n\nBest regards,\n${me}`);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const quoted = `${body}\n\n— On ${m.name} <${m.email}> wrote:\n> ${m.message.split("\n").join("\n> ")}`;
  const mailto = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(quoted)}`;

  if (!open) return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" className="btn-secondary py-1.5 text-xs" onClick={() => setOpen(true)}><CornerUpLeft className="h-3.5 w-3.5" aria-hidden /> Reply</button>
      {m.replied_at && <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300"><Check className="h-3 w-3" aria-hidden /> Replied</span>}
    </div>
  );
  return (
    <div className="mt-3 space-y-2 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.03] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-mist-400">To <span className="text-cyan-300">{m.name} &lt;{m.email}&gt;</span></p>
        <button type="button" className="btn-ghost px-1.5 py-1" onClick={() => setOpen(false)} aria-label="Close reply"><X className="h-3.5 w-3.5" aria-hidden /></button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {templates(first, me).map((t) => <button key={t.label} type="button" className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-mist-300 hover:border-cyan-400/40 hover:text-cyan-200" onClick={() => setBody(t.body)}>{t.label}</button>)}
      </div>
      <input className="input py-2 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" />
      <textarea className="input text-sm" rows={7} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Reply" />
      <div className="flex flex-wrap items-center gap-2">
        {onSend && (
          <button type="button" className="btn-primary py-2 text-sm" disabled={busy || body.trim().length < 5} onClick={async () => {
            setBusy(true); setStatus(null);
            const r = await onSend(m.id, subject, quoted).catch((e) => ({ ok: false, error: String(e) }));
            setBusy(false);
            setStatus(r.ok ? { ok: true, text: `Sent to ${m.email}.` } : { ok: false, text: r.error || "Couldn’t send — use “Open in email app” instead." });
          }}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} Send from website</button>
        )}
        <a className="btn-secondary py-2 text-sm" href={mailto}><ExternalLink className="h-4 w-4" aria-hidden /> Open in email app</a>
        <button type="button" className="btn-ghost py-2 text-sm" onClick={async () => { try { await navigator.clipboard.writeText(quoted); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } }}>{copied ? <Check className="h-4 w-4 text-emerald-300" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />} Copy</button>
      </div>
      {status && <p aria-live="polite" className={cn("text-sm", status.ok ? "text-emerald-300" : "text-rose-300")}>{status.text}</p>}
    </div>
  );
}
