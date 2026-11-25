/**
 * The renderers' composition (`renderersOf`, `@qti-pie/plate/ui`), over plate's standard renderers:
 *
 * - **the base alone** gives every kind its standard renderer, the same object;
 * - **an extension** gives each kind it names its own renderer, whole, and every other kind the
 *   standard one, whichever order disjoint extensions come in, however it holds the renderer (its
 *   own key or a getter of its class);
 * - **a kind two extensions name** stops the composition, `RendererClaimedTwice` naming the kind,
 *   wherever the two stand among the extensions;
 * - **a key that is no kind**, a misspelt kind handed through a variable, stops it,
 *   `RendererKindUnknown` naming the key.
 *
 * The suite sits here, not beside the composition: plate's UI has no tests of its own (AGENTS.md).
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import {
  RendererClaimedTwice,
  RendererKindUnknown,
  renderersOf,
  standardRenderers,
} from "@qti-pie/plate/ui";
import type { Renderer, RendererExtension, Renderers } from "@qti-pie/plate/ui";

/**
 * Every kind, as the standard renderers name them.
 */
const kinds = Object.keys(standardRenderers).filter(
  (kind): kind is keyof Renderers => kind in standardRenderers,
);

/**
 * A renderer of Choice of its own, not the standard one.
 */
const choiceRenderer: Renderer<"choice"> = { island: () => "choice", review: () => "choice" };

/**
 * A renderer of Slider of its own, not the standard one.
 */
const sliderRenderer: Renderer<"slider"> = { island: () => "slider", review: () => "slider" };

/**
 * An extension of Choice.
 */
const choiceOwn: RendererExtension = { choice: choiceRenderer };

/**
 * An extension of Slider.
 */
const sliderOwn: RendererExtension = { slider: sliderRenderer };

/**
 * An extension that gives Choice its renderer by a getter of its class, as a host's class might.
 */
class ChoiceByGetter {
  /**
   * The renderer the getter gives.
   */
  readonly #renderer = choiceRenderer;

  /**
   * Choice's renderer, the same as {@link choiceOwn}'s.
   *
   * @returns The renderer.
   */
  get choice(): Renderer<"choice"> {
    return this.#renderer;
  }
}

/**
 * List the kinds a composition gives another renderer than the one expected of it.
 *
 * @param composed The composition.
 * @param expected The renderer of each kind it should give.
 * @returns Each kind whose renderer is not the expected object.
 */
const differing = (composed: Renderers, expected: Renderers): readonly string[] =>
  kinds.filter((kind) => composed[kind] !== expected[kind]);

describe("renderersOf", () => {
  it("gives each kind an extension names that extension's renderer, whole, in either order", () => {
    const expected: Renderers = {
      ...standardRenderers,
      choice: choiceRenderer,
      slider: sliderRenderer,
    };

    assert.notStrictEqual(expected.choice, standardRenderers.choice);
    assert.notStrictEqual(expected.slider, standardRenderers.slider);
    assert.deepStrictEqual(
      differing(renderersOf(standardRenderers, [choiceOwn, sliderOwn]), expected),
      [],
    );
    assert.deepStrictEqual(
      differing(renderersOf(standardRenderers, [sliderOwn, choiceOwn]), expected),
      [],
    );
    assert.deepStrictEqual(
      differing(renderersOf(standardRenderers, [new ChoiceByGetter(), sliderOwn]), expected),
      [],
    );
  });

  it.each([
    ["two extensions side by side", "choice", [choiceOwn, choiceOwn]],
    [
      "two extensions apart",
      "choice",
      [choiceOwn, sliderOwn, { choice: standardRenderers.choice }],
    ],
    ["the first and the third", "slider", [sliderOwn, choiceOwn, sliderOwn]],
    ["one by a getter", "choice", [new ChoiceByGetter(), choiceOwn]],
  ] as const)("refuses a kind named twice, naming it: %s", (_name, kind, extensions) => {
    assert.throws(
      () => {
        renderersOf(standardRenderers, extensions);
      },
      RendererClaimedTwice,
      `a renderer for ${JSON.stringify(kind)};`,
    );
  });

  it("refuses a key that is no kind, naming it", () => {
    const misspelt = { chioce: choiceRenderer, slider: sliderRenderer };

    assert.throws(
      () => {
        renderersOf(standardRenderers, [misspelt]);
      },
      RendererKindUnknown,
      `a renderer for "chioce",`,
    );
  });
});
