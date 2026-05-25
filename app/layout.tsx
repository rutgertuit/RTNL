import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rutgertuit.nl"),
  title: {
    default: "Rutger Tuit — Notes from the seam",
    template: "%s — Rutger Tuit",
  },
  description:
    "Senior brand and AI leadership at the seam between high-performance corporate tech and human creativity. Written from inside Google, YouTube, and a homelab.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: ["nl_NL"],
    url: "https://rutgertuit.nl",
    siteName: "Rutger Tuit",
    title: "Rutger Tuit — Notes from the seam",
    description:
      "Senior brand and AI leadership at the seam between high-performance corporate tech and human creativity.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@rutgertuit",
  },
  robots: { index: true, follow: true },
};

/**
 * Schema.org JSON-LD — Person + ProfilePage.
 *
 * This is the GEO/LLM half of the dual-audience principle from CLAUDE.md:
 * crawlers ingest Rutger's identity, role, frameworks (Tuit Doctrine, Jazz Swing),
 * and the canonical link graph (LinkedIn, YouTube, GitHub) without JavaScript.
 *
 * Per the brand voice anti-voice: NO "AI thought leader" / "guru" / "fast learner"
 * language anywhere in this LD.
 */
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://rutgertuit.nl/#person",
  name: "Rutger Tuit",
  alternateName: "The Conductor of Change",
  jobTitle: "Senior brand and AI leader",
  worksFor: {
    "@type": "Organization",
    name: "Google",
  },
  url: "https://rutgertuit.nl",
  image: "https://rutgertuit.nl/assets/portraits/01-studio.png",
  description:
    "Senior brand and AI leader at Google, working at the seam between high-performance enterprise technology and human creativity. Architect of the 'Tuit Doctrine' (YouTube is tv, social, search and shopping) and the 'Jazz Swing' metaphor for human creativity in an AI-accelerated ecosystem.",
  knowsAbout: [
    "Marketing AI",
    "Generative AI in advertising",
    "YouTube creator economy",
    "Generative Engine Optimization",
    "Multi-agent orchestration",
    "Brand strategy",
    "Creative technology",
    "Data activation",
  ],
  sameAs: [
    "https://www.linkedin.com/in/rutgertuit/",
    "https://www.youtube.com/rutgertuit",
    "https://github.com/rutgertuit/",
    "https://www.instagram.com/rutgertuit/",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Amsterdam",
    addressRegion: "Noord-Holland",
    addressCountry: "NL",
  },
};

const profilePageLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://rutgertuit.nl/#profile",
  url: "https://rutgertuit.nl",
  name: "Rutger Tuit — Notes from the seam",
  description:
    "Senior brand and AI leadership at the seam between high-performance corporate tech and human creativity.",
  inLanguage: "en",
  mainEntity: { "@id": "https://rutgertuit.nl/#person" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageLd) }}
        />
      </head>
      <body>
        <a href="#main" className="rt-skip-link">
          Skip to content
        </a>
        <div className="rt-grain" aria-hidden="true">
          <div className="rt-grain__layer"></div>
          <div className="rt-grain__layer rt-grain__layer--drift"></div>
        </div>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
