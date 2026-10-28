import { Attachments } from "@/components/ui/Attachments";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Github, Lightbulb, ListChecks, Target, User, Wrench } from "lucide-react";
import { projects } from "@/content/projects";
import { getContent } from "@/lib/content";
import { PdfButton } from "@/components/ui/PdfButton";
import { ProofThumb } from "@/components/ui/ProofThumb";

import { ProjectCover } from "@/components/projects/ProjectCover";
import { NetworkDiagram } from "@/components/projects/NetworkDiagram";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { getAllPosts } from "@/lib/blog";
import { PostCard } from "@/components/blog/PostCard";

export const revalidate = 60;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getContent()).projects.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.title, description: p.overview, alternates: { canonical: `/projects/${p.slug}` }, robots: p.status === "draft" ? { index: false } : undefined };
}

function Block({ icon: Icon, title, children }: { icon: typeof Target; title: string; children: React.ReactNode }) {
  return (
    <section className="glass p-6">
      <h2 className="flex items-center gap-2.5 text-lg font-semibold"><Icon className="h-5 w-5 text-cyan-300" aria-hidden />{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-mist-300">{children}</div>
    </section>
  );
}

const Pending = ({ what }: { what: string }) => <p className="font-mono text-xs text-mist-500">{what} — to be added.</p>;

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = (await getContent()).projects.find((x) => x.slug === slug);
  if (!p) notFound();
  const posts = (await getAllPosts()).filter((x) => p.relatedPosts.includes(x.slug));
  const draft = p.status === "draft";

  return (
    <article className="pb-10 pt-28">
      <div className="container-x">
        <Link href="/projects" className="btn-ghost -ml-3 text-sm"><ArrowLeft className="h-4 w-4" aria-hidden /> All projects</Link>
        <header className="mt-6 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="chip text-cyan-300">{p.category}</span>
              {draft && <span className="chip border-amber-300/40 text-amber-300">DRAFT · planned, not yet completed</span>}
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">{p.title}</h1>
            <p className="mt-3 font-mono text-xs text-mist-500">{p.context}</p>
            <p className="mt-6 text-lg leading-relaxed text-mist-200">{p.overview}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {p.repo ? <a className="btn-secondary" href={p.repo} target="_blank" rel="noopener noreferrer"><Github className="h-4 w-4" aria-hidden /> Repository</a> : <span className="chip border-dashed opacity-70">Repository — not published</span>}
              {p.demo ? <a className="btn-primary" href={p.demo} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" aria-hidden /> Visit live site</a> : <span className="chip border-dashed opacity-70">Live demo — n/a</span>}
              {(p.documents ?? []).map((d) => <PdfButton key={d.src} src={d.src} label={d.label || "Document"} className="btn-secondary" />)}
            </div>
          </div>
          <div className="glass overflow-hidden"><ProjectCover project={p} className="aspect-[16/9] h-full w-full" /></div>
        </header>

        {draft ? (
          <div className="glass mt-12 border-dashed p-8 text-center">
            <p className="text-mist-300">This project is planned. Topology, configurations, results and lessons learned will be published once the work is complete.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2 [&>*]:min-w-0">
            <Block icon={Target} title="Problem">{p.problem || <Pending what="Problem statement" />}</Block>
            <Block icon={User} title="My role">
              <p className="text-mist-100">{p.role}</p>
              <ul className="mt-3 space-y-2">{p.contributions.map((c) => <li key={c} className="flex gap-2"><span className="mt-2 h-1 w-2 shrink-0 rounded bg-cyan-400/70" aria-hidden />{c}</li>)}</ul>
            </Block>
            {p.diagram && <div className="lg:col-span-2"><h2 className="mb-4 text-lg font-semibold">Architecture</h2><NetworkDiagram diagram={p.diagram} /></div>}
            <Block icon={Wrench} title="Technologies & tools">
              <div className="flex flex-wrap gap-2">{p.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </Block>
            <Block icon={ListChecks} title="Results">
              {p.results.length ? <ul className="space-y-2">{p.results.map((r) => <li key={r}>• {r}</li>)}</ul> : <Pending what="Results" />}
            </Block>
            {p.snippet && (
              <div className="lg:col-span-2">
                <h2 className="mb-4 text-lg font-semibold">{p.snippet.title}</h2>
                <CodeBlock code={p.snippet.code} language={p.snippet.language} />
                <p className="mt-2 font-mono text-[11px] text-amber-300/80">{p.snippet.note}</p>
              </div>
            )}
            <div className="lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">Screenshots & demonstrations</h2>
              {p.screenshots.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {p.screenshots.map((s) => (
                    <figure key={s.src} className="glass overflow-hidden">
                      <ProofThumb src={s.src} alt={s.caption} className="rounded-none border-0 bg-white/[0.03] [&_img]:max-h-[520px] [&_img]:object-contain" />
                      <figcaption className="p-3 text-xs text-mist-400">{s.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : <div className="glass border-dashed p-6"><Pending what="Screenshots (sanitized, no client data)" /></div>}
              {(p.documents ?? []).length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(p.documents ?? []).map((d) => (
                    <PdfButton key={d.src} src={d.src} label={d.label || "Document"} className="glass glass-hover flex w-full items-center gap-3 p-4 text-left">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300"><FileText className="h-5 w-5" aria-hidden /></span>
                      <span className="min-w-0"><span className="block truncate text-sm text-mist-100">{d.label || "Document"}</span><span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Open here</span></span>
                    </PdfButton>
                  ))}
                </div>
              )}
            </div>
            {(p.attachments ?? []).length > 0 && <Attachments items={p.attachments ?? []} />}
            <Block icon={Lightbulb} title="Lessons learned">
              {p.lessons.length ? <ul className="space-y-2">{p.lessons.map((l) => <li key={l}>• {l}</li>)}</ul> : <Pending what="Lessons learned" />}
            </Block>
          </div>
        )}

        {posts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold">Related articles</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">{posts.map((x) => { const { content: _c, ...m } = x; void _c; return <PostCard key={x.slug} post={m} />; })}</div>
          </section>
        )}
      </div>
    </article>
  );
}
