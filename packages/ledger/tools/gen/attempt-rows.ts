/**
 * The generator of `src/attempt-rows.ts`, each item session of a sitting at its latest attempt with
 * every value it holds as it stands, its credit and its marks: one read per snapshot sidecar of the
 * Ledger level, each at the attempt's key, in the attachment of its cardinality and under its base
 * type's name, a single's through the Delivery level's values in force.
 *
 * Its facts are the level's own relations (`#ledger/ledger.ts`), the sidecars the saved rows'
 * generator reads (`#tools/gen/saved-rows.ts` levelSidecars, valueReadsOf), never a table of this
 * file's. A single's value in force is `OutcomeInForceSingle<BaseType>`
 * (`#ledger/assertion-views.ts`), whose heading is its sidecar `SnapshotSingle<BaseType>`'s, so its
 * relation's name is the sidecar's with that prefix. The shared runner, `tools/gen/main.ts`, writes
 * the target (`pnpm generate`) and refuses a committed file that differs from it (`pnpm
 * generate:check`).
 *
 * The level loads `src/grading.ts`, a generated file, so `generate` imports the level when it
 * runs, after that file's generator (`reads`), never statically.
 */
import type { Generator } from "#tools/gen/generator.ts";
import { cardinalities, levelSidecars, sidecarReads, valueReadsOf } from "#tools/gen/saved-rows.ts";

/**
 * The relation a single's value in force is read through, by its sidecar's name.
 *
 * @param name The sidecar, `SnapshotSingle<BaseType>`.
 * @returns `OutcomeInForceSingle<BaseType>`.
 */
const inForceOf = (name: string): string =>
  `OutcomeInForceSingle${name.slice("SnapshotSingle".length)}`;

/**
 * One mark read of a value's shape: its attachment's name, the read of `markReadsOf` it matches,
 * and the columns it finds beyond the mark's own (`variable`, `place`, `mark`, `copies`), as
 * `#ledger/served-values.ts` MarkRows names them.
 */
const markedValues = [
  { columns: ["baseType", "value"], name: "text" },
  { columns: ["value"], name: "integer" },
  { columns: ["baseType", "value"], name: "float" },
  { columns: ["value"], name: "boolean" },
  { columns: ["greatest", "least"], name: "pair" },
  { columns: ["source", "target"], name: "directedPair" },
  { columns: ["x", "y"], name: "point" },
  { columns: ["contentType", "digest"], name: "file" },
] as const;

/**
 * One shape's marks at the attempt its parent row carries, read from `markReadsOf` bound to the
 * attempt's sitting.
 */
const markReadOf = ({ columns, name }: (typeof markedValues)[number]): string => {
  const found = [...columns, "copies", "mark", "place", "variable"].toSorted().join(", ");

  return `.attach(
    "${name}",
    (marked) =>
      query(delivery).rule((r) => {
        const read = marks.${name}.bind({
          sittings: sittingAt.bind({ child: marked.child, stage: marked.stage }),
        });
        const { ${found} } = v(read, "mark");

        return r
          .match(read, { ...keyOf(marked), ${found} })
          .find({ ${found} });
      }),
    "array",
  )`;
};

/**
 * `src/attempt-rows.ts` as this generator prints it, before the formatter.
 */
const attemptRowsText = (sidecars: Awaited<ReturnType<typeof levelSidecars>>): string => {
  const names = [
    ...sidecars.map(({ name }) => (name.startsWith("SnapshotSingle") ? inForceOf(name) : name)),
    "Attempt",
    "AttemptCredit",
    "ItemSession",
    "LatestAttempt",
    "ProcessedAttempt",
  ].toSorted();
  const valueReads = valueReadsOf(
    sidecars,
    { head: "Attempt", key: "AttemptKey", param: "attempt" },
    inForceOf,
  );

  return `/**
 * Each item session of a sitting at its latest attempt, as it stands, with every value it holds, by
 * its shape then its base type (\`#ledger/served-values.ts\` \`AttemptRows\`), its credit and its
 * marks: what a review of the sitting shows of each of its questions, \`#ledger/served-values.ts\`
 * \`recordOfRows\` and \`judgedOfRows\` reading it into the record after the attempt and what the
 * database judged of it. An application attaches it under its own read of the sitting, so every
 * member's attempt is part of that read's one statement.
 *
 * - **The attempts**: each item session of the sitting at its latest attempt, processed or not (the
 *   Delivery level's \`LatestAttempt\`), by its key.
 * - **\`processed\`**: the completion status its response processing left (\`ProcessedAttempt\`),
 *   none while it is pending response processing (Results Reporting, Table 2.7.7,
 *   \`pendingResponseProcessing\`: "the item variables represent the values of the response
 *   variables after submission but before response processing has taken place"), such as an essay
 *   waiting for a person's value.
 * - **Its values**: each single as it stands, response processing's value or, where an
 *   external-scored outcome is asserted, its latest assertion's (\`OutcomeInForceSingle<BaseType>\`),
 *   and each multiple, ordered and record value as its snapshot holds it, a value of those
 *   cardinalities being never asserted.
 * - **\`credit\`**: its credit (\`AttemptCredit\`, the owner's rule), none while its score is pending
 *   or where its scores say none.
 * - **\`marks\`**: the database's marks on its responses' parts, \`#ledger/mark-reads.ts\`
 *   \`markReadsOf\`, bound to its sitting, whose evaluation of \`attemptMarksOf\` every shape's read
 *   of the statement shares.
 *
 * The latest attempt is the one derivation every reader of it shares, the Delivery level's
 * \`LatestAttempt\`, the marks' own among them. Each shape is one row of the attempt carrying its
 * eleven arrays, by base type, and its marks one row carrying eight, by the value's columns: a row of
 * all of them attached directly is past what TypeScript instantiates, and grizzle's evidence proves
 * no \`"one"\` child of a row's own key, so each row comes as an array of one.
 *
 * Generated from the Ledger level's sidecars by \`tools/gen/attempt-rows.ts\`: after changing one, run
 * \`pnpm generate\` in \`packages/ledger\`; \`pnpm generate:check\` refuses this file where it differs.
 *
 * @module
 */
import type { Facts, InputOrigin, InstantDomain, NaturalDomain, Term } from "@bjornpagen/grizzle";
import { query, v } from "@bjornpagen/grizzle";
import { markReadsOf } from "#ledger/mark-reads.ts";
import type { SittingKey } from "#ledger/saved-rows.ts";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";

/**
 * A text field as a parent row carries it to the reads attached to it, an input of theirs: a read
 * that matches a relation's whole key at inputs holds at most one row of it, which an \`"option"\`
 * attachment needs proved.
 */
type TextTerm = Term<string, unknown, InputOrigin, "text", unknown, Facts, unknown>;

/**
 * A sitting's stage as a parent row carries it.
 */
type BigintTerm = Term<bigint, unknown, InputOrigin, "bigint", unknown, Facts, unknown>;

/**
 * An item session's place as a parent row carries it.
 */
type NaturalTerm = Term<NaturalDomain, unknown, InputOrigin, "bigint", unknown, Facts, unknown>;

/**
 * An instant as a parent row carries it.
 */
type InstantTerm = Term<InstantDomain, unknown, InputOrigin, "bigint", unknown, Facts, unknown>;

/**
 * An attempt's key as a parent row carries it: its item session's and its instant.
 */
type AttemptKey = Readonly<{
  at: InstantTerm;
  child: TextTerm;
  n: NaturalTerm;
  package: TextTerm;
  path: TextTerm;
}>;

/**
 * An attempt's key with its sitting's stage, as the attempt's row carries it to its marks.
 */
type MarkedKey = AttemptKey & Readonly<{ stage: BigintTerm }>;

/**
 * An attempt's key alone, out of a row that carries it.
 *
 * @param key The row.
 * @returns Its child, item, place and instant.
 */
const keyOf = (key: AttemptKey) => ({
  at: key.at,
  child: key.child,
  n: key.n,
  package: key.package,
  path: key.path,
});

/**
 * Give the reads of an attempt's rows over the Delivery level: \`attempt\`, each a read to attach
 * under a row that carries an attempt's key and its sitting's stage, by its attachment's name (the
 * completion status its processing left, every value it holds as it stands by cardinality, its
 * credit and its marks), which every reader of an attempt's rows attaches as they stand; and
 * \`sitting\`, a read to attach under an application's read of a sitting, by the sitting's key its
 * parent row carries: each item session of it that has an attempt, by its key, at its latest
 * attempt, with those reads attached.
 *
 * @param delivery The Delivery level.
 * @returns \`attempt\`, the reads of one attempt's rows, and \`sitting\`, the sitting's attempts, an
 *   \`"array"\` attachment, each row's \`single\`, \`multiple\`, \`ordered\` and \`record\` its value
 *   rows, \`processed\` its completion status where its response processing has run (an
 *   \`"option"\`), \`credit\` its credit and \`marks\` its mark rows.
 */
export const attemptRowsOf = (delivery: DeliveryLevel) => {
  const { ${names.join(", ")} } = delivery.relations;
  const marks = markReadsOf(delivery);
  ${valueReads.join("\n")}

  const processedOf = (attempt: AttemptKey) =>
    query(delivery).rule((r) => {
      const { completionStatus } = v(ProcessedAttempt, "processed");

      return r
        .match(ProcessedAttempt, { ...keyOf(attempt), completionStatus })
        .find({ completionStatus });
    });

  const creditOf = (attempt: AttemptKey) =>
    query(delivery).rule((r) => {
      const { earned, kind, maximum } = v(AttemptCredit, "credit");

      return r
        .match(AttemptCredit, { ...keyOf(attempt), earned, kind, maximum })
        .find({ earned, kind, maximum });
    });

  const sittingAt = query(delivery).rule((r) => {
    const child = r.param("child", ItemSession.fields.child);
    const stage = r.param("stage", ItemSession.fields.stage);

    return r.match(ItemSession, { child, stage }).find({ child, stage });
  });

  const marksOf = (attempt: MarkedKey) =>
    query(delivery)
      .rule((r) =>
        r.match(Attempt, keyOf(attempt)).find({ ...keyOf(attempt), stage: attempt.stage }),
      )${markedValues.map(markReadOf).join("")};

  const attempt = {
${[
  "    credit: creditOf,",
  "    marks: marksOf,",
  "    processed: processedOf,",
  ...cardinalities.map(({ attachment, reads }) => `    ${attachment}: ${reads},`),
]
  .toSorted()
  .join("\n")}
  } as const;

  return {
    attempt,
    sitting: (sitting: SittingKey) =>
      query(delivery)
        .rule((r) => {
          const { at, child, n, package: pkg, path, stage } = v(LatestAttempt, "latest");

          return r
            .match(LatestAttempt, { at, child, n, package: pkg, path, stage })
            .where(r.eq(child, sitting.child), r.eq(stage, sitting.stage))
            .find({ at, child, n, package: pkg, path, stage });
        })
        .attach("processed", attempt.processed, "option")
${cardinalities.map(({ attachment }) => `        .attach("${attachment}", attempt.${attachment}, "array")`).join("\n")}
        .attach("credit", attempt.credit, "array")
        .attach("marks", attempt.marks, "array"),
  } as const;
};
`;
};

/**
 * The generator of `src/attempt-rows.ts`: the Ledger level's sidecars
 * (`#tools/gen/saved-rows.ts` levelSidecars), printed and passed through the formatter's one pass,
 * whose output is its own fixed point.
 */
export const generator: Generator = {
  generate: async (tools) => await tools.format(attemptRowsText(await levelSidecars())),
  reads: sidecarReads,
  target: "src/attempt-rows.ts",
};
