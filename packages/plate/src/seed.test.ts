/**
 * The values a decision's one seed derives: each item's shuffle seed, stable and apart from
 * another item's, and a stage's order, which an item leaving the stage leaves otherwise as it was.
 */
import { assert, describe, it } from "@effect/vitest";
import { shuffleSeed, stageOrder } from "#plate/seed.ts";

/**
 * A decision's seed.
 */
const decision = "3f9c0a1be47d52c6908e1f2a7b3d4c5e";

describe("shuffleSeed", () => {
  it("gives 64 hex digits, apart from another item's, the same every call", () => {
    const seed = shuffleSeed(decision, { identifier: "q1", package: "pilot" });

    assert.match(seed, /^[0-9a-f]{64}$/u);
    assert.strictEqual(shuffleSeed(decision, { identifier: "q1", package: "pilot" }), seed);
    assert.notStrictEqual(shuffleSeed(decision, { identifier: "q2", package: "pilot" }), seed);
    assert.notStrictEqual(shuffleSeed(decision, { identifier: "q1", package: "shadow" }), seed);
    assert.notStrictEqual(shuffleSeed("another", { identifier: "q1", package: "pilot" }), seed);
  });
});

describe("stageOrder", () => {
  it("orders a stage's items by their identity alone, so removing one moves no other", () => {
    const items = ["a", "b", "c", "d", "e", "f"].map((identifier) => ({
      identifier,
      package: "pilot",
    }));
    const ordered = stageOrder(decision, items);
    const without = stageOrder(
      decision,
      items.filter((item) => item.identifier !== "c"),
    );

    assert.sameMembers([...ordered], items);
    assert.deepStrictEqual(stageOrder(decision, items.toReversed()), ordered);
    assert.deepStrictEqual(
      without,
      ordered.filter((item) => item.identifier !== "c"),
    );
  });

  it("orders the same items apart under another decision's seed", () => {
    const items = Array.from({ length: 12 }, (_, at) => ({
      identifier: `q${String(at)}`,
      package: "pilot",
    }));

    assert.notDeepEqual(stageOrder("another", items), stageOrder(decision, items));
  });
});
