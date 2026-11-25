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
 * rule over a query (`#pantry/qti/overlay-queries/declaration.ts`).
 *
 * An outcome declaration's normal scale is its attributes' values too: `MasteryValue`,
 * `NormalMaximum` and `NormalMinimum` (`#pantry/qti/overlay-queries/declaration.ts`) are queries
 * of the doubles those values name, the last where the declaration writes none being the XSD's
 * default (spec reading 149), and "Mastery range" orders each pair of them as doubles.
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
import { Logic, Text } from "@bjornpagen/grizzle";
import type { Term } from "@bjornpagen/grizzle";

import { BuiltInVariable, DeclarationKind, NodeKind } from "#pantry/grammar/install.ts";
import type { Cardinality } from "#pantry/grammar/install.ts";
import { ncNamePattern } from "#pantry/grammar/domains.ts";
import { attributesOf } from "#pantry/qti/attributes.ts";
import { doublePattern } from "#pantry/qti/operators.ts";

import { itemKind, testKind } from "#pantry/vocab/terms/tests.ts";

/**
 * A name that names something, whole: an NCName (`ncNamePattern`). It is `IdentifierDType`'s
 * lexical space once collapsed, which AL1 holds each written identifier to; and the reference
 * member of a literal-or-reference union (`VariableStringDType`, `xs:NCName`), which a reference's
 * name matches and no other value does (spec reading 152).
 */
export const namePattern = Text.pattern<string>(`^${ncNamePattern}$`);

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
 * `BuiltInVariable` holds `duration` under an item's roots and a test's alike. Which of them a
 * declaration may not name depends on its document's root: {@link itemSessionVariables} and
 * {@link testSessionVariables}.
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
] as const;

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
 * The session variables a test's declaration may not name: `duration` alone, the one a test's
 * processing holds beside its context, so a test's own `numAttempts` and `completionStatus` are
 * ordinary names there (spec reading 168).
 */
export const testSessionVariables: readonly string[] = [
  ...new Set(
    BuiltInVariable.rows
      .filter(
        ({ declaration, root }) => root === testKind && declaration !== "qti-context-declaration",
      )
      .map(({ variable }) => variable),
  ),
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

/**
 * The `field-identifier` of each value that writes one, whatever it spells: "Value cardinality"
 * holds every value of a record's set to one, a rule over a query
 * (`#pantry/qti/overlay-queries/declaration.ts`). On a value of any other set it names nothing and
 * no law reads it (information model §7.46.1: "This characterisic is only used for specifying the
 * field identifier for a value that forms part of a record").
 */
export const fieldIdentifiers = attributesOf("field-identifier", ["qti-value"]);

/**
 * The `base-type` of each value that writes one, whatever it spells: "Value cardinality" holds
 * every value of a record's set to one, as {@link fieldIdentifiers} is. On a value of any other set
 * it types nothing, the declaration's own base type typing the value (information model §7.46:
 * "The base-type is defined by the 'base-type' attribute of the declaration except in the case of
 * variables with record cardinality"; §7.46.2: "This characteristic is only used for specifying the
 * base-type of a value that forms part of a record").
 */
export const fieldBaseTypes = attributesOf("base-type", ["qti-value"]);

/**
 * A text term a check reads: a row's text field, or a scalar term over one.
 */
type TextTerm = Term<string, unknown, unknown, "text">;

/**
 * State that one `xs:double` form is no greater than another, as `Slider_bounds` and
 * `Mastery_range` order a pair (reading 9). A form in `xs:double`'s lexical space
 * (`doublePattern` of `#pantry/qti/operators.ts`, XML Schema 1.0's, reading 71's edition) is the
 * double grizzle's `Text.parseDouble` maps it to, XML Schema 1.1's doubleLexicalMap (Part 2
 * §3.3.5.2, reading 144), of any digits and any exponent. The rule says what it holds of every
 * other pair in its own arms (grizzle's agent guide: never make an otherwise stand for a value): a
 * pair with a form outside the lexical space holds, since a form that is no `xs:double` has no
 * value and its value domain alone refuses it; and a pair with `NaN` holds, since `NaN` is ordered
 * against nothing. Each parse's otherwise is never read, since an arm holds wherever its guard
 * fails. A grizzle check is a predicate and a `Logic.when`'s branch a term
 * (grizzle's README, "Parsing text"), so the arms stand beside the comparison rather than in a
 * guard's otherwise.
 *
 * @param low - The form that is no greater, as the law reads it.
 * @param high - The form that is no less.
 * @returns The predicate.
 */
export const doublesInOrder = (low: TextTerm, high: TextTerm) =>
  Logic.or(
    Logic.not(Text.matches(low, doublePattern)),
    Logic.not(Text.matches(high, doublePattern)),
    Logic.eq(low, "NaN"),
    Logic.eq(high, "NaN"),
    Logic.le(
      Logic.when(Text.matches(low, doublePattern), (form) => Text.parseDouble(form), 0),
      Logic.when(Text.matches(high, doublePattern), (form) => Text.parseDouble(form), 0),
    ),
  );
