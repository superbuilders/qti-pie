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
 * An expression is typed per placement (spec reading `fragment-placement`): a placement is an
 * instance of an assembly, or a document in no assembly, its own one placement, and its documents
 * are the one it places and, at an item's own placement, the response processing template the item
 * locates (`placedDocuments` of `#pantry/qti/overlay-queries/expression.ts`). A document placed
 * twice may be typed twice, differently, and every type law reads the placed rows, so each
 * placement is judged where it stands: two tests placing one section document, two items splicing
 * one rules fragment, an item and the template it locates.
 *
 * - **{@link Expression}**, one row per expression element, with the processing language it is
 *   written in, its document's fact. Its type is its {@link PlacedExpression}'s, one per placement
 *   of its document, typed with the expression-typing codes of `#pantry/qti/expression-types.ts`
 *   and with its type as one-bit sets. Its operands (C16) are the expressions whose node's parent
 *   is its node, each ranked by its node's element rank, 1 to n: the derived `OperandOf`, per
 *   placement, which every operand law reads (`#pantry/qti/overlay-queries/expression.ts`), so no
 *   row stores an operator's count or its operands' types.
 * - **{@link Processing}**, one row per rule and processing element, carries the processing language
 *   from its root down; each expression takes its parent's.
 * - **{@link VariableRef}**, one row per variable reference a processing element makes: the name its
 *   attribute spells and its element's language, its document's facts. Its resolution and its
 *   variable's type are its {@link PlacedVariableRef}'s, one per placement of its document, read in
 *   the placement's assembly: a declaration of the assembly's root, its `NamedDeclaration` of the
 *   name, whatever the declaration's cardinality spells (spec reading `binding-by-name`), a
 *   built-in variable of that root (the installed `BuiltInVariable`, A63), under a test the one
 *   reading of a prefixed name (`TestReading`, spec reading `dotted-reference`), or nothing, which
 *   only a root that is no item may leave. Every law over the declaration a reference names, its
 *   kind, cardinality or base type, joins the placed reference to it by its name, a rule over a
 *   query (`#pantry/qti/overlay-queries/reference.ts`), and so does every law over the table it
 *   reads of it (`#pantry/qti/overlay-queries/declaration.ts`). The type a setter or a lookup sets
 *   its variable to is a query, `HeldType`. Its element's kind and its attribute's lexical form are
 *   the attribute's, which no row copies (C18): every law that reads them is a rule over the views
 *   `VariableRefNode` and `PlacedVariableRefNode` (`#pantry/qti/names.ts`).
 * - **{@link Literal}** carries a base value's text and type. The attributes an expression's type
 *   follows from (`base-type`, `name`) are read where they are written, through the query
 *   `ExpressionAttribute` (`#pantry/qti/queries.ts`), which no row copies.
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
  Bits,
  check,
  closedId,
  contained,
  generated,
  law,
  on,
  relation,
  select,
  str,
  Text,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import { Array as Arr, Option } from "effect";
import { ncNamePattern } from "#pantry/grammar/domains.ts";
import {
  AttributeName,
  BaseType,
  BuiltInVariable,
  NodeKind,
  VariableReference,
  builtInBaseTypes,
  natural,
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
import { EntryPath, LiteralText, PackageName, QtiIdentifier } from "#pantry/qti/limits.ts";
import { Node } from "#pantry/qti/node.ts";
import { spacePattern } from "#pantry/qti/token-list.ts";
import {
  expressionKinds,
  processingReferences,
  referenceDeclarations,
  ruleKindHandles,
  valueBaseOf,
  valueCardinalityOf,
} from "#pantry/vocab/terms/expression-types.ts";
import { declared } from "#pantry/qti/law-entries.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

/**
 * What a reference's lexical form holds around the name it spells: XML whitespace `S`, possibly
 * none, which a collapsing type absorbs, or one brace of a braced reference. Exported for
 * `src/import/refusal.ts`, which names its pattern law.
 */
export const Affix = law(entryOf("E1 derived"), str.regex("^(?:[\\t\\n\\r ]*|\\{|\\})$"));

/**
 * One expression element, keyed by its place: the processing language it is written in, the
 * host's, proved by its parent's row. Its kind, parent and parent's kind are its node's, which the
 * rules over the query `ExpressionNode` read (`#pantry/qti/overlay-queries/expression.ts`), and its
 * type is each placement's ({@link PlacedExpression}).
 */
export const Expression = law(
  entryOf("E1 derived"),
  relation(
    "Expression",
    {
      language: closedId(Language),
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One expression of a placed document under one placement (spec reading `fragment-placement`),
 * keyed by the placement, its assembly's head path `assembly` and its place in that assembly's
 * instance tree `instance` (0 for a document in no assembly, its own one placement), and the
 * expression's place: the type the host gives its value there. One row stands for every expression
 * of every document of every placement, and for nothing else (`PlacedExpressionSite`,
 * `#pantry/qti/overlay-queries/expression.ts`).
 *
 * - **the host's:** `baseType` and `cardinality`, each proved by `E1_derived`, `ResultBase` and
 *   `ResultCardinality` from its operands, its attributes and its variable under the same
 *   placement;
 * - **generated:** `baseTypeBit` and `cardinalityBit`, its type as one-bit sets (C6), which the
 *   operand laws compare by subset: ∅ exactly for `qti-null`'s `any` base type and for an `unknown`
 *   cardinality.
 */
export const PlacedExpression = law(
  entryOf("E1 derived"),
  relation.generated(
    "PlacedExpression",
    {
      assembly: EntryPath,
      baseType: closedId(ValueBase),
      cardinality: closedId(ValueCardinality),
      instance: natural,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "assembly", "instance", "path", "start"],
    (r) => ({
      baseTypeBit: law(
        entryOf("E1 derived"),
        generated(bits(ValueBase), ValueBaseBit.row(r.baseType)),
      ),
      cardinalityBit: law(
        entryOf("E1 derived"),
        generated(bits(ValueCardinality), ValueCardinalityBit.row(r.cardinality)),
      ),
    }),
  ),
);

/**
 * One rule or processing element, keyed by its place: the processing language it is written in,
 * which its root opens and every rule below it carries. Its kind, parent and parent's kind are its
 * node's, which the rules over the query `ProcessingNode` read
 * (`#pantry/qti/overlay-queries/expression.ts`).
 */
export const Processing = law(
  entryOf("E1 derived"),
  relation(
    "Processing",
    {
      language: closedId(Language),
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One variable reference a processing element makes, keyed by the element's place and the attribute
 * it makes it by (`VariableReference`'s rows over the processing kinds), and what it names, each
 * field the host's: `before`, `identifier` and `after`, the attribute's lexical form split around
 * the name it spells, the whitespace around a bare name or the braces around a braced one;
 * `language`, its element's ({@link Expression} row's for an expression, its {@link Processing}
 * row's for a rule); and `rootKind`, its document's root's. Its element's kind and the attribute's
 * lexical form are the attribute's (C18), read beside it through the view `VariableRefNode`
 * (`#pantry/qti/names.ts`) by every law that reads them, and the rule over the view holds the form
 * to the split put back together, `before ‖ identifier ‖ after`, deciding the equation by lengths
 * and substrings, building no text. What it names is each placement's ({@link PlacedVariableRef}).
 *
 * The import writes its rows where its form names something (`namedBy` of
 * `#pantry/import/names.ts`, which lists every such relation), until it is a query over
 * `Attribute`.
 */
export const VariableRef = law(
  entryOf("E1 derived"),
  relation(
    "VariableRef",
    {
      after: Affix,
      attribute: closedId(AttributeName),
      before: Affix,
      identifier: QtiIdentifier,
      language: closedId(Language),
      package: PackageName,
      path: EntryPath,
      rootKind: closedId(NodeKind),
      start: natural,
    },
    ["package", "path", "start", "attribute"],
  ),
);

/**
 * One variable reference of a placed document under one placement (spec reading
 * `fragment-placement`), keyed by the placement (its assembly's head path, `assembly`, and its
 * place in that assembly's instance tree, `instance`, as {@link PlacedExpression}'s) and the
 * reference's element place and attribute: a {@link VariableRef} of a document of the placement,
 * whose path is the reference's `path`, its name copied, resolved in the assembly (`resolution`)
 * and typed as what it names there (`baseType` and `cardinality`). `rootKind` is the assembly's
 * root's. Each field is the host's:
 *
 * - `declared`: the assembly's root's `NamedDeclaration` of its name, whatever its cardinality spells
 *   (spec reading `binding-by-name`), so a rules fragment's references name its item's variables
 *   and a located template's the item's (§4.6.1); typed as the declaration, its cardinality's
 *   `ValueCardinalityOf` image and its base type's `ValueBaseOf` image, `unknown` for one it does
 *   not have, a record's base type among them (lane NIL's audit, B12);
 * - `builtIn`: else one of the root's built-in variables, typed as it stands ({@link builtIns});
 * - `read`: else, under a test, the one reading of its name through a scope (`TestReading` of
 *   `#pantry/qti/overlay-queries/readings.ts`, spec reading `dotted-reference`): an item's variable
 *   through an item ref that names an item document, its declaration, a variable mapping's source
 *   declaration or an item's built-in, or a scope's `duration`, typed as that variable;
 * - `unresolved`: else nothing, `unknown`, which only a root that is no item may leave: a response
 *   processing template's parameters in its own placement, and a test's name read through an item
 *   ref that names no item document (reading `mapping-and-default-names`) or read more than once
 *   (reading `test-identifier-namespace`).
 *
 * Its element's kind is its node's, which no row copies (decision S3): every law that reads it
 * matches the view `PlacedVariableRefNode` (`#pantry/qti/names.ts`), the placed reference beside
 * it.
 */
export const PlacedVariableRef = law(
  entryOf("E1 derived"),
  relation(
    "PlacedVariableRef",
    {
      assembly: EntryPath,
      attribute: closedId(AttributeName),
      baseType: closedId(ValueBase),
      cardinality: closedId(ValueCardinality),
      identifier: QtiIdentifier,
      instance: natural,
      package: PackageName,
      path: EntryPath,
      resolution: closedId(ReferenceResolution),
      rootKind: closedId(NodeKind),
      start: natural,
    },
    ["package", "assembly", "instance", "path", "start", "attribute"],
  ),
);

/**
 * A base value, keyed by its `qti-base-value` element's place: its text, its node's string value,
 * beside its base type, the one its `base-type` gives it in every placement
 * ({@link PlacedExpression}), which its {@link LiteralTyped} is held to. The code its `base-type`
 * spells is its optional part, {@link LiteralTyped}.
 */
export const Literal = law(
  entryOf("E1 derived"),
  relation(
    "Literal",
    {
      baseType: closedId(ValueBase),
      package: PackageName,
      path: EntryPath,
      start: natural,
      text: LiteralText,
    },
    ["package", "path", "start"],
  ),
);

/**
 * A base value's type, keyed by its `qti-base-value` element's place, where its `base-type` spells
 * a base: its text, the declaration code `BaseTypePattern` is keyed by, each its {@link Literal}
 * row's, and its base type, the code's `ValueBaseOf` image, which the database derives and its
 * {@link Literal} holds. A base value whose `base-type` spells none has no row here, so no law
 * reads its text in a type it does not have, and AL1's value domain refuses its `base-type` alone.
 */
export const LiteralTyped = law(
  entryOf("E1 derived"),
  relation.generated(
    "LiteralTyped",
    {
      package: PackageName,
      path: EntryPath,
      start: natural,
      text: LiteralText,
      typeCode: closedId(BaseType),
    },
    ["package", "path", "start"],
    (l) => ({
      baseType: law(
        entryOf("E1 derived"),
        generated(closedId(ValueBase), ValueBaseOf.at("value", l.typeCode)),
      ),
    }),
  ),
);

/**
 * The relations of what processing makes under each placement, in one list, as
 * `#pantry/qti/schema.ts` composes them: each expression and each reference placed.
 */
export const placedRelations = [PlacedExpression, PlacedVariableRef] as const;

/**
 * A `VariableRef` row as a row check reads it.
 */
type VariableRefRow = RowScalars<typeof VariableRef>;

/**
 * A `PlacedVariableRef` row as a row check reads it.
 */
type PlacedVariableRefRow = RowScalars<typeof PlacedVariableRef>;

/**
 * The base types that say nothing: `any`, which passes every rule, and `unknown`.
 */
export const silentBases = ["any", "unknown"] as const;

/**
 * A braced reference's lexical form.
 */
const bracedReference = Text.pattern<string>(`^\\{${ncNamePattern}\\}$`);

/**
 * A float literal that is also a name, which a float-or-reference attribute reads as the literal:
 * the union's first member, `xs:double`, takes it (XML Schema Part 2, 4.1.2.3).
 */
const floatName = Text.pattern("^[\\t\\n\\r ]*(?:INF|NaN)[\\t\\n\\r ]*$");

/**
 * The kinds whose references stand in place of a float literal: the kinds of `ReferenceBase`'s
 * float rows, `qti-random-float`'s bounds.
 */
const floatReferenceKinds = [
  ...new Set(ReferenceBase.rows.flatMap(({ base, kind }) => (base === "float" ? [kind] : []))),
] as const;

/**
 * The processing kinds that make variable references.
 */
const referringKinds = [...new Set(processingReferences.map(({ kind }) => kind))] as const;

/**
 * The attributes processing names variables by, on the kinds that make them, each of which has its
 * `VariableRef`. A value of a literal-or-reference union is a reference only where it spells a
 * name: an NCName, bare (and no float literal on a float's attribute), or a braced one.
 */
const references = select(Attribute, (a) =>
  a.and(
    a.in(a.kind, referringKinds),
    a.eq(Bits.subset(Bits.singleton(a.name), VariableReference.row(a.kind)), true),
    a.or(
      a.and(
        a.eq(VariableReference.at("spelling", a.kind, a.name), "bare"),
        Text.matches(a.lexical, namingPattern),
        a.or(a.not(a.in(a.kind, floatReferenceKinds)), a.not(Text.matches(a.lexical, floatName))),
      ),
      a.and(
        a.eq(VariableReference.at("spelling", a.kind, a.name), "braced"),
        Text.matches(a.lexical, bracedReference),
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
    Text.matches(v.identifier, namePattern),
    v.or(
      v.and(Text.matches(v.before, spacePattern), Text.matches(v.after, spacePattern)),
      v.and(v.eq(v.before, "{"), v.eq(v.after, "}")),
    ),
  );

/**
 * The literal stand-ins that may name any item variable, of any kind, built-in or declared: an
 * `IntOrIdentifier` (information model §9.3.2: "the union of the primitiveType 'Int' and the
 * primitiveType of 'NCName'"), which, unlike §9.3.3's IntegerOrVariableRef ("a template or outcome
 * variable"), names no kind, `qti-index`'s `n` (§5.72: "If 'n' is an identifier, it is the value of
 * 'n' at runtime that is used") and `qti-repeat`'s `number-repeats` (§5.113: "If number-repeats
 * refers to a variable whose value is less than 1, the value of the whole expression is NULL").
 * The variable is still a single integer, as each stands for one: "'n' must be a positive integer"
 * (§5.72), and number-repeats "Defines the number of iterations" (§5.113.1). Each attribute is its
 * kind's alone among the stand-ins (`ReferenceBase`), so a law that reads no kind tells them by the
 * attribute.
 */
export const anyKindStandIns = [
  { attribute: "n", kind: "qti-index" },
  { attribute: "number-repeats", kind: "qti-repeat" },
] as const;

/**
 * The built-in variables, as the installed `BuiltInVariable` holds them (the UP audit's A63; spec
 * reading `duration-variable-type`): each root's variables with the expression-typing codes of the
 * base type and the cardinality each stands as there, `ValueBaseOf`'s and `ValueCardinalityOf`'s
 * images of its declaration codes ({@link valueBaseOf}, {@link valueCardinalityOf}), and `unknown`
 * for the base type of the record `QTI_CONTEXT`, which has none (`builtInBaseTypes` holds no row
 * for it).
 */
export const builtIns = BuiltInVariable.rows.map(
  ({ cardinality, declaration, root, variable }) => ({
    baseType: Option.match(
      Arr.findFirst(
        builtInBaseTypes,
        (typed) => typed.root === root && typed.variable === variable,
      ),
      { onNone: () => "unknown" as const, onSome: ({ baseType }) => valueBaseOf(baseType) },
    ),
    cardinality: valueCardinalityOf(cardinality),
    declaration,
    root,
    variable,
  }),
);

/**
 * The roots that hold built-in variables, each with the names of its built-ins.
 */
const builtInRoots: ReadonlyMap<(typeof NodeKind.handles)[number], readonly string[]> = new Map(
  [...Map.groupBy(builtIns, ({ root }) => root)].map(
    ([root, rows]) => [root, rows.map(({ variable }) => variable)] as const,
  ),
);

/**
 * State that a placed reference's name is none of its root's built-in variables.
 *
 * @param v - The row.
 * @returns The predicate.
 */
const namesNoBuiltIn = (v: PlacedVariableRefRow) =>
  v.and(
    ...[...builtInRoots].map(([root, names]) =>
      v.or(v.ne(v.rootKind, root), v.not(v.in(v.identifier, names))),
    ),
  );

/**
 * State the type a placed reference's resolution gives it: a declared variable's, which "E1
 * derived" states over the declaration it names, a rule over a query
 * (`#pantry/qti/overlay-queries/reference.ts`): its cardinality its `DeclarationCardinality`'s
 * image through `ValueCardinalityOf` where the declaration has one (spec reading
 * `binding-by-name`), and its base type `unknown` where it has none, a record's (lane NIL's audit,
 * B12), and else its `DeclarationBaseType`'s `valueBase`; a built-in's by its name, among its
 * root's built-ins; a read one's, its one reading's variable's, stated over its reading, which is
 * exactly where it is read (`SoleReading`, `#pantry/qti/overlay-queries/readings.ts`, spec reading
 * `weighted-test-variables`); and nothing for an unresolved one. The resolutions are thereby proved
 * both ways, each by one law: a name the root declares is `declared` and a `declared` one names a
 * declaration of it (`DeclaredPlacement`, `#pantry/qti/queries.ts`, and "Variable declared"); a
 * name that is one of the root's built-ins is never `unresolved` here, and never `read`, since a
 * test's built-in has an unsplit reading of its own (`TestReading`) and so no sole reading through
 * a scope, so it is `builtIn` where its root does not declare it; and `read` is its readings'
 * (`SoleReading`). So `unresolved` is exactly the rest.
 *
 * @param v - The row.
 * @returns The predicate.
 */
const resolvedType = (v: PlacedVariableRefRow) =>
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
    v.eq(v.resolution, "read"),
    v.and(
      v.eq(v.resolution, "unresolved"),
      namesNoBuiltIn(v),
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
 * `ReferenceDeclaration` admits the declaration kind it stands as (reading
 * `duration-variable-type`), so a reference to a built-in is judged under "Variable kind" as a
 * declared one is. Exported for the rule over a reference's view
 * (`#pantry/qti/overlay-queries/reference.ts`), which judges it alike.
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
 * declaration, so none holds a mapping or an area mapping (decision 431, spec reading
 * `test-prefixed-response-reads`). Exported for the rule over a reference's view
 * (`#pantry/qti/overlay-queries/reference.ts`).
 */
export const builtInResponses = builtIns.filter(
  ({ declaration }) => declaration === "qti-response-declaration",
);

/**
 * Every statement over the expression and processing overlays, each `check` named by its oracle
 * law: each overlay's copies and existence; the language chain; the references' resolution; and
 * the P-rules, as the module's header lists them. The laws over an expression's operands are rules
 * over the derived `OperandOf` (`#pantry/qti/overlay-queries/expression.ts`).
 *
 * **E1 derived**, by overlay:
 *
 * - `Expression`: one for every expression element, at its node. Its kind, parent and parent's kind
 *   are its node's: the rules that read them are over `ExpressionNode`.
 * - `Processing`: one for every rule element, at its node; its language chain and the language its
 *   root opens are rules over `ProcessingNode`.
 * - `VariableRef`: one for every reference an attribute makes, at that attribute, and its document.
 *   Every law that reads its element's kind or its attribute's form, its element's language and its
 *   form's spelling among them, is a rule over the view `VariableRefNode`
 *   (overlay-queries/reference.ts).
 * - `PlacedVariableRef` (spec reading `fragment-placement`): each placement's references, its
 *   documents', resolved and typed in its assembly. Each is exactly a reference of a placed
 *   document, a rule over a query (overlay-queries/reference.ts), and its root is its assembly's.
 * - `Literal`: a base value's text, and its code where its `base-type` spells one. The base type a
 *   typing attribute gives its expression in each placement, and the literal's type there, are
 *   rules over queries (queries.ts `ExpressionAttribute`, overlay-queries/expression.ts).
 */
export const expressionLawsByName = {
  "E1 derived": declared("E1 derived", [
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
    check("E1_derived", VariableRef, splitsAName),
    contained(
      on(PlacedVariableRef, "package", "assembly", "rootKind"),
      on(Document, "package", "path", "rootKind"),
    ),
    check("E1_derived", PlacedVariableRef, resolvedType),
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
  ]),
  "Literal lexical": declared("Literal lexical", [
    check("Literal_lexical", LiteralTyped, (l) =>
      Text.matches(l.text, BaseTypePattern.at("pattern", l.typeCode)),
    ),
  ]),
  "Reference type": declared("Reference type", [
    check("Reference_type", PlacedVariableRef, (v) =>
      v.or(
        v.eq(v.attribute, "identifier"),
        v.ne(v.resolution, "builtIn"),
        v.and(
          v.in(
            v.attribute,
            anyKindStandIns.map(({ attribute }) => attribute),
          ),
          v.eq(v.baseType, "integer"),
          v.eq(v.cardinality, "single"),
        ),
      ),
    ),
  ]),
} as const;

/**
 * {@link expressionLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const expressionLaws = Object.values(expressionLawsByName).flat();

/**
 * `expression-types.ts`'s rosters and closed relations, the expression-typing codes and the
 * per-kind typing, and `expressions.ts`'s relations: every expression and its operands, every rule
 * and its language, every processing reference, and a base value's text; and each expression's and
 * each reference's placements (`placedRelations`).
 */
export const expressionRelations = [
  ...placedRelations,
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
  ResultBase,
  ResultCardinality,
  TailCardinality,
  ValueBase,
  ValueBaseBit,
  ValueBaseOf,
  ValueCardinality,
  ValueCardinalityBit,
  ValueCardinalityOf,
  VariableRef,
] as const;
