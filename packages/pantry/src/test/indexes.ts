/**
 * The tests' own indexes of the grammar's relations no serving path reads by key.
 *
 * A serving path (the database's layer, its reads and the importer's writes) looks up only the
 * relations the grammar builds `Indexed` (`#pantry/grammar/closed.ts`); every other relation holds
 * its rows alone, so no load builds an index nothing serving reads. A test that reads one by key
 * builds its index here, once per relation, and the content automaton's and the ancestry's
 * judgments the tests read (`accepts`, `contentEnds`, `admits`) read those indexes.
 */
import { Option } from "effect";
import { rowOf } from "#pantry/grammar/ancestry.ts";
import type { Ancestry, AncestrySets, IndexedFlagSet } from "#pantry/grammar/ancestry.ts";
import { indexed, indexedSourced, rowsAt } from "#pantry/grammar/closed.ts";
import type { Admission } from "#pantry/grammar/admission.ts";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import { contentModelOf, stepOf } from "#pantry/grammar/content.ts";
import type { ContentGrammar } from "#pantry/grammar/content.ts";

/**
 * Index every relation of a composed grammar that no serving path reads by key.
 *
 * @param grammar - The grammar.
 * @returns Each relation, indexed.
 */
const indexesFor = (grammar: ComposedGrammar) => ({
  anonymousType: indexedSourced(grammar.xsi.anonymousType),
  banned: indexed(grammar.ancestry.banned),
  barredBy: indexedSourced(grammar.barredBy),
  bindingFit: indexed(grammar.bindingFit),
  builtIn: indexed(grammar.references.builtIn),
  builtInBaseType: indexed(grammar.references.builtInBaseType),
  capped: indexedSourced(grammar.content.capped),
  choiceBound: indexed(grammar.references.choiceBound),
  choiceCount: indexed(grammar.references.choiceCount),
  counted: indexedSourced(grammar.content.counted),
  countedMax: grammar.content.countedMax,
  heldRootsUnder: indexed(grammar.heldRootsUnder),
  identity: indexed(grammar.attributes.identity),
  mappableBaseType: indexed(grammar.mappableBaseType),
  needs: indexed(grammar.ancestry.needs),
  operatorArity: indexed(grammar.operatorArity),
  operatorMax: indexed(grammar.operatorMax),
  recordBindingFit: indexed(grammar.recordBindingFit),
  sectionPart: indexed(grammar.references.sectionPart),
  xsiType: indexedSourced(grammar.xsi.xsiType),
});

/**
 * The relations of a composed grammar no serving path reads by key, indexed.
 */
type GrammarIndexes = ReturnType<typeof indexesFor>;

/**
 * Each composed grammar's indexes, built at its first read.
 */
const built = new WeakMap<ComposedGrammar, GrammarIndexes>();

/**
 * Read a composed grammar's relations no serving path reads by key, each indexed once.
 *
 * @param grammar - The grammar.
 * @returns The indexes.
 */
export const indexesOf = (grammar: ComposedGrammar): GrammarIndexes =>
  built.getOrInsertComputed(grammar, () => indexesFor(grammar));

/**
 * A family position's count bounds as the count laws read them: a `Counted` position's least count
 * and its `CountedMax` greatest, `Infinity` where its particle states none, or a `Capped`
 * position's 0 to 1 (spec reading `lom-repetition`).
 */
export interface CountBounds {
  readonly max: number;
  readonly min: number;
  readonly parent: string;
  readonly position: string;
  /**
   * The relation that states the bound: `Counted` for a particle's count, `Capped` for a cap.
   */
  readonly relation: "Capped" | "Counted";
}

/**
 * Read every count bound a content grammar states, its counts' and its caps'.
 *
 * @param content - The content grammar.
 * @returns The bounds, the counts' in `Counted`'s order and then the caps' in `Capped`'s.
 */
export const countBoundsOf = (
  content: Pick<ContentGrammar, "capped" | "counted" | "countedMax">,
): readonly CountBounds[] => [
  ...content.counted.rows.map(({ min, parent, position }) => ({
    max: Option.match(content.countedMax.lookup({ parent, position }), {
      onNone: () => Number.POSITIVE_INFINITY,
      onSome: (row) => row.max,
    }),
    min,
    parent,
    position,
    relation: "Counted" as const,
  })),
  ...content.capped.rows.map(({ parent, position }) => ({
    max: 1,
    min: 0,
    parent,
    position,
    relation: "Capped" as const,
  })),
];

/**
 * An expression kind's arity as `Arity` reads it: its `OperatorArity` least operand count, and its
 * `OperatorMax` greatest, none where its content bounds them by none.
 */
export interface ArityBounds {
  readonly max: Option.Option<bigint>;
  readonly min: bigint;
}

/**
 * Read an expression kind's arity.
 *
 * @param grammar - The composed grammar.
 * @param kind - The kind.
 * @returns Its bounds, none for a kind `OperatorArity` holds no row of.
 */
export const arityOf = (grammar: ComposedGrammar, kind: string): Option.Option<ArityBounds> =>
  Option.map(indexesOf(grammar).operatorArity.lookup({ kind }), ({ min }) => ({
    max: Option.map(indexesOf(grammar).operatorMax.lookup({ kind }), ({ max }) => max),
    min,
  }));

/**
 * Whether a count lies within an arity's bounds.
 *
 * @param arity - The bounds.
 * @param count - The count.
 * @returns Whether it is at least the least and at most the greatest, where there is one.
 */
export const withinArity = (arity: ArityBounds, count: bigint): boolean =>
  count >= arity.min &&
  Option.match(arity.max, { onNone: () => true, onSome: (most) => count <= most });

/**
 * Each content grammar's `Last`, indexed at its first read.
 */
const lastIndexes = new WeakMap<
  ContentGrammar["last"],
  ReturnType<typeof indexed<ContentGrammar["last"]["key"], ContentGrammar["last"]["payload"]>>
>();

/**
 * Whether a family may end in a state: `Last`'s cell under the family's model.
 *
 * @param content - The content grammar.
 * @param parent - The parent's kind.
 * @param state - The last child's state, 0 for an empty family.
 * @returns Whether the family may end there.
 */
export const contentEnds = (content: ContentGrammar, parent: string, state: number): boolean => {
  const last = lastIndexes.getOrInsertComputed(content.last, () => indexed(content.last));

  return Option.exists(contentModelOf(content, { parent }), (model) =>
    Option.isSome(last.lookup({ model, position: String(state) })),
  );
};

/**
 * Judge a family of child kinds by the installed automaton, as the database does: each child steps
 * from its predecessor's state (0 for the first), and the last state must be one `Last` holds.
 *
 * @param grammar - The composed grammar's `Admission` and content grammar.
 * @param grammar.admission - `Admission`.
 * @param grammar.content - The content grammar.
 * @param parent - The parent's kind.
 * @param children - The children's kinds, in order.
 * @returns Whether the family's content is the model's.
 */
export const accepts = (
  grammar: { readonly admission: Admission; readonly content: ContentGrammar },
  parent: string,
  children: readonly string[],
): boolean => {
  let state = 0;
  for (const child of children) {
    const next = stepOf(grammar, { child, parent }, state);
    if (Option.isNone(next)) {
      return false;
    }

    state = next.value;
  }

  return contentEnds(grammar.content, parent, state);
};

/**
 * Each ancestry grammar's `Banned` and `Needs`, indexed at their first read.
 */
const ancestryIndexes = new WeakMap<
  AncestrySets,
  { readonly banned: IndexedFlagSet; readonly needs: IndexedFlagSet }
>();

/**
 * Read an ancestry grammar's `Banned` and `Needs`, each indexed once.
 *
 * @param sets - The ancestry grammar.
 * @returns The two sets, indexed.
 */
export const ancestryIndexesOf = (
  sets: AncestrySets,
): { readonly banned: IndexedFlagSet; readonly needs: IndexedFlagSet } =>
  ancestryIndexes.getOrInsertComputed(sets, () => ({
    banned: indexed(sets.banned),
    needs: indexed(sets.needs),
  }));

/**
 * Decide whether a node of a kind may sit in an ancestry: it holds no flag of `Banned[kind]` and
 * every flag of `Needs[kind]`, over the ancestry grammar's sets, indexed here.
 *
 * Both read the ancestry the node sits in, never its own, because a kind may enter a flag it is
 * banned under: an interaction enters `int` and may not sit inside one, so a ban over the node's
 * own ancestry would refuse every interaction.
 *
 * @param sets - The ancestry grammar.
 * @param parent - The ancestry the node sits in, its parent's own.
 * @param kind - The node's kind.
 * @returns Whether the node may sit there.
 */
export const admits = (sets: AncestrySets, parent: Ancestry, kind: string): boolean => {
  const { banned, needs } = ancestryIndexesOf(sets);

  return rowOf(banned, kind).isDisjointFrom(parent) && rowOf(needs, kind).isSubsetOf(parent);
};

/**
 * Spell the admission maps `install.ts` declares out as the (parent, child) → position
 * rows they state, ChildGrammar's once: each family's map (`ContentModelOf`'s `admission`) with
 * each of its children (`AdmissionIn`).
 *
 * @param models - `ContentModelOf`, as installed.
 * @param models.rows - Its rows.
 * @param admissionIn - `AdmissionIn`, as installed.
 * @param admissionIn.rows - Its rows.
 * @returns The rows, by family in `ContentModelOf`'s order.
 */
export const admittedOf = <Parent extends string, Child extends string>(
  models: { readonly rows: readonly { readonly admission: string; readonly parent: Parent }[] },
  admissionIn: {
    readonly rows: readonly {
      readonly child: Child;
      readonly map: string;
      readonly position: string;
    }[];
  },
): readonly { readonly child: Child; readonly parent: Parent; readonly position: string }[] => {
  const members = Map.groupBy(admissionIn.rows, ({ map }) => map);

  return models.rows.flatMap(({ admission, parent }) =>
    rowsAt(members, admission).map(({ child, position }) => ({ child, parent, position })),
  );
};

/**
 * Spell symbol sets out as the (shared model, kind, position) rows they state, the positions each
 * shared model names each of its kinds at: each pair's set (`SymbolSetOf`) with each of its
 * positions (`SymbolMember`), as the content grammar or `install.ts` states them.
 *
 * @param symbolSetOf - `SymbolSetOf`.
 * @param symbolSetOf.rows - Its rows.
 * @param symbolMember - `SymbolMember`.
 * @param symbolMember.rows - Its rows.
 * @returns The rows, by pair in `SymbolSetOf`'s order.
 */
export const symbolRowsOf = <Kind extends string, Model extends string>(
  symbolSetOf: {
    readonly rows: readonly { readonly kind: Kind; readonly model: Model; readonly set: string }[];
  },
  symbolMember: { readonly rows: readonly { readonly position: string; readonly set: string }[] },
): readonly { readonly kind: Kind; readonly model: Model; readonly position: string }[] => {
  const members = Map.groupBy(symbolMember.rows, ({ set }) => set);

  return symbolSetOf.rows.flatMap(({ kind, model, set }) =>
    rowsAt(members, set).map(({ position }) => ({ kind, model, position })),
  );
};

/**
 * Spell include sets out as the (include parent, kind) rows they state, the kinds an
 * include under each family stands for: each family's set (`IncludeSetOf`) with each of its kinds
 * (`IncludeMember`), as the include grammar or `install.ts` states them.
 *
 * @param includeSetOf - `IncludeSetOf`.
 * @param includeSetOf.rows - Its rows.
 * @param includeMember - `IncludeMember`.
 * @param includeMember.rows - Its rows.
 * @returns The rows, by family in `IncludeSetOf`'s order.
 */
export const includeRowsOf = <Kind extends string, Parent extends string>(
  includeSetOf: { readonly rows: readonly { readonly parent: Parent; readonly set: string }[] },
  includeMember: { readonly rows: readonly { readonly kind: Kind; readonly set: string }[] },
): readonly { readonly kind: Kind; readonly parent: Parent }[] => {
  const members = Map.groupBy(includeMember.rows, ({ set }) => set);

  return includeSetOf.rows.flatMap(({ parent, set }) =>
    rowsAt(members, set).map(({ kind }) => ({ kind, parent })),
  );
};
