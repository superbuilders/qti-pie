/**
 * Plate's server entry, `@qti-pie/plate/ui`: `<Item>`, the React Server Component a host renders an
 * opened item with, its props, and what it refuses. The host passes the element it returns as
 * `children` to its own client form, which wraps it in `<Responses>` from the client entry,
 * `@qti-pie/plate/ui/client`.
 *
 * @module
 */
export type { Graded, GradedMarks, Reveals } from "#plate/ui/item/context.ts";

export { AssetMissing, InvalidInstance, OutputTooLarge } from "#plate/ui/item/errors.ts";

export { Item } from "#plate/ui/item/item.tsx";

export type { ItemProps } from "#plate/ui/item/item.tsx";
