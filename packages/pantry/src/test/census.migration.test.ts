/**
 * The census of the committed migrations (plan-qti-pie Q6.02): the `_init` folder drafted from
 * nothing, then each folder a change of the live QTI database has added since, in the order grizzle
 * applies them (its repins and schema changes). Beside them stand the snapshot's two files,
 * `served/` and `openapi/`, which hold the author login's served workload (`#pantry/db/served.ts`)
 * and its OpenAPI document as `grizzle generate` writes them. Its census, taken by
 * `#pantry/test/census.ts`, meets fin.md §13's zero targets except the validate files and
 * constraint triggers. The test states no count of tables or triggers, which are the schema's, not
 * targets. It lands with the migration it reads, so it is a file of its own: the census's parser
 * and its targets are `census.test.ts`'s, which need no migration.
 */
import { regex } from "arkregex";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { Effect, FileSystem } from "effect";
import { Qti } from "#pantry/qti/schema.ts";
import { censusOf, qtiMigrations } from "#pantry/test/census.ts";

/**
 * Count the schema's members of one kind.
 *
 * @param kind - `closed` for a roster.
 * @returns How many members `Qti` holds of that kind.
 */
const membersOf = (kind: "closed"): number =>
  Object.values(Qti.relations).filter((member) => member.kind === kind).length;

describe("the committed migration", () => {
  /**
   * Oracle: the specification as a checker, fin.md §13's zero targets (the ones
   * `census.test.ts` states as predicates), over the committed migration's census; the
   * schema's own rosters for the names constants (one per roster). The folder holds no data
   * step, so the zero target for inserts holds.
   * Bound: the committed migrations.
   */
  const committedCensus = Effect.gen(function* committedCensus() {
    const fs = yield* FileSystem.FileSystem;
    const entries = (yield* fs.readDirectory(qtiMigrations)).toSorted();
    const served = (yield* fs.readDirectory(`${qtiMigrations}/served`)).toSorted();
    const openapi = (yield* fs.readDirectory(`${qtiMigrations}/openapi`)).toSorted();
    const held = yield* censusOf(qtiMigrations);

    const folders = entries.slice(0, -4);
    assert.isAbove(folders.length, 0, entries.join(", "));
    assert.match(folders[0] ?? "", regex("^\\d{14}_init$", "u"));
    for (const folder of folders) {
      assert.match(folder, regex("^\\d{14}_[a-z0-9]+(?:[_-][a-z0-9]+)*$", "u"), entries.join(", "));
    }
    assert.deepStrictEqual(entries.slice(-4), [
      "manifest.json",
      "openapi",
      "served",
      "snapshot.json",
    ]);
    assert.deepStrictEqual(served, ["author_app.json"], "the author login's one served file");
    assert.deepStrictEqual(openapi, ["author_app.json"], "the author login's one OpenAPI document");
    assert.deepStrictEqual(
      {
        enums: held.enums,
        inserts: held.seed.inserts,
        lawFunctions: held.functions.law,
        laws: held.laws.total,
        policies: held.policies.total,
        repeatedDomains: held.domains.checked - held.domains.distinct,
        seedFolders: held.seed.folders,
        seededRelations: Object.keys(held.seed.rows).length,
      },
      {
        enums: 0,
        inserts: 0,
        lawFunctions: 0,
        laws: 0,
        policies: 0,
        repeatedDomains: 0,
        seedFolders: 0,
        seededRelations: 0,
      },
    );
    assert.strictEqual(held.functions.names, membersOf("closed"), "a names constant per roster");
    assert.strictEqual(
      held.functions.live,
      membersOf("closed"),
      "a live-codes constant per roster",
    );
  }).pipe(Effect.provide(NodeServices.layer));

  it.effect(
    "are the _init folder drafted from nothing and the folders added since, its snapshot's two files and the author login's served file and OpenAPI document, and meet the zero targets but validate files and constraint triggers",
    () => committedCensus,
  );
});
