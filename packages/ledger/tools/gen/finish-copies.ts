/**
 * The generator of `src/finish-copies.ts`, the finish's copies of saves: one insert per snapshot
 * sidecar of the Ledger level, each a closing member's latest save's rows written again as the
 * values of the attempt the finish writes for it.
 *
 * Its facts are the level's own relations (`#ledger/ledger.ts`), never a table of this file's:
 * every sidecar of each response cardinality (`Snapshot<Cardinality>…`), in the order the level
 * declares them, and the fields each holds beyond Save's key, in their declared order. So a sidecar
 * added, removed or reshaped there is regenerated here. The shared runner, `tools/gen/main.ts`,
 * writes the target (`pnpm generate`) and refuses a committed file that differs from it
 * (`pnpm generate:check`).
 *
 * The level loads `src/grading.ts`, a generated file, which loads plate's `admission-codes.ts`,
 * another: so `generate` imports the level when it runs, after their generators (`reads`), never
 * statically, which would load them before any generator runs.
 */
import type { LedgerLevel } from "#ledger/delivery.ts";
import type { Generator } from "#tools/gen/generator.ts";

/**
 * QTI's cardinalities (§2.2.2), each the shape of a family of snapshot sidecars, by the name its
 * relations start with, and the ChangeSet of its copies, one a cardinality, since grizzle's types
 * admit no helper generic over a relation's heading.
 */
const cardinalities = [
  { group: "singles", prefix: "SnapshotSingle" },
  { group: "multiples", prefix: "SnapshotMultiple" },
  { group: "ordereds", prefix: "SnapshotOrdered" },
  { group: "records", prefix: "SnapshotRecord" },
] as const;

/**
 * One snapshot sidecar the finish copies: its relation's name and the fields it holds beyond its
 * snapshot's key, the values the copy carries over.
 */
interface Sidecar {
  readonly name: string;
  readonly values: readonly string[];
}

/**
 * The Ledger level's snapshot sidecars, in the order it declares them.
 */
const sidecarsOf = (ledger: LedgerLevel): readonly Sidecar[] => {
  const snapshotKey: readonly string[] = ledger.relations.Save.primaryKey;

  return Object.values(ledger.relations).flatMap((relation) =>
    relation.kind === "relation" &&
    cardinalities.some(({ prefix }) => relation.name.startsWith(prefix))
      ? [
          {
            name: relation.name,
            values: Object.keys(relation.fields).filter((field) => !snapshotKey.includes(field)),
          },
        ]
      : [],
  );
};

/**
 * An object of `fields` in code-point order, as the lint orders keys, `package` under its variable
 * `pkg`, since `package` is a reserved word. One line: the formatter breaks it where it is too
 * wide.
 */
const objectOf = (fields: readonly string[]): string =>
  `{ ${fields
    .toSorted()
    .map((field) => (field === "package" ? "package: pkg" : field))
    .join(", ")} }`;

/**
 * One sidecar's copy: its rows at the closing member's latest save, without the save's instant,
 * which the attempt's insert stamps anew.
 */
const insertOf = ({ name, values }: Sidecar): string => {
  const key = ["child", "n", "package", "path"];

  return `.insert(${name}, query(delivery).rule((r) => {
    const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
    const { ${values.join(", ")} } = v(${name}, "saved");

    return r
      .match(savedAt, { at, child, n, package: pkg, path })
      .match(${name}, ${objectOf(["at", ...key, ...values])})
      .find(${objectOf([...key, ...values])});
  }))`;
};

/**
 * The module's head: what it is, and the one query every copy reads.
 */
const head = `/**
 * The finish's copies of saves (\`#ledger/finish.ts\`): each snapshot sidecar's rows of a closing
 * member's latest save, written again as the values of the attempt the finish writes for it, at
 * the instant the database stamps that attempt's snapshot with, one insert per sidecar, since
 * grizzle's types admit no helper generic over a relation's heading, each shape's inserts a
 * ChangeSet of their own, joined by \`ChangeSet.union\`. "The latest save of an item session is its
 * responses now: what ... the end of a simultaneous part submits" (the app's \`saveTestItem\`); a
 * save holds response values alone, so the attempt's response processing starts from exactly
 * them. A member with no save has none to copy, and its attempt holds no response value.
 *
 * Generated from the Ledger level's sidecars by \`tools/gen/finish-copies.ts\`: after changing one,
 * run \`pnpm generate\` in \`packages/ledger\`; \`pnpm generate:check\` refuses this file where it
 * differs.
 */
import { ChangeSet, query, v } from "@bjornpagen/grizzle";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";
import { closingOf, latestSavesOf, sittingHeading } from "#ledger/sitting-queries.ts";

/**
 * Each closing member's latest save: an item session the end of one of the call's \`sittings\`
 * submits ({@link closingOf}), with its latest save's instant, the one source every copy reads.
 */
const closingSavesOf = (delivery: DeliveryLevel) => {
  const closing = closingOf(delivery);
  const saves = latestSavesOf(delivery);

  return query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const closingAt = closing.bind({ sittings });
    const savesAt = saves.bind({ sittings });
    const { child, package: pkg, path, n } = v(closingAt, "closing");
    const { at } = v(savesAt, "save");

    return r
      .match(closingAt, { child, n, package: pkg, path })
      .match(savesAt, { at, child, n, package: pkg, path })
      .find({ at, child, n, package: pkg, path });
  });
};
`;

/**
 * `src/finish-copies.ts` as this generator prints it, before the formatter.
 */
const finishCopiesText = (sidecars: readonly Sidecar[]): string => {
  const names = sidecars.map(({ name }) => name).toSorted();
  const groups = cardinalities.map(
    ({ group, prefix }) =>
      `const ${group} = ChangeSet.empty(delivery)${sidecars
        .filter(({ name }) => name.startsWith(prefix))
        .map(insertOf)
        .join("")};`,
  );

  return `${head}
/**
 * The copies of each closing member's latest save.
 */
export const savedCopiesOf = (delivery: DeliveryLevel) => {
  const closingSaves = closingSavesOf(delivery);
  const { ${names.join(", ")} } = delivery.relations;
  ${groups.join("\n")}

  return ChangeSet.union(ChangeSet.union(singles, multiples), ChangeSet.union(ordereds, records));
};
`;
};

/**
 * The generator of `src/finish-copies.ts`: the Ledger level's sidecars, the level built over any
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

    return await tools.format(finishCopiesText(sidecarsOf(ledger)));
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
  target: "src/finish-copies.ts",
};
