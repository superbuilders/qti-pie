import { globSync, readFileSync } from "node:fs";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { assert, beforeAll, describe, it, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { materialize } from "#pantry/test/fixtures.ts";
import { OracleError, OracleLayer, xmllintC14n } from "#pantry/xml/oracle.ts";

/**
 * What the process tests run on: the process spawner `xmllintC14n` needs and the file system and
 * path services that spawner and the fixture materializer need.
 */
const ProcessLayer = OracleLayer.pipe(
  Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
);

/**
 * The directory `materialize("simple")` returned, set once by `beforeAll`.
 */
let simple = "";

beforeAll(() =>
  Effect.gen(function* materializeSimple() {
    simple = yield* materialize("simple");
  }).pipe(Effect.provide(ProcessLayer)),
);

layer(ProcessLayer)("xmllint as a process", (process) => {
  process.effect(
    "a file that does not exist fails as OracleError with xmllint's exit code and message",
    () =>
      Effect.gen(function* missingFile() {
        const failure = yield* Effect.flip(xmllintC14n(`${simple}/missing.xml`));

        assert.instanceOf(failure, OracleError);
        assert.notStrictEqual(failure.exitCode, 0);
        assert.include(failure.stderr, "missing.xml");
      }),
  );
});

/**
 * A quoted absolute path whose last segment is `xmllint`: an install path.
 */
const installPath = /["'`]\/(?:[^\s"'`/]+\/)*xmllint["'`]/u;

/**
 * The code lines of a source that name an install path of `xmllint`. A comment line is no code, so
 * a note of which build was measured, as the oracle's of macOS's, names none.
 *
 * @param text - The source.
 * @returns Its offending lines, trimmed.
 */
const installPathLines = (text: string): readonly string[] =>
  text
    .split("\n")
    .filter((line) => !/^\s*(?:\*|\/\/|\/\*)/u.test(line) && installPath.test(line))
    .map((line) => line.trim());

/**
 * The path of `xmllint` in a directory, built so the guard's own plants name no path in its source.
 *
 * @param bin - The directory.
 * @returns The path.
 */
const installed = (bin: string): string => `${bin}/xmllint`;

describe("the one way to xmllint", () => {
  it("is XMLLINT or PATH: no source of pantry or crust names an install path", () => {
    // Search: every TypeScript source of pantry and crust, exhausted, for the oracle's rule that no
    // machine's install path is the default (`#pantry/xml/oracle.ts` `xmllintPath`). A suite gated
    // on a path skips silently wherever xmllint is installed elsewhere.
    const packages = [
      ["pantry", `${import.meta.dirname}/../..`],
      ["crust", `${import.meta.dirname}/../../../crust`],
    ] as const;
    const sources = packages.flatMap(([name, root]) =>
      globSync("src/**/*.ts", { cwd: root }).map((file) => ({
        name: `${name}/${file}`,
        text: readFileSync(`${root}/${file}`, "utf-8"),
      })),
    );

    assert.includeMembers(
      sources.map(({ name }) => name),
      ["pantry/src/xml/oracle.ts", "crust/src/read.ts"],
    );
    assert.deepStrictEqual(
      sources.flatMap(({ name, text }) => installPathLines(text).map((line) => `${name}: ${line}`)),
      [],
    );

    // Planted: the gate the translation suite of `#pantry/grammar/domains.test.ts` had, built here
    // so this file names no path of its own, is found; the oracle's comment is not.
    const gate = `      (yield* fs.exists("${installed("/usr/bin")}")) || (yield* fs.exists("${installed("/opt/homebrew/bin")}"))`;
    const note = ` * 1,023 corpus and fixture files, libxml2 2.9.13 (macOS's \`${installed("/usr/bin")}\`)`;

    assert.deepStrictEqual(installPathLines(gate), [gate.trim()]);
    assert.deepStrictEqual(installPathLines(note), []);
  });
});
