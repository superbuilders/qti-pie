/**
 * The host's evaluation of a schema's rows, grizzle's own (`rowEvaluator`): what PostgreSQL
 * computes of a row of a relation, each check's verdict among it, by the one evaluator grizzle
 * judges a refused write's rows by. A test compiles a schema's evaluator once, where its module
 * loads, and holds a row it builds to a check of it.
 */
import { rowEvaluator } from "@bjornpagen/grizzle/compile";
import type { AnySchema } from "@bjornpagen/grizzle";
import type {
  CheckVerdict,
  DomainRefused,
  RowEvaluator,
  Unevaluated,
  ValueRefused,
} from "@bjornpagen/grizzle/compile";
import { assert } from "@effect/vitest";
import { Option, Result } from "effect";

/**
 * Compile a schema's row evaluator.
 *
 * @param schema - The schema.
 * @returns Its evaluator.
 * @throws {CompileError} When the schema does not compile, which fails the module that builds it.
 */
export const evaluatorOf = <S extends AnySchema>(schema: S): RowEvaluator<S> => {
  const made = rowEvaluator(schema);
  if (Result.isFailure(made)) {
    throw made.failure;
  }

  return made.success;
};

/**
 * Read a row's evaluation, which PostgreSQL's domains admit.
 *
 * @param evaluation - The host's evaluation of the row.
 * @param what - The row, for a failure's words.
 * @returns What the host computes of it; the case fails where a domain refuses the row, which a test
 *   builds inside its domains.
 */
export const insideDomains = <A, R>(
  evaluation: Result.Result<A, ValueRefused<R> | DomainRefused<R>>,
  what: string,
): A =>
  Result.isSuccess(evaluation)
    ? evaluation.success
    : assert.fail(`${what} is inside its domains, not refused at ${evaluation.failure.field}`);

/**
 * Whether a row breaks a check, as the database judges it.
 *
 * @param verdict - The check's verdict over the row, as the host evaluates it.
 * @param what - The check and the row, for a failure's words.
 * @returns Whether the row breaks the check; the case fails where the host does not evaluate it.
 */
const isBroken = (verdict: Result.Result<CheckVerdict, Unevaluated>, what: string): boolean =>
  Result.isSuccess(verdict)
    ? verdict.success === "breaks"
    : assert.fail(`the host evaluates ${what}: ${verdict.failure.why}`);

/**
 * Whether a row breaks a check of its evaluation, as the database judges it.
 *
 * @param evaluation - The host's evaluation of the row.
 * @param verdict - The check's verdict, read off the evaluation.
 * @param what - The check and the row, for a failure's words.
 * @returns Whether the row breaks the check, none where the row is refused, which no check then
 *   reads; the case fails where the host does not evaluate the check.
 */
export const brokenIn = <A, R>(
  evaluation: Result.Result<A, ValueRefused<R> | DomainRefused<R>>,
  verdict: (evaluated: A) => Result.Result<CheckVerdict, Unevaluated>,
  what: string,
): Option.Option<boolean> =>
  Result.isSuccess(evaluation)
    ? Option.some(isBroken(verdict(evaluation.success), what))
    : Option.none();
