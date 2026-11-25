/**
 * Long values on the lease, with PostgreSQL as the judge. An item's single string correct response
 * is a `qti-value` text, an element's string value (`Node.stringValue`), bounded only by the regex
 * engine (`matchedTextBytes`, spec reading 133). The served AlphaTest item with the longest such
 * value has 433 bytes, past the 428 that LIMITS5 held a matched text to (SV-LIMIT-01). So each case
 * writes one value: at that length, one byte past what a lone B-tree entry holds of a text as
 * itself (grizzle's `keyTextBytes`), so that no key could hold it as itself, and at 64 KiB. It
 * imports the item whole, then exports it byte for byte as it was read.
 *
 * Its names are held in no key as themselves but one: a namespace prefix and an open attribute's
 * local name and namespace name by their SHA-256s, and a foreign element's local name in no key,
 * so each stays of any length the regex engine reads (`foreignNameBytes`); the namespace name of an
 * element an open attribute is keyed beside (`OpenAttribute.elementNamespace`) is held to
 * `namespaceNameBytes`. An item whose names are each 64 KiB, but that one at its bound, is imported
 * and exported byte for byte, and one whose namespace name is a byte past it refused.
 */
import { keyTextBytes } from "@bjornpagen/grizzle";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer } from "effect";
import { describe } from "vitest";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { comparePackage } from "#pantry/export/compare.ts";
import { exportPackage } from "#pantry/export/package.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { memoryMediaStore } from "#pantry/package/media.ts";
import { entryPathBytes, namespaceNameBytes, utf8Length } from "#pantry/qti/limits.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { hasLease } from "#pantry/test/settings.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";

/**
 * The UTF-8 bytes of each case's correct response: 433, the served item's; one past what a lone
 * B-tree entry holds of a text as itself; and 64 KiB. Each length is its own case, so each imports
 * one package.
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
const packageOf = (answer: string, path: string): ReadonlyMap<string, Uint8Array> =>
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
 * declaration binding it, its `data-*` attribute's local name, a foreign attribute's local name and
 * namespace name, and a foreign element's local name and namespace name, none held in a key as
 * itself but the foreign element's namespace name, which its open attribute's key holds.
 */
interface NameBytes {
  readonly attributeNamespace: number;
  readonly dataLocal: number;
  readonly elementName: number;
  readonly elementNamespace: number;
  readonly foreignLocal: number;
  readonly prefix: number;
}

/**
 * Every name at 64 KiB, far past any bound a key could hold a name to as itself, but the foreign
 * element's namespace name, at the most its open attribute's key holds.
 */
const longNameBytes: NameBytes = {
  attributeNamespace: 65_536,
  dataLocal: 65_536,
  elementName: 65_536,
  elementNamespace: namespaceNameBytes,
  foreignLocal: 65_536,
  prefix: 65_536,
};

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
  const elementNamespace = `urn:${"a".repeat(bytes.elementNamespace - 4)}`;
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
    },
  )("a long string value, stored and exported", (it) => {
    for (const bytes of lengths) {
      it.effect(
        `imports an item whose string correct response is ${String(bytes)} bytes and exports it as it was read`,
        () =>
          Effect.gen(function* oneLength() {
            const fs = yield* FileSystem.FileSystem;
            const answer = sentenceOf(bytes);
            const dir = yield* scopedPackage(packageOf(answer, "item.xml"));
            const target = yield* fs.makeTempDirectoryScoped();
            const imported = yield* importDir(dir, nameOf(dir));

            assert.strictEqual(utf8Length(answer), bytes);
            assert.include(
              ["accepted", "unchanged"],
              imported.outcome,
              `${bytes} bytes: PostgreSQL holds every law of the schema over the package`,
            );
            yield* exportPackage(imported.package, target);
            assert.deepStrictEqual(
              (yield* comparePackage(dir, target)).filter(
                ({ outcome }) => outcome.kind === "differs",
              ),
              [],
              `${bytes} bytes: the export differs from its source, by the exporter's comparison of the source with an export of the package read back from the database`,
            );
          }).pipe(Effect.scoped),
      );
    }

    it.effect(
      "imports an item stored at a path of entryPathBytes, the most a key holds of a path, and exports it as it was read, and refuses one a byte longer under key-text-bound",
      () =>
        Effect.gen(function* boundedPath() {
          const fs = yield* FileSystem.FileSystem;
          const atBound = pathOf(entryPathBytes);
          const dir = yield* scopedPackage(packageOf(sentenceOf(40), atBound));
          const target = yield* fs.makeTempDirectoryScoped();
          const imported = yield* importDir(dir, nameOf(dir));

          assert.strictEqual(utf8Length(atBound), entryPathBytes);
          assert.include(
            ["accepted", "unchanged"],
            imported.outcome,
            `${atBound}: a path at the bound, 3 folders of 200 bytes and a file name, within the domain EntryPath declares (#pantry/qti/limits.ts)`,
          );
          yield* exportPackage(imported.package, target);
          assert.deepStrictEqual(
            (yield* comparePackage(dir, target)).filter(
              ({ outcome }) => outcome.kind === "differs",
            ),
            [],
            "the export differs from its source",
          );

          const past = pathOf(entryPathBytes + 1);
          const pastDir = yield* scopedPackage(packageOf(sentenceOf(40), past));
          const refused = yield* Effect.flip(importDir(pastDir, nameOf(pastDir)));

          const rules: readonly string[] =
            refused instanceof ImportRefused
              ? refused.rules
              : ["_tag" in refused ? refused._tag : refused.kind];

          assert.strictEqual(utf8Length(past), entryPathBytes + 1);
          assert.include(
            rules,
            "key-text-bound",
            "a path a byte past entryPathBytes, past the domain EntryPath declares",
          );
        }).pipe(Effect.scoped),
    );

    it.effect(
      "imports an item whose prefix, open attribute names and foreign element's local name are each 64 KiB and its namespace name namespaceNameBytes, and exports it as it was read, and refuses one whose namespace name is a byte longer under key-text-bound",
      () =>
        Effect.gen(function* longNames() {
          const fs = yield* FileSystem.FileSystem;
          const dir = yield* scopedPackage(namedPackageOf(longNameBytes));
          const target = yield* fs.makeTempDirectoryScoped();
          const imported = yield* importDir(dir, nameOf(dir));

          assert.include(
            ["accepted", "unchanged"],
            imported.outcome,
            "every name at its bound: Namespaces in XML 1.0 §4 and XML 1.0 put no bound on a prefix or a name (reading 94), so a key holds each by its SHA-256 or holds none",
          );
          yield* exportPackage(imported.package, target);
          assert.deepStrictEqual(
            (yield* comparePackage(dir, target)).filter(
              ({ outcome }) => outcome.kind === "differs",
            ),
            [],
            "the export differs from its source",
          );

          const longDir = yield* scopedPackage(
            namedPackageOf({ ...longNameBytes, elementNamespace: namespaceNameBytes + 1 }),
          );
          const refused = yield* Effect.flip(importDir(longDir, nameOf(longDir)));
          const rules: readonly string[] =
            refused instanceof ImportRefused
              ? refused.rules
              : ["_tag" in refused ? refused._tag : refused.kind];

          assert.include(
            rules,
            "key-text-bound",
            "a namespace name a byte past namespaceNameBytes, to which the domain ElementNamespace declares (#pantry/qti/limits.ts) holds the namespace name of an element an open attribute is keyed beside",
          );
        }).pipe(Effect.scoped),
    );
  });
});
