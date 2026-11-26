/**
 * `rubric-score(response, rubric, maximum, draw)` (composable-operators.md §2.4): an essay's score
 * against a rubric by the AI grader, the one value no standard expression computes. It is recorded,
 * never computed (D8): the evaluator never calls a model. The shell asks den for a draw, records
 * the grader's reply, and hands it in by the operator's place as an input; where none is recorded
 * the run demands one and its result is Pending.
 *
 * A reply is the grader's score within [0, `maximum`] and its feedback. A decline (the grader
 * refused, or replied outside the range, which is never clamped) is no verdict and no input
 * (Bjorn's ruling of 2026-11-26): its demand stays open and den asks for a fresh draw, so an essay
 * whose draws decline waits, never scores 0, and no human ever grades it (D9). {@link rubricReply}
 * is the one way a reply becomes the input, and it gives none for a decline.
 *
 * The converter writes three draws for an `ext:grading-prompt` rubric and one for `ext:criteria`,
 * and takes `qti-max` over them, so the essay's score is its best draw's. An empty essay never
 * reaches the operator: its response operand is `when-present(normalize-space(markup-text(R)), R)`,
 * NULL for markup and white space alone, and a NULL operand makes no request.
 *
 * @module
 */
import { alphaDefinitionPrefix, recordedOperator } from "#processing/operator.ts";
import { single, textValue } from "#processing/value.ts";
import type { RecordValue } from "#processing/value.ts";

/**
 * The `rubric-score` operator's registry entry: the essay, the rubric block it is graded by (an
 * identifier written as a literal), the most it may score (the outcome's default, its operand 2)
 * and which draw it is (a literal).
 */
export const rubricScoreOperator = recordedOperator({
  definition: `${alphaDefinitionPrefix}rubric-score`,
  maximum: 2,
  operands: [
    { form: "expression", name: "response", type: { base: "string", cardinality: "single" } },
    { form: "expression", name: "rubric", type: { base: "identifier", cardinality: "single" } },
    { form: "expression", name: "maximum", type: { base: "float", cardinality: "single" } },
    { form: "expression", name: "draw", type: { base: "integer", cardinality: "single" } },
  ],
  result: { cardinality: "record" },
});

/**
 * A grader's reply as the operator's recorded value: a record of its `score` and, where it wrote
 * any, its `feedback`; none for a decline, a score that is not finite or lies outside [0,
 * `maximum`], which is no input.
 *
 * @param score - The score the grader replied.
 * @param maximum - The most the essay may score, the operator's `maximum` operand.
 * @param feedback - The feedback the grader wrote.
 * @returns The recorded value, or none for a decline.
 */
export const rubricReply = (
  score: number,
  maximum: number,
  feedback: string,
): RecordValue | undefined => {
  if (!(Number.isFinite(score) && score >= 0 && score <= maximum)) {
    return undefined;
  }

  const scored = { name: "score", value: single("float", score) };
  const written = textValue("string", feedback);

  return {
    fields: written.kind === "single" ? [{ name: "feedback", value: written }, scored] : [scored],
    kind: "record",
  };
};
