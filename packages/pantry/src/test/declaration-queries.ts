/**
 * The declaration and mapping overlays' rules over a query
 * (`#pantry/qti/overlay-queries/declaration.ts`), and the in-place half of "Mapped response" and
 * the references' "Variable declared" (`#pantry/qti/overlay-queries/reference.ts`), restated on the
 * host over the import's rows as
 * the import's write stores them, for the tests that judge those rows: the host judge judges no
 * derived relation (`#pantry/test/host-judge.ts`), and the database alone judges a rule over a
 * query. Each restatement reads what its query reads, an overlay row, an attribute and its node's
 * parent or kind in `Node`, and names the law it breaks; "Mastery range" is its check over its
 * pair's rows as grizzle's evaluator judges it.
 *
 * A declaration's name, cardinality and base type, and a value's field and base type, are its
 * attributes', read as the views read them (`#pantry/qti/names.ts`): a name its `identifier`
 * collapsed, a code its lexical form where that spells one. A name is read only where it names
 * something: the database judges no rule over a query over one that does not, since AL1's
 * `value_domain` refuses the write that holds it first (spec reading 152), and the host judge
 * names AL1 alone.
 */
import type { PreviewRows } from "@bjornpagen/grizzle";
import { Option } from "effect";
import { collapse, namingText } from "#pantry/grammar/domains.ts";
import {
  BaseTypeLexical,
  CardinalityLexical,
  Declares,
  MappableBaseType,
  VariableReference,
} from "#pantry/grammar/install.ts";
import {
  contextVariable,
  declarationKinds,
  itemSessionVariables,
  valueSetKinds,
} from "#pantry/qti/declarations.ts";
import { BaseTypePattern, unjudgedBaseTypes } from "#pantry/qti/expression-types.ts";
import { builtInResponses, silentBases } from "#pantry/qti/expressions.ts";
import type { LawName } from "#pantry/import/refusal.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { lookupEntryKinds, lookupTableKinds } from "#pantry/qti/mapping.ts";
import { MasteryCeiling, MasteryFloor } from "#pantry/qti/overlay-queries/declaration.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { evaluatorFor, readingsOf, textOfField } from "#pantry/test/host-judge.ts";
import type { HeldRow } from "#pantry/test/host-judge.ts";
import { nodePlacesOf, placeKey } from "#pantry/test/places.ts";
import { brokenIn } from "#pantry/test/row-evaluation.ts";
import { normalMinimumDefault } from "#pantry/vocab/terms/declarations.ts";
import { itemKind } from "#pantry/vocab/terms/tests.ts";

/**
 * The text of a document, `(package, path)`, each value's text as grizzle's `codecText` of
 * `Node`'s field writes it.
 *
 * @param pkg - The package.
 * @param path - The document's path.
 * @returns The document's text.
 */
// oxlint-disable-next-line anti-slop/no-unknown-parameters -- A document's package and path as rows of several relations hold them, each its codec's host value.
const documentKeyOf = (pkg: unknown, path: unknown): string =>
  JSON.stringify([textOfField("Node", "package", pkg), textOfField("Node", "path", path)]);

/**
 * The text of a node's place, `(package, path, start)`, each value's text as grizzle's `codecText`
 * of `Node`'s field writes it.
 *
 * @param place - The place's values.
 * @returns The place's text.
 */
const placeKeyOf = (place: readonly [unknown, unknown, unknown]): string =>
  JSON.stringify([
    textOfField("Node", "package", place[0]),
    textOfField("Node", "path", place[1]),
    textOfField("Node", "start", place[2]),
  ]);

/**
 * The text of a node's child of a kind: the node's place and the kind's text.
 *
 * @param child - The node's place and the child's kind.
 * @returns The text.
 */
const childKeyOf = (child: readonly [unknown, unknown, unknown, unknown]): string =>
  JSON.stringify([
    placeKeyOf([child[0], child[1], child[2]]),
    textOfField("Node", "kind", child[3]),
  ]);

/**
 * The text of a row's place, `(package, path, start)`.
 *
 * @param row - The row.
 * @returns The place's text.
 */
const placeOf = (row: HeldRow): string => placeKeyOf([row["package"], row["path"], row["start"]]);

/**
 * A lexical form that names something once collapsed (`namingPattern` of
 * `#pantry/qti/attributes.ts`), as the host reads it.
 */
const namingForm = new RegExp(namingText, "u");

/**
 * The table a placed map response or map response point reads of its declaration, by its kind.
 */
const mappedTables: ReadonlyMap<string, string> = new Map([
  ["qti-map-response", "qti-mapping"],
  ["qti-map-response-point", "qti-area-mapping"],
]);

/**
 * The rows the restatements read, each relation's by place, and the reads over `Node` every rule
 * makes: a row's node's parent and kind, and whether a node holds a child of a kind.
 */
interface Index {
  readonly all: (relation: string) => readonly HeldRow[];
  readonly at: (relation: string) => ReadonlyMap<string, HeldRow>;
  readonly attributeAt: (place: string, name: string) => string | undefined;
  readonly holdsChild: (child: readonly [unknown, unknown, unknown, unknown]) => boolean;
  // oxlint-disable-next-line anti-slop/no-unknown-returns -- A node's kind, its codec's host value, which the restatements compare with kinds.
  readonly kindAt: (place: string) => unknown;
  readonly nodeAt: (place: string) => HeldRow | undefined;
  readonly parentOf: (row: HeldRow) => string | undefined;
  readonly rows: PreviewRows<typeof Qti>;
}

/**
 * Index the rows.
 *
 * @param rows - The import's rows, as the host fills them.
 * @returns The index.
 */
const indexOf = (rows: PreviewRows<typeof Qti>): Index => {
  const held: ReadonlyMap<string, readonly HeldRow[]> = new Map(
    [...readingsOf(rows)].map(([relation, read]) => [relation, read.map(({ values }) => values)]),
  );
  const all = (relation: string): readonly HeldRow[] => held.get(relation) ?? [];
  const byPlace = new Map<string, ReadonlyMap<string, HeldRow>>();
  const at = (relation: string): ReadonlyMap<string, HeldRow> => {
    const known = byPlace.get(relation);
    if (known !== undefined) {
      return known;
    }

    const placed = new Map(all(relation).map((row) => [placeOf(row), row] as const));
    byPlace.set(relation, placed);

    return placed;
  };
  const nodes = at("Node");
  const children = new Set(
    all("Node").map((node) =>
      childKeyOf([node["package"], node["path"], node["parent"], node["kind"]]),
    ),
  );
  const attributes = new Map(
    all("Attribute").map(
      (attribute) =>
        [
          JSON.stringify([placeOf(attribute), textOfField("Attribute", "name", attribute["name"])]),
          textOfField("Attribute", "lexical", attribute["lexical"]),
        ] as const,
    ),
  );

  return {
    all,
    at,
    attributeAt: (place, name) => attributes.get(JSON.stringify([place, name])),
    holdsChild: (child) => children.has(childKeyOf(child)),
    kindAt: (place) => nodes.get(place)?.["kind"],
    nodeAt: (place) => nodes.get(place),
    parentOf: (row) => {
      const parent = nodes.get(placeOf(row))?.["parent"];

      return parent === undefined ? undefined : placeKeyOf([row["package"], row["path"], parent]);
    },
    rows,
  };
};

/**
 * Read the place of a row's node's grandparent: a typed value's declaration, its set's node's
 * parent.
 *
 * @param index - The index.
 * @param row - The row.
 * @returns The place, none where the row has no such node.
 */
const grandparentOf = (index: Index, row: HeldRow): string | undefined => {
  const parent = index.parentOf(row);
  const parentNode = parent === undefined ? undefined : index.nodeAt(parent);

  return parentNode === undefined ? undefined : index.parentOf(parentNode);
};

/**
 * Read the place of a lookup value's declaration: its table's node's parent, the table its own
 * node for a table's default and its node's parent for an entry's target.
 *
 * @param index - The index.
 * @param row - The lookup value.
 * @returns The declaration's place, none where its node is neither.
 */
const lookupDeclarationOf = (index: Index, row: HeldRow): string | undefined => {
  const kind = index.kindAt(placeOf(row));
  if (lookupTableKinds.some((table) => table === kind)) {
    return index.parentOf(row);
  }

  const table = lookupEntryKinds.some((entry) => entry === kind) ? index.parentOf(row) : undefined;
  const tableKind = table === undefined ? undefined : index.kindAt(table);

  return lookupTableKinds.some((held) => held === tableKind)
    ? grandparentOf(index, row)
    : undefined;
};

/**
 * Read the place of a map key's declaration: its entry's mapping's node's parent, where its
 * entry's parent is a `qti-mapping`.
 *
 * @param index - The index.
 * @param row - The map key.
 * @returns The declaration's place, none where its entry is in no mapping.
 */
const mapKeyDeclarationOf = (index: Index, row: HeldRow): string | undefined => {
  const mapping = index.parentOf(row);

  return mapping !== undefined && index.kindAt(mapping) === "qti-mapping"
    ? grandparentOf(index, row)
    : undefined;
};

/**
 * The places of the declarations that hold a table of some kinds: each such node's parent.
 *
 * @param index - The index.
 * @param kinds - The tables' kinds.
 * @returns Each table's declaration's place, one per table.
 */
const tableDeclarationsOf = (index: Index, kinds: readonly string[]): readonly string[] =>
  index
    .all("Node")
    .filter((node) => kinds.some((kind) => kind === node["kind"]))
    .flatMap((table) => {
      const declaration = index.parentOf(table);

      return declaration === undefined ? [] : [declaration];
    });

/**
 * A name a document declares: a declaration's node, and its `identifier` collapsed, where that
 * names something.
 */
interface DeclaredName {
  readonly name: string;
  readonly node: HeldRow;
}

/**
 * Read the name a value's field or a declaration's `identifier` gives, as the views read it: the
 * attribute collapsed, where it names something ({@link namingForm}).
 *
 * @param index - The index.
 * @param place - The element's place.
 * @param name - The attribute's name.
 * @returns The name, none where it is unwritten or names nothing.
 */
const nameAt = (index: Index, place: string, name: string): string | undefined => {
  const lexical = index.attributeAt(place, name);

  return lexical !== undefined && namingForm.test(lexical) ? collapse(lexical) : undefined;
};

/**
 * The names the documents declare, each beside its declaration's node: the `NamedDeclaration`
 * rows of `#pantry/qti/names.ts`.
 *
 * @param index - The index.
 * @returns The names.
 */
const declaredNamesOf = (index: Index): readonly DeclaredName[] =>
  index
    .all("Node")
    .filter((node) => declarationKinds.some((kind) => kind === node["kind"]))
    .flatMap((node) => {
      const name = nameAt(index, placeOf(node), "identifier");

      return name === undefined ? [] : [{ name, node }];
    });

/**
 * Read the place of the declaration a reference's name resolves to in a document: its
 * `NamedDeclaration` of the name there, as the reference queries join it
 * (`#pantry/qti/overlay-queries/reference.ts`).
 *
 * @param index - The index.
 * @param document - The document's text ({@link documentKeyOf}).
 * @param name - The name.
 * @returns The declaration's `start`, none where the document declares no such name.
 */
// oxlint-disable-next-line anti-slop/no-unknown-returns -- A declaration's start, its codec's host value, which a place's text reads.
const resolvedIn = (index: Index, document: string, name: string): unknown =>
  declaredNamesOf(index).find(
    (declared) =>
      declared.name === name &&
      documentKeyOf(declared.node["package"], declared.node["path"]) === document,
  )?.node["start"];

/**
 * A declaration's kind as the name views derive it (`#pantry/qti/names.ts`): `Declares` of its
 * node's kind, none where its node declares nothing.
 *
 * @param index - The index.
 * @param place - The declaration's place.
 * @returns Its `DeclarationKind`, or none.
 */
const declarationKindAt = (index: Index, place: string): string | undefined => {
  const kind = index.kindAt(place);

  return Declares.rows.find((declares) => declares.kind === kind)?.declaration;
};

/**
 * The built-in response variables, by `root variable`: none declares a mapping or an area mapping
 * (decision 431, spec reading 166).
 */
const builtInResponseNames: ReadonlySet<string> = new Set(
  builtInResponses.map(({ root, variable }) => `${root} ${variable}`),
);

/**
 * State "Mapped response" over a query, under each placement (spec reading 117): a map response or
 * map response point by `identifier` names no built-in response, and a declared one names a
 * response declaration of its assembly's root whose node holds its table, a map response point's
 * of base type point or one its typing leaves silent.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const mappedHolds = (index: Index): boolean =>
  index.all("PlacedVariableRef").every((placed) => {
    // A reference's element's kind is its node's, as the view `PlacedVariableRefNode` reads it.
    const referrer = textOfField("Node", "kind", index.kindAt(placeOf(placed)));
    const table = mappedTables.get(referrer);
    const declaration =
      placed["resolution"] === "declared"
        ? resolvedIn(
            index,
            documentKeyOf(placed["package"], placed["assembly"]),
            textOfField("PlacedVariableRef", "identifier", placed["identifier"]),
          )
        : undefined;
    const kind =
      declaration === undefined
        ? undefined
        : declarationKindAt(
            index,
            placeKeyOf([placed["package"], placed["assembly"], declaration]),
          );

    return (
      table === undefined ||
      placed["attribute"] !== "identifier" ||
      (placed["resolution"] === "builtIn"
        ? !builtInResponseNames.has(
            `${textOfField("PlacedVariableRef", "rootKind", placed["rootKind"])} ${textOfField("PlacedVariableRef", "identifier", placed["identifier"])}`,
          )
        : declaration === undefined ||
          (index.holdsChild([placed["package"], placed["assembly"], declaration, table]) &&
            kind === "qti-response-declaration" &&
            (referrer !== "qti-map-response-point" ||
              ["point", ...silentBases].some((base) => base === placed["baseType"]))))
    );
  });

/**
 * The references `VariableReference` spells braced, by `kind attribute`.
 */
const bracedReferences: ReadonlySet<string> = new Set(
  VariableReference.rows.flatMap(({ attribute, kind, spelling }) =>
    spelling === "braced" ? [`${kind} ${attribute}`] : [],
  ),
);

/**
 * State "Variable declared" over a query: an item's unresolved reference under any placement, its
 * own document's, a fragment's or a located template's, is braced by its element's kind and its
 * attribute, a string value (reading R15-k); the kind is its node's, as the view
 * `PlacedVariableRefNode` reads it.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const variableDeclaredHolds = (index: Index): boolean =>
  index
    .all("PlacedVariableRef")
    .every(
      (reference) =>
        reference["rootKind"] !== itemKind ||
        reference["resolution"] !== "unresolved" ||
        bracedReferences.has(
          `${textOfField("Node", "kind", index.kindAt(placeOf(reference)))} ${textOfField("PlacedVariableRef", "attribute", reference["attribute"])}`,
        ),
    );

/**
 * The place of a value's or a field's declaration, where its node's parent is a value set of a
 * declaration: its node's grandparent, the declaration's node.
 *
 * @param index - The index.
 * @param row - The value's or the field's row, or its node's.
 * @returns The declaration's place, none where its node's parent is no value set.
 */
const setDeclarationOf = (index: Index, row: HeldRow): string | undefined => {
  const set = index.parentOf(row);
  const kind = set === undefined ? undefined : index.kindAt(set);

  return valueSetKinds.some((held) => held === kind) ? grandparentOf(index, row) : undefined;
};

/**
 * The code a `cardinality` spells, by its lexical form: `CardinalityLexical`'s rows, the roster the
 * view joins (`attributeCodes` of `#pantry/qti/names.ts`, over `CardinalityLexical`).
 */
const cardinalityCodes: ReadonlyMap<string, string> = new Map(
  CardinalityLexical.rows.map(({ code, lexical }) => [lexical, code] as const),
);

/**
 * The code a `base-type` spells, by its lexical form: `BaseTypeLexical`'s rows, the roster the view
 * joins (`attributeCodes` of `#pantry/qti/names.ts`, over `BaseTypeLexical`).
 */
const baseTypeCodes: ReadonlyMap<string, string> = new Map(
  BaseTypeLexical.rows.map(({ code, lexical }) => [lexical, code] as const),
);

/**
 * Read the code a lexical form spells, as a view joins it to its roster's lexical relation (C17).
 *
 * @param lexical - The form, none where its attribute is unwritten.
 * @param codes - The roster's codes, by their lexical forms.
 * @returns The code, none where the form spells none.
 */
const spelled = (
  lexical: string | undefined,
  codes: ReadonlyMap<string, string>,
): string | undefined => (lexical === undefined ? undefined : codes.get(lexical));

/**
 * Read the code an element's attribute spells, as its view joins it to its lexical relation (C17):
 * its lexical form, compared as written, since `cardinality` and `base-type` restrict `xs:string`.
 *
 * @param index - The index.
 * @param place - The element's place, none where there is none.
 * @param name - The attribute's name.
 * @param codes - The codes it may spell.
 * @returns The code, none where it is unwritten or spells none.
 */
const codeAt = (
  index: Index,
  place: string | undefined,
  name: string,
  codes: ReadonlyMap<string, string>,
): string | undefined =>
  spelled(place === undefined ? undefined : index.attributeAt(place, name), codes);

/**
 * Read a declaration's cardinality, its `DeclarationCardinality`'s, where it has one.
 *
 * @param index - The index.
 * @param declaration - The declaration's place, none where there is none.
 * @returns The cardinality, none where it has none.
 */
const cardinalityAt = (index: Index, declaration: string | undefined): string | undefined =>
  codeAt(index, declaration, "cardinality", cardinalityCodes);

/**
 * Read a declaration's base type, its `DeclarationBaseType`'s, or a value's own, where it has one.
 *
 * @param index - The index.
 * @param element - The declaration's or the value's place, none where there is none.
 * @returns The base type, none where it has none.
 */
const baseTypeAt = (index: Index, element: string | undefined): string | undefined =>
  codeAt(index, element, "base-type", baseTypeCodes);

/**
 * State "MappableBaseType" over a query: a mapping's declaration is no record, where it has a
 * cardinality, and its base type, where it has one, is a mappable type.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const mappableHolds = (index: Index): boolean =>
  tableDeclarationsOf(index, ["qti-mapping"]).every((declaration) => {
    const baseType = baseTypeAt(index, declaration);

    return (
      cardinalityAt(index, declaration) !== "record" &&
      (baseType === undefined || MappableBaseType.rows.some((row) => row.baseType === baseType))
    );
  });

/**
 * State "AreaMapping base type" over a query: an area mapping's declaration is no record, where it
 * has a cardinality, and its base type, where it has one, is `point`.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const areaHolds = (index: Index): boolean =>
  tableDeclarationsOf(index, ["qti-area-mapping"]).every((declaration) => {
    const baseType = baseTypeAt(index, declaration);

    return (
      cardinalityAt(index, declaration) !== "record" &&
      (baseType === undefined || baseType === "point")
    );
  });

/**
 * State "Lookup table cardinality" over a query: a lookup table's declaration is single, where it
 * has a cardinality.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const lookupCardinalityHolds = (index: Index): boolean =>
  tableDeclarationsOf(index, lookupTableKinds).every((declaration) => {
    const cardinality = cardinalityAt(index, declaration);

    return cardinality === undefined || cardinality === "single";
  });

/**
 * State that an attribute's typed value is a lexical form of a base type, as
 * `Typed_attribute_value` reads it: it matches the base type's `BaseTypePattern`, as written for
 * `string` and collapsed for every other base type (reading 7).
 *
 * @param baseType - The base type.
 * @param written - The value as written, its field's text (`#pantry/test/host-judge.ts`
 *   `textOfField`).
 * @returns Whether it is one.
 */
const typedAttribute = (baseType: string, written: string): boolean => {
  const pattern = BaseTypePattern.rows.find((row) => row.baseType === baseType)?.pattern;

  return (
    pattern !== undefined &&
    new RegExp(pattern, "u").test(baseType === "string" ? written : collapse(written))
  );
};

/**
 * State "Typed attribute value" over a query: a map key, read in its mapping's declaration's base
 * type, and a lookup value, read in its table's, are each a lexical form of it, where the
 * declaration has one.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const typedAttributeHolds = (index: Index): boolean =>
  [
    ...index
      .all("MapKey")
      .map(
        (key) =>
          [
            baseTypeAt(index, mapKeyDeclarationOf(index, key)),
            textOfField("MapKey", "key", key["key"]),
          ] as const,
      ),
    ...index
      .all("LookupValue")
      .map(
        (value) =>
          [
            baseTypeAt(index, lookupDeclarationOf(index, value)),
            textOfField("LookupValue", "value", value["value"]),
          ] as const,
      ),
  ].every(([baseType, text]) => baseType === undefined || typedAttribute(baseType, text));

/**
 * The `qti-value` nodes, each a value of some set.
 *
 * @param index - The index.
 * @returns The nodes.
 */
const valueNodes = (index: Index): readonly HeldRow[] =>
  index.all("Node").filter((node) => node["kind"] === "qti-value");

/**
 * State "Value cardinality" over a query: a single variable's value set holds one value, and every
 * value of a record's set is a field, with its `field-identifier` and its `base-type` both. A value
 * of any other set may write either (information model §7.46.1, §7.46.2).
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const cardinalityHolds = (index: Index): boolean =>
  index
    .all("Node")
    .every(
      (set) =>
        !valueSetKinds.some((kind) => kind === set["kind"]) ||
        cardinalityAt(index, index.parentOf(set)) !== "single" ||
        set["elementChildren"] === 1n,
    ) &&
  valueNodes(index).every(
    (value) =>
      cardinalityAt(index, setDeclarationOf(index, value)) !== "record" ||
      (index.attributeAt(placeOf(value), "field-identifier") !== undefined &&
        index.attributeAt(placeOf(value), "base-type") !== undefined),
  );

/**
 * State "Record field key" over a query: a record's set's named fields, each whose
 * `field-identifier` names something once collapsed, are distinct by name. A `field-identifier`
 * on a value of any other set names no field (information model §7.46.1).
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const fieldKeyHolds = (index: Index): boolean => {
  const names = valueNodes(index).flatMap((field) => {
    const name =
      cardinalityAt(index, setDeclarationOf(index, field)) === "record"
        ? nameAt(index, placeOf(field), "field-identifier")
        : undefined;

    return name === undefined ? [] : [JSON.stringify([index.parentOf(field), name])];
  });

  return new Set(names).size === names.length;
};

/**
 * State that a text is a lexical form of a base type, as `Typed_value` reads it: every text of a
 * base type of `unjudgedBaseTypes` is one, and every other is one where it matches the base type's
 * `BaseTypePattern`.
 *
 * @param baseType - The base type.
 * @param text - The text.
 * @returns Whether it is one.
 */
// oxlint-disable-next-line anti-slop/no-unknown-parameters -- A node's text as its row holds it, its codec's host value.
const typedText = (baseType: string | undefined, text: unknown): boolean => {
  const pattern = BaseTypePattern.rows.find((row) => row.baseType === baseType)?.pattern;

  return (
    unjudgedBaseTypes.some((unjudged) => unjudged === baseType) ||
    (pattern !== undefined &&
      new RegExp(pattern, "u").test(textOfField("Node", "stringValue", text)))
  );
};

/**
 * State "Typed value" over a query: a value's text, its node's string value, is a lexical form of
 * its declaration's base type unless the declaration is a record, and a record's field's text one
 * of its own base type.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const typedValueHolds = (index: Index): boolean =>
  valueNodes(index).every((value) => {
    const declaration = setDeclarationOf(index, value);
    const cardinality = cardinalityAt(index, declaration);
    const baseType = baseTypeAt(index, declaration);
    const own = baseTypeAt(index, placeOf(value));
    const declared =
      baseType === undefined ||
      cardinality === undefined ||
      cardinality === "record" ||
      typedText(baseType, value["stringValue"]);
    const field =
      own === undefined ||
      cardinality === undefined ||
      cardinality !== "record" ||
      typedText(own, value["stringValue"]);

    return declared && field;
  });

/**
 * State "Reserved type" over a query: QTI_CONTEXT is a context declaration and, where it has a
 * cardinality, a record (reading 74), each name beside its declaration's kind and cardinality.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const reservedHolds = (index: Index): boolean =>
  declaredNamesOf(index).every(({ name, node }) => {
    const place = placeOf(node);
    const kind = declarationKindAt(index, place);
    const cardinality = cardinalityAt(index, place);

    return (
      name !== contextVariable.identifier ||
      (kind === contextVariable.kind &&
        (cardinality === undefined || cardinality === contextVariable.cardinality))
    );
  });

/**
 * State "Declaration base type" over a query: a declaration of a record has no base type, and one
 * of another cardinality writes a `base-type`, where it has a cardinality.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const declaredTypeHolds = (index: Index): boolean =>
  index
    .all("Node")
    .filter((node) => declarationKinds.some((kind) => kind === node["kind"]))
    .every((node) => {
      const place = placeOf(node);
      const cardinality = cardinalityAt(index, place);

      return cardinality === "record"
        ? baseTypeAt(index, place) === undefined
        : cardinality === undefined || index.attributeAt(place, "base-type") !== undefined;
    });

/**
 * State "Declaration key" over a query: a document's declared names are distinct.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const declarationKeyHolds = (index: Index): boolean => {
  const names = declaredNamesOf(index).map(({ name, node }) =>
    JSON.stringify([documentKeyOf(node["package"], node["path"]), name]),
  );

  return new Set(names).size === names.length;
};

/**
 * State "Declaration not reserved" over a query: no declared name is one of an item's built-in
 * session variables.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const notReservedHolds = (index: Index): boolean =>
  declaredNamesOf(index).every(({ name }) => !itemSessionVariables.includes(name));

/**
 * Grizzle's `doubleText` as the host reads it: a decimal mantissa with an optional exponent, or
 * `INF`, `-INF` or `NaN`, XML Schema 1.1's `xs:double` lexical space without `+INF`.
 */
const doubleForm = /^(?:[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[Ee][+-]?[0-9]+)?|-?INF|NaN)$/u;

/**
 * Read an attribute's lexical form as the scale views read it (`attributeDoubles` of
 * `#pantry/qti/names.ts`): collapsed, then the double it names where it is in {@link doubleForm},
 * as `Text.parseDouble` maps it (the nearest double, which `Number` computes), and none
 * otherwise.
 *
 * @param lexical - The form as written, none where the attribute is unwritten.
 * @returns The double, none where it names none.
 */
const doubleOf = (lexical: string | undefined): Option.Option<number> => {
  const form = lexical === undefined ? undefined : collapse(lexical);
  if (form === undefined || !doubleForm.test(form)) {
    return Option.none();
  }

  if (form === "INF") {
    return Option.some(Number.POSITIVE_INFINITY);
  }

  return Option.some(form === "-INF" ? Number.NEGATIVE_INFINITY : Number(form));
};

/**
 * State "Mastery range" over a query: each pair of an outcome's scale, its normal minimum's and its
 * mastery value's (`MasteryFloor`) and its mastery value's and its normal maximum's
 * (`MasteryCeiling`), each the double its attribute names as the views read it, the minimum the
 * XSD's default where the declaration writes none (spec reading 149), holds `Mastery_range`'s check
 * as grizzle's evaluator judges it (`#pantry/test/row-evaluation.ts` `brokenIn`).
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const masteryHolds = (index: Index): boolean => {
  const evaluate = evaluatorFor(Qti);
  const scales = index.rows.Node.filter(({ kind }) => kind === "qti-outcome-declaration").map(
    (node) => {
      const place = placeKeyOf([node.package, node.path, node.start]);
      const minimum = index.attributeAt(place, "normal-minimum");

      return {
        mastery: doubleOf(index.attributeAt(place, "mastery-value")),
        maximum: doubleOf(index.attributeAt(place, "normal-maximum")),
        minimum:
          minimum === undefined ? Option.some(Number(normalMinimumDefault)) : doubleOf(minimum),
        node,
      };
    },
  );
  const floors = scales.flatMap(({ mastery, minimum, node }) =>
    Option.toArray(Option.all([minimum, mastery])).map(([normalMinimum, masteryValue]) => ({
      masteryValue,
      normalMinimum,
      package: node.package,
      path: node.path,
      start: node.start,
    })),
  );
  const ceilings = scales.flatMap(({ mastery, maximum, node }) =>
    Option.toArray(Option.all([mastery, maximum])).map(([masteryValue, normalMaximum]) => ({
      masteryValue,
      normalMaximum,
      package: node.package,
      path: node.path,
      start: node.start,
    })),
  );

  return (
    floors.every(
      (row) =>
        !Option.contains(
          brokenIn(
            evaluate.admit(MasteryFloor, row),
            (admitted) => evaluate(MasteryFloor, admitted).checks.Mastery_range,
            "Mastery_range over a MasteryFloor row",
          ),
          true,
        ),
    ) &&
    ceilings.every(
      (row) =>
        !Option.contains(
          brokenIn(
            evaluate.admit(MasteryCeiling, row),
            (admitted) => evaluate(MasteryCeiling, admitted).checks.Mastery_range,
            "Mastery_range over a MasteryCeiling row",
          ),
          true,
        ),
    )
  );
};

/**
 * Name the declaration and mapping overlays' rules over a query that the rows break, each as its
 * own law names it: "AreaMapping base type", "Declaration base type", "Declaration key",
 * "Declaration not reserved", "Lookup table cardinality", "MappableBaseType", "Mapped response",
 * "Mastery range", "Record field key", "Reserved type", "Typed attribute value", "Typed value" and
 * "Value cardinality".
 *
 * @param rows - The rows the import's write stores (`#pantry/test/host-judge.ts`).
 * @returns The laws' names, each once.
 */
export const declarationQueryLawsOf = (rows: PreviewRows<typeof Qti>): readonly LawName[] => {
  const index = indexOf(rows);
  const laws = [
    ["AreaMapping base type", areaHolds],
    ["Declaration base type", declaredTypeHolds],
    ["Declaration key", declarationKeyHolds],
    ["Declaration not reserved", notReservedHolds],
    ["Lookup table cardinality", lookupCardinalityHolds],
    ["MappableBaseType", mappableHolds],
    ["Mapped response", mappedHolds],
    ["Mastery range", masteryHolds],
    ["Record field key", fieldKeyHolds],
    ["Reserved type", reservedHolds],
    ["Typed attribute value", typedAttributeHolds],
    ["Typed value", typedValueHolds],
    ["Value cardinality", cardinalityHolds],
    ["Variable declared", variableDeclaredHolds],
  ] as const;

  return laws.flatMap(([law, holdsIn]) => (holdsIn(index) ? [] : [law]));
};

/**
 * A declaration as the views read it from the import's rows (`#pantry/qti/names.ts`): its node's
 * place, its package and kind, and its name, its cardinality and its base type, each its
 * attribute's, a name its `identifier` collapsed where that names something and a code its lexical
 * form where that spells one, and each none where it has none.
 */
export interface ViewedDeclaration {
  readonly baseType: string | undefined;
  readonly cardinality: string | undefined;
  readonly kind: string;
  readonly name: string | undefined;
  readonly package: string;
  readonly path: string;
  readonly start: bigint;
}

/**
 * Read the import's declarations as the views read them, for a test that resolves a name or reads
 * a declaration's type over the import's rows ({@link ViewedDeclaration}).
 *
 * @param inputs - The import's rows.
 * @returns Every declaration's node, in no order.
 */
export const viewedDeclarationsOf = (inputs: PackageInputs): readonly ViewedDeclaration[] => {
  const lexicals = new Map<string, string>(
    [...inputs.Attribute.values()].map(
      ({ lexical, name, path, start }) => [`${placeKey(path, start)} ${name}`, lexical] as const,
    ),
  );
  const read = (path: string, start: bigint, name: string): string | undefined =>
    lexicals.get(`${placeKey(path, start)} ${name}`);
  const packages = new Map(
    [...inputs.Document.values()].map(({ package: pkg, path }) => [path, pkg] as const),
  );

  return [...nodePlacesOf(inputs).values()].flatMap(({ kind, path, start }) => {
    const pkg = packages.get(path);
    if (pkg === undefined || !declarationKinds.some((declaring) => declaring === kind)) {
      return [];
    }

    const identifier = read(path, start, "identifier");

    return [
      {
        baseType: spelled(read(path, start, "base-type"), baseTypeCodes),
        cardinality: spelled(read(path, start, "cardinality"), cardinalityCodes),
        kind,
        name:
          identifier !== undefined && namingForm.test(identifier)
            ? collapse(identifier)
            : undefined,
        package: pkg,
        path,
        start,
      },
    ];
  });
};
