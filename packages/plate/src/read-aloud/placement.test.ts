/**
 * The read-aloud control that stands before a body node (`spokenBefore` beside this file), against
 * a table written apart from it: over elements and interactions that reference a catalog or none,
 * at every depth a body holds them:
 *
 * - **text:** an element that references a catalog has its catalog's control before it, in the `text`
 *   role, and one that references none has none;
 * - **prompt:** an interaction whose own root references a catalog has that catalog's control before
 *   it, in the `prompt` role, which a chain plays first, as AlphaTest's player showed a question's
 *   prompt clip however the question carried it; one whose root references none has none.
 *
 * Kills: a placement that reads no interaction root's catalog, as plate did before, one that gives
 * a root's control the `text` role, and one that reads no element's catalog are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { BodyElement, RedactedLevel } from "#plate/model/item.ts";
import { spokenBefore } from "#plate/read-aloud/placement.ts";
import { textEntry } from "#plate/test/slotted.ts";

/**
 * The catalogs a node may reference: none, or one of two.
 */
const catalogs = [undefined, "spoken-a", "spoken-b"] as const;

/**
 * An element of the body of each tag a body holds at a flow position, referencing a catalog or
 * none.
 */
const elements: readonly BodyElement<RedactedLevel>[] = [
  "div",
  "p",
  "section",
  "table",
  "ul",
].flatMap((tag) =>
  catalogs.map((catalog): BodyElement<RedactedLevel> => {
    const element: BodyElement<RedactedLevel> = {
      attributes: [],
      children: [{ kind: "text", text: "words" }],
      kind: "element",
      path: tag,
      tag,
    };

    return catalog === undefined ? element : { ...element, catalog };
  }),
);

/**
 * A Text Entry whose root references a catalog or none.
 */
const interactions = catalogs.map((catalog) =>
  textEntry(`R-${String(catalog)}`, Option.none(), Option.fromUndefinedOr(catalog)),
);

/**
 * Check every property through a placement.
 *
 * @param place The placement.
 * @returns Each broken property's name, with the first node it broke on.
 */
const broken = (place: typeof spokenBefore): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();

  for (const element of elements) {
    const expected = element.catalog === undefined ? "none" : `text ${element.catalog}`;
    const found = Option.match(place({ element, kind: "element" }), {
      onNone: () => "none",
      onSome: ({ catalog, role }) => `${role} ${catalog}`,
    });

    if (found !== expected && !breaks.has("text")) {
      breaks.set("text", `a ${element.tag} gave ${found}, not ${expected}`);
    }
  }

  for (const interaction of interactions) {
    const expected = Option.match(interaction.catalog, {
      onNone: () => "none",
      onSome: (catalog) => `prompt ${catalog}`,
    });
    const found = Option.match(place({ interaction, kind: "interaction" }), {
      onNone: () => "none",
      onSome: ({ catalog, role }) => `${role} ${catalog}`,
    });

    if (found !== expected && !breaks.has("prompt")) {
      breaks.set("prompt", `${interaction.response} gave ${found}, not ${expected}`);
    }
  }

  return breaks;
};

describe("the read-aloud control that stands before a body node", () => {
  it("reads an element's catalog as text and an interaction root's as its prompt", () => {
    assert.deepStrictEqual(Object.fromEntries(broken(spokenBefore)), {});
  });

  it.each([
    [
      "no interaction root's catalog read",
      "prompt",
      ((node) =>
        node.kind === "interaction"
          ? Option.none()
          : spokenBefore(node)) satisfies typeof spokenBefore,
    ],
    [
      "a root's control read as text",
      "prompt",
      ((node) =>
        Option.map(spokenBefore(node), (spoken) => ({
          ...spoken,
          role: "text" as const,
        }))) satisfies typeof spokenBefore,
    ],
    [
      "no element's catalog read",
      "text",
      ((node) =>
        node.kind === "element" ? Option.none() : spokenBefore(node)) satisfies typeof spokenBefore,
    ],
  ] as const)("refuses a mutant: %s (%s)", (_name, property, place) => {
    assert.include([...broken(place).keys()], property);
  });
});
