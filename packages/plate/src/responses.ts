/**
 * Response validation as the item's interactions do it: {@link checkResponses}, a plain function a
 * host calls before showing or scoring responses, and {@link checkShown}, the same judgement over
 * the structure a caller already walked.
 *
 * Each interaction module validates its own response, so this module only finds the interactions
 * the page shows, through the walk the page is built from, and hands each its input.
 *
 * @module
 */
import { Option, Record as Rec } from "effect";
import type { Configuration } from "#plate/configuration.ts";
import { Malformed, recordText } from "#plate/form/encoding.ts";
import type { ValidationMessage } from "#plate/interactions/contract.ts";
import { interactionsIn, moduleSteps } from "#plate/model/interactions.ts";
import type { Interaction, Item } from "#plate/model/item.ts";
import type { RedactRecord } from "#plate/model/record.ts";
import { isRecordValue, nullOf, nullRecord } from "#plate/model/values.ts";
import type { RecordValue, ResponseValue, Value } from "#plate/model/values.ts";
import { redactStructure } from "#plate/redact/walk.ts";
import type { RedactedStructure } from "#plate/redact/walk.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * Give the input of a response the caller left out: NULL of its declaration's base type and
 * cardinality, or the NULL record for a record response.
 *
 * @param item The item, whose declarations give the response's type.
 * @param response The response's identifier.
 * @returns The NULL, or none when the item holds no declaration by that identifier, which no
 *   interaction of an accepted item binds: every interaction binds a declared response, and a
 *   module gives its notice in place of an interaction bound to a type it does not take.
 */
const absent = (item: Item, response: string): Option.Option<ResponseValue> =>
  Option.match(Option.fromUndefinedOr(item.responses.get(response)), {
    onNone: () => (item.records.has(response) ? Option.some(nullRecord) : Option.none()),
    onSome: (declaration) => Option.some(nullOf(declaration.baseType, declaration.cardinality)),
  });

/**
 * Give the input a record gives the interaction it is posted to.
 *
 * A Text Entry or an Extended Text judges a record as the string it was typed as, as it judges a
 * string binding: its `stringValue` field ({@link recordText}), matched as typed against a
 * `pattern-mask`, or NULL when it has none, as the NULL record. Any other interaction binds no
 * record, so it judges none.
 *
 * @param interaction The interaction.
 * @param record The record posted to it.
 * @returns The single string to judge, or none.
 */
const typedInput = (interaction: Interaction, record: RecordValue): Option.Option<Value> =>
  interaction.kind === "extended-text" || interaction.kind === "text-entry"
    ? Option.some({ baseType: "string", cardinality: "single", values: recordText(record) })
    : Option.none();

/**
 * Validate one interaction's input through its own module.
 *
 * @param interaction The interaction.
 * @param input Its response's value, or why the entries did not decode.
 * @param configuration The configuration.
 * @returns Its messages.
 */
const validate = (
  interaction: Interaction,
  input: Value | Malformed,
  configuration: Configuration,
): readonly ValidationMessage[] => moduleSteps(interaction).validate(input, configuration);

/**
 * Validate the input one interaction is given for its response: what the caller passed, else the
 * response's NULL ({@link absent}), a record through {@link typedInput}.
 *
 * @param item The item, whose declarations give a left-out response's type.
 * @param interaction The interaction.
 * @param given What the caller passed for its response, none when it left the response out.
 * @param configuration The configuration.
 * @returns Its messages.
 */
const judged = (
  item: Item,
  interaction: Interaction,
  given: Option.Option<ResponseValue | Malformed>,
  configuration: Configuration,
): readonly ValidationMessage[] =>
  Option.match(
    Option.orElse(given, () => absent(item, interaction.response)),
    {
      onNone: () => [],
      onSome: (input) =>
        input instanceof Malformed || !isRecordValue(input)
          ? validate(interaction, input, configuration)
          : Option.match(typedInput(interaction, input), {
              onNone: () => [],
              onSome: (typed) => validate(interaction, typed, configuration),
            }),
    },
  );

/**
 * Validate responses as the interactions of an item's structure, as the page is shown it, do: the
 * judgement {@link checkResponses} makes, over a structure the caller already holds, so `score`,
 * which also reads the structure's hidden-only responses, walks the item once.
 *
 * @param item The item.
 * @param shown The item's structure as the page is shown it under the record (`redactStructure`
 *   in `#plate/redact/walk.ts`), of which it reads the body.
 * @param responses The responses by identifier, each a value, a record or the `Malformed` `decode`
 *   gave.
 * @param configuration The configuration, which gives the locale and `validateResponses`.
 * @returns Every message of the interactions shown, in their document order; none when all are
 *   accepted.
 */
export const checkShown = (
  item: Item,
  shown: Pick<RedactedStructure, "body">,
  responses: Readonly<Record<string, ResponseValue | Malformed>>,
  configuration: Configuration,
): readonly ValidationMessage[] =>
  interactionsIn(shown.body).flatMap((interaction) =>
    judged(item, interaction, Rec.get(responses, interaction.response), configuration),
  );

/**
 * Validate responses as the item's interactions do, without scoring them.
 *
 * It judges only what the page shows: the interactions of the item as `redact` shows it under the
 * record's template values and outcomes, found through `redactStructure`, which decides what
 * `redactItem` decides and prints no text, so no printed variable is formatted to judge a response.
 * Each interaction shown, in document order, validates its response: a host that posts a native
 * form passes what `decode` gave for each response, a {@link Malformed} included, and a form-library
 * host passes values. A response left out is NULL. A Text Entry or an Extended Text judges a record
 * as the string it was typed as, its `stringValue`, as a string binding: its `pattern-mask` matches
 * that text as typed. `expected-length` sets a Control's size only and is never judged, for any
 * binding. Tier (a) limits apply always and tier (b) ones only under
 * `configuration.validateResponses` (reading 195). An Extended Text whose `min-strings` passes the
 * cap on the Controls it renders shows the cap's notice in their place and is not judged against
 * its `min-strings`, so a post with no entry for it never holds its item back.
 *
 * A choice its template hides, or withholds because the record holds no value of its template
 * variable, is not among the choices presented, so posting it to its interaction gives
 * `unknownChoice`. An interaction a hidden or withheld template block, inline or choice holds is
 * absent, as is one a hidden or withheld feedback block or inline holds, and a response bound to no
 * interaction shown is ignored, whatever it holds: no limit on it holds a post back, so the stored
 * value a host passes for it, such as a session's declared or template-set default, gives no
 * message.
 *
 * With no record, an item whose template processing does not run reads as the record its first
 * attempt starts with (each template variable at its declared default); for an item whose template
 * processing runs, every template block and inline is withheld and every choice with a template
 * visibility is absent, since its template values are drawn only when its record starts.
 *
 * @example
 *   checkResponses(accepted, { RESPONSE: decoded }, configuration, record);
 *   // [] when RESPONSE is accepted, else its messages; record is the one the page shows the item
 *   // under, as redact took it
 *
 * @param document The document `checkAdmitted` accepted.
 * @param responses The responses by identifier, each a value, a record or the `Malformed` `decode`
 *   gave.
 * @param configuration The configuration, which gives the locale and `validateResponses`.
 * @param record The record of the attempt the page shows, the one `redact` took: its template
 *   values and the outcomes its feedback follows; none to judge the item as it reads with no
 *   record.
 * @returns Every message of the interactions shown, in their document order; none when all are
 *   accepted.
 */
export const checkResponses = (
  document: Accepted,
  responses: Readonly<Record<string, ResponseValue | Malformed>>,
  configuration: Configuration,
  record?: RedactRecord,
): readonly ValidationMessage[] =>
  checkShown(document.item, redactStructure(document.item, record), responses, configuration);
