/**
 * The registry: every custom operator this package knows, one typed list keyed by `definition`.
 * The registry is the codebase: an operator's meaning is its module and its version is the commit,
 * so publication refuses any `qti-custom-operator` whose `definition` it does not list (D10), and
 * the evaluator looks each one up here and nowhere else. Alpha's operators are modules under
 * `#processing/alpha/`.
 *
 * @module
 */
import { markupTextOperator } from "#processing/alpha/operators/markup-text.ts";
import { mathCanonicalOperator } from "#processing/alpha/operators/math-canonical.ts";
import { normalizeSpaceOperator } from "#processing/alpha/operators/normalize-space.ts";
import { numeralNormalOperator } from "#processing/alpha/operators/numeral-normal.ts";
import { phraseDistanceOperator } from "#processing/alpha/operators/phrase-distance.ts";
import { quantityOperator } from "#processing/alpha/operators/quantity.ts";
import { readNumberOperator } from "#processing/alpha/operators/read-number.ts";
import { rubricScoreOperator } from "#processing/alpha/operators/rubric-score.ts";
import { texNormalOperator } from "#processing/alpha/operators/tex-normal.ts";
import { tokenizeOperator } from "#processing/alpha/operators/tokenize.ts";
import { translateOperator } from "#processing/alpha/operators/translate.ts";
import { unitNearOperator } from "#processing/alpha/operators/unit-near.ts";
import { whenPresentOperator } from "#processing/alpha/operators/when-present.ts";
import type { CustomOperator } from "#processing/operator.ts";

/**
 * Every custom operator, each `definition` once: Alpha's, in its roster's order.
 */
export const customOperators = [
  normalizeSpaceOperator,
  texNormalOperator,
  numeralNormalOperator,
  readNumberOperator,
  tokenizeOperator,
  translateOperator,
  mathCanonicalOperator,
  quantityOperator,
  unitNearOperator,
  phraseDistanceOperator,
  rubricScoreOperator,
  markupTextOperator,
  whenPresentOperator,
] as const satisfies readonly CustomOperator[];

/**
 * The `definition` URI of a registered operator.
 */
export type Definition = (typeof customOperators)[number]["definition"];

/**
 * Every custom operator, read as operators of any definition.
 */
export const registered: readonly CustomOperator[] = customOperators;

/**
 * The registered operators by `definition`.
 */
const byDefinition: ReadonlyMap<string, CustomOperator> = new Map(
  registered.map((operator): readonly [string, CustomOperator] => [operator.definition, operator]),
);

/**
 * The registered operator a `definition` URI names.
 *
 * @param definition - The URI, as the document writes it.
 * @returns The operator, or `undefined` when the registry lists none of that URI.
 */
export const customOperatorOf = (definition: string): CustomOperator | undefined =>
  byDefinition.get(definition);
