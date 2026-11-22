import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { recordOf } from "#plate/test/records.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { RecordValue, Value } from "#plate/model/values.ts";
import { restore } from "#plate/restore.ts";
import { readCorpusFile } from "#plate/test/corpus.ts";
import { float, integer } from "#plate/test/fixtures.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptForTest, acceptedItem } from "#plate/validate/verdict.ts";

/**
 * BG007, a true-or-false Choice bound to the single identifier response `RESPONSE`, by its path
 * under the corpus root, which `admitted` takes as its location.
 */
const bg007 = "QTI3_BPIG_Examples/items/BG007.xml";

/**
 * The path under the corpus root of `template_digging`, an item whose template processing draws
 * the template variables `PEOPLE`, `A`, `B` and `MIN` and sets the correct value of its float
 * response `RESPONSE`.
 */
const templateDigging = "QTI3_BPIG_Examples/items/template_digging.xml";

/**
 * The candidate's answer to BG007: the choice `true`.
 */
const chosen: Value = {
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value: "true" }],
};

/**
 * Open an item from the corpus cache, which `check` must accept.
 *
 * @param location The item's path under the corpus root.
 * @returns The accepted item.
 */
const opened = Effect.fnUntraced(function* opened(location: string) {
  const verdict = yield* admitted(location, yield* readCorpusFile(location));

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${location} is ${verdict.verdict}, not accepted`),
  );
});

/**
 * The record the database returns for an attempt of an item answered with some responses: the
 * item's fresh record with the responses set and the attempt `submitted`.
 *
 * @param record The item's fresh record.
 * @param responses The responses the attempt ended with.
 * @returns The record after the attempt.
 */
const submitted = (record: ItemRecord, responses: ItemRecord["responses"]): ItemRecord => ({
  ...record,
  attempt: "submitted",
  responses: { ...record.responses, ...responses },
});

describe("restore", { tags: ["corpus"] }, () => {
  it.effect("gives back an attempt's record of BG007 beside its responses", () =>
    Effect.gen(function* restoresSubmitted() {
      const accepted = yield* opened(bg007);
      const record = submitted(recordOf(), { RESPONSE: chosen });

      assert.deepStrictEqual(restore(accepted, record), {
        record,
        values: { RESPONSE: chosen },
      });
    }),
  );

  it.effect(
    "gives back a templated item's template values and correct responses in the record",
    () =>
      Effect.gen(function* restoresTemplated() {
        const accepted = yield* opened(templateDigging);
        const record: ItemRecord = {
          ...recordOf(),
          correct: { RESPONSE: float(15) },
          templates: {
            A: integer(3n),
            B: integer(5n),
            MIN: integer(15n),
            PEOPLE: {
              baseType: "string",
              cardinality: "single",
              values: [{ baseType: "string", value: "children" }],
            },
          },
        };

        assert.deepStrictEqual(restore(accepted, record), { record, values: record.responses });
      }),
  );

  it.effect(
    "gives back a record response's record among the values, beside the record holding it under records",
    () =>
      Effect.gen(function* restoresRecords() {
        const accepted = yield* opened(bg007);
        const recorded = acceptForTest({
          ...accepted.item,
          records: new Map([
            ["RREC", { correct: Option.none(), defaultValue: Option.none(), identifier: "RREC" }],
          ]),
        });
        const answer: RecordValue = {
          cardinality: "record",
          fields: [
            { identifier: "stringValue", value: { baseType: "string", value: "1.5e3" } },
            { identifier: "exponent", value: { baseType: "integer", value: 3n } },
          ],
        };
        const record: ItemRecord = {
          ...submitted(recordOf(), { RESPONSE: chosen }),
          records: { RREC: answer },
        };

        assert.deepStrictEqual(restore(recorded, record), {
          record,
          values: { RESPONSE: chosen, RREC: answer },
        });
      }),
  );
});
