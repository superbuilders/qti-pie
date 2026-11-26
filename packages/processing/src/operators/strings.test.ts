import { drawn, explore } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { array, int } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Formatter } from "effect";
import type { Expression } from "#processing/ir.ts";
import { singleBoolean } from "#processing/operators/operator.ts";
import { foldCase, stringsOperators } from "#processing/operators/strings.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import {
  element,
  literal,
  nodeOf,
  ownVariable,
  testContext,
  testRun,
} from "#processing/test/run.ts";
import { nullOf, single, textValue } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

const operators = Object.freeze({ ...stringsOperators, ...valuesOperators });

/**
 * The work one case may do.
 */
const caseHang = Duration.seconds(30);

/**
 * How many rotating cases each search compares beside its witnesses.
 */
const CASES = 1000;

const booleanNull = nullOf({ base: "boolean", cardinality: "single" });

const { run } = testRun(
  operators,
  {
    broken: { value: textValue("string", "a{") },
    digits: { value: textValue("string", "[0-9]+") },
  },
  {},
);

/**
 * A string's literal, NULL for the empty string.
 *
 * @param text - The string.
 * @returns The `qti-base-value`.
 */
const string = (text: string): Expression => literal(textValue("string", text));

/**
 * A `qti-string-match`'s value.
 *
 * @param caseSensitive - Whether case counts.
 * @param substring - The deprecated substring attribute.
 * @param left - The first string.
 * @param right - The second string.
 * @returns Its value.
 */
const stringMatch = (
  caseSensitive: boolean,
  substring: boolean,
  left: string,
  right: string,
): Value =>
  run.evaluate(
    nodeOf(
      "string-match",
      [string(left), string(right)],
      { caseSensitive, substring },
      singleBoolean,
    ),
  );

/**
 * A `qti-substring`'s value.
 *
 * @param caseSensitive - Whether case counts.
 * @param left - The first string, the part.
 * @param right - The second string, the whole.
 * @returns Its value.
 */
const substring = (caseSensitive: boolean, left: string, right: string): Value =>
  run.evaluate(
    nodeOf("substring", [string(left), string(right)], { caseSensitive }, singleBoolean),
  );

/**
 * A `qti-pattern-match`'s value over a literal pattern.
 *
 * @param pattern - The pattern.
 * @param text - The string.
 * @returns Its value.
 */
const patternMatch = (pattern: string, text: string): Value =>
  run.evaluate(
    nodeOf(
      "pattern-match",
      [string(text)],
      { pattern: { kind: "literal", value: pattern } },
      singleBoolean,
    ),
  );

/**
 * Strings over letters whose case maps differ in length or locale: ß, SS, ſ, s, K and the Kelvin
 * sign, i and İ.
 */
const strings = array(
  (source): string => ["a", "A", "ß", "S", "s", "ſ", "K", "K", "i", "İ"][int(0, 9)(source)] ?? "a",
  { max: 4, min: 1 },
);

/**
 * A `qti-pattern-match`'s value over a pattern a variable holds.
 *
 * @param variable - The variable.
 * @param text - The string.
 * @returns Its value.
 */
const named = (variable: string, text: string): Value =>
  run.evaluate(
    nodeOf(
      "pattern-match",
      [string(text)],
      {
        pattern: {
          kind: "variable",
          variable: ownVariable(variable, { base: "string", cardinality: "single" }),
        },
      },
      singleBoolean,
    ),
  );

describe("the strings family's laws", () => {
  it.effect(
    "substring(a, b) is string-match(b, a) with substring true, and case-insensitive matching is equality of folds (§2.11.3.45, §2.11.3.46)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly [string, string, boolean] => [
              strings(source).join(""),
              strings(source).join(""),
              int(0, 1)(source) === 1,
            ]),
            kept: [],
            literal: (row) => Formatter.format(row),
            oracle: { kind: "specification", name: "the two operators' directions, and the fold" },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/strings/directions",
          },
          ([a, b, caseSensitive]) =>
            Effect.sync(() => {
              assert.deepStrictEqual(
                substring(caseSensitive, a, b),
                stringMatch(caseSensitive, true, b, a),
              );
              assert.deepStrictEqual(
                stringMatch(false, false, a, b),
                single("boolean", foldCase(a) === foldCase(b)),
              );
              assert.deepStrictEqual(
                stringMatch(false, false, a, b),
                stringMatch(false, false, b, a),
              );
            }),
        ),
      ),
  );
});

describe("the strings family's stated values", () => {
  it("string-match's deprecated substring holds the second in the first, substring the first in the second (§5.138.2, §2.11.3.46)", () => {
    assert.deepStrictEqual(
      stringMatch(true, true, "hello world", "world"),
      single("boolean", true),
    );
    assert.deepStrictEqual(
      stringMatch(true, true, "world", "hello world"),
      single("boolean", false),
    );
    assert.deepStrictEqual(substring(true, "world", "hello world"), single("boolean", true));
    assert.deepStrictEqual(substring(true, "hello world", "world"), single("boolean", false));
    assert.deepStrictEqual(stringMatch(true, false, "Straße", "STRASSE"), single("boolean", false));
    assert.deepStrictEqual(stringMatch(false, false, "Straße", "STRASSE"), single("boolean", true));
    assert.deepStrictEqual(
      stringMatch(true, false, "", "a"),
      booleanNull,
      "an empty string is NULL",
    );
  });

  it("pattern-match is XML Schema's regular expression, anchored at both ends (§5.104.1, reading `pattern-mask-braces`)", () => {
    assert.deepStrictEqual(patternMatch("b", "abc"), single("boolean", false));
    assert.deepStrictEqual(patternMatch(".b.", "abc"), single("boolean", true));
    assert.deepStrictEqual(patternMatch("[a-z-[aeiou]]+", "bcd"), single("boolean", true));
    assert.deepStrictEqual(patternMatch("[a-z-[aeiou]]+", "bad"), single("boolean", false));
    assert.deepStrictEqual(patternMatch("\\d{3}", "123"), single("boolean", true));
    assert.deepStrictEqual(
      patternMatch("^a$", "a"),
      single("boolean", false),
      "^ and $ are literal characters",
    );
    assert.deepStrictEqual(patternMatch("a", ""), booleanNull);
  });

  it("pattern-match reads a {NAME} pattern at run time, and gives NULL where it is no XML Schema pattern (reading `pattern-mask-braces`)", () => {
    assert.deepStrictEqual(named("digits", "2026"), single("boolean", true));
    assert.deepStrictEqual(named("broken", "a{"), booleanNull);
    assert.deepStrictEqual(named("missing", "a"), booleanNull);
  });
});

describe("the strings family's attributes", () => {
  const context = testContext({ declared: { digits: { base: "string", cardinality: "single" } } });

  it("requires case-sensitive, defaults substring to false, and refuses a literal pattern outside Appendix F (§5.138.1, reading `pattern-mask-braces`)", () => {
    assert.isFalse(
      stringsOperators["string-match"].read(element("qti-string-match", {}, []), context, 0).ok,
    );
    assert.deepStrictEqual(
      stringsOperators["string-match"].read(
        element("qti-string-match", { "case-sensitive": "false" }, []),
        context,
        0,
      ),
      { ok: true, value: { caseSensitive: false, substring: false } },
    );
    assert.isFalse(
      stringsOperators.substring.read(element("qti-substring", {}, []), context, 0).ok,
    );
    assert.isFalse(
      stringsOperators["pattern-match"].read(
        element("qti-pattern-match", { pattern: "a{" }, []),
        context,
        0,
      ).ok,
    );
    assert.deepStrictEqual(
      stringsOperators["pattern-match"].read(
        element("qti-pattern-match", { pattern: "{digits}" }, []),
        context,
        0,
      ),
      {
        ok: true,
        value: {
          pattern: {
            kind: "variable",
            variable: ownVariable("digits", { base: "string", cardinality: "single" }),
          },
        },
      },
    );
  });
});
