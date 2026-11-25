/**
 * The tests, sections and banks as the law oracle's test producers read them (lane OL): each
 * document's names, sections and branch rules over its own folded rows, the item an item ref
 * names, and each test's assembly of the documents its section refs and includes place (spec
 * readings 5 and 85).
 *
 * It restates `src/qti/tests.ts` and `src/qti/overlay-queries/tests.ts` on the host, from the
 * information model, never from the importer's overlay (`#pantry/import/overlays/tests.ts`):
 *
 * - **names** (`Named`, reading 86): every test part, section, section ref and item ref of an
 *   assembled document that writes an identifier its type reads (reading 147: one that writes none
 *   names nothing), its identifier collapsed;
 * - **sections**: each section's parts (§4.2.15), its selection's `select` and replacement (§5.129),
 *   its ordering's shuffle (§5.98), and whether it is loose, written invisible and not kept
 *   together (§5.98, reading 173);
 * - **the assembly** (`Instance`): one tree per test document, its root the test, each child the
 *   document a placing site of its parent's document names (`PackageRows.placements`: a section ref
 *   whose target is a section document, an include that may stand for its target's root), in site
 *   order, with the test part the chain's site in the test lies in and whether a selection with
 *   replacement above a site of the chain can repeat it; a document already on the chain places
 *   nothing (reading 85, which `Inclusion cycle` refuses);
 * - **the item an item ref names** (`ItemRefTarget`, `ItemRefDocument`, the UP audit's B2 and B3):
 *   its href resolved inside the package, the type of the resource whose href resolves there, and
 *   the document there where that resource is an item. An href that resolves outside the package
 *   names nothing a law reads (SV-LAW-02).
 */
import { regex } from "arkregex";
import { Option } from "effect";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import { booleanOf } from "#pantry/grammar/domains.ts";
import {
  elementsOf,
  integerOf,
  pathOf,
  resolvedAt,
  typedOr,
  typedValueOf,
  valueOf,
} from "#pantry/test/oracle-view.ts";
import type { ListedRows, PackageRows, Row, View } from "#pantry/test/oracle-view.ts";

/**
 * The kinds of a test's structure (information model §4.2, §5.6, §5.159, §7.5).
 */
export const testKinds = {
  include: "xi:include",
  item: "qti-assessment-item",
  itemRef: "qti-assessment-item-ref",
  ordering: "qti-ordering",
  part: "qti-test-part",
  rule: "qti-branch-rule",
  section: "qti-assessment-section",
  sectionRef: "qti-assessment-section-ref",
  selection: "qti-selection",
  test: "qti-assessment-test",
} as const;

/**
 * The kinds whose identifiers are one namespace across an assembled test (reading 86; information
 * model §4.2.1, §5.159.1 and §7.5.3).
 */
const namedKinds: ReadonlySet<string> = new Set([
  testKinds.part,
  testKinds.section,
  testKinds.sectionRef,
  testKinds.itemRef,
]);

/**
 * The resource type of an item document (IMS Content Packaging's QTI 3.0 profile).
 */
export const itemResourceType = "imsqti_item_xmlv3p0";

/**
 * Whether a resource type is an LTI link's, the other target an item ref may name (the UP audit's
 * B3, R36; the implementation guide's §6.2.9): the LTI types of the `ResourceType` roster.
 *
 * @param type - The type.
 * @returns Whether it is an LTI link's.
 */
export const isLinkType = (type: string): boolean =>
  regex("^ims(?:basic)?ltia?_xmlv", "u").test(type);

/**
 * The reserved targets every branch rule may name (information model §5.23.1).
 */
const exits: ReadonlySet<string> = new Set(["EXIT_SECTION", "EXIT_TESTPART", "EXIT_TEST"]);

/**
 * Read an element's `xs:boolean` attribute where it writes one: true where its lexical form reads
 * true (`true` or `1`), false where it reads false, and none where it writes none or a form that
 * reads neither, which its value domain refuses alone.
 *
 * @param rows - The document.
 * @param node - The element's `start`.
 * @param name - The attribute's name.
 * @returns The value, none where the element writes none.
 */
export const writtenFlagOf = (rows: View, node: bigint, name: string): Option.Option<boolean> =>
  Option.flatMap(valueOf(rows, node, name), booleanOf);

/**
 * One name of a document (`Named`): its node and its collapsed identifier.
 */
export interface Name {
  readonly identifier: string;
  readonly node: Row;
}

/**
 * One section of a document: its node, its parts, and how its children are drawn.
 */
export interface Section {
  /**
   * Whether it is loose: it writes `visible` false and `keep-together` false, so its children are
   * mixed into its parent's selection (§5.98; reading 173: a section that writes no `visible` is
   * neither visible nor invisible, and `keep-together`'s default is true).
   */
  readonly loose: boolean;
  readonly node: Row;
  /**
   * Its parts: its children of the kinds a section holds as parts (`SectionPart`, §4.2.15).
   */
  readonly parts: readonly Row[];
  /**
   * Whether its selection writes `with-replacement` true (§5.129.2).
   */
  readonly replacing: boolean;
  /**
   * Its selection's `select` as an integer, none where it writes no selection or a `select` its
   * value domain refuses.
   */
  readonly select: Option.Option<bigint>;
  /**
   * Whether its ordering writes `shuffle` true (§5.98.1).
   */
  readonly shuffles: boolean;
}

/**
 * One branch rule of a document whose target is no reserved exit (`BranchRule`): its node, the
 * element that holds it and its target as its value reads it.
 */
export interface Rule {
  readonly node: Row;
  readonly owner: Row;
  readonly target: string;
}

/**
 * A document as the test producers read it.
 */
export interface AssembledDocument {
  readonly listed: ListedRows;
  /**
   * Its names, none where the document is in no assembly (`Document.assembled`): only an
   * assembled document's names are rows.
   */
  readonly names: readonly Name[];
  readonly namesByNode: ReadonlyMap<bigint, Name>;
  readonly rootKind: string;
  readonly rules: readonly Rule[];
  readonly sections: ReadonlyMap<bigint, Section>;
}

/**
 * Read a document's structure.
 *
 * @param listed - The document.
 * @param assembled - Whether it is in an assembly.
 * @param grammar - The composed grammar, whose section parts it reads.
 * @returns Its names, sections and branch rules.
 */
const assembledDocumentOf = (
  listed: ListedRows,
  assembled: boolean,
  grammar: ComposedGrammar,
): AssembledDocument => {
  const { rows } = listed;
  const partKinds = new Set(grammar.references.sectionPart.rows.map(({ kind }) => kind));
  const sections = new Map(
    rows.members
      .filter(({ kind }) => kind === testKinds.section)
      .map((node): readonly [bigint, Section] => {
        const children = elementsOf(rows, node.start);
        const selection = Option.fromNullishOr(
          children.find(({ kind }) => kind === testKinds.selection),
        );
        const ordering = Option.fromNullishOr(
          children.find(({ kind }) => kind === testKinds.ordering),
        );

        return [
          node.start,
          {
            loose:
              Option.contains(writtenFlagOf(rows, node.start, "visible"), false) &&
              Option.contains(writtenFlagOf(rows, node.start, "keep-together"), false),
            node,
            parts: children.filter(({ kind }) => partKinds.has(kind)),
            replacing: Option.exists(selection, ({ start }) =>
              Option.contains(writtenFlagOf(rows, start, "with-replacement"), true),
            ),
            select: selection.pipe(
              Option.flatMap(({ start }) => typedValueOf(rows, start, "select")),
              Option.flatMap(integerOf),
            ),
            shuffles: Option.exists(ordering, ({ start }) =>
              Option.contains(writtenFlagOf(rows, start, "shuffle"), true),
            ),
          },
        ];
      }),
  );
  // An element that writes no identifier names nothing (reading 147): the XSD requires it, with no
  // default, and no identifier is empty, so AL3 alone refuses the element.
  const names = assembled
    ? rows.members.flatMap((node): readonly Name[] =>
        namedKinds.has(node.kind)
          ? Option.toArray(typedValueOf(rows, node.start, "identifier")).map((identifier) => ({
              identifier,
              node,
            }))
          : [],
      )
    : [];
  const rules = rows.members.flatMap((node): readonly Rule[] => {
    const owner = rows.byStart.get(node.parent);

    return node.kind === testKinds.rule && owner !== undefined
      ? Option.toArray(typedValueOf(rows, node.start, "target")).flatMap((target) =>
          exits.has(target) ? [] : [{ node, owner, target }],
        )
      : [];
  });
  const namesByNode = new Map(names.map((name) => [name.node.start, name] as const));

  return {
    listed,
    names,
    namesByNode,
    rootKind: Option.match(rows.root, { onNone: () => "", onSome: ({ kind }) => kind }),
    rules,
    sections,
  };
};

/**
 * Read every listed document, once each by its path, the first listed there.
 *
 * @param input - The package.
 * @param grammar - The composed grammar.
 * @returns The documents, by path.
 */
export const assembledDocumentsOf = (
  input: PackageRows,
  grammar: ComposedGrammar,
): ReadonlyMap<string, AssembledDocument> => {
  const byPath = new Map<string, AssembledDocument>();
  for (const listed of input.documents) {
    if (!byPath.has(listed.path)) {
      byPath.set(
        listed.path,
        assembledDocumentOf(listed, input.assembled.has(listed.path), grammar),
      );
    }
  }

  return byPath;
};

/**
 * Name an element of a document for a breach: by the identifier it writes, or by its place where
 * it writes none.
 *
 * @param rows - The document.
 * @param node - The element.
 * @returns The name.
 */
export const shownName = (rows: View, node: Row): string =>
  Option.getOrElse(typedValueOf(rows, node.start, "identifier"), () => pathOf(rows, node.start));

/**
 * Whether a node lies under a section of its document whose selection draws with replacement
 * (§5.98: replacement "enables two or more instances of an item referred to by the same
 * assessment-item-ref to appear in the sequence of items for a test").
 *
 * @param document - The document.
 * @param node - The node.
 * @returns Whether it does.
 */
const underReplacement = (document: AssembledDocument, node: Row): boolean =>
  [...document.sections.values()].some(
    (section) =>
      section.replacing && section.node.start < node.start && node.start < section.node.end,
  );

/**
 * One placement of a document in a test's assembly (`Instance`): its document, its parent's place
 * in the assembly and the site of the parent's document that places it, its pre-order interval
 * among the assembly's instances, its test part and whether a replacement can repeat it.
 */
export interface Instance {
  readonly document: AssembledDocument;
  /**
   * The end of its interval: one past the last of its descendants' places.
   */
  readonly end: number;
  /**
   * Its parent's place and the site of the parent's document that places it, none for the root.
   */
  readonly from: Option.Option<{ readonly parent: number; readonly site: Row }>;
  /**
   * The `start` of the test part of the test document that holds the site its chain's first
   * placement stands at, none for the root and for an instance placed outside every part.
   */
  readonly part: Option.Option<bigint>;
  /**
   * Whether a selection with replacement can repeat it: its site lies under a replacing section of
   * its parent's document, or its parent is so repeated.
   */
  readonly replaced: boolean;
  readonly start: number;
}

/**
 * The test part of a test document whose interval holds a node, or that is the node.
 *
 * @param document - The test document.
 * @param node - The node.
 * @returns The part's `start`, none where no part holds it.
 */
const partOf = (document: AssembledDocument, node: Row): Option.Option<bigint> =>
  Option.map(
    Option.fromNullishOr(
      document.listed.rows.members.find(
        (held) => held.kind === testKinds.part && held.start <= node.start && node.start < held.end,
      ),
    ),
    ({ start }) => start,
  );

/**
 * Assemble a test: its instance tree, rooted at it, in pre-order.
 *
 * @param input - The package.
 * @param byPath - The package's documents, by path.
 * @param root - The test document.
 * @returns The assembly's instances, the root first, each at its own place.
 */
const assemblyOf = (
  input: PackageRows,
  byPath: ReadonlyMap<string, AssembledDocument>,
  root: AssembledDocument,
): readonly Instance[] => {
  const placed: Instance[] = [];
  const place = (
    document: AssembledDocument,
    chain: readonly string[],
    at: Pick<Instance, "from" | "part" | "replaced">,
  ): void => {
    const start = placed.length;
    placed.push({ ...at, document, end: start + 1, start });

    const { path } = document.listed;
    if (!chain.includes(path)) {
      const { rows } = document.listed;
      for (const { site, target } of (input.placements.get(path) ?? []).toSorted((left, right) =>
        Number(left.site - right.site),
      )) {
        const child = byPath.get(target);
        const node = rows.byStart.get(site);
        if (child !== undefined && node !== undefined) {
          place(child, [...chain, path], {
            from: Option.some({ parent: start, site: node }),
            part: start === 0 ? partOf(document, node) : at.part,
            replaced: at.replaced || underReplacement(document, node),
          });
        }
      }
    }

    placed[start] = { ...at, document, end: placed.length, start };
  };
  place(root, [], { from: Option.none(), part: Option.none(), replaced: false });

  return placed;
};

/**
 * Every test of a package, each with its assembly.
 *
 * @param input - The package.
 * @param byPath - The package's documents, by path.
 * @returns Each test document and its instances.
 */
export const testsOf = (
  input: PackageRows,
  byPath: ReadonlyMap<string, AssembledDocument>,
): readonly { readonly instances: readonly Instance[]; readonly test: AssembledDocument }[] =>
  [...byPath.values()]
    .filter(({ rootKind }) => rootKind === testKinds.test)
    .map((test) => ({ instances: assemblyOf(input, byPath, test), test }));

/**
 * Whether an instance's content is its assembly root's own as the oracle judges it: it is the
 * root, or every site on its chain to the root splices its target in place, so its document is
 * judged within the root's merged document.
 *
 * @param instances - The assembly.
 * @param instance - The instance.
 * @returns Whether it is.
 */
export const inRootCopy = (instances: readonly Instance[], instance: Instance): boolean =>
  Option.match(instance.from, {
    onNone: () => true,
    onSome: ({ parent, site }) => {
      const above = instances[parent];

      return (
        site.kind === testKinds.include &&
        site.parentKind !== testKinds.section &&
        above !== undefined &&
        inRootCopy(instances, above)
      );
    },
  });

/**
 * The anchor of each instance of an assembly (`instanceAnchors`): itself where it is the root or a
 * section ref places it, and else its parent's, an include splicing its target into its parent's
 * copy (spec readings 85 and 86). A test "may refer to the same section multiple times within a
 * test" (information model §7.5.3), each reference the facade of its section (§7.5), so the
 * instances below one anchor are one copy's.
 *
 * @param instances - The assembly, in pre-order.
 * @returns Each instance's anchor's place, by the instance's place.
 */
export const anchorsOf = (instances: readonly Instance[]): readonly number[] => {
  const anchors: number[] = [];
  for (const { from, start } of instances) {
    anchors.push(
      Option.match(from, {
        onNone: () => start,
        onSome: ({ parent, site }) =>
          site.kind === testKinds.sectionRef ? start : (anchors[parent] ?? parent),
      }),
    );
  }

  return anchors;
};

/**
 * The test part of an element of an instance's document in its assembly: an element of the test
 * document lies in the part whose interval holds it, and an element of a document an instance
 * places lies in that instance's part.
 *
 * @param instance - The instance.
 * @param node - The element.
 * @returns The part's `start` in the test document, none where no part holds it.
 */
export const placedPartOf = (instance: Instance, node: Row): Option.Option<bigint> =>
  Option.isNone(instance.from) ? partOf(instance.document, node) : instance.part;

/**
 * Whether an element of an instance's document is an item ref a selection with replacement can
 * repeat in that placement: a replacing section of its own document holds it, or its instance is
 * so repeated.
 *
 * @param instance - The instance.
 * @param node - The element.
 * @returns Whether it is.
 */
export const replaceableIn = (instance: Instance, node: Row): boolean =>
  node.kind === testKinds.itemRef &&
  (instance.replaced || underReplacement(instance.document, node));

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
      for (const lexical of Option.toArray(valueOf(manifest, node.start, "href"))) {
        const { path } = resolvedAt(manifest, node.start, lexical);
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
 * to judge. An href that resolves outside the package names nothing to judge: it is stored as
 * written and never fetched, as a stimulus ref's is (SV-LAW-02).
 *
 * @param input - The package.
 * @param referrer - The document that holds the item ref.
 * @param itemRef - The item ref's node.
 * @returns Its path and type, none where it writes no href, its href resolves outside the package
 *   or its target's type is unread.
 */
export const itemRefTargetOf = (
  input: PackageRows,
  referrer: ListedRows,
  itemRef: Row,
): Option.Option<{ readonly path: string; readonly type: Option.Option<string> }> =>
  valueOf(referrer.rows, itemRef.start, "href").pipe(
    Option.map((lexical) => resolvedAt(referrer.rows, itemRef.start, lexical)),
    Option.filter(({ resolution }) => resolution.scope !== "external"),
    Option.flatMap(({ path }) => {
      const held = resourceTypesByPath(input.manifest).get(path) ?? [];
      const types = held.flatMap((type) => Option.toArray(type));
      const named = types.find((type) => type === itemResourceType) ?? types.find(isLinkType);

      return named === undefined && types.length < held.length
        ? Option.none()
        : Option.some({ path, type: Option.fromNullishOr(named ?? types.at(0)) });
    }),
  );

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
