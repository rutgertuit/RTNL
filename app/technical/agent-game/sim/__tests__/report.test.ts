import { describe, expect, it } from "vitest";
import { aggregate, formatMarkdown } from "../report";
import type { SimResult } from "../headless";

function mkResult(overrides: Partial<SimResult>): SimResult {
  return {
    seed: 0,
    difficulty: "boardroom",
    strategy: "naiveHire",
    turnsPlayed: 10,
    finalCash: 0,
    finalValuation: 0,
    causeOfDeath: "valuation_miss",
    peakValuation: 0,
    meanLoyalty: 50,
    ...overrides,
  };
}

describe("aggregate", () => {
  it("groups 2 difficulties × 2 strategies into 4 cells", () => {
    const results: SimResult[] = [
      mkResult({ difficulty: "boardroom", strategy: "alpha", causeOfDeath: "win", finalValuation: 1_500_000_000 }),
      mkResult({ difficulty: "boardroom", strategy: "alpha", causeOfDeath: "win", finalValuation: 1_100_000_000 }),
      mkResult({ difficulty: "boardroom", strategy: "beta", causeOfDeath: "bankruptcy", finalValuation: -2_000_000 }),
      mkResult({ difficulty: "reality", strategy: "alpha", causeOfDeath: "valuation_miss", finalValuation: 500_000_000 }),
      mkResult({ difficulty: "reality", strategy: "beta", causeOfDeath: "talent_walkout", finalValuation: 200_000_000 }),
      mkResult({ difficulty: "reality", strategy: "beta", causeOfDeath: "talent_walkout", finalValuation: 300_000_000 }),
    ];

    const cells = aggregate(results);
    expect(cells).toHaveLength(4);

    // boardroom alpha: 2 runs, both wins -> winRate 1.0, mean valuation 1.3B
    const boardroomAlpha = cells.find(
      (c) => c.difficulty === "boardroom" && c.strategy === "alpha",
    );
    expect(boardroomAlpha).toBeDefined();
    expect(boardroomAlpha?.runs).toBe(2);
    expect(boardroomAlpha?.winRate).toBe(1);
    expect(boardroomAlpha?.meanFinalValuation).toBe(1_300_000_000);
    expect(boardroomAlpha?.causeBreakdown.win).toBe(2);

    const realityBeta = cells.find(
      (c) => c.difficulty === "reality" && c.strategy === "beta",
    );
    expect(realityBeta).toBeDefined();
    expect(realityBeta?.runs).toBe(2);
    expect(realityBeta?.winRate).toBe(0);
    expect(realityBeta?.causeBreakdown.talent_walkout).toBe(2);
  });

  it("sorts boardroom before reality", () => {
    const results: SimResult[] = [
      mkResult({ difficulty: "reality", strategy: "alpha" }),
      mkResult({ difficulty: "boardroom", strategy: "alpha" }),
    ];
    const cells = aggregate(results);
    expect(cells[0]?.difficulty).toBe("boardroom");
    expect(cells[1]?.difficulty).toBe("reality");
  });
});

describe("formatMarkdown", () => {
  it("renders header and at least one expected table row", () => {
    const results: SimResult[] = [
      mkResult({
        difficulty: "boardroom",
        strategy: "alpha",
        causeOfDeath: "win",
        finalValuation: 1_500_000_000,
        peakValuation: 1_500_000_000,
        meanLoyalty: 80,
      }),
    ];
    const md = formatMarkdown(aggregate(results));
    expect(md.startsWith("# Sim baseline")).toBe(true);
    expect(md).toContain("| boardroom | alpha | 1 |");
    expect(md).toContain("$1.50B");
    expect(md).toContain("win (1)");
  });
});
