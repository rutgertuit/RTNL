"use client";

/**
 * NotebookSpotlight — slimmer, plug-ier rewrite of DML's NotebookLM
 * section. Keeps the interactive "stakeholder prompts" generator (the one
 * piece that still teaches the lesson on its own), drops the privacy
 * boilerplate and dated YouTube embed, and reframes the copy as an honest
 * recommendation rather than a tutorial.
 *
 * Two CTAs: Open NotebookLM (free) and Subscribe to Google AI (NotebookLM
 * Plus + Gemini Advanced bundle).
 */

import React, { useState } from "react";

type StakeholderId =
  | "cfo"
  | "cmo"
  | "ceo"
  | "manager"
  | "team"
  | "child"
  | "engineer";

interface Stakeholder {
  id: StakeholderId;
  label: string;
  shortLabel: string;
  prompt: string;
}

const STAKEHOLDERS: Stakeholder[] = [
  {
    id: "cfo",
    label: "The CFO",
    shortLabel: "CFO",
    prompt: `Scan all sources for financial data, projections, and risks.
1. Generate a 3-bullet list of the biggest ROI opportunities.
2. Generate a 3-bullet list of the biggest financial risks.
3. For each of the 6 items, provide the *one* citation that proves it.`,
  },
  {
    id: "cmo",
    label: "The CMO",
    shortLabel: "CMO",
    prompt: `Act as a world-class go-to-market strategist.
1. Find the 3 'killer facts' from the data that we can build a whole campaign around.
2. What's the story here? Write a 50-word narrative hook.
3. Generate 5 click-worthy headlines based on the sources.`,
  },
  {
    id: "ceo",
    label: "The CEO",
    shortLabel: "CEO",
    prompt: `I'm walking into a board meeting in 15 minutes. Scan everything and give me a 3-bullet summary.
1. What's the *one* thing we absolutely must do?
2. What's the *one* thing we must *avoid* at all costs?
3. What's the *one* number that matters most from all this data?`,
  },
  {
    id: "manager",
    label: "The Manager",
    shortLabel: "Manager",
    prompt: `Stop talking strategy, let's make a plan.
1. Convert all insights into a 5-step executable work plan.
2. Assign a 'Directly Responsible Individual' (DRI) category for each (e.g., 'Engineering', 'Marketing').
3. Identify the 3 biggest blockers mentioned in the sources that I need to clear.`,
  },
  {
    id: "team",
    label: "The Team",
    shortLabel: "Team",
    prompt: `Summarise what this means for someone in the daily workflow. No high-level fluff.
1. List 3 ways our daily process will change based on this.
2. Identify 2 'gotchas' or new requirements hidden in the data.
3. Find the single most inspiring quote from a customer interview in the sources.`,
  },
  {
    id: "child",
    label: "The 6-year-old test",
    shortLabel: "6-yo test",
    prompt: `Explain the main idea in these documents like you're talking to a 6-year-old.
1. Use a simple story or analogy (e.g., 'This is like building with LEGOs, and we found a new, super-strong piece...').
2. Don't use any words with more than 3 syllables.`,
  },
  {
    id: "engineer",
    label: "The skeptical engineer",
    shortLabel: "Engineer",
    prompt: `Act as a principal engineer reviewing this data for flaws.
1. Identify the 3 weakest or most poorly supported assumptions.
2. Find any direct contradictions between data in different sources.
3. List the top 5 'magic numbers' or hard-coded assumptions that need to be challenged.
4. Provide all outputs with numbered citations.`,
  },
];

interface FeatureHighlight {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: FeatureHighlight[] = [
  {
    icon: "🎙️",
    title: "Audio Overviews",
    desc: "Two AI hosts host a 10-15 min podcast about your sources. Steerable — tell them what to focus on. Still the gateway drug.",
  },
  {
    icon: "🎬",
    title: "Video Overviews",
    desc: "Same idea, with visuals pulled from the sources. Useful when slides will read it instead of headphones.",
  },
  {
    icon: "🧠",
    title: "Mind Maps",
    desc: "Auto-generated, interactive node graph of how the sources connect. Better than any whiteboard for finding the cluster you missed.",
  },
  {
    icon: "📚",
    title: "Study Guide + Briefing Docs",
    desc: "Structured outputs for either depth (study guide) or speed (one-page briefing). Both keep citations.",
  },
  {
    icon: "🗂️",
    title: "Up to 300 sources (Plus)",
    desc: "Plus tier raises the source cap and lets you save custom personas + audio styles. Worth it once you have more than one notebook you care about.",
  },
  {
    icon: "🔒",
    title: "Sources stay yours",
    desc: "Google does not train on your NotebookLM sources. Confirmed in the product privacy doc. The trust line a lot of teams need to even start.",
  },
];

export function NotebookSpotlight() {
  const [active, setActive] = useState<StakeholderId>("cfo");
  const [copied, setCopied] = useState<StakeholderId | null>(null);

  const activePrompt = STAKEHOLDERS.find((s) => s.id === active)!;

  const handleCopy = (id: StakeholderId, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      window.setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <section className="rt-notebook" id="notebooklm" aria-labelledby="notebook-title">
      <div className="rt-notebook__head">
        <div className="eyebrow eyebrow--warm">EXHIBIT · STRUCTURING</div>
        <h3 id="notebook-title">NotebookLM, honestly.</h3>
        <p className="rt-notebook__lead">
          The tool I open before I open Google Docs. Drop 5–300 sources in,
          ask one question, get a structured answer with the citation under
          every claim. The audio overviews are the trojan horse — the rest
          is what keeps you there.
        </p>
      </div>

      <ul className="rt-notebook__features">
        {FEATURES.map((f) => (
          <li key={f.title} className="rt-notebook__feature">
            <span className="rt-notebook__feature-icon" aria-hidden>
              {f.icon}
            </span>
            <div>
              <strong>{f.title}</strong>
              <p>{f.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="rt-notebook__ctas">
        <a
          className="button button--warm"
          href="https://notebooklm.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open NotebookLM (free) <span aria-hidden>→</span>
        </a>
        <a
          className="button"
          href="https://one.google.com/about/google-ai-plans"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Google AI (NotebookLM Plus + Gemini){" "}
          <span aria-hidden>→</span>
        </a>
      </div>
      <p className="rt-notebook__cta-note">
        NotebookLM Plus is bundled with the <em>Google AI Pro</em> and{" "}
        <em>Google AI Ultra</em> plans — the same subscription that unlocks
        Gemini Advanced in the regular consumer app. One subscription, both
        products.
      </p>

      <div className="rt-notebook__exhibit">
        <div className="rt-notebook__exhibit-head">
          <div className="eyebrow">TRY IT · 7 STAKEHOLDER PROMPTS</div>
          <h4>One notebook, seven points of view.</h4>
          <p>
            Load your sources once. Then ask the same notebook the same
            question through seven different lenses. Copy any of these prompts
            and paste into your own NotebookLM session.
          </p>
        </div>

        <div className="rt-notebook__tabs" role="tablist">
          {STAKEHOLDERS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={active === s.id}
              className={`rt-notebook__tab ${
                active === s.id ? "is-active" : ""
              }`}
              onClick={() => setActive(s.id)}
            >
              {s.shortLabel}
            </button>
          ))}
        </div>

        <div className="rt-notebook__prompt" role="tabpanel">
          <button
            type="button"
            className="rt-notebook__copy"
            onClick={() => handleCopy(activePrompt.id, activePrompt.prompt)}
          >
            {copied === activePrompt.id ? "Copied ✓" : "Copy prompt"}
          </button>
          <div className="rt-notebook__prompt-label">{activePrompt.label}</div>
          <pre>
            <code>{activePrompt.prompt}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
