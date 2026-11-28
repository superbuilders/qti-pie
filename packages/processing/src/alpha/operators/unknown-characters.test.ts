/**
 * No character an operator does not name is ever dropped (the ruling of 2026-11-28, which withdrew
 * V-28's edge junk): over arbitrary texts written from named characters (digits, letters,
 * operators, brackets, TeX commands, white space, the synonyms and V-25's punctuation) and
 * characters no rule names (`#`, `@`, `?`, `&`, a backtick, an emoji), tex-normal keeps every
 * unnamed character, as often as it was written, and math-canonical reads a text that holds one as
 * no expression (NULL), so an answer with a character the grader does not know is never graded as
 * the answer without it (`6#` is not `6`).
 */
import { explore, drawn } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { element, string } from "@bjornpagen/testing/gen";
import { boundedShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect } from "effect";
import { mathCanonical } from "#processing/alpha/operators/math-canonical.ts";
import { texNormal } from "#processing/alpha/operators/tex-normal.ts";
import { charsOf } from "#processing/alpha/text.ts";

/**
 * Characters no rule of tex-normal or math-canonical names.
 */
const unnamed = ["#", "@", "?", "&", "`", "\u{1F4A9}"] as const;

/**
 * Characters and commands the rules name, as a child or a key writes them.
 */
const named = [
  "6",
  "1",
  "0",
  "x",
  "y",
  "+",
  "-",
  "*",
  "/",
  "=",
  "<",
  ">",
  "!",
  "%",
  "^",
  "_",
  ".",
  ",",
  ";",
  ":",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "$",
  "~",
  "'",
  "|",
  " ",
  "\\",
  "\\frac",
  "\\left",
  "\\right",
  "\\cdot",
  "\\geq",
  "\\text",
  "\\sqrt",
  "×",
  "÷",
  "−",
  "½",
  "²",
  "π",
  "≤",
  "​",
  "e.g.",
] as const;

/**
 * One piece of a text: a named piece or an unnamed character.
 */
const piece = element([...named, ...unnamed]);

/**
 * A text of up to twelve pieces.
 */
const texts = string(piece, { max: 12, min: 0 });

/**
 * How often each unnamed character occurs in a text.
 *
 * @param text - The text.
 * @returns Each unnamed character's count, in the list's order.
 */
const unnamedCounts = (text: string): readonly number[] => {
  const chars = charsOf(text);

  return unnamed.map((c) => chars.filter((each) => each === c).length);
};

describe("characters no rule names", () => {
  it.effect("are kept by tex-normal, and make math-canonical read no expression", (ctx) =>
    Effect.asVoid(
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.seconds(30),
            coverage: noCoverage,
            draw: drawn(texts),
            kept: [],
            literal: (text) => JSON.stringify(text),
            oracle: {
              kind: "specification",
              name: "the ruling of 2026-11-28: no unknown character is dropped",
            },
            runs: 4000,
            shrink: boundedShrink(256),
            steerEvery: 16,
            suite: "processing/alpha/unknown-characters-kept",
          },
          (text) =>
            Effect.sync(() => {
              const written = unnamedCounts(text);
              assert.deepStrictEqual(unnamedCounts(texNormal(text)), written, JSON.stringify(text));
              if (written.some((count) => count > 0)) {
                assert.isUndefined(mathCanonical(text, true), JSON.stringify(text));
                assert.isUndefined(mathCanonical(text, false), JSON.stringify(text));
              }
            }),
        ),
      ),
    ),
  );
});
