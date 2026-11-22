/**
 * The registry's general-purpose custom operators (plan/composable-operators.md §2, Bjorn's ruling
 * of 2026-11-20: "overloading qti operators is STRICTLY prohibited … implement these as custom
 * operators, hopefully operators that compose"): small value-returning primitives over which QTI's
 * own operators do every comparison, and the AI grader, the one value no standard expression
 * computes. Each class's value has one exact, specified definition (the design's §2), which the
 * grader implements in SQL; this module states each one's identity and contract, which `registryOf`
 * installs and `OutsideProfile` holds every application to.
 *
 * Every definition URI is an RFC 4151 tag URI under Superbuilders' authority, a name never fetched
 * (spec/custom- operators.md §1.5). Each primitive is NULL iff a value operand is NULL, an empty
 * string result is NULL (ASI §2.11), and each is pure and total.
 *
 * @module
 */
import type { CustomOperator, Operand } from "#ledger/registry/contract.ts";

/**
 * The authority and date every operator's definition URI is minted under (RFC 4151 §2.1, `tagURI =
 * "tag:" taggingEntity ":" specific`): Superbuilders' domain, in 2026.
 */
export const operatorTagPrefix = "tag:superbuilders.school,2026:qti/custom-operator/";

/**
 * The definition URI a class is bound by.
 *
 * @param operatorClass - The class.
 * @returns Its tag URI.
 */
const definitionOf = <const C extends string>(operatorClass: C) =>
  `${operatorTagPrefix}${operatorClass}` as const;

/**
 * A text operand of any expression: the value a primitive reads.
 */
const text: Operand = { baseType: "string", cardinality: "single", form: "any", name: "text" };

/**
 * A string literal operand.
 *
 * @param name - The operand's name.
 * @returns The operand.
 */
const stringLiteral = (name: string): Operand => ({
  baseType: "string",
  cardinality: "single",
  form: "literal",
  name,
});

/**
 * A boolean literal operand: a `qti-base-value` of base type boolean (a switch the content states,
 * as `math-canonical`'s `reduce`, C6's).
 *
 * @param name - The operand's name.
 * @returns The operand.
 */
const booleanLiteral = (name: string): Operand => ({
  baseType: "boolean",
  cardinality: "single",
  form: "literal",
  name,
});

/**
 * An operand of any expression of any base type and any cardinality (P13's probe and value).
 *
 * @param name - The operand's name.
 * @returns The operand.
 */
const anyValue = (name: string): Operand => ({
  baseType: "any",
  cardinality: "any",
  form: "any",
  name,
});

/**
 * A literal set of strings: a `qti-multiple` of string base values, NULL where the item states
 * none.
 *
 * @param name - The operand's name.
 * @returns The operand.
 */
const stringSet = (name: string): Operand => ({
  baseType: "string",
  cardinality: "multiple",
  form: "literal",
  name,
});

/**
 * A text-to-text primitive's contract, of one text operand and a single string value.
 *
 * @param operatorClass - Its class.
 * @returns The operator.
 */
const normalForm = <const C extends string>(operatorClass: C) =>
  ({
    class: operatorClass,
    definition: definitionOf(operatorClass),
    operands: [text],
    result: { baseType: "string", cardinality: "single" },
    source: "inline",
  }) as const satisfies CustomOperator;

/**
 * The general-purpose operators, in roster order (a later class appends, since codes are history):
 * the design's P1 to P11, then P12 and P13 (plan/composable-operators.md §2):
 *
 * - `normalize-space` (text) → string: XPath `fn:normalize-space` over Unicode White_Space;
 * - `tex-normal` (text) → string: the presentation normal form of typed math and TeX (rules T-1 to
 *   T-10);
 * - `numeral-normal` (text) → string: numerals in canonical form;
 * - `read-number` (text) → float: the binary64 value of an `xs:double` lexical, the one reading a
 *   text-entry record's `floatValue` applies (ASI §5.48.4);
 * - `tokenize` (text, separator: string literal) → ordered string: XPath F&O 3.1 `fn:tokenize` over
 *   an XSD regular expression;
 * - `translate` (text, from: string literal, to: string literal) → string: XPath F&O 3.1
 *   `fn:translate`;
 * - `math-canonical` (text, reduce: boolean literal) → string: the canonical form of the expression
 *   the text writes, NULL where it does not parse; `reduce` is C6's switch, rationals reduced where
 *   it is true;
 * - `quantity` (text) → record {value float, unit identifier, rest string}: a leading numeral and the
 *   unit the rest names;
 * - `unit-near` (text, words: multiple string literal) → record {unit identifier, distance integer}:
 *   the unit a mistyped unit phrase most nearly spells;
 * - `phrase-distance` (text, phrases: multiple string literal, words: multiple string literal) →
 *   integer: how far a typed phrase is from the nearest accepted phrase, the question's words read
 *   by its noun typo;
 * - `rubric-score` (response, rubric, maximum, draw) → record {score float, feedback string}: the AI
 *   grader's reply to one request; NULL iff the response is NULL (no request is made) or the model
 *   declined. Its value is recorded, a ledger fact the registered evaluator writes once per
 *   application and attempt;
 * - `markup-text` (text) → string: a typed rich-text response's text, its tags deleted and five
 *   references decoded;
 * - `when-present` (probe: any, value: any) → value's type: `value` where `probe` is not NULL, else
 *   NULL.
 */
export const customOperators = [
  normalForm("normalize-space"),
  normalForm("tex-normal"),
  normalForm("numeral-normal"),
  {
    class: "read-number",
    definition: definitionOf("read-number"),
    operands: [text],
    result: { baseType: "float", cardinality: "single" },
    source: "inline",
  },
  {
    class: "tokenize",
    definition: definitionOf("tokenize"),
    operands: [text, stringLiteral("separator")],
    result: { baseType: "string", cardinality: "ordered" },
    source: "inline",
  },
  {
    class: "translate",
    definition: definitionOf("translate"),
    operands: [text, stringLiteral("from"), stringLiteral("to")],
    result: { baseType: "string", cardinality: "single" },
    source: "inline",
  },
  {
    class: "math-canonical",
    definition: definitionOf("math-canonical"),
    operands: [text, booleanLiteral("reduce")],
    result: { baseType: "string", cardinality: "single" },
    source: "inline",
  },
  {
    class: "quantity",
    definition: definitionOf("quantity"),
    operands: [text],
    result: {
      cardinality: "record",
      fields: [
        { absent: "never", baseType: "float", field: "value" },
        { absent: "null", baseType: "identifier", field: "unit" },
        { absent: "null", baseType: "string", field: "rest" },
      ],
    },
    source: "inline",
  },
  {
    class: "unit-near",
    definition: definitionOf("unit-near"),
    operands: [text, stringSet("words")],
    result: {
      cardinality: "record",
      fields: [
        { absent: "null", baseType: "identifier", field: "unit" },
        { absent: "never", baseType: "integer", field: "distance" },
      ],
    },
    source: "inline",
  },
  {
    class: "phrase-distance",
    definition: definitionOf("phrase-distance"),
    operands: [text, stringSet("phrases"), stringSet("words")],
    result: { baseType: "integer", cardinality: "single" },
    source: "inline",
  },
  {
    class: "rubric-score",
    definition: definitionOf("rubric-score"),
    operands: [
      { baseType: "string", cardinality: "single", form: "essay", name: "response" },
      { baseType: "identifier", cardinality: "single", form: "rubric", name: "rubric" },
      { baseType: "float", cardinality: "single", form: "default", name: "maximum" },
      { baseType: "integer", cardinality: "single", form: "literal", name: "draw" },
    ],
    result: {
      cardinality: "record",
      fields: [
        { absent: "never", baseType: "float", field: "score" },
        { absent: "null", baseType: "string", field: "feedback" },
      ],
    },
    source: "recorded",
  },
  normalForm("markup-text"),
  {
    class: "when-present",
    definition: definitionOf("when-present"),
    operands: [anyValue("probe"), anyValue("value")],
    result: { cardinality: "operand", operand: "value" },
    source: "inline",
  },
] as const satisfies readonly [CustomOperator, ...CustomOperator[]];
