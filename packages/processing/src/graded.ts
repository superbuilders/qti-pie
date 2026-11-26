/**
 * The one grade: a {@link Graded} result, which only the evaluator's entries mint.
 *
 * The brand's key is a symbol this module holds and never exports, and the package's `exports`
 * map does not list this module, so no code outside the package can make a `Graded` value: not by
 * a literal (the key cannot be named), not by a cast (casts are banned) and not through `any`
 * (banned too). The ledger's write of a grade takes a `Graded` value alone, so nothing but the
 * evaluator's result can be written as a grade.
 *
 * @module
 */

/**
 * A SHA-256 digest.
 */
export interface Digest {
  /**
   * The digest, as 64 lowercase hexadecimal digits.
   */
  readonly sha256: string;
}

/**
 * An instant as the database stamps it.
 */
export interface Instant {
  /**
   * Microseconds since the Unix epoch.
   */
  readonly microseconds: bigint;
}

/**
 * What one member's grade read of its responses: the save it graded, or the default submission
 * where the candidate saved nothing, and the digest of the canonical encoding of the values read.
 */
export interface ResponsesRead {
  readonly digest: Digest;
  readonly saved: { readonly at: Instant; readonly kind: "save" } | { readonly kind: "default" };
}

/**
 * What a grade was computed from, which the write stores and its laws check at COMMIT: the
 * program it ran, the responses it read, the processed attempt it graded on top of, and when its
 * inputs were read.
 */
export interface GradeProof {
  /**
   * The digest of the stored document whose program ran.
   */
  readonly program: Digest;
  /**
   * The processed attempt the grade follows, by its instant, or none.
   */
  readonly prior: { readonly at: Instant; readonly kind: "processed" } | { readonly kind: "none" };
  /**
   * When the inputs were read: the instant the database gave the read.
   */
  readonly readAt: Instant;
  readonly responses: readonly ResponsesRead[];
}

/**
 * The brand's key. It is never exported.
 */
const graded: unique symbol = Symbol("graded");

/**
 * A result the evaluator computed, carrying the proof of what it was computed from.
 */
export type Graded<T extends object> = T & { readonly [graded]: GradeProof };

/**
 * Mint a grade. Only the evaluator's entries call it.
 *
 * @param result - The result.
 * @param proof - What it was computed from.
 * @returns The grade.
 */
export const mint = <T extends object>(result: T, proof: GradeProof): Graded<T> => ({
  ...result,
  [graded]: proof,
});

/**
 * Read a grade's proof.
 *
 * @param grade - The grade.
 * @returns What it was computed from.
 */
export const proofOf = (grade: Graded<object>): GradeProof => grade[graded];
