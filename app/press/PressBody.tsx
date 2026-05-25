"use client";

import { useState } from "react";
import Link from "next/link";

const FORMATS = ["all", "articles", "podcasts", "video", "speaking"] as const;
type Format = (typeof FORMATS)[number];

export interface PressItem {
  n: string;
  title: string;
  publication: string;
  date: string;
  description: string;
  url: string;
}

export interface PullQuote {
  publication: string;
  quote: string;
  url: string;
}

interface PressBodyProps {
  articles: PressItem[];
  podcasts: PressItem[];
  video: PressItem[];
  speaking: PressItem[];
  pullQuotes: PullQuote[];
  totalCount: number;
}

function Section({
  num,
  label,
  items,
}: {
  num: string;
  label: string;
  items: PressItem[];
}) {
  return (
    <div className="rt-press__section">
      <div className="rt-press__section-head">
        <span className="rt-press__section-num">{num}</span>
        <h2 className="rt-press__section-label">{label}</h2>
        <span className="rt-press__section-count">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      <ol className="rt-press__list">
        {items.map((item) => (
          <li key={item.n} className="rt-press__item">
            <div className="rt-press__item-num">{item.n}</div>
            <div className="rt-press__item-body">
              <div className="rt-press__item-meta">
                <span className="rt-press__item-pub">{item.publication}</span>
                <span className="rt-press__item-sep" aria-hidden>·</span>
                <span className="rt-press__item-date">{item.date}</span>
              </div>
              <h3 className="rt-press__item-title">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}{" "}
                  <span className="rt-press__item-arrow" aria-hidden>↗</span>
                </a>
              </h3>
              <p className="rt-press__item-desc">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PressBody({
  articles,
  podcasts,
  video,
  speaking,
  pullQuotes,
  totalCount,
}: PressBodyProps) {
  const [filter, setFilter] = useState<Format>("all");

  const show = (group: Format) => filter === "all" || filter === group;

  return (
    <article className="rt-press section section--surface">
      <div className="container">
        <div className="rt-press__head">
          <div className="eyebrow eyebrow--warm">PRESS · INTERVIEWS · 2021 → 2025</div>
          <h1 className="rt-press__title">
            Twenty-four conversations <em>between 2021 and 2025.</em>
          </h1>
          <p className="rt-press__lead">
            Articles, written interviews, podcasts, video panels and speaking engagements with or
            about me — mostly in the Dutch trade press, plus a handful of Think with Google
            pieces and international event coverage. Grouped by format, ordered roughly by
            recency within each group.
          </p>
          <div className="rt-press__meta">
            <span>{totalCount} ENTRIES</span>
            <span>·</span>
            <span>
              {articles.length} ARTICLES · {podcasts.length} PODCASTS · {video.length} VIDEO ·{" "}
              {speaking.length} SPEAKING
            </span>
            <span>·</span>
            <span>FILED UNDER PRESS</span>
          </div>
        </div>

        {/* Pull quotes */}
        <div className="rt-press__quotes">
          {pullQuotes.map((q) => (
            <figure key={q.publication} className="rt-press__quote">
              <blockquote>
                <p>&ldquo;{q.quote}&rdquo;</p>
              </blockquote>
              <figcaption>
                <a href={q.url} target="_blank" rel="noopener noreferrer">
                  — {q.publication} <span aria-hidden>↗</span>
                </a>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Filter chips */}
        <div className="rt-press__filter" role="tablist" aria-label="Filter by format">
          {FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className={filter === f ? "is-active" : ""}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f[0]!.toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {show("articles") && (
          <Section num="01" label="Articles and written interviews" items={articles} />
        )}
        {show("podcasts") && (
          <Section num="02" label="Podcast interviews" items={podcasts} />
        )}
        {show("video") && (
          <Section num="03" label="Video interviews and panels" items={video} />
        )}
        {show("speaking") && (
          <Section num="04" label="Speaking engagements and events" items={speaking} />
        )}

        <nav className="rt-press__nav" aria-label="Press navigation">
          <Link className="button" href="/">
            <span aria-hidden>←</span> Back to the site
          </Link>
          <Link className="button button--warm" href="/contact">
            Press enquiries <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
