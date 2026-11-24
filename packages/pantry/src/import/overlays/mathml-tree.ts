/**
 * What the four MathML families' builders read of a document's tree alike (spec reading 2, §C's
 * `rowsOf`): the kinds that are no element. Each node's nearest interaction (N8) and element
 * counts they read from the host fold, and an element's attributes from its view's index
 * (`#pantry/import/fold.ts`).
 */
import { nonElementKinds } from "#pantry/grammar/install.ts";

/**
 * The kinds that are no element: the document node and character data.
 */
export const nonElements: ReadonlySet<string> = new Set(nonElementKinds);
