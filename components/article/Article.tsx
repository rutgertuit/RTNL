import type { ReactNode } from "react";
import Link from "next/link";

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
}

export function Article({
  number,
  filedUnder,
  title,
  readTime,
  publishedLabel,
  stages,
  intro,
}: ArticleProps) {
  return (
    <article className="rt-tuit section section--surface">
      <div className="container">
        <div className="rt-tuit__head">
          <div className="eyebrow eyebrow--warm">
            ARTICLE · {number} · BUSINESS &amp; LEADERSHIP
          </div>
          <h1 className="rt-tuit__title">{title}</h1>
          <div className="rt-tuit__meta">
            <span>{readTime.toUpperCase()}</span>
            <span>·</span>
            <span>PUBLISHED {publishedLabel.toUpperCase()}</span>
            <span>·</span>
            <span>FILED UNDER {filedUnder.toUpperCase()}</span>
          </div>
        </div>

        {intro && <div className="rt-tuit__intro">{intro}</div>}

        {stages.map((stage) => (
          <div className="rt-tuit__stage" key={stage.num}>
            <div className="rt-tuit__stage-marker">
              <span className="rt-tuit__stage-num">{stage.num}</span>
              <span className="rt-tuit__stage-label">{stage.label}</span>
            </div>
            <div className="rt-tuit__stage-body">{stage.children}</div>
          </div>
        ))}

        <nav className="rt-tuit__nav" aria-label="Article navigation">
          <Link className="button" href="/#business">
            <span aria-hidden>←</span> Back to all articles
          </Link>
          <a className="button button--warm" href="mailto:rutger@rutgertuit.nl">
            Tell me what you&apos;re building <span aria-hidden>→</span>
          </a>
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
