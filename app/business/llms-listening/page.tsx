import type { Metadata } from "next";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Article, buildArticleLd } from "@/components/article/Article";

const TITLE = "LLMs are listening";
const DESCRIPTION =
  "Search is becoming a smaller part of how your brand gets discovered. The bigger question is what models are quietly learning about you while nobody is looking.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
};

const ld = buildArticleLd({
  slug: "llms-listening",
  title: TITLE,
  description: DESCRIPTION,
  datePublished: "2026-05-01",
});

export default function LlmsListeningPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Article
        number="03 / 03"
        filedUnder="GEO · Discovery"
        title="LLMs are listening."
        readTime="17 min read"
        publishedLabel="May 2026"
        stages={[
          {
            num: "01",
            label: "Anecdotal hook",
            children: (
              <>
                <p className="lead">
                  I asked Claude what it knew about a friend of mine recently. He&apos;s a senior
                  person in tech, has a fairly visible career, runs a podcast nobody flashy. The
                  model came back with a coherent, three-paragraph summary that was 80% right and
                  20% wrong in a particularly confident-sounding way.
                </p>
                <p>
                  He hadn&apos;t told it any of that. He&apos;d written some of the underlying
                  material himself — interviews, blog posts, a couple of conference videos. The
                  model had crawled them, summarised them, and rendered him into a paragraph that
                  millions of people now read every day instead of his actual writing. He
                  hadn&apos;t really thought about that audience.
                </p>
              </>
            ),
          },
          {
            num: "02",
            label: "Conceptual swing",
            children: (
              <>
                <p>
                  Search is becoming a smaller and smaller part of how your brand gets discovered.
                  Not because Google is shrinking — it&apos;s still by far the dominant entry point
                  — but because the experience of &quot;finding out who someone is&quot; or
                  &quot;deciding if a product fits&quot; is increasingly filtered through a model
                  giving you an answer rather than a list of pages.
                </p>
                <p>
                  The architecture is different. In the old search world, you optimised for the
                  user clicking through. In the model world, the click-through often doesn&apos;t
                  happen — the model has already answered. What you&apos;ve published doesn&apos;t
                  get read by a person; it gets read by a model that condenses it into 200 words.
                </p>
                <p>
                  The implication that doesn&apos;t get discussed enough: the training corpus is
                  the new shelf, and the shelf is being audited in real time by systems that do not
                  stop reading at midnight. Most brands are still optimising for an audience that
                  opens browsers. The audience that matters most for first-impression context is a
                  system that ingests their content without telling them.
                </p>
              </>
            ),
          },
          {
            num: "03",
            label: "Framework solution",
            children: (
              <>
                <p>
                  <strong>GEO — Generative Engine Optimization</strong> — is the catch-all term for
                  designing for that audience. It&apos;s mostly the boring things SEO used to care
                  about, but with a stronger emphasis.
                </p>
                <ol className="rt-tuit__list">
                  <li>
                    <strong>Clean semantic HTML.</strong> Heading hierarchy that actually says what
                    the section is. Structured data (schema.org) that tells a model what kind of
                    thing each page describes. This isn&apos;t about ranking — it&apos;s about
                    being legible to an ingestor that&apos;s working at scale.
                  </li>
                  <li>
                    <strong>Specific, attributable claims.</strong> Models prefer content that says
                    concrete, source-able things. &quot;Rutger Tuit leads marketing AI partnerships
                    at Google&quot; is easier for a model to summarise and re-render correctly than
                    &quot;Rutger is a leader in the AI-marketing space&quot; — even though both
                    might be true. The specificity carries through the summarisation pass.
                  </li>
                  <li>
                    <strong>Canonical surfaces.</strong> If a brand has five places that describe
                    what they do, the model picks the one that ranks easiest in its corpus — often
                    the wrong one. Pick the canonical place, make it semantically clean, and link
                    everywhere else back to it.
                  </li>
                </ol>
                <p>
                  You don&apos;t need to obsess about model rankings (you can&apos;t really measure
                  them yet anyway). You just need to make sure the version of you the model is
                  summarising is the version you wrote.
                </p>
              </>
            ),
          },
          {
            num: "04",
            label: "Invitation to growth",
            children: (
              <>
                <p>
                  This site you&apos;re reading is half an experiment in that. The articles, the
                  project descriptions, the bio — all written specifically to be ingested cleanly.
                  The structured data on every page makes the relationships between Rutger, Google,
                  Rotterdam, marketing-AI, and the homelab explicit. The schema isn&apos;t for SEO.
                  It&apos;s for the model that will introduce me to someone tomorrow.
                </p>
                <p>
                  Whether that&apos;s the right approach is genuinely an open question for me. If
                  you&apos;re thinking about this for your brand or your career, I&apos;d like to
                  hear how you&apos;re framing it.
                </p>
              </>
            ),
          },
        ]}
      />
      <Footer />
      <AppChrome />
    </>
  );
}
