/**
 * The slots a formula holds for the interactions it draws inside itself: an empty `mspace` whose
 * `xref` names a Text Entry's, an Inline Choice's or a gap's `id` (MathML 3 §5.4.2's
 * cross-reference) is that interaction's place in the formula, as AlphaTest's player placed an
 * answer box inside a formula (mastery-track-player 941a86a, `embedded-math-entries.ts` and
 * `math-gap-slots.ts`). The server shell sizes the slot here, MathJax lays the formula out around
 * it, and the interaction is drawn over the slot (`#plate/ui/item/contents/mathml.tsx`), not at its
 * place in the body.
 *
 * A slot's size is in MathJax's em, the formula's own, so the formula reflows around it as it
 * reflows around a glyph. Every slot is as tall as plate's control inside a sentence: 48 px
 * (`--plate-control-size`) at the 20 px text (`--plate-text-size`) is 2.4 text em, which at the
 * x-height MathJax matches (0.442 of its em against about half an em of the page's sans-serif)
 * is about 2.2 of MathJax's em, centred on the math axis (0.25 em above the baseline). A Text Entry
 * is as wide as AlphaTest made it: 150 px for an expected length of four characters or fewer, about
 * 7 em at the 18 px text it drew at, and otherwise a zero's width (0.5 em) for each character it
 * expects, with the input's padding beside them (1.5 em); none stated is AlphaTest's floor of 8.
 * An Inline Choice is as wide as its longest choice's text at about half an em a character, with
 * its trigger's padding and chevron (2.5 em), and at least as wide as a Text Entry's input
 * (`min-inline-size: 6rem` in the base sheet, about 4.5 em). A gap is as wide as five em, room for
 * a short gap text's chip.
 *
 * @module
 */
import { Option } from "effect";

/**
 * A slot's size in MathJax's em: its width, and how far it reaches above and below the baseline.
 */
export interface SlotSize {
  readonly depth: number;
  readonly height: number;
  readonly width: number;
}

/**
 * How far every slot reaches above the baseline: half of its 2.2 em, above the axis at 0.25 em.
 */
const slotHeight = 1.35;

/**
 * How far every slot reaches below the baseline: half of its 2.2 em, less the axis's 0.25 em.
 */
const slotDepth = 0.85;

/**
 * A slot of a width, as tall as every slot.
 *
 * @param width Its width, in MathJax's em.
 * @returns The slot's size.
 */
const slotOf = (width: number): SlotSize => ({ depth: slotDepth, height: slotHeight, width });

/**
 * The expected length AlphaTest's player took for a Text Entry that states none
 * (`DEFAULT_TEXT_ENTRY_EXPECTED_LENGTH`).
 */
const unstatedLength = 8n;

/**
 * The longest expected length AlphaTest's player drew at its fixed short width
 * (`SHORT_EMBEDDED_MATH_ENTRY_MAX_LENGTH`).
 */
const shortLength = 4n;

/**
 * Size a Text Entry's slot from its expected length.
 *
 * @param expectedLength The author's `expected-length`, none where it states none.
 * @returns The slot's size.
 */
export const textEntrySlot = (expectedLength: Option.Option<bigint>): SlotSize => {
  const length = Option.getOrElse(expectedLength, () => unstatedLength);

  return slotOf(length <= shortLength ? 7 : Number(length) * 0.5 + 1.5);
};

/**
 * Size an Inline Choice's slot from its longest choice.
 *
 * @param longest The number of characters of its longest choice's text.
 * @returns The slot's size.
 */
export const inlineChoiceSlot = (longest: number): SlotSize =>
  slotOf(Math.max(4.5, longest * 0.55 + 2.5));

/**
 * A gap's slot.
 */
export const gapSlot: SlotSize = slotOf(5);
