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
 * And the review of an attempt (`reviewOf`) under its three switches, `feedback`, `marks` and
 * `solution`: every combination against a table of the rule, and edullm's review, its marks where
 * its feedback shows, as the two-switch review it was.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { acceptedItem, configure, noSupports, openAdmitted } from "@qti-pie/plate";
import type { ItemRecord, Responses, Value } from "@qti-pie/plate";
import { PostedResponses } from "@qti-pie/plate/codec";
import { answerOf, heldOf } from "@qti-pie/plate/ui/props";
import { Effect, Option, Schema } from "effect";
import { reviewOf, startingOf } from "#ledger/served-item.ts";
import type { ReviewShows, ServedItem } from "#ledger/served-item.ts";
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
        const served = yield* opened;
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
        const served = yield* opened;
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
 * Every review the three switches name, each with what it shows, written from the rule, not the
 * code: the record its item shows (the attempt's where it shows feedback, else the one the session
 * began with), whether it says the verdict (where it shows marks), and what its marks reveal (the
 * solution where it shows it, else the candidate's own answers where it shows marks, else none).
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
    { feedback: false, marks: false, solution: false },
    { record: "begun", reveals: "none", verdict: false },
  ],
  [
    { feedback: false, marks: false, solution: true },
    { record: "begun", reveals: "solution", verdict: false },
  ],
  [
    { feedback: false, marks: true, solution: false },
    { record: "begun", reveals: "own", verdict: true },
  ],
  [
    { feedback: false, marks: true, solution: true },
    { record: "begun", reveals: "solution", verdict: true },
  ],
  [
    { feedback: true, marks: false, solution: false },
    { record: "after", reveals: "none", verdict: false },
  ],
  [
    { feedback: true, marks: false, solution: true },
    { record: "after", reveals: "solution", verdict: false },
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

describe("reviewOf shows what its three switches say, each independent of the others", () => {
  it.effect("every combination of feedback, marks and solution, against the rule's table", () =>
    Effect.gen(function* everyReview() {
      const served = yield* opened;
      const records = { after: answered, begun: revealed };
      const { values } = reviewOf(
        served,
        records,
        { feedback: false, marks: false, solution: false },
        judged,
      );

      assert.strictEqual(new Set(reviews.map(([shows]) => JSON.stringify(shows))).size, 8);

      for (const [shows, expected] of reviews) {
        const props = reviewOf(served, records, shows, judged);
        const named = JSON.stringify(shows);

        assert.strictEqual(props.mode, "review", named);
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

  it.effect(
    "edullm's review, its marks where its feedback shows, is the two-switch review it was",
    () =>
      Effect.gen(function* edullmReview() {
        const served = yield* opened;
        const records = { after: answered, begun: revealed };
        const before = [
          [false, false, { credit: undefined, marks: undefined, record: revealed }],
          [false, true, { credit: undefined, marks: "solution", record: revealed }],
          [true, false, { credit: "partial", marks: "own", record: answered }],
          [true, true, { credit: "partial", marks: "solution", record: answered }],
        ] as const;

        for (const [feedback, solution, was] of before) {
          const props = reviewOf(served, records, { feedback, marks: feedback, solution }, judged);
          const named = JSON.stringify({ feedback, solution });

          assert.deepStrictEqual(props.record, was.record, named);
          assert.strictEqual(props.graded?.credit, was.credit, named);
          assert.deepStrictEqual(
            props.graded?.marks,
            was.marks === undefined ? undefined : { parts: judged.marks, reveals: was.marks },
            named,
          );
        }
      }),
  );
});
