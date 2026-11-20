/**
 * Plate's randomness, all of it keyed HMAC-SHA-256: the keyed digest a shuffled choice's rank and
 * every seed a decision derives take ({@link keyedDigest}), and the stream template and response
 * processing draw from ({@link drawStream}), with the readers of floats and integers from it.
 *
 * - A shuffle's order is public: the candidate sees it. Each choice that is not fixed is ranked by
 *   the keyed digest of its identifier under the shuffle seed (`presentedOrder` in
 *   `#plate/shuffle.ts`).
 * - Template and response processing's values are secret: a template value may be the answer. They
 *   come from an HMAC-SHA-256 counter-mode stream keyed by the record's seed ({@link drawStream}),
 *   so while the seed cannot be guessed, neither the page nor the item's XML predicts one draw from
 *   another. {@link drawFloat} and {@link drawBelow} read floats and integers from a stream.
 *
 * The algorithms are part of the item session's contract. A served item's presented order and
 * every value a random kind draws are replayed from the decision's seed alone, so the same seed and
 * key give the same draws on every host, and a host recomputes them on every request. Every step
 * is pinned to the bit, and nothing here may change without a new pin.
 *
 * The module is synchronous, and its only import is `node:crypto`'s HMAC, which the server core may
 * load; no `"use client"` module reaches it. It holds no stream: every draw comes from a stream its
 * caller passes, so no result depends on an earlier call.
 *
 * @module
 */
/* oxlint-disable no-bitwise -- the float draw and the integer draw are defined by shifts of 32-bit words; the bitwise operators are the specification, not a slip for logical ones. */
import { createHmac } from "node:crypto";

/**
 * 2^32, the number of distinct draws; a draw divided by it is a fraction in [0, 1).
 */
const drawCount = 4_294_967_296;

/**
 * One stream's draws: each call gives the stream's next draw, an unsigned 32-bit integer, and
 * advances the stream.
 *
 * Every draw of one processing run comes from one stream, in evaluation order, so the run's values
 * depend only on the stream's seed and label ({@link drawStream}).
 */
export type Draw = () => number;

/**
 * The encoder of a key's, a seed's and a label's UTF-8 bytes. A lone surrogate encodes as U+FFFD,
 * as the Encoding Standard's UTF-8 encoder writes it.
 *
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 */
const utf8 = new TextEncoder();

/**
 * The bytes of one HMAC-SHA-256 tag, and so of one block of {@link drawStream}'s draws.
 */
const tagLength = 32;

/**
 * Construct the stream template or response processing draws from: HMAC-SHA-256 in counter mode,
 * keyed by the seed.
 *
 * The key K is the seed's UTF-8 bytes. Block b, for b = 0, 1, 2, …, is HMAC-SHA-256(K, UTF-8(label)
 * ‖ b as four big-endian bytes), and draw j is the unsigned big-endian 32-bit word (j mod 8) of
 * block ⌊j / 8⌋. The construction is part of the session contract. While the seed cannot be
 * guessed, the draws of one label tell nothing of another's, nor of a later draw of the same
 * label.
 *
 * Each call starts a fresh stream, so the same seed and label give the same draws in every call.
 * The stream computes a block, through `node:crypto`'s synchronous `createHmac`, when its first
 * word is drawn. The counter wraps after 2^32 blocks, 2^35 draws, and the stream then repeats from
 * its first draw, so its draws stay a function of the seed and label alone; nothing bounds the
 * draws of one run, but reaching the wrap takes hours.
 *
 * @param seed The record's seed, the HMAC key: the caller's, used as given.
 * @param label What the stream draws for: {@link templateLabel}'s or {@link responseLabel}'s.
 * @returns The stream's draws.
 * @see https://www.rfc-editor.org/rfc/rfc2104
 * @see https://nodejs.org/api/crypto.html#cryptocreatehmacalgorithm-key-options
 */
export const drawStream = (seed: string, label: string): Draw => {
  const key = utf8.encode(seed);
  const labelBytes = utf8.encode(label);
  const counter = new DataView(new ArrayBuffer(4));
  let block = 0;
  let words: DataView = new DataView(new ArrayBuffer(tagLength));
  let next = tagLength;

  return () => {
    if (next === tagLength) {
      counter.setUint32(0, block);

      const tag = createHmac("sha256", key).update(labelBytes).update(counter).digest();

      words = new DataView(tag.buffer, tag.byteOffset, tag.byteLength);
      block += 1;
      next = 0;
    }

    const word = words.getUint32(next);

    next += 4;

    return word;
  };
};

/**
 * Draw a float in [0, 1) from two draws `a` and `b`, taken in that order:
 * `((a >>> 5) × 67_108_864 + (b >>> 6)) / 9_007_199_254_740_992`, that is, the top 27 bits of `a`
 * above the top 26 bits of `b`, over 2^53.
 *
 * The 53-bit numerator is exact in a `number` and the division by 2^53 is exact, so the float is
 * the same on every host: one of the 2^53 multiples of 2^-53 below 1, each equally likely. The
 * formula is part of the session contract.
 *
 * @param draw The stream; the float takes its next two draws.
 * @returns The float, at least 0 and below 1.
 */
export const drawFloat = (draw: Draw): number => {
  const high = draw() >>> 5;
  const low = draw() >>> 6;

  return (high * 67_108_864 + low) / 9_007_199_254_740_992;
};

/**
 * Read one candidate of {@link drawBelow}: ⌈bits / 32⌉ draws as one big-endian number, the first
 * draw the most significant 32-bit word and the last the least, masked to its low `bits` bits.
 *
 * @param draw The stream.
 * @param bits The number of low bits kept, 1 or more.
 * @returns The candidate, below 2^bits.
 */
const candidateOf = (draw: Draw, bits: number): bigint => {
  let whole = 0n;
  for (let read = 0; read < bits; read += 32) {
    whole = whole * BigInt(drawCount) + BigInt(draw());
  }

  return BigInt.asUintN(bits, whole);
};

/**
 * Draw an integer below a count, each equally likely, by rejection: with `k` the bit length of
 * `count − 1`, read ⌈k / 32⌉ draws as one big-endian number (the first draw the most significant
 * 32-bit word, the last the least), mask it to its low `k` bits, and draw again while the result is
 * not below `count`.
 *
 * A candidate is below 2^k, which is less than twice `count`, so each candidate is accepted with
 * probability above one half. A count of 1 has `k` 0: it draws nothing and gives 0. The procedure
 * is part of the session contract.
 *
 * @param draw The stream; each candidate takes its next ⌈k / 32⌉ draws.
 * @param count The number of values to draw among, 1 or more. A count below 1 is read as 1, so the
 *   draw always ends.
 * @returns The integer, at least 0 and below `count`.
 */
export const drawBelow = (draw: Draw, count: bigint): bigint => {
  if (count <= 1n) {
    return 0n;
  }

  const bits = (count - 1n).toString(2).length;
  let candidate = candidateOf(draw, bits);
  while (candidate >= count) {
    candidate = candidateOf(draw, bits);
  }

  return candidate;
};

/**
 * The separator of a label's fields, U+001F INFORMATION SEPARATOR ONE, as a shuffled Choice's key
 * joins its fields (`choiceOrder` in `#plate/interactions/choice.ts`).
 */
const labelSeparator = "\u001F";

/**
 * Hash fields under a key: HMAC-SHA-256 keyed by the key's UTF-8 bytes over the fields' UTF-8
 * bytes joined by U+001F, as a label joins its fields. Every caller's fields but at most one are
 * free of U+001F (fixed words and XML identifiers), so the joined text splits back into them and
 * two lists of fields never hash alike.
 *
 * It is the keyed hash every derivation from a decision's seed takes (`#plate/seed.ts`) and the
 * rank a shuffled choice takes (`#plate/shuffle.ts`): the same key and fields give the same digest
 * on every host, and while the key cannot be guessed, no digest tells anything of another.
 *
 * @param key The HMAC key.
 * @param fields The message's fields.
 * @returns The 32-byte digest.
 * @see https://www.rfc-editor.org/rfc/rfc2104
 */
export const keyedDigest = (key: string, fields: readonly string[]): Buffer =>
  createHmac("sha256", utf8.encode(key))
    .update(utf8.encode(fields.join(labelSeparator)))
    .digest();

/**
 * Construct the label an item's template processing draws under:
 * `<instance>\u001Ftemplate\u001F<item>`.
 *
 * The seed is no field: it is the stream's key ({@link drawStream}). The label is injective: every
 * field after the instance is free of U+001F (a fixed word and an XML identifier), so a label
 * splits from the right into its fields.
 *
 * @param instance The item's instance.
 * @param item The item's identifier.
 * @returns The label, for {@link drawStream}.
 */
export const templateLabel = (instance: string, item: string): string =>
  [instance, "template", item].join(labelSeparator);

/**
 * Construct the label an attempt's response processing draws under:
 * `<instance>\u001Fresponse\u001F<numAttempts>`, the count written with `String`.
 *
 * The seed is no field: it is the stream's key ({@link drawStream}). The label is injective: every
 * field after the instance is free of U+001F (a fixed word and decimal digits), so a label splits
 * from the right into its fields.
 *
 * @param instance The item's instance.
 * @param numAttempts The attempt's count, the built-in `numAttempts` its processing reads.
 * @returns The label, for {@link drawStream}.
 */
export const responseLabel = (instance: string, numAttempts: number): string =>
  [instance, "response", String(numAttempts)].join(labelSeparator);
