import type { Metadata } from "next";
import { PolaroidBoard } from "@/components/gallery/PolaroidBoard";
import { NeuralPortrait } from "@/components/gallery/NeuralPortrait";
import { getContent } from "@/lib/content";
import { FilmStrip, GalleryHeroIntro } from "@/components/gallery/GalleryHero";
import { getGalleryItems } from "@/lib/gallery";
import { getMemories } from "@/lib/memories";
import { MemoriesSpotlight } from "@/components/gallery/MemoriesProfile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { headingTitle } from "@/components/ui/HeadingText";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description: "Milestones, brand artwork, lab topologies and work photos from Masum Mohammad Jubayel.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const items = await getGalleryItems();
  const memories = await getMemories();
  const { pages, site, experience, education, layout } = await getContent();
  const current = experience.find((j) => j.end === null) ?? experience[0];
  const hd = pages.gallery_header, mh = pages.gallery_memories;
  return (
    <>
      {layout.galleryHero && (<>
      {/* Hero: point-cloud portrait */}
      <section className="relative overflow-hidden pt-20">
        <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />
        <div className="container-x relative grid min-h-[86vh] grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1.15fr]">
          <GalleryHeroIntro eyebrow={hd.eyebrow} title={hd.title} accent={hd.accent} text={hd.text} stats={layout.gStats} cta1={layout.gCta1} cta2={layout.gCta2}
            counts={{ photos: items.filter((x) => x.kind !== "video").length, videos: items.filter((x) => x.kind === "video").length, memories: memories.length }} />
          <NeuralPortrait className="relative h-[56vh] min-h-[360px] w-full lg:h-[80vh]" hud={layout.gHud}
            settings={{ src: layout.gHeroImage, invert: layout.gHeroInvert, nameA: layout.gNameA, nameB: layout.gNameB, colorA: layout.gColorA, colorB: layout.gColorB, speed: layout.gSpeed, density: layout.gDensity, interactive: layout.gInteractive, orbit: layout.gOrbit }} />
        </div>
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" aria-hidden />
      </section>
      {layout.gFilmstrip && <div className="overflow-hidden py-6"><FilmStrip items={items} /></div>}
      </>)}

      {layout.galleryMemories && (<>
      {/* Memories feed */}
      <section id="memories" className={`container-x scroll-mt-20 py-16 ${layout.galleryHero ? "" : "pt-28"}`} aria-label="Memories">
        <SectionHeading eyebrow={mh.eyebrow} title={headingTitle(mh)}>{mh.text || null}</SectionHeading>
        <div className="mt-10"><MemoriesSpotlight memories={memories} site={site} current={current ? `${current.title} · ${current.company}` : site.title} education={education[0] ? `${education[0].degree} — ${education[0].school}` : ""} /></div>
      </section>
      </>)}

      {layout.galleryArchive && (<>
      {/* Index archive */}
      <section id="archive" className="container-x scroll-mt-20 py-16" aria-label="All images">
        <PolaroidBoard items={items} />
      </section>
      </>)}
    </>
  );
}
