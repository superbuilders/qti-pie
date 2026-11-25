/**
 * The renderers' contract: what renders each interaction kind's interaction in the server shell
 * (`<Item>`, `#plate/ui/item/item.tsx`), which a host composes once at its root (`renderersOf` in
 * `#plate/ui/registry/compose.ts`) and hands to every `<Item>` as its required `renderers`.
 *
 * Only presentation is pluggable. The kinds are closed (`ModuleKind` in
 * `#plate/interactions/contract.ts`), and parsing, redaction, admission and grading stay core: a
 * renderer is handed an interaction already parsed, redacted and paired with its payload node, and
 * draws it. An extension, such as a host's or `alpha/`'s, replaces a kind's renderer whole, never a
 * part of one, so each kind has exactly one renderer in a composition, with no variant keys and no
 * per-item switches.
 *
 * @module
 */
import type { ReactNode } from "react";
import type { ModuleKind } from "#plate/interactions/contract.ts";
import type { Paired } from "#plate/payload.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";

/**
 * What renders one kind's interaction, paired with its payload node: its island in `answering`,
 * and its review in `review` and `solution`, plain server markup or a Media's replay island, each
 * typed by the kind's module, so a module that lands types its renderer through its own file.
 *
 * The island is handed the pair and the {@link IslandContext} alone, none of which holds a correct
 * response, a mapping or a template value the redaction withheld, so no island's props can carry
 * one. Only the review and the answer are handed the server data.
 *
 * @template K The kind.
 */
export interface Renderer<K extends ModuleKind> {
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
  /**
   * Render the right answer a review writes apart from the interaction, for a kind that stands
   * inside the author's sentence, Text Entry and Inline Choice, where a frame beside the control
   * broke the sentence across lines, so the body walk writes it after the block that holds the
   * interaction (`Walk.answer` in `#plate/ui/item/content.tsx`). Absent for every other kind, whose
   * review writes its right answers inside its own markup.
   *
   * @param paired The redacted model node and its payload node.
   * @param context What the shell knows of the item and the render.
   * @returns The answer, or nothing where the answer shown is right or the render marks nothing.
   */
  readonly answer?: (paired: Paired<K>, context: ReviewContext) => ReactNode;
  /**
   * Render the island the kind writes after the item's body while the child answers, below
   * everything the child reads, such as a Text Entry's on-screen keypad, which inside the author's
   * sentence split "4 + [ ] = 11" and stood over the box, a line or a picture (`renderAfter` in
   * `#plate/ui/item/interactions/index.tsx`). Absent for every other kind; a review and a solution
   * write none.
   *
   * Like the island, it is handed the pair and the {@link IslandContext} alone.
   *
   * @param paired The redacted model node and its payload node.
   * @param context What the page may know of the render.
   * @returns The island, or nothing where the interaction writes none.
   */
  readonly after?: (paired: Paired<K>, context: IslandContext) => ReactNode;
}

/**
 * A renderer for every module kind, by kind: a record over every kind a module parses, so a
 * composition missing a kind fails to compile, and indexing it by a kind gives that kind's
 * renderer, which correlates a pair's kind with its module's types. What `<Item>` takes as
 * `renderers`.
 */
export type Renderers = { readonly [K in ModuleKind]: Renderer<K> };

/**
 * What an extension supplies: a renderer for some kinds, each replacing that kind's renderer whole
 * where `renderersOf` composes it over a base.
 */
export type RendererExtension = { readonly [K in ModuleKind]?: Renderer<K> };
