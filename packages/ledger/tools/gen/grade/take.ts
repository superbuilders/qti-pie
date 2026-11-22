import {
  CARDINALITIES,
  DOC_HEADS,
  hoist,
  outcomeMember,
  overDelivery,
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
 * - The arguments builder, takeArgumentsOf(delivery): templateProcessingOf's arguments over the
 *   call's sitting, whose item sessions the take's stratum before wrote (decideStage's item
 *   sessions, qti-pie's take's members), as gradeArgumentsOf's key states it (the sitting
 *   fragment), which the sittings stage after this one turns into the `sittings` relation
 *   parameter: its sessions' items' template processing (the inline qti-template-processing
 *   subtree; QTI's has no template), their declarations, each session's run (SessionSeed's seed,
 *   templateLabel of the item's identifier), and the values the run is given, gradeArgumentsOf's
 *   readers over the sessions' attempts: a session its take wrote holds none, so the run starts
 *   every variable at its declared default.
 * - The write, takeValuesOf(delivery): in a stratum after the sessions': what the one run set, by the
 *   ledger's laws on ItemSessionValue (`settable`), as the run reports what it set (grading v16's
 *   templateProcessingOf: an entry only where its value is not identical to the one the run began
 *   with): each template variable's value (kind template), each response's correct response (kind
 *   correct), each response's and outcome's default (kind default), each in the sidecar of its
 *   cardinality and base type; nothing declared is copied; a record has no session sidecar, so none
 *   of it is written.
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
 * The arguments the take's run binds, in the order it binds them.
 */
const RUN_ARGUMENTS = [
  "programs",
  "program_attributes",
  "program_texts",
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
 * The take's write, takeValuesOf: its run and what it set.
 *
 * @param fragment The generator's fragments.
 * @returns Its text.
 */
const takeValues = (fragment: Fragments): string => {
  const binds = [
    ...RUN_ARGUMENTS.map((arg) => `\t\t${arg}: args.${arg}.bind(bySession(gradedSitting))`),
    ...RUN_INPUTS.map(([arg, , reads]) =>
      reads === "attempts"
        ? `\t\t${arg}: args.${arg}.bind(bySession(gradedSitting))`
        : `\t\t${arg}: args.${arg}`,
    ),
  ].join(",\n");
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
    `\t/** The arguments of the take's run, bound to the call's sitting. */
\tconst args = takeArgumentsOf(delivery)
\tconst boundTaken = args.taken.bind(bySession(gradedSitting))

\t/** The machine's run of the taken sessions' template processing: one call, every argument a query over the
\t * sitting's key, so every insert below reads one evaluation of it. */
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
    `\n\treturn ${unionTree(["set", ...sets.map(({ name }) => name)])}\n}\n`,
  ];

  return overDelivery(out.join("\n"));
};

/**
 * The end of the grading module's import, as the stages before leave it.
 */
const GRADING_IMPORT_END = '  seedStreamKey,\n} from "#ledger/grading.ts";\n';

/**
 * The ledger module's import, as the stages before leave it.
 */
const LEDGER_IMPORT = 'import { CompletionStatus } from "#ledger/ledger.ts";\n';

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

  const src = `${stage.replace(/\n+$/u, "")}\n${hoist(takeArguments(fragment))}${takeValues(fragment)}`;
  must(count(src, GRADING_IMPORT_END) === 1, "the grading module's one import");
  must(count(src, LEDGER_IMPORT) === 1, "the ledger module's one import");

  return replaceFirst(
    replaceFirst(
      src,
      GRADING_IMPORT_END,
      '  seedStreamKey,\n  templateLabel,\n  templateProcessingOf,\n} from "#ledger/grading.ts";\n',
    ),
    LEDGER_IMPORT,
    'import { CompletionStatus, SessionValueKind } from "#ledger/ledger.ts";\n',
  );
};
