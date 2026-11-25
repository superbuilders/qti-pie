import { assert } from "@effect/vitest";
import { Effect } from "effect";
import { sizeOf } from "@bjornpagen/testing/enumerate";
import type { Gen } from "@bjornpagen/testing/gen";

/**
 * Hold an exhaustion's box to the number of cases its suite states, counted from the box's
 * generator alone before the box is exhausted.
 *
 * `exhaust` reports the cases it ran, and a replay from `TEST_REPLAY` runs one, so a count read
 * from its result fails every replay. The generator's space is the box however many of its cases
 * run, and a property that draws nothing of its own runs exactly those cases.
 *
 * @param generator - The box's generator.
 * @param cases - The cases the suite states the box holds.
 * @returns Nothing; fails the test when the generator's space holds another number.
 */
export const boxHolds = (generator: Gen<unknown>, cases: number): Effect.Effect<void> =>
  Effect.map(sizeOf(generator), (size) => {
    assert.strictEqual(size, cases, "the cases the box holds");
  });
