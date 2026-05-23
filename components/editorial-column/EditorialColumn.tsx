"use client";

import { useEffect, useState } from "react";

const ARTICLES = [
  {
    n: "01",
    slug: "equal-opportunity",
    title: "Equal opportunity for agents.",
    lead:
      "Briefing an AI agent looks more like briefing a junior teammate than typing a prompt. Most of the AI underperformance I see in marketing teams traces back to that single mismatch — and most of the fixes are managerial, not technical.",
    tag: "AI TRANSFORMATION",
    read: "11 min",
    photo: "03-marketing-live",
    photoCap: "GOOGLE MARKETING LIVE · 2024",
  },
  {
    n: "02",
    slug: "beyond-clean",
    title: "Beyond clean, toward activated.",
    lead:
      "Clean data is old-news ambition. The harder question is whether the data actually changes a decision before the meeting ends — and where in the organisation that decision gets made. Notes from inside the room.",
    tag: "DATA · ENTERPRISE",
    read: "14 min",
    photo: "04-think-2025",
    photoCap: "THINK 2025 · GOOGLE · AMSTERDAM",
  },
  {
    n: "03",
    slug: "llms-listening",
    title: "LLMs are listening.",
    lead:
      "Search is becoming a smaller part of how your brand gets discovered. The bigger question is what models are quietly learning about you while nobody is looking — and what you can actually do about it without rewriting the whole web.",
    tag: "GEO · DISCOVERY",
    read: "17 min",
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
          <h2 className="rt-editorial__title">
            Three pieces I keep coming back to <em>in the actual work.</em>
          </h2>
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
            <a href="#" className="rt-editorial__sidebar-link">
              24 conversations · 2018 → 2026 →
            </a>
            <hr />
            <div className="rt-editorial__sidebar-label">READING TIME</div>
            <a href="#" className="rt-editorial__sidebar-link">
              ~42 min total · espresso to lunch break
            </a>
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
