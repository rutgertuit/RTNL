import type { Metadata } from "next";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Article, buildArticleLd } from "@/components/article/Article";
import { PodcastTab } from "@/components/podcast-player/PodcastTab";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "The Multiplier Myth";
const DESCRIPTION =
  "Senior leaders are treating the biggest civilisational multiplier we've ever built as a tool for chopping margin. History punishes the cost-cutters. Notes on the inversion and the boardroom move that follows.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
};

const ld = buildArticleLd({
  slug: "multiplier-myth",
  title: TITLE,
  description: DESCRIPTION,
  datePublished: "2026-05-23",
});

export default function MultiplierMythPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb trail={[
        { label: "Home", href: "/" },
        { label: "Business & Leadership", href: "/business" },
        { label: "The Multiplier Myth" },
      ]} />
      <PodcastTab
        src="/audio/multiplier-myth-ep02.mp3"
        title="The Multiplier Myth — a conversation."
        eyebrow="EP 02 · 5:30 LISTEN"
        subtitle="With Maya, who is allergic to corporate spirituality."
        duration="5:30"
        tabLabel="LISTEN · 5:30"
      >
        <h3 className="rt-podcast-tab__essay-title">How this was made</h3>
        <p>
          Everything you&apos;re about to hear was made by AI, except the
          human approving each step. The article above came first — three
          weeks of thinking — then a language model wrote the dialog from
          it using two character system prompts.
        </p>
        <p>
          Maya&apos;s prompt was the interesting one: I fed the model a
          four-thousand-word sociolinguistic analysis of West-Frisian humour
          (<em>relativeren</em>, antonymic deadpan, the regional aversion
          to <em>verbeelding</em>) and told it her job was to deflate me
          whenever I drift toward manifesto. The voices are ElevenLabs
          clones — fixed random seed per speaker so consecutive lines
          don&apos;t drift accent.
        </p>
        <p>
          The pipeline (parse the script, call the ElevenLabs REST API
          per line, ffmpeg-master to −16 LUFS) is a Python script another
          AI wrote.
        </p>
        <ul className="rt-podcast-tab__stack" aria-label="Time economics">
          <li>
            <strong>~3 weeks</strong>
            <span>article — thinking</span>
          </li>
          <li>
            <strong>~2 hours</strong>
            <span>pipeline — once</span>
          </li>
          <li>
            <strong>~20 min</strong>
            <span>each episode after</span>
          </li>
        </ul>
        <p className="rt-podcast-tab__essay-foot">
          The multiplier from the article above, operating on itself.
        </p>
      </PodcastTab>
      <Article
        number="01 / 03"
        filedUnder="AI · Leadership"
        title="The Multiplier Myth."
        readTime="13 min read"
        publishedLabel="May 2026"
        podcast={{ label: "Listen to podcast version" }}
        stages={[
          {
            num: "01",
            label: "Anecdotal hook",
            image: {
              src: "/assets/business/multiplier-myth/01.jpeg",
              alt: "Vintage rotary telephone half-buried in fibre-optic cables, lit by a single warm Rotterdam-brick rust light, fading to absolute black.",
            },
            children: (
              <>
                <p className="lead">
                  The thing you are sitting in front of right now is a forty-year-old logistics
                  network pretending to be a workspace.
                </p>
                <p>
                  A mouse to point. A keyboard to spell out words. A screen to render them back.
                  Underneath that: a stack of standards — TCP/IP, browser engines, window managers,
                  file formats, drag-and-drop protocols — that the world has spent trillions of
                  dollars building, layer over layer, since roughly 1985.
                </p>
                <p>
                  The single job of all that infrastructure is unglamorous when you say it out
                  loud. Take a messy idea inside one person&apos;s head. Funnel it through a
                  sequence of brittle physical and software protocols. Push it across an undersea
                  cable. Unpack it on the other side into an identical setup so another
                  person&apos;s head can read it back.
                </p>
                <p>
                  We have treated that round-trip as the peak of modern efficiency. It is not. It
                  is an extraordinary high-friction detour, and we accepted it for forty years
                  because we couldn&apos;t see anything else. The mouse and the menu and the
                  export-as-PDF were the cheapest way we had to move an idea from one head to
                  another. We had no choice but to slow our thinking down to the speed of the
                  interface.
                </p>
                <p>That is what is about to change. And almost nobody in the boardroom is reading
                  the change correctly.
                </p>
              </>
            ),
          },
          {
            num: "02",
            label: "Conceptual swing",
            image: {
              src: "/assets/business/multiplier-myth/02.jpeg",
              alt: "An arched doorway cut into a black brick wall, filled with thick brass-coloured smoke, lit by a single warm light.",
            },
            children: (
              <>
                <p>
                  What generative models are doing to that stack is not adding a new layer. They
                  are quietly collapsing it.
                </p>
                <p>
                  The interface is becoming the intent. The thing you used to type out — &quot;open
                  the spreadsheet, filter column C by region, pivot, export to PDF, attach to
                  email&quot; — is becoming the single sentence you say to an agent that
                  understands what each of those words means. Forty years of UI design compressed
                  into a brief that reads the way you would brief a junior colleague over coffee.
                </p>
                <p>
                  That is a curious local event happening on your desk. Zoom out from the desk and
                  it is a much bigger one.
                </p>
                <p>
                  Every previous technology revolution in human history extended one specific
                  capability we already had. The wheel extended our legs. The lever extended our
                  arms. The book extended our memory. The telegraph extended our voice. The
                  internet extended our reach to each other. Each of them moved one specific wall
                  a little further out, and each time it did, life-saving breakthroughs scaled and
                  the bottom half of the income distribution moved up.
                </p>
                <p>
                  The wall that generative AI is moving is different in kind. Every previous tool
                  extended a thing we already had — a muscle, a sense, an existing form of memory.
                  Generative models are extending something we never had enough of in the first
                  place: the capacity to hold many complex variables at once. Our cognitive
                  bandwidth.
                </p>
                <p>
                  That sounds abstract until you make it concrete. It is the reason a CMO
                  can&apos;t actually run a thousand campaigns in their head. It is the reason a
                  clinical researcher can&apos;t read every paper in their field. It is the reason
                  a founder can&apos;t model what happens to their P&amp;L if three things shift
                  simultaneously. The bottleneck that wall represents is not a muscle and not a
                  memory; it is the limit of how many things one human can be paying attention to
                  at the same time. And that bottleneck is, for the first time in human history,
                  going up for sale.
                </p>
              </>
            ),
          },
          {
            num: "03",
            label: "Framework solution",
            image: {
              src: "/assets/business/multiplier-myth/03.jpeg",
              alt: "An industrial guillotine blade hovering over a glowing brass multiplication sign in dark space, foundry aesthetic.",
            },
            children: (
              <>
                <p>
                  This is where the boardroom miscalculation happens, and it happens almost
                  universally.
                </p>
                <p>
                  I sit in a lot of meetings where senior leaders are looking at this shift through
                  the narrowest possible lens — the spreadsheet. They are treating a cognitive
                  multiplier as a margin-chopper. The first question they ask is &quot;how many
                  headcount hours can this save me in Q3?&quot; rather than &quot;what new market
                  can my people now reach that they couldn&apos;t last year?&quot;
                </p>
                <p>
                  That single question reorientation — multiplier vs. margin — is, in my read, the
                  single most expensive strategic mistake of the next ten years. And the
                  uncomfortable thing is that the evidence is sitting in plain sight, in three
                  different waves of technology, all telling the same story.
                </p>
                <p>
                  <strong>The ATM was supposed to eliminate bank tellers.</strong> Between the late
                  1980s and 2010, roughly 400,000 ATMs were installed across the United States. The
                  average number of tellers per branch did fall — from about 20 down to 13. But the
                  banks that read the shift correctly did not pocket the savings. They responded to
                  the lower per-branch overhead by expanding their physical branch footprint by 43%,
                  aggressively going after regional market share. Total teller employment went
                  <em>up</em>, from roughly 500,000 to nearly 600,000. The ATM did not kill the
                  teller. It collapsed the unit cost of branch operations, and the winners used
                  that compression to expand the surface area of their business.
                </p>
                <p>
                  <strong>The spreadsheet was supposed to eliminate bookkeepers.</strong> It did —
                  about 900,000 fewer routine clerical roles between 1990 and 2015. But during the
                  same window, financial managers, analysts, and accountants who used the same tool
                  to do something <em>larger</em> grew at roughly 3% annually. The spreadsheet did
                  not shrink the financial industry. It expanded what counted as financial work,
                  and the market for strategic financial analysis followed.
                </p>
                <p>
                  <strong>The current AI cycle is the same dynamic on faster compounding.</strong>{" "}
                  The most useful data point I keep coming back to is from the PwC 2026 AI
                  Performance Study: 74% of the total economic value being generated by AI right
                  now is being captured by 20% of organisations. The leaders in that cohort are 2.6
                  times more likely than their peers to use AI to reinvent their core business
                  model, twice as likely to redesign operational workflows, and 2.8 times more
                  likely to increase the volume of decisions executed autonomously inside a real
                  governance frame. They are not optimising the horse. They are building a
                  different vehicle.
                </p>
                <p>
                  The Gartner data is the warning shot for everyone running the defensive
                  playbook. When an AI deployment is targeted at individual task efficiency — the
                  &quot;everyday AI&quot; frame — the measured productivity leakage runs between 10%
                  and 30% in tightly coordinated cases, and up to 69% in uncoordinated ones.
                  Translation: most of the time savings get eaten by administrative friction before
                  they hit the P&amp;L. CFOs in those deployments report headcount reductions in
                  the 0–3% range. The savings story largely doesn&apos;t show up.
                </p>
                <p>
                  The risk story, on the other hand, does show up. Air Canada was ordered to pay
                  damages after its customer-service chatbot invented a bereavement refund policy
                  that didn&apos;t exist. DPD pulled its chatbot offline when screenshots of it
                  swearing at a customer reached 1.3 million viewers. The Commonwealth Bank of
                  Australia reversed 45 customer-service layoffs because the automation was
                  producing systemic operational failures. The pattern is unambiguous: pure
                  cost-cutting AI deployments produce small savings, big tail risks, and zero
                  structural advantage.
                </p>
                <p>
                  The pattern that works is structurally different. McKinsey tracked 80 global
                  commercial banks from 2018 to 2022. Digital leaders — the ones treating digital
                  infrastructure as a growth platform rather than a cost-saving project —
                  delivered 8.1% annual total shareholder return against 4.9% for digital laggards.
                  They grew retail revenue at +0.8% annually while laggards lost −1.4%. They
                  expanded their share of digital sales from 40% to 70%; laggards moved from 8% to
                  17%. Same technology. Same five years. Completely different outcomes — entirely a
                  function of whether leadership read the shift as a margin-chop or a market
                  expansion.
                </p>
                <p>
                  This is what I mean by the <strong>Multiplier Mandate.</strong> The job of
                  senior leadership in 2026 is not to count the hours an agent saves. It is to
                  count the markets the team can now enter because the cognitive bandwidth
                  constraint has finally moved. The brief becomes: what would we go after if the
                  limiting factor was not how many things our best people could hold in their heads
                  at the same time? Because that limit, for the first time in human history, is no
                  longer the limit.
                </p>
                <p>
                  Treating that shift as an OpEx exercise is like treating the automobile as a way
                  to save 10% on horse feed. It is technically not wrong. It is missing the entire
                  point.
                </p>
              </>
            ),
          },
          {
            num: "04",
            label: "Invitation to growth",
            image: {
              src: "/assets/business/multiplier-myth/04.jpeg",
              alt: "An empty antique leather chair at the head of a long dark conference table, single bare bulb above, room fading to black.",
            },
            children: (
              <>
                <p>
                  There is a thing senior leaders say to me, often in private after the formal
                  meeting is over, that I find more interesting than what they say on stage. They
                  say the market is slowing. They say the customer is harder to reach. They say
                  transformation is taking too long. They complain about industry gridlock.
                </p>
                <p>
                  I want to say this gently, because most of the people I&apos;m thinking about as
                  I write are people I respect and would happily disagree with over a drink. If
                  your organisation&apos;s AI strategy is built primarily on automating cost out of
                  the bottom line, <em>you are not stuck in the traffic jam. You are the traffic
                  jam.</em> The stagnation is not coming from the technology — the technology is
                  moving faster than it has in any of our working lifetimes. It is coming from the
                  limits of corporate imagination at the top of the org chart.
                </p>
                <p>
                  The good news is that this is the easiest of the constraints to remove. It does
                  not require new infrastructure, new headcount, or another six-figure consulting
                  engagement. It requires one decision, made at board level, to stop optimising the
                  horse.
                </p>
                <p>
                  If you are working on a serious version of this question inside your own
                  organisation, I would genuinely like to compare notes. The frameworks above are
                  mine, but they only survive contact with a real boardroom once they have been
                  pressure-tested against the specific constraints of a specific business. Drop me
                  a line — I will not pitch you anything. I would just like to know what is
                  actually working.
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
