import { assert, describe, it } from "@effect/vitest";
import { Array as Arr, Effect, Option, Result } from "effect";
import { mappedPoints, mappedResponse } from "#plate/engine/expressions/mapping.ts";
import { floatValue } from "#plate/engine/numbers.ts";
import type { AreaMapEntry, AreaMapping, Mapping } from "#plate/model/item.ts";
import { match, parseLexical } from "#plate/model/values.ts";
import type { ModelledBaseType, Single, Value } from "#plate/model/values.ts";
import { growthFactor, growthLimit, growthRatio } from "#plate/test/growth.ts";

/**
 * BG010's mapping: `York` maps to 1 compared case-sensitively, `york` to 0.5 compared with case
 * folded, as `case-sensitive` defaults to false, and every other answer to 0.
 */
const yorkMapping: Mapping = {
  defaultValue: 0,
  entries: [
    { caseSensitive: true, key: { baseType: "string", value: "York" }, value: 1 },
    { caseSensitive: false, key: { baseType: "string", value: "york" }, value: 0.5 },
  ],
  lowerBound: Option.none(),
  upperBound: Option.none(),
};

/**
 * A mapping whose entries overlap in the order BG010's do not: `york` (0.5, with case folded) comes
 * before `York` (1, compared case-sensitively), so `York` matches both.
 */
const tiedMapping: Mapping = {
  ...yorkMapping,
  entries: [
    { caseSensitive: false, key: { baseType: "string", value: "york" }, value: 0.5 },
    { caseSensitive: true, key: { baseType: "string", value: "York" }, value: 1 },
  ],
};

/**
 * BG010's mapping bounded from 0.25 to 0.4.
 */
const boundedMapping: Mapping = {
  ...yorkMapping,
  lowerBound: Option.some(0.25),
  upperBound: Option.some(0.4),
};

/**
 * A mapping of identifiers: `A` to 1 and `C` to 0.5.
 */
const choicesMapping: Mapping = {
  defaultValue: 0,
  entries: [
    { caseSensitive: false, key: { baseType: "identifier", value: "A" }, value: 1 },
    { caseSensitive: false, key: { baseType: "identifier", value: "C" }, value: 0.5 },
  ],
  lowerBound: Option.none(),
  upperBound: Option.none(),
};

/**
 * Construct a mapping of one key to 1, every other value mapping to a default.
 *
 * @param key The key.
 * @param defaultValue What every other value maps to.
 * @returns The mapping.
 */
const oneKey = (key: Single, defaultValue: number): Mapping => ({
  defaultValue,
  entries: [{ caseSensitive: false, key, value: 1 }],
  lowerBound: Option.none(),
  upperBound: Option.none(),
});

/**
 * The area mapping of the point cases: the circle `102,113,16` mapped to 1, then the rect
 * `0,0,50,40` mapped to 0.5; a point in neither maps to 0.25.
 */
const targetMapping: AreaMapping = {
  defaultValue: 0.25,
  entries: [
    { coords: [102, 113, 16], mappedValue: 1, shape: "circle" },
    { coords: [0, 0, 50, 40], mappedValue: 0.5, shape: "rect" },
  ],
  lowerBound: Option.none(),
  percent: false,
  upperBound: Option.none(),
};

/**
 * An area mapping whose areas overlap: the rect `0,0,50,40` mapped to 0.5, then the circle
 * `40,30,20` mapped to 1, which holds the rect's corner `50,40`.
 */
const overlappingMapping: AreaMapping = {
  ...targetMapping,
  entries: [
    { coords: [0, 0, 50, 40], mappedValue: 0.5, shape: "rect" },
    { coords: [40, 30, 20], mappedValue: 1, shape: "circle" },
  ],
};

/**
 * Construct a response value of a cardinality whose values all have one base type.
 *
 * @param baseType Its base type.
 * @param cardinality Its cardinality.
 * @param values Its values, none for NULL.
 * @returns The value.
 */
const responseOf = (
  baseType: ModelledBaseType,
  cardinality: "multiple" | "single",
  values: readonly Single[],
): Value => ({ baseType, cardinality, values });

/**
 * Construct a single string.
 *
 * @param value The string.
 * @returns The single.
 */
const stringOf = (value: string): Single => ({ baseType: "string", value });

/**
 * Construct a single identifier.
 *
 * @param value The identifier.
 * @returns The single.
 */
const identifierOf = (value: string): Single => ({ baseType: "identifier", value });

/**
 * Construct a single point.
 *
 * @param x Its x coordinate.
 * @param y Its y coordinate.
 * @returns The single.
 */
const pointOf = (x: bigint, y: bigint): Single => ({ baseType: "point", value: [x, y] });

/**
 * Give what a mapping maps a single string response to.
 *
 * @param mapping The mapping.
 * @param values The response's values, none for NULL.
 * @returns The mapped value.
 */
const mappedString = (mapping: Mapping, values: readonly Single[]): Value =>
  mappedResponse(mapping, responseOf("string", "single", values));

/**
 * Give what an area mapping maps a multiple point response to.
 *
 * @param mapping The area mapping.
 * @param points The points, none for NULL.
 * @returns The mapped value.
 */
const mappedPointsOf = (mapping: AreaMapping, points: readonly Single[]): Value =>
  mappedPoints(mapping, responseOf("point", "multiple", points));

/**
 * Read each lexical form as a value of a base type, as a post's members are read.
 *
 * @param baseType The base type.
 * @param lexicals The lexical forms, as written.
 * @returns The values, in order.
 */
const written = (baseType: ModelledBaseType, lexicals: readonly string[]): readonly Single[] =>
  lexicals.map((lexical) => Result.getOrThrow(parseLexical(baseType, lexical)));

/**
 * Drop repeated values pairwise: each value against every value kept before it, as `match`
 * compares two single values. It is the reference the keyed dedupe must agree with.
 *
 * @param values The values.
 * @returns The values no earlier value matches, in order.
 */
const pairwiseDistinct = (values: readonly Single[]): readonly Single[] =>
  Arr.dedupeWith(values, (left, right) =>
    match(
      { baseType: left.baseType, cardinality: "single", values: [left] },
      { baseType: right.baseType, cardinality: "single", values: [right] },
    ),
  );

/**
 * Report whether one area holds a point, through an area mapping that is that area alone, mapped
 * to 1 with a default of 0.
 *
 * @param entry The area.
 * @param x The point's x coordinate.
 * @param y The point's y coordinate.
 * @returns Whether the area maps the point.
 */
const holds = (entry: Omit<AreaMapEntry, "mappedValue">, x: bigint, y: bigint): boolean => {
  const value = mappedPointsOf(
    { ...targetMapping, defaultValue: 0, entries: [{ ...entry, mappedValue: 1 }] },
    [pointOf(x, y)],
  );

  return value.values[0]?.baseType === "float" && value.values[0].value === 1;
};

/**
 * Construct a multiple string response of distinct strings.
 *
 * @param count How many strings it holds.
 * @returns The response.
 */
const postedStrings = (count: number): Value =>
  responseOf(
    "string",
    "multiple",
    Array.from({ length: count }, (_, index) => stringOf(`v${index.toString(36)}`)),
  );

/**
 * Construct distinct points, none in {@link targetMapping}'s areas.
 *
 * @param count How many points.
 * @returns The points.
 */
const distinctPoints = (count: number): readonly Single[] =>
  Array.from({ length: count }, (_, index) => pointOf(BigInt(index), 1000n));

/**
 * Give a computation to time: it maps a response and discards the value.
 *
 * @param map The mapping of one response.
 * @returns The computation.
 */
const timed = (map: () => Value) => (): void => {
  map();
};

describe("mappedResponse", () => {
  it("maps BG010's answers: YORK and york to 0.5, Paris and NULL to 0", () => {
    assert.deepStrictEqual(mappedString(yorkMapping, [stringOf("YORK")]), floatValue(0.5));
    assert.deepStrictEqual(mappedString(yorkMapping, [stringOf("york")]), floatValue(0.5));
    assert.deepStrictEqual(mappedString(yorkMapping, [stringOf("Paris")]), floatValue(0));
    assert.deepStrictEqual(mappedString(yorkMapping, []), floatValue(0));
  });

  it("a value two entries match maps by the first in document order", () => {
    assert.deepStrictEqual(mappedString(tiedMapping, [stringOf("York")]), floatValue(0.5));
  });

  it("the bounds leave a single response's mapped value and its NULL's 0 as they are (reading 207)", () => {
    assert.deepStrictEqual(mappedString(boundedMapping, [stringOf("york")]), floatValue(0.5));
    assert.deepStrictEqual(mappedString(boundedMapping, [stringOf("Paris")]), floatValue(0));
    assert.deepStrictEqual(mappedString(boundedMapping, []), floatValue(0));
  });

  it("the bounds clamp a container's sum, and its NULL's 0 too (reading 207)", () => {
    const bounded: Mapping = {
      ...choicesMapping,
      lowerBound: Option.some(0.25),
      upperBound: Option.some(0.75),
    };

    assert.deepStrictEqual(
      mappedResponse(
        bounded,
        responseOf("identifier", "multiple", [identifierOf("A"), identifierOf("C")]),
      ),
      floatValue(0.75),
    );
    assert.deepStrictEqual(
      mappedResponse(bounded, responseOf("identifier", "multiple", [])),
      floatValue(0.25),
    );
  });

  it("a multiple response sums its distinct values, each once", () => {
    const answer = [identifierOf("A"), identifierOf("A"), identifierOf("C")];

    assert.deepStrictEqual(
      mappedResponse(choicesMapping, responseOf("identifier", "multiple", answer)),
      floatValue(1.5),
    );
  });

  it("an identifier key keeps its case, and a pair key matches in either order", () => {
    assert.deepStrictEqual(
      mappedResponse(
        choicesMapping,
        responseOf("identifier", "multiple", [identifierOf("a"), identifierOf("C")]),
      ),
      floatValue(0.5),
    );
    assert.deepStrictEqual(
      mappedResponse(
        oneKey({ baseType: "pair", value: ["A", "B"] }, 0),
        responseOf("pair", "single", [{ baseType: "pair", value: ["B", "A"] }]),
      ),
      floatValue(1),
    );
  });

  it("a multiple response counts a value once however it is written, as the pairwise comparison does", () => {
    // Each NaN counts: `match` compares floats with `===`, so a NaN equals no value, itself included.
    // `1e400` is INF (reading 144), so it counts once with the INF written beside it.
    const cases = [
      [choicesMapping, "identifier", ["A", "A", "C"], 1.5],
      [
        oneKey({ baseType: "integer", value: 5n }, 0.25),
        "integer",
        ["5", "+5", "05", "-0", "0", "+0", "7"],
        1.5,
      ],
      [
        oneKey({ baseType: "float", value: 1 }, 0.125),
        "float",
        ["1", "1.0", "1e0", "+1.00", "10E-1", "0", "-0", "0.0"],
        1.125,
      ],
      [
        oneKey({ baseType: "float", value: 1 }, 0.125),
        "float",
        ["NaN", "NaN", "INF", "1e400", "-INF"],
        0.5,
      ],
      [yorkMapping, "string", ["York", "York", "york", "YORK", " York"], 2],
      [
        oneKey({ baseType: "pair", value: ["A", "B"] }, 0.5),
        "pair",
        ["A B", "B A", "A\tB", "B  A", "A C", "C A"],
        1.5,
      ],
      [
        oneKey({ baseType: "directedPair", value: ["A", "B"] }, 0.5),
        "directedPair",
        ["A B", "B A", "A  B", "B\nA"],
        1.5,
      ],
    ] as const;

    for (const [mapping, baseType, lexicals, expected] of cases) {
      const values = written(baseType, lexicals);
      const mappedOf = (each: readonly Single[]): Value =>
        mappedResponse(mapping, responseOf(baseType, "multiple", each));

      assert.deepStrictEqual(mappedOf(values), floatValue(expected), lexicals.join(","));
      assert.deepStrictEqual(
        mappedOf(values),
        mappedOf(pairwiseDistinct(values)),
        lexicals.join(","),
      );
    }
  });

  it.effect(
    `maps a post of distinct strings in time linear in their number: ${String(growthFactor)} times the strings take less than ${String(growthLimit)} times as long`,
    () =>
      Effect.gen(function* linearStrings() {
        const fewer = postedStrings(5000);
        const more = postedStrings(5000 * growthFactor);

        assert.deepStrictEqual(
          mappedResponse(yorkMapping, { ...more, values: [...more.values, stringOf("York")] }),
          floatValue(1),
        );
        assert.isBelow(
          yield* growthRatio(
            timed(() => mappedResponse(yorkMapping, fewer)),
            timed(() => mappedResponse(yorkMapping, more)),
          ),
          growthLimit,
        );
      }),
  );
});

describe("mappedPoints", () => {
  it("maps a point inside the circle, or on its edge, to 1, and one in no area to the default", () => {
    assert.deepStrictEqual(mappedPointsOf(targetMapping, [pointOf(102n, 113n)]), floatValue(1));
    assert.deepStrictEqual(mappedPointsOf(targetMapping, [pointOf(118n, 113n)]), floatValue(1));
    assert.deepStrictEqual(mappedPointsOf(targetMapping, [pointOf(102n, 97n)]), floatValue(1));
    assert.deepStrictEqual(mappedPointsOf(targetMapping, [pointOf(200n, 200n)]), floatValue(0.25));
  });

  it("maps an area once however many points it holds, and adds the default once per distinct point in no area", () => {
    assert.deepStrictEqual(
      mappedPointsOf(targetMapping, [pointOf(102n, 113n), pointOf(110n, 113n)]),
      floatValue(1),
    );
    assert.deepStrictEqual(
      mappedPointsOf(targetMapping, [pointOf(102n, 113n), pointOf(10n, 10n), pointOf(110n, 113n)]),
      floatValue(1.5),
    );
    assert.deepStrictEqual(
      mappedPointsOf(targetMapping, [
        pointOf(200n, 200n),
        pointOf(300n, 300n),
        pointOf(200n, 200n),
      ]),
      floatValue(0.5),
    );
  });

  it("counts a point once however it is written, as the pairwise comparison does", () => {
    const points = written("point", [
      "200 300",
      "+200 0300",
      "200\t300",
      "300 200",
      "0 -500",
      "-0 -500",
      "+0 -0500",
      "102 113",
      "102  +113",
    ]);

    assert.deepStrictEqual(mappedPointsOf(targetMapping, points), floatValue(1.75));
    assert.deepStrictEqual(
      mappedPointsOf(targetMapping, points),
      mappedPointsOf(targetMapping, pairwiseDistinct(points)),
    );
  });

  it.effect(
    `maps distinct points in time linear in their number: ${String(growthFactor)} times the points take less than ${String(growthLimit)} times as long`,
    () =>
      Effect.gen(function* linearPoints() {
        const fewer = distinctPoints(5000);
        const more = distinctPoints(5000 * growthFactor);

        assert.deepStrictEqual(mappedPointsOf(targetMapping, more), floatValue(10_000));
        assert.isBelow(
          yield* growthRatio(
            timed(() => mappedPointsOf(targetMapping, fewer)),
            timed(() => mappedPointsOf(targetMapping, more)),
          ),
          growthLimit,
        );
      }),
  );

  it("a NULL response maps to 0 before the bounds, and the bounds clamp the sum", () => {
    const clampedMapping: AreaMapping = {
      ...targetMapping,
      lowerBound: Option.some(0.5),
      upperBound: Option.some(1.25),
    };

    assert.deepStrictEqual(mappedPointsOf(targetMapping, []), floatValue(0));
    assert.deepStrictEqual(mappedPointsOf(clampedMapping, []), floatValue(0.5));
    assert.deepStrictEqual(
      mappedPointsOf(clampedMapping, [pointOf(102n, 113n), pointOf(10n, 10n)]),
      floatValue(1.25),
    );
  });

  it("a point two areas hold is mapped by the first listed", () => {
    assert.deepStrictEqual(
      mappedPointsOf(overlappingMapping, [pointOf(45n, 35n)]),
      floatValue(0.5),
    );
    assert.deepStrictEqual(
      mappedPointsOf(overlappingMapping, [pointOf(45n, 35n), pointOf(55n, 35n)]),
      floatValue(1.5),
    );
  });

  it("each shape holds the points on its boundary, and default holds every point", () => {
    const rect = { coords: [10, 20, 30, 40], shape: "rect" } as const;
    const circle = { coords: [0, 0, 5], shape: "circle" } as const;
    const ellipse = { coords: [0, 0, 4, 2], shape: "ellipse" } as const;
    const triangle = { coords: [0, 0, 10, 0, 0, 10], shape: "poly" } as const;
    const closed = { coords: [0, 0, 10, 0, 0, 10, 0, 0], shape: "poly" } as const;
    const cases = [
      [rect, 10n, 20n, true],
      [rect, 30n, 40n, true],
      [rect, 20n, 30n, true],
      [rect, 31n, 40n, false],
      [circle, 3n, 4n, true],
      [circle, 4n, 4n, false],
      [ellipse, 4n, 0n, true],
      [ellipse, 0n, -2n, true],
      [ellipse, 2n, 1n, true],
      [ellipse, 3n, 2n, false],
      [triangle, 0n, 0n, true],
      [triangle, 5n, 5n, true],
      [triangle, 2n, 2n, true],
      [triangle, 6n, 6n, false],
      [triangle, -1n, 0n, false],
      [closed, 5n, 5n, true],
      [closed, 6n, 6n, false],
      [{ coords: [], shape: "default" }, 999n, -5n, true],
    ] as const;

    for (const [entry, x, y, expected] of cases) {
      assert.strictEqual(holds(entry, x, y), expected, `${entry.shape} ${String(x)} ${String(y)}`);
    }
  });

  it("compares a coordinate beyond 2^53 after its one conversion to the nearest double", () => {
    const edge = { coords: [0, 0, 9_007_199_254_740_992, 1], shape: "rect" } as const;

    assert.isTrue(holds(edge, 2n ** 53n + 1n, 0n));
    assert.isFalse(holds(edge, 2n ** 53n + 2n, 0n));
  });
});
