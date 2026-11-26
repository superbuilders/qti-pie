/**
 * The logic family: `qti-and`, `qti-or`, `qti-not` and `qti-any-n` (§2.11.3.1, .10, .15, .35), over
 * single booleans, in three-valued logic: a NULL operand is unknown, and the result is NULL only
 * where the unknowns could decide it.
 *
 * @module
 */
import type { Expression, Node } from "#processing/ir.ts";
import {
  checked,
  noAttributes,
  oneOperand,
  operandsTaken,
  singleBoolean,
  someOperands,
} from "#processing/operators/operator.ts";
import type { OperandRule, OperatorTable } from "#processing/operators/operator.ts";
import { integerOrVariable } from "#processing/operators/attributes.ts";
import { integerAttribute } from "#processing/run.ts";
import type { Run } from "#processing/run.ts";
import { nullOf, single } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

/**
 * What every logic operand is: a single boolean.
 */
const boolean: OperandRule = { bases: ["boolean"], cardinalities: ["single"] };

/**
 * The single boolean NULL.
 */
const unknown = nullOf({ base: "boolean", cardinality: "single" });

/**
 * A single boolean.
 *
 * @param holds - The boolean.
 * @returns The value.
 */
const truth = (holds: boolean): Value => single("boolean", holds);

/**
 * How many operands are true, false and unknown (NULL, or not a single boolean).
 */
interface Tally {
  readonly falses: number;
  readonly trues: number;
  readonly unknowns: number;
}

/**
 * Evaluate operands in order and tally their truth.
 *
 * @param operands - The operands.
 * @param run - The run.
 * @returns The tally.
 */
const tallyOf = (operands: readonly Expression[], run: Run): Tally => {
  let falses = 0;
  let trues = 0;
  let unknowns = 0;
  for (const operand of operands) {
    const value = run.evaluate(operand);
    if (value.kind === "single" && value.base === "boolean") {
      if (value.value) {
        trues += 1;
      } else {
        falses += 1;
      }
    } else {
      unknowns += 1;
    }
  }

  return { falses, trues, unknowns };
};

/**
 * `qti-any-n`'s value: true when at least `min` and at most `max` operands are true whatever the
 * unknowns are, false when no way of reading the unknowns makes it so (a `min` above `max` among
 * them), NULL otherwise (§2.11.3.1). The trues the unknowns allow run from the trues to the trues
 * and unknowns together, so the readings meet `[min, max]` in all, some or none of them.
 *
 * @param tally - The operands' tally.
 * @param min - The least count of trues.
 * @param max - The most count of trues.
 * @returns The value.
 */
const anyNOf = ({ trues, unknowns }: Tally, min: bigint, max: bigint): Value => {
  const least = BigInt(trues);
  const most = BigInt(trues + unknowns);
  if (min > max || most < min || least > max) {
    return truth(false);
  }

  return least >= min && most <= max ? truth(true) : unknown;
};

/**
 * `qti-and` (§2.11.3.10): false if any operand is false, else NULL if any is unknown, else true.
 *
 * @param node - The node.
 * @param run - The run.
 * @returns The value.
 */
const evaluateAnd = (node: Node<"and">, run: Run): Value => {
  const { falses, unknowns } = tallyOf(node.operands, run);
  if (falses > 0) {
    return truth(false);
  }

  return unknowns > 0 ? unknown : truth(true);
};

/**
 * `qti-or` (§2.11.3.15): true if any operand is true, else NULL if any is unknown, else false.
 *
 * @param node - The node.
 * @param run - The run.
 * @returns The value.
 */
const evaluateOr = (node: Node<"or">, run: Run): Value => {
  const { trues, unknowns } = tallyOf(node.operands, run);
  if (trues > 0) {
    return truth(true);
  }

  return unknowns > 0 ? unknown : truth(false);
};

/**
 * `qti-not` (§2.11.3.35): the negation, NULL for NULL.
 *
 * @param node - The node.
 * @param run - The run.
 * @returns The value.
 */
const evaluateNot = (node: Node<"not">, run: Run): Value => {
  const value = run.evaluate(node.operands[0]);

  return value.kind === "single" && value.base === "boolean" ? truth(!value.value) : unknown;
};

/**
 * `qti-any-n` (§2.11.3.1). Its `min` and `max` are read before its operands; one that names a
 * variable holding NULL gives NULL.
 *
 * @param node - The node.
 * @param run - The run.
 * @returns The value.
 */
const evaluateAnyN = (node: Node<"any-n">, run: Run): Value => {
  const min = integerAttribute(run, node.min);
  const max = integerAttribute(run, node.max);
  const tally = tallyOf(node.operands, run);

  return min === undefined || max === undefined ? unknown : anyNOf(tally, min, max);
};

/**
 * The logic family's operators.
 */
export const logicOperators: OperatorTable<"and" | "any-n" | "not" | "or"> = {
  and: {
    arity: someOperands,
    evaluate: evaluateAnd,
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, boolean, place, singleBoolean),
  },
  "any-n": {
    arity: someOperands,
    evaluate: evaluateAnyN,
    read: (element, context, place) => {
      const min = integerOrVariable(element, "min", undefined, context, place);
      if (!min.ok) {
        return min;
      }

      const max = integerOrVariable(element, "max", undefined, context, place);

      return max.ok ? checked({ max: max.value, min: min.value }) : max;
    },
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, boolean, place, singleBoolean),
  },
  not: {
    arity: oneOperand,
    evaluate: evaluateNot,
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, boolean, place, singleBoolean),
  },
  or: {
    arity: someOperands,
    evaluate: evaluateOr,
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, boolean, place, singleBoolean),
  },
};
