/**
 * Seedable 32-bit PRNG (mulberry32). Period ~4 billion, fast, deterministic.
 *
 * We need this because the game reducer uses Math.random() in multiple sites
 * (deck shuffle, hire archetype pick, corporate event pick). Without a
 * seedable RNG the headless sim can't reproduce or compare runs, and the
 * undo feature can't replay a turn faithfully.
 */
export interface Rng {
  /** Next uniform random in [0, 1). */
  next(): number;
  /** Integer in [min, max). */
  nextInt(min: number, max: number): number;
  /** Pick a random element from a non-empty array. */
  pick<T>(arr: readonly T[]): T;
  /** Fisher-Yates in-place shuffle. */
  shuffle<T>(arr: T[]): T[];
}

export function createRng(seed: number): Rng {
  // mulberry32 — 32-bit state, multiplicative-add hash mix
  // Ref: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
  let s = seed >>> 0;
  const next = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    nextInt(min, max) {
      return min + Math.floor(next() * (max - min));
    },
    pick(arr) {
      if (arr.length === 0) throw new Error("Rng.pick: empty array");
      return arr[Math.floor(next() * arr.length)]!;
    },
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
      }
      return arr;
    },
  };
}
