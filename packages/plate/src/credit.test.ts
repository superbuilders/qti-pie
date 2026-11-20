/**
 * The credit an attempt earned (`credit`), which a host hands a review and each feedback part it
 * shows carries (`data-credit`): the attempt's own `SCORE` against its own `MAXSCORE`, `full`,
 * `partial` or `none`, and no credit wherever the scores cannot say.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { configure } from "#plate/configuration.ts";
import type { Configuration } from "#plate/configuration.ts";
import { credit } from "#plate/credit.ts";
import type { Item, OutcomeDeclaration } from "#plate/model/item.ts";
import type { RedactRecord } from "#plate/model/record.ts";
import type { Value } from "#plate/model/values.ts";
import { redact } from "#plate/redact.ts";
import { restore } from "#plate/restore.ts";
import { float } from "#plate/test/fixtures.ts";
import { shownToCandidate, textOf } from "#plate/test/page.ts";
import { score } from "#plate/test/score.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptForTest, acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * An item that scores `all` at its `MAXSCORE` of 2, `half` at 1 and `nothing` at its default 0,
 * sets `FEEDBACK` to the answer, and shows one modal feedback per answer, the first titled.
 *
 * @param scoreAttributes Attributes the `SCORE` declaration carries beyond its type, as written.
 * @param maximumAttributes Attributes the `MAXSCORE` declaration carries beyond its type.
 * @returns The document's bytes.
 */
const creditItem = (scoreAttributes = "", maximumAttributes = ""): Uint8Array =>
  new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="credit" title="Credit" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" ${scoreAttributes}>
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float" ${maximumAttributes}>
    <qti-default-value><qti-value>2</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier"/>
  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-simple-choice identifier="all">All</qti-simple-choice>
      <qti-simple-choice identifier="half">Half</qti-simple-choice>
      <qti-simple-choice identifier="nothing">Nothing</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing>
    <qti-response-condition>
      <qti-response-if>
        <qti-match><qti-variable identifier="RESPONSE"/><qti-base-value base-type="identifier">all</qti-base-value></qti-match>
        <qti-set-outcome-value identifier="SCORE"><qti-variable identifier="MAXSCORE"/></qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else-if>
        <qti-match><qti-variable identifier="RESPONSE"/><qti-base-value base-type="identifier">half</qti-base-value></qti-match>
        <qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value>
      </qti-response-else-if>
    </qti-response-condition>
    <qti-set-outcome-value identifier="FEEDBACK"><qti-variable identifier="RESPONSE"/></qti-set-outcome-value>
  </qti-response-processing>
  <qti-modal-feedback outcome-identifier="FEEDBACK" identifier="all" show-hide="show" title="All of it"><qti-content-body><p>[all]</p></qti-content-body></qti-modal-feedback>
  <qti-modal-feedback outcome-identifier="FEEDBACK" identifier="half" show-hide="show"><qti-content-body><p>[half]</p></qti-content-body></qti-modal-feedback>
  <qti-modal-feedback outcome-identifier="FEEDBACK" identifier="nothing" show-hide="show"><qti-content-body><p>[nothing]</p></qti-content-body></qti-modal-feedback>
</qti-assessment-item>`);

/**
 * The scoring and feedback of edullm's demo items `shape-red-square.xml` and `stars-01.xml`: a
 * single identifier RESPONSE whose correct answer sets `SCORE` to `MAXSCORE`, 1, and any other to
 * 0, `FEEDBACK` set to the answer, and one modal feedback per choice. Their choices' images and
 * feedback texts are shortened here; their declarations and processing are as written there.
 *
 * @param identifier The item's identifier.
 * @param correct The correct choice.
 * @param choices The choices, in order.
 * @returns The document's bytes.
 */
const demoItem = (identifier: string, correct: string, choices: readonly string[]): Uint8Array =>
  new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="${identifier}" title="${identifier}" adaptive="false" time-dependent="false" xml:lang="en">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>${correct}</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
    <qti-default-value><qti-value>1</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier"/>
  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1" shuffle="false">
      <qti-prompt>${identifier}</qti-prompt>
      ${choices.map((choice) => `<qti-simple-choice identifier="${choice}">${choice}</qti-simple-choice>`).join("\n      ")}
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing>
    <qti-response-condition>
      <qti-response-if>
        <qti-match><qti-variable identifier="RESPONSE"/><qti-correct identifier="RESPONSE"/></qti-match>
        <qti-set-outcome-value identifier="SCORE"><qti-variable identifier="MAXSCORE"/></qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else>
        <qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value>
      </qti-response-else>
    </qti-response-condition>
    <qti-response-condition>
      <qti-response-if>
        <qti-is-null><qti-variable identifier="RESPONSE"/></qti-is-null>
        <qti-set-outcome-value identifier="FEEDBACK"><qti-base-value base-type="identifier">none</qti-base-value></qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else>
        <qti-set-outcome-value identifier="FEEDBACK"><qti-variable identifier="RESPONSE"/></qti-set-outcome-value>
      </qti-response-else>
    </qti-response-condition>
  </qti-response-processing>
  ${choices.map((choice) => `<qti-modal-feedback outcome-identifier="FEEDBACK" identifier="${choice}" show-hide="show"><qti-content-body><p>[${choice}]</p></qti-content-body></qti-modal-feedback>`).join("\n  ")}
  <qti-modal-feedback outcome-identifier="FEEDBACK" identifier="none" show-hide="show"><qti-content-body><p>[none]</p></qti-content-body></qti-modal-feedback>
</qti-assessment-item>`);

/**
 * Open an item and take it accepted.
 *
 * @param location The document's location.
 * @param bytes The document.
 * @returns The accepted item.
 */
const accepting = Effect.fnUntraced(function* accepting(location: string, bytes: Uint8Array) {
  const verdict = yield* admitted(location, bytes);

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${location} is ${verdict.verdict}, not an accepted item`),
  );
});

/**
 * A single identifier answer.
 *
 * @param identifier The choice.
 * @returns The value.
 */
const chosen = (identifier: string): Value => ({
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value: identifier }],
});

/**
 * A modal feedback card as the page shows it: the credit it carries (`data-credit`, the attempt's
 * `credit`, which the host hands the review), none when it carries none, and its text.
 */
interface Card {
  readonly credit: Option.Option<string>;
  readonly text: string;
}

/**
 * Build the page of an accepted item in review by a record, and read its cards, each carrying the
 * attempt's credit.
 *
 * @param accepted The item.
 * @param record The record.
 * @param configuration The configuration.
 * @returns The cards.
 */
const cardsBy = (
  accepted: Accepted,
  record: RedactRecord,
  configuration: Configuration,
): readonly Card[] =>
  redact(accepted, { ...shownToCandidate, configuration }, record).modalFeedback.map(
    (feedback) => ({
      credit: credit(accepted, record),
      text: textOf(feedback.content),
    }),
  );

/**
 * Score an answer and read the cards of the item in review from the record `score` returned, as an
 * app shows a candidate the feedback of a submitted attempt.
 *
 * @param accepted The item.
 * @param answer The choice answered.
 * @param configuration The configuration.
 * @returns The cards the page shows.
 */
const reviewed = (
  accepted: Accepted,
  answer: string,
  configuration: Configuration,
): Result.Result<readonly Card[], unknown> =>
  Result.gen(function* review() {
    const stored = yield* score(accepted, { RESPONSE: chosen(answer) });
    const { record } = yield* restore(accepted, stored);

    return cardsBy(accepted, record, configuration);
  });

/**
 * The record of an attempt response processing has run, which shows the `all` modal feedback of
 * {@link creditItem}, with the `SCORE` and `MAXSCORE` given.
 *
 * @param scored The `SCORE` value.
 * @param maximum The `MAXSCORE` value.
 * @returns The record.
 */
const submitted = (scored: Value, maximum: Value): RedactRecord => ({
  attempt: "submitted",
  defaults: {},
  outcomes: { FEEDBACK: chosen("all"), MAXSCORE: maximum, SCORE: scored },
  templates: {},
});

/**
 * A float of single cardinality holding NULL.
 */
const nullFloat: Value = { baseType: "float", cardinality: "single", values: [] };

/**
 * Change one of an item's outcome declarations, or remove it.
 *
 * @param item The item.
 * @param identifier The outcome.
 * @param change The declaration's replacement, none to remove it.
 * @returns The item, accepted as it is.
 */
const declaring = (
  item: Item,
  identifier: string,
  change: (declared: OutcomeDeclaration) => Option.Option<OutcomeDeclaration>,
): Accepted =>
  acceptForTest({
    ...item,
    outcomes: new Map(
      [...item.outcomes].flatMap(([name, declared]): readonly [string, OutcomeDeclaration][] =>
        name === identifier
          ? Option.match(change(declared), { onNone: () => [], onSome: (kept) => [[name, kept]] })
          : [[name, declared]],
      ),
    ),
  });

describe("a modal feedback's credit (data-credit)", () => {
  it.effect(
    "gives each shown modal feedback full, partial or none by the attempt's own SCORE against its own MAXSCORE",
    () =>
      Effect.gen(function* credits() {
        const configuration = yield* configure({ seed: "", validateResponses: false });
        const accepted = yield* accepting("credit.xml", creditItem());
        const cards = (answer: string) =>
          Result.getOrThrow(reviewed(accepted, answer, configuration));

        assert.deepStrictEqual(cards("all"), [{ credit: Option.some("full"), text: "[all]" }]);
        assert.deepStrictEqual(cards("half"), [{ credit: Option.some("partial"), text: "[half]" }]);
        assert.deepStrictEqual(cards("nothing"), [
          { credit: Option.some("none"), text: "[nothing]" },
        ]);
      }),
  );

  it.effect(
    "marks the answered card of edullm's demo: a wrong answer to the red square is none, stars-01 answered right is full",
    () =>
      Effect.gen(function* demo() {
        const configuration = yield* configure({ seed: "", validateResponses: false });
        const square = yield* accepting(
          "shape-red-square.xml",
          demoItem("shape-red-square", "red-square", [
            "blue-square",
            "red-square",
            "red-triangle",
            "yellow-circle",
          ]),
        );
        const stars = yield* accepting(
          "stars-01.xml",
          demoItem("stars-01", "N1", ["N1", "N2", "N3"]),
        );

        assert.deepStrictEqual(Result.getOrThrow(reviewed(square, "red-triangle", configuration)), [
          { credit: Option.some("none"), text: "[red-triangle]" },
        ]);
        assert.deepStrictEqual(Result.getOrThrow(reviewed(stars, "N1", configuration)), [
          { credit: Option.some("full"), text: "[N1]" },
        ]);
      }),
  );

  it.effect(
    "reads the bounds exactly: s >= m is full, s <= 0 is none, and anything between is partial",
    () =>
      Effect.gen(function* bounds() {
        const configuration = yield* configure({ seed: "", validateResponses: false });
        const accepted = yield* accepting("credit.xml", creditItem());
        const cases: readonly (readonly [number, number, string])[] = [
          [2, 2, "full"],
          [3, 2, "full"],
          [1.999, 2, "partial"],
          [1e-9, 2, "partial"],
          [0, 2, "none"],
          [-1, 2, "none"],
          [0.5, 0.25, "full"],
        ];
        for (const [scored, maximum, expected] of cases) {
          assert.deepStrictEqual(
            cardsBy(accepted, submitted(float(scored), float(maximum)), configuration).map(
              (card) => card.credit,
            ),
            [Option.some(expected)],
            `SCORE ${String(scored)}, MAXSCORE ${String(maximum)}`,
          );
        }
      }),
  );

  it.effect(
    "leaves the card neutral where the scores cannot say: no MAXSCORE, a score that is not a single finite float, a MAXSCORE of 0 or below, an external-scored SCORE, a view without the candidate",
    () =>
      Effect.gen(function* omitted() {
        const configuration = yield* configure({ seed: "", validateResponses: false });
        const accepted = yield* accepting("credit.xml", creditItem());
        const { item } = accepted;
        const whole = submitted(float(2), float(2));
        const cases: readonly (readonly [string, Accepted, RedactRecord])[] = [
          ["no MAXSCORE declared", declaring(item, "MAXSCORE", () => Option.none()), whole],
          [
            "SCORE declared multiple",
            declaring(item, "SCORE", (declared) =>
              Option.some({ ...declared, cardinality: "multiple" }),
            ),
            whole,
          ],
          [
            "MAXSCORE declared ordered",
            declaring(item, "MAXSCORE", (declared) =>
              Option.some({ ...declared, cardinality: "ordered" }),
            ),
            whole,
          ],
          [
            "SCORE an integer",
            declaring(item, "SCORE", (declared) =>
              Option.some({ ...declared, baseType: "integer" }),
            ),
            whole,
          ],
          ["SCORE NULL", accepted, submitted(nullFloat, float(2))],
          ["MAXSCORE NULL", accepted, submitted(float(2), nullFloat)],
          ["SCORE INF", accepted, submitted(float(Number.POSITIVE_INFINITY), float(2))],
          ["SCORE NaN", accepted, submitted(float(Number.NaN), float(2))],
          ["MAXSCORE INF", accepted, submitted(float(2), float(Number.POSITIVE_INFINITY))],
          ["MAXSCORE 0", accepted, submitted(float(0), float(0))],
          ["MAXSCORE -1", accepted, submitted(float(-1), float(-1))],
          [
            "SCORE held as a multiple value",
            accepted,
            submitted({ baseType: "float", cardinality: "multiple", values: [] }, float(2)),
          ],
          [
            "SCORE external-scored human",
            declaring(item, "SCORE", (declared) =>
              Option.some({ ...declared, externalScored: "human" }),
            ),
            whole,
          ],
          [
            "SCORE external-scored externalMachine",
            declaring(item, "SCORE", (declared) =>
              Option.some({ ...declared, externalScored: "externalMachine" }),
            ),
            whole,
          ],
          [
            "SCORE's view author",
            declaring(item, "SCORE", (declared) =>
              Option.some({ ...declared, view: Option.some(["author"] as const) }),
            ),
            whole,
          ],
          [
            "MAXSCORE's view tutor and scorer",
            declaring(item, "MAXSCORE", (declared) =>
              Option.some({ ...declared, view: Option.some(["tutor", "scorer"] as const) }),
            ),
            whole,
          ],
        ];
        for (const [name, document, record] of cases) {
          assert.deepStrictEqual(
            cardsBy(document, record, configuration),
            [{ credit: Option.none(), text: "[all]" }],
            name,
          );
        }

        assert.deepStrictEqual(
          cardsBy(
            declaring(item, "SCORE", (declared) =>
              Option.some({ ...declared, view: Option.some(["tutor", "candidate"] as const) }),
            ),
            whole,
            configuration,
          ).map((card) => card.credit),
          [Option.some("full")],
          "a view that names the candidate among others keeps the credit",
        );
      }),
  );

  it.effect(
    "reads external-scored and view from the document, and then gives no credit after scoring",
    () =>
      Effect.gen(function* written() {
        const configuration = yield* configure({ seed: "", validateResponses: false });
        const external = yield* accepting("external.xml", creditItem('external-scored="human"'));
        const hidden = yield* accepting("view.xml", creditItem("", 'view="author scorer"'));

        assert.strictEqual(external.item.outcomes.get("SCORE")?.externalScored, "human");
        assert.isUndefined(hidden.item.outcomes.get("SCORE")?.externalScored);
        for (const accepted of [external, hidden]) {
          assert.deepStrictEqual(
            Result.getOrThrow(reviewed(accepted, "all", configuration)),
            [{ credit: Option.none(), text: "[all]" }],
            accepted.item.document,
          );
        }
      }),
  );

  it.effect(
    "gives none before response processing: no record shows no card, and a record of no attempt (attempt none) has no credit and shows no card",
    () =>
      Effect.gen(function* before() {
        const configuration = yield* configure({ seed: "", validateResponses: false });
        const accepted = yield* accepting("credit.xml", creditItem());
        const unscored = redact(accepted, { ...shownToCandidate, configuration });
        const page: RedactRecord = { ...submitted(float(2), float(2)), attempt: "none" };

        assert.isTrue(Option.isNone(credit(accepted, page)));
        assert.deepStrictEqual(cardsBy(accepted, page, configuration), []);
        assert.deepStrictEqual(unscored.modalFeedback, []);
      }),
  );
});
