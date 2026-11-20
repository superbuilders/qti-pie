/**
 * An interaction's prompt: the `qti-prompt` the server rendered, which names the interaction's
 * group or control, and the part that holds it, which an island and a review write alike. It holds
 * no client state, so the server and an island import it alike.
 *
 * @module
 */
import type { ReactNode } from "react";

/**
 * A prompt's server-rendered content: something to show, never `null`, a boolean or `undefined`,
 * so an island says it has no prompt only by leaving the prop out.
 */
export type PromptContent = Exclude<ReactNode, boolean | null | undefined>;

/**
 * An interaction's prompt as the server gives it (`promptAt` in
 * `#plate/ui/item/interactions/labels.ts`): its content; for a prompt that names something, the id
 * its group's or control's `aria-labelledby` names, scoped by the instance and the response it
 * binds, the same in every mode; and, where the candidate hears the prompt read aloud,
 * read-aloud's control for it (`#plate/ui/read-aloud/read-aloud.tsx`), absent otherwise. A
 * `silent` prompt shows, but a name computed from it would be empty (whitespace, or a picture with
 * no alternative text), so it names nothing and carries no id: the group or control takes the
 * author's names or plate's own, as one with no prompt does.
 */
export type Prompt = (
  | { readonly content: PromptContent; readonly id: string; readonly kind: "naming" }
  | { readonly content: PromptContent; readonly kind: "silent" }
) & { readonly readAloud?: PromptContent };

/**
 * Write an interaction's prompt: the `plate-prompt` part, under the id its group or control is
 * named by where it names something, and after it the prompt's read-aloud control where it has
 * one. The control stands outside the part, so the name the part gives the group or control holds
 * the prompt's words alone, never the control's (accessible name computation, step 2F).
 *
 * @param props The prompt.
 * @param props.prompt The prompt, or undefined where the interaction has none.
 * @returns The `plate-prompt` part and its control, or nothing.
 */
export const PromptPart = ({ prompt }: { readonly prompt: Prompt | undefined }): ReactNode =>
  prompt === undefined ? null : (
    <>
      <div data-slot="plate-prompt" id={prompt.kind === "naming" ? prompt.id : undefined}>
        {prompt.content}
      </div>
      {prompt.readAloud}
    </>
  );
