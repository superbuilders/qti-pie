/**
 * The exit code of each failure's kind (`describeFailure`, `exitCodeOf`), and the run's, as the
 * command line ends with it and as a spawned process does. Each spawn (`spawnCli`) is a cold start
 * of a Node process that loads the CLI's static graph. It runs under no clock, like every test of
 * pantry: alone it takes about 1 s, and during a full free run, while every worker holds a CPU, its
 * child waits for one, 1.0 s on average and 3.0 s at the slowest of 98 spawns at load average 306
 * to 377 (`work/timing/cli-spawn-2026-11-15.tsv`), and past 10 s at load average 380 to 460, where
 * a clock on it decided the verdict the exit code is for.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it, layer } from "@effect/vitest";
import { CredentialError } from "@bjornpagen/grizzle";
import { OpenError, TokenRefused } from "@bjornpagen/grizzle/runtime";
import { Cause, Effect, Exit, PlatformError } from "effect";
import { ChildProcessSpawner } from "effect/process";
import { NotADirectory } from "#pantry/cli/args.ts";
import {
  describeFailure,
  grizzleErrorTags,
  kindExitCode,
  kindHelp,
  RoundtripDiffers,
} from "#pantry/cli/errors.ts";
import type { Kind } from "#pantry/cli/errors.ts";
import { exitCodeOf } from "#pantry/cli/run.ts";
import { captureCli, spawnCli } from "#pantry/test/cli.ts";

/**
 * Grizzle's three public errors a command meets, each with the tag its class declares.
 * `Data.TaggedError(tag)` sets the tag as an instance field and as `prototype.name`, so the tag is
 * read from the prototype's name without constructing an error. A tag grizzle renames fails the
 * roster test below instead of silently mapping to `internal`.
 */
const grizzleErrors = [CredentialError, OpenError, TokenRefused].map((error) => ({
  name: error.name,
  tag: error.prototype.name,
}));

/**
 * A `PlatformError` of the kind a failed file read raises.
 */
const readFailed = PlatformError.systemError({
  _tag: "NotFound",
  method: "readFile",
  module: "FileSystem",
});

describe("describeFailure and exitCodeOf", () => {
  it("the kinds end with the codes of D3, and not-found is a refusal", () => {
    assert.deepStrictEqual(kindExitCode, {
      "cli-bad-argument": 2,
      "cli-path-missing": 2,
      "cli-usage": 2,
      config: 78,
      database: 1,
      "import-refused": 1,
      internal: 70,
      io: 74,
      "not-found": 1,
      "roundtrip-differs": 1,
      "target-not-empty": 1,
    } satisfies Record<Kind, number>);
  });

  it("a RoundtripDiffers exits 1 and a NotADirectory exits 2, each by its own kind", () => {
    const differs = new RoundtripDiffers({ differing: 1, exportDir: "/out" });
    const missing = new NotADirectory({ path: "/nonexistent" });

    assert.strictEqual(describeFailure(differs).kind, "roundtrip-differs");
    assert.strictEqual(exitCodeOf(Exit.fail(differs)), 1);
    assert.strictEqual(describeFailure(missing).kind, "cli-path-missing");
    assert.strictEqual(exitCodeOf(Exit.fail(missing)), 2);
  });

  it("a PlatformError exits 74 as io", () => {
    assert.deepStrictEqual(describeFailure(readFailed), {
      exitCode: 74,
      help: kindHelp.io,
      kind: "io",
    });
    assert.strictEqual(exitCodeOf(Exit.fail(readFailed)), 74);
  });

  it("a bare kind property is not a kind: only an error's tag names one", () => {
    assert.deepStrictEqual(describeFailure({ kind: "config" }), {
      exitCode: 70,
      help: kindHelp.internal,
      kind: "internal",
    });
  });

  it("an interrupt exits 130 and a success 0", () => {
    assert.strictEqual(exitCodeOf(Exit.interrupt(1)), 130);
    assert.strictEqual(exitCodeOf(Exit.succeed("done")), 0);
    assert.isTrue(Cause.hasInterruptsOnly(Cause.interrupt(1)));
  });

  it("the roster names the three tags grizzle's classes declare", () => {
    assert.deepStrictEqual(
      grizzleErrors.map((error) => error.tag).toSorted((a, b) => a.localeCompare(b)),
      [...grizzleErrorTags].toSorted((a, b) => a.localeCompare(b)),
    );
    for (const error of grizzleErrors) {
      assert.strictEqual(error.tag, error.name);
    }
  });
});

layer(NodeServices.layer, { excludeTestServices: true })("the run's exit code", (live) => {
  live.effect("a mistyped command, a missing argument and a missing path exit 2", () =>
    Effect.gen(function* codes() {
      for (const args of [
        ["frobnicate"],
        ["export", "only-one"],
        ["import", "/nonexistent", "simple"],
      ]) {
        const { exit } = yield* captureCli(args);

        assert.isTrue(Exit.isFailure(exit), args.join(" "));
        assert.strictEqual(exitCodeOf(exit), 2, args.join(" "));
      }
    }),
  );

  live.effect("bare qti, with or without --json, exits 0 with its help on stdout alone", () =>
    Effect.gen(function* bare() {
      for (const args of [[], ["--json"]]) {
        const { exit, stderr, stdout } = yield* captureCli(args);

        assert.strictEqual(exitCodeOf(exit), 0, args.join(" "));
        assert.include(stdout, "EXAMPLES", args.join(" "));
        assert.strictEqual(stderr, "", args.join(" "));
      }
    }),
  );

  live.effect("a real usage error still exits 2 and says so on stderr", () =>
    Effect.gen(function* usage() {
      for (const args of [["--frobnicate"], ["import"]]) {
        const { exit, stderr } = yield* captureCli(args);

        assert.strictEqual(exitCodeOf(exit), 2, args.join(" "));
        assert.isTrue(stderr.startsWith("error[cli-usage]:"), args.join(" "));
      }
    }),
  );

  live.effect("--help lists no kind that no command can raise", () =>
    Effect.gen(function* help() {
      const { stdout } = yield* captureCli(["--help"]);

      assert.notInclude(stdout, "skill-target-outside");
    }),
  );

  live.effect(
    "the process ends with 0 for bare qti, which proves the teardown uses the same code",
    () =>
      Effect.gen(function* spawnedBare() {
        const { code } = yield* spawnCli([]);

        assert.strictEqual(code, ChildProcessSpawner.ExitCode(0));
      }),
  );

  live.effect(
    "the process ends with 2 for a mistyped command, which proves the teardown is wired",
    () =>
      Effect.gen(function* spawned() {
        const { code } = yield* spawnCli(["frobnicate"]);

        assert.strictEqual(code, ChildProcessSpawner.ExitCode(2));
      }),
  );
});
