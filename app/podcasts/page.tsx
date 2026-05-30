import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { PodcastPlayer } from "@/components/podcast-player/PodcastPlayer";
import podcastsIndex from "@/scripts/podcasts/podcasts-index.json";
import weeklyIndex from "@/scripts/podcasts/weekly-index.json";

interface Backlink { href: string; label: string }
interface Episode {
  slug: string;
  title: string;
  summary: string;
  cast: string[];
  duration: string;
  src: string;
  backlink?: Backlink;
  /** Optional ISO date — Weekly episodes carry one; article companions don't. */
  date?: string;
  /** Internal grouping for display. */
  group: "weekly" | "articles" | "specials";
}

const TITLE = "Podcasts";
const DESCRIPTION =
  "Every podcast on rutgertuit.nl — the recurring weekly conversation about public Google / AI news, one companion episode per long-form article, and the off-format specials. All voices are synthetic; personal views, not Google's.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  robots: { index: true, follow: true },
};

// Merge the two registries into one typed list.
const weekly: Episode[] = (weeklyIndex.episodes as Array<Omit<Episode, "group">>).map((e) => ({
  ...e,
  group: "weekly",
}));
const others: Episode[] = (podcastsIndex.episodes as Array<Omit<Episode, "group"> & { group: "articles" | "specials" }>);

const groupsMeta = podcastsIndex.groups as Array<{ id: "articles" | "specials"; name: string; blurb: string }>;
const groupBlurb = (id: Episode["group"]): string => {
  if (id === "weekly") return weeklyIndex.series.description;
  return groupsMeta.find((g) => g.id === id)?.blurb ?? "";
};
const groupName = (id: Episode["group"]): string => {
  if (id === "weekly") return "Weekly";
  return groupsMeta.find((g) => g.id === id)?.name ?? id;
};

const all: Episode[] = [...weekly, ...others];

// PodcastSeries JSON-LD — one umbrella series covering the whole corpus.
const ld = {
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  "@id": "https://rutgertuit.nl/podcasts#series",
  name: "rutgertuit.nl podcasts",
  description: DESCRIPTION,
  url: "https://rutgertuit.nl/podcasts",
  inLanguage: "en",
  author: { "@id": "https://rutgertuit.nl/#person" },
  episode: all.map((ep) => ({
    "@type": "PodcastEpisode",
    name: ep.title,
    description: ep.summary,
    url: `https://rutgertuit.nl/podcasts#${ep.slug}`,
    ...(ep.date ? { datePublished: ep.date } : {}),
    associatedMedia: {
      "@type": "MediaObject",
      contentUrl: `https://rutgertuit.nl${ep.src}`,
      encodingFormat: "audio/mpeg",
    },
  })),
};

export default function PodcastsPage() {
  const order: Episode["group"][] = ["weekly", "articles", "specials"];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb trail={[
        { label: "Home", href: "/" },
        { label: "Podcasts" },
      ]} />
      <article className="rt-tuit section section--surface">
        <div className="container">
          <div className="rt-tuit__head">
            <div className="eyebrow eyebrow--warm">PODCASTS · SYNTHETIC AI VOICES</div>
            <h1 className="rt-tuit__title">Every podcast on this site.</h1>
            <p className="rt-tuit__lead">
              {DESCRIPTION} Each episode is reachable in context on the page it was made
              for; this is the umbrella view. Personal views, not Google&apos;s. The
              site-wide disclaimer in the footer governs every episode.
            </p>
          </div>

          {order.map((groupId) => {
            const items = all.filter((e) => e.group === groupId);
            if (items.length === 0) return null;
            return (
              <section
                key={groupId}
                id={groupId}
                aria-labelledby={`${groupId}-title`}
                style={{ marginTop: "var(--space-7)" }}
              >
                <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
                  {groupName(groupId).toUpperCase()}
                </div>
                <h2 id={`${groupId}-title`} className="rt-tuit__stage-label" style={{ marginBottom: "var(--space-3)" }}>
                  {groupBlurb(groupId)}
                </h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {items.map((ep) => (
                    <li key={ep.slug} id={ep.slug} style={{ marginBottom: "var(--space-6)" }}>
                      <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
                        {ep.date ? formatDate(ep.date) + " · " : ""}
                        {ep.cast.join(" · ")}
                      </div>
                      <h3 style={{ margin: "0 0 var(--space-2)" }}>{ep.title}</h3>
                      <p style={{ margin: "0 0 var(--space-3)" }}>{ep.summary}</p>
                      <PodcastPlayer
                        src={ep.src}
                        title={ep.title}
                        eyebrow={`${ep.duration} · ${ep.cast.join(" · ")} · SYNTHETIC AI VOICES`}
                        duration={ep.duration}
                      />
                      {ep.backlink && (
                        <p style={{ marginTop: "var(--space-3)", fontSize: "var(--fs-50)", color: "var(--color-fg-3)" }}>
                          On this site: <Link href={ep.backlink.href}>{ep.backlink.label}</Link>.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
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
