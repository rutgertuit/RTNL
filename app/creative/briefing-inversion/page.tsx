import type { Metadata } from "next";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { BriefingInversionClient } from "./BriefingInversionClient";

const TITLE = "The Briefing Inversion";
const DESCRIPTION =
  "The same eight-second clip, four Veo generations apart. The output got better. The brief got shorter. Notes on the architectural shift from cascaded pipelines to unified Gemini Omni — and why the contract between director and renderer is flipping.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — Rutger Tuit`,
    description: DESCRIPTION,
    type: "article",
    url: "https://rutgertuit.nl/creative/briefing-inversion",
  },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  author: {
    "@type": "Person",
    name: "Rutger Tuit",
    url: "https://rutgertuit.nl",
  },
  datePublished: "2026-05-25",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://rutgertuit.nl/creative/briefing-inversion",
  },
};

export default function BriefingInversionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <Nav />
      <BriefingInversionClient />
      <Footer />
      <AppChrome />
    </>
  );
}
