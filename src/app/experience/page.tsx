import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { headingTitle } from "@/components/ui/HeadingText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { CareerPath, ExperienceStats, SecondaryRoles } from "@/components/sections/ExperienceExtras";

export const metadata: Metadata = {
  title: "Professional Experience",
  description: "Network administration, field engineering, structured cabling and IT support experience in Canada and Bangladesh.",
  alternates: { canonical: "/experience" },
};

export const revalidate = 60;

export default async function ExperiencePage() {
  const c = await getContent();
  const P = c.pages;
  const { site, experience, education, certifications, awards, research, projects } = c;
  const skillGroups = c.skills, aboutSummary = c.about.summary, careerObjectives = c.about.objectives;
  void [site, experience, education, certifications, awards, research, projects, skillGroups, aboutSummary, careerObjectives];
  // Latest first (current role at the top), then by start date.
  const byLatest = [...experience].sort((a, b) => Number(b.end === null) - Number(a.end === null) || b.start.localeCompare(a.start));
  const S = c.sections;
  const primary = byLatest.filter((j) => j.primary);
  const secondary = byLatest.filter((j) => !j.primary);
  return (
    <>
      <PageHeader eyebrow={P.experience_header.eyebrow} title={headingTitle(P.experience_header)}>
        {P.experience_header.text}
      </PageHeader>
      {(S.expStats || S.expPath) && <section className="container-x space-y-6 pt-12">
        {S.expStats && <ExperienceStats jobs={experience} />}
        {S.expPath && <CareerPath jobs={byLatest} />}
      </section>}
      {S.expCore && <section className="container-x py-16">
        <SectionHeading eyebrow={P.experience_core.eyebrow} title={headingTitle(P.experience_core)}>{P.experience_core.text || null}</SectionHeading>
        <div className="mt-10"><ExperienceTimeline jobs={primary} openFirst={S.expOpenFirst} /></div>
      </section>}
      {S.expAdditional && secondary.length > 0 && (
        <section className="container-x pb-16 pt-4">
          <SectionHeading eyebrow={P.experience_additional.eyebrow} title={headingTitle(P.experience_additional)}>{P.experience_additional.text || null}</SectionHeading>
          <div className="mt-10"><SecondaryRoles jobs={secondary} /></div>
        </section>
      )}
    </>
  );
}
