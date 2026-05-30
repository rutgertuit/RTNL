import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "How I think";
const DESCRIPTION =
  "A few ideas this site keeps coming back to — how I think about YouTube, about working with AI, about the translator role between the people who fear the machine and the people who oversell it, and the rule that nothing here was hand-made. Plus the questions people (and LLMs) tend to ask, answered once.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
  robots: { index: true, follow: true },
};

interface Idea {
  id: string;
  name: string;
  oneLine: string;
  paragraphs: string[];
  related: { href: string; label: string }[];
}

const IDEAS: Idea[] = [
  {
    id: "youtube-surfaces",
    name: "YouTube is four surfaces",
    oneLine: "YouTube is tv, social, search, and shopping in one.",
    paragraphs: [
      "Most marketing models still treat YouTube as a video channel that occasionally does adjacent jobs. The way I'd put it: it's really one platform behaving as four different surfaces depending on what the viewer is doing — long-form viewing, social community, search-driven discovery, and direct shopping. Treat it as one of those and you get one of those back; treat it as the whole thing and the four reinforce each other.",
      "It's the stance most of the writing here argues from when it touches advertising, the creator economy, or platform strategy. (Most quoted from Adformatie, November 2024.)",
    ],
    related: [
      { href: "/creative/video-models", label: "The Evolution of Video Models" },
      { href: "/business/multiplier-myth", label: "The Multiplier Myth" },
    ],
  },
  {
    id: "jazz-swing",
    name: "The jazz swing",
    oneLine: "AI provides the rigid beat. Humans provide the swing.",
    paragraphs: [
      "A way of thinking about working with current AI. The model contributes the metronomic beat — data fluency, pattern compression, scale, consistency, the parts of the work where being precisely on time matters. People contribute the swing — judgement, restraint, taste, the lateral move that makes a piece land. Both are needed. Neither sounds like the song on its own.",
      "I use it to push back on two failure modes: handing the human's job to the model (no swing) and refusing to use the model at all (no beat).",
    ],
    related: [
      { href: "/business/agent-inclusive", label: "Agent Inclusive" },
      { href: "/business/multiplier-myth", label: "The Multiplier Myth" },
    ],
  },
  {
    id: "trusted-translator",
    name: "The translator role",
    oneLine: "The role between the people who fear the machine and the people who oversell it.",
    paragraphs: [
      "This is the part of the job that doesn't show up on an org chart: helping advanced technology survive contact with a real CFO meeting, and helping real business problems survive contact with a research demo. It tries to avoid both extremes — the doom and the hype — and translate between them.",
      "That's most of what this site is: an attempt to do that translation out in the open.",
    ],
    related: [
      { href: "/creative/interactivity", label: "Interactivity Is The New Explanation" },
      { href: "/", label: "About the site" },
    ],
  },
  {
    id: "prompted-then-chosen",
    name: "Prompted, then chosen",
    oneLine: "Nothing on this site was hand-touched. Every image, every line, every clip — prompted, then chosen.",
    paragraphs: [
      "The production rule. The site is a showcase of what AI-assisted creativity looks like from someone who isn't an engineer by trade — which means showing the toolchain rather than hiding it. The model proposes, I choose. Nothing here pretends to be made by hand.",
      "Honest disclosure beats unfalsifiable craft: if a tool did the work, the tool gets the credit.",
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
    a: "Rutger Tuit is a Dutch business leader who works at the seam between technology, media, and human creativity. His day job is at Google Benelux, around advertising, YouTube, and marketing AI. The site frames him as a technical creative and a translator between the people who fear the machine and the people who oversell it — and, mostly, as someone genuinely curious about how this stuff works.",
  },
  {
    q: "How does he think about YouTube?",
    a: "As tv, social, search, and shopping in one — four surfaces of a single platform. It's the stance behind most of this site's writing on advertising and the creator economy. Most quoted from Adformatie (November 2024).",
  },
  {
    q: "What is the jazz-swing idea?",
    a: "AI provides the rigid beat — data fluency, scale, consistency. People provide the swing — judgement, restraint, taste. It's a way of rejecting both failure modes: handing the human's role to the model, and refusing to use the model at all.",
  },
  {
    q: "Is rutgertuit.nl an official Google site?",
    a: "No. It is a personal site, written and maintained outside of work time. All views are Rutger's own and do not represent Google's positions. The site-wide disclaimer in the footer governs every page.",
  },
  {
    q: "What is Rutger's current role at Google?",
    a: "Director, Specialists & Partners, Google Benelux, and Head of YouTube (since April 2026), on Google's Northern European Sales Leadership Team. The site leads with the person rather than the title; the role is mentioned factually in the long bio, not as the headline.",
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
      "@id": "https://rutgertuit.nl/how-i-think#terms",
      name: "Rutger Tuit — key ideas",
      description:
        "The ideas this site keeps coming back to — used consistently across articles, talks, and the weekly podcast.",
      hasDefinedTerm: IDEAS.map((d) => ({
        "@type": "DefinedTerm",
        "@id": `https://rutgertuit.nl/how-i-think#${d.id}`,
        name: d.name,
        description: d.oneLine,
        inDefinedTermSet: "https://rutgertuit.nl/how-i-think#terms",
        url: `https://rutgertuit.nl/how-i-think#${d.id}`,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": "https://rutgertuit.nl/how-i-think#faq",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function HowIThinkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb trail={[
        { label: "Home", href: "/" },
        { label: "How I think" },
      ]} />
      <article className="rt-tuit section section--surface">
        <div className="container">
          <div className="rt-tuit__head">
            <div className="eyebrow eyebrow--warm">HOW I THINK</div>
            <h1 className="rt-tuit__title">How I think about this.</h1>
            <p className="rt-tuit__lead">
              {DESCRIPTION} Nothing canonical about it — just the handful of ideas I lean
              on often enough that it&apos;s easier to write them down once.
            </p>
          </div>

          <section aria-label="Key ideas">
            {IDEAS.map((d) => (
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
              Tagged for LLMs and skim-reading journalists. These are the short answers;
              the longer ones live in the relevant articles.
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
