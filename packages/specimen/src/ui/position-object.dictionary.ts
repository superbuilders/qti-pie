/**
 * The closed vocabulary the Position Object suite (`position-object.test.ts`) presses keys from,
 * the domain itself, never cases a person chose: the arrow keys.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";

/**
 * The arrow keys, as the `key` values UI Events names them (UI Events KeyboardEvent key Values,
 * §3.4, navigation keys), which Playwright's `keyboard.press` takes.
 */
export const arrowKeys = dictionary(["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"]);
