/**
 * The package-media level (`#pantry/qti/media.ts`) refuses nothing `Qti` admits: QTI 3.0
 * Conformance §3 asks an application meeting a feature it does not support to "ignore or remove
 * the unsupported data", and §2.2 asks an importer to "differentiate between valid and invalid
 * instances of QTI content", so a valid package's media are stored, never refused, and the level
 * says only which files a player is given. Its laws were each a refusal of valid QTI (an external
 * address, a `data:` URI, an extension the policy does not list, a file nothing names, a `style`
 * that fetches, foreign markup, a kept entity reference, an external document type identifier);
 * none remains.
 *
 * Oracle: the conformance text, read as a statement about the schema value: an installation that
 * stacks the policy and the media level over `Qti` states exactly `Qti`'s laws, and adds the
 * policy's relation and the two derived relations a player's files are read from.
 */
import { assert, describe, it } from "@effect/vitest";
import { QtiMedia, QtiMediaPolicy } from "#pantry/qti/media.ts";
import { Qti } from "#pantry/qti/schema.ts";

describe("the package-media level", () => {
  it("states no law beyond Qti's, so it refuses no package Qti admits", () => {
    // Bound: both levels, every statement.
    for (const level of [QtiMediaPolicy, QtiMedia]) {
      assert.strictEqual(level.statements.length, Qti.statements.length, level.name);
      assert.isTrue(
        level.statements.every((statement) => Qti.statements.includes(statement)),
        level.name,
      );
    }
  });

  it("adds the policy and the two relations a player's files are read from, and nothing else", () => {
    // Bound: every relation of the media level that Qti does not hold.
    assert.deepStrictEqual(
      Object.keys(QtiMedia.relations)
        .filter((name) => !Object.hasOwn(Qti.relations, name))
        .toSorted(),
      ["MediaExtension", "MediaType", "ServedFile", "WithheldFile"],
    );
  });
});
