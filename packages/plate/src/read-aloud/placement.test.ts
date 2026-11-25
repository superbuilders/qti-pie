/**
 * The read-aloud control that stands before a body node (`spokenBefore` beside this file), against
 * a table written apart from it: over elements and interactions that reference a catalog or none,
 * at every depth a body holds them:
 *
 * - **text:** an element that references a catalog has its catalog's control before it, in the `text`
 *   role, and one that references none has none;
 * - **prompt:** an interaction whose own root references a catalog has that catalog's control before
 *   it, in the `prompt` role, as AlphaTest's player showed a question's prompt clip however the
 *   question carried it; one whose root references none has none.
 *
 * Kills: a placement that reads no interaction root's catalog, as plate did before, one that gives
 * a root's control the `text` role, and one that reads no element's catalog are each refused.
 *
 * And the control an element of an interaction's own content holds after its words
 * (`spokenWithin`), where the content stands outside every control of the interaction, over
 * elements of every kind such content holds, referencing a catalog or none:
 *
 * - **held:** an element that may hold phrasing content and references a catalog holds its catalog's
 *   control, in the `text` role, a slot's label ("least") among them;
 * - **none:** one that references none holds none, and so do a void element, a list's, a table's and
 *   a picture's structure, ruby, a link, a label, a summary, a media element, a closed details or a
 *   template, where a control would break the element or never show, and a gap, which its
 *   interaction draws. The table judges every element of the HTML subset plate writes.
 * - **below:** an element that stands, at any depth, inside an element that bars every control below
 *   it (a link, a label, a summary, a media element, an object, details, a template, ruby or a
 *   picture) holds none, though it may hold phrasing content itself: a `span` in a `label` too, and
 *   a `span` in an `em` in an `a`, given the tags it stands inside as the walk of a run
 *   (`spokenIn`) hands them over.
 *
 * Kills: a placement that holds no control, as plate did before (a label with no play icon), one
 * that puts a control inside a void element or a list, one that puts it inside a link, a label or a
 * media element, one that reads only an element's own tag (a control in a `span` in a `label`),
 * one that reads only its parent's, and one that gives it the `prompt` role.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { BodyElement, RedactedLevel } from "#plate/model/item.ts";
import { spokenBefore, spokenWithin } from "#plate/read-aloud/placement.ts";
import { textEntry } from "#plate/test/slotted.ts";
import { htmlSubset } from "#plate/ui/item/html.ts";

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

/**
 * Each element of the HTML subset plate writes as itself, by its tag, and a gap, and whether it
 * holds a control after its words where it references a catalog: written apart from plate's code,
 * from HTML's content models. It holds one where its content model admits phrasing content in which
 * a `button` acts as itself and shows. It holds none where it holds nothing (a void element); where
 * its children are its structure (a table's, a list's, a picture's) or ruby lays them out (`ruby`,
 * `rb`, `rt`, `rtc`, `rp`); where a button breaks it (`a`, which admits no interactive content;
 * `label`, whose press would press the button; `summary`, whose press opens its `details`); where
 * what it holds does not show (`audio`, `video` and `object`, whose content is their fallback;
 * `details` while closed; `template`); and in a gap, which its interaction draws.
 */
const heldByTag: readonly (readonly [tag: string, holds: boolean])[] = [
  ...[
    "abbr",
    "acronym",
    "address",
    "article",
    "aside",
    "b",
    "bdi",
    "bdo",
    "big",
    "blockquote",
    "caption",
    "cite",
    "code",
    "dd",
    "dfn",
    "div",
    "dt",
    "em",
    "figcaption",
    "figure",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "i",
    "kbd",
    "li",
    "nav",
    "p",
    "pre",
    "q",
    "samp",
    "section",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "td",
    "th",
    "tt",
    "var",
  ].map((tag) => [tag, true] as const),
  ...[
    "a",
    "audio",
    "br",
    "col",
    "colgroup",
    "details",
    "dl",
    "hr",
    "img",
    "label",
    "object",
    "ol",
    "param",
    "picture",
    "qti-gap",
    "rb",
    "rp",
    "rt",
    "rtc",
    "ruby",
    "source",
    "summary",
    "table",
    "tbody",
    "template",
    "tfoot",
    "thead",
    "tr",
    "track",
    "ul",
    "video",
  ].map((tag) => [tag, false] as const),
];

/**
 * An element of an interaction's own content of each kind, referencing a catalog or none, with
 * whether it holds a control.
 */
const contentElements = heldByTag.flatMap(([tag, holds]) =>
  catalogs.map((catalog) => {
    const element: BodyElement<RedactedLevel> = {
      attributes: [],
      children: [{ kind: "text", text: "least" }],
      kind: "element",
      path: tag,
      tag,
    };

    return { element: catalog === undefined ? element : { ...element, catalog }, holds };
  }),
);

/**
 * Each element of the HTML subset plate writes as itself, by its tag, and whether it bars every
 * control below it, at any depth: written apart from plate's code, from HTML's content models. It
 * bars them where a `button` anywhere below it breaks it (`a`, which admits no interactive content
 * descendant; `label`, whose press would press the first labelable element below it; `summary`,
 * whose press opens its `details`), where what it holds does not show (`audio`, `video` and
 * `object`, whose content is their fallback; `details` while closed; `template`), where ruby lays
 * out what it holds (`ruby`, `rb`, `rt`, `rtc`, `rp`), and in a `picture`, which holds only its
 * sources and its image. A table's and a list's structure bar nothing: their cells and items hold
 * phrasing content.
 */
const barredBelowByTag: readonly (readonly [tag: string, bars: boolean])[] = heldByTag
  .filter(([tag]) => tag !== "qti-gap")
  .map(([tag]) => [
    tag,
    [
      "a",
      "audio",
      "details",
      "label",
      "object",
      "picture",
      "rb",
      "rp",
      "rt",
      "rtc",
      "ruby",
      "summary",
      "template",
      "video",
    ].includes(tag),
  ]);

/**
 * A `span` that references a catalog, as a slot's label does: it holds a control where nothing
 * above it bars one.
 */
const labelSpan: BodyElement<RedactedLevel> = {
  attributes: [],
  catalog: "spoken-a",
  children: [{ kind: "text", text: "least" }],
  kind: "element",
  path: "span",
  tag: "span",
};

/**
 * Check the held control's properties through a placement.
 *
 * @param place The placement.
 * @returns Each broken property's name, with the first element it broke on.
 */
const brokenWithin = (place: typeof spokenWithin): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();
  const judge = (
    element: BodyElement<RedactedLevel>,
    within: readonly string[],
    expected: string,
    property: string,
  ): void => {
    const found = Option.match(place(element, within), {
      onNone: () => "none",
      onSome: ({ catalog, role }) => `${role} ${catalog}`,
    });

    if (found !== expected && !breaks.has(property)) {
      breaks.set(
        property,
        `a ${[...within, element.tag].join(" > ")} gave ${found}, not ${expected}`,
      );
    }
  };

  for (const { element, holds } of contentElements) {
    const expected = holds && element.catalog !== undefined ? `text ${element.catalog}` : "none";

    judge(element, [], expected, expected === "none" ? "none" : "held");
  }
  for (const [tag, bars] of barredBelowByTag) {
    for (const within of [[tag], [tag, "em"], ["div", tag, "span"]]) {
      judge(labelSpan, within, bars ? "none" : "text spoken-a", bars ? "below" : "held");
    }
  }

  return breaks;
};

describe("the read-aloud control an element of an interaction's own content holds", () => {
  it("holds an element's catalog as text where it may hold phrasing content, and nowhere else", () => {
    assert.deepStrictEqual(Object.fromEntries(brokenWithin(spokenWithin)), {});
  });

  it("judges every element of the HTML subset plate writes, so no element is left unjudged", () => {
    assert.deepStrictEqual(
      heldByTag
        .map(([tag]) => tag)
        .filter((tag) => tag !== "qti-gap")
        .toSorted(),
      [...htmlSubset.keys()].toSorted(),
    );
  });

  it.each([
    ["no control held", "held", (() => Option.none()) satisfies typeof spokenWithin],
    [
      "a control inside a void element or a list",
      "none",
      ((element) =>
        Option.map(Option.fromUndefinedOr(element.catalog), (catalog) => ({
          catalog,
          role: "text" as const,
        }))) satisfies typeof spokenWithin,
    ],
    [
      "a control inside a link, a label or a media element, whose content models refuse it or hide it",
      "none",
      ((element) =>
        ["a", "audio", "label", "object", "video"].includes(element.tag)
          ? Option.map(Option.fromUndefinedOr(element.catalog), (catalog) => ({
              catalog,
              role: "text" as const,
            }))
          : spokenWithin(element, [])) satisfies typeof spokenWithin,
    ],
    [
      "a control in an element below a link, a label or a media element, its own tag alone read",
      "below",
      ((element) => spokenWithin(element, [])) satisfies typeof spokenWithin,
    ],
    [
      "a control below a link, a label or a media element two levels up, its parent's tag alone read",
      "below",
      ((element, within) => spokenWithin(element, within.slice(-1))) satisfies typeof spokenWithin,
    ],
    [
      "a held control read as the prompt",
      "held",
      ((element, within) =>
        Option.map(spokenWithin(element, within), (spoken) => ({
          ...spoken,
          role: "prompt" as const,
        }))) satisfies typeof spokenWithin,
    ],
  ] as const)("refuses a mutant: %s (%s)", (_name, property, place) => {
    assert.include([...brokenWithin(place).keys()], property);
  });
});
