/**
 * Expressions and processing as laws (plan §1.7 O4, D5; the W5 amendment's C1, C16, C17, C18 and
 * C22; the orchestrator's rulings for Q5.10 of 2026-11-06): the typing the old processing checker
 * did on the host, stated over overlay rows PostgreSQL judges.
 *
 * Every overlay row is keyed by its element's place, `(package, path, start)`: its package's name,
 * its document's path and the element's pre-order position there, the key `Node` holds it by (or by
 * that place and an attribute's name), and holds only its own facts (decision S3): its node's kind,
 * parent and parent's kind are `Node`'s, and every law that pairs them with an overlay's fact is a
 * rule over a query (`#pantry/qti/overlay-queries/expression.ts`). Its existence follows from
 * `Node` or `Attribute` by containment, so no element escapes its laws. A link to another element
 * of the same document (a parent, an operator, a declaration) is that element's `start` alone, in
 * the row's own package and path; a link to an element of another document of the package is that
 * document's path beside the element's `start` (`itemDocument` and `declaration`, `namedDocument`
 * and `named`), and an assembly is named by its head document's path, `assembly`, an instance by
 * its place in that assembly's instance tree.
 *
 * - **{@link Expression}**, one row per expression element, typed with the expression-typing codes of
 *   `#pantry/qti/expression-types.ts`, with its type as one-bit sets. Its operands (C16) are the
 *   expressions whose node's parent is its node, each ranked by its node's element rank, 1 to n:
 *   the derived `OperandOf`, which every operand law reads
 *   (`#pantry/qti/overlay-queries/expression.ts`), so no row stores an operator's count or its
 *   operands' types.
 * - **{@link Processing}**, one row per rule and processing element, carries the processing language
 *   from its root down; each expression takes its parent's.
 * - **{@link VariableRef}**, one row per variable reference a processing element makes, resolves it
 *   to a declaration of its document, its `NamedDeclaration` of the name, whatever the
 *   declaration's cardinality spells (spec reading 159), a built-in variable (the installed
 *   `BuiltInVariable`, A63), or nothing, which only a document that is no item may hold; a
 *   reference to a name its document declares resolves to it (`DeclaredReference` of
 *   `#pantry/qti/queries.ts`). Every law over the declaration a reference names, its kind,
 *   cardinality or base type, joins the reference to it by its name, a rule over a query
 *   (`#pantry/qti/overlay-queries/reference.ts`). The table it claims of its declaration is a row
 *   of its own, {@link VariableRefTable}, where it claims one, proved by the declaration's table of
 *   that kind, a child of its node, through a rule over a query
 *   (`#pantry/qti/overlay-queries/declaration.ts`). The type a setter or a lookup sets its variable
 *   to is a query, `HeldType`. Each reference an included fragment makes is placed once per
 *   instance of its item's assembly ({@link PlacedVariableRef}) and resolved among the item's
 *   declarations (spec reading 117). Its element's kind and its attribute's lexical form are the
 *   attribute's, which no row copies (C18): every law that reads them is a rule over the view
 *   `VariableRefNode` (`#pantry/qti/names.ts`), the reference beside them.
 * - **{@link Literal}** carries a base value's text. The attributes an expression's type follows from
 *   (`base-type`, `name`) are read where they are written, through the query `ExpressionAttribute`
 *   (`#pantry/qti/queries.ts`), which no row copies.
 *
 * The laws, each named by its oracle law with spaces written as underscores, and the rule each
 * keeps: `Arity` (P2); `Operand_fit` and `One_base` (P23); `Condition_type` (P21); `Set_type`
 * (P20); `Lookup_type` (P22); `Reference_type` (P24); `Outcome_only` (P25); `Template_reads` (P26);
 * `Mapped_response` (P27); `Variable_declared` (P8, over an item's names, a braced `pattern` that
 * names none a string value, reading R15-k); `Literal_lexical` (attribute-lexical); and
 * `E1_derived`, every code the host writes proved from what it is derived from, among them each
 * expression's result type. The old guards P31 (every operand edge has its operand row) and P32 (a
 * copy agrees with its source) hold by construction: the operand rows' existence and every copy are
 * containments.
 */
import {
  bits,
  check,
  closedId,
  Compute,
  contained,
  counted,
  fin,
  generated,
  natural,
  on,
  relation,
  select,
  str,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import { Array as Arr, Option } from "effect";
import { ncNamePattern } from "#pantry/grammar/domains.ts";
import {
  AttributeName,
  BaseType,
  builtInBaseTypes,
  BuiltInVariable,
  NodeKind,
  VariableReference,
} from "#pantry/grammar/install.ts";
import { Attribute, namingPattern } from "#pantry/qti/attributes.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { namePattern } from "#pantry/qti/declarations.ts";
import {
  BaseTypePattern,
  Language,
  LeadCardinality,
  OperandBase,
  ReferenceBase,
  ReferenceDeclaration,
  ReferencedTable,
  TableReader,
  ReferenceResolution,
  ResultBase,
  ResultCardinality,
  TailCardinality,
  ValueBase,
  ValueBaseBit,
  ValueBaseOf,
  ValueCardinality,
  ValueCardinalityBit,
  ValueCardinalityOf,
} from "#pantry/qti/expression-types.ts";
import { EntryPath, keyText, PackageName } from "#pantry/qti/limits.ts";
import { Node } from "#pantry/qti/node.ts";
import { Instance } from "#pantry/qti/tests.ts";
import { spacePattern } from "#pantry/qti/token-list.ts";
import {
  expressionKinds,
  processingReferences,
  referenceDeclarations,
  ruleKindHandles,
  valueBaseOf,
  valueCardinalityOf,
} from "#pantry/vocab/terms/expression-types.ts";

/**
 * What a reference's lexical form holds around the name it spells: XML whitespace `S`, possibly
 * none, which a collapsing type absorbs, or one brace of a braced reference. Exported for
 * `src/import/refusal.ts`, which names its pattern law.
 */
export const Affix = str.regex("^(?:[\\t\\n\\r ]*|\\{|\\})$");

/**
 * One expression element, keyed by its place: the processing language it is written in, the type
 * the host gives its value, and its operands. Its kind, parent and parent's kind are its node's,
 * which the rules over the query `ExpressionNode` read
 * (`#pantry/qti/overlay-queries/expression.ts`).
 *
 * - **the host's:** `language`, `baseType` and `cardinality`, each proved: the language by its
 *   parent's row, the type by `E1_derived`, `ResultBase` and `ResultCardinality`;
 * - **generated:** `baseTypeBit` and `cardinalityBit`, its type as one-bit sets (C6), which the
 *   operand laws compare by subset: ∅ exactly for `qti-null`'s `any` base type and for an `unknown`
 *   cardinality.
 */
export const Expression = relation.generated(
  "Expression",
  {
    baseType: closedId(ValueBase),
    cardinality: closedId(ValueCardinality),
    language: closedId(Language),
    package: PackageName,
    path: EntryPath,
    start: natural,
  },
  ["package", "path", "start"],
  (r) => ({
    baseTypeBit: generated(bits(ValueBase), ValueBaseBit.row(r.baseType)),
    cardinalityBit: generated(bits(ValueCardinality), ValueCardinalityBit.row(r.cardinality)),
  }),
);

/**
 * One rule or processing element, keyed by its place: the processing language it is written in,
 * which its root opens and every rule below it carries. Its kind, parent and parent's kind are its
 * node's, which the rules over the query `ProcessingNode` read
 * (`#pantry/qti/overlay-queries/expression.ts`).
 */
export const Processing = relation(
  "Processing",
  {
    language: closedId(Language),
    package: PackageName,
    path: EntryPath,
    start: natural,
  },
  ["package", "path", "start"],
);

/**
 * One variable reference a processing element makes, keyed by the element's place and the attribute
 * it makes it by (`VariableReference`'s rows over the processing kinds), and what it names, each
 * field the host's: `before`, `identifier` and `after`, the attribute's lexical form split around
 * the name it spells, the whitespace around a bare name or the braces around a braced one;
 * `language`, `elementBase` and `elementCardinality`, its element's (its {@link Expression} row's
 * for an expression, its {@link Processing} row's language for a rule); `rootKind`, its document's
 * root's; `resolution`; and `baseType` and `cardinality`, the variable's type. Its element's kind
 * and the attribute's lexical form are the attribute's (C18), read beside it through the view
 * `VariableRefNode` (`#pantry/qti/names.ts`) by every law that reads them, and the rule over the
 * view holds the form to the split put back together, `before ‖ identifier ‖ after`, deciding the
 * equation by lengths and substrings, building no text.
 *
 * The declaration a declared reference names is its document's `NamedDeclaration` of its name
 * (`#pantry/qti/names.ts`), which every law that reads it joins
 * (`#pantry/qti/overlay-queries/reference.ts`); the table its element needs that declaration to
 * hold is a row of its own, {@link VariableRefTable}, where it claims one, and the type of a
 * setter's or a lookup's one expression is `HeldType`, a derived relation of
 * `#pantry/qti/queries.ts`. A type field its element leaves unread holds `unknown`.
 *
 * The import writes its rows where its form names something (`namedBy` of
 * `#pantry/import/names.ts`, which lists every such relation), until it is a query over
 * `Attribute`.
 */
export const VariableRef = relation(
  "VariableRef",
  {
    after: Affix,
    attribute: closedId(AttributeName),
    baseType: closedId(ValueBase),
    before: Affix,
    cardinality: closedId(ValueCardinality),
    elementBase: closedId(ValueBase),
    elementCardinality: closedId(ValueCardinality),
    identifier: keyText,
    language: closedId(Language),
    package: PackageName,
    path: EntryPath,
    resolution: closedId(ReferenceResolution),
    rootKind: closedId(NodeKind),
    start: natural,
  },
  ["package", "path", "start", "attribute"],
);

/**
 * The table a declared {@link VariableRef} claims of its declaration, keyed as the reference, where
 * it claims one: a map response's `qti-mapping`, a map response point's `qti-area-mapping`, or a
 * lookup's `qti-match-table` or `qti-interpolation-table` (information model §2.11.3.29,
 * §2.11.3.30 and §2.5.1.4), the one its declaration holds: its kind and its declaration are its
 * reference's, read through a query (`TableClaim`, `#pantry/qti/overlay-queries/reference.ts`).
 * Only a declared reference by `identifier` claims one, of a table its kind reads (`TableReader`),
 * and the declaration holds it: the claim is a containment into the table's own row, keyed by the
 * declaration.
 *
 * A reference that claims no table has no row (AGENTS.md's Schema intent: a value that may be
 * missing is a row of its own relation, never a sentinel). A map response, a map response point or
 * a lookup by `identifier` whose declaration holds no table it reads has none, so `Mapped_response`
 * or `Lookup_type` refuses it, and a reference of any other kind, or to a built-in variable or to
 * nothing, claims none.
 */
export const VariableRefTable = relation(
  "VariableRefTable",
  {
    attribute: closedId(AttributeName),
    package: PackageName,
    path: EntryPath,
    start: natural,
    table: closedId(ReferencedTable),
  },
  ["package", "path", "start", "attribute"],
);

/**
 * One variable reference of an instance of an item's assembly (Q5.13's `Instance`, spec reading
 * 117), keyed by the instance (its assembly's head path, `assembly`, and its place in that
 * assembly's instance tree, `instance`) and the reference's element place and attribute: a
 * {@link VariableRef} of the instance's document, whose path is the reference's `path`, its name
 * resolved among the item's declarations, else to one of the item's built-in variables, else to
 * nothing, so a response or outcome rule fragment's references name its item's variables ("Variable
 * declared" over the assembly). `rootKind` is the assembly's root's, an item's. The declaration a
 * declared one names is its assembly's item's `NamedDeclaration` of its name. Its element's kind is
 * its node's, which no row copies (decision S3): every law that reads it matches the view
 * `PlacedVariableRefNode` (`#pantry/qti/names.ts`), the placed reference beside it.
 */
export const PlacedVariableRef = relation(
  "PlacedVariableRef",
  {
    assembly: EntryPath,
    attribute: closedId(AttributeName),
    identifier: keyText,
    instance: natural,
    package: PackageName,
    path: EntryPath,
    resolution: closedId(ReferenceResolution),
    rootKind: closedId(NodeKind),
    start: natural,
  },
  ["package", "assembly", "instance", "path", "start", "attribute"],
);

/**
 * Each document's variable references, counted by `Document.variables`.
 */
const documentVariableFamily = counted(
  on(VariableRef, "package", "path"),
  fin(Document, "variables"),
);

/**
 * Each item instance's variable references, counted by `Instance.variables`, its document's count.
 */
const placedVariableFamily = counted(
  on(PlacedVariableRef, "package", "assembly", "instance"),
  fin(Instance, "variables"),
);

/**
 * A base value, keyed by its `qti-base-value` element's place: its text, its node's string value,
 * beside its {@link Expression} row's base type, which its {@link LiteralTyped} is held to. The
 * code its `base-type` spells is its optional part, {@link LiteralTyped}.
 */
export const Literal = relation(
  "Literal",
  {
    baseType: closedId(ValueBase),
    package: PackageName,
    path: EntryPath,
    start: natural,
    text: keyText,
  },
  ["package", "path", "start"],
);

/**
 * A base value's type, keyed by its `qti-base-value` element's place, where its `base-type` spells
 * a base: its text, the declaration code `BaseTypePattern` is keyed by, each its {@link Literal}
 * row's, and its base type, the code's `ValueBaseOf` image, which the database derives and its
 * {@link Literal} holds. A base value whose `base-type` spells none has no row here, so no law
 * reads its text in a type it does not have, and AL1's value domain refuses its `base-type` alone.
 */
export const LiteralTyped = relation.generated(
  "LiteralTyped",
  {
    package: PackageName,
    path: EntryPath,
    start: natural,
    text: keyText,
    typeCode: closedId(BaseType),
  },
  ["package", "path", "start"],
  (l) => ({ baseType: generated(closedId(ValueBase), ValueBaseOf.at("value", l.typeCode)) }),
);

/**
 * The relations of the variable references processing makes, in one list, as
 * `#pantry/qti/schema.ts` composes them: the table each reference claims, and each reference placed
 * in an item's assembly.
 */
export const referenceRelations = [PlacedVariableRef, VariableRefTable] as const;

/**
 * A `VariableRef` row as a row check reads it.
 */
type VariableRefRow = RowScalars<typeof VariableRef>;

/**
 * The base types that say nothing: `any`, which passes every rule, and `unknown`.
 */
export const silentBases = ["any", "unknown"] as const;

/**
 * A braced reference's lexical form.
 */
const bracedReference = Compute.pattern<string>(`^\\{${ncNamePattern}\\}$`);

/**
 * A float literal that is also a name, which a float-or-reference attribute reads as the literal:
 * the union's first member, `xs:double`, takes it (XML Schema Part 2, 4.1.2.3).
 */
const floatName = Compute.pattern("^[\\t\\n\\r ]*(?:INF|NaN)[\\t\\n\\r ]*$");

/**
 * The kinds whose references stand in place of a float literal: the kinds of `ReferenceBase`'s
 * float rows, `qti-random-float`'s bounds.
 */
const floatReferenceKinds = [
  ...new Set(ReferenceBase.rows.flatMap(({ base, kind }) => (base === "float" ? [kind] : []))),
];

/**
 * The processing kinds that make variable references.
 */
const referringKinds = [...new Set(processingReferences.map(({ kind }) => kind))];

/**
 * The attributes processing names variables by, on the kinds that make them, each of which has its
 * `VariableRef`. A value of a literal-or-reference union is a reference only where it spells a
 * name: an NCName, bare (and no float literal on a float's attribute), or a braced one.
 */
const references = select(Attribute, (a) =>
  a.and(
    a.in(a.kind, referringKinds),
    a.eq(Compute.subset(Compute.singleton(a.name), VariableReference.row(a.kind)), true),
    a.or(
      a.and(
        a.eq(VariableReference.at("spelling", a.kind, a.name), "bare"),
        Compute.matches(a.lexical, namingPattern),
        a.or(
          a.not(a.in(a.kind, floatReferenceKinds)),
          a.not(Compute.matches(a.lexical, floatName)),
        ),
      ),
      a.and(
        a.eq(VariableReference.at("spelling", a.kind, a.name), "braced"),
        Compute.matches(a.lexical, bracedReference),
      ),
    ),
  ),
);

/**
 * State that a reference's split is a name with whitespace around it, a bare reference's, or a
 * name between braces, a braced one's. Which of the two its attribute spells, and that the split
 * spells the attribute's form, are a rule over the view `VariableRefNode`, which reads the form
 * (`#pantry/qti/overlay-queries/reference.ts`).
 *
 * @param v - The row.
 * @returns The predicate.
 */
const splitsAName = (v: VariableRefRow) =>
  v.and(
    Compute.matches(v.identifier, namePattern),
    v.or(
      v.and(Compute.matches(v.before, spacePattern), Compute.matches(v.after, spacePattern)),
      v.and(v.eq(v.before, "{"), v.eq(v.after, "}")),
    ),
  );

/**
 * The built-in variables, as the installed `BuiltInVariable` holds them (the UP audit's A63; spec
 * reading 29): each root's variables with the expression-typing codes of the base type and the
 * cardinality each stands as there, `ValueBaseOf`'s and `ValueCardinalityOf`'s images of its
 * declaration codes ({@link valueBaseOf}, {@link valueCardinalityOf}), and `unknown` for the base
 * type of the record `QTI_CONTEXT`, which has none (`builtInBaseTypes` holds no row for it).
 */
const builtIns = BuiltInVariable.rows.map(({ cardinality, declaration, root, variable }) => ({
  baseType: Option.match(
    Arr.findFirst(builtInBaseTypes, (typed) => typed.root === root && typed.variable === variable),
    { onNone: () => "unknown" as const, onSome: ({ baseType }) => valueBaseOf(baseType) },
  ),
  cardinality: valueCardinalityOf(cardinality),
  declaration,
  root,
  variable,
}));

/**
 * The roots that hold built-in variables, each with the names of its built-ins.
 */
const builtInRoots: ReadonlyMap<(typeof NodeKind.handles)[number], readonly string[]> = new Map(
  [...Map.groupBy(builtIns, ({ root }) => root)].map(
    ([root, rows]) => [root, rows.map(({ variable }) => variable)] as const,
  ),
);

/**
 * State the type a reference's resolution gives it: a declared variable's, which "E1 derived"
 * states over the declaration it names, a rule over a query
 * (`#pantry/qti/overlay-queries/reference.ts`): its cardinality its `DeclarationCardinality`'s
 * image through `ValueCardinalityOf` where the declaration has one (spec reading 159), and its base
 * type `unknown` where it has none, a record's (lane NIL's audit, B12), and else its
 * `DeclarationBaseType`'s `valueBase`; a built-in's by its name, among its root's built-ins;
 * nothing for an unresolved one, whose name is none of them.
 *
 * @param v - The row.
 * @returns The predicate.
 */
const resolvedType = (v: VariableRefRow) =>
  v.or(
    v.eq(v.resolution, "declared"),
    v.and(
      v.eq(v.resolution, "builtIn"),
      v.or(
        ...builtIns.map(({ baseType, cardinality, root, variable }) =>
          v.and(
            v.eq(v.rootKind, root),
            v.eq(v.identifier, variable),
            v.eq(v.baseType, baseType),
            v.eq(v.cardinality, cardinality),
          ),
        ),
      ),
    ),
    v.and(
      v.eq(v.resolution, "unresolved"),
      ...[...builtInRoots].map(([root, names]) =>
        v.or(v.ne(v.rootKind, root), v.not(v.in(v.identifier, names))),
      ),
      v.eq(v.baseType, "unknown"),
      v.eq(v.cardinality, "unknown"),
    ),
  );

/**
 * The kinds that map a response through a table of its declaration: a map response, through its
 * mapping, and a map response point, through its area mapping (§2.11.3.29, §2.11.3.30).
 */
export const mappedKinds = ["qti-map-response", "qti-map-response-point"] as const;

/**
 * Each built-in variable with the kinds whose element may name it by `identifier`: those whose
 * `ReferenceDeclaration` admits the declaration kind it stands as (reading 29), so a reference to a
 * built-in is judged under "Variable kind" as a declared one is. Exported for the rule over a
 * reference's view (`#pantry/qti/overlay-queries/reference.ts`), which judges it alike.
 */
export const builtInReferrers = builtIns.flatMap(({ declaration, root, variable }) => {
  const kinds = referenceDeclarations.flatMap(({ declarations, kind }) =>
    declarations.includes(declaration) ? [kind] : [],
  );

  return kinds.length === 0 ? [] : [{ kinds, root, variable }];
});

/**
 * The built-in response variables, each with the root it is built into, as the installed
 * `BuiltInVariable` holds them: an item's numAttempts and duration among them. None has a
 * declaration, so none holds a mapping or an area mapping (decision 431, spec reading 166).
 * Exported for the rule over a reference's view (`#pantry/qti/overlay-queries/reference.ts`).
 */
export const builtInResponses = builtIns.filter(
  ({ declaration }) => declaration === "qti-response-declaration",
);

/**
 * Every statement over the expression and processing overlays, each `check` named by its oracle
 * law: each overlay's copies and existence; the language chain; the references' resolution; and
 * the P-rules, as the module's header lists them. The laws over an expression's operands are rules
 * over the derived `OperandOf` (`#pantry/qti/overlay-queries/expression.ts`).
 */
export const expressionLawsByName = {
  "E1 derived": [
    // Expression: one for every expression element, at its node. Its kind, parent and parent's
    // kind are its node's: the rules that read them are over `ExpressionNode`.
    contained(
      on(
        select(Node, (n) => n.in(n.kind, expressionKinds)),
        "package",
        "path",
        "start",
      ),
      on(Expression, "package", "path", "start"),
    ),
    contained(on(Expression, "package", "path", "start"), on(Node, "package", "path", "start")),
    // Processing: one for every rule element, at its node; its language chain and the language
    // its root opens are rules over `ProcessingNode`.
    contained(
      on(
        select(Node, (n) => n.in(n.kind, ruleKindHandles)),
        "package",
        "path",
        "start",
      ),
      on(Processing, "package", "path", "start"),
    ),
    contained(on(Processing, "package", "path", "start"), on(Node, "package", "path", "start")),
    // VariableRef: one for every reference an attribute makes, at that attribute; its document, its
    // declaration and its laws. Every law that reads its element's kind or its attribute's form, its
    // element's language and type and its form's spelling among them, is a rule over the view
    // `VariableRefNode` (overlay-queries/reference.ts).
    contained(
      on(references, "package", "path", "start", "name"),
      on(VariableRef, "package", "path", "start", "attribute"),
    ),
    contained(
      on(VariableRef, "package", "path", "start", "attribute"),
      on(Attribute, "package", "path", "start", "name"),
    ),
    contained(
      on(VariableRef, "package", "path", "rootKind"),
      on(Document, "package", "path", "rootKind"),
    ),
    // Each table a reference claims (VariableRefTable), a declared reference's by its identifier,
    // of a table its kind reads, its declaration's: a slot the declaration leaves empty has no
    // table, so no reference claims it, and a reference that claims none has no claim row. The
    // claim's kind and the declaration's table are rules over a query (overlay-queries/reference.ts
    // and overlay-queries/declaration.ts).
    contained(
      on(VariableRefTable, "package", "path", "start", "attribute"),
      on(
        select(VariableRef, (v) => v.eq(v.resolution, "declared")),
        "package",
        "path",
        "start",
        "attribute",
      ),
    ),
    check("E1_derived", VariableRefTable, (t) => t.eq(t.attribute, "identifier")),
    check("E1_derived", VariableRef, (v) => v.and(splitsAName(v), resolvedType(v))),
    // PlacedVariableRef (spec reading 117): each item instance's references, its document's,
    // resolved among the item's declarations, under "Variable declared" over the assembly.
    documentVariableFamily,
    placedVariableFamily,
    contained(
      on(PlacedVariableRef, "package", "assembly", "instance", "path"),
      on(Instance, "package", "assembly", "start", "document"),
    ),
    contained(
      on(PlacedVariableRef, "package", "path", "start", "attribute", "identifier"),
      on(VariableRef, "package", "path", "start", "attribute", "identifier"),
    ),
    contained(
      on(PlacedVariableRef, "package", "assembly", "rootKind"),
      on(Document, "package", "path", "rootKind"),
    ),
    check("E1_derived", PlacedVariableRef, (v) =>
      v.or(
        v.eq(v.resolution, "declared"),
        v.and(
          v.eq(v.resolution, "builtIn"),
          v.or(
            ...builtIns.map(({ root, variable }) =>
              v.and(v.eq(v.rootKind, root), v.eq(v.identifier, variable)),
            ),
          ),
        ),
        v.and(
          v.eq(v.resolution, "unresolved"),
          ...[...builtInRoots].map(([root, names]) =>
            v.or(v.ne(v.rootKind, root), v.not(v.in(v.identifier, names))),
          ),
        ),
      ),
    ),
    // Literal: a base value's text, typed as its expression, and its code where its `base-type`
    // spells one. The base type a typing attribute gives its expression is a rule over the query
    // `ExpressionAttribute` (queries.ts).
    contained(
      on(
        select(Node, (n) => n.eq(n.kind, "qti-base-value")),
        "package",
        "path",
        "start",
        "stringValue",
      ),
      on(Literal, "package", "path", "start", "text"),
    ),
    contained(
      on(LiteralTyped, "package", "path", "start", "text", "baseType"),
      on(Literal, "package", "path", "start", "text", "baseType"),
    ),
    contained(
      on(Literal, "package", "path", "start", "baseType"),
      on(Expression, "package", "path", "start", "baseType"),
    ),
  ],
  "Literal lexical": [
    check("Literal_lexical", LiteralTyped, (l) =>
      Compute.matches(l.text, BaseTypePattern.at("pattern", l.typeCode)),
    ),
  ],
  "Reference type": [
    check("Reference_type", VariableRef, (v) =>
      v.or(v.eq(v.attribute, "identifier"), v.ne(v.resolution, "builtIn")),
    ),
  ],
} as const;

/**
 * {@link expressionLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const expressionLaws = Object.values(expressionLawsByName).flat();

/**
 * `expression-types.ts`'s rosters and closed relations, the expression-typing codes and the
 * per-kind typing, and `expressions.ts`'s relations: every expression and its operands, every rule
 * and its language, every processing reference, and a base value's text; and each reference's
 * table and placements (`referenceRelations`).
 */
export const expressionRelations = [
  ...referenceRelations,
  BaseTypePattern,
  Expression,
  Language,
  LeadCardinality,
  Literal,
  LiteralTyped,
  OperandBase,
  Processing,
  ReferenceBase,
  ReferenceDeclaration,
  ReferenceResolution,
  ReferencedTable,
  ResultBase,
  ResultCardinality,
  TableReader,
  TailCardinality,
  ValueBase,
  ValueBaseBit,
  ValueBaseOf,
  ValueCardinality,
  ValueCardinalityBit,
  ValueCardinalityOf,
  VariableRef,
] as const;
