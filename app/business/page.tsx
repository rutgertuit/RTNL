import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Business & Leadership";
const DESCRIPTION =
  "Three pieces from the day side of the desk. AI, leadership, marketing — read in any order.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — Rutger Tuit`,
    description: DESCRIPTION,
    type: "website",
    url: "https://rutgertuit.nl/business",
  },
};

const ARTICLES = [
  {
    slug: "multiplier-myth",
    title: "The Multiplier Myth",
    minutes: 13,
    tags: "AI · Leadership",
    blurb: "The boardroom mistake that turns a multiplier into a margin-chop.",
  },
  {
    slug: "thirty-minute-kitchen",
    title: "The 30-Minute Kitchen",
    minutes: 12,
    tags: "Marketing · Operations",
    blurb: "How a CMO's calendar gets to feel like a Michelin kitchen — and what to do about it.",
  },
  {
    slug: "agent-inclusive",
    title: "Agent Inclusive",
    minutes: 13,
    tags: "Leadership · Org Design",
    blurb: "Structure your documentation and your PDPs so your human employees survive AI-native operations.",
  },
];

export default function BusinessIndex() {
  return (
    <>
      <Nav />
      <Breadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: "Business & Leadership" },
        ]}
      />
      <main className="rt-business-index">
        <div className="container">
          <header className="rt-business-index__head">
            <div className="eyebrow eyebrow--warm">BUSINESS &amp; LEADERSHIP</div>
            <h1 className="rt-business-index__title">
              Three pieces from the day side of the desk.
            </h1>
            <p className="rt-business-index__lead">{DESCRIPTION}</p>
          </header>
          <ul className="rt-business-index__list">
            {ARTICLES.map((a) => (
              <li key={a.slug} className="rt-business-index__item">
                <Link href={`/business/${a.slug}`}>
                  <h2>{a.title}</h2>
                  <p className="rt-business-index__blurb">{a.blurb}</p>
                  <p className="rt-business-index__meta">
                    {a.minutes} MIN · {a.tags.toUpperCase()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
      <AppChrome />
    </>
  );
}
