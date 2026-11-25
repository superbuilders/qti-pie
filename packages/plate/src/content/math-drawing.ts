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
import { regex } from "arkregex";
import { Data } from "effect";
import type { LiteDocument } from "mathjax-full/js/adaptors/lite/Document.js";
import { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import type { LiteText } from "mathjax-full/js/adaptors/lite/Text.js";
import { LiteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { STATE } from "mathjax-full/js/core/MathItem.js";
import { HTMLDocument } from "mathjax-full/js/handlers/html/HTMLDocument.js";
import { HTMLMathItem } from "mathjax-full/js/handlers/html/HTMLMathItem.js";
import { MathML } from "mathjax-full/js/input/mathml.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import type { MathAttribute, MathChild, MathElement } from "#plate/content/mathml.ts";
import type { SlotSize } from "#plate/content/math-slots.ts";

/**
 * MathJax's SVG output gave a formula's container something other than its `svg`, which the
 * drawing reads: MathJax broke its contract, which no item
 * can cause, so the page dies loudly rather than show a formula with nothing drawn.
 */
export class UndrawnFormula extends Data.TaggedError("UndrawnFormula")<{
  /**
   * What the container held first, as MathJax's adaptor names a node's kind (`#text`).
   */
  readonly found: string;
}> {
  /**
   * What MathJax gave where its `svg` belongs.
   */
  override get message(): string {
    return `MathJax's SVG output gave a formula's container ${JSON.stringify(this.found)} where its svg belongs, so the server shell drew none of it.`;
  }
}

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
   * Each slot the formula holds for an interaction, where MathJax laid it out.
   */
  readonly slots: readonly PlacedSlot[];
  /**
   * The formula's height and depth together, in `ex`: the height of its `svg`.
   */
  readonly total: string;
  /**
   * The formula's width, MathJax's own, in `ex` (or a percentage, for a table MathJax widens to
   * its container).
   */
  readonly width: string;
}

/**
 * A slot of a formula where MathJax laid it out, by the `id` it names: its box as percentages of
 * the formula's box (its left, its top, its width and its height), so an element over the formula
 * of the formula's size places an interaction there in the page's own pixels, whatever the font.
 */
export interface PlacedSlot {
  readonly height: string;
  readonly id: string;
  readonly width: string;
  readonly x: string;
  readonly y: string;
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
 * The advance widths of the characters MathJax's fonts lack that formulas hold, in em of the
 * font they are drawn in, as Chrome draws them in its serif face, which AlphaTest's CHTML drew them
 * in (`MJXZERO, serif`): Liberation Serif, metric for metric Times New Roman and ChromeOS's Tinos,
 * gives `¢` 0.5 and `º` 0.31, and the answer box `▢`, which none of them holds, comes from the
 * symbol face Chrome falls back to at 0.945. Measured at 100 px in headless Chrome on cassowary,
 * 2026-11-22.
 */
const advanceWidths: ReadonlyMap<string, number> = new Map([
  ["¢", 0.5],
  ["º", 0.31],
  ["▢", 0.945],
]);

/**
 * The width MathJax's lite DOM gives a character it cannot measure, which {@link advanceWidths}
 * replaces where it knows the character's (`unknownCharWidth`, its default).
 */
const estimatedWidth = 0.6;

/**
 * The lite DOM, which needs no browser, measuring the characters MathJax's fonts lack by their
 * advance widths where it knows them ({@link advanceWidths}) and by its own estimate otherwise, at
 * the size MathJax draws them (the text's `font-size`, in thousandths of MathJax's em), so a
 * character is laid out as wide as a browser draws it and its glyph is fitted to no other width.
 */
class MeasuringAdaptor extends LiteAdaptor {
  /**
   * Measure a text MathJax's fonts lack.
   *
   * @param node The SVG text MathJax draws it in.
   * @returns Its width and height in MathJax's em.
   */
  override nodeSize(node: LiteElement): [number, number] {
    const [estimate, height] = super.nodeSize(node);
    const text = this.textContent(node);
    let correction = 0;

    for (const [character, width] of advanceWidths) {
      correction += (text.split(character).length - 1) * (width - estimatedWidth);
    }

    const size = this.hasAttribute(node, "font-size")
      ? Number(String(this.getAttribute(node, "font-size")).replace(regex("px$", "u"), ""))
      : 1000;

    return [((estimate + correction) * size) / 1000, height];
  }
}

/**
 * The adaptor MathJax reads and writes its trees through.
 */
const adaptor = new MeasuringAdaptor();

/**
 * Format a number as MathJax's output does (`CommonOutputJax.fixed`): three decimals, trailing
 * zeros dropped, and `0` for anything nearer zero than MathJax writes.
 *
 * @param value The number.
 * @returns Its text.
 */
const fixedText = (value: number): string =>
  Math.abs(value) < 0.0006 ? "0" : value.toFixed(3).replace(regex("\\.?0+$", "u"), "");

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
              .replace(regex("!\\s*important\\s*$", "iu"), "")
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
 * the character in the page's font, and the server's lite DOM measures it by its known advance
 * width ({@link MeasuringAdaptor}) or estimates it, so the page's glyph keeps its own width where
 * it is known and never runs into the characters beside it.
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
 * The attribute the formula handed to MathJax marks a slot's `mspace` with, by the `id` the slot
 * names: plate's own, which MathJax copies onto the group it draws for the `mspace`, so the slot is
 * found in its output.
 */
export const slotMark = "data-plate-slot";

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
    ({ name, value }) =>
      name === "class" && value.split(regex("\\s+", "u")).includes("qti-bordered"),
  );

/**
 * Write one child of a MathML element as MathJax is handed it, as {@link elementText} writes the
 * element: text escaped, an element in turn, an `annotation-xml` with no content.
 *
 * @param child The child.
 * @param sizes Each slot's size, by the `id` it names.
 * @returns Its MathML.
 */
const childText = (child: MathChild<unknown>, sizes: ReadonlyMap<string, SlotSize>): string => {
  switch (child.kind) {
    case "annotation-xml": {
      return `<annotation-xml${child.attributes.map(attributeText).join("")}></annotation-xml>`;
    }
    case "element": {
      return elementText(child, sizes);
    }
    case "text": {
      return escapedText(child.text);
    }
  }
};

/**
 * Write a MathML element as MathJax is handed it: its attributes but those it is not handed
 * ({@link undrawnAttributes}); its children, text escaped, each element in turn and an
 * `annotation-xml` with no content; inside an `menclose` of notation `box` when it carries
 * `qti-bordered` ({@link bordered}), an ordinary atom as TeX's `\boxed` is (MathJax's own
 * `data-mjx-texclass`, which its MathML input reads), so the operators beside it keep TeX's spaces.
 * An `maction` is written as the child its `selection` names (MathML 3 §3.7.1, from 1, the first
 * by default), which is what a page with no script shows: MathJax's SVG output wires a toggle's or
 * a tooltip's action to the DOM it draws in, which the lite DOM has none of; an empty `mrow` where
 * it names none. A slot's `mspace` ({@link slotMark}) is as wide, high and deep as its size, an
 * ordinary atom as AlphaTest's `\cssId` group around its box was, so the operators beside it keep
 * TeX's spaces.
 *
 * @param element The element.
 * @param sizes Each slot's size, by the `id` it names.
 * @returns Its MathML.
 */
const elementText = (
  element: MathElement<unknown>,
  sizes: ReadonlyMap<string, SlotSize>,
): string => {
  const slot = element.attributes.find(({ name }) => name === slotMark)?.value;
  const size = slot === undefined ? undefined : sizes.get(slot);

  if (element.local === "mspace" && slot !== undefined && size !== undefined) {
    return `<mrow data-mjx-texclass="ORD"><mspace width="${fixedText(size.width)}em" height="${fixedText(size.height)}em" depth="${fixedText(size.depth)}em" ${slotMark}="${escapedText(slot).replaceAll('"', "&quot;")}"></mspace></mrow>`;
  }

  if (element.local === "maction") {
    const selection = Number(
      element.attributes.find(({ name }) => name === "selection")?.value ?? "1",
    );
    const selected = element.children.filter(
      (child): child is MathElement<unknown> => child.kind === "element",
    )[selection - 1];

    return selected === undefined ? "<mrow></mrow>" : elementText(selected, sizes);
  }

  const attributes = element.attributes
    .filter(({ name }) => !undrawnAttributes.has(name))
    .map(attributeText)
    .join("");
  const namespace = element.local === "math" ? ` xmlns="${mathmlNamespace}"` : "";
  const children = element.children.map((child) => childText(child, sizes));
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
 * "none"`), so a drawing holds no id and needs no other. Its scripts keep MathJax's own spacing:
 * AlphaTest's CHTML padded a script only on a page that drew an `msubsup`, a page-dependent
 * artefact plate does not copy, and on any other page CHTML's scripts stand where MathJax's SVG
 * output puts them (edullm-bd, 2026-11-22).
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
const exOf = (text: string): number => Number(text.replace(regex("ex$", "u"), ""));

/**
 * Typeset a formula: MathJax reads its MathML and draws it. Its suite reads MathJax's own output
 * through it, to hold the drawing to it.
 *
 * @param formula The `math` element, as plate writes it.
 * @param sizes Each slot's size, by the `id` it names; empty for a formula with no slot.
 * @returns MathJax's container: an `mjx-container` holding the `svg`.
 */
export const typeset = (
  formula: MathElement<unknown>,
  sizes: ReadonlyMap<string, SlotSize>,
): LiteElement => {
  const item = new HTMLMathItem<LiteElement, LiteText, LiteDocument>(
    elementText(formula, sizes),
    input,
    false,
  );

  item.start.node = adaptor.body(mathDocument.document);
  item.setMetrics(metrics.em, metrics.ex, metrics.containerWidth, metrics.lineWidth, metrics.scale);
  item.convert(mathDocument, STATE["LAST"]);

  return item.typesetRoot;
};

/**
 * An affine transform of SVG's, `[a, b, c, d, e, f]`, as `matrix(a b c d e f)` writes it.
 */
type Matrix = readonly [number, number, number, number, number, number];

/**
 * The transform that moves nothing.
 */
const identity: Matrix = [1, 0, 0, 1, 0, 0];

/**
 * Compose two transforms, the inner applied first, as an SVG element's applies inside its parent's.
 *
 * @param outer The parent's transform.
 * @param inner The element's own.
 * @returns The element's transform in the parent's parent's coordinates.
 */
const composed = (outer: Matrix, inner: Matrix): Matrix => {
  const [a, b, c, d, e, f] = outer;
  const [p, q, r, t, u, v] = inner;

  return [
    a * p + c * q,
    b * p + d * q,
    a * r + c * t,
    b * r + d * t,
    a * u + c * v + e,
    b * u + d * v + f,
  ];
};

/**
 * Read an SVG `transform` as MathJax's output writes one: `translate(x,y)`, `scale(s)`,
 * `scale(x,y)` and `matrix(a b c d e f)`, in turn.
 *
 * @param text The attribute's value, none where the element has none.
 * @returns The transform it applies.
 */
const transformOf = (text: string | undefined): Matrix => {
  let matrix = identity;

  for (const match of (text ?? "").matchAll(
    regex("(?<name>translate|scale|matrix)\\((?<args>[^)]*)\\)", "gu"),
  )) {
    const name = match.groups?.["name"] ?? "";
    const args = (match.groups?.["args"] ?? "")
      .split(regex("[\\s,]+", "u"))
      .filter((arg) => arg !== "")
      .map(Number);

    if (name === "matrix") {
      const [a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = args;

      matrix = composed(matrix, [a, b, c, d, e, f]);
    } else if (name === "scale") {
      const [x = 1, y = x] = args;

      matrix = composed(matrix, [x, 0, 0, y, 0, 0]);
    } else {
      const [x = 0, y = 0] = args;

      matrix = composed(matrix, [1, 0, 0, 1, x, y]);
    }
  }

  return matrix;
};

/**
 * Find each slot's group in MathJax's output, at any depth, with the transform from it to the
 * `svg`'s own coordinates.
 *
 * @param element An element of the output.
 * @param outer The transform from its parent to the `svg`'s coordinates.
 * @returns Each slot's `id` and its transform, in document order.
 */
const slotGroups = (
  element: LiteElement,
  outer: Matrix,
): readonly (readonly [string, Matrix])[] => {
  const matrix = composed(outer, transformOf(attributeOf(element, "transform")));
  const slot = attributeOf(element, slotMark);

  return [
    ...(slot === undefined ? [] : [[slot, matrix] as const]),
    ...adaptor
      .childNodes(element)
      .flatMap((child) => (child instanceof LiteElement ? slotGroups(child, matrix) : [])),
  ];
};

/**
 * Write a fraction of a length as a percentage.
 *
 * @param part The part.
 * @param whole The whole.
 * @returns The percentage, to a thousandth.
 */
const percentText = (part: number, whole: number): string => `${fixedText((part / whole) * 100)}%`;

/**
 * Place each slot of a formula where MathJax laid it out: its `mspace`'s box, from its left at the
 * baseline as wide as its size and as high and deep, carried through every transform above it to
 * the `svg`'s `viewBox`, and written as percentages of that box.
 *
 * @param svg MathJax's `svg`.
 * @param sizes Each slot's size, by the `id` it names.
 * @returns Each slot's place.
 */
const placedSlots = (
  svg: LiteElement,
  sizes: ReadonlyMap<string, SlotSize>,
): readonly PlacedSlot[] => {
  const [left = 0, top = 0, width = 1, height = 1] = (attributeOf(svg, "viewBox") ?? "")
    .split(" ")
    .map(Number);

  return slotGroups(svg, identity).flatMap(([id, [a, b, c, d, e, f]]) => {
    const size = sizes.get(id);

    if (size === undefined) {
      return [];
    }

    const corner = (x: number, y: number): readonly [number, number] => [
      a * x + c * y + e,
      b * x + d * y + f,
    ];
    const [x1, y1] = corner(0, size.height * 1000);
    const [x2, y2] = corner(size.width * 1000, -size.depth * 1000);

    return [
      {
        height: percentText(Math.abs(y2 - y1), height),
        id,
        width: percentText(Math.abs(x2 - x1), width),
        x: percentText(Math.min(x1, x2) - left, width),
        y: percentText(Math.min(y1, y2) - top, height),
      },
    ];
  });
};

/**
 * Draw a formula with MathJax: its `svg` as the drawing holds it, and its metrics, read from the
 * `height` and `vertical-align` MathJax writes on the `svg`, so the server shell places it on the
 * baseline as MathJax would.
 *
 * @param formula The `math` element, as plate writes it, each slot's `mspace` marked
 *   ({@link slotMark}).
 * @param sizes Each slot's size, by the `id` it names.
 * @returns The drawing.
 */
export const draw = (
  formula: MathElement<unknown>,
  sizes: ReadonlyMap<string, SlotSize>,
): Drawing => {
  const container = typeset(formula, sizes);
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
    slots: placedSlots(svg, sizes),
    total: exText(total),
    width: attributeOf(svg, "width") ?? "",
  };
};
