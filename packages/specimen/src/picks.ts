/**
 * How many picks an interaction of choices takes, and how many of its choices are right: shared by
 * every kind whose response is a set of picked choices (Choice, Hottext, Hotspot).
 *
 * @module
 */
import { dimension } from "#specimen/dimension.ts";

/**
 * How many picks the child may make: one (`max-choices="1"`, a single response), at most as many
 * as are right (`max-choices` that count), or any number (`max-choices="0"`).
 */
export const picks = dimension("Picks", [
  ["one", "One", "one"],
  ["at-most", "Up to the right ones", "at-most"],
  ["any", "Any number", "any"],
]);

/**
 * How many of the choices are right, of a response that takes several picks: one, half (at least
 * one), or all but one.
 */
export const right = dimension("Right choices", [
  ["half", "Half", "half"],
  ["one", "One", "one"],
  ["all-but-one", "All but one", "all-but-one"],
]);

/**
 * How many picks a response takes, with how many choices are right where it takes several.
 */
export type Picks =
  | { readonly kind: "one" }
  | {
      readonly kind: "any" | "at-most";
      readonly right: (typeof right.values)[number]["value"];
    };

/**
 * How many of `choices` choices are right: one for a single pick, else as its share says, never
 * every choice, so a wrong pick is always there to make.
 *
 * @param held The picks.
 * @param choices How many choices there are, at least 2.
 * @returns The count of right choices, from 1 to `choices - 1`.
 */
export const rightCount = (held: Picks, choices: number): number => {
  switch (held.kind) {
    case "one": {
      return 1;
    }
    case "any":
    case "at-most": {
      switch (held.right) {
        case "one": {
          return 1;
        }
        case "half": {
          return Math.max(1, Math.floor(choices / 2));
        }
        case "all-but-one": {
          return choices - 1;
        }
      }
    }
  }
};

/**
 * The `max-choices` a response's picks write.
 *
 * @param held The picks.
 * @param choices How many choices there are.
 * @returns 1 for one pick, the right count for at most that many, 0 for any number.
 */
export const maxChoices = (held: Picks, choices: number): number => {
  switch (held.kind) {
    case "one": {
      return 1;
    }
    case "at-most": {
      return rightCount(held, choices);
    }
    case "any": {
      return 0;
    }
  }
};

/**
 * The cardinality a response's picks bind: `single` for one pick, else `multiple`.
 *
 * @param held The picks.
 * @returns The cardinality.
 */
export const cardinalityOf = (held: Picks): "multiple" | "single" =>
  held.kind === "one" ? "single" : "multiple";
