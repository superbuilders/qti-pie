/**
 * The files an item names that the delivery serves, on the lease's result database: pantry's
 * `ServedFile` and `WithheldFile` (`#pantry/qti/media.ts` listedMedia) serve a named file exactly
 * where its extension, as Node's `path.posix.extname` reads it, without its dot and in ASCII lower
 * case, is one the player's policy lists (`mediaPolicy`), and withhold every other; and the
 * derivation reads the policy once a statement, one equality a file, never a comparison of every
 * file with every extension.
 *
 * The oracle is Node's `path.posix.extname` over each path, apart from the SQL: no extension where
 * the last segment holds no `.`, begins with its only `.` or ends with a `.`, and the text after
 * the last `.` of the last segment otherwise, two dots in a row among them (`..png` is `.png`).
 * Every path is a case of the exhaustive space {@link paths}, each one situation of the oracle's.
 *
 * The work is PostgreSQL's own count, which no load moves: `ServedFile`'s definition as the
 * installed migration states it (the statement its table is created by), run under EXPLAIN ANALYZE
 * in a read-only transaction rolled back, and of it the rows every node over the policy's rows
 * returned, over all its loops. The policy is a closed relation of {@link policySize} rows the
 * statement writes as its values, so reading it once is that many rows whatever the package holds,
 * where the theta join this replaced (a path's ending compared with every extension's) read them
 * once a named file. The bound is that one reading, so no number here is a tuned allowance.
 *
 * @module
 */
import { randomBytes } from "node:crypto";
import path from "node:path";
import { Db } from "@bjornpagen/grizzle/runtime";
import { drawn as drawnBy, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import type { Gen } from "@bjornpagen/testing/gen";
import { array, boolean, characterOf, int, map, string } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, layer } from "@effect/vitest";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import { mediaPolicy } from "@qti-pie/pantry/qti/media.ts";
import { migrationClientOf } from "@qti-pie/pantry/test/file-database.ts";
import {
  Array as Arr,
  ConfigProvider,
  Duration,
  Effect,
  FileSystem,
  Option,
  Record as Rec,
  Ref,
  Schema,
} from "effect";
import type { QueryResultRow } from "pg";
import {
  resultDatabaseOf,
  resultMigrations,
  resultSettingsOf,
} from "#ledger/test/result-database.ts";
import { lease, suiteLayerOf, SuiteLogin } from "#ledger/test/result-suite.ts";

/**
 * The file's copy of the result database (`#ledger/test/result-suite.ts` ResultFile).
 */
const copy = "media_served";

/**
 * This run's package, so a replay of the file meets no package of an earlier run.
 */
const name = `media-served-${randomBytes(6).toString("hex")}`;

/**
 * The item's document, at the package's root, so each file's path is its href.
 */
const ITEM = "item.xml";

/**
 * What the oracle reads of a named file's path, each a situation the drawn packages must reach.
 */
const situations = [
  "served",
  "served, its extension in upper case",
  "withheld, an extension the policy does not list",
  "withheld, no dot in its last segment",
  "withheld, a last segment that begins with its only dot",
  "withheld, a last segment that ends with a dot",
  "a dot in a directory",
  "two dots in a row in its last segment",
] as const;

type Situation = (typeof situations)[number];

/**
 * The extensions the policy lists.
 */
const policyExtensions: readonly string[] = Rec.keys(mediaPolicy);

/**
 * The policy's rows, one an extension.
 */
const policySize = policyExtensions.length;

/**
 * A text in ASCII lower case: each of `A` to `Z` its lower case, every other code unit itself.
 *
 * @param text - The text.
 * @returns It in ASCII lower case.
 */
const asciiLower = (text: string): string =>
  Array.from(text, (character) => {
    const point = character.codePointAt(0) ?? 0;

    return point >= 65 && point <= 90 ? String.fromCodePoint(point + 32) : character;
  }).join("");

/**
 * Whether the policy lists a path's extension, as the oracle reads it: Node's
 * `path.posix.extname` without its dot, in ASCII lower case, served where the policy lists it.
 *
 * @param entry - The path.
 * @returns Whether it is served.
 */
const servedByOracle = (entry: string): boolean =>
  policyExtensions.includes(asciiLower(path.posix.extname(entry).slice(1)));

/**
 * What the oracle says of a path: served or withheld, and why.
 *
 * @param entry - The path.
 * @returns Its verdict's situation.
 */
const verdictOf = (entry: string): Situation => {
  const segment = path.posix.basename(entry);
  const extension = path.posix.extname(entry).slice(1);

  if (servedByOracle(entry)) {
    return extension === asciiLower(extension) ? "served" : "served, its extension in upper case";
  }

  if (extension.length > 0) {
    return "withheld, an extension the policy does not list";
  }

  if (!segment.includes(".")) {
    return "withheld, no dot in its last segment";
  }

  return segment.endsWith(".")
    ? "withheld, a last segment that ends with a dot"
    : "withheld, a last segment that begins with its only dot";
};

/**
 * The situations a path is a case of, read from the path and the oracle alone.
 *
 * @param entry - The path.
 * @returns Its situations.
 */
const situationsOf = (entry: string): readonly Situation[] => [
  verdictOf(entry),
  ...(path.posix.dirname(entry).includes(".") ? (["a dot in a directory"] as const) : []),
  ...(path.posix.basename(entry).includes("..")
    ? (["two dots in a row in its last segment"] as const)
    : []),
];

/**
 * A segment of a path drawn over letters of both cases and the dot, of one to three characters,
 * never `.` or `..`, which name no file.
 */
const segmentOf: Gen<string> = map(
  string(characterOf(["a", "B", "."]), { max: 3, min: 1 }),
  (text) => (text === "." || text === ".." ? `f${text}` : text),
);

/**
 * An extension the policy lists, each of its letters in either case.
 */
const listedOf: Gen<string> = (source) =>
  Array.from(Arr.getUnsafe(policyExtensions, int(0, policySize - 1)(source)), (letter) =>
    boolean(source) ? letter.toUpperCase() : letter,
  ).join("");

/**
 * A named file's path: up to two directories, then a last segment that is a drawn segment, or one
 * that ends with a `.` and an extension the policy lists.
 */
const pathOf: Gen<string> = (source) => {
  const directories = array(segmentOf, { max: 2, min: 0 })(source);
  const last = boolean(source)
    ? `${string(characterOf(["a", "B", "."]), { max: 2, min: 0 })(source)}.${listedOf(source)}`
    : segmentOf(source);

  return [...directories, last === "." || last === ".." ? `f${last}` : last].join("/");
};

/**
 * A package's named files: up to 32 drawn paths, each once, none a directory of another, as a
 * file system holds them.
 */
const packageOf: Gen<readonly string[]> = map(array(pathOf, { max: 32, min: 1 }), (drawn) => {
  const once = Arr.dedupe(drawn);

  return once.filter((entry) => !once.some((other) => other.startsWith(`${entry}/`)));
});

/**
 * How long a case may run before it is a hang: one package published and its item read.
 */
const caseHang = Duration.minutes(2);

/**
 * A node of PostgreSQL's EXPLAIN (ANALYZE, FORMAT JSON), as far as the count reads it.
 */
interface PlanNode {
  readonly "Node Type": string;
  readonly "Actual Rows": number;
  readonly "Actual Loops": number;
  readonly Plans?: readonly PlanNode[];
}

/**
 * The schema of a {@link PlanNode}.
 */
const PlanNodeSchema: Schema.Codec<PlanNode> = Schema.Struct({
  "Actual Loops": Schema.Number,
  "Actual Rows": Schema.Number,
  "Node Type": Schema.String,
  Plans: Schema.optionalKey(
    Schema.Array(Schema.suspend((): Schema.Codec<PlanNode> => PlanNodeSchema)),
  ),
});

/**
 * EXPLAIN (ANALYZE, FORMAT JSON)'s one row, outside data decoded once here.
 */
const ExplainRow = Schema.Struct({
  "QUERY PLAN": Schema.Tuple([Schema.Struct({ Plan: PlanNodeSchema })]),
});

/**
 * Whether a node's subtree reads the policy's values and nothing else.
 *
 * @param node - A plan's node.
 * @returns Whether it does.
 */
const readsPolicyAlone = (node: PlanNode): boolean =>
  node["Node Type"] === "Values Scan" ||
  ((node.Plans ?? []).length > 0 && (node.Plans ?? []).every(readsPolicyAlone));

/**
 * The rows the policy's reads handed the rest of the plan: each topmost node whose subtree reads
 * the policy's values and nothing else (the scan of its values, or a node that rereads or hashes
 * them), its rows over all its loops. Read once, that is the policy's rows; reread once a file,
 * that many times them.
 *
 * @param node - A plan's node.
 * @returns The rows.
 */
const policyRows = (node: PlanNode): number =>
  readsPolicyAlone(node)
    ? node["Actual Rows"] * node["Actual Loops"]
    : (node.Plans ?? []).reduce((sum, child) => sum + policyRows(child), 0);

/**
 * `ServedFile`'s definition, the query its table is created by in the installed migration.
 */
const servedFileDefinition = Effect.gen(function* definition() {
  const fs = yield* FileSystem.FileSystem;
  const root = path.join(resultMigrations, "qti");
  const init = (yield* fs.readDirectory(root)).find((entry) => entry.endsWith("_init"));
  const text = yield* fs.readFileString(path.join(root, init ?? "", "02-structure.sql"));
  const head = 'CREATE TABLE "qti_media"."served_file" ';
  const from = text.indexOf("AS\n", text.indexOf(head)) + "AS\n".length;

  return text.slice(from, text.indexOf("\nWITH NO DATA;", from));
});

/**
 * The rows the nodes over the policy returned while `ServedFile`'s definition ran, on the file's
 * copy of the result database.
 */
const policyWork = Effect.gen(function* work() {
  const statement = yield* servedFileDefinition;

  return yield* Effect.acquireUseRelease(
    migrationClientOf(`${resultDatabaseOf(Option.getOrThrow(lease))}_${copy}`).pipe(
      Effect.provide(
        ConfigProvider.layer(
          ConfigProvider.fromUnknown(resultSettingsOf(process.env, Option.getOrThrow(lease))),
        ),
      ),
      Effect.tap((client) => Effect.promise(() => client.connect())),
    ),
    (client) =>
      Effect.promise(async () => {
        await client.query("BEGIN READ ONLY");
        const explained = await client.query<QueryResultRow>(
          `EXPLAIN (ANALYZE, FORMAT JSON) ${statement}`,
        );
        await client.query("ROLLBACK");

        return explained.rows;
      }).pipe(
        Effect.flatMap(Schema.decodeUnknownEffect(Schema.Tuple([ExplainRow]))),
        Effect.map(([row]) => policyRows(row["QUERY PLAN"][0].Plan)),
      ),
    (client) => Effect.promise(() => client.end()),
  );
});

/**
 * The item of a package naming `entries`: one image of each.
 *
 * @param entries - The paths of the files it names.
 * @returns Its XML.
 */
const itemXmlOf = (entries: readonly string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="media" title="Media" adaptive="false" time-dependent="false"><qti-item-body><p>${entries.map((entry) => `<img src="${entry}" alt="${entry}"/>`).join("")}</p></qti-item-body></qti-assessment-item>`;

/**
 * The manifest of a package naming `entries`: the item's resource listing the item and each file.
 *
 * @param pkg - The package's name, its manifest's identifier.
 * @param entries - The paths of the files it holds.
 * @returns Its XML.
 */
const manifestXmlOf = (pkg: string, entries: readonly string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${pkg}"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="item" type="imsqti_item_xmlv3p0" href="${ITEM}"><file href="${ITEM}"/>${entries.map((entry) => `<file href="${entry}"/>`).join("")}</resource></resources></manifest>`;

/**
 * A package naming `entries`, published through the suite's own `publish`, and its item read as
 * opening reads it (`servedItemOf`): the paths of the files it serves and of those it withholds.
 *
 * @param pkg - The package's name.
 * @param entries - The paths of the files it names.
 * @returns The served and the withheld paths.
 */
const publishedItemOf = (pkg: string, entries: readonly string[]) =>
  Effect.scoped(
    Effect.gen(function* publishPackage() {
      const { suite } = yield* SuiteLogin;
      const fs = yield* FileSystem.FileSystem;
      const dir = yield* fs.makeTempDirectoryScoped({ prefix: `${pkg}-` });
      yield* fs.writeFileString(`${dir}/imsmanifest.xml`, manifestXmlOf(pkg, entries));
      yield* fs.writeFileString(`${dir}/${ITEM}`, itemXmlOf(entries));
      for (const entry of entries) {
        yield* fs.makeDirectory(path.posix.dirname(`${dir}/${entry}`), { recursive: true });
        yield* fs.writeFileString(`${dir}/${entry}`, entry);
      }

      const rows = yield* importRowsOf(yield* readPackage(dir, pkg));
      const db = yield* Db.open(suite.roles.result_runner, {});
      const published = yield* db.workload.publish.once({
        facts: { insert: rows.insert },
        params: { package: rows.package },
      });

      assert.include(["accepted", "unchanged"], published.kind, `${pkg}: published`);

      const found = yield* db.workload.servedItemOf.once({
        facts: {},
        params: { package: pkg, path: ITEM },
      });
      const item = Option.getOrThrowWith(
        Option.fromUndefinedOr(Arr.fromIterable(found)[0]?.item[0]),
        () => new Error(`${pkg}: no item read`),
      );

      return {
        served: new Set(item.files.map((each) => each.path)),
        withheld: new Set(item.withheld.map((each) => each.path)),
      } as const;
    }),
  );

describe.skipIf(Option.isNone(lease))("the files an item names that the delivery serves", () => {
  layer(suiteLayerOf(copy), { excludeTestServices: true })(
    "a named file is served by its extension, as Node reads it, in one equality with the policy",
    (it) => {
      it.effect(
        "serves each file whose extension the policy lists, withholds every other, and reads the policy once",
        (ctx) =>
          Effect.gen(function* everyPackage() {
            const runs = yield* Ref.make(0);

            yield* searched(
              ctx,
              explore(
                {
                  caseHang,
                  coverage: required<Situation>(situations, { cases: 6, sense: notesOnly }),
                  draw: drawnBy(packageOf),
                  kept: [],
                  literal: (entries) => JSON.stringify(entries),
                  oracle: {
                    kind: "second-implementation",
                    name: "servedByOracle: Node's path.posix.extname without its dot, in ASCII lower case, a name of pantry's mediaPolicy",
                  },
                  runs: 6,
                  shrink: completeShrink,
                  steerEvery: 2,
                  suite: "ledger/media-served",
                },
                (entries, c) =>
                  Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                    Effect.flatMap((k) => publishedItemOf(`${name}-${String(k)}`, entries)),
                    Effect.flatMap((item) =>
                      Effect.sync(() => {
                        for (const entry of entries) {
                          for (const situation of situationsOf(entry)) {
                            c.note(situation);
                          }
                          assert.deepStrictEqual(
                            { served: item.served.has(entry), withheld: item.withheld.has(entry) },
                            { served: servedByOracle(entry), withheld: !servedByOracle(entry) },
                            `${entry}: served where Node's extname, without its dot, in ASCII lower case, is the policy's`,
                          );
                        }
                      }),
                    ),
                    Effect.orDie,
                  ),
              ),
            );

            assert.strictEqual(
              yield* policyWork,
              policySize,
              "the definition reads the policy's rows once",
            );
          }).pipe(Effect.orDie),
      );
    },
  );
});
