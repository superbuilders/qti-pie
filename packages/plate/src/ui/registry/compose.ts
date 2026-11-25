/**
 * The renderers' composition: a base, plate's standard renderers, with extensions over it, each
 * replacing whole the renderers of the kinds it names. A host composes once, at its root, where the
 * module loads, and hands the result to every `<Item>`, so a composition that names a kind twice
 * stops the host as it starts, never mid-render.
 *
 * @module
 */
import { Data } from "effect";
import type { RendererExtension, Renderers } from "#plate/ui/registry/contract.ts";

/**
 * Two extensions of one composition each give a renderer for one kind, so which one draws it would
 * depend on their order: a host composing its extensions wrongly, never an item.
 */
export class RendererClaimedTwice extends Data.TaggedError("RendererClaimedTwice")<{
  /**
   * The kind both name.
   */
  readonly kind: string;
}> {
  /**
   * Which kind is claimed twice, and what to compose instead.
   */
  override get message(): string {
    return `Two extensions each give a renderer for ${JSON.stringify(this.kind)}; a composition gives each kind one renderer, so name each kind in one extension only.`;
  }
}

/**
 * Compose renderers: the base's renderer for every kind no extension names, and for each kind an
 * extension names, that extension's renderer, whole.
 *
 * @param base The renderer of every kind, plate's standard renderers.
 * @param extensions The extensions, each naming kinds no other names.
 * @returns The renderer of every kind.
 * @throws {RendererClaimedTwice} When two extensions name one kind.
 */
export const renderersOf = (
  base: Renderers,
  ...extensions: readonly RendererExtension[]
): Renderers => {
  const claims = extensions.flatMap((extension) => Object.keys(extension));
  const twice = claims.find((kind, at) => claims.indexOf(kind) !== at);

  if (twice !== undefined) {
    throw new RendererClaimedTwice({ kind: twice });
  }

  const composed = { ...base };

  for (const extension of extensions) {
    Object.assign(composed, extension);
  }

  return composed;
};
