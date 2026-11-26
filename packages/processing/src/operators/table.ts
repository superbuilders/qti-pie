/**
 * The closed table of the standard operators: one operator of every QTI 3.0.1 expression kind,
 * joined from the families, so the evaluator looks a kind up here alone and a kind without its
 * operator is a type error, never a run-time miss.
 *
 * @module
 */
import type { ExpressionKind } from "#processing/ir.ts";
import { arithmeticOperators } from "#processing/operators/arithmetic.ts";
import { comparisonOperators } from "#processing/operators/comparison.ts";
import { containersOperators } from "#processing/operators/containers.ts";
import { customOperators } from "#processing/operators/custom.ts";
import { functionsOperators } from "#processing/operators/functions.ts";
import { logicOperators } from "#processing/operators/logic.ts";
import { mappingOperators } from "#processing/operators/mapping.ts";
import type { OperatorTable } from "#processing/operators/operator.ts";
import { randomOperators } from "#processing/operators/random.ts";
import { stringsOperators } from "#processing/operators/strings.ts";
import { testLevelOperators } from "#processing/operators/test-level.ts";
import { valuesOperators } from "#processing/operators/values.ts";

/**
 * Every expression kind's operator.
 */
export const operatorTable: OperatorTable<ExpressionKind> = Object.freeze({
  ...arithmeticOperators,
  ...comparisonOperators,
  ...containersOperators,
  ...customOperators,
  ...functionsOperators,
  ...logicOperators,
  ...mappingOperators,
  ...randomOperators,
  ...stringsOperators,
  ...testLevelOperators,
  ...valuesOperators,
});
