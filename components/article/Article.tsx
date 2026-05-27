import type { ReactNode } from "react";
import Link from "next/link";
import { PodcastInlineButton } from "./PodcastInlineButton";
import { ArticleSources, type ArticleSource } from "./ArticleSources";

/**
 * Reusable Article layout — renders the Tuit Post 4-stage structure
 * (Anecdotal Hook → Conceptual Swing → Framework Solution → Invitation).
 *
 * Used by every per-route article under /business/*. Server component.
 */

export interface ArticleStage {
  num: string; // "01" | "02" | "03" | "04"
  label: string; // "Anecdotal hook" | "Conceptual swing" | etc.
  children: ReactNode;
  /**
   * Optional 9:16 illustration that sits beside the stage body. Renders on
   * alternating sides per stage (odd nums right, even nums left) so the page
   * reads with editorial rhythm. The asset is expected to be a dark, edge-
   * fading 9:16 render — see drop/article-image-prompts.md for the locked
   * visual vocabulary.
   */
  image?: { src: string; alt: string };
}

export interface ArticleProps {
  number: string; // "01 / 03"
  filedUnder: string; // "AI TRANSFORMATION"
  title: string; // "Equal opportunity for agents."
  readTime: string; // "11 min read"
  publishedLabel: string; // "May 2026"
  stages: ArticleStage[];
  /**
   * Optional content slot rendered between the article head and stage 01.
   * Used for things like the podcast player + "how this was made" essay
   * on Multiplier Myth. Inherits the article container width.
   */
  intro?: ReactNode;
  /**
   * When set, render an inline "Listen to podcast version" CTA in the
   * header meta line. The sticky PodcastTab must also be rendered by the
   * page (the inline button dispatches an event the tab listens for).
   */
  podcast?: { label?: string };
  /**
   * When set, render an inline link to a companion interactive (e.g. the
   * Agent Inclusive Sim). Lives in the header meta line, same row as the
   * read-time and filed-under spans.
   */
  game?: { href: string; label: string };
  /**
   * Section label rendered in the top eyebrow. Defaults to
   * "BUSINESS & LEADERSHIP" to match the three original vision pieces.
   * Pass e.g. "CREATIVE" for articles that live under /creative/.
   */
  section?: string;
  /**
   * Numbered list of sources / methodology notes rendered below the
   * last stage. Encourages every numerical or research-attributed claim
   * in the article to have a visible audit trail.
   */
  sources?: ArticleSource[];
  /** Optional intro line above the sources list. */
  sourcesIntro?: ReactNode;
}

export function Article({
  number,
  filedUnder,
  title,
  readTime,
  publishedLabel,
  stages,
  intro,
  podcast,
  game,
  section = "BUSINESS & LEADERSHIP",
  sources,
  sourcesIntro,
}: ArticleProps) {
  return (
    <article className="rt-tuit section section--surface">
      <div className="container">
        <div className="rt-tuit__head">
          <div className="eyebrow eyebrow--warm">
            ARTICLE · {number} · {section}
          </div>
          <h1 className="rt-tuit__title">{title}</h1>
          <div className="rt-tuit__meta">
            <span>{readTime.toUpperCase()}</span>
            <span>·</span>
            <span>PUBLISHED {publishedLabel.toUpperCase()}</span>
            <span>·</span>
            <span>FILED UNDER {filedUnder.toUpperCase()}</span>
            {podcast && <PodcastInlineButton label={podcast.label} />}
            {game && (
              <Link
                href={game.href}
                className="rt-tuit__meta-action rt-tuit__meta-action--warm"
              >
                <span className="rt-tuit__meta-action-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path
                      d="M6 4l14 8-14 8V4z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                {game.label}
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>

        {intro && <div className="rt-tuit__intro">{intro}</div>}

        {stages.map((stage, i) => {
          const hasImage = Boolean(stage.image);
          const imageSide: "left" | "right" = i % 2 === 0 ? "right" : "left";
          return (
            <div
              className={`rt-tuit__stage ${
                hasImage ? `rt-tuit__stage--with-image rt-tuit__stage--image-${imageSide}` : ""
              }`}
              key={stage.num}
            >
              <h2 className="rt-tuit__stage-marker">
                <span className="rt-tuit__stage-num">{stage.num}</span>
                <span className="rt-tuit__stage-label">{stage.label}</span>
              </h2>
              <div className="rt-tuit__stage-body">{stage.children}</div>
              {stage.image && (
                <figure className="rt-tuit__stage-image" aria-hidden="false">
                  {/* Static JPEG — explicit width/height + sizes keep CLS at zero.
                      Using <img> with eslint disable rather than next/image because
                      these 9:16 renders are already optimised JPEGs that don't need
                      AVIF/WebP transcoding (they were generated as a one-time set). */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stage.image.src}
                    alt={stage.image.alt}
                    width={720}
                    height={1280}
                    loading="lazy"
                  />
                </figure>
              )}
            </div>
          );
        })}

        {sources && sources.length > 0 && (
          <ArticleSources sources={sources} intro={sourcesIntro} />
        )}

        <nav className="rt-tuit__nav" aria-label="Article navigation">
          <Link className="button" href="/business">
            <span aria-hidden>←</span> Back to all articles
          </Link>
          <Link className="button button--warm" href="/contact">
            Tell me what you&apos;re building <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}

/**
 * Schema.org Article JSON-LD generator — call once per article page.
 * Returns the LD object; the page is responsible for wrapping it in a
 * <script type="application/ld+json">.
 */
export function buildArticleLd(opts: {
  slug: string;
  title: string;
  description: string;
  datePublished: string; // ISO date
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `https://rutgertuit.nl/business/${opts.slug}#article`,
    headline: opts.title,
    description: opts.description,
    author: { "@id": "https://rutgertuit.nl/#person" },
    publisher: { "@id": "https://rutgertuit.nl/#person" },
    datePublished: opts.datePublished,
    inLanguage: "en",
    image: opts.image ?? "https://rutgertuit.nl/assets/portraits/01-studio.png",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://rutgertuit.nl/business/${opts.slug}`,
    },
  };
}
