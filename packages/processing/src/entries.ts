/**
 * The package's entries, bound to its one complete operator table: the registry is the codebase,
 * so no caller passes a table. Each is pure: what it reads is its arguments.
 *
 * - {@link compileItem} and {@link compileTest} compile a stored document into its program, or the
 *   first refusal; the shell caches a program by its document's digest.
 * - {@link templateDefaults} and {@link takeItem} run an item session's take: the test's template
 *   defaults for the item, then the item's template processing.
 * - {@link gradeAnswer}, {@link gradeSitting} and {@link regrade} mint a `Graded` result, or a
 *   failure, which is never a grade.
 *
 * @module
 */
import { compileItemWith, compileTestWith } from "#processing/compile/document.ts";
import {
  gradeAnswerWith,
  gradeSittingWith,
  regradeWith,
  templateDefaultsWith,
} from "#processing/grade.ts";
import type {
  AnswerGrade,
  AnswerInput,
  Graded,
  SittingGrade,
  SittingInput,
} from "#processing/grade.ts";
import type { Digest } from "#processing/graded.ts";
import type { Checked } from "#processing/operators/operator.ts";
import { operatorTable } from "#processing/operators/table.ts";
import type { CompiledItem, CompiledTest } from "#processing/program.ts";
import { takeWith } from "#processing/session.ts";
import type { Failed, Take } from "#processing/session.ts";
import type { Seed } from "#processing/stream.ts";
import type { Value } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * Compile a stored item.
 *
 * @param root - The item's `qti-assessment-item`.
 * @param digest - The stored document's digest.
 * @returns The compiled item, or the first refusal.
 */
export const compileItem = (root: XmlElement, digest: Digest): Checked<CompiledItem> =>
  compileItemWith(root, digest, operatorTable);

/**
 * Compile a stored test, against its items' compiled programs.
 *
 * @param root - The test's `qti-assessment-test`.
 * @param digest - The stored document's digest.
 * @param items - Each item ref's compiled item, by the ref's identifier.
 * @returns The compiled test, or the first refusal.
 */
export const compileTest = (
  root: XmlElement,
  digest: Digest,
  items: ReadonlyMap<string, CompiledItem>,
): Checked<CompiledTest> => compileTestWith(root, digest, items, operatorTable);

/**
 * The template defaults a test's item ref gives its item's take (§5.152).
 *
 * @param test - The test.
 * @param identifier - The item ref's identifier.
 * @param context - The context values.
 * @param seed - The seed its expressions draw under.
 * @returns Each template variable's default, or the failure.
 */
export const templateDefaults = (
  test: CompiledTest,
  identifier: string,
  context: ReadonlyMap<string, Value>,
  seed: Seed,
): Failed | ReadonlyMap<string, Value> =>
  templateDefaultsWith(operatorTable, test, identifier, context, seed);

/**
 * Run an item session's take: its template processing (§5.156).
 *
 * @param item - The item.
 * @param seed - The item's processing seed.
 * @param defaults - The test's template defaults for it.
 * @param context - The context values.
 * @returns What template processing set, or the failure.
 */
export const takeItem = (
  item: CompiledItem,
  seed: Seed,
  defaults: ReadonlyMap<string, Value>,
  context: ReadonlyMap<string, Value>,
): Failed | Take => takeWith(operatorTable, item, seed, defaults, context);

/**
 * Grade one answer (D14), admitted first (D6).
 *
 * @param input - The answer.
 * @returns The grade, or the failure.
 */
export const gradeAnswer = (input: AnswerInput): Failed | Graded<AnswerGrade> =>
  gradeAnswerWith(operatorTable, input);

/**
 * Grade a sitting's submit (G5 §3).
 *
 * @param input - The sitting.
 * @returns The grade, or the failure.
 */
export const gradeSitting = (input: SittingInput): Failed | Graded<SittingGrade> =>
  gradeSittingWith(operatorTable, input);

/**
 * Regrade a sitting's attempts (G5 §5).
 *
 * @param input - The sitting, its closing members the attempts regraded.
 * @returns The grade, or the failure.
 */
export const regrade = (input: SittingInput): Failed | Graded<SittingGrade> =>
  regradeWith(operatorTable, input);
