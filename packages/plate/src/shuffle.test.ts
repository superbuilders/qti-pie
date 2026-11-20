import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { choiceOrder } from "#plate/interactions/choice.ts";
import type { SimpleChoice } from "#plate/model/item.ts";
import { presentedOrder } from "#plate/shuffle.ts";

/**
 * Construct choices `C0`, `C1`, … whose `fixed` follows a pattern.
 *
 * @param fixed For each position, whether its choice is fixed.
 * @returns The choices, in document order.
 */
const choicesOf = (fixed: readonly boolean[]): readonly SimpleChoice[] =>
  fixed.map((each, index) => ({
    catalog: Option.none(),
    content: [],
    fixed: each,
    identifier: `C${index}`,
    templateVisibility: Option.none(),
  }));

/**
 * Read a choice's `fixed`.
 *
 * @param choice The choice.
 * @returns Whether it keeps its document position.
 */
const isFixed = (choice: SimpleChoice): boolean => choice.fixed;

/**
 * Every pattern of fixed and free positions over lists of one to six choices.
 */
const patterns: readonly (readonly boolean[])[] = Array.from(
  { length: 6 },
  (_, index) => index + 1,
).flatMap((length) =>
  Array.from({ length: 2 ** length }, (_, bits) =>
    Array.from({ length }, (_unused, position) => Math.floor(bits / 2 ** position) % 2 === 1),
  ),
);

/**
 * The seeds the cases draw under, the empty one among them.
 */
const seeds: readonly string[] = ["", "7", "seed with spaces"];

/**
 * The sets a shuffle is keyed by: a response alone, and Match's two named sets.
 */
const sets: readonly (readonly [string] | readonly [string, string])[] = [
  ["RESPONSE"],
  ["RESPONSE", "sources"],
  ["RESPONSE", "targets"],
];

/**
 * Give the identifiers of presented choices.
 *
 * @param choices The choices.
 * @returns Their identifiers, in order.
 */
const identifiersOf = (choices: readonly SimpleChoice[]): readonly string[] =>
  choices.map((choice) => choice.identifier);

describe("presentedOrder", () => {
  it("presents a set as a shuffled Choice with the same choices, seed and response does", () => {
    const wrong = patterns.flatMap((fixed) =>
      seeds.flatMap((seed) => {
        const choices = choicesOf(fixed);
        const presented = identifiersOf(presentedOrder(seed, ["RESPONSE"], choices, isFixed));
        const asChoice = choiceOrder({ choices, response: "RESPONSE", shuffle: true }, seed);

        return presented.join(" ") === asChoice.join(" ") ? [] : [{ asChoice, fixed, presented }];
      }),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("gives every choice once, each fixed one at its document position, under any seed and set", () => {
    const wrong = patterns.flatMap((fixed) =>
      seeds.flatMap((seed) =>
        sets.flatMap((set) => {
          const choices = choicesOf(fixed);
          const presented = presentedOrder(seed, set, choices, isFixed);
          const once =
            presented.length === choices.length &&
            new Set(identifiersOf(presented)).size === choices.length;
          const pinned = choices.every(
            (choice, index) => !choice.fixed || presented[index] === choice,
          );

          return once && pinned ? [] : [{ fixed, presented, set }];
        }),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("ranks by identifier, so removing a choice leaves the others' relative order, and document order decides nothing", () => {
    const choices = choicesOf([false, false, false, false, false, false]);
    const wrong = seeds.flatMap((seed) => {
      const presented = identifiersOf(presentedOrder(seed, ["RESPONSE"], choices, isFixed));
      const reversed = identifiersOf(
        presentedOrder(seed, ["RESPONSE"], choices.toReversed(), isFixed),
      );

      return [
        ...choices.flatMap((removed) => {
          const kept = identifiersOf(
            presentedOrder(
              seed,
              ["RESPONSE"],
              choices.filter((choice) => choice !== removed),
              isFixed,
            ),
          );
          const expected = presented.filter((identifier) => identifier !== removed.identifier);

          return kept.join(" ") === expected.join(" ") ? [] : [{ kept, removed, seed }];
        }),
        ...(reversed.join(" ") === presented.join(" ") ? [] : [{ presented, reversed, seed }]),
      ];
    });

    assert.deepStrictEqual(wrong, []);
  });

  it("presents the pinned order of a seed, and over 200 seeds brings each choice first and keys each set apart", () => {
    const choices = choicesOf([false, false, true, false, false]);

    // `printf 'RESPONSE\037C<n>' | openssl dgst -sha256 -hmac plate` ranks C1, C4, C3, C0.
    assert.deepStrictEqual(identifiersOf(presentedOrder("plate", ["RESPONSE"], choices, isFixed)), [
      "C1",
      "C4",
      "C2",
      "C3",
      "C0",
    ]);

    const many = Array.from({ length: 200 }, (_, index) => String(index));
    const firsts = new Set(
      many.map((seed) => presentedOrder(seed, ["RESPONSE"], choices, isFixed)[0]?.identifier ?? ""),
    );

    assert.deepStrictEqual(firsts, new Set(["C0", "C1", "C3", "C4"]));
    assert.isTrue(
      many.some(
        (seed) =>
          identifiersOf(presentedOrder(seed, ["RESPONSE", "sources"], choices, isFixed)).join(
            " ",
          ) !==
          identifiersOf(presentedOrder(seed, ["RESPONSE", "targets"], choices, isFixed)).join(" "),
      ),
    );
  });
});
