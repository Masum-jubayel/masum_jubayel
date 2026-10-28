import { getContent } from "@/lib/content";
import { headingTitle } from "@/components/ui/HeadingText";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DomainBars, DomainCards, SecurityJourney } from "@/components/sections/HomeAnimated";
import { CyberCTA } from "@/components/sections/CyberCTA";
import { StatCards } from "@/components/sections/StatCards";
import { Hero } from "@/components/hero/Hero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { KeywordMarquee, Parallax, ScrollProgress, SectionDivider, TiltReveal } from "@/components/sections/HomeFx";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AwardCards } from "@/components/sections/Achievements";
import { PostCard } from "@/components/blog/PostCard";
import { getAllPosts, toMeta } from "@/lib/blog";
import { getHighlights } from "@/lib/highlights";

export const revalidate = 60;


export default async function Home() {
  const c = await getContent();
  const P = c.pages;
  const { site, experience, education, certifications, awards, research, projects } = c;
  const skillGroups = c.skills, aboutSummary = c.about.summary, careerObjectives = c.about.objectives;
  void [site, experience, education, certifications, awards, research, projects, skillGroups, aboutSummary, careerObjectives];
  const L = c.layout;
  const posts = (await getAllPosts()).slice(0, Number(L.homePostsCount) || 3).map(toMeta);
  const highlights = await getHighlights();
  const pinned = projects.filter((p) => p.status === "published" && p.featured);
  const featured = (pinned.length ? pinned : projects.filter((p) => p.status === "published")).slice(0, Number(L.homeProjectsCount) || 3);
  // Home order: infrastructure-first, with web development and databases at the end.
  const homeGroups = [...skillGroups.filter((g) => !["web", "data", "languages"].includes(g.id)), ...skillGroups.filter((g) => g.id === "web"), ...skillGroups.filter((g) => g.id === "data"), ...skillGroups.filter((g) => g.id === "languages")];

  return (
    <>
      {L.fxScrollProgress && <ScrollProgress />}
      <Hero info={site} layout={L} scene={c.scene} />

      {/* Overview stats */}
      {L.homeStats && (
        <section id="overview" className="container-x scroll-mt-20 py-12" aria-label="Highlights">
          <StatCards items={highlights} />
        </section>
      )}

      {L.homeMarquee && L.marqueeWords.length > 0 && <KeywordMarquee words={L.marqueeWords} />}

{L.homeWhat && (<>
      {/* Positioning */}
      <section className="container-x py-10">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-24">
            <SectionHeading index="01" eyebrow={P.home_what.eyebrow} title={headingTitle(P.home_what, "text-mist-400")}>{P.home_what.text}</SectionHeading>
            <DomainBars groups={homeGroups} />
            <Link href="/skills" className="btn-ghost -ml-3 mt-6 text-cyan-300">See the full skills dashboard <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <DomainCards groups={homeGroups} />
        </div>
      </section>

      </>)}
      <SectionDivider />

{L.homeExperience && (<>
      {/* Experience snapshot */}
      <section className="container-x py-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading index="02" eyebrow={P.home_experience.eyebrow} title={headingTitle(P.home_experience)}>{P.home_experience.text}</SectionHeading>
            <Link href="/experience" className="btn-secondary mt-8">Full experience <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <ExperienceTimeline jobs={experience.filter((j) => j.primary)} compact />
        </div>
      </section>

      </>)}
      <SectionDivider />

{L.homeProjects && (<>
      {/* Projects */}
      <section className="container-x py-14">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading index="03" eyebrow={P.home_projects.eyebrow} title={headingTitle(P.home_projects)}>{P.home_projects.text || null}</SectionHeading>
          <Link href="/projects" className="btn-secondary self-start md:self-auto">All projects <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => <TiltReveal key={p.slug} delay={i * 0.1} className="h-full"><ProjectCard project={p} /></TiltReveal>)}
        </div>
      </section>

      </>)}
{L.homeSecurity && (<>
      {/* Security direction */}
      <section className="container-x py-10">
        <Parallax speed={30}><SecurityJourney href="/projects?category=Cybersecurity%20Learning%20Labs" /></Parallax>
      </section>

      </>)}
      <SectionDivider />

{L.homeAchievements && (<>
      {/* Achievements */}
      <section className="container-x py-14">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading index="04" eyebrow={P.home_achievements.eyebrow} title={headingTitle(P.home_achievements)}>{P.home_achievements.text || null}</SectionHeading>
          <Link href="/achievements" className="btn-secondary self-start md:self-auto">Certifications & research <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
        <div className="mt-10"><AwardCards awards={awards} /></div>
      </section>

      </>)}
      {/* Blog */}
      {L.homeBlog && posts.length > 0 && (
        <section className="container-x py-14">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading index="05" eyebrow={P.home_blog.eyebrow} title={headingTitle(P.home_blog)}>{P.home_blog.text || null}</SectionHeading>
            <Link href="/blog" className="btn-secondary self-start md:self-auto">All articles <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {posts.map((p, i) => <TiltReveal key={p.slug} delay={i * 0.1} className="h-full"><PostCard post={p} /></TiltReveal>)}
          </div>
        </section>
      )}

{L.homeCta && (<>
      {/* CTA */}
      <section className="container-x py-16">
        <Parallax speed={24}><CyberCTA title={c.about.ctaTitle} text={c.about.ctaText} /></Parallax>
      </section>

      </>)}    </>
  );
}
