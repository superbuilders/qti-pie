/**
 * The facts the server reads from QTI for an island, each once, from the attribute as the model
 * holds it or its XSD default, so no island reads an unwritten attribute or a 0 that means no
 * limit: a count's {@link Limit}, and a sizing hint. How many options a picks group's child picks is
 * `picksOf`'s (`#plate/interactions/picks.ts`). The model holds a Choice's and an Order's
 * `orientation` typed, a Choice's with its XSD default.
 *
 * @module
 */
import { Option } from "effect";
import type { Limit } from "#plate/ui/limit.ts";

/**
 * Read a count where QTI's 0 means no limit as a {@link Limit}: `match-max` ("If match-max is 0
 * then there is no restriction", QTI 3.0 information model 5.131.6, 5.58.5, 5.56.5),
 * and `max-associations` (5.89.2, 5.57.3). The model has already written each one's XSD default
 * where the author wrote none: 1 for `max-associations`; `match-max` is required.
 *
 * @param count The count, held exactly.
 * @returns No limit for 0, else at most the count.
 */
export const limitOf = (count: bigint): Limit =>
  count === 0n ? { kind: "none" } : { kind: "at-most", n: Number(count) };

/**
 * Read a sizing hint, `expected-length` or `expected-lines`, for an island: absent where the author
 * wrote none or 0, which sizes nothing.
 *
 * @param written The hint, held exactly.
 * @returns The hint, undefined for none or 0.
 */
export const hintOf = (written: Option.Option<bigint>): number | undefined =>
  Option.getOrUndefined(
    written.pipe(
      Option.filter((count) => count > 0n),
      Option.map(Number),
    ),
  );
