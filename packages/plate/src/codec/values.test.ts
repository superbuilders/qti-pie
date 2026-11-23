import { assert, describe, expectTypeOf, it } from "@effect/vitest";
import { Effect, Result, Schema } from "effect";
import {
  PostedResponses,
  RecordValueSchema,
  ResponseValueSchema,
  ValueSchema,
} from "#plate/codec/values.ts";
import { isRecordValue, nullOf } from "#plate/model/values.ts";
import type {
  ModelledBaseType,
  RecordValue,
  Responses,
  ResponseValue,
  Single,
  Value,
} from "#plate/model/values.ts";

/**
 * Read a value back as a host hands it back after storing it as JSON text: written as JSON and the
 * text decoded as JSON, so what JSON cannot write, and a structured clone would keep, is gone.
 */
const storedAsJson = (value: Schema.Json): Schema.Json =>
  Schema.decodeUnknownSync(Schema.fromJsonString(Schema.Json))(JSON.stringify(value));

/**
 * Construct a value for a test.
 *
 * @param baseType The value's base type.
 * @param cardinality The value's cardinality.
 * @param values Its values.
 * @returns The value.
 */
const value = (
  baseType: ModelledBaseType,
  cardinality: Value["cardinality"],
  values: readonly Single[],
): Value => ({ baseType, cardinality, values });

/**
 * Construct identifier values for a test.
 *
 * @param names The identifiers, in order.
 * @returns One identifier value for each name.
 */
const identifiers = (...names: readonly string[]): readonly Single[] =>
  names.map((name) => ({ baseType: "identifier", value: name }));

/**
 * Construct untyped input for {@link ValueSchema}, with cardinality `single`.
 *
 * @param baseType The input's base type, possibly not a modelled one.
 * @param values Its values, possibly not ones the base type holds.
 * @returns The input object.
 */
const singleInput = (baseType: string, values: readonly object[]) => ({
  baseType,
  cardinality: "single",
  values,
});

describe("ValueSchema", () => {
  it.effect("encodes and decodes through its Schema", () =>
    Effect.gen(function* valueRoundTrips() {
      const values: readonly Value[] = [
        value("identifier", "multiple", identifiers("A", "B", "B")),
        value("pair", "single", [{ baseType: "pair", value: ["A", "B"] }]),
        value("float", "ordered", [
          { baseType: "float", value: 2.5 },
          { baseType: "float", value: Number.POSITIVE_INFINITY },
        ]),
        value("integer", "single", [{ baseType: "integer", value: 2n ** 53n + 1n }]),
        value("boolean", "single", [{ baseType: "boolean", value: true }]),
        value("string", "single", [{ baseType: "string", value: " a " }]),
        nullOf("uri", "single"),
      ];
      for (const original of values) {
        const encoded = yield* Schema.encodeEffect(ValueSchema)(original);
        const decoded = yield* Schema.decodeUnknownEffect(ValueSchema)(encoded);
        assert.deepStrictEqual(decoded, original);
      }
    }),
  );

  it.effect("encodes an integer as its decimal digits and decodes them to the same bigint", () =>
    Effect.gen(function* integerAsDigits() {
      const original = value("integer", "single", [{ baseType: "integer", value: -(10n ** 30n) }]);
      const encoded = yield* Schema.encodeEffect(ValueSchema)(original);

      assert.deepStrictEqual(encoded, {
        baseType: "integer",
        cardinality: "single",
        values: [{ baseType: "integer", value: "-1000000000000000000000000000000" }],
      });
      assert.deepStrictEqual(yield* Schema.decodeUnknownEffect(ValueSchema)(encoded), original);
    }),
  );

  it.effect(
    "encodes a point as two runs of decimal digits and decodes them to the same point",
    () =>
      Effect.gen(function* pointAsDigits() {
        const original = value("point", "single", [
          { baseType: "point", value: [102n, -(2n ** 53n + 1n)] },
        ]);
        const encoded = yield* Schema.encodeEffect(ValueSchema)(original);

        assert.deepStrictEqual(encoded, {
          baseType: "point",
          cardinality: "single",
          values: [{ baseType: "point", value: ["102", "-9007199254740993"] }],
        });

        const handedBack = storedAsJson(encoded);
        assert.deepStrictEqual(
          yield* Schema.decodeUnknownEffect(ValueSchema)(handedBack),
          original,
        );
      }),
  );

  it("refuses a point with three coordinates, one or a coordinate that is not an integer", () => {
    for (const coordinates of [["1", "2", "3"], ["1"], ["1.5", "2"], ["a", "2"]]) {
      const decoded = Schema.decodeUnknownResult(ValueSchema)(
        singleInput("point", [{ baseType: "point", value: coordinates }]),
      );

      assert.isTrue(Result.isFailure(decoded), JSON.stringify(coordinates));
    }
  });

  it.effect(
    "carries a float that is infinite, not a number or negative zero through JSON text unchanged",
    () =>
      Effect.gen(function* nonFiniteFloatsThroughJson() {
        for (const number of [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN, -0]) {
          const encoded = yield* Schema.encodeEffect(ValueSchema)(
            value("float", "single", [{ baseType: "float", value: number }]),
          );
          const handedBack = storedAsJson(encoded);
          const decoded = yield* Schema.decodeUnknownEffect(ValueSchema)(handedBack);
          const [single] = decoded.values;

          assert.strictEqual(single?.baseType, "float", String(number));
          assert.isTrue(Object.is(single?.value, number), String(number));
        }
      }),
  );

  it.effect(
    "stores a duration as its seconds, as a float, INF and NaN by name, and reads it back through JSON text",
    () =>
      Effect.gen(function* durationThroughJson() {
        const original = value(
          "duration",
          "multiple",
          [90.5, -1.5, Number.POSITIVE_INFINITY, Number.NaN].map((seconds) => ({
            baseType: "duration",
            value: seconds,
          })),
        );
        const encoded = yield* Schema.encodeEffect(ValueSchema)(original);

        assert.deepStrictEqual(encoded, {
          baseType: "duration",
          cardinality: "multiple",
          values: [
            { baseType: "duration", value: 90.5 },
            { baseType: "duration", value: -1.5 },
            { baseType: "duration", value: "INF" },
            { baseType: "duration", value: "NaN" },
          ],
        });

        const handedBack = storedAsJson(encoded);
        const decoded = yield* Schema.decodeUnknownEffect(ValueSchema)(handedBack);
        assert.deepStrictEqual(decoded, original);
        assert.isTrue(
          Result.isFailure(
            Schema.decodeUnknownResult(ValueSchema)(
              singleInput("duration", [{ baseType: "duration", value: "PT1M30.5S" }]),
            ),
          ),
        );
      }),
  );

  it.effect(
    'writes the infinities, NaN and negative zero as "INF", "-INF", "NaN" and "-0", and every other float as a number',
    () =>
      Effect.gen(function* floatEncodedForms() {
        const encoded = yield* Schema.encodeEffect(ValueSchema)(
          value(
            "float",
            "ordered",
            [
              Number.POSITIVE_INFINITY,
              Number.NEGATIVE_INFINITY,
              Number.NaN,
              -0,
              0,
              2.5,
              -1e300,
            ].map((number) => ({ baseType: "float", value: number })),
          ),
        );

        assert.deepStrictEqual(
          encoded.values.map((single) => single.value),
          ["INF", "-INF", "NaN", "-0", 0, 2.5, -1e300],
        );
      }),
  );

  it('refuses a stored float written as "Infinity", "inf" or "1.5"', () => {
    for (const written of ["Infinity", "inf", "1.5"]) {
      const decoded = Schema.decodeUnknownResult(ValueSchema)(
        singleInput("float", [{ baseType: "float", value: written }]),
      );

      assert.isTrue(Result.isResult(decoded), written);
      assert.isTrue(Result.isFailure(decoded), written);
    }
  });

  it("refuses a value of another base type, an invalid value and two values in a single", () => {
    const valid = Schema.is(ValueSchema);
    assert.isTrue(valid(singleInput("integer", [{ baseType: "integer", value: 1n }])));
    assert.isTrue(valid(singleInput("integer", [{ baseType: "integer", value: 2n ** 53n + 1n }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "integer", value: 1 }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "integer", value: 2 ** 53 }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "float", value: 1 }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "integer", value: "1" }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "integer", value: 1.5 }])));
    assert.isFalse(valid(singleInput("identifier", [{ baseType: "identifier", value: "1" }])));
    assert.isFalse(valid(singleInput("pair", [{ baseType: "pair", value: ["A", "1"] }])));
    assert.isFalse(valid(singleInput("string", [{ baseType: "string", value: "" }])));
    assert.isFalse(valid(singleInput("identifier", identifiers("A", "B"))));
    assert.isTrue(valid(singleInput("point", [{ baseType: "point", value: [102n, 113n] }])));
    assert.isFalse(valid(singleInput("point", [{ baseType: "point", value: [1n, 2n, 3n] }])));
    assert.isFalse(valid(singleInput("point", [{ baseType: "point", value: [102, 113] }])));
    assert.isTrue(valid(singleInput("duration", [])));
    assert.isTrue(valid(singleInput("duration", [{ baseType: "duration", value: 90.5 }])));
    assert.isFalse(valid(singleInput("duration", [{ baseType: "duration", value: "PT1M" }])));
    assert.isTrue(valid(singleInput("file", [])));
    assert.isFalse(valid(singleInput("file", [{ baseType: "string", value: "a.txt" }])));
    assert.isFalse(valid({ baseType: "identifier", cardinality: "record", values: [] }));
  });

  it("refuses a string or a URI holding a character XML cannot carry, and keeps tab, line breaks and an astral character", () => {
    const valid = Schema.is(ValueSchema);
    for (const text of ["a\u0000b", "a\u000Bb", "a\u001Fb", "a\uFFFEb", "a\uFFFFb", "a\uD800b"]) {
      const label = JSON.stringify(text);
      assert.isFalse(valid(singleInput("string", [{ baseType: "string", value: text }])), label);
      assert.isFalse(
        valid(singleInput("uri", [{ baseType: "uri", value: `http://a/${text}` }])),
        label,
      );
    }
    assert.isTrue(
      valid(singleInput("string", [{ baseType: "string", value: "a\tb\nc\rd\u{1F600}" }])),
    );
    assert.isTrue(valid(singleInput("uri", [{ baseType: "uri", value: "http://a/b?c=d" }])));
  });
});

/**
 * A record of the fields a Text Entry's post gives: its text, an integer of 400 digits, and a float
 * that is infinite.
 */
const posted: RecordValue = {
  cardinality: "record",
  fields: [
    { identifier: "stringValue", value: { baseType: "string", value: "  12 " } },
    { identifier: "integerValue", value: { baseType: "integer", value: 10n ** 399n + 7n } },
    { identifier: "floatValue", value: { baseType: "float", value: Number.POSITIVE_INFINITY } },
  ],
};

/**
 * Records {@link RecordValueSchema} refuses, by what is wrong with each, typed as the plain record
 * would be had it been built by hand: an identifier that is not an NCName, an identifier written
 * twice, a field of base type `file` holding text where a file is its name, size and type, and a
 * field holding the empty string, which is NULL, and a NULL field is no field.
 */
const malformedRecords = {
  "a field holding the empty string": {
    cardinality: "record",
    fields: [{ identifier: "stringValue", value: { baseType: "string", value: "" } }],
  },
  "a field of base type file holding text": {
    cardinality: "record",
    fields: [{ identifier: "upload", value: { baseType: "file", value: "a.txt" } }],
  },
  "an identifier that is not an NCName": {
    cardinality: "record",
    fields: [{ identifier: "1st", value: { baseType: "string", value: "a" } }],
  },
  "an identifier written twice": {
    cardinality: "record",
    fields: [
      { identifier: "stringValue", value: { baseType: "string", value: "a" } },
      { identifier: "stringValue", value: { baseType: "string", value: "b" } },
    ],
  },
};

describe("RecordValueSchema", () => {
  it.effect(
    "round-trips a record through JSON text: a 400-digit integer exact and an infinite float by name",
    () =>
      Effect.gen(function* recordRoundTrips() {
        const encoded = yield* Schema.encodeEffect(RecordValueSchema)(posted);
        const integerField = encoded.fields[1]?.value;

        assert.deepStrictEqual(
          encoded.fields.map((field) => [field.identifier, field.value.value]),
          [
            ["stringValue", "  12 "],
            ["integerValue", String(10n ** 399n + 7n)],
            ["floatValue", "INF"],
          ],
        );
        assert.strictEqual(
          integerField?.baseType === "integer" ? integerField.value.length : -1,
          400,
        );

        const handedBack = storedAsJson(encoded);
        assert.deepStrictEqual(
          yield* Schema.decodeUnknownEffect(RecordValueSchema)(handedBack),
          posted,
        );
        assert.deepStrictEqual(
          yield* Schema.decodeUnknownEffect(ResponseValueSchema)(handedBack),
          posted,
        );
      }),
  );

  it("takes a record with no field, the NULL record", () => {
    assert.isTrue(Schema.is(RecordValueSchema)({ cardinality: "record", fields: [] }));
  });

  it("refuses, decoding and encoding alike, a non-NCName identifier, a repeated identifier, a field of base type file and an empty string", () => {
    for (const [problem, malformed] of Object.entries(malformedRecords)) {
      const stored = storedAsJson(malformed);

      assert.isTrue(
        Result.isFailure(Schema.decodeUnknownResult(RecordValueSchema)(stored)),
        problem,
      );
      assert.isTrue(
        Result.isFailure(Schema.decodeUnknownResult(ResponseValueSchema)(stored)),
        problem,
      );
      assert.isTrue(
        Result.isFailure(Schema.encodeUnknownResult(RecordValueSchema)(malformed)),
        problem,
      );
      assert.isFalse(Schema.is(RecordValueSchema)(malformed), problem);
    }
  });
});

describe("the plain types", () => {
  // `tsc` refuses each line once a Schema's type parts from its plain type.
  it("are the Schemas' types", () => {
    expectTypeOf<typeof ValueSchema.Type>().toEqualTypeOf<Value>();
    expectTypeOf<typeof RecordValueSchema.Type>().toEqualTypeOf<RecordValue>();
    expectTypeOf<typeof ResponseValueSchema.Type>().toEqualTypeOf<ResponseValue>();
  });
});

/**
 * A body a page posts: a multiple of identifiers, an integer past the safe integers, a float JSON
 * has no number for, an ordered of points, a record, a NULL and an End Attempt not pressed.
 */
const body: Responses = {
  CHOICES: value("identifier", "multiple", identifiers("A", "B", "B")),
  DRAWN: value("boolean", "single", [{ baseType: "boolean", value: false }]),
  EMPTY: nullOf("directedPair", "multiple"),
  NUMBER: value("integer", "single", [{ baseType: "integer", value: 2n ** 64n + 1n }]),
  POINTS: value("point", "ordered", [
    { baseType: "point", value: [102n, 113n] },
    { baseType: "point", value: [-3n, 0n] },
  ]),
  RATIO: value("float", "single", [{ baseType: "float", value: -0 }]),
  TYPED: {
    cardinality: "record",
    fields: [
      { identifier: "stringValue", value: { baseType: "string", value: "1.50" } },
      { identifier: "floatValue", value: { baseType: "float", value: 1.5 } },
    ],
  },
};

describe("PostedResponses", () => {
  it.effect(
    "carries every response through JSON text whole: exact integers, named floats, records",
    () =>
      Effect.gen(function* postedRoundTrip() {
        const read = yield* Schema.decodeUnknownEffect(PostedResponses)(
          storedAsJson(Schema.encodeSync(PostedResponses)(body)),
        );

        assert.deepStrictEqual(read, body);
        assert.deepStrictEqual(
          Object.values(read).flatMap((each) =>
            isRecordValue(each)
              ? []
              : each.values.flatMap((single) =>
                  single.baseType === "float" ? [single.value] : [],
                ),
          ),
          [-0],
        );
      }),
  );

  it("refuses a key that is no NCName, a single of two values and a value of another base type", () => {
    const refused = [
      {
        "1st": storedAsJson(Schema.encodeSync(ResponseValueSchema)(nullOf("identifier", "single"))),
      },
      {
        RESPONSE: {
          baseType: "identifier",
          cardinality: "single",
          values: [
            { baseType: "identifier", value: "A" },
            { baseType: "identifier", value: "B" },
          ],
        },
      },
      {
        RESPONSE: {
          baseType: "identifier",
          cardinality: "single",
          values: [{ baseType: "integer", value: "1" }],
        },
      },
    ];

    for (const input of refused) {
      assert.isTrue(
        Result.isFailure(Schema.decodeUnknownResult(PostedResponses)(input)),
        JSON.stringify(input),
      );
    }
  });
});
