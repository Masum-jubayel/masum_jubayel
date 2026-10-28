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

const baseMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.title}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  keywords: ["Network Administrator", "IT Support", "Cisco CCNA", "Network Infrastructure", "Structured Cabling", "Cybersecurity", "Computer Security", "Digital Forensics", "Grande Prairie", "Alberta"],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.title}`,
    description: site.description,
    url: "/",
    locale: "en_CA",
  },
  twitter: { card: "summary_large_image", title: `${site.name} — ${site.title}`, description: site.description },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

/** Search description and keywords can be overridden in Admin → Site controls. */
export async function generateMetadata(): Promise<Metadata> {
  const { layout } = await getContent();
  const description = layout.seoDescription.trim() || site.description;
  return {
    ...baseMetadata,
    description,
    ...(layout.seoKeywords.length ? { keywords: layout.seoKeywords } : {}),
    openGraph: { ...baseMetadata.openGraph, description },
    twitter: { ...baseMetadata.twitter, description },
  };
}

export const viewport: Viewport = { themeColor: "#04070f", colorScheme: "dark" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.title,
  url: site.url,
  alumniOf: ["Fairleigh Dickinson University", "Metropolitan University"],
  knowsAbout: ["Computer networking", "Cisco routing and switching", "IT infrastructure", "Cybersecurity"],
  sameAs: [site.contact.linkedin, site.contact.github].filter(Boolean),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { layout } = await getContent();
  return (
    <html lang="en" id="top">
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
