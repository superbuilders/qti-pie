/**
 * Base-ten blocks, `urn:fdc:alpha.school:2026:build-with-blocks`: the Portable Custom Interaction
 * (Q-16) in which a child builds a number from flats, rods and cubes, as the K–2 mastery forms'
 * interaction specification states it (section 3, "Build a number with base-ten blocks, scored by
 * kind"). This file is, with types, the AMD module script a content package carries at
 * `modules/build-with-blocks.js`, which an item names by QTI 3.0.1's own module resolution: the
 * PCI's `module` attribute and a `qti-interaction-module` whose `primary-path` is
 * `modules/build-with-blocks`. Plate's frame host loads it like any PCI's module and chooses its
 * factory by the item's `custom-interaction-type-identifier`, which it registers.
 *
 * What the child sees and does:
 *
 * - **Two mats, side by side.** The tray on the left holds the item's supply, the count of each kind
 *   its properties give (`data-supply-rods="9" data-supply-cubes="12"`, or with
 *   `data-supply-flats="5"` too); the mat on the right starts empty. Both mats are drawn for the
 *   whole supply, so neither changes size, and every piece is drawn to one scale: ten cubes in a
 *   line match a rod, and ten rods side by side match a flat.
 * - **Moving a piece, tap then tap.** A piece is dragged onto the other mat, or tapped, which chooses
 *   it, and then the other mat tapped, anywhere on it, its pieces included: a piece goes onto the
 *   mat that way and back to the tray the same way, never by a single tap (the owner's ruling,
 *   2026-11-25: tap-then-tap for placing and returning). A chosen piece is ringed; tapping a piece
 *   in its own mat chooses that piece instead, tapping it again keeps it chosen, and a tap on its
 *   own mat's floor or beside the mats lets it go. Enter or Space on a focused piece or mat is a
 *   tap, and Escape lets the chosen piece go. A press that travels is a drag wherever it began:
 *   from a piece it carries the piece, and from a mat's floor or beside the mats it moves nothing,
 *   so a missed grab is never read as a tap where it began. The drawing takes every touch itself
 *   (`touch-action: none` on the `svg`, where the browser reads it), so a finger drags a piece and
 *   never pans or swipes the page, and one press is open at a time.
 * - **A double tap is one tap.** A tap moves a piece only when one is chosen and the tap lands on the
 *   other mat, and the move lets it go; and the tap after a move that lands on the same mat, the
 *   second tap of a double tap, does nothing at all (the hand, {@link Hand}, has just set a piece
 *   down there). So a double tap never moves two pieces, nor chooses a piece on the mat it set one
 *   down on, whose next tap on the other mat would carry it off again. The price is one tap: right
 *   after a tap puts a piece on a mat, a piece there is chosen by the second tap on it, never the
 *   first, as when a child takes a piece back and then picks another from the tray. A swallowed tap
 *   changes nothing and the child taps again, where a tap read as a double tap's second could move
 *   a piece the child never meant to move.
 * - **A lost release is no move.** A drag whose release the frame never hears (the pointer let go
 *   outside the frame, the window left) moves nothing: the piece stays where it lay.
 * - **Tidy groups, fixed slots.** Pieces sit in slots by kind, never where they were dropped: flats
 *   in rows of the square root of their supply rounded up, rods in rows of ten, cubes in rows of
 *   five, the rods and cubes beside each other on one floor under the flats. Each mat has a slot
 *   for every piece of its kind's supply, numbered from the bottom row's left end, rows filling
 *   upwards as pieces rest on a floor; a piece arriving takes the lowest free slot, and a piece
 *   leaving leaves its slot free, so no piece moves but the one the child moved.
 * - **Nothing counts.** No numeral, count or word is drawn, and the mat looks the same whether the
 *   number is reached or not. The pieces and mats have names for a screen reader alone ("rod in the
 *   tray", "mat"), none with a count.
 *
 * The response is an `ordered` list of integers, the count on the mat of each kind the supply
 * offers, in descending place value: `[rods, cubes]` (`[3, 8]`) or `[flats, rods, cubes]`
 * (`[1, 5, 3]`), in the Appendix C binding `{ list: { integer: [...] } }`. An empty mat is NULL,
 * `{ list: null }`, the same as a mat never touched, so a number built and taken apart again is no
 * answer. The supply bounds every count, so a number made of cubes alone past the supply
 * (`[0, 38]`) cannot be posted, and the item's `match_correct`, run in the database, compares the
 * lists member by member in order, so the standard decomposition is the one right answer.
 *
 * Its properties are the element's `data-*` attributes, one a kind of piece the supply offers:
 * `data-supply-rods` and `data-supply-cubes`, each required, each a whole number from 1 to 19, and
 * `data-supply-flats`, present exactly when flats are offered, a whole number from 1 to 9, each
 * written in decimal digits without a sign or a leading zero. The two `data-*` attributes the QTI
 * 3.0.1 ASI schema declares on the element, `data-catalog-idref` and `data-qti-suppress-tts`, are
 * the delivery system's, passed over. Any other property, or a count that is no such number, is no
 * interaction.
 *
 * The PCI is bound to the response its host holds (`boundTo`), or to `state` when a host gives one:
 * both are the response's own JSON, so a child who comes back finds as many pieces of each kind on
 * the mat as they left there, in its first slots (the count is the response; where a piece lay is
 * not). Properties outside that contract, or a bound value the PCI could not have posted (one past
 * the supply, or every count zero, which it posts as NULL), are no interaction: `getInstance`
 * returns none, the frame host reports the PCI failed, and a broken item is seen, never shown
 * wrong.
 *
 * **Why a script.** This file is the module file with types (`#plate/alpha/pci-modules.ts` says
 * why): it runs in the PCI's sandboxed frame, which loads none of plate's modules or styles, so it
 * imports no value and exports nothing, its one statement is the AMD `define` the frame's loader
 * runs, and every helper is inside the factory, which reaches nothing but the frame's globals and
 * the context its `define` hands it.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 */
import type { PciJson } from "#plate/pci/json.ts";
import type { BoundConfiguration } from "#plate/ui/portable-custom/protocol.ts";

/**
 * A kind of base-ten piece, by the name the supply gives it.
 */
type Kind = "cubes" | "flats" | "rods";

/**
 * Where a piece lies: in the tray, or on the mat.
 */
type Place = "mat" | "tray";

/**
 * One piece of the supply: its kind and the group that draws it, which keeps its identity, and so
 * its focus, wherever it moves.
 */
interface Piece {
  readonly element: SVGGElement;
  readonly kind: Kind;
}

/**
 * A point in the drawing's own units.
 */
interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * A kind's block of slots in a mat, in cubes from the mat's inner corner: its top left corner, the
 * slots in a row, its rows, and its whole width and height.
 */
interface Slots {
  readonly columns: number;
  readonly height: number;
  readonly rows: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

/**
 * What a press began on: a piece, one of the two mats, or nothing of the interaction's.
 */
type Target =
  | { readonly kind: "beside" }
  | { readonly kind: "piece"; readonly piece: Piece }
  | { readonly kind: "place"; readonly place: Place };

/**
 * What the child's hand holds between taps: nothing; a chosen piece, ringed, which the next tap on
 * the other mat moves there; or nothing, having just set a piece down on a mat by a tap, so the
 * next tap there is that gesture's second tap, a double tap's, which does nothing but empty the
 * hand.
 */
type Hand =
  | { readonly kind: "chosen"; readonly piece: Piece }
  | { readonly kind: "empty" }
  | { readonly kind: "set-down"; readonly place: Place };

/**
 * A press in progress: its pointer, what it began on, where on screen it began, whether it has
 * become a drag, and the offset from the pressed piece's corner to the pointer.
 */
interface Press {
  readonly id: number;
  readonly grab: Point;
  readonly start: Point;
  readonly target: Target;
  dragging: boolean;
}

/**
 * The PCI object `getInstance` returns, as the PCI contract names its members.
 */
interface Interaction {
  readonly checkValidity: () => boolean;
  readonly getCustomValidity: () => string;
  readonly getResponse: () => PciJson;
  readonly getState: () => PciJson;
  readonly oncompleted: () => void;
  readonly setStatus: (status: string) => void;
}

/**
 * The configuration the frame's bridge hands `getInstance`: the island's, with the bridge's own
 * `onready` and `ondone`.
 */
interface Configuration extends BoundConfiguration {
  readonly ondone: (
    interaction: Interaction,
    response: PciJson,
    state: PciJson,
    status: string,
  ) => void;
  readonly onready: (interaction: Interaction, state: PciJson) => void;
}

/**
 * The `qtiCustomInteractionContext` the module's `define` is handed: `register` takes the factory.
 */
interface InteractionContext {
  readonly register: (factory: {
    readonly getInstance: (
      dom: HTMLElement,
      configuration: Configuration,
      state: unknown,
    ) => Interaction | undefined;
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
  factory: (context: InteractionContext) => void,
): void;

define(["qtiCustomInteractionContext"], (context) => {
  "use strict";
  const svgNamespace = "http://www.w3.org/2000/svg";
  /**
   * The kinds, in place order, the order a response lists their counts in.
   */
  const kinds: readonly Kind[] = ["flats", "rods", "cubes"];
  /**
   * The places, the tray first: the order the mats stand in, left to right.
   */
  const places: readonly Place[] = ["tray", "mat"];
  /**
   * Each kind's size in cubes, the step from one slot to the next across and down, and its slots
   * in a row given its supply.
   */
  const extents = {
    cubes: {
      across: 2,
      columns: (count: number) => Math.min(count, 5),
      down: 2,
      height: 1,
      width: 1,
    },
    flats: {
      across: 11,
      columns: (count: number) => Math.ceil(Math.sqrt(count)),
      down: 11,
      height: 10,
      width: 10,
    },
    rods: {
      across: 2,
      columns: (count: number) => Math.min(count, 10),
      down: 11,
      height: 10,
      width: 1,
    },
  } as const;
  /**
   * The name a screen reader gives each kind, and each place.
   */
  const names = { cubes: "cube", flats: "flat", mat: "mat", rods: "rod", tray: "tray" } as const;
  /**
   * The viewBox units a cube's side takes, so the outlines' widths read as pixels at that size.
   */
  const unit = 20;
  /**
   * The most CSS pixels a cube's side takes, however wide the frame is.
   */
  const largestCube = 24;
  /**
   * The cubes between a mat's edge and its pieces, between the two mats, between the rods and the
   * cubes, and between the flats and the band of rods and cubes below them.
   */
  const spacing = { band: 1.5, between: 2, mat: 1.5 } as const;
  /**
   * The colours: the blocks' blue and their outline (drawing guide, rule 8), the mats' surface and
   * edges, and the ring of a chosen piece and of the mat it can go to.
   */
  const colours = {
    block: "#4aa3df",
    chosen: "#1d6fd1",
    mat: "#333333",
    outline: "#333333",
    surface: "#ffffff",
    tray: "#bbbbbb",
  } as const;
  /**
   * How far, in CSS pixels, a press moves before it is a drag rather than a tap.
   */
  const dragDistance = 8;
  /**
   * The frame's own styles: no margin round the drawing, the ring of a chosen or focused piece and
   * of the mat a piece can go to, and the piece a drag lifted.
   */
  const styles = `
    body { margin: 0; }
    svg { display: block; width: 100%; height: auto; user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent; touch-action: none; }
    [data-piece] { cursor: grab; outline: none; }
    [data-ring] { fill: transparent; stroke: none; }
    [data-piece][aria-pressed="true"] [data-ring] { stroke: ${colours.chosen}; stroke-width: 4; }
    [data-piece]:focus-visible [data-ring] { stroke: ${colours.chosen}; stroke-width: 3; stroke-dasharray: 6 4; }
    [data-piece][data-lifted] { opacity: 0.35; }
    [data-place] { cursor: pointer; outline: none; }
    [data-place]:focus-visible { stroke-dasharray: 10 6; }
    [data-place][data-ready] { stroke: ${colours.chosen}; stroke-width: 6; }
    [aria-disabled="true"] [data-piece], [aria-disabled="true"] [data-place] { cursor: default; }
  `;

  /**
   * Report whether a value is a JSON object whose members can be read.
   *
   * @param value The value.
   * @returns Whether it is.
   */
  const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  /**
   * The `data-*` attributes the QTI 3.0.1 ASI schema declares on a portable custom interaction
   * (`data-catalog-idref`, `data-qti-suppress-tts`, of `BasePromptInteractionDType`), by the name
   * HTML's `dataset` gives each: the delivery system's, never this module's, so passed over.
   */
  const qtiOwn: ReadonlySet<string> = new Set(["catalogIdref", "qtiSuppressTts"]);

  /**
   * Each kind's property, by the name HTML's `dataset` gives its `data-*` attribute, with the most
   * pieces of that kind a supply may offer, and whether every supply offers it.
   */
  const supplied: Readonly<
    Record<Kind, { readonly most: number; readonly name: string; readonly required: boolean }>
  > = {
    cubes: { most: 19, name: "supplyCubes", required: true },
    flats: { most: 9, name: "supplyFlats", required: false },
    rods: { most: 19, name: "supplyRods", required: true },
  };

  /**
   * Read the item's supply from its properties, by the name HTML's `dataset` gives each `data-*`
   * attribute: `supplyRods` and `supplyCubes`, each required, from 1 to 19, and `supplyFlats` when
   * flats are offered, from 1 to 9, each in decimal digits without a sign or a leading zero, and no
   * property beside them but QTI's own.
   *
   * @param properties The element's `data-*` attributes, by dataset name.
   * @returns Each kind the properties offer with its count, in place order; none when a property is
   *   neither a kind's nor QTI's own, when a required kind is missing, or when a count is no such
   *   number.
   */
  const supplyOf = (
    properties: Readonly<Record<string, string>>,
  ): ReadonlyMap<Kind, number> | undefined => {
    const given = Object.keys(properties).filter((name) => !qtiOwn.has(name));
    const supply = new Map(
      kinds.flatMap((kind) => {
        const { most, name } = supplied[kind];
        const written = properties[name];

        return written !== undefined && /^[1-9]\d?$/u.test(written) && Number(written) <= most
          ? [[kind, Number(written)] as const]
          : [];
      }),
    );
    const complete = kinds.every((kind) => supply.has(kind) || !supplied[kind].required);

    return complete && supply.size === given.length ? supply : undefined;
  };

  /**
   * Read the counts on the mat from a response's Appendix C JSON, as plate reads an `ordered`
   * integer response (`#plate/pci/json.ts`, J4 and J6): nothing bound, a `list` of `null` or an
   * empty `integer` list is NULL, an empty mat; a list of integers is the count of each kind of the
   * supply, in place order, none past its kind's supply, and not every one zero, since the PCI
   * posts an empty mat as NULL. Any other JSON, a NULL form of another cardinality among it, is a
   * value the PCI could not have posted: none.
   *
   * @param bound The JSON, as the host binds the response or gives the state.
   * @param supply The supply.
   * @returns The count on the mat of each kind of the supply; none when the JSON is no such value.
   */
  const placedOf = (
    bound: unknown,
    supply: ReadonlyMap<Kind, number>,
  ): ReadonlyMap<Kind, number> | undefined => {
    const empty = new Map([...supply.keys()].map((kind) => [kind, 0] as const));

    if (bound === undefined) {
      return empty;
    }

    if (!isRecord(bound)) {
      return undefined;
    }

    const list = Object.keys(bound).length === 1 ? bound["list"] : undefined;

    if (list === null) {
      return empty;
    }

    const members = isRecord(list) && Object.keys(list).length === 1 ? list["integer"] : undefined;
    const counts: readonly unknown[] = Array.isArray(members) ? members : [];

    if (Array.isArray(members) && counts.length === 0) {
      return empty;
    }

    const placed = new Map(
      [...supply].flatMap(([kind, most], index) => {
        const count = counts[index];

        return Number.isSafeInteger(count) && Number(count) >= 0 && Number(count) <= most
          ? [[kind, Number(count)] as const]
          : [];
      }),
    );

    return counts.length === supply.size &&
      placed.size === supply.size &&
      [...placed.values()].some((count) => count > 0)
      ? placed
      : undefined;
  };

  /**
   * Build one instance into its `dom`.
   *
   * @param dom The element the PCI is handed.
   * @param configuration Its configuration.
   * @param state The state the host gives, if any.
   * @returns The PCI object; none when the supply or the bound response does not decode.
   */
  const instanceOf = (
    dom: HTMLElement,
    configuration: Configuration,
    state: unknown,
  ): Interaction | undefined => {
    const supply = supplyOf(configuration.properties);
    const placed =
      supply === undefined
        ? undefined
        : placedOf(state ?? configuration.boundTo[configuration.responseIdentifier], supply);

    if (supply === undefined || placed === undefined) {
      return undefined;
    }

    const page = dom.ownerDocument;
    const present = [...supply.keys()];

    /**
     * Give a kind's supply.
     *
     * @param kind The kind.
     * @returns Its count, 0 for a kind the supply does not name.
     */
    const countOf = (kind: Kind): number => supply.get(kind) ?? 0;

    /**
     * Lay out a kind's block of slots for its whole supply, at a corner.
     *
     * @param kind The kind.
     * @param x The block's left edge, in cubes.
     * @param bottom The block's bottom edge, in cubes.
     * @returns The block.
     */
    const slotsOf = (kind: Kind, x: number, bottom: number): Slots => {
      const extent = extents[kind];
      const columns = extent.columns(countOf(kind));
      const rows = columns === 0 ? 0 : Math.ceil(countOf(kind) / columns);
      const height = rows === 0 ? 0 : (rows - 1) * extent.down + extent.height;
      const width = columns === 0 ? 0 : (columns - 1) * extent.across + extent.width;

      return { columns, height, rows, width, x, y: bottom - height };
    };

    const measured = {
      cubes: slotsOf("cubes", 0, 0),
      flats: slotsOf("flats", 0, 0),
      rods: slotsOf("rods", 0, 0),
    } as const;
    const rodsGap = measured.rods.width === 0 || measured.cubes.width === 0 ? 0 : spacing.between;
    const bottom =
      (measured.flats.height === 0 ? 0 : measured.flats.height + spacing.band) +
      Math.max(measured.rods.height, measured.cubes.height);
    const blocks: Readonly<Record<Kind, Slots>> = {
      cubes: slotsOf("cubes", measured.rods.width + rodsGap, bottom),
      flats: slotsOf("flats", 0, measured.flats.height),
      rods: slotsOf("rods", 0, bottom),
    };
    const matWidth =
      Math.max(measured.flats.width, measured.rods.width + rodsGap + measured.cubes.width) +
      2 * spacing.mat;
    const matHeight = bottom + 2 * spacing.mat;
    const corners: Readonly<Record<Place, number>> = { mat: matWidth + spacing.between, tray: 0 };
    const wholeWidth = 2 * matWidth + spacing.between;
    let { status } = configuration;
    let hand: Hand = { kind: "empty" };
    let press: Press | undefined;

    /**
     * Make an SVG element with its attributes, appended to its parent.
     *
     * @param name The element's name.
     * @param attributes Its attributes.
     * @param parent Its parent.
     * @returns The element.
     */
    const svgElement = <K extends keyof SVGElementTagNameMap>(
      name: K,
      attributes: Readonly<Record<string, number | string>>,
      parent: Element,
    ): SVGElementTagNameMap[K] => {
      const made = page.createElementNS(svgNamespace, name);

      for (const [key, value] of Object.entries(attributes)) {
        made.setAttribute(key, String(value));
      }

      parent.append(made);

      return made;
    };

    /**
     * Draw a piece of a kind at the origin: its body and the lines between its cubes.
     *
     * @param kind The kind.
     * @param parent The group it is drawn in.
     */
    const drawPiece = (kind: Kind, parent: Element): void => {
      const extent = extents[kind];

      svgElement(
        "rect",
        {
          fill: colours.block,
          height: extent.height * unit,
          stroke: colours.outline,
          "stroke-width": 2,
          width: extent.width * unit,
        },
        parent,
      );

      for (let line = 1; line < extent.height; line += 1) {
        svgElement(
          "line",
          {
            stroke: colours.outline,
            "stroke-width": kind === "flats" ? 1 : 1.5,
            x1: 0,
            x2: extent.width * unit,
            y1: line * unit,
            y2: line * unit,
          },
          parent,
        );
      }

      for (let line = 1; line < extent.width; line += 1) {
        svgElement(
          "line",
          {
            stroke: colours.outline,
            "stroke-width": 1,
            x1: line * unit,
            x2: line * unit,
            y1: 0,
            y2: extent.height * unit,
          },
          parent,
        );
      }
    };

    const style = page.createElement("style");

    style.textContent = styles;
    page.head.append(style);
    dom.replaceChildren();

    const svg = svgElement(
      "svg",
      {
        role: "group",
        viewBox: [-unit / 4, -unit / 4, (wholeWidth + 0.5) * unit, (matHeight + 0.5) * unit].join(
          " ",
        ),
      },
      dom,
    );

    svg.style.maxWidth = `${String((wholeWidth + 0.5) * largestCube)}px`;

    const mats: Readonly<Record<Place, SVGRectElement>> = {
      mat: svgElement(
        "rect",
        {
          "aria-label": names.mat,
          "data-place": "mat",
          fill: colours.surface,
          height: matHeight * unit,
          role: "button",
          rx: unit,
          stroke: colours.mat,
          "stroke-width": 3,
          tabindex: 0,
          width: matWidth * unit,
          x: corners.mat * unit,
          y: 0,
        },
        svg,
      ),
      tray: svgElement(
        "rect",
        {
          "aria-label": names.tray,
          "data-place": "tray",
          fill: colours.surface,
          height: matHeight * unit,
          role: "button",
          rx: unit,
          stroke: colours.tray,
          "stroke-width": 3,
          tabindex: 0,
          width: matWidth * unit,
          x: 0,
          y: 0,
        },
        svg,
      ),
    };
    /**
     * Each piece of the supply, by the group that draws it.
     */
    const owners = new Map<Element, Piece>();
    /**
     * Give a place's slots for a kind, one for every piece of its supply, every one free.
     *
     * @param kind The kind.
     * @returns The slots.
     */
    const freeSlots = (kind: Kind): (Piece | null)[] =>
      Array.from({ length: countOf(kind) }, (): Piece | null => null);
    /**
     * Each kind's slots in each place, each holding its piece or null, free: a slot for every piece
     * of the kind's supply in either place, so the place a piece goes to always has a free one. The
     * first `placed` pieces of each kind start in the mat's first slots, the rest in the tray's.
     */
    const slots: Readonly<Record<Kind, Readonly<Record<Place, (Piece | null)[]>>>> = {
      cubes: { mat: freeSlots("cubes"), tray: freeSlots("cubes") },
      flats: { mat: freeSlots("flats"), tray: freeSlots("flats") },
      rods: { mat: freeSlots("rods"), tray: freeSlots("rods") },
    };

    for (const kind of present) {
      const extent = extents[kind];
      const onMat = placed.get(kind) ?? 0;

      for (let index = 0; index < countOf(kind); index += 1) {
        const element = svgElement(
          "g",
          { "data-kind": kind, "data-piece": "", role: "button" },
          svg,
        );
        const piece = { element, kind };

        svgElement(
          "rect",
          {
            "data-ring": "",
            height: (extent.height + 1) * unit,
            rx: unit / 3,
            width: (extent.width + 1) * unit,
            x: -unit / 2,
            y: -unit / 2,
          },
          element,
        );
        drawPiece(kind, element);
        owners.set(element, piece);
        if (index < onMat) {
          slots[kind].mat[index] = piece;
        } else {
          slots[kind].tray[index - onMat] = piece;
        }
      }
    }

    const overlay = svgElement("g", { "aria-hidden": "true", "pointer-events": "none" }, svg);

    /**
     * Give where a piece lies now.
     *
     * @param piece The piece.
     * @returns Its place.
     */
    const placeOf = (piece: Piece): Place =>
      slots[piece.kind].mat.includes(piece) ? "mat" : "tray";

    /**
     * Report whether the child may move pieces now.
     *
     * @returns Whether the PCI is interacting.
     */
    const interacting = (): boolean => status === "interacting";

    /**
     * Put one place's pieces of a kind in their slots, with their names, focus and chosen state.
     *
     * @param kind The kind.
     * @param place The place.
     */
    const settle = (kind: Kind, place: Place): void => {
      const extent = extents[kind];
      const block = blocks[kind];

      for (const [slot, piece] of slots[kind][place].entries()) {
        if (piece === null) {
          continue;
        }

        const x = corners[place] + spacing.mat + block.x + (slot % block.columns) * extent.across;
        const y =
          spacing.mat + block.y + (block.rows - 1 - Math.floor(slot / block.columns)) * extent.down;

        piece.element.setAttribute(
          "transform",
          `translate(${String(x * unit)} ${String(y * unit)})`,
        );
        piece.element.setAttribute(
          "aria-label",
          `${names[kind]} ${place === "tray" ? "in the tray" : "on the mat"}`,
        );
        piece.element.setAttribute("tabindex", interacting() ? "0" : "-1");
        piece.element.setAttribute(
          "aria-pressed",
          String(hand.kind === "chosen" && piece === hand.piece),
        );
      }
    };

    /**
     * Put every piece in its slot, and mark the mat the chosen or dragged piece can go to.
     */
    const layout = (): void => {
      for (const kind of present) {
        settle(kind, "tray");
        settle(kind, "mat");
      }

      const chosen = hand.kind === "chosen" ? hand.piece : undefined;
      const moving =
        press?.dragging === true && press.target.kind === "piece" ? press.target.piece : chosen;
      const from = moving === undefined ? undefined : placeOf(moving);

      for (const place of places) {
        mats[place].toggleAttribute("data-ready", from !== undefined && from !== place);
      }

      svg.setAttribute("aria-disabled", String(!interacting()));
    };

    /**
     * Give the response: the count on the mat of each kind the supply offers, in place order, as an
     * ordered list of integers, or NULL for an empty mat.
     *
     * @returns The response in the Appendix C binding.
     */
    const response = (): PciJson => {
      const counts = present.map(
        (kind) => slots[kind].mat.filter((piece) => piece !== null).length,
      );

      return counts.every((count) => count === 0) ? { list: null } : { list: { integer: counts } };
    };

    /**
     * End a press: drop the dragged piece's copy, and set the lifted piece down.
     */
    const release = (): void => {
      overlay.replaceChildren();

      for (const piece of owners.values()) {
        delete piece.element.dataset["lifted"];
      }

      press = undefined;
    };

    const interaction: Interaction = {
      checkValidity: () => true,
      getCustomValidity: () => "",
      getResponse: response,
      getState: response,
      oncompleted: () => {
        status = "closed";
        hand = { kind: "empty" };
        release();
        layout();
        configuration.ondone(interaction, response(), response(), "closed");
      },
      setStatus: (next) => {
        status = next;
        hand = { kind: "empty" };
        release();
        layout();
      },
    };

    /**
     * Move a piece to a place, into the lowest slot free there, its own slot left free, leave the
     * hand as the move leaves it, and tell the host when the response changed, by the PCI
     * contract's event on the `dom`.
     *
     * @param piece The piece.
     * @param place Where it goes.
     * @param after The hand after the move: empty after a drag, set down on the place after a tap.
     */
    const move = (piece: Piece, place: Place, after: Hand): void => {
      const from = placeOf(piece);
      const held = slots[piece.kind];

      hand = after;

      if (from !== place) {
        held[from][held[from].indexOf(piece)] = null;
        held[place][held[place].indexOf(null)] = piece;
      }

      layout();

      if (from !== place) {
        dom.dispatchEvent(
          new CustomEvent("qti-interaction-changed", {
            bubbles: true,
            detail: { interaction, responseIdentifier: configuration.responseIdentifier },
          }),
        );
      }
    };

    /**
     * Give the mat a tap on a target lands on: a piece's place, or the mat tapped.
     *
     * @param target What was tapped.
     * @returns The place; none beside the mats.
     */
    const placeTapped = (target: Target): Place | undefined => {
      if (target.kind === "piece") {
        return placeOf(target.piece);
      }

      return target.kind === "place" ? target.place : undefined;
    };

    /**
     * Do what a tap on a target does, tap then tap: with a piece chosen, a tap on the other mat, on
     * its floor or on a piece lying on it, moves the chosen piece there and leaves the hand set
     * down on that mat; with the hand set down on a mat, the next tap there, a double tap's second,
     * only empties it; otherwise a tap on a piece chooses it (the chosen piece tapped again stays
     * chosen), and a tap on a mat's floor or beside the mats empties the hand.
     *
     * @param target What was tapped.
     */
    const tap = (target: Target): void => {
      const into = placeTapped(target);

      if (hand.kind === "chosen" && into !== undefined && into !== placeOf(hand.piece)) {
        move(hand.piece, into, { kind: "set-down", place: into });
      } else {
        hand =
          target.kind === "piece" && !(hand.kind === "set-down" && hand.place === into)
            ? { kind: "chosen", piece: target.piece }
            : { kind: "empty" };
        layout();
      }
    };

    /**
     * Give up a press whose end the frame never heard, or that the browser cancelled: the piece a
     * drag lifted stays where it lay, so the mats show what the response says.
     */
    const abandon = (): void => {
      release();
      layout();
    };

    /**
     * Read what an event's target is part of.
     *
     * @param node The event's target.
     * @returns The piece or mat it is in, or beside them.
     */
    const targetOf = (node: EventTarget | null): Target => {
      const element = node instanceof Element ? node : undefined;
      const piece = owners.get(element?.closest("[data-piece]") ?? svg);
      const place = element?.closest("[data-place]");

      if (piece !== undefined) {
        return { kind: "piece", piece };
      }

      if (place === mats.mat || place === mats.tray) {
        return { kind: "place", place: place === mats.mat ? "mat" : "tray" };
      }

      return { kind: "beside" };
    };

    /**
     * Turn a pointer's position into the drawing's units.
     *
     * @param event The pointer event.
     * @returns The point; the origin while the drawing has no screen matrix.
     */
    const pointOf = (event: PointerEvent): Point => {
      const matrix = svg.getScreenCTM();

      return matrix === null
        ? { x: 0, y: 0 }
        : new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    };

    /**
     * Report whether a point in the drawing's units lies on the mat.
     *
     * @param point The point.
     * @returns Whether it does.
     */
    const onTheMat = (point: Point): boolean =>
      point.x >= corners.mat * unit &&
      point.x <= (corners.mat + matWidth) * unit &&
      point.y >= 0 &&
      point.y <= matHeight * unit;

    /**
     * Begin a press with the primary button or a finger: one press at a time, so a press still open
     * (a mouse drag when a finger lands) ends first, as a press whose end the frame never heard.
     *
     * @param event The pointer event.
     */
    const pressDown = (event: PointerEvent): void => {
      if (!interacting() || !event.isPrimary || event.button !== 0) {
        return;
      }

      if (press !== undefined) {
        abandon();
      }

      const target = targetOf(event.target);
      const point = pointOf(event);
      const corner =
        target.kind === "piece"
          ? target.piece.element.transform.baseVal.consolidate()?.matrix
          : undefined;

      press = {
        dragging: false,
        grab: { x: point.x - (corner?.e ?? point.x), y: point.y - (corner?.f ?? point.y) },
        id: event.pointerId,
        start: { x: event.clientX, y: event.clientY },
        target,
      };

      svg.setPointerCapture(event.pointerId);

      if (target.kind === "piece") {
        event.preventDefault();
      }
    };

    /**
     * Carry a press. With no button held, the press ended where the frame could not hear it,
     * outside the frame or in another window, so it is abandoned. A press that travels is a drag
     * wherever it began, never a tap: one that began on a piece lifts it, and one that began on a
     * mat's floor or beside the mats moves nothing.
     *
     * @param event The pointer event.
     */
    const pressMove = (event: PointerEvent): void => {
      if (press?.id !== event.pointerId) {
        return;
      }

      if (event.buttons === 0) {
        abandon();

        return;
      }

      const point = pointOf(event);
      const away = Math.hypot(event.clientX - press.start.x, event.clientY - press.start.y);

      if (!press.dragging && away >= dragDistance) {
        press.dragging = true;

        if (press.target.kind === "piece") {
          hand = { kind: "empty" };
          drawPiece(press.target.piece.kind, svgElement("g", {}, overlay));
          press.target.piece.element.dataset["lifted"] = "";
          layout();
        }
      }

      overlay.firstElementChild?.setAttribute(
        "transform",
        `translate(${String(point.x - press.grab.x)} ${String(point.y - press.grab.y)})`,
      );
    };

    /**
     * Abandon a press whose capture was lost before its release was heard, as when the pointer lets
     * go outside the frame. A release the frame hears ends the press first, so its own loss of
     * capture finds none.
     *
     * @param event The pointer event.
     */
    const captureLost = (event: PointerEvent): void => {
      if (press?.id === event.pointerId) {
        abandon();
      }
    };

    svg.addEventListener("pointerdown", pressDown);
    svg.addEventListener("pointermove", pressMove);
    svg.addEventListener("pointerup", (event) => {
      if (press?.id !== event.pointerId) {
        return;
      }

      const { dragging, target } = press;
      const dropped = onTheMat(pointOf(event)) ? "mat" : "tray";

      release();

      if (!dragging) {
        tap(target);
      } else if (target.kind === "piece") {
        move(target.piece, dropped, { kind: "empty" });
      }
    });

    svg.addEventListener("pointercancel", (event) => {
      if (press?.id === event.pointerId) {
        abandon();
      }
    });

    svg.addEventListener("lostpointercapture", captureLost);

    page.defaultView?.addEventListener("blur", () => {
      if (press !== undefined) {
        abandon();
      }
    });

    svg.addEventListener("keydown", (event) => {
      if (!interacting()) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        tap(targetOf(event.target));
      } else if (event.key === "Escape") {
        hand = { kind: "empty" };
        layout();
      }
    });

    layout();
    configuration.onready(interaction, response());

    return interaction;
  };

  context.register({
    getInstance: instanceOf,
    typeIdentifier: "urn:fdc:alpha.school:2026:build-with-blocks",
  });
});
