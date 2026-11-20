/**
 * The review marks of the golden data: what plate's review draws of how an attempt did, as the QTI
 * app hands it (`reviewOf` and `gradedOf` of its `server/item.ts`), read from the review's own
 * markup.
 *
 * A review is plate's `<Item>`, a TSX component, so it is rendered through a Vite server rooted at
 * plate, as `scripts/render-diff/worker.ts` renders, from the item opened again in that server's
 * module graph: the review of each scored attempt is the review its own plate gives it. Each review
 * is rendered twice, as the app hands it with feedback shown: revealing the child's own answers
 * alone (`own`, the direct policy's review), and revealing the solution (`solution`). From each
 * render the golden keeps every element that carries a `data-mark` or a `data-credit`, in document
 * order, with its `data-slot`, so it pins what the review marks whichever grader hands the marks.
 *
 * @module
 */
import path from "node:path";
import type { createElement, ReactNode } from "react";
import type { renderToString } from "react-dom/server";
import { createViteServer } from "vitest/node";
import { Option, Result } from "effect";
import type { ClockedAttempt, attemptOf, recordAfter } from "#plate/attempts.ts";
import type { begin } from "#plate/begin.ts";
import type { Configuration, configure } from "#plate/configuration.ts";
import type { Credit, credit } from "#plate/credit.ts";
import type { RedactRecord } from "#plate/model/record.ts";
import type { ResponseValue } from "#plate/model/values.ts";
import type { restore } from "#plate/restore.ts";
import type { scoreRecord } from "#plate/score.ts";
import type { solution } from "#plate/solution.ts";
import type { openAdmitted } from "#plate/validate/admitted.ts";
import type { Accepted, acceptedItem } from "#plate/validate/verdict.ts";
import type { Posted } from "#scripts/golden/cases.ts";

/**
 * What a review reveals of the correct responses: the child's own answers alone, or the solution.
 */
type Reveals = "own" | "solution";

/**
 * The props of the review `<Item>` the golden renders: an accepted item in review mode, the record
 * after the attempt, the values it shows, and how the attempt did.
 */
interface ReviewInput {
  readonly configuration: Configuration;
  readonly graded: {
    readonly credit?: Credit;
    readonly marks: {
      readonly against: Readonly<Record<string, ResponseValue>>;
      readonly reveals: Reveals;
    };
  };
  readonly instance: string;
  readonly item: Accepted;
  readonly mode: "review";
  readonly record: RedactRecord;
  readonly values: Readonly<Record<string, ResponseValue>>;
}

/**
 * The plate a review is rendered with: the functions of the Vite server's module graph.
 */
export interface ReviewApi {
  readonly Item: (props: ReviewInput) => ReactNode;
  readonly acceptedItem: typeof acceptedItem;
  readonly attemptOf: typeof attemptOf;
  readonly begin: typeof begin;
  readonly configure: typeof configure;
  readonly createElement: typeof createElement;
  readonly credit: typeof credit;
  readonly openAdmitted: typeof openAdmitted;
  readonly recordAfter: typeof recordAfter;
  readonly renderToString: typeof renderToString;
  readonly restore: typeof restore;
  readonly scoreRecord: typeof scoreRecord;
  readonly solution: typeof solution;
}

declare global {
  /**
   * The hook the loaded module hands its {@link ReviewApi} through.
   */
  var goldenReviewProvide: ((api: ReviewApi) => void) | undefined;
}

/**
 * The handover of one worker's {@link ReviewApi}, settled once the module it loads runs.
 */
const handover = Promise.withResolvers<ReviewApi>();

globalThis.goldenReviewProvide = handover.resolve;

/**
 * The module the Vite server loads, which hands the worker its plate.
 */
const apiSource = [
  'import { createElement } from "react";',
  'import { renderToString } from "react-dom/server";',
  'import { attemptOf, recordAfter } from "#plate/attempts.ts";',
  'import { begin } from "#plate/begin.ts";',
  'import { configure } from "#plate/configuration.ts";',
  'import { credit } from "#plate/credit.ts";',
  'import { restore } from "#plate/restore.ts";',
  'import { scoreRecord } from "#plate/score.ts";',
  'import { solution } from "#plate/solution.ts";',
  'import { Item } from "#plate/ui/index.ts";',
  'import { openAdmitted } from "#plate/validate/admitted.ts";',
  'import { acceptedItem } from "#plate/validate/verdict.ts";',
  "globalThis.goldenReviewProvide({ Item, acceptedItem, attemptOf, begin, configure, createElement, credit, openAdmitted, recordAfter, renderToString, restore, scoreRecord, solution });",
].join("\n");

/**
 * The plate package's directory, from this file's place in it.
 */
const plateDirectory = path.resolve(import.meta.dirname, "../..");

/**
 * Load plate's review in a Vite server rooted at plate.
 *
 * @param cacheDirectory The directory Vite keeps its cache in.
 * @returns The plate it loaded, and a function that closes the server.
 */
export const loadReview = async (
  cacheDirectory: string,
): Promise<{ readonly api: ReviewApi; readonly close: () => Promise<void> }> => {
  const id = path.join(plateDirectory, "scripts/golden/review-api.ts");
  const server = await createViteServer({
    appType: "custom",
    cacheDir: cacheDirectory,
    configFile: false,
    envFile: false,
    logLevel: "error",
    optimizeDeps: { include: [], noDiscovery: true },
    plugins: [
      {
        load: (requested) => (requested === id ? apiSource : undefined),
        name: "golden-review-api",
        resolveId: (requested) => (requested === id ? id : undefined),
      },
    ],
    root: plateDirectory,
    server: { hmr: false, middlewareMode: true, watch: null, ws: false },
  });

  await server.ssrLoadModule(id);

  return { api: await handover.promise, close: () => server.close() };
};

/**
 * One marked part of a review: its `data-slot`, which of `data-mark` and `data-credit` it carries,
 * and that attribute's value.
 */
export type GoldenMark = readonly [slot: string, attribute: "credit" | "mark", value: string];

/**
 * A review's marks, or the failure that kept it from rendering.
 */
export type GoldenMarks = readonly GoldenMark[] | { readonly failed: string };

/**
 * The start tags of a review's markup that carry a mark or a credit.
 */
const markedTag = /<[a-z][a-z0-9-]*\s(?<attributes>[^>]*\bdata-(?:credit|mark)="[^"]*"[^>]*)>/gu;

/**
 * One attribute of a start tag, its value quoted.
 */
const attributeOf = /(?<name>[a-z][a-z0-9-]*)="(?<value>[^"]*)"/gu;

/**
 * Read a review's marks from its markup, in document order.
 *
 * @param html The markup.
 * @returns Every element's mark or credit, with its slot.
 */
const marksIn = (html: string): readonly GoldenMark[] =>
  [...html.matchAll(markedTag)].flatMap((tag) => {
    const attributes = new Map(
      [...(tag.groups?.["attributes"] ?? "").matchAll(attributeOf)].map(
        (match) => [match.groups?.["name"] ?? "", match.groups?.["value"] ?? ""] as const,
      ),
    );
    const slot = attributes.get("data-slot") ?? "";

    return (["mark", "credit"] as const).flatMap((attribute): readonly GoldenMark[] => {
      const value = attributes.get(`data-${attribute}`);

      return value === undefined ? [] : [[slot, attribute, value]];
    });
  });

/**
 * One case's reviews, played in the review's own plate in step with the golden's grading: each
 * attempt is scored again there from the record its attempts so far leave, and reviewed.
 */
export interface ReviewSession {
  /**
   * Score one attempt and render its two reviews.
   *
   * @param posted The attempt's responses.
   * @returns Its marks under each reveal.
   */
  readonly attempt: (posted: Posted) => Readonly<Record<Reveals, GoldenMarks>>;
}

/**
 * What one item's reviews are rendered from: the item as the review's plate opened it, the
 * configuration it is served under, with every file of its source as an asset, and the record
 * `begin` started its session from there.
 */
export interface ReviewItem {
  readonly accepted: Accepted;
  readonly begun: Parameters<typeof scoreRecord>[2];
  readonly configuration: Configuration;
}

/**
 * Start one case's reviews from the item's first record.
 *
 * @param api The review's plate.
 * @param item The item, opened there.
 * @param instance The instance token the app serves items under.
 * @returns The case's review session.
 */
export const reviewSession = (
  api: ReviewApi,
  item: ReviewItem,
  instance: string,
): ReviewSession => {
  const made: ClockedAttempt[] = [];
  const reviewOf = (after: Parameters<typeof restore>[1], reveals: Reveals): GoldenMarks => {
    const restored = api.restore(item.accepted, after);

    if (Result.isFailure(restored)) {
      return { failed: `restore: ${restored.failure._tag}` };
    }

    const marks = { against: api.solution(item.accepted, after), reveals };
    const graded = Option.match(api.credit(item.accepted, after), {
      onNone: () => ({ marks }),
      onSome: (earned) => ({ credit: earned, marks }),
    });
    const html = Result.try({
      catch: (error) =>
        error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      try: () =>
        api.renderToString(
          api.createElement(api.Item, {
            configuration: item.configuration,
            graded,
            instance,
            item: item.accepted,
            mode: "review",
            record: after,
            values: restored.success.values,
          }),
        ),
    });

    return Result.isSuccess(html) ? marksIn(html.success) : { failed: `render: ${html.failure}` };
  };

  return {
    attempt: (posted) => {
      const before = api.recordAfter(item.accepted, item.begun, made);
      const scored = api.scoreRecord(item.accepted, posted, before);

      if (Result.isFailure(scored)) {
        const failed = { failed: `score: ${scored.failure._tag}` };

        return { own: failed, solution: failed };
      }

      made.push({ ...api.attemptOf(scored.success), at: BigInt(made.length) });

      return {
        own: reviewOf(scored.success, "own"),
        solution: reviewOf(scored.success, "solution"),
      };
    },
  };
};
