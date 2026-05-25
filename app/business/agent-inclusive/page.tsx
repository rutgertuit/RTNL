import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Article, buildArticleLd } from "@/components/article/Article";

const TITLE = "Agent Inclusive";
const DESCRIPTION =
  "Org change runs at twelve to eighteen months. The model that lands in production next quarter is six weeks away. You cannot wait for the reorg to finish before you start integrating AI — you have to build the team so that an agentic teammate can sit down on day one. Notes on what that actually looks like.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
};

const ld = buildArticleLd({
  slug: "agent-inclusive",
  title: TITLE,
  description: DESCRIPTION,
  datePublished: "2026-05-23",
});

export default function AgentInclusivePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Article
        number="03 / 03"
        filedUnder="Leadership · Org Design"
        title="Agent Inclusive."
        readTime="13 min read"
        publishedLabel="May 2026"
        stages={[
          {
            num: "01",
            label: "Anecdotal hook",
            children: (
              <>
                <p className="lead">
                  I told a colleague over coffee last week that I was thinking about starting an
                  Employee Representative Group for AI agents.
                </p>
                <p>
                  I said it as a joke. She laughed in exactly the way the joke required. We moved
                  on, we talked about other things, the coffee got cold. And then the line
                  refused to leave my head for the next three days.
                </p>
                <p>
                  It stuck because, underneath the corporate irony, there was a piece of
                  architecture peeking out that I couldn&apos;t quite let go of. I had recently
                  taken on a role with broader scope, and my first obsession was the obvious one
                  for anyone who is reorganising teams: how do I design the scaffolding that
                  gives every single person in this team the absolute freedom to perform at their
                  actual ceiling? I had the whiteboard. I had the lines of communication. I had
                  the responsibilities matrix. I had it all laid out the way you would expect.
                </p>
                <p>
                  And while I was drawing those lines, one phrase kept looping in my head in a
                  way I have learned to take seriously:
                </p>
                <p>
                  <em>This organisation needs to be designed Agent Inclusive.</em>
                </p>
                <p>
                  That is what wouldn&apos;t go away. Not &quot;AI-enabled.&quot; Not
                  &quot;AI-augmented.&quot; Agent Inclusive. As in: when the next member of this
                  team walks in and is not human, the scaffolding needs to absorb that without
                  flinching.
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
                  The reason that line stuck is a piece of arithmetic that almost no enterprise
                  has internalised yet.
                </p>
                <p>
                  Organisational transformation moves slowly. Even when it is executed unusually
                  well — clear mandate, real budget, top-tier change practice — shifting human
                  culture, realigning business units, and stabilising new ways of working takes
                  somewhere between twelve and eighteen months in the average enterprise.
                  McKinsey will tell you that, on the back end of those programmes, 70% of them
                  still miss their stated strategic objectives by the time they are formally
                  declared done. Bain will tell you that even the successful ones produce a 41%
                  productivity drop in the twelve months following the change — what the
                  literature now calls &quot;survivor syndrome&quot; — plus a 15 to 20% voluntary
                  attrition rate among the top performers you most needed to keep. That is the
                  speed and that is the cost of moving humans around an org chart.
                </p>
                <p>
                  Now look at the other side of the velocity equation. Frontier AI models are
                  now shipping major iterations roughly every six weeks. Five major versions in
                  the last seven months. Context windows doubling. Reasoning cost falling an
                  order of magnitude per quarter. The tooling around them — orchestration
                  frameworks, agent runtimes, retrieval architectures — is moving faster than
                  that.
                </p>
                <p>
                  That means a fully professional twelve-month reorganisation, started today,
                  will be ending against the eighth or ninth major model release since it began.
                  The structure you so carefully designed will be obsolete on the day it
                  stabilises.
                </p>
                <p>
                  If you wait for your organisational transformation to be finished before you
                  start thinking seriously about how to integrate AI into how the team actually
                  operates, you are designing for a world that will already be three generations
                  in the past.
                </p>
                <p>
                  The conclusion I have landed on is the uncomfortable one. You cannot treat AI
                  as a software integration that gets plugged into a team after the team is
                  built. You have to build the team in a way that an agentic teammate can walk
                  in, sit down on day one, and contribute without anybody having to translate
                  the room for it.
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
                  So how do you actually build an Agent Inclusive organisation? In my experience
                  it is not a software-buying exercise, even though it almost always shows up on
                  the agenda as one. It is two operating-model upgrades, and you can start both
                  of them this week.
                </p>
                <p>
                  <strong>1. Wage war on interpersonal vagueness.</strong>
                </p>
                <p>
                  Every organisation I have ever joined has pockets of operation that run
                  entirely on tribal chemistry. Two or three people who have worked together for
                  so long that they have stopped writing things down, because they &quot;just
                  know how it goes.&quot; We tend to romanticise this as institutional memory.
                  In reality, it is a structural liability — and the research is brutally
                  specific about the cost.
                </p>
                <p>
                  The average enterprise knowledge worker, per IDC and McKinsey, spends 30% of
                  their workday — about 2.5 hours — searching for information they need to do
                  their job. Forty-seven percent of digital workers report that they struggle to
                  find data inside their own organisation. The retrieval tax compounds: a new
                  hire in an unstructured environment takes six to eight months to reach
                  baseline productivity, against three to four months when the same role has a
                  clean, codified set of standard operating procedures. Twenty percent of new
                  hires leave inside the first ninety days when the onboarding environment is
                  unstructured, at an average replacement cost of just under eleven thousand
                  euros each. Structured documentation programmes improve retention on the same
                  role by 82%.
                </p>
                <p>
                  There is a name in the literature for what this adds up to. It is called the
                  &quot;fifth employee&quot; phenomenon: every team of five effectively operates
                  with four, because one full-time equivalent of capacity is permanently
                  consumed by searching, asking around, and reconstructing context that should
                  already exist as a sentence somewhere a human or a model could find it.
                </p>
                <p>
                  That same friction, when an agent encounters it, is not a tax. It is a brick
                  wall. An agent cannot read the unwritten political room. It cannot ask the
                  senior colleague over lunch what the team actually means by &quot;Q3
                  priorities.&quot; It cannot interpret the slide deck whose author left the
                  company eighteen months ago.
                </p>
                <p>
                  So the first move is unglamorous and concrete. Translate ambiguous corporate
                  language into explicit goals, precise timings, and crystal-clear priorities.
                  Treat internal documentation not as decorative slide decks for stakeholder
                  management, but as the source code of how the team actually works.
                  Standardise the format on clean Markdown. The technical reason is that
                  Markdown is now the format your future agentic teammates will read most
                  efficiently — 68 to 87% fewer tokens than the equivalent HTML, 20 to 30% lower
                  inference cost in retrieval-augmented pipelines, and roughly 35% higher
                  retrieval accuracy in the RAG benchmarks. The human reason is that the
                  discipline of writing Markdown forces you to strip away visual decoration and
                  state what you actually mean.
                </p>
                <p>
                  For the human-facing surface, render that same Markdown back into clean HTML
                  so your team can read it without what Harvard Business Review has started
                  calling &quot;AI brain fry&quot; — 19% greater information overload, 33% more
                  decision fatigue, 9% drop in focused work when humans are forced to consume
                  raw machine output for hours. Markdown for the backend. HTML for the eyes.
                  One source of truth on both sides.
                </p>
                <p>
                  <strong>2. Turn PDPs into build-plans.</strong>
                </p>
                <p>
                  The second move is more personal, and I think more important.
                </p>
                <p>
                  We need to change how we treat human development inside the organisation.
                  Personal Development Plans are, in most enterprises I have seen, an HR ritual.
                  Generic competencies. Vague growth statements. A 1-to-5 rating against a
                  leadership framework someone wrote in 2014. They are written to be auditable,
                  not to be useful.
                </p>
                <p>
                  If we are serious about Agent Inclusive teams, the PDP needs to look like the
                  technical build-plan we already write for any serious agentic system. When we
                  design an agentic workflow, we specify the input boundaries, the architectural
                  pattern, the operational guardrails, the success criteria, the expected output
                  shape, and the escalation conditions. We are precise about it because we have
                  to be — vagueness in any of those fields will silently break the system
                  weeks later.
                </p>
                <p>
                  The argument I am making is that our human top talent deserves the same
                  precision. State the exact role they are growing into. State the inputs they
                  will have. State the guardrails they are allowed to operate inside. State the
                  output the organisation expects from them at the end of the next two quarters,
                  in the same level of detail you would specify for an agent. Treat human
                  development the way you would treat a build-plan for the most important
                  system in the company — because, very practically, that is what it is.
                </p>
                <p>
                  The point is not to dehumanise the PDP. The point is to take it seriously
                  enough to be honest. When you give someone that level of clarity about what is
                  being asked of them, you also give them the clean runway they need to use the
                  agentic tools around them as a force multiplier rather than a vague threat to
                  their job.
                </p>
              </>
            ),
          },
          {
            num: "+",
            label: "Play the article",
            children: (
              <aside className="rt-tuit__sim-callout">
                <div className="eyebrow eyebrow--warm">PLAY THE ARTICLE</div>
                <p>
                  There&apos;s a turn-based sim of every claim in this piece. You start with a
                  consultancy, 30 turns, a $25B valuation target, and four people. Bankruptcy
                  is a real option.
                </p>
                <Link href="/technical/agent-game" className="button button--warm">
                  Open the Agent Inclusive Sim <span aria-hidden>→</span>
                </Link>
              </aside>
            ),
          },
          {
            num: "04",
            label: "Invitation to growth",
            children: (
              <>
                <p>
                  Building an Agent Inclusive team is not about replacing the human element. It
                  is about clearing the friction that has been quietly suffocating the human
                  element for years.
                </p>
                <p>
                  When the documentation is written cleanly, your senior people stop spending
                  30% of their week answering questions they have already answered four times.
                  When the PDPs become build-plans, your top talent stops wondering whether they
                  are being graded on a rubric nobody can articulate. When the team&apos;s
                  source files are treated as actual source files, the next agent you bring in
                  does not need a six-month integration project — it can read the room on day
                  one.
                </p>
                <p>
                  The strange and slightly counter-intuitive consequence of this is that the
                  most rigorously Agent Inclusive organisation I can design is also the most
                  rigorously human-respectful one. The clarity is the gift. The agent just
                  happens to need the same gift the senior human in seat 1A has always quietly
                  needed and rarely received.
                </p>
                <p>
                  The tools are ready. The pipeline is open. The model that lands in production
                  six weeks from now will be materially better than the one we are working with
                  today, and the one six weeks after that will be better again. The bottleneck
                  is no longer the technology.
                </p>
                <p>
                  Stop waiting for the next reorg to settle. Turn off the defensive playbooks.
                  Clean up the source files. Write the PDP you would actually want to receive.
                  And design the team for the speed of the next twelve months, not the last
                  twelve.
                </p>
                <p>
                  If you are working on this question seriously inside your own organisation —
                  particularly if you have a board that still treats &quot;Agent Inclusive&quot;
                  as marketing language rather than an operating model — drop me a line. I would
                  like to know what you have built.
                </p>
                <p style={{ marginTop: "var(--space-6)", padding: "var(--space-4)", background: "var(--color-bg-surface)", borderLeft: "2px solid var(--color-accent-warm)", fontStyle: "normal" }}>
                  <strong>Interactive Simulation:</strong> There is a working sim of this thesis at <Link href="/technical/agent-game">/technical/agent-game</Link> —
                  survive 30 turns of exponential AI updates and try to hit $100B without falling into the documentation trap. Let me know how far you get.
                </p>
                <p>
                  <em>Let&apos;s build.</em>
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
