/**
 * Tap to shade the parts of a partitioned shape (`urn:fdc:alpha.school:2026:shade-parts`): the
 * Portable Custom Interaction (Q-16) of the Grade 3 mastery gates' fraction items, as the
 * assessment lead specifies them (a child shows a/b by shading a parts of a whole cut into b equal
 * parts, on every Grade 3 form, and shows an equivalent fraction by shading the same amount of a
 * whole cut another way), written as the AMD module a content package carries and the frame host
 * loads by QTI 3.0.1's own module resolution: the item names it with its `module` attribute and
 * lists it in `qti-interaction-modules`, and the package holds its module file at the path it
 * names (`modules/shade-parts.js`).
 *
 * - **The screen.** One whole of `parts` equal parts (2, 3, 4, 6 or 8), as `whole` says: `rectangle`,
 *   cut into `rows` rows of `parts / rows` columns (one row for vertical cuts, `parts` rows for
 *   horizontal cuts, a grid besides); `circle`, cut into equal sectors from twelve o'clock,
 *   clockwise; or `set`, the specification's alternate to a shape, `parts` copies of one object,
 *   the one picture the item's markup holds (an `img` with its `src`, `alt`, `width` and `height`),
 *   each drawn on a disc, in one row up to four and in two rows of three or four beyond, a shaded
 *   one on a flat blue disc with a dark ring. A rectangle's or a circle's markup is empty: it is
 *   geometry the module draws. Nothing is shaded at the start, nothing is numbered, and nothing
 *   else is drawn: no count, no "0 parts shaded" line.
 * - **The shown model.** For the equivalence form (a rectangle or a circle), `shownParts` names a
 *   model drawn above the one the child shades: the same figure at the same size, cut into
 *   `shownParts` parts (a rectangle in `shownRows` rows), its first `shownShaded` parts shaded, at
 *   least one and not all. It is a picture, never tapped. The shaded model refines it, so its parts
 *   align with the shown model's: `shownParts` is one of the family and a proper divisor of `parts`
 *   (the new denominator is the larger one), and a rectangle's `rows` is a multiple of `shownRows`
 *   and its columns a multiple of the shown model's. Both rectangles of the equivalence form are
 *   cut along their length (no more rows than columns): stacked directly beneath, only cuts across
 *   the length line up from one model to the other, and two upright rectangles stacked stand taller
 *   than a laptop's screen.
 * - **The interaction.** A tap on a part shades it; a tap on a shaded part clears it. Any part can be
 *   shaded, and any number of them. A part is a button to a keyboard, too: Enter or Space toggles
 *   the focused part.
 * - **The response.** The number of parts shaded, the Appendix C JSON `{ base: { integer: n } }`, for
 *   the `single` `integer` declaration `match_correct` scores: the specification scores how many
 *   parts are shaded, whichever they are, never their places. With no part shaded, whether never
 *   tapped or every part cleared, the response is NULL, `{ base: null }`: an interaction left
 *   untouched sends no answer (owner's ruling Q6), and a whole with nothing shaded is the same
 *   screen. `match_correct` scores NULL 0, as it would the integer 0.
 * - **Coming back.** The stored response decides. Bound to a count (`boundTo`), the PCI shades the
 *   parts of the state it is handed if that state shades as many, and otherwise (no state, as a
 *   host that keeps none hands it, or one of another count) the first parts by place, as many as
 *   the count; bound to NULL it shades nothing; bound to nothing at all, the state alone decides.
 *   Only a state or a response it cannot read at all is refused.
 *
 * A part's place is its index from 0: in a rectangle reading order, row by row; in a circle
 * clockwise from twelve o'clock; in a set reading order.
 *
 * **Sizes.** Parts are outlined in `#333` at 3 px with round joins, white, and shaded in `#4aa3df`,
 * the shade form's look. Every size is derived from one rule: every part holds a disc of 44 px,
 * WCAG 2.2's Target Size (Enhanced), clear of the outlines. A rectangle is eight targets and
 * outlines along the axis cut more often (room for the largest denominator) and three across, and
 * grows along an axis whose parts would be thinner; a circle's radius is the one at which eight
 * sectors hold the target, so every circle is one size; a set's object is the target on a disc
 * with a margin, a quarter target from its neighbours.
 *
 * The PCI's look is one stylesheet it writes into its frame's document, keyed on its own
 * `data-shade` parts: the frame is a document of its own, which no stylesheet of the host's
 * reaches.
 *
 * **Properties.** The PCI's typed contract, each a `data-*` attribute of the
 * `qti-portable-custom-interaction`, read by its dataset name: `data-whole` and `data-parts`, with
 * `data-rows` for a rectangle; and for the equivalence form `data-shown-parts` and
 * `data-shown-shaded`, with `data-shown-rows` for a rectangle. It accepts those and the two the QTI
 * 3.0.1 schema declares on the element (`data-catalog-idref`, `data-qti-suppress-tts`) and nothing
 * else: any other property, one written for another figure, or one it reads that is absent or
 * malformed is refused when the PCI is made, so a misspelt property never drops part of the screen
 * silently.
 *
 * **Why a script.** This file is the module file with types (`#plate/alpha/pci-modules.ts` says
 * why): it imports no value and exports nothing, its one statement is the AMD `define` the frame's
 * loader runs, and every helper is inside the factory, which reaches nothing but the frame's
 * globals and the bridge it is handed, as the frame's own boot does
 * (`#plate/ui/portable-custom/frame-boot.ts`).
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 * @see https://github.com/amdjs/amdjs-api/blob/master/AMD.md
 * @see https://www.w3.org/TR/WCAG22/#target-size-enhanced
 */
import type { PciFrameConfiguration } from "#plate/pci/frame-protocol.ts";

/**
 * The configuration the frame's bridge hands a PCI's `getInstance`: the page's, with the response's
 * bound value under its identifier, and the bridge's own `onready`.
 */
interface ShadePartsConfiguration extends PciFrameConfiguration {
  readonly boundTo: Readonly<Record<string, unknown>>;
  readonly onready: (interaction: ShadePartsInstance, state: ShadePartsState) => void;
}

/**
 * The PCI's state: the parts shaded, by their place, ascending.
 */
interface ShadePartsState {
  readonly shaded: readonly number[];
}

/**
 * The Appendix C JSON of the response: the number of parts shaded, NULL for none.
 */
type ShadePartsResponse = { readonly base: null } | { readonly base: { readonly integer: number } };

/**
 * The PCI object `getInstance` returns: the two readers the host calls, and `oncompleted`, which
 * the host calls before the PCI's markup goes.
 */
interface ShadePartsInstance {
  readonly getResponse: () => ShadePartsResponse;
  readonly getState: () => ShadePartsState;
  readonly oncompleted: () => void;
}

/**
 * The factory the module registers with the bridge.
 */
interface ShadePartsFactory {
  readonly getInstance: (
    dom: HTMLElement,
    configuration: ShadePartsConfiguration,
    state: unknown,
  ) => ShadePartsInstance;
  readonly typeIdentifier: string;
}

/**
 * The `qtiCustomInteractionContext` bridge, as this module uses it.
 */
interface PciContext {
  readonly register: (factory: ShadePartsFactory) => void;
}

/**
 * How a whole is cut: a rectangle into rows and columns of equal parts, a circle into equal
 * sectors, or a set of separate objects in rows of `perRow`.
 */
type Partition =
  | { readonly kind: "circle"; readonly parts: number }
  | { readonly columns: number; readonly kind: "rectangle"; readonly rows: number }
  | { readonly kind: "set"; readonly parts: number; readonly perRow: number };

/**
 * A model's drawing: its box, in CSS pixels, and each part's outline, by place.
 */
interface Drawing {
  readonly height: number;
  readonly parts: readonly Outline[];
  readonly width: number;
}

/**
 * A rectangle's box, in CSS pixels.
 */
interface Box {
  readonly height: number;
  readonly width: number;
}

/**
 * A model's SVG, and its parts' elements, by place.
 */
interface ModelSvg {
  readonly parts: readonly SVGElement[];
  readonly svg: SVGSVGElement;
}

/**
 * One part's outline: a rectangle's box, a sector's path, or an object's circle, in the drawing's
 * pixels.
 */
type Outline =
  | { readonly cx: number; readonly cy: number; readonly kind: "disc"; readonly r: number }
  | { readonly d: string; readonly kind: "path" }
  | {
      readonly height: number;
      readonly kind: "box";
      readonly width: number;
      readonly x: number;
      readonly y: number;
    };

/**
 * AMD's `define` as the frame's loader gives it to a module's script
 * (`#plate/ui/portable-custom/frame-boot.ts`): the module is anonymous, named by the route that
 * loads it, and its one dependency is the bridge.
 *
 * @param dependencies The module's dependencies, by id.
 * @param factory What the loader calls with them.
 */
declare function define(
  dependencies: readonly ["qtiCustomInteractionContext"],
  factory: (qtiCustomInteractionContext: PciContext) => void,
): void;

define(["qtiCustomInteractionContext"], (qtiCustomInteractionContext) => {
  "use strict";

  /**
   * The type identifier the factory serves, the items' `custom-interaction-type-identifier`.
   */
  const typeIdentifier = "urn:fdc:alpha.school:2026:shade-parts";

  /**
   * The look of a part, the shade form's (FORM-SHADE's specification of it): a `#333` outline 3 px
   * wide with round joins, filled white, and a flat `#4aa3df` when shaded.
   *
   * @formatConstant
   */
  const look = { clear: "#fff", outline: "#333", shaded: "#4aa3df", stroke: 3 };

  /**
   * The smallest disc every part holds, in CSS pixels: WCAG 2.2's Target Size (Enhanced), 44 px,
   * plate's target floor (`#plate/graphic/scale.ts`). Every size below is derived from it.
   *
   * @formatConstant
   */
  const target = 44;

  /**
   * The width a part takes along a cut rectangle: the target and its outline.
   */
  const unit = target + look.stroke;

  /**
   * The largest denominator a whole is cut into.
   */
  const most = 8;

  /**
   * The least common multiple of the denominators 2, 3, 4, 6 and 8: a side that many pixels long,
   * or a multiple, is cut by every one of them into parts of whole pixels.
   */
  const commonCut = 24;

  /**
   * The whole rectangle, in CSS pixels: along the axis cut into more parts, room for the largest
   * denominator's parts a unit each, up to the next multiple of {@link commonCut}; across it, three
   * units, up to the next even number (a rectangle is cut across into at most two), so a whole
   * reads as a strip and every part's edges fall on whole pixels.
   */
  const rectangle = {
    across: 2 * Math.ceil((3 * unit) / 2),
    along: commonCut * Math.ceil((most * unit) / commonCut),
  };

  /**
   * Give the radius at which each of so many equal sectors holds the target's disc clear of the
   * outlines: a sector of angle 2π/b and radius R holds a disc of radius R·s/(1 + s), s = sin(π/b),
   * and the disc's radius is half the target and an outline.
   *
   * @param parts The sectors, from 2.
   * @returns The radius, in CSS pixels.
   */
  const sectorRadius = (parts: number): number => {
    const sine = Math.sin(Math.PI / parts);

    return Math.ceil(((target / 2 + look.stroke) * (1 + sine)) / sine);
  };

  /**
   * The circle's radius, in CSS pixels: the one at which the largest denominator's sectors each
   * hold the target, so every circle of the family is drawn at one size.
   */
  const circle = { radius: sectorRadius(most) };

  /**
   * A set's object: its disc, the target with two outlines' margin on each side, and the gap
   * between neighbours in a row and between rows, a quarter of the target, in CSS pixels.
   */
  const set = { gap: target / 4, side: target + 4 * look.stroke };

  /**
   * The gap between the shown model and the model the child shades, half the target, in CSS
   * pixels.
   */
  const stack = { gap: target / 2 };

  /**
   * The parts a whole is cut into, the specification's denominators: up to 8, every part holds the
   * target's disc with its outline drawn.
   */
  const family: ReadonlySet<number> = new Set([2, 3, 4, 6, 8]);

  /**
   * The objects in a row of a set of so many: up to four in one row, six in rows of three, eight in
   * rows of four.
   *
   * @param parts The objects, one of {@link family}.
   * @returns The objects in a row.
   */
  const perRowOf = (parts: number): number => (parts <= 4 ? parts : parts / 2);

  /**
   * A count as a property writes it: a whole number from 1, no leading zero.
   */
  const counting = /^[1-9][0-9]*$/u;

  /**
   * The namespace the drawing is made in.
   */
  const svgNamespace = "http://www.w3.org/2000/svg";

  /**
   * The properties each figure reads, its shaded model's and its shown model's: a property of
   * another shape's written is refused.
   */
  const reads = {
    circle: { model: ["parts"], shown: ["shownParts", "shownShaded"] },
    rectangle: { model: ["parts", "rows"], shown: ["shownParts", "shownShaded", "shownRows"] },
    set: { model: ["parts"], shown: [] },
  } as const;

  /**
   * The properties QTI 3.0.1's schema declares on the element itself, by dataset name
   * (`data-catalog-idref`, `data-qti-suppress-tts`): passed over, never read.
   */
  const qtiOwn: ReadonlySet<string> = new Set(["catalogIdref", "qtiSuppressTts"]);

  /**
   * Give a property's attribute, as an item writes it: `data-` and its dataset name with each
   * upper-case letter lowered after a `-`.
   *
   * @param name The dataset name.
   * @returns The attribute's name.
   */
  const attributeOf = (name: string): string =>
    `data-${name.replaceAll(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}`;

  /**
   * The item's configuration of the PCI refused: a property it reads is absent, malformed or
   * written for another figure, or the state or bound response it is handed is none of this
   * whole's. `getInstance` throwing is the PCI contract's one failure: the frame's boot reports the
   * PCI `failed`, with the message as its reason where the browser shares the module script's
   * errors with the frame (a frame of opaque origin sees a cross-origin script's error as "Script
   * error.").
   */
  class ShadePartsRefusedError extends Error {
    override readonly name = "ShadePartsRefusedError";
  }

  /**
   * Refuse the configuration: throw {@link ShadePartsRefusedError}, its message the PCI's name, what
   * in the configuration breaks the rule, and the repair.
   *
   * @param detail What breaks the rule, and the repair.
   * @returns Never.
   * @throws {ShadePartsRefusedError} Always.
   */
  const refuse = (detail: string): never => {
    throw new ShadePartsRefusedError(
      `The shade-parts PCI (${typeIdentifier}) cannot run: ${detail}`,
    );
  };

  /**
   * Read a property that writes a count.
   *
   * @param properties The PCI's properties.
   * @param name The property's dataset name.
   * @returns The count.
   * @throws {ShadePartsRefusedError} When the property is absent or not a count.
   */
  const countOf = (properties: Readonly<Record<string, string>>, name: string): number => {
    const written = properties[name];

    return written !== undefined && counting.test(written)
      ? Number(written)
      : refuse(
          `its property ${attributeOf(name)} is ${written === undefined ? "absent" : `"${written}"`}; write it as a whole number from 1 with no leading zero.`,
        );
  };

  /**
   * Give a partition's number of parts.
   *
   * @param partition The partition.
   * @returns Its parts.
   */
  const partsOf = (partition: Partition): number =>
    partition.kind === "rectangle" ? partition.rows * partition.columns : partition.parts;

  /**
   * Read a property that writes how many parts a whole is cut into.
   *
   * @param properties The PCI's properties.
   * @param name The property's dataset name.
   * @returns The parts, one of {@link family}.
   * @throws {ShadePartsRefusedError} When it is absent, not a count, or not one of the family.
   */
  const partsIn = (properties: Readonly<Record<string, string>>, name: string): number => {
    const parts = countOf(properties, name);

    return family.has(parts)
      ? parts
      : refuse(
          `its property ${attributeOf(name)} cuts the whole into ${String(parts)} parts; cut it into 2, 3, 4, 6 or 8.`,
        );
  };

  /**
   * Read a property that writes a rectangle's rows, which divide its parts into equal rows.
   *
   * @param properties The PCI's properties.
   * @param name The property's dataset name.
   * @param parts The rectangle's parts.
   * @returns The rows.
   * @throws {ShadePartsRefusedError} When it is absent, not a count, or does not divide the parts.
   */
  const rowsIn = (
    properties: Readonly<Record<string, string>>,
    name: string,
    parts: number,
  ): number => {
    const rows = countOf(properties, name);

    return parts % rows === 0
      ? rows
      : refuse(
          `its property ${attributeOf(name)} is ${String(rows)}, which does not divide ${String(parts)} parts into equal rows; write a divisor of ${String(parts)}.`,
        );
  };

  /**
   * Read the partition of the model the child shades.
   *
   * @param properties The PCI's properties.
   * @param figure The figure, as `whole` writes it.
   * @returns The partition.
   * @throws {ShadePartsRefusedError} When its properties do not write one.
   */
  const partitionOf = (
    properties: Readonly<Record<string, string>>,
    figure: keyof typeof reads,
  ): Partition => {
    const parts = partsIn(properties, "parts");

    if (figure === "rectangle") {
      const rows = rowsIn(properties, "rows", parts);

      return { columns: parts / rows, kind: figure, rows };
    }

    return figure === "circle"
      ? { kind: figure, parts }
      : { kind: figure, parts, perRow: perRowOf(parts) };
  };

  /**
   * Name a whole for a screen reader: "a circle in 3 equal parts", "a set of 6".
   *
   * @param partition The partition.
   * @returns The name.
   */
  const nameOf = (partition: Partition): string =>
    partition.kind === "set"
      ? `a set of ${String(partition.parts)}`
      : `a ${partition.kind} in ${String(partsOf(partition))} equal parts`;

  /**
   * Read the shown model: its partition and the parts of it shaded, the first by place, or none
   * when the item writes no `shownShaded`.
   *
   * @param properties The PCI's properties.
   * @param figure The figure, as `whole` writes it.
   * @returns The shown model, or `undefined` for none.
   * @throws {ShadePartsRefusedError} When its properties are partly written, or shade none or more
   *   parts than it has.
   */
  const shownOf = (
    properties: Readonly<Record<string, string>>,
    figure: keyof typeof reads,
    model: Partition,
  ): { readonly partition: Partition; readonly shaded: number } | undefined => {
    const names: readonly string[] = reads[figure].shown;
    const written = names.filter((name) => properties[name] !== undefined);

    if (written.length === 0) {
      return undefined;
    }

    const parts = partsIn(properties, "shownParts");
    const modelParts = partsOf(model);

    if (modelParts % parts !== 0 || parts >= modelParts) {
      return refuse(
        `its property data-shown-parts is ${String(parts)}, no proper divisor of the shaded model's ${String(modelParts)} parts; the new denominator is a multiple of the shown one, and larger.`,
      );
    }

    const shaded = countOf(properties, "shownShaded");

    if (shaded >= parts) {
      return refuse(
        `its property data-shown-shaded shades ${String(shaded)} parts of a shown model of ${String(parts)}; shade at least one and not all.`,
      );
    }

    if (model.kind !== "rectangle") {
      return { partition: { kind: "circle", parts }, shaded };
    }

    const rows = rowsIn(properties, "shownRows", parts);
    const partition: Partition = { columns: parts / rows, kind: "rectangle", rows };

    if (model.rows % partition.rows !== 0 || model.columns % partition.columns !== 0) {
      return refuse(
        `its shaded model, ${String(model.rows)} by ${String(model.columns)}, does not align with its shown model, ${String(partition.rows)} by ${String(partition.columns)}; cut each of the shaded model's axes into a multiple of the shown model's.`,
      );
    }

    return model.columns >= model.rows && partition.columns >= partition.rows
      ? { partition, shaded }
      : refuse(
          `its models are cut into ${String(model.rows)} rows of ${String(model.columns)} and ${String(partition.rows)} rows of ${String(partition.columns)}; in the equivalence form each rectangle is cut along its length, no more rows than columns.`,
        );
  };

  /**
   * A set's object: the picture the item's markup holds, as the delivery system hands it (its
   * `src` resolved), its name and its design size.
   */
  interface Picture {
    readonly alt: string;
    readonly height: number;
    readonly href: string;
    readonly width: number;
  }

  /**
   * Read the markup the PCI is handed: empty for a rectangle or a circle, exactly one picture of
   * the object for a set. The form of the picture's `src` is the content's, never checked here: a
   * delivery system hands the markup with its own URL for the picture.
   *
   * @param dom The element holding the markup.
   * @param figure The figure.
   * @returns The set's picture, or `undefined` for a rectangle or a circle.
   * @throws {ShadePartsRefusedError} When the markup is not what the figure needs.
   */
  const pictureOf = (dom: HTMLElement, figure: keyof typeof reads): Picture | undefined => {
    const elements = [...dom.children];
    const text = [...dom.childNodes]
      .filter((node) => node.nodeType === node.TEXT_NODE)
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();

    if (figure !== "set") {
      return elements.length === 0 && text === ""
        ? undefined
        : refuse(`its markup holds content; a ${figure}'s markup is empty, the module draws it.`);
    }

    const [image] = elements;

    if (elements.length !== 1 || image?.localName !== "img" || text !== "") {
      return refuse(
        "its markup is not one picture; a set's markup holds exactly one img, the object's picture, and nothing else.",
      );
    }

    const alt = image.getAttribute("alt") ?? "";
    const src = image.getAttribute("src") ?? "";
    const width = image.getAttribute("width") ?? "";
    const height = image.getAttribute("height") ?? "";

    return alt.trim() !== "" && src.trim() !== "" && counting.test(width) && counting.test(height)
      ? {
          alt: alt.trim(),
          height: Number(height),
          href: new URL(src, image.baseURI).href,
          width: Number(width),
        }
      : refuse(
          "its picture lacks a src, an alt naming the object, or a whole width and height; write all four.",
        );
  };

  /**
   * Read the figure, and refuse a property written for another figure than the one the item names.
   *
   * @param properties The PCI's properties.
   * @returns The figure.
   * @throws {ShadePartsRefusedError} When the figure is unknown or another shape's property is
   *   written.
   */
  const figureOf = (properties: Readonly<Record<string, string>>): keyof typeof reads => {
    const figure = properties["whole"];

    if (figure !== "rectangle" && figure !== "circle" && figure !== "set") {
      return refuse(
        `its property data-whole is ${figure === undefined ? "absent" : `"${figure}"`}; write rectangle, circle or set.`,
      );
    }

    const own: ReadonlySet<string> = new Set([
      "whole",
      ...reads[figure].model,
      ...reads[figure].shown,
    ]);
    const known: ReadonlySet<string> = new Set(
      Object.values(reads).flatMap((each): readonly string[] => [...each.model, ...each.shown]),
    );
    const other = Object.keys(properties).find((name) => !own.has(name) && !qtiOwn.has(name));

    return other === undefined
      ? figure
      : refuse(
          known.has(other)
            ? `its property ${attributeOf(other)} belongs to another figure than ${figure}; remove it.`
            : `its property ${attributeOf(other)} is none the PCI reads; remove it, or correct its name.`,
        );
  };

  /**
   * Give the radius of a circle cut into `parts` sectors: the circle's radius, or more where a
   * sector of it would not hold the target's disc clear of the outlines ({@link sectorRadius}).
   *
   * @param parts The sectors, from 2.
   * @returns The radius, in CSS pixels.
   */
  const radiusOf = (parts: number): number => Math.max(circle.radius, sectorRadius(parts));

  /**
   * The greatest of some numbers, `-Infinity` for none, as `Math.max` gives it.
   *
   * @param values The numbers.
   * @returns The greatest.
   */
  const greatest = (values: readonly number[]): number => {
    let high = Number.NEGATIVE_INFINITY;

    for (const value of values) {
      high = Math.max(high, value);
    }

    return high;
  };

  /**
   * Give the box of a rectangle a model and its shown model share: {@link rectangle}'s along the
   * axis cut into more parts (columns, on a tie) and across the other, each axis grown until its
   * every part is the target wide.
   *
   * @param partitions The rectangle's partitions: the shaded model's and the shown model's.
   * @returns The box, in CSS pixels.
   */
  const rectangleBox = (
    partitions: readonly { readonly columns: number; readonly rows: number }[],
  ): Box => {
    const columns = greatest(partitions.map((partition) => partition.columns));
    const rows = greatest(partitions.map((partition) => partition.rows));
    const wide = columns >= rows;

    return {
      height: Math.max(wide ? rectangle.across : rectangle.along, target * rows),
      width: Math.max(wide ? rectangle.along : rectangle.across, target * columns),
    };
  };

  /**
   * Draw a sector of a circle as a path, from `start` to `end` turns clockwise from twelve o'clock,
   * as an SVG path: the centre, the arc's start, the arc, closed.
   *
   * @param centre The circle's centre, both coordinates.
   * @param radius The circle's radius.
   * @param start Where the sector starts, in turns.
   * @param end Where it ends, in turns.
   * @returns The path's data.
   */
  const sectorPath = (centre: number, radius: number, start: number, end: number): string => {
    const point = (turns: number): string => {
      const angle = turns * 2 * Math.PI;

      return `${(centre + radius * Math.sin(angle)).toFixed(2)} ${(centre - radius * Math.cos(angle)).toFixed(2)}`;
    };

    return `M${String(centre)} ${String(centre)} L${point(start)} A${String(radius)} ${String(radius)} 0 ${end - start > 0.5 ? "1" : "0"} 1 ${point(end)} Z`;
  };

  /**
   * Draw a model: its box and each part's outline, inset by the outline's width so every stroke
   * falls inside the box.
   *
   * @param partition The model's partition.
   * @param box The rectangle's box both models share, for a rectangle.
   * @param radius The radius both circles share, for a circle.
   * @returns The drawing.
   */
  const draw = (partition: Partition, box: Box, radius: number): Drawing => {
    const inset = look.stroke;

    if (partition.kind === "rectangle") {
      const width = box.width / partition.columns;
      const height = box.height / partition.rows;

      return {
        height: box.height + 2 * inset,
        parts: Array.from({ length: partsOf(partition) }, (_unused, index) => ({
          height,
          kind: "box",
          width,
          x: inset + (index % partition.columns) * width,
          y: inset + Math.floor(index / partition.columns) * height,
        })),
        width: box.width + 2 * inset,
      };
    }

    if (partition.kind === "circle") {
      const centre = radius + inset;

      return {
        height: 2 * centre,
        parts: Array.from({ length: partition.parts }, (_unused, index) => ({
          d: sectorPath(centre, radius, index / partition.parts, (index + 1) / partition.parts),
          kind: "path",
        })),
        width: 2 * centre,
      };
    }

    const rows = Math.ceil(partition.parts / partition.perRow);
    const columns = Math.min(partition.perRow, partition.parts);
    const pitch = set.side + set.gap;

    return {
      height: rows * pitch - set.gap + 2 * inset,
      parts: Array.from({ length: partition.parts }, (_unused, index) => ({
        cx: inset + (index % partition.perRow) * pitch + set.side / 2,
        cy: inset + Math.floor(index / partition.perRow) * pitch + set.side / 2,
        kind: "disc",
        r: set.side / 2,
      })),
      width: columns * pitch - set.gap + 2 * inset,
    };
  };

  /**
   * Read the parts shaded from the state the PCI is handed: `{ shaded }`, or its JSON text.
   *
   * @param state The state, as the host hands it, never `undefined` or `null`.
   * @param parts The parts.
   * @returns The parts shaded.
   * @throws {ShadePartsRefusedError} When the state names no list of the whole's parts.
   */
  const shadedOfState = (state: unknown, parts: number): readonly number[] => {
    const read: unknown = typeof state === "string" ? JSON.parse(state) : state;
    const shaded: unknown =
      typeof read === "object" && read !== null && "shaded" in read ? read.shaded : undefined;

    return Array.isArray(shaded) &&
      shaded.every(
        (index: unknown) =>
          typeof index === "number" && Number.isInteger(index) && index >= 0 && index < parts,
      ) &&
      new Set(shaded).size === shaded.length
      ? shaded.map(Number)
      : refuse(
          "the state it was handed names no list of the whole's parts; hand it the state its getState gave.",
        );
  };

  /**
   * Read the parts shaded from the response the PCI is bound to: as many as its count, the first by
   * place; none for no value or NULL.
   *
   * @param bound The bound value, the Appendix C JSON of the response, `undefined` for none.
   * @param parts The parts.
   * @returns The parts shaded.
   * @throws {ShadePartsRefusedError} When the value is no count of the whole's parts.
   */
  const shadedOfBound = (bound: unknown, parts: number): readonly number[] => {
    const base: unknown =
      typeof bound === "object" && bound !== null && "base" in bound ? bound.base : undefined;
    const shaded: unknown =
      typeof base === "object" && base !== null && "integer" in base ? base.integer : undefined;

    if (bound === undefined || base === null) {
      return [];
    }

    return typeof shaded === "number" && Number.isInteger(shaded) && shaded >= 1 && shaded <= parts
      ? Array.from({ length: shaded }, (_unused, index) => index)
      : refuse(
          `the response it is bound to is no count from 1 to ${String(parts)}; bind it to the integer response it gave.`,
        );
  };

  /**
   * Draw a set's picture of its object in each of its discs: centred, at its design size scaled to
   * fit within the disc's inner square, above the disc and never in the way of a tap on it.
   *
   * @param document The frame's document.
   * @param model The set's drawing.
   * @param picture The object's picture.
   */
  const drawPictures = (document: Document, model: ModelSvg, picture: Picture): void => {
    const room = set.side * Math.SQRT1_2;
    const scale = Math.min(room / picture.width, room / picture.height);
    const width = picture.width * scale;
    const height = picture.height * scale;

    for (const disc of model.parts) {
      const image = document.createElementNS(svgNamespace, "image");
      const cx = Number(disc.getAttribute("cx"));
      const cy = Number(disc.getAttribute("cy"));

      image.setAttribute("href", picture.href);
      image.setAttribute("x", String(cx - width / 2));
      image.setAttribute("y", String(cy - height / 2));
      image.setAttribute("width", String(width));
      image.setAttribute("height", String(height));
      image.setAttribute("aria-hidden", "true");
      image.setAttribute("pointer-events", "none");
      image.dataset["shade"] = "picture";
      disc.after(image);
    }
  };

  /**
   * Write the PCI's stylesheet into the frame's document, keyed on its `data-shade` parts: the
   * models stacked and centred, each part a plain tap target that neither drags nor selects, its
   * fill white or shaded, and a dashed ring on the part a keyboard has focused.
   *
   * @param document The frame's document.
   */
  const style = (document: Document): void => {
    const sheet = document.createElement("style");
    const part = (name: string): string => `[data-shade="${name}"]`;

    sheet.textContent = [
      `${part("whole")}{display:inline-flex;flex-direction:column;align-items:center;gap:${String(stack.gap)}px}`,
      `${part("model")}{display:block;overflow:visible;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}`,
      `${part("part")},${part("shown")}{fill:${look.clear};stroke:${look.outline};stroke-width:${String(look.stroke)}px;stroke-linejoin:round}`,
      `${part("part")}[aria-pressed="true"],${part("shown")}[data-shaded]{fill:${look.shaded}}`,
      `${part("part")}{cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;outline:none}`,
      `${part("part")}[aria-disabled="true"]{cursor:default}`,
      `${part("part")}:focus-visible{outline:3px dashed #555;outline-offset:-8px}`,
    ].join("\n");
    document.head.append(sheet);
  };

  /**
   * The SVG element each kind of outline is drawn as.
   */
  const elementOf = { box: "rect", disc: "circle", path: "path" } as const;

  /**
   * Give an outline's attributes, as its SVG element takes them.
   *
   * @param outline The outline.
   * @returns Its attributes, by name.
   */
  const attributesOf = (outline: Outline) => {
    if (outline.kind === "box") {
      return { height: outline.height, width: outline.width, x: outline.x, y: outline.y };
    }

    return outline.kind === "disc"
      ? { cx: outline.cx, cy: outline.cy, r: outline.r }
      : { d: outline.d };
  };

  /**
   * Make a model's SVG: its box, and each part's outline as an element of its own, marked with
   * `role`.
   *
   * @param document The frame's document.
   * @param drawing The model's drawing.
   * @param role The parts' mark: `part` for the model the child shades, `shown` for the shown one.
   * @returns The SVG and its parts, by place.
   */
  const svgOf = (document: Document, drawing: Drawing, role: "part" | "shown"): ModelSvg => {
    const svg = document.createElementNS(svgNamespace, "svg");
    const parts = drawing.parts.map((outline) => {
      const element = document.createElementNS(svgNamespace, elementOf[outline.kind]);

      for (const [name, value] of Object.entries(attributesOf(outline))) {
        element.setAttribute(name, String(value));
      }

      element.dataset["shade"] = role;

      return element;
    });

    svg.setAttribute("viewBox", `0 0 ${String(drawing.width)} ${String(drawing.height)}`);
    svg.setAttribute("width", String(drawing.width));
    svg.setAttribute("height", String(drawing.height));
    svg.dataset["shade"] = "model";

    for (const part of parts) {
      svg.append(part);
    }

    return { parts, svg };
  };

  /**
   * Render the PCI into its `dom`: the shown model, when the item names one, above the model the
   * child shades, each of its parts a tap target that shades it or clears it, the parts it comes
   * back with shaded, and the host told it is ready.
   *
   * @param dom The element the frame hands it, holding the markup.
   * @param configuration The configuration: the properties, the response identifier, the status,
   *   the bound response and `onready`.
   * @param state The state to restore, `undefined` (or `null`) for none.
   * @returns The PCI object.
   * @throws {ShadePartsRefusedError} When the configuration does not fit the PCI.
   */
  const getInstance = (
    dom: HTMLElement,
    configuration: ShadePartsConfiguration,
    state: unknown,
  ): ShadePartsInstance => {
    const { properties, responseIdentifier } = configuration;
    const figure = figureOf(properties);
    const partition = partitionOf(properties, figure);
    const shown = shownOf(properties, figure, partition);
    const parts = partsOf(partition);
    const partitions = shown === undefined ? [partition] : [shown.partition, partition];
    const box = rectangleBox(
      partitions.map((each) => (each.kind === "rectangle" ? each : { columns: 1, rows: 1 })),
    );
    const radius = greatest(partitions.map((each) => radiusOf(partsOf(each))));
    const document = dom.ownerDocument;
    const member = pictureOf(dom, figure);
    const bound: unknown = configuration.boundTo[responseIdentifier];
    const boundShaded = shadedOfBound(bound, parts);
    const stateShaded =
      state === undefined || state === null ? undefined : shadedOfState(state, parts);
    /**
     * The parts shaded. The stored response decides: a state is kept only where it shades as many
     * parts as the response it is bound to counts (NULL counting none), and decides alone only
     * where no response is bound at all.
     */
    const shaded = new Set(
      bound === undefined || stateShaded?.length === boundShaded.length
        ? (stateShaded ?? boundShaded)
        : boundShaded,
    );
    const whole = document.createElement("div");
    const model = svgOf(document, draw(partition, box, radius), "part");
    let interacting = configuration.status === "interacting";

    /**
     * Give the response: the number of parts shaded, NULL for none.
     *
     * @returns The Appendix C JSON.
     */
    const getResponse = (): ShadePartsResponse =>
      shaded.size === 0 ? { base: null } : { base: { integer: shaded.size } };

    /**
     * Give the state: the parts shaded, ascending.
     *
     * @returns The state.
     */
    const getState = (): ShadePartsState => ({
      shaded: [...shaded].toSorted((left, right) => left - right),
    });

    /**
     * Show one part as shaded or not, and as tappable or not.
     *
     * @param element The part's element.
     * @param index Its place.
     */
    const show = (element: SVGElement, index: number): void => {
      element.setAttribute("aria-pressed", String(shaded.has(index)));
      element.setAttribute("aria-disabled", String(!interacting));
      element.setAttribute("tabindex", interacting ? "0" : "-1");
    };

    const instance: ShadePartsInstance = {
      getResponse,
      getState,
      oncompleted: () => {
        interacting = false;

        for (const [index, element] of model.parts.entries()) {
          show(element, index);
        }
      },
    };

    /**
     * Shade a part, or clear it, and tell the host the response changed; nothing once the PCI no
     * longer takes taps.
     *
     * @param element The part's element.
     * @param index Its place.
     */
    const toggle = (element: SVGElement, index: number): void => {
      if (!interacting) {
        return;
      }

      if (shaded.has(index)) {
        shaded.delete(index);
      } else {
        shaded.add(index);
      }

      show(element, index);
      dom.dispatchEvent(
        new CustomEvent("qti-interaction-changed", {
          bubbles: true,
          detail: { interaction: instance, responseIdentifier, value: getResponse() },
        }),
      );
    };

    /**
     * Toggle a part on Enter or Space pressed with no chord. A held key repeats; it toggles the
     * part once.
     *
     * @param event The key event.
     * @param element The part's element.
     * @param index Its place.
     */
    const keyToggle = (event: KeyboardEvent, element: SVGElement, index: number): void => {
      const chord = event.altKey || event.ctrlKey || event.metaKey;

      if ((event.key !== "Enter" && event.key !== " ") || chord) {
        return;
      }

      event.preventDefault();

      if (event.repeat) {
        return;
      }

      toggle(element, index);
    };

    for (const [index, element] of model.parts.entries()) {
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", `part ${String(index + 1)} of ${String(parts)}`);
      element.addEventListener("click", () => {
        toggle(element, index);
      });
      element.addEventListener("keydown", (event) => {
        keyToggle(event, element, index);
      });
      show(element, index);
    }

    model.svg.setAttribute("role", "group");
    model.svg.setAttribute(
      "aria-label",
      member === undefined ? nameOf(partition) : `${nameOf(partition)}, each ${member.alt}`,
    );

    if (member !== undefined) {
      drawPictures(document, model, member);
    }

    if (shown !== undefined) {
      const picture = svgOf(document, draw(shown.partition, box, radius), "shown");

      for (const element of picture.parts.slice(0, shown.shaded)) {
        element.dataset["shaded"] = "";
      }

      picture.svg.setAttribute("role", "img");
      picture.svg.setAttribute(
        "aria-label",
        `${nameOf(shown.partition)}, ${String(shown.shaded)} shaded`,
      );
      whole.append(picture.svg);
    }

    style(document);
    whole.dataset["shade"] = "whole";
    whole.append(model.svg);
    dom.replaceChildren(whole);
    configuration.onready(instance, getState());

    return instance;
  };

  qtiCustomInteractionContext.register({ getInstance, typeIdentifier });
});
