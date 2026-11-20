/**
 * The producers of the law oracle's laws over banks and what they hold (O7, lane OL): each stated
 * on the host from its source in the law catalog and the schema's statement of it in
 * `src/qti/tests.ts`, over the banks `#pantry/test/oracle-laws/assembly.ts` reads.
 *
 * - **The stated limits** ({@link testStructureOf}, {@link bankElementsOf}, spec reading 1): `Test
 *   structure`, no test, test part, section, section ref or item ref outside a section document;
 *   `Bank shape`, every element of a section document is its root section or an item ref the root
 *   holds, and a bank's item ref writes no `required`, `fixed` or `category`.
 * - **One bank** ({@link documentLawsOf}): `Structure identifier`, the key `(document, identifier)`
 *   over its names (reading 86).
 * - **The package's banks** ({@link bankKeyOf}): `Bank key`, no two banks share their root's
 *   identifier.
 * - **The items an item ref names** ({@link itemRefTargetsOf}, {@link memberLawsOf}): `Item ref
 *   target`, its href names an item or an LTI link of the package (B2, B3); `Item ref identifier`,
 *   a bank member's identifier is its item's (QTI §4.1.1).
 * - **Each listed document** ({@link stimulusRefKeyOf}): `Stimulus ref key`, no two stimulus refs of
 *   one item share an identifier (§7.6.2).
 */
import { Option } from "effect";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import {
  bankResourceType,
  isLinkType,
  itemRefDocument,
  itemRefTargetOf,
  testDocumentsOf,
  testKinds,
} from "#pantry/test/oracle-laws/assembly.ts";
import type { TestDocument } from "#pantry/test/oracle-laws/assembly.ts";
import { breachAt, typedValueOf, valueOf } from "#pantry/test/oracle-view.ts";
import type { LawBreach, ListedRows, PackageRows, View } from "#pantry/test/oracle-view.ts";

/**
 * The laws this module produces.
 */
export const testLaws = [
  "Test structure",
  "Bank shape",
  "Structure identifier",
  "Bank key",
  "Stimulus ref key",
  "Item ref target",
  "Item ref identifier",
] as const;

/**
 * A law of {@link testLaws}.
 */
type TestLaw = (typeof testLaws)[number];

/**
 * A breach of one of this module's laws at a node.
 */
type Breach = LawBreach<TestLaw>;

/**
 * The kinds a test's structure is made of, which no document but a bank holds (`Test structure`).
 */
const structureKinds: ReadonlySet<string> = new Set([
  testKinds.test,
  testKinds.part,
  testKinds.section,
  testKinds.sectionRef,
  testKinds.itemRef,
]);

/**
 * The node kinds that are no element (C8): the text, comment, instruction, entity reference and
 * doctype nodes a document may hold anywhere.
 */
const nonElements: ReadonlySet<string> = new Set([
  "text",
  "ws",
  "comment",
  "pi",
  "entityRef",
  "doctype",
]);

/**
 * The attributes of an item ref that only a test's delivery reads (`Bank shape`).
 */
const unreadAttributes = ["required", "fixed", "category"] as const;

/**
 * Judge `Test structure` over one listed document of another type than a bank's: each element of a
 * test's structure in it breaks it.
 *
 * @param listed - The document.
 * @returns The breaches.
 */
const testStructureOf = (listed: ListedRows): readonly Breach[] =>
  listed.resourceType === bankResourceType
    ? []
    : listed.rows.members
        .filter(({ kind }) => structureKinds.has(kind))
        .map((node) => breachAt(listed.rows, node, "Test structure"));

/**
 * Judge `Bank shape` over one listed bank: each element but its root section and the item refs that
 * root holds breaks it, and so does each of those item refs' `required`, `fixed` or `category`.
 *
 * @param listed - The document.
 * @returns The breaches.
 */
const bankElementsOf = (listed: ListedRows): readonly Breach[] => {
  const { rows } = listed;
  if (listed.resourceType !== bankResourceType) {
    return [];
  }

  const parentKindOf = (parent: bigint): string => rows.byStart.get(parent)?.kind ?? "";

  return rows.members.flatMap((node): readonly Breach[] => {
    if (nonElements.has(node.kind)) {
      return [];
    }

    const parentKind = parentKindOf(node.parent);
    const root = node.kind === testKinds.section && parentKind === "document";
    const member = node.kind === testKinds.itemRef && parentKind === testKinds.section;
    if (!root && !member) {
      return [breachAt(rows, node, "Bank shape", { parentKind })];
    }

    return member
      ? unreadAttributes
          .filter((name) => Option.isSome(valueOf(rows, node.start, name)))
          .map((name) => breachAt(rows, node, "Bank shape", { attribute: name, parentKind }))
      : [];
  });
};

/**
 * Judge one bank's own laws: its names' key.
 *
 * @param document - The bank.
 * @returns The breaches.
 */
const documentLawsOf = (document: TestDocument): readonly Breach[] => {
  const { rows } = document.listed;

  return [...Map.groupBy(document.names, ({ identifier }) => identifier)].flatMap(
    ([identifier, held]) =>
      held.slice(1).map((name) =>
        breachAt(rows, name.node, "Structure identifier", {
          identifier,
          other: held[0]?.node.kind ?? "",
        }),
      ),
  );
};

/**
 * Judge `Bank key`: no two banks of the package share their root's identifier. Each bank after the
 * first of one identifier breaks it, at its root.
 *
 * @param documents - The package's banks.
 * @returns The breaches.
 */
const bankKeyOf = (documents: readonly TestDocument[]): readonly Breach[] => {
  const roots = documents.flatMap((document) =>
    Option.toArray(document.root).map((root) => ({ document, root })),
  );

  return [...Map.groupBy(roots, ({ root }) => root.identifier)].flatMap(([identifier, held]) =>
    held
      .slice(1)
      .map(({ document, root }) =>
        breachAt(document.listed.rows, root.node, "Bank key", { identifier }),
      ),
  );
};

/**
 * Judge each stimulus ref key of one listed document: no two of its stimulus refs share an
 * identifier, compared collapsed (§7.6.2: "each reference must have a unique identifier").
 *
 * @param listed - The document.
 * @returns The breaches.
 */
const stimulusRefKeyOf = (listed: ListedRows): readonly Breach[] => {
  const { rows } = listed;
  const refs = rows.members.flatMap((node) =>
    node.kind === "qti-assessment-stimulus-ref"
      ? Option.toArray(typedValueOf(rows, node.start, "identifier")).map((identifier) => ({
          identifier,
          node,
        }))
      : [],
  );

  return [...Map.groupBy(refs, ({ identifier }) => identifier)].flatMap(([identifier, held]) =>
    held.slice(1).map(({ node }) => breachAt(rows, node, "Stimulus ref key", { identifier })),
  );
};

/**
 * Judge what each item ref of a listed document names, whether or not it writes an identifier: its
 * href, where it writes one, names an item or an LTI link of the package (B2, B3), and one that
 * writes none names nothing, which AL3 alone refuses (spec reading 155).
 *
 * @param input - The package.
 * @param listed - The document.
 * @returns The breaches.
 */
const itemRefTargetsOf = (input: PackageRows, listed: ListedRows): readonly Breach[] =>
  listed.rows.members
    .filter(({ kind }) => kind === testKinds.itemRef)
    .flatMap((node): readonly Breach[] =>
      Option.match(itemRefTargetOf(input, listed, node), {
        onNone: () => [],
        // The href names an LTI link, or an item document the package holds: an item resource's
        // href whose file is missing, or whose root is no item, names no item (§5.6.5).
        onSome: ({ path, type }) =>
          Option.exists(type, isLinkType) || Option.isSome(itemRefDocument(input, listed, node))
            ? []
            : [breachAt(listed.rows, node, "Item ref target", { path })],
      }),
    );

/**
 * Judge each member of a bank: where its item ref, its bank's root and the item it names each
 * write an identifier, the item ref's is its item's (QTI §4.1.1), both compared collapsed.
 *
 * @param input - The package.
 * @param document - The bank.
 * @returns The breaches.
 */
const memberLawsOf = (input: PackageRows, document: TestDocument): readonly Breach[] => {
  const { rows } = document.listed;

  return rows.members
    .filter(({ kind }) => kind === testKinds.itemRef)
    .flatMap((node): readonly Breach[] => {
      const item = itemRefDocument(input, document.listed, node).pipe(
        Option.flatMap((listed) =>
          listed.rows.root.pipe(
            Option.flatMap(({ start }) => typedValueOf(listed.rows, start, "identifier")),
          ),
        ),
      );

      return Option.match(
        Option.all({
          bank: document.root,
          item,
          ref: Option.fromUndefinedOr(document.namesByNode.get(node.start)),
        }),
        {
          onNone: () => [],
          onSome: ({ item: identifier, ref }) =>
            ref.identifier === identifier
              ? []
              : [
                  breachAt(rows, node, "Item ref identifier", {
                    identifier: ref.identifier,
                    item: identifier,
                  }),
                ],
        },
      );
    });
};

/**
 * Judge one folded document by this module's laws over a document alone: none, since a bank's laws
 * read the package's resources, and the stated limits a listed document's type.
 *
 * @param _rows - The document.
 * @param _grammar - The composed grammar.
 * @returns No breach.
 */
export const testDocumentBreaches = (
  _rows: View,
  _grammar: ComposedGrammar,
): readonly Breach[] => [];

/**
 * Judge a package by the laws of its banks: each listed document's stated limits, stimulus refs
 * and item refs, each bank's own laws and its members', and the key over its banks.
 *
 * @param input - The package.
 * @param _grammar - The composed grammar.
 * @returns The breaches.
 */
export const testPackageBreaches = (
  input: PackageRows,
  _grammar: ComposedGrammar,
): readonly Breach[] => {
  const documents = [...testDocumentsOf(input).values()];

  return [
    ...input.documents.flatMap((listed) => [
      ...testStructureOf(listed),
      ...bankElementsOf(listed),
      ...stimulusRefKeyOf(listed),
      ...itemRefTargetsOf(input, listed),
    ]),
    ...documents.flatMap((document) => [
      ...documentLawsOf(document),
      ...memberLawsOf(input, document),
    ]),
    ...bankKeyOf(documents),
  ];
};
