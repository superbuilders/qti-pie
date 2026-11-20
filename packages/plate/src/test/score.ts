/**
 * Score an attempt as a host scores one, for the tests: from the record given, or, with none, from
 * the record `begin` starts under a fixed instance and seed, which an item scored alone starts
 * from (`scoreRecord` in `#plate/score.ts`, `begin` in `#plate/begin.ts`).
 *
 * Test support, outside the core: nothing under `src/index.ts`'s closure imports it.
 *
 * @module
 */
import { Result } from "effect";
import { begin } from "#plate/begin.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Responses } from "#plate/model/values.ts";
import { scoreRecord } from "#plate/score.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The instance an item scored with no record begins under: the empty instance, as a record of no
 * use of the item.
 */
const unrecordedInstance = "";

/**
 * The seed an item scored with no record begins under.
 */
const unrecordedSeed = "test";

/**
 * Score one attempt of an item from a record, or from the record `begin` starts for it.
 *
 * @param document The item.
 * @param responses The responses, as `scoreRecord` takes them.
 * @param record The record the attempt starts from; `begin`'s under the empty instance and a fixed
 *   seed when absent.
 * @returns What `scoreRecord` gives, or `begin`'s failure.
 */
export const score = (document: Accepted, responses: Responses, record?: ItemRecord) =>
  (record === undefined
    ? begin(document, { instance: unrecordedInstance, seed: unrecordedSeed })
    : Result.succeed(record)
  ).pipe(Result.flatMap((before) => scoreRecord(document, responses, before)));
