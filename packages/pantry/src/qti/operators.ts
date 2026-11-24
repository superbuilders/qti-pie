/**
 * The operator attribute laws (spec readings 119 and 121):
 * what the information model asks of a rounding operator's `figures` and of an equality's
 * `tolerance` beyond the XSD, which types the one as `xs:integer` or a variable name and the other
 * as an unbounded list of `xs:string` or `xs:double`. Where the two differ, the stricter source is
 * the rule (readings 16 and 17).
 *
 * - **Reading 119** (rule `P10`): a `qti-equal-rounded`'s or a `qti-round-to`'s `figures` that is an
 *   integer is at least 1 under `significantFigures` and at least 0 under `decimalPlaces` ("If
 *   roundingMode= 'significantFigures', the value of figures must be a non-zero positive integer.
 *   If roundingMode='decimalPlaces', the value of figures must be an integer greater than or equal
 *   to zero", info §5.47.2 and §5.119.2). `rounding-mode` defaults to `significantFigures` on
 *   `qti-equal-rounded` (§5.47.1) and is required on `qti-round-to` (§5.119.1, AL3's). A `figures`
 *   that names a variable is read at run time, so it is not judged. The view `RoundingModeFigures`
 *   (`#pantry/qti/overlay-queries/expression.ts`) holds each operator's `figures` beside its mode
 *   in force, the written `rounding-mode` or `qti-equal-rounded`'s default, which no row copies
 *   (C18).
 * - **Reading 121** (rule `P36`): under `tolerance-mode` `absolute` or `relative` a `qti-equal`
 *   carries a `tolerance` ("If the tolerance mode is absolute or relative then the tolerance must
 *   be specified", info §5.46.2), and every `tolerance` is one or two values ("The tolerance
 *   consists of two positive numbers, t0 and t1 ... If only one value is given it is used for
 *   both"), each that is a number above 0. A value is a number where it is written in `xs:double`'s
 *   lexical space, and otherwise a string, which names a variable read at run time (§9.1.5,
 *   ToleranceList: "a space separated list of either strings (must not contain a space) or
 *   numbers"). The view `ToleranceToken` (`#pantry/qti/overlay-queries/expression.ts`) splits each
 *   `tolerance` into its values.
 *
 * `rounding-mode` and `tolerance-mode` are enumerations of `xs:string` under whiteSpace `preserve`,
 * so each value is its lexical form and AL1's lexical half refuses every other form. `figures` is a
 * union whose `xs:integer` member collapses whitespace and whose variable-name member preserves it
 * (decision 123), so its value is read collapsed; `tolerance` is a list, its items split at XML
 * whitespace.
 *
 * Every check is named by its oracle law (`#pantry/test/oracle.ts` `LawName`) with spaces written
 * as underscores.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_EqualRounded | QTI 3.0 information model, §5.47 EqualRounded}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_RoundTo | QTI 3.0 information model, §5.119 RoundTo}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Equal | QTI 3.0 information model, §5.46 Equal}
 */
import { contained, on, select, Text } from "@bjornpagen/grizzle";
import { Attribute, attributesOf } from "#pantry/qti/attributes.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * The tolerance modes under which a `qti-equal` compares within a range, and so carries a
 * `tolerance` (info §5.46.2).
 */
const rangeModes = ["absolute", "relative"] as const;

/**
 * `xs:double`'s lexical space, pantry's one statement of it: XML Schema 1.0's (Part 2 §3.2.5.1),
 * the edition QTI 3.0's XSDs are written in (spec reading 71), a decimal mantissa of any digits
 * with an optional exponent of any digits, `INF`, `-INF` or `NaN`. XML Schema 1.1's adds `+INF`,
 * which this space refuses, the stricter of the two (readings 144 and 154).
 *
 * It lies inside grizzle's `doubleText`, 1.1's grammar, which is this pattern with `+INF`, so
 * `Text.parseDouble` reads every form of it total: a value of it is the double that parse maps
 * it to, XML Schema 1.1's doubleLexicalMap (Part 2 §3.3.5.2, reading 144), and every double pantry
 * reads from a form in the database is read by that parse, guarded by this pattern or typed by it
 * (`Slider_bounds`, `Mastery_range`, `MapKeyFloat`). A tolerance value in it is a number; any other
 * is a string, which names a variable read at run time (spec reading 121).
 *
 * @see {@link https://www.w3.org/TR/xmlschema-2/#double | XML Schema Part 2, 3.2.5 double}
 */
export const doublePattern = Text.pattern(
  "^(?:[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[Ee][+-]?[0-9]+)?|-?INF|NaN)$",
);

/**
 * The positive values of {@link doublePattern}'s space, read off the form: a mantissa with no `-`
 * and a digit other than 0, with any exponent, or `INF`. `NaN`, `-INF` and every zero, `-0` and
 * `0e5` among them, are no positive number.
 *
 * A positive mantissa with a large negative exponent, `1e-400`, is a positive number as written,
 * though binary64 rounds it to 0: "positive" is read of the number the value names, not of its
 * nearest double.
 */
export const positivePattern = Text.pattern(
  "^(?:\\+?(?:[0-9]*[1-9][0-9]*(?:\\.[0-9]*)?|[0-9]*\\.[0-9]*[1-9][0-9]*)(?:[Ee][+-]?[0-9]+)?|INF)$",
);

/**
 * A `qti-equal`'s `tolerance`, one per element.
 */
export const toleranceAttributes = attributesOf("tolerance", ["qti-equal"]);

/**
 * A `qti-equal`'s `tolerance-mode` written as `absolute` or `relative`, each the one lexical form
 * of its value.
 */
const rangeModeAttributes = select(Attribute, (a) =>
  a.and(a.eq(a.kind, "qti-equal"), a.eq(a.name, "tolerance-mode"), a.in(a.lexical, rangeModes)),
);

/**
 * Reading 121's presence (law "Equal tolerance", rule `P36`; info §5.46.2: "If the tolerance mode
 * is absolute or relative then the tolerance must be specified"): a `qti-equal` whose
 * `tolerance-mode` is `absolute` or `relative` writes `tolerance`.
 */
export const toleranceRequired = contained(
  on(rangeModeAttributes, "package", "path", "start"),
  on(toleranceAttributes, "package", "path", "start"),
);

/**
 * Every statement over the operators' attributes, each named by its oracle law: reading 121's
 * presence, {@link toleranceRequired}, whose target is keyed by `Attribute`'s own key at its fixed
 * name. Reading 121's count and sign, and reading 119, read views, so they are rules over a query
 * (`#pantry/qti/overlay-queries/expression.ts`).
 */
export const operatorLawsByName = {
  "Equal tolerance": declared("Equal tolerance", [toleranceRequired]),
} as const;

/**
 * {@link operatorLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const operatorLaws = Object.values(operatorLawsByName).flat();
