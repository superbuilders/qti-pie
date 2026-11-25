/**
 * Alpha's UI suite over its Text Entry renderers (`@qti-pie/plate/alpha`), composed over plate's as
 * a host composes them (`renderersOf`), each read from the page's HTML against rules written here
 * from AlphaTest's player (mastery-track-player 941a86a) and the renderers seam edullm-bd approved
 * on 2026-11-25, never from plate's code.
 *
 * - AT1, the math entry: under `alphaRenderers` a box its author marked `alpha-math-entry` is
 *   answered in a math field (`alpha-math-entry`), which brings its own keyboard, so no plate
 *   keypad stands after the body even under `on-screen`; a solution draws its answer as math
 *   (`alpha-math-entry-answer`). Every other box is plate's: the whole-number box keeps its keypad
 *   after the body and asks for no keyboard.
 * - AT2, the host's keypad: under `alphaHostKeypadRenderers`, as AlphaTest's player asked for no
 *   keyboard under its own drill keypad (`FluencyInteraction.tsx` lines 1276–1290), every box that
 *   is no math entry asks the device for none and shows no plate keys, under `on-screen` and under
 *   `none`; the math entry stays the math entry.
 * - AT3, one renderer per kind: composing both of Alpha's extensions, which both render Text Entry,
 *   is refused where it is composed (`RendererClaimedTwice`), and composing one replaces the kinds
 *   Alpha draws, Choice and Text Entry, alone, every other kind plate's.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { alphaHostKeypadRenderers, alphaRenderers } from "@qti-pie/plate/alpha";
import { RendererClaimedTwice, renderersOf, standardRenderers } from "@qti-pie/plate/ui";
import { factsOf, pageOf } from "#specimen/ui/text-entry-items.ts";

/**
 * The renderers a host that shows plate's keys composes.
 */
const withAlpha = renderersOf(standardRenderers, alphaRenderers);

/**
 * The renderers a host that shows a keypad of its own composes.
 */
const withHostKeypad = renderersOf(standardRenderers, alphaHostKeypadRenderers);

describe("Alpha's Text Entry renderers", () => {
  it("AT1: a box marked alpha-math-entry is a math field with no plate keypad, its solution drawn as math; every other box is plate's", () => {
    for (const keypad of ["none", "on-screen"] as const) {
      const facts = factsOf(pageOf("math", { keypad, mode: "answering", renderers: withAlpha }));

      assert.isTrue(facts.mathEntry, keypad);
      assert.isNull(facts.inputMode, `${keypad}: the field is no input`);
      assert.deepStrictEqual(facts.keypads, [], keypad);
    }

    assert.isTrue(
      factsOf(pageOf("math", { keypad: "on-screen", mode: "solution", renderers: withAlpha }))
        .mathAnswer,
    );

    for (const name of ["whole"] as const) {
      const facts = factsOf(
        pageOf(name, { keypad: "on-screen", mode: "answering", renderers: withAlpha }),
      );

      assert.isFalse(facts.mathEntry, name);
      assert.strictEqual(facts.inputMode, "none", name);
      assert.lengthOf(facts.keypads, 1, name);
    }
  });

  it("AT2: under the host's keypad every box but the math entry asks for no keyboard and shows no plate keys", () => {
    for (const keypad of ["none", "on-screen"] as const) {
      for (const name of ["whole", "signed", "decimal", "word"] as const) {
        const facts = factsOf(
          pageOf(name, { keypad, mode: "answering", renderers: withHostKeypad }),
        );

        assert.strictEqual(facts.inputMode, "none", `${name} under ${keypad}`);
        assert.deepStrictEqual(facts.keypads, [], `${name} under ${keypad}`);
      }

      assert.isTrue(
        factsOf(pageOf("math", { keypad, mode: "answering", renderers: withHostKeypad })).mathEntry,
        keypad,
      );
    }
  });

  it("AT3: both extensions together are refused where composed; one replaces Choice and Text Entry alone", () => {
    assert.throws(() => {
      renderersOf(standardRenderers, alphaRenderers, alphaHostKeypadRenderers);
    }, RendererClaimedTwice);
    assert.strictEqual(withAlpha["text-entry"], alphaRenderers["text-entry"]);
    assert.strictEqual(withHostKeypad["text-entry"], alphaHostKeypadRenderers["text-entry"]);
    assert.strictEqual(withAlpha.choice, alphaRenderers.choice);
    assert.strictEqual(withHostKeypad.choice, alphaRenderers.choice);
    assert.notStrictEqual(withAlpha["text-entry"], withHostKeypad["text-entry"]);
    for (const kind of ["inline-choice", "extended-text", "gap-match", "order"] as const) {
      assert.strictEqual(withAlpha[kind], standardRenderers[kind], kind);
      assert.strictEqual(withHostKeypad[kind], standardRenderers[kind], kind);
    }
  });
});
