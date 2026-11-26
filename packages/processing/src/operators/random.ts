/**
 * The random family: `qti-random`, `qti-random-integer` and `qti-random-float` (sections
 * 2.11.3.36, 6.9.38 and 6.9.37), each drawing from the run's one stream in evaluation order
 * (`#processing/draws.ts`).
 *
 * Every NULL is settled before the first draw, so a NULL draws nothing and leaves the stream where
 * it was for every later draw (reading `null-results`, item 8): a container that is NULL, a range
 * that holds no value (`max` below `min`, a `step` of 0 or below, a bound that is NaN or infinite),
 * and an attribute that names a variable holding no number.
 *
 * @module
 */
import { drawBelow, drawFloat } from "#processing/draws.ts";
import type { LiteralOr, StaticType } from "#processing/ir.ts";
import { boundAt, floatValue, integerValue, nullAt } from "#processing/operators/arithmetic.ts";
import { floatOrVariable, integerOrVariable } from "#processing/operators/attributes.ts";
import { membersOf, ofBase } from "#processing/operators/containers.ts";
import {
  checked,
  dynamic,
  noAttributes,
  noOperand,
  oneOperand,
  operandsTaken,
  refused,
  typed,
} from "#processing/operators/operator.ts";
import type { Checked, CompileContext, OperatorTable } from "#processing/operators/operator.ts";
import { floatAttribute, integerAttribute } from "#processing/run.ts";
import { nullOf } from "#processing/value.ts";
import type { Null, Value } from "#processing/value.ts";
import { attributeOf } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * The value of `qti-random`: one member of the container, chosen by the stream (section 2.11.3.36).
 *
 * @param value - The container's value.
 * @param draw - The stream.
 * @param none - The NULL of the operator's static type.
 * @returns The chosen member as a single; NULL, drawing nothing, where the container is NULL or no
 *   container.
 */
export const randomOf = (value: Value, draw: () => number, none: Null): Value => {
  if (value.kind !== "multiple" && value.kind !== "ordered") {
    return none;
  }

  const { base } = value;
  const members = membersOf(base, value) ?? [];
  const member = members[Number(drawBelow(draw, BigInt(members.length)))];

  return member === undefined ? none : ofBase(base).single(member);
};

/**
 * The value of `qti-random-integer`: `min + step·j`, with `j` drawn among the
 * `⌊(max − min) / step⌋ + 1` values the range holds (section 6.9.38).
 *
 * @param range - The resolved attributes: each `undefined` where its variable holds no integer.
 * @param draw - The stream.
 * @param bounded - The computation bound (reading `engine-size-limit`).
 * @returns The single integer; NULL, drawing nothing, where an attribute is none, `max` is below
 *   `min`, or `step` is 0 or below (reading `null-results`, item 8).
 */
export const randomIntegerOf = (
  range: {
    readonly max: bigint | undefined;
    readonly min: bigint | undefined;
    readonly step: bigint | undefined;
  },
  draw: () => number,
  bounded: (integer: bigint) => bigint | undefined,
): Value => {
  const { max, min, step } = range;
  const none = nullOf({ base: "integer", cardinality: "single" });
  if (max === undefined || min === undefined || step === undefined || max < min || step <= 0n) {
    return none;
  }

  const count = bounded((max - min) / step + 1n);

  return count === undefined ? none : integerValue(min + step * drawBelow(draw, count));
};

/**
 * The value of `qti-random-float`: `min + u·(max − min)`, `u` the stream's next float in [0, 1)
 * (two draws), or `min·(1 − u) + max·u` where the span overflows, held inside [min, max] (section
 * 6.9.37).
 *
 * @param range - The resolved bounds: each `undefined` where its variable holds no number.
 * @param draw - The stream.
 * @returns The single float; NULL, drawing nothing, where a bound is none, NaN or infinite, or `max`
 *   is below `min` (reading `null-results`, item 8).
 */
export const randomFloatOf = (
  range: { readonly max: number | undefined; readonly min: number | undefined },
  draw: () => number,
): Value => {
  const { max, min } = range;
  if (
    max === undefined ||
    min === undefined ||
    !Number.isFinite(max) ||
    !Number.isFinite(min) ||
    max < min
  ) {
    return nullOf({ base: "float", cardinality: "single" });
  }

  const u = drawFloat(draw);
  const span = max - min;
  const drawn = Number.isFinite(span) ? min + u * span : min * (1 - u) + max * u;

  return floatValue(Math.min(max, Math.max(min, drawn)));
};

/**
 * A float attribute that may name a variable: its literal, `fallback` where it is not written.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @param fallback - Its default, or `required`.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The attribute.
 */
const floatOrVariableAttribute = (
  element: XmlElement,
  name: string,
  fallback: number | "required",
  context: CompileContext,
  place: number,
): Checked<LiteralOr<number>> => {
  const written = attributeOf(element, name);
  if (written !== undefined) {
    return floatOrVariable(written, context, place);
  }

  return fallback === "required"
    ? refused("attribute", place, `write the required attribute ${name}`)
    : checked({ kind: "literal", value: fallback });
};

/**
 * The single integer and single float static types.
 */
const integerType: StaticType = typed({ base: "integer", cardinality: "single" });

const floatType: StaticType = typed({ base: "float", cardinality: "single" });

/**
 * The random family's operators.
 */
export const randomOperators: OperatorTable<"random" | "random-float" | "random-integer"> = {
  random: {
    arity: oneOperand,
    evaluate: (node, run) => randomOf(run.evaluate(node.operands[0]), run.draw, nullAt(node.type)),
    read: noAttributes,
    typing: ([operand], _attributes, place) =>
      operandsTaken(
        [operand],
        { bases: "any", cardinalities: ["multiple", "ordered"] },
        place,
        operand.type.kind === "typed" && operand.type.type.cardinality !== "record"
          ? typed({ base: operand.type.type.base, cardinality: "single" })
          : dynamic,
      ),
  },
  "random-float": {
    arity: noOperand,
    evaluate: (node, run) =>
      randomFloatOf(
        { max: floatAttribute(run, node.max), min: floatAttribute(run, node.min) },
        run.draw,
      ),
    read: (element, context, place) => {
      const min = floatOrVariableAttribute(element, "min", 0, context, place);
      if (!min.ok) {
        return min;
      }

      const max = floatOrVariableAttribute(element, "max", "required", context, place);

      return max.ok ? checked({ max: max.value, min: min.value }) : max;
    },
    typing: () => checked(floatType),
  },
  "random-integer": {
    arity: noOperand,
    evaluate: (node, run) =>
      randomIntegerOf(
        {
          max: integerAttribute(run, node.max),
          min: integerAttribute(run, node.min),
          step: integerAttribute(run, node.step),
        },
        run.draw,
        boundAt(run, node.place),
      ),
    read: (element, context, place) => {
      const min = integerOrVariable(element, "min", 0n, context, place);
      if (!min.ok) {
        return min;
      }

      const max = integerOrVariable(element, "max", undefined, context, place);
      if (!max.ok) {
        return max;
      }

      const step = integerOrVariable(element, "step", 1n, context, place);

      return step.ok ? checked({ max: max.value, min: min.value, step: step.value }) : step;
    },
    typing: () => checked(integerType),
  },
};
