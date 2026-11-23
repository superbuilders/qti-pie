import type { Fragments } from "#tools/gen/grade/fragments.ts";
import {
  arrows,
  count,
  indexOf,
  must,
  readerOf,
  replaceAll,
  replaceFirst,
} from "#tools/gen/grade/text.ts";

/**
 * The defaults stage of grade.ts, its last: an attempt that submitted every response at its
 * default (`DefaultSubmission`; QTI 3.0.1 ASI Table 7.19.6, a skipped item's "response variables
 * are submitted with their default value or are NULL") is graded from its defaults and stored as
 * it was submitted. It rewrites what the stage before it wrote:
 *
 * - GradeArgumentsOf's runsOf marks such an attempt's run `defaulted`, so the machine gives it no
 *   response variable and its start_of starts each response at its default in force, the attempt's
 *   numAttempts being > 0 (information model Table 5.115);
 * - GradeAttemptOf writes, beside every graded attempt's outcomes, such an attempt's responses as its
 *   run began them: each sidecar rule over the run's outcomes matches the run's variables of the
 *   kinds the attempt writes (`writtenOf`, by the run key), never a built-in (numAttempts,
 *   duration) or completionStatus, whose one home is ProcessedAttempt.
 */

/**
 * The text of an exported builder, from its head to the next export's head.
 *
 * @param text Grade.ts.
 * @param name The builder's name.
 * @returns Where the builder begins and where the next export does.
 */
const exportOf = (text: string, name: string): readonly [number, number] => {
  const from = indexOf(text, `export const ${name} = `);
  const next = text.indexOf("\nexport const ", from + 1);

  return [from, next === -1 ? text.length : next];
};

/**
 * GradeArgumentsOf's runsOf as two rules, by whether the attempt submitted every response at its
 * default (DefaultSubmission): such a run is `defaulted`, so the machine gives no declared response
 * a header and its start_of starts each at its default in force; every other run is not.
 *
 * @param builder GradeArgumentsOf's text.
 * @returns The builder rewritten.
 */
const withDefaultedRuns = (builder: string): string => {
  const head = "  const runsOf = ";
  const runsFrom = indexOf(builder, head);
  const runs = readerOf(builder, head);
  const [rule] = arrows(runs);
  must(rule !== undefined && arrows(runs).length === 1, "runsOf's one rule");

  const flag = "defaulted: Type.literal(DocumentRun.fields.defaulted, false),";
  const match = ".match(attempt, { at, child, n, package: pkg, path, stage })";
  must(count(rule, flag) === 1 && count(rule, match) === 1, "runsOf's flag and attempt");

  const defaulted = replaceFirst(
    replaceFirst(rule, flag, "defaulted: Type.literal(DocumentRun.fields.defaulted, true),"),
    match,
    `${match}\n      .match(fields.DefaultSubmission, { at, child, n, package: pkg, path })`,
  );
  const submitted = replaceFirst(
    rule,
    match,
    `${match}\n      .where(r.not(fields.DefaultSubmission, { at, child, n, package: pkg, path }))`,
  );
  const ruleFrom = indexOf(builder, rule, runsFrom);
  const doc = ".\n   */\n  const runsOf = ";
  must(count(builder, doc) === 1, "runsOf's doc");

  return replaceFirst(
    `${builder.slice(0, ruleFrom)}${submitted})\n    .rule(${defaulted}${builder.slice(ruleFrom + rule.length)}`,
    doc,
    ". A run is `defaulted` where its attempt submitted every response at its default\n   * (DefaultSubmission, Table 7.19.6), so the run starts each at its default in force.\n   */\n  const runsOf = ",
  );
};

/**
 * A gradeAttemptOf sidecar rule over the run's outcomes, rewritten to write the kinds its attempt
 * writes; any other rule as it is.
 *
 * @param rule The rule's text.
 * @returns The rule rewritten.
 */
const writtenRule = (rule: string): string => {
  if (!rule.includes('v(out.vars, "outcome")')) {
    return rule;
  }

  const attempt = ".match(attempt, { at, child, n, package: pkg, path, stage })";
  must(
    count(rule, "const out = run;\n") === 1 &&
      count(rule, 'kind: "outcome",') === 1 &&
      count(rule, attempt) === 1,
    `a sidecar rule's run, kind and attempt in ${rule.slice(0, 300)}`,
  );

  const read = replaceFirst(
    replaceFirst(
      rule,
      "const out = run;\n",
      "const out = run;\n          const written = boundWrittenIn(r);\n",
    ),
    'v(out.vars, "outcome");',
    'v(out.vars, "outcome");\n          const { kind } = v(written, "written");',
  );

  return replaceAll(
    replaceFirst(
      replaceFirst(read, 'kind: "outcome",', "kind,"),
      attempt,
      `${attempt}\n            .match(written, { child, kind, package: pkg, path, stage })`,
    ),
    '.where(r.ne(identifier, "completionStatus"))',
    '.where(\n              r.ne(identifier, "completionStatus"),\n              r.ne(identifier, "numAttempts"),\n              r.ne(identifier, "duration"),\n            )',
  );
};

/**
 * GradeAttemptOf with `writtenOf` and every sidecar rule over the run's outcomes writing the kinds
 * its attempt writes.
 *
 * @param builder GradeAttemptOf's text.
 * @param fragment The generator's fragments.
 * @returns The builder rewritten.
 */
const writingDefaults = (builder: string, fragment: Fragments): string => {
  const anchor =
    "  const boundGradableIn = (r: Rule<DeliveryLevel>) => gradableOf.bind(bySession(r));\n";
  must(count(builder, anchor) === 1, "gradeAttemptOf's boundGradableIn");

  const head = replaceFirst(builder, anchor, anchor + fragment("defaults/written"));
  const pieces: string[] = [];
  let at = 0;
  let rewritten = 0;
  for (const rule of arrows(head)) {
    const from = indexOf(head, rule, at);
    const next = writtenRule(rule);
    rewritten += next === rule ? 0 : 1;
    pieces.push(head.slice(at, from), next);
    at = from + rule.length;
  }
  pieces.push(head.slice(at));
  must(rewritten === 55, `55 sidecar rules over the run's outcomes, not ${String(rewritten)}`);

  return pieces.join("");
};

/**
 * The defaults stage over the stage before's grade.ts.
 *
 * @param source The stage before's grade.ts.
 * @param fragment The generator's fragments.
 * @returns Grade.ts with DefaultSubmission graded from its defaults and written as submitted.
 */
export const defaultsStage = (source: string, fragment: Fragments): string => {
  const grading = "  DocText,\n  DocumentAttribute,\n";
  must(count(source, grading) === 1, "the grading module's import");

  const text = replaceFirst(source, grading, "  DocText,\n  DocVar,\n  DocumentAttribute,\n");
  const [argsFrom, argsTo] = exportOf(text, "gradeArgumentsOf");
  const args = withDefaultedRuns(text.slice(argsFrom, argsTo));
  const graded = text.slice(0, argsFrom) + args + text.slice(argsTo);
  const [gradeFrom, gradeTo] = exportOf(graded, "gradeAttemptOf");

  return (
    graded.slice(0, gradeFrom) +
    writingDefaults(graded.slice(gradeFrom, gradeTo), fragment) +
    graded.slice(gradeTo)
  );
};
