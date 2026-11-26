/**
 * The registry: every custom operator this package knows, one typed list keyed by `definition`.
 * The registry is the codebase: an operator's meaning is its module and its version is the commit,
 * so publication refuses any `qti-custom-operator` whose `definition` it does not list (D10), and
 * the evaluator looks each one up here and nowhere else. Alpha's operators are modules under
 * `#processing/alpha/`.
 *
 * @module
 */
import type { CustomOperator } from "#processing/operator.ts";

/**
 * Every custom operator, each `definition` once.
 */
export const customOperators = [] as const satisfies readonly CustomOperator[];

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
