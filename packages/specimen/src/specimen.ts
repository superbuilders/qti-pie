/**
 * The specimen generator's public face, `@qti-pie/specimen/specimen`: the dimensions as data, a
 * query of them read from an address, and cases drawn under a query at random, in enumeration
 * order, or from a token, each a description, its item, and the child's response. It loads no
 * test runner and no Node built-in, so a page's server function draws cases with it.
 *
 * A case's token is its tape's, as `@bjornpagen/testing` writes one: under the query that fixes
 * nothing, the last field of a failing suite's `TEST_REPLAY` token, when its property draws
 * {@link everyCase} first. A fixed dimension draws nothing, so a token is relative to its query.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Result } from "effect";
import { firstBranch, enumerated } from "@bjornpagen/testing/enumerate";
import type { Branch } from "@bjornpagen/testing/enumerate";
import { element, map } from "@bjornpagen/testing/gen";
import type { Gen, Space } from "@bjornpagen/testing/gen";
import { caseSeed, floorSeed, wordsOf } from "@bjornpagen/testing/random";
import { forcedChooser, generate, randomChooser, recorder } from "@bjornpagen/testing/source";
import type { Chooser } from "@bjornpagen/testing/source";
import { tokenOf, valuesFromToken } from "@bjornpagen/testing/tape";
import type { Tape } from "@bjornpagen/testing/tape";
import type { Posted } from "#specimen/answer.ts";
import { anyQuery, listed, queryIn, reached } from "#specimen/dimension.ts";
import type { Listed, Query, Unreadable } from "#specimen/dimension.ts";
import { described, itemDimensions, unanswered } from "#specimen/description.ts";
import type { Described, Description } from "#specimen/description.ts";
import { kindDimension, roster } from "#specimen/kinds/index.ts";
import { itemOf } from "#specimen/write.ts";
import type { Item } from "#specimen/write.ts";

/**
 * Every dimension, as the lab lists them: the item's first, then each kind's, in the order of the
 * `kind` dimension.
 */
export const dimensions: readonly Listed[] = [
  ...listed({ kind: "item" }, itemDimensions),
  ...kindDimension.values.flatMap(({ value }) =>
    listed({ kind: "interaction", name: value }, roster[value].dimensions),
  ),
];

/**
 * The `kind` dimension's address key: a query that fixes it names the kind whose own dimensions
 * the case reaches.
 */
export const kindKey: keyof typeof itemDimensions = "kind";

/**
 * Read a query from an address's pairs, each fixing the dimension its key names at the value its
 * text names.
 *
 * @param pairs The address's `[key, text]` pairs of {@link dimensions}' keys.
 * @returns The query, or the first pair whose key names no dimension or whose text names no value
 *   of its dimension, with what it admits.
 */
export const queryOf = (
  pairs: Iterable<readonly [key: string, text: string]>,
): Result.Result<Query, Unreadable> => queryIn(dimensions, pairs);

/**
 * The child's response a case draws: what the child gave, typed, each response the child left
 * untouched absent ({@link Posted}), and the `SCORE` the item's response processing gives it.
 */
export interface Response {
  readonly posted: Posted;
  readonly score: number;
}

/**
 * One case: its description, its item, and the child's response.
 */
export interface Case {
  readonly description: Description;
  readonly item: Item;
  readonly response: Response;
}

/**
 * Write a drawn description's case.
 *
 * @param drawn The description and its response.
 * @returns The case.
 */
const caseOf = (drawn: Described): Case => ({
  description: drawn.description,
  item: itemOf(drawn.description),
  response: { posted: drawn.answered.posted, score: drawn.answered.score },
});

/**
 * The cases under a query: none for a draw whose response the query fixes at one its interaction
 * does not admit.
 *
 * @param held The query.
 * @returns The generator.
 */
const casesUnder = (held: Query): Gen<Option.Option<Case>> =>
  map(described(held), Option.map(caseOf));

/**
 * Every case, no dimension fixed: the space a suite over the specimen searches. Its tapes are the
 * tapes {@link replay} reads under {@link anyQuery}.
 */
export const everyCase: Space<Case> = (source) => {
  const drawn = source.draw(unanswered(anyQuery));
  const answered = source.draw(element(drawn.answers));

  return caseOf({ answered, description: { ...drawn.rest, answer: answered.answer } });
};

/**
 * A case as the lab holds it: its token under its query, and what it drew, every dimension it
 * reached fixed at the value it took, so `pairsOf(drawn)` is the address of exactly this case.
 */
export interface Specimen extends Case {
  readonly drawn: Query;
  readonly token: string;
}

/**
 * Make a specimen of a case drawn on a tape.
 *
 * @param held The query it was drawn under.
 * @param drawn The case, none when the query ruled it out.
 * @param tape Its tape.
 * @returns The specimen, none when there is no case.
 */
const specimenOf = (held: Query, drawn: Option.Option<Case>, tape: Tape): Option.Option<Specimen> =>
  drawn.pipe(
    Option.map((found) => ({
      ...found,
      drawn: reached(dimensions, held, tape, [["answer", found.description.answer]]),
      token: tokenOf(tape.values, tape.length),
    })),
  );

/**
 * Draw one case under a query against a chooser.
 *
 * @param held The query.
 * @param chooser Where its decisions come from.
 * @returns The specimen, none when the query rules the draw out or the chooser ran out.
 */
const drawnWith = (held: Query, chooser: Chooser): Option.Option<Specimen> => {
  const generated = generate(recorder(), casesUnder(held), chooser);

  return generated.tape.status === "overrun"
    ? Option.none()
    : specimenOf(held, generated.value, generated.tape);
};

/**
 * The case a token names under a query.
 *
 * @param held The query it was drawn under.
 * @param token Its token.
 * @returns The specimen, none when the token runs out before the case does, or the query rules
 *   out the case it names.
 */
export const replay = (held: Query, token: string): Option.Option<Specimen> => {
  const values = valuesFromToken(token);

  return drawnWith(held, forcedChooser(values, values.length));
};

/**
 * Cases drawn at random under a query: the same `count` draws for the same seed, each a fresh
 * random case, those the query rules out left out.
 *
 * @param held The query.
 * @param seed The sheet's seed.
 * @param count How many draws.
 * @returns The specimens.
 */
export const sample = (held: Query, seed: number, count: number): readonly Specimen[] => {
  const stream = floorSeed(`qti-pie/specimen/${String(seed)}`);

  return Arr.makeBy(count, (at) => at).flatMap((at) =>
    Option.toArray(drawnWith(held, randomChooser(wordsOf(caseSeed(stream, at))))),
  );
};

/**
 * A page of an enumeration: the cases it walked, those the query rules out left out, and the
 * token of the branch after its last, none when it walked the last case.
 */
export interface Page {
  readonly next: Option.Option<string>;
  readonly specimens: readonly Specimen[];
}

/**
 * Walk `count` cases of a query's enumeration, smallest first, from a branch: every combination of
 * the dimensions it leaves at any, each once.
 *
 * @param held The query.
 * @param from The token of the branch to start at, as a page's `next` gives it; none for the
 *   first.
 * @param count How many cases to walk.
 * @returns The page.
 */
export const page = (held: Query, from: Option.Option<string>, count: number): Page => {
  const recorded = recorder();
  const generator = casesUnder(held);
  const specimens: Specimen[] = [];
  let branch: Option.Option<Branch> = Option.some(
    Option.match(from, {
      onNone: () => firstBranch,
      onSome: (token) => {
        const values = valuesFromToken(token);

        return { length: values.length, values };
      },
    }),
  );

  for (let walked = 0; walked < count && Option.isSome(branch); walked += 1) {
    const step = enumerated(recorded, generator, branch.value);

    specimens.push(...Option.toArray(specimenOf(held, step.generated.value, step.generated.tape)));
    branch = step.next;
  }

  return {
    next: branch.pipe(Option.map((after) => tokenOf(after.values, after.length))),
    specimens,
  };
};

export type { Description } from "#specimen/description.ts";

export type { Listed, Owner, Query, Unreadable } from "#specimen/dimension.ts";

export { anyQuery, pairsOf } from "#specimen/dimension.ts";

export type { Interaction, KindName } from "#specimen/kinds/index.ts";

export type { ConfigurationInput, Item } from "#specimen/write.ts";
