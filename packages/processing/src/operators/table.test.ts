import { assert, describe, it } from "@effect/vitest";
import { expressionKinds } from "#processing/ir.ts";
import { arithmeticOperators } from "#processing/operators/arithmetic.ts";
import { comparisonOperators } from "#processing/operators/comparison.ts";
import { containersOperators } from "#processing/operators/containers.ts";
import { customOperators } from "#processing/operators/custom.ts";
import { functionsOperators } from "#processing/operators/functions.ts";
import { logicOperators } from "#processing/operators/logic.ts";
import { mappingOperators } from "#processing/operators/mapping.ts";
import { randomOperators } from "#processing/operators/random.ts";
import { stringsOperators } from "#processing/operators/strings.ts";
import { operatorTable } from "#processing/operators/table.ts";
import { testLevelOperators } from "#processing/operators/test-level.ts";
import { valuesOperators } from "#processing/operators/values.ts";

/**
 * Every family's table, as the closed table joins them.
 */
const families = [
  arithmeticOperators,
  comparisonOperators,
  containersOperators,
  customOperators,
  functionsOperators,
  logicOperators,
  mappingOperators,
  randomOperators,
  stringsOperators,
  testLevelOperators,
  valuesOperators,
] as const;

describe("the closed operator table", () => {
  it("holds one operator of every expression kind, each from exactly one family", () => {
    const kinds = families.flatMap((family) => Object.keys(family));

    assert.strictEqual(new Set(kinds).size, kinds.length, "no kind is in two families");
    assert.deepStrictEqual(kinds.toSorted(), [...expressionKinds].toSorted());
    assert.deepStrictEqual(Object.keys(operatorTable).toSorted(), [...expressionKinds].toSorted());
  });
});
