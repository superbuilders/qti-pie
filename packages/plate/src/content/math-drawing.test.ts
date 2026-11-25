/**
 * A formula as plate draws it (`draw` in `#plate/content/math-drawing.ts`): MathJax's drawing as
 * data, which the server shell writes as SVG beside the author's MathML, standing on the baseline
 * as MathJax's own output stands, with each slot the formula holds placed where MathJax laid it
 * out. Each property is checked on formulas a seeded generator draws from presentation MathML
 * (tokens, rows, fractions, roots, scripts, limits, tables with rules and alignments, enclosures,
 * spaces, styles, characters MathJax's fonts lack, `qti-bordered` rows, display formulas,
 * `semantics` beside a TeX annotation, as the AlphaTest converter writes it), on the shapes the
 * AlphaTest corpus holds most, and on formulas holding slots.
 *
 * The properties, against MathJax's own SVG output for the same formula (`typeset`):
 *
 * - **drawn:** the drawing holds MathJax's SVG elements that draw, in order, each with every
 *   attribute MathJax wrote on it that draws, at its value, under the name React writes it by;
 * - **baseline:** the formula's height and depth together are MathJax's `svg`'s height, its depth as
 *   deep as MathJax's `vertical-align` lowers it, and its width MathJax's;
 * - **bordered:** each element carrying `qti-bordered` is drawn inside a box, one more rectangle in
 *   the drawing than the same formula without the class;
 * - **settled:** drawing a formula again gives the same drawing;
 * - **coloured:** each colour a drawn element's `style` states (AlphaTest's coloured digits) is
 *   drawn, as the drawing's `color`;
 * - **inside:** each slot a formula holds is placed once, by the id it names, inside the formula's
 *   box.
 *
 * Kills: each mutant of the drawing, a way it could break, is refused by the property it breaks,
 * so a pass is a pass of properties that see these breaks.
 *
 * @module
 */
import { regex } from "arkregex";
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { draw, drawnAttributes, slotMark, typeset } from "#plate/content/math-drawing.ts";
import type { Drawn } from "#plate/content/math-drawing.ts";
import { gapSlot, inlineChoiceSlot, textEntrySlot } from "#plate/content/math-slots.ts";
import type { SlotSize } from "#plate/content/math-slots.ts";
import type { MathAttribute, MathChild, MathNode } from "#plate/content/mathml.ts";
import type { RedactedLevel, RedactedNode } from "#plate/model/item.ts";

/**
 * A formula of the suite: the `math` element's tree, as the redacted body holds it.
 */
type Formula = MathNode<RedactedLevel>;

/**
 * A child of a formula's tree.
 */
type Child = MathChild<RedactedNode>;

/**
 * A formula as plate draws it, with its slots' sizes.
 */
type Drawing = ReturnType<typeof draw>;

/**
 * A drawing of a formula, which a mutant replaces.
 */
type Drawer = (formula: Formula, sizes: ReadonlyMap<string, SlotSize>) => Drawing;

/**
 * The adaptor the suite reads MathJax's output, and the drawing written back as SVG, through.
 */
const adaptor = liteAdaptor();

/**
 * A seeded source of choices (Park and Miller's minimal standard generator), so a failing case is
 * drawn again from its seed.
 */
interface Chance {
  /**
   * Draw a whole number.
   *
   * @param bound The bound.
   * @returns A number from 0 to `bound - 1`.
   */
  readonly below: (bound: number) => number;
  /**
   * Pick one of some values.
   *
   * @param values The values.
   * @returns One of them.
   */
  readonly pick: <A>(values: readonly [A, ...A[]]) => A;
}

/**
 * The minimal standard generator's modulus, the Mersenne prime 2^31 - 1.
 */
const modulus = 2_147_483_647;

/**
 * The minimal standard generator's multiplier (Park, Miller and Stockmeyer, 1993).
 */
const multiplier = 48_271;

/**
 * Make a seeded source of choices.
 *
 * @param seed The seed, from 1.
 * @returns The source.
 */
const chanceOf = (seed: number): Chance => {
  let state = seed % modulus;
  const below = (bound: number): number => {
    state = (state * multiplier) % modulus;

    return Math.floor((state / modulus) * bound);
  };

  return { below, pick: (values) => values[below(values.length)] ?? values[0] };
};

/**
 * An element's attributes as the suite writes them: each its name and its value.
 */
type Attributes = readonly (readonly [name: string, value: string])[];

/**
 * No attributes.
 */
const none: Attributes = [];

/**
 * Construct an element of a formula.
 *
 * @param local Its local name.
 * @param attributes Its attributes.
 * @param children Its children.
 * @returns The element.
 */
const el = (
  local: string,
  attributes: Attributes,
  children: readonly Child[],
): Extract<Child, { readonly kind: "element" }> => ({
  attributes: attributes.map(([name, value]) => ({ name, value })),
  children,
  kind: "element",
  local,
});

/**
 * Construct text of a formula.
 *
 * @param text The text.
 * @returns The text node.
 */
const tx = (text: string): Child => ({ kind: "text", text });

/**
 * QTI's shared vocabulary class for a solid border, as an attribute.
 */
const borderedClass: Attributes = [["class", "qti-bordered"]];

/**
 * Draw a token: an identifier, a number, an operator, text (characters MathJax's fonts lack among
 * it) or a space.
 *
 * @param chance The source of choices.
 * @returns The token.
 */
const token = (chance: Chance): Child =>
  chance.pick<() => Child>([
    () =>
      el("mi", chance.pick([none, [["mathvariant", "normal"]], [["mathvariant", "bold"]]]), [
        tx(chance.pick(["x", "y", "n", "θ", "π", "sin", "A"])),
      ]),
    () => el("mn", none, [tx(chance.pick(["2", "13", "0.5", "100", "7"]))]),
    () =>
      el("mo", chance.pick([none, [["stretchy", "false"]], [["form", "prefix"]]]), [
        tx(chance.pick(["+", "−", "=", "×", "÷", "(", ")", "|", ",", "→", "∑", "≤"])),
      ]),
    () => el("mtext", none, [tx(chance.pick(["cats", " ", "¢", "▢", "＄5", "km/h"]))]),
    () => el("mspace", [["width", chance.pick(["0.167em", "1em", "2ex"])]], []),
    () =>
      el(
        "mn",
        [["style", chance.pick(["color:#0000FF !important;", "color:#FF8000 !important;"])]],
        [tx("5")],
      ),
  ])();

/**
 * Draw a table: rows of cells, each cell drawn in turn, with an alignment, rules, a frame or
 * spacing at times, and a cell marked `qti-align-right` as the AlphaTest converter marks one.
 *
 * @param chance The source of choices.
 * @param cell Draw a cell's content.
 * @returns The table.
 */
const table = (chance: Chance, cell: () => Child): Child => {
  const columns = 1 + chance.below(3);

  return el(
    "mtable",
    chance.pick<Attributes>([
      [["columnalign", "right"]],
      [
        ["columnalign", "left"],
        ["rowlines", "solid"],
      ],
      [
        ["columnlines", "dotted"],
        ["frame", "dashed"],
      ],
      [
        ["columnspacing", "1em"],
        ["rowspacing", "4pt"],
      ],
    ]),
    Array.from({ length: 1 + chance.below(3) }, () =>
      el(
        "mtr",
        none,
        Array.from({ length: columns }, () =>
          el("mtd", chance.pick<Attributes>([none, [["class", "qti-align-right"]]]), [cell()]),
        ),
      ),
    ),
  );
};

/**
 * Draw a layout element, its children drawn in turn, or a token at the bottom.
 *
 * @param chance The source of choices.
 * @param depth How many more levels it may nest.
 * @returns The element.
 */
const part = (chance: Chance, depth: number): Child => {
  if (depth === 0 || chance.below(4) === 0) {
    return token(chance);
  }

  const inner = (): Child => part(chance, depth - 1);
  const row = (): readonly Child[] => Array.from({ length: 1 + chance.below(3) }, inner);

  return chance.pick<() => Child>([
    () => el("mrow", chance.pick([none, none, borderedClass]), row()),
    () =>
      el("mfrac", chance.pick<Attributes>([none, [["linethickness", "0"]]]), [inner(), inner()]),
    () => el("msqrt", none, row()),
    () => el("mroot", none, [inner(), inner()]),
    () => el(chance.pick(["msup", "msub"]), none, [inner(), inner()]),
    () => el("msubsup", none, [inner(), inner(), inner()]),
    () =>
      el("munder", chance.pick<Attributes>([none, [["accentunder", "true"]]]), [inner(), inner()]),
    () => el("mover", chance.pick<Attributes>([none, [["accent", "true"]]]), [inner(), inner()]),
    () => el("munderover", none, [el("mo", none, [tx("∑")]), inner(), inner()]),
    () =>
      el(
        "mstyle",
        chance.pick<Attributes>([[["displaystyle", "true"]], [["scriptlevel", "1"]]]),
        row(),
      ),
    () =>
      el(
        "menclose",
        [["notation", chance.pick(["box", "bottom", "updiagonalstrike", "circle", "roundedbox"])]],
        row(),
      ),
    () => el("mpadded", [["width", "+1em"]], row()),
    () => el("mphantom", none, row()),
    () => el("mn", [["mathcolor", "red"]], [tx("4")]),
    () => table(chance, inner),
    () =>
      el(
        "maction",
        [
          ["actiontype", "toggle"],
          ["selection", chance.pick(["1", "2"])],
        ],
        [inner(), inner()],
      ),
  ])();
};

/**
 * Draw a formula: a `math` element, a display formula at times, its content in a `semantics`
 * beside a TeX annotation at times, as the AlphaTest converter writes every formula.
 *
 * @param seed The seed.
 * @returns The formula.
 */
const drawnFormula = (seed: number): Formula => {
  const chance = chanceOf(seed);
  const body = el(
    "mrow",
    none,
    Array.from({ length: 1 + chance.below(4) }, () => part(chance, 3)),
  );
  const children =
    chance.below(2) === 0
      ? [body]
      : [
          el("semantics", none, [
            body,
            el("annotation", [["encoding", "application/x-tex"]], [tx("x^2")]),
          ]),
        ];

  return {
    attributes: chance.below(5) === 0 ? [{ name: "display", value: "block" }] : [],
    children,
    kind: "element",
    local: "math",
  };
};

/**
 * A `math` element holding some children.
 *
 * @param children The children.
 * @returns The formula.
 */
const mathOf = (children: readonly Child[]): Formula => ({
  attributes: [],
  children,
  kind: "element",
  local: "math",
});

/**
 * The formulas of the AlphaTest corpus's commonest kinds: a fraction beside a boxed blank, as the
 * converter writes `\boxed{?}`; digits lined up right in a table under a bar, as it writes a
 * column sum's `menclose` bottom; and a degree sign beside a cent sign, which MathJax's fonts lack.
 */
const corpusFormulas: readonly Formula[] = [
  mathOf([
    el("semantics", none, [
      el("mrow", none, [
        el("mfrac", none, [el("mn", none, [tx("3")]), el("mn", none, [tx("4")])]),
        el("mo", none, [tx("=")]),
        el("mrow", borderedClass, [
          el(
            "mstyle",
            [
              ["displaystyle", "true"],
              ["scriptlevel", "0"],
            ],
            [el("mo", none, [tx("?")])],
          ),
        ]),
      ]),
      el("annotation", [["encoding", "application/x-tex"]], [tx(String.raw`\frac34=\boxed{?}`)]),
    ]),
  ]),
  mathOf([
    el(
      "munder",
      [["accentunder", "true"]],
      [
        el("mrow", none, [
          el(
            "mtable",
            [
              ["columnalign", "right"],
              ["columnspacing", "1em"],
              ["rowspacing", "4pt"],
            ],
            [
              el("mtr", none, [
                el("mtd", [["class", "qti-align-right"]], [el("mn", none, [tx("345")])]),
              ]),
              el("mtr", none, [
                el(
                  "mtd",
                  [["class", "qti-align-right"]],
                  [el("mo", none, [tx("+")]), el("mn", none, [tx("27")])],
                ),
              ]),
            ],
          ),
        ]),
        el("mo", [["stretchy", "true"]], [tx("―")]),
      ],
    ),
  ]),
  mathOf([
    el("mrow", none, [
      el("mn", none, [tx("90")]),
      el("mo", none, [tx("°")]),
      el("mtext", none, [tx(" and ")]),
      el("mn", none, [tx("5")]),
      el("mtext", none, [tx("¢")]),
    ]),
  ]),
];

/**
 * Draw a formula holding slots, each where a seeded choice puts it: after an equals sign, in a
 * fraction's numerator or its denominator, under a radical, or as a power's base.
 *
 * @param seed The seed.
 * @returns The formula, each slot's `mspace` marked by the id it names.
 */
const slottedFormula = (seed: number): Formula => {
  const chance = chanceOf(seed);
  const ids = Array.from(
    { length: 1 + chance.below(3) },
    (_, index) => `s${String(seed)}-${String(index)}`,
  );

  return mathOf([
    el(
      "mrow",
      none,
      ids.map((id) => {
        const slot = el("mspace", [[slotMark, id]], []);

        return chance.pick([
          () => el("mrow", none, [el("mn", none, [tx("3")]), el("mo", none, [tx("=")]), slot]),
          () => el("mfrac", none, [el("mn", none, [tx("3")]), slot]),
          () => el("mfrac", none, [slot, el("mn", none, [tx("10")])]),
          () => el("msqrt", none, [slot]),
          () => el("msup", none, [slot, el("mn", none, [tx("2")])]),
        ])();
      }),
    ),
  ]);
};

/**
 * The formulas each property is checked on: the corpus's kinds, 300 drawn ones and 60 holding
 * slots.
 */
const formulas: readonly Formula[] = [
  ...corpusFormulas,
  ...Array.from({ length: 300 }, (_, index) => drawnFormula(index + 1)),
  ...Array.from({ length: 60 }, (_, index) => slottedFormula(index + 1)),
];

/**
 * Find the elements of a lite tree, at any depth, that a predicate selects, in document order.
 *
 * @param root The tree.
 * @param selects The predicate.
 * @returns The elements.
 */
const elementsOf = (root: LiteElement, selects: (element: LiteElement) => boolean): LiteElement[] =>
  adaptor
    .childNodes(root)
    .flatMap((child) =>
      adaptor.kind(child) === "#text" || !("children" in child)
        ? []
        : [...(selects(child) ? [child] : []), ...elementsOf(child, selects)],
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
 * Read a length in `ex`, or a percentage.
 *
 * @param text The length.
 * @returns The number, NaN for anything else.
 */
const numberOf = (text: string | undefined): number =>
  Number((text ?? "").replace(regex("(?:ex|%)$", "u"), ""));

/**
 * The SVG name of each attribute that draws, by the name React writes it under.
 */
const svgNameOf: ReadonlyMap<string, string> = new Map(
  [...drawnAttributes].map(([svg, react]) => [react, svg] as const),
);

/**
 * The SVG names of the attributes that draw.
 */
const svgNames: ReadonlySet<string> = new Set(drawnAttributes.keys());

/**
 * The SVG elements a drawing keeps.
 */
const drawnNames: ReadonlySet<string> = new Set([
  "ellipse",
  "g",
  "image",
  "line",
  "path",
  "polygon",
  "rect",
  "svg",
  "text",
]);

/**
 * Write a drawing back as SVG, each attribute under its SVG name, so it is read as MathJax's own
 * output is: an attribute under a name React does not map keeps that name, which no SVG attribute
 * has.
 *
 * @param drawn The drawing's element.
 * @returns The element, as a lite tree.
 */
const svgOf = (drawn: Extract<Drawn, { readonly kind: "element" }>): LiteElement =>
  adaptor.node(
    drawn.name,
    Object.fromEntries(
      drawn.attributes.map(({ name, value }) => [svgNameOf.get(name) ?? `react:${name}`, value]),
    ),
    drawn.children.map((child) =>
      child.kind === "element" ? svgOf(child) : adaptor.text(child.text),
    ),
  );

/**
 * The attributes MathJax's stylesheet or a `style` sets on an element, which the drawing writes
 * over MathJax's own: an element's own attribute stands in the drawing unless one of these does.
 *
 * @param element An element of MathJax's output.
 * @returns The names.
 */
const restyled = (element: LiteElement): ReadonlySet<string> =>
  new Set([
    ...(attr(element, "data-c") === undefined ? [] : ["stroke-width"]),
    ...(attr(element, "data-line") === undefined && attr(element, "data-frame") === undefined
      ? []
      : ["stroke-width", "fill", "stroke-dasharray", "stroke-linecap"]),
    ...(attr(element, "style") ?? "")
      .split(";")
      .map((declaration) => declaration.split(":")[0]?.trim() ?? ""),
  ]);

/**
 * A property's verdict on one formula: none when it holds, else what broke.
 */
type Verdict = readonly string[];

/**
 * A formula, its slots' sizes, its drawing by a drawer, the drawing written back as SVG, and
 * MathJax's own `svg` of it.
 */
interface Case {
  readonly drawer: Drawer;
  readonly drawing: Drawing;
  readonly formula: Formula;
  readonly sizes: ReadonlyMap<string, SlotSize>;
  readonly svg: ReturnType<typeof adaptor.firstChild>;
  readonly written: LiteElement;
}

/**
 * MathJax's own `svg` of each formula, typeset once for every drawer that draws it.
 */
const mathjaxSvgs = new WeakMap<Formula, ReturnType<typeof adaptor.firstChild>>();

/**
 * Draw a formula through a drawer, beside MathJax's own `svg` of it.
 *
 * @param drawer The drawer.
 * @param formula The formula.
 * @param sizes Its slots' sizes.
 * @returns The case.
 */
const caseOf = (drawer: Drawer, formula: Formula, sizes: ReadonlyMap<string, SlotSize>): Case => {
  const drawing = drawer(formula, sizes);
  const svg = mathjaxSvgs.get(formula) ?? adaptor.firstChild(typeset(formula, sizes));

  mathjaxSvgs.set(formula, svg);

  return { drawer, drawing, formula, sizes, svg, written: svgOf(drawing.drawing) };
};

/**
 * The drawing holds MathJax's SVG elements that draw, in order, each with every attribute MathJax
 * wrote on it that draws, at its value.
 *
 * @param check The formula and its drawing.
 * @returns What broke.
 */
const drawn = ({ svg, written }: Case): Verdict => {
  if (adaptor.kind(svg) !== "svg" || !("children" in svg)) {
    return ["MathJax drew no svg"];
  }

  const ours = [written, ...elementsOf(written, () => true)];
  const theirs = [svg, ...elementsOf(svg, (element) => drawnNames.has(element.kind))].filter(
    (element) => drawnNames.has(element.kind),
  );

  if (ours.length !== theirs.length) {
    return [`${String(ours.length)} drawn elements where MathJax drew ${String(theirs.length)}`];
  }

  return theirs.flatMap((element, index) => {
    const mine = ours[index];

    if (mine === undefined || mine.kind !== element.kind) {
      return [
        `element ${String(index)} is ${mine?.kind ?? "missing"} where MathJax drew ${element.kind}`,
      ];
    }

    const over = restyled(element);

    return adaptor
      .allAttributes(element)
      .filter(
        ({ name }) => svgNames.has(name) && !over.has(name) && !(index === 0 && name === "height"),
      )
      .flatMap(({ name, value }) =>
        attr(mine, name) === value
          ? []
          : [
              `${element.kind} ${String(index)}'s ${name} is ${String(attr(mine, name))} where MathJax wrote ${value}`,
            ],
      );
  });
};

/**
 * The formula's height and depth together are MathJax's `svg`'s height, its depth as deep as
 * MathJax's `vertical-align` lowers it, and its width MathJax's.
 *
 * @param check The formula and its drawing.
 * @returns What broke.
 */
const baseline = ({ drawing, svg }: Case): Verdict => {
  if (!("children" in svg)) {
    return ["MathJax drew no svg"];
  }

  const total = numberOf(attr(svg, "height"));
  const lowered = -numberOf(adaptor.getStyle(svg, "vertical-align"));

  return [
    ...(Math.abs(numberOf(drawing.height) + numberOf(drawing.depth) - total) > 0.0015 ||
    Math.abs(numberOf(drawing.total) - total) > 0.0015
      ? [
          `height ${drawing.height} + depth ${drawing.depth}, total ${drawing.total}, where MathJax's svg is ${String(total)}ex`,
        ]
      : []),
    ...(Math.abs(numberOf(drawing.depth) - lowered) > 0.0015
      ? [`depth ${drawing.depth} where MathJax lowers ${String(lowered)}ex`]
      : []),
    ...(drawing.width === attr(svg, "width")
      ? []
      : [`width ${drawing.width} where MathJax's svg is ${String(attr(svg, "width"))}`]),
  ];
};

/**
 * Remove `qti-bordered` from every element of a tree.
 *
 * @param children The children.
 * @returns The children, the class gone.
 */
const unbordered = (children: readonly Child[]): readonly Child[] =>
  children.map((child) =>
    child.kind === "element"
      ? {
          ...child,
          attributes: child.attributes.filter(
            ({ name, value }: MathAttribute) => !(name === "class" && value === "qti-bordered"),
          ),
          children: unbordered(child.children),
        }
      : child,
  );

/**
 * The children of an element that MathJax draws: none of an `mphantom`, which takes its content's
 * room and draws none of it; only the selected one of an `maction`; all of any other.
 *
 * @param element The element.
 * @returns The children it draws.
 */
const drawnChildren = (element: Extract<Child, { readonly kind: "element" }>): readonly Child[] => {
  if (element.local === "mphantom") {
    return [];
  }

  if (element.local === "maction") {
    const selection = Number(
      element.attributes.find(({ name }) => name === "selection")?.value ?? "1",
    );
    const selected = element.children.filter((child) => child.kind === "element")[selection - 1];

    return selected === undefined ? [] : [selected];
  }

  return element.children;
};

/**
 * The elements of a tree MathJax draws, in document order ({@link drawnChildren}).
 *
 * @param children The children.
 * @returns The elements drawn.
 */
const drawnElements = (
  children: readonly Child[],
): readonly Extract<Child, { readonly kind: "element" }>[] =>
  children.flatMap((child) =>
    child.kind === "element" ? [child, ...drawnElements(drawnChildren(child))] : [],
  );

/**
 * Count the elements carrying `qti-bordered` that MathJax draws in a tree.
 *
 * @param children The children.
 * @returns How many carry it.
 */
const borderedCount = (children: readonly Child[]): number =>
  drawnElements(children).filter((element) =>
    element.attributes.some(({ name, value }) => name === "class" && value === "qti-bordered"),
  ).length;

/**
 * A colour a formula's `style` states, as the drawing writes it: the value of its `color`
 * declaration, without `!important`.
 *
 * @param element An element of the formula.
 * @returns The colour, none when its style states none.
 */
const styledColour = (element: Extract<Child, { readonly kind: "element" }>): readonly string[] =>
  (element.attributes.find(({ name }) => name === "style")?.value ?? "")
    .split(";")
    .flatMap((declaration) => {
      const [property, value] = declaration.split(":");

      return property?.trim() === "color" && value !== undefined
        ? [value.replace(regex("!\\s*important\\s*$", "iu"), "").trim()]
        : [];
    });

/**
 * Each colour a drawn element's `style` states is drawn: the drawing carries it as a `color`.
 *
 * @param check The formula and its drawing.
 * @returns What broke.
 */
const coloured = ({ formula, written }: Case): Verdict => {
  const colours = new Set(
    elementsOf(written, (element) => attr(element, "color") !== undefined).map(
      (element) => attr(element, "color") ?? "",
    ),
  );

  return drawnElements(formula.children)
    .flatMap(styledColour)
    .flatMap((colour) => (colours.has(colour) ? [] : [`the colour ${colour} is not drawn`]));
};

/**
 * Remove every `style` from a tree.
 *
 * @param children The children.
 * @returns The children, their styles gone.
 */
const unstyledTree = (children: readonly Child[]): readonly Child[] =>
  children.map((child) =>
    child.kind === "element"
      ? {
          ...child,
          attributes: child.attributes.filter(({ name }) => name !== "style"),
          children: unstyledTree(child.children),
        }
      : child,
  );

/**
 * Count the rectangles a drawing written back as SVG draws.
 *
 * @param written The drawing.
 * @returns How many `rect` elements it holds.
 */
const rects = (written: LiteElement): number =>
  elementsOf(written, (element) => element.kind === "rect").length;

/**
 * Each element carrying `qti-bordered` is drawn inside a box: the drawing holds one more rectangle
 * for each than the same formula's without the class.
 *
 * @param check The formula and its drawing.
 * @returns What broke.
 */
const bordered = ({ drawer, formula, sizes, written }: Case): Verdict => {
  const count = borderedCount(formula.children);
  if (count === 0) {
    return [];
  }

  const bare = svgOf(drawer({ ...formula, children: unbordered(formula.children) }, sizes).drawing);

  return rects(written) - rects(bare) === count
    ? []
    : [`${String(rects(written) - rects(bare))} boxes for ${String(count)} qti-bordered elements`];
};

/**
 * Drawing a formula again gives the same drawing.
 *
 * @param check The formula and its drawing.
 * @returns What broke.
 */
const settled = ({ drawer, drawing, formula, sizes }: Case): Verdict =>
  JSON.stringify(drawer(formula, sizes)) === JSON.stringify(drawing)
    ? []
    : ["a second drawing differs"];

/**
 * Give the ids the slots of a formula name, in document order.
 *
 * @param children The formula's children.
 * @returns The ids.
 */
const slotIds = (children: readonly Child[]): readonly string[] =>
  children.flatMap((child) => {
    if (child.kind !== "element") {
      return [];
    }

    const id = child.attributes.find(({ name }) => name === slotMark)?.value;

    return [...(id === undefined ? [] : [id]), ...slotIds(child.children)];
  });

/**
 * Each slot a formula holds is placed once, by the id it names, its box inside the formula's.
 *
 * @param check The formula and its drawing.
 * @returns What broke.
 */
const inside = ({ drawing, formula }: Case): Verdict => {
  const expected = slotIds(formula.children).toSorted().join(" ");
  const placed = drawing.slots
    .map(({ id }) => id)
    .toSorted()
    .join(" ");

  return [
    ...(expected === placed ? [] : [`slots ${placed} placed where the formula holds ${expected}`]),
    ...drawing.slots.flatMap((slot) => {
      const [x, y, width, height] = [slot.x, slot.y, slot.width, slot.height].map(numberOf);
      const within =
        x !== undefined &&
        y !== undefined &&
        width !== undefined &&
        height !== undefined &&
        x >= 0 &&
        y >= 0 &&
        width > 0 &&
        height > 0 &&
        x + width <= 100.01 &&
        y + height <= 100.01;

      return within
        ? []
        : [`slot ${slot.id} at ${slot.x} ${slot.y}, ${slot.width} by ${slot.height}`];
    }),
  ];
};

/**
 * The properties, by name.
 */
const properties: ReadonlyMap<string, (check: Case) => Verdict> = new Map([
  ["drawn", drawn],
  ["baseline", baseline],
  ["bordered", bordered],
  ["settled", settled],
  ["coloured", coloured],
  ["inside", inside],
]);

/**
 * The sizes of a formula's slots, by the id each names: a Text Entry's, an Inline Choice's or a
 * gap's, by the id's place.
 *
 * @param formula The formula.
 * @returns The sizes.
 */
const sizesOf = (formula: Formula): ReadonlyMap<string, SlotSize> =>
  new Map(
    slotIds(formula.children).map((id, index) => {
      const sizes = [
        textEntrySlot(Option.some(BigInt(index % 9))),
        inlineChoiceSlot(index * 3),
        gapSlot,
      ] as const;

      return [id, sizes[index % sizes.length] ?? gapSlot] as const;
    }),
  );

/**
 * Check properties on the formulas through a drawer, each until it first breaks.
 *
 * @param drawer The drawer.
 * @param names The properties to check.
 * @returns Each broken property's name, with the first formula it broke on and what broke.
 */
const broken = (drawer: Drawer, names: readonly string[]): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();

  for (const [index, formula] of formulas.entries()) {
    const open = names.filter((name) => !breaks.has(name));

    if (open.length === 0) {
      break;
    }

    const check = caseOf(drawer, formula, sizesOf(formula));

    for (const name of open) {
      const verdict = properties.get(name)?.(check) ?? [];

      if (verdict.length > 0) {
        breaks.set(name, `formula ${String(index)}: ${verdict.slice(0, 3).join("; ")}`);
      }
    }
  }

  return breaks;
};

/**
 * Change the drawing a formula's draw gives.
 *
 * @param change The change.
 * @returns The drawer whose drawing is plate's, changed.
 */
const changing =
  (change: (drawing: Drawing) => Drawing): Drawer =>
  (formula, sizes) =>
    change(draw(formula, sizes));

/**
 * Rename or drop attributes of every element of a drawing.
 *
 * @param element The drawing's element.
 * @param rename Each attribute's new name, none to drop it.
 * @returns The element changed.
 */
const renamed = (
  element: Extract<Drawn, { readonly kind: "element" }>,
  rename: (name: string) => string | undefined,
): Extract<Drawn, { readonly kind: "element" }> => ({
  ...element,
  attributes: element.attributes.flatMap(({ name, value }) => {
    const next = rename(name);

    return next === undefined ? [] : [{ name: next, value }];
  }),
  children: element.children.map((child) =>
    child.kind === "element" ? renamed(child, rename) : child,
  ),
});

/**
 * A drawer that numbers its glyph ids by the drawings it has drawn, as MathJax's local font cache
 * writes them: each drawer it makes counts its own drawings, from 1.
 *
 * @returns The counting drawer.
 */
const counting = (): Drawer => {
  let drawings = 0;

  return changing((drawing) => {
    drawings += 1;

    return {
      ...drawing,
      drawing: {
        ...drawing.drawing,
        attributes: [
          ...drawing.drawing.attributes,
          { name: "id", value: `MJX-${String(drawings)}` },
        ],
      },
    };
  });
};

/**
 * The mutants: each a way the drawing could break, the property that refuses it, and its drawer.
 */
const mutants: readonly (readonly [name: string, property: string, drawer: Drawer])[] = [
  [
    "the depth taken as none, so the formula stands on its foot",
    "baseline",
    changing((drawing) => ({ ...drawing, depth: "0ex" })),
  ],
  [
    "a presentation attribute written under a name React does not map",
    "drawn",
    changing((drawing) => ({
      ...drawing,
      drawing: renamed(drawing.drawing, (name) => (name === "strokeWidth" ? "strokewidth" : name)),
    })),
  ],
  [
    "a group's transform dropped",
    "drawn",
    changing((drawing) => ({
      ...drawing,
      drawing: renamed(drawing.drawing, (name) => (name === "transform" ? undefined : name)),
    })),
  ],
  [
    "the formula's style left out of what MathJax reads",
    "coloured",
    (formula, sizes) => draw({ ...formula, children: unstyledTree(formula.children) }, sizes),
  ],
  [
    "qti-bordered drawn as no box",
    "bordered",
    (formula, sizes) => draw({ ...formula, children: unbordered(formula.children) }, sizes),
  ],
  [
    "glyph ids drawn from a counter, as MathJax's local font cache writes them",
    "settled",
    counting(),
  ],
  [
    "a slot placed beside the formula",
    "inside",
    changing((drawing) => ({
      ...drawing,
      slots: drawing.slots.map((slot) => ({ ...slot, x: `${String(numberOf(slot.x) + 100)}%` })),
    })),
  ],
  [
    "a slot left unplaced",
    "inside",
    changing((drawing) => ({ ...drawing, slots: drawing.slots.slice(1) })),
  ],
];

describe("a formula as plate draws it", () => {
  it("holds every property on the corpus's shapes, 300 drawn formulas and 60 holding slots", () => {
    assert.deepStrictEqual(Object.fromEntries(broken(draw, [...properties.keys()])), {});
  });

  it.each(mutants)("refuses a mutant: %s (%s)", (_name, property, drawer) => {
    assert.include([...broken(drawer, [property]).keys()], property);
  });
});
