/**
 * Interactions as the redacted body holds them, for the suite of the interactions a formula draws
 * in its slots (`src/ui/item/slots.test.ts`): written here, outside plate's UI, whose lint refuses
 * an object's `class` key, which a model node's field carries.
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
 * @returns The interaction, its expected length drawn from its response's length.
 */
export const textEntry = (response: string, id: Option.Option<string>): TextEntryInteraction => ({
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  base: 10,
  baseType: "string",
  cardinality: "single",
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
