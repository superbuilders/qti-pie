import { assert, describe, it } from "@effect/vitest";
import { keyedDigest } from "#plate/digest.ts";

describe("keyedDigest", () => {
  it("is HMAC-SHA-256 keyed by the key over the one field: RFC 4231's test case 2", () => {
    assert.strictEqual(
      keyedDigest("Jefe", ["what do ya want for nothing?"]).toString("hex"),
      "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843",
    );
  });

  it("joins the fields by U+001F, and keys by the key alone", () => {
    assert.deepStrictEqual(
      keyedDigest("k", ["RESPONSE", "A"]),
      keyedDigest("k", ["RESPONSE\u001FA"]),
    );
    assert.notDeepEqual(keyedDigest("k", ["RESPONSE", "A"]), keyedDigest("k", ["RESPONSEA"]));
    assert.notDeepEqual(keyedDigest("k", ["A"]), keyedDigest("l", ["A"]));
  });
});
