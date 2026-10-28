import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { headingTitle } from "@/components/ui/HeadingText";
import { Suspense } from "react";
import { FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies in network infrastructure, device provisioning, inventory systems, web development and research — plus planned cybersecurity labs.",
  alternates: { canonical: "/projects" },
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const c = await getContent();
  const P = c.pages;
  const { site, experience, education, certifications, awards, research, projects } = c;
  const skillGroups = c.skills, aboutSummary = c.about.summary, careerObjectives = c.about.objectives;
  void [site, experience, education, certifications, awards, research, projects, skillGroups, aboutSummary, careerObjectives];
  const labs = projects.filter((p) => p.category === "Cybersecurity Learning Labs");
  return (
    <>
      <PageHeader eyebrow={P.projects_header.eyebrow} title={headingTitle(P.projects_header)}>
        {P.projects_header.text}
      </PageHeader>
      {c.sections.projList && <section className="container-x py-14">
        <Suspense fallback={<p className="text-sm text-mist-400">Loading projects…</p>}>
          <ProjectExplorer projects={projects} perPage={Number(c.sections.projPerPage) || 12} />
        </Suspense>
      </section>}
      {c.sections.projLabs && labs.length > 0 && <section className="container-x py-14">
        <div className="flex items-start gap-4">
          <span className="mt-1 hidden h-11 w-11 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300 sm:grid"><FlaskConical className="h-5 w-5" aria-hidden /></span>
          <SectionHeading eyebrow={P.projects_next.eyebrow} title={headingTitle(P.projects_next)}>{P.projects_next.text || null}</SectionHeading>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {labs.map((p) => <ProjectCard key={p.slug} project={p} />)}
        </div>
      </section>}
    </>
  );
}
