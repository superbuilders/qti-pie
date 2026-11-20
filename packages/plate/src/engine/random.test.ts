import { assert, describe, it } from "@effect/vitest";
import {
  drawBelow,
  drawFloat,
  drawStream,
  keyedDigest,
  responseLabel,
  templateLabel,
} from "#plate/engine/random.ts";

/**
 * 2^32, the value of one 32-bit word above the next in a big-endian number.
 */
const wordCount = 4_294_967_296n;

/**
 * Read draws as one big-endian number, the first the most significant 32-bit word, masked to its
 * low bits: the candidate `drawBelow` reads, computed here apart from it.
 *
 * @param draws The draws, in the order they were taken.
 * @param bits The number of low bits kept.
 * @returns The candidate.
 */
const candidateOf = (draws: readonly number[], bits: number): bigint => {
  let whole = 0n;
  for (const word of draws) {
    whole = whole * wordCount + BigInt(word);
  }

  return BigInt.asUintN(bits, whole);
};

/**
 * Take a stream's next draws.
 *
 * @param draw The stream.
 * @param count How many draws to take.
 * @returns The draws, in the order they were taken.
 */
const take = (draw: () => number, count: number): readonly number[] =>
  Array.from({ length: count }, () => draw());

/**
 * The count of 2^69 + 1 values, whose `k` is 70: a candidate is three draws masked to 70 bits, and
 * close to half of all candidates are not below it.
 */
const redrawCount = 2n ** 69n + 1n;

/**
 * A label whose stream, under the seed `""`, has a first candidate under {@link redrawCount} that
 * is not below it and a second that is: the first label `redraw-<n>`, counting from 0, with that
 * property, found by {@link candidateOf} once and named here.
 */
const redrawLabel = "redraw-3";

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

describe("drawStream", () => {
  it("draws the eight words of block 0, then block 1, of HMAC-SHA-256 keyed by the seed over the label and the block as four big-endian bytes, as OpenSSL computes them", () => {
    // `printf 'label\0\0\0\0' | openssl dgst -sha256 -hmac seed`, and `\0\0\0\1` for block 1.
    assert.deepStrictEqual(
      take(drawStream("seed", "label"), 10),
      [
        0x44_59_a5_54, 0xb3_9e_0d_3d, 0x68_98_c3_58, 0x19_8c_66_a0, 0xfc_06_51_a5, 0x7c_d7_f3_52,
        0x38_6f_9f_01, 0xeb_d7_8f_d6, 0x72_d6_af_85, 0xbd_07_ba_78,
      ],
    );
  });

  it("keys the stream by the seed's UTF-8 bytes and hashes the label's, as OpenSSL computes them", () => {
    // The key is the hex of the seed's UTF-8 bytes, `openssl dgst -sha256 -mac HMAC -macopt
    // hexkey:73c3a9656420f09f9880`, over the label's bytes and the block.
    const draw = drawStream("s\u00E9ed \u{1F600}", "instance\u001Ftemplate\u001Fitem");
    const draws = take(draw, 9);

    assert.deepStrictEqual(
      [draws[0], draws[7], draws[8]],
      [0xd8_11_5c_6a, 0xee_a6_b9_74, 0x3d_57_28_39],
    );
  });

  it("keys the stream by a lone surrogate as by U+FFFD, as the UTF-8 encoder writes it", () => {
    assert.strictEqual(drawStream("\uD800", "x")(), 0x66_9a_92_0c);
  });

  it("draws the same values from the same seed and label every time", () => {
    const first = drawStream("same", "label");
    const second = drawStream("same", "label");

    assert.deepStrictEqual(
      [drawFloat(first), drawBelow(first, 2n ** 70n), drawBelow(first, 6n), first()],
      [drawFloat(second), drawBelow(second, 2n ** 70n), drawBelow(second, 6n), second()],
    );
  });

  it("keys the stream by the seed, which is never part of the message", () => {
    assert.notDeepEqual(take(drawStream("a\u001Fb", "c"), 8), take(drawStream("a", "b\u001Fc"), 8));
  });
});

describe("drawFloat", () => {
  it("reads the stream's next two draws, and gives the pinned float", () => {
    const third = take(drawStream("", "f"), 3).at(2);
    const draw = drawStream("", "f");

    assert.strictEqual(drawFloat(draw), 0.8930774168884611);
    assert.strictEqual(draw(), third);
  });
});

describe("drawBelow", () => {
  it("over 2^70 values reads three draws, the first the most significant, masked to 70 bits", () => {
    const expected = candidateOf(take(drawStream("", "range"), 3), 70);

    assert.strictEqual(drawBelow(drawStream("", "range"), 2n ** 70n), expected);
    assert.strictEqual(expected, 1_019_814_385_092_059_024_122n);
  });

  it("draws again while the candidate is not below the count", () => {
    const draws = take(drawStream("", redrawLabel), 7);
    const draw = drawStream("", redrawLabel);

    assert.isTrue(candidateOf(draws.slice(0, 3), 70) >= redrawCount);
    assert.strictEqual(drawBelow(draw, redrawCount), candidateOf(draws.slice(3, 6), 70));
    assert.strictEqual(candidateOf(draws.slice(3, 6), 70), 359_764_092_779_617_884_586n);
    assert.strictEqual(draw(), draws[6]);
  });

  it("gives 0 for a count of 1 and draws nothing", () => {
    const draw = drawStream("", "one");

    assert.strictEqual(drawBelow(draw, 1n), 0n);
    assert.strictEqual(draw(), 0x8b_90_9b_b4);
  });
});

describe("templateLabel and responseLabel", () => {
  it("join the instance, a fixed word and the item or count with U+001F, and no seed", () => {
    assert.strictEqual(templateLabel("i", "item"), "i\u001Ftemplate\u001Fitem");
    assert.strictEqual(responseLabel("i", 2), "i\u001Fresponse\u001F2");
  });
});
