/**
 * Response rules a kind's scoring writes: each adds to `SCORE`, which the item declares as a float
 * starting at 0, so a kind of several responses writes one rule for each.
 *
 * @module
 */
import { element } from "#specimen/xml.ts";

/**
 * Add an expression's value to `SCORE`.
 *
 * @param expression The expression, a float.
 * @returns The `qti-set-outcome-value`.
 */
const added = (expression: string): string =>
  element("qti-set-outcome-value", { identifier: "SCORE" }, [
    element("qti-sum", {}, [element("qti-variable", { identifier: "SCORE" }, []), expression]),
  ]);

/**
 * A float written as a base value.
 *
 * @param value The float.
 * @returns The `qti-base-value`.
 */
export const float = (value: number): string =>
  element("qti-base-value", { "base-type": "float" }, [String(value)]);

/**
 * Add `worth` when a condition holds: a response matching its correct response, one of its values
 * matching the value it should hold, a count reaching its least.
 *
 * @param condition The condition, a boolean expression.
 * @param worth What it adds.
 * @returns The rule.
 */
export const credited = (condition: string, worth: number): string =>
  element("qti-response-condition", {}, [
    element("qti-response-if", {}, [condition, added(float(worth))]),
  ]);

/**
 * Add a mapping's value of a response, and nothing when it is NULL, as QTI's `map_response` and
 * `map_response_point` templates do.
 *
 * @param response The response's identifier.
 * @param mapper The mapping's operator: `qti-map-response`, or `qti-map-response-point` for a
 *   point response's `qti-area-mapping`.
 * @returns The rule.
 */
const mappedBy = (
  response: string,
  mapper: "qti-map-response" | "qti-map-response-point",
): string =>
  element("qti-response-condition", {}, [
    element("qti-response-if", {}, [
      element("qti-not", {}, [
        element("qti-is-null", {}, [element("qti-variable", { identifier: response }, [])]),
      ]),
      added(element(mapper, { identifier: response }, [])),
    ]),
  ]);

/**
 * Add a response's mapped value: its declaration's `qti-mapping` applied to it.
 *
 * @param response The response's identifier.
 * @returns The rule.
 */
export const mapped = (response: string): string => mappedBy(response, "qti-map-response");

/**
 * Add a point response's mapped value: its declaration's `qti-area-mapping` applied to its points.
 *
 * @param response The response's identifier.
 * @returns The rule.
 */
export const mappedPoints = (response: string): string =>
  mappedBy(response, "qti-map-response-point");

/**
 * Whether a response matches its correct response: the `qti-match` of its value and its
 * `qti-correct`, as QTI's `match_correct` template asks. A NULL response matches nothing.
 *
 * @param response The response's identifier.
 * @returns The condition.
 */
export const matchesCorrect = (response: string): string =>
  element("qti-match", {}, [
    element("qti-variable", { identifier: response }, []),
    element("qti-correct", { identifier: response }, []),
  ]);
