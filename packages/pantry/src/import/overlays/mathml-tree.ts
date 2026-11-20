/**
 * What the four MathML families' builders read of a document's tree alike (spec reading 2, §C's
 * `rowsOf`): where the document stands in its package, and the kinds that are no element. Each
 * node's nearest interaction (N8) and element counts they read from the host fold, and an element's
 * attributes from its view's index (`#pantry/import/fold.ts`).
 */
import { nonElementKinds } from "#pantry/grammar/install.ts";
import { keyTextOf as keyText } from "#pantry/import/key-text.ts";

/**
 * Where a document stands in its package, as the MathML builders read it: its package's manifest
 * identifier and its path there, which every row they write holds beside its node's `start`.
 */
export interface MathmlIds {
  readonly package: string;
  readonly path: string;
}

/**
 * The text of a row's key in its relation's keyed set (`#pantry/import/key-text.ts`): the
 * document's package and path, then the row's own key fields in key order, so the rows of two
 * documents never meet at one key.
 *
 * @param ids - The document's place.
 * @param values - The row's own key fields after its package and path.
 * @returns The key text.
 */
export const keyTextOf = (ids: MathmlIds, ...values: readonly (bigint | string)[]): string =>
  keyText(ids.package, ids.path, ...values);

/**
 * The kinds that are no element: the document node and character data.
 */
export const nonElements: ReadonlySet<string> = new Set(nonElementKinds);
