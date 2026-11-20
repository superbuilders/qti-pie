import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { begin } from "#plate/begin.ts";
import { firstAttempt } from "#plate/engine/attempt.ts";
import { decodeRecord } from "#plate/form/encoding.ts";
import type { ChoiceInteraction } from "#plate/interactions/choice.ts";
import type { TextEntryInteraction } from "#plate/interactions/text-entry.ts";
import { message } from "#plate/messages.ts";
import type { Item, ResponseDeclaration, TemplateVisibility } from "#plate/model/item.ts";
import { fresh } from "#plate/model/record.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { nullOf } from "#plate/model/values.ts";
import type { RecordValue, Value } from "#plate/model/values.ts";
import { fitting } from "#plate/score.ts";
import { float, integer } from "#plate/test/fixtures.ts";
import { score } from "#plate/test/score.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptForTest, acceptedItem } from "#plate/validate/verdict.ts";

/**
 * Construct a value of identifiers.
 *
 * @param cardinality The value's cardinality.
 * @param chosen The identifiers it holds, none for NULL.
 * @returns The value.
 */
const identifiers = (cardinality: Value["cardinality"], ...chosen: readonly string[]): Value => ({
  baseType: "identifier",
  cardinality,
  values: chosen.map((value) => ({ baseType: "identifier", value })),
});

/**
 * Construct a Choice of the given identifiers bound to a response, with no Prompt.
 *
 * @param response The response it binds.
 * @param cardinality The response's cardinality.
 * @param counts Its `max-choices` and `min-choices`.
 * @param choices The choices' identifiers, each its own content.
 * @returns The Choice.
 */
const choiceOf = (
  response: string,
  cardinality: ChoiceInteraction["cardinality"],
  counts: Pick<ChoiceInteraction, "maxChoices" | "minChoices">,
  choices: readonly string[],
): ChoiceInteraction => ({
  ariaLabel: Option.some(response),
  ariaLabelledby: Option.none(),
  cardinality,
  choices: choices.map((identifier) => ({
    content: [{ kind: "text", text: identifier }],
    fixed: false,
    identifier,
    templateVisibility: Option.none(),
  })),
  class: Option.none(),
  data: [],
  kind: "choice",
  messages: { max: Option.none(), min: Option.none() },
  orientation: "vertical",
  path: `qti-assessment-item/qti-item-body/qti-choice-interaction[${response}]`,
  prompt: Option.none(),
  response,
  shuffle: false,
  ...counts,
});

/**
 * A Text Entry bound to the single integer response `NUMBER`.
 */
const number: TextEntryInteraction = {
  ariaLabel: Option.some("A number"),
  ariaLabelledby: Option.none(),
  base: 10,
  baseType: "integer",
  cardinality: "single",
  class: Option.none(),
  data: [],
  expectedLength: Option.none(),
  kind: "text-entry",
  path: "qti-assessment-item/qti-item-body/p/qti-text-entry-interaction",
  patternMask: Option.none(),
  patternMaskMessage: Option.none(),
  placeholder: Option.none(),
  response: "NUMBER",
};

/**
 * A hand-built item scored by `match_correct`: a single Choice `RESPONSE` whose correct choice is
 * `A`, a multiple Choice `PICK` of two exactly (`max-choices` and `min-choices` 2), and a paragraph
 * holding the integer Text Entry `NUMBER`. Its processing sets the float `SCORE` to 1 when
 * `RESPONSE` matches its correct response, else to 0.
 */
const item: Item = {
  adaptive: false,
  body: [
    choiceOf("RESPONSE", "single", { maxChoices: 1n, minChoices: 0n }, ["A", "B", "C"]),
    choiceOf("PICK", "multiple", { maxChoices: 2n, minChoices: 2n }, ["A", "B", "C", "D"]),
    {
      attributes: [],
      children: [{ kind: "text", text: "Pick a number: " }, number],
      kind: "element",
      path: "qti-assessment-item/qti-item-body/p",
      tag: "p",
    },
  ],
  content: { "qti-catalog-info": [], "qti-companion-materials-info": [] },
  contexts: new Map(),
  document: "items/scored.xml",
  identifier: "scored",
  lang: Option.none(),
  modalFeedback: [],
  outcomes: new Map([
    [
      "SCORE",
      {
        baseType: "float",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "SCORE",
        interpretation: Option.none(),
        longInterpretation: Option.none(),
        lookupTable: Option.none(),
        masteryValue: Option.none(),
        normalMaximum: Option.none(),
        normalMinimum: Option.none(),
        view: Option.none(),
      },
    ],
  ]),
  processing: Option.some([
    {
      branches: [
        {
          rules: [
            {
              expression: { kind: "base-value", operands: [], value: float(1) },
              identifier: "SCORE",
              kind: "set-outcome",
            },
          ],
          when: {
            kind: "match",
            operands: [
              {
                identifier: "RESPONSE",
                kind: "variable",
                operands: [],
                weightIdentifier: Option.none(),
              },
              { identifier: "RESPONSE", kind: "correct", operands: [] },
            ],
          },
        },
      ],
      kind: "condition",
      otherwise: Option.some([
        {
          expression: { kind: "base-value", operands: [], value: float(0) },
          identifier: "SCORE",
          kind: "set-outcome",
        },
      ]),
    },
  ]),
  records: new Map(),
  responses: new Map([
    [
      "RESPONSE",
      {
        areaMapping: Option.none(),
        baseType: "identifier",
        cardinality: "single",
        correct: Option.some(identifiers("single", "A")),
        defaultValue: Option.none(),
        identifier: "RESPONSE",
        mapping: Option.none(),
      },
    ],
    [
      "PICK",
      {
        areaMapping: Option.none(),
        baseType: "identifier",
        cardinality: "multiple",
        correct: Option.none(),
        defaultValue: Option.none(),
        identifier: "PICK",
        mapping: Option.none(),
      },
    ],
    [
      "NUMBER",
      {
        areaMapping: Option.none(),
        baseType: "integer",
        cardinality: "single",
        correct: Option.none(),
        defaultValue: Option.none(),
        identifier: "NUMBER",
        mapping: Option.none(),
      },
    ],
  ]),
  templateProcessing: { kind: "absent" },
  templates: new Map(),
  title: "Scored",
  unheld: new Map(),
  unsupported: [],
};

/**
 * The item as `check` would accept it, through the tests' named seam.
 */
const accepted = acceptForTest(item);

/**
 * A record response's answer as a host builds it by hand: a Text Entry's text, with the numbers
 * read from it.
 */
const recordAnswer: RecordValue = {
  cardinality: "record",
  fields: [
    { identifier: "stringValue", value: { baseType: "string", value: "  12 " } },
    { identifier: "floatValue", value: { baseType: "float", value: 12 } },
    { identifier: "integerValue", value: { baseType: "integer", value: 12n } },
  ],
};

/**
 * The single string response `TEXT`, which no interaction binds.
 */
const textDeclaration: ResponseDeclaration = {
  areaMapping: Option.none(),
  baseType: "string",
  cardinality: "single",
  correct: Option.none(),
  defaultValue: Option.none(),
  identifier: "TEXT",
  mapping: Option.none(),
};

/**
 * {@link item} with the record response `RREC` and the string response `TEXT` beside its own,
 * neither bound by an interaction, as `check` would accept it.
 */
const recordAccepted = acceptForTest({
  ...item,
  document: "items/recorded.xml",
  identifier: "recorded",
  records: new Map([
    ["RREC", { correct: Option.none(), defaultValue: Option.none(), identifier: "RREC" }],
  ]),
  responses: new Map([...item.responses, ["TEXT", textDeclaration]]),
});

/**
 * Give an `InvalidResponses` failure's tag, response, problem and expected type, or the tag alone
 * of any other failure.
 *
 * @param result What `score` returned.
 * @returns Those facts, or none when it succeeded.
 */
const responseFailureOf = (result: ReturnType<typeof score>): Option.Option<readonly unknown[]> =>
  Option.map(Result.getFailure(result), (failure) =>
    failure._tag === "InvalidResponses"
      ? [failure._tag, failure.response, failure.problem, failure.expected]
      : [failure._tag],
  );

/**
 * Another item, at another location: a record of it never belongs to {@link item}.
 */
const other = acceptForTest({ ...item, document: "items/other.xml", identifier: "other" });

/**
 * A hand-built item whose template processing runs: {@link item} with the single integer template
 * variable `T`, which its template processing sets to 7, the default of `SCORE` set to 0.5, and the
 * correct response of `RESPONSE` set to `B`, so `B`, not the declared `A`, scores 1.
 */
const templatedItem: Item = {
  ...item,
  document: "items/templated.xml",
  identifier: "templated",
  templateProcessing: {
    kind: "runs",
    rules: [
      {
        expression: { kind: "base-value", operands: [], value: integer(7n) },
        identifier: "T",
        kind: "set-template-value",
      },
      {
        expression: { kind: "base-value", operands: [], value: float(0.5) },
        identifier: "SCORE",
        kind: "set-default-value",
      },
      {
        expression: { kind: "base-value", operands: [], value: identifiers("single", "B") },
        identifier: "RESPONSE",
        kind: "set-correct-response",
      },
    ],
  },
  templates: new Map([
    [
      "T",
      {
        baseType: "integer",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "T",
        mathVariable: false,
        paramVariable: false,
      },
    ],
  ]),
};

/**
 * {@link templatedItem} as `check` would accept it, through the tests' named seam.
 */
const templated = acceptForTest(templatedItem);

/**
 * {@link item} with `RESPONSE` declaring the default `A`, its correct response, as `check` would
 * accept it: an attempt that posts no `RESPONSE` scores its default, 1.
 */
const defaulted = acceptForTest({
  ...item,
  document: "items/defaulted.xml",
  identifier: "defaulted",
  responses: new Map(
    Array.from(item.responses, ([identifier, declaration]) => [
      identifier,
      identifier === "RESPONSE"
        ? { ...declaration, defaultValue: Option.some(identifiers("single", "A")) }
        : declaration,
    ]),
  ),
});

/**
 * The template visibility of a part shown when the template variable `SHOWN` holds its identifier.
 */
const shownBy: TemplateVisibility = { showHide: "show", templateIdentifier: "SHOWN" };

/**
 * The single Choice `RESPONSE` of {@link visibleItem}: choice `A` with no template visibility, and
 * `B` and `C` each {@link shownBy}.
 */
const visibleChoice: ChoiceInteraction = (() => {
  const choice = choiceOf("RESPONSE", "single", { maxChoices: 1n, minChoices: 0n }, [
    "A",
    "B",
    "C",
  ]);

  return {
    ...choice,
    choices: choice.choices.map((simple) =>
      simple.identifier === "A" ? simple : { ...simple, templateVisibility: Option.some(shownBy) },
    ),
  };
})();

/**
 * A hand-built item whose template processing sets the single identifier template variable `SHOWN`
 * to `B`, so its record shows {@link visibleChoice}'s `A` and `B` and hides `C`, and hides the
 * template block shown when `SHOWN` holds `C`, which holds the integer Text Entry `HIDDEN`,
 * declared with the default 3. Its processing sets `SCORE` to 1 when `RESPONSE` matches its correct
 * response, `B`, else to 0, and the integer `ECHO` to `HIDDEN`.
 */
const visibleItem: Item = {
  ...item,
  body: [
    visibleChoice,
    {
      content: [
        {
          attributes: [],
          children: [
            {
              ...number,
              path: "qti-assessment-item/qti-item-body/qti-template-block/p/qti-text-entry-interaction",
              response: "HIDDEN",
            },
          ],
          kind: "element",
          path: "qti-assessment-item/qti-item-body/qti-template-block/p",
          tag: "p",
        },
      ],
      identifier: "C",
      kind: "template-block",
      path: "qti-assessment-item/qti-item-body/qti-template-block",
      responses: ["HIDDEN"],
      templateVisibility: shownBy,
    },
  ],
  document: "items/visible.xml",
  identifier: "visible",
  outcomes: new Map([
    ...item.outcomes,
    [
      "ECHO",
      {
        baseType: "integer",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "ECHO",
        interpretation: Option.none(),
        longInterpretation: Option.none(),
        lookupTable: Option.none(),
        masteryValue: Option.none(),
        normalMaximum: Option.none(),
        normalMinimum: Option.none(),
        view: Option.none(),
      },
    ],
  ]),
  processing: Option.some([
    ...Option.getOrElse(item.processing, () => []),
    {
      expression: {
        identifier: "HIDDEN",
        kind: "variable",
        operands: [],
        weightIdentifier: Option.none(),
      },
      identifier: "ECHO",
      kind: "set-outcome",
    },
  ]),
  responses: new Map([
    [
      "RESPONSE",
      {
        areaMapping: Option.none(),
        baseType: "identifier",
        cardinality: "single",
        correct: Option.some(identifiers("single", "B")),
        defaultValue: Option.none(),
        identifier: "RESPONSE",
        mapping: Option.none(),
      },
    ],
    [
      "HIDDEN",
      {
        areaMapping: Option.none(),
        baseType: "integer",
        cardinality: "single",
        correct: Option.none(),
        defaultValue: Option.some(integer(3n)),
        identifier: "HIDDEN",
        mapping: Option.none(),
      },
    ],
  ]),
  templateProcessing: {
    kind: "runs",
    rules: [
      {
        expression: { kind: "base-value", operands: [], value: identifiers("single", "B") },
        identifier: "SHOWN",
        kind: "set-template-value",
      },
    ],
  },
  templates: new Map([
    [
      "SHOWN",
      {
        baseType: "identifier",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "SHOWN",
        mathVariable: false,
        paramVariable: false,
      },
    ],
  ]),
};

/**
 * {@link visibleItem} as `check` would accept it, through the tests' named seam.
 */
const visible = acceptForTest(visibleItem);

/**
 * Give the failure of a score, after checking it is a `Result` at all.
 *
 * @param result What `score` returned.
 * @returns Its failure, or none when it succeeded.
 */
const failureOf = <A, E>(result: Result.Result<A, E>): Option.Option<E> => {
  assert.isTrue(Result.isResult(result));

  return Result.getFailure(result);
};

/**
 * Give one outcome of a stored record, as its value's numbers.
 *
 * @param stored The stored record.
 * @param identifier The outcome.
 * @returns The outcome's stored values, none when the record lacks it.
 */
const outcomeOf = (stored: ItemRecord, identifier: string): readonly unknown[] =>
  stored.outcomes[identifier]?.values.map((single) => single.value) ?? [];

/**
 * Give what an attempt carries through a stored record unchanged: its seed, template values, and
 * the correct responses and defaults its template processing set.
 *
 * @param stored The stored record.
 * @returns Those four fields.
 */
const carriedOf = ({
  correct,
  defaults,
  seed,
  templates,
}: ItemRecord): Pick<ItemRecord, "correct" | "defaults" | "seed" | "templates"> => ({
  correct,
  defaults,
  seed,
  templates,
});

/**
 * A hand-built item document whose response processing sets the boolean `STATUS_NULL` to whether
 * the `qti-default` of the built-in `completionStatus` is NULL, and `ATTEMPTS_NULL` to whether the
 * `qti-default` of the built-in `numAttempts` is. Neither built-in has a declaration, so each
 * default is NULL of the built-in's type and both outcomes are true.
 */
const builtInDefaults = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="built-in-defaults" title="Built-in defaults" time-dependent="false" adaptive="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/>
  <qti-outcome-declaration identifier="STATUS_NULL" cardinality="single" base-type="boolean"/>
  <qti-outcome-declaration identifier="ATTEMPTS_NULL" cardinality="single" base-type="boolean"/>
  <qti-item-body><p>Built-in defaults</p></qti-item-body>
  <qti-response-processing>
    <qti-set-outcome-value identifier="STATUS_NULL">
      <qti-is-null><qti-default identifier="completionStatus"/></qti-is-null>
    </qti-set-outcome-value>
    <qti-set-outcome-value identifier="ATTEMPTS_NULL">
      <qti-is-null><qti-default identifier="numAttempts"/></qti-is-null>
    </qti-set-outcome-value>
  </qti-response-processing>
</qti-assessment-item>
`;

/**
 * Write a hand-built item document whose template processing sets the single identifier template
 * variable `BLOCK` to `NO`, so its record hides the template inline shown when `BLOCK` holds `YES`.
 * Its response `R2` of identifiers has the correct response `C1`, then `C2` where it is not single,
 * and its response processing sets `SCORE` to 1 when `R2` matches it, else to 0. A template block
 * may hold no interaction (reading 143), so the hidden interaction sits in a template inline's
 * `span`, and is an inline one.
 *
 * @param interaction The interaction bound to `R2`, as its markup.
 * @param cardinality `R2`'s cardinality.
 * @param hidden Whether the interaction sits in that hidden template inline, rather than in the
 *   item body outside any template content.
 * @returns The item document.
 */
const blockDocument = (
  interaction: string,
  cardinality: "ordered" | "single",
  hidden: boolean,
): string => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="hidden-block" title="Hidden block" time-dependent="false" adaptive="false">
  <qti-response-declaration identifier="R2" cardinality="${cardinality}" base-type="identifier">
    <qti-correct-response><qti-value>C1</qti-value>${cardinality === "single" ? "" : "<qti-value>C2</qti-value>"}</qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-template-declaration identifier="BLOCK" cardinality="single" base-type="identifier"/>
  <qti-template-processing>
    <qti-set-template-value identifier="BLOCK"><qti-base-value base-type="identifier">NO</qti-base-value></qti-set-template-value>
  </qti-template-processing>
  <qti-item-body>
    <p>Intro</p>
    ${hidden ? `<p><qti-template-inline identifier="YES" template-identifier="BLOCK" show-hide="show"><span>${interaction}</span></qti-template-inline></p>` : interaction}
  </qti-item-body>
  <qti-response-processing>
    <qti-response-condition>
      <qti-response-if>
        <qti-match><qti-variable identifier="R2"/><qti-correct identifier="R2"/></qti-match>
        <qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else>
        <qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value>
      </qti-response-else>
    </qti-response-condition>
  </qti-response-processing>
</qti-assessment-item>
`;

/**
 * An Order bound to `R2` over the choices `C1` and `C2`: an interaction the renderer shows as a
 * notice, so it binds no response on the page.
 */
const orderOfTwo =
  '<qti-order-interaction response-identifier="R2"><qti-simple-choice identifier="C1">One</qti-simple-choice><qti-simple-choice identifier="C2">Two</qti-simple-choice></qti-order-interaction>';

/**
 * A Custom Interaction bound to `R2`: an inline interaction the renderer shows as a notice, so it
 * binds no response on the page, and one a template inline may hold (reading 143).
 */
const customOfR2 = '<qti-custom-interaction response-identifier="R2"/>';

/**
 * An Inline Choice bound to `R2` over the choices `C1` and `C2`: an inline interaction the renderer
 * shows.
 */
const inlineChoiceOfTwo =
  '<qti-inline-choice-interaction response-identifier="R2"><qti-inline-choice identifier="C1">One</qti-inline-choice><qti-inline-choice identifier="C2">Two</qti-inline-choice></qti-inline-choice-interaction>';

/**
 * Open a hand-built item document, which `check` must accept (with or without unsupported
 * features), and score one attempt that posts `R2` over its first record, which `begin` starts.
 *
 * @param document The item document, a {@link blockDocument}.
 * @param posted The value posted for `R2`.
 * @returns The record `score` returned, in the form the host stores.
 */
const scoredInBlock = Effect.fnUntraced(function* scoredInBlock(document: string, posted: Value) {
  const verdict = yield* admitted("items/hidden-block.xml", new TextEncoder().encode(document));
  const opened = Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`The item is ${verdict.verdict}, not accepted.`),
  );
  const started = yield* Effect.fromResult(begin(opened, { instance: "q1", seed: "7" }));

  return yield* Effect.fromResult(score(opened, { R2: posted }, started));
});

/**
 * Give the identifiers a stored record holds for one response.
 *
 * @param stored The stored record.
 * @param identifier The response.
 * @returns Its stored identifiers, none for NULL or a record that lacks it.
 */
const responseOf = (stored: ItemRecord, identifier: string): readonly unknown[] =>
  stored.responses[identifier]?.values.map((single) => single.value) ?? [];

describe("score", () => {
  it.effect("the correct choice scores 1 and a wrong one 0, each from a fresh record", () =>
    Effect.gen(function* scoresChoice() {
      const right = score(accepted, { RESPONSE: identifiers("single", "A") });
      assert.isTrue(Result.isResult(right));

      const stored = yield* Effect.fromResult(right);
      const wrong = yield* Effect.fromResult(
        score(accepted, { RESPONSE: identifiers("single", "B") }),
      );

      assert.deepStrictEqual(outcomeOf(stored, "SCORE"), [1]);
      assert.deepStrictEqual(outcomeOf(wrong, "SCORE"), [0]);
      assert.deepStrictEqual(
        [stored.attempt, stored.document, stored.item, stored.numAttempts],
        ["submitted", "items/scored.xml", "scored", 1],
      );
      assert.deepStrictEqual(stored.responses["RESPONSE"], {
        baseType: "identifier",
        cardinality: "single",
        values: [{ baseType: "identifier", value: "A" }],
      });
    }),
  );

  it.effect("given the record it returned, a second score counts 2 attempts, with no limit", () =>
    Effect.gen(function* countsAttempts() {
      const first = yield* Effect.fromResult(
        score(accepted, { RESPONSE: identifiers("single", "B") }),
      );
      const second = yield* Effect.fromResult(
        score(accepted, { RESPONSE: identifiers("single", "A") }, first),
      );
      const third = yield* Effect.fromResult(score(accepted, {}, second));

      assert.deepStrictEqual([first.numAttempts, second.numAttempts, third.numAttempts], [1, 2, 3]);
      assert.deepStrictEqual(outcomeOf(second, "SCORE"), [1]);
      assert.deepStrictEqual(outcomeOf(third, "SCORE"), [1]);
    }),
  );

  it("fails InvalidRecord, naming the response, when a stored response has another type than its declaration", () => {
    const stored = fresh(item, "");
    const retyped: ItemRecord = {
      ...stored,
      responses: {
        ...stored.responses,
        PICK: {
          baseType: "string",
          cardinality: "multiple",
          values: [{ baseType: "string", value: "A" }],
        },
      },
    };

    assert.deepStrictEqual(
      Option.map(failureOf(score(accepted, {}, retyped)), (failure) =>
        failure._tag === "InvalidRecord"
          ? [failure._tag, failure.issue.includes('"PICK"')]
          : [failure._tag],
      ),
      Option.some(["InvalidRecord", true]),
    );
  });

  it("fails InvalidRecord, naming the response, when a stored response is one the item does not score", () => {
    const stored = fresh(item, "");
    const extra: ItemRecord = {
      ...stored,
      responses: {
        ...stored.responses,
        EXTRA: {
          baseType: "identifier",
          cardinality: "single",
          values: [{ baseType: "identifier", value: "A" }],
        },
      },
    };

    assert.deepStrictEqual(
      Option.map(failureOf(score(accepted, {}, extra)), (failure) =>
        failure._tag === "InvalidRecord"
          ? [failure._tag, failure.issue.includes('"EXTRA"')]
          : [failure._tag],
      ),
      Option.some(["InvalidRecord", true]),
    );
  });

  it("carries a stored completionStatus into the attempt, and fails InvalidRecord, naming it, when it is not a single identifier", () => {
    const stored = fresh(item, "");
    const completed: ItemRecord = {
      ...stored,
      attempt: "submitted",
      numAttempts: 1,
      outcomes: {
        ...stored.outcomes,
        completionStatus: {
          baseType: "identifier",
          cardinality: "single",
          values: [{ baseType: "identifier", value: "completed" }],
        },
      },
    };
    const counted: ItemRecord = {
      ...stored,
      outcomes: {
        ...stored.outcomes,
        completionStatus: {
          baseType: "integer",
          cardinality: "single",
          values: [{ baseType: "integer", value: 1n }],
        },
      },
    };

    assert.deepStrictEqual(
      Option.map(Result.getSuccess(score(accepted, {}, completed)), (after) =>
        outcomeOf(after, "completionStatus"),
      ),
      Option.some(["completed"]),
    );
    assert.deepStrictEqual(
      Option.map(failureOf(score(accepted, {}, counted)), (failure) =>
        failure._tag === "InvalidRecord"
          ? [failure._tag, failure.issue.includes('"completionStatus"')]
          : [failure._tag],
      ),
      Option.some(["InvalidRecord", true]),
    );
  });

  it("fails RecordMismatch when the record belongs to another item", () => {
    const stored = fresh(other.item, "");

    assert.deepStrictEqual(
      Option.map(failureOf(score(accepted, {}, stored)), (failure) =>
        failure._tag === "RecordMismatch"
          ? {
              document: failure.document,
              item: failure.item,
              recordDocument: failure.recordDocument,
              recordItem: failure.recordItem,
            }
          : failure._tag,
      ),
      Option.some({
        document: "items/scored.xml",
        item: "scored",
        recordDocument: "items/other.xml",
        recordItem: "other",
      }),
    );
  });

  it("fails InvalidResponses naming the response: another base type, another cardinality, no value, no declaration", () => {
    const cases: readonly (readonly [Readonly<Record<string, Value>>, string, string])[] = [
      [
        { RESPONSE: { baseType: "string", cardinality: "single", values: [] } },
        "RESPONSE",
        "base-type",
      ],
      [{ RESPONSE: identifiers("multiple", "A") }, "RESPONSE", "cardinality"],
      [{ PICK: identifiers("single", "A", "B") }, "PICK", "not-a-value"],
      [{ OTHER: identifiers("single", "A") }, "OTHER", "undeclared"],
    ];

    for (const [responses, response, problem] of cases) {
      assert.deepStrictEqual(
        Option.map(failureOf(score(accepted, responses)), (failure) =>
          failure._tag === "InvalidResponses"
            ? [failure._tag, failure.response, failure.problem]
            : [failure._tag],
        ),
        Option.some(["InvalidResponses", response, problem]),
        problem,
      );
    }
  });

  it("fails InvalidResponses for a response the item does not score, naming file, record and no base type as unscored types, never duration (duration is scored)", () => {
    assert.deepStrictEqual(
      Option.map(failureOf(score(accepted, { EXTRA: identifiers("single", "A") })), (failure) =>
        failure._tag === "InvalidResponses"
          ? [
              failure._tag,
              failure.problem,
              Option.isNone(failure.expected),
              failure.message.includes('"EXTRA"'),
              failure.message.includes("file"),
              failure.message.includes("record"),
              failure.message.includes("duration"),
            ]
          : [failure._tag],
      ),
      Option.some(["InvalidResponses", "undeclared", true, true, true, true, false]),
    );
  });

  it.effect(
    "writes a record response's record into the stored records beside responses, keeps it on the next score, and refuses either kind posted for the other: cardinality",
    () =>
      Effect.gen(function* recordsBesideResponses() {
        const stored = yield* Effect.fromResult(
          score(recordAccepted, { RESPONSE: identifiers("single", "A"), RREC: recordAnswer }),
        );
        const decoded = stored;
        const again = yield* Effect.fromResult(score(recordAccepted, {}, stored));

        assert.deepStrictEqual(decoded.records, { RREC: recordAnswer });
        assert.isFalse(Object.hasOwn(decoded.responses, "RREC"));
        assert.deepStrictEqual(outcomeOf(stored, "SCORE"), [1]);
        assert.deepStrictEqual(again.records, { RREC: recordAnswer });
        assert.deepStrictEqual(
          responseFailureOf(score(recordAccepted, { TEXT: recordAnswer })),
          Option.some([
            "InvalidResponses",
            "TEXT",
            "cardinality",
            Option.some({ baseType: "string", cardinality: "single" }),
          ]),
        );
        assert.deepStrictEqual(
          responseFailureOf(
            score(recordAccepted, {
              RREC: {
                baseType: "string",
                cardinality: "single",
                values: [{ baseType: "string", value: "  12 " }],
              },
            }),
          ),
          Option.some([
            "InvalidResponses",
            "RREC",
            "cardinality",
            Option.some({ cardinality: "record" }),
          ]),
        );
      }),
  );

  it("refuses a host-built record with a repeated identifier, a non-NCName identifier or a file field: not-a-value, and stores no record", () => {
    const malformed = {
      "a field of base type file": {
        cardinality: "record",
        fields: [{ identifier: "upload", value: { baseType: "file", value: "a.txt" } }],
      },
      "an identifier that is not an NCName": {
        cardinality: "record",
        fields: [{ identifier: "1st", value: { baseType: "string", value: "a" } }],
      },
      "an identifier written twice": {
        cardinality: "record",
        fields: [
          { identifier: "stringValue", value: { baseType: "string", value: "a" } },
          { identifier: "stringValue", value: { baseType: "string", value: "b" } },
        ],
      },
    };

    for (const [problem, posted] of Object.entries(malformed)) {
      // @ts-expect-error -- each record breaks a rule of RecordValue that score must refuse.
      const attempt = score(recordAccepted, { RESPONSE: identifiers("single", "A"), RREC: posted });

      assert.isTrue(Result.isFailure(attempt), problem);
      assert.deepStrictEqual(
        responseFailureOf(attempt),
        Option.some([
          "InvalidResponses",
          "RREC",
          "not-a-value",
          Option.some({ cardinality: "record" }),
        ]),
        problem,
      );
    }
  });

  it.effect(
    "takes a single duration response of an item that declares it duration (duration is scored)",
    () =>
      Effect.gen(function* scoresDuration() {
        const elapsed: Value = {
          baseType: "duration",
          cardinality: "single",
          values: [{ baseType: "duration", value: 90.5 }],
        };
        const timed = acceptForTest({
          ...item,
          document: "items/timed.xml",
          identifier: "timed",
          responses: new Map([
            ...item.responses,
            [
              "ELAPSED",
              {
                areaMapping: Option.none(),
                baseType: "duration",
                cardinality: "single",
                correct: Option.none(),
                defaultValue: Option.none(),
                identifier: "ELAPSED",
                mapping: Option.none(),
              },
            ],
          ]),
        });
        const stored = yield* Effect.fromResult(score(timed, { ELAPSED: elapsed }));

        assert.deepStrictEqual(stored.responses["ELAPSED"], {
          baseType: "duration",
          cardinality: "single",
          values: [{ baseType: "duration", value: 90.5 }],
        });
      }),
  );

  it("fails ResponsesRefused with the messages when three identifiers break max-choices 2", () => {
    assert.deepStrictEqual(
      Option.map(
        failureOf(score(accepted, { PICK: identifiers("multiple", "A", "B", "C") })),
        (failure) => (failure._tag === "ResponsesRefused" ? failure.messages : [failure._tag]),
      ),
      Option.some([{ response: "PICK", text: message("en", "atMost", { n: "2" }) }]),
    );
  });

  it("fails UnknownIdentifierError given a stored record whose responses omit RESPONSE", () => {
    const stored = fresh(item, "");
    const omitted: ItemRecord = {
      ...stored,
      responses: Object.fromEntries(
        Object.entries(stored.responses).filter(([identifier]) => identifier !== "RESPONSE"),
      ),
    };

    assert.deepStrictEqual(
      Option.map(failureOf(score(accepted, {}, omitted)), (failure) =>
        failure._tag === "UnknownIdentifierError"
          ? [failure._tag, failure.identifier, failure.role]
          : [failure._tag],
      ),
      Option.some(["UnknownIdentifierError", "RESPONSE", "variable"]),
    );
  });

  it("refuses a record stored without completionStatus, which every record of the item holds from before its first attempt (section 2.2.2.3): InvalidRecord, naming the built-in", () => {
    const stored = fresh(item, "");
    const lacking: ItemRecord = {
      ...stored,
      outcomes: Object.fromEntries(
        Object.entries(stored.outcomes).filter(([identifier]) => identifier !== "completionStatus"),
      ),
    };

    assert.isTrue(Object.hasOwn(stored.outcomes, "completionStatus"));
    assert.deepStrictEqual(
      failureOf(score(accepted, { RESPONSE: identifiers("single", "A") }, lacking)).pipe(
        Option.map((found) =>
          found._tag === "InvalidRecord"
            ? [found._tag, found.issue.includes('built-in outcome "completionStatus"')]
            : [found._tag],
        ),
      ),
      Option.some(["InvalidRecord", true]),
    );
  });

  it.effect(
    "opens and scores an item whose processing reads qti-default of the built-in completionStatus through qti-is-null, beside numAttempts",
    () =>
      Effect.gen(function* scoresBuiltInDefaults() {
        const verdict = yield* admitted(
          "items/built-in-defaults.xml",
          new TextEncoder().encode(builtInDefaults),
        );
        const opened = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`The item is ${verdict.verdict}, not accepted.`),
        );

        assert.strictEqual(verdict.verdict, "accepted");
        assert.deepStrictEqual(opened.item.unsupported, []);
        assert.isTrue(Option.isSome(opened.item.processing), "the processing runs");

        const stored = yield* Effect.fromResult(score(opened, {}));

        assert.deepStrictEqual(outcomeOf(stored, "STATUS_NULL"), [true]);
        assert.deepStrictEqual(outcomeOf(stored, "ATTEMPTS_NULL"), [true]);
      }),
  );

  it.effect(
    "starts a response at its declared default: RESPONSE posted without its value scores as its default, with no record and over begin's record",
    () =>
      Effect.gen(function* scoresDefault() {
        const alone = yield* Effect.fromResult(score(defaulted, {}));
        const started = yield* Effect.fromResult(begin(defaulted, { instance: "q1", seed: "7" }));
        const over = yield* Effect.fromResult(score(defaulted, {}, started));

        assert.deepStrictEqual(alone.responses["RESPONSE"], {
          baseType: "identifier",
          cardinality: "single",
          values: [{ baseType: "identifier", value: "A" }],
        });
        assert.deepStrictEqual(outcomeOf(alone, "SCORE"), [1]);
        assert.deepStrictEqual(outcomeOf(over, "SCORE"), [1]);
      }),
  );

  it.effect(
    "scores against begin's record, its template-set correct response, and gives its seed, template values, correct responses and defaults back unchanged",
    () =>
      Effect.gen(function* carriesRecord() {
        const started = yield* Effect.fromResult(begin(templated, { instance: "q1", seed: "7" }));
        const right = yield* Effect.fromResult(
          score(templated, { RESPONSE: identifiers("single", "B") }, started),
        );
        const wrong = yield* Effect.fromResult(
          score(templated, { RESPONSE: identifiers("single", "A") }, right),
        );

        assert.deepStrictEqual(carriedOf(right), carriedOf(started));
        assert.deepStrictEqual(carriedOf(wrong), carriedOf(started));
        assert.deepStrictEqual(
          [started.seed, started.templates["T"]?.values.map((single) => single.value)],
          ["7", [7n]],
        );
        assert.deepStrictEqual(outcomeOf(right, "SCORE"), [1]);
        assert.deepStrictEqual(outcomeOf(wrong, "SCORE"), [0]);
      }),
  );

  it.effect(
    "fails InvalidRecord, naming the template variable, when a stored template value has another type than its declaration",
    () =>
      Effect.gen(function* refusesTemplate() {
        const started = yield* Effect.fromResult(begin(templated, { instance: "q1", seed: "7" }));
        const retyped: ItemRecord = {
          ...started,
          templates: {
            T: {
              baseType: "float",
              cardinality: "single",
              values: [{ baseType: "float", value: 7 }],
            },
          },
        };

        assert.deepStrictEqual(
          Option.map(failureOf(score(templated, {}, retyped)), (failure) =>
            failure._tag === "InvalidRecord"
              ? [failure._tag, failure.issue.includes('"T"')]
              : [failure._tag],
          ),
          Option.some(["InvalidRecord", true]),
        );
      }),
  );

  it.effect(
    "fails InvalidRecord at decode when the record of an item whose template processing runs holds no value for a declared template variable, and scores begin's own record",
    () =>
      Effect.gen(function* refusesTemplateGap() {
        const started = yield* Effect.fromResult(begin(templated, { instance: "q1", seed: "7" }));
        const emptied: ItemRecord = { ...started, templates: {} };
        const scored = yield* Effect.fromResult(
          score(templated, { RESPONSE: identifiers("single", "B") }, started),
        );
        const unrun = acceptForTest({
          ...templatedItem,
          document: "items/unrun.xml",
          identifier: "unrun",
          templateProcessing: { kind: "absent" },
        });
        const unrunStarted = yield* Effect.fromResult(begin(unrun, { instance: "q1", seed: "7" }));

        assert.deepStrictEqual(
          Option.map(
            failureOf(score(templated, { RESPONSE: identifiers("single", "B") }, emptied)),
            (failure) => (failure._tag === "InvalidRecord" ? [failure._tag] : [failure._tag]),
          ),
          Option.some(["InvalidRecord"]),
        );
        assert.deepStrictEqual(outcomeOf(scored, "SCORE"), [1]);
        assert.isTrue(
          Result.isSuccess(score(unrun, {}, { ...unrunStarted, templates: {} })),
          "an item whose template processing does not run takes a record with no template value",
        );
      }),
  );

  it("fails InvalidRecord for a mistyped stored completionStatus, naming the built-in rather than a declaration", () => {
    const stored = fresh(item, "");
    const counted: ItemRecord = {
      ...stored,
      outcomes: {
        ...stored.outcomes,
        completionStatus: {
          baseType: "integer",
          cardinality: "single",
          values: [{ baseType: "integer", value: 1n }],
        },
      },
    };
    const scored = failureOf(score(accepted, {}, counted));
    const fitted = Result.getFailure(fitting(item, counted));

    for (const failure of [scored, fitted]) {
      assert.deepStrictEqual(
        failure.pipe(
          Option.map((found) =>
            found._tag === "InvalidRecord"
              ? [
                  found._tag,
                  found.issue.includes('"completionStatus"'),
                  found.issue.includes("built-in"),
                  found.issue.includes("declares"),
                ]
              : [found._tag],
          ),
        ),
        Option.some(["InvalidRecord", true, true, false]),
      );
    }
  });
});

describe("score over the content a templated item's record shows", () => {
  it.effect(
    "scores a choice begin's record shows, and refuses one it hides unknownChoice inside ResponsesRefused",
    () =>
      Effect.gen(function* judgesChoices() {
        const started = yield* Effect.fromResult(begin(visible, { instance: "q1", seed: "7" }));
        const shown = yield* Effect.fromResult(
          score(visible, { RESPONSE: identifiers("single", "B") }, started),
        );

        assert.deepStrictEqual(outcomeOf(shown, "SCORE"), [1]);
        assert.deepStrictEqual(
          Option.map(
            failureOf(score(visible, { RESPONSE: identifiers("single", "C") }, started)),
            (failure) => (failure._tag === "ResponsesRefused" ? failure.messages : [failure._tag]),
          ),
          Option.some([{ response: "RESPONSE", text: message("en", "unknownChoice") }]),
        );
      }),
  );

  it.effect(
    "keeps the record's value of a response only a hidden template block binds, whether a value or a NULL is posted for it",
    () =>
      Effect.gen(function* keepsHidden() {
        const started = yield* Effect.fromResult(begin(visible, { instance: "q1", seed: "7" }));
        const unposted = yield* Effect.fromResult(score(visible, {}, started));
        const posted = yield* Effect.fromResult(score(visible, { HIDDEN: integer(9n) }, started));
        const nulled = yield* Effect.fromResult(
          score(visible, { HIDDEN: nullOf("integer", "single") }, started),
        );

        assert.deepStrictEqual(outcomeOf(unposted, "ECHO"), [3n]);
        assert.deepStrictEqual(outcomeOf(posted, "ECHO"), [3n]);
        assert.deepStrictEqual(outcomeOf(nulled, "ECHO"), [3n]);
        assert.deepStrictEqual(
          [posted.responses["HIDDEN"], nulled.responses["HIDDEN"]],
          [started.responses["HIDDEN"], started.responses["HIDDEN"]],
        );
      }),
  );

  it.effect(
    "takes back the responses begin's record stores, a hidden interaction's declared default among them, without refusing it",
    () =>
      Effect.gen(function* takesStored() {
        const started = yield* Effect.fromResult(begin(visible, { instance: "q1", seed: "7" }));
        const { responses } = started;
        const scored = yield* Effect.fromResult(score(visible, responses, started));

        assert.deepStrictEqual(outcomeOf(scored, "ECHO"), [3n]);
        assert.deepStrictEqual(outcomeOf(scored, "SCORE"), [0]);
      }),
  );
});

describe("score over a response an interaction the renderer shows as a notice binds", () => {
  it.effect(
    "stores the record's NULL for a response only a Custom Interaction, shown as a notice, in a hidden template inline binds, whatever is posted, and scores it",
    () =>
      Effect.gen(function* dropsHiddenNotice() {
        const stored = yield* scoredInBlock(
          blockDocument(customOfR2, "ordered", true),
          identifiers("ordered", "C1", "C2"),
        );

        assert.deepStrictEqual(responseOf(stored, "R2"), []);
        assert.deepStrictEqual(outcomeOf(stored, "SCORE"), [0]);
      }),
  );

  it.effect(
    "stores the record's NULL for a response only an Inline Choice in a hidden template inline binds, whatever is posted, and scores it",
    () =>
      Effect.gen(function* dropsHiddenChoice() {
        const stored = yield* scoredInBlock(
          blockDocument(inlineChoiceOfTwo, "single", true),
          identifiers("single", "C1"),
        );

        assert.deepStrictEqual(responseOf(stored, "R2"), []);
        assert.deepStrictEqual(outcomeOf(stored, "SCORE"), [0]);
      }),
  );

  it.effect(
    "scores the posted value of a response only an Order on content the page sees binds, in no template block",
    () =>
      Effect.gen(function* passesShownNotice() {
        const stored = yield* scoredInBlock(
          blockDocument(orderOfTwo, "ordered", false),
          identifiers("ordered", "C1", "C2"),
        );

        assert.deepStrictEqual(responseOf(stored, "R2"), ["C1", "C2"]);
        assert.deepStrictEqual(outcomeOf(stored, "SCORE"), [1]);
      }),
  );
});

/**
 * Write a hand-built item document whose single string response `RESPONSE`, bound to a Text Entry,
 * has a `qti-mapping` of default 0 over the given entries, and whose response processing sets the
 * float `SCORE` as the given element says.
 *
 * @param entries The mapping's `qti-map-entry` elements, in document order.
 * @param processing The item's `qti-response-processing` element.
 * @returns The item document.
 */
const mappedDocument = (
  entries: string,
  processing: string,
): string => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="mapped" title="Mapped" time-dependent="false" adaptive="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
    <qti-mapping default-value="0">${entries}</qti-mapping>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body><p>Which city? <qti-text-entry-interaction response-identifier="RESPONSE"/></p></qti-item-body>
  ${processing}
</qti-assessment-item>
`;

/**
 * Two map entries that both match `york` under `case-sensitive="false"`: `York` mapped to 2,
 * listed first, then `york` mapped to 1.
 */
const yorkFirst =
  '<qti-map-entry map-key="York" mapped-value="2" case-sensitive="false"/><qti-map-entry map-key="york" mapped-value="1" case-sensitive="false"/>';

/**
 * {@link yorkFirst}'s entries listed the other way round: `york` mapped to 1 first, then `York`
 * mapped to 2.
 */
const yorkSecond =
  '<qti-map-entry map-key="york" mapped-value="1" case-sensitive="false"/><qti-map-entry map-key="York" mapped-value="2" case-sensitive="false"/>';

/**
 * Response processing written inline that sets `SCORE` to `qti-map-response` of `RESPONSE`.
 */
const inlineMapping =
  '<qti-response-processing><qti-set-outcome-value identifier="SCORE"><qti-map-response identifier="RESPONSE"/></qti-set-outcome-value></qti-response-processing>';

/**
 * A hand-built item document whose single point response `RESPONSE` has a `qti-area-mapping` of
 * default 0 that lists a `rect` from (0, 0) to (10, 10) mapped to 2 before a `circle` of radius 3
 * about (5, 5) mapped to 1, so both hold (5, 5). Its response processing sets the float `SCORE` to
 * `qti-map-response-point` of `RESPONSE`.
 */
const overlappingAreas = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="areas" title="Areas" time-dependent="false" adaptive="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="point">
    <qti-area-mapping default-value="0">
      <qti-area-map-entry shape="rect" coords="0,0,10,10" mapped-value="2"/>
      <qti-area-map-entry shape="circle" coords="5,5,3" mapped-value="1"/>
    </qti-area-mapping>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body><p>Mark the point.</p></qti-item-body>
  <qti-response-processing>
    <qti-set-outcome-value identifier="SCORE"><qti-map-response-point identifier="RESPONSE"/></qti-set-outcome-value>
  </qti-response-processing>
</qti-assessment-item>
`;

/**
 * Construct a single string value.
 *
 * @param text The string.
 * @returns The value.
 */
const stringOf = (text: string): Value => ({
  baseType: "string",
  cardinality: "single",
  values: [{ baseType: "string", value: text }],
});

/**
 * Open a hand-built item document, which `check` must accept, and give the `SCORE` one attempt
 * that posts `RESPONSE` scores from a fresh record.
 *
 * @param document The item document.
 * @param posted The value posted for `RESPONSE`.
 * @returns `SCORE`'s stored values.
 */
const mappedScore = Effect.fnUntraced(function* mappedScore(document: string, posted: Value) {
  const verdict = yield* admitted("items/mapped.xml", new TextEncoder().encode(document));
  const opened = Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`The item is ${verdict.verdict}, not accepted.`),
  );
  const stored = yield* Effect.fromResult(score(opened, { RESPONSE: posted }));

  return outcomeOf(stored, "SCORE");
});

describe("score over a response value two map entries match", () => {
  it.effect(
    "maps york and YORK by the first listed map entry, York=2 before york=1 with case folded, and the entries reversed by york=1",
    () =>
      Effect.gen(function* mapsByFirstListed() {
        const listedFirst = mappedDocument(yorkFirst, inlineMapping);

        assert.deepStrictEqual(yield* mappedScore(listedFirst, stringOf("york")), [2]);
        assert.deepStrictEqual(yield* mappedScore(listedFirst, stringOf("YORK")), [2]);
        assert.deepStrictEqual(
          yield* mappedScore(mappedDocument(yorkSecond, inlineMapping), stringOf("york")),
          [1],
        );
      }),
  );

  it.effect("maps york by the first listed map entry under the map_response template too", () =>
    Effect.gen(function* mapsByTemplate() {
      const underTemplate = mappedDocument(
        yorkFirst,
        '<qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml"/>',
      );

      assert.deepStrictEqual(yield* mappedScore(underTemplate, stringOf("york")), [2]);
    }),
  );

  it.effect(
    "maps a point two areas hold by the first listed map entry of a qti-area-mapping, the rect before the circle",
    () =>
      Effect.gen(function* mapsByFirstArea() {
        const point: Value = {
          baseType: "point",
          cardinality: "single",
          values: [{ baseType: "point", value: [5n, 5n] }],
        };

        assert.deepStrictEqual(yield* mappedScore(overlappingAreas, point), [2]);
      }),
  );
});

/**
 * A hand-built item document whose `record` response `R`, which a Text Entry binds, sets the float
 * `SCORE` from its field `integerValue` through `qti-field-value`. `admitted` accepts it: a
 * `record` declaration types none of its fields, so no check can see that the field is an integer.
 */
const integerFieldDocument = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="field-typed" title="Field typed" time-dependent="false" adaptive="false">
  <qti-response-declaration identifier="R" cardinality="record"/>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body><p>How many? <qti-text-entry-interaction response-identifier="R"/></p></qti-item-body>
  <qti-response-processing>
    <qti-set-outcome-value identifier="SCORE"><qti-field-value field-identifier="integerValue"><qti-variable identifier="R"/></qti-field-value></qti-set-outcome-value>
  </qti-response-processing>
</qti-assessment-item>
`;

/**
 * A hand-built item document like {@link integerFieldDocument}, whose rule sets the integer outcome
 * `COUNT` from the `qti-sum` of `R`'s field `integerValue` and the float 2.0. `admitted` accepts
 * it: the sum's base type follows the field's, which a `record` declaration does not type, so no
 * check can see that the sum of an integer and a float is a float.
 */
const integerSumDocument = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="field-typed" title="Field typed" time-dependent="false" adaptive="false">
  <qti-response-declaration identifier="R" cardinality="record"/>
  <qti-outcome-declaration identifier="COUNT" cardinality="single" base-type="integer"/>
  <qti-item-body><p>How many? <qti-text-entry-interaction response-identifier="R"/></p></qti-item-body>
  <qti-response-processing>
    <qti-set-outcome-value identifier="COUNT"><qti-sum><qti-field-value field-identifier="integerValue"><qti-variable identifier="R"/></qti-field-value><qti-base-value base-type="float">2.0</qti-base-value></qti-sum></qti-set-outcome-value>
  </qti-response-processing>
</qti-assessment-item>
`;

/**
 * Decode a Text Entry's posted text into the record `R` takes, as a host's `decode` does.
 *
 * @param text The text the candidate typed.
 * @returns The record.
 */
const typedRecord = (text: string): RecordValue =>
  Result.getOrElse(
    decodeRecord([["field-typed.R", text]], { cardinality: "record", name: "field-typed.R" }),
    (failure) => assert.fail(`decode refused ${text}: ${failure._tag}`),
  );

describe("score over a record field set into a variable", () => {
  it.effect(
    "returns OutcomeMismatchError for SCORE, never a throw, when a float SCORE is set from a field of another base type: integerValue of 12; abc has no integerValue and scores SCORE NULL",
    () =>
      Effect.gen(function* fieldOfAnotherBaseType() {
        const verdict = yield* admitted(
          "items/field-typed.xml",
          new TextEncoder().encode(integerFieldDocument),
        );
        const opened = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`The item is ${verdict.verdict}, not accepted.`),
        );
        const mismatch = Option.getOrElse(failureOf(score(opened, { R: typedRecord("12") })), () =>
          assert.fail("score succeeded on 12"),
        );

        assert.deepStrictEqual(
          mismatch._tag === "OutcomeMismatchError"
            ? [mismatch._tag, mismatch.identifier, mismatch.actual, mismatch.expected]
            : [mismatch._tag],
          ["OutcomeMismatchError", "SCORE", "integer single", "float single"],
        );

        const stored = yield* Effect.fromResult(score(opened, { R: typedRecord("abc") }));

        assert.deepStrictEqual(stored.outcomes["SCORE"], {
          baseType: "float",
          cardinality: "single",
          values: [],
        });
      }),
  );

  it.effect(
    "type follows a field: an integer COUNT set from the qti-sum of integerValue and 2.0, which open accepts, returns OutcomeMismatchError for 12, never a throw",
    () =>
      Effect.gen(function* sumOverField() {
        const verdict = yield* admitted(
          "items/field-typed.xml",
          new TextEncoder().encode(integerSumDocument),
        );
        const opened = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`The item is ${verdict.verdict}, not accepted.`),
        );
        const returned = Result.getOrElse(
          Result.try(() => score(opened, { R: typedRecord("12") })),
          () => assert.fail("score threw instead of returning its failure"),
        );
        const mismatch = Option.getOrElse(failureOf(returned), () =>
          assert.fail("score succeeded on 12"),
        );

        assert.deepStrictEqual(
          mismatch._tag === "OutcomeMismatchError"
            ? [mismatch._tag, mismatch.identifier, mismatch.actual, mismatch.expected]
            : [mismatch._tag],
          ["OutcomeMismatchError", "COUNT", "float single", "integer single"],
        );
      }),
  );
});

describe("fitting", () => {
  it("accepts a record that holds the built-in completionStatus, and refuses one that lacks it or holds it of another type", () => {
    const record = fresh(item, "");
    const lacking: ItemRecord = {
      ...record,
      outcomes: Object.fromEntries(
        Object.entries(record.outcomes).filter(([identifier]) => identifier !== "completionStatus"),
      ),
    };
    const counted: ItemRecord = {
      ...record,
      outcomes: { ...record.outcomes, completionStatus: integer(1n) },
    };

    assert.isTrue(Object.hasOwn(record.outcomes, "completionStatus"));
    assert.deepStrictEqual(Result.getSuccess(fitting(item, record)), Option.some(record));
    for (const misfit of [lacking, counted]) {
      assert.deepStrictEqual(
        Option.map(Result.getFailure(fitting(item, misfit)), (failure) => [failure._tag]),
        Option.some(["InvalidRecord"]),
      );
    }
  });
});

describe("fitting a templated item", () => {
  /**
   * The record of {@link templatedItem}'s first attempt.
   */
  const started = Result.getOrThrow(firstAttempt(templatedItem, { instance: "", seed: "" }));

  /**
   * Give what `fitting` makes of a record, as its tag, stage and whether its issue names the
   * variable.
   *
   * @param record The record.
   * @param identifier The variable its issue should name.
   * @returns The record's fit, or the failure's tag, stage and whether its issue names it.
   */
  const fitOf = (record: ItemRecord, identifier: string) =>
    Result.match(fitting(templatedItem, record), {
      onFailure: (failure) => [failure._tag, failure.issue.includes(JSON.stringify(identifier))],
      onSuccess: () => ["fits"],
    });

  it("accepts the record of its first attempt", () => {
    assert.deepStrictEqual(
      Result.getSuccess(fitting(templatedItem, started)),
      Option.some(started),
    );
  });

  it("refuses a template value, a correct response or a default of another type than its declaration, or of no declared variable", () => {
    const refused = ["InvalidRecord", true];

    assert.deepStrictEqual(fitOf({ ...started, templates: { T: float(7) } }, "T"), refused);
    assert.deepStrictEqual(fitOf({ ...started, templates: { U: integer(7n) } }, "U"), refused);
    assert.deepStrictEqual(
      fitOf({ ...started, correct: { RESPONSE: integer(1n) } }, "RESPONSE"),
      refused,
    );
    assert.deepStrictEqual(
      fitOf({ ...started, correct: { OTHER: identifiers("single", "A") } }, "OTHER"),
      refused,
    );
    assert.deepStrictEqual(
      fitOf({ ...started, defaults: { SCORE: integer(1n) } }, "SCORE"),
      refused,
    );
    assert.deepStrictEqual(
      fitOf({ ...started, defaults: { NUMBER: float(1) } }, "NUMBER"),
      refused,
    );
    assert.deepStrictEqual(fitOf({ ...started, defaults: { NONE: float(1) } }, "NONE"), refused);
    assert.deepStrictEqual(
      fitOf({ ...started, defaults: { NUMBER: integer(3n), SCORE: float(0) } }, "NUMBER"),
      ["fits"],
    );
  });

  it("fits a correct response of numAttempts and a default of numAttempts and of completionStatus, as template processing sets them, and refuses one of another type than the built-in's, naming the built-in", () => {
    const held = {
      ...started,
      correct: { numAttempts: integer(7n) },
      defaults: { completionStatus: identifiers("single", "completed"), numAttempts: integer(5n) },
    };

    assert.deepStrictEqual(Result.getSuccess(fitting(templatedItem, held)), Option.some(held));
    assert.deepStrictEqual(
      Result.match(fitting(templatedItem, { ...started, defaults: { numAttempts: float(5) } }), {
        onFailure: (failure) => [
          failure._tag,
          failure.issue.includes('the built-in "numAttempts" takes'),
        ],
        onSuccess: () => ["fits"],
      }),
      ["InvalidRecord", true],
    );
    assert.deepStrictEqual(
      fitOf(
        { ...started, correct: { completionStatus: identifiers("single", "done") } },
        "completionStatus",
      ),
      ["InvalidRecord", true],
    );
  });
});
