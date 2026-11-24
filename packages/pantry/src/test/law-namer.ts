/**
 * The laws `Qti` states, as grizzle's `lawsOf` lists them, and what the tests read of them: each
 * law's name, the one `#pantry/import/refusal.ts` `lawNameOf` reads from the catalog entry the law
 * carries, which its declaration declares (`#pantry/qti/law-entries.ts`); and each law's id, which
 * a refusal of it carries. Each compiles `Qti`'s law model, which takes seconds, so production
 * never runs it: a refusal is named by its laws' entries alone.
 */
import { sameLaw } from "@bjornpagen/grizzle";
import { lawsByStatement, lawsOf } from "@bjornpagen/grizzle/compile";
import type { AnySchema, Law, StatedLaw, Statement } from "@bjornpagen/grizzle";
import { Array as Arr, Function as Fn, Match, Option } from "effect";
import { attributeLawsByName } from "#pantry/qti/attributes.ts";
import { expressionLawsByName } from "#pantry/qti/expressions.ts";
import { chardataLawsByName } from "#pantry/qti/chardata.ts";
import { interactionLawsByName } from "#pantry/qti/interactions.ts";
import { metadataLawsByName } from "#pantry/qti/metadata.ts";
import { nodeLawsByName } from "#pantry/qti/node.ts";
import { catalogLawsByName } from "#pantry/qti/catalog.ts";
import { dataSsmlLawsByName } from "#pantry/qti/data-ssml.ts";
import { htmlLawsByName } from "#pantry/qti/html.ts";
import { identityLawsByName } from "#pantry/qti/identity.ts";
import { mathmlLawsByName } from "#pantry/qti/mathml.ts";
import { operatorLawsByName } from "#pantry/qti/operators.ts";
import { packageLawsByName } from "#pantry/qti/package.ts";
import { testLawsByName } from "#pantry/qti/tests.ts";
import { queryLawsByName } from "#pantry/qti/queries.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { lawNameOf, lawNames } from "#pantry/import/refusal.ts";
import { readsDerived } from "#pantry/test/predicates.ts";
import type { LawName, RefusalLaw } from "#pantry/import/refusal.ts";

/**
 * The relation each side of a law reads, in the order the law names its sides: the part of a law
 * {@link bucketOf} files it under beside its kind. A contract reads no relation, and a law of a
 * level above the schema reads its own law's relations: `Qti` is one level, which no level extends,
 * so no outcome names one (grizzle `999facc6`'s `above`), and none is in the table.
 *
 * @param law - A law as grizzle names it.
 * @returns Its sides' relations.
 */
export const relationsOf = (law: Law): readonly string[] =>
  Match.value(law).pipe(
    Match.discriminatorsExhaustive("kind")({
      above: ({ law: stated }) => relationsOf(stated),
      check: ({ relation }) => [relation],
      contained: ({ from, to }) => [from.relation, to.relation],
      contract: () => [],
      coverage: ({ from, to }) => [from.relation, to.relation],
      family: ({ member, slots }) => [member.relation, slots.owner],
      fold: ({ end, family, step }) => [family.owner, step.relation, end.relation],
      generated: ({ relation }) => [relation],
      key: ({ side }) => [side.relation],
      pattern: ({ relation }) => [relation],
      primaryKey: ({ relation }) => [relation],
      tree: ({ member, slots }) => [member.relation, slots.owner],
    }),
  );

/**
 * File a law by its kind and its sides' relations, so {@link lawIdOf} holds a law to the few stated
 * laws of that kind over those relations, never every law of Qti.
 *
 * This is no identity of the law: grizzle's `sameLaw` decides whether two laws are one, comparing
 * them whole, and two laws one bucket holds may still differ in their terms or selections. The
 * bucket only needs one law's two descriptions to fall in it together, which they do, since
 * `sameLaw` holds only of laws of one kind whose sides read the same relations.
 *
 * @param law - A law as grizzle names it.
 * @returns Its bucket.
 */
export const bucketOf = (law: Law): string => [law.kind, ...relationsOf(law)].join(" ");

/**
 * The law of a given kind.
 */
export type LawOf<Kind extends Law["kind"]> = Extract<Law, { readonly kind: Kind }>;

/**
 * A module's statements by the law each states, the law's name its key: `nodeLawsByName` of
 * `#pantry/qti/node.ts` and its peers, so a law is named where it is stated and this module reads
 * the name rather than restating the law.
 */
type LawsByName = { readonly [Name in LawName]?: readonly Statement[] };

/**
 * The modules that name their laws where they state them, each a {@link LawsByName}: the stored
 * level's, then each domain's rules over the queries (`#pantry/qti/queries.ts` `queryLawsByName`).
 */
export const namedLaws: readonly LawsByName[] = [
  nodeLawsByName,
  chardataLawsByName,
  attributeLawsByName,
  packageLawsByName,
  identityLawsByName,
  interactionLawsByName,
  expressionLawsByName,
  metadataLawsByName,
  htmlLawsByName,
  operatorLawsByName,
  catalogLawsByName,
  dataSsmlLawsByName,
  mathmlLawsByName,
  testLawsByName,
  ...queryLawsByName,
];

/**
 * Read a module's groups: each law name it groups statements under, with them. A name the module
 * states no law of has no entry.
 *
 * @param byName - The module's statements by law.
 * @returns Its groups.
 */
const groupsOf = (byName: LawsByName): readonly (readonly [LawName, readonly Statement[]])[] =>
  Object.entries(byName).flatMap(([held, statements]) =>
    lawNames.flatMap((name) => (name === held ? [[name, statements] as const] : [])),
  );

/**
 * The laws the database judges in part or whole: each name some statement of which, in some
 * module, reads a derived relation, a rule over a query (`#pantry/test/predicates.ts`
 * `readsDerived`), which the host judge leaves to the database. The host's verdict of such a law is
 * its other statements' alone, so a test that holds the host judge to the law oracle reads the
 * oracle's breach of one the host does not break as the database's to judge, never as a
 * disagreement.
 */
export const databaseJudgedLawNames: ReadonlySet<string> = new Set<string>(
  lawNames.filter((name) =>
    namedLaws.some((byName) =>
      groupsOf(byName).some(
        ([held, group]) => held === name && group.some((statement) => readsDerived(statement)),
      ),
    ),
  ),
);

/**
 * Each statement of a schema beside its laws, as grizzle's `lawsByStatement` names them: each law
 * one `lawsOf` lists, in `lawsOf`'s order, a mirrors' two containments and an alternatives law's
 * each its statement's.
 *
 * Grizzle compiles a schema's law model once, on the first read of its laws, and
 * `lawsByStatement`'s lookup reads each statement's laws by the canonical text its value holds, so
 * a call compiles nothing past that first read: the laws the tests' host judges read
 * (`#pantry/test/host-judge.ts`, `src/test/judged-laws.ts`, `src/test/gen/genetic/host-laws.ts`)
 * read one law model per process. Loading this module compiles none.
 */
export const statementLawsOf = (schema: typeof Qti) => {
  const lawsOfStatement = lawsByStatement(schema);

  return schema.statements.map((statement) => ({ laws: lawsOfStatement(statement), statement }));
};

/**
 * Every law a schema states, as grizzle's `lawsOf` lists them, each once and in its canonical
 * order: the primary keys, the statements' laws, the contracts, the pattern laws and the generated
 * fields' laws (grizzle `3ba13e38`, `program/laws.ts`). Read from grizzle's `lawsOf`, which lists
 * them beside their ids, the ones a refusal carries, from the schema's one law model.
 *
 * The importer reads none of it: `#pantry/import/refusal.ts` names a law by the entry it carries.
 * It is the list the census and the tests read the law table against.
 */
export const schemaLawsOf = Fn.memoize((schema: AnySchema): readonly Law[] =>
  lawsOf(schema).map(({ law }) => law),
);

/**
 * Read every law a schema states that is no check, each with its name, in `lawsOf`'s order: a law
 * whose entry names no row of the law table is left out, which the census
 * (`refusal.oracle.test.ts`) refuses. Memoized by the schema's identity.
 *
 * @param schema - The schema, `Qti`.
 * @returns Its laws, with their names.
 */
const statedIn = Fn.memoize((schema: typeof Qti): readonly (readonly [Law, LawName])[] =>
  schemaLawsOf(schema).flatMap((law) =>
    law.kind === "check"
      ? []
      : Option.toArray(Option.map(lawNameOf(law), (name) => [law, name] as const)),
  ),
);

/**
 * Every law `Qti` states that is no check, as grizzle's `lawsOf` lists it, with its name in the law
 * table (`lawNameOf` of `#pantry/import/refusal.ts`): the tests that read the laws by their names
 * read the very names production names a refusal by. The first call compiles Qti's law model, once,
 * which `lawsOf`'s list and `lawsByStatement`'s lookup read.
 *
 * @returns The laws, with their names.
 */
export const statedLaws = (): readonly (readonly [Law, LawName])[] => statedIn(Qti);

/**
 * The law `Qti` states that a law's shape spells, as grizzle's `lawsOf` names it, its catalog entry
 * included: the one grizzle's `sameLaw` holds to be the shape read with that law's own entry, since
 * a shape, a test's or a statement's spelling of the law, carries none.
 *
 * @param spelled - The law as its sides spell it.
 * @returns The stated law, or none where `Qti` states no such law.
 */
export const schemaLawOf = (spelled: StatedLaw): Option.Option<Law> =>
  Arr.findFirst(
    schemaLawsOf(Qti),
    (law) => law.kind !== "above" && sameLaw(law, { ...spelled, entry: law.entry }),
  );

/**
 * A law no statement of `Qti` states, planted by a test, with an entry of grizzle's derived kind,
 * as a law no author names carries: named as grizzle names one (grizzle's `runtime/law-entry.ts`
 * `derivedEntry`), a check and a contract by their own names and any other law here by its kind,
 * and sourced by what the test plants it for.
 *
 * @param spelled - The law as its sides spell it.
 * @param source - What the test plants it for.
 * @returns The law.
 */
export const plantedLaw = (spelled: StatedLaw, source: string): Law => ({
  ...spelled,
  entry: {
    kind: "derived",
    name: Match.value(spelled).pipe(
      Match.discriminators("kind")({
        check: ({ name }) => name,
        contract: ({ contract }) => contract,
      }),
      Match.orElse(({ kind }) => kind),
    ),
    source,
  },
});

// GRIZZLE-PENDING: Q3. lawKeyOf would key a law's id by its law; until then the id is found by
// `sameLaw` within the law's bucket.
/**
 * The laws of `lawsOf(Qti)`, each with its id, grouped by bucket ({@link bucketOf}) for the search
 * {@link lawIdOf} makes. Built at its first read, which compiles Qti's law model once with
 * {@link schemaLawsOf}'s list (grizzle's `lawsOf`).
 */
const identifiedByBucket = Fn.memoize((schema: typeof Qti) =>
  Arr.groupBy(lawsOf(schema), ({ law }) => bucketOf(law)),
);

/**
 * Find a law's id, the one a refusal of it carries: the id `lawsOf(Qti)` lists beside the law
 * grizzle's `sameLaw` holds it to be, so a law pantry's own model builds finds its id too.
 *
 * @param law - A law of `lawsOf(Qti)`, or one pantry's own model builds.
 * @returns Its id, or none for a law `Qti` does not state.
 */
const lawIdOf = (law: Law): Option.Option<string> =>
  Option.map(
    Arr.findFirst(identifiedByBucket(Qti)[bucketOf(law)] ?? [], (held) => sameLaw(held.law, law)),
    ({ id }) => id,
  );

/**
 * Build a law of `lawsOf(Qti)` as a refusal of it carries it, by a statement: the law, and its id
 * ({@link lawIdOf}), empty for a law `Qti` does not state.
 *
 * @param law - A law of `lawsOf(Qti)`.
 * @returns The refused law.
 */
export const refusedOf = (law: Law): RefusalLaw => ({
  by: { kind: "statement" },
  id: Option.getOrElse(lawIdOf(law), () => ""),
  law,
});
