/**
 * The references' resolutions by name (decision S3: no copies): a binding, a content reference and
 * a variable reference each name a declaration by its identifier, and resolve to it in their
 * document's declarations, or, under a placement, in their assembly's item's, whatever the
 * declaration's cardinality spells (spec reading 159). No row holds the resolution: each law that
 * reads it matches the reference with a name view of `QtiViews` (`#pantry/qti/names.ts`, the one
 * definition of what a name names) by `(package, path, identifier)`, the key "Declaration key"
 * holds, a rule over a query here, under the law's own name (`#pantry/qti/interactions.ts`,
 * `#pantry/qti/expressions.ts`).
 */
import type { RelationName, RowScalars } from "@bjornpagen/grizzle";
import { check, Compute, contained, derived, on, query, select, v } from "@bjornpagen/grizzle";
import { pipe, Record as Rec } from "effect";
import { ContentReference, VariableReference } from "#pantry/grammar/install.ts";
import {
  declaredKinds,
  lookupKindHandle,
  ReferenceBase,
  ReferenceDeclaration,
  TableReader,
  ValueCardinalityOf,
} from "#pantry/qti/expression-types.ts";
import {
  builtInReferrers,
  builtInResponses,
  Expression,
  mappedKinds,
  PlacedVariableRef,
  Processing,
  silentBases,
  VariableRef,
  VariableRefTable,
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
import { expressionKinds, ruleKindHandles } from "#pantry/vocab/terms/expression-types.ts";
import { itemKind } from "#pantry/vocab/terms/tests.ts";

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
 * one of these (reading 75), its item's.
 */
const responseNames = select(NamedDeclaration, (d) =>
  d.eq(d.declarationKind, "qti-response-declaration"),
);

/**
 * Each content reference's variable beside its cardinality, by the reference's place and
 * attribute, with the reference's kind, where the variable is a declaration the reference may name
 * and has a cardinality: an own reference's in its document, and an included fragment's, under
 * each placement, in its item's, each matched with {@link DeclarationName} by its name. A variable
 * whose cardinality is unwritten or spells nothing gives its reference none, so no law reads a
 * cardinality it does not have, and AL3 or its value domain refuses it alone (spec reading 158).
 * The content references' type laws read it: "Feedback outcome type" and "Template variable type"
 * here, and "Printed variable type" (`#pantry/qti/queries.ts`).
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
 * The declaration a declared {@link VariableRef} names, keyed as the reference: the reference's
 * fields its laws read, its element's kind among them ({@link VariableRefNode}), and its
 * {@link NamedDeclaration}'s `start` as `declaration` and kind, whatever the declaration's
 * cardinality spells (spec reading 159). A reference that names a built-in variable or nothing is
 * no `declared` one, and has none (lane NIL's NS1).
 */
const VariableRefDeclaration = derived(
  "VariableRefDeclaration",
  query(QtiViews).rule((r) => {
    const {
      attribute,
      baseType,
      cardinality,
      identifier,
      kind,
      language,
      package: pkg,
      path,
      start,
    } = v(VariableRefNode, "reference");
    const { declarationKind, start: declaration } = v(NamedDeclaration, "name");

    return r
      .match(VariableRefNode, {
        attribute,
        baseType,
        cardinality,
        identifier,
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
        path,
        start: declaration,
      })
      .find({
        attribute,
        baseType,
        cardinality,
        declaration,
        declarationKind,
        identifier,
        kind,
        language,
        package: pkg,
        path,
        start,
      });
  }),
);

/**
 * A declared {@link VariableRef}'s cardinality beside its declaration's, keyed as the reference,
 * where the declaration has one (spec reading 159): `cardinality`, the reference's type's, and
 * `declCardinality`, its {@link DeclarationName}'s, whose `ValueCardinalityOf` image "E1 derived"
 * holds the first to. A reference to a declaration whose cardinality is unwritten or spells nothing
 * has none, and no rule reads its type's cardinality: `cardinality` is required and enumerated on
 * every declaration kind, so AL3 or its value domain has refused the declaration (spec reading
 * 158).
 */
const VariableRefCardinality = derived(
  "VariableRefCardinality",
  query(QtiViews).rule((r) => {
    const { attribute, cardinality, identifier, package: pkg, path, start } = v(VariableRef, "ref");
    const { cardinality: declCardinality } = v(DeclarationName, "name");

    return r
      .match(VariableRef, {
        attribute,
        cardinality,
        identifier,
        package: pkg,
        path,
        resolution: "declared",
        start,
      })
      .match(DeclarationName, { cardinality: declCardinality, identifier, package: pkg, path })
      .find({ attribute, cardinality, declCardinality, package: pkg, path, start });
  }),
);

/**
 * A declared {@link VariableRef}'s base type beside its declaration's, keyed as the reference,
 * where the declaration has one: `baseType`, the reference's type's, and `valueBase`, its
 * {@link TypedDeclarationName}'s, the declaration's base type as an expression's type, which "E1
 * derived" holds the first to. A reference to a declaration with no base type has none, and its
 * type's base type is `unknown` (spec reading 158), a record's among them.
 */
const VariableRefBaseType = derived(
  "VariableRefBaseType",
  query(QtiViews).rule((r) => {
    const { attribute, baseType, identifier, package: pkg, path, start } = v(VariableRef, "ref");
    const { valueBase } = v(TypedDeclarationName, "name");

    return r
      .match(VariableRef, {
        attribute,
        baseType,
        identifier,
        package: pkg,
        path,
        resolution: "declared",
        start,
      })
      .match(TypedDeclarationName, { identifier, package: pkg, path, valueBase })
      .find({ attribute, baseType, package: pkg, path, start, valueBase });
  }),
);

/**
 * The declaration a declared placed reference (`PlacedVariableRef`) names among its assembly's
 * item's declarations, keyed as the placed reference: its `assembly` as the declaration's document,
 * `declaration` its {@link NamedDeclaration}'s `start` there, and its kind, whatever its cardinality
 * spells (spec reading 159), beside the reference's element's `kind` ({@link
 * PlacedVariableRefNode}) and its `attribute`.
 */
const PlacedVariableRefDeclaration = derived(
  "PlacedVariableRefDeclaration",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      instance,
      kind,
      package: pkg,
      path,
      start,
    } = v(PlacedVariableRefNode, "placed");
    const { declarationKind, start: declaration } = v(NamedDeclaration, "name");

    return r
      .match(PlacedVariableRefNode, {
        assembly,
        attribute,
        identifier,
        instance,
        kind,
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
        declaration,
        declarationKind,
        identifier,
        instance,
        kind,
        package: pkg,
        path,
        start,
      });
  }),
);

/**
 * Each table a declared {@link VariableRef} claims of its declaration, keyed as the reference: its
 * {@link VariableRefTable}'s `table`, the reference's element's `kind` ({@link VariableRefNode}),
 * and its declaration's `start`, its
 * {@link NamedDeclaration}'s. "E1 derived" holds each claim to a table its kind reads
 * (`TableReader`) and its declaration holds (`#pantry/qti/overlay-queries/declaration.ts`).
 */
const TableClaim = derived(
  "TableClaim",
  query(QtiViews).rule((r) => {
    const { attribute, package: pkg, path, start, table } = v(VariableRefTable, "claim");
    const { identifier, kind } = v(VariableRefNode, "reference");
    const { start: declaration } = v(NamedDeclaration, "name");

    return r
      .match(VariableRefTable, { attribute, package: pkg, path, start, table })
      .match(VariableRefNode, { attribute, identifier, kind, package: pkg, path, start })
      .match(NamedDeclaration, { identifier, package: pkg, path, start: declaration })
      .find({ attribute, declaration, kind, package: pkg, path, start, table });
  }),
);

/**
 * The table claims of one table: a map response's mapping, a map response point's area mapping, and
 * a lookup's match or interpolation table. Each claim is a containment into the declaration's table
 * of that kind, a child of the declaration's node (`#pantry/qti/overlay-queries/declaration.ts`):
 * a declaration that holds no such table has none, so no reference claims it, and a map response,
 * a map response point or a lookup that claims no table is refused by `Mapped_response` or
 * `Lookup_type`.
 *
 * @param table - The table claimed.
 * @returns The selection.
 */
export const tableClaims = (table: (typeof TableReader.rows)[number]["table"]) =>
  select(TableClaim, (t) => t.eq(t.table, table));

/**
 * An item's placed references by a table reader's `identifier` that resolve to a declaration among
 * its item's declarations: the {@link PlacedVariableRefDeclaration} of a `qti-map-response`'s or a
 * `qti-map-response-point`'s `identifier`, under every instance of the item's assembly. A reference
 * in an included response rules fragment names nothing in the fragment's own document, so its only
 * declaration is its item's, where "the content of the fragment must satisfy the requirements of
 * the specification in the context of the item in which it is being included" (spec reading 117).
 * Each reads its declaration's mapping or area mapping (reading 166), a containment into the
 * declaration's table of that kind, a child of its node
 * (`#pantry/qti/overlay-queries/declaration.ts`). It keeps every declaration kind: one that names
 * an outcome finds no mapping and breaks the law, as the in-place check refuses it. The item's own
 * document is an instance too, so an inline map response is held twice, here and by the in-place
 * check over {@link VariableRefDeclaration}, under the one law.
 *
 * @param kind - The reader's kind.
 * @returns The selection.
 */
export const placedTableReaders = (kind: (typeof mappedKinds)[number]) =>
  select(PlacedVariableRefDeclaration, (d) =>
    d.and(d.eq(d.kind, kind), d.eq(d.attribute, "identifier")),
  );

/**
 * A reference beside its element's kind, or a placed one ({@link VariableRefNode},
 * {@link PlacedVariableRefNode}), as a rule over its view reads it.
 */
type ReferenceNodeRow =
  | RowScalars<typeof PlacedVariableRefNode>
  | RowScalars<typeof VariableRefNode>;

/**
 * State that a lookup by `identifier` names no built-in variable: a lookup names an outcome whose
 * declaration holds a lookup table (§5.87), so a lookup of a built-in outcome, which has no
 * declaration and no table, is refused (spec reading 197; the built-in `completionStatus` "must
 * not appear in an outcome declaration", §2.2.2.3).
 *
 * @param n - The row, a reference or a placed one.
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
 * @param n - The row, a reference or a placed one.
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
 * refused. A placed reference's root is its assembly's, an item's.
 *
 * @param n - The row, a reference or a placed one.
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
 * @param n - The row, a reference or a placed one.
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
 * reading 159). A name no such declaration holds is refused under the reference's law.
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
 * - **Binding declared** (reading 75): each binding, an item's own and a placed one, names a response
 *   declaration of its item;
 * - **Feedback outcome type** (reading 77): a feedback's outcome, where it has a cardinality, is
 *   single or multiple, and where it has a base type, `identifier`; **Template variable type**
 *   (reading R15-l, decision 432) the same of a template reference's variable but a
 *   `qti-template-variable`'s;
 * - **E1 derived**: a variable reference spells its attribute's form, bare or braced as its element's
 *   kind spells the attribute, and its element's language and type are its element's
 *   ({@link VariableRefNode}, the reference beside its element's kind and its attribute's form,
 *   which no row copies); a declared variable reference's type is its declaration's, its base type
 *   `unknown` where the declaration has none and else its `valueBase` (a base other than `unknown`
 *   names a declaration that has one, a containment into its name view, and a declaration that has
 *   one gives its image, a check over their join), and its cardinality its declaration's
 *   `ValueCardinalityOf` image where it has one; and each table claim is of a table its kind reads.
 *   A declaration's `base-type` is optional (spec reading 158), so a base type `unknown` is a case
 *   of its own; its `cardinality` is required, so one with none is AL3's or its value domain's
 *   alone;
 * - **Lookup type** and **Mapped response**: a reference, or a placed one
 *   ({@link PlacedVariableRefNode}), names no built-in it may not; a declared lookup, map response
 *   and map response point claim their declaration's table, and a map response or map response
 *   point names a response, a map response point's of base type point;
 * - **Reference type**, **Template reads** and **Variable kind**: a reference's built-in, a template
 *   expression's the context alone, and a declared reference's base type, cardinality and
 *   declaration kind, as its element reads it;
 * - **Variable declared**: a declared reference names a declaration of its document, a placed one of
 *   its assembly's item, by the key "Declaration key" holds (spec reading 159), and an item's
 *   unresolved reference, or a placed one, is braced, a string value (reading R15-k).
 */
export const referenceOverlayLawsByName = {
  ...pipe(contentReferences, Rec.map(referableLaws)),
  "Binding declared": [
    contained(
      on(BoundVariable, "package", "path", "identifier"),
      on(responseNames, "package", "path", "identifier"),
    ),
    contained(
      on(PlacedBinding, "package", "assembly", "identifier"),
      on(responseNames, "package", "path", "identifier"),
    ),
  ],
  "E1 derived": [
    // A reference's form is its split put back together, braced exactly where its element's kind
    // spells its attribute's references braced (`VariableReference`), the split a name between
    // whitespace or braces (`#pantry/qti/expressions.ts`); and an element that reads a declared
    // variable as its own value is typed as it.
    check("E1_derived", VariableRefNode, (n) =>
      n.and(
        n.eq(
          n.lexical,
          Compute.concat(
            Compute.concat(Compute.base(n.before), Compute.base(n.identifier)),
            Compute.base(n.after),
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
        n.or(
          n.ne(n.attribute, "identifier"),
          n.not(n.in(n.kind, declaredKinds)),
          n.and(n.eq(n.elementBase, n.baseType), n.eq(n.elementCardinality, n.cardinality)),
        ),
      ),
    ),
    // Its element's language and type are its expression's, or its rule's language.
    contained(
      on(
        select(VariableRefNode, (n) => n.in(n.kind, expressionKinds)),
        "package",
        "path",
        "start",
        "language",
        "elementBase",
        "elementCardinality",
      ),
      on(Expression, "package", "path", "start", "language", "baseType", "cardinality"),
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
    contained(
      on(
        select(VariableRefDeclaration, (d) => d.ne(d.baseType, "unknown")),
        "package",
        "path",
        "identifier",
      ),
      on(TypedDeclarationName, "package", "path", "identifier"),
    ),
    check("E1_derived", VariableRefBaseType, (b) => b.eq(b.baseType, b.valueBase)),
    check("E1_derived", VariableRefCardinality, (c) =>
      c.eq(c.cardinality, ValueCardinalityOf.at("value", c.declCardinality)),
    ),
    contained(on(TableClaim, "kind", "table"), on(TableReader, "kind", "table")),
  ],
  "Feedback outcome type": [
    check("Feedback_outcome_type", FeedbackRefCardinality, (f) =>
      f.in(f.cardinality, feedbackCardinalities),
    ),
    check("Feedback_outcome_type", FeedbackRefBaseType, (f) => f.eq(f.baseType, "identifier")),
  ],
  "Lookup type": [
    // A lookup names no built-in outcome, which has no declaration and no table (spec reading
    // 197), a reference or a placed one.
    check("Lookup_type", VariableRefNode, looksUpNoBuiltIn),
    check("Lookup_type", PlacedVariableRefNode, looksUpNoBuiltIn),
    // A declared lookup claims its declaration's lookup table, a match or an interpolation table
    // (§2.5.1.4), and one whose declaration holds none has no claim to make.
    contained(
      on(
        select(VariableRefDeclaration, (d) =>
          d.and(d.eq(d.attribute, "identifier"), d.eq(d.kind, lookupKindHandle)),
        ),
        "package",
        "path",
        "start",
        "attribute",
      ),
      on(VariableRefTable, "package", "path", "start", "attribute"),
    ),
  ],
  "Mapped response": [
    // A reference, or a placed one, never names a built-in response, which declares no table
    // (reading 166).
    check("Mapped_response", VariableRefNode, mapsNoBuiltIn),
    check("Mapped_response", PlacedVariableRefNode, mapsNoBuiltIn),
    // A declared map response claims its response's mapping, and a map response point its area
    // mapping of points (§2.11.3.29, §2.11.3.30): its kind reads that table alone (TableReader).
    check("Mapped_response", VariableRefDeclaration, (d) =>
      d.or(
        d.ne(d.attribute, "identifier"),
        d.not(d.in(d.kind, mappedKinds)),
        d.and(
          d.eq(d.declarationKind, "qti-response-declaration"),
          d.or(d.ne(d.kind, "qti-map-response-point"), d.in(d.baseType, ["point", ...silentBases])),
        ),
      ),
    ),
    contained(
      on(
        select(VariableRefDeclaration, (d) =>
          d.and(d.eq(d.attribute, "identifier"), d.in(d.kind, mappedKinds)),
        ),
        "package",
        "path",
        "start",
        "attribute",
      ),
      on(VariableRefTable, "package", "path", "start", "attribute"),
    ),
  ],
  "Reference type": [
    check("Reference_type", VariableRefDeclaration, (d) =>
      d.or(
        d.eq(d.attribute, "identifier"),
        d.and(
          d.in(d.declarationKind, ["qti-outcome-declaration", "qti-template-declaration"]),
          d.or(
            d.eq(d.baseType, ReferenceBase.at("base", d.kind, d.attribute)),
            d.in(d.baseType, silentBases),
          ),
          d.in(d.cardinality, ["single", "unknown"]),
        ),
      ),
    ),
  ],
  "Template reads": [
    // A template expression reads no built-in variable but the context.
    check("Template_reads", VariableRefNode, (n) =>
      n.or(
        n.ne(n.language, "template"),
        n.not(n.in(n.kind, expressionKinds)),
        n.ne(n.resolution, "builtIn"),
        n.eq(n.identifier, "QTI_CONTEXT"),
      ),
    ),
    check("Template_reads", VariableRefDeclaration, (d) =>
      d.or(
        d.ne(d.language, "template"),
        d.not(d.in(d.kind, expressionKinds)),
        d.not(d.in(d.declarationKind, ["qti-outcome-declaration", "qti-response-declaration"])),
      ),
    ),
  ],
  "Template variable type": [
    check("Template_variable_type", TemplateRefCardinality, (t) =>
      t.or(t.eq(t.kind, templateVariableKind), t.in(t.cardinality, feedbackCardinalities)),
    ),
    check("Template_variable_type", TemplateRefBaseType, (t) =>
      t.or(t.eq(t.kind, templateVariableKind), t.eq(t.baseType, "identifier")),
    ),
  ],
  "Variable declared": [
    contained(
      on(
        select(VariableRef, (ref) => ref.eq(ref.resolution, "declared")),
        "package",
        "path",
        "identifier",
      ),
      on(NamedDeclaration, "package", "path", "identifier"),
    ),
    contained(
      on(
        select(PlacedVariableRef, (ref) => ref.eq(ref.resolution, "declared")),
        "package",
        "assembly",
        "identifier",
      ),
      on(NamedDeclaration, "package", "path", "identifier"),
    ),
    // An item's unresolved reference, or a placed one, is braced, a string value (reading R15-k).
    check("Variable_declared", VariableRefNode, resolvedUnlessBraced),
    check("Variable_declared", PlacedVariableRefNode, resolvedUnlessBraced),
  ],
  "Variable kind": [
    // A reference, or a placed one, by `identifier` to a built-in names one its element may.
    check("Variable_kind", VariableRefNode, namesAllowedBuiltIn),
    check("Variable_kind", PlacedVariableRefNode, namesAllowedBuiltIn),
    contained(
      on(
        select(VariableRefDeclaration, (d) => d.eq(d.attribute, "identifier")),
        "kind",
        "attribute",
        "declarationKind",
      ),
      on(ReferenceDeclaration, "kind", "attribute", "declaration"),
    ),
    contained(
      on(
        select(PlacedVariableRefDeclaration, (d) => d.eq(d.attribute, "identifier")),
        "kind",
        "attribute",
        "declarationKind",
      ),
      on(ReferenceDeclaration, "kind", "attribute", "declaration"),
    ),
  ],
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const referenceOverlayRelations = [
  FeedbackRefBaseType,
  FeedbackRefCardinality,
  PlacedVariableRefDeclaration,
  ReferableName,
  TableClaim,
  TemplateRefBaseType,
  TemplateRefCardinality,
  VariableRefBaseType,
  VariableRefCardinality,
  VariableRefDeclaration,
] as const;

/**
 * The rules of this module, {@link referenceOverlayLawsByName} flattened.
 */
export const referenceOverlayLaws = Object.values(referenceOverlayLawsByName).flat();
