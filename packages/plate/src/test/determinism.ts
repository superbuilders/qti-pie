/**
 * The determinism fixture: one templated item, its source, the seed and instance it runs
 * under, and what it gives there, pinned, so the same template values and outcomes can be
 * asserted on every run (`src/engine/determinism.test.ts`).
 *
 * {@link determinismItem} is the model `buildItem` builds from {@link determinismXml}. Its template
 * processing draws an integer
 * under a `qti-template-constraint` that restarts under {@link determinismSeed}, draws a float and
 * takes its `qti-math-operator` `sin`, draws in a `qti-and` operand after a false one, and holds a
 * draw in a `qti-template-condition` branch not taken, so the values pin the engine's operand order
 * (`operandValues` in `#plate/engine/operands.ts`):
 * every operand evaluated left to right, a condition's branches until the first true one. It sets
 * the correct response and the template variable that shows one template block and one choice
 * and hides another of each. Its body prints three template values. Its response processing scores
 * the template-visible choice from a template value and draws an outcome.
 *
 * {@link observe} drives a record through `runAttempt`, and {@link startRecord} starts one with
 * `firstAttempt`.
 *
 * @module
 */
import { Effect, Result } from "effect";
import { readSource } from "#plate/document/read.ts";
import { firstAttempt, runAttempt } from "#plate/engine/attempt.ts";
import type { EngineFailure } from "#plate/engine/evaluate.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import type { Item } from "#plate/model/item.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Value } from "#plate/model/values.ts";
import { float, integer } from "#plate/test/fixtures.ts";

/**
 * The location the fixture's document carries, as `openAdmitted` takes it and the model holds it.
 */
export const determinismLocation = "items/determinism.xml";

/**
 * The seed every pinned value is drawn under. Under it the constraint `N >= 5` fails on the first
 * pass (N = 2) and the run restarts once.
 */
export const determinismSeed = "alpha";

/**
 * A second seed, under which the template values differ from the pinned ones.
 */
export const otherSeed = "omega";

/**
 * The instance every record of the fixture is begun under.
 */
export const determinismInstance = "det";

/**
 * Construct a single identifier value.
 *
 * @param value The identifier.
 * @returns The value holding it.
 */
const identifier = (value: string): Value => ({
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value }],
});

/**
 * Construct a single boolean value.
 *
 * @param value The boolean.
 * @returns The value holding it.
 */
const boolean = (value: boolean): Value => ({
  baseType: "boolean",
  cardinality: "single",
  values: [{ baseType: "boolean", value }],
});

/**
 * The one response the attempt gives: the choice `B`, which the template variable `CHOICE` shows.
 */
export const determinismResponses: ItemRecord["responses"] = { RESPONSE: identifier("B") };

/**
 * The fixture's document, written by hand. Its body is written with no whitespace
 * between elements, so the model holds no text between them.
 */
export const determinismXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="determinism" title="Determinism" time-dependent="false" xml:lang="en">
  <qti-response-declaration identifier="RESPONSE" base-type="identifier" cardinality="single"/>
  <qti-outcome-declaration identifier="SCORE" base-type="float" cardinality="single"/>
  <qti-outcome-declaration identifier="DRAWN" base-type="integer" cardinality="single"/>
  <qti-template-declaration identifier="N" base-type="integer" cardinality="single">
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-template-declaration>
  <qti-template-declaration identifier="X" base-type="float" cardinality="single"/>
  <qti-template-declaration identifier="S" base-type="float" cardinality="single"/>
  <qti-template-declaration identifier="BOTH" base-type="boolean" cardinality="single"/>
  <qti-template-declaration identifier="M" base-type="integer" cardinality="single"/>
  <qti-template-declaration identifier="CHOICE" base-type="identifier" cardinality="single"/>
  <qti-template-processing>
    <qti-set-template-value identifier="N">
      <qti-random-integer min="1" max="9"/>
    </qti-set-template-value>
    <qti-template-constraint>
      <qti-gte>
        <qti-variable identifier="N"/>
        <qti-base-value base-type="integer">5</qti-base-value>
      </qti-gte>
    </qti-template-constraint>
    <qti-set-template-value identifier="X">
      <qti-random-float min="0" max="10"/>
    </qti-set-template-value>
    <qti-set-template-value identifier="S">
      <qti-math-operator name="sin">
        <qti-variable identifier="X"/>
      </qti-math-operator>
    </qti-set-template-value>
    <qti-set-template-value identifier="BOTH">
      <qti-and>
        <qti-base-value base-type="boolean">false</qti-base-value>
        <qti-gte>
          <qti-random-integer min="0" max="99"/>
          <qti-base-value base-type="integer">0</qti-base-value>
        </qti-gte>
      </qti-and>
    </qti-set-template-value>
    <qti-template-condition>
      <qti-template-if>
        <qti-lt>
          <qti-variable identifier="N"/>
          <qti-base-value base-type="integer">0</qti-base-value>
        </qti-lt>
        <qti-set-template-value identifier="M">
          <qti-random-integer min="0" max="99"/>
        </qti-set-template-value>
      </qti-template-if>
      <qti-template-else>
        <qti-set-template-value identifier="M">
          <qti-random-integer min="100" max="199"/>
        </qti-set-template-value>
      </qti-template-else>
    </qti-template-condition>
    <qti-set-template-value identifier="CHOICE">
      <qti-base-value base-type="identifier">B</qti-base-value>
    </qti-set-template-value>
    <qti-set-correct-response identifier="RESPONSE">
      <qti-variable identifier="CHOICE"/>
    </qti-set-correct-response>
  </qti-template-processing>
  <qti-item-body><p>N is <qti-printed-variable identifier="N"/>, M is <qti-printed-variable identifier="M"/> and the sine of X is <qti-printed-variable identifier="S"/>.</p><qti-template-block template-identifier="CHOICE" identifier="B" show-hide="show"><qti-content-body><p>Block B is shown.</p></qti-content-body></qti-template-block><qti-template-block template-identifier="CHOICE" identifier="C" show-hide="show"><qti-content-body><p>Block C is hidden.</p></qti-content-body></qti-template-block><qti-choice-interaction response-identifier="RESPONSE" max-choices="1"><qti-prompt>Pick the choice CHOICE names.</qti-prompt><qti-simple-choice identifier="A">Always shown</qti-simple-choice><qti-simple-choice identifier="B" template-identifier="CHOICE" show-hide="show">Shown by CHOICE</qti-simple-choice><qti-simple-choice identifier="C" template-identifier="CHOICE" show-hide="show">Hidden by CHOICE</qti-simple-choice></qti-choice-interaction></qti-item-body>
  <qti-response-processing>
    <qti-response-condition>
      <qti-response-if>
        <qti-match>
          <qti-variable identifier="RESPONSE"/>
          <qti-correct identifier="RESPONSE"/>
        </qti-match>
        <qti-set-outcome-value identifier="SCORE">
          <qti-sum>
            <qti-base-value base-type="float">1</qti-base-value>
            <qti-variable identifier="S"/>
          </qti-sum>
        </qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else>
        <qti-set-outcome-value identifier="SCORE">
          <qti-base-value base-type="float">0</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-else>
    </qti-response-condition>
    <qti-set-outcome-value identifier="DRAWN">
      <qti-random-integer min="1" max="6"/>
    </qti-set-outcome-value>
  </qti-response-processing>
</qti-assessment-item>
`;

/**
 * The fixture item: the model `buildItem` builds from {@link determinismXml}, as `openAdmitted`
 * builds it for an accepted item.
 */
export const determinismItem: Item = Effect.runSync(
  readSource(determinismLocation, new TextEncoder().encode(determinismXml)).pipe(
    Effect.map((source) => admittedItem(source)),
  ),
);

/**
 * What one run of the fixture gives: the record's template values, and the outcomes after the
 * attempt answers {@link determinismResponses}.
 */
export interface Observed {
  readonly outcomes: ItemRecord["outcomes"];
  readonly templates: ItemRecord["templates"];
}

/**
 * What the fixture gives under {@link determinismSeed} and {@link determinismInstance}, pinned.
 *
 * `S` is `Math.sin` of `X`, asserted exactly; `SCORE` is `1 + S`, since the response is
 * the correct one template processing set.
 */
export const pinned: Observed = {
  outcomes: {
    DRAWN: integer(1n),
    SCORE: float(0.27261476873917745),
    completionStatus: identifier("unknown"),
  },
  templates: {
    BOTH: boolean(false),
    CHOICE: identifier("B"),
    M: integer(122n),
    N: integer(7n),
    S: float(-0.7273852312608226),
    X: float(5.4686814341246945),
  },
};

/**
 * Start the fixture's first record with `firstAttempt`, under {@link determinismInstance}.
 *
 * @param seed The seed its template processing draws under, {@link determinismSeed} by default.
 * @returns The record, or template processing's first failure.
 */
export const startRecord = (
  seed: string = determinismSeed,
): Result.Result<ItemRecord, EngineFailure> =>
  firstAttempt(determinismItem, { instance: determinismInstance, seed });

/**
 * Run the fixture from a record through the engine: `runAttempt` answering
 * {@link determinismResponses} for its outcomes.
 *
 * @param record The record the attempt starts from, as {@link startRecord} gives it.
 * @returns What the run gives, or the attempt's first failure.
 */
export const observe = (record: ItemRecord): Result.Result<Observed, EngineFailure> =>
  Result.map(runAttempt(determinismItem, record, determinismResponses, {}), (after) => ({
    outcomes: after.outcomes,
    templates: record.templates,
  }));
