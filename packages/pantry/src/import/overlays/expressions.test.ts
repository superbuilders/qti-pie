/**
 * The expression overlays' rows judged on the host, against the old processing checker's frozen
 * verdicts.
 *
 * Every fixture of `src/test/fixtures/processing/{broken,guards,valid}` is shredded, built into
 * rows by `rowsOf`, and judged by a host reading of every row law `expressionLaws` states: the
 * operand folds, the counts and the per-kind closed relations, read by their installed rows. The
 * rules of the laws a fixture breaks must be the rule the old checker gave it, frozen in
 * `src/test/fixtures/processing/verdicts.tsv` by one run of that checker before its deletion
 * (Q5.10). A guard fixture's rule is another slice's law (P5 is AL3, P28 is N7's `Last`, P30 is
 * N5's `Follow`), so the expression laws accept it.
 */
import { readFileSync } from "node:fs";
import nodePath from "node:path";
import { NodeServices } from "@effect/platform-node";
import { assert, describe, it, layer } from "@effect/vitest";
import { Effect, Formatter, Option } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { integerMathOperators, referencedTables, valueBases } from "#pantry/grammar/expression.ts";
import {
  BaseTypeLexical,
  BuiltInVariable,
  CardinalityLexical,
  DeclarationKind,
  grammar,
  nonElementKinds,
  OperatorArity,
  OperatorMax,
  VariableReference,
} from "#pantry/grammar/install.ts";
import { testRoots } from "#pantry/grammar/references.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { collapse } from "#pantry/grammar/domains.ts";
import { placedRowsOf, placingPackageOf, rowsOf } from "#pantry/import/overlays/expressions.ts";
import type { ExpressionRows, Typed } from "#pantry/import/overlays/expressions.ts";
import { ownViewOf } from "#pantry/import/fold.ts";
import type { Place } from "#pantry/import/write.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { closedName } from "#pantry/model/xdm.ts";
import type {
  ClosedName,
  ElementKind,
  NodeRow,
  XdmChild,
  XdmClosedElement,
  XdmDocument,
} from "#pantry/model/xdm.ts";
import { shredGrammarOf } from "#pantry/model/composed.ts";
import { shred } from "#pantry/model/shred.ts";
import {
  BaseTypePattern,
  conditionKindHandles,
  containerKinds,
  declaredKinds,
  firstKinds,
  LeadCardinality,
  lookupKindHandle,
  numericKinds,
  oneBaseKinds,
  oneCardinalityKinds,
  OperandBase,
  outcomeOnlyKinds,
  ReferenceBase,
  ResultBase,
  ResultCardinality,
  secondKinds,
  setKindHandles,
  TailCardinality,
  ValueCardinalityOf,
} from "#pantry/qti/expression-types.ts";
import {
  expressionKinds,
  referenceDeclarations,
  rootLanguages,
  ruleKindHandles,
} from "#pantry/vocab/terms/expression-types.ts";
import { readProgram } from "#pantry/import/program.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { builtInTypes } from "#pantry/test/built-in-types.ts";
import { baseValueCases, baseValuePackageOf } from "#pantry/test/base-value-cases.ts";
import { declarationQueryLawsOf } from "#pantry/test/declaration-queries.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge as judgeHost, judgedLaws } from "#pantry/test/host-judge.ts";
import { schemaLawNameOf } from "#pantry/test/law-namer.ts";

/**
 * Where a lone document of these cases stands: one item of one package, the place every row holds.
 */
const place: Place = { package: "MANIFEST", path: "item.xml" };

/**
 * The fixtures' directory.
 */
const fixtures = nodePath.resolve(import.meta.dirname, "../../test/fixtures/processing");

/**
 * One frozen verdict: the fixture, the rule the old checker (or, for a guard, the importer's
 * guard) gave it, and which of the two gave it.
 */
interface Frozen {
  readonly file: string;
  readonly rule: string;
  readonly source: "checker" | "guard";
}

/**
 * The frozen verdicts, one per fixture: the columns `file`, `processing`, `rule`, `kind`, `path`
 * and `source`.
 */
const frozen: readonly Frozen[] = readFileSync(nodePath.join(fixtures, "verdicts.tsv"), "utf-8")
  .trimEnd()
  .split("\n")
  .slice(1)
  .map((line) => {
    const columns = line.split("\t");

    return {
      file: columns[0] ?? "",
      rule: columns[2] ?? "",
      source: columns[5] === "guard" ? "guard" : "checker",
    };
  });

/**
 * The rule each law keeps, as `#pantry/test/oracle.ts` maps it.
 */
const ruleOf = {
  Arity: "P2",
  Condition_type: "P21",
  E1_derived: "derived",
  Literal_lexical: "attribute-lexical",
  Lookup_type: "P22",
  Mapped_response: "P27",
  One_base: "P23",
  Operand_fit: "P23",
  Outcome_only: "P25",
  Reference_type: "P24",
  Set_type: "P20",
  Template_reads: "P26",
  Variable_declared: "P8",
  Variable_kind: "variable-kind",
} as const;

/**
 * A law's name.
 */
type Law = keyof typeof ruleOf;

/**
 * Whether one set holds another.
 *
 * @param sub - The smaller.
 * @param sup - The larger, none for the empty set.
 * @returns Whether every member of `sub` is in `sup`.
 */
const subset = (sub: ReadonlySet<string>, sup: ReadonlySet<string> | undefined): boolean =>
  [...sub].every((member) => sup?.has(member) ?? false);

/**
 * The installed rows of a (kind, code) set relation, by kind.
 *
 * @param rows - The rows.
 * @param code - The code each row holds beside its kind.
 * @returns Each kind's codes.
 */
const byKind = <R extends { readonly kind: string }>(
  rows: readonly R[],
  code: (row: R) => string,
): ReadonlyMap<string, ReadonlySet<string>> => {
  const held = new Map<string, Set<string>>();
  for (const row of rows) {
    held.set(row.kind, (held.get(row.kind) ?? new Set<string>()).add(code(row)));
  }

  return held;
};

const operandBases = byKind(OperandBase.rows, ({ base }) => base);

const leads = byKind(LeadCardinality.rows, ({ cardinality }) => cardinality);

const tails = byKind(TailCardinality.rows, ({ cardinality }) => cardinality);

const resultBases = byKind(ResultBase.rows, ({ base }) => base);

const resultCardinalities = byKind(ResultCardinality.rows, ({ cardinality }) => cardinality);

const arities = new Map(OperatorArity.rows.map((row) => [row.kind, row] as const));

const maxima = new Map(OperatorMax.rows.map((row) => [row.kind, row.max] as const));

const spellings = new Map(
  VariableReference.rows.map(({ attribute, kind, spelling }) => [`${kind} ${attribute}`, spelling]),
);

const referenceBases = new Map(
  ReferenceBase.rows.map(({ attribute, base, kind }) => [`${kind} ${attribute}`, base]),
);

/**
 * The bases a `base-type` spells, each its own lexical form: every base but `any` and `unknown`,
 * which no form spells.
 */
const spelledBases: ReadonlySet<string> = new Set(
  valueBases.filter((base) => base !== "any" && base !== "unknown"),
);

const literalPatterns = new Map(
  BaseTypePattern.rows.map(({ baseType, pattern }) => [baseType, new RegExp(pattern, "u")]),
);

const valueCardinalityOf: ReadonlyMap<string, (typeof ValueCardinalityOf.rows)[number]["value"]> =
  new Map(ValueCardinalityOf.rows.map(({ cardinality, value }) => [cardinality, value]));

const builtIns: ReadonlyMap<string, (typeof builtInTypes)[number]> = new Map(
  builtInTypes.map((row) => [`${String(row.test)} ${row.variable}`, row] as const),
);

const testRootSet: ReadonlySet<string> = new Set(testRoots);

const integerNames: ReadonlySet<string> = new Set(integerMathOperators);

const languages: ReadonlyMap<string, string> = new Map(rootLanguages);

const expressionSet: ReadonlySet<string> = new Set(expressionKinds);

const ruleSet: ReadonlySet<string> = new Set(ruleKindHandles);

const conditions: ReadonlySet<string> = new Set(conditionKindHandles);

const outcomeOnly: ReadonlySet<string> = new Set(outcomeOnlyKinds);

const setters: ReadonlySet<string> = new Set(setKindHandles);

const declaredTyped: ReadonlySet<string> = new Set(declaredKinds);

const oneBase: ReadonlySet<string> = new Set(oneBaseKinds);

const oneCardinality: ReadonlySet<string> = new Set(oneCardinalityKinds);

const silent: ReadonlySet<string> = new Set(["any", "unknown"]);

/**
 * The kinds whose type an attribute of their own gives, whose `unknown` base type `ResultBase`
 * does not judge: the type of one whose attribute spells no base.
 */
const attributeTyped: ReadonlySet<string> = new Set([
  "qti-base-value",
  "qti-math-operator",
  "qti-test-variables",
]);

/**
 * The (kind, declaration kind) pairs a reference by `identifier` may name, as the information
 * model's definitions state them (`referenceDeclarations`, each row cited).
 */
const namedKinds: ReadonlySet<string> = new Set(
  referenceDeclarations.flatMap(({ declarations, kind }) =>
    declarations.map((declaration) => `${kind} ${declaration}`),
  ),
);

/**
 * A node's kind, parent and parent's kind, which `Node` alone holds and the rules over
 * `ExpressionNode` and `ProcessingNode` read (decision S3).
 */
interface NodeFacts {
  readonly kind: NodeRow<Composed>["kind"];
  readonly parent: bigint;
  readonly parentKind: NodeRow<Composed>["kind"];
  readonly rank: bigint;
}

/**
 * An expression's row beside its type under its document's own placement (`PlacedExpression`).
 */
type TypedExpression = (ExpressionRows["Expression"] extends ReadonlyMap<string, infer R>
  ? R
  : never) &
  Typed;

/**
 * A reference's row beside what it names under its document's own placement (`PlacedVariableRef`),
 * its resolution and its variable's type, and its element's type there, the expression's own.
 */
type TypedReference = (ExpressionRows["VariableRef"] extends ReadonlyMap<string, infer R>
  ? R
  : never) &
  Typed & {
    readonly elementBase: Typed["baseType"];
    readonly elementCardinality: Typed["cardinality"];
    readonly resolution: "builtIn" | "declared" | "read" | "unresolved";
  };

/**
 * A document's rows beside each node's facts and attributes, by its start: its expression rows,
 * each expression and reference typed under the document's own placement, a document in no
 * assembly (spec reading 117), and its declarations' attributes, which a reference resolves its
 * name against.
 */
type Rows = Omit<ExpressionRows, "Expression" | "VariableRef"> & {
  readonly attributes: ReadonlyMap<bigint, ReadonlyMap<string, string>>;
  readonly Expression: ReadonlyMap<string, TypedExpression>;
  readonly nodes: ReadonlyMap<bigint, NodeFacts>;
  readonly VariableRef: ReadonlyMap<string, TypedReference>;
};

/**
 * Build a document's rows as the importer writes them, its own placement's beside its own, and
 * beside its nodes' facts.
 *
 * @param tree - The document's tree.
 * @returns Its rows.
 */
const rowsOfTree = (tree: XdmDocument<Composed>): Rows => {
  const view = ownViewOf(tree);
  const kinds = new Map(view.rows.nodes.map(({ kind, start }) => [start, kind] as const));
  const elementsBefore = new Map<bigint, bigint>();
  const nonElements: ReadonlySet<string> = new Set(nonElementKinds);
  const own = rowsOf(view, place);
  const placed = placedRowsOf({
    instances: [],
    placing: placingPackageOf([
      {
        ids: { ...place, assembled: false },
        paths: [],
        references: own.VariableRef.values(),
        view,
      },
    ]),
    readingsOf: () => [],
  });
  const typeAt = (start: bigint): Typed => {
    const typed = placed.PlacedExpression.get(keyTextOf(place.path, 0n, place.path, start));

    return {
      baseType: typed?.baseType ?? "unknown",
      cardinality: typed?.cardinality ?? "unknown",
    };
  };

  return {
    ...own,
    Expression: new Map(
      [...own.Expression].map(([key, row]) => [key, { ...row, ...typeAt(row.start) }] as const),
    ),
    VariableRef: new Map(
      [...own.VariableRef].map(([key, row]) => {
        const found = placed.PlacedVariableRef.get(
          keyTextOf(place.path, 0n, place.path, row.start, row.attribute),
        );
        const element = typeAt(row.start);

        return [
          key,
          {
            ...row,
            baseType: found?.baseType ?? "unknown",
            cardinality: found?.cardinality ?? "unknown",
            elementBase: element.baseType,
            elementCardinality: element.cardinality,
            resolution: found?.resolution ?? "unresolved",
          },
        ] as const;
      }),
    ),
    attributes: new Map(
      [...Map.groupBy(view.rows.attributes, ({ start }) => start)].map(
        ([start, held]) =>
          [start, new Map(held.map(({ lexical, name }) => [name, lexical] as const))] as const,
      ),
    ),
    nodes: new Map(
      view.rows.nodes.map(({ kind, parent, start }) => {
        const rank = nonElements.has(kind) ? 0n : (elementsBefore.get(parent) ?? 0n) + 1n;
        elementsBefore.set(
          parent,
          nonElements.has(kind) ? (elementsBefore.get(parent) ?? 0n) : rank,
        );

        return [
          start,
          { kind, parent, parentKind: start === 0n ? kind : (kinds.get(parent) ?? kind), rank },
        ] as const;
      }),
    ),
  };
};

/**
 * Read a node's facts by its start, which every overlay row's node has.
 *
 * @param rows - The rows.
 * @param start - The node's start.
 * @returns Its facts.
 */
const nodeAt = (rows: Rows, start: bigint): NodeFacts =>
  Option.getOrThrowWith(
    Option.fromNullishOr(rows.nodes.get(start)),
    () => new Error(`No node at ${String(start)}, where a row of the document stands.`),
  );

/**
 * An expression's row and its operands' sets, as the operand laws read them over the derived
 * `Operand` (each expression whose node's parent is this one, ranked by its node's element rank),
 * and its node's facts.
 */
interface Folded {
  readonly all: ReadonlySet<string>;
  readonly allCardinalities: ReadonlySet<string>;
  readonly count: number;
  readonly lead: ReadonlySet<string>;
  readonly node: NodeFacts;
  readonly row: TypedExpression;
  readonly tail: ReadonlySet<string>;
  readonly tailCardinalities: ReadonlySet<string>;
}

/**
 * Fold an expression's operands: each operand's base type but `any`, and its cardinality but
 * `unknown`, into its operator's sets, by its rank.
 *
 * @param rows - The rows.
 * @param row - The expression's row.
 * @returns Its folds.
 */
const folded = (rows: Rows, row: Folded["row"]): Folded => {
  const operands = [...rows.Expression.values()]
    .filter(({ start }) => start !== row.start && nodeAt(rows, start).parent === row.start)
    .map((operand) => ({ ...operand, rank: nodeAt(rows, operand.start).rank }));
  const bases = (list: typeof operands) =>
    new Set(list.flatMap(({ baseType }) => (baseType === "any" ? [] : [baseType])));
  const cardinalities = (list: typeof operands) =>
    new Set(list.flatMap(({ cardinality }) => (cardinality === "unknown" ? [] : [cardinality])));
  const later = operands.filter(({ rank }) => rank > 1n);

  return {
    all: bases(operands),
    allCardinalities: cardinalities(operands),
    count: operands.length,
    lead: cardinalities(operands.filter(({ rank }) => rank === 1n)),
    node: nodeAt(rows, row.start),
    row,
    tail: bases(later),
    tailCardinalities: cardinalities(later),
  };
};

/**
 * The base type a set of operand bits names: `any` for none, its one member, or none for several.
 *
 * @param bits - The bits.
 * @returns The base type, or undefined for several.
 */
const oneOf = (bits: ReadonlySet<string>): string | undefined => {
  if (bits.size === 0) {
    return "any";
  }

  return bits.size === 1 ? [...bits][0] : undefined;
};

/**
 * The base type a numeric aggregate's operand bits give it.
 *
 * @param bits - The bits.
 * @returns `unknown`, `integer` or `float`.
 */
const numericOf = (bits: ReadonlySet<string>): string => {
  if (bits.has("unknown")) {
    return "unknown";
  }

  return bits.size === 1 && bits.has("integer") ? "integer" : "float";
};

/**
 * The language an expression's parent hands it: a rule's or an expression's own, `none` from any
 * other parent.
 *
 * @param rows - The rows.
 * @param row - The expression's row.
 * @returns The language, if the parent's row holds one.
 */
const languageFrom = (rows: Rows, row: Folded["row"]): string | undefined => {
  const { parent, parentKind } = nodeAt(rows, row.start);
  if (ruleSet.has(parentKind)) {
    return rows.Processing.get(keyTextOf(row.package, row.path, parent))?.language;
  }

  return expressionSet.has(parentKind)
    ? rows.Expression.get(keyTextOf(row.package, row.path, parent))?.language
    : "none";
};

/**
 * `E1_derived`'s Delete arm over `OperandOf`: its later operands' one base type, `any` for none,
 * `unknown` for several, and their one cardinality, `unknown` for none or several.
 *
 * @param e - The expression and its folds.
 * @returns Whether its type is its later operands'.
 */
const tailHolds = (e: Folded): boolean =>
  e.row.baseType === (e.tail.size > 1 ? "unknown" : oneOf(e.tail)) &&
  e.row.cardinality ===
    (e.tailCardinalities.size === 1 ? ([...e.tailCardinalities][0] ?? "unknown") : "unknown");

/**
 * `E1_derived`'s result type: the kind's sets, and each dependent typing's rule.
 *
 * @param e - The expression and its folds.
 * @returns Whether its type is derived.
 */
const resultHolds = (e: Folded): boolean => {
  const { kind } = e.node;

  return (
    ((attributeTyped.has(kind) && e.row.baseType === "unknown") ||
      (resultBases.get(kind)?.has(e.row.baseType) ?? false)) &&
    (resultCardinalities.get(kind)?.has(e.row.cardinality) ?? false) &&
    (!new Set(numericKinds).has(kind) || e.row.baseType === numericOf(e.all)) &&
    (!new Set([...containerKinds, ...firstKinds]).has(kind) ||
      e.row.baseType === (e.all.size > 1 ? "unknown" : oneOf(e.all))) &&
    (!new Set(secondKinds).has(kind) || tailHolds(e))
  );
};

/**
 * Each expression law, judged over an expression and its folds.
 */
const expressionLawsOnHost: readonly (readonly [Law, (e: Folded, rows: Rows) => boolean])[] = [
  [
    "Arity",
    (e) => {
      const arity = arities.get(e.node.kind);

      const max = maxima.get(e.node.kind);

      return (
        arity !== undefined &&
        BigInt(e.count) >= arity.min &&
        (max === undefined || BigInt(e.count) <= max)
      );
    },
  ],
  [
    "Operand_fit",
    (e) =>
      subset(e.all, operandBases.get(e.node.kind)) &&
      subset(e.lead, leads.get(e.node.kind)) &&
      subset(e.tailCardinalities, tails.get(e.node.kind)),
  ],
  [
    "One_base",
    (e) =>
      (!oneBase.has(e.node.kind) || [...e.all].filter((base) => base !== "unknown").length <= 1) &&
      (!oneCardinality.has(e.node.kind) || e.allCardinalities.size <= 1),
  ],
  ["E1_derived", (e, rows) => languageFrom(rows, e.row) === e.row.language && resultHolds(e)],
  [
    "Condition_type",
    (e) =>
      !conditions.has(e.node.parentKind) ||
      (["boolean", "any", "unknown"].includes(e.row.baseType) &&
        ["single", "unknown"].includes(e.row.cardinality)),
  ],
  ["Outcome_only", (e) => !outcomeOnly.has(e.node.kind) || e.row.language === "outcome"],
];

/**
 * An attribute's lexical form, by its element's start and its name, none where its element writes
 * none.
 *
 * @param rows - The rows.
 * @param start - The element's start.
 * @param name - The attribute's name.
 * @returns The form, if written.
 */
const writtenAt = (rows: Rows, start: bigint, name: string): string | undefined =>
  rows.attributes.get(start)?.get(name);

/**
 * A typed reference beside its element's kind and its attribute's lexical form, as the views
 * `VariableRefNode` and `PlacedVariableRefNode` join it (`#pantry/qti/names.ts`).
 */
type Reference = TypedReference & { readonly kind: string; readonly lexical: string };

/**
 * Each reference of the rows beside its element's kind and its attribute's lexical form.
 *
 * @param rows - The rows.
 * @returns The references.
 */
const referencesOf = (rows: Rows): readonly Reference[] =>
  [...rows.VariableRef.values()].map((v) => ({
    ...v,
    kind: nodeAt(rows, v.start).kind,
    lexical: writtenAt(rows, v.start, v.attribute) ?? "",
  }));

/**
 * The declaration kind each root's built-in variable stands as, by `root variable`.
 */
const builtInKinds: ReadonlyMap<string, string> = new Map(
  BuiltInVariable.rows.map(({ declaration, root, variable }) => [
    `${root} ${variable}`,
    declaration,
  ]),
);

/**
 * The declaration kinds, each a `NodeKind` handle that is its own `DeclarationKind` handle.
 */
const declaring: ReadonlySet<string> = new Set(DeclarationKind.handles);

/**
 * The code a `base-type` and a `cardinality` spell, by its lexical form: the rosters' lexical
 * relations, which the views join (`#pantry/qti/names.ts`, C17).
 */
const spelledCodes = {
  "base-type": new Map(BaseTypeLexical.rows.map(({ code, lexical }) => [lexical, code] as const)),
  cardinality: new Map(
    CardinalityLexical.rows.map(({ code, lexical }) => [lexical, code] as const),
  ),
} as const;

/**
 * The declaration of its document a reference's name resolves to, as the database's queries read
 * it (`#pantry/qti/overlay-queries/reference.ts`): its `NamedDeclaration` of the name, its
 * `identifier` collapsed, with its kind and its cardinality and base type, each its attribute's
 * where that spells a code and none where it has none; none where no declaration of the document
 * holds the name.
 *
 * @param v - The reference.
 * @param rows - The rows.
 * @returns The declaration, if any.
 */
const declarationOf = (v: Reference, rows: Rows) => {
  const named = [...rows.nodes].find(
    ([start, { kind }]) =>
      declaring.has(kind) &&
      Option.contains(
        Option.map(Option.fromUndefinedOr(rows.attributes.get(start)?.get("identifier")), collapse),
        v.identifier,
      ),
  );
  const spelled = (start: bigint, name: keyof typeof spelledCodes) => {
    const lexical = rows.attributes.get(start)?.get(name);

    return lexical === undefined ? undefined : spelledCodes[name].get(lexical);
  };

  return named === undefined
    ? undefined
    : {
        baseType: spelled(named[0], "base-type"),
        cardinality: spelled(named[0], "cardinality"),
        declaration: named[0],
        declarationKind: named[1].kind,
      };
};

/**
 * The declaration kind a reference names: its declaration's node's, or the built-in's it names, or
 * none for a reference that names nothing.
 *
 * @param v - The reference.
 * @param rows - The rows.
 * @returns The kind, if any.
 */
const declarationKindOf = (v: Reference, rows: Rows): string | undefined =>
  v.resolution === "builtIn"
    ? builtInKinds.get(`${v.rootKind} ${v.identifier}`)
    : declarationOf(v, rows)?.declarationKind;

/**
 * `E1_derived`'s spelling: the lexical form is the affixes around the name.
 *
 * @param v - The reference.
 * @returns Whether it spells its identifier.
 */
const spells = (v: Reference): boolean =>
  v.lexical === `${v.before}${v.identifier}${v.after}` &&
  /^[^\t\n\r {}]+$/u.test(v.identifier) &&
  (spellings.get(`${v.kind} ${v.attribute}`) === "braced"
    ? v.before === "{" && v.after === "}"
    : /^[\t\n\r ]*$/u.test(v.before) && /^[\t\n\r ]*$/u.test(v.after));

/**
 * `E1_derived`'s resolution: the type each resolution gives, a declared one's by the declaration
 * its name resolves to, which a reference has exactly where it is declared.
 *
 * @param v - The reference.
 * @param rows - The rows.
 * @returns Whether its type is its resolution's.
 */
const resolves = (v: Reference, rows: Rows): boolean => {
  const builtIn = builtIns.get(`${String(testRootSet.has(v.rootKind))} ${v.identifier}`);
  const declared = declarationOf(v, rows);
  switch (v.resolution) {
    case "declared": {
      // A declared variable with no base type, a record, is `unknown`; one with a base type has its
      // declaration's, which `PlacedVariableBase` reads. Its cardinality is its declaration's
      // image where it has one (spec reading 159); one with none is refused by AL3 or its value
      // domain alone, since `cardinality` is required and enumerated.
      return (
        declared !== undefined &&
        (declared.baseType !== undefined || v.baseType === "unknown") &&
        (declared.cardinality === undefined ||
          v.cardinality === valueCardinalityOf.get(declared.cardinality))
      );
    }
    case "builtIn": {
      return (
        declared === undefined &&
        v.baseType === builtIn?.baseType &&
        v.cardinality === builtIn.cardinality
      );
    }
    case "read": {
      // Its type is its one reading's under a test (spec reading 167), which
      // `overlay-queries/readings.ts` states; its name is neither declared nor built in there.
      return testRootSet.has(v.rootKind) && declared === undefined && builtIn === undefined;
    }
    case "unresolved": {
      return (
        declared === undefined &&
        builtIn === undefined &&
        v.baseType === "unknown" &&
        v.cardinality === "unknown"
      );
    }
    default: {
      return v.resolution satisfies never;
    }
  }
};

/**
 * The tables a declaration may hold that a reference reads.
 */
const tableKinds: ReadonlySet<string> = new Set(referencedTables);

/**
 * The tables the declaration a reference names holds, its node's children of a table's kind, none
 * where it names none (`DeclarationTable` of `#pantry/qti/overlay-queries/declaration.ts`).
 *
 * @param v - The reference.
 * @param rows - The rows.
 * @returns The tables' kinds.
 */
const tablesOf = (v: Reference, rows: Rows): ReadonlySet<string> => {
  const declared = declarationOf(v, rows);

  return new Set(
    declared === undefined
      ? []
      : [...rows.nodes.values()].flatMap(({ kind, parent }) =>
          parent === declared.declaration && tableKinds.has(kind) ? [kind] : [],
        ),
  );
};

/**
 * `E1_derived`'s copies: the element's language, and a declared kind's typing: an unweighted read
 * typed as its variable (`UnweightedRead`), and a weighted one, a `qti-variable` that writes a
 * `weight-identifier`, typed as its variable but float where the variable is integer
 * (`WeightedRead`; information model §7.47.2: "When applying a weight to the value of a variable
 * with base-type integer the value is subject to type promotion and the result of the expression
 * has base-type float").
 *
 * @param v - The reference.
 * @param rows - The rows.
 * @returns Whether every copy agrees.
 */
const copies = (v: Reference, rows: Rows): boolean => {
  const element = rows.Expression.get(keyTextOf(v.package, v.path, v.start));
  const copied =
    element === undefined
      ? rows.Processing.get(keyTextOf(v.package, v.path, v.start))?.language === v.language
      : element.language === v.language;
  const read =
    writtenAt(rows, v.start, "weight-identifier") !== undefined && v.baseType === "integer"
      ? "float"
      : v.baseType;

  return (
    copied &&
    (v.attribute !== "identifier" ||
      !declaredTyped.has(v.kind) ||
      (v.elementBase === read && v.elementCardinality === v.cardinality))
  );
};

/**
 * Each reference law, judged over a reference.
 */
const referenceLawsOnHost: readonly (readonly [Law, (v: Reference, rows: Rows) => boolean])[] = [
  ["E1_derived", (v, rows) => spells(v) && resolves(v, rows) && copies(v, rows)],
  [
    "Variable_declared",
    (v) =>
      v.rootKind !== "qti-assessment-item" ||
      v.resolution !== "unresolved" ||
      // Reading R15-k: a braced reference, a string attribute's, that names no variable is a
      // string value.
      spellings.get(`${v.kind} ${v.attribute}`) === "braced",
  ],
  [
    "Variable_kind",
    (v, rows) =>
      v.attribute !== "identifier" ||
      v.resolution === "unresolved" ||
      namedKinds.has(`${v.kind} ${declarationKindOf(v, rows) ?? ""}`),
  ],
  [
    "Lookup_type",
    (v, rows) =>
      v.attribute !== "identifier" ||
      v.kind !== lookupKindHandle ||
      v.resolution !== "declared" ||
      ["qti-match-table", "qti-interpolation-table"].some((table) => tablesOf(v, rows).has(table)),
  ],
  [
    "Reference_type",
    (v, rows) =>
      v.attribute === "identifier" ||
      v.resolution === "unresolved" ||
      (v.resolution === "declared" &&
        ["qti-outcome-declaration", "qti-template-declaration"].includes(
          declarationKindOf(v, rows) ?? "",
        ) &&
        (v.baseType === referenceBases.get(`${v.kind} ${v.attribute}`) || silent.has(v.baseType)) &&
        ["single", "unknown"].includes(v.cardinality)),
  ],
  [
    "Template_reads",
    (v, rows) =>
      v.language !== "template" ||
      !expressionSet.has(v.kind) ||
      ((v.resolution !== "declared" ||
        !["qti-outcome-declaration", "qti-response-declaration"].includes(
          declarationKindOf(v, rows) ?? "",
        )) &&
        (v.resolution !== "builtIn" || v.identifier === "QTI_CONTEXT")),
  ],
  [
    "Mapped_response",
    (v, rows) =>
      v.attribute !== "identifier" ||
      !["qti-map-response", "qti-map-response-point"].includes(v.kind) ||
      v.resolution !== "declared" ||
      (declarationKindOf(v, rows) === "qti-response-declaration" &&
        ((v.kind === "qti-map-response" && tablesOf(v, rows).has("qti-mapping")) ||
          (v.kind === "qti-map-response-point" &&
            tablesOf(v, rows).has("qti-area-mapping") &&
            ["point", "any", "unknown"].includes(v.baseType)))),
  ],
];

/**
 * A setter's or a lookup's held type, as `HeldType`'s query joins it (`#pantry/qti/queries.ts`):
 * its reference by `identifier`, and the type of one expression it holds.
 */
interface Held {
  readonly baseType: string;
  readonly cardinality: string;
  readonly heldBase: string;
  readonly heldCardinality: string;
  readonly kind: string;
  readonly package: string;
  readonly path: string;
  readonly resolution: string;
  readonly start: bigint;
  readonly tables: ReadonlySet<string>;
}

/**
 * The setters and the lookup, whose references by `identifier` hold a type.
 */
const holders: ReadonlySet<string> = new Set([...setKindHandles, lookupKindHandle]);

/**
 * Join each setter's and lookup's reference by `identifier` with each expression it holds, as
 * `HeldType`'s definition does: the database derives these rows, and the import writes none.
 *
 * @param rows - The rows.
 * @returns The held types.
 */
const heldTypesOnHost = (rows: Rows): readonly Held[] =>
  referencesOf(rows)
    .filter(({ attribute, kind }) => attribute === "identifier" && holders.has(kind))
    .flatMap((v) =>
      rows.Expression.values()
        .filter(({ start }) => nodeAt(rows, start).parent === v.start)
        .map((e) => ({
          baseType: v.baseType,
          cardinality: v.cardinality,
          heldBase: e.baseType,
          heldCardinality: e.cardinality,
          kind: v.kind,
          package: v.package,
          path: v.path,
          resolution: v.resolution,
          start: v.start,
          tables: tablesOf(v, rows),
        }))
        .toArray(),
    );

/**
 * Each law over a setter's or a lookup's held type, judged over its row and the tables its lookup's
 * declaration holds, by its element's place and `identifier`.
 */
const heldLawsOnHost: readonly (readonly [Law, (h: Held) => boolean])[] = [
  [
    "Set_type",
    (h) =>
      !setters.has(h.kind) ||
      ((h.heldBase === h.baseType || silent.has(h.heldBase) || silent.has(h.baseType)) &&
        (h.heldCardinality === h.cardinality ||
          h.heldCardinality === "unknown" ||
          h.cardinality === "unknown")),
  ],
  [
    "Lookup_type",
    (h) =>
      h.kind !== lookupKindHandle ||
      (["single", "unknown"].includes(h.heldCardinality) &&
        ["duration", "float", "integer", "any", "unknown"].includes(h.heldBase) &&
        (h.resolution !== "declared" ||
          ["integer", "any", "unknown"].includes(h.heldBase) ||
          h.tables.has("qti-interpolation-table"))),
  ],
];

/**
 * `E1_derived` over the query `ExpressionAttribute` (`#pantry/qti/queries.ts`): the base type an
 * attribute-typed expression's typing attribute gives it, where its element writes one. A
 * `base-type` gives the base it spells exactly, and one that spells none gives nothing, since AL1
 * refuses it alone; a math operator's `name` gives `integer` for an integer operator and `float`
 * for any other.
 *
 * @param rows - The rows.
 * @param e - The expression's row.
 * @returns Whether its base type is the one its typing attribute gives, true where it has none.
 */
const attributeDerives = (rows: Rows, e: TypedExpression): boolean => {
  const { kind } = nodeAt(rows, e.start);
  const baseType = writtenAt(rows, e.start, "base-type");
  const name = writtenAt(rows, e.start, "name");
  if (kind === "qti-math-operator" && name !== undefined) {
    return e.baseType === (integerNames.has(name) ? "integer" : "float");
  }

  if ((kind === "qti-base-value" || kind === "qti-test-variables") && baseType !== undefined) {
    return !spelledBases.has(baseType) || e.baseType === baseType;
  }

  return true;
};

/**
 * The laws a base value's typed rows break: its `Literal_lexical`, its text a form of its code.
 *
 * @param rows - The rows.
 * @returns The laws broken, once each per row.
 */
const literalBreaches = (rows: ExpressionRows): readonly Law[] =>
  [...rows.LiteralTyped.values()].flatMap((l): readonly Law[] =>
    (literalPatterns.get(l.typeCode)?.test(l.text) ?? false) ? [] : (["Literal_lexical"] as const),
  );

/**
 * The laws the rows of the smaller overlays break: `Processing`'s language, the base type a typing
 * attribute or a weight gives, and `LiteralTyped`'s code and text.
 *
 * @param rows - The rows.
 * @returns The laws broken, each once.
 */
const overlayBreaches = (rows: Rows): ReadonlySet<Law> => {
  const broken = new Set<Law>();
  for (const p of rows.Processing.values()) {
    const { kind, parent, parentKind } = nodeAt(rows, p.start);
    const expected =
      languages.get(kind) ??
      (ruleSet.has(parentKind)
        ? rows.Processing.get(keyTextOf(p.package, p.path, parent))?.language
        : "none");
    if (expected !== p.language) {
      broken.add("E1_derived");
    }
  }

  // A test variables that writes no base-type is unknown where it writes no weight, and float
  // where it writes one (§7.39.5 and §7.39.6; decision 434).
  for (const e of rows.Expression.values()) {
    const written = (attribute: string): boolean =>
      writtenAt(rows, e.start, attribute) !== undefined;
    if (!attributeDerives(rows, e)) {
      broken.add("E1_derived");
    }

    if (
      nodeAt(rows, e.start).kind === "qti-test-variables" &&
      !written("base-type") &&
      e.baseType !== (written("weight-identifier") ? "float" : "unknown")
    ) {
      broken.add("E1_derived");
    }
  }

  for (const law of literalBreaches(rows)) {
    broken.add(law);
  }

  return broken;
};

/**
 * Judge every row law of `expressionLaws` on the host over a document's rows.
 *
 * @param rows - The rows.
 * @returns The names of the laws the rows break, each once.
 */
const breachesOf = (rows: Rows): ReadonlySet<Law> => {
  const broken = new Set<Law>(overlayBreaches(rows));
  for (const row of rows.Expression.values()) {
    const e = folded(rows, row);
    for (const [law, holds] of expressionLawsOnHost) {
      if (!holds(e, rows)) {
        broken.add(law);
      }
    }
  }

  for (const v of referencesOf(rows)) {
    for (const [law, holds] of referenceLawsOnHost) {
      if (!holds(v, rows)) {
        broken.add(law);
      }
    }
  }

  for (const h of heldTypesOnHost(rows)) {
    for (const [law, holds] of heldLawsOnHost) {
      if (!holds(h)) {
        broken.add(law);
      }
    }
  }

  return broken;
};

/**
 * The test environment each bare outcome-processing fixture was typed under by the old checker,
 * its outcome declarations as a test declares them: `outcome.xml`'s TOTAL and MAXTOTAL float,
 * COUNT integer and PASSED boolean.
 */
const testEnvironments: ReadonlyMap<string, readonly (readonly [string, string])[]> = new Map([
  [
    "valid/outcome.xml",
    [
      ["TOTAL", "float"],
      ["MAXTOTAL", "float"],
      ["COUNT", "integer"],
      ["PASSED", "boolean"],
    ],
  ],
]);

/**
 * Read a fixture's text as a document the importer reads. A bare `qti-outcome-processing` root,
 * which no QTI document is, stands in the test its comment names: a `qti-assessment-test` holding
 * its outcome declarations and the processing.
 *
 * @param file - The fixture, relative to the fixtures' directory.
 * @returns The document's text.
 */
const textOf = (file: string): string => {
  const text = readFileSync(nodePath.join(fixtures, file), "utf-8");
  const environment = testEnvironments.get(file);
  if (environment === undefined) {
    return text;
  }

  const body = text.replace(/^<\?xml[^>]*\?>\s*/u, "");
  const declarations = environment
    .map(
      ([identifier, baseType]) =>
        `<qti-outcome-declaration identifier="${identifier}" cardinality="single" base-type="${baseType}"/>`,
    )
    .join("");

  return `<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T" title="T">${declarations}${body}</qti-assessment-test>`;
};

/**
 * Shred a fixture.
 *
 * @param file - The fixture, relative to the fixtures' directory.
 * @returns Its tree.
 */
const treeOfFixture = (file: string) =>
  Effect.gen(function* treeOfFile() {
    const xml = yield* readXml(new TextEncoder().encode(textOf(file)));

    return yield* shred(xml, shredGrammarOf(grammar));
  });

/**
 * Shred a fixture and build its rows.
 *
 * @param file - The fixture, relative to the fixtures' directory.
 * @returns Its rows.
 */
const rowsOfFixture = (file: string) => Effect.map(treeOfFixture(file), rowsOfTree);

describe("import/overlays/expressions.ts, the fixtures' verdicts", () => {
  it.effect(
    "refuses each fixture under exactly the rule the old checker gave it, and accepts the rest",
    () =>
      // Oracle: a second implementation, the old processing checker (`src/processing/check.ts` at
      // its deletion), run once over every fixture and frozen in `verdicts.tsv`; a guard fixture's
      // rule is another slice's, so O4's laws accept it. Bound: every fixture, 36 documents.
      Effect.gen(function* fixtureVerdicts() {
        assert.strictEqual(frozen.length, 36);
        for (const { file, rule, source } of frozen) {
          const rows = yield* rowsOfFixture(file);
          const rules = new Set([...breachesOf(rows)].map((law) => ruleOf[law]));
          const expected = source === "guard" || rule === "accepted" ? [] : [rule];

          assert.isTrue(source === "guard" || rows.Expression.size > 0, file);
          assert.deepStrictEqual([...rules].toSorted(), expected, file);
        }
      }),
  );

  it.effect(
    "keys every row by its element's place, and every reference by its place and name",
    () =>
      // Oracle: rule 7 of the W5 rules, set semantics: each relation's rows are a keyed set, and an
      // operand's operator is its expression's parent, itself an expression.
      Effect.gen(function* keyed() {
        for (const { file } of frozen) {
          const rows = yield* rowsOfFixture(file);
          for (const [key, row] of rows.Expression) {
            assert.strictEqual(key, keyTextOf(row.package, row.path, row.start), file);
          }

          for (const [key, row] of rows.VariableRef) {
            assert.strictEqual(
              key,
              keyTextOf(row.package, row.path, row.start, row.attribute),
              file,
            );
          }
        }
      }),
  );
});

/**
 * Shred a document's text and build its rows.
 *
 * @param text - The document's text.
 * @returns Its rows.
 */
const rowsOfText = (text: string) =>
  Effect.gen(function* rowsOfDocument() {
    const xml = yield* readXml(new TextEncoder().encode(text));

    return rowsOfTree(yield* shred(xml, shredGrammarOf(grammar)));
  });

/**
 * An item that declares a string response `RESPONSE` and a float outcome `SCORE`, and sets `SCORE`
 * under the given condition expression.
 *
 * @param condition - The expression of the response processing's one `qti-response-if`.
 * @returns The item's text.
 */
const itemUnder = (condition: string): string =>
  `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="I" title="I" time-dependent="false"><qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-response-processing><qti-response-condition><qti-response-if>${condition}<qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value></qti-response-if></qti-response-condition></qti-response-processing></qti-assessment-item>`;

/**
 * The laws an item's rows break when its response processing sets a score under an expression.
 *
 * @param condition - The expression, as written.
 * @returns The names of the laws broken.
 */
const breachesUnder = (condition: string) =>
  Effect.map(rowsOfText(itemUnder(condition)), (rows) => [...breachesOf(rows)]);

/**
 * A `qti-pattern-match` of the given `pattern` over a string literal.
 *
 * @param pattern - The `pattern`, as written.
 * @returns The expression's text.
 */
const patternMatch = (pattern: string): string =>
  `<qti-pattern-match pattern="${pattern}"><qti-base-value base-type="string">x</qti-base-value></qti-pattern-match>`;

describe("import/overlays/expressions.ts, a braced pattern that names no variable (reading R15-k)", () => {
  it.effect(
    "is a string value in an item, while a name of the wrong kind or base type and an unresolved bare reference stay refused",
    () =>
      // Oracle: information model §9.3.4, "if a string appears to be a reference to a template or
      // outcome variable but there is no variable with the given name it should be treated simply
      // as string value", and §2.11.3's base type for a name that is one (P24). Bound: the item's
      // one reference, each of the four spellings.
      Effect.gen(function* braced() {
        assert.deepStrictEqual(
          yield* breachesUnder(patternMatch("{NOSUCH}")),
          [],
          "no such variable",
        );
        assert.deepStrictEqual(
          yield* breachesUnder(patternMatch("{RESPONSE}")),
          ["Reference_type"],
          "a response variable",
        );
        assert.deepStrictEqual(
          yield* breachesUnder(patternMatch("{SCORE}")),
          ["Reference_type"],
          "a float outcome",
        );
        assert.deepStrictEqual(
          yield* breachesUnder(`<qti-is-null><qti-variable identifier="NOSUCH"/></qti-is-null>`),
          ["Variable_declared"],
          "an unresolved bare reference",
        );
      }),
  );
});

/**
 * Every law the host judges, read once.
 */
const hostLaws = judgedLaws(Qti);

layer(NodeServices.layer, { excludeTestServices: true })(
  "import/overlays/expressions.ts, a base value's base-type",
  (live) => {
    live.effect(
      "types a base value by the base its base-type spells, and the schema's laws over the import's rows refuse one that spells none under its value domain alone",
      () =>
        // Oracle: the specification's verdict of each case by hand (`base-value-cases.ts`), the
        // information model's BaseTypeEnum (§8.13), a preserve `xs:string` enumeration, so a form
        // that spells no base is AL1's lexical half's alone ("value domain", rule
        // attribute-lexical), against the schema's laws over the import's rows: the host judge's,
        // the declaration queries' and the expression laws over a query as `breachesOf` restates
        // them. The law oracle is held to the same verdicts by `base-value.oracle.test.ts`. Bound:
        // the eleven bases written exactly and fourteen forms that spell none.
        Effect.gen(function* baseValueTypes() {
          for (const drawn of baseValueCases) {
            const { form, verdict } = drawn;
            const known = verdict.length === 0;
            const where = JSON.stringify(form);
            const entries = baseValuePackageOf(drawn);

            const { inputs } = yield* Effect.scoped(
              Effect.flatMap(scopedPackage(entries), (dir) => readProgram(dir, "scoped")),
            );
            const rows = previewRowsOf(inputs);
            const { broken } = judgeHost(rows, hostLaws);
            assert.sameMembers(
              [
                ...new Set([
                  ...broken.map(({ law }) =>
                    Option.getOrElse(schemaLawNameOf(law), () => Formatter.format(law)),
                  ),
                  ...declarationQueryLawsOf(rows),
                ]),
              ],
              [...verdict],
              `${where}: the import's rows`,
            );

            const item = entries.get("item.xml") ?? new Uint8Array();
            const expressionRows = rowsOfTree(
              yield* shred(yield* readXml(item), shredGrammarOf(grammar)),
            );
            const value = [...expressionRows.Expression.values()].find(
              ({ start }) => nodeAt(expressionRows, start).kind === "qti-base-value",
            );
            if (known) {
              assert.strictEqual(value?.baseType, form, where);
            }

            assert.strictEqual(
              value !== undefined &&
                expressionRows.LiteralTyped.has(keyTextOf(value.package, value.path, value.start)),
              known,
              where,
            );
            assert.strictEqual(breachesOf(expressionRows).size, 0, where);
          }
        }),
    );
  },
);

// The readings of a test's references (spec readings 48 and 88; representation-gaps.md §4).

/**
 * An element of a kind, with its attributes as (name, lexical) pairs and its children.
 *
 * @param kind - The kind.
 * @param attributes - The attributes, in order.
 * @param children - The children, in order.
 * @returns The element.
 */
const el = (
  kind: ElementKind<Composed>,
  attributes: readonly (readonly [ClosedName<Composed>, string])[] = [],
  children: readonly XdmChild<Composed>[] = [],
): XdmClosedElement<Composed> => ({
  _tag: "element",
  attributes: attributes.map(([handle, lexical]) => ({
    lexical,
    name: closedName(handle),
    references: [],
  })),
  children,
  governs: Option.none(),
  kind,
  namespaces: [],
  prefix: "",
});

/**
 * A document of one root element.
 *
 * @param root - The root.
 * @returns The document.
 */
const documentOfRoot = (root: XdmClosedElement<Composed>): XdmDocument<Composed> => ({
  _tag: "document",
  charset: "utf-8",
  declaration: Option.none(),
  epilog: [],
  exportCharset: "utf-8",
  prolog: [],
  root,
});

/**
 * The names a document declares as its own tree says: each declaration element's collapsed
 * identifier.
 *
 * @param tree - The document's tree.
 * @returns The identifiers.
 */
const declarationsInTree = (tree: XdmDocument<Composed>): ReadonlySet<string> => {
  const declared = new Set<string>();
  const visit = (node: XdmChild<Composed>): void => {
    if (node._tag !== "element") {
      return;
    }

    const identifier = node.attributes.find(
      ({ name }) => name._tag === "closed" && name.handle === "identifier",
    )?.lexical;
    if (
      [
        "qti-context-declaration",
        "qti-outcome-declaration",
        "qti-response-declaration",
        "qti-template-declaration",
      ].includes(node.kind) &&
      identifier !== undefined
    ) {
      declared.add(identifier.trim());
    }

    for (const child of node.children) {
      visit(child);
    }
  };
  visit(tree.root);

  return declared;
};

describe("import/overlays/expressions.ts, the claims a reference proves", () => {
  it("types a test variables that writes no base-type unknown, or float where it is weighted", () => {
    // Oracle: the information model's TestVariables (§7.39.6: a base-type, where written,
    // selects the variables matched and is the result's; none written, every integer and float
    // one): the expression is float where it writes a base-type of float or a weight (§7.39.5:
    // "When a weighting is specified the result of the expression always has base-type float"),
    // and `unknown` where it writes neither; no row copies an attribute it writes.
    // Bound: the base-type and the weight each written and unwritten.
    for (const [written, weighted] of [
      [false, false],
      [false, true],
      [true, false],
      [true, true],
    ] as const) {
      const tree = documentOfRoot(
        el(
          "qti-assessment-test",
          [
            ["identifier", "T"],
            ["title", "T"],
          ],
          [
            el(
              "qti-outcome-processing",
              [],
              [
                el(
                  "qti-set-outcome-value",
                  [["identifier", "OUT"]],
                  [
                    el(
                      "qti-sum",
                      [],
                      [
                        el("qti-test-variables", [
                          ["variable-identifier", "SCORE"],
                          ...(written ? ([["base-type", "float"]] as const) : []),
                          ...(weighted ? ([["weight-identifier", "W"]] as const) : []),
                        ]),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      );
      const rows = rowsOfTree(tree);
      const variables = [...rows.Expression.values()].find(
        ({ start }) => nodeAt(rows, start).kind === "qti-test-variables",
      );

      assert.strictEqual(variables?.baseType, written || weighted ? "float" : "unknown");
      assert.isFalse(breachesOf(rows).has("E1_derived"));
    }
  });

  it("types a weighted read of an integer variable float, and every other read as its variable", () => {
    // Oracle: the information model's Variable (§7.47: "The result has the base-type and
    // cardinality declared for the variable subject to the type promotion of weighted outcomes";
    // §7.47.2: "When applying a weight to the value of a variable with base-type integer the value
    // is subject to type promotion and the result of the expression has base-type float", and "If
    // the item variable is of any other type the weight is ignored"), and E1_derived's
    // `UnweightedRead` and `WeightedRead`, which hold the element so.
    // Bound: an integer, a float and an identifier variable, each read weighted and unweighted.
    for (const [base, weighted] of [
      ["integer", false],
      ["integer", true],
      ["float", false],
      ["float", true],
      ["identifier", false],
      ["identifier", true],
    ] as const) {
      const tree = documentOfRoot(
        el(
          "qti-assessment-test",
          [
            ["identifier", "T"],
            ["title", "T"],
          ],
          [
            el("qti-outcome-declaration", [
              ["identifier", "READ"],
              ["cardinality", "single"],
              ["base-type", base],
            ]),
            el(
              "qti-outcome-processing",
              [],
              [
                el(
                  "qti-set-outcome-value",
                  [["identifier", "OUT"]],
                  [
                    el("qti-variable", [
                      ["identifier", "READ"],
                      ...(weighted ? ([["weight-identifier", "W"]] as const) : []),
                    ]),
                  ],
                ),
              ],
            ),
          ],
        ),
      );
      const rows = rowsOfTree(tree);
      const read = [...rows.Expression.values()].find(
        ({ start }) => nodeAt(rows, start).kind === "qti-variable",
      );

      assert.strictEqual(
        read?.baseType,
        weighted && base === "integer" ? "float" : base,
        `${base}${weighted ? " weighted" : ""}`,
      );
      assert.strictEqual(read?.cardinality, "single");
      assert.isFalse(breachesOf(rows).has("E1_derived"), `${base}${weighted ? " weighted" : ""}`);
    }
  });

  it.effect(
    "resolves a reference to a declaration exactly where its document declares its name, and types every unwritten unweighted base type unknown",
    () =>
      // Oracle: each document's own tree (`declarationsInTree`), a second reading of what it
      // declares, against the references the builder writes under the document's own placement
      // (M2, `DeclaredPlacement` of `#pantry/qti/queries.ts`): a reference is declared exactly
      // where its document declares its name, and every test variables that writes neither a
      // `base-type` nor a weight is `unknown`.
      // Bound: every fixture, 36 documents.
      Effect.gen(function* claimsProved() {
        for (const { file } of frozen) {
          const tree = yield* treeOfFixture(file);
          const rows = rowsOfTree(tree);
          const declared = declarationsInTree(tree);

          for (const reference of rows.VariableRef.values()) {
            assert.strictEqual(
              reference.resolution === "declared",
              declared.has(reference.identifier),
              `${file} ${reference.identifier}`,
            );
          }

          for (const expression of rows.Expression.values()) {
            const written = (attribute: string): boolean =>
              writtenAt(rows, expression.start, attribute) !== undefined;
            if (
              nodeAt(rows, expression.start).kind === "qti-test-variables" &&
              !written("base-type") &&
              !written("weight-identifier")
            ) {
              assert.strictEqual(expression.baseType, "unknown", file);
            }
          }
        }
      }),
  );
});
