import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { getMemories } from "@/lib/memories";
import { MemoriesProfile } from "@/components/gallery/MemoriesProfile";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Memories",
  description: "Milestones, events and everyday moments shared by Masum Mohammad Jubayel.",
  alternates: { canonical: "/gallery/memories" },
};

export default async function MemoriesPage() {
  const memories = await getMemories();
  const { site, experience, education } = await getContent();
  const current = experience.find((j) => j.end === null) ?? experience[0];
  return <MemoriesProfile memories={memories} site={site} current={current ? `${current.title} · ${current.company}` : site.title} education={education[0] ? `${education[0].degree} — ${education[0].school}` : ""} />;
}
