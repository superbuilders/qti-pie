/**
 * The text of a row's key in a keyed set, which every input of the author login's `insertWrite`
 * ChangeSet is keyed by (`#pantry/import/write.ts`), and which the overlay builders and the
 * package's own rows key theirs by alike.
 */
import { Sha256 } from "@bjornpagen/grizzle";

/**
 * The text of a row's key in a keyed set: its key's values, in key order, as one JSON array, so two
 * keys are one text exactly when their values are equal, whatever text a path holds.
 *
 * @param values - The key's values, in the relation's key order.
 * @returns The text.
 */
export const keyTextOf = (...values: readonly (bigint | string)[]): string =>
  JSON.stringify(values.map(String));

/**
 * The SHA-256 of a text's UTF-8, as `Crypto.sha256` of the text computes it in PostgreSQL: the
 * digest a row the import writes keys an unbounded text by, where its key cannot hold the text.
 *
 * @param text - The text.
 * @returns Its digest.
 */
export const textDigestOf = (text: string): Sha256 =>
  Sha256.ofBytes(new TextEncoder().encode(text));
