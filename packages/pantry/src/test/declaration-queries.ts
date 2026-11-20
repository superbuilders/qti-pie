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
  reservedBaseTypes,
  valueSetKinds,
} from "#pantry/qti/declarations.ts";
import { BaseTypePattern, unjudgedBaseTypes } from "#pantry/qti/expression-types.ts";
import { builtInResponses, silentBases } from "#pantry/qti/expressions.ts";
import type { LawName } from "#pantry/import/refusal.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { exactValuePattern, lookupEntryKinds, lookupTableKinds } from "#pantry/qti/mapping.ts";
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
 * A text with no whitespace before or after it, as the host reads `exactValuePattern`.
 */
const exactValue = new RegExp(exactValuePattern.source, "u");

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
 * State "E1 derived" over a query: a normal minimum not written is the XSD's default, and a
 * reference's table claim names a table its declaration's node holds.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const derivedHolds = (index: Index): boolean =>
  index
    .all("NormalMinimum")
    .every(
      (minimum) => minimum["written"] === true || minimum["lexical"] === normalMinimumDefault,
    ) &&
  index.all("VariableRefTable").every((claim) => {
    const claimed = JSON.stringify([
      placeOf(claim),
      textOfField("VariableRefTable", "attribute", claim["attribute"]),
    ]);
    const reference = index
      .all("VariableRef")
      .find(
        (held) =>
          JSON.stringify([
            placeOf(held),
            textOfField("VariableRef", "attribute", held["attribute"]),
          ]) === claimed,
      );
    const declaration =
      reference === undefined
        ? undefined
        : resolvedIn(
            index,
            documentKeyOf(claim["package"], claim["path"]),
            textOfField("VariableRef", "identifier", reference["identifier"]),
          );

    return (
      declaration === undefined ||
      index.holdsChild([claim["package"], claim["path"], declaration, claim["table"]])
    );
  });

/**
 * The built-in response variables, by `root variable`: none declares a mapping or an area mapping
 * (decision 431, spec reading 166).
 */
const builtInResponseNames: ReadonlySet<string> = new Set(
  builtInResponses.map(({ root, variable }) => `${root} ${variable}`),
);

/**
 * State "Mapped response" over a query: a map response or map response point by `identifier`
 * names no built-in response, and a declared one claims its table (`VariableRefTable`) and names a
 * response declaration, a map response point's of base type point or one its typing leaves silent;
 * and a placed one's table is one its declaration's node holds.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const mappedHolds = (index: Index): boolean =>
  index.all("VariableRef").every((reference) => {
    // A reference's element's kind is its node's, as the view `VariableRefNode` reads it.
    const referrer = textOfField("Node", "kind", index.kindAt(placeOf(reference)));
    const declaration =
      reference["resolution"] === "declared"
        ? resolvedIn(
            index,
            documentKeyOf(reference["package"], reference["path"]),
            textOfField("VariableRef", "identifier", reference["identifier"]),
          )
        : undefined;
    const kind =
      declaration === undefined
        ? undefined
        : declarationKindAt(
            index,
            placeKeyOf([reference["package"], reference["path"], declaration]),
          );

    return (
      !mappedTables.has(referrer) ||
      reference["attribute"] !== "identifier" ||
      (reference["resolution"] === "builtIn"
        ? !builtInResponseNames.has(
            `${textOfField("VariableRef", "rootKind", reference["rootKind"])} ${textOfField("VariableRef", "identifier", reference["identifier"])}`,
          )
        : declaration === undefined) ||
      (index.at("VariableRefTable").has(placeOf(reference)) &&
        kind === "qti-response-declaration" &&
        (referrer !== "qti-map-response-point" ||
          ["point", ...silentBases].some((base) => base === reference["baseType"])))
    );
  }) &&
  index.all("PlacedVariableRef").every((placed) => {
    const table = mappedTables.get(textOfField("Node", "kind", index.kindAt(placeOf(placed))));
    const declaration =
      placed["resolution"] === "declared"
        ? resolvedIn(
            index,
            documentKeyOf(placed["package"], placed["assembly"]),
            textOfField("PlacedVariableRef", "identifier", placed["identifier"]),
          )
        : undefined;

    return (
      table === undefined ||
      placed["attribute"] !== "identifier" ||
      declaration === undefined ||
      index.holdsChild([placed["package"], placed["assembly"], declaration, table])
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
 * State "Variable declared" over a query: an item's unresolved reference, its own or one placed in
 * its assembly, is braced by its element's kind and its attribute, a string value (reading R15-k);
 * the kind is its node's, as the views `VariableRefNode` and `PlacedVariableRefNode` read it.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const variableDeclaredHolds = (index: Index): boolean =>
  (["VariableRef", "PlacedVariableRef"] as const).every((relation) =>
    index
      .all(relation)
      .every(
        (reference) =>
          reference["rootKind"] !== itemKind ||
          reference["resolution"] !== "unresolved" ||
          bracedReferences.has(
            `${textOfField("Node", "kind", index.kindAt(placeOf(reference)))} ${textOfField(relation, "attribute", reference["attribute"])}`,
          ),
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
 * `Typed_attribute_value` reads it: it matches the base type's `BaseTypePattern`, written with no
 * whitespace around it unless the base type is `string`.
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
    new RegExp(pattern, "u").test(written) &&
    (baseType === "string" || exactValue.test(written))
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
 * State "Value cardinality" over a query: a single variable's value set holds one value, every
 * value of a record's set is a field, and every field stands in a record's set, where its set's
 * declaration has a cardinality.
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
      index.attributeAt(placeOf(value), "field-identifier") !== undefined,
  ) &&
  valueNodes(index)
    .filter((value) => index.attributeAt(placeOf(value), "field-identifier") !== undefined)
    .every((field) => {
      const cardinality = cardinalityAt(index, setDeclarationOf(index, field));

      return cardinality === undefined || cardinality === "record";
    });

/**
 * State "Record field key" over a query: a set's named fields, each whose `field-identifier` names
 * something once collapsed, are distinct by name.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const fieldKeyHolds = (index: Index): boolean => {
  const names = valueNodes(index).flatMap((field) => {
    const name = nameAt(index, placeOf(field), "field-identifier");

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
 * State "Reserved type" over a query: a typed outcome name has its specified base type where it has
 * one and is no record where it has a cardinality, and QTI_CONTEXT is a context declaration and,
 * where it has a cardinality, a record (reading 153), each name beside its declaration's kind,
 * cardinality and base type.
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const reservedHolds = (index: Index): boolean =>
  declaredNamesOf(index).every(({ name, node }) => {
    const place = placeOf(node);
    const kind = declarationKindAt(index, place);
    const baseType = baseTypeAt(index, place);
    const cardinality = cardinalityAt(index, place);
    const typed = reservedBaseTypes.every(
      (reserved) =>
        kind !== reserved.kind ||
        name !== reserved.identifier ||
        ((baseType === undefined || baseType === reserved.baseType) && cardinality !== "record"),
    );
    const context =
      name !== contextVariable.identifier ||
      (kind === contextVariable.kind &&
        (cardinality === undefined || cardinality === contextVariable.cardinality));

    return typed && context;
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
 * State "Mastery range" over a query: each pair of an outcome's scale, its normal minimum's and its
 * mastery value's (`MasteryFloor`) and its mastery value's and its normal maximum's
 * (`MasteryCeiling`), each the join of its two stored ends at the declaration's place, holds
 * `Mastery_range`'s check as grizzle's evaluator judges it (`#pantry/test/row-evaluation.ts`
 * `brokenIn`).
 *
 * @param index - The index.
 * @returns Whether it holds.
 */
const masteryHolds = (index: Index): boolean => {
  const evaluate = evaluatorFor(Qti);
  const { MasteryValue, NormalMaximum, NormalMinimum } = index.rows;
  const masteries = new Map(
    MasteryValue.map((mastery) => [placeOf(mastery), mastery.lexical] as const),
  );
  const floors = NormalMinimum.flatMap(({ lexical, package: pkg, path, start }) => {
    const masteryValue = masteries.get(placeKeyOf([pkg, path, start]));

    return masteryValue === undefined
      ? []
      : [{ masteryValue, normalMinimum: lexical, package: pkg, path, start }];
  });
  const ceilings = NormalMaximum.flatMap(({ lexical, package: pkg, path, start }) => {
    const masteryValue = masteries.get(placeKeyOf([pkg, path, start]));

    return masteryValue === undefined
      ? []
      : [{ masteryValue, normalMaximum: lexical, package: pkg, path, start }];
  });

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
 * "Declaration not reserved", "E1 derived", "Lookup table cardinality", "MappableBaseType",
 * "Mapped response", "Mastery range", "Record field key", "Reserved type", "Typed attribute value",
 * "Typed value" and "Value cardinality".
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
    ["E1 derived", derivedHolds],
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
