/**
 * The areas of a graphic interaction as its island shows them, each named
 * (`#plate/interactions/area-names.ts`) and with its read-aloud, for the four kinds that draw areas
 * on an image: Hotspot, Graphic Gap Match, Graphic Order and Graphic Associate. Safe to import on
 * the server only, where the catalog's words are.
 *
 * @module
 */
import { Array as Arr } from "effect";
import { namedAreasOf } from "#plate/interactions/area-names.ts";
import type { NamedArea, PayloadArea } from "#plate/interactions/area-names.ts";
import type { IslandContext } from "#plate/ui/item/context.ts";
import { spokenOf } from "#plate/ui/item/interactions/answering.tsx";
import type { Spoken } from "#plate/ui/read-aloud/spoken.tsx";

/**
 * Name each area as the island shows it, in document order ({@link namedAreasOf}), with its
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
  Arr.zipWith(
    namedAreasOf(areas, context.locale),
    areas.map((area) => spokenOf(area, "readAloudArea", context)),
    (named, spoken) => ({ ...named, ...spoken }),
  );
