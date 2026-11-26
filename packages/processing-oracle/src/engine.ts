/**
 * The engine the oracle replays through, as the oracle sees it: compile a stored document, take
 * an item under a seed, answer an attempt. Every value crosses as a recorded value (base type,
 * cardinality, lexical singles), the one form the truths are written in, so the replay and its
 * comparisons know nothing of the package's value model; `adapter.ts` binds this port to
 * `@qti-pie/processing`'s public API and is the only module that imports it.
 *
 * @module
 */
import type { RecordedValues } from "#processing-oracle/recording.ts";

/**
 * The seed an item is taken and answered under: the decision's seed, and the package and
 * identifier that key the item's processing seed from it.
 */
export interface ItemSeed {
  readonly decisionSeed: string;
  readonly identifier: string;
  readonly package: string;
}

/**
 * What a take set: template processing's values, and the correct responses and defaults it set
 * (only those it set).
 */
export interface TakeView {
  readonly correct: RecordedValues;
  readonly defaults: RecordedValues;
  readonly templates: RecordedValues;
}

/**
 * A credit's kind: what share of the maximum a score earns.
 */
export type CreditKind = "full" | "none" | "partial";

/**
 * An attempt's credit, the owner's rule over its SCORE and the maximum in force: what it earned of
 * the maximum and the kind of that share; null where no maximum is in force.
 */
export type CreditView = {
  readonly earned: number;
  readonly kind: CreditKind;
  readonly maximum: number;
} | null;

/**
 * What an attempt gave.
 *
 * - `refused`: validation refused responses (each response's identifier, and the reasons' codes), and
 *   nothing ran; `endAttempt` says whether an end-attempt interaction ended the attempt.
 * - `done`: every outcome after response processing (completionStatus among them), the session's
 *   `numAttempts` after it (an attempt that does not count leaves it), and the attempt's credit
 *   kind.
 * - `pending`: the recorded operators processing reached unrecorded, each by its ordinal among the
 *   document's recorded operators.
 * - `failed`: processing hit a stated limit or a defect; never a grade.
 */
export type AnswerView =
  | {
      readonly codes: readonly string[];
      readonly endAttempt: boolean;
      readonly kind: "refused";
      readonly refused: readonly string[];
    }
  | {
      readonly credit: CreditView;
      readonly kind: "done";
      readonly numAttempts: number;
      readonly outcomes: RecordedValues;
    }
  | { readonly draws: readonly number[]; readonly kind: "pending" }
  | { readonly failure: string; readonly kind: "failed" };

/**
 * An item session as the next attempt finds it: how many attempts were processed before it, the
 * outcomes the last left (an adaptive item continues from them), and the seconds spent in it.
 */
export interface SessionView {
  readonly duration: number;
  readonly numAttempts: number;
  readonly prior: RecordedValues | undefined;
}

/**
 * The engine over one compiled item.
 */
export interface ItemEngine {
  readonly kind: "item";
  /**
   * Answer one attempt.
   *
   * @param input The take, the session before the attempt, the responses, each recorded
   *   operator's answer by ordinal (its score; absent unrecorded), and whether validation runs.
   * @returns What the attempt gave.
   */
  readonly answer: (input: {
    readonly recorded: ReadonlyMap<number, number>;
    readonly responses: RecordedValues;
    readonly seed: ItemSeed;
    readonly session: SessionView;
    readonly take: TakeView;
    readonly validate: boolean;
  }) => AnswerView;
  /**
   * The item's identifier.
   */
  readonly identifier: string;
  /**
   * Take the item: run its template processing under the seed.
   *
   * @param seed The seed.
   * @returns What the take set.
   */
  readonly take: (seed: ItemSeed) => TakeView;
}

/**
 * One member of a sitting as it closes: its item ref's identifier, the responses its last save
 * holds (none where it was presented and never saved, so its defaults stand), and its built-in
 * duration in seconds.
 */
export interface MemberView {
  readonly duration: number;
  readonly ref: string;
  readonly responses: RecordedValues | undefined;
}

/**
 * What a sitting's close gave: each member's attempt and the test's outcomes after outcome
 * processing, pending on a member's recorded operators, refused (a closing member's admission
 * refused the candidate's submission, by its reasons' codes), or a failure.
 */
export type SittingView =
  | {
      readonly kind: "done";
      readonly members: ReadonlyMap<string, AnswerView>;
      readonly test: RecordedValues;
    }
  | { readonly kind: "pending" }
  | { readonly codes: readonly string[]; readonly kind: "refused" }
  | { readonly failure: string; readonly kind: "failed" };

/**
 * The engine over one compiled test and its member items.
 */
export interface TestEngine {
  /**
   * Close a sitting: grade every member that closes and run the test's outcome processing over
   * them and every member never presented (selected, at its declared start).
   *
   * @param input The members that close (those presented), the test's duration in seconds and the
   *   decision seed.
   * @returns What the close gave.
   */
  readonly close: (input: {
    readonly decisionSeed: string;
    readonly duration: number;
    readonly members: readonly MemberView[];
  }) => SittingView;
  readonly kind: "test";
}

/**
 * A compile's refusal: why the engine refused a stored document.
 */
export interface Refused {
  readonly kind: "refused";
  readonly reason: string;
}

/**
 * The engine: compile a stored document's bytes as an item or as a test, or say why it refuses.
 * A test is compiled with its member items, each by its item ref's identifier.
 */
export interface Engine {
  readonly item: (bytes: Uint8Array) => ItemEngine | Refused;
  readonly test: (
    bytes: Uint8Array,
    items: ReadonlyMap<string, Uint8Array>,
  ) => Refused | TestEngine;
}
