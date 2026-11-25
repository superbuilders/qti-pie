/**
 * A response declaration, built from its parts: a kind writes its correct response, and its
 * mapping where its scoring maps, as children of its declaration.
 *
 * @module
 */
import { element } from "#specimen/xml.ts";

/**
 * Declare a response.
 *
 * @param identifier The response's identifier.
 * @param cardinality Its cardinality.
 * @param baseType Its base type, none for a record.
 * @param parts Its children, in the XSD's order, as one list: a default value, a correct response,
 *   a mapping or an area mapping.
 * @returns The `qti-response-declaration`.
 */
export const declaration = (
  identifier: string,
  cardinality: "multiple" | "ordered" | "single",
  baseType: string,
  parts: readonly string[],
): string =>
  element("qti-response-declaration", { "base-type": baseType, cardinality, identifier }, parts);

/**
 * A correct response of these values, each in its lexical form.
 *
 * @param values The values, in order.
 * @returns The `qti-correct-response`.
 */
export const correctResponse = (values: readonly string[]): string =>
  element(
    "qti-correct-response",
    {},
    values.map((value) => element("qti-value", {}, [value])),
  );

/**
 * A mapping of these keys, each to 1, every other value to 0, and the sum never below 0.
 *
 * @param keys The keys, each in its lexical form.
 * @returns The `qti-mapping`.
 */
export const mapping = (keys: readonly string[]): string =>
  element(
    "qti-mapping",
    { "default-value": 0, "lower-bound": 0 },
    keys.map((key) => element("qti-map-entry", { "map-key": key, "mapped-value": 1 }, [])),
  );
