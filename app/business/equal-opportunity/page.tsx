import type { Metadata } from "next";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Article, buildArticleLd } from "@/components/article/Article";

const TITLE = "Equal opportunity for agents";
const DESCRIPTION =
  "Briefing an AI agent looks more like briefing a junior teammate than typing a prompt. Most of the AI underperformance I see in marketing teams traces back to that single mismatch.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
};

const ld = buildArticleLd({
  slug: "equal-opportunity",
  title: TITLE,
  description: DESCRIPTION,
  datePublished: "2026-05-01",
});

export default function EqualOpportunityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Article
        number="01 / 03"
        filedUnder="AI Transformation"
        title="Equal opportunity for agents."
        readTime="11 min read"
        publishedLabel="May 2026"
        stages={[
          {
            num: "01",
            label: "Anecdotal hook",
            children: (
              <>
                <p className="lead">
                  The first AI agent I ever briefed properly was for a project that did not need
                  an AI agent at all. It was a Tuesday-afternoon meeting with a sceptical CFO who,
                  ten minutes in, asked the only question that mattered:{" "}
                  <em>so what is it actually doing while we are talking?</em>
                </p>
                <p>
                  I had no good answer. I had a model card, an API key, a tab open to the chat
                  interface. None of that is the answer to &quot;what is it doing.&quot;
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
                  Most of the AI underperformance I see in marketing teams doesn&apos;t trace back
                  to model choice or vendor selection. It traces back to that single moment. The
                  team brought an agent into the project the way they would have brought a search
                  tool: type a query, get an answer, move on. The agent ends up as a more expensive
                  autocomplete, and the team is mildly disappointed when it doesn&apos;t outperform
                  a plain search.
                </p>
                <p>
                  The shift that actually moves the needle isn&apos;t technical. It&apos;s
                  managerial. Multi-agent orchestration is not a stack decision. It&apos;s a hiring
                  decision applied at machine speed. The people who already know how to hire well —
                  the agency CEOs, the CMOs running cross-functional teams — have a head start they
                  have not realised they have.
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
                  I call this <strong>Equal Opportunity for Agents</strong>. The principle: every
                  agent in a pipeline gets the same three things any elite hire would get on day
                  one.
                </p>
                <ol className="rt-tuit__list">
                  <li>
                    <strong>Precise instruction.</strong> Not a prompt. A brief: outcomes,
                    constraints, what good looks like, what failure looks like, two or three
                    concrete examples of work to model on.
                  </li>
                  <li>
                    <strong>Clear boundaries.</strong> What the agent owns and what it must
                    escalate. The escalation pathway is half the briefing. (You wouldn&apos;t hire
                    a junior analyst and tell them &quot;do anything, decide on your own when to
                    flag.&quot; Yet that&apos;s what most AI agent setups look like in 2026.)
                  </li>
                  <li>
                    <strong>Outcome-oriented expectations.</strong> A measurable result, an
                    explicit time horizon, a single accountable downstream human. Without those
                    three, the agent is a recommendation engine. With them, it&apos;s a teammate
                    with a paper trail.
                  </li>
                </ol>
                <p>
                  I run a mental check in real conversations: if I removed the word &quot;AI&quot;
                  from the brief and handed it to a smart twenty-three-year-old new hire, would
                  they have enough to start? If yes, the agent will probably perform. If no, no
                  model will fix it.
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
                  This is the part of agent design I&apos;m still figuring out. The frameworks
                  above are pulled from my own kitchen — half from reading Karpathy, half from
                  three weekends of trying to break my own pipelines on a Pi5 named hermes. None of
                  it survives contact with a real CFO meeting without iteration, and that is
                  exactly the point.
                </p>
                <p>
                  If you&apos;re designing the agent layer for your organisation, I&apos;d love to
                  compare notes.
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
