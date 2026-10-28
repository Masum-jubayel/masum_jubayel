import { site as staticSite } from "@/lib/site";
import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { Mail, MapPin, Briefcase, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { NetworkBackdrop } from "@/components/ui/NetworkBackdrop";
import { Reveal } from "@/components/ui/Reveal";
import { ConnectStrip } from "@/components/contact/ConnectStrip";
import { HoloCard } from "@/components/ui/HoloCard";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${staticSite.name} about network administration, IT infrastructure and cybersecurity opportunities.`,
  alternates: { canonical: "/contact" },
};

export const revalidate = 60;

export default async function ContactPage() {
  const c = await getContent();
  const { site, experience, education, certifications, awards, research, projects } = c;
  const skillGroups = c.skills, aboutSummary = c.about.summary, careerObjectives = c.about.objectives;
  void [site, experience, education, certifications, awards, research, projects, skillGroups, aboutSummary, careerObjectives];
  const C = c.contact;
  return (
    <section className="relative overflow-hidden pb-16 pt-32">
      <NetworkBackdrop className="pointer-events-none absolute inset-0 h-full w-full opacity-70" interactive density={0.00012} />
      <div className="container-x relative grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="flex items-start justify-between gap-4">
          <div>
          <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-cyan-400/50" aria-hidden />{C.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{C.title} {C.accent && <span className="text-gradient">{C.accent}</span>}</h1>
          {C.showAvailability && C.availability && <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" /></span>{C.availability}</p>}
          {C.intro && <p className="mt-5 max-w-md text-mist-300">{C.intro}</p>}
          </div>
          {["contact", "both"].includes(c.layout.holoPlace) && <HoloCard scene={{ ...c.scene, holoSize: "small" }} className="hidden shrink-0 sm:block" />}
          </div>

          <div className="mt-10 space-y-3 [&>*]:transition-transform [&>*:hover]:translate-x-1">
            {C.showEmail && <a href={`mailto:${site.email}`} className="glass glass-hover flex items-center gap-4 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300"><Mail className="h-5 w-5" aria-hidden /></span>
              <span><span className="block text-xs text-mist-500">Personal email</span><span className="text-sm text-mist-100">{site.email}</span></span>
            </a>}
            {C.showWorkEmail && site.workEmail && <a href={`mailto:${site.workEmail}`} className="glass glass-hover flex items-center gap-4 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300"><Briefcase className="h-5 w-5" aria-hidden /></span>
              <span><span className="block text-xs text-mist-500">{C.workEmailLabel}</span><span className="text-sm text-mist-100">{site.workEmail}</span></span>
            </a>}
            {C.showPhone && site.phone && <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="glass glass-hover flex items-center gap-4 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300"><Phone className="h-5 w-5" aria-hidden /></span>
              <span><span className="block text-xs text-mist-500">Phone</span><span className="text-sm text-mist-100">{site.phone}</span></span>
            </a>}
            {C.showLocation && <div className="glass flex items-center gap-4 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-mist-300"><MapPin className="h-5 w-5" aria-hidden /></span>
              <span><span className="block text-xs text-mist-500">Based in</span><span className="text-sm text-mist-100">{site.location}</span></span>
            </div>}
          </div>
        </div>
        {C.showForm && <Reveal delay={0.1}><ContactForm /></Reveal>}
      </div>
      {C.showConnect && <div className="container-x relative"><ConnectStrip info={site} /></div>}
    </section>
  );
}
