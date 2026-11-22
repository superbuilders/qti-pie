/**
 * The rule a choice brings to a board of the placement machine (`#plate/placement/machine.ts`):
 * a chip of a board of pairs, which Match and Gap Match post `directedPair`s from, or of a board of
 * boxes, which Associate and Graphic Associate post `pair`s from. Safe to import on the server.
 *
 * @module
 */
import type { Limit } from "#plate/placement/limit.ts";
import type { ChipRule, PartnerRule } from "#plate/placement/machine.ts";

/**
 * What a choice brings to its rule on a board: a Match's or a Gap Match's choice on a board of
 * pairs, an associate's choice or a graphic associate's `qti-associable-hotspot` on a board of
 * boxes, whose `match-group` and `match-max` mean the same (5.7.4, 5.7.8).
 *
 * - `identifier` is the choice's `identifier`.
 * - `matchGroup` is the choice's `match-group`, the identifiers it may be associated with, empty when
 *   the author wrote none or an empty list, which both mean any (QTI 3.0 information model 5.131.5,
 *   5.58.4, 5.56.4).
 * - `matchMax` is the choice's `match-max`, which QTI requires: how many associations it may be in
 *   (5.131.6, 5.58.5, 5.56.5). The server writes 0 as no limit (see {@link Limit}).
 */
export interface Associable {
  readonly identifier: string;
  readonly matchGroup: readonly string[];
  readonly matchMax: Limit;
}

/**
 * Make an associable choice a chip of a board of pairs: placed up to its `match-max`, and only
 * into the targets its `match-group` lists, when it lists any.
 *
 * @param choice The choice.
 * @returns Its chip.
 */
export const chipRuleOf = (choice: Associable): ChipRule => ({
  id: choice.identifier,
  targets: choice.matchGroup,
  uses: choice.matchMax,
});

/**
 * Make an associable choice or hotspot a chip of a board of boxes: in up to its `match-max` pairs,
 * and paired only with the choices its `match-group` lists, when it lists any.
 *
 * @param choice The choice or hotspot.
 * @returns Its chip.
 */
export const partnerRuleOf = (choice: Associable): PartnerRule => ({
  id: choice.identifier,
  partners: choice.matchGroup,
  uses: choice.matchMax,
});
