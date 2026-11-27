/**
 * `when-present(probe, value)` (composable-operators.md §2.1 P13): `value` unchanged where `probe`
 * is not NULL, and NULL where it is. Its result has `value`'s cardinality and base type, whatever
 * they are, so it is generic in the value's type. Under the engine's one NULL law (any value
 * operand NULL makes the result NULL), its present case is `value` itself. The converter writes an
 * essay's operand as `when-present(normalize-space(markup-text(R)), R)`: the raw answer, or NULL
 * where it is markup and white space alone, so an empty essay makes no request.
 *
 * @module
 */
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import { nullOf, valueTypeOf } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

/**
 * `when-present` over values: `value` where `probe` is not NULL, and NULL of `value`'s type where
 * it is.
 *
 * @param probe - The probe.
 * @param value - The value.
 * @returns `value`, or its NULL.
 */
export const whenPresent = (probe: Value, value: Value): Value =>
  probe.kind === "null" ? nullOf(valueTypeOf(value)) : value;

/**
 * The `when-present` operator's registry entry.
 */
export const whenPresentOperator = inlineOperator({
  apply: ([probe, value]) => whenPresent(probe, value),
  definition: `${alphaDefinitionPrefix}when-present`,
  operands: [
    { form: "expression", name: "probe", type: { cardinality: "any" } },
    { form: "expression", name: "value", type: { cardinality: "any" } },
  ],
  result: { operand: 1 },
});
