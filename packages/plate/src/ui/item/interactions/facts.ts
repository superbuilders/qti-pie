/**
 * The facts the server reads from QTI for an island, each once, from the attribute as the model
 * holds it or its XSD default, so no island reads an unwritten attribute or a 0 that means no
 * limit: a sizing hint. A count's limit is `limitOf`'s (`#plate/placement/limit.ts`), and how many
 * options a picks group's child picks is `picksOf`'s (`#plate/interactions/picks.ts`). The model
 * holds a Choice's and an Order's `orientation` typed, a Choice's with its XSD default.
 *
 * @module
 */
import { Option } from "effect";

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
