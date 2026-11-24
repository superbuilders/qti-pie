/**
 * The views of `Attribute` and `Node` that the database keeps where the importer once wrote copies,
 * against the tree they read, on the lease: each map entry's key and each lookup table's typed
 * values (`MapKey`, `LookupValue`, `#pantry/qti/mapping.ts`), each catalog's `id` and its bindings
 * in its assembly (`CatalogId`, `#pantry/qti/names.ts`; `AssembledCatalog`,
 * `#pantry/qti/overlay-queries/catalog.ts`), and each table cell's `headers` tokens, its nearest
 * table and each tabled header's `id` (`HeaderToken`, `CellTable`, `#pantry/qti/names.ts`;
 * `TableHeader`, `#pantry/qti/overlay-queries/html.ts`).
 *
 * One package is imported: an item that includes a fragment, so the item is an assembly, holding a
 * mapping whose keys repeat and carry whitespace, a match table and an interpolation table, two
 * catalogs, one with an `id` written with whitespace around it, and a table nested in a cell of
 * another, each with headers and cells whose `headers` name them, one written with whitespace
 * around and between its tokens. Each view is read back through the author role and compared with
 * what the item's text states (each attribute's value, by the attribute's own whitespace class)
 * beside the positions the database's own tree (`Node`) gives its elements, a cell's table read by
 * a walk up `Node`'s parents written here.
 */
import path from "node:path";
import { answered, login, query, Sha256, v, workload } from "@bjornpagen/grizzle";
import { compileServed } from "@bjornpagen/grizzle/compile";
import { Db, DbLayer, served } from "@bjornpagen/grizzle/runtime";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Context, Effect, FileSystem, Layer, Schema } from "effect";
import { describe } from "vitest";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { primedLoginConnection } from "#pantry/db/connection.ts";
import { memoryMediaStore } from "#pantry/package/media.ts";
import { Node } from "#pantry/qti/node.ts";
import { PackageName } from "#pantry/qti/limits.ts";
import { LookupValue, MapKey } from "#pantry/qti/mapping.ts";
import { CatalogId, CellTable, HeaderToken } from "#pantry/qti/names.ts";
import { AssembledCatalog } from "#pantry/qti/overlay-queries/catalog.ts";
import { TableHeader } from "#pantry/qti/overlay-queries/html.ts";
import { Author } from "#pantry/qti/roles.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { asi, manifestOf } from "#pantry/test/probe.ts";
import { hasLease } from "#pantry/test/settings.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";

/**
 * The package's name, which every view's row holds.
 */
const packageName = "views";

/**
 * The item's mapping's keys, as written: one key twice, and one with a tab, which a map key's
 * `xs:normalizedString` value holds as a space.
 */
const mapKeys = ["York", "York", "New\tYork"] as const;

/**
 * The item: a string response's mapping of {@link mapKeys}, an integer outcome's match table with a
 * default, a float outcome's interpolation table whose entry's target has whitespace around it, a
 * table holding a table in one of its cells, and two catalogs, one named by the fragment it
 * includes. Its text holds no whitespace between elements, so its tree holds no whitespace node.
 */
const itemText = [
  `<qti-assessment-item xmlns="${asi}" xmlns:xi="http://www.w3.org/2001/XInclude" identifier="item" title="Item" time-dependent="false">`,
  '<qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="string">',
  '<qti-mapping default-value="0">',
  ...mapKeys.map(
    (key) => `<qti-map-entry map-key="${key.replace("\t", "&#9;")}" mapped-value="1"/>`,
  ),
  "</qti-mapping>",
  "</qti-response-declaration>",
  '<qti-outcome-declaration identifier="GRADE" cardinality="single" base-type="integer">',
  '<qti-match-table default-value="0"><qti-match-table-entry source-value="1" target-value="5"/></qti-match-table>',
  "</qti-outcome-declaration>",
  '<qti-outcome-declaration identifier="LEVEL" cardinality="single" base-type="float">',
  '<qti-interpolation-table><qti-interpolation-table-entry source-value="1" target-value=" 2.5 "/></qti-interpolation-table>',
  "</qti-outcome-declaration>",
  "<qti-item-body>",
  '<table><tbody><tr><th id=" h1 ">H</th><th id="h3">J</th><td headers="h1 h3">a</td></tr>',
  '<tr><td><table><tbody><tr><th id="h2">I</th><td headers=" h2&#9;">b</td></tr></tbody></table></td></tr>',
  "</tbody></table>",
  '<xi:include href="fragment.xml"/>',
  "</qti-item-body>",
  '<qti-catalog-info><qti-catalog id="C"><qti-card support="spoken"><qti-html-content/></qti-card></qti-catalog>',
  '<qti-catalog id=" D "><qti-card support="spoken"><qti-html-content/></qti-card></qti-catalog></qti-catalog-info>',
  "</qti-assessment-item>",
].join("");

/**
 * The package: the item, which depends on the fragment, and the fragment, whose one paragraph names
 * the item's catalog `C`.
 */
const entries: ReadonlyMap<string, Uint8Array> = new Map(
  Object.entries({
    "fragment.xml": `<div xmlns="${asi}"><p data-catalog-idref="C">x</p></div>`,
    "imsmanifest.xml": manifestOf(
      '<resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/><dependency identifierref="F"/></resource><resource identifier="F" type="imsqti_fragment_xmlv3p0" href="fragment.xml"><file href="fragment.xml"/></resource>',
    ),
    "item.xml": itemText,
  }).map(([file, text]) => [file, new TextEncoder().encode(text)] as const),
);

/**
 * Read every row of one view of the package, by its name: a query over `Qti` with the package as
 * its one parameter.
 *
 * @param relation - The view.
 * @returns The read.
 */
const packageRows = {
  assembledCatalogs: answered(
    query(Qti).rule((r) => {
      const { assembly, idDigest } = v(AssembledCatalog, "bound");

      return r
        .match(AssembledCatalog, { assembly, idDigest, package: r.param("package", PackageName) })
        .find({ assembly, idDigest });
    }),
  ),
  catalogIds: answered(
    query(Qti).rule((r) => {
      const { id, idDigest, path: at, start } = v(CatalogId, "catalog");

      return r
        .match(CatalogId, {
          id,
          idDigest,
          package: r.param("package", PackageName),
          path: at,
          start,
        })
        .find({ id, idDigest, path: at, start });
    }),
  ),
  cellTables: answered(
    query(Qti).rule((r) => {
      const { path: at, start, table } = v(CellTable, "cell");

      return r
        .match(CellTable, { package: r.param("package", PackageName), path: at, start, table })
        .find({ path: at, start, table });
    }),
  ),
  headerTokens: answered(
    query(Qti).rule((r) => {
      const { at, path: document, start, token, tokenDigest } = v(HeaderToken, "token");

      return r
        .match(HeaderToken, {
          at,
          package: r.param("package", PackageName),
          path: document,
          start,
          token,
          tokenDigest,
        })
        .find({ at, path: document, start, token, tokenDigest });
    }),
  ),
  lookupValues: answered(
    query(Qti).rule((r) => {
      const { name, path: at, start, value } = v(LookupValue, "value");

      return r
        .match(LookupValue, {
          name,
          package: r.param("package", PackageName),
          path: at,
          start,
          value,
        })
        .find({ name, path: at, start, value });
    }),
  ),
  mapKeys: answered(
    query(Qti).rule((r) => {
      const { key, path: at, start } = v(MapKey, "key");

      return r
        .match(MapKey, { key, package: r.param("package", PackageName), path: at, start })
        .find({ key, path: at, start });
    }),
  ),
  nodes: answered(
    query(Qti).rule((r) => {
      const { kind, parent, path: at, start } = v(Node, "node");

      return r
        .match(Node, { kind, package: r.param("package", PackageName), parent, path: at, start })
        .find({ kind, parent, path: at, start });
    }),
  ),
  tableHeaders: answered(
    query(Qti).rule((r) => {
      const { id, idDigest, path: at, start, table } = v(TableHeader, "header");

      return r
        .match(TableHeader, {
          id,
          idDigest,
          package: r.param("package", PackageName),
          path: at,
          start,
          table,
        })
        .find({ id, idDigest, path: at, start, table });
    }),
  ),
} as const;

/**
 * The author login with the views' reads in place of its own workload: the same login and role the
 * lane's installation holds, its reads compiled here (grizzle's `compileServed`), never committed.
 */
const ViewReader = login(Qti, "author_app", [Author], {
  workload: [workload(Author, packageRows)],
});

/**
 * The views' reader, served from its compile.
 */
class ViewLogin extends Context.Service<ViewLogin, ReturnType<typeof served<typeof ViewReader>>>()(
  "@qti-pie/pantry/attribute-views.db.test/ViewLogin",
) {}

/**
 * The package's `migrations` folder, whose snapshot the lane's installation was migrated to.
 */
const migrationsDirectory = path.resolve(import.meta.dirname, "..", "..", "migrations");

/**
 * One session: the file's reads run one after another.
 */
const onePool = { idleTimeoutMs: 60_000, max: 1, min: 0 } as const;

/**
 * The reader's `DbLayer` and its served login: its reads compiled under the committed snapshot,
 * over the login's connection to the file's database.
 */
const ViewReaderLayer = Layer.unwrap(
  Effect.gen(function* viewReaderLayer() {
    const fs = yield* FileSystem.FileSystem;
    const snapshot = yield* Schema.decodeEffect(Schema.fromJsonString(Schema.Unknown))(
      yield* fs.readFileString(path.join(migrationsDirectory, "qti", "snapshot.json")),
    );
    const file = yield* compileServed(ViewReader, snapshot, ViewReader.workload);
    const reader = served<typeof ViewReader>(file, "author_app");
    const connection = yield* (yield* primedLoginConnection)(reader);

    return Layer.merge(
      DbLayer.make({ ...connection, login: reader, pool: onePool }),
      Layer.succeed(ViewLogin, reader),
    );
  }),
);

/**
 * A digest's text, as the assertions compare it.
 *
 * @param digest - The digest.
 * @returns Its hex.
 */
const hexOf = (digest: Sha256): string => digest.toHex();

/**
 * The SHA-256 of a text's UTF-8, as hex, the digest PostgreSQL computes of a text.
 *
 * @param text - The text.
 * @returns Its digest's hex.
 */
const digestOf = (text: string): string => Sha256.ofBytes(new TextEncoder().encode(text)).toHex();

/**
 * XML Schema's whiteSpace collapse (Part 2, §4.3.6): runs of tab, line feed, carriage return and
 * space to one space, none at either end.
 *
 * @param text - The text.
 * @returns It, collapsed.
 */
const collapsed = (text: string): string => text.replaceAll(/[\t\n\r ]+/gu, " ").trim();

/**
 * Read every view of the imported package through the views' reader, and hold each to what the
 * item's text states beside the positions of the database's own tree.
 */
const viewsRead = Effect.gen(function* viewsRead() {
  const db = yield* Db.open((yield* ViewLogin).roles.author, {});
  const read = { facts: {}, params: { package: packageName } } as const;
  const nodes = [...(yield* db.workload.nodes.once(read))].filter(
    ({ path: at }) => at === "item.xml",
  );
  const startsOf = (kind: string): readonly bigint[] =>
    nodes
      .filter((node) => node.kind === kind)
      .map(({ start }) => start)
      .toSorted((a, b) => (a < b ? -1 : 1));
  const byStart = new Map(nodes.map((node) => [node.start, node] as const));
  const tableOf = (start: bigint): bigint => {
    const node = byStart.get(start);
    if (node === undefined || node.kind === "table") {
      return start;
    }

    return node.parent === 0n ? 0n : tableOf(node.parent);
  };
  const nth = (kind: string, at: number): bigint =>
    startsOf(kind)[at] ?? assert.fail(`the item's tree holds no ${kind} #${String(at)}`);
  const [outer, inner] = [nth("table", 0), nth("table", 1)];
  const [h1, h3, h2] = [nth("th", 0), nth("th", 1), nth("th", 2)];
  const [outerCell, holdingCell, innerCell] = [nth("td", 0), nth("td", 1), nth("td", 2)];
  const [catalogC, catalogD] = [nth("qti-catalog", 0), nth("qti-catalog", 1)];

  assert.deepStrictEqual(
    [...(yield* db.workload.mapKeys.once(read))]
      .map(({ key, start }) => [start, key] as const)
      .toSorted(([a], [b]) => (a < b ? -1 : 1)),
    startsOf("qti-map-entry").map(
      (start, at) => [start, (mapKeys[at] ?? "").replaceAll(/[\t\n\r]/gu, " ")] as const,
    ),
    "MapKey: one row per map entry, its map-key's value",
  );
  assert.sameDeepMembers(
    [...(yield* db.workload.lookupValues.once(read))].map(({ name, start, value }) => ({
      name,
      start,
      value,
    })),
    [
      { name: "default-value", start: nth("qti-match-table", 0), value: "0" },
      { name: "target-value", start: nth("qti-match-table-entry", 0), value: "5" },
      {
        name: "target-value",
        start: nth("qti-interpolation-table-entry", 0),
        value: " 2.5 ",
      },
    ],
    "LookupValue: each table's default and each entry's target, as written",
  );
  assert.sameDeepMembers(
    [...(yield* db.workload.catalogIds.once(read))].map(({ id, idDigest, start }) => ({
      digest: hexOf(idDigest),
      id,
      start,
    })),
    [
      { digest: digestOf("C"), id: "C", start: catalogC },
      { digest: digestOf("D"), id: "D", start: catalogD },
    ],
    "CatalogId: each catalog's id, collapsed",
  );
  assert.sameDeepMembers(
    [...(yield* db.workload.assembledCatalogs.once(read))].map(({ assembly, idDigest }) => ({
      assembly,
      digest: hexOf(idDigest),
    })),
    [
      { assembly: "item.xml", digest: digestOf("C") },
      { assembly: "item.xml", digest: digestOf("D") },
    ],
    "AssembledCatalog: each catalog bound in the item's assembly",
  );
  assert.sameDeepMembers(
    [...(yield* db.workload.headerTokens.once(read))].map(({ at, start, token, tokenDigest }) => ({
      at,
      digest: hexOf(tokenDigest),
      start,
      token,
    })),
    [
      { at: 0n, digest: digestOf("h1"), start: outerCell, token: "h1" },
      { at: 1n, digest: digestOf("h3"), start: outerCell, token: "h3" },
      { at: 0n, digest: digestOf("h2"), start: innerCell, token: "h2" },
    ],
    "HeaderToken: each cell's headers split at XML whitespace",
  );
  assert.sameDeepMembers(
    [...(yield* db.workload.cellTables.once(read))]
      .filter(({ path: at }) => at === "item.xml")
      .map(({ start, table }) => ({ start, table })),
    [h1, h3, outerCell, holdingCell, h2, innerCell].map((start) => ({
      start,
      table: tableOf(start),
    })),
    "CellTable: each cell's nearest table",
  );
  assert.sameDeepMembers(
    [...(yield* db.workload.tableHeaders.once(read))].map(({ id, idDigest, start, table }) => ({
      digest: hexOf(idDigest),
      id,
      start,
      table,
    })),
    [
      { digest: digestOf("h1"), id: collapsed(" h1 "), start: h1, table: outer },
      { digest: digestOf("h3"), id: "h3", start: h3, table: outer },
      { digest: digestOf("h2"), id: "h2", start: h2, table: inner },
    ],
    "TableHeader: each tabled th's id beside its table",
  );
});

describe.skipIf(!hasLease)("qti/attribute-views.db.test.ts, on the lease", () => {
  layer(
    Layer.mergeAll(AuthorAppLayer, NodeServices.layer, memoryMediaStore).pipe(
      Layer.provideMerge(fileDatabaseOf("views")),
    ),
    { excludeTestServices: true, timeout: "300 seconds" },
  )("the views of Attribute and Node", (it) => {
    it.effect(
      "hold each map key, lookup value, catalog id and binding, header token, cell table and tabled header the item's tree states",
      () =>
        // Oracle: the item's text, each attribute's value by its whitespace class, beside the
        // positions of the database's own tree, and a walk up the tree's parents written here.
        // Bound: one package, every kind of row of each view.
        Effect.gen(function* viewsOfOnePackage() {
          const imported = yield* importDir(yield* scopedPackage(entries), packageName);
          assert.include(["accepted", "unchanged"], imported.outcome, "the package");

          yield* Effect.provide(viewsRead, ViewReaderLayer);
        }).pipe(Effect.scoped),
    );
  });
});
