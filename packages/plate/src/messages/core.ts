/**
 * The English core texts: the shell's own words, the response checks, the review's marks, and the
 * islands of Choice, Inline Choice, Text Entry, Extended Text, Match, Gap Match and
 * Order with the placement primitive under the last three. One area of the catalog
 * (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * The core texts, keyed by the role each plays.
 *
 * A `{name}` in a text is a placeholder that `message` fills. A review against the solution writes
 * a mark's words, which a screen reader reads where the eye reads its ✓ or ✗: `markRight` and
 * `markWrong` on the candidate's answer, `markMissed` on a right answer the candidate did not give
 * (a Choice's right choice not picked, a chip in its right place), `markMissing` on a chip the
 * candidate left in the bank, and `markMissedAnswer` for a Text Entry's or an Inline Choice's right
 * answer, written after the block that holds it, with the right answer as its `answer`. A review
 * with nothing to mark against says `markGiven` on a Choice's picked choice, where only its look
 * says it is picked, and a solution says `markMissed` on each right choice it shows. A review's
 * feedback opens with its verdict, by the credit the host graded the attempt by: `verdictFull`,
 * `verdictPartial` or `verdictNone`; and `feedbackWhy` titles the item's explanation. A part plate
 * does not render is `notice`. A response check refuses with `atLeast`, `atMost`, `unknownChoice`
 * and the `malformed…` keys; `atLeastStrings` and `atMostStrings` read in the plural, so at a count
 * of 1 an Extended Text writes `atLeastOneString` or `atMostOneString`, their singular.
 *
 * A text control's name is `answer`, or `answerOf` among several, and an Extended Text's boxes are
 * `answerOf` within it; a choice whose content gives no text is `choiceOf`; its hint for a text the
 * `pattern-mask` refuses is `patternMismatch`; an Inline Choice shows `selectPrompt` while nothing
 * is picked; a Choice and a Hot Text say `choiceLimit` when a pick past `max-choices` is refused,
 * a Hot Text unless its author wrote a `data-max-selections-message` to say instead. The placement
 * primitive under Match, Gap Match and Order says the `placement…` keys, each a step of a pick and
 * a place or a refusal, with `{chip}` the chip that moved, `{target}` where it went or was refused,
 * `{other}` the chip a swap displaced, and `{from}` where that chip went. Match says
 * `matchChipUsedUp` and `matchFull` in place of the primitive's words for a chip used up and a full
 * group, Order its `order…` keys wherever a label names a position, by its number, and Gap Match
 * names each gap `gapMatchGap`. A Match laid out as a table (`qti-match-tabular`) says its
 * `matchTable…` keys in place of the primitive's refusals, a row's source `{chip}` and a column's
 * target `{target}`, and `matchTableMoved` when a row of radios' tick moves to `{target}`.
 *
 * A Choice whose host asks for it (`picksInstruction`) writes `picksInstructionOne` under its
 * prompt where the child picks one, `picksInstructionMany` where more, and `picksInstructionReview`
 * in a review, AlphaTest's player's words.
 *
 * Match, Gap Match and Order refuse a response past their own limits with the `match…`,
 * `gapMatch…` and `order…` keys that name a choice, a gap or a pair by its identifier (`{choice}`,
 * `{gap}`, `{source}`, `{target}`, `{pair}`) and the identifiers a `match-group` lists
 * (`{group}`); a key ending in `One` is its count's singular, written at a count of 1.
 */
export const coreMessages = {
  answer: "Answer",
  answerOf: "Answer {n} of {count}",
  atLeast: "Select at least {n}.",
  atLeastOneString: "Enter at least 1 answer.",
  atLeastStrings: "Enter at least {n} answers.",
  atMost: "Select at most {n}.",
  atMostOneString: "Enter at most 1 answer.",
  atMostStrings: "Enter at most {n} answers.",
  choiceLimit: "You can choose up to {n}. Take one back to choose another.",
  choiceOf: "Choice {n} of {count}",
  feedbackWhy: "Why",
  gapMatchChoiceAtLeast: "Use choice {choice} in at least {n} gaps.",
  gapMatchChoiceAtLeastOne: "Use choice {choice} in at least 1 gap.",
  gapMatchChoiceAtMost: "Use choice {choice} in at most {n} gaps.",
  gapMatchChoiceAtMostOne: "Use choice {choice} in at most 1 gap.",
  gapMatchGap: "Blank {n}",
  gapMatchGapFull: "Place only one choice in gap {gap}.",
  gapMatchGapRequired: "Place a choice in gap {gap}.",
  gapMatchNotInChoiceGroup: "Choice {choice} cannot go in gap {gap}; use one of {group} instead.",
  gapMatchNotInGapGroup: "Choice {choice} cannot go in gap {gap}, which takes only {group}.",
  malformedNumber: "Enter a number.",
  malformedSingleMany: "Enter one answer.",
  markGiven: "Your answer",
  markMissed: "Right answer",
  markMissedAnswer: "Right answer: {answer}",
  markMissing: "Missing",
  markRight: "Your answer, right",
  markWrong: "Your answer, wrong",
  matchChipUsedUp: "{chip} is already in a group.",
  matchChoiceAtLeast: "Match {choice} with at least {n} matches.",
  matchChoiceAtLeastOne: "Match {choice} with at least 1 match.",
  matchChoiceAtMost: "Match {choice} with at most {n} matches.",
  matchChoiceAtMostOne: "Match {choice} with at most 1 match.",
  matchFull: "Full",
  matchNotInSourceGroup:
    "{source} cannot be matched with {target}; match it with one of {group} instead.",
  matchNotInTargetGroup: "{source} cannot be matched with {target}, which matches only {group}.",
  matchRepeated: "Make the match {pair} once.",
  matchTableColumnFull: "{target} has all its ticks. Take one out first.",
  matchTableMoved: "{chip} moved to {target}.",
  matchTableNotInGroup: "{chip} doesn't go with {target}.",
  matchTableRowFull: "{chip} has all its ticks. Take one out first.",
  matchTableTotalReached: "That's all the ticks. Take one out first.",
  notAccepted: "Not accepted",
  notice: "Not supported here: {feature}",
  orderAll: "Put all {n} choices in order.",
  orderAllOne: "Put all 1 choice in order.",
  orderAtLeast: "Put at least {n} choices in order.",
  orderAtLeastOne: "Put at least 1 choice in order.",
  orderAtMost: "Put at most {n} choices in order.",
  orderAtMostOne: "Put at most 1 choice in order.",
  orderChipUsedUp: "{chip} already has a number.",
  orderPlaced: "{chip} is number {target}.",
  orderRepeated:
    "Choice {choice} is in the order more than once. Put each choice in one position only.",
  orderSlot: "Make it number {target}",
  orderSwapped: "{chip} is number {target}. {other} is number {from}.",
  orderSwappedBack: "{chip} is number {target}. {other} went back.",
  patternMismatch: "Enter an answer in the form this question asks for.",
  picksInstructionMany: "Select all that apply:",
  picksInstructionOne: "Select your answer:",
  picksInstructionReview: "Your Answer:",
  placementBankSlot: "Put it back",
  placementCanceled: "{chip} put down.",
  placementChipUsedUp: "{chip} is used up.",
  placementNotInGroup: "{chip} doesn't go in {target}.",
  placementPairMade: "{chip} is already in {target}.",
  placementPickFirst: "Pick something up first.",
  placementPicked: "{chip} picked up. Choose where it goes.",
  placementPlaced: "{chip} put in {target}.",
  placementReturned: "{chip} went back.",
  placementSlot: "Put it in {target}",
  placementSwapped: "{chip} put in {target}. {other} moved to {from}.",
  placementSwappedBack: "{chip} put in {target}. {other} went back.",
  placementTargetFull: "{target} is full. Take one out first.",
  placementTotalReached: "No more can go in. Take one out first.",
  selectPrompt: "Choose",
  unknownChoice: "Choose one of the listed options.",
  verdictFull: "That's right.",
  verdictNone: "Not quite.",
  verdictPartial: "Part of it is right.",
} as const;
