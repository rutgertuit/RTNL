import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rutgertuit.nl"),
  title: {
    default: "Rutger Tuit — Notes from the seam",
    template: "%s — Rutger Tuit",
  },
  description:
    "Notes from the seam where high-performance technology meets human creativity — by Rutger Tuit, a business leader, currently in marketing and media (Director, Specialists & Partners, Google Benelux; Head of YouTube). A personal site; the views here are his own.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: ["nl_NL"],
    url: "https://rutgertuit.nl",
    siteName: "Rutger Tuit",
    title: "Rutger Tuit — Notes from the seam",
    description:
      "Notes from the seam where high-performance technology meets human creativity — a personal site by Rutger Tuit. The views here are his own.",
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
 * crawlers ingest Rutger's identity, role, and key ideas (the four-surface YouTube
 * framing, the jazz-swing picture) plus the canonical link graph (LinkedIn, YouTube,
 * GitHub) without JavaScript.
 *
 * Keep it modest and factual — no role/scope inflation, and no "AI thought leader" /
 * "guru" / "fast learner" language anywhere in this LD.
 */
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://rutgertuit.nl/#person",
  name: "Rutger Tuit",
  jobTitle: "Director, Specialists & Partners (Google Benelux); Head of YouTube",
  worksFor: {
    "@type": "Organization",
    name: "Google",
  },
  url: "https://rutgertuit.nl",
  image: "https://rutgertuit.nl/assets/portraits/01-studio.png",
  description:
    "Rutger Tuit is a business leader who works where high-performance technology meets human creativity, looking for the strategic reasons behind the technical detail. He picks up a new field quickly enough to see where it's about to collide with the next one, and helps leaders get ahead of it. Currently Director, Specialists & Partners at Google Benelux and Head of YouTube, on Google's Northern European Sales Leadership Team. He describes YouTube as tv, social, search and shopping in one, and talks about AI with a 'jazz swing' picture — the machine keeps the beat, people bring the swing. Written in a personal capacity.",
  knowsAbout: [
    "Leadership through AI disruption",
    "High-trust organizational design",
    "Change leadership",
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
    "Notes from the seam where high-performance technology meets human creativity — a personal site by Rutger Tuit.",
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
