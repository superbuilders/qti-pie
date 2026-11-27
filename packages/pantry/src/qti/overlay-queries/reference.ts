/**
 * The references' resolutions by name (decision S3: no copies): a binding, a content reference and
 * a variable reference each name a declaration by its identifier, and resolve to it in their
 * document's declarations, or, under a placement, in their assembly's root's, whatever the
 * declaration's cardinality spells (spec reading `binding-by-name`). A content reference's
 * resolution is held by no row: each law that reads it matches the reference with a name view of
 * `QtiViews` (`#pantry/qti/names.ts`, the one definition of what a name names) by `(package, path,
 * identifier)`, the key "Declaration key" holds, a rule over a query here, under the law's own name
 * (`#pantry/qti/interactions.ts`). A variable reference's is its placed row's, under each placement
 * of its document (`PlacedVariableRef` of `#pantry/qti/expressions.ts`, spec reading
 * `fragment-placement`), and every law over what it names, its kind, cardinality, base type or
 * table, reads that row: a located template's references among its item's declarations, as an
 * included rules fragment's.
 */
import type { RelationName, RowScalars } from "@bjornpagen/grizzle";
import {
  check,
  contained,
  derived,
  mirrors,
  on,
  query,
  select,
  Text,
  Type,
  v,
} from "@bjornpagen/grizzle";
import { pipe, Record as Rec } from "effect";
import type { tableReaders } from "#pantry/grammar/expression.ts";
import { ContentReference, VariableReference } from "#pantry/grammar/install.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import {
  declaredKinds,
  lookupKindHandle,
  ReferenceBase,
  ReferenceDeclaration,
  ValueCardinalityOf,
} from "#pantry/qti/expression-types.ts";
import {
  builtInReferrers,
  builtInResponses,
  Expression,
  mappedKinds,
  PlacedExpression,
  PlacedVariableRef,
  Processing,
  anyKindStandIns,
  silentBases,
  VariableRef,
} from "#pantry/qti/expressions.ts";
import {
  BoundVariable,
  contentReferences,
  feedbackCardinalities,
  FeedbackRef,
  FragmentFeedbackRef,
  FragmentTemplateRef,
  namesNoBuiltIn,
  PlacedBinding,
  TemplateRef,
  templateVariableKind,
} from "#pantry/qti/interactions.ts";
import type { ContentReferenceOf } from "#pantry/qti/interactions.ts";
import {
  DeclarationName,
  NamedDeclaration,
  QtiViews,
  PlacedVariableRefNode,
  TypedDeclarationName,
  VariableRefNode,
} from "#pantry/qti/names.ts";
import { placedDocuments } from "#pantry/qti/overlay-queries/expression.ts";
import { readDeclarations } from "#pantry/qti/overlay-queries/readings.ts";
import { expressionKinds, ruleKindHandles } from "#pantry/vocab/terms/expression-types.ts";
import { itemKind } from "#pantry/vocab/terms/tests.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * The names each content reference may name in a document, by the document, the name, and the
 * referring kind and attribute: each {@link NamedDeclaration} of a kind `ContentReference` lets that
 * kind's attribute name. A content reference that names no built-in variable of its root names one
 * of these, its own document's or, placed, its assembly's item's.
 */
const ReferableName = derived(
  "ReferableName",
  query(QtiViews).rule((r) => {
    const { declarationKind, identifier, package: pkg, path } = v(NamedDeclaration, "name");
    const { attribute, kind } = v(ContentReference, "reference");

    return r
      .match(NamedDeclaration, { declarationKind, identifier, package: pkg, path })
      .match(ContentReference, { attribute, declaration: declarationKind, kind })
      .find({ attribute, identifier, kind, package: pkg, path });
  }),
);

/**
 * The names of a document's response declarations, by the document and the name: a binding names
 * one of these (reading `response-identifier-declared`), its item's.
 */
const responseNames = select(NamedDeclaration, (d) =>
  d.eq(d.declarationKind, "qti-response-declaration"),
);

/**
 * Each content reference's variable beside its cardinality, by the reference's place and attribute,
 * with the reference's kind, where the variable is a declaration the reference may name and has a
 * cardinality: an own reference's in its document, and an included fragment's, under each
 * placement, in its item's, each matched with {@link DeclarationName} by its name. A variable whose
 * cardinality is unwritten or spells nothing gives its reference none, so no law reads a
 * cardinality it does not have, and AL3 or its value domain refuses it alone (spec reading
 * `unspelled-declaration`). The content references' type laws read it: "Feedback outcome type" and
 * "Template variable type" here, and "Printed variable type" (`#pantry/qti/queries.ts`).
 *
 * @param name - The query's name.
 * @param own - The relation of an item's references of the class.
 * @param placed - The relation of its fragments' references under each placement.
 * @returns The query.
 */
export const referenceCardinalityOf = <Name extends string>(
  name: RelationName<Name>,
  own: ContentReferenceOf["own"],
  placed: ContentReferenceOf["placed"],
) =>
  derived(
    name,
    query(QtiViews)
      .rule((r) => {
        const { attribute, identifier, kind, package: pkg, path, start } = v(own, "ref");
        const { cardinality, declarationKind } = v(DeclarationName, "name");

        return r
          .match(own, { attribute, identifier, kind, package: pkg, path, start })
          .match(DeclarationName, { cardinality, declarationKind, identifier, package: pkg, path })
          .match(ContentReference, { attribute, declaration: declarationKind, kind })
          .find({ attribute, cardinality, kind, package: pkg, path, start });
      })
      .rule((r) => {
        const {
          assembly,
          attribute,
          identifier,
          kind,
          package: pkg,
          path,
          start,
        } = v(placed, "ref");
        const { cardinality, declarationKind } = v(DeclarationName, "name");

        return r
          .match(placed, { assembly, attribute, identifier, kind, package: pkg, path, start })
          .match(DeclarationName, {
            cardinality,
            declarationKind,
            identifier,
            package: pkg,
            path: assembly,
          })
          .match(ContentReference, { attribute, declaration: declarationKind, kind })
          .find({ attribute, cardinality, kind, package: pkg, path, start });
      }),
  );

/**
 * Each content reference's variable beside its base type, as {@link referenceCardinalityOf} holds
 * its cardinality, matched with {@link TypedDeclarationName}: a record has no base type, and its
 * reference no row.
 *
 * @param name - The query's name.
 * @param own - The relation of an item's references of the class.
 * @param placed - The relation of its fragments' references under each placement.
 * @returns The query.
 */
export const referenceBaseTypeOf = <Name extends string>(
  name: RelationName<Name>,
  own: ContentReferenceOf["own"],
  placed: ContentReferenceOf["placed"],
) =>
  derived(
    name,
    query(QtiViews)
      .rule((r) => {
        const { attribute, identifier, kind, package: pkg, path, start } = v(own, "ref");
        const { baseType, declarationKind } = v(TypedDeclarationName, "name");

        return r
          .match(own, { attribute, identifier, kind, package: pkg, path, start })
          .match(TypedDeclarationName, {
            baseType,
            declarationKind,
            identifier,
            package: pkg,
            path,
          })
          .match(ContentReference, { attribute, declaration: declarationKind, kind })
          .find({ attribute, baseType, kind, package: pkg, path, start });
      })
      .rule((r) => {
        const {
          assembly,
          attribute,
          identifier,
          kind,
          package: pkg,
          path,
          start,
        } = v(placed, "ref");
        const { baseType, declarationKind } = v(TypedDeclarationName, "name");

        return r
          .match(placed, { assembly, attribute, identifier, kind, package: pkg, path, start })
          .match(TypedDeclarationName, {
            baseType,
            declarationKind,
            identifier,
            package: pkg,
            path: assembly,
          })
          .match(ContentReference, { attribute, declaration: declarationKind, kind })
          .find({ attribute, baseType, kind, package: pkg, path, start });
      }),
  );

/**
 * A feedback element's outcome's cardinality, where it has one: "Feedback outcome type" holds it to
 * single or multiple.
 */
const FeedbackRefCardinality = referenceCardinalityOf(
  "FeedbackRefCardinality",
  FeedbackRef,
  FragmentFeedbackRef,
);

/**
 * A feedback element's outcome's base type, where it has one: "Feedback outcome type" holds it to
 * `identifier`.
 */
const FeedbackRefBaseType = referenceBaseTypeOf(
  "FeedbackRefBaseType",
  FeedbackRef,
  FragmentFeedbackRef,
);

/**
 * A template reference's variable's cardinality, where it has one: "Template variable type" holds
 * it to single or multiple unless the reference is a portable custom interaction's
 * `qti-template-variable`, which states no type (decision 432).
 */
const TemplateRefCardinality = referenceCardinalityOf(
  "TemplateRefCardinality",
  TemplateRef,
  FragmentTemplateRef,
);

/**
 * A template reference's variable's base type, where it has one: "Template variable type" holds it
 * to `identifier` unless the reference is a `qti-template-variable`'s.
 */
const TemplateRefBaseType = referenceBaseTypeOf(
  "TemplateRefBaseType",
  TemplateRef,
  FragmentTemplateRef,
);

/**
 * The references each placement resolves, by the placement and the reference's element place and
 * attribute, with its name: every variable reference of every document it places (`placedDocuments`
 * of `#pantry/qti/overlay-queries/expression.ts`). "E1 derived" holds `PlacedVariableRef` to it
 * both ways, so a placement resolves each of its references once, its name as written, and nothing
 * else.
 */
const PlacedReferenceSite = derived(
  "PlacedReferenceSite",
  query(QtiViews).rule((r) => {
    const { assembly, instance, package: pkg, path } = v(placedDocuments, "placement");
    const { attribute, identifier, start } = v(VariableRef, "reference");

    return r
      .match(placedDocuments, { assembly, instance, package: pkg, path })
      .match(VariableRef, { attribute, identifier, package: pkg, path, start })
      .find({ assembly, attribute, identifier, instance, package: pkg, path, start });
  }),
);

/**
 * The declaration each declared placed reference names among its assembly's root's declarations,
 * keyed as the placed reference: its `assembly` as the declaration's document, `declaration` its
 * {@link NamedDeclaration}'s `start` there and its kind, whatever its cardinality spells (spec
 * reading `binding-by-name`), beside the reference's element's `kind` and `language` ({@link
 * PlacedVariableRefNode}), its `attribute`, and its type there. A rules fragment's reference names
 * its item's declaration, and a located template's the item's (spec reading `fragment-placement`,
 * information model §4.6.1).
 */
const placedDeclarations = query(QtiViews).rule((r) => {
  const {
    assembly,
    attribute,
    baseType,
    cardinality,
    identifier,
    instance,
    kind,
    language,
    package: pkg,
    path,
    start,
  } = v(PlacedVariableRefNode, "placed");
  const { declarationKind, start: declaration } = v(NamedDeclaration, "name");

  return r
    .match(PlacedVariableRefNode, {
      assembly,
      attribute,
      baseType,
      cardinality,
      identifier,
      instance,
      kind,
      language,
      package: pkg,
      path,
      resolution: "declared",
      start,
    })
    .match(NamedDeclaration, {
      declarationKind,
      identifier,
      package: pkg,
      path: assembly,
      start: declaration,
    })
    .find({
      assembly,
      attribute,
      baseType,
      cardinality,
      declaration,
      declarationKind,
      identifier,
      instance,
      kind,
      language,
      package: pkg,
      path,
      start,
    });
});

/**
 * {@link placedDeclarations} as a relation of the schema, which the laws over a declared reference's
 * declaration read.
 */
const PlacedVariableRefDeclaration = derived("PlacedVariableRefDeclaration", placedDeclarations);

/**
 * The declaration whose variable each placed reference stands for, keyed as the placed reference,
 * with its type there: a declared one's, its assembly's root's ({@link placedDeclarations}), and a
 * read one's, the item's declaration its reading names through an item ref
 * (`readDeclarations` of `#pantry/qti/overlay-queries/readings.ts`), each by the declaration's
 * document `declPath` and place `declStart`. "E1 derived" types each as its declaration.
 */
const variableDeclarations = query(QtiViews)
  .rule((r) => {
    const {
      assembly,
      attribute,
      baseType,
      cardinality,
      declaration,
      instance,
      package: pkg,
      path,
      start,
    } = v(placedDeclarations, "declared");

    return r
      .match(placedDeclarations, {
        assembly,
        attribute,
        baseType,
        cardinality,
        declaration,
        instance,
        package: pkg,
        path,
        start,
      })
      .find({
        assembly,
        attribute,
        baseType,
        cardinality,
        declPath: assembly,
        declStart: declaration,
        instance,
        package: pkg,
        path,
        start,
      });
  })
  .rule((r) => {
    const {
      assembly,
      attribute,
      baseType,
      cardinality,
      declPath,
      declStart,
      instance,
      package: pkg,
      path,
      start,
    } = v(readDeclarations, "read");

    return r
      .match(readDeclarations, {
        assembly,
        attribute,
        baseType,
        cardinality,
        declPath,
        declStart,
        instance,
        package: pkg,
        path,
        start,
      })
      .find({
        assembly,
        attribute,
        baseType,
        cardinality,
        declPath,
        declStart,
        instance,
        package: pkg,
        path,
        start,
      });
  });

/**
 * The declarations {@link variableDeclarations} types placed references as, each with the base type
 * it gives them: a base type other than `unknown` names a declaration that has one, which the law
 * that reads it holds typed. It holds what that law reads, the declaration's place and the base
 * type; the reference and its cardinality stand in {@link variableDeclarations}, which the views
 * that read them read.
 */
const PlacedVariableDeclaration = derived(
  "PlacedVariableDeclaration",
  query(QtiViews).rule((r) => {
    const { baseType, declPath, declStart, package: pkg } = v(variableDeclarations, "reference");

    return r
      .match(variableDeclarations, { baseType, declPath, declStart, package: pkg })
      .find({ baseType, declPath, declStart, package: pkg });
  }),
);

/**
 * A placed reference's cardinality beside its declaration's ({@link variableDeclarations}), keyed
 * as the placed reference, where the declaration has one (spec reading `binding-by-name`):
 * `cardinality`, the reference's type's, and `declCardinality`, its {@link DeclarationName}'s, whose
 * `ValueCardinalityOf` image "E1 derived" holds the first to. A reference to a declaration whose
 * cardinality is unwritten or spells nothing has none, and no rule reads its type's cardinality:
 * `cardinality` is required and enumerated on every declaration kind, so AL3 or its value domain
 * has refused the declaration (spec reading `unspelled-declaration`).
 */
const PlacedVariableCardinality = derived(
  "PlacedVariableCardinality",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      cardinality,
      declPath,
      declStart,
      instance,
      package: pkg,
      path,
      start,
    } = v(variableDeclarations, "reference");
    const { cardinality: declCardinality } = v(DeclarationName, "name");

    return r
      .match(variableDeclarations, {
        assembly,
        attribute,
        cardinality,
        declPath,
        declStart,
        instance,
        package: pkg,
        path,
        start,
      })
      .match(DeclarationName, {
        cardinality: declCardinality,
        package: pkg,
        path: declPath,
        start: declStart,
      })
      .find({
        assembly,
        attribute,
        cardinality,
        declCardinality,
        instance,
        package: pkg,
        path,
        start,
      });
  }),
);

/**
 * A placed reference's base type beside its declaration's ({@link variableDeclarations}), keyed as
 * the placed reference, where the declaration has one: `baseType`, the reference's type's, and
 * `valueBase`, its {@link TypedDeclarationName}'s, the declaration's base type as an expression's
 * type, which "E1 derived" holds the first to. A reference to a declaration with no base type has
 * none, and its type's base type is `unknown` (spec reading `unspelled-declaration`), a record's
 * among them.
 */
const PlacedVariableBase = derived(
  "PlacedVariableBase",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      baseType,
      declPath,
      declStart,
      instance,
      package: pkg,
      path,
      start,
    } = v(variableDeclarations, "reference");
    const { valueBase } = v(TypedDeclarationName, "name");

    return r
      .match(variableDeclarations, {
        assembly,
        attribute,
        baseType,
        declPath,
        declStart,
        instance,
        package: pkg,
        path,
        start,
      })
      .match(TypedDeclarationName, { package: pkg, path: declPath, start: declStart, valueBase })
      .find({ assembly, attribute, baseType, instance, package: pkg, path, start, valueBase });
  }),
);

/**
 * The reads of a variable as an element's own value under each placement, each a placed reference
 * by `identifier` of a kind typed as its variable (`declaredKinds`), with its element's type there
 * and its variable's, keyed as the element under the placement: the unweighted ones, whose element
 * "E1 derived" holds to its variable's type, and the weighted `qti-variable`s ({@link
 * WeightedRead}).
 *
 * @param weighted - Whether to read the weighted ones or the rest.
 * @returns The query.
 */
const variableReadRows = (weighted: boolean) =>
  query(QtiViews).rule((r) => {
    const {
      assembly,
      baseType,
      cardinality,
      instance,
      kind,
      package: pkg,
      path,
      start,
    } = v(PlacedVariableRefNode, "read");
    const { baseType: elementBase, cardinality: elementCardinality } = v(
      PlacedExpression,
      "element",
    );
    const weight = { kind, name: "weight-identifier", package: pkg, path, start } as const;
    const reads = r
      .match(PlacedVariableRefNode, {
        assembly,
        attribute: "identifier",
        baseType,
        cardinality,
        instance,
        kind,
        package: pkg,
        path,
        start,
      })
      .match(PlacedExpression, {
        assembly,
        baseType: elementBase,
        cardinality: elementCardinality,
        instance,
        package: pkg,
        path,
        start,
      })
      .where(r.in(kind, declaredKinds));

    const head = {
      assembly,
      baseType,
      cardinality,
      elementBase,
      elementCardinality,
      instance,
      package: pkg,
      path,
      start,
    } as const;

    return weighted
      ? reads.match(Attribute, weight).find(head)
      : reads.where(r.not(Attribute, weight)).find(head);
  });

/**
 * Each unweighted read of a variable as its element's value ({@link variableReadRows}): its
 * element is typed as its variable.
 */
const UnweightedRead = derived("UnweightedRead", variableReadRows(false));

/**
 * Each weighted read, a `qti-variable` that writes a `weight-identifier`, the one kind typed as
 * its variable that may: its value is its variable's "subject to the type promotion of weighted
 * outcomes" (information model §7.47), so its element is typed as its variable but float where
 * the variable is integer ("When applying a weight to the value of a variable with base-type
 * integer the value is subject to type promotion and the result of the expression has base-type
 * float", §7.47.2).
 */
const WeightedRead = derived("WeightedRead", variableReadRows(true));

/**
 * The declared placed references by a table reader's `identifier`: the
 * {@link PlacedVariableRefDeclaration} of a reader's kind, under every placement. Each reads one of
 * its declaration's tables its kind reads (reading `test-prefixed-response-reads`), a containment
 * into the declaration's tables, children of its node
 * (`#pantry/qti/overlay-queries/declaration.ts`). It keeps every declaration kind: one that names
 * an outcome finds no mapping and breaks the law. A rules fragment's reference names its item's
 * declaration, where "the content of the fragment must satisfy the requirements of the
 * specification in the context of the item in which it is being included" (spec reading
 * `fragment-placement`), and a located template's the item's ("looks up the value of a response
 * variable and then transforms it using the associated mapping, which must have been declared",
 * information model §6.9.47).
 *
 * @param kind - The reader's kind.
 * @returns The selection.
 */
export const placedTableReaders = (kind: (typeof tableReaders)[number]["kind"]) =>
  select(PlacedVariableRefDeclaration, (d) =>
    d.and(d.eq(d.kind, kind), d.eq(d.attribute, "identifier")),
  );

/**
 * A placed reference beside its element's kind ({@link PlacedVariableRefNode}), as a rule over the
 * view reads it.
 */
type ReferenceNodeRow = RowScalars<typeof PlacedVariableRefNode>;

/**
 * State that a lookup by `identifier` names no built-in variable: a lookup names an outcome whose
 * declaration holds a lookup table (§5.87), so a lookup of a built-in outcome, which has no
 * declaration and no table, is refused (spec reading `lookup-outcome-table`; the built-in
 * `completionStatus` "must not appear in an outcome declaration", §2.2.2.3).
 *
 * @param n - The row.
 * @returns The predicate.
 */
const looksUpNoBuiltIn = (n: ReferenceNodeRow) =>
  n.or(
    n.ne(n.kind, lookupKindHandle),
    n.ne(n.attribute, "identifier"),
    n.ne(n.resolution, "builtIn"),
  );

/**
 * State that a reference by `identifier` from a map response or a map response point names no
 * built-in response variable ({@link builtInResponses}), whose mapping or area mapping is never
 * declared (decision 431, information model §7.22 and §7.23). A built-in of another kind is
 * `Variable kind`'s alone.
 *
 * @param n - The row.
 * @returns The predicate.
 */
const mapsNoBuiltIn = (n: ReferenceNodeRow) =>
  n.or(
    n.ne(n.attribute, "identifier"),
    n.not(n.in(n.kind, mappedKinds)),
    n.ne(n.resolution, "builtIn"),
    n.not(
      n.or(
        ...builtInResponses.map(({ root, variable }) =>
          n.and(n.eq(n.rootKind, root), n.eq(n.identifier, variable)),
        ),
      ),
    ),
  );

/**
 * State that an item's reference resolves, or is braced: a braced reference is a string
 * attribute's, and where it names no variable it is a string value, not a reference to one nothing
 * declares (reading R15-k; information model §9.3.4: "if a string appears to be a reference to a
 * template or outcome variable but there is no variable with the given name it should be treated
 * simply as string value"). A numeric attribute's stand-in is bare, and an unresolved one stays
 * refused. A placed reference's root is its assembly's.
 *
 * @param n - The row.
 * @returns The predicate.
 */
const resolvedUnlessBraced = (n: ReferenceNodeRow) =>
  n.or(
    n.ne(n.rootKind, itemKind),
    n.ne(n.resolution, "unresolved"),
    n.eq(VariableReference.at("spelling", n.kind, n.attribute), "braced"),
  );

/**
 * State that a reference by `identifier` to a built-in variable names one its element may: a kind
 * whose `ReferenceDeclaration` admits the built-in's declaration kind ({@link builtInReferrers}),
 * so a reference to a built-in is judged under "Variable kind" as a declared one is.
 *
 * @param n - The row.
 * @returns The predicate.
 */
const namesAllowedBuiltIn = (n: ReferenceNodeRow) =>
  n.or(
    n.ne(n.attribute, "identifier"),
    n.ne(n.resolution, "builtIn"),
    ...builtInReferrers.map(({ kinds, root, variable }) =>
      n.and(n.eq(n.rootKind, root), n.eq(n.identifier, variable), n.in(n.kind, kinds)),
    ),
  );

/**
 * State a content reference's resolution: an own reference that names no built-in variable of its
 * root names a declaration of its document of a kind `ContentReference` lets it name, and a placed
 * one a declaration of its assembly's item, whatever the declaration's cardinality spells (spec
 * reading `binding-by-name`). A name no such declaration holds is refused under the reference's
 * law.
 *
 * @param reference - The content reference.
 * @returns The law's statements.
 */
const referableLaws = ({ own, placed }: ContentReferenceOf) => [
  contained(
    on(select(own, namesNoBuiltIn), "package", "path", "identifier", "kind", "attribute"),
    on(ReferableName, "package", "path", "identifier", "kind", "attribute"),
  ),
  contained(
    on(select(placed, namesNoBuiltIn), "package", "assembly", "identifier", "kind", "attribute"),
    on(ReferableName, "package", "path", "identifier", "kind", "attribute"),
  ),
];

/**
 * The references' rules over their resolutions, each named by its oracle law:
 *
 * - **the content references** ("Feedback reference", "Template reference", "Printed variable
 *   reference", "Context variable reference"): each one that names no built-in of its root names a
 *   declaration it may name, in its document or, placed, its assembly's item;
 * - **Binding declared** (reading `response-identifier-declared`): each binding, an item's own and a
 *   placed one, names a response declaration of its item;
 * - **Feedback outcome type** (reading `feedback-and-printed-variable-names`): a feedback's outcome,
 *   where it has a cardinality, is single or multiple, and where it has a base type, `identifier`;
 *   **Template variable type** (reading R15-l, decision 432) the same of a template reference's
 *   variable but a `qti-template-variable`'s;
 * - **E1 derived**: a variable reference's form is its split put back together, a name between
 *   whitespace or braces (`#pantry/qti/expressions.ts`), braced exactly where its element's kind
 *   spells its attribute's references braced (`VariableReference`), and its element's language is
 *   its expression's, or its rule's ({@link VariableRefNode}, the reference beside its element's
 *   kind and its attribute's form, which no row copies); each placement resolves exactly its
 *   documents' references, each once (spec reading `fragment-placement`,
 *   {@link PlacedReferenceSite}); a placed reference that stands for a declaration is typed as it
 *   ({@link PlacedVariableDeclaration}), its base type `unknown` where the declaration has none and
 *   else its `valueBase` (a base other than `unknown` names a declaration that has one, a
 *   containment into its name view, and a declaration that has one gives its image, a check over
 *   their join), and its cardinality its declaration's `ValueCardinalityOf` image where it has one;
 *   and an element that reads a variable as its own value is typed as it there, a weighted one
 *   promoted ({@link WeightedRead}). A declaration's `base-type` is optional (spec reading
 *   `unspelled-declaration`), so a base type `unknown` is a case of its own; its `cardinality` is
 *   required, so one with none is AL3's or its value domain's alone;
 * - **Lookup type** and **Mapped response**: a placed reference names no built-in it may not, a
 *   lookup no built-in outcome, which has no declaration and no table (spec reading
 *   `lookup-outcome-table`), and a map no built-in response, which declares no table (reading
 *   `test-prefixed-response-reads`); and a declared map response maps a response, and a map
 *   response point a response of points (§2.11.3.29, §2.11.3.30); the tables they read are their
 *   declarations' (`#pantry/qti/overlay-queries/declaration.ts`);
 * - **Reference type**, **Template reads** and **Variable kind**: a placed reference's built-in, one
 *   its element may name by `identifier`, a template expression's the context alone, and a declared
 *   placed reference's base type, cardinality and declaration kind, as its element reads it;
 * - **Variable declared**: a declared placed reference names a declaration of its assembly's root, by
 *   the key "Declaration key" holds (spec reading `binding-by-name`), and an item's unresolved
 *   placed reference is braced, a string value (reading R15-k), its own and a fragment's and a
 *   located template's alike (§4.6.1, §6.9.40).
 */
export const referenceOverlayLawsByName = {
  ...pipe(
    contentReferences,
    Rec.map((reference, name) => declared(name, referableLaws(reference))),
  ),
  "Binding declared": declared("Binding declared", [
    contained(
      on(BoundVariable, "package", "path", "identifier"),
      on(responseNames, "package", "path", "identifier"),
    ),
    contained(
      on(PlacedBinding, "package", "assembly", "identifier"),
      on(responseNames, "package", "path", "identifier"),
    ),
  ]),
  "E1 derived": declared("E1 derived", [
    check("E1_derived", VariableRefNode, (n) =>
      n.and(
        n.eq(
          n.lexical,
          Text.concat(
            Text.concat(Type.base(n.before), Type.base(n.identifier)),
            Type.base(n.after),
          ),
        ),
        n.or(
          n.and(
            n.eq(VariableReference.at("spelling", n.kind, n.attribute), "bare"),
            n.ne(n.before, "{"),
          ),
          n.and(
            n.eq(VariableReference.at("spelling", n.kind, n.attribute), "braced"),
            n.eq(n.before, "{"),
          ),
        ),
      ),
    ),
    contained(
      on(
        select(VariableRefNode, (n) => n.in(n.kind, expressionKinds)),
        "package",
        "path",
        "start",
        "language",
      ),
      on(Expression, "package", "path", "start", "language"),
    ),
    contained(
      on(
        select(VariableRefNode, (n) => n.in(n.kind, ruleKindHandles)),
        "package",
        "path",
        "start",
        "language",
      ),
      on(Processing, "package", "path", "start", "language"),
    ),
    mirrors(
      on(
        PlacedVariableRef,
        "package",
        "assembly",
        "instance",
        "path",
        "start",
        "attribute",
        "identifier",
      ),
      on(
        PlacedReferenceSite,
        "package",
        "assembly",
        "instance",
        "path",
        "start",
        "attribute",
        "identifier",
      ),
    ),
    contained(
      on(
        select(PlacedVariableDeclaration, (d) => d.ne(d.baseType, "unknown")),
        "package",
        "declPath",
        "declStart",
      ),
      on(TypedDeclarationName, "package", "path", "start"),
    ),
    check("E1_derived", PlacedVariableBase, (b) => b.eq(b.baseType, b.valueBase)),
    check("E1_derived", PlacedVariableCardinality, (c) =>
      c.eq(c.cardinality, ValueCardinalityOf.at("value", c.declCardinality)),
    ),
    check("E1_derived", UnweightedRead, (n) =>
      n.and(n.eq(n.elementBase, n.baseType), n.eq(n.elementCardinality, n.cardinality)),
    ),
    check("E1_derived", WeightedRead, (n) =>
      n.and(
        n.or(
          n.and(n.eq(n.baseType, "integer"), n.eq(n.elementBase, "float")),
          n.and(n.ne(n.baseType, "integer"), n.eq(n.elementBase, n.baseType)),
        ),
        n.eq(n.elementCardinality, n.cardinality),
      ),
    ),
  ]),
  "Feedback outcome type": declared("Feedback outcome type", [
    check("Feedback_outcome_type", FeedbackRefCardinality, (f) =>
      f.in(f.cardinality, feedbackCardinalities),
    ),
    check("Feedback_outcome_type", FeedbackRefBaseType, (f) => f.eq(f.baseType, "identifier")),
  ]),
  "Lookup type": declared("Lookup type", [
    check("Lookup_type", PlacedVariableRefNode, looksUpNoBuiltIn),
  ]),
  "Mapped response": declared("Mapped response", [
    check("Mapped_response", PlacedVariableRefNode, mapsNoBuiltIn),
    check("Mapped_response", PlacedVariableRefDeclaration, (d) =>
      d.or(
        d.ne(d.attribute, "identifier"),
        d.not(d.in(d.kind, mappedKinds)),
        d.and(
          d.eq(d.declarationKind, "qti-response-declaration"),
          d.or(d.ne(d.kind, "qti-map-response-point"), d.in(d.baseType, ["point", ...silentBases])),
        ),
      ),
    ),
  ]),
  "Reference type": declared("Reference type", [
    check("Reference_type", PlacedVariableRefDeclaration, (d) =>
      d.or(
        d.eq(d.attribute, "identifier"),
        d.and(
          d.or(
            d.in(d.declarationKind, ["qti-outcome-declaration", "qti-template-declaration"]),
            ...anyKindStandIns.map(({ attribute, kind }) =>
              d.and(d.eq(d.kind, kind), d.eq(d.attribute, attribute)),
            ),
          ),
          d.or(
            d.eq(d.baseType, ReferenceBase.at("base", d.kind, d.attribute)),
            d.in(d.baseType, silentBases),
          ),
          d.in(d.cardinality, ["single", "unknown"]),
        ),
      ),
    ),
  ]),
  "Template reads": declared("Template reads", [
    check("Template_reads", PlacedVariableRefNode, (n) =>
      n.or(
        n.ne(n.language, "template"),
        n.not(n.in(n.kind, expressionKinds)),
        n.ne(n.resolution, "builtIn"),
        n.eq(n.identifier, "QTI_CONTEXT"),
      ),
    ),
    check("Template_reads", PlacedVariableRefDeclaration, (d) =>
      d.or(
        d.ne(d.language, "template"),
        d.not(d.in(d.kind, expressionKinds)),
        d.not(d.in(d.declarationKind, ["qti-outcome-declaration", "qti-response-declaration"])),
      ),
    ),
  ]),
  "Template variable type": declared("Template variable type", [
    check("Template_variable_type", TemplateRefCardinality, (t) =>
      t.or(t.eq(t.kind, templateVariableKind), t.in(t.cardinality, feedbackCardinalities)),
    ),
    check("Template_variable_type", TemplateRefBaseType, (t) =>
      t.or(t.eq(t.kind, templateVariableKind), t.eq(t.baseType, "identifier")),
    ),
  ]),
  "Variable declared": declared("Variable declared", [
    contained(
      on(
        select(PlacedVariableRef, (ref) => ref.eq(ref.resolution, "declared")),
        "package",
        "assembly",
        "identifier",
      ),
      on(NamedDeclaration, "package", "path", "identifier"),
    ),
    check("Variable_declared", PlacedVariableRefNode, resolvedUnlessBraced),
  ]),
  "Variable kind": declared("Variable kind", [
    check("Variable_kind", PlacedVariableRefNode, namesAllowedBuiltIn),
    contained(
      on(
        select(PlacedVariableRefDeclaration, (d) => d.eq(d.attribute, "identifier")),
        "kind",
        "attribute",
        "declarationKind",
      ),
      on(ReferenceDeclaration, "kind", "attribute", "declaration"),
    ),
  ]),
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const referenceOverlayRelations = [
  FeedbackRefBaseType,
  FeedbackRefCardinality,
  PlacedReferenceSite,
  PlacedVariableBase,
  PlacedVariableCardinality,
  PlacedVariableDeclaration,
  PlacedVariableRefDeclaration,
  ReferableName,
  TemplateRefBaseType,
  TemplateRefCardinality,
  UnweightedRead,
  WeightedRead,
] as const;

/**
 * The rules of this module, {@link referenceOverlayLawsByName} flattened.
 */
export const referenceOverlayLaws = Object.values(referenceOverlayLawsByName).flat();
