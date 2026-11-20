/**
 * The metadata overlays' rows (plan §1.7 O6, §C's `rowsOf`): from one document's view
 * (`DocumentView` of `#pantry/import/fold.ts`), the rows of every per-document relation
 * `#pantry/qti/metadata.ts` declares, each relation's rows a keyed set. Which document a record
 * names is no row's: the database reads it (`#pantry/qti/queries.ts` `namingRecords`).
 *
 * The rows restate what the tree says and nothing else: each overlay copies its nodes' tuples as
 * the tree's rows give them (`flatten` of `#pantry/model/xdm.ts`), and each copied text as written.
 * The database proves every one of them (`metadataLaws`, and the rule over `UsageBaseType` of
 * `#pantry/qti/queries.ts`), so a row this builder gets wrong is refused, never accepted. A copied
 * text past `keyText`'s bound is written as it is, and its field's pattern refuses it under the
 * schema's limit law.
 */
import type { Addition } from "@bjornpagen/grizzle";
import { Option } from "effect";
import { spelledBaseTypes } from "#pantry/grammar/attributes.ts";
import { lexicalOf } from "#pantry/import/fold.ts";
import type { AttributeIndex, DocumentView } from "#pantry/import/fold.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { FlatRows, NodeRow } from "#pantry/model/xdm.ts";
import type { UsageValue, UsageValueBaseType } from "#pantry/qti/metadata.ts";
import { usageValueKind } from "#pantry/vocab/terms/metadata.ts";

/**
 * Where a document stands in its package, as this builder reads it: the part of the importer's
 * `DocumentPlace` (Q5.15) it needs beside the document's view.
 */
export interface MetadataIds {
  /**
   * The package's name, which every row holds as `package`.
   */
  readonly package: string;
  /**
   * The document's path in the package, which every row holds as `path`.
   */
  readonly path: string;
}

/**
 * A document's metadata rows, one keyed set per relation: each map from the text of a row's key,
 * its node's `(package, path, start)` ({@link keyTextOf}), to the row as its writer writes it.
 */
export interface MetadataRows {
  readonly UsageValue: ReadonlyMap<string, Addition<typeof UsageValue>>;
  readonly UsageValueBaseType: ReadonlyMap<string, Addition<typeof UsageValueBaseType>>;
}

/**
 * The string value of a node with no character child: the empty text, the concatenation of no
 * characters (`Node.stringValue`, "the empty string when it holds none", `#pantry/model/folds.ts`;
 * XDM 3.1 gives an element with no text descendants "the zero-length string").
 *
 * @see {@link https://www.w3.org/TR/xpath-datamodel-31/#dm-string-value | XDM 3.1, dm:string-value}
 */
const noCharacters = "";

/**
 * Compute each node's string value as `Node.stringValue` folds it for the kinds an overlay copies:
 * its children's characters in order, a text's and whitespace's as they are, an entity reference's
 * as `&name;`, an element's, a comment's and an instruction's none. Every overlay that copies a
 * node's string value reads it here (`#pantry/import/overlays/identity.ts` too).
 *
 * @param rows - The document's flat rows.
 * @returns Each node's string value, by its `start`: {@link noCharacters} for a node with no
 *   character child.
 */
export const stringValuesOf = (rows: FlatRows<Composed>): ((start: bigint) => string) => {
  const chars = new Map<bigint, string>([
    ...rows.texts.map(({ start, value }) => [start, value] as const),
    ...rows.whitespace.map(({ start, value }) => [start, value] as const),
    ...rows.entityRefs.map(({ name, start }) => [start, `&${name};`] as const),
  ]);
  const held = rows.nodes.flatMap(({ parent, start }) => {
    const value = chars.get(start);

    return value === undefined ? [] : [{ parent, value }];
  });
  const values = new Map(
    [...Map.groupBy(held, ({ parent }) => parent)].map(([parent, children]) => [
      parent,
      children.map(({ value }) => value).join(""),
    ]),
  );

  return (start) => values.get(start) ?? noCharacters;
};

/**
 * The text of a row's key in its relation's keyed set: its node's `(package, path, start)` as a
 * JSON array, so the rows of two documents never meet at one key.
 *
 * @param ids - The document's place.
 * @param start - The node's `start`.
 * @returns The key text.
 */
const keyTextOf = (ids: MetadataIds, start: bigint): string =>
  JSON.stringify([ids.package, ids.path, String(start)]);

/**
 * A document's node as every row of it holds it first: its key, `(package, path, start)`.
 */
interface NodeKey {
  readonly package: string;
  readonly path: string;
  readonly start: bigint;
}

/**
 * A document's tree as the builders read it: its flat rows, and each element's attributes and
 * string value.
 */
interface Tree {
  readonly attributes: AttributeIndex;
  /**
   * Key a node's row: the node's key, and the text of that key in a keyed set.
   */
  readonly keyOf: (node: NodeRow<Composed>) => readonly [string, NodeKey];
  readonly nodes: readonly NodeRow<Composed>[];
  readonly stringValueOf: (start: bigint) => string;
}

/**
 * Read a document's view once, as every builder below reads it.
 *
 * @param view - The document's view, whose rows it reads.
 * @param ids - Where the document stands in its package, the key every row holds.
 * @returns The tree's rows and lookups.
 */
const treeOf = (view: DocumentView, ids: MetadataIds): Tree => {
  const { rows } = view;
  const keyOf = (node: NodeRow<Composed>): readonly [string, NodeKey] => [
    keyTextOf(ids, node.start),
    { package: ids.package, path: ids.path, start: node.start },
  ];

  return {
    attributes: view.attributes,
    keyOf,
    nodes: rows.nodes,
    stringValueOf: stringValuesOf(rows),
  };
};

/**
 * Build a document's {@link UsageValue} rows: one per usage value that forms part of a record, that
 * is, writes a `fieldIdentifier` and a `baseType` (spec reading 105), its `baseType` as written and
 * its text its string value. A `baseType` outside a record states no base type, so its value has no
 * row.
 *
 * @param tree - The document's tree.
 * @returns The rows, by their node's key.
 */
const usageValueRowsOf = (tree: Tree): ReadonlyMap<string, Addition<typeof UsageValue>> =>
  new Map(
    tree.nodes.flatMap((node) =>
      (node.kind === usageValueKind && Option.isSome(lexicalOf(tree, node.start, "fieldIdentifier"))
        ? Option.toArray(lexicalOf(tree, node.start, "baseType"))
        : []
      ).map((lexical) => {
        const [text, key] = tree.keyOf(node);

        return [
          text,
          { ...key, baseTypeLexical: lexical, text: tree.stringValueOf(node.start) },
        ] as const;
      }),
    ),
  );

/**
 * Build a document's {@link UsageValueBaseType} rows: one per {@link UsageValue} row whose
 * `baseType` spells a code, as written (`spelledBaseTypes`), that code beside its lexical form and
 * text. A `baseType` that spells none has no row, and its value domain refuses it alone (decision
 * 427).
 *
 * @param values - The document's usage value rows.
 * @returns The rows, by their node's key.
 */
const usageValueBaseTypeRowsOf = (
  values: ReadonlyMap<string, Addition<typeof UsageValue>>,
): ReadonlyMap<string, Addition<typeof UsageValueBaseType>> =>
  new Map(
    [...values].flatMap(([id, value]) =>
      spelledBaseTypes.has(value.baseTypeLexical)
        ? [[id, { ...value, baseType: value.baseTypeLexical }] as const]
        : [],
    ),
  );

/**
 * Build the metadata rows of one document. A LOM record has no row of its own: the database reads
 * it from the tree (`#pantry/qti/queries.ts`), and neither has an item's root's `identifier` or
 * `title`, nor a usage value's `baseType`: the database selects each attribute's `value`
 * (`ObjectIdentifier`, `objectTitles` and `UsageBaseType` of `#pantry/qti/queries.ts`). A usage
 * statistic's `lastUpdated` is its value domain's alone (AL1). In every document, a usage value has
 * its {@link UsageValue} where it writes a `baseType` and a `fieldIdentifier`, and its
 * {@link UsageValueBaseType} where that `baseType` spells a code; an optional attribute's row
 * exists where it is written.
 *
 * @param view - The document's view.
 * @param ids - Where it stands in its package: its package, its path and its type.
 * @returns Every per-document overlay's rows.
 */
export const rowsOf = (view: DocumentView, ids: MetadataIds): MetadataRows => {
  const tree = treeOf(view, ids);
  const usageValues = usageValueRowsOf(tree);

  return {
    UsageValue: usageValues,
    UsageValueBaseType: usageValueBaseTypeRowsOf(usageValues),
  };
};
