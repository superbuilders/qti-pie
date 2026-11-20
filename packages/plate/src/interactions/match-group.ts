/**
 * The `match-group` of a choice, a gap or a hotspot, the one reading every interaction that
 * associates choices shares: whether it admits any identifier or only those it lists. Absent and
 * empty mean one thing, any (reading 179: "If no matchGroup is given, or if it is empty, then all
 * other choices may be associated with this one subject to their own matching constraints"), so
 * both read as {@link MatchGroup}'s `any`, and `only` lists at least one identifier.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { xmlWhitespaceRun } from "#plate/model/attributes.ts";

/**
 * A `match-group`: `any` identifier, or `only` the identifiers it lists, in document order.
 */
export type MatchGroup =
  | { readonly kind: "any" }
  | { readonly identifiers: Arr.NonEmptyReadonlyArray<string>; readonly kind: "only" };

/**
 * Read a `match-group`.
 *
 * @param written The attribute's value as written, none when the element does not carry it.
 * @returns `only` its identifiers, `any` when it is absent or lists none.
 */
export const matchGroupOf = (written: Option.Option<string>): MatchGroup => {
  const identifiers = Option.match(written, {
    onNone: () => [],
    onSome: (list) => list.split(xmlWhitespaceRun).filter((identifier) => identifier !== ""),
  });

  return Arr.isReadonlyArrayNonEmpty(identifiers) ? { identifiers, kind: "only" } : { kind: "any" };
};

/**
 * Give a group as the page carries it: the identifiers it lists, none listed for `any`.
 *
 * @param group The group.
 * @returns Its identifiers, empty for `any`.
 */
export const listedIn = (group: MatchGroup): readonly string[] =>
  group.kind === "any" ? [] : group.identifiers;

/**
 * Give the group that keeps one identifier of a pair away from the side the other names: that
 * side's `match-group`, when it is `only` and does not list the identifier.
 *
 * @param sides The choices, gaps or hotspots of the side, by identifier.
 * @param side The identifier of the pair on that side. One that names none of them, which a
 *   response may hold, keeps nothing out; the response's check gives it its own message.
 * @param other The identifier of the pair on the other side.
 * @returns The identifiers the side's group lists, none when the side admits `other`.
 */
export const exclusionOf = (
  sides: ReadonlyMap<string, { readonly matchGroup: MatchGroup }>,
  side: string,
  other: string,
): Option.Option<Arr.NonEmptyReadonlyArray<string>> =>
  Option.flatMap(Option.fromUndefinedOr(sides.get(side)), ({ matchGroup }) =>
    matchGroup.kind === "only" && !matchGroup.identifiers.includes(other)
      ? Option.some(matchGroup.identifiers)
      : Option.none(),
  );

/**
 * Give the side of an unordered pair whose group keeps the other side out, as Associate and Graphic
 * Associate judge a `pair`: each side's `match-group` binds (reading 179), the first side's
 * answering when both keep the other out.
 *
 * @param sides The choices or hotspots, by identifier.
 * @param first One identifier of the pair.
 * @param second The other.
 * @returns The identifier whose group keeps the other out, that other, and the identifiers the
 *   group lists; none when each side admits the other.
 */
export const unorderedExclusionOf = (
  sides: ReadonlyMap<string, { readonly matchGroup: MatchGroup }>,
  first: string,
  second: string,
): Option.Option<
  readonly [holder: string, other: string, group: Arr.NonEmptyReadonlyArray<string>]
> =>
  Option.orElse(
    Option.map(exclusionOf(sides, first, second), (group) => [first, second, group] as const),
    () => Option.map(exclusionOf(sides, second, first), (group) => [second, first, group] as const),
  );
