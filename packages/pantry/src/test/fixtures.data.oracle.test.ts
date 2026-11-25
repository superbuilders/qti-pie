import path from "node:path";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { ConfigProvider, Effect, FileSystem, Option, Result } from "effect";
import { assemble } from "#pantry/model/assemble.ts";
import { shredGrammarOf } from "#pantry/model/composed.ts";
import { names as documentNames } from "#pantry/model/names.ts";
import { shred } from "#pantry/model/shred.ts";
import { unshred } from "#pantry/model/unshred.ts";
import { flatten } from "#pantry/model/xdm.ts";
import { readEntries } from "#pantry/package/read.ts";
import type { PackageFile } from "#pantry/package/read.ts";
import { materialize } from "#pantry/test/fixtures.ts";
import type { FixtureName } from "#pantry/test/fixtures.ts";
import { judge, shownBreach, verdictOf } from "#pantry/test/oracle.ts";
import { canonicalize } from "@qti-pie/crust/canonical.ts";
import { readXml } from "@qti-pie/crust/read.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { laws } from "#pantry/test/installed-laws.ts";

/**
 * The directory every test root is made under: the package's gitignored `work/`.
 */
const workDirectory = path.resolve(import.meta.dirname, "../../work");

/**
 * What one positive fixture's item must hold: a passage its edit leaves in it, which proves the
 * edit was applied and which fixture it is.
 */
interface Expectation {
  readonly marker: string;
  readonly name: FixtureName;
}

/**
 * The four positives of phase 8's stage N (spec 5.3 and decision 324), each with a passage unique
 * to it among the four.
 */
const positives: readonly Expectation[] = [
  { marker: 'data-group-name="group1"', name: "cut-data-dash" },
  { marker: 'use="instructions" view="candidate"', name: "cut-data-attributes" },
  { marker: 'data-qti-suppress-tts="true"', name: "data-custom" },
  { marker: 'data-org="&org;"', name: "data-entity" },
];

/**
 * What one negative fixture's package is refused as: the oracle's codec rule, and the reason the
 * codec's own error gives (`UnmodeledVocabulary.reason`), which the oracle's rule does not carry
 * for an attribute its element does not admit.
 */
interface Refusal {
  readonly name: FixtureName;
  readonly reason: "data-name" | "unadmitted";
  readonly rule: "attribute-admission" | "unmodeled-vocabulary";
}

/**
 * The four negatives: three names the class's language refuses (`data-é` among them, which
 * reading 13's pattern bars), and a name on an element that
 * admits no `data-*` attribute.
 */
const negatives: readonly Refusal[] = [
  { name: "data-uppercase", reason: "data-name", rule: "unmodeled-vocabulary" },
  { name: "data-non-ascii", reason: "data-name", rule: "unmodeled-vocabulary" },
  { name: "data-bare-prefix", reason: "data-name", rule: "unmodeled-vocabulary" },
  { name: "data-item-body", reason: "unadmitted", rule: "attribute-admission" },
];

/**
 * Materialize a fixture in a root of its own and read its package.
 *
 * @param name - The fixture's name.
 * @returns The package's entries, as `readEntries` reads them.
 */
const packageOf = Effect.fn("fixtures.data.packageOf")(function* packageOf(name: FixtureName) {
  const fs = yield* FileSystem.FileSystem;

  yield* fs.makeDirectory(workDirectory, { recursive: true });

  const root = yield* fs.makeTempDirectoryScoped({
    directory: workDirectory,
    prefix: "fixtures-data-",
  });
  const config = ConfigProvider.layerAdd(
    ConfigProvider.fromUnknown({ QTI_PIE_QTI_FIXTURES: root }),
    { asPrimary: true },
  );
  const dir = yield* materialize(name).pipe(Effect.provide(config));

  assert.strictEqual(yield* fs.exists(dir), true, name);

  return yield* readEntries(dir);
});

/**
 * Round-trip every item of a package through the XDM: read by crust, shredded through the composed
 * grammar, flattened to rows, assembled back and unshredded to bytes.
 *
 * @param name - The fixture's name, for the messages.
 * @param files - The package's entries.
 * @returns The text of each item, in path order.
 */
const roundTripped = Effect.fn("fixtures.data.roundTripped")(function* roundTripped(
  name: FixtureName,
  files: readonly PackageFile[],
) {
  const shredding = shredGrammarOf(grammar);
  const names = documentNames;
  const items: string[] = [];

  for (const file of files.filter((entry) => entry.path.endsWith(".xml"))) {
    const doc = yield* readXml(file.bytes);
    if (doc.root.local !== "qti-assessment-item") {
      continue;
    }

    const tree = yield* shred(doc, shredding);
    const assembled = assemble(flatten(tree));

    assert.isTrue(Result.isSuccess(assembled), `${name}: ${file.path} assembles`);

    const out = yield* unshred(Result.getOrThrow(assembled), names);

    if (!Buffer.from(out).equals(Buffer.from(file.bytes))) {
      const reread = yield* readXml(out);

      assert.strictEqual(
        new TextDecoder().decode(Result.getOrThrow(canonicalize(reread))),
        new TextDecoder().decode(Result.getOrThrow(canonicalize(doc))),
        `${name}: ${file.path} is canonical-equal after the round trip`,
      );
    }

    items.push(new TextDecoder().decode(file.bytes));
  }

  assert.isAbove(items.length, 0, `${name} holds an item`);

  return items;
});

/**
 * The reason the codec gives for refusing a package's item: the `reason` of the
 * `UnmodeledVocabulary` that shredding the first item to fail returns.
 *
 * @param files - The package's entries.
 * @returns The reason, or none when every item shreds.
 */
const reasonOf = Effect.fn("fixtures.data.reasonOf")(function* reasonOf(
  files: readonly PackageFile[],
) {
  const shredding = shredGrammarOf(grammar);

  for (const file of files.filter((entry) => entry.path.endsWith(".xml"))) {
    const doc = yield* readXml(file.bytes);
    if (doc.root.local !== "qti-assessment-item") {
      continue;
    }

    const failure = yield* Effect.flip(shred(doc, shredding));

    if (failure._tag === "UnmodeledVocabulary") {
      return Option.some(failure.reason);
    }
  }

  return Option.none();
});

layer(NodeServices.layer, { excludeTestServices: true })("the data-* fixtures", (it) => {
  for (const { marker, name } of positives) {
    it.effect(`${name} materializes, is accepted by the law oracle and round-trips`, () =>
      Effect.gen(function* positive() {
        const files = yield* packageOf(name);
        const judgment = yield* judge(files, grammar, laws);

        if (judgment._tag === "CodecRefusal") {
          assert.fail(`the codec refused ${name}: ${judgment.rule}, ${judgment.detail}`);
        }

        assert.deepStrictEqual(
          judgment.breaches.map(({ law }) => law),
          [],
          `${name}: ${judgment.breaches.map((breach) => shownBreach(breach, grammar)).join("\n")}`,
        );
        assert.deepStrictEqual(verdictOf(judgment), { verdict: "accepted" });

        const items = yield* roundTripped(name, files);

        assert.strictEqual(
          items.filter((item) => item.split(marker).length > 1).length,
          1,
          `${name}: ${marker}`,
        );
      }).pipe(Effect.scoped),
    );
  }

  for (const { name, reason, rule } of negatives) {
    it.effect(
      `${name} materializes and the codec refuses it as ${rule}, for the reason ${reason}`,
      () =>
        Effect.gen(function* negative() {
          const files = yield* packageOf(name);
          const judgment = yield* judge(files, grammar, laws);

          if (judgment._tag !== "CodecRefusal") {
            assert.fail(`the codec accepted ${name}`);
          }

          assert.strictEqual(judgment.rule, rule, name);
          assert.deepStrictEqual(yield* reasonOf(files), Option.some(reason), name);
        }).pipe(Effect.scoped),
    );
  }
});
