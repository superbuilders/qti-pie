/**
 * How many of something an interaction allows, as the server writes it for an island: a choice's
 * uses, a target's capacity, or the associations in all. Safe to import on the server.
 *
 * QTI writes these counts as non-negative integers where 0 means no limit: a choice's `match-max`
 * ("If match-max is 0 then there is no restriction", QTI 3.0 information model 5.131.6; a gap
 * text's 5.58.5, a gap image's 5.56.5), an interaction's `max-associations` ("If max-associations
 * is 0 then there is no restriction", 5.89.2; gap match's 5.57.3). The server reads that once
 * ({@link limitOf}), from the attribute or its XSD default, and writes `{ kind: "none" }` for 0 and
 * `{ kind: "at-most", n }` for any other count, so no island reads a 0. A picks group's
 * `max-choices` is not a `Limit` but part of its `Picks` (`#plate/interactions/picks.ts`), where a
 * limit of 1 is one pick; an Order's is not one either: QTI gives its 0 no such meaning (plate's
 * reading 18), and the server sends an Order its positions instead.
 *
 * @module
 */

/**
 * A count's limit: none, or at most `n`, a whole number from 1.
 */
export type Limit = { readonly kind: "none" } | { readonly kind: "at-most"; readonly n: number };

/**
 * Report whether a count has reached its limit, so one more would pass it.
 *
 * @param limit The limit.
 * @param count How many there are.
 * @returns Whether the count is at or past the limit; never for no limit.
 */
export const reached = (limit: Limit, count: number): boolean =>
  limit.kind === "at-most" && count >= limit.n;

/**
 * Report whether a limit is exactly one: a choice that goes in one place at a time, a target that
 * holds one chip.
 *
 * @param limit The limit.
 * @returns Whether it allows one and no more.
 */
export const isOne = (limit: Limit): boolean => limit.kind === "at-most" && limit.n === 1;

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
