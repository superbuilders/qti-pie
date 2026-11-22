/**
 * An interaction a formula draws in its slot (`Walk.slots` in `#plate/ui/item/content.tsx`): a
 * Text Entry, an Inline Choice or a gap whose `id` an empty `mspace`'s `xref` names. Each property
 * is checked on runs of content a seeded generator draws: paragraphs holding formulas (fractions,
 * rows, a slot in a numerator, a denominator or a row) and the interactions their slots name,
 * beside interactions no slot names, one named twice, and gaps in an interaction's own content.
 *
 * The properties:
 *
 * - **placed:** each interaction exactly one slot names stands once on the page, inside that slot's
 *   `foreignObject`, as the walk renders it (the seam's island, so the entry it posts is its own
 *   response's), and nowhere else;
 * - **left:** each interaction no slot names, or two or more do, stands where the body holds it, in
 *   no slot, and its slots stay empty;
 * - **inside:** each slot's box lies inside its formula's.
 *
 * Kills: a writing that also leaves a slotted interaction in its place, one that draws a slot
 * empty, and one that draws another interaction's island in a slot are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { MathChild } from "#plate/content/mathml.ts";
import type { BodyElement, RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import { noSlots, nodesOf } from "#plate/ui/item/content.tsx";
import type { Walk } from "#plate/ui/item/content.tsx";
import { noReadAloud } from "#plate/ui/item/contents/catalog.tsx";
import { textEntry } from "#plate/test/slotted.ts";

/**
 * The adaptor the suite reads the page through.
 */
const adaptor = liteAdaptor();

/**
 * The addressing of the suite's walks: instance `i` of `items/x.xml`, no assets, ids written.
 */
const addressing = {
  assets: new Map(),
  document: "items/x.xml",
  instance: "i",
  writing: "original",
} as const;

/**
 * The island the suite's seam renders for an interaction: an input posting under its response's
 * name, as a Text Entry's island posts its entry, with the interaction's kind beside it.
 *
 * @param response The response.
 * @param kind What it stands for.
 * @returns The island.
 */
const island = (response: string, kind: string): ReturnType<typeof createElement> =>
  createElement("input", { "data-kind": kind, name: response, readOnly: true });

/**
 * A body walk whose seam renders each interaction as {@link island}.
 */
const bodyWalk: Walk = {
  addressing,
  credit: Option.none(),
  headingOffset: 0,
  locale: "en",
  scope: {
    answer: () => null,
    container: () => null,
    glossary: () => Option.none(),
    interaction: (model) => island(model.response, model.kind),
    kind: "body",
    readAloud: noReadAloud,
    stimulus: () => Option.none(),
    verdict: Option.none(),
  },
  slots: noSlots,
  standing: "flow",
};

/**
 * A gap interaction's own content walk, whose `own` renders each gap as {@link island}, by its id.
 */
const ownedWalk: Walk = {
  ...bodyWalk,
  scope: {
    kind: "owned",
    own: (element) =>
      island(element.attributes.find(({ name }) => name === "id")?.value ?? "", "gap"),
  },
};

/**
 * A `qti-gap` of an interaction's own content, as the redacted body holds it.
 *
 * @param id Its `id`.
 * @returns The element.
 */
const gap = (id: string): BodyElement<RedactedLevel> => ({
  attributes: [{ name: "id", value: id }],
  children: [],
  kind: "element",
  path: `gap/${id}`,
  tag: "qti-gap",
});

/**
 * A MathML element of a formula.
 *
 * @param local Its local name.
 * @param children Its children.
 * @param xref The `xref` it carries, none where it carries none.
 * @returns The element.
 */
const ml = (
  local: string,
  children: readonly MathChild<RedactedNode>[],
  xref?: string,
): MathChild<RedactedNode> => ({
  attributes: xref === undefined ? [] : [{ name: "xref", value: xref }],
  children,
  kind: "element",
  local,
});

/**
 * A number of a formula.
 *
 * @param text Its digits.
 * @returns The `mn`.
 */
const mn = (text: string): MathChild<RedactedNode> => ml("mn", [{ kind: "text", text }]);

/**
 * A formula holding slots, each where a seeded choice puts it: alone after an equals sign, in a
 * fraction's numerator or denominator, or both.
 *
 * @param ids The ids its slots name, in order.
 * @param seed The choice.
 * @returns The formula's content node.
 */
const formula = (ids: readonly string[], seed: number): RedactedNode => ({
  element: "math",
  kind: "content",
  node: {
    attributes: [],
    children: [
      ml(
        "mrow",
        ids.map((id, index) => {
          const slot = ml("mspace", [], id);

          switch ((seed + index) % 3) {
            case 0: {
              return ml("mrow", [mn("3"), ml("mo", [{ kind: "text", text: "=" }]), slot]);
            }
            case 1: {
              return ml("mfrac", [mn("3"), slot]);
            }
            default: {
              return ml("mfrac", [slot, mn("10")]);
            }
          }
        }),
      ),
    ],
    kind: "element",
    local: "math",
  },
  path: `math/${String(seed)}`,
});

/**
 * A paragraph, as the redacted body holds it.
 *
 * @param children Its children.
 * @returns The element.
 */
const paragraph = (children: readonly RedactedNode[]): RedactedNode => ({
  attributes: [],
  children,
  kind: "element",
  path: "p",
  tag: "p",
});

/**
 * A run of content and what its slots should hold: the interactions or gaps exactly one slot names
 * (`placed`), and those that should stand where they are (`left`).
 */
interface Run {
  readonly left: readonly string[];
  readonly nodes: readonly RedactedNode[];
  readonly placed: readonly string[];
  readonly walk: Walk;
}

/**
 * Draw a run: in a body, a paragraph holding Text Entries, most with ids, and a formula whose
 * slots name some of them once and some twice; in a gap interaction's own content, gaps and a
 * formula naming them the same way. A slot names an interaction that has no id too, which no
 * slot can then hold.
 *
 * @param seed The seed.
 * @returns The run.
 */
const runOf = (seed: number): Run => {
  const responses = Array.from(
    { length: 1 + (seed % 4) },
    (_, index) => `R${String(seed)}x${String(index)}`,
  );
  const once = responses.filter((_, index) => (seed + index) % 3 !== 2);
  const twice = responses.filter(
    (_, index) => (seed + index) % 3 === 2 && (seed + index) % 2 === 0,
  );
  const hasId = (response: string): boolean => responses.indexOf(response) % 7 !== 6 - (seed % 2);
  const owned = seed % 4 === 3;
  const placed = once.filter((response) => owned || hasId(response));
  const slots = [...once, ...twice, ...twice];

  return {
    left: responses.filter((response) => !placed.includes(response)),
    nodes: owned
      ? [...responses.map(gap), formula(slots, seed)]
      : [
          paragraph([
            ...responses.map((response) =>
              textEntry(
                response,
                hasId(response) ? Option.some(`entry-${response}`) : Option.none(),
              ),
            ),
            formula(
              slots.map((response) => `entry-${response}`),
              seed,
            ),
          ]),
        ],
    placed,
    walk: owned ? ownedWalk : bodyWalk,
  };
};

/**
 * The runs the properties are checked on.
 */
const runs: readonly Run[] = Array.from({ length: 120 }, (_, index) => runOf(index + 1));

/**
 * Find the elements of a page a predicate selects, at any depth, in document order.
 *
 * @param root The page.
 * @param selects The predicate.
 * @returns The elements.
 */
const elementsOf = (root: LiteElement, selects: (element: LiteElement) => boolean): LiteElement[] =>
  adaptor
    .childNodes(root)
    .flatMap((child) =>
      "children" in child
        ? [...(selects(child) ? [child] : []), ...elementsOf(child, selects)]
        : [],
    );

/**
 * Read an element's attribute.
 *
 * @param element The element.
 * @param name The attribute.
 * @returns Its value, undefined when it has none.
 */
const attr = (element: LiteElement, name: string): string | undefined =>
  adaptor.hasAttribute(element, name) ? String(adaptor.getAttribute(element, name)) : undefined;

/**
 * A writing of a run: the walk's HTML of its nodes.
 */
type Writer = (run: Run) => string;

/**
 * Write a run as the shell writes it.
 *
 * @param run The run.
 * @returns The HTML.
 */
const written: Writer = (run) =>
  renderToStaticMarkup(createElement(Fragment, null, ...nodesOf(run.nodes, run.walk)));

/**
 * The response an island posts under, by what it stands for: a Text Entry's `id` names
 * `entry-<response>`, a gap's names itself.
 *
 * @param run The run.
 * @param response The response or gap.
 * @returns The id its slot names.
 */
const idOf = (run: Run, response: string): string =>
  run.walk.scope.kind === "owned" ? response : `entry-${response}`;

/**
 * A run written by a writer and read back: its inputs, each an island, and its slots.
 */
interface Page {
  readonly inputs: readonly LiteElement[];
  readonly run: Run;
  readonly slots: readonly LiteElement[];
}

/**
 * Tell whether an island stands for an interaction or a gap of a run.
 *
 * @param run The run.
 * @param response The interaction's response, or the gap's id.
 * @returns Whether an input posts under its name.
 */
const standsFor =
  (run: Run, response: string) =>
  (input: LiteElement): boolean => {
    const name = attr(input, "name");

    return name === idOf(run, response) || name === response;
  };

/**
 * Give the inputs inside an element.
 *
 * @param element The element.
 * @returns Its inputs.
 */
const inputsIn = (element: LiteElement): readonly LiteElement[] =>
  elementsOf(element, (child) => child.kind === "input");

/**
 * Each interaction exactly one slot names stands once, inside a slot.
 *
 * @param page The run's page.
 * @returns What broke.
 */
const placed = ({ inputs, run, slots }: Page): readonly string[] =>
  run.placed.flatMap((response) => {
    const islands = inputs.filter(standsFor(run, response)).length;
    const inSlots = slots.filter((slot) => inputsIn(slot).some(standsFor(run, response))).length;

    return islands === 1 && inSlots === 1
      ? []
      : [`${response} stands ${String(islands)} times, ${String(inSlots)} in a slot`];
  });

/**
 * Each interaction no slot holds stands once, in no slot.
 *
 * @param page The run's page.
 * @returns What broke.
 */
const left = ({ inputs, run, slots }: Page): readonly string[] =>
  run.left.flatMap((response) => {
    const islands = inputs.filter(standsFor(run, response)).length;
    const inSlot = slots.some((slot) => inputsIn(slot).some(standsFor(run, response)));

    return islands === 1 && !inSlot
      ? []
      : [`${response} stands ${String(islands)} times${inSlot ? ", in a slot" : ""}`];
  });

/**
 * Each slot's box lies inside its formula's.
 *
 * @param page The run's page.
 * @returns What broke.
 */
const inside = ({ slots }: Page): readonly string[] =>
  slots.flatMap((slot) => {
    const [x = Number.NaN, y = Number.NaN, width = Number.NaN, height = Number.NaN] = [
      "x",
      "y",
      "width",
      "height",
    ].map((name) => Number((attr(slot, name) ?? "").replace(/%$/u, "")));
    const within =
      x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= 100.01 && y + height <= 100.01;

    return within
      ? []
      : [`a slot at ${String(x)}% ${String(y)}%, ${String(width)}% by ${String(height)}%`];
  });

/**
 * The properties, by name.
 */
const properties: ReadonlyMap<string, (page: Page) => readonly string[]> = new Map([
  ["placed", placed],
  ["left", left],
  ["inside", inside],
]);

/**
 * Check every property on every run through a writer.
 *
 * @param writer The writer.
 * @returns Each broken property's name, with the first run it broke on and what broke.
 */
const broken = (writer: Writer): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();

  for (const [index, run] of runs.entries()) {
    const body = adaptor.body(adaptor.parse(`<div>${writer(run)}</div>`, "text/html"));
    const page: Page = {
      inputs: inputsIn(body),
      run,
      slots: elementsOf(body, (element) => attr(element, "data-slot") === "plate-math-slot"),
    };

    for (const [name, property] of properties) {
      const verdict = property(page);

      if (verdict.length > 0 && !breaks.has(name)) {
        breaks.set(name, `run ${String(index)}: ${verdict.join("; ")}`);
      }
    }
  }

  return breaks;
};

/**
 * The mutants: each a way the slots could break, the property that refuses it, and its writer.
 */
const mutants: readonly (readonly [name: string, property: string, writer: Writer])[] = [
  [
    "a slotted interaction also left where it stands",
    "placed",
    (run) =>
      `${written(run)}${run.placed.map((response) => renderToStaticMarkup(island(idOf(run, response), "copy"))).join("")}`,
  ],
  [
    "a slot drawn empty",
    "placed",
    (run) => written(run).replaceAll(/(?<slot><foreignObject[^>]*>)<input[^>]*>/gu, "$<slot>"),
  ],
  [
    "another interaction's island drawn in a slot",
    "placed",
    (run) =>
      written(run).replaceAll(
        /(?<slot><foreignObject[^>]*><input[^>]*name=")[^"]*"/gu,
        '$<slot>someone-else"',
      ),
  ],
];

describe("an interaction a formula draws in its slot", () => {
  it("holds every property on 120 drawn runs", () => {
    assert.deepStrictEqual(Object.fromEntries(broken(written)), {});
  });

  it("draws runs that reach every situation: placed in a body and in an interaction's own content, left for want of an id, for want of a slot, and for two slots", () => {
    const body = runs.filter(({ walk }) => walk.scope.kind === "body");
    const owned = runs.filter(({ walk }) => walk.scope.kind === "owned");

    assert.isAbove(body.flatMap((run) => run.placed).length, 20);
    assert.isAbove(owned.flatMap((run) => run.placed).length, 5);
    assert.isAbove(body.flatMap((run) => run.left).length, 20);
    assert.isAbove(owned.flatMap((run) => run.left).length, 1);
  });

  it.each(mutants)("refuses a mutant: %s (%s)", (_name, property, writer) => {
    assert.include([...broken(writer).keys()], property);
  });
});
