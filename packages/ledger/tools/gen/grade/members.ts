import type { Fragments } from "#tools/gen/grade/fragments.ts";
import {
  arrows,
  byCodeUnits,
  count,
  indexOf,
  must,
  readerOf,
  replaceAll,
} from "#tools/gen/grade/text.ts";

/**
 * The members stage of grade.ts: the test run's readers, `testTreeOf` and
 * `memberValuesOf` (P4-TEST's spec), appended to the base stage. The member values' doc readers
 * are attemptArgumentsOf's own snapshot readers, read out of the base stage's text and kept rule
 * by rule: a rule over a session's template values (ItemSessionValue*) or the previous attempt's
 * status is dropped, and a single's sidecar is read through its value in force
 * (OutcomeInForceSingle<T>, the same heading).
 */

/**
 * Each doc argument of the test run, with attemptArgumentsOf's reader and its doc relation.
 */
const READERS = [
  ["texts", "textsOf", "doc_texts"],
  ["integers", "integersOf", "doc_integers"],
  ["floats", "floatsOf", "doc_floats"],
  ["booleans", "booleansOf", "doc_booleans"],
  ["pairs", "pairsOf", "doc_pairs"],
  ["directed_pairs", "directedPairsOf", "doc_directed_pairs"],
  ["points", "pointsOf", "doc_points"],
  ["files", "filesOf", "doc_files"],
  ["file_names", "fileNamesOf", "doc_file_names"],
  ["field_texts", "fieldTextsOf", "doc_field_texts"],
  ["field_integers", "fieldIntegersOf", "doc_field_integers"],
  ["field_floats", "fieldFloatsOf", "doc_field_floats"],
  ["field_booleans", "fieldBooleansOf", "doc_field_booleans"],
  ["field_pairs", "fieldPairsOf", "doc_field_pairs"],
  ["field_directed_pairs", "fieldDirectedPairsOf", "doc_field_directed_pairs"],
  ["field_points", "fieldPointsOf", "doc_field_points"],
  ["field_files", "fieldFilesOf", "doc_field_files"],
  ["field_file_names", "fieldFileNamesOf", "doc_field_file_names"],
] as const;

/**
 * A rule over the attempt's snapshot: none over the session's template values, the previous
 * attempt's status or the attempt's ordinal (numAttempts, which the test run states itself).
 *
 * @param rule The rule's text.
 * @returns Whether the member values keep it.
 */
const kept = (rule: string): boolean =>
  ["ItemSessionValue", "boundPrevious", "boundOrdinals"].every((name) => !rule.includes(name));

/**
 * The rule with a single's snapshot sidecar read as its value in force.
 *
 * @param rule The rule's text.
 * @returns The rule over the values in force.
 */
const inForce = (rule: string): string =>
  rule.replaceAll(
    /fields\.SnapshotSingle(?<type>[A-Z]\w*)/gu,
    (_match, type: string) => `fields.OutcomeInForceSingle${type}`,
  );

/**
 * The rule giving a processed latest attempt's completion status of one value.
 *
 * @param status The completion status.
 * @returns The rule's arrow.
 */
const statusText = (status: string): string => `(r) => {
        const attempt = boundLatest;
        const { child, package: pkg, path, n, stage, at } = v(attempt, "attempt");

        return r
          .match(attempt, { at, child, n, package: pkg, path, stage })
          .match(fields.ProcessedAttempt, { at, child, completionStatus: "${status}", n, package: pkg, path })
          .find({
            base: Type.literal(DocText.fields.base, "identifier"),
            child,
            holds: Type.literal(DocText.fields.holds, "value"),
            identifier: Type.literal(DocText.fields.identifier, "completionStatus"),
            package: pkg,
            path,
            place: Type.literal(DocText.fields.place, 0n),
            stage,
            value: Type.literal(DocText.fields.value, "${status}"),
          });
      }`;

/**
 * The grading module's import as the base stage leaves it, and as the members stage needs it.
 */
const GRADING_IMPORT = [
  'import {\n  copies,\n  DocReplyFloat,\n  DocReplyText,\n  DocText,\n  DocVar,\n  responseLabel,\n  responseProcessingOf,\n  seedStreamKey,\n} from "#ledger/grading.ts";',
  'import {\n  copies,\n  DocBase,\n  DocReplyFloat,\n  DocReplyText,\n  DocText,\n  DocVar,\n  responseLabel,\n  responseProcessingOf,\n  seedStreamKey,\n} from "#ledger/grading.ts";',
] as const;

/**
 * The members stage: testTreeOf and memberValuesOf appended to the base stage's formatted text.
 *
 * @param src The base stage's text, formatted.
 * @param fragment The generator's fragments.
 * @returns The stage's text.
 */
export const membersStage = (src: string, fragment: Fragments): string => {
  const start = indexOf(src, "export const attemptArgumentsOf = ");
  const block = src.slice(start, indexOf(src, "\nexport const gradeAttemptOf = ", start));
  const readers = READERS.map(([key, name, doc]) => {
    const rules = [
      ...arrows(readerOf(block, `  const ${name} = (_session: GradedSession) =>\n`))
        .filter(kept)
        .map((rule) => replaceAll(inForce(rule), "boundGradable", "boundLatest")),
      ...(key === "texts"
        ? ["completed", "incomplete", "not_attempted", "unknown"].map(statusText)
        : []),
    ];
    must(rules.length > 0, `${name}'s kept rules`);

    return `
  /**
   * The attempt's values that cross as \`${doc}\` rows.
   */
  const ${name.slice(0, -"Of".length)} = query(delivery)${rules.map((rule) => `\n    .rule(${rule})`).join("")};\n`;
  });
  const entries = [
    ["bases", "bases"],
    ["vars", "vars"],
    ...READERS.map(([key, name]) => [key, name.slice(0, -"Of".length)] as const),
  ].toSorted(([a], [b]) => byCodeUnits(a, b));
  const ret = entries.map(([key, local]) => (key === local ? key : `${key}: ${local}`)).join(", ");
  const out = `${src.replace(/\n+$/u, "")}\n${fragment("members/test-tree-and-member-values")}${readers.join("")}\n  return { ${ret} } as const;\n};\n`;
  const [single, multiple] = GRADING_IMPORT;
  must(count(out, single) === 1, "the grading module's one import");

  return replaceAll(out, single, multiple);
};
