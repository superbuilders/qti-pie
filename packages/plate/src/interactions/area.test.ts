/**
 * The arrow a hotspot's author asks for by plate's class (`arrowOf` in
 * `#plate/interactions/area.ts`): `plate-arrow-up` or `plate-arrow-down`, read from the class's
 * tokens as HTML reads a set of space-separated tokens, each class whole, and no arrow where the
 * class asks for both or for neither.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { arrowOf } from "#plate/interactions/area.ts";
import type { ArrowDirection } from "#plate/interactions/area.ts";

describe("a hotspot's arrow", () => {
  it("is read from the hotspot's class: plate-arrow-up or plate-arrow-down alone, as a whole token, and never otherwise", () => {
    const asked: readonly (readonly [string | undefined, ArrowDirection | undefined])[] = [
      ["plate-arrow-up", "up"],
      ["plate-arrow-down", "down"],
      ["qti-x plate-arrow-down other", "down"],
      ["\tplate-arrow-up\n", "up"],
      ["plate-arrow-up plate-arrow-down", undefined],
      ["plate-arrow-down plate-arrow-down", "down"],
      ["plate-arrow-left", undefined],
      ["Plate-arrow-up", undefined],
      ["plate-arrow-upward", undefined],
      ["xplate-arrow-up", undefined],
      ["", undefined],
      [undefined, undefined],
    ];

    for (const [classes, direction] of asked) {
      assert.deepStrictEqual(
        arrowOf(Option.fromNullishOr(classes)),
        Option.fromNullishOr(direction),
        String(classes),
      );
    }
  });
});
