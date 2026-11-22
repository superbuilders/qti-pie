/**
 * Give an item's record and values back from a record of it, so the host can render the item
 * again as the candidate left it: {@link restore}.
 *
 * @module
 */
import type { ItemRecord } from "#plate/model/record.ts";
import type { Responses } from "#plate/model/values.ts";
import { shownThrough } from "#plate/solution.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * What {@link restore} gives back for an item: the record, and the values its controls
 * show again.
 */
export interface Restored {
  /**
   * The record, its template values and the correct responses and defaults its template
   * processing set included. The host passes it to `redact` and `solution`, each of which reads
   * only the part it needs and none the seed.
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
 * The record is the QTI database's: the values its statement returned for the attempt shown, each
 * of its variable's declared type, which the ledger's laws hold. Plate re-checks none of it.
 *
 * The record alone does not say how to show the item again. Its `instance` need not be the
 * instance the item was shown with. So for an item delivered on its own the host keeps, beside the
 * record, the instance it passed `<Item>` and the configuration it showed the item with, whose
 * `seed` keys a shuffled Choice's order, and shows the restored values with both, so the ids and
 * the choice order are the ones the candidate saw.
 *
 * @example
 *   const restored = restore(accepted, record);
 *   // { record, values }; then <Item record={record} values={values} … /> in review
 *
 * @param document The document `checkAdmitted` accepted, the item the record is for.
 * @param record The record of the attempt shown, as the database returned it.
 * @returns The record and its responses, record responses among them, each a module's
 *   interaction binds through its `shown`, as {@link Restored}.
 */
export const restore = (document: Accepted, record: ItemRecord): Restored => ({
  record,
  values: shownThrough(document.item, { ...record.responses, ...record.records }),
});
