/**
 * The pairs an Associate or a Graphic Associate takes: how many the child may make, how many each
 * choice may join, and which are right, each choice named by its place.
 *
 * @module
 */
import { Array as Arr } from "effect";
import { dimension } from "#specimen/dimension.ts";

/**
 * How many pairs the child may make: one (`max-associations="1"`, a single pair), at most as many
 * as are right, or any number (`max-associations="0"`).
 */
export const pairs = dimension("Pairs", [
  ["one", "One", "one"],
  ["at-most", "Up to the right ones", "at-most"],
  ["any", "Any number", "any"],
]);

/**
 * How many pairs each choice may join, its `match-max`: one, so the right pairs share no choice;
 * two, so they run choice to choice in a chain; or any number (`match-max="0"`), chained.
 */
export const reach = dimension("Pairs a choice joins", [
  ["one", "One", 1],
  ["two", "Two", 2],
  ["any", "Any number", 0],
]);

/**
 * How many pairs the child may make.
 */
export type Pairs = (typeof pairs.values)[number]["value"];

/**
 * How many pairs a choice may join, 0 for any number.
 */
export type Reach = (typeof reach.values)[number]["value"];

/**
 * A pair of two choices, by their places.
 */
export type Pair = readonly [number, number];

/**
 * The right pairs of `count` choices: neighbours in order, sharing no choice when each joins one
 * pair, else chained; only the first where the child makes one pair. The first choice and the
 * last are never a right pair, at three choices or more.
 *
 * @param count How many choices, at least 3.
 * @param held How many pairs the child may make.
 * @param joins How many pairs a choice may join.
 * @returns The pairs, at least one.
 */
export const rightPairs = (
  count: number,
  held: Pairs,
  joins: Reach,
): Arr.NonEmptyReadonlyArray<Pair> => {
  const all: Arr.NonEmptyReadonlyArray<Pair> =
    joins === 1
      ? Arr.makeBy(Math.floor(count / 2), (at) => [2 * at, 2 * at + 1] as const)
      : Arr.makeBy(count - 1, (at) => [at, at + 1] as const);

  return held === "one" ? [Arr.headNonEmpty(all)] : all;
};

/**
 * The `max-associations` the pairs write: 1, the right count, or 0 for any number.
 *
 * @param held How many pairs the child may make.
 * @param right How many pairs are right.
 * @returns The count.
 */
export const maxAssociations = (held: Pairs, right: number): number => {
  switch (held) {
    case "one": {
      return 1;
    }
    case "at-most": {
      return right;
    }
    case "any": {
      return 0;
    }
  }
};
