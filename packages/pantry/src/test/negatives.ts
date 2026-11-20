/**
 * What the law oracle predicts for each of the negatives of {@link negativeNames}, pinned in one
 * table, which the free oracle test (`negatives.oracle.test.ts`) holds the oracle to.
 *
 * The negatives over the stimulus and include positives are phase 5's; the bank negatives and
 * `test-document` state spec reading 228: pantry stores content and banks, a bank is a standalone
 * section document of item refs and nothing else, and a test is refused.
 */
import type { negativeNames } from "#pantry/test/fixtures.ts";

/**
 * The oracle's prediction for each of {@link negativeNames}, keyed by name: the set of rules its
 * breaches name, sorted. Every negative breaks a law: one the oracle accepts is a finding.
 */
export const expectations: Readonly<Record<(typeof negativeNames)[number], readonly string[]>> = {
  "bank-duplicate-identifier": ["structure-identifier"],
  "bank-selection": ["bank-shape"],
  "include-text": ["attribute-lexical"],
  "include-xpointer": ["attribute-admission"],
  "item-in-section": ["unmodeled-vocabulary"],
  "item-ref-missing": ["file-exists", "item-ref-target"],
  "item-ref-to-stimulus": ["item-ref-target"],
  "rubric-in-rubric": ["unmodeled-vocabulary"],
  "stimulus-body-empty": ["child-set"],
  "stimulus-missing-image": ["file-exists"],
  "stimulus-ref-duplicate": ["stimulus-ref-key"],
  "stimulus-ref-to-item": ["stimulus-ref-target"],
  "stimulus-typed-test": ["root-type-reverse"],
  "test-document": ["test-structure"],
};
