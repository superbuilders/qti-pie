/**
 * The English texts of the Associate interaction's island and review (Q-1, `#plate/ui/associate/`).
 * One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Associate's texts, keyed by the role each plays: `associateChipUsedUp` is what a child hears
 * when a choice already in as many pairs as its `match-max` allows is picked up again, in place of
 * the placement primitive's "used up". `{chip}` is the choice by its visible text. Every other text
 * an Associate says is the boards of boxes' (`#plate/messages/pairs.ts`) or the primitive's.
 */
export const associateMessages = {
  associateChipUsedUp: "{chip} can't go in another pair.",
  associateChoiceAtLeast: "Use choice {choice} in at least {n} pairs.",
  associateChoiceAtLeastOne: "Use choice {choice} in at least 1 pair.",
  associateChoiceAtMost: "Use choice {choice} in at most {n} pairs.",
  associateChoiceAtMostOne: "Use choice {choice} in at most 1 pair.",
  associateItself: "Choice {choice} cannot be paired with itself; pair it with a different choice.",
  associateOutsideGroup:
    "Choice {choice} cannot be paired with choice {other}; pair it with one of {group} instead.",
  associateRepeated:
    "Choice {first} and choice {second} are paired more than once; keep only one of those pairs.",
  associateUnknown: "Pair only the choices shown.",
} as const;
