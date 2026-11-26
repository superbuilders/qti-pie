/**
 * `math-canonical(text, reduce)` (composable-operators.md §2.2 P7; grading-classification.md §3.1's
 * G and C, as revised 2026-11-20): the canonical form of the expression a text writes, serialised
 * as a prefix S-expression, or none when the text does not parse. G reads tex-normal's output.
 * Numerals with thousands commas; one precedence for `*`, `/`, `÷` and juxtaposition, left to
 * right; a leading sign over the whole product; an unbraced `^` or `_` argument is one TeX token
 * (`x^23` is x²·3), and `^` is right-associative; a `.` that is no decimal point is `*`; functions;
 * `(`/`[` tuples; a relation inside a group; clauses joined by and/or, or by "," between two
 * relations; any other top-level "," separates the members of an ordered list. Nothing is
 * evaluated: sums and products are n-ary, flattened and sorted by the code points of their
 * operands' prints, and a numeral prints as ECMAScript's String of its binary64 value (-0 as -0).
 * `reduce` is C6's switch: true where the item asks for no form.
 *
 * This is the SQL grader's `p3.math_canonical` ported literally, function by function; the
 * differential against it on every LaTeX key and box row is its oracle.
 *
 * @module
 */
import { regex } from "arkregex";
import { greekLetters, isGreekCommand } from "#processing/alpha/greek.ts";
import { withoutTrailingZeros } from "#processing/alpha/operators/numeral-normal.ts";
import {
  integerNumeralStart,
  termStartsAt,
  texNormal,
} from "#processing/alpha/operators/tex-normal.ts";
import {
  byCodePoints,
  charsOf,
  head,
  lengthOf,
  suffix,
  tail,
  whiteSpace,
} from "#processing/alpha/text.ts";
import { switchLiteral } from "#processing/alpha/literals.ts";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import type { Value } from "#processing/value.ts";
import { textValue } from "#processing/value.ts";

/**
 * A numeral as a canonical form prints it: ECMAScript's String(x), but -0 as -0.
 *
 * @param value - The numeral's value.
 * @returns Its print.
 */
const numeralPrint = (value: number): string => (Object.is(value, -0) ? "-0" : String(value));

/**
 * A digit or a point, the whole text.
 */
const digitOrPoint = regex("^[0-9.]$", "u");

/**
 * One digit, the whole text.
 */
const oneDigit = regex("^[0-9]$", "u");

/**
 * White space between two numeral characters.
 */
const spaceInNumeral = regex(`[0-9.][${whiteSpace}]+[0-9.]`, "u");

/**
 * Runs of white space, and runs of anything else.
 */
const spaceRuns = regex(`[${whiteSpace}]+|[^${whiteSpace}]+`, "gu");

/**
 * A white space run.
 */
const spaceFirst = regex(`^[${whiteSpace}]`, "u");

/**
 * A fraction of two integer numerals, its numerator not zero, nothing bound after it.
 */
const unboundFraction = regex(
  `^(?=[0-9,]*[1-9])[0-9]+(?:,[0-9]{3})*[/÷][0-9]+(?:,[0-9]{3})*(?![0-9.]|[${whiteSpace}]*[\\^_!%])`,
  "u",
);

/**
 * G's numerals: white space inside a numeral is a slip, so a run of it between two digits, a digit
 * and a decimal point, or a decimal point and a digit is deleted; two numerals are never
 * juxtaposed. The one run kept is G's mixed number's: after an integer numeral that starts a term,
 * before a fraction of two integer numerals whose numerator is not zero and with nothing bound
 * after it (`1 0 1/2` is 10½, `1 0/3` is 10/3). Each run is judged on the text as written; a run
 * between two points stays.
 *
 * @param text - The text.
 * @returns It with its numerals' white space read.
 */
const numeralSpaces = (text: string): string => {
  if (!spaceInNumeral.test(text)) {
    return text;
  }

  const pieces = Array.from(text.matchAll(spaceRuns), (m) => m[0]);
  let endsAt = 1;

  return pieces
    .map((piece, o) => {
      endsAt += lengthOf(piece);
      const before = o > 0 ? tail(pieces[o - 1] ?? "", 1) : undefined;
      const after = o + 1 < pieces.length ? head(pieces[o + 1] ?? "", 1) : undefined;
      if (
        !spaceFirst.test(piece) ||
        (before !== undefined && !digitOrPoint.test(before)) ||
        (after !== undefined && !digitOrPoint.test(after)) ||
        (before === "." && after === ".")
      ) {
        return piece;
      }

      if (before !== undefined && oneDigit.test(before)) {
        const start = integerNumeralStart(endsAt - lengthOf(piece) - 1, text);
        if (
          start !== undefined &&
          termStartsAt(start, text) &&
          unboundFraction.test(suffix(text, endsAt))
        ) {
          return piece;
        }
      }

      return "";
    })
    .join("");
};

/**
 * One ASCII letter, the whole text.
 */
const oneAsciiLetter = regex("^[A-Za-z]$", "u");

/**
 * One letter, the whole text.
 */
const oneLetter = regex("^\\p{L}$", "u");

/**
 * G's decimal points: a `.` is one only when a digit follows it and the character before it, if
 * any, is not a letter, a closing bracket or `.`; every other `.` is `*`, which G admits only
 * between two operands (`t.4` is t·4). Each `.` is judged on the text as written.
 *
 * @param text - The text.
 * @returns It with every `.` that is no decimal point written `*`.
 */
const points = (text: string): string => {
  if (!text.includes(".")) {
    return text;
  }

  const cs = charsOf(text);

  return cs
    .map((c, i) => {
      if (c !== ".") {
        return c;
      }

      const next = cs[i + 1];
      const previous = cs[i - 1];
      const decimal =
        next !== undefined &&
        oneDigit.test(next) &&
        !(
          previous !== undefined &&
          (")]}.".includes(previous) || oneAsciiLetter.test(previous) || oneLetter.test(previous))
        );

      return decimal ? c : "*";
    })
    .join("");
};

/**
 * What G reads a token as.
 */
type TokenKind = "fn" | "joiner" | "name" | "num" | "op" | "rel" | "sqrt";

/**
 * A token of G's reading: its kind, its value (a numeral without its commas, a letter, a symbol, a
 * name) and its text.
 */
interface Token {
  readonly kind: TokenKind;
  readonly raw: string;
  readonly v: string;
}

/**
 * G's lexemes, each the longest at its place.
 */
const lexemes = regex(
  `[${whiteSpace}]+|[0-9]+(?:,[0-9]{3}(?![0-9]))*(?:[.][0-9]+)?|[.][0-9]+|[A-Za-z]+|\\\\[A-Za-z]+|\\\\ |.`,
  "gsu",
);

/**
 * A numeral or a point first.
 */
const numeralFirst = regex("^[0-9.]", "u");

/**
 * A digit first.
 */
const digitFirst = regex("^[0-9]", "u");

/**
 * A numeral, its commas removed.
 */
const plainNumeral = regex("^(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+)$", "u");

/**
 * A letter first.
 */
const asciiLetterFirst = regex("^[A-Za-z]", "u");

/**
 * One Greek letter, the whole text.
 */
const oneGreekLetter = regex(
  "^[\\u0391-\\u03a1\\u03a3-\\u03a9\\u03b1-\\u03c9\\u03d1\\u03d5\\u03d6\\u03f1\\u03f5]$",
  "u",
);

/**
 * The Greek variant letters, each as the letter it varies.
 */
const greekVariants = {
  ϑ: "θ",
  ϕ: "φ",
  ϖ: "π",
  ϱ: "ρ",
  ϵ: "ε",
} as const satisfies Readonly<Record<string, string>>;

/**
 * Whether a letter is a Greek variant.
 *
 * @param letter - The letter.
 * @returns Whether it is.
 */
const isGreekVariant = (letter: string): letter is keyof typeof greekVariants =>
  Object.hasOwn(greekVariants, letter);

/**
 * The functions written as letters alone.
 */
const plainFunctions: ReadonlySet<string> = new Set(["sin", "cos", "tan", "log", "ln"]);

/**
 * The functions written as commands.
 */
const functionCommands: ReadonlySet<string> = new Set([
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "arcsin",
  "arccos",
  "arctan",
  "log",
  "ln",
  "exp",
]);

/**
 * The sizing commands, and `\ `, read as nothing.
 */
const skippedCommands: ReadonlySet<string> = new Set([
  " ",
  "big",
  "Big",
  "bigg",
  "Bigg",
  "bigl",
  "bigr",
  "Bigl",
  "Bigr",
  "biggl",
  "biggr",
  "Biggl",
  "Biggr",
  "middle",
]);

/**
 * The relation commands, each as its sign.
 */
const relationCommands = {
  ge: "≥",
  geq: "≥",
  geqslant: "≥",
  le: "≤",
  leq: "≤",
  leqslant: "≤",
  ne: "≠",
  neq: "≠",
} as const satisfies Readonly<Record<string, string>>;

/**
 * Whether a command name is a relation command.
 *
 * @param name - The name.
 * @returns Whether it is.
 */
const isRelationCommand = (name: string): name is keyof typeof relationCommands =>
  Object.hasOwn(relationCommands, name);

/**
 * The relation signs.
 */
const relationSigns: ReadonlySet<string> = new Set(["=", "<", ">", "≠", "≤", "≥"]);

/**
 * The operator characters.
 */
const operatorCharacters = "+-*/÷^_%!|()[]{},";

/**
 * A token of a kind whose value is its text.
 *
 * @param kind - Its kind.
 * @param v - Its value and text.
 * @returns The token.
 */
const token = (kind: TokenKind, v: string): Token => ({ kind, raw: v, v });

/**
 * The tokens of a run of ASCII letters: the joiner and/or in any case, a plain function name, or
 * one name per letter.
 *
 * @param letters - The run.
 * @returns Its tokens.
 */
const letterTokens = (letters: string): readonly Token[] => {
  const lower = letters.toLowerCase();
  if (lower === "and" || lower === "or") {
    return [token("joiner", lower)];
  }

  return plainFunctions.has(letters)
    ? [token("fn", letters)]
    : charsOf(letters).map((letter) => token("name", letter));
};

/**
 * The tokens of a command: a Greek letter's, `\sqrt`, a function, a relation command, or a skipped
 * command (none); no reading for any other.
 *
 * @param name - The command's name, its backslash removed.
 * @returns Its tokens, or none.
 */
const commandTokens = (name: string): readonly Token[] | undefined => {
  if (skippedCommands.has(name)) {
    return [];
  }

  if (isGreekCommand(name)) {
    return [token("name", greekLetters[name])];
  }

  if (name === "sqrt") {
    return [token("sqrt", name)];
  }

  if (functionCommands.has(name)) {
    return [token("fn", name)];
  }

  return isRelationCommand(name) ? [token("rel", relationCommands[name])] : undefined;
};

/**
 * The tokens of one lexeme that is no numeral and no white space: letters, a Greek letter, a
 * command, a relation or an operator; no reading for any other character.
 *
 * @param lx - The lexeme.
 * @returns Its tokens, or none.
 */
const symbolTokens = (lx: string): readonly Token[] | undefined => {
  if (asciiLetterFirst.test(lx)) {
    return letterTokens(lx);
  }

  if (oneGreekLetter.test(lx)) {
    return [token("name", isGreekVariant(lx) ? greekVariants[lx] : lx)];
  }

  if (head(lx, 1) === "\\") {
    return commandTokens(suffix(lx, 2));
  }

  if (relationSigns.has(lx)) {
    return [token("rel", lx)];
  }

  return operatorCharacters.includes(lx) ? [token("op", lx)] : undefined;
};

/**
 * G's tokens, or none where the text holds a character or command G does not read. The text is read
 * as its lexemes, its `.`s read first: white space; a numeral (digits, then every `,ddd` not
 * followed by a digit, then a decimal fraction; or a decimal fraction alone; its value has no
 * commas); a run of ASCII letters; `\` with letters or `\ `; any other single character. Right
 * after `^` or `_`, a numeral is one TeX token, its first digit, and the rest of it is read again
 * on its own after it; white space and a skipped command keep that reading.
 *
 * @param text - The text.
 * @returns Its tokens, or none.
 */
const tokensOf = (text: string): readonly Token[] | undefined => {
  const out: Token[] = [];
  let afterScript = false;
  for (const match of points(text).matchAll(lexemes)) {
    const [lx] = match;
    if (spaceFirst.test(lx)) {
      continue;
    }

    let read: readonly Token[] | undefined;
    if (!numeralFirst.test(lx)) {
      read = symbolTokens(lx);
    } else if (afterScript && digitFirst.test(lx)) {
      const rest = lengthOf(lx) > 1 ? tokensOf(suffix(lx, 2)) : [];
      read = rest === undefined ? undefined : [token("num", head(lx, 1)), ...rest];
    } else {
      const v = lx.replaceAll(",", "");
      read = plainNumeral.test(v) ? [{ kind: "num", raw: lx, v }] : undefined;
    }

    if (read === undefined) {
      return undefined;
    }

    for (const each of read) {
      out.push(each);
    }

    const [only] = read;
    if (read.length > 0 || !skippedCommands.has(suffix(lx, 2))) {
      afterScript = read.length === 1 && only?.kind === "op" && (only.v === "^" || only.v === "_");
    }
  }

  return out;
};

/**
 * The kinds of node whose print is all a later rule reads.
 */
type PrintedKind =
  | "abs"
  | "div"
  | "fact"
  | "fn"
  | "name"
  | "neg"
  | "pct"
  | "pow"
  | "rel"
  | "root"
  | "tuple";

/**
 * A canonical expression as G makes it: its kind and its print, and what a later rule reads of it.
 */
type MathNode =
  | { readonly kind: "frac"; readonly p: bigint; readonly q: bigint; readonly ser: string }
  | {
      readonly kind: "mixed";
      readonly neg: boolean;
      readonly p: bigint;
      readonly q: bigint;
      readonly ser: string;
      readonly whole: bigint;
    }
  | {
      readonly kind: "num";
      readonly num: number;
      readonly ser: string;
      readonly whole: bigint | undefined;
    }
  | { readonly kind: "prod" | "sum"; readonly operands: readonly string[]; readonly ser: string }
  | { readonly kind: PrintedKind; readonly ser: string };

/**
 * A node read, and the place of the token after it.
 */
interface Reading {
  readonly next: number;
  readonly node: MathNode;
}

/**
 * A node of a kind whose print is all a later rule reads.
 *
 * @param kind - Its kind.
 * @param ser - Its print.
 * @returns The node.
 */
const printed = (kind: PrintedKind, ser: string): MathNode => ({ kind, ser });

/**
 * The magnitude of an integer.
 *
 * @param n - The integer.
 * @returns Its magnitude.
 */
const magnitude = (n: bigint): bigint => (n < 0n ? -n : n);

/**
 * The sign of an integer.
 *
 * @param n - The integer.
 * @returns -1, 0 or 1.
 */
const signOf = (n: bigint): bigint => {
  if (n > 0n) {
    return 1n;
  }

  return n < 0n ? -1n : 0n;
};

/**
 * The greatest common divisor of two integers, not negative.
 *
 * @param a - One integer.
 * @param b - The other.
 * @returns Their greatest common divisor.
 */
const gcd = (a: bigint, b: bigint): bigint => {
  let x = magnitude(a);
  let y = magnitude(b);
  while (y !== 0n) {
    [x, y] = [y, x % y];
  }

  return x;
};

/**
 * C6 (V-27): a fraction's print. With reduce, (q p q), its reduced p/q (q > 0, gcd 1) with its sign
 * in p; without, as written, (/ a b).
 *
 * @param numerator - Its numerator.
 * @param denominator - Its denominator, not 0.
 * @param reduce - C6's switch.
 * @returns Its print.
 */
const fractionPrint = (numerator: bigint, denominator: bigint, reduce: boolean): string => {
  if (!reduce) {
    return `(/ ${String(numerator)} ${String(denominator)})`;
  }

  const p = numerator * signOf(denominator);
  const q = magnitude(denominator);
  const d = gcd(p, q);

  return `(q ${String(p / d)} ${String(q / d)})`;
};

/**
 * C6 (V-27): a mixed number's print, its own node, (mixed w p q) or (mixed -w p q), the sign over
 * the whole and, with reduce, p/q reduced.
 *
 * @param whole - Its whole part.
 * @param numerator - Its numerator.
 * @param denominator - Its denominator, not 0.
 * @param negative - Whether it is negative.
 * @param reduce - C6's switch.
 * @returns Its print.
 */
const mixedPrint = (
  whole: bigint,
  numerator: bigint,
  denominator: bigint,
  negative: boolean,
  reduce: boolean,
): string => {
  const d = gcd(numerator, denominator);
  const parts = reduce
    ? `${String(numerator / d)} ${String(denominator / d)}`
    : `${String(numerator)} ${String(denominator)}`;

  return `(mixed ${negative ? "-" : ""}${String(whole)} ${parts})`;
};

/**
 * A numeral's node.
 *
 * @param value - Its value.
 * @param whole - Its exact integer, where it is an integer numeral.
 * @returns The node.
 */
const numeral = (value: number, whole: bigint | undefined): MathNode => ({
  kind: "num",
  num: value,
  ser: numeralPrint(value),
  whole,
});

/**
 * A sign applied to a term: a numeral takes it into its value, a fraction into its numerator, a
 * mixed number whole; anything else is negated whole.
 *
 * @param negative - Whether the sign is negative.
 * @param e - The term.
 * @param reduce - C6's switch.
 * @returns The signed term.
 */
const signed = (negative: boolean, e: MathNode, reduce: boolean): MathNode => {
  if (!negative) {
    return e;
  }

  switch (e.kind) {
    case "num": {
      return numeral(-e.num, e.whole === undefined ? undefined : -e.whole);
    }
    case "frac": {
      return { kind: "frac", p: -e.p, q: e.q, ser: fractionPrint(-e.p, e.q, reduce) };
    }
    case "mixed": {
      return { ...e, neg: !e.neg, ser: mixedPrint(e.whole, e.p, e.q, !e.neg, reduce) };
    }
    case "abs":
    case "div":
    case "fact":
    case "fn":
    case "name":
    case "neg":
    case "pct":
    case "pow":
    case "prod":
    case "rel":
    case "root":
    case "sum":
    case "tuple": {
      return printed("neg", `(- ${e.ser})`);
    }
  }
};

/**
 * A sum's or product's operands, flattened, as the n-ary node prints them: sorted by their prints'
 * code points.
 *
 * @param kind - A sum or a product.
 * @param operands - Its operands' prints.
 * @returns The node.
 */
const flat = (kind: "prod" | "sum", operands: readonly string[]): MathNode => ({
  kind,
  operands,
  ser: `(${kind === "sum" ? "+" : "*"} ${operands.toSorted(byCodePoints).join(" ")})`,
});

/**
 * An n-ary node's operands with another's appended: a node of the same kind adds its operands,
 * flattened.
 *
 * @param kind - The node's kind.
 * @param operands - Its operands so far, or none where its first is still a node of its own.
 * @param first - Its first operand.
 * @param next - The operand appended.
 * @returns The operands.
 */
const appended = (
  kind: "prod" | "sum",
  operands: readonly string[] | undefined,
  first: MathNode,
  next: MathNode,
): readonly string[] => {
  const start = operands ?? (first.kind === kind ? first.operands : [first.ser]);

  return [...start, ...(next.kind === kind ? next.operands : [next.ser])];
};

/**
 * A clause's print, from its sides' prints and its relations in written order: a relation mirrored
 * where it reads only < and ≤ (as > and ≥); one = or ≠ with its sides sorted, a chain of = all of
 * them; any other chain in written order; no relation, the one side.
 *
 * @param sides - Its sides' prints, in order.
 * @param relations - Its relations, in order.
 * @returns Its print.
 */
const clausePrint = (sides: readonly string[], relations: readonly string[]): string => {
  if (relations.length === 0) {
    return sides[0] ?? "";
  }

  const mirrored = relations.every((r) => r === "<" || r === "≤");
  const ss = mirrored ? sides.toReversed() : sides;
  const rs = mirrored ? relations.toReversed().map((r) => (r === "<" ? ">" : "≥")) : relations;
  const [first = "", second = ""] = ss;
  if (rs.length === 1) {
    const [r = ""] = rs;
    if (r !== "=" && r !== "≠") {
      return `(${r} ${first} ${second})`;
    }

    const [low, high] = byCodePoints(first, second) <= 0 ? [first, second] : [second, first];

    return `(${r} ${low} ${high})`;
  }

  if (rs.every((r) => r === "=")) {
    return `(= ${ss.toSorted(byCodePoints).join(" ")})`;
  }

  return `(chain ${first}${rs.map((r, k) => ` ${r} ${ss[k + 1] ?? ""}`).join("")})`;
};

/**
 * An integer numeral as written, its commas among it.
 */
const integerNumeral = regex("^[0-9,]+$", "u");

/**
 * An integer numeral's value, its commas removed.
 *
 * @param raw - The numeral as written.
 * @returns Its value.
 */
const integerOf = (raw: string): bigint => BigInt(raw.replaceAll(",", ""));

/**
 * Whether a token is an integer numeral.
 *
 * @param tk - The token.
 * @returns Whether it is.
 */
const isIntegerToken = (tk: Token | undefined): tk is Token =>
  tk?.kind === "num" && integerNumeral.test(tk.raw);

/**
 * An operator token.
 */
type OpToken = Token & { readonly kind: "op" };

/**
 * Whether a token is an operator of one of the given values.
 *
 * @param tk - The token.
 * @param values - The values, each one character.
 * @returns Whether it is.
 */
const isOp = (tk: Token | undefined, values: string): tk is OpToken =>
  tk?.kind === "op" && values.includes(tk.v);

/**
 * Each opening bracket's closing one.
 */
const closingOf = { "(": ")", "[": "]", "{": "}" } as const;

/**
 * Whether a character is an opening bracket.
 *
 * @param c - The character.
 * @returns Whether it is.
 */
const isOpening = (c: string): c is keyof typeof closingOf => Object.hasOwn(closingOf, c);

/**
 * Whether a token starts a factor juxtaposed with the one before it: a numeral, a name, a root, a
 * function, an opening bracket, or a bar where no absolute value is open.
 *
 * @param tk - The token.
 * @param absDepth - The open absolute values.
 * @returns Whether it does.
 */
const juxtaposes = (tk: Token | undefined, absDepth: number): boolean =>
  tk?.kind === "num" ||
  tk?.kind === "name" ||
  tk?.kind === "sqrt" ||
  tk?.kind === "fn" ||
  isOp(tk, "([{") ||
  (isOp(tk, "|") && absDepth === 0);

/**
 * A token as a clause separator: a joiner, or `,`; none for any other.
 *
 * @param tk - The token.
 * @returns The separator, or none.
 */
const separatorOf = (tk: Token | undefined): string | undefined => {
  if (tk?.kind === "joiner") {
    return tk.v;
  }

  return isOp(tk, ",") ? "," : undefined;
};

/**
 * A run of signs read: whether an odd count of them is minus, whether there was any, and the place
 * after it.
 */
interface Signs {
  readonly any: boolean;
  readonly negative: boolean;
  readonly next: number;
}

/**
 * A clause: its sides' prints and its relations in written order, and the place after it.
 */
interface Clause {
  readonly next: number;
  readonly relations: readonly string[];
  readonly sides: readonly string[];
}

/**
 * G's reading of a text's tokens, with C6's switch: each reader takes a place, from 1, and gives
 * the node read there and the place after it, or none where the tokens do not parse. The one
 * recursion is into a nested construct (a group, an absolute value, a function's argument, a
 * relation's side), so a text's nesting depth is the recursion's. `absDepth` counts the open
 * absolute values a bar may close; a group's content starts with none open.
 */
class Reader {
  readonly #reduce: boolean;
  readonly #toks: readonly Token[];

  /**
   * A reader of tokens.
   *
   * @param toks - The tokens.
   * @param reduce - C6's switch.
   */
  constructor(toks: readonly Token[], reduce: boolean) {
    this.#toks = toks;
    this.#reduce = reduce;
  }

  /**
   * The token at a place; none past the end.
   *
   * @param place - The place.
   * @returns The token.
   */
  at(place: number): Token | undefined {
    return this.#toks[place - 1];
  }

  /**
   * The run of signs at a place: whether an odd count of them is minus, whether there was any, and
   * the place after.
   *
   * @param start - The place.
   * @returns The signs read.
   */
  signsAt(start: number): Signs {
    let next = start;
    let negative = false;
    for (let tk = this.at(next); isOp(tk, "+-"); tk = this.at(next)) {
      negative = tk.v === "-" ? !negative : negative;
      next += 1;
    }

    return { any: next > start, negative, next };
  }

  /**
   * `^`'s argument at a place: a group, or one TeX token, a digit (the lexer's first digit) or a
   * letter or Greek letter; none for anything else.
   *
   * @param at - The place.
   * @returns The argument, or none.
   */
  scriptAt(at: number): Reading | undefined {
    const tk = this.at(at);
    if (isOp(tk, "([{")) {
      return this.groupAt(at);
    }

    if (tk?.kind === "num" && digitFirst.test(tk.raw)) {
      const digit = head(tk.raw, 1);

      return { next: at + 1, node: numeral(Number(digit), BigInt(digit)) };
    }

    return tk?.kind === "name" ? { next: at + 1, node: printed("name", tk.v) } : undefined;
  }

  /**
   * A name and its subscript, read after the name's token: a `_` with one token (a digit, a letter)
   * or a group of letters and digits; the name alone where no `_` follows.
   *
   * @param name - The name.
   * @param after - The place after the name's token.
   * @returns The name, or none where its subscript does not parse.
   */
  subscripted(name: string, after: number): Reading | undefined {
    if (!isOp(this.at(after), "_")) {
      return { next: after, node: printed("name", name) };
    }

    const sub = this.at(after + 1);
    if (sub?.kind === "num") {
      return digitFirst.test(sub.raw)
        ? { next: after + 2, node: printed("name", `${name}_${head(sub.raw, 1)}`) }
        : undefined;
    }

    if (sub?.kind === "name") {
      return { next: after + 2, node: printed("name", `${name}_${sub.v}`) };
    }

    if (!isOp(sub, "{")) {
      return undefined;
    }

    let j = after + 2;
    let written = "";
    for (let tk = this.at(j); tk?.kind === "num" || tk?.kind === "name"; tk = this.at(j)) {
      written += tk.kind === "num" ? tk.raw : tk.v;
      j += 1;
    }

    return written !== "" && isOp(this.at(j), "}")
      ? { next: j + 1, node: printed("name", `${name}_{${written}}`) }
      : undefined;
  }

  /**
   * A function's application, read after its token: a `^` and its argument, then the factor it
   * applies to; `\sin^2 x` is (sin x)².
   *
   * @param name - The function's name.
   * @param after - The place after its token.
   * @param absDepth - The open absolute values.
   * @returns The application, or none.
   */
  applied(name: string, after: number, absDepth: number): Reading | undefined {
    const hasPower = isOp(this.at(after), "^");
    const power = hasPower ? this.scriptAt(after + 1) : undefined;
    if (hasPower && power === undefined) {
      return undefined;
    }

    const argument = this.factorAt(power?.next ?? after, absDepth);
    if (argument === undefined) {
      return undefined;
    }

    const application = `(${name} ${argument.node.ser})`;

    return {
      next: argument.next,
      node:
        power === undefined
          ? printed("fn", application)
          : printed("pow", `(^ ${application} ${power.node.ser})`),
    };
  }

  /**
   * A root, read after `\sqrt`: an optional `[n]` index, then a braced radicand.
   *
   * @param after - The place after `\sqrt`.
   * @returns The root, or none.
   */
  rooted(after: number): Reading | undefined {
    const hasIndex = isOp(this.at(after), "[");
    const index = hasIndex ? this.groupAt(after) : undefined;
    if (hasIndex && index === undefined) {
      return undefined;
    }

    const at = index?.next ?? after;
    const radicand = isOp(this.at(at), "{") ? this.groupAt(at) : undefined;
    if (radicand === undefined) {
      return undefined;
    }

    const indexPrint = index === undefined ? "" : `${index.node.ser} `;

    return { next: radicand.next, node: printed("root", `(√ ${indexPrint}${radicand.node.ser})`) };
  }

  /**
   * An absolute value, read after its opening bar: a sum with one more absolute value open, then
   * its closing bar.
   *
   * @param after - The place after the opening bar.
   * @param absDepth - The open absolute values outside it.
   * @returns The absolute value, or none.
   */
  absolute(after: number, absDepth: number): Reading | undefined {
    const inner = this.sumAt(after, absDepth + 1);

    return inner !== undefined && isOp(this.at(inner.next), "|")
      ? { next: inner.next + 1, node: printed("abs", `(| ${inner.node.ser})`) }
      : undefined;
  }

  /**
   * A primary at a place: a numeral, a name, a function's application, a root, a group, or an
   * absolute value.
   *
   * @param at - The place.
   * @param absDepth - The open absolute values.
   * @returns The primary, or none.
   */
  primaryAt(at: number, absDepth: number): Reading | undefined {
    const tk = this.at(at);
    switch (tk?.kind) {
      case "num": {
        return {
          next: at + 1,
          node: numeral(Number(tk.v), integerNumeral.test(tk.raw) ? integerOf(tk.raw) : undefined),
        };
      }
      case "name": {
        return this.subscripted(tk.v, at + 1);
      }
      case "fn": {
        return this.applied(tk.v, at + 1, absDepth);
      }
      case "sqrt": {
        return this.rooted(at + 1);
      }
      case "op": {
        if (isOp(tk, "([{")) {
          return this.groupAt(at);
        }

        return isOp(tk, "|") ? this.absolute(at + 1, absDepth) : undefined;
      }
      case "joiner":
      case "rel":
      case undefined: {
        return undefined;
      }
    }
  }

  /**
   * A run of `^` and their arguments from a place, right-associative: `^ e1 ^ e2` is pow(f, pow(e1,
   * e2)).
   *
   * @param base - The node powered.
   * @param at - The place of the first `^`.
   * @returns The power, or none.
   */
  powered(base: MathNode, at: number): Reading | undefined {
    const exponents: string[] = [];
    let j = at;
    while (isOp(this.at(j), "^")) {
      const power = this.scriptAt(j + 1);
      if (power === undefined) {
        return undefined;
      }

      exponents.push(power.node.ser);
      j = power.next;
    }
    const inner = exponents
      .slice(0, -1)
      .map((x) => `(^ ${x} `)
      .join("");
    const last = exponents.at(-1) ?? "";

    return {
      next: j,
      node: printed("pow", `(^ ${base.ser} ${inner}${last}${")".repeat(exponents.length)}`),
    };
  }

  /**
   * A factor at a place: a primary and its postfix `%` and `!`, and one run of `^`; none where a
   * second run follows.
   *
   * @param at - The place.
   * @param absDepth - The open absolute values.
   * @returns The factor, or none.
   */
  factorAt(at: number, absDepth: number): Reading | undefined {
    let read = this.primaryAt(at, absDepth);
    let isPowered = false;
    while (read !== undefined) {
      const tk = this.at(read.next);
      if (isOp(tk, "%")) {
        read = { next: read.next + 1, node: printed("pct", `(% ${read.node.ser})`) };
      } else if (isOp(tk, "!")) {
        read = { next: read.next + 1, node: printed("fact", `(! ${read.node.ser})`) };
      } else if (isOp(tk, "^")) {
        read = isPowered ? undefined : this.powered(read.node, read.next);
        isPowered = true;
      } else {
        return read;
      }
    }

    return undefined;
  }

  /**
   * A term's first factor, a mixed number where it is one (C6): a non-negative integer numeral,
   * then an integer numeral, `/` or `÷`, and an integer numeral not 0, with no `^ ! % _` after it.
   *
   * @param read - The first factor.
   * @returns The factor, a mixed number where it is one.
   */
  mixedFrom(read: Reading): Reading {
    const { next, node } = read;
    if (node.kind !== "num" || node.whole === undefined || node.whole < 0n) {
      return read;
    }

    const numerator = this.at(next);
    const denominator = this.at(next + 2);
    if (
      !isIntegerToken(numerator) ||
      !isOp(this.at(next + 1), "/÷") ||
      !isIntegerToken(denominator) ||
      integerOf(denominator.raw) === 0n ||
      isOp(this.at(next + 3), "^!%_")
    ) {
      return read;
    }

    const p = integerOf(numerator.raw);
    const q = integerOf(denominator.raw);
    const ser = mixedPrint(node.whole, p, q, false, this.#reduce);

    return { next: next + 3, node: { kind: "mixed", neg: false, p, q, ser, whole: node.whole } };
  }

  /**
   * A division's node: a fraction where both sides are integer numerals and the divisor is not 0
   * (C6), its sign in the numerator; any other division stands, unreordered.
   *
   * @param dividend - The dividend.
   * @param divisor - The divisor.
   * @returns The node.
   */
  divided(dividend: MathNode, divisor: MathNode): MathNode {
    if (
      dividend.kind === "num" &&
      divisor.kind === "num" &&
      dividend.whole !== undefined &&
      divisor.whole !== undefined &&
      divisor.whole !== 0n
    ) {
      const p = dividend.whole * signOf(divisor.whole);
      const q = magnitude(divisor.whole);

      return { kind: "frac", p, q, ser: fractionPrint(p, q, this.#reduce) };
    }

    return printed("div", `(÷ ${dividend.ser} ${divisor.ser})`);
  }

  /**
   * A term at a place: factors joined by `*`, `/`, `÷` and juxtaposition, one precedence, left to
   * right; a sign after `*` or `/` signs the factor after it. A product's operands gather,
   * flattened, until the term ends or a division takes the product whole.
   *
   * @param at - The place.
   * @param absDepth - The open absolute values.
   * @returns The term, or none.
   */
  termAt(at: number, absDepth: number): Reading | undefined {
    const first = this.factorAt(at, absDepth);
    if (first === undefined) {
      return undefined;
    }

    let { next, node: term } = this.mixedFrom(first);
    let operands: readonly string[] | undefined;
    for (;;) {
      const tk = this.at(next);
      let op = "*";
      let negative = false;
      if (isOp(tk, "*/÷")) {
        op = tk.v;
        ({ negative, next } = this.signsAt(next + 1));
      } else if (!juxtaposes(tk, absDepth)) {
        return { next, node: operands === undefined ? term : flat("prod", operands) };
      }

      const factor = this.factorAt(next, absDepth);
      if (factor === undefined) {
        return undefined;
      }

      const f = signed(negative, factor.node, this.#reduce);
      ({ next } = factor);
      if (op === "*") {
        operands = appended("prod", operands, term, f);
      } else {
        term = this.divided(operands === undefined ? term : flat("prod", operands), f);
        operands = undefined;
      }
    }
  }

  /**
   * A sum at a place: signed terms, a run of signs composing by product (negative for an odd count
   * of minus signs) and signing the whole term; the terms gather, flattened.
   *
   * @param at - The place.
   * @param absDepth - The open absolute values.
   * @returns The sum, or none.
   */
  sumAt(at: number, absDepth: number): Reading | undefined {
    const leading = this.signsAt(at);
    const first = this.termAt(leading.next, absDepth);
    if (first === undefined) {
      return undefined;
    }

    const total = signed(leading.negative, first.node, this.#reduce);
    let { next } = first;
    let operands: readonly string[] | undefined;
    for (let signs = this.signsAt(next); signs.any; signs = this.signsAt(next)) {
      const term = this.termAt(signs.next, absDepth);
      if (term === undefined) {
        return undefined;
      }

      operands = appended("sum", operands, total, signed(signs.negative, term.node, this.#reduce));
      ({ next } = term);
    }

    return { next, node: operands === undefined ? total : flat("sum", operands) };
  }

  /**
   * A clause from a sum read: each relation after it and the sum after that.
   *
   * @param first - The clause's first sum.
   * @returns The clause, or none.
   */
  relatedFrom(first: Reading): Clause | undefined {
    const sides = [first.node.ser];
    const relations: string[] = [];
    let { next } = first;
    for (let rel = this.at(next); rel?.kind === "rel"; rel = this.at(next)) {
      const side = this.sumAt(next + 1, 0);
      if (side === undefined) {
        return undefined;
      }

      relations.push(rel.v);
      sides.push(side.node.ser);
      ({ next } = side);
    }

    return { next, relations, sides };
  }

  /**
   * A clause at a place: a sum, then each relation and the sum after it.
   *
   * @param at - The place.
   * @returns The clause, or none.
   */
  clauseAt(at: number): Clause | undefined {
    const first = this.sumAt(at, 0);

    return first === undefined ? undefined : this.relatedFrom(first);
  }

  /**
   * A group's member at a place: a sum, or the relation node a relation after it makes, printed as
   * a top-level clause is (`P(X>3)=0.25`).
   *
   * @param at - The place.
   * @returns The member, or none.
   */
  memberAt(at: number): Reading | undefined {
    const first = this.sumAt(at, 0);
    const clause = first === undefined ? undefined : this.relatedFrom(first);
    if (first === undefined || clause === undefined) {
      return undefined;
    }

    return clause.relations.length === 0
      ? first
      : { next: clause.next, node: printed("rel", clausePrint(clause.sides, clause.relations)) };
  }

  /**
   * A group at a place: a bracketed member; a `(` or `[` holding top-level commas a tuple, its two
   * brackets' kinds kept (p a parenthesis, b a bracket). Its content starts with no absolute value
   * open.
   *
   * @param at - The place of its opening bracket.
   * @returns The group, or none.
   */
  groupAt(at: number): Reading | undefined {
    const open = this.at(at);
    if (!isOp(open, "([{") || !isOpening(open.v)) {
      return undefined;
    }

    const closing = closingOf[open.v];
    const members: MathNode[] = [];
    let next = at + 1;
    for (;;) {
      const member = this.memberAt(next);
      if (member === undefined) {
        return undefined;
      }

      members.push(member.node);
      ({ next } = member);
      if (closing === "}" || !isOp(this.at(next), ",")) {
        break;
      }

      next += 1;
    }
    const close = this.at(next);
    const [only, ...rest] = members;
    if (only !== undefined && rest.length === 0) {
      return isOp(close, closing) ? { next: next + 1, node: only } : undefined;
    }

    if (!isOp(close, ")]")) {
      return undefined;
    }

    const kinds = `${open.v === "(" ? "p" : "b"}${close.v === ")" ? "p" : "b"}`;

    return {
      next: next + 1,
      node: printed("tuple", `(tuple ${kinds} ${members.map((m) => m.ser).join(" ")})`),
    };
  }

  /**
   * The text's clauses and their separators: each clause's print and whether it holds a relation,
   * and each separator (`and`, `or` or `,`), or none where the tokens do not parse.
   *
   * @returns The clauses and separators, or none.
   */
  clauses():
    | {
        readonly clauses: readonly { readonly isRelation: boolean; readonly print: string }[];
        readonly separators: readonly string[];
      }
    | undefined {
    const clauses: { readonly isRelation: boolean; readonly print: string }[] = [];
    const separators: string[] = [];
    let next = 1;
    for (;;) {
      const clause = this.clauseAt(next);
      if (clause === undefined) {
        return undefined;
      }

      clauses.push({
        isRelation: clause.relations.length > 0,
        print: clausePrint(clause.sides, clause.relations),
      });
      if (clause.next > this.#toks.length) {
        return { clauses, separators };
      }

      const separator = separatorOf(this.at(clause.next));
      if (separator === undefined) {
        return undefined;
      }

      separators.push(separator);
      next = clause.next + 1;
    }
  }
}

/**
 * A run of joined clauses' print: one clause's own, or (join c1 c2 …), the clauses sorted and each
 * once; none where a member is no relation or the run mixes joiners.
 *
 * @param prints - The run's clauses' prints.
 * @param areRelations - Whether every one holds a relation.
 * @param joins - The run's joiners.
 * @returns Its print, or none.
 */
const runPrint = (
  prints: readonly string[],
  areRelations: boolean,
  joins: readonly string[],
): string | undefined => {
  const [only, ...rest] = prints;
  if (rest.length === 0) {
    return only;
  }

  const [join] = joins;
  if (!areRelations || new Set(joins).size > 1 || join === undefined) {
    return undefined;
  }

  return `(${join} ${[...new Set(prints)].toSorted(byCodePoints).join(" ")})`;
};

/**
 * G's text: clauses, each a sum or a chain of relations between sums, joined by and/or, or by ","
 * between two relations; any other top-level "," separates the members of an ordered list. Its
 * print, or none where the tokens do not parse. Joined clauses print as a sorted set.
 *
 * @param toks - The tokens.
 * @param reduce - C6's switch.
 * @returns The print, or none.
 */
const textPrint = (toks: readonly Token[], reduce: boolean): string | undefined => {
  if (toks.length === 0) {
    return undefined;
  }

  const read = new Reader(toks, reduce).clauses();
  if (read === undefined) {
    return undefined;
  }

  const { clauses, separators } = read;
  const lines: string[] = [];
  let run: { readonly isRelation: boolean; readonly print: string }[] = [];
  let joins: string[] = [];
  for (const [k, clause] of clauses.entries()) {
    run.push(clause);

    const separator = separators[k];
    const next = clauses[k + 1];
    if (
      separator !== undefined &&
      (separator !== "," || (clause.isRelation && next?.isRelation === true))
    ) {
      joins.push(separator === "," ? "and" : separator);
      continue;
    }

    const line = runPrint(
      run.map((c) => c.print),
      run.every((c) => c.isRelation),
      joins,
    );
    if (line === undefined) {
      return undefined;
    }

    lines.push(line);
    run = [];
    joins = [];
  }

  return lines.length === 1 ? lines[0] : `(list ${lines.join(" ")})`;
};

/**
 * A `$` at the start, after white space and one optional sign.
 */
const leadingDollar = regex(`^([${whiteSpace}]*[+-]?[${whiteSpace}]*)[$]`, "u");

/**
 * A `$` at the end, before white space and one optional sign.
 */
const trailingDollar = regex(`[$]([${whiteSpace}]*[+-]?[${whiteSpace}]*)$`, "u");

/**
 * The run of signs at the end, white space among them.
 */
const danglingSigns = regex(`(?:[+-][${whiteSpace}]*)+$`, "u");

/**
 * A text's canonical form. G prepares the text in this order before it reads it: its edge `$` (read
 * as nothing, `$(x^2+1)` is `(x^2+1)`, `-$5x` is −5x), a dangling sign (`2-` is 2, `(x+2)-` is
 * x+2), its numerals' white space, then numeral-normal's step 1, the one body, so `x^2.0` is x²,
 * `v_0.0` is v₀ and `2 .0` is 2.
 *
 * @param text - The text.
 * @param reduce - C6's switch.
 * @returns Its canonical print, or none where it does not parse.
 */
export const mathCanonical = (text: string, reduce: boolean): string | undefined => {
  const normal = texNormal(text);
  if (normal === "") {
    return undefined;
  }

  const prepared = withoutTrailingZeros(
    numeralSpaces(
      normal.replace(leadingDollar, "$1").replace(trailingDollar, "$1").replace(danglingSigns, ""),
    ),
  );
  const toks = tokensOf(prepared);

  return toks === undefined ? undefined : textPrint(toks, reduce);
};

/**
 * The `math-canonical` operator's registry entry.
 */
export const mathCanonicalOperator = inlineOperator({
  apply: ([text, reduce]) => textValue("string", mathCanonical(text.value, reduce) ?? ""),
  definition: `${alphaDefinitionPrefix}math-canonical`,
  operands: [
    { form: "expression", name: "text", type: { base: "string", cardinality: "single" } },
    {
      form: "literal",
      name: "reduce",
      parse: (value: Value) => switchLiteral(value),
      type: { base: "boolean", cardinality: "single" },
    },
  ],
  result: { base: "string", cardinality: "single" },
});
