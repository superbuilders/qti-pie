/**
 * The seeds plate's recorder graded under, derived exactly as plate derived them (`#plate/seed.ts`
 * and `#plate/engine/random.ts`, qti-pie e06e6ff), so a template value the recording holds is
 * reproduced by the same draws rather than injected.
 *
 * A decision's seed keys every item's processing seed by HMAC-SHA-256 over
 * `processing␟<package>␟<identifier>` (U+001F joins the fields); template processing draws under
 * the label `served␟template␟<identifier>` and an attempt's response processing under
 * `served␟response␟<numAttempts>`, `served` being the instance the app serves every session under.
 * The draw stream itself (HMAC-SHA-256 in counter mode keyed by the processing seed) is the
 * package's: this module derives only the arguments the package is handed.
 *
 * @module
 */
import { createHmac } from "node:crypto";

/**
 * The separator plate's derivations join their fields with: U+001F, the unit separator, which no
 * field after the first holds.
 */
const separator = "\u001F";

/**
 * The instance token every recorded session ran under.
 */
export const servedInstance = "served";

/**
 * The processing seed an item's template and response processing draw under, from the decision's
 * seed: the hex HMAC-SHA-256, keyed by the decision seed, of `processing`, the item's package (the
 * recorder's package name) and the item's identifier.
 *
 * @param decisionSeed The decision's seed.
 * @param item The item's package and identifier.
 * @param item.package The item's package, as the recorder named it.
 * @param item.identifier The item's identifier.
 * @returns The processing seed.
 */
export const processingSeed = (
  decisionSeed: string,
  item: { readonly identifier: string; readonly package: string },
): string =>
  createHmac("sha256", new TextEncoder().encode(decisionSeed))
    .update(new TextEncoder().encode(["processing", item.package, item.identifier].join(separator)))
    .digest("hex");

/**
 * The label an item's template processing draws under.
 *
 * @param identifier The item's identifier.
 * @returns The label.
 */
export const templateLabel = (identifier: string): string =>
  [servedInstance, "template", identifier].join(separator);

/**
 * The label an attempt's response processing draws under.
 *
 * @param numAttempts The attempt's `numAttempts`.
 * @returns The label.
 */
export const responseLabel = (numAttempts: number): string =>
  [servedInstance, "response", String(numAttempts)].join(separator);
