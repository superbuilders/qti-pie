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
