/**
 * The import's rows as its write stores them, judged by every law of the schema the host can read
 * over them ({@link judgedLaws}): each containment and each half of a `mirrors` or an
 * `alternatives`, each key and each check.
 *
 * Only tests read it, to judge the import's rows without a database: production judges no law and
 * reads no row of its own, since a refusal is what the database's outcome says
 * (`#pantry/import/refusal.ts` `refusalOf`). The law oracle (`#pantry/test/oracle.ts`) never reads
 * it, since it judges the import's own rows by the schema's own statements
 * (`src/grammar/purity.test.ts`).
 *
 * It is a fast pre-filter, never the judge (the owner's Q4 ruling). Every row and every value is
 * grizzle's own:
 *
 * - **the rows** are the ones the import's write stores ({@link previewRowsOf}): grizzle's
 *   `insertPreview(Qti)` of the package's facts, the write's own binding of them, every count,
 *   index, interval, fold end and copy it draws, as host values. A refusal there is the write's
 *   before any SQL, so it fails the test that asked;
 * - **each selection and each check** is grizzle's `rowEvaluator(Qti)` over a row, the statement's
 *   own source its source: a check refuses a row its predicate leaves false or NULL, as both its
 *   discharges do, and an item the host does not evaluate leaves its law unjudged, named by why;
 * - **each tuple** a key or a containment reads is its values' texts, grizzle's `codecText` of each
 *   field, one text per value under PostgreSQL's equality.
 *
 * A statement over a derived relation, a rule over a query, it leaves unjudged: the preview holds
 * no row of a query, which only the database evaluates. A family's, a tree's and a fold's laws hold
 * of the preview's rows by their drawing: a counted member whose owner the write does not insert
 * is the preview's refusal.
 */
import { Bits, codecText, insertPreview } from "@bjornpagen/grizzle";
import type {
  EvaluatedRow,
  Law,
  LawSide,
  Pred,
  PreviewRows,
  RelationOf,
  RowSource,
  StatedLaw,
} from "@bjornpagen/grizzle";
import { assert } from "@effect/vitest";
import { Array as Arr, Formatter, Function as Fn, Option, pipe, Predicate, Result } from "effect";
import { AttributeSlot, Flag } from "#pantry/grammar/install.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { packageFactsOf } from "#pantry/import/write.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { statementLawsOf } from "#pantry/test/law-namer.ts";
import { evaluatorOf } from "#pantry/test/row-evaluation.ts";

/**
 * A statement of the composed `Qti`, as its type states it.
 */
type QtiStatement = (typeof Qti.statements)[number];

/**
 * A side's term as a statement holds it: a field's name, or `pred` of one.
 */
type AnyTerm = Pred<string> | string;

/**
 * A row as the judge reads it: each field's value, by name. Every row of the preview, and every
 * closed relation's fact, is one.
 */
// oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- A row of any relation of the schema, read by its fields' names: each value is its codec's host value, which codecText and grizzle's evaluator read.
export type HeldRow = Readonly<Record<string, unknown>>;

/**
 * Compile a schema's insertion preview, once per process: its first call compiles the schema's
 * write, which loading this module never does.
 */
const previewFor = Fn.memoize((schema: typeof Qti) => {
  const made = insertPreview(schema);
  if (Result.isFailure(made)) {
    throw made.failure;
  }

  return made.success;
});

/**
 * Preview a program's write: grizzle's `insertPreview(Qti)` of its facts
 * (`#pantry/import/write.ts` `packageFactsOf`), the rows it stores or the refusal it meets before
 * any SQL.
 *
 * @param inputs - The program's inputs.
 * @returns The rows, by relation, or the write's refusal.
 */
export const previewOf = (inputs: PackageInputs) => previewFor(Qti)(packageFactsOf(inputs));

/**
 * Read the rows a program's write stores ({@link previewOf}): every writable relation's rows, each
 * count, index, interval, fold end and copy the write draws among their values.
 *
 * @param inputs - The program's inputs.
 * @returns The rows, by relation; the case fails where the write refuses them before any SQL.
 */
export const previewRowsOf = (inputs: PackageInputs): PreviewRows<typeof Qti> => {
  const previewed = previewOf(inputs);

  return Result.isSuccess(previewed)
    ? previewed.success
    : assert.fail(
        `the import's write refuses its rows before any SQL: ${Formatter.format(previewed.failure)}`,
      );
};

/**
 * Compile a schema's row evaluator, once per process, on first use: the one evaluator every reader
 * of the import's rows judges a row by, a check over a query's row among them.
 */
export const evaluatorFor = Fn.memoize(evaluatorOf<typeof Qti>);

/**
 * A field's one text, grizzle's `codecText` of its type, by relation and then field: each stored
 * and each closed relation's fields. Read on first use.
 */
const fieldTextsOf = Fn.memoize(
  (schema: typeof Qti): ReadonlyMap<string, ReadonlyMap<string, ReturnType<typeof codecText>>> =>
    new Map(
      Object.values(schema.relations).flatMap((relation) =>
        relation.kind === "relation" || relation.kind === "closedRelation"
          ? [
              [
                relation.name,
                new Map(
                  // oxlint-disable-next-line typescript/no-unsafe-argument -- Each field descriptor of a relation of the schema, read by its name, which codecText reads whatever its kind.
                  Object.entries(relation.fields).map(([name, field]) => [name, codecText(field)]),
                ),
              ] as const,
            ]
          : [],
      ),
    ),
);

/**
 * Write a value of a relation's field as its one text, grizzle's `codecText` of the field: one text
 * per value under PostgreSQL's equality, a closed id's its handle.
 *
 * @param relation - The relation, stored or closed.
 * @param field - The field.
 * @param value - The value, as a row of the relation holds it.
 * @returns Its text.
 * @throws {Error} When the relation holds no such field, or grizzle's codec admits no such value:
 *   a defect of the caller's reading, or of grizzle's, never of a document.
 */
// oxlint-disable-next-line anti-slop/no-unknown-parameters -- A value of a relation's field read by its name, its codec's host value, which codecText admits or refuses.
export const textOfField = (relation: string, field: string, value: unknown): string => {
  const textOf = fieldTextsOf(Qti).get(relation)?.get(field);
  if (textOf === undefined) {
    throw new Error(`${relation} holds no field ${field}. Read a field the relation stores.`);
  }

  const text = textOf(value);
  if (Result.isFailure(text)) {
    throw new Error(
      `grizzle's codecText refuses ${relation}.${field}'s value ${Formatter.format(value)}: ${Formatter.format(text.failure)}.`,
    );
  }

  return text.success;
};

/**
 * How a side selects its relation's rows: every row, a whole relation's; the rows grizzle's
 * evaluator finds its selection's predicate true of, the statement's own `select(R, φ)` its source;
 * or an `alternatives` arm's, the parent's rows whose discriminator holds the arm's handle.
 */
type Selection =
  | { readonly kind: "arm"; readonly discriminator: string; readonly handle: string }
  | { readonly kind: "selected"; readonly source: RowSource<typeof Qti> }
  | { readonly kind: "whole" };

/**
 * One side of a law as the host judges it: its relation, its selection, and its terms as an
 * outcome names them, its selection's conjuncts left out.
 */
interface JudgedSide {
  readonly law: LawSide;
  readonly relation: string;
  readonly selection: Selection;
  readonly source: RelationOf<typeof Qti>;
}

/**
 * A check the schema states, by its declared name, over a stored relation.
 */
type CheckName = Extract<QtiStatement, { readonly kind: "check" }>["name"];

/**
 * A law the schema states that the host judges over rows: a containment, each half of a `mirrors`
 * or an `alternatives`, its source rows' projection among its target rows'; a key, its rows'
 * projection one tuple each; and a check, every row's verdict `holds`. Each is named as an outcome
 * names it ({@link statedAs}).
 */
type JudgedLaw =
  | {
      readonly from: JudgedSide;
      readonly kind: "contained";
      readonly law: Law;
      readonly to: JudgedSide;
    }
  | {
      readonly kind: "check";
      readonly law: Law;
      readonly name: CheckName;
      readonly relation: string;
      readonly source: RowSource<typeof Qti>;
    }
  | { readonly kind: "key"; readonly law: Law; readonly side: JudgedSide };

/**
 * Write a side's term as a law's: a field, or `pred` of one.
 *
 * @param term - The term, as the statement holds it.
 * @returns The law's term.
 */
const lawTermOf = (term: AnyTerm): LawSide["terms"][number] =>
  Predicate.isString(term) ? { field: term, kind: "field" } : { field: term.field, kind: "pred" };

/**
 * The relations whose rows the host holds, by name: each stored relation, whose rows the preview
 * gives, and each closed relation, whose rows the schema fixes. A derived relation's are a query's,
 * the database's alone, so no side over one is judged.
 */
export const heldRelations: ReadonlySet<string> = new Set(
  Object.values(Qti.relations).flatMap((relation) =>
    relation.kind === "relation" || relation.kind === "closedRelation" ? [relation.name] : [],
  ),
);

/**
 * Read a statement's side as the host judges it.
 *
 * @param side - The side, as the statement holds it.
 * @param side.source - Its relation or selection.
 * @param side.terms - Its terms.
 * @returns The side, none where it reads a derived relation.
 */
const sideOf = (side: {
  readonly source: RowSource<typeof Qti>;
  readonly terms: readonly AnyTerm[];
}): Option.Option<JudgedSide> => {
  const { source } = side;
  const relation = "relation" in source ? source.relation : source;
  if (!heldRelations.has(relation.name) || !Arr.isReadonlyArrayNonEmpty(side.terms)) {
    return Option.none();
  }

  return Option.some({
    law: {
      relation: relation.name,
      selection: { conjuncts: [] },
      terms: pipe(side.terms, Arr.map(lawTermOf)),
    },
    relation: relation.name,
    selection: "relation" in source ? { kind: "selected", source } : { kind: "whole" },
    source: relation,
  });
};

/**
 * Whether two law sides read one side, whatever their selections: one relation, and the same terms
 * in pairing order, each a field or `pred` of one.
 *
 * @param stated - A side as grizzle's `lawsOf` names it.
 * @param read - The side as {@link judgedOf} read it from its statement.
 * @returns Whether they are one side.
 */
const readsSide = (stated: LawSide, read: LawSide): boolean =>
  stated.relation === read.relation &&
  stated.terms.length === read.terms.length &&
  Arr.zip(stated.terms, read.terms).every(
    ([held, term]) => held.kind === term.kind && held.field === term.field,
  );

/**
 * Whether a law grizzle's `lawsOf` names for a statement is the law {@link judgedOf} read from it: a
 * check of one name over one relation, a key over one side, or a containment between one pair of
 * sides, whatever the sides' selections, since that reader reads a side's selection as the source
 * the statement holds, not as grizzle's canonical conjuncts.
 *
 * @param stated - The law as `lawsOf` names it.
 * @param read - The law as {@link judgedOf} read it.
 * @returns Whether they are one law.
 */
const readsLaw = (stated: Law, read: StatedLaw): boolean => {
  if (stated.kind === "check" && read.kind === "check") {
    return stated.name === read.name && stated.relation === read.relation;
  }

  if (stated.kind === "key" && read.kind === "key") {
    return readsSide(stated.side, read.side);
  }

  return (
    stated.kind === "contained" &&
    read.kind === "contained" &&
    readsSide(stated.from, read.from) &&
    readsSide(stated.to, read.to)
  );
};

/**
 * Name a law as grizzle's `lawsOf` names it, its sides' selections and its catalog entry included:
 * the one law of its statement's that it reads ({@link readsLaw}).
 *
 * @param read - The law as {@link judgedOf} or {@link containmentsIn} read it from its statement.
 * @param laws - The statement's laws, as `lawsOf` names them.
 * @returns The statement's own law.
 * @throws {Error} When none or several of the statement's laws are the law read, which `lawsOf`
 *   rules out: a defect of this reader, never of a document.
 */
const statedLawOf = (read: StatedLaw, laws: readonly Law[]): Law => {
  const held = laws.filter((stated) => readsLaw(stated, read));
  if (!Arr.isReadonlyArrayNonEmpty(held) || held.length > 1) {
    throw new Error(
      `The statement read as ${Formatter.format(read)} has ${String(held.length)} laws of grizzle's lawsOf that read its sides, among ${Formatter.format(laws)}. Read each statement's sides as lawsOf pairs them.`,
    );
  }

  return Arr.headNonEmpty(held);
};

/**
 * Read a containment from one side into another as the law the host judges it by, named as
 * grizzle's `lawsOf` names it ({@link statedLawOf}).
 *
 * @param left - Its source side.
 * @param right - Its target side.
 * @param laws - Its statement's laws, as `lawsOf` names them.
 * @returns The law, none where a side reads a derived relation.
 */
const containedOf = (
  left: Parameters<typeof sideOf>[0],
  right: Parameters<typeof sideOf>[0],
  laws: readonly Law[],
): Option.Option<Extract<JudgedLaw, { readonly kind: "contained" }>> =>
  Option.zipWith(sideOf(left), sideOf(right), (from, to) => ({
    from,
    kind: "contained" as const,
    law: statedLawOf({ from: from.law, kind: "contained", to: to.law }, laws),
    to,
  }));

/**
 * Read an `alternatives` statement's containments from its laws: between the parent's rows of each
 * arm, the rows whose discriminator holds the arm's handle, and the arm's relation, each way.
 *
 * @param statement - The statement.
 * @param laws - Its laws, as grizzle's `lawsOf` names them.
 * @returns Its containments.
 */
const alternativesOf = (
  statement: Extract<QtiStatement, { readonly kind: "alternatives" }>,
  laws: readonly Law[],
): readonly JudgedLaw[] => {
  const { discriminator, parent } = statement;
  // oxlint-disable-next-line typescript/no-unsafe-assignment -- An alternatives' arms, by their handles, each a relation of the schema.
  const arms: readonly (readonly [string, RelationOf<typeof Qti>])[] = Object.entries(
    statement.arms,
  );
  const sideFor = (side: LawSide, other: LawSide): JudgedSide => {
    if (side.relation !== parent.name) {
      const own = arms.find(([, relation]) => relation.name === side.relation);
      if (own === undefined) {
        throw new Error(
          `The alternatives over ${parent.name} states a law of ${side.relation}, which is none of its arms. Read an alternatives' laws as its arms state them.`,
        );
      }

      return { law: side, relation: side.relation, selection: { kind: "whole" }, source: own[1] };
    }

    const arm = arms.find(([, relation]) => relation.name === other.relation);
    if (arm === undefined) {
      throw new Error(
        `The alternatives over ${parent.name} states a law between it and ${other.relation}, which is none of its arms. Read an alternatives' laws as its arms state them.`,
      );
    }

    return {
      law: side,
      relation: side.relation,
      selection: { discriminator, handle: arm[0], kind: "arm" },
      source: parent,
    };
  };

  return laws.flatMap((law): readonly JudgedLaw[] => {
    if (law.kind !== "contained") {
      return [];
    }

    return [
      { from: sideFor(law.from, law.to), kind: "contained", law, to: sideFor(law.to, law.from) },
    ];
  });
};

/**
 * Read one statement as the laws the host judges it by, each as this module reads it from the
 * statement and named as grizzle's `lawsOf` names it ({@link statedLawOf}).
 *
 * @param statement - The statement as the schema states it.
 * @param laws - Its laws, as grizzle's `lawsOf` names them.
 * @returns Its laws: two for a `mirrors`, one for a containment, a check or a key, each of its
 *   containments for an `alternatives`, none for a family, a tree or a fold, whose laws the
 *   preview's rows hold by their drawing, and none for a statement over a derived relation.
 */
const judgedOf = (statement: QtiStatement, laws: readonly Law[]): readonly JudgedLaw[] => {
  switch (statement.kind) {
    case "alternatives": {
      return alternativesOf(statement, laws);
    }
    case "check": {
      const { name, relation } = statement;

      return relation.kind === "relation"
        ? [
            {
              kind: "check",
              law: statedLawOf({ kind: "check", name, relation: relation.name }, laws),
              name,
              relation: relation.name,
              source: relation,
            },
          ]
        : [];
    }
    case "contained": {
      return Option.toArray(containedOf(statement.left, statement.right, laws));
    }
    case "key": {
      return Option.toArray(
        Option.map(sideOf(statement.side), (side) => ({
          kind: "key" as const,
          law: statedLawOf({ kind: "key", side: side.law }, laws),
          side,
        })),
      );
    }
    case "mirrors": {
      return [
        ...Option.toArray(containedOf(statement.left, statement.right, laws)),
        ...Option.toArray(containedOf(statement.right, statement.left, laws)),
      ];
    }
    case "counted":
    case "fold":
    case "ordered":
    case "tree": {
      return [];
    }
    default: {
      return statement satisfies never;
    }
  }
};

/**
 * What a side's selection is keyed by among the interned sides: a selection's source itself, a
 * value of the schema; an arm's discriminator and handle; a whole relation's, one key.
 *
 * @param selection - The selection.
 * @returns Its key.
 */
const selectionKeyOf = (selection: Selection): RowSource<typeof Qti> | string => {
  switch (selection.kind) {
    case "selected": {
      return selection.source;
    }
    case "arm": {
      return `arm ${selection.discriminator} ${selection.handle}`;
    }
    case "whole": {
      return "whole";
    }
    default: {
      return selection satisfies never;
    }
  }
};

/**
 * The one value of each side the laws read: sides of one relation, one selection and one list of
 * terms are one side, so a judgment projects each once, however many laws read it
 * ({@link projectionOf}). A selection's source is a value of the schema, keyed by itself; a whole
 * relation's and an arm's selection by what states it.
 *
 * @returns The side of a side's content, the first one met.
 */
const internedSides = (): ((side: JudgedSide) => JudgedSide) => {
  const bySelection = new Map<RowSource<typeof Qti> | string, Map<string, JudgedSide>>();

  return (side) => {
    const selected = selectionKeyOf(side.selection);
    const sides = bySelection.get(selected) ?? new Map<string, JudgedSide>();
    bySelection.set(selected, sides);

    const key = JSON.stringify([side.relation, side.law]);
    const known = sides.get(key);
    if (known !== undefined) {
      return known;
    }

    sides.set(key, side);

    return side;
  };
};

/**
 * A law with each of its sides the one value of its content ({@link internedSides}).
 *
 * @param law - The law.
 * @param sideOfKey - The interned sides.
 * @returns The law over interned sides.
 */
const internedLaw = (law: JudgedLaw, sideOfKey: (side: JudgedSide) => JudgedSide): JudgedLaw => {
  switch (law.kind) {
    case "check": {
      return law;
    }
    case "key": {
      return { ...law, side: sideOfKey(law.side) };
    }
    case "contained": {
      return { ...law, from: sideOfKey(law.from), to: sideOfKey(law.to) };
    }
    default: {
      return law satisfies never;
    }
  }
};

/**
 * Every law a schema states that the host judges over rows ({@link JudgedLaw}), in statement order,
 * each named as grizzle's `lawsOf` names its statement's law ({@link statedAs}).
 *
 * @param schema - The schema, `Qti`.
 * @returns The laws.
 */
export const judgedLaws: (schema: typeof Qti) => readonly JudgedLaw[] = Fn.memoize(
  (schema: typeof Qti): readonly JudgedLaw[] => {
    const sideOfKey = internedSides();

    return statementLawsOf(schema).flatMap(({ laws, statement }) =>
      judgedOf(statement, laws).map((judged) => internedLaw(judged, sideOfKey)),
    );
  },
);

/**
 * A row of a relation, admitted to grizzle's evaluator once (`rowEvaluator`'s `admit`): its domains
 * judged, every source of its relation then evaluating it, each item computed where it is first
 * read and shared by every source.
 */
type Admitted = ReturnType<ReturnType<typeof evaluatorFor>["admit"]>;

/**
 * Why the host gives no verdict of a row: PostgreSQL's domain refuses it before any law reads it.
 *
 * @param relation - The row's relation.
 * @param field - The field its domain refuses.
 * @returns The reason.
 */
const refusedRow = (relation: string, field: string): string =>
  `${relation}: a row its domains refuse at ${field}`;

/**
 * One row as the judge reads it: the row admitted to grizzle's evaluator, the preview's or a closed
 * relation's fact; every field's value, each field PostgreSQL generates at the value the evaluator
 * gives it among them; and why the host has no value of a generated field, by the field.
 */
interface Judged {
  readonly admitted: Admitted;
  readonly unknown: ReadonlyMap<string, string>;
  readonly values: HeldRow;
}

/**
 * Admit a relation's row to grizzle's evaluator, and read it with its generated fields, each at the
 * value the evaluator gives it.
 *
 * @param relation - The row's relation.
 * @param row - The row, the preview's or a closed relation's fact.
 * @returns The row as the judge reads it.
 */
const judgedOfRow = (relation: RelationOf<typeof Qti>, row: HeldRow): Judged => {
  const evaluate = evaluatorFor(Qti);
  const admitted = evaluate.admit(relation, row);
  if (Result.isFailure(admitted)) {
    return { admitted, unknown: new Map(), values: row };
  }

  const generated = Object.entries(evaluate(relation, admitted.success).generated);

  return {
    admitted,
    unknown: new Map(
      generated.flatMap(([field, value]) =>
        Result.isSuccess(value) ? [] : [[field, value.failure.why] as const],
      ),
    ),
    values: {
      ...row,
      ...Object.fromEntries(
        generated.flatMap(([field, value]) =>
          Result.isSuccess(value) ? [[field, value.success] as const] : [],
        ),
      ),
    },
  };
};

/**
 * Whether a side selects a row, or why the host cannot tell.
 */
type Selected =
  | { readonly ok: false; readonly why: string }
  | { readonly ok: true; readonly value: boolean };

/**
 * Decide whether a side selects a row.
 *
 * @param side - The side.
 * @param row - The row.
 * @returns Whether it selects the row, or why the host cannot tell.
 */
const selects = (side: JudgedSide, row: Judged): Selected => {
  const { selection } = side;
  switch (selection.kind) {
    case "whole": {
      return { ok: true, value: true };
    }
    case "arm": {
      return { ok: true, value: row.values[selection.discriminator] === selection.handle };
    }
    case "selected": {
      const { admitted } = row;
      if (Result.isFailure(admitted)) {
        return { ok: false, why: refusedRow(side.relation, admitted.failure.field) };
      }

      const { selected } = evaluatorFor(Qti)(selection.source, admitted.success);

      return Result.isSuccess(selected)
        ? { ok: true, value: selected.success }
        : { ok: false, why: `${side.relation}: its selection, ${selected.failure.why}` };
    }
    default: {
      return selection satisfies never;
    }
  }
};

/**
 * A side's tuple over a row: its text, none where a `pred` term reads 0, whose predecessor is no
 * value, so the row has no tuple on the side, or why the host has no value it reads.
 */
type Tuple =
  | { readonly kind: "none" }
  | { readonly kind: "tuple"; readonly text: string }
  | { readonly kind: "unknown"; readonly why: string };

/**
 * A term's cell at a row: its value's text, none where a `pred` term reads 0, or why the host has
 * no value it reads.
 */
type Cell =
  | { readonly kind: "none" }
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "unknown"; readonly why: string };

/**
 * A `pred` term's cell at 0, whose predecessor is no value.
 */
const noCell: Cell = { kind: "none" };

/**
 * A term's cell at a row ({@link Cell}).
 *
 * @param relation - The relation.
 * @param term - The term.
 * @param row - The row.
 * @returns The cell.
 */
const cellOf = (relation: string, term: LawSide["terms"][number], row: Judged): Cell => {
  const why = row.unknown.get(term.field);
  if (why !== undefined) {
    return { kind: "unknown", why: `${relation}.${term.field}: ${why}` };
  }

  const held = row.values[term.field];
  if (term.kind === "pred" && held === 0n) {
    return noCell;
  }

  return {
    kind: "text",
    text: textOfField(
      relation,
      term.field,
      term.kind === "pred" && Predicate.isBigInt(held) ? held - 1n : held,
    ),
  };
};

/**
 * A term's column over a relation's rows: a row's cell, its value as grizzle's `codecText` of its
 * field writes it ({@link textOfField}), a `pred` term's the value before it, read where a side
 * first reads it at the row and kept, so every side and law that reads the term at the row reads
 * one cell.
 */
type Column = (row: Judged) => Cell;

/**
 * A term's column over its relation's rows ({@link Column}).
 *
 * @param relation - The relation.
 * @param term - The term.
 * @returns The column.
 */
const columnOf = (relation: string, term: LawSide["terms"][number]): Column => {
  const cells = new Map<Judged, Cell>();

  return (row) => {
    const known = cells.get(row);
    if (known !== undefined) {
      return known;
    }

    const cell = cellOf(relation, term, row);
    cells.set(row, cell);

    return cell;
  };
};

/**
 * Read a side's tuple at a row from its terms' columns ({@link Column}): the row's cells, the
 * first unknown or none deciding it.
 *
 * @param columns - The side's terms' columns, in term order.
 * @param row - The row.
 * @returns The tuple.
 */
const tupleOf = (columns: readonly Column[], row: Judged): Tuple => {
  const values: string[] = [];
  for (const column of columns) {
    const cell = column(row);
    switch (cell.kind) {
      case "unknown": {
        return { kind: "unknown", why: cell.why };
      }
      case "none": {
        return { kind: "none" };
      }
      case "text": {
        values.push(cell.text);
        break;
      }
      default: {
        return cell satisfies never;
      }
    }
  }

  return { kind: "tuple", text: JSON.stringify(values) };
};

/**
 * A law the host judged and found broken: the law, and every row that breaks it, each with its
 * generated fields.
 */
export interface Broken {
  readonly law: Law;
  readonly rows: readonly HeldRow[];
}

/**
 * A law the host could not judge: the law, and each reason, as `Relation: why`.
 */
export interface Skipped {
  readonly law: Law;
  readonly unjudged: readonly string[];
}

/**
 * The host's judgment of rows by laws: the laws it judged, the ones of them the rows break, and the
 * ones it could not judge.
 */
export interface Judgment {
  readonly broken: readonly Broken[];
  readonly judged: readonly Law[];
  readonly skipped: readonly Skipped[];
}

/**
 * One side's projection over its relation's rows: each selected row's tuple, with the row, the
 * rows that share a tuple, and why the host could not tell of some row.
 */
interface Projection {
  readonly repeated: readonly HeldRow[];
  readonly tuples: ReadonlyMap<string, HeldRow>;
  readonly unjudged: ReadonlySet<string>;
}

/**
 * What a judgment reads: every relation's rows by name, a stored one's the preview's with its
 * generated fields and a closed one's its facts, each admitted to grizzle's evaluator once; each
 * term's column over its relation's rows ({@link columnOf}) and each side's projection
 * ({@link projectionOf}), each read once for the judgment, however many laws read it.
 */
interface Held {
  readonly columns: Map<string, Column>;
  readonly projections: Map<JudgedSide, Projection>;
  readonly rows: ReadonlyMap<string, readonly Judged[]>;
}

/**
 * A term's column over its relation's held rows, one for the judgment ({@link columnOf}).
 *
 * @param held - What the judgment reads.
 * @param relation - The relation.
 * @param term - The term.
 * @returns The column.
 */
const heldColumnOf = (held: Held, relation: string, term: LawSide["terms"][number]): Column => {
  const key = `${term.kind} ${relation}.${term.field}`;
  const known = held.columns.get(key);
  if (known !== undefined) {
    return known;
  }

  const made = columnOf(relation, term);
  held.columns.set(key, made);

  return made;
};

/**
 * Project one side over its relation's rows ({@link Projection}): each row it selects, its tuple
 * read from its terms' columns.
 *
 * @param held - What the judgment reads.
 * @param side - The side.
 * @returns The tuples, the repeats and the rows the host could not tell of.
 */
const projectedOf = (held: Held, side: JudgedSide): Projection => {
  const unjudged = new Set<string>();
  const tuples = new Map<string, HeldRow>();
  const repeated: HeldRow[] = [];
  const columns = side.law.terms.map((term) => heldColumnOf(held, side.relation, term));
  for (const row of held.rows.get(side.relation) ?? []) {
    const selected = selects(side, row);
    if (!selected.ok) {
      unjudged.add(selected.why);
    } else if (selected.value) {
      const tuple = tupleOf(columns, row);
      if (tuple.kind === "unknown") {
        unjudged.add(tuple.why);
      } else if (tuple.kind === "tuple") {
        const first = tuples.get(tuple.text);
        if (first === undefined) {
          tuples.set(tuple.text, row.values);
        } else {
          repeated.push(first, row.values);
        }
      }
    }
  }

  return { repeated, tuples, unjudged };
};

/**
 * Project one side over its relation's rows ({@link Projection}), once for the judgment: a side is
 * one value however many laws read it ({@link internedSides}).
 *
 * @param held - What the judgment reads.
 * @param side - The side.
 * @returns The tuples, the repeats and the rows the host could not tell of.
 */
const projectionOf = (held: Held, side: JudgedSide): Projection => {
  const known = held.projections.get(side);
  if (known !== undefined) {
    return known;
  }

  const made = projectedOf(held, side);
  held.projections.set(side, made);

  return made;
};

/**
 * One law read over rows: the rows that break it, and why the host could not tell of some row.
 */
interface LawRead {
  readonly breaking: readonly HeldRow[];
  readonly unjudged: ReadonlySet<string>;
}

/**
 * Judge a check over its relation's rows: a row breaks it where grizzle's verdict is `breaks`, its
 * predicate false or NULL.
 *
 * @param held - What the judgment reads.
 * @param law - The check.
 * @returns The rows that break it, and why the host could not tell of some row.
 */
const checkRead = (held: Held, law: Extract<JudgedLaw, { readonly kind: "check" }>): LawRead => {
  const unjudged = new Set<string>();
  const breaking: HeldRow[] = [];
  for (const { admitted, values } of held.rows.get(law.relation) ?? []) {
    if (Result.isSuccess(admitted)) {
      // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- The check's own name, read off its statement, keys the verdict of its relation's row.
      const verdict = evaluatorFor(Qti)(law.source, admitted.success).checks[law.name];
      if (Result.isFailure(verdict)) {
        unjudged.add(`${law.relation}: ${verdict.failure.why}`);
      } else if (verdict.success === "breaks") {
        breaking.push(values);
      }
    } else {
      unjudged.add(refusedRow(law.relation, admitted.failure.field));
    }
  }

  return { breaking, unjudged };
};

/**
 * Judge one law over rows.
 *
 * @param held - What the judgment reads.
 * @param law - The law.
 * @returns The rows that break it, and why the host could not tell of some row.
 */
const judgedBy = (held: Held, law: JudgedLaw): LawRead => {
  switch (law.kind) {
    case "check": {
      return checkRead(held, law);
    }
    case "key": {
      const { repeated, unjudged } = projectionOf(held, law.side);

      return { breaking: repeated, unjudged };
    }
    case "contained": {
      const from = projectionOf(held, law.from);
      const to = projectionOf(held, law.to);

      return {
        breaking: [...from.tuples].flatMap(([tuple, row]) => (to.tuples.has(tuple) ? [] : [row])),
        unjudged: new Set([...from.unjudged, ...to.unjudged]),
      };
    }
    default: {
      return law satisfies never;
    }
  }
};

/**
 * A closed relation's facts as a judgment reads them, each admitted once for the relation: its rows
 * are the schema's own, the same for every preview.
 */
const closedRowsOf = Fn.memoize(
  (
    relation: Extract<RelationOf<typeof Qti>, { readonly kind: "closedRelation" }>,
  ): readonly Judged[] => relation.rows.map((row) => judgedOfRow(relation, row)),
);

/**
 * Read every relation's rows as a judgment reads them: each closed relation's facts
 * ({@link closedRowsOf}), and each stored relation's preview rows, each with its generated fields,
 * once a preview: a judgment and the readings of the same rows ({@link readingsOf}) admit each
 * row once between them.
 *
 * @param rows - The preview's rows.
 * @returns The rows, by relation.
 */
const heldRowsOf = Fn.memoize(
  (rows: PreviewRows<typeof Qti>): ReadonlyMap<string, readonly Judged[]> => {
    const previewed: ReadonlyMap<string, readonly HeldRow[]> = new Map(Object.entries(rows));

    return new Map(
      Object.values(Qti.relations).flatMap(
        (relation): readonly (readonly [string, readonly Judged[]])[] => {
          switch (relation.kind) {
            case "closedRelation": {
              return [[relation.name, closedRowsOf(relation)]];
            }
            case "relation": {
              return [
                [
                  relation.name,
                  (previewed.get(relation.name) ?? []).map((row) => judgedOfRow(relation, row)),
                ],
              ];
            }
            case "closed":
            case "derived": {
              return [];
            }
            default: {
              return relation satisfies never;
            }
          }
        },
      ),
    );
  },
);

/**
 * One row as grizzle's evaluator reads it, for a reader of its domains and generated values: the
 * field a domain of its relation refuses, none where its domains admit it, and every field's value,
 * each generated one at the value the evaluator gives it (`null` where PostgreSQL computes NULL).
 */
export interface RowReading {
  readonly refused: Option.Option<string>;
  readonly values: HeldRow;
}

/**
 * Read every stored relation's rows as grizzle's evaluator reads them ({@link RowReading}).
 *
 * @param rows - The preview's rows.
 * @returns Each stored relation's readings, by relation.
 */
export const readingsOf = (
  rows: PreviewRows<typeof Qti>,
): ReadonlyMap<string, readonly RowReading[]> =>
  new Map(
    [...heldRowsOf(rows)].map(([relation, held]) => [
      relation,
      held.map(({ admitted, values }) => ({
        refused: Result.isSuccess(admitted) ? Option.none() : Option.some(admitted.failure.field),
        values,
      })),
    ]),
  );

/**
 * Judge rows by laws: each law the host tells of on every row it reads is judged, and broken where
 * a row breaks it; each other law is skipped, named with why.
 *
 * @param rows - The rows the import's write stores ({@link previewRowsOf}).
 * @param laws - The laws ({@link judgedLaws}).
 * @returns The judgment.
 */
export const judge = (rows: PreviewRows<typeof Qti>, laws: readonly JudgedLaw[]): Judgment => {
  const held: Held = { columns: new Map(), projections: new Map(), rows: heldRowsOf(rows) };
  const broken: Broken[] = [];
  const judged: Law[] = [];
  const skipped: Skipped[] = [];
  for (const law of laws) {
    const { breaking, unjudged } = judgedBy(held, law);
    if (unjudged.size > 0) {
      skipped.push({ law: law.law, unjudged: [...unjudged].toSorted() });
    } else {
      judged.push(law.law);
      if (breaking.length > 0) {
        broken.push({ law: law.law, rows: breaking });
      }
    }
  }

  return { broken, judged, skipped };
};

/**
 * A containment the schema states, read from the statement grizzle keeps for it: its law, each
 * side's relation and fields, a `pred` term's field among them, and whether each side selects a
 * row, as grizzle's evaluator finds its selection of the row.
 */
export interface Containment {
  readonly from: string;
  readonly fromFields: readonly string[];
  readonly law: Law;
  /**
   * Whether its source side selects a row of its relation.
   *
   * @param row - The row, every field its relation stores but the generated ones.
   * @returns Whether the side selects it; the case fails where the host cannot tell.
   */
  readonly selected: (row: HeldRow) => boolean;
  /**
   * Whether its target side selects a row of its relation.
   *
   * @param row - The row, every field its relation stores but the generated ones.
   * @returns Whether the side selects it; the case fails where the host cannot tell.
   */
  readonly targeted: (row: HeldRow) => boolean;
  readonly to: string;
  readonly toFields: readonly string[];
}

/**
 * Read a side's selection of one row as a test reads it.
 *
 * @param side - The side.
 * @returns Whether it selects a row; the case fails where the host cannot tell.
 */
const selectionTest =
  (side: JudgedSide) =>
  (row: HeldRow): boolean => {
    const selected = selects(side, judgedOfRow(side.source, row));

    return selected.ok ? selected.value : assert.fail(`the host tells: ${selected.why}`);
  };

/**
 * Read the containment one statement states from one relation, so a test can judge rows by the
 * schema's own statements, their selections included: a source row its selection holds must meet
 * a target row its selection holds on the paired fields. Its law is read as {@link judgedOf} reads
 * it, its sides' selections left out, named as grizzle's `lawsOf` names it ({@link statedLawOf}).
 *
 * @param statement - The statement as the schema states it.
 * @param from - The source relation.
 * @param laws - The statement's laws, as `lawsOf` names them.
 * @returns The containment, none for a statement that is no containment from `from`.
 */
export const containmentsIn = (
  statement: QtiStatement,
  from: string,
  laws: readonly Law[],
): readonly Containment[] =>
  statement.kind === "contained"
    ? Option.toArray(containedOf(statement.left, statement.right, laws)).flatMap(
        (law): readonly Containment[] =>
          law.kind === "contained" && law.from.relation === from
            ? [
                {
                  from: law.from.relation,
                  fromFields: law.from.law.terms.map(({ field }) => field),
                  law: law.law,
                  selected: selectionTest(law.from),
                  targeted: selectionTest(law.to),
                  to: law.to.relation,
                  toFields: law.to.law.terms.map(({ field }) => field),
                },
              ]
            : [],
      )
    : [];

/**
 * Read a row of a stored relation with each field PostgreSQL generates of it at the value grizzle's
 * evaluator gives it, as a test compares a row the database holds: a relation that generates no
 * field holds the row as it is.
 *
 * @param evaluate - The schema's row evaluator ({@link evaluatorFor}), which its caller holds: its
 *   compile is about 9 s of CPU, once per process, a search's own setup and no case's work, so a
 *   search whose cases read it compiles it before its first case, outside every case's hang guard.
 * @param relation - The row's relation.
 * @param row - The row, every field the relation stores but the generated ones.
 * @returns The row with its generated fields; the case fails where the relation's domains refuse the
 *   row, or the host leaves a generated field of it unevaluated.
 */
export const withGenerated = (
  evaluate: ReturnType<typeof evaluatorFor>,
  relation: Extract<
    (typeof Qti.relations)[keyof typeof Qti.relations],
    { readonly kind: "relation" }
  >,
  row: HeldRow,
): HeldRow => {
  const fields: HeldRow = relation.fields;
  if (
    !Object.values(fields).some(
      (field) => Predicate.hasProperty(field, "writing") && field.writing === "generated",
    )
  ) {
    return row;
  }

  const admitted = evaluate.admit(relation, row);
  if (Result.isFailure(admitted)) {
    return assert.fail(refusedRow(relation.name, admitted.failure.field));
  }

  // oxlint-disable-next-line anti-slop/no-known-value-widening -- A row of any stored relation, its generated fields beside its own, each read by its name.
  return {
    ...row,
    ...Object.fromEntries(
      Object.entries(evaluate(relation, admitted.success).generated).map(([field, value]) => [
        field,
        Result.isSuccess(value)
          ? value.success
          : assert.fail(`${relation.name}.${field}: ${value.failure.why}`),
      ]),
    ),
  };
};

/**
 * A row of `Node` as the import's write stores one: a `qti-simple-choice` element, the first choice
 * of an item's choice interaction, every field at the value the preview of such an item gives it.
 * A test that holds a row of `Node` to a check builds it from this one, with the fields it varies
 * in place, so grizzle's evaluator reads a whole row inside its domains.
 */
export const choiceNode: EvaluatedRow<typeof Qti.relations.Node> = {
  ancestry: Bits.of(Flag, ["choice", "int"]),
  at: 3n,
  attributes: 1n,
  attrs: Bits.of(AttributeSlot, ["59"]),
  barredChildren: 0n,
  chars: "",
  charsAfter: "",
  charsWas: "",
  children: 1n,
  countedChildren: 0n,
  elementChildren: 0n,
  elements: 2n,
  elementsWas: 1n,
  end: 39n,
  first: "",
  governor: "qti-simple-choice",
  kind: "qti-simple-choice",
  last: "",
  lastState: "0",
  nearest: 32n,
  nearestKind: "qti-choice-interaction",
  nearestPath: "choice.xml",
  openAttributes: 0n,
  package: "p",
  parent: 32n,
  parentAncestry: Bits.of(Flag, ["int"]),
  parentGovernor: "qti-choice-interaction",
  parentKind: "qti-choice-interaction",
  parentNearest: 0n,
  parentNearestKind: "document",
  parentNearestPath: "choice.xml",
  parentParentKind: "qti-item-body",
  path: "choice.xml",
  prefix: "",
  start: 37n,
  state: "2",
  stringValue: "",
  was: "1",
};

/**
 * A row of `Attribute` as the import's write stores one: a manifest's `identifier`, every field at
 * the value the preview of such a manifest gives it. A test that holds a row of `Attribute` to a
 * selection builds it from this one, with the fields it varies in place, so grizzle's evaluator
 * reads a whole row inside its domains.
 */
export const manifestAttribute: EvaluatedRow<typeof Qti.relations.Attribute> = {
  governor: "cp:manifest",
  idrefText: "",
  idrefs: 0n,
  kind: "cp:manifest",
  lexical: "M",
  name: "identifier",
  package: "p",
  path: "imsmanifest.xml",
  prefix: "",
  slot: Bits.of(AttributeSlot, ["4"]),
  start: 3n,
};
