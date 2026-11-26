/**
 * The strings family: `qti-string-match`, `qti-substring` and `qti-pattern-match` (sections
 * 2.11.3.45, 2.11.3.46 and 2.11.3.41).
 *
 * A comparison that is not case-sensitive compares the two strings' case folds, each the host's
 * `toUpperCase()` then `toLowerCase()` (Unicode's full case mappings with their special casing, as
 * Node ships them; D3, no pinned tables). A pattern is XML Schema's regular expression (Appendix
 * F), read by grizzle-text's `xsdPattern` into a language anchored at both ends, so it matches the
 * whole string or not at all (reading `pattern-mask-braces`).
 *
 * @module
 */
import { Matcher } from "@bjornpagen/grizzle-text/regex/match";
import { buildNfa } from "@bjornpagen/grizzle-text/regex/nfa";
import { xsdPattern } from "@bjornpagen/grizzle-text/regex/xsd";
import type { LiteralOr } from "#processing/ir.ts";
import { booleanAttribute, stringOrVariable } from "#processing/operators/attributes.ts";
import {
  checked,
  oneOperand,
  operandsTaken,
  refused,
  singleBoolean,
  twoOperands,
} from "#processing/operators/operator.ts";
import type {
  Checked,
  CompileContext,
  OperandRule,
  OperatorTable,
} from "#processing/operators/operator.ts";
import { stringAttribute } from "#processing/run.ts";
import { nullOf, single } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";
import { attributeOf } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * The single boolean NULL.
 */
const booleanNull: Value = nullOf({ base: "boolean", cardinality: "single" });

/**
 * A single string operand.
 */
const singleString: OperandRule = { bases: ["string"], cardinalities: ["single"] };

/**
 * A string's case fold: its upper case's lower case, so `ß` meets `SS` and `ſ` meets `s`.
 *
 * @param text - The string.
 * @returns Its fold.
 */
export const foldCase = (text: string): string => text.toUpperCase().toLowerCase();

/**
 * A single string's text.
 *
 * @param value - The value.
 * @returns Its text; `undefined` for NULL or any other value.
 */
const textOf = (value: Value): string | undefined =>
  value.kind === "single" && value.base === "string" ? value.value : undefined;

/**
 * Two strings as a comparison reads them: as written, or folded.
 *
 * @param caseSensitive - Whether case counts.
 * @param text - The string.
 * @returns It, compared form.
 */
const compared = (caseSensitive: boolean, text: string): string =>
  caseSensitive ? text : foldCase(text);

/**
 * The value of `qti-string-match`: whether the two strings are one (section 2.11.3.45), or, with
 * the deprecated `substring` true, whether the first contains the second (section 5.138.2).
 *
 * @param caseSensitive - Whether case counts.
 * @param substring - Whether the second need only occur in the first.
 * @param left - The first operand's value.
 * @param right - The second operand's value.
 * @returns The truth; NULL where either is NULL or no single string.
 */
export const stringMatchOf = (
  caseSensitive: boolean,
  substring: boolean,
  left: Value,
  right: Value,
): Value => {
  const one = textOf(left);
  const other = textOf(right);
  if (one === undefined || other === undefined) {
    return booleanNull;
  }

  const first = compared(caseSensitive, one);
  const second = compared(caseSensitive, other);

  return single("boolean", substring ? first.includes(second) : first === second);
};

/**
 * The value of `qti-substring`: whether the first string occurs in the second (section 2.11.3.46:
 * "the first expression is a substring of the second"), the reverse of string-match's deprecated
 * `substring`.
 *
 * @param caseSensitive - Whether case counts.
 * @param left - The first operand's value.
 * @param right - The second operand's value.
 * @returns The truth; NULL where either is NULL or no single string.
 */
export const substringOf = (caseSensitive: boolean, left: Value, right: Value): Value => {
  const part = textOf(left);
  const whole = textOf(right);

  return part === undefined || whole === undefined
    ? booleanNull
    : single("boolean", compared(caseSensitive, whole).includes(compared(caseSensitive, part)));
};

/**
 * A pattern's matcher.
 *
 * @param pattern - The pattern, XML Schema's syntax.
 * @returns Its matcher of whole strings; `undefined` for a text outside Appendix F's grammar.
 */
export const matcherOf = (pattern: string): Matcher | undefined => {
  const read = xsdPattern(pattern);

  return read.ok ? Matcher.of(buildNfa(read.value)) : undefined;
};

/**
 * The value of `qti-pattern-match`: whether the whole string is in the pattern's language.
 *
 * @param pattern - The pattern, or `undefined` where the variable it names holds no string.
 * @param value - The operand's value.
 * @returns The truth; NULL where the operand is NULL or no single string, or the pattern is none or
 *   no XML Schema regular expression.
 */
export const patternMatchOf = (pattern: string | undefined, value: Value): Value => {
  const text = textOf(value);
  const matcher = pattern === undefined ? undefined : matcherOf(pattern);

  return text === undefined || matcher === undefined
    ? booleanNull
    : single("boolean", matcher.matches(text));
};

/**
 * A `qti-pattern-match`'s `pattern`: a literal, refused where it is no XML Schema regular
 * expression, or `{NAME}`, a variable's value read at run time (reading `pattern-mask-braces`).
 *
 * @param element - The element.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The pattern.
 */
const patternAttribute = (
  element: XmlElement,
  context: CompileContext,
  place: number,
): Checked<{ readonly pattern: LiteralOr<string> }> => {
  const written = attributeOf(element, "pattern");
  if (written === undefined) {
    return refused("attribute", place, "write the required attribute pattern");
  }

  const pattern = stringOrVariable(written, context);
  if (pattern.kind === "literal" && matcherOf(pattern.value) === undefined) {
    return refused("attribute", place, "write pattern as an XML Schema regular expression");
  }

  return checked({ pattern });
};

/**
 * The strings family's operators.
 */
export const stringsOperators: OperatorTable<"pattern-match" | "string-match" | "substring"> = {
  "pattern-match": {
    arity: oneOperand,
    evaluate: (node, run) =>
      patternMatchOf(stringAttribute(run, node.pattern), run.evaluate(node.operands[0])),
    read: patternAttribute,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleString, place, singleBoolean),
  },
  "string-match": {
    arity: twoOperands,
    evaluate: (node, run) =>
      stringMatchOf(
        node.caseSensitive,
        node.substring,
        run.evaluate(node.operands[0]),
        run.evaluate(node.operands[1]),
      ),
    read: (element, _context, place) => {
      const caseSensitive = booleanAttribute(element, "case-sensitive", undefined, place);
      if (!caseSensitive.ok) {
        return caseSensitive;
      }

      const substring = booleanAttribute(element, "substring", false, place);

      return substring.ok
        ? checked({ caseSensitive: caseSensitive.value, substring: substring.value })
        : substring;
    },
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleString, place, singleBoolean),
  },
  substring: {
    arity: twoOperands,
    evaluate: (node, run) =>
      substringOf(
        node.caseSensitive,
        run.evaluate(node.operands[0]),
        run.evaluate(node.operands[1]),
      ),
    read: (element, _context, place) => {
      const caseSensitive = booleanAttribute(element, "case-sensitive", undefined, place);

      return caseSensitive.ok ? checked({ caseSensitive: caseSensitive.value }) : caseSensitive;
    },
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleString, place, singleBoolean),
  },
};
