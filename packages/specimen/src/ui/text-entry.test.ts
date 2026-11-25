/**
 * Plate's UI suite over plate's Text Entry renderer (`standardRenderers`): where the on-screen
 * keypad stands, which keys it holds, and which keyboard each box asks the device for, each read
 * from the page's HTML against rules written here from the specification and the K–2 forms'
 * screens, never from plate's code.
 *
 * - TE1, the keypad's place: the K–2 forms' product spec puts the keypad below everything the child
 *   reads (the response area below the picture and the lines), so under `textEntryKeypad`
 *   `on-screen` each box's keypad stands after the item's body: never inside a paragraph, where it
 *   would split the sentence "4 + [ ] = 11", and after the line that follows the sentence, never
 *   between the box and that line.
 * - TE2, its keys: a whole-number box's keypad holds 1 to 9, then 0, then backspace, and a decimal
 *   box's adds the decimal point; under `none` no box shows keys, and neither does a solution.
 * - TE3, the keyboard asked for (HTML's `inputmode`): a box the keys type whole asks for none, so the
 *   device's own keyboard never opens over the keys and the picture: a whole-number box whose
 *   `pattern-mask` admits no negative number. A box that takes what no key types keeps the device's
 *   keyboard for it: a whole-number box with no mask, whose minus no key types, asks for the number
 *   keyboard, a decimal box for the decimal one, and a word box for the text keyboard. Under `none`
 *   every box asks what its base type asks.
 * - TE4, plain QTI: plate's renderer knows no Alpha class, so a box marked `alpha-math-entry` renders
 *   as any string box, its keypad and all.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { standardRenderers } from "@qti-pie/plate/ui";
import { factsOf, pageOf } from "#specimen/ui/text-entry-items.ts";

/**
 * A whole-number box's keys, 1 to 9, then 0, then backspace, read row by row.
 */
const wholeKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace"];

/**
 * The line after the sentence in every item.
 */
const line = "Type the number that makes the sentence true.";

/**
 * The keys a box shows under on-screen while the child answers, through plate's renderers.
 *
 * @param name The item.
 * @returns Each keypad's keys.
 */
const shown = (name: "decimal" | "whole") =>
  factsOf(pageOf(name, { keypad: "on-screen", mode: "answering", renderers: standardRenderers }))
    .keypads;

/**
 * The keyboard a box asks the device for, through plate's renderers.
 *
 * @param name The item.
 * @param keypad The host's `textEntryKeypad`.
 * @returns The box's `inputmode`, none for no attribute.
 */
const asked = (name: "decimal" | "signed" | "whole" | "word", keypad: "none" | "on-screen") =>
  factsOf(pageOf(name, { keypad, mode: "answering", renderers: standardRenderers })).inputMode;

describe("plate's Text Entry renderer", () => {
  it("TE1: under on-screen, one keypad per box, after the item's body: in no paragraph, and after the line that follows the sentence", () => {
    for (const name of ["whole", "signed", "decimal", "word"] as const) {
      const facts = factsOf(
        pageOf(name, { keypad: "on-screen", mode: "answering", renderers: standardRenderers }),
      );

      assert.lengthOf(facts.keypads, 1, name);
      assert.isFalse(facts.keypadInParagraph, name);
      assert.deepStrictEqual(facts.keypadFollows, [line], name);
    }
  });

  it("TE2: a whole-number box's keys are 1 to 9, 0 and backspace, a decimal box's add the point, and none show under none or in a solution", () => {
    assert.deepStrictEqual(shown("whole"), [wholeKeys]);
    assert.deepStrictEqual(shown("decimal"), [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"],
    ]);

    for (const name of ["whole", "signed", "decimal", "word"] as const) {
      assert.deepStrictEqual(
        factsOf(pageOf(name, { keypad: "none", mode: "answering", renderers: standardRenderers }))
          .keypads,
        [],
        `${name} under none`,
      );
      assert.deepStrictEqual(
        factsOf(
          pageOf(name, { keypad: "on-screen", mode: "solution", renderers: standardRenderers }),
        ).keypads,
        [],
        `${name} in a solution`,
      );
    }
  });

  it("TE3: a box the keys type whole asks for no keyboard; one that takes what no key types keeps the device's", () => {
    assert.strictEqual(asked("whole", "on-screen"), "none");
    assert.strictEqual(asked("signed", "on-screen"), "numeric");
    assert.strictEqual(asked("decimal", "on-screen"), "decimal");
    assert.isNull(asked("word", "on-screen"));
    assert.strictEqual(asked("whole", "none"), "numeric");
    assert.strictEqual(asked("signed", "none"), "numeric");
    assert.strictEqual(asked("decimal", "none"), "decimal");
    assert.isNull(asked("word", "none"));
  });

  it("TE4: a box marked alpha-math-entry renders as any string box, its keypad and all", () => {
    const facts = factsOf(
      pageOf("math", { keypad: "on-screen", mode: "answering", renderers: standardRenderers }),
    );

    assert.isFalse(facts.mathEntry);
    assert.isNull(facts.inputMode);
    assert.lengthOf(facts.keypads, 1);
  });
});
