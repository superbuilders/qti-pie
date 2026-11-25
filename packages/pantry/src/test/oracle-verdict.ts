/**
 * The law oracle (`#pantry/test/oracle.ts`) as the importer's tests use it: the verdict it
 * predicts of a package ({@link oracleVerdict}), which an import test compares with the
 * database's ({@link importAgreesWithOracle}); the rule its reader and codec refuse a package under
 * before any law ({@link oracleCodecRule}); and the packaging fixtures the import tests judge by
 * it.
 */
import { assert } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { readEntries } from "#pantry/package/read.ts";
import type { PackageFile } from "#pantry/package/read.ts";
import { judge, ruleOf } from "#pantry/test/oracle.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { laws } from "#pantry/test/installed-laws.ts";

/**
 * What the law oracle predicts of a package: accepted, or refused under the rules its breaches
 * keep (or its codec refusal's). The database refuses a package by the first native object that
 * fails, under every rule of the laws that object discharges, so an import agrees with the oracle
 * when one of its rules is one of these.
 */
export type OracleVerdict =
  | { readonly kind: "accepted" }
  | { readonly kind: "refused"; readonly rules: ReadonlySet<string> };

/**
 * Predict a package's verdict by the law oracle over its entries.
 *
 * @param files - The package's entries, as `readEntries` read them.
 * @returns The verdict.
 */
export const oracleVerdict = (files: readonly PackageFile[]): Effect.Effect<OracleVerdict> =>
  Effect.map(judge(files, grammar, laws), (judgment): OracleVerdict => {
    if (judgment._tag === "CodecRefusal") {
      return { kind: "refused", rules: new Set([judgment.rule]) };
    }

    return judgment.breaches.length === 0
      ? { kind: "accepted" }
      : { kind: "refused", rules: new Set(judgment.breaches.map(({ law }) => ruleOf(law))) };
  });

/**
 * The rule the oracle's reader and codec refuse a package under, before any law is judged.
 *
 * @param files - The package's entries, as `readEntries` read them.
 * @returns The rule, or none when the oracle reads every document and judges the laws.
 */
export const oracleCodecRule = (
  files: readonly PackageFile[],
): Effect.Effect<Option.Option<string>> =>
  Effect.map(judge(files, grammar, laws), (judgment) =>
    judgment._tag === "CodecRefusal" ? Option.some(judgment.rule) : Option.none(),
  );

/**
 * Import a package on the lease, and hold its verdict to the oracle's: accepted where the oracle
 * accepts, and refused under rules that meet the rules the oracle's breaches keep where it
 * refuses.
 *
 * @param dir - The package directory or `.zip` file.
 * @param label - Its name, for the assertion's message.
 * @returns The package's id when it was accepted, none when it was refused; fails the test when
 *   the verdicts disagree.
 */
export const importAgreesWithOracle = (dir: string, label: string) =>
  Effect.gen(function* agreesWithOracle() {
    const expected = yield* oracleVerdict(yield* readEntries(dir));
    const outcome = yield* Effect.result(importDir(dir, nameOf(dir)));

    if (Result.isSuccess(outcome)) {
      assert.strictEqual(
        expected.kind,
        "accepted",
        `${label} was accepted, and the oracle refuses it`,
      );

      return Option.some(outcome.success);
    }

    const refused = outcome.failure;
    if (!(refused instanceof ImportRefused)) {
      return assert.fail(`${label} failed with ${refused.message}`);
    }

    if (expected.kind === "accepted") {
      return assert.fail(`${label} was refused, and the oracle accepts it: ${refused.message}`);
    }

    assert.isTrue(
      refused.rules.some((rule) => expected.rules.has(rule)),
      `${label}: ${refused.message}; the oracle's rules are ${[...expected.rules].join(", ")}`,
    );

    return Option.none();
  });
