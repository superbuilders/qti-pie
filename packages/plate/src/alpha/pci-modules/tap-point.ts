/**
 * Tap a point (`urn:fdc:alpha.school:2026:tap-point`): the Portable Custom Interaction of the
 * mastery gates' tap-a-point items, as the assessment lead specifies them (her K–5 TEI list of
 * 2026-11-19, rows 8 and 9): a tick tapped on a number line labelled only at its ends (a fraction's
 * tick, Grade 3), and an intersection tapped on a first-quadrant grid with labelled
 * axes (Grade 5), written as the AMD module a content package carries and the frame host loads by
 * QTI 3.0.1's own module resolution (`modules/tap-point.js`). The module draws the line or the grid
 * itself: the item holds no picture of it.
 *
 * - **The screen.** As `kind` says: `line`, a number line from `start` to `end` cut into `parts`
 *   equal parts by ticks, a numeral under its two end ticks and nothing under any other; or `grid`,
 *   a first-quadrant grid from 0 to `size` on both axes, every unit numbered on both axes, the
 *   x-axis titled `x-title` beneath and the y-axis titled `y-title` beside it. Nothing is marked at
 *   the start, and nothing else is drawn.
 * - **The interaction.** A tap on a tick rings it, a tap on an intersection sets a dot on it; a tap
 *   on the marked one takes the mark away, and a tap on another moves it there: one point at most.
 *   Each tick and intersection is a target of at least 44 px (WCAG 2.2's Target Size, Enhanced), a
 *   button named for its point ("tick 2 of 5", "(3, 6)"). To a keyboard the figure is one tab stop:
 *   the arrows move a dashed focus square over the ticks or the intersections, and Enter or Space
 *   taps the one it is on, once per press, none with Alt, Control or Meta.
 * - **The response.** The point marked, NULL `{ base: null }` / `{ list: null }` for none (an
 *   interaction left untouched sends no answer, owner's ruling Q6, and a mark taken away again is
 *   the same screen): on a line the tick's place from `start`, 0 to `parts`, `{ base: { integer: k
 *   } }` for a `single` `integer` declaration; on a grid its coordinates, `{ list: { integer: [x,
 *   y] } }` for an `ordered` `integer` declaration, so `match_correct` scores `(3, 6)` right and
 *   its swap `(6, 3)` wrong.
 * - **Coming back.** The state, which is the response, or else the response the PCI is bound to,
 *   marks its point; NULL or nothing marks none. A value no point of the figure has is refused.
 *
 * **Properties.** A closed set, each a `data-*` attribute of the `qti-portable-custom-interaction`:
 * `data-kind` (`line` or `grid`); for a line `data-start` and `data-end` (whole numbers from 0, no
 * leading zero, the end past the start, at most 20) and `data-parts` (2 to 12); for a grid
 * `data-size` (1 to 10), `data-x-title` and `data-y-title` (each a non-empty title of at most 40
 * characters). It passes over the two QTI 3.0.1's schema declares on the element
 * (`data-catalog-idref`, `data-qti-suppress-tts`) and refuses any other, one of the other kind's,
 * and one absent or malformed. The markup is empty: anything in it refuses.
 *
 * **Why a script.** This file is the module file with types (`#plate/alpha/pci-modules.ts` says
 * why): it imports no value and exports nothing, its one statement is the AMD `define` the frame's
 * loader runs, and every helper is inside the factory.
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
interface TapPointConfiguration extends PciFrameConfiguration {
  readonly boundTo: Readonly<Record<string, unknown>>;
  readonly onready: (interaction: TapPointInstance, state: TapPointResponse) => void;
}

/**
 * The Appendix C JSON of the response: a line's tick, a grid's coordinates, NULL for none.
 */
type TapPointResponse =
  | { readonly base: null }
  | { readonly base: { readonly integer: number } }
  | { readonly list: null }
  | { readonly list: { readonly integer: readonly [number, number] } };

/**
 * The PCI object `getInstance` returns: the two readers the host calls (the state is the
 * response), and `oncompleted`, which the host calls before the PCI's markup goes.
 */
interface TapPointInstance {
  readonly getResponse: () => TapPointResponse;
  readonly getState: () => TapPointResponse;
  readonly oncompleted: () => void;
}

/**
 * The factory the module registers with the bridge.
 */
interface TapPointFactory {
  readonly getInstance: (
    dom: HTMLElement,
    configuration: TapPointConfiguration,
    state: unknown,
  ) => TapPointInstance;
  readonly typeIdentifier: string;
}

/**
 * The `qtiCustomInteractionContext` bridge, as this module uses it.
 */
interface PciContext {
  readonly register: (factory: TapPointFactory) => void;
}

/**
 * The figure: a number line from `start` to `end` in `parts` equal parts, or a grid from 0 to
 * `size` on both axes with its axes' titles.
 */
type Figure =
  | { readonly end: number; readonly kind: "line"; readonly parts: number; readonly start: number }
  | {
      readonly kind: "grid";
      readonly size: number;
      readonly xTitle: string;
      readonly yTitle: string;
    };

/**
 * A point of the figure: a line's tick by its place from the start, `[k, 0]`, or a grid's
 * intersection `[x, y]`.
 */
type Point = readonly [number, number];

/**
 * What is marked: nothing, or one point.
 */
type Mark = { readonly kind: "none" } | { readonly kind: "at"; readonly point: Point };

/**
 * Where the PCI is: answering, with the point a keyboard's focus square is on, or closed, when the
 * host has completed it and it takes no tap or key.
 */
type Phase = { readonly cursor: Point; readonly kind: "answering" } | { readonly kind: "closed" };

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
  const typeIdentifier = "urn:fdc:alpha.school:2026:tap-point";

  /**
   * The look: the line, its ticks and the grid's axes `#333` at 3 px, the grid's lines `#9ca3af` at
   * 1 px, numerals and titles `#111827`, the mark `#1d6fd1` (Alpha's PCIs' ring and dot).
   *
   * @formatConstant
   */
  const look = { axis: "#333", grid: "#9ca3af", ink: "#111827", mark: "#1d6fd1", stroke: 3 };

  /**
   * The smallest target a point holds, in CSS pixels: WCAG 2.2's Target Size (Enhanced), 44 px.
   * Every size below is derived from it.
   *
   * @formatConstant
   */
  const target = 44;

  /**
   * A line: its length, twelve targets, so its finest cut leaves a target between ticks and the
   * whole line with its numerals fits a frame 700 px wide, as AlphaTest's question column gives
   * one; a tick's half height; the numerals' size and their baseline below the line; the ring's
   * radius and width.
   */
  const line = {
    length: 12 * target,
    numeral: 32,
    numeralBelow: 52,
    ring: { r: 16, width: 4 },
    tick: 14,
  };

  /**
   * A grid: a unit, a target and a margin; the numerals' size; the titles' size; the dot's radius.
   */
  const grid = { dot: 9, numeral: 18, title: 22, unit: target + 4 };

  /**
   * The room about a figure for its numerals and titles, in CSS pixels.
   */
  const margin = { bottom: 84, left: 84, right: 28, top: 24 };

  /**
   * The most a line's end may be, and its parts and a grid's size.
   */
  const most = { end: 20, parts: 12, size: 10, title: 40 };

  /**
   * A whole number as a property writes it: 0, or a number from 1 with no leading zero.
   */
  const whole = /^(?:0|[1-9][0-9]*)$/u;

  /**
   * The namespace the drawing is made in.
   */
  const svgNamespace = "http://www.w3.org/2000/svg";

  /**
   * The properties each kind reads, by dataset name: a property of the other kind's is refused.
   */
  const reads = {
    grid: ["kind", "size", "xTitle", "yTitle"],
    line: ["end", "kind", "parts", "start"],
  } as const;

  /**
   * The properties QTI 3.0.1's schema declares on the element itself, by dataset name
   * (`data-catalog-idref`, `data-qti-suppress-tts`): passed over, never read.
   */
  const qtiOwn: ReadonlySet<string> = new Set(["catalogIdref", "qtiSuppressTts"]);

  /**
   * The item's configuration of the PCI refused: a property it reads is absent, malformed or out of
   * range, written for the other kind, the markup is not empty, or the state or bound response it
   * is handed is no point of the figure. `getInstance` throwing is the PCI contract's one failure.
   */
  class TapPointRefusedError extends Error {
    override readonly name = "TapPointRefusedError";
  }

  /**
   * Refuse the configuration: throw {@link TapPointRefusedError}, its message the PCI's name, what
   * breaks the rule, and the repair.
   *
   * @param detail What breaks the rule, and the repair.
   * @returns Never.
   * @throws {TapPointRefusedError} Always.
   */
  const refuse = (detail: string): never => {
    throw new TapPointRefusedError(`The tap-point PCI (${typeIdentifier}) cannot run: ${detail}`);
  };

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
   * Read a property that writes a whole number within a range.
   *
   * @param properties The PCI's properties.
   * @param name The property's dataset name.
   * @param least Its least value.
   * @param greatest Its greatest value.
   * @returns The number.
   * @throws {TapPointRefusedError} When it is absent, malformed or out of range.
   */
  const wholeOf = (
    properties: Readonly<Record<string, string>>,
    name: string,
    least: number,
    greatest: number,
  ): number => {
    const written = properties[name];

    return written !== undefined &&
      whole.test(written) &&
      Number(written) >= least &&
      Number(written) <= greatest
      ? Number(written)
      : refuse(
          `its property ${attributeOf(name)} is ${written === undefined ? "absent" : `"${written}"`}; write a whole number from ${String(least)} to ${String(greatest)} with no leading zero.`,
        );
  };

  /**
   * Read a property that writes an axis's title.
   *
   * @param properties The PCI's properties.
   * @param name The property's dataset name.
   * @returns The title.
   * @throws {TapPointRefusedError} When it is absent, empty, padded or too long.
   */
  const titleOf = (properties: Readonly<Record<string, string>>, name: string): string => {
    const written = properties[name];

    return written !== undefined &&
      written !== "" &&
      written.trim() === written &&
      written.length <= most.title
      ? written
      : refuse(
          `its property ${attributeOf(name)} is ${written === undefined ? "absent" : `"${written}"`}; write the axis's title, 1 to ${String(most.title)} characters with no space at either end.`,
        );
  };

  /**
   * Read the figure, and refuse a property the kind does not read.
   *
   * @param properties The PCI's properties.
   * @returns The figure.
   * @throws {TapPointRefusedError} When the properties write none.
   */
  const figureOf = (properties: Readonly<Record<string, string>>): Figure => {
    const { kind } = properties;

    if (kind !== "line" && kind !== "grid") {
      return refuse(
        `its property data-kind is ${kind === undefined ? "absent" : `"${kind}"`}; write line or grid.`,
      );
    }

    const own: ReadonlySet<string> = new Set(reads[kind]);
    const known: ReadonlySet<string> = new Set([...reads.grid, ...reads.line]);
    const other = Object.keys(properties).find((name) => !own.has(name) && !qtiOwn.has(name));

    if (other !== undefined) {
      return refuse(
        known.has(other)
          ? `its property ${attributeOf(other)} belongs to the other kind than ${kind}; remove it.`
          : `its property ${attributeOf(other)} is none the PCI reads; remove it, or correct its name.`,
      );
    }

    if (kind === "grid") {
      return {
        kind,
        size: wholeOf(properties, "size", 1, most.size),
        xTitle: titleOf(properties, "xTitle"),
        yTitle: titleOf(properties, "yTitle"),
      };
    }

    const start = wholeOf(properties, "start", 0, most.end - 1);

    return {
      end: wholeOf(properties, "end", start + 1, most.end),
      kind,
      parts: wholeOf(properties, "parts", 2, most.parts),
      start,
    };
  };

  /**
   * Whether a point is one of the figure's: a tick from 0 to `parts`, an intersection from 0 to
   * `size` on each axis.
   *
   * @param figure The figure.
   * @param point The point.
   * @returns Whether it is the figure's.
   */
  const isPointOf = (figure: Figure, [x, y]: Point): boolean => {
    const [xMost, yMost] = figure.kind === "line" ? [figure.parts, 0] : [figure.size, figure.size];

    return (
      Number.isSafeInteger(x) &&
      Number.isSafeInteger(y) &&
      x >= 0 &&
      y >= 0 &&
      x <= xMost &&
      y <= yMost
    );
  };

  /**
   * Read the integer member of a response's Appendix C JSON as the figure writes it: a line's `{
   * base: { integer: k } }` as the point `[k, 0]`, a grid's `{ list: { integer: [x, y] } }` as `[x,
   * y]`; NULL or nothing as no point. Any other JSON reads as `NaN` coordinates, which no figure
   * holds.
   *
   * @param figure The figure.
   * @param given The JSON, or its text.
   * @returns The point, `undefined` for none.
   */
  const pointOfJson = (figure: Figure, given: unknown): Point | undefined => {
    const record: unknown = typeof given === "string" ? JSON.parse(given) : given;
    const field = figure.kind === "line" ? "base" : "list";
    const value: unknown =
      typeof record === "object" && record !== null
        ? Object.getOwnPropertyDescriptor(record, field)?.value
        : undefined;

    if (record === undefined || record === null || value === null) {
      return undefined;
    }

    const integer: unknown =
      typeof value === "object" && value !== null
        ? Object.getOwnPropertyDescriptor(value, "integer")?.value
        : undefined;
    const members: readonly unknown[] = Array.isArray(integer) ? integer : [integer, 0];
    const written = figure.kind === "line" ? !Array.isArray(integer) : members.length === 2;
    const [x, y] = members.map((member) => (typeof member === "number" ? member : Number.NaN));

    return written ? [x ?? Number.NaN, y ?? Number.NaN] : [Number.NaN, Number.NaN];
  };

  /**
   * Read what is marked from a response's Appendix C JSON, as the state or the bound response gives
   * it.
   *
   * @param figure The figure.
   * @param given The JSON.
   * @returns The mark.
   * @throws {TapPointRefusedError} When the JSON is no point of the figure.
   */
  const markOf = (figure: Figure, given: unknown): Mark => {
    const point = pointOfJson(figure, given);

    if (point === undefined) {
      return { kind: "none" };
    }

    return isPointOf(figure, point)
      ? { kind: "at", point }
      : refuse(
          `the response or state it is handed is no ${figure.kind === "line" ? "tick of the line" : "intersection of the grid"}; hand it the response it gave.`,
        );
  };

  /**
   * Make an SVG element with its attributes.
   *
   * @param document The frame's document.
   * @param name The element's name.
   * @param attributes Its attributes, by name.
   * @returns The element.
   */
  const svgElement = (
    document: Document,
    name: string,
    attributes: Readonly<Record<string, number | string>>,
  ): SVGElement => {
    const element = document.createElementNS(svgNamespace, name);

    for (const [attribute, value] of Object.entries(attributes)) {
      element.setAttribute(attribute, String(value));
    }

    return element;
  };

  /**
   * Make a numeral or a title as SVG text.
   *
   * @param document The frame's document.
   * @param content Its text.
   * @param attributes Its place and look.
   * @returns The element.
   */
  const svgText = (
    document: Document,
    content: string,
    attributes: Readonly<Record<string, number | string>>,
  ): SVGElement => {
    const element = svgElement(document, "text", {
      fill: look.ink,
      "text-anchor": "middle",
      ...attributes,
    });

    element.textContent = content;

    return element;
  };

  /**
   * Where a point is drawn, in the drawing's pixels.
   *
   * @param figure The figure.
   * @param point The point.
   * @returns Its centre.
   */
  const placeOf = (figure: Figure, [x, y]: Point): { readonly cx: number; readonly cy: number } =>
    figure.kind === "line"
      ? {
          cx: margin.left + (x * line.length) / figure.parts,
          cy: margin.top + line.tick + line.ring.r,
        }
      : {
          cx: margin.left + x * grid.unit,
          cy: margin.top + (figure.size - y) * grid.unit,
        };

  /**
   * Draw the figure, beneath its targets: the line with its ticks and its end numerals, or the grid
   * with its lines, axes, numerals and titles.
   *
   * @param document The frame's document.
   * @param figure The figure.
   * @returns The SVG, sized to the drawing.
   */
  const drawFigure = (document: Document, figure: Figure): SVGSVGElement => {
    const svg = document.createElementNS(svgNamespace, "svg");
    const parts: SVGElement[] = [];
    const stroke = { stroke: look.axis, "stroke-linecap": "round", "stroke-width": look.stroke };
    const [width, height] =
      figure.kind === "line"
        ? [
            margin.left + line.length + margin.right,
            margin.top + 2 * (line.tick + line.ring.r) + line.numeralBelow,
          ]
        : [
            margin.left + figure.size * grid.unit + margin.right,
            margin.top + figure.size * grid.unit + margin.bottom,
          ];

    if (figure.kind === "line") {
      const y = placeOf(figure, [0, 0]).cy;

      parts.push(
        svgElement(document, "line", {
          x1: margin.left,
          x2: margin.left + line.length,
          y1: y,
          y2: y,
          ...stroke,
        }),
      );

      for (let tick = 0; tick <= figure.parts; tick += 1) {
        const { cx } = placeOf(figure, [tick, 0]);

        parts.push(
          svgElement(document, "line", {
            x1: cx,
            x2: cx,
            y1: y - line.tick,
            y2: y + line.tick,
            ...stroke,
          }),
        );
      }

      for (const [tick, numeral] of [
        [0, figure.start],
        [figure.parts, figure.end],
      ] as const) {
        parts.push(
          svgText(document, String(numeral), {
            "font-size": line.numeral,
            "font-weight": 600,
            x: placeOf(figure, [tick, 0]).cx,
            y: y + line.numeralBelow,
          }),
        );
      }
    } else {
      const far = figure.size * grid.unit;
      const origin = placeOf(figure, [0, 0]);

      for (let unit = 0; unit <= figure.size; unit += 1) {
        const { cx } = placeOf(figure, [unit, 0]);
        const { cy } = placeOf(figure, [0, unit]);

        parts.push(
          svgElement(document, "line", {
            stroke: look.grid,
            "stroke-width": 1,
            x1: cx,
            x2: cx,
            y1: margin.top,
            y2: margin.top + far,
          }),
          svgElement(document, "line", {
            stroke: look.grid,
            "stroke-width": 1,
            x1: margin.left,
            x2: margin.left + far,
            y1: cy,
            y2: cy,
          }),
          svgText(document, String(unit), { "font-size": grid.numeral, x: cx, y: origin.cy + 26 }),
          svgText(document, String(unit), {
            "dominant-baseline": "central",
            "font-size": grid.numeral,
            "text-anchor": "end",
            x: origin.cx - 12,
            y: cy,
          }),
        );
      }

      parts.push(
        svgElement(document, "line", {
          x1: origin.cx,
          x2: origin.cx + far,
          y1: origin.cy,
          y2: origin.cy,
          ...stroke,
        }),
        svgElement(document, "line", {
          x1: origin.cx,
          x2: origin.cx,
          y1: origin.cy,
          y2: margin.top,
          ...stroke,
        }),
        svgText(document, figure.xTitle, {
          "font-size": grid.title,
          "font-weight": 600,
          x: origin.cx + far / 2,
          y: origin.cy + 64,
        }),
        svgText(document, figure.yTitle, {
          "font-size": grid.title,
          "font-weight": 600,
          transform: `rotate(-90 ${String(margin.left - 52)} ${String(margin.top + far / 2)})`,
          x: margin.left - 52,
          y: margin.top + far / 2,
        }),
      );
    }

    svg.setAttribute("viewBox", `0 0 ${String(width)} ${String(height)}`);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.dataset["tap"] = "figure";

    for (const part of parts) {
      part.setAttribute("aria-hidden", "true");
      svg.append(part);
    }

    return svg;
  };

  /**
   * Name the figure for a screen reader: "a number line from 0 to 1 in 5 equal parts", "a grid from
   * 0 to 10, Days across and Pages read up".
   *
   * @param figure The figure.
   * @returns The name.
   */
  const nameOf = (figure: Figure): string =>
    figure.kind === "line"
      ? `a number line from ${String(figure.start)} to ${String(figure.end)} in ${String(figure.parts)} equal parts`
      : `a grid from 0 to ${String(figure.size)}, ${figure.xTitle} across and ${figure.yTitle} up`;

  /**
   * Name a point for a screen reader: "tick 2 of 5", "(3, 6)".
   *
   * @param figure The figure.
   * @param point The point.
   * @returns The name.
   */
  const pointName = (figure: Figure, [x, y]: Point): string =>
    figure.kind === "line"
      ? `tick ${String(x)} of ${String(figure.parts)}`
      : `(${String(x)}, ${String(y)})`;

  /**
   * Write the PCI's stylesheet into the frame's document, keyed on its `data-tap` parts.
   *
   * @param document The frame's document.
   */
  const style = (document: Document): void => {
    const sheet = document.createElement("style");
    const part = (name: string): string => `[data-tap="${name}"]`;

    sheet.textContent = [
      `${part("figure")}{display:block;max-width:100%;height:auto;overflow:visible;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;outline:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}`,
      `${part("target")}{fill:transparent;cursor:pointer}`,
      `${part("figure")}[aria-disabled="true"] ${part("target")}{cursor:default}`,
      `${part("cursor")}{fill:none;stroke:#555;stroke-width:3px;stroke-dasharray:6 4;visibility:hidden}`,
      `${part("figure")}:focus-visible ${part("cursor")}{visibility:visible}`,
    ].join("\n");
    document.head.append(sheet);
  };

  /**
   * Render the PCI into its `dom`: the figure, a target over each of its points, the point it
   * comes back with marked, and the host told it is ready.
   *
   * @param dom The element the frame hands it, holding the markup.
   * @param configuration The configuration: the properties, the response identifier, the status,
   *   the bound response and `onready`.
   * @param state The state to restore, `undefined` (or `null`) for none.
   * @returns The PCI object.
   * @throws {TapPointRefusedError} When the configuration does not fit the PCI.
   */
  const getInstance = (
    dom: HTMLElement,
    configuration: TapPointConfiguration,
    state: unknown,
  ): TapPointInstance => {
    const { properties, responseIdentifier } = configuration;
    const figure = figureOf(properties);
    const loose = [...dom.childNodes].some(
      (node) => node.nodeType !== node.TEXT_NODE || (node.textContent ?? "").trim() !== "",
    );

    if (loose) {
      refuse("its markup holds content; the markup is empty, the module draws the figure.");
    }

    const document = dom.ownerDocument;
    const svg = drawFigure(document, figure);
    let mark = markOf(figure, state ?? configuration.boundTo[responseIdentifier]);
    let phase: Phase =
      configuration.status === "interacting"
        ? { cursor: [0, 0], kind: "answering" }
        : { kind: "closed" };
    const [xMost, yMost] = figure.kind === "line" ? [figure.parts, 0] : [figure.size, figure.size];
    const drawnMark =
      figure.kind === "line"
        ? svgElement(document, "circle", {
            fill: "none",
            r: line.ring.r,
            stroke: look.mark,
            "stroke-width": line.ring.width,
          })
        : svgElement(document, "circle", {
            fill: look.mark,
            r: grid.dot,
            stroke: "#fff",
            "stroke-width": 2,
          });
    const focus = svgElement(document, "rect", { height: target, width: target });

    focus.dataset["tap"] = "cursor";
    drawnMark.setAttribute("pointer-events", "none");
    drawnMark.setAttribute("aria-hidden", "true");

    /**
     * Give the response: the point marked, NULL for none.
     *
     * @returns The Appendix C JSON.
     */
    const getResponse = (): TapPointResponse => {
      if (figure.kind === "line") {
        return mark.kind === "none" ? { base: null } : { base: { integer: mark.point[0] } };
      }

      return mark.kind === "none"
        ? { list: null }
        : { list: { integer: [mark.point[0], mark.point[1]] } };
    };

    /**
     * Show the mark where the point is, or none, the focus square on the keyboard's point, and
     * whether the figure takes taps.
     */
    const show = (): void => {
      if (mark.kind === "none") {
        drawnMark.remove();
      } else {
        const { cx, cy } = placeOf(figure, mark.point);

        drawnMark.setAttribute("cx", String(cx));
        drawnMark.setAttribute("cy", String(cy));
        svg.append(drawnMark);
      }

      if (phase.kind === "answering") {
        const at = placeOf(figure, phase.cursor);

        focus.setAttribute("x", String(at.cx - target / 2));
        focus.setAttribute("y", String(at.cy - target / 2));
      }

      svg.setAttribute("aria-disabled", String(phase.kind === "closed"));
      svg.setAttribute("tabindex", phase.kind === "answering" ? "0" : "-1");
      svg.setAttribute(
        "aria-label",
        `${nameOf(figure)}; ${mark.kind === "none" ? "no point marked" : `${pointName(figure, mark.point)} marked`}`,
      );
    };

    const instance: TapPointInstance = {
      getResponse,
      getState: getResponse,
      oncompleted: () => {
        phase = { kind: "closed" };
        show();
      },
    };

    /**
     * Tap a point: mark it, or take the mark away where it is marked, and tell the host the
     * response changed; nothing once the PCI no longer takes taps.
     *
     * @param point The point.
     */
    const tap = (point: Point): void => {
      if (phase.kind === "closed") {
        return;
      }

      const same = mark.kind === "at" && mark.point[0] === point[0] && mark.point[1] === point[1];

      mark = same ? { kind: "none" } : { kind: "at", point };
      phase = { cursor: point, kind: "answering" };
      show();
      dom.dispatchEvent(
        new CustomEvent("qti-interaction-changed", {
          bubbles: true,
          detail: { interaction: instance, responseIdentifier, value: getResponse() },
        }),
      );
    };

    for (let x = 0; x <= xMost; x += 1) {
      for (let y = 0; y <= yMost; y += 1) {
        const { cx, cy } = placeOf(figure, [x, y]);
        const [width, height] =
          figure.kind === "line" ? [target, 2 * target] : [grid.unit, grid.unit];
        const hit = svgElement(document, "rect", {
          height,
          width,
          x: cx - width / 2,
          y: cy - height / 2,
        });

        hit.dataset["tap"] = "target";
        hit.setAttribute("role", "button");
        hit.setAttribute("aria-label", pointName(figure, [x, y]));
        hit.dataset["x"] = String(x);
        hit.dataset["y"] = String(y);
        hit.addEventListener("click", () => {
          tap([x, y]);
        });
        svg.append(hit);
      }
    }

    svg.append(focus);
    svg.setAttribute("role", "group");
    svg.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const step = {
        ArrowDown: [0, -1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, 1],
      }[event.key];

      if (phase.kind === "closed") {
        return;
      }

      const { cursor } = phase;

      if (step !== undefined) {
        event.preventDefault();
        phase = {
          cursor: [
            Math.min(xMost, Math.max(0, cursor[0] + (step[0] ?? 0))),
            Math.min(yMost, Math.max(0, cursor[1] + (step[1] ?? 0))),
          ],
          kind: "answering",
        };
        show();

        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        if (!event.repeat) {
          tap(cursor);
        }
      }
    });

    style(document);
    dom.replaceChildren(svg);
    show();
    configuration.onready(instance, getResponse());

    return instance;
  };

  qtiCustomInteractionContext.register({ getInstance, typeIdentifier });
});
