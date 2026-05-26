import { describe, expect, it } from "vitest";
import { createRng, type Rng } from "../rng";

describe("createRng", () => {
  it("is deterministic for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    const out = (rng: Rng) => Array.from({ length: 10 }, () => rng.next());
    expect(out(a)).toEqual(out(b));
  });

  it("differs for different seeds", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it("produces values in [0, 1)", () => {
    const rng = createRng(123);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("nextInt is exclusive of max", () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng.nextInt(0, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
    }
  });

  it("pick selects from a non-empty array deterministically", () => {
    const arr = ["a", "b", "c", "d"];
    const fresh = createRng(99);
    expect(fresh.pick(arr)).toBe(createRng(99).pick(arr));
  });

  it("pick throws on empty array", () => {
    expect(() => createRng(0).pick([])).toThrow("Rng.pick: empty array");
  });

  it("shuffle is in-place and deterministic", () => {
    const a = [1, 2, 3, 4, 5];
    const b = [1, 2, 3, 4, 5];
    createRng(13).shuffle(a);
    createRng(13).shuffle(b);
    expect(a).toEqual(b);
    expect(a).toEqual([4, 5, 1, 2, 3]);
  });
});
