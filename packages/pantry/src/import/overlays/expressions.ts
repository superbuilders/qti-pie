/**
 * The expression and processing overlays' rows (plan §1.7 O4, §C's `rowsOf`): from one document's
 * view (`DocumentView` of `#pantry/import/fold.ts`), the rows of every relation
 * `#pantry/qti/expressions.ts` declares, each relation's rows a keyed set.
 *
 * The rows restate what the tree says and nothing else: each element's key, each
 * processing element's language as its root opens it, each reference as its attribute spells it
 * and as the document's declarations resolve it, and each expression's type, derived from its
 * operands, its attributes and its variable by the same rules the laws state. A derived value is
 * written as the rule gives it even where the content breaks a law, so the database refuses the
 * content under the law it breaks (`expressionLaws`); a row this builder gets wrong is refused,
 * never accepted.
 */
import type { Addition } from "@bjornpagen/grizzle";
import { Array as Arr, Option } from "effect";
import { integerMathOperators, tableReaders, valueBases } from "#pantry/grammar/expression.ts";
import type {
  Language,
  ReferencedTable,
  ValueBase,
  ValueCardinality,
} from "#pantry/grammar/expression.ts";
import { isNcName } from "#pantry/grammar/domains.ts";
import { builtInBaseTypes, BuiltInVariable, nonElementKinds } from "#pantry/grammar/install.ts";
import type { BaseType, Cardinality } from "#pantry/grammar/install.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { spelledBaseTypeOf, typedDeclarationOf } from "#pantry/import/overlays/declarations.ts";
import type { DocumentName } from "#pantry/import/overlays/declarations.ts";
import { attributeValueOf, namedBy, valueAt } from "#pantry/import/names.ts";
import { piecesOf } from "#pantry/import/pieces.ts";
import { charactersIn } from "#pantry/import/overlays/characters.ts";
import type { TypedHrefRow } from "#pantry/import/overlays/package.ts";
import { itemRefPathsOf } from "#pantry/import/overlays/tests.ts";
import type { InstanceMember, InstanceRoot, TestIds } from "#pantry/import/overlays/tests.ts";
import { governorOf, lexicalOf } from "#pantry/import/fold.ts";
import type { AttributeIndex, DocumentView, Folds } from "#pantry/import/fold.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { DocumentPlace, Place } from "#pantry/import/write.ts";
import type { AttributeRow, FlatRows, NodeRow } from "#pantry/model/xdm.ts";
import type {
  Expression,
  Literal,
  LiteralTyped,
  PlacedVariableRef,
  Processing,
  VariableRef,
  VariableRefTable,
} from "#pantry/qti/expressions.ts";
import type { ItemRefDocument, ItemRefHref } from "#pantry/qti/tests.ts";
import {
  expressionKinds,
  processingReferences,
  rootLanguages,
  ruleKindHandles,
  typings,
  valueBaseOf,
  valueCardinalityOf,
} from "#pantry/vocab/terms/expression-types.ts";
import { itemKind, itemResourceType, linkResourceTypes } from "#pantry/vocab/terms/tests.ts";

/**
 * A document's expression and processing rows, one keyed set per relation: each map from the text
 * of a row's key to the row as its writer writes it, the key's values as a JSON array: its
 * element's place `(package, path, start)` ({@link keyTextOf}), then its attribute where the key
 * holds one ({@link pairKey}); a document's own row by `(package, path)`.
 */
export interface ExpressionRows {
  readonly Expression: ReadonlyMap<string, Addition<typeof Expression>>;
  readonly Literal: ReadonlyMap<string, Addition<typeof Literal>>;
  readonly LiteralTyped: ReadonlyMap<string, Addition<typeof LiteralTyped>>;
  readonly Processing: ReadonlyMap<string, Addition<typeof Processing>>;
  readonly VariableRef: ReadonlyMap<string, Addition<typeof VariableRef>>;
  readonly VariableRefTable: ReadonlyMap<string, Addition<typeof VariableRefTable>>;
}

/**
 * A type as the laws give it: a base type and a cardinality.
 */
interface Typed {
  readonly baseType: ValueBase;
  readonly cardinality: ValueCardinality;
}

/**
 * The type of a value no declaration says.
 */
const unknownType: Typed = { baseType: "unknown", cardinality: "unknown" };

/**
 * Read a variable's base type as an expression's: its declaration code's `ValueBase`, and
 * `unknown` where it has none, a record's (lane NIL's audit, B12).
 *
 * @param baseType - The variable's base type, none where it has none.
 * @returns The expression-typing code.
 */
const baseOf = (baseType: Option.Option<(typeof BaseType.handles)[number]>): ValueBase =>
  Option.match(baseType, { onNone: () => unknownType.baseType, onSome: valueBaseOf });

/**
 * Read a variable's cardinality as an expression's: its declaration code's `ValueCardinality`, and
 * `unknown` where it has none, unwritten or spelling nothing (spec reading 159), as
 * {@link baseOf} reads a base type.
 *
 * @param cardinality - The variable's cardinality, none where it has none.
 * @returns The expression-typing code.
 */
const cardinalityOf = (
  cardinality: Option.Option<(typeof Cardinality.handles)[number]>,
): ValueCardinality =>
  Option.match(cardinality, {
    onNone: () => unknownType.cardinality,
    onSome: valueCardinalityOf,
  });

/**
 * A reference's element type as {@link unknownType} gives it, which `withTypes` fills once every
 * expression is typed, and which stays where its element is no expression: the null object
 * `VariableRef` holds in the fields its case leaves unread.
 */
const unfilledTypes = {
  elementBase: unknownType.baseType,
  elementCardinality: unknownType.cardinality,
} as const;

/**
 * One declaration of the document as a reference resolves to it: its `start`, kind and codes, its
 * base type none where it has none, a record's or one that spells nothing (lane NIL's audit, B12),
 * and its cardinality none where it has none, unwritten or spelling nothing (spec reading 159).
 */
interface DeclarationEntry {
  readonly baseType: Option.Option<(typeof BaseType.handles)[number]>;
  readonly cardinality: Option.Option<(typeof Cardinality.handles)[number]>;
  readonly kind: string;
  readonly start: bigint;
  readonly tables: ReadonlySet<string>;
}

/**
 * The declaration kinds, the elements that declare a variable by its `identifier`.
 */
const declarationKinds: ReadonlySet<string> = new Set([
  "qti-context-declaration",
  "qti-outcome-declaration",
  "qti-response-declaration",
  "qti-template-declaration",
]);

/**
 * The tables a declaration may hold, which a map response or a lookup reads.
 */
const tableKinds: ReadonlySet<string> = new Set([
  "qti-area-mapping",
  "qti-interpolation-table",
  "qti-mapping",
  "qti-match-table",
]);

/**
 * The kinds that are no element.
 */
const notElements: ReadonlySet<string> = new Set(nonElementKinds);

/**
 * The expression kinds, and their typings by kind.
 */
const expressions: ReadonlySet<string> = new Set(expressionKinds);

/**
 * The rule and processing kinds.
 */
const rules: ReadonlySet<string> = new Set(ruleKindHandles);

/**
 * The language each root opens.
 */
const rootLanguage: ReadonlyMap<string, Language> = new Map(rootLanguages);

/**
 * Each processing reference's spelling, by `kind attribute`.
 */
const spellingOf: ReadonlyMap<string, "bare" | "braced"> = new Map(
  processingReferences.map(({ attribute, kind, spelling }) => [`${kind} ${attribute}`, spelling]),
);

/**
 * What a reference's lexical form holds around its name, as `VariableRef` types it.
 */
type Affix = Addition<typeof VariableRef>["before"];

/**
 * A float literal that is also a name, which a float-or-reference attribute reads as the literal.
 */
const floatName = /^[\t\n\r ]*(?:INF|NaN)[\t\n\r ]*$/u;

/**
 * The names `qti-math-operator` gives an integer result.
 */
const integerNames: ReadonlySet<string> = new Set(integerMathOperators);

/**
 * A built-in variable as a root holds it: its type, its declaration codes read as expression-typing
 * codes.
 */
interface BuiltIn {
  readonly type: Typed;
}

/**
 * Each root's built-in variables, as the installed `BuiltInVariable` holds them (the UP audit's
 * A63).
 */
const builtInsByRoot: ReadonlyMap<string, ReadonlyMap<string, BuiltIn>> = new Map(
  [...Map.groupBy(BuiltInVariable.rows, ({ root }) => root)].map(([root, rows]) => [
    root,
    new Map(
      rows.map(({ cardinality, variable }) => [
        variable,
        {
          type: {
            baseType: baseOf(
              Option.map(
                Arr.findFirst(
                  builtInBaseTypes,
                  (typed) => typed.root === root && typed.variable === variable,
                ),
                ({ baseType }) => baseType,
              ),
            ),
            cardinality: valueCardinalityOf(cardinality),
          },
        },
      ]),
    ),
  ]),
);

/**
 * Read the built-in variable a root holds under a name.
 *
 * @param root - The root's kind.
 * @param name - The name.
 * @returns The built-in, none where the root holds no built-in of the name, or none at all.
 */
const builtInOf = (root: string, name: string): Option.Option<BuiltIn> =>
  Option.flatMap(Option.fromNullishOr(builtInsByRoot.get(root)), (held) =>
    Option.fromNullishOr(held.get(name)),
  );

/**
 * The operand bits of some types' base types: each but `any`, once.
 *
 * @param types - The operands' types.
 * @returns Their base types, `any` left out.
 */
const basesOf = (types: readonly Typed[]): ReadonlySet<ValueBase> =>
  new Set(types.flatMap(({ baseType }) => (baseType === "any" ? [] : [baseType])));

/**
 * The base type of no operand: `any`, as "E1 derived" over `OperandOf`
 * (`#pantry/qti/overlay-queries/expression.ts`) states it for an expression whose operands set no
 * bit.
 */
const noOperandBase = "any" satisfies ValueBase;

/**
 * The base type a set of operand bits gives a container, an Index or a Random, and a Delete's later
 * operands give it: {@link noOperandBase} for none, the one for one, `unknown` for several
 * ("E1 derived" over `OperandOf`, `#pantry/qti/overlay-queries/expression.ts`).
 *
 * @param bases - The bits.
 * @returns The base type.
 */
const oneOf = (bases: ReadonlySet<ValueBase>): ValueBase =>
  Arr.match([...bases], {
    onEmpty: () => noOperandBase,
    onNonEmpty: ([only, ...rest]) => (rest.length === 0 ? only : unknownType.baseType),
  });

/**
 * The cardinality a Delete's later operands give it: their one cardinality, `unknown` set aside
 * (no operand's bit, `ValueCardinalityBit`), and `unknown` for none or several (the Delete arm of
 * "E1 derived" over `OperandOf` (`#pantry/qti/overlay-queries/expression.ts`)).
 *
 * @param types - The later operands' types.
 * @returns The cardinality.
 */
const oneCardinalityOf = (types: readonly Typed[]): ValueCardinality =>
  Arr.match(
    [
      ...new Set(
        types.flatMap(({ cardinality }) =>
          cardinality === unknownType.cardinality ? [] : [cardinality],
        ),
      ),
    ],
    {
      onEmpty: () => unknownType.cardinality,
      onNonEmpty: ([only, ...rest]) => (rest.length === 0 ? only : unknownType.cardinality),
    },
  );

/**
 * The tables each kind of reference reads, in the order it reads them (`tableReaders` of
 * `#pantry/grammar/expression.ts`, `TableReader`'s rows).
 */
const tablesRead: ReadonlyMap<string, readonly ReferencedTable[]> = new Map(
  [...Map.groupBy(tableReaders, ({ kind }) => kind)].map(([kind, rows]) => [
    kind,
    rows.map(({ table }) => table),
  ]),
);

/**
 * Read the table a declared reference claims of its declaration (`VariableRefTable`): by its
 * `identifier`, the first table its kind reads that the declaration holds. A reference by another
 * attribute, of a kind that reads no table, or to a declaration that holds none of those its kind
 * reads claims none, and has no claim row, so `Mapped_response` or `Lookup_type` judges a map
 * response, a map response point or a lookup that claims none.
 *
 * @param kind - The reference's kind.
 * @param attribute - The attribute the reference is made by.
 * @param held - The tables its declaration holds.
 * @returns The table, or none.
 */
const claimedTableOf = (
  kind: string,
  attribute: string,
  held: ReadonlySet<string>,
): Option.Option<ReferencedTable> =>
  attribute === "identifier"
    ? Option.flatMap(Option.fromNullishOr(tablesRead.get(kind)), (tables) =>
        Arr.findFirst(tables, (table) => held.has(table)),
      )
    : Option.none();

/**
 * The base type a numeric aggregate gives: `unknown` when an operand is unknown, `integer` when
 * every typed operand is an integer, else `float`.
 *
 * @param operands - Its operands' types.
 * @returns The base type.
 */
const numericOf = (operands: readonly Typed[]): ValueBase => {
  const bases = basesOf(operands);
  if (bases.has("unknown")) {
    return "unknown";
  }

  return bases.size === 1 && bases.has("integer") ? "integer" : "float";
};

/**
 * QTI's eleven base types, the bases a `base-type` spells.
 */
const spelledBases: readonly ValueBase[] = valueBases.filter(
  (base) => base !== noOperandBase && base !== unknownType.baseType,
);

/**
 * The base type an expression's own attribute gives (`E1_derived` over the query
 * `ExpressionAttribute`, `#pantry/qti/queries.ts`): a
 * math operator's `integer` where its `name` is one of the integer operators and `float` for every
 * other (information model §2.11.3.32), an unwritten one among them, as the law oracle reads it;
 * a base value's and a test variables' the base its `base-type` spells exactly, and `unknown`, the
 * type of no type, where the one written spells none, a form AL1 refuses alone and no law types;
 * and a test variables that writes no `base-type` float where it
 * writes a `weight-identifier` (§7.39.5: "When a weighting is specified the result of the
 * expression always has base-type float"), `unknown` where it writes none (spec reading 167).
 *
 * @param kind - The expression's kind.
 * @param inputs - Its `base-type`, `name` and `weight-identifier`, each if written.
 * @returns The base type.
 */
const attributeBaseOf = (
  kind: string,
  inputs: Pick<TypeInputs, "baseTypeLexical" | "name" | "weighted">,
): ValueBase => {
  if (kind === "qti-math-operator") {
    return Option.exists(inputs.name, (written) => integerNames.has(written)) ? "integer" : "float";
  }

  return Option.match(inputs.baseTypeLexical, {
    onNone: () => (inputs.weighted ? "float" : unknownType.baseType),
    onSome: (lexical) =>
      Option.getOrElse(
        Arr.findFirst(spelledBases, (base) => base === lexical),
        () => unknownType.baseType,
      ),
  });
};

/**
 * The type a row holds, as a type alone: its base type and cardinality, `unknown` for none, the
 * type of a variable no declaration types.
 *
 * @param row - A typed row, a reference's or its element's, where it has one.
 * @returns Its type.
 */
const typeIn = (row: Option.Option<Typed>): Typed =>
  Option.match(row, {
    onNone: () => unknownType,
    onSome: ({ baseType, cardinality }) => ({ baseType, cardinality }),
  });

/**
 * What an expression's type derives from beside its kind.
 */
interface TypeInputs {
  readonly baseTypeLexical: Option.Option<string>;
  readonly name: Option.Option<string>;
  readonly operands: readonly Typed[];
  readonly reference: Option.Option<Typed>;
  readonly weighted: boolean;
}

/**
 * A kind's typing as the host derives its type: the typing, and the one result cardinality, and
 * for a fixed typing the one result base, the typing gives where its type is its own.
 */
type Rule =
  | {
      readonly cardinality: ValueCardinality;
      readonly typing: "attribute" | "container" | "first" | "numeric";
    }
  | {
      readonly baseType: ValueBase;
      readonly cardinality: ValueCardinality;
      readonly typing: "fixed";
    }
  | { readonly typing: "declared" | "second" };

/**
 * Read the one value a typing gives where its kind's type is its own.
 *
 * @param kind - The typing's kind.
 * @param values - The values it gives.
 * @param what - What they are, for the defect.
 * @returns The one value.
 * @throws {Error} When the typing gives none or several, which the generator gives no kind of a
 *   typing whose type is its own: a defect of the generated table.
 */
const onlyOf = <A>(kind: string, values: readonly A[], what: string): A =>
  Option.getOrThrowWith(
    values.length === 1 ? Arr.head(values) : Option.none(),
    () =>
      new Error(
        `The typing of ${kind} gives ${String(values.length)} ${what}s, and a typing whose type is its kind's own gives one. Check expressionTypings in #pantry/grammar/expression.ts.`,
      ),
  );

/**
 * Each expression kind's {@link Rule}, read once from the generated typings.
 */
const ruleOf: ReadonlyMap<string, Rule> = new Map(
  typings.map(({ kind, resultBases, resultCardinalities, typing }): readonly [string, Rule] => {
    switch (typing) {
      case "attribute":
      case "container":
      case "first":
      case "numeric": {
        return [
          kind,
          { cardinality: onlyOf(kind, resultCardinalities, "result cardinality"), typing },
        ];
      }
      case "fixed": {
        return [
          kind,
          {
            baseType: onlyOf(kind, resultBases, "result base"),
            cardinality: onlyOf(kind, resultCardinalities, "result cardinality"),
            typing,
          },
        ];
      }
      case "declared":
      case "second": {
        return [kind, { typing }];
      }
      default: {
        return typing satisfies never;
      }
    }
  }),
);

/**
 * Derive an expression's type as the laws do: its kind's typing over its operands' types, its own
 * attributes, and the variable its `identifier` names.
 *
 * @param kind - The expression's kind.
 * @param inputs - Its operands' types, in order, its `base-type` and `name`, and its
 *   `identifier`'s reference.
 * @returns The type.
 * @throws {Error} When the kind has no typing, which every expression kind has: a defect of the
 *   caller, which typed a node that is no expression.
 */
const typeOf = (kind: string, inputs: TypeInputs): Typed => {
  const rule = Option.getOrThrowWith(
    Option.fromNullishOr(ruleOf.get(kind)),
    () =>
      new Error(
        `The kind ${kind} has no expression typing, and every expression kind has one. Type expressions alone.`,
      ),
  );
  switch (rule.typing) {
    case "numeric": {
      return { baseType: numericOf(inputs.operands), cardinality: rule.cardinality };
    }
    case "container":
    case "first": {
      return { baseType: oneOf(basesOf(inputs.operands)), cardinality: rule.cardinality };
    }
    case "second": {
      const later = Arr.drop(inputs.operands, 1);

      return { baseType: oneOf(basesOf(later)), cardinality: oneCardinalityOf(later) };
    }
    case "declared": {
      return typeIn(inputs.reference);
    }
    case "attribute": {
      return {
        baseType: attributeBaseOf(kind, inputs),
        cardinality: rule.cardinality,
      };
    }
    case "fixed": {
      return { baseType: rule.baseType, cardinality: rule.cardinality };
    }
    default: {
      return rule satisfies never;
    }
  }
};

/**
 * One document as the builder reads it: its place in its package, its flat rows indexed by each
 * node's `start`, each node's attributes, children, fold (`#pantry/import/fold.ts`, its nearest
 * interaction among the rest) and processing language, its root's kind, and its named
 * declarations, by name.
 */
interface Document extends Tree {
  readonly attributes: AttributeIndex;
  /**
   * A node's own characters as `Node.chars` holds them (`charactersIn` of
   * `#pantry/import/overlays/characters.ts`).
   */
  readonly charsOf: (node: NodeRow<Composed>) => string;
  readonly declarations: ReadonlyMap<string, DeclarationEntry>;
  readonly folds: Folds;
  /**
   * A node's processing language ({@link languagesOf}), which every node of the document has.
   */
  readonly languageOf: (node: bigint) => Language;
  readonly place: Place;
  readonly rootKind: NodeRow<Composed>["kind"];
  readonly rows: FlatRows<Composed>;
}

/**
 * A document's tree as its flat rows hold it, read through two readers that cannot miss: a
 * node's row by its `start`, and a node's children.
 */
interface Tree {
  /**
   * A node's children, in order: none for a node no row names as its parent.
   */
  readonly childrenOf: (node: bigint) => readonly NodeRow<Composed>[];
  /**
   * A node's row by its `start`: a node's parent's among them, the document node its own parent.
   */
  readonly nodeOf: (node: bigint) => NodeRow<Composed>;
}

/**
 * Index a document's flat rows as a {@link Tree}.
 *
 * @param rows - The document's flat rows.
 * @returns The tree.
 * @throws {Error} From `nodeOf`, when the rows hold no node at the position, which every node's
 *   parent is: a defect of the caller, which read a node of another document.
 */
const treeOf = (rows: FlatRows<Composed>): Tree => {
  const byStart = new Map(rows.nodes.map((node) => [node.start, node] as const));
  const byParent = Map.groupBy(
    rows.nodes.filter((node) => node.parent !== node.start),
    ({ parent }) => parent,
  );

  return {
    childrenOf: (node) => Option.getOrElse(Option.fromNullishOr(byParent.get(node)), Arr.empty),
    nodeOf: (node) =>
      Option.getOrThrowWith(
        Option.fromNullishOr(byStart.get(node)),
        () =>
          new Error(
            `The document's rows hold no node at ${String(node)}, and every node's parent is one. Read a node in its own document's rows.`,
          ),
      ),
  };
};

/**
 * An element's element children, in order.
 *
 * @param doc - The document.
 * @param node - The element.
 * @returns Its children that are elements.
 */
const elementsOf = (doc: Tree, node: bigint): readonly NodeRow<Composed>[] =>
  doc.childrenOf(node).filter(({ kind }) => !notElements.has(kind));

/**
 * The language of a node outside every processing root: `none`, as `Processing`'s `E1_derived`
 * holds a node that is no root and sits under no rule.
 */
const outsideProcessing = "none" satisfies Language;

/**
 * Read each node's processing language in document order: a root's its own, a rule's or an
 * expression's under a rule or an expression its parent's, and every other node's
 * {@link outsideProcessing}.
 *
 * @param rows - The document's flat rows, in document order.
 * @param tree - The rows' tree.
 * @returns The reader of each node's language.
 * @throws {Error} From the reader, when the rows hold no node at the position, every one of which
 *   this reads: a defect of the caller.
 */
const languagesOf = (rows: FlatRows<Composed>, tree: Tree): ((node: bigint) => Language) => {
  const language = new Map<bigint, Language>();
  const languageOf = (node: bigint): Language =>
    Option.getOrThrowWith(
      Option.fromNullishOr(language.get(node)),
      () =>
        new Error(
          `The node at ${String(node)} has no processing language, and every node of the document has one, each read after its parent. Read the language of a node of the same document.`,
        ),
    );
  for (const node of rows.nodes) {
    const parent = tree.nodeOf(node.parent);
    const carried =
      parent.start !== node.start && (rules.has(parent.kind) || expressions.has(parent.kind));
    language.set(
      node.start,
      Option.getOrElse(Option.fromNullishOr(rootLanguage.get(node.kind)), () =>
        carried ? languageOf(parent.start) : outsideProcessing,
      ),
    );
  }

  return languageOf;
};

/**
 * The document's declarations by name: each that has a name (`typedDeclarationOf`), its
 * identifier naming something, whatever its cardinality and base type
 * spell (spec reading 159), the first of a repeated one (which `Declaration key` refuses), with
 * its codes, each none where it has none, and the tables it holds. A reference to a name whose
 * declaration has no cardinality resolves to it, and only a law over the cardinality reads none:
 * AL3 or the value domain refuses the declaration's attribute alone (spec reading 158). A
 * declaration whose identifier is unwritten or names nothing has no name, so no reference resolves
 * to it (spec reading 157).
 *
 * @param rows - The document's flat rows.
 * @param attributes - Each element's attributes.
 * @param childrenOf - Each node's children.
 * @returns The declarations.
 */
const declarationsOf = (
  rows: FlatRows<Composed>,
  attributes: Document["attributes"],
  childrenOf: Tree["childrenOf"],
): Document["declarations"] => {
  const declarations = new Map<string, DeclarationEntry>();
  for (const node of rows.nodes.filter(({ kind }) => declarationKinds.has(kind))) {
    const typed = typedDeclarationOf({
      baseType: lexicalOf({ attributes }, node.start, "base-type"),
      cardinality: lexicalOf({ attributes }, node.start, "cardinality"),
      identifier: valueAt({ attributes }, node, "identifier"),
    });
    for (const name of Option.toArray(typed.name)) {
      if (!declarations.has(name)) {
        declarations.set(name, {
          baseType: typed.baseType,
          cardinality: typed.cardinality,
          kind: node.kind,
          start: node.start,
          tables: new Set(
            childrenOf(node.start).flatMap(({ kind }) => (tableKinds.has(kind) ? [kind] : [])),
          ),
        });
      }
    }
  }

  return declarations;
};

/**
 * Read a document for the builder.
 *
 * @param view - The document's view: its rows, and their folds under its context (spec reading
 *   117), its own for a document no site names, while an included fragment's nodes take the
 *   interaction their includes stand in as their nearest.
 * @param place - Where the document stands in its package.
 * @returns The document, indexed.
 */
const documentOf = (view: DocumentView, place: Place): Document => {
  const { attributes, rows } = view;
  const indexed = treeOf(rows);

  return {
    ...indexed,
    attributes,
    charsOf: charactersIn(rows),
    declarations: declarationsOf(rows, attributes, indexed.childrenOf),
    folds: view.folds,
    languageOf: languagesOf(rows, indexed),
    place,
    rootKind: view.tree.root.kind,
    rows,
  };
};

/**
 * Split a reference's lexical form around the name it spells, or none for a value of its
 * attribute that is a literal: a braced name between its braces, and a bare one between the
 * whitespace around it, where its value names something ({@link namedBy} of
 * {@link attributeValueOf}).
 *
 * @param node - The element.
 * @param attribute - The attribute.
 * @returns The affixes and the name, or none.
 */
const spelledBy = (
  node: NodeRow<Composed>,
  attribute: AttributeRow<Composed>,
): { readonly after: Affix; readonly before: Affix; readonly name: string } | undefined => {
  const spelling = spellingOf.get(`${node.kind} ${attribute.name}`);
  const { lexical } = attribute;
  if (spelling === undefined || (node.kind === "qti-random-float" && floatName.test(lexical))) {
    return undefined;
  }

  if (spelling === "braced") {
    const name = lexical.slice(1, -1);

    return lexical.startsWith("{") && lexical.endsWith("}") && isNcName(name)
      ? { after: "}", before: "{", name }
      : undefined;
  }

  const { lead, trail } = piecesOf(lexical);

  return Option.getOrUndefined(
    Option.map(
      namedBy(attributeValueOf(governorOf(node.kind, node.governs), attribute.name, lexical)),
      (name) => ({ after: trail, before: lead, name }),
    ),
  );
};

/**
 * Resolve a referenced name: to a declaration of the document, else to a built-in variable, else
 * to nothing, with the type each gives.
 *
 * @param doc - The document.
 * @param name - The name.
 * @returns The resolution and the type.
 */
const resolve = (doc: Document, name: string) => {
  const declared = doc.declarations.get(name);
  if (declared !== undefined) {
    return {
      resolution: "declared" as const,
      type: {
        baseType: baseOf(declared.baseType),
        cardinality: cardinalityOf(declared.cardinality),
      },
    };
  }

  return Option.match(builtInOf(doc.rootKind, name), {
    onNone: () => ({ resolution: "unresolved" as const, type: unknownType }),
    onSome: (builtIn) => ({ resolution: "builtIn" as const, type: builtIn.type }),
  });
};

/**
 * Build one reference's row, its element's type to fill.
 *
 * @param doc - The document.
 * @param node - The element.
 * @param attribute - The attribute it makes the reference by.
 * @returns The row, or none for a literal value.
 */
const referenceOf = (
  doc: Document,
  node: NodeRow<Composed>,
  attribute: AttributeRow<Composed>,
): Addition<typeof VariableRef> | undefined => {
  const spelled = spelledBy(node, attribute);
  if (spelled === undefined) {
    return undefined;
  }

  const { resolution, type } = resolve(doc, spelled.name);

  return {
    after: spelled.after,
    attribute: attribute.name,
    baseType: type.baseType,
    before: spelled.before,
    cardinality: type.cardinality,
    ...unfilledTypes,
    identifier: spelled.name,
    language: doc.languageOf(node.start),
    package: doc.place.package,
    path: doc.place.path,
    resolution,
    rootKind: doc.rootKind,
    start: node.start,
  };
};

/**
 * The key text of a row keyed by its element's place and an attribute.
 *
 * @param place - The element's document's place.
 * @param start - The element's position there.
 * @param attribute - The attribute.
 * @returns Their JSON array.
 */
const pairKey = (place: Place, start: bigint, attribute: string): string =>
  keyTextOf(place.package, place.path, start, attribute);

/**
 * Type every expression of a document bottom-up, in reverse document order, so each operand is
 * typed before its operator.
 *
 * @param doc - The document.
 * @param references - Its references, before their element types are filled.
 * @returns Each expression's type.
 */
const typesOf = (
  doc: Document,
  references: ReadonlyMap<string, Addition<typeof VariableRef>>,
): ReadonlyMap<bigint, Typed> => {
  const typed = new Map<bigint, Typed>();
  const operandOf = (child: NodeRow<Composed>): Typed =>
    Option.getOrThrowWith(
      Option.fromNullishOr(typed.get(child.start)),
      () =>
        new Error(
          `The operand at ${String(child.start)} is untyped when its operator is typed, and reverse document order types every expression after the ones below it. Type a document's expressions in reverse document order.`,
        ),
    );
  for (const node of doc.rows.nodes.toReversed()) {
    if (expressions.has(node.kind)) {
      typed.set(
        node.start,
        typeOf(node.kind, {
          baseTypeLexical: lexicalOf(doc, node.start, "base-type"),
          name: lexicalOf(doc, node.start, "name"),
          operands: elementsOf(doc, node.start).flatMap((child) =>
            expressions.has(child.kind) ? [operandOf(child)] : [],
          ),
          reference: Option.fromNullishOr(
            references.get(pairKey(doc.place, node.start, "identifier")),
          ),
          weighted: Option.isSome(lexicalOf(doc, node.start, "weight-identifier")),
        }),
      );
    }
  }

  return typed;
};

/**
 * A node's place, the key every overlay row of it is written under.
 *
 * @param doc - The document.
 * @param node - The node.
 * @returns The place.
 */
const placeOf = (doc: Document, node: NodeRow<Composed>) => ({
  package: doc.place.package,
  path: doc.place.path,
  start: node.start,
});

/**
 * Add a rule's `Processing` row.
 *
 * @param doc - The document.
 * @param node - The rule.
 * @param built - The rows built so far, which this adds to.
 */
const processingRowsOf = (
  doc: Document,
  node: NodeRow<Composed>,
  built: { readonly Processing: Map<string, Addition<typeof Processing>> },
): void => {
  const key = keyTextOf(doc.place.package, doc.place.path, node.start);
  built.Processing.set(key, { ...placeOf(doc, node), language: doc.languageOf(node.start) });
};

/**
 * Add an expression's rows: its `Expression` row, and a base value's `Literal` row, with its
 * `LiteralTyped` where its `base-type` spells a base.
 *
 * @param doc - The document.
 * @param node - The expression.
 * @param type - Its type.
 * @param built - The rows built so far, which this adds to.
 */
const expressionRowsOf = (
  doc: Document,
  node: NodeRow<Composed>,
  type: Typed,
  built: {
    readonly Expression: Map<string, Addition<typeof Expression>>;
    readonly Literal: Map<string, Addition<typeof Literal>>;
    readonly LiteralTyped: Map<string, Addition<typeof LiteralTyped>>;
  },
): void => {
  const key = keyTextOf(doc.place.package, doc.place.path, node.start);
  const at = placeOf(doc, node);
  built.Expression.set(key, { ...at, ...type, language: doc.languageOf(node.start) });

  if (node.kind === "qti-base-value") {
    const text = doc.childrenOf(node.start).map(doc.charsOf).join("");
    built.Literal.set(key, { ...at, baseType: type.baseType, text });

    // A literal is typed where its base-type spells a code, the one its type is (7230d050).
    const typeCode = spelledBaseTypeOf(lexicalOf(doc, node.start, "base-type"));
    if (type.baseType !== "unknown" && Option.isSome(typeCode)) {
      built.LiteralTyped.set(key, { ...at, text, typeCode: typeCode.value });
    }
  }
};

/**
 * Fill a reference's element type, an expression's own, once every expression is typed.
 *
 * @param typed - Each expression's type.
 * @param reference - The reference's row.
 * @returns The row with it filled, `unknown` where its element is no expression.
 */
const withTypes = (
  typed: ReadonlyMap<bigint, Typed>,
  reference: Addition<typeof VariableRef>,
): Addition<typeof VariableRef> => {
  const element = typeIn(Option.fromNullishOr(typed.get(reference.start)));

  return {
    ...reference,
    elementBase: element.baseType,
    elementCardinality: element.cardinality,
  };
};

/**
 * Write each table a declared reference claims of its declaration ({@link claimedTableOf}), a row
 * of its own where it claims one. The declaration its name resolves to, whatever its cardinality
 * spells (spec reading 159), is its document's of the name, which the laws read through a query
 * (`#pantry/qti/overlay-queries/reference.ts`), so no row here copies it. A reference to a built-in
 * variable or to nothing claims none.
 *
 * @param doc - The document.
 * @param references - Its references, their types filled.
 * @returns The rows, by {@link pairKey}.
 * @throws {Error} When a declared reference's name has no declaration of the document, which its
 *   resolution read: a defect of the builder.
 */
const tableClaimsOf = (
  doc: Document,
  references: ReadonlyMap<string, Addition<typeof VariableRef>>,
): ReadonlyMap<string, Addition<typeof VariableRefTable>> => {
  const tables = new Map<string, Addition<typeof VariableRefTable>>();
  for (const [at, reference] of references) {
    if (reference.resolution === "declared") {
      const declared = Option.getOrThrowWith(
        Option.fromNullishOr(doc.declarations.get(reference.identifier)),
        () =>
          new Error(
            `The reference by ${reference.attribute} at ${String(reference.start)} of ${reference.path} resolved to a declaration of ${reference.identifier}, which its document's declarations do not hold. Resolve a reference against its own document's declarations.`,
          ),
      );
      for (const table of Option.toArray(
        claimedTableOf(doc.nodeOf(reference.start).kind, reference.attribute, declared.tables),
      )) {
        tables.set(at, {
          attribute: reference.attribute,
          package: reference.package,
          path: reference.path,
          start: reference.start,
          table,
        });
      }
    }
  }

  return tables;
};

/**
 * Build the rows of every expression and processing overlay of one document.
 *
 * An expression's type is derived after its operands', and a reference's element type and a
 * holder's type are filled once their expressions are typed, so each rule the laws state reads
 * values already derived.
 *
 * @param view - The document's view.
 * @param place - Where the document stands in its package, the key every row holds.
 * @returns Every overlay's rows.
 */
export const rowsOf = (view: DocumentView, place: Place): ExpressionRows => {
  const doc = documentOf(view, place);
  const references = new Map<string, Addition<typeof VariableRef>>();
  for (const attribute of doc.rows.attributes) {
    const reference = referenceOf(doc, doc.nodeOf(attribute.start), attribute);
    if (reference !== undefined) {
      references.set(pairKey(place, attribute.start, attribute.name), reference);
    }
  }

  const typed = typesOf(doc, references);
  for (const [at, reference] of references) {
    references.set(at, withTypes(typed, reference));
  }

  const built = {
    Expression: new Map<string, Addition<typeof Expression>>(),
    Literal: new Map<string, Addition<typeof Literal>>(),
    LiteralTyped: new Map<string, Addition<typeof LiteralTyped>>(),
    Processing: new Map<string, Addition<typeof Processing>>(),
    VariableRef: references,
  };
  for (const node of doc.rows.nodes) {
    if (rules.has(node.kind)) {
      processingRowsOf(doc, node, built);
    }

    const type = typed.get(node.start);
    if (type !== undefined) {
      expressionRowsOf(doc, node, type, built);
    }
  }

  const claims = tableClaimsOf(doc, references);

  return {
    ...built,
    VariableRefTable: claims,
  };
};

/**
 * One document as the package-level builder reads it: its view and where it stands in its
 * package, the documents of the package by their paths among it.
 */
export interface AssembledExpressionInput {
  readonly ids: TestIds & Pick<DocumentPlace, "documentAt">;
  readonly view: DocumentView;
}

/**
 * A resource of the package as an item ref's target reads it: the two fields of a row of the query
 * `TypedHref` that `ItemRefTarget` joins an item ref's href on, `target`, the path the resource's
 * href is compared by, and its type, as the package builder reads them on the host
 * (`#pantry/import/overlays/package.ts` `typedHrefsOf`).
 */
export type NamedResource = Pick<TypedHrefRow, "target" | "type">;

/**
 * The rows a package's documents build together, one keyed set per relation: what each item ref
 * names.
 */
export interface AssembledExpressionRows {
  readonly ItemRefDocument: ReadonlyMap<string, Addition<typeof ItemRefDocument>>;
  readonly ItemRefHref: ReadonlyMap<string, Addition<typeof ItemRefHref>>;
}

/**
 * Walk an instance's subtree in pre-order.
 *
 * @param member - The instance.
 * @returns It and every instance below it.
 */
const subtreeOf = (
  member: InstanceMember | InstanceRoot,
): readonly (InstanceMember | InstanceRoot)[] => [member, ...member.children.flatMap(subtreeOf)];

/**
 * One instance of an assembly at its place there: its pre-order position, `Instance.start` as the
 * instance tree draws it, the root's 0.
 */
interface Placed {
  readonly instance: InstanceMember | InstanceRoot;
  readonly start: bigint;
}

/**
 * Number every instance of an assembly's tree by its pre-order position.
 *
 * @param root - The assembly's root instance.
 * @returns Each instance at its position, in pre-order.
 */
const instancesIn = (root: InstanceRoot): readonly Placed[] =>
  subtreeOf(root).map((instance, at) => ({ instance, start: BigInt(at) }));

/**
 * Write what each item ref names (the UP audit's B2 and B3), each a row only where the package
 * holds it (lane NIL's NS3: a missing value is a row of its own relation, never a sentinel): its
 * href's path, where the href resolves to an entry of the package, and none for one that does not
 * (an empty href, which names its own document, an external one, or one the importer cannot
 * resolve), which "Item ref target" refuses through its href's containment in `ItemRefHref`
 * (reading 155); for an item, the document there, and none where the package holds no document at
 * that path. Its target's type is read as the database derives it (the query `ItemRefTarget`,
 * `#pantry/qti/queries.ts`): the item type where a resource of it names the path, else the first
 * LTI type one names, and none where neither does.
 *
 * @param documents - Every document of the package.
 * @param resources - The package's resources of a type the importer reads.
 * @returns Each item ref's href and item, by the item ref (`[path, start]`).
 */
export const assembledExpressionRowsOf = (
  documents: readonly AssembledExpressionInput[],
  resources: Iterable<NamedResource>,
): AssembledExpressionRows => {
  const typesAt = Map.groupBy(resources, ({ target }) => target);
  const preferred = [itemResourceType, ...linkResourceTypes];
  const itemRefHrefs = new Map<string, Addition<typeof ItemRefHref>>();
  const itemRefDocuments = new Map<string, Addition<typeof ItemRefDocument>>();
  for (const { ids, view } of documents) {
    for (const href of itemRefPathsOf(view, ids)) {
      const key = keyTextOf(href.path, href.start);
      const at = { package: href.package, path: href.path, start: href.start };
      if (href.resolved) {
        itemRefHrefs.set(key, { ...at, target: href.target });
      }

      const types = new Set(
        Option.getOrElse(Option.fromNullishOr(typesAt.get(href.target)), Arr.empty).map(
          ({ type }) => type,
        ),
      );
      const type = Arr.findFirst(preferred, (wanted) => types.has(wanted));
      const document = Option.contains(type, itemResourceType)
        ? ids.documentAt(href.target)
        : Option.none();
      if (Option.isSome(document)) {
        itemRefDocuments.set(key, { ...at, target: document.value });
      }
    }
  }

  return { ItemRefDocument: itemRefDocuments, ItemRefHref: itemRefHrefs };
};

/**
 * A package's variable references placed under each instance of an item's assembly (spec reading
 * 117).
 */
export interface PlacedVariableRows {
  readonly PlacedVariableRef: ReadonlyMap<string, Addition<typeof PlacedVariableRef>>;
}

/**
 * Resolve a name among an item's declarations, else its built-in variables, else to nothing.
 *
 * @param declaration - The item's declaration of the name, if any.
 * @param name - The name.
 * @returns The resolution.
 */
const placedResolutionOf = (
  declaration: DocumentName | undefined,
  name: string,
): Addition<typeof PlacedVariableRef>["resolution"] => {
  if (declaration !== undefined) {
    return "declared";
  }

  return Option.isSome(builtInOf(itemKind, name)) ? "builtIn" : "unresolved";
};

/**
 * Build a package's variable references in place (spec reading 117): under each instance of an
 * item's assembly, every `VariableRef` of the instance's document, its name resolved as an item's
 * own is, among the item's declarations, whatever their cardinality spells (spec reading 159),
 * else to one of an item's built-in variables, else to nothing, which "Variable declared" refuses.
 * The declaration a declared one names is the item's of its name, which the laws read through a
 * query.
 *
 * @param input - The package's rows the placed references read.
 * @param input.declarations - Every name the package's documents declare (`documentNamesOf`).
 * @param input.instances - Every assembly's root instance, its tree nested (Q5.13's
 *   `assembledRowsOf`).
 * @param input.references - Every document's references ({@link rowsOf}'s `VariableRef`).
 * @returns The rows.
 */
export const placedVariableRowsOf = (input: {
  readonly declarations: Iterable<DocumentName>;
  readonly instances: Iterable<InstanceRoot>;
  readonly references: Iterable<Addition<typeof VariableRef>>;
}): PlacedVariableRows => {
  const declared = new Map(
    [...input.declarations].map((named) => [keyTextOf(named.path, named.name), named] as const),
  );
  const referencesOf = Map.groupBy(input.references, ({ path }) => path);
  const placed = new Map<string, Addition<typeof PlacedVariableRef>>();
  for (const root of input.instances) {
    for (const { instance, start } of root.assemblyKind === itemKind ? instancesIn(root) : []) {
      for (const reference of Option.getOrElse(
        Option.fromNullishOr(referencesOf.get(instance.document)),
        Arr.empty,
      )) {
        const declaration = declared.get(keyTextOf(root.assembly, reference.identifier));
        const at = keyTextOf(
          root.assembly,
          start,
          reference.path,
          reference.start,
          reference.attribute,
        );
        placed.set(at, {
          assembly: root.assembly,
          attribute: reference.attribute,
          identifier: reference.identifier,
          instance: start,
          package: root.package,
          path: reference.path,
          resolution: placedResolutionOf(declaration, reference.identifier),
          rootKind: itemKind,
          start: reference.start,
        });
      }
    }
  }

  return { PlacedVariableRef: placed };
};
