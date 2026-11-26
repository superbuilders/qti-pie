/**
 * The responses an attempt starts from (`startingOf`) against the page it starts on, and the post a
 * page makes of them: the record an attempt starts from shows and hides feedback, and the responses
 * its start holds, which its post carries, are those of the interactions that page shows, every End
 * Attempt `false` but the one whose press ends the attempt. The case is an
 * adaptive item whose End Attempt stands in feedback the first attempt shows and its second hides,
 * and whose checklist stands in feedback the second attempt shows: QTI 3.0.1 information model
 * §5.49, feedback block: an interaction inside hidden feedback "must also be hidden. The candidate
 * must not be able to set or update the value of the associated response variables", so one inside
 * shown feedback is the candidate's to set; §5.45, End Attempt: "If the candidate invokes response
 * processing using an endAttemptInteraction then the associated response variable is set to 'true'.
 * If response processing is invoked in any other way ... then the associated response variable is
 * set to 'false'."
 *
 * And what an item session shows (`showingOf`, `reviewShowsOf`, `reviewOf`), derived from its
 * control and its state: every state of a session of a box against QTI 3.0.1's rule (information
 * model Table 7.19.1: feedback "must be shown" while attempts remain, and once the last attempt is
 * made, or an adaptive item completed, "whether or not feedback is shown is controlled by the
 * show-feedback constraint"; Table 7.19.3, the solution once closed under show-solution; the marks
 * where feedback shows or the session closed, edullm-bd 2026-11-23), written apart from the code;
 * edullm's QTI app's own review before the cutover (`feedback = open || showFeedback`, marks where
 * feedback, the solution once closed) held equal to it over every control its `direct` policy can
 * state; and a test member under no control, metis's converted tests, its feedback hidden and its
 * marks shown after its one attempt.
 *
 * @module
 */
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { boolean, int } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { acceptedItem, configure, noSupports, openAdmitted } from "@qti-pie/plate";
import type { ItemRecord, Value } from "@qti-pie/plate";
import { Duration, Effect, Formatter, Option } from "effect";
import { reviewOf } from "#ledger/served-item.ts";
import type { ReviewShows, ServedItem, SessionControl, SessionFacts } from "#ledger/served-item.ts";
import type { Judged } from "#ledger/served-values.ts";

/**
 * A question drawn on paper, the chemistry import's `draw` (`@edullm/chemistry-import`'s
 * questions).
 */
const drawn = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="draw" title="Draw" adaptive="true" time-dependent="false" xml:lang="en">
  <qti-response-declaration identifier="DRAWN" cardinality="single" base-type="boolean"/>
  <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
    <qti-correct-response><qti-value>c1</qti-value><qti-value>c2</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>0</qti-value></qti-default-value></qti-outcome-declaration>
  <qti-outcome-declaration identifier="FEEDBACK" cardinality="multiple" base-type="identifier"/>
  <qti-item-body>
    <p>Draw it on paper.</p>
    <qti-feedback-block outcome-identifier="FEEDBACK" identifier="model" show-hide="hide"><qti-content-body>
      <p><qti-end-attempt-interaction response-identifier="DRAWN" title="I've drawn it on paper"/></p>
    </qti-content-body></qti-feedback-block>
    <qti-feedback-block outcome-identifier="FEEDBACK" identifier="model" show-hide="show"><qti-content-body>
      <qti-choice-interaction response-identifier="RESPONSE" max-choices="0" min-choices="0">
        <qti-simple-choice identifier="c1">point 1</qti-simple-choice>
        <qti-simple-choice identifier="c2">point 2</qti-simple-choice>
      </qti-choice-interaction>
    </qti-content-body></qti-feedback-block>
  </qti-item-body>
  <qti-response-processing>
    <qti-response-condition>
      <qti-response-if>
        <qti-member><qti-base-value base-type="identifier">model</qti-base-value><qti-variable identifier="FEEDBACK"/></qti-member>
        <qti-response-condition><qti-response-if>
          <qti-match><qti-variable identifier="RESPONSE"/><qti-correct identifier="RESPONSE"/></qti-match>
          <qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value>
        </qti-response-if></qti-response-condition>
        <qti-set-outcome-value identifier="completionStatus"><qti-base-value base-type="identifier">completed</qti-base-value></qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else>
        <qti-set-outcome-value identifier="FEEDBACK"><qti-multiple><qti-variable identifier="FEEDBACK"/><qti-base-value base-type="identifier">model</qti-base-value></qti-multiple></qti-set-outcome-value>
        <qti-set-outcome-value identifier="completionStatus"><qti-base-value base-type="identifier">incomplete</qti-base-value></qti-set-outcome-value>
      </qti-response-else>
    </qti-response-condition>
  </qti-response-processing>
</qti-assessment-item>`;

const instance = "served";

/**
 * The item served as an application serves it.
 */
const opened = Effect.gen(function* opened() {
  const verdict = yield* openAdmitted("items/draw.xml", new TextEncoder().encode(drawn));
  const item = Option.getOrThrow(acceptedItem(verdict));
  const configuration = yield* configure({ seed: "1" });

  return { configuration, instance, item, stimuli: [], supports: noSupports } satisfies ServedItem;
});

/**
 * The adaptive item's session while it is open, as the database reads it before its completing
 * attempt: no limit of attempts, its completion status limiting them.
 */
const openAdaptive: SessionFacts = {
  control: { maxAttempts: 1n, showFeedback: false, showSolution: false },
  session: { attempts: 0n, closed: false, left: Option.none() },
};

const identifier = (value: string): Value => ({
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value }],
});

/**
 * The record the database starts the first attempt from, as it returns it: no response yet, the
 * outcomes at their defaults, `FEEDBACK` NULL and the item not yet attempted.
 */
const begun: ItemRecord = {
  attempt: "none",
  correct: {},
  defaults: {},
  outcomes: {
    FEEDBACK: { baseType: "identifier", cardinality: "multiple", values: [] },
    SCORE: { baseType: "float", cardinality: "single", values: [{ baseType: "float", value: 0 }] },
    completionStatus: identifier("not_attempted"),
  },
  records: {},
  responses: {},
  templates: {},
};

/**
 * The record the database returns after the first attempt: the model's feedback shown, the item
 * incomplete.
 */
const revealed: ItemRecord = {
  ...begun,
  attempt: "submitted",
  outcomes: {
    ...begun.outcomes,
    FEEDBACK: {
      baseType: "identifier",
      cardinality: "multiple",
      values: [{ baseType: "identifier", value: "model" }],
    },
    completionStatus: identifier("incomplete"),
  },
};

/**
 * What the database judged of the second attempt: partial credit, the one choice given marked
 * right.
 */
const judged: Judged = {
  credit: Option.some("partial"),
  marks: {
    RESPONSE: [
      { copies: 1n, mark: "right", place: 0, value: { baseType: "identifier", value: "c1" } },
    ],
  },
};

/**
 * The record after the second attempt, its checklist answered with one choice.
 */
const answered: ItemRecord = {
  ...revealed,
  responses: { RESPONSE: { ...identifier("c1"), cardinality: "multiple" } },
};

/**
 * An item session's state as the rule reads it, the facts the database derives `closed` from: the
 * attempts made, whether the item is adaptive, and, for an adaptive item, whether one of them
 * completed it, and whether its sitting ended.
 */
interface Attempted {
  readonly adaptive: boolean;
  readonly attempts: bigint;
  readonly completed: boolean;
  readonly ended: boolean;
}

/**
 * QTI 3.0.1's rule of whether an item session is closed, written from Table 7.19.1, not the code: a
 * sitting's end closes it; an adaptive item closes once completed, its max-attempts ignored; any
 * other once its attempts reach a max-attempts above 0, 0 being no limit.
 *
 * @param control The session's control.
 * @param state The session's state.
 * @returns Whether it takes no further attempt.
 */
const closedByRule = (control: SessionControl, state: Attempted): boolean =>
  state.ended ||
  (state.adaptive
    ? state.completed
    : control.maxAttempts > 0n && state.attempts >= control.maxAttempts);

/**
 * The facts the database reads of a session in that state, its `left` none under no limit and for
 * an adaptive item.
 *
 * @param control The session's control.
 * @param state The session's state.
 * @returns The session's facts.
 */
const factsOf = (control: SessionControl, state: Attempted): SessionFacts => ({
  control,
  session: {
    attempts: state.attempts,
    closed: closedByRule(control, state),
    left:
      state.adaptive || control.maxAttempts === 0n
        ? Option.none()
        : Option.some(control.maxAttempts - state.attempts),
  },
});

/**
 * An item session as the box draws it: its control and its state.
 */
interface Sitting {
  readonly control: SessionControl;
  readonly state: Attempted;
}

/**
 * Draw a session of the box: a control of max-attempts 0 to 3, each show-feedback and
 * show-solution, and a state after one attempt or more, up to four, within its limit (an attempt
 * beyond a limit is never taken), adaptive or not, completed or not where adaptive (only an
 * adaptive item completes), its sitting ended or not.
 */
const sittings: Gen<Sitting> = (source) => {
  const maxAttempts = BigInt(source.draw(int(0, 3)));
  const showFeedback = source.draw(boolean);
  const showSolution = source.draw(boolean);
  const attempts = BigInt(source.draw(int(1, maxAttempts === 0n ? 4 : Number(maxAttempts))));
  const adaptive = source.draw(boolean);
  const completed = adaptive && source.draw(boolean);
  const ended = source.draw(boolean);

  return {
    control: { maxAttempts, showFeedback, showSolution },
    state: { adaptive, attempts, completed, ended },
  };
};

/**
 * What a review of a session shows, written from QTI 3.0.1's rule, not the code: its feedback while
 * the session is open, attempts remaining, and once it closed where its show-feedback is true
 * (Table 7.19.1, Table 7.19.2); its marks and verdict where its feedback shows or the session
 * closed (edullm-bd 2026-11-23); its solution once it closed, where its show-solution is true
 * (Table 7.19.3).
 *
 * @param control The session's control.
 * @param state The session's state.
 * @returns What its review shows.
 */
const showsByRule = (control: SessionControl, state: Attempted): ReviewShows => {
  const closed = closedByRule(control, state);
  const feedback = !closed || control.showFeedback;

  return { feedback, marks: feedback || closed, solution: closed && control.showSolution };
};

/**
 * The reviews the box reaches, by whether each shows the item's feedback and its solution; every
 * one shows marks, since a session after an attempt either is open, its feedback shown, or closed.
 */
type Reached =
  | "feedback and solution"
  | "feedback, no solution"
  | "no feedback, solution"
  | "neither feedback nor solution";

/**
 * Give the review a session reaches, by whether it shows the item's feedback and its solution.
 *
 * @param shows What the review shows.
 * @returns The review reached.
 */
const reachedOf = (shows: ReviewShows): Reached => {
  if (shows.feedback) {
    return shows.solution ? "feedback and solution" : "feedback, no solution";
  }

  return shows.solution ? "no feedback, solution" : "neither feedback nor solution";
};

/**
 * Give what a review's marks reveal by the rule: the solution where it shows it, else the
 * candidate's own answers where it shows marks, else none.
 *
 * @param shows What the review shows.
 * @returns What its marks reveal.
 */
const revealsByRule = (shows: ReviewShows): "none" | "own" | "solution" => {
  if (shows.solution) {
    return "solution";
  }

  return shows.marks ? "own" : "none";
};

describe("what an item session shows is derived from its control and its state", () => {
  it.effect(
    "reviewOf shows of every session of the box what QTI's rule shows: the record its feedback selects, the verdict where it shows marks, and the solution or the candidate's own answers its marks reveal",
    (ctx) =>
      Effect.gen(function* everyReview() {
        const served = yield* opened;
        const records = { after: answered, begun: revealed };
        const { values } = reviewOf(served, records, judged, openAdaptive);

        yield* searched(
          ctx,
          exhaust(
            {
              box: "every control of max-attempts 0 to 3, each show-feedback and show-solution, by every state after 1 to 4 attempts within its limit, adaptive or not, completed or not where adaptive, its sitting ended or not",
              caseHang: Duration.seconds(10),
              coverage: requiredInSpace<Reached>([
                "feedback and solution",
                "feedback, no solution",
                "no feedback, solution",
                "neither feedback nor solution",
              ]),
              generator: sittings,
              literal: (sitting) => Formatter.format(sitting),
              oracle: {
                kind: "specification",
                name: "QTI 3.0.1 information model Tables 7.19.1 to 7.19.3 and edullm-bd 2026-11-23's marks, by hand (closedByRule, showsByRule)",
              },
              suite: "ledger/served-item/review",
            },
            ({ control, state }, c) =>
              Effect.sync(() => {
                const facts = factsOf(control, state);
                const shows = showsByRule(control, state);
                const named = Formatter.format({ control, state });
                const props = reviewOf(served, records, judged, facts);

                c.note(reachedOf(shows));
                assert.strictEqual(props.mode, "review", named);
                assert.deepStrictEqual(props.shows, shows, named);
                assert.deepStrictEqual(props.session, facts.session, named);
                assert.strictEqual(props.showFeedback, shows.feedback, named);
                assert.deepStrictEqual(
                  props.record,
                  shows.feedback ? records.after : records.begun,
                  `${named}: the attempt's record where it shows feedback, else the one it began with`,
                );
                assert.deepStrictEqual(
                  props.values,
                  values,
                  `${named}: the answers shown are the attempt's under every switch`,
                );
                assert.strictEqual(
                  props.graded?.credit,
                  shows.marks ? "partial" : undefined,
                  named,
                );

                const reveals = revealsByRule(shows);

                assert.deepStrictEqual(
                  props.graded?.marks,
                  reveals === "none" ? undefined : { parts: judged.marks, reveals },
                  `${named}: the solution where it shows it, else the candidate's own answers where it shows marks`,
                );
              }),
          ),
        );
      }),
  );
});
