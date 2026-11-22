/**
 * Interactions as the redacted body holds them, for the suites of the slots a formula plans for the
 * interactions it draws (`src/content/math-slots.test.ts`) and of the read-aloud control that
 * stands before a body node (`src/read-aloud/placement.test.ts`).
 *
 * Test support: nothing outside `src/test/` and test files imports it.
 *
 * @module
 */
import { Option } from "effect";
import type { TextEntryInteraction } from "#plate/interactions/text-entry.ts";

/**
 * A Text Entry, as the redacted body holds it.
 *
 * @param response Its response.
 * @param id Its `id`, none where it has none.
 * @param catalog The catalog its root references, none where it references none.
 * @returns The interaction, its expected length drawn from its response's length.
 */
export const textEntry = (
  response: string,
  id: Option.Option<string>,
  catalog: Option.Option<string> = Option.none(),
): TextEntryInteraction => ({
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  base: 10,
  baseType: "string",
  cardinality: "single",
  catalog,
  class: Option.none(),
  data: [],
  expectedLength: Option.some(BigInt(response.length % 7)),
  id,
  kind: "text-entry",
  path: `p/${response}`,
  patternMask: Option.none(),
  patternMaskMessage: Option.none(),
  placeholder: Option.none(),
  promptCatalog: Option.none(),
  response,
});
