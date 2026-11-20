/**
 * A picks group's option as a review or a solution shows it: plain server markup with the island's
 * option's slot, so the stylesheet draws a reviewed Choice's or Hot Text's option as the child
 * left it.
 *
 * @module
 */
import type { ReactNode } from "react";
import type { Locale } from "#plate/messages.ts";
import { markPart } from "#plate/ui/item/interactions/words.tsx";
import { pickParts } from "#plate/ui/picks/marks.ts";
import type { PickReview } from "#plate/ui/picks/marks.ts";

/**
 * Render one option of a reviewed picks group: its `slot`, the attributes its {@link PickReview}
 * writes ({@link pickParts}), its content, and its words in a `plate-mark` part.
 *
 * @param props The option.
 * @param props.children The option's content.
 * @param props.element The element it is: a `span` where phrasing content stands, as a Hot Text's
 *   hottext does in its sentence, else a `div`.
 * @param props.locale The locale of plate's own text.
 * @param props.review How the review shows it.
 * @param props.slot The option's `data-slot`, the island's option's.
 * @returns The option.
 */
export const ReviewedPick = ({
  children,
  element: Element,
  locale,
  review,
  slot,
}: Readonly<{
  children: ReactNode;
  element: "div" | "span";
  locale: Locale;
  review: PickReview;
  slot: "plate-choice-option" | "plate-hotspot-option" | "plate-hottext-choice";
}>) => (
  <Element {...pickParts[review].attributes} data-slot={slot}>
    {children}
    {markPart(pickParts[review].words, locale)}
  </Element>
);
