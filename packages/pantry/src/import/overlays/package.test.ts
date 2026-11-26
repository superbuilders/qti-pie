/* oxlint-disable unicorn/text-encoding-identifier-case -- The generated documents carry the charset label crust's reader reports, `UTF-8`. */
/**
 * The manifest's overlay rows and each document's reference rows against a second reading of the
 * same tree: a direct walk of the XDM document, numbering its nodes in document order as the tree's
 * rows are numbered, collecting each overlay's row from its element and attributes, and resolving
 * each href by the law oracle's own RFC 3986 resolver (`#pantry/test/resolution.ts`) with the
 * `xml:base` values the walk meets on its way down. The walk shares no code with the builder,
 * which reads the tree's flat rows (`flatten`) and resolves by `resolveIn`.
 */
import { regex } from "arkregex";
import * as NodeChildProcessSpawner from "@effect/platform-node/NodeChildProcessSpawner";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { assert, describe, it, layer } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import { array, element, oneOf } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Layer, Option } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import {
  documentTypes,
  GoverningOf,
  grammar,
  interactionKinds,
  ReferenceAttribute,
  ResourceTypeLexical,
} from "#pantry/grammar/install.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import {
  namedDocuments,
  referenceCensus,
  referencePiecesOf,
  referenceRowsOf,
  resourceTypesOf,
  rowsOf,
  typedPathsOf,
} from "#pantry/import/overlays/package.ts";
import { attributeValueOf, valueReadingOf } from "#pantry/import/names.ts";
import type {
  ManifestIds,
  PackageRows,
  ReferenceCensus,
  ReferenceRows,
} from "#pantry/import/overlays/package.ts";
import type { Place } from "#pantry/qti/schema.ts";
import type { WhiteSpaceClass } from "#pantry/grammar/domains.ts";
import { textReferenceKinds } from "#pantry/grammar/references.ts";
import type { ReferenceForm } from "#pantry/grammar/references.ts";
import { hrefPiecesOf, srcsetCandidatesOf } from "#pantry/import/pieces.ts";
import { shredGrammarOf } from "#pantry/model/composed.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { shred } from "#pantry/model/shred.ts";
import { closedName, documentFamily, flatten } from "#pantry/model/xdm.ts";
import type { ClosedName, XdmChild, XdmClosedElement, XdmDocument } from "#pantry/model/xdm.ts";
import { readEntries } from "#pantry/package/read.ts";
import { materialize, materializePackage } from "#pantry/test/fixtures.ts";
import type { FixtureName, NamedPackage } from "#pantry/test/fixtures.ts";
import { hrefParamsPattern, hrefPathPattern } from "#pantry/qti/package.ts";
import {
  comparedPath,
  oracleSrcsetOf,
  oracleValueOf,
  resolve,
  resolveAttribute,
} from "#pantry/test/resolution.ts";
import type { OracleResolution, OracleWhiteSpace } from "#pantry/test/resolution.ts";
import {
  attributeDeclarations,
  globalAttributes,
  textTypes,
} from "#pantry/vocab/inventory/attributes.ts";
import { boxHolds } from "#pantry/test/box.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";
import { flatDocumentOf, ownViewOf } from "#pantry/import/fold.ts";
import { searchWidth } from "#pantry/test/settings.ts";

/**
 * The file system and processes the fixtures' materializer and `readEntries` need.
 */
const TestLayer = NodeChildProcessSpawner.layer.pipe(
  Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
);

/**
 * The package every case writes its rows under, by its manifest identifier; each node is named by
 * its position in document order.
 */
const ids: ManifestIds = { package: "MANIFEST-1" };

/**
 * The text of a manifest node's key, as the builder keys a node's row: the package, the manifest's
 * path and the node's position.
 *
 * @param start - The node's position.
 * @returns The key text.
 */
const nodeKey = (start: bigint): string => keyTextOf(ids.package, manifestPath, start);

/**
 * One overlay row as the walk expects it: its relation and its fields, and the rows of the two
 * queries over them no relation stores, the typed paths (`typedPathsOf`, over the host's type
 * codes, `resourceTypesOf`) and the unread-type hrefs ({@link unreadTypeHrefsOf}), each by the
 * resource's node.
 */
type Expected = {
  readonly [Relation in keyof PackageRows | "TypedPath" | "UnreadTypeHref"]: Map<string, object>;
};

/**
 * The lexical forms of a resource's `type` that spell a `ResourceType` handle, each as written
 * (`ResourceTypeLexical`).
 */
const spelledTypes: ReadonlySet<string> = new Set(
  ResourceTypeLexical.rows.map(({ lexical }) => lexical),
);

/**
 * Resolve a manifest href as the oracle does (readings `href-resolution` and `file-references`):
 * its value collapsed as an `xs:anyURI`, against the manifest's path and the `xml:base` values in
 * scope.
 *
 * @param href - The href, as written.
 * @param bases - The `xml:base` values in scope, outermost first.
 * @returns Its scope and the path it is compared by: the entry path it resolves to in the package,
 *   else its path as written.
 */
const manifestHrefOf = (href: string, bases: readonly string[]) => {
  const value = oracleValueOf(href, "collapse");
  const resolution = resolve({ bases, document: manifestPath, value });

  return { scope: resolution.scope, target: comparedPath(resolution, value) };
};

/**
 * Expect an href's arm, the row its scope names beside its header: the entry path it resolves to
 * for an href in the package, its path as written for one outside it, and none for a
 * same-document or an unresolved one.
 *
 * @param arms - The arms' expected rows: the entry arm's and the outside arm's.
 * @param arms.entry - The entry arm's.
 * @param arms.outside - The outside arm's.
 * @param row - The href's place, its scope and the path it is compared by.
 * @param row.scope - Its scope.
 * @param row.start - Its node's position.
 * @param row.target - The path it is compared by.
 */
const expectArm = (
  arms: { readonly entry: Map<string, object>; readonly outside: Map<string, object> },
  row: {
    readonly package: string;
    readonly path: string;
    readonly scope: string;
    readonly start: bigint;
    readonly target: string;
  },
): void => {
  const { scope, start, target } = row;
  const at = { package: row.package, path: row.path, start };
  if (scope === "entry") {
    arms.entry.set(nodeKey(start), { ...at, target });
  }

  if (scope === "external") {
    arms.outside.set(nodeKey(start), { ...at, target });
  }
};

/**
 * Expect a resource's `href` rows: its `ResourceHref`, resolved by the oracle, and its arm
 * ({@link expectArm}); where its href names an entry, and its type spells a handle, its typed path,
 * of the entry path and type; and where it names an entry and its type is written and spells none,
 * its unread-type href, of the entry path.
 *
 * @param expected - The walk's rows so far.
 * @param resource - The resource's href, node, package, type and its lexical form, and the bases
 *   in scope.
 * @param resource.bases - The `xml:base` values in scope, its own last.
 * @param resource.href - Its href.
 * @param resource.pkg - Its package.
 * @param resource.start - Its node's position.
 * @param resource.type - The handle its type spells, none where it spells none.
 * @param resource.typeLexical - Its type as written, none where unwritten.
 */
const expectHref = (
  expected: Expected,
  resource: {
    readonly bases: readonly string[];
    readonly href: string;
    readonly pkg: string;
    readonly start: bigint;
    readonly type: Option.Option<string>;
    readonly typeLexical: string | undefined;
  },
): void => {
  const { bases, href, pkg, start, type, typeLexical } = resource;
  const { scope, target } = manifestHrefOf(href, bases);
  const at = { package: pkg, path: manifestPath, start };
  expected.ResourceHref.set(nodeKey(start), { ...at, scope });
  expectArm(
    { entry: expected.ResourceHrefPath, outside: expected.ResourceHrefOutside },
    { ...at, scope, target },
  );
  if (scope !== "entry") {
    return;
  }

  for (const code of Option.toArray(type)) {
    expected.TypedPath.set(nodeKey(start), { ...at, target, type: code });
  }

  if (Option.isNone(type) && typeLexical !== undefined && typeLexical !== "") {
    expected.UnreadTypeHref.set(nodeKey(start), { ...at, target });
  }
};

/**
 * Expect a resource's rows: its href's rows where it writes one ({@link expectHref}), typed where
 * its type spells a handle.
 *
 * @param expected - The walk's rows so far.
 * @param resource - The resource's row, its href and its type if written, the bases in scope and
 *   the spelled types.
 * @param resource.bases - The `xml:base` values in scope, its own last.
 * @param resource.href - Its href, none where unwritten.
 * @param resource.row - Its `Resource` row.
 * @param resource.spelled - The lexical forms a handle spells.
 * @param resource.typeLexical - Its type as written, none where unwritten.
 */
const expectResource = (
  expected: Expected,
  resource: {
    readonly bases: readonly string[];
    readonly href: string | undefined;
    readonly row: { readonly package: string; readonly start: bigint };
    readonly spelled: ReadonlySet<string>;
    readonly typeLexical: string | undefined;
  },
): void => {
  const { bases, href, row, spelled, typeLexical } = resource;
  const { package: pkg, start } = row;
  const type =
    typeLexical !== undefined && spelled.has(typeLexical)
      ? Option.some(typeLexical)
      : Option.none();
  if (href !== undefined) {
    expectHref(expected, { bases, href, pkg, start, type, typeLexical });
  }
};

/**
 * Walk a manifest's tree in document order and collect the overlay rows it implies: each
 * `cp:resource`'s and `cp:file`'s href resolved, by its node's place. The identifiers and a
 * dependency's `identifierref` are no row: the database reads each from its attribute.
 *
 * @param doc - The manifest's tree.
 * @returns Every overlay's expected rows.
 */
const walk = (doc: XdmDocument<Composed>): Expected => {
  const expected: Expected = {
    File: new Map(),
    FileOutside: new Map(),
    FilePath: new Map(),
    ResourceHref: new Map(),
    ResourceHrefOutside: new Map(),
    ResourceHrefPath: new Map(),
    TypedPath: new Map(),
    UnreadTypeHref: new Map(),
  };
  const interactions = new Set<string>(interactionKinds);
  let next = 1;
  const visit = (
    child: XdmChild<Composed> | XdmDocument<Composed>["root"],
    parent: {
      readonly bases: readonly string[];
      readonly kind: string;
      readonly nearest: bigint;
      readonly start: bigint;
    },
  ): void => {
    const start = BigInt(next);
    next += 1;
    if (child._tag !== "element" && !("attributes" in child)) {
      return;
    }

    const kind = child._tag === "element" ? child.kind : child._tag;
    const nearest = interactions.has(parent.kind) ? parent.start : parent.nearest;
    const valueOf = (name: string): string | undefined =>
      child.attributes.find(
        (attribute) => attribute.name._tag === "closed" && attribute.name.handle === name,
      )?.lexical;
    const pkg = ids.package;
    const place = { package: pkg, path: manifestPath, start };
    const ownBase = valueOf("xml:base");
    const bases = ownBase === undefined ? parent.bases : [...parent.bases, ownBase];

    if (kind === "cp:resource") {
      expectResource(expected, {
        bases,
        href: valueOf("href"),
        row: place,
        spelled: spelledTypes,
        typeLexical: valueOf("type"),
      });
    }

    const fileHref = kind === "cp:file" ? valueOf("href") : undefined;
    if (fileHref !== undefined) {
      const { scope, target } = manifestHrefOf(fileHref, bases);
      expected.File.set(nodeKey(start), { ...place, scope });
      expectArm(
        { entry: expected.FilePath, outside: expected.FileOutside },
        { ...place, scope, target },
      );
    }

    for (const grandchild of child.children) {
      visit(grandchild, { bases, kind, nearest, start });
    }
  };

  for (const child of documentFamily(doc)) {
    if (child._tag === "element") {
      visit(child, { bases: [], kind: "document", nearest: 0n, start: 0n });
    } else {
      next += 1;
    }
  }

  return expected;
};

/**
 * The overlay relations the builder writes rows of.
 */
const relationNames = [
  "File",
  "FileOutside",
  "FilePath",
  "ResourceHref",
  "ResourceHrefOutside",
  "ResourceHrefPath",
] as const satisfies readonly (keyof PackageRows)[];

/**
 * List a keyed set's entries in key order, so two sets compare as sets.
 *
 * @param map - The keyed set.
 * @returns Its entries, sorted by key.
 */
const sortedEntries = (map: ReadonlyMap<string, object>): readonly (readonly [string, object])[] =>
  [...map].toSorted(([left], [right]) => left.localeCompare(right));

/**
 * A row of the query `UnreadTypeHref`: a resource's node, its package, the path of the manifest
 * that holds it, and the entry path its href names.
 */
interface UnreadTypeHrefRow {
  readonly package: string;
  readonly path: string;
  readonly start: bigint;
  readonly target: string;
}

/**
 * The rows of the query `UnreadTypeHref` (`#pantry/qti/queries.ts`) over a manifest, restated on
 * the host: each resource's `ResourceHrefPath` beside its `type` attribute as the tree's rows hold
 * it, where that form is nonempty and spells no `ResourceType` handle ({@link spelledTypes}), as
 * its node's key and the entry path its href names, by the node. Only the database evaluates the
 * query, which "Item ref target" reads by (package, target); this reads the rows the query reads,
 * the builder's and the tree's, so a builder that loses an unread-type resource's href fails here.
 *
 * @param doc - The manifest's tree.
 * @param rows - The builder's rows of it.
 * @returns The query's rows, by the resource's node.
 */
const unreadTypeHrefsOf = (
  doc: XdmDocument<Composed>,
  rows: Pick<PackageRows, "ResourceHrefPath">,
): ReadonlyMap<string, UnreadTypeHrefRow> => {
  const flat = flatten(doc);
  const resources = new Set<bigint>(
    flat.nodes.flatMap(({ kind, start }) => (kind === "cp:resource" ? [start] : [])),
  );
  const types = new Map<bigint, string>(
    flat.attributes.flatMap(({ lexical, name, start }) =>
      name === "type" && resources.has(start) ? [[start, lexical] as const] : [],
    ),
  );

  return new Map(
    [...rows.ResourceHrefPath.values()].flatMap(({ package: pkg, path, start, target }) =>
      Option.toArray(Option.fromUndefinedOr(types.get(start)))
        .filter((lexical) => lexical !== "" && !spelledTypes.has(lexical))
        .map(() => [nodeKey(start), { package: pkg, path, start, target }] as const),
    ),
  );
};

/**
 * Compare the builder's keyed sets with the walk's: every relation's keys and rows alike, and the
 * rows of the queries over them the host reads or restates, the typed paths (`typedPathsOf`) and
 * the unread-type hrefs ({@link unreadTypeHrefsOf}), by the resource's node.
 *
 * @param doc - The manifest's tree.
 * @param rows - The builder's rows of it.
 * @param expected - The walk's.
 * @param label - The case, for a failure's message.
 */
const assertRows = (
  doc: XdmDocument<Composed>,
  rows: PackageRows,
  expected: Expected,
  label: string,
): void => {
  for (const relation of relationNames) {
    assert.deepStrictEqual(
      sortedEntries(rows[relation]),
      sortedEntries(expected[relation]),
      `${label} ${relation}`,
    );
  }

  assert.deepStrictEqual(
    sortedEntries(
      new Map(
        typedPathsOf(rows, resourceTypesOf(flatDocumentOf(doc))).map(
          (typed) => [nodeKey(typed.start), typed] as const,
        ),
      ),
    ),
    sortedEntries(expected.TypedPath),
    `${label} TypedPath`,
  );
  assert.deepStrictEqual(
    sortedEntries(unreadTypeHrefsOf(doc, rows)),
    sortedEntries(expected.UnreadTypeHref),
    `${label} UnreadTypeHref`,
  );
};

/**
 * Build one generated manifest: a `cp:resources` of resources, each with an identifier, a type, an
 * optional href, its files and its dependencies.
 */
interface ManifestCase {
  readonly manifestBase: string | undefined;
  readonly manifestIdentifier: string | undefined;
  readonly resources: readonly {
    readonly base: string | undefined;
    readonly dependencies: readonly string[];
    readonly files: readonly string[];
    readonly href: string | undefined;
    readonly identifier: string | undefined;
    readonly type: string | undefined;
  }[];
  readonly resourcesBase: string | undefined;
}

/**
 * Read the identifier a generated resource writes: `own` is its own `r<n>`, any other drawn value
 * is written as drawn, and none is written for none.
 *
 * @param identifier - The drawn identifier.
 * @param at - The resource's place among its siblings.
 * @returns The identifier it writes, none where it writes none.
 */
const identifierAt = (identifier: string | undefined, at: number): string | undefined =>
  identifier === "own" ? `r${String(at)}` : identifier;

/**
 * The `xml:base` values a manifest case draws for its `cp:manifest`, its `cp:resources` and each
 * `cp:resource` (IMS Content Packaging 1.2, §6.11.1): none, a directory, one that climbs, an
 * external one, and one under a stated limit.
 */
const manifestBases = [undefined, "b/", "../b/", "http://x.org/", "a%zz/"] as const;

/**
 * The generated manifests: up to three resources, each of a document type, a type no document has
 * and a type no handle spells (named variant `unknown-type`), with or without an href (`no-href`),
 * an href with launch parameters or a fragment among them (`href-params`, reading
 * `href-resolution`), listing up to three files drawn from two hrefs, so a file listed twice
 * (`file-twice`) and a file two resources list (`shared-file`) are drawn, and up to two
 * dependencies, a resource's own identifier among them (`self-dependency`). A manifest has its
 * identifier or none, each resource its own identifier, another's, the manifest's or none, and its
 * href one of 9 or none (3 with a query or a fragment, 4 that need resolving), listing up to 3 of 5
 * files, under 5 xml:base values on each of the manifest, its resources and each resource.
 */
const manifests: Gen<ManifestCase> = (source) => ({
  manifestBase: source.draw(element(manifestBases)),
  manifestIdentifier: source.draw(element(["m", undefined] as const)),
  resources: source.draw(
    array(
      (inner) => ({
        base: inner.draw(element(manifestBases)),
        dependencies: inner.draw(array(element(["r0", "r1", "m"] as const), { max: 2, min: 0 })),
        files: inner.draw(
          array(element(["a.xml", "b/c.png", "b/c%20d.png", "b/c d.png", "./a.xml"] as const), {
            max: 3,
            min: 0,
          }),
        ),
        href: inner.draw(
          element([
            "a.xml",
            "b/c.png",
            "a.xml?x=1&y=2",
            "b/c.png#top",
            "?q",
            undefined,
            "b/../a.xml",
            "b/c d.png",
            "b%2Fc.png",
            "http://x.org/a.xml",
          ] as const),
        ),
        identifier: inner.draw(element(["own", "r0", "m", undefined] as const)),
        type: inner.draw(
          element(["imsqti_item_xmlv3p0", "webcontent", "bogus", undefined] as const),
        ),
      }),
      { max: 3, min: 0 },
    ),
  ),
  resourcesBase: source.draw(element(manifestBases)),
});

/**
 * A situation a generated manifest reaches, each a named variant the builder must hold.
 */
type Situation =
  | "file-twice"
  | "href-params"
  | "href-resolved"
  | "manifest-base"
  | "manifest-id-clash"
  | "no-href"
  | "resource-base"
  | "self-dependency"
  | "shared-file"
  | "unknown-type"
  | "unnamed-manifest"
  | "unnamed-resource"
  | "untyped";

/**
 * Name the situations one generated manifest reaches.
 *
 * @param input - The manifest.
 * @returns Its situations.
 */
const situationsOf = (input: ManifestCase): readonly Situation[] => {
  const files = input.resources.flatMap(({ files: listed }) => listed);
  const identifiers = new Set(
    input.resources.map(({ identifier }, at) => identifierAt(identifier, at)),
  );

  const reached: [Situation, boolean][] = [
    ["no-href", input.resources.some(({ href }) => href === undefined)],
    ["unknown-type", input.resources.some(({ type }) => type === "bogus")],
    ["untyped", input.resources.some(({ type }) => type === undefined)],
    ["unnamed-manifest", input.manifestIdentifier === undefined],
    ["unnamed-resource", identifiers.has(undefined)],
    [
      "manifest-id-clash",
      input.manifestIdentifier !== undefined && identifiers.has(input.manifestIdentifier),
    ],
    [
      "file-twice",
      input.resources.some(({ files: listed }) => new Set(listed).size < listed.length),
    ],
    ["shared-file", new Set(files).size < files.length],
    [
      "href-params",
      input.resources.some(({ href }) => href !== undefined && regex("[?#]", "u").test(href)),
    ],
    [
      "self-dependency",
      input.resources.some(
        ({ dependencies, identifier }, at) =>
          identifier !== undefined && dependencies.includes(identifierAt(identifier, at) ?? ""),
      ),
    ],
    [
      "href-resolved",
      input.resources.some(({ files: listed, href }) =>
        [href ?? "", ...listed].some((value) => regex("\\./|%| ", "u").test(value)),
      ),
    ],
    ["manifest-base", input.manifestBase !== undefined || input.resourcesBase !== undefined],
    ["resource-base", input.resources.some(({ base }) => base !== undefined)],
  ];

  return reached.flatMap(([situation, holds]) => (holds ? [situation] : []));
};

/**
 * An element of the manifest vocabulary with closed attributes.
 *
 * @param kind - Its kind.
 * @param attributes - Its attributes' names and lexical forms, in order.
 * @param children - Its children.
 * @returns The element.
 */
const elementOf = (
  kind: XdmClosedElement<Composed>["kind"],
  attributes: readonly (readonly [ClosedName<Composed>, string])[],
  children: readonly XdmChild<Composed>[],
): XdmClosedElement<Composed> => ({
  _tag: "element",
  attributes: attributes.map(([handle, lexical]) => ({
    lexical,
    name: closedName(handle),
    references: [],
  })),
  children,
  governs: Option.none(),
  kind,
  namespaces: [],
  prefix: "",
});

/**
 * Write an `xml:base` as an element's attribute, none for none.
 *
 * @param base - The base.
 * @returns The attribute list.
 */
const baseAttribute = (base: string | undefined) =>
  base === undefined ? [] : [["xml:base", base] as const];

/**
 * Write an attribute that may be unwritten as an element's attribute list.
 *
 * @param name - Its name.
 * @param value - Its lexical form, none where it is unwritten.
 * @returns The list: the attribute, or nothing.
 */
const attributeIf = (name: "href" | "identifier" | "type", value: string | undefined) =>
  value === undefined ? [] : [[name, value] as const];

/**
 * Write a generated manifest as the tree shred would give: a `cp:manifest`, of identifier `m` or
 * none, holding its `cp:resources`, each resource with the identifier and type it draws, if any,
 * its files and its dependencies, whitespace between them so character data shares the numbering.
 *
 * @param input - The manifest.
 * @returns The tree.
 */
const treeOf = (input: ManifestCase): XdmDocument<Composed> => {
  const ws: XdmChild<Composed> = { _tag: "ws", value: "\n" };
  const resources = input.resources.map(
    ({ base, dependencies, files, href, identifier, type }, at) =>
      elementOf(
        "cp:resource",
        [
          ...attributeIf("identifier", identifierAt(identifier, at)),
          ...attributeIf("type", type),
          ...attributeIf("href", href),
          ...baseAttribute(base),
        ],
        [
          ...files.flatMap((file) => [ws, elementOf("cp:file", [["href", file]], [])]),
          ...dependencies.map((ref) => elementOf("cp:dependency", [["identifierref", ref]], [])),
        ],
      ),
  );

  return {
    _tag: "document",
    charset: "UTF-8",
    declaration: Option.none(),
    epilog: [],
    exportCharset: "UTF-8",
    prolog: [{ _tag: "comment", value: " manifest " }],
    root: elementOf(
      "cp:manifest",
      [
        ...attributeIf("identifier", input.manifestIdentifier),
        ...baseAttribute(input.manifestBase),
      ],
      [ws, elementOf("cp:resources", baseAttribute(input.resourcesBase), resources)],
    ),
  };
};

/**
 * The fixtures whose manifests the builder is checked over: the accepted packages and those whose
 * manifests carry the cases a law reads: an unknown resource type, external metadata, an outcome
 * declaration, a response-processing template, files listed as bytes, LTI links.
 */
const fixtures = [
  "simple",
  "sharedMedia",
  "extmeta",
  "extmeta-hrefless",
  "outcome",
  "resproc",
  "resproc-webcontent",
  "bytes",
  "bytes-webcontent-item",
  "lti-link",
  "lti-basic",
] as const satisfies readonly FixtureName[];

/**
 * The published packages read beside the fixtures: an unknown resource type (`lti`), a LOM record
 * (`metaData`) and usage data (`usageData`).
 */
const packages = ["lti", "metaData", "usageData"] as const satisfies readonly NamedPackage[];

/**
 * Build a manifest of resources, each its own identifier, its href listed as its one file and the
 * type it writes, if any, and read the unread-type hrefs of the builder's rows
 * ({@link unreadTypeHrefsOf}): the query `UnreadTypeHref` (`#pantry/qti/queries.ts`) restated over
 * the rows it reads, the builder's `ResourceHrefPath` and the tree's `type` attribute.
 *
 * @param resources - Each resource's href and type, none where it writes no type.
 * @returns The target of each unread-type href, in document order; the targets those name, once
 *   each, the one package's (package, target) pairs "Item ref target" reads; and the target of each
 *   typed href.
 */
const unreadOf = (
  resources: readonly { readonly href: string; readonly type: string | undefined }[],
) => {
  const doc = treeOf({
    manifestBase: undefined,
    manifestIdentifier: "m",
    resources: resources.map(({ href, type }) => ({
      base: undefined,
      dependencies: [],
      files: [href],
      href,
      identifier: "own",
      type,
    })),
    resourcesBase: undefined,
  });
  const rows = rowsOf(ownViewOf(doc), ids);
  const unread = [...unreadTypeHrefsOf(doc, rows).values()];

  return {
    hrefs: unread.map(({ target }) => target),
    paths: [...new Set(unread.map(({ target }) => target))],
    typed: typedPathsOf(rows, resourceTypesOf(flatDocumentOf(doc))).map(({ target }) => target),
  };
};

describe("import/overlays/package.ts", () => {
  it.effect("writes each overlay's rows as the walk of the manifest's tree names them", (ctx) =>
    searched(
      ctx,
      explore(
        {
          caseHang: Duration.seconds(10),
          coverage: required<Situation>(
            [
              "no-href",
              "unknown-type",
              "file-twice",
              "shared-file",
              "href-params",
              "self-dependency",
              "href-resolved",
              "manifest-base",
              "resource-base",
              "untyped",
              "unnamed-manifest",
              "unnamed-resource",
              "manifest-id-clash",
            ],
            { cases: 200, sense: notesOnly },
          ),
          draw: drawn(manifests),
          kept: [],
          literal: Formatter.format,
          oracle: {
            kind: "second-implementation",
            name: "a direct walk of the XDM document that numbers its nodes in document order and reads each element's attributes, against the builder's read of the tree's flat rows, its hrefs by the oracle's RFC 3986 resolver; the type codes against ResourceTypeLexical",
          },
          runs: 300,
          shrink: completeShrink,
          steerEvery: 16,
          suite: "pantry/import/overlays-package",
        },
        (input, c) =>
          Effect.sync(() => {
            c.noteAll(situationsOf(input));

            const doc = treeOf(input);
            const rows = rowsOf(ownViewOf(doc), ids);

            assertRows(doc, rows, walk(doc), "generated");
            for (const [at, { type }] of namedDocuments(
              typedPathsOf(rows, resourceTypesOf(flatDocumentOf(doc))),
            )
              .values()
              .map((named) => [named.path, named] as const)) {
              assert.include(documentTypes, type, at);
            }
          }),
      ),
    ),
  );

  it("gives the query UnreadTypeHref a row for a resource whose written type spells no handle, and none for a typed or untyped one", () => {
    assert.deepStrictEqual(
      unreadOf([
        { href: "item.xml", type: "resourceextmetadata/xml " },
        { href: "test.xml", type: "imsqti_test_xmlv3p0" },
      ]),
      { hrefs: ["item.xml"], paths: ["item.xml"], typed: ["test.xml"] },
      "R-O6's manifest (the genetic repair's gr-5a): its first resource's type carries a trailing space, so it spells no handle; the test resource's spells one",
    );
    assert.deepStrictEqual(
      unreadOf([{ href: "item.xml", type: "bogus" }]),
      { hrefs: ["item.xml"], paths: ["item.xml"], typed: [] },
      "a bogus type is unread too",
    );
    assert.deepStrictEqual(
      unreadOf([{ href: "item.xml", type: undefined }]),
      { hrefs: [], paths: [], typed: [] },
      "a resource that writes no type has no row, and AL3 refuses it alone",
    );
    assert.deepStrictEqual(
      unreadOf([
        { href: "item.xml", type: "bogus" },
        { href: "item.xml", type: "bogus" },
      ]),
      { hrefs: ["item.xml", "item.xml"], paths: ["item.xml"], typed: [] },
      'two unread resources of one path are two rows of one (package, target), the pair "Item ref target" reads',
    );
  });
});

layer(TestLayer, { excludeTestServices: true })("import/overlays/package.ts, fixtures", (suite) => {
  suite.effect(
    "writes each fixture manifest's overlay rows as the walk of its tree names them",
    () =>
      Effect.gen(function* fixtureRows() {
        let shredded = 0;
        const read = [
          ...(yield* Effect.all(
            fixtures.map((name) => Effect.map(materialize(name), (dir) => [name, dir] as const)),
          )),
          ...(yield* Effect.all(
            packages.map((name) =>
              Effect.map(materializePackage(name), (dir) => [name, dir] as const),
            ),
          )),
        ];
        for (const [name, dir] of read) {
          const files = yield* readEntries(dir);
          const manifest = files.find(({ kind }) => kind === "manifest");
          assert.isDefined(manifest, name);

          const xml = yield* readXml(manifest.bytes);
          const tree = yield* Effect.option(shred(xml, shredGrammarOf(grammar)));
          if (Option.isNone(tree)) {
            continue;
          }

          shredded += 1;
          const rows = rowsOf(ownViewOf(tree.value), ids);
          assertRows(
            tree.value,
            rows,
            walk(tree.value),
            `${name}: the direct walk of a real manifest`,
          );
        }

        assert.isAtLeast(shredded, 8, "each fixture's manifest that shreds is walked");
      }),
  );
});

/**
 * The letters the split box draws from: a plain letter, the path's `/` and `:`, the `?` and `#`
 * that start its params, and the whitespace a reference may be surrounded by.
 */
const splitLetters = ["a", "/", ":", "?", "#", " ", "\t"] as const;

/**
 * Every lexical form of at most 4 of {@link splitLetters}: the split box, 2,801 forms.
 */
const lexicals: Gen<string> = (source) =>
  source.draw(array(element(splitLetters), { max: 4, min: 0 })).join("");

/**
 * RFC 3986's own reading of a URI reference (Appendix B): scheme, authority, path, query and
 * fragment, each optional but the path.
 */
const appendixB = regex.as<string, { names: Record<string, string | undefined> }>(
  "^(?<scheme>(?:[^:/?#]+):)?(?<authority>//(?:[^/?#]*))?(?<path>[^?#]*)(?<query>\\?(?:[^#]*))?(?<fragment>#(?:.*))?$",
  "su",
);

/**
 * Split a reference as RFC 3986's Appendix B reads it, after setting aside the XML whitespace
 * around it: a second implementation of `referencePiecesOf`, its target the scheme, authority and
 * path, its params the query and fragment.
 *
 * @param lexical - The lexical form.
 * @returns Its four pieces.
 */
const appendixPieces = (lexical: string) => {
  let first = 0;
  while (first < lexical.length && " \t\n\r".includes(lexical.charAt(first))) {
    first += 1;
  }

  let last = lexical.length;
  while (last > first && " \t\n\r".includes(lexical.charAt(last - 1))) {
    last -= 1;
  }

  const groups = appendixB.exec(lexical.slice(first, last))?.groups ?? {};

  return {
    lead: lexical.slice(0, first),
    params: `${groups["query"] ?? ""}${groups["fragment"] ?? ""}`,
    target: `${groups["scheme"] ?? ""}${groups["authority"] ?? ""}${groups["path"] ?? ""}`,
    trail: lexical.slice(last),
  };
};

/**
 * A situation the split box must reach.
 */
type SplitSituation = "fragment" | "lead" | "plain" | "query" | "trail";

/**
 * The census the reference rows are built over in these cases: four attributes of the grammar's
 * reference census, one of them a srcset, and none for `div@title`, which names no file.
 */
const census: ReferenceCensus = (kind, name) =>
  Option.fromUndefinedOr(
    new Map<string, ReferenceForm>([
      ["a href", "uri"],
      ["img src", "uri"],
      ["source srcset", "srcset"],
      ["video poster", "uri"],
    ]).get(`${kind} ${name}`),
  );

/**
 * The whitespace classes of the census's attributes of the form `uri` in these cases, their types'
 * as the HTML and QTI declarations state them, read apart from the host's `valueReadingOf`:
 * `img@src` and `a@href` are `xs:anyURI`s, `video@poster` a `URLDType`.
 */
const uriClasses: ReadonlyMap<string, WhiteSpaceClass> = new Map<string, WhiteSpaceClass>([
  ["a href", "collapse"],
  ["img src", "collapse"],
  ["video poster", "replace"],
]);

/**
 * The elements a generated document holds, each with the one attribute it carries.
 */
const carriers = [
  ["img", "src"],
  ["a", "href"],
  ["source", "srcset"],
  ["video", "poster"],
  ["div", "title"],
] as const;

/**
 * The values a generated reference takes: a plain path at the root and below, a leading `../` and
 * `./`, a dot segment after a plain one, a climb past the root, an external URI, a same-document
 * fragment, a padded path, a media fragment, a descriptor, a comma inside a path (one candidate
 * of a `srcset`, whose URL runs to the next whitespace), two candidates, an empty value, a space
 * and its percent-encoding, an encoded `/`, an encoded `..`, a stray `%` and a backslash.
 */
const referenceValues = [
  "a.png",
  "img/b.png",
  "../c.png",
  "./d.png",
  "a/../b.png",
  "../../../e.png",
  "http://x.org/d.png",
  "#top",
  " e.png ",
  "f.mp4#t=1",
  "a.png 2x",
  "a.png,b.png",
  "a.png, b.png",
  "",
  "my sign.png",
  "my%20sign.png",
  "a%2Fb.png",
  "%2E%2E/c.png",
  "a%zz.png",
  "a\\b.png",
] as const;

/**
 * The `xml:base` values a generated document draws for its root and for each element: none, a
 * directory, one that climbs, an external one, and one under a stated limit.
 */
const referenceBases = [undefined, "x/", "../", "http://h.org/", "x%zz/"] as const;

/**
 * One generated document: its path, its root's `xml:base`, and its elements, each with its own.
 */
interface ReferenceCase {
  readonly base: string | undefined;
  readonly elements: readonly {
    readonly base: string | undefined;
    readonly carrier: (typeof carriers)[number];
    readonly value: string;
  }[];
  readonly path: string;
}

/**
 * The generated documents: at the root or below it, with or without an `xml:base` on the root and
 * on each element, holding up to four elements of {@link carriers} with values of
 * {@link referenceValues}: 2 paths, 5 xml:base values, 5 kinds and 20 values.
 */
const referenceCases: Gen<ReferenceCase> = (source) => ({
  base: source.draw(element(referenceBases)),
  elements: source.draw(
    array(
      (inner) => ({
        base: inner.draw(element(referenceBases)),
        carrier: inner.draw(element(carriers)),
        value: inner.draw(element(referenceValues)),
      }),
      { max: 4, min: 0 },
    ),
  ),
  path: source.draw(element(["item.xml", "items/item.xml"] as const)),
});

/**
 * Write a generated document as shred would give it: a `qti-assessment-item` holding its elements,
 * whitespace before each so character data shares the numbering.
 *
 * @param input - The document.
 * @returns The tree.
 */
const referenceTreeOf = (input: ReferenceCase): XdmDocument<Composed> => ({
  _tag: "document",
  charset: "UTF-8",
  declaration: Option.none(),
  epilog: [],
  exportCharset: "UTF-8",
  prolog: [],
  root: elementOf(
    "qti-assessment-item",
    baseAttribute(input.base),
    input.elements.flatMap(({ base, carrier: [kind, name], value }) => [
      { _tag: "ws", value: "\n" } as const,
      elementOf(kind, [[name, value], ...baseAttribute(base)], []),
    ]),
  ),
});

/**
 * The reference rows a generated document implies, by a second reading: its nodes numbered in
 * document order (the document node 0, its root 1, then each whitespace node and element in turn),
 * each census attribute of the form `uri` split by RFC 3986's Appendix B, and each value resolved
 * as one href by the law oracle's own resolver with the root's and the element's `xml:base`,
 * outermost first. A `srcset` is its image candidates, which have no `Reference` and are held to
 * the HTML Standard's examples apart ("splits a srcset into its image candidates").
 *
 * @param input - The document.
 * @param documentIds - Its package and path; its nodes are named by their numbers.
 * @returns Its expected rows.
 */
const expectedReferences = (input: ReferenceCase, documentIds: Place) => {
  const at = { package: documentIds.package, path: documentIds.path };
  const references = new Map<string, object>();
  const paths = new Map<string, object>();
  for (const [index, { base, carrier, value }] of input.elements.entries()) {
    const [kind, name] = carrier;
    const start = BigInt(3 + 2 * index);
    for (const whiteSpace of Option.toArray(
      Option.fromUndefinedOr(uriClasses.get(`${kind} ${name}`)),
    )) {
      const resolution = resolve({
        bases: [input.base, base].flatMap((written) => (written === undefined ? [] : [written])),
        document: documentIds.path,
        value: oracleValueOf(value, whiteSpace),
      });
      const key = keyTextOf(at.package, at.path, start, name);
      references.set(key, {
        ...at,
        kind,
        name,
        scope: resolution.scope,
        start,
        ...appendixPieces(value),
      });
      if (resolution.scope === "entry") {
        paths.set(key, { ...at, kind, name, start, target: resolution.path });
      }
    }
  }

  return { Reference: references, ReferencePath: paths };
};

/**
 * A situation the reference rows' search must reach: each scope, each kind of value, an `xml:base`
 * in scope of a resolved reference, a `srcset`, and one of several image candidates resolved in the
 * package.
 */
type ReferenceSituation =
  | "base beside a reference"
  | "decoded"
  | "external"
  | "not in the census"
  | "padded"
  | "params"
  | "resolved"
  | "same document"
  | "srcset"
  | "srcset of candidates resolved"
  | "unresolved";

/**
 * Name the situations one generated document reaches.
 *
 * @param input - The document.
 * @param rows - Its rows, as the builder writes them.
 * @returns Its situations.
 */
const referenceSituationsOf = (
  input: ReferenceCase,
  rows: ReferenceRows,
): readonly ReferenceSituation[] => {
  const references = [...rows.Reference.values()];
  const based = input.base !== undefined || input.elements.some(({ base }) => base !== undefined);
  const reached: [ReferenceSituation, boolean][] = [
    ["resolved", rows.ReferencePath.size > 0],
    ["base beside a reference", based && rows.ReferencePath.size > 0],
    ["external", references.some(({ scope }) => scope === "external")],
    ["same document", references.some(({ scope }) => scope === "document")],
    ["unresolved", references.some(({ scope }) => scope === "unresolved")],
    ["decoded", [...rows.ReferencePath.values()].some(({ target }) => target.includes(" "))],
    ["padded", references.some(({ lead, trail }) => lead !== "" || trail !== "")],
    ["params", references.some(({ params }) => params !== "")],
    ["srcset", rows.Srcset.size > 0],
    [
      "srcset of candidates resolved",
      [...rows.Srcset.values()].some(({ tokens }) => tokens.length > 1) &&
        rows.CandidatePath.size > 0,
    ],
    ["not in the census", input.elements.some(({ carrier: [kind] }) => kind === "div")],
  ];

  return reached.flatMap(([situation, holds]) => (holds ? [situation] : []));
};

/**
 * Read an attribute's whitespace class from the inventory by a second walk: its declared type's,
 * none for an undeclared attribute or one whose type is a union, whose class is its holding
 * member's.
 *
 * @param kind - The element's kind.
 * @param name - The attribute's name.
 * @returns The class.
 */
const declaredWhiteSpace = (kind: string, name: string): Option.Option<WhiteSpaceClass> =>
  Option.flatMap(
    Option.fromUndefinedOr(
      attributeDeclarations.find((declared) => declared.kind === kind && declared.name === name),
    ),
    ({ type }) => (type.whiteSpace === "union" ? Option.none() : Option.some(type.whiteSpace)),
  );

/**
 * The kinds of the text census, as the tree's element kinds: a card's file, a calculator's or a
 * digital material's file, and a resource icon. The text-reference box holds them to the census's
 * own roster (textReferenceKinds) before it runs.
 */
const TEXT_KINDS = ["qti-file-href.card", "qti-file-href", "qti-resource-icon"] as const;

/**
 * The pieces a text of the text-reference box is written with: a space, a letter, a slash, a
 * percent-encoded space, a fragment's mark and a parent segment.
 */
const TEXT_PIECES = [" ", "a", "/", "%20", "#", ".."] as const;

/**
 * A text of the text census: its kind, the `xml:base` in scope or none, and its string value.
 */
interface TextReferenceCase {
  readonly base: string | undefined;
  readonly kind: (typeof TEXT_KINDS)[number];
  readonly value: string;
}

/**
 * Draw a text of the text-reference box: a kind of {@link TEXT_KINDS}, no `xml:base` or `x/`, and a
 * value of up to three of {@link TEXT_PIECES}.
 */
const textReferences: Gen<TextReferenceCase> = (source) => ({
  base: source.draw(element([undefined, "x/"] as const)),
  kind: source.draw(element(TEXT_KINDS)),
  value: source.draw(array(element(TEXT_PIECES), { max: 3, min: 0 })).join(""),
});

/**
 * How many texts {@link textReferences} draws: 3 kinds by 2 bases by every value of up to three of
 * the 6 pieces.
 */
const TEXT_REFERENCES = 3 * 2 * (1 + 6 + 6 ** 2 + 6 ** 3);

/**
 * What a text of the box reaches: its value resolved to an entry, to the same document, outside the
 * package or unresolved, or the empty value.
 */
type TextSituation = OracleResolution["scope"] | "empty";

/**
 * The whitespace class of a text census kind's string value: its text's simple type's in the
 * inventory (`xs:anyURI` collapses, `URLDType` replaces).
 *
 * @param kind - The kind.
 * @returns The class.
 */
const textWhiteSpaceOf = (kind: (typeof TEXT_KINDS)[number]): OracleWhiteSpace => {
  const declared = textTypes.find((text) => text.kind === kind)?.type.whiteSpace;

  if (declared === undefined || declared === "union") {
    return assert.fail(`${kind}: the inventory types its text under no one whitespace class`);
  }

  return declared;
};

describe("import/overlays/package.ts, hrefs and references", () => {
  it("reads the grammar's census as ReferenceAttribute's rows hold it, each in its value's whitespace class", () => {
    assert.isNotEmpty(ReferenceAttribute.rows);
    for (const { form, kind, name } of ReferenceAttribute.rows) {
      assert.deepStrictEqual(
        referenceCensus(kind, name),
        Option.some(form),
        `${kind} ${name}: the builder's lookup against the closed relation's own rows (ReferenceAttribute, spec reading \`file-references\`), which the database's copy into Reference selects by`,
      );

      const declared = declaredWhiteSpace(kind, name);
      assert.isTrue(
        Option.isSome(declared),
        `${kind} ${name}: a declared type of one class, as no census attribute's type is a union`,
      );
      for (const whiteSpace of Option.toArray(declared)) {
        assert.deepStrictEqual(
          valueReadingOf(kind, name, "a"),
          { _tag: "admitted", whiteSpace },
          `${kind} ${name}: the reading Attribute.value makes under the kind's own governor (valueReadingOf) against the attribute inventory's declaration, read by a second walk, for its whitespace class`,
        );
      }

      for (const { governor } of GoverningOf.rows.filter((governing) => governing.kind === kind)) {
        assert.strictEqual(
          valueReadingOf(governor, name, "a")._tag,
          "admitted",
          `${kind} ${name} under ${governor}: every governor of a census kind admits its census names (GoverningOf), so the builder never reads a census attribute its governor admits not`,
        );
      }
    }
  });

  it.effect(
    "reads every attribute a kind declares or admits globally as the census's rows hold it: its form where a row names it, none outside the census",
    (ctx) =>
      Effect.gen(function* everyDeclared() {
        const declarations = attributeDeclarations;
        const globals = globalAttributes;

        if (!Arr.isReadonlyArrayNonEmpty(declarations) || !Arr.isReadonlyArrayNonEmpty(globals)) {
          return assert.fail("the inventory declares no attribute on a kind, or no global one");
        }

        const kinds = Arr.dedupe(declarations.map(({ kind }) => kind));

        if (!Arr.isReadonlyArrayNonEmpty(kinds)) {
          return assert.fail("the inventory declares no kind");
        }

        const declared: Gen<readonly [string, string]> = oneOf([
          (source) => {
            const { kind, name } = source.draw(element(declarations));

            return [kind, name] as const;
          },
          (source) => [source.draw(element(kinds)), source.draw(element(globals)).name] as const,
        ]);
        const rows = new Map(
          ReferenceAttribute.rows.map(({ form, kind, name }) => [`${kind} ${name}`, form]),
        );

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "every attribute the inventory declares on its kind, and every global attribute the inventory declares on every kind it declares one on",
              caseHang: Duration.seconds(10),
              concurrency: searchWidth,
              coverage: requiredInSpace<"in the census" | "outside it">([
                "in the census",
                "outside it",
              ]),
              generator: declared,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "the closed relation's own rows (ReferenceAttribute, spec reading `file-references`), which the database's copy into Reference selects by: a declared attribute a row names is read in that row's form, and every other none",
              },
              suite: "import/overlays-package/census",
            },
            ([kind, name], c) =>
              Effect.sync(() => {
                const row = Option.fromUndefinedOr(rows.get(`${kind} ${name}`));

                c.note(Option.isSome(row) ? "in the census" : "outside it");
                assert.deepStrictEqual(referenceCensus(kind, name), row, `${kind} ${name}`);
              }),
          ),
        );
      }),
  );

  it("reads an attribute its governor admits not as written, as Attribute.value keeps it", () => {
    assert.deepStrictEqual(
      valueReadingOf("div", "src", " a.png "),
      { _tag: "unadmitted" },
      "Attribute.value's generated term (#pantry/qti/attributes.ts) finds no domain for div@src, which no governor div has admits",
    );
    assert.strictEqual(
      attributeValueOf("div", "src", " a.png "),
      " a.png ",
      "and keeps the form, which AL1 admission refuses",
    );
    assert.strictEqual(
      attributeValueOf("img", "src", " a.png "),
      "a.png",
      "img@src, an admitted xs:anyURI, is collapsed",
    );
  });

  it.effect(
    "splits every lexical form of the box as RFC 3986's Appendix B does, each piece of its pattern",
    (ctx) =>
      searched(
        ctx,
        exhaust(
          {
            box: "every lexical form of at most 4 of a / : ? # space tab, 2,801",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<SplitSituation>([
              "plain",
              "query",
              "fragment",
              "lead",
              "trail",
            ]),
            generator: lexicals,
            literal: (lexical) => JSON.stringify(lexical),
            oracle: {
              kind: "second-implementation",
              name: "RFC 3986's Appendix B regular expression over the form with its XML whitespace set aside; and the specification as a checker, each piece against the pattern its field's check reads (hrefPathPattern, hrefParamsPattern, XML's S)",
            },
            suite: "import/overlays-package-split",
          },
          (lexical: string, c) =>
            Effect.sync(() => {
              const pieces = referencePiecesOf(lexical);
              const expected = appendixPieces(lexical);
              const core = lexical.slice(
                expected.lead.length,
                lexical.length - expected.trail.length,
              );

              c.note(expected.params.startsWith("?") ? "query" : "plain");
              if (expected.params.startsWith("#")) {
                c.note("fragment");
              }

              if (expected.lead !== "") {
                c.note("lead");
              }

              if (expected.trail !== "") {
                c.note("trail");
              }

              assert.deepStrictEqual(pieces, expected, JSON.stringify(lexical));
              assert.deepStrictEqual(
                hrefPiecesOf(core),
                { params: expected.params, path: expected.target },
                JSON.stringify(core),
              );
              assert.match(pieces.target, regex.as(hrefPathPattern.source, "u"));
              assert.match(pieces.params, regex.as(hrefParamsPattern, "su"));

              const targetEnd = pieces.lead.length + pieces.target.length;
              const paramsEnd = targetEnd + pieces.params.length;

              assert.deepStrictEqual(
                {
                  lead: lexical.slice(0, pieces.lead.length),
                  params: lexical.slice(targetEnd, paramsEnd),
                  target: lexical.slice(pieces.lead.length, targetEnd),
                  trail: lexical.slice(paramsEnd),
                },
                {
                  lead: pieces.lead,
                  params: pieces.params,
                  target: pieces.target,
                  trail: pieces.trail,
                },
                "the pieces are the href's spans, in order",
              );
            }),
        ),
      ),
  );

  it.effect(
    "writes each document's reference rows as a second reading of its tree names them",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.seconds(10),
            coverage: required<ReferenceSituation>(
              [
                "resolved",
                "base beside a reference",
                "decoded",
                "external",
                "same document",
                "unresolved",
                "padded",
                "params",
                "srcset",
                "srcset of candidates resolved",
                "not in the census",
              ],
              { cases: 300, sense: notesOnly },
            ),
            draw: drawn(referenceCases),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "second-implementation",
              name: "a second reading of the tree, expectedReferences: the nodes numbered by hand, each value split by RFC 3986's Appendix B and resolved by the law oracle's own RFC 3986 resolver with the xml:base values in scope",
            },
            runs: 400,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "import/overlays-package-references",
          },
          (input, c) =>
            Effect.sync(() => {
              const documentIds: Place = { ...ids, path: input.path };
              const rows = referenceRowsOf(ownViewOf(referenceTreeOf(input)), documentIds, census);
              const expected = expectedReferences(input, documentIds);

              c.noteAll(referenceSituationsOf(input, rows));
              assert.deepStrictEqual(
                {
                  Reference: sortedEntries(rows.Reference),
                  ReferencePath: sortedEntries(rows.ReferencePath),
                },
                {
                  Reference: sortedEntries(expected.Reference),
                  ReferencePath: sortedEntries(expected.ReferencePath),
                },
                "the document's Reference and ReferencePath rows",
              );
            }),
        ),
      ),
  );

  it.effect(
    `writes a TextReference for each card file, calculator's or digital material's file and resource icon, resolved as an attribute is: ${String(TEXT_REFERENCES)} texts`,
    (ctx) =>
      Effect.andThen(
        Effect.andThen(
          Effect.sync(() => {
            assert.deepStrictEqual(
              new Set(TEXT_KINDS),
              new Set(textReferenceKinds.map(({ kind }) => kind)),
              "the box's kinds are the text census's",
            );
          }),
          boxHolds(textReferences, TEXT_REFERENCES),
        ),
        searched(
          ctx,
          exhaust(
            {
              box: "every kind of the text census (a card's file, a calculator's or a digital material's file, a resource icon), under no xml:base or x/, holding every text of up to 3 of a space, a letter, a slash, %20, # and ..",
              caseHang: Duration.seconds(10),
              concurrency: searchWidth,
              coverage: requiredInSpace<TextSituation>(["document", "empty", "entry"]),
              generator: textReferences,
              literal: Formatter.format,
              oracle: {
                kind: "second-implementation",
                name: "the nodes numbered by hand (the document node 0, the root 1, the whitespace node 2, the element 3 and its text 4), the string value split by RFC 3986's Appendix B and resolved by the law oracle's own resolver with the xml:base in scope, under the whitespace class of its text's type in the inventory (xs:anyURI collapses, URLDType replaces)",
              },
              suite: "import/overlays-package/text-references",
            },
            ({ base, kind, value }, c) =>
              Effect.sync(() => {
                const documentIds: Place = { ...ids, path: "items/item.xml" };
                const tree: XdmDocument<Composed> = {
                  ...referenceTreeOf({ base: undefined, elements: [], path: documentIds.path }),
                  root: elementOf(
                    "qti-assessment-item",
                    [],
                    [
                      { _tag: "ws", value: "\n" },
                      elementOf(
                        kind,
                        baseAttribute(base),
                        value === "" ? [] : [{ _tag: "text", value }],
                      ),
                    ],
                  ),
                };
                const rows = referenceRowsOf(ownViewOf(tree), documentIds, census);
                const start = 3n;
                const resolution = resolveAttribute({
                  bases: base === undefined ? [] : [base],
                  document: documentIds.path,
                  lexical: value,
                  whiteSpace: textWhiteSpaceOf(kind),
                });
                const at = { package: documentIds.package, path: documentIds.path };
                const key = keyTextOf(at.package, at.path, start);
                const shown = Formatter.format({ base, kind, value });

                c.note(value === "" ? "empty" : resolution.scope);
                assert.deepStrictEqual(
                  sortedEntries(rows.TextReference),
                  [
                    [
                      key,
                      { ...at, kind, scope: resolution.scope, start, ...appendixPieces(value) },
                    ],
                  ],
                  shown,
                );
                assert.deepStrictEqual(
                  sortedEntries(rows.TextReferencePath),
                  resolution.scope === "entry"
                    ? [[key, { ...at, kind, start, target: resolution.path }]]
                    : [],
                  shown,
                );
              }),
          ),
        ),
      ),
  );
});

/**
 * The characters a srcset of the split box is written with: a letter, a URL's character; the
 * space and the tab, ASCII whitespace, which ends a URL; the comma, which separates candidates and
 * ends a URL it trails; and both parentheses, inside which a descriptor's comma separates nothing.
 */
const SRCSET_CHARACTERS = ["a", " ", "\t", ",", "(", ")"] as const;

/**
 * Draw a srcset of the split box: every string of up to six of {@link SRCSET_CHARACTERS}.
 */
const srcsets: Gen<string> = (source) =>
  source.draw(array(element(SRCSET_CHARACTERS), { max: 6, min: 0 })).join("");

/**
 * How many srcsets {@link srcsets} draws.
 */
const SRCSETS = 1 + 6 + 6 ** 2 + 6 ** 3 + 6 ** 4 + 6 ** 5 + 6 ** 6;

/**
 * What a srcset of the split box reaches: no candidate, several, a comma kept in a URL,
 * descriptors, and parentheses in them.
 */
type SrcsetSituation =
  | "a comma in a URL"
  | "descriptors"
  | "no candidate"
  | "parentheses"
  | "several candidates";

/**
 * Name what a srcset's candidates reach.
 *
 * @param candidates - The candidates the importer split.
 * @returns Each situation they reach.
 */
const srcsetSituationsOf = (
  candidates: readonly { readonly descriptor: string; readonly url: string }[],
): readonly SrcsetSituation[] => [
  ...(candidates.length === 0 ? ["no candidate" as const] : []),
  ...(candidates.length > 1 ? ["several candidates" as const] : []),
  ...(candidates.some(({ url }) => url.includes(",")) ? ["a comma in a URL" as const] : []),
  ...(candidates.some(({ descriptor }) => descriptor.trim() !== "")
    ? ["descriptors" as const]
    : []),
  ...(candidates.some(({ descriptor }) => descriptor.includes("("))
    ? ["parentheses" as const]
    : []),
];

/**
 * Whether a text is what the HTML Standard's candidate list collects before a URL: ASCII
 * whitespace (tab, line feed, form feed, carriage return, space) and commas.
 *
 * @param text - The text.
 * @returns Whether it holds nothing else.
 */
const isSeparation = (text: string): boolean =>
  Arr.fromIterable(text).every((character) => "\t\n\f\r ,".includes(character));

/**
 * Whether a candidate's descriptors hold no comma outside parentheses, where the HTML Standard's
 * descriptor tokenizer ends them: a `(` opens parentheses, which the next `)` closes, and nothing
 * nests.
 *
 * @param descriptor - The descriptors as written.
 * @returns Whether every comma stands inside parentheses.
 */
const holdsNoBareComma = (descriptor: string): boolean => {
  let inParentheses = false;

  for (const character of descriptor) {
    if (inParentheses) {
      inParentheses = character !== ")";
      continue;
    }

    if (character === ",") {
      return false;
    }

    inParentheses = character === "(";
  }

  return true;
};

describe("import/overlays/package.ts, a srcset's image candidates", () => {
  it.effect(
    `splits every srcset of up to 6 of a letter, a space, a tab, a comma and both parentheses into its image candidates as the HTML Standard parses it: ${String(SRCSETS)} srcsets`,
    (ctx) =>
      Effect.andThen(
        boxHolds(srcsets, SRCSETS),
        searched(
          ctx,
          exhaust(
            {
              box: "every srcset of 0 to 6 of a, the space, the tab, the comma, ( and )",
              caseHang: Duration.seconds(10),
              concurrency: searchWidth,
              coverage: requiredInSpace<SrcsetSituation>([
                "a comma in a URL",
                "descriptors",
                "no candidate",
                "parentheses",
                "several candidates",
              ]),
              generator: srcsets,
              literal: (lexical) => JSON.stringify(lexical),
              oracle: {
                kind: "second-implementation",
                name: "the law oracle's own reading of the HTML Standard's grammar of a candidate list (§4.8.4.3.10, oracleSrcsetOf), apart from the importer's split: each candidate's URL and the trail; each candidate's lead whitespace and commas, its descriptors holding no comma outside parentheses, and the pieces together the srcset as written; each URL one reference (spec reading `href-resolution`)",
              },
              suite: "import/overlays-package/srcset-split",
            },
            (lexical, c) =>
              Effect.sync(() => {
                const split = srcsetCandidatesOf(lexical);
                const read = oracleSrcsetOf(lexical);

                c.noteAll(srcsetSituationsOf(split.candidates));
                assert.deepStrictEqual(
                  { trail: split.trail, urls: split.candidates.map(({ url }) => url) },
                  { trail: read.trail, urls: read.urls },
                  lexical,
                );
                assert.isTrue(
                  split.candidates.every(({ lead }) => isSeparation(lead)),
                  `${JSON.stringify(lexical)}: a lead holds other than whitespace and commas`,
                );
                assert.isTrue(
                  split.candidates.every(({ descriptor }) => holdsNoBareComma(descriptor)),
                  `${JSON.stringify(lexical)}: descriptors hold a comma outside parentheses`,
                );
                assert.strictEqual(
                  [
                    ...split.candidates.map(({ descriptor, lead, url }) => lead + url + descriptor),
                    split.trail,
                  ].join(""),
                  lexical,
                  lexical,
                );
              }),
          ),
        ),
      ),
  );

  it("resolves each image candidate's URL, and gives each one in the package its CandidatePath", () => {
    const rows = referenceRowsOf(
      ownViewOf(
        referenceTreeOf({
          base: undefined,
          elements: [
            {
              base: undefined,
              carrier: ["source", "srcset"],
              value: "a.png 1x, http://x.org/b.png 2x",
            },
          ],
          path: "item.xml",
        }),
      ),
      { ...ids, path: "item.xml" },
      census,
    );

    assert.strictEqual(rows.Reference.size, 0);
    assert.deepStrictEqual(
      [...rows.Srcset.values()].map(({ tokens }) => tokens.map(({ scope, url }) => [url, scope])),
      [
        [
          ["a.png", "entry"],
          ["http://x.org/b.png", "external"],
        ],
      ],
    );
    assert.deepStrictEqual(
      [...rows.CandidatePath.values()].map(({ at, target }) => [at, target]),
      [[0n, "a.png"]],
    );
  });
});
