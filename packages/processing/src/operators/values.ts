/**
 * The values family: the expressions that read a value rather than compute one. `qti-base-value`
 * (§2.11.1.1), `qti-null`, `qti-variable` (§2.11.1.2), `qti-correct` (§2.11.1.4) and `qti-default`
 * (§2.11.1.3).
 *
 * @module
 */
import type { VariableRef } from "#processing/ir.ts";
import { readSingle } from "#processing/lexical.ts";
import { enumAttribute, nameAttribute, optionalName } from "#processing/operators/attributes.ts";
import {
  checked,
  dynamic,
  noAttributes,
  noOperand,
  refused,
  typed,
} from "#processing/operators/operator.ts";
import type { Checked, CompileContext, OperatorTable } from "#processing/operators/operator.ts";
import { baseTypes, nullOf, valueTypeOf } from "#processing/value.ts";
import { textOf } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * The variable an element's `identifier` names, refused where the document declares none.
 *
 * @param element - The element.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The variable.
 */
const named = (
  element: XmlElement,
  context: CompileContext,
  place: number,
): Checked<{ readonly variable: VariableRef }> => {
  const identifier = nameAttribute(element, "identifier", place);
  if (!identifier.ok) {
    return identifier;
  }

  const weight = optionalName(element, "weight-identifier");
  const variable =
    weight === undefined
      ? context.variable(identifier.value)
      : context.weightedVariable(identifier.value, weight);

  return variable === undefined
    ? refused("unknown-identifier", place, `declare the variable ${identifier.value}`)
    : checked({ variable });
};

/**
 * NULL as `qti-null` gives it: a NULL whose type its place decides (a set stores the NULL of the
 * variable's declared type, a container ignores it). It is held as the record NULL, the one type
 * no operator's result is compared against.
 */
const qtiNull = nullOf({ cardinality: "record" });

/**
 * The values family's operators.
 */
export const valuesOperators: OperatorTable<
  "base-value" | "correct" | "default" | "null" | "variable"
> = {
  "base-value": {
    arity: noOperand,
    evaluate: (node) => node.value,
    read: (element, _context, place) => {
      const base = enumAttribute(element, "base-type", baseTypes, undefined, place);
      if (!base.ok) {
        return base;
      }

      const value = readSingle(base.value, textOf(element));

      return value === undefined
        ? refused(
            "attribute",
            place,
            `write a ${base.value} value the base type's lexical form holds`,
          )
        : checked({ value });
    },
    typing: (_operands, { value }) => checked(typed(valueTypeOf(value))),
  },
  correct: {
    arity: noOperand,
    evaluate: (node, run) => run.correctOf(node.variable),
    read: named,
    typing: (_operands, { variable }) => checked(typed(variable.type)),
  },
  default: {
    arity: noOperand,
    evaluate: (node, run) => run.defaultOf(node.variable),
    read: named,
    typing: (_operands, { variable }) => checked(typed(variable.type)),
  },
  null: {
    arity: noOperand,
    evaluate: () => qtiNull,
    read: noAttributes,
    typing: () => checked(dynamic),
  },
  variable: {
    arity: noOperand,
    evaluate: (node, run) => run.read(node.variable),
    read: named,
    typing: (_operands, { variable }) =>
      checked(
        typed(
          variable.scope === "member" &&
            variable.weight !== undefined &&
            variable.type.cardinality === "single" &&
            (variable.type.base === "integer" || variable.type.base === "float")
            ? { base: "float", cardinality: "single" }
            : variable.type,
        ),
      ),
  },
};
