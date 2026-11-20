/**
 * The English texts of the image stage and area geometry the graphic interactions share
 * (`#plate/ui/graphic/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * The image stage's texts, keyed by the role each plays. An area the author gave no label is
 * named `graphicAreaOf` in its interaction's list, `{n}` its place among the areas in document
 * order and `{count}` how many there are, so its control has a name (WCAG 1.1.1). A stage whose
 * region scrolls across, its container narrower than the width its targets need, is described by
 * `graphicScroll`, so a child who reaches it from the keyboard knows to scroll it. A stage whose
 * interaction has no prompt or name, and whose image names itself by no `alt` or fallback text, is
 * named `graphicPicture`.
 */
export const graphicMessages = {
  graphicAreaOf: "Area {n} of {count}",
  graphicAssociateMatchMax: "Pair {name} with at most {n} other areas.",
  graphicAssociateMatchMaxOne: "Pair {name} with at most 1 other area.",
  graphicAssociateMatchMin: "Pair {name} with at least {n} other areas.",
  graphicAssociateMatchMinOne: "Pair {name} with at least 1 other area.",
  graphicAssociateOutside: "{name} cannot be paired with {other}; pair it with one of {allowed}.",
  graphicAssociateSelf: "{name} is paired with itself; pair two different areas.",
  graphicAssociateTwice: "{a} and {b} are paired more than once; pair them once.",
  graphicAssociateUnknown: "Pair only the areas the image shows.",
  graphicGapMatchChoiceAtLeast: "Use choice {choice} at least {n} times.",
  graphicGapMatchChoiceAtLeastOne: "Use choice {choice} at least 1 time.",
  graphicGapMatchChoiceAtMost: "Use choice {choice} at most {n} times.",
  graphicGapMatchChoiceAtMostOne: "Use choice {choice} at most 1 time.",
  graphicGapMatchHotspotAtLeast: "Place at least {n} choices on area {area}.",
  graphicGapMatchHotspotAtLeastOne: "Place at least 1 choice on area {area}.",
  graphicGapMatchHotspotAtMost: "Place at most {n} choices on area {area}.",
  graphicGapMatchHotspotAtMostOne: "Place at most 1 choice on area {area}.",
  graphicGapMatchNotInChoiceGroup:
    "Choice {choice} cannot go on area {area}; use one of {group} instead.",
  graphicGapMatchNotInHotspotGroup:
    "Choice {choice} cannot go on area {area}; that area takes {group}.",
  graphicOrderAtLeast: "Place at least {n} areas in order.",
  graphicOrderAtLeastOne: "Place at least 1 area in order.",
  graphicOrderAtMost: "Place at most {n} areas in order.",
  graphicOrderAtMostOne: "Place at most 1 area in order.",
  graphicOrderTwice: "{name} is placed more than once; place each area once.",
  graphicOrderUnknown: "Place only the areas the image shows.",
  graphicPicture: "Picture",
  graphicScroll: "Scroll to see the whole image.",
} as const;
