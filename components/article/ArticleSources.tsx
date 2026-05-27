import type { ReactNode } from "react";

/**
 * Per-article sources & methodology block. Renders at the bottom of an
 * article (below the last stage) so numerical claims and research citations
 * have a visible audit trail.
 *
 * Two entry shapes:
 *  - `{ claim, citation }` — quoted claim + linked source.
 *  - `{ note }` — methodology note (e.g. "from operator conversations").
 */
export interface ArticleSource {
  /** Number/label shown in the gutter, e.g. "1", "2", "i". Optional — defaults
   *  to the array index + 1. */
  marker?: string;
  /** The claim being sourced, in author voice. Optional for pure
   *  methodology notes. */
  claim?: ReactNode;
  /** Citation body. Plain text or JSX with anchor tags. */
  citation?: ReactNode;
  /** Free-form methodology note. Renders instead of (or alongside) a
   *  formal citation. */
  note?: ReactNode;
}

interface ArticleSourcesProps {
  sources: ArticleSource[];
  /** Optional intro line above the list. */
  intro?: ReactNode;
}

export function ArticleSources({ sources, intro }: ArticleSourcesProps) {
  if (sources.length === 0) return null;
  return (
    <section
      className="rt-article-sources"
      aria-labelledby="article-sources-title"
    >
      <div className="eyebrow eyebrow--warm">SOURCES &amp; METHODOLOGY</div>
      <h2 id="article-sources-title">Where the numbers came from.</h2>
      {intro && <p className="rt-article-sources__intro">{intro}</p>}
      <ol className="rt-article-sources__list">
        {sources.map((s, i) => (
          <li key={i} className="rt-article-sources__item">
            <span className="rt-article-sources__marker" aria-hidden>
              {s.marker ?? i + 1}
            </span>
            <div className="rt-article-sources__body">
              {s.claim && (
                <p className="rt-article-sources__claim">{s.claim}</p>
              )}
              {s.citation && (
                <p className="rt-article-sources__cite">{s.citation}</p>
              )}
              {s.note && (
                <p className="rt-article-sources__note">
                  <em>{s.note}</em>
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="rt-article-sources__foot">
        If any claim here is mis-cited or out of date, mail me at{" "}
        <a href="/contact">rt.nl/contact</a> and I&apos;ll fix or retract.
      </p>
    </section>
  );
}
