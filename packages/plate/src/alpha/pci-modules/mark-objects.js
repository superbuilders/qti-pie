/**
 * Mark objects by tapping to ring them (`urn:fdc:alpha.school:2026:mark-objects`): the Portable
 * Custom Interaction (Q-16) of the Kindergarten mastery gates' mark items, as the assessment lead
 * specifies it (her interaction specification for marking objects, and her drawing guide's rules
 * for a set of objects and for the ring), written as the AMD module a content package carries and
 * the frame host loads by QTI 3.0.1's own module resolution: the item names it with its `module`
 * attribute and lists it in `qti-interaction-modules`, and the package holds its module file at the
 * path it names (`modules/mark-objects.js`).
 *
 * - **The screen.** `data-objects` identical objects, each a copy of the markup's one `img` (the
 *   picture of one object, its `alt` the object's name), drawn at the picture's `width` and
 *   `height` (44 to 120 CSS pixels) in the middle of a square cell 1.25 times its side, the cell
 *   its whole tap target and a quarter of a side between neighbouring pictures, laid out as
 *   `data-layout` says: `rows` of `data-per-row` (at most 10), the last row the rest, its cells
 *   under the columns above (one row is `data-per-row` equal to `data-objects`), from 1 to 20
 *   objects; or `scatter`, the PCI's own arrangement for the count, from 1 to 10 objects: placed by
 *   the golden angle from the middle outwards (Vogel's sunflower), so the set reads as scattered,
 *   its objects evenly spread and no two centres closer than 1.6 pictures' sides, the same picture
 *   for the same count every time. The set is scaled down to the width its frame gives it, never
 *   up, and never below a 44-pixel picture; no object moves to another row. Nothing else is drawn:
 *   the set replaces the markup, whose picture is all the frame shows before the module has run.
 * - **The interaction.** A tap on an object (or Space or Enter on the focused one) draws a ring
 *   around it, a circle that stays wholly inside the object's cell; a tap on a ringed object takes
 *   the ring away. Keyboard focus is a dashed square, never a circle or a fill. Any object can be
 *   ringed, and any number of them. No count is ever shown, no object is numbered, and nothing is
 *   crossed out, struck through or dragged.
 * - **The response.** The number of objects ringed, the Appendix C JSON `{ base: { integer: n } }`,
 *   for the `single` `integer` declaration `match_correct` scores. With no object ringed, whether
 *   never tapped or every ring taken away, the response is NULL, `{ base: null }`: an interaction
 *   left untouched sends no answer (owner's ruling Q6), and a set with nothing ringed is the same
 *   screen. `match_correct` scores NULL 0, as it would the integer 0; the specification's "as an
 *   integer" taken literally would send 0, which is the assessment lead's question to answer.
 * - **Coming back.** The PCI rings exactly the objects of the state it is handed, the JSON text its
 *   `getState` gives (`{"ringed":[…]}`, the places ascending, none twice; handed back, in any
 *   order), and they count as the child's rings. Handed none, or one it cannot use (no such text, a
 *   place outside the set or named twice), it rings as many objects as the response it is bound to
 *   (`boundTo`) counts, the first of the set by place, and none for anything but a count from 1 to
 *   the set's: the count comes back, but the rings stand on the first objects, which need not be
 *   the ones the child ringed (in a scatter, the innermost). A saved state or response never stops
 *   the PCI. Only a host that keeps the PCI's `getState` and hands it back restores the very
 *   objects.
 *
 * An object's place is its index in the order the PCI makes the objects, from 0: reading order in
 * rows, and in a scatter from the middle outwards, which is no reading order.
 *
 * The PCI's look is one stylesheet it writes into its frame's document, keyed on its own
 * `data-part` parts, the scattered objects' places among its rules: the frame is a document of
 * its own, which no stylesheet of the host's reaches.
 *
 * These three properties are the PCI's whole contract: any other `data-*` property the item writes
 * is refused when the PCI is made, so nothing else can ride along on an item, but for the ones QTI
 * 3.0.1's schema itself declares on the element (`data-catalog-idref`, `data-qti-suppress-tts`),
 * which are the delivery engine's and which the PCI passes over. A property it reads that is
 * absent, malformed or written for another layout is refused when the PCI is made.
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
 */
                                                                          

/**
 * The configuration the frame's bridge hands a PCI's `getInstance`: the page's, with the response's
 * bound value under its identifier, and the bridge's own `onready`.
 */
                                                                  
                                                      
     
                                                                            
     
                                                                              
 

/**
 * The Appendix C JSON of the response: the number of objects ringed, NULL for none.
 */
                          
                           
                                                    

/**
 * The PCI object `getInstance` returns: the two readers the host calls, and `oncompleted`, which
 * the host calls before the PCI's markup goes.
 */
                               
                                                  
     
                                                                                                    
                                                                              
     
                                  
                                   
 

/**
 * The factory the module registers with the bridge.
 */
                              
                         
                     
                                            
                   
                           
                                  
 

/**
 * The `qtiCustomInteractionContext` bridge, as this module uses it.
 */
                      
                                                           
 

/**
 * Where the objects stand: in rows of `perRow`, or scattered.
 */
                                                                                                

/**
 * One object's centre in a scattered set, in CSS pixels from the set's box's start.
 */
                  
                     
                     
 

/**
 * The picture of one object as the markup sizes it: its `width` and `height`, in CSS pixels.
 */
                   
                          
                         
 

/**
 * A scattered set as the PCI places it: each object's centre by its place, and the width and height
 * of the box that holds them, in CSS pixels.
 */
                     
                                      
                          
                         
 

/**
 * AMD's `define` as the frame's loader gives it to a module's script
 * (`#plate/ui/portable-custom/frame-boot.ts`): the module is anonymous, named by the route that
 * loads it, and its one dependency is the bridge.
 *
 * @param dependencies The module's dependencies, by id.
 * @param factory What the loader calls with them.
 */
                        
                                                         
                                                             
        

define(["qtiCustomInteractionContext"], (qtiCustomInteractionContext) => {
  "use strict";

  /**
   * The type identifier the factory serves, its items' `custom-interaction-type-identifier`.
   */
  const typeIdentifier = "urn:fdc:alpha.school:2026:mark-objects";

  /**
   * The ring's colour: a strong blue that stands out on white and on the pictures, so a ringed
   * object reads at a glance.
   *
   * @formatConstant
   */
  const ringColour = "#1d6fd1";

  /**
   * The picture's side on screen, in CSS pixels: the least a kindergartner's finger finds (the set
   * is never scaled below it), and the range the markup's `width` and `height` are written in.
   *
   * @formatConstant
   */
  const pictureSide = { largest: 120, least: 44 };

  /**
   * An object's cell, its tap target, as a multiple of the picture's side: a square that leaves
   * a quarter of a side between neighbouring pictures, so none touches, and holds the object's
   * ring whole.
   *
   * @formatConstant
   */
  const cell = 1.25;

  /**
   * The ring, as shares of the picture's larger side: a circle centred on the object, its radius
   * past the picture's half-side so it stands around the object, its stroke thick; its outer edge,
   * 0.61 sides from the centre, stays inside the cell's half-side of 0.625, and its inner edge,
   * 0.51 sides out, clears a picture drawn within its middle 0.98, so neighbouring rings never
   * touch.
   *
   * @formatConstant
   */
  const ring = { radius: 0.56, stroke: 0.1 };

  /**
   * The keyboard focus: a dashed square around the cell, inside it, in the outline colour; never a
   * circle or a fill, so the ring alone marks an object.
   *
   * @formatConstant
   */
  const focus = { colour: "#333", width: 2 };

  /**
   * A scattered set: the turn between one object and the next, the golden angle (π(3 − √5)
   * radians), and the least distance between two objects' centres, in pictures' sides, more than a
   * cell's side, so that no two cells, nor their rings, touch.
   *
   * @formatConstant
   */
  const scatter = { apart: 1.6, turn: Math.PI * (3 - Math.sqrt(5)) };

  /**
   * The most objects a set holds, twenty in rows and ten scattered (a scattered count a
   * kindergartner counts goes to ten), and the most a row holds, ten, so that the widest set fits a
   * tablet's width at the least tap target.
   *
   * @formatConstant
   */
  const most = { perRow: 10, rows: 20, scatter: 10 };

  /**
   * A count or a row length as a property writes it: a whole number from 1, no leading zero.
   */
  const counting = /^[1-9][0-9]*$/u;

  /**
   * The namespace the ring is drawn in.
   */
  const svgNamespace = "http://www.w3.org/2000/svg";

  /**
   * The item's configuration of the PCI refused: a property it reads is absent, malformed or
   * written for another layout, or the markup holds no one picture to repeat. `getInstance`
   * throwing is the PCI contract's one failure: the frame's boot reports the PCI `failed`, with
   * the message as its reason where the browser shares the module script's errors with the frame
   * (a frame of opaque origin sees a cross-origin script's error as "Script error.").
   */
  class MarkObjectsRefusedError extends Error {
                      name = "MarkObjectsRefusedError";
  }

  /**
   * The properties the PCI reads, by dataset name: its whole contract.
   *
   * @formatConstant
   */
  const contract = new Set(["layout", "objects", "perRow"]);

  /**
   * The `data-*` attributes QTI 3.0.1's schema declares on `qti-portable-custom-interaction`, by
   * dataset name: the delivery engine's, never the PCI's, so it passes them over.
   *
   * @formatConstant
   */
  const qtiOwn = new Set(["catalogIdref", "qtiSuppressTts"]);

  /**
   * Write a property's dataset name as the attribute an item writes, `perRow` as `data-per-row`.
   *
   * @param name The dataset name.
   * @returns The attribute's name.
   */
  const attributeOf = (name        )         =>
    ["data", ...name.split(/(?=[A-Z])/u)].join("-").toLowerCase();

  /**
   * Refuse the configuration: throw {@link MarkObjectsRefusedError}, its message the PCI's name,
   * what in the configuration breaks the rule, and the repair.
   *
   * @param detail What breaks the rule, and the repair.
   * @returns Never.
   * @throws {MarkObjectsRefusedError} Always.
   */
  const refuse = (detail        )        => {
    throw new MarkObjectsRefusedError(
      `The mark-objects PCI (${typeIdentifier}) cannot run: ${detail}`,
    );
  };

  /**
   * Read a property that writes a whole number.
   *
   * @param properties The PCI's properties.
   * @param name The property's dataset name.
   * @param form The form it must take: {@link counting} or {@link whole}.
   * @returns The number.
   * @throws {MarkObjectsRefusedError} When the property is absent or not of that form.
   */
  const numberOf = (
    properties                                  ,
    name        ,
    form        ,
  )         => {
    const written = properties[name];

    return written !== undefined && form.test(written)
      ? Number(written)
      : refuse(
          `its property ${attributeOf(name)} is ${written === undefined ? "absent" : `"${written}"`}; write it as a whole number${form === counting ? " from 1" : ""} with no leading zero.`,
        );
  };

  /**
   * Refuse a property written for another layout than the one the item names.
   *
   * @param properties The PCI's properties.
   * @param names The properties the layout does not read.
   * @param kind The layout.
   * @throws {MarkObjectsRefusedError} When one of them is written.
   */
  const refuseOthers = (
    properties                                  ,
    names                   ,
    kind        ,
  )       => {
    const written = names.find((name) => properties[name] !== undefined);

    if (written !== undefined) {
      refuse(
        `its property ${attributeOf(written)} belongs to another layout than ${kind}; remove it.`,
      );
    }
  };

  /**
   * Read the layout from the properties: `layout`, with `perRow` for rows and not for a scatter,
   * and the count within the layout's most.
   *
   * @param properties The PCI's properties.
   * @param count The objects.
   * @returns The layout.
   * @throws {MarkObjectsRefusedError} When the layout is unknown, its properties do not fit it, or
   *   it holds too many objects.
   */
  const layoutOf = (properties                                  , count        )         => {
    const kind = properties["layout"];

    if (kind !== "rows" && kind !== "scatter") {
      return refuse(
        `its property data-layout is ${kind === undefined ? "absent" : `"${kind}"`}; write rows or scatter.`,
      );
    }

    if (count > most[kind]) {
      refuse(
        `its property data-objects is ${String(count)}, more than the ${String(most[kind])} a set laid out as ${kind} holds.`,
      );
    }

    if (kind === "scatter") {
      refuseOthers(properties, ["perRow"], kind);

      return { kind };
    }

    const perRow = numberOf(properties, "perRow", counting);

    if (perRow > most.perRow) {
      refuse(
        `its property data-per-row is ${String(perRow)}, more than the ${String(most.perRow)} a row holds.`,
      );
    }

    return perRow <= count
      ? { kind, perRow }
      : refuse(
          `its property data-per-row is ${String(perRow)}, more than its ${String(count)} objects; one row is data-per-row equal to data-objects.`,
        );
  };

  /**
   * The least of some numbers, `Infinity` for none, as `Math.min` gives it.
   *
   * @param values The numbers.
   * @returns The least.
   */
  const least = (values                   )         => {
    let low = Number.POSITIVE_INFINITY;

    for (const value of values) {
      low = Math.min(low, value);
    }

    return low;
  };

  /**
   * The greatest of some numbers, `-Infinity` for none, as `Math.max` gives it.
   *
   * @param values The numbers.
   * @returns The greatest.
   */
  const greatest = (values                   )         => {
    let high = Number.NEGATIVE_INFINITY;

    for (const value of values) {
      high = Math.max(high, value);
    }

    return high;
  };

  /**
   * Place a scattered set: each object turned the golden angle from the one before, at a distance
   * from the middle growing as the square root of its place (Vogel's sunflower), so the set is
   * evenly spread with no rows or columns to follow; then the whole scaled so that the two closest
   * centres stand `scatter.apart` sides apart, and moved so that every object lies in the set's
   * box.
   *
   * @param count The objects.
   * @param side The picture's larger side.
   * @returns Each object's centre by its place, and the box's width and height.
   */
  const scattered = (count        , side        )            => {
    const unit = Array.from({ length: count }, (_unused, place) => {
      const distance = Math.sqrt((place + 0.5) / count);

      return {
        x: distance * Math.cos(place * scatter.turn),
        y: distance * Math.sin(place * scatter.turn),
      };
    });
    const closest = least(
      unit.flatMap((one, place) =>
        unit.slice(place + 1).map((other) => Math.hypot(one.x - other.x, one.y - other.y)),
      ),
    );
    const scale = Number.isFinite(closest) ? (scatter.apart * side) / closest : 0;
    const xs = unit.map((centre) => centre.x * scale);
    const ys = unit.map((centre) => centre.y * scale);
    const half = (side * cell) / 2;
    const left = least(xs) - half;
    const top = least(ys) - half;

    return {
      centres: xs.map((x, place) => ({ x: x - left, y: (ys[place] ?? 0) - top })),
      height: greatest(ys) + half - top,
      width: greatest(xs) + half - left,
    };
  };

  /**
   * The state as `getState` writes it: the JSON text `{"ringed":[…]}`, compact, its places whole
   * numbers written without a leading zero.
   */
  const stateText = /^\{"ringed":\[(?:(?:0|[1-9][0-9]*)(?:,(?:0|[1-9][0-9]*))*)?\]\}$/u;

  /**
   * Read the objects ringed from the state the PCI is handed, the JSON text `getState` gives, its
   * places in any order: none when it is no such text, names a place outside the set, or names one
   * twice, so a saved state never stops the PCI.
   *
   * @param state The state, as the host hands it.
   * @param count The objects.
   * @returns The objects ringed, `undefined` for a state the PCI cannot use.
   */
  const ringedOfState = (state         , count        )                                => {
    if (typeof state !== "string" || !stateText.test(state)) {
      return undefined;
    }

    const listed = state.slice('{"ringed":['.length, -"]}".length);
    const ringed = listed === "" ? [] : listed.split(",").map(Number);

    return new Set(ringed).size === ringed.length && ringed.every((place) => place < count)
      ? ringed
      : undefined;
  };

  /**
   * Read the objects ringed from the response the PCI is bound to: as many as its count, the first
   * by place (in a scatter, the innermost); none for no value, NULL, or anything but a count from 1
   * to the set's, so a saved response never stops the PCI.
   *
   * @param bound The bound value, the Appendix C JSON of the response, `undefined` for none.
   * @param count The objects.
   * @returns The objects ringed.
   */
  const ringedOfBound = (bound         , count        )                    => {
    const base          =
      typeof bound === "object" && bound !== null && "base" in bound ? bound.base : undefined;
    const ringed          =
      typeof base === "object" && base !== null && "integer" in base ? base.integer : undefined;

    return typeof ringed === "number" && Number.isInteger(ringed) && ringed >= 1 && ringed <= count
      ? Array.from({ length: ringed }, (_unused, index) => index)
      : [];
  };

  /**
   * Give the picture's larger side, which the cell, the ring and the spacing are measured in.
   *
   * @param size The picture's size.
   * @returns The side, in CSS pixels.
   */
  const sideOf = (size         )         => Math.max(size.width, size.height);

  /**
   * Read the picture's size from its `width` and `height`, equal, each a whole number of CSS pixels
   * from 44 to 120, and its `alt`, the object's name. Any other attribute is the host's (one that
   * injects the markup may mark its pictures) and the PCI passes it over.
   *
   * @param shown The markup's `img`.
   * @returns Its size.
   * @throws {MarkObjectsRefusedError} When a size is absent, out of range or not square, or the alt
   *   is empty.
   */
  const pictureOf = (shown                  )          => {
    if ((shown.getAttribute("alt") ?? "").trim() === "") {
      refuse("its picture has no alt; name the object in it, which names each object's button.");
    }

    const size = (name                    )         => {
      const written = shown.getAttribute(name);
      const pixels = written !== null && counting.test(written) ? Number(written) : 0;

      return pixels >= pictureSide.least && pixels <= pictureSide.largest
        ? pixels
        : refuse(
            `its picture's ${name} is ${written === null ? "absent" : `"${written}"`}; write it as a whole number of CSS pixels from ${String(pictureSide.least)} to ${String(pictureSide.largest)}.`,
          );
    };
    const width = size("width");
    const height = size("height");

    return width === height
      ? { height, width }
      : refuse(
          `its picture is ${String(width)} by ${String(height)}; draw the object in a square picture.`,
        );
  };

  /**
   * Make one object's picture: a new `img` with the markup picture's `src`, `alt`, `width` and
   * `height`, and nothing else of it.
   *
   * @param document The frame's document.
   * @param shown The markup's `img`.
   * @returns The picture.
   */
  const objectPicture = (document          , shown                  )                   => {
    const drawn = document.createElement("img");

    for (const name of ["src", "alt", "width", "height"]) {
      drawn.setAttribute(name, shown.getAttribute(name) ?? "");
    }

    drawn.draggable = false;

    return drawn;
  };

  /**
   * Fit the set to the width its frame gives it: scaled down, never up, so that it is no wider
   * than the PCI's element, but never so far that a picture is less than its least side; and again
   * whenever that width changes.
   *
   * @param dom The PCI's element.
   * @param set The set.
   * @param side The picture's larger side.
   * @param natural The set's width at its own size, in CSS pixels.
   */
  const fit = (dom             , set             , side        , natural        )       => {
    const root = dom.ownerDocument.documentElement;
    let width = -1;

    /**
     * Scale the set to the width the frame gives it, its element's margins aside, once that width
     * has changed.
     */
    const scale = ()       => {
      const given = root.clientWidth - 2 * Math.max(0, dom.getBoundingClientRect().left);

      if (given === width) {
        return;
      }

      width = given;

      const zoom = Math.max(Math.min(1, given / natural), pictureSide.least / side);

      set.style.setProperty("zoom", String(zoom));
    };

    scale();
    new ResizeObserver(scale).observe(root);
  };

  /**
   * Write a scattered set's rules: its box, and each object's place in it.
   *
   * @param part The selector of one of the PCI's parts.
   * @param count The objects.
   * @param side The picture's larger side.
   * @returns The rules.
   */
  const placedScattered = (
    part                          ,
    count        ,
    side        ,
  )                    => {
    const { centres, height, width } = scattered(count, side);

    return [
      `${part("scatter")}{position:relative;inline-size:${String(width)}px;block-size:${String(height)}px}`,
      `${part("scatter")}>${part("object")}{position:absolute}`,
      ...centres.map(
        (centre, index) =>
          `${part("scatter")}>${part("object")}[data-place="${String(index)}"]{inset-inline-start:${String(centre.x - (side * cell) / 2)}px;inset-block-start:${String(centre.y - (side * cell) / 2)}px}`,
      ),
    ];
  };

  /**
   * Write the PCI's stylesheet into the frame's document, keyed on its `data-part` parts: the set,
   * which takes every touch that starts on it as the child's (`touch-action: none`), so a finger's
   * swipe never pans the page or takes the browser back, its rows of cells, each object a cell that
   * is its whole tap target and neither drags nor selects, its picture at its own size in the
   * middle, its ring over it taking no tap, its focus a dashed square, and for a scattered set its
   * box and each cell's place in it.
   *
   * @param document The frame's document.
   * @param count The objects.
   * @param layout The layout.
   * @param size The picture's width and height, in CSS pixels.
   */
  const style = (document          , count        , layout        , size         )       => {
    const sheet = document.createElement("style");
    const side = sideOf(size);
    const box = side * cell;
    const part = (name        )         => `[data-part="${name}"]`;
    const placed = layout.kind === "scatter" ? placedScattered(part, count, side) : [];

    sheet.textContent = [
      `${part("set")}{display:inline-flex;flex-direction:column;touch-action:none}`,
      `${part("row")}{display:flex}`,
      `${part("object")}{position:relative;flex:none;display:grid;place-items:center;inline-size:${String(box)}px;block-size:${String(box)}px;padding:0;border:0;margin:0;background:none;cursor:pointer;line-height:0;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}`,
      `${part("object")}>*{display:block;pointer-events:none;-webkit-user-drag:none}`,
      `${part("object")}>img{inline-size:${String(size.width)}px;block-size:${String(size.height)}px}`,
      `${part("object")}:focus{outline:none}`,
      `${part("object")}:focus-visible{outline:${String(focus.width)}px dashed ${focus.colour};outline-offset:${String(-focus.width)}px}`,
      `${part("object")}>${part("ring")}{position:absolute;inset:0;inline-size:100%;block-size:100%}`,
      ...placed,
    ].join("\n");
    document.head.append(sheet);
  };

  /**
   * Draw the ring for one object: the circle, unfilled, in the ring's colour, over the object.
   *
   * @param document The frame's document.
   * @param side The picture's larger side.
   * @returns The ring.
   */
  const ringOf = (document          , side        )                => {
    const drawn = document.createElementNS(svgNamespace, "svg");
    const circle = document.createElementNS(svgNamespace, "circle");
    const box = side * cell;

    drawn.setAttribute("viewBox", `0 0 ${String(box)} ${String(box)}`);
    drawn.dataset["part"] = "ring";
    drawn.setAttribute("aria-hidden", "true");
    circle.setAttribute("cx", String(box / 2));
    circle.setAttribute("cy", String(box / 2));
    circle.setAttribute("r", String(side * ring.radius));
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", ringColour);
    circle.setAttribute("stroke-width", String(side * ring.stroke));
    drawn.append(circle);

    return drawn;
  };

  /**
   * Lay the objects out in the set: each at its place in a scattered set's box, or in rows of the
   * row length.
   *
   * @param set The set's element.
   * @param objects The objects, by place.
   * @param layout The layout.
   */
  const lay = (set             , objects                              , layout        )       => {
    const { ownerDocument } = set;

    if (layout.kind === "scatter") {
      const box = ownerDocument.createElement("div");

      box.dataset["part"] = "scatter";

      for (const object of objects) {
        box.append(object);
      }

      set.append(box);

      return;
    }

    const { perRow } = layout;

    for (let start = 0; start < objects.length; start += perRow) {
      const row = ownerDocument.createElement("div");

      row.dataset["part"] = "row";

      for (const object of objects.slice(start, start + perRow)) {
        row.append(object);
      }

      set.append(row);
    }
  };

  /**
   * Render the PCI into its `dom`: the objects laid out, each a tap target that rings it or takes
   * its ring away, the rings it comes back with drawn, and the host told it is ready.
   *
   * @param dom The element the frame hands it, holding the markup and its one `img`.
   * @param configuration The configuration: the properties, the response identifier, the status,
   *   the bound response and `onready`.
   * @param state The state to restore, `undefined` (or `null`) for none.
   * @returns The PCI object.
   * @throws {MarkObjectsRefusedError} When the configuration does not fit the PCI.
   */
  const getInstance = (
    dom             ,
    configuration                          ,
    state         ,
  )                      => {
    const { properties, responseIdentifier } = configuration;
    const stray = Object.keys(properties).find((name) => !contract.has(name) && !qtiOwn.has(name));

    if (stray !== undefined) {
      refuse(
        `its property ${attributeOf(stray)} is none of the PCI's: it reads data-objects, data-layout and data-per-row alone; remove it.`,
      );
    }

    const count = numberOf(properties, "objects", counting);
    const layout = layoutOf(properties, count);
    const [picture, ...others] = dom.children;

    if (
      !(picture instanceof HTMLImageElement) ||
      others.length > 0 ||
      dom.textContent.trim() !== ""
    ) {
      return refuse(
        `its markup holds ${String(dom.children.length)} elements${dom.textContent.trim() === "" ? "" : " and text"}; give it exactly one img, the picture of one object.`,
      );
    }

    const size = pictureOf(picture);
    const document = dom.ownerDocument;
    const ringed = new Set(
      ringedOfState(state, count) ??
        ringedOfBound(configuration.boundTo[responseIdentifier], count),
    );
    const set = document.createElement("div");
    const objects = Array.from({ length: count }, (_unused, index) => {
      const object = document.createElement("button");

      object.type = "button";
      object.draggable = false;
      object.disabled = configuration.status !== "interacting";
      object.dataset["part"] = "object";
      object.dataset["place"] = String(index);
      object.append(objectPicture(document, picture));

      return object;
    });

    /**
     * Give the response: the number of objects ringed, NULL for none.
     *
     * @returns The Appendix C JSON.
     */
    const getResponse = ()                      =>
      ringed.size === 0 ? { base: null } : { base: { integer: ringed.size } };

    /**
     * Give the state: the objects ringed, ascending.
     *
     * @returns The state.
     */
    const getState = ()         =>
      JSON.stringify({ ringed: [...ringed].toSorted((left, right) => left - right) });

    const instance                      = {
      getResponse,
      getState,
      oncompleted: () => {
        for (const object of objects) {
          object.disabled = true;
        }
      },
    };

    /**
     * Show one object as ringed or not: its ring drawn or gone, and its pressed state.
     *
     * @param object The object's button.
     * @param index Its place.
     */
    const show = (object                   , index        )       => {
      const on = ringed.has(index);

      object.setAttribute("aria-pressed", String(on));
      object.querySelector(':scope > [data-part="ring"]')?.remove();

      if (on) {
        object.append(ringOf(document, sideOf(size)));
      }
    };

    /**
     * Ring an object, or take its ring away, and tell the host the response changed.
     *
     * @param object The object's button.
     * @param index Its place.
     */
    const toggle = (object                   , index        )       => {
      if (ringed.has(index)) {
        ringed.delete(index);
      } else {
        ringed.add(index);
      }

      show(object, index);
      dom.dispatchEvent(
        new CustomEvent("qti-interaction-changed", {
          bubbles: true,
          detail: { interaction: instance, responseIdentifier, value: getResponse() },
        }),
      );
    };

    for (const [index, object] of objects.entries()) {
      object.addEventListener("click", () => {
        toggle(object, index);
      });
      show(object, index);
    }

    style(document, count, layout, size);
    set.dataset["part"] = "set";
    lay(set, objects, layout);
    dom.replaceChildren(set);
    fit(
      dom,
      set,
      sideOf(size),
      layout.kind === "rows"
        ? Math.min(layout.perRow, count) * sideOf(size) * cell
        : scattered(count, sideOf(size)).width,
    );
    configuration.onready(instance, getState());

    return instance;
  };

  qtiCustomInteractionContext.register({ getInstance, typeIdentifier });
});
