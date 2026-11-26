/**
 * The closed vocabulary the mark-objects suite (`mark-objects.test.ts`) starts its PCI under, the
 * domain itself, never cases a person chose: the statuses a delivery engine passes a PCI.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";

/**
 * The values of `status` a delivery engine may pass a PCI in its configuration, QTI 3.0.1's
 * implementation guide's (§3.7.12.7.1, after Section 4.1 of the information model): interacting,
 * the one in which the candidate answers, and the four in which the candidate does not.
 */
export const statuses = dictionary(["interacting", "suspended", "closed", "solution", "review"]);
