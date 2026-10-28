import { site as staticSite } from "@/lib/site";
import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { OnlineResume, ResumePaper, ResumeStats } from "@/components/sections/ResumeAnimated";
import { getResume } from "@/lib/resume";
import { ResumeViewer } from "@/components/sections/ResumeViewer";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${staticSite.name}, ${staticSite.title}. Download the PDF or read it online.`,
  alternates: { canonical: "/resume" },
};

export const revalidate = 60;

export default async function ResumePage() {
  const c = await getContent();
  const { site, experience, education, certifications, awards, research, projects } = c;
  const skillGroups = c.skills, aboutSummary = c.about.summary, careerObjectives = c.about.objectives;
  void [site, experience, education, certifications, awards, research, projects, skillGroups, aboutSummary, careerObjectives];
  const resume = await getResume();
  const R = c.resume;
  const first = experience.map((j) => j.start).filter(Boolean).sort()[0] ?? "";
  const since = Number(first.slice(0, 4)) || new Date().getFullYear();
  const stats = [
    { value: `${new Date().getFullYear() - since}+`, label: "Years of experience" },
    { value: String(experience.length), label: "Roles" },
    { value: String(certifications.length), label: "Certifications" },
    { value: String(skillGroups.reduce((n, g) => n + g.skills.length, 0)), label: "Skills" },
  ];
  return (
    <>
      <div className="print:hidden">
        <PageHeader eyebrow={R.eyebrow} title={<>{R.title} {R.accent && <span className="text-gradient">{R.accent}</span>}</>} aside={R.showPaper ? <ResumePaper name={site.name} title={site.title} src={resume.url} labels={R.chips} fileName={R.downloadName} /> : undefined}>
          {R.intro || null}
        </PageHeader>
      </div>
      <div className="pb-10 pt-10 print:pt-0">
        <div className="container-x">
          {R.showStats && <ResumeStats items={stats} />}
          <ResumeViewer
            src={resume.url}
            updated={resume.updated}
            initial={R.defaultView}
            fileName={R.downloadName || "resume.pdf"}
            online={<OnlineResume site={site} summary={aboutSummary} experience={experience} education={education} skills={skillGroups} certifications={certifications} research={research} awards={awards} cfg={R} />}
          />
        </div>
      </div>
    </>
  );
}
