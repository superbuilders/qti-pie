/**
 * Plate's client entry: what a host's client components use to hold an item's responses and the
 * options a test's cross-out has eliminated, to hear of
 * a Portable Custom Interaction that fails, to remember a test's read-aloud across its items and to
 * post a sitting's presence beacon,
 * and the interactions' islands with their props and labels types, which the server entry renders.
 * Every module it re-exports is a client module, or holds types and pure data only.
 *
 * @module
 */
export { Choice } from "#plate/ui/choice/choice.tsx";

export type { ChoiceProps } from "#plate/ui/choice/choice.tsx";

export { ExtendedText } from "#plate/ui/extended-text/extended-text.tsx";

export type { ExtendedTextProps } from "#plate/ui/extended-text/extended-text.tsx";

export { Gap, GapMatch } from "#plate/ui/gap-match/gap-match.tsx";

export type { GapMatchProps, GapProps } from "#plate/ui/gap-match/gap-match.tsx";

export type { GapMatchLabels } from "#plate/ui/gap-match/labels.ts";

export { InlineChoice } from "#plate/ui/inline-choice/inline-choice.tsx";

export type { InlineChoiceProps } from "#plate/ui/inline-choice/inline-choice.tsx";

export type { Limit } from "#plate/placement/limit.ts";

export { Match } from "#plate/ui/match/match.tsx";

export type { MatchProps } from "#plate/ui/match/match.tsx";

export type { MatchLabels } from "#plate/ui/match/labels.ts";

export { MathEntry } from "#plate/ui/text-entry/math-entry.tsx";

export type { MathEntryProps } from "#plate/ui/text-entry/math-entry.tsx";

export { Order } from "#plate/ui/order/order.tsx";

export type { OrderProps } from "#plate/ui/order/order.tsx";

export type { OrderLabels } from "#plate/ui/order/labels.ts";

export { Eliminated } from "#plate/ui/picks/eliminated.tsx";

export type { EliminatedOption } from "#plate/interactions/eliminated.ts";

export type { AssociableChoice } from "#plate/ui/placement/associable.ts";

export type { PlacementLabels } from "#plate/ui/placement/labels.ts";

export { PciFailures } from "#plate/ui/portable-custom/failures.tsx";

export type { PciFailure } from "#plate/ui/portable-custom/failures.tsx";

export {
  presenceBeaconPeriodMillis,
  presenceIdleMillis,
  usePresenceBeacon,
} from "#plate/ui/presence/beacon.ts";

export type { PresenceBeacon } from "#plate/ui/presence/beacon.ts";

export { ReadAloudSession } from "#plate/ui/read-aloud/session.tsx";

export { Responses, useResponse } from "#plate/ui/responses.tsx";

export type { PostedEntries, PostedEntry } from "#plate/ui/props.ts";

export { digitsClass, digitsOf } from "#plate/ui/text-entry/digits.ts";

export { TextEntry } from "#plate/ui/text-entry/text-entry.tsx";

export type { TextEntryProps } from "#plate/ui/text-entry/text-entry.tsx";

export type { BoxCounts } from "#plate/ui/typed.ts";
