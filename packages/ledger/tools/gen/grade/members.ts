import type { Fragments } from "#tools/gen/grade/fragments.ts";
import {
  arrows,
  byCodeUnits,
  count,
  indexOf,
  lastIndexBefore,
  must,
  readerOf,
  replaceAll,
  replaceFirst,
} from "#tools/gen/grade/text.ts";

/**
 * The members stage of grade.ts: the test run's readers, `testTreeOf` and
 * `memberValuesOf` (P4-TEST's spec), appended to the base stage. The member values' doc readers
 * are attemptArgumentsOf's own snapshot readers, read out of the base stage's text and kept rule
 * by rule: a rule over a session's template values (ItemSessionValue*) or the previous attempt's
 * status is dropped, and a single's sidecar is read through its value in force over the latest
 * attempt's session alone (`valuesInForceOf`, the same heading). That definition is
 * `#ledger/assertion-views.ts`'s `valuesInForceOf`, whose text this stage writes into grade.ts over
 * the Delivery level: a grizzle query is written over one level, and grade.ts's builders hold the
 * Delivery level alone.
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
  ["field_texts", "fieldTextsOf", "doc_field_texts"],
  ["field_integers", "fieldIntegersOf", "doc_field_integers"],
  ["field_floats", "fieldFloatsOf", "doc_field_floats"],
  ["field_booleans", "fieldBooleansOf", "doc_field_booleans"],
  ["field_pairs", "fieldPairsOf", "doc_field_pairs"],
  ["field_directed_pairs", "fieldDirectedPairsOf", "doc_field_directed_pairs"],
  ["field_points", "fieldPointsOf", "doc_field_points"],
  ["field_files", "fieldFilesOf", "doc_field_files"],
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
 * The rule with a single's snapshot sidecar read as its value in force, over the latest attempt's
 * item session alone (`latestSession`): the in-force query of its base type bound to it, matched in
 * the sidecar's place.
 *
 * @param rule The rule's text.
 * @returns The rule over the values in force.
 */
const inForce = (rule: string): string => {
  const types = [...rule.matchAll(/fields\.SnapshotSingle(?<type>[A-Z]\w*)/gu)].map(
    (match) => match.groups?.["type"] ?? "",
  );
  if (types.length === 0) {
    return rule;
  }

  const [type = ""] = types;
  must(
    types.length === 2 && types.every((each) => each === type),
    `a single's rule reads its sidecar once: ${rule}`,
  );

  const read = `v(fields.SnapshotSingle${type}, "value")`;
  must(count(rule, read) === 1, `the single's read: ${rule}`);

  const statement = lastIndexBefore(rule, "const {", indexOf(rule, read));
  must(statement !== -1, `the single's destructuring: ${rule}`);

  const bound = `const inForce = valuesInForce.${type}.bind({ sessions: latestSession });\n`;

  return replaceFirst(
    replaceFirst(
      `${rule.slice(0, statement)}${bound}${rule.slice(statement)}`,
      read,
      'v(inForce, "value")',
    ),
    `.match(fields.SnapshotSingle${type}, {`,
    ".match(inForce, {",
  );
};

/**
 * Grade.ts's copy of `#ledger/assertion-views.ts`'s `valuesInForceOf`, over the Delivery level: its
 * text whole, written over `delivery`, the level grade.ts's builders hold.
 *
 * @param views The text of `#ledger/assertion-views.ts`.
 * @returns The copy's text.
 */
const valuesInForceText = (views: string): string => {
  const head = "export const valuesInForceOf = (ledger: LedgerLevel) => {\n";
  const start = indexOf(views, head);
  const end = indexOf(views, "\n};\n", start) + "\n};\n".length;
  const body = views.slice(start + head.length, end);
  must(count(body, "} = ledger.relations;") === 1, "valuesInForceOf's one read of its level");

  const written = replaceAll(
    replaceFirst(body, "} = ledger.relations;", "} = delivery.relations;"),
    "query(ledger)",
    "query(delivery)",
  );
  must(
    !/\bledger\b/u.test(written.replaceAll(/\/\*\*[\s\S]*?\*\//gu, "")),
    "no other read of the level",
  );

  return `/**
 * The values in force of the item sessions \`sessions\` names, each over that relation parameter
 * alone: \`#ledger/assertion-views.ts\`'s \`valuesInForceOf\`, its text as the members stage reads it,
 * written over the Delivery level, since a grizzle query is written over one level and grade.ts's
 * builders hold the Delivery level alone.
 */
const valuesInForceOf = (delivery: DeliveryLevel) => {
${written}
`;
};

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
            count: Type.literal(DocText.fields.count, 1n),
            place: Type.literal(DocText.fields.place, 0n),
            stage,
            value: Type.literal(DocText.fields.value, "${status}"),
          });
      }`;

/**
 * The grading module's import as the base stage leaves it, and as the members stage needs it.
 */
const GRADING_IMPORT = [
  'import {\n  DocGiven,\n  DocReplyFloat,\n  DocReplyText,\n  DocText,\n  DocumentRun,\n  patternProgramOf,\n  responseLabel,\n  responseProcessingOf,\n  seedStreamKey,\n} from "#ledger/grading.ts";',
  'import {\n  DocGiven,\n  DocReplyFloat,\n  DocReplyText,\n  DocText,\n  DocumentRun,\n  patternProgramOf,\n  responseLabel,\n  responseProcessingOf,\n  seedStreamKey,\n} from "#ledger/grading.ts";',
] as const;

/**
 * The members stage: testTreeOf and memberValuesOf appended to the base stage's formatted text.
 *
 * @param src The base stage's text, formatted.
 * @param fragment The generator's fragments.
 * @param views The text of `#ledger/assertion-views.ts`, whose `valuesInForceOf` the stage copies.
 * @returns The stage's text.
 */
export const membersStage = (src: string, fragment: Fragments, views: string): string => {
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
    ["vars", "vars"],
    ...READERS.map(([key, name]) => [key, name.slice(0, -"Of".length)] as const),
  ].toSorted(([a], [b]) => byCodeUnits(a, b));
  const ret = entries.map(([key, local]) => (key === local ? key : `${key}: ${local}`)).join(", ");
  const builders = indexOf(src, "export const gradeArgumentsOf = ");
  const doc = lastIndexBefore(src, "/**", builders);
  must(doc !== -1, "gradeArgumentsOf's doc comment");

  const withViews = `${src.slice(0, doc)}${valuesInForceText(views)}\n${src.slice(doc)}`;
  const out = `${withViews.replace(/\n+$/u, "")}\n${fragment("members/test-tree-and-member-values")}${readers.join("")}\n  return { ${ret} } as const;\n};\n`;
  const [single, multiple] = GRADING_IMPORT;
  must(count(out, single) === 1, "the grading module's one import");

  return replaceAll(out, single, multiple);
};
