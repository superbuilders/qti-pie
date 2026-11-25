/**
 * The renderers' composition (`renderersOf`), over plate's standard renderers:
 *
 * - **the base alone** gives every kind its standard renderer, the same object;
 * - **an extension** gives each kind it names its own renderer, whole, and every other kind the
 *   standard one, whichever order disjoint extensions come in;
 * - **a kind two extensions name** stops the composition, `RendererClaimedTwice` naming the kind,
 *   wherever the two stand among the extensions.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import type { ModuleKind } from "#plate/interactions/contract.ts";
import { RendererClaimedTwice, renderersOf } from "#plate/ui/registry/compose.ts";
import type { RendererExtension, Renderers } from "#plate/ui/registry/contract.ts";
import { standardRenderers } from "#plate/ui/registry/standard.ts";

/**
 * Every module kind, as the standard renderers name them.
 */
const kinds = Object.keys(standardRenderers).filter(
  (kind): kind is ModuleKind => kind in standardRenderers,
);

/**
 * An extension of Choice, a renderer of its own that is not the standard one.
 */
const choiceOwn: RendererExtension = {
  choice: { island: () => "choice", review: () => "choice" },
};

/**
 * An extension of Slider, a renderer of its own that is not the standard one.
 */
const sliderOwn: RendererExtension = {
  slider: { island: () => "slider", review: () => "slider" },
};

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
  it("gives every kind its standard renderer where no extension names it", () => {
    assert.strictEqual(kinds.length, 19);
    assert.deepStrictEqual(differing(renderersOf(standardRenderers), standardRenderers), []);
  });

  it("gives each kind an extension names that extension's renderer, whole, in either order", () => {
    const expected: Renderers = {
      ...standardRenderers,
      choice: choiceOwn.choice ?? standardRenderers.choice,
      slider: sliderOwn.slider ?? standardRenderers.slider,
    };

    assert.notStrictEqual(expected.choice, standardRenderers.choice);
    assert.notStrictEqual(expected.slider, standardRenderers.slider);
    assert.deepStrictEqual(
      differing(renderersOf(standardRenderers, choiceOwn, sliderOwn), expected),
      [],
    );
    assert.deepStrictEqual(
      differing(renderersOf(standardRenderers, sliderOwn, choiceOwn), expected),
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
  ] as const)("refuses a kind named twice, naming it: %s", (_name, kind, extensions) => {
    assert.throws(
      () => {
        renderersOf(standardRenderers, ...extensions);
      },
      RendererClaimedTwice,
      `a renderer for ${JSON.stringify(kind)};`,
    );
  });
});
