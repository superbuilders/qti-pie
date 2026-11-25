/**
 * The mutations of the law oracle's laws over the expressions
 * (`#pantry/test/oracle-laws/expressions.ts`), each drawn to break exactly its law in an accepted
 * package (`src/test/complete.oracle.test.ts`).
 *
 * Each edits the every-relation package's processing: the item's response processing (a sum of a
 * map response and a map response point into SCORE, a round into COUNT, two lookups, and a match of
 * RESPONSE and its correct value), its template processing (N a random integer, SHOWN an
 * identifier) and the third item's included rule (`rules.xml`: numAttempts against 1). Each writes
 * a value of a type the law refuses, drawn among several, at a site drawn among those the base
 * holds.
 */
import { replacing } from "#pantry/test/oracle-complete/mutation.ts";
import type { Mutation } from "#pantry/test/oracle-complete/mutation.ts";

/**
 * The every-relation item.
 */
const item = "items/item.xml";

/**
 * A base value's text.
 *
 * @param baseType - Its base type.
 * @param text - Its text.
 * @returns The `qti-base-value`.
 */
const literal = (baseType: string, text: string): string =>
  `<qti-base-value base-type="${baseType}">${text}</qti-base-value>`;

/**
 * The item's sum's map response point, an operand any float or integer may stand for.
 */
const sumOperand = '<qti-map-response-point identifier="SPOT"/>';

/**
 * The item's round's operand.
 */
const roundOperand = '<qti-round><qti-variable identifier="SCORE"/></qti-round>';

/**
 * The item's match's correct value.
 */
const matchCorrect = '<qti-correct identifier="RESPONSE"/>';

/**
 * Each law's mutation, by law.
 */
export const expressionMutations = {
  /**
   * Condition type (P21): a response condition's or the included rule's condition replaced by an
   * integer, a float or a string.
   */
  "Condition type": {
    law: "Condition type",
    mutate: replacing([
      {
        passage:
          '<qti-match>\n          <qti-variable identifier="RESPONSE"/>\n          <qti-correct identifier="RESPONSE"/>\n        </qti-match>',
        path: item,
        replacements: [
          literal("integer", "1"),
          '<qti-variable identifier="SCORE"/>',
          literal("string", "yes"),
        ],
      },
      {
        passage:
          '<qti-gte>\n      <qti-variable identifier="numAttempts"/>\n      <qti-base-value base-type="integer">1</qti-base-value>\n    </qti-gte>',
        path: "items/rules.xml",
        replacements: ['<qti-variable identifier="numAttempts"/>', literal("float", "1.5")],
      },
    ]),
    over: "package",
  },
  /**
   * Literal lexical (§8.13): a base value whose text is no lexical form of its base type, in the
   * item or its rule.
   */
  "Literal lexical": {
    law: "Literal lexical",
    mutate: replacing([
      {
        passage: literal("identifier", "RIGHT"),
        path: item,
        replacements: [literal("identifier", "1RIGHT"), literal("identifier", "RI GHT")],
      },
      {
        passage: literal("integer", "1"),
        path: "items/rules.xml",
        replacements: [literal("integer", "one"), literal("integer", "1.0")],
      },
      {
        passage: literal("float", "1"),
        path: "items/rules.xml",
        replacements: [literal("float", "x"), literal("float", "1,0")],
      },
    ]),
    over: "package",
  },
  /**
   * Lookup type (P22): a lookup whose expression is no single integer, float or duration, or a
   * float into a match table, or a lookup of an outcome with no table.
   */
  "Lookup type": {
    law: "Lookup type",
    mutate: replacing([
      {
        passage:
          '<qti-lookup-outcome-value identifier="LEVEL"><qti-variable identifier="COUNT"/></qti-lookup-outcome-value>',
        path: item,
        replacements: [
          '<qti-lookup-outcome-value identifier="LEVEL"><qti-variable identifier="SCORE"/></qti-lookup-outcome-value>',
          `<qti-lookup-outcome-value identifier="LEVEL">${literal("string", "two")}</qti-lookup-outcome-value>`,
          '<qti-lookup-outcome-value identifier="COUNT"><qti-variable identifier="COUNT"/></qti-lookup-outcome-value>',
        ],
      },
      {
        passage:
          '<qti-lookup-outcome-value identifier="GRADE"><qti-variable identifier="SCORE"/></qti-lookup-outcome-value>',
        path: item,
        replacements: [
          `<qti-lookup-outcome-value identifier="GRADE">${literal("boolean", "true")}</qti-lookup-outcome-value>`,
          '<qti-lookup-outcome-value identifier="GRADE"><qti-multiple><qti-variable identifier="SCORE"/></qti-multiple></qti-lookup-outcome-value>',
        ],
      },
    ]),
    over: "package",
  },
  /**
   * Mapped response (P27): a map response of a response with no mapping, or a map response
   * point of one with no area mapping.
   */
  "Mapped response": {
    law: "Mapped response",
    mutate: replacing([
      {
        passage: '<qti-map-response identifier="RESPONSE"/>',
        path: item,
        replacements: [
          '<qti-map-response identifier="HOT"/>',
          '<qti-map-response identifier="AREA"/>',
          '<qti-map-response identifier="WIDGET"/>',
        ],
      },
      {
        passage: sumOperand,
        path: item,
        replacements: [
          '<qti-map-response-point identifier="LEVER"/>',
          '<qti-map-response-point identifier="PAIRS"/>',
        ],
      },
    ]),
    over: "package",
  },
  /**
   * One base (P23): the item's match given operands of two base types or two cardinalities.
   */
  "One base": {
    law: "One base",
    mutate: replacing([
      {
        passage: matchCorrect,
        path: item,
        replacements: [
          literal("string", "ChoiceA"),
          `<qti-multiple>${literal("identifier", "ChoiceA")}</qti-multiple>`,
        ],
      },
    ]),
    over: "package",
  },
  /**
   * Operand fit (P23): an operand of a base type or cardinality its operator does not take: the
   * item's sum given a string, a boolean or an identifier; its round a boolean or a container;
   * the included rule's comparison a string.
   */
  "Operand fit": {
    law: "Operand fit",
    mutate: replacing([
      {
        passage: sumOperand,
        path: item,
        replacements: [
          literal("string", "x"),
          literal("boolean", "true"),
          literal("identifier", "yes"),
        ],
      },
      {
        passage: roundOperand,
        path: item,
        replacements: [
          `<qti-round>${literal("boolean", "true")}</qti-round>`,
          `<qti-round><qti-multiple>${literal("float", "1.5")}</qti-multiple></qti-round>`,
        ],
      },
      {
        passage: literal("integer", "1"),
        path: "items/rules.xml",
        replacements: [literal("string", "one")],
      },
    ]),
    over: "package",
  },
  /**
   * Outcome only (P25): a test operator in the item's response processing or its template
   * processing, neither of them outcome processing.
   */
  "Outcome only": {
    law: "Outcome only",
    mutate: replacing([
      {
        passage: sumOperand,
        path: item,
        replacements: ["<qti-number-correct/>", "<qti-number-presented/>"],
      },
      {
        passage: '<qti-random-integer min="5" max="10"/>',
        path: item,
        replacements: ["<qti-number-selected/>", "<qti-number-responded/>"],
      },
    ]),
    over: "package",
  },
  /**
   * Reference type (P24): the template processing's random integer bounded by a variable that is
   * no single integer template or outcome: a template of another base type, a response, a float
   * outcome, or a built-in.
   */
  "Reference type": {
    law: "Reference type",
    mutate: replacing([
      {
        passage: '<qti-random-integer min="5" max="10"/>',
        path: item,
        replacements: [
          '<qti-random-integer min="SHOWN" max="10"/>',
          '<qti-random-integer min="5" max="LEVER"/>',
          '<qti-random-integer min="5" max="10" step="WIDGET"/>',
        ],
      },
    ]),
    over: "package",
  },
  /**
   * Set type (P20): a setter's expression of another type than its variable's: COUNT, an integer,
   * set to a string or a container; FEEDBACK, an identifier, to a float; N, an integer template,
   * to a string.
   */
  "Set type": {
    law: "Set type",
    mutate: replacing([
      {
        passage: roundOperand,
        path: item,
        replacements: [
          literal("string", "x"),
          `<qti-multiple>${literal("integer", "1")}</qti-multiple>`,
        ],
      },
      {
        passage: literal("identifier", "RIGHT"),
        path: item,
        replacements: [literal("float", "1.5"), literal("boolean", "true")],
      },
      {
        passage: '<qti-random-integer min="5" max="10"/>',
        path: item,
        replacements: [literal("string", "five")],
      },
    ]),
    over: "package",
  },
  /**
   * Template reads (P26): the template processing reading an outcome, a response or a built-in
   * but QTI_CONTEXT, each an integer, as N is.
   */
  "Template reads": {
    law: "Template reads",
    mutate: replacing([
      {
        passage: '<qti-random-integer min="5" max="10"/>',
        path: item,
        replacements: [
          '<qti-variable identifier="COUNT"/>',
          '<qti-variable identifier="LEVER"/>',
          '<qti-variable identifier="numAttempts"/>',
        ],
      },
    ]),
    over: "package",
  },
  /**
   * Variable kind (§7.10.1, §6.32.3, ...): a setter or a reader naming a variable of a kind it
   * does not set or read: FEEDBACK's setter setting the template SHOWN, or the correct value of an
   * outcome.
   */
  "Variable kind": {
    law: "Variable kind",
    mutate: replacing([
      {
        passage: '<qti-set-outcome-value identifier="FEEDBACK">',
        path: item,
        replacements: ['<qti-set-outcome-value identifier="SHOWN">'],
      },
      {
        passage: matchCorrect,
        path: item,
        replacements: ['<qti-correct identifier="FEEDBACK"/>'],
      },
    ]),
    over: "package",
  },
} as const satisfies Readonly<Record<string, Mutation>>;
