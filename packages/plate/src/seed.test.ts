/**
 * The seeds a decision's one seed derives: each item's shuffle and processing seeds, apart and
 * stable, and a stage's order, which an item leaving the stage leaves otherwise as it was.
 */
import { assert, describe, it } from "@effect/vitest";
import { itemSeeds, stageOrder } from "#plate/seed.ts";

/**
 * A decision's seed.
 */
const decision = "3f9c0a1be47d52c6908e1f2a7b3d4c5e";

describe("itemSeeds", () => {
  it("gives two seeds of 64 hex digits, apart from each other and from another item's, the same every call", () => {
    const seeds = itemSeeds(decision, { identifier: "q1", package: "pilot" });
    const other = itemSeeds(decision, { identifier: "q2", package: "pilot" });
    const elsewhere = itemSeeds(decision, { identifier: "q1", package: "shadow" });

    assert.match(seeds.shuffle, /^[0-9a-f]{64}$/u);
    assert.match(seeds.processing, /^[0-9a-f]{64}$/u);
    assert.notStrictEqual(seeds.shuffle, seeds.processing);
    assert.deepStrictEqual(itemSeeds(decision, { identifier: "q1", package: "pilot" }), seeds);
    assert.notDeepEqual(other, seeds);
    assert.notDeepEqual(elsewhere, seeds);
    assert.notDeepEqual(itemSeeds("another", { identifier: "q1", package: "pilot" }), seeds);
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
