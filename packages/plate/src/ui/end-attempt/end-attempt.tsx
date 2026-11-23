"use client";

/**
 * The End Attempt interaction's client island (`qti-end-attempt-interaction`): one UI SDK button
 * standing inside the author's sentence, its text the author's `title`, which ends the attempt
 * when the child presses it, typically to ask for a hint.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`) in all but its response,
 * where it is the one exception (ruling R3). QTI sets an End Attempt's response to `true` when the
 * candidate ends the attempt through it, and to `false` when the attempt ends any other way, its
 * default value ignored (QTI 3.0 information model 5.45). HTML gives exactly that through a submit
 * button: a form posts a submit button's `name` and `value` only when that button is the one that
 * submitted it. The host's `<Responses>` holds every End Attempt response at `false` (the module's
 * `absentValue`); the button is `type="submit"`, named `endedName(instance)` (`#plate/instance.ts`)
 * with its response's identifier as its `value`, so only the press that ended the attempt posts it,
 * and the host's `answerOf` (`#plate/held.ts`) gives that response `true` in the answer, read from
 * the form's entries by `endedOf`. The island neither reads nor writes `<Responses>`' state: a
 * `true` held there would post on every submission.
 *
 * Its markup is phrasing content, a `span` and the button, so it stands inside a paragraph, a table
 * cell or a list item as written. It renders no `form`: the host's form, around the item, is the
 * one the button submits. HTML's implicit submission presses a form's first submit button in tree
 * order when the child presses Enter in a text field, so the host puts a submit button of its own
 * before the item, or Enter in a Text Entry would end the attempt through this one.
 *
 * Whether pressing it counts an attempt (`count-attempt`) is the QTI database's to decide from the
 * response posted, so it is no prop.
 *
 * @module
 */
import { Button } from "@ui-sdk/react/button";
import { useFormStatus } from "react-dom";
import { endedName } from "#plate/instance.ts";
import type { Declared } from "#plate/model/values.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { Authored, Named, Unnamed } from "#plate/ui/attributes.ts";

/**
 * What an End Attempt's button shows and is named by: `titled`, its `title`, the text that names it
 * and so takes no other name, since a name that left its visible text out would fail WCAG 2.5.3
 * (Label in Name); or `named`, for a `title` that is blank, the name the server resolved for a
 * button that shows no text.
 */
export type Face =
  | { readonly kind: "named"; readonly naming: Named }
  | { readonly kind: "titled"; readonly naming: Unnamed; readonly title: string };

/**
 * What the server gives an End Attempt's island, as QTI's `qti-end-attempt-interaction` and
 * plate's presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_EndAttemptInteraction
 */
export interface EndAttemptProps extends Pick<Authored<Named>, "root"> {
  /**
   * The button's text and name. `title` is "presented as the label on a button that, when pressed,
   * ends the attempt" (5.45.2).
   */
  readonly face: Face;
  /**
   * The item instance token the page renders the item under, which names the entry the button posts
   * its response's identifier in (`endedName`).
   */
  readonly instance: string;
  /**
   * The response the button ends the attempt through, as its declaration types it: a single
   * `boolean` response.
   */
  readonly response: Declared<"boolean", "single">;
}

/**
 * Render an End Attempt for the child to press.
 *
 * The parts:
 *
 * - `plate-end-attempt`, the root, a `span`, with the author's `class` and `data-*`, and
 *   `data-pending` while the host's form submits;
 * - UI SDK's `button`, a native `button type="submit"` named `endedName(instance)`, its `value` the
 *   response's identifier, showing and named as its `face` says.
 *
 * While the host's form is submitting, by this button or any other, the button takes no press: it
 * is disabled, `data-disabled`, but stays focusable with `aria-disabled`, so a child's second tap
 * posts nothing more and focus stays where it was. The root says why, `data-pending`: UI SDK's
 * `data-disabled` says only that the button takes no press, as a review's would, while a pending
 * post is one the child waits for, and only then does a pointer over it say to wait. React tracks
 * only a form whose `action` is a function, as qti-app's is; in any other form the button is never
 * disabled.
 *
 * @param props The interaction's root, face, instance and response ({@link EndAttemptProps}).
 * @returns The End Attempt, its button posting the response.
 * @see https://ui-sdk.dev/docs/react/components/button
 * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set
 * @see https://react.dev/reference/react-dom/hooks/useFormStatus
 */
export const EndAttempt = (props: EndAttemptProps) => {
  const { face, instance, response, root } = props;
  const { pending } = useFormStatus();

  return (
    <span {...root} data-pending={flag(pending)} data-slot="plate-end-attempt">
      <Button
        {...face.naming}
        disabled={pending}
        focusableWhenDisabled
        name={endedName(instance)}
        type="submit"
        value={response.identifier}
      >
        {face.kind === "titled" ? face.title : null}
      </Button>
    </span>
  );
};
