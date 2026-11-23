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
 * control and its state: every state of a session against a table of QTI 3.0.1's rule (information
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
import { assert, describe, it } from "@effect/vitest";
import { acceptedItem, configure, noSupports, openAdmitted } from "@qti-pie/plate";
import type { ItemRecord, Responses, Value } from "@qti-pie/plate";
import { PostedResponses } from "@qti-pie/plate/codec";
import { answerOf, heldOf } from "@qti-pie/plate/ui/props";
import { Effect, Option, Schema } from "effect";
import { reviewOf, reviewShowsOf, showingOf, startingOf } from "#ledger/served-item.ts";
import type {
  ReviewShows,
  ServedItem,
  SessionControl,
  SessionFacts,
  SessionItem,
} from "#ledger/served-item.ts";
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

/**
 * The item served as the open adaptive session's item.
 */
const openedSession = opened.pipe(
  Effect.map((served): SessionItem => ({ ...served, ...openAdaptive })),
);

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

const boolean = (value: boolean): Value => ({
  baseType: "boolean",
  cardinality: "single",
  values: [{ baseType: "boolean", value }],
});

/**
 * Answer an attempt as a host does and read the post as its server does: the answer the held
 * state's contract gives (`answerOf`), with the End Attempt pressed, if any, written as JSON text
 * by plate's codec and decoded by the same codec.
 *
 * @param responses The responses the page holds.
 * @param ended The End Attempt whose press ended the attempt, none for another submit.
 * @returns The responses the server reads.
 */
const posted = (responses: Responses, ended: Option.Option<string>) =>
  Effect.gen(function* answered() {
    const answer = yield* Effect.fromResult(answerOf(heldOf(responses), ended));
    const body = Schema.fromJsonString(PostedResponses);

    return yield* Schema.decodeUnknownEffect(body)(yield* Schema.encodeEffect(body)(answer));
  }).pipe(Effect.orDie);

describe("an attempt starts from the page it shows, and posts what that page holds", () => {
  it.effect(
    "the first attempt's start holds its End Attempt at false and not the checklist its feedback hides; pressing the End Attempt posts it true",
    () =>
      Effect.gen(function* firstAttempt() {
        const served = yield* openedSession;
        const start = startingOf(served, begun);

        assert.deepStrictEqual(start, { DRAWN: boolean(false) });
        assert.deepStrictEqual(yield* posted(start, Option.some("DRAWN")), {
          DRAWN: boolean(true),
        });
      }),
  );

  it.effect(
    "the second attempt's start holds the checklist its feedback shows, NULL, and its hidden End Attempt at false; a submit posts the ticked checklist and the End Attempt false",
    () =>
      Effect.gen(function* secondAttempt() {
        const served = yield* openedSession;
        const start = startingOf(served, revealed);
        const ticked = {
          ...start,
          RESPONSE: {
            baseType: "identifier",
            cardinality: "multiple",
            values: [
              { baseType: "identifier", value: "c1" },
              { baseType: "identifier", value: "c2" },
            ],
          },
        } satisfies Record<string, Value>;

        assert.deepStrictEqual(start, {
          DRAWN: boolean(false),
          RESPONSE: { baseType: "identifier", cardinality: "multiple", values: [] },
        });
        assert.deepStrictEqual(yield* posted(ticked, Option.none()), ticked);
      }),
  );
});

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
 * A session's control and state, named for an assertion's message.
 *
 * @param control The session's control.
 * @param state The session's state.
 * @returns Its name.
 */
const nameOf = (control: SessionControl, state: Attempted): string =>
  `max-attempts ${String(control.maxAttempts)}, show-feedback ${String(control.showFeedback)}, show-solution ${String(control.showSolution)}; ${String(state.attempts)} attempts, ${state.adaptive ? "adaptive" : "not adaptive"}${state.completed ? ", completed" : ""}${state.ended ? ", its sitting ended" : ""}`;

/**
 * Every control of max-attempts 0 to 3, each show-feedback and show-solution.
 */
const controls: readonly SessionControl[] = [0n, 1n, 2n, 3n].flatMap((maxAttempts) =>
  [false, true].flatMap((showFeedback) =>
    [false, true].map((showSolution) => ({ maxAttempts, showFeedback, showSolution })),
  ),
);

/**
 * Every state of a session after one attempt or more, up to four, adaptive or not, completed or
 * not, its sitting ended or not; an attempt beyond a limit is never taken, so none is listed.
 *
 * @param control The session's control.
 * @returns The states.
 */
const statesOf = (control: SessionControl): readonly Attempted[] =>
  [1n, 2n, 3n, 4n]
    .filter((attempts) => control.maxAttempts === 0n || attempts <= control.maxAttempts)
    .flatMap((attempts) =>
      [false, true].flatMap((adaptive) =>
        [false, true].flatMap((completed) =>
          [false, true].map((ended) => ({ adaptive, attempts, completed, ended })),
        ),
      ),
    )
    .filter((state) => state.adaptive || !state.completed);

/**
 * What a review shows by the rule, written apart from the code: feedback where the session is
 * open, else where its show-feedback is true; the marks where feedback shows or the session closed;
 * the solution only once closed, where its show-solution is true.
 *
 * @param control The session's control.
 * @param closed Whether the session is closed.
 * @returns What the review shows.
 */
const showsByRule = (control: SessionControl, closed: boolean): ReviewShows => {
  if (!closed) {
    return { feedback: true, marks: true, solution: false };
  }

  return { feedback: control.showFeedback, marks: true, solution: control.showSolution };
};

/**
 * What each review the rule reaches shows, written from the rule: the record its item shows (the
 * attempt's where it shows feedback, else the one the session began with), whether it says the
 * verdict (where it shows marks), and what its marks reveal (the solution where it shows it, else
 * the candidate's own answers where it shows marks, else none).
 */
const reviews: readonly (readonly [
  ReviewShows,
  {
    readonly record: "after" | "begun";
    readonly reveals: "none" | "own" | "solution";
    readonly verdict: boolean;
  },
])[] = [
  [
    { feedback: false, marks: true, solution: false },
    { record: "begun", reveals: "own", verdict: true },
  ],
  [
    { feedback: false, marks: true, solution: true },
    { record: "begun", reveals: "solution", verdict: true },
  ],
  [
    { feedback: true, marks: true, solution: false },
    { record: "after", reveals: "own", verdict: true },
  ],
  [
    { feedback: true, marks: true, solution: true },
    { record: "after", reveals: "solution", verdict: true },
  ],
];

describe("what an item session shows is derived from its control and its state", () => {
  it("every state of every control shows what QTI 3.0.1's rule says", () => {
    let checked = 0;
    for (const control of controls) {
      for (const state of statesOf(control)) {
        const facts = factsOf(control, state);
        const named = nameOf(control, state);
        const expected = showsByRule(control, facts.session.closed);

        assert.deepStrictEqual(reviewShowsOf(facts), expected, named);
        assert.deepStrictEqual(
          showingOf(facts, answered),
          expected.feedback
            ? { record: answered, showFeedback: true }
            : { record: answered, showFeedback: false },
          `${named}: the page shows the record's feedback exactly where the review does`,
        );
        checked += 1;
      }
    }

    assert.isAbove(checked, 0);
  });

  it("a test member under no control, metis's converted tests: after its one attempt, its marks without its feedback", () => {
    const facts = factsOf(
      { maxAttempts: 1n, showFeedback: false, showSolution: false },
      { adaptive: false, attempts: 1n, completed: false, ended: false },
    );

    assert.isTrue(facts.session.closed);
    assert.deepStrictEqual(reviewShowsOf(facts), {
      feedback: false,
      marks: true,
      solution: false,
    });
  });

  it("edullm's review before the cutover is the derived review over every control its direct policy can state", () => {
    let checked = 0;
    for (const control of controls.filter(
      ({ maxAttempts, showFeedback }) => maxAttempts >= 1n && showFeedback,
    )) {
      for (const state of [0n, ...statesOf(control).map(({ attempts }) => attempts)]) {
        for (const adaptive of [false, true]) {
          for (const completed of adaptive ? [false, true] : [false]) {
            const facts = factsOf(control, { adaptive, attempts: state, completed, ended: false });
            const open = !facts.session.closed;
            const feedback = open || control.showFeedback;

            assert.deepStrictEqual(
              reviewShowsOf(facts),
              { feedback, marks: feedback, solution: !open && control.showSolution },
              nameOf(control, { adaptive, attempts: state, completed, ended: false }),
            );
            checked += 1;
          }
        }
      }
    }

    assert.isAbove(checked, 0);
  });

  it.effect("reviewOf draws every review the rule reaches, against its table", () =>
    Effect.gen(function* everyReview() {
      const served = yield* opened;
      const records = { after: answered, begun: revealed };
      const reached = new Map(
        controls.flatMap((control) =>
          statesOf(control).map((state) => {
            const facts = factsOf(control, state);

            return [JSON.stringify(reviewShowsOf(facts)), facts] as const;
          }),
        ),
      );

      assert.deepStrictEqual(
        [...reached.keys()].toSorted(),
        reviews.map(([shows]) => JSON.stringify(shows)).toSorted(),
        "the reviews the rule reaches are the table's",
      );

      const { values } = reviewOf(served, records, judged, openAdaptive);
      for (const [shows, expected] of reviews) {
        const named = JSON.stringify(shows);
        const facts = reached.get(named);
        assert.isDefined(facts, named);

        if (facts === undefined) {
          continue;
        }

        const props = reviewOf(served, records, judged, facts);

        assert.strictEqual(props.mode, "review", named);
        assert.deepStrictEqual(props.shows, shows, named);
        assert.deepStrictEqual(props.session, facts.session, named);
        assert.strictEqual(props.showFeedback, shows.feedback, named);
        assert.deepStrictEqual(props.record, records[expected.record], named);
        assert.deepStrictEqual(
          props.values,
          values,
          `${named}: the answers shown are the attempt's under every switch`,
        );
        assert.strictEqual(props.graded?.credit, expected.verdict ? "partial" : undefined, named);
        assert.deepStrictEqual(
          props.graded?.marks,
          expected.reveals === "none"
            ? undefined
            : { parts: judged.marks, reveals: expected.reveals },
          named,
        );
      }
    }),
  );
});
