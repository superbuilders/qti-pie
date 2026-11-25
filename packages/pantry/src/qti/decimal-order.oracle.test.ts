/**
 * The order of an element's ARIA range, `Aria value range` (information model §5.2.31: "Authors
 * MUST ensure the value of 'aria-valuemax' is greater than or equal to the value of
 * 'aria-valuemin'"; spec reading 91), judged three ways alike over decimals at and past grizzle's
 * former bounded form of numeric, 256 integer and 255 fraction digits:
 *
 * - **The schema's check**, `Aria_value_range` (`#pantry/qti/interactions.ts`), as `Qti` states it,
 *   evaluated over the case's `AriaBounds` row by grizzle's own host evaluator as PostgreSQL
 *   evaluates its rule (`rowEvaluator`, `#pantry/test/row-evaluation.ts`): a `Text.matches` guard
 *   as a regular expression under `u`, `Text.parseDecimal` as the decimal the text names exactly,
 *   and numeric's exact order. The row is the case's two values collapsed, as
 *   `InteractionAttribute` holds them and the query reads them, at one element's place. A decimal
 *   past the bytes the parse reads (`parsedDecimalBytes`) holds the check by its own arm, and
 *   `Key_text_bound` over the same row refuses it, a stated limit of the representation.
 * - **The law oracle** (`documentBreaches` of `#pantry/test/oracle.ts`) names `Aria value range` over
 *   the item that writes the case's values.
 * - **The reference** written here from XML Schema 1.1 (Part 2 §3.3.3): a value is read where its
 *   collapsed form is in `xs:decimal`'s lexical space (§3.3.3.1, `decimalLexicalRep`), as the parts
 *   its canonical representation writes (decimalCanonicalMap, §E.1): its sign, its integer digits
 *   with no leading zero and its fraction digits with no trailing zero. Two values are ordered by
 *   those digits, apart from the arithmetic the check and the oracle do. A pair breaks its order
 *   where both values are decimals and aria-valuemin's is above aria-valuemax's.
 *
 * Two plants restate the deleted readings: the schema's former check, each value cast through
 * `numeric(511, 255)`'s lexical form and a value outside it read as the infinity at the end of the
 * order that holds it; and the oracle's former decimal form, which read `+`, `.`, `-.` and the
 * empty text as zero. The search must catch each.
 */
import { regex } from "arkregex";
import { check, Decimal, lexicalForm, Logic, pg, schema, Text, Type } from "@bjornpagen/grizzle";
import type { EvaluatedRow } from "@bjornpagen/grizzle/compile";
import { assert, describe, it } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { boolean, constant, element, weighted } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter, Option, Result } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { foldGrammarOf, shredGrammarOf } from "#pantry/model/composed.ts";
import { fold } from "#pantry/model/folds.ts";
import { shred } from "#pantry/model/shred.ts";
import { parsedDecimalBytes, utf8Length } from "#pantry/qti/limits.ts";
import { AriaBounds } from "#pantry/qti/overlay-queries/interaction.ts";
import { documentBreaches, lawsOf } from "#pantry/test/oracle.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { brokenIn, evaluatorOf, insideDomains } from "#pantry/test/row-evaluation.ts";

/**
 * `Qti`'s rows as the host evaluates them, its ARIA range check among them.
 */
const evaluateQti = evaluatorOf(Qti);

/**
 * Grizzle's former widest numeric with a lexical form, the one the deleted check cast through.
 */
const formerDecimal = pg.numeric(511, 255);

/**
 * The deleted check, restated over a level above `Qti`, under a name of its own: each value cast
 * through {@link formerDecimal}'s lexical form, a value outside it read as the infinity at the end
 * of the order that holds it. No infinity is a value of the bounded numeric (grizzle refuses a
 * literal compared with one it cannot hold, README, "Arithmetic"), so the cast value is compared in
 * numeric of no typmod, `pg.numeric`, which holds both infinities and every value the bounded cast
 * gives, as it is: the order the deleted check compared in.
 */
const formerLevel = schema.extend(
  [Qti],
  "FormerAriaValueRange",
  [],
  [
    check("Former_aria_value_range", AriaBounds, (r) =>
      r.le(
        Logic.when(
          Text.matches(r.min, lexicalForm(formerDecimal)),
          (min) => Type.cast(Type.cast(min, formerDecimal), pg.numeric),
          Decimal.negativeInfinity,
        ),
        Logic.when(
          Text.matches(r.max, lexicalForm(formerDecimal)),
          (max) => Type.cast(Type.cast(max, formerDecimal), pg.numeric),
          Decimal.infinity,
        ),
      ),
    ),
  ],
);

/**
 * `Qti`'s rows as the host evaluates them over {@link formerLevel}, the deleted check among them.
 */
const evaluateFormer = evaluatorOf(formerLevel);

/**
 * A pair's `AriaBounds` row: its two values, collapsed, at one element's place, as the query
 * delivers them.
 *
 * @param pair - The values, `aria-valuemin`'s first.
 * @returns The row.
 */
const boundsRow = ([min, max]: readonly [string, string]): EvaluatedRow<typeof AriaBounds> => ({
  max,
  min,
  package: "item",
  path: "item.xml",
  start: 0n,
});

/**
 * The oracle's former decimal form, which held a sign and digits on neither side of the point.
 */
const formerOracleForm = regex("^(?<sign>[+-]?)(?<whole>[0-9]*)(?:\\.(?<fraction>[0-9]*))?$", "u");

/**
 * The oracle's former order of two collapsed decimal forms, restated as it was: exact, but over
 * {@link formerOracleForm}, so `+`, `.`, `-.` and the empty text are zero.
 *
 * @param a - The first form.
 * @param b - The second form.
 * @returns Whether the first's value is below the second's; false when either is outside the form.
 */
const formerOracleBelow = (a: string, b: string): boolean => {
  const [first, second] = [formerOracleForm.exec(a), formerOracleForm.exec(b)];
  if (first?.groups === undefined || second?.groups === undefined) {
    return false;
  }

  const places = Math.max(
    first.groups["fraction"]?.length ?? 0,
    second.groups["fraction"]?.length ?? 0,
  );
  const scaled = ({ fraction = "", sign = "", whole = "" }: Record<string, string | undefined>) =>
    (sign === "-" ? -1n : 1n) * BigInt(`0${whole}${fraction.padEnd(places, "0")}`);

  return scaled(first.groups) < scaled(second.groups);
};

/**
 * XML Schema's whiteSpace collapse (Part 2 §4.3.6): each run of XML whitespace one space, and none
 * at either end.
 *
 * @param form - The form.
 * @returns It collapsed.
 */
const collapsed = (form: string): string =>
  form
    .replaceAll(regex("[\t\n\r ]+", "gu"), " ")
    .replace(regex("^ ", "u"), "")
    .replace(regex(" $", "u"), "");

/**
 * `xs:decimal`'s lexical space, the reference's: XML Schema 1.1's regular expression for
 * `decimalLexicalRep` (Part 2 §3.3.3.1).
 */
const xsDecimal = regex("^[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)$", "u");

/**
 * A decimal as its canonical representation writes it: its sign, its integer digits with no
 * leading zero and its fraction digits with no trailing zero, zero being no negative number.
 */
interface Canonical {
  readonly fraction: string;
  readonly negative: boolean;
  readonly whole: string;
}

/**
 * The reference's value of a collapsed form: its canonical parts where it is in
 * {@link xsDecimal}.
 *
 * @param form - The form, collapsed.
 * @returns The parts, none outside the lexical space.
 */
const canonicalOf = (form: string): Option.Option<Canonical> => {
  if (!xsDecimal.test(form)) {
    return Option.none();
  }

  const [whole = "", fraction = ""] = form.replace(regex("^[+-]", "u"), "").split(".");
  const parts = {
    fraction: fraction.replace(regex("0+$", "u"), ""),
    whole: whole.replace(regex("^0+", "u"), ""),
  };

  return Option.some({
    ...parts,
    negative: form.startsWith("-") && (parts.whole !== "" || parts.fraction !== ""),
  });
};

/**
 * Order two magnitudes by their digits: more integer digits is greater, then the integer digits
 * in order, then the fraction digits in order, which no trailing zero lets differ in length alone.
 *
 * @param a - The first.
 * @param b - The second.
 * @returns Below zero, zero or above zero.
 */
const magnitudeOrder = (a: Canonical, b: Canonical): number => {
  if (a.whole.length !== b.whole.length) {
    return a.whole.length - b.whole.length;
  }

  if (a.whole !== b.whole) {
    return a.whole < b.whole ? -1 : 1;
  }

  if (a.fraction === b.fraction) {
    return 0;
  }

  return a.fraction < b.fraction ? -1 : 1;
};

/**
 * A case's two forms as the law reads them: collapsed, as the import copies them.
 *
 * @param forms - The forms as written, `aria-valuemin` first.
 * @returns The two collapsed.
 */
const formsRead = ([min, max]: readonly [string, string]): readonly [string, string] => [
  collapsed(min),
  collapsed(max),
];

/**
 * Whether the reference breaks the order of a pair: both values decimals, and the minimum above
 * the maximum.
 *
 * @param min - The collapsed `aria-valuemin`.
 * @param max - The collapsed `aria-valuemax`.
 * @returns Whether the order is broken.
 */
const above = (min: string, max: string): boolean =>
  Option.match(Option.all([canonicalOf(min), canonicalOf(max)]), {
    onNone: () => false,
    onSome: ([low, high]) => {
      if (low.negative !== high.negative) {
        return high.negative;
      }

      const order = magnitudeOrder(low, high);

      return low.negative ? order < 0 : order > 0;
    },
  });

/**
 * A decimal drawn: its sign, its integer digits with no leading zero and its fraction digits with
 * no trailing zero. A zero may carry the sign, as `-0` does.
 */
interface Value {
  readonly fraction: string;
  readonly negative: boolean;
  readonly whole: string;
}

/**
 * How a value is written: a `+` on a nonnegative one, zeros before its integer digits and after
 * its fraction digits, a trailing point on a value with no fraction, no zero before the point of
 * a value with no integer digits, and spaces around it.
 */
interface Spelling {
  readonly bare: boolean;
  readonly lead: number;
  readonly padded: boolean;
  readonly plus: boolean;
  readonly point: boolean;
  readonly trail: number;
}

/**
 * Write a value in a spelling: a form in `xs:decimal`'s lexical space once collapsed.
 *
 * @param value - The value.
 * @param spelling - How it is written.
 * @returns The form.
 */
const spell = ({ fraction, negative, whole }: Value, spelling: Spelling): string => {
  const wholeText = `${"0".repeat(spelling.lead)}${whole}`;
  const fractionText = `${fraction}${"0".repeat(spelling.trail)}`;
  const bareWhole = spelling.bare && fractionText !== "" ? "" : "0";
  const integer = wholeText === "" ? bareWhole : wholeText;
  const point = spelling.point ? "." : "";
  const tail = fractionText === "" ? point : `.${fractionText}`;
  const plus = spelling.plus ? "+" : "";
  const form = `${negative ? "-" : plus}${integer}${tail}`;

  return spelling.padded ? ` ${form} ` : form;
};

/**
 * The digit counts a part is drawn at: none, a few, each side of the former form's bounds of 256
 * integer and 255 fraction digits, far past them, and at and one past the bytes the parse reads,
 * `parsedDecimalBytes`, so a value is past them by a digit or a sign.
 */
const partLengths = [
  0,
  1,
  3,
  254,
  255,
  256,
  257,
  258,
  600,
  parsedDecimalBytes,
  parsedDecimalBytes + 1,
] as const;

/**
 * A nonzero digit.
 */
const nonzero = element(["1", "2", "5", "9"] as const);

/**
 * Any digit.
 */
const anyDigit = element(["0", "1", "4", "5", "9"] as const);

/**
 * A run of digits of a length, its first digit nonzero where it leads a number and its last
 * nonzero where it ends a fraction: two drawn ends around a drawn digit repeated, so a long run
 * costs three draws, and a one-digit run is nonzero.
 *
 * @param length - The run's digits.
 * @param edge - Which end may not be zero.
 * @returns The run.
 */
const runOf =
  (length: number, edge: "first" | "last"): Gen<string> =>
  (source) => {
    if (length <= 1) {
      return length === 0 ? "" : source.draw(nonzero);
    }

    const first = source.draw(edge === "first" ? nonzero : anyDigit);
    const fill = source.draw(anyDigit).repeat(length - 2);
    const last = source.draw(edge === "last" ? nonzero : anyDigit);

    return `${first}${fill}${last}`;
  };

/**
 * A value at an edge, zero one time in ten.
 */
const values: Gen<Value> = weighted([
  [
    9,
    (source) => ({
      fraction: source.draw(runOf(source.draw(element(partLengths)), "last")),
      negative: source.draw(boolean),
      whole: source.draw(runOf(source.draw(element(partLengths)), "first")),
    }),
  ],
  [1, (source) => ({ fraction: "", negative: source.draw(boolean), whole: "" })],
]);

/**
 * The spellings, each run of zeros up to one past the former form's bound.
 */
const spellings: Gen<Spelling> = (source) => ({
  bare: source.draw(boolean),
  lead: source.draw(
    weighted([
      [2, constant(0)],
      [1, constant(1)],
      [1, constant(256)],
    ]),
  ),
  padded: source.draw(
    weighted([
      [9, element([false] as const)],
      [1, element([true] as const)],
    ]),
  ),
  plus: source.draw(boolean),
  point: source.draw(boolean),
  trail: source.draw(
    weighted([
      [2, constant(0)],
      [1, constant(1)],
      [1, constant(256)],
    ]),
  ),
});

/**
 * A value as an integer count of units in its last place, and back.
 *
 * @param value - The value.
 * @returns Its signed digits and its scale.
 */
const unitsOf = ({ fraction, negative, whole }: Value): readonly [bigint, number] => {
  const magnitude = BigInt(`0${whole}${fraction}`);

  return [negative ? -magnitude : magnitude, fraction.length];
};

/**
 * The value a signed count of units at a scale names.
 *
 * @param units - The count.
 * @param scale - The places past the point.
 * @returns The value.
 */
const valueOf = (units: bigint, scale: number): Value => {
  const digits = (units < 0n ? -units : units).toString().padStart(scale + 1, "0");

  return {
    fraction: digits.slice(digits.length - scale).replace(regex("0+$", "u"), ""),
    negative: units < 0n,
    whole: digits.slice(0, digits.length - scale).replace(regex("^0+", "u"), ""),
  };
};

/**
 * A value's neighbour: one unit in its last place either side, so the two differ only there.
 *
 * @param value - The value.
 * @param step - The unit's sign.
 * @returns The neighbour.
 */
const neighbourOf = (value: Value, step: bigint): Value => {
  const [units, scale] = unitsOf(value);

  return valueOf(units + step, scale);
};

/**
 * A value moved one place: ten times it, or a tenth of it.
 *
 * @param value - The value.
 * @param up - Whether it is multiplied.
 * @returns The moved value.
 */
const movedOf = (value: Value, up: boolean): Value => {
  const [units, scale] = unitsOf(value);

  return up ? valueOf(units * 10n, scale) : valueOf(units, scale + 1);
};

/**
 * The forms outside `xs:decimal`'s lexical space a case may write: a lone point or sign, the empty
 * text, a double's exponent or special values, and texts nothing reads as a decimal.
 */
const outsideForms = [
  "",
  ".",
  "+",
  "-",
  "-.",
  "+.",
  "1e3",
  "INF",
  "NaN",
  "abc",
  "1 0",
  "0x10",
  "1.2.3",
] as const;

/**
 * The adversarial pairs, each drawn by name, `aria-valuemin` first: the edges of the former form,
 * of the lexical space and of the oracle's former form.
 */
const adversarial = [
  {
    forms: [`0.${"0".repeat(255)}2`, `0.${"0".repeat(255)}1`],
    name: "256 fraction digits out of order",
  },
  {
    forms: [`2${"0".repeat(256)}`, `1${"0".repeat(256)}`],
    name: "257 integer digits out of order",
  },
  { forms: ["9".repeat(300), `-${"9".repeat(300)}`], name: "300 digits out of order across zero" },
  { forms: [`-${"9".repeat(300)}`, "9".repeat(300)], name: "300 digits in order across zero" },
  {
    forms: [`1.${"3".repeat(299)}4`, `1.${"3".repeat(299)}3`],
    name: "one unit apart past 255 fraction digits",
  },
  {
    forms: [`1.${"3".repeat(300)}`, `1.${"3".repeat(300)}000`],
    name: "one value spelled apart past 255 fraction digits",
  },
  { forms: [`${"0".repeat(300)}2`, "1"], name: "a zero run past 255 out of order" },
  { forms: [".5", "0.4"], name: "a bare fraction" },
  { forms: ["5.", "4"], name: "a trailing point" },
  { forms: ["-0", "0"], name: "a negative zero" },
  { forms: [" 2 ", "1"], name: "a padded value" },
  { forms: [".", "-1"], name: "a lone point" },
  { forms: ["", "-1"], name: "an empty value" },
  { forms: ["+", "-1"], name: "a lone sign" },
  { forms: ["1e3", "2"], name: "an exponent" },
] as const satisfies readonly {
  readonly forms: readonly [string, string];
  readonly name: string;
}[];

/**
 * An adversarial pair's name.
 */
type AdversarialName = (typeof adversarial)[number]["name"];

/**
 * One case: its two forms, `aria-valuemin` first, and the adversarial pair it was drawn as.
 */
interface RangeCase {
  readonly forms: readonly [string, string];
  readonly name: Option.Option<AdversarialName>;
}

/**
 * Draw a form: a value spelled at an edge, or a form outside the lexical space.
 */
const forms: Gen<string> = weighted([
  [8, (source) => spell(source.draw(values), source.draw(spellings))],
  [1, element(outsideForms)],
]);

/**
 * Write two related values, each in a spelling drawn for it, either way round.
 *
 * @param related - The second value, of the first.
 * @returns The pair's generator.
 */
const pairOf =
  (related: Gen<(value: Value) => Value>): Gen<readonly [string, string]> =>
  (source) => {
    const value = source.draw(values);
    const written = [
      spell(value, source.draw(spellings)),
      spell(source.draw(related)(value), source.draw(spellings)),
    ] as const;

    return source.draw(boolean) ? written : [written[1], written[0]];
  };

/**
 * The cases: a value spelled twice, beside its neighbour, its negation or itself moved a place,
 * two forms at the edges, and the adversarial pairs by name.
 */
const cases: Gen<RangeCase> = weighted<RangeCase>([
  [2, (source) => ({ forms: source.draw(pairOf(() => (value) => value)), name: Option.none() })],
  [
    3,
    (source) => ({
      forms: source.draw(
        pairOf((inner) => {
          const step = inner.draw(element([-1n, 1n] as const));

          return (value) => neighbourOf(value, step);
        }),
      ),
      name: Option.none(),
    }),
  ],
  [
    1,
    (source) => ({
      forms: source.draw(pairOf(() => (value) => ({ ...value, negative: !value.negative }))),
      name: Option.none(),
    }),
  ],
  [
    1,
    (source) => ({
      forms: source.draw(
        pairOf((inner) => {
          const up = inner.draw(boolean);

          return (value) => movedOf(value, up);
        }),
      ),
      name: Option.none(),
    }),
  ],
  [2, (source) => ({ forms: [source.draw(forms), source.draw(forms)], name: Option.none() })],
  [
    2,
    (source) => {
      const { forms: named, name } = source.draw(element(adversarial));

      return { forms: named, name: Option.some(name) };
    },
  ],
]);

/**
 * Write the item of a case: one division in its body, with the case's ARIA range.
 *
 * @param drawnCase - The case.
 * @returns The item's text.
 */
const itemOf = ({ forms: [min, max] }: RangeCase): string =>
  [
    '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="item" title="Item" time-dependent="false">',
    `<qti-item-body><div aria-valuemin="${min}" aria-valuemax="${max}"/></qti-item-body>`,
    "</qti-assessment-item>",
  ].join("");

/**
 * The law oracle's laws over the composed grammar, built once.
 */
const oracleLaws = lawsOf(grammar);

/**
 * A situation the search must reach: each verdict, each edge a value sits past, a padded form, one
 * value spelled apart, and each plant caught.
 */
type Situation =
  | "broken"
  | "caught: the oracle's former decimal form"
  | "caught: the schema's former bounded form"
  | "fraction digits past 255"
  | "held"
  | "integer digits past 256"
  | "negative"
  | "outside the lexical space"
  | "padded"
  | "past the parse's bytes"
  | "spelled apart";

/**
 * Name the edges a collapsed form sits past.
 *
 * @param form - The form, collapsed.
 * @returns Its situations.
 */
const edgesOf = (form: string): readonly Situation[] =>
  Option.match(canonicalOf(form), {
    onNone: () => ["outside the lexical space"],
    onSome: ({ fraction, negative, whole }) => {
      const situations: readonly (readonly [Situation, boolean])[] = [
        ["integer digits past 256", whole.length > 256],
        ["fraction digits past 255", fraction.length > 255],
        ["negative", negative],
      ];

      return situations.flatMap(([situation, holds]) => (holds ? [situation] : []));
    },
  });

/**
 * The situations a case reaches: its verdict, each edge its values sit past, a padded form, and
 * one value spelled apart.
 *
 * @param drawnCase - The case.
 * @param expected - The reference's verdict, whether the order is broken.
 * @returns Its situations.
 */
const situationsOf = (drawnCase: RangeCase, expected: boolean): readonly Situation[] => {
  const [min, max] = formsRead(drawnCase.forms);
  const padded = drawnCase.forms.some(
    (form) => form !== collapsed(form) && xsDecimal.test(collapsed(form)),
  );
  const apart =
    min !== max &&
    !above(min, max) &&
    !above(max, min) &&
    xsDecimal.test(min) &&
    xsDecimal.test(max);

  return [
    expected ? "broken" : "held",
    ...edgesOf(min),
    ...edgesOf(max),
    ...(padded ? ["padded" as const] : []),
    ...(apart ? ["spelled apart" as const] : []),
  ];
};

/**
 * The plants a case catches: each former reading whose verdict on it differs from the reference's,
 * the former check's only where the domains admit the pair's row.
 *
 * @param forms - Its two forms, collapsed.
 * @param expected - The reference's verdict.
 * @returns The plants caught.
 */
const caughtOf = (
  [min, max]: readonly [string, string],
  expected: boolean,
): readonly Situation[] => {
  const plants: readonly (readonly [Situation, Option.Option<boolean>])[] = [
    [
      "caught: the schema's former bounded form",
      brokenIn(
        Result.map(evaluateFormer.admit(AriaBounds, boundsRow([min, max])), (admitted) =>
          evaluateFormer(AriaBounds, admitted),
        ),
        ({ checks }) => checks.Former_aria_value_range,
        `the former check on ${Formatter.format([min, max])}`,
      ),
    ],
    ["caught: the oracle's former decimal form", Option.some(formerOracleBelow(max, min))],
  ];

  return plants.flatMap(([plant, broken]) =>
    Option.exists(broken, (verdict) => verdict !== expected) ? [plant] : [],
  );
};

/**
 * Whether a collapsed form is an `xs:decimal` past the bytes `Text.parseDecimal` reads,
 * `parsedDecimalBytes`: a value "Aria value range" holds by its own arm and "Key text bound"
 * refuses, a stated limit of the representation.
 *
 * @param form - The form, collapsed.
 * @returns Whether it is.
 */
const pastParsedBytes = (form: string): boolean =>
  xsDecimal.test(form) && utf8Length(form) > parsedDecimalBytes;

/**
 * Judge a case: the schema's checks, the oracle and the reference agree on whether its order is
 * broken and whether a value is past the parse's bytes, and each plant that disagrees with the
 * reference is caught.
 *
 * @param drawnCase - The case.
 * @param note - Where to note its situations.
 * @returns The effect that judges it.
 */
const judged = (drawnCase: RangeCase, note: (situation: Situation) => void) =>
  Effect.gen(function* judgedCase() {
    const xml = yield* Effect.orDie(readXml(new TextEncoder().encode(itemOf(drawnCase))));
    const tree = yield* Effect.orDie(shred(xml, shredGrammarOf(grammar)));
    const folded = yield* Effect.orDie(Effect.fromResult(fold(tree, foldGrammarOf(grammar))));
    const read = formsRead(drawnCase.forms);
    const pastParse = read.some(pastParsedBytes);
    const expected = !pastParse && above(...read);
    const label = Formatter.format(drawnCase.forms);
    const evaluated = insideDomains(
      Result.map(evaluateQti.admit(AriaBounds, boundsRow(read)), (admitted) =>
        evaluateQti(AriaBounds, admitted),
      ),
      label,
    );
    const breaches = documentBreaches("item.xml", folded, oracleLaws);

    assert.deepStrictEqual(
      [
        Option.getOrThrow(
          brokenIn(Result.succeed(evaluated), ({ checks }) => checks.Aria_value_range, label),
        ),
        Option.getOrThrow(
          brokenIn(Result.succeed(evaluated), ({ checks }) => checks.Key_text_bound, label),
        ),
      ],
      [expected, pastParse],
      `the schema's Aria_value_range and Key_text_bound on ${label}`,
    );
    assert.deepStrictEqual(
      [
        breaches.some(({ law }) => law === "Aria value range"),
        breaches.some(({ law }) => law === "Key text bound"),
      ],
      [expected, pastParse],
      `the oracle's Aria value range and Key text bound on ${label}`,
    );
    if (pastParse) {
      note("past the parse's bytes");
    }

    for (const situation of [...situationsOf(drawnCase, expected), ...caughtOf(read, expected)]) {
      note(situation);
    }
  });

/**
 * Every situation the search requires, and every adversarial pair by name.
 */
const situations: readonly [Situation | AdversarialName, ...(Situation | AdversarialName)[]] = [
  "broken",
  "held",
  "integer digits past 256",
  "fraction digits past 255",
  "negative",
  "outside the lexical space",
  "padded",
  "past the parse's bytes",
  "spelled apart",
  "caught: the schema's former bounded form",
  "caught: the oracle's former decimal form",
  ...adversarial.map(({ name }) => name),
];

describe("qti/interactions.ts, the ARIA range's decimal order", () => {
  it("evaluates AriaBounds under the installed Aria_value_range check, and under its former statement beside it", () => {
    /**
     * Oracle: the schema's statements, which `Qti` holds once each, and the one restated here,
     * each set read in name order, as the evaluator's checks are keyed in law order.
     */
    const row = boundsRow(["0", "1"]);
    assert.deepStrictEqual(
      Object.keys(
        insideDomains(
          Result.map(evaluateQti.admit(AriaBounds, row), (admitted) =>
            evaluateQti(AriaBounds, admitted),
          ),
          "a row",
        ).checks,
      ).toSorted(),
      ["Aria_value_range", "Key_text_bound"],
    );
    assert.deepStrictEqual(
      Object.keys(
        insideDomains(
          Result.map(evaluateFormer.admit(AriaBounds, row), (admitted) =>
            evaluateFormer(AriaBounds, admitted),
          ),
          "a row",
        ).checks,
      ).toSorted(),
      ["Aria_value_range", "Former_aria_value_range", "Key_text_bound"],
    );
  });

  it.effect(
    "breaks an ARIA range exactly where the decimals XML Schema 1.1 maps its values to are out of order, past grizzle's former bounded form of numeric, and catches each plant of the former reading",
    (ctx) =>
      // Oracle: the specification as a checker, the reference above (XML Schema 1.1's
      // decimalLexicalRep, its values ordered by their canonical digits).
      // Bound: 1,200 cases, a sixth of the pairs the 15 adversarial ones by name, the rest values
      // of 0 to 600 integer and fraction digits, each part at the former form's bounds and one or
      // two past, zero runs of 0, 1 and 256 either side, spelled twice, beside a neighbour one unit
      // in the last place either side, its negation or itself moved a place, or two forms drawn
      // apart, a form outside the lexical space among them.
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.seconds(10),
            coverage: required<Situation | AdversarialName>(situations, {
              cases: 1000,
              sense: notesOnly,
            }),
            draw: drawn(cases),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "XML Schema 1.1's decimalLexicalRep, its values ordered by their canonical digits",
            },
            runs: 1200,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "pantry/qti/decimal-order",
          },
          (drawnCase, c) =>
            Effect.gen(function* rangeCase() {
              for (const name of Option.toArray(drawnCase.name)) {
                c.note(name);
              }

              yield* judged(drawnCase, (situation) => {
                c.note(situation);
              });
            }),
        ),
      ),
  );
});
