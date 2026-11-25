/**
 * Alpha's Choice renderer: QTI's Choice as plate's standard renderer draws it, with the line
 * AlphaTest's player wrote under every Choice's prompt, "Select your answer:" where the child picks
 * one, "Select all that apply:" where more, and "Your Answer:" in a review (metis's no-regression
 * M8). The line is words alone: it changes no response, no payload and no grading, and the island
 * is core's own (`#plate/ui/choice/choice.tsx`), handed the line as the lead it writes between the
 * prompt and the options.
 *
 * @module
 */
import type { ReactNode } from "react";
import type { Picks } from "#plate/interactions/picks.ts";
import { picksOf } from "#plate/interactions/picks.ts";
import type { Locale } from "#plate/messages.ts";
import { leadIsland, leadReview } from "#plate/ui/item/interactions/choice.tsx";
import type { Renderer } from "#plate/ui/registry/contract.ts";

/**
 * The words of the line, in every locale plate writes its own text in, so a locale plate adds
 * fails to compile here until the line has its words: `one` and `many` under the prompt of a Choice
 * the child answers, by how many the child picks, and `review` under a review's or a solution's.
 */
export const lineWords: Readonly<
  Record<Locale, { readonly many: string; readonly one: string; readonly review: string }>
> = {
  en: { many: "Select all that apply:", one: "Select your answer:", review: "Your Answer:" },
};

/**
 * Give which words the line says under a Choice the child answers: `one` where the child picks one,
 * `many` where any number or at most some, as AlphaTest's player chose its line.
 *
 * @param picks How many options the child picks.
 * @returns The words' key.
 */
export const lineOf = (picks: Picks): "many" | "one" => (picks.kind === "one" ? "one" : "many");

/**
 * Write the line, `alpha-choice-instruction`, under the prompt.
 *
 * @param words Its words.
 * @returns The line.
 */
const line = (words: string): ReactNode => <p data-slot="alpha-choice-instruction">{words}</p>;

/**
 * The Choice's renderer: its island and its review, each core's with the line as its lead.
 */
export const choice: Renderer<"choice"> = {
  island: (paired, context) =>
    leadIsland(paired, context, line(lineWords[context.locale][lineOf(picksOf(paired.payload))])),
  review: (paired, context) => leadReview(paired, context, line(lineWords[context.locale].review)),
};
