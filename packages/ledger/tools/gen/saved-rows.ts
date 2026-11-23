/**
 * The generator of `src/saved-rows.ts`, the latest save of each item session of a sitting with
 * every value it holds: one read per snapshot sidecar of the Ledger level, each at the save's key,
 * in the attachment of its cardinality and under its base type's name.
 *
 * Its facts are the level's own relations (`#ledger/ledger.ts`), never a table of this file's:
 * every sidecar of each response cardinality that holds a value of one base type
 * (`Snapshot<Cardinality><BaseType>`), in the order the level declares them, and the fields each
 * holds beyond Save's key, in their declared order. The shared runner, `tools/gen/main.ts`, writes
 * the target (`pnpm generate`) and refuses a committed file that differs from it
 * (`pnpm generate:check`).
 *
 * The level loads `src/grading.ts`, a generated file, so `generate` imports the level when it
 * runs, after that file's generator (`reads`), never statically.
 */
import type { LedgerLevel } from "#ledger/delivery.ts";
import type { Generator } from "#tools/gen/generator.ts";

/**
 * QTI's cardinalities (§2.2.2), each the attachment of a save's value rows
 * (`#ledger/served-values.ts` ValueRows), by the name its sidecars start with.
 */
const cardinalities = [
  { attachment: "single", prefix: "SnapshotSingle", reads: "singlesOf" },
  { attachment: "multiple", prefix: "SnapshotMultiple", reads: "multiplesOf" },
  { attachment: "ordered", prefix: "SnapshotOrdered", reads: "orderedsOf" },
  { attachment: "record", prefix: "SnapshotRecord", reads: "recordsOf" },
] as const;

/**
 * One snapshot sidecar of one base type: its relation's name, its base type's name as ValueRows
 * names it (`directedPair`), and the fields it holds beyond its snapshot's key, the columns its
 * read finds. A field that states under `writing` that PostgreSQL or grizzle writes it is no
 * column of the value.
 */
interface Sidecar {
  readonly baseType: string;
  readonly name: string;
  readonly values: readonly string[];
}

/**
 * The Ledger level's snapshot sidecars of a base type, in the order it declares them: a record's
 * field header (`SnapshotRecord`) holds no value, so it is none of them.
 */
const sidecarsOf = (ledger: LedgerLevel): readonly Sidecar[] => {
  const snapshotKey: readonly string[] = ledger.relations.Save.primaryKey;

  return Object.values(ledger.relations).flatMap((relation) => {
    const cardinality = cardinalities.find(({ prefix }) => relation.name.startsWith(prefix));
    const suffix = cardinality === undefined ? "" : relation.name.slice(cardinality.prefix.length);

    return relation.kind === "relation" && suffix !== ""
      ? [
          {
            baseType: `${suffix.charAt(0).toLowerCase()}${suffix.slice(1)}`,
            name: relation.name,
            values: Object.entries(relation.fields)
              .filter(([field, type]) => !snapshotKey.includes(field) && !("writing" in type))
              .map(([field]) => field),
          },
        ]
      : [];
  });
};

/**
 * One sidecar's read at the save its parent row carries: every value of it, by its variable.
 */
const readOf = ({ baseType, name, values }: Sidecar): string => {
  const columns = values.toSorted().join(", ");

  return `.attach(
    "${baseType}",
    (values) =>
      query(delivery).rule((r) => {
        const { ${columns} } = v(${name}, "value");

        return r
          .match(${name}, { ...keyOf(values), ${columns} })
          .find({ ${columns} });
      }),
    "array",
  )`;
};

/**
 * `src/saved-rows.ts` as this generator prints it, before the formatter.
 */
const savedRowsText = (sidecars: readonly Sidecar[]): string => {
  const names = sidecars.map(({ name }) => name).toSorted();
  const valueReads = cardinalities.map(
    ({ prefix, reads }) =>
      `const ${reads} = (save: SaveKey) =>
    query(delivery)
      .rule((r) => r.match(ResponseSnapshot, keyOf(save)).find(keyOf(save)))${sidecars
        .filter(({ name }) => name.startsWith(prefix))
        .map(readOf)
        .join("")};`,
  );

  return `/**
 * The latest save of each item session of a sitting, with every value it holds, by its shape then
 * its base type (\`#ledger/served-values.ts\` \`ValueRows\`): what a reopened item restores, QTI's
 * suspended state (§2.2.1), "the candidate's responses are restored correctly" (conformance
 * T-14), \`#ledger/served-values.ts\` \`responsesOfRows\` reading it into the responses
 * \`#ledger/served-item.ts\` \`resumedOf\` starts the item from. An application attaches it under its
 * own read of the sitting, so every member's save is part of that read's one statement.
 *
 * The latest save is the one derivation every reader of it shares, \`#ledger/sitting-queries.ts\`
 * \`latestSavesOf\`, the close's among them. Each shape is one row of the save's snapshot carrying its
 * eleven arrays, by base type: a row of all forty-four attached directly is past what TypeScript
 * instantiates, and grizzle's evidence proves no \`"one"\` child of a row's own key, so the row
 * comes as an array of one.
 *
 * Generated from the Ledger level's sidecars by \`tools/gen/saved-rows.ts\`: after changing one, run
 * \`pnpm generate\` in \`packages/ledger\`; \`pnpm generate:check\` refuses this file where it differs.
 *
 * @module
 */
import type { Facts, InstantDomain, NaturalDomain, Term } from "@bjornpagen/grizzle";
import { query, v } from "@bjornpagen/grizzle";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";
import { latestSavesOf } from "#ledger/sitting-queries.ts";

/**
 * A text field as a parent row carries it to the reads attached to it.
 */
type TextTerm = Term<string, unknown, unknown, "text", unknown, Facts, unknown>;

/**
 * A sitting's stage as a parent row carries it.
 */
type BigintTerm = Term<bigint, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * An item session's place as a parent row carries it.
 */
type NaturalTerm = Term<NaturalDomain, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * An instant as a parent row carries it.
 */
type InstantTerm = Term<InstantDomain, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * A sitting's key as a parent row carries it: its child and its stage.
 */
export type SittingKey = Readonly<{ child: TextTerm; stage: BigintTerm }>;

/**
 * A save's key as a parent row carries it: its item session's and its instant.
 */
type SaveKey = Readonly<{
  at: InstantTerm;
  child: TextTerm;
  n: NaturalTerm;
  package: TextTerm;
  path: TextTerm;
}>;

/**
 * A save's key alone, out of a row that carries it.
 *
 * @param key The row.
 * @returns Its child, item, place and instant.
 */
const keyOf = (key: SaveKey) => ({
  at: key.at,
  child: key.child,
  n: key.n,
  package: key.package,
  path: key.path,
});

/**
 * Give the latest saves of a sitting's item sessions, as a read to attach under an application's
 * read of the sitting, by the sitting's key its parent row carries: each item session of it that
 * has a save, by its key, with its latest save's instant and every value that save holds.
 *
 * @param delivery The Delivery level.
 * @returns The sitting's saves, an \`"array"\` attachment, each row's \`single\`, \`multiple\`,
 *   \`ordered\` and \`record\` its value rows.
 */
export const savedRowsOf = (delivery: DeliveryLevel) => {
  const { ItemSession, ResponseSnapshot, ${names.join(", ")} } = delivery.relations;
  const saves = latestSavesOf(delivery);
  ${valueReads.join("\n")}

  const sittingAt = query(delivery).rule((r) => {
    const child = r.param("child", ItemSession.fields.child);
    const stage = r.param("stage", ItemSession.fields.stage);

    return r.match(ItemSession, { child, stage }).find({ child, stage });
  });

  return (sitting: SittingKey) =>
    query(delivery)
      .rule((r) => {
        const savesAt = saves.bind({
          sittings: sittingAt.bind({ child: sitting.child, stage: sitting.stage }),
        });
        const { at, child, n, package: pkg, path } = v(savesAt, "saved");

        return r
          .match(savesAt, { at, child, n, package: pkg, path })
          .find({ at, child, n, package: pkg, path });
      })
${cardinalities.map(({ attachment, reads }) => `      .attach("${attachment}", ${reads}, "array")`).join("\n")};
};
`;
};

/**
 * The generator of `src/saved-rows.ts`: the Ledger level's sidecars, the level built over any
 * roster's registry, since a sidecar's fields are the same under every roster, printed and passed
 * through the formatter's one pass, whose output is its own fixed point.
 */
export const generator: Generator = {
  generate: async (tools) => {
    const [{ QtiLom }, { ledgerOf }, { registryOf }, { customOperators }] = await Promise.all([
      import("@qti-pie/pantry/qti/lom.ts"),
      import("#ledger/ledger.ts"),
      import("#ledger/registry/levels.ts"),
      import("#ledger/registry/operators.ts"),
    ]);
    const ledger = ledgerOf(
      registryOf(QtiLom, {
        bindings: [],
        graders: [],
        operators: customOperators,
        rubricUses: [],
        tables: [],
      }).Registry,
    );

    return await tools.format(savedRowsText(sidecarsOf(ledger)));
  },
  reads: [
    "../crust/src/",
    "../pantry/src/",
    "../plate/src/admission-codes.ts",
    "src/credit.ts",
    "src/evaluations.ts",
    "src/grading.ts",
    "src/keys.ts",
    "src/ledger.ts",
    "src/registry/",
    "src/scalars.ts",
    "src/sittings.ts",
  ],
  target: "src/saved-rows.ts",
};
