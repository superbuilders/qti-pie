import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Effect } from "effect";
import { readEntries } from "#pantry/package/read.ts";
import type { PackageFile } from "#pantry/package/read.ts";
import { materialize } from "#pantry/test/fixtures.ts";
import { judge, verdictOf } from "#pantry/test/oracle.ts";
import type { Judgment } from "#pantry/test/oracle.ts";
import {
  asi,
  base,
  breachesOf,
  edit,
  item,
  itemResource,
  judged,
  manifestOf,
  shown,
  withItem,
} from "#pantry/test/probe.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { laws } from "#pantry/test/installed-laws.ts";

/**
 * A package whose one item body holds one `xi:include` of the given href and lists no fragment.
 *
 * @param href - The include's href, as written.
 * @returns The package's files, by path.
 */
const packageOfInclude = (href: string) => ({
  "imsmanifest.xml": manifestOf(itemResource),
  "item.xml": `<qti-assessment-item xmlns="${asi}" xmlns:xi="http://www.w3.org/2001/XInclude" identifier="I" title="Item" time-dependent="false"><qti-item-body><xi:include href="${href}"/></qti-item-body></qti-assessment-item>`,
});

/**
 * The base package with its response declared a string and mapped by the given entries.
 *
 * @param entries - The mapping's `qti-map-entry` elements, as written.
 * @returns The package's files, by path.
 */
const packageOfMapping = (entries: string) => ({
  ...base,
  "item.xml": edit(
    item,
    "</qti-correct-response>",
    `</qti-correct-response><qti-mapping default-value="0">${entries}</qti-mapping>`,
  ).replace('base-type="identifier"', 'base-type="string"'),
});

/**
 * The base item with its response processing's `qti-match` replaced by a `qti-pattern-match` of the
 * given `pattern`, over a string literal.
 *
 * @param pattern - The `pattern`, as written.
 * @returns The package's files, by path.
 */
const packageOfPattern = (pattern: string) =>
  withItem(
    '<qti-match><qti-variable identifier="RESPONSE"/><qti-correct identifier="RESPONSE"/></qti-match>',
    `<qti-pattern-match pattern="${pattern}"><qti-base-value base-type="string">x</qti-base-value></qti-pattern-match>`,
  );

/**
 * Count the breaches of one law in a judged package.
 *
 * @param files - The package's files, by path.
 * @param law - The law's name.
 * @returns The number of breaches of the law.
 */
const breachesOfLaw = (files: Readonly<Record<string, string>>, law: string) =>
  judged(files).pipe(
    Effect.map((judgment) => breachesOf(judgment).filter((breach) => breach.law === law).length),
  );

/**
 * The laws the package of a string mapping of the given entries breaks, each by its name, in the
 * oracle's order.
 *
 * @param entries - The mapping's `qti-map-entry` elements, as written.
 * @returns The names of the laws its breaches break.
 */
const mappingLaws = (entries: string) =>
  judged(packageOfMapping(entries)).pipe(
    Effect.map((judgment) => breachesOf(judgment).map(({ law }) => law)),
  );

/**
 * Assert that a judgment holds no breach and accepts the package.
 *
 * @param judgment - The judgment.
 */
const assertAccepted = (judgment: Judgment) => {
  assert.deepStrictEqual(breachesOf(judgment), [], shown(breachesOf(judgment)));
  assert.deepStrictEqual(verdictOf(judgment), { verdict: "accepted" });
};

/**
 * Judge a read package with one of its files' texts rewritten.
 *
 * @param files - The package's files, as `readEntries` returns them.
 * @param path - The file to rewrite.
 * @param rewrite - Maps the file's text to its new text.
 * @returns The judgment.
 */
const judgedWith = (
  files: readonly PackageFile[],
  path: string,
  rewrite: (text: string) => string,
) =>
  judge(
    files.map((file) =>
      file.path === path
        ? {
            ...file,
            bytes: new TextEncoder().encode(rewrite(new TextDecoder().decode(file.bytes))),
          }
        : file,
    ),
    grammar,
    laws,
  );

/**
 * Judges the restored-check fixtures and the restored laws' cases with the law oracle. The
 * contrast for the first case, `xml:lang="en"` against a LOM `language` of `fr` breaking "Document
 * lang", is already pinned in `oracle.rv-i.test.ts`.
 */
layer(NodeServices.layer, { excludeTestServices: true })(
  "the law oracle's verdict on the restored fixtures",
  (judging) => {
    judging.effect(
      "lang-case-mismatch breaks no law: language tags compare without regard to case",
      () =>
        Effect.gen(function* langCaseMismatch() {
          const dir = yield* materialize("lang-case-mismatch");
          const judgment = yield* judge(yield* readEntries(dir), grammar, laws);

          if (judgment._tag === "CodecRefusal") {
            assert.fail(
              `the codec refused lang-case-mismatch: ${judgment.rule}, ${judgment.detail}`,
            );
          }

          assert.deepStrictEqual(judgment.breaches, [], shown(judgment.breaches));
          assert.deepStrictEqual(verdictOf(judgment), { verdict: "accepted" });
        }),
    );

    judging.effect(
      "an item body's xi:include of an external href breaks nothing: it is stored and never fetched (reading 115)",
      () =>
        Effect.gen(function* externalInclude() {
          assertAccepted(yield* judged(packageOfInclude("https://example.org/f.xml")));
        }),
    );

    judging.effect(
      "an xi:include naming no entry of the package still breaks a law: File exists alone, never Include target beside it (#46's SitePath)",
      () =>
        Effect.gen(function* missingInclude() {
          const breaches = breachesOf(yield* judged(packageOfInclude("f.xml")));

          assert.isAbove(
            breaches.filter(({ law }) => law === "File exists").length,
            0,
            shown(breaches),
          );
          assert.deepStrictEqual(
            breaches.filter(({ law }) => law === "Include target"),
            [],
            shown(breaches),
          );
        }),
    );

    judging.effect(
      "a string mapping's keys may repeat, in ASCII case, written twice or matched the same way twice, the first entry that matches giving the value (readings 98 and 165)",
      () =>
        Effect.gen(function* foldedKeys() {
          // Oracle: a metamorphic relation: under reading 165 a second entry whose key repeats
          // the first, as written, in another case or matched the same way, breaks no law the
          // first entry alone does not.
          const alone = yield* mappingLaws(`<qti-map-entry map-key="York" mapped-value="1"/>`);
          for (const [entries, label] of [
            [
              `<qti-map-entry map-key="York" mapped-value="1"/><qti-map-entry map-key="york" mapped-value="2"/>`,
              "case-only duplicates",
            ],
            [
              `<qti-map-entry map-key="York" mapped-value="1"/><qti-map-entry map-key="York" mapped-value="2"/>`,
              "one key written twice",
            ],
            [
              `<qti-map-entry map-key="York" case-sensitive="true" mapped-value="1"/><qti-map-entry map-key="york" mapped-value="2"/>`,
              "a case-sensitive entry beside a default one",
            ],
            [
              `<qti-map-entry map-key="York" case-sensitive="true" mapped-value="1"/><qti-map-entry map-key="york" case-sensitive="true" mapped-value="2"/>`,
              "two case-sensitive entries",
            ],
            [
              `<qti-map-entry map-key="York" case-sensitive="true" mapped-value="1"/><qti-map-entry map-key="York" case-sensitive="1" mapped-value="2"/>`,
              "one string matched the same way twice",
            ],
            [
              `<qti-map-entry map-key="York" mapped-value="1"/><qti-map-entry map-key="\u00C9" mapped-value="2"/><qti-map-entry map-key="\u00E9" mapped-value="3"/>`,
              "keys apart beyond ASCII",
            ],
          ] as const) {
            assert.deepStrictEqual(yield* mappingLaws(entries), alone, label);
          }
        }),
    );

    judging.effect(
      "a braced qti-pattern-match pattern that names no declared variable is a string value in an item (reading R15-k)",
      () =>
        Effect.gen(function* unresolvedPattern() {
          for (const files of [packageOfPattern("{NOSUCH}"), packageOfPattern("{NOSUCH.SCORE}")]) {
            assertAccepted(yield* judged(files));
          }
        }),
    );

    judging.effect(
      "a braced pattern that names a variable of the wrong kind or base type still breaks Reference type, and an unresolved bare reference still breaks Variable declared (reading R15-k)",
      () =>
        Effect.gen(function* resolvedPattern() {
          for (const name of ["RESPONSE", "SCORE"]) {
            assert.strictEqual(
              yield* breachesOfLaw(packageOfPattern(`{${name}}`), "Reference type"),
              1,
              `{${name}} is no string single template or outcome variable`,
            );
          }

          assert.strictEqual(
            yield* breachesOfLaw(
              withItem(
                '<qti-variable identifier="RESPONSE"/>',
                '<qti-variable identifier="NOSUCH"/>',
              ),
              "Variable declared",
            ),
            1,
            "a bare unresolved reference names nothing",
          );
        }),
    );

    judging.effect(
      "a usage value outside a record is untyped text whatever baseType it writes, and inside a record it is typed (reading 105)",
      () =>
        Effect.gen(function* usageValue() {
          const files = yield* readEntries(yield* materialize("usage3-integer-float"));
          const typed = (rewrite: (original: string) => string) =>
            judgedWith(files, "example.xml", rewrite).pipe(
              Effect.map(
                (judgment) =>
                  breachesOf(judgment).filter(({ law }) => law === "Usage typed value").length,
              ),
            );

          assert.strictEqual(yield* typed((xml) => xml), 0, "outside a record");
          assert.strictEqual(
            yield* typed((xml) =>
              edit(
                xml,
                '<value baseType="integer">',
                '<value baseType="integer" fieldIdentifier="F">',
              ),
            ),
            1,
            "inside a record",
          );
        }),
    );
  },
);
