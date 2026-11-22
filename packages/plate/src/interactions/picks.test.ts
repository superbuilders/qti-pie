/**
 * A picks group's rules: how many options a child picks (`picksOf`) and the instruction line a host
 * may ask for (`instructionOf`), over every binding a Choice holds (a `single` response, or a
 * `multiple` one of `max-choices` 0 to 8):
 *
 * - **one:** a `single` response, or a `max-choices` of 1, says "Select your answer:";
 * - **many:** a `max-choices` of 0 (no limit) or of 2 or more says "Select all that apply:".
 *
 * Kills: an instruction that says "Select your answer:" for every group, and one that counts a
 * limit of two or more as one, are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { message } from "#plate/messages.ts";
import { instructionOf, picksOf } from "#plate/interactions/picks.ts";
import type { Picks } from "#plate/interactions/picks.ts";

/**
 * Every binding a Choice holds, with whether its child picks exactly one.
 */
const bindings = [
  { binding: { cardinality: "single", maxChoices: 1n }, one: true },
  ...Array.from({ length: 9 }, (_, n) => ({
    binding: { cardinality: "multiple" as const, maxChoices: BigInt(n) },
    one: n === 1,
  })),
] as const;

/**
 * List the bindings an instruction rule words wrong.
 *
 * @param rule The rule.
 * @returns Each binding's `max-choices` and cardinality, as written, that it words wrong.
 */
const misworded = (
  rule: (picks: Picks) => "picksInstructionMany" | "picksInstructionOne",
): readonly string[] =>
  bindings.flatMap(({ binding, one }) => {
    const said = message("en", rule(picksOf(binding)));
    const right = one ? "Select your answer:" : "Select all that apply:";

    return said === right ? [] : [`${binding.cardinality} ${String(binding.maxChoices)}: ${said}`];
  });

describe("a picks group's instruction line", () => {
  it("says Select your answer: where the child picks one, Select all that apply: where more", () => {
    assert.deepStrictEqual(misworded(instructionOf), []);
  });

  it.each([
    ["one line for every group", () => "picksInstructionOne" as const],
    [
      "a limit of some counted as one",
      (picks: Picks) =>
        picks.kind === "any" ? ("picksInstructionMany" as const) : ("picksInstructionOne" as const),
    ],
  ] as const)("refuses a mutant: %s", (_name, rule) => {
    assert.isNotEmpty(misworded(rule));
  });
});
