import { regex } from "arkregex";
import path from "node:path";
import { schemaNameOf } from "@bjornpagen/grizzle";
import { Array as Arr, Effect, FileSystem } from "effect";
import { QtiBase } from "#pantry/qti/base.ts";

/**
 * The folder of the Qti schema's committed migrations, one subfolder per migration: grizzle names
 * an installation's migrations folder by its root's PostgreSQL schema, the stored level's (README,
 * "Levels").
 */
export const qtiMigrations = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "migrations",
  schemaNameOf(QtiBase),
);

/**
 * One SQL file of a migration: the migration's folder name, the file's name, and its text.
 */
export interface MigrationFile {
  readonly file: string;
  readonly folder: string;
  readonly sql: string;
}

/**
 * The family of a residual law, read from its name: a reverse `alternatives` side, a
 * selected-source containment (`…_in_…`), a capacity, a conditional mirror, or none of these.
 */
export type LawFamily = "alternatives" | "capacity" | "mirror" | "other" | "selectedSource";

/**
 * The kind of an installed function: a law's trigger function; a roster's live-codes constant, the
 * bits of its live handles, which its domain's CHECK and its sets' domain's CHECK read, one per
 * roster since grizzle `503d4bd03` (no arguments, a `bit varying`, `…_live_…`); a
 * closed side's constant (no arguments, a `bit varying`); a roster's names constant (no arguments,
 * a `name[]`); a closed relation's payload of open-typed values (no arguments, any other array); a
 * roster's decode function (`<roster>_name`, a `text`); or another, which today is grizzle's own
 * runtime.
 */
export type FunctionKind = "constant" | "decode" | "law" | "live" | "names" | "other" | "payload";

/**
 * What a schema's migrations create, counted from their SQL: the objects each representation
 * choice costs.
 *
 * The counts add up the `CREATE` and `INSERT` statements of every migration, so they describe the
 * installed schema while every migration only adds, which holds for one `_init` folder. Statements
 * are read as grizzle prints them: one per line start, in `Qti`'s schema, but a function's head,
 * which a `DO` block's `EXECUTE` may hold, and an `INSERT INTO`, counted wherever it stands outside
 * a dollar-quoted body: a function's own INSERTs (a statement trigger's capture of its transition
 * rows) are its work when it runs, no data step of the migration.
 */
export interface Census {
  readonly domains: {
    /**
     * The `bit(n)` domains, one per roster whose sets a field holds.
     */
    readonly bits: number;
    /**
     * The domains whose definition holds a CHECK of its own. A parameter's pattern domain over
     * a stored field's `__text_…` domain holds none, by grizzle's design (d74bbf7b), so that a
     * refused value names the parameter; two parameters of one pattern repeat its definition.
     */
    readonly checked: number;
    /**
     * Distinct definitions of the {@link checked} domains, with the constraint's name left out.
     */
    readonly distinct: number;
    /**
     * UTF-8 bytes of the {@link checked} domains' definitions that repeat one printed before them.
     */
    readonly repeatedBytes: number;
    readonly total: number;
  };
  readonly enums: number;
  readonly foreignKeys: {
    /**
     * The keys over a family's hidden columns (`__pred_…`, `__copy_…`, `__index_…`,
     * `__predecessor_…`, `__before_…`, `__after_…`), each family's axes, by the table that holds
     * them.
     */
    readonly axes: Readonly<Record<string, number>>;
    /**
     * The keys each table holds, by its SQL name.
     */
    readonly byTable: Readonly<Record<string, number>>;
    /**
     * Keys over more than one column.
     */
    readonly composite: number;
    readonly total: number;
    /**
     * The most columns one key spans, 0 with no key.
     */
    readonly widest: number;
  };
  /**
   * The installed functions of each kind.
   */
  readonly functions: Readonly<Record<FunctionKind, number>>;
  readonly laws: {
    /**
     * The residual laws of each family.
     */
    readonly byFamily: Readonly<Record<LawFamily, number>>;
    readonly constraintTriggers: number;
    /**
     * The residual laws, one per `-- Validate law` header.
     */
    readonly total: number;
    /**
     * The `-validate.sql` files, one per law.
     */
    readonly validateFiles: number;
  };
  readonly policies: {
    /**
     * Policies that are `USING (true) WITH CHECK (true)`, which narrow nothing.
     */
    readonly alwaysTrue: number;
    readonly total: number;
  };
  readonly seed: {
    /**
     * The `(parent, child)` pairs `admission` lists.
     */
    readonly admission: { readonly pairs: number };
    /**
     * The migration folders that are a seed (`…_seed`).
     */
    readonly folders: number;
    /**
     * Every `INSERT INTO` a migration runs: wherever its text holds one outside a function's body,
     * but a stored derived relation's fill, which inserts its definition's rows into the table
     * grizzle creates for it, no data step's.
     */
    readonly inserts: number;
    /**
     * The rows inserted into each relation, keyed by its SQL name.
     */
    readonly rows: Readonly<Record<string, number>>;
  };
  readonly tables: {
    /**
     * The tables with each number of columns, as `CREATE TABLE` declares them.
     */
    readonly byColumns: Readonly<Record<number, number>>;
    /**
     * `declared_*` marker tables.
     */
    readonly declaredMarkers: number;
    /**
     * `*_lexical` and `*_spelling` tables.
     */
    readonly lexicalOrSpelling: number;
    /**
     * Two-column tables with a `value` column: an optional value of its owner.
     */
    readonly optionalValues: number;
    /**
     * The schema's tables; grizzle's own `__`-prefixed bookkeeping table is not one.
     */
    readonly total: number;
  };
  readonly uniques: {
    /**
     * Unique constraints whose columns strictly contain another unique's of the same table.
     */
    readonly superkeys: number;
    /**
     * Primary keys and unique constraints declared in `CREATE TABLE`.
     */
    readonly total: number;
  };
  readonly views: number;
}

/**
 * The PostgreSQL schema grizzle installs `Qti`'s tables, domains and functions in, its stored
 * level's (`#pantry/qti/base.ts`), as its printed SQL quotes it, escaped for a pattern.
 *
 * @see https://github.com/bjornpagen/grizzle/blob/1685e15c8f245dace46ddf6a75765dd2e060b218/packages/engine/src/program/names.ts#L78-L100
 */
const installed = `"${RegExp.escape(schemaNameOf(QtiBase))}"`;

/**
 * A `CREATE TABLE` in `Qti`'s schema with a column list: its name and the body between its
 * parentheses, one column or constraint to a line, from the line after `(` to the line `);`.
 *
 * GRIZZLE-PENDING: Q10. The census reads the migration's SQL by pattern; the installation map
 * would give the tables, keys, functions and laws as data.
 *
 * The opening `(` ends its line. That leaves out a `CREATE TABLE … ("secret") AS SELECT …`, the
 * installation's live secret, whose parenthesis is a name list on the statement's one line and
 * whose `;` ends that line: no `\n);` closes it, so a body read from its `(` would run on past the
 * statement, over every later statement of the joined migrations, to the next `\n);` or the end of
 * the text, some 8.4 million characters. Each one is a step V8's regular expression engine keeps
 * to back out of, and past about 8.39 million of them it runs out of its backtracking stack
 * (`RangeError: Maximum call stack size exceeded`).
 */
const tablePattern = regex.as(
  String.raw`^CREATE TABLE ${installed}\."(?<name>[a-z0-9_]+)" \(\n(?<body>[\s\S]*?)\n\);`,
  "gmu",
);

/**
 * A column line of a table's body.
 */
const columnPattern = regex('^\\s+"(?<column>[a-z0-9_]+)" ', "gmu");

/**
 * A primary key or unique constraint of a table's body, with its column list.
 */
const uniquePattern = regex("(?:PRIMARY KEY|UNIQUE) \\((?<columns>[^)]*)\\)", "gu");

/**
 * A named foreign key, with its referencing column list.
 */
const foreignKeyPattern = regex('CONSTRAINT "[^"]+" FOREIGN KEY \\((?<columns>[^)]*)\\)', "gu");

/**
 * A foreign key added to a table of `Qti`'s schema, with the table and its referencing column list.
 */
const addedForeignKeyPattern = regex.as(
  String.raw`^ALTER TABLE ${installed}\."(?<table>[a-z0-9_]+)" ADD CONSTRAINT "[^"]+" FOREIGN KEY \((?<columns>[^)]*)\)`,
  "gmu",
);

/**
 * A family's hidden column, which grizzle fills on every write: its axes' keys hold one.
 */
const familyColumnPattern = regex('"__(?:pred|copy|index|predecessor|before|after)_', "u");

/**
 * The header line grizzle opens each validate file with, naming its law.
 */
const lawPattern = regex("^-- Validate law (?<law>__[a-z0-9_]+):", "gmu");

/**
 * The name patterns of the law families, tried in order; a law matching none is `other`.
 */
const lawFamilies: readonly (readonly [LawFamily, RegExp])[] = [
  ["alternatives", regex("_alternatives_", "u")],
  ["selectedSource", regex("_in_", "u")],
  ["capacity", regex("capacity|_within_|_count_", "u")],
  ["mirror", regex("mirror", "u")],
];

/**
 * A function's head: its name, its parameter list, and its return type up to the first clause that
 * follows it. A head is read wherever it stands, since a closed relation's constant is created by
 * an `EXECUTE` inside the `DO` block that packs it.
 */
const functionPattern = regex.as(
  String.raw`(?<![\w"])CREATE (?:OR REPLACE )?FUNCTION ${installed}\."(?<name>[^"]+)"\((?<parameters>[^)]*)\) RETURNS (?<returns>.+?)(?=\s+(?:AS|BEGIN|IMMUTABLE|LANGUAGE|PARALLEL|RETURN|SECURITY|SET|STABLE|STRICT|VOLATILE)\b|$)`,
  "gmu",
);

/**
 * A function a later migration drops, by name. Its name is a hash of its body, so a changed body is
 * a new function and the old one is dropped; the chain holds the new one only.
 */
const droppedFunctionPattern = regex.as(
  String.raw`^DROP FUNCTION ${installed}\."(?<name>[^"]+)"`,
  "gmu",
);

/**
 * A function's head, with its return type unqualified and unquoted (`"pg_catalog"."trigger"` reads
 * `trigger`).
 */
interface FunctionHead {
  readonly name: string;
  readonly parameters: string;
  readonly returns: string;
}

/**
 * The tests of the function kinds, tried in order; a function passing none is `other`.
 *
 * Erasure installs a closed side as a zero-argument IMMUTABLE function returning its cells as a
 * `bit varying` (PostgreSQL also spells it `varbit`), and a roster's names as a zero-argument
 * `name[]` that its `<roster>_name(int2)` decode function subscripts.
 */
const functionKinds: readonly (readonly [FunctionKind, (head: FunctionHead) => boolean])[] = [
  ["law", (head) => head.name.startsWith("__law_")],
  [
    "live",
    (head) =>
      head.parameters === "" &&
      head.name.includes("_live_") &&
      (head.returns === "bit varying" || head.returns === "varbit"),
  ],
  [
    "constant",
    (head) =>
      head.parameters === "" && (head.returns === "bit varying" || head.returns === "varbit"),
  ],
  ["names", (head) => head.parameters === "" && head.returns === "name[]"],
  ["payload", (head) => head.parameters === "" && head.returns.endsWith("[]")],
  ["decode", (head) => head.name.endsWith("_name") && head.returns === "text"],
];

/**
 * A one-line `CREATE DOMAIN` in `Qti`'s schema, with its definition after `AS`.
 */
const domainPattern = regex.as(
  String.raw`^CREATE DOMAIN ${installed}\."[a-z0-9_]+" AS (?<definition>.*)$`,
  "gmu",
);

/**
 * A domain definition's CHECK, which a domain over another domain alone does not hold.
 */
const checkPattern = regex("\\bCHECK \\(", "u");

/**
 * A `CREATE TYPE … AS ENUM` in `Qti`'s schema.
 */
const enumPattern = regex.as(String.raw`^CREATE TYPE ${installed}\."[^"]+" AS ENUM `, "gmu");

/**
 * A `CREATE POLICY` statement, up to its terminating semicolon.
 */
const policyPattern = regex("^CREATE POLICY [^;]*;", "gmu");

/**
 * A one-line `INSERT … VALUES` into a relation of `Qti`'s schema, with the relation's name and the
 * value list.
 */
const insertPattern = regex.as(
  String.raw`^INSERT INTO ${installed}\."(?<relation>[a-z0-9_]+)" \([^)]*\) VALUES (?<values>.*);$`,
  "gmu",
);

/**
 * An `admission` row as the seed prints it, among the others of its value list: parent kind, child
 * kind.
 */
const admissionPattern = regex.as(
  String.raw`\('(?<parent>[^']*)'::${installed}\."node_kind", '(?<child>[^']*)'::${installed}\."node_kind"\)`,
  "gu",
);

/**
 * Count the matches of `pattern` in `sql`.
 *
 * @param sql - The text to search.
 * @param pattern - A global pattern.
 * @returns How many times it matches.
 */
const occurrences = (sql: string, pattern: RegExp): number => [...sql.matchAll(pattern)].length;

/**
 * A dollar-quoted string, `$$…$$` or `$tag$…$tag$`: a function's body, which PostgreSQL stores and
 * runs only when the function is called.
 */
const dollarQuoted = regex("\\$(?<tag>[A-Za-z_][A-Za-z0-9_]*)?\\$[\\s\\S]*?\\$\\k<tag>\\$", "gu");

/**
 * A function's body as an escape string constant, `AS E'…'`, each line after it a constant of its
 * own, which PostgreSQL joins to it across the newline between them: the form grizzle writes a
 * body in where a dollar quote cannot hold its text.
 */
const quotedBody = regex.as(
  "\\bAS E'(?:[^'\\\\]|\\\\[\\s\\S]|'')*'(?:\\n'(?:[^'\\\\]|\\\\[\\s\\S]|'')*')*",
  "gu",
);

/**
 * A migration's text with every function's body taken out, so what remains is what it runs.
 *
 * @param sql - The text.
 * @returns The text outside its functions' bodies.
 */
const outsideBodies = (sql: string): string =>
  sql.replaceAll(dollarQuoted, "$$$$").replaceAll(quotedBody, "AS ''");

/**
 * A stored derived relation's table as grizzle creates it, `AS` its definition `WITH NO DATA`, by
 * its schema-qualified name.
 */
const storedTablePattern = regex(
  '^CREATE TABLE (?<table>"[a-z0-9_]+"\\."[a-z0-9_]+") \\([^)]*\\) AS$',
  "gmu",
);

/**
 * An `INSERT INTO` a schema-qualified table, by the table.
 */
const insertIntoPattern = regex(
  '\\bINSERT\\s+INTO\\s+(?<table>"[a-z0-9_]+"\\."[a-z0-9_]+")',
  "giu",
);

/**
 * Count the `INSERT INTO`s a migration runs that are no stored derived relation's fill.
 *
 * @param sql - Every migration's text, joined.
 * @returns How many it runs.
 */
const dataInserts = (sql: string): number => {
  const run = outsideBodies(sql);
  const stored = new Set(run.matchAll(storedTablePattern).map(({ groups }) => groups?.["table"]));
  const fills = run
    .matchAll(insertIntoPattern)
    .filter(({ groups }) => stored.has(groups?.["table"]))
    .toArray().length;

  return occurrences(run, regex("\\bINSERT\\s+INTO\\b", "giu")) - fills;
};

/**
 * Count the members of `values` equal to `value`.
 *
 * @param values - The values to count among.
 * @param value - The value to count.
 * @returns How many members equal it.
 */
const tally = <T>(values: readonly T[], value: T): number =>
  values.filter((candidate) => candidate === value).length;

/**
 * Count each distinct value's members, keyed and ordered by the value.
 *
 * @param values - The values.
 * @returns How many members each value has, its keys sorted.
 */
const tallyBy = (values: readonly string[]): Readonly<Record<string, number>> => {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Object.fromEntries([...counts].toSorted(([a], [b]) => (a < b ? -1 : 1)));
};

/**
 * Split an `INSERT`'s value list into its row tuples.
 *
 * A parenthesis inside a string literal does not count: a quote toggles the literal, so a doubled
 * quote, SQL's escape for one, leaves it open.
 *
 * @param values - The text after `VALUES`, without the terminating semicolon.
 * @returns Each top-level parenthesized tuple, parentheses included, in order.
 */
const tuplesIn = (values: string): readonly string[] => {
  const tuples: string[] = [];
  let depth = 0;
  let quoted = false;
  let start = 0;

  for (const { 0: mark, index } of values.matchAll(regex("['()]", "gu"))) {
    if (mark === "'") {
      quoted = !quoted;
    } else if (!quoted && mark === "(") {
      if (depth === 0) {
        start = index;
      }

      depth += 1;
    } else if (!quoted) {
      depth -= 1;

      if (depth === 0) {
        tuples.push(values.slice(start, index + 1));
      }
    }
  }

  return tuples;
};

/**
 * Count the tables of the schema in `sql`: by column count, by the shapes that only carry another
 * table's markers or values, and their unique constraints.
 *
 * @param sql - Every migration's text, joined.
 * @returns The table and unique counts of the census.
 */
const countTables = (sql: string): Pick<Census, "tables" | "uniques"> => {
  const tables = sql
    .matchAll(tablePattern)
    .map(({ groups }) => ({ body: groups?.["body"] ?? "", name: groups?.["name"] ?? "" }))
    .filter((table) => !table.name.startsWith("__"))
    .map((table) => ({
      columns: [...table.body.matchAll(columnPattern)].map(
        ({ groups }) => groups?.["column"] ?? "",
      ),
      name: table.name,
      uniques: [...table.body.matchAll(uniquePattern)].map(({ groups }) =>
        (groups?.["columns"] ?? "").replaceAll('"', "").split(", "),
      ),
    }))
    .toArray();
  const byColumns = new Map<number, number>();

  for (const table of tables) {
    byColumns.set(table.columns.length, (byColumns.get(table.columns.length) ?? 0) + 1);
  }

  const superkeys = tables.flatMap((table) =>
    table.uniques.filter((unique) =>
      table.uniques.some(
        (other) =>
          other !== unique &&
          other.length < unique.length &&
          other.every((column) => unique.includes(column)),
      ),
    ),
  );

  return {
    tables: {
      byColumns: Object.fromEntries([...byColumns].toSorted(([a], [b]) => a - b)),
      declaredMarkers: tables.filter((table) => table.name.startsWith("declared_")).length,
      lexicalOrSpelling: tables.filter((table) =>
        regex("(?:lexical|spelling)$", "u").test(table.name),
      ).length,
      optionalValues: tables.filter(
        (table) => table.columns.length === 2 && table.columns.includes("value"),
      ).length,
      total: tables.length,
    },
    uniques: {
      superkeys: superkeys.length,
      total: tables.flatMap((table) => table.uniques).length,
    },
  };
};

/**
 * Count the rows each `INSERT` adds, and the `(parent, child)` pairs of `admission`'s rows.
 *
 * @param sql - Every migration's text, joined.
 * @returns The insert and row counts of the census's seed part.
 */
const countRows = (sql: string): Omit<Census["seed"], "folders"> => {
  const rows = new Map<string, number>();
  const pairs = new Set<string>();

  for (const { groups } of sql.matchAll(insertPattern)) {
    const relation = groups?.["relation"] ?? "";
    const values = groups?.["values"] ?? "";

    rows.set(relation, (rows.get(relation) ?? 0) + tuplesIn(values).length);

    if (relation === "admission") {
      for (const { groups: admitted } of values.matchAll(admissionPattern)) {
        pairs.add(`${admitted?.["parent"] ?? ""} ${admitted?.["child"] ?? ""}`);
      }
    }
  }

  return {
    admission: { pairs: pairs.size },
    inserts: dataInserts(sql),
    rows: Object.fromEntries([...rows].toSorted(([a], [b]) => (a < b ? -1 : 1))),
  };
};

/**
 * Take the census of a schema's migrations.
 *
 * @param files - Every SQL file of every migration folder.
 * @returns What those migrations create.
 */
export const census = (files: readonly MigrationFile[]): Census => {
  const sql = files.map((file) => file.sql).join("\n");
  const laws = [...sql.matchAll(lawPattern)].map(({ groups }) => groups?.["law"] ?? "");
  const families = laws.map(
    (law) => lawFamilies.find(([, pattern]) => pattern.test(law))?.[0] ?? "other",
  );
  const dropped = new Set(
    [...sql.matchAll(droppedFunctionPattern)].map(({ groups }) => groups?.["name"] ?? ""),
  );
  const kinds = sql
    .matchAll(functionPattern)
    .filter(({ groups }) => !dropped.has(groups?.["name"] ?? ""))
    .map(({ groups }) => ({
      name: groups?.["name"] ?? "",
      parameters: groups?.["parameters"] ?? "",
      returns: (groups?.["returns"] ?? "").replaceAll('"pg_catalog".', "").replaceAll('"', ""),
    }))
    .map((head) => functionKinds.find(([, test]) => test(head))?.[0] ?? "other")
    .toArray();
  const definitions = [...sql.matchAll(domainPattern)].map(({ groups }) =>
    (groups?.["definition"] ?? "").replaceAll(regex('CONSTRAINT "[^"]*"', "gu"), ""),
  );
  const checked = definitions.filter((definition) => checkPattern.test(definition));
  const firsts = new Set(checked);
  const encoder = new TextEncoder();
  const keys = [...sql.matchAll(foreignKeyPattern)].map(
    ({ groups }) => (groups?.["columns"] ?? "").split(",").length,
  );
  const added = [...sql.matchAll(addedForeignKeyPattern)].map(({ groups }) => ({
    columns: groups?.["columns"] ?? "",
    table: groups?.["table"] ?? "",
  }));
  const policies = [...sql.matchAll(policyPattern)].map(([statement]) => statement);

  return {
    domains: {
      bits: definitions.filter((definition) => definition.startsWith("bit(")).length,
      checked: checked.length,
      distinct: firsts.size,
      repeatedBytes:
        encoder.encode(checked.join("")).length - encoder.encode([...firsts].join("")).length,
      total: definitions.length,
    },
    enums: occurrences(sql, enumPattern),
    foreignKeys: {
      axes: tallyBy(
        added
          .values()
          .filter(({ columns }) => familyColumnPattern.test(columns))
          .map(({ table }) => table)
          .toArray(),
      ),
      byTable: tallyBy(added.map(({ table }) => table)),
      composite: keys.filter((columns) => columns > 1).length,
      total: keys.length,
      widest: Arr.reduce(keys, 0, (most, each) => Math.max(most, each)),
    },
    functions: {
      constant: tally(kinds, "constant"),
      decode: tally(kinds, "decode"),
      law: tally(kinds, "law"),
      live: tally(kinds, "live"),
      names: tally(kinds, "names"),
      other: tally(kinds, "other"),
      payload: tally(kinds, "payload"),
    },
    laws: {
      byFamily: {
        alternatives: tally(families, "alternatives"),
        capacity: tally(families, "capacity"),
        mirror: tally(families, "mirror"),
        other: tally(families, "other"),
        selectedSource: tally(families, "selectedSource"),
      },
      constraintTriggers: occurrences(sql, regex("^CREATE CONSTRAINT TRIGGER ", "gmu")),
      total: laws.length,
      validateFiles: files.filter((file) => file.file.endsWith("-validate.sql")).length,
    },
    policies: {
      alwaysTrue: policies.filter((policy) =>
        regex("USING \\(true\\)\\s+WITH CHECK \\(true\\);$", "u").test(policy),
      ).length,
      total: policies.length,
    },
    seed: {
      ...countRows(sql),
      folders: new Set(
        files
          .values()
          .map((file) => file.folder)
          .filter((folder) => folder.endsWith("_seed")),
      ).size,
    },
    ...countTables(sql),
    views: occurrences(sql, regex("^CREATE (?:OR REPLACE )?VIEW ", "gmu")),
  };
};

/**
 * Read every SQL file of the migration folders under `root`, then take their census.
 *
 * @param root - A schema's migration folder, such as {@link qtiMigrations}.
 * @returns What its migrations create.
 */
export const censusOf = Effect.fn("test.census.read")(function* censusOf(root: string) {
  const fs = yield* FileSystem.FileSystem;
  const relatives = yield* fs.glob("*/*.sql", { root });
  const files = yield* Effect.all(
    relatives.map((relative) =>
      fs.readFileString(path.join(root, relative)).pipe(
        Effect.map((sql) => ({
          file: path.basename(relative),
          folder: path.dirname(relative),
          sql,
        })),
      ),
    ),
  );

  return census(files);
});
