"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { CornerDownRight, Loader2, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared social-media style pieces for comment threads (blog discussion + gallery memories). */

const HUES = ["from-cyan-400 to-blue-500", "from-violet-400 to-fuchsia-500", "from-amber-300 to-orange-500", "from-emerald-300 to-teal-500", "from-rose-400 to-pink-500", "from-sky-300 to-indigo-500"];
const hueFor = (name: string) => HUES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];

export const timeShort = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
};

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-ink-950 ring-2 ring-ink-950", hueFor(name), size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs")}>
      {initials}
    </span>
  );
}

/** One comment: avatar + speech bubble, then a small "time · Like · Reply" action row. */
export function SocialComment({ name, body, at, badge, size = "md", actions, children, highlight }: {
  name: string; body: ReactNode; at: string; badge?: ReactNode; size?: "sm" | "md"; actions?: ReactNode; children?: ReactNode; highlight?: boolean;
}) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex gap-2.5">
      <Avatar name={name} size={size} />
      <div className="min-w-0 flex-1">
        <div className={cn("inline-block max-w-full rounded-2xl rounded-tl-md px-3.5 py-2", highlight ? "bg-cyan-400/10 ring-1 ring-cyan-400/30" : "bg-white/[0.06]")}>
          <p className="flex flex-wrap items-center gap-x-2 text-[13px] font-semibold text-mist-100">{name}{badge}</p>
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-mist-200">{body}</div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-2 text-xs font-medium text-mist-400">
          <time dateTime={at} className="font-normal text-mist-500">{timeShort(at)}</time>
          {actions}
        </div>
        {children}
      </div>
    </motion.div>
  );
}

export const actionBtn = "transition hover:text-cyan-200 disabled:opacity-50";

/** Render "@Name rest of text" with the mention highlighted. */
export function MentionText({ text }: { text: string }) {
  const m = /^@([^\s:]+(?:\s[^\s:]+)?)[:\s]/.exec(text);
  if (!m) return <>{text}</>;
  return <><span className="font-semibold text-cyan-300">@{m[1]}</span>{text.slice(m[0].length - 1)}</>;
}

/** Pill-shaped composer with avatar and send button. Enter sends, Shift+Enter adds a line. */
export function InlineComposer({ name, placeholder, onSubmit, autoFocus, initial = "", replyingTo, onCancel, size = "md", busy: busyProp, disabled, footer }: {
  name: string; placeholder: string; onSubmit: (text: string) => Promise<void> | void; autoFocus?: boolean; initial?: string; replyingTo?: string; onCancel?: () => void; size?: "sm" | "md"; busy?: boolean; disabled?: boolean; footer?: ReactNode;
}) {
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (autoFocus && ref.current) { const el = ref.current; el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, [autoFocus]);
  useEffect(() => { const el = ref.current; if (!el) return; el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 180)}px`; }, [text]);
  const send = async () => {
    const t = text.trim();
    if (t.length < 2 || busy || disabled) { if (t.length < 2) setErr("Write a little more first."); return; }
    setErr(""); setBusy(true);
    try { await onSubmit(t); setText(""); } catch (e) { setErr((e as Error).message || "Couldn’t post. Try again."); } finally { setBusy(false); }
  };
  const working = busy || busyProp;
  return (
    <div className="flex gap-2.5">
      <Avatar name={name || "You"} size={size} />
      <div className="min-w-0 flex-1">
        {replyingTo && (
          <p className="mb-1 flex items-center gap-1.5 pl-1 text-xs text-mist-400">
            <CornerDownRight className="h-3 w-3 text-cyan-300" aria-hidden /> Replying to <b className="text-cyan-200">{replyingTo}</b>
            {onCancel && <button type="button" onClick={onCancel} className="ml-1 text-mist-500 underline-offset-2 hover:text-mist-200 hover:underline">Cancel</button>}
          </p>
        )}
        <div className={cn("flex items-end gap-1 rounded-3xl border bg-white/[0.04] py-1 pl-4 pr-1 transition focus-within:border-cyan-400/50 focus-within:bg-white/[0.06]", err ? "border-rose-400/50" : "border-white/10")}>
          <label className="sr-only" htmlFor={undefined}>{placeholder}</label>
          <textarea
            ref={ref} rows={1} value={text} maxLength={2000} disabled={disabled}
            onChange={(e) => { setText(e.target.value); if (err) setErr(""); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } if (e.key === "Escape" && onCancel) onCancel(); }}
            placeholder={placeholder} aria-label={placeholder}
            className="max-h-44 min-h-[2.25rem] flex-1 resize-none bg-transparent py-2 text-sm text-mist-100 outline-none placeholder:text-mist-500"
          />
          <button type="button" onClick={send} disabled={working || disabled || text.trim().length < 2} aria-label="Send"
            className="mb-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan-300 text-ink-950 transition hover:bg-cyan-200 disabled:bg-white/10 disabled:text-mist-500">
            {working ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <SendHorizontal className="h-4 w-4" aria-hidden />}
          </button>
        </div>
        {err ? <p role="alert" className="mt-1 pl-3 text-xs text-rose-300">{err}</p> : footer ? <div className="mt-1 pl-3 text-[11px] text-mist-500">{footer}</div> : null}
      </div>
    </div>
  );
}

/** "View 3 more replies" toggle used under long threads. */
export function MoreReplies({ count, open, onClick }: { count: number; open: boolean; onClick: () => void }) {
  if (count <= 0) return null;
  return (
    <button type="button" onClick={onClick} className="mt-2 flex items-center gap-2 pl-1 text-xs font-semibold text-mist-300 hover:text-cyan-200">
      <CornerDownRight className="h-3.5 w-3.5" aria-hidden /> {open ? "Hide replies" : `View ${count} more ${count === 1 ? "reply" : "replies"}`}
    </button>
  );
}
