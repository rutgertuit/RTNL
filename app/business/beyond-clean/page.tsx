import type { Metadata } from "next";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Article, buildArticleLd } from "@/components/article/Article";

const TITLE = "Beyond clean, toward activated";
const DESCRIPTION =
  "Clean data is old-news ambition. The harder question is whether the data actually changes a decision before the meeting ends — and where in the organisation that decision gets made.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
};

const ld = buildArticleLd({
  slug: "beyond-clean",
  title: TITLE,
  description: DESCRIPTION,
  datePublished: "2026-05-01",
});

export default function BeyondCleanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Article
        number="02 / 03"
        filedUnder="Data · Enterprise"
        title="Beyond clean, toward activated."
        readTime="14 min read"
        publishedLabel="May 2026"
        stages={[
          {
            num: "01",
            label: "Anecdotal hook",
            children: (
              <>
                <p className="lead">
                  A CMO once told me their data warehouse was the cleanest it had ever been. I
                  asked her what decision the data had changed that week. She paused, and said:{" "}
                  <em>honestly? Probably none of the ones that needed changing.</em>
                </p>
                <p>
                  That sentence has stayed with me. The data was clean. The dashboards were green.
                  The strategy meeting still happened mostly on instinct, and the things people
                  changed were the things they were going to change anyway.
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
                  Clean data was the 2018 ambition. Most marketing teams have spent five years
                  catching up to that bar — properly tagged events, deduped customer IDs, a single
                  source of truth for revenue. It was real work and it mattered. By 2026 it is
                  also, quietly, the table stakes.
                </p>
                <p>
                  The harder question isn&apos;t whether your data is clean. It&apos;s whether your
                  data <em>activates</em> — whether it actually changes a decision before the
                  meeting ends, in the workflow where the decision lives, by the person accountable
                  for it. That&apos;s a totally different problem. Clean data is an engineering
                  problem. Activated data is an organisational design problem.
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
                  I look for three signals in marketing organisations to judge whether their data
                  is genuinely activated.
                </p>
                <ol className="rt-tuit__list">
                  <li>
                    <strong>The decision-maker can see it without asking anyone.</strong> Not
                    &quot;I logged into Looker and built a query.&quot; A glanceable surface — a
                    daily card, an inbox digest, a Slack alert — that arrives where the decision
                    happens. If your media buyer has to context-switch into a BI tool to know
                    whether to keep spending, the data isn&apos;t activated. It&apos;s filed.
                  </li>
                  <li>
                    <strong>It has a default action attached.</strong> Activated data doesn&apos;t
                    just describe what&apos;s happening; it suggests what to do next. The
                    recommendation can be wrong — that&apos;s fine. What matters is that the data
                    carries the question forward instead of stopping at the chart.
                  </li>
                  <li>
                    <strong>There is an explicit owner for the next step.</strong> The trap I see
                    most often: rich data, beautiful dashboards, no human whose job is to act on a
                    specific metric falling below threshold. Activated data has a person attached.
                    Without one, the data is decoration.
                  </li>
                </ol>
                <p>
                  If a marketing team can name the human downstream of every key metric, and that
                  human has a default action wired up, they&apos;re activated. If they can&apos;t,
                  they&apos;re clean. The two aren&apos;t the same. Clean is a foundation.
                  Activated is a different floor of the building.
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
                  The teams I see making the activated leap are also the ones that hire one
                  operations person whose entire job is the gap between dashboard and decision.
                  Sometimes the title is Marketing Ops, sometimes RevOps, sometimes (in my
                  favourite version) just <em>the person who closes the loops.</em>
                </p>
                <p>
                  Whatever you call them, they&apos;re the structural fix. If you&apos;re in the
                  middle of this, I&apos;d genuinely love to know what worked.
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
