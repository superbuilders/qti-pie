/**
 * The results suite's pending families, ported: the essay scored by two draws of Alpha's recorded
 * `rubric-score` operator, and the wave whose second draw only the first draw's reply reaches
 * (qti-pie's `results.db.test.ts`, whose expectations were written by hand from QTI 3.0.1 and the
 * operator's contract, never read back from the SQL grader). Human grading is deleted (D9), so a
 * draw is either unrecorded (a demand) or answered with a score; no case declines.
 *
 * Each case is stated as data: the document, the response, and the score recorded for each draw
 * (by its ordinal among the document's `rubric-score` operators, first is 0), with what processing
 * must give: pending on exactly the draws it reached and found unrecorded, or done with its SCORE.
 *
 * @module
 */

/**
 * QTI 3.0.1's assessment item namespace.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * Alpha's custom operators' definition prefix.
 */
const alpha = "tag:superbuilders.school,2026:qti/custom-operator/";

/**
 * The essay's MAXSCORE default, its draws' `maximum` operand.
 */
export const essayMaximum = 2;

/**
 * One draw of `rubric-score` into `DRAW_<n>`: the response, the rubric group, the maximum and the
 * draw's number.
 *
 * @param n The draw's number, from 1.
 * @returns The rule.
 */
const draw = (n: number): string =>
  `<qti-set-outcome-value identifier="DRAW_${String(n)}"><qti-custom-operator class="rubric-score" definition="${alpha}rubric-score"><qti-variable identifier="RESPONSE"/><qti-base-value base-type="identifier">RUBRIC</qti-base-value><qti-default identifier="MAXSCORE"/><qti-base-value base-type="integer">${String(n)}</qti-base-value></qti-custom-operator></qti-set-outcome-value>`;

/**
 * The declarations and body both items share.
 */
const head = (identifier: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="${identifier}" title="${identifier}" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>${String(essayMaximum)}</qti-value></qti-default-value></qti-outcome-declaration><qti-outcome-declaration identifier="DRAW_1" cardinality="record" view="author"/><qti-outcome-declaration identifier="DRAW_2" cardinality="record" view="author"/><qti-item-body><qti-rubric-block use="ext:criteria" view="scorer" id="RUBRIC"><qti-content-body><p>Award 2 for a force named with its direction.</p></qti-content-body></qti-rubric-block><qti-extended-text-interaction response-identifier="RESPONSE"/></qti-item-body>`;

/**
 * The essay: a response its own rule finds empty (NULL, or nothing but whitespace and markup once
 * `markup-text` and `normalize-space` read it) scores 0 and reaches no draw; any other is scored by
 * two draws, SCORE the better reply.
 */
export const essayXml = `${head("essay")}<qti-response-processing><qti-response-condition><qti-response-if><qti-is-null><qti-custom-operator class="normalize-space" definition="${alpha}normalize-space"><qti-custom-operator class="markup-text" definition="${alpha}markup-text"><qti-variable identifier="RESPONSE"/></qti-custom-operator></qti-custom-operator></qti-is-null><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value></qti-response-if><qti-response-else>${draw(1)}${draw(2)}<qti-set-outcome-value identifier="SCORE"><qti-max><qti-multiple><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_1"/></qti-field-value><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_2"/></qti-field-value></qti-multiple></qti-max></qti-set-outcome-value></qti-response-else></qti-response-condition></qti-response-processing>
</qti-assessment-item>`;

/**
 * The wave: its second draw is reached only where the first draw's reply is 1 or more, SCORE then
 * the second's; under 1, SCORE 0.
 */
export const waveXml = `${head("wave")}<qti-response-processing>${draw(1)}<qti-response-condition><qti-response-if><qti-gte><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_1"/></qti-field-value><qti-base-value base-type="float">1</qti-base-value></qti-gte>${draw(2)}<qti-set-outcome-value identifier="SCORE"><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_2"/></qti-field-value></qti-set-outcome-value></qti-response-if><qti-response-else><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value></qti-response-else></qti-response-condition></qti-response-processing>
</qti-assessment-item>`;

/**
 * What processing must give: pending on the draws it reached unrecorded (by ordinal), or done with
 * SCORE.
 */
export type SuiteExpected =
  | { readonly kind: "done"; readonly score: number }
  | { readonly draws: readonly number[]; readonly kind: "pending" };

/**
 * One case: its name, its document, its response (none is NULL), the score recorded for each draw
 * by ordinal (absent unrecorded), and what processing must give.
 */
export interface SuiteCase {
  readonly expected: SuiteExpected;
  readonly name: string;
  readonly recorded: ReadonlyMap<number, number>;
  readonly response: string | undefined;
  readonly xml: string;
}

/**
 * The essay's responses, each with whether its rule finds it empty.
 */
const essayResponses: readonly (readonly [string | undefined, boolean])[] = [
  ["A push.", false],
  [undefined, true],
  ["  \n\t ", true],
  ["<p> </p>", true],
];

/**
 * The scores a draw may be recorded with, or none.
 */
const essayReplies: readonly (number | undefined)[] = [undefined, 0, 1, 1.5, 2];

/**
 * The essay's expectation: an empty response scores 0 and demands nothing; another is pending on
 * each draw unrecorded, else done with the better reply.
 *
 * @param empty Whether the response is empty.
 * @param first The first draw's reply.
 * @param second The second draw's reply.
 * @returns The expectation.
 */
const essayExpectedOf = (
  empty: boolean,
  first: number | undefined,
  second: number | undefined,
): SuiteExpected => {
  if (empty) {
    return { kind: "done", score: 0 };
  }

  if (first === undefined || second === undefined) {
    return {
      draws: [first === undefined ? [0] : [], second === undefined ? [1] : []].flat(),
      kind: "pending",
    };
  }

  return { kind: "done", score: Math.max(first, second) };
};

/**
 * A map of recorded replies by ordinal, each reply present.
 *
 * @param replies The replies by ordinal, absent unrecorded.
 * @returns The map.
 */
const recordedOf = (replies: readonly (number | undefined)[]): ReadonlyMap<number, number> =>
  new Map(replies.flatMap((reply, at) => (reply === undefined ? [] : [[at, reply] as const])));

/**
 * The wave's expectation: pending on the first draw until it is recorded; under 1, done at 0; at 1
 * or more, pending on the second until it is recorded, then done at its reply.
 *
 * @param first The first draw's reply.
 * @param second The second draw's reply.
 * @returns The expectation.
 */
const waveExpectedOf = (first: number | undefined, second: number | undefined): SuiteExpected => {
  if (first === undefined) {
    return { draws: [0], kind: "pending" };
  }

  if (first < 1) {
    return { kind: "done", score: 0 };
  }

  return second === undefined ? { draws: [1], kind: "pending" } : { kind: "done", score: second };
};

/**
 * Every ported case: the essay over each response and each pair of replies, the wave over each
 * pair.
 */
export const suiteCases: readonly SuiteCase[] = [
  ...essayResponses.flatMap(([response, empty]) =>
    essayReplies.flatMap((first) =>
      essayReplies.map((second): SuiteCase => ({
        expected: essayExpectedOf(empty, first, second),
        name: `essay ${JSON.stringify(response ?? null)} replies ${String(first)}, ${String(second)}`,
        recorded: recordedOf([first, second]),
        response,
        xml: essayXml,
      })),
    ),
  ),
  ...essayReplies.flatMap((first) =>
    essayReplies.map((second): SuiteCase => ({
      expected: waveExpectedOf(first, second),
      name: `wave replies ${String(first)}, ${String(second)}`,
      recorded: recordedOf([first, second]),
      response: "A push.",
      xml: waveXml,
    })),
  ),
];
