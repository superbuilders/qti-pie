/**
 * The laws each module names where it states them (`namedLaws` of `#pantry/test/law-namer.ts`),
 * held to the law table and to the schema: every group's name is a law of the table, every
 * statement of `Qti` sits in exactly one group, and every law grizzle names for a statement is
 * named by its group, by the entry the group's declaration gives it, so no statement of `Qti` is
 * undeclared, the law table reads each name from the statement's site and restates none.
 */
import type { Statement } from "@bjornpagen/grizzle";
import { assert, describe, it } from "@effect/vitest";
import { Array as Arr, Formatter, Option, Result } from "effect";
import { lawNameOf, lawNames } from "#pantry/import/refusal.ts";
import type { LawName } from "#pantry/import/refusal.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { namedLaws, statementLawsOf } from "#pantry/test/law-namer.ts";

describe("the laws each module names where it states them", () => {
  it("names each group by a law of the table, groups every statement of Qti once, and names each law by its statement's group, so no statement is undeclared", () => {
    // Oracle: the law table's own names, Qti's statements, and grizzle's laws of each statement
    // as an `invariant-rejected` outcome names them (`lawsByStatement`). Bound: every statement of
    // Qti.
    const known: ReadonlySet<string> = new Set(lawNames);
    const groups = new Map<Statement, readonly LawName[]>();
    for (const byName of namedLaws) {
      for (const name of Object.keys(byName)) {
        assert.isTrue(known.has(name), `${name}: no law of the table`);
      }

      for (const name of lawNames) {
        for (const statement of byName[name] ?? []) {
          groups.set(statement, [...(groups.get(statement) ?? []), name]);
        }
      }
    }

    // Every statement of Qti states one law at least: the Package unit too, sealed, whose seal is
    // its law (grizzle's README, "Units").
    const [statements, lawless] = Arr.partition(statementLawsOf(Qti), (entry) =>
      Arr.isReadonlyArrayNonEmpty(entry.laws) ? Result.succeed(entry) : Result.fail(entry),
    );
    assert.deepStrictEqual(
      lawless.map(({ statement }) => statement.kind),
      [],
      "the statements of Qti that state no law",
    );
    assert.strictEqual(groups.size, statements.length, "a group holds a statement Qti does not");
    for (const { laws, statement } of statements) {
      const names = groups.get(statement) ?? [];

      assert.lengthOf(names, 1, `the statement of ${Formatter.format(laws)}: its groups`);
      for (const law of laws) {
        assert.deepStrictEqual(
          lawNameOf(law),
          Option.fromUndefinedOr(names[0]),
          Formatter.format(law),
        );
      }
    }
  }, 300_000);
});
