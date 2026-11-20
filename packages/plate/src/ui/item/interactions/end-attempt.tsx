/**
 * End Attempt (Q-4) in the server shell: what renders a `qti-end-attempt-interaction`'s payload
 * node, its island in `answering` (`#plate/ui/end-attempt/end-attempt.tsx`) and its server markup
 * in `review` and `solution`. It stands where phrasing content does, inside the author's sentence.
 *
 * Its island takes the button's text and names from the payload node alone: the response holds
 * nothing an island could be handed, and how the attempt counts (`count-attempt`) is the engine's.
 * A review or a solution shows the button's title where it stood, as words and no button, with no
 * mark (ruling R4): the response says only how the attempt ended, so there is no answer to mark,
 * and the attempt is over, so there is nothing to press. QTI's `title` is "displayed to the
 * candidate as a prompt for ending the attempt", in a graphical environment "the label on a button
 * that, when pressed, ends the attempt" (information model 5.45.2), and QTI says nothing of a
 * review; a button a review drew would be one that never works, which a screen reader announces as
 * dimmed and a pointer over it treats as a control.
 *
 * @module
 */
import type { ReactNode } from "react";
import { messageText } from "#plate/messages.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import type { Paired } from "#plate/payload.ts";
import { EndAttempt } from "#plate/ui/end-attempt/end-attempt.tsx";
import type { Face } from "#plate/ui/end-attempt/end-attempt.tsx";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { controlNameOf, rootOf } from "#plate/ui/item/interactions/labels.ts";

/**
 * Give an End Attempt's button its face: its `title` where the title shows text, and no other
 * name, which would rename it away from what it shows (WCAG 2.5.3); where the title is blank, the
 * author's `aria-labelledby` ids that name an element, scoped, else the author's `aria-label` that
 * is not blank, else the catalog's own name for the button.
 *
 * @param payload The End Attempt's payload: its `title` and the author's names.
 * @param context What the shell knows: the instance, the redacted body and the locale.
 * @returns The face.
 */
const faceOf = (
  payload: Paired<"end-attempt">["payload"],
  context: Pick<IslandContext, "body" | "instance" | "locale">,
): Face =>
  trimXmlSpace(payload.title) === ""
    ? {
        kind: "named",
        naming: controlNameOf(
          undefined,
          payload,
          messageText(context.locale, "endAttempt"),
          context,
        ),
      }
    : { kind: "titled", naming: {}, title: payload.title };

/**
 * Render an End Attempt's island.
 *
 * @param paired The End Attempt.
 * @param paired.model Its model node: the author's `data-*`.
 * @param paired.payload Its payload node, as its module's `redact` gave it: the `title`, the
 *   author's names and the entry name.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload }: Paired<"end-attempt">,
  context: IslandContext,
): ReactNode => (
  <EndAttempt
    face={faceOf(payload, context)}
    name={payload.formName}
    root={rootOf(model, context)}
  />
);

/**
 * Render an End Attempt's review or solution: the island's root, holding the button's title as
 * words in a `plate-end-attempt-title` part, and no button, so nothing a review shows can end an
 * attempt, post an entry or be taken for a control. A blank title, whose button shows no text,
 * shows nothing. Neither mode marks it.
 *
 * @param paired The End Attempt.
 * @param paired.model Its model node: the author's `data-*`.
 * @param paired.payload Its payload node, as its module's `redact` gave it.
 * @param context What the shell knows.
 * @returns The markup.
 */
export const review = (
  { model, payload }: Paired<"end-attempt">,
  context: ReviewContext,
): ReactNode => {
  const face = faceOf(payload, context);

  return (
    <span {...rootOf(model, context)} data-slot="plate-end-attempt">
      {face.kind === "titled" ? (
        <span data-slot="plate-end-attempt-title">{face.title}</span>
      ) : null}
    </span>
  );
};
