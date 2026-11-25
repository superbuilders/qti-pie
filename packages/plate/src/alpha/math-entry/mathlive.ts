/**
 * MathLive as Alpha's math entry loads it, once a page: a module runs once in a page however many
 * fields import it, so what it sets holds for the page's every field from the first, and the
 * virtual keyboard, which every field in the page shares, is set up before it is first built.
 *
 * MathLive is told to load neither fonts nor sounds: its fonts are the page's, from Alpha's base
 * sheet (`@qti-pie/plate/alpha/styles/base.css`), which imports MathLive's own
 * (`mathlive/fonts.css`), so the host's build serves them from its own origin; and the field plays
 * no sound, as AlphaTest's never did, so no click competes with read-aloud. The keyboard's keys get
 * counted ids (`countKeycaps`, `#plate/alpha/math-entry/field.ts`).
 *
 * @module
 */
import { MathfieldElement } from "mathlive";
import { countKeycaps } from "#plate/alpha/math-entry/field.ts";

/**
 * Set MathLive up for the page, once: no fonts or sounds of its own, and counted keycap ids.
 *
 * @returns MathLive's field element, set up.
 */
const setUpPage = (): typeof MathfieldElement => {
  MathfieldElement.fontsDirectory = null;
  MathfieldElement.soundsDirectory = null;
  countKeycaps(window.mathVirtualKeyboard);

  return MathfieldElement;
};

/**
 * MathLive's field element, in a page MathLive is set up for. It is the module's own value and not
 * a re-export, so a bundler that skips a side-effect-free package's re-exports still runs
 * {@link setUpPage} before a field is made.
 */
export const Field = setUpPage();
