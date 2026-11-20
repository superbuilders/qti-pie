/**
 * What a mapping and an area mapping map a response's value to, the arithmetic
 * `qti-map-response` and `qti-map-response-point` share once the references family has found the
 * response and its declaration ({@link mappedResponse}, {@link mappedPoints}).
 *
 * A response's repeated values count once: they are told apart by a key written from each value
 * ({@link distinct}), in time linear in their number. A container's sum is clamped to the
 * mapping's `lower-bound` and `upper-bound`, a single response's is not (reading 207).
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { areaHolds } from "#plate/engine/expressions/shapes.ts";
import { foldCase } from "#plate/engine/expressions/text.ts";
import { floatValue, toFloat } from "#plate/engine/numbers.ts";
import type { AreaMapping, MapEntry, Mapping } from "#plate/model/item.ts";
import { format, sameSingle } from "#plate/model/values.ts";
import type { Single, Value } from "#plate/model/values.ts";

/**
 * Give the key {@link distinct} tells a value apart by: its base type and its value as `format`
 * writes it, so two values share a key exactly when {@link sameSingle} finds them equal, however
 * each was written (`+5` and `05` are one integer, `1.0` and `1e0` one float).
 *
 * Where `sameSingle` and `format` part, the key follows `sameSingle`: a `pair`'s identifiers are
 * written in code-unit order, as `sameSingle` matches a pair in either order, and a float's `-0` is
 * written as `0`, as `sameSingle` compares floats with `===`. That `===` makes a NaN equal to no
 * value, itself included, so a NaN has no key. A base type holds no space, and neither does an
 * identifier or a coordinate, so one space between the parts keeps two keys apart.
 *
 * @param single The value.
 * @returns Its key; none for a NaN.
 */
const distinctKey = (single: Single): Option.Option<string> => {
  if (single.baseType === "float") {
    const value = Object.is(single.value, -0) ? 0 : single.value;

    return Number.isNaN(value)
      ? Option.none()
      : Option.some(`float ${format({ baseType: "float", value })}`);
  }

  if (single.baseType === "pair") {
    const [first, second] = single.value;
    const value: readonly [string, string] = first <= second ? [first, second] : [second, first];

    return Option.some(`pair ${format({ baseType: "pair", value })}`);
  }

  return Option.some(`${single.baseType} ${format(single)}`);
};

/**
 * Drop a response's repeated values: each value is kept at its first occurrence, in order, and a
 * later value {@link sameSingle} finds equal to it is dropped.
 *
 * A `Set` of each value's {@link distinctKey} finds the repeats, so the time is linear in the
 * number of values: a candidate's post of many members costs what its length costs, where comparing
 * every pair would cost its square. A NaN has no key and is always kept, as `sameSingle` finds it
 * equal to nothing.
 *
 * @param values The response's values.
 * @returns The values no earlier value equals, in order.
 */
const distinct = (values: readonly Single[]): readonly Single[] => {
  const seen = new Set<string>();
  const kept: Single[] = [];
  for (const single of values) {
    const key = distinctKey(single);
    if (Option.isNone(key)) {
      kept.push(single);
    } else if (!seen.has(key.value)) {
      seen.add(key.value);
      kept.push(single);
    }
  }

  return kept;
};

/**
 * Report whether a map entry compares its key exactly: a string key when it is `case-sensitive`,
 * and a key of every other base type always, identifiers included.
 *
 * @param entry The map entry.
 * @returns Whether its key compares exactly.
 */
const comparesExactly = (entry: MapEntry): boolean =>
  entry.caseSensitive || entry.key.baseType !== "string";

/**
 * Report whether a map entry's key matches a response value: exactly when the entry compares
 * exactly, else as strings with case folded.
 *
 * @param entry The map entry.
 * @param single The response value.
 * @returns Whether the entry maps it.
 */
const keyMatches = (entry: MapEntry, single: Single): boolean =>
  !comparesExactly(entry) && entry.key.baseType === "string" && single.baseType === "string"
    ? foldCase(entry.key.value) === foldCase(single.value)
    : sameSingle(entry.key, single);

/**
 * Give the value a mapping maps one response value to: the value of the first entry in document
 * order that matches it, else the mapping's default.
 *
 * Overlapping entries are valid, so a value two or more entries match maps by the first of them
 * listed. That is the order QTI gives an area mapping ("each area is tested in turn, with those
 * listed first taking priority in the case where areas overlap"), and reading 165 ("Two string map
 * keys that differ only by case are two keys, and a response that matches several entries takes
 * the first one listed"), which this renderer follows: a mapping that lists `York` then `york`,
 * both compared with case folded, maps `york` by `York`. BG010 lists its case-sensitive `York`
 * before its `york`, so its `York` maps by the first and `YORK` by the second.
 *
 * @param mapping The response's mapping.
 * @param single The response value.
 * @returns The mapped value.
 */
const mappedValue = (mapping: Mapping, single: Single): number =>
  Option.match(
    Arr.findFirst(mapping.entries, (entry) => keyMatches(entry, single)),
    { onNone: () => mapping.defaultValue, onSome: (entry) => entry.value },
  );

/**
 * Give the value a mapping or an area mapping gives a response's sum: a single float, a container's
 * sum clamped to the mapping's `lower-bound` and `upper-bound`, each unbounded when absent, and a
 * single response's sum as it is. The bounds are "for the result of mapping a container", and a
 * single response gives "simply the mapped target value from the map" (reading 207).
 *
 * @param mapping The mapping's bounds.
 * @param response The response, whose cardinality decides whether the bounds apply.
 * @param sum The sum of its mapped values.
 * @returns The single float.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_Mapping.Attr_lower-bound
 */
const clamped = (
  mapping: Pick<AreaMapping | Mapping, "lowerBound" | "upperBound">,
  response: Value,
  sum: number,
): Value => {
  if (response.cardinality === "single") {
    return floatValue(sum);
  }

  const lower = Option.getOrElse(mapping.lowerBound, () => Number.NEGATIVE_INFINITY);
  const upper = Option.getOrElse(mapping.upperBound, () => Number.POSITIVE_INFINITY);

  return floatValue(Math.min(upper, Math.max(lower, sum)));
};

/**
 * Find the first area, in document order, that holds a point.
 *
 * @param mapping The area mapping.
 * @param x The point's x coordinate, as a float.
 * @param y The point's y coordinate, as a float.
 * @returns The area's index among the mapping's entries, or -1 when no area holds the point.
 */
const firstArea = (mapping: AreaMapping, x: number, y: number): number =>
  mapping.entries.findIndex((entry) => areaHolds[entry.shape](entry.coords, x, y));

/**
 * Sum what an area mapping maps a response's points to, before the bounds.
 *
 * QTI tests the points "against each area in turn, with those listed first taking priority in the
 * case where areas overlap", and "each area can be mapped once only". The rest is reading 52's:
 *
 * - A point on a shape's boundary is inside (`rect`, `circle`, `ellipse` and `poly`, edges included;
 *   `default` holds every point), as {@link areaHolds} reads it.
 * - Areas are tried in document order and the first that holds a point maps it; each area is mapped
 *   at most once.
 * - Each distinct point that falls in no area adds `default-value` once, as `map_response` treats an
 *   unmapped value. Points are told apart as {@link distinct} tells values apart, by their two
 *   exact coordinates, in time linear in their number.
 *
 * A coordinate is compared after the one conversion, {@link toFloat}.
 *
 * @param mapping The response's area mapping.
 * @param points The response's values, a point each.
 * @returns The sum.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#ExpMapResponsePoint
 */
const areaSum = (mapping: AreaMapping, points: readonly Single[]): number => {
  const mapped = new Set<number>();
  let sum = 0;
  for (const single of distinct(points)) {
    const area =
      single.baseType === "point"
        ? firstArea(mapping, toFloat(single.value[0]), toFloat(single.value[1]))
        : -1;
    const entry = mapping.entries[area];
    if (entry === undefined) {
      sum += mapping.defaultValue;
    } else if (!mapped.has(area)) {
      mapped.add(area);
      sum += entry.mappedValue;
    }
  }

  return sum;
};

/**
 * Give the value a mapping maps a response to, as `qti-map-response` does: a single float, the sum
 * of the mapped values of the response's distinct values ({@link distinct}), so a `single` value
 * maps to its one value's, `{B,B,C}` counts `B` once, and a NULL response maps to 0; a container's
 * sum, its NULL's 0 included, clamped to the mapping's bounds ({@link clamped}).
 *
 * @param mapping The response's mapping.
 * @param response The response's value.
 * @returns The single float.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#ExpMapResponse
 */
export const mappedResponse = (mapping: Mapping, response: Value): Value => {
  let sum = 0;
  for (const single of distinct(response.values)) {
    sum += mappedValue(mapping, single);
  }

  return clamped(mapping, response, sum);
};

/**
 * Give the value an area mapping maps a response's points to, as `qti-map-response-point` does: a
 * single float, {@link areaSum} of its points, so a NULL response maps to 0; a container's sum,
 * its NULL's 0 included, clamped to the area mapping's bounds ({@link clamped}).
 *
 * @param mapping The response's area mapping.
 * @param response The response's value.
 * @returns The single float.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#ExpMapResponsePoint
 */
export const mappedPoints = (mapping: AreaMapping, response: Value): Value =>
  clamped(mapping, response, areaSum(mapping, response.values));
