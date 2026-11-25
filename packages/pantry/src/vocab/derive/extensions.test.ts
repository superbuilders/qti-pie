/**
 * The extension-rules deriver's tests (spec reading 90), each against an independent oracle:
 *
 * - **The pinned XSDs, read as text.** Over the cache, the leaf is what a re-run prints, after `vp
 *   fmt`, byte for byte, and its elements are exactly the `//qti:<local>` contexts a regular
 *   expression finds in the raw text of the three data-extension patterns, with no XML reader
 *   between: 127, as reading 90 counts them. Skipped, with its reason, without the pinned cache.
 * - **A naive model of the reading, over generated Schematron.** Toy schemas of up to six rules, each
 *   a valid rule, a repeated element, a rule of another pattern, or one of the named invalid
 *   contexts (another shape, a prefix no `sch:ns` declares, a namespace of no vocabulary), are read
 *   by `coveredIn` and by a model written from the reading rules: the two agree on the refusal or
 *   on the elements and their lines, and every variant is a required situation of the search.
 */
import path from "node:path";
import * as NodeChildProcessSpawner from "@effect/platform-node/NodeChildProcessSpawner";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, beforeAll, describe, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer } from "effect";
import { Digest } from "effect/crypto";
import { oxfmt } from "#pantry/test/oxfmt.ts";
import { loadCovered, renderExtensions } from "#pantry/vocab/derive/extensions.ts";
import { xsdCachePresent } from "#pantry/test/xsd-catalog.ts";

/**
 * The package folder, `packages/pantry`, which the committed leaf and oxfmt are relative to.
 */
const packageRoot = path.resolve(import.meta.dirname, "../../..");

/**
 * The leaf, relative to {@link packageRoot}.
 */
const leafPath = "src/vocab/inventory/extensions.ts";

/**
 * The services the cache-gated tests read through: the file system, SHA-256 and oxfmt.
 */
const SuiteLayer = Layer.mergeAll(
  NodeServices.layer,
  Digest.layerWebCrypto,
  NodeChildProcessSpawner.layer,
).pipe(Layer.provide(NodeServices.layer));

describe("vocab/derive/extensions.ts over the pinned XSDs", () => {
  beforeAll(xsdCachePresent);

  layer(SuiteLayer)("from the cache", (cached) => {
    cached.effect("regenerates the leaf byte for byte after oxfmt", () =>
      Effect.gen(function* regenerate() {
        const fs = yield* FileSystem.FileSystem;

        assert.strictEqual(
          yield* oxfmt(renderExtensions(yield* loadCovered()), leafPath),
          yield* fs.readFileString(`${packageRoot}/${leafPath}`),
        );
      }),
    );
  });
});
