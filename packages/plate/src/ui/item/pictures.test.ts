/**
 * A picture that fails to load says so (`data-plate-unloaded` on each `img` the walk writes in
 * `#plate/ui/item/content.tsx`, which `base.css` shows as the broken picture's `::after`): over
 * runs of content holding pictures at every depth a seeded generator draws, beside paragraphs,
 * phrasing runs and figures, walked in the body, in an interaction's own content and in plain
 * content, written as the original and as a copy:
 *
 * - **told:** every picture the walk writes carries the catalog's `pictureUnloaded` line, in the
 *   walk's locale;
 * - **only:** no other element carries the line.
 *
 * Kills: a writing that leaves a picture without the line, one that writes the line on the
 * picture's parent, and one that writes another text are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { LiteElement, LiteNode } from "mathjax-full/js/adaptors/lite/Element.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { configure } from "#plate/configuration.ts";
import { message } from "#plate/messages.ts";
import type { RedactedNode } from "#plate/model/item.ts";
import { noSlots, nodesOf } from "#plate/ui/item/content.tsx";
import type { Walk } from "#plate/ui/item/content.tsx";
import { noReadAloud } from "#plate/ui/item/contents/catalog.tsx";

/**
 * The adaptor the suite reads the page through.
 */
const adaptor = liteAdaptor();

/**
 * The line a picture carries, as the catalog writes it in English.
 */
const line = message("en", "pictureUnloaded");

/**
 * The pictures' addresses, as a host configures them.
 */
const { assets } = Effect.runSync(
  configure({
    assets: [
      ["items/a.png", "https://cdn.example/a.png"],
      ["items/b.png", "https://cdn.example/b.png"],
    ],
    seed: "pictures",
  }),
);

/**
 * A body walk at a flow position, ids written, its pictures served at the host's addresses.
 */
const bodyWalk: Walk = {
  addressing: {
    assets,
    document: "items/x.xml",
    instance: "i",
    writing: "original",
  },
  credit: Option.none(),
  headingOffset: 0,
  locale: "en",
  scope: {
    answer: () => null,
    container: () => null,
    glossary: () => Option.none(),
    interaction: () => null,
    kind: "body",
    readAloud: noReadAloud,
    stimulus: () => Option.none(),
    verdict: Option.none(),
  },
  slots: noSlots,
  standing: "flow",
};

/**
 * The walks each run is written by: the body's, a copy's, an interaction's own content's and
 * plain content's.
 */
const walks: readonly Walk[] = [
  bodyWalk,
  { ...bodyWalk, addressing: { ...bodyWalk.addressing, writing: "copy" } },
  { ...bodyWalk, scope: { kind: "owned", own: () => null } },
  { ...bodyWalk, scope: { kind: "plain" } },
];

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
 * A run of content and how many pictures it holds.
 */
interface Run {
  readonly nodes: readonly RedactedNode[];
  readonly pictures: number;
}

/**
 * Give the tag of an element a draw picks: a paragraph, a phrasing run or a figure.
 *
 * @param pick The draw, in [0.5, 1).
 * @returns The tag.
 */
const tagOf = (pick: number): string => {
  if (pick < 0.7) {
    return "p";
  }

  return pick < 0.85 ? "span" : "figure";
};

/**
 * Draw a run: paragraphs, phrasing runs and figures nested to three levels, pictures among them
 * at every depth, with and without `alt`, `width` and `height`.
 *
 * @param seed The seed.
 * @returns The run.
 */
const runOf = (seed: number): Run => {
  const draw = generator(seed);
  let pictures = 0;
  const nodesAt = (depth: number): RedactedNode[] =>
    Array.from({ length: 1 + Math.floor(draw() * 3) }, (_, index): RedactedNode => {
      const pick = draw();

      if (pick < 0.35) {
        pictures += 1;

        return {
          attributes: [
            { name: "src", value: index % 2 === 0 ? "a.png" : "b.png" },
            ...(pick < 0.2 ? [{ name: "alt", value: "A picture" }] : []),
            ...(pick < 0.1
              ? [
                  { name: "width", value: "320" },
                  { name: "height", value: "200" },
                ]
              : []),
          ],
          children: [],
          kind: "element",
          path: `img/${String(pictures)}`,
          tag: "img",
        };
      }

      if (depth >= 3 || pick < 0.5) {
        return { kind: "text", text: "words " };
      }

      return {
        attributes: [],
        children: nodesAt(depth + 1),
        kind: "element",
        path: "e",
        tag: tagOf(pick),
      };
    });
  const nodes = nodesAt(0);

  return { nodes, pictures };
};

/**
 * The runs the properties are checked on.
 */
const runs: readonly Run[] = Array.from({ length: 150 }, (_, index) => runOf(index + 1));

/**
 * Give every element below a node, in document order.
 *
 * @param node The node.
 * @returns The elements.
 */
const below = (node: LiteElement): readonly LiteElement[] =>
  adaptor
    .childNodes(node)
    .filter((child: LiteNode): child is LiteElement => "children" in child)
    .flatMap((child) => [child, ...below(child)]);

/**
 * A writing's page, after a change a mutant makes to it.
 */
type Mutation = (page: LiteElement) => void;

/**
 * Check every property on every run through every walk, the page changed by a mutation.
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

  for (const [index, run] of runs.entries()) {
    for (const walk of walks) {
      const page = adaptor.body(
        adaptor.parse(
          `<body>${renderToStaticMarkup(createElement(Fragment, null, ...nodesOf(run.nodes, walk)))}</body>`,
          "text/html",
        ),
      );

      mutation?.(page);

      const elements = below(page);
      const pictures = elements.filter((element) => adaptor.kind(element) === "img");
      const told = pictures.filter(
        (picture) => adaptor.getAttribute(picture, "data-plate-unloaded") === line,
      );
      const carrying = elements.filter((element) =>
        adaptor.hasAttribute(element, "data-plate-unloaded"),
      );
      const where = `run ${String(index + 1)}, ${walk.scope.kind} ${walk.addressing.writing}`;

      if (pictures.length !== run.pictures || told.length !== pictures.length) {
        report(
          "told",
          `${where}: ${String(told.length)} of ${String(pictures.length)} pictures told, ${String(run.pictures)} drawn`,
        );
      }

      if (carrying.some((element) => adaptor.kind(element) !== "img")) {
        report(
          "only",
          `${where}: a ${carrying.map((element) => adaptor.kind(element)).join(", ")} carries the line`,
        );
      }
    }
  }

  return breaks;
};

describe("a picture that fails to load says so", () => {
  it("writes the catalog's line on every picture of every walk and on nothing else", () => {
    assert.deepStrictEqual(Object.fromEntries(broken()), {});
  });

  it.each([
    [
      "a picture without the line",
      "told",
      (page: LiteElement) => {
        const picture = below(page).find((element) => adaptor.kind(element) === "img");

        if (picture !== undefined) {
          adaptor.removeAttribute(picture, "data-plate-unloaded");
        }
      },
    ],
    [
      "the line on the picture's parent",
      "only",
      (page: LiteElement) => {
        for (const picture of below(page).filter((element) => adaptor.kind(element) === "img")) {
          const parent = adaptor.parent(picture);

          if (parent !== page) {
            adaptor.setAttribute(parent, "data-plate-unloaded", line);
          }
        }
      },
    ],
    [
      "another text",
      "told",
      (page: LiteElement) => {
        for (const picture of below(page).filter((element) => adaptor.kind(element) === "img")) {
          adaptor.setAttribute(picture, "data-plate-unloaded", "Image failed");
        }
      },
    ],
  ] as const)("refuses a mutant: %s (%s)", (_name, property, mutation) => {
    assert.include([...broken(mutation).keys()], property);
  });
});
