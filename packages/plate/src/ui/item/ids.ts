/**
 * The author's ids as the server shell writes them, scoped so that they meet neither another
 * instance's nor plate's own, which `scopedId` (`#plate/form/encoding.ts`) scopes.
 *
 * @module
 */
import { asciiTokens } from "#plate/ui/whitespace.ts";

/**
 * Scope an id the author wrote by the item's instance.
 *
 * The double hyphen is a prefix none of plate's ids has (`scopedId`'s first segment always
 * starts with a letter), and `checkInstance` refuses an instance that ends in `-` or holds `--`,
 * so an author's `item` never equals plate's `<instance>-item`, and no two instances' ids meet.
 * The `id` attribute, every IDREF and every same-document `#id` fragment go through here, so a
 * reference still finds its target.
 *
 * @example
 *   authoredId("q1", "intro"); // "q1--intro"
 *
 * @param instance The host-named instance token.
 * @param id The id as the author wrote it.
 * @returns `<instance>--<id>`.
 */
export const authoredId = (instance: string, id: string): string => `${instance}--${id}`;

/**
 * Scope every id of an IDREFS value the author wrote, such as an `aria-labelledby` or a cell's
 * `headers`, through {@link authoredId}, so each still names its scoped target.
 *
 * A value that names no id, empty or only whitespace, is no reference at all, as the accessible
 * name computation reads an `aria-labelledby` that names nothing: the caller writes no attribute.
 *
 * @example
 *   authoredIdrefs("q1", " a  b "); // "q1--a q1--b"
 *   authoredIdrefs("q1", "  "); // undefined
 *
 * @param instance The host-named instance token.
 * @param value The attribute's value as the author wrote it.
 * @returns The scoped ids in order, joined by one space; undefined when the value names no id.
 */
export const authoredIdrefs = (instance: string, value: string): string | undefined => {
  const ids = asciiTokens(value);

  return ids.length === 0 ? undefined : ids.map((id) => authoredId(instance, id)).join(" ");
};
