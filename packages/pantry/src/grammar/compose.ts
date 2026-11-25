/**
 * The composition of vocabularies: one vocabulary list, and every generator of `src/grammar/` run
 * over it, giving one {@link Grammar} (plan Q3.03, R4 of the W1 to W4 review).
 *
 * {@link compose} is a function of the list. Each vocabulary is one shape (its namespace, its kinds
 * with their local names, the attribute names it introduces, its content models and attribute
 * declarations, and the triples it states beside them) with its grammar facets (`facets.ts`), so a
 * toy vocabulary list composes through the same path as the production one, and a vocabulary
 * appended to the list appends its codes. Production's list is {@link vocabularies}: character
 * data, then the eleven vocabularies the pinned XSDs declare, one per namespace, in
 * `src/vocab/inventory/vocabularies.ts`'s order, then the open vocabulary and the document layer.
 *
 * Beside the vocabularies' own rows the composition states the rows no one vocabulary can:
 *
 * - A name resolves by locality, read off admission: to the element kind its parent admits with that
 *   name, a local declaration or a global one a wildcard finds, else to none;
 * - The document node admits its root element kinds, the doctype, comments, instructions and
 *   whitespace;
 * - A kind whose element wildcard reads globally declared elements as their kinds admits each of them
 *   in the wildcard's namespaces that a schema set of the kind's documents declares (spec reading
 *   81, `open.wildcardReads`), but the roots spec reading 6 keeps foreign, since that needs every
 *   vocabulary's registry;
 * - XML Schema's `xsi:` attributes are admitted on every element kind (spec reading 47), `xsi:nil`
 *   only on the foreign kinds, since no pinned element is nillable (audit A6); and the four `xml:`
 *   names on every kind that holds an attribute wildcard and on the foreign kinds, wherever the
 *   kind does not declare them itself, all as closed names (fin.md, D2's refinement). An `xml:`
 *   name has `xml.xsd`'s type where the wildcard validates it, and is free text under MathML's
 *   `skip` wildcard;
 * - The open classes (`data-*`, `foreign`, `no-namespace`, `own-namespace`) are admitted, as free
 *   text, on every kind whose attribute wildcard's namespace classes let them through, and all but
 *   `data-*` on the foreign kinds (fin.md, D2). On a kind the Schematron's extension rules cover,
 *   only `data-*` is, and no `xml:` name the kind does not declare (spec reading 90, `coveredBy`),
 *   but on `qti-custom-interaction`, whose `extension` characteristic is a `NamespaceLax`
 *   (information model §5.36.1), which admits `foreign` and the `xml:` names as well.
 *
 * A triple two sources state is one fact: grizzle keeps a row of its family's admission map's
 * `AdmissionIn` rows written twice as one row.
 */
import { Option, Result } from "effect";
import type { Admission, AdmittedChild } from "#pantry/grammar/admission.ts";
import { generate as generateAncestry } from "#pantry/grammar/ancestry.ts";
import type { AncestrySets } from "#pantry/grammar/ancestry.ts";
import {
  baseTypes,
  generate as generateAttributes,
  readDeclarations,
} from "#pantry/grammar/attributes.ts";
import type {
  AttributeGrammar,
  AttributeGrammarError,
  Declared,
  GovernedDeclared,
  Governor,
} from "#pantry/grammar/attributes.ts";
import { barredByOf } from "#pantry/grammar/children.ts";
import type { BarredBy, ChildError, LastWhere } from "#pantry/grammar/children.ts";
import { roster, rowsAt, tupleKey } from "#pantry/grammar/closed.ts";
import type { NonEmptyRoster, Roster } from "#pantry/grammar/closed.ts";
import {
  bindingFit,
  mappableBaseType,
  mathOperators,
  operatorArity,
  operatorMax,
  recordBindingFit,
} from "#pantry/grammar/expression.ts";
import type {
  BindingFit,
  MappableBaseType,
  MathOperators,
  OperatorArity,
  OperatorMax,
  RecordBindingFit,
} from "#pantry/grammar/expression.ts";
import * as facets from "#pantry/grammar/facets.ts";
import type { Facets } from "#pantry/grammar/facets.ts";
import { foreignKinds, isForeignKind } from "#pantry/grammar/kinds.ts";
import { generate as generateKinds, resolution } from "#pantry/grammar/rosters.ts";
import type {
  KindOf,
  Kinds,
  NameOf,
  Vocabulary as KindsVocabulary,
} from "#pantry/grammar/rosters.ts";
import { characterKinds, contentOf } from "#pantry/grammar/content.ts";
import type { ContentError, ContentGrammar } from "#pantry/grammar/content.ts";
import { includeAlternativesOf, includeGrammar } from "#pantry/grammar/include.ts";
import type { IncludeGrammar } from "#pantry/grammar/include.ts";
import { heldRootsUnder, namesUnder, typesAvailable } from "#pantry/grammar/names.ts";
import type { HeldRootsUnder, NamesUnder, TypesAvailable } from "#pantry/grammar/names.ts";
import { packageGrammar } from "#pantry/grammar/package.ts";
import { references } from "#pantry/grammar/references.ts";
import { expandedNameOf, xsiTypesOf } from "#pantry/grammar/xsi.ts";
import type { XsiTypeError, XsiTypes } from "#pantry/grammar/xsi.ts";
import type { References } from "#pantry/grammar/references.ts";
import type { PackageGrammar } from "#pantry/grammar/package.ts";
import {
  attributeDeclarations,
  attributeWildcards,
  textTypes,
  typeAttributeDeclarations,
  typeAttributeWildcards,
  typeTexts,
} from "#pantry/vocab/inventory/attributes.ts";
import { contentModels, typeDerivations } from "#pantry/vocab/inventory/models.ts";
import { coveredElements } from "#pantry/vocab/inventory/extensions.ts";
import { globalKinds, vocabularies as rosters } from "#pantry/vocab/inventory/vocabularies.ts";
import type {
  AttributeWildcard,
  ContentModel,
  Domain,
  Source,
  TypeText,
} from "#pantry/vocab/inventory/types.ts";
import {
  inNamespaceOf,
  nameless,
  namespaceClassOf,
  namespaceNameOf,
  spelledNamespace,
  xsNamespace,
} from "#pantry/vocab/namespaces.ts";
import type { NamespaceName, NamespaceOfKind } from "#pantry/vocab/namespaces.ts";
import * as open from "#pantry/vocab/open.ts";

/**
 * A vocabulary as the composition reads it: its namespace, kinds and attribute names; the content
 * models of its kinds, from which its admitted triples and content automata are projected; the
 * triples it states beside them, for kinds no model declares (a toy's kinds); the attribute
 * declarations it reads its attributes' types from; and its grammar facets. A vocabulary with none
 * of a part states it empty.
 */
export type Vocabulary = KindsVocabulary & VocabularyParts;

/**
 * The parts of a {@link Vocabulary} beside the ones the kinds generator reads.
 */
interface VocabularyParts {
  readonly admission: readonly (AdmittedChild & { readonly source: Source })[];
  readonly declarations: readonly Declared[];
  readonly facets: Facets;
  readonly models: readonly ContentModel[];
}

/**
 * The cardinalities of a typed variable, in code order: the `TypedCardinality` roster's handles.
 * A record has no base type, so `BindingFit` is keyed by these three, and `RecordBindingFit` holds
 * the record's interactions.
 */
export const typedCardinalities = ["single", "multiple", "ordered"] as const;

/**
 * The cardinality of a record variable, whose fields carry their own base types and which has none.
 */
export const recordCardinality = "record";

/**
 * Pair a vocabulary the pinned XSDs declare with its content models, its attribute declarations and
 * its facets: the leaves' rows of its kinds, the declarations as the spec readings that add or
 * remove an attribute read them (`readDeclarations`: readings 10 and 85).
 *
 * @param declared - The vocabulary's roster.
 * @returns The vocabulary as the composition reads it.
 */
const vocabulary = <const R extends (typeof rosters)[number]>(
  declared: R,
): Vocabulary & { readonly attributes: R["attributes"]; readonly kinds: R["kinds"] } => {
  const held = new Set<string>(declared.kinds.map(({ handle }) => handle));

  return {
    admission: [],
    attributes: declared.attributes,
    declarations: readDeclarations(attributeDeclarations.filter(({ kind }) => held.has(kind))),
    facets: facets.vocabularyFacets[declared.name],
    kinds: declared.kinds,
    models: contentModels.filter(({ kind }) => held.has(kind)),
    namespace: namespaceNameOf(declared.namespace),
  };
};

/**
 * A layer of the composition that no XSD declares: kinds that name no element, or none, so it is
 * nameless, the attribute names it holds, and the facets that state what no XSD does.
 *
 * @param kinds - The layer's kinds, none of them an element.
 * @param stated - Its facets.
 * @param attributes - The attribute names it holds, empty for a layer of kinds alone.
 * @returns The layer as the composition reads it.
 */
const layer = <const K extends readonly string[], const A extends readonly string[]>(
  kinds: K,
  stated: Facets,
  attributes: A,
): Vocabulary & {
  readonly attributes: A;
  readonly kinds: readonly { readonly handle: K[number]; readonly local: "" }[];
} => ({
  admission: [],
  attributes,
  declarations: [],
  facets: stated,
  kinds: kinds.map((handle) => ({ handle, local: "" as const })),
  models: [],
  namespace: nameless,
});

/**
 * The global attribute names every `AttributeName` roster holds through the document layer, as the
 * leaf's `globalAttributes` spells them: `xml.xsd`'s four, XML Schema's four instance attributes
 * and XLink's ten. The roster takes them from the leaf at run time (`generateKinds`'s `layer`); the
 * document layer lists them again so the static {@link Name} is the roster, a vocabulary's
 * `attributes` being the only names it reads. A name the roster already holds keeps its code, so
 * the list moves no code.
 */
export const layerAttributeNames = [
  "xml:lang",
  "xml:space",
  "xml:base",
  "xml:id",
  "xsi:schemaLocation",
  "xsi:type",
  "xsi:nil",
  "xsi:noNamespaceSchemaLocation",
  "xlink:type",
  "xlink:href",
  "xlink:role",
  "xlink:arcrole",
  "xlink:title",
  "xlink:show",
  "xlink:actuate",
  "xlink:label",
  "xlink:from",
  "xlink:to",
] as const;

/**
 * Every vocabulary of production, in composition order: character data, the eleven vocabularies the
 * pinned XSDs declare, the open vocabulary and the document layer. Codes follow this order, so a
 * vocabulary joins at the end.
 */
export const vocabularies = [
  layer(characterKinds, facets.noFacets, []),
  ...rosters.map(vocabulary),
  layer([], facets.openVocabulary, []),
  layer([], facets.documentLayer, layerAttributeNames),
] as const;

/**
 * A `NodeKind` handle of production's composition.
 */
export type Kind = KindOf<typeof vocabularies>;

/**
 * An `AttributeName` handle of production's composition.
 */
export type Name = NameOf<typeof vocabularies>;

/**
 * Key an attribute admission by kind and name.
 *
 * @param row - The admission.
 * @param row.kind - Its kind.
 * @param row.name - Its name.
 * @returns A key no other pair shares ({@link tupleKey}).
 */
const attributeKey = (row: { readonly kind: string; readonly name: string }): string =>
  tupleKey(row.kind, row.name);

/**
 * Read which element kinds spec reading 90 holds to their declared attributes: those whose element
 * the Schematron's extension rules cover (`coveredElements`,
 * from the `RULESET_*_DATAEXTENSIONRULES` patterns the ASI XSD embeds), compared by expanded name,
 * so every kind one element name resolves to is covered alike (`qti-rubric-block` and
 * `qti-rubric-block.test`).
 *
 * The reading is QTI's own rule, not XML Schema's, so it follows the element's name, never the type
 * an `xsi:type` makes it governed by (spec reading 84).
 *
 * @param kinds - The composition's kinds.
 * @returns Whether a kind's element is covered.
 */
export const coveredBy = (
  kinds: Pick<Kinds<string, string>, "elementName">,
): ((kind: string) => boolean) => {
  const covered = new Set(
    coveredElements.map(({ element }) => tupleKey(element.namespace, element.local)),
  );

  return (kind) =>
    Option.exists(kinds.elementName.lookup({ kind }), ({ local, namespace }) =>
      covered.has(tupleKey(namespace, local)),
    );
};

/**
 * Read the namespace an element of a kind is written in, from its `ElementName` row.
 *
 * @param kinds - The composition's kinds.
 * @param kind - The kind.
 * @returns Its namespace, or nameless for a kind with no row, which names no element: the document
 *   node, the doctype, character data and the foreign kinds.
 */
export const namespaceOfKind = (
  kinds: Pick<Kinds<string, string>, "elementName">,
  kind: string,
): NamespaceOfKind =>
  Option.match(kinds.elementName.lookup({ kind }), {
    onNone: () => nameless,
    onSome: ({ namespace }) => namespaceNameOf(namespace),
  });

/**
 * Whether an attribute's type definition is or is derived from `xs:ID`: the leaf's definition of an
 * ID-derived type, `UniqueIdentifierDType` among them, is atomic with the built-in `ID`.
 *
 * @param attribute - The attribute's declaration, or its admission under a wildcard.
 * @returns Whether its type is an ID.
 */
const isIdType = ({ domain }: { readonly domain: Domain }): boolean =>
  domain._tag === "atomic" && domain.builtin === "ID";

/**
 * Whether an element may carry a wild ID: XML Schema 1.0 Part 1, §3.4.4, Element Locally Valid
 * (Complex Type), clause 5.2: "If the wild IDs is non-empty, there must not be any attribute uses
 * among the {attribute uses} whose {attribute declaration}'s {type definition} is or is derived
 * from ID". A wild ID is an attribute a wildcard admits whose declaration's type is an ID: only
 * `xml:id`, which `xml.xsd` types `xs:ID`, under a `lax` or `strict` wildcard (under `skip` it is
 * not assessed, so it has no type). So an element whose uses include an ID-derived one admits no
 * `xml:id` its type does not declare (spec reading 109). Clause 5.1, at most one wild ID, holds by
 * construction: `xml:id` is the only global attribute of an ID type.
 *
 * @param attribute - An attribute a wildcard admits.
 * @param declaresId - Whether the element's own attribute uses include an ID-derived one.
 * @returns Whether the element may carry it.
 */
const admitsWild = (attribute: { readonly domain: Domain }, declaresId: boolean): boolean =>
  !declaresId || !isIdType(attribute);

/**
 * The kinds whose element the Schematron's extension rules cover but whose class the information
 * model gives an `extension` characteristic beside its `dataExtension`: `qti-custom-interaction`,
 * whose `extension` is a `NamespaceLax`, "an extension point to enable any set of characteristics
 * to be entered to support the definition of the custom interaction(s)", Global ("+"), multiplicity
 * [0..unbounded] (information model §5.36.1), bound by the XSD's `extensionNamespaceLax.Attr`, an
 * `##other` `lax` wildcard. Its Schematron list names `extension` as though it were one attribute,
 * which no attribute is: read by its intent (reading 9), the list admits the characteristic's
 * attributes, every name in a namespace other than QTI's, so reading 90 holds such a kind to its
 * declared attributes, its `data-` ones and those (SV-LAW-05).
 */
export const namespaceLaxKinds: ReadonlySet<string> = new Set(["qti-custom-interaction"]);

/**
 * Whether an open attribute is one an `##other` wildcard admits: a name in another namespace, or an
 * `xml:` name, never one in no namespace or in the element's own.
 *
 * @param name - The open attribute's name or class.
 * @returns Whether `##other` admits it.
 */
const inOtherNamespace = (name: string): boolean => name === "foreign" || name.startsWith("xml:");

/**
 * Read the attributes a wildcard admits on an element of a kind, as {@link layerOf} states them.
 *
 * @param kinds - The composition's kinds.
 * @param namespaceOf - Each kind's namespace ({@link namespaceOfKind}).
 * @returns The reader of a wildcard on a kind, given whether its own uses include an ID.
 */
const wildAttributesOf = (
  kinds: Kinds<string, string>,
  namespaceOf: (kind: string) => NamespaceOfKind,
) => {
  const covered = coveredBy(kinds);

  return (
    wildcard: Pick<AttributeWildcard, "namespace" | "processing">,
    kind: string,
    declaresId: boolean,
  ): readonly open.GlobalAttribute[] =>
    open
      .attributesUnder(wildcard, namespaceOf(kind))
      .filter(
        ({ name }) =>
          !covered(kind) ||
          name === "data-*" ||
          (namespaceLaxKinds.has(kind) && inOtherNamespace(name)),
      )
      .filter((attribute) => admitsWild(attribute, declaresId));
};

/**
 * Read the `xsi:` attributes an element of a kind carries, as {@link layerOf} states them.
 *
 * @param kind - The element's kind.
 * @returns The attributes.
 */
const xsiAttributesOn = (kind: string): readonly open.GlobalAttribute[] =>
  open.xsiAttributes.filter(({ name }) => name !== "xsi:nil" || isForeignKind(kind));

/**
 * State the document layer's attributes, each where its kind's vocabulary does not declare it:
 *
 * - The `xsi:` names on every element kind, but `xsi:nil`, which XML Schema admits only on an element
 *   declared nillable: no element of a pinned XSD is, and a foreign element, assessed laxly, may be
 *   (audit A6);
 * - On every kind of an element that holds an attribute wildcard, the `xml:` names, typed as the
 *   wildcard's processing reads them, and the open classes it admits, as free text; but on a kind
 *   whose element the Schematron's extension rules cover ({@link coveredBy}), only `data-*`, where
 *   the wildcard admits it: spec reading 90 makes every attribute such an element does not declare
 *   an extension, and an extension a `data-` name in no namespace, so no other open class and no
 *   `xml:` name the kind does not declare is admitted there; but a kind whose class states an
 *   `extension` characteristic ({@link namespaceLaxKinds}) admits the names in other namespaces
 *   too, `foreign` and the `xml:` names its wildcard reads;
 * - On each foreign kind, the `xml:` names with `xml.xsd`'s types, and the open classes but `data-*`
 *   (`open.foreignAttributes`).
 *
 * But a kind whose declared uses include an ID-derived one admits no wild ID, the `xml:id` its
 * wildcard would validate ({@link admitsWild}, spec reading 109).
 *
 * A foreign element is one a `lax` element wildcard admits with no declaration, and XML Schema
 * assesses it laxly, against `xs:anyType`, whose attribute wildcard is `##any` and `lax`: so its
 * `xml:` names are validated, as a `lax` attribute wildcard's are.
 *
 * @param kinds - The composition's kinds.
 * @param namespaceOf - Each kind's namespace ({@link namespaceOfKind}).
 * @param declared - The keys of the attributes the vocabularies admit ({@link attributeKey}).
 * @param declaresId - The kinds whose declared uses include an ID-derived one.
 * @returns The layer, read as its XSD types the attributes.
 */
const layerOf = (
  kinds: Kinds<string, string>,
  namespaceOf: (kind: string) => NamespaceOfKind,
  declared: ReadonlySet<string>,
  declaresId: ReadonlySet<string>,
): readonly Declared[] => {
  const wild = wildAttributesOf(kinds, namespaceOf);
  const hosts = [
    ...attributeWildcards
      .filter(({ kind }) => kinds.nodeKind.has(kind))
      .flatMap((wildcard) =>
        wild(wildcard, wildcard.kind, declaresId.has(wildcard.kind)).map((attribute) => ({
          attribute,
          kind: wildcard.kind,
        })),
      ),
    ...Object.values(foreignKinds).flatMap((kind) =>
      open.foreignAttributes.map((attribute) => ({ attribute, kind })),
    ),
    ...kinds.isElement.rows.flatMap(({ kind }) =>
      xsiAttributesOn(kind).map((attribute) => ({ attribute, kind })),
    ),
  ];

  return [
    ...new Map(
      hosts
        .values()
        .filter(
          ({ attribute, kind }) => !declared.has(attributeKey({ kind, name: attribute.name })),
        )
        .map(
          ({ attribute, kind }) =>
            [
              attributeKey({ kind, name: attribute.name }),
              {
                domain: attribute.domain,
                kind,
                name: attribute.name,
                type: attribute.type,
                use: "optional",
              } satisfies Declared,
            ] as const,
        ),
    ).values(),
  ];
};

/**
 * Whether a name is in XML Schema's namespace, whose types every schema set holds.
 *
 * @param name - The namespace name.
 * @returns Whether it is {@link xsNamespace}.
 */
const isXsNamespace = (name: NamespaceName): boolean =>
  name._tag === "in" && name.uri === xsNamespace;

/**
 * Read the texts of the named types a composition's elements may be governed by: each leaf row of
 * a type in XML Schema's namespace or one of the composition's vocabularies'. A toy composition
 * reads the built-ins alone, and a nameless layer holds no type.
 *
 * `xs:NOTATION`'s text is among them: its value space is the QNames of the notations the schema
 * declares (XML Schema Part 2, 3.2.19), and no pinned XSD declares one, so its domain is empty, a
 * domain whose pattern is the empty language's (C47): a foreign element whose `xsi:type` names it
 * holds no valid text, since no text matches that pattern.
 *
 * @param namespaces - The namespaces of the composition's vocabularies.
 * @returns The rows.
 */
const governingTextsOf = (namespaces: readonly NamespaceOfKind[]): readonly TypeText[] =>
  typeTexts.filter(({ owner }) =>
    Option.exists(expandedNameOf(owner), ({ namespace }) => {
      const name = namespaceNameOf(namespace);

      return isXsNamespace(name) || namespaces.some((held) => inNamespaceOf(name, held));
    }),
  );

/**
 * Group a leaf's rows keyed by a type by their type.
 *
 * @param rows - The rows, each of a type.
 * @returns Each type's rows, in leaf order.
 */
const byOwner = <R extends { readonly owner: string }>(
  rows: readonly R[],
): ReadonlyMap<string, readonly R[]> => Map.groupBy(rows, ({ owner }) => owner);

/**
 * The governors of a composition and the attributes each admits ({@link governedOf}), as the
 * attribute grammar reads them.
 */
interface GovernedAttributes {
  readonly governed: readonly GovernedDeclared[];
  readonly governors: readonly Governor[];
}

/**
 * State the governors (spec readings 60 and 84) and the attributes each admits.
 *
 * A governor is a (kind, type) where the type may govern an element of the kind in place
 * of its declared type: each `XsiType` row whose type is not the kind's declared one, and, on each
 * foreign kind, every named simple type of the leaf, which governs a foreign element's text. An
 * element under a complex governing type carries that type's attributes as `layerOf` states a
 * kind's: the type's declarations through the kind's own spec readings (`readDeclarations`), the
 * `xml:` names and open classes the type's attribute wildcard admits, but on a kind spec reading 90
 * covers only `data-*`, since that reading follows the element's name, and the `xsi:` names but
 * `xsi:nil`, which no pinned element declaration makes nillable; and no wild ID where the type's
 * declared uses include an ID-derived one ({@link admitsWild}, spec reading 109). An element under
 * a simple type carries the `xsi:` names alone (XML Schema 1.0 Part 1, §3.3.4, Element Locally
 * Valid (Type), clause 3.1.1), `xsi:nil` among them on a foreign element, which no declaration
 * assesses.
 *
 * @param kinds - The composition's kinds.
 * @param namespaceOf - Each kind's namespace ({@link namespaceOfKind}).
 * @param xsi - The `xsi:type` law's relations.
 * @param governingTexts - The texts of the named types the composition's elements may be governed
 *   by ({@link governingTextsOf}).
 * @returns The governors, each once, and every attribute each admits, each name once.
 */
const governedOf = (
  kinds: Kinds<string, string>,
  namespaceOf: (kind: string) => NamespaceOfKind,
  xsi: XsiTypes,
  governingTexts: readonly TypeText[],
): GovernedAttributes => {
  const wild = wildAttributesOf(kinds, namespaceOf);
  const declaredBy = byOwner(typeAttributeDeclarations);
  const wildcardOf = byOwner(typeAttributeWildcards);
  const isComplex = (key: string) => declaredBy.has(key) || wildcardOf.has(key);
  const governors: readonly Governor[] = [
    ...xsi.xsiType.rows.flatMap(({ kind, type }) =>
      Option.contains(xsi.declaredType(kind), type) ? [] : [{ governs: type, kind }],
    ),
    ...governingTexts.flatMap(({ owner }) =>
      isComplex(owner) ? [] : Object.values(foreignKinds).map((kind) => ({ governs: owner, kind })),
    ),
  ];
  const governed = governors.flatMap(({ governs, kind }) => {
    const own = readDeclarations(
      rowsAt(declaredBy, governs).map(({ domain, name, type, use }): Declared => ({
        domain,
        kind,
        name,
        type,
        use,
      })),
    );
    const declaresId = own.some(isIdType);
    const hosts = [
      ...rowsAt(wildcardOf, governs).flatMap((wildcard) => wild(wildcard, kind, declaresId)),
      ...xsiAttributesOn(kind),
    ];
    const stated = new Set(own.map(({ name }) => name));

    return [
      ...own,
      ...new Map(
        hosts
          .values()
          .filter(({ name }) => !stated.has(name))
          .map(
            ({ domain, name, type }) =>
              [name, { domain, kind, name, type, use: "optional" } satisfies Declared] as const,
          ),
      ).values(),
    ].map((row): GovernedDeclared => ({ ...row, governs }));
  });

  return { governed, governors };
};

/**
 * Every closed relation of a composition and the host's views of them.
 *
 * `K` is the composition's `NodeKind` handles and `N` its `AttributeName` handles: every kind field
 * of a relation ranges over `K`, and every attribute-name field over `N`. A generator reads its
 * vocabularies' facets, models and declarations, which spell kinds and names as strings, and the
 * composition states its rows over its own list's kinds and names, as {@link compose} returns them.
 * Nothing in the generators checks a row against its roster. grizzle does, when `install.ts`
 * declares each relation (`closedRows` refuses a closed id outside its roster), so a production row
 * naming a kind its composition lacks fails `install.ts`'s load.
 */
export interface Grammar<K extends string, N extends string> {
  /**
   * `Admission`: the admitted (parent, child) pairs, each with its content position
   * (`ChildGrammar`), sourced to its particle, or its model at position 0, read through the content
   * grammar's admission maps.
   */
  readonly admission: Admission;
  readonly ancestry: AncestrySets<K>;
  readonly attributes: AttributeGrammar<K, N>;
  /**
   * The `BaseType` roster.
   */
  readonly baseTypes: NonEmptyRoster<string>;
  readonly barredBy: BarredBy<K, N>;
  readonly bindingFit: BindingFit<K>;
  readonly content: ContentGrammar<K>;
  /**
   * `HeldRootsUnder`: parent → names, the expanded names of spec reading 6's roots a
   * strictly held family's `strict` wildcards assess against their global declarations (C13).
   */
  readonly heldRootsUnder: HeldRootsUnder<K>;
  /**
   * The kinds an include stands for under each parent whose model holds one (spec reading 114).
   */
  readonly include: IncludeGrammar<K>;
  /**
   * `KindByNameUnder`: parent → names, the expanded names of the element kinds a parent
   * that admits a foreign element admits, which no foreign element under it holds (C8).
   */
  readonly kindByNameUnder: NamesUnder<K>;
  readonly kinds: Kinds<K, N>;
  /**
   * The last-slot rules the vocabularies state, for the law that reads them (`LastWhere`).
   */
  readonly lastWhere: readonly LastWhere<K>[];
  readonly mappableBaseType: MappableBaseType;
  /**
   * Content MathML's operator relations: `MathArity`, `MathHeadOperator` and `HeadQualifier`.
   */
  readonly mathOperators: MathOperators<K>;
  readonly operatorArity: OperatorArity<K>;
  readonly operatorMax: OperatorMax<K>;
  readonly package: PackageGrammar<K>;
  readonly recordBindingFit: RecordBindingFit<K>;
  /**
   * The relations of variable references and their declarations (review R9).
   */
  readonly references: References<K, N>;
  /**
   * `TypeAvailable`: type → namespaces, the vocabulary namespaces under whose elements an
   * `xsi:type` may name the type (C15, C36; spec readings 60 and 81).
   */
  readonly typeAvailable: TypesAvailable;
  /**
   * The `TypedCardinality` roster.
   */
  readonly typedCardinalities: Roster<
    (typeof typedCardinalities)[number],
    typeof typedCardinalities
  >;
  /**
   * The `xsi:type` law's relations: the `TypeName` roster and `XsiType` (spec reading 47).
   */
  readonly xsi: XsiTypes<K>;
}

/**
 * The grammar of production's composition.
 */
export type ComposedGrammar = Grammar<Kind, Name>;

/**
 * The ways a composition has no grammar: a generator's refusal of its rows.
 */
export type ComposeError = AttributeGrammarError | ChildError | ContentError | XsiTypeError;

/**
 * Read a `TypeName` handle's namespace.
 *
 * @param type - The handle.
 * @returns Its namespace.
 * @throws {Error} When the handle spells no expanded name (`expandedNameOf`): `typeHandle` spells
 *   every handle of the roster from one, so this is its defect.
 */
const typeNamespaceOf = (type: string): NamespaceName =>
  Option.match(expandedNameOf(type), {
    onNone: () => {
      throw new Error(
        `The TypeName handle ${type} spells no expanded name, and typeHandle spells each handle from one. Correct typeHandle or expandedNameOf.`,
      );
    },
    onSome: ({ namespace }) => namespaceNameOf(namespace),
  });

/**
 * Run every generator over a vocabulary list.
 *
 * Each call composes anew. Production's list is composed once per process, through
 * {@link composed}. Every composition reads its attributes' domains through the attribute
 * grammar's one cache, so a definition an earlier composition compiled is not compiled again
 * (`#pantry/grammar/attributes.ts`, `readDomain`).
 *
 * @param list - The vocabularies, in composition order.
 * @returns The grammar, or the first generator's refusal.
 */
export const compose = <const V extends readonly Vocabulary[]>(
  list: V,
): Result.Result<Grammar<KindOf<V>, NameOf<V>>, ComposeError> =>
  Result.gen(function* composeGrammar() {
    const stated = list.map((entry) => entry.facets);
    const base = generateKinds({
      interactions: stated.flatMap((facet) => facet.interactions),
      layer: [...open.xsiAttributes, ...open.xmlAttributes, ...open.xlinkAttributes].map(
        ({ name }) => name,
      ),
      vocabularies: list,
    });
    /**
     * Each kind's namespace, read once from its `ElementName` row: the readers below ask it of a
     * kind once per wildcard position and global kind. A kind outside the roster is read the same
     * way, uncached.
     */
    const kindNamespaces: ReadonlyMap<string, NamespaceOfKind> = new Map(
      base.nodeKind.handles.map((kind) => [kind, namespaceOfKind(base, kind)]),
    );
    const namespaceOf = (kind: string): NamespaceOfKind =>
      kindNamespaces.get(kind) ?? namespaceOfKind(base, kind);
    const stating = list.flatMap((entry) => entry.admission);
    const installed = yield* contentOf({
      facets: stated.map((facet) => facet.content),
      foreignRoots: open.foreignRoots,
      globalKinds: (parent) => {
        const reader = namespaceOf(parent);

        return globalKinds.flatMap(({ kind }) =>
          base.nodeKind.has(kind) && open.wildcardReads(reader, namespaceOf(kind)) ? [kind] : [],
        );
      },
      kinds: base.nodeKind,
      models: list.flatMap((entry) => entry.models),
      namespaceOf,
      stated: stating,
    });
    /**
     * A parent admits a kind where its family's admission map holds the kind.
     */
    const { admission } = installed;
    const kinds = resolution(base, (parent, kind) =>
      Option.isSome(admission.lookup({ child: kind, parent })),
    );
    const declarations = list.flatMap((entry) => entry.declarations);
    const declared = new Set(declarations.map((row) => attributeKey(row)));
    const declaresId = new Set(declarations.filter(isIdType).map(({ kind }) => kind));
    const xsi = yield* xsiTypesOf({
      derivations: typeDerivations,
      kinds: kinds.nodeKind,
      models: list.flatMap(({ models, namespace }) =>
        models.map((model) => ({ ...model, namespace })),
      ),
    });
    const governingTexts = governingTextsOf(list.map(({ namespace }) => namespace));
    const attributes = yield* generateAttributes({
      declarations: [...declarations, ...layerOf(kinds, namespaceOf, declared, declaresId)],
      ...governedOf(kinds, namespaceOf, xsi, governingTexts),
      kinds: kinds.nodeKind,
      names: kinds.attributeName,
      texts: textTypes.filter(({ kind }) => kinds.nodeKind.has(kind)),
      typeName: xsi.typeName,
      typeTexts: governingTexts,
    });
    /**
     * The namespaces of the vocabularies that write elements, as the patterns spell them.
     */
    const namespaces = [
      ...new Set(
        list.flatMap(({ namespace }) =>
          namespace._tag === "nameless" ? [] : [spelledNamespace(namespace)],
        ),
      ),
    ];
    const baseTypeRoster = roster("BaseType", baseTypes);
    const cardinalities = roster("TypedCardinality", typedCardinalities);
    const expression = stated.map((facet) => facet.expression);
    const fitRosters = { baseTypes: baseTypeRoster, cardinalities, kinds: kinds.nodeKind };

    return {
      admission,
      ancestry: generateAncestry({
        facets: stated.map((facet) => facet.ancestry),
        interactions: kinds.interaction.rows.map(({ kind }) => kind),
        kinds: kinds.nodeKind,
      }),
      attributes,
      barredBy: yield* barredByOf({
        admission,
        attributes: kinds.attributeName,
        facets: stated.map((facet) => facet.children),
        kinds: kinds.nodeKind,
        positions: installed.content.positions,
      }),
      baseTypes: baseTypeRoster,
      bindingFit: bindingFit({ facets: expression, rosters: fitRosters }),
      content: installed.content,
      heldRootsUnder: heldRootsUnder({
        classOf: (namespace, parent) => foreignKinds[namespaceClassOf(namespace, parent)],
        held: installed.content.strictlyHeld.rows,
        kinds: kinds.nodeKind,
        namespaceOf,
        reads: open.wildcardReads,
        roots: globalKinds.flatMap(({ kind }) =>
          open.foreignRoots.has(kind)
            ? Option.toArray(kinds.elementName.lookup({ kind })).map(({ local, namespace }) => ({
                kind,
                local,
                namespace,
              }))
            : [],
        ),
      }),
      include: includeGrammar({
        alternatives: includeAlternativesOf(list.flatMap((entry) => entry.models)),
        kinds: kinds.nodeKind,
      }),
      kindByNameUnder: namesUnder({
        admissionIn: installed.content.admissionIn,
        families: installed.content.contentModelOf,
        kinds: kinds.nodeKind,
        nameOf: (kind) => kinds.elementName.lookup({ kind }),
      }),
      kinds,
      lastWhere: stated.flatMap((facet) => facet.children.lastWhere),
      mappableBaseType: mappableBaseType(baseTypeRoster),
      mathOperators: mathOperators(kinds.nodeKind),
      operatorArity: operatorArity({ facets: expression, kinds: kinds.nodeKind }),
      operatorMax: operatorMax({ facets: expression, kinds: kinds.nodeKind }),
      package: packageGrammar({
        facets: stated.map((facet) => facet.package),
        kinds: kinds.nodeKind,
      }),
      recordBindingFit: recordBindingFit({ facets: expression, kinds: kinds.nodeKind }),
      references: references({
        facets: stated.map((facet) => facet.references),
        kinds: kinds.nodeKind,
        names: kinds.attributeName,
      }),
      typeAvailable: typesAvailable({
        available: open.typeAvailable,
        everywhere: isXsNamespace,
        namespaceOf: typeNamespaceOf,
        types: xsi.typeName,
        vocabularies: namespaces,
      }),
      typedCardinalities: cardinalities,
      xsi,
    };
  });

/**
 * Production's grammar: {@link vocabularies} composed once, as this module loads, so every reader
 * of it shares the one composition.
 */
const production = compose(vocabularies);

/**
 * Read production's grammar, {@link vocabularies} composed once per process, as this module
 * loaded: every call returns that one result.
 *
 * A composition takes seconds and production's list never changes, so every reader of the grammar
 * shares one: `install.ts` when it loads, and every test, whether or not its file loads
 * `install.ts` too. `compose(vocabularies)` composes it again.
 *
 * @returns The grammar, or the first generator's refusal.
 */
export const composed = (): Result.Result<ComposedGrammar, ComposeError> => production;
