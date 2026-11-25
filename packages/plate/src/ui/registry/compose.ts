/**
 * The renderers' composition: a base, plate's standard renderers, with extensions over it, each
 * replacing whole the renderers of the kinds it names. A host composes once, at its root, where the
 * module loads, and hands the result to every `<Item>`, so a composition that names a kind twice
 * stops the host as it starts, never mid-render.
 *
 * @module
 */
import { Data } from "effect";
import type { ModuleKind } from "#plate/interactions/contract.ts";
import type { Renderer, RendererExtension, Renderers } from "#plate/ui/registry/contract.ts";

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
 * An extension names a key that is no interaction kind, a misspelt kind handed through a variable,
 * which would compose to no renderer at all: a host composing wrongly, never an item.
 */
export class RendererKindUnknown extends Data.TaggedError("RendererKindUnknown")<{
  /**
   * The key the extension names.
   */
  readonly kind: string;
}> {
  /**
   * Which key names no kind.
   */
  override get message(): string {
    return `An extension gives a renderer for ${JSON.stringify(this.kind)}, which is no interaction kind plate renders.`;
  }
}

/**
 * Compose renderers: the base's renderer for every kind no extension names, and for each kind an
 * extension names, that extension's renderer, whole. Each kind is read from each extension through
 * the closed record of kinds below, so whatever an extension gives a kind by (its own key, a
 * getter, its prototype) is what composes, and a kind it gives `undefined` keeps the base's.
 *
 * @param base The renderer of every kind, plate's standard renderers.
 * @param extensions The extensions, each naming kinds no other names.
 * @returns The renderer of every kind.
 * @throws {RendererClaimedTwice} When two extensions name one kind.
 * @throws {RendererKindUnknown} When an extension names a key that is no kind.
 */
export const renderersOf = (
  base: Renderers,
  extensions: readonly RendererExtension[],
): Renderers => {
  const rendererOf = <K extends ModuleKind>(kind: K): Renderer<K> => {
    const named = extensions.flatMap((extension) => {
      const renderer = extension[kind];

      return renderer === undefined ? [] : [renderer];
    });

    if (named.length > 1) {
      throw new RendererClaimedTwice({ kind });
    }

    return named[0] ?? base[kind];
  };
  const composed: Renderers = {
    associate: rendererOf("associate"),
    choice: rendererOf("choice"),
    "end-attempt": rendererOf("end-attempt"),
    "extended-text": rendererOf("extended-text"),
    "gap-match": rendererOf("gap-match"),
    "graphic-associate": rendererOf("graphic-associate"),
    "graphic-gap-match": rendererOf("graphic-gap-match"),
    "graphic-order": rendererOf("graphic-order"),
    hotspot: rendererOf("hotspot"),
    hottext: rendererOf("hottext"),
    "inline-choice": rendererOf("inline-choice"),
    match: rendererOf("match"),
    media: rendererOf("media"),
    order: rendererOf("order"),
    "portable-custom": rendererOf("portable-custom"),
    "position-object": rendererOf("position-object"),
    "select-point": rendererOf("select-point"),
    slider: rendererOf("slider"),
    "text-entry": rendererOf("text-entry"),
  };
  const unknown = extensions
    .flatMap((extension) => Object.keys(extension))
    .find((kind) => !Object.hasOwn(composed, kind));

  if (unknown !== undefined) {
    throw new RendererKindUnknown({ kind: unknown });
  }

  return composed;
};
