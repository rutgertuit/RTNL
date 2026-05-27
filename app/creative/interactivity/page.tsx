import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Article, buildArticleLd } from "@/components/article/Article";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Interactivity is the new explanation.";
const DESCRIPTION =
  "Slides are static. Diagrams are static. The thing you are trying to explain — a system, a workflow, a way of thinking with AI — is not. The fastest path from 'I don't get it' to 'oh, like that' is to let someone touch the idea. Three modes, three examples, none of them slides.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
};

const ld = buildArticleLd({
  slug: "creative/interactivity",
  title: TITLE,
  description: DESCRIPTION,
  datePublished: "2026-05-27",
});

export default function InteractivityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: "Creative", href: "/#creative" },
          { label: "Interactivity" },
        ]}
      />
      <Article
        section="CREATIVE"
        number="04 / 04"
        filedUnder="Creative · Method"
        title="Interactivity is the new explanation."
        readTime="6 min read"
        publishedLabel="May 2026"
        stages={[
          {
            num: "01",
            label: "Anecdotal hook",
            image: {
              src: "/assets/creative/interactivity/01.jpeg",
              alt: "Desk-and-tinkering illustration — soldering iron, half-disassembled keyboard, a monitor in the corner with a half-finished prototype. Warm rim light, fading to black.",
            },
            children: (
              <>
                <p className="lead">
                  When I try to explain something new to someone who doesn&apos;t already
                  half-believe it, I have stopped reaching for slides. I open something
                  they can press.
                </p>
                <p>
                  The instinct used to be to write the deck. Find a metaphor, build the
                  diagram, narrate the diagram, watch the eyes glaze. The thing you were
                  describing — a system, a workflow, a way of thinking with AI — is not
                  static. The deck is. So you spend the meeting translating between the
                  two and lose half the room in the translation tax.
                </p>
                <p>
                  The shortcut, when it works, is to skip the translation and let the
                  person <em>touch the idea</em>. Not a demo of the thing — a small,
                  honest, runnable version of the thing. Five minutes of clicking is
                  worth thirty of explaining.
                </p>
                <p>
                  Three modes I keep coming back to, with the examples that taught me each
                  one.
                </p>
              </>
            ),
          },
          {
            num: "02",
            label: "Conceptual swing — Investigation",
            image: {
              src: "/assets/creative/interactivity/02.jpeg",
              alt: "Magnifying glass over a graph of nodes and connections, half lit, with one node circled in warm light. Detective-vs-archive aesthetic.",
            },
            children: (
              <>
                <p>
                  <strong>The first mode is investigation.</strong> You give the audience
                  a question and a thread to pull. They follow the thread. They notice
                  things you wouldn&apos;t have pointed out.
                </p>
                <p>
                  The category-defining example here is{" "}
                  <strong>Luminary</strong> — the deep-research agent class that runs
                  open-ended discovery on your behalf, surfaces the receipts, and lets you
                  steer mid-flight. Used well, it is less a search engine and more a
                  research apprentice who keeps asking <em>"and what about this?"</em>{" "}
                  until you stop them. The interactivity is the steering. You explain the
                  concept of agentic research by handing someone the steering wheel for
                  thirty seconds, not by drawing the architecture diagram.
                </p>
                <p>
                  Out-of-the-box deep-research agents sit in the same lineage — Perplexity
                  Pro&apos;s research mode, Gemini Deep Research, ChatGPT&apos;s deep
                  research, You.com&apos;s research mode. Different vendors, same shape:
                  the agent pulls, you nudge, the conversation is the interface.
                </p>
                <p>
                  When you want someone to feel <em>why</em> agent-driven research is not
                  just &quot;a longer Google&quot;, you don&apos;t describe the loop. You
                  let them prompt one of these tools with a question they actually care
                  about and watch their face change at minute three.
                </p>
              </>
            ),
          },
          {
            num: "03",
            label: "Conceptual swing — Structuring",
            image: {
              src: "/assets/creative/interactivity/03.jpeg",
              alt: "A jumbled stack of paper documents being pulled into a clean tree of nodes by faint lines of warm light. Library-meets-mindmap aesthetic.",
            },
            children: (
              <>
                <p>
                  <strong>The second mode is structuring.</strong> You bring chaos —
                  notes, transcripts, PDFs, your own half-finished thinking — and the
                  tool gives you back shape. The aha-moment is realising the shape was
                  always in there.
                </p>
                <p>
                  The clearest demo of this right now is <strong>NotebookLM</strong>.
                  Drop seven scattered sources in, click a button, and you get a
                  conversational tour of what they collectively say, plus a 12-minute
                  audio &quot;podcast&quot; of two hosts arguing about your material. The
                  audio version is the gateway drug. People who have never read your deck
                  will listen to a two-host AI argument about your deck on their morning
                  walk.
                </p>
                <p>
                  But the deeper move is the structuring itself. NotebookLM (and the
                  category around it — Cursor for code, Granola for meetings, Mem for
                  notes) lets the user manipulate a corpus they actually own, instead of
                  reading a generic essay about &quot;the future of knowledge work&quot;.
                  Five minutes inside one of these tools with your own notes is a better
                  explanation of LLM-as-structurer than any keynote about it.
                </p>
                <p>
                  When I want to land the idea that AI is more useful as a{" "}
                  <em>structuring partner</em> than as an oracle, I open NotebookLM and we
                  load it with the customer&apos;s own deck.
                </p>
              </>
            ),
          },
          {
            num: "04",
            label: "Framework solution — Creation",
            image: {
              src: "/assets/creative/interactivity/04.jpeg",
              alt: "A workbench scattered with prototypes — a paused video frame, a glowing radio dial, two CRT monitors showing pixel art. Maker's-studio aesthetic.",
            },
            children: (
              <>
                <p>
                  <strong>The third mode is creation.</strong> The audience doesn&apos;t
                  just investigate or structure. They make. They press &quot;render&quot;,
                  or &quot;play&quot;, or &quot;next turn&quot;, and a thing comes out.
                  Their thing.
                </p>
                <p>
                  This site is itself a long argument for that mode. Four examples
                  available right here:
                </p>
                <ul>
                  <li>
                    <strong>
                      <Link href="/business/thirty-minute-kitchen">
                        The 30-Minute Marketing Kitchen
                      </Link>
                    </strong>{" "}
                    — a hosted video walkthrough where you watch a complete creative
                    asset get assembled in real time from a single prompt set. The
                    interactivity here is restraint: every clip is generated, every line
                    is prompted, nothing is touched up. The artefact is the proof.
                  </li>
                  <li>
                    <strong>
                      <Link href="/business/multiplier-myth">
                        The Multiplier Myth (with podcast)
                      </Link>
                    </strong>{" "}
                    — same essay in two formats. Read it, or hit the orange{" "}
                    <em>Listen to podcast version</em> CTA in the meta line and a
                    NotebookLM-style two-host conversation about the piece slides up.
                    Same thinking, two interaction modes, the reader picks. Try this on{" "}
                    the rest of the vision pieces too — same affordance.
                  </li>
                  <li>
                    <strong>
                      <Link href="/technical/agent-game">
                        The Agent Inclusive Sim
                      </Link>
                    </strong>{" "}
                    — a turn-based, Windows-95-skinned corporate-resource game built to
                    make the &quot;documentation discipline saves your humans from the AI
                    wave&quot; thesis from{" "}
                    <Link href="/business/agent-inclusive">Agent Inclusive</Link>{" "}
                    playable. You can lose. Most people do, the first run. That is the
                    point.
                  </li>
                  <li>
                    <strong>
                      <Link href="/creative/boardroom-game">
                        Snoek &amp; Partners — Boardroom Sim
                      </Link>
                    </strong>{" "}
                    — a second mini-game, this one a Dutch ad-agency roguelite. Run a
                    Zuidas boutique, survive thirty weeks of satire, watch a chaos engine
                    decide whether the harpoon incident reaches Adformatie. The argument:
                    every domain has its own absurd edge cases, and a satirical mini-sim
                    is the fastest way to teach the shape of an industry to someone who
                    only sees the org chart.
                  </li>
                </ul>
                <p>
                  Each of those is the same trick. You replace the slide that explains
                  the thing with the smallest playable version of the thing. The reader
                  stops being a reader and starts being a player. The argument lands
                  through their hands instead of their eyes.
                </p>
              </>
            ),
          },
          {
            num: "05",
            label: "Invitation to growth",
            children: (
              <>
                <p>
                  The reason I keep building these is that they are the cheapest possible
                  proof. A deck about AI takes ten slides and twenty minutes to land
                  halfway. A live tool — even a deliberately scrappy one — lands in two
                  clicks.
                </p>
                <p>
                  The tax is real: you have to actually build it, you have to maintain
                  it, you have to write the prompt set that produces it. But the
                  alternative is a slide deck that ages out of date faster than the
                  thing it describes. Every model release ages every slide. None of them
                  age the playable.
                </p>
                <p>
                  Next time you have a concept that won&apos;t land with words, ask: what
                  is the smallest interactive thing I could put in front of this person?{" "}
                  <em>Investigate</em>: hand them a research agent and one good question.{" "}
                  <em>Structure</em>: load their own notes into NotebookLM and let them
                  scroll.{" "}
                  <em>Create</em>: open a sim, generate a clip, ship a tiny game.
                </p>
                <p>
                  Then watch where their attention actually goes. That is the lesson the
                  deck was supposed to deliver. The interactive one just delivers it
                  faster.
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
