/**
 * The registry's generic seed (`#ledger/registry/seed.ts`, the lead's hard cutover of 2026-11-21):
 * every installation carries it, an installation that states no table of its own included, and a
 * deployment's own rows append to it.
 */
import { assert, describe, it } from "@effect/vitest";
import { QtiLom } from "@qti-pie/pantry/qti/lom.ts";
import { Option } from "effect";
import { registryOf } from "#ledger/registry/levels.ts";
import { customOperators } from "#ledger/registry/operators.ts";
import { genericBindings, genericTables, unitTable } from "#ledger/registry/seed.ts";

/**
 * The registry of an installation that states no table and no binding of its own: edullm's
 * composition.
 */
const { RegistryRoster: bare } = registryOf(QtiLom, {
  bindings: [],
  graders: [],
  operators: customOperators,
  rubricUses: [],
  tables: [],
});

/**
 * The registry of a deployment that appends a spelling of its own to the generic unit table, as
 * metis does.
 */
const { RegistryRoster: appended } = registryOf(QtiLom, {
  bindings: [],
  graders: [],
  operators: customOperators,
  rubricUses: [],
  tables: [{ key: "ib", place: 63, table: "unit-table", value: Option.some("lb") }],
});

describe("registry/seed.ts, the generic seed", () => {
  it("is installed whole by an installation of no table of its own: every entry, map value and binding", () => {
    // Oracle: the seed module's own rows, which the closed relations must hold one for one.
    const { RegistryBinding, RegistryEntry, RegistryValue } = bare.relations;
    assert.strictEqual(RegistryEntry.rows.length, genericTables.length);
    assert.strictEqual(
      RegistryValue.rows.length,
      genericTables.filter((entry) => Option.isSome(entry.value)).length,
    );
    assert.strictEqual(RegistryBinding.rows.length, genericBindings.length);
    for (const binding of genericBindings) {
      assert.isTrue(
        RegistryBinding.rows.some(
          (row) =>
            row.class === binding.class && row.role === binding.role && row.table === binding.table,
        ),
        `${binding.class} reads ${binding.table} as ${binding.role}`,
      );
    }
  });

  it("names a table for every binding, and binds only the registry's own classes", () => {
    // Oracle: the seed's tables and the roster's classes, by hand.
    const tableNames = new Set(genericTables.map((entry) => entry.table));
    const classes = new Set<string>(customOperators.map((operator) => operator.class));
    for (const binding of genericBindings) {
      assert.isTrue(tableNames.has(binding.table), binding.table);
      assert.isTrue(classes.has(binding.class), binding.class);
    }
  });

  it("takes a deployment's own row into its table, after the registry's own", () => {
    // Oracle: the generic unit table's rows, then the one appended.
    const units = appended.relations.RegistryEntry.rows.filter((row) => row.table === "unit-table");
    assert.strictEqual(units.length, unitTable.length + 1);
    assert.isTrue(units.some((row) => row.key === "ib"));
  });
});
