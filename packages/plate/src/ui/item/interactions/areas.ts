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
import type { ReferencingChoice } from "#plate/model/item.ts";
import type { IslandContext } from "#plate/ui/item/context.ts";
import { spokenOf } from "#plate/ui/item/interactions/answering.tsx";
import type { Place } from "#plate/ui/item/interactions/text.ts";
import type { Spoken } from "#plate/ui/read-aloud/spoken.tsx";

/**
 * One area as its payload holds it: the catalog it references and its name as the core read it,
 * beside every other fact of it.
 */
type PayloadArea = ReferencingChoice & { readonly label: Option.Option<string> };

/**
 * One area as the island and the review show it: every fact of its payload's but the catalog it
 * references, which no island reads; its name; and `unnamed`, whether that name is plate's "Area n
 * of count" because the author named the area nothing, which the parts that show the name write as
 * `data-unnamed`, so a theme can tell a name the author wrote from one plate made up.
 *
 * @template H The payload's area.
 */
type NamedArea<H extends PayloadArea> = Omit<H, "catalog" | "label"> & {
  readonly label: string;
  readonly unnamed: boolean;
};

/**
 * Name one area as the island and the review show it: the author's `hotspot-label`, else
 * `aria-label`, as the core read it, which keeps neither where it is blank (`areaLabel` in
 * `#plate/interactions/area.ts`); else "Area n of count", its place among the areas, so every
 * control and target has a name (WCAG 1.1.1). Every other fact of the area passes as the payload
 * holds it, but the catalog it references, which read-aloud reads on the server alone
 * ({@link spokenAreasOf}), and it is `unnamed` exactly where its name is plate's.
 *
 * @template H The payload's area, with its name as the core read it.
 * @param area The area, as its payload holds it.
 * @param place Its place among the interaction's areas, in document order.
 * @param locale The locale of plate's own text.
 * @returns The area, with its name.
 */
const namedAt = <H extends PayloadArea>(
  { catalog: _read, label, ...area }: H,
  place: Place,
  locale: Locale,
): NamedArea<H> => ({
  ...area,
  label: Option.getOrElse(label, () =>
    message(locale, "graphicAreaOf", {
      count: numeral(locale, place.count),
      n: numeral(locale, place.n),
    }),
  ),
  unnamed: Option.isNone(label),
});

/**
 * Name each area as the island and the review show it, in document order ({@link namedAt}).
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
  areas.map((area, index) => namedAt(area, { count: areas.length, n: index + 1 }, locale));

/**
 * Name each area as the island shows it, in document order ({@link namedAt}), with its
 * read-aloud: the control for the catalog it references where the candidate hears it, named by its
 * place among the areas (`spokenOf` in `#plate/ui/item/interactions/answering.tsx`).
 *
 * @template H The payload's area, with its name as the core read it.
 * @param areas The interaction's areas, as its payload holds them.
 * @param context What the page may know: the locale and read-aloud.
 * @returns The areas, each with its name and its read-aloud.
 */
export const spokenAreasOf = <H extends PayloadArea>(
  areas: readonly H[],
  context: Pick<IslandContext, "locale" | "readAloud">,
): readonly (NamedArea<H> & Spoken)[] =>
  areas.map((area, index) => ({
    ...namedAt(area, { count: areas.length, n: index + 1 }, context.locale),
    ...spokenOf(area, index + 1, "readAloudArea", context),
  }));
