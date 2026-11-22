/**
 * Long values on the lease, with PostgreSQL as the judge. An item's single string correct response
 * is a `qti-value` text, an element's string value (`Node.stringValue`), held in a key by its
 * image and bounded only by the regex engine (`matchedTextBytes`, spec reading 133). The served
 * AlphaTest item with the longest such value has 433 bytes, past the 428 that LIMITS5 held a
 * matched text to (SV-LIMIT-01). So each case writes one value: at that length, one byte past what
 * a lone B-tree entry holds of a text as itself (grizzle's `keyTextBytes`), and at 64 KiB. It
 * imports the item whole, then exports it byte for byte as it was read. An entry's path is of any
 * length too (no index orders by one), so an item stored past the 2,642 bytes that LIMITS6's v3
 * held a path to is imported and exported the same way; and so are a prefix, an open attribute's
 * names and a foreign element's, past the bytes an ordered index once held each to.
 */
import { keyTextBytes } from "@bjornpagen/grizzle";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer } from "effect";
import { describe } from "vitest";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { comparePackage } from "#pantry/export/compare.ts";
import { exportPackage } from "#pantry/export/package.ts";
import { memoryMediaStore } from "#pantry/package/media.ts";
import { utf8Length } from "#pantry/qti/limits.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { hasLease } from "#pantry/test/settings.ts";

/**
 * The UTF-8 bytes of each case's correct response: 433, the served item's; one past a lone B-tree
 * entry; and 64 KiB.
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
 * A folder path of at least `bytes` ASCII bytes, ending in `/`: segments of 200 bytes, each within
 * a file system's bound on one name, so the package can be written to a folder and read back.
 *
 * @param bytes - Its least bytes.
 * @returns The folder path.
 */
const folderOf = (bytes: number): string =>
  Array.from(
    { length: Math.ceil(bytes / 201) },
    (_, at) => `${String(at)}${"d".repeat(199)}/`,
  ).join("");

/**
 * A package of one item whose text entry is bound to a single string response whose correct
 * response is `answer`, at `path`.
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
        `<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="long" title="Long" time-dependent="false"><qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"><qti-correct-response><qti-value>${answer}</qti-value></qti-correct-response></qti-response-declaration><qti-item-body><p>Say it.</p><qti-text-entry-interaction response-identifier="RESPONSE"/></qti-item-body></qti-assessment-item>\n`,
      ),
    ],
  ]);

/**
 * The UTF-8 bytes the names case writes a name, a namespace name and a prefix at: one past each
 * bound an ordered index once held them to as themselves (LIMITS6's local name, 1,290 bytes;
 * namespace name, 1,291; prefix, 2,588), which no index holds any longer, and 64 KiB.
 */
const nameLengths = [1291, 1292, 2589, 65_536] as const;

/**
 * A package of one item whose names are each `bytes` UTF-8 bytes, in ASCII: its paragraph's element
 * prefix and the declaration binding it, a `data-*` attribute's local name, and, in a custom
 * interaction, a foreign element's local name and namespace name, with a foreign attribute whose
 * local name and namespace name are as long.
 *
 * @param bytes - The bytes, at least 5.
 * @returns Its entries.
 */
const namedPackageOf = (bytes: number): ReadonlyMap<string, Uint8Array> => {
  const prefix = `p${"a".repeat(bytes - 1)}`;
  const local = `l${"a".repeat(bytes - 1)}`;
  const namespace = `urn:${"a".repeat(bytes - 4)}`;
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
        `<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item xmlns="${asi}" identifier="names" title="Names" time-dependent="false"><qti-response-declaration identifier="WIDGET" cardinality="single" base-type="string"/><qti-item-body><${prefix}:p xmlns:${prefix}="${asi}" data-${"a".repeat(bytes - 5)}="v">Use it.</${prefix}:p><qti-custom-interaction response-identifier="WIDGET"><w:${local} xmlns:w="${namespace}" xmlns:f="${namespace}f" f:${local}="v">W</w:${local}></qti-custom-interaction></qti-item-body></qti-assessment-item>\n`,
      ),
    ],
  ]);
};

describe.skipIf(!hasLease)("qti/long-values.db.test.ts, on the lease", () => {
  layer(Layer.mergeAll(AuthorAppLayer, NodeServices.layer, memoryMediaStore), {
    excludeTestServices: true,
    timeout: "120 seconds",
  })("a long string value, stored and exported", (it) => {
    it.effect(
      "imports an item whose string correct response is 433 bytes, past a B-tree entry or 64 KiB, and exports it as it was read",
      () =>
        // Oracle: PostgreSQL, every law of the schema over the package, and the exporter's
        // comparison of the source with an export of the package read back from the database.
        // Bound: the three lengths.
        Effect.gen(function* eachLength() {
          const fs = yield* FileSystem.FileSystem;
          for (const bytes of lengths) {
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
          }
        }).pipe(Effect.scoped),
    );

    it.effect(
      "imports an item stored at a path past 2,642 bytes, the bound an ordered read of a package's entries once held a path to, and exports it as it was read",
      () =>
        // Oracle: as above, PostgreSQL and the exporter's comparison. Bound: one path past 2,642
        // bytes, 14 folders of about 200 bytes and the item's name.
        Effect.gen(function* longPath() {
          const fs = yield* FileSystem.FileSystem;
          const path = `${folderOf(2643)}item.xml`;
          const dir = yield* scopedPackage(packageOf(sentenceOf(40), path));
          const target = yield* fs.makeTempDirectoryScoped();
          const imported = yield* importDir(dir);

          assert.isAbove(utf8Length(path), 2642);
          assert.include(["accepted", "unchanged"], imported.outcome, path);
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
      "imports an item whose prefix, open attribute names and foreign element names are past the bytes an ordered index once held each to, or 64 KiB, and exports it as it was read",
      () =>
        // Oracle: as above, PostgreSQL and the exporter's comparison: Namespaces in XML 1.0 §4 and
        // XML 1.0 put no bound on a prefix or a name (reading 94). Bound: the four lengths.
        Effect.gen(function* longNames() {
          const fs = yield* FileSystem.FileSystem;
          for (const bytes of nameLengths) {
            const dir = yield* scopedPackage(namedPackageOf(bytes));
            const target = yield* fs.makeTempDirectoryScoped();
            const imported = yield* importDir(dir);

            assert.include(["accepted", "unchanged"], imported.outcome, `${String(bytes)} bytes`);
            yield* exportPackage(imported.package, target);
            assert.deepStrictEqual(
              (yield* comparePackage(dir, target)).filter(
                ({ outcome }) => outcome.kind === "differs",
              ),
              [],
              `${String(bytes)} bytes: the export differs from its source`,
            );
          }
        }).pipe(Effect.scoped),
    );
  });
});
