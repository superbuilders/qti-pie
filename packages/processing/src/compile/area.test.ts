import { assert, describe, it } from "@effect/vitest";
import { resolveArea } from "#processing/compile/area.ts";
import type { ImageSize } from "#processing/compile/area.ts";
import type { Area } from "#processing/ir.ts";
import { element } from "#processing/test/run.ts";

/**
 * The images the tests resolve against, by name: one 400 by 200, and none.
 */
const images: ReadonlyMap<string, ImageSize> = new Map([["sized", { height: 200, width: 400 }]]);

/**
 * Resolve an area of a geometry and coordinates.
 *
 * @param geometry - Its `shape`.
 * @param coords - Its `coords`.
 * @param image - The image's name: `sized`, or `unsized` for none known.
 * @returns The area, or the refusal's code.
 */
const resolved = (geometry: string, coords: string, image: "sized" | "unsized"): Area | string => {
  const area = resolveArea(
    element(
      "qti-area-map-entry",
      Object.fromEntries([
        ["coords", coords],
        ["shape", geometry],
      ]),
      [],
    ),
    images.get(image),
    0,
  );

  return area.ok ? area.value : area.refusal.code;
};

describe("an area's resolution", () => {
  it("orders a rect's corners and keeps its coordinates exact over one denominator", () => {
    assert.deepStrictEqual(resolved("rect", "30, 40.5, 10, 20", "unsized"), {
      bottom: 81n,
      denominator: 2n,
      kind: "rect",
      left: 20n,
      right: 60n,
      top: 40n,
    });
  });

  it("takes a percentage of the image's width or height, a circle's radius of the smaller (reading `circle-percentage-radius`)", () => {
    assert.deepStrictEqual(resolved("circle", "50%, 50%, 10%", "sized"), {
      centre: { x: 200n, y: 100n },
      denominator: 1n,
      kind: "circle",
      radius: 20n,
    });
    assert.deepStrictEqual(resolved("circle", "50%, 50%, 10", "unsized"), "attribute");
  });

  it("reads coordinates that fit no shape as the HTML image map does: nowhere, a dropped odd vertex, extras ignored (reading `area-mapping`)", () => {
    assert.deepStrictEqual(resolved("circle", "1, 2", "unsized"), { kind: "nowhere" });
    assert.deepStrictEqual(resolved("circle", "1, 2, 0", "unsized"), { kind: "nowhere" });
    assert.deepStrictEqual(resolved("poly", "0, 0, 4, 0", "unsized"), { kind: "nowhere" });
    assert.deepStrictEqual(resolved("poly", "0, 0, 4, 0, 4, 4, 9", "unsized"), {
      denominator: 1n,
      kind: "poly",
      vertices: [
        { x: 0n, y: 0n },
        { x: 4n, y: 0n },
        { x: 4n, y: 4n },
      ],
    });
    assert.deepStrictEqual(resolved("rect", "0, 0, 4, 4, 7", "unsized"), {
      bottom: 4n,
      denominator: 1n,
      kind: "rect",
      left: 0n,
      right: 4n,
      top: 0n,
    });
    assert.deepStrictEqual(resolved("default", "", "unsized"), { kind: "everywhere" });
    assert.deepStrictEqual(resolved("rect", "a, b, c, d", "unsized"), "attribute");
  });
});
