/**
 * The mapping family: `qti-map-response`, `qti-map-response-point` and `qti-inside` (sections
 * 2.11.1.5, 2.11.1.6 and 2.11.3.7).
 *
 * A response maps each distinct value once ("{B,B,C} would still map to 1.5 and not 2.5"), by the
 * first entry whose key it is (readings `map-key-repeats` and `string-map-key-case`), a string
 * entry comparing case-insensitively unless it says otherwise (its `case-sensitive` defaults to
 * false, section 7.21.3), else by the mapping's default. The mapped values are summed exactly and
 * rounded once (D2); a container's sum is held to the mapping's bounds, a single's value is not
 * (reading `mapping-bounds`). A NULL response maps to 0 before the bounds apply (reading
 * `area-mapping`). Points are tested against each area in document order, each area mapped once,
 * each distinct point in no area adding the default once (reading `area-mapping`), by the one area
 * geometry (`#processing/area.ts`).
 *
 * @module
 */
import { inside } from "#processing/area.ts";
import type {
  Area,
  AreaMapping,
  AttributesOf,
  Mapping,
  MapEntry,
  StaticType,
} from "#processing/ir.ts";
import { exactSum } from "#processing/numbers.ts";
import { floatValue } from "#processing/operators/arithmetic.ts";
import { membersOf } from "#processing/operators/containers.ts";
import { nameAttribute } from "#processing/operators/attributes.ts";
import {
  checked,
  noOperand,
  oneOperand,
  operandsTaken,
  refused,
  singleBoolean,
  typed,
} from "#processing/operators/operator.ts";
import type {
  Checked,
  CompileContext,
  OperandRule,
  OperatorTable,
} from "#processing/operators/operator.ts";
import { foldCase } from "#processing/operators/strings.ts";
import { isText, nullOf, sameScalar, single } from "#processing/value.ts";
import type { BaseType, Point, Scalars, Value } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * The single float static type, every mapping's.
 */
const floatType: StaticType = typed({ base: "float", cardinality: "single" });

/**
 * A response's distinct members: each value once, in the order it first appears, as `qti-match`
 * compares members (a pair unordered, a float by `===`, so -0 is 0).
 *
 * @param base - The base type.
 * @param members - The members.
 * @returns The distinct members.
 */
const distinct = <B extends BaseType>(
  base: B,
  members: readonly Scalars[B][],
): readonly Scalars[B][] => {
  const kept: Scalars[B][] = [];
  for (const member of members) {
    if (!kept.some((held) => sameScalar(base, held, member))) {
      kept.push(member);
    }
  }

  return kept;
};

/**
 * Whether a map entry's key is a member: of one base type and the same value, a string key that is
 * not case-sensitive by its fold.
 *
 * @param entry - The entry.
 * @param base - The member's base type.
 * @param member - The member.
 * @returns Whether the entry maps it.
 */
const keys = <B extends BaseType>(entry: MapEntry, base: B, member: Scalars[B]): boolean => {
  const [key] = membersOf(base, entry.key) ?? [];

  return key !== undefined && sameScalar(base, key, member);
};

/**
 * Whether a map entry's key is a string member: the same string, or, where the entry is not
 * case-sensitive, the same fold.
 *
 * @param entry - The entry.
 * @param member - The member.
 * @returns Whether the entry maps it.
 */
const keysString = (entry: MapEntry, member: string): boolean => {
  const [key] = membersOf("string", entry.key) ?? [];
  if (key === undefined) {
    return false;
  }

  return entry.caseSensitive ? key === member : foldCase(key) === foldCase(member);
};

/**
 * A sum held to a mapping's bounds where the response is a container (reading `mapping-bounds`).
 *
 * @param bounds - The mapping's bounds.
 * @param container - Whether the response is a container.
 * @param sum - The sum.
 * @returns The single float.
 */
const bounded = (
  bounds: { readonly lowerBound: number; readonly upperBound: number },
  container: boolean,
  sum: number,
): Value =>
  floatValue(container ? Math.min(bounds.upperBound, Math.max(bounds.lowerBound, sum)) : sum);

/**
 * Whether a value is, or is declared, a container.
 *
 * @param value - The value.
 * @returns Whether its cardinality is multiple or ordered.
 */
const isContainer = (value: Value): boolean => {
  const cardinality = value.kind === "null" ? value.type.cardinality : value.kind;

  return cardinality === "multiple" || cardinality === "ordered";
};

/**
 * The values a mapping gives a response's distinct members.
 *
 * @param mapping - The mapping.
 * @param base - The members' base type.
 * @param members - The members.
 * @returns Each distinct member's mapped value, in order.
 */
const mappedValues = <B extends BaseType>(
  mapping: Mapping,
  base: B,
  members: readonly Scalars[B][],
): readonly number[] =>
  distinct(base, members).map(
    (member) =>
      mapping.entries.find((entry) => keys(entry, base, member))?.value ?? mapping.defaultValue,
  );

/**
 * The values a mapping gives a string response's distinct members, an entry that is not
 * case-sensitive matching by fold (section 7.21.3).
 *
 * @param mapping - The mapping.
 * @param members - The members.
 * @returns Each distinct member's mapped value, in order.
 */
const mappedStrings = (mapping: Mapping, members: readonly string[]): readonly number[] =>
  distinct("string", members.filter(isText)).map(
    (member) =>
      mapping.entries.find((entry) => keysString(entry, member))?.value ?? mapping.defaultValue,
  );

/**
 * The value of `qti-map-response`: the mapped values of the response's distinct members, summed
 * exactly and rounded once, a container's sum held to the bounds.
 *
 * @param mapping - The response's mapping.
 * @param value - The response's value.
 * @returns The single float; 0, held to the bounds for a container, for a NULL response.
 */
export const mappedResponseOf = (mapping: Mapping, value: Value): Value => {
  if (value.kind === "null" || value.kind === "record") {
    return bounded(mapping, isContainer(value), 0);
  }

  const strings = membersOf("string", value);
  const mapped =
    strings === undefined
      ? mappedValues(mapping, value.base, membersOf(value.base, value) ?? [])
      : mappedStrings(mapping, strings);

  return bounded(mapping, isContainer(value), exactSum(mapped));
};

/**
 * The value of `qti-map-response-point`: each distinct point mapped by the first area that holds
 * it, each area once, each point in no area adding the default once; summed exactly and rounded
 * once, a container's sum held to the bounds (reading `area-mapping`).
 *
 * @param mapping - The response's area mapping, its areas resolved at compile.
 * @param value - The response's value.
 * @returns The single float; 0, held to the bounds for a container, for a NULL response.
 */
export const mappedPointsOf = (mapping: AreaMapping, value: Value): Value => {
  const points = value.kind === "null" ? [] : (membersOf("point", value) ?? []);
  const mapped: number[] = [];
  const seen = new Set<number>();
  for (const point of distinct("point", points)) {
    const area = mapping.entries.findIndex((entry) => inside(entry.area, point));
    const entry = mapping.entries[area];
    if (entry === undefined) {
      mapped.push(mapping.defaultValue);
    } else if (!seen.has(area)) {
      seen.add(area);
      mapped.push(entry.value);
    }
  }

  return bounded(mapping, isContainer(value), exactSum(mapped));
};

/**
 * The value of `qti-inside`: whether the point, or any point of a container, is inside the area
 * (section 2.11.3.7).
 *
 * @param area - The area, resolved.
 * @param value - The operand's value.
 * @returns The truth; NULL where the operand is NULL or holds no point.
 */
export const insideOf = (area: Area, value: Value): Value => {
  const points: readonly Point[] | undefined = membersOf("point", value);

  return points === undefined
    ? nullOf({ base: "boolean", cardinality: "single" })
    : single(
        "boolean",
        points.some((point) => inside(area, point)),
      );
};

/**
 * A `qti-map-response`'s attributes: the response its `identifier` names, which declares a mapping
 * and is no record ("This expression cannot be applied to variables of record cardinality",
 * section 2.11.1.5).
 *
 * @param element - The element.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The mapping and the response, or the refusal.
 */
const mapResponseAttributes = (
  element: XmlElement,
  context: CompileContext,
  place: number,
): Checked<AttributesOf["map-response"]> => {
  const identifier = nameAttribute(element, "identifier", place);
  if (!identifier.ok) {
    return identifier;
  }

  const declared = context.response(identifier.value);
  if (declared?.mapping === undefined) {
    return refused(
      "unknown-identifier",
      place,
      `declare a mapping on the response ${identifier.value}`,
    );
  }

  return declared.variable.type.cardinality === "record"
    ? refused("operand-type", place, "map a response of single, multiple or ordered cardinality")
    : checked({ mapping: declared.mapping, response: declared.variable });
};

/**
 * A `qti-map-response-point`'s attributes: the response its `identifier` names, which declares an
 * area mapping (section 2.11.1.6).
 *
 * @param element - The element.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The area mapping and the response, or the refusal.
 */
const mapResponsePointAttributes = (
  element: XmlElement,
  context: CompileContext,
  place: number,
): Checked<AttributesOf["map-response-point"]> => {
  const identifier = nameAttribute(element, "identifier", place);
  if (!identifier.ok) {
    return identifier;
  }

  const declared = context.response(identifier.value);

  return declared?.areaMapping === undefined
    ? refused(
        "unknown-identifier",
        place,
        `declare an area mapping on the response ${identifier.value}`,
      )
    : checked({ mapping: declared.areaMapping, response: declared.variable });
};

/**
 * A point operand: a single point or a container of them.
 */
const points: OperandRule = { bases: ["point"], cardinalities: ["single", "multiple", "ordered"] };

/**
 * The mapping family's operators.
 */
export const mappingOperators: OperatorTable<"inside" | "map-response" | "map-response-point"> = {
  inside: {
    arity: oneOperand,
    evaluate: (node, run) => insideOf(node.area, run.evaluate(node.operands[0])),
    read: (element, context, place) => {
      const area = context.area(element, place);

      return area.ok ? checked({ area: area.value }) : area;
    },
    typing: (operands, _attributes, place) => operandsTaken(operands, points, place, singleBoolean),
  },
  "map-response": {
    arity: noOperand,
    evaluate: (node, run) => mappedResponseOf(node.mapping, run.read(node.response)),
    read: mapResponseAttributes,
    typing: () => checked(floatType),
  },
  "map-response-point": {
    arity: noOperand,
    evaluate: (node, run) => mappedPointsOf(node.mapping, run.read(node.response)),
    read: mapResponsePointAttributes,
    typing: () => checked(floatType),
  },
};
