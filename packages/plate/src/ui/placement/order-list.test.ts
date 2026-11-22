/**
 * An order laid out as one numbered list (`#plate/ui/placement/order-list.ts`): over every
 * presented order of up to six choices and every move a sequence board can ask for on it (each swap
 * of two positions, a position emptied, a move that changes nothing), and every response a host can
 * hold (none, a full order, a partial one):
 *
 * - **untouched:** with no response the list shows the presented order, and nothing is posted;
 * - **restored:** a response holding every choice is shown as it is;
 * - **reordered:** a swap posts the full order it leaves, every choice once;
 * - **whole:** a move that leaves a position empty, or changes nothing, posts nothing.
 *
 * Kills: a writing that posts a partial order, one that posts the unmoved order, and one that
 * ignores a restored response are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import type { Sequence } from "#plate/ui/placement/machine.ts";
import { listPlacements, listResponse } from "#plate/ui/placement/order-list.ts";

/**
 * The two rules a list is held to.
 */
interface Rules {
  readonly placements: (
    texts: readonly string[],
    presented: readonly string[],
  ) => readonly string[];
  readonly response: (next: Sequence, shown: readonly string[]) => readonly string[] | undefined;
}

/**
 * Every swap of two positions of a list.
 *
 * @param shown The list.
 * @returns Each list a swap leaves.
 */
const swapsOf = (shown: readonly string[]): readonly (readonly string[])[] =>
  shown.flatMap((first, i) =>
    shown.flatMap((second, j) => (j > i ? [shown.with(i, second).with(j, first)] : [])),
  );

/**
 * Check every property on lists of one to six choices through a pair of rules.
 *
 * @param rules The rules.
 * @returns Each broken property's name, with the first case it broke on.
 */
const broken = (rules: Rules): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();
  const report = (name: string, what: string): void => {
    if (!breaks.has(name)) {
      breaks.set(name, what);
    }
  };

  for (let count = 1; count <= 6; count += 1) {
    const presented = Array.from({ length: count }, (_, index) => `C${String(index)}`);
    const reversed = presented.toReversed();
    const untouched = rules.placements([], presented);

    if (untouched.join(" ") !== presented.join(" ")) {
      report("untouched", `${String(count)} choices show ${untouched.join(" ")}`);
    }

    if (rules.placements(reversed, presented).join(" ") !== reversed.join(" ")) {
      report("restored", `${String(count)} choices restored as ${reversed.join(" ")}`);
    }

    if (
      count > 1 &&
      rules.placements(presented.slice(1), presented).join(" ") !== presented.join(" ")
    ) {
      report("restored", `a partial response replaced the presented order of ${String(count)}`);
    }

    for (const shown of [presented, reversed]) {
      for (const swapped of swapsOf(shown)) {
        const posted = rules.response(swapped, shown);

        if (posted?.join(" ") !== swapped.join(" ")) {
          report(
            "reordered",
            `${shown.join(" ")} → ${swapped.join(" ")} posted ${String(posted?.join(" "))}`,
          );
        }
      }

      for (const [index] of shown.entries()) {
        if (
          rules.response(
            shown.map((chip, at): string | null => (at === index ? null : chip)),
            shown,
          ) !== undefined
        ) {
          report("whole", `a gap at ${String(index)} of ${shown.join(" ")} posted`);
        }
      }

      if (rules.response(shown, shown) !== undefined) {
        report("whole", `the unmoved ${shown.join(" ")} posted`);
      }
    }
  }

  return breaks;
};

/**
 * The rules as plate writes them.
 */
const rules: Rules = { placements: listPlacements, response: listResponse };

describe("an order laid out as one numbered list", () => {
  it("shows the presented order untouched, a restored order as it is, and posts the full order on every reordering move and nothing else", () => {
    assert.deepStrictEqual(Object.fromEntries(broken(rules)), {});
  });

  it.each([
    [
      "a move that empties a position posts the order it leaves",
      "whole",
      {
        ...rules,
        response: (next: Sequence) =>
          next.flatMap((occupant) => (occupant === null ? [] : [occupant])),
      },
    ],
    [
      "the unmoved order posted",
      "whole",
      {
        ...rules,
        response: (next: Sequence) =>
          next.every((occupant) => occupant !== null)
            ? next.flatMap((occupant) => (occupant === null ? [] : [occupant]))
            : undefined,
      },
    ],
    [
      "a restored response ignored",
      "restored",
      { ...rules, placements: (_: readonly string[], presented: readonly string[]) => presented },
    ],
  ] as const)("refuses a mutant: %s (%s)", (_name, property, mutant) => {
    assert.include([...broken(mutant).keys()], property);
  });
});
