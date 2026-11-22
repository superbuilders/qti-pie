/**
 * The options a host has eliminated, by the response they are options of (`eliminatedBy` beside
 * this file): over every list of eliminations a host hands of two responses sharing their options'
 * identifiers, each option eliminated once, twice or not at all, in every order:
 *
 * - **struck:** an option is eliminated of a response exactly where the host handed that response's
 *   entry name with its identifier, so one interaction's cross-out never strikes another's option
 *   of the same identifier;
 * - **absent:** a response none of whose options the host eliminated holds no entry.
 *
 * Kills: a grouping that keys the options by identifier alone, one that keeps only each response's
 * last option, and one that keeps an empty entry for every response it meets are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { eliminatedBy } from "#plate/interactions/eliminated.ts";
import type { EliminatedOption } from "#plate/interactions/eliminated.ts";

/**
 * The entry names of the two responses, and a third the host never names.
 */
const names = ["i.A", "i.B", "i.C"] as const;

/**
 * The identifiers the responses' options share.
 */
const identifiers = ["X", "Y", "Z"] as const;

/**
 * Every option of the first two responses.
 */
const options: readonly EliminatedOption[] = names
  .slice(0, 2)
  .flatMap((name) => identifiers.map((identifier): EliminatedOption => [name, identifier]));

/**
 * Every list a host hands: each subset of the options, in its order and reversed, its first
 * option handed twice where it has one.
 */
const handed: readonly (readonly EliminatedOption[])[] = Array.from(
  { length: 2 ** options.length },
  (_, mask) => options.filter((_option, at) => Math.floor(mask / 2 ** at) % 2 === 1),
).flatMap((subset) => [subset, subset.toReversed(), [...subset, ...subset.slice(0, 1)]]);

/**
 * Check every property through a grouping.
 *
 * @param group The grouping.
 * @returns Each broken property's name, with the first list it broke on.
 */
const broken = (group: typeof eliminatedBy): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();

  for (const value of handed) {
    const grouped = group(value);
    const shown = JSON.stringify(value);

    for (const name of names) {
      for (const identifier of identifiers) {
        const expected = value.some(([n, i]) => n === name && i === identifier);

        if ((grouped.get(name)?.has(identifier) ?? false) !== expected && !breaks.has("struck")) {
          breaks.set("struck", `${shown}: ${name} ${identifier} struck ${String(!expected)}`);
        }
      }

      if (grouped.has(name) !== value.some(([n]) => n === name) && !breaks.has("absent")) {
        breaks.set("absent", `${shown}: ${name} held ${String(grouped.has(name))}`);
      }
    }
  }

  return breaks;
};

describe("the options a host has eliminated", () => {
  it("strikes exactly the options handed, each of its own response", () => {
    assert.deepStrictEqual(Object.fromEntries(broken(eliminatedBy)), {});
  });

  it.each([
    [
      "keyed by identifier alone",
      "struck",
      ((value) => {
        const struck = new Set(value.map(([, identifier]) => identifier));

        return new Map(value.map(([name]) => [name, struck] as const));
      }) satisfies typeof eliminatedBy,
    ],
    [
      "only each response's last option kept",
      "struck",
      ((value) =>
        new Map(
          value.map(([name, identifier]) => [name, new Set([identifier])] as const),
        )) satisfies typeof eliminatedBy,
    ],
    [
      "an empty entry for every response",
      "absent",
      ((value) =>
        new Map([
          ...names.map((name) => [name, new Set<string>()] as const),
          ...eliminatedBy(value),
        ])) satisfies typeof eliminatedBy,
    ],
  ] as const)("refuses a mutant: %s (%s)", (_name, property, group) => {
    assert.include([...broken(group).keys()], property);
  });
});
