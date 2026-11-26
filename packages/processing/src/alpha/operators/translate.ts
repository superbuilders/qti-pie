/**
 * `translate` (composable-operators.md §2.1 P6): XPath F&O 3.1 `fn:translate`, each code point of
 * `from` mapped to the code point at its first position's place in `to`, or deleted where `to` is
 * shorter. A NULL literal is the empty string: no code point is mapped, or every one of `from`
 * deleted.
 *
 * @module
 */
import { translated } from "@bjornpagen/grizzle-text/text";
import { textLiteral } from "#processing/alpha/literals.ts";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import type { Value } from "#processing/value.ts";
import { textValue } from "#processing/value.ts";

/**
 * A text translated.
 *
 * @param text - The text.
 * @param from - The code points mapped.
 * @param to - What each maps to, by place.
 * @returns The translated text.
 */
export const translate = (text: string, from: string, to: string): string =>
  translated(text, from, to);

/**
 * The `translate` operator's registry entry.
 */
export const translateOperator = inlineOperator({
  apply: ([text, from, to]) => textValue("string", translate(text.value, from, to)),
  definition: `${alphaDefinitionPrefix}translate`,
  operands: [
    { form: "expression", name: "text", type: { base: "string", cardinality: "single" } },
    {
      form: "literal",
      name: "from",
      parse: (value: Value) => textLiteral(value),
      type: { base: "string", cardinality: "single" },
    },
    {
      form: "literal",
      name: "to",
      parse: (value: Value) => textLiteral(value),
      type: { base: "string", cardinality: "single" },
    },
  ],
  result: { base: "string", cardinality: "single" },
});
