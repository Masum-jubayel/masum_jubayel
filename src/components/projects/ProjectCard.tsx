import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/projects";
import { ProjectCover } from "./ProjectCover";
import { TiltCard } from "@/components/ui/TiltCard";

export function ProjectCard({ project }: { project: Project }) {
  const draft = project.status === "draft";
  return (
    <TiltCard className="h-full">
      <Link href={`/projects/${project.slug}`} className="glass glass-hover flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-white/[0.06]">
          <ProjectCover project={project} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" />
          {draft && <span className="absolute left-3 top-3 rounded-md border border-amber-300/40 bg-ink-950/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-300">Draft · Planned</span>}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">{project.category}</p>
          <h3 className="mt-2 text-lg font-semibold leading-snug text-mist-100">{project.title}</h3>
          <p className="mt-1 text-xs text-mist-500">{project.context}</p>
          <p className="mt-3 line-clamp-3 text-sm text-mist-300">{project.overview}</p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div className="flex flex-wrap gap-1.5">
              {project.tech.slice(0, 3).map((t) => <span key={t} className="chip py-0.5 text-[10px]">{t}</span>)}
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-mist-400 transition group-hover:text-cyan-300" aria-hidden />
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
