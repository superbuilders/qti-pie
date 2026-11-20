/**
 * The name a picks group's option takes where its content names nothing, the server's to give: a
 * Choice's choice or a Hot Text's hottext whose content is an image with no alternative text alone,
 * which the author marked decorative. Safe to import on the server.
 *
 * @module
 */
import { message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import type { RedactedNode } from "#plate/model/item.ts";
import { namesSomething } from "#plate/ui/item/interactions/text.ts";
import type { Place } from "#plate/ui/item/interactions/text.ts";

/**
 * Name an option whose content names nothing through the `label` around its control: "Choice n of
 * count", its place among the options as presented, so a screen reader tells every option apart
 * (WCAG 1.1.1, 4.1.2), as an Inline Choice's choice and a chip are named.
 *
 * @param content The option's content, as the `label` around its control holds it.
 * @param place Its place among the options as presented.
 * @param locale The locale of plate's own text.
 * @returns The name, undefined where the content names the option.
 */
export const optionName = (
  content: readonly RedactedNode[],
  place: Place,
  locale: Locale,
): string | undefined =>
  namesSomething(content, locale)
    ? undefined
    : message(locale, "choiceOf", {
        count: numeral(locale, place.count),
        n: numeral(locale, place.n),
      });
