/**
 * The compiler of a document's variable declarations (§5.29, §5.80, §5.110, §5.144): each
 * declaration's type, its declared default and correct values, a response's mapping and area
 * mapping, an outcome's bounds and lookup table, and the built-in variables QTI declares implicitly
 * (§4.5.1).
 *
 * @module
 */
import type {
  Area,
  AreaCoordinate,
  AreaGeometry,
  AreaMapping,
  MapEntry,
  Mapping,
  VariableRole,
} from "#processing/ir.ts";
import { regex } from "arkregex";
import { readBoolean, readDouble, readInteger, readSingle } from "#processing/lexical.ts";
import { checked, refused } from "#processing/operators/operator.ts";
import type { Checked } from "#processing/operators/operator.ts";
import type { Declaration, LookupTable } from "#processing/program.ts";
import { baseTypes, container, nullOf, recordOf, textValue } from "#processing/value.ts";
import type { BaseType, RecordField, Single, Value, ValueType } from "#processing/value.ts";
import {
  attributeOf,
  collapseXmlSpace,
  qtiChildren,
  textOf,
  trimXmlSpace,
} from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * A tab, line feed or carriage return, which an `xs:normalizedString` reads as a space.
 */
const lineBreakOrTab = regex("[\\t\\n\\r]", "gu");

/**
 * A part a declaration does not write.
 */
const absent = { ok: true, value: undefined } as const;

/**
 * The bound an outcome declares where it writes none.
 */
const noBound: number | undefined = undefined;

/**
 * The cardinalities a declaration may write.
 */
const cardinalities = ["multiple", "ordered", "record", "single"] as const;

/**
 * The geometries an area may name.
 */
const geometries = [
  "circle",
  "default",
  "ellipse",
  "poly",
  "rect",
] as const satisfies readonly AreaGeometry[];

/**
 * The first child of a name.
 *
 * @param element - The element.
 * @param local - The child's local name.
 * @returns The child, or `undefined`.
 */
export const childNamed = (element: XmlElement, local: string): XmlElement | undefined =>
  qtiChildren(element).find((child) => child.local === local);

/**
 * The children of a name.
 *
 * @param element - The element.
 * @param local - The children's local name.
 * @returns The children, in document order.
 */
export const childrenNamed = (element: XmlElement, local: string): readonly XmlElement[] =>
  qtiChildren(element).filter((child) => child.local === local);

/**
 * A float attribute (`xs:double`), or its default where unwritten.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @param fallback - Its default.
 * @param place - The element's place.
 * @returns The float.
 */
const doubleAttribute = (
  element: XmlElement,
  name: string,
  fallback: number | undefined,
  place: number,
): Checked<number | undefined> => {
  const written = attributeOf(element, name);
  if (written === undefined) {
    return checked(fallback);
  }

  const value = readDouble(collapseXmlSpace(written));

  return value === undefined
    ? refused("attribute", place, `write ${name} as a float`)
    : checked(value);
};

/**
 * A declaration's type: its cardinality and, but for a record, its base type.
 *
 * @param element - The declaration.
 * @param place - Its place.
 * @returns The type.
 */
const declaredType = (element: XmlElement, place: number): Checked<ValueType> => {
  const cardinality = cardinalities.find(
    (each) => each === collapseXmlSpace(attributeOf(element, "cardinality") ?? ""),
  );
  if (cardinality === undefined) {
    return refused("attribute", place, "write the declaration's cardinality");
  }

  if (cardinality === "record") {
    return checked({ cardinality });
  }

  const base = baseTypes.find(
    (each) => each === collapseXmlSpace(attributeOf(element, "base-type") ?? ""),
  );

  return base === undefined
    ? refused("attribute", place, "write the declaration's base-type")
    : checked({ base, cardinality });
};

/**
 * The single a `qti-value` of a base type writes: NULL for an empty string (§2.2.2).
 *
 * @param base - The base type.
 * @param value - The `qti-value`.
 * @param place - Its place.
 * @returns The single, or NULL.
 */
const singleOf = (
  base: BaseType,
  value: XmlElement,
  place: number,
): Checked<Single | undefined> => {
  const read = readSingle(base, textOf(value));
  if (read === undefined) {
    return refused("attribute", place, `write each qti-value as a ${base}`);
  }

  return checked(read.kind === "null" ? undefined : read);
};

/**
 * A container of singles of one base type.
 *
 * @param kind - The container's cardinality.
 * @param base - The base type.
 * @param members - The singles, each of that base type.
 * @returns The container, or its NULL.
 */
export const containerOfSingles = (
  kind: "multiple" | "ordered",
  base: BaseType,
  members: readonly Single[],
): Value => {
  switch (base) {
    case "boolean": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "directedPair": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "duration": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "file": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "float": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "identifier": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "integer": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "pair": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "point": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "string": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
    case "uri": {
      return container(
        kind,
        base,
        members.flatMap((member) => (member.base === base ? [member.value] : [])),
      );
    }
  }
};

/**
 * The value a container of `qti-value`s (a default or a correct response) writes, of a declared
 * type: NULL where it writes none, or where every member is NULL.
 *
 * @param holder - The `qti-default-value` or `qti-correct-response`, or `undefined`.
 * @param type - The declared type.
 * @param placeOf - Where each element stands.
 * @returns The value.
 */
export const valuesOf = (
  holder: XmlElement | undefined,
  type: ValueType,
  placeOf: (element: XmlElement) => number,
): Checked<Value> => {
  if (holder === undefined) {
    return checked(nullOf(type));
  }

  const values = childrenNamed(holder, "qti-value");
  if (type.cardinality === "record") {
    const fields: RecordField[] = [];
    for (const value of values) {
      const name = collapseXmlSpace(attributeOf(value, "field-identifier") ?? "");
      const base = baseTypes.find(
        (each) => each === collapseXmlSpace(attributeOf(value, "base-type") ?? ""),
      );
      if (name === "" || base === undefined) {
        return refused(
          "attribute",
          placeOf(value),
          "write each record field's field-identifier and base-type",
        );
      }

      const read = singleOf(base, value, placeOf(value));
      if (!read.ok) {
        return read;
      }

      if (read.value !== undefined && !fields.some((field) => field.name === name)) {
        fields.push({ name, value: read.value });
      }
    }

    return checked(recordOf(fields));
  }

  const members: Single[] = [];
  for (const value of values) {
    const read = singleOf(type.base, value, placeOf(value));
    if (!read.ok) {
      return read;
    }

    if (read.value !== undefined) {
      members.push(read.value);
    }
  }

  const [first] = members;
  if (type.cardinality === "single") {
    return checked(first ?? nullOf(type));
  }

  return checked(containerOfSingles(type.cardinality, type.base, members));
};

/**
 * A response's `qti-mapping` (§5.88): QTI's defaults 0, −INF and +INF where unwritten; each entry's
 * key read in the response's base type, its tabs and line ends read as spaces (`map-key` is an
 * `xs:normalizedString`, reading 7), and its case sensitivity false where unwritten (§7.21.3).
 *
 * @param mapping - The mapping element.
 * @param base - The response's base type.
 * @param placeOf - Where each element stands.
 * @returns The mapping.
 */
const mappingOf = (
  mapping: XmlElement,
  base: BaseType,
  placeOf: (element: XmlElement) => number,
): Checked<Mapping> => {
  const place = placeOf(mapping);
  const defaultValue = doubleAttribute(mapping, "default-value", 0, place);
  const lowerBound = doubleAttribute(mapping, "lower-bound", Number.NEGATIVE_INFINITY, place);
  const upperBound = doubleAttribute(mapping, "upper-bound", Number.POSITIVE_INFINITY, place);
  if (!defaultValue.ok || !lowerBound.ok || !upperBound.ok) {
    return refused("attribute", place, "write the mapping's default-value and bounds as floats");
  }

  const entries: MapEntry[] = [];
  for (const entry of childrenNamed(mapping, "qti-map-entry")) {
    const at = placeOf(entry);
    const key = readSingle(
      base,
      (attributeOf(entry, "map-key") ?? "").replaceAll(lineBreakOrTab, " "),
    );
    const value = readDouble(collapseXmlSpace(attributeOf(entry, "mapped-value") ?? ""));
    const caseSensitive = readBoolean(
      collapseXmlSpace(attributeOf(entry, "case-sensitive") ?? "false"),
    );
    if (
      key === undefined ||
      key.kind === "null" ||
      value === undefined ||
      caseSensitive === undefined
    ) {
      return refused(
        "attribute",
        at,
        "write each map entry's map-key, mapped-value and case-sensitive",
      );
    }

    entries.push({ caseSensitive, key, value });
  }

  return checked({
    defaultValue: defaultValue.value ?? 0,
    entries,
    lowerBound: lowerBound.value ?? Number.NEGATIVE_INFINITY,
    upperBound: upperBound.value ?? Number.POSITIVE_INFINITY,
  });
};

/**
 * An area's coordinates: comma-separated lengths, a circle's radius possibly a percentage
 * (reading 180), each trimmed.
 *
 * @param written - The `coords` attribute.
 * @returns The coordinates, or `undefined` where one is no number.
 */
export const coordinatesOf = (written: string): readonly AreaCoordinate[] | undefined => {
  if (trimXmlSpace(written) === "") {
    return [];
  }

  const coordinates: AreaCoordinate[] = [];
  for (const token of written.split(",")) {
    const trimmed = trimXmlSpace(token);
    const percent = trimmed.endsWith("%");
    const value = readDouble(percent ? trimmed.slice(0, -1) : trimmed);
    if (value === undefined) {
      return undefined;
    }

    coordinates.push({ percent, value });
  }

  return coordinates;
};

/**
 * An area: its geometry and coordinates.
 *
 * @param element - The element that writes `shape` and `coords`.
 * @param place - Its place.
 * @returns The area.
 */
export const areaOf = (element: XmlElement, place: number): Checked<Area> => {
  const geometry = geometries.find(
    (each) => each === collapseXmlSpace(attributeOf(element, "shape") ?? ""),
  );
  const coords = coordinatesOf(attributeOf(element, "coords") ?? "");

  return geometry === undefined || coords === undefined
    ? refused("attribute", place, "write the area's shape and coords")
    : checked({ coords, geometry });
};

/**
 * A response's `qti-area-mapping` (§5.6), with QTI's defaults.
 *
 * @param mapping - The area mapping element.
 * @param placeOf - Where each element stands.
 * @returns The area mapping.
 */
const areaMappingOf = (
  mapping: XmlElement,
  placeOf: (element: XmlElement) => number,
): Checked<AreaMapping> => {
  const place = placeOf(mapping);
  const defaultValue = doubleAttribute(mapping, "default-value", 0, place);
  const lowerBound = doubleAttribute(mapping, "lower-bound", Number.NEGATIVE_INFINITY, place);
  const upperBound = doubleAttribute(mapping, "upper-bound", Number.POSITIVE_INFINITY, place);
  if (!defaultValue.ok || !lowerBound.ok || !upperBound.ok) {
    return refused(
      "attribute",
      place,
      "write the area mapping's default-value and bounds as floats",
    );
  }

  const entries: { readonly area: Area; readonly value: number }[] = [];
  for (const entry of childrenNamed(mapping, "qti-area-map-entry")) {
    const area = areaOf(entry, placeOf(entry));
    const value = readDouble(collapseXmlSpace(attributeOf(entry, "mapped-value") ?? ""));
    if (!area.ok) {
      return area;
    }

    if (value === undefined) {
      return refused("attribute", placeOf(entry), "write each area map entry's mapped-value");
    }

    entries.push({ area: area.value, value });
  }

  return checked({
    defaultValue: defaultValue.value ?? 0,
    entries,
    lowerBound: lowerBound.value ?? Number.NEGATIVE_INFINITY,
    upperBound: upperBound.value ?? Number.POSITIVE_INFINITY,
  });
};

/**
 * An outcome's lookup table (§5.71, §5.89), its targets in the outcome's base type.
 *
 * @param declaration - The outcome declaration.
 * @param type - Its type.
 * @param placeOf - Where each element stands.
 * @returns The table, or `undefined` where it declares none.
 */
const lookupOf = (
  declaration: XmlElement,
  type: ValueType,
  placeOf: (element: XmlElement) => number,
): Checked<LookupTable | undefined> => {
  const match = childNamed(declaration, "qti-match-table");
  const interpolation = childNamed(declaration, "qti-interpolation-table");
  const table = match ?? interpolation;
  if (table === undefined) {
    return absent;
  }

  const place = placeOf(table);
  if (type.cardinality !== "single") {
    return refused(
      "attribute",
      place,
      "give a lookup table to a single outcome alone (reading 100)",
    );
  }

  const target = (text: string | undefined): Single | undefined => {
    const read = text === undefined ? undefined : readSingle(type.base, text);

    return read?.kind === "single" ? read : undefined;
  };
  const writtenDefault = attributeOf(table, "default-value");
  const defaultValue = target(writtenDefault);
  if (writtenDefault !== undefined && defaultValue === undefined) {
    return refused(
      "attribute",
      place,
      "write the table's default-value in the outcome's base type",
    );
  }

  if (match !== undefined) {
    const entries: { readonly source: bigint; readonly target: Single }[] = [];
    for (const entry of childrenNamed(match, "qti-match-table-entry")) {
      const source = readInteger(collapseXmlSpace(attributeOf(entry, "source-value") ?? ""));
      const mapped = target(attributeOf(entry, "target-value"));
      if (source === undefined || mapped === undefined) {
        return refused(
          "attribute",
          placeOf(entry),
          "write each match table entry's source-value and target-value",
        );
      }

      entries.push({ source, target: mapped });
    }

    return checked({ defaultValue, entries, kind: "match" });
  }

  const entries: {
    readonly includeBoundary: boolean;
    readonly source: number;
    readonly target: Single;
  }[] = [];
  for (const entry of childrenNamed(table, "qti-interpolation-table-entry")) {
    const source = readDouble(collapseXmlSpace(attributeOf(entry, "source-value") ?? ""));
    const includeBoundary = readBoolean(
      collapseXmlSpace(attributeOf(entry, "include-boundary") ?? "true"),
    );
    const mapped = target(attributeOf(entry, "target-value"));
    if (source === undefined || includeBoundary === undefined || mapped === undefined) {
      return refused(
        "attribute",
        placeOf(entry),
        "write each interpolation table entry's source-value and target-value",
      );
    }

    entries.push({ includeBoundary, source, target: mapped });
  }

  return checked({ defaultValue, entries, kind: "interpolation" });
};

/**
 * The roles a declaration element declares.
 */
const roles = {
  "qti-context-declaration": "context",
  "qti-outcome-declaration": "outcome",
  "qti-response-declaration": "response",
  "qti-template-declaration": "template",
} as const satisfies Readonly<Record<string, VariableRole>>;

/**
 * Whether an element is a declaration.
 *
 * @param local - Its local name.
 * @returns Whether it declares a variable.
 */
const isDeclaration = (local: string): local is keyof typeof roles => Object.hasOwn(roles, local);

/**
 * One declaration.
 *
 * @param element - The declaration element.
 * @param placeOf - Where each element stands.
 * @returns The declaration, or `undefined` for an element that declares none.
 */
const declarationOf = (
  element: XmlElement,
  placeOf: (element: XmlElement) => number,
): Checked<Declaration> | undefined => {
  if (!isDeclaration(element.local)) {
    return undefined;
  }

  const role = roles[element.local];
  const place = placeOf(element);
  const identifier = collapseXmlSpace(attributeOf(element, "identifier") ?? "");
  const type = declaredType(element, place);
  if (identifier === "") {
    return refused("attribute", place, "write the declaration's identifier");
  }

  if (!type.ok) {
    return type;
  }

  const declared = valuesOf(childNamed(element, "qti-default-value"), type.value, placeOf);
  const correct =
    role === "response"
      ? valuesOf(childNamed(element, "qti-correct-response"), type.value, placeOf)
      : checked(nullOf(type.value));
  const mappingElement = childNamed(element, "qti-mapping");
  const areaElement = childNamed(element, "qti-area-mapping");
  const base = type.value.cardinality === "record" ? undefined : type.value.base;
  const mapping =
    mappingElement === undefined || base === undefined
      ? absent
      : mappingOf(mappingElement, base, placeOf);
  const areaMapping = areaElement === undefined ? absent : areaMappingOf(areaElement, placeOf);
  const lookup = role === "outcome" ? lookupOf(element, type.value, placeOf) : absent;
  const normalMaximum = doubleAttribute(element, "normal-maximum", noBound, place);
  const normalMinimum = doubleAttribute(element, "normal-minimum", noBound, place);
  for (const part of [
    declared,
    correct,
    mapping,
    areaMapping,
    lookup,
    normalMaximum,
    normalMinimum,
  ]) {
    if (!part.ok) {
      return part;
    }
  }

  return declared.ok &&
    correct.ok &&
    mapping.ok &&
    areaMapping.ok &&
    lookup.ok &&
    normalMaximum.ok &&
    normalMinimum.ok
    ? checked({
        areaMapping: areaMapping.value,
        correct: correct.value,
        default: declared.value,
        identifier,
        lookup: lookup.value,
        mapping: mapping.value,
        normalMaximum: normalMaximum.value,
        normalMinimum: normalMinimum.value,
        role,
        type: type.value,
      })
    : refused("attribute", place, "write the declaration as QTI defines it");
};

/**
 * A built-in variable's declaration (§4.5.1): no default, no correct value.
 *
 * @param identifier - Its identifier.
 * @param type - Its type.
 * @returns The declaration.
 */
const builtIn = (identifier: string, type: ValueType): Declaration => ({
  areaMapping: undefined,
  correct: nullOf(type),
  default: nullOf(type),
  identifier,
  lookup: undefined,
  mapping: undefined,
  normalMaximum: undefined,
  normalMinimum: undefined,
  role: "built-in",
  type,
});

/**
 * Every declaration of a document's root, with the built-ins it holds: an item's `numAttempts`
 * (single integer), `duration` (single float, reading 29) and `completionStatus` (single
 * identifier); a test's `duration` (single duration).
 *
 * @param root - The item's or test's root element.
 * @param document - Which it is.
 * @param placeOf - Where each element stands.
 * @returns The declarations by identifier.
 */
export const declarationsOf = (
  root: XmlElement,
  document: "item" | "test",
  placeOf: (element: XmlElement) => number,
): Checked<ReadonlyMap<string, Declaration>> => {
  const declarations = new Map<string, Declaration>(
    document === "item"
      ? [
          [
            "completionStatus",
            builtIn("completionStatus", { base: "identifier", cardinality: "single" }),
          ],
          ["duration", builtIn("duration", { base: "float", cardinality: "single" })],
          ["numAttempts", builtIn("numAttempts", { base: "integer", cardinality: "single" })],
        ]
      : [["duration", builtIn("duration", { base: "duration", cardinality: "single" })]],
  );
  for (const child of qtiChildren(root)) {
    const declaration = declarationOf(child, placeOf);
    if (declaration !== undefined) {
      if (!declaration.ok) {
        return declaration;
      }

      declarations.set(declaration.value.identifier, declaration.value);
    }
  }

  return checked(declarations);
};

/**
 * The text value of an identifier, as a `textValue` reads it.
 */
export const identifierValue = (text: string): Value => textValue("identifier", text);
