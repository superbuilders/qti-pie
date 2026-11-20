/**
 * The banks as the law oracle's bank producers read them (lane OL): each bank's names over its own
 * folded rows, and the item an item ref names.
 *
 * It restates `src/qti/tests.ts` on the host, from the information model and the placement
 * mandate, never from the importer's overlay (`#pantry/import/overlays/tests.ts`):
 *
 * - **names** (`Named`, reading 86): a bank's root section and every item ref that writes an
 *   identifier its type reads (reading 147: one that writes none names nothing), its identifier
 *   collapsed;
 * - **the item an item ref names** (`ItemRefTarget`, `ItemRefDocument`, the UP audit's B2 and B3):
 *   its href resolved, the type of the resource whose href resolves there, and the document there
 *   where that resource is an item.
 */
import { Option } from "effect";
import { hrefPathOf, typedOr, typedValueOf } from "#pantry/test/oracle-view.ts";
import type { ListedRows, PackageRows, Row, View } from "#pantry/test/oracle-view.ts";

/**
 * The kinds of a test's structure (information model §4.2, §5.6, §5.159, §7.5).
 */
export const testKinds = {
  item: "qti-assessment-item",
  itemRef: "qti-assessment-item-ref",
  part: "qti-test-part",
  section: "qti-assessment-section",
  sectionRef: "qti-assessment-section-ref",
  test: "qti-assessment-test",
} as const;

/**
 * The kinds whose identifiers name a bank and its members: its root section and its item refs.
 */
const namedKinds: ReadonlySet<string> = new Set([testKinds.section, testKinds.itemRef]);

/**
 * The resource type of an item document (IMS Content Packaging's QTI 3.0 profile).
 */
export const itemResourceType = "imsqti_item_xmlv3p0";

/**
 * The resource type of a bank, a standalone section document (the placement mandate, ruling 2).
 */
export const bankResourceType = "imsqti_section_xmlv3p0";

/**
 * Whether a resource type is an LTI link's, the other target an item ref may name (the UP audit's
 * B3, R36; the implementation guide's §6.2.9): the LTI types of the `ResourceType` roster.
 *
 * @param type - The type.
 * @returns Whether it is an LTI link's.
 */
export const isLinkType = (type: string): boolean => /^ims(?:basic)?ltia?_xmlv/u.test(type);

/**
 * One name of a bank (`Named`): its node and its collapsed identifier.
 */
export interface Name {
  readonly identifier: string;
  readonly node: Row;
}

/**
 * A document whose root is a section, a bank, as its producers read it.
 */
export interface TestDocument {
  readonly listed: ListedRows;
  readonly names: readonly Name[];
  readonly namesByNode: ReadonlyMap<bigint, Name>;
  /**
   * Its root section's name, none where the root writes no identifier its type reads.
   */
  readonly root: Option.Option<Name>;
}

/**
 * Read a bank's names.
 *
 * @param listed - The document.
 * @returns Its names, each by its node, and its root's.
 */
export const testDocumentOf = (listed: ListedRows): TestDocument => {
  const { rows } = listed;
  // An element that writes no identifier names nothing (reading 147): the XSD requires it, with
  // no default, and no identifier is empty, so AL3 alone refuses the element.
  const names = rows.members.flatMap((node): readonly Name[] =>
    namedKinds.has(node.kind)
      ? Option.toArray(typedValueOf(rows, node.start, "identifier")).map((identifier) => ({
          identifier,
          node,
        }))
      : [],
  );
  const namesByNode = new Map(names.map((name) => [name.node.start, name] as const));

  return {
    listed,
    names,
    namesByNode,
    root: rows.root.pipe(
      Option.flatMap(({ start }) => Option.fromUndefinedOr(namesByNode.get(start))),
    ),
  };
};

/**
 * Read every listed document whose root is a section, once each by its path.
 *
 * @param input - The package.
 * @returns The documents.
 */
export const testDocumentsOf = (input: PackageRows): ReadonlyMap<string, TestDocument> => {
  const byPath = new Map<string, TestDocument>();
  for (const listed of input.documents) {
    if (
      Option.exists(listed.rows.root, ({ kind }) => kind === testKinds.section) &&
      !byPath.has(listed.path)
    ) {
      byPath.set(listed.path, testDocumentOf(listed));
    }
  }

  return byPath;
};

/**
 * The resources of a manifest by the path their href resolves to: each `cp:resource`'s type as its
 * type reads it, in manifest order, none for a type written outside its lexical space.
 *
 * @param manifest - The manifest.
 * @returns Each resolved href path's resource types.
 */
const resourceTypesByPath = (
  manifest: View,
): ReadonlyMap<string, readonly Option.Option<string>[]> => {
  const byPath = new Map<string, Option.Option<string>[]>();
  for (const node of manifest.members) {
    if (node.kind === "cp:resource") {
      for (const path of Option.toArray(hrefPathOf(manifest, node))) {
        byPath.set(path, [...(byPath.get(path) ?? []), typedOr(manifest, node.start, "type", "")]);
      }
    }
  }

  return byPath;
};

/**
 * Name what an item ref's href names (the UP audit's B2 and B3): its resolved path, and the type
 * of the resource whose href resolves there, an item's before an LTI link's before any other,
 * none where no resource does. A resource whose type is written outside its lexical space names no
 * type a law could read, so where no item or link resource stands beside it, the ref names nothing
 * to judge.
 *
 * @param input - The package.
 * @param referrer - The document that holds the item ref.
 * @param itemRef - The item ref's node.
 * @returns Its path and type, none where it writes no href or its target's type is unread.
 */
export const itemRefTargetOf = (
  input: PackageRows,
  referrer: ListedRows,
  itemRef: Row,
): Option.Option<{ readonly path: string; readonly type: Option.Option<string> }> =>
  Option.flatMap(hrefPathOf(referrer.rows, itemRef), (path) => {
    const held = resourceTypesByPath(input.manifest).get(path) ?? [];
    const types = held.flatMap((type) => Option.toArray(type));
    const named = types.find((type) => type === itemResourceType) ?? types.find(isLinkType);

    return named === undefined && types.length < held.length
      ? Option.none()
      : Option.some({ path, type: Option.fromNullishOr(named ?? types.at(0)) });
  });

/**
 * Name the listed document an item ref's href names, when its root is an item: the href resolved
 * as the importer resolves a reference, named by a resource of the item type, and the listed
 * document at that path.
 *
 * @param input - The package.
 * @param referrer - The document that holds the item ref.
 * @param itemRef - The item ref's node.
 * @returns The item document, none when the href names no item document of the package.
 */
export const itemRefDocument = (
  input: PackageRows,
  referrer: ListedRows,
  itemRef: Row,
): Option.Option<ListedRows> =>
  Option.flatMap(itemRefTargetOf(input, referrer, itemRef), ({ path, type }) =>
    Option.contains(type, itemResourceType)
      ? Option.fromNullishOr(
          input.documents.find(
            (listed) =>
              listed.path === path &&
              Option.exists(listed.rows.root, ({ kind }) => kind === testKinds.item),
          ),
        )
      : Option.none(),
  );
