/**
 * The level `QtiViews`, over the stored level `QtiBase` (`#pantry/qti/base.ts`): the one home of
 * the shared views every rule over a query reads, each a join stated once here and matched as a
 * table, never restated. Its name views are the one definition of what a declared name names. A
 * binding, a content reference and a variable reference each name a declaration by its identifier,
 * and resolve to it in their document's declarations, or, placed, in their assembly's item's,
 * whatever the declaration's cardinality spells (spec reading 159). No row holds the resolution,
 * nor any fact of a declaration (decision S3): the name is its `identifier`'s value
 * ({@link declarationIdentifiers}), its kind its element's kind as a `DeclarationKind`, and its
 * cardinality and base type its attributes' codes, {@link DeclarationCardinality} and
 * {@link DeclarationBaseType}, which every law that reads a declaration's type matches.
 *
 * The name views share one join of them, {@link declaredNames}, keyed by the declaration's place,
 * and every rule that resolves a name matches a view by `(package, path, identifier)`, the key
 * "Declaration key" holds, its path the referring document or the assembly that places it
 * (`#pantry/qti/overlay-queries/`, `#pantry/qti/queries.ts`, and the ledger's item variables in
 * `@edullm/qti-database`).
 *
 * Its record-node view, {@link RecordNode}, is the one definition of a node of a record document,
 * a document a package's records are read from, whose type is its `Document`'s alone (decision
 * S3): LOM vCard and LOM vocabulary (`#pantry/qti/lom.ts`) and the record, language and
 * resource-type queries (`#pantry/qti/queries.ts`) match it.
 *
 * Its attribute selections are the one statement of the attributes of a name on some kinds as a
 * rule over a query reads them, {@link attributeValues}: each by its element's place, with its kind
 * and its `value`, which no overlay copies (C18). A coded enumeration's code is read from such a
 * value by a join to the enumeration's lexical relation (C17), one join over any of them
 * ({@link attributeCodes}). A law of the stored level reads the same attributes through
 * `attributesOf` (`#pantry/qti/attributes.ts`).
 *
 * A whitespace list an owner splits into tokens is read beside its attribute's lexical form
 * ({@link listForms}), and {@link spelledByTokens} is the one statement that the tokens spell it.
 * Its reference views, {@link VariableRefNode} and {@link PlacedVariableRefNode}, are each variable
 * reference beside its element's kind and its attribute's lexical form, and each placed one beside
 * its element's kind, which no row copies: the one join every reference law and query that reads
 * them matches.
 * Its ID view, {@link IdValue}, is the one statement of an ID's value: each `DocumentId` beside its
 * ID-typed attribute's `value` or its text collapsed, which every rule that reads an ID matches.
 * Its language view, {@link LangValue}, is the one statement of the language an `xml:lang` states
 * and of its compared value, which every rule that reads a language matches.
 *
 * The views are a level of their own because a derived relation reads only the levels below its
 * own: a rule's query at `QtiQueries`, or at a level over it, matches a view here as it matches a
 * table.
 */
import { check, Compute, derived, query, schema, v } from "@bjornpagen/grizzle";
import type { RelationName } from "@bjornpagen/grizzle";
import {
  AttributeGrammar,
  AttributeModelOf,
  BaseTypeLexical,
  CardinalityLexical,
  Declares,
  ValueIdentity,
} from "#pantry/grammar/install.ts";
import type { AttributeName, ResourceTypeLexical } from "#pantry/grammar/install.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import type { SelectedKinds } from "#pantry/qti/attributes.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { CatalogScope, DocumentId, SsmlScope } from "#pantry/qti/identity.ts";
import { idSpaceAttributes, ssmlReads } from "#pantry/vocab/terms/identity.ts";
import { declarationKinds } from "#pantry/qti/declarations.ts";
import { ValueBaseOf } from "#pantry/qti/expression-types.ts";
import { PlacedVariableRef, VariableRef } from "#pantry/qti/expressions.ts";
import type { CellHeaders } from "#pantry/qti/html.ts";
import { Node } from "#pantry/qti/node.ts";
import type { Tolerance } from "#pantry/qti/operators.ts";
import { recordDocumentTypes } from "#pantry/vocab/terms/metadata.ts";

/**
 * Make the variables of an `Attribute` row a rule over a query matches, in its scope `attribute`.
 *
 * @returns The variables.
 */
const attributeTerms = () => v(Attribute, "attribute");

/**
 * The variables of an `Attribute` row a rule over a query matches.
 */
type AttributeTerms = ReturnType<typeof attributeTerms>;

/**
 * State that an attribute a rule over a query matches is of one name on an element of one of some
 * kinds: the query's twin of `namedOn` (`#pantry/qti/attributes.ts`), a law of the stored level's
 * statement of the same selection, and the one statement of it in a query, which
 * {@link attributeValues} and {@link SsmlValue} read.
 *
 * @param attribute - The row's variables.
 * @param name - The attribute's name.
 * @param kinds - The elements' kinds.
 * @returns The condition.
 */
export const namedIn = (
  attribute: Pick<AttributeTerms, "kind" | "name">,
  name: (typeof AttributeName.handles)[number],
  kinds: SelectedKinds,
) =>
  Compute.and(
    Compute.eq(attribute.name, name),
    Compute.or(...kinds.map((each) => Compute.eq(attribute.kind, each))),
  );

/**
 * State that an attribute a rule over a query matches is ID-typed: its domain under its element's
 * governor (`AttributeGrammar` of its governor's `AttributeModelOf`) has the `ValueIdentity` `ID`,
 * or it is one of `idSpaceAttributes` (`#pantry/vocab/terms/identity.ts`), a context declaration's
 * `identifier` (spec reading 74), by {@link namedIn}. The query's twin of `idTyped`
 * (`#pantry/qti/identity.ts`), the stored level's statement of the same attributes, reading the
 * same closed relations and roster, and the one statement of it in a query, which {@link IdValue}
 * reads.
 *
 * @param attribute - The row's variables.
 * @returns The condition.
 */
export const idTypedIn = (attribute: Pick<AttributeTerms, "governor" | "kind" | "name">) => {
  const domain = AttributeGrammar.at(
    "domain",
    AttributeModelOf.at("model", attribute.governor),
    attribute.name,
  );

  return Compute.or(
    Compute.and(ValueIdentity.has(domain), Compute.eq(ValueIdentity.at("identity", domain), "ID")),
    ...idSpaceAttributes.map(([name, kinds]) => namedIn(attribute, name, kinds)),
  );
};

/**
 * The attributes of one name on the elements of some kinds ({@link namedIn}), each by its element's
 * place, with its element's kind and its `value`, the lexical form normalized in its domain's class
 * (`Attribute`'s generated field): the selection a rule over a query reads, where a law of the
 * stored level reads `attributesOf` (`#pantry/qti/attributes.ts`). The name is fixed, so
 * `Attribute`'s key keys a selection by its element's place, `(package, path, start)`. A rule
 * matches the query, or a derived relation over it where a law or another level reads it, as a
 * table.
 *
 * @param name - The attribute's name.
 * @param kinds - The elements' kinds.
 * @returns The query.
 */
export const attributeValues = (
  name: (typeof AttributeName.handles)[number],
  kinds: SelectedKinds,
) =>
  query(QtiBase).rule((r) => {
    const attribute = attributeTerms();
    const { kind, package: pkg, path, start, value } = attribute;

    return r
      .match(Attribute, { kind, name: attribute.name, package: pkg, path, start, value })
      .where(namedIn(attribute, name, kinds))
      .find({ kind, package: pkg, path, start, value });
  });

/**
 * The lexical relations of the coded enumerations (C17), each a code's lexical form by its code,
 * `{ code, lexical }`, the code of its own roster: `BaseTypeLexical`, `CardinalityLexical` and
 * `ResourceTypeLexical`.
 */
type Lexical = typeof BaseTypeLexical | typeof CardinalityLexical | typeof ResourceTypeLexical;

/**
 * The attributes of one name on the elements of some kinds ({@link attributeValues}) whose `value`
 * spells a code of `lexical`'s enumeration, each by its element's place, with its element's kind
 * and the code: the value joined to the enumeration's lexical relation, the code of a coded
 * enumeration (C17) by its lexical form. A closed relation is read in a query's find only through a
 * join, so the code is the lexical relation's row the value matches. An attribute whose value
 * spells none has no row, and its value domain alone refuses it. The code is typed by `lexical`'s
 * own roster, ordered or unordered as it is: the lexical relations' headings differ only in that
 * roster, so grizzle types the query per instantiation.
 *
 * @param name - The attribute's name.
 * @param kinds - The elements' kinds.
 * @param lexical - The enumeration's lexical relation.
 * @returns The query.
 */
export const attributeCodes = <L extends Lexical>(
  name: (typeof AttributeName.handles)[number],
  kinds: SelectedKinds,
  lexical: L,
) => {
  const attributes = attributeValues(name, kinds);

  return query(QtiBase).rule((r) => {
    const { kind, package: pkg, path, start, value } = v(attributes, "attribute");
    const { code } = v(lexical, "lexical");

    return r
      .match(attributes, { kind, package: pkg, path, start, value })
      .match(lexical, { code, lexical: value })
      .find({ code, kind, package: pkg, path, start });
  });
};

/**
 * The owners of an attribute's whitespace list split into tokens (`#pantry/qti/token-list.ts`),
 * each keyed by its element with its count of tokens, `tokens`, and the end of their
 * concatenation, `tokenText`: a cell's `headers` and a `qti-equal`'s `tolerance`. grizzle types a
 * query over several relations only where each is named (its README, "Generic helpers"), so
 * {@link listForms} reads these, which share one heading.
 */
type ListOwner = typeof CellHeaders | typeof Tolerance;

/**
 * Each owner of an attribute's whitespace list ({@link ListOwner}), by its element's place, beside
 * the attribute's lexical form: the owner's count of tokens and their concatenation, and the
 * attribute's `lexical`, read at `Attribute`'s key with its name fixed and never copied into the
 * owner (C18). The owner's existence on the attribute is its module's containment, so the query
 * reads the attribute by place and name alone. {@link spelledByTokens} holds the tokens to the
 * form.
 *
 * @param name - The derived relation's name.
 * @param owner - The list's owner.
 * @param attribute - The attribute it splits.
 * @returns The derived relation, by the owner's place.
 */
export const listForms = <const Name extends string>(
  name: RelationName<Name>,
  owner: ListOwner,
  attribute: (typeof AttributeName.handles)[number],
) =>
  derived(
    name,
    query(QtiBase).rule((r) => {
      const { package: pkg, path, start, tokenText, tokens } = v(owner, "owner");
      const { lexical } = v(Attribute, "attribute");

      return r
        .match(owner, { package: pkg, path, start, tokenText, tokens })
        .match(Attribute, { lexical, name: attribute, package: pkg, path, start })
        .find({ lexical, package: pkg, path, start, tokenText, tokens });
    }),
  );

/**
 * State that a whitespace list's tokens spell its attribute's lexical form (`E1_derived`), over
 * its {@link listForms}: their concatenation is the form, or there are none and the form is XML
 * whitespace alone, which collapses to nothing. With each token's own check (`whitespaceTokens` of
 * `#pantry/qti/token-list.ts`), that makes the tokens exactly the form's whitespace-separated
 * tokens. The form is read as written, never as its `value`: a list's `value` is collapsed, and the
 * tokens hold the whitespace around them.
 *
 * @param forms - The list's forms.
 * @returns The check.
 */
export const spelledByTokens = <const Name extends string>(
  forms: ReturnType<typeof listForms<Name>>,
) =>
  check("E1_derived", forms, (o) =>
    o.or(
      o.eq(o.lexical, o.tokenText),
      o.and(o.eq(o.tokens, 0n), o.eq(Compute.collapse(o.lexical), "")),
    ),
  );

/**
 * Each variable reference beside its element's kind and the attribute's lexical form, keyed as the
 * reference, `(package, path, start, attribute)`: its {@link VariableRef} row matched with
 * `Attribute` at the attribute's key, whose `kind` is its element's and whose `lexical` the
 * reference splits. No row copies either (C18): every law of a reference that reads its element's
 * kind or its form matches this view, and so do the queries that read a reference's kind
 * (`HeldType` of `#pantry/qti/queries.ts`, `VariableRefDeclaration` and `TableClaim` of
 * `#pantry/qti/overlay-queries/reference.ts`).
 */
export const VariableRefNode = derived(
  "VariableRefNode",
  query(QtiBase).rule((r) => {
    const {
      after,
      attribute,
      baseType,
      before,
      cardinality,
      elementBase,
      elementCardinality,
      identifier,
      language,
      package: pkg,
      path,
      resolution,
      rootKind,
      start,
    } = v(VariableRef, "reference");
    const { kind, lexical } = v(Attribute, "attribute");

    return r
      .match(VariableRef, {
        after,
        attribute,
        baseType,
        before,
        cardinality,
        elementBase,
        elementCardinality,
        identifier,
        language,
        package: pkg,
        path,
        resolution,
        rootKind,
        start,
      })
      .match(Attribute, { kind, lexical, name: attribute, package: pkg, path, start })
      .find({
        after,
        attribute,
        baseType,
        before,
        cardinality,
        elementBase,
        elementCardinality,
        identifier,
        kind,
        language,
        lexical,
        package: pkg,
        path,
        resolution,
        rootKind,
        start,
      });
  }),
);

/**
 * Each variable reference placed in an item's assembly beside its element's kind, keyed as the
 * placed reference, `(package, assembly, instance, path, start, attribute)`: its
 * {@link PlacedVariableRef} row matched with `Node` at its element's place, whose `kind` no row
 * copies (decision S3). Every law of a placed reference that reads its element's kind matches this
 * view, and so does the query that resolves it among its item's declarations
 * (`PlacedVariableRefDeclaration` of `#pantry/qti/overlay-queries/reference.ts`).
 */
export const PlacedVariableRefNode = derived(
  "PlacedVariableRefNode",
  query(QtiBase).rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      instance,
      package: pkg,
      path,
      resolution,
      rootKind,
      start,
    } = v(PlacedVariableRef, "placed");
    const { kind } = v(Node, "node");

    return r
      .match(PlacedVariableRef, {
        assembly,
        attribute,
        identifier,
        instance,
        package: pkg,
        path,
        resolution,
        rootKind,
        start,
      })
      .match(Node, { kind, package: pkg, path, start })
      .find({
        assembly,
        attribute,
        identifier,
        instance,
        kind,
        package: pkg,
        path,
        resolution,
        rootKind,
        start,
      });
  }),
);

/**
 * Each declaration's `identifier`, by its declaration's place, its `value` the lexical form
 * collapsed (`IdentifierDType`'s class, C18): the name a binding, a reference and a choice's name
 * resolve against, whatever the declaration's cardinality spells (spec reading 159). No row copies
 * it. A declaration that writes no `identifier` has none, and AL3 refuses it (spec reading 157). A
 * value that is no NCName names nothing (spec reading 152), and no rule reads one: AL1's
 * `value_domain` is a row check of the attribute, so the write that holds it is refused at its own
 * insert, before any rule over a query is judged at COMMIT, and the selection matches no pattern.
 */
const declarationIdentifiers = attributeValues("identifier", declarationKinds);

/**
 * Each declaration's `cardinality`, by its declaration's place, where its `value` spells a code:
 * `code`, the `Cardinality` it spells (C17, {@link attributeCodes}). A `cardinality` that is
 * unwritten or spells nothing, a padded form among them, since the attribute restricts
 * `xs:string`, has no row, and AL3 or its value domain refuses it alone (spec reading 158).
 */
const declarationCardinalities = attributeCodes(
  "cardinality",
  declarationKinds,
  CardinalityLexical,
);

/**
 * {@link declarationCardinalities} as a relation of `QtiViews`, the one a law or a rule's query of
 * a level over this one reads a declaration's cardinality from.
 */
export const DeclarationCardinality = derived("DeclarationCardinality", declarationCardinalities);

/**
 * The attributes of one name on the elements of some kinds whose `value` spells a base type, each
 * with the base type and its expression type: {@link attributeCodes}' code, and `valueBase`, its
 * `ValueBaseOf` image, the base type a reference to the variable, or a value of it, is typed with.
 * The join is stated once here, for each attribute whose base type an expression reads.
 *
 * @param name - The attribute's name.
 * @param kinds - The elements' kinds.
 * @returns The query.
 */
export const valueBasesOf = (
  name: (typeof AttributeName.handles)[number],
  kinds: SelectedKinds,
) => {
  const spelled = attributeCodes(name, kinds, BaseTypeLexical);

  return query(QtiBase).rule((r) => {
    const { code, kind, package: pkg, path, start } = v(spelled, "base");
    const { value: valueBase } = v(ValueBaseOf, "valueBase");

    return r
      .match(spelled, { code, kind, package: pkg, path, start })
      .match(ValueBaseOf, { baseType: code, value: valueBase })
      .find({ code, kind, package: pkg, path, start, valueBase });
  });
};

/**
 * Each declaration's base type, by its declaration's place, where its `base-type` spells one
 * ({@link valueBasesOf}): `code`, the `BaseType`, and `valueBase`, its expression type. A record
 * writes none ("Variables with record cardinality have no base-type", QTI 3.0 information model,
 * tables 4.5.3, 5.34.3, 5.115.3 and 5.151.3), and "Declaration base type" refuses one that does. A
 * declaration whose `base-type` is unwritten or spells nothing has no row, and its value domain
 * refuses one that spells nothing alone (spec reading 158).
 */
const declarationBaseTypes = valueBasesOf("base-type", declarationKinds);

/**
 * {@link declarationBaseTypes} as a relation of `QtiViews`, the one a law or a rule's query of a
 * level over this one reads a declaration's base type from.
 */
export const DeclarationBaseType = derived("DeclarationBaseType", declarationBaseTypes);

/**
 * Each declared name beside its declaration, by the declaration's place: its `identifier`'s value
 * ({@link declarationIdentifiers}), and its kind, `declarationKind`, its element's kind as a
 * `DeclarationKind`, `Declares` of it, the one place a declaration's kind is derived (decision S3).
 * Every name view matches it, so the join is stated here once.
 */
const declaredNames = query(QtiBase).rule((r) => {
  const { kind, package: pkg, path, start, value: identifier } = v(declarationIdentifiers, "name");
  const { declaration: declarationKind } = v(Declares, "declares");

  return r
    .match(declarationIdentifiers, { kind, package: pkg, path, start, value: identifier })
    .match(Declares, { declaration: declarationKind, kind })
    .find({ declarationKind, identifier, package: pkg, path, start });
});

/**
 * Each declared name beside its declaration's kind, by the declaration's place
 * ({@link declaredNames}). Every declaration whose identifier names something has a row, whatever
 * its cardinality spells (spec reading 159).
 */
export const NamedDeclaration = derived(
  "NamedDeclaration",
  query(QtiBase).rule((r) => {
    const { declarationKind, identifier, package: pkg, path, start } = v(declaredNames, "name");

    return r
      .match(declaredNames, { declarationKind, identifier, package: pkg, path, start })
      .find({ declarationKind, identifier, package: pkg, path, start });
  }),
);

/**
 * Each declared name beside its declaration's kind ({@link declaredNames}) and cardinality, by the
 * declaration's place, where the declaration has both a name and a cardinality: its
 * {@link declarationCardinalities}' code. A named declaration whose cardinality is unwritten or
 * spells nothing has no row, so no law reads a cardinality it does not have, and AL3 or its value
 * domain refuses it alone (spec reading 158).
 */
export const DeclarationName = derived(
  "DeclarationName",
  query(QtiBase).rule((r) => {
    const { declarationKind, identifier, package: pkg, path, start } = v(declaredNames, "name");
    const { code: cardinality } = v(declarationCardinalities, "declared");

    return r
      .match(declaredNames, { declarationKind, identifier, package: pkg, path, start })
      .match(declarationCardinalities, { code: cardinality, package: pkg, path, start })
      .find({ cardinality, declarationKind, identifier, package: pkg, path, start });
  }),
);

/**
 * Each declared name beside its declaration's kind ({@link declaredNames}) and base type, by the
 * declaration's place, where the declaration has both a name and a base type: its
 * {@link declarationBaseTypes}' code, as `baseType`, and `valueBase`, the base type as an
 * expression's type. A record has no base type, and its name no row.
 */
export const TypedDeclarationName = derived(
  "TypedDeclarationName",
  query(QtiBase).rule((r) => {
    const { declarationKind, identifier, package: pkg, path, start } = v(declaredNames, "name");
    const { code: baseType, valueBase } = v(declarationBaseTypes, "base");

    return r
      .match(declaredNames, { declarationKind, identifier, package: pkg, path, start })
      .match(declarationBaseTypes, { code: baseType, package: pkg, path, start, valueBase })
      .find({ baseType, declarationKind, identifier, package: pkg, path, start, valueBase });
  }),
);

/**
 * The nodes of the documents a package's records are read from ({@link recordDocumentTypes}), each
 * by its place, with its kind, its parent, its parent's kind and its folded string value: what LOM
 * vocabulary and LOM vCard judge, and where a record, its general category's languages and its
 * learning resource types' terms are read. A document's type is its `Document`'s alone (decision
 * S3), so the view matches it there.
 */
export const RecordNode = derived(
  "RecordNode",
  query(QtiBase).rule((r) => {
    const { kind, package: pkg, parent, parentKind, path, start, stringValue } = v(Node, "node");
    const { documentType } = v(Document, "document");

    return r
      .match(Node, { kind, package: pkg, parent, parentKind, path, start, stringValue })
      .match(Document, { documentType, package: pkg, path })
      .where(r.in(documentType, recordDocumentTypes))
      .find({ kind, package: pkg, parent, parentKind, path, start, stringValue });
  }),
);

/**
 * The SSML attributes reading 3's laws read (`ssmlReads` of `#pantry/vocab/terms/identity.ts`),
 * each by its element's place, with its element's kind, its `value`, the lexical form collapsed
 * (its domain's class, `collapse` for each), and its fragment, its element's `SsmlScope`'s: the
 * names each fragment's `lexicon`s and `mark`s define, and those its `lookup`s and its `speak`'s
 * trims name. No row copies them (C18). Each kind carries one part in the laws, so a law reads a
 * part by its kind alone. "SSML lexicon reference" and "SSML trim mark" read it, and `TrimmedMark`
 * matches it twice, so it is a view.
 */
export const SsmlValue = derived(
  "SsmlValue",
  query(QtiBase).rule((r) => {
    const attribute = attributeTerms();
    const { kind, name, package: pkg, path, start, value } = attribute;
    const { fragment } = v(SsmlScope, "scope");

    return r
      .match(Attribute, { kind, name, package: pkg, path, start, value })
      .match(SsmlScope, { fragment, package: pkg, path, start })
      .where(Compute.or(...ssmlReads.map(([read, kinds]) => namedIn(attribute, read, kinds))))
      .find({ fragment, kind, package: pkg, path, start, value });
  }),
);

/**
 * Each document's IDs with their values, by the element that carries each: its {@link DocumentId}'s
 * `owner` and `admitted`, and `id`, the ID's value, read where it stands, which no row copies
 * (C18). Two rules state it, one per kind of ID:
 *
 * - **an attribute's:** the element's ID-typed attribute ({@link idTypedIn}), its `value`, the
 *   lexical form collapsed (`xs:ID`'s and `IdentifierDType`'s whiteSpace), bound to the element
 *   itself, its `DocumentId`'s `owner` its `start`;
 * - **a text's:** the element's string value collapsed (`Compute.collapse`, XML Schema Part 2
 *   §4.3.6), a key text as the string value is, bound to its parent, its `DocumentId`'s `owner` any
 *   other position.
 *
 * Every ID has a row, whatever its form: its value domain (AL1) or TextDomain refuses a form that
 * is no NCName once collapsed where it is written (spec readings 152 and 156). The document's
 * ID/IDREF table (`IdBinding`), a placed ID's, a `th`'s `TableHeader`'s and a catalog's
 * `CatalogId`'s value each read it (`#pantry/qti/overlay-queries/`), so it is a view.
 */
export const IdValue = derived(
  "IdValue",
  query(QtiBase)
    .rule((r) => {
      const attribute = attributeTerms();
      const { governor, kind, name, package: pkg, path, start, value } = attribute;
      const { admitted } = v(DocumentId, "id");

      return r
        .match(Attribute, { governor, kind, name, package: pkg, path, start, value })
        .match(DocumentId, { admitted, owner: start, package: pkg, path, start })
        .where(idTypedIn(attribute))
        .find({ admitted, id: value, owner: start, package: pkg, path, start });
    })
    .rule((r) => {
      const { admitted, owner, package: pkg, path, start } = v(DocumentId, "id");
      const { stringValue } = v(Node, "node");

      return r
        .match(DocumentId, { admitted, owner, package: pkg, path, start })
        .match(Node, { package: pkg, path, start, stringValue })
        .where(r.ne(owner, start))
        .find({
          admitted,
          id: Compute.collapse(stringValue),
          owner,
          package: pkg,
          path,
          start,
        });
    }),
);

/**
 * Each `xml:lang` that states a language, by its element's place, with its element's
 * {@link CatalogScope}'s `scope` and `value`, the language it states as R26 and `lom-title` compare
 * it: the attribute's `value`
 * (its lexical form normalized in its domain's class, `Attribute`'s generated field) case-folded
 * (`Compute.lowerAscii`, RFC 5646 §2.1.1), an XML text as `Attribute`'s `value` is, read where it
 * stands, which no row copies (C18). A form states a language exactly where its value is not empty
 * (XML 1.0 §2.12: an empty `xml:lang` states none). That is a selection of the forms AL1 admits,
 * not a restatement of AL1: the empty form is a body element's valid form, and every other form AL1
 * admits has a tag for its value, since each of the three `xml:lang` domains lies inside a tag with
 * XML whitespace around it, or the empty form (`#pantry/qti/identity.ts`, "Language equality"; spec
 * readings 129 and 174). `MatchedTitle`, `DescribedLang` and `DescribedAssembledLang` read it
 * (`#pantry/qti/queries.ts`).
 */
export const LangValue = derived(
  "LangValue",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value } = v(Attribute, "attribute");
    const { scope } = v(CatalogScope, "scope");

    return r
      .match(Attribute, { name: "xml:lang", package: pkg, path, start, value })
      .match(CatalogScope, { package: pkg, path, scope, start })
      .where(r.ne(value, ""))
      .find({
        package: pkg,
        path,
        scope,
        start,
        value: Compute.lowerAscii(value),
      });
  }),
);

/**
 * The shared views, each carrying its own name.
 */
export const viewRelations = [
  DeclarationBaseType,
  DeclarationCardinality,
  DeclarationName,
  IdValue,
  LangValue,
  NamedDeclaration,
  RecordNode,
  SsmlValue,
  TypedDeclarationName,
  VariableRefNode,
  PlacedVariableRefNode,
] as const;

/**
 * The level of the shared views over the stored level, the one home of every view a rule over a
 * query reads in common, with no law of its own: every rule over them is stated at `QtiQueries`
 * (`#pantry/qti/schema.ts`).
 */
export const QtiViews = schema.extend(QtiBase, "QtiViews", viewRelations, []);
