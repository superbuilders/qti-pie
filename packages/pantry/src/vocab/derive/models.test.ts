import path from "node:path";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { assert, beforeAll, describe, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer } from "effect";
import { Digest } from "effect/crypto";
import { settings } from "#pantry/test/settings.ts";
import { oxfmt } from "#pantry/test/oxfmt.ts";
import { loadModels, renderModels } from "#pantry/vocab/derive/models.ts";
import { xsdCachePresent } from "#pantry/test/xsd-catalog.ts";

/**
 * The package folder, `packages/pantry`, which the committed leaf and oxfmt are relative to.
 */
const packageRoot = path.resolve(import.meta.dirname, "../../..");

/**
 * The committed leaf this suite regenerates.
 */
const leafPath = "src/vocab/inventory/models.ts";

/**
 * The timeout, in milliseconds, of the regeneration, which reads the schemas, derives their models
 * and formats the leaf through oxfmt: a hang guard.
 */
const regenerateTimeoutMs = 900_000;

/**
 * The layers the regeneration runs on: the file system, the digest the source reads check, and the
 * process spawner oxfmt runs through.
 */
const SuiteLayer = Layer.mergeAll(
  NodeServices.layer,
  Digest.layerWebCrypto,
  NodeChildProcessSpawner.layer.pipe(Layer.provide(NodeServices.layer)),
);

// A committed-leaf guard, as the served and verdict files are: it runs at merge time, under
// QTI_PIE_CORPUS=1, beside the corpus witness, and out of the default run.
describe.skipIf(!settings.corpusRequested)("vocab/derive/models.ts over the pinned XSDs", () => {
  beforeAll(xsdCachePresent);

  layer(SuiteLayer, { timeout: regenerateTimeoutMs })("from the cache", (cached) => {
    cached.effect(
      `regenerates ${leafPath} byte for byte after oxfmt`,
      () =>
        Effect.gen(function* regenerate() {
          const fs = yield* FileSystem.FileSystem;
          const derived = yield* oxfmt(renderModels(yield* loadModels()), leafPath);

          assert.strictEqual(derived, yield* fs.readFileString(`${packageRoot}/${leafPath}`));
        }),
      regenerateTimeoutMs,
    );
  });
});
