import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { Item, RecordDeclaration, ResponseDeclaration } from "#plate/model/item.ts";
import { nullOf } from "#plate/model/values.ts";
import type { RecordValue, Responses, Value } from "#plate/model/values.ts";
import { solution } from "#plate/solution.ts";
import { readCorpusFile } from "#plate/test/corpus.ts";
import { bg007Item } from "#plate/test/fixtures.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem, acceptForTest } from "#plate/validate/verdict.ts";

/**
 * BG007, a true-or-false Choice bound to the single identifier response `RESPONSE` whose correct
 * response is the choice `true`, by its path under the corpus root, which `admitted` takes as its
 * location.
 */
const bg007 = "QTI3_BPIG_Examples/items/BG007.xml";

/**
 * The single identifier value holding one identifier.
 *
 * @param identifier The identifier.
 * @returns The value holding it.
 */
const identifierValue = (identifier: string): Value => ({
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value: identifier }],
});

/**
 * A multiple identifier response that declares no correct response, beside the hand-built
 * BG007's `RESPONSE`, which declares `true`.
 */
const undeclared: ResponseDeclaration = {
  areaMapping: Option.none(),
  baseType: "identifier",
  cardinality: "multiple",
  correct: Option.none(),
  defaultValue: Option.none(),
  identifier: "OTHER",
  mapping: Option.none(),
};

/**
 * A single identifier response that declares the correct response `kept`, which the templated
 * item's template processing gives a default but no correct response.
 */
const kept: ResponseDeclaration = {
  ...undeclared,
  cardinality: "single",
  correct: Option.some(identifierValue("kept")),
  identifier: "KEPT",
};

/**
 * The hand-built BG007 with the responses `OTHER` and `KEPT` beside `RESPONSE`, the single
 * identifier template variable `T`, and template processing, which the database runs at the take,
 * so the record it returns holds the correct responses that processing set.
 */
const templated: Item = {
  ...bg007Item,
  responses: new Map([
    ...bg007Item.responses,
    [undeclared.identifier, undeclared],
    [kept.identifier, kept],
  ]),
  templated: true,
  templates: new Map([
    [
      "T",
      {
        baseType: "identifier",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "T",
        mathVariable: false,
        paramVariable: false,
      },
    ],
  ]),
};

/**
 * The record a post of `12.5` gives: its text, and the float it reads as.
 */
const twelveAndAHalf: RecordValue = {
  cardinality: "record",
  fields: [
    { identifier: "stringValue", value: { baseType: "string", value: "12.5" } },
    { identifier: "floatValue", value: { baseType: "float", value: 12.5 } },
  ],
};

/**
 * The record response `R`, which declares {@link twelveAndAHalf} as its correct response and
 * no default.
 */
const recordResponse: RecordDeclaration = {
  correct: Option.some(twelveAndAHalf),
  defaultValue: Option.none(),
  identifier: "R",
};

/**
 * The record response `BARE`, which declares neither a correct response nor a default.
 */
const bareRecord: RecordDeclaration = {
  correct: Option.none(),
  defaultValue: Option.none(),
  identifier: "BARE",
};

/**
 * The hand-built BG007 with the record responses {@link recordResponse} and {@link bareRecord}
 * beside `RESPONSE`.
 */
const withRecords: Item = {
  ...bg007Item,
  records: new Map([
    [recordResponse.identifier, recordResponse],
    [bareRecord.identifier, bareRecord],
  ]),
};

describe("solution", () => {
  it.effect(
    "gives BG007's correct choice, read from the corpus",
    () =>
      Effect.gen(function* bg007Solution() {
        const verdict = yield* admitted(bg007, yield* readCorpusFile(bg007));
        const accepted = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`${bg007} is ${verdict.verdict}, not accepted`),
        );

        assert.deepStrictEqual(solution(accepted, { correct: {} }), {
          RESPONSE: identifierValue("true"),
        });
      }),
    { tags: ["corpus"] },
  );

  it("gives NULL of the declared type for a response that declares no correct response", () => {
    const accepted = acceptForTest({
      ...bg007Item,
      responses: new Map([...bg007Item.responses, [undeclared.identifier, undeclared]]),
    });

    assert.deepStrictEqual(solution(accepted, { correct: {} }), {
      OTHER: nullOf("identifier", "multiple"),
      RESPONSE: identifierValue("true"),
    });
  });

  it("gives a record's correct response before the declaration's", () => {
    assert.deepStrictEqual(
      solution(acceptForTest(templated), {
        correct: { OTHER: identifierValue("other"), RESPONSE: identifierValue("false") },
      }),
      {
        KEPT: identifierValue("kept"),
        OTHER: identifierValue("other"),
        RESPONSE: identifierValue("false"),
      },
    );
  });

  it("gives the declaration's correct response where the record holds none", () => {
    assert.deepStrictEqual(solution(acceptForTest(templated), { correct: {} }), {
      KEPT: identifierValue("kept"),
      OTHER: nullOf("identifier", "multiple"),
      RESPONSE: identifierValue("true"),
    });
  });

  it("reads no inherited member of a record's correct responses as an override", () => {
    const constructor: ResponseDeclaration = { ...kept, identifier: "constructor" };
    const accepted = acceptForTest({
      ...bg007Item,
      responses: new Map([[constructor.identifier, constructor]]),
    });

    assert.deepStrictEqual(solution(accepted, { correct: {} }), {
      constructor: identifierValue("kept"),
    });
  });

  it("gives a record response its declared correct response, and the NULL record where it declares none", () => {
    const accepted = acceptForTest(withRecords);
    const declared: Responses = {
      BARE: { cardinality: "record", fields: [] },
      R: twelveAndAHalf,
      RESPONSE: identifierValue("true"),
    };

    assert.deepStrictEqual(solution(accepted, { correct: {} }), declared);
  });
});
