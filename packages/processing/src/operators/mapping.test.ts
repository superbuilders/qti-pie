import { assert, describe, it } from "@effect/vitest";
import type { Area, AreaMapping, Mapping, MapEntry, StaticType } from "#processing/ir.ts";
import { insideOf, mappedPointsOf, mappingOperators } from "#processing/operators/mapping.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import { element, nodeOf, ownVariable, testContext, testRun } from "#processing/test/run.ts";
import { container, isText, nullOf, single, valueTypeOf } from "#processing/value.ts";
import type { Single, Text, Value, ValueType } from "#processing/value.ts";

const operators = Object.freeze({ ...mappingOperators, ...valuesOperators });

const floatType: StaticType = { kind: "typed", type: { base: "float", cardinality: "single" } };

/**
 * A text the tests know is not empty.
 *
 * @param written - The text.
 * @returns It, as a Text.
 */
const text = (written: string): Text => (isText(written) ? written : assert.fail("empty text"));

/**
 * A map entry.
 *
 * @param key - Its key.
 * @param value - Its mapped value.
 * @param caseSensitive - Whether a string key matches case-sensitively.
 * @returns The entry.
 */
const entry = (key: Single, value: number, caseSensitive: boolean): MapEntry => ({
  caseSensitive,
  key,
  value,
});

/**
 * An identifier key's entry.
 *
 * @param key - The identifier.
 * @param value - Its mapped value.
 * @returns The entry.
 */
const identifierEntry = (key: string, value: number): MapEntry =>
  entry(single("identifier", text(key)), value, true);

/**
 * The information model's example mapping, {A, B, C, D} to {0, 1, 0.5, 0} (section 2.11.1.5), with
 * bounds where a test states them.
 *
 * @param lowerBound - The lower bound.
 * @param upperBound - The upper bound.
 * @returns The mapping.
 */
const example = (lowerBound: number, upperBound: number): Mapping => ({
  defaultValue: -1,
  entries: [
    identifierEntry("A", 0),
    identifierEntry("B", 1),
    identifierEntry("C", 0.5),
    identifierEntry("D", 0),
    identifierEntry("C", 7),
  ],
  lowerBound,
  upperBound,
});

/**
 * A `qti-map-response`'s value over a stated response.
 *
 * @param mapping - The mapping.
 * @param response - The response's value.
 * @returns Its value.
 */
const mapped = (mapping: Mapping, response: Value): Value => {
  const type = valueTypeOf(response);
  const { run } = testRun(operators, { RESPONSE: { value: response } }, {});

  return run.evaluate(
    nodeOf("map-response", [], { mapping, response: ownVariable("RESPONSE", type) }, floatType),
  );
};

/**
 * Identifiers as a container.
 *
 * @param kind - The cardinality.
 * @param letters - The identifiers.
 * @returns The container.
 */
const identifiers = (kind: "multiple" | "ordered", ...letters: readonly string[]): Value =>
  container(kind, "identifier", letters.map(text));

describe("map-response", () => {
  it("maps a single value, sums a container's distinct values once, by the first entry that keys each (§2.11.1.5, readings `map-key-repeats`, `string-map-key-case`)", () => {
    const unbounded = example(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);

    assert.deepStrictEqual(
      mapped(unbounded, single("identifier", text("C"))),
      single("float", 0.5),
    );
    assert.deepStrictEqual(
      mapped(unbounded, identifiers("multiple", "C", "B")),
      single("float", 1.5),
    );
    assert.deepStrictEqual(
      mapped(unbounded, identifiers("multiple", "B", "B", "C")),
      single("float", 1.5),
    );
    assert.deepStrictEqual(
      mapped(unbounded, identifiers("ordered", "Z", "Z")),
      single("float", -1),
    );
  });

  it("holds a container's sum to the bounds and leaves a single's value unclamped (reading `mapping-bounds`)", () => {
    const bounded = example(0, 1);

    assert.deepStrictEqual(mapped(bounded, identifiers("multiple", "B", "C")), single("float", 1));
    assert.deepStrictEqual(mapped(bounded, single("identifier", text("Z"))), single("float", -1));
    assert.deepStrictEqual(mapped(bounded, identifiers("multiple", "Z")), single("float", 0));
  });

  it("maps a NULL response to 0 before the bounds apply (reading `area-mapping`)", () => {
    assert.deepStrictEqual(
      mapped(example(0.5, 2), nullOf({ base: "identifier", cardinality: "multiple" })),
      single("float", 0.5),
    );
    assert.deepStrictEqual(
      mapped(example(0.5, 2), nullOf({ base: "identifier", cardinality: "single" })),
      single("float", 0),
    );
  });

  it("matches a string key by its fold unless the entry is case-sensitive, and a float key by its double (section 7.21.3, reading `float-map-keys`)", () => {
    const strings: Mapping = {
      defaultValue: 0,
      entries: [
        entry(single("string", text("STRASSE")), 1, false),
        entry(single("string", text("Paris")), 2, true),
      ],
      lowerBound: Number.NEGATIVE_INFINITY,
      upperBound: Number.POSITIVE_INFINITY,
    };

    assert.deepStrictEqual(mapped(strings, single("string", text("straße"))), single("float", 1));
    assert.deepStrictEqual(mapped(strings, single("string", text("paris"))), single("float", 0));
    assert.deepStrictEqual(mapped(strings, single("string", text("Paris"))), single("float", 2));

    const floats: Mapping = {
      defaultValue: 0,
      entries: [entry(single("float", 0), 3, true)],
      lowerBound: Number.NEGATIVE_INFINITY,
      upperBound: Number.POSITIVE_INFINITY,
    };
    assert.deepStrictEqual(mapped(floats, single("float", -0)), single("float", 3));
  });

  it("sums the mapped values exactly and rounds once (D2)", () => {
    const tenths: Mapping = {
      defaultValue: 0,
      entries: [identifierEntry("A", 0.1), identifierEntry("B", 0.2), identifierEntry("C", 0.3)],
      lowerBound: Number.NEGATIVE_INFINITY,
      upperBound: Number.POSITIVE_INFINITY,
    };

    assert.deepStrictEqual(
      mapped(tenths, identifiers("ordered", "A", "B", "C")),
      single("float", 0.6),
    );
  });

  it("reads the response a mapping names, and refuses one with no mapping (§2.11.1.5)", () => {
    const declared: ValueType = { base: "identifier", cardinality: "multiple" };
    const context = testContext({
      declared: { MAPPED: declared, PLAIN: declared },
      responses: {
        MAPPED: { areaMapping: undefined, mapping: example(0, 1) },
        PLAIN: { areaMapping: undefined, mapping: undefined },
      },
    });

    assert.deepStrictEqual(
      mappingOperators["map-response"].read(
        element("qti-map-response", { identifier: "MAPPED" }, []),
        context,
        0,
      ),
      {
        ok: true,
        value: {
          mapping: example(0, 1),
          response: { identifier: "MAPPED", role: "response", scope: "own", type: declared },
        },
      },
    );
    assert.isFalse(
      mappingOperators["map-response"].read(
        element("qti-map-response", { identifier: "PLAIN" }, []),
        context,
        0,
      ).ok,
    );
  });
});

/**
 * Points as a multiple container.
 *
 * @param coordinates - Each point's x and y.
 * @returns The container.
 */
const points = (...coordinates: readonly (readonly [bigint, bigint])[]): Value =>
  container(
    "multiple",
    "point",
    coordinates.map(([x, y]) => ({ x, y })),
  );

describe("map-response-point and inside", () => {
  const left: Area = {
    bottom: 10n,
    denominator: 1n,
    kind: "rect",
    left: 0n,
    right: 10n,
    top: 0n,
  };
  const overlap: Area = {
    bottom: 10n,
    denominator: 1n,
    kind: "rect",
    left: 5n,
    right: 20n,
    top: 0n,
  };
  const areas: AreaMapping = {
    defaultValue: 0.25,
    entries: [
      { area: left, value: 1 },
      { area: overlap, value: 2 },
    ],
    lowerBound: Number.NEGATIVE_INFINITY,
    upperBound: Number.POSITIVE_INFINITY,
  };

  it("maps each point by the first area that holds it, each area once, each distinct point in none adding the default once (reading `area-mapping`)", () => {
    assert.deepStrictEqual(mappedPointsOf(areas, points([1n, 1n], [2n, 2n])), single("float", 1));
    assert.deepStrictEqual(mappedPointsOf(areas, points([6n, 1n])), single("float", 1));
    assert.deepStrictEqual(mappedPointsOf(areas, points([15n, 1n], [1n, 1n])), single("float", 3));
    assert.deepStrictEqual(
      mappedPointsOf(areas, points([50n, 50n], [50n, 50n], [60n, 60n])),
      single("float", 0.5),
    );
    assert.deepStrictEqual(
      mappedPointsOf(areas, nullOf({ base: "point", cardinality: "single" })),
      single("float", 0),
    );
  });

  it("inside is true where any point is in the area, NULL for NULL (§2.11.3.7)", () => {
    assert.deepStrictEqual(insideOf(left, points([50n, 50n], [10n, 10n])), single("boolean", true));
    assert.deepStrictEqual(insideOf(left, points([50n, 50n])), single("boolean", false));
    assert.deepStrictEqual(
      insideOf(left, nullOf({ base: "point", cardinality: "single" })),
      nullOf({ base: "boolean", cardinality: "single" }),
    );
  });
});

describe("inside and map-response-point through the table", () => {
  const pointType: ValueType = { base: "point", cardinality: "multiple" };
  const rectangle: Area = {
    bottom: 10n,
    denominator: 1n,
    kind: "rect",
    left: 0n,
    right: 10n,
    top: 0n,
  };
  const areaMapping: AreaMapping = {
    defaultValue: 0,
    entries: [{ area: rectangle, value: 2 }],
    lowerBound: Number.NEGATIVE_INFINITY,
    upperBound: Number.POSITIVE_INFINITY,
  };
  const clicked = container("multiple", "point", [
    { x: 1n, y: 1n },
    { x: 2n, y: 2n },
  ]);

  it("reads inside's area through the compiler's resolution, a percentage of the image's size (reading circle-percentage-radius)", () => {
    const context = testContext({ declared: {}, image: { height: 100, width: 200 } });
    const read = mappingOperators.inside.read(
      element(
        "qti-inside",
        Object.fromEntries([
          ["coords", "0,0,50%,50%"],
          ["shape", "rect"],
        ]),
        [],
      ),
      context,
      0,
    );

    const { run } = testRun(operators, { POINTS: { value: clicked } }, {});
    const pointsRead = nodeOf(
      "variable",
      [],
      { variable: ownVariable("POINTS", pointType) },
      { kind: "typed", type: pointType },
    );
    const evaluated = read.ok
      ? run.evaluate(
          nodeOf("inside", [pointsRead], read.value, {
            kind: "typed",
            type: { base: "boolean", cardinality: "single" },
          }),
        )
      : nullOf({ base: "boolean", cardinality: "single" });

    assert.deepStrictEqual(evaluated, single("boolean", true));
  });

  it("maps a response's points by its declared area mapping, and refuses a response that declares none (§2.11.1.6)", () => {
    const context = testContext({
      declared: { PLAIN: pointType, POINTS: pointType },
      responses: {
        PLAIN: { areaMapping: undefined, mapping: undefined },
        POINTS: { areaMapping, mapping: undefined },
      },
    });
    const read = mappingOperators["map-response-point"].read(
      element("qti-map-response-point", { identifier: "POINTS" }, []),
      context,
      0,
    );

    assert.isFalse(
      mappingOperators["map-response-point"].read(
        element("qti-map-response-point", { identifier: "PLAIN" }, []),
        context,
        0,
      ).ok,
    );

    const { run } = testRun(operators, { POINTS: { value: clicked } }, {});
    const evaluated = read.ok
      ? run.evaluate(nodeOf("map-response-point", [], read.value, floatType))
      : nullOf({ base: "float", cardinality: "single" });
    assert.deepStrictEqual(evaluated, single("float", 2), "two points in one area map it once");
  });
});
