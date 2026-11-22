/**
 * The include laws the host judge leaves to the database, restated over the import's rows: the
 * queries `PlacedIncludePath`, whose containment into `SiteTarget` is "Include target" for an href
 * naming an entry, and `UnplacedInclude`, whose rows the Delivery verdict reads
 * (`#pantry/qti/overlay-queries/tests.ts`). A rule over a query is PostgreSQL's alone
 * (`#pantry/test/host-judge.ts`), so a test of the import's rows reads these, as
 * `catalog-assembly.test.ts` restates "Catalog reference".
 */
import type { PreviewRows } from "@bjornpagen/grizzle";
import { assert } from "@effect/vitest";
import { Predicate } from "effect";
import { fallbackKind, includeKind } from "#pantry/grammar/include.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import type { Qti } from "#pantry/qti/schema.ts";
import type { UnplacedCause } from "#pantry/qti/tests.ts";
import type { HeldRow } from "#pantry/test/host-judge.ts";

/**
 * A cause of an unplaced include, `UnplacedCause`'s handle.
 */
export type Cause = (typeof UnplacedCause.handles)[number];

/**
 * Read a row's field that holds a text, a position or a flag.
 *
 * @param row - The row.
 * @param field - The field.
 * @returns Its value.
 */
const at = (row: HeldRow, field: string): bigint | boolean | string => {
  const value = row[field];

  return Predicate.isString(value) || Predicate.isBigInt(value) || Predicate.isBoolean(value)
    ? value
    : assert.fail(`the row holds no text, position or flag in ${field}: ${String(value)}`);
};

/**
 * The rows the restatements read, by relation, and an element's place as one text.
 *
 * @param rows - The import's rows as the database holds them.
 * @returns The rows of a relation, and a row's place, read at its own `start` or another field.
 */
const readerOf = (rows: PreviewRows<typeof Qti>) => {
  const view: ReadonlyMap<string, readonly HeldRow[]> = new Map(Object.entries(rows));

  return {
    placeOf: (row: HeldRow, start = "start"): string =>
      keyTextOf(String(at(row, "package")), String(at(row, "path")), String(at(row, start))),
    rowsOf: (relation: string): readonly HeldRow[] => view.get(relation) ?? [],
  };
};

/**
 * Each include an `xi:fallback` node's parent is, and each `SiteTarget`, by place.
 *
 * @param rows - The import's rows.
 * @returns The places.
 */
const placesOf = (rows: PreviewRows<typeof Qti>) => {
  const { placeOf, rowsOf } = readerOf(rows);

  return {
    fallbacks: new Set(
      rowsOf("Node")
        .filter((row) => at(row, "kind") === fallbackKind)
        .map((row) => placeOf(row, "parent")),
    ),
    targets: new Set(rowsOf("SiteTarget").map((row) => placeOf(row))),
  };
};

/**
 * Each include's `SitePath` naming an entry, with whether it holds an `xi:fallback` and whether a
 * `SiteTarget` stands at its place.
 *
 * @param rows - The import's rows.
 * @returns The rows, with their fallbacks and targets.
 */
const entryIncludesOf = (rows: PreviewRows<typeof Qti>) => {
  const { placeOf, rowsOf } = readerOf(rows);
  const { fallbacks, targets } = placesOf(rows);

  return rowsOf("SitePath")
    .filter((row) => at(row, "entry") === true && at(row, "kind") === includeKind)
    .map((row) => ({
      fallback: fallbacks.has(placeOf(row)),
      row,
      targeted: targets.has(placeOf(row)),
    }));
};

/**
 * Restate "Include target"'s containment of `PlacedIncludePath` into `SiteTarget`: each include
 * naming an entry, holding no `xi:fallback`, that names no document, by its `SitePath` row.
 *
 * @param rows - The import's rows.
 * @returns The rows that break the containment.
 */
export const includeTargetBreachesOf = (rows: PreviewRows<typeof Qti>): readonly HeldRow[] =>
  entryIncludesOf(rows).flatMap(({ fallback, row, targeted }) =>
    fallback || targeted ? [] : [row],
  );

/**
 * Restate "Include target" for a package: whether any include breaks it
 * ({@link includeTargetBreachesOf}).
 *
 * @param rows - The import's rows.
 * @returns Whether the containment breaks.
 */
export const breaksIncludeTarget = (rows: PreviewRows<typeof Qti>): boolean =>
  includeTargetBreachesOf(rows).length > 0;

/**
 * Restate `UnplacedInclude`'s four rules, each include's cause, sorted: `external`, an external
 * include's `Site`; `fallback`, an include naming an entry, holding an `xi:fallback`, with no
 * `SiteTarget`; `root`, an `Inclusion` that places nothing; `context`, a `SiteTarget` under another
 * nearest interaction than its target's rows.
 *
 * @param rows - The import's rows.
 * @returns The causes.
 */
export const unplacedCausesOf = (rows: PreviewRows<typeof Qti>): readonly Cause[] => {
  const { rowsOf } = readerOf(rows);

  return [
    ...rowsOf("Site")
      .filter((row) => at(row, "external") === true && at(row, "kind") === includeKind)
      .map((): Cause => "external"),
    ...entryIncludesOf(rows)
      .filter(({ fallback, targeted }) => fallback && !targeted)
      .map((): Cause => "fallback"),
    ...rowsOf("Inclusion")
      .filter((row) => at(row, "places") === false)
      .map((): Cause => "root"),
    ...rowsOf("SiteTarget")
      .filter(
        (row) =>
          !(
            (at(row, "nearestKind") === "document" &&
              at(row, "targetNearestKind") === "document") ||
            (at(row, "path") === at(row, "targetNearestPath") &&
              at(row, "nearest") === at(row, "targetNearest") &&
              at(row, "nearestKind") === at(row, "targetNearestKind"))
          ),
      )
      .map((): Cause => "context"),
  ].toSorted();
};
