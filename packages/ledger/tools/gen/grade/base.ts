import type { Fragments } from "#tools/gen/grade/fragments.ts";
import {
  byCodeUnits,
  camel,
  capitalized,
  count,
  endOf,
  groupOf,
  indented,
  indexOf,
  lastIndexBefore,
  lastIndexOf,
  matchesOf,
  matchOf,
  must,
  replaceAll,
} from "#tools/gen/grade/text.ts";

/**
 * The base stage of grade.ts: the item's grading statement over the
 * ledger's sidecars, one block per sidecar, from the one table of base types below.
 */

/**
 * QTI's base types, in the order every per-type block is written.
 */
export const TYPES = [
  "Identifier",
  "Boolean",
  "Integer",
  "Float",
  "String",
  "Point",
  "Pair",
  "DirectedPair",
  "Duration",
  "Uri",
  "File",
] as const;

/**
 * A base type, by its sidecars' name.
 */
type BaseTypeName = (typeof TYPES)[number];

/**
 * Each base type's token, as QTI spells it.
 */
const TOKEN: Readonly<Record<BaseTypeName, string>> = {
  Boolean: "boolean",
  DirectedPair: "directedPair",
  Duration: "duration",
  File: "file",
  Float: "float",
  Identifier: "identifier",
  Integer: "integer",
  Pair: "pair",
  Point: "point",
  String: "string",
  Uri: "uri",
};

/**
 * How a base type's single crosses: its flat doc heading, whether the heading names a base, and
 * its value columns, each as the doc and the ledger name it.
 */
interface Crossing {
  readonly cols: readonly (readonly [doc: string, ledger: string])[];
  readonly hasBase: boolean;
  readonly head: string;
}

/**
 * Each base type's crossing.
 */
const HEAD: Readonly<Record<BaseTypeName, Crossing>> = {
  Boolean: { cols: [["value", "value"]], hasBase: false, head: "booleans" },
  DirectedPair: {
    cols: [
      ["source", "source"],
      ["target", "target"],
    ],
    hasBase: false,
    head: "directed_pairs",
  },
  Duration: { cols: [["value", "value"]], hasBase: true, head: "floats" },
  File: {
    cols: [
      ["digest", "digest"],
      ["content_type", "type"],
    ],
    hasBase: false,
    head: "files",
  },
  Float: { cols: [["value", "value"]], hasBase: true, head: "floats" },
  Identifier: { cols: [["value", "value"]], hasBase: true, head: "texts" },
  Integer: { cols: [["value", "value"]], hasBase: false, head: "integers" },
  Pair: {
    cols: [
      ["least", "least"],
      ["greatest", "greatest"],
    ],
    hasBase: false,
    head: "pairs",
  },
  Point: {
    cols: [
      ["x", "x"],
      ["y", "y"],
    ],
    hasBase: false,
    head: "points",
  },
  String: { cols: [["value", "value"]], hasBase: true, head: "texts" },
  Uri: { cols: [["value", "value"]], hasBase: true, head: "texts" },
};

/**
 * The heading a record field of each flat heading crosses as.
 */
const FIELD_HEAD: ReadonlyMap<string, string> = new Map([
  ["texts", "field_texts"],
  ["integers", "field_integers"],
  ["floats", "field_floats"],
  ["booleans", "field_booleans"],
  ["pairs", "field_pairs"],
  ["directed_pairs", "field_directed_pairs"],
  ["points", "field_points"],
  ["files", "field_files"],
]);

/**
 * The record fields' headings.
 */
const FIELD_HEADS: ReadonlySet<string> = new Set(FIELD_HEAD.values());

/**
 * A multiple's key columns beside its value columns: a float's bits, each as its column, the
 * function and the value column it is of (the ledger keys a text as itself).
 */
const MULTI_KEY: ReadonlyMap<BaseTypeName, readonly (readonly [string, string, string])[]> =
  new Map([
    ["Float", [["bits", "Num.floatBits", "value"]]],
    ["Duration", [["bits", "Num.floatBits", "value"]]],
  ]);

/**
 * The doc headings, in the order their readers are written.
 */
export const DOC_HEADS = [
  "texts",
  "integers",
  "floats",
  "booleans",
  "pairs",
  "directed_pairs",
  "points",
  "files",
  "file_names",
  "field_texts",
  "field_integers",
  "field_floats",
  "field_booleans",
  "field_pairs",
  "field_directed_pairs",
  "field_points",
  "field_files",
  "field_file_names",
] as const;

/**
 * What a session value of each kind is held as, in the order their rules are written.
 */
const HOLDS = [
  ["template", "value"],
  ["correct", "correct"],
  ["default", "default"],
] as const;

/**
 * The cardinalities a sidecar holds beside a record's.
 */
export const CARDINALITIES = ["Single", "Multiple", "Ordered"] as const;

/**
 * A multiple's copies, each at its place, as a reader binds them.
 */
const COPY =
  '\t\t\tconst copy = Fn.rows(copies, { count })\n\t\t\tconst { place } = v(copy, "copy")\n';

/**
 * A reader's match of a multiple's copy.
 */
const COPY_MATCH = "\n\t\t\t\t.match(copy, { place })";

/**
 * What a reader of each cardinality reads beside the value: its extra column, its copies, and the
 * place its find gives.
 */
const CARDINALITY_READ: Readonly<
  Record<
    (typeof CARDINALITIES)[number],
    {
      readonly copy: string;
      readonly copyMatch: string;
      readonly extra: string;
      readonly place: string;
    }
  >
> = {
  Multiple: { copy: COPY, copyMatch: COPY_MATCH, extra: ", count", place: "place" },
  Ordered: { copy: "", copyMatch: "", extra: ", place", place: "place" },
  Single: {
    copy: "",
    copyMatch: "",
    extra: "",
    place: "place: Type.literal(DocText.fields.place, 0n)",
  },
};

/**
 * A base type's ledger columns.
 *
 * @param t The base type.
 * @returns Its columns.
 */
const ledgerCols = (t: BaseTypeName): readonly string[] =>
  t === "File" ? ["digest", "name", "type"] : HEAD[t].cols.map(([, ledger]) => ledger);

/**
 * A base type's doc columns, each from its ledger column's variable.
 *
 * @param t The base type.
 * @returns The find's columns.
 */
const docPairs = (t: BaseTypeName): string =>
  HEAD[t].cols.map(([doc, ledger]) => (doc === ledger ? doc : `${doc}: ${ledger}`)).join(", ");

/**
 * The find of a doc row from ledger column variables.
 *
 * @param t The base type.
 * @param head The doc heading.
 * @returns The find's columns.
 */
const docCols = (t: BaseTypeName, head: string): string =>
  head === "file_names" ? "name" : docPairs(t);

/**
 * Whether a base type's single, multiple and ordered values cross as doc heading `head`.
 *
 * @param head The doc heading.
 * @param t The base type.
 * @returns Whether they do.
 */
const crossesAs = (head: string, t: BaseTypeName): boolean =>
  head === "file_names" ? t === "File" : !FIELD_HEADS.has(head) && HEAD[t].head === head;

/**
 * Whether a base type's record fields cross as doc heading `head`.
 *
 * @param head The doc heading.
 * @param t The base type.
 * @returns Whether they do.
 */
const fieldsCrossAs = (head: string, t: BaseTypeName): boolean =>
  head === "field_file_names" ? t === "File" : FIELD_HEAD.get(HEAD[t].head) === head;

/**
 * A doc row's base, where its heading names one.
 *
 * @param t The base type.
 * @param named Whether the heading names a base.
 * @returns The find's base column, or nothing.
 */
const docBase = (t: BaseTypeName, named: boolean): string =>
  named ? `, base: Type.literal(DocText.fields.base, "${TOKEN[t]}")` : "";

/**
 * The record fields' find columns.
 *
 * @param t The base type.
 * @param head The doc heading.
 * @returns The find's columns.
 */
const fieldCols = (t: BaseTypeName, head: string): string =>
  head === "field_file_names" ? "name" : docPairs(t);

/**
 * The rules filling doc heading `head` from the attempt's snapshot sidecars and the session's
 * template values.
 *
 * @param head The doc heading.
 * @returns Its rules.
 */
export const valueRules = (head: string): string[] => {
  const rules: string[] = [];
  for (const t of TYPES.filter((type) => crossesAs(head, type))) {
    const lvars = ledgerCols(t).join(", ");
    const base = docBase(t, HEAD[t].hasBase && head !== "file_names");
    const vals = docCols(t, head);
    // snapshot: single, multiple (copies), ordered
    for (const cardinality of CARDINALITIES) {
      const rel = `fields.Snapshot${cardinality}${t}`;
      const { copy, copyMatch, extra, place } = CARDINALITY_READ[cardinality];
      rules.push(`\t\t.rule((r) => {
\t\t\tconst attempt = gradableOf(session).bind(bySession(session))
\t\t\tconst { child, package: pkg, path, n, stage, at } = v(attempt, "attempt")
\t\t\tconst { variable, ${lvars}${extra} } = v(${rel}, "value")
${copy}\t\t\treturn r
\t\t\t\t.match(attempt, { child, package: pkg, path, n, stage, at })
\t\t\t\t.match(${rel}, { child, package: pkg, path, n, at, variable, ${lvars}${extra} })${copyMatch}
\t\t\t\t.find({ child, package: pkg, path, stage, holds: Type.literal(DocText.fields.holds, "value"), identifier: variable, ${place}${base}, ${vals} })
\t\t})`);
    }
    // the session's template values, correct responses and defaults
    for (const cardinality of CARDINALITIES) {
      const rel = `fields.ItemSessionValue${cardinality}${t}`;
      const { copy, copyMatch, extra, place } = CARDINALITY_READ[cardinality];
      for (const [kind, holds] of HOLDS) {
        rules.push(`\t\t.rule((r) => {
\t\t\tconst attempt = gradableOf(session).bind(bySession(session))
\t\t\tconst { child, package: pkg, path, n } = v(attempt, "attempt")
\t\t\tconst { stage } = v(fields.ItemSession, "session")
\t\t\tconst { variable, ${lvars}${extra} } = v(${rel}, "value")
${copy}\t\t\treturn r
\t\t\t\t.match(attempt, { child, package: pkg, path, n })
\t\t\t\t.match(fields.ItemSession, { child, package: pkg, path, n, stage })
\t\t\t\t.match(${rel}, { child, stage, package: pkg, path, kind: "${kind}", variable, ${lvars}${extra} })${copyMatch}
\t\t\t\t.find({ child, package: pkg, path, stage, holds: Type.literal(DocText.fields.holds, "${holds}"), identifier: variable, ${place}${base}, ${vals} })
\t\t})`);
      }
    }
  }
  // records: the snapshot's record fields
  for (const t of TYPES.filter((type) => fieldsCrossAs(head, type))) {
    const lvars = ledgerCols(t).join(", ");
    const base = docBase(t, HEAD[t].hasBase && head !== "field_file_names");
    const rel = `fields.SnapshotRecord${t}`;
    rules.push(`\t\t.rule((r) => {
\t\t\tconst attempt = gradableOf(session).bind(bySession(session))
\t\t\tconst { child, package: pkg, path, n, stage, at } = v(attempt, "attempt")
\t\t\tconst { variable, field, ${lvars} } = v(${rel}, "value")
\t\t\treturn r
\t\t\t\t.match(attempt, { child, package: pkg, path, n, stage, at })
\t\t\t\t.match(fields.SnapshotRecord, { child, package: pkg, path, n, at, variable, field })
\t\t\t\t.match(${rel}, { child, package: pkg, path, n, at, variable, field, ${lvars} })
\t\t\t\t.find({ child, package: pkg, path, stage, holds: Type.literal(DocText.fields.holds, "value"), identifier: variable, field${base}, ${fieldCols(t, head)} })
\t\t})`);
  }

  return rules;
};

/**
 * The rules filling doc heading `head` with an adaptive item's outcomes after its session's
 * previous processed attempt (`retainedOf`, info §2.2.2.3): each declared outcome's values in that
 * attempt's snapshot sidecars, never a response of it, which the attempt graded gives itself.
 * gradeArgumentsOf's alone: a review's marks run no response processing.
 *
 * @param head The doc heading.
 * @returns Its rules.
 */
const retainedRules = (head: string): string[] => {
  const rules: string[] = [];
  for (const t of TYPES.filter((type) => crossesAs(head, type))) {
    const lvars = ledgerCols(t).join(", ");
    const base = docBase(t, HEAD[t].hasBase && head !== "file_names");
    const vals = docCols(t, head);
    for (const cardinality of CARDINALITIES) {
      const rel = `fields.Snapshot${cardinality}${t}`;
      const { copy, copyMatch, extra, place } = CARDINALITY_READ[cardinality];
      rules.push(`\t\t.rule((r) => {
\t\t\tconst retained = retainedOf(session).bind(bySession(session))
\t\t\tconst { child, package: pkg, path, n, stage, previous: at } = v(retained, "retained")
\t\t\tconst { variable, ${lvars}${extra} } = v(${rel}, "value")
${copy}\t\t\treturn r
\t\t\t\t.match(retained, { child, package: pkg, path, n, stage, previous: at })
\t\t\t\t.match(fields.ItemVariable, { package: pkg, path, identifier: variable, declarationKind: "qti-outcome-declaration" })
\t\t\t\t.match(${rel}, { child, package: pkg, path, n, at, variable, ${lvars}${extra} })${copyMatch}
\t\t\t\t.find({ child, package: pkg, path, stage, holds: Type.literal(DocText.fields.holds, "value"), identifier: variable, ${place}${base}, ${vals} })
\t\t})`);
    }
  }
  for (const t of TYPES.filter((type) => fieldsCrossAs(head, type))) {
    const lvars = ledgerCols(t).join(", ");
    const base = docBase(t, HEAD[t].hasBase && head !== "field_file_names");
    const rel = `fields.SnapshotRecord${t}`;
    rules.push(`\t\t.rule((r) => {
\t\t\tconst retained = retainedOf(session).bind(bySession(session))
\t\t\tconst { child, package: pkg, path, n, stage, previous: at } = v(retained, "retained")
\t\t\tconst { variable, field, ${lvars} } = v(${rel}, "value")
\t\t\treturn r
\t\t\t\t.match(retained, { child, package: pkg, path, n, stage, previous: at })
\t\t\t\t.match(fields.ItemRecordVariable, { package: pkg, path, identifier: variable, declarationKind: "qti-outcome-declaration" })
\t\t\t\t.match(fields.SnapshotRecord, { child, package: pkg, path, n, at, variable, field })
\t\t\t\t.match(${rel}, { child, package: pkg, path, n, at, variable, field, ${lvars} })
\t\t\t\t.find({ child, package: pkg, path, stage, holds: Type.literal(DocText.fields.holds, "value"), identifier: variable, field${base}, ${fieldCols(t, head)} })
\t\t})`);
  }

  return rules;
};

/**
 * The end of varsOf's completionStatus rule, after which its retained outcomes' rules stand.
 */
const STATUS_VAR_END = `\t\t\t\t\tidentifier: Type.literal(DocVar.fields.identifier, "completionStatus"),
\t\t\t\t\tcard: Type.literal(DocVar.fields.card, "single")
\t\t\t\t})
\t\t})
`;

/**
 * Readers.ts as gradeArgumentsOf reads it: retainedOf after previousOf, and varsOf's retained
 * outcomes after its completionStatus.
 *
 * @param body The readers' fragment.
 * @param fragment The generator's fragments.
 * @returns The readers of gradeArgumentsOf.
 */
const gradedBody = (body: string, fragment: Fragments): string => {
  const ordinals = indexOf(body, "/** The attempt's ordinal among its session's attempts");
  const retained = body.slice(0, ordinals) + fragment("base/retained") + body.slice(ordinals);
  must(count(retained, STATUS_VAR_END) === 1, "one completionStatus variable rule");

  const at = indexOf(retained, STATUS_VAR_END) + STATUS_VAR_END.length;

  return (
    retained.slice(0, at) +
    fragment("base/retained-vars") +
    retained.slice(at) +
    fragment("base/run-inputs")
  );
};

/**
 * The machine's run inputs beside the documents' values: each by its argument and its reader, and
 * whether the reader reads the sitting's attempts (each machine's reply) or none (the registry's
 * tables, content the same for every run).
 */
export const RUN_INPUTS = [
  ["reply_floats", "replyFloatsOf", "attempts"],
  ["reply_texts", "replyTextsOf", "attempts"],
  ["table_bindings", "tableBindingsOf", "content"],
  ["table_entries", "tableEntriesOf", "content"],
  ["table_values", "tableValuesOf", "content"],
] as const;

/**
 * A readers' return with the run inputs' readers beside the documents' values.
 *
 * @param readersReturn The readers' return.
 * @returns The return with the run inputs.
 */
export const withRunInputs = (readersReturn: string): string => {
  const end = "\t} as const";
  must(count(readersReturn, end) === 1, "the readers' one return");

  return replaceAll(
    readersReturn,
    end,
    RUN_INPUTS.map(([arg, reader]) => `\t\t${arg}: ${reader}(gradedSitting),\n`).join("") + end,
  );
};

/**
 * The rules filling `doc_texts` with the previous attempt's completion status, one a status.
 */
export const STATUS = ["completed", "incomplete", "not_attempted", "unknown"]
  .map(
    (status) => `
\t\t.rule((r) => {
\t\t\tconst previous = previousOf(session).bind(bySession(session))
\t\t\tconst { child, package: pkg, path, n, stage, previous: at } = v(previous, "previous")
\t\t\treturn r
\t\t\t\t.match(previous, { child, package: pkg, path, n, stage, previous: at })
\t\t\t\t.match(fields.ProcessedAttempt, { child, package: pkg, path, n, at, completionStatus: "${status}" })
\t\t\t\t.find({
\t\t\t\t\tchild,
\t\t\t\t\tpackage: pkg,
\t\t\t\t\tpath,
\t\t\t\t\tstage,
\t\t\t\t\tholds: Type.literal(DocText.fields.holds, "value"),
\t\t\t\t\tidentifier: Type.literal(DocText.fields.identifier, "completionStatus"),
\t\t\t\t\tplace: Type.literal(DocText.fields.place, 0n),
\t\t\t\t\tbase: Type.literal(DocText.fields.base, "identifier"),
\t\t\t\t\tvalue: Type.literal(DocText.fields.value, "${status}")
\t\t\t\t})
\t\t})`,
  )
  .join("");

/**
 * A cardinality's token, and the place, the value columns and the find's key a
 * write of it reads.
 */
const CARDINALITY_WRITE = {
  Multiple: { card: "multiple", key: "", pos: "place", posv: ", place" },
  Ordered: { card: "ordered", key: ", place", pos: "place", posv: ", place" },
  Record: { card: "record", key: ", field", pos: "field", posv: ", field" },
  Single: { card: "single", key: "", pos: "place: 0n", posv: "" },
} as const;

/**
 * The insert of the run's outcomes of one cardinality and base type into their sidecar.
 *
 * @param cardinality The cardinality.
 * @param t The base type.
 * @returns The insert.
 */
export const outcomeMember = (
  cardinality: keyof typeof CARDINALITY_WRITE,
  t: BaseTypeName,
): string => {
  const { cols, hasBase, head: flat } = HEAD[t];
  const head = cardinality === "Record" ? (FIELD_HEAD.get(flat) ?? "") : flat;
  const base = hasBase ? `, base: "${TOKEN[t]}"` : "";
  const dvars = cols.map(([doc]) => doc);
  const vmatch = dvars.join(", ");
  const { card, pos, posv } = CARDINALITY_WRITE[cardinality];
  // the ledger's columns from the run's
  const columns =
    t === "String"
      ? "value"
      : cols.map(([doc, ledger]) => (ledger === doc ? doc : `${ledger}: ${doc}`)).join(", ");
  const nh = cardinality === "Record" ? "field_file_names" : "file_names";
  const nameSrc = t === "File" ? `\n\t\t\tconst { name } = v(out.${nh}, "name")` : "";
  const nameMatch =
    t === "File"
      ? `\n\t\t\t\t.match(out.${nh}, { child, package: pkg, path, stage, holds: "value", identifier, ${pos}, name })`
      : "";
  const lfind = t === "File" ? `${columns}, name` : columns;
  const key =
    cardinality === "Multiple"
      ? (MULTI_KEY.get(t) ?? []).map(([column, fn, src]) => `, ${column}: ${fn}(${src})`).join("")
      : CARDINALITY_WRITE[cardinality].key;
  const group = cardinality === "Multiple" ? ", count: r.count()" : "";
  const rel = `mine.Snapshot${cardinality}${t}`;
  if (cardinality === "Multiple") {
    // A bag's count is a fold, which reads each fact once by a key: the copies are a query of
    // distinct rows, each copy at its place, and the fold counts them by value.
    const cvars = dvars.join(", ") + (t === "File" ? ", name" : "");

    return `\t.insert(
\t\t${rel},
\t\tquery(Learner).rule((r) => {
\t\t\tconst bag = query(Learner)
\t\t\t\t.rule((q) => {
\t\t\t\t\tconst out = runOf(session)
\t\t\t\t\tconst attempt = gradableOf(session).bind(bySession(session))
\t\t\t\t\tconst { child, package: pkg, path, n, stage, at } = v(attempt, "attempt")
\t\t\t\t\tconst { identifier } = v(out.vars, "outcome")
\t\t\t\t\tconst { ${vmatch}, place } = v(out.${head}, "value")${replaceAll(nameSrc, "\n\t\t\t", "\n\t\t\t\t\t")}
\t\t\t\t\treturn q
\t\t\t\t\t\t.match(attempt, { child, package: pkg, path, n, stage, at })
\t\t\t\t\t\t.match(out.vars, { child, package: pkg, path, stage, holds: "value", kind: "outcome", identifier, card: "${card}" })
\t\t\t\t\t\t.match(out.${head}, { child, package: pkg, path, stage, holds: "value", identifier, place${base}, ${vmatch} })${replaceAll(nameMatch, "\n\t\t\t\t", "\n\t\t\t\t\t\t")}
\t\t\t\t\t\t.where(q.ne(identifier, "completionStatus"))
\t\t\t\t\t\t.find({ child, package: pkg, path, n, at, identifier, place, ${cvars} })
\t\t\t\t})
\t\t\t\t.bind(bySession(session))
\t\t\tconst { child, package: pkg, path, n, at, identifier, place, ${cvars} } = v(bag, "copy")
\t\t\treturn r
\t\t\t\t.match(bag, { child, package: pkg, path, n, at, identifier, place, ${cvars} })
\t\t\t\t.find({ child, package: pkg, path, n, at, variable: identifier${key}, ${lfind}${group} })
\t\t})
\t)`;
  }

  return `\t.insert(
\t\t${rel},
\t\tquery(Learner).rule((r) => {
\t\t\tconst out = runOf(session)
\t\t\tconst attempt = gradableOf(session).bind(bySession(session))
\t\t\tconst { child, package: pkg, path, n, stage, at } = v(attempt, "attempt")
\t\t\tconst { identifier } = v(out.vars, "outcome")
\t\t\tconst { ${vmatch}${posv} } = v(out.${head}, "value")${nameSrc}
\t\t\treturn r
\t\t\t\t.match(attempt, { child, package: pkg, path, n, stage, at })
\t\t\t\t.match(out.vars, { child, package: pkg, path, stage, holds: "value", kind: "outcome", identifier, card: "${card}" })
\t\t\t\t.match(out.${head}, { child, package: pkg, path, stage, holds: "value", identifier, ${pos}${base}, ${vmatch} })${nameMatch}
\t\t\t\t.where(r.ne(identifier, "completionStatus"))
\t\t\t\t.find({ child, package: pkg, path, n, at, variable: identifier${key}, ${lfind}${group} })
\t\t})
\t)`;
};

/**
 * The rule writing a record outcome field's header, with its base type.
 *
 * @param t The base type.
 * @returns The rule.
 */
const recordHeaderMember = (t: BaseTypeName): string => {
  const { hasBase, head: flat } = HEAD[t];
  const head = FIELD_HEAD.get(flat) ?? "";
  const base = hasBase ? `, base: "${TOKEN[t]}"` : "";

  return `\t\t.rule((r) => {
\t\t\tconst out = runOf(session)
\t\t\tconst attempt = gradableOf(session).bind(bySession(session))
\t\t\tconst { child, package: pkg, path, n, stage, at } = v(attempt, "attempt")
\t\t\tconst { identifier } = v(out.vars, "outcome")
\t\t\tconst { field } = v(out.${head}, "value")
\t\t\treturn r
\t\t\t\t.match(attempt, { child, package: pkg, path, n, stage, at })
\t\t\t\t.match(out.vars, { child, package: pkg, path, stage, holds: "value", kind: "outcome", identifier, card: "record" })
\t\t\t\t.match(out.${head}, { child, package: pkg, path, stage, holds: "value", identifier, field${base} })
\t\t\t\t.find({ child, package: pkg, path, n, at, variable: identifier, field, baseType: BaseType.handle("${TOKEN[t]}") })
\t\t})`;
};

/**
 * The doc readers, gradeArgumentsOf's (`retained`) with an adaptive item's outcomes after its
 * previous attempt.
 *
 * @param retained Whether the readers are gradeArgumentsOf's.
 * @param fragment The generator's fragments.
 * @returns The readers.
 */
const valuesText = (retained: boolean, fragment: Fragments): string =>
  DOC_HEADS.flatMap((head) => {
    const rules = [
      ...valueRules(head),
      ...(head === "integers" ? [fragment("base/num-attempts")] : []),
      ...(head === "texts" ? [STATUS.replace(/^\n+/u, "")] : []),
      ...(retained ? retainedRules(head) : []),
    ];
    const what = retained
      ? "its snapshot's, its session's template values and an adaptive item's outcomes after its previous attempt"
      : "its snapshot's and its session's template values";

    return [
      `\n/** The attempt's values that cross as \`doc_${head}\` rows: ${what}. */`,
      `const ${camel(head)}Of = (session: GradedSession) =>\n\tquery(Installed)`,
      rules.join("\n"),
    ];
  }).join("\n");

/**
 * What a definition ends at: the next statement of the closure, a line at most one tab deep (the
 * pieces indent the closure's own statements by none or one) that starts one, or the closure's
 * closing brace.
 */
const NEXT_STATEMENT = /\n(?<tabs>\t*)(?=(?<next>\/\*\*|const |export |return |type |\}))/gu;

/**
 * The blank line before a reader's next statement, where its bound reader stands.
 */
const BLANK_BEFORE_STATEMENT = /\n\n(?=\t*(?:\/\*\*|const |export |return |type ))/gu;

/**
 * A reader or writer that now reads its key only through bound readers names its parameter
 * unread.
 *
 * @param region A builder's text, hoisted.
 * @returns The text with each unread parameter named so.
 */
const unreadSessions = (region: string): string => {
  const definitionEnd = (start: number): number => {
    const lineStart = lastIndexBefore(region, "\n", start) + 1;
    const indent = /^\t*/u.exec(region.slice(lineStart, start))?.[0].length ?? 0;
    const after = region.slice(start + 1);
    const next = matchesOf(after, NEXT_STATEMENT).find((match) => {
      const tabs = groupOf(match, "tabs").length;

      return tabs <= Math.max(indent, 1) && (groupOf(match, "next") !== "}" || tabs === 0);
    });

    return next === undefined ? region.length : start + 1 + next.index;
  };
  const pieces: string[] = [];
  let last = 0;
  for (const match of matchesOf(region, /const (?<reader>\w+) = \(session: GradedSession/gu)) {
    const reader = groupOf(match, "reader");
    if (reader !== "runOf") {
      const body = region.slice(endOf(match), definitionEnd(match.index));
      if (!/(?<!["\w])session(?!["\w])/u.test(body)) {
        pieces.push(`${region.slice(last, match.index)}const ${reader} = (_session: GradedSession`);
        last = endOf(match);
      }
    }
  }

  return pieces.join("") + region.slice(last);
};

/**
 * One exported builder's text with its readers hoisted.
 *
 * @param text The builder's text, to the next one's.
 * @returns The text hoisted.
 */
const hoistRegion = (text: string): string => {
  const name = groupOf(matchOf(text, /^export const (?<name>\w+)/u), "name");
  const session = "gradedSitting";
  const used = [
    ...new Set(
      matchesOf(text, /(?<reader>\w+)Of\(session\)\.bind\(bySession\(session\)\)/gu).map((match) =>
        groupOf(match, "reader"),
      ),
    ),
  ].toSorted(byCodeUnits);
  if (used.length === 0) {
    return text;
  }

  const defs = matchesOf(text, /const (?<reader>\w+)Of = \(_?session: GradedSession\) =>/gu).map(
    (match) => [groupOf(match, "reader"), match.index] as const,
  );
  const gradableLine = "\tconst gradableOf = (_session: GradedSession) => args.gradable\n";
  const at =
    name === "gradeAttemptOf"
      ? indexOf(text, gradableLine) + gradableLine.length
      : lastIndexOf(text, "\treturn {");
  // Each bound reader stands right after its reader's definition, which ends at the blank line
  // before the next statement of the closure; a reader reads only readers defined before it, so
  // each bound one is defined before use.
  const ends = new Map<string, number>();
  if (name === "gradeAttemptOf") {
    ends.set("gradable", at);
  } else {
    for (const [reader, start] of defs.filter(([defined]) => used.includes(defined))) {
      const blank = new RegExp(BLANK_BEFORE_STATEMENT.source, "gu");
      blank.lastIndex = start;
      const match = blank.exec(text);
      ends.set(reader, match !== null && match.index < at ? match.index + 1 : at);
    }
  }

  const inserts = used
    .map((reader) => {
      const end = ends.get(reader);
      must(end !== undefined, `${reader}Of's definition in ${name}`);

      return [
        end,
        `\tconst bound${capitalized(reader)} = ${reader}Of(${session}).bind(bySession(${session}))\n`,
      ] as const;
    })
    .toSorted(([a, lineA], [b, lineB]) => b - a || byCodeUnits(lineB, lineA));
  let region = text;
  for (const [pos, line] of inserts) {
    region = region.slice(0, pos) + line + region.slice(pos);
  }
  for (const reader of used) {
    region = replaceAll(
      region,
      `${reader}Of(session).bind(bySession(session))`,
      `bound${capitalized(reader)}`,
    );
  }
  const runHead = "const runOf = (session: GradedSession) =>";
  if (region.includes(runHead)) {
    const r0 = indexOf(region, runHead);
    const r1 = indexOf(region, "\t\t})\n", r0) + "\t\t})\n".length;
    const body = replaceAll(
      replaceAll(region.slice(r0, r1), runHead, "const run ="),
      "bySession(session)",
      `bySession(${session})`,
    );
    region = replaceAll(region.slice(0, r0) + body + region.slice(r1), "runOf(session)", "run");
  }

  return unreadSessions(region);
};

/**
 * Each reader a closure binds is bound once, and the run is one call: every rule that reads a
 * reader reads one query object, so grizzle builds each query once per program, where a call per
 * rule built a fresh tree of queries each time.
 *
 * @param text The statement's text.
 * @returns The text with its readers hoisted.
 */
export const hoist = (text: string): string => {
  const starts = matchesOf(text, /^export const \w+ = \(delivery: DeliveryLevel\) => \{$/gmu).map(
    (match) => match.index,
  );
  const [first] = starts;
  must(first !== undefined, "an exported builder");

  const parts = [text.slice(0, first)];
  for (const [i, a] of starts.entries()) {
    parts.push(hoistRegion(text.slice(a, starts[i + 1] ?? text.length)));
  }

  return parts.join("");
};

/**
 * The base stage's spellings of the levels a builder reads, each as every builder reads it, by
 * `delivery`.
 */
const DELIVERY_SPELLINGS = [
  ["query(Installed)", "query(delivery)"],
  ["query(Learner)", "query(delivery)"],
  ["ChangeSet.empty(Learner)", "ChangeSet.empty(delivery)"],
  ["mine.", "fields."],
] as const;

/**
 * The text with every builder reading `delivery`.
 *
 * @param text The text.
 * @returns The text over `delivery`.
 */
export const overDelivery = (text: string): string => {
  let over = text;
  for (const [from, to] of DELIVERY_SPELLINGS) {
    over = replaceAll(over, from, to);
  }

  return over;
};

/**
 * The base stage: grade.ts's text from the table and the fragments, before its first format.
 *
 * @param fragment The generator's fragments.
 * @returns The stage's text.
 */
export const baseStage = (fragment: Fragments): string => {
  const body = fragment("base/readers");
  const sitting = indented(fragment("base/sitting"), "\t");
  const readersReturn = fragment("base/readers-return");
  const latestFrom = indexOf(body, "/** Each item session of the sitting with an attempt");
  const latestTo = indexOf(body, "/** The subtree the item's response processing runs");
  const latest = replaceAll(
    body,
    body.slice(latestFrom, latestTo),
    fragment("base/latest-readers"),
  );
  const tables = [
    '/** Every relation the grading statement writes, by name: what a role that composes it inserts into. */\nexport const gradeAttemptTables = [\n\t"ProcessedAttempt",\n',
    ...CARDINALITIES.flatMap((cardinality) =>
      TYPES.map((t) => `\t"Snapshot${cardinality}${t}",\n`),
    ),
    '\t"SnapshotRecord",\n',
    ...TYPES.map((t) => `\t"SnapshotRecord${t}",\n`),
    fragment("base/grade-attempt-head"),
  ].join("");
  const graded = CARDINALITIES.flatMap((cardinality) => [
    `\n/** The run's ${cardinality.toLowerCase()} outcomes, one sidecar each. */`,
    `const graded${cardinality}s = (session: GradedSession) =>\n\tChangeSet.empty(Learner)`,
    TYPES.map((t) => outcomeMember(cardinality, t)).join("\n"),
  ]);
  const records = `
/** The run's record outcomes: each field's header with its base type, then its arm. */
const gradedRecords = (session: GradedSession) =>
\tChangeSet.empty(Learner)
\t.insert(
\t\tmine.SnapshotRecord,
\t\tquery(Learner)
${TYPES.map(recordHeaderMember).join("\n")}
\t)
${TYPES.map((t) => outcomeMember("Record", t)).join("\n")}`;
  const out = [
    fragment("base/pre-ledger-head"),
    fragment("base/grade-arguments-head"),
    sitting,
    gradedBody(body, fragment),
    valuesText(true, fragment),
    withRunInputs(readersReturn),
    fragment("base/attempt-arguments-head"),
    sitting,
    latest,
    valuesText(false, fragment),
    readersReturn,
    tables,
    sitting,
    fragment("base/post-head"),
    ...graded,
    records,
    fragment("base/post-tail"),
  ];

  return hoist(overDelivery(`${out.join("\n")}\n`));
};
