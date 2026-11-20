/**
 * The areas of a graphic interaction as its island and its review show them, for the four kinds
 * that draw areas on an image: Hotspot, Graphic Gap Match, Graphic Order and Graphic Associate.
 * Safe to import on the server only, where the catalog's words are.
 *
 * @module
 */
import { Option } from "effect";
import { message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";

/**
 * Name each area as the island and the review show it, in document order: the author's
 * `hotspot-label`, else `aria-label`, as the core read it, which keeps neither where it is blank
 * (`areaLabel` in `#plate/interactions/area.ts`); else "Area n of count", its place among them, so
 * every control and target has a name (WCAG 1.1.1). Every other fact of an area passes as the
 * payload holds it.
 *
 * @template H The payload's area, with its name as the core read it.
 * @param areas The interaction's areas, as its payload holds them.
 * @param locale The locale of plate's own text.
 * @returns The areas, each with its name.
 */
export const namedAreasOf = <H extends { readonly label: Option.Option<string> }>(
  areas: readonly H[],
  locale: Locale,
): readonly (Omit<H, "label"> & { readonly label: string })[] =>
  areas.map((area, index) => ({
    ...area,
    label: Option.getOrElse(area.label, () =>
      message(locale, "graphicAreaOf", {
        count: numeral(locale, areas.length),
        n: numeral(locale, index + 1),
      }),
    ),
  }));
