/**
 * Plate's keyed digest, HMAC-SHA-256 ({@link keyedDigest}): the rank a shuffled choice takes and
 * every seed a decision derives, which are presentation, not grading. A shuffle's order is public:
 * the candidate sees it. Each choice that is not fixed is ranked by the keyed digest of its
 * identifier under the shuffle seed (`presentedOrder` in `#plate/shuffle.ts`), and a stage's items
 * by the digest of their identity under the decision's seed (`stageOrder` in `#plate/seed.ts`).
 * Template and response processing draw nothing here: the QTI database runs them.
 *
 * The algorithm is part of the item session's contract: a served item's presented order is
 * replayed from the decision's seed alone, so the same seed and key give the same digest on every
 * host. It is pinned to the bit, and nothing here may change without a new pin.
 *
 * The module is synchronous, and its only import is `node:crypto`'s HMAC, which the server core may
 * load; no `"use client"` module reaches it.
 *
 * @module
 */
import { createHmac } from "node:crypto";

/**
 * The encoder of a key's and its fields' UTF-8 bytes. A lone surrogate encodes as U+FFFD,
 * as the Encoding Standard's UTF-8 encoder writes it.
 *
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 */
const utf8 = new TextEncoder();

/**
 * The separator of a digest's fields, U+001F INFORMATION SEPARATOR ONE, as a shuffled Choice's key
 * joins its fields (`choiceOrder` in `#plate/interactions/choice.ts`).
 */
const fieldSeparator = "\u001F";

/**
 * Hash fields under a key: HMAC-SHA-256 keyed by the key's UTF-8 bytes over the fields' UTF-8
 * bytes joined by U+001F. Every caller's fields but at most one are
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
    .update(utf8.encode(fields.join(fieldSeparator)))
    .digest();
