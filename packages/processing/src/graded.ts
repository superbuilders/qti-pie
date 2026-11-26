/**
 * What a grade proves it was computed from: the program it ran, the responses it read, the
 * processed attempt it follows and when its inputs were read, and the digests and instants that
 * name them. The grade itself, `Graded`, is the grade module's (`#processing/grade.ts`), which
 * alone holds its key and mints it.
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
  /**
   * Where the responses came from: a stored save, at its instant; values posted with the answer,
   * which have no stored save and no instant; or the default submission.
   */
  readonly saved:
    | { readonly at: Instant; readonly kind: "save" }
    | { readonly kind: "default" }
    | { readonly kind: "posted" };
}

/**
 * What a grade was computed from, which the write stores and its laws check at COMMIT: the
 * program it ran, the responses it read, the processed attempt it graded on top of, and when its
 * inputs were read.
 */
export interface GradeProof {
  /**
   * The digest of the grade's whole input but the recorded operators' answers in (`evaluations`):
   * every session, response, duration, attempt count, context, seed and instant it read, so a
   * pending grade is completed on exactly the input it was graded on.
   */
  readonly inputDigest: Digest;
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
