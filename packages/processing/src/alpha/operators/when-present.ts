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

/**
 * The `when-present` operator's registry entry.
 */
export const whenPresentOperator = inlineOperator({
  apply: ([, value]) => value,
  definition: `${alphaDefinitionPrefix}when-present`,
  operands: [
    { form: "expression", name: "probe", type: { cardinality: "any" } },
    { form: "expression", name: "value", type: { cardinality: "any" } },
  ],
  result: { operand: 1 },
});
