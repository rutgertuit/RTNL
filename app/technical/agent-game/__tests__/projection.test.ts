import { describe, expect, it } from "vitest";
import { createInitialState } from "../reducer";
import { projectAction } from "../projection";

describe("projectAction", () => {
  it("returns a state with the action applied AND END_TURN run", () => {
    const start = createInitialState("reality", 1);
    const projected = projectAction(start, { type: "EMPLOY_WORKER" });

    expect(projected.turn).toBe(start.turn + 1);
    expect(projected.employees.length).toBe(start.employees.length + 1);
  });

  it("does not mutate the caller's state", () => {
    const start = createInitialState("reality", 1);
    const startEmpCount = start.employees.length;
    const startTurn = start.turn;
    const startCash = start.cash;

    projectAction(start, { type: "EMPLOY_WORKER" });

    expect(start.employees.length).toBe(startEmpCount);
    expect(start.turn).toBe(startTurn);
    expect(start.cash).toBe(startCash);
  });

  it("for a rejected action returns the caller's state unchanged", () => {
    const start = { ...createInitialState("zirp", 1), cash: 0 };
    const projected = projectAction(start, { type: "EMPLOY_WORKER" });

    expect(projected).toBe(start);
    expect(projected.employees.length).toBe(start.employees.length);
    expect(projected.turn).toBe(start.turn);
  });

  it("is deterministic — same input yields equal output", () => {
    const start = createInitialState("reality", 42);
    const a = projectAction(start, { type: "EMPLOY_WORKER" });
    const b = projectAction(start, { type: "EMPLOY_WORKER" });

    expect(a).toEqual(b);
  });

  it("projects an UPGRADE_OFFICE action through to the next turn", () => {
    const start = { ...createInitialState("boardroom", 1), officeChosen: true };
    const projected = projectAction(start, { type: "UPGRADE_OFFICE", tier: "coworking" });

    expect(projected.officeTier).toBe("coworking");
    expect(projected.turn).toBe(start.turn + 1);
  });
});
