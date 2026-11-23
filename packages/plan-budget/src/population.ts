/**
 * A composition's population at a scale: its seed units, written through the composition's own
 * programs, copied under new unit keys until the installation holds the scale's count of them.
 *
 * A unit is the key a family of rows sits under: a child, whose rows every table with the unit's
 * column holds. Every row of every such table whose unit is a seed unit is copied with its unit
 * renamed, as the superuser with `session_replication_role = replica`, so no capture, judge or law
 * trigger runs: each copy is the seed unit's lawful facts under another unit, which no law can tell
 * from the seed's own. Content, which no unit holds, is not copied. PERF-COMMIT's replicate.sql,
 * generalized from the ledger's `child` to any unit column.
 *
 * @module
 */
import { Effect, Schema } from "effect";
import type pg from "pg";

/**
 * The superuser's copy of the seed units refused.
 */
export class PopulationRefused extends Schema.TaggedError<PopulationRefused>()(
  "PopulationRefused",
  {
    cause: Schema.Unknown,
    step: Schema.String,
  },
) {
  /**
   * The step and the cause.
   */
  override get message(): string {
    return `Growing the population failed at ${this.step}: ${String(this.cause)}`;
  }
}

/**
 * A population's copies: copies `first` to `last` of every seed unit, each named as its seed unit
 * with its `pbseed` replaced by `<prefix><copy>s`, so a unit's spelling (a Clerk user id's `user_`
 * and letters and digits) holds.
 */
export interface Copies {
  readonly prefix: string;
  readonly first: number;
  readonly last: number;
}

/**
 * How a composition's population grows: the copies made on the installation's superuser session,
 * then analyzed. {@link copyUnits} is the copy every composition whose unit is one text column
 * takes; a composition whose unit is not (metis's child, a person under several columns with its
 * user id and assignment numbers, two gapless series each copy continues) states its own.
 */
export type Grow = (admin: pg.Client, copies: Copies) => Effect.Effect<void, PopulationRefused>;

/**
 * The statement that copies the seed units: one INSERT … SELECT per table that holds the unit's
 * column, each table's every column but the unit's copied as it stands.
 */
const copyStatement = `DO $copy$
DECLARE
  t record;
  cols text;
  sel text;
  n bigint;
  total bigint := 0;
BEGIN
  FOR t IN
    SELECT c.oid AS rel, format('%I.%I', ns.nspname, c.relname) AS name
      FROM pg_class c
      JOIN pg_namespace ns ON ns.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = current_setting('plan_budget.unit') AND NOT a.attisdropped
     WHERE c.relkind = 'r' AND c.relpersistence = 'p' AND ns.nspname NOT IN ('pg_catalog', 'information_schema')
       AND ns.nspname NOT LIKE 'pg\\_%'
     ORDER BY 2
  LOOP
    SELECT string_agg(format('%I', attname), ', ' ORDER BY attnum),
           string_agg(CASE WHEN attname = current_setting('plan_budget.unit')
                           THEN format('replace(x.%I::text, ''pbseed'', %L || p.g || ''s'')::%s', attname, current_setting('plan_budget.prefix'), format_type(atttypid, atttypmod))
                           ELSE format('x.%I', attname) END, ', ' ORDER BY attnum)
      INTO cols, sel
      FROM pg_attribute
     WHERE attrelid = t.rel AND attnum > 0 AND NOT attisdropped AND attgenerated = '';
    EXECUTE format('INSERT INTO %s (%s) SELECT %s FROM %s x CROSS JOIN generate_series(%s, %s) AS p(g) WHERE x.%I::text LIKE %L',
                   t.name, cols, sel, t.name, current_setting('plan_budget.first'), current_setting('plan_budget.last'),
                   current_setting('plan_budget.unit'), current_setting('plan_budget.seed'));
    GET DIAGNOSTICS n = ROW_COUNT;
    total := total + n;
  END LOOP;
  RAISE NOTICE 'copied % rows', total;
END
$copy$`;

/**
 * One statement of the copy on the installation's superuser session.
 *
 * @param client - The superuser's session on the installation's database.
 * @param step - What the statement is, for a refusal.
 * @param sql - The statement.
 * @returns Completes once it ran.
 */
const run = (client: pg.Client, step: string, sql: string) =>
  Effect.tryPromise({
    catch: (cause) => new PopulationRefused({ cause, step }),
    try: () => client.query(sql),
  });

/**
 * The copy of every row a unit column holds, then ANALYZE, so the population's statistics are the
 * scale's.
 *
 * @param unit - The unit's column, which every table of a unit's rows holds.
 * @returns The growth: given the superuser's session and the copies, it completes once they are
 *   made and analyzed.
 */
export const copyUnits =
  (unit: string): Grow =>
  (client, copies) =>
    Effect.gen(function* growAt() {
      yield* run(client, "settings", "SET session_replication_role = replica");
      yield* run(client, "settings", `SET plan_budget.unit = '${unit}'`);
      yield* run(client, "settings", "SET plan_budget.seed = '%pbseed%'");
      yield* run(client, "settings", `SET plan_budget.prefix = '${copies.prefix}'`);
      yield* run(client, "settings", `SET plan_budget.first = '${String(copies.first)}'`);
      yield* run(client, "settings", `SET plan_budget.last = '${String(copies.last)}'`);
      yield* run(client, "copy", copyStatement);
      yield* run(client, "settings", "RESET session_replication_role");
      yield* run(client, "analyze", "ANALYZE");
    });
