/**
 * Alpha's Text Entry renderers: QTI's Text Entry as plate's standard renderer draws it, but where
 * the author marked a box `alpha-math-entry`, answered in a MathLive math field under AlphaTest's
 * virtual keyboard (`#plate/alpha/math-entry/`). The interaction stays QTI's: what a child posts
 * and how the QTI database grades it are the kind's, and a renderer that knows no Alpha extension
 * shows the same item as plain QTI. Two renderers, of which a host composes one
 * (`#plate/alpha/renderers.ts`):
 *
 * - {@link textEntry}: the math entry, and every other Text Entry plate's, with plate's on-screen
 *   keypad after the item's body where the host's `textEntryKeypad` asks for it;
 * - {@link hostKeypadTextEntry}: the same math entry, and every other Text Entry typed on the host's
 *   own keypad, as AlphaTest's player typed its drills (mastery-track-player 941a86a,
 *   `FluencyInteraction.tsx` lines 1276–1290): plate shows no keys, and each box asks the device
 *   for no keyboard (`inputmode="none"`), so the host's keys, which type through the box's typer
 *   (`useTyping` in `@qti-pie/plate/ui/client`), are the only ones on the screen.
 *
 * @module
 */
import type { ReactNode } from "react";
import { mathEntryClass } from "#plate/alpha/math-entry/field.ts";
import { MathAnswer } from "#plate/alpha/math-entry/math-answer.tsx";
import { MathEntry } from "#plate/alpha/math-entry/math-entry.tsx";
import type { Paired } from "#plate/payload.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import {
  after,
  answer,
  box,
  island,
  review,
  reviewOf,
} from "#plate/ui/item/interactions/text-entry.tsx";
import { controlNameOf, ownName, rootOf } from "#plate/ui/item/interactions/labels.ts";
import type { Renderer } from "#plate/ui/registry/contract.ts";
import { hasClass } from "#plate/vocabulary.ts";

/**
 * Tell whether the author marked a Text Entry for the math entry: its class, as the interaction's
 * root carries it, holds {@link mathEntryClass}.
 *
 * @param context What the page may know of the render: the author's class.
 * @returns Whether the Text Entry is answered in a math field.
 */
const isMathEntry = (context: Pick<IslandContext, "className">): boolean =>
  hasClass(context.className, mathEntryClass);

/**
 * Render a math entry's island: the MathLive field, bound to the Text Entry's response and named as
 * its box is.
 *
 * @param paired The Text Entry.
 * @param paired.model Its model node: the author's `data-*`, and the control plate names when the
 *   author named it by nothing.
 * @param paired.payload Its payload: its binding, `base` and names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
const mathIsland = (
  { model, payload: node }: Paired<"text-entry">,
  context: IslandContext,
): ReactNode => (
  <MathEntry
    base={node.base}
    baseType={node.baseType}
    response={node.declared}
    naming={controlNameOf(undefined, node, ownName(model, context), context)}
    root={rootOf(model, context)}
  />
);

/**
 * Render a math entry's review: the LaTeX it posted drawn as math, named as the field is, and its
 * mark.
 *
 * @param paired The Text Entry.
 * @param context What the shell knows: the value shown, and what the render marks it against.
 * @returns The markup.
 */
const mathReview = (paired: Paired<"text-entry">, context: ReviewContext): ReactNode =>
  reviewOf(paired, context, (naming) => (
    <span {...naming} data-slot="alpha-math-entry" role="group">
      <MathAnswer latex={paired.payload.restore} />
    </span>
  ));

/**
 * Give Alpha's Text Entry renderer: a math entry where the author marked the box
 * `alpha-math-entry`, whose field brings its own keyboard and so writes no keypad after the body;
 * else the box this renderer types it with, and what it writes after the body.
 *
 * @param plain How a box that is no math entry renders: its island, and what it writes after the
 *   body.
 * @returns The renderer.
 */
const textEntryOf = (
  plain: Required<Pick<Renderer<"text-entry">, "after" | "island">>,
): Renderer<"text-entry"> => ({
  after: (paired, context) => (isMathEntry(context) ? null : plain.after(paired, context)),
  answer,
  island: (paired, context) =>
    isMathEntry(context) ? mathIsland(paired, context) : plain.island(paired, context),
  review: (paired, context) =>
    isMathEntry(context) ? mathReview(paired, context) : review(paired, context),
});

/**
 * Alpha's Text Entry for a host that shows plate's keys: the math entry, and plate's Text Entry
 * with its on-screen keypad as the host's `textEntryKeypad` asks.
 */
export const textEntry: Renderer<"text-entry"> = textEntryOf({ after, island });

/**
 * Alpha's Text Entry for a host that shows a keypad of its own: the math entry, and every other
 * Text Entry a box that asks the device for no keyboard, with no keys of plate's after the body.
 */
export const hostKeypadTextEntry: Renderer<"text-entry"> = textEntryOf({
  after: () => null,
  island: (paired, context) => box(paired, context, true),
});
