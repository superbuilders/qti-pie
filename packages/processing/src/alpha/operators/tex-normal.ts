/**
 * `tex-normal` (composable-operators.md §2.1 P2): the presentation normal form of typed math and
 * TeX, rewritten to a fixpoint, innermost first; it never reorders, evaluates or drops a grouping
 * that carries meaning. Each pass applies T-1, T-2, T-3, T-4, T-9, T-5, T-7, T-6 and T-8 in that
 * order (empty templates before arguments are braced; spacing before fractions, so "one numeral"
 * never depends on the order rules happened to run in). A command is a control word, a backslash
 * and a maximal run of ASCII letters, so `\left` never matches `\leftarrow`; an unbraced argument
 * is one TeX token after optional spaces (one digit, one ASCII letter, one Greek letter or one
 * Greek command), and T-6's "one numeral or one name" also a numeral `[0-9]+(\.[0-9]+)?`; every
 * rule, T-8 included, runs inside the fixpoint.
 *
 * This is the SQL grader's `p3.tex_normal` ported literally, function by function, its places
 * counted in code points as PostgreSQL counts them; the differential against it on every LaTeX key
 * and box row is its oracle.
 *
 * @module
 */
import { regex } from "arkregex";
import { isGreekCommand } from "#processing/alpha/greek.ts";
import {
  charsOf,
  head,
  lengthOf,
  matchPlace,
  placeOf,
  suffix,
  slice,
  tail,
  whiteSpace,
} from "#processing/alpha/text.ts";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import { textValue } from "#processing/value.ts";

/**
 * One white space character, the whole text.
 */
const oneSpace = regex(`^[${whiteSpace}]$`, "u");

/**
 * One ASCII digit, the whole text.
 */
const oneDigit = regex("^[0-9]$", "u");

/**
 * One ASCII letter, the whole text.
 */
const oneAsciiLetter = regex("^[A-Za-z]$", "u");

/**
 * One Greek letter, the whole text: Α-Ρ, Σ-Ω, α-ω and the variants ϑ ϕ ϖ ϱ ϵ.
 */
const oneGreekLetter = regex(
  "^[\\u0391-\\u03a1\\u03a3-\\u03a9\\u03b1-\\u03c9\\u03d1\\u03d5\\u03d6\\u03f1\\u03f5]$",
  "u",
);

/**
 * One numeral, signed, the whole text.
 */
const oneNumeral = regex("^-?[0-9]+(?:[.][0-9]+)?$", "u");

/**
 * Whether a text is one TeX token, as an unbraced argument is read: one digit, one ASCII letter,
 * one Greek letter or one Greek command (T-5).
 *
 * @param text - The text.
 * @returns Whether it is one.
 */
export const isOneToken = (text: string): boolean =>
  (text.startsWith("\\") && isGreekCommand(text.slice(1))) ||
  oneDigit.test(text) ||
  oneAsciiLetter.test(text) ||
  oneGreekLetter.test(text);

/**
 * Whether a text is one numeral or one name (T-6): a numeral may run to several digits, since `/`
 * delimits it, and carry a sign, a signed numeral being one numeral (`\frac{-37}{2}` is `-37/2`).
 *
 * @param text - The text.
 * @returns Whether it is one.
 */
const isOneName = (text: string): boolean => oneNumeral.test(text) || isOneToken(text);

/**
 * One macro argument as TeX reads it: whether it was a brace group, its content (a group's without
 * its braces) and the place after it.
 */
interface Argument {
  readonly braced: boolean;
  readonly content: string;
  readonly endsAt: number;
}

/**
 * A control word or a control symbol at the start.
 */
const controlSequence = regex("^\\\\(?:[A-Za-z]+|.)", "su");

/**
 * TeX's reading of one macro argument from place `at`: white space skipped, then a balanced brace
 * group (a backslash escaping the character after it), or a control word or symbol, or one
 * character; none at the end of the text, before a `}`, or for an unbalanced group.
 *
 * @param text - The text.
 * @param at - The place the argument is read from.
 * @returns The argument, or none.
 */
const argumentAt = (text: string, at: number): Argument | undefined => {
  const chars = charsOf(text);
  const n = chars.length;
  const charAt = (place: number): string => chars[place - 1] ?? "";
  let j = at;
  while (j <= n && oneSpace.test(charAt(j))) {
    j += 1;
  }
  if (j > n) {
    return undefined;
  }

  const c = charAt(j);
  if (c === "{") {
    let depth = 0;
    let k = j;
    while (k <= n) {
      const d = charAt(k);
      if (d === "\\") {
        k += 2;
        continue;
      }

      if (d === "{") {
        depth += 1;
      } else if (d === "}") {
        depth -= 1;
        if (depth === 0) {
          return { braced: true, content: slice(text, j + 1, k - j - 1), endsAt: k + 1 };
        }
      }

      k += 1;
    }

    return undefined;
  }

  if (c === "}") {
    return undefined;
  }

  if (c === "\\") {
    const command = controlSequence.exec(suffix(text, j))?.[0];

    return command === undefined
      ? undefined
      : { braced: false, content: command, endsAt: j + lengthOf(command) };
  }

  return { braced: false, content: c, endsAt: j + 1 };
};

/**
 * The command `\frac`.
 */
const fracCommand = regex("\\\\frac(?![A-Za-z])", "gu");

/**
 * The command `\sqrt`.
 */
const sqrtCommand = regex("\\\\sqrt(?![A-Za-z])", "gu");

/**
 * T-5's argument bracing: the first `\frac` or `\sqrt` (an index `[n]` kept) whose arguments are
 * not written braced and side by side, so written; the spaces between them dropped. One rewrite a
 * pass.
 *
 * @param text - The text.
 * @returns It with that one command's arguments braced.
 */
const braced = (text: string): string => {
  for (let nth = 1; ; nth += 1) {
    const at = matchPlace(text, fracCommand, nth);
    if (at === 0) {
      break;
    }

    const a = argumentAt(text, at + 5);
    const b = a === undefined ? undefined : argumentAt(text, a.endsAt);
    if (a !== undefined && b !== undefined) {
      const canonical = `\\frac{${a.content}}{${b.content}}`;
      if (slice(text, at, b.endsAt - at) !== canonical) {
        return head(text, at - 1) + canonical + suffix(text, b.endsAt);
      }
    }
  }
  for (let nth = 1; ; nth += 1) {
    const at = matchPlace(text, sqrtCommand, nth);
    if (at === 0) {
      return text;
    }

    let j = at + 5;
    let k = j;
    let index = "";
    while (k <= lengthOf(text) && oneSpace.test(slice(text, k, 1))) {
      k += 1;
    }
    if (slice(text, k, 1) === "[") {
      const closing = placeOf(suffix(text, k), "]");
      if (closing === 0) {
        continue;
      }

      index = slice(text, k, closing);
      j = k + closing;
    }

    const a = argumentAt(text, j);
    if (a === undefined) {
      continue;
    }

    const canonical = `\\sqrt${index}{${a.content}}`;
    if (slice(text, at, a.endsAt - at) !== canonical) {
      return head(text, at - 1) + canonical + suffix(text, a.endsAt);
    }
  }
};

/**
 * A braced script.
 */
const bracedScript = regex("[\\^_]\\{[^{}]*\\}", "gu");

/**
 * A braced script, its operator and content captured.
 */
const bracedScriptParts = regex("([\\^_])\\{([^{}]*)\\}", "gu");

/**
 * T-5's unwrapping: each `^{t}` and `_{t}` of one token t becomes `^t`, `_t`, unless a letter after
 * a command would extend it.
 *
 * @param text - The text.
 * @returns It with each such script unwrapped.
 */
const scripts = (text: string): string => {
  const pieces = text.split(bracedScript);
  const matches = Array.from(text.matchAll(bracedScriptParts), (m) => ({
    content: m[2] ?? "",
    op: m[1] ?? "",
  }));
  if (matches.length === 0) {
    return text;
  }

  return (
    (pieces[0] ?? "") +
    matches
      .map(({ content, op }, k) => {
        const piece = pieces[k + 1] ?? "";
        const next = piece === "" ? (matches[k + 1]?.op ?? "") : head(piece, 1);
        const unwrapped =
          isOneToken(content) && !(head(content, 1) === "\\" && oneAsciiLetter.test(next));

        return (unwrapped ? op + content : `${op}{${content}}`) + piece;
      })
      .join("")
  );
};

/**
 * An empty `\sqrt{}` or `\sqrt[]{}`.
 */
const emptyRoot = regex("\\\\sqrt(?:\\[\\])?\\{\\}", "gu");

/**
 * An empty script.
 */
const emptyScript = regex("[\\^_]\\{\\}", "gu");

/**
 * T-9 empty templates: `\frac{}{}`, then `\sqrt{}` and `\sqrt[]{}`, then `^{}` and `_{}` are
 * deleted; then any other `{}` unless it follows `\`, `^` or `_`, or is a brace argument of a
 * `\frac` or `\sqrt` (deleted only with its command).
 *
 * @param input - The text.
 * @returns It without its empty templates.
 */
const withoutEmpty = (input: string): string => {
  const text = input.replaceAll("\\frac{}{}", "").replace(emptyRoot, "").replace(emptyScript, "");
  if (!text.includes("{}")) {
    return text;
  }

  const kept = new Set<number>();
  const keep = (argument: Argument | undefined): void => {
    if (argument?.braced === true) {
      kept.add(argument.endsAt - lengthOf(argument.content) - 2);
    }
  };
  for (let nth = 1; ; nth += 1) {
    const at = matchPlace(text, fracCommand, nth);
    if (at === 0) {
      break;
    }

    const a = argumentAt(text, at + 5);
    if (a === undefined) {
      continue;
    }

    keep(a);
    keep(argumentAt(text, a.endsAt));
  }
  for (let nth = 1; ; nth += 1) {
    const at = matchPlace(text, sqrtCommand, nth);
    if (at === 0) {
      break;
    }

    let j = at + 5;
    if (slice(text, j, 1) === "[") {
      const closing = placeOf(suffix(text, j), "]");
      if (closing > 0) {
        j += closing;
      }
    }

    keep(argumentAt(text, j));
  }
  const chars = charsOf(text);
  const charAt = (place: number): string | undefined => chars[place - 1];
  const escapes = (place: number): boolean => {
    const c = charAt(place);

    return c === "\\" || c === "^" || c === "_";
  };

  return chars
    .filter((c, i) => {
      const o = i + 1;
      const opens =
        c === "{" && charAt(o + 1) === "}" && !(o > 1 && escapes(o - 1)) && !kept.has(o);
      const closes =
        c === "}" &&
        o > 1 &&
        charAt(o - 1) === "{" &&
        !(o > 2 && escapes(o - 2)) &&
        !kept.has(o - 1);

      return !(opens || closes);
    })
    .join("");
};

/**
 * White space at either edge.
 */
const spaceEdges = regex(`^[${whiteSpace}]+|[${whiteSpace}]+$`, "gu");

/**
 * White space at the end.
 */
const trailingSpace = regex(`[${whiteSpace}]+$`, "u");

/**
 * White space at the start.
 */
const leadingSpace = regex(`^[${whiteSpace}]+`, "u");

/**
 * A fraction's part as T-6 writes it: its content less white space at either end, parenthesised
 * unless it is one numeral or one name.
 *
 * @param text - The part's content.
 * @returns Its print.
 */
const fractionPart = (text: string): string => {
  const trimmed = text.replace(spaceEdges, "");

  return isOneName(trimmed) ? trimmed : `(${trimmed})`;
};

/**
 * A text that ends where a term may start.
 */
const termOpening = regex("[(\\[{+\\-±=<>≤≥≠,]$", "u");

/**
 * A text that ends in a relation command.
 */
const relationCommandEnd = regex("\\\\(?:le|ge|ne)$", "u");

/**
 * Whether a term may start at place `at`, judged on the text before it, white space skipped: the
 * text's start, an opening bracket, `+`, `-`, `±`, `=`, a relation (a sign, or `\le`, `\ge`, `\ne`)
 * or `,`. T-6's mixed number and G's take this one condition.
 *
 * @param at - The place of the term's first character.
 * @param text - The text.
 * @returns Whether a term may start there.
 */
export const termStartsAt = (at: number, text: string): boolean => {
  const before = head(text, at - 1).replace(trailingSpace, "");

  return before === "" || termOpening.test(before) || relationCommandEnd.test(before);
};

/**
 * The longest run of digits, commas and white space at the end.
 */
const numeralTail = regex(`[0-9,${whiteSpace}]*$`, "u");

/**
 * One digit or comma, the whole text.
 */
const digitOrComma = regex("^[0-9,]$", "u");

/**
 * Three digits, the whole text.
 */
const threeDigits = regex("^[0-9]{3}$", "u");

/**
 * Whether a character is white space.
 *
 * @param c - The character, or none.
 * @returns Whether it is.
 */
const isSpaceChar = (c: string | undefined): boolean => c !== undefined && oneSpace.test(c);

/**
 * Whether a character is an ASCII digit.
 *
 * @param c - The character, or none.
 * @returns Whether it is.
 */
const isDigitChar = (c: string | undefined): boolean => c !== undefined && oneDigit.test(c);

/**
 * Which characters of a run are white space inside a numeral: a run of it between two digits.
 *
 * @param cs - The run's characters.
 * @returns Whether each is.
 */
const spacesInside = (cs: readonly string[]): readonly boolean[] => {
  const masked = cs.map(() => false);
  let i = 0;
  while (i < cs.length) {
    if (!isSpaceChar(cs[i])) {
      i += 1;
      continue;
    }

    let j = i;
    while (j < cs.length && isSpaceChar(cs[j])) {
      j += 1;
    }
    if (i > 0 && isDigitChar(cs[i - 1]) && isDigitChar(cs[j])) {
      masked.fill(true, i, j);
    }

    i = j;
  }

  return masked;
};

/**
 * Where a numeral's digits and its `,ddd` groups run to from a place: the place after them.
 *
 * @param w - The characters read.
 * @param wm - Which are white space inside a numeral.
 * @param from - The place, from 0.
 * @returns The place after the numeral's digits.
 */
const digitsEnd = (w: readonly string[], wm: readonly boolean[], from: number): number => {
  let q = from;
  while (q < w.length && (isDigitChar(w[q]) || wm[q] === true)) {
    q += 1;
  }
  while (
    w[q] === "," &&
    threeDigits.test(`${w[q + 1] ?? ""}${w[q + 2] ?? ""}${w[q + 3] ?? ""}`) &&
    !isDigitChar(w[q + 4])
  ) {
    q += 4;
  }

  return q;
};

/**
 * Where, reading a run of digits, commas and white space left to right as G's lexer reads numerals,
 * the numeral that ends exactly at `stop` starts; none where no numeral ends there.
 *
 * @param w - The run, then the characters after it.
 * @param wm - Which are white space inside a numeral.
 * @param stop - The place, from 0, after the run.
 * @returns The place, from 0, its numeral starts, or none.
 */
const numeralEnd = (
  w: readonly string[],
  wm: readonly boolean[],
  stop: number,
): number | undefined => {
  let pos = 0;
  while (pos < stop) {
    if (w[pos] === ",") {
      pos += 1;
      continue;
    }

    const q = digitsEnd(w, wm, pos);
    if (q === stop) {
      return pos;
    }

    if (q > stop) {
      return undefined;
    }

    pos = q;
  }

  return undefined;
};

/**
 * The place of the first character of the integer numeral whose last character is at `last`, as G's
 * lexer reads numerals left to right (digits, then each `,ddd` group no digit follows; a stray
 * comma skipped), white space between two of its digits inside it (`1 0` is the numeral 10,
 * starting at `1`), or none where the digits there are no such numeral's end, or a decimal's
 * fraction (a `.` before the numeral). `1,000` is one numeral; `3,2` is `3`, a list comma, then
 * `2`; `1 ,000` is `1`, white space, `,000`.
 *
 * @param last - The place of the numeral's last character.
 * @param text - The text.
 * @returns The place of its first character, or none.
 */
export const integerNumeralStart = (last: number, text: string): number | undefined => {
  const cs = charsOf(numeralTail.exec(head(text, last))?.[0] ?? "");
  const masked = spacesInside(cs);
  let r = cs.length;
  while (r > 0 && (digitOrComma.test(cs[r - 1] ?? "") || masked[r - 1] === true)) {
    r -= 1;
  }
  const after = charsOf(slice(text, last + 1, 5));
  const pos = numeralEnd(
    [...cs.slice(r), ...after],
    [...masked.slice(r), ...after.map(() => false)],
    cs.length - r,
  );
  if (pos === undefined) {
    return undefined;
  }

  const first = last - cs.length + r + pos + 1;

  return first > 1 && slice(text, first - 1, 1) === "." ? undefined : first;
};

/**
 * A character that, before a fraction, regroups it.
 */
const regroupingBefore = ")]}*/÷^_!%";

/**
 * A character that, after a fraction, regroups it.
 */
const regroupingAfter = regex("^[0-9^_!%]$", "u");

/**
 * One letter, the whole text.
 */
const oneLetter = regex("^\\p{L}$", "u");

/**
 * T-6's placing of a fraction a/b that replaces the text from place `at` to before `endsAt`, judged
 * on the text around it, white space skipped: (1) directly after an integer numeral that starts a
 * term, one space before it, a mixed number (`2\frac12` and `2 ½` are `2 1/2`); (2) wrapped as
 * (a/b) wherever left-to-right reading would regroup it, after a letter, any other digit, a closing
 * bracket, `*`, `/`, `÷`, `^`, `_`, `!` or `%`, or before a digit, `^`, `_`, `!` or `%`; (3)
 * otherwise a/b.
 *
 * @param text - The text.
 * @param at - The place the fraction's text starts.
 * @param endsAt - The place after it.
 * @param fraction - The fraction as a/b.
 * @returns The text with the fraction placed.
 */
const placed = (text: string, at: number, endsAt: number, fraction: string): string => {
  const front = head(text, at - 1);
  const back = suffix(text, endsAt);
  const kept = front.replace(trailingSpace, "");
  const before = tail(kept, 1);
  const after = head(back.replace(leadingSpace, ""), 1);
  if (oneDigit.test(before) && head(fraction, 1) !== "-") {
    const numeral = integerNumeralStart(lengthOf(kept), text);
    if (numeral !== undefined && termStartsAt(numeral, text)) {
      return `${kept} ${fraction}${back}`;
    }
  }

  return (before !== "" && regroupingBefore.includes(before)) ||
    oneDigit.test(before) ||
    regroupingAfter.test(after) ||
    (before !== "" && oneLetter.test(before))
    ? `${front}(${fraction})${back}`
    : front + fraction + back;
};

/**
 * T-6: the first innermost `\frac{a}{b}` (written braced, as T-5 writes it, and holding no `\frac`)
 * as a/b, a compound part parenthesised, placed. One rewrite a pass.
 *
 * @param text - The text.
 * @returns It with that one fraction written a/b.
 */
const fractions = (text: string): string => {
  for (let nth = 1; ; nth += 1) {
    const at = matchPlace(text, fracCommand, nth);
    if (at === 0) {
      return text;
    }

    const a = argumentAt(text, at + 5);
    const b = a === undefined ? undefined : argumentAt(text, a.endsAt);
    if (
      a === undefined ||
      b === undefined ||
      slice(text, at, b.endsAt - at) !== `\\frac{${a.content}}{${b.content}}` ||
      a.content.includes("\\frac") ||
      b.content.includes("\\frac")
    ) {
      continue;
    }

    return placed(text, at, b.endsAt, `${fractionPart(a.content)}/${fractionPart(b.content)}`);
  }
};

/**
 * A relation command with the white space around it.
 */
const relationCommand = regex(`[${whiteSpace}]*\\\\(?:ge|le|ne)(?![A-Za-z])[${whiteSpace}]*`, "gu");

/**
 * A relation command with the white space around it, its name captured.
 */
const relationCommandName = regex(
  `[${whiteSpace}]*\\\\(ge|le|ne)(?![A-Za-z])[${whiteSpace}]*`,
  "gu",
);

/**
 * T-3's relation commands: `\ge`, `\le` and `\ne` with no white space around them, and one space
 * after where the text after the white space starts with a letter.
 *
 * @param text - The text.
 * @returns It with each relation command so spaced.
 */
const relations = (text: string): string => {
  const pieces = text.split(relationCommand);
  const names = Array.from(text.matchAll(relationCommandName), (m) => m[1] ?? "");
  if (names.length === 0) {
    return text;
  }

  return (
    (pieces[0] ?? "") +
    names
      .map((name, k) => {
        const piece = pieces[k + 1] ?? "";

        return `\\${name}${oneAsciiLetter.test(head(piece, 1)) ? " " : ""}${piece}`;
      })
      .join("")
  );
};

/**
 * The vulgar fraction characters, each as a/b.
 */
const vulgarFractions = {
  "¼": "1/4",
  "½": "1/2",
  "¾": "3/4",
  "⅐": "1/7",
  "⅑": "1/9",
  "⅒": "1/10",
  "⅓": "1/3",
  "⅔": "2/3",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
} as const satisfies Readonly<Record<string, string>>;

/**
 * Whether a character is a vulgar fraction character.
 *
 * @param c - The character.
 * @returns Whether it is.
 */
const isVulgarFraction = (c: string): c is keyof typeof vulgarFractions =>
  Object.hasOwn(vulgarFractions, c);

/**
 * A vulgar fraction character.
 */
const vulgarFraction = regex("[\\u00bc-\\u00be\\u2150-\\u215e]", "gu");

/**
 * T-6's vulgar fractions: each of U+00BC-U+00BE and U+2150-U+215E as a/b, left to right, each
 * placed on the text as it stands at its turn.
 *
 * @param input - The text.
 * @returns It with every vulgar fraction written a/b.
 */
const vulgar = (input: string): string => {
  let text = input;
  for (;;) {
    const at = matchPlace(text, vulgarFraction, 1);
    if (at === 0) {
      return text;
    }

    const c = slice(text, at, 1);
    text = placed(text, at, at + 1, isVulgarFraction(c) ? vulgarFractions[c] : c);
  }
};

/**
 * A letter, combining mark or number, the whole text.
 */
const letterMarkOrNumber = regex("^[\\p{L}\\p{M}\\p{N}]$", "u");

/**
 * The symbols the math alphabet holds beside letters, marks, numbers and white space.
 */
const edgeSymbols = "+-*/÷=<>^_!%|±.,:;'′\"″°$€£¢";

/**
 * T-10 edge junk (V-28): the longest leading and trailing runs outside the math alphabet are
 * deleted, and the white space they leave at the edge. The alphabet: letters, combining marks (so
 * `i̇` keeps its dot) and numbers, White_Space, `+-*\/÷=<>^_!%|±.,:;'′"″°$€£¢`, a `\` before an
 * ASCII letter, and paired brackets, which pair by nesting whatever their kinds (`[1,6)` pairs; the
 * `]` of `10]` does not).
 *
 * @param text - The text.
 * @returns It without its edge junk.
 */
const withoutEdgeJunk = (text: string): string => {
  const cs = charsOf(text);
  const n = cs.length;
  if (n === 0) {
    return text;
  }

  const paired = cs.map(() => false);
  const open: number[] = [];
  for (const [i, c] of cs.entries()) {
    if (c === "(" || c === "[" || c === "{") {
      open.push(i);
    } else if (c === ")" || c === "]" || c === "}") {
      const opening = open.pop();
      if (opening !== undefined) {
        paired[i] = true;
        paired[opening] = true;
      }
    }
  }
  const inAlphabet = (i: number): boolean => {
    const c = cs[i] ?? "";

    return (
      paired[i] === true ||
      letterMarkOrNumber.test(c) ||
      oneSpace.test(c) ||
      (c !== "" && edgeSymbols.includes(c)) ||
      (c === "\\" && oneAsciiLetter.test(cs[i + 1] ?? ""))
    );
  };
  let lo = 0;
  while (lo < n && !inAlphabet(lo)) {
    lo += 1;
  }
  let hi = n - 1;
  while (hi >= lo && !inAlphabet(hi)) {
    hi -= 1;
  }
  if (lo === 0 && hi === n - 1) {
    return text;
  }

  const kept = cs.slice(lo, hi + 1).join("");
  const fromStart = lo > 0 ? kept.replace(leadingSpace, "") : kept;

  return hi < n - 1 ? fromStart.replace(trailingSpace, "") : fromStart;
};

/**
 * `\left` and `\right`, with the white space after them.
 */
const sizing = regex(`\\\\(?:left|right)(?![A-Za-z])[${whiteSpace}]*`, "gu");

/**
 * A run of thin spaces after a command and before a letter.
 */
const thinAfterCommand = regex("(\\\\[A-Za-z]+)(?:\\\\[,:;!])+(?=[A-Za-z])", "gu");

/**
 * A thin space.
 */
const thin = regex("\\\\[,:;!]", "gu");

/**
 * A quad.
 */
const quad = regex("\\\\(?:qquad|quad)(?![A-Za-z])", "gu");

/**
 * A zero-width character.
 */
const zeroWidth = regex("[\\u200b-\\u200d\\u2060\\ufeff]", "gu");

/**
 * `\dfrac` and `\tfrac`.
 */
const fracVariant = regex("\\\\(?:dfrac|tfrac)(?![A-Za-z])", "gu");

/**
 * `\cdot` and `\times`.
 */
const timesCommand = regex("\\\\(?:cdot|times)(?![A-Za-z])", "gu");

/**
 * A multiplication sign.
 */
const timesSign = regex("[\\u00d7\\u00b7\\u22c5\\u2219]", "gu");

/**
 * `\div`.
 */
const divCommand = regex("\\\\div(?![A-Za-z])", "gu");

/**
 * `\geq` and `\geqslant`.
 */
const geqCommand = regex("\\\\(?:geqslant|geq)(?![A-Za-z])", "gu");

/**
 * `\leq` and `\leqslant`.
 */
const leqCommand = regex("\\\\(?:leqslant|leq)(?![A-Za-z])", "gu");

/**
 * `\neq`.
 */
const neqCommand = regex("\\\\neq(?![A-Za-z])", "gu");

/**
 * `\lbrack`.
 */
const lbrackCommand = regex("\\\\lbrack(?![A-Za-z])", "gu");

/**
 * `\rbrack`.
 */
const rbrackCommand = regex("\\\\rbrack(?![A-Za-z])", "gu");

/**
 * A dash or minus sign.
 */
const dash = regex("[\\u2212\\u2010-\\u2014\\ufe63\\uff0d]", "gu");

/**
 * `=>` before a letter.
 */
const arrowGeBeforeLetter = regex("=>(?=[A-Za-z])", "gu");

/**
 * `=<` before a letter.
 */
const arrowLeBeforeLetter = regex("=<(?=[A-Za-z])", "gu");

/**
 * `\gt`.
 */
const gtCommand = regex("\\\\gt(?![A-Za-z])", "gu");

/**
 * `\lt`.
 */
const ltCommand = regex("\\\\lt(?![A-Za-z])", "gu");

/**
 * `≥` or `>=` before a letter.
 */
const geBeforeLetter = regex("(?:≥|>=)(?=[A-Za-z])", "gu");

/**
 * `≥` or `>=`.
 */
const geSign = regex("≥|>=", "gu");

/**
 * `≤` or `<=` before a letter.
 */
const leBeforeLetter = regex("(?:≤|<=)(?=[A-Za-z])", "gu");

/**
 * `≤` or `<=`.
 */
const leSign = regex("≤|<=", "gu");

/**
 * `≠` or `!=` before a letter.
 */
const neBeforeLetter = regex("(?:≠|!=)(?=[A-Za-z])", "gu");

/**
 * `≠` or `!=`.
 */
const neSign = regex("≠|!=", "gu");

/**
 * `π` before a letter.
 */
const piBeforeLetter = regex("π(?=[A-Za-z])", "gu");

/**
 * A degree, written any way.
 */
const degree = regex(
  "\\^\\{\\\\circ\\}|\\^\\\\circ(?![A-Za-z])|\\\\circ(?![A-Za-z])|\\\\degree(?![A-Za-z])|º",
  "gu",
);

/**
 * A double prime, written any way.
 */
const doublePrime = regex(
  "\\^\\{\\\\prime\\\\prime\\}|\\^\\\\prime\\\\prime(?![A-Za-z])|\\\\prime\\\\prime(?![A-Za-z])|''|”",
  "gu",
);

/**
 * A prime, written any way.
 */
const prime = regex("\\^\\{\\\\prime\\}|\\^\\\\prime(?![A-Za-z])|\\\\prime(?![A-Za-z])|’|'", "gu");

/**
 * A text command, its braced content captured.
 */
const textCommand = regex(
  `\\\\(?:text|textrm|mathrm|mathbf|mathit|operatorname|mbox)(?![A-Za-z])[${whiteSpace}]*\\{([^{}]*)\\}`,
  "gu",
);

/**
 * An operator, the white space around it.
 */
const spacedOperator = regex(`[${whiteSpace}]*([-+*/=<>\\u00f7])[${whiteSpace}]*`, "gu");

/**
 * An opening bracket, the white space after it.
 */
const spacedOpening = regex(`([(\\[{])[${whiteSpace}]+`, "gu");

/**
 * A closing bracket, the white space before it.
 */
const spacedClosing = regex(`[${whiteSpace}]+([\\])}])`, "gu");

/**
 * A leading `=`.
 */
const leadingEquals = regex("^=", "u");

/**
 * An `e.g.` frame in parentheses.
 */
const parenthesizedExample = regex(`^\\(e[.]g[.],?[${whiteSpace}]*(.*)\\)$`, "su");

/**
 * An `e.g.` frame.
 */
const example = regex(`^e[.]g[.],?[${whiteSpace}]*(.*)$`, "su");

/**
 * A final `.`, `,` or `;`.
 */
const finalPunctuation = regex("[.,;]$", "u");

/**
 * One pass: T-1 escapes; T-2 presentation commands (`\left` and `\right` with the white space after
 * them, `\,` `\:` `\;` `\!` deleted but for a run of them right after a command and before a
 * letter, one space, since a space terminates a control word; `\quad`, `\qquad`, `\ ` and `~` a
 * space; the zero-width characters deleted); T-3 synonyms (`⋅` and `∙` as `*`, `√` as `\sqrt`, `=>`
 * `=<` `\gt` `\lt`, the relations, π, ², ³, degree and prime symbols among them); T-4 unwrapping,
 * innermost first; T-9 empty templates; T-5 arguments; T-7 spacing; T-6 fractions (the vulgar
 * fraction characters first); T-8 answer punctuation (V-25: a leading `=`, an `e.g.` frame, a final
 * `.`, `,` or `;`); T-10 edge junk (V-28).
 *
 * @param input - The text.
 * @returns It after one pass.
 */
const pass = (input: string): string => {
  let t = input.replaceAll("\\\\", "\\").replaceAll("\\%", "%").replaceAll("\\$", "$");
  t = t.replace(sizing, "");
  t = t.replace(thinAfterCommand, "$1 ").replace(thin, "");
  t = t.replace(quad, " ").replaceAll("\\ ", " ").replaceAll("~", " ");
  t = t.replace(zeroWidth, "");
  t = t.replace(fracVariant, "\\frac");
  t = t.replace(timesCommand, "*").replace(timesSign, "*");
  t = t.replaceAll("√", "\\sqrt ");
  t = t.replace(divCommand, "÷");
  t = t.replace(geqCommand, "\\ge");
  t = t.replace(leqCommand, "\\le");
  t = t.replace(neqCommand, "\\ne");
  t = t.replace(lbrackCommand, "[").replace(rbrackCommand, "]");
  t = t.replace(dash, "-");
  t = t.replace(arrowGeBeforeLetter, "\\ge ").replaceAll("=>", "\\ge");
  t = t.replace(arrowLeBeforeLetter, "\\le ").replaceAll("=<", "\\le");
  t = t.replace(gtCommand, ">").replace(ltCommand, "<");
  t = t.replace(geBeforeLetter, "\\ge ").replace(geSign, "\\ge");
  t = t.replace(leBeforeLetter, "\\le ").replace(leSign, "\\le");
  t = t.replace(neBeforeLetter, "\\ne ").replace(neSign, "\\ne");
  t = relations(t);
  t = t.replace(piBeforeLetter, "\\pi ").replaceAll("π", "\\pi");
  t = t.replaceAll("²", "^2").replaceAll("³", "^3");
  t = t.replace(degree, "°");
  t = t.replace(doublePrime, "″");
  t = t.replace(prime, "′");
  t = t.replace(textCommand, "$1");
  t = withoutEmpty(t);
  t = scripts(braced(t));
  t = t.replace(spacedOperator, "$1");
  t = t.replace(spacedOpening, "$1").replace(spacedClosing, "$1");
  t = fractions(vulgar(t));
  t = t.replace(leadingEquals, "");
  t = t.replace(parenthesizedExample, "$1").replace(example, "$1");

  return withoutEdgeJunk(t.replace(finalPunctuation, ""));
};

/**
 * A text's TeX normal form: the passes' fixpoint.
 *
 * @param input - The text.
 * @returns Its normal form; empty where nothing is left.
 */
export const texNormal = (input: string): string => {
  let text = input;
  for (;;) {
    const next = pass(text);
    if (next === text) {
      return text;
    }

    text = next;
  }
};

/**
 * The `tex-normal` operator's registry entry.
 */
export const texNormalOperator = inlineOperator({
  apply: ([text]) => textValue("string", texNormal(text.value)),
  definition: `${alphaDefinitionPrefix}tex-normal`,
  operands: [{ form: "expression", name: "text", type: { base: "string", cardinality: "single" } }],
  result: { base: "string", cardinality: "single" },
});
