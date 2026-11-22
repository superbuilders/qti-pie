/**
 * Where the body walk puts read-aloud's controls (`readAloudBefore` in
 * `#plate/ui/item/content.tsx`): at the top of what each reads, as AlphaTest's player put a
 * question's and a passage's control. Each property is checked on bodies a seeded generator draws:
 * divisions, paragraphs and phrasing runs nested to three levels, each element referencing a
 * catalog or not.
 *
 * The properties:
 *
 * - **before:** each element at a flow position that references a catalog is preceded, as its
 *   previous sibling, by exactly one control, the `text` control for its catalog;
 * - **only:** no other control stands on the page, so an element at a phrasing position, whose parent
 *   may admit no control beside it, has none.
 *
 * Kills: a writing that puts the control after its element, as plate did before, one that writes
 * an element's control twice, and one that writes a control before an element at a phrasing
 * position are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { LiteElement, LiteNode } from "mathjax-full/js/adaptors/lite/Element.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { BodyElement, RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import { noSlots, nodesOf } from "#plate/ui/item/content.tsx";
import type { Walk } from "#plate/ui/item/content.tsx";

/**
 * The adaptor the suite reads the page through.
 */
const adaptor = liteAdaptor();

/**
 * The body walk the suite writes with: instance `i`, ids written, every interaction a defect (the
 * bodies hold none), and read-aloud's control a `span` named by its role and its catalog.
 */
const walk: Walk = {
  addressing: { assets: new Map(), document: "items/x.xml", instance: "i", writing: "original" },
  credit: Option.none(),
  headingOffset: 0,
  locale: "en",
  scope: {
    answer: () => null,
    container: () => null,
    glossary: () => Option.none(),
    interaction: () => null,
    kind: "body",
    readAloud: (catalog, role, _label, key) =>
      Option.some(
        createElement("span", {
          "aria-label": `${role} ${catalog}`,
          "data-slot": "plate-read-aloud",
          key,
        }),
      ),
    stimulus: () => Option.none(),
    verdict: Option.none(),
  },
  slots: noSlots,
  standing: "flow",
};

/**
 * A generator of numbers in [0, 1), Park and Miller's minimal standard, from a seed.
 *
 * @param seed The seed, a positive integer.
 * @returns The generator.
 */
const generator = (seed: number): (() => number) => {
  let state = seed;

  return () => {
    state = (state * 16_807) % 2_147_483_647;

    return state / 2_147_483_647;
  };
};

/**
 * One element of a drawn body, as the oracle knows it: its name, the catalog it references, and
 * whether it stands at a flow position.
 */
interface Drawn {
  readonly catalog: string | undefined;
  readonly flow: boolean;
  readonly name: string;
}

/**
 * A drawn body: its nodes, and every element it holds.
 */
interface Body {
  readonly elements: readonly Drawn[];
  readonly nodes: readonly RedactedNode[];
}

/**
 * Give the tag a draw picks: at a flow position a division half the time, else a paragraph or a
 * phrasing run; at a phrasing position a `span` or an `em`.
 *
 * @param flow Whether the element stands at a flow position.
 * @param pick The draw, in [0.2, 1).
 * @returns The tag.
 */
const tagOf = (flow: boolean, pick: number): string => {
  if (!flow) {
    return pick < 0.6 ? "span" : "em";
  }

  if (pick < 0.5) {
    return "div";
  }

  return pick < 0.8 ? "p" : "span";
};

/**
 * Draw a body: at a flow position, divisions, paragraphs and phrasing runs; below a paragraph or a
 * phrasing run, phrasing runs and text alone. Each element is named by its `aria-label` and
 * references a catalog of its own half the time.
 *
 * @param seed The seed.
 * @returns The body.
 */
const bodyOf = (seed: number): Body => {
  const draw = generator(seed);
  const elements: Drawn[] = [];
  const nodesAt = (flow: boolean, depth: number): RedactedNode[] =>
    Array.from({ length: 1 + Math.floor(draw() * 3) }, (): RedactedNode => {
      const pick = draw();

      if (depth >= 3 || pick < 0.2) {
        return { kind: "text", text: "words " };
      }

      const tag = tagOf(flow, pick);
      const name = `e${String(elements.length)}`;
      const catalog = draw() < 0.5 ? `c${String(elements.length)}` : undefined;

      elements.push({ catalog, flow, name });

      const element: BodyElement<RedactedLevel> = {
        attributes: [{ name: "aria-label", value: name }],
        children: nodesAt(tag === "div", depth + 1),
        kind: "element",
        path: name,
        tag,
      };

      return catalog === undefined ? element : { ...element, catalog };
    });

  return { elements, nodes: nodesAt(true, 0) };
};

/**
 * The bodies the properties are checked on.
 */
const bodies: readonly Body[] = Array.from({ length: 200 }, (_, index) => bodyOf(index + 1));

/**
 * Give an element's children that are elements.
 *
 * @param node The element.
 * @returns Its element children, in order.
 */
const elementChildren = (node: LiteElement): readonly LiteElement[] =>
  adaptor.childNodes(node).filter((child: LiteNode): child is LiteElement => "children" in child);

/**
 * Give every element below a node, in document order.
 *
 * @param node The node.
 * @returns The elements.
 */
const below = (node: LiteElement): readonly LiteElement[] =>
  elementChildren(node).flatMap((child) => [child, ...below(child)]);

/**
 * Tell whether an element is a read-aloud control.
 *
 * @param element The element.
 * @returns Whether it is.
 */
const isControl = (element: LiteElement): boolean =>
  adaptor.getAttribute(element, "data-slot") === "plate-read-aloud";

/**
 * A writing's page, after a change a mutant makes to it.
 */
type Mutation = (page: LiteElement, body: Body) => void;

/**
 * Write a body as the shell does and read it back.
 *
 * @param body The body.
 * @returns The page.
 */
const pageOf = (body: Body): LiteElement =>
  adaptor.body(
    adaptor.parse(
      `<body>${renderToStaticMarkup(createElement(Fragment, null, ...nodesOf(body.nodes, walk)))}</body>`,
      "text/html",
    ),
  );

/**
 * Check every property on every body, the page changed by a mutation.
 *
 * @param mutation The change, none for plate's writing.
 * @returns Each broken property's name, with the first case it broke on.
 */
const broken = (mutation?: Mutation): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();
  const report = (name: string, what: string): void => {
    if (!breaks.has(name)) {
      breaks.set(name, what);
    }
  };

  for (const [index, body] of bodies.entries()) {
    const page = pageOf(body);

    mutation?.(page, body);

    const all = below(page);
    const named = new Map(
      all.map((element) => [String(adaptor.getAttribute(element, "aria-label")), element]),
    );
    const expected = new Set<LiteElement>();

    for (const drawn of body.elements) {
      const element = named.get(drawn.name);

      if (drawn.catalog === undefined || !drawn.flow || element === undefined) {
        continue;
      }

      const before = adaptor.previous(element);
      const controls = all.filter(
        (control) =>
          isControl(control) &&
          adaptor.getAttribute(control, "aria-label") === `text ${drawn.catalog}`,
      );

      if (
        before === null ||
        !("children" in before) ||
        !isControl(before) ||
        controls.length !== 1 ||
        controls[0] !== before
      ) {
        report(
          "before",
          `body ${String(index + 1)}: ${drawn.name} has ${String(controls.length)} controls, none just before it`,
        );
      }

      for (const control of controls) {
        expected.add(control);
      }
    }

    const stray = all.filter((element) => isControl(element) && !expected.has(element));

    if (stray.length > 0) {
      report(
        "only",
        `body ${String(index + 1)}: ${stray.map((control) => String(adaptor.getAttribute(control, "aria-label"))).join(", ")}`,
      );
    }
  }

  return breaks;
};

/**
 * Move a page's controls after the element that follows each, as plate wrote them before.
 *
 * @param page The page.
 */
const afterwards: Mutation = (page) => {
  for (const control of below(page).filter(isControl)) {
    const element = adaptor.next(control);
    const parent = adaptor.parent(control);

    adaptor.remove(control);

    const after = adaptor.next(element);

    if (after === null) {
      adaptor.append(parent, control);
    } else {
      adaptor.insert(control, after);
    }
  }
};

describe("read-aloud's control at the top of what it reads", () => {
  it("precedes each element at a flow position that references a catalog, once, and stands nowhere else", () => {
    assert.deepStrictEqual(Object.fromEntries(broken()), {});
  });

  it.each([
    ["the control after its element", "before", afterwards],
    [
      "a control written twice",
      "before",
      (page: LiteElement) => {
        const control = below(page).find(isControl);

        if (control !== undefined) {
          adaptor.insert(adaptor.clone(control), control);
        }
      },
    ],
    [
      "a control before an element at a phrasing position",
      "only",
      (page: LiteElement, body: Body) => {
        const named = new Map(
          below(page).map((element) => [
            String(adaptor.getAttribute(element, "aria-label")),
            element,
          ]),
        );

        for (const drawn of body.elements) {
          const element = named.get(drawn.name);

          if (!drawn.flow && drawn.catalog !== undefined && element !== undefined) {
            const control = adaptor.node("span", {
              "aria-label": `text ${drawn.catalog}`,
              "data-slot": "plate-read-aloud",
            });

            adaptor.insert(control, element);
          }
        }
      },
    ],
  ] as const)("refuses a mutant: %s (%s)", (_name, property, mutation) => {
    assert.include([...broken(mutation).keys()], property);
  });
});
