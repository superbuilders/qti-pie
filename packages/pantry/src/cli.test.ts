/**
 * The program as a person's shell runs it, the one witness of what only a real process shows: the
 * exit code `cli.ts`'s main gives a failure, and which stream it prints to. Every other contract of
 * the command line is held in this process (`cli/present.test.ts`, `cli/errors.test.ts`).
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Effect } from "effect";
import { ChildProcessSpawner } from "effect/process";
import { spawnCli } from "#pantry/test/cli.ts";

layer(NodeServices.layer, { excludeTestServices: true })("cli.ts as a process", (it) => {
  // A cold spawn of the CLI, bounded by no clock as `cli/run.test.ts`'s spawns are, for the reason
  // given there.
  it.effect(
    "import of a missing directory exits 2 with its message once on standard error, nothing on standard output, and no stack",
    () =>
      Effect.gen(function* refusalOnce() {
        const { code, stderr, stdout } = yield* spawnCli(["import", "/nonexistent", "simple"]);

        assert.strictEqual(code, ChildProcessSpawner.ExitCode(2));
        assert.strictEqual(stdout, "");
        assert.notMatch(stderr, /^\s+at /mu);
        assert.strictEqual(stderr.split("is not a directory").length - 1, 1);
      }),
  );
});
