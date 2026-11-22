/**
 * Feedback as a candidate sees it: `qti-modal-feedback`, `qti-feedback-block` and
 * `qti-feedback-inline` shown, hidden or withheld by the outcome values of the attempt a page
 * shows, through the host's own round trip: the record the database returns after an attempt,
 * `restore`, then `redact(…)` and the page it gives in review. Each case states the outcomes the
 * item's response processing sets for its answer, which the QTI database computes.
 *
 * The rule each case holds, from the information model: a
 * feedback element's outcome value matches its `identifier` when it holds a single of base type
 * identifier equal to it, as the value for single cardinality or as a member for multiple
 * (FeedbackBlock `show-hide`, 5.49.3, FeedbackInline 5.52.3, ModalFeedback 5.93.2); `show`, a
 * block's and an inline's default, shows it exactly when the value matches, and `hide` exactly when
 * it does not. Once response processing has run (`attempt` `submitted`) feedback reads the record's
 * outcomes; before, the body is the one "displayed to the candidate at the start of each attempt",
 * "with the visibility of any integrated feedback determined by the default values of the outcome
 * variables" (ItemSessionControl `allow-review`, 7.19.3). Modal feedback "is shown to the candidate
 * directly following response processing" (5.93), so never before. Hidden content never reaches the
 * page, and an interaction inside hidden feedback "must also be hidden. The candidate must not be
 * able to set or update the value of the associated response variables" (5.49).
 *
 * The 1EdTech cases read the corpus (tag `corpus`), and fail when it is missing.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import type { Configuration } from "#plate/configuration.ts";
import { qtiNamespace } from "#plate/document/source.ts";
import type { BodyNode } from "#plate/model/item.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { nullOf } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";
import { postings } from "#plate/postings.ts";
import { redact } from "#plate/redact.ts";
import { feedbackBlockTag } from "#plate/redact/walk.ts";
import type { Redacted } from "#plate/redact/walk.ts";
import { restore } from "#plate/restore.ts";
import { readCorpusFile, readCorpusPackage } from "#plate/test/corpus.ts";
import { float, identifier, identifiers, jsonField } from "#plate/test/fixtures.ts";
import { shownToCandidate, textOf } from "#plate/test/page.ts";
import { documentDigest, goldenRecords, recordOf } from "#plate/test/records.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The instance token every render here passes.
 */
const instance = "fb";

/**
 * The three feedback elements, as an item's verdict names a feature.
 */
const feedbackFeatures: ReadonlySet<string> = new Set([
  "qti-feedback-block",
  "qti-feedback-inline",
  "qti-modal-feedback",
]);

/**
 * Open an item's text, which `check` must accept with either accepting verdict.
 *
 * @param location The location `admitted` takes.
 * @param xml The item's XML.
 * @returns The accepted item.
 */
const openXml = Effect.fnUntraced(function* openXml(location: string, xml: string) {
  const verdict = yield* admitted(location, new TextEncoder().encode(xml));

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${location} is ${verdict.verdict}, not accepted`),
  );
});

/**
 * Open a corpus item as it is, which `check` must accept.
 *
 * @param location The item's path under the corpus root.
 * @returns The accepted item.
 */
const openCorpusItem = Effect.fnUntraced(function* openCorpusItem(location: string) {
  const bytes = yield* readCorpusFile(location);

  return yield* openXml(location, new TextDecoder().decode(bytes));
});

/**
 * What one page shows: the redacted item, the payload the page is given, its text, its notices and
 * its modal feedback.
 */
interface Shown {
  /**
   * The text of each modal feedback the page shows, in order.
   */
  readonly modal: readonly string[];
  /**
   * The feature of each notice the page shows, in its body and its modal feedback, in order.
   */
  readonly notices: readonly string[];
  readonly redacted: Redacted;
  /**
   * The page's text, its body's then its modal feedback's, whitespace collapsed.
   */
  readonly text: string;
}

/**
 * List the body nodes below some nodes, each before its descendants, an element's children and a
 * Choice's choices' content among them.
 *
 * @param nodes The nodes.
 * @returns Every node they hold.
 */
const nodesIn = (nodes: readonly BodyNode[]): readonly BodyNode[] =>
  nodes.flatMap((node): readonly BodyNode[] => {
    if (node.kind === "element") {
      return [node, ...nodesIn(node.children)];
    }

    return node.kind === "choice"
      ? [node, ...nodesIn(node.choices.flatMap((choice) => choice.content))]
      : [node];
  });

/**
 * Tell whether a body node is an Inline Choice or holds one below its elements.
 *
 * @param node The node.
 * @returns Whether an Inline Choice is at or below it.
 */
const isInlineChoiceIn = (node: BodyNode): boolean =>
  node.kind === "inline-choice" ||
  (node.kind === "element" && node.children.some(isInlineChoiceIn));

/**
 * Build the page of an item as an app shows it to a candidate: `redact` by the record, which the
 * server shell renders node for node.
 *
 * @param accepted The accepted item.
 * @param configuration The configuration.
 * @param record The record `redact` shows the item by; none for no record.
 * @returns What the page shows.
 */
const shownBy = (accepted: Accepted, configuration: Configuration, record?: ItemRecord): Shown => {
  const redacted = redact(accepted, { ...shownToCandidate, configuration }, record);
  const modal = redacted.modalFeedback.map((feedback) => feedback.content);

  return {
    modal: modal.map(textOf),
    notices: nodesIn([...redacted.body, ...modal.flat()]).flatMap((node) =>
      node.kind === "unsupported" ? [node.feature] : [],
    ),
    redacted,
    text: textOf([...redacted.body, ...modal.flat()]),
  };
};

/**
 * Give an item's record before its first attempt, as the database's take returns it, and restore
 * it, as a host shows an item's first attempt: for a corpus item, the golden recording's first
 * record of its document (`goldenRecords`), which holds every outcome and response at the start the
 * database gives it, the database grader being held to the recording; for an item the corpus does
 * not hold, as a hand-built grid, no value (`recordOf`), each case stating the values it shows.
 *
 * @param accepted The accepted item.
 * @returns The record, attempt `none`.
 */
const begun = Effect.fnUntraced(function* begun(accepted: Accepted) {
  const bytes = yield* Effect.option(readCorpusFile(accepted.item.document));
  const golden = yield* goldenRecords;
  const start = Option.match(bytes, {
    onNone: () => recordOf(),
    onSome: (read) =>
      Option.getOrElse(Option.fromUndefinedOr(golden.get(documentDigest(read))?.[0]), () =>
        assert.fail(`the golden recording holds no record of ${accepted.item.document}`),
      ),
  });

  return restore(accepted, start).record;
});

/**
 * Give the record an attempt leaves, as the database returns it after grading the answer, and
 * restore it, as a host does between the post and the next page: the item's first record with the
 * answer's responses and the outcomes its response processing set.
 *
 * @param accepted The accepted item.
 * @param responses The responses posted.
 * @param outcomes The outcomes the item's response processing sets for them.
 * @returns The restored record and responses.
 */
const answered = Effect.fnUntraced(function* answered(
  accepted: Accepted,
  responses: Readonly<Record<string, Value>>,
  outcomes: Readonly<Record<string, Value>>,
) {
  const start = yield* begun(accepted);

  return restore(accepted, {
    ...start,
    attempt: "submitted",
    outcomes: { ...start.outcomes, ...outcomes },
    responses: { ...start.responses, ...responses },
  });
});

/**
 * Give a record whose response processing has run with an outcome set, or left out.
 *
 * @param record The record.
 * @param outcome The outcome's identifier.
 * @param value Its value; none to leave the outcome out of the record.
 * @returns The record, attempt `submitted`.
 */
const submittedWith = (
  record: ItemRecord,
  outcome: string,
  value: Option.Option<Value>,
): ItemRecord => ({
  ...record,
  attempt: "submitted",
  outcomes: Option.match(value, {
    onNone: () =>
      Object.fromEntries(Object.entries(record.outcomes).filter(([key]) => key !== outcome)),
    onSome: (held) => ({ ...record.outcomes, [outcome]: held }),
  }),
});

/**
 * The BPIG items the information model's feedback examples are, by corpus path.
 */
const bpig = {
  adaptive: "QTI3_BPIG_Examples/items/Example05-feedbackBlock-adaptive.xml",
  inline: "QTI3_BPIG_Examples/items/Example02-feedbackInline.xml",
  modal: "QTI3_BPIG_Examples/items/Example01-modalFeedback.xml",
  solution: "QTI3_BPIG_Examples/items/Example03-feedbackBlock-solution.xml",
  templateBlock: "QTI3_BPIG_Examples/items/Example04-feedbackBlock-templateBlock.xml",
} as const;

describe("the BPIG feedback examples", { tags: ["corpus"] }, () => {
  it.effect(
    "Example01-modalFeedback shows only correct after the right answer, only incorrect after a wrong one, and neither before scoring",
    () =>
      Effect.gen(function* modalExample() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openCorpusItem(bpig.modal);
        const right = yield* answered(
          accepted,
          { RESPONSE: identifier("true") },
          { FEEDBACK: identifier("correct") },
        );
        const wrong = yield* answered(
          accepted,
          { RESPONSE: identifier("false") },
          { FEEDBACK: identifier("incorrect") },
        );

        assert.deepStrictEqual(accepted.item.unsupported, []);
        assert.deepStrictEqual(shownBy(accepted, configuration, right.record).modal, ["correct"]);
        assert.deepStrictEqual(shownBy(accepted, configuration, wrong.record).modal, ["incorrect"]);
        assert.deepStrictEqual(shownBy(accepted, configuration, yield* begun(accepted)).modal, []);
        assert.deepStrictEqual(shownBy(accepted, configuration).modal, []);
      }),
  );

  it.effect(
    "Example01-modalFeedback shows the same modal feedback in answering as in review, with no title when it has none",
    () =>
      Effect.gen(function* modalModes() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openCorpusItem(bpig.modal);
        const right = yield* answered(
          accepted,
          { RESPONSE: identifier("true") },
          { FEEDBACK: identifier("correct") },
        );
        const redacted = redact(accepted, { ...shownToCandidate, configuration }, right.record);
        const answering = redacted;
        const reviewed = shownBy(accepted, configuration, right.record);

        assert.deepStrictEqual(
          answering.modalFeedback.map((feedback) => textOf(feedback.content)),
          ["correct"],
        );
        assert.deepStrictEqual(reviewed.modal, ["correct"]);
        assert.deepStrictEqual(
          reviewed.redacted.modalFeedback.map((feedback) => feedback.title),
          [Option.none()],
        );
      }),
  );

  it.effect(
    "Example02-feedbackInline shows neither choice's inline feedback before scoring, only That's correct after true, and only That's not correct after false",
    () =>
      Effect.gen(function* inlineExample() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openCorpusItem(bpig.inline);
        const right = yield* answered(
          accepted,
          { RESPONSE: identifier("true") },
          { FEEDBACK: identifier("true") },
        );
        const wrong = yield* answered(
          accepted,
          { RESPONSE: identifier("false") },
          { FEEDBACK: identifier("false") },
        );
        const shownRight = shownBy(accepted, configuration, right.record).text;
        const shownWrong = shownBy(accepted, configuration, wrong.record).text;

        assert.deepStrictEqual(accepted.item.unsupported, []);
        for (const before of [
          shownBy(accepted, configuration).text,
          shownBy(accepted, configuration, yield* begun(accepted)).text,
        ]) {
          assert.notInclude(before, "That's");
          assert.include(before, "True");
        }

        assert.include(shownRight, "That's correct");
        assert.notInclude(shownRight, "That's not correct");
        assert.include(shownWrong, "That's not correct");
        assert.notInclude(shownWrong, "That's correct");
      }),
  );

  it.effect(
    "Example03-feedbackBlock-solution shows a block or inline when the multiple FEEDBACK contains its identifier, and its solution button's block until processing clears ASKSOLUTION",
    () =>
      Effect.gen(function* solutionExample() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openCorpusItem(bpig.solution);
        const start = shownBy(accepted, configuration, yield* begun(accepted));
        const ended = {
          ASKSOLUTION: identifier("null"),
          completionStatus: identifier("completed"),
        };
        const right = yield* answered(
          accepted,
          { RESPONSE: float(7.389) },
          { ...ended, FEEDBACK: identifiers("CORRECT"), SCORE: float(2) },
        );
        const wrong = yield* answered(
          accepted,
          { RESPONSE: float(1) },
          { ...ended, FEEDBACK: identifiers("INCORRECT"), SCORE: float(0) },
        );
        const shownRight = shownBy(accepted, configuration, right.record);
        const shownWrong = shownBy(accepted, configuration, wrong.record);
        const solution = shownBy(
          accepted,
          configuration,
          submittedWith(
            right.record,
            "FEEDBACK",
            Option.some(identifiers("SOLUTION", "SEEN-SOLUTION")),
          ),
        );

        // At the start, ASKSOLUTION holds its default, asksolution, and FEEDBACK is NULL.
        assert.include(
          start.redacted.responses.map((response) => response.identifier),
          "SOLREQUEST",
          "the response the shown asksolution block's End Attempt binds is given",
        );
        assert.notInclude(start.text, "Correct");
        assert.notInclude(start.text, "No, that is not the correct answer");
        assert.notInclude(start.text, "your score for this question will be 0");

        assert.include(shownRight.text, "Correct");
        assert.notInclude(shownRight.text, "No, that is not the correct answer");
        assert.include(shownWrong.text, "No, that is not the correct answer");
        for (const scored of [shownRight, shownWrong]) {
          assert.notInclude(
            scored.redacted.responses.map((response) => response.identifier),
            "SOLREQUEST",
            "the response only the hidden block binds is hidden-only",
          );
        }

        assert.include(solution.text, "your score for this question will be 0");
        assert.notInclude(solution.text, "Correct");
        assert.notInclude(solution.text, "No, that is not the correct answer");
      }),
  );

  it.effect(
    "Example04-feedbackBlock-templateBlock withholds every feedback block and inline with no record, naming none of the template parts inside them, and under its first record shows only the blocks its outcome defaults show",
    () =>
      Effect.gen(function* templateBlockExample() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openCorpusItem(bpig.templateBlock);
        const withheld = shownBy(accepted, configuration);
        const start = shownBy(accepted, configuration, yield* begun(accepted));

        assert.notInclude(withheld.text, "Incorrect");

        assert.include(
          start.redacted.responses.map((response) => response.identifier),
          "SOLREQUEST",
          "the response the shown asksolution block's End Attempt binds is given",
        );
        for (const hidden of [
          "OK",
          "Not far off",
          "Incorrect",
          "here is the solution",
          "Sine Rule",
        ]) {
          assert.notInclude(start.text, hidden);
        }
      }),
  );

  it.effect(
    "Example05-feedbackBlock-adaptive posts only the interaction of the part its BODY shows: RESPONSE1 at the start, the drop-downs of option2 after choosing them",
    () =>
      Effect.gen(function* adaptiveExample() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openCorpusItem(bpig.adaptive);
        const start = yield* begun(accepted);
        const chosen = yield* answered(
          accepted,
          { RESPONSE1: identifier("OPTION2") },
          { BODY: identifiers("part2", "option2") },
        );
        const posted = (record: ItemRecord): readonly string[] =>
          postings(accepted, instance, record).map((posting) => posting.identifier);
        const second = shownBy(accepted, configuration, chosen.record).text;

        assert.deepStrictEqual(posted(start), ["RESPONSE1"]);
        assert.deepStrictEqual(posted(chosen.record), ["RESPONSE22", "RESPONSE23", "RESPONSE24"]);
        assert.include(second, "OK, this is the type of input you have chosen");
        assert.notInclude(second, "Which of these input methods");
        assert.notInclude(second, "Choose the correct saying");
      }),
  );
});

/**
 * The cardinality of the outcome a grid item's feedback reads.
 */
type GridCardinality = "multiple" | "single";

/**
 * The grid's elements, each by the marker its content holds: a block, an inline and a modal
 * feedback, each with `show-hide` `show` (the block's and the inline's left to the default) and
 * `hide`, all over the outcome `FB` and the identifier `A`.
 */
const gridMarkers = [
  "BLOCKSHOW",
  "BLOCKHIDE",
  "INLINESHOW",
  "INLINEHIDE",
  "MODALSHOW",
  "MODALHIDE",
] as const;

/**
 * Write the grid item: {@link gridMarkers}' six elements over `FB`, an identifier outcome of a
 * cardinality, with a declared default or none.
 *
 * @param cardinality `FB`'s cardinality.
 * @param initial `FB`'s declared default, none for no default.
 * @returns The item's XML.
 */
const gridXml = (cardinality: GridCardinality, initial: Option.Option<string>): string =>
  [
    `<qti-assessment-item xmlns="${qtiNamespace}" identifier="grid" title="Grid" adaptive="false" time-dependent="false">`,
    `<qti-outcome-declaration identifier="FB" cardinality="${cardinality}" base-type="identifier">`,
    Option.match(initial, {
      onNone: () => "",
      onSome: (value) => `<qti-default-value><qti-value>${value}</qti-value></qti-default-value>`,
    }),
    "</qti-outcome-declaration>",
    "<qti-item-body>",
    '<qti-feedback-block outcome-identifier="FB" identifier="A"><qti-content-body><p>BLOCKSHOW</p></qti-content-body></qti-feedback-block>',
    '<qti-feedback-block outcome-identifier="FB" identifier="A" show-hide="hide"><qti-content-body><p>BLOCKHIDE</p></qti-content-body></qti-feedback-block>',
    '<p>Inline: <qti-feedback-inline outcome-identifier="FB" identifier="A">INLINESHOW</qti-feedback-inline> <qti-feedback-inline outcome-identifier="FB" identifier="A" show-hide="hide">INLINEHIDE</qti-feedback-inline></p>',
    "</qti-item-body>",
    '<qti-modal-feedback outcome-identifier="FB" identifier="A" show-hide="show"><qti-content-body>MODALSHOW</qti-content-body></qti-modal-feedback>',
    '<qti-modal-feedback outcome-identifier="FB" identifier="A" show-hide="hide"><qti-content-body>MODALHIDE</qti-content-body></qti-modal-feedback>',
    "</qti-assessment-item>",
  ].join("");

/**
 * The values the grid sets `FB` to, by its cardinality: NULL, `A`, an identifier that matches no
 * element, and for multiple, `A` among others, and others without `A`.
 */
const gridValues: Readonly<Record<GridCardinality, readonly Value[]>> = {
  multiple: [
    identifiers(),
    identifiers("A"),
    identifiers("B"),
    identifiers("B", "A"),
    identifiers("B", "C"),
  ],
  single: [
    { baseType: "identifier", cardinality: "single", values: [] },
    identifier("A"),
    identifier("B"),
  ],
};

/**
 * Decide, as the rule says and never from plate's code, which of the grid's markers the page shows
 * for a value of `FB`: `A` matches when the value holds it as itself or a member; `show` shows its
 * element exactly when it matches and `hide` exactly when it does not; and a modal feedback only
 * once response processing has run.
 *
 * @param value `FB`'s value.
 * @param submitted Whether response processing has run in the attempt shown.
 * @returns The markers shown, in {@link gridMarkers}' order.
 */
const gridExpected = (value: Value, submitted: boolean): readonly string[] => {
  const matches = value.values.some(
    (single) => single.baseType === "identifier" && single.value === "A",
  );

  return gridMarkers.filter(
    (marker) =>
      (submitted || !marker.startsWith("MODAL")) && (marker.endsWith("SHOW") ? matches : !matches),
  );
};

/**
 * Give the grid's markers a render shows.
 *
 * @param shown The render.
 * @returns The markers, in {@link gridMarkers}' order.
 */
const gridShown = (shown: Shown): readonly string[] =>
  gridMarkers.filter((marker) => shown.text.includes(marker));

describe("feedback visibility over a grid of values", () => {
  for (const cardinality of ["single", "multiple"] as const) {
    it.effect(
      `shows each block, inline and modal feedback over a ${cardinality} FB exactly as the rule decides, for every value once processing has run`,
      () =>
        Effect.gen(function* gridSubmitted() {
          const configuration = yield* configure({ seed: "" });
          const accepted = yield* openXml("items/grid.xml", gridXml(cardinality, Option.none()));
          const record = yield* begun(accepted);

          assert.deepStrictEqual(accepted.item.unsupported, []);
          for (const value of gridValues[cardinality]) {
            const shown = shownBy(
              accepted,
              configuration,
              submittedWith(record, "FB", Option.some(value)),
            );

            assert.deepStrictEqual(
              gridShown(shown),
              gridExpected(value, true),
              JSON.stringify(value.values),
            );
          }
        }),
    );

    it.effect(
      `before processing runs, shows the blocks and inlines a ${cardinality} FB at the database's start value shows, and no modal feedback; with no record, none`,
      () =>
        Effect.gen(function* gridBefore() {
          const configuration = yield* configure({ seed: "" });
          const accepted = yield* openXml("items/grid.xml", gridXml(cardinality, Option.none()));

          assert.deepStrictEqual(gridShown(shownBy(accepted, configuration)), []);
          for (const value of gridValues[cardinality]) {
            assert.deepStrictEqual(
              gridShown(shownBy(accepted, configuration, recordOf({ outcomes: { FB: value } }))),
              gridExpected(value, false),
              `attempt none, FB ${JSON.stringify(value.values)}`,
            );
          }
        }),
    );
  }

  it.effect(
    "withholds a block and an inline whose outcome a submitted record holds no value of as their notices, and a modal feedback as a section holding only its notice",
    () =>
      Effect.gen(function* withheldGrid() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openXml("items/grid.xml", gridXml("single", Option.none()));
        const shown = shownBy(
          accepted,
          configuration,
          submittedWith(yield* begun(accepted), "FB", Option.none()),
        );
        assert.deepStrictEqual(gridShown(shown), []);
        assert.deepStrictEqual(
          shown.redacted.modalFeedback.map((feedback) => [
            feedback.content.map((node) =>
              node.kind === "unsupported" ? node.feature : node.kind,
            ),
            feedback.title,
          ]),
          [
            [["qti-modal-feedback"], Option.none()],
            [["qti-modal-feedback"], Option.none()],
          ],
        );
      }),
  );
});

/**
 * Write an item whose template processing runs: it sets `FB`'s default to `B` over its declared
 * `A`, and it shows a feedback block for each.
 *
 * @returns The item's XML.
 */
const templatedXml = (): string =>
  [
    `<qti-assessment-item xmlns="${qtiNamespace}" identifier="templated" title="Templated" adaptive="false" time-dependent="false">`,
    '<qti-outcome-declaration identifier="FB" cardinality="single" base-type="identifier"><qti-default-value><qti-value>A</qti-value></qti-default-value></qti-outcome-declaration>',
    '<qti-template-processing><qti-set-default-value identifier="FB"><qti-base-value base-type="identifier">B</qti-base-value></qti-set-default-value></qti-template-processing>',
    "<qti-item-body>",
    '<qti-feedback-block outcome-identifier="FB" identifier="A"><qti-content-body><p>SHOWS-A</p></qti-content-body></qti-feedback-block>',
    '<qti-feedback-block outcome-identifier="FB" identifier="B"><qti-content-body><p>SHOWS-B</p></qti-content-body></qti-feedback-block>',
    "</qti-item-body>",
    "</qti-assessment-item>",
  ].join("");

/**
 * Write an adaptive item whose feedback holds content plate shows as a notice, an Upload
 * interaction, and nests: a feedback inline in a feedback block, and a feedback block in a template
 * block, each over its own outcome.
 *
 * @returns The item's XML.
 */
const nestedXml = (): string =>
  [
    `<qti-assessment-item xmlns="${qtiNamespace}" identifier="nested" title="Nested" adaptive="true" time-dependent="false">`,
    '<qti-response-declaration identifier="WORK" cardinality="single" base-type="file"/>',
    '<qti-outcome-declaration identifier="OUTER" cardinality="single" base-type="identifier"/>',
    '<qti-outcome-declaration identifier="INNER" cardinality="single" base-type="identifier"/>',
    '<qti-template-declaration identifier="T" cardinality="single" base-type="identifier"><qti-default-value><qti-value>on</qti-value></qti-default-value></qti-template-declaration>',
    "<qti-item-body>",
    '<qti-feedback-block outcome-identifier="OUTER" identifier="O" id="tip" class="tip" xml:lang="fr"><qti-content-body>',
    '<p>OUTER-TEXT <qti-feedback-inline outcome-identifier="INNER" identifier="I">INNER-TEXT</qti-feedback-inline></p>',
    '<qti-upload-interaction response-identifier="WORK"/>',
    "</qti-content-body></qti-feedback-block>",
    '<qti-template-block template-identifier="T" identifier="on"><qti-content-body>',
    '<qti-feedback-block outcome-identifier="INNER" identifier="I"><qti-content-body><p>TEMPLATED-TEXT</p></qti-content-body></qti-feedback-block>',
    "</qti-content-body></qti-template-block>",
    "</qti-item-body>",
    "</qti-assessment-item>",
  ].join("");

/**
 * The record {@link nestedXml}'s take returns: its template value `T` at its declared `on`, and
 * both outcomes NULL.
 */
const nestedStart: ItemRecord = recordOf({
  outcomes: { INNER: nullOf("identifier", "single"), OUTER: nullOf("identifier", "single") },
  templates: { T: identifier("on") },
});

/**
 * Give the markers of {@link nestedXml}'s three feedback contents a render shows.
 *
 * @param shown The render.
 * @returns The markers, in document order.
 */
const nestedShown = (shown: Shown): readonly string[] =>
  ["OUTER-TEXT", "INNER-TEXT", "TEMPLATED-TEXT"].filter((marker) => shown.text.includes(marker));

/**
 * Give the identifiers of the responses a redaction lists.
 *
 * @param redacted The redacted item.
 * @returns The identifiers, in its order.
 */
const responsesOf = (redacted: Redacted): readonly string[] =>
  redacted.responses.map((response) => response.identifier);

describe("feedback in its place", () => {
  it.effect(
    "before an attempt, feedback reads the outcome the take's record holds, the default template processing set, and with no record an item with template processing withholds every block",
    () =>
      Effect.gen(function* templatedDefault() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openXml("items/templated.xml", templatedXml());
        const { record } = restore(
          accepted,
          recordOf({ defaults: { FB: identifier("B") }, outcomes: { FB: identifier("B") } }),
        );
        const started = shownBy(accepted, configuration, record);
        const unrecorded = shownBy(accepted, configuration);

        assert.include(started.text, "SHOWS-B");
        assert.notInclude(started.text, "SHOWS-A");
        assert.notInclude(unrecorded.text, "SHOWS-A");
        assert.notInclude(unrecorded.text, "SHOWS-B");
      }),
  );

  it.effect(
    "shows a feedback inline inside a feedback block only where both show, and a feedback block inside a template block only where the template block shows",
    () =>
      Effect.gen(function* nested() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openXml("items/nested.xml", nestedXml());
        const { record } = restore(accepted, nestedStart);
        const both = submittedWith(
          submittedWith(record, "OUTER", Option.some(identifier("O"))),
          "INNER",
          Option.some(identifier("I")),
        );
        const innerOnly = submittedWith(both, "OUTER", Option.some(identifier("X")));
        const templateOff: ItemRecord = { ...both, templates: { T: identifier("off") } };

        assert.deepStrictEqual(nestedShown(shownBy(accepted, configuration, both)), [
          "OUTER-TEXT",
          "INNER-TEXT",
          "TEMPLATED-TEXT",
        ]);
        assert.deepStrictEqual(nestedShown(shownBy(accepted, configuration, innerOnly)), [
          "TEMPLATED-TEXT",
        ]);
        assert.deepStrictEqual(nestedShown(shownBy(accepted, configuration, templateOff)), [
          "OUTER-TEXT",
          "INNER-TEXT",
        ]);
      }),
  );

  it.effect(
    "lists the response of a notice inside a shown feedback block, and not one inside a hidden block, whose response is then hidden-only",
    () =>
      Effect.gen(function* noticeInFeedback() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openXml("items/nested.xml", nestedXml());
        const { record } = restore(accepted, nestedStart);
        const shown = shownBy(
          accepted,
          configuration,
          submittedWith(record, "OUTER", Option.some(identifier("O"))),
        );
        const hidden = shownBy(
          accepted,
          configuration,
          submittedWith(record, "OUTER", Option.some(identifier("X"))),
        );

        assert.include(responsesOf(shown.redacted), "WORK");
        assert.notInclude(responsesOf(hidden.redacted), "WORK");
      }),
  );

  it.effect(
    "gives a shown block's content in its place inside its own element, which carries its identifier alone, so the page gets none of its id, class or lang, and the redacted JSON no hidden content",
    () =>
      Effect.gen(function* contentInPlace() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openXml("items/nested.xml", nestedXml());
        const { record } = restore(accepted, nestedStart);
        const shown = shownBy(
          accepted,
          configuration,
          submittedWith(record, "OUTER", Option.some(identifier("O"))),
        );
        const hidden = shownBy(
          accepted,
          configuration,
          submittedWith(record, "OUTER", Option.some(identifier("X"))),
        );
        const json = JSON.stringify(hidden.redacted, jsonField);

        const blocks = shown.redacted.body.flatMap((node) =>
          node.kind === "element" && node.tag === feedbackBlockTag ? [node] : [],
        );

        assert.include(shown.text, "OUTER-TEXT");
        assert.deepStrictEqual(
          blocks.map((block) => [block.attributes, textOf(block.children).includes("OUTER-TEXT")]),
          [[[{ name: "identifier", value: "O" }], true]],
          "the shown block is one element holding its content, with its identifier alone",
        );
        assert.isFalse(
          nodesIn(shown.redacted.body).some(
            (node) =>
              node.kind === "element" &&
              node.attributes.some(
                ({ name, value }) =>
                  (name === "id" && value.endsWith("tip")) ||
                  (name === "class" && value.includes("tip")) ||
                  ((name === "lang" || name === "xml:lang") && value === "fr"),
              ),
          ),
          "the block's own id, class and lang are not given",
        );
        assert.notInclude(hidden.text, "OUTER-TEXT");
        assert.notInclude(json, "OUTER-TEXT");
        assert.notInclude(json, "feedback");
      }),
  );

  it.effect(
    "gives a titled modal feedback its title, and shows a hide modal feedback once processing has run and not before",
    () =>
      Effect.gen(function* titledModal() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openXml(
          "items/titled.xml",
          [
            `<qti-assessment-item xmlns="${qtiNamespace}" identifier="titled" title="Titled" adaptive="false" time-dependent="false">`,
            '<qti-outcome-declaration identifier="FB" cardinality="single" base-type="identifier"/>',
            "<qti-item-body><p>Body</p></qti-item-body>",
            '<qti-modal-feedback outcome-identifier="FB" identifier="never" show-hide="hide" title="Well done"><qti-content-body><p>KEEP GOING</p></qti-content-body></qti-modal-feedback>',
            "</qti-assessment-item>",
          ].join(""),
        );
        const record = yield* begun(accepted);
        const after = shownBy(
          accepted,
          configuration,
          submittedWith(record, "FB", Option.some(identifier("other"))),
        );

        assert.deepStrictEqual(shownBy(accepted, configuration).modal, []);
        assert.deepStrictEqual(shownBy(accepted, configuration, record).modal, []);
        assert.deepStrictEqual(after.modal, ["KEEP GOING"]);
        assert.deepStrictEqual(
          after.redacted.modalFeedback.map((feedback) => feedback.title),
          [Option.some("Well done")],
        );
      }),
  );

  it.effect(
    "shows a feedback inline inside an Inline Choice's choice by its outcome, the interaction built",
    () =>
      Effect.gen(function* inlineChoiceFeedback() {
        const configuration = yield* configure({ seed: "" });
        const accepted = yield* openXml(
          "items/picker.xml",
          [
            `<qti-assessment-item xmlns="${qtiNamespace}" identifier="picker" title="Picker" adaptive="false" time-dependent="false">`,
            '<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/>',
            '<qti-outcome-declaration identifier="FB" cardinality="single" base-type="identifier"/>',
            "<qti-item-body><p>Pick ",
            '<qti-inline-choice-interaction response-identifier="RESPONSE">',
            '<qti-inline-choice identifier="a">Ant<qti-feedback-inline outcome-identifier="FB" identifier="a"> (six legs)</qti-feedback-inline></qti-inline-choice>',
            '<qti-inline-choice identifier="b">Bee</qti-inline-choice>',
            "</qti-inline-choice-interaction></p></qti-item-body>",
            "</qti-assessment-item>",
          ].join(""),
        );
        const record = yield* begun(accepted);
        const before = shownBy(accepted, configuration, record);
        const after = shownBy(
          accepted,
          configuration,
          submittedWith(record, "FB", Option.some(identifier("a"))),
        );

        assert.deepStrictEqual(accepted.item.unsupported, []);
        assert.isTrue(before.redacted.body.some(isInlineChoiceIn));
        assert.notInclude(before.text, "six legs");
        assert.include(after.text, "Ant (six legs)");
      }),
  );
});

/**
 * The feedback test package, the directory its zip was extracted into, under the corpus root.
 */
const feedbackPackage = "qtiv3-examples/packaging/feedbackTest/feedbackTest.zip.d";

describe("feedbackTest.zip", { tags: ["corpus"] }, () => {
  it.effect(
    "opens every item of the package as it is, with no feedback element marked or noticed",
    () =>
      Effect.gen(function* feedbackTest() {
        const files = yield* readCorpusPackage(feedbackPackage);
        const items = [...files.keys()].filter(
          (file) => file.startsWith("id-") && file.endsWith(".xml"),
        );
        assert.lengthOf(items, 6);
        for (const file of items) {
          const accepted = yield* openXml(file, new TextDecoder().decode(files.get(file)));

          assert.deepStrictEqual(
            accepted.item.unsupported.filter((feature) => feedbackFeatures.has(feature.feature)),
            [],
            file,
          );
        }
      }),
  );
});
