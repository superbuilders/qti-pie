/**
 * The views of `Attribute` and `Node` that the database keeps where the importer once wrote copies,
 * against the tree they read, on the lease: each map entry's key and each lookup table's typed
 * values (`MapKey`, `LookupValue`, `#pantry/qti/mapping.ts`), each catalog's `id` and its bindings
 * in its assembly (`CatalogId`, `#pantry/qti/names.ts`; `AssembledCatalog`,
 * `#pantry/qti/overlay-queries/catalog.ts`), each table cell's `headers` tokens, its nearest table
 * and each tabled header's `id` (`HeaderToken`, `CellTable`, `#pantry/qti/names.ts`; `TableHeader`,
 * `#pantry/qti/overlay-queries/html.ts`), and each rounding operator's `figures` beside its mode in
 * force and each tolerance's values (`RoundingModeFigures`, `ToleranceToken`,
 * `#pantry/qti/overlay-queries/expression.ts`), and each record's usage value's base type and text
 * (`UsageValueBaseType`, `#pantry/qti/queries.ts`).
 *
 * One package is imported: a usage data file, and an item that includes a fragment, so the item is
 * an assembly, holding a mapping whose keys repeat and carry whitespace, a match table and an
 * interpolation table, two catalogs, one with an `id` written with whitespace around it, a table
 * nested in a cell of another, each with headers and cells whose `headers` name them, one written
 * with whitespace around and between its tokens, and response processing whose rounding operators
 * take their mode by default and as written, and whose equality's `tolerance` is two values with
 * whitespace around and between them. Each view is read back through the author role and compared
 * with what the item's text states (each attribute's value, by the attribute's own whitespace
 * class) beside the positions the database's own tree (`Node`) gives its elements, a cell's table
 * read by a walk up `Node`'s parents written here.
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
import {
  CnCount,
  RoundingModeFigures,
  ToleranceToken,
} from "#pantry/qti/overlay-queries/expression.ts";
import { TableHeader } from "#pantry/qti/overlay-queries/html.ts";
import { UsageValueBaseType } from "#pantry/qti/queries.ts";
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
 * The item's `m:cn`s, in document order: a rational of two parts in a base outside 2 to 36, whose
 * digits are not judged, an integer of one part in that base, a `cn` that writes no `type`, so a
 * `real`, one whose `type` is written with whitespace around it, and one of a `type` no form lists,
 * which is text.
 */
const cns = [
  '<m:cn type="rational" base="40">1<m:sep/>2</m:cn>',
  '<m:cn type="integer" base="40">1</m:cn>',
  "<m:cn>3</m:cn>",
  '<m:cn type=" rational&#10;">4<m:sep/>5</m:cn>',
  '<m:cn type="constant" base="40">1<m:sep/>2<m:sep/>3</m:cn>',
] as const;

/**
 * The item: a string response's mapping of {@link mapKeys}, an integer outcome's match table with a
 * default, a float outcome's interpolation table whose entry's target has whitespace around it, a
 * table holding a table in one of its cells, and two catalogs, one named by the fragment it
 * includes. Its text holds no whitespace between elements, so its tree holds no whitespace node.
 */
const itemText = [
  `<qti-assessment-item xmlns="${asi}" xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns:xi="http://www.w3.org/2001/XInclude" identifier="item" title="Item" time-dependent="false">`,
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
  '<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>',
  '<qti-outcome-declaration identifier="FLAG" cardinality="single" base-type="boolean"/>',
  "<qti-item-body>",
  '<table><tbody><tr><th id=" h1 ">H</th><th id="h3">J</th><td headers="h1 h3">a</td></tr>',
  '<tr><td><table><tbody><tr><th id="h2">I</th><td headers=" h2&#9;">b</td></tr></tbody></table></td></tr>',
  "</tbody></table>",
  `<p><m:math>${cns.join("")}</m:math></p>`,
  '<xi:include href="fragment.xml"/>',
  "</qti-item-body>",
  '<qti-catalog-info><qti-catalog id="C"><qti-card support="spoken"><qti-html-content/></qti-card></qti-catalog>',
  '<qti-catalog id=" D "><qti-card support="spoken"><qti-html-content/></qti-card></qti-catalog></qti-catalog-info>',
  "<qti-response-processing>",
  '<qti-set-outcome-value identifier="FLAG"><qti-equal-rounded figures=" 3 "><qti-variable identifier="SCORE"/><qti-variable identifier="SCORE"/></qti-equal-rounded></qti-set-outcome-value>',
  '<qti-set-outcome-value identifier="SCORE"><qti-round-to rounding-mode="decimalPlaces" figures="2"><qti-variable identifier="SCORE"/></qti-round-to></qti-set-outcome-value>',
  '<qti-set-outcome-value identifier="FLAG"><qti-equal tolerance-mode="absolute" tolerance=" 0.5&#9;T "><qti-variable identifier="SCORE"/><qti-variable identifier="SCORE"/></qti-equal></qti-set-outcome-value>',
  "</qti-response-processing>",
  "</qti-assessment-item>",
].join("");

/**
 * A usage data file: a statistic of two values that write a `baseType`, one in a record (it writes
 * a `fieldIdentifier`) and one outside, which states no base type (spec reading 105).
 */
const usageText = [
  '<usageData xmlns="http://www.imsglobal.org/xsd/imsqti_usagedata_v3p0">',
  '<ordinaryStatistic name="AIS" context="http://example.org/c"><targetObject identifier="item"/>',
  '<value baseType="float" fieldIdentifier="SCORE">0.87</value>',
  "</ordinaryStatistic>",
  '<ordinaryStatistic name="AIS" context="http://example.org/d"><targetObject identifier="item"/>',
  '<value baseType="float">1</value>',
  "</ordinaryStatistic>",
  "</usageData>",
].join("");

/**
 * The package: the item, which depends on the fragment, the fragment, whose one paragraph names the
 * item's catalog `C`, and a usage data file.
 */
const entries: ReadonlyMap<string, Uint8Array> = new Map(
  Object.entries({
    "fragment.xml": `<div xmlns="${asi}"><p data-catalog-idref="C">x</p></div>`,
    "imsmanifest.xml": manifestOf(
      '<resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/><dependency identifierref="F"/></resource><resource identifier="F" type="imsqti_fragment_xmlv3p0" href="fragment.xml"><file href="fragment.xml"/></resource><resource identifier="U" type="qtiusagedata/xml" href="usage.xml"><file href="usage.xml"/></resource>',
    ),
    "item.xml": itemText,
    "usage.xml": usageText,
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
  cnCounts: answered(
    query(Qti).rule((r) => {
      const { parts, path: at, start, type } = v(CnCount, "cn");

      return r
        .match(CnCount, { package: r.param("package", PackageName), parts, path: at, start, type })
        .find({ parts, path: at, start, type });
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
  roundingModeFigures: answered(
    query(Qti).rule((r) => {
      const { figures, mode, path: at, start } = v(RoundingModeFigures, "rounding");

      return r
        .match(RoundingModeFigures, {
          figures,
          mode,
          package: r.param("package", PackageName),
          path: at,
          start,
        })
        .find({ figures, mode, path: at, start });
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
  toleranceTokens: answered(
    query(Qti).rule((r) => {
      const { at, path: document, start, token } = v(ToleranceToken, "value");

      return r
        .match(ToleranceToken, {
          at,
          package: r.param("package", PackageName),
          path: document,
          start,
          token,
        })
        .find({ at, path: document, start, token });
    }),
  ),
  usageValues: answered(
    query(Qti).rule((r) => {
      const { baseType, path: at, start, text } = v(UsageValueBaseType, "usage");

      return r
        .match(UsageValueBaseType, {
          baseType,
          package: r.param("package", PackageName),
          path: at,
          start,
          text,
        })
        .find({ baseType, path: at, start, text });
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
const onePool = { max: 1 } as const;

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
    nodes.filter((node) => node.kind === kind).map(({ start }) => start);
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
    // MapKey states no key, so its whole heading, (key, package, path, start), is its key, which
    // orders its rows by the map key's text first: the entries' document order is the test's own.
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
  assert.sameDeepMembers(
    [...(yield* db.workload.roundingModeFigures.once(read))].map(({ figures, mode, start }) => ({
      figures,
      mode,
      start,
    })),
    [
      {
        figures: collapsed(" 3 "),
        mode: "significantFigures",
        start: nth("qti-equal-rounded", 0),
      },
      { figures: "2", mode: "decimalPlaces", start: nth("qti-round-to", 0) },
    ],
    "RoundingModeFigures: each rounding operator's figures, collapsed, beside its mode in force",
  );
  assert.sameDeepMembers(
    [...(yield* db.workload.toleranceTokens.once(read))].map(({ at, start, token }) => ({
      at,
      start,
      token,
    })),
    collapsed(" 0.5\tT ")
      .split(" ")
      .map((token, at) => ({ at: BigInt(at), start: nth("qti-equal", 0), token })),
    "ToleranceToken: each tolerance's values, split at XML whitespace",
  );
  assert.sameDeepMembers(
    [...(yield* db.workload.cnCounts.once(read))].map(({ parts, start, type }) => ({
      parts,
      start,
      type,
    })),
    [
      { parts: 2n, start: nth("m:cn", 0), type: "rational" },
      { parts: 1n, start: nth("m:cn", 1), type: "integer" },
      { parts: 1n, start: nth("m:cn", 2), type: "real" },
      { parts: 2n, start: nth("m:cn", 3), type: "rational" },
    ],
    "CnCount: each cn of a listed type, real where it writes none, with one part more than its separators, whatever its base",
  );
  assert.deepStrictEqual(
    [...(yield* db.workload.usageValues.once(read))].map(({ baseType, path: at, text }) => ({
      at,
      baseType,
      text,
    })),
    [{ at: "usage.xml", baseType: "float", text: "0.87" }],
    "UsageValueBaseType: a record's usage value's base type and text, and none outside a record",
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
      "hold each map key, lookup value, catalog id and binding, header token, cell table, tabled header, rounding operator's figures and mode, tolerance value and usage value the package's trees state",
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
