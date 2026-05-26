import { describe, expect, it } from "vitest";
import {
  OFFICE_TIERS,
  capacityOf,
  rentOf,
  setupCostOf,
  isOvercapacity,
  overcapacityProductivityPenalty,
  overcapacityLoyaltyDelta,
  nextTier,
} from "../office";

describe("office tiers", () => {
  it("has three tiers in fixed order", () => {
    expect(OFFICE_TIERS).toEqual(["home", "coworking", "kantoorpand"]);
  });

  it("capacity ladder is 4/7/12", () => {
    expect(capacityOf("home")).toBe(4);
    expect(capacityOf("coworking")).toBe(7);
    expect(capacityOf("kantoorpand")).toBe(12);
  });

  it("rent ladder is 4k/14k/32k", () => {
    expect(rentOf("home")).toBe(4_000);
    expect(rentOf("coworking")).toBe(14_000);
    expect(rentOf("kantoorpand")).toBe(32_000);
  });

  it("setup ladder is 30k/80k/180k", () => {
    expect(setupCostOf("home")).toBe(30_000);
    expect(setupCostOf("coworking")).toBe(80_000);
    expect(setupCostOf("kantoorpand")).toBe(180_000);
  });

  it("isOvercapacity", () => {
    expect(isOvercapacity({ headcount: 4, tier: "home" })).toBe(false);
    expect(isOvercapacity({ headcount: 5, tier: "home" })).toBe(true);
  });

  it("overcapacityProductivityPenalty is -15% per excess head", () => {
    expect(overcapacityProductivityPenalty({ headcount: 5, tier: "home" })).toBeCloseTo(-0.15);
    expect(overcapacityProductivityPenalty({ headcount: 7, tier: "home" })).toBeCloseTo(-0.45);
  });

  it("overcapacityLoyaltyDelta is -3/turn flat per overcapacity tick", () => {
    expect(overcapacityLoyaltyDelta({ headcount: 5, tier: "home" })).toBe(-3);
    expect(overcapacityLoyaltyDelta({ headcount: 4, tier: "home" })).toBe(0);
  });

  it("nextTier ladder", () => {
    expect(nextTier("home")).toBe("coworking");
    expect(nextTier("coworking")).toBe("kantoorpand");
    expect(nextTier("kantoorpand")).toBe(null);
  });
});
