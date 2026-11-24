/**
 * What one call of each served program sends, read from the files `grizzle generate` wrote: a
 * login's served file (`served/<login>.json`) gives each program's statements in their largest
 * form, and the migrations' validate files (`NNNNNNNNNNNNNN_<name>/NN-validate.sql`) give each
 * commit-time judge block, armed for a program when a table its statements write is a table whose
 * delta the block reads. Both are read through the engine facades the grizzle checkout exports
 * (`internal/plan/serve.ts` servedFile, `internal/plan/migration.ts` splitStatements and lex), so
 * any composition that checkout generated reads here. grizzle's PLANBUDGET lane wrote this reading
 * as its standalone tool (`plan-budget.mjs`); this is that tool's reading, kept as it was.
 *
 * @module
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { lex } from "@bjornpagen/grizzle-engine/internal/plan/migration.ts";
import { servedFile } from "@bjornpagen/grizzle-engine/internal/plan/serve.ts";
import { Schema } from "effect";

/**
 * A served program, as its login's decoded served file holds it.
 */
type ServedMember = Extract<
  ReturnType<typeof servedFile>,
  { readonly ok: true }
>["value"]["roles"][number]["members"][number];

/**
 * A served file this grizzle cannot decode: the file is another grizzle's, or not one `grizzle
 * generate` wrote.
 */
export class ServedUnreadable extends Schema.TaggedError<ServedUnreadable>()("ServedUnreadable", {
  file: Schema.String,
  reason: Schema.String,
}) {
  /**
   * The file and why it was refused.
   */
  override get message(): string {
    return `The served file ${this.file} does not decode with this grizzle (${this.reason}): measure it with the grizzle checkout whose generate wrote it.`;
  }
}

/**
 * One statement a program sends: its prepared name (`grizzle_…`), or `assembled` for a single
 * statement whose text is every unit a call can send, as grizzle's runtime/write/parted.ts
 * assembles it; and its text.
 */
export interface SentStatement {
  readonly name: string;
  readonly sql: string;
}

/**
 * A commit-time judge block: the query of one `PERFORM 1 FROM (<query>) AS "found";` in a judge
 * function's body, planned as `SELECT 1 FROM (<query>) AS "found"`, the tables whose deltas it
 * reads (through reader functions, or as the session's temporary delta tables at grizzle pins
 * before the readers), and those temporary tables; named by its judge function and its place in the
 * function's body (`__judge_attempt_x4…#12`), so a measurement's every block is found again.
 */
export interface JudgeBlock {
  readonly name: string;
  readonly sql: string;
  readonly tables: ReadonlySet<string>;
  readonly deltas: ReadonlySet<string>;
}

/**
 * A step of a measured action: a statement planned by its generic plan request, or one run where it
 * stands, a statement with no plan (a carrier's `DO` stand-up, a `LOCK TABLE`), so the statements
 * after it plan against what it makes.
 */
export interface ActionStep {
  readonly kind: "plan" | "run";
  readonly source: "judge" | "statement";
  readonly name: string;
  readonly bytes: number;
  readonly sql: string;
}

/**
 * One program of one role of a login, as a call of it reaches the database: its statements, then
 * the judge blocks its writes arm; named `<login>.<role>.<program>`, with its login and role as the
 * served file names them, by which a check takes the roles it holds.
 */
export interface ServedAction {
  readonly action: string;
  readonly login: string;
  readonly role: string;
  readonly steps: readonly ActionStep[];
  readonly statements: number;
  readonly judges: number;
}

/**
 * A unit of a parted statement as the served file holds it: its CTEs' text cut at its placeholders,
 * its parameters, and its arm (a part) or arms (an always unit).
 */
interface ServedUnit {
  readonly kind: "always" | "part";
  readonly ctes: {
    readonly head: string;
    readonly holes: readonly { readonly hole: number; readonly after: string }[];
  };
  readonly params: readonly object[];
  readonly arm?: string;
  readonly arms?: readonly string[];
}

/**
 * A record of the served file's own, neither a list, a map nor a set, whose members the walk reads
 * by name and goes on into.
 */
interface ServedRecord {
  readonly [member: string]: ServedNode;
}

/**
 * Any value of a decoded served file, as the walk meets it: a record, a list, a map or a set of
 * further values, or a scalar the walk passes over.
 */
type ServedNode =
  | ReadonlyMap<ServedNode, ServedNode>
  | ReadonlySet<ServedNode>
  | ServedRecord
  | bigint
  | boolean
  | number
  | readonly ServedNode[]
  | string
  | null
  | undefined;

/**
 * Whether a program is a value the walk reads: every program of a decoded served file is, a record
 * of records, lists, maps, sets and scalars.
 *
 * @param member - A program of the decoded file.
 * @returns True for every program of the file.
 */
const isNode = (member: ServedMember): member is ServedMember & ServedRecord =>
  typeof member === "object";

/**
 * Whether a value is a list of further values.
 *
 * @param value - A value of the decoded file.
 * @returns True for a list.
 */
const isList = (value: ServedNode): value is readonly ServedNode[] => Array.isArray(value);

/**
 * Whether a value is a map or a set of further values.
 *
 * @param value - A value of the decoded file.
 * @returns True for a map or a set.
 */
const isCollection = (
  value: ServedNode,
): value is ReadonlyMap<ServedNode, ServedNode> | ReadonlySet<ServedNode> =>
  value instanceof Map || value instanceof Set;

/**
 * Whether a value is a record of the served file's own, neither a list, a map nor a set.
 *
 * @param value - Any value of the decoded file.
 * @returns True for a plain record.
 */
const isRecord = (value: unknown): value is ServedRecord =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Map) &&
  !(value instanceof Set);

/**
 * Whether a value is a parted statement's unit.
 *
 * @param value - Any value of the decoded file.
 * @returns True for a unit.
 */
const isUnit = (value: unknown): value is ServedUnit =>
  isRecord(value) &&
  (value["kind"] === "part" || value["kind"] === "always") &&
  isRecord(value["ctes"]) &&
  typeof value["ctes"]["head"] === "string" &&
  Array.isArray(value["params"]);

/**
 * Whether a value is a list of units.
 *
 * @param value - Any value of the decoded file.
 * @returns True for a non-empty list of units.
 */
const isUnits = (value: unknown): value is readonly ServedUnit[] =>
  Array.isArray(value) && value.length > 0 && value.every((unit) => isUnit(unit));

/**
 * Whether a value is a named statement: a `grizzle_…` name and its text.
 *
 * @param value - Any value of the decoded file.
 * @returns True for a named text.
 */
const isNamedText = (value: unknown): value is SentStatement =>
  isRecord(value) &&
  typeof value["name"] === "string" &&
  value["name"].startsWith("grizzle_") &&
  typeof value["sql"] === "string";

/**
 * A unit's CTE text with its placeholders numbered after the units sent before it
 * (runtime/write/parted.ts).
 *
 * @param unit - The unit.
 * @param before - The parameters the units before it take.
 * @returns Its text.
 */
const placed = (unit: ServedUnit, before: number): string => {
  let text = unit.ctes.head;

  for (const { after, hole } of unit.ctes.holes) {
    text += `$${String(before + hole + 1)}${after}`;
  }

  return text;
};

/**
 * A single statement's whole text, every unit sent, as grizzle assembles it
 * (runtime/write/parted.ts assembled).
 *
 * @param units - Its units, in their order.
 * @returns The text.
 */
const assembledText = (units: readonly ServedUnit[]): string => {
  const ctes: string[] = [];
  const arms: string[] = [];
  let params = 0;

  for (const unit of units) {
    ctes.push(placed(unit, params));
    params += unit.params.length;
    arms.push(...(unit.kind === "part" && unit.arm !== undefined ? [unit.arm] : (unit.arms ?? [])));
  }

  return `WITH ${ctes.join(",\n")}\n${arms.join("\nUNION ALL\n")}`;
};

/**
 * Every statement a served program sends, in its largest form: each named text its form holds, and
 * each single statement's whole text, each once, in the order a depth-first walk meets them.
 *
 * @param member - The decoded member.
 * @returns Its statements.
 */
const statementsIn = (member: ServedMember): readonly SentStatement[] => {
  const found = new Map<string, SentStatement>();
  const stack: ServedNode[] = isNode(member) ? [member] : [];

  while (stack.length > 0) {
    const value = stack.pop();

    if (isCollection(value)) {
      stack.push(...[...value.values()].toReversed());
    } else if (isUnits(value)) {
      const sql = assembledText(value);

      found.set(sql, { name: "assembled", sql });
    } else if (isList(value)) {
      stack.push(...value.toReversed());
    } else if (isNamedText(value)) {
      found.set(value.sql, { name: value.name, sql: value.sql });
    } else if (isRecord(value)) {
      const { units } = value;

      if (isUnits(units)) {
        const sql = assembledText(units);

        found.set(sql, { name: "assembled", sql });
      } else {
        stack.push(...Object.values(value).toReversed());
      }
    }
  }

  return [...found.values()];
};

/**
 * The statements that plan: every other head (a `DO` block, a `LOCK`) is run where it stands.
 */
const plannable: ReadonlySet<string> = new Set([
  "DELETE",
  "INSERT",
  "MERGE",
  "SELECT",
  "TABLE",
  "UPDATE",
  "VALUES",
  "WITH",
]);

/**
 * A statement's first word, upper-cased, by grizzle's own lexer.
 *
 * @param sql - The statement.
 * @returns Its head, or nothing.
 */
const headWord = (sql: string): string => {
  const [first] = lex(sql).tokens;

  return first?.kind === "word" ? first.upper : "";
};

/**
 * The tables a program's statements write: each INSERT INTO, UPDATE and DELETE FROM target, by its
 * own name.
 *
 * @param statements - The program's statements.
 * @returns Their targets' names.
 */
const writtenBy = (statements: readonly SentStatement[]): ReadonlySet<string> =>
  new Set(
    statements.flatMap(({ sql }) =>
      [...sql.matchAll(/(?:INSERT INTO|UPDATE|DELETE FROM) "[^"]+"\."(?<table>[^"]+)"/gu)].map(
        (match) => match.groups?.["table"] ?? "",
      ),
    ),
  );

/**
 * The judge blocks one judge function's body holds: each `PERFORM 1 FROM (<query>) AS "found";`
 * (grizzle physical/ddl/rules.ts whenFound), the block's query with the tables whose deltas its
 * readers (`__reader_news_<table>_<digest>`, `__reader_olds_…`) read. The body is the installed
 * one, `pg_proc.prosrc`, so however the migration quoted it (a dollar quote, or the run of escaped
 * string literals grizzle writes for a body past a size) it reads the same.
 *
 * @param judge - The judge function's name.
 * @param body - Its body.
 * @returns Its blocks.
 */
export const judgeBlocksOf = (judge: string, body: string): readonly JudgeBlock[] => {
  const { tokens } = lex(body);
  const blocks: JudgeBlock[] = [];

  for (let at = 0; at < tokens.length; at += 1) {
    const head = tokens[at];
    const from = tokens[at + 1];
    const keyword = tokens[at + 2];

    if (
      head?.kind === "word" &&
      head.upper === "PERFORM" &&
      from?.kind === "number" &&
      keyword?.kind === "word" &&
      keyword.upper === "FROM"
    ) {
      let depth = 0;
      let end = at + 1;

      for (
        let next = tokens[end];
        next !== undefined && !(depth === 0 && next.kind === "punct" && next.text === ";");
        next = tokens[end]
      ) {
        if (next.kind === "punct" && next.text === "(") {
          depth += 1;
        } else if (next.kind === "punct" && next.text === ")") {
          depth -= 1;
        }

        end += 1;
      }

      const sql = `SELECT ${body.slice(from.start, tokens[end]?.start ?? body.length).trimEnd()}`;
      const tables = new Set(
        [
          ...sql.matchAll(/__(?:reader|delta)_(?:news|olds)_(?<table>[a-z0-9_]+)_[a-z0-9]{10}"/gu),
        ].map((match) => match.groups?.["table"] ?? ""),
      );
      const deltas = new Set(
        [...sql.matchAll(/"pg_temp"\."(?<delta>__delta_(?:news|olds)_[a-z0-9_]+)"/gu)].map(
          (match) => match.groups?.["delta"] ?? "",
        ),
      );

      blocks.push({ deltas, name: `${judge}#${String(blocks.length)}`, sql, tables });
      at = end;
    }
  }

  return blocks;
};

/**
 * The delta tables a capture function's body creates, each by its name with the statement that
 * creates it: where a judge block reads a delta as a session's temporary table
 * (`"pg_temp"."__delta_news_<table>_<digest>"`) rather than through a reader function, which a
 * session has only after it wrote the table, the measurement creates it first, as the write's
 * capture trigger would.
 *
 * @param body - A capture function's body.
 * @returns Its delta tables' statements, by name.
 */
export const deltaTablesOf = (body: string): ReadonlyMap<string, string> =>
  new Map(
    [
      ...body.matchAll(
        /CREATE TEMPORARY TABLE "pg_temp"\."(?<delta>__delta_(?:news|olds)_[a-z0-9_]+)" \((?<columns>[^;]*?)\)(?<tail> ON COMMIT [A-Z ]+)?;/gu,
      ),
    ].map((match) => [match.groups?.["delta"] ?? "", match[0]]),
  );

/**
 * The installed capture functions' bodies, which create the delta tables a write's judge reads.
 */
export const captureBodiesQuery = `SELECT p.prosrc AS body FROM pg_catalog.pg_proc AS p WHERE p.proname LIKE '\\_\\_capture\\_%' AND p.prosrc LIKE '%CREATE TEMPORARY TABLE "pg_temp"."__delta_%' ORDER BY p.oid`;

/**
 * The installed judge functions' bodies: every `__judge_<table>_<digest>` function of the
 * installation, the parts its commit-time dispatcher runs where their deltas hold rows.
 */
export const judgeBodiesQuery = `SELECT p.proname AS name, p.prosrc AS body FROM pg_catalog.pg_proc AS p WHERE p.proname LIKE '\\_\\_judge\\_%' AND p.prosrc LIKE '%PERFORM 1 FROM%' ORDER BY p.oid`;

/**
 * The logins a migrations directory serves: each `served/<login>.json`.
 *
 * @param migrations - The schema's migrations directory.
 * @returns The logins' names.
 */
export const loginsIn = (migrations: string): readonly string[] =>
  readdirSync(path.join(migrations, "served"))
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -".json".length))
    .toSorted();

/**
 * Every action of a login: each program of each of its roles, its statements and the judge blocks
 * its writes arm.
 *
 * @param migrations - The schema's migrations directory.
 * @param login - The login, by its served file's name.
 * @param judges - The installation's judge blocks ({@link judgeBlocksOf}).
 * @param deltaTables - The installation's temporary delta tables ({@link deltaTablesOf}).
 * @returns The actions, in the file's order; a file this grizzle cannot decode fails as
 *   {@link ServedUnreadable}.
 */
export const actionsOf = (
  migrations: string,
  login: string,
  judges: readonly JudgeBlock[],
  deltaTables: ReadonlyMap<string, string>,
): readonly ServedAction[] => {
  const file = path.join(migrations, "served", `${login}.json`);
  const decoded = servedFile(JSON.parse(readFileSync(file, "utf-8")));

  if (!decoded.ok) {
    throw new ServedUnreadable({ file, reason: JSON.stringify(decoded.error).slice(0, 300) });
  }

  return decoded.value.roles.flatMap((role) =>
    role.members.map((member) => {
      const statements = statementsIn(member);
      const written = writtenBy(statements);
      const armed = judges.filter(({ tables }) => [...tables].some((table) => written.has(table)));
      const deltas = [...new Set(armed.flatMap((block) => [...block.deltas]))].flatMap((delta) => {
        const create = deltaTables.get(delta);

        return create === undefined ? [] : [create];
      });

      return {
        action: `${login}.${role.name}.${member.name}`,
        judges: armed.length,
        login,
        role: role.name,
        statements: statements.length,
        steps: [
          ...statements.map(({ name, sql }): ActionStep => ({
            bytes: Buffer.byteLength(sql),
            kind: plannable.has(headWord(sql)) ? "plan" : "run",
            name,
            source: "statement",
            sql,
          })),
          ...deltas.map((sql): ActionStep => ({
            bytes: Buffer.byteLength(sql),
            kind: "run",
            name: "delta table",
            source: "judge",
            sql,
          })),
          ...armed.map(({ name, sql }): ActionStep => ({
            bytes: Buffer.byteLength(sql),
            kind: "plan",
            name,
            source: "judge",
            sql,
          })),
        ],
      };
    }),
  );
};
