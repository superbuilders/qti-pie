import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { readSource } from "#plate/document/read.ts";
import { qtiNamespace, xmlnsNamespace, xsiNamespace } from "#plate/document/source.ts";
import { readCorpusFile } from "#plate/test/corpus.ts";
import { attr, el, entity, text } from "#plate/test/source.ts";

/**
 * Encode a hand-built document as the bytes a host would hand the reader.
 *
 * @param xml The document's text.
 * @returns The text's UTF-8 bytes.
 */
const bytesOf = (xml: string): Uint8Array => new TextEncoder().encode(xml);

describe("document/read.ts", () => {
  it.effect(
    "CAT/test.xml is refused by the reader at its first undeclared entity, nbsp",
    () =>
      Effect.gen(function* undeclaredEntity() {
        const location = "qtiv3-examples/CAT/test.xml";
        const refused = yield* Effect.flip(readSource(location, yield* readCorpusFile(location)));

        assert.strictEqual(refused._tag, "ReaderRefusal");
        assert.deepInclude(refused, { rule: "undeclared-entity" });
        // The first `&nbsp;` in the file; it declares no entity, so the substituted text the reader
        // counts in keeps the source's lines and columns.
        assert.deepStrictEqual(
          refused._tag === "ReaderRefusal" ? refused.position : Option.none(),
          Option.some({ column: 59, line: 1085 }),
        );
        assert.include(refused._tag === "ReaderRefusal" ? refused.detail : "", '"nbsp"');
      }),
    { tags: ["corpus"] },
  );

  it.effect("a mismatched end tag is refused as not well-formed at a line and column", () =>
    Effect.gen(function* notWellFormed() {
      const refused = yield* Effect.flip(readSource("hand-built.xml", bytesOf("<a><b></a>")));

      assert.strictEqual(refused._tag, "WellFormednessError");
      assert.strictEqual(refused._tag === "WellFormednessError" ? refused.line : 0, 1);
    }),
  );

  it.effect("a document nested 257 deep is refused under element-depth at a line and column", () =>
    Effect.gen(function* tooDeep() {
      const refused = yield* Effect.flip(
        readSource("hand-built.xml", bytesOf(`${"<a>".repeat(256)}\n<a>${"</a>".repeat(257)}`)),
      );

      assert.deepInclude(refused, { rule: "element-depth" });
      // Where the parser stands after the 257th start tag, as crust places the refusal.
      assert.deepStrictEqual(
        refused._tag === "ReaderRefusal" ? refused.position : Option.none(),
        Option.some({ column: 3, line: 2 }),
      );
    }),
  );

  it.effect(
    "BG007 reads to a QTI root that keeps its xmlns:xsi declaration",
    () =>
      Effect.gen(function* bg007() {
        const location = "QTI3_BPIG_Examples/items/BG007.xml";
        const source = yield* readSource(location, yield* readCorpusFile(location));

        assert.strictEqual(source.location, location);
        assert.strictEqual(source.root.local, "qti-assessment-item");
        assert.strictEqual(source.root.namespace, qtiNamespace);
        assert.deepInclude(source.root.attributes, attr("xsi", xsiNamespace, xmlnsNamespace));
      }),
    { tags: ["corpus"] },
  );

  it.effect(
    "text and CDATA become text, an undeclared entity stays one, and comments and PIs go",
    () =>
      Effect.gen(function* mapping() {
        const source = yield* readSource(
          "hand-built.xml",
          bytesOf(
            '<!DOCTYPE a SYSTEM "a.dtd"><a xmlns:q="urn:q" q:x="1 &e; 2"><?p d?>t<![CDATA[<c>]]><!--k-->&e;<b/></a>',
          ),
        );

        assert.deepStrictEqual(
          source.root,
          el(
            "a",
            [attr("q", "urn:q", xmlnsNamespace), attr("x", "1 &e; 2", "urn:q", ["e"])],
            [text("t"), text("<c>"), entity("e"), el("b", [], [], "")],
            "",
          ),
        );
      }),
  );
});
