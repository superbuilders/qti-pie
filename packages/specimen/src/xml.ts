/**
 * XML text built from strings: an element with its attributes escaped, and text escaped, so a
 * kind writes its markup as nested calls and never escapes by hand. Every string a kind passes as
 * a child is markup this module, or another such call, wrote.
 *
 * @module
 */
import { Option } from "effect";

/**
 * Escape text for an element's content.
 *
 * @param raw The text.
 * @returns It with `&`, `<` and `>` escaped.
 */
export const text = (raw: string): string =>
  raw.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/**
 * Escape text for an attribute's value, written between double quotes.
 *
 * @param raw The value.
 * @returns It with `&`, `<`, `>` and `"` escaped.
 */
const attributeText = (raw: string): string => text(raw).replaceAll('"', "&quot;");

/**
 * Write an element: empty when it has no children.
 *
 * @param name The element's qualified name.
 * @param attributes Its attributes, each written as given, a number in its digits; an option is
 *   written when it holds a value and left out when it is none.
 * @param children Its children, markup already written.
 * @returns The element's markup.
 */
export const element = (
  name: string,
  attributes: Readonly<Record<string, number | Option.Option<number | string> | string>>,
  ...children: readonly string[]
): string => {
  const written = Object.entries(attributes)
    .flatMap(([key, value]) =>
      (Option.isOption(value) ? Option.toArray(value) : [value]).map(
        (held) => ` ${key}="${attributeText(String(held))}"`,
      ),
    )
    .join("");

  return children.length === 0
    ? `<${name}${written}/>`
    : `<${name}${written}>${children.join("")}</${name}>`;
};
