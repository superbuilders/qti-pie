/**
 * The counter tray, `urn:fdc:alpha.school:2026:count-placements`: a Portable Custom Interaction
 * (Q-16) module in which a child builds a set by moving identical counters from a tray onto a mat,
 * and which reports how many stand on the mat: the kindergarten mastery forms' counting item, whose
 * score is the count placed when the child submits.
 *
 * The module is content, not plate: an item names it through QTI 3.0.1's own module resolution, its
 * `module` attribute and a `qti-interaction-module` whose `primary-path` locates its file in the
 * item's package (`modules/count-placements` there, `.js` appended), and the frame host loads that
 * file in the PCI's sandboxed frame like any author's module. This file is that module with types
 * (`#plate/alpha/pci-modules.ts` says why): its one statement is the anonymous AMD `define` the
 * frame's loader runs, asking for the `qtiCustomInteractionContext` bridge, and every helper is
 * inside the factory, which reaches nothing but the bridge and the frame's globals.
 *
 * What the child sees and does:
 *
 * - **The screen.** The mat: an open dark rounded rectangle, or a double ten frame; a dashed arrow
 *   up; and the tray, which starts with `supply` identical counters. A counter is a picture, the
 *   item's: the interaction's markup is exactly one `img`, the counter, which the module shows as
 *   every counter at the picture's own size (its `width`, equal to its `height`, 32 to 64 CSS
 *   pixels, the board drawn to that scale), and never as a counter of its own. A picture the child
 *   is asked to match is the item's prompt's, never the module's.
 * - **The state is a count.** The one fact the tray holds is how many counters stand on the mat, from
 *   none to the whole supply; every counter is the same, so which one moved is no fact. The screen
 *   is drawn from the count alone: the mat shows that many counters and the tray the rest, each in
 *   rows of six, every row centred, the rows centred top to bottom; on the double ten frame the
 *   counters fill the first cells, frame one before frame two, each top row first, left to right. A
 *   gap on the mat, or frame two begun while frame one has an empty cell, cannot be drawn. The
 *   double ten frame holds twenty counters, and a supply is at most twenty, so every counter of the
 *   tray has a cell: no mat is ever full while the tray holds one.
 * - **Moving a counter.** Drag it from the tray and drop it on the mat, or tap it and then tap the
 *   mat; a counter on the mat goes back to the tray the same two ways. Mouse, touch and pen are one
 *   pointer, one gesture at a time (a finger resting off the board takes no part), read by one
 *   recognizer: a press on any of the board's buttons, a counter or a zone's background, is a tap
 *   of the button pressed until the pointer travels half a counter's side as the screen draws it
 *   (half the picture's width, in CSS pixels) from where it went down, read on every move and at
 *   the release. Past that, a press on a counter is a drag, which moves the counter when it is let
 *   go over the other zone, its background or one of its counters, as the element under the pointer
 *   says, and puts it back anywhere else; a press on a background that travels is no gesture. A tap
 *   on a counter of the other zone while one is chosen counts as a tap on that zone. The board
 *   takes every touch that starts on it as the child's (`touch-action: none`), so a finger's drag
 *   moves a counter rather than the page. Each counter, and each zone, is a button for the keyboard
 *   (Enter or Space taps it).
 * - **No count.** Nothing on the screen or in an accessible name is a numeral or a count, and the
 *   module is never told the target, so the mat cannot change when the target is reached.
 * - **A press that ends unseen.** A press whose pointer is cancelled or loses the board's capture,
 *   moves with no button held, or presses again ends with no gesture, so no press outlives its
 *   release; and no context menu opens on the board.
 * - **Completion.** Once the host completes the PCI (`oncompleted()`), a drag under way ends where it
 *   is, and the tray hears no more input.
 *
 * Its response is the count, a single integer in the Appendix C binding (`{ "base": { "integer": n
 * } }`), which it fires as `qti-interaction-changed` on each move and returns from `getResponse()`;
 * the item's `match_correct` scores it. An empty mat is the tray as it starts, so its response is
 * the one an untouched tray gives, NULL (`{ "base": null }`): no answer, whenever the host reads
 * it, as a counter only chosen, or every counter placed and taken back, leaves the mat. A child who
 * comes back to the item (the configuration's `boundTo`) finds that many counters on the mat.
 *
 * Its properties are the element's `data-*` attributes, exactly two, each required (the attributes
 * QTI 3.0.1's schema itself gives the element, `data-catalog-idref` and `data-qti-suppress-tts`,
 * are the delivery system's, passed over; `data-ssml` is not among them, and is refused):
 * `data-supply`, the counters in the tray, a whole number from 1 to 20 (the double ten frame's
 * cells, the largest set a counter item builds); and `data-mat`, `open` or `double-ten-frame`. Any
 * other property, one malformed, or markup that is not the counter's one picture with `src`, `alt`,
 * `width`, `height` and `data-qti-suppress-tts="computer-read-aloud"` (an item carries exactly
 * these; a host may add its own), is the item's defect: `getInstance` throws, naming it, and the
 * frame host says the PCI cannot run.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 */
import type { PciJson } from "#plate/pci/json.ts";
import type { BoundConfiguration } from "#plate/ui/portable-custom/protocol.ts";

/**
 * A PCI object as this module makes it: the readers the host calls and the completion it asks for.
 */
interface CounterTray {
  readonly getResponse: () => PciJson;
  readonly getState: () => PciJson;
  readonly oncompleted: () => void;
}

/**
 * The configuration the host hands `getInstance`: the bound configuration, and the host's own
 * `onready`, which the module calls once it is drawn.
 */
interface GivenConfiguration extends BoundConfiguration {
  readonly onready: (interaction: CounterTray, state: PciJson) => void;
}

/**
 * The `qtiCustomInteractionContext` bridge, as this module uses it: `register` alone.
 */
interface PciContext {
  readonly register: (factory: {
    readonly getInstance: (dom: HTMLElement, configuration: GivenConfiguration) => CounterTray;
    readonly typeIdentifier: string;
  }) => void;
}

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
  factory: (context: PciContext) => void,
): void;

define(["qtiCustomInteractionContext"], (context) => {
  "use strict";

  const svgNamespace = "http://www.w3.org/2000/svg";
  const outline = "#333";
  const faint = "#c7cdd3";
  const chosen = "#1d6fd1";

  /**
   * A counter's side, on the mat, in a cell of the double ten frame and in the tray, and the gap
   * between two counters, in board units. The board is drawn so that a counter's side is the
   * counter's picture's own size in CSS pixels (its `width`), so every other length scales with it.
   */
  const counterSide = 100;
  const gap = 36;
  const pitch = counterSide + gap;

  /**
   * The least and the greatest side of the counter's picture, in CSS pixels: a counter a child's
   * finger can hold, and a tray of twenty that still fits a page.
   */
  const faceSides = { greatest: 64, least: 32 } as const;

  /**
   * The attributes the counter's picture carries, each required: what `img` needs to be drawn and
   * named, and QTI's own `data-qti-suppress-tts`, which keeps a reader from saying it.
   */
  const faceAttributes: ReadonlySet<string> = new Set([
    "alt",
    "data-qti-suppress-tts",
    "height",
    "src",
    "width",
  ]);

  /**
   * A zone's border and padding, its corner radius, and its least size, in board units: the open
   * mat and the tray five counters wide, the open mat two rows high and the tray one, the ten-frame
   * mat its two frames and a margin.
   */
  const border = 10;
  const padding = 40;
  const radius = 60;
  const inset = border + padding;
  const openWidth = 5 * pitch - gap + 2 * inset;
  const openHeight = 2 * pitch - gap + 2 * inset + 24;
  const tenFrameWidth = 1420;
  const tenFrameHeight = 360;
  const trayHeight = counterSide + 2 * inset + 20;

  /**
   * A ten frame's cell side, its two frames' gap, and the arrow's length, in board units.
   */
  const cell = 124;
  const frameGap = 70;
  const arrowLength = 120;

  /**
   * A ten frame's shape: two rows of five cells; the mat holds two frames side by side, twenty
   * cells.
   */
  const frameColumns = 5;
  const frameRows = 2;
  const frameCells = frameColumns * frameRows;
  const frameCount = 2;
  const tenFrameCells = frameCount * frameCells;

  /**
   * The counters a row of the tray or the open mat holds: as many as fit across the zone's inside
   * at the counters' pitch, five.
   */
  const perRow = Math.floor((openWidth - 2 * inset + gap) / pitch);

  /**
   * The board's two zones, the one list every zone-wide reading walks.
   */
  const zones = ["mat", "tray"] as const;

  type Zone = (typeof zones)[number];

  /**
   * Read a zone's name, as an element's `data-*` attribute writes it.
   *
   * @param name The name, if any.
   * @returns The zone, none for a name that is no zone's.
   */
  const zoneNamed = (name: string | undefined): Zone | undefined =>
    zones.find((zone) => zone === name);

  /**
   * Where a counter stands, its centre on the board.
   */
  interface Point {
    readonly x: number;
    readonly y: number;
  }

  /**
   * A rectangle of the board: a zone's inside, which its counters are laid out in.
   */
  interface Inside {
    readonly height: number;
    readonly left: number;
    readonly top: number;
    readonly width: number;
  }

  /**
   * One counter on the screen: its zone, and its index among the counters drawn there.
   */
  interface Place {
    readonly slot: number;
    readonly zone: Zone;
  }

  /**
   * One of the board's buttons a press can start on: a counter, with its element and its place, or
   * a zone's background.
   */
  type Pressed =
    | { readonly element: SVGElement; readonly kind: "counter"; readonly place: Place }
    | { readonly kind: "zone"; readonly zone: Zone };

  /**
   * Fail the instance: the item's configuration is malformed. The frame host reports the error as
   * the reason the PCI cannot run.
   *
   * @param reason One sentence naming what is wrong.
   * @returns Never.
   */
  const refuse = (reason: string): never => {
    throw new Error(`count-placements: ${reason}`);
  };

  /**
   * The module's properties, by the name HTML's `dataset` gives each `data-*` attribute: each the
   * reading of its attribute's text, which refuses a malformed one. A property this record does not
   * name is not the module's.
   */
  const parsers = {
    mat: (value: string): "double-ten-frame" | "open" =>
      value === "open" || value === "double-ten-frame"
        ? value
        : refuse(`data-mat is "${value}", not open or double-ten-frame.`),
    supply: (value: string): number =>
      /^[1-9][0-9]?$/u.test(value) && Number(value) <= tenFrameCells
        ? Number(value)
        : refuse(
            `data-supply is "${value}", not a whole number from 1 to ${String(tenFrameCells)} (the double ten frame's cells, the largest set a counter item builds).`,
          ),
  };

  /**
   * The `data-*` attributes QTI 3.0.1's schema itself gives a portable custom interaction
   * (`data-catalog-idref`, `data-qti-suppress-tts`), by dataset name: the delivery system's, never
   * an author's property, so the module passes over them, and only them.
   */
  const qtiOwn: ReadonlySet<string> = new Set(["catalogIdref", "qtiSuppressTts"]);

  /**
   * Read the properties: refuse any that neither {@link parsers} nor {@link qtiOwn} names, then read
   * each one {@link parsers} names, each required.
   *
   * @param properties The element's `data-*` attributes, by dataset name.
   * @returns Each property's reading, by its name.
   */
  const settingsOf = (properties: Readonly<Record<string, string>>) => {
    const unknown = Object.keys(properties).filter(
      (name) => !Object.hasOwn(parsers, name) && !qtiOwn.has(name),
    );

    if (unknown.length > 0) {
      refuse(
        `the properties ${unknown.map((name) => `data-${name.replaceAll(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}`).join(", ")} are not this module's.`,
      );
    }

    return {
      mat: parsers.mat(properties["mat"] ?? ""),
      supply: parsers.supply(properties["supply"] ?? ""),
    } satisfies { readonly [Name in keyof typeof parsers]: ReturnType<(typeof parsers)[Name]> };
  };

  /**
   * Read the response a tray is bound to as the counters on its mat: none for no response or NULL
   * (`{ "base": null }`), the integer of `{ "base": { "integer": n } }` for a whole number from 1
   * to the supply (the module never reports 0: an empty mat is NULL); a value of another
   * cardinality than single, or a single value that is no such number, is refused, each naming
   * what it is, since it crosses `postMessage` untyped.
   *
   * @param bound The bound response, if any.
   * @param supply The tray's supply.
   * @returns The counters on the mat.
   */
  const boundCount = (bound: unknown, supply: number): number => {
    if (bound === undefined) {
      return 0;
    }

    const base =
      typeof bound === "object" &&
      bound !== null &&
      "base" in bound &&
      Object.keys(bound).length === 1
        ? bound.base
        : refuse("the response it is bound to is no single value.");
    const integer =
      typeof base === "object" &&
      base !== null &&
      "integer" in base &&
      Object.keys(base).length === 1
        ? base.integer
        : undefined;

    if (base === null) {
      return 0;
    }

    return typeof integer === "number" &&
      Number.isInteger(integer) &&
      integer >= 1 &&
      integer <= supply
      ? integer
      : refuse("the response it is bound to is no number of counters its tray holds.");
  };

  /**
   * Read the counter's picture, the interaction's markup: exactly one `img` and nothing else, with
   * every attribute {@link faceAttributes} names (an item carries exactly these, which its audit
   * holds; a host may add its own, as plate marks a picture not yet loaded), its
   * `data-qti-suppress-tts` `computer-read-aloud`, and a whole-number `width` equal to its
   * `height`, from {@link faceSides}'s least to its greatest; anything else refuses the item.
   *
   * @param dom The element the host hands the PCI, holding the markup.
   * @returns The picture, its address and its side.
   */
  const faceOf = (dom: HTMLElement) => {
    const elements = [...dom.children];
    const [img] = elements;
    const text = [...dom.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== "",
    );

    if (elements.length !== 1 || text || !(img instanceof HTMLImageElement)) {
      return refuse(
        "its qti-interaction-markup is not exactly one img, the counter's picture, and nothing else.",
      );
    }

    const missing = [...faceAttributes].filter((name) => !img.hasAttribute(name));

    if (missing.length > 0) {
      return refuse(
        `the counter's picture has ${missing.map((name) => `no ${name}`).join(", ")}: it carries src, alt, width, height and data-qti-suppress-tts.`,
      );
    }

    const width = img.getAttribute("width") ?? "";
    const side = Number(width);

    if (img.dataset["qtiSuppressTts"] !== "computer-read-aloud") {
      return refuse(
        `the counter's picture's data-qti-suppress-tts is "${img.dataset["qtiSuppressTts"] ?? ""}", not computer-read-aloud.`,
      );
    }

    if (
      !/^[1-9][0-9]*$/u.test(width) ||
      img.getAttribute("height") !== width ||
      side < faceSides.least ||
      side > faceSides.greatest
    ) {
      return refuse(
        `the counter's picture is ${width} by ${img.getAttribute("height") ?? ""}, not square with a whole-number side from ${String(faceSides.least)} to ${String(faceSides.greatest)}.`,
      );
    }

    const src = img.getAttribute("src") ?? "";

    if (src.trim() === "") {
      return refuse("the counter's picture has an empty src.");
    }

    return { img, side, src };
  };

  /**
   * Lay out counters in a zone's inside as a centred wrap: rows of
   * {@link perRow}, each row centred across, the rows centred top to bottom.
   *
   * @param count The counters.
   * @param inside The zone's inside.
   * @returns Each counter's centre, in reading order.
   */
  const rows = (count: number, inside: Inside): readonly Point[] => {
    const first =
      inside.top +
      (inside.height - (Math.ceil(count / perRow) * pitch - gap)) / 2 +
      counterSide / 2;

    return Array.from({ length: count }, (_, at) => {
      const row = Math.floor(at / perRow);
      const inRow = Math.min(perRow, count - row * perRow);
      const across = inside.left + (inside.width - (inRow * pitch - gap)) / 2 + counterSide / 2;

      return { x: across + (at % perRow) * pitch, y: first + row * pitch };
    });
  };

  /**
   * Make an SVG element with its attributes.
   *
   * @param name The element's local name.
   * @param attributes Its attributes.
   * @returns The element.
   */
  const svg = <K extends keyof SVGElementTagNameMap>(
    name: K,
    attributes: Readonly<Record<string, string | number>>,
  ): SVGElementTagNameMap[K] => {
    const made = document.createElementNS(svgNamespace, name);

    for (const [key, value] of Object.entries(attributes)) {
      made.setAttribute(key, String(value));
    }

    return made;
  };

  /**
   * Draw a counter centred on the origin: the counter's picture, at the counter's side.
   *
   * @param src The picture's address.
   * @returns The counter, to be placed by a transform.
   */
  const counterDrawing = (src: string): SVGElement =>
    svg("image", {
      "aria-hidden": "true",
      height: counterSide,
      href: src,
      width: counterSide,
      x: -counterSide / 2,
      y: -counterSide / 2,
    });

  /**
   * Render one counter tray into its `dom`, whose markup is the counter's picture, and give its PCI
   * object.
   *
   * @param dom The element the host hands the PCI, holding the markup.
   * @param configuration The configuration.
   * @returns The PCI object.
   */
  const render = (dom: HTMLElement, configuration: GivenConfiguration): CounterTray => {
    const { mat, supply } = settingsOf(configuration.properties);
    const tenFrame = mat === "double-ten-frame";

    const face = faceOf(dom);

    // The markup's picture is what every counter shows, never a counter of its own.
    face.img.remove();

    /**
     * How far a press travels on the screen, in CSS pixels, before it is no tap: half a counter as
     * the picture's size draws it. It is measured on the screen, not on the board, since a finger
     * drifts as far whatever the board's scale; nearer, the press taps, so a finger that drifts
     * while it taps still taps. The other zone stands an arrow's length and two gaps (192 board
     * units, nearly two counters) past any counter's own zone, so no drag that could move a counter
     * reads as a tap while the board is drawn at more than about a quarter of its size.
     */
    const tapTravel = face.side / 2;

    const width = tenFrame ? tenFrameWidth : openWidth;
    const supplyRows = Math.ceil(supply / perRow);
    const matHeight = tenFrame
      ? tenFrameHeight
      : Math.max(openHeight, supplyRows * pitch - gap + 2 * inset);
    const trayZoneHeight = Math.max(trayHeight, supplyRows * pitch - gap + 2 * inset);
    const matTop = border / 2;
    const arrowTop = matTop + matHeight + gap;
    const trayTop = arrowTop + arrowLength + gap;
    const trayLeft = (width - openWidth) / 2;
    const height = trayTop + trayZoneHeight + border / 2;

    const frameWidth = frameColumns * cell;
    const framesLeft = (width - (2 * frameWidth + frameGap)) / 2;
    const framesTop = matTop + (matHeight - frameRows * cell) / 2;
    const cells: readonly Point[] = Array.from({ length: tenFrameCells }, (_, at) => ({
      x:
        framesLeft +
        Math.floor(at / frameCells) * (frameWidth + frameGap) +
        ((at % frameColumns) + 0.5) * cell,
      y: framesTop + (Math.floor((at % frameCells) / frameColumns) + 0.5) * cell,
    }));
    const matInside: Inside = {
      height: matHeight - 2 * inset,
      left: inset,
      top: matTop + inset,
      width: openWidth - 2 * inset,
    };
    const trayInside: Inside = {
      height: trayZoneHeight - 2 * inset,
      left: trayLeft + inset,
      top: trayTop + inset,
      width: openWidth - 2 * inset,
    };

    /**
     * Where the counters of a zone stand when it holds some: the mat's in its first cells or its
     * rows, the tray's in its rows.
     */
    const standing: Record<Zone, (count: number) => readonly Point[]> = {
      mat: tenFrame ? (count) => cells.slice(0, count) : (count) => rows(count, matInside),
      tray: (count) => rows(count, trayInside),
    };

    let placed = boundCount(configuration.boundTo[configuration.responseIdentifier], supply);

    /**
     * The counters each zone holds now: the count on the mat, the rest of the supply in the tray.
     */
    const countIn: Readonly<Record<Zone, () => number>> = {
      mat: () => placed,
      tray: () => supply - placed,
    };

    /**
     * What moving a counter out of each zone does to the count on the mat.
     */
    const leaving: Readonly<Record<Zone, number>> = { mat: -1, tray: 1 };

    /**
     * Each zone's accessible names: its background's, and each of its counters'.
     */
    const named: Readonly<Record<Zone, { readonly counter: string; readonly zone: string }>> = {
      mat: { counter: "a counter on the mat", zone: "the mat" },
      tray: { counter: "a counter in the tray", zone: "the tray" },
    };

    /**
     * Each zone's outline: the mat's dark, the tray's faint.
     */
    const zoneStroke: Readonly<Record<Zone, string>> = { mat: outline, tray: faint };

    const board = svg("svg", {
      "data-board": "",
      role: "group",
      viewBox: `0 0 ${String(width)} ${String(height)}`,
    });
    const style = document.createElement("style");

    style.textContent = [
      `[data-board] { display: block; width: 100%; max-width: ${String((width * face.side) / counterSide)}px; height: auto; touch-action: none; user-select: none; -webkit-user-select: none; }`,
      "[data-board] [data-slot] { cursor: grab; }",
      "[data-board] [data-zone] { cursor: pointer; }",
      `[data-board] :focus { outline: none; } [data-board] :focus-visible { outline: 3px solid ${chosen}; outline-offset: 2px; }`,
      "[data-board] [data-dragged] { cursor: grabbing; }",
    ].join("\n");

    /**
     * A zone's background, a button: the mat's open rectangle, or its frame around the ten frames,
     * and the tray's faint rectangle.
     *
     * @param zone The zone.
     * @param left Its left edge.
     * @param top Its top edge.
     * @param zoneWidth Its width.
     * @param zoneHeight Its height.
     * @returns The background.
     */
    const zoneOf = (
      zone: Zone,
      left: number,
      top: number,
      zoneWidth: number,
      zoneHeight: number,
    ): SVGElement =>
      svg("rect", {
        "aria-label": named[zone].zone,
        "data-zone": zone,
        fill: "#fff",
        height: zoneHeight,
        role: "button",
        rx: radius,
        stroke: zoneStroke[zone],
        "stroke-width": border,
        tabindex: 0,
        width: zoneWidth,
        x: left,
        y: top,
      });

    const matZone = zoneOf("mat", border / 2, matTop, width - border, matHeight);
    const trayZone = zoneOf(
      "tray",
      trayLeft + border / 2,
      trayTop,
      openWidth - border,
      trayZoneHeight,
    );
    const frames = svg("g", { "aria-hidden": "true", "pointer-events": "none" });

    if (tenFrame) {
      for (let frame = 0; frame < frameCount; frame += 1) {
        const left = framesLeft + frame * (frameWidth + frameGap);

        frames.append(
          svg("rect", {
            fill: "#fff",
            height: frameRows * cell,
            stroke: outline,
            "stroke-width": 9,
            width: frameWidth,
            x: left,
            y: framesTop,
          }),
          svg("path", {
            d: [
              ...Array.from({ length: frameColumns - 1 }, (_, at) => at + 1).map(
                (line) =>
                  `M${String(left + line * cell)} ${String(framesTop)}v${String(frameRows * cell)}`,
              ),
              ...Array.from({ length: frameRows - 1 }, (_, at) => at + 1).map(
                (line) =>
                  `M${String(left)} ${String(framesTop + line * cell)}h${String(frameWidth)}`,
              ),
            ].join(""),
            fill: "none",
            stroke: outline,
            "stroke-width": 5,
          }),
        );
      }
    }

    const arrowX = width / 2;
    const arrow = svg("g", { "aria-hidden": "true", "pointer-events": "none" });

    arrow.append(
      svg("path", {
        d: `M${String(arrowX)} ${String(arrowTop + arrowLength - 10)}V${String(arrowTop + 34)}`,
        fill: "none",
        stroke: chosen,
        "stroke-dasharray": "22 16",
        "stroke-linecap": "round",
        "stroke-width": 10,
      }),
      svg("path", {
        d: `M${String(arrowX - 26)} ${String(arrowTop + 44)}L${String(arrowX)} ${String(arrowTop + 6)}L${String(arrowX + 26)} ${String(arrowTop + 44)}Z`,
        fill: chosen,
      }),
    );

    /**
     * One counter of a zone: a button holding the counter's drawing and the ring that shows it
     * chosen, shown while the zone holds more counters than its index.
     *
     * @param zone The zone.
     * @param slot Its index among the zone's counters.
     * @returns The counter, placed when drawn.
     */
    const counterOf = (zone: Zone, slot: number): SVGElement => {
      const side = counterSide;
      const made = svg("g", {
        "aria-label": named[zone].counter,
        "aria-pressed": "false",
        "data-slot": slot,
        "data-zone-of": zone,
        display: "none",
        role: "button",
        tabindex: 0,
      });

      made.append(
        svg("circle", {
          cx: 0,
          cy: 0,
          "data-ring": "",
          fill: "none",
          "pointer-events": "none",
          r: side / 2 + 7,
          stroke: chosen,
          "stroke-width": 10,
          visibility: "hidden",
        }),
        counterDrawing(face.src),
      );

      return made;
    };

    const counters: Readonly<Record<Zone, readonly SVGElement[]>> = {
      mat: Array.from({ length: supply }, (_, slot) => counterOf("mat", slot)),
      tray: Array.from({ length: supply }, (_, slot) => counterOf("tray", slot)),
    };
    const ghost = svg("g", {
      "aria-hidden": "true",
      "pointer-events": "none",
      visibility: "hidden",
    });

    ghost.append(counterDrawing(face.src));
    board.append(matZone, frames, trayZone, arrow, ...counters.mat, ...counters.tray, ghost);
    dom.append(style, board);

    /**
     * The tray's input, aborted once the host completes the PCI, which removes every listener.
     */
    const listening = new AbortController();
    const { signal } = listening;
    let choice: Place | undefined;

    /**
     * The response: the counters on the mat, a single integer in the Appendix C binding, and NULL
     * for an empty mat, which is the tray as it starts.
     *
     * @returns The response.
     */
    const response = (): PciJson => (placed === 0 ? { base: null } : { base: { integer: placed } });

    /**
     * Draw the count: each zone's first counters standing where its layout puts that many, the rest
     * hidden, and the ring on the chosen one.
     */
    const draw = (): void => {
      const chosenCounter = choice === undefined ? undefined : counters[choice.zone][choice.slot];

      for (const zone of zones) {
        const at = standing[zone](countIn[zone]());

        for (const [slot, counter] of counters[zone].entries()) {
          const point = at[slot];
          const isChosen = counter === chosenCounter;

          if (point === undefined) {
            counter.setAttribute("display", "none");
          } else {
            counter.setAttribute("display", "inline");
            counter.setAttribute("transform", `translate(${String(point.x)} ${String(point.y)})`);
          }

          counter.setAttribute("aria-pressed", String(isChosen));
          counter
            .querySelector("[data-ring]")
            ?.setAttribute("visibility", isChosen ? "inherit" : "hidden");
        }
      }
    };

    /**
     * The press under way: the button pressed, a counter or a zone's background, the pointer, where
     * it went down on the screen, and whether it has travelled far enough not to be a tap, which
     * makes a press on a counter a drag.
     */
    let press:
      | {
          readonly pointer: number;
          readonly pressed: Pressed;
          readonly start: { readonly x: number; readonly y: number };
          travelled: boolean;
        }
      | undefined;

    /**
     * End the press under way: show a dragged counter again and hide the one that followed the
     * pointer.
     */
    const endPress = (): void => {
      if (press !== undefined && press.pressed.kind === "counter") {
        press.pressed.element.removeAttribute("visibility");
        delete press.pressed.element.dataset["dragged"];
        ghost.setAttribute("visibility", "hidden");
      }

      press = undefined;
    };

    const instance: CounterTray = {
      getResponse: response,
      getState: response,
      oncompleted: () => {
        listening.abort();
        endPress();
        choice = undefined;
        draw();
      },
    };

    /**
     * Move a counter from a zone to the other, and tell the host. The zone holds the counter moved,
     * which stands on the screen, so the count stays between none and the supply.
     *
     * @param from The zone it leaves.
     */
    const move = (from: Zone): void => {
      placed += leaving[from];
      choice = undefined;
      draw();
      dom.dispatchEvent(
        new CustomEvent("qti-interaction-changed", {
          bubbles: true,
          detail: {
            interaction: instance,
            responseIdentifier: configuration.responseIdentifier,
            value: response(),
          },
        }),
      );
    };

    /**
     * Act on a tap of a counter: choose it, or let it go when it is the one chosen; and when the
     * chosen counter stands in the other zone, the tap is a tap on this zone, which takes it.
     *
     * @param tapped The tapped counter's place.
     */
    const tapCounter = (tapped: Place): void => {
      if (choice !== undefined && choice.zone !== tapped.zone) {
        move(choice.zone);

        return;
      }

      choice =
        choice !== undefined && choice.zone === tapped.zone && choice.slot === tapped.slot
          ? undefined
          : tapped;
      draw();
    };

    /**
     * Act on a tap of a zone: it takes the chosen counter from the other zone; a tap on the chosen
     * counter's own zone lets it go.
     *
     * @param zone The tapped zone.
     */
    const tapZone = (zone: Zone): void => {
      if (choice !== undefined && choice.zone !== zone) {
        move(choice.zone);

        return;
      }

      choice = undefined;
      draw();
    };

    /**
     * Read the counter an element stands in.
     *
     * @param target The element.
     * @returns Its place, none for an element in no counter.
     */
    const placeOf = (target: EventTarget | null): Place | undefined => {
      const counter = target instanceof SVGElement ? target.closest("[data-slot]") : null;
      const zone = counter instanceof SVGElement ? zoneNamed(counter.dataset["zoneOf"]) : undefined;

      return counter instanceof SVGElement && zone !== undefined
        ? { slot: Number(counter.dataset["slot"]), zone }
        : undefined;
    };

    /**
     * Read the zone an element's background stands for.
     *
     * @param target The element.
     * @returns The zone, none for an element that is no zone's background.
     */
    const zoneAt = (target: EventTarget | null): Zone | undefined =>
      target instanceof SVGElement ? zoneNamed(target.dataset["zone"]) : undefined;

    /**
     * Read the button an element stands in, as a press starts on it.
     *
     * @param target The element.
     * @returns The counter or the zone's background, none for an element in neither.
     */
    const pressedAt = (target: EventTarget | null): Pressed | undefined => {
      const place = placeOf(target);
      const element = place === undefined ? undefined : counters[place.zone][place.slot];

      if (place !== undefined && element !== undefined) {
        return { element, kind: "counter", place };
      }

      const zone = zoneAt(target);

      return zone === undefined ? undefined : { kind: "zone", zone };
    };

    /**
     * Map a pointer's client position into the board's coordinates.
     *
     * @param event The pointer event.
     * @returns The position on the board.
     */
    const boardPoint = (event: PointerEvent): DOMPoint =>
      new DOMPoint(event.clientX, event.clientY).matrixTransform(board.getScreenCTM()?.inverse());

    /**
     * Tell whether a pointer stands farther than {@link tapTravel} from where the press under way
     * went down, on the screen.
     *
     * @param event The pointer event.
     * @returns Whether it is past a tap's drift.
     */
    const pastTap = (event: PointerEvent): boolean =>
      press !== undefined &&
      Math.hypot(event.clientX - press.start.x, event.clientY - press.start.y) > tapTravel;

    /**
     * Read the zone under a pointer as a tap reads its target: the topmost element at the pointer's
     * position, a counter's zone or a zone's background, none over anything else. The counter
     * dragged is hidden and the one that follows the pointer takes no pointer, so neither stands
     * in the way.
     *
     * @param event The pointer event.
     * @returns The zone, none outside both.
     */
    const zoneUnder = (event: PointerEvent): Zone | undefined => {
      const under = document.elementFromPoint(event.clientX, event.clientY);

      return placeOf(under)?.zone ?? zoneAt(under);
    };

    board.addEventListener(
      "pointerdown",
      (event: PointerEvent) => {
        const pressed = pressedAt(event.target);

        if (
          pressed === undefined ||
          event.button !== 0 ||
          (press !== undefined && event.pointerId !== press.pointer)
        ) {
          return;
        }

        // The press under way's own pointer pressing again proves its release was lost: that press
        // ends with no gesture, and this one begins.
        if (press !== undefined) {
          endPress();
        }

        event.preventDefault();
        board.setPointerCapture(event.pointerId);
        press = {
          pointer: event.pointerId,
          pressed,
          start: { x: event.clientX, y: event.clientY },
          travelled: false,
        };
      },
      { signal },
    );

    board.addEventListener(
      "pointermove",
      (event: PointerEvent) => {
        if (press === undefined || event.pointerId !== press.pointer) {
          return;
        }

        // A press's pointer moving with no button held has lost its release (taken by something
        // outside the page before the pointer first moved, when the board's capture had not yet
        // begun): the press ends with no gesture.
        if (event.buttons === 0) {
          endPress();

          return;
        }

        if (!press.travelled && !pastTap(event)) {
          return;
        }

        const at = boardPoint(event);

        press.travelled = true;

        if (press.pressed.kind === "counter") {
          press.pressed.element.setAttribute("visibility", "hidden");
          press.pressed.element.dataset["dragged"] = "";
          ghost.setAttribute("transform", `translate(${String(at.x)} ${String(at.y)})`);
          ghost.setAttribute("visibility", "visible");
        }
      },
      { signal },
    );

    board.addEventListener(
      "pointerup",
      (event: PointerEvent) => {
        if (press === undefined || event.pointerId !== press.pointer) {
          return;
        }

        const { pressed } = press;
        const travelled = press.travelled || pastTap(event);
        const over = zoneUnder(event);

        endPress();

        if (pressed.kind === "zone") {
          if (!travelled) {
            tapZone(pressed.zone);
          }
        } else if (!travelled) {
          tapCounter(pressed.place);
        } else if (over !== undefined && over !== pressed.place.zone) {
          move(pressed.place.zone);
        } else {
          choice = undefined;
          draw();
        }
      },
      { signal },
    );

    // A press ends with no gesture when its pointer is cancelled or loses the board's capture (a
    // context menu among the causes): its pointer's release may never reach the board, so a press
    // left standing would take the next release as its own and hold off every other input.
    const endUnseen = (event: PointerEvent): void => {
      if (press !== undefined && event.pointerId === press.pointer) {
        endPress();
      }
    };

    board.addEventListener("pointercancel", endUnseen, { signal });
    board.addEventListener("lostpointercapture", endUnseen, { signal });

    // No context menu takes a press's release from the board.
    board.addEventListener(
      "contextmenu",
      (event: MouseEvent) => {
        event.preventDefault();
      },
      { signal },
    );

    board.addEventListener(
      "keydown",
      (event: KeyboardEvent) => {
        if (press !== undefined || event.repeat || (event.key !== "Enter" && event.key !== " ")) {
          return;
        }

        const place = placeOf(event.target);
        const zone = zoneAt(event.target);

        if (place !== undefined) {
          event.preventDefault();
          tapCounter(place);
        } else if (zone !== undefined) {
          event.preventDefault();
          tapZone(zone);
        }
      },
      { signal },
    );

    draw();
    configuration.onready(instance, response());

    return instance;
  };

  context.register({
    getInstance: (dom, configuration) => render(dom, configuration),
    typeIdentifier: "urn:fdc:alpha.school:2026:count-placements",
  });
});
