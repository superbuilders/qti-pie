/**
 * The rule a press on a Hotspot's image is held to (`pressedOf` in `#plate/interactions/picks.ts`),
 * written apart from it, and the walk that holds a press rule to it: plate's own in the property
 * (`#plate/interactions/picks.test.ts`), and each kill's mutant copy in a program of its own.
 *
 * The rule is the product's: a tap on a picked area takes it back, so a single response is NULL
 * again and several lose that one; a tap on another area picks it, in place of the one pick, or
 * beside the picks of several in the order tapped. A limit on several is the picks group's refusal,
 * no part of the press, so `at-most` presses as `any` does.
 *
 * @module
 */
import { isDeepStrictEqual } from "node:util";
import type { pressedOf, Picks } from "#plate/interactions/picks.ts";

/**
 * What a walk takes: the press rule under test, plate's or a mutant copy's.
 */
export interface Subject {
  readonly pressedOf: typeof pressedOf;
}

/**
 * The areas a walk presses.
 */
const areas = ["A", "B", "C"] as const;

/**
 * The kinds a walk presses under: one pick, any number, and at most two.
 */
const kinds: readonly Picks[] = [{ kind: "one" }, { kind: "any" }, { kind: "at-most", n: 2 }];

/**
 * Every sequence of `length` presses on the {@link areas}.
 *
 * @param length How many presses.
 * @returns Every sequence, each press an area.
 */
const sequences = (length: number): readonly (readonly string[])[] =>
  length === 0
    ? [[]]
    : sequences(length - 1).flatMap((rest) => areas.map((area) => [...rest, area]));

/**
 * The picks after each press of a sequence, by the rule: for one pick, none where the press is on
 * the one picked, else that area alone; for several, the pressed area dropped where it is picked,
 * else added after the others.
 *
 * @param picks How many areas the child picks.
 * @param presses The presses, in order.
 * @returns The picks after each press, in order.
 */
const ruleOf = (picks: Picks, presses: readonly string[]): readonly (readonly string[])[] => {
  const states: (readonly string[])[] = [];
  let now: readonly string[] = [];

  for (const area of presses) {
    const held = now.some((each) => each === area);

    if (picks.kind === "one") {
      now = held ? [] : [area];
    } else {
      now = held ? now.filter((each) => each !== area) : [...now, area];
    }

    states.push(now);
  }

  return states;
};

/**
 * The picks after each press of a sequence, by the press rule under test, from no pick.
 *
 * @param subject The press rule under test.
 * @param picks How many areas the child picks.
 * @param presses The presses, in order.
 * @returns The picks after each press, in order.
 */
const shownOf = (
  subject: Subject,
  picks: Picks,
  presses: readonly string[],
): readonly (readonly string[])[] => {
  const states: (readonly string[])[] = [];
  let now: readonly string[] = [];

  for (const area of presses) {
    now = subject.pressedOf(picks, now, area);
    states.push(now);
  }

  return states;
};

/**
 * Walk every sequence of up to five presses on three areas, under one pick, any number and at most
 * two, from no pick, and give the first whose picks after a press differ from the rule's.
 *
 * @param subject The press rule under test.
 * @returns The first disagreement, as JSON, or undefined when there is none.
 */
export const walkPresses = (subject: Subject): string | undefined =>
  kinds
    .flatMap((picks) =>
      [0, 1, 2, 3, 4, 5].flatMap((length) =>
        sequences(length).flatMap((presses) => {
          const rule = ruleOf(picks, presses);
          const shown = shownOf(subject, picks, presses);

          return isDeepStrictEqual(shown, rule)
            ? []
            : [JSON.stringify({ picks, presses, rule, shown })];
        }),
      ),
    )
    .at(0);
