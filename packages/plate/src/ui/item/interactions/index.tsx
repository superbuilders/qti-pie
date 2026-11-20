/**
 * The interactions' seam: what the server shell renders at each interaction of an item's body,
 * given the interaction paired with its payload node, what the shell knows of the item and the
 * render (`#plate/ui/item/context.ts`), and the mode, and at each module's container.
 *
 * Every interaction kind is a module's, and every kind has a file of its own here, `<kind>.tsx`,
 * exporting its `island` and its `review` ({@link Seam}), which the seam reaches through one table
 * ({@link seams}), so a kind's lane edits its own file alone. In `answering` each is its client
 * island, in a Suspense boundary of its own; in `review` and `solution` each is plain server markup
 * with the islands' parts, but a Media's, which replays its media through its replay island, an
 * island that posts nothing (Bjorn's ruling, 2026-11-18; plate's UI suite's J1). A kind that stands
 * inside the author's sentence and writes a right answer, Text Entry and Inline Choice, has an
 * `answer` too ({@link answers}), which the body walk writes after the block that holds it.
 *
 * @module
 */
import { Fragment, Suspense } from "react";
import type { Key, ReactNode } from "react";
import type { ModuleKind } from "#plate/interactions/contract.ts";
import type { Paired, RenderMode, View } from "#plate/payload.ts";
import type { ContainerAt } from "#plate/ui/item/content.tsx";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import * as associate from "#plate/ui/item/interactions/associate.tsx";
import * as choice from "#plate/ui/item/interactions/choice.tsx";
import * as endAttempt from "#plate/ui/item/interactions/end-attempt.tsx";
import * as extendedText from "#plate/ui/item/interactions/extended-text.tsx";
import * as gapMatch from "#plate/ui/item/interactions/gap-match.tsx";
import * as graphicAssociate from "#plate/ui/item/interactions/graphic-associate.tsx";
import * as graphicGapMatch from "#plate/ui/item/interactions/graphic-gap-match.tsx";
import * as graphicOrder from "#plate/ui/item/interactions/graphic-order.tsx";
import * as hotspot from "#plate/ui/item/interactions/hotspot.tsx";
import * as hottext from "#plate/ui/item/interactions/hottext.tsx";
import * as inlineChoice from "#plate/ui/item/interactions/inline-choice.tsx";
import * as match from "#plate/ui/item/interactions/match.tsx";
import * as media from "#plate/ui/item/interactions/media.tsx";
import * as order from "#plate/ui/item/interactions/order.tsx";
import * as portableCustom from "#plate/ui/item/interactions/portable-custom.tsx";
import * as positionObject from "#plate/ui/item/interactions/position-object.tsx";
import * as selectPoint from "#plate/ui/item/interactions/select-point.tsx";
import * as slider from "#plate/ui/item/interactions/slider.tsx";
import * as textEntry from "#plate/ui/item/interactions/text-entry.tsx";

/**
 * What renders one kind's interaction, paired with its payload node: its island in `answering`,
 * and its review in `review` and `solution`, plain server markup or a Media's replay island, each
 * typed by the kind's module, so a module that lands types its seam through its own file.
 *
 * The island is handed the pair and the {@link IslandContext} alone, none of which holds a correct
 * response, a mapping or a template value the redaction withheld, so no island's props can carry
 * one. Only the review is handed the server data.
 *
 * @template K The kind.
 */
interface Seam<K extends ModuleKind> {
  /**
   * Render the kind's client island.
   *
   * @param paired The redacted model node and its payload node, as the kind's module's `redact`
   *   gave it.
   * @param context What the page may know of the render.
   * @returns The island.
   */
  readonly island: (paired: Paired<K>, context: IslandContext) => ReactNode;
  /**
   * Render the kind's review or solution as plain server markup, or as a Media's replay island,
   * which posts nothing: what it shows of the response, and how it marks it, are the context's
   * (`ReviewContext.shows`).
   *
   * @param paired The redacted model node and its payload node.
   * @param context What the shell knows of the item and the render.
   * @returns The markup.
   */
  readonly review: (paired: Paired<K>, context: ReviewContext) => ReactNode;
}

/**
 * Each module kind's seam, by kind: a record over every kind a module parses, so a table missing a
 * kind fails to compile, and indexing it by a kind gives that kind's seam, which correlates a
 * pair's kind with its module's types.
 */
type Seams = { readonly [K in ModuleKind]: Seam<K> };

/**
 * The seam of every module kind, each its own file's.
 */
const seams: Seams = {
  associate,
  choice,
  "end-attempt": endAttempt,
  "extended-text": extendedText,
  "gap-match": gapMatch,
  "graphic-associate": graphicAssociate,
  "graphic-gap-match": graphicGapMatch,
  "graphic-order": graphicOrder,
  hotspot,
  hottext,
  "inline-choice": inlineChoice,
  match,
  media,
  order,
  "portable-custom": portableCustom,
  "position-object": positionObject,
  "select-point": selectPoint,
  slider,
  "text-entry": textEntry,
};

/**
 * What renders the right answer a kind's review writes apart from its interaction, by kind, for
 * the kinds that write one: a record over the module kinds, each member typed by its kind, so
 * indexing it by a kind correlates a pair's kind with its renderer.
 */
type Answers = {
  readonly [K in ModuleKind]?: (paired: Paired<K>, context: ReviewContext) => ReactNode;
};

/**
 * The right answer of each kind a review writes one for apart from its interaction, by kind: the
 * kinds that stand inside the author's sentence, where a frame beside the control broke the
 * sentence across lines, so the body walk writes it after the block that holds the interaction
 * (`Walk.answer` in `#plate/ui/item/content.tsx`). Every other kind's review writes its right
 * answers inside its own markup.
 */
const answers: Answers = {
  "inline-choice": inlineChoice.answer,
  "text-entry": textEntry.answer,
};

/**
 * Give an island its context: a fresh object of the {@link IslandContext}'s fields alone, copied
 * one by one, so the object an island is handed holds none of the server data the shell's context
 * carries, whatever the island does with it.
 *
 * @param context What the shell knows of the item and the render.
 * @returns What the page may know of the render.
 */
const islandContextOf = (context: IslandContext): IslandContext => ({
  body: context.body,
  className: context.className,
  content: context.content,
  instance: context.instance,
  locale: context.locale,
  readAloud: context.readAloud,
  spokenPrompt: context.spokenPrompt,
  textEntryKeypad: context.textEntryKeypad,
});

/**
 * Render one interaction of an item's body through its kind's seam: in `answering` its island
 * inside its own `<Suspense fallback={null}>`, a hydration unit that suspends on nothing; in
 * `review` and `solution` its server markup, with no boundary.
 *
 * @template K The interaction's kind.
 * @param paired The interaction and its payload node.
 * @param context What the shell knows of the item and the render.
 * @param mode The render's mode.
 * @param key The interaction's key among its siblings.
 * @returns The island or the markup.
 */
export const renderInteraction = <K extends ModuleKind>(
  paired: Paired<K>,
  context: ReviewContext,
  mode: RenderMode,
  key: Key,
): ReactNode => {
  const seam = seams[paired.kind];

  return mode === "answering" ? (
    <Suspense fallback={null} key={key}>
      {seam.island(paired, islandContextOf(context))}
    </Suspense>
  ) : (
    <Fragment key={key}>{seam.review(paired, context)}</Fragment>
  );
};

/**
 * Render the right answer a review writes for one interaction of an item's body apart from it
 * ({@link answers}): its kind's `answer` in `review` and `solution`, which writes nothing where the
 * answer shown is right or the render marks nothing; nothing in `answering`, and nothing for a kind
 * that has no `answer`.
 *
 * @template K The interaction's kind.
 * @param paired The interaction and its payload node.
 * @param context What the shell knows of the item and the render.
 * @param mode The render's mode.
 * @param key The answer's key among the nodes after the block.
 * @returns The answer, or nothing.
 */
export const renderAnswer = <K extends ModuleKind>(
  paired: Paired<K>,
  context: ReviewContext,
  mode: RenderMode,
  key: Key,
): ReactNode => {
  const answer = answers[paired.kind];

  return mode === "answering" || answer === undefined ? null : (
    <Fragment key={key}>{answer(paired, context)}</Fragment>
  );
};

/**
 * Render a module's container through its module's view, in a mode: Position Object's
 * `qti-position-object-stage`, the one container a module declares (`ContainerKind` in
 * `#plate/interactions/contract.ts`). `<Item>` hands it to the body walk as `Walk.container`
 * (`#plate/ui/item/content.tsx`), which reaches it only through the walk, since every file of the
 * seam imports the walk. The view takes the mode, as an interaction's seam does: a container's
 * island is the client's in `answering`, and `review` and `solution` ship no JavaScript.
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
