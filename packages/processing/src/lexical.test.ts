import { assert, describe, it } from "@effect/vitest";
import { drawBelow } from "#processing/draws.ts";
import { readValue, writeValue } from "#processing/lexical.ts";
import type { Writable } from "#processing/lexical.ts";
import { drawStream, processingSeed } from "#processing/stream.ts";
import { isText, sameSingle, single } from "#processing/value.ts";
import type { Text } from "#processing/value.ts";

/**
 * How many values of each base type the round trip draws.
 */
const cases = 2000;

const draw = drawStream(processingSeed("lexical", "round-trip", "values"), "cases");

/**
 * A drawn double: any 64-bit pattern, the infinities, NaN and −0 among them.
 *
 * @returns The double.
 */
const drawDouble = (): number => {
  const view = new DataView(new ArrayBuffer(8));
  view.setUint32(0, draw());
  view.setUint32(4, draw());

  return view.getFloat64(0);
};

/**
 * A drawn integer of up to 256 bits, of either sign.
 *
 * @returns The integer.
 */
const drawInteger = (): bigint => {
  const magnitude = drawBelow(draw, 2n ** BigInt(1 + Number(drawBelow(draw, 256n))));

  return drawBelow(draw, 2n) === 0n ? magnitude : -magnitude;
};

/**
 * A drawn token: one to eight letters, digits, dots, hyphens or underscores, never white space.
 *
 * @returns The token.
 */
const drawToken = (): Text => {
  const letters = "abcXYZ019._-";
  const length = 1 + Number(drawBelow(draw, 8n));
  const token = Array.from({ length }, () =>
    letters.charAt(Number(drawBelow(draw, BigInt(letters.length)))),
  ).join("");

  return isText(token) ? token : assert.fail("a token holds a character");
};

/**
 * A drawn string of one to eight characters, white space and astral characters among them.
 *
 * @returns The string.
 */
const drawString = (): Text => {
  const characters = [" ", "\t", "a", "é", "😀", "<", "&", "\n"];
  const length = 1 + Number(drawBelow(draw, 8n));
  const text = Array.from(
    { length },
    () => characters[Number(drawBelow(draw, BigInt(characters.length)))] ?? "a",
  ).join("");

  return isText(text) ? text : assert.fail("a string holds a character");
};

/**
 * A drawer of each base type that has a lexical form.
 */
const drawers = {
  boolean: () => single("boolean", drawBelow(draw, 2n) === 0n),
  directedPair: () => single("directedPair", { source: drawToken(), target: drawToken() }),
  duration: () => single("duration", drawDouble()),
  float: () => single("float", drawDouble()),
  identifier: () => single("identifier", drawToken()),
  integer: () => single("integer", drawInteger()),
  pair: () => single("pair", { first: drawToken(), second: drawToken() }),
  point: () => single("point", { x: drawInteger(), y: drawInteger() }),
  string: () => single("string", drawString()),
  uri: () => single("uri", drawToken()),
} as const satisfies { readonly [B in Writable["base"]]: () => Writable };

/**
 * Whether a read gave back exactly the value written: a double by `Object.is`, so −0 is −0 and NaN
 * NaN; any other by `sameSingle`.
 *
 * @param value - The value written.
 * @param text - Its text.
 * @returns Whether reading the text gives the value.
 */
const roundTrips = (value: Writable, text: string): boolean => {
  const read = readValue(value.base, text);
  if (read.kind !== "read" || read.value.kind !== "single") {
    return false;
  }

  if (value.base === "float" || value.base === "duration") {
    return read.value.base === value.base && Object.is(read.value.value, value.value);
  }

  return sameSingle(read.value, value);
};

describe("the lexical reader and writer", () => {
  it(`read back every value they write, over ${String(cases)} drawn values of each base type`, () => {
    for (const drawOne of Object.values(drawers)) {
      for (let index = 0; index < cases; index += 1) {
        const value = drawOne();
        const text = writeValue(value);
        assert.isTrue(roundTrips(value, text), `${value.base} ${text}`);
      }
    }
  });

  it("refuse text outside a base type's lexical space with its reason, and a file for having none (readings `integer-lexical`, `boolean-lexical`)", () => {
    assert.deepStrictEqual(readValue("integer", "7.0"), {
      base: "integer",
      kind: "refused",
      reason: "outside-lexical-space",
      text: "7.0",
    });
    assert.deepStrictEqual(readValue("file", "a.png"), {
      base: "file",
      kind: "refused",
      reason: "no-lexical-form",
      text: "a.png",
    });
    assert.deepStrictEqual(readValue("integer", " +007\n"), {
      kind: "read",
      value: single("integer", 7n),
    });
  });
});
