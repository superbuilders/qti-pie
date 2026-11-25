/**
 * Alpha's renderers, `@qti-pie/plate/alpha`: the interaction kinds Alpha draws its own way, each a
 * whole renderer composed from core's parts, which a host composes over plate's standard renderers
 * once at its root (`renderersOf(standardRenderers, alphaRenderers)`, `@qti-pie/plate/ui`). Core
 * never imports this folder.
 *
 * - `choice`: every Choice writes AlphaTest's player's line under its prompt
 *   (`#plate/alpha/choice/choice.tsx`).
 *
 * @module
 */
import { choice } from "#plate/alpha/choice/choice.tsx";
import type { RendererExtension } from "#plate/ui/registry/contract.ts";

/**
 * The kinds Alpha renders its own way, each by its renderer.
 */
export const alphaRenderers: RendererExtension = { choice };
