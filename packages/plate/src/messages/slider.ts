/**
 * The English texts of the Slider interaction's island and review (Q-19, `#plate/ui/slider/`). One
 * area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Slider's texts, keyed by the role each plays: `sliderEmpty` is what a slider holding no value
 * says in place of a number, its thumb to a screen reader and its readout to the eye, while the
 * child has not set it, and in a review of a response left NULL; `sliderHint` the line a slider
 * that shows no value (`plate-slider-value-hidden`) writes under its scale until the child sets it,
 * AlphaTest's own words.
 */
export const sliderMessages = {
  sliderAbove: "Choose a value of at most {bound}.",
  sliderBelow: "Choose a value of at least {bound}.",
  sliderEmpty: "No answer",
  sliderHint: "Drag the handle to choose a value",
  sliderOffStep: "Choose a value in steps of {step} from {from}.",
} as const;
