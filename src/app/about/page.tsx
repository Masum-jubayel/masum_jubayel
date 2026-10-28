import type { Metadata } from "next";
import { CompanyName } from "@/components/ui/CompanyLogo";
import { getContent } from "@/lib/content";
import { ProofThumb } from "@/components/ui/ProofThumb";
import { headingTitle } from "@/components/ui/HeadingText";
import Link from "next/link";
import { ArrowRight, Briefcase, Compass, GraduationCap, MapPin, ShieldCheck, Target } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { HoloCard } from "@/components/ui/HoloCard";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { AwardCards, ResearchCard } from "@/components/sections/Achievements";
import { AnimatedPortrait, FocusCards, GlanceStats, WordReveal } from "@/components/about/AboutAnimated";
import { LookImg } from "@/components/ui/LookMedia";

export const metadata: Metadata = {
  title: "About Me",
  description: "Professional story, education and career direction of Masum Mohammad Jubayel — Lead IT Support & Network Administrator.",
  alternates: { canonical: "/about" },
};

export const revalidate = 60;

export default async function AboutPage() {
  const c = await getContent();
  const P = c.pages;
  const { site, experience, education, certifications, awards, research, projects } = c;
  const skillGroups = c.skills, aboutSummary = c.about.summary, careerObjectives = c.about.objectives;
  void [site, experience, education, certifications, awards, research, projects, skillGroups, aboutSummary, careerObjectives];
  const current = experience[0];
  const skillCount = skillGroups.reduce((n, g) => n + g.skills.length, 0);
  const A = c.about;
  const auto = [
    { value: String(education.length), label: "Degrees" },
    { value: String(certifications.length), label: "Certifications" },
    { value: String(projects.filter((p) => p.status === "published").length), label: "Projects" },
    { value: `${skillCount}+`, label: "Skills" },
    { value: String(awards.filter((a) => a.tier !== "participation").length), label: "Awards" },
  ];
  const glance = [...(A.statsAuto ? auto : []), ...A.stats.filter((x) => x.value || x.label)].slice(0, 12);
  const numberWord = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"][A.focus.length] ?? String(A.focus.length);
  return (
    <>
      <PageHeader eyebrow={P.about_header.eyebrow} title={headingTitle(P.about_header)} aside={["about", "both"].includes(c.layout.holoPlace) ? <HoloCard scene={c.scene} /> : undefined}>
        {P.about_header.text || site.positioning}
      </PageHeader>

      {A.showStats && glance.length > 0 && <section className="container-x pt-12">
        <GlanceStats items={glance} />
      </section>}

      <section className={`container-x grid grid-cols-1 gap-12 py-16 ${A.showPortrait ? "lg:grid-cols-[0.8fr_1.2fr]" : ""}`}>
        {A.showPortrait && <Reveal>
          <div className="lg:sticky lg:top-28">
            {(A.portraitImage || site.profilePhoto)
              ? <AnimatedPortrait src={A.portraitImage || site.profilePhoto} alt={`Portrait of ${site.name}`} chips={A.portraitChips} ring={A.portraitRing} focus={A.portraitFocus} shape={A.portraitShape} />
              : <ImageSlot alt={`Portrait of ${site.name}`} label="Profile photograph" person className="relative aspect-[4/5] rounded-3xl" />}
            {A.showNameCard && <div className="glass mt-5 p-5">
              <p className="font-display text-lg font-semibold text-mist-100">{site.name}</p>
              <p className="text-sm text-cyan-300">{site.title}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-mist-400"><MapPin className="h-3.5 w-3.5" aria-hidden /> {site.location}</p>
            </div>}
          </div>
        </Reveal>}

        <div className="space-y-12">
          {A.showIntro && <Reveal>
            <p className="eyebrow">{A.introLabel}</p>
            <WordReveal text={aboutSummary} className="mt-4" />
          </Reveal>}

          {A.showFocus && c.about.focus.length > 0 && (
            <div>
              <p className="eyebrow">{A.focusEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{numberWord} {A.focusTitle} {A.focusAccent && <span className="text-gradient">{A.focusAccent}</span>}</h2>
              {A.focusText && <p className="mt-2 text-sm text-mist-400">{A.focusText}</p>}
              <div className="mt-6"><FocusCards items={c.about.focus} /></div>
            </div>
          )}

          {A.showCurrent && current && <Reveal>
            <div className="glass glass-hover p-6">
              <div className="flex items-center gap-3 text-cyan-300"><Briefcase className="h-5 w-5" aria-hidden /><span className="eyebrow">{A.currentLabel}</span></div>
              <h2 className="mt-3 text-2xl font-semibold">{current.title}</h2>
              <p className="mt-1 text-mist-300">{current.company} · {current.location}</p>
              <p className="mt-4 text-sm leading-relaxed text-mist-300">{current.summary}</p>
            </div>
          </Reveal>}

          {A.showEducation && <Reveal>
            <div className="flex items-center gap-3 text-cyan-300"><GraduationCap className="h-5 w-5" aria-hidden /><span className="eyebrow">{A.educationLabel}</span></div>
            {A.commencementImage && <figure className="glass mt-4 overflow-hidden">
              <div className="relative aspect-[3/2]">
                { }
                <LookImg src={A.commencementImage} alt={A.commencementCaption || "Education photo"} className="absolute inset-0 h-full w-full object-cover" />
              </div>
              {A.commencementCaption && <figcaption className="p-4 text-xs text-mist-400">{A.commencementCaption}</figcaption>}
            </figure>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {education.map((e) => (
                <article key={e.degree} className="glass glass-hover p-6">
                  {e.image && <ProofThumb src={e.image} alt={`${e.degree} certificate`} className="mb-4 aspect-[4/3]" />}
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[11px] text-mist-500">{e.date}</p>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{e.degree}</h3>
                  <p className="text-sm text-cyan-300">{e.field}</p>
                  <p className="mt-3 text-sm text-mist-300"><CompanyName name={e.school} website={e.website} /></p>
                  <p className="text-xs text-mist-500">{e.location} · GPA {e.gpa}</p>
                </article>
              ))}
            </div>
          </Reveal>}

          {A.showAchievements && c.about.achievements.length > 0 && <Reveal>
            <div className="flex items-center gap-3 text-cyan-300"><Target className="h-5 w-5" aria-hidden /><span className="eyebrow">{A.achievementsLabel}</span></div>
            <ul className="mt-4 grid gap-3">
              {c.about.achievements.map((a) => (
                <li key={a} className="glass flex gap-3 p-4 text-sm text-mist-200">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden />{a}
                </li>
              ))}
            </ul>
          </Reveal>}

          {A.showInterests && c.about.interests.length > 0 && <Reveal>
            <div className="flex items-center gap-3 text-violet-400"><ShieldCheck className="h-5 w-5" aria-hidden /><span className="eyebrow text-violet-400">{A.interestsLabel}</span></div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {c.about.interests.map((i) => (
                <article key={i.title} className="glass glass-hover p-5">
                  <h3 className="text-base font-semibold">{i.title}</h3>
                  <p className="mt-2 text-sm text-mist-400">{i.body}</p>
                </article>
              ))}
            </div>
          </Reveal>}
        </div>
      </section>

      {A.showTimeline && <section className="container-x py-16">
        <SectionHeading eyebrow={P.about_timeline.eyebrow} title={headingTitle(P.about_timeline)}>{P.about_timeline.text || null}</SectionHeading>
        <div className="mt-10"><ExperienceTimeline jobs={experience} compact /></div>
      </section>}

      {A.showResearch && <section className="container-x space-y-10 py-16">
        <SectionHeading eyebrow={P.about_research.eyebrow} title={headingTitle(P.about_research)}>{P.about_research.text || null}</SectionHeading>
        <ResearchCard research={research} />
        <AwardCards awards={awards} />
      </section>}

      {A.showObjectives && <section className="container-x py-16">
        <div className="glass p-8 sm:p-10">
          <div className="flex items-center gap-3 text-cyan-300"><Compass className="h-5 w-5" aria-hidden /><span className="eyebrow">{A.objectivesLabel}</span></div>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{A.objectivesTitle}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-2">
            {careerObjectives.map((o, i) => (
              <li key={o} className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-mist-200">
                <span className="font-mono text-cyan-400">{String(i + 1).padStart(2, "0")}</span>{o}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            {A.ctaPrimaryLabel && <Link href={A.ctaPrimaryHref || "/contact"} className="btn-primary">{A.ctaPrimaryLabel} <ArrowRight className="h-4 w-4" aria-hidden /></Link>}
            {A.ctaSecondaryLabel && <Link href={A.ctaSecondaryHref || "/skills"} className="btn-secondary">{A.ctaSecondaryLabel}</Link>}
          </div>
        </div>
      </section>}
    </>
  );
}
