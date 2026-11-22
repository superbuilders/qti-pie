/**
 * The session record: the values the QTI database returns for the attempt a page shows, which
 * plate renders and derives nothing from.
 *
 * @module
 */
import type { RecordValue, Value } from "#plate/model/values.ts";

/**
 * One item session's values as the QTI database returned them for the attempt a page shows, each
 * value of base type integer an exact `bigint`, by the identifier of the variable it belongs to.
 *
 * `attempt` is `none` before any response processing of the attempt shown and `submitted` once the
 * database's has run in it. `responses` and `outcomes` hold the attempt's values (before the first
 * attempt, each at the start the database gives it, the built-in `completionStatus` among the
 * outcomes), and `records` each record response's value beside `responses`. `templates` holds the
 * item session's template values, and `correct` and `defaults` the correct responses and defaults
 * its template processing set, which the database ran at the take.
 *
 * The record is server data. Its template values and correct responses can give the answers away,
 * so keep it where only the server reads it, never in the page.
 */
export interface ItemRecord {
  readonly attempt: "none" | "submitted";
  readonly correct: { readonly [identifier: string]: Value };
  readonly defaults: { readonly [identifier: string]: Value };
  readonly outcomes: { readonly [identifier: string]: Value };
  readonly records: { readonly [identifier: string]: RecordValue };
  readonly responses: { readonly [identifier: string]: Value };
  readonly templates: { readonly [identifier: string]: Value };
}

/**
 * The part of an {@link ItemRecord} `redact` reads: what the page shows an item by. It holds no
 * seed, so nothing redacted can redraw the values.
 *
 * `templates` show or hide template content and choices, and `outcomes` give the printed
 * variables their values. `attempt` says whether response processing has run in the attempt the
 * page shows: once it has (`submitted`), the item's feedback follows `outcomes`, and its modal
 * feedback may show, since modal feedback "is shown to the candidate directly following response
 * processing" (the information model's ModalFeedback, section 5.93). Before it has (`none`), the
 * page is the item body as the attempt starts (section 7.19.3, `allow-review`: "the visibility of
 * any integrated feedback determined by the default values of the outcome variables"), so its
 * integrated feedback follows the outcomes' start values, which the database's record holds in
 * `outcomes`, and no modal feedback shows.
 */
export type RedactRecord = Pick<ItemRecord, "attempt" | "defaults" | "outcomes" | "templates">;

/**
 * The part of an {@link ItemRecord} `solution` reads: the correct responses template processing
 * set. It holds no seed.
 */
export type SolutionRecord = Pick<ItemRecord, "correct">;
