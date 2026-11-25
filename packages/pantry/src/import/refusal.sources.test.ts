/**
 * Every law source, and every record of the XSD differential that rests on the specification,
 * cites the specifications only where they are normative (lane OL; the verdict review's
 * observation that five sources cited the information model's §2, which it marks "This
 * Section is NOT NORMATIVE"): a hostile reader of a source looks first for a citation that rests on
 * a section the specification calls informative, or on an anchor no heading holds.
 *
 * Oracle: the specification as a checker, its own marks, read from its cached HTML and held to its
 * cached text (`#pantry/test/spec-sections.ts`), never listed here. Bound: every source of the
 * refusal's law table and every specification record the differential exports, every citation of
 * an IMS specification in them, exhausted.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { Digest } from "effect/crypto";
import { lawTable } from "#pantry/vocab/laws.ts";
import { readPinned, readPinnedHtml } from "#pantry/test/spec-cache/read.ts";
import * as differential from "#pantry/test/xsd-differential.ts";
import type { Recorded } from "#pantry/test/xsd-differential.ts";
import { offencesOf, specDocuments, specSections } from "#pantry/test/spec-sections.ts";
import type { Sections } from "#pantry/test/spec-sections.ts";

/**
 * A cached file's bytes as text.
 *
 * @param bytes - The file's bytes, UTF-8.
 * @returns Its text.
 */
const decoded = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

/**
 * Each specification's HTML and its text rendering, read from the spec cache at load, each checked
 * against its pin (`readPinnedHtml`, `readPinned`). Every test here reads them, so without them the
 * file fails to load, as `SpecFileMissing`, `SpecFileMismatch` or `SpecRenderingMismatch`, which
 * name the command that fetches them; it never skips.
 */
const cached = await Effect.runPromise(
  Effect.all(
    specDocuments.map((document) =>
      Effect.all({
        html: readPinnedHtml(document.html, document.htmlPin, document.textSha256),
        text: readPinned({ path: document.text, sha256: document.textSha256 }),
      }).pipe(
        Effect.map(({ html, text }) => ({
          document,
          read: { html: decoded(html), text: decoded(text) },
        })),
      ),
    ),
  ).pipe(Effect.provide(Layer.mergeAll(NodeServices.layer, Digest.layerWebCrypto))),
);

/**
 * Each specification's sections, by its URL, read from its renderings.
 */
const sections: ReadonlyMap<string, Sections> = new Map(
  cached.map(({ document, read }) => [document.url, specSections(read)] as const),
);

/**
 * Decide whether a value the differential exports is one of its records.
 *
 * @param value - The export, or one member of an exported list.
 * @returns Whether it is a record: an object with a direction and a reason.
 */
const isRecorded = (value: unknown): value is Recorded =>
  typeof value === "object" && value !== null && "direction" in value && "reason" in value;

/**
 * Every record the XSD differential exports, each record or list of them, once each by identity,
 * named by the export that first holds it: a record added under an export of its own is read too.
 */
const records: ReadonlyMap<Recorded, string> = new Map(
  Object.entries(differential)
    .flatMap(([name, value]): readonly (readonly [Recorded, string])[] => {
      if (Array.isArray(value)) {
        return value.flatMap((member, at) =>
          isRecorded(member) ? [[member, `${name}[${String(at)}]`] as const] : [],
        );
      }

      return isRecorded(value) ? [[value, name] as const] : [];
    })
    .toReversed(),
);

/**
 * Every source to judge, by a name of its own: each law's, as the refusal's table states it, and
 * each differential record's that rests on the specification, as `xsd-differential <export>
 * (<rule or direction>)`.
 */
const sources: ReadonlyMap<string, string> = new Map([
  ...Object.entries(lawTable).map(([law, { source }]) => [law, source] as const),
  ...[...records].flatMap(([record, name]) =>
    record.reason._tag === "specification"
      ? [
          [
            `xsd-differential ${name} (${record.rule ?? record.direction})`,
            record.reason.source,
          ] as const,
        ]
      : [],
  ),
]);

describe("the law sources' citations", () => {
  it("each cite a heading that exists, in a section its specification marks normative", () => {
    assert.deepStrictEqual(offencesOf(sources, sections), []);
  });
});
