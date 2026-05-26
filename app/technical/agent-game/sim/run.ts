// ============================================================
// Sim CLI — Phase 5a.8
// ============================================================
//
// Sweeps every (difficulty × strategy × seed) combination through the
// headless harness and writes an aggregated Markdown report. Used for
// balance baselines and regression deltas when the reducer changes.
//
// Usage:
//   RUNS=1000 npm run sim ../docs/game-sim-baseline-2026-05.md
//
// `Date.now()` is fine here — this is CLI tooling, not game logic, so
// determinism is irrelevant to the wall-clock elapsed log.

import { writeFileSync } from "node:fs";
import { runHeadlessGame, type SimResult } from "./headless";
import { aggregate, formatMarkdown } from "./report";
import * as strategies from "./strategies";

const STRATS = [
  strategies.naiveHire,
  strategies.patientDocs,
  strategies.cardSpammer,
  strategies.okrMaximalist,
  strategies.balanced,
];
const DIFFS = ["boardroom", "reality", "zirp"] as const;

const RUNS = Number(process.env.RUNS ?? 1000);
const OUT = process.argv[2] ?? "sim-report.md";

const startedAt = Date.now();
const results: SimResult[] = [];
for (const diff of DIFFS) {
  for (const strat of STRATS) {
    for (let s = 0; s < RUNS; s++) {
      results.push(runHeadlessGame({ difficulty: diff, seed: s, strategy: strat }));
    }
    process.stderr.write(`${diff}/${strat.name}: ${RUNS} done\n`);
  }
}

const cells = aggregate(results);
const md = formatMarkdown(cells);
writeFileSync(OUT, md);
const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
process.stderr.write(
  `Wrote ${OUT} with ${cells.length} cells from ${results.length} runs in ${elapsed}s.\n`,
);
