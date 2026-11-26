/**
 * The lexical forms of QTI's base types, as a document writes a value: a `qti-base-value`'s text, a
 * declaration's `qti-value`, a map entry's key. Every document the compiler reads was admitted by
 * pantry, which refused any value outside its base type's lexical space, so a reader here is the
 * value map of an admitted form: it gives `undefined` only for a form pantry's admission refuses.
 *
 * - An integer is `xs:integer`'s lexical space (reading `integer-lexical`): `+7` and `007` are 7,
 *   exact at any size (reading `integer-unbounded`).
 * - A float and a duration's seconds are `xs:double`'s (reading `float-binary64`), read as XML Schema
 *   1.1's doubleLexicalMap reads one, so a decimal beyond the largest finite double is an infinity
 *   of its sign (reading `bounded-double`).
 * - A boolean is `true`, `false`, `1` or `0` (reading `boolean-lexical`).
 * - A pair, a directed pair and a point are two tokens, a point's two integers.
 *
 * @module
 */
import { regex } from "arkregex";
import { collapseXmlSpace, trimXmlSpace } from "#processing/xml.ts";
import { isText, single, textValue } from "#processing/value.ts";
import type { BaseType, Null, Single } from "#processing/value.ts";

/**
 * `xs:integer`'s lexical space: an optional sign and ASCII digits.
 */
const integerLexical = regex("^[+-]?[0-9]+$", "u");

/**
 * `xs:double`'s lexical space: a decimal with an optional exponent, `INF`, `-INF` or `NaN`.
 */
const doubleLexical = regex(
  "^(?:[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[Ee][+-]?[0-9]+)?|-?INF|NaN)$",
  "u",
);

/**
 * Read an `xs:integer`.
 *
 * @param lexical - The text, already trimmed or collapsed.
 * @returns The integer, or `undefined` for text outside the lexical space.
 */
export const readInteger = (lexical: string): bigint | undefined =>
  integerLexical.test(lexical) ? BigInt(lexical) : undefined;

/**
 * Read an `xs:double`: a decimal rounds to the nearest double, ties to even, and beyond the largest
 * finite double it is an infinity of its sign (reading `bounded-double`).
 *
 * @param lexical - The text, already trimmed or collapsed.
 * @returns The double, or `undefined` for text outside the lexical space.
 */
export const readDouble = (lexical: string): number | undefined => {
  if (!doubleLexical.test(lexical)) {
    return undefined;
  }

  if (lexical === "INF") {
    return Number.POSITIVE_INFINITY;
  }

  return lexical === "-INF" ? Number.NEGATIVE_INFINITY : Number(lexical);
};

/**
 * Read a boolean: `true` or `1` is true, `false` or `0` false (reading `boolean-lexical`).
 *
 * @param lexical - The text, already trimmed or collapsed.
 * @returns The boolean, or `undefined` for any other text.
 */
export const readBoolean = (lexical: string): boolean | undefined => {
  if (lexical === "true" || lexical === "1") {
    return true;
  }

  return lexical === "false" || lexical === "0" ? false : undefined;
};

/**
 * The two tokens of a pair's, a directed pair's or a point's text.
 *
 * @param lexical - The text.
 * @returns The two tokens, or `undefined` unless there are exactly two.
 */
const twoTokens = (lexical: string): readonly [string, string] | undefined => {
  const [first, second, ...rest] = collapseXmlSpace(lexical).split(" ");

  return first === undefined || second === undefined || rest.length > 0
    ? undefined
    : [first, second];
};

/**
 * Read a pair, a directed pair or a point from its two tokens.
 *
 * @param base - The base type.
 * @param lexical - The trimmed text.
 * @returns The value, or `undefined` for text that is not two tokens of the type.
 */
const readTuple = (
  base: "directedPair" | "pair" | "point",
  lexical: string,
): Single | undefined => {
  const tokens = twoTokens(lexical);
  if (tokens === undefined) {
    return undefined;
  }

  const [first, second] = tokens;
  if (base === "point") {
    const x = readInteger(first);
    const y = readInteger(second);

    return x === undefined || y === undefined ? undefined : single("point", { x, y });
  }

  if (!isText(first) || !isText(second)) {
    return undefined;
  }

  return base === "pair"
    ? single("pair", { first, second })
    : single("directedPair", { source: first, target: second });
};

/**
 * Read the single value of a base type from its lexical form. A string is read as written, and the
 * empty string is NULL (§2.2.2); every other base type's text is read trimmed, as an element's
 * typed text is (reading `typed-value-whitespace`). A file has no lexical form: a document writes
 * none.
 *
 * @param base - The base type.
 * @param text - The text as written.
 * @returns The value, NULL for an empty string, or `undefined` for text outside the lexical space.
 */
export const readSingle = (base: BaseType, text: string): Null | Single | undefined => {
  if (base === "string") {
    return textValue("string", text);
  }

  const lexical = trimXmlSpace(text);
  switch (base) {
    case "boolean": {
      const value = readBoolean(lexical);

      return value === undefined ? undefined : single("boolean", value);
    }
    case "integer": {
      const value = readInteger(lexical);

      return value === undefined ? undefined : single("integer", value);
    }
    case "float":
    case "duration": {
      const value = readDouble(lexical);

      return value === undefined ? undefined : single(base, value);
    }
    case "identifier":
    case "uri": {
      return isText(lexical) ? single(base, lexical) : undefined;
    }
    case "pair":
    case "directedPair":
    case "point": {
      return readTuple(base, lexical);
    }
    case "file": {
      return undefined;
    }
  }
};
