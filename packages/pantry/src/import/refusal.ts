/**
 * How a refusal by the database names its laws (plan W5, Q5.17; the W5 amendment's C22).
 *
 * A package is refused before any row exists, by the reader, the ZIP container or the codec, which
 * `#pantry/import/rules.ts` names with no schema, or by grizzle's `invariant-rejected` outcome,
 * which names every law merged into the PostgreSQL object that refused the write
 * ({@link refusalOf}). Each law keeps the rule of the guard or schema rule it replaces, so a
 * verdict reads as it did.
 *
 * - **Laws by name.** Every law the schema states has a name, the law oracle's (`src/test/oracle.ts`
 *   `LawName`) where the oracle states the law, with its rule and its spec source
 *   ({@link lawTable}). An outcome's law is named one way ({@link lawNameOf}): by the catalog entry
 *   it carries, which its declaration declares where the schema states it
 *   (`#pantry/qti/law-entries.ts`), so naming a refusal builds no schema and keeps no table of its
 *   own.
 * - **A refusal is what the database said.** A family's axis foreign key discharges the family and
 *   every containment and fold merged into it, and its violation names them all. The refusal
 *   carries how grizzle decided them, every law it named and the set of their rules
 *   ({@link rulesOf}), listed by one fixed order (`ruleOrder` of `#pantry/import/rules.ts`) for
 *   display. It singles out no law where grizzle's outcome does not, and reads no row of the
 *   import's.
 * - **Explanations are the outcome's.** {@link explain} writes each law as grizzle reports it, with
 *   its rule, and the witness grizzle gives, its key or none. There is no catalog of messages.
 */

import type { BrokenLaws, Law, OwnLaw, Witness } from "@bjornpagen/grizzle";
import { Array as Arr, Formatter, Option, pipe, Predicate } from "effect";
import type { Types } from "effect";

import type { RefusedLaw, RefusalDecision } from "#pantry/package/refusal-origin.ts";

import { ruleOrder, ImportRefused } from "#pantry/import/rules.ts";
import type { Rule } from "#pantry/import/rules.ts";
import { lawTable } from "#pantry/vocab/laws.ts";

/**
 * The name of a law of {@link lawTable}.
 */
export type LawName = keyof typeof lawTable;

/**
 * Every law name, in the table's order.
 */
export const lawNames: readonly LawName[] = Object.keys(lawTable).filter((name): name is LawName =>
  Object.hasOwn(lawTable, name),
);

/**
 * One law of a refusal, as the importer names it: the law as the schema states it, the login's own
 * law or a law of a level above the login's, and its id. The id is a LawId for a law of the theory
 * or a text pattern, and a GeneratedLawId for a generated field's law. grizzle's `RefusedLaw` is
 * one, its id a branded text; a test plants one with a text of its own.
 */
export interface RefusalLaw {
  readonly id: string;
  readonly law: Law;
}

/**
 * The laws of a refusal in their positions, each grizzle's `RefusedLaw` read as a
 * {@link RefusalLaw}.
 */
type RefusalLawsOf<Laws> = { readonly [At in keyof Laws]: RefusalLaw };

/**
 * A refusal of laws, as the importer reads one: each shape of grizzle's `BrokenLaws`, its kind, its
 * `own` where it is `above`, and its laws in their positions, read as {@link RefusalLaw}s, so every
 * shape grizzle states is one here and no other is, each with as many laws: `every` and `first`
 * one or more in `laws`, `some` two or more; `above` one or more in `above`, every law of the
 * levels above the login's that the object PostgreSQL named serves, in code point order of their
 * identities, and, where its `own` is `every` and only there, one or more in `laws`, each own law
 * the first stated row breaks. `every`, `first` and `some` hold the login's own laws.
 */
export type RefusalOf = BrokenLaws extends infer Decided
  ? Decided extends unknown
    ? {
        readonly [Field in keyof Decided]: Field extends "above" | "laws"
          ? RefusalLawsOf<Decided[Field]>
          : Decided[Field];
      }
    : never
  : never;

/**
 * Every law a refusal names, in its positions: the login's own laws of an `every`, `first` or
 * `some` refusal; an `above` refusal's laws of the levels above the login's, then, where its `own`
 * is `every`, its own laws. Each shape of {@link RefusalOf} is read by its own case and each
 * switch's default is typed `never`, so a kind or an `own` grizzle adds fails to compile here.
 *
 * @param refused - The refusal.
 * @returns Its laws, one at least.
 */
export const lawsOfRefusal = (refused: RefusalOf): readonly [RefusalLaw, ...RefusalLaw[]] => {
  switch (refused.kind) {
    case "every":
    case "first":
    case "some": {
      return refused.laws;
    }
    case "above": {
      switch (refused.own) {
        case "every": {
          return [...refused.above, ...refused.laws];
        }
        case "none":
        case "unjudged": {
          return refused.above;
        }
        default: {
          return refused satisfies never;
        }
      }
    }
    default: {
      return refused satisfies never;
    }
  }
};

/**
 * Name a refusal's shape, as its origin records it (`RefusedKind` of
 * `#pantry/package/refusal-origin.ts`): its kind, and for `above` what grizzle found of the
 * login's own laws.
 *
 * @param refused - The refusal.
 * @returns Its shape's name.
 */
const decisionOf = (refused: RefusalOf): RefusalDecision<RefusalOf> =>
  refused.kind === "above" ? `above ${refused.own}` : refused.kind;

/**
 * Read a name of {@link lawTable}.
 *
 * @param name - A name as a law's entry writes it.
 * @returns The law name, or none for a name the table lacks.
 */
const lawNamed = (name: string): Option.Option<LawName> =>
  Option.fromUndefinedOr(lawNames.find((known) => known === name));

/**
 * Name a law an outcome refused by the catalog entry it carries. A law is named as the level that
 * states it states it: the login's own law as it is, and the law of a level above the login's, the
 * first law of an `above` refusal, such as a LOM check (`QtiLom` of `#pantry/qti/lom.ts`) refusing
 * a write of a login over `Qti`, as that level's own law (grizzle's `AboveLaw.law`). Its entry is
 * the one its declaration declares (`#pantry/qti/law-entries.ts`), the law table's row of its name:
 * every statement of the schema declares one (`law-names.test.ts`), and grizzle names a law refused
 * at COMMIT, over a stored relation's table among them, by its law. A law no row of the table
 * names, one a level an application stacks states with an entry grizzle derives among them, is
 * named by none. Nothing reads the schema.
 *
 * @param law - A law of an `invariant-rejected` outcome, or one a schema states.
 * @returns Its name, or none for a law no row of the table names.
 */
export const lawNameOf = (law: Law): Option.Option<LawName> => {
  const { entry }: OwnLaw = law.kind === "above" ? law.law : law;

  return lawNamed(entry.name);
};

/**
 * The rule the law table gives a law: its name's row's ({@link lawNameOf}).
 *
 * @param law - A law as an `invariant-rejected` outcome names it, or as a schema states it.
 * @returns Its rule, or none for a law no row of the table states.
 */
export const ruleOfLaw = (law: Law): Option.Option<Rule> =>
  Option.map(lawNameOf(law), (name) => lawTable[name].rule);

/**
 * The rules a refusal that names `laws` is refused under: the rule of each law the table states,
 * each once, listed in {@link ruleOrder}.
 *
 * The laws are a set, and so are the rules: the laws' order and any repeat change nothing. No law
 * is singled out: grizzle's `some` and `first` say only that one or more of the laws broke, so the
 * refusal is under all of their rules, and a reader of the verdict reads them all. A law no row of
 * the table states carries no rule, and still prints its text in the refusal; the census in
 * `refusal.oracle.test.ts` keeps every law the schema states in the table.
 *
 * @param laws - The laws of an `invariant-rejected` outcome, or of a schema.
 * @returns The rules, none when no law of the set is in the table.
 */
export const rulesOf = (laws: readonly Law[]): readonly Rule[] =>
  Arr.sort(Arr.dedupe(laws.flatMap((law) => Option.toArray(ruleOfLaw(law)))), ruleOrder);

/**
 * The explanation of a refusal: what broke, and where each of its laws is stated.
 */
export interface Explanation {
  /**
   * Each law, its rule and the law as grizzle reports it, and grizzle's witness: the key of the
   * stated row that broke it, or that the database names none.
   */
  readonly detail: string;
  /**
   * Each law's spec source, each once; none where the law table holds none of the laws.
   */
  readonly sources: readonly string[];
}

/**
 * Write a witness as an explanation names it.
 *
 * Grizzle names a violating row by its key fields alone, never another column: a key's, and a row
 * check's, a closed relation's check's, a contract's or a pattern's where the host judges a row the
 * ChangeSet states to break it, and a deferred foreign key's, the key of the row the write leaves
 * unmatched at COMMIT. A check no stated row breaks as the host judges it, and a constraint
 * PostgreSQL checks by itself, it names by none: its witness is `unreported`. A deferred foreign
 * key whose unmatched row a concurrent commit changed before grizzle read it names its law and no
 * row: its witness is `unreproduced`, since the row it would name is no longer the state the write
 * committed against (README, "Errors and outcomes").
 *
 * @param witness - The refusal's witness.
 * @returns Where the row is, or why the database names none.
 */
const witnessText = (witness: Witness): string => {
  switch (witness.kind) {
    case "key": {
      const values = Object.entries(witness.values)
        .map(
          ([field, value]) =>
            `${field}=${Predicate.isString(value) ? value : Formatter.format(value)}`,
        )
        .join(" ");

      return `at ${witness.relation} ${values}`;
    }
    case "unreported": {
      return "the database names no row: PostgreSQL reports a constraint it checks itself by the constraint alone";
    }
    case "unreproduced": {
      return "the database names no row: this law refused the write, and the row it left unmatched could not be named, since another write committed beside it changed that row before it was read";
    }
    default: {
      return witness satisfies never;
    }
  }
};

/**
 * Explain a refusal from its laws and its witness, as a pure function: each law named with its rule
 * and shown as grizzle reports it (Effect's `Formatter.format`), the witness's row, and each law's
 * spec source in `sources`.
 *
 * @param laws - The `laws` of an `invariant-rejected` outcome.
 * @param witness - Its `witness`.
 * @returns The explanation.
 */
export const explain = (
  laws: Arr.NonEmptyReadonlyArray<RefusalLaw>,
  witness: Witness,
): Explanation => {
  const named = laws.map(({ law }) => ({ law, name: lawNameOf(law) }));
  const lawText = named
    .map(({ law, name }) =>
      Option.match(name, {
        onNone: () => `${Formatter.format(law)}, which no rule of the law table owns`,
        onSome: (held) => `${held} (rule ${lawTable[held].rule}): ${Formatter.format(law)}`,
      }),
    )
    .join("; ");
  const sources = Arr.dedupe(
    named.flatMap(({ name }) =>
      Option.toArray(name.pipe(Option.map((law) => lawTable[law].source))),
    ),
  );

  return { detail: `${lawText}, ${witnessText(witness)}`, sources };
};

/**
 * One law of a refusal as the refusal carries it: its display text, and the name and rule the law
 * table gives it.
 *
 * @param law - A law of an `invariant-rejected` outcome.
 * @returns Its facts.
 */
const lawFactOf = (refused: RefusalLaw): typeof RefusedLaw.Type => {
  const fact: Types.Mutable<typeof RefusedLaw.Type> = { text: Formatter.format(refused.law) };
  const name = lawNameOf(refused.law);
  if (Option.isSome(name)) {
    fact.name = name.value;
    fact.rule = lawTable[name.value].rule;
  }

  return fact;
};

/**
 * Build the refusal of an `invariant-rejected` outcome from the outcome alone: how grizzle decided
 * its laws, each law's facts ({@link lawFactOf}) in the outcome's order, the set of their rules
 * ({@link rulesOf}), and its explanation ({@link explain}). It reads no row and judges no law, so
 * a `some` or `first` refusal stays as undecided as grizzle left it.
 *
 * A host-side key conflict, two facts of one key that grizzle refuses before any SQL, names its
 * key law and the submitted key as its witness, and is refused the same way, with no SQLSTATE.
 *
 * @param refused - The outcome's `refused`.
 * @param witness - Its `witness`.
 * @returns The refusal.
 */
export const refusalOf = (refused: RefusalOf, witness: Witness): ImportRefused => {
  const laws = lawsOfRefusal(refused);
  const { detail, sources } = explain(laws, witness);

  return new ImportRefused({
    detail,
    origin: {
      _tag: "Database",
      kind: decisionOf(refused),
      laws: pipe(laws, Arr.map(lawFactOf)),
      sources,
      witness: witness.kind,
    },
    rules: rulesOf(laws.map(({ law }) => law)),
  });
};
