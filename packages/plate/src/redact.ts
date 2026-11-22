/**
 * The redaction an author calls: {@link redact}, which copies an accepted item into the form a
 * page may know. The server shell (`<Item>`, `@qti-pie/plate/ui`) calls it itself, so a host
 * passes it the accepted item and never a `Redacted`, and `postings` reads an accepted item's
 * response bindings without printing it.
 *
 * @module
 */
import type { RedactRecord } from "#plate/model/record.ts";
import { redactItem } from "#plate/redact/walk.ts";
import type { Redacted, RedactOptions } from "#plate/redact/walk.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * Copy an accepted document's item into the form the page may know: its body, title and language,
 * shown as the record's template values and outcome values say, without its correct responses,
 * mappings, processing or template rules. A response keeps its default where an interaction the
 * page shows starts at it, the value the candidate sees as the attempt starts (spec reading 183),
 * which `postings` gives as the entries a fresh attempt starts from (`Posting.start`).
 *
 * A printed variable prints the value `record` holds for it, a template value else an outcome
 * value, formatted as its attributes say; NULL prints nothing, and one whose value `record` does
 * not hold shows the notice `qti-printed-variable`. A template block or inline, and a choice with
 * a `template-identifier`, is shown or hidden by the template value `record` holds: a hidden choice
 * is absent from its interaction. A `param` whose `value` names a `param-variable` template
 * variable passes that variable's value. One whose template value `record` does not hold is
 * withheld: a block, an inline or a `param` shows its notice, and a choice is absent.
 *
 * Feedback is shown as the information model says (FeedbackBlock 5.49, FeedbackInline 5.52,
 * ModalFeedback 5.93): a feedback element shows when its outcome variable's value matches, or
 * contains, its `identifier` under `show-hide="show"`, and when it does not under `hide`. Once
 * response processing has run in the record's attempt (`attempt` `submitted`), the record's
 * outcomes decide it, and each modal feedback they show follows the body; before, the page is the
 * body as the attempt starts, its block and inline feedback decided by the outcomes' starting
 * values (section 7.19.3), and no modal feedback shows. A feedback block or inline the values show
 * leaves its content in its place and one they hide nothing, so hidden feedback never reaches the
 * page, and an interaction inside hidden feedback posts nothing. One whose outcome `record` holds
 * no value of shows its notice, `qti-feedback-block` or `qti-feedback-inline`. So after `score`,
 * `restore` the record it returned and redact with it: the page then shows the feedback the
 * attempt's outcomes set, in any mode.
 *
 * A printed variable or a parameter on content the page sees whose text would pass 1,000,000
 * characters (a conversion wider than that, or a whole text longer) prints nothing, and the
 * redacted item's `unprinted` names the first, with that bound and the limit `"text"`, so the page
 * refuses the item rather than show the slot blank (`OutputTooLarge`, which `<Item>` throws).
 * Content the page does not see is never printed, so it never fails a page.
 *
 * The printed text is held to the configuration's `outputBudget`, which `configure` holds to 1 to
 * 536,870,888: `redact` counts the characters each printed variable and parameter on content the
 * page sees prints, in document order, and stops printing at the first whose text would pass what
 * remains. That one and every later one print nothing, and `unprinted` names it with the budget as
 * its bound and the limit `"budget"`. So `redact` never builds more printed text than the budget,
 * however much the item would print.
 *
 * With no record, an item whose template processing does not run reads as the record its first
 * attempt starts with (its declared template defaults and its outcomes' starting values), and an
 * item whose template processing runs withholds every printed variable, template block, template
 * inline, `param-variable` parameter and choice with a template visibility. It never copies a
 * template value or an outcome value it does not print or pass, the record's seed or an override
 * template processing set. `redactItem` in `#plate/redact/walk.ts` lists what it copies.
 *
 * It takes only an `Accepted` that `checkAdmitted` made from content the database admitted, so a
 * hand-built item never reaches a page unsecured: securing drops a `javascript:` href, and the
 * database refuses an `onclick` on every element the Schematron's extension-attribute lists cover
 * (reading 90). It always gives a redacted item: what it cannot
 * print shows as a notice.
 *
 * @example
 *   const { record } = restore(accepted, recordTheDatabaseReturned);
 *   const shown = redact(accepted, { configuration, supports, view }, record); // feedback by record.outcomes
 *
 * @param document The document `checkAdmitted` accepted.
 * @param options The configuration, whose `outputBudget` the printed text is held to, the supports
 *   the host enabled for the candidate, which decide what catalog content the redacted item holds,
 *   and the view the item is shown to, which decides which rubric blocks it holds
 *   ({@link RedactOptions}).
 * @param record The record of the attempt the page shows, such as `Restored["record"]` or a test
 *   item view's `page`: its template values, its outcome values, the defaults its template
 *   processing set, and whether response processing has run in it; none to show the item as it
 *   reads with no record.
 * @returns The redacted item.
 */
export const redact = (
  document: Accepted,
  options: RedactOptions,
  record?: RedactRecord,
): Redacted => redactItem(document.item, options, record);
