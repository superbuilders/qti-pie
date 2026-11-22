/* oxlint-disable unicorn/text-encoding-identifier-case -- The generated documents carry the charset label crust's reader reports, `UTF-8`. */
/**
 * The manifest's overlay rows and each document's reference rows against a second reading of the
 * same tree: a direct walk of the XDM document, numbering its nodes in document order as the tree's
 * rows are numbered, collecting each overlay's row from its element and attributes, and resolving
 * each href by the law oracle's own RFC 3986 resolver (`#pantry/test/resolution.ts`) with the
 * `xml:base` values the walk meets on its way down. The walk shares no code with the builder,
 * which reads the tree's flat rows (`flatten`) and resolves by `resolveIn`.
 */
import { NodeChildProcessSpawner, NodeFileSystem, NodePath } from "@effect/platform-node";
import { assert, describe, it, layer } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import { array, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter, Layer, Option } from "effect";
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
  typedHrefsOf,
} from "#pantry/import/overlays/package.ts";
import { attributeValueOf, valueReadingOf } from "#pantry/import/names.ts";
import type {
  DocumentIds,
  ManifestIds,
  PackageRows,
  ReferenceCensus,
  ReferenceRows,
} from "#pantry/import/overlays/package.ts";
import type { WhiteSpaceClass } from "#pantry/grammar/domains.ts";
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
import { comparedPath, oracleValueOf, resolve, resolveAttribute } from "#pantry/test/resolution.ts";
import { attributeDeclarations } from "#pantry/vocab/inventory/attributes.ts";
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
 * queries over them no relation stores, the typed hrefs (`typedHrefsOf`, over the host's type
 * codes, `resourceTypesOf`) and the unread-type hrefs ({@link unreadTypeHrefsOf}), each by the
 * resource's node.
 */
type Expected = {
  readonly [Relation in keyof PackageRows | "TypedHref" | "UnreadTypeHref"]: Map<string, object>;
};

/**
 * The lexical forms of a resource's `type` that spell a `ResourceType` handle, each as written
 * (`ResourceTypeLexical`).
 */
const spelledTypes: ReadonlySet<string> = new Set(
  ResourceTypeLexical.rows.map(({ lexical }) => lexical),
);

/**
 * Resolve a manifest href as the oracle does (readings 102 and 103): its value collapsed as an
 * `xs:anyURI`, against the manifest's path and the `xml:base` values in scope.
 *
 * @param href - The href, as written.
 * @param bases - The `xml:base` values in scope, outermost first.
 * @returns Its scope and the path it is compared by.
 */
const manifestHrefOf = (href: string, bases: readonly string[]) => {
  const value = oracleValueOf(href, "collapse");
  const resolution = resolve({ bases, document: manifestPath, value });

  return { scope: resolution.scope, target: comparedPath(resolution, value) };
};

/**
 * Expect a resource's `href` rows: its `ResourceHref`, resolved by the oracle; where its type
 * spells a handle, its typed href, of its compared path and type; and where its type is written and
 * spells none, its unread-type href, of its compared path.
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
  expected.ResourceHref.set(nodeKey(start), { ...at, scope, target });
  for (const code of Option.toArray(type)) {
    expected.TypedHref.set(nodeKey(start), { ...at, scope, target, type: code });
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
    ResourceHref: new Map(),
    TypedHref: new Map(),
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
      expected.File.set(nodeKey(start), { ...place, scope, target });
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
const relationNames = ["File", "ResourceHref"] as const satisfies readonly (keyof PackageRows)[];

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
 * that holds it, and the target its href is compared by.
 */
interface UnreadTypeHrefRow {
  readonly package: string;
  readonly path: string;
  readonly start: bigint;
  readonly target: string;
}

/**
 * The rows of the query `UnreadTypeHref` (`#pantry/qti/queries.ts`) over a manifest, restated on
 * the host: each resource's `ResourceHref` beside its `type` attribute as the tree's rows hold it,
 * where that form is nonempty and spells no `ResourceType` handle ({@link spelledTypes}), as its
 * node's key and the path it is compared by, by the node. Only the database evaluates the query,
 * which "Item ref target" reads by (package, target); this reads the rows the query reads, the
 * builder's and the tree's, so a builder that loses an unread-type resource's href fails here.
 *
 * @param doc - The manifest's tree.
 * @param rows - The builder's rows of it.
 * @returns The query's rows, by the resource's node.
 */
const unreadTypeHrefsOf = (
  doc: XdmDocument<Composed>,
  rows: Pick<PackageRows, "ResourceHref">,
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
    [...rows.ResourceHref.values()].flatMap(({ package: pkg, path, start, target }) =>
      Option.toArray(Option.fromUndefinedOr(types.get(start)))
        .filter((lexical) => lexical !== "" && !spelledTypes.has(lexical))
        .map(() => [nodeKey(start), { package: pkg, path, start, target }] as const),
    ),
  );
};

/**
 * Compare the builder's keyed sets with the walk's: every relation's keys and rows alike, and the
 * rows of the queries over them the host reads or restates, the typed hrefs (`typedHrefsOf`) and
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
        typedHrefsOf(rows, resourceTypesOf(flatDocumentOf(doc))).map(
          (typed) => [nodeKey(typed.start), typed] as const,
        ),
      ),
    ),
    sortedEntries(expected.TypedHref),
    `${label} TypedHref`,
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
 * an href with launch parameters or a fragment among them (`href-params`, reading 102), listing up
 * to three files drawn from two hrefs, so a file listed twice (`file-twice`) and a file two
 * resources list (`shared-file`) are drawn, and up to two dependencies, a resource's own identifier
 * among them (`self-dependency`).
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
    ["href-params", input.resources.some(({ href }) => href !== undefined && /[?#]/u.test(href))],
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
        [href ?? "", ...listed].some((value) => /\.\/|%| /u.test(value)),
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
 * ({@link unreadTypeHrefsOf}).
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
    typed: typedHrefsOf(rows, resourceTypesOf(flatDocumentOf(doc))).map(({ target }) => target),
  };
};

describe("import/overlays/package.ts", () => {
  it.effect("writes each overlay's rows as the walk of the manifest's tree names them", (ctx) =>
    // Oracle: a second implementation, a direct walk of the XDM document that numbers its nodes in
    // document order and reads each element's attributes, against the builder's read of the tree's
    // flat rows; the type codes against `ResourceTypeLexical`.
    // Bound: a manifest with or without its identifier, up to 3 resources of 3 types or none, each
    // with its own identifier, another's, the manifest's or none, with or without one of 9 hrefs
    // (3 with a query or a fragment, 4 that need resolving), listing up to 3 of 5 files and up to
    // 2 dependencies, under 5 xml:base values on each of the manifest, its resources and each
    // resource, 300 runs.
    searched(
      ctx,
      explore(
        {
          caseHang: Duration.seconds(10),
          concurrency: 1,
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
            name: "a direct walk of the XDM tree, its hrefs by the oracle's RFC 3986 resolver",
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
              typedHrefsOf(rows, resourceTypesOf(flatDocumentOf(doc))),
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
    // Oracle: R-O6's manifest (the genetic repair's gr-5a): its first resource's type carries a
    // trailing space, so it spells no handle; the test resource's spells one. A `bogus` type is
    // unread too; a resource that writes no type has no row, and AL3 refuses it alone. The query
    // (`#pantry/qti/queries.ts`) is restated over the rows it reads, the builder's `ResourceHref`
    // and the tree's `type` attribute ({@link unreadTypeHrefsOf}); two unread resources of one
    // path are two rows of one (package, target), the pair "Item ref target" reads.
    assert.deepStrictEqual(
      unreadOf([
        { href: "item.xml", type: "resourceextmetadata/xml " },
        { href: "test.xml", type: "imsqti_test_xmlv3p0" },
      ]),
      { hrefs: ["item.xml"], paths: ["item.xml"], typed: ["test.xml"] },
      "R-O6",
    );
    assert.deepStrictEqual(
      unreadOf([{ href: "item.xml", type: "bogus" }]),
      { hrefs: ["item.xml"], paths: ["item.xml"], typed: [] },
      "bogus",
    );
    assert.deepStrictEqual(
      unreadOf([{ href: "item.xml", type: undefined }]),
      { hrefs: [], paths: [], typed: [] },
      "no type",
    );
    assert.deepStrictEqual(
      unreadOf([
        { href: "item.xml", type: "bogus" },
        { href: "item.xml", type: "bogus" },
      ]),
      { hrefs: ["item.xml", "item.xml"], paths: ["item.xml"], typed: [] },
      "two unread resources of one path, one (package, target)",
    );
  });
});

layer(TestLayer, { excludeTestServices: true })("import/overlays/package.ts, fixtures", (suite) => {
  suite.effect(
    "writes each fixture manifest's overlay rows as the walk of its tree names them",
    () =>
      // Oracle: the same direct walk, over the manifests of real packages.
      // Bound: the fixtures of `fixtures`, each manifest that shreds.
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
          if (manifest === undefined) {
            continue;
          }

          const xml = yield* readXml(manifest.bytes);
          const tree = yield* Effect.option(shred(xml, shredGrammarOf(grammar)));
          if (Option.isNone(tree)) {
            continue;
          }

          shredded += 1;
          const rows = rowsOf(ownViewOf(tree.value), ids);
          assertRows(tree.value, rows, walk(tree.value), name);
        }

        assert.isAtLeast(shredded, 8);
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
const appendixB =
  /^(?<scheme>(?:[^:/?#]+):)?(?<authority>\/\/(?:[^/?#]*))?(?<path>[^?#]*)(?<query>\?(?:[^#]*))?(?<fragment>#(?:.*))?$/su;

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
 * {@link referenceValues}.
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
const expectedReferences = (input: ReferenceCase, documentIds: DocumentIds) => {
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

describe("import/overlays/package.ts, hrefs and references", () => {
  it("reads the grammar's census as ReferenceAttribute's rows hold it, each in its value's whitespace class, and none for an attribute outside it", () => {
    // Oracle: the closed relation's own rows (`ReferenceAttribute`, spec reading 103), which the
    // database's copy into Reference selects by, against the builder's lookup; and the attribute
    // inventory's declarations, read by a second walk, for each one's whitespace class, against
    // the reading `Attribute.value` makes under the kind's own governor (`valueReadingOf`), for
    // every attribute whose declared type is no union. No census attribute's type is a union,
    // which the walk checks too, and every governor of a census kind admits its census names
    // (`GoverningOf`), so the builder never reads a census attribute its governor admits not.
    // Bound: every row of ReferenceAttribute under each governor of its kind, and three attributes
    // outside it.
    assert.isNotEmpty(ReferenceAttribute.rows);
    for (const { form, kind, name } of ReferenceAttribute.rows) {
      assert.deepStrictEqual(referenceCensus(kind, name), Option.some(form), `${kind} ${name}`);

      const declared = declaredWhiteSpace(kind, name);
      assert.isTrue(Option.isSome(declared), `${kind} ${name}: a declared type of one class`);
      for (const whiteSpace of Option.toArray(declared)) {
        assert.deepStrictEqual(
          valueReadingOf(kind, name, "a"),
          { _tag: "admitted", whiteSpace },
          `${kind} ${name}`,
        );
      }

      for (const { governor } of GoverningOf.rows.filter((governing) => governing.kind === kind)) {
        assert.strictEqual(
          valueReadingOf(governor, name, "a")._tag,
          "admitted",
          `${kind} ${name} under ${governor}`,
        );
      }
    }

    for (const [kind, name] of [
      ["div", "title"],
      ["cp:file", "href"],
      ["qti-assessment-item", "xml:base"],
    ] as const) {
      assert.isTrue(Option.isNone(referenceCensus(kind, name)), `${kind} ${name}`);
    }
  });

  it("reads an attribute its governor admits not as written, as Attribute.value keeps it", () => {
    // Oracle: the specification, `Attribute.value`'s generated term (`#pantry/qti/attributes.ts`),
    // which finds no domain for a name its element's governor declares none of and keeps the form,
    // which AL1 admission refuses; and an admitted `xs:anyURI` beside it, collapsed.
    // Bound: `div@src`, which no governor `div` has admits, and `img@src`, which `img` admits.
    assert.deepStrictEqual(valueReadingOf("div", "src", " a.png "), { _tag: "unadmitted" });
    assert.strictEqual(attributeValueOf("div", "src", " a.png "), " a.png ");
    assert.strictEqual(attributeValueOf("img", "src", " a.png "), "a.png");
  });

  it.effect(
    "splits every lexical form of the box as RFC 3986's Appendix B does, each piece of its pattern",
    (ctx) =>
      // Oracle: a second implementation, RFC 3986's Appendix B regular expression over the form
      // with its XML whitespace set aside; and the specification as a checker, each piece against
      // the pattern its field's check reads (hrefPathPattern, hrefParamsPattern, XML's S).
      // Bound: every lexical form of at most 4 of 7 letters, 2,801.
      searched(
        ctx,
        exhaust(
          {
            box: "every lexical form of at most 4 of a / : ? # space tab",
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
            oracle: { kind: "second-implementation", name: "RFC 3986, Appendix B" },
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
              assert.match(pieces.target, new RegExp(hrefPathPattern.source, "u"));
              assert.match(pieces.params, new RegExp(hrefParamsPattern, "su"));
              assert.strictEqual(
                `${pieces.lead}${pieces.target}${pieces.params}${pieces.trail}`,
                lexical,
              );
            }),
        ),
      ),
  );

  it.effect(
    "writes each document's reference rows as a second reading of its tree names them",
    (ctx) =>
      // Oracle: a second implementation, `expectedReferences`: the nodes numbered by hand, each
      // value split by RFC 3986's Appendix B and resolved by the law oracle's own RFC 3986
      // resolver with the xml:base values in scope.
      // Bound: documents at 2 paths, under 5 xml:base values on the root and on each of up to 4
      // elements of 5 kinds with 20 values, 400 runs.
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.seconds(10),
            concurrency: 1,
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
              name: "a second reading of the tree, its values by the oracle's RFC 3986 resolver",
            },
            runs: 400,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "import/overlays-package-references",
          },
          (input, c) =>
            Effect.sync(() => {
              const documentIds: DocumentIds = { ...ids, path: input.path };
              const rows = referenceRowsOf(ownViewOf(referenceTreeOf(input)), documentIds, census);
              const expected = expectedReferences(input, documentIds);

              c.noteAll(referenceSituationsOf(input, rows));
              for (const relation of ["Reference", "ReferencePath"] as const) {
                assert.deepStrictEqual(
                  sortedEntries(rows[relation]),
                  sortedEntries(expected[relation]),
                  relation,
                );
              }
            }),
        ),
      ),
  );

  it("writes a TextReference for each card file, calculator's or digital material's file and resource icon, resolved as an attribute is", () => {
    // Oracle: a second implementation, the nodes numbered by hand (the document node 0, the root 1,
    // then each whitespace node, element and its text in turn), each string value split by RFC
    // 3986's Appendix B and resolved by the law oracle's own resolver with the xml:base in scope,
    // under the whitespace class of its text's type (`xs:anyURI` collapses, `URLDType` replaces).
    // Bound: one card file padded and percent-encoded, one icon under an xml:base, one icon of a
    // same-document fragment, one file of a digital material (information model §5.80.3, "the URI
    // for the associated content file", an `xs:anyURI` that collapses), and an empty card file.
    const textOf = (
      kind: "qti-file-href" | "qti-file-href.card" | "qti-resource-icon",
      value: string,
      base?: string,
    ) => [
      { _tag: "ws", value: "\n" } as const,
      elementOf(kind, baseAttribute(base), value === "" ? [] : [{ _tag: "text", value }]),
    ];
    const cases = [
      { base: undefined, kind: "qti-file-href.card", value: " my%20clip.mp4 " },
      { base: "x/", kind: "qti-resource-icon", value: "img/b.svg" },
      { base: undefined, kind: "qti-resource-icon", value: "#top" },
      { base: undefined, kind: "qti-file-href", value: "absent.png" },
      { base: undefined, kind: "qti-file-href.card", value: "" },
    ] as const;
    const tree: XdmDocument<Composed> = {
      ...referenceTreeOf({ base: undefined, elements: [], path: "items/item.xml" }),
      root: elementOf(
        "qti-assessment-item",
        [],
        cases.flatMap(({ base, kind, value }) => textOf(kind, value, base)),
      ),
    };
    const documentIds: DocumentIds = { ...ids, path: "items/item.xml" };
    const rows = referenceRowsOf(ownViewOf(tree), documentIds, census);

    const expectedTexts = new Map<string, object>();
    const expectedPaths = new Map<string, object>();
    let next = 2;
    for (const { base, kind, value } of cases) {
      const start = BigInt(next + 1);
      next += value === "" ? 2 : 3;
      const resolution = resolveAttribute({
        bases: base === undefined ? [] : [base],
        document: documentIds.path,
        lexical: value,
        whiteSpace: kind === "qti-resource-icon" ? "replace" : "collapse",
      });
      const at = { package: documentIds.package, path: documentIds.path };
      const key = keyTextOf(at.package, at.path, start);
      expectedTexts.set(key, {
        ...at,
        kind,
        scope: resolution.scope,
        start,
        ...appendixPieces(value),
      });
      if (resolution.scope === "entry") {
        expectedPaths.set(key, { ...at, kind, start, target: resolution.path });
      }
    }

    assert.strictEqual(expectedTexts.size, 5);
    assert.deepStrictEqual(sortedEntries(rows.TextReference), sortedEntries(expectedTexts));
    assert.deepStrictEqual(sortedEntries(rows.TextReferencePath), sortedEntries(expectedPaths));
    assert.deepStrictEqual(
      [...rows.TextReferencePath.values()].map(({ target }) => target),
      ["items/my clip.mp4", "items/x/img/b.svg", "items/absent.png"],
    );
  });
});

describe("import/overlays/package.ts, a srcset's image candidates", () => {
  it("splits a srcset into its image candidates as the HTML Standard parses it, each URL resolved and each in the package its CandidatePath", () => {
    // Oracle: the specification, the HTML Standard's "parse a srcset attribute" (§4.8.4.3.10) on
    // its own forms: candidates separated by commas, a URL then its descriptors, a URL's trailing
    // commas ending it with none, a comma inside a URL kept, and whitespace and commas after the
    // last candidate a trail; each candidate's URL is one reference (spec reading 102).
    // Bound: the named values, each by hand.
    const cases = [
      ["a.png", [["", "a.png", ""]], ""],
      [
        "a.png 1x, b.png 2x",
        [
          ["", "a.png", " 1x"],
          [", ", "b.png", " 2x"],
        ],
        "",
      ],
      ["a.png,b.png", [["", "a.png,b.png", ""]], ""],
      [
        "a.png, b.png",
        [
          ["", "a.png", ""],
          [", ", "b.png", ""],
        ],
        "",
      ],
      [
        " a.png 480w , b.png 800w ,",
        [
          [" ", "a.png", " 480w "],
          [", ", "b.png", " 800w "],
        ],
        ",",
      ],
      [
        "a.png foo(1,2) 2x, b.png",
        [
          ["", "a.png", " foo(1,2) 2x"],
          [", ", "b.png", ""],
        ],
        "",
      ],
      [" , ", [], " , "],
    ] as const;
    for (const [lexical, candidates, trail] of cases) {
      const split = srcsetCandidatesOf(lexical);

      assert.deepStrictEqual(
        split.candidates.map(({ descriptor, lead, url }) => [lead, url, descriptor]),
        candidates.map((candidate) => [...candidate]),
        lexical,
      );
      assert.strictEqual(split.trail, trail, lexical);
      assert.strictEqual(
        [
          ...split.candidates.map(({ descriptor, lead, url }) => lead + url + descriptor),
          trail,
        ].join(""),
        lexical,
        lexical,
      );
    }

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
