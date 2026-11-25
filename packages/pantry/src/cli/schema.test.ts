import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Effect, Option, Schema } from "effect";
import { agree, exact, set, structuralHash } from "@bjornpagen/testing/oracle";
import { qti } from "#pantry/cli.ts";
import { captureCli } from "#pantry/test/cli.ts";
import { fileScratchDirectory, scratchEnv } from "#pantry/test/scratch.ts";

/**
 * The package folder, `packages/pantry`, where `schema/` and `scripts/` are.
 */
const packageRoot = path.resolve(import.meta.dirname, "..", "..");

/**
 * The folder the run's home is named under, `work/cli-schema-*`, the run's own.
 */
const scratch = fileScratchDirectory("cli-schema-");

/**
 * The environment of a run. `schema` reads no configuration, so the database points at nothing.
 */
const env = scratchEnv(scratch);

/**
 * What `JSON.parse` returns, checked to be an object keyed by strings.
 */
const parseObject = (text: string): Readonly<Record<string, Schema.Json>> =>
  Schema.decodeUnknownSync(Schema.Record(Schema.String, Schema.Json))(JSON.parse(text));

/**
 * The names `qti schema` lists: the keys of the document it prints with no argument.
 */
const listedNames = Effect.gen(function* listNames() {
  const { stdout } = yield* captureCli(qti, ["schema"], Option.some(env));

  return Object.keys(parseObject(stdout));
});

layer(NodeServices.layer, { excludeTestServices: true })("qti schema, database-free", (it) => {
  it.effect("each committed file decodes to what qti schema prints, in draft 2020-12", () =>
    Effect.gen(function* committedFiles() {
      for (const name of yield* listedNames) {
        const { exit, stdout } = yield* captureCli(qti, ["schema", name], Option.some(env));
        const committed = parseObject(
          fs.readFileSync(path.join(packageRoot, "schema", `${name}.json`), "utf-8"),
        );

        assert.strictEqual(exit._tag, "Success", `${name}: the schema command exits with success`);
        assert.deepStrictEqual(committed, parseObject(stdout));
        assert.strictEqual(
          parseObject(stdout)["$schema"],
          "https://json-schema.org/draft/2020-12/schema",
        );
      }
    }),
  );

  it.effect("scripts/anc.sh schema exits 0 with JSON on standard output", () =>
    Effect.gen(function* ancProbe() {
      const result = spawnSync(path.join(packageRoot, "scripts", "anc.sh"), ["schema"], {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
      });

      assert.strictEqual(result.status, 0);
      yield* agree(
        [
          ["the schema command's objects", Object.keys(parseObject(result.stdout))],
          ["the listed names", yield* listedNames],
        ],
        set(structuralHash, exact),
      );
    }),
  );
});
