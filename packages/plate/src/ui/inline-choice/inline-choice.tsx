"use client";

/**
 * The Inline Choice interaction's client island (`qti-inline-choice-interaction`): a UI SDK select
 * standing inside the author's sentence, where the child picks one choice from a list, and the
 * pick is the response's identifier.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`). Its markup is phrasing
 * content, so it stands inside a paragraph, a table cell or a list item as written: every UI SDK
 * part whose element would be a `div` (the label, the list and its options) renders a `span`, and
 * the list sits in the top layer when open.
 *
 * @module
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import type { ReactNode } from "react";
import type { Authored, Named } from "#plate/ui/attributes.ts";
import type { inlineChoiceKeys } from "#plate/ui/inline-choice/labels.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import { useResponse } from "#plate/ui/responses.tsx";

/**
 * How an Inline Choice's trigger is named: by its `qti-label`'s server-rendered content, which UI
 * SDK's select label shows and ties to the trigger through an id of UI SDK's own, so it carries no
 * name of the server's; or by the name the server resolved, for an interaction with no `qti-label`,
 * or one whose content gives no text (5.74.6).
 */
export type TriggerName =
  | { readonly content: ReactNode; readonly kind: "label" }
  | { readonly kind: "named"; readonly naming: Named };

/**
 * What the server gives an Inline Choice's island, as QTI's `qti-inline-choice-interaction` and
 * plate's presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_InlineChoiceInteraction
 */
export interface InlineChoiceProps extends Pick<Authored<Named>, "root"> {
  /**
   * The choices in display order: the server's order, shuffled already when the interaction
   * shuffles (5.74.1). `content` is the `qti-inline-choice`'s server-rendered content, which QTI
   * lets hold inline markup, MathML and images beside text (5.73.5); it is shown in the list and,
   * once picked, in the trigger, so it holds no interactive element and no `id`. `label` is its
   * text, whitespace collapsed, or plate's `choiceOf` message when it has none: what typing on the
   * trigger finds.
   */
  readonly choices: readonly {
    readonly content: ReactNode;
    readonly identifier: string;
    readonly label: string;
  }[];
  readonly labels: Labels<typeof inlineChoiceKeys>;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * `required`: false when the author wrote none, the XSD's default (5.74.2). The trigger says it
   * to assistive technology; the server judges whether a submitted response is valid, so a child
   * is never stopped short of a pick.
   */
  readonly required: boolean;
  readonly trigger: TriggerName;
}

/**
 * Render an Inline Choice for the child to answer, holding its response in the item's
 * `<Responses>`.
 *
 * The parts:
 *
 * - `plate-inline-choice`, the root, a `span`, with the author's `class` and `data-*`;
 * - UI SDK's `select-label`, the `qti-label`'s content, where it names the trigger;
 * - UI SDK's `select-trigger`, a combobox button showing the `prompt` label, or the picked choice's
 *   content in UI SDK's `select-value`, so a child reads their pick in the sentence, as QTI asks.
 *   Without the select label, the server's name names it;
 * - UI SDK's `select-content`, the listbox, holding one `select-item` option per choice;
 * - UI SDK's `select-form-input`, the native input UI SDK keeps for form validation. It has no name,
 *   so it posts nothing, and UI SDK hides it with an inline `style`, which the page's content
 *   security policy refuses, so the stylesheet hides that slot too.
 *
 * A pick writes the response, one identifier; nothing picked posts nothing. UI SDK's own
 * `required` is not set, as it would stop the host's form from posting; `aria-required` says it
 * instead.
 *
 * Two of UI SDK's defaults are set otherwise:
 *
 * - **A form reset changes nothing.** The response is the host's, posted by `<Responses>`'s hidden
 *   inputs, which a reset leaves as they are. React resets a form once its action returns, a
 *   refused or failed post included, and UI SDK then asks for its default value, NULL (reason
 *   `reset`). Taken, that request erased the child's pick, the select and the post both; left
 *   unanswered, it left UI SDK warning that the value stayed. The island refuses it, so the select
 *   keeps showing what the host holds.
 * - **A press outside the open list reaches what it hits** (`modal={false}`): the list closes and the
 *   press acts, so one press of the host's Check answer both closes the list and submits. UI SDK's
 *   default, `"pointer"`, swallows that press, which only closed the list.
 *
 * @param props The interaction, its response's entry name and its labels
 *   ({@link InlineChoiceProps}).
 * @returns The Inline Choice, its select bound to the response.
 * @see https://ui-sdk.dev/docs/react/components/select
 * @see https://react.dev/reference/react-dom/components/form
 */
export const InlineChoice = (props: InlineChoiceProps) => {
  const { choices, labels, name, required, root, trigger } = props;
  const [texts, set] = useResponse(name);
  const items = choices.map((choice) => ({ label: choice.label, value: choice.identifier }));

  return (
    <span {...root} data-slot="plate-inline-choice">
      <Select
        items={items}
        modal={false}
        placeholder={labels.prompt}
        value={texts[0] ?? null}
        onValueChange={(next, details) => {
          if (details.reason === "reset") {
            details.cancel();

            return;
          }

          set(next === null ? [] : [next]);
        }}
      >
        {trigger.kind === "label" ? (
          <SelectLabel render={<span />}>{trigger.content}</SelectLabel>
        ) : null}
        <SelectTrigger
          {...(trigger.kind === "named" ? trigger.naming : {})}
          aria-required={required ? "true" : undefined}
        >
          <SelectValue>
            {(state) =>
              state.placeholder
                ? labels.prompt
                : choices.find((choice) => choice.identifier === state.value)?.content
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent render={<span />}>
          {choices.map((choice) => (
            <SelectItem
              key={choice.identifier}
              label={choice.label}
              render={<span />}
              value={choice.identifier}
            >
              {choice.content}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </span>
  );
};
