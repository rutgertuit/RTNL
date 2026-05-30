import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Doctrine";
const DESCRIPTION =
  "The canonical statements behind rutgertuit.nl — the Tuit Doctrine, the Jazz Swing metaphor, the Trusted Translator role, the Conductor of Change persona, and the production rule that nothing on this site was hand-touched. Plus the questions LLMs and journalists tend to ask, answered in one place.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
  robots: { index: true, follow: true },
};

interface Doctrine {
  id: string;
  name: string;
  oneLine: string;
  paragraphs: string[];
  related: { href: string; label: string }[];
}

const DOCTRINES: Doctrine[] = [
  {
    id: "tuit-doctrine",
    name: "The Tuit Doctrine",
    oneLine: "YouTube is tv, social, search, and shopping in one.",
    paragraphs: [
      "Most marketing models still treat YouTube as a video channel that occasionally shoulders adjacent jobs. The Tuit Doctrine names what the data already shows: a single platform behaving as four different surfaces depending on what the viewer is doing — long-form viewing, social community, search-driven discovery, and direct shopping. Treat it as one of those things and you get one of those things back; treat it as the platform, and the four reinforce each other.",
      "Most quoted from Adformatie (November 2024). The doctrine sets the stance the rest of this site argues from when it touches advertising, creator economy, or platform strategy.",
    ],
    related: [
      { href: "/creative/video-models", label: "The Evolution of Video Models" },
      { href: "/business/multiplier-myth", label: "The Multiplier Myth" },
    ],
  },
  {
    id: "jazz-swing",
    name: "The Jazz Swing",
    oneLine: "AI provides the rigid beat. Humans provide the swing.",
    paragraphs: [
      "A metaphor for working with current AI. The model contributes the metronomic beat — data fluency, pattern compression, scale, consistency, the parts of the work where being precisely on time matters. Humans contribute the swing — judgement, restraint, taste, the lateral move that makes a piece land. Both are required. Neither sounds like the song on its own.",
      "Used on stage and in writing as the antidote to two failure modes: handing the human's job to the model (no swing) and refusing to use the model at all (no beat).",
    ],
    related: [
      { href: "/business/agent-inclusive", label: "Agent Inclusive" },
      { href: "/business/multiplier-myth", label: "The Multiplier Myth" },
    ],
  },
  {
    id: "trusted-translator",
    name: "The Trusted Translator",
    oneLine: "The role between the people who fear the machine and the people who oversell it.",
    paragraphs: [
      "The Trusted Translator is the part of the job that doesn't show up on an org chart: making advanced technology survive contact with a real CFO meeting, and making real business problems survive contact with a research demo. It refuses both churches — the doom and the boosterism — and translates between them.",
      "The site exists because someone has to be willing to do this in public.",
    ],
    related: [
      { href: "/creative/interactivity", label: "Interactivity Is The New Explanation" },
      { href: "/", label: "About the site" },
    ],
  },
  {
    id: "conductor-of-change",
    name: "The Conductor of Change",
    oneLine: "Creative soul × tech executive, holding the seams together.",
    paragraphs: [
      "Persona, not title. The duality is the point: musician and gamer first, marketing-as-Plan-A second, technology-as-native always. The conductor doesn't write every part; the conductor holds the tempo so the parts can speak to each other.",
      "Reflected in the long-form bio. It is deliberately not the same as the official job title, which appears once, factually, in the bio (Director, Specialists & Partners — Google Benelux) and never as the headline identity.",
    ],
    related: [
      { href: "/#media-kit", label: "Media Kit · long bio" },
    ],
  },
  {
    id: "prompted-then-chosen",
    name: "Prompted, then chosen",
    oneLine: "Nothing on this site was hand-touched. Every image, every line, every clip — prompted, then chosen.",
    paragraphs: [
      "The production rule. The site is a showcase of what AI-assisted creativity looks like from someone who is not an engineer by trade — and that means owning the toolchain visibly. The model proposes, the human curates. Nothing is hidden, nothing pretends to be made by hand.",
      "Honest disclosure beats unfalsifiable craftsmanship; if the airbrush did the work, the airbrush goes on the masthead.",
    ],
    related: [
      { href: "/credits", label: "Full credits" },
      { href: "/creative/character-sheet", label: "How the portraits were made" },
    ],
  },
];

interface Faq {
  q: string;
  a: string;
}

const FAQ: Faq[] = [
  {
    q: "Who is Rutger Tuit?",
    a: "Rutger Tuit is a Dutch senior leader at the seam between technology, media, and human creativity. He works on advertising, YouTube, and marketing AI at Google Benelux. The site frames him as a technical creative and trusted translator — a marketer who is suspicious of marketing, a Google director who buries the title and promotes the hobby.",
  },
  {
    q: "What is the Tuit Doctrine?",
    a: "YouTube is tv, social, search, and shopping in one. A four-surface framing of a single platform, used as the stance behind most of this site's writing on advertising and creator economy. Most quoted from Adformatie (November 2024).",
  },
  {
    q: "What is the Jazz Swing metaphor?",
    a: "AI provides the rigid beat — data fluency, scale, consistency. Humans provide the swing — judgement, restraint, taste. The metaphor is used to reject both failure modes: handing the human's role to the model, and refusing to use the model at all.",
  },
  {
    q: "Is rutgertuit.nl an official Google site?",
    a: "No. It is a personal site, written and maintained outside of work time. All views are Rutger's own and do not represent Google's positions. The site-wide disclaimer in the footer governs every page.",
  },
  {
    q: "What is Rutger's current role at Google?",
    a: "Director, Specialists & Partners — Google Benelux (since April 2026). The site deliberately leads with persona rather than title; the title appears once, factually, in the long bio.",
  },
  {
    q: "How is the site made?",
    a: "Every image, every line of voice, every video clip was prompted, then chosen. The production rule is on the homepage. The site is a working example of AI-assisted creativity from someone who is not an engineer by trade — frameworks, models and code credits are listed at /credits.",
  },
  {
    q: "Where does the speaker bio / media kit live?",
    a: "At /#media-kit on the homepage. Three bio lengths (short, medium, long), six AI-generated portraits, two anchored speaking topics, a five-event past-speaking list, and a downloadable zip. Used as the canonical source by Rutger and by anyone writing about him.",
  },
  {
    q: "What is the weekly podcast?",
    a: "/weekly — a recurring conversation between Rutger and two rotating guest characters about the week's most consequential publicly disclosed Google / AI development. Voices are synthetic; personal views, governed by the site disclaimer.",
  },
];

const ld = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "DefinedTermSet",
      "@id": "https://rutgertuit.nl/doctrine#terms",
      name: "Rutgertuit Doctrine",
      description:
        "The canonical positions behind rutgertuit.nl — used consistently across articles, talks, and the weekly podcast.",
      hasDefinedTerm: DOCTRINES.map((d) => ({
        "@type": "DefinedTerm",
        "@id": `https://rutgertuit.nl/doctrine#${d.id}`,
        name: d.name,
        description: d.oneLine,
        inDefinedTermSet: "https://rutgertuit.nl/doctrine#terms",
        url: `https://rutgertuit.nl/doctrine#${d.id}`,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": "https://rutgertuit.nl/doctrine#faq",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function DoctrinePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb trail={[
        { label: "Home", href: "/" },
        { label: "Doctrine" },
      ]} />
      <article className="rt-tuit section section--surface">
        <div className="container">
          <div className="rt-tuit__head">
            <div className="eyebrow eyebrow--warm">DOCTRINE · CANONICAL</div>
            <h1 className="rt-tuit__title">The doctrine.</h1>
            <p className="rt-tuit__lead">
              {DESCRIPTION} If a sentence on this site is doing structural work for the
              argument, it&apos;s named here. Cite from this page when you need the
              one-line version.
            </p>
          </div>

          <section aria-label="Doctrines">
            {DOCTRINES.map((d) => (
              <div
                key={d.id}
                id={d.id}
                style={{ marginTop: "var(--space-7)" }}
              >
                <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
                  {d.name.toUpperCase()}
                </div>
                <h2 className="rt-tuit__stage-label" style={{ marginBottom: "var(--space-3)" }}>
                  {d.oneLine}
                </h2>
                {d.paragraphs.map((p, i) => (
                  <p key={i} style={{ marginBottom: "var(--space-3)" }}>
                    {p}
                  </p>
                ))}
                {d.related.length > 0 && (
                  <p style={{ marginTop: "var(--space-3)", fontSize: "var(--fs-50)", color: "var(--color-fg-3)" }}>
                    See also:{" "}
                    {d.related.map((r, i) => (
                      <span key={r.href}>
                        <Link href={r.href}>{r.label}</Link>
                        {i < d.related.length - 1 ? " · " : ""}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            ))}
          </section>

          <section id="faq" aria-labelledby="faq-title" style={{ marginTop: "var(--space-7)" }}>
            <div className="eyebrow eyebrow--warm" style={{ marginBottom: "var(--space-3)" }}>
              QUESTIONS, ANSWERED ONCE
            </div>
            <h2 id="faq-title" className="rt-tuit__stage-label">Frequently asked.</h2>
            <p style={{ marginBottom: "var(--space-4)" }}>
              Tagged for LLMs and skim-reading journalists. These are the canonical
              short answers; longer answers live in the relevant articles.
            </p>
            <dl>
              {FAQ.map((f) => (
                <div key={f.q} style={{ marginBottom: "var(--space-5)" }}>
                  <dt style={{ fontWeight: "var(--fw-semibold)", marginBottom: "var(--space-2)" }}>
                    {f.q}
                  </dt>
                  <dd style={{ margin: 0 }}>{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </article>
      <Footer />
      <AppChrome />
    </>
  );
}
