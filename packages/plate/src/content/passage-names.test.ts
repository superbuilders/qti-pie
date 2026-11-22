/**
 * The name of each stimulus's tab where an item's stimulus pane holds two or more (`passageName`
 * beside this file), against a table written apart from it: over titles plain, padded, broken over
 * lines, tabbed and blank, at every place among one to twelve stimuli:
 *
 * - **titled:** a tab is named by its stimulus's title, its ASCII whitespace collapsed, a run one
 *   space and none at either end;
 * - **placed:** a tab whose title is blank is named "Passage n", n its place from 1, so no tab is
 *   nameless.
 *
 * Kills: a naming that keeps the title's whitespace as written, one that names a blank title's tab
 * by nothing, and one that numbers places from 0 are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { passageName } from "#plate/content/passage-names.ts";

/**
 * Each title, with the name its tab takes, `{n}` its place.
 */
const titles: readonly (readonly [title: string, name: string])[] = [
  ["The Storm", "The Storm"],
  ["  After\n the   Rain ", "After the Rain"],
  ["\tPoem:\r\nFog\f", "Poem: Fog"],
  ["", "Passage {n}"],
  [" \n\t ", "Passage {n}"],
];

/**
 * Check every property through a naming.
 *
 * @param name The naming.
 * @returns Each broken property's name, with the first title it broke on.
 */
const broken = (name: typeof passageName): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();

  for (const [title, expected] of titles) {
    for (let n = 1; n <= 12; n += 1) {
      const found = name(title, n, "en");
      const wanted = expected.replace("{n}", String(n));
      const property = expected.includes("{n}") ? "placed" : "titled";

      if (found !== wanted && !breaks.has(property)) {
        breaks.set(property, `${JSON.stringify(title)} at ${String(n)}: ${JSON.stringify(found)}`);
      }
    }
  }

  return breaks;
};

describe("the name of a stimulus's tab", () => {
  it("names a tab by its title, collapsed, or by its place where the title is blank", () => {
    assert.deepStrictEqual(Object.fromEntries(broken(passageName)), {});
  });

  it.each([
    [
      "the title's whitespace kept",
      "titled",
      ((title, n, locale) =>
        title.trim() === "" ? passageName(title, n, locale) : title) satisfies typeof passageName,
    ],
    [
      "a blank title's tab named by nothing",
      "placed",
      ((title, n, locale) =>
        title.trim() === "" ? "" : passageName(title, n, locale)) satisfies typeof passageName,
    ],
    [
      "places numbered from 0",
      "placed",
      ((title, n, locale) => passageName(title, n - 1, locale)) satisfies typeof passageName,
    ],
  ] as const)("refuses a mutant: %s (%s)", (_name, property, name) => {
    assert.include([...broken(name).keys()], property);
  });
});
