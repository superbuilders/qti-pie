/**
 * The relations an import writes, as `#pantry/import/roster.ts` commits them, held to the schema
 * and to what the builders and the writer do with a real package: the list is exactly grizzle's
 * `insertableNamesOf(Qti)`, every relation a builder writes is one the roster names, every relation
 * the roster names is one a builder writes, and the ChangeSet inserts each once.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { ChangeSet, insertableNamesOf } from "@bjornpagen/grizzle";
import { Effect, Schema } from "effect";
import { overlayPartsOf } from "#pantry/import/overlays/index.ts";
import { readProgram } from "#pantry/import/program.ts";
import { documentLayerNames, overlayRelations, writtenRelations } from "#pantry/import/roster.ts";
import { documentRowsOf, packageFactsOf } from "#pantry/import/write.ts";
import { Author } from "#pantry/qti/roles.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { everyRelationPackage, scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { nameOf } from "#pantry/test/package-name.ts";

/**
 * The relations each member of a ChangeSet's Description inserts, as its `desc` holds them.
 */
const InsertedRelations = Schema.Struct({
  desc: Schema.Struct({
    strata: Schema.Array(
      Schema.Struct({
        members: Schema.Array(
          Schema.Struct({ op: Schema.Literal("insert"), relation: Schema.String }),
        ),
      }),
    ),
  }),
});

/**
 * Sort names by their code points.
 *
 * @param names - The names.
 * @returns The names, sorted.
 */
const sortedNames = (names: Iterable<string>): readonly string[] =>
  [...names].toSorted((x, y) => (x < y ? -1 : Number(x > y)));

/**
 * Every relation an import writes directly, the roster's, in code point order.
 */
const writtenNames = sortedNames(Object.keys(writtenRelations));

/**
 * Every overlay's relation the roster names, in code point order.
 */
const overlayNames = sortedNames(Object.keys(overlayRelations));

/**
 * The every-relation package, read: its program, every overlay builder's parts and each document's
 * document-layer rows.
 */
const everyRelation = Effect.gen(function* everyRelation() {
  const dir = yield* scopedPackage(everyRelationPackage({ choices: 3, hotspots: 2, hottexts: 2 }));
  const program = yield* readProgram(dir, nameOf(dir));
  const parts = overlayPartsOf(program.documents);
  const layers = program.documents.map(documentRowsOf);

  return { layers, parts, program };
});

layer(NodeServices.layer)("the roster", (it) => {
  it.effect(
    "lists exactly the relations insertAll takes over Qti, so none is missing and none is stale",
    () =>
      Effect.sync(() => {
        const insertable = sortedNames(insertableNamesOf(Qti));

        assert.deepStrictEqual(
          [...writtenNames],
          insertable,
          "The import's committed roster (src/import/roster.ts writtenRelations) differs from the relations insertAll takes over Qti, as grizzle's insertableNamesOf lists them over the composed schema: list each name the schema adds and delete each it no longer has.",
        );
        assert.includeMembers(
          [...insertable],
          [...documentLayerNames],
          "the document layer's names are among Qti's stored relations, so a renamed layer relation fails here too",
        );
      }),
  );

  it.effect(
    "names exactly the relations the overlay builders write, so none is dropped or left unwritten",
    () =>
      Effect.gen(function* builders() {
        const { parts } = yield* everyRelation;
        const written = new Set(parts.flatMap((part) => Object.keys(part)));

        assert.deepStrictEqual(
          sortedNames(written),
          [...overlayNames],
          "the builders return their every relation, empty or not, so the keys of their parts over the every-relation package are the relations they write: a builder relation the roster lacks would be dropped by the merge, and a roster name no builder writes would have no rows to insert",
        );
      }).pipe(Effect.scoped),
  );

  it.effect(
    "inserts each written relation once, and its inputs are exactly the written relations",
    () =>
      Effect.gen(function* inserts() {
        const { program } = yield* everyRelation;
        const { desc } = Schema.decodeUnknownSync(InsertedRelations)(
          ChangeSet.empty(Author).insertAll(packageFactsOf(program.inputs)),
        );
        const inserted = desc.strata.flatMap(({ members }) =>
          members.map(({ relation }) => relation),
        );

        assert.deepStrictEqual(sortedNames(Object.keys(program.inputs)), [...writtenNames]);
        assert.deepStrictEqual(sortedNames(inserted), [...writtenNames]);
        assert.strictEqual(new Set(inserted).size, inserted.length);
      }).pipe(Effect.scoped),
  );
});
