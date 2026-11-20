/**
 * Give an item's record and values back from a record of it, so the host can render the item
 * again as the candidate left it: {@link restore}.
 *
 * @module
 */
import { pipe, Result } from "effect";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Responses } from "#plate/model/values.ts";
import { belonging, fitting, templatesHeld } from "#plate/score.ts";
import type { InvalidRecord, RecordMismatch } from "#plate/score.ts";
import { shownThrough } from "#plate/solution.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * What {@link restore} gives back for an item: the record, and the values its controls
 * show again.
 */
export interface Restored {
  /**
   * The record, its template values and the correct responses and defaults its template
   * processing set included. The host passes it to `redact`, `checkResponses` and `solution`,
   * each of which reads only the part it needs and none the seed.
   *
   * It is server data: its template values and correct responses can give the answers away, so the
   * host keeps it where only the server reads it and never sends it to the page.
   */
  readonly record: ItemRecord;
  /**
   * The record's responses by identifier, NULL included, to show as the item's responses: its
   * `responses`, and each record response's record from its `records`, which the control bound to
   * it shows as its `stringValue`. A response an interaction module binds holds what the module's
   * `restore` shows for the stored value (`shownThrough` in `#plate/solution.ts`).
   */
  readonly values: Responses;
}

/**
 * Give back an item's record and the values its controls showed.
 *
 * The record is checked against the item as `results` checks it: it belongs to the item, and each
 * response it holds is one the item scores, and each outcome one the item declares, each of its
 * declaration's base type and cardinality, and each record it holds one of a record response the
 * item declares, so another item's record, or values the item's controls cannot hold, are refused
 * rather than given back. Then, as `score` checks it, a record of an item whose template processing
 * runs must hold a value for each template variable the item declares, as every record `begin` or
 * `score` writes for it does (`templatesHeld` in `#plate/score.ts`).
 *
 * The record alone does not say how to show the item again. Its `instance` is the one `begin`
 * started it with, or `""` for a record `score` started for an item scored without one, and need
 * not be the instance the item was shown with. So for an item delivered on its own the host keeps,
 * beside the record, the instance it passed `<Item>` and the configuration it showed the item
 * with, whose `seed` keys a shuffled Choice's order, and shows the restored values with both, so
 * the ids and the choice order are the ones the candidate saw.
 *
 * @example
 *   const restored = restore(accepted, stored);
 *   // Result.succeed({ record, values }); then <Item record={record} values={values} … /> in review
 *
 * @param document The document `checkAdmitted` accepted, the item the record is for.
 * @param record The record `begin` or the last `score` of the item returned.
 * @returns The record and its responses, record responses among them, each a module's
 *   interaction binds through its `shown`, as {@link Restored};
 *   {@link InvalidRecord} for a record the renderer could not have written: the
 *   first response, then the first outcome, then
 *   the first template value, correct response or default, that does not fit its declaration, or,
 *   for an item whose template processing runs, the first declared template variable it holds no
 *   value for; or {@link RecordMismatch} for another item's record.
 */
export const restore = (
  document: Accepted,
  record: ItemRecord,
): Result.Result<Restored, InvalidRecord | RecordMismatch> =>
  pipe(
    belonging(document.item, record),
    Result.flatMap((belonged) => fitting(document.item, belonged)),
    Result.flatMap((fitted) => templatesHeld(document.item, fitted)),
    Result.map((fit) => ({
      record: fit,
      values: shownThrough(document.item, { ...fit.responses, ...fit.records }),
    })),
  );
