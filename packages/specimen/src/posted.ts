/**
 * The child's responses as a case holds them, typed as plate holds a response's value: one
 * constructor per kind of value a kind's interaction writes, each in the cardinality the kind's
 * item declares, and {@link responding}, which names a value under its response and leaves a
 * response the child left untouched out, so a case's response stays sparse.
 *
 * @module
 */
import { isNullResponse } from "@qti-pie/plate";
import type { Responses, Value } from "@qti-pie/plate";

/**
 * The cardinality of a response of a base type.
 */
type Cardinality = Value["cardinality"];

/**
 * A value of identifiers, as a Choice, a Hotspot, a Hot Text, an Inline Choice, an Order or a
 * Graphic Order holds one.
 *
 * @param cardinality The response's declared cardinality.
 * @param identifiers The identifiers, in order.
 * @returns The value.
 */
export const identifierValue = (
  cardinality: Cardinality,
  identifiers: readonly string[],
): Value => ({
  baseType: "identifier",
  cardinality,
  values: identifiers.map((value) => ({ baseType: "identifier", value })),
});

/**
 * A value of pairs, as an Associate or a Graphic Associate holds one: each pair's two identifiers
 * as the child made it.
 *
 * @param cardinality The response's declared cardinality.
 * @param pairs The pairs, in order.
 * @returns The value.
 */
export const pairValue = (
  cardinality: Cardinality,
  pairs: readonly (readonly [string, string])[],
): Value => ({
  baseType: "pair",
  cardinality,
  values: pairs.map((value) => ({ baseType: "pair", value })),
});

/**
 * A value of directed pairs, as a Match, a Gap Match or a Graphic Gap Match holds one: each pair's
 * source, then its target.
 *
 * @param cardinality The response's declared cardinality.
 * @param pairs The pairs, in order.
 * @returns The value.
 */
export const directedPairValue = (
  cardinality: Cardinality,
  pairs: readonly (readonly [string, string])[],
): Value => ({
  baseType: "directedPair",
  cardinality,
  values: pairs.map((value) => ({ baseType: "directedPair", value })),
});

/**
 * A value of points, as a Select Point or a Position Object holds one: each point x then y, in the
 * picture's whole pixels.
 *
 * @param cardinality The response's declared cardinality.
 * @param points The points, in order.
 * @returns The value.
 */
export const pointValue = (
  cardinality: Cardinality,
  points: readonly (readonly [x: number, y: number])[],
): Value => ({
  baseType: "point",
  cardinality,
  values: points.map(([x, y]) => ({ baseType: "point", value: [BigInt(x), BigInt(y)] })),
});

/**
 * A value of strings, as a Text Entry or an Extended Text holds one: each text as the child typed
 * it.
 *
 * @param cardinality The response's declared cardinality.
 * @param texts The texts, in order.
 * @returns The value.
 */
export const stringValue = (cardinality: Cardinality, texts: readonly string[]): Value => ({
  baseType: "string",
  cardinality,
  values: texts.map((value) => ({ baseType: "string", value })),
});

/**
 * A single integer, as a Media's count of plays or a Portable Custom Interaction's answer holds
 * one.
 *
 * @param integer The integer, exact.
 * @returns The value.
 */
export const integerValue = (integer: bigint): Value => ({
  baseType: "integer",
  cardinality: "single",
  values: [{ baseType: "integer", value: integer }],
});

/**
 * A single number of a Slider's base type: an `integer`, exact, or a `float`.
 *
 * @param baseType The response's declared base type.
 * @param number The number; a whole one for an `integer`.
 * @returns The value.
 */
export const numberValue = (baseType: "float" | "integer", number: number): Value =>
  baseType === "integer"
    ? integerValue(BigInt(number))
    : { baseType, cardinality: "single", values: [{ baseType, value: number }] };

/**
 * A single boolean, as an End Attempt holds one.
 *
 * @param boolean The boolean.
 * @returns The value.
 */
export const booleanValue = (boolean: boolean): Value => ({
  baseType: "boolean",
  cardinality: "single",
  values: [{ baseType: "boolean", value: boolean }],
});

/**
 * Name a value under its response, as a case's response holds it: a value the child gave is named,
 * and a NULL one is left out, since the child left the response untouched and the attempt's start
 * holds it.
 *
 * @param response The response's identifier.
 * @param value The value.
 * @returns The response, or none.
 */
export const responding = (response: string, value: Value): Responses =>
  isNullResponse(value) ? {} : { [response]: value };
