/**
 * The test-level family, the expressions used only in a test's outcome processing:
 * `qti-number-correct`, `qti-number-incorrect`, `qti-number-presented`, `qti-number-responded`,
 * `qti-number-selected`, `qti-outcome-minimum`, `qti-outcome-maximum` and `qti-test-variables`
 * (section 2.11.2), each over the item sessions its filter keeps (`Run.members`), in the test's
 * order.
 *
 * An item is attempted where its `numAttempts` is 1 or more. Responses match as `qti-match` matches
 * them. A weight multiplies a number as IEEE 754 multiplies, an integer promoted to float, and an
 * item ref with no weight of that name weighs 1.0 (section 7.47.2).
 *
 * @module
 */
import type { ItemFilter, StaticType } from "#processing/ir.ts";
import { toFloat } from "#processing/numbers.ts";
import { nullAt } from "#processing/operators/arithmetic.ts";
import { listAttribute, nameAttribute, optionalName } from "#processing/operators/attributes.ts";
import { matchOf } from "#processing/operators/comparison.ts";
import { membersOf, ofBase } from "#processing/operators/containers.ts";
import { checked, dynamic, noOperand, refused, typed } from "#processing/operators/operator.ts";
import type {
  Checked,
  CompileContext,
  Operator,
  OperatorTable,
} from "#processing/operators/operator.ts";
import type { MemberResponse, MemberState } from "#processing/run.ts";
import { baseTypes, container, nullOf, single, valueTypeOf } from "#processing/value.ts";
import type { BaseType, Null, Single, Value } from "#processing/value.ts";
import { attributeOf } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * Whether `qti-match` of two values is true.
 *
 * @param left - The one value.
 * @param right - The other.
 * @returns Whether they match; false where either is NULL.
 */
const matches = (left: Value, right: Value): boolean => {
  const matched = matchOf(left, right);

  return matched.kind === "single" && matched.base === "boolean" && matched.value;
};

/**
 * Whether a response holds its correct response: `qti-match` of the two is true.
 *
 * @param response - The response.
 * @returns Whether it is correct.
 */
const isCorrect = (response: MemberResponse): boolean => matches(response.value, response.correct);

/**
 * Whether an item is judged by number-correct and number-incorrect: it declares a response, and
 * every response it declares has a correct response (section 2.11.2.1, reading `null-results`, item
 * 5).
 *
 * @param member - The item session.
 * @returns Whether it is judged.
 */
const judged = (member: MemberState): boolean =>
  member.responses.length > 0 &&
  member.responses.every((response) => response.correct.kind !== "null");

/**
 * Whether an item has been attempted at least once.
 *
 * @param member - The item session.
 * @returns Whether its numAttempts is 1 or more.
 */
const attempted = (member: MemberState): boolean => member.numAttempts > 0n;

/**
 * Whether two values are one, NULL being one with NULL: a response's value against its default.
 *
 * @param value - The value.
 * @param fallback - The default.
 * @returns Whether they are the same.
 */
const sameOrBothNull = (value: Value, fallback: Value): boolean => {
  if (value.kind === "null" || fallback.kind === "null") {
    return value.kind === fallback.kind;
  }

  return matches(value, fallback);
};

/**
 * Which items each count counts (sections 2.11.2.1–5).
 */
const counts = Object.freeze({
  "number-correct": (member: MemberState) =>
    judged(member) && member.responses.every((response) => isCorrect(response)),
  "number-incorrect": (member: MemberState) =>
    judged(member) &&
    attempted(member) &&
    member.responses.some((response) => !isCorrect(response)),
  "number-presented": attempted,
  "number-responded": (member: MemberState) =>
    attempted(member) &&
    member.responses.some((response) => !sameOrBothNull(response.value, response.default)),
  "number-selected": (member: MemberState) => member.selected,
} satisfies Readonly<Record<CountKind, (member: MemberState) => boolean>>);

/**
 * The counting expressions.
 */
type CountKind =
  | "number-correct"
  | "number-incorrect"
  | "number-presented"
  | "number-responded"
  | "number-selected";

/**
 * The value of a counting expression: how many of the kept items it counts.
 *
 * @param kind - The expression.
 * @param members - The kept item sessions.
 * @returns The single integer.
 */
export const countOf = (kind: CountKind, members: readonly MemberState[]): Value =>
  single("integer", BigInt(members.filter((member) => counts[kind](member)).length));

/**
 * A member's weight of a name: its item ref's weight of that identifier, 1.0 where it has none.
 *
 * @param member - The item session.
 * @param weight - The weight's identifier, or none.
 * @returns The weight; `undefined` where no weight is named.
 */
const weightOf = (member: MemberState, weight: string | undefined): number | undefined =>
  weight === undefined ? undefined : (member.weights.get(weight) ?? 1);

/**
 * The value of `qti-outcome-minimum` or `qti-outcome-maximum`: each kept item's declared bound of
 * the named outcome, weighted where a weight is named, a multiple float (sections 2.11.2.6,
 * 2.11.2.7). An outcome of other than single cardinality is passed over; a minimum ignores an item
 * that declares none, a maximum is NULL where any does (reading `null-results`, item 6).
 *
 * @param which - Which bound.
 * @param outcome - The outcome's identifier.
 * @param weight - The weight's identifier, or none.
 * @param members - The kept item sessions.
 * @returns The multiple float, or NULL.
 */
export const outcomeBoundsOf = (
  which: "maximum" | "minimum",
  outcome: string,
  weight: string | undefined,
  members: readonly MemberState[],
): Value => {
  const bounds: number[] = [];
  for (const member of members) {
    const found = member.outcomes.find((held) => held.identifier === outcome);
    if (found !== undefined && valueTypeOf(found.value).cardinality !== "single") {
      continue;
    }

    const bound = which === "maximum" ? found?.normalMaximum : found?.normalMinimum;
    if (bound === undefined) {
      if (which === "maximum") {
        return nullOf({ base: "float", cardinality: "multiple" });
      }

      continue;
    }

    const factor = weightOf(member, weight);
    bounds.push(factor === undefined ? bound : bound * factor);
  }

  return container("multiple", "float", bounds);
};

/**
 * A member's single value of an item variable it names: an outcome's, else a response's.
 *
 * @param member - The item session.
 * @param variable - The variable's identifier.
 * @returns Its value; `undefined` where it names none ("Items with no matching variable are
 *   ignored", section 7.39.4).
 */
const memberValue = (member: MemberState, variable: string): Value | undefined =>
  member.outcomes.find((held) => held.identifier === variable)?.value ??
  member.responses.find((held) => held.identifier === variable)?.value;

/**
 * A single number's float: an integer through `toFloat` (reading `integer-unbounded`).
 *
 * @param value - The single, an integer or a float.
 * @returns Its float; NaN for any other single, which no caller passes.
 */
const numberValue = (value: Single): number => {
  if (value.base === "integer") {
    return toFloat(value.value);
  }

  return value.base === "float" ? value.value : Number.NaN;
};

/**
 * The value of `qti-test-variables`: each kept item's single, non-NULL value of the named variable,
 * of the written base type or, where none is written, integer or float, as a multiple (section
 * 2.11.2.8). Weighted, or where a value or the written base is float, each number is a float, times
 * its item's weight where one is named (section 7.47.2, reading `weighted-test-variables`);
 * unweighted integers alone stay integers.
 *
 * @param base - The written base type, or none.
 * @param variable - The variable's identifier.
 * @param weight - The weight's identifier, or none.
 * @param members - The kept item sessions.
 * @param none - The NULL of the operator's static type, where no item gives a value.
 * @returns The multiple.
 */
export const testVariablesOf = (
  base: BaseType | undefined,
  variable: string,
  weight: string | undefined,
  members: readonly MemberState[],
  none: Null,
): Value => {
  const kept: { readonly factor: number | undefined; readonly value: Single }[] = [];
  for (const member of members) {
    const value = memberValue(member, variable);
    if (value?.kind !== "single") {
      continue;
    }

    const matched =
      base === undefined ? value.base === "integer" || value.base === "float" : value.base === base;
    if (matched) {
      kept.push({ factor: weightOf(member, weight), value });
    }
  }

  if (kept.length === 0) {
    return none;
  }

  if (base !== undefined && base !== "integer" && base !== "float") {
    return ofBase(base).container(
      "multiple",
      kept.flatMap(({ value }) => membersOf(base, value) ?? []),
    );
  }

  const integers = kept.flatMap(({ value }) => (value.base === "integer" ? [value.value] : []));
  if (weight === undefined && base !== "float" && integers.length === kept.length) {
    return container("multiple", "integer", integers);
  }

  return container(
    "multiple",
    "float",
    kept.map(({ factor, value }) => {
      const float = numberValue(value);

      return factor === undefined ? float : float * factor;
    }),
  );
};

/**
 * An item filter's attributes: `section-identifier`, `include-category` and `exclude-category`
 * (section 7.39).
 *
 * @param element - The element.
 * @returns The filter.
 */
const filterOf = (element: XmlElement): ItemFilter => ({
  excludeCategories: listAttribute(element, "exclude-category"),
  includeCategories: listAttribute(element, "include-category"),
  section: optionalName(element, "section-identifier"),
});

/**
 * A refusal of an expression read outside a test: these are used only in outcome processing
 * (section 2.11.2, reading `outcome-only-expressions`).
 *
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The refusal, or none in a test.
 */
const outsideTest = (context: CompileContext, place: number): Checked<never> | undefined =>
  context.document === "test"
    ? undefined
    : refused("element", place, "use this expression in a test's outcome processing alone");

/**
 * A counting expression's attributes: its filter, in a test alone.
 *
 * @param element - The element.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The filter.
 */
const countAttributes = (
  element: XmlElement,
  context: CompileContext,
  place: number,
): Checked<{ readonly filter: ItemFilter }> =>
  outsideTest(context, place) ?? checked({ filter: filterOf(element) });

/**
 * An outcome bound's attributes: its filter, the outcome and the weight named, in a test alone.
 *
 * @param element - The element.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The attributes.
 */
const boundAttributes = (
  element: XmlElement,
  context: CompileContext,
  place: number,
): Checked<{
  readonly filter: ItemFilter;
  readonly outcome: string;
  readonly weight: string | undefined;
}> => {
  const refusal = outsideTest(context, place);
  if (refusal !== undefined) {
    return refusal;
  }

  const outcome = nameAttribute(element, "outcome-identifier", place);

  return outcome.ok
    ? checked({
        filter: filterOf(element),
        outcome: outcome.value,
        weight: optionalName(element, "weight-identifier"),
      })
    : outcome;
};

/**
 * The single integer static type.
 */
const integerType: StaticType = typed({ base: "integer", cardinality: "single" });

/**
 * The multiple float static type.
 */
const floatsType: StaticType = typed({ base: "float", cardinality: "multiple" });

/**
 * A counting operator.
 *
 * @param kind - The expression.
 * @returns The operator.
 */
const counting = <K extends CountKind>(kind: K): Operator<K> => ({
  arity: noOperand,
  evaluate: (node, run) => countOf(kind, run.members(node.filter)),
  read: countAttributes,
  typing: () => checked(integerType),
});

/**
 * The test-level family's operators.
 */
export const testLevelOperators: OperatorTable<
  CountKind | "outcome-maximum" | "outcome-minimum" | "test-variables"
> = {
  "number-correct": counting("number-correct"),
  "number-incorrect": counting("number-incorrect"),
  "number-presented": counting("number-presented"),
  "number-responded": counting("number-responded"),
  "number-selected": counting("number-selected"),
  "outcome-maximum": {
    arity: noOperand,
    evaluate: (node, run) =>
      outcomeBoundsOf("maximum", node.outcome, node.weight, run.members(node.filter)),
    read: boundAttributes,
    typing: () => checked(floatsType),
  },
  "outcome-minimum": {
    arity: noOperand,
    evaluate: (node, run) =>
      outcomeBoundsOf("minimum", node.outcome, node.weight, run.members(node.filter)),
    read: boundAttributes,
    typing: () => checked(floatsType),
  },
  "test-variables": {
    arity: noOperand,
    evaluate: (node, run) =>
      testVariablesOf(
        node.base,
        node.variable,
        node.weight,
        run.members(node.filter),
        nullAt(node.type),
      ),
    read: (element, context, place) => {
      const refusal = outsideTest(context, place);
      if (refusal !== undefined) {
        return refusal;
      }

      const variable = nameAttribute(element, "variable-identifier", place);
      if (!variable.ok) {
        return variable;
      }

      const written = attributeOf(element, "base-type");
      const base = written === undefined ? undefined : baseTypes.find((each) => each === written);
      if (written !== undefined && base === undefined) {
        return refused("attribute", place, `write base-type as one of ${baseTypes.join(", ")}`);
      }

      const weight = optionalName(element, "weight-identifier");

      return weight !== undefined && base !== undefined && base !== "float"
        ? refused(
            "attribute",
            place,
            "weight only a test-variables of base-type float or none (section 7.39.5, reading `weighted-test-variables`)",
          )
        : checked({ base, filter: filterOf(element), variable: variable.value, weight });
    },
    typing: (_operands, { base, weight }) => {
      if (weight !== undefined || base === "float") {
        return checked(floatsType);
      }

      return checked(base === undefined ? dynamic : typed({ base, cardinality: "multiple" }));
    },
  },
};
