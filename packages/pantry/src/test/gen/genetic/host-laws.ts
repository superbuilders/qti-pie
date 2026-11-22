/**
 * The import's rows judged on the host: the laws `Qti` states that a package's rows can be held to
 * before any of them is written, over the rows the import's write stores (grizzle's insertion
 * preview, `#pantry/test/host-judge.ts` `previewOf`), each named by its law as a refusal names it
 * (`#pantry/import/refusal.ts` `lawNameOf`), each statement's laws as grizzle's
 * `lawsByStatement` gives them.
 *
 * - Each key, containment and check the host judge reads (`#pantry/test/host-judge.ts` `judgedLaws`),
 *   judged by it: grizzle's evaluator decides each selection and each check, a check refusing a row
 *   its predicate leaves false or NULL, tables and derived relations alike;
 * - A pattern: every value of a field whose type states it inside its domain, as grizzle's evaluator
 *   admits a row (`rowEvaluator`'s `admit`), a row its domain refuses breaking it;
 * - A generated field's law: every row's generated value no NULL, as the evaluator computes it;
 * - A bounded text's bound: no field of a key text type holds more UTF-8 bytes than its type's bound
 *   (`#pantry/test/key-copies.ts` `keyTextBounds`), each declared in `#pantry/qti/limits.ts`.
 *
 * A write the preview refuses before any SQL breaks the law it names (a key's, a generated field's
 * or a counted family's), and leaves every other law unknown. A statement over a derived relation,
 * a rule over a query, is never judged here, since only the database evaluates the query: it is
 * unknown, so its law is never held on the host and never found broken, and the genetic search
 * counts it unjudged, never a disagreement.
 *
 * This is a fast pre-filter, never the judge (the owner's Q4 ruling): a disagreement it reports
 * becomes a known entry (`#pantry/test/gen/genetic/known.ts`) only once it reproduces on
 * PostgreSQL.
 */
import { Formatter, Option, Predicate, Result, Schema } from "effect";
import { sameLaw } from "@bjornpagen/grizzle";
import type { Law } from "@bjornpagen/grizzle";
import { lawNameOf, lawOfCheck } from "#pantry/import/refusal.ts";
import type { LawName } from "#pantry/import/refusal.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { utf8Length } from "#pantry/qti/limits.ts";
import { Qti } from "#pantry/qti/schema.ts";
import {
  judge,
  judgedLaws as hostJudgedLaws,
  previewOf,
  readingsOf,
} from "#pantry/test/host-judge.ts";
import type { RowReading } from "#pantry/test/host-judge.ts";
import { identityOf, keyTextBounds } from "#pantry/test/key-copies.ts";
import { statedLaws, statementLawsOf } from "#pantry/test/law-namer.ts";

/**
 * Each statement of `Qti` with its laws, as grizzle's `lawsByStatement` names them
 * (`#pantry/test/law-namer.ts` `statementLawsOf`), read once as this module loads.
 */
const statementLaws = statementLawsOf(Qti);

/**
 * The laws the host judge judges over the rows (`#pantry/test/host-judge.ts` `judgedLaws`).
 */
const judged = hostJudgedLaws(Qti);

/**
 * The law of every statement of `Qti` the host judge judges, as grizzle's `lawsOf` names it, so a
 * test can hold it to the laws `Qti` states (`src/test/host-judge.relations.test.ts`).
 */
export const evaluatedLaws: readonly Law[] = judged.map(({ law }) => law);

/**
 * Each check's law name, by the check's law.
 */
const checkLaws: ReadonlyMap<Law, LawName> = new Map(
  evaluatedLaws.flatMap((law) =>
    law.kind === "check"
      ? Option.toArray(Option.map(lawOfCheck(law.name), (name) => [law, name] as const))
      : [],
  ),
);

/**
 * Every law a check of `Qti` states that the host does not judge, so its database verdict the host
 * never knows: each check over a derived relation, whose rows only the database evaluates. It is
 * judged per statement, never by the check's name: two checks of one law share a name, as
 * "Reference type" states one over `PlacedVariableRef`, which the host judges, and one over the
 * `PlacedVariableRefDeclaration` query, which it does not, and the law is unread for the one it
 * cannot judge.
 */
const unreadChecks: ReadonlySet<LawName> = new Set(
  Qti.statements.flatMap((statement) =>
    statement.kind === "check" && statement.relation.kind === "derived"
      ? Option.toArray(lawOfCheck(statement.name))
      : [],
  ),
);

/**
 * The laws no statement states, as grizzle's `lawsOf` lists them, each with the name its entry
 * gives it (`statedLaws`): the primary keys, the contracts, the patterns and the generated fields.
 */
const writtenLaws = statedLaws().filter(
  ([law]) =>
    law.kind === "contract" ||
    law.kind === "generated" ||
    law.kind === "pattern" ||
    law.kind === "primaryKey",
);

/**
 * Each law the schema states that is no check, with its name: every law of a statement of `Qti`,
 * as {@link statementLaws} names it, and every law of {@link writtenLaws}.
 */
const namedLaws: readonly (readonly [Law, LawName])[] = [
  ...statementLaws.flatMap(({ laws }) =>
    laws.flatMap((law) =>
      law.kind === "check"
        ? []
        : Option.toArray(Option.map(lawNameOf(law), (name) => [law, name] as const)),
    ),
  ),
  ...writtenLaws,
];

/**
 * Write a law as a broken law's witness shows it: a check by its name and its relation, a
 * containment or a fold as `key-copies.ts`'s `identityOf` writes it, its selections left out, any
 * other law as grizzle reports it. The witness only shows the law: the genetic search keys a class
 * by the law itself (`judge.ts` `signatureOf`).
 *
 * @param law - The law.
 * @returns Its text.
 */
const shownOf = (law: Law): string => {
  if (law.kind === "check") {
    return `check ${law.name} on ${law.relation}`;
  }

  return law.kind === "contained" || law.kind === "fold" ? identityOf(law) : Formatter.format(law);
};

/**
 * Each law's name, by the law: every law of {@link namedLaws}.
 */
const namesOf: ReadonlyMap<Law, LawName> = new Map(namedLaws);

/**
 * Each law the schema states that is no check, by name, with the laws of its statements.
 */
const lawsNamed: ReadonlyMap<LawName, readonly Law[]> = new Map(
  [...new Set(namedLaws.map(([, name]) => name))].map((name) => [
    name,
    namedLaws.flatMap(([law, held]) => (held === name ? [law] : [])),
  ]),
);

/**
 * The schema of a relation of `Qti` as the host reads it: its fields' SQL types and a text field's
 * patterns, a conjunction in declared order (grizzle's `RegexText`, `text/field.ts` at `3cc8fbd`).
 */
const StoredRelation = Schema.Struct({
  fields: Schema.Record(
    Schema.String,
    Schema.Struct({
      patterns: Schema.optionalKey(
        Schema.NonEmptyArray(
          Schema.Struct({ flags: Schema.Literals(["su", "u"]), source: Schema.String }),
        ),
      ),
      sql: Schema.optionalKey(Schema.String),
    }),
  ),
  kind: Schema.String,
  name: Schema.String,
});

/**
 * Each relation of `Qti`, by name.
 */
const relations: ReadonlyMap<string, typeof StoredRelation.Type> = new Map(
  Object.values(Qti.relations).flatMap((member) =>
    Option.toArray(
      Option.map(
        Schema.decodeUnknownOption(StoredRelation)(member),
        (read) => [read.name, read] as const,
      ),
    ),
  ),
);

/**
 * A pattern law: its field's relation and name, and its source and flags.
 */
type PatternLaw = Extract<Law, { readonly kind: "pattern" }>;

/**
 * The pattern laws of {@link writtenLaws}.
 */
const patternLaws: readonly PatternLaw[] = writtenLaws.flatMap(([law]) =>
  law.kind === "pattern" ? [law] : [],
);

/**
 * Each pattern law's field, as `[relation, field]`: the field of a stored relation whose own
 * pattern law, grizzle's one per field, `sameLaw` holds to be the law. A law of a field the host
 * reads no pattern of here (a generated or accumulated one, whose descriptor carries its type's) is
 * left out, so its verdict is unknown.
 */
const patternFields: ReadonlyMap<PatternLaw, readonly (readonly [string, string])[]> = (() => {
  const byLaw = new Map<PatternLaw, (readonly [string, string])[]>();
  for (const [name, { fields, kind }] of relations) {
    for (const [field, { patterns }] of Object.entries(fields)) {
      const law =
        kind === "relation" && patterns !== undefined
          ? patternLaws.find((stated) =>
              sameLaw(stated, {
                entry: stated.entry,
                field,
                kind: "pattern",
                patterns,
                relation: name,
              }),
            )
          : undefined;
      if (law !== undefined) {
        byLaw.set(law, [...(byLaw.get(law) ?? []), [name, field] as const]);
      }
    }
  }

  return byLaw;
})();

/**
 * A stored relation of the schema as grizzle keeps it, its fields' types as they are, so a type is
 * told by its identity.
 */
const TypedRelation = Schema.Struct({
  fields: Schema.Record(Schema.String, Schema.Unknown),
  kind: Schema.Literal("relation"),
  name: Schema.String,
});

/**
 * The bound of each stored field of a key text type (`keyTextBounds`), by `Relation.field`.
 */
const fieldBounds: ReadonlyMap<string, number> = new Map(
  Object.values(Qti.relations).flatMap((member) =>
    Option.match(Schema.decodeUnknownOption(TypedRelation)(member), {
      onNone: () => [],
      onSome: ({ fields, name }) =>
        Object.entries(fields).flatMap(([field, type]) =>
          Option.toArray(Option.fromUndefinedOr(keyTextBounds.get(type))).map(
            (bytes) => [`${name}.${field}`, bytes] as const,
          ),
        ),
    }),
  ),
);

/**
 * A field of a bounded text type the import writes, with its bound and its pattern law: the law
 * the database refuses a text past the bound by.
 */
interface BoundField {
  readonly bytes: number;
  readonly field: string;
  readonly law: PatternLaw;
}

/**
 * Each relation's fields of a bounded text type the import writes ({@link BoundField}), by the
 * relation, so a row is read at its relation's bounded fields alone. An accumulated or generated
 * field, which the database computes and the import never writes, has no pattern law here.
 */
const boundFields: ReadonlyMap<string, readonly BoundField[]> = new Map(
  [
    ...Map.groupBy(
      [...patternFields].flatMap(([law, fields]) =>
        fields.flatMap(([relation, field]) =>
          Option.toArray(Option.fromUndefinedOr(fieldBounds.get(`${relation}.${field}`))).map(
            (bytes) => ({ bound: { bytes, field, law }, relation }),
          ),
        ),
      ),
      ({ relation }) => relation,
    ),
  ].map(([relation, bounds]) => [relation, bounds.map(({ bound }) => bound)] as const),
);

/**
 * Each generated field's law, with its relation and field.
 */
const generatedLaws: readonly Extract<Law, { readonly kind: "generated" }>[] = writtenLaws.flatMap(
  ([law]) => (law.kind === "generated" ? [law] : []),
);

/**
 * The verdict of one law over a program's rows.
 */
type Verdict =
  | { readonly kind: "broken"; readonly witness: string }
  | { readonly kind: "held" }
  | { readonly kind: "unknown" };

/**
 * Judge a pattern law over the rows as grizzle's evaluator admits them: broken where a row's domain
 * refuses its field, held where every row of its fields' relations is admitted, unknown where a row
 * is refused at another field, which leaves this one unread.
 *
 * @param readings - Each relation's rows, as the evaluator reads them.
 * @param fields - The law's fields, as `[relation, field]`.
 * @returns Its verdict.
 */
const patternVerdictOf = (
  readings: ReadonlyMap<string, readonly RowReading[]>,
  fields: readonly (readonly [string, string])[],
): Verdict => {
  let unknown = false;
  for (const [relation, field] of fields) {
    for (const { refused, values } of readings.get(relation) ?? []) {
      if (Option.contains(refused, field)) {
        return {
          kind: "broken",
          witness: `${relation}.${field} = ${Formatter.format(values[field]).slice(0, 80)}`,
        };
      }

      unknown ||= Option.isSome(refused);
    }
  }

  return unknown ? { kind: "unknown" } : { kind: "held" };
};

/**
 * Judge a generated field's law over the rows: broken where grizzle's evaluator computes the field
 * NULL at a row, which its NOT NULL refuses, held where it computes a value at every row, unknown
 * where a row is refused by its domain or its value is unevaluated.
 *
 * @param readings - Each relation's rows, as the evaluator reads them.
 * @param law - The generated field's law.
 * @returns Its verdict.
 */
const generatedVerdictOf = (
  readings: ReadonlyMap<string, readonly RowReading[]>,
  law: Extract<Law, { readonly kind: "generated" }>,
): Verdict => {
  let unknown = false;
  for (const { refused, values } of readings.get(law.relation) ?? []) {
    const value = values[law.field];
    if (value === null) {
      return { kind: "broken", witness: `${law.relation}.${law.field} is NULL` };
    }

    unknown ||= Option.isSome(refused) || value === undefined;
  }

  return unknown ? { kind: "unknown" } : { kind: "held" };
};

/**
 * The first law of a name the rows break: the law, as an `invariant-rejected` outcome names it,
 * and the witness, the law as {@link shownOf} writes it and the row that breaks it.
 */
export interface Broken {
  readonly law: Law;
  readonly witness: string;
}

/**
 * Every law {@link hostVerdictOf} can find broken: each law of {@link evaluatedLaws}, each field's
 * pattern law and each generated field's law, that has a name. A law outside it the host never
 * finds broken.
 */
export const judgedLaws: readonly Law[] = [
  ...new Set([...evaluatedLaws, ...patternFields.keys(), ...generatedLaws]),
].filter((law) => namesOf.has(law) || checkLaws.has(law));

/**
 * What the host judges of a program's rows:
 *
 * - `broken`, each law name some statement of which the rows break, with the first law of it they
 *   break and its witness, and `brokenLaws`, every statement they break as its law;
 * - `held`, each law every statement and check of which was judged and held, so its database verdict
 *   is known;
 * - `overLong`, each field of a bounded text type, as `Relation.field`, that holds a text past its
 *   bound, with its pattern law;
 * - `written`, each relation the program writes as rows, none of them perhaps.
 */
export interface HostVerdict {
  readonly broken: ReadonlyMap<LawName, Broken>;
  /**
   * Each statement the rows break, as an `invariant-rejected` outcome would name its law, a key
   * text past its bound as its field type's pattern law, which the refusal names it by.
   */
  readonly brokenLaws: readonly Law[];
  readonly held: ReadonlySet<LawName>;
  readonly overLong: ReadonlyMap<string, PatternLaw>;
  readonly written: ReadonlySet<string>;
}

/**
 * Read each law's verdict over rows the preview gives: each law the host judge judges, each pattern
 * law and each generated field's law.
 *
 * @param rows - The rows.
 * @returns Each law's verdict, and the rows as grizzle's evaluator reads them.
 */
const verdictsOver = (rows: Parameters<typeof judge>[0]) => {
  const judgment = judge(rows, judged);
  const readings = readingsOf(rows);
  const verdicts = new Map<Law, Verdict>([
    ...judgment.judged.map((law) => [law, { kind: "held" }] as const),
    ...judgment.skipped.map(({ law }) => [law, { kind: "unknown" }] as const),
    ...judgment.broken.map(
      ({ law, rows: breaking }) =>
        [law, { kind: "broken", witness: Formatter.format(breaking[0]).slice(0, 200) }] as const,
    ),
    ...[...patternFields].map(
      ([law, fields]) => [law, patternVerdictOf(readings, fields)] as const,
    ),
    ...generatedLaws.map((law) => [law, generatedVerdictOf(readings, law)] as const),
  ]);

  return { readings, verdicts };
};

/**
 * The verdicts of a write the preview refuses before any SQL: the law it names broken, a key's, a
 * generated field's or a counted family's, and every other law unknown. An insert that does not
 * compile is the schema's defect, never a law's verdict, so it fails the case with its
 * CompileError.
 *
 * @param refusal - The preview's refusal.
 * @returns The refused law's verdict, none for an input the write refuses as input.
 * @throws {CompileError} The CompileError of an insert that does not compile.
 */
const refusedVerdicts = (
  refusal: Extract<ReturnType<typeof previewOf>, { readonly _tag: "Failure" }>["failure"],
): ReadonlyMap<Law, Verdict> => {
  switch (refusal._tag) {
    case "InputRefused": {
      return new Map();
    }
    case "GeneratedNull":
    case "KeyConflict":
    case "OwnerAbsent": {
      const law = statedLaws().find(([stated]) => sameLaw(stated, refusal.law))?.[0];

      return new Map(
        Option.toArray(Option.fromUndefinedOr(law)).map(
          (held) => [held, { kind: "broken", witness: refusal._tag }] as const,
        ),
      );
    }
    case "Uncompiled": {
      throw refusal.error;
    }
    default: {
      return refusal satisfies never;
    }
  }
};

/**
 * Each field of a bounded text type that holds a text past its bound, with its pattern law.
 *
 * @param readings - Each relation's rows.
 * @returns The fields, as `Relation.field`.
 */
const overLongOf = (
  readings: ReadonlyMap<string, readonly RowReading[]>,
): ReadonlyMap<string, PatternLaw> => {
  const overLong = new Map<string, PatternLaw>();
  for (const [relation, held] of readings) {
    const bounds = boundFields.get(relation) ?? [];
    for (const { values } of held) {
      for (const bound of bounds) {
        const value = values[bound.field];
        if (Predicate.isString(value) && utf8Length(value) > bound.bytes) {
          overLong.set(`${relation}.${bound.field}`, bound.law);
        }
      }
    }
  }

  return overLong;
};

/**
 * Judge a program's rows on the host.
 *
 * @param inputs - The program's inputs.
 * @returns The verdict.
 */
export const hostVerdictOf = (inputs: PackageInputs): HostVerdict => {
  const previewed = previewOf(inputs);
  const { readings, verdicts } = Result.isSuccess(previewed)
    ? verdictsOver(previewed.success)
    : {
        readings: new Map<string, readonly RowReading[]>(),
        verdicts: refusedVerdicts(previewed.failure),
      };
  const broken = new Map<LawName, Broken>();
  for (const [law, verdict] of verdicts) {
    const name = namesOf.get(law) ?? checkLaws.get(law);
    if (verdict.kind === "broken" && name !== undefined && !broken.has(name)) {
      broken.set(name, { law, witness: `${shownOf(law)}: ${verdict.witness}` });
    }
  }

  const checksNamed = new Map<LawName, Law[]>();
  for (const [law, name] of checkLaws) {
    checksNamed.set(name, [...(checksNamed.get(name) ?? []), law]);
  }

  const held = new Set(
    [...new Set([...lawsNamed.keys(), ...checksNamed.keys()])].filter(
      (name) =>
        !unreadChecks.has(name) &&
        !broken.has(name) &&
        [...(lawsNamed.get(name) ?? []), ...(checksNamed.get(name) ?? [])].every(
          (law) => verdicts.get(law)?.kind === "held",
        ),
    ),
  );
  const overLong = overLongOf(readings);
  const brokenLaws = [
    ...new Set([
      ...[...verdicts].flatMap(([law, verdict]) => (verdict.kind === "broken" ? [law] : [])),
      ...overLong.values(),
    ]),
  ];

  return { broken, brokenLaws, held, overLong, written: new Set(Object.keys(inputs)) };
};
