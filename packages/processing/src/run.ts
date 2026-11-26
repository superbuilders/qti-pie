/**
 * A run of processing as an operator sees it: the reads, the draw stream, the recorded answers and
 * the failures and demands it records. The evaluator makes one per processing run; an operator
 * reads its operands through {@link Run.evaluate}, in the order QTI evaluates them, so the draws a
 * run makes follow evaluation order (the stream's contract).
 *
 * @module
 */
import type { Expression, ItemFilter, LiteralOr, VariableRef } from "#processing/ir.ts";
import { toFloat } from "#processing/numbers.ts";
import type { Value, ValueType } from "#processing/value.ts";

/**
 * Why a run failed: a stated limit reached, or a value no variable may hold. A failed run is never
 * a grade; the attempt it graded stays unprocessed (reading `engine-size-limit`, reading
 * `completion-status-values`).
 */
export type ProcessingFailure =
  | {
      readonly bound: "container-members" | "integer-bits";
      readonly kind: "computation-bound";
      readonly place: number;
    }
  | {
      readonly actual: ValueType;
      readonly expected: ValueType;
      readonly identifier: string;
      readonly kind: "set-type";
      readonly place: number;
    }
  | { readonly kind: "completion-status"; readonly place: number; readonly value: Value };

/**
 * A recorded operator the run reached whose answer is not in: what the answer is asked for.
 */
export interface Demand {
  readonly definition: string;
  /**
   * The most the answer may score: the value of the operator's maximum operand.
   */
  readonly maximum: Value;
  readonly operands: readonly Value[];
  readonly place: number;
}

/**
 * One response of a test's member, as outcome processing's item expressions read it.
 */
export interface MemberResponse {
  readonly correct: Value;
  readonly default: Value;
  readonly identifier: string;
  readonly value: Value;
}

/**
 * One outcome of a test's member, with the bounds it declares.
 */
export interface MemberOutcome {
  readonly identifier: string;
  readonly normalMaximum: number | undefined;
  readonly normalMinimum: number | undefined;
  readonly value: Value;
}

/**
 * One item session of a test, as the outcome-processing-only expressions read it (§2.11.2).
 */
export interface MemberState {
  readonly categories: readonly string[];
  /**
   * The item ref's identifier.
   */
  readonly identifier: string;
  readonly numAttempts: bigint;
  /**
   * The occurrence of the item ref, 1 and up.
   */
  readonly occurrence: bigint;
  readonly outcomes: readonly MemberOutcome[];
  readonly presented: boolean;
  readonly responses: readonly MemberResponse[];
  /**
   * The identifiers of every section that holds the item ref, nested ones included.
   */
  readonly sections: readonly string[];
  readonly selected: boolean;
  /**
   * The item ref's weights by identifier.
   */
  readonly weights: ReadonlyMap<string, number>;
}

/**
 * A processing run, as an operator reads it.
 */
export interface Run {
  /**
   * The current value of a variable's correct response, NULL where it has none.
   */
  readonly correctOf: (variable: VariableRef) => Value;
  /**
   * The current default of a variable, NULL where it has none.
   */
  readonly defaultOf: (variable: VariableRef) => Value;
  /**
   * Record a recorded operator the run reached whose answer is not in. The run's result is then
   * Pending.
   */
  readonly demand: (demand: Demand) => void;
  /**
   * The stream's next draw, an unsigned 32-bit integer.
   */
  readonly draw: () => number;
  /**
   * Evaluate an operand. Operators evaluate their operands in document order, each once, but where
   * QTI re-evaluates one (`qti-repeat`'s passes).
   */
  readonly evaluate: (expression: Expression) => Value;
  /**
   * Record that the run failed. The first failure ends the run; the operator gives NULL meanwhile.
   */
  readonly fail: (failure: ProcessingFailure) => void;
  /**
   * The test's item sessions an item filter keeps, in the test's order. Only outcome processing
   * compiles an expression that reads them.
   */
  readonly members: (filter: ItemFilter) => readonly MemberState[];
  /**
   * The variable's value: its current value, NULL of its declared type where the run holds none,
   * and for a member's integer or float read with a weight, the value times the weight, a float
   * (§7.47.2).
   */
  readonly read: (variable: VariableRef) => Value;
  /**
   * The recorded answer of the recorded operator at a place, or `undefined` where none is in.
   */
  readonly recorded: (place: number) => Value | undefined;
}

/**
 * The most bits an integer a run computes may take (reading `engine-size-limit`).
 */
export const integerBitBound = 1_000_000;

/**
 * The most members a container a run computes may hold (reading `engine-size-limit`).
 */
export const containerMemberBound = 1_000_000;

/**
 * Hold a computed integer to {@link integerBitBound}: past it the run fails, `computation-bound`.
 *
 * @param run - The run.
 * @param place - The place of the expression that computed it.
 * @param integer - The integer.
 * @returns The integer, or `undefined` where the run failed.
 */
export const boundedInteger = (run: Run, place: number, integer: bigint): bigint | undefined => {
  const magnitude = integer < 0n ? -integer : integer;
  if (magnitude.toString(2).length <= integerBitBound) {
    return integer;
  }

  run.fail({ bound: "integer-bits", kind: "computation-bound", place });

  return undefined;
};

/**
 * Hold a computed container's size to {@link containerMemberBound}: past it the run fails,
 * `computation-bound`.
 *
 * @param run - The run.
 * @param place - The place of the expression that computed it.
 * @param size - The number of members.
 * @returns Whether the size is within the bound.
 */
export const withinContainerBound = (run: Run, place: number, size: number): boolean => {
  if (size <= containerMemberBound) {
    return true;
  }

  run.fail({ bound: "container-members", kind: "computation-bound", place });

  return false;
};

/**
 * The value an attribute that may name a variable holds at run time: its literal, or the variable's
 * single value of the literal's type (an integer for an integer attribute, a float or an integer
 * for a float one, a string for a string one); NULL or any other value is `undefined`.
 *
 * @param run - The run.
 * @param attribute - The attribute.
 * @returns The value.
 */
export const integerAttribute = (run: Run, attribute: LiteralOr<bigint>): bigint | undefined => {
  if (attribute.kind === "literal") {
    return attribute.value;
  }

  const value = run.read(attribute.variable);

  return value.kind === "single" && value.base === "integer" ? value.value : undefined;
};

/**
 * The value a float attribute that may name a variable holds at run time: its literal, or the
 * variable's single float, or its single integer as the nearest finite double (reading
 * `integer-unbounded`).
 *
 * @param run - The run.
 * @param attribute - The attribute.
 * @returns The value, or `undefined` for NULL or any other value.
 */
export const floatAttribute = (run: Run, attribute: LiteralOr<number>): number | undefined => {
  if (attribute.kind === "literal") {
    return attribute.value;
  }

  const value = run.read(attribute.variable);
  if (value.kind !== "single") {
    return undefined;
  }

  if (value.base === "float") {
    return value.value;
  }

  return value.base === "integer" ? toFloat(value.value) : undefined;
};

/**
 * The value a string attribute that may name a variable holds at run time: its literal, or the
 * variable's single string.
 *
 * @param run - The run.
 * @param attribute - The attribute.
 * @returns The value, or `undefined` for NULL or any other value.
 */
export const stringAttribute = (run: Run, attribute: LiteralOr<string>): string | undefined => {
  if (attribute.kind === "literal") {
    return attribute.value;
  }

  const value = run.read(attribute.variable);

  return value.kind === "single" && value.base === "string" ? value.value : undefined;
};
