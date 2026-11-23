import type { BaseTypeName } from "#tools/gen/grade/base.ts";
import {
  CARDINALITIES,
  DOC_HEADS,
  HEAD,
  hoist,
  outcomeMember,
  overDelivery,
  recordHeaderMember,
  RUN_INPUTS,
  STATUS,
  TYPES,
  valueRules,
  withRunInputs,
} from "#tools/gen/grade/base.ts";
import type { Fragments } from "#tools/gen/grade/fragments.ts";
import {
  camel,
  count,
  indented,
  indexOf,
  must,
  replaceAll,
  replaceFirst,
} from "#tools/gen/grade/text.ts";

/**
 * The take stage of grade.ts: template processing at the take (QTI 3.0.1
 * information model, TemplateProcessing; §2.2.1: "Template processing ... takes place ... at the
 * beginning of the item session"), after the admission stage, over what it wrote: two builders
 * appended to grade.ts, both generated from the base stage's own table and templates
 * (`#tools/gen/grade/base.ts`), so the generator keeps one table.
 *
 * - The arguments builder, takeArgumentsOf(delivery): templateProcessingOf's arguments over the item
 *   sessions the take writes in the same stratum (decideStage's item sessions, qti-pie's take's
 *   members), as gradeArgumentsOf's key states it (the sitting fragment), which the sittings stage
 *   after this one turns into the `takenSessions` relation parameter, each session by its key with
 *   its seed (SessionSeed's heading): its sessions' items' template processing (the inline
 *   qti-template-processing subtree; QTI's has no template), their declarations, each session's run
 *   (its seed, templateLabel of the item's identifier), and the values the run is given,
 *   gradeArgumentsOf's readers over the sessions' attempts: every read of the stratum sees the
 *   state before it, which holds none of its sessions, so the run starts every variable at its
 *   declared default.
 * - The write, takeValuesOf(delivery), one stratum, the sessions' own: what the one run set, by the
 *   ledger's laws on ItemSessionValue (`settable`), as the run reports what it set (grading v16's
 *   templateProcessingOf: an entry only where its value is not identical to the one the run began
 *   with): each template variable's value (kind template), each response's correct response (kind
 *   correct), each response's and outcome's default (kind default), each in the sidecar of its
 *   cardinality and base type; nothing declared is copied; a record has no session sidecar, so none
 *   of it is written. Beside those, the record each session begins with (COMPILE-AT-PUBLISH S): the
 *   machine's response processing run of the sessions with no program, given what the template run
 *   set as the take stores it, its every variable that is no context in the Start family, from the
 *   base stage's outcome writes, so a read of a session's start is a read by its key.
 */

/**
 * The text between two markers, which must both stand in it, in order.
 *
 * @param text The text.
 * @param from The first marker.
 * @param to The second, after the first.
 * @returns Where the first begins and where the second does.
 */
const between = (text: string, from: string, to: string): readonly [number, number] => {
  const i = indexOf(text, from);

  return [i, indexOf(text, to, i)];
};

/**
 * The body of the base stage's readers with `[from, to)` replaced.
 *
 * @param body The body.
 * @param from The marker where the replaced part begins.
 * @param to The marker where it ends.
 * @param by Its replacement, from the replaced part.
 * @returns The body replaced.
 */
const replacedBetween = (
  body: string,
  from: string,
  to: string,
  by: (part: string) => string,
): string => {
  const [i, j] = between(body, from, to);

  return body.slice(0, i) + by(body.slice(i, j)) + body.slice(j);
};

/**
 * The take's arguments builder, takeArgumentsOf, before its readers are hoisted.
 *
 * @param fragment The generator's fragments.
 * @returns Its text.
 */
const takeArguments = (fragment: Fragments): string => {
  const rooted = replacedBetween(
    fragment("base/readers"),
    "/** Each item session of the sitting with an attempt",
    "/** The subtree the item's response processing runs",
    () => fragment("take/roots"),
  );
  const templated = replaceAll(
    replacedBetween(
      rooted,
      "/** The subtree the item's response processing runs",
      "/** The program's elements",
      () => fragment("take/template-roots"),
    ),
    "responseRootsOf(session).bind(bySession(session))",
    "templateRootsOf(session).bind(bySession(session))",
  );
  const declared = replacedBetween(
    templated,
    "/** The graded items' declarations' nodes",
    "/** The session's last attempt processed before this one",
    (part) =>
      replaceAll(
        replaceAll(
          part,
          "const graded = gradableOf(session).bind(bySession(session))",
          "const graded = takenOf(session).bind(bySession(session))",
        ),
        "/** The graded items' declarations' nodes",
        "/** The taken items' declarations' nodes",
      ),
  );
  const body = replacedBetween(
    declared,
    "/** The run of the attempt:",
    "/** The variables the attempt's run is given",
    () => fragment("take/runs"),
  );
  const readers = DOC_HEADS.flatMap((head) => [
    `\n/** The values the run is given that cross as \`doc_${head}\` rows: the session's, none at its take. */`,
    `const ${camel(head)}Of = (session: GradedSession) =>\n\tquery(Installed)`,
    [
      ...valueRules(head),
      ...(head === "integers" ? [fragment("base/num-attempts")] : []),
      ...(head === "texts" ? [STATUS.replace(/^\n+/u, "")] : []),
    ].join("\n"),
  ]);
  const out = [
    fragment("take/arguments-head"),
    indented(`${fragment("base/sitting")}\n`, "\t"),
    body,
    fragment("base/run-inputs"),
    ...readers,
    withRunInputs(
      replaceAll(
        fragment("base/readers-return"),
        "gradable: gradableOf(gradedSitting)",
        "taken: takenOf(gradedSitting)",
      ),
    ),
  ];

  return overDelivery(`${out.join("\n")}\n`);
};

/**
 * What template processing sets, by the ledger's laws on ItemSessionValue (`settable`): its kind,
 * what the run holds it as, and the DocVar kinds of the variables it is of.
 */
const SETS = [
  ["template", "value", ['"template"']],
  ["correct", "correct", ['"response"']],
  ["default", "default", ['"response"', '"outcome"']],
] as const;

/**
 * One kind of set value, as SETS lists it.
 */
type SetKind = (typeof SETS)[number];

/**
 * The insert of what the run set of one kind, cardinality and base type into its session sidecar,
 * from the base stage's outcome write.
 *
 * @param cardinality The cardinality.
 * @param t The base type.
 * @param set The kind of value set.
 * @returns The insert.
 */
const setMember = (
  cardinality: "Single" | "Multiple" | "Ordered",
  t: (typeof TYPES)[number],
  [kind, holds, kinds]: SetKind,
): string => {
  const one = kinds.length === 1;
  const keyed = replaceAll(
    replaceAll(
      outcomeMember(cardinality, t),
      `mine.Snapshot${cardinality}${t}`,
      `mine.ItemSessionValue${cardinality}${t}`,
    ),
    "const out = runOf(session)",
    "const out = run",
  );
  const taken =
    /const attempt = gradableOf\(session\)\.bind\(bySession\(session\)\)\n(?<tabs>\t+)const \{ child, package: pkg, path, n, stage, at \} = v\(attempt, "attempt"\)/gu;
  must(keyed.match(taken)?.length === 1, `one attempt key in ${keyed.slice(0, 300)}`);

  const vk = one ? `kind: ${kinds[0]}, ` : "kind, ";
  let m = replaceAll(
    replaceAll(
      keyed.replaceAll(
        taken,
        (_match, tabs: string) =>
          `const taken = boundTaken\n${tabs}const { child, package: pkg, path, stage } = v(taken, "taken")`,
      ),
      ".match(attempt, { child, package: pkg, path, n, stage, at })",
      ".match(taken, { child, package: pkg, path, stage })",
    ),
    'const { identifier } = v(out.vars, "outcome")',
    one
      ? 'const { identifier } = v(out.vars, "set")'
      : 'const { identifier, kind } = v(out.vars, "set")',
  );
  const outcome = 'holds: "value", kind: "outcome", identifier, card:';
  must(count(m, outcome) === 1, "one outcome variable match");
  m = replaceAll(
    replaceAll(m, outcome, `holds: "${holds}", ${vk}identifier, card:`),
    'holds: "value", identifier',
    `holds: "${holds}", identifier`,
  );
  for (const q of ["r", "q"]) {
    m = replaceAll(
      m,
      `.where(${q}.ne(identifier, "completionStatus"))`,
      one ? "" : `.where(${q}.in(kind, [${kinds.join(", ")}]))`,
    );
  }
  m = replaceAll(
    replaceAll(
      replaceAll(
        m.replaceAll(/\n\t*\n/gu, "\n"),
        "find({ child, package: pkg, path, n, at, variable:",
        `find({ child, stage, package: pkg, path, kind: SessionValueKind.handle("${kind}"), variable:`,
      ),
      "child, package: pkg, path, n, at, ",
      "child, stage, package: pkg, path, ",
    ),
    ".bind(bySession(session))",
    ".bind(bySession(gradedSitting))",
  );
  m = replaceAll(replaceAll(m, "query(Learner)", "query(delivery)"), "mine.", "fields.");
  must(
    !m.includes("attempt") && !m.includes(", at") && !m.includes(" n,"),
    `a set write over no attempt: ${m}`,
  );

  return m;
};

/**
 * The rule writing the header of what the run set of one kind.
 *
 * @param set The kind of value set.
 * @returns The rule.
 */
const headerRule = ([kind, holds, kinds]: SetKind): string => {
  const one = kinds.length === 1;
  const kv = one ? `kind: ${kinds[0]}, ` : "kind, ";
  const where = `r.ne(card, "record")${one ? "" : `, r.in(kind, [${kinds.join(", ")}])`}`;

  return `\t\t.rule((r) => {
\t\t\tconst out = run
\t\t\tconst taken = boundTaken
\t\t\tconst { child, package: pkg, path, stage } = v(taken, "taken")
\t\t\tconst { identifier, card${one ? "" : ", kind"} } = v(out.vars, "set")
\t\t\treturn r
\t\t\t\t.match(taken, { child, package: pkg, path, stage })
\t\t\t\t.match(out.vars, { child, package: pkg, path, stage, holds: "${holds}", ${kv}identifier, card })
\t\t\t\t.where(${where})
\t\t\t\t.find({ child, stage, package: pkg, path, kind: SessionValueKind.handle("${kind}"), variable: identifier })
\t\t})`;
};

/**
 * The start run's arguments that hold no rows, each by its machine name, its heading and a literal
 * row of it, which `r.or()` never matches: the start runs no program (`response_state`: "No
 * program, no run: the values stand as they start"), so it reaches no application and has no
 * evaluation or person's value to read.
 */
const START_EMPTIES = [
  [
    "evaluations",
    "DocEvaluation",
    [
      ["child", '"x"'],
      ["package", '""'],
      ["path", '""'],
      ["stage", "0n"],
      ["start", "0n"],
    ],
  ],
  [
    "human_feedbacks",
    "DocHumanFeedback",
    [
      ["child", '"x"'],
      ["feedback", '""'],
      ["package", '""'],
      ["path", '""'],
      ["rubric", '""'],
      ["stage", "0n"],
    ],
  ],
  [
    "humans",
    "DocHuman",
    [
      ["child", '"x"'],
      ["package", '""'],
      ["path", '""'],
      ["rubric", '""'],
      ["score", "0"],
      ["stage", "0n"],
    ],
  ],
  [
    "programs",
    "ProgramNode",
    [
      ["end", "0n"],
      ["kind", '"qti-response-processing"'],
      ["package", '""'],
      ["parent", "0n"],
      ["path", '""'],
      ["start", "0n"],
    ],
  ],
  [
    "program_attributes",
    "DocumentAttribute",
    [
      ["name", '"identifier"'],
      ["package", '""'],
      ["path", '""'],
      ["start", "0n"],
      ["value", '""'],
    ],
  ],
  [
    "program_texts",
    "DocumentText",
    [
      ["package", '""'],
      ["path", '""'],
      ["start", "0n"],
      ["text", '""'],
    ],
  ],
  [
    "compiled",
    "CompiledPattern",
    [
      ["package", '""'],
      ["pattern", '""'],
      ["program", '""'],
    ],
  ],
] as const;

/**
 * The value headings the start run is given, each with the base types that cross as it: a file's
 * name crosses apart, as `file_names`.
 */
const START_HEADINGS: readonly (readonly [string, readonly BaseTypeName[]])[] = [
  ...["texts", "integers", "floats", "booleans", "pairs", "directed_pairs", "points", "files"].map(
    (head): readonly [string, readonly BaseTypeName[]] => [
      head,
      TYPES.filter((t) => HEAD[t].head === head),
    ],
  ),
  ["file_names", ["File"]],
];

/**
 * The filter on the run's DocVar rows to those of one kind of set value, as the take's set inserts
 * write them: what the run holds it as, of the kinds SETS lists, no record.
 *
 * @param set The kind of value set.
 * @returns The predicates' text.
 */
const setWhere = ([, holds, kinds]: SetKind): string => {
  const [only, ...more] = kinds;
  const kind = more.length === 0 ? `r.eq(kind, ${only})` : `r.in(kind, [${kinds.join(", ")}])`;

  return `r.ne(card, "record"), r.eq(holds, "${holds}"), ${kind}`;
};

/**
 * The columns of a value heading the start run is given, past its key, and whether it holds a
 * base type, each as a rule reads it: its value's, by the base stage's crossing table (`HEAD`), of
 * which every base type that crosses as the heading has one; a file's name crosses apart.
 *
 * @param head The heading.
 * @param types The base types that cross as it.
 * @returns Its value's columns, each read as `doc: column`, and whether it holds a base type.
 */
const startColumns = (head: string, types: readonly BaseTypeName[]) => {
  if (head === "file_names") {
    return { base: false, values: "name" };
  }

  const [t] = types;
  must(t !== undefined, `a base type that crosses as ${head}`);

  const { cols, hasBase } = HEAD[t];

  return {
    base: hasBase,
    values: cols.map(([doc, column]) => (doc === column ? doc : `${doc}: ${column}`)).join(", "),
  };
};

/**
 * The start run's own readers, over what the template run set, as the take stores it: each
 * declared variable's base type, built-ins included; each value the run set, its header held as
 * the rule that set it says, with its kind and cardinality, of the kinds and cardinalities the
 * take's set inserts write (SETS, no record); and the values themselves, by heading. Every read of
 * the take's stratum sees the state before it, so the start reads the run, never the values the
 * stratum writes; the take's own readers read an attempt's values, of which a session has none at
 * its take.
 *
 * @returns The readers' text and the start run's binds of them.
 */
const startReaders = () => {
  const bases = `\t/** Each declared variable's base type, built-ins included, by the taken session. */
\tconst startBasesOf = query(delivery).rule((r) => {
\t\tconst taken = boundTaken
\t\tconst { child, package: pkg, path, stage } = v(taken, "taken")
\t\tconst { identifier, baseType } = v(fields.ItemSessionVariable, "startTypedVariable")
\t\tconst { token: base } = v(fields.BaseTypeToken, "startBase")
\t\treturn r
\t\t\t.match(taken, { child, package: pkg, path, stage })
\t\t\t.match(fields.ItemSessionVariable, { baseType, identifier, package: pkg, path })
\t\t\t.match(fields.BaseTypeToken, { baseType, token: base })
\t\t\t.find({ base, child, identifier, package: pkg, path, stage })
\t})`;
  const vars = `\t/** Each value the template run set, held as the rule that set it says, with its kind and cardinality. */
\tconst startVarsOf = query(delivery)
${SETS.map(
  (set) => `\t\t.rule((r) => {
\t\t\tconst { card, child, holds, identifier, kind, package: pkg, path, stage } = v(run.vars, "startSet")
\t\t\treturn r
\t\t\t\t.match(run.vars, { card, child, holds, identifier, kind, package: pkg, path, stage })
\t\t\t\t.where(${setWhere(set)})
\t\t\t\t.find({ card, child, holds, identifier, kind, package: pkg, path, stage })
\t\t})`,
).join("\n")}`;
  const sources = START_HEADINGS.map(([head, types]) => {
    const name = `start${camel(head).charAt(0).toUpperCase()}${camel(head).slice(1)}Of`;
    const { base, values } = startColumns(head, types);
    const row = `${base ? "base, " : ""}child, holds, identifier, package: pkg, path, place, stage, ${values}`;
    const rules = SETS.map(
      (set) => `\t\t.rule((r) => {
\t\t\tconst { card, child, holds, identifier, kind, package: pkg, path, stage } = v(run.vars, "startSet")
\t\t\tconst { ${base ? "base, " : ""}place, ${values} } = v(run.${head}, "startSetValue")
\t\t\treturn r
\t\t\t\t.match(run.vars, { card, child, holds, identifier, kind, package: pkg, path, stage })
\t\t\t\t.match(run.${head}, { ${row} })
\t\t\t\t.where(${setWhere(set)})
\t\t\t\t.find({ ${row} })
\t\t})`,
    );

    return {
      bind: `\t\t${head}: ${name}.bind(bySession(gradedSitting))`,
      text: `\t/** The template run's values that cross as \`doc_${head}\`, of what it set. */
\tconst ${name} = query(delivery)
${rules.join("\n")}`,
    };
  });

  return {
    binds: [
      "\t\tbases: startBasesOf.bind(bySession(gradedSitting))",
      "\t\tvars: startVarsOf.bind(bySession(gradedSitting))",
      ...sources.map(({ bind }) => bind),
    ],
    text: [bases, vars, ...sources.map(({ text }) => text)].join("\n\n"),
  };
};

/**
 * The name of an empty argument's source: `no` and its machine name in Pascal case.
 *
 * @param name The machine name.
 * @returns The source's name.
 */
const emptyName = (name: string): string =>
  `no${name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")}`;

/**
 * A base stage outcome write of an attempt's run, retargeted to the start of the taken sessions:
 * from the start run, keyed by the taken session's stage, into the Start family, of every variable
 * that is no context (completionStatus among them, whose start is `unknown`).
 *
 * @param member The base stage's insert or rule.
 * @returns The start's.
 */
const startOf = (member: string): string => {
  const attempt =
    /const attempt = gradableOf\(session\)\.bind\(bySession\(session\)\)\n(?<tabs>\t+)const \{ child, package: pkg, path, n, stage, at \} = v\(attempt, "attempt"\)/gu;
  must(member.match(attempt)?.length === 1, `one attempt key in ${member.slice(0, 300)}`);

  let m = member.replaceAll(
    attempt,
    (_match, tabs: string) =>
      `const taken = boundTaken\n${tabs}const { child, package: pkg, path, stage } = v(taken, "taken")`,
  );
  const edits: readonly (readonly [string, string])[] = [
    [
      ".match(attempt, { child, package: pkg, path, n, stage, at })",
      ".match(taken, { child, package: pkg, path, stage })",
    ],
    [
      'const { identifier } = v(out.vars, "outcome")',
      'const { identifier, kind } = v(out.vars, "start")',
    ],
    [
      'holds: "value", kind: "outcome", identifier, card:',
      'holds: "value", kind, identifier, card:',
    ],
    ['.where(r.ne(identifier, "completionStatus"))', '.where(r.ne(kind, "context"))'],
    ['.where(q.ne(identifier, "completionStatus"))', '.where(q.ne(kind, "context"))'],
    ["const out = runOf(session)", "const out = startRun"],
    ["child, package: pkg, path, n, at, ", "child, stage, package: pkg, path, "],
    [".bind(bySession(session))", ".bind(bySession(gradedSitting))"],
    ["query(Learner)", "query(delivery)"],
    ["mine.Snapshot", "fields.Start"],
  ];
  for (const [from, to] of edits) {
    m = replaceAll(m, from, to);
  }
  must(
    !m.includes("attempt") && !m.includes(", at") && !m.includes(" n,") && !m.includes("Snapshot"),
    `a start write over no attempt: ${m}`,
  );

  return m;
};

/**
 * The take's start write (COMPILE-AT-PUBLISH S): the start run, over what the template run set as
 * the take stores it, and each insert of its record into the Start family, by name.
 *
 * @param binds The take's run binds, its arguments' and its run inputs'.
 * @returns The write's text and its change sets' names.
 */
const startWrite = (binds: readonly string[]) => {
  const programArguments: ReadonlySet<string> = new Set([
    "programs",
    "program_attributes",
    "program_texts",
    "compiled",
  ]);
  const readers = startReaders();
  const own = new Set(
    readers.binds.map((bind) => /^\t\t(?<arg>\w+):/u.exec(bind)?.groups?.["arg"] ?? ""),
  );
  const startBinds = [
    ...binds.filter((bind) => {
      const arg = /^\t\t(?<arg>\w+):/u.exec(bind)?.groups?.["arg"] ?? "";

      return !programArguments.has(arg) && !own.has(arg);
    }),
    ...readers.binds,
    ...START_EMPTIES.map(([name]) => `\t\t${name}: ${emptyName(name)}`),
  ].join(",\n");
  const empties = START_EMPTIES.map(([name, heading, columns]) => {
    const literals = columns
      .map(
        ([column, literal]) => `${column}: Type.literal(${heading}.fields.${column}, ${literal})`,
      )
      .join(", ");

    return `\tconst ${emptyName(name)} = query(delivery).rule((r) => r.where(r.or()).find({ ${literals} }))`;
  }).join("\n");
  const values = CARDINALITIES.map((cardinality) => ({
    name: `start${cardinality}s`,
    text: [
      `\n\t/** The start's ${cardinality.toLowerCase()} values, one sidecar each. */`,
      `\tconst start${cardinality}s = ChangeSet.empty(delivery)`,
      indented(TYPES.map((t) => startOf(outcomeMember(cardinality, t))).join("\n"), "\t"),
    ].join("\n"),
  }));
  const text = `
\t/** The start run's arguments that hold no rows. */
${empties}

${readers.text}

\t/** The machine's run of each taken session's start, given what the template run set, as the take stores it, as the
\t * session's own: response processing with no program, so its state is the one \`response_state\` gives unrun, each
\t * outcome at its default in force, \`completionStatus\` at \`unknown\`, each template variable at its set or declared
\t * value and each response NULL. One call, every argument a query over the taken sessions, so every insert below reads
\t * one evaluation of it. */
\tconst startRun = Fn.row(responseProcessingOf, {
${startBinds}
\t})

\t/** Each variable of the start that is no context, a NULL one's among them, whose value rows its sidecars hold. */
\tconst startHeaders = ChangeSet.empty(delivery).insert(
\t\tfields.StartVariable,
\t\tquery(delivery).rule((r) => {
\t\t\tconst out = startRun
\t\t\tconst taken = boundTaken
\t\t\tconst { child, package: pkg, path, stage } = v(taken, "taken")
\t\t\tconst { identifier, kind } = v(out.vars, "start")
\t\t\treturn r
\t\t\t\t.match(taken, { child, package: pkg, path, stage })
\t\t\t\t.match(out.vars, { child, package: pkg, path, stage, holds: "value", kind, identifier })
\t\t\t\t.where(r.ne(kind, "context"))
\t\t\t\t.find({ child, stage, package: pkg, path, variable: identifier })
\t\t})
\t)
${values.map(({ text: value }) => value).join("\n")}

\t/** The start's record fields: each field's header with its base type, then its arm. */
\tconst startRecords = ChangeSet.empty(delivery)
\t.insert(
\t\tfields.StartRecord,
\t\tquery(delivery)
${TYPES.map((t) => startOf(recordHeaderMember(t))).join("\n")}
\t)
${indented(TYPES.map((t) => startOf(outcomeMember("Record", t))).join("\n"), "\t")}
`;

  return { names: ["startHeaders", ...values.map(({ name }) => name), "startRecords"], text };
};

/**
 * The list of every relation the take's write inserts into, by name, as grade.ts exports it: each
 * value template processing set, its header and the sidecar of its cardinality and base type, and
 * the session's start, its header, its sidecars and its record fields.
 *
 * @returns The list's text.
 */
const takeTables = (): string =>
  [
    "\n/** Every relation the take's write inserts into, by name: what a role that composes it inserts into. */",
    "export const takeValuesTables = [",
    '\t"ItemSessionValue",',
    ...CARDINALITIES.flatMap((cardinality) =>
      TYPES.map((t) => `\t"ItemSessionValue${cardinality}${t}",`),
    ),
    '\t"StartVariable",',
    ...CARDINALITIES.flatMap((cardinality) => TYPES.map((t) => `\t"Start${cardinality}${t}",`)),
    '\t"StartRecord",',
    ...TYPES.map((t) => `\t"StartRecord${t}",`),
    "] as const\n",
  ].join("\n");

/**
 * The arguments the take's run binds, in the order it binds them.
 */
const RUN_ARGUMENTS = [
  "programs",
  "program_attributes",
  "program_texts",
  "compiled",
  "declarations",
  "declaration_attributes",
  "declaration_texts",
  "runs",
  "vars",
  "bases",
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
 * The names, of which there must be one at least.
 *
 * @param names The names.
 * @returns The names, as a list of one or more.
 */
const nonEmpty = (names: readonly string[]): readonly [string, ...string[]] => {
  const [first, ...rest] = names;
  must(first !== undefined, "a change set to unite");

  return [first, ...rest];
};

/**
 * A balanced tree of unions of the named change sets.
 *
 * @param names The change sets' names, at least one.
 * @returns The union's text.
 */
const unionTree = (names: readonly [string, ...string[]]): string => {
  const [first, ...rest] = names;
  if (rest.length === 0) {
    return first;
  }

  const half = Math.floor(names.length / 2);

  return `ChangeSet.union(${unionTree(nonEmpty(names.slice(0, half)))}, ${unionTree(nonEmpty(names.slice(half)))})`;
};

/**
 * The take's write, takeValuesOf, one stratum: its run, what it set, and the start.
 *
 * @param fragment The generator's fragments.
 * @returns Its text.
 */
const takeValues = (fragment: Fragments): string => {
  const bound = [
    ...RUN_ARGUMENTS.map((arg) => `\t\t${arg}: args.${arg}.bind(bySession(gradedSitting))`),
    ...RUN_INPUTS.map(([arg, , reads]) =>
      reads === "attempts"
        ? `\t\t${arg}: args.${arg}.bind(bySession(gradedSitting))`
        : `\t\t${arg}: args.${arg}`,
    ),
  ];
  const binds = bound.join(",\n");
  const start = startWrite(bound);
  const sets = CARDINALITIES.flatMap((cardinality) =>
    SETS.map((set) => {
      const [kind] = set;

      return {
        name: `${kind}${cardinality}s`,
        text: [
          `\n\t/** The run's ${cardinality.toLowerCase()} values of kind \`${kind}\`, one sidecar each. */`,
          `\tconst ${kind}${cardinality}s = ChangeSet.empty(delivery)`,
          indented(TYPES.map((t) => setMember(cardinality, t, set)).join("\n"), "\t"),
        ],
      };
    }),
  );
  const out = [
    fragment("take/values-head"),
    indented(`${fragment("base/sitting")}\n`, "\t"),
    `\t/** The arguments of the take's run, bound to the call's taken sessions. */
\tconst args = takeArgumentsOf(delivery)
\tconst boundTaken = args.taken.bind(bySession(gradedSitting))

\t/** The machine's run of the taken sessions' template processing: one call, every argument a query over the
\t * taken sessions, so every insert below and the start's readers read one evaluation of it. */
\tconst run = Fn.row(templateProcessingOf, {
${binds}
\t})

\t/** What the run set of each variable, by item and kind, whose value rows its sidecars hold. */
\tconst set = ChangeSet.empty(delivery).insert(
\t\tfields.ItemSessionValue,
\t\tquery(delivery)
${SETS.map(headerRule).join("\n")}
\t)
`,
    ...sets.flatMap(({ text }) => text),
    start.text,
    `\n\treturn ${unionTree(["set", ...sets.map(({ name }) => name), ...start.names])}\n}\n`,
  ];

  return overDelivery(out.join("\n"));
};

/**
 * The end of the grading module's import, as the stages before leave it.
 */
const GRADING_IMPORT_END = '  seedStreamKey,\n} from "#ledger/grading.ts";\n';

/**
 * The text with names added to its one import of the grading module, every name in the order the
 * import's names keep, by their text without case.
 *
 * @param src The text.
 * @param added The names to add.
 * @returns The text with the names imported.
 */
const withGradingNames = (src: string, added: readonly string[]): string => {
  const end = indexOf(src, GRADING_IMPORT_END) + "  seedStreamKey,\n".length;
  const start = src.lastIndexOf("import {\n", end);
  must(start !== -1, "the grading module's import");

  const names = [
    ...src
      .slice(start + "import {\n".length, end)
      .split(",\n")
      .map((name) => name.trim())
      .filter((name) => name !== ""),
    ...added,
  ].toSorted((left, right) => {
    const a = left.toLowerCase();
    const b = right.toLowerCase();

    return Number(a > b) - Number(a < b);
  });

  return `${src.slice(0, start)}import {\n${names.map((name) => `  ${name},\n`).join("")}${src.slice(end)}`;
};

/**
 * The scalars module's import, as the stages before leave it, which the ledger module's comes
 * before.
 */
const SCALARS_IMPORT = 'import { QtiInteger } from "#ledger/scalars.ts";\n';

/**
 * The take stage: takeArgumentsOf, hoisted, and takeValuesOf appended to the admission stage, and
 * the imports they need.
 *
 * @param stage The admission stage's text, formatted.
 * @param fragment The generator's fragments.
 * @returns The stage's text.
 */
export const takeStage = (stage: string, fragment: Fragments): string => {
  must(!stage.includes("export const takeArgumentsOf = "), "take stage: already generated");

  const src = `${stage.replace(/\n+$/u, "")}\n${hoist(takeArguments(fragment))}${takeValues(fragment)}${takeTables()}`;
  must(count(src, GRADING_IMPORT_END) === 1, "the grading module's one import");
  must(count(src, SCALARS_IMPORT) === 1, "the scalars module's one import");

  return replaceFirst(
    withGradingNames(src, [
      "templateLabel",
      "templateProcessingOf",
      ...START_EMPTIES.map(([, heading]) => heading),
    ]),
    SCALARS_IMPORT,
    `import { SessionValueKind } from "#ledger/ledger.ts";\n${SCALARS_IMPORT}`,
  );
};
