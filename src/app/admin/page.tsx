import Link from "next/link";
import { ArrowDown, ArrowUp, Check, EyeOff, Eye, Mail, MailOpen, Plus, Star, Trash2 } from "lucide-react";
import { getAdmin, getAdminSupabase } from "@/lib/supabase/server";
import { AdminPostsManager } from "@/components/admin/AdminPostsManager";
import { AdminMemories } from "@/components/admin/AdminMemories";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { QuickSwitches } from "@/components/admin/QuickSwitches";
import { MessageReply } from "@/components/admin/MessageReply";
import { AdminMedia } from "@/components/admin/AdminMedia";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { replyToMessage } from "./actions";
import { setLayoutFlag } from "./actions";
import { BackupPanel } from "@/components/admin/BackupPanel";
import type { MemoryStatsRow } from "@/components/admin/MemoriesManager";
import type { PostRow } from "@/components/admin/PostsManager";
import { blogCategories, getAllPosts } from "@/lib/blog";
import { deleteGalleryItem, deleteMessage, hardDeleteComment, resetResume, createHighlight, updateHighlight, setHighlightPublished, moveHighlight, deleteHighlight, resolveReport, setCommentStatus, setGalleryFlag, setMessageRead, setModeration } from "./actions";
import { AdminGallery } from "@/components/admin/AdminGallery";
import { ResumeUploader } from "@/components/admin/ResumeUploader";
import { ResumeContentLinks } from "@/components/admin/ResumeContentLinks";
import { site } from "@/lib/site";
import { getContent } from "@/lib/content";
import { ContentNav } from "@/components/admin/ContentNav";
import { AdminContent } from "@/components/admin/AdminContent";
import { mergeContent, sectionByKey, type ContentKey } from "@/content/cms";
import type { HighlightIcon } from "@/content/highlights";
import { HighlightFields } from "@/components/admin/HighlightFields";
import { iconMap, fallbackIcon } from "@/components/ui/highlightIconMap";
import { cn, formatDate, readingTime } from "@/lib/utils";

const tabs = ["overview", "content", "posts", "memories", "highlights", "gallery", "media", "resume", "comments", "reports", "messages", "settings"] as const;
type Tab = (typeof tabs)[number];

function Btn({ action, children, danger, label }: { action: () => Promise<void>; children: React.ReactNode; danger?: boolean; label: string }) {
  return (
    <form action={action}>
      <button aria-label={label} title={label} className={cn("inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-mist-300 hover:text-mist-100", danger && "hover:border-rose-400/40 hover:text-rose-300")}>{children}</button>
    </form>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; error?: string; saved?: string; updated?: string; section?: string }> }) {
  const sp = await searchParams;
  const tab = (tabs.includes(sp.tab as Tab) ? sp.tab : "overview") as Tab;
  const sectionKey = (sp.section && sp.section in sectionByKey ? sp.section : "site") as ContentKey;
  const { sb } = (await getAdmin())!;

  const [posts, comments, reports, messages, settings, galleryRows, resumeRow, highlightRows, contentRows] = await Promise.all([
    tab === "posts" ? sb.from("posts").select("*").order("updated_at", { ascending: false }) : null,
    tab === "comments" ? sb.from("comments").select("id,post_slug,author_name,body,status,created_at,deleted_at").order("created_at", { ascending: false }).limit(200) : null,
    tab === "reports" ? sb.from("comment_reports").select("id,reason,created_at,resolved,comment:comments(id,body,author_name,post_slug,status)").eq("resolved", false).order("created_at", { ascending: false }) : null,
    tab === "messages" ? sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200) : null,
    tab === "settings" ? sb.from("app_settings").select("value").eq("key", "comment_moderation").maybeSingle() : null,
    tab === "gallery" ? sb.from("gallery_items").select("id,title,caption,category,kind,image_url,featured,published,created_at").order("created_at", { ascending: false }) : null,
    tab === "resume" ? sb.from("app_settings").select("value").eq("key", "resume").maybeSingle() : null,
    tab === "highlights" ? sb.from("highlights").select("id,value,label,source,tag,icon,hue,sort,published").order("sort").order("created_at") : null,
    tab === "content" ? sb.from("site_content").select("key,value") : null,
  ]);

  let overview: React.ReactNode = null;
  if (tab === "overview") {
    const c = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
    const [postsN, draftsN, memN, pendingN, reportsN, unreadN, galleryN, commentsN] = await Promise.all([
      c(sb.from("posts").select("id", { count: "exact", head: true }).eq("published", true)),
      c(sb.from("posts").select("id", { count: "exact", head: true }).eq("published", false)),
      c(sb.from("memories").select("id", { count: "exact", head: true })),
      c(sb.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending").is("deleted_at", null)),
      c(sb.from("comment_reports").select("id", { count: "exact", head: true }).eq("resolved", false)),
      c(sb.from("contact_messages").select("id", { count: "exact", head: true }).eq("read", false)),
      c(sb.from("gallery_items").select("id", { count: "exact", head: true })),
      c(sb.from("comments").select("id", { count: "exact", head: true }).is("deleted_at", null)),
    ]);
    const filePosts = (await getAllPosts()).filter((p) => p.source === "file").length;
    const [{ data: rc }, { data: rm }] = await Promise.all([
      sb.from("comments").select("id,author_name,body,post_slug,created_at,status").is("deleted_at", null).order("created_at", { ascending: false }).limit(5),
      sb.from("contact_messages").select("id,name,subject,created_at,read").order("created_at", { ascending: false }).limit(5),
    ]);
    const recent = [
      ...((rc ?? []) as { id: string; author_name: string; body: string; post_slug: string; created_at: string; status: string }[]).map((r) => ({ id: r.id, kind: "comment" as const, title: `${r.author_name}: “${r.body.slice(0, 80)}”`, meta: `${r.post_slug.startsWith("m-") ? "Memory" : r.post_slug} · ${formatDate(r.created_at)}${r.status !== "visible" ? ` · ${r.status}` : ""}`, href: "/admin?tab=comments", at: r.created_at })),
      ...((rm ?? []) as { id: string; name: string; subject: string; created_at: string; read: boolean }[]).map((r) => ({ id: r.id, kind: "message" as const, title: `${r.name} — ${r.subject || "(no subject)"}`, meta: `${formatDate(r.created_at)}${r.read ? "" : " · unread"}`, href: "/admin?tab=messages", at: r.created_at })),
    ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8);
    const env = { svc: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), resend: Boolean(process.env.RESEND_API_KEY), to: Boolean(process.env.CONTACT_TO_EMAIL), salt: Boolean(process.env.IP_HASH_SALT && process.env.IP_HASH_SALT !== "change-me"), url: Boolean(process.env.NEXT_PUBLIC_SITE_URL) };
    overview = (
      <AdminOverview name={site.name} recent={recent} switches={<QuickSwitches layout={(await getContent()).layout} onToggle={setLayoutFlag} />}
        stats={[
          { label: "Published posts", value: postsN + filePosts, href: "/admin?tab=posts" },
          { label: "Drafts", value: draftsN, href: "/admin?tab=posts" },
          { label: "Memories", value: memN, href: "/admin?tab=memories" },
          { label: "Gallery uploads", value: galleryN, href: "/admin?tab=gallery" },
          { label: "Comments", value: commentsN, href: "/admin?tab=comments" },
          { label: "Awaiting approval", value: pendingN, href: "/admin?tab=comments", tone: "warn" },
          { label: "Open reports", value: reportsN, href: "/admin?tab=reports", tone: "warn" },
          { label: "Unread messages", value: unreadN, href: "/admin?tab=messages", tone: "warn" },
        ]}
        health={[
          { label: "Database connected", ok: true, hint: "" },
          { label: "Likes & contact form (service key)", ok: env.svc, hint: "Set SUPABASE_SERVICE_ROLE_KEY in your hosting environment." },
          { label: "Contact emails (Resend)", ok: env.resend && env.to, hint: "Set RESEND_API_KEY and CONTACT_TO_EMAIL." },
          { label: "Private IP salt", ok: env.salt, hint: "Set IP_HASH_SALT to a long random string." },
          { label: "Public site URL (SEO)", ok: env.url, hint: "Set NEXT_PUBLIC_SITE_URL to your domain." },
        ]} />
    );
  }

  let memoryRows: MemoryStatsRow[] | null = null;
  if (tab === "memories") {
    const { data } = await sb.from("memories").select("*").order("pinned", { ascending: false }).order("memory_date", { ascending: false });
    const rows = (data ?? []) as { id: string; body: string; images: string[]; location: string; feeling: string; memory_date: string; pinned: boolean; published: boolean; photo_fit?: string; photo_focus?: string; photo_size?: string }[];
    const slugs = rows.map((r) => `m-${r.id}`);
    const { data: cRows } = await sb.from("comments").select("post_slug").is("deleted_at", null).in("post_slug", slugs.length ? slugs : ["-"]);
    const cc: Record<string, number> = {};
    for (const r of (cRows ?? []) as { post_slug: string }[]) cc[r.post_slug] = (cc[r.post_slug] ?? 0) + 1;
    const svc = getAdminSupabase(); const lc: Record<string, number> = {};
    if (svc && rows.length) { const { data: l } = await svc.rpc("like_counts", { p_type: "memory", p_ids: rows.map((r) => r.id) }); for (const r of (l ?? []) as { target_id: string; n: number }[]) lc[r.target_id] = Number(r.n); }
    memoryRows = rows.map((r) => ({ id: r.id, body: r.body, images: r.images ?? [], location: r.location, feeling: r.feeling, date: r.memory_date, pinned: r.pinned, published: r.published, photoFit: (r.photo_fit || "fill") as "fill", photoFocus: (r.photo_focus || "center") as "center", photoSize: (r.photo_size || "normal") as "normal", likes: lc[r.id] ?? 0, comments: cc[`m-${r.id}`] ?? 0 }));
  }

  let postRows: PostRow[] | null = null;
  if (tab === "posts") {
    const dbRows = (posts?.data ?? []) as { id: string; slug: string; title: string; category: string | null; excerpt: string | null; cover_url: string | null; cover_style: string | null; published: boolean; featured: boolean | null; published_at: string | null; updated_at: string; content: string }[];
    const filePosts = (await getAllPosts()).filter((p) => p.source === "file" && !dbRows.some((d) => d.slug === p.slug));
    const slugs = [...dbRows.map((d) => d.slug), ...filePosts.map((f) => f.slug)];
    const { data: cRows } = await sb.from("comments").select("post_slug").is("deleted_at", null).in("post_slug", slugs.length ? slugs : ["-"]);
    const cCount: Record<string, number> = {};
    for (const r of (cRows ?? []) as { post_slug: string }[]) cCount[r.post_slug] = (cCount[r.post_slug] ?? 0) + 1;
    const svc = getAdminSupabase();
    const lCount: Record<string, number> = {};
    if (svc && slugs.length) {
      const { data } = await svc.rpc("like_counts", { p_type: "post", p_ids: slugs });
      for (const r of (data ?? []) as { target_id: string; n: number }[]) lCount[r.target_id] = Number(r.n);
    }
    postRows = [
      ...dbRows.map((d) => ({ id: d.id, slug: d.slug, title: d.title, category: d.category || "", excerpt: d.excerpt || "", cover: d.cover_url || undefined, coverStyle: d.cover_style || undefined, published: d.published, featured: Boolean(d.featured), date: d.published_at || d.updated_at, source: "db" as const, likes: lCount[d.slug] ?? 0, comments: cCount[d.slug] ?? 0, readingTime: readingTime(d.content || "") })),
      ...filePosts.map((f) => ({ id: null, slug: f.slug, title: f.title, category: f.category, excerpt: f.excerpt, cover: f.cover, coverStyle: f.coverStyle, published: true, featured: Boolean(f.featured), date: f.date, source: "file" as const, likes: lCount[f.slug] ?? 0, comments: cCount[f.slug] ?? 0, readingTime: f.readingTime })),
    ];
  }

  return (
    <div>
      <div className="mb-3 flex justify-end"><CommandPalette /></div>
      <nav className="-mx-1 flex gap-1 overflow-x-auto px-1" aria-label="Admin sections">
        {tabs.map((t) => (
          <Link key={t} href={`/admin?tab=${t}`} aria-current={tab === t ? "page" : undefined} className={cn("rounded-xl border px-4 py-2 text-sm capitalize", tab === t ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200" : "border-white/10 text-mist-400 hover:text-mist-100")}>{t}</Link>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "content" && (() => {
          const rows = (contentRows?.data ?? []) as { key: string; value: unknown }[];
          const merged = mergeContent(rows);
          const custom = new Set(rows.map((r) => r.key));
          return (
            <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
              <ContentNav active={sectionKey} edited={[...custom]} />
              <AdminContent sectionKey={sectionKey} initial={merged[sectionKey]} isCustom={custom.has(sectionKey)} />
            </div>
          );
        })()}

        {tab === "overview" && overview}

        {tab === "memories" && memoryRows && <AdminMemories rows={memoryRows} avatar={site.profilePhoto} name={site.name} />}

        {tab === "posts" && postRows && <AdminPostsManager rows={postRows} categories={blogCategories} />}

        {tab === "highlights" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-lg font-semibold">Home-page highlight cards</h1>
              <p className="mt-1 text-sm text-mist-400">Degrees, certifications and impact numbers shown under the hero. Add a card when you earn a new certificate.</p>
            </div>
            {sp.error && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{sp.error}</p>}
            {(sp.saved || sp.updated) && <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{sp.updated ? "Card updated." : "Card added."} It’s live on the home page.</p>}
            <form action={createHighlight} className="glass grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <HighlightFields prefix="hl" />
              <div className="flex items-end lg:col-span-4"><button className="btn-primary"><Plus className="h-4 w-4" aria-hidden /> Add card</button></div>
            </form>
            <div className="glass overflow-hidden">
              {highlightRows?.data?.length ? (
                <ul className="divide-y divide-white/[0.05]">
                  {highlightRows.data.map((h) => (
                    <li key={h.id} className={cn("p-4", !h.published && "opacity-50")}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-4">
                          {(() => { const I = iconMap[h.icon as HighlightIcon] ?? fallbackIcon; return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border" style={{ color: h.hue, borderColor: `${h.hue}55`, background: `${h.hue}1a` }}><I className="h-5 w-5" aria-hidden /></span>; })()}
                          <span className="w-20 shrink-0 font-display text-2xl font-bold" style={{ color: h.hue }}>{h.value}</span>
                          <div className="min-w-0"><p className="truncate text-sm text-mist-100">{h.label}</p><p className="font-mono text-[10px] uppercase tracking-widest text-mist-500">{h.tag} · {h.source}</p></div>
                        </div>
                        <div className="flex gap-1.5">
                          <Btn label="Move up" action={moveHighlight.bind(null, h.id, -1)}><ArrowUp className="h-3.5 w-3.5" aria-hidden /></Btn>
                          <Btn label="Move down" action={moveHighlight.bind(null, h.id, 1)}><ArrowDown className="h-3.5 w-3.5" aria-hidden /></Btn>
                          <Btn label={h.published ? "Hide" : "Show"} action={setHighlightPublished.bind(null, h.id, !h.published)}>{h.published ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}</Btn>
                          <Btn label="Delete card" danger action={deleteHighlight.bind(null, h.id)}><Trash2 className="h-3.5 w-3.5" aria-hidden /></Btn>
                        </div>
                      </div>
                      <details className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                        <summary className="cursor-pointer px-4 py-2 text-xs text-cyan-300">Edit card</summary>
                        <form action={updateHighlight.bind(null, h.id)} className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                          <HighlightFields prefix={`e-${h.id}`} v={h} withSort={false} />
                          <div className="lg:col-span-4"><button className="btn-primary py-2 text-sm">Save card</button></div>
                        </form>
                      </details>
                    </li>
                  ))}
                </ul>
              ) : <p className="p-8 text-center text-sm text-mist-400">No cards in the database yet — run supabase/schema.sql to seed the current five.</p>}
            </div>
          </div>
        )}

        {tab === "gallery" && (
          <div className="space-y-6">
            <AdminGallery initial={(await getContent()).gallery} />
            {galleryRows?.data?.length ? (
            <div className="glass overflow-hidden">
              <h2 className="border-b border-white/[0.06] p-4 text-lg font-semibold">Earlier uploads</h2>
              {galleryRows?.data?.length ? (
                <ul className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                  {galleryRows.data.map((g) => (
                    <li key={g.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.image_url} alt={g.title} className={cn("aspect-[4/3] w-full object-cover", !g.published && "opacity-40")} />
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-mist-100">{g.title}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-mist-500">{g.category} · {g.kind} · {g.published ? "visible" : "hidden"}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <Btn label={g.featured ? "Unfeature" : "Feature (show first)"} action={setGalleryFlag.bind(null, g.id, "featured", !g.featured)}><Star className={cn("h-3.5 w-3.5", g.featured && "fill-amber-300 text-amber-300")} aria-hidden /> Featured</Btn>
                          <Btn label={g.published ? "Hide" : "Show"} action={setGalleryFlag.bind(null, g.id, "published", !g.published)}>{g.published ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />} {g.published ? "Hide" : "Show"}</Btn>
                          <Btn label="Delete photo" danger action={deleteGalleryItem.bind(null, g.id)}><Trash2 className="h-3.5 w-3.5" aria-hidden /></Btn>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            ) : null}
          </div>
        )}

        {tab === "resume" && (() => {
          const cur = resumeRow?.data?.value as { url?: string; updated_at?: string } | undefined;
          return (
            <div className="glass space-y-6 p-6">
              <div>
                <h1 className="text-lg font-semibold">Resume PDF</h1>
                <p className="mt-1 text-sm text-mist-400">This is the PDF visitors open and download on the Resume page.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
                <p className="text-mist-400">Currently live</p>
                <p className="mt-1 break-all text-mist-100">{cur?.url ? <a href={cur.url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">Uploaded resume</a> : `Bundled file (${site.resumePath})`}</p>
                {cur?.updated_at && <p className="mt-1 font-mono text-[11px] text-mist-500">Updated {formatDate(cur.updated_at)}</p>}
              </div>
              <ResumeUploader />
              {cur?.url && <Btn label="Go back to the bundled resume" danger action={resetResume}>Use the bundled resume instead</Btn>}
              <ResumeContentLinks />
            </div>
          );
        })()}

        {tab === "comments" && (
          <div className="glass overflow-hidden">
            <h1 className="border-b border-white/[0.06] p-4 text-lg font-semibold">Recent comments</h1>
            {comments?.data?.length ? (
              <ul className="divide-y divide-white/[0.05]">
                {comments.data.map((c) => (
                  <li key={c.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-mist-500"><span className="text-mist-200">{c.author_name}</span> on <Link className="text-cyan-300" href={`/blog/${c.post_slug}`}>{c.post_slug}</Link> · {formatDate(c.created_at)} · <span className={c.status === "visible" ? "text-emerald-300" : "text-amber-300"}>{c.deleted_at ? "deleted by author" : c.status}</span></p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-mist-200">{c.body || "—"}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {c.status !== "visible" ? <Btn label="Approve / show" action={setCommentStatus.bind(null, c.id, "visible")}><Eye className="h-3.5 w-3.5" aria-hidden /> Show</Btn> : <Btn label="Hide" action={setCommentStatus.bind(null, c.id, "hidden")}><EyeOff className="h-3.5 w-3.5" aria-hidden /> Hide</Btn>}
                      <Btn label="Delete permanently" danger action={hardDeleteComment.bind(null, c.id)}><Trash2 className="h-3.5 w-3.5" aria-hidden /></Btn>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="p-8 text-center text-sm text-mist-400">No comments yet.</p>}
          </div>
        )}

        {tab === "reports" && (
          <div className="glass overflow-hidden">
            <h1 className="border-b border-white/[0.06] p-4 text-lg font-semibold">Open reports</h1>
            {reports?.data?.length ? (
              <ul className="divide-y divide-white/[0.05]">
                {reports.data.map((r) => {
                  const c = (Array.isArray(r.comment) ? r.comment[0] : r.comment) as { id: string; body: string; author_name: string; post_slug: string; status: string } | null;
                  return (
                    <li key={r.id} className="flex flex-col gap-3 p-4 md:flex-row md:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-amber-200">“{r.reason}”</p>
                        {c && <p className="mt-2 rounded-lg bg-white/[0.03] p-2 text-sm text-mist-300"><span className="text-mist-500">{c.author_name} ({c.status}):</span> {c.body}</p>}
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        {c && <Btn label="Hide comment" action={setCommentStatus.bind(null, c.id, "hidden")}><EyeOff className="h-3.5 w-3.5" aria-hidden /> Hide</Btn>}
                        <Btn label="Mark resolved" action={resolveReport.bind(null, r.id)}><Check className="h-3.5 w-3.5" aria-hidden /> Resolve</Btn>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="p-8 text-center text-sm text-mist-400">No open reports.</p>}
          </div>
        )}

        {tab === "media" && <AdminMedia />}

        {tab === "messages" && (
          <div className="glass overflow-hidden">
            <h1 className="border-b border-white/[0.06] p-4 text-lg font-semibold">Contact messages</h1>
            {messages?.data?.length ? (
              <ul className="divide-y divide-white/[0.05]">
                {messages.data.map((m) => (
                  <li key={m.id} className={cn("p-4", !m.read && "bg-cyan-400/[0.03]")}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-mist-100">{m.subject}</p>
                        <p className="text-xs text-mist-500">{m.name} · <a className="text-cyan-300" href={`mailto:${m.email}`}>{m.email}</a> · {formatDate(m.created_at)}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Btn label={m.read ? "Mark unread" : "Mark read"} action={setMessageRead.bind(null, m.id, !m.read)}>{m.read ? <Mail className="h-3.5 w-3.5" aria-hidden /> : <MailOpen className="h-3.5 w-3.5" aria-hidden />}</Btn>
                        <Btn label="Delete message" danger action={deleteMessage.bind(null, m.id)}><Trash2 className="h-3.5 w-3.5" aria-hidden /></Btn>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-mist-300">{m.message}</p>
                    <MessageReply m={m} me={site.name} onSend={replyToMessage} />
                  </li>
                ))}
              </ul>
            ) : <p className="p-8 text-center text-sm text-mist-400">No messages yet.</p>}
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-6">
          <BackupPanel />
          <div className="glass max-w-xl p-6">
            <h1 className="text-lg font-semibold">Comment moderation</h1>
            <p className="mt-2 text-sm text-mist-400">When enabled, new comments are held as “pending” until you approve them. Comments are auto-hidden after 3 reports either way.</p>
            {(() => {
              const on = settings?.data?.value === true;
              return (
                <form action={setModeration.bind(null, !on)} className="mt-5 flex items-center gap-4">
                  <span className={cn("chip", on ? "text-emerald-300" : "text-mist-400")}>{on ? "Approval required" : "Comments publish immediately"}</span>
                  <button className="btn-secondary py-2 text-xs">{on ? "Disable approval" : "Require approval"}</button>
                </form>
              );
            })()}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
