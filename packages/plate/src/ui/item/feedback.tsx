/**
 * The parts of a review's feedback panel that are plate's own rather than the item's: the verdict a
 * review opens its feedback with, written from the credit the host graded the attempt by, and the
 * "Why" that titles the item's explanation. The body walk (`#plate/ui/item/content.tsx`) and the
 * shell (`#plate/ui/item/item.tsx`) place them in plate's Feedback part, beside the feedback blocks
 * the record shows, whose content and visibility stay the item's (spec reading
 * `review-feedback-panels`).
 *
 * @module
 */
import { Option } from "effect";
import { createElement } from "react";
import type { Key, ReactNode } from "react";
import type { Credit } from "#plate/ui/item/context.ts";
import { message } from "#plate/messages.ts";
import type { Locale, MessageKey } from "#plate/messages.ts";
import type { BodyElement, RedactedLevel } from "#plate/model/item.ts";

/**
 * The verdict's words by the credit the attempt earned: right at full credit, part right at
 * partial credit, and not quite at none, which blames no one.
 */
const verdictKeys = {
  full: "verdictFull",
  none: "verdictNone",
  partial: "verdictPartial",
} as const satisfies Readonly<Record<Credit, MessageKey>>;

/**
 * Render plate's Verdict part, the line a review's feedback opens with: its words, from the credit
 * the host graded the attempt by, never from the item's text. Its glyph, a tick for right and a
 * cross for wrong, is the stylesheets', on the Feedback part's `data-credit`.
 *
 * @param credit The credit the attempt earned.
 * @param locale The locale of plate's own text.
 * @returns The `plate-verdict` part, a `p`.
 */
export const verdictOf = (credit: Credit, locale: Locale): ReactNode =>
  createElement(
    "p",
    { "data-slot": "plate-verdict", key: "verdict" },
    message(locale, verdictKeys[credit]),
  );

/**
 * The identifier of the feedback block that holds an item's general explanation, the rule its
 * answer rests on, which every answer shows: the content's convention, not QTI's, since QTI gives a
 * feedback block's identifier no meaning (Bjorn's ruling of 2026-11-18, spec reading
 * `review-feedback-panels`).
 */
const explanationIdentifier = "explanation";

/**
 * Tell whether a feedback block the page shows holds the item's general explanation: the identifier
 * the redaction keeps on it is {@link explanationIdentifier}.
 *
 * @param block The feedback block, as the redacted body holds it.
 * @returns Whether it is the explanation.
 */
export const isExplanation = (block: BodyElement<RedactedLevel>): boolean =>
  block.attributes.some(
    (attribute) => attribute.name === "identifier" && attribute.value === explanationIdentifier,
  );

/**
 * Render one feedback block or modal feedback inside plate's Feedback part, after the title "Why"
 * where it is the item's explanation, so the panel reads as the verdict, what it says of the
 * answer, and why.
 *
 * @param element Its element: a `div` for a feedback block, a `section` for a modal feedback.
 * @param key Its key among the panel's parts.
 * @param explains Whether it is the item's explanation ({@link isExplanation}).
 * @param name Its accessible name: a modal feedback's `title`, none for a feedback block.
 * @param locale The locale of plate's own text.
 * @param content Its content, rendered.
 * @returns The `plate-feedback-why` part where it explains, then its `plate-feedback-block` part.
 */
export const feedbackBlockOf = (
  element: "div" | "section",
  key: Key,
  explains: boolean,
  name: Option.Option<string>,
  locale: Locale,
  content: readonly ReactNode[],
): readonly ReactNode[] => [
  ...(explains
    ? [
        createElement(
          "p",
          { "data-slot": "plate-feedback-why", key: `why-${String(key)}` },
          message(locale, "feedbackWhy"),
        ),
      ]
    : []),
  createElement(
    element,
    { "aria-label": Option.getOrUndefined(name), "data-slot": "plate-feedback-block", key },
    ...content,
  ),
];
