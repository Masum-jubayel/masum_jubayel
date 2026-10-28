import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { headingTitle } from "@/components/ui/HeadingText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkillsDashboard } from "@/components/sections/SkillsDashboard";

export const metadata: Metadata = {
  title: "Technical Skills",
  description: "Networking, IT infrastructure, device provisioning, web systems and cybersecurity skills — each labeled by the evidence behind it.",
  alternates: { canonical: "/skills" },
};

export const revalidate = 60;

export default async function SkillsPage() {
  const c = await getContent();
  const P = c.pages;
  const { site, experience, education, certifications, awards, research, projects } = c;
  const skillGroups = c.skills, aboutSummary = c.about.summary, careerObjectives = c.about.objectives;
  void [site, experience, education, certifications, awards, research, projects, skillGroups, aboutSummary, careerObjectives];
  const total = skillGroups.reduce((n, g) => n + g.skills.length, 0);
  return (
    <>
      <PageHeader
        eyebrow={P.skills_header.eyebrow}
        title={headingTitle(P.skills_header)}
        aside={c.sections.skillsCount ? <div className="glass px-5 py-4 text-right"><p className="font-display text-3xl font-semibold text-mist-100">{total}</p><p className="font-mono text-[10px] uppercase tracking-widest text-mist-400">skills · {skillGroups.length} domains</p></div> : undefined}
      >
        {P.skills_header.text}
      </PageHeader>
      <section className="container-x pb-14 pt-6">
        {skillGroups.map((g) => <span key={g.id} id={g.id} className="block scroll-mt-28" aria-hidden />)}
        <SkillsDashboard skillGroups={skillGroups} show={c.sections} />
      </section>
    </>
  );
}
