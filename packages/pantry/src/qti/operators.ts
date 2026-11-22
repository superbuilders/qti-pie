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
 *   that names a variable is read at run time, so it is not judged. {@link Rounding} holds each
 *   such element's {@link RoundingHolds}, which of the two it has, {@link RoundingFigures} its
 *   `figures`, and {@link RoundingModeFigures} both together, where reading 119 judges them. The
 *   mode in force is the query `RoundingMode` (`#pantry/qti/overlay-queries/expression.ts`): the
 *   written `rounding-mode`, else `qti-equal-rounded`'s default, which no row copies (C18).
 * - **Reading 121** (rule `P36`): under `tolerance-mode` `absolute` or `relative` a `qti-equal`
 *   carries a `tolerance` ("If the tolerance mode is absolute or relative then the tolerance must
 *   be specified", info §5.46.2), and every `tolerance` is one or two values ("The tolerance
 *   consists of two positive numbers, t0 and t1 ... If only one value is given it is used for
 *   both"), each that is a number above 0. A value is a number where it is written in `xs:double`'s
 *   lexical space, and otherwise a string, which names a variable read at run time (§9.1.5,
 *   ToleranceList: "a space separated list of either strings (must not contain a space) or
 *   numbers"). {@link Tolerance} holds each `tolerance`, split into its {@link ToleranceToken}s.
 *
 * `rounding-mode` and `tolerance-mode` are enumerations of `xs:string` under whiteSpace `preserve`,
 * so each value is its lexical form and AL1's lexical half refuses every other form. `figures` is a
 * union whose `xs:integer` member collapses whitespace and whose variable-name member preserves it
 * (decision 123), so its value is read collapsed; `tolerance` is a list, its items split at XML
 * whitespace.
 *
 * Every overlay row is keyed by its element's place, `(package, path, start)`, the key `Node` holds
 * it by. Every copy of an attribute into an overlay follows C18 the other way round, as
 * `identity.ts` states it: from `select(Attribute, φ)` into the overlay, keyed by `Attribute`'s key
 * `(package, path, start, name)` once the selection fixes the name, whose index serves the copy's
 * reverse probe. Every copied text that takes part in a cross-row equality is of its type's bound
 * in a key (`#pantry/qti/limits.ts`), so a key, a containment's target and a lookup hold it as
 * itself. Every check is named by its oracle law (`#pantry/test/oracle.ts` `LawName`) with spaces
 * written as underscores.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_EqualRounded | QTI 3.0 information model, §5.47 EqualRounded}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_RoundTo | QTI 3.0 information model, §5.119 RoundTo}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Equal | QTI 3.0 information model, §5.46 Equal}
 */
import {
  alternatives,
  check,
  closed,
  closedId,
  contained,
  generated,
  Logic,
  mirrors,
  natural,
  on,
  pg,
  relation,
  select,
  Text,
  Type,
} from "@bjornpagen/grizzle";
import { Attribute, attributesOf } from "#pantry/qti/attributes.ts";
import { CopiedLexical, EntryPath, integerForm, PackageName } from "#pantry/qti/limits.ts";
import { Node } from "#pantry/qti/node.ts";
import {
  listTokens,
  tokenFields,
  tokenList,
  tokenTextDigest,
  whitespaceTokens,
} from "#pantry/qti/token-list.ts";
import { roundingKinds, roundingModes } from "#pantry/vocab/terms/operators.ts";
import { anyText } from "#pantry/grammar/install.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * Which of reading 119's two inputs a rounding operator has, its {@link Rounding} row's `holds`:
 * `both`, a `figures` and a mode in force, written or `qti-equal-rounded`'s default; `figures`, a
 * `figures` and no mode, a `qti-round-to` that writes no `rounding-mode`; `mode`, a mode and no
 * `figures`; `neither`, neither. Only `both` is valid: `figures` is required on both kinds
 * (`EqualRoundedDType`, `RoundToDType`) and `rounding-mode` on `qti-round-to`, so every other value
 * is an element AL3 refuses alone, which holds no detail row ({@link RoundingModeFigures} is
 * `both`'s arm alone), never an optional value of the domain.
 */
export const RoundingHolds = closed.ordered("RoundingHolds", [
  "neither",
  "mode",
  "figures",
  "both",
]);

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
 * A rounding operator, keyed by its element's place: one row for every `qti-equal-rounded` and
 * every `qti-round-to`, and its {@link RoundingHolds}, which {@link RoundingFigures} and the mode
 * in force (the query `RoundingMode`, `#pantry/qti/overlay-queries/expression.ts`) prove: it has
 * the one exactly where its `holds` says, and {@link RoundingModeFigures} exactly where it is
 * `both`.
 */
export const Rounding = relation(
  "Rounding",
  {
    holds: closedId(RoundingHolds),
    package: PackageName,
    path: EntryPath,
    start: natural,
  },
  ["package", "path", "start"],
);

/**
 * A rounding operator's `figures`, keyed by its element's place, where it writes one:
 * `figuresLexical` as written, copied from the attribute, and `figures`, that form collapsed, which
 * the database derives.
 */
export const RoundingFigures = relation.generated(
  "RoundingFigures",
  { figuresLexical: CopiedLexical, package: PackageName, path: EntryPath, start: natural },
  ["package", "path", "start"],
  (f) => ({
    figures: generated(CopiedLexical, Text.collapse(f.figuresLexical)),
  }),
);

/**
 * A rounding operator that has both a `figures` and a mode in force, keyed by its element's place:
 * the `both` arm of its {@link Rounding} row's `holds`, which grizzle's `alternatives` states,
 * with its {@link RoundingFigures}' `figures` and its mode in force, `RoundingMode`'s `mode`, the
 * two reading 119 judges together ({@link roundingFigures}).
 */
export const RoundingModeFigures = relation(
  "RoundingModeFigures",
  {
    figures: CopiedLexical,
    mode: anyText,
    package: PackageName,
    path: EntryPath,
    start: natural,
  },
  ["package", "path", "start"],
);

/**
 * One `qti-equal`'s `tolerance`, keyed by the element's place, where it writes one: its
 * {@link ToleranceToken} count, `tokens` (drawn), the end of their concatenation, `tokenText`
 * (accumulated), and its digest, `tokenTextDigest` (generated, the fold's end on the family's last
 * axis). The value as written is the attribute's `lexical`, which no row copies (C18): the rule
 * over the query `ToleranceForm` holds the tokens to it
 * (`#pantry/qti/overlay-queries/expression.ts`).
 */
export const Tolerance = relation.generated(
  "Tolerance",
  {
    package: PackageName,
    path: EntryPath,
    start: natural,
    tokenText: tokenFields.piecesWas,
    tokens: tokenFields.at,
  },
  ["package", "path", "start"],
  (t) => tokenTextDigest(t),
);

/**
 * One value of a `tolerance`, in order, with the whitespace written before and after it, so its
 * `piece` is a stretch of the value and the pieces concatenate to it: a whitespace list's token
 * (`#pantry/qti/token-list.ts`), its family's group the `qti-equal`'s place.
 */
export const ToleranceToken = listTokens("ToleranceToken");

/**
 * Every relation this module declares, in one list, as `schema.ts` composes them.
 */
export const operatorRelations = [
  Rounding,
  RoundingFigures,
  RoundingHolds,
  RoundingModeFigures,
  Tolerance,
  ToleranceToken,
] as const;

/**
 * The rounding operators, each of which has its {@link Rounding} row, and every one of which is
 * one's.
 */
const roundingNodes = select(Node, (n) => n.in(n.kind, roundingKinds));

/**
 * A rounding operator's `figures`, the source of {@link RoundingFigures}.
 */
const figuresAttributes = attributesOf("figures", roundingKinds);

/**
 * The rounding operators that hold a `figures`.
 */
const figuredRoundings = select(Rounding, (r) => r.in(r.holds, ["figures", "both"]));

/**
 * A `qti-equal`'s `tolerance`, each of which has its {@link Tolerance}.
 */
const toleranceAttributes = attributesOf("tolerance", ["qti-equal"]);

/**
 * A `qti-equal`'s `tolerance-mode` written as `absolute` or `relative`, each the one lexical form
 * of its value.
 */
const rangeModeAttributes = select(Attribute, (a) =>
  a.and(a.eq(a.kind, "qti-equal"), a.eq(a.name, "tolerance-mode"), a.in(a.lexical, rangeModes)),
);

/**
 * The least `figures` each rounding mode admits (reading 119; info §5.47.2 and §5.119.2): 1 under
 * `significantFigures`, "a non-zero positive integer", and 0 under `decimalPlaces`, "an integer
 * greater than or equal to zero".
 */
const leastFigures = { decimalPlaces: 0n, significantFigures: 1n } as const;

/**
 * Reading 119 (law "Rounding figures", rule `P10`; info §5.47.2 and §5.119.2): a `figures` that is
 * an integer is at least its mode's {@link leastFigures}. A variable's name is no integer, and a
 * mode outside the enumeration (AL1's) binds no bound; an operator with no `figures` or no mode is
 * AL3's, and has no {@link RoundingModeFigures} row to judge. The cast reads only an integer's
 * form, which the guard proves, so its `otherwise` is the least itself, which the bound admits.
 */
const roundingFigures = check("Rounding_figures", RoundingModeFigures, (m) =>
  m.or(
    m.not(Text.matches(m.figures, integerForm)),
    m.and(
      ...roundingModes.map((mode) =>
        m.or(
          m.ne(m.mode, mode),
          m.ge(
            Logic.when(
              Text.matches(m.figures, integerForm),
              (figures) => Type.cast(figures, pg.bigint),
              leastFigures[mode],
            ),
            leastFigures[mode],
          ),
        ),
      ),
    ),
  ),
);

/**
 * Reading 121's presence (law "Equal tolerance", rule `P36`; info §5.46.2: "If the tolerance mode
 * is absolute or relative then the tolerance must be specified"): a `qti-equal` whose
 * `tolerance-mode` is `absolute` or `relative` has a {@link Tolerance} row, which exists exactly
 * where it writes `tolerance`.
 */
export const toleranceRequired = contained(
  on(rangeModeAttributes, "package", "path", "start"),
  on(Tolerance, "package", "path", "start"),
);

/**
 * Reading 121's count (law "Equal tolerance", rule `P36`; info §5.46.2: "The tolerance consists of
 * two positive numbers, t0 and t1 ... If only one value is given it is used for both"): a
 * `tolerance` holds one value or two.
 */
const toleranceCount = check("Equal_tolerance", Tolerance, (t) => t.in(t.tokens, [1n, 2n]));

/**
 * Reading 121's sign (law "Equal tolerance", rule `P36`; info §5.46.2, "two positive numbers"): a
 * tolerance value in `xs:double`'s lexical space is positive. A string names a variable and is
 * read at run time.
 */
const tolerancePositive = check("Equal_tolerance", ToleranceToken, (x) =>
  x.or(x.not(Text.matches(x.token, doublePattern)), Text.matches(x.token, positivePattern)),
);

/**
 * Every statement over the operator overlays, each `check` named by its oracle law:
 *
 * - **Rounding:** a row exactly at each rounding operator's node; its `holds` proved by its `figures`
 *   (both ways) and by its mode in force (both ways, a rule over the query `RoundingMode`, which
 *   derives the mode, written or the default); its `figures` copied into {@link RoundingFigures}
 *   and collapsed; its `both` arm, {@link RoundingModeFigures}, an `alternatives` arm, copying both
 *   (the mode a rule over the query); and reading 119, {@link roundingFigures};
 * - **Tolerance:** a row exactly where a `qti-equal` writes `tolerance`; its values a family, each
 *   value a maximal run of no whitespace, whose concatenation the rule over the query
 *   `ToleranceForm` holds to the attribute's lexical form, or none for a form of whitespace alone
 *   (`E1_derived`);
 * - **Reading 121:** {@link toleranceRequired}, {@link toleranceCount} and {@link tolerancePositive}.
 */
export const operatorLawsByName = {
  "E1 derived": declared("E1 derived", [
    mirrors(
      on(roundingNodes, "package", "path", "start"),
      on(Rounding, "package", "path", "start"),
    ),
    contained(
      on(figuresAttributes, "package", "path", "start", "lexical"),
      on(RoundingFigures, "package", "path", "start", "figuresLexical"),
    ),
    contained(
      on(RoundingFigures, "package", "path", "start"),
      on(figuresAttributes, "package", "path", "start"),
    ),
    mirrors(
      on(RoundingFigures, "package", "path", "start"),
      on(figuredRoundings, "package", "path", "start"),
    ),
    alternatives(Rounding, "holds", RoundingHolds, { both: RoundingModeFigures }),
    contained(
      on(RoundingModeFigures, "package", "path", "start", "figures"),
      on(RoundingFigures, "package", "path", "start", "figures"),
    ),
    mirrors(
      on(toleranceAttributes, "package", "path", "start"),
      on(Tolerance, "package", "path", "start"),
    ),
    ...tokenList(ToleranceToken, Tolerance, whitespaceTokens(ToleranceToken)),
  ]),
  "Equal tolerance": declared("Equal tolerance", [
    toleranceRequired,
    toleranceCount,
    tolerancePositive,
  ]),
  "Rounding figures": declared("Rounding figures", [roundingFigures]),
} as const;

/**
 * {@link operatorLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const operatorLaws = Object.values(operatorLawsByName).flat();
