import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { headingTitle } from "@/components/ui/HeadingText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AwardCards, CertificationCards, DegreeCards } from "@/components/sections/Achievements";
import { WorkCards } from "@/components/sections/WorkCards";
import { SectionJumpNav } from "@/components/sections/SectionJumpNav";

export const metadata: Metadata = {
  title: "Achievements, Certifications & Awards",
  description: "IEEE-sponsored ICIET 2019 research on stroke-risk prediction, IRC380 custom firmware project leadership, field work, CCNA and awards.",
  alternates: { canonical: "/achievements" },
};

export const revalidate = 60;

export default async function AchievementsPage() {
  const { certifications, awards, works, education, pages: P, sections: S } = await getContent();
  return (
    <>
      <PageHeader eyebrow={P.achievements_header.eyebrow} title={headingTitle(P.achievements_header)}>
        {P.achievements_header.text}
      </PageHeader>
      <section className="container-x space-y-20 pb-16 pt-6">
        {S.achJump && <SectionJumpNav items={[
          { id: "degrees", label: "Degrees", count: education.length },
          { id: "certs", label: "Certifications", count: certifications.length },
          ...(works.some((w) => w.published !== false) ? [{ id: "research", label: "Publication", count: works.filter((w) => w.published !== false).length }] : []),
          { id: "awards", label: "Awards", count: awards.filter((a) => a.tier !== "participation").length },
          ...(awards.some((a) => a.tier === "participation") ? [{ id: "participation", label: "Participation", count: awards.filter((a) => a.tier === "participation").length }] : []),
        ].filter((x) => ({ degrees: S.achDegrees, certs: S.achCerts, research: S.achResearch, awards: S.achAwards, participation: S.achParticipation } as Record<string, boolean>)[x.id])} />}
        {S.achDegrees && <div id="degrees" className="scroll-mt-36">
          <SectionHeading eyebrow={P.achievements_degrees.eyebrow} title={headingTitle(P.achievements_degrees)}>{P.achievements_degrees.text || null}</SectionHeading>
          <div className="mt-10"><DegreeCards education={education} /></div>
        </div>}
        {S.achCerts && <div id="certs" className="scroll-mt-36">
          <SectionHeading eyebrow={P.achievements_certs.eyebrow} title={headingTitle(P.achievements_certs)}>{P.achievements_certs.text || null}</SectionHeading>
          <div className="mt-10"><CertificationCards certifications={certifications} /></div>
        </div>}
        {S.achResearch && works.some((w) => w.published !== false) && <div id="research" className="scroll-mt-36">
          <SectionHeading eyebrow={P.achievements_work.eyebrow} title={headingTitle(P.achievements_work)}>{P.achievements_work.text || null}</SectionHeading>
          <div className="mt-10"><WorkCards works={works} /></div>
        </div>}
        {S.achAwards && <div id="awards" className="scroll-mt-36">
          <SectionHeading eyebrow={P.achievements_awards.eyebrow} title={headingTitle(P.achievements_awards)}>{P.achievements_awards.text || null}</SectionHeading>
          <div className="mt-10"><AwardCards awards={awards} /></div>
        </div>}
        {S.achParticipation && awards.some((a) => a.tier === "participation") && (
          <div id="participation" className="scroll-mt-36">
            <SectionHeading eyebrow={P.achievements_participation.eyebrow} title={headingTitle(P.achievements_participation)}>{P.achievements_participation.text || null}</SectionHeading>
            <div className="mt-10"><AwardCards awards={awards} only="participation" /></div>
          </div>
        )}
      </section>
    </>
  );
}
