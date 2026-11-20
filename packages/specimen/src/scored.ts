/**
 * What a case's response scores in plate, as a host scores a post: the entries the case posts,
 * decoded into the item's responses, then one attempt from `begin`'s record. Specimen's suite and
 * qti-pie's specimen database suite hold a case's stated score to it.
 *
 * @module
 */
import { begin, decode, postings, scoreRecord } from "@qti-pie/plate";
import type { Accepted, Entry, Responses } from "@qti-pie/plate";
import { Result } from "effect";
import { entriesOf } from "#specimen/specimen.ts";
import type { Case } from "#specimen/specimen.ts";

/**
 * The instance every case's entries are named for.
 */
const instance = "specimen";

/**
 * Decode the entries a form posts into the item's responses, as a host reads a post.
 *
 * @param accepted The item.
 * @param entries The posted entries.
 * @returns The responses, or the first entry that does not decode.
 */
const responsesOf = (accepted: Accepted, entries: readonly Entry[]) =>
  Result.all(
    Object.fromEntries(
      postings(accepted, instance).map((posting) => {
        const own = entries.filter(([name]) => name === posting.binding.name);

        return [posting.identifier, decode(own, posting.binding, posting.options)];
      }),
    ),
  );

/**
 * The `SCORE` an attempt with these responses ends with.
 *
 * @param accepted The item.
 * @param responses The responses.
 * @returns The score.
 */
const scoreOf = (accepted: Accepted, responses: Responses): number => {
  const begun = Result.getOrThrow(begin(accepted, { instance: "scored", seed: "1" }));
  const outcome = Result.getOrThrow(scoreRecord(accepted, responses, begun)).outcomes["SCORE"];

  return Number(outcome?.values[0]?.value);
};

/**
 * The `SCORE` a case's own response ends with, in its opened item.
 *
 * @param accepted The case's item, as plate accepted it.
 * @param held The case.
 * @returns The score; a response that does not decode is a defect thrown.
 */
export const scoredAs = (accepted: Accepted, held: Case): number =>
  scoreOf(accepted, Result.getOrThrow(responsesOf(accepted, entriesOf(held, instance))));
