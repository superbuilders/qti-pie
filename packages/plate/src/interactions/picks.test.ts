/**
 * A picks group's rule, how many options a child picks (`picksOf`), over every binding a Choice
 * holds (a `single` response, or a `multiple` one of `max-choices` 0 to 8):
 *
 * - **one:** a `single` response, or a `max-choices` of 1;
 * - **any:** a `max-choices` of 0, QTI's word for no limit;
 * - **at most n:** a `max-choices` of n, 2 or more.
 *
 * Kills: a rule that gives one pick to every group, one that counts a limit of two or more as one,
 * and one that reads 0 as a limit, are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { picksOf } from "#plate/interactions/picks.ts";
import type { Picks } from "#plate/interactions/picks.ts";

/**
 * Every binding a Choice holds, with the picks QTI gives it (information model 5.30.2).
 */
const bindings: readonly {
  readonly binding: { readonly cardinality: "multiple" | "single"; readonly maxChoices: bigint };
  readonly picks: Picks;
}[] = [
  { binding: { cardinality: "single", maxChoices: 1n }, picks: { kind: "one" } },
  ...Array.from({ length: 9 }, (_, n) => ({
    binding: { cardinality: "multiple" as const, maxChoices: BigInt(n) },
    picks: ((): Picks => {
      if (n === 0) {
        return { kind: "any" };
      }

      return n === 1 ? { kind: "one" } : { kind: "at-most", n };
    })(),
  })),
];

/**
 * List the bindings a rule reads wrong.
 *
 * @param rule The rule.
 * @returns Each binding's cardinality and `max-choices`, as written, that it reads wrong.
 */
const misread = (rule: typeof picksOf): readonly string[] =>
  bindings.flatMap(({ binding, picks }) => {
    const read = rule(binding);

    return JSON.stringify(read) === JSON.stringify(picks)
      ? []
      : [`${binding.cardinality} ${String(binding.maxChoices)}: ${JSON.stringify(read)}`];
  });

describe("a picks group's picks", () => {
  it("is one for a single response or a max-choices of 1, any for 0, at most n for n from 2", () => {
    assert.deepStrictEqual(misread(picksOf), []);
  });

  it.each([
    ["one pick for every group", (): Picks => ({ kind: "one" })],
    [
      "a limit of some counted as one",
      (binding: Parameters<typeof picksOf>[0]): Picks =>
        binding.maxChoices === 0n ? { kind: "any" } : { kind: "one" },
    ],
    [
      "0 read as a limit",
      (binding: Parameters<typeof picksOf>[0]): Picks =>
        binding.cardinality === "single" || binding.maxChoices === 1n
          ? { kind: "one" }
          : { kind: "at-most", n: Number(binding.maxChoices) },
    ],
  ] as const)("refuses a mutant: %s", (_name, rule) => {
    assert.isNotEmpty(misread(rule));
  });
});
