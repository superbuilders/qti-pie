import { assert, describe, it } from "@effect/vitest";
import { blocks } from "#plate/model/blocks.ts";

describe("model/blocks.ts", () => {
  it("BasicLatin is U+0000 to U+007F", () => {
    assert.deepStrictEqual(blocks.get("BasicLatin"), [[0x00_00, 0x00_7f]]);
  });

  it("Specials, listed twice, keeps both ranges", () => {
    assert.deepStrictEqual(blocks.get("Specials"), [
      [0xfe_ff, 0xfe_ff],
      [0xff_f0, 0xff_fd],
    ]);
  });
});
