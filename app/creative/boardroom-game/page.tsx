import type { Metadata } from "next";
import Link from "next/link";

const TITLE = "Snoek & Partners — Boardroom Sim";
const DESCRIPTION =
  "A Dutch ad-agency roguelite. Run a Zuidas boutique, survive thirty weeks of chaos, and avoid bankruptcy with a team that lunches three hours and bills four. A second mini-game on rutgertuit.nl — built to show what 'interactivity as explanation' can feel like at full satirical tilt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — Rutger Tuit`,
    description: DESCRIPTION,
    type: "website",
    url: "https://rutgertuit.nl/creative/boardroom-game",
  },
};

const gameLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: TITLE,
  description: DESCRIPTION,
  applicationCategory: "GameApplication",
  operatingSystem: "Any (browser)",
  inLanguage: "nl",
  author: { "@id": "https://rutgertuit.nl/#person" },
};

export default function BoardroomGamePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameLd) }}
      />
      <main
        style={{
          background: "#000",
          color: "#f2eee5",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: 11,
            letterSpacing: "0.08em",
            flexShrink: 0,
            height: 34,
            boxSizing: "border-box",
          }}
        >
          <Link
            href="/creative"
            style={{
              color: "#f2eee5",
              textDecoration: "none",
              display: "inline-flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span aria-hidden>←</span> <span>rt.nl / creative</span>
          </Link>
          <span style={{ opacity: 0.55 }}>
            BOARDROOM SIM · NL · DUTCH AD-AGENCY ROGUELITE
          </span>
          <Link
            href="/creative/interactivity"
            style={{
              color: "#f2eee5",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            About this experiment →
          </Link>
        </header>
        {/* The iframe gets the full remaining viewport (100dvh - header), and
            a min-height tall enough that the game's dashboard fits without
            cropping on shorter screens. `scrolling="auto"` is the default in
            modern browsers but set explicitly here so older clients also see
            the in-frame scrollbar when content overflows. */}
        <iframe
          src="/boardroom-game/index.html"
          title="Snoek & Partners — Dutch ad-agency simulator"
          scrolling="auto"
          style={{
            border: 0,
            display: "block",
            width: "100%",
            height: "calc(100dvh - 34px)",
            minHeight: 760,
            background: "#008080",
          }}
          allow="fullscreen"
        />
      </main>
    </>
  );
}
