import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { PodcastPlayer } from "@/components/podcast-player/PodcastPlayer";
import weeklyIndex from "@/scripts/podcasts/weekly-index.json";

interface Backlink {
  href: string;
  label: string;
}
interface WeeklyEpisode {
  slug: string;
  title: string;
  date: string;
  duration: string;
  cast: string[];
  summary: string;
  src: string;
  backlink?: Backlink;
}

const TITLE = "Weekly";
const DESCRIPTION =
  "A weekly conversation between Rutger Tuit and two rotating guest characters about the week's most consequential Google / AI development.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  robots: { index: true, follow: true },
};

const series = weeklyIndex.series;
const episodes = weeklyIndex.episodes as WeeklyEpisode[];
const latest: WeeklyEpisode | undefined = episodes[0];
const back: WeeklyEpisode[] = episodes.slice(1);

const ld = {
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  "@id": "https://rutgertuit.nl/weekly#series",
  name: series.name,
  description: series.description,
  url: "https://rutgertuit.nl/weekly",
  inLanguage: "en",
  author: { "@id": "https://rutgertuit.nl/#person" },
  episode: episodes.map((ep) => ({
    "@type": "PodcastEpisode",
    name: ep.title,
    datePublished: ep.date,
    description: ep.summary,
    url: `https://rutgertuit.nl/weekly#${ep.slug}`,
    associatedMedia: {
      "@type": "MediaObject",
      contentUrl: `https://rutgertuit.nl${ep.src}`,
      encodingFormat: "audio/mpeg",
    },
  })),
};

export default function WeeklyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb trail={[
        { label: "Home", href: "/" },
        { label: "Weekly" },
      ]} />
      <article className="rt-tuit section section--surface">
        <div className="container">
          <div className="rt-tuit__head">
            <div className="eyebrow eyebrow--warm">WEEKLY · SYNTHETIC AI VOICES</div>
            <h1 className="rt-tuit__title">{series.name}.</h1>
            <p className="rt-tuit__lead">
              {series.description} Rutger speaks from the perspective he carries on
              this site and aligns to publicly disclosed Google talking points. Nothing
              here is an official Google position.
            </p>
          </div>

          {latest ? (
            <section id={latest.slug} aria-labelledby={`${latest.slug}-title`}>
              <div className="eyebrow" style={{ marginBottom: "var(--space-3)" }}>
                THIS WEEK &middot; {formatDate(latest.date)}
              </div>
              <h2 id={`${latest.slug}-title`} className="rt-tuit__stage-label">
                {latest.title}
              </h2>
              <p style={{ marginBottom: "var(--space-4)" }}>{latest.summary}</p>
              <PodcastPlayer
                src={latest.src}
                title={latest.title}
                eyebrow={`${latest.duration} · ${latest.cast.join(" · ")} · SYNTHETIC AI VOICES`}
                subtitle="Voices are synthetic; no real person was cloned. Personal views, not Google's."
                duration={latest.duration}
              />
              {latest.backlink && (
                <p style={{ marginTop: "var(--space-4)" }}>
                  Related on this site: <Link href={latest.backlink.href}>{latest.backlink.label}</Link>.
                </p>
              )}
            </section>
          ) : (
            <p>The first episode lands shortly.</p>
          )}

          {back.length > 0 && (
            <section style={{ marginTop: "var(--space-7)" }}>
              <div className="eyebrow">BACK CATALOGUE</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "var(--space-4) 0 0" }}>
                {back.map((ep) => (
                  <li key={ep.slug} id={ep.slug} style={{ marginBottom: "var(--space-5)" }}>
                    <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
                      {formatDate(ep.date)} &middot; {ep.cast.join(" · ")}
                    </div>
                    <h3 style={{ margin: "0 0 var(--space-2)" }}>{ep.title}</h3>
                    <p style={{ margin: "0 0 var(--space-2)" }}>{ep.summary}</p>
                    <PodcastPlayer
                      src={ep.src}
                      title={ep.title}
                      eyebrow={`${ep.duration} · ${ep.cast.join(" · ")} · SYNTHETIC AI VOICES`}
                      duration={ep.duration}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
      <Footer />
      <AppChrome />
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
