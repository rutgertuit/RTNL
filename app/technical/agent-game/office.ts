export type OfficeTier = "home" | "coworking" | "kantoorpand";

export const OFFICE_TIERS: readonly OfficeTier[] = ["home", "coworking", "kantoorpand"] as const;

const TIER_CONFIG: Record<OfficeTier, { capacity: number; rent: number; setup: number }> = {
  home: { capacity: 4, rent: 4_000, setup: 30_000 },
  coworking: { capacity: 7, rent: 14_000, setup: 80_000 },
  kantoorpand: { capacity: 12, rent: 32_000, setup: 180_000 },
};

export const capacityOf = (t: OfficeTier): number => TIER_CONFIG[t].capacity;
export const rentOf = (t: OfficeTier): number => TIER_CONFIG[t].rent;
export const setupCostOf = (t: OfficeTier): number => TIER_CONFIG[t].setup;

export interface CapacityCheck {
  headcount: number;
  tier: OfficeTier;
}

export function isOvercapacity({ headcount, tier }: CapacityCheck): boolean {
  return headcount > capacityOf(tier);
}

export function overcapacityProductivityPenalty(c: CapacityCheck): number {
  const excess = Math.max(0, c.headcount - capacityOf(c.tier));
  return -0.15 * excess;
}

export function overcapacityLoyaltyDelta(c: CapacityCheck): number {
  return isOvercapacity(c) ? -3 : 0;
}

export function nextTier(t: OfficeTier): OfficeTier | null {
  const i = OFFICE_TIERS.indexOf(t);
  return i < OFFICE_TIERS.length - 1 ? (OFFICE_TIERS[i + 1] ?? null) : null;
}
