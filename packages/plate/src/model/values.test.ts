import { availableParallelism } from "node:os";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, element, int, oneOf } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { growthFactor, growthLimit, growthRatio } from "@qti-pie/crust/test/growth.ts";
import { Duration, Effect, Formatter, Option, Result } from "effect";
import { format, modelledBaseTypes, parseElementText, parseLexical } from "#plate/model/values.ts";
import type { ModelledBaseType, Single } from "#plate/model/values.ts";
import { boxHolds } from "#plate/test/box.ts";

/**
 * How long one case of a search here may run before it is stopped and reported.
 */
const caseHang = Duration.seconds(30);

/**
 * The whitespace run a case of the padding box writes: 100,000 characters of the four XML
 * whitespace characters.
 */
const LONG_RUN = " \t\n\r".repeat(25_000);

/**
 * The run {@link growthFactor} times shorter, which a growth check compares {@link LONG_RUN} with.
 */
const SHORT_RUN = " \t\n\r".repeat(25_000 / growthFactor);

/**
 * Where a case of the padding box writes its run: around one piece, or between two pieces and
 * after them.
 */
const PLACEMENTS = ["around", "between"] as const;

/**
 * A {@link PLACEMENTS} member.
 */
type Placement = (typeof PLACEMENTS)[number];

/**
 * The pieces a case of the padding box writes: an identifier's and an integer's.
 */
const PAD_PIECES = ["A", "1"] as const;

/**
 * The base types whose lexical form is two parts separated by whitespace: a pair's and a directed
 * pair's two identifiers, and a point's two integers.
 */
const TWO_PART: readonly ModelledBaseType[] = ["pair", "directedPair", "point"];

/**
 * A case of the padding box: a base type, where the run goes, and the pieces it goes around or
 * between.
 */
interface PaddingCase {
  readonly baseType: ModelledBaseType;
  readonly pieces: readonly [string, ...string[]];
  readonly placement: Placement;
}

/**
 * Draw a case of the padding box: every base type the value model holds, a run around each piece,
 * and a run between each two pieces and after them.
 */
const paddingCase: Gen<PaddingCase> = (source) => {
  const baseType = source.draw(element(modelledBaseTypes));
  const placement = source.draw(element(PLACEMENTS));
  const first = source.draw(element(PAD_PIECES));

  return {
    baseType,
    pieces: placement === "around" ? [first] : [first, source.draw(element(PAD_PIECES))],
    placement,
  };
};

/**
 * How many cases {@link paddingCase} draws.
 */
const PADDING_CASES = 11 * (2 + 2 * 2);

/**
 * A case's text with its run: the run, the piece and the run again around one piece; the pieces
 * with the run between them and after them.
 *
 * @param padding The case.
 * @param run The whitespace run.
 * @returns The text.
 */
const paddedText = (padding: PaddingCase, run: string): string =>
  padding.placement === "around"
    ? `${run}${padding.pieces.join("")}${run}`
    : `${padding.pieces.join(run)}${run}`;

/**
 * A case's text without its run: the piece, or the pieces separated by one space.
 *
 * @param padding The case.
 * @returns The text.
 */
const unpaddedText = (padding: PaddingCase): string => padding.pieces.join(" ");

describe("parseElementText", () => {
  it.effect(
    `parses a 100,000-character whitespace run in linear time, around a piece or between two, in every base type, reading the value the unpadded text names: ${String(PADDING_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(paddingCase, PADDING_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "every base type the value model holds, with a run of the four XML whitespace characters around A or 1, or between two of them and after: 100,000 characters against 12,500",
              caseHang,
              coverage: requiredInSpace<Placement>(PLACEMENTS),
              generator: paddingCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "spec reading `typed-value-whitespace`: outer XML whitespace is formatting for every base type but string, whose text is its value, so a padded text reads as the text without its run; a pair's, a directed pair's and a point's two parts are separated by whitespace, so a run between them reads as one space; and a parse linear in its text does about 8 times as much on 8 times the run, within growthLimit",
              },
              suite: "plate/values/padding",
            },
            (padding, c) =>
              Effect.gen(function* paddedInLinearTime() {
                c.note(padding.placement);

                const more = paddedText(padding, LONG_RUN);
                const fewer = paddedText(padding, SHORT_RUN);
                const name = `${padding.baseType} ${padding.placement} ${JSON.stringify(unpaddedText(padding))}`;
                if (padding.baseType === "string") {
                  assert.deepStrictEqual(
                    Result.getSuccess(parseElementText("string", more)),
                    Option.some(Option.some<Single>({ baseType: "string", value: more })),
                    name,
                  );
                } else if (padding.placement === "around" || TWO_PART.includes(padding.baseType)) {
                  assert.deepStrictEqual(
                    Result.getSuccess(parseElementText(padding.baseType, more)),
                    Result.getSuccess(parseElementText(padding.baseType, unpaddedText(padding))),
                    name,
                  );
                }

                const growth = yield* growthRatio(
                  () => {
                    parseElementText(padding.baseType, fewer);
                  },
                  () => {
                    parseElementText(padding.baseType, more);
                  },
                );

                assert.isBelow(
                  growth,
                  growthLimit,
                  `${name}: ${String(growthFactor)} times the whitespace took ${growth.toFixed(1)} times as long`,
                );
              }),
          ),
        ),
      ),
  );
});

/**
 * What a double read from a literal is: an infinity, a zero, or a finite double that is no zero.
 */
const DOUBLE_CLASSES = ["infinite", "zero", "finite"] as const;

/**
 * A {@link DOUBLE_CLASSES} member.
 */
type DoubleClass = (typeof DOUBLE_CLASSES)[number];

/**
 * Draw a literal of the bounds box: a sign or none, then a significand and its power of 10 near
 * either bound of the doubles, written with `e` or `E`: a digit at the powers 300 to 310 and -330
 * to -320, and the largest finite double's and half the least subnormal's first 15 significant
 * digits with every three digits more, at the powers 308 and -324.
 */
const boundLiteral: Gen<string> = (source) => {
  const sign = source.draw(element(["", "-"] as const));
  const mark = source.draw(element(["e", "E"] as const));
  const [significand, power] = source.draw(
    oneOf<readonly [string, number]>([
      (inner) => [String(inner.draw(int(1, 9))), inner.draw(int(300, 310))],
      (inner) => [String(inner.draw(int(1, 9))), inner.draw(int(-330, -320))],
      (inner) => [`1.79769313486231${String(inner.draw(int(0, 999))).padStart(3, "0")}`, 308],
      (inner) => [`2.47032822920623${String(inner.draw(int(0, 999))).padStart(3, "0")}`, -324],
    ]),
  );

  return `${sign}${significand}${mark}${String(power)}`;
};

/**
 * How many literals {@link boundLiteral} draws.
 */
const BOUND_LITERALS = 2 * 2 * (9 * 11 + 9 * 11 + 1000 + 1000);

/**
 * The midpoint between the largest finite double, (2^53 - 1) * 2^971, and 2^1024: IEEE 754's
 * rounding to nearest takes a magnitude at or past it to an infinity, a tie going to the even
 * 2^1024.
 */
const OVERFLOW_MIDPOINT = 2n ** 1024n - 2n ** 970n;

/**
 * What a literal of the bounds box names, by its exact value: an infinity at or past
 * {@link OVERFLOW_MIDPOINT}, a zero at or below 2^-1075, half the least subnormal 2^-1074, where a
 * tie goes to the even zero, and a finite double that is no zero between.
 *
 * @param text The literal: a sign or none, a significand of digits with a point or none, `e` or
 *   `E` and a power of 10.
 * @returns Its class.
 */
const boundClassOf = (text: string): DoubleClass => {
  const unsigned = text.startsWith("-") ? text.slice(1) : text;
  const mark = Math.max(unsigned.indexOf("e"), unsigned.indexOf("E"));
  const significand = unsigned.slice(0, mark);
  const point = significand.indexOf(".");
  const digits = BigInt(significand.replace(".", ""));
  const scale =
    Number(unsigned.slice(mark + 1)) - (point === -1 ? 0 : significand.length - point - 1);
  if (scale >= 0) {
    return digits * 10n ** BigInt(scale) >= OVERFLOW_MIDPOINT ? "infinite" : "finite";
  }

  const divisor = 10n ** BigInt(-scale);
  if (digits >= OVERFLOW_MIDPOINT * divisor) {
    return "infinite";
  }

  return digits * 2n ** 1075n <= divisor ? "zero" : "finite";
};

/**
 * The class of a double.
 *
 * @param double The double.
 * @returns Whether it is an infinity, a zero or a finite double that is no zero.
 */
const doubleClassOf = (double: number): DoubleClass => {
  if (double === 0) {
    return "zero";
  }

  return Number.isFinite(double) ? "finite" : "infinite";
};

describe("parseLexical", () => {
  it("reads empty text as a file with no name, as QTI 3.0.1's file holds an optional filename", () => {
    assert.deepStrictEqual(
      parseLexical("file", ""),
      Result.succeed<Single>({ baseType: "file", value: { name: "", size: 0, type: "" } }),
    );
    assert.deepStrictEqual(
      parseElementText("file", ""),
      Result.succeed(
        Option.some<Single>({ baseType: "file", value: { name: "", size: 0, type: "" } }),
      ),
    );
  });

  it.effect(
    `reads a float beyond the largest double as an infinity of its sign and one below half the least subnormal as a zero of its sign, as XML Schema 1.1's doubleLexicalMap does (reading \`bounded-double\`), over every literal of the bounds box: ${String(BOUND_LITERALS)} literals`,
    (ctx) =>
      Effect.andThen(
        boxHolds(boundLiteral, BOUND_LITERALS),
        searched(
          ctx,
          exhaust(
            {
              box: "every literal, signed or not, with e or E, of a digit times 10 to the 300 to 310 or the -330 to -320, and of 1.79769313486231 or 2.47032822920623 and any three digits more, times 10 to the 308 or the -324",
              caseHang,
              concurrency: availableParallelism(),
              coverage: requiredInSpace<DoubleClass>(DOUBLE_CLASSES),
              generator: boundLiteral,
              literal: (text) => JSON.stringify(text),
              oracle: {
                kind: "specification",
                name: "IEEE 754's rounding to nearest, ties to even, as XML Schema 1.1's doubleLexicalMap reads a literal (reading `bounded-double`), decided here in exact integer arithmetic: a magnitude at or past 2^1024 - 2^970, the midpoint between the largest finite double and 2^1024, is an infinity, and one at or below 2^-1075, half the least subnormal, is a zero, each of the literal's sign; every other is a finite double of its sign that is no zero",
              },
              suite: "plate/values/double-bounds",
            },
            (text, c) =>
              Effect.gen(function* readsAtTheBounds() {
                const expected = boundClassOf(text);
                c.note(expected);

                const read = yield* Effect.fromResult(parseLexical("float", text));
                const double = read.baseType === "float" ? read.value : Number.NaN;

                assert.deepStrictEqual(
                  { class: doubleClassOf(double), negative: double < 0 || Object.is(double, -0) },
                  { class: expected, negative: text.startsWith("-") },
                  text,
                );
              }),
          ),
        ),
      ),
  );
});

/**
 * The pieces a text of the lexical box is written with: a name, a digit and the other digit
 * pieces, both signs, the point, an exponent, xs:double's other literals, a boolean and the space
 * that separates a pair's and a point's two parts.
 */
const LEXICAL_PIECES = [
  "A",
  "1",
  "-",
  "+",
  "0",
  ".",
  "5",
  "e9",
  "INF",
  "NaN",
  "true",
  " ",
] as const;

/**
 * A case of the lexical box: a base type and a text.
 */
interface LexicalCase {
  readonly baseType: ModelledBaseType;
  readonly text: string;
}

/**
 * Draw a case of the lexical box: every base type the value model holds, by every text of up to
 * three of {@link LEXICAL_PIECES}.
 */
const lexicalCase: Gen<LexicalCase> = (source) => ({
  baseType: source.draw(element(modelledBaseTypes)),
  text: source.draw(array(element(LEXICAL_PIECES), { max: 3, min: 0 })).join(""),
});

/**
 * How many cases {@link lexicalCase} draws.
 */
const LEXICAL_CASES = 11 * (1 + 12 + 12 ** 2 + 12 ** 3);

/**
 * Whether text is an integer in XML Schema 1.0's canonical form (Part 2 section 3.3.13.2): `0`, or
 * an optional `-` then a digit other than 0 and any digits, never a `+` or a leading zero.
 *
 * @param text The text.
 * @returns Whether it is canonical.
 */
const isCanonicalInteger = (text: string): boolean => {
  const digits = text.startsWith("-") ? text.slice(1) : text;
  const isDigits =
    digits !== "" && Array.from(digits).every((digit) => digit >= "0" && digit <= "9");

  return text === "0" || (isDigits && !digits.startsWith("0"));
};

/**
 * The canonical form a written value breaks, if it breaks one: an integer's and a point's
 * coordinates' (XML Schema 1.0 Part 2 section 3.3.13.2) and a boolean's, `true` or `false`
 * (section 3.2.2.2).
 *
 * @param single The value.
 * @param written The text format wrote for it.
 * @returns What it breaks; none when it is canonical or its base type has no form checked here.
 */
const canonicalFormBroken = (single: Single, written: string): Option.Option<string> => {
  if (single.baseType === "integer") {
    return isCanonicalInteger(written) ? Option.none() : Option.some("a canonical integer");
  }

  if (single.baseType === "point") {
    const parts = written.split(" ");

    return parts.length === 2 && parts.every(isCanonicalInteger)
      ? Option.none()
      : Option.some("two canonical integers separated by one space");
  }

  if (single.baseType === "boolean") {
    return written === "true" || written === "false"
      ? Option.none()
      : Option.some("a canonical boolean");
  }

  return Option.none();
};

describe("format", () => {
  it.effect(
    `writes every value the parser reads as canonical text it reads back as the same value, over every text of up to 3 of ${String(LEXICAL_PIECES.length)} pieces in every base type: ${String(LEXICAL_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(lexicalCase, LEXICAL_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "every base type the value model holds, by every text of 0 to 3 pieces over A, 1, the minus and plus signs, 0, the point, 5, e9, INF, NaN, true and the space",
              caseHang,
              concurrency: availableParallelism(),
              coverage: requiredInSpace<ModelledBaseType>(modelledBaseTypes),
              generator: lexicalCase,
              literal: Formatter.format,
              oracle: {
                kind: "universal",
                name: "format is a right inverse of parseLexical: every value the parser reads is written as text the parser reads back as that value (NaN and -0 included) and that format writes again unchanged; an integer, and a point's coordinates, in XML Schema 1.0's canonical integer (Part 2 section 3.3.13.2: no + and no leading zero, 0 unsigned), and a boolean as true or false (section 3.2.2.2)",
              },
              suite: "plate/values/format",
            },
            ({ baseType, text }, c) =>
              Effect.sync(() => {
                Result.match(parseLexical(baseType, text), {
                  onFailure: () => undefined,
                  onSuccess: (single) => {
                    c.note(baseType);

                    const written = format(single);
                    const name = `${baseType} ${JSON.stringify(text)} wrote ${JSON.stringify(written)}`;
                    const again = parseLexical(baseType, written);

                    assert.deepStrictEqual(again, Result.succeed(single), name);
                    assert.deepStrictEqual(
                      Result.map(again, format),
                      Result.succeed(written),
                      name,
                    );
                    assert.deepStrictEqual(
                      canonicalFormBroken(single, written),
                      Option.none(),
                      name,
                    );
                  },
                });
              }),
          ),
        ),
      ),
  );
});
