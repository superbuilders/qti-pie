/**
 * A file value's identity, as the SQL grader holds it: QTI 3.0.1 §8.14 makes a file "any sequence
 * of octets (bytes) qualified by a content-type and an optional filename", and §2.11.3.28's match
 * is true where two values "represent the same value", so two files are one value only where their
 * bytes, content type and name all agree. The machine keeps a file's name in the file's own row
 * (`doc_file`, `in_file`, `out_file`, the field and member forms), gives a multiple's copies
 * distinct places, and compares, collapses and counts a file by all three (`same`, `bag`,
 * `distinct_singles`, `bag_marks`).
 *
 * No answer and no item can make a file today: plate posts none (served-values.ts' UnpostedFile is
 * a defect at the ledger's boundary), and no QTI content states a file value. So the results suite
 * cannot grade one, and this fixture is the file identity's only guard until plate posts files,
 * when the results suite gains the case end to end.
 *
 * The inputs are the rows a reader hands the machine's entry: a run's file values as `doc_file`
 * rows, each with its name; two distinct files, the same content under a second name, a third file
 * and a repeated value; and the program's walk, its nodes and the variable each names
 * (`WalkIdent`'s rows, `#ledger/walks.ts`), the only parameter the item's processing writes. The
 * oracle is the rule table below, each line read from §8.14 and §2.11.3.28 apart from the machine.
 * The machine is the SQL of `machine/`, the source `src/grading.ts` is generated from, created in a
 * schema of this run's own on the lane's database, in a transaction that rolls back, beside a plant
 * whose `same` compares a file by its digest alone, as main's did before: the table must catch it.
 *
 * It runs only where a database is handed to it, as pantry's database suites do
 * (`QTI_PIE_PG_DATABASE` and pantry's `QTI_PIE_PG_*`), and is skipped elsewhere.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { migrationClientOf } from "@qti-pie/pantry/test/file-database.ts";
import { Config, Effect, Option } from "effect";
import type { Client, QueryResultRow } from "pg";

/**
 * The lane's database, where one is handed to the run.
 */
const lease = Effect.runSync(Config.option(Config.String("QTI_PIE_PG_DATABASE")));

/**
 * `machine/`'s files in the order their SQL installs, each type before its first use.
 */
const MACHINE_FILES = [
  "machine-types.sql",
  "fdlibm-functions.sql",
  "machine-leaves.sql",
  "fold.sql",
  "xsd.sql",
  "primitives.sql",
  "machine-eval.sql",
  "test-outcome.sql",
  "boundary.sql",
  "test-outcome-boundary.sql",
  "credit.sql",
  "document-types.sql",
  "document.sql",
  "test-document.sql",
  "marks.sql",
  "admission.sql",
] as const;

/**
 * The machine's SQL, every file of `machine/` once, in install order.
 */
const machineSql = ((): string => {
  const folder = new URL("../machine/", import.meta.url);
  const present = readdirSync(folder)
    .filter((name) => name.endsWith(".sql"))
    .toSorted();
  assert.deepStrictEqual(
    [...MACHINE_FILES].toSorted(),
    present,
    "every machine file installs once",
  );

  return MACHINE_FILES.map((name) => readFileSync(new URL(name, folder), "utf-8")).join("\n");
})();

/**
 * The plant: `same` reading a file by its digest alone, as main's machine did before a file's name
 * and content type were its identity.
 */
const PLANT = {
  original: "when 'file' then a.d = b.d and a.u = b.u and a.w is not distinct from b.w end",
  replacement: "when 'file' then a.d = b.d end",
} as const;

/**
 * The schema the machine is created in.
 */
const SCHEMA = "files_identity";

/**
 * The schema the plant is created in.
 */
const PLANT_SCHEMA = "files_identity_plant";

/**
 * The item's package.
 */
const PACKAGE = "files";

/**
 * The item's document in its package.
 */
const PATH = "item.xml";

/**
 * The run's learner.
 */
const CHILD = "child";

/**
 * A file: its digest's content, its content type and its name.
 */
interface File {
  readonly bytes: string;
  readonly name: string;
  readonly type: string;
}

/**
 * Two files of distinct contents, the first one's content under a second name, and the first under
 * another content type.
 */
const ANSWER: File = { bytes: "the answer", name: "answer.txt", type: "text/plain" };

/**
 * A second file, of another content.
 */
const OTHER: File = { bytes: "another answer", name: "other.txt", type: "text/plain" };

/**
 * The answer's content under a second name.
 */
const COPY: File = { bytes: "the answer", name: "copy.txt", type: "text/plain" };

/**
 * The answer's content and name under another content type.
 */
const TABLE: File = { bytes: "the answer", name: "answer.txt", type: "text/csv" };

/**
 * An element of a document, as the machine's rows read it.
 */
interface Element {
  readonly attributes?: Readonly<Record<string, string>>;
  readonly children?: readonly Element[];
  readonly name: string;
  readonly text?: string;
}

/**
 * An element of a QTI document, with its attributes and children.
 *
 * @param name - The element's name.
 * @param attributes - Its attributes.
 * @param children - Its children.
 * @returns The element.
 */
const el = (
  name: string,
  attributes: Readonly<Record<string, string>> = {},
  children: readonly Element[] = [],
): Element => ({ attributes, children, name });

/**
 * A variable read by its identifier.
 *
 * @param identifier - The variable's identifier.
 * @returns The element.
 */
const variable = (identifier: string): Element => el("qti-variable", { identifier });

/**
 * A multiple of the variables named.
 *
 * @param identifiers - The variables' identifiers.
 * @returns The element.
 */
const multiple = (...identifiers: readonly string[]): Element =>
  el("qti-multiple", {}, identifiers.map(variable));

/**
 * An outcome set to an expression's value.
 *
 * @param identifier - The outcome's identifier.
 * @param expression - The expression.
 * @returns The element.
 */
const set = (identifier: string, expression: Element): Element =>
  el("qti-set-outcome-value", { identifier }, [expression]);

/**
 * A single file response, by its identifier.
 *
 * @param identifier - The response's identifier.
 * @returns The element.
 */
const fileResponse = (identifier: string): Element =>
  el("qti-response-declaration", { "base-type": "file", cardinality: "single", identifier });

/**
 * An outcome declaration.
 *
 * @param identifier - The outcome's identifier.
 * @param baseType - Its base type.
 * @param cardinality - Its cardinality.
 * @returns The element.
 */
const outcome = (identifier: string, baseType: string, cardinality: string): Element =>
  el("qti-outcome-declaration", { "base-type": baseType, cardinality, identifier });

/**
 * The item: three single file responses (ANSWER, OTHER and COPY, the first's content under a
 * second name), and outcomes its response processing sets from them by multiple, match, member,
 * contains and delete.
 */
const ITEM = el("qti-assessment-item", { identifier: "files" }, [
  fileResponse("RA"),
  fileResponse("RB"),
  fileResponse("RC"),
  fileResponse("RT"),
  el("qti-response-declaration", {
    "base-type": "file",
    cardinality: "multiple",
    identifier: "GIVEN",
  }),
  outcome("ALL", "file", "multiple"),
  outcome("DELETED", "file", "multiple"),
  outcome("MATCH_COPY", "boolean", "single"),
  outcome("MATCH_TYPE", "boolean", "single"),
  outcome("MEMBER_COPY", "boolean", "single"),
  outcome("CONTAINS_COPY", "boolean", "single"),
  outcome("CONTAINS_NONE", "boolean", "single"),
  el("qti-response-processing", {}, [
    set("ALL", multiple("RA", "RB", "RC", "RB")),
    set("MATCH_COPY", el("qti-match", {}, [variable("RA"), variable("RC")])),
    set("MATCH_TYPE", el("qti-match", {}, [variable("RA"), variable("RT")])),
    set("MEMBER_COPY", el("qti-member", {}, [variable("RC"), multiple("RA", "RB")])),
    set("CONTAINS_COPY", el("qti-contains", {}, [multiple("RA", "RB", "RC"), multiple("RC")])),
    set("CONTAINS_NONE", el("qti-contains", {}, [multiple("RA", "RB"), multiple("RC")])),
    set("DELETED", el("qti-delete", {}, [variable("RA"), multiple("RA", "RC", "RB", "RA")])),
  ]),
]);

/**
 * A node of the document as the machine's rows hold it.
 */
interface NodeRow {
  readonly end: number;
  readonly kind: string;
  readonly package: string;
  readonly parent: number;
  readonly path: string;
  readonly start: number;
}

/**
 * An attribute as the machine's rows hold it.
 */
interface AttributeRow {
  readonly name: string;
  readonly package: string;
  readonly path: string;
  readonly start: number;
  readonly value: string;
}

/**
 * The document's nodes and attributes in pantry's shape: the document node at 0, the root element
 * at 1 parented to it, each element its start in document order and the start past its last
 * descendant.
 *
 * @param root - The document's root element.
 * @returns Its nodes and attributes.
 */
const rowsOf = (root: Element) => {
  const nodes: NodeRow[] = [];
  const attributes: AttributeRow[] = [];
  let next = 1;
  const walk = (element: Element, parent: number): void => {
    const start = next;
    next += 1;
    for (const [name, value] of Object.entries(element.attributes ?? {})) {
      attributes.push({ name, package: PACKAGE, path: PATH, start, value });
    }
    for (const child of element.children ?? []) {
      walk(child, start);
    }
    nodes.push({ end: next, kind: element.name, package: PACKAGE, parent, path: PATH, start });
  };
  walk(root, 0);

  return { attributes, nodes: nodes.toSorted((a, b) => a.start - b.start) };
};

/**
 * The item's rows: its program's (the response processing's subtree) and its declarations'.
 */
const DOCUMENT = rowsOf(ITEM);

/**
 * The item's response processing, its program's root.
 */
const PROGRAM_ROOT =
  DOCUMENT.nodes.find((node) => node.kind === "qti-response-processing") ??
  assert.fail("the item has a response processing");

/**
 * The program's nodes: the response processing's subtree.
 */
const PROGRAM = DOCUMENT.nodes.filter(
  (node) => node.start >= PROGRAM_ROOT.start && node.start < PROGRAM_ROOT.end,
);

/**
 * The program's walk's variables, as `WalkIdent` stores them (`#ledger/walks.ts`): each element's
 * `identifier`, `variable-identifier` or `outcome-identifier`. The item's processing writes no
 * other parameter, so the walk's other relations are empty.
 */
const PROGRAM_IDENTS = DOCUMENT.attributes
  .filter(
    (attribute) =>
      ["identifier", "outcome-identifier", "variable-identifier"].includes(attribute.name) &&
      PROGRAM.some((node) => node.start === attribute.start),
  )
  .map(({ package: pkg, path, start, value }) => ({
    identifier: value,
    package: pkg,
    path,
    start,
  }));

/**
 * The item's declarations.
 */
const DECLARATIONS = DOCUMENT.nodes.filter((node) => node.kind.endsWith("-declaration"));

/**
 * A file's `doc_file` row as a run's value, its digest the SHA-256 of its bytes.
 *
 * @param identifier - The variable's identifier.
 * @param file - The file.
 * @param place - Its place.
 * @param count - Its copies.
 * @returns The row, as JSON the database reads.
 */
const fileRow = (identifier: string, file: File, place: number, count: number) => ({
  bytes: file.bytes,
  child: CHILD,
  content_type: file.type,
  count,
  holds: "value",
  identifier,
  name: file.name,
  package: PACKAGE,
  path: PATH,
  place,
  stage: 0,
});

/**
 * The run's single file responses: RA the answer, RB another file, RC the answer's content under a
 * second name, RT the answer under another content type.
 */
const RUN_FILES = [
  fileRow("RA", ANSWER, 0, 1),
  fileRow("RB", OTHER, 0, 1),
  fileRow("RC", COPY, 0, 1),
  fileRow("RT", TABLE, 0, 1),
];

/**
 * GIVEN, a multiple whose rows each stand at place 0 with their counts, as a reader gives one.
 */
const MULTIPLE_FILES = [
  fileRow("GIVEN", ANSWER, 0, 2),
  fileRow("GIVEN", OTHER, 0, 1),
  fileRow("GIVEN", COPY, 0, 1),
];

/**
 * One statement's rows.
 *
 * @param client - The session's client.
 * @param statement - The statement.
 * @param parameters - Its parameters.
 * @returns Its rows.
 */
const rows = <A extends QueryResultRow>(
  client: Client,
  statement: string,
  parameters: readonly unknown[] = [],
) =>
  Effect.map(
    Effect.promise(() => client.query<A>(statement, [...parameters])),
    (result) => result.rows,
  );

/**
 * The machine's SQL in a schema of its own.
 *
 * @param schemaName - The schema.
 * @param source - The machine's SQL.
 * @returns The SQL, every `p3.` name in the schema.
 */
const inSchema = (schemaName: string, source: string): string =>
  source.replaceAll("p3.", `${schemaName}.`);

/**
 * A session of the lane's database in a transaction that rolls back, the machine created in its
 * schema and the plant in its own.
 *
 * @param database - The lane's database.
 * @returns The session's client.
 */
const sessionOf = (database: string) =>
  Effect.acquireRelease(
    Effect.gen(function* openSession() {
      const client = yield* migrationClientOf(database).pipe(Effect.orDie);
      yield* Effect.promise(() => client.connect());
      yield* rows(client, "begin");
      assert.isTrue(machineSql.includes(PLANT.original), "the plant applies");
      for (const [schemaName, source] of [
        [SCHEMA, machineSql],
        [PLANT_SCHEMA, machineSql.replace(PLANT.original, PLANT.replacement)],
      ] as const) {
        yield* rows(client, `create schema ${schemaName}`);
        yield* rows(client, `set local search_path = pg_catalog, ${schemaName}, pg_temp`);
        yield* rows(client, inSchema(schemaName, source));
      }

      return client;
    }),
    (client) =>
      Effect.promise(async () => {
        await client.query("rollback");
        await client.end();
      }),
  );

/**
 * A file single read back: its digest's hex, its content type and its name.
 */
interface ReadFile {
  readonly digest: string;
  readonly name: string;
  readonly type: string;
}

/**
 * A file as the table states it read back: its digest the SHA-256 of its bytes.
 *
 * @param file - The file.
 * @returns Its digest's hex, its content type and its name.
 */
const readOf = (file: File): ReadFile => ({
  digest: createHash("sha256").update(file.bytes, "utf-8").digest("hex"),
  name: file.name,
  type: file.type,
});

/**
 * Read-back files as a bag: each file's key, in code point order.
 *
 * @param files - The files.
 * @returns Their keys, sorted.
 */
const bagOf = (files: readonly ReadFile[]): string[] =>
  files.map((file) => `${file.digest} ${file.type} ${file.name}`).toSorted();

/**
 * What the table reads of a machine: each rule's observation.
 */
interface Observed {
  readonly allBag: readonly string[];
  readonly containsCopy: boolean;
  readonly containsNone: boolean;
  readonly deletedBag: readonly string[];
  readonly distinctOfFive: number;
  readonly givenBag: readonly string[];
  readonly givenPlaces: number;
  readonly matchCopy: boolean;
  readonly matchType: boolean;
  readonly memberCopy: boolean;
  readonly sameCopy: boolean;
  readonly sameItself: boolean;
  readonly sameType: boolean;
}

/**
 * The rule table, from QTI 3.0.1 §8.14 (a file is its octets, its content type and its name) and
 * §2.11.3.28 (match, member, contains and delete compare "the same value"), apart from the machine:
 * a file is the same as itself; not as its content under another name, nor under another content
 * type; five files with two repeats are three values; a multiple's four copies take four places,
 * each its own name; the response processing's multiple holds both the answer and its copy; match
 * and member read the copy as another value; contains finds the copy only where it is; delete
 * removes the answer and keeps its copy.
 */
const EXPECTED: Observed = {
  allBag: bagOf([readOf(ANSWER), readOf(OTHER), readOf(COPY), readOf(OTHER)]),
  containsCopy: true,
  containsNone: false,
  deletedBag: bagOf([readOf(COPY), readOf(OTHER)]),
  distinctOfFive: 3,
  givenBag: bagOf([readOf(ANSWER), readOf(ANSWER), readOf(OTHER), readOf(COPY)]),
  givenPlaces: 4,
  matchCopy: false,
  matchType: false,
  memberCopy: false,
  sameCopy: false,
  sameItself: true,
  sameType: false,
};

/**
 * A file single in SQL.
 *
 * @param file - The file.
 * @returns Its `s_file` call.
 */
const singleOf = (file: File): string =>
  `s_file(content_type => '${file.type}', digest => sha256(convert_to('${file.bytes}', 'UTF8')), filename => '${file.name}')`;

/**
 * The SQL of rows of a machine type from a JSON array parameter.
 *
 * @param type - The row type.
 * @param parameter - The parameter's number.
 * @returns The array expression.
 */
const rowsFrom = (type: string, parameter: number): string =>
  `(select coalesce(array_agg(x), '{}') from jsonb_populate_recordset(null::${type}, $${String(parameter)}::jsonb) x)`;

/**
 * The SQL of the run's doc_file rows from a JSON array parameter, each digest the SHA-256 of its
 * bytes.
 *
 * @param parameter - The parameter's number.
 * @returns The array expression.
 */
const filesFrom = (parameter: number): string =>
  `(select coalesce(array_agg(row(j->>'child', j->>'content_type', (j->>'count')::bigint, sha256(convert_to(j->>'bytes', 'UTF8')), j->>'holds', j->>'identifier', j->>'name', j->>'package', j->>'path', (j->>'place')::bigint, (j->>'stage')::bigint)::doc_file), '{}') from jsonb_array_elements($${String(parameter)}::jsonb) j)`;

/**
 * The SQL of read-back files as JSON: each a digest's hex, a content type and a name.
 *
 * @param source - The rows, each with digest, content type and name columns.
 * @returns The expression.
 */
const filesJson = (source: string): string =>
  `(select coalesce(jsonb_agg(jsonb_build_object('digest', encode(f.digest, 'hex'), 'name', f.name, 'type', f.content_type)), '[]') from ${source})`;

/**
 * The walk's relations the item's processing writes no row of.
 */
const WALK_EMPTY = [
  "walk_areas",
  "walk_categories",
  "walk_coords",
  "walk_customs",
  "walk_equals",
  "walk_filters",
  "walk_floats",
  "walk_integers",
  "walk_literal_booleans",
  "walk_literal_directed_pairs",
  "walk_literal_floats",
  "walk_literal_integers",
  "walk_literal_pairs",
  "walk_literal_points",
  "walk_literal_texts",
  "walk_names",
  "walk_patterns",
  "walk_refs",
  "walk_rounds",
  "walk_texts",
] as const;

/**
 * Every rule's observation of the machine in one schema.
 *
 * @param client - The session's client.
 * @param schemaName - The machine's schema.
 * @returns The observations.
 */
const observe = (client: Client, schemaName: string) =>
  Effect.gen(function* observeMachine() {
    yield* rows(client, `set local search_path = pg_catalog, ${schemaName}, pg_temp`);

    const declarations = rowsFrom("declaration_node", 1);
    const attributes = rowsFrom("document_attribute", 2);
    const program = rowsFrom("program_node", 3);
    const idents = rowsFrom("doc_walk_ident", 4);
    const none = "'{}'";
    const walkNone = WALK_EMPTY.map((name) => `${name} => ${none}`).join(", ");
    const run = `array[row('${CHILD}', false, 'label', '${PACKAGE}', '${PATH}', 'seed', 0)::document_run]`;
    const values = (files: string) =>
      `values_of(booleans => ${none}, child => '${CHILD}', declaration_attributes => ${attributes}, declarations => ${declarations}, defaulted => false, directed_pairs => ${none}, field_booleans => ${none}, field_directed_pairs => ${none}, field_files => ${none}, field_floats => ${none}, field_integers => ${none}, field_pairs => ${none}, field_points => ${none}, field_texts => ${none}, files => ${files}, floats => ${none}, integers => ${none}, package => '${PACKAGE}', pairs => ${none}, path => '${PATH}', points => ${none}, stage => 0, texts => ${none}, vars => ${none})`;
    const result = `response_processing_of(booleans => ${none}, declaration_attributes => ${attributes}, declaration_texts => ${none}, declarations => ${declarations}, directed_pairs => ${none}, evaluations => ${none}, field_booleans => ${none}, field_directed_pairs => ${none}, field_files => ${none}, field_floats => ${none}, field_integers => ${none}, field_pairs => ${none}, field_points => ${none}, field_texts => ${none}, files => ${filesFrom(5)}, floats => ${none}, human_feedbacks => ${none}, humans => ${none}, integers => ${none}, pairs => ${none}, points => ${none}, programs => ${program}, reply_floats => ${none}, reply_texts => ${none}, runs => ${run}, table_bindings => ${none}, table_entries => ${none}, table_values => ${none}, texts => ${none}, vars => ${none}, ${walkNone}, walk_idents => ${idents})`;
    const declarationAttributes = DOCUMENT.attributes.filter((attribute) =>
      DECLARATIONS.some((node) => node.start === attribute.start),
    );
    const parameters = [
      JSON.stringify(DECLARATIONS),
      JSON.stringify(declarationAttributes),
      JSON.stringify(PROGRAM),
      JSON.stringify(PROGRAM_IDENTS),
      JSON.stringify(RUN_FILES),
      JSON.stringify(MULTIPLE_FILES),
    ];
    const [row] = yield* rows<{
      readonly all: ReadFile[];
      readonly booleans: Record<string, boolean>;
      readonly deleted: ReadFile[];
      readonly distinct_of_five: number;
      readonly given: ReadFile[];
      readonly given_places: number;
      readonly same_copy: boolean;
      readonly same_itself: boolean;
      readonly same_type: boolean;
    }>(
      client,
      `with r as (select ${result} as v), g as (select ${values(filesFrom(6))} as iv)
      select
        same(a => ${singleOf(ANSWER)}, b => ${singleOf(ANSWER)}) as same_itself,
        same(a => ${singleOf(ANSWER)}, b => ${singleOf(COPY)}) as same_copy,
        same(a => ${singleOf(ANSWER)}, b => ${singleOf(TABLE)}) as same_type,
        (select count(*)::integer from distinct_singles(v => array[${[ANSWER, COPY, OTHER, OTHER, ANSWER].map(singleOf).join(", ")}])) as distinct_of_five,
        (select count(distinct f.place)::integer from g, unnest((g.iv).files) f where f.identifier = 'GIVEN') as given_places,
        ${filesJson("g, unnest((g.iv).files) f where f.identifier = 'GIVEN'")} as given,
        ${filesJson("r, unnest((r.v).files) f where f.identifier = 'ALL'")} as all,
        ${filesJson("r, unnest((r.v).files) f where f.identifier = 'DELETED'")} as deleted,
        (select coalesce(jsonb_object_agg(b.identifier, b.value), '{}') from r, unnest((r.v).booleans) b) as booleans
      from (select 1) one`,
      parameters,
    );
    const observed = row ?? assert.fail("the observation returned no row");
    const flag = (identifier: string): boolean =>
      observed.booleans[identifier] ?? assert.fail(`${identifier} has no value`);

    return {
      allBag: bagOf(observed.all),
      containsCopy: flag("CONTAINS_COPY"),
      containsNone: flag("CONTAINS_NONE"),
      deletedBag: bagOf(observed.deleted),
      distinctOfFive: observed.distinct_of_five,
      givenBag: bagOf(observed.given),
      givenPlaces: observed.given_places,
      matchCopy: flag("MATCH_COPY"),
      matchType: flag("MATCH_TYPE"),
      memberCopy: flag("MEMBER_COPY"),
      sameCopy: observed.same_copy,
      sameItself: observed.same_itself,
      sameType: observed.same_type,
    } satisfies Observed;
  });

describe.skipIf(Option.isNone(lease))("a file value's identity, as the SQL grader holds it", () => {
  it.effect("holds every rule of the table, and catches a digest-only same", () =>
    Effect.scoped(
      Effect.gen(function* holdsFileIdentity() {
        const database = Option.getOrElse(lease, () => assert.fail("no database is handed"));
        const client = yield* sessionOf(database);

        assert.deepStrictEqual(yield* observe(client, SCHEMA), EXPECTED);
        assert.notDeepEqual(
          yield* observe(client, PLANT_SCHEMA),
          EXPECTED,
          "the plant, same by the digest alone, breaks a rule",
        );
      }),
    ).pipe(Effect.provide(NodeServices.layer)),
  );
});
