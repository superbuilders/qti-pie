import { readFileSync } from "node:fs";
import { assert, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  corpusZipsDigest,
  examplesTarball,
  zipMembers,
  zipsDigestOf,
} from "#pantry/test/fixtures.ts";
import { parseVerdicts, verdictsPath } from "#pantry/test/verdicts.ts";

/**
 * The rows of the committed verdict file. These cases guard that file without a lease or the corpus
 * tarball: they read only the file and the table of zip members, so a plain run notices a missing
 * row or a renamed rule.
 */
const committedRows = Effect.gen(function* committedRows() {
  const tarball = yield* examplesTarball;

  return yield* parseVerdicts(readFileSync(verdictsPath(tarball), "utf-8"));
});

it.effect("the committed verdict file has one row for each corpus zip", () =>
  Effect.gen(function* rowsPerZip() {
    const files = (yield* committedRows).map((row) => row.file);

    assert.strictEqual(new Set(files).size, files.length, "a zip has two rows");
    assert.strictEqual(zipsDigestOf(files), corpusZipsDigest, files.join(", "));
    assert.includeMembers(files, Object.values(zipMembers));
  }),
);
