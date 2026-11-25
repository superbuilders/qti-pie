/**
 * Plate's server entry, `@qti-pie/plate/ui`: `<Item>`, the React Server Component a host renders an
 * opened item with, its props, and what it refuses; and the renderers it draws each interaction
 * kind with, plate's standard ones and their composition with an extension's, which a host does
 * once at its root and hands to every `<Item>`. The host passes the element it returns as
 * `children` to its own client form, which wraps it in `<Responses>` from the client entry,
 * `@qti-pie/plate/ui/client`.
 *
 * @module
 */
export { AssetMissing, InvalidInstance, OutputTooLarge } from "#plate/ui/item/errors.ts";

export { Item } from "#plate/ui/item/item.tsx";

export { RendererClaimedTwice, renderersOf } from "#plate/ui/registry/compose.ts";

export type { Renderer, RendererExtension, Renderers } from "#plate/ui/registry/contract.ts";

export { standardRenderers } from "#plate/ui/registry/standard.ts";

export type {
  AnswerMark,
  Credit,
  Graded,
  GradedMarks,
  ItemProps,
  PartMark,
  Reveals,
} from "#plate/ui/props.ts";
