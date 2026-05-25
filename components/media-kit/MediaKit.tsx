"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

type BioKey = "short" | "medium" | "long";

const BIOS: Record<BioKey, string> = {
  short:
    'Rutger Tuit is a senior brand and AI leader at Google, working at the seam between high-performance enterprise technology and human creativity. He works with Dutch-market CMOs and agency CEOs on translating macro AI shifts into actionable, organisationally honest strategy. Architect of the "Tuit Doctrine" (YouTube is tv, social, search and shopping) and the "Jazz Swing" metaphor for human creativity in an AI-accelerated ecosystem.',
  medium:
    'Rutger Tuit is a senior brand and AI leader at Google, standing at the intersection of technology, media, and human creativity. As a key member of Google\'s Benelux management team, he holds a dual mandate: commercial growth of YouTube (which he helped build into the leading streaming service in the Benelux) and chief evangelism for Google\'s AI transformation. His effectiveness comes from a 360-degree foundation across brand (KPN), agency (GroupM), ad-tech (Bannerconnect), and platform (Google) — translating fast-moving technical shifts into frameworks that survive contact with a real CFO meeting. He is the architect of the "Tuit Doctrine" (YouTube is tv, social, zoeken en shoppen) and addresses the creative industry\'s anxiety with his "Jazz Swing" metaphor: AI provides the rigid beat, humans provide the creative swing. Outside the executive day-job he is a musician, a homelab tinkerer, and an unapologetically nerdy practitioner of his own subject. The combination is the point.',
  long:
    'Rutger Tuit ("The Conductor of Change") is a Senior Leader, Board Member, and strategic executive at Google, standing at the intersection of technology, media, and human creativity. As a prominent voice in Northern Europe\'s marketing-AI conversation, he shapes the future of digital marketing by guiding Google\'s partners and clients toward an "AI-first" world. His narrative does not begin in a traditional boardroom — it begins at the convergence of a musician\'s soul and a gamer\'s strategic mind. Born to two teachers, education and curiosity were the family trade, but he found his early fluency in the binary world of IT. Introduced to the Commodore 64 and 128 at a young age, he didn\'t just consume technology; he mastered its competitive edge — top-ranking Quake 2 player by 1998, and World of Warcraft guild leader for five years until 2010 — an experience that served as his first lesson in digital community management, remote leadership, and large-scale strategy. While this digital intensity built his technical foundation, his heart initially lay in music. A career in marketing was originally "Plan B" — a pragmatic way to finance his artistic aspirations — until he realised that the mix of technology, creativity and continuous change in marketing mirrored both the improvisation of music and the strategic rigour of competitive gaming. That realisation turned Plan B into the work. The duality forged his core identity as a "trusted translator," bridging the gaps between art and commerce, human creativity and machine intelligence; it lets him de-risk complex technology for the creative industry by framing disruption as a strategic advantage rather than a threat. As a key member of Google\'s Benelux management team, he holds a dual mandate: commercial growth of YouTube (which he helped build into the leading streaming service in the Benelux over his nearly decade-long tenure) and chief evangelism for Google\'s AI transformation as Head of Strategic Partnerships. He is the architect of the "Tuit Doctrine" — the strategic framework built on the mantra "YouTube is tv, social, zoeken en shoppen" — and addresses the creative industry\'s core anxiety with his "Jazz Swing" metaphor: AI provides the rigid beat (data, efficiency, scale), which liberates humans to provide the creative swing (judgement, artistry, and the human factor that makes the difference). His authority on the partner side comes from a 360-degree foundation built deliberately: brand-side at KPN, agency / media-buying at GroupM, ad-tech at Bannerconnect, then Google — guided by his personal rule "in elke rol-switch wil ik circa 20% vernieuwing" (in every role-switch, I want about 20% innovation). He is sought after at major cultural and creative conferences (Amsterdam Dance Event, ESNS) as well as business summits (Marketing Effie Live), is an author for Google\'s "Think with Google" platform, and is an active ecosystem cultivator shaping the next generation of AI-driven marketing tools.',
};

const TOPICS = [
  { name: "The Jazz Swing of AI", tags: ["Keynote", "20–45m"] },
  { name: "YouTube as the Everything Channel", tags: ["Keynote", "30m"] },
  { name: "Generative SEO & the Future of Discovery", tags: ["Talk", "20m"] },
];

const EVENTS: Array<{ id: string; name: string; year: string; alt: string }> = [
  { id: "01-yt-festival", name: "YouTube Festival", year: "2025", alt: "Rutger Tuit speaking at YouTube Festival 2025" },
  { id: "02-esns", name: "ESNS Panel", year: "2025", alt: "Rutger Tuit on stage at ESNS Panel 2025" },
  { id: "03-marketing-live", name: "Google Marketing Live", year: "2024", alt: "Rutger Tuit presenting at Google Marketing Live 2024" },
  { id: "04-think-2025", name: "Think 2025", year: "2025", alt: "Rutger Tuit at Think 2025" },
  { id: "05-dentsu-think", name: "Dentsu Google Think", year: "2024", alt: "Rutger Tuit at Dentsu Google Think 2024" },
];

const NAV_ITEMS: ReadonlyArray<readonly [string, string, string]> = [
  ["mk-bio", "01", "Bio"],
  ["mk-photos", "02", "Photos"],
  ["mk-logos", "03", "Logos"],
  ["mk-topics", "04", "Topics"],
  ["mk-events", "05", "Events"],
  ["mk-book", "06", "Booking"],
];

export function MediaKit() {
  const [bio, setBio] = useState<BioKey>("short");
  const [copied, setCopied] = useState<BioKey | null>(null);
  const [activeAnchor, setActiveAnchor] = useState("mk-bio");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const ids = ["mk-bio", "mk-photos", "mk-logos", "mk-topics", "mk-events", "mk-book"];
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const v = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (v[0]) setActiveAnchor(v[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.1, 0.4] }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const copy = (key: BioKey) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(BIOS[key]).catch(() => {
        /* ignored */
      });
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <section className="rt-mk section" id="media-kit">
      <div className="container">
        <header className="rt-mk__head">
          <div className="eyebrow eyebrow--warm">04 · MEDIA KIT</div>
          <h2 className="rt-mk__title">For producers, organisers, journalists.</h2>
          <p className="rt-mk__lead">
            Bios, photos, logos, topics — all on one page. Print as a PDF straight from here if
            that&apos;s what your workflow needs.
          </p>
        </header>

        <nav className="rt-mk__nav" aria-label="Media kit sections">
          {NAV_ITEMS.map(([id, n, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeAnchor === id ? "active" : ""}
              aria-current={activeAnchor === id ? "true" : undefined}
            >
              <span>{n}</span> {label}
            </a>
          ))}
        </nav>

        {/* Bio */}
        <div className="rt-mk__section" id="mk-bio">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">01 · BIO</div>
            <div className="rt-mk__bio-switch">
              {(["short", "medium", "long"] as const).map((k) => (
                <button key={k} onClick={() => setBio(k)} className={k === bio ? "active" : ""}>
                  {k.toUpperCase()}
                </button>
              ))}
              <button className="rt-mk__bio-copy" onClick={() => copy(bio)}>
                {copied === bio ? "COPIED ✓" : "COPY"}
              </button>
            </div>
          </div>
          <span className="sr-only" aria-live="polite">
            {copied ? `${copied.charAt(0).toUpperCase() + copied.slice(1)} bio copied to clipboard` : ""}
          </span>
          <p className={`rt-mk__bio rt-mk__bio--${bio}`}>{BIOS[bio]}</p>
        </div>

        {/* Photos */}
        <div className="rt-mk__section" id="mk-photos">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">02 · PHOTOS</div>
            <Link className="button" href="/contact?topic=photos">
              Hi-res set · on request <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="rt-mk__photos">
            {(
              [
                { id: "01-studio", alt: "Rutger Tuit — studio portrait, controlled lighting" },
                { id: "02-warehouse", alt: "Rutger Tuit — warehouse portrait, dark overshirt, industrial backdrop" },
                { id: "03-cinematic", alt: "Rutger Tuit — cinematic portrait, dramatic side lighting, profile angle" },
                { id: "04-profile", alt: "Rutger Tuit — three-quarter profile, neutral backdrop" },
                { id: "05-mid-shot", alt: "Rutger Tuit — mid-shot, relaxed casual register" },
                { id: "06-stage", alt: "Rutger Tuit — stage portrait, performance and speaking context" },
              ] as const
            ).map(({ id, alt }) => (
                <figure key={id} className="rt-mk__photo">
                  <Image
                    src={`/assets/portraits/${id}.png`}
                    alt={alt}
                    width={1440}
                    height={1920}
                    sizes="(max-width: 720px) 50vw, 25vw"
                  />
                  <figcaption>
                    {id.replace(/^\d+-/, "").toUpperCase().replace("-", " ")}
                  </figcaption>
                </figure>
              ))}
          </div>
        </div>

        {/* Logos */}
        <div className="rt-mk__section" id="mk-logos">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">03 · LOGOS</div>
            <Link className="button" href="/contact?topic=logos">
              Logo pack · on request <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="rt-mk__logos">
            <div className="rt-mk__logo rt-mk__logo--dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo-rt.svg" alt="Rutger Tuit wordmark — dark variant" width={160} height={80} />
              <span>DARK</span>
            </div>
            <div className="rt-mk__logo rt-mk__logo--light">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo-rt.svg" alt="Rutger Tuit wordmark — light variant" width={160} height={80} />
              <span>LIGHT</span>
            </div>
            <div className="rt-mk__logo rt-mk__logo--mono">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo-rt.svg" alt="Rutger Tuit wordmark — monochrome variant" width={160} height={80} />
              <span>MONO</span>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="rt-mk__section" id="mk-topics">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">04 · SPEAKING TOPICS</div>
          </div>
          <ul className="rt-mk__topics">
            {TOPICS.map((t) => (
              <li key={t.name}>
                <span className="rt-mk__topic-name">{t.name}</span>
                <span className="rt-mk__topic-tags">
                  {t.tags.map((tag) => (
                    <em key={tag}>{tag}</em>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Events */}
        <div className="rt-mk__section" id="mk-events">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">05 · PAST EVENTS</div>
          </div>
          <ul className="rt-mk__events">
            {EVENTS.map((e) => (
              <li key={e.id}>
                <Image
                  src={`/assets/events/${e.id}.png`}
                  alt={e.alt}
                  width={800}
                  height={800}
                  sizes="(max-width: 720px) 50vw, 33vw"
                />
                <div>
                  <div className="rt-mk__event-name">{e.name}</div>
                  <div className="rt-mk__event-year">{e.year}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Book */}
        <div className="rt-mk__section" id="mk-book">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">06 · BOOKING</div>
          </div>
          <p className="rt-mk__book">
            For speaking enquiries, podcast appearances, or strategic engagements with Dutch-market
            CMOs and agency CEOs — use the contact form below. Same inbox, same human reading it.
          </p>
          <a className="button button--warm" href="/contact">
            Open the contact form <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
