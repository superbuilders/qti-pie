/**
 * One item's golden data: what today's grader, plate as the QTI app runs it, gives every case
 * {@link casesOf} generates, under each decision seed.
 *
 * Each case is played as the app plays an item session (`server/served.ts` of the QTI app): the
 * record `begin` starts under the processing seed `itemSeeds` derives, then for each attempt
 * `checkResponses` (what `validate-responses` would refuse), `scoreRecord` from the record the
 * attempt starts from, `attemptOf`, `itemSessionOpen` over the attempts so far at each stage limit
 * the golden holds, `credit`, and `recordAfter` for the next attempt. A case whose attempt
 * `scoreRecord` refuses stops there, as the app then writes nothing. Each scored attempt also holds
 * the marks its review draws (`golden/review.ts`), played in step in the review's own plate, and
 * the marks the owner's area rule gives its points (`golden/area-marks.ts`).
 *
 * @module
 */
import { createHash } from "node:crypto";
import { Effect, Option, Result } from "effect";
import { attemptOf, itemSessionOpen, recordAfter } from "#plate/attempts.ts";
import type { ClockedAttempt } from "#plate/attempts.ts";
import { begin } from "#plate/begin.ts";
import { configure } from "#plate/configuration.ts";
import { credit } from "#plate/credit.ts";
import { readSource } from "#plate/document/read.ts";
import { decode } from "#plate/form/encoding.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { postings } from "#plate/postings.ts";
import { checkResponses } from "#plate/responses.ts";
import { scoreRecord } from "#plate/score.ts";
import { itemSeeds } from "#plate/seed.ts";
import { solution } from "#plate/solution.ts";
import { redactStructure } from "#plate/redact/walk.ts";
import { openAdmitted } from "#plate/validate/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";
import { areaMarks } from "#scripts/golden/area-marks.ts";
import type { GoldenAreaMarks } from "#scripts/golden/area-marks.ts";
import { casesOf } from "#scripts/golden/cases.ts";
import { ownerCredit } from "#scripts/golden/owner-credit.ts";
import type { Posted } from "#scripts/golden/cases.ts";
import { reviewSession } from "#scripts/golden/review.ts";
import type { GoldenMarks, ReviewApi, ReviewSession } from "#scripts/golden/review.ts";
import { goldenMap } from "#scripts/golden/values.ts";
import type { GoldenValue } from "#scripts/golden/values.ts";

/**
 * The instance token the QTI app serves every item session under (`SERVED_INSTANCE` in its
 * `server/item.ts`), which keys processing's draws with the seed.
 */
const servedInstance = "served";

/**
 * The decision seeds every item is recorded under. An item whose template processing runs is
 * recorded under each, so its draws are pinned twice; any other item under the first, since no
 * seed reaches its grading.
 */
export const decisionSeeds = [
  "01a1f000-0000-4000-8000-000000000001",
  "01a1f000-0000-4000-8000-000000000002",
] as const;

/**
 * The stage limits (`maxAttempts`) whose openness each attempt records.
 */
const stageLimits = [1, 2, 3] as const;

/**
 * An item, as a golden source names it: its set, its package and its path in the package.
 */
export interface ItemPlace {
  readonly package: string;
  readonly path: string;
  readonly set: string;
}

/**
 * What one attempt of a case gave: a refusal by `scoreRecord`, or the attempt plate records with
 * the session's openness after it, its credit, and how many attempts count.
 */
export type GoldenAttempt =
  | {
      readonly checked: readonly GoldenMessage[];
      readonly hidden: readonly string[];
      readonly kind: "failed";
      readonly limits: number;
      readonly posted: Readonly<Record<string, GoldenValue>>;
      readonly refused: readonly GoldenMessage[];
      readonly tag: string;
    }
  | {
      readonly areaMarks: Readonly<Record<string, GoldenAreaMarks>>;
      readonly completionStatus: string;
      readonly credit: string | null;
      readonly kind: "scored";
      readonly limits: number;
      readonly marks: Readonly<Record<"own" | "solution", GoldenMarks>>;
      readonly numAttempts: number;
      readonly open: Readonly<Record<string, boolean>>;
      readonly outcomes: Readonly<Record<string, GoldenValue>>;
      readonly posted: Readonly<Record<string, GoldenValue>>;
      readonly responses: Readonly<Record<string, GoldenValue>>;
      readonly checked: readonly GoldenMessage[];
      readonly hidden: readonly string[];
      readonly ownerCredit: string | null;
    };

/**
 * A message plate gives a response it refuses, as its English text says it: the response and the
 * words.
 */
export type GoldenMessage = readonly [response: string, text: string];

/**
 * One case's golden data.
 */
export interface GoldenCase {
  readonly attempts: readonly GoldenAttempt[];
  readonly name: string;
}

/**
 * An item's golden data under one decision seed: the record `begin` starts the session from (its
 * template values, correct responses and defaults, which template processing sets), the correct
 * responses a solution shows, and its cases.
 */
export interface GoldenSeed {
  readonly begun: {
    readonly correct: Readonly<Record<string, GoldenValue>>;
    readonly defaults: Readonly<Record<string, GoldenValue>>;
    readonly outcomes: Readonly<Record<string, GoldenValue>>;
    readonly responses: Readonly<Record<string, GoldenValue>>;
    readonly templates: Readonly<Record<string, GoldenValue>>;
  };
  readonly cases: readonly GoldenCase[];
  readonly decisionSeed: string;
  readonly solution: Readonly<Record<string, GoldenValue>>;
}

/**
 * One golden line: an item document, the SHA-256 of its bytes, plate's verdict on it, and, when
 * plate accepts it, its identifier, whether it is adaptive and its data under each seed.
 */
export type GoldenItem = ItemPlace & {
  readonly digest: string;
} & (
    | { readonly verdict: string }
    | {
        readonly adaptive: boolean;
        readonly identifier: string;
        readonly seeds: readonly GoldenSeed[];
        readonly verdict: "accepted";
      }
  );

/**
 * What an item's reviews are rendered with: the review's plate, and the assets of each package of
 * the item's source, every file of it by its path from the source's root.
 */
export interface Review {
  readonly api: ReviewApi;
  readonly assets: readonly string[];
}

/**
 * Play one case from the record `begin` gave, as the app plays its attempts.
 *
 * @param accepted The item.
 * @param configuration The configuration the app serves it under, validating responses.
 * @param begun The record `begin` gave.
 * @param attempts Each attempt's responses, in order.
 * @param session The case's reviews, played in step.
 * @returns Each attempt's golden data, up to and including the first `scoreRecord` refuses.
 */
const played = (
  accepted: Accepted,
  configuration: Effect.Success<ReturnType<typeof configure>>,
  begun: ItemRecord,
  attempts: readonly Posted[],
  session: ReviewSession,
): readonly GoldenAttempt[] => {
  const made: ClockedAttempt[] = [];
  const out: GoldenAttempt[] = [];

  for (const posted of attempts) {
    const before = recordAfter(accepted, begun, made);
    const checked = checkResponses(accepted, posted, configuration).map((entry): GoldenMessage => [
      entry.response,
      entry.text,
    ]);
    const limits = checked.length;
    const hidden = [...redactStructure(accepted.item, before).hiddenOnly].toSorted();
    const scored = scoreRecord(accepted, posted, before);

    if (Result.isFailure(scored)) {
      out.push({
        checked,
        hidden,
        kind: "failed",
        limits,
        posted: goldenMap(posted),
        refused:
          scored.failure._tag === "ResponsesRefused"
            ? scored.failure.messages.map((entry): GoldenMessage => [entry.response, entry.text])
            : [],
        tag: scored.failure._tag,
      });

      return out;
    }

    const after = scored.success;

    made.push({ ...attemptOf(after), at: BigInt(made.length) });
    out.push({
      areaMarks: areaMarks(accepted, after),
      checked,
      completionStatus: attemptOf(after).completionStatus,
      credit: Option.getOrNull(credit(accepted, after)),
      hidden,
      kind: "scored",
      limits,
      marks: session.attempt(posted),
      numAttempts: after.numAttempts,
      open: Object.fromEntries(
        stageLimits.map((limit) => [String(limit), itemSessionOpen(accepted, made, limit)]),
      ),
      outcomes: goldenMap(after.outcomes),
      ownerCredit: Option.getOrNull(ownerCredit(accepted, after)),
      posted: goldenMap(posted),
      responses: goldenMap({ ...after.responses, ...after.records }),
    });
  }

  return out;
};

/**
 * Record one item document's golden data.
 *
 * @param place Where the document sits.
 * @param bytes Its bytes.
 * @param review What its reviews are rendered with.
 * @returns Its golden line; a document plate does not accept holds its verdict alone.
 */
export const recordItem = Effect.fnUntraced(function* recordItem(
  place: ItemPlace,
  bytes: Uint8Array,
  review: Review,
) {
  const digest = createHash("sha256").update(bytes).digest("hex");
  const location = `${place.package}/${place.path}`;
  const verdict = yield* openAdmitted(location, bytes);
  const accepted = acceptedItem(verdict);

  if (Option.isNone(accepted)) {
    return { ...place, digest, verdict: verdict.verdict } satisfies GoldenItem;
  }

  const item = accepted.value;
  const reviewed = yield* Effect.flatMap(review.api.openAdmitted(location, bytes), (opened) =>
    Effect.fromOption(review.api.acceptedItem(opened)),
  ).pipe(Effect.orDie);
  const source = yield* Effect.orDie(readSource(location, bytes));
  const runs = item.item.templateProcessing.kind === "runs";
  const seedOf = Effect.fnUntraced(function* seedOf(decisionSeed: string) {
    const derived = itemSeeds(decisionSeed, {
      identifier: item.item.identifier,
      package: place.package,
    });
    const configuration = yield* Effect.orDie(
      configure({ seed: derived.shuffle, validateResponses: true }),
    );
    const begun = yield* Effect.orDie(
      Effect.fromResult(begin(item, { instance: servedInstance, seed: derived.processing })),
    );
    const reviewItem = {
      accepted: reviewed,
      begun: yield* Effect.orDie(
        Effect.fromResult(
          review.api.begin(reviewed, { instance: servedInstance, seed: derived.processing }),
        ),
      ),
      configuration: yield* Effect.orDie(
        review.api.configure({
          assets: review.assets.map((file) => [
            file,
            `/assets/${file.split("/").map(encodeURIComponent).join("/")}`,
          ]),
          seed: derived.shuffle,
          validateResponses: true,
        }),
      ),
    };
    const posts = postings(item, servedInstance);
    const untouched: Posted = Object.fromEntries(
      posts.flatMap((posting) => {
        const read = decode(posting.start, posting.binding, posting.options);

        return Result.isSuccess(read) ? [[posting.identifier, read.success] as const] : [];
      }),
    );

    return {
      begun: {
        correct: goldenMap(begun.correct),
        defaults: goldenMap(begun.defaults),
        outcomes: goldenMap(begun.outcomes),
        responses: goldenMap({ ...begun.responses, ...begun.records }),
        templates: goldenMap(begun.templates),
      },
      cases: casesOf(item, source, posts, untouched).map((each): GoldenCase => ({
        attempts: played(
          item,
          configuration,
          begun,
          each.attempts,
          reviewSession(review.api, reviewItem, servedInstance),
        ),
        name: each.name,
      })),
      decisionSeed,
      solution: goldenMap(solution(item, begun)),
    } satisfies GoldenSeed;
  });
  const seeds = yield* Effect.all((runs ? decisionSeeds : decisionSeeds.slice(0, 1)).map(seedOf));

  return {
    ...place,
    adaptive: item.item.adaptive,
    digest,
    identifier: item.item.identifier,
    seeds,
    verdict: "accepted",
  } satisfies GoldenItem;
});
