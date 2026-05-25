"use client";

import { useEffect, useState } from "react";

const ARTICLES = [
  {
    n: "01",
    slug: "multiplier-myth",
    title: "The Multiplier Myth.",
    lead:
      "Senior leaders are treating the biggest civilisational multiplier we have ever built as a tool for chopping margin. The ATM, the spreadsheet, and a 2026 PwC study all tell the same story: history punishes the cost-cutters. Notes on the inversion — and the boardroom move that follows.",
    tag: "AI · LEADERSHIP",
    read: "13 min",
    photo: "03-marketing-live",
    photoCap: "GOOGLE MARKETING LIVE · 2024",
  },
  {
    n: "02",
    slug: "thirty-minute-kitchen",
    title: "The 30-Minute Kitchen.",
    lead:
      "When marketing numbers wobble, the corporate reflex is to tear down the kitchen — new agency, new stack, new eighteen-month RFP. The empirical data says that is the most expensive mistake in the playbook. Notes on the three variables you actually need to tune.",
    tag: "MARKETING · OPERATIONS",
    read: "12 min",
    photo: "04-think-2025",
    photoCap: "THINK 2025 · GOOGLE · AMSTERDAM",
  },
  {
    n: "03",
    slug: "agent-inclusive",
    title: "Agent Inclusive.",
    lead:
      "Org change runs at twelve to eighteen months. The model that lands in production next quarter is six weeks away. You cannot wait for the reorg to finish before integrating AI — you have to build the team so an agentic teammate can sit down on day one. Notes on what that actually looks like.",
    tag: "LEADERSHIP · ORG DESIGN",
    read: "13 min",
    photo: "02-esns",
    photoCap: "ESNS PANEL · GRONINGEN · 2025",
  },
];

export function EditorialColumn() {
  const [activeN, setActiveN] = useState("01");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const targets = ARTICLES.map((a) => document.getElementById(`article-${a.n}`)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (targets.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const v = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (v[0]) {
          const id = v[0].target.id.replace("article-", "");
          setActiveN(id);
        }
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.1, 0.4] }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <section className="rt-editorial section" id="business">
      <div className="container">
        <header className="rt-editorial__head">
          <div className="eyebrow eyebrow--warm">01 · BUSINESS &amp; LEADERSHIP</div>
          <div className="rt-editorial__head-body">
            <h2 className="rt-editorial__title">
              Three pieces from <em>the day side of the desk.</em>
            </h2>
            <p className="rt-editorial__lead">
              The ones I keep returning to in actual rooms with actual P&amp;Ls — written for the
              Dutch CMO or CEO who has thirteen minutes and a real question.
            </p>
          </div>
        </header>

        <div className="rt-editorial__rail">
          <span>03 ANCHOR PIECES · 24 INTERVIEW INDEX · 2018 → 2026</span>
          <span>FILED UNDER · AI TRANSFORMATION · DATA · GEO</span>
        </div>

        <div className="rt-editorial__grid">
          <aside className="rt-editorial__sidebar">
            <div className="rt-editorial__sidebar-label">ON THIS PAGE</div>
            <ul>
              {ARTICLES.map((a) => (
                <li key={a.n} className={a.n === activeN ? "is-active" : ""}>
                  <a href={`/business/${a.slug}`}>
                    <span className="rt-editorial__num">{a.n}</span>
                    <span>{a.title}</span>
                  </a>
                </li>
              ))}
            </ul>
            <hr />
            <div className="rt-editorial__sidebar-label">INTERVIEW INDEX</div>
            <a href="/press" className="rt-editorial__sidebar-link">
              24 conversations · 2021 → 2025 →
            </a>
            <hr />
            <div className="rt-editorial__sidebar-label">READING TIME</div>
            <span className="rt-editorial__sidebar-link">
              ~42 min total · espresso to lunch break
            </span>
          </aside>

          <div className="rt-editorial__list">
            {ARTICLES.map((a) => (
              <article id={`article-${a.n}`} key={a.n} className="rt-editorial__article">
                <figure className="rt-editorial__article-photo">
                  <img src={`/assets/events/${a.photo}.png`} alt="" />
                  <figcaption className="rt-editorial__article-photo-cap">
                    {a.photoCap}
                  </figcaption>
                </figure>
                <div className="rt-editorial__article-meta">
                  <span className="rt-editorial__article-num">{a.n}</span>
                  <span className="eyebrow">{a.tag}</span>
                  <span className="eyebrow" style={{ color: "var(--color-fg-3)" }}>
                    {a.read}
                  </span>
                </div>
                <h3 className="rt-editorial__article-title">{a.title}</h3>
                <p className="rt-editorial__article-lead">{a.lead}</p>
                <a className="button" href={`/business/${a.slug}`}>
                  Read the full piece <span aria-hidden>→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
