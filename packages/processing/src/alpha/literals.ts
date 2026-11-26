/**
 * How Alpha's operators read their literal operands, each parsed once, when the document is
 * compiled: a literal is a `qti-base-value` of its declared type, or a `qti-null`, which each
 * reading gives its own meaning (composable- operators.md §2: a NULL literal is the empty string,
 * translate's `from` and `to`; the empty set, unit-near's and phrase-distance's words and phrases;
 * or true, math-canonical's `reduce`, C6's default). A value of another type is no such literal,
 * and publication refuses the document.
 *
 * @module
 */
import type { Value } from "#processing/value.ts";

/**
 * A string literal's text, the empty string for NULL.
 *
 * @param value - The literal as written.
 * @returns Its text, or none for another type.
 */
export const textLiteral = (value: Value): string | undefined => {
  if (value.kind === "null") {
    return "";
  }

  return value.kind === "single" && value.base === "string" ? value.value : undefined;
};

/**
 * A literal set of strings, the empty set for NULL.
 *
 * @param value - The literal as written.
 * @returns Its strings, or none for another type.
 */
export const wordsLiteral = (value: Value): readonly string[] | undefined => {
  if (value.kind === "null") {
    return [];
  }

  return value.kind === "multiple" && value.base === "string" ? value.values : undefined;
};

/**
 * A boolean literal, true for NULL.
 *
 * @param value - The literal as written.
 * @returns Its truth, or none for another type.
 */
export const switchLiteral = (value: Value): boolean | undefined => {
  if (value.kind === "null") {
    return true;
  }

  return value.kind === "single" && value.base === "boolean" ? value.value : undefined;
};
