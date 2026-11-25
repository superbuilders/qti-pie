/**
 * Alpha's renderers, `@qti-pie/plate/alpha`: the interaction kinds Alpha draws its own way, each a
 * whole renderer composed from core's parts, which a host composes over plate's standard renderers
 * once at its root (`renderersOf(standardRenderers, [alphaRenderers])`, `@qti-pie/plate/ui`). Core
 * never imports this folder.
 *
 * - `choice`: every Choice writes AlphaTest's player's line under its prompt
 *   (`#plate/alpha/choice/choice.tsx`);
 * - `text-entry`: a Text Entry its author marked `alpha-math-entry` is answered in a MathLive math
 *   field under AlphaTest's virtual keyboard, every other is plate's
 *   (`#plate/alpha/text-entry/text-entry.tsx`).
 *
 * A host composes one of the two extensions here, never both, since each names every kind Alpha
 * draws (two that name one kind are refused where they are composed, `RendererClaimedTwice`):
 * {@link alphaRenderers} where plate shows its own on-screen keypad as the host's `textEntryKeypad`
 * asks, {@link alphaHostKeypadRenderers} where the host shows a keypad of its own. It imports
 * Alpha's sheets after plate's (`@qti-pie/plate/alpha/styles/base.css`, and `theme.css` or its own
 * look in its place).
 *
 * @module
 */
import { choice } from "#plate/alpha/choice/choice.tsx";
import { hostKeypadTextEntry, textEntry } from "#plate/alpha/text-entry/text-entry.tsx";
import type { RendererExtension } from "#plate/ui/registry/contract.ts";

/**
 * The kinds Alpha renders its own way, each by its renderer, for a host that shows plate's keys.
 */
export const alphaRenderers: RendererExtension = { choice, "text-entry": textEntry };

/**
 * The kinds Alpha renders its own way, for a host that shows a keypad of its own: as
 * {@link alphaRenderers}, but a Text Entry that is no math entry asks the device for no keyboard
 * and plate writes no keys.
 */
export const alphaHostKeypadRenderers: RendererExtension = {
  choice,
  "text-entry": hostKeypadTextEntry,
};
