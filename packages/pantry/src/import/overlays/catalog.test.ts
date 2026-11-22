/**
 * The catalog builder's free tests: over a document of a known structure `rowsOf` gives each
 * catalog that writes an `id` its `CatalogId`, as the document's own construction says (spec
 * reading R9-a), and `placedCatalogRowsOf` each catalog's binding in an assembly its
 * `AssembledCatalog`. A card's `support`, an entry's `default` and a reference's tokens have no
 * row: the database selects each attribute's `value` and each reference's `Idref` pieces, and
 * joins a reference to the instances that place its document.
 *
 * The expected rows are written by hand from each document's construction, so no expected row is
 * computed by the builder's own reading. The database tests judge the rows through PostgreSQL.
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { composed } from "#pantry/grammar/compose.ts";
import type { DocumentContext } from "#pantry/import/context.ts";
import { keyTextOf, textDigestOf } from "#pantry/import/key-text.ts";
import { placedCatalogRowsOf, rowsOf } from "#pantry/import/overlays/catalog.ts";
import { shredGrammarOf } from "#pantry/model/composed.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { shred } from "#pantry/model/shred.ts";
import { flatten } from "#pantry/model/xdm.ts";
import type { XdmDocument } from "#pantry/model/xdm.ts";
import { flatDocumentOf, ownViewOf, viewOf } from "#pantry/import/fold.ts";

/**
 * The QTI 3.0 assessment namespace.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * Find the first node of a kind in a document's rows.
 *
 * @param nodes - The document's nodes.
 * @param kind - The kind.
 * @returns The node.
 * @throws {Error} When the document holds none: a defect of the test's markup.
 */
const nodeOf = <N extends { readonly kind: string }>(nodes: readonly N[], kind: string): N => {
  const node = nodes.find((candidate) => candidate.kind === kind);
  if (node === undefined) {
    throw new Error(`The test's document holds no ${kind}; write one in its markup.`);
  }

  return node;
};

/**
 * The grammar shred reads each document by.
 */
const shredGrammar = shredGrammarOf(Result.getOrThrow(composed()));

/**
 * Shred an item whose catalog info is the given markup.
 *
 * @param catalogs - The `qti-catalog` children of the item's catalog info.
 * @param body - The item body's markup, empty where none is given.
 * @returns The item's tree.
 */
const itemOf = (catalogs: string, body = "") =>
  Effect.gen(function* shredsItem() {
    const xml = yield* readXml(
      new TextEncoder().encode(
        `<qti-assessment-item xmlns="${asi}" identifier="item" title="Item" time-dependent="false"><qti-item-body>${body}</qti-item-body><qti-catalog-info>${catalogs}</qti-catalog-info></qti-assessment-item>`,
      ),
    );

    return yield* shred(xml, shredGrammar);
  });

/**
 * Name each element of a catalog by the order it is met in among its kind: `qti-catalog#0`,
 * `qti-card#1` and so on, the document node `#doc`.
 *
 * @param tree - The tree.
 * @returns Each node's name, by its start.
 */
const namesOf = (tree: XdmDocument<Composed>): ReadonlyMap<bigint, string> => {
  const rows = flatten(tree);
  const seen = new Map<string, number>();

  return new Map(
    rows.nodes.map(({ kind, start }): readonly [bigint, string] => {
      if (start === 0n) {
        return [start, "#doc"];
      }

      const at = seen.get(kind) ?? 0;
      seen.set(kind, at + 1);

      return [start, `${kind}#${String(at)}`];
    }),
  );
};

/**
 * The item's place in its package, as the builder reads it.
 */
const place = { package: "P", path: "item.xml" } as const;

/**
 * The text of the key of a row keyed by an element of the item, as the builder keys it.
 *
 * @param start - The element's start.
 * @returns The text of `(package, path, start)`.
 */
const keyAt = (start: bigint): string => keyTextOf(place.package, place.path, start);

describe("import/overlays/catalog.ts, rowsOf", () => {
  it.effect("gives a card's support, an entry's default and a reference no row", () =>
    Effect.gen(function* cards() {
      const rows = rowsOf(
        ownViewOf(
          yield* itemOf(
            `<qti-catalog><qti-card support="spoken"><qti-card-entry default="true"><qti-html-content/></qti-card-entry><qti-card-entry default=" 1 "/></qti-card></qti-catalog>`,
            `<p data-catalog-idref="A">a</p>`,
          ),
        ),
        place,
      );

      assert.deepStrictEqual(rows, { CatalogId: new Map() });
    }),
  );

  it.effect(
    "writes each row by its node's place alone, whatever context the document is read in",
    () =>
      Effect.gen(function* byPlace() {
        const tree = yield* itemOf(`<qti-catalog id="A"/>`, `<p data-catalog-idref="A">a</p>`);
        const document = flatDocumentOf(tree);
        const context: DocumentContext = {
          ancestry: new Set(),
          nearest: 9999n,
          nearestKind: "document",
          nearestPath: Option.some("other.xml"),
        };
        const own = rowsOf(ownViewOf(tree), place);
        const placed = rowsOf(viewOf(tree, document, context), place);

        assert.strictEqual(own.CatalogId.size, 1);
        assert.deepStrictEqual(placed, own);
      }),
  );
});

describe("import/overlays/catalog.ts, rowsOf, catalogs", () => {
  it.effect("gives each catalog its id as written and trimmed", () =>
    Effect.gen(function* catalogRows() {
      const tree = yield* itemOf(
        `<qti-catalog id="A"><qti-card support="spoken"/></qti-catalog><qti-catalog id=" B "><qti-card support="spoken"/></qti-catalog>`,
        `<p data-catalog-idref="A">a</p><p data-catalog-idref=" B ">b</p><p id="p1">c</p>`,
      );
      const rows = rowsOf(ownViewOf(tree), place);
      const names = namesOf(tree);
      const nameOf = (start: bigint): string => names.get(start) ?? String(start);

      assert.deepStrictEqual(
        [...rows.CatalogId.values()]
          .map(({ id, owner, start }) => `${nameOf(start)} = ${id} (${nameOf(owner)})`)
          .toSorted(),
        ["qti-catalog#0 = A (qti-catalog#0)", "qti-catalog#1 = B (qti-catalog#1)"],
      );
    }),
  );

  it.effect("gives a catalog with no id no CatalogId", () =>
    Effect.gen(function* noId() {
      const rows = rowsOf(
        ownViewOf(
          yield* itemOf(
            `<qti-catalog><qti-card support="spoken"/></qti-catalog>`,
            `<p id="p1">c</p>`,
          ),
        ),
        place,
      );

      assert.strictEqual(rows.CatalogId.size, 0);
    }),
  );

  it.effect("writes each catalog id at its element", () =>
    Effect.gen(function* tuple() {
      const tree = yield* itemOf(`<qti-catalog id="A"/>`, `<p data-catalog-idref=" A ">a</p>`);
      const flat = flatten(tree);
      const catalog = nodeOf(flat.nodes, "qti-catalog");
      const rows = rowsOf(ownViewOf(tree), place);

      assert.deepStrictEqual(rows.CatalogId.get(keyAt(catalog.start)), {
        ...place,
        id: "A",
        owner: catalog.start,
        start: catalog.start,
      });
    }),
  );
});

describe("import/overlays/catalog.ts, placedCatalogRowsOf", () => {
  const pkg = "P";
  const assembly = "item.xml";
  const item = "item.xml";
  const catalogStart = 3n;
  const otherStart = 4n;
  const catalogs = [
    { id: "C", owner: catalogStart, package: pkg, path: item, start: catalogStart },
  ];

  it("writes one AssembledCatalog for an assembly's id a catalog owns, and none for another owner", () => {
    const rows = placedCatalogRowsOf({
      assembledIds: [
        { assembly, id: "C", instance: 0n, owner: catalogStart, package: pkg, path: item },
        { assembly, id: "C", instance: 1n, owner: catalogStart, package: pkg, path: item },
        { assembly, id: "other", instance: 0n, owner: otherStart, package: pkg, path: item },
      ],
      catalogs,
    });

    assert.deepStrictEqual(
      [...rows.AssembledCatalog.values()],
      [
        {
          assembly,
          id: "C",
          idDigest: textDigestOf("C"),
          owner: catalogStart,
          package: pkg,
          path: item,
        },
      ],
    );
  });

  it("writes nothing for a package with no assembly", () => {
    assert.strictEqual(
      placedCatalogRowsOf({ assembledIds: [], catalogs }).AssembledCatalog.size,
      0,
    );
  });
});
