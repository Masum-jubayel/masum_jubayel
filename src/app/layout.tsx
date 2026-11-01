import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/kaushan-script";
import "@fontsource/instrument-serif";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";
import { getContent } from "@/lib/content";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { themeInitScript, type ThemeName } from "@/lib/theme";

const baseMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} (Masum Jubayel) — ${site.title} | Portfolio`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  keywords: ["Masum Mohammad Jubayel", "Masum Jubayel", "Jubayel", "Masum Jubayel portfolio", "Network Administrator", "IT Support", "Cisco CCNA", "Network Infrastructure", "Structured Cabling", "Cybersecurity", "Computer Security", "Digital Forensics", "Grande Prairie", "Alberta"],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} (Masum Jubayel) — ${site.title}`,
    description: site.description,
    url: "/",
    locale: "en_CA",
  },
  twitter: { card: "summary_large_image", title: `${site.name} — ${site.title}`, description: site.description },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  // Search Console / Bing ownership: paste the code from the HTML-tag method into Vercel env vars.
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } } : {}),
  },
};

/** Search description and keywords can be overridden in Admin → Site controls. */
export async function generateMetadata(): Promise<Metadata> {
  const { layout } = await getContent();
  const description = layout.seoDescription.trim() || site.description;
  return {
    ...baseMetadata,
    description,
    ...(layout.seoKeywords.length ? { keywords: [...new Set([site.name, site.shortName, ...layout.seoKeywords])] } : {}),
    openGraph: { ...baseMetadata.openGraph, description },
    twitter: { ...baseMetadata.twitter, description },
  };
}

export const viewport: Viewport = { themeColor: "#04070f" };

// Structured data so search engines connect the name, this website and the social profiles as one person.
const sameAs = [site.contact.linkedin, site.contact.github, site.contact.instagram, site.contact.facebook, ...site.contact.other.map((o) => o.href)].filter(Boolean);
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      alternateName: site.alternateNames,
      givenName: "Masum Mohammad",
      familyName: "Jubayel",
      jobTitle: site.title,
      description: site.description,
      url: site.url,
      image: `${site.url}${site.profilePhoto}`,
      email: `mailto:${site.contact.email}`,
      address: { "@type": "PostalAddress", addressLocality: "Grande Prairie", addressRegion: "AB", addressCountry: "CA" },
      worksFor: { "@type": "Organization", name: "Expert Mobile Communications Ltd." },
      alumniOf: [
        { "@type": "CollegeOrUniversity", name: "Fairleigh Dickinson University" },
        { "@type": "CollegeOrUniversity", name: "Metropolitan University" },
      ],
      hasCredential: { "@type": "EducationalOccupationalCredential", name: "Cisco CCNA Routing and Switching" },
      knowsAbout: ["Cybersecurity", "Digital forensics", "Computer networking", "Cisco routing and switching", "Web engineering", "IT infrastructure", "AI agents and automation", "Push-to-talk over cellular (POC) radio"],
      sameAs,
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: `${site.name} — Portfolio`,
      alternateName: ["Masum Jubayel", "Masum Jubayel Portfolio"],
      publisher: { "@id": `${site.url}/#person` },
      inLanguage: "en-CA",
    },
    {
      "@type": "ProfilePage",
      "@id": `${site.url}/#profile`,
      url: site.url,
      name: `${site.name} (Masum Jubayel)`,
      mainEntity: { "@id": `${site.url}/#person` },
      isPartOf: { "@id": `${site.url}/#website` },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { layout } = await getContent();
  return (
    <html lang="en" id="top" data-theme={layout.defaultTheme || "dark"} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript((layout.defaultTheme as ThemeName) || "dark") }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="ambient-orb a" aria-hidden />
        <div className="ambient-orb b" aria-hidden />
        <SiteChrome layout={layout}>
          <Navbar />
          <main id="main" tabIndex={-1} className="outline-none">{children}</main>
          <Footer />
        </SiteChrome>
      </body>
    </html>
  );
}
