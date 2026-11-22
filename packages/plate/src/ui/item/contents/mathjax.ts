/**
 * A formula as MathJax 3.2.2 draws it: the `math` element's MathML laid out by MathJax's MathML
 * input and SVG output on the server, with MathJax's own TeX fonts and spacing, as AlphaTest's
 * player showed every formula (mastery-track-player 941a86a, `better-react-mathjax` 2.3.0 on
 * `mathjax-full` 3.2.2), and written into the page as SVG elements, so the page needs no script,
 * no font file and no request to draw it. The server shell writes the drawing beside the formula's
 * MathML (`#plate/ui/item/contents/mathml.tsx`), which stays for assistive technology.
 *
 * Why SVG, where AlphaTest's player drew CHTML (its combined `tex-mml-chtml.js` registers the CHTML
 * output first, so the `output/svg` its configuration also loads never drew): CHTML places every
 * box by an inline `style` (a script's `vertical-align`, a space's `width`, a cell's padding),
 * which plate never writes, and draws its glyphs in web fonts a host would have to serve. SVG
 * output is the same layout, MathJax's common output, and the same TeX glyphs, drawn as paths,
 * every number an SVG attribute. Its one `style`, the drawing's `vertical-align`, the server shell
 * turns into two empty boxes of the formula's height and depth, so the baseline is MathJax's to the
 * pixel.
 *
 * What the drawing keeps of MathJax's output: its SVG elements that draw (`svg`, `g`, `path`,
 * `rect`, `line`, `ellipse`, `polygon`, `text`, `image`) and their attributes that draw
 * ({@link drawnAttributes}); MathJax's stylesheet, which its output needs beside it, written onto
 * the elements it selects as the attributes it sets ({@link sheetRules}); and its `style`
 * declarations of those attributes, a `menclose` stroke's width among them. What it leaves:
 * classes, `data-*`, roles, titles and every MathML attribute MathJax copies onto its groups, none
 * of which draws; and a `style` that is not a drawing attribute, which only MathJax's indents and
 * percentage widths write (a `min-width`, a margin), none of which the converted AlphaTest corpus
 * holds.
 *
 * What MathJax is handed (`formula`): the MathML plate writes, `id`, `xref` and `href` left out,
 * since the drawing is hidden from assistive technology and holds no id or link of the page's; and
 * no `annotation-xml` content, which MathJax never draws. An element carrying QTI's shared
 * vocabulary class `qti-bordered` (a solid border) is drawn inside a box, as MathJax draws TeX's
 * `\boxed`, an `menclose` of notation `box`: MathJax draws no class, and AlphaTest's converted
 * `\boxed{?}` carries the class in place of the `menclose` MathML Core cannot draw.
 *
 * @module
 * @see https://docs.mathjax.org/en/v3.2-latest/output/svg.html
 */
import type { LiteDocument } from "mathjax-full/js/adaptors/lite/Document.js";
import { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import type { LiteText } from "mathjax-full/js/adaptors/lite/Text.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { STATE } from "mathjax-full/js/core/MathItem.js";
import { HTMLDocument } from "mathjax-full/js/handlers/html/HTMLDocument.js";
import { HTMLMathItem } from "mathjax-full/js/handlers/html/HTMLMathItem.js";
import { MathML } from "mathjax-full/js/input/mathml.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import type { MathAttribute, MathElement } from "#plate/content/mathml.ts";
import { UndrawnFormula } from "#plate/ui/item/errors.ts";

/**
 * One attribute of a drawn element, by the name React writes it under.
 */
interface DrawnAttribute {
  readonly name: string;
  readonly value: string;
}

/**
 * An SVG element of a drawing: its local name, its attributes and its children.
 */
export interface DrawnElement {
  readonly attributes: readonly DrawnAttribute[];
  readonly children: readonly Drawn[];
  readonly kind: "element";
  readonly name: string;
}

/**
 * Text of a drawing: a character MathJax's fonts do not hold, which it writes as SVG text.
 */
interface DrawnText {
  readonly kind: "text";
  readonly text: string;
}

/**
 * A node of a drawing.
 */
export type Drawn = DrawnElement | DrawnText;

/**
 * A formula as MathJax drew it: its `svg` and where its baseline falls.
 */
interface Drawing {
  /**
   * How far the formula reaches below its baseline, in `ex`, as MathJax writes it (`0.186ex`).
   */
  readonly depth: string;
  /**
   * Whether MathJax laid it out as a display formula, on a line of its own: a `math` of
   * `display="block"`, or of the deprecated `mode="display"` with no `display`.
   */
  readonly display: boolean;
  /**
   * The `svg`: MathJax's width, its height (the formula's height and depth together) and its
   * `viewBox`, and the drawing's elements.
   */
  readonly drawing: DrawnElement;
  /**
   * How far the formula reaches above its baseline, in `ex`.
   */
  readonly height: string;
  /**
   * The formula's width, MathJax's own, in `ex` (or a percentage, for a table MathJax widens to
   * its container).
   */
  readonly width: string;
}

/**
 * The SVG elements a drawing keeps: every element MathJax's SVG output draws with. Its `title`s
 * (an `merror`'s message, an `maction`'s tooltip), its links and its `foreignObject`s (XML it
 * cannot draw) are left out with what they hold.
 */
const drawnElements: ReadonlySet<string> = new Set([
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
 * The SVG attributes that draw, each MathJax's SVG output writes, by its SVG name, with the name
 * React writes it under: the presentation attributes in camel case, the rest as SVG spells them.
 */
export const drawnAttributes: ReadonlyMap<string, string> = new Map([
  ["color", "color"],
  ["cx", "cx"],
  ["cy", "cy"],
  ["d", "d"],
  ["fill", "fill"],
  ["font-family", "fontFamily"],
  ["font-size", "fontSize"],
  ["font-style", "fontStyle"],
  ["font-weight", "fontWeight"],
  ["height", "height"],
  ["href", "href"],
  ["lengthAdjust", "lengthAdjust"],
  ["overflow", "overflow"],
  ["points", "points"],
  ["preserveAspectRatio", "preserveAspectRatio"],
  ["rx", "rx"],
  ["ry", "ry"],
  ["stroke", "stroke"],
  ["stroke-dasharray", "strokeDasharray"],
  ["stroke-linecap", "strokeLinecap"],
  ["stroke-linejoin", "strokeLinejoin"],
  ["stroke-width", "strokeWidth"],
  ["textLength", "textLength"],
  ["transform", "transform"],
  ["viewBox", "viewBox"],
  ["width", "width"],
  ["x", "x"],
  ["x1", "x1"],
  ["x2", "x2"],
  ["y", "y"],
  ["y1", "y1"],
  ["y2", "y2"],
]);

/**
 * An element of MathJax's output with the two above it, which its stylesheet's selectors read.
 */
interface Placed {
  readonly element: LiteElement;
  readonly grandparent: LiteElement | undefined;
  readonly parent: LiteElement | undefined;
}

/**
 * A rule of MathJax's SVG stylesheet (`mathjax-full/ts/output/svg.ts` and its wrappers' `styles`)
 * that sets a drawing attribute, as the attributes it sets on the elements it selects.
 */
interface SheetRule {
  readonly attributes: readonly (readonly [name: string, value: string])[];
  readonly selects: (placed: Placed) => boolean;
}

/**
 * The adaptor MathJax reads and writes its trees through: the lite DOM, which needs no browser.
 */
const adaptor = liteAdaptor();

/**
 * Format a number as MathJax's output does (`CommonOutputJax.fixed`): three decimals, trailing
 * zeros dropped, and `0` for anything nearer zero than MathJax writes.
 *
 * @param value The number.
 * @returns Its text.
 */
const fixedText = (value: number): string =>
  Math.abs(value) < 0.0006 ? "0" : value.toFixed(3).replace(/\.?0+$/u, "");

/**
 * Read an attribute of an element of MathJax's output.
 *
 * @param element The element, none above the root.
 * @param name The attribute's name.
 * @returns Its value, undefined when the element has none.
 */
const attributeOf = (element: LiteElement | undefined, name: string): string | undefined =>
  element === undefined || !adaptor.hasAttribute(element, name)
    ? undefined
    : String(adaptor.getAttribute(element, name));

/**
 * Tell whether an element of MathJax's output is the group of one MathML element.
 *
 * @param element The element, none above the root.
 * @param node The MathML element's local name.
 * @returns Whether it is a `g` MathJax marked as that element's.
 */
const isGroupOf = (element: LiteElement | undefined, node: string): boolean =>
  element?.kind === "g" && attributeOf(element, "data-mml-node") === node;

/**
 * Tell whether an element is one of a table's rules or its frame: MathJax's selectors
 * `g[data-mml-node="mtable"] > X` and `svg[data-table] > g > X`.
 *
 * @param placed The element and the two above it.
 * @returns Whether it stands in a table as its stylesheet's table rules select.
 */
const inTable = ({ grandparent, parent }: Placed): boolean =>
  isGroupOf(parent, "mtable") ||
  (parent?.kind === "g" &&
    grandparent?.kind === "svg" &&
    attributeOf(grandparent, "data-table") !== undefined);

/**
 * Tell whether an element of a table is a rule or the frame MathJax draws for it.
 *
 * @param element The element.
 * @returns Whether it is a `line` MathJax marks `data-line` or a `rect` it marks `data-frame`.
 */
const isTableLine = (element: LiteElement): boolean =>
  (element.kind === "line" && attributeOf(element, "data-line") !== undefined) ||
  (element.kind === "rect" && attributeOf(element, "data-frame") !== undefined);

/**
 * Tell whether an element carries a class MathJax writes on a table's rules.
 *
 * @param element The element.
 * @param name The class.
 * @returns Whether its classes hold it.
 */
const hasClass = (element: LiteElement, name: string): boolean =>
  (attributeOf(element, "class") ?? "").split(" ").includes(name);

/**
 * MathJax's SVG stylesheet, the rules of it that set a drawing attribute: a glyph's stroke, a
 * table's rules and frame, the dashes and dots of its broken rules, a table label's overflow, and
 * an `merror`'s colours. Its other rules lay out MathJax's container, which the server shell
 * replaces, or style its tooltips, its status line and its `foreignObject`s, none of which a
 * drawing holds.
 */
const sheetRules: readonly SheetRule[] = [
  {
    attributes: [["stroke-width", "3"]],
    selects: ({ element }) =>
      (element.kind === "path" || element.kind === "use") &&
      attributeOf(element, "data-c") !== undefined,
  },
  {
    attributes: [
      ["stroke-width", "70"],
      ["fill", "none"],
    ],
    selects: (placed) => inTable(placed) && isTableLine(placed.element),
  },
  {
    attributes: [["stroke-dasharray", "140"]],
    selects: (placed) => inTable(placed) && hasClass(placed.element, "mjx-dashed"),
  },
  {
    attributes: [
      ["stroke-linecap", "round"],
      ["stroke-dasharray", "0,140"],
    ],
    selects: (placed) => inTable(placed) && hasClass(placed.element, "mjx-dotted"),
  },
  {
    attributes: [["overflow", "visible"]],
    selects: ({ element, grandparent, parent }) =>
      element.kind === "svg" && parent?.kind === "g" && isGroupOf(grandparent, "mtable"),
  },
  {
    attributes: [
      ["fill", "red"],
      ["stroke", "red"],
    ],
    selects: ({ element, parent }) => element.kind === "g" && isGroupOf(parent, "merror"),
  },
  {
    attributes: [
      ["fill", "yellow"],
      ["stroke", "none"],
    ],
    selects: ({ element, parent }) =>
      element.kind === "rect" &&
      isGroupOf(parent, "merror") &&
      attributeOf(element, "data-background") !== undefined,
  },
];

/**
 * Read the declarations of an element's `style` attribute, as MathJax writes it
 * (`stroke-width: 40; color: #0000FF !important`), each value without its `!important`, which is
 * CSS's priority and no part of the value a presentation attribute takes.
 *
 * @param element The element.
 * @returns Each declaration's property and value, in order.
 */
const styleOf = (element: LiteElement): readonly (readonly [string, string])[] =>
  (attributeOf(element, "style") ?? "").split(";").flatMap((declaration) => {
    const colon = declaration.indexOf(":");

    return colon === -1
      ? []
      : [
          [
            declaration.slice(0, colon).trim(),
            declaration
              .slice(colon + 1)
              .replace(/!\s*important\s*$/iu, "")
              .trim(),
          ] as const,
        ];
  });

/**
 * Write the drawing attributes of an element of MathJax's output, in CSS's order of precedence:
 * its own attributes, then what MathJax's stylesheet sets on it ({@link sheetRules}), then its
 * `style`'s declarations of drawing attributes, each overriding the one before. Every other
 * attribute is left out. A `text`, a character MathJax's fonts lack, is fitted to the width
 * MathJax laid it out at (`textLength`, glyphs and spacing adjusted): a browser's MathJax measures
 * the character in the page's font, and the server's lite DOM can only estimate it (0.6 em, a full
 * width character 1 em), so the page's glyph is drawn at the estimate rather than run into the
 * characters beside it.
 *
 * @param placed The element and the two above it.
 * @returns Its attributes, by the names React writes them under.
 */
const drawnAttributesOf = (placed: Placed): readonly DrawnAttribute[] => {
  const written = new Map<string, string>();

  for (const { name, value } of adaptor.allAttributes(placed.element)) {
    written.set(name, value);
  }

  for (const rule of sheetRules.filter(({ selects }) => selects(placed))) {
    for (const [name, value] of rule.attributes) {
      written.set(name, value);
    }
  }

  for (const [name, value] of styleOf(placed.element)) {
    written.set(name, value);
  }

  if (placed.element.kind === "text") {
    written.set("textLength", fixedText(adaptor.nodeSize(placed.element)[0] * 1000));
    written.set("lengthAdjust", "spacingAndGlyphs");
  }

  return [...written].flatMap(([name, value]) => {
    const reactName = drawnAttributes.get(name);

    return reactName === undefined ? [] : [{ name: reactName, value }];
  });
};

/**
 * Write an element of MathJax's output that the drawing keeps, and its children as the drawing
 * holds them: each element it keeps with its attributes and children, text as itself; an element
 * it leaves, and a comment, as nothing.
 *
 * @param placed The element and the two above it.
 * @returns The element, its attributes and its children as the drawing holds them.
 */
const drawnElement = (placed: Placed): DrawnElement => ({
  attributes: drawnAttributesOf(placed),
  children: adaptor.childNodes(placed.element).flatMap((child): readonly Drawn[] => {
    if (!(child instanceof LiteElement)) {
      return adaptor.kind(child) === "#text" ? [{ kind: "text", text: adaptor.value(child) }] : [];
    }

    return drawnElements.has(child.kind)
      ? [drawnElement({ element: child, grandparent: placed.parent, parent: placed.element })]
      : [];
  }),
  kind: "element",
  name: placed.element.kind,
});

/**
 * MathML's namespace, which the `math` handed to MathJax declares.
 */
const mathmlNamespace = "http://www.w3.org/1998/Math/MathML";

/**
 * Escape text for MathJax's MathML parser, which reads the formula as HTML.
 *
 * @param text The text.
 * @returns The text with `&`, `<` and `>` escaped.
 */
const escapedText = (text: string): string =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/**
 * Write an attribute of the formula handed to MathJax.
 *
 * @param attribute The attribute.
 * @returns ` name="value"`, its value escaped.
 */
const attributeText = ({ name, value }: MathAttribute): string =>
  ` ${name}="${escapedText(value).replaceAll('"', "&quot;")}"`;

/**
 * The attributes MathJax is not handed: an `id` and an `xref`, which name ids of the page's that
 * the hidden drawing must not repeat; an `href`, a link the hidden drawing cannot offer; and
 * `class`, which MathJax does not draw ({@link bordered}).
 */
const undrawnAttributes: ReadonlySet<string> = new Set(["class", "href", "id", "xref"]);

/**
 * Tell whether an element carries QTI's shared vocabulary class `qti-bordered`.
 *
 * @param attributes The element's attributes.
 * @returns Whether its `class` holds `qti-bordered`.
 */
const bordered = (attributes: readonly MathAttribute[]): boolean =>
  attributes.some(
    ({ name, value }) => name === "class" && value.split(/\s+/u).includes("qti-bordered"),
  );

/**
 * Write a MathML element as MathJax is handed it: its attributes but those it is not handed
 * ({@link undrawnAttributes}); its children, text escaped, each element in turn and an
 * `annotation-xml` with no content; inside an `menclose` of notation `box` when it carries
 * `qti-bordered` ({@link bordered}), an ordinary atom as TeX's `\boxed` is (MathJax's own
 * `data-mjx-texclass`, which its MathML input reads), so the operators beside it keep TeX's spaces.
 * An `maction` is written as the child its `selection` names (MathML 3 §3.7.1, from 1, the first
 * by default), which is what a page with no script shows: MathJax's SVG output wires a toggle's or
 * a tooltip's action to the DOM it draws in, which the lite DOM has none of; an empty `mrow` where
 * it names none.
 *
 * @param element The element.
 * @returns Its MathML.
 */
const elementText = (element: MathElement<unknown>): string => {
  if (element.local === "maction") {
    const selection = Number(
      element.attributes.find(({ name }) => name === "selection")?.value ?? "1",
    );
    const selected = element.children.filter(
      (child): child is MathElement<unknown> => child.kind === "element",
    )[selection - 1];

    return selected === undefined ? "<mrow></mrow>" : elementText(selected);
  }

  const attributes = element.attributes
    .filter(({ name }) => !undrawnAttributes.has(name))
    .map(attributeText)
    .join("");
  const namespace = element.local === "math" ? ` xmlns="${mathmlNamespace}"` : "";
  const children = element.children.map((child): string => {
    switch (child.kind) {
      case "annotation-xml": {
        return `<annotation-xml${child.attributes.map(attributeText).join("")}></annotation-xml>`;
      }
      case "element": {
        return elementText(child);
      }
      case "text": {
        return escapedText(child.text);
      }
      default: {
        return child satisfies never;
      }
    }
  });
  const written = `<${element.local}${namespace}${attributes}>${children.join("")}</${element.local}>`;

  return bordered(element.attributes)
    ? `<mrow data-mjx-texclass="ORD"><menclose notation="box">${written}</menclose></mrow>`
    : written;
};

/**
 * MathJax's MathML input, as its defaults read MathML.
 */
const input = new MathML<LiteElement, LiteText, LiteDocument>();

/**
 * MathJax's SVG output, as AlphaTest's player configured MathJax's output (its defaults: scale 1,
 * TeX's spacing, `mtext` in MathJax's own fonts), every glyph drawn where it stands (`fontCache:
 * "none"`), so a drawing holds no id and needs no other.
 */
const output = new SVG<LiteElement, LiteText, LiteDocument>({ fontCache: "none" });

/**
 * The MathJax document every formula is typeset in, over an empty lite DOM page.
 */
const mathDocument = new HTMLDocument<LiteElement, LiteText, LiteDocument>(
  adaptor.parse("", "text/html"),
  adaptor,
  {
    InputJax: input,
    OutputJax: output,
  },
);

/**
 * Format a length in `ex` as MathJax's output does (`CommonOutputJax.fixed`): three decimals,
 * trailing zeros dropped, and `0` for anything nearer zero than MathJax writes.
 *
 * @param ex The length.
 * @returns The length, with `ex`.
 */
const exText = (ex: number): string => `${fixedText(ex)}ex`;

/**
 * The page's metrics MathJax typesets with where no browser measures them: those of its own
 * `MathDocument.convert`, a 16 px em, an 8 px ex, a container 80 ex wide, no line width to break
 * at, and scale 1. The SVG output sizes a drawing in `ex`, so the page's font sets its size; these
 * reach a drawing only through characters its fonts lack, whose SVG text they size, and lengths
 * in absolute units.
 */
const metrics = {
  containerWidth: 640,
  em: 16,
  ex: 8,
  lineWidth: 1_000_000,
  scale: 1,
} as const;

/**
 * Read a length MathJax's output writes in `ex` (`1.692ex`, `-0.186ex`).
 *
 * @param text The length, with its unit.
 * @returns The number of `ex`.
 */
const exOf = (text: string): number => Number(text.replace(/ex$/u, ""));

/**
 * Typeset a formula: MathJax reads its MathML and draws it. Its suite reads MathJax's own output
 * through it, to hold the drawing to it.
 *
 * @param formula The `math` element, as plate writes it.
 * @returns MathJax's container: an `mjx-container` holding the `svg`.
 */
export const typeset = (formula: MathElement<unknown>): LiteElement => {
  const item = new HTMLMathItem<LiteElement, LiteText, LiteDocument>(
    elementText(formula),
    input,
    false,
  );

  item.start.node = adaptor.body(mathDocument.document);
  item.setMetrics(metrics.em, metrics.ex, metrics.containerWidth, metrics.lineWidth, metrics.scale);
  item.convert(mathDocument, STATE["LAST"]);

  return item.typesetRoot;
};

/**
 * Draw a formula with MathJax: its `svg` as the drawing holds it, and its metrics, read from the
 * `height` and `vertical-align` MathJax writes on the `svg`, so the server shell places it on the
 * baseline as MathJax would.
 *
 * @param formula The `math` element, as plate writes it.
 * @returns The drawing.
 */
export const draw = (formula: MathElement<unknown>): Drawing => {
  const container = typeset(formula);
  const svg = adaptor.firstChild(container);

  if (!(svg instanceof LiteElement)) {
    throw new UndrawnFormula({ found: adaptor.kind(svg) });
  }

  const total = exOf(attributeOf(svg, "height") ?? "");
  const depth = -exOf(adaptor.getStyle(svg, "vertical-align"));

  return {
    depth: exText(depth),
    display: attributeOf(container, "display") === "true",
    drawing: drawnElement({ element: svg, grandparent: undefined, parent: undefined }),
    height: exText(total - depth),
    width: attributeOf(svg, "width") ?? "",
  };
};
