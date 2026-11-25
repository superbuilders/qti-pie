/**
 * The names a graphic interaction's areas show under (`namedAreasOf` in
 * `#plate/interactions/area-names.ts`): an area the author named keeps its name and is not
 * `unnamed`; one the author named nothing takes plate's "Area n of count" and is `unnamed`, so its
 * parts write `data-unnamed` and a theme can hide them from the eye.
 *
 * The property walks every pattern of named and unnamed areas, up to six, against the rule of
 * `#plate/test/area-names.ts`, written apart from it: the oracle for the fallback is the catalog's
 * English, "Area n of count".
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { namedAreasOf } from "#plate/interactions/area-names.ts";
import { walkNames } from "#plate/test/area-names.ts";

describe("a graphic area's name", () => {
  it("is the author's, not unnamed, where the core read one, else Area n of count, unnamed, for every pattern up to six areas", () => {
    const found = walkNames({ namedAreasOf });

    assert.isUndefined(found, found);
  });
});
