/**
 * The draw stream template and response processing draw from, and the seeds it is keyed by: the
 * contract plate's engine and the SQL grader keep (QP-PROC-DIFF compares the three by
 * construction).
 *
 * - **The processing seed** of an item: `HMAC-SHA-256(decisionSeed,
 *   "processing␟<package>␟<identifier>")` as lowercase hex, ␟ being U+001F, the key and message
 *   their UTF-8 bytes ({@link processingSeed}). The package is named as the caller's truth names
 *   it.
 * - **The stream** of a seed and a label: HMAC-SHA-256 in counter mode keyed by the seed's UTF-8
 *   bytes. Block b (0, 1, 2, …) is `HMAC(seed, UTF-8(label) ‖ b as four big-endian bytes)`, and
 *   draw j is the big-endian 32-bit word j mod 8 of block ⌊j / 8⌋ ({@link drawStream}).
 * - **The labels**: template processing draws under `served␟template␟<identifier>`, an attempt's
 *   response processing under `served␟response␟<numAttempts>` ({@link templateLabel},
 *   {@link responseLabel}).
 *
 * Draws are taken in evaluation order, and a draw reader (`#processing/draws.ts`) consumes words
 * from it; nothing else does.
 *
 * @module
 */
import { hexOf, hmacSha256, utf8Bytes } from "#processing/sha256.ts";

/**
 * The separator of a label's fields, U+001F INFORMATION SEPARATOR ONE.
 */
const separator = "\u001F";

/**
 * A stream's key: the processing seed, lowercase hex.
 */
export interface Seed {
  readonly key: string;
}

/**
 * An item's processing seed: the HMAC-SHA-256, keyed by the decision's seed, of `processing`, the
 * package and the item's identifier joined by U+001F.
 *
 * @param decisionSeed - The decision's seed.
 * @param packageName - The package, as the caller's truth names it.
 * @param identifier - The item's identifier.
 * @returns The seed.
 */
export const processingSeed = (
  decisionSeed: string,
  packageName: string,
  identifier: string,
): Seed => ({
  key: hexOf(
    hmacSha256(
      utf8Bytes(decisionSeed),
      utf8Bytes(["processing", packageName, identifier].join(separator)),
    ),
  ),
});

/**
 * The label an item's template processing draws under.
 *
 * @param identifier - The item's identifier.
 * @returns The label.
 */
export const templateLabel = (identifier: string): string =>
  ["served", "template", identifier].join(separator);

/**
 * The label an attempt's response processing draws under.
 *
 * @param numAttempts - The attempt's `numAttempts`, which its processing reads.
 * @returns The label.
 */
export const responseLabel = (numAttempts: bigint): string =>
  ["served", "response", String(numAttempts)].join(separator);

/**
 * The stream of a seed and a label: each call gives its next word, an unsigned 32-bit integer. The
 * counter is four bytes, so after 2^32 blocks it repeats from its first.
 *
 * @param seed - The seed.
 * @param label - The label.
 * @returns The stream.
 */
export const drawStream = (seed: Seed, label: string): (() => number) => {
  const key = utf8Bytes(seed.key);
  const labelBytes = utf8Bytes(label);
  const message = new Uint8Array(labelBytes.length + 4);

  message.set(labelBytes);

  const counter = new DataView(message.buffer, labelBytes.length, 4);
  let block = 0;
  let words = new DataView<ArrayBufferLike>(new ArrayBuffer(32));
  let next = 32;

  return () => {
    if (next === 32) {
      counter.setUint32(0, block);
      words = new DataView(hmacSha256(key, message).buffer);
      block = (block + 1) % 4_294_967_296;
      next = 0;
    }

    const word = words.getUint32(next);
    next += 4;

    return word;
  };
};
