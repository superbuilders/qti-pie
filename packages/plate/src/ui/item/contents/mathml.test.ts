/**
 * A formula as the server shell writes it (`content` of `#plate/ui/item/contents/mathml.tsx`):
 * MathJax's drawing, standing on the baseline as MathJax's own output stands, and the author's
 * MathML beside it for assistive technology. Each property is checked on formulas a seeded
 * generator draws from presentation MathML (tokens, rows, fractions, roots, scripts, limits,
 * tables with rules and alignments, enclosures, spaces, styles, characters MathJax's fonts lack,
 * `qti-bordered` rows, display formulas, `semantics` beside a TeX annotation, as the AlphaTest
 * converter writes it), and on the shapes the AlphaTest corpus holds most, through React's server
 * renderer, the HTML read back with MathJax's own lite parser.
 *
 * The properties, against MathJax's own SVG output for the same formula (`typeset`):
 *
 * - **drawn:** the drawing holds MathJax's SVG elements that draw, in order, each with every
 *   attribute MathJax wrote on it that draws, at its value, under its SVG name;
 * - **baseline:** the height box and the depth box together are as tall as MathJax's `svg`, the depth
 *   box as deep as MathJax's `vertical-align` lowers it, and the height box as wide;
 * - **unstyled:** nothing plate writes around the MathML carries a `style`, a `class` or an `id`, and
 *   the drawing is hidden from assistive technology;
 * - **voiced:** the formula's MathML stands beside the drawing, each element with its attributes and
 *   its text, as the author wrote it;
 * - **bordered:** each element carrying `qti-bordered` is drawn inside a box, one more rectangle in
 *   the drawing than the same formula without the class;
 * - **settled:** drawing a formula again writes the same HTML;
 * - **coloured:** each colour a drawn element's `style` states (AlphaTest's coloured digits) is
 *   drawn, as the drawing's `color`.
 *
 * Kills: each mutant of the shell's output, a way the writing could break, is refused by the
 * property it breaks, so a pass is a pass of properties that see these breaks.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { renderToStaticMarkup } from "react-dom/server";
import type { MathAttribute, MathChild, MathNode } from "#plate/content/mathml.ts";
import { elementAttributes } from "#plate/content/mathml-attributes.ts";
import type { RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import { noSlots } from "#plate/ui/item/content.tsx";
import type { ContentWalk } from "#plate/ui/item/content.tsx";
import { drawnAttributes, typeset } from "#plate/ui/item/contents/mathjax.ts";
import { content } from "#plate/ui/item/contents/mathml.tsx";

/**
 * A formula of the suite: the `math` element's tree, as the redacted body holds it.
 */
type Formula = MathNode<RedactedLevel>;

/**
 * A child of a formula's tree.
 */
type Child = MathChild<RedactedNode>;

/**
 * The shell's writing of a formula, as React's server renderer writes its HTML, which a mutant
 * replaces.
 */
type Writer = (formula: Formula) => string;

/**
 * The adaptor the suite reads HTML and MathJax's output through.
 */
const adaptor = liteAdaptor();

/**
 * A walk where a formula stands in a body: the instance `i` of `items/x.xml`, no assets, its ids
 * written, no credit, English, plain content, at a flow position.
 */
const walk: ContentWalk = {
  key: "m",
  nodes: () => [],
  walk: {
    addressing: { assets: new Map(), document: "items/x.xml", instance: "i", writing: "original" },
    credit: Option.none(),
    headingOffset: 0,
    locale: "en",
    scope: { kind: "plain" },
    slots: noSlots,
    standing: "flow",
  },
};

/**
 * Write a formula as the server shell writes it.
 *
 * @param formula The formula.
 * @returns Its `plate-math`, as HTML.
 */
const written: Writer = (formula) =>
  renderToStaticMarkup(content({ element: "math", kind: "content", payload: formula }, walk));

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
 * The formulas each property is checked on: the corpus's kinds and 300 drawn ones.
 */
const formulas: readonly Formula[] = [
  ...corpusFormulas,
  ...Array.from({ length: 300 }, (_, index) => drawnFormula(index + 1)),
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
 * Find the element a page holds by its `data-slot`.
 *
 * @param root The page.
 * @param slot The slot.
 * @returns The first element of that slot, undefined when the page holds none.
 */
const slotted = (root: LiteElement, slot: string): LiteElement | undefined =>
  elementsOf(root, (element) => attr(element, "data-slot") === slot)[0];

/**
 * Read a length in `ex`.
 *
 * @param text The length.
 * @returns The number of `ex`, NaN for anything else.
 */
const exOf = (text: string | undefined): number => Number((text ?? "").replace(/ex$/u, ""));

/**
 * The SVG names of the attributes that draw, by the name React writes each under.
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
 * Write a formula through a writer, as React's server renderer writes it, and read the HTML back.
 *
 * @param writer The writer.
 * @param formula The formula.
 * @returns The page's body.
 */
const pageOf = (writer: Writer, formula: Formula): LiteElement =>
  adaptor.body(adaptor.parse(`<p>${writer(formula)}</p>`, "text/html"));

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
 * A formula, its writing by a writer, read back as a page, and MathJax's own `svg` of it.
 */
interface Case {
  readonly formula: Formula;
  readonly html: string;
  readonly page: LiteElement;
  readonly svg: ReturnType<typeof adaptor.firstChild>;
  readonly writer: Writer;
}

/**
 * MathJax's own `svg` of each formula, typeset once for every writer that writes it.
 */
const mathjaxSvgs = new WeakMap<Formula, ReturnType<typeof adaptor.firstChild>>();

/**
 * Write a formula through a writer and read it back, beside MathJax's own `svg` of it.
 *
 * @param writer The writer.
 * @param formula The formula.
 * @returns The case.
 */
const caseOf = (writer: Writer, formula: Formula): Case => {
  const html = writer(formula);
  const svg = mathjaxSvgs.get(formula) ?? adaptor.firstChild(typeset(formula));

  mathjaxSvgs.set(formula, svg);

  return {
    formula,
    html,
    page: adaptor.body(adaptor.parse(`<p>${html}</p>`, "text/html")),
    svg,
    writer,
  };
};

/**
 * The drawing holds MathJax's SVG elements that draw, in order, each with every attribute MathJax
 * wrote on it that draws, at its value.
 *
 * @param check The formula and its writing.
 * @returns What broke.
 */
const drawn = ({ page, svg }: Case): Verdict => {
  const drawing = slotted(page, "plate-math-drawing");

  if (drawing === undefined || adaptor.kind(svg) !== "svg" || !("children" in svg)) {
    return ["no drawing"];
  }

  const ours = [drawing, ...elementsOf(drawing, () => true)];
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
 * The height box and the depth box together are as tall as MathJax's `svg`, the depth box as deep
 * as MathJax's `vertical-align` lowers it, and the height box as wide as it.
 *
 * @param check The formula and its writing.
 * @returns What broke.
 */
const baseline = ({ page, svg }: Case): Verdict => {
  const height = slotted(page, "plate-math-height");
  const depth = slotted(page, "plate-math-depth");

  if (height === undefined || depth === undefined || !("children" in svg)) {
    return ["no height or depth box"];
  }

  const total = exOf(attr(svg, "height"));
  const lowered = -exOf(adaptor.getStyle(svg, "vertical-align"));
  const breaks = [
    ...(Math.abs(exOf(attr(height, "height")) + exOf(attr(depth, "height")) - total) > 0.0015
      ? [
          `boxes ${String(attr(height, "height"))} + ${String(attr(depth, "height"))} where MathJax's svg is ${String(total)}ex`,
        ]
      : []),
    ...(Math.abs(exOf(attr(depth, "height")) - lowered) > 0.0015
      ? [`depth ${String(attr(depth, "height"))} where MathJax lowers ${String(lowered)}ex`]
      : []),
    ...(attr(height, "width") === attr(svg, "width")
      ? []
      : [
          `width ${String(attr(height, "width"))} where MathJax's svg is ${String(attr(svg, "width"))}`,
        ]),
  ];

  return breaks;
};

/**
 * Nothing plate writes around the MathML carries a `style`, a `class` or an `id`, the boxes hold
 * nothing, and the drawing is hidden from assistive technology.
 *
 * @param check The formula and its writing.
 * @returns What broke.
 */
const unstyled = ({ page }: Case): Verdict => {
  const root = slotted(page, "plate-math");
  const box = slotted(page, "plate-math-box");
  const drawing = slotted(page, "plate-math-drawing");

  if (root === undefined || box === undefined || drawing === undefined) {
    return ["no formula"];
  }

  const ours = [root, box, ...elementsOf(box, () => true)];

  return [
    ...ours.flatMap((element) =>
      ["style", "class", "id"].flatMap((name) =>
        attr(element, name) === undefined ? [] : [`${element.kind} carries ${name}`],
      ),
    ),
    ...(attr(drawing, "aria-hidden") === "true" ? [] : ["the drawing is not hidden"]),
    ...["plate-math-height", "plate-math-depth"].flatMap((slot) => {
      const strut = slotted(page, slot);

      return strut === undefined || adaptor.childNodes(strut).length === 0
        ? []
        : [`${slot} holds content`];
    }),
  ];
};

/**
 * Write a formula's tree as its elements in document order, each its local name and the
 * attributes plate writes on it, and its text.
 *
 * @param children The children.
 * @returns Each element as `name[attributes]`, text as itself.
 */
const outline = (children: readonly Child[]): readonly string[] =>
  children.flatMap((child) => {
    switch (child.kind) {
      case "annotation-xml": {
        return ["annotation-xml"];
      }
      case "element": {
        const attributes = child.attributes
          .filter(({ name }) => elementAttributes.get(child.local)?.has(name) === true)
          .map(({ name, value }) => `${name}=${value}`)
          .toSorted()
          .join(" ");

        return [`${child.local}[${attributes}]`, ...outline(child.children)];
      }
      case "text": {
        return [child.text];
      }
      default: {
        return child satisfies never;
      }
    }
  });

/**
 * Write a lite element's descendants as {@link outline} writes a tree.
 *
 * @param element The element.
 * @returns Its descendants, in document order.
 */
const liteOutline = (element: LiteElement): readonly string[] =>
  adaptor.childNodes(element).flatMap((child) => {
    if (adaptor.kind(child) === "#text") {
      return [adaptor.value(child)];
    }

    if (!("children" in child)) {
      return [];
    }

    const attributes = adaptor
      .allAttributes(child)
      .map(({ name, value }) => `${name}=${value}`)
      .toSorted()
      .join(" ");

    return [`${child.kind}[${attributes}]`, ...liteOutline(child)];
  });

/**
 * The formula's MathML stands beside the drawing: one `math` in `plate-math`, holding each element
 * with its attributes and its text, as the author wrote it.
 *
 * @param check The formula and its writing.
 * @returns What broke.
 */
const voiced = ({ formula, page }: Case): Verdict => {
  const root = slotted(page, "plate-math");
  const maths = root === undefined ? [] : elementsOf(root, (element) => element.kind === "math");
  const [math] = maths;

  if (math === undefined || maths.length !== 1) {
    return [`${String(maths.length)} math elements beside the drawing`];
  }

  const expected = outline(formula.children).join("\n");
  const found = liteOutline(math).join("\n");

  return expected === found
    ? []
    : [`the MathML reads\n${found}\nwhere the author wrote\n${expected}`];
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
        ? [value.replace(/!\s*important\s*$/iu, "").trim()]
        : [];
    });

/**
 * Each colour a drawn element's `style` states is drawn: the drawing carries it as a `color`.
 *
 * @param check The formula and its writing.
 * @returns What broke.
 */
const coloured = ({ formula, page }: Case): Verdict => {
  const drawing = slotted(page, "plate-math-drawing");
  const colours = new Set(
    drawing === undefined
      ? []
      : elementsOf(drawing, (element) => attr(element, "color") !== undefined).map(
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
 * Count the rectangles a page draws.
 *
 * @param page The page.
 * @returns How many `rect` elements it holds.
 */
const rects = (page: LiteElement): number =>
  elementsOf(page, (element) => element.kind === "rect").length;

/**
 * Each element carrying `qti-bordered` is drawn inside a box: the drawing holds one more
 * rectangle for each than the same formula's without the class.
 *
 * @param writer The writer.
 * @param check The formula and its writing.
 * @returns What broke.
 */
const bordered = ({ formula, page, writer }: Case): Verdict => {
  const count = borderedCount(formula.children);
  if (count === 0) {
    return [];
  }

  const bare = pageOf(writer, { ...formula, children: unbordered(formula.children) });

  return rects(page) - rects(bare) === count
    ? []
    : [`${String(rects(page) - rects(bare))} boxes for ${String(count)} qti-bordered elements`];
};

/**
 * Drawing a formula again writes the same HTML.
 *
 * @param check The formula and its writing.
 * @returns What broke.
 */
const settled = ({ formula, html, writer }: Case): Verdict =>
  writer(formula) === html ? [] : ["a second drawing differs"];

/**
 * The properties, by name.
 */
const properties: ReadonlyMap<string, (check: Case) => Verdict> = new Map([
  ["drawn", drawn],
  ["baseline", baseline],
  ["unstyled", unstyled],
  ["voiced", voiced],
  ["bordered", bordered],
  ["settled", settled],
  ["coloured", coloured],
]);

/**
 * Check properties on the formulas through a writer, each until it first breaks.
 *
 * @param writer The writer.
 * @param names The properties to check.
 * @returns Each broken property's name, with the first formula it broke on and what broke.
 */
const broken = (
  writer: Writer,
  names: readonly string[] = [...properties.keys()],
): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();

  for (const [index, formula] of formulas.entries()) {
    const open = names.filter((name) => !breaks.has(name));

    if (open.length === 0) {
      break;
    }

    const check = caseOf(writer, formula);

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
 * Rewrite the HTML a writer writes.
 *
 * @param rewrite The rewrite.
 * @returns The writer whose HTML is the shell's, rewritten.
 */
const rewriting =
  (rewrite: (html: string) => string): Writer =>
  (formula) =>
    rewrite(written(formula));

/**
 * The drawings the counting mutant has written, which it numbers its ids by.
 */
let drawings = 0;

/**
 * The mutants: each a way the shell's writing could break, the property that refuses it, and its
 * writer.
 */
const mutants: readonly (readonly [name: string, property: string, writer: Writer])[] = [
  [
    "the depth box written empty, so the formula stands on its foot",
    "baseline",
    rewriting((html) =>
      html.replace(/(?<open>data-slot="plate-math-depth" height=")[^"]*"/u, '$<open>0"'),
    ),
  ],
  [
    "MathJax's vertical-align kept on the drawing as a style",
    "unstyled",
    rewriting((html) =>
      html.replace(
        'data-slot="plate-math-drawing"',
        'data-slot="plate-math-drawing" style="vertical-align: -0.2ex"',
      ),
    ),
  ],
  [
    "the drawing left in the accessibility tree",
    "unstyled",
    rewriting((html) => html.replace(' aria-hidden="true"', "")),
  ],
  ["the MathML left out", "voiced", rewriting((html) => html.replace(/<math[\s\S]*<\/math>/u, ""))],
  [
    "a presentation attribute written under a name React does not map",
    "drawn",
    rewriting((html) => html.replaceAll("stroke-width=", "strokewidth=")),
  ],
  [
    "a group's transform dropped",
    "drawn",
    rewriting((html) => html.replace(/ transform="translate\([^"]*\)"/u, "")),
  ],
  [
    "the formula's style left out of what MathJax reads",
    "coloured",
    (formula) => written({ ...formula, children: unstyledTree(formula.children) }),
  ],
  [
    "qti-bordered drawn as no box",
    "bordered",
    (formula) => written({ ...formula, children: unbordered(formula.children) }),
  ],
  [
    "glyph ids drawn from a counter, as MathJax's local font cache writes them",
    "settled",
    (formula) => {
      drawings += 1;

      return written(formula).replace(
        'data-slot="plate-math-drawing"',
        `data-slot="plate-math-drawing" data-cache="MJX-${String(drawings)}"`,
      );
    },
  ],
];

describe("a formula as the server shell writes it", () => {
  it("holds every property on the corpus's shapes and 300 drawn formulas", () => {
    assert.deepStrictEqual(Object.fromEntries(broken(written)), {});
  });

  it.each(mutants)("refuses a mutant: %s (%s)", (_name, property, writer) => {
    assert.include([...broken(writer, [property]).keys()], property);
  });
});
