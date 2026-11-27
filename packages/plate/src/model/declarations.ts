/**
 * The item model's declaration readers: a response, outcome, template or context declaration read
 * into the declaration the model holds, its mappings, area mappings and lookup tables included, and
 * a declaration of a type the value model holds no value of. `buildItem` (`#plate/model/item.ts`)
 * reads an item's through them.
 *
 * @module
 */
import { Array as Arr, Option, pipe } from "effect";
import { attributePath } from "#plate/document/source.ts";
import type { SourceElement } from "#plate/document/source.ts";
import {
  attributeOf,
  childrenNamed,
  collapseXmlSpace,
  coordsOf,
  doubleAttribute,
  enumerated,
  floatAttribute,
  floatOf,
  identifierAttribute,
  integerOf,
  listed,
  pathOf,
  inadmissible,
  requiredAttribute,
  textOf,
  typed,
  valueOf,
  xmlWhitespaceRun,
  xsBoolean,
} from "#plate/model/attributes.ts";
import type { AttributeFault, ModelWalk } from "#plate/model/attributes.ts";
import type { Build } from "#plate/model/build.ts";
import type {
  AreaMapEntry,
  AreaMapping,
  ContextDeclaration,
  InterpolationTableEntry,
  LookupTable,
  MapEntry,
  Mapping,
  MatchTableEntry,
  OutcomeDeclaration,
  OutcomeReporting,
  RecordDeclaration,
  ResponseDeclaration,
  TemplateDeclaration,
  UnheldDeclaration,
} from "#plate/model/item.ts";
import {
  isModelled,
  parseElementText,
  parseLexical,
  replaceXmlSpace,
  trimXmlSpace,
} from "#plate/model/values.ts";
import type {
  ModelledBaseType,
  RecordField,
  RecordValue,
  Single,
  Value,
} from "#plate/model/values.ts";
import {
  areaGeometries,
  baseTypes,
  cardinalities,
  externalScorings,
  outcomeViews,
} from "#plate/vocabulary.ts";
import type { BaseType, Cardinality, OutcomeView } from "#plate/vocabulary.ts";

/**
 * Read a container of `qti-value` children, such as `qti-correct-response`, as one value.
 *
 * @param build The build.
 * @param container The container.
 * @param baseType The declaration's base type.
 * @param cardinality The declaration's cardinality.
 * @returns The value, an empty string being NULL.
 */
const valueIn = (
  build: ModelWalk,
  container: SourceElement,
  baseType: ModelledBaseType,
  cardinality: Value["cardinality"],
): Value => {
  const parsed: Option.Option<Single>[] = [];
  for (const value of childrenNamed(container, "qti-value")) {
    parsed.push(
      typed(
        build,
        pathOf(build, value),
        parseElementText(baseType, replaceXmlSpace(textOf(value))),
      ),
    );
  }

  return { baseType, cardinality, values: parsed.flatMap(Option.toArray) };
};

/**
 * Read a declaration's optional value container.
 *
 * @param build The build.
 * @param declaration The declaration.
 * @param local The container's name, `qti-correct-response` or `qti-default-value`.
 * @param declared The declaration's base type and cardinality.
 * @returns The value, none when the declaration has no such container.
 * `value-type`.
 */
const optionalValue = (
  build: ModelWalk,
  declaration: SourceElement,
  local: string,
  declared: Declared,
): Option.Option<Value> =>
  Option.map(Arr.head(childrenNamed(declaration, local)), (container) =>
    valueIn(build, container, declared.baseType, declared.cardinality),
  );

/**
 * The identifier, base type and cardinality of a declaration the model holds.
 */
interface Declared {
  readonly baseType: ModelledBaseType;
  readonly cardinality: Value["cardinality"];
  readonly identifier: string;
}

/**
 * A declaration's identifier, and its base type and cardinality as written, each none when absent.
 */
interface WrittenType {
  readonly baseType: Option.Option<BaseType>;
  readonly cardinality: Option.Option<Cardinality>;
  readonly identifier: string;
}

/**
 * Read a declaration's identifier, base type and cardinality as written.
 *
 * @param build The build.
 * @param declaration A response, outcome or template declaration.
 * @returns Them.
 */
const writtenType = (build: ModelWalk, declaration: SourceElement): WrittenType => {
  const identifier = identifierAttribute(build, declaration, "identifier");
  requiredAttribute(build, declaration, "cardinality");

  const cardinality = enumerated(build, declaration, "cardinality", cardinalities);
  const baseType = enumerated(build, declaration, "base-type", baseTypes);

  return { baseType, cardinality, identifier };
};

/**
 * Read a declaration's identifier, base type and cardinality.
 *
 * @param build The build.
 * @param declaration A response, outcome or template declaration.
 * @returns Them, none when the base type is absent or not modelled or the cardinality is `record`.
 */
const declared = (build: ModelWalk, declaration: SourceElement): Option.Option<Declared> =>
  pipe(writtenType(build, declaration), ({ baseType, cardinality, identifier }) =>
    Option.flatMap(Option.all({ baseType, cardinality }), (read) =>
      read.cardinality !== "record" && isModelled(read.baseType)
        ? Option.some({ baseType: read.baseType, cardinality: read.cardinality, identifier })
        : Option.none(),
    ),
  );

/**
 * Read a declaration the model holds no value of because of its type: an outcome or template
 * declaration of cardinality `record`, whose `base-type` is optional. `buildItem` holds every
 * record response in `records` ({@link recordResponse}), so it reads no response here.
 *
 * @param build The build.
 * @param declaration An outcome or template declaration.
 * @param kind Which of the two it is.
 * @returns Its kind, identifier, base type and cardinality; none when its cardinality is not
 *   `record`.
 */
export const unheldDeclaration = (
  build: ModelWalk,
  declaration: SourceElement,
  kind: UnheldDeclaration["kind"],
): Option.Option<UnheldDeclaration> =>
  pipe(writtenType(build, declaration), ({ baseType, cardinality, identifier }) =>
    cardinality.pipe(
      Option.filter((read) => read === "record"),
      Option.map((read): UnheldDeclaration => ({ baseType, cardinality: read, identifier, kind })),
    ),
  );

/**
 * A typed attribute value as its base type reads it (reading `typed-value-whitespace`): a
 * `map-key`, a lookup table entry's `target-value` or a table's `default-value`, as written for
 * `string`, and for every other base type after XML Schema's `collapse`, the whitespace facet each
 * typed simple type fixes (XML Schema 1.0 Part 2 §4.3.6), so `" 3 "` is the integer 3, as pantry's
 * "Typed attribute value" reads it.
 *
 * @param baseType The value's base type.
 * @param value The attribute's value.
 * @returns The text its base type's lexical space is read over.
 */
const typedLexicalOf = (baseType: ModelledBaseType, value: string): string =>
  baseType === "string" ? value : collapseXmlSpace(value);

/**
 * Read a `qti-mapping` under its response's base type.
 *
 * @param build The build.
 * @param mapping The mapping element.
 * @param baseType The response's base type, which each `map-key` is read in (reading
 *   `typed-value-whitespace`).
 * @returns The mapping.
 */
const mappingOf = (build: Build, mapping: SourceElement, baseType: ModelledBaseType): Mapping => {
  const defaultValue = floatAttribute(build, mapping, "default-value");
  const lowerBound = floatAttribute(build, mapping, "lower-bound");
  const upperBound = floatAttribute(build, mapping, "upper-bound");
  const entries: MapEntry[] = [];
  for (const entry of childrenNamed(mapping, "qti-map-entry")) {
    entries.push(
      (() => {
        const key = requiredAttribute(build, entry, "map-key");
        const value = requiredAttribute(build, entry, "mapped-value");
        const path = pathOf(build, entry);

        return {
          caseSensitive: xsBoolean(build, entry, "case-sensitive", false),
          key: typed(
            build,
            attributePath(path, key),
            parseLexical(baseType, typedLexicalOf(baseType, key.value)),
          ),
          value: floatOf(
            typed(
              build,
              attributePath(path, value),
              parseLexical("float", trimXmlSpace(value.value)),
            ),
          ),
        };
      })(),
    );
  }

  return {
    defaultValue: Option.getOrElse(defaultValue, () => 0),
    entries,
    lowerBound,
    upperBound,
  };
};

/**
 * Read a `qti-area-map-entry`.
 *
 * @param build The build.
 * @param entry The entry.
 * @returns The entry and whether a coordinate of it is written with `%`.
 */
const areaEntryOf = (build: Build, entry: SourceElement) => {
  const shape = listed(
    build,
    entry,
    "shape",
    requiredAttribute(build, entry, "shape"),
    areaGeometries,
  );
  const coords = coordsOf(build, entry);
  const value = requiredAttribute(build, entry, "mapped-value");
  const path = attributePath(pathOf(build, entry), value);

  return {
    entry: {
      coords: coords.map(([number]) => number),
      mappedValue: floatOf(typed(build, path, parseLexical("float", trimXmlSpace(value.value)))),
      shape,
    } satisfies AreaMapEntry,
    percent: coords.some(([, percent]) => percent),
  };
};

/**
 * Read a point response's `qti-area-mapping`.
 *
 * @param build The build.
 * @param mapping The mapping element.
 * @returns The mapping.
 */
const areaMappingOf = (build: Build, mapping: SourceElement): AreaMapping => {
  const defaultValue = floatAttribute(build, mapping, "default-value");
  const lowerBound = floatAttribute(build, mapping, "lower-bound");
  const upperBound = floatAttribute(build, mapping, "upper-bound");
  const read: { readonly entry: AreaMapEntry; readonly percent: boolean }[] = [];
  for (const entry of childrenNamed(mapping, "qti-area-map-entry")) {
    read.push(areaEntryOf(build, entry));
  }

  return {
    defaultValue: Option.getOrElse(defaultValue, () => 0),
    entries: read.map(({ entry }) => entry),
    lowerBound,
    percent: read.some(({ percent }) => percent),
    upperBound,
  };
};

/**
 * A field one `qti-value` of a record declaration's value writes: its identifier and its value,
 * none when the value is NULL. A field of base type `file` is a value as any other, a file known
 * by its written name (`parseLexical` in `#plate/model/values.ts`).
 */
interface WrittenField {
  readonly identifier: string;
  readonly value: Option.Option<Single>;
}

/**
 * Read the field a `qti-value` of a record declaration's value writes: the one its
 * `field-identifier` names, as `identifierOf` reads it, of the `base-type` it writes, its value its
 * text as `parseElementText` reads that base type (reading `typed-value-whitespace`).
 *
 * @param build The build.
 * @param value The `qti-value`.
 * @returns The field.
 */
const writtenField = (build: ModelWalk, value: SourceElement): WrittenField => {
  const identifier = identifierAttribute(build, value, "field-identifier");
  const baseType = pipe(requiredAttribute(build, value, "base-type"), (attribute) =>
    listed(build, value, "base-type", attribute, baseTypes),
  );
  const single = typed(
    build,
    pathOf(build, value),
    parseElementText(baseType, replaceXmlSpace(textOf(value))),
  );

  return { identifier, value: single };
};

/**
 * Read the fields a record declaration's `qti-correct-response` or `qti-default-value` writes, one
 * per `qti-value`, in document order.
 *
 * @param build The build.
 * @param declaration The record declaration.
 * @param local The container's name, `qti-correct-response` or `qti-default-value`.
 * @returns The fields, none when the declaration has no such container.
 */
const writtenFields = (
  build: ModelWalk,
  declaration: SourceElement,
  local: string,
): Option.Option<readonly WrittenField[]> =>
  Option.map(Arr.head(childrenNamed(declaration, local)), (container) => {
    const fields: WrittenField[] = [];
    for (const value of childrenNamed(container, "qti-value")) {
      fields.push(writtenField(build, value));
    }

    return fields;
  });

/**
 * Construct the record some written fields give. A NULL field is no field, so fields that are all
 * NULL give the NULL record, and of the fields that name one identifier the first written is kept,
 * so each identifier is one field.
 *
 * @param fields The fields, in document order.
 * @returns The record.
 */
const recordOf = (fields: readonly WrittenField[]): RecordValue => {
  const named = new Set<string>();
  const kept: RecordField[] = [];
  for (const field of fields) {
    if (Option.isSome(field.value) && !named.has(field.identifier)) {
      named.add(field.identifier);
      kept.push({ identifier: field.identifier, value: field.value.value });
    }
  }

  return { cardinality: "record", fields: kept };
};

/**
 * What the model reads of a `qti-response-declaration`: a record response, which it holds; or
 * `other`, a declaration of another cardinality.
 */
type RecordResponse =
  | { readonly declaration: RecordDeclaration; readonly kind: "held" }
  | { readonly kind: "other" };

/**
 * Read a `qti-response-declaration` of cardinality `record`, whatever interaction binds it: its
 * `qti-correct-response` and its `qti-default-value` each give the record its fields write
 * ({@link recordOf}). The declaration's own `base-type` types none of them: each `qti-value` writes
 * its own, a `file` among them, and a field of `file` is a single of `file`, so every record
 * response is held.
 *
 * @param build The build.
 * @param declaration The declaration.
 * @returns The record response, `held`, or `other` when its cardinality is not `record`.
 */
export const recordResponse = (build: ModelWalk, declaration: SourceElement): RecordResponse => {
  const { cardinality, identifier } = writtenType(build, declaration);
  if (!Option.exists(cardinality, (read) => read === "record")) {
    const other: RecordResponse = { kind: "other" };

    return other;
  }

  const correct = writtenFields(build, declaration, "qti-correct-response");
  const defaultValue = writtenFields(build, declaration, "qti-default-value");
  const held: RecordResponse = {
    declaration: {
      correct: correct.pipe(Option.map(recordOf)),
      defaultValue: defaultValue.pipe(Option.map(recordOf)),
      identifier,
    },
    kind: "held",
  };

  return held;
};

/**
 * Read a `qti-response-declaration`.
 *
 * @param build The build.
 * @param declaration The declaration.
 * @returns The model, none when its base type or cardinality is not modelled.
 */
export const responseDeclaration = (
  build: Build,
  declaration: SourceElement,
): Option.Option<ResponseDeclaration> => {
  const read = declared(build, declaration);
  if (Option.isNone(read)) {
    return Option.none();
  }

  const correct = optionalValue(build, declaration, "qti-correct-response", read.value);
  const defaultValue = optionalValue(build, declaration, "qti-default-value", read.value);
  const mapping = Option.map(Arr.head(childrenNamed(declaration, "qti-mapping")), (element) =>
    mappingOf(build, element, read.value.baseType),
  );
  const areaMapping = pipe(
    Arr.head(childrenNamed(declaration, "qti-area-mapping")),
    Option.filter(() => read.value.baseType === "point"),
    Option.map((element) => areaMappingOf(build, element)),
  );

  return Option.some({ ...read.value, areaMapping, correct, defaultValue, mapping });
};

/**
 * Read an outcome declaration's `view`, an XSD list of {@link outcomeViews}: its tokens are the
 * runs between XML whitespace.
 *
 * @param declaration The declaration.
 * @param refuse The reader's defect of an attribute.
 * @returns The views in the order written, none when absent.
 */
const viewAttribute = (
  declaration: SourceElement,
  refuse: AttributeFault,
): Option.Option<readonly OutcomeView[]> =>
  Option.map(attributeOf(declaration, "view"), (attribute) => {
    const views: OutcomeView[] = [];
    for (const token of attribute.value.split(xmlWhitespaceRun).filter((each) => each !== "")) {
      views.push(
        Option.match(
          Arr.findFirst(outcomeViews, (view) => view === token),
          {
            onNone: () =>
              refuse(attribute, "attribute-type", {
                attribute: "view",
                value: attribute.value,
              }),
            onSome: (view) => view,
          },
        ),
      );
    }

    return views;
  });

/**
 * Read the six attributes of a `qti-outcome-declaration` that Results Reporting mirrors on an
 * `outcomeVariable`, each as the XSD types it.
 *
 * @param declaration The declaration.
 * @param refuse The reader's defect of an attribute, at that attribute's path in its document.
 * @returns The six, each none when absent.
 */
const outcomeReporting = (declaration: SourceElement, refuse: AttributeFault): OutcomeReporting => {
  const view = viewAttribute(declaration, refuse);
  const normalMaximum = doubleAttribute(declaration, "normal-maximum", refuse);
  const normalMinimum = doubleAttribute(declaration, "normal-minimum", refuse);
  const masteryValue = doubleAttribute(declaration, "mastery-value", refuse);

  return {
    interpretation: valueOf(declaration, "interpretation"),
    longInterpretation: Option.map(valueOf(declaration, "long-interpretation"), collapseXmlSpace),
    masteryValue,
    normalMaximum,
    normalMinimum,
    view,
  };
};

/**
 * Read a lookup table's optional `default-value` in its outcome's base type (reading
 * `typed-value-whitespace`).
 *
 * @param build The build.
 * @param table The `qti-match-table` or `qti-interpolation-table`.
 * @param baseType The outcome's base type, which the value is read in.
 * @returns The value, none when absent.
 */
const tableDefault = (
  build: ModelWalk,
  table: SourceElement,
  baseType: ModelledBaseType,
): Option.Option<Single> =>
  Option.map(attributeOf(table, "default-value"), (attribute) =>
    typed(
      build,
      attributePath(pathOf(build, table), attribute),
      parseLexical(baseType, typedLexicalOf(baseType, attribute.value)),
    ),
  );

/**
 * Read a lookup table entry's `target-value` in its outcome's base type (readings
 * `typed-value-whitespace` and `match-table-target-value`).
 *
 * @param build The build.
 * @param entry The entry.
 * @param baseType The outcome's base type.
 * @returns The value.
 */
const targetValue = (build: ModelWalk, entry: SourceElement, baseType: ModelledBaseType): Single =>
  pipe(requiredAttribute(build, entry, "target-value"), (attribute) =>
    typed(
      build,
      attributePath(pathOf(build, entry), attribute),
      parseLexical(baseType, typedLexicalOf(baseType, attribute.value)),
    ),
  );

/**
 * Read a `qti-match-table-entry`. Its `source-value`, an `xs:int`, is read as the XSD reads it:
 * outer whitespace goes, then the integer is held exactly and refused outside -2^31 to 2^31-1.
 *
 * @param build The build.
 * @param entry The entry.
 * @param baseType The outcome's base type.
 * @returns The entry.
 */
const matchEntryOf = (
  build: ModelWalk,
  entry: SourceElement,
  baseType: ModelledBaseType,
): MatchTableEntry => {
  const source = requiredAttribute(build, entry, "source-value");
  const path = attributePath(pathOf(build, entry), source);
  const lexical = trimXmlSpace(source.value);
  const sourceValue = integerOf(typed(build, path, parseLexical("integer", lexical)));

  return { sourceValue, targetValue: targetValue(build, entry, baseType) };
};

/**
 * Read a `qti-interpolation-table-entry`. Its `source-value`, an `xs:double`, is read as the XSD
 * reads it, outer whitespace collapsed (reading `typed-value-whitespace`), and its
 * `include-boundary` is true when absent, the XSD's default.
 *
 * @param build The build.
 * @param entry The entry.
 * @param baseType The outcome's base type.
 * @returns The entry.
 */
const interpolationEntryOf = (
  build: ModelWalk,
  entry: SourceElement,
  baseType: ModelledBaseType,
): InterpolationTableEntry => {
  const source = requiredAttribute(build, entry, "source-value");
  const sourceValue = floatOf(
    typed(
      build,
      attributePath(pathOf(build, entry), source),
      parseLexical("float", trimXmlSpace(source.value)),
    ),
  );

  return {
    includeBoundary: xsBoolean(build, entry, "include-boundary", true),
    sourceValue,
    targetValue: targetValue(build, entry, baseType),
  };
};

/**
 * Read an outcome declaration's lookup table, its `qti-match-table` or its
 * `qti-interpolation-table` (the XSD admits at most one of the two), in the outcome's base type.
 *
 * @param build The build.
 * @param declaration The declaration.
 * @param baseType The outcome's base type.
 * @returns The table, none when the declaration has none.
 */
const lookupTableOf = (
  build: ModelWalk,
  declaration: SourceElement,
  baseType: ModelledBaseType,
): Option.Option<LookupTable> =>
  Option.orElse(
    Option.map(Arr.head(childrenNamed(declaration, "qti-match-table")), (table): LookupTable => {
      const defaultValue = tableDefault(build, table, baseType);
      const entries: MatchTableEntry[] = [];
      for (const entry of childrenNamed(table, "qti-match-table-entry")) {
        entries.push(matchEntryOf(build, entry, baseType));
      }

      return { defaultValue, entries, kind: "match" as const };
    }),
    () =>
      Option.map(
        Arr.head(childrenNamed(declaration, "qti-interpolation-table")),
        (table): LookupTable => {
          const defaultValue = tableDefault(build, table, baseType);
          const entries: InterpolationTableEntry[] = [];
          for (const entry of childrenNamed(table, "qti-interpolation-table-entry")) {
            entries.push(interpolationEntryOf(build, entry, baseType));
          }

          return { defaultValue, entries, kind: "interpolation" as const };
        },
      ),
  );

/**
 * Read a `qti-outcome-declaration`.
 *
 * @param build The build.
 * @param declaration The declaration.
 * @returns The model, none when its base type is absent or not modelled or its cardinality is
 *   `record`.
 */
export const outcomeDeclaration = (
  build: ModelWalk,
  declaration: SourceElement,
): Option.Option<OutcomeDeclaration> => {
  const read = declared(build, declaration);
  if (Option.isNone(read)) {
    return Option.none();
  }

  const reporting = outcomeReporting(declaration, (attribute, rule, detail) =>
    inadmissible(build, rule, attributePath(pathOf(build, declaration), attribute), detail),
  );
  const defaultValue = optionalValue(build, declaration, "qti-default-value", read.value);
  const lookupTable = lookupTableOf(build, declaration, read.value.baseType);
  const externalScored = enumerated(build, declaration, "external-scored", externalScorings);
  const outcome: OutcomeDeclaration = { ...read.value, ...reporting, defaultValue, lookupTable };

  return Option.some(
    Option.match(externalScored, {
      onNone: () => outcome,
      onSome: (scoring) => ({ ...outcome, externalScored: scoring }),
    }),
  );
};

/**
 * Read a `qti-template-declaration`, through {@link declared} and {@link optionalValue} as an
 * outcome declaration is read.
 *
 * @param build The build.
 * @param declaration The declaration.
 * @returns The model, none when its base type is absent or not modelled or its cardinality is
 *   `record`.
 */
export const templateDeclaration = (
  build: ModelWalk,
  declaration: SourceElement,
): Option.Option<TemplateDeclaration> => {
  const read = declared(build, declaration);
  if (Option.isNone(read)) {
    return Option.none();
  }

  const mathVariable = xsBoolean(build, declaration, "math-variable", false);
  const paramVariable = xsBoolean(build, declaration, "param-variable", false);
  const defaultValue = optionalValue(build, declaration, "qti-default-value", read.value);

  return Option.some({ ...read.value, defaultValue, mathVariable, paramVariable });
};

/**
 * Read a `qti-context-declaration` through {@link declared} and {@link optionalValue}, as an
 * outcome declaration is read.
 *
 * @param build The build.
 * @param declaration The declaration.
 * @returns The model, none when its base type is absent or not modelled or its cardinality is
 *   `record`.
 */
export const contextDeclaration = (
  build: ModelWalk,
  declaration: SourceElement,
): Option.Option<ContextDeclaration> => {
  const read = declared(build, declaration);
  if (Option.isNone(read)) {
    return Option.none();
  }

  const defaultValue = optionalValue(build, declaration, "qti-default-value", read.value);

  return Option.some({ ...read.value, defaultValue });
};
