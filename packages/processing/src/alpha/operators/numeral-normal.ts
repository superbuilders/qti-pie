/**
 * `numeral-normal` (composable-operators.md §2.1 P3): canonical numerals, its three steps in order,
 * each as the SQL grader's `p3.numeral_normal` wrote it.
 *
 * 1. Every decimal numeral without its trailing fractional zeros, and its point where none is left:
 *    each maximal run of digits and points that is digits, one point and digits ending in 0
 *    (`6.50t` is `6.5t`, `3.00` is `3`; `10.05`, `.50` and `8.0.09` stay).
 * 2. Parentheses holding exactly one fraction n/m, n and m each one numeral (`[0-9]+(.[0-9]+)?`) or
 *    one letter (`\p{L}`), white space allowed inside, are deleted unless a digit, `/`, `÷`, `^`,
 *    `_`, `!` or `%` touches them on the outside, white space skipped; repeated, so a fraction
 *    wrapped twice loses both. Each round judges every such pair on the text as it stood at the
 *    round's start (`x*(1/2)` is `x*1/2`; `(1/2)/3`, `2(1/2)` and `(1/2)^2` keep theirs).
 * 3. Only for numeric-ish text (a decimal digit, no letter and no `[` or `]`), in order: a comma
 *    between a digit and exactly three digits that end the text or precede a non-digit is deleted;
 *    `$` is deleted; every white space run is deleted but for a mixed number's one space, a run
 *    between an integer numeral (digits after the text's start or a character no digit or point)
 *    and a fraction of digits whose numerator is not zero (V-24: `2 1/2` is not `21/2`; `1 0 1/2`
 *    is `10 1/2`, `1 0/3` is `10/3`, `1.5 1/2` is `1.51/2`); a pair of parentheses enclosing the
 *    whole text, with none inside, is deleted, repeatedly.
 *
 * @module
 */
import { regex } from "arkregex";
import { head, lengthOf, slice, tail, whiteSpace } from "#processing/alpha/text.ts";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import { textValue } from "#processing/value.ts";

/**
 * Runs of digits and points, and runs of anything else.
 */
const numeralRuns = regex("[0-9.]+|[^0-9.]+", "gsu");

/**
 * A decimal numeral that ends in a fractional zero.
 */
const trailingZero = regex("^[0-9]+[.][0-9]*0$", "u");

/**
 * Trailing zeros.
 */
const zeros = regex("0+$", "u");

/**
 * Step 1: every decimal numeral without its trailing fractional zeros.
 *
 * @param text - The text.
 * @returns It with each such numeral shortened.
 */
export const withoutTrailingZeros = (text: string): string =>
  text.replace(numeralRuns, (run) => {
    if (!trailingZero.test(run)) {
      return run;
    }

    const [whole = "", fraction = ""] = run.split(".");
    const kept = fraction.replace(zeros, "");

    return kept === "" ? whole : `${whole}.${kept}`;
  });

/**
 * The pieces a round reads: runs without `(`, innermost pairs of parentheses, and a lone `(`.
 */
const parenthesisPieces = regex("[^(]+|[(][^()]*[)]|[(]", "gsu");

/**
 * One part of a lone fraction: a numeral, or any one character that is neither white space nor `/`.
 */
const part = `([0-9]+(?:[.][0-9]+)?|[^${whiteSpace}/])`;

/**
 * A pair of parentheses holding one fraction, its two parts captured.
 */
const loneFraction = regex(
  `^\\([${whiteSpace}]*${part}[${whiteSpace}]*/[${whiteSpace}]*${part}[${whiteSpace}]*\\)$`,
  "su",
);

/**
 * Trailing white space.
 */
const trailingSpace = regex(`[${whiteSpace}]+$`, "su");

/**
 * Leading white space.
 */
const leadingSpace = regex(`^[${whiteSpace}]+`, "su");

/**
 * One letter, the whole text.
 */
const oneLetter = regex("^\\p{L}$", "su");

/**
 * A digit at the start.
 */
const digitFirst = regex("^[0-9]", "u");

/**
 * A character that binds a fraction's parentheses from outside.
 */
const binding = regex("^[0-9/÷^_!%]$", "u");

/**
 * Whether a part is a numeral or one letter.
 */
const isNumeralOrLetter = (text: string): boolean => digitFirst.test(text) || oneLetter.test(text);

/**
 * One round of step 2: every lone fraction's parentheses deleted that nothing binds from outside,
 * judged on the text as the round finds it.
 *
 * @param text - The text.
 * @returns It after the round.
 */
const unwrapRound = (text: string): string => {
  const pieces = Array.from(text.matchAll(parenthesisPieces), (match) => {
    const [piece] = match;

    return {
      first: head(piece.replace(leadingSpace, ""), 1),
      last: tail(piece.replace(trailingSpace, ""), 1),
      parts: loneFraction.exec(piece),
      piece,
    };
  });

  return pieces
    .map(({ parts, piece }, at) => {
      if (parts === null) {
        return piece;
      }

      const [, numerator = "", denominator = ""] = parts;
      if (!(isNumeralOrLetter(numerator) && isNumeralOrLetter(denominator))) {
        return piece;
      }

      const before = pieces.slice(0, at).findLast((p) => p.last !== "")?.last ?? "";
      const after = pieces.slice(at + 1).find((p) => p.first !== "")?.first ?? "";

      return binding.test(before) || binding.test(after)
        ? piece
        : slice(piece, 2, lengthOf(piece) - 2);
    })
    .join("");
};

/**
 * Step 2: lone fractions' parentheses deleted, round after round until a round changes nothing.
 *
 * @param text - The text.
 * @returns It with every unbound lone fraction unwrapped.
 */
export const loneFractionsUnwrapped = (text: string): string => {
  if (!(text.includes("/") && text.includes("("))) {
    return text;
  }

  let current = text;
  for (;;) {
    const next = unwrapRound(current);
    if (next === current) {
      return current;
    }

    current = next;
  }
};

/**
 * A digit anywhere.
 */
const anyDigit = regex("[0-9]", "u");

/**
 * A letter anywhere.
 */
const anyLetter = regex("\\p{L}", "u");

/**
 * A bracket anywhere.
 */
const anyBracket = regex("[\\][]", "u");

/**
 * A thousands comma: after a digit, before exactly three digits that end the text or a non-digit
 * follows.
 */
const thousandsComma = regex("(?<=[0-9]),(?=[0-9]{3}(?:[^0-9]|$))", "gsu");

/**
 * Runs of white space, and runs of anything else.
 */
const spaceRuns = regex(`[${whiteSpace}]+|[^${whiteSpace}]+`, "gsu");

/**
 * A white space run.
 */
const spaceFirst = regex(`^[${whiteSpace}]`, "u");

/**
 * A text that ends in an integer numeral after its start or after a character no digit or point.
 */
const endsInInteger = regex("(?:^|[^0-9.])[0-9]+$", "su");

/**
 * A text that starts with a fraction of digits whose numerator is not zero.
 */
const startsWithFraction = regex("^0*[1-9][0-9]*/[0-9]", "u");

/**
 * Parentheses enclosing a whole text with none inside.
 */
const enclosed = regex("^\\([^()]*\\)$", "su");

/**
 * Step 3 on a numeric-ish text.
 *
 * @param text - The text.
 * @returns It with its separators, `$` and white space read away.
 */
const numericNormal = (text: string): string => {
  const runs = Array.from(
    text.replace(thousandsComma, "").replaceAll("$", "").matchAll(spaceRuns),
    (m) => m[0],
  );
  let current = runs
    .map((run, at) => {
      if (!spaceFirst.test(run)) {
        return run;
      }

      return endsInInteger.test(runs[at - 1] ?? "") && startsWithFraction.test(runs[at + 1] ?? "")
        ? " "
        : "";
    })
    .join("");
  while (enclosed.test(current)) {
    current = slice(current, 2, lengthOf(current) - 2);
  }

  return current;
};

/**
 * A text's canonical numerals.
 *
 * @param text - The text.
 * @returns Its numerals canonical; empty where nothing is left.
 */
export const numeralNormal = (text: string): string => {
  const unwrapped = loneFractionsUnwrapped(withoutTrailingZeros(text));

  return anyDigit.test(unwrapped) && !anyLetter.test(unwrapped) && !anyBracket.test(unwrapped)
    ? numericNormal(unwrapped)
    : unwrapped;
};

/**
 * The `numeral-normal` operator's registry entry.
 */
export const numeralNormalOperator = inlineOperator({
  apply: ([text]) => textValue("string", numeralNormal(text.value)),
  definition: `${alphaDefinitionPrefix}numeral-normal`,
  operands: [{ form: "expression", name: "text", type: { base: "string", cardinality: "single" } }],
  result: { base: "string", cardinality: "single" },
});
