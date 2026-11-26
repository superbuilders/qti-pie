/**
 * The containers family: `qti-multiple`, `qti-ordered`, `qti-container-size`, `qti-contains`,
 * `qti-member`, `qti-delete`, `qti-index`, `qti-repeat`, `qti-is-null` and `qti-field-value`
 * (sections 2.11.3.5, 6, 8, 9, 17, 18, 29, 32, 34 and 42).
 *
 * A container is never empty and never holds a container: the value model has no empty one, so a
 * container an operator would leave empty is NULL by construction (section 2.2.2). Members compare
 * as `qti-match` compares them (`sameScalar`): a pair unordered, a float by `===`.
 *
 * @module
 */
import type { Expression, Node, StaticType } from "#processing/ir.ts";
import { nullAt, valuesOf } from "#processing/operators/arithmetic.ts";
import { integerOrVariable, nameAttribute } from "#processing/operators/attributes.ts";
import {
  anyOperands,
  checked,
  dynamic,
  noAttributes,
  oneOperand,
  operandsTaken,
  refused,
  singleBoolean,
  someOperands,
  twoOperands,
  typed,
} from "#processing/operators/operator.ts";
import type { Checked, OperandRule, OperatorTable } from "#processing/operators/operator.ts";
import { integerAttribute, withinContainerBound } from "#processing/run.ts";
import type { Run } from "#processing/run.ts";
import { container, nullOf, sameScalar, single } from "#processing/value.ts";
import type {
  BaseType,
  ContainerCardinality,
  Null,
  Scalars,
  Single,
  Value,
} from "#processing/value.ts";

/**
 * A container size held to the computation bound: whether it is within it, the run failing where it
 * is not (reading `engine-size-limit`). The evaluator's `withinContainerBound` at the operator's
 * place.
 */
export type WithinBound = (size: number) => boolean;

/**
 * What a family reads and builds of one base type: the members a value holds of it, and a single or
 * a container of it, each a `Value`. One entry a base type, so a generic read or build is typed by
 * its base type with no cast, where a generic `SingleOf<B>` is no `Value`.
 */
interface OfBase<B extends BaseType> {
  readonly container: (kind: ContainerCardinality, members: readonly Scalars[B][]) => Value;
  readonly members: (value: Value) => readonly Scalars[B][] | undefined;
  readonly single: (member: Scalars[B]) => Value;
}

/**
 * Of every base type, its reads and builds.
 */
type Bases = { readonly [B in BaseType]: OfBase<B> };

/**
 * Every base type's reads and builds.
 */
const bases: Bases = {
  boolean: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "boolean", members)
        : container("ordered", "boolean", members),
    members: (value): readonly Scalars["boolean"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "boolean") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("boolean", member),
  },
  directedPair: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "directedPair", members)
        : container("ordered", "directedPair", members),
    members: (value): readonly Scalars["directedPair"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "directedPair") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("directedPair", member),
  },
  duration: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "duration", members)
        : container("ordered", "duration", members),
    members: (value): readonly Scalars["duration"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "duration") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("duration", member),
  },
  file: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "file", members)
        : container("ordered", "file", members),
    members: (value): readonly Scalars["file"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "file") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("file", member),
  },
  float: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "float", members)
        : container("ordered", "float", members),
    members: (value): readonly Scalars["float"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "float") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("float", member),
  },
  identifier: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "identifier", members)
        : container("ordered", "identifier", members),
    members: (value): readonly Scalars["identifier"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "identifier") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("identifier", member),
  },
  integer: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "integer", members)
        : container("ordered", "integer", members),
    members: (value): readonly Scalars["integer"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "integer") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("integer", member),
  },
  pair: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "pair", members)
        : container("ordered", "pair", members),
    members: (value): readonly Scalars["pair"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "pair") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("pair", member),
  },
  point: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "point", members)
        : container("ordered", "point", members),
    members: (value): readonly Scalars["point"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "point") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("point", member),
  },
  string: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "string", members)
        : container("ordered", "string", members),
    members: (value): readonly Scalars["string"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "string") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("string", member),
  },
  uri: {
    container: (kind, members) =>
      kind === "multiple"
        ? container("multiple", "uri", members)
        : container("ordered", "uri", members),
    members: (value): readonly Scalars["uri"][] | undefined => {
      if (value.kind === "null" || value.kind === "record" || value.base !== "uri") {
        return undefined;
      }

      return value.kind === "single" ? [value.value] : value.values;
    },
    single: (member) => single("uri", member),
  },
};

/**
 * A base type's reads and builds.
 *
 * @param base - The base type.
 * @returns Its entry.
 */
export const ofBase = <B extends BaseType>(base: B): OfBase<B> => {
  const entry: Bases[B] = bases[base];

  return entry;
};

/**
 * The members a value holds of a base type.
 *
 * @param base - The base type.
 * @param value - The value.
 * @returns Its members: a single's value, or a container's in order; `undefined` for NULL, a record
 *   or a value of another base type.
 */
export const membersOf = <B extends BaseType>(
  base: B,
  value: Value,
): readonly Scalars[B][] | undefined => ofBase(base).members(value);

/**
 * The base type of a value that has one.
 *
 * @param value - The value.
 * @returns Its base type; `undefined` for a record, or a NULL record.
 */
export const baseOf = (value: Value): BaseType | undefined => {
  if (value.kind === "record") {
    return undefined;
  }

  if (value.kind === "null") {
    return value.type.cardinality === "record" ? undefined : value.type.base;
  }

  return value.base;
};

/**
 * Build a container of one base type from operands' values: every non-NULL one's members, in
 * order (sections 2.11.3.8, 2.11.3.9 and 2.11.3.42).
 *
 * @param kind - The container's cardinality.
 * @param base - The base type, the first non-NULL operand's.
 * @param values - The operands' values.
 * @param within - The computation bound.
 * @param none - The NULL of the operator's static type.
 * @returns The container; NULL where one operand is of another base type or a record (reading
 *   212), or where the bound is passed.
 */
const builtOf = (
  kind: ContainerCardinality,
  base: BaseType,
  values: readonly Value[],
  within: WithinBound,
  none: Null,
): Value => {
  const members: Scalars[BaseType][] = [];
  for (const value of values) {
    if (value.kind === "null") {
      continue;
    }

    const held = membersOf(base, value);
    if (held === undefined) {
      return none;
    }

    for (const member of held) {
      members.push(member);
    }
  }

  return within(members.length) ? ofBase(base).container(kind, members) : none;
};

/**
 * The value of `qti-multiple` or `qti-ordered`: a container of the operands' members, NULLs
 * ignored, the members of a container operand added in its order.
 *
 * @param kind - The container's cardinality.
 * @param none - The NULL of the operator's static type.
 * @param values - The operands' values.
 * @param within - The computation bound.
 * @returns The container, or NULL.
 */
export const containerOf = (
  kind: ContainerCardinality,
  none: Null,
  values: readonly Value[],
  within: WithinBound,
): Value => {
  const present = values.find((value) => value.kind !== "null");
  const base = present === undefined ? undefined : baseOf(present);

  return base === undefined ? none : builtOf(kind, base, values, within, none);
};

/**
 * The value of `qti-container-size`: how many members a container holds, 0 for NULL (section
 * 2.11.3.32).
 *
 * @param value - The operand's value.
 * @returns The single integer; NULL for a single or a record, which no static type admits and
 *   only a dynamic operand gives.
 */
export const containerSizeOf = (value: Value): Value => {
  switch (value.kind) {
    case "null": {
      return single("integer", 0n);
    }
    case "multiple":
    case "ordered": {
      return single("integer", BigInt(value.values.length));
    }
    case "record":
    case "single": {
      return nullOf({ base: "integer", cardinality: "single" });
    }
  }
};

/**
 * The single boolean NULL.
 */
const booleanNull: Value = nullOf({ base: "boolean", cardinality: "single" });

/**
 * Whether a multiset holds another: every member of the part matched by a member of its own
 * (section 2.11.3.17: "[A,B,C] does not contain [B,B] but … [A,B,B,C] does").
 *
 * @param base - The base type.
 * @param whole - The container's members.
 * @param part - The part's members.
 * @returns Whether every member of the part has one of its own in the whole.
 */
const holdsAll = <B extends BaseType>(
  base: B,
  whole: readonly Scalars[B][],
  part: readonly Scalars[B][],
): boolean => {
  const unmatched = [...whole];

  return part.every((member) => {
    const at = unmatched.findIndex((held) => sameScalar(base, held, member));
    if (at === -1) {
      return false;
    }

    unmatched.splice(at, 1);

    return true;
  });
};

/**
 * Whether a sequence holds another as a run of consecutive members (section 2.11.3.17: "[A,B,C]
 * does not contain [C,A] but it does contain [B,C]").
 *
 * @param base - The base type.
 * @param whole - The sequence.
 * @param part - The run.
 * @returns Whether the run starts somewhere in the sequence.
 */
const holdsRun = <B extends BaseType>(
  base: B,
  whole: readonly Scalars[B][],
  part: readonly Scalars[B][],
): boolean =>
  whole.some(
    (_, start) =>
      start + part.length <= whole.length &&
      part.every((member, offset) => {
        const held = whole[start + offset];

        return held !== undefined && sameScalar(base, held, member);
      }),
  );

/**
 * The value of `qti-contains`: whether the first container holds the second, as a multiset for
 * `multiple`, as a run for `ordered`.
 *
 * @param left - The container's value.
 * @param right - The part's value.
 * @returns The truth; NULL where either is NULL, or where the two are not containers of one
 *   cardinality and base type.
 */
export const containsOf = (left: Value, right: Value): Value => {
  if (
    (left.kind !== "multiple" && left.kind !== "ordered") ||
    left.kind !== right.kind ||
    left.base !== baseOf(right)
  ) {
    return booleanNull;
  }

  const { base } = left;
  const whole = membersOf(base, left);
  const part = membersOf(base, right);
  if (whole === undefined || part === undefined) {
    return booleanNull;
  }

  return single(
    "boolean",
    left.kind === "ordered" ? holdsRun(base, whole, part) : holdsAll(base, whole, part),
  );
};

/**
 * The value of `qti-member`: whether the single value is among the container's members.
 *
 * @param left - The single's value.
 * @param right - The container's value.
 * @returns The truth; NULL where either is NULL, or where the first is no single or the second
 *   no container of its base type.
 */
export const memberOf = (left: Value, right: Value): Value => {
  if (left.kind !== "single" || (right.kind !== "multiple" && right.kind !== "ordered")) {
    return booleanNull;
  }

  const { base } = left;
  const [sought] = membersOf(base, left) ?? [];
  const members = membersOf(base, right);

  return sought === undefined || members === undefined
    ? booleanNull
    : single(
        "boolean",
        members.some((member) => sameScalar(base, member, sought)),
      );
};

/**
 * The value of `qti-delete`: the container with every member matching the single removed (section
 * 2.11.3.18), NULL where none is left.
 *
 * @param left - The single's value.
 * @param right - The container's value.
 * @param none - The NULL of the operator's static type.
 * @returns The container; NULL where either is NULL, or where the first is no single or the second
 *   no container of its base type.
 */
export const deleteOf = (left: Value, right: Value, none: Null): Value => {
  if (left.kind !== "single" || (right.kind !== "multiple" && right.kind !== "ordered")) {
    return none;
  }

  const { base } = left;
  const [removed] = membersOf(base, left) ?? [];
  const members = membersOf(base, right);
  if (removed === undefined || members === undefined) {
    return none;
  }

  return ofBase(base).container(
    right.kind,
    members.filter((member) => !sameScalar(base, member, removed)),
  );
};

/**
 * A container's member at a position, as a single.
 *
 * @param base - The base type.
 * @param members - The members.
 * @param at - The position from 0, or none.
 * @param none - The NULL of the operator's static type.
 * @returns The single; NULL where there is none there.
 */
const singleAt = <B extends BaseType>(
  base: B,
  members: readonly Scalars[B][],
  at: number | undefined,
  none: Null,
): Value => {
  const member = at === undefined ? undefined : members[at];

  return member === undefined ? none : ofBase(base).single(member);
};

/**
 * The value of `qti-index`: the ordered container's nth member, from 1 (section 2.11.3.6).
 *
 * @param value - The container's value.
 * @param n - The index, or `undefined` where the variable it names holds no integer.
 * @param none - The NULL of the operator's static type.
 * @returns The single member; NULL where the container is NULL or not ordered, or n is out of
 *   range.
 */
export const indexOf = (value: Value, n: bigint | undefined, none: Null): Value => {
  if (value.kind !== "ordered") {
    return none;
  }

  const at =
    n === undefined || n < 1n || n > BigInt(value.values.length) ? undefined : Number(n) - 1;

  return singleAt(value.base, membersOf(value.base, value) ?? [], at, none);
};

/**
 * The value of `qti-is-null`: whether the operand is NULL, an empty string or container among them,
 * which the value model holds as NULL (section 2.11.3.34).
 *
 * @param value - The operand's value.
 * @returns The single boolean.
 */
export const isNullOf = (value: Value): Value => single("boolean", value.kind === "null");

/**
 * The value of `qti-field-value`: the record's field of that name (section 2.11.3.5).
 *
 * @param value - The operand's value.
 * @param field - The field's name.
 * @param none - The NULL of the operator's static type.
 * @returns The field's single value; NULL where the record has no such field, is NULL, or the
 *   operand is no record (reading `null-results`, item 10).
 */
export const fieldValueOf = (value: Value, field: string, none: Null): Value => {
  if (value.kind !== "record") {
    return none;
  }

  const found: Single | undefined = value.fields.find((held) => held.name === field)?.value;

  return found ?? none;
};

/**
 * Any operand of single cardinality or of the container's own: `qti-multiple` takes singles and
 * multiples, `qti-ordered` and `qti-repeat` singles and ordereds.
 *
 * @param kind - The container's cardinality.
 * @returns The rule.
 */
const intoContainer = (kind: ContainerCardinality): OperandRule => ({
  bases: "any",
  cardinalities: ["single", kind],
});

/**
 * A container operand of either cardinality.
 */
const anyContainer: OperandRule = { bases: "any", cardinalities: ["multiple", "ordered"] };

/**
 * The base type operands share statically: the first typed operand's, where every typed one has
 * it; `undefined` where none is typed.
 *
 * @param operands - The operands.
 * @returns The shared base, `undefined` for none known, or `"mixed"` where two differ.
 */
const sharedBase = (operands: readonly Expression[]): BaseType | "mixed" | undefined => {
  let base: BaseType | undefined;
  for (const { type } of operands) {
    if (type.kind === "dynamic") {
      continue;
    }

    if (type.type.cardinality === "record") {
      return "mixed";
    }

    if (base !== undefined && base !== type.type.base) {
      return "mixed";
    }

    ({ base } = type.type);
  }

  return base;
};

/**
 * The typing of `qti-multiple`, `qti-ordered` and `qti-repeat`: operands of single cardinality or
 * the container's own, all of one base type (sections 2.11.3.8, 2.11.3.9, 2.11.3.42); the result
 * a container of it, dynamic where no operand's type is known.
 *
 * @param kind - The container's cardinality.
 * @param operands - The operands.
 * @param place - The operator's place.
 * @returns The result's static type, or the refusal.
 */
const containerTyping = (
  kind: ContainerCardinality,
  operands: readonly Expression[],
  place: number,
): Checked<StaticType> => {
  const base = sharedBase(operands);
  if (base === "mixed") {
    return refused("operand-type", place, "write operands of one base type");
  }

  return operandsTaken(
    operands,
    intoContainer(kind),
    place,
    base === undefined ? dynamic : typed({ base, cardinality: kind }),
  );
};

/**
 * The base type of a typed operand, `undefined` for a dynamic one or a record.
 *
 * @param operand - The operand.
 * @returns Its static base type.
 */
const staticBase = (operand: Expression): BaseType | undefined =>
  operand.type.kind === "typed" && operand.type.type.cardinality !== "record"
    ? operand.type.type.base
    : undefined;

/**
 * Whether two operands' static base types may be one: the same where both are known.
 *
 * @param left - The one.
 * @param right - The other.
 * @returns Whether they agree.
 */
const basesAgree = (left: Expression, right: Expression): boolean => {
  const one = staticBase(left);
  const other = staticBase(right);

  return one === undefined || other === undefined || one === other;
};

/**
 * Whether an operand is statically a duration, which `qti-contains`, `qti-member` and `qti-delete`
 * "must not be used on" (sections 2.11.3.17 and 2.11.3.29, reading `index-and-delete-operands`).
 *
 * @param operand - The operand.
 * @returns Whether its base type is duration.
 */
const isDuration = (operand: Expression): boolean => staticBase(operand) === "duration";

/**
 * The typing of `qti-contains`: two containers of one cardinality and base type, no duration.
 *
 * @param operands - The two operands.
 * @param place - The operator's place.
 * @returns The single boolean, or the refusal.
 */
const sameContainers = (
  operands: readonly [Expression, Expression],
  place: number,
): Checked<StaticType> => {
  const [left, right] = operands;
  const cardinalities =
    left.type.kind === "typed" && right.type.kind === "typed"
      ? left.type.type.cardinality === right.type.type.cardinality
      : true;
  if (
    !cardinalities ||
    !basesAgree(left, right) ||
    operands.some((operand) => isDuration(operand))
  ) {
    return refused(
      "operand-type",
      place,
      "write two containers of one cardinality and one base type other than duration",
    );
  }

  return operandsTaken(operands, anyContainer, place, singleBoolean);
};

/**
 * The typing of `qti-member` and `qti-delete`: a single, then a container, of one base type, no
 * duration.
 *
 * @param operands - The two operands.
 * @param place - The operator's place.
 * @param result - A boolean, `qti-member`'s, or the container's own type, `qti-delete`'s.
 * @returns The result's static type, or the refusal.
 */
const singleAndContainer = (
  operands: readonly [Expression, Expression],
  place: number,
  result: "boolean" | "container",
): Checked<StaticType> => {
  const [left, right] = operands;
  if (!basesAgree(left, right) || operands.some((operand) => isDuration(operand))) {
    return refused(
      "operand-type",
      place,
      "write a single and a container of one base type other than duration",
    );
  }

  const first = operandsTaken(
    [left],
    { bases: "any", cardinalities: ["single"] },
    place,
    singleBoolean,
  );
  if (!first.ok) {
    return first;
  }

  return operandsTaken(
    [right],
    anyContainer,
    place,
    result === "boolean" ? singleBoolean : right.type,
  );
};

/**
 * The kinds that draw from the run's stream.
 */
const drawingKinds: ReadonlySet<string> = new Set(["random", "random-float", "random-integer"]);

/**
 * Whether an expression draws from the stream, itself or an operand at any depth: its value may
 * differ each time it is evaluated, so `qti-repeat` evaluates it once a pass.
 *
 * @param expression - The expression.
 * @returns Whether it draws.
 */
const draws = (expression: Expression): boolean => {
  const operands: readonly Expression[] = expression.operands;

  return drawingKinds.has(expression.kind) || operands.some((operand) => draws(operand));
};

/**
 * The value of `qti-repeat`: an ordered container filled by evaluating the operands in turn, NULLs
 * ignored, `number-repeats` times (section 2.11.3.42). Operands that draw are evaluated once a
 * pass, each pass drawing anew; operands that draw nothing give the same values every pass, so they
 * are evaluated once and their members repeated. A drawing repeat of more passes than the
 * computation bound fails the run before it draws (reading `engine-size-limit`).
 *
 * @param node - The `qti-repeat`.
 * @param run - The run.
 * @returns The container; NULL where the repeats are fewer than 1 or name no integer, where every
 *   operand is NULL, or where their base types differ.
 */
const repeatOf = (node: Node<"repeat">, run: Run): Value => {
  const none = nullAt(node.type);
  const passes = integerAttribute(run, node.numberRepeats);
  if (passes === undefined || passes < 1n) {
    return none;
  }

  const within: WithinBound = (size) => withinContainerBound(run, node.place, size);
  if (!node.operands.some((operand) => draws(operand))) {
    const pass = node.operands.map((operand) => run.evaluate(operand));
    const once = containerOf("ordered", none, pass, () => true);
    if (once.kind !== "ordered") {
      return none;
    }

    return within(Number(BigInt(once.values.length) * passes))
      ? containerOf(
          "ordered",
          none,
          Array.from({ length: Number(passes) }, () => once),
          within,
        )
      : none;
  }

  if (!within(Number(passes))) {
    return none;
  }

  const values: Value[] = [];
  for (let pass = 0n; pass < passes; pass += 1n) {
    for (const operand of node.operands) {
      values.push(run.evaluate(operand));
    }
  }

  return containerOf("ordered", none, values, within);
};

/**
 * The containers family's operators.
 */
export const containersOperators: OperatorTable<
  | "container-size"
  | "contains"
  | "delete"
  | "field-value"
  | "index"
  | "is-null"
  | "member"
  | "multiple"
  | "ordered"
  | "repeat"
> = {
  "container-size": {
    arity: oneOperand,
    evaluate: (node, run) => containerSizeOf(run.evaluate(node.operands[0])),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(
        operands,
        anyContainer,
        place,
        typed({ base: "integer", cardinality: "single" }),
      ),
  },
  contains: {
    arity: twoOperands,
    evaluate: (node, run) =>
      containsOf(run.evaluate(node.operands[0]), run.evaluate(node.operands[1])),
    read: noAttributes,
    typing: (operands, _attributes, place) => sameContainers(operands, place),
  },
  delete: {
    arity: twoOperands,
    evaluate: (node, run) =>
      deleteOf(run.evaluate(node.operands[0]), run.evaluate(node.operands[1]), nullAt(node.type)),
    read: noAttributes,
    typing: (operands, _attributes, place) => singleAndContainer(operands, place, "container"),
  },
  "field-value": {
    arity: oneOperand,
    evaluate: (node, run) =>
      fieldValueOf(run.evaluate(node.operands[0]), node.field, nullAt(node.type)),
    read: (element, _context, place) => {
      const field = nameAttribute(element, "field-identifier", place);

      return field.ok ? checked({ field: field.value }) : field;
    },
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, { bases: "any", cardinalities: ["record"] }, place, dynamic),
  },
  index: {
    arity: oneOperand,
    evaluate: (node, run) =>
      indexOf(run.evaluate(node.operands[0]), integerAttribute(run, node.n), nullAt(node.type)),
    read: (element, context, place) => {
      const n = integerOrVariable(element, "n", undefined, context, place);
      if (!n.ok) {
        return n;
      }

      return n.value.kind === "literal" && n.value.value < 1n
        ? refused("attribute", place, "write n as 1 or more (reading `index-n-positive`)")
        : checked({ n: n.value });
    },
    typing: ([operand], _attributes, place) =>
      operandsTaken(
        [operand],
        { bases: "any", cardinalities: ["ordered"] },
        place,
        operand.type.kind === "typed" && operand.type.type.cardinality !== "record"
          ? typed({ base: operand.type.type.base, cardinality: "single" })
          : dynamic,
      ),
  },
  "is-null": {
    arity: oneOperand,
    evaluate: (node, run) => isNullOf(run.evaluate(node.operands[0])),
    read: noAttributes,
    typing: () => checked(singleBoolean),
  },
  member: {
    arity: twoOperands,
    evaluate: (node, run) =>
      memberOf(run.evaluate(node.operands[0]), run.evaluate(node.operands[1])),
    read: noAttributes,
    typing: (operands, _attributes, place) => singleAndContainer(operands, place, "boolean"),
  },
  multiple: {
    arity: anyOperands,
    evaluate: (node, run) =>
      containerOf("multiple", nullAt(node.type), valuesOf(node.operands, run), (size) =>
        withinContainerBound(run, node.place, size),
      ),
    read: noAttributes,
    typing: (operands, _attributes, place) => containerTyping("multiple", operands, place),
  },
  ordered: {
    arity: anyOperands,
    evaluate: (node, run) =>
      containerOf("ordered", nullAt(node.type), valuesOf(node.operands, run), (size) =>
        withinContainerBound(run, node.place, size),
      ),
    read: noAttributes,
    typing: (operands, _attributes, place) => containerTyping("ordered", operands, place),
  },
  repeat: {
    arity: someOperands,
    evaluate: repeatOf,
    read: (element, context, place) => {
      const repeats = integerOrVariable(element, "number-repeats", undefined, context, place);

      return repeats.ok ? checked({ numberRepeats: repeats.value }) : repeats;
    },
    typing: (operands, _attributes, place) => containerTyping("ordered", operands, place),
  },
};
