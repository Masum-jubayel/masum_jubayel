"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Flag, Loader2, LogOut, MessageSquare, Pencil, Reply, Trash2, TriangleAlert } from "lucide-react";
import type { CommentDTO } from "@/lib/comments";
import { SignInForm } from "./SignInForm";
import { LikeButton } from "./LikeButton";
import { fetchLikes, type LikeState } from "@/lib/likes-client";
import { cn } from "@/lib/utils";

type Me = { email?: string; displayName: string; isAdmin: boolean } | null;
type Notice = { kind: "ok" | "error"; text: string } | null;

const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
};

async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function Composer({ slug, parentId, me, onDone, onCancel, autoFocus }: { slug: string; parentId?: string; me: NonNullable<Me>; onDone: (n: Notice) => void; onCancel?: () => void; autoFocus?: boolean }) {
  const [name, setName] = useState(me.displayName);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (name.trim().length < 2) return setErr("Please add a display name (2+ characters).");
    if (body.trim().length < 2) return setErr("Comment is too short.");
    setBusy(true);
    try {
      const data = await api("/api/comments", { method: "POST", body: JSON.stringify({ postSlug: slug, parentId: parentId ?? null, authorName: name, body, website: "" }) });
      setBody("");
      onDone({ kind: "ok", text: data.status === "pending" ? "Thanks! Your comment is awaiting moderation." : "Comment posted." });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const id = parentId ? `reply-${parentId}` : "new-comment";
  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      {!parentId && (
        <div>
          <label htmlFor={`${id}-name`} className="label">Display name</label>
          <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="input max-w-xs" autoComplete="nickname" />
        </div>
      )}
      <div>
        <label htmlFor={`${id}-body`} className={parentId ? "sr-only" : "label"}>{parentId ? "Reply" : "Comment"}</label>
        <textarea id={`${id}-body`} value={body} onChange={(e) => setBody(e.target.value)} rows={parentId ? 3 : 4} maxLength={2000} autoFocus={autoFocus} className="input resize-y" placeholder={parentId ? "Write a reply…" : "Share a thought, question or correction…"} aria-invalid={!!err} aria-describedby={err ? `${id}-err` : undefined} />
        <div className="mt-1 flex justify-between text-[11px] text-mist-500">
          <span>Plain text. Be respectful.</span>
          <span>{body.length}/2000</span>
        </div>
      </div>
      {err && <p id={`${id}-err`} role="alert" className="text-xs text-rose-300">{err}</p>}
      <div className="flex gap-2">
        <button className="btn-primary py-2" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{parentId ? "Post reply" : "Post comment"}</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>}
      </div>
    </form>
  );
}

function CommentItem({ c, slug, me, replies, refresh, notify, likes }: { c: CommentDTO; slug: string; me: Me; replies?: CommentDTO[]; refresh: () => void; notify: (n: Notice) => void; likes: LikeState | null }) {
  const [mode, setMode] = useState<"view" | "edit" | "reply" | "report">("view");
  const [text, setText] = useState(c.body);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>, okText?: string) => {
    setBusy(true);
    try { const r = (await fn()) as { message?: string }; notify({ kind: "ok", text: r?.message || okText || "Done." }); setMode("view"); refresh(); }
    catch (e) { notify({ kind: "error", text: (e as Error).message }); }
    finally { setBusy(false); }
  };

  return (
    <li className="relative">
      <article className={cn("rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4", c.status !== "visible" && "border-amber-300/30")} aria-label={c.deleted ? "Deleted comment" : `Comment by ${c.authorName}`}>
        {c.deleted ? (
          <p className="text-sm italic text-mist-500">[comment deleted]</p>
        ) : (
          <>
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-cyan-400/40 to-violet-500/40 font-mono text-[11px] text-mist-100" aria-hidden>{c.authorName.slice(0, 1).toUpperCase()}</span>
              <span className="text-sm font-medium text-mist-100">{c.authorName}</span>
              <time dateTime={c.createdAt} className="font-mono text-[11px] text-mist-500">{timeAgo(c.createdAt)}{c.editedAt && " · edited"}</time>
              {c.status !== "visible" && <span className="chip border-amber-300/40 py-0 text-[10px] text-amber-300">{c.status === "pending" ? "Awaiting moderation" : "Hidden"}</span>}
            </header>
            {mode === "edit" ? (
              <div className="mt-3 space-y-2">
                <label htmlFor={`edit-${c.id}`} className="sr-only">Edit comment</label>
                <textarea id={`edit-${c.id}`} value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} className="input" />
                <div className="flex gap-2">
                  <button className="btn-primary py-1.5 text-xs" disabled={busy} onClick={() => run(() => api(`/api/comments/${c.id}`, { method: "PATCH", body: JSON.stringify({ body: text }) }), "Comment updated.")}>Save</button>
                  <button className="btn-ghost text-xs" onClick={() => { setText(c.body); setMode("view"); }}>Cancel</button>
                </div>
              </div>
            ) : (
              // Rendered as plain text — React escapes it; no HTML is ever injected.
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-mist-200">{c.body}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-1">
              {likes?.configured && c.status === "visible" && <LikeButton type="comment" id={c.id} size="sm" initial={{ count: likes.counts[c.id] ?? 0, liked: likes.mine.includes(c.id) }} />}
              {me && !c.parentId && <button onClick={() => setMode(mode === "reply" ? "view" : "reply")} className="btn-ghost px-2 py-1 text-xs"><Reply className="h-3.5 w-3.5" aria-hidden /> Reply</button>}
              {c.mine && mode !== "edit" && <button onClick={() => setMode("edit")} className="btn-ghost px-2 py-1 text-xs"><Pencil className="h-3.5 w-3.5" aria-hidden /> Edit</button>}
              {c.mine && (
                <button
                  onClick={() => { if (window.confirm("Delete this comment?")) run(() => api(`/api/comments/${c.id}`, { method: "DELETE" }), "Comment deleted."); }}
                  className="btn-ghost px-2 py-1 text-xs hover:text-rose-300"
                  disabled={busy}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                </button>
              )}
              {me && !c.mine && <button onClick={() => setMode(mode === "report" ? "view" : "report")} className="btn-ghost px-2 py-1 text-xs"><Flag className="h-3.5 w-3.5" aria-hidden /> Report</button>}
            </div>
            {mode === "report" && (
              <ReportForm busy={busy} onCancel={() => setMode("view")} onSubmit={(reason) => run(() => api(`/api/comments/${c.id}/report`, { method: "POST", body: JSON.stringify({ reason }) }))} />
            )}
          </>
        )}
      </article>
      {mode === "reply" && me && (
        <div className="ml-6 mt-3 border-l border-white/10 pl-4 sm:ml-10">
          <Composer slug={slug} parentId={c.id} me={me} autoFocus onCancel={() => setMode("view")} onDone={(n) => { notify(n); setMode("view"); refresh(); }} />
        </div>
      )}
      {replies && replies.length > 0 && (
        <ul className="ml-6 mt-3 space-y-3 border-l border-white/10 pl-4 sm:ml-10">
          {replies.map((r) => <CommentItem key={r.id} c={r} slug={slug} me={me} refresh={refresh} notify={notify} likes={likes} />)}
        </ul>
      )}
    </li>
  );
}

function ReportForm({ onSubmit, onCancel, busy }: { onSubmit: (r: string) => void; onCancel: () => void; busy: boolean }) {
  const [reason, setReason] = useState("");
  return (
    <div className="mt-3 space-y-2 rounded-xl border border-white/10 p-3">
      <label className="label" htmlFor="report-reason">Why are you reporting this comment?</label>
      <input id="report-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} className="input py-2" placeholder="Spam, abuse, off-topic…" />
      <div className="flex gap-2">
        <button className="btn-secondary py-1.5 text-xs" disabled={busy || reason.trim().length < 3} onClick={() => onSubmit(reason)}>Send report</button>
        <button className="btn-ghost text-xs" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export function Comments({ slug, title = "Discussion", compact = false }: { slug: string; title?: string; compact?: boolean }) {
  const [state, setState] = useState<{ loading: boolean; configured: boolean; comments: CommentDTO[]; me: Me; error: string }>({ loading: true, configured: true, comments: [], me: null, error: "" });
  const [notice, setNotice] = useState<Notice>(null);
  const [likes, setLikes] = useState<LikeState | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api(`/api/comments?slug=${encodeURIComponent(slug)}`);
      setState({ loading: false, configured: data.configured, comments: data.comments, me: data.user, error: "" });
      fetchLikes("comment", (data.comments as CommentDTO[]).filter((c) => !c.deleted).map((c) => c.id)).then(setLikes).catch(() => {});
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: (e as Error).message }));
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(null), 5000); return () => clearTimeout(t); }, [notice]);

  const { roots, byParent, count } = useMemo(() => {
    const byParent = new Map<string, CommentDTO[]>();
    const roots: CommentDTO[] = [];
    for (const c of state.comments) {
      if (c.parentId) byParent.set(c.parentId, [...(byParent.get(c.parentId) || []), c]);
      else roots.push(c);
    }
    // hide deleted roots without replies
    const visibleRoots = roots.filter((r) => !r.deleted || (byParent.get(r.id)?.length ?? 0) > 0);
    return { roots: visibleRoots, byParent, count: state.comments.filter((c) => !c.deleted).length };
  }, [state.comments]);

  return (
    <section aria-labelledby={compact ? `comments-${slug}` : "comments-title"} className={compact ? "pt-2" : "mt-16 border-t border-white/[0.06] pt-10"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={compact ? `comments-${slug}` : "comments-title"} className={cn("flex items-center gap-2 font-semibold", compact ? "text-base" : "text-2xl")}><MessageSquare className="h-5 w-5 text-cyan-300" aria-hidden /> {title} {state.configured && !state.loading && <span className="font-mono text-sm text-mist-500">({count})</span>}</h2>
        {state.me && (
          <form action="/auth/signout" method="post" className="flex items-center gap-3 text-xs text-mist-400">
            <span>Signed in as {state.me.email}</span>
            <button className="btn-ghost px-2 py-1 text-xs"><LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out</button>
          </form>
        )}
      </div>

      <div aria-live="polite" className="mt-4">
        {notice && <p className={cn("rounded-xl border p-3 text-sm", notice.kind === "ok" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-rose-400/30 bg-rose-500/10 text-rose-200")}>{notice.text}</p>}
      </div>

      {state.loading ? (
        <div className="mt-6 space-y-3" aria-busy="true" aria-label="Loading comments">
          {[0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.03]" />)}
        </div>
      ) : !state.configured ? (
        <p className="glass mt-6 p-5 text-sm text-mist-400">Comments will appear here once the site’s Supabase backend is connected.</p>
      ) : state.error ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-rose-300"><TriangleAlert className="h-4 w-4" aria-hidden /> {state.error} <button onClick={load} className="underline">Retry</button></p>
      ) : (
        <>
          <div className="glass mt-6 p-5">
            {state.me ? (
              <Composer slug={slug} me={state.me} onDone={(n) => { setNotice(n); load(); }} />
            ) : (
              <div>
                <p className="mb-3 text-sm text-mist-300">Sign in with a verified email to join the discussion. Reading is open to everyone.</p>
                <SignInForm next={typeof window !== "undefined" ? window.location.pathname + "#comments-title" : "/blog"} compact />
              </div>
            )}
          </div>
          {roots.length === 0 ? (
            <p className="mt-8 text-center text-sm text-mist-500">No comments yet — start the conversation.</p>
          ) : (
            <ul className="mt-8 space-y-4">
              {roots.map((c) => <CommentItem key={c.id} c={c} slug={slug} me={state.me} replies={byParent.get(c.id)} refresh={load} notify={setNotice} likes={likes} />)}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
