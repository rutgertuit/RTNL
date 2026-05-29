import type { Metadata } from "next";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { BriefingInversionClient } from "./BriefingInversionClient";
import { PodcastTab } from "@/components/podcast-player/PodcastTab";

const TITLE = "The Evolution of Video Models";
const DESCRIPTION =
  "The same eight-second clip, four Veo generations apart. The output got better. The brief got shorter. Notes on the architectural shift from cascaded pipelines to unified Gemini Omni — and why the contract between director and renderer is flipping.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — Rutger Tuit`,
    description: DESCRIPTION,
    type: "article",
    url: "https://rutgertuit.nl/creative/video-models",
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
    "@id": "https://rutgertuit.nl/creative/video-models",
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
      <PodcastTab
        src="/audio/podcasts/creative-video-models/ep01.mp3"
        title="Veo, threshold-crossed — with Dino."
        eyebrow="~6 MIN · SYNTHETIC AI VOICES"
        subtitle="The Creative Dinosaur lit a Volvo commercial in 1996 with six tungstens. He has feelings about generative video. Voices are synthetic; no real person was cloned."
        duration="6:00"
        tabLabel="LISTEN · 6:00"
      >
        <h3 className="rt-podcast-tab__essay-title">How this was made</h3>
        <p>
          Same pipeline as the rest of the show &mdash; article first, then
          a language model drafted the dialog, then ElevenLabs rendered each
          line with a synthetic voice. The other side of the table is the
          Creative Dinosaur, who also runs the Snoek &amp; Partners game on
          the creative section of this site.
        </p>
      </PodcastTab>
      <BriefingInversionClient />
      <Footer />
      <AppChrome />
    </>
  );
}
