/**
 * `markup-text`: a text with its markup removed, AlphaTest's stripHtmlAndCleanText
 * (gradebook.service.ts:6931) as the lead ruled it: every `<…>` tag deleted, then exactly five
 * entities decoded, in this order, `&quot;` `&apos;` `&lt;` `&gt;` `&amp;` (so `&amp;lt;` is
 * `&lt;`); `&nbsp;` is not decoded. The converter writes an essay's operand as
 * `normalize-space(markup-text(RESPONSE))`, so an answer of markup alone is NULL and makes no
 * request.
 *
 * @module
 */
import { regex } from "arkregex";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import { textValue } from "#processing/value.ts";

/**
 * A tag.
 */
const tag = regex("<[^>]*>", "gsu");

/**
 * A text without its tags, five entities decoded.
 *
 * @param text - The rich text.
 * @returns Its text.
 */
export const markupText = (text: string): string =>
  text
    .replace(tag, "")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

/**
 * The `markup-text` operator's registry entry.
 */
export const markupTextOperator = inlineOperator({
  apply: ([text]) => textValue("string", markupText(text.value)),
  definition: `${alphaDefinitionPrefix}markup-text`,
  operands: [{ form: "expression", name: "text", type: { base: "string", cardinality: "single" } }],
  result: { base: "string", cardinality: "single" },
});
