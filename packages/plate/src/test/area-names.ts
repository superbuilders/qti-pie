/**
 * The rule a graphic interaction's area names are held to (`namedAreasOf` in
 * `#plate/interactions/area-names.ts`), written apart from it, and the walk that holds a naming to
 * it: plate's own in the property (`#plate/interactions/area-names.test.ts`), and each kill's
 * mutant copy in a program of its own.
 *
 * @module
 */
import { Option } from "effect";
import type { namedAreasOf } from "#plate/interactions/area-names.ts";

/**
 * What a walk takes: the naming under test, plate's or a mutant copy's.
 */
export interface Subject {
  readonly namedAreasOf: typeof namedAreasOf;
}

/**
 * Every list of `n` places, each named by the author or not.
 *
 * @param n How many places.
 * @returns Every list, each place `true` where the author named it.
 */
const patterns = (n: number): readonly (readonly boolean[])[] =>
  n === 0
    ? [[]]
    : patterns(n - 1).flatMap((rest) => [
        [false, ...rest],
        [true, ...rest],
      ]);

/**
 * Name the areas of one pattern by the rule: the author's name and not `unnamed` where the author
 * named the area, else the catalog's English "Area n of count" and `unnamed`; the identifier passes
 * and the catalog does not.
 *
 * @param named The pattern, each place `true` where the author named it.
 * @returns Each area as the rule names it.
 */
const ruleOf = (named: readonly boolean[]) =>
  named.map((authored, at) => ({
    identifier: `H${String(at + 1)}`,
    label: authored
      ? `Named ${String(at + 1)}`
      : `Area ${String(at + 1)} of ${String(named.length)}`,
    unnamed: !authored,
  }));

/**
 * Walk every pattern of named and unnamed areas, up to six, and give the first whose names differ
 * from the rule's.
 *
 * @param subject The naming under test.
 * @returns The first disagreement, as JSON, or undefined when there is none.
 */
export const walkNames = (subject: Subject): string | undefined =>
  [1, 2, 3, 4, 5, 6]
    .flatMap((count) => patterns(count))
    .flatMap((named) => {
      const areas = named.map((authored, at) => ({
        catalog: Option.some(`catalog-${String(at + 1)}`),
        identifier: `H${String(at + 1)}`,
        label: authored ? Option.some(`Named ${String(at + 1)}`) : Option.none(),
      }));
      const shown = subject.namedAreasOf(areas, "en");
      const rule = ruleOf(named);

      return JSON.stringify(shown) === JSON.stringify(rule)
        ? []
        : [JSON.stringify({ named, rule, shown })];
    })
    .at(0);
