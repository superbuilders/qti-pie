/**
 * Where the golden grading data sits, and the one digest that pins it: what plate's grader gave
 * every generated case of every item of the bank and the corpus, recorded once by
 * `scripts/golden.ts` so that the database grader is held to it after plate's grader is gone.
 *
 * The data holds the bank's secure content and its answer keys, so it lives outside the
 * repository, in the cache, and only its digest is committed: the SHA-256 of its `SHA256SUMS`,
 * which lists every file of it with its own SHA-256. A recording that changes any byte of it
 * changes the digest, so the pin names exactly one recording.
 *
 * @module
 */
import type { Config } from "effect";
import { qtiPieCache } from "#plate/test/qti-pie.ts";

/**
 * The SHA-256 of the golden data's `SHA256SUMS`, as `scripts/golden.ts` printed it for the
 * recording the database grader is held to.
 */
export const goldenDigest = "e6bfc621c730f9c6c7a6a0136406b618e1a0db5c95c7d016f6e5601d26ffd17b";

/**
 * The directory the recording {@link goldenDigest} pins is read from,
 * `.cache/qti-pie/grading-golden` and then the digest under `HOME`: `scripts/golden.ts` keeps each
 * recording under its own digest, so a commit reads the recording its own pin names whatever other
 * pins recorded beside it.
 */
export const goldenDirectory: Config.Config<string> = qtiPieCache("grading-golden", goldenDigest);
