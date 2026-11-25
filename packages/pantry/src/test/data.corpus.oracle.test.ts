import { regex } from "arkregex";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, layer } from "@effect/vitest";
import { Effect } from "effect";
import { readEntries } from "#pantry/package/read.ts";
import { materializeCorpus, zipMembers } from "#pantry/test/fixtures.ts";
import { judge } from "#pantry/test/oracle.ts";
import type { Breach, Judgment } from "#pantry/test/oracle.ts";
import { settings } from "#pantry/test/settings.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { laws } from "#pantry/test/installed-laws.ts";

/**
 * The corpus packages that carry custom `data-*` attributes, by their tarball member: the five
 * packages Revision 2.1 of phase 8 counted 93 of them in.
 */
const dataPackages: readonly string[] = [
  zipMembers.BPIG_22April,
  zipMembers.items,
  zipMembers.pci_item_examples,
  zipMembers.pci_simple_example,
  zipMembers.sharedStimulus,
];

/**
 * The laws that judge an attribute's name or value, the ones a custom `data-*` attribute could
 * breach: admission, the `data-*` name laws, the open-name tables and the value domain.
 */
const attributeLaws: ReadonlySet<string> = new Set([
  "AL1 admission",
  "AL4 data name",
  "AL4 declared data name",
  "AL4 open name key",
  "AL4 open names",
  "value domain",
]);

/**
 * Whether a corpus package is one of {@link dataPackages}.
 *
 * @param member - The package's tarball member.
 * @returns True for the five packages that carry custom `data-*` attributes.
 */
const carriesData = (member: string): boolean => dataPackages.includes(member);

/**
 * Every corpus package when `QTI_PIE_CORPUS=1`, and none otherwise.
 *
 * Vitest declares a file's cases before any runs, so the corpus is listed while the file is
 * collected; a run without the setting never opens the tarball.
 */
const everyPackage = settings.corpusRequested
  ? await Effect.runPromise(materializeCorpus().pipe(Effect.provide(NodeServices.layer)))
  : [];

/**
 * The five packages of {@link dataPackages} among {@link everyPackage}.
 */
const corpus = everyPackage.filter(({ member }) => carriesData(member));

/**
 * Whether a breach concerns a `data-*` attribute.
 *
 * An attribute row's breach names its attribute class (`data-*` for a custom data attribute) and
 * an open-name breach its local name; the two whole-document open-name laws name no attribute, so
 * any breach of them counts.
 *
 * @param breach - The breach.
 * @returns True when the breach is of an attribute law and concerns a `data-*` attribute.
 */
const concernsData = (breach: Breach): boolean => {
  if (!attributeLaws.has(breach.law)) {
    return false;
  }

  const { keys } = breach;

  return (
    breach.law === "AL4 open names" ||
    breach.law === "AL4 open name key" ||
    keys["name"] === "data-*" ||
    (keys["local"]?.startsWith("data-") ?? false)
  );
};

/**
 * Judge one corpus package by the laws.
 *
 * @param dir - The package's directory.
 * @returns The judgment.
 */
const judged = Effect.fn("data.corpus.judged")(function* judged(dir: string) {
  const files = yield* readEntries(dir);

  return yield* judge(files, grammar, laws);
});

/**
 * Assert that a judgment holds nothing against a `data-*` attribute: a codec refusal names none,
 * and no breach of an attribute law concerns one.
 *
 * @param judgment - The judgment of one package.
 */
const dataHeld = (judgment: Judgment): void => {
  if (judgment._tag === "CodecRefusal") {
    assert.notMatch(
      judgment.detail,
      regex("\\bdata-", "u"),
      `codec refusal ${judgment.rule} in ${judgment.document} names a data-* attribute`,
    );

    return;
  }

  assert.deepStrictEqual(
    judgment.breaches.filter(concernsData).map(({ document, law, keys }) => ({
      document,
      law,
      local: keys["local"] ?? keys["name"] ?? "",
    })),
    [],
    "no attribute law is breached on a data-* attribute",
  );
};

describe.skipIf(!settings.corpusRequested)("data.corpus.oracle.test.ts, the corpus", () => {
  layer(NodeServices.layer, { excludeTestServices: true })(
    "custom data-* attributes of the corpus",
    (it) => {
      it.effect("the corpus holds all five packages", () =>
        Effect.sync(() => {
          assert.deepStrictEqual(
            corpus.map(({ member }) => member).toSorted(),
            dataPackages.toSorted(),
          );
        }),
      );

      for (const entry of corpus) {
        it.effect(`${entry.name}: no law of an attribute is breached on a data-* attribute`, () =>
          Effect.gen(function* held() {
            dataHeld(yield* judged(entry.dir));
          }),
        );
      }
    },
  );
});
