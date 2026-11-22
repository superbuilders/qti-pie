import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { configure } from "#plate/configuration.ts";
import { decode, entryName, partition } from "#plate/form/encoding.ts";
import type { Entry } from "#plate/form/encoding.ts";
import type { TextEntryPayload } from "#plate/interactions/text-entry.ts";
import { redactedInteractionsIn } from "#plate/model/interactions.ts";
import { recordOf } from "#plate/test/records.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { RecordValue, ResponseValue } from "#plate/model/values.ts";
import { interactionPayload } from "#plate/payload.ts";
import { postings } from "#plate/postings.ts";
import { redact } from "#plate/redact.ts";
import { restore } from "#plate/restore.ts";
import { pageOf, shownToCandidate } from "#plate/test/page.ts";
import type { Page } from "#plate/test/page.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The instance token every render here passes, as an author with a stable token would.
 */
const instance = "measure";

/**
 * A hand-built item whose Text Entry is bound to the record response `NUMBER`, which declares no
 * default and no correct response, and whose response processing sets the float `SCORE` to the
 * record's `floatValue` field.
 */
const measuredXml = [
  '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="measured"',
  ' title="Measured" adaptive="false" time-dependent="false" xml:lang="en">',
  '<qti-response-declaration identifier="NUMBER" cardinality="record"/>',
  '<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">',
  "<qti-default-value><qti-value>0</qti-value></qti-default-value>",
  "</qti-outcome-declaration>",
  "<qti-item-body><p>The length in metres is ",
  '<qti-text-entry-interaction response-identifier="NUMBER"/>.</p></qti-item-body>',
  "<qti-response-processing>",
  '<qti-set-outcome-value identifier="SCORE">',
  '<qti-field-value field-identifier="floatValue"><qti-variable identifier="NUMBER"/></qti-field-value>',
  "</qti-set-outcome-value>",
  "</qti-response-processing>",
  "</qti-assessment-item>",
].join("");

/**
 * The text the candidate types: a number with a space on each side and a trailing zero, which a
 * record keeps as typed and reads as two decimal places and three significant figures.
 */
const typed = " 1.50 ";

/**
 * Open the hand-built item as a host opens a document it read from storage, and require an
 * accepting verdict.
 *
 * @returns The accepted item.
 */
const openMeasured = Effect.fnUntraced(function* openMeasured() {
  const verdict = yield* admitted("items/measured.xml", new TextEncoder().encode(measuredXml));

  return Option.getOrElse(acceptedItem(verdict), (): Accepted =>
    assert.fail(`the item is ${verdict.verdict}, not accepted`),
  );
});

/**
 * Require a result to succeed.
 *
 * @param result The result.
 * @param what What gave it, for a failure's message.
 * @returns Its success.
 */
const ok = <A, E>(result: Result.Result<A, E>, what: string): A =>
  Result.getOrElse(result, (failure) => assert.fail(`${what} failed: ${String(failure)}`));

/**
 * Give the payload nodes of the Text Entries a page holds for `NUMBER`, at any depth, in document
 * order.
 *
 * @param page The page.
 * @returns The Text Entries' payload nodes.
 */
const numberEntries = (page: Page): readonly TextEntryPayload[] =>
  redactedInteractionsIn(page.redacted.body).flatMap((interaction): readonly TextEntryPayload[] => {
    const node = interactionPayload(interaction, page.view);

    return node.kind === "text-entry" && node.payload.response === "NUMBER" ? [node.payload] : [];
  });

/**
 * Give a record's fields by identifier, so two records compare without their field order, which a
 * record does not count.
 *
 * @param record The record.
 * @returns Each field's value, by its identifier.
 */
const fieldsOf = <V>(record: {
  readonly fields: readonly { readonly identifier: string; readonly value: V }[];
}): Readonly<Record<string, V>> =>
  Object.fromEntries(record.fields.map((field) => [field.identifier, field.value]));

/**
 * The fields `decode` gives a record binding for the typed text, each its single: the text as
 * typed, and the number it reads as with its digit counts. It has no `integerValue`, since it has
 * fractional digits, and no `exponent`.
 */
const typedFields: RecordValue["fields"] = [
  { identifier: "stringValue", value: { baseType: "string", value: typed } },
  { identifier: "floatValue", value: { baseType: "float", value: 1.5 } },
  { identifier: "leftDigits", value: { baseType: "integer", value: 1n } },
  { identifier: "rightDigits", value: { baseType: "integer", value: 2n } },
  { identifier: "ndp", value: { baseType: "integer", value: 2n } },
  { identifier: "nsf", value: { baseType: "integer", value: 3n } },
];

describe("a record answer from post to review", () => {
  it.effect(
    "posts a record answer end to end: the Text Entry shows the string control, the post decodes to its fields, and the record the attempt stores and the control shown again keep the text as typed",
    () =>
      Effect.gen(function* postsRecordAnswer() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openMeasured();
        const redacted = redact(accepted, shownToCandidate);

        assert.deepStrictEqual(accepted.item.unsupported, []);

        const first = numberEntries(pageOf(redacted, { configuration, instance }));
        assert.deepStrictEqual(
          first.map((entry) => [entry.baseType, entry.formName, entry.restore]),
          [["string", entryName(instance, "NUMBER"), ""]],
        );

        const entries: readonly Entry[] = [[entryName(instance, "NUMBER"), typed]];
        const { own } = partition(entries, instance);
        const posts = postings(accepted, instance);
        assert.deepStrictEqual(
          posts.map(({ binding, identifier }) => [identifier, binding.cardinality]),
          [["NUMBER", "record"]],
        );

        const responses: Readonly<Record<string, ResponseValue>> = Object.fromEntries(
          posts.map(({ binding, identifier, options }) => [
            identifier,
            ok(decode(own, binding, options), `decoding ${identifier}`),
          ]),
        );
        const posted = responses["NUMBER"];
        const decoded =
          posted?.cardinality === "record"
            ? posted
            : assert.fail("the post does not decode NUMBER to a record");
        assert.deepStrictEqual(fieldsOf(decoded), fieldsOf({ fields: typedFields }));

        const stored: ItemRecord = recordOf({ attempt: "submitted", records: { NUMBER: decoded } });

        const restored = restore(accepted, stored);
        const shownAgain = numberEntries(
          pageOf(redacted, { configuration, instance, values: restored.values }),
        );
        assert.deepStrictEqual(
          shownAgain.map((entry) => entry.restore),
          [typed],
        );
      }),
  );
});
