/**
 * The producers of the law oracle's laws over the expressions (O4, lane OL): each law the oracle
 * declared and never raised, stated on the host from its source in the oracle's `lawSources` and
 * the schema's statement of it in `src/qti/expressions.ts`, over the grammar's typing of every
 * expression kind (`#pantry/grammar/expression.ts` `expressionTypings`).
 *
 * Each document is typed as the schema types it, once in each of its placements (spec reading 117):
 * every expression's value has a base type and a cardinality, `unknown` for a variable no
 * declaration types, which every rule passes; every processing element and expression is written in
 * the language its processing root opens, `none` outside any; and every variable reference resolves
 * among the placement's root's declarations, else among the root's built-in variables, else, under
 * a test, as its one reading through a scope (spec reading 167), else to nothing.
 *
 * A document that heads its assembly, or is in none, is typed in its own placement with what it
 * splices: {@link expressionDocumentBreaches}. A document a test places beyond its own copy is
 * typed in each test that places it: {@link expressionPackageBreaches}. The oracle types an item's
 * located template in the item's placement with {@link placedBreachesOf}.
 *
 * - **Over each placed expression** (`PlacedExpression`): `Operand fit`, `One base`, `Condition
 *   type`, `Outcome only`.
 * - **Over each placed reference** (`PlacedVariableRef`): `Set type`, `Lookup type`, `Reference
 *   type`, `Template reads`, `Mapped response`, `Variable kind` (the declaration kind each element
 *   reads or sets, `ReferenceDeclaration`), and in an item's located template, `Variable
 *   declared`.
 * - **Over each literal:** `Literal lexical`.
 */
import { regex } from "arkregex";
import { Array as Arr, Option } from "effect";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import {
  conditionKinds,
  expressionTypings,
  integerMathOperators,
  lookupKind,
  processingRoots,
  referenceBaseRows,
  ruleKinds,
  setKinds,
} from "#pantry/grammar/expression.ts";
import type { ExpressionTyping } from "#pantry/grammar/expression.ts";
import {
  breachAt,
  collapsed,
  elementsOf,
  typedOr,
  typedValueOf,
  valueOf,
} from "#pantry/test/oracle-view.ts";
import type { LawBreach, PackageRows, Row, View } from "#pantry/test/oracle-view.ts";
import { assembledDocumentsOf, inRootCopy, testsOf } from "#pantry/test/oracle-laws/assembly.ts";
import { ncNameForm as ncName, typedValueHolds } from "#pantry/test/oracle-laws/typed.ts";

/**
 * The laws this module produces.
 */
export const expressionLaws = [
  "Operand fit",
  "One base",
  "Condition type",
  "Set type",
  "Lookup type",
  "Reference type",
  "Outcome only",
  "Template reads",
  "Mapped response",
  "Literal lexical",
  "Variable kind",
  "Variable declared",
] as const;

/**
 * A law of {@link expressionLaws}.
 */
type ExpressionLaw = (typeof expressionLaws)[number];

/**
 * A breach of one of this module's laws.
 */
type Breach = LawBreach<ExpressionLaw>;

/**
 * A value's type: its base type and its cardinality, as the schema's `ValueBase` and
 * `ValueCardinality` codes spell them (`any` a null's base, `unknown` a type no declaration says).
 */
export interface Type {
  readonly base: string;
  readonly cardinality: string;
}

/**
 * The type no declaration says, which every rule passes.
 */
const unknownType: Type = { base: "unknown", cardinality: "unknown" };

/**
 * The base types that say nothing: `any`, which passes every rule, and `unknown`.
 */
const silent: ReadonlySet<string> = new Set(["any", "unknown"]);

/**
 * Each expression kind's typing, by kind.
 */
const typings: ReadonlyMap<string, ExpressionTyping> = new Map(
  expressionTypings.map((typing) => [typing.kind, typing]),
);

/**
 * The rule and processing kinds, whose language their root opens.
 */
const rules: ReadonlySet<string> = new Set(ruleKinds);

/**
 * The language each processing root opens.
 */
const rootLanguages: ReadonlyMap<string, string> = new Map(processingRoots);

/**
 * The declaration kinds each processing element may name by its `identifier`, the schema's
 * `ReferenceDeclaration` (information model §7.10.1, §7.12.1, §7.47.1, §7.22.1, §6.9.46, §5.87.1,
 * §6.32.3, §6.50.1, §6.50.4, §6.50.5): a variable or a default any item variable's (§2.2.2:
 * "context, response, outcome or template variables").
 */
const referenceDeclarations: ReadonlyMap<string, readonly string[]> = new Map([
  ["qti-correct", ["qti-response-declaration"]],
  [
    "qti-default",
    [
      "qti-context-declaration",
      "qti-outcome-declaration",
      "qti-response-declaration",
      "qti-template-declaration",
    ],
  ],
  ["qti-lookup-outcome-value", ["qti-outcome-declaration"]],
  ["qti-map-response", ["qti-response-declaration"]],
  ["qti-map-response-point", ["qti-response-declaration"]],
  ["qti-set-correct-response", ["qti-response-declaration"]],
  ["qti-set-default-value", ["qti-outcome-declaration", "qti-response-declaration"]],
  ["qti-set-outcome-value", ["qti-outcome-declaration"]],
  ["qti-set-template-value", ["qti-template-declaration"]],
  [
    "qti-variable",
    [
      "qti-context-declaration",
      "qti-outcome-declaration",
      "qti-response-declaration",
      "qti-template-declaration",
    ],
  ],
]);

/**
 * The declaration kinds each element names by its `identifier`.
 *
 * @param kind - The referring element's kind.
 * @returns The kinds, none for an element that names no variable by its `identifier`.
 */
export const declarationKindsOf = (kind: string): readonly string[] =>
  referenceDeclarations.get(kind) ?? [];

/**
 * The tables a reference's element reads in its variable's declaration: a map response's mapping,
 * a map response point's area mapping, and a lookup's match or interpolation table.
 */
const tableKinds: ReadonlyMap<string, readonly string[]> = new Map([
  ["qti-lookup-outcome-value", ["qti-match-table", "qti-interpolation-table"]],
  ["qti-map-response", ["qti-mapping"]],
  ["qti-map-response-point", ["qti-area-mapping"]],
]);

/**
 * Read a variable's base type as an expression type's: the declaration code itself, which the
 * expression types spell alike, and `unknown` where the variable has none, a record's, or one
 * whose declaration writes none (information model tables 4.5.3 and 5.34.3: "Variables with
 * record cardinality have no base-type").
 *
 * @param baseType - The variable's base type, none where it has none.
 * @returns The value base.
 */
const valueBaseOf = (baseType: Option.Option<string>): string =>
  Option.getOrElse(baseType, () => "unknown");

/**
 * A declaration a reference names, in the document of its placement's root that holds it.
 */
interface Declaration {
  readonly node: Row;
  readonly view: View;
}

/**
 * One variable reference a processing element makes, resolved in its placement (spec reading
 * 117): the attribute, the name, the declaration it names or the built-in it is, and its type.
 * `declarationKind` is the declaration's kind, or the kind a built-in stands as, and none for a
 * name that resolves to nothing or that a test reads through a scope (`read`, spec reading 167).
 */
interface Reference {
  readonly attribute: string;
  readonly declaration: Option.Option<Declaration>;
  readonly declarationKind: Option.Option<string>;
  readonly identifier: string;
  readonly node: Row;
  readonly resolution: "builtIn" | "declared" | "read" | "unresolved";
  readonly type: Type;
}

/**
 * A reference as a test reads it through a scope: its name, the attribute that makes it and its
 * element's kind.
 */
export interface ScopedReference {
  readonly attribute: string;
  readonly identifier: string;
  readonly kind: string;
}

/**
 * Where a placement resolves its documents' references (spec reading 117, `PlacedVariableRef`):
 * its assembly's root's declarations, by name, the first of a name; the root's kind, whose
 * built-in variables a name may be; and, under a test, the type of a reference's one reading
 * through a scope, none where it has none, two, or one through an item ref that names no item
 * document (readings 48, 110 and 167).
 */
export interface PlacementScope {
  readonly declarations: ReadonlyMap<string, Declaration>;
  readonly read: (reference: ScopedReference) => Option.Option<Type>;
  readonly rootKind: string;
}

/**
 * The scope of a document's own placement where it heads its assembly: its own declarations and
 * its root's built-ins, with no reading through a scope.
 *
 * @param rows - The document, with every fragment it splices.
 * @param grammar - The composed grammar, whose declaration kinds it reads.
 * @param read - The readings through a scope, under a test.
 * @returns The scope.
 */
export const rootScopeOf = (
  rows: View,
  grammar: ComposedGrammar,
  read: PlacementScope["read"],
): PlacementScope => {
  const declarations = new Map<string, Declaration>();
  for (const node of rows.members) {
    if (grammar.references.declarationKind.has(node.kind)) {
      for (const identifier of Option.toArray(typedValueOf(rows, node.start, "identifier"))) {
        if (!declarations.has(identifier)) {
          declarations.set(identifier, { node, view: rows });
        }
      }
    }
  }

  return {
    declarations,
    read,
    rootKind: Option.match(rows.root, { onNone: () => "", onSome: ({ kind }) => kind }),
  };
};

/**
 * One document typed: each expression's type and each element's language, and its references.
 */
export interface Typed {
  readonly languageOf: (node: Row) => string;
  readonly references: readonly Reference[];
  readonly rows: View;
  readonly typeOf: (node: Row) => Type;
}

/**
 * Read a reference attribute's value as the name it spells (`VariableReference`): a bare name, an
 * NCName with the whitespace a collapsing type absorbs (no `INF` or `NaN` on a float's bound), or a
 * braced one, the name between braces exactly.
 *
 * @param lexical - The attribute's lexical form.
 * @param spelling - How the attribute spells a reference.
 * @param kind - The element's kind.
 * @returns The name, none for a literal.
 */
const spelledName = (lexical: string, spelling: string, kind: string): Option.Option<string> => {
  if (spelling === "braced") {
    return Option.fromNullishOr(
      regex("^\\{(?<name>[^{}]+)\\}$", "u").exec(lexical)?.groups?.["name"],
    ).pipe(Option.filter((name) => ncName.test(name)));
  }

  const name = collapsed(lexical);

  return ncName.test(name) &&
    !(kind === "qti-random-float" && regex("^(?:INF|NaN)$", "u").test(name))
    ? Option.some(name)
    : Option.none();
};

/**
 * Read the base type an attribute-typed expression's attribute gives it: a base value's and a test
 * variables' `base-type` as its type reads it (`typedValueOf`), `unknown` where the form lies
 * outside the type's lexical space, a type no law can know; a test variables that writes no
 * `base-type`, float where it writes a `weight-identifier` (information model §7.39.5: "When a
 * weighting is specified the result of the expression always has base-type float"), and `unknown`
 * where it writes none, a type its document alone does not give (§7.39.6; spec reading 167); a math
 * operator's `name`, `integer` for `signum`, `floor` and `ceil` and `float` for every other
 * (information model §2.11.3.32).
 *
 * @param rows - The document.
 * @param node - The expression.
 * @returns The base type.
 */
const attributeBaseOf = (rows: View, node: Row): string => {
  if (node.kind === "qti-math-operator") {
    return new Set<string>(integerMathOperators).has(
      Option.getOrElse(valueOf(rows, node.start, "name"), () => ""),
    )
      ? "integer"
      : "float";
  }

  if (
    node.kind === "qti-test-variables" &&
    Option.isNone(valueOf(rows, node.start, "base-type")) &&
    Option.isSome(valueOf(rows, node.start, "weight-identifier"))
  ) {
    return "float";
  }

  return Option.getOrElse(typedValueOf(rows, node.start, "base-type"), () => "unknown");
};

/**
 * The one base type of a set of operands' base types, `any` set aside: `any` for none, `unknown`
 * for several (the container arm of the schema's "E1 derived" over `OperandOf`
 * (`#pantry/qti/overlay-queries/expression.ts`)).
 *
 * @param held - The base types.
 * @returns The one base type.
 */
const oneBaseOf = (held: ReadonlySet<string>): string => {
  if (held.size === 0) {
    return "any";
  }

  return held.size === 1 ? ([...held][0] ?? "unknown") : "unknown";
};

/**
 * The base types a list of types holds, `any` set aside, as `ValueBaseBit` reads them.
 *
 * @param types - The types.
 * @returns The base types.
 */
const basesOf = (types: readonly Type[]): ReadonlySet<string> =>
  new Set(
    types
      .values()
      .map(({ base }) => base)
      .filter((base) => base !== "any"),
  );

/**
 * What an expression's type is derived from: its kind's typing, its operands' types, its
 * reference's type for a declared typing, and the element itself for an attribute typing.
 */
interface TypingInput {
  readonly declared: Type;
  readonly node: Row;
  readonly operands: readonly Type[];
  readonly rows: View;
  readonly typing: ExpressionTyping;
}

/**
 * The cardinality of a kind of one result cardinality, `unknown` for a kind of several.
 *
 * @param typing - The kind's typing.
 * @returns The cardinality.
 */
const resultCardinalityOf = (typing: ExpressionTyping): string =>
  typing.resultCardinalities.length === 1
    ? (typing.resultCardinalities[0] ?? "unknown")
    : "unknown";

/**
 * Type an expression by its operands' one base type and its kind's one result cardinality: a
 * container's, an Index's and a Random's (the container arm of the schema's "E1 derived" over
 * `OperandOf`).
 *
 * @param input - What its type is derived from.
 * @returns The type.
 */
const oneBaseTyped = ({ operands, typing }: TypingInput): Type => ({
  base: oneBaseOf(basesOf(operands)),
  cardinality: resultCardinalityOf(typing),
});

/**
 * Each typing's derivation of an expression's type (the schema's "E1 derived" over `OperandOf` and
 * the fixed, declared and attribute typings `ResultBase`, `VariableRef` and `ExpressionAttribute`
 * give):
 *
 * - `fixed`: the kind's one result;
 * - `declared`: the variable its `identifier` names, a weighted integer one float;
 * - `attribute`: its own attribute's base type, single, or a test variables' multiple;
 * - `numeric`: `unknown` when an operand is, `integer` when every operand is, `float` otherwise;
 * - `container`: its operands' one base type, `any` for none, `unknown` for several;
 * - `first`: its operands' one base type, as `container`'s;
 * - `second`: its later operands' one base type and one cardinality.
 */
const typers: Readonly<Record<ExpressionTyping["typing"], (input: TypingInput) => Type>> = {
  attribute: ({ node, rows, typing }) => ({
    base: attributeBaseOf(rows, node),
    cardinality: resultCardinalityOf(typing),
  }),
  container: oneBaseTyped,
  /**
   * A weighted variable's value is its variable's "subject to the type promotion of weighted
   * outcomes" (information model §7.47): "When applying a weight to the value of a variable with
   * base-type integer the value is subject to type promotion and the result of the expression has
   * base-type float" (§7.47.2), every other base kept.
   */
  declared: ({ declared, node, rows }) =>
    declared.base === "integer" && Option.isSome(valueOf(rows, node.start, "weight-identifier"))
      ? { ...declared, base: "float" }
      : declared,
  first: oneBaseTyped,
  fixed: ({ typing }) => ({
    base: typing.resultBases[0] ?? "unknown",
    cardinality: resultCardinalityOf(typing),
  }),
  numeric: ({ operands, typing }) => {
    const bases = basesOf(operands);
    let base = "float";
    if (bases.has("unknown")) {
      base = "unknown";
    } else if (bases.size === 1 && bases.has("integer")) {
      base = "integer";
    }

    return { base, cardinality: resultCardinalityOf(typing) };
  },
  second: ({ operands }) => {
    const tail = operands.slice(1);
    const cardinalities = new Set(
      tail.map(({ cardinality }) => cardinality).filter((cardinality) => cardinality !== "unknown"),
    );

    return {
      base: oneBaseOf(basesOf(tail)),
      cardinality: cardinalities.size === 1 ? ([...cardinalities][0] ?? "unknown") : "unknown",
    };
  },
};

/**
 * Type one document: resolve every reference, then type every expression bottom-up and give every
 * processing element its language.
 *
 * @param rows - The document.
 * @param grammar - The composed grammar.
 * @param scope - Where its placement resolves its references, its own where it heads its
 *   assembly.
 * @returns The typed document.
 */
export const typedOf = (
  rows: View,
  grammar: ComposedGrammar,
  scope: PlacementScope = rootScopeOf(rows, grammar, () => Option.none()),
): Typed => {
  const { rootKind } = scope;
  const builtIns = new Map(
    grammar.references.builtIn.rows
      .filter(({ root }) => root === rootKind)
      .map((row) => [row.variable, row] as const),
  );
  const builtInBases = new Map(
    grammar.references.builtInBaseType.rows
      .filter(({ root }) => root === rootKind)
      .map(({ baseType, variable }) => [variable, baseType] as const),
  );
  const processing = new Set([...typings.keys(), ...rules]);
  const references = rows.members.flatMap((node): readonly Reference[] =>
    processing.has(node.kind)
      ? grammar.references.variableReference.rows
          .filter(({ kind }) => kind === node.kind)
          .flatMap(({ attribute, spelling }) =>
            Option.toArray(
              Option.flatMap(valueOf(rows, node.start, attribute), (lexical) =>
                spelledName(lexical, spelling, node.kind),
              ),
            ).map((identifier): Reference => {
              const declaration = scope.declarations.get(identifier);
              const builtIn = builtIns.get(identifier);
              if (declaration !== undefined) {
                return {
                  attribute,
                  declaration: Option.some(declaration),
                  declarationKind: Option.some(declaration.node.kind),
                  identifier,
                  node,
                  resolution: "declared",
                  /**
                   * A base type or a cardinality outside its domain types nothing, as an unwritten
                   * one does: its declaration's value domain refuses it alone (the ruling of
                   * 2026-11-06; lane NIL's audit, B11).
                   */
                  type: {
                    base: valueBaseOf(
                      typedValueOf(declaration.view, declaration.node.start, "base-type"),
                    ),
                    cardinality: Option.getOrElse(
                      typedValueOf(declaration.view, declaration.node.start, "cardinality"),
                      () => "unknown",
                    ),
                  },
                };
              }

              return builtIn === undefined
                ? Option.match(scope.read({ attribute, identifier, kind: node.kind }), {
                    onNone: (): Reference => ({
                      attribute,
                      declaration: Option.none(),
                      declarationKind: Option.none(),
                      identifier,
                      node,
                      resolution: "unresolved",
                      type: unknownType,
                    }),
                    onSome: (type): Reference => ({
                      attribute,
                      declaration: Option.none(),
                      declarationKind: Option.none(),
                      identifier,
                      node,
                      resolution: "read",
                      type,
                    }),
                  })
                : {
                    attribute,
                    declaration: Option.none(),
                    declarationKind: Option.some(builtIn.declaration),
                    identifier,
                    node,
                    resolution: "builtIn",
                    type: {
                      base: valueBaseOf(Option.fromUndefinedOr(builtInBases.get(identifier))),
                      cardinality: builtIn.cardinality,
                    },
                  };
            }),
          )
      : [],
  );
  const named = new Map(
    references
      .filter(({ attribute }) => attribute === "identifier")
      .map((reference) => [reference.node.start, reference] as const),
  );
  const languages = new Map<bigint, string>();
  /**
   * A language is its root's, carried down through rules and expressions; the walk up stops at a
   * node it has met, so a cycle of parent links or a second root ends it.
   */
  const languageOf = (node: Row): string => {
    const chain: Row[] = [];
    const met = new Set<bigint>();
    let at: Row | undefined = node;
    let language = "none";
    while (at !== undefined && !met.has(at.start)) {
      const known = languages.get(at.start);
      if (known !== undefined) {
        language = known;
        break;
      }

      met.add(at.start);
      chain.push(at);

      const opened = rootLanguages.get(at.kind);
      if (opened !== undefined) {
        language = opened;
        break;
      }

      const parent = rows.byStart.get(at.parent);
      at =
        parent !== undefined &&
        parent.start > 0n &&
        (rules.has(parent.kind) || typings.has(parent.kind))
          ? parent
          : undefined;
    }

    for (const held of chain) {
      languages.set(held.start, language);
    }

    return language;
  };
  const types = new Map<bigint, Type>();
  const operandsOf = (node: Row): readonly Row[] =>
    elementsOf(rows, node.start).filter(({ kind }) => typings.has(kind));
  /**
   * An expression met again before its type is known stands on a cycle of parent links, which
   * the tree laws refuse; it is typed unknown, so the typing ends.
   */
  const typing = new Set<bigint>();
  const typeOf = (node: Row): Type => {
    const known = types.get(node.start);
    if (known !== undefined) {
      return known;
    }

    if (typing.has(node.start)) {
      return unknownType;
    }

    typing.add(node.start);

    const kindTyping = typings.get(node.kind);
    const type =
      kindTyping === undefined
        ? unknownType
        : typers[kindTyping.typing]({
            declared: named.get(node.start)?.type ?? unknownType,
            node,
            operands: operandsOf(node).map(typeOf),
            rows,
            typing: kindTyping,
          });
    types.set(node.start, type);

    return type;
  };

  return { languageOf, references, rows, typeOf };
};

/**
 * Judge each expression of a typed document by the operand laws (P23, P21, P25): its operands'
 * base types and cardinalities, first and later, are among those its kind takes; a kind that takes
 * one base type or one cardinality gets one; a condition is boolean and single; a test-only
 * operator, and a `qti-variable` that writes a `weight-identifier` (spec reading 199), stands in
 * outcome processing.
 *
 * @param typed - The document.
 * @returns The breaches.
 */
const expressionBreachesOf = (typed: Typed): readonly Breach[] =>
  typed.rows.members.flatMap((node): readonly Breach[] => {
    const typing = typings.get(node.kind);
    if (typing === undefined) {
      return [];
    }

    const { rows } = typed;
    const operands = elementsOf(rows, node.start)
      .map((child, at) => ({ at, child }))
      .filter(({ child }) => typings.has(child.kind))
      .map(({ at, child }) => ({ lead: at === 0, type: typed.typeOf(child) }));
    const bases = new Set([...typing.operandBases, "unknown"]);
    const unfit = operands.find(
      ({ lead, type }) =>
        (type.base !== "any" && !bases.has(type.base)) ||
        (type.cardinality !== "unknown" &&
          !(lead ? typing.lead : typing.tail).some((held) => held === type.cardinality)),
    );
    const heldBases = new Set(
      operands.map(({ type }) => type.base).filter((base) => base !== "any" && base !== "unknown"),
    );
    const heldCardinalities = new Set(
      operands
        .map(({ type }) => type.cardinality)
        .filter((cardinality) => cardinality !== "unknown"),
    );
    const parent = rows.byStart.get(node.parent);
    const own = typed.typeOf(node);
    const condition =
      parent !== undefined &&
      conditionKinds.some((kind) => kind === parent.kind) &&
      !(
        (own.base === "boolean" || silent.has(own.base)) &&
        (own.cardinality === "single" || own.cardinality === "unknown")
      );
    const language = typed.languageOf(node);
    /**
     * Whether the expression stands only in outcome processing: its kind's typing says so, or it is
     * a weighted variable, which stands only in a test's outcome processing (§7.47.2: "Weights are
     * defined only in the test context (and hence only in outcomes processing)"; spec reading 199).
     */
    const outcomeOnly =
      typing.outcomeOnly ||
      (node.kind === "qti-variable" &&
        Option.isSome(valueOf(rows, node.start, "weight-identifier")));

    return [
      ...(unfit === undefined
        ? []
        : [
            breachAt(rows, node, "Operand fit", {
              baseType: unfit.type.base,
              cardinality: unfit.type.cardinality,
            }),
          ]),
      ...((typing.oneBase && heldBases.size > 1) ||
      (typing.oneCardinality && heldCardinalities.size > 1)
        ? [
            breachAt(rows, node, "One base", {
              bases: [...heldBases].join(" "),
              cardinalities: [...heldCardinalities].join(" "),
            }),
          ]
        : []),
      ...(condition
        ? [
            breachAt(rows, node, "Condition type", {
              baseType: own.base,
              cardinality: own.cardinality,
              parentKind: parent.kind,
            }),
          ]
        : []),
      ...(outcomeOnly && language !== "outcome"
        ? [breachAt(rows, node, "Outcome only", { language })]
        : []),
    ];
  });

/**
 * The literal stand-ins that may name an item variable of any kind, by the specification: each an
 * `IntOrIdentifier` (information model §9.3.2, "the union of the primitiveType 'Int' and the
 * primitiveType of 'NCName'"), `qti-index`'s `n` (§5.72) and `qti-repeat`'s `number-repeats`
 * (§5.113), where every other stand-in names "a template or outcome variable" (§9.3.1, §9.3.3,
 * §9.3.4).
 */
const anyKindSites: readonly (readonly [kind: string, attribute: string])[] = [
  ["qti-index", "n"],
  ["qti-repeat", "number-repeats"],
];

/**
 * The base type a variable named in place of a literal must have (`ReferenceBase`, rule P24): a
 * string for a pattern, a float for a random float's bounds, an integer for every other.
 *
 * @param grammar - The composed grammar.
 * @returns Each (kind, attribute)'s base, by `kind attribute`.
 */
const referenceBasesOf = (grammar: ComposedGrammar): ReadonlyMap<string, string> =>
  new Map(
    referenceBaseRows(grammar.references.variableReference.rows).map(
      ({ attribute, base, kind }) => [`${kind} ${attribute}`, base],
    ),
  );

/**
 * What the reference laws read of one reference: its own fields, its element's first expression's
 * type, none where it holds no expression, the table its declaration holds of those its element
 * reads, none where it holds none of them or names no declaration, and its element's language.
 */
interface Read {
  readonly heldType: Option.Option<Type>;
  readonly language: string;
  readonly reference: Reference;
  readonly referenceBase: string;
  readonly table: Option.Option<string>;
}

/**
 * Whether two types fit, a type no declaration says aside: `Set_type`'s and
 * `Template_default_type`'s comparison.
 *
 * @param held - The value's type.
 * @param wanted - The variable's type.
 * @returns Whether the value fits the variable.
 */
const fits = (held: Type, wanted: Type): boolean =>
  (held.base === wanted.base || silent.has(held.base) || silent.has(wanted.base)) &&
  (held.cardinality === wanted.cardinality ||
    held.cardinality === "unknown" ||
    wanted.cardinality === "unknown");

/**
 * The reference laws, each a predicate that a read breaks (information model §2.5.1.3, §2.5.1.4,
 * §8.24, §8.25, §8.42, §2.8, §2.11.3.29, §2.11.3.30), by the law it breaks.
 *
 * - Lookup type: a built-in has no declaration, so it holds no lookup table to look a value up in
 *   (spec reading 197).
 * - Reference type: a reference a test reads through a scope names no declaration or built-in of its
 *   placement's root, so its reading's type is judged by the readings' laws alone.
 * - Mapped response: a built-in response declares no table, so it holds none (decision 431, reading
 *   166).
 */
const referenceLaws: readonly (readonly [ExpressionLaw, (read: Read) => boolean])[] = [
  [
    "Set type",
    ({ heldType, reference }) =>
      reference.attribute === "identifier" &&
      setKinds.some((kind) => kind === reference.node.kind) &&
      Option.exists(heldType, (held) => !fits(held, reference.type)),
  ],
  [
    "Lookup type",
    ({ heldType, reference, table }) =>
      reference.attribute === "identifier" &&
      reference.node.kind === lookupKind &&
      (reference.resolution === "builtIn" ||
        (reference.resolution === "declared" && Option.isNone(table)) ||
        Option.exists(
          heldType,
          (held) =>
            !(
              (held.cardinality === "single" || held.cardinality === "unknown") &&
              ["duration", "float", "integer", "any", "unknown"].includes(held.base) &&
              (!Option.contains(table, "qti-match-table") ||
                ["integer", "any", "unknown"].includes(held.base))
            ),
        )),
  ],
  [
    "Reference type",
    ({ reference, referenceBase }) => {
      /**
       * §9.3.2 IntOrIdentifier names no kind, as §9.3.3's "template or outcome variable" does: an
       * index's n and a repeat's number-repeats may name any item variable, built-in or declared,
       * of a single integer (§5.72: "'n' must be a positive integer"; §5.113.1).
       */
      const anyKind = anyKindSites.some(
        ([kind, attribute]) => reference.node.kind === kind && reference.attribute === attribute,
      );
      const typed =
        (reference.type.base === referenceBase || silent.has(reference.type.base)) &&
        (reference.type.cardinality === "single" || reference.type.cardinality === "unknown");

      return (
        reference.attribute !== "identifier" &&
        (reference.resolution === "declared" || reference.resolution === "builtIn") &&
        !(
          (reference.resolution === "declared" &&
            (anyKind ||
              Option.exists(reference.declarationKind, (kind) =>
                ["qti-outcome-declaration", "qti-template-declaration"].includes(kind),
              )) &&
            typed) ||
          (reference.resolution === "builtIn" &&
            anyKind &&
            reference.type.base === "integer" &&
            reference.type.cardinality === "single")
        )
      );
    },
  ],
  [
    "Template reads",
    ({ language, reference }) =>
      language === "template" &&
      typings.has(reference.node.kind) &&
      ((reference.resolution === "declared" &&
        Option.exists(reference.declarationKind, (kind) =>
          ["qti-outcome-declaration", "qti-response-declaration"].includes(kind),
        )) ||
        (reference.resolution === "builtIn" && reference.identifier !== "QTI_CONTEXT")),
  ],
  [
    "Mapped response",
    ({ reference, table }) =>
      reference.attribute === "identifier" &&
      (reference.node.kind === "qti-map-response" ||
        reference.node.kind === "qti-map-response-point") &&
      (reference.resolution === "declared" ||
        (reference.resolution === "builtIn" &&
          Option.contains(reference.declarationKind, "qti-response-declaration"))) &&
      !(
        Option.contains(reference.declarationKind, "qti-response-declaration") &&
        ((reference.node.kind === "qti-map-response" && Option.contains(table, "qti-mapping")) ||
          (reference.node.kind === "qti-map-response-point" &&
            Option.contains(table, "qti-area-mapping") &&
            (reference.type.base === "point" || silent.has(reference.type.base))))
      ),
  ],
  [
    "Variable kind",
    ({ reference }) => {
      const allowed = declarationKindsOf(reference.node.kind);

      return (
        reference.attribute === "identifier" &&
        allowed.length > 0 &&
        Option.exists(reference.declarationKind, (kind) => !allowed.includes(kind))
      );
    },
  ],
];

/**
 * Judge each reference of a typed document by the reference laws (P20, P22, P24, P26, P27)
 * and `Variable kind`.
 *
 * @param typed - The document.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
const referenceBreachesOf = (typed: Typed, grammar: ComposedGrammar): readonly Breach[] => {
  const { rows } = typed;
  const referenceBases = referenceBasesOf(grammar);

  return typed.references.flatMap((reference): readonly Breach[] => {
    const { node } = reference;
    const held = elementsOf(rows, node.start).find(({ kind }) => typings.has(kind));
    const tables = tableKinds.get(node.kind) ?? [];
    const table = reference.declaration.pipe(
      Option.flatMap((declaration) =>
        Arr.findFirst(elementsOf(declaration.view, declaration.node.start), ({ kind }) =>
          tables.includes(kind),
        ),
      ),
      Option.map(({ kind }) => kind),
    );
    const read: Read = {
      heldType: Option.map(Option.fromNullishOr(held), typed.typeOf),
      language: typed.languageOf(node),
      reference,
      referenceBase: referenceBases.get(`${node.kind} ${reference.attribute}`) ?? "",
      table,
    };
    const keys = {
      allowed: declarationKindsOf(node.kind).join(" "),
      attribute: reference.attribute,
      base: read.referenceBase,
      baseType: reference.type.base,
      cardinality: reference.type.cardinality,
      ...Option.match(reference.declarationKind, {
        onNone: () => ({}),
        onSome: (declarationKind) => ({ declarationKind }),
      }),
      ...Option.match(read.heldType, {
        onNone: () => ({}),
        onSome: (type) => ({ heldBase: type.base, heldCardinality: type.cardinality }),
      }),
      identifier: reference.identifier,
      ...Option.match(table, { onNone: () => ({}), onSome: (claimed) => ({ table: claimed }) }),
    };

    return referenceLaws.flatMap(([law, breaks]) =>
      breaks(read) ? [breachAt(rows, node, law, keys)] : [],
    );
  });
};

/**
 * Judge each literal of a document: a base value's text is a lexical form of its base type (§8.13,
 * `Literal lexical`).
 *
 * @param rows - The document.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
const literalBreachesOf = (rows: View, grammar: ComposedGrammar): readonly Breach[] =>
  rows.members.flatMap((node): readonly Breach[] => {
    if (node.kind === "qti-base-value") {
      return Option.toArray(typedOr(rows, node.start, "base-type", "")).flatMap((baseType) =>
        typedValueHolds(grammar, baseType, node.stringValue)
          ? []
          : [breachAt(rows, node, "Literal lexical", { baseType, text: node.stringValue })],
      );
    }

    return [];
  });

/**
 * Judge each reference of a typed document that names nothing in its placement (§6.9.40: "an
 * itemVariable that has been declared in a corresponding variableDeclaration or is one of the
 * built-in variables"): a braced one, a string attribute's, is a string value where it names
 * nothing (reading R15-k), so only a bare one breaks "Variable declared".
 *
 * @param typed - The document.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
const undeclaredBreachesOf = (typed: Typed, grammar: ComposedGrammar): readonly Breach[] =>
  typed.references.flatMap(({ attribute, identifier, node, resolution }): readonly Breach[] =>
    resolution === "unresolved" &&
    grammar.references.variableReference.rows.some(
      (row) => row.kind === node.kind && row.attribute === attribute && row.spelling === "bare",
    )
      ? [breachAt(typed.rows, node, "Variable declared", { identifier, kind: node.kind })]
      : [],
  );

/**
 * Judge one document under one placement (spec reading 117): its expressions typed bottom-up and
 * its references resolved in the placement's assembly ({@link PlacementScope}), each type law
 * stated over them, and, under a placement whose own laws hold its unresolved references to a
 * declaration, an item's, "Variable declared".
 *
 * @param rows - The document, merged with what it splices.
 * @param grammar - The composed grammar.
 * @param scope - Where the placement resolves the document's references.
 * @param undeclared - Whether the placement refuses a bare reference that names nothing.
 * @returns The breaches.
 */
export const placedBreachesOf = (
  rows: View,
  grammar: ComposedGrammar,
  scope: PlacementScope,
  undeclared: boolean,
): readonly Breach[] => {
  const typed = typedOf(rows, grammar, scope);

  return [
    ...expressionBreachesOf(typed),
    ...referenceBreachesOf(typed, grammar),
    ...(undeclared ? undeclaredBreachesOf(typed, grammar) : []),
  ];
};

/**
 * Judge one folded document in its own placement, where it heads its assembly: the type laws over
 * its own declarations and built-ins, a test's references read through its scopes too, and its
 * literals, which no placement types.
 *
 * @param rows - The document, merged with what it splices.
 * @param grammar - The composed grammar.
 * @param read - Under a test, the type of a reference's one reading through a scope.
 * @returns The breaches.
 */
export const expressionDocumentBreaches = (
  rows: View,
  grammar: ComposedGrammar,
  read: PlacementScope["read"],
): readonly Breach[] => [
  ...placedBreachesOf(rows, grammar, rootScopeOf(rows, grammar, read), false),
  ...literalBreachesOf(rows, grammar),
];

/**
 * Judge every document a test places outside its own merged document in each test that places it
 * (spec reading 117, `PlacedExpression` and `PlacedVariableRef`): a section document a section ref
 * places, a fragment a section includes and each fragment those splice, each over its own rows in
 * the test's scope, the test's declarations, its built-ins and its readings through a scope. A
 * document two tests place is judged in each, and one a test places twice is judged alike in each
 * placement, so once; a breach two tests raise alike is one.
 *
 * @param input - The package.
 * @param grammar - The composed grammar.
 * @param readsOf - Each test's readings through a scope, by the test's path.
 * @returns The breaches, each once.
 */
export const expressionPackageBreaches = (
  input: PackageRows,
  grammar: ComposedGrammar,
  readsOf: (path: string) => PlacementScope["read"],
): readonly Breach[] => {
  const breaches = testsOf(input, assembledDocumentsOf(input, grammar)).flatMap(
    ({ instances, test }) => {
      const scope = rootScopeOf(test.listed.rows, grammar, readsOf(test.listed.path));
      const placed = new Map(
        instances
          .filter((instance) => !inRootCopy(instances, instance))
          .map(({ document }) => [document.listed.path, document.listed.rows] as const),
      );

      return [...placed.values()].flatMap((rows) => placedBreachesOf(rows, grammar, scope, false));
    },
  );

  return [...new Map(breaches.map((held) => [JSON.stringify(held), held] as const)).values()];
};
