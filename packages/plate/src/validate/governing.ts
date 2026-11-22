/**
 * The declaration that governs each element of a document, as XML Schema assigns it, by the ASI
 * XSD's tables (`#plate/validate/tables.ts`): what securing reads to keep an attribute only where
 * the element's declaration declares it (`secure` in `#plate/validate/verdict.ts`). It judges
 * nothing: the database is the only judge of a document's validity (pantry's laws), and a document
 * reaches plate only once admission accepted it.
 *
 * An element is governed by the declaration that admits it (reading 84): a global declaration's
 * table at a document's root and wherever a parent's content model refers to it, the table of the
 * type a local declaration names, or the type a valid `xsi:type` names where it derives from the
 * declared one. In wildcard content an element is governed by a global declaration of its name
 * where the wildcard is `lax` or `strict`, and by none where it is `skip`; with no global
 * declaration, a `lax` wildcard leaves it to its `xsi:type`, and an element no declaration governs
 * passes its children over as its own wildcard would. An element of a schema plate holds no tables
 * for (MathML, SSML, XInclude) is never governed.
 *
 * @module
 */
import { Option } from "effect";
import {
  mathmlNamespace,
  qtiNamespace,
  ssmlNamespace,
  walk,
  xincludeNamespace,
  xmlNamespace,
  xmlnsNamespace,
  xsdNamespace,
  xsiNamespace,
} from "#plate/document/source.ts";
import type { SourceAttribute, SourceDocument, SourceElement } from "#plate/document/source.ts";
import { collapseXmlSpace } from "#plate/model/attributes.ts";
import { isNcName } from "@qti-pie/crust/text.ts";
import { manifestNamespace } from "#plate/vocabulary.ts";

/**
 * A name in a namespace: an element's, an attribute's or a named type's.
 */
export interface QualifiedName {
  readonly local: string;
  readonly namespace: string;
}

/**
 * An element wildcard: the namespaces it admits and how it assesses what it admits.
 */
export interface Wildcard {
  readonly namespace: "##any" | "##other" | readonly string[];
  readonly process: "lax" | "skip" | "strict";
}

/**
 * How a child a content model names is declared there: by reference to its global declaration,
 * inline with a simple type, or locally with a named type.
 */
export type ChildDeclaration =
  | { readonly kind: "global" }
  | { readonly kind: "simple" }
  | { readonly kind: "named"; readonly type: QualifiedName };

/**
 * What securing reads of a complex type: the attributes it declares (none prohibited), each child
 * its content model names by `{namespace}local` with how the child is declared, and its element
 * wildcard, absent where it has none.
 */
export interface ContentTable {
  readonly anyElement?: Wildcard;
  readonly attributes: readonly QualifiedName[];
  readonly children: Readonly<Record<string, ChildDeclaration>>;
}

/**
 * A QTI element's table: its type's content table, whether it is declared globally, and the types
 * its declarations name, which an `xsi:type` must derive from.
 */
export interface ElementTable extends ContentTable {
  readonly global: boolean;
  readonly types: readonly QualifiedName[];
}

/**
 * A named type's table: its content table and its derivation, from a base or as a union of
 * members.
 */
export type TypeEntry = ContentTable &
  (
    | { readonly base: QualifiedName; readonly derivation: "extension" | "restriction" }
    | { readonly derivation: "union"; readonly members: readonly QualifiedName[] }
  );

/**
 * The tables: one per element local name the ASI XSD declares in the QTI namespace, and one per
 * named type.
 */
export interface Tables {
  readonly elements: Readonly<Record<string, ElementTable>>;
  readonly types: Readonly<Record<string, TypeEntry>>;
}

/**
 * Write an attribute's name as a mark or a message names it: its local name in no namespace,
 * `xml:` before one in XML's namespace, and its namespace in braces before any other.
 *
 * @param attribute The attribute.
 * @returns Its name.
 */
export const attributeName = (attribute: Pick<SourceAttribute, "local" | "namespace">): string => {
  if (attribute.namespace === "") {
    return attribute.local;
  }

  return attribute.namespace === xmlNamespace
    ? `xml:${attribute.local}`
    : `{${attribute.namespace}}${attribute.local}`;
};

/**
 * Report whether an attribute is one XML Schema allows on every element without a declaration: a
 * namespace declaration, `xsi:schemaLocation` or `xsi:noNamespaceSchemaLocation`.
 *
 * @param attribute The attribute.
 * @returns Whether it is one of them.
 */
export const isAllowance = (attribute: SourceAttribute): boolean =>
  attribute.namespace === xmlnsNamespace ||
  (attribute.namespace === xsiNamespace &&
    (attribute.local === "schemaLocation" || attribute.local === "noNamespaceSchemaLocation"));

/**
 * Report whether an attribute is `xsi:type` or `xsi:nil`, which XML Schema reads on every element
 * it assesses (reading 47).
 *
 * @param attribute The attribute.
 * @returns Whether it is one of the two.
 */
export const isInstanceAttribute = (attribute: SourceAttribute): boolean =>
  attribute.namespace === xsiNamespace && (attribute.local === "type" || attribute.local === "nil");

/**
 * The key a content table names a child by.
 *
 * @param name The child's name.
 * @returns `{namespace}local`.
 */
const childKey = (name: QualifiedName): string => `{${name.namespace}}${name.local}`;

/**
 * The table governing a simple-typed element: no attributes and no children.
 */
const simpleTable: ContentTable = { attributes: [], children: {} };

/**
 * The table of `xs:anyType`, the ur-type: no attributes declared, any element laxly.
 */
const anyTypeTable: ContentTable = {
  anyElement: { namespace: "##any", process: "lax" },
  attributes: [],
  children: {},
};

/**
 * XML Schema's built-in types, each by its base, up to `anyType`: what an `xsi:type` naming one
 * derives from.
 */
const builtinBases: ReadonlyMap<string, string> = new Map([
  ["anySimpleType", "anyType"],
  ["anyURI", "anySimpleType"],
  ["base64Binary", "anySimpleType"],
  ["boolean", "anySimpleType"],
  ["byte", "short"],
  ["date", "anySimpleType"],
  ["dateTime", "anySimpleType"],
  ["decimal", "anySimpleType"],
  ["double", "anySimpleType"],
  ["duration", "anySimpleType"],
  ["ENTITIES", "anySimpleType"],
  ["ENTITY", "NCName"],
  ["float", "anySimpleType"],
  ["gDay", "anySimpleType"],
  ["gMonth", "anySimpleType"],
  ["gMonthDay", "anySimpleType"],
  ["gYear", "anySimpleType"],
  ["gYearMonth", "anySimpleType"],
  ["hexBinary", "anySimpleType"],
  ["ID", "NCName"],
  ["IDREF", "NCName"],
  ["IDREFS", "anySimpleType"],
  ["int", "long"],
  ["integer", "decimal"],
  ["language", "token"],
  ["long", "integer"],
  ["Name", "token"],
  ["NCName", "Name"],
  ["negativeInteger", "nonPositiveInteger"],
  ["NMTOKEN", "token"],
  ["NMTOKENS", "anySimpleType"],
  ["nonNegativeInteger", "integer"],
  ["nonPositiveInteger", "integer"],
  ["normalizedString", "string"],
  ["NOTATION", "anySimpleType"],
  ["positiveInteger", "nonNegativeInteger"],
  ["QName", "anySimpleType"],
  ["short", "int"],
  ["string", "anySimpleType"],
  ["time", "anySimpleType"],
  ["token", "normalizedString"],
  ["unsignedByte", "unsignedShort"],
  ["unsignedInt", "unsignedLong"],
  ["unsignedLong", "nonNegativeInteger"],
  ["unsignedShort", "unsignedInt"],
]);

/**
 * Find a QTI element's table by its local name.
 *
 * @param tables The tables.
 * @param element The element.
 * @returns Its table, none for an element outside the QTI namespace or of a name the XSD does not
 *   declare.
 */
const elementTableOf = (tables: Tables, element: SourceElement): Option.Option<ElementTable> =>
  element.namespace === qtiNamespace && Object.hasOwn(tables.elements, element.local)
    ? Option.fromUndefinedOr(tables.elements[element.local])
    : Option.none();

/**
 * Find a named QTI type's table.
 *
 * @param tables The tables.
 * @param type The type's name.
 * @returns Its table, none for a type outside the QTI namespace or one the XSD does not name.
 */
const typeEntryOf = (tables: Tables, type: QualifiedName): Option.Option<TypeEntry> =>
  type.namespace === qtiNamespace && Object.hasOwn(tables.types, type.local)
    ? Option.fromUndefinedOr(tables.types[type.local])
    : Option.none();

/**
 * Give a type's base: a built-in's from {@link builtinBases}, a QTI type's from its table, a
 * union's `anySimpleType`.
 *
 * @param type The type.
 * @param tables The tables.
 * @returns Its base, none for `anyType` or a type no table names.
 */
const baseOf = (type: QualifiedName, tables: Tables): Option.Option<QualifiedName> => {
  if (type.namespace === xsdNamespace) {
    const base = builtinBases.get(type.local);

    return base === undefined
      ? Option.none()
      : Option.some({ local: base, namespace: xsdNamespace });
  }

  return Option.map(typeEntryOf(tables, type), (entry) =>
    entry.derivation === "union" ? { local: "anySimpleType", namespace: xsdNamespace } : entry.base,
  );
};

/**
 * Report whether a type is one of the declared types or derives from one, through its bases.
 *
 * @param type The type an `xsi:type` names.
 * @param declared The types the element's declaration names.
 * @param tables The tables.
 * @returns Whether it derives from one.
 */
const derivesFrom = (
  type: QualifiedName,
  declared: readonly QualifiedName[],
  tables: Tables,
): boolean => {
  const seen = new Set<string>();
  for (
    let current = Option.some(type);
    Option.isSome(current);
    current = baseOf(current.value, tables)
  ) {
    const { local, namespace } = current.value;
    const key = `{${namespace}}${local}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    if (declared.some((name) => name.namespace === namespace && name.local === local)) {
      return true;
    }
  }

  return false;
};

/**
 * Find the namespace a prefix is bound to at an element, by the declarations in scope.
 *
 * @param prefix The prefix, `""` for the default namespace.
 * @param element The element.
 * @param parents Each element's parent.
 * @returns The namespace, `""` for an unbound default; none for a prefix nothing binds.
 */
const boundNamespace = (
  prefix: string,
  element: SourceElement,
  parents: ReadonlyMap<SourceElement, SourceElement>,
): Option.Option<string> => {
  if (prefix === "xml") {
    return Option.some(xmlNamespace);
  }

  if (prefix === "xmlns") {
    return Option.some(xmlnsNamespace);
  }

  const local = prefix === "" ? "xmlns" : prefix;
  for (
    let current: SourceElement | undefined = element;
    current !== undefined;
    current = parents.get(current)
  ) {
    const declaration = current.attributes.find(
      (attribute) => attribute.namespace === xmlnsNamespace && attribute.local === local,
    );
    if (declaration !== undefined) {
      return prefix === "" || declaration.value !== ""
        ? Option.some(declaration.value)
        : Option.none();
    }
  }

  return prefix === "" ? Option.some("") : Option.none();
};

/**
 * Resolve an `xsi:type` value, a QName, to the type it names.
 *
 * @param value The value as written.
 * @param element The element that writes it.
 * @param parents Each element's parent.
 * @returns The type's name, none for a value that is no QName or whose prefix nothing binds.
 */
const resolveQName = (
  value: string,
  element: SourceElement,
  parents: ReadonlyMap<SourceElement, SourceElement>,
): Option.Option<QualifiedName> => {
  const lexical = collapseXmlSpace(value);
  const colon = lexical.indexOf(":");
  const prefix = colon === -1 ? "" : lexical.slice(0, colon);
  const local = lexical.slice(colon + 1);
  if ((colon !== -1 && !isNcName(prefix)) || !isNcName(local)) {
    return Option.none();
  }

  return Option.map(boundNamespace(prefix, element, parents), (namespace) => ({
    local,
    namespace,
  }));
};

/**
 * The QTI elements whose element wildcard admits QTI's own namespace too (`qti-ordering`'s), where
 * the XSD writes `##other`.
 */
const ownNamespaceSlots: ReadonlySet<string> = new Set(["qti-ordering"]);

/**
 * Give the element wildcard of an element's table, widened to every namespace for an element of
 * {@link ownNamespaceSlots}.
 *
 * @param element The element.
 * @param table Its governing table.
 * @returns The wildcard, none where the table has none.
 */
const elementWildcardOf = (element: SourceElement, table: ContentTable): Option.Option<Wildcard> =>
  Option.map(Option.fromUndefinedOr(table.anyElement), (wildcard) =>
    element.namespace === qtiNamespace && ownNamespaceSlots.has(element.local)
      ? { ...wildcard, namespace: "##any" }
      : wildcard,
  );

/**
 * Report whether a wildcard admits an element of a namespace.
 *
 * @param wildcard The wildcard.
 * @param namespace The element's namespace.
 * @returns Whether it admits it.
 */
const wildcardAdmits = (wildcard: Wildcard, namespace: string): boolean => {
  if (wildcard.namespace === "##any") {
    return true;
  }

  if (wildcard.namespace === "##other") {
    return namespace !== "" && namespace !== qtiNamespace;
  }

  return wildcard.namespace.includes(namespace);
};

/**
 * The QTI roots reading 6 keeps as foreign content where wildcard content holds one.
 */
const nestedRoots: ReadonlySet<string> = new Set([
  "qti-assessment-item",
  "qti-assessment-section",
  "qti-assessment-stimulus",
  "qti-assessment-test",
  "qti-outcome-processing",
  "qti-response-processing",
]);

/**
 * Report whether an element is a root reading 6 keeps as foreign content when wildcard content
 * holds one: one of {@link nestedRoots}, or a content package's `manifest`.
 *
 * @param element The element.
 * @returns Whether it is kept foreign there.
 */
const isForeignRoot = (element: SourceElement): boolean =>
  element.namespace === qtiNamespace
    ? nestedRoots.has(element.local)
    : element.namespace === manifestNamespace && element.local === "manifest";

/**
 * The namespaces the ASI XSD imports whose tables plate does not hold: MathML 3, SSML 1.1 and
 * XInclude (reading 81). An element of one under a `strict` wildcard is not governed.
 */
const untabledNamespaces: ReadonlySet<string> = new Set([
  mathmlNamespace,
  ssmlNamespace,
  xincludeNamespace,
]);

/**
 * How the walk takes an element: governed by a table, its children passed over laxly, or not
 * governed and its children passed over with it.
 */
type Admission =
  | {
      readonly kind: "governed";
      readonly table: ContentTable;
      readonly types: readonly QualifiedName[];
    }
  | { readonly kind: "lax" }
  | { readonly kind: "none" };

/**
 * The element is not governed, and nor are its children.
 */
const none: Admission = { kind: "none" };

/**
 * Report whether a type is simple: a built-in or a QTI type that restricts one, or a union.
 *
 * @param type The type.
 * @param tables The tables.
 * @returns Whether it is simple.
 */
const isSimpleType = (type: QualifiedName, tables: Tables): boolean => {
  const seen = new Set<string>();
  let current = type;
  while (current.namespace !== xsdNamespace) {
    const key = `{${current.namespace}}${current.local}`;
    const entry = Option.getOrUndefined(typeEntryOf(tables, current));
    if (entry === undefined || entry.derivation === "extension" || seen.has(key)) {
      return false;
    }

    if (entry.derivation === "union") {
      return true;
    }

    seen.add(key);
    current = entry.base;
  }

  return builtinBases.has(current.local);
};

/**
 * Report whether an attribute is `xsi:type`.
 *
 * @param attribute The attribute.
 * @returns Whether it is.
 */
const isInstanceType = (attribute: SourceAttribute): boolean =>
  attribute.namespace === xsiNamespace && attribute.local === "type";

/**
 * Take an element no declaration governs by its `xsi:type`: the ur-type, an unresolved type or none
 * passes its children over laxly; a simple or complex type governs nothing plate reads.
 *
 * @param element The element.
 * @param parents Each element's parent.
 * @param tables The tables.
 * @returns How the walk takes it.
 */
const byInstanceType = (
  element: SourceElement,
  parents: ReadonlyMap<SourceElement, SourceElement>,
  tables: Tables,
): Admission => {
  const written = element.attributes.find(isInstanceType);
  if (written === undefined) {
    return { kind: "lax" };
  }

  if (written.references.length > 0) {
    return none;
  }

  return Option.match(resolveQName(written.value, element, parents), {
    onNone: (): Admission => ({ kind: "lax" }),
    onSome: (type): Admission => {
      if (type.namespace === xsdNamespace && type.local === "anyType") {
        return { kind: "lax" };
      }

      return isSimpleType(type, tables) || Option.isSome(typeEntryOf(tables, type))
        ? none
        : { kind: "lax" };
    },
  });
};

/**
 * Govern an element by its global declaration.
 *
 * @param table The declaration's table.
 * @returns The admission.
 */
const globally = (table: ElementTable): Admission => ({
  kind: "governed",
  table,
  types: table.types,
});

/**
 * Take an element a `lax` wildcard admits: by its global declaration, else by its `xsi:type`.
 *
 * @param element The element.
 * @param parents Each element's parent.
 * @param tables The tables.
 * @returns How the walk takes it.
 */
const laxly = (
  element: SourceElement,
  parents: ReadonlyMap<SourceElement, SourceElement>,
  tables: Tables,
): Admission => {
  if (isForeignRoot(element)) {
    return none;
  }

  return Option.match(
    Option.filter(elementTableOf(tables, element), (table) => table.global),
    {
      onNone: () => byInstanceType(element, parents, tables),
      onSome: globally,
    },
  );
};

/**
 * Take an element a `strict` wildcard admits: by its global declaration, else as the ur-type its
 * `xsi:type` names.
 *
 * @param element The element.
 * @param parents Each element's parent.
 * @param tables The tables.
 * @returns How the walk takes it.
 */
const strictly = (
  element: SourceElement,
  parents: ReadonlyMap<SourceElement, SourceElement>,
  tables: Tables,
): Admission => {
  const table = Option.filter(elementTableOf(tables, element), (declared) => declared.global);
  if (Option.isSome(table)) {
    return isForeignRoot(element) ? none : globally(table.value);
  }

  if (untabledNamespaces.has(element.namespace)) {
    return none;
  }

  const written = element.attributes.find(isInstanceType);
  const urType =
    written !== undefined &&
    written.references.length === 0 &&
    Option.exists(
      resolveQName(written.value, element, parents),
      (type) => type.namespace === xsdNamespace && type.local === "anyType",
    );

  return urType ? { kind: "lax" } : none;
};

/**
 * Take a QTI child its parent's content model names: by its global declaration, as a simple type,
 * or by the named type its local declaration names.
 *
 * @param element The child.
 * @param declaration How the content model declares it.
 * @param tables The tables.
 * @returns How the walk takes it.
 */
const declaredChild = (
  element: SourceElement,
  declaration: ChildDeclaration,
  tables: Tables,
): Admission => {
  switch (declaration.kind) {
    case "global": {
      return Option.match(elementTableOf(tables, element), {
        onNone: () => none,
        onSome: globally,
      });
    }
    case "simple": {
      return { kind: "governed", table: simpleTable, types: [] };
    }
    case "named": {
      const { type } = declaration;
      if (type.namespace === xsdNamespace) {
        return {
          kind: "governed",
          table: type.local === "anyType" ? anyTypeTable : simpleTable,
          types: [type],
        };
      }

      return Option.match(typeEntryOf(tables, type), {
        onNone: () => none,
        onSome: (entry): Admission => ({ kind: "governed", table: entry, types: [type] }),
      });
    }
    default: {
      return declaration satisfies never;
    }
  }
};

/**
 * Take an element under a parent the walk governs: as a child its content model names, else as
 * its element wildcard admits it.
 *
 * @param element The element.
 * @param parent Its parent.
 * @param table The parent's governing table.
 * @param parents Each element's parent.
 * @param tables The tables.
 * @returns How the walk takes it.
 */
const underGoverned = (
  element: SourceElement,
  parent: SourceElement,
  table: ContentTable,
  parents: ReadonlyMap<SourceElement, SourceElement>,
  tables: Tables,
): Admission => {
  const key = childKey(element);
  if (Object.hasOwn(table.children, key)) {
    const declaration = table.children[key];

    return element.namespace === qtiNamespace && declaration !== undefined
      ? declaredChild(element, declaration, tables)
      : none;
  }

  return Option.match(
    Option.filter(elementWildcardOf(parent, table), (wildcard) =>
      wildcardAdmits(wildcard, element.namespace),
    ),
    {
      onNone: () => none,
      onSome: (wildcard): Admission => {
        switch (wildcard.process) {
          case "lax": {
            return laxly(element, parents, tables);
          }
          case "strict": {
            return strictly(element, parents, tables);
          }
          case "skip": {
            return none;
          }
          default: {
            return wildcard.process satisfies never;
          }
        }
      },
    },
  );
};

/**
 * Give the table of the type a valid `xsi:type` names, where that type derives from one the
 * element's declaration names.
 *
 * @param element The element.
 * @param types The types its declaration names.
 * @param parents Each element's parent.
 * @param tables The tables.
 * @returns The named type's table, none where the element writes no such `xsi:type`.
 */
const namedType = (
  element: SourceElement,
  types: readonly QualifiedName[],
  parents: ReadonlyMap<SourceElement, SourceElement>,
  tables: Tables,
): Option.Option<ContentTable> => {
  const written = element.attributes.find(isInstanceType);
  if (written === undefined || written.references.length > 0) {
    return Option.none();
  }

  return Option.flatMap(resolveQName(written.value, element, parents), (type) =>
    derivesFrom(type, types, tables) ? typeEntryOf(tables, type) : Option.none(),
  );
};

/**
 * Give each element of a document the table that governs it (reading 84): the table of the
 * declaration that admits it, a global declaration's or the type a local one names, or, after a
 * valid `xsi:type` naming a type of the tables, that type's own table. An element no declaration
 * governs has no entry.
 *
 * @param source The document, as the reader adapter built it.
 * @param tables The ASI XSD's tables.
 * @returns The table that governs each governed element, keyed by the element.
 */
export const governingTables = (
  source: SourceDocument,
  tables: Tables,
): ReadonlyMap<SourceElement, ContentTable> => {
  const parents = new Map<SourceElement, SourceElement>();
  const governing = new Map<SourceElement, ContentTable>();
  const laxed = new Set<SourceElement>();
  for (const { element, parent } of walk(source)) {
    const admission = Option.match(parent, {
      onNone: (): Admission =>
        Option.match(
          Option.filter(elementTableOf(tables, element), (table) => table.global),
          { onNone: () => none, onSome: globally },
        ),
      onSome: (container): Admission => {
        parents.set(element, container);

        const table = governing.get(container);
        if (table !== undefined) {
          return underGoverned(element, container, table, parents, tables);
        }

        return laxed.has(container) ? laxly(element, parents, tables) : none;
      },
    });
    if (admission.kind === "lax") {
      laxed.add(element);
    } else if (admission.kind === "governed") {
      governing.set(
        element,
        Option.getOrElse(
          namedType(element, admission.types, parents, tables),
          () => admission.table,
        ),
      );
    }
  }

  return governing;
};
