/**
 * The content grammar: each parent's content model as its Glushkov automaton (Bjorn's
 * ruling of 2026-11-05, Glushkov for all 638 models).
 *
 * A model's positions are its element and wildcard particles, numbered from 1 in tree order (U4's
 * particle numbering); 0 is the start. A child's `Admission` row carries its position: the one
 * position its kind names, or 0 where its kind names none (character data, which carries its
 * predecessor's state) or several (a shared kind, whose position the state decides among its
 * symbol set's). The law reads one bit, whether `position` is in the follow set of `was`:
 * `FollowMember(FollowSetOf(model, was), position)`, with `model` the family's
 * `ContentModelOf(parent)` and `was` the predecessor's position (0 for the first child),
 * and the last child reads `Last(model, state)`: the relations are keyed by automaton, each
 * distinct automaton stated once, however many families share it, and each state's follow set by
 * its set, each distinct set stated once, however many states share it. Under Unique Particle
 * Attribution the automaton enforces order, required particles, at-most-once and exclusive choice;
 * a bound of 2…n, which a position automaton relaxes, is a count law, `Counted(parent, position) →
 * (min, max)`. So is a reading's cap, a particle of at most one that an enclosing group
 * repeats, which the automaton reads per repeat and the reading reads as the family's total:
 * `Counted` holds it as `(0, 1)` (spec reading 130, the loose LOM binding's Schematron).
 *
 * A group's bound of 2…n the automaton relaxes too, to `1..n` (`automatonOf` links a repeatable
 * group's last positions to its first, whatever its bounds), and no position carries it, so
 * `Counted` does not hold it. Every such bound in the pinned XSDs is a `choice` of 2..2 whose every
 * member is one operand exactly once, the content of nineteen expression operators: the fifteen
 * that share the pair at `imsqti_asiv3p0p1_v1p0.xsd:29337` (`qti-contains`, `qti-delete`,
 * `qti-divide`, `qti-duration-gte`, `qti-duration-lt`, `qti-gt`, `qti-gte`, `qti-integer-divide`,
 * `qti-integer-modulus`, `qti-lt`, `qti-lte`, `qti-match`, `qti-member`, `qti-power`,
 * `qti-subtract`), and `qti-equal`, `qti-equal-rounded`, `qti-string-match` and `qti-substring`,
 * each with its own (lines 26945, 27046, 32183, 32264); so the operator's child count is the
 * group's repeat count, and `OperatorArity(kind) → (min, max)`, which `aritiesOf` reads off that
 * same group, holds it: law O4, `Arity` (`src/qti/expressions.ts`), counts an expression's operands
 * against it. The automaton admits `qti-contains` with one operand, and Arity refuses it.
 * `content.test.ts` proves both halves: its occurrence-bound census refuses any counted group whose
 * operator's `OperatorArity` is not exactly its bound or whose repeat is not one child, and its
 * xmllint differential exhausts every family of at most 3 children over each such operator.
 *
 * {@link contentOf} builds each automaton from the content-model IR, through `outlineOf`,
 * `structureOf` and `positionsOf` (`#pantry/vocab/sequencing.ts`), once per distinct outline, and
 * installs it.
 */
import { Array as Arr, Option, Result, Schema } from "effect";
import type { Admission, AdmissionKey, AdmittedChild } from "#pantry/grammar/admission.ts";
import {
  closed,
  dependentField,
  idField,
  indexed,
  indexedSourced,
  prefixHandle,
  roster,
  rowsAt,
  sourced,
  tupleKey,
  valueField,
} from "#pantry/grammar/closed.ts";
import type {
  Closed,
  DependentField,
  IdField,
  Indexed,
  IndexedSourced,
  NonEmptyRoster,
  Roster,
  Sourced,
  ValueField,
} from "#pantry/grammar/closed.ts";
import { foreignKinds } from "#pantry/grammar/kinds.ts";
import { contentParticle } from "#pantry/vocab/inventory/types.ts";
import type {
  ContentModel,
  ContentType,
  Occurs,
  Particle,
  Source,
} from "#pantry/vocab/inventory/types.ts";
import {
  admitsNamespace,
  mathmlNamespace,
  namespaceClassesUnder,
} from "#pantry/vocab/namespaces.ts";
import type { NamespaceOfKind } from "#pantry/vocab/namespaces.ts";
import { positionsOf, outlineOf, structureOf } from "#pantry/vocab/sequencing.ts";
import type { Automaton, Position, Structure } from "#pantry/vocab/sequencing.ts";

/**
 * A spec reading that edits a content model where it says more than the XSD: a kind admitted beside
 * another in every particle that names it; kinds that come
 * before every other element of the model and before its text that is not whitespace; the model
 * restated whole, where the language the reading follows is not the XSD's and no edit of a particle
 * states it, narrower or wider (spec reading 2, MathML's RelaxNG); the kinds a family's last
 * child is one of, which narrows the model's `Last` where its language is no deterministic
 * expression's (spec reading 2, MathML's `lambda`); or a kind that stands at most once among a
 * family's children wherever the model repeats it, a count `Counted` states beside the automaton
 * (spec reading 130, the loose LOM binding's Schematron).
 */
export type ModelEdit =
  | {
      readonly _tag: "cap";
      readonly kind: string;
      readonly parent: string;
      readonly source: string;
    }
  | {
      readonly _tag: "beside";
      readonly kind: string;
      readonly parent: string;
      readonly source: string;
      readonly with: string;
    }
  | {
      readonly _tag: "first";
      readonly kinds: readonly [string, ...string[]];
      readonly parent: string;
      readonly source: string;
    }
  | {
      readonly _tag: "restate";
      readonly parent: string;
      readonly particle: Particle;
      readonly source: string;
    }
  | {
      readonly _tag: "ends";
      readonly kinds: readonly [string, ...string[]];
      readonly parent: string;
      readonly source: string;
    };

/**
 * The kinds of one namespace, named by its URI, that are its only roots: the only kinds of that
 * namespace a wildcard admits, wherever it stands, and where it comes from (spec reading 2:
 * MathML's one root, `m:math`).
 */
interface Roots {
  readonly kinds: readonly [string, ...string[]];
  readonly namespace: string;
  readonly source: string;
}

/**
 * A vocabulary's share of the content grammar: its spec readings' edits, the models of kinds no XSD
 * declares (the document node, the foreign kinds), and the roots of its namespace, none where a
 * wildcard admits every kind it declares globally.
 */
export interface ContentFacet {
  readonly edits: readonly ModelEdit[];
  readonly models: readonly ContentModel[];
  readonly roots: readonly Roots[];
}

/**
 * The key of a relation per (parent, position), its parent a `NodeKind` handle.
 */
type PositionKey<K extends string> = readonly [IdField<"parent", K>, DependentField<"position">];

/**
 * The key of a relation per parent family, its parent a `NodeKind` handle.
 */
type FamilyKey<K extends string> = readonly [IdField<"parent", K>];

/**
 * The content grammar's relations, and the host's view of each automaton.
 *
 * `FollowSetOf` and `Last` are keyed by the automaton, not by the parent's family: two
 * families whose automata have the same positions, follow sets and `Last` are one content model
 * (rule 0: identical facts are one fact), and a family reads its model through `ContentModelOf`;
 * `SymbolSetOf` is keyed likewise by its shared model, through `SharedModelOf`. A state's follow
 * set is keyed by the set, through `FollowSetOf`, by the same rule: a repeated choice of n
 * particles has n + 1 states that follow to the same n positions, so its automaton's transitions,
 * n² + n of them, are one set of n; and so is a shared kind's set of positions, through
 * `SymbolSetOf`, which 3,282 (model, kind) pairs share as 333 sets. Where a family's row comes from
 * is the family's, not the model's, so {@link ContentGrammar.sourceOf} answers it by family and
 * position.
 *
 * `K` is the `NodeKind` handles every kind field ranges over: the composition's (`compose.ts`), and
 * `string` for a reader that reads any composition's.
 */
export interface ContentGrammar<K extends string = string> {
  /**
   * `AdmissionIn`: (map, child) → position, each admission map's children at their positions in
   * their parent's content model, 0 for character data, for a kind several positions name and for
   * a triple a vocabulary states beside its models. A family that admits no child holds the empty
   * map, which holds no row.
   */
  readonly admissionIn: Indexed<
    readonly [IdField<"map", string>, IdField<"child", K>],
    readonly [IdField<"position", string>]
  >;
  /**
   * The `AdmissionMap` roster: every distinct admission map of a family, the children it admits
   * at their positions, numbered from 0 in the order of the first family, in parent code order,
   * that holds it (rule 0: identical facts are one fact): 1,288 families hold 190.
   */
  readonly admissionMaps: Roster<string>;
  /**
   * `ContentModelOf`: parent → (model, admission), total: the automaton the family's
   * children follow, and the family's admission map. A family no content model holds reads the
   * model of one position that nothing follows and nothing ends at.
   */
  readonly contentModelOf: Indexed<
    FamilyKey<K>,
    readonly [IdField<"model", string>, IdField<"admission", string>]
  >;
  /**
   * `Counted`: the positions whose count is a law beside the automaton, a particle bound of 2…n,
   * each with its least count and sourced to the particle whose bound it is.
   */
  readonly counted: Sourced<PositionKey<K>, readonly [ValueField<"min", number>]>;
  /**
   * `CountedMax`: the greatest count of each `Counted` position whose particle states one. A
   * particle of `maxOccurs="unbounded"` states none, and its position has no row.
   */
  readonly countedMax: Indexed<PositionKey<K>, readonly [ValueField<"max", number>]>;
  /**
   * `Capped`: the positions a spec reading caps at one child (spec reading 130, the loose LOM
   * binding's Schematron), each sourced to its reading: at most one child of the family stands
   * there, however often the model's enclosing group repeats the particle.
   */
  readonly capped: Sourced<PositionKey<K>, readonly []>;
  /**
   * `FollowMember`: (set, to) for each position `to` a follow set holds.
   */
  readonly followMember: Indexed<
    readonly [IdField<"set", string>, IdField<"to", string>],
    readonly []
  >;
  /**
   * The `FollowSet` roster: every distinct follow set of a content model's state, numbered from 0
   * in the order of the first (model, state) that holds it, models in `ContentModel` code order
   * and each model's states ascending.
   */
  readonly followSets: Roster<string>;
  /**
   * `FollowSetOf`: (model, from) → set, total over each content model's states, `from` 0 the
   * start: the positions a child may take after one at `from`, in the model's automaton. A state
   * nothing follows holds the empty set, which `FollowMember` holds no row of.
   */
  readonly followSetOf: Indexed<
    readonly [IdField<"model", string>, DependentField<"from">],
    readonly [IdField<"set", string>]
  >;
  /**
   * `Last`: (model, at) where a family of the model may end at position `at`, 0 when it may be
   * empty.
   */
  readonly last: Closed<
    readonly [IdField<"model", string>, DependentField<"position">],
    readonly []
  >;
  /**
   * `ModelPositions`: model → positions, each content model's position count, its start 0
   * included, `FollowSetOf`'s and `Last`'s dependent sizes.
   */
  readonly modelPositions: Closed<
    readonly [IdField<"model", string>],
    readonly [ValueField<"positions", number>]
  >;
  /**
   * The `ContentModel` roster: every distinct automaton, in the code order of its first family,
   * each named by that family's parent kind.
   */
  readonly models: Roster<string>;
  /**
   * The `Position` roster: 0, the start, then 1 to the widest model's last position.
   */
  readonly positions: NonEmptyRoster<string>;
  /**
   * `SharedModelOf`: parent → shared model, for each family a kind names at several
   * positions; a family whose kinds each name one position has no row.
   */
  readonly sharedModelOf: Indexed<FamilyKey<K>, readonly [IdField<"model", string>]>;
  /**
   * The `SharedModel` roster: every distinct shared model in the code order of its first family,
   * each named as {@link ContentGrammar.models} names a model.
   */
  readonly sharedModels: Roster<string>;
  /**
   * Read a kind's symbol set in a family: the positions its shared model names it at
   * (`SymbolMember` of its `SymbolSetOf` set), where several positions name it and the state
   * decides; none for a kind one position names, or none does.
   *
   * @param key - The family and the kind.
   * @returns The positions, ascending.
   */
  readonly sharedPositions: (key: {
    readonly kind: string;
    readonly parent: string;
  }) => readonly number[];
  /**
   * Find where a family's position comes from: its particle in the XSD, or the
   * reading or specification that states it; position 0 is the family's model as a whole. The tests
   * read it, to name the particle a row of a family comes from.
   *
   * @param key - The family and the position.
   * @returns The source, or none for a position the family's model has not.
   */
  readonly sourceOf: (key: {
    readonly parent: string;
    readonly position: string;
  }) => Option.Option<Source>;
  /**
   * `StrictlyHeld`: (parent, child) for each foreign kind only `strict` wildcards of the
   * parent's model admit, each sourced to the wildcard. Such a child has no declaration its
   * document's schema set gives it, so it stands only where its `xsi:type` names a type that set
   * holds or a built-in, against which XML Schema assesses it (Part 1, §3.3.4 clause 1.2; spec
   * reading 81); without one it is invalid (§3.10.4 clause 2, §3.3.5 [validity] clause 1.1.3).
   */
  readonly strictlyHeld: IndexedSourced<
    readonly [IdField<"parent", K>, IdField<"child", K>],
    readonly []
  >;
  /**
   * `SymbolMember`: (set, position) for each position a symbol set holds.
   */
  readonly symbolMember: Closed<
    readonly [IdField<"set", string>, IdField<"position", string>],
    readonly []
  >;
  /**
   * `SymbolSetOf`: (shared model, kind) → set, for each kind several positions of the model name,
   * whose position the state decides: the set of those positions.
   */
  readonly symbolSetOf: Indexed<
    readonly [IdField<"model", string>, IdField<"kind", K>],
    readonly [IdField<"set", string>]
  >;
  /**
   * The `SymbolSet` roster: every distinct set of positions a shared model names a kind at,
   * numbered from 0 in the order of the first (shared model, kind) that holds it, models in
   * `SharedModel` code order (rule 0: identical facts are one fact).
   */
  readonly symbolSets: Roster<string>;
}

/**
 * A spec reading caps a kind that its model names at several positions, or beside other kinds at
 * one, so no one position's count is the kind's count.
 */
export class UncountedCap extends Schema.TaggedError<UncountedCap>()("UncountedCap", {
  kind: Schema.String,
  parent: Schema.String,
  source: Schema.String,
}) {
  /**
   * The reading, the kind and parent, and the repair.
   */
  override get message(): string {
    return `The spec reading ${this.source} caps ${this.kind} under ${this.parent}, which ${this.parent}'s model does not name at exactly one position of its own, so no position's count is the kind's. Restate the model so one particle names ${this.kind} alone, or state the count as a law of its own.`;
  }
}

/**
 * Spell where a content model comes from, for a refusal's message: its XSD file and line, or the
 * specification or reading that states it.
 *
 * @param source - The source.
 * @returns The text.
 */
const sourceText = (source: Source): string =>
  source._tag === "spec" ? source.cite : `${source.file} line ${String(source.line)}`;

/**
 * Two content models state one family, a kind: an XSD's and a facet's, or two of
 * either, so the family's automaton would be whichever came last while its admissions came from
 * both.
 */
export class DuplicateModel extends Schema.TaggedError<DuplicateModel>()("DuplicateModel", {
  first: Schema.String,
  kind: Schema.String,
  second: Schema.String,
}) {
  /**
   * The family, both models' sources, and the repair.
   */
  override get message(): string {
    return `Two content models state ${this.kind}: ${this.first} and ${this.second}. State the family's model once, and edit the XSD's model through the facet's edits rather than restating it.`;
  }
}

/**
 * The ways the content models have no content grammar.
 */
export type ContentError = DuplicateModel | UncountedCap;

/**
 * The kinds of character data, comments, instructions and entity references: the XDM's nodes
 * between elements, none of them an element. Every composition's `NodeKind` holds them first,
 * after the fixed kinds.
 */
export const characterKinds = ["text", "ws", "comment", "pi", "entityRef"] as const;

/**
 * The character data, comments and instructions each content type admits between its children
 * (XML Schema Part 1 §3.4.4): whitespace, comments and processing instructions in element content,
 * comments and processing instructions alone in empty content, text and entity references too
 * where character data is the content's.
 *
 * One exception stands over the XSD: a MathML element of empty content also admits whitespace, as
 * MathML 3's own RelaxNG does (§2, which matches a whitespace-only text against `empty`; spec
 * reading 2, operator decision 321 (5): "MathML's own schema wins where QTI's bundled copy is
 * stricter"). {@link dataOf} applies it; every other empty kind keeps the set below.
 */
const characterData: Readonly<
  Record<ContentType["_tag"], readonly (typeof characterKinds)[number][]>
> = {
  "element-only": ["ws", "comment", "pi"],
  empty: ["comment", "pi"],
  mixed: ["text", "ws", "comment", "pi", "entityRef"],
  simple: ["text", "ws", "comment", "pi", "entityRef"],
};

/**
 * The character data a model admits between its children: its content type's, and whitespace too
 * where the model is empty and its kind is in MathML's namespace (spec reading 2).
 *
 * @param content - The model's content type.
 * @param namespace - The namespace of the model's kind.
 * @returns The admitted kinds of character data.
 */
const dataOf = (
  content: ContentType,
  namespace: NamespaceOfKind,
): readonly (typeof characterKinds)[number][] =>
  content._tag === "empty" && namespace._tag === "in" && namespace.uri === mathmlNamespace
    ? ["ws", "comment", "pi"]
    : characterData[content._tag];

/**
 * Collect the element and wildcard particles within a particle, in document order.
 *
 * @param particle - The particle.
 * @returns Its leaves.
 */
const leavesOf = (particle: Particle): readonly Exclude<Particle, { readonly _tag: "group" }>[] =>
  particle._tag === "group" ? particle.particles.flatMap(leavesOf) : [particle];

/**
 * Restate a model whose leading kinds come before every other element and before text that is not
 * whitespace, as spec reading 40 says of SSML's `meta`, `metadata` and `lexicon` in `speak`: the
 * leading kinds and the wildcards in any order, then any run of text, the other kinds and the
 * wildcards, each step a text or another kind followed by any wildcards.
 *
 * As a regular expression over the model's kinds, `(K | W)* ((text | E) W*)*`, with `K` the leading
 * kinds, `E` the others and `W` the wildcards. Text is one position, the first of each step, so
 * Unique Particle Attribution keeps it unique; a wildcard is two, one before the steps and one
 * within them, which the state tells apart. Whitespace keeps no position and carries the state, so
 * it stands anywhere. The restated model holds the XSD's element order wherever the XSD's model is
 * `(K | W)* (E (E | W)*)?`, which `content.test.ts` checks against the XSD.
 *
 * @param particle - The model's particle.
 * @param leading - The kinds that come first.
 * @param source - The reading, which the restated groups and the text position cite.
 * @returns The restated model; the model as it is where it names a leading kind not, which leaves
 *   the reading unread ({@link finds}).
 */
const leadingFirst = (particle: Particle, leading: readonly string[], source: string): Particle => {
  const leaves = leavesOf(particle).filter(({ occurs }) => !Option.contains(occurs.max, 0));
  const named = leaves.flatMap((leaf) => (leaf._tag === "element" ? leaf.kinds : []));
  if (!leading.every((kind) => named.includes(kind))) {
    return particle;
  }

  const others = [...new Set(named)].filter((kind) => !leading.includes(kind));
  const wildcards = [
    ...new Map(
      leaves.flatMap((leaf) =>
        leaf._tag === "any" ? [[tupleKey(leaf.namespace, leaf.processing), leaf] as const] : [],
      ),
    ).values(),
  ];
  const once: Occurs = { max: Option.some(1), min: 1 };
  const many: Occurs = { max: Option.none(), min: 0 };
  // The restated groups and the text position are the reading's; a kind's particle keeps the
  // XSD's own source, its first particle's in the model.
  const cited: Source = { _tag: "spec", cite: source };
  const element = (kind: string, held: Source): Particle => ({
    _tag: "element",
    kinds: [kind],
    occurs: once,
    source: held,
  });
  // Every kind restated here is one the model names: a leading kind, or one of the others.
  const restated = (kind: string): Particle =>
    element(
      kind,
      Option.getOrThrowWith(
        Arr.findFirst(leaves, (leaf) => leaf._tag === "element" && leaf.kinds.includes(kind)).pipe(
          Option.map((leaf) => leaf.source),
        ),
        () =>
          new Error(
            `The reading ${source} restates ${kind}, which no particle of the model names.`,
          ),
      ),
    );

  return {
    _tag: "group",
    compositor: "sequence",
    occurs: once,
    particles: [
      {
        _tag: "group",
        compositor: "choice",
        occurs: many,
        particles: [
          ...leading.map(restated),
          ...wildcards.map((wildcard) => ({ ...wildcard, occurs: once })),
        ],
        source: cited,
      },
      {
        _tag: "group",
        compositor: "choice",
        occurs: many,
        particles: [
          {
            _tag: "group",
            compositor: "sequence",
            occurs: once,
            particles: [
              {
                _tag: "group",
                compositor: "choice",
                occurs: once,
                particles: [element("text", cited), ...others.map(restated)],
                source: cited,
              },
              ...wildcards.map((wildcard) => ({ ...wildcard, occurs: many })),
            ],
            source: cited,
          },
        ],
        source: cited,
      },
    ],
    source: cited,
  };
};

/**
 * Apply a spec reading's edit to a particle tree.
 *
 * @param particle - The model's particle.
 * @param edit - The edit.
 * @returns The edited particle.
 */
const edited = (particle: Particle, edit: ModelEdit): Particle => {
  switch (edit._tag) {
    case "first": {
      return leadingFirst(particle, edit.kinds, edit.source);
    }
    case "restate": {
      // A restatement is the reading's whole model: it replaces the XSD's particle, narrowing or
      // widening its language, and the reading's own recognizer (`#pantry/test/gen/relaxng.ts`,
      // `relaxNgModels`) is what it is checked against.
      return edit.particle;
    }
    case "ends":
    case "cap": {
      // An ending narrows the automaton and a cap counts beside it, neither the particle
      // (`contentOf`).
      return particle;
    }
    case "beside": {
      const walk = (node: Particle): Particle => {
        switch (node._tag) {
          case "element": {
            if (node.kinds.includes(edit.with)) {
              return {
                ...node,
                kinds: [...node.kinds, edit.kind],
                source: { _tag: "spec", cite: edit.source },
              };
            }

            return node;
          }
          case "any": {
            return node;
          }
          case "group": {
            return { ...node, particles: node.particles.map(walk) };
          }
          default: {
            return node satisfies never;
          }
        }
      };

      return walk(particle);
    }
    default: {
      return edit satisfies never;
    }
  }
};

/**
 * The kinds a model's leaves name: each element leaf's kinds, and none of a wildcard's.
 *
 * @param leaves - The model's leaves.
 * @returns The kinds, each once.
 */
const kindsNamed = (leaves: readonly Exclude<Particle, { readonly _tag: "group" }>[]) =>
  new Set(leaves.flatMap((leaf) => (leaf._tag === "element" ? leaf.kinds : [])));

/**
 * Whether a spec reading's edit finds what it names in its parent's model, as the particle stands
 * when the edit is applied: every leading kind among the particles that may occur (`first`), its
 * model (`restate`), one of its kinds (`ends`, `cap`), or the kind it is admitted beside
 * (`beside`). The readings are fixed data, so this is the tests' reading of them
 * (`content.test.ts`, every edit of a composition), never a load's: an edit that finds nothing
 * leaves its model as it is.
 *
 * @param particle - The model's particle, the edits before this one applied.
 * @param edit - The edit.
 * @returns Whether it finds what it names.
 */
export const finds = (particle: Particle, edit: ModelEdit): boolean => {
  switch (edit._tag) {
    case "first": {
      const occurring = kindsNamed(
        leavesOf(particle).filter(({ occurs }) => !Option.contains(occurs.max, 0)),
      );

      return edit.kinds.every((kind) => occurring.has(kind));
    }
    case "restate": {
      return true;
    }
    case "ends": {
      const held = kindsNamed(leavesOf(particle));

      return edit.kinds.some((kind) => held.has(kind));
    }
    case "cap": {
      return kindsNamed(leavesOf(particle)).has(edit.kind);
    }
    case "beside": {
      return kindsNamed(leavesOf(particle)).has(edit.with);
    }
    default: {
      return edit satisfies never;
    }
  }
};

/**
 * Apply every spec reading's edit of a kind's model, in order: the particle {@link contentOf}
 * builds the model's automaton from, which the tests read too (`content.test.ts`, Unique Particle
 * Attribution over every model of a composition, and {@link finds} over every edit).
 *
 * @param particle - The model's particle.
 * @param edits - Every reading's edits.
 * @param kind - The model's kind.
 * @returns The edited particle.
 */
export const editedBy = (
  particle: Particle,
  edits: readonly ModelEdit[],
  kind: string,
): Particle => {
  let tree = particle;
  for (const edit of edits) {
    if (edit.parent === kind) {
      tree = edited(tree, edit);
    }
  }

  return tree;
};

/**
 * The endings a kind's readings state.
 *
 * @param edits - Every reading's edits.
 * @param kind - The model's kind.
 * @returns Its endings, in the readings' order.
 */
const endingsOf = (
  edits: readonly ModelEdit[],
  kind: string,
): readonly Extract<ModelEdit, { readonly _tag: "ends" }>[] =>
  edits.flatMap((edit) => (edit._tag === "ends" && edit.parent === kind ? [edit] : []));

/**
 * Narrow an automaton by the readings' endings of its kind: a family may end only at a position
 * whose kinds an ending lists, every ending's, and never empty. The follow sets are untouched, so
 * the family's other children keep the model's order. A family's last state is its last child's
 * position, so an ending is exact only where each position names kinds all of which or none of
 * which it lists: the readings are fixed, so the tests check that every ending is
 * ({@link mixedEndingsOf}), and no load does.
 *
 * An ending states a language no deterministic expression does: MathML's `lambda` is
 * `bvar*, DomainQ, ContExp` with `interval` in both `DomainQ` and `ContExp` (spec reading 2), whose
 * minimal automaton breaks Brüggemann-Klein and Wood's orbit property, so no particle Unique
 * Particle Attribution keeps deterministic states it. Its restatement `bvar*, (interval |
 * qualifier)*, other?`, ended by the content expressions, is deterministic, and its `Last` ends a
 * family where the RelaxNG's does.
 *
 * @param automaton - The model's automaton.
 * @param edits - Every reading's edits.
 * @param kind - The model's kind.
 * @returns The automaton, its `Last` narrowed by the kind's endings.
 * @see {@link https://doi.org/10.1006/inco.1997.2695 | Brüggemann-Klein and Wood, One-Unambiguous Regular Languages (Information and Computation 142(2), 1998)}
 */
const endedBy = (automaton: Automaton, edits: readonly ModelEdit[], kind: string): Automaton => {
  const endings = endingsOf(edits, kind);
  if (endings.length === 0) {
    return automaton;
  }

  // A state is the position its family's last child stands at; state 0, the empty family, has no
  // last child, so no position names its kinds and an ending drops it.
  const listed = (state: number): boolean =>
    automaton.positions.some(
      ({ number: at, symbol }) =>
        at === state &&
        symbol._tag === "kinds" &&
        endings.every(({ kinds }) => symbol.kinds.every((held) => kinds.includes(held))),
    );

  return { ...automaton, ends: new Set([...automaton.ends].filter(listed)) };
};

/**
 * Find the endings of a kind's readings that list some of one position's kinds and not the others,
 * so that no position state tells a family that ends there with a listed kind from one that ends
 * with another. The readings are fixed data, so this is the tests' reading of them
 * (`content.test.ts`, every ending of a composition), never a load's.
 *
 * @param automaton - The kind's model's automaton.
 * @param edits - Every reading's edits.
 * @param kind - The model's kind.
 * @returns Each such ending, with the kinds of the first position it lists in part.
 */
export const mixedEndingsOf = (
  automaton: Automaton,
  edits: readonly ModelEdit[],
  kind: string,
): readonly { readonly ending: ModelEdit; readonly kinds: readonly string[] }[] =>
  endingsOf(edits, kind).flatMap((ending) => {
    const listed = new Set<string>(ending.kinds);

    return Arr.findFirst(
      automaton.positions,
      ({ symbol }) =>
        symbol._tag === "kinds" &&
        symbol.kinds.some((held) => listed.has(held)) &&
        !symbol.kinds.every((held) => listed.has(held)),
    ).pipe(
      Option.flatMap(({ symbol }) =>
        symbol._tag === "kinds" ? Option.some({ ending, kinds: symbol.kinds }) : Option.none(),
      ),
      Option.toArray,
    );
  });

/**
 * One position a reading caps: at most one child of a family stands there.
 */
interface Cap {
  readonly position: number;
  readonly source: string;
}

/**
 * Find the positions the readings' caps of a kind's model count: for each cap, the one position
 * that names its kind and no other kind, so the count of the family's children there is the count
 * of the kind. A kind a model names at several positions, or beside another kind at one, has no
 * such position, and its cap is refused as {@link UncountedCap}. A kind no particle of the model
 * names leaves the cap unread, which the tests find ({@link finds}), and one whose
 * particles never occur has no child to count.
 *
 * @param automaton - The model's automaton.
 * @param edits - Every reading's edits.
 * @param kind - The model's kind.
 * @returns The capped positions, or the first cap no one position counts.
 */
const cappedBy = (
  automaton: Automaton,
  edits: readonly ModelEdit[],
  kind: string,
): Result.Result<readonly Cap[], UncountedCap> => {
  const caps: Cap[] = [];
  for (const edit of edits) {
    if (edit._tag === "cap" && edit.parent === kind) {
      const [only, ...rest] = automaton.positions.flatMap(({ number, symbol }) =>
        symbol._tag === "kinds" && symbol.kinds.includes(edit.kind)
          ? [{ kinds: symbol.kinds, number }]
          : [],
      );
      if (only !== undefined) {
        if (rest.length > 0 || only.kinds.length > 1) {
          return Result.fail(
            new UncountedCap({ kind: edit.kind, parent: kind, source: edit.source }),
          );
        }

        caps.push({ position: only.number, source: edit.source });
      }
    }
  }

  return Result.succeed(caps);
};

/**
 * The automaton of a content type that holds no particle: no position, and the empty family, which
 * ends at the start.
 */
const noAutomaton: Automaton = {
  ends: new Set([0]),
  next: [new Set()],
  positions: [],
};

/**
 * The automaton of a family no content model holds: its start, which nothing follows and nothing
 * ends at, so the family admits no word, not even the empty one.
 */
const emptyLanguage: Automaton = {
  ends: new Set(),
  next: [new Set()],
  positions: [],
};

/**
 * One installed automaton: its parent, model and the kinds it admits by each position.
 */
interface Installed {
  readonly automaton: Automaton;
  /**
   * The positions the readings cap at one child.
   */
  readonly caps: readonly Cap[];
  readonly data: readonly string[];
  readonly parent: string;
  /**
   * Each state's follow set, ascending ({@link followsOf}), which the signature and the model's
   * `FollowSetOf` read.
   */
  readonly follows: Follows;
  /**
   * The automaton's signature ({@link signatureOf}), one per model.
   */
  readonly signature: string;
  /**
   * The model's source.
   */
  readonly source: Source;
  /**
   * The foreign kinds only `strict` wildcards of the model admit.
   */
  readonly strictly: ReadonlySet<string>;
  /**
   * The positions each kind the model admits is named at, in position order, each once.
   */
  readonly symbols: ReadonlyMap<string, readonly Position[]>;
}

/**
 * A child the content models admit under a parent, at its position, with the source of the
 * position: its particle's where one position names it, its model's at 0.
 */
type AdmittedRow = AdmittedChild & {
  readonly position: number;
  readonly source: Source;
};

/**
 * A parent's family.
 */
interface Family {
  readonly parent: string;
}

/**
 * Each state's follow set, the start's first: the positions a child may take after one at the
 * state, ascending.
 */
type Follows = readonly (readonly number[])[];

/**
 * Read an automaton's follow sets, each ascending, so two automata of one language built apart
 * hold equal lists exactly when they hold equal sets.
 *
 * @param automaton - The automaton.
 * @returns Each state's follow set, the start's first.
 */
const followsOf = (automaton: Structure): Follows =>
  automaton.next.map((next) => [...next].toSorted((left, right) => left - right));

/**
 * Write what makes two automata one content model: the state count, start included, each state's
 * follow set and the positions `Last` holds, each in order, so two automata of one language built
 * apart write the same text exactly when they state the same rows.
 *
 * @param follows - The automaton's follow sets ({@link followsOf}).
 * @param ends - The states `Last` holds.
 * @returns Its signature.
 */
const signatureOf = (follows: Follows, ends: ReadonlySet<number>): string =>
  [
    String(follows.length),
    follows.map((held) => held.join(" ")).join(","),
    [...ends].toSorted((left, right) => left - right).join(" "),
  ].join("|");

/**
 * The follow sets of {@link emptyLanguage}, the model of every family no content model holds: its
 * start's, which nothing follows.
 */
const emptyFollows: Follows = followsOf(emptyLanguage);

/**
 * The signature of {@link emptyLanguage}.
 */
const emptySignature = signatureOf(emptyFollows, emptyLanguage.ends);

/**
 * A family's model as {@link modelsOf} reads it: the signature that makes two families one model,
 * and the value the model states.
 */
interface Signed<V> {
  readonly family: Family;
  readonly signature: string;
  readonly value: V;
}

/**
 * Models read off the families they hold: each model with its handle and its first family's
 * value, in first-family order, and each family with its model's handle, in the families' order.
 */
interface Models<V> {
  readonly families: readonly (Family & { readonly model: string })[];
  readonly handles: readonly string[];
  readonly models: readonly { readonly handle: string; readonly value: V }[];
}

/**
 * Read families as models: two families are one model exactly when their signatures are equal
 * (rule 0: identical facts are one fact), and the model states its first family's rows, which
 * every family of it states alike. A model is named by its first family's parent kind, which no
 * earlier model took, since each kind is one family, so every handle is a kind's.
 *
 * @param signed - Each family a model holds, with its signature and the value its model states, in
 *   parent code order.
 * @returns The models and each family's.
 */
const modelsOf = <V>(signed: readonly Signed<V>[]): Models<V> => {
  const models: { readonly handle: string; readonly value: V }[] = [];
  const bySignature = new Map<string, string>();
  const families = signed.map(({ family, signature, value }) => {
    const handle = bySignature.getOrInsertComputed(signature, () => {
      models.push({ handle: family.parent, value });

      return family.parent;
    });

    return { ...family, model: handle };
  });

  return { families, handles: models.map(({ handle }) => handle), models };
};

/**
 * Read a count a generator states for every handle of a roster.
 *
 * @param counts - The counts, by handle.
 * @param handle - The handle.
 * @param relation - The relation the counts are, as the defect's message names it.
 * @returns The handle's count.
 * @throws {Error} When the counts hold none for the handle, which every handle of the roster has.
 */
const countOf = (counts: ReadonlyMap<string, number>, handle: string, relation: string): number =>
  Option.getOrThrowWith(
    Option.fromNullishOr(counts.get(handle)),
    () =>
      new Error(
        `${relation} states no count for ${handle}, and it states one for every model of its roster. Count ${handle}'s positions.`,
      ),
  );

/**
 * A particle's greatest number of occurrences, `Infinity` for `unbounded`: `{max occurs}` is
 * "either a non-negative integer or unbounded" (XML Schema 1.0 Part 1, §3.9.1), and the IR holds
 * `unbounded` as none.
 *
 * @param occurs - The particle's bounds.
 * @returns Its maximum.
 */
export const maxOccursOf = (occurs: Occurs): number =>
  Option.match(occurs.max, { onNone: () => Number.POSITIVE_INFINITY, onSome: (most) => most });

/**
 * Install the automata of content models, and state their admitted triples with each child's
 * position as each family's admission map (plan R12, U4).
 *
 * An element particle admits its kinds. A wildcard admits, by its processing, the globally
 * declared kinds in its namespaces that no element particle of the model names and that the
 * schema sets of the model's documents declare (spec reading 81), but the roots reading 6 keeps
 * foreign and, of a namespace a facet states the roots of, every kind but those roots (`lax`,
 * `strict`), and the foreign kinds of the namespace classes its constraint admits (`lax`, `skip`).
 * The content type admits its character data at position 0. A reading's ending narrows the
 * automaton's `Last` ({@link endedBy}).
 *
 * @param input - The models, the vocabularies' readings, and what a wildcard reads.
 * @param input.globalKinds - The kinds a `lax` or `strict` wildcard of a parent reads as their
 *   global declarations: those a schema set of the parent's documents declares.
 * @param input.namespaceOf - The namespace of each kind's elements.
 * @param input.stated - The triples the vocabularies state beside their models, each admitted at
 *   position 0 in its family's admission map.
 * @returns The content grammar and `Admission` read through its admission maps, or the first model
 *   or reading that has none: a cap no position counts, or a second model of one family.
 */
export const contentOf = (input: {
  readonly facets: readonly ContentFacet[];
  readonly foreignRoots: ReadonlySet<string>;
  readonly globalKinds: (parent: string) => readonly string[];
  readonly kinds: Roster<string>;
  readonly models: readonly ContentModel[];
  readonly namespaceOf: (kind: string) => NamespaceOfKind;
  readonly stated: readonly (AdmittedChild & { readonly source: Source })[];
}): Result.Result<
  {
    readonly admission: Admission;
    readonly content: ContentGrammar;
  },
  ContentError
> =>
  Result.gen(function* installContent() {
    const edits = input.facets.flatMap((facet) => facet.edits);
    const rootsOf: ReadonlyMap<string, ReadonlySet<string>> = new Map(
      input.facets
        .flatMap((facet) => facet.roots)
        .map(({ kinds, namespace }) => [namespace, new Set<string>(kinds)] as const),
    );
    // A namespace a facet states the roots of admits those kinds alone through a wildcard, and any
    // other namespace every kind it declares globally.
    const rootAdmits = (kind: string): boolean => {
      const namespace = input.namespaceOf(kind);

      return Option.match(
        namespace._tag === "in" ? Option.fromNullishOr(rootsOf.get(namespace.uri)) : Option.none(),
        { onNone: () => true, onSome: (roots) => roots.has(kind) },
      );
    };
    const installed: Installed[] = [];
    // Each family's one installed model, by kind, as the models are installed.
    const byFamily = new Map<string, Installed>();
    // Each distinct outline's follow sets, endings and sorted follows, built once: the models of
    // many kinds share an outline, and differ only in what their positions name.
    const outlined = new Map<string, Structure & { readonly follows: Follows }>();
    for (const model of [...input.models, ...input.facets.flatMap((facet) => facet.models)]) {
      const { content } = model;
      const own = input.namespaceOf(model.kind);
      const data = dataOf(content, own);
      const particle = Option.map(contentParticle(content), (tree) =>
        editedBy(tree, edits, model.kind),
      );
      const built = Option.match(particle, {
        // A model with no element content follows as the empty language does: its start, which
        // nothing follows.
        onNone: () => ({ automaton: noAutomaton, follows: emptyFollows }),
        onSome: (tree) => {
          const outline = outlineOf(tree);
          const {
            ends,
            follows: sorted,
            next,
          } = outlined.getOrInsertComputed(outline.key, () => {
            const structure = structureOf(tree);

            return { ...structure, follows: followsOf(structure) };
          });

          return { automaton: { ends, next, positions: positionsOf(outline) }, follows: sorted };
        },
      });
      const automaton = endedBy(built.automaton, edits, model.kind);
      const caps = yield* cappedBy(automaton, edits, model.kind);
      const { follows } = built;
      const signature = signatureOf(follows, automaton.ends);
      const named = new Set(
        automaton.positions.flatMap(({ symbol }) => (symbol._tag === "kinds" ? symbol.kinds : [])),
      );
      // The global kinds a wildcard of the model may admit, read once for all its wildcards, and
      // only where one reads global declarations, each by what the kind alone decides: no element
      // particle of the model names it, reading 6 keeps no foreign root of it, and a namespace a
      // facet states the roots of admits only those.
      const globals = automaton.positions.some(
        ({ symbol }) => symbol._tag === "wildcard" && symbol.processing !== "skip",
      )
        ? input
            .globalKinds(model.kind)
            .filter((kind) => !named.has(kind) && !input.foreignRoots.has(kind) && rootAdmits(kind))
        : [];
      const symbols = new Map<string, Position[]>();
      // The processing of each wildcard position that admits a foreign kind.
      const processings = new Map<string, string[]>();
      // The positions are walked in order and all of one position's kinds are admitted before the
      // next's, so a kind's positions are held ascending, and a kind one position names twice is
      // held there once.
      const admit = (kind: string, position: Position) => {
        const held = symbols.getOrInsertComputed(kind, () => []);
        if (held.at(-1) !== position) {
          held.push(position);
        }
      };
      // `automatonOf` gives no position to a particle that never occurs, or sits in a group that
      // never does, so every position is one some family reaches.
      for (const position of automaton.positions) {
        const { symbol } = position;
        if (symbol._tag === "kinds") {
          for (const kind of symbol.kinds) {
            admit(kind, position);
          }
        } else {
          if (symbol.processing !== "skip") {
            for (const kind of globals) {
              if (admitsNamespace(symbol.namespace, own, input.namespaceOf(kind))) {
                admit(kind, position);
              }
            }
          }

          // An element no declaration names is its namespace class's foreign kind, and the
          // wildcard admits the classes its constraint does (§3.10.1). Under `strict` such an
          // element stands only with an `xsi:type` its document's schema set can resolve (§3.3.4,
          // clause 1.2; spec reading 81), which `StrictlyHeld` marks for the reader.
          for (const namespaceClass of namespaceClassesUnder[symbol.namespace]) {
            admit(foreignKinds[namespaceClass], position);
            processings
              .getOrInsertComputed(foreignKinds[namespaceClass], () => [])
              .push(symbol.processing);
          }
        }
      }

      const entry: Installed = {
        automaton,
        caps,
        data,
        follows,
        parent: model.kind,
        signature,
        source: model.source,
        strictly: new Set(
          [...processings].flatMap(([kind, held]) =>
            held.every((processing) => processing === "strict") ? [kind] : [],
          ),
        ),
        symbols,
      };
      const earlier = byFamily.get(model.kind);
      if (earlier !== undefined) {
        return yield* Result.fail(
          new DuplicateModel({
            first: sourceText(earlier.source),
            kind: model.kind,
            second: sourceText(entry.source),
          }),
        );
      }

      byFamily.set(model.kind, entry);
      installed.push(entry);
    }

    const widest = Math.max(0, ...installed.map(({ automaton }) => automaton.positions.length));
    // Position 0, the start, is every model's, so the roster always holds it.
    const positions = roster("Position", Arr.makeBy(widest + 1, String));
    const parentField = idField("parent", input.kinds);
    const installedAt = (family: Family): Option.Option<Installed> =>
      Option.fromNullishOr(byFamily.get(family.parent));
    // A family no content model holds reads the empty language: its start alone.
    const automatonAt = (family: Family): Automaton =>
      Option.match(installedAt(family), {
        onNone: () => emptyLanguage,
        onSome: ({ automaton }) => automaton,
      });
    // Each child a family's model admits, at its position: the one position its kind names, with
    // that position's source, or 0 with the model's, for a kind several positions name and for
    // character data the model gives no position, which carries its predecessor's state.
    const admittedOf = (entry: Installed): readonly AdmittedRow[] => [
      ...[...entry.symbols].map(([child, held]) => {
        const [only, ...rest] = held;

        return only !== undefined && rest.length === 0
          ? { child, parent: entry.parent, position: only.number, source: only.source }
          : { child, parent: entry.parent, position: 0, source: entry.source };
      }),
      ...entry.data
        .filter((child) => !entry.symbols.has(child))
        .map((child) => ({ child, parent: entry.parent, position: 0, source: entry.source })),
    ];
    // Each family's kinds that several positions of its model name, with those positions,
    // ascending as `symbols` holds them.
    const sharedOf = (entry: Installed) =>
      [...entry.symbols].flatMap(([kind, held]) =>
        held.length > 1 ? [{ kind, numbers: held.map(({ number }) => number) }] : [],
      );
    // Every parent's family, which both models' readings walk.
    const families = input.kinds.handles.map((parent): Family => ({ parent }));
    // The models, read once per family in parent code order: a family's automaton is its
    // model's whenever an earlier family's has the same positions, follow sets and `Last`.
    const contentModels = modelsOf(
      families.map((family) =>
        Option.match(installedAt(family), {
          onNone: () => ({
            family,
            signature: emptySignature,
            value: { automaton: emptyLanguage, follows: emptyFollows },
          }),
          onSome: (entry) => ({
            family,
            signature: entry.signature,
            value: { automaton: entry.automaton, follows: entry.follows },
          }),
        }),
      ),
    );
    const sharedModels = modelsOf(
      families.flatMap((family) =>
        Option.toArray(installedAt(family)).flatMap((entry) => {
          const shared = sharedOf(entry);

          return shared.length === 0
            ? []
            : [
                {
                  family,
                  signature: tupleKey(
                    entry.parent,
                    String(entry.automaton.next.length),
                    ...shared
                      .flatMap(({ kind, numbers }) =>
                        numbers.map((number) => tupleKey(kind, String(number))),
                      )
                      .toSorted(),
                  ),
                  value: shared,
                },
              ];
        }),
      ),
    );
    const model = idField("model", roster("ContentModel", contentModels.handles));
    const sharedModel = idField("model", roster("SharedModel", sharedModels.handles));
    const modelSizes = new Map(
      contentModels.models.map(({ handle, value }) => [handle, value.follows.length]),
    );
    // Each model's states' follow sets, each distinct set once (rule 0), numbered in the order of
    // the first (model, state) that holds it, and the positions each holds.
    const setOf = new Map<string, string>();
    const members: { readonly set: string; readonly to: string }[] = [];
    const statedSets = contentModels.models.flatMap(({ handle, value }) =>
      value.follows.map((held, from) => ({
        from: String(from),
        model: handle,
        set: setOf.getOrInsertComputed(held.join(" "), () => {
          const fresh = String(setOf.size);
          members.push(...held.map((to) => ({ set: fresh, to: String(to) })));

          return fresh;
        }),
      })),
    );
    const followSet = idField("set", roster("FollowSet", [...setOf.values()]));
    // Each shared model's kinds' positions, each distinct set of positions once (rule 0), numbered
    // in the order of the first (model, kind) that holds it, with the positions each holds,
    // ascending as `sharedOf` reads them.
    const symbolSetByText = new Map<string, string>();
    const symbolMembers: { readonly position: string; readonly set: string }[] = [];
    const symbolRows = sharedModels.models.flatMap(({ handle, value }) =>
      value.map(({ kind, numbers }) => ({
        kind,
        model: handle,
        set: symbolSetByText.getOrInsertComputed(numbers.join(" "), () => {
          const fresh = String(symbolSetByText.size);
          symbolMembers.push(
            ...numbers.map((number) => ({ position: String(number), set: fresh })),
          );

          return fresh;
        }),
      })),
    );
    const symbolSet = idField("set", roster("SymbolSet", [...symbolSetByText.values()]));
    // The positions each shared model names each of its shared kinds at: none for a kind the model
    // does not share.
    const sharedNumbers = new Map(
      sharedModels.models.flatMap(({ handle, value }) =>
        value.map(({ kind, numbers }) => [tupleKey(handle, kind), numbers] as const),
      ),
    );
    // A family's positions are 0, its start, then its model's own: the dependent sum Σ (P + 1).
    const position = dependentField(
      "position",
      positions,
      (prefix) => automatonAt({ parent: prefixHandle(prefix, "parent") }).next.length,
    );
    const modelPosition = <const Name extends string>(name: Name) =>
      dependentField(name, positions, (prefix) =>
        countOf(modelSizes, prefixHandle(prefix, "model"), "ModelPositions"),
      );
    // Each installed family with the children its model admits, read once: its admission map's,
    // and `StrictlyHeld`'s among them.
    const admittedBy = installed.map((entry) => ({ entry, rows: admittedOf(entry) }));
    // Each family's admitted children at their positions, the models' and then the triples the
    // vocabularies state beside them, at 0; then each family's children, by kind, as its
    // admission map, each distinct map numbered once in the order of the first family, in parent
    // code order, that holds it (rule 0).
    const admittedAt = new Map<string, { readonly child: string; readonly position: string }[]>();
    for (const { entry, rows } of admittedBy) {
      admittedAt
        .getOrInsertComputed(entry.parent, () => [])
        .push(...rows.map(({ child, position: at }) => ({ child, position: String(at) })));
    }

    for (const { child, parent } of input.stated) {
      admittedAt.getOrInsertComputed(parent, () => []).push({ child, position: "0" });
    }

    const mapOf = new Map<string, string>();
    const mapMembers: {
      readonly child: string;
      readonly map: string;
      readonly position: string;
    }[] = [];
    const familyModels = contentModels.families.map((family) => {
      const children = rowsAt(admittedAt, family.parent).toSorted((left, right) =>
        left.child < right.child ? -1 : 1,
      );
      const admission = mapOf.getOrInsertComputed(
        tupleKey(...children.flatMap(({ child, position: at }) => [child, at])),
        () => {
          const fresh = String(mapOf.size);
          mapMembers.push(
            ...children.map(({ child, position: at }) => ({ child, map: fresh, position: at })),
          );

          return fresh;
        },
      );

      return { ...family, admission };
    });
    const admissionMap = idField("admission", roster("AdmissionMap", [...mapOf.values()]));
    // A bound of 2…n the automaton relaxes is the particle's, its greatest count a row of its own
    // where the particle states one; a cap is its reading's, at most one child where the model's
    // enclosing group repeats the particle.
    const countedRows = installed.flatMap(({ automaton, parent }) =>
      automaton.positions.flatMap(({ number, occurs, source }) =>
        occurs.min >= 2 || Option.exists(occurs.max, (most) => most >= 2)
          ? [
              {
                max: occurs.max,
                row: { min: occurs.min, parent, position: String(number) },
                source,
              },
            ]
          : [],
      ),
    );
    const countedMaxRows = countedRows.flatMap(({ max, row: { parent, position: at } }) =>
      Option.toArray(max).map((most) => ({ max: most, parent, position: at })),
    );
    const cappedRows = installed.flatMap(({ caps, parent }) =>
      caps.map(({ position: at, source }) => ({
        row: { parent, position: String(at) },
        source: { _tag: "spec", cite: source } as const,
      })),
    );
    const sourceOf = (key: {
      readonly parent: string;
      readonly position: string;
    }): Option.Option<Source> =>
      Option.flatMap(installedAt(key), (entry) => {
        const number = Number(key.position);

        return number === 0
          ? Option.some(entry.source)
          : Arr.findFirst(entry.automaton.positions, (held) => held.number === number).pipe(
              Option.map(({ source }) => source),
            );
      });
    const symbolSetOf = indexed(
      closed({
        key: [sharedModel, idField("kind", input.kinds)],
        name: "SymbolSetOf",
        payload: [symbolSet],
        rows: symbolRows,
      }),
    );
    const sharedModelOf = indexed(
      closed({
        key: [parentField],
        name: "SharedModelOf",
        payload: [sharedModel],
        rows: sharedModels.families,
      }),
    );

    const admissionIn = indexed(
      closed({
        key: [idField("map", admissionMap.roster), idField("child", input.kinds)],
        name: "AdmissionIn",
        payload: [idField("position", positions)],
        rows: mapMembers,
      }),
    );
    const contentModelOf = indexed(
      closed({
        key: [parentField],
        name: "ContentModelOf",
        payload: [model, admissionMap],
        rows: familyModels,
      }),
    );
    // The sources the vocabularies state their triples with, by (parent, child): production
    // states none.
    const statedSources = new Map(
      input.stated.map(({ child, parent, source }) => [tupleKey(parent, child), source]),
    );
    const lookup = (key: AdmissionKey) =>
      Option.flatMap(contentModelOf.lookup(key), ({ admission }) =>
        admissionIn.lookup({ child: key.child, map: admission }),
      );

    return {
      admission: {
        lookup,
        sourceOf: (key) =>
          Option.flatMap(lookup(key), ({ position: at }) =>
            Option.orElse(
              Option.fromUndefinedOr(statedSources.get(tupleKey(key.parent, key.child))),
              () => sourceOf({ parent: key.parent, position: at }),
            ),
          ),
      },
      content: {
        admissionIn,
        admissionMaps: admissionMap.roster,
        capped: sourced({
          key: [parentField, position],
          name: "Capped",
          payload: [],
          rows: cappedRows,
        }),
        contentModelOf,
        counted: sourced({
          key: [parentField, position],
          name: "Counted",
          payload: [
            valueField(
              "min",
              countedRows.map(({ row }) => row.min),
            ),
          ],
          rows: countedRows.map(({ row, source }) => ({ row, source })),
        }),
        countedMax: indexed(
          closed({
            key: [parentField, position],
            name: "CountedMax",
            payload: [
              valueField(
                "max",
                countedMaxRows.map(({ max }) => max),
              ),
            ],
            rows: countedMaxRows,
          }),
        ),
        followMember: indexed(
          closed({
            key: [followSet, idField("to", positions)],
            name: "FollowMember",
            payload: [],
            rows: members,
          }),
        ),
        followSetOf: indexed(
          closed({
            key: [model, modelPosition("from")],
            name: "FollowSetOf",
            payload: [followSet],
            rows: statedSets,
          }),
        ),
        followSets: followSet.roster,
        last: closed({
          key: [model, modelPosition("position")],
          name: "Last",
          payload: [],
          rows: contentModels.models.flatMap(({ handle, value }) =>
            [...value.automaton.ends].map((state) => ({ model: handle, position: String(state) })),
          ),
        }),
        modelPositions: closed({
          key: [model],
          name: "ModelPositions",
          payload: [valueField("positions", modelSizes.values())],
          rows: [...modelSizes].map(([handle, size]) => ({ model: handle, positions: size })),
        }),
        models: model.roster,
        positions,
        sharedModelOf,
        sharedModels: sharedModel.roster,
        sharedPositions: ({ kind, parent }) =>
          Option.match(sharedModelOf.lookup({ parent }), {
            onNone: () => [],
            onSome: ({ model: shared }) => sharedNumbers.get(tupleKey(shared, kind)) ?? [],
          }),
        sourceOf,
        strictlyHeld: indexedSourced(
          sourced({
            key: [parentField, idField("child", input.kinds)],
            name: "StrictlyHeld",
            payload: [],
            rows: admittedBy.flatMap(({ entry, rows }) =>
              rows.flatMap(({ child, parent, source }) =>
                entry.strictly.has(child) ? [{ row: { child, parent }, source }] : [],
              ),
            ),
          }),
        ),
        symbolMember: closed({
          key: [symbolSet, idField("position", positions)],
          name: "SymbolMember",
          payload: [],
          rows: symbolMembers,
        }),
        symbolSetOf,
        symbolSets: symbolSet.roster,
      },
    };
  });

/**
 * Read a family's content model: `ContentModelOf`'s cell.
 *
 * @param content - The content grammar.
 * @param key - The family.
 * @param key.parent - The parent's kind.
 * @returns The model's handle, or none for a family outside the rosters.
 */
export const contentModelOf = (
  content: ContentGrammar,
  key: { readonly parent: string },
): Option.Option<string> => Option.map(content.contentModelOf.lookup(key), ({ model }) => model);

/**
 * Spell a content grammar's follow sets out as the transitions they state, (model, from, to): each
 * state's set's positions, the empty set's none. The tests read the automata by them; no load does.
 *
 * @param content - `FollowSetOf` and `FollowMember`, the content grammar's or `install.ts`'s.
 * @param content.followSetOf - `FollowSetOf`.
 * @param content.followMember - `FollowMember`.
 * @returns The transitions, by model and state as `FollowSetOf` orders them, each set's positions
 *   as `FollowMember` does.
 */
export const followPairsOf = (content: {
  readonly followMember: {
    readonly rows: readonly { readonly set: string; readonly to: string }[];
  };
  readonly followSetOf: {
    readonly rows: readonly {
      readonly from: string;
      readonly model: string;
      readonly set: string;
    }[];
  };
}): readonly { readonly from: string; readonly model: string; readonly to: string }[] => {
  const members = Map.groupBy(content.followMember.rows, ({ set }) => set);

  return content.followSetOf.rows.flatMap(({ from, model, set }) =>
    rowsAt(members, set).map(({ to }) => ({ from, model, to })),
  );
};

/**
 * Read a model's follow set at a state: `FollowSetOf`'s cell.
 *
 * @param content - The content grammar.
 * @param model - The model.
 * @param from - The state, 0 for the start.
 * @returns The set's handle, or none for a state the model has not.
 */
const followSetAt = (content: ContentGrammar, model: string, from: string): Option.Option<string> =>
  Option.map(content.followSetOf.lookup({ from, model }), ({ set }) => set);

/**
 * Whether a model's follow set at a state holds a position, as N5 reads it:
 * `FollowMember(FollowSetOf(model, from), to)`.
 *
 * @param content - The content grammar.
 * @param model - The model.
 * @param from - The state, 0 for the start.
 * @param to - The position.
 * @returns Whether a child at `to` may follow one at `from`.
 */
const followHolds = (content: ContentGrammar, model: string, from: string, to: string): boolean =>
  Option.exists(followSetAt(content, model, from), (set) =>
    Option.isSome(content.followMember.lookup({ set, to })),
  );

/**
 * Whether a child at one position may follow one at another in a family: whether the follow set
 * of the predecessor's position, under the family's model, holds the child's.
 *
 * @param content - The content grammar.
 * @param key - The family and the two positions.
 * @param key.parent - The parent's kind.
 * @param key.from - The predecessor's position, 0 for the start.
 * @param key.to - The child's position.
 * @returns Whether `FollowMember` holds the pair, under `FollowSetOf`.
 */
export const contentFollows = (
  content: ContentGrammar,
  key: {
    readonly from: string;
    readonly parent: string;
    readonly to: string;
  },
): boolean =>
  Option.exists(contentModelOf(content, key), (model) =>
    followHolds(content, model, key.from, key.to),
  );

/**
 * Where a child stands in its family's content model, read once from its `Admission` position and
 * the family's symbol sets. `Admission` installs one position per (parent, child), 0 for a
 * kind that names no position or several; the host tells the two apart here, once.
 *
 * - `at`: the one position the child's kind names.
 * - `carries`: a kind no position names, character data, which keeps its predecessor's state.
 * - `shared`: the positions several of which name the child's kind, where the state decides.
 */
export type Placement =
  | { readonly _tag: "at"; readonly position: number }
  | { readonly _tag: "carries" }
  | { readonly _tag: "shared"; readonly positions: readonly [number, ...number[]] };

/**
 * The family and child a step reads.
 */
interface StepKey {
  readonly child: string;
  readonly parent: string;
}

/**
 * Read a child's placement from its `Admission` position.
 *
 * @param content - The content grammar, whose symbol sets hold a shared kind's positions.
 * @param key - The family and the child.
 * @param position - The child's `Admission` position.
 * @returns The placement.
 */
const placementAt = (content: ContentGrammar, key: StepKey, position: number): Placement => {
  if (position !== 0) {
    return { _tag: "at", position };
  }

  const shared = content.sharedPositions({ kind: key.child, parent: key.parent });

  return Arr.isReadonlyArrayNonEmpty(shared)
    ? { _tag: "shared", positions: shared }
    : { _tag: "carries" };
};

/**
 * Read where a child stands in its family's content model.
 *
 * @param grammar - The composed grammar's `Admission` and content grammar.
 * @param grammar.admission - `Admission`.
 * @param grammar.content - The content grammar.
 * @param key - The family and the child.
 * @returns The child's placement, or none where the parent does not admit its kind.
 */
export const placementOf = (
  grammar: { readonly admission: Admission; readonly content: ContentGrammar },
  key: StepKey,
): Option.Option<Placement> =>
  Option.map(grammar.admission.lookup(key), ({ position }) =>
    placementAt(grammar.content, key, Number(position)),
  );

/**
 * Step a family's automaton by one placed child, as `Node`'s position derives (the host's
 * evaluation of the law the database proves): an `at` child moves to its position where its
 * predecessor's follow set holds it, a `shared` one to the one of its positions the set holds, and
 * a `carries` one keeps its predecessor's state.
 *
 * @param content - The content grammar.
 * @param key - The family and the child.
 * @param placement - The child's placement.
 * @param was - The predecessor's state, 0 for the first child.
 * @returns The child's state, or none when no position follows.
 */
export const placedStep = (
  content: ContentGrammar,
  key: StepKey,
  placement: Placement,
  was: number,
): Option.Option<number> => {
  const model = contentModelOf(content, key);
  const follows = (to: number) =>
    Option.exists(model, (held) => followHolds(content, held, String(was), String(to)));

  switch (placement._tag) {
    case "at": {
      return Option.liftPredicate(placement.position, follows);
    }
    case "carries": {
      return Option.some(was);
    }
    case "shared": {
      const next = placement.positions.filter(follows);

      return next.length === 1 ? Arr.head(next) : Option.none();
    }
    default: {
      return placement satisfies never;
    }
  }
};

/**
 * Step a family's automaton by one child: its {@link placementOf}, then {@link placedStep}.
 *
 * @param grammar - The composed grammar's `Admission` and content grammar.
 * @param grammar.admission - `Admission`.
 * @param grammar.content - The content grammar.
 * @param key - The family and the child.
 * @param was - The predecessor's state, 0 for the first child.
 * @returns The child's state, or none where the parent does not admit the kind or no position
 *   follows.
 */
export const stepOf = (
  grammar: { readonly admission: Admission; readonly content: ContentGrammar },
  key: StepKey,
  was: number,
): Option.Option<number> =>
  Option.flatMap(placementOf(grammar, key), (placement) =>
    placedStep(grammar.content, key, placement, was),
  );
