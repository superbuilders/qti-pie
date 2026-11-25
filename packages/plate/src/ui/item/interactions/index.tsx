/**
 * The interactions' dispatch: what the server shell renders at each interaction of an item's body,
 * given the interaction paired with its payload node, what the shell knows of the item and the
 * render (`#plate/ui/item/context.ts`), the mode and the renderers the host composed
 * (`Renderers` in `#plate/ui/registry/contract.ts`), and at each module's container.
 *
 * Every interaction kind is a module's, and the host hands one renderer per kind (plate's standard
 * renderers, `#plate/ui/registry/standard.ts`, or a composition over them), which the dispatch
 * reaches by the pair's kind. In `answering` each is its client island, in a Suspense boundary of
 * its own; in `review` and `solution` each is plain server markup with the islands' parts, but a
 * Media's, which replays its media through its replay island, an island that posts nothing
 * (Bjorn's ruling, 2026-11-18; plate's UI suite's J1). A kind that stands inside the author's
 * sentence and writes a right answer, Text Entry and Inline Choice, has an `answer` too, which the
 * body walk writes after the block that holds it.
 *
 * @module
 */
import { Fragment, Suspense } from "react";
import type { Key, ReactNode } from "react";
import type { ModuleKind } from "#plate/interactions/contract.ts";
import type { Paired, RenderMode, View } from "#plate/payload.ts";
import type { ContainerAt } from "#plate/ui/item/content.tsx";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import * as positionObject from "#plate/ui/item/interactions/position-object.tsx";
import type { Renderers } from "#plate/ui/registry/contract.ts";

/**
 * Give an island its context: a fresh object of the {@link IslandContext}'s fields alone, copied
 * one by one, so the object an island is handed holds none of the server data the shell's context
 * carries, whatever the island does with it.
 *
 * @param context What the shell knows of the item and the render.
 * @returns What the page may know of the render.
 */
const islandContextOf = (context: IslandContext): IslandContext => ({
  bankCaption: context.bankCaption,
  body: context.body,
  className: context.className,
  content: context.content,
  instance: context.instance,
  locale: context.locale,
  readAloud: context.readAloud,
  spokenPrompt: context.spokenPrompt,
  stimulus: context.stimulus,
  textEntryKeypad: context.textEntryKeypad,
});

/**
 * Render one interaction of an item's body through its kind's renderer: in `answering` its island
 * inside its own `<Suspense fallback={null}>`, a hydration unit that suspends on nothing; in
 * `review` and `solution` its server markup, with no boundary.
 *
 * @template K The interaction's kind.
 * @param renderers The renderer of every kind, as the host composed them.
 * @param paired The interaction and its payload node.
 * @param context What the shell knows of the item and the render.
 * @param mode The render's mode.
 * @param key The interaction's key among its siblings.
 * @returns The island or the markup.
 */
export const renderInteraction = <K extends ModuleKind>(
  renderers: Renderers,
  paired: Paired<K>,
  context: ReviewContext,
  mode: RenderMode,
  key: Key,
): ReactNode => {
  const renderer = renderers[paired.kind];

  return mode === "answering" ? (
    <Suspense fallback={null} key={key}>
      {renderer.island(paired, islandContextOf(context))}
    </Suspense>
  ) : (
    <Fragment key={key}>{renderer.review(paired, context)}</Fragment>
  );
};

/**
 * Render the right answer a review writes for one interaction of an item's body apart from it
 * (`Renderer.answer` in `#plate/ui/registry/contract.ts`): its kind's `answer` in `review` and
 * `solution`, which writes nothing where the answer shown is right or the render marks nothing;
 * nothing in `answering`, and nothing for a kind whose renderer has no `answer`.
 *
 * @template K The interaction's kind.
 * @param renderers The renderer of every kind, as the host composed them.
 * @param paired The interaction and its payload node.
 * @param context What the shell knows of the item and the render.
 * @param mode The render's mode.
 * @param key The answer's key among the nodes after the block.
 * @returns The answer, or nothing.
 */
export const renderAnswer = <K extends ModuleKind>(
  renderers: Renderers,
  paired: Paired<K>,
  context: ReviewContext,
  mode: RenderMode,
  key: Key,
): ReactNode => {
  const { answer } = renderers[paired.kind];

  return mode === "answering" || answer === undefined ? null : (
    <Fragment key={key}>{answer(paired, context)}</Fragment>
  );
};

/**
 * Render a module's container through its module's view, in a mode: Position Object's
 * `qti-position-object-stage`, the one container a module declares (`ContainerKind` in
 * `#plate/interactions/contract.ts`). `<Item>` hands it to the body walk as `Walk.container`
 * (`#plate/ui/item/content.tsx`), which reaches it only through the walk, since every standard
 * renderer's file imports the walk. The view takes the mode, as an interaction's renderer does: a
 * container's island is the client's in `answering`, and `review` and `solution` ship no
 * JavaScript.
 *
 * @param mode The render's mode.
 * @param view The view each interaction's payload node is given by.
 * @returns How the walk renders a container: `node` is its node, and `walk` its children to
 *   render, its key and the walk where it stands.
 */
export const renderContainer =
  (mode: RenderMode, view: View): ContainerAt =>
  (node, walk) =>
    positionObject.container(node, walk, mode, view);
