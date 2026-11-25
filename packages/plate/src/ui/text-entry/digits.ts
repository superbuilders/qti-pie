/**
 * A drill's box: a Text Entry whose author marked it with plate's presentation class
 * {@link digitsClass}, which takes digits alone and asks the device for its number keyboard. The
 * interaction stays a standard `qti-text-entry-interaction`, its response a text as any box's, and
 * no `pattern-mask` or other attribute of QTI's is read for it: the class changes how plate takes
 * what is typed, never what the response is.
 *
 * AlphaTest's player took digits alone in a drill's box (mastery-track-player 941a86a,
 * `FluencyInteraction.tsx` lines 1326–1327, 1403–1404 and 1563), and plate keeps what it kept: each
 * of the ASCII digits 0 to 9, in the order typed, every other character dropped as it is typed. It
 * also cut the text at the length of the right answer (lines 1328–1331), which plate's redacted
 * item never holds, so plate cuts nothing, as it limits no Text Entry by its `expected-length`.
 *
 * The module is imported by the server shell and by client modules.
 *
 * @module
 */

/**
 * The class an author writes on a `qti-text-entry-interaction` for plate to take digits alone in
 * its box. It is in plate's own vocabulary, `plate-*`, as every name plate gives its parts is, not
 * `qti-*`, the prefix of 1EdTech's shared vocabulary.
 */
export const digitsClass = "plate-digits";

/**
 * What a drill's box does otherwise than AlphaTest's, each by what AlphaTest did, the lines of
 * `FluencyInteraction.tsx` that did it, and what plate does: one fate, counted once. AlphaTest cut
 * a drill's text at the length of the right answer; plate's redacted item never holds the answer,
 * and a cut at its length would tell the child how long it is, so plate cuts nothing, as it limits
 * no Text Entry by its `expected-length` (edullm-bd's ruling, 2026-11-22).
 */
export const digitsFates = [
  {
    alphaTest: "the text cut at the right answer's length",
    lines: "1330–1332, 1407–1409, 1564–1566",
    plate: "no cut",
  },
] as const;

/**
 * Keep what a drill's box takes of a text: its ASCII digits, in order.
 *
 * @param text The text the box holds after a keystroke.
 * @returns Its digits.
 */
export const digitsOf = (text: string): string => text.replaceAll(/[^0-9]/gu, "");
