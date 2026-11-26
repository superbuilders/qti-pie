/**
 * The served slice: GRADING-SQL's served proof, 2,790 cases over the 190 template items of plate's
 * recording, graded once by the SQL grader through the app's real path (the befores, frozen into
 * the oracle's corpus as `served/`). It is the SQL grader's regression baseline and the only
 * source of the ledger's credit and status for these lines.
 *
 * The served worker seeded a case by its index within its worker's shard, not by the recording's
 * decision seed (served-gate.ts `seedOf`), and dealt packages to `SERVED_SHARDS` = 2 shards,
 * largest first onto the lighter shard (served.sh). This module reproduces both, so a templated
 * line's draws compare with the before's exactly.
 *
 * @module
 */
import { Schema } from "effect";
import { RecordedValuesSchema } from "#processing-oracle/recording.ts";

/**
 * The shard count every served before ran with.
 */
export const servedShards = 2;

/**
 * One step's responses, as the served cases write them.
 */
const StepSchema = Schema.Struct({ responses: RecordedValuesSchema });

/**
 * One served case: its id (`<set>|<item>|<decision seed>|<case name>`), the served package (`a-`
 * and the document's SHA-256) and path, and its one step (`metis`) or its steps in order.
 */
export const ServedCaseSchema = Schema.Union([
  Schema.Struct({
    case: Schema.String,
    metis: StepSchema,
    package: Schema.String,
    path: Schema.String,
  }),
  Schema.Struct({
    case: Schema.String,
    package: Schema.String,
    path: Schema.String,
    steps: Schema.Array(StepSchema),
  }),
]);

/**
 * One served case.
 */
export type ServedCase = typeof ServedCaseSchema.Type;

/**
 * A served case's steps' responses, in order.
 *
 * @param c The case.
 * @returns Each step's responses.
 */
export const stepsOf = (c: ServedCase): readonly (typeof StepSchema.Type)[] =>
  "metis" in c ? [c.metis] : c.steps;

/**
 * A served case's line ids: the case's own for one step, `<case>#<step>` for each of several.
 *
 * @param c The case.
 * @returns Each step's line id.
 */
export const lineIdsOf = (c: ServedCase): readonly string[] =>
  "metis" in c ? [c.case] : c.steps.map((_, step) => `${c.case}#${String(step)}`);

/**
 * The decision seed the served worker gave the case at index `k` of its shard: the v4 UUID whose
 * first group is `k + 1` in eight hex digits.
 *
 * @param k The case's index within its shard.
 * @returns The decision seed.
 */
export const servedDecisionSeed = (k: number): string =>
  `${(k + 1).toString(16).padStart(8, "0")}-0000-4000-8000-000000000000`;

/**
 * Each case's decision seed, as the served run dealt and seeded them: the cases grouped by package
 * in first-seen order, the groups taken largest first (a stable sort, ties in first-seen order),
 * each dealt to the shard holding the fewest cases so far (the first such), and each case seeded by
 * its index within its shard.
 *
 * @param cases The cases, in the case file's order.
 * @returns Each case's decision seed, by case id.
 */
export const servedSeeds = (cases: readonly ServedCase[]): ReadonlyMap<string, string> => {
  const byPackage = new Map<string, ServedCase[]>();
  for (const c of cases) {
    const group = byPackage.get(c.package);
    if (group === undefined) {
      byPackage.set(c.package, [c]);
    } else {
      group.push(c);
    }
  }

  const shards: ServedCase[][] = Array.from({ length: servedShards }, () => []);
  for (const group of [...byPackage.values()].toSorted((a, b) => b.length - a.length)) {
    let lightest = 0;
    for (const [at, shard] of shards.entries()) {
      if (shard.length < (shards[lightest]?.length ?? 0)) {
        lightest = at;
      }
    }
    const shard = shards[lightest];
    for (const c of shard === undefined ? [] : group) {
      shard?.push(c);
    }
  }

  return new Map(
    shards.flatMap((shard) => shard.map((c, k) => [c.case, servedDecisionSeed(k)] as const)),
  );
};

/**
 * One credit row of a before: what the attempt earned of the maximum and the kind.
 */
const BeforeCreditSchema = Schema.Struct({
  earned: Schema.Number,
  kind: Schema.Literals(["full", "none", "partial"]),
  maximum: Schema.Number,
});

/**
 * One line of a before: a graded step (its outcomes, credit rows, status `final` with nothing
 * pending: the slice holds no recorded operator), or a step the run never graded, with why.
 */
export const BeforeLineSchema = Schema.Union([
  Schema.Struct({
    case: Schema.String,
    credit: Schema.Array(BeforeCreditSchema),
    error: Schema.Null,
    outcomes: RecordedValuesSchema,
    pending: Schema.Tuple([]),
    status: Schema.Literal("final"),
  }),
  Schema.Struct({ case: Schema.String, error: Schema.String, outcomes: Schema.Null }),
]);

/**
 * One line of a before.
 */
export type BeforeLine = typeof BeforeLineSchema.Type;

/**
 * Why the served run left a step ungraded where the package's publication refused it: a
 * publication refusal, not grading (MODULE-HELD's packages whose module is no file of theirs), so
 * the oracle excludes the step rather than grading what never published.
 */
export const unpublished = "package not published";
