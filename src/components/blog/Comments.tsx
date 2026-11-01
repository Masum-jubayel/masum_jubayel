"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, LogOut, MessageSquare, TriangleAlert } from "lucide-react";
import type { CommentDTO } from "@/lib/comments";
import { SignInForm } from "./SignInForm";
import { LikeButton } from "./LikeButton";
import { InlineComposer, MentionText, MoreReplies, SocialComment, actionBtn } from "./SocialThread";
import { fetchLikes, type LikeState } from "@/lib/likes-client";
import { cn } from "@/lib/utils";

type Me = { email?: string; displayName: string; isAdmin: boolean } | null;
/** Who is writing: a signed-in account or a guest with just a name. */
type Who = { name: string; canPost: boolean; signedIn: boolean; guestName?: string; onName: (n: string) => void };
const NAME_KEY = "mj-comment-name";
type Notice = { kind: "ok" | "error"; text: string } | null;

async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

const SHOW_REPLIES = 2;

/** Readers pick a display name once. Signed-in: saved to their profile. Guests: remembered in this browser and applied to their past comments. */
function NameSetup({ initial = "", onSaved, onCancel }: { initial?: string; onSaved: (name: string) => void; onCancel?: () => void }) {
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { const r = await api("/api/profile", { method: "PATCH", body: JSON.stringify({ displayName: name }) }); onSaved(r.displayName); }
    catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <label htmlFor="display-name" className="text-sm font-medium text-mist-100">Join the discussion</label>
      <p className="mt-0.5 text-xs text-mist-400">No account needed — just enter the name you want to show on your comments and replies.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input id="display-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="input max-w-xs py-2 text-sm" placeholder="e.g. Alex Chen" autoComplete="name" />
        <button className="btn-primary py-2 text-sm" disabled={busy || name.trim().length < 2}>{initial ? "Save name" : "Continue"}</button>
        {onCancel && <button type="button" className="btn-ghost py-2 text-sm" onClick={onCancel}>Cancel</button>}
      </div>
      {err && <p role="alert" className="mt-1 text-xs text-rose-300">{err}</p>}
    </form>
  );
}

/** One top-level comment with its replies and an inline reply box (social-media style). */
function Thread({ c, replies, slug, me, who, refresh, notify, likes }: { c: CommentDTO; replies: CommentDTO[]; slug: string; me: Me; who: Who; refresh: () => void; notify: (n: Notice) => void; likes: LikeState | null }) {
  const [replyTo, setReplyTo] = useState<CommentDTO | null>(null);
  const [open, setOpen] = useState(false);
  const hidden = Math.max(0, replies.length - SHOW_REPLIES);
  const shown = open ? replies : replies.slice(-SHOW_REPLIES);

  const post = async (text: string) => {
    const data = await api("/api/comments", { method: "POST", body: JSON.stringify({ postSlug: slug, parentId: c.id, authorName: who.guestName, body: text, website: "" }) });
    setReplyTo(null); setOpen(true);
    notify(data.status === "pending" ? { kind: "ok", text: "Thanks! Your reply is awaiting moderation." } : null);
    refresh();
  };

  return (
    <li>
      <Item c={c} me={me} who={who} likes={likes} refresh={refresh} notify={notify} onReply={() => setReplyTo(c)} />
      {(replies.length > 0 || replyTo) && (
        <div className="ml-[2.95rem] mt-2 space-y-3 border-l border-white/10 pl-3">
          <MoreReplies count={hidden} open={open} onClick={() => setOpen((o) => !o)} />
          {shown.map((r) => <Item key={r.id} c={r} me={me} who={who} likes={likes} refresh={refresh} notify={notify} small onReply={() => setReplyTo(r)} />)}
          {replyTo && who.canPost && (
            <InlineComposer key={replyTo.id} size="sm" name={who.name} autoFocus replyingTo={replyTo.authorName}
              initial={replyTo.id !== c.id ? `@${replyTo.authorName} ` : ""} placeholder={`Reply to ${replyTo.authorName}…`}
              onCancel={() => setReplyTo(null)} onSubmit={post} />
          )}
          {replyTo && !who.canPost && <NameSetup onCancel={() => setReplyTo(null)} onSaved={who.onName} />}
        </div>
      )}
    </li>
  );
}

function Item({ c, me, who, likes, refresh, notify, small, onReply }: { c: CommentDTO; me: Me; who: Who; likes: LikeState | null; refresh: () => void; notify: (n: Notice) => void; small?: boolean; onReply: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(c.body);
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try { const r = (await fn()) as { message?: string }; notify({ kind: "ok", text: r?.message || ok }); setEditing(false); refresh(); }
    catch (e) { notify({ kind: "error", text: (e as Error).message }); }
    finally { setBusy(false); }
  };

  if (c.deleted) return <p className="pl-12 text-sm italic text-mist-500">[comment deleted]</p>;

  return (
    <SocialComment
      name={c.authorName} at={c.createdAt} size={small ? "sm" : "md"} highlight={c.mine}
      badge={c.isAuthor ? <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/15 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-cyan-200"><BadgeCheck className="h-3 w-3" aria-hidden />Author</span> : c.status !== "visible" ? <span className="rounded-full border border-amber-300/40 px-1.5 text-[10px] font-medium text-amber-300">{c.status === "pending" ? "Awaiting moderation" : "Hidden"}</span> : c.editedAt ? <span className="text-[10px] font-normal text-mist-500">edited</span> : null}
      body={editing ? (
        <span className="mt-1 block space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} className="input text-sm" aria-label="Edit comment" />
          <span className="flex gap-2">
            <button className="btn-primary py-1 text-xs" disabled={busy} onClick={() => run(() => api(`/api/comments/${c.id}`, { method: "PATCH", body: JSON.stringify({ body: text }) }), "Comment updated.")}>Save</button>
            <button className="btn-ghost py-1 text-xs" onClick={() => { setText(c.body); setEditing(false); }}>Cancel</button>
          </span>
        </span>
      ) : <MentionText text={c.body} />}
      actions={<>
        {likes?.configured && c.status === "visible" && <LikeButton bare type="comment" id={c.id} initial={{ count: likes.counts[c.id] ?? 0, liked: likes.mine.includes(c.id) }} />}
        {c.status === "visible" && <button className={actionBtn} onClick={onReply}>Reply</button>}
        {c.mine && !editing && <button className={actionBtn} onClick={() => setEditing(true)}>Edit</button>}
        {c.mine && <button className={cn(actionBtn, "hover:text-rose-300")} disabled={busy} onClick={() => { if (window.confirm("Delete this comment?")) run(() => api(`/api/comments/${c.id}`, { method: "DELETE" }), "Comment deleted."); }}>Delete</button>}
        {me && !c.mine && <button className={actionBtn} onClick={() => { const reason = window.prompt("Why are you reporting this comment? (spam, abuse, off-topic…)"); if (reason && reason.trim().length >= 3) run(() => api(`/api/comments/${c.id}/report`, { method: "POST", body: JSON.stringify({ reason }) }), "Thanks — a moderator will review it."); }}>Report</button>}
      </>}
    />
  );
}

export function Comments({ slug, title = "Discussion", compact = false }: { slug: string; title?: string; compact?: boolean }) {
  const [state, setState] = useState<{ loading: boolean; configured: boolean; guests: boolean; comments: CommentDTO[]; me: Me; error: string }>({ loading: true, configured: true, guests: false, comments: [], me: null, error: "" });
  const [guestName, setGuestName] = useState("");
  useEffect(() => { try { setGuestName(localStorage.getItem(NAME_KEY) || ""); } catch { /* storage blocked */ } }, []);
  const [notice, setNotice] = useState<Notice>(null);
  const [likes, setLikes] = useState<LikeState | null>(null);
  const [renaming, setRenaming] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api(`/api/comments?slug=${encodeURIComponent(slug)}`);
      setState({ loading: false, configured: data.configured, guests: !!data.guests, comments: data.comments, me: data.user, error: "" });
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
    const visibleRoots = roots.filter((r) => !r.deleted || (byParent.get(r.id)?.length ?? 0) > 0);
    return { roots: visibleRoots, byParent, count: state.comments.filter((c) => !c.deleted).length };
  }, [state.comments]);

  const who: Who = state.me
    ? { name: state.me.displayName, canPost: !!state.me.displayName, signedIn: true, onName: () => load() }
    : { name: guestName, canPost: state.guests && !!guestName, signedIn: false, guestName, onName: (n) => { saveGuestName(n); load(); } };
  function saveGuestName(n: string) { setGuestName(n); try { localStorage.setItem(NAME_KEY, n); } catch { /* storage blocked */ } }

  const postRoot = async (text: string) => {
    const data = await api("/api/comments", { method: "POST", body: JSON.stringify({ postSlug: slug, parentId: null, authorName: who.guestName, body: text, website: "" }) });
    if (data.status === "pending") setNotice({ kind: "ok", text: "Thanks! Your comment is awaiting moderation." });
    load();
  };

  const headingId = compact ? `comments-${slug}` : "comments-title";
  return (
    <section aria-labelledby={headingId} className={compact ? "pt-1" : "mt-16 border-t border-white/[0.06] pt-10"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className={cn("flex items-center gap-2 font-semibold", compact ? "text-base" : "text-2xl")}>
          <MessageSquare className="h-5 w-5 text-cyan-300" aria-hidden /> {title}
          {state.configured && !state.loading && <span className="font-mono text-sm text-mist-500">({count})</span>}
        </h2>
        {!state.me && who.canPost && (
          <span className="text-xs text-mist-400">Commenting as <b className="text-mist-200">{guestName}</b> · <button type="button" className="underline-offset-2 hover:underline" onClick={() => setRenaming(true)}>change</button></span>
        )}
        {state.me && (
          <form action="/auth/signout" method="post" className="flex items-center gap-2 text-xs text-mist-400">
            {state.me.displayName && <span className="hidden sm:inline">Commenting as <b className="text-mist-200">{state.me.displayName}</b>{!state.me.isAdmin && <> · <button type="button" className="underline-offset-2 hover:underline" onClick={() => setRenaming(true)}>change</button></>}</span>}
            <button className="btn-ghost px-2 py-1 text-xs"><LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out</button>
          </form>
        )}
      </div>

      <div aria-live="polite">
        {notice && <p className={cn("mt-3 rounded-xl border p-3 text-sm", notice.kind === "ok" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-rose-400/30 bg-rose-500/10 text-rose-200")}>{notice.text}</p>}
      </div>

      {state.loading ? (
        <div className="mt-5 space-y-3" aria-busy="true" aria-label="Loading comments">
          {[0, 1].map((i) => <div key={i} className="flex gap-2.5"><div className="h-9 w-9 animate-pulse rounded-full bg-white/[0.05]" /><div className="h-14 flex-1 animate-pulse rounded-2xl bg-white/[0.04]" /></div>)}
        </div>
      ) : !state.configured ? (
        <p className="mt-5 text-sm text-mist-400">Comments open as soon as the site’s database is connected.</p>
      ) : state.error ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-rose-300"><TriangleAlert className="h-4 w-4" aria-hidden /> {state.error} <button onClick={load} className="underline">Retry</button></p>
      ) : (
        <>
          <ul className="mt-5 space-y-5">
            {roots.map((c) => <Thread key={c.id} c={c} replies={byParent.get(c.id) || []} slug={slug} me={state.me} who={who} refresh={load} notify={setNotice} likes={likes} />)}
          </ul>
          {roots.length === 0 && <p className="mt-4 text-sm text-mist-500">No comments yet — be the first to say something.</p>}
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            {(state.me || state.guests) && (!who.canPost || renaming) ? (
              <NameSetup initial={who.name} onCancel={renaming ? () => setRenaming(false) : undefined} onSaved={(n) => { if (!state.me) saveGuestName(n); setRenaming(false); load(); }} />
            ) : who.canPost ? (
              <InlineComposer name={who.name} placeholder="Write a comment…" onSubmit={postRoot} footer="Enter to post · Shift+Enter for a new line" />
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="mb-3 text-sm text-mist-300">Sign in with your email to like, comment and reply.</p>
                <SignInForm next={typeof window !== "undefined" ? window.location.pathname + `#${headingId}` : "/blog"} compact />
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
