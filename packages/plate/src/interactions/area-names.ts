/**
 * The names the areas of a graphic interaction show under, for the four kinds that draw areas on
 * an image: Hotspot, Graphic Gap Match, Graphic Order and Graphic Associate. Every area has one,
 * so every control and target has a name (WCAG 1.1.1), and each knows whether its name is the
 * author's or plate's. Safe to import on the server only, where the catalog's words are.
 *
 * @module
 */
import { Option } from "effect";
import { message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import type { ReferencingChoice } from "#plate/model/item.ts";

/**
 * One area as its payload holds it: the catalog it references and its name as the core read it,
 * beside every other fact of it.
 */
export type PayloadArea = ReferencingChoice & { readonly label: Option.Option<string> };

/**
 * One area as the island and the review show it: every fact of its payload's but the catalog it
 * references, which no island reads; its name; and `unnamed`, whether that name is plate's "Area n
 * of count" because the author named the area nothing, which the parts that show the name write as
 * `data-unnamed`, so a theme can tell a name the author wrote from one plate made up.
 *
 * @template H The payload's area.
 */
export type NamedArea<H extends PayloadArea> = Omit<H, "catalog" | "label"> & {
  readonly label: string;
  readonly unnamed: boolean;
};

/**
 * Name each area as the island and the review show it, in document order: the author's
 * `hotspot-label`, else `aria-label`, as the core read it, which keeps neither where it is blank
 * (`areaLabel` in `#plate/interactions/area.ts`); else "Area n of count", its place among the
 * areas. Every other fact of the area passes as the payload holds it, but the catalog it
 * references, which read-aloud reads on the server alone, and it is `unnamed` exactly where its
 * name is plate's.
 *
 * @template H The payload's area, with its name as the core read it.
 * @param areas The interaction's areas, as its payload holds them.
 * @param locale The locale of plate's own text.
 * @returns The areas, each with its name.
 */
export const namedAreasOf = <H extends PayloadArea>(
  areas: readonly H[],
  locale: Locale,
): readonly NamedArea<H>[] =>
  areas.map(({ catalog: _read, label, ...area }, index) => ({
    ...area,
    label: Option.getOrElse(label, () =>
      message(locale, "graphicAreaOf", {
        count: numeral(locale, areas.length),
        n: numeral(locale, index + 1),
      }),
    ),
    unnamed: Option.isNone(label),
  }));
