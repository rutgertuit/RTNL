import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { PodcastPlayer } from "@/components/podcast-player/PodcastPlayer";

const TITLE = "The Panel";
const DESCRIPTION =
  "Off the record: five invented guests go through the file on Rutger — the press, the bios, the site — while he's out of the room.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Easter egg — reachable via a footer link, kept out of search + nav.
  robots: { index: false, follow: false },
};

export default function ThePanelPage() {
  return (
    <>
      <Nav />
      <article className="rt-tuit section section--surface">
        <div className="container">
          <div className="rt-tuit__head">
            <div className="eyebrow eyebrow--warm">EASTER EGG · OFF THE RECORD</div>
            <h1 className="rt-tuit__title">The file on Rutger.</h1>
            <p className="rt-tuit__lead">
              Five of the invented guests from around this site &mdash; Frits and the Oracle
              from the Snoek &amp; Partners game, the creative Dinosaur, Angela from the Agent
              Inclusive sim, and Marie &mdash; were handed the same folder (the press page, the
              three bios, the articles, the games) and asked to react. The host was deliberately
              left out of the room. He prompted all of them into existence, so it is, in a
              sense, his own creations sitting in judgment.
            </p>
          </div>

          <PodcastPlayer
            src="/audio/podcasts/about-rutger/ep01.mp3"
            title="The file on Rutger — a panel, no host."
            eyebrow="EP 06 · ~6 MIN · GUESTS ONLY · SYNTHETIC AI VOICES"
            subtitle="Voices are synthetic; no real person was cloned. Like everything else here: prompted, then chosen."
            duration="5:48"
          />

          <p className="rt-tuit__lead" style={{ marginTop: "var(--space-6)" }}>
            <Link href="/">&larr; back to the front</Link>
          </p>
        </div>
      </article>
      <Footer />
      <AppChrome />
    </>
  );
}
