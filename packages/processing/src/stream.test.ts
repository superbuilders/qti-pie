import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { assert, describe, it } from "@effect/vitest";
import { drawBelow, drawFloat } from "#processing/draws.ts";
import { hexOf, hmacSha256, sha256, utf8Bytes } from "#processing/sha256.ts";
import { drawStream, processingSeed, responseLabel, templateLabel } from "#processing/stream.ts";
import { everyMember } from "#processing/test/exhausted.ts";
import vectors from "#processing/test/stream-vectors.json" with { type: "json" };

/**
 * Every message length from empty to past three blocks, so each padding boundary (55, 56 and 64
 * bytes a block) is crossed, plus text of every UTF-8 width and lone surrogates, high and low,
 * mid-text and last.
 */
const messages: readonly [string, ...string[]] = [
  "é€😀\uD800z",
  "\uDC00a\uD800",
  ...Array.from({ length: 200 }, (_, length) => "abcdefghij".repeat(20).slice(0, length)),
];

describe("SHA-256 and HMAC-SHA-256", () => {
  it("give FIPS 180-4's and RFC 4231's digests", () => {
    assert.strictEqual(
      hexOf(sha256(utf8Bytes("abc"))),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    assert.strictEqual(
      hexOf(sha256(utf8Bytes(""))),
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    assert.strictEqual(
      hexOf(sha256(utf8Bytes("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"))),
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    );
    assert.strictEqual(
      hexOf(hmacSha256(utf8Bytes("Jefe"), utf8Bytes("what do ya want for nothing?"))),
      "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843",
    );
    assert.strictEqual(
      hexOf(
        hmacSha256(
          new Uint8Array(131).fill(0xaa),
          utf8Bytes("Test Using Larger Than Block-Size Key - Hash Key First"),
        ),
      ),
      "60e431591ee0b67f0d8a26aacbf5b77f8e0bc6213728c5140546040f0ee37f54",
    );
  });
});

describe("SHA-256 over lengths and text", () => {
  it.effect("is the platform's native SHA-256 and UTF-8", (ctx) =>
    everyMember(
      ctx,
      {
        box: "every length to 199 bytes, and text of every UTF-8 width with lone surrogates",
        members: messages,
        oracle: "node:crypto's SHA-256 and node:buffer's UTF-8 (FIPS 180-4; Encoding Standard)",
        suite: "processing/sha256/native",
      },
      (message) => {
        const bytes = utf8Bytes(message);
        assert.deepStrictEqual([...bytes], [...Buffer.from(message, "utf8")]);
        assert.strictEqual(hexOf(sha256(bytes)), createHash("sha256").update(bytes).digest("hex"));
      },
    ),
  );
});

describe("the draw stream", () => {
  it("gives plate's seeds, words, floats and integers on QP-PROC-DIFF's vectors", () => {
    for (const vector of vectors) {
      const seed = processingSeed(vector.decisionSeed, vector.package, vector.identifier);
      assert.strictEqual(seed.key, vector.processingSeed);
      assert.strictEqual(templateLabel(vector.identifier), vector.templateLabel);

      const words = drawStream(seed, templateLabel(vector.identifier));
      assert.deepStrictEqual(Array.from({ length: vector.words.length }, words), vector.words);

      const floats = drawStream(seed, templateLabel(vector.identifier));
      assert.deepStrictEqual(
        Array.from({ length: vector.floats.length }, () => drawFloat(floats)),
        vector.floats,
      );

      const integers = drawStream(seed, templateLabel(vector.identifier));
      assert.deepStrictEqual(
        vector.belowInOrder.counts.map((count) => String(drawBelow(integers, BigInt(count)))),
        vector.belowInOrder.values,
      );

      const response = drawStream(seed, responseLabel(3n));
      assert.deepStrictEqual(
        Array.from({ length: vector.response3Words.length }, response),
        vector.response3Words,
      );
    }
  });
});
