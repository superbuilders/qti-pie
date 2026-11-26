/**
 * `qti-custom-operator` (§5.37): an operator of the registry (`#processing/registry.ts`), by its
 * `definition` URI. The compiler refuses a definition the registry does not list (D10), an operand
 * count other than the operator's, an expression operand whose static type is not its declared one,
 * and a literal operand that is not a `qti-base-value` or `qti-null` or that the operator's `parse`
 * refuses, so a compiled call is well formed and well typed.
 *
 * An inline operator's expression operands are evaluated in document order and handed to its bound
 * function (NULL law in `#processing/operator.ts`). A recorded operator's operands are evaluated in
 * document order; a NULL one gives NULL and asks for nothing (an empty essay makes no request);
 * else its answer is the run's recorded value at the operator's place, and where none is in the run
 * records a demand and the operator gives NULL meanwhile (D7, D8).
 *
 * @module
 */
import type { CustomCall, Expression } from "#processing/ir.ts";
import { invariant } from "#processing/invariant.ts";
import { readSingle } from "#processing/lexical.ts";
import { nameAttribute } from "#processing/operators/attributes.ts";
import { anyOperands, checked, refused, takes, typed } from "#processing/operators/operator.ts";
import type { Checked, OperatorTable } from "#processing/operators/operator.ts";
import type { OperandSpec, TypeSpec } from "#processing/operator.ts";
import { baseTypes, nullOf } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";
import { attributeOf, qtiChildren, textOf } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * The value a literal operand's element writes: a `qti-null`'s NULL, or a `qti-base-value`'s value.
 *
 * @param child - The operand's element.
 * @param operand - The declared operand.
 * @returns The value, or `undefined` where the element is no literal of the operand's type.
 */
const writtenLiteral = (child: XmlElement, operand: OperandSpec): Value | undefined => {
  if (operand.form !== "literal") {
    return undefined;
  }

  if (child.local === "qti-null") {
    return nullOf(operand.type);
  }

  const { type } = operand;
  const base = baseTypes.find((each) => each === attributeOf(child, "base-type"));

  return child.local === "qti-base-value" &&
    type.cardinality === "single" &&
    base !== undefined &&
    type.base === base
    ? readSingle(base, textOf(child))
    : undefined;
};

/**
 * Whether an operand's declared type takes a static type.
 *
 * @param operand - The operand's static type.
 * @param type - The declared type.
 * @returns Whether it does.
 */
const declaredTakes = (operand: Expression, type: TypeSpec): boolean =>
  type.cardinality === "any" ||
  takes(operand.type, {
    bases: type.cardinality === "record" ? "any" : [type.base],
    cardinalities: [type.cardinality],
  });

/**
 * The custom-operator family.
 */
export const customOperators: OperatorTable<"custom-operator"> = {
  "custom-operator": {
    arity: anyOperands,
    evaluate: ({ call, operands, place }, run) => {
      if (call.kind === "inline") {
        const values = operands
          .filter((_, index) => call.computed[index] === true)
          .map((operand) => run.evaluate(operand));

        return call.bound.evaluate(values);
      }

      const { entry } = call;
      const values = operands.map((operand) => run.evaluate(operand));
      if (values.some((value) => value.kind === "null")) {
        return nullOf(entry.result);
      }

      const answer = run.recorded(place);
      if (answer !== undefined) {
        return answer;
      }

      const maximum = values[entry.maximum];
      invariant(maximum !== undefined, "a recorded operator's maximum is one of its operands");
      run.demand({ definition: entry.definition, maximum, operands: values, place });

      return nullOf(entry.result);
    },
    read: (element, context, place): Checked<{ readonly call: CustomCall }> => {
      const definition = nameAttribute(element, "definition", place);
      if (!definition.ok) {
        return definition;
      }

      const entry = context.customOperator(definition.value);
      if (entry === undefined) {
        return refused(
          "unknown-operator",
          place,
          `use an operator the registry lists; it lists no ${definition.value}`,
        );
      }

      const children = qtiChildren(element);
      if (children.length !== entry.operands.length) {
        return refused(
          "arity",
          place,
          `give ${definition.value} its ${String(entry.operands.length)} operands`,
        );
      }

      if (entry.kind === "recorded") {
        return checked({ call: { entry, kind: "recorded" } });
      }

      const computed = entry.operands.map((operand) => operand.form === "expression");
      const written = children.map((child, index) => {
        const operand = entry.operands[index];

        return operand === undefined ? undefined : writtenLiteral(child, operand);
      });
      const bound = entry.bind(written);

      return bound === undefined
        ? refused(
            "attribute",
            place,
            `write each literal operand of ${definition.value} as a qti-base-value or qti-null its definition reads`,
          )
        : checked({ call: { bound, computed, entry, kind: "inline" } });
    },
    typing: (operands, { call }, place) => {
      const declared: readonly OperandSpec[] = call.entry.operands;
      const refusedAt = declared.findIndex((operand, index) => {
        const written = operands[index];

        return (
          operand.form === "expression" &&
          (written === undefined || !declaredTakes(written, operand.type))
        );
      });
      if (refusedAt !== -1) {
        return refused(
          "operand-type",
          place,
          `give operand ${String(refusedAt + 1)} of ${call.entry.definition} its declared type`,
        );
      }

      const { result } = call.entry;
      if (!("operand" in result)) {
        return checked(typed(result));
      }

      const followed = operands[result.operand];
      invariant(followed !== undefined, "a result follows an operand the operator declares");

      return checked(followed.type);
    },
  },
};
