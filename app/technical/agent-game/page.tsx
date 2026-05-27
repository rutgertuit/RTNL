import type { Metadata } from "next";
import AgentGameClient from "./AgentGameClient";

const TITLE = "Agent Inclusive Sim";
const DESCRIPTION =
  "Interactive turn-based corporate resource simulator. Survive 30 turns of exponential AI updates and reach a $100B valuation. Fulfill the thesis: structure your documentation and PDPs so your team thrives alongside their AI teammates.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — Rutger Tuit`,
    description: DESCRIPTION,
    type: "website",
    url: "https://rutgertuit.nl/technical/agent-game",
  },
};

const gameLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Agent Inclusive Sim",
  "operatingSystem": "Any",
  "applicationCategory": "GameApplication",
  "description": DESCRIPTION,
  "author": {
    "@type": "Person",
    "name": "Rutger Tuit",
    "url": "https://rutgertuit.nl",
  },
};

export default function AgentGamePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameLd) }}
      />
      <AgentGameClient />
    </>
  );
}
