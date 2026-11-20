/**
 * The cases specimen's free suites draw: the first {@link floorSize} cases of `everyCase` on the
 * floor stream of the label `specimen/floor`, the same on every run seed. The database admits each
 * one once per landing (the admission run, `packages/qti-pie/packages/pantry/scripts/admit.ts`),
 * and a free suite opens only documents the database admitted, so its searches draw among these.
 * Every case's item, drawn afresh each run, is the specimen database suite's to admit.
 *
 * @module
 */
import { Array as Arr } from "effect";
import { element } from "@bjornpagen/testing/gen";
import type { CaseList } from "@bjornpagen/testing/gen";
import { caseSeed, floorSeed, wordsOf } from "@bjornpagen/testing/random";
import { generate, randomChooser, recorder } from "@bjornpagen/testing/source";
import { everyCase } from "#specimen/specimen.ts";
import type { Case } from "#specimen/specimen.ts";

/**
 * How many cases the floor holds: enough that its draws reach every interaction kind, every answer
 * and every stimulus content the suites require (100 already do), and as many as the suites' search
 * draws a run.
 */
const floorSize = 200;

/**
 * The floor stream the cases are drawn from.
 */
const stream = floorSeed("specimen/floor");

/**
 * The floor's cases, in the order the floor stream draws them.
 */
export const floorCases: Arr.NonEmptyReadonlyArray<Case> = Arr.makeBy(
  floorSize,
  (index) => generate(recorder(), everyCase, randomChooser(wordsOf(caseSeed(stream, index)))).value,
);

/**
 * A draw of one of {@link floorCases}: what the free suites search.
 */
export const floorCase: CaseList<Case> = element(floorCases);
