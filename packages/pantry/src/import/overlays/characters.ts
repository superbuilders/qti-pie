/**
 * A node's own characters as `Node.chars` holds them, read from one document's flat rows: the one
 * reading of them for the builders whose rows restate a node's text
 * (`#pantry/import/overlays/expressions.ts`) and of the string values the identity and package
 * overlays copy (`#pantry/import/overlays/string-values.ts`).
 */
import type { Composed } from "#pantry/model/composed.ts";
import type { FlatRows, NodeRow } from "#pantry/model/xdm.ts";

/**
 * Read the characters of each node that holds characters of its own, each in one row of its kind:
 * a text's or a run of whitespace's value, and an entity reference crust keeps as `&name;`.
 *
 * @param rows - The document's flat rows.
 * @returns Each such node's characters, by its `start`; no other node holds any.
 */
export const ownCharactersOf = (rows: FlatRows<Composed>): ReadonlyMap<bigint, string> =>
  new Map([
    ...rows.texts.map(({ start, value }) => [start, value] as const),
    ...rows.whitespace.map(({ start, value }) => [start, value] as const),
    ...rows.entityRefs.map(({ name, start }) => [start, `&${name};`] as const),
  ]);

/**
 * Read each node's own characters as `Node.chars` holds them (`charactersOf` of
 * `#pantry/model/folds.ts`): {@link ownCharactersOf}'s, and none for any other kind.
 *
 * @param rows - The document's flat rows.
 * @returns The reader.
 */
export const charactersIn = (rows: FlatRows<Composed>) => {
  const held = ownCharactersOf(rows);

  return (node: NodeRow<Composed>): string => held.get(node.start) ?? "";
};
