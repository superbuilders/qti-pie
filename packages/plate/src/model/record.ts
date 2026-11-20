/**
 * The session record: everything the renderer keeps about one item between requests, as data the
 * host stores and hands back.
 *
 * The renderer holds no session state of its own, so {@link ItemRecord} is the whole of an item's
 * session. {@link fresh} starts one and the attempt advances it.
 *
 * @module
 */
import { Option } from "effect";
import { itemBuiltInTypes } from "#plate/model/built-ins.ts";
import type { BuiltInName } from "#plate/model/built-ins.ts";
import type { ContextDeclaration, Item, OutcomeDeclaration } from "#plate/model/item.ts";
import { nullOf } from "#plate/model/values.ts";
import type { RecordValue, Value } from "#plate/model/values.ts";

/**
 * One item's session as the renderer holds it, each value of base type integer an exact `bigint`.
 *
 * `item` is the item's identifier and `document` its location. `instance` is the host's name for
 * this use of the item, which scopes its ids. `attempt` is `none` before any attempt and
 * `submitted` once `score` has processed one, and `numAttempts` counts the attempts processed. A
 * refused post is no state of the record: `score` returns no record for it, and a host that counts
 * refused posts keeps that count itself.
 * `responses` and `outcomes` hold every modelled variable by identifier, NULL included, and
 * `records` holds each record response's value beside `responses`, by the response's identifier;
 * template processing never sets one. `outcomes` holds the built-in `completionStatus` too where
 * the item holds it ({@link holdsCompletionStatus}).
 *
 * `seed` is the seed the record started under: the host's string, used as given, or the one
 * `score` drew for an item it scored with no record. `templates` holds the template
 * values the item's first attempt produced, and `correct` and `defaults` the correct responses and
 * the defaults its template processing set, each by the identifier of the variable it belongs to.
 * A stored value always wins over recomputation: the template values are drawn once, when the
 * record starts, and every later use reads them from here rather than running template processing
 * again.
 *
 * The record is server data. Its template values and correct responses can give the answers away,
 * so keep it where only the server reads it, never in the page.
 */
export interface ItemRecord {
  readonly attempt: "none" | "submitted";
  readonly correct: { readonly [identifier: string]: Value };
  readonly defaults: { readonly [identifier: string]: Value };
  readonly document: string;
  readonly instance: string;
  readonly item: string;
  readonly kind: "item";
  readonly numAttempts: number;
  readonly outcomes: { readonly [identifier: string]: Value };
  readonly records: { readonly [identifier: string]: RecordValue };
  readonly responses: { readonly [identifier: string]: Value };
  readonly seed: string;
  readonly templates: { readonly [identifier: string]: Value };
}

/**
 * The part of an {@link ItemRecord} `redact` and `checkResponses` read: what the page shows an
 * item by. It holds no seed, so nothing redacted can redraw the values.
 *
 * `templates` show or hide template content and choices, and `outcomes` give the printed
 * variables their values. `attempt` says whether response processing has run in the attempt the
 * page shows: once it has (`submitted`), the item's feedback follows `outcomes`, and its modal
 * feedback may show, since modal feedback "is shown to the candidate directly following response
 * processing" (the information model's ModalFeedback, section 5.93). Before it has (`none`), the
 * page is the item body as the attempt starts (section 7.19.3, `allow-review`: "the visibility of
 * any integrated feedback determined by the default values of the outcome variables"), so its
 * integrated feedback follows each outcome's starting value, `defaults`' where template processing
 * set one ({@link outcomeStart}), and no modal feedback shows. A record plate writes with no
 * attempt processed holds exactly those values in `outcomes`.
 */
export type RedactRecord = Pick<ItemRecord, "attempt" | "defaults" | "outcomes" | "templates">;

/**
 * The part of an {@link ItemRecord} `solution` reads: the correct responses template processing
 * set. It holds no seed.
 */
export type SolutionRecord = Pick<ItemRecord, "correct">;

/**
 * Give the value an outcome holds before any processing sets it: its declared default, else 0 for
 * a single integer or float, else NULL, so a numeric container starts NULL (reading 205). An item's
 * and a test's outcomes start alike, so the record and the results report read the same value.
 *
 * @param outcome The outcome's declaration.
 * @returns The outcome's starting value.
 */
export const startingValue = (outcome: OutcomeDeclaration): Value =>
  Option.getOrElse(outcome.defaultValue, (): Value => {
    if (outcome.cardinality === "single" && outcome.baseType === "integer") {
      return {
        baseType: "integer",
        cardinality: "single",
        values: [{ baseType: "integer", value: 0n }],
      };
    }

    return outcome.cardinality === "single" && outcome.baseType === "float"
      ? { baseType: "float", cardinality: "single", values: [{ baseType: "float", value: 0 }] }
      : nullOf(outcome.baseType, outcome.cardinality);
  });

/**
 * The identifier of the built-in context variable, a record a delivery engine sets before any
 * template, response or outcome processing runs, and which every item and test holds. No host
 * supplies its fields, so every processing reads it as the NULL record (`nullRecord` in
 * `#plate/model/values.ts`), and a read of any of its fields gives NULL rather than failing.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_ContextDeclaration
 */
export const qtiContextName = "QTI_CONTEXT" satisfies BuiltInName;

/**
 * Give the value of each context variable an item declares of a modelled type: its declared
 * default, else NULL of its base type and cardinality. No processing sets a context variable and
 * no host supplies one, so these are its values throughout a session.
 *
 * @param contexts The item's context declarations (`Item.contexts`).
 * @returns Each value, keyed by the variable's identifier.
 */
export const contextValues = (
  contexts: ReadonlyMap<string, ContextDeclaration>,
): Readonly<Record<string, Value>> =>
  Object.fromEntries(
    Array.from(contexts, ([identifier, declaration]) => [
      identifier,
      Option.getOrElse(declaration.defaultValue, () =>
        nullOf(declaration.baseType, declaration.cardinality),
      ),
    ]),
  );

/**
 * The identifier of the built-in outcome variable `completionStatus`, a single identifier the
 * delivery engine maintains and no outcome declaration may name. It "starts with the reserved
 * value 'not_attempted'", "at the start of the first attempt it changes to the reserved value
 * 'unknown'", and response processing may set it (section 2.2.2.3). `runAttempt` in
 * `#plate/engine/attempt.ts` starts the first attempt's processing with it at `unknown` and every
 * later attempt's at the value the record holds.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#IV_Outcome
 */
export const completionStatus = "completionStatus" satisfies BuiltInName;

/**
 * The type of the built-in {@link completionStatus}: a single identifier
 * (`itemBuiltInTypes` in `#plate/model/built-ins.ts`).
 */
export const completionStatusType: Pick<OutcomeDeclaration, "baseType" | "cardinality"> =
  itemBuiltInTypes.completionStatus;

/**
 * The two values the engine gives the built-in {@link completionStatus} itself: `not_attempted`
 * before any attempt, and `unknown` at the start of the first. Response processing may set any of
 * its four values (`completionStatusValues` in `#plate/model/built-ins.ts`, reading 213), which
 * later attempts keep.
 */
type CompletionStart = "not_attempted" | "unknown";

/**
 * Give the built-in {@link completionStatus} one of the values the engine starts it at.
 *
 * @param status The value.
 * @returns It as a single identifier.
 */
export const completionValue = (status: CompletionStart): Value => ({
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value: status }],
});

/**
 * Report whether an item holds the built-in {@link completionStatus} among its record's outcomes.
 *
 * Every admitted item holds it: the database refuses a declaration of any kind named
 * `completionStatus` (pantry's `DeclarationNotReserved`). A test's outcome declarations may take
 * the name (reading 168), and one that does wins over the built-in as every declared variable does,
 * so its holder does not hold it.
 *
 * It reads only the item's response and outcome declarations, so the evaluator's declarations
 * holder (`Declarations` in `#plate/engine/evaluate.ts`), a test's outcome declarations included,
 * may be passed for the item.
 *
 * @param item The item, or a declarations holder.
 * @returns Whether its record's outcomes hold the built-in.
 */
export const holdsCompletionStatus = (item: Pick<Item, "outcomes" | "responses">): boolean =>
  !item.responses.has(completionStatus) && !item.outcomes.has(completionStatus);

/**
 * Give each outcome of an item its starting value, the value a non-adaptive attempt resets it to,
 * and, where the item holds it ({@link holdsCompletionStatus}), the built-in
 * {@link completionStatus} at `not_attempted`, the value it holds before any attempt; the first
 * attempt starts it at `unknown`.
 *
 * @param item The item.
 * @returns Each outcome at {@link startingValue}, keyed by identifier, and the built-in.
 */
export const outcomeDefaults = (
  item: Pick<Item, "outcomes" | "responses">,
): ItemRecord["outcomes"] => {
  const declared: ItemRecord["outcomes"] = Object.fromEntries(
    Array.from(item.outcomes, ([identifier, outcome]) => [identifier, startingValue(outcome)]),
  );

  return holdsCompletionStatus(item)
    ? { [completionStatus]: completionValue("not_attempted"), ...declared }
    : declared;
};

/**
 * Give each declared outcome of an item the value it holds before any processing sets it: the
 * default template processing set for it, else its starting value, and the built-in
 * `completionStatus` at `not_attempted` where the item holds it, as {@link outcomeDefaults} gives
 * them. A default set for a response is not an outcome's, so it never joins the outcomes.
 *
 * @param item The item.
 * @param defaults The defaults template processing set, by identifier.
 * @returns The outcomes, keyed by identifier.
 */
export const outcomeStart = (
  item: Pick<Item, "outcomes" | "responses">,
  defaults: ItemRecord["defaults"],
): ItemRecord["outcomes"] => ({
  ...outcomeDefaults(item),
  ...Object.fromEntries(
    Object.entries(defaults).filter(([identifier]) => item.outcomes.has(identifier)),
  ),
});

/**
 * Start the session of an item that has not been attempted.
 *
 * @param item The item.
 * @param instance The host's name for this use of the item, which scopes its ids.
 * @returns The record: every response NULL, the outcomes at {@link outcomeDefaults}, the
 *   built-in `completionStatus` `not_attempted` among them, no attempts, the seed `""`, and no
 *   record response's value, template value, correct response or default.
 */
export const fresh = (item: Item, instance: string): ItemRecord => ({
  attempt: "none",
  correct: {},
  defaults: {},
  document: item.document,
  instance,
  item: item.identifier,
  kind: "item",
  numAttempts: 0,
  outcomes: outcomeDefaults(item),
  records: {},
  responses: Object.fromEntries(
    Array.from(item.responses, ([identifier, response]) => [
      identifier,
      nullOf(response.baseType, response.cardinality),
    ]),
  ),
  seed: "",
  templates: {},
});
