/**
 * Variable declarations and their values: the O2 overlays (plan §1.7; the W5 amendment's C17, C18
 * and D entry for Q5.08; the tier-1 addendum's G-match, G-parse and "Text in keys").
 *
 * A declaration, its value sets and its values store nothing of their own (decision S3: no copies).
 * Each fact of them is its node's or its attributes', which the laws read where they stand: a
 * declaration is a `qti-{response,outcome,template,context}-declaration` node, of
 * {@link declarationKinds}; its name, its cardinality and its base type are its attributes'
 * `value`s, read through `QtiViews` (`#pantry/qti/names.ts`), the name views' one definition of
 * what a declaration declares, `DeclarationCardinality` and `DeclarationBaseType` among them, each
 * the attribute's value joined to its code (C17); a value set and a value are their nodes, a set's
 * declaration and a value's set each its node's parent; and a record's field is a value's
 * `field-identifier`, its base type the value's own `base-type`. Every law that reads them is a
 * rule over a query (`#pantry/qti/overlay-queries/declaration.ts`), but "Value cardinality"'s "both
 * or neither", which compares two attribute selections here.
 *
 * Three overlays of an outcome declaration's normal scale stay rows of their own, each keyed by
 * its declaration's place, `(package, path, start)`, with its lexical form: {@link MasteryValue},
 * {@link NormalMaximum} and {@link NormalMinimum}, the last where it writes one and else the XSD's
 * default (spec reading 149). "Mastery range" reads each pair of them as `xs:double` values, which
 * a rule over a query parses only from a text of bounded bytes, and an attribute's `value` is
 * unbounded (grizzle's README, "Text").
 *
 * No field stands for an attribute its element does not write: a value that may be missing is a row
 * of its own relation, or a row of a query, only where it is (AGENTS.md, Schema intent). A record
 * has no base type, so a law that reads a declaration's base type judges only those that have one
 * (lane NIL's audit, B12), and one that reads its cardinality those that have one.
 *
 * A declaration is judged by every law that does not read what it lacks, whatever its identifier,
 * cardinality and base type spell (spec readings 157 and 158): each that is unwritten, or spells
 * nothing, is absent from the views alone, so AL3 or its value domain refuses it alone.
 *
 * Every check is named by its oracle law (`#pantry/test/oracle.ts` `LawName`) with spaces written
 * as underscores, since a check's name is an identifier; no law name holds an underscore.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Variables | QTI 3.0 information model, §2.2.2 Item Variables}
 */
import { Compute, contained, natural, on, pg, relation, select } from "@bjornpagen/grizzle";
import type { Term } from "@bjornpagen/grizzle";

import { BuiltInVariable, DeclarationKind, NodeKind } from "#pantry/grammar/install.ts";
import type { BaseType, Cardinality } from "#pantry/grammar/install.ts";
import { ncNamePattern } from "#pantry/grammar/domains.ts";
import { attributesOf } from "#pantry/qti/attributes.ts";
import { EntryPath, keyText, PackageName } from "#pantry/qti/limits.ts";
import { doublePattern } from "#pantry/qti/operators.ts";
import { Node } from "#pantry/qti/node.ts";

import { itemKind } from "#pantry/vocab/terms/tests.ts";

/**
 * A name that names something, whole: an NCName (`ncNamePattern`). It is `IdentifierDType`'s
 * lexical space once collapsed, which AL1 holds each written identifier to; and the reference
 * member of a literal-or-reference union (`VariableStringDType`, `xs:NCName`), which a reference's
 * name matches and no other value does (spec reading 152).
 */
export const namePattern = Compute.pattern<string>(`^${ncNamePattern}$`);

/**
 * The kinds that declare a variable: the `NodeKind` handles that are `DeclarationKind` handles too
 * (`references.ts`: the four kinds that declare `cardinality`, each its own declaration kind).
 */
export const declarationKinds = NodeKind.handles.filter((kind) =>
  DeclarationKind.handles.some((declared) => declared === kind),
);

/**
 * The kinds that hold a declaration's values: its default (any declaration's) and its correct
 * response (a response declaration's), each of one or more `qti-value` children.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_DefaultValue | QTI 3.0 information model, §5.41 DefaultValue}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_CorrectResponse | QTI 3.0 information model, §5.35 CorrectResponse}
 */
export const valueSetKinds = ["qti-default-value", "qti-correct-response"] as const;

/**
 * The built-in session variables, which "are declared implicitly and must not be declared"
 * (information model §2.2.2): every built-in but a context variable, `numAttempts` and `duration`
 * (§2.2.2.2: "must not appear in a 'response declaration'") and `completionStatus` (§2.2.2.3: "must
 * not appear in an outcome declaration"), the reserved identifiers of tables 4.5.1, 5.115.1 and
 * 5.151.1 ("The identifiers of the built-in session variables are reserved. They are
 * completionStatus, numAttempts and duration"). Spec reading 72: the name is spelled exactly, with
 * no alias, so `completion_status` is an ordinary identifier. Each name is read once, though
 * `BuiltInVariable` holds `duration` under an item's roots and a test's alike. The ones a
 * declaration may not name are an item's, {@link itemSessionVariables}, since pantry stores no
 * test.
 *
 * The built-in context variable `QTI_CONTEXT` is no session variable: the implementation guide
 * declares it explicitly, "an explicit (though unnecessary) qti-context-declaration of QTI_CONTEXT"
 * (§3.7.11), so {@link contextVariable} holds its declaration to its built-in type instead.
 */
export const sessionVariables = [
  ...new Set(
    BuiltInVariable.rows
      .filter(({ declaration }) => declaration !== "qti-context-declaration")
      .map(({ variable }) => variable),
  ),
];

/**
 * The session variables an item's declaration may not name: the three of an item, `numAttempts`,
 * `duration` and `completionStatus` (reading 168), the ones an item's processing holds.
 */
export const itemSessionVariables: readonly string[] = [
  ...new Set(
    BuiltInVariable.rows
      .filter(
        ({ declaration, root }) => root === itemKind && declaration !== "qti-context-declaration",
      )
      .map(({ variable }) => variable),
  ),
];

/**
 * A name the specification types where it is declared: the declaration kind a declaration of the
 * name must be, and the base type it must have.
 */
interface ReservedBaseType {
  readonly baseType: (typeof BaseType.handles)[number];
  readonly identifier: string;
  readonly kind: (typeof DeclarationKind.handles)[number];
}

/**
 * The outcome names the specification types (information model §2.2.2.3, Outcomes Variable: "Items
 * that declare a numeric outcome variable ... should use the outcome name 'SCORE' ... SCORE MUST be
 * a float", "Items that declare a maximum score ... MAXSCORE MUST be a float", "Items or tests that
 * want to make the fact that the candidate scored above a predefined threshold available as a
 * variable should use the 'PASSED' variable. PASSED MUST be a boolean"). Pantry stores no test
 * (reading 228), so each type binds every declaration of its name. An outcome of another name is
 * untyped by them.
 */
export const reservedBaseTypes: readonly ReservedBaseType[] = [
  { baseType: "float", identifier: "SCORE", kind: "qti-outcome-declaration" },
  { baseType: "float", identifier: "MAXSCORE", kind: "qti-outcome-declaration" },
  { baseType: "boolean", identifier: "PASSED", kind: "qti-outcome-declaration" },
];

/**
 * The built-in context variable, which may be declared only as the context record it is built in as
 * (information model §2.2.2.1: "There is one built-in context variable: 'QTI_CONTEXT', which has
 * record cardinality"; the implementation guide's "explicit (though unnecessary)
 * qti-context-declaration of QTI_CONTEXT", §3.7.11). A declaration of another kind or cardinality
 * would make one identifier name two variables, which spec reading 74 refuses.
 */
export const contextVariable = {
  cardinality: "record",
  identifier: "QTI_CONTEXT",
  kind: "qti-context-declaration",
} as const satisfies {
  readonly cardinality: (typeof Cardinality.handles)[number];
  readonly identifier: string;
  readonly kind: (typeof DeclarationKind.handles)[number];
};

// GRIZZLE-PENDING: REPSWEEP-CORE, grizzle's byte guard for a query's match over a text with no
// byte bound. Then "Mastery range" parses an attribute's `value`, and MasteryValue,
// NormalMaximum and NormalMinimum are the attributes' values (`attributeValues`), the default a
// second rule over the outcome declarations that write no `normal-minimum`, and their copies go.

/**
 * An outcome declaration's `mastery-value`, keyed by its declaration's place, where it writes one:
 * its lexical form as written.
 */
export const MasteryValue = relation(
  "MasteryValue",
  { lexical: keyText, package: PackageName, path: EntryPath, start: natural },
  ["package", "path", "start"],
);

/**
 * An outcome declaration's normal minimum, keyed by its declaration's place, which every outcome
 * declaration has (spec reading 149): `lexical`, its `normal-minimum` as written where `written`,
 * and else the XSD's default (`normalMinimumDefault` of `#pantry/vocab/terms/declarations.ts`),
 * which `E1_derived` proves.
 */
export const NormalMinimum = relation(
  "NormalMinimum",
  {
    lexical: keyText,
    package: PackageName,
    path: EntryPath,
    start: natural,
    written: pg.boolean,
  },
  ["package", "path", "start"],
);

/**
 * An outcome declaration's `normal-maximum`, keyed by its declaration's place, where it writes one,
 * as {@link MasteryValue} is its mastery value.
 */
export const NormalMaximum = relation(
  "NormalMaximum",
  { lexical: keyText, package: PackageName, path: EntryPath, start: natural },
  ["package", "path", "start"],
);

/**
 * The outcome declarations, each of which has its {@link NormalMinimum}, written or the XSD's
 * default.
 */
const outcomeDeclarations = select(Node, (n) => n.eq(n.kind, "qti-outcome-declaration"));

/**
 * The `field-identifier` of each value that writes one, a record's field, whose name it is: "Value
 * cardinality" holds every value of a record's set to one, a rule over a query
 * (`#pantry/qti/overlay-queries/declaration.ts`).
 */
export const fieldIdentifiers = attributesOf("field-identifier", ["qti-value"]);

/**
 * The `base-type` of each value that writes one, a record's field's.
 */
const fieldBaseTypes = attributesOf("base-type", ["qti-value"]);

/**
 * The `mastery-value` of each outcome declaration that writes one.
 */
const masteryValues = attributesOf("mastery-value", ["qti-outcome-declaration"]);

/**
 * The `normal-minimum` of each outcome declaration that writes one.
 */
const normalMinimums = attributesOf("normal-minimum", ["qti-outcome-declaration"]);

/**
 * The normal minimums each outcome declaration writes: the {@link NormalMinimum} rows that copy
 * a `normal-minimum` attribute, which a default does not.
 */
const writtenMinimums = select(NormalMinimum, (n) => n.eq(n.written, true));

/**
 * The `normal-maximum` of each outcome declaration that writes one.
 */
const normalMaximums = attributesOf("normal-maximum", ["qti-outcome-declaration"]);

/**
 * A text term a check reads: a row's text field, or a `Compute` term over one.
 */
type Text = Term<string, unknown, unknown, "text">;

/**
 * State that one `xs:double` form is no greater than another, as `Slider_bounds` and
 * `Mastery_range` order a pair (reading 9). A form in `xs:double`'s lexical space
 * (`doublePattern` of `#pantry/qti/operators.ts`, XML Schema 1.0's, reading 71's edition) is the
 * double grizzle's `Compute.parseDouble` maps it to, XML Schema 1.1's doubleLexicalMap (Part 2
 * §3.3.5.2, reading 144), of any digits and any exponent. The rule says what it holds of every
 * other pair in its own arms (grizzle's agent guide: never make an otherwise stand for a value): a
 * pair with a form outside the lexical space holds, since a form that is no `xs:double` has no
 * value and its value domain alone refuses it; and a pair with `NaN` holds, since `NaN` is ordered
 * against nothing. Each parse's otherwise is never read, since an arm holds wherever its guard
 * fails. A grizzle check is a predicate and a `Compute.when`'s branch a term
 * (grizzle's README, "Parsing text"), so the arms stand beside the comparison rather than in a
 * guard's otherwise.
 *
 * @param low - The form that is no greater, as the law reads it.
 * @param high - The form that is no less.
 * @returns The predicate.
 */
export const doublesInOrder = (low: Text, high: Text) =>
  Compute.or(
    Compute.not(Compute.matches(low, doublePattern)),
    Compute.not(Compute.matches(high, doublePattern)),
    Compute.eq(low, "NaN"),
    Compute.eq(high, "NaN"),
    Compute.le(
      Compute.when(Compute.matches(low, doublePattern), (form) => Compute.parseDouble(form), 0),
      Compute.when(Compute.matches(high, doublePattern), (form) => Compute.parseDouble(form), 0),
    ),
  );

/**
 * Every statement over the O2 overlays of the stored level, each named by its oracle law:
 *
 * - **`Declaration overlay`** (C18): each scale row copies its attribute, a mastery value and a
 *   normal maximum exactly where its element writes one, through the copy and its reverse; and
 *   every outcome declaration, and only one, has its {@link NormalMinimum}, the attribute's copy
 *   over its `written` rows where it writes one and else the XSD's default (reading 149).
 * - **`Value cardinality`**: a value writes a `field-identifier` and a `base-type` both or neither,
 *   each only as a record's field (§7.46.1 and §7.46.2), whatever its declaration's cardinality.
 *
 * Every other law over a declaration, its value sets and values, its name, its codes and its
 * scale's pairs, `Mastery range` among them, is a rule over a query
 * (`#pantry/qti/overlay-queries/declaration.ts`), stated there under the same names.
 */
export const declarationLawsByName = {
  "Declaration overlay": [
    contained(
      on(masteryValues, "package", "path", "start", "lexical"),
      on(MasteryValue, "package", "path", "start", "lexical"),
    ),
    contained(
      on(MasteryValue, "package", "path", "start"),
      on(masteryValues, "package", "path", "start"),
    ),
    contained(
      on(normalMinimums, "package", "path", "start", "lexical"),
      on(writtenMinimums, "package", "path", "start", "lexical"),
    ),
    contained(
      on(writtenMinimums, "package", "path", "start"),
      on(normalMinimums, "package", "path", "start"),
    ),
    contained(
      on(outcomeDeclarations, "package", "path", "start"),
      on(NormalMinimum, "package", "path", "start"),
    ),
    contained(
      on(NormalMinimum, "package", "path", "start"),
      on(outcomeDeclarations, "package", "path", "start"),
    ),
    contained(
      on(normalMaximums, "package", "path", "start", "lexical"),
      on(NormalMaximum, "package", "path", "start", "lexical"),
    ),
    contained(
      on(NormalMaximum, "package", "path", "start"),
      on(normalMaximums, "package", "path", "start"),
    ),
  ],
  "Value cardinality": [
    contained(
      on(fieldIdentifiers, "package", "path", "start"),
      on(fieldBaseTypes, "package", "path", "start"),
    ),
    contained(
      on(fieldBaseTypes, "package", "path", "start"),
      on(fieldIdentifiers, "package", "path", "start"),
    ),
  ],
} as const;

/**
 * {@link declarationLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const declarationLaws = Object.values(declarationLawsByName).flat();

/**
 * `declarations.ts`'s relations: an outcome's mastery value and normal range, each end of them.
 */
export const declarationRelations = [MasteryValue, NormalMaximum, NormalMinimum] as const;
