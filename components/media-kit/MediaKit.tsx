"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

type BioKey = "short" | "medium" | "long";

const BIOS: Record<BioKey, string> = {
  short:
    'Rutger Tuit is a business leader who likes working where technology meets human creativity — figuring out the strategic reasons behind the technical detail, and helping the people who have to act on it. He picks up a new field well enough to spot where it\'s about to bump into the next one, and tries to flag that early. Right now that\'s in marketing: he\'s Director, Specialists & Partners at Google Benelux and Head of YouTube, and sits on Google\'s Northern European Sales Leadership Team. The way he likes to work — high trust, teams that are loosely coupled but agree on the goal, plenty of room to experiment — isn\'t really specific to marketing. This site is a personal project; the views here are his own.',
  medium:
    'Rutger Tuit is a business leader who\'s defined more by how he works than by any one industry. He likes the spot where technology, media and human creativity overlap — the strategic "why" behind the technical "how" — and he\'s good at picking up a new field quickly enough to see where it\'s about to collide with the next one, then helping leaders get ahead of it. His read on the last decade is a pattern, not a marketing story: first organisations got to grips with big data, then video opened up through YouTube, and now everything is being rebuilt around AI — a shift that doesn\'t stop at marketing\'s door. He\'s a firm believer that innovation only really scales when there\'s trust: teams that are loosely coupled but completely agree on the goal, with room for people to do their best work. Right now that plays out in marketing — he\'s Director, Specialists & Partners at Google Benelux and Head of YouTube, on Google\'s Northern European Sales Leadership Team, working across Benelux agency partnerships, YouTube specialists, Creative Works, Search and Measurement. Away from the day job he\'s a musician and a homelab tinkerer who genuinely enjoys getting into the weeds of his own subject. This site is a personal project; the views here are his own.',
  long:
    'Rutger Tuit is a business leader who\'s defined more by how he works than by any one industry. He likes the place where technology, media and human creativity overlap, and his instinct is always to look for the strategic "why" underneath the technical "how". He picks up new fields quickly enough to see where they\'re about to run into each other — and he\'s at his most useful as a translator between them: between art and commerce, between human creativity and what machines can now do. The interesting stuff, he\'d say, tends to live at the seams rather than inside any single discipline.\n\n'
    + 'None of that started in a boardroom. It started with a musician\'s ear and a gamer\'s head for systems. His parents were both teachers, so curiosity was the household default, but he found his feet early in computers — a Commodore 64, a lot of Quake 2, and years of running a World of Warcraft guild. (Mostly that was just fun; in hindsight it was also a first taste of online community and getting people to pull in the same direction.) His heart, though, was in music and audio. Marketing began as a side job — a way to pay for the music — until he got genuinely curious about it and realised the mix of technology, creativity and constant change scratched the same itch as making music and playing competitively. The side job became the work. Along the way he built up the full picture deliberately, from a few angles: brand-side at KPN, agency and media-buying at GroupM, ad-tech at Bannerconnect, then Google — guided by his own rule of thumb, "in elke rol-switch wil ik circa 20% vernieuwing" (in every role change I want roughly 20% that\'s new to me). That\'s mostly why he can hold the whole chain in view at once, across teams that don\'t always see each other.\n\n'
    + 'He tends to read the last decade as a pattern rather than a marketing story: first organisations got to grips with big data, then video opened up through YouTube, and now everything is being rebuilt around AI. That last shift doesn\'t stop at marketing\'s door — it changes how any industry makes things, decides and competes. His job, as he sees it, is to help leaders turn those big moves, and the creative and productivity unlock of generative AI, into plans that are honest about what an organisation can actually do — and that grow the business on both sides of the table.\n\n'
    + 'Right now that happens in marketing. He\'s Director, Specialists & Partners at Google Benelux and Head of YouTube, and sits on Google\'s Northern European Sales Leadership Team — working across Benelux agency partnerships, YouTube specialists, Creative Works, Search and Measurement, mostly with Dutch CMOs, agency CEOs and CTOs. He talks about YouTube as tv, social, search and shopping rolled into one, and about AI with a "jazz swing" picture: the machine keeps the rigid beat — data, efficiency, scale — which frees people up for the swing, the judgement and taste and the human bits that actually make the difference. He turns up now and then at cultural and business events around the region (Amsterdam Dance Event, ESNS, Marketing Effie Live) and writes the odd piece for Google\'s Think with Google.\n\n'
    + 'What he carries from one field to the next is really a way of working: lots of experimentation, a lot of faith in human creativity, and teams that are loosely coupled but completely agree on where they\'re heading — aligned enough to more or less run themselves, with room for people to do their best work. He\'s pretty convinced innovation only scales when there\'s real trust, the kind that quietly clears away silos and red tape. None of that is specific to marketing.\n\n'
    + 'This site is a personal project, written in a personal capacity — the views here are his own, not his employer\'s. It\'s also a bit of a sandbox: a lot of the content is drafted with generative AI and then picked over and chosen by him. Nothing here was hand-made in the old sense; every image and line was prompted, then chosen. Off the clock he\'s still a musician and a homelab tinkerer who likes getting properly into the weeds of whatever he\'s learning.',
};

// Two topics — both anchored to Rutger's authorised lanes as a Google representative.
// (See SPEAKING section copy below for the not-available framing.)
const TOPICS = [
  {
    name: "Google products & advertising",
    blurb:
      "How the Google ad stack — Search, Display, YouTube, and the AI tooling around them — actually behaves in market for Dutch CMOs and agency leads.",
  },
  {
    name: "YouTube & the creator economy",
    blurb:
      "YouTube as tv, social, search and shopping at once. What the Benelux market has taught about the creator-platform-advertiser triangle.",
  },
];

// Past events with image tiles (5, in reverse chronological order)
const EVENTS_WITH_TILE: Array<{ id: string; name: string; year: string; alt: string }> = [
  { id: "01-yt-festival",   name: "YouTube Festival",        year: "2025", alt: "Rutger Tuit speaking at YouTube Festival 2025" },
  { id: "02-esns",          name: "ESNS Panel",              year: "2025", alt: "Rutger Tuit on stage at ESNS Panel 2025" },
  { id: "03-marketing-live",name: "Google Marketing Live",   year: "2024", alt: "Rutger Tuit presenting at Google Marketing Live 2024" },
  { id: "04-think-2025",    name: "Think 2025",              year: "2025", alt: "Rutger Tuit at Think 2025" },
  { id: "05-dentsu-think",  name: "Dentsu Google Think",     year: "2024", alt: "Rutger Tuit at Dentsu Google Think 2024" },
];

// Additional speaking moments without dedicated photography — surfaced as a text list
// below the photo tiles. Mined from /press data so the two pages stay aligned.
const EVENTS_TEXT: Array<{ name: string; year: string; venue?: string }> = [
  { name: "ESNS Conference — YouTube: A world stage for all",     year: "2024", venue: "Eurosonic Noorderslag, Groningen" },
  { name: "YouTube Festival — Sugarfactory",                       year: "2023", venue: "Sugarfactory, Amsterdam" },
  { name: "Marketing Effie Live — speaker programme",              year: "Recurring" },
  { name: "Amsterdam Dance Event (ADE) — speaker programme",       year: "Recurring", venue: "ADE, Amsterdam" },
  { name: "Think with Google — author programme",                  year: "Ongoing" },
];

const NAV_ITEMS: ReadonlyArray<readonly [string, string, string]> = [
  ["mk-bio",      "01", "Bio"],
  ["mk-photos",   "02", "Photos"],
  ["mk-topics",   "03", "Topics"],
  ["mk-events",   "04", "Events"],
  ["mk-speaking", "05", "Speaking"],
];

export function MediaKit() {
  const [bio, setBio] = useState<BioKey>("short");
  const [copied, setCopied] = useState<BioKey | null>(null);
  const [activeAnchor, setActiveAnchor] = useState("mk-bio");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const ids = NAV_ITEMS.map(([id]) => id);
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
            Bios, photos, topics — all on one page. Print as a PDF straight from here if
            that&apos;s what your workflow needs.
          </p>
          <p className="rt-mk__disclaimer">
            <strong>Note —</strong> this is a personal site and the kit below is for media
            convenience. All assets and copy are <em>AI-assisted, human-directed</em>.
            Personal views, not affiliated with my employer. Portraits below are
            AI-generated; label them appropriately when used in print or press.
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
          <div className={`rt-mk__bio rt-mk__bio--${bio}`}>
            {BIOS[bio].split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="rt-mk__section" id="mk-photos">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">02 · PHOTOS</div>
            <a
              className="button button--warm"
              href="/assets/media-kit/rutger-tuit-mediakit.zip"
              download
            >
              Download set (zip) <span aria-hidden>↓</span>
            </a>
          </div>
          <p className="rt-mk__photos-note">
            Six <strong>AI-generated portraits</strong> (1440&times;1920 PNG) plus the
            three bios above, bundled as one zip. Each image is synthetic &mdash; not a
            photograph. Label as such if used in print or editorial.
          </p>
          <div className="rt-mk__photos">
            {(
              [
                { id: "01-studio",    alt: "Rutger Tuit — studio portrait, controlled lighting" },
                { id: "02-warehouse", alt: "Rutger Tuit — warehouse portrait, dark overshirt, industrial backdrop" },
                { id: "03-cinematic", alt: "Rutger Tuit — cinematic portrait, dramatic side lighting, profile angle" },
                { id: "04-profile",   alt: "Rutger Tuit — three-quarter profile, neutral backdrop" },
                { id: "05-mid-shot",  alt: "Rutger Tuit — mid-shot, relaxed casual register" },
                { id: "06-stage",     alt: "Rutger Tuit — stage portrait, performance and speaking context" },
              ] as const
            ).map(({ id, alt }) => (
                <figure key={id} className="rt-mk__photo">
                  <Image
                    src={`/assets/portraits/${id}.png`}
                    alt={`${alt} (AI-generated, not a photograph)`}
                    width={1248}
                    height={1664}
                    sizes="(max-width: 720px) 50vw, 33vw"
                    quality={85}
                  />
                  <span className="rt-mk__photo-aibadge" aria-hidden>AI</span>
                  <figcaption>
                    {id.replace(/^\d+-/, "").toUpperCase().replace("-", " ")}
                    <span className="rt-mk__photo-aitag"> · AI-GENERATED</span>
                  </figcaption>
                </figure>
              ))}
          </div>
        </div>

        {/* Topics */}
        <div className="rt-mk__section" id="mk-topics">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">03 · SPEAKING TOPICS</div>
          </div>
          <ul className="rt-mk__topics">
            {TOPICS.map((t) => (
              <li key={t.name}>
                <span className="rt-mk__topic-name">{t.name}</span>
                <span className="rt-mk__topic-blurb">{t.blurb}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Events — image tiles + text list */}
        <div className="rt-mk__section" id="mk-events">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">04 · PAST EVENTS</div>
          </div>
          <ul className="rt-mk__events">
            {EVENTS_WITH_TILE.map((e) => (
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
          <div className="rt-mk__events-text">
            <div className="rt-mk__events-text-label">ALSO ON STAGE</div>
            <ul>
              {EVENTS_TEXT.map((e) => (
                <li key={e.name}>
                  <span className="rt-mk__events-text-name">{e.name}</span>
                  <span className="rt-mk__events-text-meta">
                    {e.venue ? `${e.venue} · ` : ""}{e.year}
                  </span>
                </li>
              ))}
            </ul>
            <p className="rt-mk__events-text-foot">
              Plus 24 interviews and conversations &mdash;{" "}
              <Link href="/press" className="rt-mk__events-text-link">
                see Articles &amp; Interviews Elsewhere
              </Link>.
            </p>
          </div>
        </div>

        {/* Speaking — not available */}
        <div className="rt-mk__section" id="mk-speaking">
          <div className="rt-mk__row-head">
            <div className="rt-mk__row-label">05 · SPEAKING</div>
          </div>
          <p className="rt-mk__book">
            For public speaking I only participate in approved professional contexts
            related to my role &mdash; topics anchored to Google products and the YouTube
            platform. <strong>This site itself is personal</strong>; outside-the-day-job
            engagements run through that approval process, not through this kit.
          </p>
        </div>
      </div>
    </section>
  );
}
