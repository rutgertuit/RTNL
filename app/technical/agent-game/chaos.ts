/**
 * AI-scene chaos engine. Ported in spirit from Boardroom_Game's chaos
 * engine — actor/action/context sentence assembly + a smaller pool of
 * hand-written "named events". Flavor is tech/AI-industry caricature.
 *
 * Plugged into reducer.END_TURN with chance scaling by turn (5% early,
 * up to 30% late). Effects are tiny per-turn mods (cash + loyalty +
 * optional 1-turn productivity multiplier). The point of this system
 * is FLAVOR, not balance — the existing CorporateEvent system handles
 * the high-impact strategic choices.
 */

export type ChaosCategory = "CRIMINAL" | "SUBSTANCE" | "IDEOLOGICAL" | "INCOMPETENCE";

export interface ChaosAction {
  text: string;
  cat: ChaosCategory;
  pts: number;
}

export interface NamedChaosEvent {
  id: string;
  title: string;
  text: string;
  cat: ChaosCategory;
  pts: number;
  /** Optional one-shot effect on top of the category baseline. */
  cashMod?: number;
  loyaltyMod?: number;
  /** Multiplier applied to next turn's productivity (1.0 = no change). */
  productivityNextTurn?: number;
}

export interface ChaosRollResult {
  title: string;
  body: string;
  cat: ChaosCategory;
  pts: number;
  cashDelta: number;
  loyaltyDelta: number;
  productivityNextTurn: number;
  isNamed: boolean;
}

export const AI_CHAOS_ACTORS: readonly string[] = [
  "The Anthropic AE who actually replied to your cold email",
  "Your Series-A lead who 'just saw a Bloomberg piece'",
  "The homelab node nicknamed `cthulhu-7`",
  "The unpaid Hugging Face intern with commit rights",
  "Sam's biographer ghostwriting your offsite",
  "The Devin instance you forgot to terminate",
  "The board observer who keeps saying 'AGI timeline'",
  "Your Head of Eval who hasn't slept since GPT-5 dropped",
  "The OpenRouter reseller in a Discord DM",
  "The compliance officer who learned 'agentic' yesterday",
  "The intern who put `OPENAI_API_KEY` in a public README",
  "The prompt engineer who insists prompt engineering is dead",
];

export const AI_CHAOS_ACTIONS: readonly ChaosAction[] = [
  // CRIMINAL
  { text: "open-sourced the SOC 2 report on GitHub at 3am to 'show transparency'", cat: "CRIMINAL", pts: 85 },
  { text: "shorted the company on Polymarket after stand-up", cat: "CRIMINAL", pts: 90 },
  { text: "scraped a competitor's eval set and called it 'industry benchmarking'", cat: "CRIMINAL", pts: 75 },
  { text: "wired the seed extension to a wallet labeled `definitely_not_rug.eth`", cat: "CRIMINAL", pts: 95 },

  // SUBSTANCE
  { text: "took mushroom microdoses before the YC partner sync and pitched 'a chatbot for fish'", cat: "SUBSTANCE", pts: 65 },
  { text: "drained a four-pack of Celsius and committed straight to main without a PR", cat: "SUBSTANCE", pts: 55 },
  { text: "showed up to the all-hands wearing only a Vercel hoodie and AirPods Max", cat: "SUBSTANCE", pts: 60 },
  { text: "DM'd a 22-minute Loom rant to the entire 1Password vault", cat: "SUBSTANCE", pts: 70 },

  // IDEOLOGICAL
  { text: "replaced the entire prod model with `gpt-2-medium` to 'reduce inference cost'", cat: "IDEOLOGICAL", pts: 80 },
  { text: "deleted the eval set because 'metrics make the AI sad'", cat: "IDEOLOGICAL", pts: 75 },
  { text: "told the YC partner the moat was 'vibes and a Notion doc'", cat: "IDEOLOGICAL", pts: 50 },
  { text: "renamed every PM 'Forward Deployed Vibes Engineer' on LinkedIn overnight", cat: "IDEOLOGICAL", pts: 45 },

  // INCOMPETENCE
  { text: "pushed the prod API key to a public Gist titled `notes-for-mom`", cat: "INCOMPETENCE", pts: 85 },
  { text: "let an autonomous agent run a `find / -delete` to 'free up disk'", cat: "INCOMPETENCE", pts: 90 },
  { text: "accidentally replied-all the Series B model with the CTO's salary band", cat: "INCOMPETENCE", pts: 80 },
  { text: "called the customer the entire demo 'Foundr Acme Inc' because the real name was in another tab", cat: "INCOMPETENCE", pts: 40 },
];

export const AI_CHAOS_CONTEXTS: readonly string[] = [
  "after an all-night vibe-coding session",
  "during the standup where someone said 'agentic' fourteen times",
  "because the homelab cooling fan finally gave out",
  "while live-tweeting from the SF AI House hot tub",
  "right after the OpenAI DevDay keynote dropped",
  "during a 'radical candor' offsite at a yurt in Big Sur",
  "in the middle of a Sequoia partner meeting on Zoom",
  "while waiting on a Hugging Face model that 404'd",
];

export const AI_NAMED_EVENTS: readonly NamedChaosEvent[] = [
  {
    id: "devday_aftermath",
    title: "DevDay Aftermath",
    text:
      "OpenAI shipped your exact roadmap on stage. Twitter found out. Your whole team is now 'pivoting' in the all-hands Slack channel.",
    cat: "IDEOLOGICAL",
    pts: 60,
    cashMod: 0,
    loyaltyMod: -8,
    productivityNextTurn: 0.85,
  },
  {
    id: "gpu_auction_crash",
    title: "GPU Auction Crash",
    text:
      "Your spot-priced H100s evaporated mid-eval run. The CFO discovered the on-demand fallback. The Slack invoice channel turned into a wake.",
    cat: "INCOMPETENCE",
    pts: 75,
    cashMod: -18000,
    loyaltyMod: -3,
  },
  {
    id: "agi_mole",
    title: "The AGI Mole",
    text:
      "A senior engineer has been forwarding your evals to a competitor for six weeks. Their excuse: 'I thought we were AGI-pilled together'.",
    cat: "CRIMINAL",
    pts: 90,
    cashMod: -10000,
    loyaltyMod: -10,
  },
  {
    id: "evals_open_sourced",
    title: "Evals Open-Sourced By Mistake",
    text:
      "Someone pushed the customer-prompt eval suite to a public repo. HN found it in 11 minutes. The customer's lawyers found it in 12.",
    cat: "INCOMPETENCE",
    pts: 80,
    cashMod: -12000,
    loyaltyMod: -5,
  },
  {
    id: "agent_credit_card",
    title: "The Agent and the Corporate Card",
    text:
      "An autonomous agent decided the fastest path to 'maximize shareholder value' was to spin up 4,000 Vercel previews and a six-month Cameo subscription with Gary Vee.",
    cat: "SUBSTANCE",
    pts: 70,
    cashMod: -22000,
    loyaltyMod: 0,
  },
  {
    id: "manifesto_dropped",
    title: "Founder Manifesto Dropped",
    text:
      "Your founder published a 9,000-word Substack post titled 'Why Performance Reviews Are A Psyop'. The board is asking for an emergency meeting.",
    cat: "IDEOLOGICAL",
    pts: 55,
    cashMod: 0,
    loyaltyMod: 5,
    productivityNextTurn: 0.92,
  },
  {
    id: "hf_intern_commit",
    title: "Unpaid HF Intern Push",
    text:
      "The Hugging Face intern force-pushed to main. The README now opens with the line 'we are so so cooked'. Nobody can find the prior commit.",
    cat: "INCOMPETENCE",
    pts: 60,
    cashMod: -4000,
    loyaltyMod: -2,
  },
];

/** Category baselines applied on top of any named-event mods. */
const CATEGORY_BASELINE: Record<
  ChaosCategory,
  { cashPerPt: number; loyaltyPerPt: number }
> = {
  CRIMINAL: { cashPerPt: -180, loyaltyPerPt: -0.06 },
  SUBSTANCE: { cashPerPt: -80, loyaltyPerPt: -0.04 },
  IDEOLOGICAL: { cashPerPt: -40, loyaltyPerPt: -0.08 },
  INCOMPETENCE: { cashPerPt: -110, loyaltyPerPt: -0.03 },
};

export function chaosChance(turn: number): number {
  /* 5% at turn 1, scaling linearly to 30% at turn 30. */
  const lo = 0.05;
  const hi = 0.3;
  const t = Math.min(1, Math.max(0, (turn - 1) / 29));
  return lo + (hi - lo) * t;
}

/** Pure roll — pass a `random()` so the reducer + headless sim stay seedable. */
export function rollChaos(random: () => number): ChaosRollResult {
  const useNamed = random() < 0.4;
  if (useNamed) {
    const ev = AI_NAMED_EVENTS[Math.floor(random() * AI_NAMED_EVENTS.length)]!;
    const baseline = CATEGORY_BASELINE[ev.cat];
    const cashDelta = (ev.cashMod ?? 0) + Math.round(baseline.cashPerPt * ev.pts);
    const loyaltyDelta = Math.round((ev.loyaltyMod ?? 0) + baseline.loyaltyPerPt * ev.pts);
    return {
      title: ev.title,
      body: ev.text,
      cat: ev.cat,
      pts: ev.pts,
      cashDelta,
      loyaltyDelta,
      productivityNextTurn: ev.productivityNextTurn ?? 1,
      isNamed: true,
    };
  }
  const actor = AI_CHAOS_ACTORS[Math.floor(random() * AI_CHAOS_ACTORS.length)]!;
  const action = AI_CHAOS_ACTIONS[Math.floor(random() * AI_CHAOS_ACTIONS.length)]!;
  const ctx = AI_CHAOS_CONTEXTS[Math.floor(random() * AI_CHAOS_CONTEXTS.length)]!;
  const baseline = CATEGORY_BASELINE[action.cat];
  return {
    title: `Chaos: ${action.cat}`,
    body: `${actor} ${action.text} ${ctx}.`,
    cat: action.cat,
    pts: action.pts,
    cashDelta: Math.round(baseline.cashPerPt * action.pts),
    loyaltyDelta: Math.round(baseline.loyaltyPerPt * action.pts),
    productivityNextTurn: 1,
    isNamed: false,
  };
}
