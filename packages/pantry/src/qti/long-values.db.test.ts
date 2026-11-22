/**
 * Long values on the lease, with PostgreSQL as the judge. An item's single string correct response
 * is a `qti-value` text, an element's string value (`Node.stringValue`), bounded only by the regex
 * engine (`matchedTextBytes`, spec reading 133). The served AlphaTest item with the longest such
 * value has 433 bytes, past the 428 that LIMITS5 held a matched text to (SV-LIMIT-01). So each case
 * writes one value: at that length, one byte past what a lone B-tree entry holds of a text as
 * itself (grizzle's `keyTextBytes`), so that no key could hold it as itself, and at 64 KiB. It
 * imports the item whole, then exports it byte for byte as it was read.
 *
 * Every other text here is a key text of a bounded type (`#pantry/qti/limits.ts`), which every key
 * holds as itself: an entry's path at most `entryPathBytes`, and a namespace prefix and an open
 * attribute's local name at most `xmlNameBytes`. An item at each bound is imported and exported
 * byte for byte, and one byte past any of them is refused under the stated limit `key-text-bound`.
 * An open attribute's namespace name is held by its SHA-256 and a foreign element's own names in no
 * key, so they stay of any length the regex engine reads (`foreignNameBytes`).
 */
import { keyTextBytes } from "@bjornpagen/grizzle";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer } from "effect";
import { describe } from "vitest";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { comparePackage } from "#pantry/export/compare.ts";
import { exportPackage } from "#pantry/export/package.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { memoryMediaStore } from "#pantry/package/media.ts";
import { entryPathBytes, utf8Length, xmlNameBytes } from "#pantry/qti/limits.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { hasLease } from "#pantry/test/settings.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";

/**
 * The UTF-8 bytes of each case's correct response: 433, the served item's; one past what a lone
 * B-tree entry holds of a text as itself; and 64 KiB.
 */
const lengths = [433, keyTextBytes([]) + 1, 65_536] as const;

/**
 * A sentence of exactly `bytes` ASCII bytes: words of a stem, the last one cut to fit.
 *
 * @param bytes - Its bytes.
 * @returns The sentence.
 */
const sentenceOf = (bytes: number): string =>
  "Water is made of two hydrogen atoms and one oxygen atom. "
    .repeat(Math.ceil(bytes / 57))
    .slice(0, bytes);

/**
 * An item's path of exactly `bytes` ASCII bytes: folders of 200 bytes each, `x` repeated and a
 * `/`, each within a file system's bound on one name, so the package can be written to a folder and
 * read back, then a file name of the rest, `i` repeated and `.xml`, of 5 to 204 bytes.
 *
 * @param bytes - Its bytes, at least 5.
 * @returns The path.
 */
const pathOf = (bytes: number): string => {
  const folders = Math.floor((bytes - 5) / 200);

  return `${`${"x".repeat(199)}/`.repeat(folders)}${"i".repeat(bytes - 200 * folders - 4)}.xml`;
};

/**
 * A package of one item whose text entry, inline in a paragraph as QTI's content model places an
 * inline interaction, is bound to a single string response whose correct response is `answer`, at
 * `path`.
 *
 * @param answer - The correct response.
 * @param path - The item's path.
 * @returns Its entries.
 */
const packageOf = (answer: string, path = "item.xml"): ReadonlyMap<string, Uint8Array> =>
  new Map([
    [
      "imsmanifest.xml",
      new TextEncoder().encode(
        `<?xml version="1.0" encoding="UTF-8"?>\n<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="R" type="imsqti_item_xmlv3p0" href="${path}"><file href="${path}"/></resource></resources></manifest>\n`,
      ),
    ],
    [
      path,
      new TextEncoder().encode(
        `<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="long" title="Long" time-dependent="false"><qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"><qti-correct-response><qti-value>${answer}</qti-value></qti-correct-response></qti-response-declaration><qti-item-body><p>Say it: <qti-text-entry-interaction response-identifier="RESPONSE"/></p></qti-item-body></qti-assessment-item>\n`,
      ),
    ],
  ]);

/**
 * The UTF-8 bytes of each name of an item ({@link namedPackageOf}): its paragraph's prefix and the
 * declaration binding it, its `data-*` attribute's local name, and a foreign attribute's local
 * name, each an XML name a key holds; and the foreign attribute's namespace name and a foreign
 * element's local name and namespace name, which no key holds as themselves.
 */
interface NameBytes {
  readonly attributeNamespace: number;
  readonly dataLocal: number;
  readonly elementName: number;
  readonly foreignLocal: number;
  readonly prefix: number;
}

/**
 * The names at their bounds: each XML name a key holds at `xmlNameBytes`, and the foreign
 * attribute's namespace name and a foreign element's names, which no key holds as themselves, at 64
 * KiB.
 */
const atBounds: NameBytes = {
  attributeNamespace: 65_536,
  dataLocal: xmlNameBytes,
  elementName: 65_536,
  foreignLocal: xmlNameBytes,
  prefix: xmlNameBytes,
};

/**
 * Each name a key holds one byte past its bound, the others at theirs, with the field of the row
 * that holds it.
 */
const pastBounds: readonly { readonly bytes: NameBytes; readonly name: string }[] = [
  { bytes: { ...atBounds, prefix: xmlNameBytes + 1 }, name: "a prefix (Namespace.prefix)" },
  {
    bytes: { ...atBounds, dataLocal: xmlNameBytes + 1 },
    name: "a data-* attribute's local name (OpenAttribute.local)",
  },
  {
    bytes: { ...atBounds, foreignLocal: xmlNameBytes + 1 },
    name: "a foreign attribute's local name (OpenAttribute.local)",
  },
];

/**
 * A package of one item whose names are each as many UTF-8 bytes as `bytes` gives, in ASCII: its
 * paragraph's element prefix and the declaration binding it, a `data-*` attribute's local name,
 * and, in a custom interaction, a foreign element's local name and namespace name, with a foreign
 * attribute of its own local name and namespace name.
 *
 * @param bytes - The bytes of each name, each at least 6.
 * @returns Its entries.
 */
const namedPackageOf = (bytes: NameBytes): ReadonlyMap<string, Uint8Array> => {
  const prefix = `p${"a".repeat(bytes.prefix - 1)}`;
  const data = `data-${"a".repeat(bytes.dataLocal - 5)}`;
  const element = `e${"a".repeat(bytes.elementName - 1)}`;
  const elementNamespace = `urn:${"a".repeat(bytes.elementName - 4)}`;
  const local = `l${"a".repeat(bytes.foreignLocal - 1)}`;
  const attributeNamespace = `urn:${"b".repeat(bytes.attributeNamespace - 4)}`;
  const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

  return new Map([
    [
      "imsmanifest.xml",
      new TextEncoder().encode(
        `<?xml version="1.0" encoding="UTF-8"?>\n<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>\n`,
      ),
    ],
    [
      "item.xml",
      new TextEncoder().encode(
        `<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item xmlns="${asi}" identifier="names" title="Names" time-dependent="false"><qti-response-declaration identifier="WIDGET" cardinality="single" base-type="string"/><qti-item-body><${prefix}:p xmlns:${prefix}="${asi}" ${data}="v">Use it.</${prefix}:p><qti-custom-interaction response-identifier="WIDGET"><w:${element} xmlns:w="${elementNamespace}" xmlns:f="${attributeNamespace}" f:${local}="v">W</w:${element}></qti-custom-interaction></qti-item-body></qti-assessment-item>\n`,
      ),
    ],
  ]);
};

describe.skipIf(!hasLease)("qti/long-values.db.test.ts, on the lease", () => {
  layer(
    Layer.mergeAll(AuthorAppLayer, NodeServices.layer, memoryMediaStore).pipe(
      Layer.provideMerge(fileDatabaseOf("long_values")),
    ),
    {
      excludeTestServices: true,
      timeout: "120 seconds",
    },
  )("a long string value, stored and exported", (it) => {
    for (const bytes of lengths) {
      it.effect(
        `imports an item whose string correct response is ${String(bytes)} bytes and exports it as it was read`,
        () =>
          // Oracle: PostgreSQL, every law of the schema over the package, and the exporter's
          // comparison of the source with an export of the package read back from the database.
          // Bound: one of the three lengths, each its own case, so each imports one package.
          Effect.gen(function* oneLength() {
            const fs = yield* FileSystem.FileSystem;
            const answer = sentenceOf(bytes);
            const dir = yield* scopedPackage(packageOf(answer));
            const target = yield* fs.makeTempDirectoryScoped();
            const imported = yield* importDir(dir);

            assert.strictEqual(utf8Length(answer), bytes);
            assert.include(["accepted", "unchanged"], imported.outcome, `${bytes} bytes`);
            yield* exportPackage(imported.package, target);
            assert.deepStrictEqual(
              (yield* comparePackage(dir, target)).filter(
                ({ outcome }) => outcome.kind === "differs",
              ),
              [],
              `${bytes} bytes: the export differs from its source`,
            );
          }).pipe(Effect.scoped),
      );
    }

    it.effect(
      "imports an item stored at a path of entryPathBytes, the most a key holds of a path, and exports it as it was read, and refuses one a byte longer under key-text-bound",
      () =>
        // Oracle: PostgreSQL, the domain `EntryPath` declares (`#pantry/qti/limits.ts`), and the
        // exporter's comparison of the source with an export read back from the database. Bound:
        // one path at the bound and one a byte past it, 3 folders of 200 bytes and a file name.
        Effect.gen(function* boundedPath() {
          const fs = yield* FileSystem.FileSystem;
          const atBound = pathOf(entryPathBytes);
          const dir = yield* scopedPackage(packageOf(sentenceOf(40), atBound));
          const target = yield* fs.makeTempDirectoryScoped();
          const imported = yield* importDir(dir);

          assert.strictEqual(utf8Length(atBound), entryPathBytes);
          assert.include(["accepted", "unchanged"], imported.outcome, atBound);
          yield* exportPackage(imported.package, target);
          assert.deepStrictEqual(
            (yield* comparePackage(dir, target)).filter(
              ({ outcome }) => outcome.kind === "differs",
            ),
            [],
            "the export differs from its source",
          );

          const past = pathOf(entryPathBytes + 1);
          const refused = yield* Effect.flip(
            importDir(yield* scopedPackage(packageOf(sentenceOf(40), past))),
          );

          const rules: readonly string[] =
            refused instanceof ImportRefused
              ? refused.rules
              : ["_tag" in refused ? refused._tag : refused.kind];

          assert.strictEqual(utf8Length(past), entryPathBytes + 1);
          assert.include(rules, "key-text-bound", "a path a byte past entryPathBytes");
        }).pipe(Effect.scoped),
    );

    it.effect(
      "imports an item whose prefix and open attribute names are at the bounds a key holds them to, and whose foreign element's names are 64 KiB, and exports it as it was read",
      () =>
        // Oracle: as above, PostgreSQL and the exporter's comparison: Namespaces in XML 1.0 §4 and
        // XML 1.0 put no bound on a prefix or a name (reading 94), so each a key holds is held to
        // its type's bound, and a name no key holds is of any length. Bound: one item, every name
        // a key holds at its bound.
        Effect.gen(function* namesAtBounds() {
          const fs = yield* FileSystem.FileSystem;
          const dir = yield* scopedPackage(namedPackageOf(atBounds));
          const target = yield* fs.makeTempDirectoryScoped();
          const imported = yield* importDir(dir);

          assert.include(["accepted", "unchanged"], imported.outcome, "every name at its bound");
          yield* exportPackage(imported.package, target);
          assert.deepStrictEqual(
            (yield* comparePackage(dir, target)).filter(
              ({ outcome }) => outcome.kind === "differs",
            ),
            [],
            "the export differs from its source",
          );
        }).pipe(Effect.scoped),
    );

    it.effect(
      "refuses an item whose prefix, data-* local name or foreign attribute's local name is a byte past the bound a key holds it to, under key-text-bound",
      () =>
        // Oracle: PostgreSQL, the domains `NamespacePrefix` and `OpenLocal` declare
        // (`#pantry/qti/limits.ts`). Bound: each name a key holds a byte past its bound, the
        // others at theirs.
        Effect.gen(function* namesPastBounds() {
          for (const { bytes, name } of pastBounds) {
            const refused = yield* Effect.flip(
              importDir(yield* scopedPackage(namedPackageOf(bytes))),
            );

            const rules: readonly string[] =
              refused instanceof ImportRefused
                ? refused.rules
                : ["_tag" in refused ? refused._tag : refused.kind];

            assert.include(rules, "key-text-bound", name);
          }
        }).pipe(Effect.scoped),
    );
  });
});
