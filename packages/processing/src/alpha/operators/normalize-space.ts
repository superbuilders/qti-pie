/**
 * `normalize-space` (composable-operators.md §2.1 P1): XPath F&O 3.1 `fn:normalize-space` over
 * Unicode's White_Space, its leading and trailing runs removed and each inner run one U+0020.
 *
 * @module
 */
import { regex } from "arkregex";
import { whiteSpace } from "#processing/alpha/text.ts";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import { textValue } from "#processing/value.ts";

/**
 * A run of white space at either edge.
 */
const edges = regex(`^[${whiteSpace}]+|[${whiteSpace}]+$`, "gsu");

/**
 * A run of white space.
 */
const run = regex(`[${whiteSpace}]+`, "gsu");

/**
 * A text with its white space normalized.
 *
 * @param text - The text.
 * @returns It without white space at either edge and each inner run one space; empty where it was
 *   all white space.
 */
export const normalizeSpace = (text: string): string => text.replace(edges, "").replace(run, " ");

/**
 * The `normalize-space` operator's registry entry.
 */
export const normalizeSpaceOperator = inlineOperator({
  apply: ([text]) => textValue("string", normalizeSpace(text.value)),
  definition: `${alphaDefinitionPrefix}normalize-space`,
  operands: [{ form: "expression", name: "text", type: { base: "string", cardinality: "single" } }],
  result: { base: "string", cardinality: "single" },
});
