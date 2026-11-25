import path from "node:path";
import type { Law, Witness } from "@bjornpagen/grizzle";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Cause, Effect, Exit, FileSystem, Formatter, Option, Schema } from "effect";
import { Command } from "effect/cli";
import { inject } from "vitest";
import { TargetNotEmpty } from "#pantry/cli/args.ts";
import { RoundtripDiffers } from "#pantry/cli/errors.ts";
import {
  ErrorObject,
  emitSuccess,
  outputGlobalFlags,
  outputMode,
  successEnvelope,
} from "#pantry/cli/output.ts";
import { RoundtripData } from "#pantry/cli/roundtrip.ts";
import { exitCodeOf } from "#pantry/cli/run.ts";
import { OverlayConflict } from "#pantry/import/overlays/index.ts";
import { refusalOf } from "#pantry/import/refusal.ts";
import type { RefusalLaw, RefusalOf } from "#pantry/import/refusal.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { readerOrigin, RefusedKind, WitnessKind } from "#pantry/package/refusal-origin.ts";
import { lawTable } from "#pantry/vocab/laws.ts";
import { qti } from "#pantry/cli.ts";
import { qtiImport } from "#pantry/qti-import.ts";
import { qtiRoundtrip } from "#pantry/qti-roundtrip.ts";
import { captureCli, matchesCommitted, packageCopy } from "#pantry/test/cli.ts";
import { fileScratchDirectory, makeScratch, scratchEnv } from "#pantry/test/scratch.ts";

const fixtures = inject("fixtures");

/**
 * The scratch folders of this file, under `work/cli-present-*`, the run's own.
 */
const scratch = fileScratchDirectory("cli-present-");

/**
 * One line of standard error, decoded as the error object a reader parses.
 */
const errorLine = Schema.decodeUnknownSync(Schema.fromJsonString(ErrorObject));

/**
 * A command named `roundtrip` that reports one differing entry, as the real one does: its envelope
 * on standard output with `ok` false, then the failure.
 */
const differing = Command.make(
  "roundtrip",
  {},
  Effect.fn("test.present.differing")(function* differingHandler() {
    const mode = yield* outputMode;

    yield* emitSuccess(mode, {
      command: "roundtrip",
      data: {
        differing: 1,
        entries: [{ outcome: { at: "item.xml", kind: "differs" }, path: "item.xml" }],
        export_dir: "work/export/x",
        package: "p",
      },
      dataSchema: RoundtripData,
      ok: false,
    });
    yield* new RoundtripDiffers({ differing: 1, exportDir: "work/export/x" });
  }),
).pipe(Command.withGlobalFlags(outputGlobalFlags));

layer(NodeServices.layer, { excludeTestServices: true })("the text error shape", (it) => {
  it.effect("an unknown command prints its usage and the valid commands, not the whole help", () =>
    Effect.gen(function* unknownCommand() {
      const { stderr, stdout } = yield* captureCli(qti, ["frobnicate"], Option.none());

      assert.isTrue(stderr.startsWith("error[cli-usage]:"));
      assert.include(stderr, "= help:");

      for (const command of ["import", "export", "roundtrip"]) {
        assert.include(stderr, command);
      }

      assert.notInclude(stderr, "GLOBAL FLAGS");
      assert.strictEqual(stdout, "");
    }),
  );
});

layer(NodeServices.layer, { excludeTestServices: true })("the JSON error shape", (it) => {
  it.effect("an unknown command under --json is one error object on stderr", () =>
    Effect.gen(function* unknownJson() {
      const { stderr, stdout } = yield* captureCli(qti, ["--json", "frobnicate"], Option.none());

      assert.strictEqual(stdout, "");
      assert.strictEqual(stderr.split("\n").length, 1);

      const error = errorLine(stderr);

      assert.strictEqual(error.kind, "cli-usage");
      assert.strictEqual(error.exit_code, 2);
      assert.isFalse(error.ok);
      assert.isTrue(error.error);
    }),
  );

  it.effect("a missing path under --json is cli-path-missing", () =>
    Effect.gen(function* missingJson() {
      const { stderr, stdout } = yield* captureCli(
        qtiImport,
        ["--json", "/nonexistent", "simple"],
        Option.none(),
      );

      assert.strictEqual(stdout, "");

      const error = errorLine(stderr);

      assert.strictEqual(error.kind, "cli-path-missing");
      assert.strictEqual(error.exit_code, 2);
      assert.strictEqual(error.command, "import");
    }),
  );

  it.effect("a missing local set-up under --json is config, exit 78", () =>
    Effect.gen(function* configJson() {
      const env = scratchEnv(scratch);

      yield* makeScratch(env);

      const { stderr } = yield* captureCli(
        qtiImport,
        ["--json", fixtures.simple, "simple"],
        Option.some(env),
      );
      const error = errorLine(stderr);

      assert.strictEqual(error.kind, "config");
      assert.strictEqual(error.exit_code, 78);
    }),
  );

  /**
   * This holds roundtrip to calling the guard, requireReplaceable, before the import, whose
   * settings here reach no database.
   */
  const earlierExport = Effect.gen(function* earlierExport() {
    const fs = yield* FileSystem.FileSystem;
    const env = scratchEnv(scratch);
    const label = "present-replace-simple";
    const copy = yield* packageCopy(fixtures.simple, label);
    const folder = path.resolve("work", "export", label);
    const file = path.join(folder, "earlier.txt");

    yield* fs.remove(folder, { force: true, recursive: true });
    yield* fs.makeDirectory(folder, { recursive: true });
    yield* makeScratch(env);
    yield* fs.writeFileString(file, "kept");

    const { exit, stderr } = yield* captureCli(
      qtiRoundtrip,
      ["--json", copy, label],
      Option.some(env),
    );

    assert.strictEqual(errorLine(stderr).kind, "target-not-empty");
    assert.strictEqual(exitCodeOf(exit), 1);
    assert.isTrue(
      Exit.isFailure(exit) && Cause.squash(exit.cause) instanceof TargetNotEmpty,
      stderr,
    );
    assert.strictEqual(yield* fs.readFileString(file), "kept");
  });

  it.effect(
    "a roundtrip onto an earlier export without --yes is target-not-empty, exit 1, before any import, and the export stays",
    () => earlierExport,
  );

  it.effect("a differing roundtrip prints its envelope on stdout and the error on stderr", () =>
    Effect.gen(function* differsJson() {
      const { exit, stderr, stdout } = yield* captureCli(
        { command: differing, shownAs: differing.name },
        ["--json"],
        Option.none(),
      );
      const envelope = Schema.decodeUnknownSync(
        Schema.fromJsonString(successEnvelope("roundtrip", RoundtripData)),
      )(stdout);

      assert.strictEqual(stdout.split("\n").length, 1);
      assert.isFalse(envelope.ok);
      if ("dry_run" in envelope.data) {
        assert.fail("a real roundtrip printed the dry-run arm");
      }

      assert.strictEqual(envelope.data.differing, 1);
      assert.strictEqual(stderr.split("\n").length, 1);
      assert.strictEqual(errorLine(stderr).kind, "roundtrip-differs");
      assert.strictEqual(errorLine(stderr).exit_code, 1);
      assert.strictEqual(exit._tag, "Failure", "a roundtrip whose export differs fails");
      assert.strictEqual(exitCodeOf(exit), 1);
    }),
  );
});

/**
 * Whether a printed line, parsed as JSON, matches the committed schema of the error object,
 * `schema/error.json`.
 */
const matchesCommittedError = matchesCommitted("error");

/**
 * A law the table does not hold: a check of no law, which `Qti` does not state.
 */
const unownedLaw = {
  entry: { kind: "derived", name: "not_a_law", source: "a check Qti does not state" },
  kind: "check",
  name: "not_a_law",
  relation: "Node",
} as const satisfies Law;

/**
 * A check as a refusal of it carries it, as the login's own law or as a level above states it. A
 * check needs no LawId: the importer names it by the entry it carries.
 *
 * @param law - The check, or a level above's law of it.
 * @returns The refused law.
 */
const refusedLawOf = (law: Law): RefusalLaw => ({ id: "", law });

/**
 * A command named `name` that fails with what `failure` makes when it runs, or dies with it when
 * `dies`, under the output flags.
 */
const ending = <F>(name: string, failure: () => F, dies: boolean) =>
  Command.make(
    name,
    {},
    Effect.fn("test.present.ending")(function* endingHandler() {
      yield* outputMode;

      const value = yield* Effect.sync(failure);

      return yield* dies ? Effect.die(value) : Effect.fail(value);
    }),
  ).pipe(Command.withGlobalFlags(outputGlobalFlags));

/**
 * A witness of each kind a database refusal names its row by: grizzle's key witness, none, and
 * none for a row a concurrent commit changed. A kind `WitnessKind` adds fails to compile here.
 */
const witnessesByKind = {
  key: { kind: "key", relation: "Attribute", values: { local: "href", node: "n-1" } },
  unreported: { kind: "unreported" },
  unreproduced: { kind: "unreproduced" },
} as const satisfies {
  readonly [Kind in typeof WitnessKind.Type]: Witness & { readonly kind: Kind };
};

/**
 * Where each origin's help sends the person: the reader's to the message, a named row's to that
 * row, an unreported or unreproduced witness's to the law's source.
 */
const helpByOrigin = {
  Reader: "Fix the package as the message says, then import it again.",
  key: "at the row the message names",
  unreported: "The database names no row for this law, so find what the law describes",
  unreproduced: "another write committed beside this one changed the row it refused",
} as const satisfies Readonly<Record<"Reader" | typeof WitnessKind.Type, string>>;

layer(NodeServices.layer, { excludeTestServices: true })("every origin of a refusal", (it) => {
  it.effect(
    "prints the decision, the laws, their sources and the witness exactly when the database refused, and its origin's help",
    () =>
      // Oracle: the origin each refusal is built from, and the law table read directly by the name
      // its one check was built from: a refusal the reader made prints its one rule and no
      // decision, law, source or witness in either mode; one the database made prints how grizzle
      // decided its laws, its laws with the table's name and rule, the table's source once, and
      // the kind of the witness it was built under. A `some` outcome names two laws, AL1's check and a check of no law, which `Qti` does
      // not state and which has its text alone, as grizzle's `Refused` requires. An `above`
      // outcome names AL1's check first as a level above states it, by the name of the law it
      // wraps, and `above every` the login's own AL1 check after it. The help is
      // the origin's, by its own words. Bound: the reader's origin and the database's under each
      // kind of `RefusedKind` and of `WitnessKind`, exhausted, each in text and JSON; residual
      // none.
      Effect.gen(function* everyOrigin() {
        const { rule, source } = lawTable["AL1 admission"];
        const law = {
          entry: { kind: "declared", name: "AL1 admission", source },
          kind: "check",
          name: "AL1_admission",
          relation: "Attribute",
        } as const;
        const lawFact = {
          name: "AL1 admission",
          rule,
          text: Formatter.format(law),
        };
        const unownedFact = { text: Formatter.format(unownedLaw) };
        const aboveLaw = { kind: "above", law, level: "QtiMedia" } as const;
        const aboveFact = { ...lawFact, text: Formatter.format(aboveLaw) };
        const refusedAbove = refusedLawOf(aboveLaw);
        const own = refusedLawOf(law);
        const refusalsByDecision = {
          "above every": {
            facts: [aboveFact, lawFact],
            refused: { above: [refusedAbove], kind: "above", laws: [own], own: "every" },
          },
          "above none": {
            facts: [aboveFact],
            refused: { above: [refusedAbove], kind: "above", own: "none" },
          },
          "above unjudged": {
            facts: [aboveFact],
            refused: { above: [refusedAbove], kind: "above", own: "unjudged" },
          },
          every: { facts: [lawFact], refused: { kind: "every", laws: [own] } },
          first: { facts: [lawFact], refused: { kind: "first", laws: [own] } },
          some: {
            facts: [lawFact, unownedFact],
            refused: { kind: "some", laws: [own, refusedLawOf(unownedLaw)] },
          },
        } as const satisfies {
          readonly [Decision in typeof RefusedKind.Type]: {
            readonly facts: readonly unknown[];
            readonly refused: RefusalOf;
          };
        };
        const reader = new ImportRefused({
          detail: "The zip entry a.xml was refused",
          origin: readerOrigin,
          rules: ["zip-format"],
        });
        const origins = [
          { decided: [], expected: {}, help: helpByOrigin.Reader, printed: [], refusal: reader },
          ...WitnessKind.literals.flatMap((witness) =>
            RefusedKind.literals.map((kind) => ({
              decided: [kind],
              expected: {
                laws: refusalsByDecision[kind].facts,
                refused_kind: kind,
                sources: [source],
                witness,
              },
              help: helpByOrigin[witness],
              printed: [source],
              refusal: refusalOf(refusalsByDecision[kind].refused, witnessesByKind[witness]),
            })),
          ),
        ];

        assert.strictEqual(
          origins.length,
          1 + WitnessKind.literals.length * RefusedKind.literals.length,
        );
        for (const { decided, expected, help, printed, refusal } of origins) {
          const label =
            refusal.origin._tag === "Database"
              ? `${refusal.origin.kind} ${refusal.origin.witness}`
              : "Reader";
          const command = ending("import", () => refusal, false);
          const json = yield* captureCli(
            { command, shownAs: command.name },
            ["--json"],
            Option.none(),
          );
          const text = yield* captureCli({ command, shownAs: command.name }, [], Option.none());
          const error = errorLine(json.stderr);
          const { laws, refused_kind: refusedKind, sources, witness } = error;

          assert.strictEqual(exitCodeOf(json.exit), 1, label);
          assert.strictEqual(exitCodeOf(text.exit), 1, label);
          assert.isTrue(matchesCommittedError(json.stderr), `${label}: ${json.stderr}`);
          assert.strictEqual(error.kind, "import-refused", label);
          assert.deepStrictEqual(error.rules, refusal.rules, label);
          assert.deepStrictEqual(
            Object.fromEntries(
              Object.entries({ laws, refused_kind: refusedKind, sources, witness }).filter(
                ([, value]) => value !== undefined,
              ),
            ),
            expected,
            label,
          );
          assert.include(error.help, help, label);
          assert.include(text.stderr, `= help: ${error.help}`, label);
          assert.deepStrictEqual(
            text.stderr
              .split("\n")
              .filter((line) => line.startsWith("  refused: "))
              .map((line) => line.slice("  refused: ".length).split(",")[0]),
            decided,
            label,
          );
          assert.deepStrictEqual(
            text.stderr.split("\n").filter((line) => line.startsWith("  source: ")),
            printed.map((stated) => `  source: ${stated}`),
            label,
          );
        }
      }),
  );
});

layer(NodeServices.layer, { excludeTestServices: true })("a failure qti names", (it) => {
  it.effect("a defect the importer names prints its message, its tag, its help and its trace", () =>
    Effect.gen(function* conflict() {
      const dying = ending(
        "import",
        () => new OverlayConflict({ first: "a", key: "k", relation: "Choice", second: "b" }),
        true,
      );
      const text = yield* captureCli({ command: dying, shownAs: dying.name }, [], Option.none());
      const json = yield* captureCli(
        { command: dying, shownAs: dying.name },
        ["--json"],
        Option.none(),
      );
      const error = errorLine(json.stderr.split("\n")[0] ?? "");

      assert.strictEqual(exitCodeOf(text.exit), 70);
      assert.isTrue(
        text.stderr.startsWith(
          "error[internal]: Two builders give Choice two different rows at the key k: a and b.",
        ),
        text.stderr,
      );
      assert.include(text.stderr, "\n  failure: OverlayConflict\n");
      assert.include(
        text.stderr,
        "= help: This is a defect in qti, not in the package, and nothing was written.",
      );
      assert.include(text.stderr.split("= help:")[1] ?? "", "OverlayConflict");
      assert.isTrue(matchesCommittedError(json.stderr), json.stderr);
      assert.strictEqual(error.failure, "OverlayConflict");
      assert.strictEqual(error.exit_code, 70);
    }),
  );
});
