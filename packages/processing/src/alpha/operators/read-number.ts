/**
 * `read-number` (composable-operators.md §2.1 P4): the binary64 value of a finite `xs:double`
 * lexical (XML Schema 1.0: a decimal with an optional exponent) after `xs:double`'s white-space
 * collapse (XML white space at either end; inside, none is in the lexical space), or none for any
 * other text, `INF`, `-INF` and `NaN` among it: a text-entry record's floatValue, which plate
 * builds from the finite lexicals alone. The value is the nearest double, ties to even (XML Schema
 * 1.1's doubleLexicalMap), past the greatest finite double an infinity of the sign, below half the
 * least subnormal a zero of the sign: ECMAScript's StringToNumber over the lexical, which Node
 * rounds correctly at any length.
 *
 * @module
 */
import { regex } from "arkregex";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import { nullOf, single } from "#processing/value.ts";

/**
 * XML's white space at either edge.
 */
const xmlEdges = regex("^[ \\t\\n\\r]+|[ \\t\\n\\r]+$", "gu");

/**
 * A finite `xs:double` lexical: a sign, digits, a fraction and an exponent, at least one digit
 * before the exponent.
 */
const lexical = regex("^[+-]?(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+)(?:[Ee][+-]?[0-9]+)?$", "u");

/**
 * A text's number.
 *
 * @param text - The text.
 * @returns Its binary64 value, or none where it is no finite `xs:double` lexical.
 */
export const readNumber = (text: string): number | undefined => {
  const trimmed = text.replace(xmlEdges, "");

  return lexical.test(trimmed) ? Number(trimmed) : undefined;
};

/**
 * The `read-number` operator's registry entry.
 */
export const readNumberOperator = inlineOperator({
  apply: ([text]) => {
    const value = readNumber(text.value);

    return value === undefined
      ? nullOf({ base: "float", cardinality: "single" })
      : single("float", value);
  },
  definition: `${alphaDefinitionPrefix}read-number`,
  operands: [{ form: "expression", name: "text", type: { base: "string", cardinality: "single" } }],
  result: { base: "float", cardinality: "single" },
});
