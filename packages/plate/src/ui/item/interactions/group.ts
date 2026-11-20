/**
 * An interaction whose root is a group exactly when something names it: a Media's and a Portable
 * Custom Interaction's. Their root has no role of its own to announce, so a group nothing names
 * would add only noise for a screen reader; one the prompt or the author names is announced as a
 * group by that name.
 *
 * @module
 */
import { Option } from "effect";
import type { Named, Unnamed } from "#plate/ui/attributes.ts";
import type { IslandContext } from "#plate/ui/item/context.ts";
import { authorsNameOf } from "#plate/ui/item/interactions/labels.ts";
import type { WrittenNames } from "#plate/ui/item/interactions/labels.ts";
import type { Prompt } from "#plate/ui/prompt.tsx";

/**
 * The attributes of a root that is a group when something names it, spread on it as one: the name
 * with `role="group"`, or nothing at all.
 */
export type Group = (Named & { readonly role: "group" }) | (Unnamed & { readonly role?: never });

/**
 * Give a root's group: named by its prompt, else the author's `aria-labelledby` or `aria-label`
 * ({@link authorsNameOf}), with the group role; nothing where none of them names it.
 *
 * @param prompt The interaction's prompt, undefined where it has none.
 * @param names The author's names, as written.
 * @param context What the shell knows: the instance and the redacted body.
 * @returns The attributes to spread on the root.
 */
export const groupOf = (
  prompt: Prompt | undefined,
  names: WrittenNames,
  context: Pick<IslandContext, "body" | "instance">,
): Group =>
  Option.match(authorsNameOf(prompt, names, context), {
    onNone: () => ({}),
    onSome: (named) => ({ ...named, role: "group" }),
  });
