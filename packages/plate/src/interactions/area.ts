/**
 * An area of a graphic interaction's image, as the four kinds whose areas are drawn on an image
 * read it (Hotspot, Graphic Gap Match, Graphic Order and Graphic Associate): its coordinates and
 * its name, each by one rule. A `qti-hotspot-choice` and a `qti-associable-hotspot` are empty
 * elements, so an area's name is an attribute of its own or nothing.
 *
 * @module
 * @see https://www.w3.org/TR/accname-1.2/#comp_label
 */
import { Option, pipe } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import type { ReaderKit } from "#plate/interactions/contract.ts";
import { message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import { carriesRendererClass } from "#plate/vocabulary.ts";

/**
 * One coordinate of an area's `coords`, as written: its number, and whether it was written with
 * `%`, a percentage of the image (QTI 3.0 information model 7.9, Coords).
 */
export interface AreaCoordinate {
  readonly percent: boolean;
  readonly value: number;
}

/**
 * The two directions of the arrow an area's author asks the page to draw beside it, by plate's
 * classes `plate-arrow-up` and `plate-arrow-down` (`rendererClasses` in `#plate/vocabulary.ts`),
 * which metis's converter writes on the `qti-associable-hotspot` an AlphaTest drop zone becomes,
 * where AlphaTest's player drew an arrow above the zone pointing up, or below it pointing down
 * (mastery-track-player 941a86a, `GapMatchInteraction.tsx` 434 and 457). It lays nothing out and
 * answers nothing.
 */
export const arrowDirections = ["down", "up"] as const;

/**
 * One of {@link arrowDirections}.
 */
export type ArrowDirection = (typeof arrowDirections)[number];

/**
 * Read the arrow an area's author asks for from its `class`: up where it holds `plate-arrow-up`,
 * down where it holds `plate-arrow-down`, and none where it holds neither, or both, which asks for
 * no one direction.
 *
 * @param classes The area's `class` as written, none when absent.
 * @returns The arrow's direction, none for no arrow.
 */
export const arrowOf = (classes: Option.Option<string>): Option.Option<ArrowDirection> => {
  const up = carriesRendererClass(classes, "plate-arrow-up");

  if (up === carriesRendererClass(classes, "plate-arrow-down")) {
    return Option.none();
  }

  return Option.some(up ? "up" : "down");
};

/**
 * Read an area's `coords`, each coordinate as written, in written order.
 *
 * @param read The reader kit.
 * @param area The `qti-hotspot-choice` or `qti-associable-hotspot`.
 * @returns The coordinates.
 */
export const coordinatesOf = (read: ReaderKit, area: SourceElement): readonly AreaCoordinate[] =>
  pipe(read.coordsOf(area), (coords) =>
    coords.map(([value, percent]): AreaCoordinate => ({ percent, value })),
  );

/**
 * The verdict's key for an area with no name of the author's, marked at its `qti-hotspot-choice`
 * or `qti-associable-hotspot`.
 */
const unlabelledArea = "hotspot-label:missing";

/**
 * Read an area's name, and mark the item's verdict when it has none: its `hotspot-label`, else its
 * `aria-label`, which the accessible-name computation takes as an element's name (accname 1.2,
 * step 2C), each counting only when it holds more than XML whitespace, as a blank `aria-label`
 * names nothing there. An area with neither is marked {@link unlabelledArea}: the name plate gives
 * it in place of one, its position among the areas, is no text alternative for the area (WCAG 2.2,
 * 1.1.1 Non-text Content), and the content admin who reads the verdict writes one.
 *
 * @param read The reader kit, whose `mark` records the verdict's mark.
 * @param area The `qti-hotspot-choice` or `qti-associable-hotspot`.
 * @returns The name as written, none when the author named the area neither way.
 */
export const areaLabel = (read: ReaderKit, area: SourceElement): Option.Option<string> => {
  const written = (attribute: string): Option.Option<string> =>
    read.valueOf(area, attribute).pipe(Option.filter((value) => trimXmlSpace(value) !== ""));
  const label = Option.orElse(written("hotspot-label"), () => written("aria-label"));

  if (Option.isNone(label)) {
    read.mark(area, unlabelledArea);
  }

  return label;
};

/**
 * An area as {@link areaNames} names it: its identifier and its label ({@link areaLabel}).
 */
interface NamedArea {
  readonly identifier: string;
  readonly label: Option.Option<string>;
}

/**
 * Give each area of an interaction its name by its identifier, as a message names an area (Graphic
 * Associate's and Graphic Order's): its label ({@link areaLabel}) where that holds anything but
 * XML white space, else its position among the interaction's areas, "Area 2 of 4". An identifier
 * two areas carry is named by the last of them.
 *
 * @example
 *   areaNames([{ identifier: "A", label: Option.none() }, { identifier: "B", label: Option.some("Barn") }], "en");
 *   // Map { "A" => "Area 1 of 2", "B" => "Barn" }
 *
 * @param areas The interaction's areas, in document order.
 * @param locale The locale of the names.
 * @returns Each identifier with its name.
 */
export const areaNames = (
  areas: readonly NamedArea[],
  locale: Locale,
): ReadonlyMap<string, string> =>
  new Map(
    areas.map((area, index) => [
      area.identifier,
      area.label.pipe(
        Option.filter((written) => trimXmlSpace(written) !== ""),
        Option.getOrElse(() =>
          message(locale, "graphicAreaOf", {
            count: numeral(locale, areas.length),
            n: numeral(locale, index + 1),
          }),
        ),
      ),
    ]),
  );
