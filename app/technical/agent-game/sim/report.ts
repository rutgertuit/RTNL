// ============================================================
// Sim report aggregator — Phase 5a.8
// ============================================================
//
// Takes the flat `SimResult[]` array produced by `run.ts` (one entry per
// seed × difficulty × strategy combination) and groups it into one
// `ReportCell` per (difficulty, strategy) pair with summary stats:
//   - winRate          : fraction of runs where causeOfDeath === "win"
//   - meanFinalValuation, stdevFinalValuation
//   - causeBreakdown   : histogram of cause-of-death buckets
//   - meanLoyalty      : mean of per-run mean human loyalty
//   - meanPeakValuation
//
// NOTE: the plan template referenced `meanCardsPlayed` and
// `meanOfficeUpgrades` on each cell. Those metrics aren't on `SimResult`
// — they depend on phase-5b mechanics we haven't built yet. Dropped here
// on purpose; if they get added back to `SimResult` later this file is
// the place to surface them.

import type { SimResult, CauseOfDeath } from "./headless";

export interface ReportCell {
  difficulty: string;
  strategy: string;
  runs: number;
  winRate: number;
  meanFinalValuation: number;
  stdevFinalValuation: number;
  causeBreakdown: Record<string, number>;
  meanLoyalty: number;
  meanPeakValuation: number;
}

const DIFFICULTY_ORDER: Record<string, number> = {
  boardroom: 0,
  reality: 1,
  zirp: 2,
};

function compareDifficulty(a: string, b: string): number {
  const ai = DIFFICULTY_ORDER[a] ?? 99;
  const bi = DIFFICULTY_ORDER[b] ?? 99;
  if (ai !== bi) return ai - bi;
  return a.localeCompare(b);
}

/**
 * Group `SimResult[]` by (difficulty, strategy) and roll up per-cell stats.
 * Cells are sorted by difficulty (boardroom → reality → zirp) then strategy
 * (alphabetical) for stable Markdown output.
 */
export function aggregate(results: SimResult[]): ReportCell[] {
  const groups = new Map<string, SimResult[]>();
  for (const r of results) {
    const key = `${r.difficulty}::${r.strategy}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(r);
    else groups.set(key, [r]);
  }

  const cells: ReportCell[] = [];
  for (const [key, runs] of groups) {
    const parts = key.split("::");
    const difficulty = parts[0] ?? "";
    const strategy = parts[1] ?? "";
    const n = runs.length;

    const meanFinalValuation =
      runs.reduce((s, r) => s + r.finalValuation, 0) / n;
    const variance =
      runs.reduce(
        (s, r) => s + (r.finalValuation - meanFinalValuation) ** 2,
        0,
      ) / n;
    const stdevFinalValuation = Math.sqrt(variance);
    const wins = runs.filter((r) => r.causeOfDeath === "win").length;
    const winRate = wins / n;
    const meanLoyalty = runs.reduce((s, r) => s + r.meanLoyalty, 0) / n;
    const meanPeakValuation =
      runs.reduce((s, r) => s + r.peakValuation, 0) / n;

    const causeBreakdown: Record<string, number> = {};
    for (const r of runs) {
      causeBreakdown[r.causeOfDeath] = (causeBreakdown[r.causeOfDeath] ?? 0) + 1;
    }

    cells.push({
      difficulty,
      strategy,
      runs: n,
      winRate,
      meanFinalValuation,
      stdevFinalValuation,
      causeBreakdown,
      meanLoyalty,
      meanPeakValuation,
    });
  }

  cells.sort((a, b) => {
    const d = compareDifficulty(a.difficulty, b.difficulty);
    if (d !== 0) return d;
    return a.strategy.localeCompare(b.strategy);
  });

  return cells;
}

function formatValuation(v: number): string {
  // $X.YYB — valuations are in raw dollars, win threshold is $1B.
  const billions = v / 1_000_000_000;
  const sign = billions < 0 ? "-" : "";
  return `${sign}$${Math.abs(billions).toFixed(2)}B`;
}

function topCause(breakdown: Record<string, number>): string {
  let best: { cause: string; n: number } | null = null;
  for (const [cause, n] of Object.entries(breakdown)) {
    if (best === null || n > best.n) best = { cause, n };
  }
  return best ? `${best.cause} (${best.n})` : "—";
}

/**
 * Render the report cells as a Markdown document with a single sortable
 * table. Header reflects the day the run was kicked off.
 */
export function formatMarkdown(cells: ReportCell[]): string {
  const totalRuns = cells.reduce((s, c) => s + c.runs, 0);
  const difficulties = Array.from(new Set(cells.map((c) => c.difficulty)));
  const strategies = Array.from(new Set(cells.map((c) => c.strategy)));
  const date = new Date().toISOString().slice(0, 10);

  const lines: string[] = [];
  lines.push(`# Sim baseline — ${date}`);
  lines.push("");
  lines.push(
    `Total runs: ${totalRuns} • Difficulties: ${difficulties.join(", ")} • Strategies: ${strategies.join(", ")}`,
  );
  lines.push("");
  lines.push(
    "| Difficulty | Strategy | Runs | Win % | Mean final valuation | Stdev | Top cause | Mean loyalty | Mean peak val |",
  );
  lines.push(
    "| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |",
  );
  for (const c of cells) {
    lines.push(
      `| ${c.difficulty} | ${c.strategy} | ${c.runs} | ${(c.winRate * 100).toFixed(1)}% | ${formatValuation(c.meanFinalValuation)} | ${formatValuation(c.stdevFinalValuation)} | ${topCause(c.causeBreakdown)} | ${Math.round(c.meanLoyalty)} | ${formatValuation(c.meanPeakValuation)} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

export type { CauseOfDeath };
